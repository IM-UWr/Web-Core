// Dane strony „Publikacje” (/nauka/publikacje):
// - src/data/publikacje.json — wstęp, lista lat (PDF), czasopisma (edycja w CMS),
// - src/data/publikacje/RRRR.json — wykaz prac danego roku w HTML (podstrona /nauka/publikacje/RRRR).
// Liczby prac liczą się z wykazów — nie wpisuje się ich ręcznie.
import katex from 'katex';
import glowny from '../../data/publikacje.json';
import dzial from '../../data/dzialy/nauka.json';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { isExternal } from '../url';

export interface Praca { autorzy?: string; tytul?: string; zrodlo?: string; opis?: string; doi?: string; if?: string; uwagi?: string }
export interface Grupa { naglowek?: string; naglowek_en?: string; rok_wydania?: number; prace: Praca[] }
export interface Wykaz { rok: number; pochodzenie?: 'pdf' | 'strona'; zrodla?: string[]; uwagi?: string; uwagi_en?: string; grupy: Grupa[] }
export interface RokWpis { rok: number; plik?: string; link?: string; uwagi?: string; uwagi_en?: string }
export interface Czasopismo {
  nazwa: string; opis?: string; opis_en?: string; wydawca?: string; wydawca_en?: string; redakcja?: string; redakcja_en?: string;
  wsparcie?: string; wsparcie_en?: string; kontakt?: string; issn?: string; eissn?: string; adres?: string;
}
export interface DanePublikacji {
  wstep?: string; wstep_en?: string; lata?: RokWpis[]; czasopisma_naglowek?: string; czasopisma_naglowek_en?: string;
  czasopisma?: Czasopismo[]; archiwum?: string; archiwum_en?: string;
}

export const dane = glowny as DanePublikacji;

const pliki = import.meta.glob<{ default: Wykaz }>('../../data/publikacje/*.json', { eager: true });
export const wykazy: Record<number, Wykaz> = {};
for (const m of Object.values(pliki)) if (m.default?.rok) wykazy[Number(m.default.rok)] = m.default;

export const liczbaPrac = (w?: Wykaz) => (w ? w.grupy.reduce((s, g) => s + (g.prace?.length ?? 0), 0) : 0);

// Liczby w banerze rocznika na telefonie (zlecenie 01): prace z co najmniej dwoma autorami w polu „autorzy”
// (nazwiska rozdzielone przecinkiem, średnikiem, „and”, „i” albo „&”) oraz różne tytuły z pola „źródło” — tekst do
// pierwszej cyfry, bez końcowych znaków przestankowych. To przybliżenie: warianty zapisu tego samego czasopisma liczą
// się osobno, a wykazy bez pola „źródło” (tylko „opis”) dają 0 — wtedy banerowi zostają dwie liczby.
const prace = (w?: Wykaz) => (w ? w.grupy.flatMap((g) => g.prace ?? []) : []);
export const liczbaWspolautorskich = (w?: Wykaz) =>
  prace(w).filter((p) => (p.autorzy ?? '').split(/,|;|&|\band\b|\bi\b/).filter((a) => a.trim()).length >= 2).length;
export const liczbaZrodel = (w?: Wykaz) =>
  new Set(prace(w).map((p) => (p.zrodlo ?? '').replace(/\d[\s\S]*$/, '').trim().replace(/[\s,.:;(–-]+$/, '').trim()).filter(Boolean)).size;

// Dane animacji w tle banera rocznika na telefonie (motyw „wspolautorzy”, zlecenie 03): wszyscy autorzy z wykazu
// (alfabetycznie, według nazwiska — bez inicjałów; nazwisk nie wysyłamy) i pary współautorów z prac wieloautorskich,
// każda para raz. Autorzy z pola „autorzy” jak w liczbaWspolautorskich (bez dopisków „[i in.]”, „et al.”); ten sam autor
// to ten sam zapis bez kropek, spacji i łączników. Wynik: { n: liczba autorów, p: [i, j, i, j, …] } — kilka setek liczb.
const autorzyPracy = (s?: string) =>
  (s ?? '').replace(/\[[^\]]*\]/g, ' ').replace(/\bet al\.?/gi, ' ').split(/,|;|&|\band\b|\bi\b/)
    .map((a) => a.replace(/\s+/g, ' ').trim()).filter((a) => /\p{L}{2}/u.test(a));
