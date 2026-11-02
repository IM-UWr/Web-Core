// Dane listy aktualności (ListaAktualnosci.astro): wpisy po miesiącach, rodzaje do filtra, liczby banera, teksty i ustawienia.
import ustawienia from '../../data/ustawienia.json';
import { monthYear, type Lang } from '../daty';
import { listaAktualnosci } from '../tresci';
import { liczbyTerminow, noweOgloszenia, ETYKIETY } from '../liczbyTerminow';

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
  const rodzaje = ['ogloszenie', 'wydarzenie', 'sukces', 'kariera', 'obrona'].filter((r) => lista.some((p) => p.rodzaj === r));
  const lead = lang === 'en' ? 'Announcements, events and achievements of the Mathematical Institute.' : 'Ogłoszenia, wydarzenia i sukcesy Instytutu Matematycznego.';
  // Hasło na telefonie zamiast opisu (NaglowekStrony.astro; decyzja 31.10.2026). Opis zostaje na komputerze i w <meta description>.
  const haslo = lang === 'en' ? "What's new at the Institute" : 'Co słychać w Instytucie';
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  // Liczby w banerze — na razie tylko na telefonie, pod hasłem, jak w innych działach (decyzja 31.10.2026; komputer później):
  // nowe ogłoszenia (z datą publikacji z ostatnich 30 dni) · nadchodzące wydarzenia · zapowiedziane referaty — definicje
  // wspólne z Kalendarzem i innymi banerami (src/lib/liczbyTerminow.ts; zlecenie 01). Etykiety bez okresu „z 30 dni”
  // (zlecenie 01: liczby wydarzeń i referatów nie mają okna czasowego). Pozycje z zerem pomijamy (LiczbyBanera.astro).
  const terminy = await liczbyTerminow();
  const liczby = [
    { n: await noweOgloszenia(lista), ...ETYKIETY.ogloszenia },
    { n: terminy.wydarzenia, ...ETYKIETY.wydarzenia },
    { n: terminy.referaty, ...ETYKIETY.referaty },
  ];
  // Filtr rodzaju: na komputerze przyciski, na telefonie lista rozwijana obok pola szukania (jeden wiersz; decyzja 31.10.2026;
  // FiltrISzukaj.astro — wspólny z Kalendarzem). Nazwy rodzajów w liczbie mnogiej (RODZAJE_FILTRY w i18n.ts), podpowiedź
  // w polu szukania na telefonie krótsza.
  const filtrEtykieta = T('Filtruj według rodzaju', 'Filter by type');
  const szukajDlugo = T('Szukaj w aktualnościach', 'Search news');
  const szukajKrotko = T('Szukaj', 'Search');

  return { ustawienia, grupy, rodzaje, lead, haslo, liczby, filtrEtykieta, szukajDlugo, szukajKrotko };
}
