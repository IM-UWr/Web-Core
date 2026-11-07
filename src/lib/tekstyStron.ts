// Teksty stron działów i stron z listami (zlecenie 30): tekst strony leży w repozytorium, z którego pochodzi jej treść.
// • Strona działu (Instytut, Nauka, Studia): plik src/data/<dział>.md — Pages CMS „Strona działu …” w Web-Instytut, Web-Nauka,
//   Web-Studia (jak Popularyzacja w zleceniu 29, src/lib/widoki/popularyzacja.ts). Treść = Markdown (body; po angielsku tresc_en,
//   puste = polska), drobne pola w nagłówku pliku (tytul, wstep, haslo, „W skrócie”…).
// • Strona z listą (Seminaria, Konferencje, Aktualności…): wpis kolekcji „strony” pod adresem strony z listą (reguła „adres =
//   ścieżka pliku”, np. src/content/strony/nauka/konferencje.md → /nauka/konferencje). Treść = tekst nad listą, Opis = zdanie
//   pod tytułem (i w Google), Hasło, Tytuł; haslo_podstron — hasło stron pojedynczych wpisów (rocznik publikacji, obrona).
//   Taki wpis nie dostaje własnej strony ([...slug].astro, sciezki.ts) — wyświetla go strona z listą.
//   Brak pliku nic nie psuje: lista z domyślnym tytułem, opisem i hasłem jak przed zleceniem 30 (DOMYSLNE niżej), bez tekstu.
// Lista stoi pod całym tekstem, chyba że tekst ma kotwicę strony (nagłówek ## z listy typu 'strona' w src/plugins/kotwice.mjs,
// np. „Czasopisma redagowane w Instytucie”): wtedy sekcja pod tym nagłówkiem (do następnego ##) idzie na miejsce swojej listy.
import { getCollection } from 'astro:content';
import { KOTWICE, klucz } from '../plugins/kotwice.mjs';
import { renderMarkdownZNaglowkami } from './markdown';
import { wybierz } from './i18n';
import type { Lang } from './daty';

type Para = { pl: string; en: string };
type Domyslne = { tytul: Para; opis: Para; haslo?: Para; haslo_podstron?: Para };
const p = (pl: string, en: string): Para => ({ pl, en });

