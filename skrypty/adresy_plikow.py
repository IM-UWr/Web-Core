"""Krótkie adresy plików w treściach: redaktor pisze nazwę pliku tak, jak widzi go w Media swojego repozytorium,
a pobierz_tresci.py przy nakładaniu treści zamienia ją na pełny adres /pliki/….

W linkach i obrazkach Markdownu ([tekst](adres), ![opis](adres)) w plikach src/ repozytoriów treści:
  nadzieja-seminarium.pdf            plik z Media tego repozytorium (ukośnik na początku też działa: /nadzieja-seminarium.pdf)
  slajdy/wyklad-1.pdf                plik w folderze „slajdy” w Media
  Web-Nauka/publikacje/lista.pdf     plik z Media innego repozytorium (nazwa repozytorium jak w Pages CMS)
W repozytorium z kilkoma folderami Media (np. „Media: studia”, „Media: szkoła doktorska”) adres bez nazwy folderu
oznacza pierwszy z nich, a z nazwą folderu na początku (szkola-doktorska/…) — ten folder.

Krótki adres to adres bez schematu (https:, mailto:), bez # i // na początku, zakończony rozszerzeniem pliku (.pdf, .jpg…).
Pełne adresy /pliki/…, /grafiki/…, /kalendarz/… i linki do stron (bez rozszerzenia) zostają bez zmian. Link w `kodzie`
w tej samej linii też (przykłady w ściągawkach).

Foldery Media każdego repozytorium są w jego .pages.yml (media: lista name / input / output). Plik czytany wierszami,
bez PyYAML (na maszynie GitHuba nie musi go być).

Testy:  python skrypty/test_adresy_plikow.py
"""
import os
import re

# pierwsze człony adresów z ukośnikiem, które nie są plikami z Media (pliki Web-Core, strony, wyszukiwarka, wersja EN)
ZAREZERWOWANE = {'pliki', 'grafiki', 'kalendarz', 'pagefind', '_astro', 'en'}
LINK = re.compile(r'(!?\[[^\]\n]*\]\(\s*)(<?)([^)\s>]+)(>?)')
SCHEMAT = re.compile(r'^[A-Za-z][A-Za-z0-9+.-]*:')
ROZSZERZENIE = re.compile(r'\.[A-Za-z0-9]{1,5}$')


def foldery_media(kat):
    """[(nazwa, folder pod public/pliki)] z .pages.yml repozytorium, w kolejności z pliku (pierwszy = domyślny)."""
    try:
        with open(os.path.join(kat, '.pages.yml'), encoding='utf-8') as f:
            linie = f.read().splitlines()
    except OSError:
        return []
    wynik, w_media, nazwa = [], False, None
    for linia in linie:
        if re.match(r'^media:\s*$', linia):
            w_media = True
            continue
        if w_media and linia.strip() and not linia.startswith((' ', '-')):
            break
        if not w_media:
            continue
        m = re.match(r'^-?\s*name:\s*(\S+)', linia)
        if m:
            nazwa = m.group(1).strip('\'"')
        m = re.match(r'^-?\s*input:\s*(\S+)', linia)
        if m:
            folder = m.group(1).strip('\'"').strip('/')
            if folder.startswith('public/pliki/'):
                wynik.append((nazwa or 'media', folder[len('public/pliki/'):]))
            nazwa = None
    return wynik


class Adresy:
    def __init__(self, media, pliki_publiczne):
        """media: {repozytorium: [(nazwa, folder)]}; pliki_publiczne: ścieżki 'public/pliki/…' ze wszystkich źródeł."""
        self.media = media
        self.repo_po_nazwie = {r.lower(): r for r in media}
        self.pliki = pliki_publiczne

    def pelny(self, adres, repo):
        """Pełny adres /pliki/… dla krótkiego adresu albo None, gdy to nie krótki adres pliku."""
        sciezka, reszta_url = re.match(r'^([^?#]*)(.*)$', adres).groups()
        if not sciezka or SCHEMAT.match(adres) or adres.startswith(('#', '//')) or not ROZSZERZENIE.search(sciezka):
            return None
        czlony = [c for c in sciezka.split('/') if c]
        if not czlony:
            return None
        if sciezka.startswith('/') and czlony[0] in ZAREZERWOWANE:
            return None
        if czlony[0] == 'pliki' and len(czlony) > 1:  # „pliki/…” bez ukośnika: pełny adres
            return '/' + '/'.join(czlony) + reszta_url
        cel = self.repo_po_nazwie.get(czlony[0].lower())
        if cel and len(czlony) > 1:
            czlony = czlony[1:]
        else:
            cel = repo
        foldery = self.media.get(cel) or []
        if not foldery:
            return None
        wzgledna = '/'.join(czlony)
        for _, folder in foldery:
            if wzgledna.startswith(folder + '/'):
                return f'/pliki/{wzgledna}{reszta_url}'
        return f'/pliki/{foldery[0][1]}/{wzgledna}{reszta_url}'

    def przepisz(self, tekst, repo):
        """(nowy tekst, [(adres w treści, pełny adres, czy plik istnieje)]) dla krótkich adresów w tekście."""
        zmiany = []

        def zamien(m):
            poczatek = tekst.rfind('\n', 0, m.start()) + 1
            if tekst.count('`', poczatek, m.start()) % 2:  # link w `kodzie`: przykład, nie link
                return m.group(0)
            pelny = self.pelny(m.group(3), repo)
            if not pelny:
                return m.group(0)
            istnieje = 'public' + re.split(r'[?#]', pelny)[0] in self.pliki
            zmiany.append((m.group(3), pelny, istnieje))
            return f'{m.group(1)}{m.group(2)}{pelny}{m.group(4)}'

        return LINK.sub(zamien, tekst), zmiany
