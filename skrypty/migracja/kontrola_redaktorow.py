#!/usr/bin/env python3
"""Zlecenie 31, „Ochrona zmian redaktorów”: kontrola pole po polu przed pushem do repozytorium treści i po nim.

  przed  Każdy zapis na origin/main od bazy (redaktorzy, właściciel, inna sesja: wszystko, czego nie wypchnął Code w tym
         zleceniu) i każdy plik, który zmienił: wersja z origin/main porównana pole po polu z wersją wypychaną (--wynik).
         Każda wartość musi być w wyniku bez zmian albo przeniesiona zgodnie z migracją (wydarzenie_* → termin, puste
         pozycje list „- {}” usunięte, „pozycja: false” dopisane, decyzje właściciela z termin.py: WYJATKI, DECYZJE,
         PRZEMIANOWANIA).
         Inaczej STOP (kod wyjścia 1).
         Najpierw: czy wynik powstał na najświeższym origin/main (inaczej: migracja jeszcze raz na świeżym main).
  po     Całe repozytorium przed pushem (--przed, HEAD origin/main sprzed pusha) i po nim (--po, domyślnie HEAD):
         lista zmienionych pól z liczbą plików; zmiana spoza migracji = kod wyjścia 1.

Uruchomienie (najpierw git fetch w repozytorium):
  python skrypty/migracja/kontrola_redaktorow.py przed <repozytorium> [--wynik REF] [--baza REF] [--dopisane POLE=WARTOŚĆ]
  python skrypty/migracja/kontrola_redaktorow.py po <repozytorium> --przed REF [--po REF] [--dopisane POLE=WARTOŚĆ] [--pomin POLE]
Domyślnie: --wynik HEAD, --baza = wspólny przodek wyniku i origin/main (baza z etapu 0), --po HEAD.
--dopisane (zlecenie 33: opublikowany=true): pole najwyższego poziomu z tą wartością = pole bez wartości (migracja dopisała
jawną wartość domyślną). Każda inna wartość, np. „opublikowany: false” redaktora, jest porównywana jak zwykle. Opcję można
podać kilka razy (zlecenie 40: --dopisane format_tresci=jawne).
--jawne (zlecenie 40, migracja do jawnego Markdownu): Treść i Treść EN porównywane jako tekst po migracji — bez komentarzy
<!-- … --> i bez {#id} na końcu nagłówków, z białymi znakami zwiniętymi do spacji. Każde słowo redaktora musi być w wyniku.
--pomin POLE (zlecenie 40, etap 6): pole usunięte albo zmienione decyzją właściciela (ścieżka z kropkami, np. przyciski,
baner.kadr, naglowki_podstron.zdjecia) — pomijane po obu stronach porównania. Opcję można podać kilka razy.
"""
import copy
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import yaml

from termin import DECYZJE, POLA, PRZEMIANOWANIA, WYJATKI, Wczytywacz, pola_wydarzenia, tekst

DANE = re.compile(r'\.(md|json|ya?ml)$')
DOPISANE: list[tuple[str, object]] = []  # --dopisane: (pole, wartość), np. ('opublikowany', True)
JAWNE = False  # --jawne: Treść i Treść EN jako tekst po migracji do jawnego Markdownu
POMIN: list[str] = []  # --pomin: pola z decyzji właściciela (ścieżki z kropkami), pomijane w porównaniu


def bez_sciezki(d, sciezka):
    """Usuwa pole o ścieżce z kropkami (np. baner.kadr) z dict d (w miejscu); brak pola = bez zmian."""
    *rodzice, ostatni = sciezka.split('.')
    for r in rodzice:
        d = d.get(r) if isinstance(d, dict) else None
    if isinstance(d, dict):
        d.pop(ostatni, None)


def tekst_jawny(t):
    """Tekst Markdownu bez dopisków migracji do jawnego formatu (komentarze, {#id} przy nagłówkach), białe znaki zwinięte."""
    t = re.sub(r'<!--.*?-->', ' ', str(t), flags=re.S)
    t = re.sub(r'(?m)^(#{2,6}\s.*?)\s+\{#[^}\s]+\}\s*$', r'\1', t)
    return re.sub(r'\s+', ' ', t).strip()


def git(repo, *arg, ok=False):
    w = subprocess.run(['git', '-C', str(repo), *arg], capture_output=True, encoding='utf-8')
    if w.returncode and not ok:
        raise SystemExit(f'git {" ".join(arg)}: {w.stderr.strip()}')
    return w.stdout if not w.returncode else None


