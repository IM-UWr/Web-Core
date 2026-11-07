#!/usr/bin/env python3
"""Pliki wpisów pod nowe formularze (zlecenie 30, etapy 2 i 3).

  • Web-Instytut, zakłady i „Warto wiedzieć”: pola karty przechodzą do grupy „Karta” (obiekt `karta` w nagłówku pliku),
    bo Pages CMS zapisuje pola grupy formularza jako obiekt, a pola spoza formularza kasuje przy zapisie. Strona czyta
    oba układy (content.config.ts, zKarta). Przenoszone wiersze nagłówka dostają tylko wcięcie — wartości bez zmian.
  • Web-Aktualnosci: usuwa pole `wyroznij_do` (wyróżnianie aktualności zniknęło) i wypisuje pliki, w których było.
Na końcu porównuje dane każdego pliku przed i po (po spłaszczeniu `karta`): różnić się może tylko usunięte `wyroznij_do`.
Ponowne uruchomienie nic nie zmienia (pliki z `karta` i bez `wyroznij_do` są pomijane).

Uruchomienie (PyYAML):  python skrypty/migracja/wpisy.py --tresci <katalog z klonami Web-*>
"""
import argparse
import re
from pathlib import Path

import yaml

KARTA = {
    'src/content/zaklady': ('nazwa_krotka', 'nazwa_krotka_en', 'kierownik', 'telefon', 'opis', 'opis_en', 'haslo', 'haslo_en',
                            'obszary', 'obszary_en', 'strona', 'zdjecie', 'zdjecie_opis', 'zdjecie_opis_en'),
    'src/content/warto_wiedziec': ('rok', 'zajawka', 'zajawka_en', 'obraz', 'obraz_opis', 'obraz_opis_en', 'link', 'link_etykieta',
                                   'link_etykieta_en'),
}


def podziel(tekst):
    m = re.match(r'^---\n(.*?\n)---\n(.*)$', tekst, re.S)
    if not m:
        raise SystemExit('plik bez nagłówka ---')
    return m.group(1), m.group(2)


def pola(naglowek):
    """Wiersze nagłówka pogrupowane po kluczach najwyższego poziomu: [(klucz, [wiersze])]."""
    wynik = []
    for w in naglowek.splitlines(keepends=True):
        m = re.match(r'^([A-Za-z_][\w]*):', w)
        if m:
            wynik.append((m.group(1), [w]))
        elif wynik:
            wynik[-1][1].append(w)
        else:
            raise SystemExit(f'nieoczekiwany wiersz na początku nagłówka: {w!r}')
    return wynik


def splaszcz(d):
    d = dict(d or {})
    k = d.pop('karta', None)
    return {**(k or {}), **d}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--tresci', required=True, type=Path)
    a = ap.parse_args()
    zmienione = []
    for kat, karta in KARTA.items():
        for p in sorted((a.tresci / 'Web-Instytut' / kat).glob('*.md')):
            stary = p.read_text(encoding='utf-8')
            nag, tresc = podziel(stary)
            grupy = pola(nag)
            if any(k == 'karta' for k, _ in grupy):
                continue
            nowe, blok, miejsce = [], [], None
            for k, wiersze in grupy:
                if k in karta:
                    if miejsce is None:
                        miejsce = len(nowe)
                    blok += ['  ' + w if w.strip() else w for w in wiersze]
                else:
                    nowe += wiersze
            if miejsce is None:
                continue
            nowe[miejsce:miejsce] = ['karta:\n', *blok]
            nowy = '---\n' + ''.join(nowe) + '---\n' + tresc
            if splaszcz(yaml.safe_load(podziel(nowy)[0])) != yaml.safe_load(nag):
                raise SystemExit(f'{p}: dane po przeniesieniu do „karta” różnią się — nic nie zapisano w tym pliku.')
            p.write_text(nowy, encoding='utf-8', newline='\n')
            zmienione.append(f'Web-Instytut/{kat}/{p.name}: karta ({sum(1 for k, _ in grupy if k in karta)} pól)')
    for p in sorted((a.tresci / 'Web-Aktualnosci/src/content/aktualnosci').glob('*.md')):
        stary = p.read_text(encoding='utf-8')
        nag, tresc = podziel(stary)
        grupy = pola(nag)
        if not any(k == 'wyroznij_do' for k, _ in grupy):
            continue
        wart = yaml.safe_load(nag).get('wyroznij_do')
        nowy = '---\n' + ''.join(w for k, ws in grupy if k != 'wyroznij_do' for w in ws) + '---\n' + tresc
        przed = yaml.safe_load(nag)
        przed.pop('wyroznij_do')
        if yaml.safe_load(podziel(nowy)[0]) != przed:
            raise SystemExit(f'{p}: po usunięciu wyroznij_do zmieniło się coś jeszcze — nic nie zapisano w tym pliku.')
        p.write_text(nowy, encoding='utf-8', newline='\n')
        zmienione.append(f'Web-Aktualnosci/src/content/aktualnosci/{p.name}: usunięte wyroznij_do ({wart})')
    print('\n'.join(zmienione) or 'Nic do zmiany (migracja już była).')


if __name__ == '__main__':
    main()