const kluczAutora = (a: string) => a.toLowerCase().replace(/[\s.\-‐‑]+/g, '');
const nazwisko = (a: string) => a.split(' ').filter((t) => !/^(\p{Lu}\p{Ll}?\.-?)+$/u.test(t)).join(' ') || a;
export function wspolautorzy(w?: Wykaz): { n: number; p: number[] } {
  const zapis = new Map<string, string>(), wielo: string[][] = [];
  for (const p of prace(w)) {
    const a = [...new Map(autorzyPracy(p.autorzy).map((x) => [kluczAutora(x), x])).entries()];
    a.forEach(([k, x]) => { if (!zapis.has(k)) zapis.set(k, x); });
    if (a.length >= 2) wielo.push(a.map(([k]) => k));
  }
  const kolejnosc = [...zapis.keys()].sort((a, b) => nazwisko(zapis.get(a)!).localeCompare(nazwisko(zapis.get(b)!), 'pl') || a.localeCompare(b));
  const nr = new Map(kolejnosc.map((k, i) => [k, i])), pary = new Set<number>(), n = kolejnosc.length, p: number[] = [];
  for (const a of wielo) {
    for (let i = 0; i < a.length; i++) {
      for (let j = i + 1; j < a.length; j++) {
        const x = nr.get(a[i])!, y = nr.get(a[j])!, k = Math.min(x, y) * n + Math.max(x, y);
        if (!pary.has(k)) { pary.add(k); p.push(Math.min(x, y), Math.max(x, y)); }
      }
    }
  }
  return { n, p };
}

export interface Rok extends RokWpis { wykaz?: Wykaz; liczba: number; pdf?: string }
// Lata z pliku CMS + lata, dla których jest tylko wykaz HTML; od najnowszego.
export function lata(): Rok[] {
  const mapa = new Map<number, Rok>();
  for (const r of dane.lata ?? []) {
    if (!r?.rok) continue;
    const rok = Number(r.rok);
    mapa.set(rok, { ...r, rok, wykaz: wykazy[rok], liczba: liczbaPrac(wykazy[rok]), pdf: r.plik || r.link || undefined });
  }
  for (const [rok, w] of Object.entries(wykazy)) {
    const n = Number(rok);
    if (!mapa.has(n)) mapa.set(n, { rok: n, wykaz: w, liczba: liczbaPrac(w) });
  }
  return [...mapa.values()].sort((a, b) => b.rok - a.rok);
}

// Odmiana: 1 pozycja, 2–4 pozycje, 5 pozycji (22 pozycje, 25 pozycji…).
export function odmiana(n: number, jeden: string, kilka: string, wiele: string): string {
  if (n === 1) return jeden;
  const d = n % 10, s = n % 100;
  return d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele;
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Zwykły tekst: bez HTML poza indeksami <sup>/<sub> (z konwersji PDF).
const zwykly = (t: string) => esc(t).replace(/&lt;(\/?)(sup|sub)&gt;/g, '<$1$2>');
// Wzory w $...$ (część dawnych wykazów) — KaTeX; gdy wzór jest niepoprawny, zostaje tekst źródłowy.
function zWzorami(t: string): string {
  return t
    .split(/(\$[^$]+\$)/g)
    .map((cz) => {
      if (cz.length > 2 && cz.startsWith('$') && cz.endsWith('$')) {
        try { return katex.renderToString(cz.slice(1, -1), { throwOnError: true }); } catch { return zwykly(cz); }
      }
      return zwykly(cz);
    })
    .join('');
}
const URL_RE = /https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/g;
// Tekst wpisu jako HTML; z `linki` adresy http(s) stają się odnośnikami — poza stronę z klasą zew i ukrytym dopiskiem
// jak w Link.astro (zlecenie 14, zalecenie 23).
export function tekstHtml(s: string | undefined, linki = false, lang: Lang = 'pl'): string {
  if (!s) return '';
  if (!linki) return zWzorami(s);
  let out = '';
  let last = 0;
  for (const m of s.matchAll(URL_RE)) {
    const url = m[0].replace(/[.,;:)]+$/, '');
    const i = m.index ?? 0;
    // Adres przerwany nietypowym znakiem (błąd w źródle, np. „…/→ms/…”) zostaje zwykłym tekstem.
    const dalej = s.charAt(i + m[0].length);
    if (dalej && !/\s/.test(dalej)) continue;
    const zew = isExternal(url) ? ` class="zew"` : '';
    const dopisek = zew ? `<span class="sr-only">${lang === 'en' ? ' (external site)' : ' (inna strona)'}</span>` : '';
    out += zWzorami(s.slice(last, i)) + `<a${zew} href="${esc(url)}">${esc(url)}${dopisek}</a>`;
    last = i + url.length;
  }
  return out + zWzorami(s.slice(last));
}

