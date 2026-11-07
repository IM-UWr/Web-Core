#!/usr/bin/env python3
"""Formularze Pages CMS (.pages.yml) po zleceniu 30 — etapami, każdy etap to osobny commit w klonach.

  --etap 1  Teksty działów (po skrypcie dzialy.py): w Web-Instytut, Web-Nauka, Web-Studia na górze listy wpis typu file
            „Strona działu …” (src/data/<dział>.md, wzór: „Strona działu Popularyzacja” z zlecenia 29); kolekcje „Strony”
            Web-Instytut i Web-Nauka obejmują cały src/content/strony (teksty stron z listą spoza /instytut i /nauka, np.
            /warto-wiedziec, /seminaria); nowe kolekcje „Strony” w Web-Aktualnosci i Web-Pracownicy; pole „Hasło stron
            pojedynczych wpisów” (haslo_podstron) tam, gdzie jest Publikacje albo Obrony doktorskie; z formularza Publikacji
            znikają pola przeniesione do strony Publikacje; z Web-Ustawienia — formularze „Strona działu …”.
  --etap 2  Bez wyróżnień: pole wyroznij_do znika z formularza aktualności.
  --etap 3  Porządek: Strony (kolekcje „Strony”, strony prawne w Web-Ustawienia, Rok akademicki): Tytuł · Treść · Tytuł EN ·
            Treść EN (rich-text, Markdown), pod spodem Opis, Hasło, Liczby, Prawy pasek, Bloki (nowe widoczne pole); opis
            pola Treść = krótka ściągawka (dok/sciagawka-edytora.md). Wpisy: pola podstawowe, Treść, Treść EN, reszta;
            organizatorzy konferencji ukryci; zakłady i „Warto wiedzieć” z grupą „Karta” (dane plików: skrypt wpisy.py).
Pliki zapisuje PyYAML (bloki „|” dla tekstów wielolinijkowych); różnice poza zmienianymi formularzami to tylko cudzysłowy.

Uruchomienie (PyYAML):  python skrypty/migracja/formularze.py --tresci <katalog z klonami Web-*> --etap 1|2|3
"""
import argparse
import copy
from pathlib import Path

import yaml


class Zrzut(yaml.SafeDumper):
    pass


Zrzut.add_representer(str, lambda d, s: d.represent_scalar('tag:yaml.org,2002:str', s, style='|' if '\n' in s else None))

# ---------- teksty opisów ----------
# krótka ściągawka (dok/sciagawka-edytora.md); punkty rozdzielone pustą linią jak w opisach z zleceń 28 i 29
def zasady(dzial=False):
    return '\n\n'.join([
        'Piszesz jak w zwykłym edytorze; akapity oddziela Enter. Nagłówek 2 = nowa sekcja (pojawi się w spisie „Na tej stronie”).',
        'Kilka układów strona rozpoznaje sama:' if dzial else 'Gdy włączone jest pole „Bloki” (niżej), kilka układów strona rozpoznaje sama:',
        '• Punkt listy zaczynający się pogrubieniem = kafelek.',
        '• Lista numerowana z pogrubionym początkiem = oś kroków.',
        '• Punkt z rolą kursywą i nazwiskiem pogrubionym = kontakt.',
        '• Lista samych linków = lista plików (PDF / strona).',
        '• Nagłówek 3 zakończony znakiem „?” = rozwijane pytanie.',
        '• Tekst nad listą (Seminaria, Konferencje, Aktualności…): lista stoi pod całym tekstem, chyba że jest kotwica — np. na stronie '
        'Publikacje tekst pod nagłówkiem 2 „Czasopisma redagowane w Instytucie” stoi nad listą czasopism.',
        '• Plik PDF: wgraj w „Media” i wklej link.',
        '• Akapit zaczynający się od dwuliterowego skrótu z kropką („Np.”, „Dr.”, „No.”) edytor zapisze jako listę numerowaną „1.” — '
        'zacznij akapit inaczej albo pogrub skrót.',
        'Więcej: ściągawka edytora (dok/sciagawka-edytora.md w Web-Core).',
    ])


