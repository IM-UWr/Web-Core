// Adresy stron-szkiców (zlecenie 33): wpisy z „opublikowany: false”, które mają własną stronę, i strony działów-szkice.
// Na Podglądzie src/middleware.ts dopisuje „szkic” / „draft” przy każdym linku do nich (menu, listy, kafelki, treść).
// Przy fladze TYLKO_OPUBLIKOWANE stron-szkiców nie ma: menu (menu.ts) i lista kierunków (kierunki.ts) pomijają linki do nich,
// a pozostałe linki (np. w treści) middleware zamienia na sam tekst. Strona działu zostaje i przy fladze (bez tekstu z pliku),
// więc jej adres jest w zbiorze tylko na Podglądzie.
import { getCollection } from 'astro:content';
import { slugOf, jestSzkicem } from './tresci';
import { jestTekstemListy, szkicDzialu } from './tekstyStron';
import { specjalnosci } from './specjalnosci';
import { stripBase } from './url';
import { frontmatter as popularyzacja } from '../data/popularyzacja.md';

const PLIKI_DZIALOW = import.meta.glob<{ frontmatter: Record<string, any> }>('../data/{instytut,nauka,studia}.md', { eager: true });
const SITE = import.meta.env.SITE || 'https://im-uwr.github.io';

/** Ścieżka do porównań: bez bazy (/Web-Core), bez /en, bez kotwicy, zapytania i końcowego ukośnika; '' dla linków spoza strony. */
export function adresDoPorownania(href: string): string {
  let a = href.replace(/&amp;|&#38;/g, '&');
  if (/^https?:\/\//.test(a)) {
    try {
      const x = new URL(a);
      if (x.origin !== new URL(SITE).origin) return '';
      a = x.pathname;
    } catch {
      return '';
    }
  }
  if (!a.startsWith('/')) return '';
  a = stripBase(a.replace(/[?#].*$/, ''));
  return a.replace(/^\/en(?=\/|$)/, '').replace(/\/+$/, '') || '/';
}

let pamiec: Promise<Set<string>> | undefined;

/** Zbiór adresów (w postaci adresDoPorownania) stron-szkiców. */
export function adresySzkicow(): Promise<Set<string>> {
  pamiec ??= (async () => {
    const s = new Set<string>();
    for (const e of await getCollection('strony')) if (jestSzkicem(e) && !jestTekstemListy(e.id)) s.add(`/${e.id}`);
    for (const e of await getCollection('kierunki')) if (jestSzkicem(e)) s.add(`/studia/${e.id}`);
    for (const e of await specjalnosci()) if (jestSzkicem(e) && !e.data.bez_podstrony) s.add(`/studia/${e.data.kierunek}/${e.id}`);
    for (const e of await getCollection('zaklady')) if (jestSzkicem(e)) s.add(`/instytut/zaklady/${e.id}`);
    for (const e of await getCollection('aktualnosci')) if (jestSzkicem(e)) s.add(`/aktualnosci/${slugOf(e.id)}`);
    for (const e of await getCollection('obrony')) if (jestSzkicem(e)) s.add(`/obrony-doktorskie/${slugOf(e.id)}`);
    for (const e of await getCollection('seminaria')) if (jestSzkicem(e)) s.add(`/seminaria/${e.id}`);
    for (const e of await getCollection('granty')) if (jestSzkicem(e)) s.add(`/nauka/granty/${slugOf(e.id)}`);
    for (const e of await getCollection('warto_wiedziec')) if (jestSzkicem(e) && e.body?.trim()) s.add(`/warto-wiedziec/${slugOf(e.id)}`);
    for (const dz of ['instytut', 'nauka', 'studia'] as const) if (szkicDzialu(PLIKI_DZIALOW[`../data/${dz}.md`]?.frontmatter)) s.add(`/${dz}`);
    if (szkicDzialu(popularyzacja)) s.add('/popularyzacja');
    return s;
  })();
  return pamiec;
}
