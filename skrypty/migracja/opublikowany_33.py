"""Zlecenie 33: przełącznik „Opublikowane” w formularzach Pages CMS i jawne `opublikowany` we wpisach.

Formularze (A2.3): „Strony” we wszystkich repozytoriach, które je mają, „Strona działu …” (Web-Instytut, Web-Nauka,
Web-Studia, Web-Popularyzacja) oraz kierunki i specjalności (Web-Studia). Pole `opublikowany` (boolean, `default: true`)
stoi zaraz pod tytułem, a gdy tuż pod tytułem jest tytuł EN — pod tą parą (para PL/EN się nie rozdziela). Dotychczasowe
pole (Web-Studia: „Uwzględniaj w zestawieniach”) jest zastępowane i przenoszone na to miejsce.

Dane (A2.4): każdy plik tych formularzy dostaje `opublikowany: true`, jeśli nie ma pola, w miejscu, w które Pages CMS
zapisze je przy zapisie formularza (kolejność pól formularza). Plików z polem (także `false`) skrypt nie rusza: przeniesienie
klucza zmieniłoby przy odczycie koniec bloku tekstu, który stałby się ostatnim polem (np. `tresc_en: |`).

`.pages.yml` i pliki edytowane jako tekst: reszta pliku zostaje bajt w bajt. Po zmianie skrypt sprawdza (YAML), że dane
różnią się tylko polem `opublikowany`. Skrypt jest idempotentny: drugie uruchomienie nic nie zmienia.

Użycie:
  python skrypty/migracja/opublikowany_33.py <katalog z kopiami repozytoriów treści>            # zmiana
  python skrypty/migracja/opublikowany_33.py <katalog z kopiami repozytoriów treści> --sprawdz  # sama kontrola
"""
import re
import sys
from pathlib import Path

import yaml

CELE = {
    'Web-Aktualnosci': ['strony'],
    'Web-Instytut': ['strona-dzialu', 'strony'],
    'Web-Nauka': ['strona-dzialu', 'strony'],
    'Web-Popularyzacja': ['popularyzacja', 'strony'],
    'Web-Pracownicy': ['strony'],
    'Web-Studia': ['strona-dzialu', 'kierunki', 'specjalnosci', 'strony'],
}
POLE = 'opublikowany'
ETYKIETA = 'Opublikowane — widoczne na stronie publicznej (na Podglądzie widać zawsze)'
OPIS = 'Odznacz, żeby przygotować stronę bez pokazywania jej na stronie publicznej (szkic)'
NAGLOWEK_STARY = '# Wygenerowane przy migracji z Avean/IM-Website-test; pola „Opublikowany” usunięte (bez wersji roboczych).'
NAGLOWEK_NOWY = '# Zlecenie 33: pole „Opublikowane” wróciło w Stronach i na stronie działu (odznaczone = szkic, widoczny tylko na Podglądzie).'
TYTULY = ('tytul', 'nazwa')

wcięcie = lambda l: len(l) - len(l.lstrip(' '))


def blok_pola(ind: int, nl: str) -> list[str]:
    s = ' ' * ind
    return [f'{s}- name: {POLE}{nl}', f'{s}  label: {ETYKIETA}{nl}', f'{s}  description: {OPIS}{nl}',
            f'{s}  type: boolean{nl}', f'{s}  default: true{nl}']


def koniec_bloku(linie: list[str], start: int, ind: int) -> int:
    """Pierwsza linia po bloku zaczynającym się w `start` (wcięcie `ind`): następna niepusta linia o wcięciu <= ind."""
    i = start + 1
    while i < len(linie) and (not linie[i].strip() or wcięcie(linie[i]) > ind):
        i += 1
    # puste linie na końcu bloku należą do następnego
    while i - 1 > start and not linie[i - 1].strip():
        i -= 1
    return i


