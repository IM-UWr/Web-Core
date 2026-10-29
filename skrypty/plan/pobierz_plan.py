#!/usr/bin/env python3
"""Pobiera plan zajęć Instytutu Matematycznego UWr z USOS i zapisuje src/data/plan/plan.json.

Wszystko działa anonimowo — bez klucza USOS API, bez logowania i bez dostępu do serwerów UWr:

1. Eksport planu w USOSweb: https://usosweb.uwr.edu.pl/planIM.php?cdyd_kod=<semestr>
   (ten sam, z którego od lat korzysta stary plan math.uni.wroc.pl/studia/plany_zajec/planZ.php;
   jeden wiersz = grupa | typ | kod | nazwa | imię | nazwisko | częstotliwość | dzień | godziny | sala | uwagi).
2. Publiczne metody USOS API (https://usosapps.uwr.edu.pl/services/):
   terms/terms_index (semestry), courses/courses (angielskie nazwy przedmiotów),
   courses/classtypes_index (nazwy typów zajęć). Gdy eksport (1) nie działa, plan składany jest
   awaryjnie z API: courses/search + tt/course_edition + courses/course_edition (bez kolumny „uwagi”).

Domyślnie pobierany jest bieżący i następny semestr. Jeśli USOS nie odpowiada, dane semestru zostają
z poprzedniego pliku (nic nie jest kasowane), a skrypt kończy się kodem 0 z ostrzeżeniem.
Data „zaktualizowano” zmienia się tylko wtedy, gdy zmieniły się same dane, więc plik nie zmienia się
przy każdym uruchomieniu.

Użycie:
  python3 skrypty/plan/pobierz_plan.py [--zrodlo auto|eksport|api] [--semestr 2026/27-Z ...] [--wyjscie PLIK]
"""
import argparse
import datetime as dt
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

try:
    from zoneinfo import ZoneInfo
    STREFA = ZoneInfo('Europe/Warsaw')
except Exception:  # starszy Python bez bazy stref — czas UTC
    STREFA = dt.timezone.utc

KATALOG_REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DOMYSLNY_PLIK = os.path.join(KATALOG_REPO, 'src', 'data', 'plan', 'plan.json')

USOSWEB = ('https://usosweb.uwr.edu.pl', 'http://usosweb.uwr.edu.pl')
EKSPORT = '/planIM.php?cdyd_kod={semestr}'
API = 'https://usosapps.uwr.edu.pl/services/'
LINK_PRZEDMIOTU = 'https://usosweb.uwr.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazPrzedmiot&prz_kod='
UA = 'IM-UWr-plan-zajec/1.0 (+https://github.com/IM-UWr/Web-Core)'

# Które przedmioty trafiają do planu — tak jak w starym planie (plan.class.php):
# kody 28-MT-S-…, bez 28-MT-S-x… (rady, seminaria zakładów, rezerwacje sal itp.).
PREFIKS = '28-MT-S-'
POMIJANE_LITERY = ('x',)

# Kategoria przedmiotu = litera po prefiksie kodu (wielkość liter bez znaczenia), jak w starym planie.
KATEGORIE = [
    ('O', 'o', 'Przedmioty obowiązkowe (O)', 'Compulsory courses (O)'),
    ('L', 'l', 'Standardowe przedmioty do wyboru (L)', 'Standard elective courses (L)'),
    ('M', 't', 'Zaawansowane przedmioty do wyboru (M)', 'Advanced elective courses (M)'),
    ('E', 'e', 'Zaawansowane przedmioty do wyboru (M): przedmioty niestandardowe (E)', 'Advanced electives (M): non-standard courses (E)'),
    ('S', 'q', 'Zaawansowane przedmioty do wyboru (M): seminaria przeglądowe (S)', 'Advanced electives (M): survey seminars (S)'),
    ('H', 'h', 'Przedmioty z zakresu nauk humanistycznych i społecznych (H)', 'Humanities and social sciences (H)'),
    ('N', 'u', 'Przedmioty dla specjalności nauczycielskiej (N)', 'Courses for the teacher-training specialisation (N)'),
    ('NP', 'b', 'Przedmioty z zakresu nauk przyrodniczych (NP)', 'Natural sciences (NP)'),
    ('inne', None, 'Pozostałe przedmioty', 'Other courses'),
]
KOLEJNOSC_KATEGORII = [k[0] for k in KATEGORIE]

