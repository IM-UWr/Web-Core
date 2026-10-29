// Menu główne: dane z src/data/nawigacja.json + kierunki studiów wstawiane automatycznie
// (w grupie z "kierunki": true) z kolekcji src/content/kierunki — jedno miejsce edycji kierunku.
import { getCollection } from 'astro:content';
import nawigacja from '../data/nawigacja.json';

export type Link = { etykieta: string; etykieta_en?: string; adres: string };
export type Grupa = { nazwa: string; nazwa_en?: string; kierunki?: boolean; linki: Link[] };
export type Pozycja = { etykieta: string; etykieta_en?: string; adres?: string; grupy?: Grupa[] };

/** Kierunki w kolejności (pole „kolejność”), tylko opublikowane. */
export async function listaKierunkow() {
  return (await getCollection('kierunki'))
    .filter((k) => k.data.opublikowany !== false)
    .sort((a, b) => a.data.kolejnosc - b.data.kolejnosc || a.data.nazwa.localeCompare(b.data.nazwa, 'pl'));
}

let pamiec: Pozycja[] | undefined;

export async function menuGlowne(): Promise<Pozycja[]> {
  if (pamiec) return pamiec;
  const kierunki: Link[] = (await listaKierunkow())
    .filter((k) => k.data.w_menu)
    .map((k) => ({
      etykieta: k.data.menu_etykieta || k.data.nazwa,
      etykieta_en: k.data.menu_etykieta_en || k.data.nazwa_en || k.data.menu_etykieta || k.data.nazwa,
      adres: `/studia/${k.id}`,
    }));
  pamiec = (nawigacja.menu as Pozycja[]).map((m) => ({
    ...m,
    grupy: m.grupy?.map((g) => (g.kierunki ? { ...g, linki: [...kierunki, ...g.linki.filter((l) => !kierunki.some((k) => k.adres === l.adres))] } : g)),
  }));
  return pamiec;
}
