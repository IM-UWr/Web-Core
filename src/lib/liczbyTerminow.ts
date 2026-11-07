// Liczby terminów w banerach na telefonie (LiczbyBanera.astro; zlecenie 01, decyzje 31.10.2026) — jedne definicje dla
// Kalendarza, Seminariów i Obron doktorskich, liczone przy budowie strony (2× dziennie i po każdej zmianie
// treści), więc „teraz” to chwila budowania:
// - wydarzenia: pozycje kalendarza z terminem w przyszłości — koniec, a gdy go nie ma, początek, nie wcześniej niż teraz;
//   bez referatów seminariów i bez obron, konferencje (bez odwołanych) się wliczają;
// - zapowiedziane referaty: wszystkie referaty (opublikowanych) seminariów z terminem w przyszłości;
// - nadchodzące obrony: obrony z terminem w przyszłości.
// „Termin w przyszłości” = jak „Nadchodzące” na stronie seminarium i na liście obron: termin z godziną nie wcześniej niż
// teraz, sam dzień — nie wcześniej niż dziś.
import { now, today, hasTime } from './daty';
import { wszystkieWydarzenia } from './tresci';

export const wPrzyszlosci = (termin: string) => (hasTime(termin) ? termin >= now() : termin.slice(0, 10) >= today());

// Etykiety liczb z odmianą po liczebniku (1 · 2–4 · 5+; po angielsku 1 · wiele) — wspólne dla wszystkich banerów.
export type Odmiana = { pl: [string, string, string]; en: [string, string] };
export const ETYKIETY = {
  wydarzenia: { pl: ['nadchodzące wydarzenie', 'nadchodzące wydarzenia', 'nadchodzących wydarzeń'], en: ['upcoming event', 'upcoming events'] },
  referaty: { pl: ['zapowiedziany referat', 'zapowiedziane referaty', 'zapowiedzianych referatów'], en: ['upcoming talk', 'upcoming talks'] },
  obrony: { pl: ['nadchodząca obrona', 'nadchodzące obrony', 'nadchodzących obron'], en: ['upcoming defence', 'upcoming defences'] },
  archiwum: { pl: ['referat w archiwum', 'referaty w archiwum', 'referatów w archiwum'], en: ['past talk', 'past talks'] },
} satisfies Record<string, Odmiana>;

export interface LiczbyTerminow { wydarzenia: number; referaty: number; obrony: number }

// Wydarzenia, referaty i obrony z jednego źródła — pozycji kalendarza (wszystkieWydarzenia: referaty tylko opublikowanych
// seminariów, konferencje bez odwołanych).
export async function liczbyTerminow(): Promise<LiczbyTerminow> {
  const wszystkie = await wszystkieWydarzenia();
  const ile = (rodzaje: string[], kiedy: (w: (typeof wszystkie)[number]) => string) =>
    wszystkie.filter((w) => rodzaje.includes(w.rodzaj) && wPrzyszlosci(kiedy(w))).length;
  return {
    wydarzenia: ile(['wydarzenie', 'konferencja'], (w) => w.koniec || w.poczatek),
    referaty: ile(['referat'], (w) => w.poczatek),
    obrony: ile(['obrona'], (w) => w.poczatek),
  };
}
