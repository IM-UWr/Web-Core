// Dane listy seminariów (src/views/ListaSeminariow.astro): grupy seminariów z najbliższymi referatami, referaty tygodnia, liczby w banerze.
import dzial from '../../data/dzialy/nauka.json';
import { wPrzyszlosci, ETYKIETY } from '../liczbyTerminow';
import { now, today, hasTime, type Lang } from '../daty';
import { seminaria, referaty, zaklady, seminariumReferatu, referatyWTygodniu, tydzienSeminariow } from '../tresci';

export async function daneListySeminariow(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const sem = await seminaria();
  const ref = await referaty();
  const zak = await zaklady();
  const n = now();
  const nastepny = (id: string) =>
    ref.find((r) => seminariumReferatu(r) === id && (hasTime(r.data.termin) ? r.data.termin >= n : r.data.termin >= today()));
  // zakłady seminarium (tylko te, które są na stronie), w kolejności zakładów
  const zakladySem = (s: (typeof sem)[number]) => zak.filter((z) => s.data.zaklad.includes(z.id));
  const kolejnosc = (s: (typeof sem)[number]) => zakladySem(s)[0]?.data.kolejnosc ?? Infinity;
  const aktywne = sem.filter((s) => s.data.aktywne);
  const nieaktywne = sem.filter((s) => !s.data.aktywne);
  const zakladowe = aktywne.filter((s) => zakladySem(s).length > 0).sort((a, b) => kolejnosc(a) - kolejnosc(b));
  const niezalezne = aktywne.filter((s) => zakladySem(s).length === 0);
  const grupy = [
    { id: 'h-zakladow', tytul: T('Seminaria zakładów', 'Department seminars'), lista: zakladowe },
    { id: 'h-niezalezne', tytul: T('Seminaria niezależne', 'Independent seminars'), lista: niezalezne },
  ].filter((g) => g.lista.length > 0);
  const tydzien = tydzienSeminariow();
  const wTygodniu = await referatyWTygodniu(lang);
  const lead = lang === 'en'
    ? 'Research seminars of the Mathematical Institute. Everyone is welcome.'
    : 'Seminaria naukowe Instytutu Matematycznego. Zapraszamy wszystkich zainteresowanych.';
  // Telefon (≤ 1023 px; zlecenie 01, decyzja 31.10.2026): hasło zamiast opisu (src/data/dzialy/nauka.json, seminaria_haslo / _en)
  // i trzy liczby pod kreską: seminaria (aktywne, jak karty niżej) · zapowiedziane referaty (wszystkich seminariów, definicja
  // wspólna z Kalendarzem — src/lib/liczbyTerminow.ts) · referaty w archiwum (minione referaty opublikowanych seminariów).
  const haslo = ((dzial as Record<string, any>)[lang === 'en' ? 'seminaria_haslo_en' : 'seminaria_haslo'] as string | undefined) || undefined;
  const idSem = new Set(sem.map((s) => s.id));
  const refSem = ref.filter((r) => idSem.has(seminariumReferatu(r)));
  const zapowiedziane = refSem.filter((r) => wPrzyszlosci(r.data.termin)).length;
  const liczby = [
    { n: aktywne.length, pl: ['seminarium', 'seminaria', 'seminariów'] as [string, string, string], en: ['seminar', 'seminars'] as [string, string] },
    { n: zapowiedziane, ...ETYKIETY.referaty },
    { n: refSem.length - zapowiedziane, ...ETYKIETY.archiwum },
  ];

  return { nastepny, zakladySem, nieaktywne, grupy, tydzien, wTygodniu, lead, haslo, liczby };
}
