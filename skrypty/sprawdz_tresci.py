#!/usr/bin/env python3
"""Szybka kontrola plików treści bez budowania strony: czy frontmatter to poprawny YAML
i czy są wymagane pola. Użycie: python3 skrypty/sprawdz_tresci.py [plik lub katalog ...]"""
import sys, os, re, glob, json, yaml

WYMAGANE = {
    'aktualnosci': ['tytul', 'data'], 'strony': ['tytul'], 'seminaria': ['nazwa'], 'referaty': ['tytul', 'prelegent', 'termin'],
    'obrony': ['kandydat', 'tytul_rozprawy', 'termin'], 'konferencje': ['tytul', 'poczatek'], 'granty': ['tytul'],
    'zaklady': ['nazwa'], 'kierunki': ['nazwa'], 'specjalnosci': ['nazwa'], 'pracownicy': ['imie_nazwisko'],
    'warto_wiedziec': ['tytul'],
}
# Specjalności mają wszystkie dane w Markdownie; banery kierunków i przypomnienia pozostają plikami JSON.
LISTY_OBIEKTOW = {}

def sprawdz(p):
    bledy = []
    txt = open(p, encoding='utf-8').read()
    kol = p.split('src/content/')[1].split('/')[0] if 'src/content/' in p else ''
    if p.endswith(('.yml', '.yaml')):
        dane = yaml.safe_load(txt)
    else:
        if not txt.startswith('---\n'):
            return [f'{p}: brak frontmattera (plik musi zaczynać się od ---)']
        try:
            fm = txt.split('---\n', 2)[1]
        except IndexError:
            return [f'{p}: niezamknięty frontmatter']
        try:
            dane = yaml.safe_load(fm)
        except yaml.YAMLError as e:
            return [f'{p}: błąd YAML: {e}']
    if not isinstance(dane, dict):
        return [f'{p}: frontmatter nie jest słownikiem']
    if kol in ('zaklady', 'warto_wiedziec'):
        # zlecenie 30: pola karty w grupie „Karta” formularza (obiekt karta) — strona czyta je jak pola zwykłe (content.config.ts)
        karta = dane.pop('karta', None)
        if karta is not None and not isinstance(karta, dict):
            return [f'{p}: pole „karta” musi być grupą pól (obiektem)']
        dane = {**(karta or {}), **dane}
    for k in WYMAGANE.get(kol, []):
        if not dane.get(k):
            bledy.append(f'{p}: brak wymaganego pola „{k}”')
    for k in LISTY_OBIEKTOW.get(kol, []):
        v = dane.get(k)
        if v is not None and not isinstance(v, list):
            bledy.append(f'{p}: pole „{k}” musi być listą')
    for k in ('umiejetnosci', 'umiejetnosci_en', 'zrodla', 'do_uzupelnienia', 'obszary', 'obszary_en', 'prowadzacy', 'promotorzy'):
        v = dane.get(k)
        if isinstance(v, list):
            for el in v:
                if not isinstance(el, str):
                    bledy.append(f'{p}: element listy „{k}” nie jest tekstem (np. „: ” w środku — weź tekst w cudzysłów): {el!r}'[:300])
    if dane.get('status_publikacji', 'oficjalna') not in ('oficjalna', 'podglad'):
        bledy.append(f'{p}: nieprawidłowy status_publikacji')
    if kol == 'specjalnosci' and dane.get('sposob_prezentacji', 'cms') not in ('cms', 'zewnetrzna'):
        bledy.append(f'{p}: nieprawidłowy sposob_prezentacji')
    if kol == 'pracownicy':
        # Numery telefonów podajemy wyłącznie przy administracji (brak pola grupa = nauczyciel).
        grupa = dane.get('grupa') or 'nauczyciel'
        if grupa != 'administracja' and str(dane.get('telefon') or '').strip():
            bledy.append(f'{p}: pole „telefon” jest dozwolone tylko dla grupy „administracja” (tu: „{grupa}”) — usuń numer')
    if kol == 'warto_wiedziec':
        # „Warto wiedzieć”: dział z listy, pola tak/nie jako wartości logiczne, obraz musi istnieć w public/
        dz = dane.get('dzial')
        if dz not in (None, '', 'nauka', 'studia', 'instytut'):
            bledy.append(f'{p}: pole „dzial” musi być jednym z: nauka, studia, instytut (tu: „{dz}”)')
        for k in ('na_glownej', 'opublikowany'):
            if dane.get(k) not in (None, '', True, False):
                bledy.append(f'{p}: pole „{k}” musi mieć wartość true albo false')
        obraz = str(dane.get('obraz') or '')
        if obraz.startswith('/pliki/') and not os.path.exists(p.split('src/content/')[0] + 'public' + obraz):
            bledy.append(f'{p}: brak pliku obrazu public{obraz}')
    return bledy

pliki = []
for a in sys.argv[1:] or ['src/content']:
    if os.path.isdir(a):
        pliki += [f for f in glob.glob(f'{a}/**/*', recursive=True) if f.endswith(('.md', '.yml', '.yaml'))]
    else:
        pliki.append(a)
wszystkie = [b for p in pliki for b in sprawdz(p)]

