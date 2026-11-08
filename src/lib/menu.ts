// Ręczne menu i kafelki: jedyne źródło to src/data/nawigacja.json.
import nawigacja from '../data/nawigacja.json';
import { widoczneMenu, kafelkiMenu, pozycjaRekrutacji } from './nawigacja.mjs';
import { wybierz } from './i18n';
import { isExternal } from './url';
import { semestry } from './kolory-dni';
import type { Lang } from './daty';

// opis, opis_en: krótki opis pod nazwą w pasie działu na komputerze (zlecenie 20, punkt 2); pusty = bez opisu
export type Link = { etykieta: string; etykieta_en?: string; opis?: string; opis_en?: string; adres: string; w_menu?: boolean; na_stronie_glownej?: boolean; kafelek_nazwa?: string; kafelek_nazwa_en?: string; kafelek_poziom?: string; kafelek_poziom_en?: string; kafelek_opis?: string; kafelek_opis_en?: string };
export type Grupa = { nazwa: string; nazwa_en?: string; opis?: string; opis_en?: string; w_menu?: boolean; linki: Link[] };
export type Pozycja = { etykieta: string; etykieta_en?: string; adres: string; w_menu?: boolean; w_pasku?: boolean; rekrutacja?: boolean; grupy?: Grupa[] };

/** Ścieżka strony bez przedrostka języka i końcowego ukośnika (strona główna: „/”). */
export const sciezkaBezJezyka = (sciezka: string): string => sciezka.replace(/^\/en(?=\/|$)/, '').replace(/\/$/, '') || '/';

/** Czy pozycja menu prowadzi na tę stronę albo jest jej stroną nadrzędną (ścieżka z sciezkaBezJezyka; adres bez kotwicy). */
export const pasujeDoSciezki = (sciezka: string, adres: string): boolean => {
  const a = adres.replace(/#.*$/, '').replace(/\/$/, '');
  return !isExternal(adres) && !!a && (sciezka === a || sciezka.startsWith(`${a}/`));
};

/** Zachowuje dokładnie kolejność redaktora; nie pobiera kolekcji treści. */
export async function menuGlowne(): Promise<Pozycja[]> {
  return widoczneMenu(nawigacja.menu) as Pozycja[];
}

export const kafelkiStudiow = () => kafelkiMenu(nawigacja.menu);

/** Jeden adres rekrutacji dla menu i przycisków studiów, bez automatycznego linku. */
export async function rekrutacja(lang: Lang): Promise<{ adres: string; etykieta: string } | undefined> {
  const rek = pozycjaRekrutacji(nawigacja.menu);
  return rek ? { adres: rek.adres, etykieta: wybierz(rek, 'etykieta', lang) } : undefined;
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