ZASADY = zasady()
TRESC_EN = 'Cała strona po angielsku, w tym samym układzie co Treść (nagłówki sekcji po angielsku). Puste = strona angielska pokaże treść polską.'
BLOKI = {
    'name': 'bloki', 'label': 'Kafelki, oś i kontakty z list — zob. ściągawka', 'type': 'boolean', 'default': False,
    'description': 'Włączone: listy w treści stają się blokami (kafelki, oś kroków, kontakty, lista plików, rozwijane pytania) — '
                   'opis przy polu „Treść”. Wyłączone: zwykłe listy.',
}
HASLO_PODSTRON = [
    {'name': 'haslo_podstron', 'label': 'Hasło na banerze stron pojedynczych wpisów (tylko Publikacje — rocznik, i Obrony doktorskie — obrona)', 'type': 'string'},
    {'name': 'haslo_podstron_en', 'label': 'EN: hasło stron pojedynczych wpisów', 'type': 'string'},
]
OPIS_STRON = ('Adres strony = ścieżka pliku, np. {przyklad}. Teksty stron z listą (tytuł, opis, hasło i tekst nad listą) to też '
              'strony: {listy}. Brak takiej strony nic nie psuje — lista pokaże domyślny tytuł i hasło, bez tekstu.')


def naglowek_i_dane(p):
    t = p.read_text(encoding='utf-8')
    linie = t.split('\n')
    n = 0
    while linie[n].startswith('#'):
        n += 1
    return '\n'.join(linie[:n]) + '\n' if n else '', yaml.safe_load(t)


def zapisz(p, naglowek, dane):
    p.write_text(naglowek + yaml.dump(dane, Dumper=Zrzut, allow_unicode=True, sort_keys=False, width=10**6), encoding='utf-8', newline='\n')


def wpisy(pozycje):
    for c in pozycje:
        yield c
        if c.get('type') == 'group':
            yield from wpisy(c.get('items') or [])


def wpis(dane, nazwa):
    for c in wpisy(dane['content']):
        if c.get('name') == nazwa:
            return c
    raise SystemExit(f'brak formularza {nazwa}')


def pole(form, nazwa):
    for f in form['fields']:
        if f['name'] == nazwa:
            return f
    raise SystemExit(f'{form["name"]}: brak pola {nazwa}')


def uloz(form, kolejnosc, nowe=()):
    """Pola formularza w podanej kolejności; każde stare pole musi się znaleźć (inaczej błąd — Pages CMS skasowałby dane)."""
    stare = {f['name']: f for f in form['fields']}
    stare.update({f['name']: f for f in nowe})
    brak = [n for n in kolejnosc if n not in stare]
    zbedne = [n for n in stare if n not in kolejnosc]
    if brak or zbedne:
        raise SystemExit(f'{form["name"]}: brak pól {brak}, pola poza kolejnością {zbedne}')
    form['fields'] = [stare[n] for n in kolejnosc]


def bogaty_en(form, opis=TRESC_EN, nazwa='tresc_en', etykieta='Treść EN'):
    """Treść EN jako rich-text (Markdown) z tymi samymi opcjami mediów co Treść."""
    f = pole(form, nazwa)
    opcje = copy.deepcopy(pole(form, 'body').get('options') or {'format': 'markdown'})
    f.clear()
    f.update({'name': nazwa, 'label': etykieta, 'description': opis, 'type': 'rich-text', 'options': opcje})


# ---------- etap 1 ----------
def strona_dzialu(dzial, nazwa, opis, sekcja, kotwica, pola_ustawien, media):
    tresc_opis = f'Tekst sekcji „{sekcja}” (pierwszy akapit strona pokazuje większą czcionką).'
    if kotwica:
        tresc_opis += f' {kotwica}'
    return {
        'name': 'strona-dzialu', 'label': f'Strona działu {nazwa}', 'description': opis, 'type': 'file',
        'path': f'src/data/{dzial}.md', 'format': 'yaml-frontmatter',
        'fields': [
            {'name': 'tytul', 'label': 'Tytuł', 'type': 'string', 'required': True},
            {'name': 'body', 'label': 'Treść', 'description': tresc_opis + '\n\n' + zasady(dzial=True), 'type': 'rich-text',
             'options': {'format': 'markdown', 'path': media}},
            {'name': 'tytul_en', 'label': 'Tytuł EN', 'type': 'string'},
            {'name': 'tresc_en', 'label': 'Treść EN', 'type': 'rich-text', 'options': {'format': 'markdown', 'path': media},
             'description': f'Tekst „{sekcja}” po angielsku, w tym samym układzie co Treść'
                            + (' (nagłówek „Recent achievements”)' if kotwica else '') + '. Puste = strona angielska pokaże tekst polski.'},
            *pola_ustawien,
        ],
    }


