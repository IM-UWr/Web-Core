# Składa kafelki-dzialow.html: szablon.html + opisy z dane.json + prawdziwe strony działów ze strona.json (zbierz.js).
import base64, json, os, re

S = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(S + '/dane.json', encoding='utf-8'))
ST = json.load(open(S + '/strona.json', encoding='utf-8'))

opisy = dict(D['O'])
# opisy Popularyzacji: partnerzy jak w prototypie, grupa „Dla kogo” z leadu działu
for _, lista in D['G']['popularyzacja']:
    for x in lista:
        if '|' in x:
            n, o = x.split('|', 1)
            opisy.setdefault(n, o.replace(' ↗', ''))
opisy.update({'Dla uczniów': 'kółka, obozy i konkursy', 'Dla nauczycieli': 'szkolenia', 'Dla wszystkich': 'wykłady popularnonaukowe'})
grupy = dict(D['S'])
grupy.update({'Dla kogo': 'uczniowie, nauczyciele, wszyscy', 'Partnerzy': 'fundacja, portal, PTM'})


def js(o):
    # literał JS w <script>: nie może zamknąć skryptu ani wejść w stan „<!--”
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('<!--', '<\\!--')


# Obrazki używane jako maski (logo, fale tła) przeglądarka pobiera z CORS, więc idą w treści strony jako data:.
wzorce = [r"--logo[\w-]*:url\((zas/strona/[^)]+)\)", r"mask-image:\s*url\('?(zas/strona/[^')]+)'?\)"]
nazwy = set()
for w in wzorce:
    for c in ST['STY']:
        nazwy.update(re.findall(w, c))
    for s in ST['STRONY'].values():
        for t in s['tresc'].values():
            nazwy.update(re.findall(w, t))
TYP = {'.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg'}
ST['INL'] = {n: f"data:{TYP[os.path.splitext(n)[1]]};base64,{base64.b64encode(open(os.path.join(S, n), 'rb').read()).decode()}" for n in sorted(nazwy)}
print('maski', {n: len(v) // 1024 for n, v in ST['INL'].items()})

h = open(S + '/szablon.html', encoding='utf-8').read()
h = h.replace('/*DANE*/null', js({'O': opisy, 'S': grupy})).replace('/*STRONA*/null', js(ST))
open(S + '/kafelki-dzialow.html', 'w', encoding='utf-8').write(h)
print(len(h) // 1024, 'KB')
