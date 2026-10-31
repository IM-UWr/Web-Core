// Dane strony „Publikacje” (/nauka/publikacje):
// - src/data/publikacje.json — wstęp, lista lat (PDF), czasopisma (edycja w CMS),
// - src/data/publikacje/RRRR.json — wykaz prac danego roku w HTML (podstrona /nauka/publikacje/RRRR).
// Liczby prac liczą się z wykazów — nie wpisuje się ich ręcznie.
import katex from 'katex';
import glowny from '../data/publikacje.json';

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

const pliki = import.meta.glob<{ default: Wykaz }>('../data/publikacje/*.json', { eager: true });
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
// Tekst wpisu jako HTML; z `linki` adresy http(s) stają się odnośnikami.
export function tekstHtml(s: string | undefined, linki = false): string {
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
    out += zWzorami(s.slice(last, i)) + `<a href="${esc(url)}">${esc(url)}</a>`;
    last = i + url.length;
  }
  return out + zWzorami(s.slice(last));
}
