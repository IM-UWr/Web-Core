#!/usr/bin/env python3
# Składa galerię kandydatów na zdjęcia: zdjecia/<agent>/KANDYDACI.json → zdjecia/galeria.html
# Uruchamiać ponownie po każdej aktualizacji wyników agentów.
import base64, collections, io, json, re, sys
from urllib.parse import urlparse
from PIL import Image

KORZEN = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/web-core'
AGENCI = {'archiwum': 'archiwum', 'commons': 'Commons i otwarte licencje', 'uwr-okladka': 'źródła UWr i okładka'}
SZABLON = sys.argv[2] if len(sys.argv) > 2 else __file__.replace('galeria.py', 'galeria.szablon.html')

W = []
for a in AGENCI:
    for x in json.load(open(f'{KORZEN}/zdjecia/{a}/KANDYDACI.json', encoding='utf-8')):
        x['_a'] = a
        W.append(x)


def host(u):
    return urlparse(u or '').netloc.lower().removeprefix('www.')


def klucz(x):
    u = x.get('obraz') or x.get('miniatura') or ''
    if not u:
        return None
    n = u.split('?')[0].rsplit('/', 1)[-1].lower()
    n = re.sub(r'-\d{2,5}x\d{2,5}(?=\.\w+$)', '', n)
    n = re.sub(r'-(scaled|\d+)(?=\.\w+$)', lambda m: '' if m.group(1) == 'scaled' else m.group(0), n)
    return host(u) + '/' + n


NASZE = re.compile(r'(^|\.)(uwr\.edu\.pl|math\.uni\.wroc\.pl|uni\.wroc\.pl)$')
OBCE = re.compile(r'^(fmw|ptm)\.')


def rodzaj_praw(g):
    if any(str(x.get('prawa') or '').startswith('wolne') for x in g):
        return 'wolne'
    if any(str(x.get('prawa') or '').startswith('nasze') or x.get('licencja') == 'prawa UWr/IM' for x in g):
        return 'nasze'
    for x in g:
        for u in (x.get('strona'), x.get('obraz')):
            h = host(u)
            if NASZE.search(h) and not OBCE.match(h):
                return 'nasze'
    return 'ustalic'


OSOBY = re.compile(r'(osob\w*|osób|studen\w*|uczni\w*|uczestni\w*|słuchacz\w*|prowadząc\w*)[^.]{0,60}(rozpoznawal\w*|zgod\w*)'
                   r'|rozpoznawal\w*[^.]{0,30}(osob\w*|osoby|studen\w*|uczni\w*|uczestni\w*)|zgod\w* osób|wizerun', re.I)
OSOBY_T = re.compile(r'studenci|uczniowie|panie z|grupa osób|immatrykulacja|doktoranci', re.I)


def uczniowie(g):
    return any(str(x.get('wizerunek') or '').startswith('uczniowie') for x in g)


def osoby(g):
    for x in g:
        if str(x.get('wizerunek') or '').startswith(('tak', 'możliwe', 'uczniowie')):
            return True
        t = ' '.join(str(x.get(f) or '') for f in ('kompozycja', 'dlaczego', 'uwagi'))
        if OSOBY.search(t) or OSOBY_T.search(x.get('tytul') or ''):
            return True
    return False


def pierwszy(g, pole, zle=('', None, 'nieznany', 'nieznane', 'nieznana', 'null')):
    for x in g:
        v = x.get(pole)
        if v not in zle:
            return v
    return None


grupy = collections.OrderedDict()
tropy = []
for x in W:
    k = klucz(x)
    if k is None:
        tropy.append(x)
    else:
        grupy.setdefault(k, []).append(x)