# Nazwy typów zajęć (z courses/classtypes_index; uzupełniane z API przy każdym uruchomieniu).
TYPY = {
    'WYK': ('Wykład', 'Lecture'), 'CW': ('Ćwiczenia', 'Class'), 'CW2': ('Ćwiczenia', 'Class'),
    'KONW': ('Konwersatorium', 'Conversatorium'), 'KONW2': ('Konwersatorium', 'Conversatorium'),
    'LAB': ('Laboratorium', 'Lab'), 'PRAC': ('Pracownia', 'Lab'), 'SEM': ('Seminarium', 'Seminar'),
    'SEM-MGR': ('Seminarium magisterskie', 'Master Degree Seminar'), 'SEM-PRO': ('Proseminarium', 'Proseminar'),
    'WAR': ('Warsztat', 'Workshop'), 'LEK': ('Lektorat', 'Foreign language class'),
    'PRK-PED': ('Praktyki pedagogiczne', 'Pedagogical Practice'), 'EGZ': ('Egzamin', 'Examination'),
    'KON': ('Konsultacje nieobowiązkowe', 'Consultation'), 'MOD': ('Moduł', 'Module'),
}
# W USOS konwersatorium ma po angielsku nazwę „Seminar” — zostawiamy własną, żeby nie myliła się z seminarium.
NADPISANE_EN = {'KONW': 'Conversatorium', 'KONW2': 'Conversatorium'}
KOLEJNOSC_TYPOW = ['WYK', 'KONW', 'KONW2', 'CW', 'CW2', 'LAB', 'PRAC', 'SEM-PRO', 'SEM', 'SEM-MGR', 'WAR', 'LEK', 'PRK-PED', 'MOD', 'KON', 'EGZ']

DNI = ['PONIEDZIAŁEK', 'WTOREK', 'ŚRODA', 'CZWARTEK', 'PIĄTEK', 'SOBOTA', 'NIEDZIELA']
CZESTOTLIWOSC_EKSPORT = {
    'CO_TYDZIEN': 'co_tydzien', 'CO_DWA_TYG_NIEPARZ': 'nieparzyste', 'CO_DWA_TYG_PARZ': 'parzyste',
    'CO_DWA_TYG': 'co_dwa_tygodnie', 'INNA_CZESTOTLIWOSC': 'inna', 'JEDNORAZOWO': 'raz', 'CO_MIESIAC': 'co_miesiac',
}
CZESTOTLIWOSC_API = {
    'every_week': 'co_tydzien', 'every_fortnight': 'co_dwa_tygodnie', 'every_fortnight_odd': 'nieparzyste',
    'every_fortnight_even': 'parzyste', 'every_month': 'co_miesiac', 'once': 'raz', 'other': 'inna',
}


ALFABET_PL = 'aąbcćdeęfghijklłmnńoóprsśtuvwxyzźż'
OSTRZEZENIA = []


def ostrzez(tekst):
    OSTRZEZENIA.append(tekst)
    if os.environ.get('GITHUB_ACTIONS'):
        print(f'::warning title=Plan zajęć::{tekst}', file=sys.stderr)
    else:
        print(f'UWAGA: {tekst}', file=sys.stderr)


def klucz_pl(s):
    wynik = []
    for c in (s or '').lower():
        if c in ALFABET_PL:
            wynik.append(ALFABET_PL.index(c))
        elif c.isdigit():
            wynik.append(-20 + int(c))
        elif c.isspace():
            wynik.append(-30)
        else:
            wynik.append(100 + ord(c))
    return wynik


# ---------------------------------------------------------------- sieć

def pobierz(url, timeout=40, proby=3):
    ostatni = None
    for i in range(proby):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'pl'})
            with urllib.request.urlopen(req, timeout=timeout) as odp:
                return odp.read()
        except urllib.error.HTTPError as e:
            ostatni = e
            if 400 <= e.code < 500 and e.code != 429:
                break
        except Exception as e:  # sieć, DNS, TLS, przekroczony czas
            ostatni = e
        time.sleep(2 * (i + 1))
    raise ostatni


LICZNIK_API = {'n': 0}


def api(metoda, **parametry):
    LICZNIK_API['n'] += 1
    url = API + metoda + ('?' + urllib.parse.urlencode(parametry) if parametry else '')
    return json.loads(pobierz(url).decode('utf-8'))


# ---------------------------------------------------------------- semestry