// Dane widoku src/views/Publikacje.astro: lata z wykazami, czasopisma, liczby i motyw banera.
export async function danePublikacji(lang: Lang) {
  const en = lang === 'en';
  const T = (pl: string, en_: string) => (en ? en_ : pl);

  const tytul = T('Publikacje', 'Publications');
  const lead = wybierz(dane as any, 'wstep', lang) || undefined;
  const wszystkie = lata();
  const zWykazem = wszystkie.filter((r) => r.wykaz);
  const suma = zWykazem.reduce((s, r) => s + r.liczba, 0);
  const najnowszy = wszystkie[0]?.rok;
  const najstarszy = wszystkie[wszystkie.length - 1]?.rok;
  const czasopisma = dane.czasopisma ?? [];
  const liczby = [
    ...(suma ? [{ n: suma.toLocaleString(en ? 'en-GB' : 'pl-PL'), l: T(`${odmiana(suma, 'pozycja', 'pozycje', 'pozycji')} w wykazach prac`, 'entries in the lists of publications') }] : []),
    ...(najnowszy ? [{ n: najnowszy === najstarszy ? String(najnowszy) : `${najstarszy}–${najnowszy}`, l: T('lata objęte wykazami', 'years covered') }] : []),
    ...(czasopisma.length ? [{ n: String(czasopisma.length), l: T(`${odmiana(czasopisma.length, 'czasopismo redagowane', 'czasopisma redagowane', 'czasopism redagowanych')} w Instytucie`, czasopisma.length === 1 ? 'journal edited at the Institute' : 'journals edited at the Institute') }] : []),
  ];
  // Telefon: hasło z danych działu (po angielsku tylko pole _en — bez polskich resztek) i trzy liczby w banerze.
  // Roczniki = lata z wykazem prac (HTML), zakres — od najstarszego do najnowszego z nich; suma jak na komputerze
  // (z separatorem tysięcy wg języka), dlatego jako gotowy napis z odmianą.
  const haslo = ((dzial as any)[en ? 'publikacje_haslo_en' : 'publikacje_haslo'] as string | undefined) || undefined;
  const lataWykazow = zWykazem.length ? (zWykazem.length === 1 ? String(zWykazem[0].rok) : `${zWykazem[zWykazem.length - 1].rok}–${zWykazem[0].rok}`) : '';
  const liczbyTelefon = [
    { n: suma ? suma.toLocaleString('pl-PL') : '', n_en: suma.toLocaleString('en-GB'), pl: `${odmiana(suma, 'pozycja', 'pozycje', 'pozycji')} w wykazach`, en: suma === 1 ? 'entry in the lists' : 'entries in the lists' },
    { n: zWykazem.length, pl: [`rocznik, ${lataWykazow}`, `roczniki, ${lataWykazow}`, `roczników, ${lataWykazow}`], en: [`year, ${lataWykazow}`, `years, ${lataWykazow}`] },
    // bez „w IM” — przy 360 px „redagowane w IM” nie mieści się w kolumnie i etykieta szłaby na trzy linijki
    { n: czasopisma.length, pl: ['czasopismo redagowane', 'czasopisma redagowane', 'czasopism redagowanych'], en: ['journal we edit', 'journals we edit'] },
  ] as ({ n: string; n_en?: string; pl: string; en?: string } | { n: number; pl: [string, string, string]; en: [string, string] })[];
  // Animacja w tle banera na telefonie (motyw „cytowania”): liczby prac w latach z wykazem, rosnąco — [rok, liczba, rok, …].
  const motywDane = { lata: [...zWykazem].reverse().flatMap((r) => [r.rok, r.liczba]) };
  const nagCzasopisma = wybierz(dane as any, 'czasopisma_naglowek', lang) || T('Czasopisma redagowane w Instytucie', 'Journals edited at the Institute');
  const archiwum = wybierz(dane as any, 'archiwum', lang);

  return { tytul, lead, wszystkie, najnowszy, czasopisma, liczby, haslo, liczbyTelefon, motywDane, nagCzasopisma, archiwum };
}
