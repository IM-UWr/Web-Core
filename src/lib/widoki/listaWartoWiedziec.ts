// Dane listy „Warto wiedzieć”: liczba opublikowanych pozycji, tytuł, opis i hasło banera.
import { getCollection } from 'astro:content';
import type { Lang } from '../daty';
import dzial from '../../data/dzialy/instytut.json';

export async function daneListyWartoWiedziec(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const ile = (await getCollection('warto_wiedziec')).filter((w) => w.data.opublikowany !== false).length;

  const tytul = T('Warto wiedzieć', 'Highlights');
  const lead = T(
    'Wyjątkowe wydarzenia i osiągnięcia, którymi Instytut Matematyczny chwali się od lat.',
    'Exceptional events and achievements the Mathematical Institute has been proud of for years.',
  );
  // hasło w banerze na telefonie — po angielsku tylko pole _en (bez polskich resztek)
  const haslo = ((lang === 'en' ? (dzial as any).warto_wiedziec_haslo_en : (dzial as any).warto_wiedziec_haslo) as string | undefined) || undefined;

  return { ile, tytul, lead, haslo };
}
