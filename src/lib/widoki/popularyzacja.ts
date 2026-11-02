// Dane strony „Popularyzacja matematyki”: linki do partnerów, grupy inicjatyw z kotwicami, spis sekcji, tytuł, wstęp i hasło.
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import popularyzacja from '../../data/popularyzacja.json';

type Tekst = string | null | undefined;
type Pozycja = {
  nazwa: string; nazwa_en?: Tekst; opis?: Tekst; opis_en?: Tekst; dla?: Tekst; dla_en?: Tekst;
  adres?: Tekst; przycisk?: Tekst; przycisk_en?: Tekst; zdjecie?: Tekst; archiwalne?: boolean | null;
};
type Grupa = { nazwa: string; nazwa_en?: Tekst; opis?: Tekst; opis_en?: Tekst; pozycje?: Pozycja[] | null };
type Link = { nazwa: string; nazwa_en?: Tekst; adres?: Tekst };
type Dane = { tytul: string; tytul_en?: Tekst; wstep?: Tekst; wstep_en?: Tekst; haslo?: Tekst; haslo_en?: Tekst; linki?: Link[] | null; grupy?: Grupa[] | null };

// Pole obiektu w wybranym języku; używane też w szablonie widoku.
export const poleWJezyku = (lang: Lang) => (o: any, pole: string) => wybierz(o, pole, lang);

// Kotwica sekcji z polskiej nazwy grupy (ta sama w obu wersjach językowych).
const slug = (s: string) =>
  s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'grupa';

export async function danePopularyzacji(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const w = poleWJezyku(lang);
  const d = popularyzacja as Dane;

  const linki = (d.linki ?? [])
    .filter((l) => l && l.nazwa && (l.adres ?? '').trim())
    .map((l) => ({ ...l, adres: (l.adres ?? '').trim() }));
  // Grupy bez kart zostają na stronie (nagłówek + „To be announced”).
  const grupy = (d.grupy ?? [])
    .filter((g) => g && g.nazwa)
    .map((g) => ({ ...g, slug: slug(g.nazwa), pozycje: (g.pozycje ?? []).filter((p) => p && p.nazwa) }));
  const sekcje = grupy.map((g) => ({ depth: 2, slug: g.slug, text: w(g, 'nazwa') }));
  const tytul = w(d, 'tytul') || T('Popularyzacja matematyki', 'Mathematics outreach');
  const lead = w(d, 'wstep');
  // Hasło na telefonie zamiast opisu (NaglowekStrony.astro; decyzja 31.10.2026). Opis zostaje na komputerze i w <meta description>.
  const haslo = w(d, 'haslo');

  return { linki, grupy, sekcje, tytul, lead, haslo };
}
