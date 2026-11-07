#!/usr/bin/env python3
"""Migracja kierunków do jednego Markdownu (zlecenie 28; wzór: .przekazanie/zlecenia/28-zalaczniki/).

Przerabia stare pliki kierunków (src/content/kierunki/<id>.md, ok. 100 pól YAML) w klonie Web-Studia na:
  • src/content/kierunki/<id>.md            — nazwa, nazwa_en, tresc_en (Markdown EN) i body (Markdown PL);
  • src/content/kierunki-baner/<id>.json    — nadtytuł, zdanie pod nazwą, hasło, liczby;
  • src/data/przypomnienia.json             — terminy z „Przypomnieniem” (UID jak dotąd: termin-<id>-<nr wiersza>);
oraz w klonie Web-Ustawienia: lista studia.kierunki w src/data/ustawienia.json (menu „Studia” i kafelki strony głównej,
kolejność = dawne pole kolejnosc; dawne „Dodatkowe kafelki” na końcu, poza menu, jak dotąd).

Sekcje i nagłówki PL/EN jak dotąd na stronie (Kierunek.astro sprzed zlecenia 28); wartości EN z tą samą zastępczością
co wybierz() w src/lib/i18n.ts (puste _en → polskie). Skrypt odmawia pracy na już przerobionych plikach i na końcu
sprawdza, że każda wartość starego pliku jest w nowych plikach albo jest na liście pominiętych (z powodem).

Uruchomienie (PyYAML):
  python skrypty/migracja/kierunki.py --studia <klon Web-Studia> --ustawienia <klon Web-Ustawienia> [--do <katalog>]
--do: zapis do osobnego katalogu (<katalog>/Web-Studia/…, <katalog>/Web-Ustawienia/…) zamiast w klonach — na próbę.
"""
import argparse
import datetime
import json
import re
import sys
from pathlib import Path

import yaml

TWARDE = '  \n'  # złamanie linii (Shift+Enter) — tak zapisuje je edytor Pages CMS (TipTap)
STARE_POLA = ('kolejnosc', 'podtytul', 'fakty', 'etapy', 'terminy', 'dlaczego', 'kontakt', 'akty', 'programy', 'faq')


def val(o, pole, en):
    """Wartość w języku; po angielsku pusta → polska (jak wybierz() w src/lib/i18n.ts)."""
    if en:
        v = o.get(pole + '_en')
        if v not in (None, ''):
            return v
    return o.get(pole)


def tytuly_en(t):
    """Port tytulyEn() z src/lib/osoby.ts (nazwiska w kontaktach po angielsku: „dr” → „Dr”, bez „mgr”)."""
    przed = r'(^|[\s,;(])'
    t = re.sub(r'(?:prof\.\s*)?dr\s+hab\.(?:\s*inż\.)?\s+([^,;]+?),\s*prof\.\s*UWr', r'Prof. \1', t, flags=re.I)
    t = re.sub(r'dr\s+hab\.(?:\s*inż\.)?,\s*prof\.\s*UWr\s+', 'Prof. ', t, flags=re.I)
    t = re.sub(r'prof\.\s*dr\s+hab\.(?:\s*inż\.)?', 'Prof.', t, flags=re.I)
    t = re.sub(r',\s*prof\.\s*UWr', '', t, flags=re.I)
    t = re.sub(przed + r'prof\.\s+', r'\1Prof. ', t, flags=re.I)
    t = re.sub(r'dr\s+hab\.(?:\s*inż\.)?', 'Dr hab.', t, flags=re.I)
    t = re.sub(przed + r'dr\.?\s+inż\.\s+', r'\1Dr ', t, flags=re.I)
    t = re.sub(przed + r'dr\.?\s+', r'\1Dr ', t, flags=re.I)
    t = re.sub(przed + r'mgr\.?(?:\s+inż\.)?\s+', r'\1', t, flags=re.I)
    t = re.sub(przed + r'inż\.\s+', r'\1', t, flags=re.I)
    return t


def linia(s):
    """Tekst pola w jednej linii (pola „text” bywają wielolinijkowe)."""
    return re.sub(r'\s*\n\s*', ' ', str(s or '')).strip()


def komorka(s):
    return linia(s).replace('|', '\\|')


def punkt(prefiks, linie):
    """Punkt listy: pierwsza linia po prefiksie, kolejne po Shift+Enter, wcięte pod tekst punktu."""
    wciecie = ' ' * len(prefiks)
    return prefiks + (TWARDE + wciecie).join(l for l in linie if l)


