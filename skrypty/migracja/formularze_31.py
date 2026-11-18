#!/usr/bin/env python3
"""Zlecenie 31: formularze Pages CMS (.pages.yml) — puste pozycje list, termin wydarzenia „na kliknięcie”, daty bez „teraz”,
nazwy plików z tytułu. Skrypt zmienia tekst plików tylko w miejscach zmian (reszta pliku bez zmian, także cudzysłowy i wcięcia).

Co robi (szczegóły i powody: RAPORT-ZLECENIE-31.md):
  1a  W listach obiektów, w których bez jednego podpola pozycja nie ma sensu, to podpole jest wymagane, a lista dostaje ukryte
      pole techniczne `pozycja` (boolean). Pages CMS uznaje całkiem pustą pozycję („Add an item” bez wypełnienia) za nieistniejącą
      i jej nie sprawdza, ale zapisuje ją do pliku jako `- {}` (lib/schema.ts: isEffectivelyEmpty). Boolean ma wartość false, która
      „coś znaczy”, więc pozycja przestaje być pusta i CMS sprawdza ją w całości: czerwony komunikat, zapis zablokowany.
  2a  Web-Aktualnosci: pola wydarzenie_poczatek / _koniec / _miejsce znikają, zamiast nich grupa `termin` (lista, najwyżej 1 pozycja)
      zaraz pod „Rodzaj”. Dane przenosi skrypt termin.py.
  2d  Opcjonalne pola dat dostają `default: ""` (bez tego Pages CMS wpisuje do pustego pola datę otwarcia formularza).
  3   Web-Aktualnosci: bez `filename.field: create` — nazwa pliku powstaje przy zapisie z tytułu.

Skrypt odmawia, jeśli formularz już ma zmianę (np. pole `pozycja`) albo nie ma oczekiwanego pola.

Uruchomienie (PyYAML):  python skrypty/migracja/formularze_31.py <katalog z klonami Web-*> [Repo ...]
"""
import sys
from pathlib import Path

import yaml

OPIS_TERMINU = (
    'Tylko jeśli wpis zapowiada wydarzenie (kliknij „Add an item”). Termin trafia do Kalendarza, do „Nadchodzących wydarzeń” '
    'i do Szybkiego dostępu na stronie głównej, a po jego końcu wpis znika z Aktualności na stronie głównej. Dzień, którego '
    'dotyczy zwykła informacja (np. dzień wręczenia medalu), wpisz w polu „Data”, nie tutaj.'
)
WZOR_GODZINY = '^(|([01]?[0-9]|2[0-3])[:.][0-5][0-9])$'
TERMIN = {
    'name': 'termin', 'label': 'Termin wydarzenia', 'description': OPIS_TERMINU, 'type': 'object', 'list': {'max': 1},
    'fields': [
        {'name': 'dzien', 'label': 'Dzień', 'type': 'date', 'required': True, 'default': ''},
        {'name': 'godzina', 'label': 'Godzina rozpoczęcia (np. 13:00; puste = cały dzień)', 'type': 'string',
         'pattern': {'regex': WZOR_GODZINY, 'message': 'Wpisz godzinę w formacie 13:00'}},
        {'name': 'dzien_konca', 'label': 'Dzień zakończenia (tylko wydarzenia wielodniowe)', 'type': 'date', 'default': ''},
        {'name': 'godzina_konca', 'label': 'Godzina zakończenia (puste = 2 godziny po rozpoczęciu)', 'type': 'string',
         'pattern': {'regex': WZOR_GODZINY, 'message': 'Wpisz godzinę w formacie 14:30'}},
        {'name': 'miejsce', 'label': 'Miejsce (np. sala WS, Instytut Matematyczny UWr)', 'type': 'string'},
        {'name': 'pozycja', 'type': 'boolean', 'hidden': True},
    ],
}
POZYCJA = {'name': 'pozycja', 'type': 'boolean', 'hidden': True}


def opis_kosza(co):
    return f'Wymagane. Jeśli nie chcesz {co}, usuń tę pozycję ikoną kosza.'


