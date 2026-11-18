#!/usr/bin/env python3
"""Zlecenie 31, etap 2c: aktualności — pola wydarzenie_poczatek / _koniec / _miejsce → grupa `termin` (najwyżej jedna pozycja).

Każdy wpis z polami wydarzenie_* dostaje w ich miejscu `termin` z polami dzien, godzina, dzien_konca, godzina_konca, miejsce,
a stare pola znikają. Wartości przenoszone są dokładnie: koniec tego samego dnia tylko jako godzina_konca, koniec bez godziny
w innym dniu jako dzien_konca. Skrypt sprawdza, że z nowego zapisu strona wyliczy dokładnie te same daty co ze starego
(ta sama reguła co w src/content.config.ts), z wyjątkiem trzech wpisów z 16.11 z datami wpisanymi przez CMS (WYJATKI).
Przy okazji usuwa z list (galeria, zalaczniki) całkiem puste pozycje „- {}” — nie ma w nich żadnej wartości.

Plik zmieniany jest tylko w tych liniach; styl wartości (cudzysłowy) jak w danym pliku. Skrypt jest powtarzalny: uruchomiony
na świeżym main migruje to, co zostało; plik, który ma już `termin` i jednocześnie wydarzenie_*, zatrzymuje skrypt.

Uruchomienie:  python skrypty/migracja/termin.py <katalog Web-Aktualnosci> [--sprawdz] [--decyzje]
  --sprawdz  nic nie zapisuje, tylko wypisuje plan.
  --decyzje  zamiast migracji: decyzje właściciela o innych polach (DECYZJE), osobny commit po migracji.
"""
import json
import re
import sys
from pathlib import Path

import yaml

POLA = ('wydarzenie_poczatek', 'wydarzenie_koniec', 'wydarzenie_miejsce')

# Trzy wpisy z 16.11 (decyzja właściciela w zleceniu 31): CMS wpisał w nich datę i godzinę otwarcia formularza.
# Zmiana tylko wtedy, gdy wartości są wciąż te z CMS (stan z etapu 0); inne wartości = redaktor coś poprawił → stop.
WYJATKI = {
    # „SEMINARIUM WYDZIAŁOWE…”: termin z treści wpisu („we wtorek 10 listopada o godz. 13:00”), bez końca
    '2026-11-16-.md': ({'wydarzenie_poczatek': '2026-11-10T21:28', 'wydarzenie_koniec': '2026-11-16T21:28',
                        'wydarzenie_miejsce': 'Instytut Informatyki sala 119'},
                       {'dzien': '2026-11-10', 'godzina': '13:00', 'miejsce': 'Instytut Informatyki sala 119'}),
    # „Stypendium im. Steinhausa…” (sukces): bez terminu — dzień jest w polu „Data”
    '2026-11-16--1.md': ({'wydarzenie_poczatek': '2026-11-11T21:35', 'wydarzenie_koniec': '2026-11-16T21:35'}, None),
    # „Medale Uniwersytetu…”: bez terminu; miejsce „Aula Leopoldina” przepada (zgłoszone w raporcie)
    '2026-11-16--2.md': ({'wydarzenie_poczatek': '2026-11-13T22:02', 'wydarzenie_koniec': '2026-11-13T22:02',
                          'wydarzenie_miejsce': 'Aula Leopoldina'}, None),
}
KOLEJNOSC = ('dzien', 'godzina', 'dzien_konca', 'godzina_konca', 'miejsce')

# Decyzje właściciela o innych polach tych wpisów: (pole, wartość przed decyzją, nowa wartość). Stosowane osobnym
# uruchomieniem z --decyzje (osobny commit), tylko gdy pole ma wciąż wartość sprzed decyzji; inna wartość = stop.
DECYZJE = {
    # „Medale…”: bez terminu nie są wydarzeniem → rodzaj „sukces” (właściciel 18.11, pytanie 2 raportu zlecenia 31;
    # „wydarzenie” ustawił redaktor 17.11 o 22:27)
    '2026-11-16--2.md': ('rodzaj', 'wydarzenie', 'sukces'),
}


def tekst(v):
    if v is None:
        return ''
    if hasattr(v, 'isoformat'):
        return v.isoformat()
    return str(v).strip()


