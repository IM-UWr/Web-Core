#!/usr/bin/env python3
"""Szybka kontrola plików treści bez budowania strony: czy frontmatter to poprawny YAML
i czy są wymagane pola. Użycie: python3 skrypty/sprawdz_tresci.py [plik lub katalog ...]
Ostrzeżenia (np. pusta pozycja listy, którą strona pominie) wypisuje, ale nie kończy się przez nie błędem."""
import sys, os, re, glob, json, yaml


class Wczytywacz(yaml.SafeLoader):
    """YAML jak w Pages CMS i Astro (YAML 1.2): „13:00” to tekst, a nie liczba sześćdziesiątkowa 780 (YAML 1.1, PyYAML)."""


def _bez_szescdziesiatkowych(typ):
    def konstruktor(loader, node):
        if ':' in str(node.value):
            return loader.construct_scalar(node)
        return getattr(yaml.SafeLoader, f'construct_yaml_{typ}')(loader, node)
    return konstruktor


Wczytywacz.add_constructor('tag:yaml.org,2002:int', _bez_szescdziesiatkowych('int'))
Wczytywacz.add_constructor('tag:yaml.org,2002:float', _bez_szescdziesiatkowych('float'))

# Listy obiektów, w których bez pola pozycja nie ma sensu — strona pomija taką pozycję z ostrzeżeniem w logu budowy
# (WYMAGANE_W_LISTACH w src/content.config.ts, zlecenie 31). Z kropką: lista w obiekcie.
WYMAGANE_W_LISTACH = {
    'aktualnosci': {'galeria': ['plik'], 'zalaczniki': ['plik'], 'termin': ['dzien'], 'zgloszenia': ['do_dnia']},
    'strony': {'liczby': ['n', 'etykieta']},
    'referaty': {'pliki': ['plik']},
    'obrony': {'recenzje': ['recenzent', 'plik']},
    'kierunki': {'baner.liczby': ['wartosc', 'etykieta']},
    'specjalnosci': {'baner.liczby': ['n', 'etykieta']},
}
GODZINA = re.compile(r'^(|([01]?[0-9]|2[0-3])[:.][0-5][0-9])$')
ostrzezenia = []


def pusta(v):
    return v is None or (isinstance(v, str) and not v.strip())


def puste_pozycje(p, dane, sciezka=''):
    """Każda całkiem pusta pozycja dowolnej listy obiektów (np. „- {}” po „Add an item” bez wypełnienia)."""
    if isinstance(dane, dict):
        for k, v in dane.items():
            puste_pozycje(p, v, f'{sciezka}.{k}' if sciezka else str(k))
    elif isinstance(dane, list):
        for i, x in enumerate(dane):
            if isinstance(x, dict):
                if all(pusta(w) or (k == 'pozycja' and w is False) for k, w in x.items()):
                    ostrzezenia.append(f'{p}: {sciezka}, pozycja {i + 1} jest pusta — strona ją pominie; usuń ją w CMS ikoną kosza')
                else:
                    puste_pozycje(p, x, f'{sciezka}[{i + 1}]')

WYMAGANE = {
    'aktualnosci': ['tytul', 'data'], 'strony': ['tytul'], 'seminaria': ['nazwa'], 'referaty': ['tytul', 'prelegent', 'termin'],
    'obrony': ['kandydat', 'tytul_rozprawy', 'termin'], 'konferencje': ['tytul', 'poczatek'], 'granty': ['tytul'],
    'zaklady': ['nazwa'], 'kierunki': ['nazwa'], 'specjalnosci': ['nazwa'], 'pracownicy': ['imie_nazwisko'],
    'warto_wiedziec': ['tytul'],
}
# Kierunki (zlecenie 28) i specjalności (zlecenie 29): treść to Markdown (body i tresc_en), bez list obiektów; baner, przypomnienia
# i „Baner i kafelek” specjalności — JSON, sprawdzane niżej (tak jak strona działu Popularyzacja, src/data/popularyzacja.md).
LISTY_OBIEKTOW = {}

