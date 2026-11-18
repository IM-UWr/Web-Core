// Kierunki studiów (zlecenie 28): treść (kolekcja kierunki: nazwa i jeden Markdown PL/EN), baner (kolekcja kierunki_baner,
// ten sam id) i jedna lista menu „Studia” i kafelków strony głównej w Ustawieniach (studia.kierunki; kolejność = kolejność
// na liście). Zlecenie 39: menu i kafelki pokazują tylko pozycje z listy, dokładnie z tym, co na niej wpisano (bez wartości
// zastępczych z pliku kierunku). Kierunek spoza listy ma swoją stronę, ale nie ma go w menu, w kafelkach ani w liczbach na stronie
// „Studia”; budowa wypisuje wtedy ostrzeżenie. Pozycja listy bez pliku kierunku to zwykły link albo kafelek.
import { getCollection, type CollectionEntry } from 'astro:content';
import ustawienia from '../data/ustawienia.json';
import { widoczny, TYLKO_OPUBLIKOWANE } from './tresci';
import { adresySzkicow } from './szkice';

export type Kierunek = CollectionEntry<'kierunki'>;
export type BanerKierunku = CollectionEntry<'kierunki_baner'>['data'];
// nazwa, poziom, opis — kafelek na stronie głównej (nazwa, napis nad nią, zdanie); nazwa_menu, opis_menu — menu „Studia”
// (nazwa i krótki opis pod nią). Pola _en: wersja angielska (puste = polska, jak wszędzie na stronie).
export type PozycjaKierunku = {
  adres: string; nazwa?: string; nazwa_en?: string; poziom?: string; poziom_en?: string; opis?: string; opis_en?: string;
  nazwa_menu?: string; nazwa_menu_en?: string; opis_menu?: string; opis_menu_en?: string; w_menu?: boolean;
  na_stronie_glownej?: boolean; kierunek?: Kierunek;
};

export const adresKierunku = (id: string) => `/studia/${id}`;
const bezKonca = (a: string) => a.replace(/#.*$/, '').replace(/\/+$/, '');
const pozycjeUstawien = (): PozycjaKierunku[] =>
  (((ustawienia as any).studia?.kierunki ?? []) as PozycjaKierunku[]).filter((p) => p && typeof p.adres === 'string' && p.adres.trim());

/** Widoczne kierunki z pliku kierunku (zlecenie 33: na Podglądzie także szkice, przy fladze TYLKO_OPUBLIKOWANE tylko opublikowane). */
const widoczne = async (): Promise<Kierunek[]> => (await getCollection('kierunki')).filter(widoczny);
/** Pozycje listy bez tych, które przy fladze prowadzą do strony-szkicu (tej strony wtedy nie ma). */
const pozycjeBezSzkicow = async (): Promise<PozycjaKierunku[]> => {
  const szkice = TYLKO_OPUBLIKOWANE ? await adresySzkicow() : undefined;
  return pozycjeUstawien().filter((p) => !szkice?.has(bezKonca(p.adres)));
};

/** Widoczne kierunki z listy w Ustawieniach, w jej kolejności (liczby na stronie „Studia”; kierunek spoza listy się nie liczy). */
export async function listaKierunkow(): Promise<Kierunek[]> {
  const kierunki = await widoczne();
  return (await pozycjeBezSzkicow()).map((p) => kierunki.find((k) => adresKierunku(k.id) === bezKonca(p.adres))).filter((k): k is Kierunek => !!k);
}

export async function banerKierunku(id: string): Promise<BanerKierunku | undefined> {
  const page = (await getCollection('kierunki')).find((k) => k.id === id);
  return page?.data.baner ?? (await getCollection('kierunki_baner')).find((b) => b.id === id)?.data;
}

/** Pierwsze zdanie pierwszego akapitu Markdownu (bez nagłówków, list i tabel), bez znaczników. */
export function pierwszeZdanie(md?: string): string {
  for (const blok of (md ?? '').split(/\n\s*\n/)) {
    const t = blok.trim();
    if (!t || /^(<!--|:::|#|[-*+]\s|\d+[.)]\s|\||>|```|!\[)/.test(t)) continue;
    const czysty = t.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`\\]+/g, '').replace(/\s+/g, ' ').trim();
    if (!czysty) continue;
    return (/^.*?[.!?…](?=\s+[A-ZĄĆĘŁŃÓŚŹŻ„"(]|$)/.exec(czysty)?.[0] ?? czysty).trim();
  }
  return '';
}

let ostrzezone = false;
/** Pozycje menu „Studia” i kafelków: tylko lista z Ustawień, w jej kolejności (z plikiem kierunku, jeśli adres to /studia/<id>). */
export async function pozycjeKierunkow(): Promise<PozycjaKierunku[]> {
  const kierunki = await widoczne();
  const lista = (await pozycjeBezSzkicow()).map((p) => ({ ...p, kierunek: kierunki.find((k) => adresKierunku(k.id) === bezKonca(p.adres)) }));
  if (!ostrzezone) {
    ostrzezone = true;
    for (const k of kierunki.filter((k) => !lista.some((p) => p.kierunek === k))) {
      console.warn(`[kierunki] Kierunek ${k.data.nazwa} nie jest na liście w Ustawieniach — nie ma go w menu ani w kafelkach (${adresKierunku(k.id)}; nie liczy się też w liczbach na stronie „Studia”)`);
    }
  }
  return lista;
}

// Szkoła doktorska (kierunek „szkola-doktorska”): III stopień, nie liczy się do kierunków studiów na stronie „Studia”.
export const jestSzkolaDoktorska = (k: Kierunek) => k.id === 'szkola-doktorska' || /doktorsk/i.test(k.data.nazwa);
// Studia podyplomowe (kierunek „podyplomowe”, zlecenie 39): też nie liczą się do kierunków ani stopni studiów na stronie „Studia”.
export const jestPodyplomowe = (k: Kierunek) => k.id === 'podyplomowe' || /podyplomow/i.test(k.data.nazwa);

/** Stopnie studiów kierunku (do liczby „stopnie studiów” na stronie „Studia”): z nadtytułu banera i treści („I i II stopnia”). */
export async function stopnieKierunku(k: Kierunek): Promise<string[]> {
  if (jestSzkolaDoktorska(k)) return ['III'];
  if (jestPodyplomowe(k)) return [];
  const tekst = `${(await banerKierunku(k.id))?.podtytul ?? ''}\n${k.body ?? ''}`;
  const s = new Set<string>();
  for (const m of tekst.matchAll(/\b(I{1,3}(?:\s*(?:,|i|oraz)\s*I{1,3})*)\s+stopni/g)) for (const x of m[1].match(/I{1,3}/g) ?? []) s.add(x);
  return [...s];
}
