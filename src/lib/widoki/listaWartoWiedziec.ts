// Dane listy „Warto wiedzieć”: liczba opublikowanych pozycji, działy do filtra, tytuł, opis i hasło banera.
import { getCollection } from 'astro:content';
import type { Lang } from '../daty';
import { DZIALY } from '../patroni';
import dzial from '../../data/dzialy/instytut.json';

export async function daneListyWartoWiedziec(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const opublikowane = (await getCollection('warto_wiedziec')).filter((w) => w.data.opublikowany !== false);
  const ile = opublikowane.length;
  // Filtr działu w panelu „Pokaż” (zlecenie 27, punkt 2): tylko działy, które mają wpisy, w kolejności działów strony.
  const dzialy = DZIALY.filter((d) => opublikowane.some((w) => w.data.dzial === d));

  const tytul = T('Warto wiedzieć', 'Highlights');
  const lead = T(
    'Wyjątkowe wydarzenia i osiągnięcia, którymi Instytut Matematyczny chwali się od lat.',
    'Exceptional events and achievements the Mathematical Institute has been proud of for years.',
  );
  // hasło w banerze — po angielsku tylko pole _en (bez polskich resztek)
  const haslo = ((lang === 'en' ? (dzial as any).warto_wiedziec_haslo_en : (dzial as any).warto_wiedziec_haslo) as string | undefined) || undefined;

  return { ile, dzialy, tytul, lead, haslo };
}
