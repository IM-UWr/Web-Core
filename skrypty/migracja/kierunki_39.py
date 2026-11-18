#!/usr/bin/env python3
"""Zlecenie 39: kierunki w menu i kafelkach bez automatów; studia podyplomowe jako kierunek.

Trzy kroki, każdy osobnym commitem w repozytorium treści (kolejność pushy: lista → Web-Core → podyplomowe i przeniesienie;
przy każdym stanie pośrednim strona wygląda tak samo):
  lista <Web-Ustawienia> <Web-Studia>
      Formularz listy studia.kierunki w .pages.yml (opisy, wymagane pola, nowe pole „Nazwa w menu”, ukryte `pozycja`)
      i dane w ustawienia.json: każda pozycja dostaje jawnie to, co strona pokazuje dziś, także wartości liczone dotąd
      zastępczo w src/lib/menu.ts (pełna nazwa kierunku jako opis w menu SIAD i ISIM, nazwa i opis studiów podyplomowych
      z ręcznego linku w nawigacja.json), oraz jawne „pokaż w menu” / „pokaż na stronie głównej”.
  podyplomowe <Web-Ustawienia>
      Pozycja /studia/podyplomowe dostaje „pokaż w menu”, ręczny link do niej znika z nawigacja.json (menu wygląda tak samo).
  przenies <Web-Studia>
      src/content/strony/studia/podyplomowe.md → src/content/kierunki/podyplomowe.md w formacie kierunku: tytul → nazwa,
      opis, hasło i liczby → baner (n → wartosc). Treść, treść EN i komentarze bez zmian.

Skrypt odmawia, jeśli krok jest już zrobiony albo dane wyglądają inaczej, niż zakłada.
Uruchomienie (PyYAML):  python skrypty/migracja/kierunki_39.py <krok> <katalog repozytorium> [...]
"""
import json
import re
import sys
from pathlib import Path

import yaml

WC = Path(__file__).resolve().parents[2]
ADRES_PODYPLOMOWYCH = '/studia/podyplomowe'
KOLEJNOSC = ['adres', 'nazwa_menu', 'opis_menu', 'nazwa', 'poziom', 'opis', 'w_menu', 'na_stronie_glownej',
             'nazwa_menu_en', 'opis_menu_en', 'nazwa_en', 'poziom_en', 'opis_en']

STARY_FORMULARZ = '''      - name: kierunki
        label: Kierunki w menu „Studia” i kafelki na stronie głównej (kolejność = kolejność na liście; kierunek spoza listy pojawi się sam na końcu)
        description: Kierunek z sekcji Kierunki (Web-Studia) wpisujesz adresem /studia/<nazwa pliku>, np. /studia/matematyka; puste pola biorą wtedy pełną nazwę kierunku. Pozycja z innym adresem (np. studia podyplomowe) to zwykły kafelek albo link.
        type: object
        list:
          collapsible:
            collapsed: true
            summary: "{nazwa}"
        fields:
        - name: adres
          label: Adres (np. /studia/matematyka)
          type: string
          required: true
        - name: nazwa
          label: Nazwa w menu i na kafelku (puste = pełna nazwa kierunku)
          type: string
        - name: poziom
          label: 'Kafelek: napis nad nazwą (np. Kierunek, III stopień; puste przy kierunku = Kierunek)'
          type: string
        - name: opis
          label: 'Kafelek: jedno krótkie zdanie'
          type: string
        - name: opis_menu
          label: Krótki opis w menu „Studia” (puste = przy krótkiej nazwie pełna nazwa, inaczej bez opisu)
          type: string
        - name: w_menu
          label: Pokaż w menu „Studia”
          type: boolean
          default: true
        - name: na_stronie_glownej
          label: Pokaż kafelek na stronie głównej
          type: boolean
          default: true
        - name: nazwa_en
          label: 'EN: nazwa'
          type: string
        - name: poziom_en
          label: 'EN: napis nad nazwą'
          type: string
        - name: opis_en
          label: 'EN: zdanie na kafelku'
          type: string
        - name: opis_menu_en
          label: 'EN: krótki opis w menu'
          type: string
'''

