// Strony-szkice (zlecenie 33): wpisy z „opublikowany: false”, które mają własną stronę, ich podstrony i strony działów-szkice.
// Jedno miejsce, które mówi, czego nie będzie w budowie publicznej (TYLKO_OPUBLIKOWANE=1):
// - strona, której wpis ma wyłączone „Opublikowane” (jestSzkicem, ta sama reguła co widoczny() w tresci.ts);
// - pośrednio: podstrona takiej strony (adres pod jej adresem), np. specjalność kierunku-szkicu albo strona w folderze strony-szkicu.
// Z tego korzystają: getStaticPaths (sciezki.ts), mapa strony, menu (menu.ts), kafelki kierunków (kierunki.ts), linki w treści
// (src/middleware.ts: na Podglądzie etykieta „szkic”, przy fladze sam tekst) i plakietka stanu budowy na Podglądzie (wiersz szkicu, B4).
// Strona działu-szkic zostaje i przy fladze (bez tekstu z pliku, bo prowadzi do niej menu): tylko etykieta na Podglądzie.
import { getCollection } from 'astro:content';
import { slugOf, jestSzkicem, maTresc, TYLKO_OPUBLIKOWANE } from './tresci';
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

/** Wpis z wyłączonym „Opublikowane”: kolekcja, plik (ścieżka w repozytorium treści, np. src/content/strony/x.md) i adres jego strony. */
export interface WpisSzkicu {
  kolekcja: string;
  plik?: string;
  adres: string;
}

export class Szkice {
  constructor(
    /** strony-szkice (adres → wpis); ich podstrony też są szkicami */
    readonly strony: Map<string, WpisSzkicu>,
    /** strony działów-szkice: tylko na Podglądzie, przy fladze zostają */
    readonly dzialy: Map<string, WpisSzkicu>,
  ) {}

  get size() {
    return this.strony.size + this.dzialy.size;
  }

  /** Wpis, przez który strony o tym adresie nie będzie w budowie publicznej: ona sama albo strona nadrzędna; undefined = będzie. */
  powod(adres: string): WpisSzkicu | undefined {
    for (let a = adres; a.length > 1; a = a.slice(0, a.lastIndexOf('/')) || '/') {
      const w = this.strony.get(a);
      if (w) return w;
    }
    return undefined;
  }

  /** Czy link pod ten adres prowadzi do szkicu (etykieta na Podglądzie, sam tekst przy fladze). */
  has(adres: string): boolean {
    return !!this.powod(adres) || this.dzialy.has(adres);
  }
}

let pamiec: Promise<Szkice> | undefined;

/** Strony-szkice z bieżących danych (adresy w postaci adresDoPorownania). */
export function szkice(): Promise<Szkice> {
  pamiec ??= (async () => {
    const s = new Map<string, WpisSzkicu>();
    const dodaj = (kolekcja: string, e: { filePath?: string }, adres: string) => s.set(adres, { kolekcja, plik: e.filePath, adres });
    for (const e of await getCollection('strony')) if (jestSzkicem(e) && !jestTekstemListy(e.id)) dodaj('strony', e, `/${e.id}`);
    for (const e of await getCollection('kierunki')) if (jestSzkicem(e)) dodaj('kierunki', e, `/studia/${e.id}`);
    for (const e of await specjalnosci()) if (jestSzkicem(e) && !e.data.bez_podstrony) dodaj('specjalnosci', e.tresc, `/studia/${e.data.kierunek}/${e.id}`);
    for (const e of await getCollection('zaklady')) if (jestSzkicem(e)) dodaj('zaklady', e, `/instytut/zaklady/${e.id}`);
    for (const e of await getCollection('aktualnosci')) if (jestSzkicem(e)) dodaj('aktualnosci', e, `/aktualnosci/${slugOf(e.id)}`);
    for (const e of await getCollection('obrony')) if (jestSzkicem(e)) dodaj('obrony', e, `/obrony-doktorskie/${slugOf(e.id)}`);
    for (const e of await getCollection('seminaria')) if (jestSzkicem(e)) dodaj('seminaria', e, `/seminaria/${e.id}`);
    for (const e of await getCollection('granty')) if (jestSzkicem(e)) dodaj('granty', e, `/nauka/granty/${slugOf(e.id)}`);
    for (const e of await getCollection('warto_wiedziec')) if (jestSzkicem(e) && maTresc(e.body)) dodaj('warto_wiedziec', e, `/warto-wiedziec/${slugOf(e.id)}`);
    const d = new Map<string, WpisSzkicu>();
    const dzial = (nazwa: string, fm?: Record<string, any>) => {
      if (szkicDzialu(fm)) d.set(`/${nazwa}`, { kolekcja: nazwa === 'popularyzacja' ? 'popularyzacja' : 'strona-dzialu', plik: `src/data/${nazwa}.md`, adres: `/${nazwa}` });
    };
    for (const dz of ['instytut', 'nauka', 'studia'] as const) dzial(dz, PLIKI_DZIALOW[`../data/${dz}.md`]?.frontmatter);
    dzial('popularyzacja', popularyzacja);
    return new Szkice(s, d);
  })();
  return pamiec;
}

/** Przy fladze TYLKO_OPUBLIKOWANE: czy strona o tym adresie (adresDoPorownania) ma powstać. Bez flagi zawsze tak. */
export async function powstaje(adres: string): Promise<boolean> {
  return !TYLKO_OPUBLIKOWANE || !(await szkice()).powod(adres);
}
