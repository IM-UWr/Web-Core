"""Zlecenie 48: jawne `opublikowany: true` w aktualnościach, opisach seminariów i referatach (jak zlecenie 33, A2.4).

Pole w formularzach (Web-Aktualnosci: „Aktualności”; 9 × Web-Sem-*: „Seminarium (opis)” i „Referaty”) dodaje wspólny wzór
formularzy: `node skrypty/migracja/formularze_40.mjs <checkout>`. Ten skrypt uruchamia się PO nim: każdy plik tych formularzy
bez pola dostaje `opublikowany: true` w miejscu, w które Pages CMS zapisze je przy zapisie formularza (kolejność pól formularza:
pod tytułem, a gdy jest tytuł EN — pod tą parą). Plików z polem (także `false`) skrypt nie rusza. Po zmianie sprawdza (YAML),
że dane różnią się tylko polem `opublikowany`, a treść pod frontmatterem jest identyczna co do bajtu. Idempotentny.

Użycie (z katalogu Web-Core):
  python skrypty/migracja/opublikowany_48.py <katalog z kopiami repozytoriów treści>            # zmiana
  python skrypty/migracja/opublikowany_48.py <katalog z kopiami repozytoriów treści> --sprawdz  # sama kontrola
Repozytoria, których nie ma w katalogu, są pomijane (z informacją).
"""
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from opublikowany_33 import FM, POLE, ETYKIETA, dane, pliki_formularza, zmien_plik  # noqa: E402

SEMINARIA = ['Analiza-Harmoniczna', 'Dydaktyka', 'Dyskretna-Analiza-Harmoniczna', 'Geometria', 'Prawdopodobienstwo',
             'Rownania-Rozniczkowe', 'Statystyka', 'Teoria-Modeli', 'Topologia']
CELE = {'Web-Aktualnosci': ['aktualnosci'], **{f'Web-Sem-{s}': ['seminarium', 'referaty'] for s in SEMINARIA}}


def formy(konfiguracja: dict) -> dict:
    out = {}

    def w(lista):
        for c in lista:
            if c.get('type') == 'group':
                w(c.get('items', []))
            else:
                out[c['name']] = c
    w(konfiguracja['content'])
    return out


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    katalog = Path(sys.argv[1])
    tylko_sprawdz = '--sprawdz' in sys.argv
    problemy = 0
    for repo_nazwa, formularze in CELE.items():
        repo = katalog / repo_nazwa
        if not (repo / '.pages.yml').exists():
            print(f'{repo_nazwa}: brak w {katalog} — pominięte')
            continue
        fs_ = formy(yaml.safe_load((repo / '.pages.yml').read_bytes().decode('utf-8')))
        for n in formularze:
            form = fs_[n]
            pole = next((p for p in form['fields'] if p['name'] == POLE), None)
            if not pole or pole.get('label') != ETYKIETA or pole.get('type') != 'boolean' or pole.get('default') is not True:
                print(f'ŹLE {repo_nazwa}/.pages.yml: formularz {n} bez przełącznika „Opublikowane” (najpierw formularze_40.mjs)')
                problemy += 1
                continue
            kolejnosc = [p['name'] for p in form['fields']]
            dodane, gotowe, falsz = [], [], []
            for plik in pliki_formularza(repo, form):
                t = plik.read_bytes().decode('utf-8')
                przed = dane(t)
                nt = zmien_plik(t, kolejnosc)
                po = dane(nt)
                assert {k: v for k, v in po.items() if k != POLE} == {k: v for k, v in przed.items() if k != POLE}, plik
                assert po[POLE] == przed.get(POLE, True), plik
                assert t[FM.match(t).end():] == nt[FM.match(nt).end():], plik  # treść pod frontmatterem bajt w bajt
                if po[POLE] is False:
                    falsz.append(plik.relative_to(repo).as_posix())
                if not isinstance(po[POLE], bool):
                    print(f'ŹLE {plik}: {POLE} bez wartości tak/nie: {po[POLE]!r}')
                    problemy += 1
                rel = plik.relative_to(repo).as_posix()
                if nt == t:
                    gotowe.append(rel)
                    continue
                dodane.append(rel)
                if tylko_sprawdz:
                    print(f'ŹLE {repo_nazwa}/{rel}: brak pola')
                    problemy += 1
                else:
                    plik.write_bytes(nt.encode('utf-8'))
            print(f'{repo_nazwa} / {n}: plików {len(dodane) + len(gotowe)}; dopisane {len(dodane)}, z polem już wcześniej {len(gotowe)}; '
                  f'szkice (false): {len(falsz)}{" — " + ", ".join(falsz) if falsz else ""}')
            for rel in dodane:
                print(f'  + {rel}')
    print(f'\nProblemów: {problemy}')
    sys.exit(1 if problemy else 0)


if __name__ == '__main__':
    main()
