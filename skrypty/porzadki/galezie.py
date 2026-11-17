#!/usr/bin/env python3
"""Porządki gałęzi w repozytoriach organizacji IM-UWr (zlecenie 38, etap 1).

Zasada (decyzje właściciela 13.11 i 17.11): w każdym repozytorium zostaje tylko `main` (w Web-Podglad także
`zbudowana`). Starych gałęzi nie scalamy: każdą zachowujemy jako znacznik `archiwum/<nazwa>`, wypychamy znacznik
i dopiero potem usuwamy gałąź. Nigdy force-push, nigdy przepisywanie historii.

1. Plan (domyślnie; nic nie zmienia na GitHubie):
     python skrypty/porzadki/galezie.py --klony ../tresci-B --plan plan.json --md plan.md
   - lista repozytoriów z `gh repo list IM-UWr` (bez .github i pustych repozytoriów);
   - Web-Core: to repozytorium (git fetch origin), pozostałe: klony w --klony/<Repo> (przy pierwszym uruchomieniu
     git clone, potem git fetch --prune --tags);
   - gałęzie i znaczniki odczytuje z GitHuba (`git ls-remote`), dla każdej gałęzi zbiera: ostatni commit (data,
     autor, temat), liczbę commitów spoza main (`rev-list --count main..gałąź`), wynik `git cherry`, czy pliki
     zmienione na gałęzi mają w main tę samą treść, otwarte PR oraz stan znacznika `archiwum/<nazwa>`.

2. Wykonanie (TYLKO po słowie „push” właściciela):
     python skrypty/porzadki/galezie.py --klony ../tresci-B --wykonaj plan.json
   Dla każdej pozycji planu: sprawdza, że gałąź na GitHubie wskazuje ten sam commit co w planie (inaczej pomija),
   tworzy znacznik z opisem (jeśli go nie ma), wypycha go, sprawdza go na GitHubie i dopiero wtedy usuwa gałąź.
   Na końcu wypisuje kontrolę: gałęzie, które zostały na GitHubie, i znaczniki usuniętych gałęzi.

Opcja --tylko Repo (można powtarzać) ogranicza pracę do wskazanych repozytoriów.
"""
import argparse
import datetime
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ORG = 'IM-UWr'
POMIJANE_REPO = {'.github'}
ZOSTAJA = {'main'}
ZOSTAJA_W_REPO = {'Web-Podglad': {'zbudowana'}}


