#!/usr/bin/env python3
"""Zlecenie 52: sylwetki „Warto wiedzieć” — liczby do banera w polu „Liczby” zamiast bloku :::w-skrocie; porządek w sylwetce Tabisza.

Użycie (z katalogu Web-Core, PyYAML):
  python skrypty/migracja/sylwetki_52.py <checkout Web-Instytut> <katalog A-liczby> [--sprawdz]
--sprawdz: nic nie zapisuje, tylko wypisuje, co by zmienił (kod wyjścia 0 także wtedy, gdy są zmiany do zrobienia).

Co robi (idempotentnie — drugie uruchomienie niczego nie zmienia; tekstowo: reszta pliku bez zmian, końce linii jak w pliku):
1. Każda sylwetka, dla której jest <katalog A-liczby>/<plik>.json: pole `liczby` (3 pozycje w kolejności z JSON: n, n_en "",
   etykieta = podpis, etykieta_en = podpis_en; pole `z` nie trafia do pliku) tuż pod polem `podpis_en`. Pole już wypełnione tymi
   samymi wartościami — bez zmian; innymi (redaktor je zmienił) — STOP.
2. Z Treści polskiej usuwa blok :::w-skrocie … ::: razem z komentarzem <!-- W SKRÓCIE: … --> tuż przed nim i pustą linią po nim.
   Blok bez komentarza, drugi blok, linia bloku inna niż punkt `- **…** — …` albo blok w Treści EN — STOP (do przejrzenia ręcznie).
3. krzysztof-tabisz.md (zlecenie 52, punkt 6; Treść wpisał redaktor w CMS):
   - Treść PL: bez pierwszej linii „# Dr Krzysztof Tabisz” (i pustych linii po niej); trzy śródtytuły ### → ## z {#id}
     (dzialalnosc-naukowa, dzialalnosc-spoleczna, odznaczenia); na początku komentarze UKŁAD JAWNY i TEKST dosłownie
     z hugo-steinhaus.md; bez komentarzy UKŁAD JAWNY i TBA z końca pliku;
   - Treść EN (pole tresc_en, blok YAML „>-”): bez „# Dr Krzysztof Tabisz”, trzy ### → ## z tymi samymi {#id};
   - podpis_en bez kropki na końcu.
Kontrola przed zapisem (każdy plik; niezgodność = STOP, nic nie zapisane): nagłówek YAML się parsuje; wszystkie pola poza `liczby`
(u Tabisza także podpis_en i tresc_en — porównane z oczekiwaną zmianą) bez zmian; Treść po = Treść przed bez usuniętego bloku
(u Tabisza: proza — linie poza nagłówkami, komentarzami i pustymi — identyczna, nagłówki dokładnie te z punktu 6).
Formularz CMS (.pages.yml) zmienia skrypty/migracja/formularze_40.mjs (opis Web-Instytut, zlecenie 52).
"""
import json
import os
import re
import sys

import yaml

SYL = 'src/content/warto_wiedziec/sylwetki'
TABISZ = 'krzysztof-tabisz'
WZOR_KOMENTARZY = 'hugo-steinhaus'
NAGLOWKI_PL = [
    ('Działalność naukowa i akademicka', 'dzialalnosc-naukowa'),
    ('Działalność społeczna i opozycyjna', 'dzialalnosc-spoleczna'),
    ('Odznaczenia i wyróżnienia', 'odznaczenia'),
]
NAGLOWKI_EN = [
    ('Academic and Scientific Career', 'dzialalnosc-naukowa'),
    ('Social Activism and Democratic Opposition', 'dzialalnosc-spoleczna'),
    ('Honours and Distinctions', 'odznaczenia'),
]
TYTUL_TABISZA = '# Dr Krzysztof Tabisz'
# blok :::w-skrocie z komentarzem przed nim i pustą linią po nim (tekst z LF)
BLOK = re.compile(r'<!-- W SKRÓCIE:[^\n]*?-->\n(:::w-skrocie[ \t]*\n(.*?)\n:::[ \t]*)\n(?:[ \t]*\n)?', re.S)
PUNKT = re.compile(r'^\s*[-*+]\s+\*\*(?!\s)(.+?)\*\*\s*[—–-]\s*(\S.*?)\s*$')


