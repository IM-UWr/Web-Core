// Kotwice treści kierunku (zlecenie 28): nagłówek ## o jednej z tych nazw (porównanie bez wielkości liter, PL albo EN)
// dostaje stałe id sekcji (linki z innych stron, np. przypomnienia → /studia/matematyka#terminy), układ i ewentualnie rolę.
// Jedno miejsce dla wtyczki bloków (rehype-bloki.mjs) i widoków; zlecenia 29–30 dopisują tu swoje kotwice.
//   uklad 'proza' — tekst sekcji w div.prose, jak zwykły tekst z Markdownu; rozpoznane bloki (kafelki, listy plików…) między akapitami;
//   uklad 'bloki' — bloki bez obudowy .prose, tabela jako table.tab (na telefonie w bloki);
//   rola 'specjalnosci' — strona wstawia pod nagłówkiem (i pod tekstem edytora) kafelki specjalności; kierunek bez specjalności:
//     sam nagłówek się nie wyświetla; brak nagłówka przy kierunku ze specjalnościami — sekcja na końcu treści;
//   rola 'program' — nagłówki ### w sekcji to zakładki (.tresc-taby); jedna podsekcja albo brak ### — bez zakładek;
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
  { id: 'specjalnosci', uklad: 'bloki', rola: 'specjalnosci', nazwy: ['Specjalności', 'Specialisations', 'Specializations'] },
  { id: 'terminy', uklad: 'bloki', nazwy: ['Terminy i formularze', 'Deadlines and forms', 'Terminy', 'Deadlines'] },
  { id: 'program', uklad: 'bloki', rola: 'program', nazwy: ['Program studiów', 'Curriculum', 'Program kształcenia', 'Programme'] },
  { id: 'praktyki', uklad: 'proza', nazwy: ['Praktyki pedagogiczne', 'Teaching placements'] },
  { id: 'po-studiach', uklad: 'proza', nazwy: ['Po studiach', 'After graduation'] },
  { id: 'pytania', uklad: 'bloki', nazwy: ['Pytania i odpowiedzi', 'FAQ'] },
  { id: 'pytania', uklad: 'bloki', nazwy: ['Najczęstsze pytania'], krotko: 'Pytania' },
  { id: 'pytania', uklad: 'bloki', nazwy: ['Frequently asked questions'], krotko: 'FAQ' },
  { id: 'kontakt', uklad: 'bloki', nazwy: ['Kontakt', 'Contact'] },
  { id: 'akty', uklad: 'bloki', nazwy: ['Akty prawne', 'Regulations'] },
  { id: 'akty', uklad: 'bloki', nazwy: ['Akty prawne i regulaminy'], krotko: 'Akty prawne' },
];

const klucz = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pl');
const MAPA = new Map(KOTWICE.flatMap((k) => k.nazwy.map((n) => [klucz(n), k])));

/** Kotwica dla tekstu nagłówka ## albo undefined. */
export const kotwica = (tekst) => MAPA.get(klucz(tekst));

/** Nagłówki domyślne (sekcja dopisana przez stronę, gdy edytor jej nie ma). */
export const NAGLOWEK_SPECJALNOSCI = { pl: 'Specjalności', en: 'Specialisations' };
