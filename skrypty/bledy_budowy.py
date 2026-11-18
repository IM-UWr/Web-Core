#!/usr/bin/env python3
"""Zlecenie 33, część B: błędy z dziennika nieudanej budowy Podglądu jako adnotacje GitHub Actions (::error).

Adnotacje czyta plakietka stanu budowy na Podglądzie (src/lib/stanBudowy/klient.js) przez API GitHuba bez logowania
i pokazuje je redaktorom po polsku, z linkiem „Popraw w CMS”. Format treści (rozdzielnik „ › ”):
  title=Błąd treści   <repozytorium> › <formularz> › <plik> › <pole>: <komunikat> › <adres formularza w Pages CMS>
  title=Błąd budowy   <rodzaj błędu>: <pierwszy wiersz komunikatu>[ (plik)]
Repozytorium = to, w którego kopii jest plik; formularz = wpis z .pages.yml tego repozytorium, którego `path` obejmuje plik.

Bez PyYAML (na maszynie GitHuba nie musi go być): .pages.yml czytany wierszami — formularze to wpisy „- name:” od pierwszej
kolumny z kluczami „type:” i „path:” wciętymi o 2 (tak jest we wszystkich repozytoriach treści).

Uruchomienie (podglad.yml, po nieudanym kroku budowy):
  python3 skrypty/bledy_budowy.py <dziennik budowy> <katalog z kopiami repozytoriów treści> [<organizacja>]
(bez organizacji: „organizacja” z tresci.json w katalogu roboczym)
"""
import json
import os
import re
import sys
from urllib.parse import quote

ESC = re.compile(r'\x1b\[[0-9;]*m|\^\[\[[0-9;]*m')
NAGLOWEK = re.compile(r'\[(\w+(?:Error|Exception))\]\s*(.*)')
POLE = re.compile(r'^\s+([^\s:*][^:*]*?)(?:\*\*: \*\*\S+)?: (.+)$')
MAKS = 10


def formularze(repo_kat):
    """[(nazwa, typ, ścieżka)] z .pages.yml repozytorium."""
    try:
        linie = open(os.path.join(repo_kat, '.pages.yml'), encoding='utf-8').read().splitlines()
    except OSError:
        return []
    wynik = []
    for i, l in enumerate(linie):
        m = re.match(r'^- name: (\S+)\s*$', l)  # formularze to wpisy najwyższego poziomu (pola są wcięte)
        if not m:
            continue
        typ, sciezka = None, None
        for k in linie[i + 1:]:
            if k.strip() and not k.startswith(' '):
                break
            t = re.match(r'^  type: (\S+)', k)
            s = re.match(r'^  path: (\S+)', k)
            typ = typ or (t and t.group(1))
            sciezka = sciezka or (s and s.group(1).strip('\'"'))
        if typ in ('collection', 'file') and sciezka:
            wynik.append((m.group(1), typ, sciezka.rstrip('/')))
    return wynik


def organizacja():
    """Organizacja na GitHubie z tresci.json (katalog roboczy = kod Web-Core), jak w src/lib/podglad.ts."""
    try:
        return json.load(open('tresci.json', encoding='utf-8'))['organizacja']
    except (OSError, KeyError, ValueError):
        return 'IM-UWr'


def zrodlo(plik, tresci, org):
    """(repozytorium, formularz, adres w Pages CMS) dla pliku src/… albo (None, None, None)."""
    if not plik or not os.path.isdir(tresci):
        return None, None, None
    for repo in sorted(os.listdir(tresci)):
        if not os.path.isfile(os.path.join(tresci, repo, plik)):
            continue
        najlepszy = None
        for nazwa, typ, sciezka in formularze(os.path.join(tresci, repo)):
            if (typ == 'file' and plik == sciezka) or (typ == 'collection' and plik.startswith(sciezka + '/')):
                if not najlepszy or len(sciezka) > len(najlepszy[2]):
                    najlepszy = (nazwa, typ, sciezka)
        if not najlepszy:
            return repo, None, None
        nazwa, typ, _ = najlepszy
        baza = f'https://app.pagescms.org/{org.lower()}/{repo.lower()}/main'
        adres = f'{baza}/file/{nazwa}' if typ == 'file' else f'{baza}/collection/{nazwa}/edit/{quote(plik, safe="")}'
        return repo, nazwa, adres
    return None, None, None


