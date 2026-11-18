// „Warto wiedzieć” (zlecenie 47): dane przy budowie dla listy /instytut/warto-wiedziec, stron wpisów, rzędu na stronie głównej,
// mapy strony i szkiców. Trzy kolekcje (src/content.config.ts: ww_sylwetki, ww_nagrody, ww_historie) → jedna lista wpisów WW
// z polami po kontroli. Czyste funkcje (lata, linie bloków, powiązania, losowanie) — src/lib/ww.mjs.
// Kontrola (ostrzeżenie w logu budowy, raz na budowę; nie błąd — „strona bezobsługowa”, zlecenie 31):
// - nazwa pliku powtórzona w dwóch grupach: zostaje pierwsza (sylwetki → nagrody → historie), druga wypada;
// - „Dodano” i rocznice w złym formacie: pole puste; historia bez roku (albo ze złym): poza osią czasu;
// - „Lata” to nie data: tekst tak, jak wpisany („Lata: nie data”); plik w starym układzie (wprost w warto_wiedziec/): historia;
// - złe linie bloków :::w-skrocie i :::laureaci (przy renderowaniu Treści): linia pominięta, na Podglądzie czerwona ramka;
// - liczby banera sylwetki (zlecenie 52): ponad 3 pozycje w polu „Liczby”, zapas z bloku :::w-skrocie (pole puste), blok obok pola.
import { getCollection, type CollectionEntry } from 'astro:content';
import { TYLKO_OPUBLIKOWANE, maTresc, jestSzkicem } from './tresci';
import { renderMarkdownZNaglowkami } from './markdown';
import { u } from './url';
import { wybierz, langPola } from './i18n';
import { parsujLata, rokZLat, liczLaureatow, maBlokLaureatow, linkiDoWW, bezDuplikatow, wybierzNaGlowna, napisNaGlowna, rocznicaBlisko, nowe, liczbySylwetki } from './ww.mjs';
import type { Lang } from './daty';

export type GrupaWW = 'sylwetki' | 'nagrody' | 'historie';
export type KolekcjaWW = 'ww_sylwetki' | 'ww_nagrody' | 'ww_historie';
export const ADRES_WW = '/instytut/warto-wiedziec';
export const GRUPY_WW: { grupa: GrupaWW; kolekcja: KolekcjaWW; pl: string; en: string }[] = [
  { grupa: 'sylwetki', kolekcja: 'ww_sylwetki', pl: 'Sylwetki', en: 'Profiles' },
  { grupa: 'nagrody', kolekcja: 'ww_nagrody', pl: 'Nagrody i wyróżnienia', en: 'Awards and distinctions' },
  { grupa: 'historie', kolekcja: 'ww_historie', pl: 'Historie', en: 'Stories' },
];
export const nazwaGrupy = (g: GrupaWW, lang: Lang) => GRUPY_WW.find((x) => x.grupa === g)![lang];

