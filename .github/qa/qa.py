#!/usr/bin/env python3
"""Kontrola jakości zbudowanej strony (wywoływana z .github/workflows/qa.yml).

Kroki (podpolecenia):
  indeks       — przegląda dist/: linki z każdej strony, kotwice, lista linków zewnętrznych
                 do sprawdzenia przez lychee, statystyka linków do starej strony,
                 konfiguracja pa11y-ci (lista stron wybrana z dist/)
  wewnetrzne   — wynik lychee (offline, --root-dir dist) + własne sprawdzenie plików i kotwic
  zewnetrzne   — wynik lychee dla linków zewnętrznych (tylko ostrzeżenia)
  stara        — linki do math.uni.wroc.pl („dług migracyjny”)
  dostepnosc   — wynik pa11y-ci (axe + HTML_CodeSniffer), pogrupowany wg reguły
  raport       — raport.md + podsumowanie przebiegu; kod wyjścia 1, gdy są zepsute linki wewnętrzne

Wyniki trafiają do katalogu QA_OUT (domyślnie qa-wyniki/). Tylko biblioteka standardowa Pythona.
Adnotacje GitHub (::error/::warning/::notice) — po kilka na krok (limit GitHuba: 10 każdego typu).
"""
import glob
import html
import json
import os
import re
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from urllib.parse import unquote, urljoin, urlsplit

DIST = os.path.abspath(os.environ.get('QA_DIST', 'dist'))
OUT = os.path.abspath(os.environ.get('QA_OUT', 'qa-wyniki'))
ORIGIN = os.environ.get('QA_ORIGIN', 'http://localhost:8080').rstrip('/')
SRC = os.path.abspath(os.environ.get('QA_SRC', 'src'))
STARA_HOST = re.compile(r'^(www\.)?math\.uni\.wroc\.pl$', re.I)
SUB_HOST = re.compile(r'(^|\.)math\.uni\.wroc\.pl$', re.I)
POMIJANE_SCHEMATY = ('mailto', 'tel', 'javascript', 'data', 'blob', 'about', 'sms', 'callto')
POMIJANE_KATALOGI = ('pagefind', '_astro')
# przyciski „udostępnij” (adres zawiera adres strony testowej) — nie sprawdzamy
UDOSTEPNIJ = re.compile(r'facebook\.com/sharer|twitter\.com/intent|x\.com/intent|linkedin\.com/(sharing|shareArticle)|localhost%3A', re.I)
MAX_ADNOTACJI = 9


# ───────────────────────── narzędzia ─────────────────────────

def esc_msg(s):
    return str(s).replace('%', '%25').replace('\r', '').replace('\n', '%0A')


def esc_title(s):
    return esc_msg(s).replace(':', '%3A').replace(',', '%2C')


def adnotacja(typ, tytul, linie, limit_znakow=3500):
    """Jedna adnotacja; długi tekst łączony %0A i przycinany."""
    if isinstance(linie, str):
        linie = [linie]
    tekst, n = [], 0
    for i, l in enumerate(linie):
        if n + len(l) > limit_znakow:
            tekst.append(f'… (+{len(linie) - i} — pełna lista w raporcie qa/raport.md / podsumowaniu przebiegu)')
            break
        tekst.append(l)
        n += len(l) + 1
    print(f'::{typ} title={esc_title(tytul)}::{esc_msg(chr(10).join(tekst))}')


def zapisz_json(nazwa, dane):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, nazwa), 'w', encoding='utf-8') as f:
        json.dump(dane, f, ensure_ascii=False, indent=1)


def wczytaj_json(nazwa, domyslnie=None):
    p = nazwa if os.path.isabs(nazwa) else os.path.join(OUT, nazwa)
    try:
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return domyslnie


def plik_na_adres(p):
    """dist/a/b/index.html → /a/b/ ; dist/404.html → /404.html"""
    rel = os.path.relpath(p, DIST).replace(os.sep, '/')
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-len('index.html')]
    return '/' + rel


def adres_na_plik(sciezka):
    """Ścieżka URL (bez zapytania i kotwicy) → plik w dist albo None (jak GitHub Pages)."""
    s = unquote(sciezka)
    if '\x00' in s:
        return None
    kand = os.path.normpath(os.path.join(DIST, s.lstrip('/')))
    if not (kand == DIST or kand.startswith(DIST + os.sep)):
        return None
    if s.endswith('/') or os.path.isdir(kand):
        f = os.path.join(kand, 'index.html')
        return f if os.path.isfile(f) else None
    if os.path.isfile(kand):
        return kand
    if os.path.isfile(kand + '.html'):
        return kand + '.html'
    return None


def norm_url(u):
    """Klucz do porównywania adresów zewnętrznych (lychee bywa, że je normalizuje)."""
    try:
        s = urlsplit(u.strip())
    except ValueError:
        return u.strip()
    sciezka = unquote(s.path).rstrip('/')
    return f'{s.scheme.lower()}://{s.netloc.lower()}{sciezka}?{unquote(s.query)}'


def skroc(lista, n=3):
    lista = list(lista)
    return ', '.join(lista[:n]) + (f' (+{len(lista) - n})' if len(lista) > n else '')