def komunikat(k):
    """Astro 5 zapisuje komunikaty zod po swojemu: Expected type `"string"`, received `"number"` → Expected string, received number
    (tę postać tłumaczy klient plakietki)."""
    return re.sub(r'Expected type `"?(\w+)"?`, received `"?(\w+)"?`', r'Expected \1, received \2', k.strip())


def wzgledna(sciezka):
    """…/Web-Podglad/src/content/x.md:0:0 → src/content/x.md"""
    s = re.sub(r':\d+:\d+$', '', sciezka.strip())
    m = re.search(r'(?:^|/)(src/.+)$', s.replace('\\', '/'))
    return m.group(1) if m else None


def bledy(dziennik):
    """[(rodzaj, nagłówek, [(pole, komunikat)], plik)] z dziennika budowy."""
    linie = [ESC.sub('', l.rstrip('\n')) for l in dziennik.splitlines()]
    wynik = []
    i = 0
    while i < len(linie):
        m = NAGLOWEK.search(linie[i])
        if not m:
            i += 1
            continue
        rodzaj, naglowek, pola, plik = m.group(1), m.group(2).strip(), [], None
        j = i + 1
        while j < len(linie) and not NAGLOWEK.search(linie[j]):
            l = linie[j].strip()
            if l in ('Hint:', 'Error reference:', 'Stack trace:'):
                pass
            elif l == 'Location:':
                k = j + 1
                while k < len(linie) and not linie[k].strip():
                    k += 1
                if k < len(linie):
                    plik = wzgledna(linie[k])
                j = k
            elif rodzaj == 'InvalidContentEntryDataError' and not plik:
                p = POLE.match(linie[j])
                if p and not p.group(1).startswith(('See ', 'at ', 'http')):
                    pola.append((p.group(1).strip(), komunikat(p.group(2))))
            if l.startswith('at ') or l.startswith('npm error') or l.startswith('Error:'):
                break
            j += 1
        wynik.append((rodzaj, naglowek, pola, plik))
        i = j if j > i else i + 1
    return wynik


def ucieczka(s, wlasciwosc=False):
    s = s.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    return s.replace(':', '%3A').replace(',', '%2C') if wlasciwosc else s


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    dziennik = open(sys.argv[1], encoding='utf-8', errors='replace').read()
    tresci = sys.argv[2]
    org = sys.argv[3] if len(sys.argv) > 3 else organizacja()
    adnotacje = []
    for rodzaj, naglowek, pola, plik in bledy(dziennik):
        repo, form, adres = zrodlo(plik, tresci, org)
        if rodzaj == 'InvalidContentEntryDataError' and repo and form:
            for pole, komunikat in pola or [('?', naglowek)]:
                czesci = [repo, form, plik, f'{pole}: {komunikat}'] + ([adres] if adres else [])
                adnotacje.append(('Błąd treści', ' › '.join(czesci)))
        else:
            gdzie = f' ({repo}: {plik})' if repo else f' ({plik})' if plik else ''
            adnotacje.append(('Błąd budowy', f'{rodzaj}: {naglowek}{gdzie}' + (f' › {adres}' if adres else '')))
    if not adnotacje:
        adnotacje.append(('Błąd budowy', 'Budowa zakończyła się błędem; szczegóły w dzienniku budowy.'))
    for tytul, tresc in adnotacje[:MAKS]:
        print(f'::error title={ucieczka(tytul, True)}::{ucieczka(tresc)}')
    if len(adnotacje) > MAKS:
        print(f'::error title={ucieczka("Błąd budowy", True)}::…i {len(adnotacje) - MAKS} kolejnych błędów (Szczegóły).')


if __name__ == '__main__':
    main()
