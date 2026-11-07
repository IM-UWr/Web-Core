#!/usr/bin/env python3
"""Formularze Pages CMS specjalności z jednego szablonu (zlecenie 29): skrypty/migracja/specjalnosc.pages.yml.

Web-Spec-* (5 repozytoriów): sekcja content w .pages.yml = grupa „Specjalność: <nazwa>” z formularzami „Treść” i „Baner i kafelek”
(początek pliku — media, settings — zostaje; pierwsza linijka komentarza dostaje dopisek o szablonie).
Web-Studia: pozycja spec-matematyka-w-ekonomii (do końca pliku albo następnej pozycji) zastąpiona taką samą grupą; pole „Kierunek”
zostaje odnośnikiem do kolekcji kierunków, jak dotąd. Reszty .pages.yml skrypt nie rusza. Można uruchamiać wiele razy (wynik ten sam).

Uruchomienie (PyYAML — tylko do sprawdzenia, że wynik się wczytuje):
  python skrypty/migracja/formularze_specjalnosci.py --tresci <katalog z klonami>
"""
import argparse
import re
from pathlib import Path

import yaml

SZABLON = Path(__file__).with_name('specjalnosc.pages.yml')
# repozytorium, pozycja w .pages.yml, napis w menu CMS, plik (id specjalności)
SPECJALNOSCI = [
    ('Web-Spec-Analiza-Danych', 'specjalnosc', 'Specjalność: Analiza danych', 'analiza-danych'),
    ('Web-Spec-Aktuarialno-Finansowa', 'specjalnosc', 'Specjalność: Matematyka aktuarialno-finansowa', 'matematyka-aktuarialno-finansowa'),
    ('Web-Spec-Nauczycielska', 'specjalnosc', 'Specjalność: Matematyka nauczycielska', 'matematyka-nauczycielska'),
    ('Web-Spec-Stosowana', 'specjalnosc', 'Specjalność: Matematyka stosowana', 'matematyka-stosowana'),
    ('Web-Spec-Teoretyczna', 'specjalnosc', 'Specjalność: Matematyka teoretyczna', 'matematyka-teoretyczna'),
    ('Web-Studia', 'spec-matematyka-w-ekonomii', 'Specjalność wygaszana: Matematyka w ekonomii', 'matematyka-w-ekonomii'),
]
KIERUNEK_LISTA = """    - name: kierunek
      label: Kierunek
      type: select
      options:
        values:
        - name: isim
          label: Indywidualne Studia Informatyczno-Matematyczne
        - name: matematyka
          label: Matematyka
        - name: siad
          label: Sztuczna inteligencja w analizie danych
        - name: szkola-doktorska
          label: Szkoła doktorska
      description: (lista z innego repozytorium — nowa pozycja wymaga dopisania w konfiguracji)"""
KIERUNEK_ODNOSNIK = """    - name: kierunek
      label: Kierunek
      type: reference
      options:
        collection: kierunki
        value: '{path}'
        label: '{primary}'
        search: nazwa"""
DOPISEK = '# Formularz specjalności z szablonu Web-Core/skrypty/migracja/specjalnosc.pages.yml (skrypt formularze_specjalnosci.py, zlecenie 29).\n'


def formularz(pozycja, etykieta, id_, kierunek):
    t = SZABLON.read_text(encoding='utf-8')
    t = ''.join(l for l in t.splitlines(keepends=True) if not l.startswith('#'))
    for k, v in (('{{pozycja}}', pozycja), ('{{etykieta}}', etykieta), ('{{id}}', id_), ('{{kierunek}}', kierunek)):
        t = t.replace(k, v)
    assert '{{' not in t, 'nieznany znacznik w szablonie'
    return t


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--tresci', required=True, type=Path)
    a = ap.parse_args()
    for repo, pozycja, etykieta, id_ in SPECJALNOSCI:
        plik = a.tresci / repo / '.pages.yml'
        stary = plik.read_text(encoding='utf-8')
        if repo.startswith('Web-Spec-'):
            nowy_f = formularz(pozycja, etykieta, id_, KIERUNEK_LISTA)
            poczatek = stary[:stary.index('\ncontent:\n') + len('\ncontent:\n')]
            if DOPISEK not in poczatek:
                poczatek = re.sub(r'^(#[^\n]*\n)', lambda m: m.group(1) + DOPISEK, poczatek, count=1)
            nowy = poczatek + nowy_f
        else:
            nowy_f = formularz(pozycja, etykieta, id_, KIERUNEK_ODNOSNIK)
            m = re.search(rf'^- name: {re.escape(pozycja)}\n.*?(?=^- name: |\Z)', stary, re.S | re.M)
            if not m:
                raise SystemExit(f'{repo}: brak pozycji {pozycja} w .pages.yml')
            nowy = stary[:m.start()] + nowy_f + stary[m.end():]
        dane = yaml.safe_load(nowy)
        grupa = next(p for p in dane['content'] if p['name'] == pozycja)
        assert [i['label'] for i in grupa['items']] == ['Treść', 'Baner i kafelek']
        plik.write_text(nowy, encoding='utf-8', newline='\n')
        print(f'{repo}: {"bez zmian" if nowy == stary else "zapisano"} ({etykieta}; pliki src/content/specjalnosci/{id_}.md i specjalnosci-baner/{id_}.json)')


if __name__ == '__main__':
    main()
