// Dane strony konferencji (src/views/Konferencja.astro; zlecenie 40, decyzja właściciela 18.11: konferencja z opisem ma
// własną stronę, jak projekt): tytuły, termin, miejsce, zakład, plakietka stanu, opis strony dla wyszukiwarek.
import { render } from 'astro:content';
import { range, type Lang } from '../daty';
import { langTekstu } from '../i18n';
import { zaklady, miejsce, trwaLubBedzie, type Konferencja } from '../tresci';

export async function daneKonferencji(konferencja: Konferencja, lang: Lang) {
  const d = konferencja.data;
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const tytul = (lang === 'en' && d.tytul_en) || d.tytul;
  // tytuł w drugim języku (pod nagłówkiem), jeśli jest — jak na stronie projektu
  const tytulDrugi = lang === 'en' ? (d.tytul_en ? { tekst: d.tytul, lang: 'pl' } : undefined) : d.tytul_en ? { tekst: d.tytul_en, lang: 'en' } : undefined;
  const { Content } = await render(konferencja);
  // Opis ma tylko wersję polską (formularz nie ma Treści EN): na /en dostaje lang="pl", gdy wygląda na polski
  // (wiele opisów jest po angielsku; src/lib/jezykTekstu.ts).
  const opisLang = langTekstu(konferencja.body, lang);
  const termin = range(d.poczatek, d.koniec, lang);
  const gdzie = miejsce(d.miejsce, lang);
  const zaklad = d.zaklad ? (await zaklady()).find((z) => z.id === d.zaklad) : undefined;
  // plakietka w banerze: odwołana albo nadchodząca (jak na stronie zakładu: trwająca też liczy się jako nadchodząca)
  const stan = d.odwolana
    ? { etykieta: T('odwołana', 'cancelled'), trwa: false }
    : trwaLubBedzie({ poczatek: d.poczatek, koniec: d.koniec }) ? { etykieta: T('nadchodząca', 'upcoming'), trwa: true } : undefined;
  const opis = [T('Konferencja', 'Conference'), termin, gdzie].filter(Boolean).join(', ');
  return { tytul, tytulDrugi, Content, opisLang, termin, gdzie, zaklad, stan, opis };
}