# Zmiany: (ścieżka pola, operacja, argumenty). Ścieżka: nazwa formularza / pole / podpole (pola listy przez „/”).
# wymagane — podpola listy, które stają się wymagane (z opcjonalnym opisem); pozycja — dopisz ukryte pole techniczne.
ZMIANY = {
    'Web-Aktualnosci': [
        ('aktualnosci', 'bez_field_create'),
        ('aktualnosci', 'wstaw_po', 'rodzaj', TERMIN),
        ('aktualnosci', 'usun', ['wydarzenie_poczatek', 'wydarzenie_koniec', 'wydarzenie_miejsce']),
        ('aktualnosci/galeria', 'wymagane', {'plik': opis_kosza('zdjęcia')}),
        ('aktualnosci/galeria', 'pozycja'),
        ('aktualnosci/zalaczniki', 'wymagane', {'plik': opis_kosza('załącznika')}),
        ('aktualnosci/zalaczniki', 'pozycja'),
        ('obrony', 'bez_field_create'),
        ('obrony/data_ogloszenia', 'bez_teraz'),
        ('obrony/recenzje', 'wymagane', {'recenzent': None, 'plik': 'Wymagane (recenzja w PDF). Jeśli recenzji jeszcze nie ma, usuń tę pozycję ikoną kosza.'}),
        ('obrony/recenzje', 'pozycja'),
        ('strony/liczby', 'pozycja'),
    ],
    'Web-Pracownicy': [
        ('strony/liczby', 'pozycja'),
    ],
    'Web-Instytut': [
        ('strona-dzialu/o_instytucie_fakty', 'wymagane', {'wartosc': None}),
        ('strona-dzialu/o_instytucie_fakty', 'pozycja'),
        ('strony/liczby', 'pozycja'),
        ('wladze/osoby', 'pozycja'),
        ('wladze/wydzial/osoby', 'pozycja'),
        ('wladze/linki', 'pozycja'),
    ],
    'Web-Nauka': [
        ('strona-dzialu/badania_fakty', 'wymagane', {'wartosc': None}),
        ('strona-dzialu/badania_fakty', 'pozycja'),
        ('strony/liczby', 'pozycja'),
        ('publikacje/lata', 'pozycja'),
        ('publikacje/czasopisma', 'pozycja'),
        ('konferencje/koniec', 'bez_teraz'),
    ],
    'Web-Studia': [
        ('strona-dzialu/o_studiach_fakty', 'wymagane', {'wartosc': None}),
        ('strona-dzialu/o_studiach_fakty', 'pozycja'),
        ('strony/liczby', 'pozycja'),
        ('kierunki/baner/liczby', 'wymagane', {'wartosc': None, 'etykieta': None}),
        ('kierunki/baner/liczby', 'pozycja'),
        ('specjalnosci/opiekunowie', 'pozycja'),
        ('specjalnosci/baner/liczby', 'pozycja'),
        *[(f'kolory-dni/semestry/terminy/{p}', 'bez_teraz')
          for p in ('semestr_od', 'semestr_do', 'inauguracja', 'sesja_od', 'sesja_do', 'poprawkowa_od', 'poprawkowa_do')],
        ('kolory-dni/semestry/terminy/przerwy/od', 'bez_teraz'),
        ('kolory-dni/semestry/terminy/przerwy/do', 'bez_teraz'),
        ('kolory-dni/semestry/terminy/przerwy', 'wymagane', {'od': None}),
        ('kolory-dni/semestry/terminy/przerwy', 'pozycja'),
        ('kolory-dni/semestry/wolne/od', 'bez_teraz'),
        ('kolory-dni/semestry/wolne/do', 'bez_teraz'),
        ('kolory-dni/semestry/wolne', 'wymagane', {'od': None}),
        ('kolory-dni/semestry/wolne', 'pozycja'),
        ('kolory-dni/semestry/zamiany/data', 'bez_teraz'),
        ('kolory-dni/semestry/zamiany', 'wymagane', {'data': None, 'jak_dzien': None}),
        ('kolory-dni/semestry/zamiany', 'pozycja'),
        ('kolory-dni/semestry/wyjatki/data', 'bez_teraz'),
        ('kolory-dni/semestry/wyjatki', 'wymagane', {'data': None, 'kolor': None}),
        ('kolory-dni/semestry/wyjatki', 'pozycja'),
    ],
    'Web-Popularyzacja': [
        ('popularyzacja/o_popularyzacji_fakty', 'pozycja'),
        ('popularyzacja/tradycja', 'pozycja'),
        ('popularyzacja/linki', 'pozycja'),
    ],
    'Web-Ustawienia': [
        ('ustawienia/przyciski', 'wymagane', {'etykieta': None, 'adres': None}),
        ('ustawienia/przyciski', 'pozycja'),
        ('ustawienia/partnerzy', 'wymagane', {'nazwa': None}),
        ('ustawienia/partnerzy', 'pozycja'),
        ('skroty/kafelki', 'wymagane', {'etykieta': None, 'adres': None}),
        ('skroty/kafelki', 'pozycja'),
        ('nawigacja/menu/grupy/linki', 'wymagane', {'etykieta': None, 'adres': None}),
        ('nawigacja/menu/grupy/linki', 'pozycja'),
    ],
    **{r: [('referaty/pliki', 'wymagane', {'plik': opis_kosza('pliku')}), ('referaty/pliki', 'pozycja')]
       for r in ('Web-Sem-Analiza-Harmoniczna', 'Web-Sem-Dydaktyka', 'Web-Sem-Dyskretna-Analiza-Harmoniczna', 'Web-Sem-Geometria',
                 'Web-Sem-Prawdopodobienstwo', 'Web-Sem-Rownania-Rozniczkowe', 'Web-Sem-Statystyka', 'Web-Sem-Teoria-Modeli',
                 'Web-Sem-Topologia')},
}