export interface WW {
  grupa: GrupaWW;
  kolekcja: KolekcjaWW;
  slug: string;
  /** ścieżka pliku (src/content/warto_wiedziec/…) — formularz w CMS (src/lib/podglad.ts) */
  plik?: string;
  /** dla widoczny() i jestSzkicem() (src/lib/tresci.ts) */
  data: { opublikowany: boolean };
  tytul: string;
  tytul_en?: string;
  zajawka?: string;
  zajawka_en?: string;
  obraz?: string;
  obraz_zrodlo?: string;
  obraz_opis?: string;
  obraz_opis_en?: string;
  link?: string;
  link_etykieta?: string;
  link_etykieta_en?: string;
  na_glownej: boolean;
  ulubione: boolean;
  zawsze: boolean;
  /** „RRRR-MM-DD” albo undefined (puste albo złe) */
  dodano?: string;
  lata?: string;
  podpis?: string;
  podpis_en?: string;
  /** sylwetka: pole „Liczby” (liczby w banerze, zlecenie 52); pozycje bez liczby albo podpisu pomija src/content.config.ts */
  liczby: { n: string; n_en?: string; etykieta: string; etykieta_en?: string }[];
  /** „MM-DD”: rocznica urodzin (sylwetka) albo wydarzenia (historia) */
  rocznica?: string;
  /** historia: rok wydarzenia (punkt na osi); sylwetka: rok urodzenia z „Lata” (kolejność, wiek w rocznicę) */
  rok?: number;
  kolejnosc: number;
  body: string;
  tresc_en?: string;
  maTresc: boolean;
  maTrescEn: boolean;
  /** sylwetka z pustą Treścią (same komentarze) */
  tba: boolean;
  /** punkty :::laureaci (licznik na liście) i czy blok jest (taki wpis nie losuje się na stronie głównej) */
  laureaci: number;
  maLaureatow: boolean;
  /** pliki „Warto wiedzieć”, do których linkuje Treść (PL i EN) — powiązania bez pola „Osoby” */
  linki: Set<string>;
  /** własna strona /instytut/warto-wiedziec/<plik>: każda sylwetka (także TBA), nagroda i historia — gdy mają Treść */
  stronaWlasna: boolean;
}

const ostrzezone = new Set<string>();
/** Ostrzeżenie w logu budowy, raz na budowę (dane czytają lista, strony wpisów, strona główna…). */
export function ostrzezWW(m: string) {
  if (ostrzezone.has(m)) return;
  ostrzezone.add(m);
  console.warn(`[warto-wiedziec] ${m}`);
}

const DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
const poprawnaData = (s: string) => {
  const m = DATA.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
};
const poprawnaRocznica = (s: string) => /^\d{2}-\d{2}$/.test(s) && poprawnaData(`2024-${s}`);

type Wpis = CollectionEntry<'ww_sylwetki'> | CollectionEntry<'ww_nagrody'> | CollectionEntry<'ww_historie'>;

function naWW(grupa: GrupaWW, kolekcja: KolekcjaWW, e: Wpis): WW {
  const d = e.data as Record<string, any>;
  const plik = e.filePath?.replaceAll('\\', '/');
  const slug = e.id.split('/').pop()!;
  const kto = plik ?? `${kolekcja}/${slug}`;
  if (grupa === 'historie' && plik && !/\/historie\/[^/]+$/.test(plik)) {
    ostrzezWW(`${kto}: plik w starym układzie (wprost w warto_wiedziec/) — strona traktuje go jak historię; przenieś do sylwetki/, nagrody/ albo historie/`);
  }
  let dodano: string | undefined = d.dodano?.slice(0, 10);
  if (d.dodano && !(dodano && poprawnaData(dodano) && d.dodano.length === 10)) {
    ostrzezWW(`${kto}: „Dodano” „${d.dodano}” to nie data RRRR-MM-DD — pole pominięte (bez „Nowe”)`);
    dodano = undefined;
  }
  let rocznica: string | undefined = grupa === 'sylwetki' ? d.rocznica_urodzin : grupa === 'historie' ? d.rocznica : undefined;
  if (rocznica && !poprawnaRocznica(rocznica)) {
    ostrzezWW(`${kto}: rocznica „${rocznica}” to nie data MM-DD — pole pominięte`);
    rocznica = undefined;
  }
  let rok: number | undefined;
  if (grupa === 'historie') {
    if (d.rok && /^\d{4}$/.test(String(d.rok).trim())) rok = +String(d.rok).trim();
    else ostrzezWW(`${kto}: ${d.rok ? `rok „${d.rok}” to nie rok (4 cyfry)` : 'brak roku'} — historia pominięta na osi czasu`);
  }
  if (grupa === 'sylwetki') {
    const l = parsujLata(d.lata);
    if (l.typ === 'tekst') ostrzezWW(`${kto}: Lata: nie data („${d.lata}”) — pokazane tak, jak wpisane`);
    rok = rokZLat(d.lata);
  }
  const body = e.body ?? '';
  const tresc = maTresc(body);
  const trescEn = maTresc(d.tresc_en);
  return {
    grupa, kolekcja, slug, plik,
    data: { opublikowany: d.opublikowany !== false },
    tytul: d.tytul, tytul_en: d.tytul_en,
    zajawka: d.zajawka, zajawka_en: d.zajawka_en,
    obraz: d.obraz, obraz_zrodlo: d.obraz_zrodlo, obraz_opis: d.obraz_opis, obraz_opis_en: d.obraz_opis_en,
    link: d.link, link_etykieta: d.link_etykieta, link_etykieta_en: d.link_etykieta_en,
    na_glownej: d.na_glownej !== false, ulubione: d.ulubione === true, zawsze: d.zawsze === true,
    dodano, lata: d.lata, podpis: d.podpis, podpis_en: d.podpis_en, liczby: Array.isArray(d.liczby) ? d.liczby : [], rocznica, rok,
    kolejnosc: typeof d.kolejnosc === 'number' ? d.kolejnosc : 100,
    body, tresc_en: d.tresc_en,
    maTresc: tresc, maTrescEn: trescEn,
    tba: grupa === 'sylwetki' && !tresc,
    laureaci: liczLaureatow(body), maLaureatow: maBlokLaureatow(body),
    linki: new Set([...linkiDoWW(body), ...linkiDoWW(d.tresc_en)].filter((s) => s !== slug)),
    stronaWlasna: grupa === 'sylwetki' || tresc,
  };
}