def formularz_w_tekscie(linie: list[str], nazwa: str) -> tuple[int, int]:
    """Zakres linii formularza `nazwa` na najwyższym poziomie listy `content:`."""
    c = next(i for i, l in enumerate(linie) if l.rstrip() == 'content:')
    pierwszy = next(i for i in range(c + 1, len(linie)) if linie[i].lstrip().startswith('- name:'))
    ind = wcięcie(linie[pierwszy])
    for i in range(c + 1, len(linie)):
        l = linie[i]
        if l.strip() and wcięcie(l) < ind and not l.lstrip().startswith('#'):
            break
        if wcięcie(l) == ind and re.fullmatch(rf'- name: {re.escape(nazwa)}\s*', l.strip()):
            return i, koniec_bloku(linie, i, ind)
    raise SystemExit(f'brak formularza {nazwa}')


def pola_w_tekscie(linie: list[str], od: int, do: int) -> tuple[int, list[tuple[str, int, int]]]:
    """Wcięcie pól i lista (nazwa, początek, koniec) pól najwyższego poziomu formularza."""
    ind_f = wcięcie(linie[od]) + 2
    f = next(i for i in range(od + 1, do) if wcięcie(linie[i]) == ind_f and linie[i].strip() == 'fields:')
    pierwszy = next(i for i in range(f + 1, do) if linie[i].strip())
    ind = wcięcie(linie[pierwszy])
    assert linie[pierwszy].lstrip().startswith('- name:'), linie[pierwszy]
    pola, i = [], pierwszy
    while i < do and linie[i].strip() and wcięcie(linie[i]) == ind and linie[i].lstrip().startswith('- name:'):
        k = koniec_bloku(linie, i, ind)
        pola.append((linie[i].split('- name:', 1)[1].strip(), i, k))
        i = k
        while i < do and not linie[i].strip():
            i += 1
    return ind, pola


def zmien_konfiguracje(tekst: str, formularze: list[str]) -> str:
    nl = '\r\n' if '\r\n' in tekst else '\n'
    linie = tekst.splitlines(keepends=True)
    for nazwa in formularze:
        od, do = formularz_w_tekscie(linie, nazwa)
        ind, pola = pola_w_tekscie(linie, od, do)
        nazwy = [p[0] for p in pola]
        stare = [p for p in pola if p[0] == POLE]
        if stare:
            _, s, k = stare[0]
            del linie[s:k]
            od, do = formularz_w_tekscie(linie, nazwa)
            ind, pola = pola_w_tekscie(linie, od, do)
            nazwy = [p[0] for p in pola]
        tytul = next(n for n in nazwy if n in TYTULY)
        t = nazwy.index(tytul)
        kotwica = t + 1 if t + 1 < len(nazwy) and nazwy[t + 1] == f'{tytul}_en' else t
        wstaw = pola[kotwica][2]
        linie[wstaw:wstaw] = blok_pola(ind, nl)
    wynik = ''.join(linie)
    return wynik.replace(NAGLOWEK_STARY + nl, NAGLOWEK_STARY + nl + NAGLOWEK_NOWY + nl, 1) if NAGLOWEK_NOWY not in wynik else wynik


def pliki_formularza(repo: Path, form: dict) -> list[Path]:
    if form['type'] == 'file':
        return [repo / form['path']] if (repo / form['path']).exists() else []
    katalog = repo / form['path']
    if not katalog.exists():
        return []
    return sorted(katalog.rglob('*.md') if form.get('subfolders') else katalog.glob('*.md'))


FM = re.compile(r'^---(\r?\n)(.*?)(\r?\n)---(\r?\n|$)', re.S)
KLUCZ = re.compile(r'^([A-Za-z_][\w-]*):(?:\s|$)')