class Zrzut(yaml.SafeDumper):
    pass


# ---------- wyszukiwanie w drzewie YAML (pozycje znaków z yaml.compose) ----------
def klucz(mapa, nazwa):
    for k, v in mapa.value:
        if k.value == nazwa:
            return k, v
    return None, None


def formularze(seq):
    for poz in seq.value:
        _, typ = klucz(poz, 'type')
        _, items = klucz(poz, 'items')
        if typ is not None and typ.value == 'group' and items is not None:
            yield from formularze(items)
        else:
            yield poz


def wezel(korzen, sciezka):
    """Węzeł (mapa) formularza albo pola: 'aktualnosci/galeria/plik'."""
    czesci = sciezka.split('/')
    _, content = klucz(korzen, 'content')
    biezacy = next((f for f in formularze(content) if klucz(f, 'name')[1].value == czesci[0]), None)
    if biezacy is None:
        raise SystemExit(f'brak formularza {czesci[0]}')
    for nazwa in czesci[1:]:
        _, pola = klucz(biezacy, 'fields')
        biezacy = next((p for p in pola.value if klucz(p, 'name')[1].value == nazwa), None) if pola is not None else None
        if biezacy is None:
            raise SystemExit(f'{sciezka}: brak pola {nazwa}')
    return biezacy


def koniec(w):
    """Indeks końca ostatniego skalara w węźle."""
    if isinstance(w, yaml.ScalarNode):
        return w.end_mark.index
    ostatni = w.value[-1]
    return koniec(ostatni[1] if isinstance(w, yaml.MappingNode) else ostatni)


def koniec_linii(tekst, i):
    if i > 0 and tekst[i - 1] == '\n':
        return i
    j = tekst.find('\n', i)
    return len(tekst) if j < 0 else j + 1


def poczatek_linii(tekst, i):
    return tekst.rfind('\n', 0, i) + 1


def fragment(obiekt, kolumna):
    """Pozycja listy pól jako tekst YAML z myślnikiem w podanej kolumnie (styl jak w plikach: listy bez wcięcia pod kluczem)."""
    zrzut = yaml.dump([obiekt], Dumper=Zrzut, allow_unicode=True, sort_keys=False, width=10**6)
    return ''.join(' ' * kolumna + linia + '\n' for linia in zrzut.rstrip('\n').split('\n'))


# ---------- operacje ----------
def wstaw_klucz_po_typie(tekst, pole, nazwa, wartosc_yaml):
    k_typ, v_typ = klucz(pole, 'type')
    kolumna = k_typ.start_mark.column
    i = koniec_linii(tekst, v_typ.end_mark.index)
    return tekst[:i] + ' ' * kolumna + f'{nazwa}: {wartosc_yaml}\n' + tekst[i:]


def op_wymagane(tekst, sciezka, podpola):
    for nazwa, opis in podpola.items():
        pole = wezel(yaml.compose(tekst), f'{sciezka}/{nazwa}')
        k, v = klucz(pole, 'required')
        if k is not None:
            if v.value != 'true':
                raise SystemExit(f'{sciezka}/{nazwa}: required = {v.value}')
        else:
            tekst = wstaw_klucz_po_typie(tekst, pole, 'required', 'true')
        if opis:
            pole = wezel(yaml.compose(tekst), f'{sciezka}/{nazwa}')
            if klucz(pole, 'description')[0] is not None:
                raise SystemExit(f'{sciezka}/{nazwa}: pole ma już opis')
            k_typ = klucz(pole, 'type')[0]
            zrzut = yaml.dump({'description': opis}, Dumper=Zrzut, allow_unicode=True, width=10**6).rstrip('\n')
            k_lab, v_lab = klucz(pole, 'label')
            i = koniec_linii(tekst, v_lab.end_mark.index)
            tekst = tekst[:i] + ' ' * k_typ.start_mark.column + zrzut + '\n' + tekst[i:]
    return tekst


