#!/usr/bin/env python3
"""Zlecenie 42: osoby w formularzach CMS wybierane ze spisu pracowników.

  python skrypty/migracja/osoby_42.py inwentarz <katalog z klonami Web-*>      — etap 0: pola z osobami, dopasowania, braki
  python skrypty/migracja/osoby_42.py migruj <katalog z klonami> <repo> […]     — etap 4: przeniesienie wartości (patrz niżej)
      repo: Web-Pracownicy (pracuje: true), Web-Nauka (granty), Web-Instytut (zakłady, władze), Web-Sem-* (koordynatorzy).
      Formularze (.pages.yml) zmienia osobno skrypty/migracja/formularze_40.mjs <repo>; katalog _cms/pracownicy —
      skrypty/synchronizuj-katalog-pracownikow.mjs.

Dopasowanie do spisu (Web-Pracownicy/src/content/pracownicy/*.yml, osoby widoczne) jak dotąd na stronie (osobaGrantu,
src/lib/tresci.ts): nazwisko = ostatni wyraz bez tytułów, inicjał = pierwsza litera pierwszego wyrazu; kilka różnych osób =
niejednoznaczne. „Pewne” (etap 4 zlecenia): pełne imię i nazwisko po zdjęciu tytułów albo jednoznaczne nazwisko z inicjałem.
Samo nazwisko bez imienia i inicjału = „podejrzane” (nie przenosimy, idzie do „spoza spisu”).
Wymaga PyYAML (python z venv), uruchamiać z -X utf8.
"""
import glob
import json
import os
import re
import sys

import yaml

TYTULY = {'prof', 'dr', 'hab', 'inż', 'mgr', 'uwr'}
SEM = ['Web-Sem-Analiza-Harmoniczna', 'Web-Sem-Dydaktyka', 'Web-Sem-Dyskretna-Analiza-Harmoniczna', 'Web-Sem-Geometria',
       'Web-Sem-Prawdopodobienstwo', 'Web-Sem-Rownania-Rozniczkowe', 'Web-Sem-Statystyka', 'Web-Sem-Teoria-Modeli',
       'Web-Sem-Topologia']


class Wczytywacz(yaml.SafeLoader):
    """YAML 1.2 jak w Pages CMS i Astro: „13:00” to tekst."""


def _tekst_z_dwukropkiem(typ):
    def k(loader, node):
        if ':' in str(node.value):
            return loader.construct_scalar(node)
        return getattr(yaml.SafeLoader, f'construct_yaml_{typ}')(loader, node)
    return k


Wczytywacz.add_constructor('tag:yaml.org,2002:int', _tekst_z_dwukropkiem('int'))
Wczytywacz.add_constructor('tag:yaml.org,2002:float', _tekst_z_dwukropkiem('float'))


def czytaj(plik):
    t = open(plik, encoding='utf-8').read()
    if plik.endswith(('.yml', '.yaml')):
        return yaml.load(t, Loader=Wczytywacz) or {}
    if plik.endswith('.json'):
        return json.loads(t)
    m = re.match(r'^---\r?\n(.*?)\r?\n---', t, re.S)
    return (yaml.load(m.group(1), Loader=Wczytywacz) or {}) if m else {}


def spis(klony):
    osoby = []
    for p in sorted(glob.glob(os.path.join(klony, 'Web-Pracownicy/src/content/pracownicy/*.y*ml'))):
        d = czytaj(p)
        osoby.append({'id': os.path.splitext(os.path.basename(p))[0], **d})
    return osoby


def widoczny(o):
    return o.get('opublikowany') is not False


def slowa_bez_tytulow(s):
    w = [re.sub(r'[^\w-]', '', x) for x in re.split(r'[\s.]+', s)]
    return [x for x in w if re.search(r'[^\W\d_]', x) and x.lower() not in TYTULY]


def osoba_z(s):
    for czesc in re.split(r'[,;]', s):
        w = slowa_bez_tytulow(czesc)
        if w:
            return {'nazwisko': w[-1], 'inicjal': w[0][0] if len(w) > 1 else None, 'slowa': w}
    return None