// Strony z listą: id wpisu w kolekcji „strony” (= adres strony bez / na początku) i wartości przed zleceniem 30 (z kodu
// i z dawnych src/data/dzialy/*.json w Web-Ustawienia) — używane tylko, gdy pliku strony nie ma.
export const STRONY_Z_LISTA: Record<string, Domyslne> = {
  aktualnosci: {
    tytul: p('Aktualności', 'News'),
    opis: p('Ogłoszenia, wydarzenia i sukcesy Instytutu Matematycznego.', 'Announcements, events and achievements of the Mathematical Institute.'),
    haslo: p('Co słychać w Instytucie', "What's new at the Institute"),
  },
  'obrony-doktorskie': {
    tytul: p('Obrony doktorskie', 'PhD defences'),
    opis: p('Publiczne obrony rozpraw doktorskich z matematyki: zawiadomienia, rozprawy, streszczenia i recenzje.', 'Public defences of doctoral theses in mathematics: notices, theses, abstracts and reviews.'),
    haslo: p('Publiczne obrony rozpraw', 'Public thesis defences'),
    haslo_podstron: p('Publiczna obrona doktoratu', 'A public PhD defence'),
  },
  pracownicy: {
    tytul: p('Pracownicy', 'Staff'),
    opis: p('Dane kontaktowe pracowników, doktorantów i administracji Instytutu Matematycznego.', 'Contact details of the staff, PhD students and administration of the Mathematical Institute.'),
    haslo: p('Kontakt do każdego z nas', 'How to reach each of us'),
  },
  'warto-wiedziec': {
    tytul: p('Warto wiedzieć', 'Highlights'),
    opis: p('Wyjątkowe wydarzenia i osiągnięcia, którymi Instytut Matematyczny chwali się od lat.', 'Exceptional events and achievements the Mathematical Institute has been proud of for years.'),
    haslo: p('Czym chwalimy się od lat', 'What we have long been proud of'),
  },
  'instytut/struktura': {
    tytul: p('Struktura i zakłady', 'Structure and departments'),
    opis: p('W skład Instytutu wchodzi osiem zakładów naukowych i Pracownia Dydaktyki i Popularyzacji Matematyki.', 'The Institute consists of eight research departments and the Mathematics Education and Outreach Unit.'),
    haslo: p('Osiem zakładów i pracownia', 'Eight departments and a unit'),
  },
  seminaria: {
    tytul: p('Seminaria', 'Seminars'),
    opis: p('Seminaria naukowe Instytutu Matematycznego. Zapraszamy wszystkich zainteresowanych.', 'Research seminars of the Mathematical Institute. Everyone is welcome.'),
    haslo: p('Otwarte dla wszystkich', 'Open to everyone'),
  },
  'nauka/konferencje': {
    tytul: p('Konferencje', 'Conferences'),
    opis: p('Konferencje i warsztaty organizowane lub współorganizowane przez pracowników Instytutu Matematycznego.', 'Conferences and workshops organised or co-organised by members of the Mathematical Institute.'),
    haslo: p('Spotkania, które współtworzymy', 'Meetings we co-organise'),
  },
  'nauka/granty': {
    tytul: p('Projekty i granty', 'Research projects and grants'),
    opis: p(
      'Projekty badawcze realizowane w Instytucie Matematycznym, finansowane przez Narodowe Centrum Nauki, programy unijne i inne źródła.',
      'Research projects carried out at the Mathematical Institute, funded by the National Science Centre (NCN), EU programmes and other sources.',
    ),
    haslo: p('Projekty NCN, unijne i inne', 'NCN, EU and other projects'),
  },
  'nauka/sukcesy': {
    tytul: p('Sukcesy', 'Achievements'),
    opis: p(
      'Nagrody, wyróżnienia, granty i stypendia pracowników, doktorantów, studentów i absolwentów Instytutu Matematycznego.',
      'Prizes, distinctions, grants and scholarships awarded to staff, PhD students, students and graduates of the Mathematical Institute.',
    ),
    haslo: p('Nagrody, granty, stypendia', 'Awards, grants, scholarships'),
  },
  'nauka/publikacje': {
    tytul: p('Publikacje', 'Publications'),
    opis: p(
      'Wykazy publikacji naukowych pracowników Instytutu według roku wydania oraz czasopisma redagowane w Instytucie.',
      'Lists of research publications by members of the Institute, by year of publication, and journals edited at the Institute.',
    ),
    haslo: p('Nasze wyniki, rok po roku', 'Our results, year by year'),
    haslo_podstron: p('Rocznik prac Instytutu', 'A year of the Institute’s papers'),
  },
  'studia/plan-zajec': {
    tytul: p('Plan zajęć', 'Timetable'),
    opis: p('Plan zajęć Instytutu Matematycznego, aktualizowany automatycznie z USOS.', 'Timetable of the Mathematical Institute, updated automatically from USOS.'),
    haslo: p('Zawsze aktualny, prosto z USOS', 'Always up to date, straight from USOS'),
  },
};
export type StronaZLista = keyof typeof STRONY_Z_LISTA;
/** Wpis kolekcji „strony”, który jest tekstem strony z listą (bez własnej podstrony). */
export const jestTekstemListy = (id: string) => Object.hasOwn(STRONY_Z_LISTA, id);

export interface Sekcja { naglowek: string; html: string }
export interface Tekst {
  // html — tekst nad listą (pierwszy akapit z klasą wst, gdy opcja wst); sekcje — sekcje pod kotwicami strony (id kotwicy)
  html: string;
  sekcje: Record<string, Sekcja>;
}

