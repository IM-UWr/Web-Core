#!/usr/bin/env python3
"""Migracja tekstów działów z Web-Ustawienia na strony w repozytoriach działów (zlecenie 30; wzór: popularyzacja.py).

Przerabia src/data/dzialy/{instytut,nauka,studia}.json z klonu Web-Ustawienia (formularze „Strona działu …”) na:
  • strony działów — src/data/<dział>.md (formularz „Strona działu …” w Web-Instytut, Web-Nauka, Web-Studia):
    Treść (body) = dawny tekst „O Instytucie” / „Badania w Instytucie” / „O studiach” (akapity oddzielone pustą linią,
    czyli już Markdown); u Instytutu zdanie nad sukcesami pod nagłówkiem „Ostatnie sukcesy” (kotwica, src/plugins/kotwice.mjs);
    Treść EN (tresc_en) — to samo po angielsku; w nagłówku pliku tytuł (dotąd wpisany w kod) i drobne pola bez zmian:
    wstep, haslo, „W skrócie” (…_fakty), kontakt_godziny, sekretariat_zakres (ukryte w formularzu);
  • teksty stron z listą — wpisy kolekcji „Strony” pod adresem strony (src/content/strony/<adres>.md): tytuł i opis
    (dotąd wpisane w kod; odczyt z src/lib/tekstyStron.ts, STRONY_Z_LISTA), hasło, Treść = tekst wprowadzający;
    haslo_podstron — hasło stron pojedynczych wpisów (rocznik publikacji, obrona).
  • Publikacje: tekst o czasopismach pod nagłówkiem „Czasopisma redagowane w Instytucie” (EN: nagłówek jak dotąd na stronie),
    opis pod tytułem i nagłówki czasopism przenoszone z src/data/publikacje.json (pola wstep, czasopisma_naglowek i EN znikają).
Puste pole EN = jak dotąd: strona angielska pokaże tekst polski (wspólny tekst EN składa się z części EN, a brakująca część
bierze tekst polski — jak dawne wybierz()).
Na końcu sprawdza, że każda wartość starych plików jest w nowych (słowo w słowo), i usuwa src/data/dzialy/*.json.
Skrypt odmawia pracy, gdy migracja już była (brak src/data/dzialy/ w Web-Ustawienia albo istnieje któryś nowy plik).

Uruchomienie (PyYAML):
  python skrypty/migracja/dzialy.py --tresci <katalog z klonami Web-*> [--do <katalog>]
--do: zapis nowych plików do <katalog>/<Repo>/… zamiast w klonach — na próbę (stare pliki zostają).
"""
import argparse
import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


class Zrzut(yaml.SafeDumper):
    """Tekst wielolinijkowy jako blok „|” — czytelny w GitHubie; PyYAML sam wraca do cudzysłowu, gdy blok nie pasuje."""


Zrzut.add_representer(str, lambda dumper, s: dumper.represent_scalar('tag:yaml.org,2002:str', s, style='|' if '\n' in s else None))


