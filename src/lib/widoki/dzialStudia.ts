// Dane strony działu „Studia” (DzialStudia.astro): liczby w banerze, kafelki z menu „Studia”, „O studiach” i aktualności.
import { getCollection, type CollectionEntry } from 'astro:content';
import tekst from '../../data/dzialy/studia.json';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { listaKierunkow, menuGlowne } from '../menu';
import { listaAktualnosci } from '../tresci';

// polska odmiana: 1 kierunek, 2–4 kierunki, 5+ kierunków
const odm = (n: number, jeden: string, kilka: string, wiele: string) =>
  n === 1 ? jeden : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? kilka : wiele;

type Kierunek = CollectionEntry<'kierunki'>;
const stopnie = (k: Kierunek) => new Set(k.data.etapy.map((e) => e.stopien.trim()));
// szkoła doktorska = same etapy III stopnia
const doktorat = (k: Kierunek) => { const s = stopnie(k); return s.has('III') && !s.has('I') && !s.has('II'); };

// wartosc_en — etykieta w wersji angielskiej (puste = jak po polsku, np. liczby i lata)
type Fakt = { wartosc?: string; wartosc_en?: string; opis?: string; opis_en?: string };

export async function daneDzialuStudia(lang: Lang) {
  const en = lang === 'en';
  const T = (pl: string, angielski: string) => (en ? angielski : pl);
  const w = (o: any, pole: string) => wybierz(o, pole, lang);
  const kierunki = await listaKierunkow();

  // Pasek liczb (liczone z kolekcji).
  const idKierunkow = new Set(kierunki.map((k) => k.id));
  const specjalnosci = (await getCollection('specjalnosci')).filter(
    (s) => s.data.opublikowany !== false && s.data.na_stronie_kierunku && !s.data.wygaszana && idKierunkow.has(s.data.kierunek),
  );
  const wszystkieStopnie = [...new Set(kierunki.flatMap((k) => [...stopnie(k)]))].filter((s) => ['I', 'II', 'III'].includes(s)).sort((a, b) => a.length - b.length);
  const nKierunkow = kierunki.filter((k) => !doktorat(k)).length;
  // Liczby w banerze: kierunki, specjalności, stopnie studiów. Bez liczby nauczycieli akademickich — jest na stronie
  // „Instytut” (decyzja 31.10.2026: bez powtórzeń między działami). Krótkie etykiety, bez „do wyboru” i „(I, II, III)”
  // (decyzja 31.10.2026: na telefonie każda w jednej linijce; po angielsku „programmes” zamiast „degree programmes”).
  const liczby = [
    { n: nKierunkow, l: T(odm(nKierunkow, 'kierunek studiów', 'kierunki studiów', 'kierunków studiów'), nKierunkow === 1 ? 'programme' : 'programmes') },
    { n: specjalnosci.length, l: T(odm(specjalnosci.length, 'specjalność', 'specjalności', 'specjalności'), specjalnosci.length === 1 ? 'specialisation' : 'specialisations') },
    { n: wszystkieStopnie.length, l: T(odm(wszystkieStopnie.length, 'stopień studiów', 'stopnie studiów', 'stopni studiów'), wszystkieStopnie.length === 1 ? 'level of study' : 'levels of study') },
  ].filter((x) => x.n > 0);

  // Kafelki: grupy i linki z menu „Studia” (kierunki wstawiane automatycznie; nowy link w menu sam pojawi się tutaj).
  const pozycja = (await menuGlowne()).find((m) => m.etykieta === 'Studia' || m.etykieta_en === 'Study');
  const grupy = (pozycja?.grupy ?? []).filter((g) => g.linki.length > 0);

  // „O studiach” — akapity z CMS (oddzielone pustą linią) i ramka „W skrócie” obok, po prawej (komputer; jak „O Instytucie”
  // na stronie „Instytut”): lista {wartosc, opis, opis_en}, fakty jeden pod drugim; pozycje bez wartości pomijamy.
  const oStudiach = ((w(tekst, 'o_studiach') as string) || '').split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const fakty = (((tekst as any).o_studiach_fakty ?? []) as Fakt[])
    .filter((f) => f?.wartosc?.trim())
    .map((f) => ({ w: ((en && f.wartosc_en?.trim()) || f.wartosc!).trim(), o: ((en && f.opis_en) || f.opis || '').replace(/(\d)–(\d)/g, '$1⁠–⁠$2') }));
  // (zakres lat, np. 2022–2025, nie łamie się po półpauzie — wąska kolumna ramki, 300 px)

  // Aktualności dla studentów (komputer — wariant „Zwarta”: cztery karty, jeden pełny rząd;
  // telefon — wygląd „Portal”: zwarta lista sześciu).
  const dlaStudentow = (await listaAktualnosci(lang)).filter((p) => p.dla.includes('studenci'));
  const aktualnosci = dlaStudentow.slice(0, 4);
  const aktualnosciTel = dlaStudentow.slice(0, 6);

  const tytul = T('Studia', 'Study');
  const wstep = w(tekst, 'wstep');
  // Hasło na telefonie zamiast opisu (NaglowekStrony.astro; decyzja 31.10.2026). Opis zostaje na komputerze i w <meta description>.
  const haslo = w(tekst, 'haslo');

  return { liczby, grupy, oStudiach, fakty, aktualnosci, aktualnosciTel, tytul, wstep, haslo };
}
