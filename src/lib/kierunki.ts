// Dane kierunków i statystyki są niezależne od ręcznego menu oraz kafelków.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Kierunek = CollectionEntry<'kierunki'>;
export type BanerKierunku = CollectionEntry<'kierunki_baner'>['data'];
export const adresKierunku = (id: string) => `/studia/${id}`;

/** Rzeczywiste opublikowane kierunki do statystyk, niezależnie od pozycji menu. */
export async function listaKierunkow(): Promise<Kierunek[]> {
  return (await getCollection('kierunki')).filter((k) => k.data.opublikowany !== false)
    .sort((a, b) => a.data.nazwa.localeCompare(b.data.nazwa, 'pl'));
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