const porownaj = (a: WW, b: WW) => a.tytul.localeCompare(b.tytul, 'pl');
/** Kolejność w grupie: sylwetki — rok urodzenia (bez roku na końcu, alfabetycznie), nagrody — „Kolejność”, historie — rok. */
export function sortujWW(lista: WW[]): WW[] {
  const k = (w: WW) => (w.grupa === 'nagrody' ? w.kolejnosc : w.rok ?? Infinity);
  return [...lista].sort((a, b) => GRUPY_WW.findIndex((g) => g.grupa === a.grupa) - GRUPY_WW.findIndex((g) => g.grupa === b.grupa) || k(a) - k(b) || porownaj(a, b));
}

let pamiec: Promise<WW[]> | undefined;
/** Wszystkie wpisy (także szkice — na Podglądzie widać wszystko; filtr: widoczneWW), po kontroli i bez duplikatów nazw. */
export function wszystkieWW(): Promise<WW[]> {
  pamiec ??= (async () => {
    const wszystkie: WW[] = [];
    for (const g of GRUPY_WW) for (const e of await getCollection(g.kolekcja)) wszystkie.push(naWW(g.grupa, g.kolekcja, e as Wpis));
    const { wpisy, duplikaty } = bezDuplikatow(wszystkie);
    for (const x of duplikaty) {
      ostrzezWW(`${x.pominiety.plik}: nazwa pliku „${x.slug}” jest już w grupie ${nazwaGrupy(x.zostaje.grupa, 'pl')} (${x.zostaje.plik}) — adres jest wspólny, wpis pominięty; zmień nazwę pliku`);
    }
    return sortujWW(wpisy);
  })();
  return pamiec;
}
/** Wpisy widoczne: przy fladze TYLKO_OPUBLIKOWANE bez szkiców (widoczny() ze zlecenia 33). */
export async function widoczneWW(): Promise<WW[]> {
  return (await wszystkieWW()).filter((w) => !TYLKO_OPUBLIKOWANE || !jestSzkicem(w));
}

/** Adres karty: strona wpisu albo (wpis bez Treści) link z karty; bez linku — sekcja grupy na liście. */
export const adresWW = (w: WW) => (w.stronaWlasna ? `${ADRES_WW}/${w.slug}` : w.link || `${ADRES_WW}#${w.grupa}`);
/** Na stronie EN: wpis ma polską Treść, a angielskiej nie (ramka „Translation in preparation”, znaczek „PL”, bez losowania). */
export const bezTlumaczenia = (w: WW, lang: Lang) => lang === 'en' && w.maTresc && !w.maTrescEn;
// Teksty pól w języku strony: wybierz(w, 'zajawka', lang) i langPola(w, 'zajawka', lang) z src/lib/i18n.ts (puste pole EN = tekst polski).