def wczytaj(repo, ref, sciezka):
    """Dane pliku w danej wersji (frontmatter + body / JSON / YAML) albo None, gdy pliku nie ma."""
    t = git(repo, 'show', f'{ref}:{sciezka}', ok=True)
    if t is None:
        return None
    if sciezka.endswith('.md'):
        m = re.match(r'^---\r?\n(.*?)\r?\n---(?:\r?\n(.*))?$', t, re.S)
        if not m:
            return {'body': t}
        dane = yaml.load(m.group(1), Loader=Wczytywacz) or {}
        dane['body'] = re.sub(r'^\r?\n', '', m.group(2) or '')
        return dane
    if sciezka.endswith('.json'):
        import json
        return json.loads(t) if t.strip() else {}
    return yaml.load(t, Loader=Wczytywacz) or {}


def skalar(v):
    return v.isoformat() if hasattr(v, 'isoformat') else v


def porownawczo(sciezka, dane):
    """Postać do porównania: termin → wyliczone wydarzenie_* (ta sama reguła co strona), bez „pozycja: false”,
    bez pustych pozycji list i pustych wartości (Pages CMS je usuwa), daty jako tekst."""
    def czysc(v):
        if isinstance(v, dict):
            o = {k: czysc(x) for k, x in v.items() if not (k == 'pozycja' and x is False)}
            return {k: x for k, x in o.items() if x not in (None, '', [], {})}
        if isinstance(v, list):
            return [x for x in (czysc(x) for x in v) if x not in (None, '', [], {})]
        return skalar(v)
    if not isinstance(dane, dict):
        return czysc(dane)
    d = copy.deepcopy(dane) if POMIN else dict(dane)
    for p in POMIN:
        bez_sciezki(d, p)
    for k, v in DOPISANE:
        if k in d and d[k] == v:
            del d[k]
    if JAWNE and sciezka.endswith('.md'):
        for k in ('body', 'tresc_en'):
            if isinstance(d.get(k), str):
                d[k] = tekst_jawny(d[k])
    if '/aktualnosci/' in f'/{sciezka}' and isinstance(d.get('termin'), list):
        t = [x for x in d.pop('termin') if isinstance(x, dict) and x.get('dzien')]
        if t:
            d.update(pola_wydarzenia({k: tekst(v) for k, v in t[0].items() if k != 'pozycja' and tekst(v)}))
    for k in POLA:
        if k in d:
            d[k] = tekst(d[k])
    return czysc(d)


def liscie(v, sciezka=''):
    if isinstance(v, dict):
        for k, x in v.items():
            yield from liscie(x, f'{sciezka}.{k}' if sciezka else k)
    elif isinstance(v, list):
        for i, x in enumerate(v):
            yield from liscie(x, f'{sciezka}[{i}]')
    else:
        yield sciezka, v


def roznice(a, b):
    la, lb = dict(liscie(a)), dict(liscie(b))
    return [(k, la.get(k), lb.get(k)) for k in sorted(set(la) | set(lb)) if la.get(k) != lb.get(k)]


def wyjatek(sciezka, przed, po):
    """Jeden z trzech wpisów z 16.11 zmieniony zgodnie z decyzją właściciela (termin.py, WYJATKI)."""
    nazwa = Path(sciezka).name
    if nazwa not in WYJATKI or przed is None or po is None:
        return False
    stare, termin = WYJATKI[nazwa]
    if {k: tekst(przed[k]) for k in POLA if k in przed} != stare:
        return False
    nowy = [{k: tekst(v) for k, v in x.items() if k != 'pozycja'} for x in po.get('termin') or []]
    if nowy != ([termin] if termin else []) or any(k in po for k in POLA):
        return False
    bez = lambda d: {k: v for k, v in d.items() if k not in POLA and k != 'termin'}  # noqa: E731
    return porownawczo(sciezka, bez(przed)) == porownawczo(sciezka, bez(po))


def po_decyzji(sciezka, dane):
    """Wersja redaktora z naniesioną decyzją właściciela (termin.py, DECYZJE) — tylko gdy pole ma wartość sprzed decyzji."""
    d = DECYZJE.get(Path(sciezka).name)
    if d and isinstance(dane, dict) and dane.get(d[0]) == d[1]:
        return {**dane, d[0]: d[2]}
    return dane