def link(nazwa, adres):
    adres = str(adres).strip()
    if re.search(r'[\s()<>]', adres):  # adres ze spacją albo nawiasem — w <…>, żeby Markdown go nie uciął
        adres = f'<{adres}>'
    return f'[{linia(nazwa)}]({adres})'


def plik(x):
    return x.get('wgraj') or x.get('plik')


def czytaj(sciezka):
    """Front matter i body; granice front matter to linie „---” (nie każde „---” w tekście, np. w tabeli)."""
    tekst = Path(sciezka).read_text(encoding='utf-8').replace('\r\n', '\n')
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', tekst, re.S)
    if not m:
        raise SystemExit(f'{sciezka}: brak front matter')
    return yaml.safe_load(m.group(1)) or {}, m.group(2)


def doktorat(d):
    return {e.get('stopien') for e in d.get('etapy') or []} == {'III'}


def tresc(d, en, body_pl):
    T = (lambda pl, ang: ang if en else pl)
    w = (lambda o, pole: val(o, pole, en))
    etapy = d.get('etapy') or []
    dr = doktorat(d)
    out = []

    def sekcja(h):
        out.append(f'## {h}\n')

    # O kierunku (po angielsku tresc_en; puste — tekst polski, jak dotąd)
    sekcja(T('O Kolegium Doktorskim', 'About the Doctoral College') if dr else T('O kierunku', 'About'))
    tekst = (d.get('tresc_en') if en and (d.get('tresc_en') or '').strip() else body_pl).strip()
    if tekst:
        out.append(tekst + '\n')

    # Strony szkoły doktorskiej (pole „przyciski” wyświetlało się tylko tam)
    if dr and d.get('przyciski'):
        sekcja(T('Strony szkoły doktorskiej', 'Doctoral school pages'))
        out.append('\n'.join('- ' + link(w(p, 'etykieta'), p['adres']) for p in d['przyciski']) + '\n')

    # Dlaczego warto → kafelki (pogrubiony początek punktu)
    if d.get('dlaczego'):
        sekcja(T('Dlaczego warto', 'Why join'))
        out.append('\n'.join(f"- **{linia(w(x, 'tytul'))}**" + (f" — {linia(w(x, 'opis'))}" if x.get('opis') else '')
                             for x in d['dlaczego']) + '\n')

    # Przebieg → oś (lista numerowana, „Etykieta: Tytuł” pogrubione)
    if etapy:
        sekcja(T('Od rekrutacji do obrony', 'From admission to defence') if dr else T('Jak wyglądają studia', 'How the studies work'))
        sciezki = [('I', T('Studia I stopnia (licencjackie)', "Bachelor's studies")),
                   ('II', T('Studia II stopnia (magisterskie)', "Master's studies")),
                   ('III', T('Kształcenie w szkole doktorskiej', 'Doctoral training'))]
        for st, h in sciezki:
            lista = [e for e in etapy if e.get('stopien') == st]
            if not lista:
                continue
            if not dr:
                out.append(f'### {h}\n')
            pozycje = []
            for i, e in enumerate(lista, 1):
                pierwsza = f"**{linia(w(e, 'kiedy'))}: {linia(w(e, 'tytul'))}**"
                if e.get('opis'):
                    pierwsza += ' — ' + linia(w(e, 'opis'))
                reszta = []
                if e.get('termin'):
                    reszta.append(f"{T('Termin', 'Deadline')}: {linia(w(e, 'termin'))}")
                if e.get('formularz') and not e.get('formularz_adres'):
                    reszta.append(f"{T('Formularz', 'Form')}: {linia(w(e, 'formularz'))}")
                if e.get('formularz') and e.get('formularz_adres'):
                    reszta.append(link(w(e, 'formularz'), e['formularz_adres']))
                pozycje.append(punkt(f'{i}. ', [pierwsza] + reszta))
            out.append('\n'.join(pozycje) + '\n')
        if d['_id'] == 'matematyka':  # dawniej wpisane w kod (linkDyplom), teraz zwykłe zdanie edytora
            out.append(T('Szczegóły egzaminów i prac dyplomowych: ', 'Exams and theses in detail: ')
                       + link(T('Egzaminy i dyplom', 'Exams and diploma'), '/studia/egzaminy-i-dyplom') + '.\n')

    # Specjalności → sam nagłówek; kafelki wstawia strona (z plików specjalności; bez specjalności sekcji nie ma)
    if not dr:
        sekcja(T('Specjalności', 'Specialisations'))

    # Terminy → tabela
    if d.get('terminy'):
        sekcja(T('Terminy', 'Deadlines') if dr else T('Terminy i formularze', 'Deadlines and forms'))
        jest_form = any(x.get('formularz') for x in d['terminy'])
        nag = [T('Sprawa', 'What'), T('Kogo dotyczy', 'Who'), T('Termin', 'Deadline')] + ([T('Formularz', 'Form')] if jest_form else [])
        wiersze = ['| ' + ' | '.join(nag) + ' |', '|' + ' --- |' * len(nag)]
        for x in d['terminy']:
            r = [komorka(w(x, 'co')), komorka(w(x, 'kogo')), komorka(w(x, 'termin'))]
            if jest_form:
                f = w(x, 'formularz') or ''
                r.append(link(f, x['formularz_adres']) if f and x.get('formularz_adres') else komorka(f))
            wiersze.append('| ' + ' | '.join(r) + ' |')
        out.append('\n'.join(wiersze) + '\n')
        if not dr:
            out.append(T('Wszystkie formularze i zasady rejestracji: ', 'All forms and registration rules: ')
                       + link(T('Zajęcia i konsultacje', 'Classes and office hours'), '/studia/zajecia') + '.\n')

    # Program → ### w tej sekcji to zakładki (bez wyboru roku — decyzja 7.11)
    if d.get('programy'):
        sekcja(T('Program kształcenia', 'Programme') if dr else T('Program studiów', 'Curriculum'))
        for p in d['programy']:
            if len(d['programy']) > 1:
                out.append(f"### {linia(w(p, 'nazwa'))}\n")
            if p.get('dotyczy'):
                out.append(linia(w(p, 'dotyczy')) + '\n')
            pozycje = ['- ' + link(w(x, 'nazwa'), plik(x)) + (' — ' + linia(w(x, 'opis')) if x.get('opis') else '')
                       for x in p.get('dokumenty') or []]
            if pozycje:
                out.append('\n'.join(pozycje) + '\n')

    # Praktyki
    if d.get('praktyki'):
        sekcja(T('Praktyki pedagogiczne', 'Teaching placements'))
        out.append(str(w(d, 'praktyki')).strip() + '\n')
        if d.get('praktyki_dokumenty'):
            out.append('\n'.join('- ' + link(w(x, 'nazwa'), plik(x)) for x in d['praktyki_dokumenty']) + '\n')

    # Po studiach
    if d.get('kariera'):
        sekcja(T('Po studiach', 'After graduation'))
        out.append(str(w(d, 'kariera')).strip() + '\n')

    # Pytania → ### pytanie zakończone „?”
    if d.get('faq'):
        sekcja(T('Najczęstsze pytania', 'Frequently asked questions') if dr else T('Pytania i odpowiedzi', 'FAQ'))
        for f in d['faq']:
            out.append(f"### {linia(w(f, 'pytanie'))}\n")
            out.append(str(w(f, 'odpowiedz') or '').strip() + '\n')

    # Kontakt → *rola*, **osoba**, pary
    if d.get('kontakt'):
        sekcja(T('Kontakt', 'Contact'))
        pozycje = []
        for k in d['kontakt']:
            osoba = linia(k.get('osoba'))
            linie = [f"*{linia(w(k, 'rola'))}*", f'**{tytuly_en(osoba) if en else osoba}**']
            if k.get('email'):
                linie.append(f"e-mail: [{k['email']}](mailto:{k['email']})")
            if k.get('telefon'):
                linie.append(f"{T('tel.', 'phone')}: {k['telefon']}")
            if k.get('pokoj'):
                linie.append(f"{T('pokój', 'room')}: {k['pokoj']}")
            pozycje.append(punkt('- ', linie))
        out.append('\n'.join(pozycje) + '\n')

    # Akty prawne → lista linków (pliki)
    if d.get('akty'):
        sekcja(T('Akty prawne i regulaminy', 'Regulations') if dr else T('Akty prawne', 'Regulations'))
        out.append('\n'.join('- ' + link(w(x, 'nazwa'), plik(x)) for x in d['akty']) + '\n')

    return '\n'.join(out).rstrip() + '\n'