def nazwa_semestru(sid):
    m = re.fullmatch(r'(\d{4})/(\d{2})-([ZL])', sid)
    if not m:
        return sid, sid
    rok = f'{m.group(1)}/{m.group(2)}'
    return (f'Semestr zimowy {rok}', f'Winter semester {rok}') if m.group(3) == 'Z' else (f'Semestr letni {rok}', f'Summer semester {rok}')


def semestry_z_api():
    wynik = []
    for t in api('terms/terms_index'):
        if re.fullmatch(r'\d{4}/\d{2}-[ZL]', t.get('id', '')):
            nazwa = t.get('name') or {}
            pl, en = nazwa_semestru(t['id'])
            wynik.append({'id': t['id'], 'nazwa': nazwa.get('pl') or pl, 'nazwa_en': nazwa.get('en') or en,
                          'od': t.get('start_date'), 'do': t.get('end_date')})
    return sorted(wynik, key=lambda t: t['od'] or '')


def semestry_z_kalendarza(dzis):
    # Awaryjnie (gdy API nie odpowiada): semestr zimowy X–I, letni od drugiej połowy lutego.
    r, m = dzis.year, dzis.month
    if m >= 10:
        biezacy, nastepny = f'{r}/{(r + 1) % 100:02d}-Z', f'{r}/{(r + 1) % 100:02d}-L'
    elif m == 1 or (m == 2 and dzis.day < 20):
        biezacy, nastepny = f'{r - 1}/{r % 100:02d}-Z', f'{r - 1}/{r % 100:02d}-L'
    else:
        biezacy, nastepny = f'{r - 1}/{r % 100:02d}-L', f'{r}/{(r + 1) % 100:02d}-Z'
    wynik = []
    for sid in (biezacy, nastepny):
        pl, en = nazwa_semestru(sid)
        wynik.append({'id': sid, 'nazwa': pl, 'nazwa_en': en, 'od': None, 'do': None})
    return wynik


def wybierz_semestry(dzis, wskazane):
    try:
        wszystkie = semestry_z_api()
    except Exception as e:
        ostrzez(f'USOS API (terms/terms_index) nie odpowiada ({e}); semestry ustalone z kalendarza.')
        wszystkie = semestry_z_kalendarza(dzis)
        if wskazane:
            wszystkie = []
    if wskazane:
        po_id = {t['id']: t for t in wszystkie}
        wynik = []
        for sid in wskazane:
            if sid not in po_id:
                pl, en = nazwa_semestru(sid)
                po_id[sid] = {'id': sid, 'nazwa': pl, 'nazwa_en': en, 'od': None, 'do': None}
            wynik.append(po_id[sid])
        return wynik
    d = dzis.isoformat()
    rozpoczete = [t for t in wszystkie if t['od'] and t['od'] <= d]
    przyszle = [t for t in wszystkie if t['od'] and t['od'] > d]
    if not rozpoczete and not przyszle:
        return wszystkie[:2]
    return rozpoczete[-1:] + przyszle[:1]


# ---------------------------------------------------------------- wspólne przetwarzanie

def kategoria(kod):
    litera = kod[len(PREFIKS):len(PREFIKS) + 1].lower()
    for k, l, _, _ in KATEGORIE:
        if l and litera == l:
            return k
    return 'inne'


def w_planie(kod):
    return kod.upper().startswith(PREFIKS.upper()) and kod[len(PREFIKS):len(PREFIKS) + 1].lower() not in POMIJANE_LITERY


def czysc_tekst(t):
    t = html.unescape(re.sub(r'<[^>]+>', '', t)).replace('\xa0', ' ').replace('&nbsp', ' ')
    return re.sub(r'[ \t\r\f\v]+', ' ', t)


def uwagi_z_html(opis):
    """Uwagi z USOS (krótki HTML) → lista fragmentów: tekst albo {"t": tekst linku, "a": adres}."""
    s = (opis or '').strip()
    if not s:
        return []
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    fragmenty, poz = [], 0
    for m in re.finditer(r'<a\s[^>]*href\s*=\s*["\']([^"\']+)["\'][^>]*>(.*?)</a>', s, flags=re.I | re.S):
        fragmenty.append(czysc_tekst(s[poz:m.start()]))
        adres, tekst = html.unescape(m.group(1)).strip(), czysc_tekst(m.group(2)).strip()
        if re.match(r'https?://', adres):
            fragmenty.append({'t': tekst or adres, 'a': adres})
        else:
            fragmenty.append(tekst)
        poz = m.end()
    fragmenty.append(czysc_tekst(s[poz:]))
    wynik = []
    for f in fragmenty:
        if isinstance(f, str):
            f = re.sub(r' *\n[\s]*', '\n', f)
            if not f:
                continue
            if wynik and isinstance(wynik[-1], str):
                wynik[-1] += f
                continue
        wynik.append(f)
    if wynik and isinstance(wynik[0], str):
        wynik[0] = wynik[0].lstrip()
    if wynik and isinstance(wynik[-1], str):
        wynik[-1] = wynik[-1].rstrip()
    wynik = [f for f in wynik if f != '']
    return wynik