def op_bez_teraz(tekst, sciezka):
    pole = wezel(yaml.compose(tekst), sciezka)
    if klucz(pole, 'type')[1].value != 'date':
        raise SystemExit(f'{sciezka}: to nie jest pole daty')
    if klucz(pole, 'default')[0] is not None:
        raise SystemExit(f'{sciezka}: pole ma już default')
    return wstaw_klucz_po_typie(tekst, pole, 'default', '""')


def op_pozycja(tekst, sciezka):
    pole = wezel(yaml.compose(tekst), sciezka)
    _, pola = klucz(pole, 'fields')
    if any(klucz(p, 'name')[1].value == 'pozycja' for p in pola.value):
        raise SystemExit(f'{sciezka}: pole pozycja już jest')
    ostatnie = pola.value[-1]
    kolumna = ostatnie.start_mark.column - 2
    if tekst[ostatnie.start_mark.index - 2] != '-':
        raise SystemExit(f'{sciezka}: nieoczekiwany układ listy pól')
    i = koniec_linii(tekst, koniec(ostatnie))
    return tekst[:i] + fragment(POZYCJA, kolumna) + tekst[i:]


def op_wstaw_po(tekst, sciezka, po, obiekt):
    form = wezel(yaml.compose(tekst), sciezka)
    _, pola = klucz(form, 'fields')
    if any(klucz(p, 'name')[1].value == obiekt['name'] for p in pola.value):
        raise SystemExit(f'{sciezka}: pole {obiekt["name"]} już jest')
    poprzednie = next(p for p in pola.value if klucz(p, 'name')[1].value == po)
    kolumna = poprzednie.start_mark.column - 2
    i = koniec_linii(tekst, koniec(poprzednie))
    return tekst[:i] + fragment(obiekt, kolumna) + tekst[i:]


def op_usun(tekst, sciezka, nazwy):
    for nazwa in nazwy:
        pole = wezel(yaml.compose(tekst), f'{sciezka}/{nazwa}')
        a = poczatek_linii(tekst, pole.start_mark.index)
        b = koniec_linii(tekst, koniec(pole))
        tekst = tekst[:a] + tekst[b:]
    return tekst


def op_bez_field_create(tekst, sciezka):
    form = wezel(yaml.compose(tekst), sciezka)
    _, nazwa_pliku = klucz(form, 'filename')
    if not isinstance(nazwa_pliku, yaml.MappingNode):
        raise SystemExit(f'{sciezka}: filename nie jest obiektem')
    k, v = klucz(nazwa_pliku, 'field')
    if k is None or v.value != 'create':
        raise SystemExit(f'{sciezka}: brak filename.field: create')
    a = poczatek_linii(tekst, k.start_mark.index)
    b = koniec_linii(tekst, v.end_mark.index)
    return tekst[:a] + tekst[b:]


OPERACJE = {'wymagane': op_wymagane, 'bez_teraz': op_bez_teraz, 'pozycja': op_pozycja, 'wstaw_po': op_wstaw_po,
            'usun': op_usun, 'bez_field_create': op_bez_field_create}


def zmien(tekst, zmiany):
    for sciezka, nazwa, *argumenty in zmiany:
        tekst = OPERACJE[nazwa](tekst, sciezka, *argumenty)
        yaml.safe_load(tekst)  # po każdej zmianie plik musi być poprawnym YAML-em
    return tekst


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    katalog = Path(sys.argv[1])
    repozytoria = sys.argv[2:] or list(ZMIANY)
    for repo in repozytoria:
        p = katalog / repo / '.pages.yml'
        stary = p.read_text(encoding='utf-8')
        nowy = zmien(stary, ZMIANY[repo])
        p.write_text(nowy, encoding='utf-8', newline='\n')
        print(f'{repo}: {len(ZMIANY[repo])} zmian')


if __name__ == '__main__':
    main()
