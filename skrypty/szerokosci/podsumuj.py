"""Raport pomiaru szerokości (zlecenie 27, punkt 7): wyniki.json z pomiar.cjs → raport.md.

Raport: macierz strona × okno (K/R/O/W/X) osobno dla wersji polskiej i angielskiej, tabela „na których stronach i od jakiej
szerokości pole »Na tej stronie« się zwija albo treść przechodzi na widok telefonu” (atrybuty .z-pd ze zlecenia 25), lista
problemów ze stanami (ciekawostki, menu, kafelki) i porównanie ze wzorcem.

Kod wyjścia 1, gdy jest kolizja (K) albo poziome przewijanie (X), których nie ma we wzorcu (skrypty/szerokosci/wzorzec.json),
albo gdy więcej niż 10% renderów skończyło się błędem. R, O i W tylko w raporcie.

Użycie:
  python3 skrypty/szerokosci/podsumuj.py <katalog wyników>                    # raport + ocena
  python3 skrypty/szerokosci/podsumuj.py <katalog wyników> --zapisz-wzorzec   # bieżące K i X stają się wzorcem (zaakceptowane)
W GitHub Actions raport trafia też do podsumowania przebiegu (GITHUB_STEP_SUMMARY).
"""
import json
import os
import sys
from collections import defaultdict

KAT_SKRYPTU = os.path.dirname(os.path.abspath(__file__))
WZORZEC = os.path.join(KAT_SKRYPTU, 'wzorzec.json')
SKROT = {'kolizja': 'K', 'poza-ramka': 'R', 'obciety': 'O', 'poza-oknem': 'W'}
TELEFON_DO = 1023  # okna węższe to widok telefonu (układ podstrony bez pola z prawej)


def wczytaj(kat):
    with open(os.path.join(kat, 'wyniki.json'), encoding='utf-8') as f:
        return json.load(f)


def zbierz(dane):
    """strona -> okno -> {problemy: {(typ, tekst): problem}, przewX, blad, adres, uklad, ck}"""
    tab = defaultdict(dict)
    meta = {}
    for z in dane['wyniki']:
        s, o = z['strona'], z['okno']
        meta[s] = {'adres': z['adres'], 'grupa': z['grupa'], 'jezyk': z.get('jezyk', 'pl')}
        w = {'problemy': {}, 'przewX': 0, 'blad': z.get('blad'), 'uklad': None, 'ck': z.get('ciekawostki', 0)}
        for stan, d in z.get('stany', {}).items():
            w['przewX'] = max(w['przewX'], d.get('przewijanieX', 0))
            if stan == 'start':
                w['uklad'] = d.get('uklad')
            for p in d['problemy']:
                k = (p['typ'], p['tekst'])
                if k not in w['problemy']:
                    w['problemy'][k] = {**p, 'stany': [stan]}
                elif stan not in w['problemy'][k]['stany']:
                    w['problemy'][k]['stany'].append(stan)
        tab[s][o] = w
    return tab, meta


def komorka(w):
    if w is None:
        return '—'
    if w.get('blad'):
        return 'BŁĄD'
    c = defaultdict(int)
    for (typ, _), _p in w['problemy'].items():
        c[SKROT[typ]] += 1
    t = ''.join(f'{k}{c[k]}' for k in 'KROW' if c[k])
    if w['przewX'] > 1:
        t += f' X{w["przewX"]}'
    return t.strip() or 'ok'


def macierz(tab, strony, okna):
    wiersze = ['| strona | ' + ' | '.join(okna) + ' |', '|' + '---|' * (len(okna) + 1)]
    for s in strony:
        wiersze.append(f'| {s} | ' + ' | '.join(komorka(tab[s].get(o)) for o in okna) + ' |')
    return '\n'.join(wiersze)


def szer(o):
    return int(o.split('x')[0])


def uklady(tab, meta, strony, okna):
    """Strony z szablonem podstrony: w których oknach komputera pole zwinięte / treść w widoku telefonu."""
    okna_k = [o for o in okna if szer(o) > TELEFON_DO]
    wiersze = []
    for s in strony:
        u = {o: (tab[s].get(o) or {}).get('uklad') for o in okna_k}
        if not any(v is not None for v in u.values()):
            continue
        zw = [o for o in okna_k if u[o] and u[o].get('pole') == 'zwiniete']
        tel = [o for o in okna_k if u[o] and u[o].get('tresc') == 'telefon']
        if not zw and not tel:
            continue
        pelne = [o for o in okna_k if u[o] is not None and o not in zw and o not in tel]
        od = min(pelne, key=szer) if pelne else '—'
        wiersze.append(f'| {s} | {", ".join(zw) or "—"} | {", ".join(tel) or "—"} | {od} |')
    if not wiersze:
        return 'Na żadnej stronie pole „Na tej stronie” się nie zwija i treść nie przechodzi na widok telefonu (okna od 1024 px).'
    return ('| strona | pole zwinięte nad treścią | treść w widoku telefonu | pierwsze okno z pełnym układem |\n|---|---|---|---|\n'
            + '\n'.join(wiersze))