def tekst_uwag(uwagi):
    return ''.join(f if isinstance(f, str) else f['t'] for f in uwagi)


def godzina(h, m):
    h, m = (h or '').strip(), (m or '').strip()
    if not h.isdigit():
        return None
    return f'{int(h):02d}:{int(m) if m.isdigit() else 0:02d}'


def zloz_semestr(sloty, nazwy):
    """sloty: słowniki pojedynczych terminów (jeden prowadzący) → przedmioty i zajęcia po scaleniu."""
    # 1. ten sam termin, kilku prowadzących → jedno zajęcie
    scalone, kolejnosc = {}, []
    for s in sloty:
        klucz = (s['kod'], s['typ'], str(s['grupa']), s['dzien'], s['od'], s['do'], s['sala'], s['czestotliwosc'], json.dumps(s['uwagi'], ensure_ascii=False))
        if klucz not in scalone:
            scalone[klucz] = dict(s, prowadzacy=[])
            kolejnosc.append(klucz)
        if s.get('prowadzacy') and s['prowadzacy'] not in scalone[klucz]['prowadzacy']:
            scalone[klucz]['prowadzacy'].append(s['prowadzacy'])
    zajecia = [scalone[k] for k in kolejnosc]
    for z in zajecia:  # prowadzący alfabetycznie po nazwisku, jak w starym planie
        z['prowadzacy'].sort(key=lambda o: (klucz_pl(o.split()[-1]), klucz_pl(o)))
    # 2. bloki stykające się w czasie (koniec = początek następnego) → jeden blok (jak w starym planie)
    grupy, kolejnosc = {}, []
    for z in zajecia:
        klucz = (z['kod'], z['typ'], str(z['grupa']), z['dzien'], z['sala'], z['czestotliwosc'], json.dumps(z['uwagi'], ensure_ascii=False), tuple(z['prowadzacy']))
        if klucz not in grupy:
            grupy[klucz] = []
            kolejnosc.append(klucz)
        grupy[klucz].append(z)
    zajecia = []
    for klucz in kolejnosc:
        poprzedni = None
        for z in sorted(grupy[klucz], key=lambda z: z['od'] or ''):
            if poprzedni is not None and z['dzien'] is not None and poprzedni['do'] == z['od']:
                poprzedni['do'] = z['do']
                continue
            zajecia.append(z)
            poprzedni = z
    # 3. przedmioty: alfabetycznie w sekcjach (kategoriach) jak w starym planie
    przedmioty = []
    for kod in {z['kod'] for z in zajecia}:
        n = nazwy.get(kod, {})
        p = {'kod': kod, 'nazwa': n.get('pl') or kod}
        if n.get('en'):
            p['nazwa_en'] = n['en']
        p['kategoria'] = kategoria(kod)
        p['usos'] = LINK_PRZEDMIOTU + urllib.parse.quote(kod, safe='-')
        przedmioty.append(p)
    przedmioty.sort(key=lambda p: (KOLEJNOSC_KATEGORII.index(p['kategoria']), klucz_pl(p['nazwa']), p['kod']))
    pozycja = {p['kod']: i for i, p in enumerate(przedmioty)}

    # 4. zajęcia w przedmiocie — kolejność jak w plan.class.php: typ malejąco (wyk, lab, konw, ćw…),
    #    numer grupy, dzień, nazwisko prowadzącego, godzina (sortowanie stabilne, od klucza najmniej ważnego)
    def klucz_grupy(g):
        return (0, int(g), '') if str(g).isdigit() else (1, 0, str(g))

    zajecia.sort(key=lambda z: z['od'] or '')
    zajecia.sort(key=lambda z: klucz_pl(z['prowadzacy'][0].split()[-1]) if z['prowadzacy'] else [])
    zajecia.sort(key=lambda z: 9 if z['dzien'] is None else z['dzien'])
    zajecia.sort(key=lambda z: klucz_grupy(z['grupa']))
    zajecia.sort(key=lambda z: z['typ'], reverse=True)
    zajecia.sort(key=lambda z: pozycja[z['kod']])
    wynik = []
    for z in zajecia:
        w = {'kod': z['kod'], 'typ': z['typ']}
        if z['grupa'] not in (None, ''):
            w['grupa'] = z['grupa']
        if z['prowadzacy']:
            w['prowadzacy'] = z['prowadzacy']
        if z['dzien'] is not None:
            w.update(dzien=z['dzien'], od=z['od'], do=z['do'])
            if z['czestotliwosc']:
                w['czestotliwosc'] = z['czestotliwosc']
        if z['sala']:
            w['sala'] = z['sala']
        if z['uwagi']:
            w['uwagi'] = z['uwagi']
        wynik.append(w)
    return przedmioty, wynik