# ───────────────────────── przegląd HTML ─────────────────────────

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.linki = []   # (element, adres)
        self.idy = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for k in ('id', 'name') if tag == 'a' else ('id',):
            if a.get(k):
                self.idy.add(a[k])
        def dodaj(atr):
            v = a.get(atr)
            if v and v.strip():
                self.linki.append((f'{tag}[{atr}]', v.strip()))
        if tag in ('a', 'area'):
            dodaj('href')
        elif tag == 'link':
            rel = (a.get('rel') or '').lower()
            if not any(r in rel for r in ('preconnect', 'dns-prefetch')):
                dodaj('href')
        elif tag in ('img', 'script', 'iframe', 'audio', 'embed', 'track'):
            dodaj('src')
        elif tag in ('source', 'video'):
            dodaj('src')
            if tag == 'video':
                dodaj('poster')
        elif tag == 'object':
            dodaj('data')
        elif tag == 'form':
            dodaj('action')
        elif tag == 'meta' and (a.get('property') or a.get('name') or '') in ('og:image', 'twitter:image'):
            dodaj('content')
        if tag in ('img', 'source') and a.get('srcset'):
            for czesc in a['srcset'].split(','):
                czesc = czesc.strip().split(' ')[0]
                if czesc:
                    self.linki.append((f'{tag}[srcset]', czesc))


def strony_dist():
    pliki = []
    for p in glob.glob(os.path.join(DIST, '**', '*.html'), recursive=True):
        rel = os.path.relpath(p, DIST).replace(os.sep, '/')
        if rel.split('/')[0] in POMIJANE_KATALOGI:
            continue
        pliki.append(p)
    return sorted(pliki)


def klasyfikuj(strona, v):
    """→ ('wewn', sciezka, kotwica) | ('zewn', url, host) | None"""
    if v.startswith('#'):
        return ('wewn', strona, unquote(v[1:]))
    try:
        s = urlsplit(v)
    except ValueError:
        return ('zewn', v, '?')
    schemat = s.scheme.lower()
    if schemat in POMIJANE_SCHEMATY:
        return None
    if schemat in ('http', 'https') or v.startswith('//'):
        host = (s.hostname or '').lower()
        if ORIGIN and f'{schemat or "http"}://{s.netloc}'.lower() == ORIGIN.lower():
            return ('wewn', s.path or '/', unquote(s.fragment))
        url = v if schemat else 'https:' + v
        return ('zewn', url.split('#')[0], host)
    if schemat:
        return None
    pelny = urljoin(ORIGIN + strona, v)
    s2 = urlsplit(pelny)
    return ('wewn', s2.path or '/', unquote(s2.fragment))


def cmd_indeks():
    os.makedirs(OUT, exist_ok=True)
    pliki = strony_dist()
    idy, linki_stron = {}, {}
    for p in pliki:
        pr = Parser()
        try:
            pr.feed(open(p, encoding='utf-8', errors='replace').read())
        except Exception as e:  # uszkodzony HTML — nie przerywamy
            print(f'::warning title=Parser HTML::{esc_msg(plik_na_adres(p))}: {esc_msg(e)}')
        idy[p] = pr.idy
        linki_stron[plik_na_adres(p)] = (p, pr.linki)

    wewn_zepsute, kotwice_zepsute = [], []
    zewn = defaultdict(set)            # url → strony
    stara = []                         # (strona, url, kategoria)
    sub = []                           # (strona, url, host)
    liczba_linkow = 0
    for strona, (plik, linki) in linki_stron.items():
        for el, v in linki:
            k = klasyfikuj(strona, v)
            if not k:
                continue
            liczba_linkow += 1
            if k[0] == 'wewn':
                _, sciezka, kotwica = k
                cel = plik if sciezka == strona and v.startswith('#') else adres_na_plik(sciezka)
                if cel is None:
                    wewn_zepsute.append({'strona': strona, 'cel': sciezka, 'href': v, 'element': el})
                    continue
                if kotwica and kotwica != 'top' and not kotwica.startswith(':~:') and cel.endswith('.html'):
                    if kotwica not in idy.get(cel, set()):
                        kotwice_zepsute.append({'strona': strona, 'cel': sciezka + '#' + kotwica, 'href': v, 'element': el})
            else:
                _, url, host = k
                if UDOSTEPNIJ.search(url):
                    continue
                zewn[url].add(strona)
                if STARA_HOST.match(host):
                    sciezka = urlsplit(url).path or '/'
                    kat = 'pliki' if sciezka.startswith('/sites/default/files') else ('strony domowe (~, /users/)' if sciezka.startswith(('/~', '/users/')) else 'strony')
                    stara.append((strona, url, kat))
                elif SUB_HOST.search(host):
                    sub.append((strona, url, host))

    # lista linków zewnętrznych dla lychee (HTML zachowuje adresy dokładnie)
    with open(os.path.join(OUT, 'zewnetrzne.html'), 'w', encoding='utf-8') as f:
        f.write('<!doctype html><meta charset="utf-8"><title>linki zewnętrzne</title>\n')
        for url in sorted(zewn):
            f.write(f'<a href="{html.escape(url, quote=True)}">x</a>\n')

    zapisz_json('indeks.json', {
        'liczba_stron': len(pliki),
        'liczba_linkow': liczba_linkow,
        'wewnetrzne_zepsute': wewn_zepsute,
        'kotwice_zepsute': kotwice_zepsute,
        'zewnetrzne': {u: sorted(s) for u, s in sorted(zewn.items())},
        'stara': stara,
        'subdomeny': sub,
    })
    zapisz_json('pa11y.json', konfiguracja_pa11y(list(linki_stron)))
    print(f'::notice title=Indeks linków::{len(pliki)} stron HTML, {liczba_linkow} linków, '
          f'{len(zewn)} unikalnych adresów zewnętrznych, wybrano {len(wczytaj_json("pa11y.json")["urls"])} testów dostępności')


