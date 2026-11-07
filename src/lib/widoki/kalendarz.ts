// Dane strony „Kalendarz” (Kalendarz.astro): widoki „Nadchodzące” / „Archiwum” po miesiącach, dział każdej pozycji, teksty filtrów.
import { t } from '../i18n';
import { monthYear, type Lang } from '../daty';
import { wszystkieWydarzenia, trwaLubBedzie, aktualnosci, slugOf } from '../tresci';
import { dzialWydarzenia, type Dzial } from '../patroni';

export async function daneKalendarza(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  // Dwa widoki: „Nadchodzące” (trwające i przyszłe, od najbliższego) i „Archiwum” (cała historia, od najnowszego).
  // Dział pozycji (kolor daty i etykiety jak w Aktualnościach; zlecenie 27, punkt 1): wydarzenie — dział jego wpisu, obrona i konferencja — Nauka,
  // referat — z adresu seminarium (Nauka); ta sama reguła co „Nadchodzące wydarzenia” na stronie głównej (dzialWydarzenia w src/lib/patroni.ts).
  const wpisy = new Map((await aktualnosci()).map((a) => [`/aktualnosci/${slugOf(a.id)}`, a.data]));
  const wszystkie = (await wszystkieWydarzenia(lang)).map((w) => ({ ...w, dzial: dzialWydarzenia(w, w.href ? wpisy.get(w.href) : undefined) as Dzial | undefined }));
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

  // Bez liczb w banerze (zlecenie 27, punkt 1: „Wypad”), samo hasło jak w Aktualnościach.
  // Filtry w panelu „Pokaż” (zal/ListaPokaz.astro; na telefonie lista wyboru) i szukanie po tekście pozycji — jak w Aktualnościach.
  const filtrEtykieta = T('Filtruj według rodzaju', 'Filter by type');
  const szukajDlugo = T('Szukaj w kalendarzu', 'Search calendar');

  return { widoki, lead, haslo, filtrEtykieta, szukajDlugo };
}