# ---------------------------------------------------------------- źródło 1: eksport planIM.php

class BrakDanych(Exception):
    pass


def plan_z_eksportu(semestr):
    tekst, adres, bledy = None, None, []
    for baza in USOSWEB:
        adres = baza + EKSPORT.format(semestr=semestr)
        try:
            tekst = pobierz(adres, timeout=60).decode('utf-8', errors='replace')
            break
        except Exception as e:
            bledy.append(f'{adres}: {e}')
    if tekst is None:
        raise BrakDanych('; '.join(bledy))
    if 'nr_grupy' not in tekst:
        # np. strona „Prace techniczne” w czasie przerwy w USOS — nie kasujemy wtedy planu
        raise BrakDanych(f'{adres}: odpowiedź bez nagłówka eksportu (przerwa techniczna w USOS?)')
    tresc = tekst[tekst.index('nr_grupy'):]
    tresc = tresc.split('<br><br>', 1)[1] if '<br><br>' in tresc else ''
    tresc = re.split(r'</body>', tresc, flags=re.I)[0]
    sloty, nazwy, pominiete = [], {}, 0
    for rekord in tresc.split('#<br>'):
        rekord = rekord.strip()
        if not rekord:
            continue
        p = rekord.split('|')
        if len(p) < 14:
            pominiete += 1
            continue
        grupa, typ, kod, nazwa, imie, nazwisko, czest, dzien, hp, mp, hk, mk, sala = (x.strip() for x in p[:13])
        opis = '|'.join(p[13:])
        if not w_planie(kod):
            continue
        nazwy.setdefault(kod, {})['pl'] = czysc_tekst(nazwa).strip()
        d = DNI.index(dzien.upper()) if dzien.upper() in DNI else None
        if dzien and d is None:
            ostrzez(f'{semestr}: nieznany dzień tygodnia „{dzien}” ({kod})')
        od, do = godzina(hp, mp), godzina(hk, mk)
        if d is None or not od or not do:
            d = od = do = None
        sloty.append({
            'kod': kod, 'typ': typ.upper() or '?', 'grupa': int(grupa) if grupa.isdigit() else grupa,
            'prowadzacy': ' '.join(x for x in (imie, nazwisko) if x),
            'dzien': d, 'od': od, 'do': do, 'sala': sala,
            'czestotliwosc': (CZESTOTLIWOSC_EKSPORT.get(czest.upper(), 'inna') if czest else None) if d is not None else None,
            'uwagi': uwagi_z_html(opis),
        })
    if pominiete:
        ostrzez(f'{semestr}: pominięto {pominiete} niepełnych wierszy eksportu')
    return sloty, nazwy, adres


# ---------------------------------------------------------------- źródło 2 (awaryjne): USOS API

def odkryj_przedmioty(budzet):
    """courses/search zwraca najwyżej 100 wyników na zapytanie — zawężamy prefiks kodu, aż wyniki się zmieszczą."""
    znalezione, znaki = {}, 'abcdefghijklmnopqrstuvwxyz0123456789-'

    def szukaj(prefiks, glebokosc):
        n = 0
        for start in range(0, 100, 20):
            if LICZNIK_API['n'] >= budzet:
                return
            odp = api('courses/search', lang='pl', fac_id='2812', fac_deep='true', num=20, start=start,
                      fields='id|name|terms', name=prefiks)
            for it in odp.get('items', []):
                znalezione[it['id']] = it
            n += len(odp.get('items', []))
            if not odp.get('next_page'):
                break
        if n >= 100 and glebokosc < 4:
            for c in znaki:
                szukaj(prefiks + c, glebokosc + 1)

    for c in 'abcdefghijklmnopqrstuvwxyz':
        szukaj(PREFIKS + c, 0)
    if LICZNIK_API['n'] >= budzet:
        ostrzez(f'wyszukiwanie przedmiotów w USOS API przerwane po {budzet} zapytaniach — lista może być niepełna')
    return znalezione


