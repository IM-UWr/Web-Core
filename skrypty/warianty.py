#!/usr/bin/env python3
"""Przełącznik wariantów wyglądu w zbudowanej stronie (wywoływany z workflow „Budowanie i publikacja strony”).

    python3 skrypty/warianty.py <dist> <adres bazowy, np. /Web-Core> <wariant> [<wariant> ...]

- Warianty są już zbudowane w <dist>/warianty/<nazwa>/.
- Podstrony z pliku wyglad-podstron.json („zrobione”) mają wybrany wygląd na main: w każdym wariancie ich strona
  zostaje zastąpiona wersją z głównej strony (linki w treści prowadzą dalej w obrębie wariantu) i nie dostaje
  przełącznika.
- Na pozostałych stronach (główna i warianty) w lewym dolnym rogu pojawia się przełącznik; na telefonie jest ukryty.

    python3 skrypty/warianty.py --zostalo <dist>

wypisuje podstrony bez wybranego wyglądu, pogrupowane według rodzaju (szablonu).
"""
import fnmatch
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAZWY = {'zwarta': 'Zwarta', 'portal': 'Portal', 'redakcyjna': 'Redakcyjna'}


def zrobione():
    cfg = json.load(open(os.path.join(ROOT, 'wyglad-podstron.json'), encoding='utf-8'))
    wzory = []
    for z in cfg.get('zrobione', []):
        s = z['strona'] if z['strona'].endswith(('/', '*')) else z['strona'] + '/'
        wzory += [s, '/en' + s]
    return wzory


def strony(katalog):
    """Adresy (np. '/', '/studia/') stron index.html w katalogu, bez podkatalogu warianty/."""
    out = {}
    for dp, dn, pliki in os.walk(katalog):
        if os.path.relpath(dp, katalog) == '.':
            dn[:] = [d for d in dn if d != 'warianty']
        if 'index.html' in pliki:
            rel = os.path.relpath(dp, katalog)
            out['/' if rel == '.' else f'/{rel}/'] = os.path.join(dp, 'index.html')
    return out


def wybrana(adres, wzory):
    return any(adres == w or fnmatch.fnmatchcase(adres, w) for w in wzory)


def pasek(base, warianty):
    kolejnosc = [w for w in NAZWY if w in warianty] + sorted(w for w in warianty if w not in NAZWY)
    linki = '<a data-wariant="" href="%s/">Obecna</a>' % base + ''.join(
        f'<a data-wariant="{w}" href="{base}/">{NAZWY.get(w, w)}</a>' for w in kolejnosc)
    return (
        '<div class="wr-pasek" data-pagefind-ignore role="navigation" aria-label="Warianty wyglądu (podgląd)"><span>Wariant:</span>'
        + linki + '</div><style>.wr-pasek{position:fixed;left:10px;bottom:10px;z-index:9999;display:flex;flex-wrap:wrap;'
        'align-items:center;gap:2px;max-width:calc(100vw - 20px);padding:4px;border-radius:999px;background:#0b1630;'
        'box-shadow:0 4px 18px rgb(0 0 0/.35);font:700 12px/1 system-ui,sans-serif}.wr-pasek span{padding:0 6px 0 8px;'
        'color:#c4cee0}.wr-pasek a{padding:8px 10px;border-radius:999px;color:#fff;text-decoration:none}.wr-pasek a:hover'
        '{background:rgb(255 255 255/.14)}.wr-pasek a[aria-current]{background:#f2a33a;color:#101828}'
        '@media (max-width:760px){.wr-pasek{display:none}}</style><script>(function(){var b=' + json.dumps(base) +
        r",p=location.pathname,s=p.slice(b.length),m=s.match(/^\/warianty\/([^\/]+)/),c=m?m[1]:'',r=(m?s.slice(m[0].length):s)||'/';"
        "document.querySelectorAll('.wr-pasek a').forEach(function(a){var w=a.getAttribute('data-wariant');"
        "a.href=b+(w?'/warianty/'+w:'')+r+location.hash;if(w===c)a.setAttribute('aria-current','true');});})();</script>"
    )


