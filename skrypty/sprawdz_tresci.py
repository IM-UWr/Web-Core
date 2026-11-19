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
        # zlecenie 54 (cofnięcie 49): strona czyta starą wartość jak „wydarzenie” (src/content.config.ts)
        if rodzaj == 'seminarium-wydzialowe':
            ostrzezenia.append(f'{p}: stary rodzaj „Seminarium wydziałowe” — strona traktuje wpis jak „Wydarzenie”; zmień Rodzaj w CMS')
            rodzaj = 'wydarzenie'
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
        # „Warto wiedzieć”: pola tak/nie jako wartości logiczne, obraz musi istnieć w public/; zlecenie 47: trzy grupy w podkatalogach
        # (sylwetki/, nagrody/, historie/) i te same ostrzeżenia co przy budowie (src/lib/wartoWiedziec.ts, naWW)
        for k in ('na_glownej', 'opublikowany', 'ulubione', 'zawsze'):
            if dane.get(k) not in (None, '', True, False):
                bledy.append(f'{p}: pole „{k}” musi mieć wartość true albo false')
        obraz = str(dane.get('obraz') or '')
        if obraz.startswith('/pliki/') and not os.path.exists(p.split('src/content/')[0] + 'public' + obraz):
            bledy.append(f'{p}: brak pliku obrazu public{obraz}')
        sprawdz_ww(p, dane)
    return bledy


WW_GRUPY = {'sylwetki': 'Sylwetki', 'nagrody': 'Nagrody i wyróżnienia', 'historie': 'Historie'}
ww_nazwy = {}  # nazwa pliku → [(grupa, plik)]: adres /instytut/warto-wiedziec/<plik> jest wspólny dla trzech grup


def sprawdz_ww(p, dane):
    reszta = p.split('src/content/warto_wiedziec/')[1]
    grupa = reszta.split('/')[0] if '/' in reszta else 'historie'
    if '/' not in reszta:
        ostrzezenia.append(f'{p}: plik w starym układzie (wprost w warto_wiedziec/) — strona traktuje go jak historię; przenieś do sylwetki/, nagrody/ albo historie/')
    if grupa not in WW_GRUPY or not p.endswith('.md'):
        return
    ww_nazwy.setdefault(os.path.basename(p)[:-3], []).append((grupa, p))
    dodano = str(dane.get('dodano') or '').strip()
    if dodano and not re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])', dodano):
        ostrzezenia.append(f'{p}: „Dodano” „{dodano}” to nie data RRRR-MM-DD — strona pominie pole (bez „Nowe”)')
    rocznica = str(dane.get('rocznica_urodzin' if grupa == 'sylwetki' else 'rocznica') or '').strip()
    if rocznica and not re.fullmatch(r'(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])', rocznica):
        ostrzezenia.append(f'{p}: rocznica „{rocznica}” to nie data MM-DD — strona pominie pole')
    if grupa == 'historie':
        rok = str(dane.get('rok') or '').strip()
        if not re.fullmatch(r'\d{4}', rok):
            ostrzezenia.append(f'{p}: {f"rok „{rok}” to nie rok (4 cyfry)" if rok else "brak roku"} — historia nie stanie na osi czasu')
    if grupa == 'sylwetki':
        # pole „Lata” (wzór: parsujLata w src/lib/ww.mjs): rok, „ur. rok” albo dwa lata z kreską; inny tekst — ostrzeżenie
        lata = str(dane.get('lata') or '').strip()
        if lata and not re.fullmatch(r'(?i)(?:(?:ur|b)\.?\s*)?\d{4}(?:\s*[-–—]\s*\d{4})?', lata):
            ostrzezenia.append(f'{p}: Lata: nie data („{lata}”) — strona pokaże tak, jak wpisane')


def sprawdz_ww_nazwy():
    """Ta sama nazwa pliku w dwóch grupach: wspólny adres — strona zostawia pierwszy (sylwetki, nagrody, historie), drugi pomija."""
    for nazwa, lista in sorted(ww_nazwy.items()):
        if len(lista) > 1:
            lista = sorted(lista, key=lambda x: list(WW_GRUPY).index(x[0]))
            for grupa, p in lista[1:]:
                ostrzezenia.append(f'{p}: nazwa pliku „{nazwa}” jest już w grupie {WW_GRUPY[lista[0][0]]} ({lista[0][1]}) — adres jest wspólny, '
                                   'strona pominie ten wpis; zmień nazwę pliku')