def stop(komunikat):
    sys.exit(f'STOP: {komunikat}')


def czytaj(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def zapisz(p, t):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def rozdziel(t, kto):
    """Tekst z LF → (nagłówek YAML z końcowym \\n, Treść)."""
    m = re.match(r'---\n(.*?\n)---\n(.*)\Z', t, re.S)
    if not m:
        stop(f'{kto}: brak nagłówka YAML')
    return m.group(1), m.group(2)


def wczytaj_yaml(fm, kto):
    try:
        d = yaml.safe_load(fm)
    except yaml.YAMLError as e:
        stop(f'{kto}: nagłówek YAML się nie parsuje: {e}')
    return d or {}


def q(s):
    """Wartość YAML w cudzysłowach (jak w plikach z migracji 47); JSON-owy zapis jest poprawnym YAML-em w podwójnym cudzysłowie."""
    return json.dumps(s, ensure_ascii=False)


def liczby_z_json(katalog, plik):
    p = os.path.join(katalog, f'{plik}.json')
    if not os.path.exists(p):
        return None
    d = json.loads(czytaj(p))
    poz = [{'n': str(x['n']).strip(), 'n_en': '', 'etykieta': str(x['podpis']).strip(), 'etykieta_en': str(x.get('podpis_en', '')).strip()}
           for x in d['liczby']]
    if len(poz) != 3 or not all(x['n'] and x['etykieta'] for x in poz):
        stop(f'{p}: oczekiwane 3 pozycje z liczbą i podpisem')
    return poz


def wstaw_liczby(fm, poz, kto):
    """Blok `liczby:` tuż pod polem podpis_en (razem z jego ewentualnymi liniami ciągu)."""
    linie = fm.rstrip('\n').split('\n')
    i = next((k for k, l in enumerate(linie) if re.match(r'podpis_en:', l)), None)
    if i is None:
        stop(f'{kto}: brak pola podpis_en (miejsce na liczby)')
    j = i + 1
    while j < len(linie) and (linie[j][:1] in (' ', '\t') or not linie[j].strip()):
        j += 1
    blok = ['liczby:']
    for x in poz:
        blok += [f'  - n: {q(x["n"])}', f'    n_en: {q(x["n_en"])}', f'    etykieta: {q(x["etykieta"])}', f'    etykieta_en: {q(x["etykieta_en"])}']
    return '\n'.join(linie[:j] + blok + linie[j:]) + '\n'


def bez_bloku(body, kto):
    """Treść bez bloku :::w-skrocie z komentarzem; (Treść, usunięty fragment albo None)."""
    m = list(BLOK.finditer(body))
    reszta = re.findall(r'^:{3,}w-skrocie', body, re.M)
    if not m:
        if reszta:
            stop(f'{kto}: blok :::w-skrocie bez komentarza „W SKRÓCIE” tuż przed nim — do przejrzenia ręcznie')
        return body, None
    if len(m) > 1 or len(reszta) > 1:
        stop(f'{kto}: więcej niż jeden blok :::w-skrocie')
    zle = [l for l in m[0].group(2).split('\n') if l.strip() and not PUNKT.match(l)]
    if zle:
        stop(f'{kto}: w bloku :::w-skrocie są linie inne niż punkty — do przejrzenia ręcznie: {zle}')
    return body[:m[0].start()] + body[m[0].end():], m[0].group(0)


def komentarze_wzoru(repo):
    _, body = rozdziel(czytaj(os.path.join(repo, SYL, f'{WZOR_KOMENTARZY}.md')).replace('\r\n', '\n'), WZOR_KOMENTARZY)
    k = [re.search(rf'^<!-- {n}:[^\n]*-->$', body, re.M) for n in ('UKŁAD JAWNY', 'TEKST')]
    if not all(k):
        stop(f'{WZOR_KOMENTARZY}.md: brak komentarza UKŁAD JAWNY albo TEKST (wzór dla Tabisza)')
    return k[0].group(0), k[1].group(0)


def naglowek_re(tekst, wciecie=''):
    return re.compile(rf'^{wciecie}#{{2,3}}[ \t]*{re.escape(tekst)}[ \t]*(?:\{{#[^}}\n]*\}})?[ \t]*$', re.M)


def zamien_naglowki(t, naglowki, kto, wciecie=''):
    for tekst, ident in naglowki:
        r = naglowek_re(tekst, wciecie)
        if len(r.findall(t)) != 1:
            stop(f'{kto}: śródtytuł „{tekst}” — {len(r.findall(t))} trafień zamiast 1 (redaktor zmienił plik? uruchom na świeżym main i przejrzyj)')
        t = r.sub(f'{wciecie}## {tekst} {{#{ident}}}', t)
    return t


def proza(body):
    """Linie prozy: bez nagłówków Markdown, komentarzy i pustych (kontrola, że tekst redaktora jest nietknięty)."""
    bez_kom = re.sub(r'<!--.*?-->', '', body, flags=re.S)
    return [l.rstrip() for l in bez_kom.split('\n') if l.strip() and not re.match(r'\s*#{1,6}\s', l)]


def tabisz(repo, fm, body, kto):
    uklad, tekst = komentarze_wzoru(repo)
    przed = body
    # PL: pierwsza linia z tytułem, komentarze z końca, śródtytuły, komentarze na początku
    body = re.sub(rf'\A{re.escape(TYTUL_TABISZA)}[ \t]*\n(?:[ \t]*\n)*', '', body)
    body = re.sub(r'\n*<!-- UKŁAD JAWNY:[^\n]*-->\s*<!-- TBA:[^\n]*-->\s*\Z', '\n', body)
    if re.search(r'<!-- TBA:', body):
        stop(f'{kto}: komentarz TBA nie na końcu pliku — do przejrzenia ręcznie')
    body = zamien_naglowki(body, NAGLOWKI_PL, kto)
    if not body.startswith('<!-- UKŁAD JAWNY:'):
        body = f'{uklad}\n\n{tekst}\n\n{body}'
    if proza(body) != proza(przed):
        stop(f'{kto}: proza PL po zmianie różni się od prozy przed — nic nie zapisane')
    if [l for l in body.split('\n') if l.startswith('#')] != [f'## {t} {{#{i}}}' for t, i in NAGLOWKI_PL]:
        stop(f'{kto}: nagłówki PL po zmianie inne niż oczekiwane')
    # EN (tresc_en w nagłówku YAML, blok „>-” wcięty o 2 spacje)
    fm = re.sub(rf'^  {re.escape(TYTUL_TABISZA)}[ \t]*\n(?:[ \t]*\n)*', '', fm, flags=re.M)
    fm = zamien_naglowki(fm, NAGLOWKI_EN, f'{kto} (Treść EN)', wciecie='  ')
    # podpis_en bez kropki na końcu (wartość w jednej linii)
    fm = re.sub(r'^(podpis_en:[ \t]*["\']?)(.*?)\.(["\']?)[ \t]*$', r'\1\2\3', fm, count=1, flags=re.M)
    return fm, body


def oczekiwane_en(v):
    """tresc_en po zmianie z punktu 6, liczone na wartości (kontrola zmiany tekstowej w YAML)."""
    v = re.sub(rf'\A{re.escape(TYTUL_TABISZA)}[ \t]*\n+', '', v or '')
    for tekst, ident in NAGLOWKI_EN:
        v = re.sub(rf'^#{{2,3}}[ \t]*{re.escape(tekst)}[ \t]*(?:\{{#[^}}\n]*\}})?[ \t]*$', f'## {tekst} {{#{ident}}}', v, flags=re.M)
    return v


def main():
    argv = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(argv) < 2:
        sys.exit(__doc__)
    repo, zal = os.path.abspath(argv[0]), os.path.abspath(argv[1])
    sprawdz = '--sprawdz' in sys.argv
    katalog = os.path.join(repo, SYL)
    pliki = sorted(f[:-3] for f in os.listdir(katalog) if f.endswith('.md'))
    jsony = sorted(f[:-5] for f in os.listdir(zal) if f.endswith('.json'))
    if set(jsony) - set(pliki):
        stop(f'pliki liczb bez sylwetki: {sorted(set(jsony) - set(pliki))}')
    zmienione = []
    for plik in pliki:
        kto = f'{SYL}/{plik}.md'
        p = os.path.join(katalog, f'{plik}.md')
        surowy = czytaj(p)
        crlf = '\r\n' in surowy
        t = surowy.replace('\r\n', '\n')
        fm, body = rozdziel(t, kto)
        d0 = wczytaj_yaml(fm, kto)
        if ':::w-skrocie' in str(d0.get('tresc_en') or ''):
            stop(f'{kto}: blok :::w-skrocie w Treści EN — do przejrzenia ręcznie')
        opis = []
        # 1. liczby
        poz = liczby_z_json(zal, plik)
        if poz:
            obecne = d0.get('liczby') or []
            norm = [{k: str(x.get(k) or '') for k in ('n', 'n_en', 'etykieta', 'etykieta_en')} for x in obecne if isinstance(x, dict)]
            if not obecne:
                fm = wstaw_liczby(fm, poz, kto)
                opis.append('liczby dopisane')
            elif norm != poz:
                stop(f'{kto}: pole „liczby” już jest i ma inne wartości niż {plik}.json (zapis redaktora?) — do przejrzenia ręcznie')
        # 2. blok :::w-skrocie
        body2, usuniety = bez_bloku(body, kto)
        if usuniety:
            opis.append(f'blok :::w-skrocie usunięty ({usuniety.count(chr(10)) + 1} linii)')
        # 3. Tabisz
        if plik == TABISZ:
            fm, body2 = tabisz(repo, fm, body2, kto)
        # kontrola
        d1 = wczytaj_yaml(fm, kto)
        tylko = {'liczby'} | ({'podpis_en', 'tresc_en'} if plik == TABISZ else set())
        for k in sorted(set(d0) | set(d1)):
            if k not in tylko and d0.get(k) != d1.get(k):
                stop(f'{kto}: pole „{k}” zmieniłoby się — nic nie zapisane')
        if poz and [{k: str(x.get(k) or '') for k in ('n', 'n_en', 'etykieta', 'etykieta_en')} for x in d1.get('liczby') or []] != poz:
            stop(f'{kto}: pole „liczby” po zmianie inne niż w {plik}.json')
        if plik == TABISZ:
            pe0, pe1 = str(d0.get('podpis_en') or ''), str(d1.get('podpis_en') or '')
            if pe1 != (pe0[:-1] if pe0.endswith('.') else pe0):
                stop(f'{kto}: podpis_en po zmianie „{pe1}” — oczekiwane bez kropki na końcu')
            if d1.get('tresc_en') != oczekiwane_en(d0.get('tresc_en')):
                stop(f'{kto}: Treść EN po zmianie inna niż oczekiwana — nic nie zapisane')
            if d1.get('tresc_en') != d0.get('tresc_en'):
                opis.append('Treść EN: bez tytułu #, ### → ## z {#id}')
            if pe1 != pe0:
                opis.append('podpis_en bez kropki')
            if body2 != body:
                opis.append('Treść PL: bez tytułu #, ### → ## z {#id}, komentarze jak w innych sylwetkach')
        elif usuniety and body2 + '' != body.replace(usuniety, '', 1):
            stop(f'{kto}: Treść po zmianie różni się od Treści przed czymś więcej niż blokiem')
        nowy = f'---\n{fm}---\n{body2}'
        if crlf:
            nowy = nowy.replace('\n', '\r\n')
        if nowy != surowy:
            zmienione.append(plik)
            if not sprawdz:
                zapisz(p, nowy)
        print(f'{"(sprawdz) " if sprawdz else ""}{plik}: {"; ".join(opis) if opis else "bez zmian"}')
    print(f'\n{"Do zmiany" if sprawdz else "Zmienione"}: {len(zmienione)} z {len(pliki)} sylwetek')


if __name__ == '__main__':
    main()
