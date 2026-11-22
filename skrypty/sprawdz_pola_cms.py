#!/usr/bin/env python3
"""Sprawdza, czy formularze Pages CMS (.pages.yml) obejmują wszystkie dane w repozytoriach treści.

Pages CMS przy zapisie zostawia w pliku tylko pola z formularza, więc pole spoza formularza znika przy pierwszym zapisie
redaktora. Skrypt zgłasza:
  1. pliki danych bez formularza,
  2. pola w danych, których nie ma w formularzu (także w listach i obiektach),
  3. wartości, których formularz nie przyjmie (wymagane puste, spoza listy wyboru, zły typ, zła data),
  4. foldery Media, które mogą dać ten sam plik w dwóch repozytoriach. Na stronie pliki ze wszystkich repozytoriów są we
     wspólnym /pliki, a pobierz_tresci.py przerywa budowę, gdy dwa repozytoria mają plik o tej samej ścieżce. Dlatego
     `media` w .pages.yml to jeden własny folder repozytorium (public/pliki/<folder>, nigdy całe public/pliki; jedno
     Media, bo redaktor wpisuje w linku ścieżkę od Media — skrypty/adresy_plikow.py), foldery różnych repozytoriów nie
     pokrywają się, każde pole pliku/obrazka wskazuje folder Media (options.media), a pliki w public/ leżą w Media.

Użycie:  python skrypty/sprawdz_pola_cms.py <katalog z klonami repozytoriów treści>
Lista repozytoriów: tresci.json. Kod wyjścia 1, gdy są problemy. Wymaga PyYAML.
"""
import json
import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Wczytywacz(yaml.SafeLoader):
    """YAML jak w Pages CMS i Astro (YAML 1.2): „13:00” to tekst, a nie liczba sześćdziesiątkowa 780 (YAML 1.1, PyYAML).
    Pages CMS zapisuje godziny bez cudzysłowu (termin wydarzenia w aktualnościach, zlecenie 31)."""


def _bez_szescdziesiatkowych(typ):
    def konstruktor(loader, node):
        if ':' in str(node.value):
            return loader.construct_scalar(node)
        return getattr(yaml.SafeLoader, f'construct_yaml_{typ}')(loader, node)
    return konstruktor


Wczytywacz.add_constructor('tag:yaml.org,2002:int', _bez_szescdziesiatkowych('int'))
Wczytywacz.add_constructor('tag:yaml.org,2002:float', _bez_szescdziesiatkowych('float'))
# „opublikowany”: świadomie bez pola (wszystko jest opublikowane, a brak wartości to true); „body”: treść pliku Markdown
POLA_POMIJANE = {'opublikowany', 'body'}
# Pliki świadomie bez formularza. stopka.json: nowy wygląd go nie czyta (zlecenie 22).
PLIKI_BEZ_FORMULARZA = {('Web-Ustawienia', 'src/data/stopka.json')}
ROZSZERZENIA = ('.md', '.json', '.yml', '.yaml')


def formularze(pozycje):
    for p in pozycje or []:
        if p.get('type') == 'group':
            yield from formularze(p.get('items'))
        else:
            yield p


def wiele(pole):
    return bool(pole.get('list') or (pole.get('options') or {}).get('multiple'))


def sciezki_pol(pola, przed=''):
    wynik = set()
    for pole in pola or []:
        nazwa = pole.get('name')
        if nazwa is None:
            continue
        sciezka = przed + nazwa + ('[]' if wiele(pole) else '')
        wynik.add(sciezka)
        if pole.get('type') == 'object' or pole.get('fields'):
            wynik |= sciezki_pol(pole.get('fields'), sciezka + '.')
    return wynik


def pola_plikow(pola, przed=''):
    """[(ścieżka pola, pole)] dla pól typu file/image, także w obiektach i listach obiektów."""
    wynik = []
    for pole in pola or []:
        sciezka = przed + str(pole.get('name'))
        if pole.get('type') in ('file', 'image'):
            wynik.append((sciezka, pole))
        if pole.get('fields'):
            wynik += pola_plikow(pole.get('fields'), sciezka + '.')
    return wynik


def w_folderze(sciezka, folder):
    return sciezka == folder or sciezka.startswith(folder + '/')