def zmien_plik(tekst: str, kolejnosc: list[str]) -> str:
    m = FM.match(tekst)
    if not m:
        raise ValueError('brak frontmattera')
    nl = m.group(1)
    fm = m.group(2)
    linie = fm.split(nl) if fm else []
    # bloki kluczy najwyższego poziomu
    starty = [i for i, l in enumerate(linie) if KLUCZ.match(l)]
    klucze = [KLUCZ.match(linie[i]).group(1) for i in starty]
    if POLE in klucze:
        return tekst
    poz = kolejnosc.index(POLE)
    # zaraz za polem formularza, które stoi tuż przed `opublikowany` (tytuł albo tytuł EN), także gdy plik ma inną
    # kolejność kluczy; bez takiego pola — przed pierwszym kluczem, który w formularzu stoi dalej
    przed = [(kolejnosc.index(kl), j) for j, kl in enumerate(klucze) if kl in kolejnosc and kolejnosc.index(kl) < poz]
    if przed:
        j = max(przed)[1]
        wstaw = starty[j + 1] if j + 1 < len(starty) else len(linie)
    else:
        wstaw = next((i for i, kl in zip(starty, klucze) if kl in kolejnosc and kolejnosc.index(kl) > poz), len(linie))
    linie.insert(wstaw, f'{POLE}: true')
    return tekst[:m.start(2)] + nl.join(linie) + tekst[m.end(2):]


def dane(tekst: str) -> dict:
    m = FM.match(tekst)
    return yaml.safe_load(m.group(2)) or {} if m else {}


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    katalog = Path(sys.argv[1])
    tylko_sprawdz = '--sprawdz' in sys.argv
    problemy = 0
    for repo_nazwa, formularze in CELE.items():
        repo = katalog / repo_nazwa
        sciezka = repo / '.pages.yml'
        stary = sciezka.read_bytes().decode('utf-8')
        nowy = zmien_konfiguracje(stary, formularze)
        # kontrola konfiguracji: poza polem `opublikowany` formularze bez zmian
        k_stary, k_nowy = yaml.safe_load(stary), yaml.safe_load(nowy)
        def formy(k):
            out = {}
            def w(l):
                for c in l:
                    if c.get('type') == 'group':
                        w(c.get('items', []))
                    else:
                        out[c['name']] = c
            w(k['content'])
            return out
        fs_, fn_ = formy(k_stary), formy(k_nowy)
        assert {n: {**f, 'fields': [p for p in f.get('fields', []) if p['name'] != POLE]} for n, f in fs_.items()} == \
               {n: {**f, 'fields': [p for p in f.get('fields', []) if p['name'] != POLE]} for n, f in fn_.items()}, repo_nazwa
        assert {k: v for k, v in k_stary.items() if k != 'content'} == {k: v for k, v in k_nowy.items() if k != 'content'}
        for n in formularze:
            pole = next(p for p in fn_[n]['fields'] if p['name'] == POLE)
            assert pole == {'name': POLE, 'label': ETYKIETA, 'description': OPIS, 'type': 'boolean', 'default': True}, pole
        zmiana_konf = stary != nowy
        if tylko_sprawdz and zmiana_konf:
            print(f'ŹLE {repo_nazwa}/.pages.yml: formularz bez nowego pola albo pole nie na miejscu')
            problemy += 1
        elif not tylko_sprawdz and zmiana_konf:
            sciezka.write_bytes(nowy.encode('utf-8'))
        print(f'{repo_nazwa}/.pages.yml: {"zmieniony" if zmiana_konf else "bez zmian"} ({", ".join(formularze)})')

        for n in formularze:
            form = fn_[n]
            kolejnosc = [p['name'] for p in form['fields']]
            dodane, gotowe, falsz, puste = [], [], [], []
            for plik in pliki_formularza(repo, form):
                t = plik.read_bytes().decode('utf-8')
                przed = dane(t)
                nt = zmien_plik(t, kolejnosc)
                po = dane(nt)
                assert {k: v for k, v in po.items() if k != POLE} == {k: v for k, v in przed.items() if k != POLE}, plik
                assert po[POLE] == przed.get(POLE, True), plik
                assert t[FM.match(t).end():] == nt[FM.match(nt).end():], plik  # treść pod frontmatterem bajt w bajt
                if po[POLE] is False:
                    falsz.append(plik)
                if not isinstance(po[POLE], bool):
                    puste.append(plik)
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
            print(f'  {n}: plików {len(dodane) + len(gotowe)}; dopisane {len(dodane)}, z polem już wcześniej {len(gotowe)}; '
                  f'szkice (false): {len(falsz)}')
    print(f'\nProblemów: {problemy}')
    sys.exit(1 if problemy else 0)


if __name__ == '__main__':
    main()