NOWY_FORMULARZ = '''      - name: kierunki
        label: Kierunki w menu „Studia” i kafelki na stronie głównej
        description: "Tylko pozycje z tej listy są w menu „Studia” (komputer i telefon), na stronie /studia i w kafelkach na stronie głównej, w kolejności listy. Nowy kierunek pojawi się w menu i kafelkach dopiero po dodaniu go tutaj. Strona pokazuje pola tak, jak są wpisane: puste pole zostaje puste."
        type: object
        list:
          collapsible:
            collapsed: true
            summary: "{nazwa}"
        fields:
        - name: adres
          label: Adres
          description: "Adres strony kierunku: /studia/ i nazwa pliku z Web-Studia → Kierunki, np. /studia/matematyka, /studia/podyplomowe."
          type: string
          required: true
        - name: nazwa_menu
          label: Nazwa w menu
          description: "Nazwa w menu „Studia” i na stronie /studia, np. Matematyka, Studia podyplomowe. Sztuczną inteligencję w analizie danych strona skraca do SIAD."
          type: string
          required: true
        - name: opis_menu
          label: Opis w menu
          description: "Krótki opis pod nazwą w menu „Studia”, np. I i II stopień, pięć specjalności."
          type: string
          required: true
        - name: nazwa
          label: Nazwa na kafelku
          description: "Nazwa na kafelku na stronie głównej, np. Matematyka, Nauczanie matematyki."
          type: string
          required: true
        - name: poziom
          label: Napis nad nazwą na kafelku
          description: "Np. I i II stopień, Kierunek, III stopień, Podyplomowe. Puste: kafelek bez napisu."
          type: string
        - name: opis
          label: Zdanie na kafelku
          description: "Jedno krótkie zdanie pod nazwą, np. Nowy program studiów od roku 2026/27. Puste: kafelek bez zdania."
          type: string
        - name: w_menu
          label: Pokaż w menu „Studia”
          type: boolean
          default: true
        - name: na_stronie_glownej
          label: Pokaż kafelek na stronie głównej
          type: boolean
          default: true
        - name: nazwa_menu_en
          label: Nazwa w menu EN
          type: string
        - name: opis_menu_en
          label: Opis w menu EN
          type: string
        - name: nazwa_en
          label: Nazwa na kafelku EN
          type: string
        - name: poziom_en
          label: Napis nad nazwą na kafelku EN
          type: string
        - name: opis_en
          label: Zdanie na kafelku EN
          type: string
        - name: pozycja
          type: boolean
          hidden: true
'''


def czytaj_json(p):
    tekst = p.read_text(encoding='utf-8')
    dane = json.loads(tekst)
    koniec = '\n' if tekst.endswith('\n') else ''
    assert json.dumps(dane, ensure_ascii=False, indent=2) + koniec == tekst, f'{p}: inny format JSON niż indent=2'
    return dane, koniec


def zapisz_json(p, dane, koniec):
    p.write_text(json.dumps(dane, ensure_ascii=False, indent=2) + koniec, encoding='utf-8', newline='\n')


def skroty():
    """SKROTY z src/lib/patroni.ts (skrót długiej nazwy w menu, np. SIAD)."""
    ts = (WC / 'src/lib/patroni.ts').read_text(encoding='utf-8')
    blok = re.search(r'const SKROTY[^{]*\{(.*?)\};', ts, re.S).group(1)
    return dict(re.findall(r"'([^']+)':\s*'([^']+)'", blok))


def frontmatter(p):
    m = re.match(r'^---\n(.*?)\n---\n', p.read_text(encoding='utf-8'), re.S)
    return yaml.safe_load(m.group(1))


def grupa_kierunkow(nawigacja):
    grupy = [g for m in nawigacja['menu'] for g in m.get('grupy') or [] if g.get('kierunki')]
    assert len(grupy) == 1, 'jedna grupa menu z "kierunki": true'
    return grupy[0]