def sprawdz(p):
    bledy = []
    txt = open(p, encoding='utf-8').read()
    kol = p.split('src/content/')[1].split('/')[0] if 'src/content/' in p else ''
    if p.endswith(('.yml', '.yaml')):
        dane = yaml.load(txt, Loader=Wczytywacz)
    else:
        if not txt.startswith('---\n'):
            return [f'{p}: brak frontmattera (plik musi zaczynać się od ---)']
        try:
            fm = txt.split('---\n', 2)[1]
        except IndexError:
            return [f'{p}: niezamknięty frontmatter']
        try:
            dane = yaml.load(fm, Loader=Wczytywacz)
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
    # zlecenie 31: pozycje list bez wymaganego pola (strona je pomija) i całkiem puste pozycje dowolnych list
    for sciezka, wymagane in WYMAGANE_W_LISTACH.get(kol, {}).items():
        gora, _, dol = sciezka.partition('.')
        lista = (dane.get(gora) if isinstance(dane.get(gora), dict) else {}).get(dol) if dol else dane.get(gora)
        for i, x in enumerate(lista if isinstance(lista, list) else []):
            brak = [k for k in wymagane if not isinstance(x, dict) or pusta(x.get(k))]
            if brak and isinstance(x, dict) and any(not pusta(w) and w is not False for w in x.values()):
                ostrzezenia.append(f'{p}: {sciezka}, pozycja {i + 1} bez pola {", ".join(f"„{k}”" for k in brak)} — strona ją pominie')
    puste_pozycje(p, dane)
    if kol == 'aktualnosci':
        # zlecenie 31: termin wydarzenia jako grupa „termin” (lista, najwyżej jedna pozycja)
        termin = [t for t in (dane.get('termin') or []) if isinstance(t, dict) and not pusta(t.get('dzien'))]
        stary = not pusta(dane.get('wydarzenie_poczatek'))
        rodzaj = dane.get('rodzaj') or 'ogloszenie'
        if stary:
            ostrzezenia.append(f'{p}: stary zapis terminu (wydarzenie_*) — przenieś do pola „termin” (skrypty/migracja/termin.py)')
        if rodzaj == 'wydarzenie' and not termin and not stary:
            ostrzezenia.append(f'{p}: rodzaj „wydarzenie” bez terminu — wpis nie trafi do Kalendarza (dodaj „Termin wydarzenia” albo zmień rodzaj)')
        if rodzaj in ('sukces', 'kariera') and (termin or stary):
            ostrzezenia.append(f'{p}: termin wydarzenia przy rodzaju „{rodzaj}” — to zwykle pomyłka (dzień informacji wpisuje się w „Data”)')
        if len(termin) > 1:
            ostrzezenia.append(f'{p}: termin ma {len(termin)} pozycje — strona bierze pierwszą')
        for t in termin:
            for k in ('godzina', 'godzina_konca'):
                if not pusta(t.get(k)) and not GODZINA.match(str(t.get(k)).strip()):
                    ostrzezenia.append(f'{p}: termin.{k} „{t.get(k)}” to nie godzina w formacie 13:00 — strona ją pominie')
        # zlecenie 44: termin zgłoszeń tylko w ofertach („Kariera”); nazwa pliku „kariera” zajęta przez stronę ofert
        zgloszenia = [t for t in (dane.get('zgloszenia') or []) if isinstance(t, dict) and not pusta(t.get('do_dnia'))]
        if zgloszenia and rodzaj != 'kariera':
            ostrzezenia.append(f'{p}: termin zgłoszeń przy rodzaju „{rodzaj}” — strona go pominie (termin zgłoszeń jest tylko dla ofert: Rodzaj „Kariera”)')
        if len(zgloszenia) > 1:
            ostrzezenia.append(f'{p}: termin zgłoszeń ma {len(zgloszenia)} pozycje — strona bierze pierwszą')
        for t in zgloszenia:
            if not re.match(r'^\d{4}-\d{2}-\d{2}', str(t.get('do_dnia'))):
                bledy.append(f'{p}: termin zgłoszeń „{t.get("do_dnia")}” to nie data RRRR-MM-DD')
        if os.path.basename(p) == 'kariera.md':
            bledy.append(f'{p}: nazwa pliku „kariera” jest zajęta przez stronę ofert /aktualnosci/kariera — zmień nazwę pliku (strona pominie ten wpis)')
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
        pliki += [f.replace(os.sep, '/') for f in glob.glob(f'{a}/**/*', recursive=True) if f.endswith(('.md', '.yml', '.yaml'))]
    else:
        pliki.append(a.replace(os.sep, '/'))
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
    # Specjalności (zlecenie 29): „Baner i kafelek” <id>.json tylko dla istniejącej specjalności, kierunek i seminaria istnieją,
    # opiekunowie — lista z imieniem i nazwiskiem.
    for p in sorted(glob.glob('src/content/specjalnosci-baner/*.json')):
        pliki.append(p)
        try:
            b = json.load(open(p, encoding='utf-8'))
        except ValueError as e:
            wszystkie.append(f'{p}: błąd JSON: {e}')
            continue
        if not os.path.exists(f"src/content/specjalnosci/{os.path.basename(p)[:-5]}.md"):
            wszystkie.append(f'{p}: nie ma specjalności o tej nazwie pliku (src/content/specjalnosci/{os.path.basename(p)[:-5]}.md)')
        # pole „reference” z CMS (Web-Studia) zapisuje ścieżkę pliku — liczy się sama nazwa pliku
        kier = re.sub(r'\.(md|ya?ml|json)$', '', str(b.get('kierunek') or 'matematyka').strip().split('/')[-1])
        if not os.path.exists(f'src/content/kierunki/{kier}.md'):
            wszystkie.append(f'{p}: kierunek „{kier}” nie istnieje (brak pliku src/content/kierunki/{kier}.md)')
        for sid in b.get('seminaria') or []:
            sid = re.sub(r'\.(md|ya?ml|json)$', '', str(sid).strip().split('/')[-1])
            if not os.path.exists(f'src/content/seminaria/{sid}.md'):
                wszystkie.append(f'{p}: seminarium „{sid}” nie istnieje (brak pliku src/content/seminaria/{sid}.md)')
        for k in ('opiekunowie', 'seminaria', 'zrodla', 'do_uzupelnienia'):
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
    # zlecenie 31: całkiem puste pozycje list w plikach danych (src/data) i banerach JSON
    for p in sorted(glob.glob('src/data/**/*.json', recursive=True) + glob.glob('src/data/*.md')
                    + glob.glob('src/content/*-baner/*.json')):
        p = p.replace(os.sep, '/')
        try:
            if p.endswith('.json'):
                d = json.load(open(p, encoding='utf-8'))
            else:
                m = re.match(r'^---\n(.*?)\n---\n', open(p, encoding='utf-8').read(), re.S)
                d = yaml.load(m.group(1), Loader=Wczytywacz) if m else None
        except (ValueError, yaml.YAMLError):
            continue  # błąd składni zgłasza kontrola wyżej (pliki, które strona czyta)
        puste_pozycje(p, d)
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

for o in ostrzezenia:
    print(f'Ostrzeżenie: {o}')
print('\n'.join(wszystkie) if wszystkie else f'OK — sprawdzono {len(pliki)} plików' + (f' i {kart} ciekawostek' if kart else '')
      + (f'; ostrzeżeń: {len(ostrzezenia)}' if ostrzezenia else ''))
sys.exit(1 if wszystkie else 0)
