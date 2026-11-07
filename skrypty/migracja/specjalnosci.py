#!/usr/bin/env python3
"""Migracja specjalności do jednego Markdownu i osobnego „Baneru i kafelka” (zlecenie 29; wzór: skrypty/migracja/kierunki.py).

Przerabia stare pliki specjalności (src/content/specjalnosci/<id>.md, ok. 75 pól YAML) w klonach Web-Spec-* i Web-Studia na:
  • src/content/specjalnosci/<id>.md          — formularz „Treść”: nazwa, nazwa_en, tresc_en (Markdown EN) i body (Markdown PL);
  • src/content/specjalnosci-baner/<id>.json  — formularz „Baner i kafelek”: kierunek, poziom, zdanie pod nazwą, hasło, skrót,
    zakład, opiekunowie, seminaria, wygaszana, kafelek na stronie kierunku, kolejność (+ wersje EN) i ukryte zrodla, do_uzupelnienia.

Sekcje i nagłówki PL/EN jak dotąd na stronie (Specjalnosc.astro sprzed zlecenia 29): O specjalności (z ramką „Dla kogo”), Przydatne
strony, Dlaczego warto, Jak przebiega specjalność, Czego się uczysz, Co będziesz umieć, Po studiach, Przykładowe tematy prac,
Seminaria, Dokumenty, Pytania i odpowiedzi, Opiekun(owie) specjalności. Sekcje liczone (seminaria, opiekunowie) dostają w treści
sam nagłówek (kotwicę), gdy dziś są na stronie. Wartości EN z tą samą zastępczością co wybierz() w src/lib/i18n.ts (puste _en →
polskie; umiejętności — cała lista). Skrypt odmawia pracy na już przerobionych plikach i na końcu sprawdza, że każda wartość starego
pliku jest w nowych plikach albo jest na liście pominiętych (z powodem).

Uruchomienie (PyYAML):
  python skrypty/migracja/specjalnosci.py --tresci <katalog z klonami Web-*> [--do <katalog>]
--do: zapis do osobnego katalogu (<katalog>/<Repozytorium>/…) zamiast w klonach — na próbę.
"""
import argparse
import json
import re
from pathlib import Path

import yaml

REPOZYTORIA = ('Web-Spec-Analiza-Danych', 'Web-Spec-Aktuarialno-Finansowa', 'Web-Spec-Nauczycielska', 'Web-Spec-Stosowana',
               'Web-Spec-Teoretyczna', 'Web-Studia')
STARE_POLA = ('kierunek', 'kolejnosc', 'opis', 'dlaczego', 'etapy', 'przedmioty', 'wygaszana', 'opiekunowie')
POLA_BANERU = ('kierunek', 'poziom', 'poziom_en', 'opis', 'opis_en', 'haslo', 'haslo_en', 'skrot', 'zaklad', 'opiekunowie',
               'seminaria', 'wygaszana', 'na_stronie_kierunku', 'bez_podstrony', 'kolejnosc', 'kafelek_dla_kogo',
               'kafelek_dla_kogo_en', 'kafelek_kariera', 'kafelek_kariera_en', 'zrodla', 'do_uzupelnienia')

# nagłówki sekcji jak w dawnym szablonie (Specjalnosc.astro, H) i etykieta ramki „Dla kogo”
NAGLOWKI = {
    'o': ('O specjalności', 'About'),
    'dla_kogo': ('Dla kogo', 'Who is it for'),
    'linki': ('Przydatne strony', 'Useful pages'),
    'dlaczego': ('Dlaczego warto', 'Why choose it'),
    'przebieg': ('Jak przebiega specjalność', 'How the specialisation works'),
    'przedmioty': ('Czego się uczysz', 'What you will learn'),
    'umiejetnosci': ('Co będziesz umieć', 'Skills'),
    'kariera': ('Po studiach', 'Careers'),
    'tematy': ('Przykładowe tematy prac', 'Sample thesis topics'),
    'seminaria': ('Seminaria', 'Seminars'),
    'dokumenty': ('Dokumenty', 'Documents'),
    'faq': ('Pytania i odpowiedzi', 'FAQ'),
    'opiekun': ('Opiekun specjalności', 'Coordinator'),
    'opiekunowie': ('Opiekunowie specjalności', 'Coordinators'),
}


def val(o, pole, en):
    """Wartość w języku; po angielsku pusta → polska (jak wybierz() w src/lib/i18n.ts)."""
    if en:
        v = o.get(pole + '_en')
        if v not in (None, ''):
            return v
    return o.get(pole)


def linia(s):
    """Tekst pola w jednej linii (pola „text” bywają wielolinijkowe)."""
    return re.sub(r'\s*\n\s*', ' ', str(s or '')).strip()