def liscie(o, sciezka=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from liscie(v, f'{sciezka}.{k}' if sciezka else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from liscie(v, f'{sciezka}[{i}]')
    elif o not in (None, ''):
        yield sciezka, o


def domyslne_z_kodu():
    """STRONY_Z_LISTA z src/lib/tekstyStron.ts: {adres: {pole: (pl, en)}} — tytuły, opisy i hasła wpisane dotąd w kod."""
    src = (ROOT / 'src/lib/tekstyStron.ts').read_text(encoding='utf-8')
    blok = re.search(r'export const STRONY_Z_LISTA[^=]*= \{\n(.*?)\n\};', src, re.S).group(1)
    s = r"""('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")"""
    wynik = {}
    for m in re.finditer(r"^  '?([\w/-]+)'?: \{\n(.*?)\n  \},", blok, re.S | re.M):
        pola = {}
        for p in re.finditer(r'(\w+): p\(\s*' + s + r',\s*' + s + r',?\s*\)', m.group(2), re.S):
            pola[p.group(1)] = tuple(x[1:-1].replace("\\'", "'") for x in (p.group(2), p.group(3)))
        wynik[m.group(1)] = pola
    return wynik


def pl_en(d, k):
    return (d.get(k) or '').strip(), (d.get(f'{k}_en') or '').strip()


def tekst(czesci):
    """Treść i Treść EN z części (nagłówek ## PL, nagłówek ## EN, tekst PL, tekst EN); część bez tekstu pomijana."""
    pl, en, jest_en = [], [], False
    for nag_pl, nag_en, t_pl, t_en in czesci:
        if not (t_pl or t_en):
            continue
        jest_en |= bool(t_en)
        pl.append((f'## {nag_pl}\n\n' if nag_pl else '') + t_pl)
        en.append((f'## {nag_en}\n\n' if nag_en else '') + (t_en or t_pl))
    return '\n\n'.join(pl), ('\n\n'.join(en) if jest_en else '')


def plik_md(front, body):
    front = {k: v for k, v in front.items() if v not in (None, '', [])}
    return '---\n' + yaml.dump(front, Dumper=Zrzut, allow_unicode=True, sort_keys=False, width=10**6) + '---\n' + (f'\n{body}\n' if body else '')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--tresci', required=True, type=Path, help='katalog z klonami repozytoriów Web-*')
    ap.add_argument('--do', type=Path, help='zapis do osobnego katalogu zamiast w klonach')
    a = ap.parse_args()
    T = a.tresci
    kat_dzialow = T / 'Web-Ustawienia/src/data/dzialy'
    if not kat_dzialow.is_dir():
        raise SystemExit('Web-Ustawienia: brak src/data/dzialy/ — migracja już była, nie uruchamiam drugi raz.')
    J = {n: json.loads((kat_dzialow / f'{n}.json').read_text(encoding='utf-8')) for n in ('instytut', 'nauka', 'studia')}
    p_pub = T / 'Web-Nauka/src/data/publikacje.json'
    pub_txt = p_pub.read_text(encoding='utf-8')
    pub = json.loads(pub_txt)
    if json.dumps(pub, ensure_ascii=False, indent=2) + '\n' != pub_txt:
        raise SystemExit('publikacje.json: zapis nie odtworzy pliku 1:1 (inne wcięcia?) — popraw skrypt.')
    DOM = domyslne_z_kodu()
    if len(DOM) != 11:
        raise SystemExit(f'src/lib/tekstyStron.ts: odczytano {len(DOM)} stron z listą zamiast 11 — popraw wyrażenie w skrypcie.')

    nowe = {}  # (repo, ścieżka) -> tekst pliku
    zuzyte = {'instytut': set(), 'nauka': set(), 'studia': set()}  # pola starych plików przeniesione (do kontroli)

    def wez(dz, *pola):
        for k in pola:
            for kk in (k, f'{k}_en'):
                if kk in J[dz]:
                    zuzyte[dz].add(kk)
        return [J[dz].get(k) for k in pola]

    # ---- strony działów ----
    ins = J['instytut']
    wez('instytut', 'o_instytucie', 'sukcesy_opis', 'wstep', 'haslo', 'o_instytucie_fakty', 'kontakt_godziny')
    body, en = tekst([('', '', *pl_en(ins, 'o_instytucie')), ('Ostatnie sukcesy', 'Recent achievements', *pl_en(ins, 'sukcesy_opis'))])
    nowe[('Web-Instytut', 'src/data/instytut.md')] = plik_md({
        'tytul': 'Instytut', 'tytul_en': 'Institute', 'tresc_en': en,
        'wstep': ins.get('wstep'), 'wstep_en': ins.get('wstep_en'), 'haslo': ins.get('haslo'), 'haslo_en': ins.get('haslo_en'),
        'o_instytucie_fakty': ins.get('o_instytucie_fakty'), 'kontakt_godziny': ins.get('kontakt_godziny'), 'kontakt_godziny_en': ins.get('kontakt_godziny_en'),
    }, body)
    nau = J['nauka']
    wez('nauka', 'badania_tekst', 'wstep', 'haslo', 'badania_fakty')
    body, en = tekst([('', '', *pl_en(nau, 'badania_tekst'))])
    nowe[('Web-Nauka', 'src/data/nauka.md')] = plik_md({
        'tytul': 'Nauka', 'tytul_en': 'Research', 'tresc_en': en,
        'wstep': nau.get('wstep'), 'wstep_en': nau.get('wstep_en'), 'haslo': nau.get('haslo'), 'haslo_en': nau.get('haslo_en'),
        'badania_fakty': nau.get('badania_fakty'),
    }, body)
    stu = J['studia']
    wez('studia', 'o_studiach', 'wstep', 'haslo', 'o_studiach_fakty', 'sekretariat_zakres')
    body, en = tekst([('', '', *pl_en(stu, 'o_studiach'))])
    nowe[('Web-Studia', 'src/data/studia.md')] = plik_md({
        'tytul': 'Studia', 'tytul_en': 'Study', 'tresc_en': en,
        'wstep': stu.get('wstep'), 'wstep_en': stu.get('wstep_en'), 'haslo': stu.get('haslo'), 'haslo_en': stu.get('haslo_en'),
        'o_studiach_fakty': stu.get('o_studiach_fakty'), 'sekretariat_zakres': stu.get('sekretariat_zakres'), 'sekretariat_zakres_en': stu.get('sekretariat_zakres_en'),
    }, body)

    # ---- strony z listą: (adres, repozytorium, dział-źródło, pole hasła, pole tekstu, pole hasła podstron) ----
    LISTY = [
        ('instytut/struktura', 'Web-Instytut', 'instytut', 'struktura_haslo', 'struktura_tekst', None),
        ('warto-wiedziec', 'Web-Instytut', 'instytut', 'warto_wiedziec_haslo', None, None),
        ('pracownicy', 'Web-Pracownicy', 'instytut', 'pracownicy_haslo', None, None),
        ('seminaria', 'Web-Nauka', 'nauka', 'seminaria_haslo', 'seminaria_tekst', None),
        ('nauka/konferencje', 'Web-Nauka', 'nauka', 'konferencje_haslo', 'konferencje_tekst', None),
        ('nauka/granty', 'Web-Nauka', 'nauka', 'granty_haslo', 'granty_tekst', None),
        ('nauka/sukcesy', 'Web-Nauka', 'nauka', 'sukcesy_haslo', 'sukcesy_tekst', None),
        ('nauka/publikacje', 'Web-Nauka', 'nauka', 'publikacje_haslo', 'publikacje_tekst', 'rocznik_haslo'),
        ('obrony-doktorskie', 'Web-Aktualnosci', 'nauka', 'obrony_haslo', 'obrony_tekst', 'obrona_haslo'),
        ('aktualnosci', 'Web-Aktualnosci', None, None, None, None),
        ('studia/plan-zajec', 'Web-Studia', 'studia', 'plan_haslo', None, None),
    ]
    if sorted(x[0] for x in LISTY) != sorted(DOM):
        raise SystemExit(f'Lista stron w skrypcie różni się od STRONY_Z_LISTA: {sorted(DOM)}')
    for adres, repo, dz, k_haslo, k_tekst, k_podstron in LISTY:
        dom = DOM[adres]
        d = J[dz] if dz else {}
        if dz:
            wez(dz, *[k for k in (k_haslo, k_tekst, k_podstron) if k])
        haslo = pl_en(d, k_haslo) if k_haslo else dom.get('haslo', ('', ''))
        podstron = pl_en(d, k_podstron) if k_podstron else dom.get('haslo_podstron', ('', ''))
        opis = dom['opis']
        czesci = [('', '', *pl_en(d, k_tekst))] if k_tekst else []
        if adres == 'nauka/publikacje':
            opis = pl_en(pub, 'wstep')
            nag = pl_en(pub, 'czasopisma_naglowek')
            wez('nauka', 'czasopisma_tekst')
            czasopisma_pl, czasopisma_en = pl_en(d, 'czasopisma_tekst')
            czesci.append((nag[0] or 'Czasopisma redagowane w Instytucie', nag[1] or 'Journals edited at the Institute', czasopisma_pl, czasopisma_en))
        body, en = tekst(czesci)
        nowe[(repo, f'src/content/strony/{adres}.md')] = plik_md({
            'tytul': dom['tytul'][0], 'tytul_en': dom['tytul'][1], 'tresc_en': en,
            'opis': opis[0], 'opis_en': opis[1], 'haslo': haslo[0], 'haslo_en': haslo[1],
            'haslo_podstron': podstron[0], 'haslo_podstron_en': podstron[1],
        }, body)

    # ---- kontrola: każde pole starych plików przeniesione, każda wartość jest w nowych plikach ----
    for dz, d in J.items():
        reszta = sorted(set(d) - zuzyte[dz])
        if reszta:
            raise SystemExit(f'{dz}.json: pola spoza listy migracji: {reszta} — dopisz je do skryptu.')
    przeniesione_pub = {k: pub[k] for k in ('wstep', 'wstep_en', 'czasopisma_naglowek', 'czasopisma_naglowek_en') if k in pub}
    nowe_teksty = []
    for t in nowe.values():
        m = re.match(r'^---\n(.*?)\n---\n?(.*)$', t, re.S)
        nowe_teksty += [str(v) for _, v in liscie(yaml.safe_load(m.group(1)))] + [m.group(2)]
    przeniesione, brak = 0, []
    for nazwa, d in [*J.items(), ('publikacje', przeniesione_pub)]:
        for sciezka, v in liscie(d):
            v = str(v).strip()
            if any(v == x or v in x for x in nowe_teksty):
                przeniesione += 1
            else:
                brak.append(f'{nazwa}.{sciezka}')
    if brak:
        raise SystemExit(f'{len(brak)} wartości nie ma w nowych plikach: {brak} — popraw skrypt (nic nie zapisano).')

    # ---- zapis ----
    for repo, sciezka in nowe:
        if (T / repo / sciezka).exists():
            raise SystemExit(f'{repo}/{sciezka} już istnieje — migracja już była? Nic nie zapisano.')
    for (repo, sciezka), t in nowe.items():
        cel = (a.do / repo if a.do else T / repo) / sciezka
        cel.parent.mkdir(parents=True, exist_ok=True)
        cel.write_text(t, encoding='utf-8', newline='\n')
    if not a.do:
        for k in przeniesione_pub:
            del pub[k]
        p_pub.write_text(json.dumps(pub, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
        for n in J:
            (kat_dzialow / f'{n}.json').unlink()
        kat_dzialow.rmdir()
    print(f'{przeniesione} wartości przeniesionych, 0 pominiętych; {len(nowe)} nowych plików:')
    for (repo, sciezka), t in nowe.items():
        print(f'  {repo}/{sciezka}  ({len(t.splitlines())} linii)')
    print(f'publikacje.json: przeniesione pola {list(przeniesione_pub)}' + ('' if a.do else '; src/data/dzialy/*.json usunięte z Web-Ustawienia.'))


if __name__ == '__main__':
    main()