pliki = []
for a in sys.argv[1:] or ['src/content']:
    if os.path.isdir(a):
        pliki += [f.replace(os.sep, '/') for f in glob.glob(f'{a}/**/*', recursive=True) if f.endswith(('.md', '.yml', '.yaml'))]
    else:
        pliki.append(a.replace(os.sep, '/'))
wszystkie = [b for p in pliki for b in sprawdz(p)]
sprawdz_ww_nazwy()


def sprawdz_grafiki(md_pliki):
    """Blok :::grafik (zlecenie 45: Tutornia) w Treści i Treści EN: linie, których parser nie rozumie — ostrzeżenie, nie błąd
    (strona się zbuduje, linia nie trafi do planu; na Podglądzie czerwona ramka nad planem). Parser ten sam co na stronie
    (src/lib/grafik.mjs przez Node), więc kontrola i strona nie mogą się rozjechać; bez Node tylko ostrzeżenie, że nie sprawdzono."""
    import subprocess, pathlib
    wej = []
    for p in md_pliki:
        txt = open(p, encoding='utf-8').read()
        if ':::grafik' not in txt:
            continue
        m = re.match(r'^---\n(.*?)\n---\n?(.*)$', txt, re.S)
        if not m:
            continue
        try:
            fm = yaml.load(m.group(1), Loader=Wczytywacz) or {}
        except yaml.YAMLError:
            continue  # błąd YAML zgłasza sprawdz()
        wej.append([p, 'Treść', m.group(2)])
        if isinstance(fm, dict) and isinstance(fm.get('tresc_en'), str):
            wej.append([p, 'Treść EN', fm['tresc_en']])
    if not wej:
        return
    modul = pathlib.Path('src/lib/grafik.mjs').resolve().as_uri()
    js = (f"import {{ grafikZMarkdown }} from {json.dumps(modul)}; import {{ readFileSync }} from 'node:fs';"
          " const w = JSON.parse(readFileSync(0, 'utf8')).map(([p, pole, md]) => [p, pole, (grafikZMarkdown(md) || { bledy: [] }).bledy]);"
          " process.stdout.write(JSON.stringify(w));")
    try:
        r = subprocess.run(['node', '--input-type=module', '-e', js], input=json.dumps(wej), capture_output=True, text=True,
                           encoding='utf-8', timeout=60)
        wynik = json.loads(r.stdout) if r.returncode == 0 else None
    except (OSError, ValueError, subprocess.TimeoutExpired):
        wynik = None
    if wynik is None:
        ostrzezenia.append(f'grafiki dyżurów ({len(wej)} pól) niesprawdzone — kontrola potrzebuje Node i pliku src/lib/grafik.mjs')
        return
    for p, pole, bledy in wynik:
        for b in bledy:
            ostrzezenia.append(f'{p}: {pole}, blok :::grafik, linia {b["nr"]} („{b["tekst"]}”): {b["powod"]} — tej linii nie będzie w planie')


sprawdz_grafiki([p for p in pliki if p.endswith('.md')])

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

