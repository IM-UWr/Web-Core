// Dane listy obron doktorskich (src/views/ListaObron.astro): nadchodzące i odbyte obrony, lata do filtra, tytuł, opis, hasło banera
// i tekst nad listą — Web-Aktualnosci → Strony → Obrony doktorskie (src/content/strony/obrony-doktorskie.md; zlecenie 30).
import ustawienia from '../../data/ustawienia.json';
import type { Lang } from '../daty';
import { obrony, trwaLubBedzie } from '../tresci';
import { stronaListy } from '../tekstyStron';

export async function daneListyObron(lang: Lang) {
  const wszystkie = await obrony();
  const przyszle = wszystkie.filter((o) => trwaLubBedzie({ poczatek: o.data.termin })).reverse();
  const odbyte = wszystkie.filter((o) => !trwaLubBedzie({ poczatek: o.data.termin }));
  // hasło w banerze bez liczb — baner jak w Aktualnościach (zlecenie 27, punkt 2)
  const { tytul, opis: lead, haslo, html } = await stronaListy('obrony-doktorskie', lang);
  // Filtr lat w panelu „Pokaż”: lata, w których są obrony, od najnowszego.
  const lata = [...new Set(wszystkie.map((o) => o.data.termin.slice(0, 4)))].sort().reverse();

  return { przyszle, odbyte, lata, tytul, lead, haslo, html, ustawienia };
}
