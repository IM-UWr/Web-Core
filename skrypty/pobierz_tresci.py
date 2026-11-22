#!/usr/bin/env python3
"""Pobiera repozytoria treści organizacji (lista w tresci.json) i nakłada ich katalogi src/ i public/ na Web-Core.

Uruchamiane przed każdym budowaniem (workflow „Budowanie i publikacja strony”, budowa Podglądu w Web-Podglad)
i lokalnie przed `npm run dev`:  python3 skrypty/pobierz_tresci.py

- Repozytoria są publiczne — pobieranie bez klucza (git clone --depth 1), kopie w .tresci/ (pomijane przez git).
- Pobierana jest gałąź main, także gdy gałąź domyślna repozytorium jest inna. Opcja --galaz <nazwa>: pobiera wskazaną
  gałąź; repozytorium bez tej gałęzi daje main. Lokalnie, na czas pracy na gałęzi, trzeba jej użyć, bo inaczej skrypt
  nadpisze nakładkę treściami z main:  python3 skrypty/pobierz_tresci.py --galaz wyglad/zlecenie-16
- Każdy plik może pochodzić tylko z jednego miejsca: jeśli dwa repozytoria (albo repozytorium i Web-Core) mają ten sam
  plik, skrypt kończy się błędem i wypisuje oba źródła. Na GitHubie (GITHUB_ACTIONS) każdy taki plik jest też adnotacją
  „Błąd plików”, którą plakietka stanu budowy na Podglądzie pokazuje redaktorom. Kolizji zapobiegają osobne foldery
  Media każdego repozytorium (media w .pages.yml; pilnuje skrypty/sprawdz_pola_cms.py).
- Pliki nałożone poprzednim razem są najpierw usuwane (lista w .tresci/nalozone.json), więc usunięcie pliku
  w repozytorium treści usuwa go też ze strony.
- Opcja --lokalnie <katalog>: zamiast pobierać z GitHuba, bierze repozytoria z podkatalogów <katalog>/<Repo>/
  (do testów).
- --zrodlo Repo=katalog nakłada wskazany lokalny checkout zamiast kopii tego repozytorium.
- --wymagaj Repo przerywa pobieranie, jeśli Repo nie ma gałęzi podanej przez --galaz (bez powrotu do main).
- .tresci/zrodla.json zapisuje pełne SHA pobranych repozytoriów; lokalne nakładki są opisane jako lokalne.
- Krótkie adresy plików (skrypty/adresy_plikow.py): w linkach i obrazkach Markdownu w plikach src/ redaktor może pisać
  sam plik z Media swojego repozytorium (nadzieja-seminarium.pdf) albo innego (Web-Nauka/publikacje/lista.pdf); przy
  nakładaniu zamieniają się na pełne /pliki/…. Brakujący plik to ostrzeżenie (na GitHubie adnotacja „Plik w treści”),
  nie błąd budowy.
"""
import concurrent.futures
import json
import os
import shutil
import subprocess
import sys

from adresy_plikow import Adresy, foldery_media

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.tresci')
MANIFEST = os.path.join(CACHE, 'nalozone.json')
cfg = json.load(open(os.path.join(ROOT, 'tresci.json'), encoding='utf-8'))
ORG = cfg['organizacja']
REPOS = cfg['repozytoria']
lokalnie = sys.argv[sys.argv.index('--lokalnie') + 1] if '--lokalnie' in sys.argv else None
GALAZ = sys.argv[sys.argv.index('--galaz') + 1] if '--galaz' in sys.argv else 'main'
WYMAGANE = [sys.argv[i + 1] for i, arg in enumerate(sys.argv[:-1]) if arg == '--wymagaj']