# Zlecenie 42: funkcje bez osoby (pusta albo tylko osoby z „Pracuje w Instytucie” odznaczonym) i odwołania do osób spoza spisu —
# ostrzeżenie, nie błąd (strona: na Podglądzie znacznik „nie przypisano osoby”, na stronie publicznej wiersz znika; src/lib/osobySpisu.ts).
# Pola „… ze spisu” zapisują ścieżkę pliku katalogu (_cms/pracownicy/<id>.yml); stare pola tekstowe (przed migracją) — dokładne
# imię i nazwisko osoby ze spisu. Tylko bez argumentów (pełna kontrola).
if not sys.argv[1:] and glob.glob('src/content/pracownicy/*.y*ml'):
    spis = {}
    for p in glob.glob('src/content/pracownicy/*.y*ml'):
        try:
            d = yaml.load(open(p, encoding='utf-8').read(), Loader=Wczytywacz) or {}
        except yaml.YAMLError:
            continue  # błąd składni zgłasza kontrola wyżej
        spis[re.sub(r'\.ya?ml$', '', os.path.basename(p))] = d
    pracuje = lambda d: d.get('pracuje') is not False
    po_nazwie = lambda n: [d for d in spis.values() if str(d.get('imie_nazwisko') or '').strip() == str(n or '').strip() and pracuje(d)]

    def aktywni_ze_spisu(p, funkcja, wartosci):
        """Osoby z pola „… ze spisu”, które pracują; odwołanie do osoby spoza spisu — ostrzeżenie."""
        wynik = []
        for v in [x for x in (wartosci if isinstance(wartosci, list) else [wartosci]) if str(x or '').strip()]:
            oid = re.sub(r'\.(md|ya?ml|json)$', '', str(v).strip().split('/')[-1])
            if oid not in spis:
                ostrzezenia.append(f'{p}: {funkcja}: „{v}” — tej osoby nie ma w spisie pracowników; strona ją pominie')
            elif pracuje(spis[oid]):
                wynik.append(oid)
        return wynik

    def bez_osoby(p, funkcja):
        ostrzezenia.append(f'{p}: {funkcja} — nie przypisano osoby (Podgląd: znacznik „nie przypisano osoby”, strona publiczna: wiersz znika); wybierz osobę w CMS')

    def naglowek_md(p):
        m = re.match(r'^---\r?\n(.*?)\r?\n---', open(p, encoding='utf-8').read(), re.S)
        try:
            return (yaml.load(m.group(1), Loader=Wczytywacz) or {}) if m else {}
        except yaml.YAMLError:
            return {}

    for p in sorted(glob.glob('src/content/zaklady/*.md')):
        k = naglowek_md(p).get('karta') or {}
        if not aktywni_ze_spisu(p, 'Kierownik zakładu', k.get('kierownik_ze_spisu')) and not (k.get('kierownik') and not k.get('kierownik_ze_spisu')):
            bez_osoby(p, 'Kierownik zakładu')
    for p in sorted(glob.glob('src/content/seminaria/*.md')):
        d = naglowek_md(p)
        stare = [x for x in d.get('prowadzacy') or [] if str(x or '').strip()]
        if not (aktywni_ze_spisu(p, 'Koordynator seminarium', d.get('prowadzacy_ze_spisu') or [])
                or [x for x in d.get('prowadzacy_spoza') or [] if str(x or '').strip()]
                or (stare and not d.get('prowadzacy_ze_spisu') and not d.get('prowadzacy_spoza'))):
            bez_osoby(p, 'Koordynator seminarium')
    for p in sorted(glob.glob('src/content/specjalnosci/*.md')):
        for i, o in enumerate(naglowek_md(p).get('opiekunowie') or []):
            if isinstance(o, dict) and o.get('osoba') and not aktywni_ze_spisu(p, f'Opiekun specjalności {i + 1}', o.get('osoba')):
                if re.sub(r'\.(md|ya?ml|json)$', '', str(o['osoba']).strip().split('/')[-1]) in spis:
                    rola = str(o.get('rola') or '').strip()
                    bez_osoby(p, f'Opiekun specjalności {i + 1}{" (" + rola + ")" if rola and not rola.lower().startswith("opiekun") else ""}')
    p = 'src/data/wladze.json'
    if os.path.exists(p):
        try:
            w = json.load(open(p, encoding='utf-8'))
        except ValueError:
            w = {}
        for nazwa, lista, spoza in (('Dyrekcja', w.get('osoby') or [], False), ('Władze Wydziału', (w.get('wydzial') or {}).get('osoby') or [], True)):
            for o in lista:
                if not isinstance(o, dict) or not any(str(v or '').strip() for v in o.values()):
                    continue  # pusta pozycja: ostrzeżenie „pusta pozycja” wyżej
                f = f'{nazwa}: {o.get("rola") or "?"}'
                if o.get('osoba'):
                    if not aktywni_ze_spisu(p, f, o['osoba']):
                        bez_osoby(p, f)
                elif not (o.get('imie_nazwisko') and (spoza or po_nazwie(o['imie_nazwisko']))):
                    bez_osoby(p, f)
        sek = w.get('sekretariat') or {}
        if sek and not (aktywni_ze_spisu(p, 'Sekretariat: osoby', sek.get('osoby_ze_spisu') or [])
                        or ('osoby_ze_spisu' not in sek and any(po_nazwie(x) for x in sek.get('osoby') or []))):
            bez_osoby(p, 'Sekretariat: osoby')

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