def plan_z_api(sem, znane_kody, budzet):
    semestr = sem['id']
    kandydaci = {}
    for kod, it in odkryj_przedmioty(budzet).items():
        if w_planie(kod) and any(t.get('id') == semestr for t in it.get('terms', [])):
            kandydaci[kod] = it.get('name') or {}
    # przedmioty znane z poprzedniego pliku, których wyszukiwarka mogła nie zwrócić
    reszta = [k for k in sorted(znane_kody) if k not in kandydaci and w_planie(k)]
    for i in range(0, len(reszta), 40):
        odp = api('courses/courses', course_ids='|'.join(reszta[i:i + 40]), fields='id|name|terms')
        for kod, it in odp.items():
            if it and any(t.get('id') == semestr for t in it.get('terms', [])):
                kandydaci[kod] = it.get('name') or {}
    if not kandydaci:
        raise BrakDanych(f'USOS API: brak przedmiotów IM w semestrze {semestr}')
    start = dt.date.fromisoformat(sem['od']) if sem.get('od') else dt.date.today()
    poniedzialek = start + dt.timedelta(days=14 + (7 - (start + dt.timedelta(days=14)).weekday()) % 7)
    tygodnie = [poniedzialek + dt.timedelta(days=7 * i) for i in range(3)]
    pola = 'type|start_time|end_time|classtype_id|classtype_name|group_number|lecturer_ids|room_number|frequency'
    sloty, nazwy, widziane = [], {}, set()
    for kod, nazwa in sorted(kandydaci.items()):
        nazwy[kod] = {'pl': (nazwa.get('pl') or kod).strip(), 'en': (nazwa.get('en') or '').strip()}
        try:
            ed = api('courses/course_edition', course_id=kod, term_id=semestr, fields='lecturers|coordinators')
            osoby = {str(o['id']): f"{o.get('first_name', '')} {o.get('last_name', '')}".strip() for o in (ed.get('lecturers') or []) + (ed.get('coordinators') or [])}
            for tydzien in tygodnie:
                for a in api('tt/course_edition', course_id=kod, term_id=semestr, start=tydzien.isoformat(), days=7, fields=pola):
                    if a.get('type') not in ('classgroup', 'classgroup2'):
                        continue
                    t0 = dt.datetime.fromisoformat(a['start_time'])
                    t1 = dt.datetime.fromisoformat(a['end_time'])
                    typ = (a.get('classtype_id') or '?').upper()
                    if typ not in TYPY and a.get('classtype_name'):
                        TYPY[typ] = (a['classtype_name'].get('pl') or typ, a['classtype_name'].get('en') or typ)
                    klucz = (kod, typ, a.get('group_number'), t0.weekday(), t0.strftime('%H:%M'), t1.strftime('%H:%M'), a.get('room_number') or '')
                    if klucz in widziane:
                        continue
                    widziane.add(klucz)
                    prowadzacy = [osoby.get(str(i), '') for i in a.get('lecturer_ids') or []] or ['']
                    for p in prowadzacy:
                        sloty.append({'kod': kod, 'typ': typ, 'grupa': a.get('group_number'), 'prowadzacy': p,
                                      'dzien': t0.weekday(), 'od': t0.strftime('%H:%M'), 'do': t1.strftime('%H:%M'),
                                      'sala': a.get('room_number') or '',
                                      'czestotliwosc': CZESTOTLIWOSC_API.get(a.get('frequency'), 'inna'), 'uwagi': []})
        except Exception as e:
            ostrzez(f'{semestr}: USOS API — nie udało się pobrać planu przedmiotu {kod} ({e})')
    return sloty, nazwy, API + 'tt/course_edition'


# ---------------------------------------------------------------- uzupełnienia z USOS API

def nazwy_angielskie(kody, poprzednie):
    wynik = {}
    kody = sorted(kody)
    for i in range(0, len(kody), 40):
        try:
            odp = api('courses/courses', course_ids='|'.join(kody[i:i + 40]), fields='id|name')
            for kod, it in odp.items():
                if it and (it.get('name') or {}).get('en'):
                    wynik[kod] = it['name']['en'].strip()
        except Exception as e:
            ostrzez(f'USOS API (courses/courses) nie odpowiada ({e}); angielskie nazwy z poprzedniego pliku.')
            for kod in kody[i:]:
                if poprzednie.get(kod):
                    wynik[kod] = poprzednie[kod]
            break
    return wynik