// ---------- portret (placeholder z prototypu albo zdjęcie) ----------
const SYLWETKA_SVG = '<svg viewBox="0 0 80 100" aria-hidden="true" focusable="false"><circle cx="40" cy="36" r="15"/><path d="M12 96c0-17 12.5-30 28-30s28 13 28 30"/></svg>';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** HTML portretu: zdjęcie (pole „Zdjęcie”) albo sylwetka zastępcza; napis „Zdjęcie” (duże zastępcze) tylko na Podglądzie. */
export function portretHtml(w: WW | undefined, klasa = ''): string {
  const k = klasa ? ` ${klasa}` : '';
  if (w?.obraz) return `<span class="ww2-portret ww2-foto${k}"><img src="${esc(u(w.obraz))}" alt="" loading="lazy" decoding="async"></span>`;
  return `<span class="ww2-portret ww2-ph${k}" aria-hidden="true">${SYLWETKA_SVG}${TYLKO_OPUBLIKOWANE ? '' : '<small lang="pl">Zdjęcie</small>'}</span>`;
}
/** Małe portrety sylwetek widocznych (blok :::laureaci; szkice przy fladze bez portretu). */
export async function portretyWW(): Promise<Record<string, string>> {
  return Object.fromEntries((await widoczneWW()).filter((w) => w.grupa === 'sylwetki').map((w) => [w.slug, portretHtml(w, 'ww2-mini')]));
}

// ---------- powiązania (linki w Treści) ----------
/** „W »Warto wiedzieć«” na stronie sylwetki: nagrody i historie, które linkują do tej osoby (bez innych sylwetek). */
export async function wpisyZOsoba(slug: string): Promise<WW[]> {
  const l = (await widoczneWW()).filter((w) => w.grupa !== 'sylwetki' && w.linki.has(slug));
  return [...l.filter((w) => w.grupa === 'historie'), ...l.filter((w) => w.grupa === 'nagrody')];
}
/** „Ludzie w tej historii” / „Sylwetki laureatów”: sylwetki widoczne, do których linkuje Treść wpisu (w kolejności linków). */
export async function ludzieWpisu(w: WW): Promise<WW[]> {
  const syl = new Map((await widoczneWW()).filter((x) => x.grupa === 'sylwetki').map((x) => [x.slug, x]));
  return [...w.linki].map((s) => syl.get(s)).filter((x): x is WW => !!x);
}

// ---------- liczby w banerze sylwetki (zlecenie 52) ----------
/**
 * Pozycje do LiczbyBanera (pierwsze 3): pole „Liczby” (EN: etykieta_en, puste = podpis polski — LiczbyBanera.astro), a gdy puste —
 * zapas z bloku :::w-skrocie Treści polskiej (stare pliki; liczbySylwetki w ww.mjs). Ostrzeżenia w logu budowy: zapas, ponad 3 pozycje,
 * blok :::w-skrocie obok wypełnionego pola (w treści strony bloku nie ma nigdy — trescWW go wycina).
 */
export function liczbyBaneraWW(w: WW): { n: string; n_en?: string; pl: string; en?: string }[] {
  const l = liczbySylwetki(w.liczby, w.body, parsujLata(w.lata).liczba);
  const kto = w.plik ?? w.slug;
  if (l.zrodlo === 'w-skrocie') ostrzezWW(`${kto}: liczby w banerze z bloku :::w-skrocie — przenieś je do pola „Liczby” (Sylwetki → Liczby w banerze), a blok usuń z Treści`);
  if (l.zrodlo === 'pole' && l.wszystkich > 3) ostrzezWW(`${kto}: pole „Liczby” ma ${l.wszystkich} pozycji — w banerze pokazują się pierwsze 3`);
  if (l.zrodlo === 'pole' && l.blok) ostrzezWW(`${kto}: blok :::w-skrocie w Treści jest pomijany (liczby w banerze są z pola „Liczby”) — usuń go z Treści`);
  return l.pozycje;
}

