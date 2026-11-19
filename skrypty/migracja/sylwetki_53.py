#!/usr/bin/env python3
"""Zlecenie 53, punkty 6 i 7: wszystkie sylwetki „Warto wiedzieć” opublikowane; Bożejko i Rolski bez „Do pobrania”.

Użycie (z katalogu Web-Core, PyYAML):
  python skrypty/migracja/sylwetki_53.py <checkout Web-Instytut> [--sprawdz]
--sprawdz: nic nie zapisuje, tylko wypisuje, co by zmienił.

Co robi (tekstowo, w miejscu: reszta pliku bez zmian, końce linii jak w pliku; idempotentnie):
6. W sześciu sylwetkach (decyzja właściciela 19.11, 00:32) jedna linia „opublikowany: false” → „opublikowany: true”.
   Plik ma już true — bez zmian (do raportu). Inna sylwetka z „opublikowany: false” (np. nowy szkic) — tylko wypisana, bez zmian.
7. marek-bozejko.md i tomasz-rolski.md (decyzja 19.11, 00:40): z Treści polskiej cała sekcja od „## Do pobrania {#do-pobrania}”
   do linii przed „## Źródła {#zrodla}” (nagłówek, komentarz PLIKI, blok :::pliki, puste linie) — przed „## Źródła” zostaje
   jedna pusta linia. Gdyby redaktor dopisał Treść EN z „## Downloads …”, tak samo w tresc_en (pole blokowe YAML; inaczej STOP).
Kontrola przed zapisem (niezgodność = STOP, nic nie zapisane): nagłówek YAML się parsuje; wszystkie pola poza `opublikowany`
bez zmian; Treść po = Treść przed bez usuniętej sekcji (sprawdzone na tekście).
"""
import os
import re
import sys

import yaml

SYL = 'src/content/warto_wiedziec/sylwetki'
PUBLIKUJ = ['marek-bozejko', 'tomasz-rolski', 'piotr-biler', 'roman-duda', 'wladyslaw-narkiewicz', 'andrzej-krzywicki']
BEZ_POBRANIA = ['marek-bozejko', 'tomasz-rolski']


def czesci(t):
    m = re.match(r'^---\r?\n(.*?\r?\n)---\r?\n', t, re.S)
    if not m:
        raise SystemExit('brak nagłówka YAML')
    return yaml.safe_load(m.group(1)), t[m.end():]


def bez_sekcji(tekst, e, naglowek, nastepny):
    """Tekst bez sekcji od linii `naglowek` do linii przed `nastepny`; przed `nastepny` jedna pusta linia. None = sekcji nie ma."""
    i = tekst.find(naglowek)
    if i < 0:
        return None
    if tekst.count(naglowek) != 1 or not (i == 0 or tekst[i - len(e):i] == e):
        raise ValueError(f'„{naglowek}” nie jest jednym nagłówkiem na początku linii')
    j = tekst.find(e + nastepny, i)
    if j < 0:
        raise ValueError(f'po „{naglowek}” nie ma „{nastepny}”')
    przed = tekst[:i].rstrip('\r\n ') + e + e
    return przed + tekst[j + len(e):]


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    repo, sprawdz = sys.argv[1], '--sprawdz' in sys.argv
    zmiany, uwagi, bledy = {}, [], []
    for nazwa in sorted(os.listdir(os.path.join(repo, SYL))):
        if not nazwa.endswith('.md'):
            continue
        slug, p = nazwa[:-3], os.path.join(repo, SYL, nazwa)
        t = open(p, encoding='utf-8', newline='').read()
        e = '\r\n' if '\r\n' in t else '\n'
        nowy, opis = t, []
        dane, tresc = czesci(t)
        if slug in PUBLIKUJ:
            n_false = len(re.findall(r'^opublikowany: false\r?$', t, re.M))
            n_true = len(re.findall(r'^opublikowany: true\r?$', t, re.M))
            if n_false == 1 and n_true == 0:
                nowy = re.sub(r'^opublikowany: false(\r?)$', r'opublikowany: true\1', nowy, count=1, flags=re.M)
                opis.append('opublikowany: false → true')
            elif n_true == 1 and n_false == 0:
                uwagi.append(f'{nazwa}: ma już „opublikowany: true” — bez zmian')
            else:
                bledy.append(f'{nazwa}: linia „opublikowany” nie jest jedną linią false/true (false {n_false}×, true {n_true}×)')
        elif dane.get('opublikowany') is False:
            uwagi.append(f'{nazwa}: „opublikowany: false” spoza listy zlecenia (nowy szkic?) — bez zmian, do decyzji właściciela')
        if slug in BEZ_POBRANIA:
            try:
                _, ciało = czesci(nowy)
                b = bez_sekcji(ciało, e, '## Do pobrania {#do-pobrania}', '## Źródła {#zrodla}')
                if b is not None:
                    nowy = nowy[:len(nowy) - len(ciało)] + b
                    opis.append('Treść PL bez „Do pobrania”')
                en = dane.get('tresc_en') or ''
                if re.search(r'^## (Downloads|Do pobrania)', en, re.M):
                    bledy.append(f'{nazwa}: Treść EN ma sekcję „Downloads” — do usunięcia ręcznie (pole YAML), STOP')
            except ValueError as x:
                bledy.append(f'{nazwa}: {x}')
        if nowy == t:
            continue
        # kontrola: pola poza opublikowany bez zmian; Treść = stara bez sekcji
        d2, t2 = czesci(nowy)
        d1 = {k: v for k, v in dane.items() if k != 'opublikowany'}
        if {k: v for k, v in d2.items() if k != 'opublikowany'} != d1:
            bledy.append(f'{nazwa}: zmieniły się pola poza „opublikowany”')
        if slug in PUBLIKUJ and d2.get('opublikowany') is not True:
            bledy.append(f'{nazwa}: po zmianie opublikowany ≠ true')
        if slug not in BEZ_POBRANIA and t2 != tresc:
            bledy.append(f'{nazwa}: zmieniła się Treść')
        if slug in BEZ_POBRANIA:
            usuniete = [l for l in tresc.splitlines() if l.strip()]
            zostaly = [l for l in t2.splitlines() if l.strip()]
            sekcja = [l for l in usuniete if l not in zostaly]
            if any(not (l.startswith('## Do pobrania') or l.startswith('<!-- PLIKI') or l.startswith(':::') or l.startswith('- [Nota biograficzna')) for l in sekcja) \
                    or len(usuniete) - len(zostaly) != len(sekcja):
                bledy.append(f'{nazwa}: usunięte linie spoza sekcji „Do pobrania”: {sekcja}')
        zmiany[p] = (nowy, opis)
    for u in uwagi:
        print('UWAGA', u)
    if bledy:
        print('STOP, nic nie zapisano:')
        for b in bledy:
            print(' -', b)
        sys.exit(1)
    for p, (nowy, opis) in zmiany.items():
        print(f'{"do zmiany" if sprawdz else "zmieniony"}: {os.path.basename(p)}: {"; ".join(opis)}')
        if not sprawdz:
            open(p, 'w', encoding='utf-8', newline='').write(nowy)
    print(f'{"SPRAWDZENIE — do zmiany" if sprawdz else "Zapisano"}: {len(zmiany)} plików.')


if __name__ == '__main__':
    main()