def dopasuj(zapis, osoby):
    """(rodzaj, osoba, kandydaci): rodzaj = pewne-pelne | pewne-inicjal | podejrzane-nazwisko | niejednoznaczne | brak.
    Osoba jak w osobaGrantu: przy kilku wpisach tej samej osoby — wpis z zakładem."""
    k = osoba_z(zapis or '')
    if not k:
        return 'brak', None, []
    pas = [o for o in osoby if o['imie_nazwisko'].split()[-1] == k['nazwisko']
           and (not k['inicjal'] or o['imie_nazwisko'].split()[0][0].upper() == k['inicjal'].upper())]
    nazwy = {o['imie_nazwisko'] for o in pas}
    if not pas:
        return 'brak', None, []
    if len(nazwy) > 1:
        return 'niejednoznaczne', None, pas
    o = next((x for x in pas if x.get('zaklad')), pas[0])
    pelne = ' '.join(k['slowa']) == o['imie_nazwisko'].strip()
    if pelne:
        return 'pewne-pelne', o, pas
    if k['inicjal']:
        return 'pewne-inicjal', o, pas
    return 'podejrzane-nazwisko', o, pas


def czesci_kierownika(zapis):
    """Podział pola „kierownik” grantu na osoby jak kierownicyGrantu: fragment z samym tytułem zostaje przy sąsiedniej osobie."""
    czesci, przed = [], ''
    for c in [x.strip() for x in re.split(r'[,;]', zapis or '') if x.strip()]:
        if not slowa_bez_tytulow(c):
            if czesci:
                czesci[-1]['tekst'] += f', {c}'
            else:
                przed += f'{c}, '
            continue
        czesci.append({'tekst': przed + c, 'do_dopasowania': c})
        przed = ''
    if not czesci and (zapis or '').strip():
        czesci.append({'tekst': zapis.strip(), 'do_dopasowania': zapis.strip()})
    return czesci


def wpisy_pol(klony):
    """Wszystkie wartości pól z osobami: (repo, plik, pole, rodzaj pola, tekst, do_dopasowania, migrowane, kontekst)."""
    W = []
    R = lambda *a: os.path.join(klony, *a)
    for p in sorted(glob.glob(R('Web-Nauka/src/content/granty/*.md'))):
        d = czytaj(p)
        for c in czesci_kierownika(d.get('kierownik') or ''):
            W.append(('Web-Nauka', p, 'granty → kierownik', 'historia', c['tekst'], c['do_dopasowania'], True, d.get('zaklad')))
        if d.get('wykonawcy'):
            for c in czesci_kierownika(d['wykonawcy']):
                W.append(('Web-Nauka', p, 'granty → wykonawcy', 'historia', c['tekst'], c['do_dopasowania'], False, None))
    for p in sorted(glob.glob(R('Web-Instytut/src/content/zaklady/*.md'))):
        d = czytaj(p)
        k = (d.get('karta') or {}).get('kierownik') or d.get('kierownik')
        W.append(('Web-Instytut', p, 'zakłady → karta.kierownik', 'funkcja', k or '', k or '', True, os.path.basename(p)[:-3]))
    for r in SEM:
        for p in sorted(glob.glob(R(r, 'src/content/seminaria/*.md'))):
            d = czytaj(p)
            lista = d.get('prowadzacy') or []
            if not lista:
                W.append((r, p, 'seminarium → prowadzacy', 'funkcja', '', '', True, None))
            for x in lista:
                W.append((r, p, 'seminarium → prowadzacy', 'funkcja', x, x, True, None))
    p = R('Web-Instytut/src/data/wladze.json')
    d = czytaj(p)
    for o in d.get('osoby') or []:
        W.append(('Web-Instytut', p, 'władze → osoby (dyrekcja)', 'funkcja', o.get('imie_nazwisko') or '', o.get('imie_nazwisko') or '', True, o.get('rola')))
    for o in (d.get('wydzial') or {}).get('osoby') or []:
        W.append(('Web-Instytut', p, 'władze → wydzial.osoby', 'funkcja', o.get('imie_nazwisko') or '', o.get('imie_nazwisko') or '', True, o.get('rola')))
    for x in (d.get('sekretariat') or {}).get('osoby') or []:
        W.append(('Web-Instytut', p, 'władze → sekretariat.osoby', 'funkcja', x, x, True, None))
    for p in sorted(glob.glob(R('Web-Studia/src/content/specjalnosci/*.md'))):
        d = czytaj(p)
        for o in d.get('opiekunowie') or []:
            W.append(('Web-Studia', p, 'specjalności → opiekunowie', 'funkcja', o.get('osoba') or o.get('imie_nazwisko') or '',
                      o.get('imie_nazwisko') or '', False, o.get('osoba')))
    for p in sorted(glob.glob(R('Web-Aktualnosci/src/content/obrony/*.md'))):
        d = czytaj(p)
        prom = d.get('promotorzy') or []
        for x in (prom if isinstance(prom, list) else [prom]):
            for c in czesci_kierownika(x):
                W.append(('Web-Aktualnosci', p, 'obrony → promotorzy', 'historia', c['tekst'], c['do_dopasowania'], False, None))
        for rc in d.get('recenzje') or []:
            x = (rc or {}).get('recenzent') or ''
            for c in czesci_kierownika(x):
                W.append(('Web-Aktualnosci', p, 'obrony → recenzje.recenzent', 'historia', c['tekst'], c['do_dopasowania'], False, None))
    return W


