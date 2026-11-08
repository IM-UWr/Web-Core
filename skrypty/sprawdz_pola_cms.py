#!/usr/bin/env python3
"""Sprawdza, czy formularze Pages CMS (.pages.yml) obejmują wszystkie dane w repozytoriach treści.

Pages CMS przy zapisie zostawia w pliku tylko pola z formularza, więc pole spoza formularza znika przy pierwszym zapisie
redaktora. Skrypt zgłasza:
  1. pliki danych bez formularza,
  2. pola w danych, których nie ma w formularzu (także w listach i obiektach),
  3. wartości, których formularz nie przyjmie (wymagane puste, spoza listy wyboru, zły typ, zła data).

Użycie:  python skrypty/sprawdz_pola_cms.py <katalog z klonami repozytoriów treści>
Lista repozytoriów: tresci.json. Kod wyjścia 1, gdy są problemy. Wymaga PyYAML.
"""
import json
import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# „body”: treść pliku Markdown; konferencje zachowują archiwalny tekst bez formularza, bo nie mają podstron.
POLA_POMIJANE = {'body'}
# Pliki świadomie bez formularza. stopka.json: nowy wygląd go nie czyta (zlecenie 22).
PLIKI_BEZ_FORMULARZA = {('Web-Ustawienia', 'src/data/stopka.json')}
ROZSZERZENIA = ('.md', '.json', '.yml', '.yaml')


def formularze(pozycje):
    for p in pozycje or []:
        if p.get('type') == 'group':
            yield from formularze(p.get('items'))
        else:
            yield p


def wiele(pole):
    return bool(pole.get('list') or (pole.get('options') or {}).get('multiple'))


def sciezki_pol(pola, przed=''):
    wynik = set()
    for pole in pola or []:
        nazwa = pole.get('name')
        if nazwa is None:
            continue
        sciezka = przed + nazwa + ('[]' if wiele(pole) else '')
        wynik.add(sciezka)
        if pole.get('type') == 'object' or pole.get('fields'):
            wynik |= sciezki_pol(pole.get('fields'), sciezka + '.')
    return wynik


def sciezki_danych(obiekt, przed=''):
    wynik = set()
    for klucz, wartosc in obiekt.items():
        sciezka = przed + str(klucz)
        if isinstance(wartosc, dict):
            wynik.add(sciezka)
            wynik |= sciezki_danych(wartosc, sciezka + '.')
        elif isinstance(wartosc, list):
            wynik.add(sciezka + '[]')
            for element in wartosc:
                if isinstance(element, dict):
                    wynik |= sciezki_danych(element, sciezka + '[].')
        else:
            wynik.add(sciezka)
    return wynik


def wczytaj(sciezka):
    tekst = open(sciezka, encoding='utf-8').read()
    if sciezka.endswith('.json'):
        return json.loads(tekst)
    if sciezka.endswith(('.yml', '.yaml')):
        return yaml.safe_load(tekst)
    m = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n?(.*)$', tekst, re.S)
    if not m:
        return {'body': tekst}
    dane = yaml.safe_load(m.group(1)) or {}
    dane['body'] = m.group(2)
    return dane


def wartosci(pole, wartosc, gdzie, zglos):
    typ = pole.get('type')
    opcje = pole.get('options') or {}
    if wartosc in (None, '', []):
        if pole.get('required'):
            zglos(f'{gdzie}: pole wymagane jest puste')
        return
    if wiele(pole):
        lista = wartosc if isinstance(wartosc, list) else [wartosc]
    elif isinstance(wartosc, list):
        zglos(f'{gdzie}: lista w polu pojedynczym')
        return
    else:
        lista = [wartosc]
    for x in lista:
        if typ == 'object' or pole.get('fields'):
            if not isinstance(x, dict):
                zglos(f'{gdzie}: oczekiwany obiekt')
                continue
            for pod in pole.get('fields') or []:
                wartosci(pod, x.get(pod['name']), f"{gdzie}.{pod['name']}", zglos)
        elif typ == 'select':
            dozwolone = [str(o.get('name') if isinstance(o, dict) else o) for o in opcje.get('values', [])]
            if str(x) not in dozwolone:
                zglos(f'{gdzie}: wartości „{x}” nie ma na liście wyboru')
        elif typ == 'boolean' and not isinstance(x, bool):
            zglos(f'{gdzie}: oczekiwane tak/nie, jest {x!r}')
        elif typ == 'number' and (isinstance(x, bool) or not isinstance(x, (int, float))):
            zglos(f'{gdzie}: oczekiwana liczba, jest {x!r}')
        elif typ == 'date' and not re.match(r'^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?.*)?$', str(x)):
            zglos(f'{gdzie}: zła data {x!r}')
        elif typ in ('string', 'text', 'rich-text', 'image', 'file', 'code') and not isinstance(x, str):
            zglos(f'{gdzie}: oczekiwany tekst, jest {type(x).__name__} {str(x)[:30]!r}')


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    katalog = sys.argv[1]
    repozytoria = json.load(open(os.path.join(ROOT, 'tresci.json'), encoding='utf-8'))['repozytoria']
    problemy = []
    plikow = 0
    for repo in repozytoria:
        kat = os.path.join(katalog, repo)
        konfiguracja = yaml.safe_load(open(os.path.join(kat, '.pages.yml'), encoding='utf-8'))
        objete = set()
        for form in formularze(konfiguracja.get('content')):
            nazwa = form.get('name')
            sciezka = form.get('path') or ''
            pliki = []
            if form.get('type') == 'file':
                if os.path.exists(os.path.join(kat, sciezka)):
                    pliki = [sciezka]
            else:
                for gora, _, nazwy in os.walk(os.path.join(kat, sciezka)):
                    for n in nazwy:
                        if n.endswith(ROZSZERZENIA) and not n.startswith('.'):
                            pliki.append(os.path.relpath(os.path.join(gora, n), kat).replace(os.sep, '/'))
            pola = sciezki_pol(form.get('fields'))
            for plik in pliki:
                objete.add(plik)
                plikow += 1
                dane = wczytaj(os.path.join(kat, plik))
                if not isinstance(dane, dict):
                    continue
                for klucz in sorted(sciezki_danych(dane)):
                    if klucz.split('.')[0].split('[')[0] in POLA_POMIJANE and '.' not in klucz:
                        continue
                    if klucz not in pola:
                        problemy.append(f'{repo} / {nazwa}: pola „{klucz}” nie ma w formularzu ({plik})')
                for pole in form.get('fields') or []:
                    wartosci(pole, dane.get(pole['name']), f"{repo} / {nazwa} / {plik}: {pole['name']}", problemy.append)
        for gora_kat in ('src/content', 'src/data'):
            for gora, _, nazwy in os.walk(os.path.join(kat, gora_kat)):
                for n in nazwy:
                    if n.endswith(ROZSZERZENIA) and not n.startswith('.'):
                        plik = os.path.relpath(os.path.join(gora, n), kat).replace(os.sep, '/')
                        if plik not in objete and (repo, plik) not in PLIKI_BEZ_FORMULARZA:
                            problemy.append(f'{repo}: plik {plik} nie ma formularza')
    for p in problemy:
        print(p)
    print(f'Sprawdzono {plikow} plików w {len(repozytoria)} repozytoriach. Problemów: {len(problemy)}.')
    sys.exit(1 if problemy else 0)


if __name__ == '__main__':
    main()
