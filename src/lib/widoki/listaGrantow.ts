// Dane listy projektów i grantów (src/views/ListaGrantow.astro): podział na realizowane/zakończone/bez lat, liczby, spis sekcji.
import dzial from '../../data/dzialy/nauka.json';
import { today, type Lang } from '../daty';
import { wybierz } from '../i18n';
import { granty, pracownicy, zaklady, zakladGrantu, kierownicyGrantu, type Grant } from '../tresci';

// liczebniki: 1 projekt, 2–4 (22–24…) projekty, 5+ projektów
export const odm = (n: number, jeden: string, kilka: string, wiele: string) => {
  if (n === 1) return jeden;
  const j = n % 10, d = n % 100;
  return j >= 2 && j <= 4 && (d < 12 || d > 14) ? kilka : wiele;
};

export async function daneListyGrantow(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  const wszystkie = await granty();
  const osoby = await pracownicy();
  const listaZakladow = await zaklady();
  const rok = Number(today().slice(0, 4));
  // Realizowane — tak samo jak na /nauka i na stronach zakładów: rok zakończenia ≥ bieżący rok.
  const realizowane = wszystkie.filter((g) => g.data.rok_do !== undefined && g.data.rok_do >= rok);
  const zakonczone = wszystkie.filter((g) => g.data.rok_do !== undefined && g.data.rok_do < rok);
  const bezLat = wszystkie.filter((g) => g.data.rok_do === undefined);
  const grupy = [...new Set(zakonczone.map((g) => g.data.rok_do!))]
    .sort((a, b) => b - a)
    .map((r) => ({ rok: r, lista: zakonczone.filter((g) => g.data.rok_do === r) }));

  const kier = (g: Grant) => kierownicyGrantu(g.data.kierownik, osoby, lang);
  const zakladProjektu = (g: Grant) => listaZakladow.find((z) => z.id === zakladGrantu(g, osoby));

  // Pasek liczb — wszystko liczone z kolekcji (kwot nie sumujemy: różne waluty i zapisy).
  const lataOd = wszystkie.map((g) => g.data.rok_od).filter((r): r is number => r !== undefined);
  const odRoku = lataOd.length ? Math.min(...lataOd) : undefined;
  const ileRodzaju = (r: string) => wszystkie.filter((g) => g.data.rodzaj === r).length;
  const liczby = [
    { n: wszystkie.length, l: lang === 'en' ? `research projects${odRoku ? ` since ${odRoku}` : ''}` : `${odm(wszystkie.length, 'projekt badawczy', 'projekty badawcze', 'projektów badawczych')}${odRoku ? ` od ${odRoku} r.` : ''}` },
    { n: realizowane.length, l: T(odm(realizowane.length, 'realizowany obecnie', 'realizowane obecnie', 'realizowanych obecnie'), 'ongoing') },
    ...(['ncn', 'ue'] as const)
      .filter((r) => ileRodzaju(r) > 0)
      .map((r) => ({ n: ileRodzaju(r), l: r === 'ncn' ? T('z Narodowego Centrum Nauki', 'funded by the National Science Centre') : T('z programów UE i międzynarodowych', 'EU and international') })),
  ];
  // Telefon: hasło z danych działu (po angielsku tylko pole _en — bez polskich resztek) i trzy liczby w banerze;
  // projekty bez podanych lat liczą się tylko do „łącznie” (jak sekcja „Pozostałe”).
  const haslo = ((dzial as any)[lang === 'en' ? 'granty_haslo_en' : 'granty_haslo'] as string | undefined) || undefined;
  const liczbyTelefon = [
    { n: realizowane.length, pl: ['realizowany projekt', 'realizowane projekty', 'realizowanych projektów'], en: ['ongoing project', 'ongoing projects'] },
    { n: zakonczone.length, pl: ['zakończony', 'zakończone', 'zakończonych'], en: ['completed', 'completed'] },
    { n: wszystkie.length, pl: ['projekt łącznie', 'projekty łącznie', 'projektów łącznie'], en: ['project in total', 'projects in total'] },
  ] as { n: number; pl: [string, string, string]; en: [string, string] }[];

  const naglowek = T('Projekty i granty', 'Research projects and grants');
  const lead = T(
    'Projekty badawcze realizowane w Instytucie Matematycznym, finansowane przez Narodowe Centrum Nauki, programy unijne i inne źródła.',
    'Research projects carried out at the Mathematical Institute, funded by the National Science Centre (NCN), EU programmes and other sources.',
  );
  const naTejStronie = T('Na tej stronie', 'On this page');
  const sekcje = [
    { id: 'realizowane', tekst: T('Realizowane', 'Ongoing'), ile: realizowane.length, pokaz: true },
    { id: 'zakonczone', tekst: T('Zakończone', 'Completed'), ile: zakonczone.length, pokaz: zakonczone.length > 0 },
    { id: 'pozostale', tekst: T('Pozostałe', 'Other'), ile: bezLat.length, pokaz: bezLat.length > 0 },
  ].filter((s) => s.pokaz);

  // ---------- komputer (kierunek „Założyciele”): paski czasu na wspólnej osi lat ----------
  // Tekst wprowadzający (te same akapity co TekstWstepny: nauka.json, granty_tekst / granty_tekst_en).
  const wstep = wybierz(dzial as Record<string, any>, 'granty_tekst', lang)
    .split(/\n\s*\n/)
    .map((a) => a.trim())
    .filter(Boolean);
  // „Dziś” = data budowania: rok + ułamek roku (2.11.2026 → ok. 2026,84).
  const [rD, mD, dD] = today().split('-').map(Number);
  const dzis = rD + (Date.UTC(rD, mD - 1, dD) - Date.UTC(rD, 0, 1)) / (Date.UTC(rD + 1, 0, 1) - Date.UTC(rD, 0, 1));
  // lata projektu [od, do] (brak jednego z końców — projekt jednoroczny); bez lat — null
  const lataProjektu = (g: Grant): [number, number] | null => {
    const od = g.data.rok_od ?? g.data.rok_do, d = g.data.rok_do ?? g.data.rok_od;
    return od === undefined || d === undefined ? null : [Math.min(od, d), Math.max(od, d)];
  };
  // oś od początku roku `od` do początku roku `do`; podziałka co `co` lat (bez ostatniego roku — tam kończy się oś)
  const os = (od: number, doRoku: number, co: number) => ({
    od,
    do: doRoku,
    podzialka: Array.from({ length: Math.floor((doRoku - od) / co) + 1 }, (_, i) => od + i * co)
      .filter((r) => r < doRoku)
      .map((r) => ({ rok: r, x: (((r - od) / (doRoku - od)) * 100).toFixed(3) })),
  });
  type Os = ReturnType<typeof os>;
  const poczatki = (lista: Grant[]) => lista.map((g) => lataProjektu(g)?.[0]).filter((r): r is number => r !== undefined);
  // Realizowane: od najwcześniejszego początku (najpóźniej bieżący rok, żeby „dziś” było na osi) do roku po najpóźniejszym końcu.
  const osRealizowanych = realizowane.length
    ? os(Math.min(rok, ...poczatki(realizowane)), Math.max(rok, ...realizowane.map((g) => lataProjektu(g)![1])) + 1, 1)
    : undefined;
  // Zakończone: od najwcześniejszego początku (zaokrąglonego w dół do wielokrotności 4, jak w prototypie: 2004)
  // do końca bieżącego roku; podziałka co 4 lata.
  const osZakonczonych = zakonczone.length ? os(Math.floor(Math.min(rok, ...poczatki(zakonczone)) / 4) * 4, rok + 1, 4) : undefined;
  // pasek projektu na osi (left / width w %) i położenie linii „dziś” (w %; poza osią — brak)
  const pasek = (g: Grant, o: Os) => {
    const l = lataProjektu(g);
    if (!l) return undefined;
    const od = Math.max(l[0], o.od), d = Math.min(l[1] + 1, o.do);
    return { left: (((od - o.od) / (o.do - o.od)) * 100).toFixed(3), width: (((d - od) / (o.do - o.od)) * 100).toFixed(3) };
  };
  const dzisNaOsi = (o: Os) => (dzis > o.od && dzis < o.do ? (((dzis - o.od) / (o.do - o.od)) * 100).toFixed(3) : undefined);
  const spisKomputer = sekcje.map((s) => ({ id: `z-${s.id}`, etykieta: `${s.tekst} (${s.ile})` }));

  return {
    realizowane, zakonczone, bezLat, grupy, kier, zakladProjektu, liczby, haslo, liczbyTelefon, naglowek, lead, naTejStronie, sekcje,
    wstep, osRealizowanych, osZakonczonych, pasek, dzisNaOsi, spisKomputer,
  };
}