def inwentarz(klony):
    osoby_wszystkie = spis(klony)
    osoby = [o for o in osoby_wszystkie if widoczny(o)]
    W = wpisy_pol(klony)
    print(f'Spis: {len(osoby_wszystkie)} plików, widocznych {len(osoby)}; grupy: ' + ', '.join(
        f'{g} {sum(1 for o in osoby if (o.get("grupa") or "nauczyciel") == g)}' for g in ('nauczyciel', 'emeryt', 'doktorant', 'administracja')))
    imiona = {}
    for o in osoby:
        imiona.setdefault(o['imie_nazwisko'].strip(), []).append(o['id'])
    dupl = {k: v for k, v in imiona.items() if len(v) > 1}
    print(f'Te same imię i nazwisko w kilku plikach: {dupl or "brak"}')
    pola = {}
    szczegoly = []
    for repo, plik, pole, rodzaj, tekst, do_dop, migr, kont in W:
        if pole == 'specjalności → opiekunowie':
            ident = re.sub(r'^.*/|\.ya?ml$', '', tekst)
            r = 'pewne-pelne' if any(o['id'] == ident for o in osoby) else 'brak'
            o = next((x for x in osoby if x['id'] == ident), None)
        elif not tekst.strip():
            r, o = 'puste', None
        else:
            r, o, _ = dopasuj(do_dop, osoby)
        s = pola.setdefault((repo if not repo.startswith('Web-Sem') else 'Web-Sem-* (9)', pole, rodzaj, migr), {})
        s[r] = s.get(r, 0) + 1
        szczegoly.append((repo, os.path.relpath(plik, klony).replace('\\', '/'), pole, tekst, r, o['id'] if o else '', kont))
    print('\n## Pola z osobami (wpisy: pewne-pelne / pewne-inicjal / podejrzane-nazwisko / niejednoznaczne / brak / puste)')
    for (repo, pole, rodzaj, migr), s in pola.items():
        print(f'- {repo} · {pole} · {rodzaj} · {"migracja" if migr else "bez migracji"}: ' + ', '.join(f'{k} {v}' for k, v in sorted(s.items())) + f' (razem {sum(s.values())})')
    print('\n## Wartości niepewne, niejednoznaczne, bez dopasowania i puste')
    for repo, plik, pole, tekst, r, oid, kont in szczegoly:
        if r not in ('pewne-pelne',):
            print(f'- [{r}] {pole}: „{tekst}” → {oid or "—"}  ({plik}{" · " + str(kont) if kont else ""})')
    return szczegoly