def nowa_sciezka(sciezka):
    """Ścieżka pliku po przemianowaniu z decyzji właściciela (termin.py, PRZEMIANOWANIA) albo ta sama."""
    nowa = PRZEMIANOWANIA.get(Path(sciezka).name)
    return str(Path(sciezka).with_name(nowa).as_posix()) if nowa else sciezka


def skrot(v):
    s = repr(v)
    return s if len(s) <= 90 else s[:87] + '…'


def przed_pushem(repo, wynik, baza):
    gora = git(repo, 'rev-parse', 'origin/main').strip()
    wynik_h = git(repo, 'rev-parse', wynik).strip()
    baza = git(repo, 'rev-parse', baza).strip() if baza else git(repo, 'merge-base', wynik_h, gora).strip()
    print(f'{repo.name}: baza {baza[:7]}, origin/main {gora[:7]}, wynik {wynik} {wynik_h[:7]}')
    zapisy = git(repo, 'log', '--reverse', '--format=%H\t%an\t%ad\t%s', '--date=format:%Y-%m-%d %H:%M',
                 f'{baza}..{gora}').splitlines()
    if not zapisy:
        print('  Zapisów od bazy: 0.')
    if git(repo, 'merge-base', '--is-ancestor', gora, wynik_h, ok=True) is None:
        print(f'  STOP: wynik nie zawiera origin/main ({len(zapisy)} nowych zapisów od bazy). Przełącz się na świeży main '
              'i uruchom migrację jeszcze raz (nie doklejaj starego wyniku).')
        return 1
    stop = 0
    for z in zapisy:
        h, autor, kiedy, temat = z.split('\t', 3)
        print(f'  {h[:7]} {kiedy} {autor}: {temat}')
        zmiany = git(repo, 'diff-tree', '--no-commit-id', '-r', '--no-renames', '--name-status', h).splitlines()
        if not zmiany:
            print('    (zapis bez zmian w plikach)')
        for linia in zmiany:
            stan, sciezka = linia.split('\t', 1)
            if sciezka == '.pages.yml':
                print(f'    {sciezka}: zmiana konfiguracji przez redaktora — STOP, sprawdź ręcznie')
                stop += 1
                continue
            if not DANE.search(sciezka):
                ten = git(repo, 'rev-parse', f'{gora}:{sciezka}', ok=True)
                tam = git(repo, 'rev-parse', f'{wynik_h}:{sciezka}', ok=True)
                print(f'    {sciezka}: {"OK (ten sam plik)" if ten == tam else "RÓŻNY — STOP"}')
                stop += ten != tam
                continue
            # wersja redaktora = najnowsza na origin/main (kolejne zapisy mogły ją jeszcze zmienić)
            red, wyn = wczytaj(repo, gora, sciezka), wczytaj(repo, wynik_h, sciezka)
            nowa = nowa_sciezka(sciezka)
            if wyn is None and nowa != sciezka:
                wyn = wczytaj(repo, wynik_h, nowa)
                if wyn is not None:
                    print(f'    (w wyniku przemianowany na {Path(nowa).name}, decyzja właściciela)')
            if red is None or wyn is None:
                zgodne = red is None and wyn is None
                print(f'    {stan} {sciezka}: {"OK (usunięty)" if zgodne else "w wyniku " + ("brak pliku" if wyn is None else "plik jest, a redaktor go usunął")}'
                      + ('' if zgodne else ' — STOP'))
                stop += not zgodne
                continue
            decyzja = po_decyzji(sciezka, red) is not red
            red = po_decyzji(sciezka, red)
            r = roznice(porownawczo(sciezka, red), porownawczo(sciezka, wyn))
            if not r:
                print(f'    {stan} {sciezka}: OK' + (' — z decyzją właściciela (DECYZJE)' if decyzja else ''))
            elif wyjatek(sciezka, red, wyn):
                print(f'    {stan} {sciezka}: OK — wyjątek z decyzji właściciela (wpis z 16.11)')
            else:
                stop += 1
                print(f'    {stan} {sciezka}: STOP')
                for k, a, b in r:
                    print(f'      {k}: redaktor {skrot(a)} → wynik {skrot(b)}')
    print(f'  Wynik: {"STOP — " + str(stop) + " plików do wyjaśnienia" if stop else "OK, wszystkie wartości redaktorów są w wyniku"}')
    return 1 if stop else 0