// Podział Markdownu na tekst główny i sekcje pod kotwicami strony (nagłówki ## spoza bloków kodu).
function podziel(src: string, adres: string): { glowny: string; kotwiczone: { id: string; naglowek: string; tresc: string }[] } {
  const kotwice = (KOTWICE as { id: string; typ?: string; adres?: string; nazwy: string[] }[]).filter((k) => k.typ === 'strona' && k.adres === adres);
  const linie = src.replace(/\r\n/g, '\n').split('\n');
  const glowny: string[] = [];
  const kotwiczone: { id: string; naglowek: string; linie: string[] }[] = [];
  let biezaca: string[] = glowny;
  let wKodzie = false;
  for (const l of linie) {
    if (/^\s*(```|~~~)/.test(l)) wKodzie = !wKodzie;
    const m = !wKodzie && /^##\s+(.+?)\s*#*\s*$/.exec(l);
    if (m) {
      const naglowek = m[1].replace(/\\(.)/g, '$1').replace(/[*_]/g, '').trim();
      const k = kotwice.find((x) => x.nazwy.some((n) => klucz(n) === klucz(naglowek)));
      if (k) {
        const s = { id: k.id, naglowek, linie: [] as string[] };
        kotwiczone.push(s);
        biezaca = s.linie;
        continue;
      }
      biezaca = glowny;
    }
    biezaca.push(l);
  }
  return { glowny: glowny.join('\n').trim(), kotwiczone: kotwiczone.map((s) => ({ id: s.id, naglowek: s.naglowek, tresc: s.linie.join('\n').trim() })) };
}

/** Markdown strony → HTML tekstu (z wtyczką bloków, gdy bloki) i sekcji pod kotwicami strony `adres`. */
export async function renderTekstu(src: string | undefined, adres: string, lang: Lang, opcje: { bloki?: boolean; wst?: boolean } = {}): Promise<Tekst> {
  const { glowny, kotwiczone } = podziel(src ?? '', adres);
  const render = async (s: string) => (s ? (await renderMarkdownZNaglowkami(s, lang, opcje.bloki === true)).html : '');
  let html = await render(glowny);
  if (opcje.wst) html = html.replace(/<p>/, '<p class="wst">');
  const sekcje: Record<string, Sekcja> = {};
  for (const s of kotwiczone) if (!sekcje[s.id]) sekcje[s.id] = { naglowek: s.naglowek, html: await render(s.tresc) };
  return { html, sekcje };
}

/** Zawartość jednego akapitu (do tekstu w miejscu zwykłego <p>, np. opis sekcji), inaczej undefined. */
export const jedenAkapit = (html: string) => /^\s*<p>([\s\S]*?)<\/p>\s*$/.exec(html)?.[1];

export interface StronaListy extends Tekst {
  jest: boolean; tytul: string; opis?: string; haslo?: string; hasloPodstron?: string;
}

/** Tytuł, opis, hasło i tekst strony z listą (adres bez / na początku, np. 'nauka/konferencje'). */
export async function stronaListy(id: StronaZLista, lang: Lang, opcje: { wst?: boolean } = {}): Promise<StronaListy> {
  const en = lang === 'en';
  const dom = STRONY_Z_LISTA[id];
  const wpis = (await getCollection('strony')).find((s) => s.id === id && s.data.opublikowany !== false);
  if (!wpis) {
    return { jest: false, tytul: dom.tytul[lang], opis: dom.opis[lang], haslo: dom.haslo?.[lang], hasloPodstron: dom.haslo_podstron?.[lang], html: '', sekcje: {} };
  }
  const d = wpis.data;
  // po angielsku: tytuł, opis i tekst — polskie, gdy pole EN puste; hasła — tylko pole EN (bez polskich resztek), jak dotąd
  const tekst = await renderTekstu((en && d.tresc_en?.trim()) || wpis.body, `/${id}`, lang, { bloki: d.bloki === true, wst: opcje.wst });
  return {
    jest: true,
    tytul: wybierz(d, 'tytul', lang),
    opis: wybierz(d, 'opis', lang) || undefined,
    haslo: (en ? d.haslo_en : d.haslo) || undefined,
    hasloPodstron: (en ? d.haslo_podstron_en : d.haslo_podstron) || undefined,
    ...tekst,
  };
}

// ---------- Strony działów: src/data/instytut.md, nauka.md, studia.md ----------
export type DzialZPlikiem = 'instytut' | 'nauka' | 'studia';
const PLIKI_DZIALOW = import.meta.glob<{ frontmatter: Record<string, any>; rawContent: () => string }>('../data/{instytut,nauka,studia}.md', { eager: true });
const DOMYSLNY_TYTUL: Record<DzialZPlikiem, Para> = { instytut: p('Instytut', 'Institute'), nauka: p('Nauka', 'Research'), studia: p('Studia', 'Study') };

/** Pola z nagłówka pliku strony działu (pusty obiekt, gdy pliku nie ma). */
export const polaDzialu = (dz: DzialZPlikiem): Record<string, any> => PLIKI_DZIALOW[`../data/${dz}.md`]?.frontmatter ?? {};

/** Tytuł, pola i tekst strony działu (pierwszy akapit z klasą wst, jak dawne akapity tekstu działu). */
export async function stronaDzialu(dz: DzialZPlikiem, lang: Lang) {
  const plik = PLIKI_DZIALOW[`../data/${dz}.md`];
  const d = polaDzialu(dz);
  const zrodlo = (lang === 'en' && (d.tresc_en as string | undefined)?.trim()) || plik?.rawContent() || '';
  const tekst = await renderTekstu(zrodlo, `/${dz}`, lang, { bloki: true, wst: true });
  return { d, tytul: wybierz(d, 'tytul', lang) || DOMYSLNY_TYTUL[dz][lang], ...tekst };
}
