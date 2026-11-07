// Kierunki studiów (zlecenie 28): treść (kolekcja kierunki: nazwa i jeden Markdown PL/EN), baner (kolekcja kierunki_baner,
// ten sam id) i jedna lista menu „Studia” i kafelków strony głównej w Ustawieniach (studia.kierunki; kolejność = kolejność
// na liście). Kierunek spoza listy pojawia się sam na końcu menu i kafelków: pełna nazwa, poziom „Kierunek” / „Programme”
// i zdanie z banera (bez banera — pierwsze zdanie treści). Pozycja listy bez pliku kierunku (np. studia podyplomowe) to zwykły
// link albo kafelek.
import { getCollection, type CollectionEntry } from 'astro:content';
import ustawienia from '../data/ustawienia.json';

export type Kierunek = CollectionEntry<'kierunki'>;
export type BanerKierunku = CollectionEntry<'kierunki_baner'>['data'];
// opis — zdanie w kafelku na stronie głównej; opis_menu — opis pod nazwą w menu (puste: pełna nazwa, gdy w menu jest skrót)
export type PozycjaKierunku = {
  adres: string; nazwa?: string; nazwa_en?: string; poziom?: string; poziom_en?: string; opis?: string; opis_en?: string;
  opis_menu?: string; opis_menu_en?: string; w_menu?: boolean; na_stronie_glownej?: boolean; kierunek?: Kierunek;
};

export const adresKierunku = (id: string) => `/studia/${id}`;
const bezKonca = (a: string) => a.replace(/#.*$/, '').replace(/\/+$/, '');
const pozycjeUstawien = (): PozycjaKierunku[] =>
  (((ustawienia as any).studia?.kierunki ?? []) as PozycjaKierunku[]).filter((p) => p && typeof p.adres === 'string' && p.adres.trim());

/** Opublikowane kierunki w kolejności listy w Ustawieniach; spoza listy na końcu, alfabetycznie. */
export async function listaKierunkow(): Promise<Kierunek[]> {
  const kolej = pozycjeUstawien().map((p) => bezKonca(p.adres));
  const miejsce = (k: Kierunek) => { const i = kolej.indexOf(adresKierunku(k.id)); return i < 0 ? Infinity : i; };
  return (await getCollection('kierunki'))
    .filter((k) => k.data.opublikowany !== false)
    .sort((a, b) => miejsce(a) - miejsce(b) || a.data.nazwa.localeCompare(b.data.nazwa, 'pl'));
}

export async function banerKierunku(id: string): Promise<BanerKierunku | undefined> {
  return (await getCollection('kierunki_baner')).find((b) => b.id === id)?.data;
}

/** Pierwsze zdanie pierwszego akapitu Markdownu (bez nagłówków, list i tabel), bez znaczników. */
export function pierwszeZdanie(md?: string): string {
  for (const blok of (md ?? '').split(/\n\s*\n/)) {
    const t = blok.trim();
    if (!t || /^(#|[-*+]\s|\d+[.)]\s|\||>|```|!\[)/.test(t)) continue;
    const czysty = t.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`\\]+/g, '').replace(/\s+/g, ' ').trim();
    if (!czysty) continue;
    return (/^.*?[.!?…](?=\s+[A-ZĄĆĘŁŃÓŚŹŻ„"(]|$)/.exec(czysty)?.[0] ?? czysty).trim();
  }
  return '';
}

/** Pozycje menu „Studia” i kafelków: lista z Ustawień (z plikiem kierunku, jeśli adres to /studia/<id>), potem kierunki spoza listy. */
export async function pozycjeKierunkow(): Promise<PozycjaKierunku[]> {
  const kierunki = await listaKierunkow();
  const lista = pozycjeUstawien().map((p) => ({ ...p, kierunek: kierunki.find((k) => adresKierunku(k.id) === bezKonca(p.adres)) }));
  const spoza = await Promise.all(kierunki.filter((k) => !lista.some((p) => p.kierunek === k)).map(async (k) => {
    const b = await banerKierunku(k.id);
    return {
      adres: adresKierunku(k.id), nazwa: k.data.nazwa, nazwa_en: k.data.nazwa_en, poziom: 'Kierunek', poziom_en: 'Programme',
      opis: b?.opis || pierwszeZdanie(k.body), opis_en: b?.opis_en || pierwszeZdanie(k.data.tresc_en) || undefined, kierunek: k,
    };
  }));
  return [...lista, ...spoza];
}

// Szkoła doktorska (kierunek „szkola-doktorska”): III stopień, nie liczy się do kierunków studiów na stronie „Studia”.
export const jestSzkolaDoktorska = (k: Kierunek) => k.id === 'szkola-doktorska' || /doktorsk/i.test(k.data.nazwa);

/** Stopnie studiów kierunku (do liczby „stopnie studiów” na stronie „Studia”): z nadtytułu banera i treści („I i II stopnia”). */
export async function stopnieKierunku(k: Kierunek): Promise<string[]> {
  if (jestSzkolaDoktorska(k)) return ['III'];
  const tekst = `${(await banerKierunku(k.id))?.podtytul ?? ''}\n${k.body ?? ''}`;
  const s = new Set<string>();
  for (const m of tekst.matchAll(/\b(I{1,3}(?:\s*(?:,|i|oraz)\s*I{1,3})*)\s+stopni/g)) for (const x of m[1].match(/I{1,3}/g) ?? []) s.add(x);
  return [...s];
}