def git(*a, cwd=None):
    return subprocess.run(['git', *a], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def pobierz(repo):
    overrides = [sys.argv[i + 1] for i, arg in enumerate(sys.argv[:-1]) if arg == '--zrodlo']
    for entry in overrides:
        name, directory = entry.split('=', 1)
        if name == repo:
            return repo, os.path.abspath(directory), 'lokalna nakładka robocza'
    if lokalnie:
        return repo, os.path.join(lokalnie, repo), 'lokalnie'
    cel = os.path.join(CACHE, repo)
    url = f'https://github.com/{ORG}/{repo}.git'
    try:
        if not git('ls-remote', '--heads', url):
            return repo, None, 'puste'
        galaz = GALAZ
        if galaz != 'main' and not git('ls-remote', '--heads', url, galaz):
            if repo in WYMAGANE:
                raise SystemExit(f'{repo}: wymagana gałąź {galaz} nie istnieje; przerywam test.')
            print(f'  {repo}: brak gałęzi {galaz}, biorę main')
            galaz = 'main'
        if os.path.isdir(os.path.join(cel, '.git')):
            git('fetch', '-q', '--depth', '1', 'origin', galaz, cwd=cel)
            git('reset', '-q', '--hard', 'FETCH_HEAD', cwd=cel)
        else:
            shutil.rmtree(cel, ignore_errors=True)
            git('clone', '-q', '--depth', '1', '--branch', galaz, url, cel)
        return repo, cel, git('rev-parse', 'HEAD', cwd=cel)
    except subprocess.CalledProcessError as e:
        raise SystemExit(f'Nie udało się pobrać {url}:\n{e.stderr}')


os.makedirs(CACHE, exist_ok=True)
# 1. usuń pliki nałożone poprzednim razem
if os.path.exists(MANIFEST):
    for p in json.load(open(MANIFEST, encoding='utf-8')):
        try:
            os.remove(os.path.join(ROOT, p))
        except FileNotFoundError:
            pass

# 2. pobierz repozytoria (równolegle)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
    wyniki = list(ex.map(pobierz, REPOS))

json.dump({r: wersja for r, _, wersja in wyniki}, open(os.path.join(CACHE, 'zrodla.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# krótkie adresy plików: foldery Media repozytoriów i wszystkie pliki public/pliki (Web-Core i repozytoria treści)
publiczne = set()
for baza in [ROOT] + [kat for _, kat, _ in wyniki if kat]:
    for dp, _, pliki in os.walk(os.path.join(baza, 'public', 'pliki')):
        publiczne |= {os.path.relpath(os.path.join(dp, f), baza).replace(os.sep, '/') for f in pliki}
adresy = Adresy({repo: foldery_media(kat) for repo, kat, _ in wyniki if kat}, publiczne)
TEKSTOWE = ('.md', '.mdx', '.json', '.yml', '.yaml')
krotkie = []  # (repozytorium, plik, adres w treści, pełny adres, czy plik istnieje)


def naloz(zrodlowy, cel, repo, rel):
    """Kopiuje plik; w plikach tekstowych z src/ zamienia krótkie adresy plików na pełne."""
    if rel.startswith('src' + os.sep) and rel.endswith(TEKSTOWE):
        try:
            with open(zrodlowy, encoding='utf-8', newline='') as we:
                tekst = we.read()
        except UnicodeDecodeError:
            tekst = None
        if tekst is not None:
            nowy, zmiany = adresy.przepisz(tekst, repo)
            if zmiany:
                with open(cel, 'w', encoding='utf-8', newline='') as wy:
                    wy.write(nowy)
                krotkie.extend((repo, rel.replace(os.sep, '/'), *z) for z in zmiany)
                return
    shutil.copy2(zrodlowy, cel)


# 3. nałóż src/ i public/
zrodlo = {}
bledy = []
for repo, kat, wersja in wyniki:
    if not kat:
        print(f'  {repo}: puste repozytorium — pomijam')
        continue
    n = 0
    for gora in ('src', 'public'):
        for dp, _, pliki in os.walk(os.path.join(kat, gora)):
            for f in pliki:
                rel = os.path.relpath(os.path.join(dp, f), kat)
                cel = os.path.join(ROOT, rel)
                if rel in zrodlo:
                    bledy.append((rel, zrodlo[rel], repo))
                    continue
                if os.path.exists(cel):
                    bledy.append((rel, 'Web-Core', repo))
                    continue
                os.makedirs(os.path.dirname(cel), exist_ok=True)
                naloz(os.path.join(dp, f), cel, repo, rel)
                zrodlo[rel] = repo
                n += 1
    print(f'  {repo} ({wersja}): {n} plików')

json.dump(sorted(zrodlo), open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
if krotkie:
    print(f'\nKrótkie adresy plików zamienione na /pliki/…: {len(krotkie)}.')
    brak = [k for k in krotkie if not k[4]]
    for repo, plik, adres, pelny, _ in brak:
        print(f'  BRAK PLIKU  {repo}: {plik}: „{adres}” → {pelny}')
    if brak and os.environ.get('GITHUB_ACTIONS') == 'true':
        for repo, plik, adres, pelny, _ in brak[:10]:
            print(f'::warning title=Plik w treści::{repo}: {plik}: link „{adres}” prowadzi do {pelny}, a takiego pliku nie ma '
                  f'w Media. Sprawdź nazwę pliku w Media (CMS mógł dopisać -1).')
def opis_kolizji(rel, pierwsze, drugie):
    """Zdanie dla redaktora: adres pliku na stronie (/pliki/…) albo ścieżka w repozytorium i oba źródła."""
    rel = rel.replace(os.sep, '/')
    gdzie = '/' + rel[len('public/'):] if rel.startswith('public/') else rel
    if pierwsze == 'Web-Core':
        return f'Plik {gdzie} z repozytorium {drugie} jest już w kodzie strony (Web-Core). Zmień jego nazwę albo folder w {drugie}.'
    return (f'Plik {gdzie} jest w dwóch repozytoriach: {pierwsze} i {drugie}. Strona się nie zbuduje, dopóki w jednym '
            f'z nich nie zmienisz nazwy pliku albo go nie usuniesz (Media w Pages CMS).')


if bledy:
    print('\nTe same pliki w dwóch miejscach (każdy plik może pochodzić tylko z jednego repozytorium):')
    print('\n'.join(f'  {rel}: jest w {a} i w {b}' for rel, a, b in bledy))
    if os.environ.get('GITHUB_ACTIONS') == 'true':
        # adnotacje dla plakietki stanu budowy (src/lib/stanBudowy/klient.js: tytuł „Błąd …”, treść jako zwykły tekst)
        for rel, a, b in bledy[:10]:
            tresc = opis_kolizji(rel, a, b).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
            print(f'::error title=Błąd plików::{tresc}')
    sys.exit(1)
print(f'Treści: {len(zrodlo)} plików z {sum(1 for _, k, _ in wyniki if k)} repozytoriów.')
