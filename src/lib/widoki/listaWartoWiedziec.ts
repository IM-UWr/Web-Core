// Dane listy „Warto wiedzieć”: liczba opublikowanych pozycji, działy do filtra, tytuł, opis i hasło banera, tekst nad listą —
// Web-Instytut → Strony → Warto wiedzieć (src/content/strony/warto-wiedziec.md; zlecenie 30, src/lib/tekstyStron.ts).
import { getCollection } from 'astro:content';
import type { Lang } from '../daty';
import { DZIALY } from '../patroni';
import { stronaListy } from '../tekstyStron';

export async function daneListyWartoWiedziec(lang: Lang) {
  const opublikowane = (await getCollection('warto_wiedziec')).filter((w) => w.data.opublikowany !== false);
  const ile = opublikowane.length;
  // Filtr działu w panelu „Pokaż” (zlecenie 27, punkt 2): tylko działy, które mają wpisy, w kolejności działów strony.
  const dzialy = DZIALY.filter((d) => opublikowane.some((w) => w.data.dzial === d));

  // hasło w banerze — po angielsku tylko Hasło EN (bez polskich resztek)
  const { tytul, opis: lead, haslo, html } = await stronaListy('warto-wiedziec', lang);

  return { ile, dzialy, tytul, lead, haslo, html };
}