# ───────────────────────── wybór stron do pa11y ─────────────────────────

def wybierz_strony(adresy):
    wszystkie = set(adresy)
    pl = sorted(a for a in adresy if a.endswith('/') and not a.startswith('/en/'))
    wybrane = []

    def dodaj(a):
        if a in wszystkie and a not in wybrane:
            wybrane.append(a)

    dodaj('/')
    for a in pl:                                   # wszystkie strony pierwszego poziomu
        if a.count('/') == 2:
            dodaj(a)
    dzieci = defaultdict(list)
    for a in pl:
        if a != '/':
            dzieci[a[:-1].rsplit('/', 1)[0] + '/'].append(a)
    for rodzic in sorted(dzieci):                  # listy + jedna próbka z każdej kolekcji
        lst = dzieci[rodzic]
        dodaj(rodzic)
        if len(lst) > 3:
            liscie = [c for c in lst if c not in dzieci] or lst
            dodaj(sorted(liscie)[-1])              # ostatnia alfabetycznie (dla aktualności = najnowsza)
            for c in lst:                          # podkatalogi z własnymi dziećmi (np. /studia/matematyka/)
                if c in dzieci:
                    dodaj(c)
        else:
            for c in lst:
                dodaj(c)
    for f in sorted(glob.glob(os.path.join(SRC, 'content', 'strony', '**', '*.md'), recursive=True)):
        rel = os.path.relpath(f, os.path.join(SRC, 'content', 'strony')).replace(os.sep, '/')[:-3]
        dodaj('/' + rel + '/')                     # wszystkie strony statyczne
    for a in ('/en/', '/en/aktualnosci/', '/en/studia/matematyka/', '/en/instytut/kontakt/', '/en/pracownicy/'):
        dodaj(a)
    dodaj('/404.html')
    return wybrane[:70]