def main(dist, base, warianty):
    wzory = zrobione()
    glowne = strony(dist)
    wybrane = {a for a in glowne if wybrana(a, wzory)}
    # 1. w wariantach: wybrane podstrony = wersja z głównej strony; linki <a> do stron zostają w obrębie wariantu
    for w in warianty:
        kat = os.path.join(dist, 'warianty', w)
        if not os.path.isdir(kat):
            continue
        wzor = re.compile(r'(<a\b[^>]*?\shref=")' + re.escape(base) + r'/(?!pliki/|_astro/|warianty/|pagefind/)')
        for a in wybrane:
            html = open(glowne[a], encoding='utf-8').read()
            html = wzor.sub(lambda m: m.group(1) + f'{base}/warianty/{w}/', html)
            cel = os.path.join(kat, a.lstrip('/'), 'index.html')
            os.makedirs(os.path.dirname(cel), exist_ok=True)
            open(cel, 'w', encoding='utf-8').write(html)
    # 2. przełącznik na wszystkich stronach poza wybranymi (główna i warianty)
    p = pasek(base, warianty)
    n = 0
    korzenie = [dist] + [os.path.join(dist, 'warianty', w) for w in warianty]
    for kat in korzenie:
        for dp, dn, pliki in os.walk(kat):
            if kat == dist and os.path.relpath(dp, dist) == '.':
                dn[:] = [d for d in dn if d != 'warianty']
            for f in pliki:
                if not f.endswith('.html'):
                    continue
                rel = os.path.relpath(dp, kat)
                adres = ('/' if rel == '.' else f'/{rel}/') if f == 'index.html' else None
                if adres and adres in wybrane:
                    continue
                sciezka = os.path.join(dp, f)
                html = open(sciezka, encoding='utf-8').read()
                if '</body>' in html:
                    open(sciezka, 'w', encoding='utf-8').write(html.replace('</body>', p + '</body>', 1))
                    n += 1
    print(f'::notice title=Warianty::{", ".join(warianty)}; przełącznik na {n} stronach; '
          f'wybrany wygląd (bez przełącznika): {len(wybrane)} stron')


def szablony():
    """Trasy z src/pages (bez /en): [(wyrażenie, opis, ile stałych członów, czy catch-all)]."""
    out = []
    base = os.path.join(ROOT, 'src', 'pages')
    for dp, _, pliki in os.walk(base):
        for f in pliki:
            if not f.endswith('.astro'):
                continue
            rel = os.path.relpath(os.path.join(dp, f), base)[:-len('.astro')]
            if rel.split(os.sep)[0] == 'en':
                continue
            cz = [c for c in rel.split(os.sep) if c != 'index']
            wz, opis, stale, reszta = '', '', 0, False
            for c in cz:
                if c.startswith('[...'):
                    wz += r'(/.+)?'; opis += '/…'; reszta = True
                elif c.startswith('['):
                    wz += r'/[^/]+' if c == f'[{c[1:-1]}]' else '/' + re.sub(r'\[[^\]]+\]', '[^/]+', re.escape(c).replace(r'\[', '[').replace(r'\]', ']'))
                    opis += '/*'
                else:
                    wz += '/' + re.sub(r'\\\[[^\]]+\\\]', '[^/]+', re.escape(c)); opis += '/' + re.sub(r'\[[^\]]+\]', '*', c); stale += 1
            out.append((re.compile('^' + wz + '/?$'), (opis or '') + '/', stale, reszta))
    return out


def zostalo(dist):
    wzory = zrobione()
    trasy = szablony()
    grupy = {}
    for a in sorted(strony(dist)):
        if a.startswith('/en/') or a == '/en/' or wybrana(a, wzory):
            continue
        pasujace = [t for t in trasy if t[0].match(a.rstrip('/') or '/') or t[0].match(a)]
        if pasujace:
            t = max(pasujace, key=lambda t: (not t[3], t[2]))
            klucz = t[1] if not t[3] else '/' + a.strip('/').split('/')[0] + '/… (strony z CMS)'
        else:
            klucz = a
        grupy.setdefault(klucz, []).append(a)
    for k, v in sorted(grupy.items()):
        print(f'{len(v):4}  {k}' + (f'   np. {v[0]}' if len(v) > 1 or v[0] != k else ''))


if __name__ == '__main__':
    if sys.argv[1] == '--zostalo':
        zostalo(sys.argv[2])
    else:
        main(sys.argv[1], sys.argv[2].rstrip('/'), sys.argv[3:])
