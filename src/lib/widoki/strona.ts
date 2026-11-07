// Dane strony stałej: tytuł, opis, hasło i liczby banera, treść ze spisem nagłówków, dział menu, strona nadrzędna, prawy pasek.
import { dzialZeSciezki } from '../patroni';
import { render, type CollectionEntry } from 'astro:content';
import { menuGlowne } from '../menu';
import { isExternal } from '../url';
import { renderMarkdownZNaglowkami } from '../markdown';
import type { Lang } from '../daty';

type Link = { etykieta: string; etykieta_en?: string; adres: string };

// Wygląd na komputerze (≥ 1024 px): strony działów „Instytut” i „Studia” (adres /instytut/… lub /studia/…; `adres` to id pliku,
// więc obejmuje też wersje angielskie /en/instytut/…, /en/studia/…) — np. kontakt, infrastruktura informatyczna z podstronami,
// pierwszy rok, egzaminy i dyplom, sprawy studenckie, podstrony szkoły doktorskiej — mają baner jak w wariancie „Portal”
// i treść jak w wariancie „Zwarta”, tak jak strony tych działów i ich pozostałe podstrony. Strony innych działów z tego
// widoku — bez zmian (bez propu `uklad`). Telefon (≤ 1023 px) bez zmian na wszystkich stronach. Popularyzacja: zlecenie 15.
const DZIALY_PORTAL_ZWARTA = ['/instytut/', '/studia/', '/popularyzacja/'];

export async function daneStrony(strona: CollectionEntry<'strony'>, lang: Lang) {
  const d = strona.data;
  const tytul = (lang === 'en' && d.tytul_en) || d.tytul;
  const opis = (lang === 'en' && d.opis_en) || d.opis;
  // Baner na telefonie (zlecenie 01): hasło z pól haslo / haslo_en (po angielsku tylko haslo_en — bez polskich resztek;
  // puste = opis jak dotąd) i stałe liczby z pola „liczby” (wartość + etykieta; po angielsku tylko pozycje z etykieta_en).
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo) || undefined;
  const liczby = d.liczby
    .filter((l) => lang !== 'en' || l.etykieta_en)
    .map((l) => ({ n: l.n, n_en: l.n_en, pl: l.etykieta, en: l.etykieta_en }));
  const { Content, headings } = await render(strona);
  const en = lang === 'en' && d.tresc_en ? await renderMarkdownZNaglowkami(d.tresc_en, lang, d.bloki === true) : undefined;
  const htmlEn = en?.html ?? '';
  const naglowki = en ? en.naglowki : headings;
  const tylkoPolski = lang === 'en' && !d.tresc_en;

  // Dział menu, do którego należy strona — do okruszków i bocznej nawigacji.
  const adres = '/' + strona.id;
  // Podstrona (np. /instytut/infrastruktura-informatyczna/regulamin-sieci) należy do działu swojej strony nadrzędnej.
  const wDziale = (l: Link) => l.adres === adres || adres.startsWith(l.adres + '/');
  const menu = (await menuGlowne()) as any[];
  // Organizatorzy Popularyzacji nie ma w menu (decyzja 5.11, 11:36), ale to strona działu: okruszki i powrót jak na pozostałych.
  const dzial = menu.find((m) => (m.grupy ?? []).some((g: any) => g.linki.some(wDziale)))
    ?? (adres.startsWith('/popularyzacja/') ? menu.find((m) => m.adres === '/popularyzacja') : undefined);
  const linkiDzialu: Link[] = dzial ? dzial.grupy.flatMap((g: any) => g.linki) : [];
  const rodzic = linkiDzialu.filter((l) => !isExternal(l.adres) && adres.startsWith(l.adres + '/')).sort((x, y) => y.adres.length - x.adres.length)[0];
  // Prawy pasek: domyślnie tylko spis „Na tej stronie”, bez menu działu (decyzja właściciela); pole „Prawy pasek” w CMS może to zmienić dla strony.
  const pasek = d.pasek_boczny ?? 'spis';
  const wygladPortalZwarta = DZIALY_PORTAL_ZWARTA.some((p) => adres.startsWith(p));

  // komputer (kierunek „Założyciele”): dział strony (boczna nawigacja) i spis „Na tej stronie” z nagłówków drugiego stopnia
  const dzialZ = dzialZeSciezki('/' + strona.id.replace(/\.md$/, ''));
  const spisZ = naglowki.filter((h: { depth: number }) => h.depth === 2).map((h: { slug: string; text: string }) => ({ id: h.slug, etykieta: h.text }));
  return { d, tytul, opis, haslo, liczby, Content, htmlEn, naglowki, tylkoPolski, adres, dzial, linkiDzialu, rodzic, pasek, wygladPortalZwarta, dzialZ, spisZ };
}