def termin_ze_starych(st):
    """Stare pola → pozycja terminu."""
    p, k, m = st.get('wydarzenie_poczatek', ''), st.get('wydarzenie_koniec', ''), st.get('wydarzenie_miejsce', '')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?', p):
        raise SystemExit(f'nieoczekiwany początek {p!r}')
    t = {'dzien': p[:10]}
    if len(p) > 10:
        t['godzina'] = p[11:16]
    if k:
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?', k):
            raise SystemExit(f'nieoczekiwany koniec {k!r}')
        if k[:10] != p[:10]:
            t['dzien_konca'] = k[:10]
        if len(k) > 10:
            t['godzina_konca'] = k[11:16]
        elif k[:10] == p[:10] and len(p) > 10:
            raise SystemExit(f'koniec bez godziny w dniu początku z godziną: {p} → {k}')
    if m:
        t['miejsce'] = m
    return t


def pola_wydarzenia(t):
    """Ta sama reguła co w src/content.config.ts (polaWydarzenia)."""
    w = {'wydarzenie_poczatek': t['dzien'] + (f"T{t['godzina']}" if t.get('godzina') else '')}
    if t.get('dzien_konca'):
        w['wydarzenie_koniec'] = t['dzien_konca'] + (f"T{t['godzina_konca']}" if t.get('godzina_konca') else '')
    elif t.get('godzina_konca'):
        w['wydarzenie_koniec'] = f"{t['dzien']}T{t['godzina_konca']}"
    if t.get('miejsce'):
        w['wydarzenie_miejsce'] = t['miejsce']
    return w


ZWYKLY = re.compile(r"[^\s\"'#&*!|>%@`{}\[\],?:-][^#]*")


def wartosc_yaml(v, cudzyslow):
    if cudzyslow:
        return json.dumps(v, ensure_ascii=False)
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}|\d{2}:\d{2}', v):
        return v  # jak zapisuje Pages CMS (YAML 1.2): data i godzina bez cudzysłowu
    if ZWYKLY.fullmatch(v) and ': ' not in v and not v.endswith((' ', ':')) \
            and yaml.safe_load(v) == v and not re.fullmatch(r'[-+.\d][\d.eE_+-]*|true|false|null|yes|no|on|off|~', v, re.I):
        return v
    return json.dumps(v, ensure_ascii=False)


def blok_terminu(t, cudzyslow):
    linie = ['termin:']
    for i, k in enumerate(k for k in KOLEJNOSC if t.get(k)):
        linie.append(('  - ' if i == 0 else '    ') + f'{k}: {wartosc_yaml(t[k], cudzyslow)}')
    return [l + '\n' for l in linie]


def migruj(sciezka, sprawdz):
    calosc = sciezka.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?\n)---\n', calosc, re.S)
    if not m:
        return None
    fm = m.group(1)
    dane = yaml.load(fm, Loader=Wczytywacz) or {}
    linie = fm.splitlines(keepends=True)
    puste = [i for i, l in enumerate(linie) if re.fullmatch(r'\s+- \{\}\s*', l)]
    stare = {k: tekst(dane.get(k)) for k in POLA if k in dane}
    if not stare and not puste:
        return None
    if stare and 'termin' in dane:
        raise SystemExit(f'{sciezka.name}: ma już termin i jednocześnie {", ".join(stare)} — sprawdź ręcznie')

    # linie pól wydarzenie_* (z ewentualnymi liniami kontynuacji wartości)
    do_usuniecia = set(puste)
    pierwsza = None
    for i, l in enumerate(linie):
        if re.match(r'(%s):' % '|'.join(POLA), l):
            pierwsza = i if pierwsza is None else pierwsza
            do_usuniecia.add(i)
            j = i + 1
            while j < len(linie) and linie[j].startswith(' '):
                do_usuniecia.add(j)
                j += 1
    # lista, która po usunięciu pustych pozycji nie ma już żadnej pozycji — znika też klucz
    for i, l in enumerate(linie):
        if re.fullmatch(r'[a-z_]+:\s*', l):
            j = i + 1
            pozycje = []
            while j < len(linie) and linie[j].startswith(' '):
                pozycje.append(j)
                j += 1
            if pozycje and all(p in do_usuniecia for p in pozycje):
                do_usuniecia.add(i)

    termin = None
    opis = ''
    if stare:
        if sciezka.name in WYJATKI:
            oczekiwane, termin = WYJATKI[sciezka.name]
            if stare != oczekiwane:
                raise SystemExit(f'{sciezka.name}: wartości {stare} różnią się od stanu z etapu 0 {oczekiwane} — '
                                 'redaktor coś zmienił, decyzja właściciela potrzebna')
            opis = 'WYJĄTEK (zmiana do akceptacji)'
        else:
            termin = termin_ze_starych(stare)
            if pola_wydarzenia(termin) != stare:
                raise SystemExit(f'{sciezka.name}: zapis terminu nie odtwarza starych dat: {pola_wydarzenia(termin)} ≠ {stare}')
            opis = 'bez zmian na stronie'
    cudzyslow = bool(re.search(r'^wydarzenie_poczatek: "', fm, re.M))
    nowe = []
    for i, l in enumerate(linie):
        if i == pierwsza and termin:
            nowe += blok_terminu(termin, cudzyslow)
        if i not in do_usuniecia:
            nowe.append(l)
    nowy_fm = ''.join(nowe)
    # kontrola: poza zmienianymi polami frontmatter identyczny
    przed = {k: v for k, v in dane.items() if k not in POLA}
    po = yaml.load(nowy_fm, Loader=Wczytywacz) or {}
    po_bez = {k: v for k, v in po.items() if k != 'termin'}
    for k in ('galeria', 'zalaczniki'):
        if isinstance(przed.get(k), list):
            przed[k] = [x for x in przed[k] if x != {}] or None
            if przed[k] is None:
                del przed[k]
    if przed != po_bez:
        raise SystemExit(f'{sciezka.name}: migracja zmieniła inne pola')
    wczytany = [{k: tekst(v) for k, v in x.items()} for x in po.get('termin') or []]
    if termin and wczytany != [termin]:
        raise SystemExit(f'{sciezka.name}: blok terminu wczytuje się inaczej: {po.get("termin")}')
    if not sprawdz:
        sciezka.write_text(calosc[:m.start(1)] + nowy_fm + calosc[m.end(1):], encoding='utf-8', newline='\n')
    return stare, termin, opis, len(puste)