def po_pushu(repo, przed, po):
    a, b = git(repo, 'rev-parse', przed).strip(), git(repo, 'rev-parse', po).strip()
    print(f'{repo.name}: przed {a[:7]} → po {b[:7]}')
    pola = defaultdict(set)
    zle = 0
    pliki = git(repo, 'diff', '--no-renames', '--name-status', a, b).splitlines()
    # przemianowania z decyzji właściciela: usunięty stary plik + dodany nowy = jeden zmieniony plik
    dodane = {l.split('\t', 1)[1] for l in pliki if l.startswith('A\t')}
    pary = {}
    for l in pliki:
        st, sc = l.split('\t', 1)
        if st == 'D' and nowa_sciezka(sc) != sc and nowa_sciezka(sc) in dodane:
            pary[sc] = nowa_sciezka(sc)
    pliki = [l for l in pliki if l.split('\t', 1)[1] not in pary.values()]
    wszystkie = [p for p in git(repo, 'ls-tree', '-r', '--name-only', b).splitlines() if DANE.search(p) and p != '.pages.yml']
    for linia in pliki:
        stan, sciezka = linia.split('\t', 1)
        if sciezka == '.pages.yml':
            print('  .pages.yml: zmieniona konfiguracja formularzy (celowo)')
            continue
        if not DANE.search(sciezka):
            print(f'  {stan} {sciezka}: plik spoza danych — sprawdź')
            zle += 1
            continue
        da, db = wczytaj(repo, a, sciezka), wczytaj(repo, b, pary.get(sciezka, sciezka))
        if sciezka in pary:
            pola['(nazwa pliku)'].add(sciezka)
            print(f'  {Path(sciezka).name} → {Path(pary[sciezka]).name}: przemianowany (decyzja właściciela)')
        if da is None or db is None:
            print(f'  {stan} {sciezka}: plik {"dodany" if da is None else "usunięty"} — niedozwolone')
            zle += 1
            continue
        for k in sorted(set(da) | set(db)):
            if da.get(k) != db.get(k):
                pola[k].add(sciezka)
        da = po_decyzji(sciezka, da)
        if roznice(porownawczo(sciezka, da), porownawczo(sciezka, db)) and not wyjatek(sciezka, da, db):
            zle += 1
            print(f'  {sciezka}: zmiana spoza migracji')
            for k, x, y in roznice(porownawczo(sciezka, da), porownawczo(sciezka, db)):
                print(f'    {k}: {skrot(x)} → {skrot(y)}')
    zmienione = len({s for p in pola.values() for s in p})
    print(f'  Plików danych: {len(wszystkie)}, zmienionych: {zmienione}. Zmienione pola (liczba plików):')
    for k, s in sorted(pola.items()):
        print(f'    {k}: {len(s)}')
    wyj = [s for s in {s for p in pola.values() for s in p} if Path(s).name in WYJATKI or Path(s).name in DECYZJE
           or Path(s).name in PRZEMIANOWANIA]
    if wyj:
        print(f'  W tym wyjątki i decyzje właściciela: {", ".join(sorted(Path(s).name for s in wyj))}')
    print(f'  Wynik: {"NIEDOZWOLONE ZMIANY: " + str(zle) if zle else "OK, tylko zmiany z migracji"}')
    return 1 if zle else 0


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    arg = sys.argv[1:]
    if len(arg) < 2 or arg[0] not in ('przed', 'po'):
        raise SystemExit(__doc__)
    opcja = lambda n, d=None: arg[arg.index(n) + 1] if n in arg else d  # noqa: E731
    repo = Path(arg[1]).resolve()
    for i, a in enumerate(arg[:-1]):
        if a == '--dopisane':
            k, v = arg[i + 1].split('=', 1)
            DOPISANE.append((k, yaml.safe_load(v)))
    global JAWNE
    JAWNE = '--jawne' in arg
    POMIN.extend(arg[i + 1] for i, a in enumerate(arg[:-1]) if a == '--pomin')
    if arg[0] == 'przed':
        sys.exit(przed_pushem(repo, opcja('--wynik', 'HEAD'), opcja('--baza')))
    if not opcja('--przed'):
        raise SystemExit('po: podaj --przed <HEAD origin/main sprzed pusha>')
    sys.exit(po_pushu(repo, opcja('--przed'), opcja('--po', 'HEAD')))


if __name__ == '__main__':
    main()
