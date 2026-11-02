// Dane wykazu prac z danego roku (src/views/PublikacjeRok.astro): sąsiednie lata, grupy z numeracją, spis treści, liczby i motyw banera.
import dzial from '../../data/dzialy/nauka.json';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { lata, odmiana, liczbaWspolautorskich, liczbaZrodel, wspolautorzy } from './publikacje';

export async function danePublikacjiRoku(rok: number, lang: Lang) {
  const en = lang === 'en';
  const T = (pl: string, en_: string) => (en ? en_ : pl);

  const wszystkie = lata();
  const ten = wszystkie.find((r) => r.rok === rok)!;
  const w = ten.wykaz!;
  const zWykazem = wszystkie.filter((r) => r.wykaz);
  const i = zWykazem.findIndex((r) => r.rok === rok);
  const nowszy = i > 0 ? zWykazem[i - 1] : undefined;
  const starszy = i >= 0 && i < zWykazem.length - 1 ? zWykazem[i + 1] : undefined;

  const tytul = `${T('Publikacje', 'Publications')} ${rok}`;
  const n = ten.liczba;
  const lead = en
    ? `List of works published in ${rok} — ${n} ${n === 1 ? 'entry' : 'entries'}.`
    : `Wykaz prac opublikowanych w roku ${rok} — ${n} ${odmiana(n, 'pozycja', 'pozycje', 'pozycji')}.`;
  // Telefon: hasło z danych działu (po angielsku tylko pole _en — bez polskich resztek) i liczby w banerze.
  const haslo = ((dzial as any)[en ? 'rocznik_haslo_en' : 'rocznik_haslo'] as string | undefined) || undefined;
  const liczbyTelefon: { n: number; pl: [string, string, string]; en: [string, string] }[] = [
    { n, pl: ['praca w wykazie', 'prace w wykazie', 'prac w wykazie'], en: ['paper in the list', 'papers in the list'] },
    { n: liczbaWspolautorskich(w), pl: ['praca ze współautorami', 'prace ze współautorami', 'prac ze współautorami'], en: ['co-authored paper', 'co-authored papers'] },
    { n: liczbaZrodel(w), pl: ['czasopismo lub wydawnictwo', 'czasopisma i wydawnictwa', 'czasopism i wydawnictw'], en: ['journal or book', 'journals and books'] },
  ];
  // Animacja w tle banera na telefonie (motyw „wspolautorzy”): autorzy z wykazu i pary współautorów (bez nazwisk).
  const motywDane = wspolautorzy(w);

  // Grupy (np. „Artykuły problemowe”); nagłówek z innym rokiem wydania: „Rok 2017: …”.
  const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let start = 1;
  const grupy = w.grupy.map((g, k) => {
    const nag = wybierz(g as any, 'naglowek', lang);
    const pelny = nag ? (g.rok_wydania && g.rok_wydania !== rok ? `${T('Rok', 'Year')} ${g.rok_wydania}: ${nag}` : nag) : '';
    const out = { ...g, pelny, id: pelny ? `${slug(pelny)}-${k + 1}` : '', start };
    start += g.prace.length;
    return out;
  });
  const naglowki = grupy.filter((g) => g.pelny).map((g) => ({ depth: 2, slug: g.id, text: g.pelny }));
  const zSpisem = naglowki.length >= 2;
  const uwagi = wybierz(w as any, 'uwagi', lang);
  const pochodzenie = w.pochodzenie === 'pdf'
    ? T('Wersja tekstowa przygotowana na podstawie wykazu w pliku PDF. W razie rozbieżności rozstrzyga plik PDF.', 'Text version prepared from the PDF list. In case of discrepancies, the PDF prevails.')
    : w.pochodzenie === 'strona'
      ? T('Wykaz przeniesiony z poprzedniej strony internetowej Instytutu.', 'List transferred from the previous website of the Institute.')
      : '';

  return { ten, nowszy, starszy, tytul, lead, haslo, liczbyTelefon, motywDane, grupy, naglowki, zSpisem, uwagi, pochodzenie };
}
