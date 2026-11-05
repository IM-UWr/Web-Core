// Dane strony „Struktura i zakłady”: lista zakładów, liczby kadry, tekst o organizacji, hasło i dane animacji banera.
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { zaklady, pracownicy, rangaStopnia } from '../tresci';
import dzial from '../../data/dzialy/instytut.json';

export async function daneListyZakladow(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const lista = await zaklady();
  const osoby = await pracownicy();
  const kadra = osoby.filter((o) => o.data.grupa === 'nauczyciel');
  const ile = (r: number) => kadra.filter((o) => rangaStopnia(o.data.stopien) === r).length;
  const liczby = [
    { n: ile(0), l: T('profesorów', 'professors') },
    { n: ile(1), l: T('doktorów habilitowanych', 'Dr hab. holders') },
    { n: ile(2), l: T('doktorów', 'PhD holders') },
    { n: osoby.filter((o) => o.data.grupa === 'doktorant').length, l: T('doktorantów', 'PhD students') },
  ];
  const naglowek = T('Struktura i zakłady', 'Structure and departments');
  const tekst = ((wybierz(dzial, 'struktura_tekst', lang) as string) || '').split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const lead = T('W skład Instytutu wchodzi osiem zakładów naukowych i Pracownia Dydaktyki i Popularyzacji Matematyki.', 'The Institute consists of eight research departments and the Mathematics Education and Outreach Unit.');
  // Baner na telefonie: hasło z danych działu (po angielsku tylko pole _en — bez polskich resztek) i trzy liczby kadry
  // z odmianą po liczebniku (te same wartości co ile(0–2) wyżej; doktoranci są w banerze „Pracowników”). Rzeczowniki
  // męskoosobowe: przy 2–4 też dopełniacz („dwóch profesorów”, „43 doktorów” — „43 doktorzy” byłoby błędem).
  const haslo = ((lang === 'en' ? (dzial as any).struktura_haslo_en : (dzial as any).struktura_haslo) as string | undefined) || undefined;
  const liczbyTel: { n: number; pl: [string, string, string]; en: [string, string] }[] = [
    { n: ile(0), pl: ['profesor', 'profesorów', 'profesorów'], en: ['full professor', 'full professors'] },
    { n: ile(1), pl: ['doktor habilitowany', 'doktorów habilitowanych', 'doktorów habilitowanych'], en: ['habilitated researcher', 'habilitated researchers'] },
    { n: ile(2), pl: ['doktor', 'doktorów', 'doktorów'], en: ['PhD holder', 'PhD holders'] },
  ];
  // Animacja w tle banera na telefonie (motyw „dendrogram”, src/scripts/baner/motywy/dendrogram.ts): liście to członkowie
  // zakładów; zakłady łączą się w trzy obszary z tekstu strony (struktura_tekst: logika, algebra, topologia i geometria;
  // analiza i równania różniczkowe; rachunek prawdopodobieństwa i statystyka), a pracownia i zakłady spoza tej listy —
  // dopiero z całym Instytutem. { o: [[liczba osób w zakładzie, …] dla każdego obszaru], p: [liczba osób, …] } (bez pustych).
  const OBSZARY = [['algebra-i-teoria-modeli', 'teoria-mnogosci-i-topologia', 'geometria'], ['analiza-funkcjonalna', 'analiza-matematyczna', 'rownania-rozniczkowe'], ['teoria-prawdopodobienstwa', 'statystyka']];
  const czlonkowie = (id: string) => osoby.filter((o) => o.data.zaklad === id).length;
  const motywDane = {
    o: OBSZARY.map((ob) => ob.filter((id) => lista.some((z) => z.id === id)).map(czlonkowie).filter((n) => n > 0)).filter((ob) => ob.length > 0),
    p: lista.filter((z) => !OBSZARY.flat().includes(z.id)).map((z) => czlonkowie(z.id)).filter((n) => n > 0),
  };

  return { lista, osoby, liczby, naglowek, tekst, lead, haslo, liczbyTel, motywDane };
}