def etap1(T):
    # Web-Ustawienia: formularze „Strona działu …” znikają (pola biorę do nowych formularzy)
    nag, u = naglowek_i_dane(T / 'Web-Ustawienia/.pages.yml')
    grupa = wpis(u, 'ustawienia-grupa')
    stare = {c['name']: c for c in grupa['items'] if c['name'].startswith('dzial-')}
    if not stare:
        raise SystemExit('Web-Ustawienia: brak formularzy „Strona działu …” — etap 1 już był.')
    grupa['items'] = [c for c in grupa['items'] if not c['name'].startswith('dzial-')]
    zapisz(T / 'Web-Ustawienia/.pages.yml', nag, u)

    def z_ustawien(dz, *nazwy):
        f = {x['name']: x for x in stare[f'dzial-{dz}']['fields']}
        return [copy.deepcopy(f[n]) for n in nazwy]

    DZIALY = {
        'Web-Instytut': strona_dzialu(
            'instytut', 'Instytut',
            'Strona /instytut: tytuł i tekst „O Instytucie” (po polsku i po angielsku), niżej drobne pola — tekst pod tytułem, hasło, '
            '„W skrócie” i godziny sekretariatu. Liczby, kafelki (z menu „Instytut”), ostatnie sukcesy i kontakt budują się same z danych.',
            'O Instytucie', 'Zdanie nad ostatnimi sukcesami: na końcu tekstu pod nagłówkiem 2 „Ostatnie sukcesy” (kotwica; bez niej sukcesy są bez zdania).',
            z_ustawien('instytut', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'o_instytucie_fakty', 'kontakt_godziny', 'kontakt_godziny_en'),
            'public/pliki/instytut'),
        'Web-Nauka': strona_dzialu(
            'nauka', 'Nauka',
            'Strona /nauka: tytuł i tekst „Badania w Instytucie” (po polsku i po angielsku), niżej drobne pola — tekst pod tytułem, hasło '
            'i „W skrócie”. Liczby, kafelki (z menu „Nauka”), zakłady, konferencje, granty i obrony budują się same z danych.',
            'Badania w Instytucie', None,
            z_ustawien('nauka', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'badania_fakty'), 'public/pliki/nauka'),
        'Web-Studia': strona_dzialu(
            'studia', 'Studia',
            'Strona /studia: tytuł i tekst „O studiach” (po polsku i po angielsku), niżej drobne pola — tekst pod tytułem, hasło '
            'i „W skrócie”. Kierunki, specjalności, kafelki (z menu „Studia”) i kontakt budują się same z danych.',
            'O studiach', None,
            z_ustawien('studia', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'o_studiach_fakty', 'sekretariat_zakres', 'sekretariat_zakres_en'),
            'public/pliki/studia'),
    }
    for repo, nowy in DZIALY.items():
        nag, d = naglowek_i_dane(T / repo / '.pages.yml')
        d['content'].insert(0, nowy)
        if repo == 'Web-Instytut':
            s = wpis(d, 'strony')
            s['path'] = 'src/content/strony'
            s['description'] = OPIS_STRON.format(przyklad='instytut/kontakt.md → /instytut/kontakt (nowe strony działu zakładaj w folderze instytut)',
                                                 listy='instytut/struktura.md (Struktura i zakłady), warto-wiedziec.md (Warto wiedzieć)')
        if repo == 'Web-Nauka':
            s = wpis(d, 'strony')
            s['path'] = 'src/content/strony'
            s['description'] = OPIS_STRON.format(
                przyklad='nauka/sukcesy/historia.md → /nauka/sukcesy/historia (nowe strony działu zakładaj w folderze nauka)',
                listy='seminaria.md, nauka/konferencje.md, nauka/granty.md, nauka/sukcesy.md, nauka/publikacje.md')
            i = [f['name'] for f in s['fields']].index('haslo') + 1
            s['fields'][i:i] = copy.deepcopy(HASLO_PODSTRON)
            pub = wpis(d, 'publikacje')
            pub['fields'] = [f for f in pub['fields'] if f['name'] not in ('wstep', 'wstep_en', 'czasopisma_naglowek', 'czasopisma_naglowek_en')]
            pub['description'] = ((pub.get('description') or '').rstrip() + ' Tytuł, opis pod tytułem, hasło i tekst strony (także o czasopismach) '
                                  '— Strony → nauka/publikacje.md.').strip()
        zapisz(T / repo / '.pages.yml', nag, d)

    # nowe kolekcje „Strony” (formularz jak w Web-Instytut)
    _, wzor_d = naglowek_i_dane(T / 'Web-Instytut/.pages.yml')
    wzor = wpis(wzor_d, 'strony')
    for repo, etykieta, media, listy, podstron in (
        ('Web-Aktualnosci', 'Strony', 'public/pliki/aktualnosci', 'aktualnosci.md (Aktualności), obrony-doktorskie.md (Obrony doktorskie)', True),
        ('Web-Pracownicy', 'Strony', 'public/pliki/pracownicy', 'pracownicy.md (Pracownicy)', False),
    ):
        nag, d = naglowek_i_dane(T / repo / '.pages.yml')
        if any(c.get('name') == 'strony' for c in d['content']):
            raise SystemExit(f'{repo}: kolekcja „strony” już jest')
        s = copy.deepcopy(wzor)
        s['label'] = etykieta
        s['path'] = 'src/content/strony'
        s['description'] = OPIS_STRON.format(przyklad=listy.split(' ')[0] + ' → /' + listy.split(' ')[0][:-3], listy=listy)
        pole(s, 'body')['options']['path'] = media
        if podstron:
            i = [f['name'] for f in s['fields']].index('haslo') + 1
            s['fields'][i:i] = copy.deepcopy(HASLO_PODSTRON)
        d['content'].append(s)
        zapisz(T / repo / '.pages.yml', nag, d)


