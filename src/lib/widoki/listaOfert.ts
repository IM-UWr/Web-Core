// Dane strony Kariera (/aktualnosci/kariera, ListaOfert.astro; zlecenie 44): oferty pracy, staży i stypendiów — wpisy aktualności
// z rodzajem „Kariera”. U góry aktualne (bez terminu zgłoszeń albo termin dziś lub później), pod nimi zakończone; w obu od najnowszej
// daty publikacji. Teksty: Web-Aktualnosci → Strony → Kariera (src/content/strony/kariera.md; domyślne w src/lib/tekstyStron.ts).
import { listaOfert, ofertaAktualna } from '../tresci';
import { stronaListy } from '../tekstyStron';
import type { Lang } from '../daty';

export async function daneListyOfert(lang: Lang) {
  const oferty = await listaOfert(lang);
  const aktualne = oferty.filter(ofertaAktualna);
  const zakonczone = oferty.filter((p) => !ofertaAktualna(p));
  const { tytul, opis: lead, haslo, html } = await stronaListy('kariera', lang);
  // link wstecz „← Aktualności” z tytułem listy (Strony → Aktualności)
  const { tytul: tytulAktualnosci } = await stronaListy('aktualnosci', lang);
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const szukajDlugo = T('Szukaj w ofertach', 'Search offers');
  return { aktualne, zakonczone, tytul, lead, haslo, html, tytulAktualnosci, szukajDlugo };
}