def lista(tab, meta, strony, okna):
    out = []
    for s in strony:
        zebrane = defaultdict(list)
        for o in okna:
            w = tab[s].get(o)
            if not w:
                continue
            for (typ, tekst), p in w['problemy'].items():
                zebrane[(typ, tekst, p['el'][-70:], (p.get('ramka') or p.get('el2') or '')[-70:])].append((o, p['px'], p['stany']))
        przew = [(o, tab[s][o]['przewX']) for o in okna if tab[s].get(o) and tab[s][o]['przewX'] > 1]
        bledy = [(o, tab[s][o]['blad']) for o in okna if tab[s].get(o) and tab[s][o].get('blad')]
        if not zebrane and not przew and not bledy:
            continue
        out.append(f'\n### {s}  ({meta[s]["adres"]})')
        for (typ, tekst, el, el2), ok in sorted(zebrane.items(), key=lambda x: (x[0][0], -len(x[1]))):
            def st(stany):
                pokaz = [x for x in stany if x != 'start']
                return (' ' + ','.join(pokaz[:3]) + ('…' if len(pokaz) > 3 else '')) if pokaz else ''
            okna_t = ', '.join(f'{o}({px}px{st(stany)})' for o, px, stany in ok)
            out.append(f'- **{typ}** „{tekst}” — `{el}`' + (f' ⟷ `{el2}`' if el2 else '') + f'\n  okna: {okna_t}')
        for o, px in przew:
            out.append(f'- **przewijanie w poziomie** {o}: {px} px')
        for o, b in bledy:
            out.append(f'- **błąd** {o}: {b}')
    return '\n'.join(out) if out else '\nBrak wykrytych problemów.'


def klucze_kx(tab):
    """Kolizje i poziome przewijanie jako klucze do porównania ze wzorcem."""
    k = set()
    for s, okna in tab.items():
        for o, w in okna.items():
            for (typ, tekst), _p in w['problemy'].items():
                if typ == 'kolizja':
                    k.add(f'K|{s}|{o}|{tekst}')
            if w['przewX'] > 1:
                k.add(f'X|{s}|{o}')
    return k


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')  # konsola Windows (cp1250)
    except (AttributeError, ValueError):
        pass
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    kat = sys.argv[1]
    dane = wczytaj(kat)
    okna = dane['okna']
    tab, meta = zbierz(dane)
    kx = klucze_kx(tab)

    if '--zapisz-wzorzec' in sys.argv:
        with open(WZORZEC, 'w', encoding='utf-8') as f:
            json.dump({'opis': 'Zaakceptowane kolizje (K) i poziome przewijanie (X) pomiaru szerokości; nowe poza tą listą kończą przebieg błędem.',
                       'klucze': sorted(kx)}, f, ensure_ascii=False, indent=1)
            f.write('\n')
        print(f'Wzorzec zapisany: {len(kx)} kluczy → {WZORZEC}')

    wzorzec = set()
    if os.path.exists(WZORZEC):
        with open(WZORZEC, encoding='utf-8') as f:
            wzorzec = set(json.load(f).get('klucze', []))
    nowe = sorted(kx - wzorzec)
    znikniete = sorted(wzorzec - kx)
    renderow = len(dane['wyniki'])
    bledow = sum(1 for z in dane['wyniki'] if z.get('blad'))
    ck = sum(z.get('ciekawostki', 0) for z in dane['wyniki'])

    pl = sorted(s for s in tab if meta[s]['jezyk'] == 'pl')
    en = sorted(s for s in tab if meta[s]['jezyk'] == 'en')
    legenda = ('Legenda komórek: K — kolizje tekstu, R — tekst poza ramką (kafelek, pole, przycisk), O — tekst obcięty przez overflow, '
               'W — tekst poza oknem, X — poziome przewijanie strony (px), ok — nic nie wykryto, — — brak pomiaru. Liczby to różne problemy '
               'łącznie ze stanami: rozwinięte kafelki działów, drugi ekran strony głównej, otwarte menu i każda ciekawostka patrona z puli działu.')
    tekst = [
        '# Pomiar szerokości',
        '',
        f'{renderow} renderów ({len(pl)} stron po polsku, {len(en)} po angielsku, {len(okna)} okien), {ck} podmian ciekawostek, '
        f'{bledow} błędów, czas {dane.get("czas", "?")} s.' + (f' Nie znaleziono stron: {", ".join(dane["braki"])}.' if dane.get('braki') else ''),
        '',
        f'**Ocena: {"BŁĄD — nowe kolizje albo poziome przewijanie" if nowe else "bez nowych kolizji i poziomego przewijania"}**'
        + (f' ({len(nowe)}).' if nowe else '.'),
    ]
    if nowe:
        tekst += ['', '## Nowe K i X (poza wzorcem)', ''] + [f'- `{k}`' for k in nowe]
    if znikniete:
        tekst += ['', '## Ze wzorca już nie występują', '', 'Można je usunąć z `skrypty/szerokosci/wzorzec.json` (`--zapisz-wzorzec`).', ''] + [f'- `{k}`' for k in znikniete]
    tekst += [
        '', legenda,
        '', '## Wersja polska', '', macierz(tab, pl, okna),
        '', '## Wersja angielska', '', macierz(tab, en, okna),
        '', '## Pole „Na tej stronie” i widok telefonu dla treści (zlecenie 25)', '',
        'Okna od 1024 px (węższe to układ telefonu). Strony, na których w którymś oknie pole jest zwinięte nad treścią '
        '(`data-pole="zwiniete"`) albo treść przechodzi na widok telefonu (`data-tresc="telefon"`).', '',
        uklady(tab, meta, pl + en, okna),
        '', '## Szczegóły', lista(tab, meta, pl + en, okna), '',
    ]
    raport = '\n'.join(tekst)
    with open(os.path.join(kat, 'raport.md'), 'w', encoding='utf-8') as f:
        f.write(raport)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as f:
            f.write(raport[:900_000] + '\n')
    print('\n'.join(tekst[:5]))
    for k in nowe:
        print(f'::error title=Pomiar szerokości::nowe {k}')
    if nowe or (renderow and bledow / renderow > 0.1):
        sys.exit(1)


if __name__ == '__main__':
    main()