# ---------- Etap 4: migracja ----------
# Zmiany tekstowe w nagłówkach YAML (reszta pliku bez zmian, cudzysłowy jak w plikach: "…", listy wcięte o 2 spacje),
# wladze.json przez json (zapis jak w źródle: 2 spacje, ensure_ascii=False, ten sam koniec linii; sprawdzone: odczyt+zapis = bez zmian).
# Pewne dopasowanie (pełne imię i nazwisko albo nazwisko z inicjałem, jednoznacznie) → „… ze spisu” (ścieżka pliku katalogu
# _cms/pracownicy/<id>.yml, jak u opiekunów specjalności); reszta → „… spoza spisu” bez zmian. Tabela przypisań właściciela: pusta
# (decyzja 18.11). Przerobiony plik (jest już nowe pole) — pomijany z adnotacją (jednorazowość).
PEWNE = ('pewne-pelne', 'pewne-inicjal')
PRZYPISANIA = {}  # tekst z pola → id osoby (tabela przypisań właściciela z etapu 0; 18.11: brak)


def q(s):
    """Skalar YAML w cudzysłowie (składnia JSON jest poprawnym YAML-em w "…")."""
    return json.dumps(s, ensure_ascii=False)


def sciezka(o):
    return f'_cms/pracownicy/{o["id"]}.yml'


def czytaj_surowo(p):
    t = open(p, encoding='utf-8', newline='').read()
    eol = '\r\n' if '\r\n' in t else '\n'
    return t, eol


def naglowek(t, eol):
    """(linie nagłówka YAML, początek, koniec) — t[poczatek:koniec] to nagłówek bez ograniczników."""
    m = re.match(r'^---\r?\n(.*?)\r?\n---(?:\r?\n|$)', t, re.S)
    if not m:
        return None
    return m.group(1).split(eol), m.start(1), m.end(1)


def zapisz_naglowek(p, t, eol, linie, pocz, kon):
    open(p, 'w', encoding='utf-8', newline='').write(t[:pocz] + eol.join(linie) + t[kon:])


def blok_klucza(linie, klucz, wciecie=''):
    """Zakres linii [i, j) klucza `klucz:` na danym wcięciu razem z jego listą/wartością w kolejnych liniach (głębiej wciętych)."""
    idx = [n for n, l in enumerate(linie) if l.startswith(f'{wciecie}{klucz}:')]
    if not idx:
        return None
    assert len(idx) == 1, (klucz, idx)
    i = idx[0]
    j = i + 1
    while j < len(linie) and (linie[j].startswith(wciecie + ' ') or linie[j].startswith(wciecie + '-')) and linie[j].strip():
        j += 1
    return i, j


def przypisz(tekst, osoby):
    if tekst.strip() in PRZYPISANIA:
        return 'tabela', next(o for o in osoby if o['id'] == PRZYPISANIA[tekst.strip()])
    r, o, _ = dopasuj(tekst, osoby)
    return r, (o if r in PEWNE else None)


def lista_yaml(klucz, wartosci, wciecie=''):
    return [f'{wciecie}{klucz}:'] + [f'{wciecie}  - {q(x)}' for x in wartosci]