def link(nazwa, adres):
    adres = str(adres).strip()
    if re.search(r'[\s()<>]', adres):  # adres ze spacją albo nawiasem — w <…>, żeby Markdown go nie uciął
        adres = f'<{adres}>'
    return f'[{linia(nazwa)}]({adres})'


def plik(x):
    return x.get('wgraj') or x.get('plik')


def cytat(md):
    return '\n'.join(('> ' + l).rstrip() for l in md.strip().split('\n'))


def czytaj(sciezka):
    """Front matter i body; granice front matter to linie „---”."""
    tekst = Path(sciezka).read_text(encoding='utf-8').replace('\r\n', '\n')
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', tekst, re.S)
    if not m:
        raise SystemExit(f'{sciezka}: brak front matter')
    return yaml.safe_load(m.group(1)) or {}, m.group(2)


def tresc(d, en, body_pl):
    """Markdown strony specjalności (PL albo EN) w kolejności sekcji dawnego szablonu."""
    w = lambda o, pole: val(o, pole, en)
    H = lambda k: NAGLOWKI[k][1 if en else 0]
    out = []

    def sekcja(k, tekst=''):
        out.append(f'## {H(k)}\n' + (f'\n{tekst.strip()}\n' if tekst.strip() else ''))

    o = ((d.get('tresc_en') if en else '') or body_pl).strip()
    dla = (w(d, 'dla_kogo') or '').strip()
    if o or dla:
        sekcja('o', '\n\n'.join(x for x in (o, cytat(f"**{H('dla_kogo')}**\n\n{dla}") if dla else '') if x))
    if d.get('linki'):
        sekcja('linki', '\n'.join('- ' + link(w(x, 'etykieta'), x['adres']) for x in d['linki']))
    if d.get('dlaczego'):
        sekcja('dlaczego', '\n'.join(f"- **{linia(w(x, 'tytul'))}** — {linia(w(x, 'opis'))}" for x in d['dlaczego']))
    if d.get('etapy'):
        sekcja('przebieg', '\n'.join(
            f"{i}. **{linia(w(e, 'kiedy'))}: {linia(w(e, 'tytul'))}**" + (f" — {linia(w(e, 'opis'))}" if e.get('opis') else '')
            for i, e in enumerate(d['etapy'], 1)))
    if d.get('przedmioty'):
        grupy = []
        for g in d['przedmioty']:
            pozycje = '\n'.join(f"- **{linia(w(p, 'nazwa'))}**" + (f" — {linia(w(p, 'opis'))}" if p.get('opis') else '') for p in g.get('lista') or [])
            grupy.append(f"### {linia(w(g, 'grupa'))}\n\n{pozycje}".rstrip())
        sekcja('przedmioty', '\n\n'.join(grupy))
    umiejetnosci = (d.get('umiejetnosci_en') if en else None) or d.get('umiejetnosci') or []
    if umiejetnosci:
        sekcja('umiejetnosci', '\n'.join('- ' + linia(x) for x in umiejetnosci))
    if (w(d, 'kariera') or '').strip():
        sekcja('kariera', w(d, 'kariera'))
    if d.get('tematy_prac'):
        sekcja('tematy', '\n'.join('- ' + linia(x['tytul']) + (f" — {linia(w(x, 'opis'))}" if x.get('opis') else '') for x in d['tematy_prac']))
    if d.get('seminaria'):
        sekcja('seminaria')
    if d.get('dokumenty'):
        sekcja('dokumenty', '\n'.join('- ' + link(w(x, 'nazwa'), plik(x)) + (f" — {linia(w(x, 'opis'))}" if x.get('opis') else '') for x in d['dokumenty']))
    if d.get('faq'):
        sekcja('faq', '\n\n'.join(f"### {linia(w(f, 'pytanie'))}\n\n{(w(f, 'odpowiedz') or '').strip()}" for f in d['faq']))
    if d.get('opiekunowie'):
        sekcja('opiekunowie' if len(d['opiekunowie']) > 1 else 'opiekun')
    return '\n'.join(out).rstrip() + '\n' if out else ''


# Pola, których wartości nie przenosimy — z powodem do statystyki i raportu.
def powod(sciezka, wartosc, d):
    klucz = sciezka.split('.')[-1].split('[')[0]
    if klucz == 'opublikowany' and wartosc is True:
        return 'domyślnie opublikowany'
    if klucz == 'ikona':
        return 'ikona kafelka „Dlaczego warto” nie była wyświetlana'
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


