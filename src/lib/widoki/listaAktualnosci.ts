// Dane listy aktualności (ListaAktualnosci.astro): wpisy po miesiącach, rodzaje do filtra, teksty i ustawienia.
import ustawienia from '../../data/ustawienia.json';
import { monthYear, type Lang } from '../daty';
import { listaAktualnosci, listaOfert, ofertaAktualna } from '../tresci';
import { stronaListy } from '../tekstyStron';

export async function daneListyAktualnosci(lang: Lang) {
  const lista = await listaAktualnosci(lang);
  // Bez prawego paska „Najbliższe wydarzenia” (decyzja: lista na całą szerokość; wydarzenia są na głównej i w kalendarzu).

  // Grupowanie po miesiącach
  const grupy: { miesiac: string; pozycje: typeof lista }[] = [];
  for (const p of lista) {
    const m = monthYear(p.data, lang);
    const ost = grupy[grupy.length - 1];
    if (ost && ost.miesiac === m) ost.pozycje.push(p);
    else grupy.push({ miesiac: m, pozycje: [p] });
  }
  // bez „Kariera”: oferty mają własną stronę (zlecenie 44), a w ich miejscu w panelu jest ramka z linkiem i liczbą aktualnych ofert
  const rodzaje = ['ogloszenie', 'wydarzenie', 'sukces', 'obrona'].filter((r) => lista.some((p) => p.rodzaj === r));
  const ofertyAktualne = (await listaOfert(lang)).filter(ofertaAktualna).length;
  // Tytuł, opis, hasło (na telefonie zamiast opisu — NaglowekStrony.astro; decyzja 31.10.2026) i tekst nad listą:
  // Web-Aktualnosci → Strony → Aktualności (src/content/strony/aktualnosci.md; zlecenie 30, src/lib/tekstyStron.ts).
  const { tytul, opis: lead, haslo, html } = await stronaListy('aktualnosci', lang);
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  // Filtr rodzaju w panelu „Pokaż” (zal/ListaPokaz.astro, wspólny z Kalendarzem, Obronami i „Warto wiedzieć”; zlecenie 27):
  // na komputerze przyciski, na telefonie lista rozwijana nad polem szukania. Nazwy rodzajów w liczbie mnogiej (RODZAJE_FILTRY w i18n.ts).
  const filtrEtykieta = T('Filtruj według rodzaju', 'Filter by type');
  const szukajDlugo = T('Szukaj w aktualnościach', 'Search news');

  return { ustawienia, grupy, rodzaje, ofertyAktualne, tytul, lead, haslo, html, filtrEtykieta, szukajDlugo };
}