# ---------- etap 2 ----------
def etap2(T):
    p = T / 'Web-Aktualnosci/.pages.yml'
    nag, d = naglowek_i_dane(p)
    a = wpis(d, 'aktualnosci')
    if not any(f['name'] == 'wyroznij_do' for f in a['fields']):
        raise SystemExit('aktualności: pola wyroznij_do już nie ma — etap 2 już był.')
    a['fields'] = [f for f in a['fields'] if f['name'] != 'wyroznij_do']
    zapisz(p, nag, d)


# ---------- etap 3 ----------
STRONA = ['tytul', 'body', 'tytul_en', 'tresc_en', 'opis', 'opis_en', 'haslo', 'haslo_en', 'haslo_podstron', 'haslo_podstron_en',
          'liczby', 'pasek_boczny', 'bloki']


def uloz_strone(form, opis_tresci=ZASADY):
    nazwy = [f['name'] for f in form['fields']]
    if 'bloki' in nazwy:
        form['fields'] = [f for f in form['fields'] if f['name'] != 'bloki']
        nazwy.remove('bloki')
    uloz(form, [n for n in STRONA if n in nazwy or n == 'bloki'], nowe=[copy.deepcopy(BLOKI)])
    pole(form, 'body')['description'] = opis_tresci
    bogaty_en(form)
    t = pole(form, 'tytul_en')
    t['label'] = 'Tytuł EN'


