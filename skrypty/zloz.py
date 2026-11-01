import base64, sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src).read()
z = '/home/claude/estetyka/proto/zasoby/'
for k, f in [('{{KAMPUS}}', 'kampus-2000.jpg'), ('{{INSTYTUT}}', 'instytut-560.jpg'), ('{{KADR}}', 'instytut-kadr-1000.jpg'), ('{{INSTNAG}}', 'inst-naglowek.jpg'), ('{{NAUKANAG}}', 'nauka-naglowek.jpg'), ('{{STUDIANAG}}', 'studia-naglowek.jpg'), ('{{POPNAG}}', 'popularyzacja-naglowek.jpg'), ('{{OBECNA_INSTYTUT}}', 'obecna-instytut.jpg'), ('{{OBECNA_NAUKA}}', 'obecna-nauka.jpg'), ('{{OBECNA_STUDIA}}', 'obecna-studia.jpg'), ('{{OBECNA_POPULARYZACJA}}', 'obecna-popularyzacja.jpg'), ('{{OBECNA_WLADZE}}', 'obecna-wladze.jpg'), ('{{OBECNA_GRANTY}}', 'obecna-granty.jpg'), ('{{OBECNA_PLAN}}', 'obecna-plan.jpg'), ('{{MIN_S1}}', 'min/s1.jpg'), ('{{MIN_S2}}', 'min/s2.jpg'), ('{{MIN_S3}}', 'min/s3.jpg')]:
    if k in s:
        s = s.replace(k, 'data:image/jpeg;base64,' + base64.b64encode(open(z + f, 'rb').read()).decode())
import re as _re
s = _re.sub(r'\{\{FOT_([a-z-]+)\}\}', lambda m: 'data:image/jpeg;base64,' + base64.b64encode(open(z + 'fot/' + m.group(1) + '.jpg', 'rb').read()).decode(), s)
s = s.replace('{{LOGO}}', 'data:image/png;base64,' + base64.b64encode(open(z + 'uwr-logo.png', 'rb').read()).decode())
for k in ['MACIERZE','WARSZTATY','KOLO','OBRONA','DZIEN']:
    s = s.replace('{{MIN_'+k+'}}', 'data:image/jpeg;base64,' + base64.b64encode(open(z + 'min/' + {'MACIERZE':'macierze','WARSZTATY':'warsztaty','KOLO':'kolo','OBRONA':'obrona','DZIEN':'dzien'}[k] + '.jpg', 'rb').read()).decode())
lm = z + 'lm/'
for k, f in [('{{LM10R}}', 'lmroman10-regular'), ('{{LM10I}}', 'lmroman10-italic'), ('{{LM10B}}', 'lmroman10-bold'), ('{{LM17R}}', 'lmroman17-regular'), ('{{LMCAPS}}', 'lmromancaps10-regular')]:
    if k in s:
        s = s.replace(k, 'data:font/woff2;base64,' + base64.b64encode(open(lm + f + '.woff2', 'rb').read()).decode())
for k, f in [('{{PODPIS_L}}', 'podpis-latin.woff2'), ('{{PODPIS_E}}', 'podpis-ext.woff2')]:
    s = s.replace(k, 'data:font/woff2;base64,' + base64.b64encode(open(z + f, 'rb').read()).decode())
open(dst, 'w').write(s)
print(dst, len(s)//1024, 'KB')