def napis(v):
    return v.isoformat() if isinstance(v, (datetime.date, datetime.datetime)) else str(v)


def przypomnienia(d):
    """Terminy z „Przypomnieniem”: sprawa, podpis („kogo · formularz X”, jak dawny podtytuł wydarzenia), data, UID."""
    out = []
    for i, t in enumerate(d.get('terminy') or []):
        if not t.get('przypomnienie') or not t.get('data'):
            continue
        form_pl = f"formularz {t['formularz']}" if t.get('formularz') else ''
        form_en = (t.get('formularz_en') or f"form {t['formularz']}") if t.get('formularz') else ''
        p = {'sprawa': t['co'], 'sprawa_en': t.get('co_en') or None,
             'podpis': ' · '.join(x for x in (t.get('kogo') or '', form_pl) if x) or None,
             'podpis_en': ' · '.join(x for x in (t.get('kogo_en') or t.get('kogo') or '', form_en) if x) or None,
             'data': napis(t['data'])[:10], 'co_roku': bool(t.get('co_roku', True)), 'dni_przed': t.get('dni_przed', 14),
             'adres': f"/studia/{d['_id']}#terminy", 'uid': f"termin-{d['_id']}-{i}"}
        out.append({k: v for k, v in p.items() if v is not None})
    return out