def run(*cmd, cwd=None, check=True):
    p = subprocess.run(list(cmd), cwd=cwd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if check and p.returncode != 0:
        raise RuntimeError(f'{" ".join(cmd)} (w {cwd}): {p.stderr.strip()}')
    return p.stdout.strip()


def git(cwd, *a, check=True):
    return run('git', *a, cwd=cwd, check=check)


def repozytoria():
    out = run('gh', 'repo', 'list', ORG, '--limit', '500', '--json', 'name,isEmpty')
    return sorted(r['name'] for r in json.loads(out) if r['name'] not in POMIJANE_REPO and not r['isEmpty'])


def katalog(repo, klony):
    return ROOT if repo == 'Web-Core' else os.path.join(klony, repo)


def przygotuj(repo, klony):
    d = katalog(repo, klony)
    if not os.path.isdir(d):
        os.makedirs(klony, exist_ok=True)
        run('git', 'clone', '--quiet', f'https://github.com/{ORG}/{repo}.git', d)
    git(d, 'fetch', '--quiet', '--prune', 'origin', '+refs/heads/*:refs/remotes/origin/*')
    return d


def zdalne(d):
    """Gałęzie i znaczniki na GitHubie: ({gałąź: sha}, {znacznik: sha commita})."""
    heads, tags = {}, {}
    for line in git(d, 'ls-remote', '--heads', '--tags', 'origin').splitlines():
        sha, ref = line.split('\t')
        if ref.startswith('refs/heads/'):
            heads[ref[len('refs/heads/'):]] = sha
        elif ref.startswith('refs/tags/'):
            name = ref[len('refs/tags/'):]
            if name.endswith('^{}'):
                tags[name[:-3]] = sha          # znacznik z opisem: commit, na który wskazuje
            else:
                tags.setdefault(name, sha)
    return heads, tags


def otwarte_pr(repo):
    out = run('gh', 'pr', 'list', '-R', f'{ORG}/{repo}', '--state', 'open', '--json', 'number,headRefName,title')
    wynik = {}
    for pr in json.loads(out):
        wynik.setdefault(pr['headRefName'], []).append(f"#{pr['number']} {pr['title']}")
    return wynik


def nazwa_znacznika(galaz, sha, tags):
    """archiwum/<nazwa>; gałąź, która już nazywa się archiwum/…, dostaje znacznik o tej samej nazwie.
    Zajęta nazwa wskazująca inny commit → kolejny wolny przyrostek -2, -3…"""
    baza = galaz if galaz.startswith('archiwum/') else f'archiwum/{galaz}'
    if baza not in tags:
        return baza, 'brak', None
    if tags[baza] == sha:
        return baza, 'jest, ten sam commit', tags[baza]
    n = 2
    while f'{baza}-{n}' in tags and tags[f'{baza}-{n}'] != sha:
        n += 1
    nowy = f'{baza}-{n}'
    stan = 'jest -%d, ten sam commit' % n if nowy in tags else 'jest, INNY commit → nowy z przyrostkiem'
    return nowy, stan, tags[baza]


def opisz_galaz(d, galaz, sha, main, tags, prs):
    data, autor, temat = git(d, 'log', '-1', '--format=%cI%x09%an%x09%s', sha).split('\t', 2)
    ahead = int(git(d, 'rev-list', '--count', f'{main}..{sha}'))
    behind = int(git(d, 'rev-list', '--count', f'{sha}..{main}'))
    merges = int(git(d, 'rev-list', '--count', '--merges', f'{main}..{sha}'))
    plus = minus = 0
    for line in git(d, 'cherry', main, sha).splitlines():
        if line.startswith('+'):
            plus += 1
        elif line.startswith('-'):
            minus += 1
    wspolny = git(d, 'merge-base', main, sha, check=False)   # pusty: gałąź bez wspólnej historii z main
    zakres = f'{main}...{sha}' if wspolny else f'{main}..{sha}'
    pliki = [p for p in git(d, 'diff', '--name-only', zakres).splitlines() if p]
    jak_w_main = None
    if ahead:
        rozne = set(git(d, 'diff', '--name-only', main, sha).splitlines())   # pliki różne dziś: main ↔ gałąź
        jak_w_main = not (set(pliki) & rozne)
    if ahead == 0:
        ocena = 'w main (cała historia)'
    elif plus == 0 and merges == 0:
        ocena = 'zmiany w main (inne SHA)'
    elif jak_w_main:
        ocena = 'treść plików jak w main'
    else:
        ocena = 'COMMITY SPOZA MAIN'
    znacznik, stan, znacznik_sha = nazwa_znacznika(galaz, sha, tags)
    return {
        'galaz': galaz, 'sha': sha, 'data': data, 'autor': autor, 'temat': temat,
        'spoza_main': ahead, 'za_main': behind, 'scalenia': merges, 'cherry_plus': plus, 'cherry_minus': minus,
        'pliki': len(pliki), 'pliki_jak_w_main': jak_w_main, 'ocena': ocena + ('' if wspolny else ' (bez wspólnej historii z main)'),
        'pr': prs.get(galaz, []),
        'znacznik': znacznik, 'znacznik_stan': stan, 'znacznik_dotad': znacznik_sha,
    }


def plan(args):
    wynik = []
    for repo in args.tylko or repozytoria():
        d = przygotuj(repo, args.klony)
        heads, tags = zdalne(d)
        main = heads.get('main')
        zostaja = ZOSTAJA | ZOSTAJA_W_REPO.get(repo, set())
        galezie = sorted(g for g in heads if g not in zostaja)
        prs = otwarte_pr(repo) if galezie else {}
        poz = [opisz_galaz(d, g, heads[g], main, tags, prs) for g in galezie]
        archiwalne = sorted(t for t in tags if t.startswith('archiwum/'))
        wynik.append({'repo': repo, 'main': main, 'galezie': poz, 'znaczniki_archiwum': archiwalne,
                      'zostaja': sorted(zostaja & set(heads))})
        print(f'{repo}: {len(poz)} gałęzi do archiwum', file=sys.stderr)
    with open(args.plan, 'w', encoding='utf-8') as f:
        json.dump({'utworzono': datetime.datetime.now().isoformat(timespec='seconds'), 'repozytoria': wynik},
                  f, ensure_ascii=False, indent=1)
    if args.md:
        with open(args.md, 'w', encoding='utf-8') as f:
            f.write(markdown(wynik))


def tak_nie(v):
    return '—' if v is None else ('tak' if v else 'nie')


def markdown(wynik):
    out = []
    for r in wynik:
        out.append(f"\n#### {r['repo']} — {len(r['galezie'])} gałęzi poza {', '.join(r['zostaja'])}\n")
        if not r['galezie']:
            out.append('Tylko `main`' + (' i `zbudowana`.' if r['repo'] == 'Web-Podglad' else '.') + '\n')
            continue
        out.append('| Gałąź | Ostatni commit | Autor | Temat | Spoza main | `cherry` +/− | Pliki jak w main | Ocena | '
                   'Znacznik archiwum | PR |')
        out.append('|---|---|---|---|---:|---:|---|---|---|---|')
        for g in r['galezie']:
            ocena = f"**{g['ocena']}**" if g['ocena'].startswith('COMMITY SPOZA MAIN') else g['ocena']
            temat = g['temat'].replace('|', '\\|')
            if len(temat) > 70:
                temat = temat[:67] + '…'
            out.append(
                f"| `{g['galaz']}` | {g['data'][:10]} `{g['sha'][:7]}` | {g['autor']} | {temat} | {g['spoza_main']} | "
                f"{g['cherry_plus']}/{g['cherry_minus']} | {tak_nie(g['pliki_jak_w_main'])} | {ocena} | "
                f"`{g['znacznik']}` ({g['znacznik_stan']}) | {'; '.join(g['pr']) or '—'} |")
    return '\n'.join(out) + '\n'


def wykonaj(args):
    dane = json.load(open(args.wykonaj, encoding='utf-8'))
    dzis = datetime.date.today().isoformat()
    for r in dane['repozytoria']:
        if args.tylko and r['repo'] not in args.tylko:
            continue
        d = przygotuj(r['repo'], args.klony)
        for g in r['galezie']:
            heads, tags = zdalne(d)
            galaz, sha, znacznik = g['galaz'], g['sha'], g['znacznik']
            if galaz not in heads:
                print(f"{r['repo']}: {galaz} — już usunięta", file=sys.stderr)
                continue
            if heads[galaz] != sha:
                print(f"{r['repo']}: {galaz} — POMIJAM, gałąź zmieniła się od planu "
                      f"({sha[:7]} → {heads[galaz][:7]})", file=sys.stderr)
                continue
            if tags.get(znacznik) not in (None, sha):
                print(f"{r['repo']}: {galaz} — POMIJAM, znacznik {znacznik} wskazuje inny commit", file=sys.stderr)
                continue
            if znacznik not in tags:
                lokalny = git(d, 'rev-parse', '-q', '--verify', f'refs/tags/{znacznik}^{{commit}}', check=False)
                if lokalny and lokalny != sha:
                    print(f"{r['repo']}: {galaz} — POMIJAM, lokalny znacznik {znacznik} wskazuje inny commit",
                          file=sys.stderr)
                    continue
                if not lokalny:
                    git(d, 'tag', '-a', znacznik, sha, '-m',
                        f'Archiwum gałęzi {galaz} (zlecenie 38, {dzis}). Gałąź usunięta z GitHuba; '
                        f'ostatni commit: {g["data"][:10]} {g["temat"]}')
                git(d, 'push', '--quiet', 'origin', f'refs/tags/{znacznik}')
                _, tags = zdalne(d)
                if tags.get(znacznik) != sha:
                    raise SystemExit(f"{r['repo']}: znacznik {znacznik} nie dotarł na GitHuba — przerywam")
            git(d, 'push', '--quiet', 'origin', f':refs/heads/{galaz}')
            print(f"{r['repo']}: {galaz} → {znacznik}", file=sys.stderr)
    kontrola(dane, args)


def kontrola(dane, args):
    bledy = 0
    for r in dane['repozytoria']:
        if args.tylko and r['repo'] not in args.tylko:
            continue
        heads, tags = zdalne(katalog(r['repo'], args.klony))
        zostaja = ZOSTAJA | ZOSTAJA_W_REPO.get(r['repo'], set())
        nadmiar = sorted(set(heads) - zostaja)
        brak_znacznika = [g['galaz'] for g in r['galezie'] if tags.get(g['znacznik']) != g['sha']]
        bledy += len(nadmiar) + len(brak_znacznika)
        print(f"{r['repo']}: gałęzie {', '.join(sorted(heads))}"
              + (f" | NADMIAR: {', '.join(nadmiar)}" if nadmiar else '')
              + (f" | BEZ ZNACZNIKA: {', '.join(brak_znacznika)}" if brak_znacznika else ''))
    print('Kontrola: OK' if not bledy else f'Kontrola: {bledy} problemów')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--klony', required=True, help='katalog z klonami repozytoriów treści (Web-Core: to repozytorium)')
    ap.add_argument('--plan', help='plik JSON z planem (tryb planu)')
    ap.add_argument('--md', help='tabela Markdown do raportu (tryb planu)')
    ap.add_argument('--wykonaj', help='plik JSON z planem do wykonania — tylko po „push” właściciela')
    ap.add_argument('--kontrola', help='plik JSON z planem: tylko kontrola stanu na GitHubie')
    ap.add_argument('--tylko', action='append', help='ogranicz do repozytorium (można powtarzać)')
    a = ap.parse_args()
    a.klony = os.path.abspath(a.klony)
    if a.wykonaj:
        wykonaj(a)
    elif a.kontrola:
        kontrola(json.load(open(a.kontrola, encoding='utf-8')), a)
    elif a.plan:
        plan(a)
    else:
        ap.error('podaj --plan, --wykonaj albo --kontrola')
