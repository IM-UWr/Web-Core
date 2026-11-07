#!/usr/bin/env python3
"""Migracja strony działu Popularyzacja do Markdownu (zlecenie 29; wzór: skrypty/migracja/kierunki.py).

Przerabia src/data/popularyzacja.json (formularz z 21 polami) w klonie Web-Popularyzacja na src/data/popularyzacja.md
(formularz „Strona działu Popularyzacja”):
  • body (Treść)       — tekst „O popularyzacji” (dawne o_popularyzacji: akapity oddzielone pustą linią, czyli już Markdown);
  • tresc_en (Treść EN) — dawne o_popularyzacji_en (puste = strona angielska pokaże polski tekst, jak dotąd);
  • w nagłówku pliku pozostałe pola bez zmian: tytul, tytul_en, wstep, wstep_en, haslo, haslo_en, o_popularyzacji_fakty,
    tradycja i linki (pole ukryte w formularzu: szablon go nie czyta, grupy linków biorą się z menu działu).
Skrypt odmawia pracy, gdy plik jest już przerobiony, i na końcu sprawdza, że każda wartość starego pliku jest w nowym.

Uruchomienie (PyYAML):
  python skrypty/migracja/popularyzacja.py --popularyzacja <klon Web-Popularyzacja> [--do <katalog>]
--do: zapis do osobnego katalogu (<katalog>/src/data/popularyzacja.md) zamiast w klonie — na próbę (stary plik zostaje).
"""
import argparse
import json
import re
from pathlib import Path

import yaml

KOLEJNOSC = ('tytul', 'tytul_en', 'tresc_en', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'o_popularyzacji_fakty', 'tradycja', 'linki')


class Zrzut(yaml.SafeDumper):
    """Tekst wielolinijkowy (Treść EN) jako blok „|” — czytelny w GitHubie; PyYAML sam wraca do cudzysłowu, gdy blok nie pasuje."""


Zrzut.add_representer(str, lambda dumper, s: dumper.represent_scalar('tag:yaml.org,2002:str', s, style='|' if '\n' in s else None))


def liscie(o, sciezka=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from liscie(v, f'{sciezka}.{k}' if sciezka else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from liscie(v, f'{sciezka}[{i}]')
    elif o not in (None, ''):
        yield sciezka, o


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--popularyzacja', required=True, type=Path)
    ap.add_argument('--do', type=Path, help='zapis do osobnego katalogu zamiast w klonie')
    a = ap.parse_args()
    stary = a.popularyzacja / 'src/data/popularyzacja.json'
    nowy = (a.do or a.popularyzacja) / 'src/data/popularyzacja.md'
    if (a.popularyzacja / 'src/data/popularyzacja.md').exists() or not stary.exists():
        raise SystemExit('Web-Popularyzacja: plik już przerobiony (jest popularyzacja.md albo brak popularyzacja.json) — nie uruchamiam migracji drugi raz.')

    d = json.loads(stary.read_text(encoding='utf-8'))
    body = (d.get('o_popularyzacji') or '').strip()
    front = {'tresc_en': (d.get('o_popularyzacji_en') or '').strip()} | {k: d[k] for k in KOLEJNOSC if k in d and k != 'tresc_en'}
    front = {k: front[k] for k in KOLEJNOSC if front.get(k) not in (None, '', [])}
    nieznane = [k for k in d if k not in KOLEJNOSC and k not in ('o_popularyzacji', 'o_popularyzacji_en')]
    if nieznane:
        raise SystemExit(f'popularyzacja.json: pola spoza listy migracji: {nieznane} — dopisz je do skryptu.')
    tekst = '---\n' + yaml.dump(front, Dumper=Zrzut, allow_unicode=True, sort_keys=False, width=10**6) + '---\n' + (f'\n{body}\n' if body else '')

    # sprawdzenie: każda wartość starego pliku w nowym (po wczytaniu nowego pliku)
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', tekst, re.S)
    nfront, nbody = yaml.safe_load(m.group(1)), m.group(2).strip()
    wartosci_nowe = {json.dumps(v, ensure_ascii=False) for _, v in liscie({**nfront, 'o_popularyzacji': nbody, 'o_popularyzacji_en': nfront.get('tresc_en', '')})}
    przeniesione, brak = 0, []
    for sciezka, v in liscie(d):
        if json.dumps(v, ensure_ascii=False) in wartosci_nowe:
            przeniesione += 1
        else:
            brak.append(sciezka)

    nowy.parent.mkdir(parents=True, exist_ok=True)
    nowy.write_text(tekst, encoding='utf-8', newline='\n')
    if not a.do:
        stary.unlink()
    akapity = len([x for x in re.split(r'\n\s*\n', body) if x.strip()])
    print(f'Web-Popularyzacja: {przeniesione} wartości przeniesionych, 0 pominiętych; Treść: {akapity} akapitów; '
          f'„W skrócie”: {len(d.get("o_popularyzacji_fakty") or [])}, tradycja: {len(d.get("tradycja") or [])}, linki (ukryte): {len(d.get("linki") or [])}.')
    if brak:
        raise SystemExit(f'{len(brak)} wartości nie ma w nowym pliku: {brak} — popraw skrypt.')


if __name__ == '__main__':
    main()