def sprawdz_media(repo, kat, konfiguracja, zajete, zglos):
    """Punkt 4 z opisu skryptu. `zajete`: [(repozytorium, folder)] z repozytoriów sprawdzonych wcześniej."""
    media = konfiguracja.get('media')
    if not isinstance(media, list) or not media:
        zglos(f'{repo}: media w .pages.yml ma być listą z jednym własnym folderem (name, input: public/pliki/<folder>, output)')
        return
    if len(media) != 1:
        zglos(f'{repo}: Media ma być jedno (jeden folder repozytorium, w nim podfoldery), jest {len(media)}: '
              f'redaktor wpisuje w linku ścieżkę od Media (skrypty/adresy_plikow.py)')
    foldery = {}
    for zrodlo in media:
        nazwa = zrodlo.get('name')
        wejscie = str(zrodlo.get('input') or '').strip('/')
        if not wejscie.startswith('public/pliki/'):
            zglos(f'{repo}: folder Media „{nazwa}” ({wejscie or "bez input"}) ma być w public/pliki/<folder>, nie wyżej')
            continue
        if str(zrodlo.get('output') or '').rstrip('/') != '/' + wejscie[len('public/'):]:
            zglos(f'{repo}: folder Media „{nazwa}”: output ma być /{wejscie[len("public/"):]}')
        for inne_repo, inny in zajete + [(repo, f) for f in foldery.values()]:
            if w_folderze(wejscie, inny) or w_folderze(inny, wejscie):
                zglos(f'{repo}: folder Media {wejscie} pokrywa się z {inny} ({inne_repo})')
        foldery[nazwa] = wejscie
    zajete += [(repo, f) for f in foldery.values()]
    for form in formularze(konfiguracja.get('content')):
        for sciezka, pole in pola_plikow(form.get('fields')):
            opcje = pole.get('options') or {}
            if opcje.get('media') not in foldery:
                zglos(f'{repo} / {form.get("name")}: pole „{sciezka}” bez options.media wskazującego folder Media '
                      f'({", ".join(foldery)})')
            elif opcje.get('path') and not w_folderze(str(opcje['path']).strip('/'), foldery[opcje['media']]):
                zglos(f'{repo} / {form.get("name")}: pole „{sciezka}”: path {opcje["path"]} jest poza folderem Media '
                      f'{foldery[opcje["media"]]}')
    for gora, _, nazwy in os.walk(os.path.join(kat, 'public')):
        for n in nazwy:
            plik = os.path.relpath(os.path.join(gora, n), kat).replace(os.sep, '/')
            if not any(w_folderze(plik, f) for f in foldery.values()):
                zglos(f'{repo}: plik {plik} leży poza folderami Media ({", ".join(foldery.values())})')


def sciezki_danych(obiekt, przed=''):
    wynik = set()
    for klucz, wartosc in obiekt.items():
        sciezka = przed + str(klucz)
        if isinstance(wartosc, dict):
            wynik.add(sciezka)
            wynik |= sciezki_danych(wartosc, sciezka + '.')
        elif isinstance(wartosc, list):
            wynik.add(sciezka + '[]')
            for element in wartosc:
                if isinstance(element, dict):
                    wynik |= sciezki_danych(element, sciezka + '[].')
        else:
            wynik.add(sciezka)
    return wynik


def wczytaj(sciezka):
    tekst = open(sciezka, encoding='utf-8').read()
    if sciezka.endswith('.json'):
        return json.loads(tekst)
    if sciezka.endswith(('.yml', '.yaml')):
        return yaml.load(tekst, Loader=Wczytywacz)
    m = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n?(.*)$', tekst, re.S)
    if not m:
        return {'body': tekst}
    dane = yaml.load(m.group(1), Loader=Wczytywacz) or {}
    dane['body'] = m.group(2)
    return dane


