// Dane listy obron doktorskich (src/views/ListaObron.astro): nadchodzące i odbyte obrony, opis, hasło i liczby w banerze.
import ustawienia from '../../data/ustawienia.json';
import dzial from '../../data/dzialy/nauka.json';
import { ETYKIETY } from '../liczbyTerminow';
import type { Lang } from '../daty';
import { obrony, trwaLubBedzie } from '../tresci';

export async function daneListyObron(lang: Lang) {
  const wszystkie = await obrony();
  const przyszle = wszystkie.filter((o) => trwaLubBedzie({ poczatek: o.data.termin })).reverse();
  const odbyte = wszystkie.filter((o) => !trwaLubBedzie({ poczatek: o.data.termin }));
  const lead = lang === 'en'
    ? 'Public defences of doctoral theses in mathematics: notices, theses, abstracts and reviews.'
    : 'Publiczne obrony rozpraw doktorskich z matematyki: zawiadomienia, rozprawy, streszczenia i recenzje.';
  // Telefon (≤ 760 px; zlecenie 01, decyzja 31.10.2026): hasło zamiast opisu (src/data/dzialy/nauka.json, obrony_haslo / _en)
  // i dwie liczby pod kreską: nadchodzące · odbyte obrony — te same listy co sekcje niżej (termin w przyszłości, jak
  // „nadchodzące obrony” w Kalendarzu — src/lib/liczbyTerminow.ts).
  const haslo = ((dzial as Record<string, any>)[lang === 'en' ? 'obrony_haslo_en' : 'obrony_haslo'] as string | undefined) || undefined;
  const liczby = [
    { n: przyszle.length, ...ETYKIETY.obrony },
    { n: odbyte.length, pl: ['odbyta obrona', 'odbyte obrony', 'odbytych obron'] as [string, string, string], en: ['past defence', 'past defences'] as [string, string] },
  ];

  return { przyszle, odbyte, lead, haslo, liczby, ustawienia };
}