def konfiguracja_pa11y(adresy):
    wybrane = wybierz_strony(adresy)
    urls = [ORIGIN + a for a in wybrane]
    # tryb ciemny (przycisk [data-motyw]) i szerokość telefonu — tylko axe, kilka stron
    zaklad = next((a for a in wybrane if a.startswith('/instytut/zaklady/') and a.count('/') == 4), None)
    ciemne = [a for a in ('/', '/studia/matematyka/', '/aktualnosci/', '/pracownicy/', '/seminaria/', zaklad) if a in wybrane]
    for a in ciemne:
        urls.append({'url': f'{ORIGIN}{a}?qa=ciemny', 'runners': ['axe'],
                     'actions': ['click element [data-motyw]', 'wait for element html[data-theme=dark] to be added']})
    for a in [x for x in ('/', '/studia/matematyka/', '/pracownicy/') if x in wybrane]:
        urls.append({'url': f'{ORIGIN}{a}?qa=telefon', 'runners': ['axe'],
                     'viewport': {'width': 390, 'height': 844, 'isMobile': True}})
    return {
        'defaults': {
            'runners': ['axe', 'htmlcs'],
            'standard': 'WCAG2AA',
            'timeout': 90000,
            'wait': 500,
            'concurrency': 1,
            # KaTeX (warstwa wizualna, aria-hidden) daje fałszywe alarmy kontrastu przy ułamkach;
            # dostępna warstwa MathML jest nadal testowana.
            'hideElements': '.katex-html',
            'viewport': {'width': 1280, 'height': 900},
            'chromeLaunchConfig': {'args': ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']},
            'reporters': ['cli', ['json', {'fileName': os.path.join(OUT, 'pa11y-wyniki.json')}]],
        },
        'urls': urls,
    }


# ───────────────────────── lychee ─────────────────────────

def wczytaj_lychee(nazwa):
    """→ (dane, [ {wejscie, url, kod, tekst} ]) — odporne na różnice wersji formatu JSON lychee."""
    d = wczytaj_json(nazwa)
    if not isinstance(d, dict):
        return None, []
    wyniki = []
    for klucz, wartosc in d.items():
        if not klucz.endswith('_map') or klucz in ('success_map', 'excluded_map', 'suggestion_map', 'redirect_map', 'cached_map'):
            continue
        if not isinstance(wartosc, dict):
            continue
        for wejscie, lista in wartosc.items():
            for el in lista or []:
                if not isinstance(el, dict):
                    continue
                url = el.get('url') or el.get('uri') or ''
                st = el.get('status')
                kod, tekst = None, ''
                if isinstance(st, dict):
                    kod = st.get('code')
                    tekst = st.get('text') or st.get('details') or json.dumps(st, ensure_ascii=False)
                elif st is not None:
                    tekst = str(st)
                if kod is None:
                    m = re.search(r'\b([1-5]\d\d)\b', tekst)
                    kod = int(m.group(1)) if m else None
                wyniki.append({'wejscie': wejscie, 'url': url, 'kod': kod, 'tekst': tekst[:300], 'mapa': klucz})
    return d, wyniki


def wejscie_na_strone(w):
    w = w.replace('\\', '/')
    i = w.rfind('/dist/')
    rel = w[i + 6:] if i >= 0 else (w[5:] if w.startswith('dist/') else w)
    return plik_na_adres(os.path.join(DIST, rel))


def plikowy_url_na_adres(u):
    if u.startswith('file://'):
        u = unquote(urlsplit(u).path)
    i = u.find(DIST)
    if i >= 0:
        u = u[i + len(DIST):] or '/'
    return u


def cmd_wewnetrzne():
    ind = wczytaj_json('indeks.json', {})
    d, wyn = wczytaj_lychee('lychee-wewnetrzne.json')
    kod_lychee = os.environ.get('LYCHEE_KOD', '')
    uwagi = []
    if d is None:
        uwagi.append(f'lychee nie zapisał wyniku (kod wyjścia: {kod_lychee or "?"}) — wynik tylko z własnego sprawdzenia plików')
    elif kod_lychee not in ('', '0', '2'):
        uwagi.append(f'lychee zakończył się kodem {kod_lychee}')
    zepsute = {}
    for z in ind.get('wewnetrzne_zepsute', []):
        k = (z['strona'], z['cel'].rstrip('/') or '/')
        cel = z['cel'] if z['href'] in (z['cel'], z['cel'].rstrip('/')) else f"{z['cel']} (href: {z['href']})"
        zepsute[k] = {'strona': z['strona'], 'cel': cel, 'zrodlo': 'skrypt'}
    for w in wyn:
        strona = wejscie_na_strone(w['wejscie'])
        cel = plikowy_url_na_adres(w['url'])
        k = (strona, unquote(cel.split('#')[0].split('?')[0]).rstrip('/') or '/')
        if k in zepsute:
            zepsute[k]['zrodlo'] = 'lychee+skrypt'
        else:
            zepsute[k] = {'strona': strona, 'cel': cel, 'zrodlo': 'lychee', 'status': w['tekst']}
    lista = sorted(zepsute.values(), key=lambda z: (z['cel'], z['strona']))
    kotwice = ind.get('kotwice_zepsute', [])
    wynik = {'zepsute': lista, 'kotwice': kotwice, 'uwagi': uwagi,
             'lychee': {k: d.get(k) for k in ('total', 'successful', 'errors', 'excludes', 'unknown') if d and k in d}}
    zapisz_json('wynik-wewnetrzne.json', wynik)

    for u in uwagi:
        print(f'::warning title=Linki wewnętrzne — narzędzie::{esc_msg(u)}')
    po_celu = defaultdict(set)
    for z in lista:
        po_celu[z['cel']].add(z['strona'])
    linie = [f'{cel}  ←  {skroc(sorted(s))}' for cel, s in sorted(po_celu.items(), key=lambda x: -len(x[1]))]
    if linie:
        for i in range(0, min(len(linie), 4 * 25), 25):
            adnotacja('error', f'Zepsute linki wewnętrzne ({len(lista)} wystąpień, {len(po_celu)} adresów) {i // 25 + 1}', linie[i:i + 25])
    po_kotwicy = defaultdict(set)
    for z in kotwice:
        po_kotwicy[z['cel']].add(z['strona'])
    if po_kotwicy:
        linie = [f'{cel}  ←  {skroc(sorted(s))}' for cel, s in sorted(po_kotwicy.items(), key=lambda x: -len(x[1]))]
        adnotacja('warning', f'Nieistniejące kotwice (#) ({len(kotwice)} wystąpień)', linie[:40])
    print(f'::notice title=Linki wewnętrzne::{len(lista)} zepsutych (adresów: {len(po_celu)}), '
          f'{len(kotwice)} nieistniejących kotwic; lychee: {esc_msg(json.dumps(wynik["lychee"]))}')


NIEPEWNE_KODY = {400, 401, 403, 405, 406, 408, 418, 425, 429, 451, 999}
# serwisy blokujące automaty — wynik zawsze „nie wiadomo”
NIEPEWNE_HOSTY = re.compile(r'(^|\.)(facebook\.com|instagram\.com|linkedin\.com|x\.com|twitter\.com|researchgate\.net|scholar\.google\.[a-z.]+|youtube\.com)$', re.I)


def cmd_zewnetrzne():
    ind = wczytaj_json('indeks.json', {})
    mapa = {norm_url(u): s for u, s in ind.get('zewnetrzne', {}).items()}
    d, wyn = wczytaj_lychee('lychee-zewnetrzne.json')
    kod_lychee = os.environ.get('LYCHEE_KOD', '')
    zepsute, niepewne = [], []
    for w in wyn:
        strony = mapa.get(norm_url(w['url']), [])
        rek = {'url': w['url'], 'kod': w['kod'], 'status': w['tekst'], 'strony': strony}
        t = w['tekst'].lower()
        host = (urlsplit(w['url']).hostname or '') if w['url'].startswith('http') else ''
        if (w['kod'] in NIEPEWNE_KODY or (w['kod'] or 0) >= 500 or 300 <= (w['kod'] or 0) < 400
                or NIEPEWNE_HOSTY.search(host) or 'timeout' in t or 'timed out' in t
                or 'too many' in t or 'rate limit' in t or 'certificate' in t):
            niepewne.append(rek)
        else:
            zepsute.append(rek)
    wynik = {'zepsute': zepsute, 'niepewne': niepewne, 'sprawdzone': len(ind.get('zewnetrzne', {})),
             'lychee': {k: d.get(k) for k in ('total', 'successful', 'errors', 'excludes', 'timeouts', 'unknown', 'redirects') if d and k in d},
             'kod_lychee': kod_lychee}
    zapisz_json('wynik-zewnetrzne.json', wynik)
    if d is None:
        print(f'::warning title=Linki zewnętrzne — narzędzie::lychee nie zapisał wyniku (kod wyjścia: {esc_msg(kod_lychee or "?")})')
        return
    def linia(r):
        return f'[{r["kod"] or r["status"][:40]}] {r["url"]}  ←  {skroc(r["strony"], 2)}'
    zepsute.sort(key=lambda r: (-len(r['strony']), r['url']))
    for i in range(0, min(len(zepsute), 3 * 30), 30):
        adnotacja('warning', f'Zepsute linki zewnętrzne ({len(zepsute)}) {i // 30 + 1}', [linia(r) for r in zepsute[i:i + 30]])
    if niepewne:
        adnotacja('notice', f'Linki zewnętrzne — nie wiadomo (403/429/5xx/timeout: {len(niepewne)})',
                  [linia(r) for r in sorted(niepewne, key=lambda r: r['url'])][:40])
    print(f'::notice title=Linki zewnętrzne::sprawdzono {wynik["sprawdzone"]} adresów; zepsute: {len(zepsute)}, '
          f'niepewne: {len(niepewne)}; lychee: {esc_msg(json.dumps(wynik["lychee"]))}')


# ───────────────────────── stara strona ─────────────────────────

def cmd_stara():
    ind = wczytaj_json('indeks.json', {})
    stara = ind.get('stara', [])
    n_stron = max(ind.get('liczba_stron', 1), 1)
    strony_url = defaultdict(set)
    for strona, url, _ in stara:
        strony_url[url].add(strona)
    # linki z szablonu (menu, stopka) — na ≥50% stron; liczone osobno, żeby nie zasłaniały treści
    szablon = sorted(u for u, s in strony_url.items() if len(s) >= 0.5 * n_stron)

    def statystyka(wpisy):
        kat = defaultdict(lambda: {'wystapienia': 0, 'adresy': set(), 'strony': set()})
        for strona, url, k in wpisy:
            kat[k]['wystapienia'] += 1
            kat[k]['adresy'].add(url)
            kat[k]['strony'].add(strona)
        return {
            'razem': {'wystapienia': len(wpisy), 'adresy': len({u for _, u, _ in wpisy}), 'strony': len({s for s, _, _ in wpisy})},
            'kategorie': {k: {'wystapienia': v['wystapienia'], 'adresy': len(v['adresy']), 'strony': len(v['strony'])}
                          for k, v in sorted(kat.items())},
        }

    tresc = [w for w in stara if w[1] not in szablon]
    tresc_pl = [w for w in tresc if not w[0].startswith('/en/')]
    sekcje = Counter()
    for strona, _, _ in tresc_pl:
        seg = strona.strip('/').split('/')[0]
        sekcje[f'/{seg}/' if seg else '/'] += 1
    url_tresc = defaultdict(set)
    for strona, url, _ in tresc:
        url_tresc[url].add(strona)
    top = sorted(url_tresc.items(), key=lambda x: (-len(x[1]), x[0]))[:15]
    sub = Counter(h for _, _, h in ind.get('subdomeny', []))
    wynik = {
        'wszystko': statystyka(stara),
        'bez_szablonu': statystyka(tresc),
        'bez_szablonu_pl': statystyka(tresc_pl),
        'w_szablonie': szablon,
        'top15': [{'url': u, 'strony': len(s), 'przyklady': sorted(s)[:3]} for u, s in top],
        'sekcje_pl': sekcje.most_common(),
        'subdomeny': sub.most_common(),
        'wszystkie': {u: sorted(s) for u, s in sorted(strony_url.items())},
    }
    zapisz_json('wynik-stara.json', wynik)

    def opis(st):
        r = st['razem']
        out = [f'{r["wystapienia"]} wystąpień, {r["adresy"]} adresów, na {r["strony"]} stronach']
        for k, v in st['kategorie'].items():
            out.append(f'   - {k}: {v["wystapienia"]} wystąpień, {v["adresy"]} adresów, {v["strony"]} stron')
        return out
    linie = ['Wszystkie linki: ' + opis(wynik['wszystko'])[0]]
    linie += [f'W szablonie (menu/stopka, na ≥50% stron): {len(szablon)} adresów: ' + ', '.join(szablon)]
    linie += ['W treści (bez szablonu, PL+EN): ' + opis(wynik['bez_szablonu'])[0]] + opis(wynik['bez_szablonu'])[1:]
    linie += ['W treści, tylko strony polskie: ' + opis(wynik['bez_szablonu_pl'])[0]] + opis(wynik['bez_szablonu_pl'])[1:]
    linie.append('Wg sekcji (PL, wystąpienia): ' + ', '.join(f'{s} {n}' for s, n in sekcje.most_common(12)))
    if sub:
        linie.append('Inne serwisy *.math.uni.wroc.pl (nie liczone): ' + ', '.join(f'{h} {n}' for h, n in sub.most_common(8)))
    adnotacja('notice', 'Dług migracyjny — linki do math.uni.wroc.pl', linie)
    adnotacja('notice', 'Dług migracyjny — 15 najczęstszych adresów w treści (liczba stron PL+EN)',
              [f'{len(s):4d}  {u}' for u, s in top])


# ───────────────────────── pa11y ─────────────────────────

_SRC_INDEKS = None


def pliki_dla(selektor, kontekst=''):
    """Podpowiedź: które pliki w src/ używają klas/identyfikatorów z selektora."""
    global _SRC_INDEKS
    if _SRC_INDEKS is None:
        _SRC_INDEKS = {}
        for wz in ('components/*', 'views/*', 'layouts/*', 'pages/**/*'):
            for f in glob.glob(os.path.join(SRC, wz), recursive=True):
                if os.path.isfile(f) and f.endswith(('.astro', '.tsx', '.jsx', '.ts')):
                    _SRC_INDEKS[os.path.relpath(f, os.path.dirname(SRC))] = open(f, encoding='utf-8', errors='replace').read()
    tokeny = re.findall(r'[.#]([A-Za-z_][\w-]*)', selektor or '')
    m = re.search(r'class="([^"]+)"', kontekst or '')
    if m:
        tokeny += m.group(1).split()
    najlepsze = None
    for t in dict.fromkeys(tokeny):
        if t in ('wrap', 'sr-only'):
            continue
        rx = re.compile(r'(?<![\w-])' + re.escape(t) + r'(?![\w-])')
        pl = [f for f, txt in _SRC_INDEKS.items() if rx.search(txt)]
        if pl and (najlepsze is None or len(pl) < len(najlepsze)):
            najlepsze = pl
    if not najlepsze:
        return 'treść (Markdown) lub nieustalony' if 'prose' in (selektor or '') + (kontekst or '') else '?'
    return ', '.join(sorted(najlepsze)[:3]) + (f' (+{len(najlepsze) - 3})' if len(najlepsze) > 3 else '')


def cmd_dostepnosc():
    dane = wczytaj_json('pa11y-wyniki.json')
    log = ''
    try:
        log = open(os.path.join(OUT, 'pa11y-log.txt'), encoding='utf-8', errors='replace').read()
    except OSError:
        pass
    if not isinstance(dane, dict) or 'results' not in dane:
        ogon = re.sub(r'\x1b\[[0-9;]*m', '', log)[-3000:]
        adnotacja('error', 'Dostępność — pa11y-ci nie zwrócił wyników', ['Koniec logu pa11y-ci:'] + ogon.splitlines())
        zapisz_json('wynik-dostepnosc.json', {'blad': 'brak wyników', 'log': ogon})
        return
    grupy = {}
    nieudane, per_strona = [], {}
    for url, problemy in dane['results'].items():
        adres = url[len(ORIGIN):] if url.startswith(ORIGIN) else url
        per_strona[adres] = 0
        for p in problemy or []:
            if not isinstance(p, dict) or not p.get('code'):
                nieudane.append({'strona': adres, 'blad': (p.get('message') if isinstance(p, dict) else str(p) or '')[:400]})
                continue
            per_strona[adres] += 1
            runner = p.get('runner', '?')
            ex = p.get('runnerExtras') or {}
            k = (runner, p['code'])
            g = grupy.setdefault(k, {'runner': runner, 'regula': p['code'], 'typ': p.get('type'), 'wplyw': ex.get('impact'),
                                     'opis': ex.get('help') or p.get('message', '')[:200], 'pomoc': ex.get('helpUrl'),
                                     'wystapienia': 0, 'strony': [], 'przyklady': []})
            g['wystapienia'] += 1
            if adres not in g['strony']:
                g['strony'].append(adres)
            if len(g['przyklady']) < 4 and not any(x['selektor'] == p.get('selector') for x in g['przyklady']):
                g['przyklady'].append({'strona': adres, 'selektor': (p.get('selector') or '')[:200],
                                       'kontekst': (p.get('context') or '')[:240], 'komunikat': (p.get('message') or '')[:300]})
    # szczegóły kontrastu z kontrast.cjs (kolory i współczynnik)
    kontrast = []
    surowe = wczytaj_json('kontrast.json', {}) or {}
    for url, wezly in (surowe.items() if isinstance(surowe, dict) else []):
        if not isinstance(wezly, list):
            continue
        adres = url[len(ORIGIN):] if url.startswith(ORIGIN) else url
        for n in wezly:
            dn = n.get('dane') or {}
            kontrast.append({'strona': adres, 'selektor': n.get('selektor', ''), 'html': n.get('html', ''),
                             'fg': dn.get('fgColor'), 'bg': dn.get('bgColor'), 'wspolczynnik': dn.get('contrastRatio'),
                             'wymagany': dn.get('expectedContrastRatio'), 'czcionka': f"{dn.get('fontSize', '')} {dn.get('fontWeight', '')}".strip(),
                             'komunikat': n.get('komunikat') or n.get('blad', '')})
    po_wezle = {(k['strona'], k['selektor']): k for k in kontrast}
    zmierzone = {(url[len(ORIGIN):] if url.startswith(ORIGIN) else url) for url, w in
                 (surowe.items() if isinstance(surowe, dict) else []) if isinstance(w, list) and not any('blad' in n for n in w)}
    for g in grupy.values():
        for x in g['przyklady']:
            k = po_wezle.get((x['strona'], x['selektor']))
            if k and k.get('wspolczynnik'):
                x['kontrast'] = f"{k['wspolczynnik']}:1 (wymagane {k['wymagany']}), {k['fg']} na {k['bg']}, {k['czcionka']}"
            elif g['regula'] == 'color-contrast' and x['strona'] in zmierzone:
                x['kontrast'] = 'NIE potwierdzone ponownym pomiarem axe-core po pełnym załadowaniu (prawdopodobnie fałszywy alarm — sprawdzić ręcznie)'
    for g in grupy.values():
        g['pliki'] = pliki_dla(g['przyklady'][0]['selektor'], g['przyklady'][0]['kontekst']) if g['przyklady'] else '?'
    lista = sorted(grupy.values(), key=lambda g: (-len(g['strony']), -g['wystapienia']))
    wynik = {'przetestowane': len(per_strona), 'problemy': sum(per_strona.values()), 'reguly': lista,
             'nieudane': nieudane, 'per_strona': per_strona, 'kontrast': kontrast}
    zapisz_json('wynik-dostepnosc.json', wynik)

    powazne = [g for g in lista if g['wplyw'] in ('critical', 'serious')]
    pozostale = [g for g in lista if g not in powazne]
    def linie(g):
        out = [f'{g["opis"]}', f'Wystąpień: {g["wystapienia"]} na {len(g["strony"])} stronach: {skroc(g["strony"], 4)}',
               f'Pliki (podpowiedź): {g["pliki"]}']
        for x in g['przyklady'][:2]:
            out.append(f'• {x["strona"]}  {x["selektor"]}')
            out.append(f'  {x["kontekst"][:160]}')
            if x.get('kontrast'):
                out.append(f'  kontrast: {x["kontrast"]}')
        if g.get('pomoc'):
            out.append(g['pomoc'])
        return out
    for g in powazne[:MAX_ADNOTACJI]:
        adnotacja('error', f'Dostępność [{g["runner"]}] {g["regula"]} ({g["wplyw"]})', linie(g), 1800)
    for g in pozostale[:MAX_ADNOTACJI]:
        adnotacja('warning', f'Dostępność [{g["runner"]}] {g["regula"]}' + (f' ({g["wplyw"]})' if g['wplyw'] else ''), linie(g), 1800)
    reszta = powazne[MAX_ADNOTACJI:] + pozostale[MAX_ADNOTACJI:]
    pods = [f'Przetestowano {len(per_strona)} adresów (w tym warianty ?qa=ciemny i ?qa=telefon), problemów: {wynik["problemy"]}, reguł: {len(lista)}.']
    if reszta:
        pods.append('Pozostałe reguły: ' + '; '.join(f'[{g["runner"]}] {g["regula"]} ×{g["wystapienia"]}' for g in reszta))
    if nieudane:
        pods.append('Nie udało się przetestować: ' + '; '.join(f'{n["strona"]}: {n["blad"][:120]}' for n in nieudane[:8]))
    adnotacja('notice', 'Dostępność — podsumowanie', pods)


# ───────────────────────── raport ─────────────────────────

def md_kom(s):
    return str(s).replace('|', '\\|').replace('\n', ' ')


def cmd_raport():
    ind = wczytaj_json('indeks.json', {})
    we = wczytaj_json('wynik-wewnetrzne.json', {})
    ze = wczytaj_json('wynik-zewnetrzne.json', {})
    st = wczytaj_json('wynik-stara.json', {})
    do = wczytaj_json('wynik-dostepnosc.json', {})
    r = []
    a = r.append
    a('# Raport kontroli jakości')
    a('')
    a(f'Gałąź `{os.environ.get("GITHUB_REF_NAME", "?")}`, commit `{os.environ.get("GITHUB_SHA", "?")[:7]}`, '
      f'przebieg {os.environ.get("GITHUB_SERVER_URL", "")}/{os.environ.get("GITHUB_REPOSITORY", "")}/actions/runs/{os.environ.get("GITHUB_RUN_ID", "")}')
    a('')
    a(f'Strony HTML: {ind.get("liczba_stron", "?")}, linki: {ind.get("liczba_linkow", "?")}.')
    a('')
    a('## 1. Linki wewnętrzne (błąd krytyczny)')
    a('')
    for u in we.get('uwagi', []):
        a(f'> {u}')
    zep = we.get('zepsute', [])
    if not we:
        a('Brak wyniku (krok nie został wykonany).')
    elif not zep:
        a('Brak zepsutych linków wewnętrznych.')
    else:
        po = defaultdict(list)
        for z in zep:
            po[(z['cel'], z['zrodlo'])].append(z['strona'])
        a(f'{len(zep)} wystąpień, {len(po)} adresów.')
        a('')
        a('| cel | strony | źródło |')
        a('|---|---|---|')
        for (cel, zr), s in sorted(po.items(), key=lambda x: -len(x[1])):
            a(f'| `{md_kom(cel)}` | {len(s)}: {md_kom(skroc(sorted(s), 5))} | {zr} |')
    a('')
    kot = we.get('kotwice', [])
    a(f'### Nieistniejące kotwice (#) — {len(kot)}')
    if kot:
        a('')
        po = defaultdict(set)
        for z in kot:
            po[z['cel']].add(z['strona'])
        a('| cel | strony |')
        a('|---|---|')
        for cel, s in sorted(po.items(), key=lambda x: -len(x[1]))[:80]:
            a(f'| `{md_kom(cel)}` | {len(s)}: {md_kom(skroc(sorted(s), 4))} |')
    a('')
    a('## 2. Linki zewnętrzne (ostrzeżenia)')
    a('')
    if not ze:
        a('Brak wyniku.')
    else:
        a(f'Sprawdzono {ze.get("sprawdzone")} adresów. Zepsute: {len(ze.get("zepsute", []))}, '
          f'niepewne (403/429/5xx/timeout): {len(ze.get("niepewne", []))}. lychee: `{json.dumps(ze.get("lychee"))}` (kod {ze.get("kod_lychee")})')
        for tytul, klucz in (('Zepsute', 'zepsute'), ('Niepewne', 'niepewne')):
            lst = ze.get(klucz, [])
            if lst:
                a('')
                a(f'### {tytul}')
                a('')
                a('| status | adres | strony |')
                a('|---|---|---|')
                for x in sorted(lst, key=lambda x: (-len(x['strony']), x['url']))[:300]:
                    a(f'| {md_kom(x["kod"] or x["status"][:60])} | {md_kom(x["url"])} | {len(x["strony"])}: {md_kom(skroc(x["strony"], 3))} |')
    a('')
    a('## 3. Dług migracyjny — linki do math.uni.wroc.pl')
    a('')
    if st and 'wszystko' in st:
        a('| zakres | rodzaj | wystąpienia | adresy | strony |')
        a('|---|---|---|---|---|')
        for nazwa, klucz in (('wszystko', 'wszystko'), ('w treści (PL+EN)', 'bez_szablonu'), ('w treści, tylko PL', 'bez_szablonu_pl')):
            x = st[klucz]
            a(f'| {nazwa} | **razem** | {x["razem"]["wystapienia"]} | {x["razem"]["adresy"]} | {x["razem"]["strony"]} |')
            for k, v in x['kategorie'].items():
                a(f'| {nazwa} | {k} | {v["wystapienia"]} | {v["adresy"]} | {v["strony"]} |')
        a('')
        a(f'W szablonie (menu/stopka, na ≥50% stron): {", ".join(st["w_szablonie"]) or "brak"}')
        a('')
        a('Wg sekcji (tylko PL, bez szablonu): ' + ', '.join(f'`{s}` {n}' for s, n in st['sekcje_pl']))
        a('')
        a('### 15 najczęstszych adresów w treści (liczba stron PL+EN)')
        a('')
        for t in st['top15']:
            a(f'- {t["strony"]} × {t["url"]} (np. {", ".join(t["przyklady"])})')
        if st.get('subdomeny'):
            a('')
            a('Inne serwisy `*.math.uni.wroc.pl` (nie liczone jako dług): ' + ', '.join(f'{h} ({n})' for h, n in st['subdomeny']))
    a('')
    a('## 4. Dostępność (pa11y-ci: axe + HTML_CodeSniffer, WCAG 2 AA)')
    a('')
    if not do:
        a('Brak wyniku.')
    elif do.get('blad'):
        a(f'pa11y-ci nie zwrócił wyników. Koniec logu:\n\n```\n{do.get("log", "")}\n```')
    else:
        a(f'Przetestowano {do["przetestowane"]} adresów, problemów: {do["problemy"]}, reguł: {len(do["reguly"])}.')
        a('')
        a('| runner | reguła | wpływ | wystąpienia | strony | pliki (podpowiedź) | opis |')
        a('|---|---|---|---|---|---|---|')
        for g in do['reguly']:
            a(f'| {g["runner"]} | `{md_kom(g["regula"])}` | {g["wplyw"] or g["typ"] or ""} | {g["wystapienia"]} | '
              f'{len(g["strony"])}: {md_kom(skroc(g["strony"], 4))} | {md_kom(g["pliki"])} | {md_kom(g["opis"][:160])} |')
        a('')
        a('### Przykłady')
        for g in do['reguly']:
            a('')
            a(f'**[{g["runner"]}] {md_kom(g["regula"])}** — {md_kom(g["opis"][:200])}' + (f' ({g["pomoc"]})' if g.get('pomoc') else ''))
            for x in g['przyklady']:
                a(f'- `{x["strona"]}` `{md_kom(x["selektor"])}` — {md_kom(x["komunikat"][:200])}')
                a(f'  - `{md_kom(x["kontekst"][:200])}`')
                if x.get('kontrast'):
                    a(f'  - kontrast: {md_kom(x["kontrast"])}')
        if do.get('kontrast'):
            a('')
            a('### Szczegóły kontrastu (axe-core, ponowny pomiar)')
            a('')
            a('| strona | selektor | współczynnik | wymagany | tekst | tło | czcionka |')
            a('|---|---|---|---|---|---|---|')
            for k in do['kontrast'][:120]:
                a(f'| `{k["strona"]}` | `{md_kom(k["selektor"][-90:])}` | {k["wspolczynnik"] or md_kom(k["komunikat"][:120])} | '
                  f'{k["wymagany"] or ""} | {k["fg"] or ""} | {k["bg"] or ""} | {k["czcionka"]} |')
        if do.get('nieudane'):
            a('')
            a('### Nie udało się przetestować')
            for n in do['nieudane']:
                a(f'- `{n["strona"]}`: {md_kom(n["blad"])}')
        a('')
        a('### Liczba problemów na stronę')
        a('')
        a(', '.join(f'`{s}` {n}' for s, n in sorted(do['per_strona'].items(), key=lambda x: -x[1])))
    tekst = '\n'.join(r) + '\n'
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'raport.md'), 'w', encoding='utf-8') as f:
        f.write(tekst)
    summ = os.environ.get('GITHUB_STEP_SUMMARY')
    if summ:
        with open(summ, 'a', encoding='utf-8') as f:
            f.write(tekst[:900_000])
    n = len(zep)
    if not ind:
        print('::error title=Kontrola jakości — wynik::Kontrola nie została wykonana (brak indeksu linków — zob. błąd budowania).')
        sys.exit(1)
    if n:
        print(f'::error title=Kontrola jakości — wynik::{n} zepsutych linków wewnętrznych (błąd krytyczny). Szczegóły w adnotacjach powyżej.')
        sys.exit(1)
    print('::notice title=Kontrola jakości — wynik::Brak błędów krytycznych (zepsutych linków wewnętrznych).')


if __name__ == '__main__':
    polecenia = {'indeks': cmd_indeks, 'wewnetrzne': cmd_wewnetrzne, 'zewnetrzne': cmd_zewnetrzne,
                 'stara': cmd_stara, 'dostepnosc': cmd_dostepnosc, 'raport': cmd_raport}
    if len(sys.argv) != 2 or sys.argv[1] not in polecenia:
        print('Użycie: qa.py ' + '|'.join(polecenia))
        sys.exit(2)
    polecenia[sys.argv[1]]()