class Wczytywacz(yaml.SafeLoader):
    """YAML 1.2 jak w Pages CMS i Astro: „13:00” to tekst (PyYAML/YAML 1.1 czyta liczbę 780)."""


def _bez_szescdziesiatkowych(typ):
    def konstruktor(loader, node):
        if ':' in str(node.value):
            return loader.construct_scalar(node)
        return getattr(yaml.SafeLoader, f'construct_yaml_{typ}')(loader, node)
    return konstruktor


Wczytywacz.add_constructor('tag:yaml.org,2002:int', _bez_szescdziesiatkowych('int'))
Wczytywacz.add_constructor('tag:yaml.org,2002:float', _bez_szescdziesiatkowych('float'))


def decyzje(kat, sprawdz):
    """Decyzje właściciela (DECYZJE): jedna linia pola w frontmatterze."""
    for nazwa, (pole, stara, nowa) in DECYZJE.items():
        p = kat / nazwa
        if not p.exists():
            raise SystemExit(f'{nazwa}: brak pliku — sprawdź ręcznie (redaktor mógł go usunąć lub przemianować)')
        calosc = p.read_text(encoding='utf-8')
        m = re.match(r'^---\n(.*?\n)---\n', calosc, re.S)
        w = re.search(rf'^{pole}: *(.*?) *$', m.group(1), re.M) if m else None
        obecna = (w.group(1).strip('"\'') if w else None)
        if obecna == nowa:
            print(f'{nazwa}: {pole} już „{nowa}”')
            continue
        if obecna != stara:
            raise SystemExit(f'{nazwa}: {pole} = {obecna!r}, a nie {stara!r} — redaktor coś zmienił, decyzja właściciela potrzebna')
        if not sprawdz:
            fm = m.group(1)[:w.start()] + f'{pole}: {nowa}' + m.group(1)[w.end():]
            p.write_text(calosc[:m.start(1)] + fm + calosc[m.end(1):], encoding='utf-8', newline='\n')
        print(f'{nazwa}: {pole} „{stara}” → „{nowa}”')


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    kat = Path(sys.argv[1]) / 'src' / 'content' / 'aktualnosci'
    sprawdz = '--sprawdz' in sys.argv
    sys.stdout.reconfigure(encoding='utf-8')
    if '--decyzje' in sys.argv:
        return decyzje(kat, sprawdz)
    n = 0
    for p in sorted(kat.glob('*.md')):
        w = migruj(p, sprawdz)
        if w is None:
            continue
        stare, termin, opis, puste = w
        n += bool(stare)
        if stare:
            print(f'{p.name}: {stare} → termin {termin} [{opis}]')
        if puste:
            print(f'{p.name}: usunięte puste pozycje list: {puste}')
    print(f'{"Plan" if sprawdz else "Przeniesione"}: {n} wpisów.')


if __name__ == '__main__':
    main()