def pozycja_listy(d):
    """Pozycja listy menu „Studia” i kafelków: wartości z dawnych pól menu_* i kafelek_* (puste pomijamy)."""
    p = {'adres': f"/studia/{d['_id']}",
         'nazwa': d.get('menu_etykieta') or d.get('nazwa'), 'nazwa_en': d.get('menu_etykieta_en') or d.get('nazwa_en'),
         'poziom': d.get('kafelek_poziom'), 'poziom_en': d.get('kafelek_poziom_en'),
         'opis': d.get('kafelek_opis'), 'opis_en': d.get('kafelek_opis_en'),
         'opis_menu': d.get('menu_opis'), 'opis_menu_en': d.get('menu_opis_en')}
    if d.get('w_menu') is False:
        p['w_menu'] = False
    if d.get('na_stronie_glownej') is False:
        p['na_stronie_glownej'] = False
    return {k: v for k, v in p.items() if v not in (None, '')}


# Pola, których wartości nie przenosimy (albo przenosimy w innej postaci) — z powodem do statystyki i raportu.
def powod(sciezka, wartosc, d):
    klucz = sciezka.split('.')[-1].split('[')[0]
    if klucz == 'kolejnosc':
        return 'kolejność = miejsce na liście w Ustawieniach'
    if klucz == 'opublikowany' and wartosc is True:
        return 'domyślnie opublikowany'
    if klucz == 'ikona':
        return 'ikona kafelka „Dlaczego warto” nie była wyświetlana'
    if klucz in ('od_roku', 'do_roku'):
        return 'lata programu służyły tylko liście wyboru roku (usunięta)'
    if re.match(r'programy\[0\]\.nazwa(_en)?$', sciezka) and len(d.get('programy') or []) == 1:
        return 'nazwa jedynego programu nie była wyświetlana (zakładki tylko przy kilku programach)'
    if klucz == 'stopien':
        return 'stopień etapu = podsekcja ### „Studia I/II stopnia” (szkoła doktorska: jedna oś)'
    if klucz in ('przypomnienie', 'co_roku', 'dni_przed', 'data'):
        return 'przypomnienie: przypomnienia.json'
    if sciezka.startswith('przyciski') and not doktorat(d):
        return 'przyciski nie były wyświetlane na stronie kierunku (tylko szkoła doktorska)'
    return None


