#!/usr/bin/env python3
"""Zlecenie 47: „Warto wiedzieć” pod Instytutem — migracja treści w Web-Instytut (i menu w Web-Ustawienia).

Użycie (z katalogu Web-Core):
  python skrypty/migracja/warto_wiedziec_47.py <checkout Web-Instytut> <katalog załącznika A> [--ustawienia <checkout Web-Ustawienia>]
                                                [--dodano RRRR-MM-DD]

Co robi (idempotentnie — drugie uruchomienie niczego nie zmienia):
1. Cztery dzisiejsze wpisy i tekst listy przenosi `git mv` do nowych miejsc i zmienia W MIEJSCU: scalenie trójstronne
   (git merge-file) — baza = plik w commicie BAZA (88d8f50, z niego powstał załącznik A), „nasza” wersja = plik na main
   (z ewentualnymi zmianami redaktorów), „ich” = plik z załącznika A. Zmiana redaktora w innej linii niż migracja zostaje;
   konflikt (redaktor zmienił tę samą linię) = STOP, nic nie jest nadpisywane.
2. Stary wpis o medalach (medale-uniwersytetu-dla-…) usuwa `git rm`; zastępuje go ogólny wpis nagrody/medal-uniwersytetu.md.
   Jeśli redaktor zmienił stary wpis od bazy — STOP (zmianę trzeba przenieść ręcznie).
3. Pozostałe pliki z załącznika A dopisuje bez zmian (plik już istniejący i inny — STOP).
4. src/data/instytut.md: „3 rektorów” → „4 rektorów” (PL i EN, opis z Łukaszewiczem) — tylko gdy wartości są jak w bazie.
5. --dodano: pole „Dodano” u Bożejki, Rolskiego i Bilera (dzień pusha Web-Instytut), tylko gdy puste.
6. --ustawienia: menu Instytutu (nawigacja.json): „Warto wiedzieć” pierwszą pozycją grupy „Więcej”, nowy opis grupy.
Formularze CMS (.pages.yml) zmienia skrypty/migracja/formularze_40.mjs (opis Web-Instytut).
"""
import json
import os
import re
import shutil
import subprocess
import sys

BAZA = '88d8f50'
WW = 'src/content/warto_wiedziec'
PRZENIESIENIA = [
    (f'{WW}/artykul-w-annals-of-mathematics.md', f'{WW}/historie/artykul-w-annals-of-mathematics.md'),
    (f'{WW}/wyklad-terencea-tao.md', f'{WW}/historie/wyklad-terencea-tao.md'),
    (f'{WW}/wyrozniajaca-ocena-pka.md', f'{WW}/nagrody/wyrozniajaca-ocena-pka.md'),
    ('src/content/strony/warto-wiedziec.md', 'src/content/strony/instytut/warto-wiedziec.md'),
]
MEDALE = f'{WW}/medale-uniwersytetu-dla-profesorow-marka-bozejki-i-tomasza-rolskiego.md'
NOWE_DODANO = ['marek-bozejko', 'tomasz-rolski', 'piotr-biler']
INSTYTUT_MD = 'src/data/instytut.md'
INSTYTUT_ZAMIANY = [
    ('- wartosc: 3 rektorów\n', '- wartosc: 4 rektorów\n'),
    ('  wartosc_en: 3 rectors\n', '  wartosc_en: 4 rectors\n'),
    ('  opis: matematycy Marczewski, Urbanik i Duda kierowali Uniwersytetem Wrocławskim jako rektorzy\n',
     '  opis: matematycy Marczewski, Urbanik, Łukaszewicz i Duda kierowali Uniwersytetem Wrocławskim jako rektorzy\n'),
    ('  opis_en: the mathematicians Marczewski, Urbanik and Duda led the University of Wrocław\n',
     '  opis_en: the mathematicians Marczewski, Urbanik, Łukaszewicz and Duda led the University of Wrocław\n'),
]
MENU_POZYCJA = {
    'etykieta': 'Warto wiedzieć', 'etykieta_en': 'Highlights', 'opis': 'sylwetki, nagrody, historie',
    'opis_en': 'people, awards, stories', 'adres': '/instytut/warto-wiedziec',
}
MENU_OPIS = ('ludzie i historia, informatyka, biblioteka', 'people and history, IT, library')


def stop(komunikat):
    sys.exit(f'STOP: {komunikat}')


def git(repo, *a, wejscie=None, sprawdz=True):
    r = subprocess.run(['git', *a], cwd=repo, capture_output=True, input=wejscie, text=True, encoding='utf-8')
    if sprawdz and r.returncode != 0:
        stop(f'git {" ".join(a)}: {r.stderr.strip()}')
    return r


def czytaj(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def zapisz(p, t):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)


def w_bazie(repo, rel):
    r = git(repo, 'show', f'{BAZA}:{rel}', sprawdz=False)
    return r.stdout if r.returncode == 0 else None


def lf(t):
    return (t or '').replace('\r\n', '\n')


