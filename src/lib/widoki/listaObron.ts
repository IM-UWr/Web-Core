// Dane listy obron doktorskich (src/views/ListaObron.astro): nadchodzące i odbyte obrony, lata do filtra, opis i hasło banera.
import ustawienia from '../../data/ustawienia.json';
import dzial from '../../data/dzialy/nauka.json';
import type { Lang } from '../daty';
import { obrony, trwaLubBedzie } from '../tresci';

export async function daneListyObron(lang: Lang) {
  const wszystkie = await obrony();
  const przyszle = wszystkie.filter((o) => trwaLubBedzie({ poczatek: o.data.termin })).reverse();
  const odbyte = wszystkie.filter((o) => !trwaLubBedzie({ poczatek: o.data.termin }));
  const lead = lang === 'en'
    ? 'Public defences of doctoral theses in mathematics: notices, theses, abstracts and reviews.'
    : 'Publiczne obrony rozpraw doktorskich z matematyki: zawiadomienia, rozprawy, streszczenia i recenzje.';
  // Hasło w banerze (src/data/dzialy/nauka.json, obrony_haslo / _en), bez liczb — baner jak w Aktualnościach (zlecenie 27, punkt 2).
  const haslo = ((dzial as Record<string, any>)[lang === 'en' ? 'obrony_haslo_en' : 'obrony_haslo'] as string | undefined) || undefined;
  // Filtr lat w panelu „Pokaż”: lata, w których są obrony, od najnowszego.
  const lata = [...new Set(wszystkie.map((o) => o.data.termin.slice(0, 4)))].sort().reverse();

  return { przyszle, odbyte, lata, lead, haslo, ustawienia };
}
