// Dane strony „Struktura i zakłady”: lista zakładów, liczby kadry, tekst o organizacji, hasło i dane animacji banera.
import type { Lang } from '../daty';
import { zaklady, pracownicy, rangaStopnia } from '../tresci';
import { stronaListy } from '../tekstyStron';

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
  // tytuł, opis, hasło i tekst nad kartami zakładów (html): Web-Instytut → Strony → Struktura i zakłady
  // (src/content/strony/instytut/struktura.md; zlecenie 30, src/lib/tekstyStron.ts)
  const { tytul: naglowek, opis: lead, haslo, html } = await stronaListy('instytut/struktura', lang, { wst: true });
  // Baner na telefonie: hasło (po angielsku tylko Hasło EN — bez polskich resztek) i trzy liczby kadry
  // z odmianą po liczebniku (te same wartości co ile(0–2) wyżej; doktoranci są w banerze „Pracowników”). Rzeczowniki
  // męskoosobowe: przy 2–4 też dopełniacz („dwóch profesorów”, „43 doktorów” — „43 doktorzy” byłoby błędem).
  const liczbyTel: { n: number; pl: [string, string, string]; en: [string, string] }[] = [
    { n: ile(0), pl: ['profesor', 'profesorów', 'profesorów'], en: ['full professor', 'full professors'] },
    { n: ile(1), pl: ['doktor habilitowany', 'doktorów habilitowanych', 'doktorów habilitowanych'], en: ['habilitated researcher', 'habilitated researchers'] },
    { n: ile(2), pl: ['doktor', 'doktorów', 'doktorów'], en: ['PhD holder', 'PhD holders'] },
  ];
  // Animacja w tle banera na telefonie (motyw „dendrogram”, src/scripts/baner/motywy/dendrogram.ts): liście to członkowie
  // zakładów; zakłady łączą się w trzy obszary z tekstu strony (Treść strony: logika, algebra, topologia i geometria;
  // analiza i równania różniczkowe; rachunek prawdopodobieństwa i statystyka), a pracownia i zakłady spoza tej listy —
  // dopiero z całym Instytutem. { o: [[liczba osób w zakładzie, …] dla każdego obszaru], p: [liczba osób, …] } (bez pustych).
  const OBSZARY = [['algebra-i-teoria-modeli', 'teoria-mnogosci-i-topologia', 'geometria'], ['analiza-funkcjonalna', 'analiza-matematyczna', 'rownania-rozniczkowe'], ['teoria-prawdopodobienstwa', 'statystyka']];
  const czlonkowie = (id: string) => osoby.filter((o) => o.data.zaklad === id).length;
  const motywDane = {
    o: OBSZARY.map((ob) => ob.filter((id) => lista.some((z) => z.id === id)).map(czlonkowie).filter((n) => n > 0)).filter((ob) => ob.length > 0),
    p: lista.filter((z) => !OBSZARY.flat().includes(z.id)).map((z) => czlonkowie(z.id)).filter((n) => n > 0),
  };

  return { lista, osoby, liczby, naglowek, html, lead, haslo, liczbyTel, motywDane };
}
