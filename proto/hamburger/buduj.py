# Składa hamburger.html: szablon.html + prawdziwa strona ze strona.json (zbierz.js).
import base64, json, os, re

S = os.path.dirname(os.path.abspath(__file__))
ST = json.load(open(S + '/strona.json', encoding='utf-8'))
wzorce = [r"--logo[\w-]*:url\((zas/[^)]+)\)", r"mask-image:\s*url\('?(zas/[^')]+)'?\)"]
nazwy = set()
for w in wzorce:
    for c in ST['STY'] + list(ST['tresc'].values()):
        nazwy.update(re.findall(w, c))
TYP = {'.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg'}
ST['INL'] = {n: f"data:{TYP[os.path.splitext(n)[1]]};base64,{base64.b64encode(open(os.path.join(S, n), 'rb').read()).decode()}" for n in sorted(nazwy)}


def js(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('<!--', '<\\!--')


h = open(S + '/szablon.html', encoding='utf-8').read().replace('/*STRONA*/null', js(ST))
open(S + '/hamburger.html', 'w', encoding='utf-8').write(h)
tekst = ''.join(ST['STY']) + ''.join(ST['tresc'].values())
pliki = sorted(n for n in set(re.findall(r'zas/[\w.-]+', tekst)) if n not in ST['INL'])
json.dump({n: n for n in pliki}, open(S + '/pliki.json', 'w'))
print(len(h) // 1024, 'KB;', len(pliki), 'plików', sum(os.path.getsize(os.path.join(S, n)) for n in pliki) // 1024, 'KB')
print(json.dumps({n: n for n in pliki}))