// ---------- Treść (jawny Markdown z blokami) ----------
export interface SekcjaWW { id: string; etykieta: string; naglowek: string; html: string }
export interface BladLiniiWW { nr: number; tekst: string; powod: string; blok: string }
export interface TrescWW {
  /** tekst przed pierwszym ## */
  wstep: string;
  sekcje: SekcjaWW[];
  /** sekcja {#zrodla} (sylwetka: zwinięta na końcu) i liczba źródeł */
  zrodla?: SekcjaWW & { n: number };
  /** złe linie bloków — tylko na Podglądzie (bez flagi) */
  bledy: BladLiniiWW[];
}
/** Treść wpisu w języku strony (EN: tylko tresc_en; pusta = undefined — ramka „Translation in preparation”). */
export async function trescWW(w: WW, lang: Lang): Promise<TrescWW | undefined> {
  const src = lang === 'en' ? (w.maTrescEn ? w.tresc_en : undefined) : w.maTresc ? w.body : undefined;
  if (!src) return undefined;
  const ww: { lata?: string; portrety: Record<string, string>; bledy?: BladLiniiWW[] } = { lata: parsujLata(w.lata).liczba, portrety: await portretyWW() };
  let { html } = await renderMarkdownZNaglowkami(src, lang, false, { ww });
  const bledy = ww.bledy ?? [];
  for (const b of bledy) ostrzezWW(`${w.plik}${lang === 'en' ? ' (Treść EN)' : ''}: linia ${b.nr} bloku :::${b.blok} pominięta — ${b.powod}: „${b.tekst}”`);
  // blok :::w-skrocie (dl.ww2-skrot) nigdy nie stoi w treści: od zlecenia 52 to tylko zapas liczb banera sylwetki (liczbyBaneraWW)
  html = html.replace(/<dl class="ww2-skrot">[\s\S]*?<\/dl>/g, '');
  const [wstep, ...reszta] = html.split(/(?=<h2[\s>])/);
  const sekcje: SekcjaWW[] = reszta.map((h) => {
    const m = /^<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/.exec(h);
    return { id: m?.[1] ?? '', naglowek: m?.[2] ?? '', etykieta: (m?.[2] ?? '').replace(/<[^>]+>/g, '').trim(), html: m ? h.slice(m[0].length) : h };
  });
  const z = sekcje.findIndex((s) => s.id === 'zrodla');
  const zrodla = z >= 0 ? { ...sekcje.splice(z, 1)[0], n: 0 } : undefined;
  if (zrodla) zrodla.n = (zrodla.html.match(/<li[\s>]/g) ?? []).length;
  return { wstep: wstep.trim(), sekcje, zrodla, bledy: TYLKO_OPUBLIKOWANE ? [] : bledy };
}

// ---------- strony i przekierowania ----------
/** getStaticPaths stron wpisów: widoczne sylwetki (każda, także TBA) oraz nagrody i historie z Treścią. */
export async function sciezkiWW() {
  return (await widoczneWW()).filter((w) => w.stronaWlasna).map((wpis) => ({ params: { slug: wpis.slug }, props: { wpis } }));
}

