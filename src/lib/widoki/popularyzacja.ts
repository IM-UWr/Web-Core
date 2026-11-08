// Dane strony działu „Popularyzacja” (Popularyzacja.astro): liczby w banerze (lata tradycji), grupy z menu działu, tekst
// „O popularyzacji” z „W skrócie” i karty „Dla kogo” (z nagłówków stron src/content/strony/popularyzacja/).
// Zlecenie 29: dane w src/data/popularyzacja.md (Pages CMS, Web-Popularyzacja: „Strona działu Popularyzacja”) — treść „O popularyzacji”
// to Markdown (body po polsku, tresc_en po angielsku; puste = polska), pozostałe pola w nagłówku pliku. Pole linki (ukryte w
// formularzu) nie jest wyświetlane: grupy linków nad tekstem biorą się z menu działu.
import { getCollection } from 'astro:content';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import * as Strona from '../../data/popularyzacja.md';
import { renderMarkdownZNaglowkami } from '../markdown';
import { menuGlowne } from '../menu';

type Tekst = string | null | undefined;
// wartosc_en — etykieta w wersji angielskiej (puste = jak po polsku)
type Fakt = { wartosc?: Tekst; wartosc_en?: Tekst; opis?: Tekst; opis_en?: Tekst };
// nazwa w dopełniaczu, bo liczba stoi przed nią („37 lat Zimowych Szkół”); EN: „37 years of Winter Schools”
type Tradycja = { rok: number; nazwa: string; nazwa_en?: Tekst };
type Dane = {
  tytul: string; tytul_en?: Tekst; tresc_en?: Tekst; wstep?: Tekst; wstep_en?: Tekst; haslo?: Tekst; haslo_en?: Tekst;
  format_tresci?: 'jawne';
  o_popularyzacji_fakty?: Fakt[] | null; tradycja?: Tradycja[] | null;
};

// polska odmiana: 1 rok, 2–4 lata, 5+ lat (22 lata, ale 12 lat)
const lata = (n: number) => (n === 1 ? 'rok' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'lata' : 'lat');

export async function danePopularyzacji(lang: Lang) {
  const en = lang === 'en';
  const T = (pl: string, angielski: string) => (en ? angielski : pl);
  const w = (o: any, pole: string) => wybierz(o, pole, lang) as string;
  const d = (Strona.frontmatter ?? {}) as Dane;

  const tytul = w(d, 'tytul') || T('Popularyzacja', 'Outreach');
  const lead = w(d, 'wstep');
  const haslo = w(d, 'haslo');

  // Liczby w banerze: lata tradycji liczone przy budowie strony, od roku założenia.
  const rok = new Date().getFullYear();
  const liczby = (d.tradycja ?? [])
    .map((t) => ({ n: rok - t.rok, nazwa: (en && t.nazwa_en) || t.nazwa }))
    .filter((x) => x.n > 0)
    .map(({ n, nazwa }) => ({ n, l: en ? `${n === 1 ? 'year' : 'years'} of ${nazwa}` : `${lata(n)} ${nazwa}` }));

  // Grupy z menu „Popularyzacja”: same nazwy, linki poza stronę dostają strzałkę ↗.
  const pozycja = (await menuGlowne()).find((m) => m.adres === '/popularyzacja');
  const grupy = (pozycja?.grupy ?? []).filter((g) => g.linki.length > 0);

  // „O popularyzacji”: Markdown z pola Treść (po angielsku Treść EN; pusta — polska, jak dotąd) przez wtyczkę bloków (kafelki,
  // listy plików — ściągawka w opisie pola) i „W skrócie” obok, jak „O studiach”. Pierwszy akapit większy (p.wst, jak pierwszy
  // z dawnych akapitów oddzielonych pustą linią).
  const zrodlo = (en && d.tresc_en?.trim()) || Strona.rawContent();
  const jawne = d.format_tresci === 'jawne';
  const html = (await renderMarkdownZNaglowkami(zrodlo, lang, !jawne, jawne)).html.replace(/<p>/, '<p class="wst">');
  const fakty = (d.o_popularyzacji_fakty ?? [])
    .filter((f) => f?.wartosc?.trim())
    .map((f) => ({ w: ((en && f.wartosc_en?.trim()) || f.wartosc!).trim(), o: ((en && f.opis_en) || f.opis || '').replace(/(\d)–(\d)/g, '$1⁠–⁠$2') }));

  // Karty „Dla kogo”: każda strona z katalogu popularyzacja/ (nazwa = tytuł strony, tytuł karty = hasło, opis = opis), więc
  // nowa strona sama dostaje kartę. Kolejność: najpierw jak w menu działu, strony spoza menu (Organizatorzy) na końcu.
  const wMenu = grupy.flatMap((g) => g.linki).map((l) => l.adres);
  const pozycjaWMenu = (adres: string) => { const i = wMenu.indexOf(adres); return i < 0 ? wMenu.length : i; };
  const karty = (await getCollection('strony'))
    .filter((s) => s.id.startsWith('popularyzacja/') && s.data.opublikowany !== false)
    .map((s) => ({
      adres: `/${s.id}`,
      nazwa: w(s.data, 'tytul'),
      tytul: w(s.data, 'haslo') || w(s.data, 'tytul'),
      opis: w(s.data, 'opis'),
    }))
    .sort((a, b) => pozycjaWMenu(a.adres) - pozycjaWMenu(b.adres) || a.adres.localeCompare(b.adres));

  return { tytul, lead, haslo, liczby, grupy, html, fakty, karty };
}