def scal(repo, nowy, baza_txt, zalacznik_txt):
    """git merge-file: nasza (plik w repo) + zmiany baza→załącznik. Końce linii ujednolicone (klon na Windows ma CRLF,
    a git show daje LF); wynik w zapisie pliku z repozytorium (git przy commicie i tak zapisze LF)."""
    import tempfile
    nasza = czytaj(os.path.join(repo, nowy))
    with tempfile.TemporaryDirectory() as tmp:
        pn, pb, pz = os.path.join(tmp, 'nasza'), os.path.join(tmp, 'baza'), os.path.join(tmp, 'zal')
        zapisz(pn, lf(nasza))
        zapisz(pb, lf(baza_txt))
        zapisz(pz, lf(zalacznik_txt))
        r = subprocess.run(['git', 'merge-file', '-p', pn, pb, pz], capture_output=True, text=True, encoding='utf-8')
        if r.returncode != 0:
            stop(f'{nowy}: konflikt scalania (redaktor zmienił tę samą linię co migracja) — przenieś zmianę ręcznie.\n{r.stdout}')
        return r.stdout.replace('\n', '\r\n') if '\r\n' in nasza else r.stdout


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    repo, zal = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
    ust = sys.argv[sys.argv.index('--ustawienia') + 1] if '--ustawienia' in sys.argv else None
    dodano = sys.argv[sys.argv.index('--dodano') + 1] if '--dodano' in sys.argv else None
    if dodano and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', dodano):
        stop('--dodano: data RRRR-MM-DD')
    zmiany = []

    # 1. przeniesienia ze scaleniem
    for stary, nowy in PRZENIESIENIA:
        p_stary, p_nowy = os.path.join(repo, stary), os.path.join(repo, nowy)
        if os.path.exists(p_nowy) and not os.path.exists(p_stary):
            continue  # już przeniesione
        if not os.path.exists(p_stary):
            stop(f'brak {stary}')
        baza_txt = w_bazie(repo, stary)
        if baza_txt is None:
            stop(f'{stary}: brak w bazie {BAZA}')
        os.makedirs(os.path.dirname(p_nowy), exist_ok=True)
        git(repo, 'mv', stary, nowy)
        wynik = scal(repo, nowy, baza_txt, czytaj(os.path.join(zal, nowy)))
        zapisz(p_nowy, wynik)
        zmiany.append(f'przeniesione i zmienione: {stary} → {nowy}' + ('' if lf(czytaj(p_nowy)) == lf(czytaj(os.path.join(zal, nowy))) else ' (z zachowaną zmianą redaktora)'))

    # 2. stary wpis o medalach
    p_med = os.path.join(repo, MEDALE)
    if os.path.exists(p_med):
        if lf(czytaj(p_med)) != lf(w_bazie(repo, MEDALE) or ''):
            stop(f'{MEDALE}: zmieniony od bazy {BAZA} — przenieś zmianę do nagrody/medal-uniwersytetu.md ręcznie')
        git(repo, 'rm', '-q', MEDALE)
        zmiany.append(f'usunięte (zastępuje je nagrody/medal-uniwersytetu.md): {MEDALE}')

    # 3. nowe pliki z załącznika A
    for dp, _, pliki in os.walk(os.path.join(zal, 'src')):
        for f in sorted(pliki):
            rel = os.path.relpath(os.path.join(dp, f), zal).replace('\\', '/')
            cel = os.path.join(repo, rel)
            if os.path.exists(cel):
                if any(rel == n for _, n in PRZENIESIENIA):
                    continue
                if lf(czytaj(cel)) != lf(czytaj(os.path.join(dp, f))) and not dodano:
                    stop(f'{rel}: plik już jest i różni się od załącznika A')
                continue
            zapisz(cel, czytaj(os.path.join(dp, f)))
            git(repo, 'add', rel)
            zmiany.append(f'nowy: {rel}')

    # 4. „4 rektorów”
    p_ins = os.path.join(repo, INSTYTUT_MD)
    t = czytaj(p_ins)
    nl = '\r\n' if '\r\n' in t else '\n'
    t2 = t
    for a, b in INSTYTUT_ZAMIANY:
        a, b = a.replace('\n', nl), b.replace('\n', nl)
        if b in t2:
            continue
        if t2.count(a) != 1:
            stop(f'{INSTYTUT_MD}: nie znalazłem „{a.strip()}” (redaktor zmienił „W skrócie”?) — popraw ręcznie')
        t2 = t2.replace(a, b)
    if t2 != t:
        zapisz(p_ins, t2)
        zmiany.append(f'{INSTYTUT_MD}: 4 rektorów')

    # 5. „Dodano” (dzień pusha)
    if dodano:
        for s in NOWE_DODANO:
            p = os.path.join(repo, WW, 'sylwetki', f'{s}.md')
            t = czytaj(p)
            t2 = re.sub(r'(?m)^dodano: ""\r?$', f'dodano: "{dodano}"', t, count=1)
            if t2 != t:
                zapisz(p, t2)
                zmiany.append(f'{s}: dodano {dodano}')

    # 6. menu Instytutu
    if ust:
        p = os.path.join(ust, 'src/data/nawigacja.json')
        t = czytaj(p)
        dane = json.loads(t)
        inst = next(m for m in dane['menu'] if m.get('adres') == '/instytut')
        grupa = next((g for g in inst['grupy'] if g.get('nazwa') == 'Więcej'), None)
        if grupa is None:
            stop('nawigacja.json: brak grupy „Więcej” w menu Instytutu')
        if not any(l.get('adres') == MENU_POZYCJA['adres'] for l in grupa['linki']):
            grupa['linki'].insert(0, dict(MENU_POZYCJA))
            grupa['opis'], grupa['opis_en'] = MENU_OPIS
            nowy = json.dumps(dane, ensure_ascii=False, indent=2) + ('\n' if t.endswith('\n') else '')
            if '\r\n' in t:
                nowy = nowy.replace('\n', '\r\n')
            zapisz(p, nowy)
            zmiany.append('Web-Ustawienia nawigacja.json: „Warto wiedzieć” w grupie „Więcej” Instytutu')

    print('\n'.join(zmiany) if zmiany else 'Bez zmian')


if __name__ == '__main__':
    main()
