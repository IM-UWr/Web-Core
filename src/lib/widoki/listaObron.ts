// Dane listy obron doktorskich (src/views/ListaObron.astro): nadchodzące (od najbliższej), odbyte według lat (lata od najnowszego,
// w roku od najnowszej obrony; zlecenie 57, jak daneListyKonferencji), tytuł, opis, hasło banera i tekst nad listą —
// Web-Aktualnosci → Strony → Obrony doktorskie (src/content/strony/obrony-doktorskie.md; zlecenie 30).
import type { Lang } from '../daty';
import { obrony, trwaLubBedzie, type Obrona } from '../tresci';
import { stronaListy } from '../tekstyStron';

export async function daneListyObron(lang: Lang) {
  const wszystkie = await obrony();
  const przyszle = wszystkie.filter((o) => trwaLubBedzie({ poczatek: o.data.termin })).reverse();
  const odbyte = wszystkie.filter((o) => !trwaLubBedzie({ poczatek: o.data.termin }));
  // odbyte (od najnowszej) w grupach według roku terminu; lata wyliczone z danych
  const lata: { rok: string; lista: Obrona[] }[] = [];
  for (const o of odbyte) {
    const r = o.data.termin.slice(0, 4);
    const ost = lata[lata.length - 1];
    if (ost && ost.rok === r) ost.lista.push(o);
    else lata.push({ rok: r, lista: [o] });
  }
  // hasło w banerze bez liczb — baner jak w Aktualnościach (zlecenie 27, punkt 2); pierwszy akapit tekstu jako p.wst (jak Konferencje)
  const { tytul, opis: lead, haslo, html } = await stronaListy('obrony-doktorskie', lang, { wst: true });

  return { przyszle, lata, tytul, lead, haslo, html };
}