def wartosci(pole, wartosc, gdzie, zglos):
    typ = pole.get('type')
    opcje = pole.get('options') or {}
    if wartosc in (None, '', []):
        if pole.get('required'):
            zglos(f'{gdzie}: pole wymagane jest puste')
        return
    if wiele(pole):
        lista = wartosc if isinstance(wartosc, list) else [wartosc]
    elif isinstance(wartosc, list):
        zglos(f'{gdzie}: lista w polu pojedynczym')
        return
    else:
        lista = [wartosc]
    for x in lista:
        if typ == 'object' or pole.get('fields'):
            if not isinstance(x, dict):
                zglos(f'{gdzie}: oczekiwany obiekt')
                continue
            for pod in pole.get('fields') or []:
                wartosci(pod, x.get(pod['name']), f"{gdzie}.{pod['name']}", zglos)
        elif typ == 'select':
            dozwolone = [str(o.get('name') if isinstance(o, dict) else o) for o in opcje.get('values', [])]
            if str(x) not in dozwolone:
                zglos(f'{gdzie}: wartości „{x}” nie ma na liście wyboru')
        elif typ == 'boolean' and not isinstance(x, bool):
            zglos(f'{gdzie}: oczekiwane tak/nie, jest {x!r}')
        elif typ == 'number' and (isinstance(x, bool) or not isinstance(x, (int, float))):
            zglos(f'{gdzie}: oczekiwana liczba, jest {x!r}')
        elif typ == 'date' and not re.match(r'^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?.*)?$', str(x)):
            zglos(f'{gdzie}: zła data {x!r}')
        elif typ in ('string', 'text', 'rich-text', 'image', 'file', 'code') and not isinstance(x, str):
            zglos(f'{gdzie}: oczekiwany tekst, jest {type(x).__name__} {str(x)[:30]!r}')
        elif typ in ('string', 'text') and pole.get('pattern'):
            # wzorzec pola (np. godzina terminu, zlecenie 31): formularz nie zapisze wpisu z wartością spoza wzorca
            wzor = pole['pattern'] if isinstance(pole['pattern'], str) else pole['pattern'].get('regex', '')
            if not re.search(wzor, x):
                zglos(f'{gdzie}: wartość {x!r} nie pasuje do wzorca pola ({wzor})')


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    katalog = sys.argv[1]
    repozytoria = json.load(open(os.path.join(ROOT, 'tresci.json'), encoding='utf-8'))['repozytoria']
    problemy = []
    plikow = 0
    zajete = []
    for repo in repozytoria:
        kat = os.path.join(katalog, repo)
        konfiguracja = yaml.safe_load(open(os.path.join(kat, '.pages.yml'), encoding='utf-8'))
        sprawdz_media(repo, kat, konfiguracja, zajete, problemy.append)
        objete = set()
        for form in formularze(konfiguracja.get('content')):
            nazwa = form.get('name')
            sciezka = form.get('path') or ''
            pliki = []
            if form.get('type') == 'file':
                if os.path.exists(os.path.join(kat, sciezka)):
                    pliki = [sciezka]
            else:
                for gora, _, nazwy in os.walk(os.path.join(kat, sciezka)):
                    for n in nazwy:
                        if n.endswith(ROZSZERZENIA) and not n.startswith('.'):
                            pliki.append(os.path.relpath(os.path.join(gora, n), kat).replace(os.sep, '/'))
            pola = sciezki_pol(form.get('fields'))
            for plik in pliki:
                objete.add(plik)
                plikow += 1
                dane = wczytaj(os.path.join(kat, plik))
                if not isinstance(dane, dict):
                    continue
                for klucz in sorted(sciezki_danych(dane)):
                    if klucz.split('.')[0].split('[')[0] in POLA_POMIJANE and '.' not in klucz:
                        continue
                    if klucz not in pola:
                        problemy.append(f'{repo} / {nazwa}: pola „{klucz}” nie ma w formularzu ({plik})')
                for pole in form.get('fields') or []:
                    wartosci(pole, dane.get(pole['name']), f"{repo} / {nazwa} / {plik}: {pole['name']}", problemy.append)
        for gora_kat in ('src/content', 'src/data'):
            for gora, _, nazwy in os.walk(os.path.join(kat, gora_kat)):
                for n in nazwy:
                    if n.endswith(ROZSZERZENIA) and not n.startswith('.'):
                        plik = os.path.relpath(os.path.join(gora, n), kat).replace(os.sep, '/')
                        if plik not in objete and (repo, plik) not in PLIKI_BEZ_FORMULARZA:
                            problemy.append(f'{repo}: plik {plik} nie ma formularza')
    for p in problemy:
        print(p)
    print(f'Sprawdzono {plikow} plików w {len(repozytoria)} repozytoriach. Problemów: {len(problemy)}.')
    sys.exit(1 if problemy else 0)


if __name__ == '__main__':
    main()
