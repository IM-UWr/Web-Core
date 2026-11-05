// Ciekawostki patronów w nagłówkach podstron działu (zlecenie 11, zalecenie 19).
// Dane: src/data/ciekawostki/<dział>.json (opis pól w README.md obok). Losowanie na wizytę robi skrypt w linii w nagłówku
// (NaglowekZ.astro), zanim strona się narysuje; tu: pula do losowania, strony działu i ciekawostka stała (bez JS).
import instytut from '../data/ciekawostki/instytut.json';
import nauka from '../data/ciekawostki/nauka.json';
import studia from '../data/ciekawostki/studia.json';
import popularyzacja from '../data/ciekawostki/popularyzacja.json';
import type { Dzial, Kreska } from './patroni';
import type { Lang } from './daty';
import type { Pozycja } from './menu';

export interface Ciekawostka {
  id: string;
  nazwa: string; nazwa_en?: string;
  rok: string; rok_en?: string;
  zdanie: string; zdanie_en?: string;
  sciezki: Kreska[];
  // przypieta — zawsze na swojej stronie (`strona`, adres bez /en, np. "/instytut/wladze"); ulubiona — waga 3; odpada — poza losowaniem
  stan?: 'przypieta' | 'ulubiona' | 'odpada';
  strona?: string;
  // poza losowaniem do czasu zgody albo innego źródła
  ukryta?: boolean;
  // tylko do przeglądu (nie wchodzą do losowania): notka, rodzaj, pewnosc, zrodla, podstrona, dlaczego_tu, przypiecie
  [inne: string]: unknown;
}

const PULE: Record<Dzial, Ciekawostka[]> = { instytut, nauka, studia, popularyzacja } as unknown as Record<Dzial, Ciekawostka[]>;

const bezUkosnika = (s: string) => s.replace(/\/$/, '') || '/';

/** Ciekawostki biorące udział w losowaniu (bez ukrytych i odpadających), w kolejności danych. */
export const pulaDzialu = (dzial: Dzial): Ciekawostka[] => PULE[dzial].filter((c) => !c.ukryta && c.stan !== 'odpada');

/** Podstrony działu z menu (adresy bez /en): linki wewnętrzne pozycji działu, których adres należy do działu
 *  (poza tym: strony zewnętrzne, a także np. Szkoła doktorska w menu Nauki — należy do Studiów, jak CK_POZA w prototypie). */
export function stronyDzialu(menu: Pozycja[], adresDzialu: string, nalezy: (adres: string) => boolean): string[] {
  const poz = menu.find((m) => m.adres === adresDzialu);
  const out: string[] = [];
  for (const g of poz?.grupy ?? []) for (const l of g.linki) {
    const a = bezUkosnika(l.adres);
    if (a.startsWith('/') && a !== adresDzialu && nalezy(a) && !out.includes(a)) out.push(a);
  }
  return out;
}

/** Układ stały (bez JS albo bez sessionStorage): przypięte na swoich stronach, reszta stron po kolei dostaje kolejne
 *  ciekawostki z puli w kolejności danych (bez powtórzeń, póki starczy puli). */
export function ukladStaly(pula: Ciekawostka[], strony: string[]): Record<string, string> {
  const uklad: Record<string, string> = {};
  const uzyte = new Set<string>();
  for (const c of pula) if (c.stan === 'przypieta' && c.strona && strony.includes(bezUkosnika(c.strona)) && !uklad[bezUkosnika(c.strona)]) {
    uklad[bezUkosnika(c.strona)] = c.id; uzyte.add(c.id);
  }
  const wolne = pula.filter((c) => !uzyte.has(c.id));
  let i = 0;
  for (const s of strony) if (!uklad[s] && pula.length) uklad[s] = (wolne.length ? wolne[i++ % wolne.length] : pula[0]).id;
  return uklad;
}

export const tytulCiekawostki = (c: Ciekawostka, lang: Lang): string =>
  `${(lang === 'en' && c.nazwa_en) || c.nazwa}, ${(lang === 'en' && c.rok_en) || c.rok}`;
export const zdanieCiekawostki = (c: Ciekawostka, lang: Lang): string => (lang === 'en' && c.zdanie_en) || c.zdanie;

// Ścieżki do skryptu w linii: liczby zaokrąglone do 0,1 (rysunek 200×240, znak najwyżej 200 px), bez zbędnych spacji.
const liczba = (m: string) => {
  let s = (Math.round(Number(m) * 10) / 10).toString();
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
export const kompaktD = (d: string): string =>
  d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, liczba).replace(/\s*([A-Za-z])\s*/g, '$1').replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').replace(/ (?=-)/g, '').trim();

/** Dane dla skryptu w linii: strony działu, przypięte, pula [id, tytuł, zdanie, waga, ścieżki [d, gruba?]]. */
export function pulaDoSkryptu(pula: Ciekawostka[], strony: string[], lang: Lang) {
  const p: Record<string, string> = {};
  for (const c of pula) if (c.stan === 'przypieta' && c.strona && strony.includes(bezUkosnika(c.strona))) p[bezUkosnika(c.strona)] ??= c.id;
  return {
    s: strony,
    p,
    c: pula.map((c) => [c.id, tytulCiekawostki(c, lang), zdanieCiekawostki(c, lang), c.stan === 'ulubiona' ? 3 : 1,
      c.sciezki.map((k) => (k.gruba ? [kompaktD(k.d), 1] : [kompaktD(k.d)]))]),
  };
}