def migruj(klony, repo, raport):
    osoby = spis(klony)  # cały spis (wszyscy dostają pracuje: true; nikt nie jest dziś „byłym pracownikiem”)
    R = lambda *a: os.path.join(klony, repo, *a)
    rel = lambda p: os.path.relpath(p, os.path.join(klony, repo)).replace('\\', '/')
    licz = {}

    def notuj(pole, rodzaj, opis):
        licz.setdefault(pole, {}).setdefault(rodzaj, 0)
        licz[pole][rodzaj] += 1
        raport.append(f'- {repo} · {pole} · {rodzaj}: {opis}')

    if repo == 'Web-Pracownicy':
        for p in sorted(glob.glob(R('src/content/pracownicy/*.y*ml'))):
            t, eol = czytaj_surowo(p)
            linie = t.split(eol)
            if any(l.startswith('pracuje:') for l in linie):
                notuj('pracownicy → pracuje', 'pominięty (już jest)', rel(p))
                continue
            g = [n for n, l in enumerate(linie) if l.startswith('grupa:')]
            assert len(g) == 1, p
            linie.insert(g[0] + 1, 'pracuje: true')
            open(p, 'w', encoding='utf-8', newline='').write(eol.join(linie))
            licz.setdefault('pracownicy → pracuje', {}).setdefault('pracuje: true', 0)
            licz['pracownicy → pracuje']['pracuje: true'] += 1
    elif repo == 'Web-Nauka':
        for p in sorted(glob.glob(R('src/content/granty/*.md'))):
            t, eol = czytaj_surowo(p)
            linie, pocz, kon = naglowek(t, eol)
            if blok_klucza(linie, 'kierownik_ze_spisu') or blok_klucza(linie, 'kierownik_spoza'):
                notuj('granty → kierownik', 'pominięty (przerobiony)', rel(p))
                continue
            b = blok_klucza(linie, 'kierownik')
            if not b:
                notuj('granty → kierownik', 'brak pola', rel(p))
                continue
            d = yaml.load('\n'.join(linie), Loader=Wczytywacz) or {}
            ze, spoza = [], []
            for c in czesci_kierownika(str(d.get('kierownik') or '')):
                r, o = przypisz(c['do_dopasowania'], osoby)
                if o:
                    ze.append(sciezka(o))
                    notuj('granty → kierownik', 'ze spisu', f'„{c["tekst"]}” → {o["id"]} ({r}) · {rel(p)}')
                else:
                    spoza.append(c['tekst'])
                    notuj('granty → kierownik', 'spoza spisu', f'„{c["tekst"]}” ({r}) · {rel(p)}')
            if ze and spoza:
                raport.append(f'  - uwaga: {rel(p)} — kierownicy ze spisu i spoza; na stronie najpierw ze spisu (kolejność może się zmienić)')
            nowe = (lista_yaml('kierownik_ze_spisu', ze) if ze else []) + (lista_yaml('kierownik_spoza', spoza) if spoza else [])
            linie[b[0]:b[1]] = nowe
            zapisz_naglowek(p, t, eol, linie, pocz, kon)
    elif repo == 'Web-Instytut':
        for p in sorted(glob.glob(R('src/content/zaklady/*.md'))):
            t, eol = czytaj_surowo(p)
            linie, pocz, kon = naglowek(t, eol)
            if blok_klucza(linie, 'kierownik_ze_spisu', '  '):
                notuj('zakłady → karta.kierownik', 'pominięty (przerobiony)', rel(p))
                continue
            b = blok_klucza(linie, 'kierownik', '  ')
            d = yaml.load('\n'.join(linie), Loader=Wczytywacz) or {}
            k = str((d.get('karta') or {}).get('kierownik') or '')
            if not b or not k.strip():
                notuj('zakłady → karta.kierownik', 'puste', rel(p))
                continue
            assert b[1] == b[0] + 1, p
            r, o = przypisz(k, osoby)
            if not o:
                # pole „wybór” bez „spoza spisu”: wartość zostaje w starym polu (strona czyta je dalej), do decyzji właściciela
                notuj('zakłady → karta.kierownik', 'NIE PRZENIESIONY', f'„{k}” ({r}) · {rel(p)}')
                continue
            linie[b[0]] = f'  kierownik_ze_spisu: {q(sciezka(o))}'
            notuj('zakłady → karta.kierownik', 'ze spisu', f'„{k}” → {o["id"]} ({r}) · {rel(p)}')
            zapisz_naglowek(p, t, eol, linie, pocz, kon)
        p = R('src/data/wladze.json')
        t, eol = czytaj_surowo(p)
        d = json.loads(t)
        assert json.dumps(d, indent=2, ensure_ascii=False) + ('\n' if t.endswith('\n') else '') == t.replace('\r\n', '\n'), 'wladze.json: zapis json zmieniłby formatowanie'
        if any('osoba' in o for o in d.get('osoby') or []) or 'osoby_ze_spisu' in (d.get('sekretariat') or {}):
            notuj('władze', 'pominięty (przerobiony)', rel(p))
        else:
            def osoba_wladz(x, pole, spoza_dozwolone):
                n, inne = {}, {}
                for k, v in x.items():
                    if k == 'imie_nazwisko':
                        r, o = przypisz(v or '', osoby)
                        if o:
                            n['osoba'] = sciezka(o)
                            notuj(pole, 'ze spisu', f'„{v}” → {o["id"]} ({r}) · {x.get("rola")}')
                        else:
                            assert spoza_dozwolone, f'{pole}: „{v}” bez dopasowania, a pole nie ma „spoza spisu”'
                            n['imie_nazwisko'] = v
                            notuj(pole, 'spoza spisu', f'„{v}” ({r}) · {x.get("rola")}')
                    elif k in ('stopien', 'email', 'pokoj', 'strona'):
                        if v:
                            inne[k] = v
                            notuj(pole, 'nadpisanie → inne', f'{k} „{v}” · {x.get("rola")}')
                    else:
                        n[k] = v
                if inne:
                    poz = n.pop('pozycja', None)
                    n['inne'] = inne
                    if poz is not None:
                        n['pozycja'] = poz
                return n
            d['osoby'] = [osoba_wladz(x, 'władze → osoby (dyrekcja)', False) for x in d.get('osoby') or []]
            if d.get('wydzial'):
                d['wydzial']['osoby'] = [osoba_wladz(x, 'władze → wydzial.osoby', True) for x in d['wydzial'].get('osoby') or []]
            sek = d.get('sekretariat') or {}
            if 'osoby' in sek:
                ze = []
                for x in sek['osoby'] or []:
                    r, o = przypisz(x, osoby)
                    assert o, f'sekretariat: „{x}” bez dopasowania'
                    ze.append(sciezka(o))
                    notuj('władze → sekretariat.osoby', 'ze spisu', f'„{x}” → {o["id"]} ({r})')
                d['sekretariat'] = {('osoby_ze_spisu' if k == 'osoby' else k): (ze if k == 'osoby' else v) for k, v in sek.items()}
            nowy = json.dumps(d, indent=2, ensure_ascii=False) + ('\n' if t.endswith('\n') else '')
            open(p, 'w', encoding='utf-8', newline='').write(nowy.replace('\n', eol))
    elif repo.startswith('Web-Sem-'):
        for p in sorted(glob.glob(R('src/content/seminaria/*.md'))):
            t, eol = czytaj_surowo(p)
            linie, pocz, kon = naglowek(t, eol)
            if blok_klucza(linie, 'prowadzacy_ze_spisu') or blok_klucza(linie, 'prowadzacy_spoza'):
                notuj('seminarium → prowadzacy', 'pominięty (przerobiony)', rel(p))
                continue
            b = blok_klucza(linie, 'prowadzacy')
            if not b:
                notuj('seminarium → prowadzacy', 'brak pola', rel(p))
                continue
            d = yaml.load('\n'.join(linie), Loader=Wczytywacz) or {}
            ze, spoza = [], []
            for x in d.get('prowadzacy') or []:
                r, o = przypisz(str(x), osoby)
                if o:
                    ze.append(sciezka(o))
                    notuj('seminarium → prowadzacy', 'ze spisu', f'„{x}” → {o["id"]} ({r}) · {rel(p)}')
                else:
                    spoza.append(str(x))
                    notuj('seminarium → prowadzacy', 'spoza spisu', f'„{x}” ({r}) · {rel(p)}')
            if ze and spoza:
                raport.append(f'  - uwaga: {rel(p)} — koordynatorzy ze spisu i spoza; na stronie najpierw ze spisu (kolejność może się zmienić)')
            nowe = (lista_yaml('prowadzacy_ze_spisu', ze) if ze else []) + (lista_yaml('prowadzacy_spoza', spoza) if spoza else [])
            linie[b[0]:b[1]] = nowe
            zapisz_naglowek(p, t, eol, linie, pocz, kon)
    else:
        raise SystemExit(f'migruj: {repo} — brak pól do migracji (Web-Studia ma już wybór; Web-Aktualnosci zostaje tekstem)')
    for pole, s in licz.items():
        raport.append(f'  = {repo} · {pole}: ' + ', '.join(f'{k} {v}' for k, v in s.items()))
    return licz


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'inwentarz':
        inwentarz(sys.argv[2])
    elif cmd == 'migruj' and len(sys.argv) > 3:
        raport = []
        for repo in sys.argv[3:]:
            migruj(sys.argv[2], repo, raport)
        print('\n'.join(raport))
    else:
        print(__doc__)
        sys.exit(2)