def krok_lista(ust, studia):
    pages = ust / '.pages.yml'
    tekst = pages.read_text(encoding='utf-8')
    if 'name: nazwa_menu' in tekst:
        raise SystemExit('lista: formularz ma już „nazwa_menu”')
    assert tekst.count(STARY_FORMULARZ) == 1, 'lista: formularz kierunków inny niż zakładany'
    p_ust = ust / 'src/data/ustawienia.json'
    dane, koniec = czytaj_json(p_ust)
    nawigacja, _ = czytaj_json(ust / 'src/data/nawigacja.json')
    reczne = {l['adres']: l for l in grupa_kierunkow(nawigacja)['linki']}
    kierunki = {f'/studia/{f.stem}': frontmatter(f) for f in (studia / 'src/content/kierunki').glob('*.md')}
    sk = skroty()
    nowe = []
    for p in dane['studia']['kierunki']:
        adres = re.sub(r'/+$', '', re.sub(r'#.*$', '', p['adres']))
        k = kierunki.get(adres)
        w_menu = p.get('w_menu') is not False
        # dotychczasowa logika src/lib/menu.ts (przed zleceniem 39) — to, co menu pokazuje dziś
        pelna, pelna_en = (k or {}).get('nazwa'), (k or {}).get('nazwa_en')
        e = p.get('nazwa') or pelna or p['adres']
        e_en = p.get('nazwa_en') or pelna_en or e
        opis_m = p.get('opis_menu') or (pelna if pelna and (sk.get(e.strip()) or e != pelna) else None)
        opis_m_en = p.get('opis_menu_en') or (pelna_en if pelna_en and e_en != pelna_en else None)
        if not w_menu:  # pozycja poza menu: nazwa i opis z ręcznego linku w nawigacja.json (dziś to on jest w menu)
            l = reczne.get(adres)
            assert l, f'{adres}: brak w menu i bez ręcznego linku — nie wiadomo, co wpisać jako nazwę w menu'
            e, e_en, opis_m, opis_m_en = l['etykieta'], l.get('etykieta_en'), l.get('opis'), l.get('opis_en')
        nowa = dict(p)
        nowa.update(nazwa_menu=e, nazwa_menu_en=e_en, opis_menu=opis_m, opis_menu_en=opis_m_en, w_menu=w_menu,
                    na_stronie_glownej=p.get('na_stronie_glownej') is not False)
        # kafelek (src/components/zal/DrugiEkran.astro przed zleceniem 39): poziom i nazwa z zastępstwem z pliku kierunku
        if not p.get('poziom') and k:
            nowa['poziom'], nowa['poziom_en'] = 'Kierunek', p.get('poziom_en') or 'Programme'
        if not p.get('nazwa') and k:
            nowa['nazwa'], nowa['nazwa_en'] = pelna, p.get('nazwa_en') or pelna_en
        for pole in ('nazwa_menu', 'opis_menu', 'nazwa'):
            assert nowa.get(pole), f'{adres}: brak wartości „{pole}” (pole wymagane)'
        nadmiar = set(nowa) - set(KOLEJNOSC)
        assert not nadmiar, f'{adres}: nieznane pola {nadmiar}'
        nowe.append({k2: nowa[k2] for k2 in KOLEJNOSC if nowa.get(k2) not in (None, '')})
        print(f'  {adres}: menu „{e}” / „{opis_m}”, EN „{e_en}” / „{opis_m_en}”; w menu: {w_menu}')
    dane['studia']['kierunki'] = nowe
    pages.write_text(tekst.replace(STARY_FORMULARZ, NOWY_FORMULARZ), encoding='utf-8', newline='\n')
    zapisz_json(p_ust, dane, koniec)


def krok_podyplomowe(ust):
    p_ust, p_naw = ust / 'src/data/ustawienia.json', ust / 'src/data/nawigacja.json'
    dane, k1 = czytaj_json(p_ust)
    nawigacja, k2 = czytaj_json(p_naw)
    poz = [p for p in dane['studia']['kierunki'] if p['adres'].rstrip('/') == ADRES_PODYPLOMOWYCH]
    assert len(poz) == 1 and poz[0].get('nazwa_menu'), 'podyplomowe: najpierw krok „lista”'
    if poz[0].get('w_menu') is not False:
        raise SystemExit('podyplomowe: pozycja jest już w menu')
    g = grupa_kierunkow(nawigacja)
    reczne = [l for l in g['linki'] if l['adres'].rstrip('/') == ADRES_PODYPLOMOWYCH]
    assert len(reczne) == 1, 'podyplomowe: brak ręcznego linku w nawigacja.json'
    l = reczne[0]
    assert (l['etykieta'], l.get('etykieta_en'), l.get('opis'), l.get('opis_en')) == (
        poz[0]['nazwa_menu'], poz[0].get('nazwa_menu_en'), poz[0]['opis_menu'], poz[0].get('opis_menu_en')), \
        'podyplomowe: ręczny link i pozycja listy mają inne napisy — menu by się zmieniło'
    poz[0]['w_menu'] = True
    g['linki'] = [x for x in g['linki'] if x is not l]
    zapisz_json(p_ust, dane, k1)
    zapisz_json(p_naw, nawigacja, k2)
    print(f'  {ADRES_PODYPLOMOWYCH}: w menu z listy; ręczny link usunięty (zostało linków w grupie: {len(g["linki"])})')


