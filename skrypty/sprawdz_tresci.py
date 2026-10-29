#!/usr/bin/env python3
"""Szybka kontrola plików treści bez budowania strony: czy frontmatter to poprawny YAML
i czy są wymagane pola. Użycie: python3 skrypty/sprawdz_tresci.py [plik lub katalog ...]"""
import sys, os, re, glob, yaml

WYMAGANE = {
    'aktualnosci': ['tytul', 'data'], 'strony': ['tytul'], 'seminaria': ['nazwa'], 'referaty': ['tytul', 'prelegent', 'termin'],
    'obrony': ['kandydat', 'tytul_rozprawy', 'termin'], 'konferencje': ['tytul', 'poczatek'], 'granty': ['tytul'],
    'zaklady': ['nazwa'], 'kierunki': ['nazwa'], 'specjalnosci': ['nazwa'], 'pracownicy': ['imie_nazwisko'],
    'warto_wiedziec': ['tytul'],
}
LISTY_OBIEKTOW = {'specjalnosci': ['opiekunowie', 'dlaczego', 'etapy', 'seminaria', 'przedmioty', 'tematy_prac', 'dokumenty', 'linki', 'faq'],
                  'kierunki': ['fakty', 'przyciski', 'dlaczego', 'etapy', 'specjalnosci', 'programy', 'terminy', 'faq', 'kontakt', 'akty']}

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
    # dokumenty: wgrany plik albo link
    dok = []
    if kol == 'kierunki':
        for pr in dane.get('programy') or []:
            dok += (pr or {}).get('dokumenty') or []
        dok += (dane.get('praktyki_dokumenty') or []) + (dane.get('akty') or [])
    if kol == 'specjalnosci':
        dok += dane.get('dokumenty') or []
    for x in dok:
        if isinstance(x, dict) and not (x.get('wgraj') or x.get('plik')):
            bledy.append(f'{p}: dokument „{x.get("nazwa", "?")}” nie ma pliku ani linku')
    if kol == 'specjalnosci':
        katalog = p.split('src/content/')[0] + 'src/content/seminaria/'
        for sid in dane.get('seminaria') or []:
            # pole „reference” z CMS zapisuje ścieżkę pliku — liczy się sama nazwa pliku
            sid = re.sub(r'\.(md|ya?ml|json)$', '', str(sid).strip().split('/')[-1])
            if not os.path.exists(f'{katalog}{sid}.md'):
                bledy.append(f'{p}: seminarium „{sid}” nie istnieje (brak pliku {katalog}{sid}.md)')
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
print('\n'.join(wszystkie) if wszystkie else f'OK — sprawdzono {len(pliki)} plików')
sys.exit(1 if wszystkie else 0)