def sprawdz(d, body, teksty):
    """Każda wartość starego pliku: w nowych plikach (tekst) albo pominięta z powodem. Zwraca (przeniesione, pominięte)."""
    calosc = re.sub(r'\s+', ' ', '\n'.join(teksty))
    przeniesione, pominiete = 0, []
    for sciezka, v in liscie({**{k: v for k, v in d.items() if k != '_id'}, 'body': body.strip()}):
        p = powod(sciezka, v, d)
        if p:
            pominiete.append((sciezka, v, p))
        elif isinstance(v, bool) or linia(v) in calosc:
            przeniesione += 1
        else:
            pominiete.append((sciezka, v, 'BRAK W NOWYCH PLIKACH'))
    return przeniesione, pominiete


class Zrzut(yaml.SafeDumper):
    """Tekst wielolinijkowy (Treść EN) jako blok „|” — czytelny w GitHubie; PyYAML sam wraca do cudzysłowu, gdy blok nie pasuje."""


Zrzut.add_representer(str, lambda dumper, s: dumper.represent_scalar('tag:yaml.org,2002:str', s, style='|' if '\n' in s else None))


def zapisz(sciezka, tekst):
    sciezka.parent.mkdir(parents=True, exist_ok=True)
    sciezka.write_text(tekst, encoding='utf-8', newline='\n')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--tresci', required=True, type=Path, help='katalog z klonami repozytoriów treści (np. C:/Users/…/source/tresci)')
    ap.add_argument('--do', type=Path, help='zapis do osobnego katalogu zamiast w klonach')
    a = ap.parse_args()

    stare = []
    for repo in REPOZYTORIA:
        for p in sorted((a.tresci / repo / 'src/content/specjalnosci').glob('*.md')):
            d, body = czytaj(p)
            if not any(k in d for k in STARE_POLA):
                raise SystemExit(f'{repo}/{p.name}: plik już przerobiony (brak dawnych pól) — nie uruchamiam migracji drugi raz.')
            d['_id'] = p.stem
            stare.append((repo, d, body))
    if not stare:
        raise SystemExit('Nie znalazłem plików specjalności.')

    bledy = suma_p = suma_pom = 0
    for repo, d, body in stare:
        cel = (a.do / repo) if a.do else (a.tresci / repo)
        pl, en = tresc(d, False, body), tresc(d, True, body)
        front = {'nazwa': d['nazwa'], 'nazwa_en': d.get('nazwa_en')}
        if en.strip():
            front['tresc_en'] = en
        if d.get('opublikowany') is False:
            front['opublikowany'] = False
        front = {k: v for k, v in front.items() if v not in (None, '')}
        tekst_tresci = '---\n' + yaml.dump(front, Dumper=Zrzut, allow_unicode=True, sort_keys=False, width=10**6) + '---\n' + (f'\n{pl}' if pl else '')
        zapisz(cel / 'src/content/specjalnosci' / f"{d['_id']}.md", tekst_tresci)

        baner = {k: d[k] for k in POLA_BANERU if k in d and d[k] not in (None, '', [])}
        tekst_baneru = json.dumps(baner, ensure_ascii=False, indent=2) + '\n'
        zapisz(cel / 'src/content/specjalnosci-baner' / f"{d['_id']}.json", tekst_baneru)

        przeniesione, pominiete = sprawdz(d, body, [pl, en, tekst_baneru.replace('\\"', '"'), d['nazwa'], d.get('nazwa_en') or ''])
        bledy += sum(1 for *_, p in pominiete if p == 'BRAK W NOWYCH PLIKACH')
        suma_p += przeniesione
        suma_pom += len(pominiete)
        n = lambda wzor: len(re.findall(wzor, pl, re.M))
        sekcje, punkty, pytania = n(r'^## '), n(r'^(?:-|\d+\.) '), n(r'^### .*\?$')
        print(f"{repo}/{d['_id']}: {przeniesione} wartości przeniesionych, {len(pominiete)} pominiętych; sekcje {sekcje}, "
              f"punkty list {punkty}, pytania {pytania}; baner: {len(baner)} pól")
        powody = {}
        for sciezka, v, p in pominiete:
            powody.setdefault(p, []).append(sciezka)
        for p, sciezki in powody.items():
            print(f'  pominięte ({len(sciezki)}): {p} — ' + ', '.join(sciezki[:6]) + (' …' if len(sciezki) > 6 else ''))

    print(f'Razem: {len(stare)} specjalności, {suma_p} wartości przeniesionych, {suma_pom} pominiętych.')
    if bledy:
        raise SystemExit(f'{bledy} wartości nie ma w nowych plikach (BRAK W NOWYCH PLIKACH) — popraw skrypt.')


if __name__ == '__main__':
    main()
