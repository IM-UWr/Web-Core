# Składa kafelki-dzialow.html z szablon.html i dane.json. Uruchamiać z katalogu web-core (czyta proto/).
import json, os, re

S = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(S + '/dane.json', encoding='utf-8'))
d = json.load(open('proto/zasoby/dane-dzialow.json', encoding='utf-8'))
t = open('proto/zalozyciele.src.html', encoding='utf-8').read()
m = re.search(r"IN_INST = \{.*?tekst: \[\s*'((?:[^'\\]|\\.)*)'", t, re.S)


def pierwsze(s, n=2):
    # „m.in.” nie kończy zdania
    return ' '.join(re.split(r'(?<=[.!?])(?<!m\.in\.)\s+', s)[:n])


D['H'] = {
    'instytut': 'Wrocławska szkoła matematyczna',
    'nauka': 'Poznaj nasze badania na A+',
    'studia': 'Studiuj matematykę we Wrocławiu',
    'popularyzacja': 'Matematyka dla wszystkich ciekawych',
}
D['T'] = {
    'instytut': ['O Instytucie', pierwsze(m.group(1))],
    'nauka': ['Badania w Instytucie', pierwsze(d['nauka']['tekst'][0])],
    'studia': ['O studiach', pierwsze(d['studia']['tekst'][0])],
    'popularyzacja': ['O popularyzacji', d['popularyzacja']['lead']],
}
js = json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
h = open(S + '/szablon.html', encoding='utf-8').read().replace('/*DANE*/null', js)
open(S + '/kafelki-dzialow.html', 'w', encoding='utf-8').write(h)
print(len(h) // 1024, 'KB')
for k, v in D['T'].items():
    print(k, '|', v[1])
print({k: [len(g[1]) for g in v] for k, v in D['G'].items()})
