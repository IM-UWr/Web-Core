// Dane strony kierunku studiów (Kierunek.astro), zlecenie 28: treść z jednego Markdownu (body / tresc_en; sekcje po ##,
// bloki z tekstu — src/plugins/rehype-bloki.mjs), baner z kolekcji kierunki_baner i kafelki specjalności z ich formularzy „Baner i kafelek”.
import type { CollectionEntry } from 'astro:content';
import { zTytulem } from '../osoby';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { renderKierunku } from '../markdown';
import { zaklady, pracownicy } from '../tresci';
import { banerKierunku, pierwszeZdanie } from '../kierunki';
import { specjalnosci as wszystkieSpecjalnosci } from '../specjalnosci';

export async function daneKierunku(kierunek: CollectionEntry<'kierunki'>, lang: Lang) {
  const d = kierunek.data;
  const w = (o: any, pole: string) => wybierz(o, pole, lang);
  const nazwyZakladow = Object.fromEntries((await zaklady()).map((z) => [z.id, z]));
  // Kafelki specjalności budują się z formularza „Baner i kafelek” specjalności (src/lib/specjalnosci.ts) — jedno miejsce edycji.
  const osoby = await pracownicy();
  const zTytulemZeSpisu = (n: string) => {
    const kand = osoby.filter((p) => p.data.imie_nazwisko === n.trim());
    const o = kand.find((p) => p.data.grupa === 'nauczyciel') ?? kand.find((p) => p.data.grupa !== 'administracja') ?? kand[0];
    return zTytulem(o?.data.stopien, n, lang);
  };
  const specjalnosci = (await wszystkieSpecjalnosci())
    .filter((s) => s.data.kierunek === kierunek.id && s.data.opublikowany !== false && s.data.na_stronie_kierunku)
    .sort((a, b) => Number(a.data.wygaszana) - Number(b.data.wygaszana) || a.data.kolejnosc - b.data.kolejnosc || a.data.nazwa.localeCompare(b.data.nazwa, 'pl'))
    .map((s) => ({
      ...s.data,
      strona: s.data.bez_podstrony ? undefined : s.id,
      opiekunowie: s.data.opiekunowie.map((o) => zTytulemZeSpisu(o.imie_nazwisko)).join(', '),
      dla_kogo: s.data.kafelek_dla_kogo,
      dla_kogo_en: s.data.kafelek_dla_kogo_en,
      kariera: s.data.kafelek_kariera,
      kariera_en: s.data.kafelek_kariera_en,
    }));

  // Treść: po angielsku tresc_en; pusta — treść polska (sekcje z lang="pl", linki wewnętrzne z /en).
  const polski = lang === 'en' && !d.tresc_en?.trim();
  const zrodlo = lang === 'en' && !polski ? d.tresc_en : kierunek.body;
  const { html, sekcje } = await renderKierunku(zrodlo, lang, { specjalnosci: specjalnosci.length > 0, polski });
  // miejsce na kafelki specjalności (komentarz z wtyczki na końcu sekcji „Specjalności”)
  const [przed, po = ''] = html.split('<!--specjalnosci-->');

  // Baner: opis (lead i opis strony), hasło na telefonie i liczby (fakty); nadtytuł (podtytul) — do stopni na stronie „Studia”.
  // Bez banera sama nazwa, a opis strony (meta) z pierwszego zdania treści.
  const baner = await banerKierunku(kierunek.id);
  const opis = (baner && w(baner, 'opis')) || pierwszeZdanie(zrodlo) || undefined;
  const lead = baner?.opis ? w(baner, 'opis') : undefined;
  const haslo = (lang === 'en' ? baner?.haslo_en : baner?.haslo) || undefined;
  const liczby = (baner?.liczby ?? []).map((f) => ({ wartosc: w(f, 'wartosc'), etykieta: w(f, 'etykieta') }));

  return { nazwa: w(d, 'nazwa'), przed, po, sekcje, specjalnosci, nazwyZakladow, opis, lead, haslo, liczby };
}
