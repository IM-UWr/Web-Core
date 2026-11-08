// Dane strony „Rok akademicki” (RokAkademicki.astro): tekst z CMS, dziś, semestry przełącznika i archiwum, liczby banera, spis.
import * as Opis from '../../data/rok-akademicki.md';
import { renderMarkdownZNaglowkami } from '../markdown';
import { today, type Lang } from '../daty';
import {
  semestry, nazwaSemestru, tekstDnia, wolneSemestru, zamianySemestru, terminySemestru, statystykiSemestru, type Semestr,
} from '../kolory-dni';
import { wybierzSemestr } from '../../components/wyborSemestru';

export async function daneRokuAkademickiego(lang: Lang) {
  const en = lang === 'en';
  const T = (pl: string, plEn: string) => (en ? plEn : pl);

  // Część opisowa (Pages CMS: „Rok akademicki — tekst”).
  const fm = (Opis.frontmatter ?? {}) as Record<string, string | undefined>;
  const naglowek = (en && fm.tytul_en) || fm.tytul || T('Rok akademicki', 'Academic year');
  const lead = (en && fm.opis_en) || fm.opis || '';
  // pole „Bloki” (zlecenie 30): polski tekst czyta je sam z nagłówka pliku (rehype-bloki), Treść EN i Koniec strony — tutaj
  const bloki = (fm as Record<string, unknown>).bloki === true;
  const jawne = fm.format_tresci === 'jawne';
  const tekstEn = jawne
    ? await renderMarkdownZNaglowkami((en && fm.tresc_en) || Opis.rawContent(), lang, false, true)
    : en && fm.tresc_en ? await renderMarkdownZNaglowkami(fm.tresc_en, lang, bloki) : undefined;
  const tylkoPolski = en && !fm.tresc_en;
  const naglowkiTekstu = tekstEn ? tekstEn.naglowki : Opis.getHeadings();
  const dalej = await renderMarkdownZNaglowkami((en && fm.dalej_en) || fm.dalej || '', lang, bloki, jawne);
  const dalejPolski = en && !fm.dalej_en && !!fm.dalej;

  const dzis = today();
  const t0 = tekstDnia(dzis, lang);

  // Semestry: trwające i przyszłe jako przyciski przełącznika (co najmniej dwa — w razie potrzeby z ostatnio zakończonymi),
  // starsze w zwijanym archiwum.
  const wszystkie = semestry();
  const zakladki: Semestr[] = wszystkie.filter((s) => s.koniec >= dzis).slice(0, 4);
  const zakonczone = wszystkie.filter((s) => s.koniec < dzis);
  while (zakladki.length < 2 && zakonczone.length) zakladki.unshift(zakonczone.pop()!);
  const archiwum = zakonczone.reverse();
  const rodzaj = (s: Semestr) => (/zimow|winter/i.test(s.nazwa) ? 'zimowy' : /letn|summer/i.test(s.nazwa) ? 'letni' : '');
  const idPanelu = (s: Semestr) => {
    const r = rodzaj(s);
    return r && zakladki.filter((x) => rodzaj(x) === r).length === 1 ? r : `sem-${s.poczatek}`;
  };
  const iAktywny = wybierzSemestr(zakladki.map((s) => ({ od: s.poczatek, do: s.koniec })), dzis);
  const aktywny = zakladki[iAktywny] ? idPanelu(zakladki[iAktywny]) : '';
  const panele = zakladki.length > 1;

  // Dni wolne i zamiany dni semestrów z przełącznika (z kolory-dni.json).
  const sem = zakladki.map((s) => ({ s, id: idPanelu(s), terminy: terminySemestru(s, lang), wolne: wolneSemestru(s), zamiany: zamianySemestru(s) }));
  const saTerminy = sem.some((x) => x.terminy.length > 0);
  const saWolne = sem.some((x) => x.wolne.length > 0);
  const saZamiany = sem.some((x) => x.zamiany.length > 0);
  const tekstRoku = tekstEn ? tekstEn.html.trim() : ((Opis as any).rawContent?.() ?? '').trim();
  const pdfy = [...zakladki, ...archiwum].filter((s) => s.pdf);
  const semestrySwitch = zakladki.map((s) => ({ id: idPanelu(s), etykieta: nazwaSemestru(s, lang), od: s.poczatek, do: s.koniec }));

  // Baner na telefonie (zlecenie 01): hasło (po angielsku tylko haslo_en — bez polskich resztek; puste = opis jak dotąd)
  // i liczby semestru wybranego przy budowie tak jak przełącznik (wybierzSemestr: trwający albo najbliższy) — te same,
  // co w opisie kalendarza („75 dni zajęć (40 niebieskich, 35 pomarańczowych)”, KoloryDniSemestr.astro). Zera pomijane.
  const haslo = (en ? fm.haslo_en : fm.haslo) || undefined;
  const stBiezacego = zakladki[iAktywny] ? statystykiSemestru(zakladki[iAktywny]) : undefined;
  const liczbyTel = stBiezacego ? [
    { n: stBiezacego.razem, pl: ['dzień zajęć', 'dni zajęć', 'dni zajęć'] as [string, string, string], en: ['class day', 'class days'] as [string, string] },
    { n: stBiezacego.niebieskie, pl: ['dzień niebieski', 'dni niebieskie', 'dni niebieskich'] as [string, string, string], en: ['blue day', 'blue days'] as [string, string] },
    { n: stBiezacego.pomaranczowe, pl: ['dzień pomarańczowy', 'dni pomarańczowe', 'dni pomarańczowych'] as [string, string, string], en: ['orange day', 'orange days'] as [string, string] },
  ] : [];

  const ID = {
    kolory: T('kolory-dni', 'day-colours'),
    rok: T('rok-w-skrócie', 'the-year-at-a-glance'),
    pobranie: T('do-pobrania', 'downloads'),
  };
  const naglowki = [
    { depth: 2, slug: ID.kolory, text: T('Kolory dni', 'Day colours') },
    ...(saTerminy || tekstRoku || saWolne || saZamiany ? [{ depth: 2, slug: ID.rok, text: T('Rok w skrócie', 'The year at a glance') }] : []),
    ...naglowkiTekstu,
    ...(pdfy.length ? [{ depth: 2, slug: ID.pobranie, text: T('Do pobrania', 'Downloads') }] : []),
    ...dalej.naglowki,
  ];

  return {
    Opis, naglowek, lead, tekstEn, tylkoPolski, dalej, dalejPolski, dzis, t0, wszystkie, zakladki, archiwum, idPanelu, aktywny, panele,
    sem, saTerminy, saWolne, saZamiany, tekstRoku, pdfy, semestrySwitch, haslo, liczbyTel, ID, naglowki,
  };
}