def liscie(o, sciezka=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from liscie(v, f'{sciezka}.{k}' if sciezka else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from liscie(v, f'{sciezka}[{i}]')
    elif o not in (None, ''):
        yield sciezka, o


def sprawdz(d, teksty):
    """Każda wartość starego pliku: w nowych plikach (tekst) albo pominięta z powodem. Zwraca (przeniesione, pominięte)."""
    calosc = re.sub(r'\s+', ' ', '\n'.join(teksty)).replace('\\|', '|')
    przeniesione, pominiete = 0, []
    for sciezka, v in liscie({k: v for k, v in d.items() if k != '_id'}):
        p = powod(sciezka, v, d)
        if p:
            pominiete.append((sciezka, v, p))
        elif isinstance(v, bool) or linia(napis(v)) in calosc:
            przeniesione += 1
        else:
            pominiete.append((sciezka, v, 'BRAK W NOWYCH PLIKACH'))
    return przeniesione, pominiete


def zapisz(sciezka, tekst):
    sciezka.parent.mkdir(parents=True, exist_ok=True)
    sciezka.write_text(tekst, encoding='utf-8', newline='\n')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--studia', required=True, type=Path)
    ap.add_argument('--ustawienia', required=True, type=Path)
    ap.add_argument('--do', type=Path, help='zapis do osobnego katalogu zamiast w klonach')
    a = ap.parse_args()
    cel_s = a.do / 'Web-Studia' if a.do else a.studia
    cel_u = a.do / 'Web-Ustawienia' if a.do else a.ustawienia

    pliki = sorted((a.studia / 'src/content/kierunki').glob('*.md'))
    stare = []
    for p in pliki:
        d, body = czytaj(p)
        if not any(k in d for k in STARE_POLA):
            raise SystemExit(f'{p.name}: plik już przerobiony (brak dawnych pól) — nie uruchamiam migracji drugi raz.')
        d['_id'] = p.stem
        stare.append((d, body))
    stare.sort(key=lambda x: (x[0].get('kolejnosc', 999), x[0]['nazwa']))

    wszystkie_przyp, lista, bledy = [], [], 0
    for d, body in stare:
        pl, en = tresc(d, False, body), tresc(d, True, body)
        front = {'nazwa': d['nazwa'], 'nazwa_en': d.get('nazwa_en'), 'tresc_en': en}
        if d.get('opublikowany') is False:
            front['opublikowany'] = False
        zapisz(cel_s / 'src/content/kierunki' / f"{d['_id']}.md",
               '---\n' + yaml.safe_dump(front, allow_unicode=True, sort_keys=False, width=10**6) + '---\n\n' + pl)

        baner = {k: d[k] for k in ('podtytul', 'podtytul_en', 'opis', 'opis_en', 'haslo', 'haslo_en') if d.get(k)}
        baner['liczby'] = [{k: napis(v) for k, v in f.items() if v not in (None, '')} for f in d.get('fakty') or []]
        tekst_baneru = json.dumps(baner, ensure_ascii=False, indent=2) + '\n'
        zapisz(cel_s / 'src/content/kierunki-baner' / f"{d['_id']}.json", tekst_baneru)

        przyp = przypomnienia(d)
        wszystkie_przyp += przyp
        poz = pozycja_listy(d)
        lista.append(poz)

        przeniesione, pominiete = sprawdz(d, [pl, en, tekst_baneru, json.dumps(przyp, ensure_ascii=False), json.dumps(poz, ensure_ascii=False), d['nazwa'], d.get('nazwa_en') or ''])
        bledy += sum(1 for *_, p in pominiete if p == 'BRAK W NOWYCH PLIKACH')
        n = lambda wzor: len(re.findall(wzor, pl, re.M))
        sekcje, punkty, pytania = n(r'^## '), n(r'^(?:-|\d+\.) '), n(r'^### .*\?$')
        wiersze = n(r'^\| ') - 2 * n(r'^\|(?: --- \|)+$')
        print(f"{d['_id']}: {przeniesione} wartości przeniesionych, {len(pominiete)} pominiętych; sekcje {sekcje}, "
              f"punkty list {punkty}, wiersze tabel {wiersze}, pytania {pytania}, przypomnienia {len(przyp)}")
        powody = {}
        for sciezka, v, p in pominiete:
            powody.setdefault(p, []).append(sciezka)
        for p, sciezki in powody.items():
            print(f'  pominięte ({len(sciezki)}): {p} — ' + ', '.join(sciezki[:6]) + (' …' if len(sciezki) > 6 else ''))

    zapisz(cel_s / 'src/data/przypomnienia.json', json.dumps({'przypomnienia': wszystkie_przyp}, ensure_ascii=False, indent=2) + '\n')

    # Ustawienia: lista kierunków, potem dawne „Dodatkowe kafelki” (np. studia podyplomowe) — w kafelkach jak dotąd, poza menu.
    sciezka_u = a.ustawienia / 'src/data/ustawienia.json'
    tekst_u = sciezka_u.read_text(encoding='utf-8')
    u = json.loads(tekst_u)
    studia = u.setdefault('studia', {})
    dodatkowe = [k for k in studia.get('kierunki') or [] if k.get('adres') not in {p['adres'] for p in lista}]
    if any('w_menu' in k for k in dodatkowe):
        raise SystemExit('ustawienia.json: lista studia.kierunki już przerobiona — nie uruchamiam migracji drugi raz.')
    studia['kierunki'] = lista + [{**k, 'w_menu': False} for k in dodatkowe]
    wciecie = len(re.match(r'\{\n( *)', tekst_u).group(1)) if re.match(r'\{\n( *)', tekst_u) else 2
    zapisz(cel_u / 'src/data/ustawienia.json', json.dumps(u, ensure_ascii='\\u0' in tekst_u, indent=wciecie) + ('\n' if tekst_u.endswith('\n') else ''))

    print(f'Lista menu i kafelków: {len(lista)} kierunków + {len(dodatkowe)} dodatkowe kafelki; przypomnienia: {len(wszystkie_przyp)}.')
    if bledy:
        raise SystemExit(f'{bledy} wartości nie ma w nowych plikach (BRAK W NOWYCH PLIKACH) — popraw skrypt.')


if __name__ == '__main__':
    main()
