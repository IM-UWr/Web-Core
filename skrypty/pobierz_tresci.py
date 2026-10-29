#!/usr/bin/env python3
"""Pobiera repozytoria treści organizacji (lista w tresci.json) i nakłada ich katalogi src/ i public/ na Web-Core.

Uruchamiane przed każdym budowaniem (workflow „Budowanie i publikacja strony”, „Sprawdzenie gałęzi”, „Kontrola
jakości”) i lokalnie przed `npm run dev`:  python3 skrypty/pobierz_tresci.py

- Repozytoria są publiczne — pobieranie bez klucza (git clone --depth 1), kopie w .tresci/ (pomijane przez git).
- Każdy plik może pochodzić tylko z jednego miejsca: jeśli dwa repozytoria (albo repozytorium i Web-Core) mają ten sam
  plik, skrypt kończy się błędem i wypisuje oba źródła.
- Pliki nałożone poprzednim razem są najpierw usuwane (lista w .tresci/nalozone.json), więc usunięcie pliku
  w repozytorium treści usuwa go też ze strony.
- Opcja --lokalnie <katalog>: zamiast pobierać z GitHuba, bierze repozytoria z podkatalogów <katalog>/<Repo>/
  (do testów).
"""
import concurrent.futures
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.tresci')
MANIFEST = os.path.join(CACHE, 'nalozone.json')
cfg = json.load(open(os.path.join(ROOT, 'tresci.json'), encoding='utf-8'))
ORG = cfg['organizacja']
REPOS = cfg['repozytoria']
lokalnie = sys.argv[sys.argv.index('--lokalnie') + 1] if '--lokalnie' in sys.argv else None


def git(*a, cwd=None):
    return subprocess.run(['git', *a], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def pobierz(repo):
    if lokalnie:
        return repo, os.path.join(lokalnie, repo), 'lokalnie'
    cel = os.path.join(CACHE, repo)
    url = f'https://github.com/{ORG}/{repo}.git'
    try:
        if os.path.isdir(os.path.join(cel, '.git')):
            git('fetch', '-q', '--depth', '1', 'origin', 'HEAD', cwd=cel)
            git('reset', '-q', '--hard', 'FETCH_HEAD', cwd=cel)
        else:
            shutil.rmtree(cel, ignore_errors=True)
            git('clone', '-q', '--depth', '1', url, cel)
        return repo, cel, git('rev-parse', '--short', 'HEAD', cwd=cel)
    except subprocess.CalledProcessError as e:
        if 'empty repository' in (e.stderr or '') or (os.path.isdir(cel) and not os.listdir(cel)):
            return repo, None, 'puste'
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
                    bledy.append(f'{rel}: jest w {zrodlo[rel]} i w {repo}')
                    continue
                if os.path.exists(cel):
                    bledy.append(f'{rel}: jest w Web-Core i w {repo}')
                    continue
                os.makedirs(os.path.dirname(cel), exist_ok=True)
                shutil.copy2(os.path.join(dp, f), cel)
                zrodlo[rel] = repo
                n += 1
    print(f'  {repo} ({wersja}): {n} plików')

json.dump(sorted(zrodlo), open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
if bledy:
    print('\nTe same pliki w dwóch miejscach (każdy plik może pochodzić tylko z jednego repozytorium):')
    print('\n'.join('  ' + b for b in bledy))
    sys.exit(1)
print(f'Treści: {len(zrodlo)} plików z {sum(1 for _, k, _ in wyniki if k)} repozytoriów.')
