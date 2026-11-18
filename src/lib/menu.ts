// Menu główne: dane z src/data/nawigacja.json + kierunki studiów z listy w Ustawieniach (studia.kierunki), wstawiane na początek
// grupy z "kierunki": true. Tylko pozycje z listy, z nazwą i opisem wpisanymi na liście (zlecenie 39, src/lib/kierunki.ts).
import nawigacja from '../data/nawigacja.json';
import { pozycjeKierunkow } from './kierunki';
import { szkice, adresDoPorownania } from './szkice';
import { TYLKO_OPUBLIKOWANE } from './tresci';
import { wybierz } from './i18n';
import { isExternal } from './url';
import { semestry } from './kolory-dni';
import type { Lang } from './daty';

// opis, opis_en: krótki opis pod nazwą w pasie działu na komputerze (zlecenie 20, punkt 2); pusty = bez opisu
export type Link = { etykieta: string; etykieta_en?: string; opis?: string; opis_en?: string; adres: string };
export type Grupa = { nazwa: string; nazwa_en?: string; opis?: string; opis_en?: string; kierunki?: boolean; linki: Link[] };
export type Pozycja = { etykieta: string; etykieta_en?: string; adres?: string; grupy?: Grupa[] };

/** Ścieżka strony bez przedrostka języka i końcowego ukośnika (strona główna: „/”). */
export const sciezkaBezJezyka = (sciezka: string): string => sciezka.replace(/^\/en(?=\/|$)/, '').replace(/\/$/, '') || '/';

/** Czy pozycja menu prowadzi na tę stronę albo jest jej stroną nadrzędną (ścieżka z sciezkaBezJezyka; adres bez kotwicy). */
export const pasujeDoSciezki = (sciezka: string, adres: string): boolean => {
  const a = adres.replace(/#.*$/, '').replace(/\/$/, '');
  return !isExternal(adres) && !!a && (sciezka === a || sciezka.startsWith(`${a}/`));
};

export { listaKierunkow } from './kierunki';

let pamiec: Pozycja[] | undefined;

export async function menuGlowne(): Promise<Pozycja[]> {
  if (pamiec) return pamiec;
  const kierunki: Link[] = (await pozycjeKierunkow())
    .filter((p) => p.w_menu !== false)
    .map((p) => ({
      etykieta: p.nazwa_menu ?? '',
      etykieta_en: p.nazwa_menu_en || p.nazwa_menu,
      opis: p.opis_menu || undefined,
      opis_en: p.opis_menu_en || undefined,
      adres: p.adres,
    }));
  // Zlecenie 33: przy fladze TYLKO_OPUBLIKOWANE link do strony-szkicu znika z menu (tej strony wtedy nie ma). Na Podglądzie zostaje,
  // a etykietę „szkic” dopisuje src/middleware.ts.
  const sz = TYLKO_OPUBLIKOWANE ? await szkice() : undefined;
  const bezSzkicow = (linki: Link[]) => (sz?.size ? linki.filter((l) => !sz.has(adresDoPorownania(l.adres))) : linki);
  pamiec = (nawigacja.menu as Pozycja[]).map((m) => ({
    ...m,
    grupy: m.grupy?.map((g) => ({ ...g, linki: bezSzkicow(g.kierunki ? [...kierunki, ...g.linki.filter((l) => !kierunki.some((k) => k.adres === l.adres))] : g.linki) })),
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