def uzupelnij_typy():
    try:
        for kod, t in api('courses/classtypes_index').items():
            nazwa = t.get('name') or {}
            if nazwa.get('pl'):
                TYPY[kod.upper()] = (nazwa['pl'], NADPISANE_EN.get(kod.upper()) or nazwa.get('en') or nazwa['pl'])
    except Exception as e:
        ostrzez(f'USOS API (courses/classtypes_index) nie odpowiada ({e}); nazwy typów wbudowane.')


# ---------------------------------------------------------------- zapis

def zrzut(v, wciecie=0, klucz=None):
    sp = ' ' * wciecie
    if isinstance(v, dict) and v and any(isinstance(x, (dict, list)) for x in v.values()):
        pozycje = [f'{sp}  {json.dumps(k, ensure_ascii=False)}: {zrzut(x, wciecie + 2, k)}' for k, x in v.items()]
        return '{\n' + ',\n'.join(pozycje) + '\n' + sp + '}'
    if isinstance(v, list) and v and klucz in ('przedmioty', 'zajecia', 'kategorie'):
        return '[\n' + ',\n'.join(sp + '  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in v) + '\n' + sp + ']'
    if isinstance(v, list) and v and klucz == 'semestry':
        return '[\n' + ',\n'.join(sp + '  ' + zrzut(x, wciecie + 2) for x in v) + '\n' + sp + ']'
    return json.dumps(v, ensure_ascii=False)