def etap3(T):
    zmiany = {}

    def repo(nazwa):
        if nazwa not in zmiany:
            zmiany[nazwa] = naglowek_i_dane(T / nazwa / '.pages.yml')
        return zmiany[nazwa][1]

    # Strony
    for r in ('Web-Instytut', 'Web-Nauka', 'Web-Studia', 'Web-Aktualnosci', 'Web-Pracownicy', 'Web-Popularyzacja'):
        f = wpis(repo(r), 'strony')
        if f['fields'][1]['name'] == 'body':
            raise SystemExit(f'{r}: formularz Stron już ułożony — etap 3 już był.')
        uloz_strone(f)
    for n in ('deklaracja', 'prywatnosc', 'o-stronie'):
        uloz_strone(wpis(repo('Web-Ustawienia'), n))
    # Rok akademicki: dwa pola tekstu (Treść i Koniec strony), każde z EN
    ra = wpis(repo('Web-Studia'), 'rok-akademicki')
    uloz(ra, ['tytul', 'body', 'tytul_en', 'tresc_en', 'dalej', 'dalej_en', 'opis', 'opis_en', 'haslo', 'haslo_en', 'bloki'], nowe=[copy.deepcopy(BLOKI)])
    pole(ra, 'body')['description'] = 'Tekst wspólny pod tabelą „Rok w skrócie” (bez dat semestru); między Treścią a Końcem strony strona wstawia kalendarz.\n\n' + ZASADY
    bogaty_en(ra)
    bogaty_en(ra, nazwa='dalej_en', etykieta='Koniec strony EN',
              opis='Koniec strony po angielsku, w tym samym układzie. Puste = strona angielska pokaże tekst polski.')
    pole(ra, 'tytul_en')['label'] = 'Tytuł EN'

    # Wpisy: pola podstawowe, Treść, Treść EN, reszta
    a = wpis(repo('Web-Aktualnosci'), 'aktualnosci')
    uloz(a, ['tytul', 'data', 'rodzaj', 'body', 'tresc_en', 'dla', 'zajawka', 'zdjecie', 'zdjecie_opis', 'zdjecie_opis_en',
             'wydarzenie_poczatek', 'wydarzenie_koniec', 'wydarzenie_miejsce', 'galeria', 'album', 'zalaczniki', 'zaklad', 'tytul_en', 'zajawka_en'])
    bogaty_en(a, opis='Treść po angielsku, w tym samym układzie co Treść. Puste = wersja angielska pokaże treść po polsku.')
    o = wpis(repo('Web-Aktualnosci'), 'obrony')
    uloz(o, ['kandydat', 'tytul_rozprawy', 'termin', 'miejsce', 'body', 'tresc_en', 'zdjecie', 'zdjecie_opis', 'zdjecie_opis_en', 'promotorzy',
             'data_ogloszenia', 'w_aktualnosciach', 'zawiadomienie', 'rozprawa', 'streszczenie_pl', 'streszczenie_en', 'recenzje', 'bip', 'zaklad'])
    bogaty_en(o, opis='Opis po angielsku, w tym samym układzie. Puste = wersja angielska pokaże zaproszenie złożone z danych '
                      '(albo opis po polsku, gdy jest).')
    k = wpis(repo('Web-Nauka'), 'konferencje')
    uloz(k, ['tytul', 'poczatek', 'koniec', 'miejsce', 'body', 'tytul_en', 'strona', 'organizatorzy', 'zaklad', 'zdjecie', 'odwolana'])
    pole(k, 'organizatorzy')['hidden'] = True
    pole(k, 'organizatorzy')['label'] = 'Organizatorzy z Instytutu (strona tego pola nie pokazuje; ukryte, dane zostają)'
    g = wpis(repo('Web-Nauka'), 'granty')
    uloz(g, ['tytul', 'rodzaj', 'rok_od', 'rok_do', 'body', 'tytul_en', 'kod', 'program', 'kierownik', 'wykonawcy', 'kwota', 'zaklad', 'strona'])

    # Zakłady i „Warto wiedzieć”: grupa „Karta” pod tekstem (obiekt karta — dane plików przenosi wpisy.py)
    def karta(form, pola_karty, opis, kolejnosc):
        stare = {f['name']: f for f in form['fields']}
        obiekt = {'name': 'karta', 'label': 'Karta', 'description': opis, 'type': 'object', 'fields': [stare.pop(n) for n in pola_karty]}
        form['fields'] = list(stare.values())
        uloz(form, kolejnosc, nowe=[obiekt])

    z = wpis(repo('Web-Instytut'), 'zaklady')
    karta(z, ['nazwa_krotka', 'kierownik', 'telefon', 'opis', 'haslo', 'obszary', 'strona', 'zdjecie', 'zdjecie_opis', 'zdjecie_opis_en',
              'nazwa_krotka_en', 'opis_en', 'haslo_en', 'obszary_en'],
          'Karta zakładu na liście „Struktura i zakłady” i ramka jego strony: krótka nazwa, kierownik, telefon, zdanie, hasło na banerze, '
          'obszary badań, strona zespołu, zdjęcie (i EN).',
          ['nazwa', 'body', 'tresc_en', 'karta', 'nazwa_en', 'kolejnosc'])
    bogaty_en(z, opis='Opis zakładu po angielsku, w tym samym układzie. Puste = strona angielska pokaże opis polski.')
    z['view']['fields'] = ['nazwa', 'karta.kierownik']
    w = wpis(repo('Web-Instytut'), 'warto_wiedziec')
    karta(w, ['rok', 'zajawka', 'zajawka_en', 'obraz', 'obraz_opis', 'obraz_opis_en', 'link', 'link_etykieta', 'link_etykieta_en'],
          'Karta pozycji: rok (duża liczba), zajawka, zdjęcie z opisem i link z napisem na przycisku (i EN).',
          ['tytul', 'body', 'tresc_en', 'karta', 'tytul_en', 'dzial', 'na_glownej', 'zawsze', 'kolejnosc', 'zrodla'])
    bogaty_en(w, opis='Opis po angielsku, w tym samym układzie. Puste = strona angielska pokaże opis polski.')
    w['view']['fields'] = ['tytul', 'karta.rok', 'dzial', 'na_glownej']

    for r, (nag, d) in zmiany.items():
        zapisz(T / r / '.pages.yml', nag, d)
    print('Ułożone formularze w:', ', '.join(zmiany))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--tresci', required=True, type=Path)
    ap.add_argument('--etap', required=True, type=int, choices=(1, 2, 3))
    a = ap.parse_args()
    {1: etap1, 2: etap2, 3: etap3}[a.etap](a.tresci)
    print(f'etap {a.etap}: gotowe')


if __name__ == '__main__':
    main()