// Dawne adresy /warto-wiedziec/<plik> (do zlecenia 47): trzy wpisy przeniesione pod tą samą nazwą, medale — na ogólny wpis o medalu.
const DAWNE_WW: Record<string, string> = {
  'artykul-w-annals-of-mathematics': 'artykul-w-annals-of-mathematics',
  'wyklad-terencea-tao': 'wyklad-terencea-tao',
  'wyrozniajaca-ocena-pka': 'wyrozniajaca-ocena-pka',
  'medale-uniwersytetu-dla-profesorow-marka-bozejki-i-tomasza-rolskiego': 'medal-uniwersytetu',
};
/**
 * getStaticPaths przekierowań ze starych adresów: cel — nowa strona wpisu; gdy jej nie ma (np. między pushami Web-Core i Web-Instytut
 * stary plik leży jeszcze pod dawną nazwą) — strona o tej samej nazwie, a bez niej lista. Przekierowań nie ma w mapie strony.
 */
export async function przekierowaniaWW() {
  const strony = new Map((await widoczneWW()).filter((w) => w.stronaWlasna).map((w) => [w.slug, w]));
  return Object.entries(DAWNE_WW).map(([stary, nowy]) => {
    const w = strony.get(nowy) ?? strony.get(stary);
    return { params: { slug: stary }, props: { cel: w ? `${ADRES_WW}/${w.slug}` : ADRES_WW, tytul: w?.tytul ?? 'Warto wiedzieć', tytulEn: w ? w.tytul_en || w.tytul : 'Highlights' } };
  });
}

// ---------- strona główna: rząd „Warto wiedzieć” (zlecenie 47, punkt 7) ----------
export interface PozycjaGlownej {
  w: WW;
  adres: string;
  tytul: string;
  tytulLang?: 'pl';
  /** atrybuty data-* dla skryptu wyboru (src/lib/wwSkrypty.ts: glownaJs) */
  dane: Record<string, string | undefined>;
  /** wybór przy budowie (bez JS): widoczna pozycja i napis nad tytułem */
  widoczna: boolean;
  napis: string;
}
/**
 * Pula: wpisy widoczne z „Na stronie głównej”, bez bloku :::laureaci i bez TBA; na /en bez wpisów z samą polską Treścią.
 * Kolejność w HTML: wybór przy budowie (rocznica ±7 dni, „Zawsze pokazuj”, najnowszy z „Dodano” ≤ 30 dni, dalej kolejność listy),
 * potem reszta (ukryta). Skrypt w przeglądarce wybiera od nowa: rocznica, zawsze, nowe, losowanie z wagami (ulubione ×3).
 */
export async function naGlownejWW(lang: Lang, ile: number, dzis: string): Promise<PozycjaGlownej[]> {
  const pula = (await widoczneWW()).filter((w) => w.na_glownej && !w.maLaureatow && !w.tba && !bezTlumaczenia(w, lang));
  const poz = pula.map((w) => ({ rocznica: w.rocznica ?? '', rok: w.rok ?? 0, zawsze: w.zawsze, dodano: w.dodano ?? '', waga: w.ulubione ? 3 : 1 }));
  const wybor = wybierzNaGlowna(poz, dzis, ile, { rocznicaBlisko, nowe }, () => 0);
  const kolejnosc = [...wybor.map((x) => x.i), ...pula.map((_, i) => i).filter((i) => !wybor.some((x) => x.i === i))];
  return kolejnosc.map((i) => {
    const w = pula[i];
    const x = wybor.find((y) => y.i === i);
    return {
      w,
      adres: adresWW(w),
      tytul: wybierz(w, 'tytul', lang),
      tytulLang: langPola(w, 'tytul', lang),
      dane: {
        'data-rocznica': w.rocznica && w.rok ? w.rocznica : undefined,
        'data-rok': w.rocznica && w.rok ? String(w.rok) : undefined,
        'data-urodziny': w.grupa === 'sylwetki' && w.rocznica ? '' : undefined,
        'data-sylwetka': w.grupa === 'sylwetki' ? '' : undefined,
        'data-zawsze': w.zawsze ? '' : undefined,
        'data-dodano': w.dodano,
        'data-waga': w.ulubione ? '3' : '1',
      },
      widoczna: !!x,
      napis: x ? napisNaGlowna(x.napis, w.grupa === 'sylwetki', w.grupa === 'sylwetki', lang) : '',
    };
  });
}