# Kierunki (zlecenie 28): baner <id>.json tylko dla istniejącego kierunku; przypomnienia o terminach — sprawa i data RRRR-MM-DD.
# Tylko bez argumentów (pełna kontrola), jak ciekawostki niżej.
if not sys.argv[1:]:
    for p in sorted(glob.glob('src/content/kierunki-baner/*.json')):
        pliki.append(p)
        try:
            b = json.load(open(p, encoding='utf-8'))
        except ValueError as e:
            wszystkie.append(f'{p}: błąd JSON: {e}')
            continue
        if not os.path.exists(f"src/content/kierunki/{os.path.basename(p)[:-5]}.md"):
            wszystkie.append(f'{p}: nie ma kierunku o tej nazwie pliku (src/content/kierunki/{os.path.basename(p)[:-5]}.md)')
        if not isinstance(b.get('liczby', []), list):
            wszystkie.append(f'{p}: pole „liczby” musi być listą')
    # Specjalności: tekst, baner i powiązania w jednym pliku Web-Studia.
    for p in sorted(glob.glob('src/content/specjalnosci/*.md')):
        tekst = open(p, encoding='utf-8').read()
        b = yaml.safe_load(re.match(r'^---\n(.*?)\n---\n', tekst, re.S).group(1))
        kier = re.sub(r'\.(md|ya?ml|json)$', '', str(b.get('kierunek') or 'matematyka').strip().split('/')[-1])
        if not os.path.exists(f'src/content/kierunki/{kier}.md'):
            wszystkie.append(f'{p}: kierunek „{kier}” nie istnieje')
        for sid in b.get('seminaria') or []:
            sid = re.sub(r'\.(md|ya?ml|json)$', '', str(sid).strip().split('/')[-1])
            if not os.path.exists(f'src/content/seminaria/{sid}.md'):
                wszystkie.append(f'{p}: seminarium „{sid}” nie istnieje')
        for k in ('opiekunowie', 'seminaria'):
            if not isinstance(b.get(k, []), list):
                wszystkie.append(f'{p}: pole „{k}” musi być listą')
        for i, o in enumerate(b.get('opiekunowie') or []):
            if not (isinstance(o, dict) and str(o.get('imie_nazwisko') or '').strip()):
                wszystkie.append(f'{p}: opiekun {i + 1}: brak imienia i nazwiska')
    # Strony działów (Popularyzacja — zlecenie 29; Instytut, Nauka, Studia — zlecenie 30): nagłówek pliku z tytułem,
    # „W skrócie” jako lista wartości z opisem; brak pliku nic nie psuje (tytuł z kodu, bez tekstu).
    for p in ('src/data/popularyzacja.md', 'src/data/instytut.md', 'src/data/nauka.md', 'src/data/studia.md'):
        if not os.path.exists(p):
            continue
        pliki.append(p)
        tekst = open(p, encoding='utf-8').read()
        m = re.match(r'^---\n(.*?)\n---\n', tekst, re.S)
        try:
            d = yaml.safe_load(m.group(1)) if m else None
        except yaml.YAMLError as e:
            d = None
            wszystkie.append(f'{p}: błąd YAML: {e}')
        if not isinstance(d, dict) or not d.get('tytul'):
            wszystkie.append(f'{p}: brak nagłówka pliku z polem „tytul”')
            continue
        for i, t in enumerate(d.get('tradycja') or []):
            if not isinstance(t.get('rok'), int) or not t.get('nazwa'):
                wszystkie.append(f'{p}: lata tradycji {i + 1}: rok (liczba) i nazwa są wymagane')
        for k in ('o_popularyzacji_fakty', 'o_instytucie_fakty', 'badania_fakty', 'o_studiach_fakty'):
            for i, f in enumerate(d.get(k) or []):
                if not (isinstance(f, dict) and str(f.get('wartosc') or '').strip()):
                    wszystkie.append(f'{p}: „W skrócie” {i + 1}: brak wartości')
    p = 'src/data/przypomnienia.json'
    if os.path.exists(p):
        pliki.append(p)
        for i, t in enumerate(json.load(open(p, encoding='utf-8')).get('przypomnienia') or []):
            if not t.get('sprawa'):
                wszystkie.append(f'{p}: przypomnienie {i + 1}: brak sprawy')
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(t.get('data') or '')[:10]):
                wszystkie.append(f'{p}: przypomnienie {i + 1} („{t.get("sprawa", "?")}”): data musi mieć postać RRRR-MM-DD')

# Ciekawostki patronów: nazwisko patrona w każdej karcie (src/data/ciekawostki/README.md). Tylko bez argumentów, czyli przy pełnej kontroli.
# Zaimków nie sprawdzamy: w „kierował nim Marczewski” słowo „nim” to Instytut.
PATRONI = {'instytut': 'Marczewsk', 'nauka': 'Ślebodzińsk', 'studia': 'Knaster', 'popularyzacja': 'Steinhaus'}
kart = 0
if not sys.argv[1:]:
    for dzial, rdzen in PATRONI.items():
        p = f'src/data/ciekawostki/{dzial}.json'
        for k in json.load(open(p, encoding='utf-8')):
            kart += 1
            if rdzen not in f"{k.get('nazwa', '')} {k.get('zdanie', '')}":
                wszystkie.append(f"{p}: {k.get('id')}: brak nazwiska patrona (PL)")
            # puste zdanie_en: /en pokazuje tekst polski
            if k.get('zdanie_en') and rdzen not in f"{k.get('nazwa_en', '')} {k['zdanie_en']}":
                wszystkie.append(f"{p}: {k.get('id')}: brak nazwiska patrona (EN)")

print('\n'.join(wszystkie) if wszystkie else f'OK — sprawdzono {len(pliki)} plików' + (f' i {kart} ciekawostek' if kart else ''))
sys.exit(1 if wszystkie else 0)
