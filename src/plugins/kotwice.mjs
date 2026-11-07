// Kotwice treści z jednego Markdownu (kierunki — zlecenie 28, specjalności — zlecenie 29, strony działów i z listą — zlecenie 30,
// typ 'strona' na końcu listy, src/lib/tekstyStron.ts): nagłówek ## o jednej z tych nazw
// (porównanie bez wielkości liter, PL albo EN) dostaje stałe id sekcji (linki z innych stron, np. przypomnienia →
// /studia/matematyka#terminy), układ i ewentualnie rolę. Jedno miejsce dla wtyczki bloków (rehype-bloki.mjs) i widoków.
//   typ — strona, na której działa kotwica ('kierunek' | 'specjalnosc'); bez typu — na obu. Kotwica swojego typu ma
//     pierwszeństwo (np. „Przydatne strony”: na kierunku #strony, na specjalności #linki, jak dotąd);
//   uklad 'proza' — tekst sekcji w div.prose, jak zwykły tekst z Markdownu; rozpoznane bloki (kafelki, listy plików…) między akapitami;
//   uklad 'bloki' — bloki bez obudowy .prose, tabela jako table.tab (na telefonie w bloki);
//   rola 'specjalnosci' — strona wstawia pod nagłówkiem (i pod tekstem edytora) kafelki specjalności; kierunek bez specjalności:
//     sam nagłówek się nie wyświetla; brak nagłówka przy kierunku ze specjalnościami — sekcja na końcu treści;
//   rola 'program' — nagłówki ### w sekcji to zakładki (.tresc-taby); jedna podsekcja albo brak ### — bez zakładek;
//   wstawka — sekcja liczona z innych danych (specjalność: seminaria z pola „Seminaria”, opiekunowie ze spisu pracowników,
//     ramka „Wybór specjalności” z linkiem do terminów kierunku): strona wstawia ją pod nagłówkiem (i pod tekstem edytora);
//     bez nagłówka — w jej dawnym miejscu (kolejność kotwic tego typu na liście niżej); bez danych i bez tekstu — bez sekcji;
//   wstawkaNaKoncu — ta wstawka trafia na koniec tej sekcji, gdy nie ma osobnego nagłówka (ramka „Wybór specjalności” pod osią);
//   lista 'kreski' — zwykła lista w sekcji to ul.kreski; opisPo — w punkcie „Tytuł — opis” opis szarym drobniejszym tekstem
//     (span.sp-opis), a tytuł wyglądający na polski na stronie EN dostaje lang="pl" (tematy prac zostają w języku oryginału);
//   pliki false — listy linków w sekcji zawsze jako ul.linki (bez ikon i typów), także z adresem na .php (USOS);
//   krotko — krótsza etykieta w spisie „Na tej stronie” (pełna zostaje w nagłówku i w podpowiedzi).
// Nagłówek spoza listy: id z treści nagłówka, układ 'proza'.
export const KOTWICE = [
  { id: 'o-kierunku', uklad: 'proza', nazwy: ['O kierunku', 'About', 'O szkole doktorskiej', 'About the doctoral school'] },
  { id: 'o-kierunku', uklad: 'proza', nazwy: ['O Kolegium Doktorskim'], krotko: 'O Kolegium' },
  { id: 'o-kierunku', uklad: 'proza', nazwy: ['About the Doctoral College'], krotko: 'About' },
  { id: 'strony', uklad: 'bloki', nazwy: ['Strony szkoły doktorskiej', 'Doctoral school pages', 'Przydatne strony', 'Useful pages'] },
  { id: 'dlaczego', uklad: 'bloki', nazwy: ['Dlaczego warto', 'Why join'] },
  {
    id: 'przebieg', uklad: 'bloki',
    nazwy: ['Jak wyglądają studia', 'How the studies work', 'Od rekrutacji do obrony', 'From admission to defence', 'Ścieżka doktoranta', 'The doctoral path'],
  },
  { id: 'specjalnosci', typ: 'kierunek', uklad: 'bloki', rola: 'specjalnosci', nazwy: ['Specjalności', 'Specialisations', 'Specializations'] },
  { id: 'terminy', uklad: 'bloki', nazwy: ['Terminy i formularze', 'Deadlines and forms', 'Terminy', 'Deadlines'] },
  { id: 'program', typ: 'kierunek', uklad: 'bloki', rola: 'program', nazwy: ['Program studiów', 'Curriculum', 'Program kształcenia', 'Programme'] },
  { id: 'praktyki', uklad: 'proza', nazwy: ['Praktyki pedagogiczne', 'Teaching placements'] },
  { id: 'po-studiach', uklad: 'proza', nazwy: ['Po studiach', 'After graduation'] },
  { id: 'pytania', uklad: 'bloki', nazwy: ['Pytania i odpowiedzi', 'FAQ'] },
  { id: 'pytania', uklad: 'bloki', nazwy: ['Najczęstsze pytania'], krotko: 'Pytania' },
  { id: 'pytania', uklad: 'bloki', nazwy: ['Frequently asked questions'], krotko: 'FAQ' },
  { id: 'kontakt', uklad: 'bloki', nazwy: ['Kontakt', 'Contact'] },
  { id: 'akty', uklad: 'bloki', nazwy: ['Akty prawne', 'Regulations'] },
  { id: 'akty', uklad: 'bloki', nazwy: ['Akty prawne i regulaminy'], krotko: 'Akty prawne' },

  // Specjalność (zlecenie 29) — w kolejności sekcji na stronie (miejsce wstawki bez nagłówka).
  { id: 'o-specjalnosci', typ: 'specjalnosc', uklad: 'proza', nazwy: ['O specjalności', 'About'] },
  { id: 'linki', typ: 'specjalnosc', uklad: 'bloki', pliki: false, nazwy: ['Przydatne strony', 'Useful pages'] },
  { id: 'dlaczego', typ: 'specjalnosc', uklad: 'bloki', nazwy: ['Dlaczego warto', 'Why choose it'] },
  { id: 'przebieg', typ: 'specjalnosc', uklad: 'bloki', wstawkaNaKoncu: 'wybor', nazwy: ['Jak przebiega specjalność'], krotko: 'Jak przebiega' },
  { id: 'przebieg', typ: 'specjalnosc', uklad: 'bloki', wstawkaNaKoncu: 'wybor', nazwy: ['How the specialisation works'], krotko: 'How it works' },
  { id: 'wybor', typ: 'specjalnosc', uklad: 'bloki', wstawka: 'wybor', nazwy: ['Wybór specjalności', 'Choosing a specialisation'] },
  { id: 'przedmioty', typ: 'specjalnosc', uklad: 'bloki', nazwy: ['Czego się uczysz', 'What you will learn'] },
  { id: 'umiejetnosci', typ: 'specjalnosc', uklad: 'bloki', lista: 'kreski', nazwy: ['Co będziesz umieć', 'Skills'] },
  { id: 'po-studiach', typ: 'specjalnosc', uklad: 'proza', nazwy: ['Po studiach', 'Careers'] },
  { id: 'tematy', typ: 'specjalnosc', uklad: 'bloki', lista: 'kreski', opisPo: true, nazwy: ['Przykładowe tematy prac', 'Sample thesis topics'] },
  { id: 'seminaria', typ: 'specjalnosc', uklad: 'bloki', wstawka: 'seminaria', nazwy: ['Seminaria', 'Seminars'] },
  { id: 'dokumenty', typ: 'specjalnosc', uklad: 'bloki', nazwy: ['Dokumenty', 'Documents'] },
  { id: 'pytania', typ: 'specjalnosc', uklad: 'bloki', nazwy: ['Pytania i odpowiedzi', 'FAQ'] },
  {
    id: 'opiekun', typ: 'specjalnosc', uklad: 'bloki', wstawka: 'opiekun',
    nazwy: ['Opiekun specjalności', 'Opiekunowie specjalności', 'Opiekunka specjalności', 'Opiekunki specjalności', 'Coordinator', 'Coordinators'],
  },

  // Strona działu i strony z listą (zlecenie 30) — typ 'strona', tylko na stronie o adresie `adres` (src/lib/tekstyStron.ts):
  // sekcja pod tym nagłówkiem (do następnego ##) idzie na miejsce swojej listy; reszta tekstu stoi nad listą.
  { id: 'sukcesy', typ: 'strona', adres: '/instytut', nazwy: ['Ostatnie sukcesy', 'Recent achievements'] },
  { id: 'czasopisma', typ: 'strona', adres: '/nauka/publikacje', nazwy: ['Czasopisma redagowane w Instytucie', 'Journals edited at the Institute'] },
];

export const klucz = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pl');
const mapa = (typ) => {
  const m = new Map();
  // najpierw kotwice tego typu, potem wspólne
  for (const k of [...KOTWICE.filter((x) => x.typ === typ), ...KOTWICE.filter((x) => !x.typ)]) {
    for (const n of k.nazwy) if (!m.has(klucz(n))) m.set(klucz(n), k);
  }
  return m;
};
const MAPY = { kierunek: mapa('kierunek'), specjalnosc: mapa('specjalnosc') };

/** Kotwica dla tekstu nagłówka ## na stronie danego typu albo undefined. */
export const kotwica = (tekst, typ = 'kierunek') => MAPY[typ]?.get(klucz(tekst));

/** Kolejność sekcji strony danego typu (id kotwic tego typu, bez powtórzeń) — miejsce wstawki bez nagłówka. */
export const kolejnosc = (typ) => [...new Set(KOTWICE.filter((k) => k.typ === typ).map((k) => k.id))];

/** Nagłówki domyślne (sekcja dopisana przez stronę, gdy edytor jej nie ma). */
export const NAGLOWEK_SPECJALNOSCI = { pl: 'Specjalności', en: 'Specialisations' };
