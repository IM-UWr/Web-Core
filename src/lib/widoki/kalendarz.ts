// Dane strony „Kalendarz” (Kalendarz.astro): widoki „Nadchodzące” / „Archiwum” po miesiącach, liczby banera, teksty filtrów.
import { t } from '../i18n';
import { monthYear, type Lang } from '../daty';
import { wszystkieWydarzenia, trwaLubBedzie } from '../tresci';
import { liczbyTerminow, ETYKIETY } from '../liczbyTerminow';

export async function daneKalendarza(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  // Dwa widoki: „Nadchodzące” (trwające i przyszłe, od najbliższego) i „Archiwum” (cała historia, od najnowszego).
  const wszystkie = await wszystkieWydarzenia(lang);
  type W = (typeof wszystkie)[number];
  const poMiesiacach = (lista: W[]) => {
    const grupy: { miesiac: string; pozycje: W[] }[] = [];
    for (const w of lista) {
      const m = monthYear(w.poczatek, lang);
      const ost = grupy[grupy.length - 1];
      if (ost && ost.miesiac === m) ost.pozycje.push(w);
      else grupy.push({ miesiac: m, pozycje: [w] });
    }
    return grupy;
  };
  const widoki = [
    { id: 'nadchodzace', etykieta: T('Nadchodzące', 'Upcoming'), grupy: poMiesiacach(wszystkie.filter(trwaLubBedzie)), pusty: t(lang, 'brakWydarzen') },
    { id: 'archiwum', etykieta: T('Archiwum', 'Archive'), grupy: poMiesiacach(wszystkie.filter((w) => !trwaLubBedzie(w)).reverse()), pusty: T('Brak minionych wydarzeń.', 'No past events.') },
  ];
  const lead = lang === 'en'
    ? 'Events, PhD defences, conferences and seminar talks at the Mathematical Institute — upcoming and past.'
    : 'Wydarzenia, obrony doktorskie, konferencje i referaty seminaryjne w Instytucie Matematycznym — nadchodzące i archiwalne.';
  // Hasło na telefonie zamiast opisu (NaglowekStrony.astro; decyzja 31.10.2026). Opis zostaje na komputerze i w <meta description>.
  const haslo = T('Co, gdzie i kiedy', 'What, where and when');

  // Liczby w banerze (telefon; decyzja użytkownika, zlecenie 01): nadchodzące obrony · zapowiedziane referaty · nadchodzące
  // wydarzenia (z konferencjami, bez seminariów i obron) — bez okna 30 dni i bez etykiety okresu; definicje wspólne
  // z Aktualnościami (src/lib/liczbyTerminow.ts). Pozycje z zerem pomijamy (LiczbyBanera.astro).
  const terminy = await liczbyTerminow();
  const liczby = [
    { n: terminy.obrony, ...ETYKIETY.obrony },
    { n: terminy.referaty, ...ETYKIETY.referaty },
    { n: terminy.wydarzenia, ...ETYKIETY.wydarzenia },
  ];
  // Filtry na telefonie: lista rozwijana (kolejność jak w decyzji: Seminaria, Wydarzenia, Obrony, Konferencje) i szukanie
  // po tekście pozycji — jak w Aktualnościach. Na komputerze przyciski w banerze, bez pola szukania (bez zmian).
  const rodzajeListy = ['referat', 'wydarzenie', 'obrona', 'konferencja'];
  const filtrEtykieta = T('Filtruj według rodzaju', 'Filter by type');
  const szukajDlugo = T('Szukaj w kalendarzu', 'Search calendar');
  const szukajKrotko = T('Szukaj', 'Search');

  return { widoki, lead, haslo, liczby, rodzajeListy, filtrEtykieta, szukajDlugo, szukajKrotko };
}