PRE = {'okladka': 'O', 'instytut': 'I', 'nauka': 'N', 'studia': 'S', 'popularyzacja': 'P', 'ogolne': 'G'}
karty = collections.defaultdict(list)
for k, g in grupy.items():
    naj = max(g, key=lambda x: x.get('szer') or 0)
    szer, wys = naj.get('szer'), naj.get('wys')
    obraz = naj.get('obraz') or pierwszy(g, 'obraz')
    mini = pierwszy(g, 'miniatura')
    if not mini and obraz:
        mini = obraz + ('&w=900' if 'images.unsplash.com' in obraz and '?' in obraz else '?w=900' if 'images.unsplash.com' in obraz else '')
    pr = rodzaj_praw(g)
    lic = pierwszy(g, 'licencja') or 'nieznana'
    if pr == 'wolne':
        lic = next((x['licencja'] for x in g if str(x.get('prawa') or '').startswith('wolne') and x.get('licencja')), lic)
    uw = []
    if szer and szer > 10000:
        uw.append('Rozmiar pliku to prawdopodobnie powiększenie do druku; oryginał z tej sesji ma raczej ok. 5616×3744 (przypuszczenie agenta).')
    sekcje = collections.OrderedDict()
    for x in g:
        sekcje.setdefault(x.get('dzial') or 'ogolne', []).append(x)
    for s, gs in sekcje.items():
        gl = max(gs, key=lambda x: (x.get('ocena') or 0, len(x.get('kompozycja') or '')))
        tekst = lambda pole: ' '.join(dict.fromkeys(str(x.get(pole)) for x in gs if x.get(pole)))
        karty[s].append({
            'k': k, 's': s, 't': gl.get('tytul') or '', 'm': mini, 'o': obraz, 'p': gl.get('strona') or naj.get('strona'),
            'w': szer, 'h': wys, 'l': lic, 'a': pierwszy(g, 'autor'), 'pr': pr, 'os': osoby(g), 'ucz': uczniowie(g), 'oc': max((x.get('ocena') or 0) for x in gs),
            'ko': tekst('kompozycja'), 'd': tekst('dlaczego'), 'u': ' '.join(uw + ([tekst('uwagi')] if tekst('uwagi') else [])),
            'ag': sorted({AGENCI[x['_a']] for x in g}),
        })

kolej = {'nasze': 0, 'wolne': 1, 'ustalic': 2}
for s, L in karty.items():
    L.sort(key=lambda c: (-c['oc'], kolej[c['pr']], -(c['w'] or 0)))
    for i, c in enumerate(L, 1):
        c['nr'] = f'{PRE[s]}{i}'

tr = [{'s': x.get('dzial') or 'ogolne', 't': x.get('tytul') or '', 'p': x.get('strona'), 'n': x.get('kompozycja') or x.get('dlaczego') or '',
       'ag': AGENCI[x['_a']]} for x in tropy]
tr.sort(key=lambda t: list(PRE).index(t['s']))


def obecne(nazwa, szer=1000):
    im = Image.open(f'{KORZEN}/proto/zasoby/{nazwa}').convert('RGB')
    if im.width > szer:
        im = im.resize((szer, round(im.height * szer / im.width)), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, 'JPEG', quality=68, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


OBECNE = {'okladka': obecne('kampus-2000.jpg', 1100), 'instytut': obecne('inst-naglowek.jpg'), 'nauka': obecne('nauka-naglowek.jpg'),
          'studia': obecne('studia-naglowek.jpg'), 'popularyzacja': obecne('popularyzacja-naglowek.jpg')}

dane = {'karty': karty, 'tropy': tr, 'obecne': OBECNE}
js = json.dumps(dane, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
html = open(SZABLON, encoding='utf-8').read().replace('/*DANE*/null', js)
wy = f'{KORZEN}/zdjecia/galeria.html'
open(wy, 'w', encoding='utf-8').write(html)
print('zapisano', wy, round(len(html.encode()) / 1024), 'KB')
print('kart', {s: len(L) for s, L in karty.items()}, 'unikalnych', len(grupy), 'tropów', len(tr))
print('prawa', collections.Counter(c['pr'] for L in karty.values() for c in L), 'osoby', sum(c['os'] for L in karty.values() for c in L))
print('bez miniatury', sum(1 for L in karty.values() for c in L if not c['m']))