def yaml_wartosc(v):
    t = yaml.safe_dump(v, allow_unicode=True, default_flow_style=True, width=10_000).strip()
    return t[:-4].strip() if t.endswith('\n...') else t.removesuffix('...').strip()


def krok_przenies(studia):
    stary = studia / 'src/content/strony/studia/podyplomowe.md'
    nowy = studia / 'src/content/kierunki/podyplomowe.md'
    if nowy.exists():
        raise SystemExit('przenies: kierunki/podyplomowe.md już jest')
    tekst = stary.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?\n)---\n', tekst, re.S)
    fm, body = m.group(1), tekst[m.end():]
    d = yaml.safe_load(fm)
    znane = {'tytul', 'opis', 'tytul_en', 'opis_en', 'haslo', 'haslo_en', 'liczby', 'tresc_en', 'opublikowany', 'format_tresci'}
    assert set(d) <= znane, f'przenies: nieznane pola strony {set(d) - znane}'
    assert d.get('format_tresci') == 'jawne' and d.get('opublikowany') is not False
    blok_en = re.search(r'^tresc_en: \|.*?(?=^\S)', fm, re.S | re.M).group(0)  # treść EN słowo w słowo
    linie = [f'nazwa: {yaml_wartosc(d["tytul"])}']
    if d.get('tytul_en'):
        linie.append(f'nazwa_en: {yaml_wartosc(d["tytul_en"])}')
    linie += [blok_en.rstrip('\n'), 'format_tresci: jawne', 'opublikowany: true', 'baner:']
    for pole in ('opis', 'haslo'):
        if d.get(pole):
            linie.append(f'  {pole}: {yaml_wartosc(d[pole])}')
    if d.get('liczby'):
        linie.append('  liczby:')
        for x in d['liczby']:
            linie.append(f'    - wartosc: {yaml_wartosc(str(x["n"]))}')
            for pole in ('etykieta', 'etykieta_en'):
                if x.get(pole):
                    linie.append(f'      {pole}: {yaml_wartosc(x[pole])}')
    for pole in ('opis_en', 'haslo_en'):
        if d.get(pole):
            linie.append(f'  {pole}: {yaml_wartosc(d[pole])}')
    nowy_fm = '\n'.join(linie) + '\n'
    # kontrola: dane po przeniesieniu = dane strony w nowym układzie; treść bez zmian
    n = yaml.safe_load(nowy_fm)
    oczekiwane = {'nazwa': d['tytul'], 'tresc_en': d['tresc_en'], 'format_tresci': 'jawne', 'opublikowany': True,
                  'baner': {k: v for k, v in {'opis': d.get('opis'), 'haslo': d.get('haslo'), 'opis_en': d.get('opis_en'),
                            'haslo_en': d.get('haslo_en'),
                            'liczby': [{'wartosc': str(x['n']), **{p: x[p] for p in ('etykieta', 'etykieta_en') if x.get(p)}}
                                       for x in d.get('liczby') or []]}.items() if v}}
    if d.get('tytul_en'):
        oczekiwane['nazwa_en'] = d['tytul_en']
    assert n == oczekiwane, f'przenies: dane po przeniesieniu się różnią\n{n}\n{oczekiwane}'
    nowy.write_text(f'---\n{nowy_fm}---\n{body}', encoding='utf-8', newline='\n')
    stary.unlink()
    print(f'  {stary.relative_to(studia)} → {nowy.relative_to(studia)} (treść {len(body.splitlines())} linii bez zmian)')


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    krok, *kat = sys.argv[1:]
    kat = [Path(k) for k in kat]
    {'lista': lambda: krok_lista(*kat), 'podyplomowe': lambda: krok_podyplomowe(*kat), 'przenies': lambda: krok_przenies(*kat)}[krok]()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
