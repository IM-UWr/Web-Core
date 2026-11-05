// Dane strony projektu (src/views/Grant.astro): tytuły, karta danych, hasło i motyw banera, kierownicy, zakład, inne projekty zakładu.
import { render } from 'astro:content';
import { RODZAJE_GRANTOW } from '../i18n';
import { today, type Lang } from '../daty';
import { granty, pracownicy, zaklady, zakladGrantu, kierownicyGrantu, lataGrantu, type Grant } from '../tresci';

// Pole „program” nie ma wersji angielskiej: po angielsku znane polskie nazwy tłumaczymy, resztę zostawiamy (nazwy konkursów,
// np. OPUS, są takie same w obu językach). Używane w plakietce, karcie danych, haśle, opisie strony i na liście projektów.
const PROGRAMY_EN: Record<string, string> = { 'grant promotorski': 'supervisor grant' };
export const programGrantu = (program: string | undefined, lang: Lang): string => {
  const p = program?.trim() ?? '';
  return p && lang === 'en' ? PROGRAMY_EN[p.toLowerCase()] ?? p : p;
};

export async function daneGrantu(grant: Grant, lang: Lang) {
  const d = grant.data;
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const tytul = (lang === 'en' && d.tytul_en) || d.tytul;
  // tytuł w drugim języku (pod nagłówkiem), jeśli jest
  const tytulDrugi = lang === 'en' ? (d.tytul_en ? { tekst: d.tytul, lang: 'pl' } : undefined) : d.tytul_en ? { tekst: d.tytul_en, lang: 'en' } : undefined;
  const maOpis = !!grant.body?.trim();
  const { Content } = await render(grant);
  const okres = lataGrantu(grant);
  const trwa = d.rok_do !== undefined && d.rok_do >= Number(today().slice(0, 4));
  const rodzaj = RODZAJE_GRANTOW[d.rodzaj][lang];
  // Pełna nazwa źródła w karcie danych (plakietka pod tytułem ma skrót).
  const FINANSOWANIE: Record<string, [string, string]> = {
    ncn: ['Narodowe Centrum Nauki (NCN)', 'National Science Centre (NCN)'],
    ue: ['Programy UE i międzynarodowe', 'EU and international programmes'],
    wewnetrzny: ['Środki wewnętrzne', 'Internal funding'],
    inny: ['Inne źródła', 'Other sources'],
  };
  const finansowanie = FINANSOWANIE[d.rodzaj] ? T(...FINANSOWANIE[d.rodzaj]) : rodzaj;

  // Hasło w banerze na telefonie — składane z pól projektu: źródło (krótko), program (jeśli jest) i lata realizacji,
  // np. „NCN · 2025–2028”, „NCN, grant promotorski · 2009–2011”. Program wielką literą (nazwa konkursu, np. OPUS) stoi
  // zaraz po źródle („NCN OPUS”), małą — po przecinku (program po angielsku: programGrantu wyżej).
  // Źródło krótko, żeby hasło mieściło się w jednej linijce przy 360 px (UE — jak plakietka: „UE i międzynarodowe”).
  const ZRODLO_HASLA: Record<string, [string, string]> = {
    ncn: ['NCN', 'NCN'],
    ue: ['UE i międzynarodowe', 'EU and international'],
    wewnetrzny: ['Środki wewnętrzne', 'Internal funding'],
    inny: ['Inne źródła', 'Other sources'],
  };
  const program = programGrantu(d.program, lang);
  const zrodloHasla = ZRODLO_HASLA[d.rodzaj] ? T(...ZRODLO_HASLA[d.rodzaj]) : rodzaj;
  const skad = program ? `${zrodloHasla}${/^\p{Lu}/u.test(program) ? ' ' : ', '}${program}` : zrodloHasla;
  const haslo = [skad, okres].filter(Boolean).join(' · ');
  // Animacja w tle banera na telefonie (motyw „wachlarz/grant”): jaśniejszy promień pokazuje, jaka część okresu realizacji
  // minęła w dniu budowy strony — motyw dostaje lata od–do i ten dzień (bez obu lat — wachlarz bez wyróżnionego promienia).
  const motywDane = d.rok_od && d.rok_do ? { od: d.rok_od, do: d.rok_do, dzien: today() } : undefined;

  // Kierownik (albo kilku) ze spisu pracowników: imię i nazwisko z tytułem; link do strony domowej, a gdy jej brak — do zakładu.
  const osoby = await pracownicy();
  const kierownicy = kierownicyGrantu(d.kierownik, osoby);
  const wszystkieZaklady = await zaklady();
  const zaklad = wszystkieZaklady.find((z) => z.id === zakladGrantu(grant, osoby));
  const zakladOsoby = (id?: string) => (id && wszystkieZaklady.some((z) => z.id === id) ? id : undefined);

  // Inne projekty tego samego zakładu (najnowsze): pięć pod kartą, resztę pokazuje strona zakładu.
  const inne = zaklad ? (await granty()).filter((g) => g.id !== grant.id && zakladGrantu(g, osoby) === zaklad.id) : [];
  const opis = [`${T('Projekt', 'Project')}: ${rodzaj}${program ? ` (${program})` : ''}`, okres, kierownicy.length ? `${T('kierownik', 'PI')}: ${kierownicy.map((k) => k.nazwa).join(', ')}` : '']
    .filter(Boolean)
    .join(', ');

  return {
    tytul, tytulDrugi, maOpis, Content, okres, trwa, rodzaj, finansowanie, program, haslo, motywDane,
    osoby, kierownicy, zaklad, zakladOsoby, inne, opis,
  };
}
