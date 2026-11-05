// Menu główne: dane z src/data/nawigacja.json + kierunki studiów wstawiane automatycznie
// (w grupie z "kierunki": true) z kolekcji src/content/kierunki — jedno miejsce edycji kierunku.
import { getCollection } from 'astro:content';
import nawigacja from '../data/nawigacja.json';
import { wybierz } from './i18n';
import { semestry } from './kolory-dni';
import type { Lang } from './daty';

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

/** Strona rekrutacji: pozycja menu bez grup z „Rekrutacja” / „Admission” w nazwie (dziś https://studia-wmi.uwr.edu.pl/).
 *  Pasek, panel hamburgera i przycisk na stronie działu Studia biorą adres i nazwę stąd. */
export async function rekrutacja(lang: Lang): Promise<{ adres: string; etykieta: string }> {
  const rek = (await menuGlowne()).find((p) => !p.grupy && p.adres && /rekrutac|admission/i.test(`${p.etykieta} ${p.etykieta_en ?? ''}`));
  return {
    adres: rek?.adres ?? 'https://studia-wmi.uwr.edu.pl/',
    etykieta: (rek && wybierz(rek, 'etykieta', lang)) || (lang === 'en' ? 'Admission' : 'Rekrutacja'),
  };
}

/** Rok akademicki najbliższej rekrutacji: następny po ostatnim roku w danych semestrów (src/data/kolory-dni.json),
 *  np. „Semestr letni 2026/27” → „2027/28”. Bez danych: undefined (przycisk bez roku). */
export function rokRekrutacji(): string | undefined {
  const lata = semestry()
    .map((s) => /(\d{4})\/(\d{2,4})/.exec(s.nazwa))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => Number(m[1]));
  if (!lata.length) return undefined;
  const r = Math.max(...lata) + 1;
  return `${r}/${String(r + 1).slice(-2)}`;
}