def wczytaj(plik):
    try:
        with open(plik, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception as e:
        ostrzez(f'nie udało się odczytać {plik} ({e}) — powstanie od nowa')
        return {}


def main():
    ap = argparse.ArgumentParser(description='Pobiera plan zajęć IM UWr z USOS (anonimowo) do src/data/plan/plan.json.')
    ap.add_argument('--zrodlo', choices=['auto', 'eksport', 'api'], default='auto',
                    help='auto: eksport planIM.php, a gdy nie działa — USOS API (domyślnie)')
    ap.add_argument('--semestr', action='append', help='identyfikator semestru z USOS, np. 2026/27-Z (można kilka razy); domyślnie bieżący i następny')
    ap.add_argument('--wyjscie', default=DOMYSLNY_PLIK, help='plik wynikowy')
    ap.add_argument('--budzet-api', type=int, default=2500, help='limit zapytań do USOS API w trybie awaryjnym')
    arg = ap.parse_args()

    teraz = dt.datetime.now(STREFA).replace(microsecond=0)
    stare = wczytaj(arg.wyjscie)
    stare_semestry = {s.get('id'): s for s in stare.get('semestry', []) if isinstance(s, dict)}
    stare_en = {p['kod']: p.get('nazwa_en') for s in stare_semestry.values() for p in s.get('przedmioty', []) if p.get('nazwa_en')}
    znane_kody = {p['kod'] for s in stare_semestry.values() for p in s.get('przedmioty', [])}

    semestry = wybierz_semestry(teraz.date(), arg.semestr)
    uzupelnij_typy()
    wynik_semestry, podsumowanie = [], []
    for sem in semestry:
        sid = sem['id']
        sloty = nazwy = adres = None
        zrodlo = None
        if arg.zrodlo in ('auto', 'eksport'):
            try:
                sloty, nazwy, adres = plan_z_eksportu(sid)
                zrodlo = 'usosweb-eksport'
            except Exception as e:
                ostrzez(f'{sid}: eksport planu z USOSweb niedostępny ({e})')
        if sloty is None and arg.zrodlo in ('auto', 'api'):
            try:
                sloty, nazwy, adres = plan_z_api(sem, znane_kody, LICZNIK_API['n'] + arg.budzet_api)
                zrodlo = 'usos-api'
            except Exception as e:
                ostrzez(f'{sid}: plan z USOS API niedostępny ({e})')
        stary = stare_semestry.get(sid)
        if sloty is None:
            if stary:
                ostrzez(f'{sid}: zostawiam dane z poprzedniego pobrania ({stary.get("zaktualizowano")})')
                wynik_semestry.append(dict(stary, nazwa=sem['nazwa'], nazwa_en=sem['nazwa_en'], od=sem['od'] or stary.get('od'), do=sem['do'] or stary.get('do')))
                podsumowanie.append((sid, 'poprzednie dane', len(stary.get('przedmioty', [])), len(stary.get('zajecia', [])), False))
            else:
                wynik_semestry.append({'id': sid, 'nazwa': sem['nazwa'], 'nazwa_en': sem['nazwa_en'], 'od': sem['od'], 'do': sem['do'],
                                       'zrodlo': None, 'adres_zrodla': None, 'zaktualizowano': None, 'przedmioty': [], 'zajecia': []})
                podsumowanie.append((sid, 'brak danych', 0, 0, True))
            continue
        en = nazwy_angielskie({s['kod'] for s in sloty}, stare_en) if zrodlo == 'usosweb-eksport' else {k: v.get('en') for k, v in nazwy.items() if v.get('en')}
        for kod, nazwa_en in en.items():
            nazwy.setdefault(kod, {})['en'] = nazwa_en
        przedmioty, zajecia = zloz_semestr(sloty, nazwy)
        nowy = {'id': sid, 'nazwa': sem['nazwa'], 'nazwa_en': sem['nazwa_en'], 'od': sem['od'], 'do': sem['do'],
                'zrodlo': zrodlo, 'adres_zrodla': adres, 'zaktualizowano': None, 'przedmioty': przedmioty, 'zajecia': zajecia}
        porownaj = lambda s: {k: v for k, v in (s or {}).items() if k != 'zaktualizowano'}
        zmiana = porownaj(nowy) != porownaj(stary)
        nowy['zaktualizowano'] = teraz.isoformat() if zmiana or not stary else stary.get('zaktualizowano')
        wynik_semestry.append(nowy)
        podsumowanie.append((sid, zrodlo, len(przedmioty), len(zajecia), zmiana))

    uzyte_typy = sorted({z['typ'] for s in wynik_semestry for z in s.get('zajecia', [])},
                        key=lambda t: (KOLEJNOSC_TYPOW.index(t) if t in KOLEJNOSC_TYPOW else 99, t))
    dane = {
        'opis': 'Plan zajęć Instytutu Matematycznego UWr pobierany automatycznie z USOS przez skrypty/plan/pobierz_plan.py '
                '(workflow .github/workflows/plan-zajec.yml). Nie edytuj ręcznie — zmiany wprowadza się w USOS.',
        'zrodlo': 'USOS Uniwersytetu Wrocławskiego: eksport https://usosweb.uwr.edu.pl/planIM.php oraz USOS API https://usosapps.uwr.edu.pl/',
        'kategorie': [{'id': k, 'pl': pl, 'en': en} for k, _, pl, en in KATEGORIE],
        'typy': {t: {'pl': TYPY.get(t, (t, t))[0], 'en': TYPY.get(t, (t, t))[1]} for t in uzyte_typy},
        'semestry': wynik_semestry,
    }
    tekst = zrzut(dane) + '\n'
    poprzedni = None
    if os.path.exists(arg.wyjscie):
        with open(arg.wyjscie, encoding='utf-8') as f:
            poprzedni = f.read()
    if tekst != poprzedni:
        os.makedirs(os.path.dirname(os.path.abspath(arg.wyjscie)), exist_ok=True)
        with open(arg.wyjscie, 'w', encoding='utf-8') as f:
            f.write(tekst)
    print(f'Zapytania do USOS API: {LICZNIK_API["n"]}')
    for sid, zr, np_, nz, zm in podsumowanie:
        print(f'{sid}: źródło {zr}, przedmiotów {np_}, zajęć {nz}, {"ZMIANA" if zm else "bez zmian"}')
    print('Plik ' + ('zapisany' if tekst != poprzedni else 'bez zmian') + f': {arg.wyjscie}')
    podsum = os.environ.get('GITHUB_STEP_SUMMARY')
    if podsum:
        with open(podsum, 'a', encoding='utf-8') as f:
            f.write('### Plan zajęć z USOS\n\n| Semestr | Źródło | Przedmioty | Zajęcia | Zmiana |\n|---|---|---|---|---|\n')
            for sid, zr, np_, nz, zm in podsumowanie:
                f.write(f'| {sid} | {zr} | {np_} | {nz} | {"tak" if zm else "nie"} |\n')
            if OSTRZEZENIA:
                f.write('\n**Ostrzeżenia:**\n\n' + ''.join(f'- {o}\n' for o in OSTRZEZENIA))
    return 0


if __name__ == '__main__':
    sys.exit(main())
