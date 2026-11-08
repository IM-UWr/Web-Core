# Zasady Markdownu i automatycznych układów strony IM

Stan sprawdzony na gałęzi `main` 8 listopada 2026.

## 1. Jak strona rozpoznaje układy

Najpierw zwykły Markdown rozpoznaje nagłówki, pogrubienia, listy, linki, tabele i cytaty. Następnie własny parser strony rozpoznaje konkretne nazwy sekcji oraz budowę list i zamienia je na kafelki, osie, kontakty, zakładki i automatyczne sekcje. Nie rozpoznaje znaczenia dowolnego tekstu.

Układy działają automatycznie na kierunkach i specjalnościach. Na zwykłych stronach wymagają włączenia pola „Bloki”. Teksty działów Instytut, Nauka i Studia mają bloki włączane przez kod. Na zwykłych stronach przekształcane są przede wszystkim bloki na najwyższym poziomie treści; zagnieżdżenie nie gwarantuje rozpoznania układu.

## 2. Nagłówki i sekcje

```markdown
## Nazwa sekcji

### Nazwa podsekcji
```

Na kierunkach i specjalnościach `##` rozpoczyna sekcję trwającą do następnego `##`. Sekcja dostaje kotwicę i pozycję w spisie „Na tej stronie”. Nieznany nagłówek tworzy zwykłą sekcję tekstową. Tekst przed pierwszym `##` pozostaje przed sekcjami.

Porównanie rozpoznawanych nazw ignoruje wielkość liter, spacje na brzegach i wielokrotne białe znaki. Nie ignoruje dopisków ani interpunkcji. `## Specjalności` pasuje, lecz `## Nasze specjalności` i `## Specjalności.` nie pasują.

`## **Program studiów**` jest nagłówkiem. `**## Program studiów**` jest pogrubionym akapitem i nie uruchamia reguły nagłówka.

Nieznane kotwice powstają z nazwy: małe litery, usunięte polskie znaki, separatory zastąpione myślnikami. Powtórzenia dostają końcówki `-2`, `-3` itd.

## 3. Kafelki z listy punktowanej

```markdown
- **Pierwszy tytuł** — Opis pierwszego kafelka.
- **Drugi tytuł** — Opis drugiego kafelka.
```

Każdy punkt musi zaczynać się pogrubieniem. Opis po nim wymaga separatora `—`, `–` albo `:`. Alternatywnie tytuł może zajmować pierwszą linię, a opis następną. Co najmniej jeden punkt musi mieć opis lub dalsze linie; lista samych pogrubionych nazw nie wystarcza.

```markdown
- **Tytuł**  
  Opis kafelka.  
  Dla kogo: Osoby zainteresowane matematyką.  
  [Czytaj dalej](/studia/matematyka)
```

Pierwsza linia po samym tytule jest opisem, nawet jeśli zawiera dwukropek. Dalsze linie mogą tworzyć pary i przyciski. Rozpoznane pary są zbierane razem za opisem.

## 4. Oś kroków lub semestrów

```markdown
1. **Semestry 1–2: Podstawy** — Opis etapu.  
   Termin: Do 31 grudnia  
   Formularz: Formularz C1
2. **Semestry 3–4: Wybór specjalności** — Opis kolejnego etapu.  
   Termin: Do 30 czerwca  
   [Formularz C2](https://example.org/formularz)
```

Lista musi być numerowana, a jej pierwszy punkt zaczynać się rozpoznawanym pogrubionym tytułem. `**Etykieta: Tytuł**` dzieli się na małą etykietę i tytuł; po dwukropku musi być biały znak. Bez takiego podziału powstaje etykieta „Krok N” lub „Step N”. Opis po pogrubieniu wymaga separatora `—`, `–` albo `:`.

Kolejny punkt bez rozpoznanego pogrubionego początku jest dołączany jako dalsza treść poprzedniego kroku. Nie musi więc pojawić się jako osobny krok.

## 5. Osobne linie wewnątrz punktu

Parser rozdziela osobne akapity należące do punktu oraz wymuszone złamania linii. Ma też regułę rozdzielającą sam pogrubiony tytuł od tekstu po następującym po nim zwykłym znaku nowej linii.

Zwykła nowa linia po dłuższym opisie nie gwarantuje rozdzielenia. Bezpieczny zapis osi to trzy spacje przed kontynuacją punktu `1.`, dwie spacje na końcu poprzedniej linii i brak pustych linii wewnątrz kroku.

To zalecenie, nie zakaz wszystkich pustych akapitów. Poprawnie wcięte akapity wewnątrz punktu są obsługiwane. Niewłaściwe wcięcie może wyprowadzić treść poza listę.

## 6. Pary „Klucz: wartość”

```markdown
Termin: Do 30 czerwca
Formularz: Formularz C1
Dla kogo: Studenci I stopnia
```

W dalszych liniach kafelka, kroku lub kontaktu powstaje etykieta i wartość. Linia musi zaczynać się zwykłym tekstem; przed pierwszym dwukropkiem musi być 1–20 znaków, a po nim biały znak. Klucz nie może być pusty ani zawierać nowej linii.

„Termin” nie jest zastrzeżonym słowem. Działają też np. „Miejsce:”, „Koszt:” i „Opiekun:”. Nie działają w ten sam sposób:

```markdown
**Termin: Do 30 czerwca**
**Termin:** Do 30 czerwca
Termin:Do 30 czerwca
```

Zwykły akapit „Termin: …” poza przekształcanym blokiem nie staje się automatycznie parą.

## 7. Przycisk z linku

Sam link w dalszej linii kafelka, kroku lub kontaktu tworzy przycisk:

```markdown
[Formularz C2](https://example.org/formularz)
```

Dodatkowy tekst przy linku wyłącza rozpoznanie „samego linku”. Samodzielny akapit z samym linkiem poza takim punktem staje się jednoelementową listą linków.

## 8. Kontakty

```markdown
- *Sekretariat dydaktyczny*  
  **Jan Kowalski**  
  e-mail: [jan@example.org](mailto:jan@example.org)  
  tel.: 123 456 789  
  pokój: 315
```

Każdy punkt listy musi pasować do kontaktu. Pierwsza linia zaczyna się rolą kursywą; osoba lub instytucja jest pogrubiona w tej samej albo następnej linii. W jednej linii między rolą i osobą mogą być odstępy lub separatory `—`, `–`, `,`, `:`. Dalsze linie stają się parami, przyciskami lub akapitami.

```markdown
- *Opiekun roku* — **Jan Kowalski**  
  e-mail: [jan@example.org](mailto:jan@example.org)
```

## 9. Listy linków i dokumentów

```markdown
- [Program studiów](/pliki/studia/program.pdf)
- [Przewodnik](/pliki/studia/przewodnik.pdf) — Dodatkowe objaśnienia.
```

Każdy punkt zaczyna się linkiem i ma jedną rozpoznawaną linię. Po linku może być opis poprzedzony `—` lub `–`.

Jeżeli w rozpoznanej liście linków danej sekcji jest choć jeden plik, listy linków tej sekcji dostają wygląd dokumentów. Plik rozpoznawany jest po rozszerzeniu na końcu ścieżki (przed `?` lub `#`) albo fragmencie `/pliki/`. Rozszerzenie wyświetlane jest wielkimi literami. Adres bez rozszerzenia dostaje etykietę strony.

Reguła rozszerzeń jest ogólna: także `.php` może zostać uznane za plik. Na specjalnościach „Przydatne strony” wyłącza wygląd dokumentów nawet dla takich adresów.

## 10. Tabele

```markdown
| Sprawa | Termin | Formularz |
|-|-|-|
| Deklaracja | Do 30 czerwca | [C2][C2] |

[C2]: https://example.org/formularz
```

Krótki separator jest obsługiwany. Spacje wyrównują tylko źródło. Linki referencyjne działają jak bezpośrednie. Na kierunkach i specjalnościach tabele w sekcjach blokowych dostają specjalny styl; prezentacja na telefonie może być inna. Samo włączenie „Bloków” zwykłej strony nie nadaje tabelom tej klasy.

## 11. Rozwijane pytania

```markdown
### Kiedy wybieram specjalność?

Treść odpowiedzi.
```

Dokładnie `###` zakończone `?` tworzy pytanie. Odpowiedź trwa do następnego nagłówka dowolnego poziomu. Nazwa sekcji „Pytania i odpowiedzi” nie jest wymagana do samego rozwijania. `#### Pytanie?` nie uruchamia reguły.

## 12. Ramka z cytatu

```markdown
> **Dla kogo**
>
> Tekst ramki.
```

Cytat musi zaczynać się osobnym akapitem zawierającym wyłącznie pogrubienie, po którym jest co najmniej jeszcze jeden blok. Pierwszy akapit staje się etykietą. Nazwa „Dla kogo” nie jest obowiązkowa. Na specjalności powstaje dedykowana ramka uwagi; w innych obsługiwanych treściach cytat z etykietą.

## 13. Zakładki „Program studiów” — tylko kierunki

```markdown
## Program studiów

### Nowy program

Treść nowego programu.

### Stary program

Treść starego programu.
```

Regułę uruchamiają „Program studiów”, „Program kształcenia”, „Curriculum” lub „Programme”. Każde `###` zaczyna panel; jego nazwa jest dowolną nazwą zakładki. Panel trwa do kolejnego `###` lub końca sekcji. Tekst przed pierwszym `###` stoi nad panelami.

Przełącznik powstaje przy co najmniej dwóch panelach. Jeden lub brak podsekcji oznacza brak przełącznika. Bez JavaScriptu panele są widoczne jeden pod drugim. Ta reguła nie jest przypisana do specjalności.

## 14. Automatyczne specjalności — na stronie kierunku

`## Specjalności`, `## Specialisations` lub `## Specializations` wskazuje miejsce kafelków. Trafiają pod nagłówek i ewentualny tekst redaktora.

Kod wybiera specjalności przypisane do kierunku, z `opublikowany` innym niż `false` i włączonym pokazywaniem na stronie kierunku. Nie odczytuje listy specjalności z tekstu Markdown.

Jeżeli kierunek ma specjalności bez wpisanego nagłówka, sekcja jest dodawana na końcu. Pusta sekcja bez specjalności i bez tekstu jest pomijana.

## 15. Pełna mapa sekcji kierunków

„Tekst” to zwykła proza z rozpoznawanymi blokami; „Bloki” to układ bez obudowy prozy, ze specjalnym stylem tabel.

| Nazwy nagłówka `##` | Kotwica | Działanie |
|---|---|---|
| O kierunku; About; O szkole doktorskiej; About the doctoral school; O Kolegium Doktorskim; About the Doctoral College | o-kierunku | Tekst |
| Strony szkoły doktorskiej; Doctoral school pages; Przydatne strony; Useful pages | strony | Bloki |
| Dlaczego warto; Why join | dlaczego | Bloki |
| Jak wyglądają studia; How the studies work; Od rekrutacji do obrony; From admission to defence; Ścieżka doktoranta; The doctoral path | przebieg | Bloki |
| Specjalności; Specialisations; Specializations | specjalnosci | Automatyczne kafelki |
| Terminy i formularze; Deadlines and forms; Terminy; Deadlines | terminy | Bloki |
| Program studiów; Program kształcenia; Curriculum; Programme | program | Zakładki |
| Praktyki pedagogiczne; Teaching placements | praktyki | Tekst |
| Po studiach; After graduation | po-studiach | Tekst |
| Pytania i odpowiedzi; FAQ; Najczęstsze pytania; Frequently asked questions | pytania | Bloki |
| Kontakt; Contact | kontakt | Bloki |
| Akty prawne; Regulations; Akty prawne i regulaminy | akty | Bloki |

Kotwice poprzedzamy `#` w linkach. Wybrane długie nazwy mają skróty w spisie: „O Kolegium Doktorskim” → „O Kolegium”, „About the Doctoral College” → „About”, „Najczęstsze pytania” → „Pytania”, „Frequently asked questions” → „FAQ”, „Akty prawne i regulaminy” → „Akty prawne”.

## 16. Pełna mapa specjalnych sekcji specjalności

Własne reguły specjalności mają pierwszeństwo przed wspólnymi.

| Nazwy nagłówka `##` | Kotwica | Działanie |
|---|---|---|
| O specjalności; About | o-specjalnosci | Tekst i ramka z cytatu |
| Przydatne strony; Useful pages | linki | Listy linków bez wyglądu dokumentów |
| Dlaczego warto; Why choose it | dlaczego | Bloki |
| Jak przebiega specjalność; How the specialisation works | przebieg | Oś, dane banera, domyślne miejsce ramki wyboru |
| Wybór specjalności; Choosing a specialisation | wybor | Automatyczna ramka wyboru |
| Czego się uczysz; What you will learn | przedmioty | Grupy przedmiotów i dane licznika |
| Co będziesz umieć; Skills | umiejetnosci | Listy z kreskami |
| Po studiach; Careers | po-studiach | Tekst |
| Przykładowe tematy prac; Sample thesis topics | tematy | Kreski i przygaszony opis po „ — ” |
| Seminaria; Seminars | seminaria | Automatyczne seminaria |
| Dokumenty; Documents | dokumenty | Bloki i dokumenty |
| Pytania i odpowiedzi; FAQ | pytania | Bloki i pytania `### …?` |
| Opiekun specjalności; Opiekunowie specjalności; Opiekunka specjalności; Opiekunki specjalności; Coordinator; Coordinators | opiekun | Automatyczne dane opiekunów |

Specjalności dziedziczą też wspólne nazwy z tabeli kierunków, jeżeli nie nadpisuje ich własna reguła. Nie dziedziczą reguł przypisanych wyłącznie do kierunku: automatycznych kafelków „Specjalności” i zakładek „Program studiów”. „Jak przebiega specjalność” ma skrót spisu „Jak przebiega”, angielska wersja „How it works”.

## 17. Automatyczne wstawki specjalności

### Seminaria

Pod „Seminaria”/„Seminars” trafiają publikowane seminaria wskazane w polu „Seminaria”, w kolejności wyboru. Tekst redaktora pozostaje przed listą.

### Opiekun

Pod rozpoznanym nagłówkiem opiekuna trafiają dane z listy opiekunów i spisu pracowników. Dopasowanie odbywa się po imieniu i nazwisku; przy kilku wpisach pierwszeństwo ma nauczyciel akademicki przed administracją. Nagłówek może zmienić się na pojedynczy lub mnogi zależnie od liczby opiekunów.

### Wybór

Pod „Wybór specjalności”/„Choosing a specialisation” trafia ramka z informacją i linkiem do terminów kierunku. Bez tego nagłówka trafia na koniec „Jak przebiega specjalność”, a jeśli tej sekcji nie ma — na koniec pierwszej sekcji. Przy braku sekcji może pojawić się po treści wstępnej.

### Brak nagłówków i danych

Seminaria i opiekun mogą być dodane mimo braku nagłówków, według kolejności kodu. Brak nagłówka nie wyłącza wstawki. Pusta sekcja automatyczna bez danych i tekstu jest pomijana. Wstawka danego rodzaju jest dodawana najwyżej raz.

## 18. Umiejętności i tematy prac

Zwykłe listy w „Co będziesz umieć” i „Przykładowe tematy prac” dostają kreski. W tematach dokładny separator ` — ` oddziela tytuł od drobniejszego, przygaszonego opisu:

```markdown
- Modelowanie epidemii — Zastosowania równań różniczkowych.
```

Wcześniej działają reguły kafelków, kontaktów i linków. Kreski obejmują listy nierozpoznane jako inny blok. Polski tytuł na angielskiej stronie może dostać oznaczenie języka polskiego; nie jest automatycznie tłumaczony.

## 19. Liczby banera specjalności

Stopnie studiów I, II, III są odczytywane z pola „poziom”.

Semestr wyboru: kod czyta oś w „Jak przebiega specjalność”, szuka pierwszego tytułu zawierającego fragment o deklaracji lub wyborze specjalności i pobiera pierwszą liczbę z jego etykiety:

```markdown
1. **Koniec semestru 4: Deklaracja specjalności** — Opis.
```

Liczba przedmiotów: w „Czego się uczysz” nagłówki `###` wyznaczają grupy, a liczone są punkty list pod nimi. Baner sumuje grupy, których polska nazwa zawiera „program od”, z pominięciem nazw zawierających „wspóln”.

Liczby pochodzą z polskiej treści także dla wersji angielskiej. Brak pasujących danych oznacza brak pozycji.

## 20. Strony działów i strony z listami

Zasadniczo tekst redaktora stoi nad automatyczną listą. Wyjątki:

| Adres | Nagłówek | Działanie |
|---|---|---|
| /instytut | Ostatnie sukcesy; Recent achievements | Sekcja trafia do miejsca zestawienia sukcesów |
| /nauka/publikacje | Czasopisma redagowane w Instytucie; Journals edited at the Institute | Sekcja trafia do miejsca listy czasopism |

Sekcja trwa do kolejnego `##`. Reszta tekstu pozostaje w części głównej. Nagłówki „Konsultacje” i „Office hours” na zwykłych stronach mają stałą kotwicę `#konsultacje`.

Przy „Blokach” pierwszy akapit bezpośrednio po pierwszym `##` może otrzymać większy styl wstępu. Teksty działów mają też własne wyróżnienie pierwszego akapitu.

## 21. Linki wewnętrzne i zewnętrzne

```markdown
[Matematyka](/studia/matematyka)
[Dokument](/pliki/studia/program.pdf)
[Terminy](/studia/matematyka#terminy)
```

Kod dopisuje bazową ścieżkę publikacji. W treściach renderowanych po angielsku linki do stron mogą otrzymać `/en`. Nie dotyczy to m.in. plików, grafik, adresów z rozszerzeniami, adresów już z `/en`, samych kotwic, `mailto:` i `tel:`.

Zewnętrzne HTTP/HTTPS otrzymują oznaczenie i dopisek dla czytników ekranu; reguła zachowuje otwieranie w tej samej karcie.

## 22. Wzory matematyczne

```markdown
Przestrzeń $\ell^2$.

$$
a^2+b^2=c^2
$$
```

Wzory renderuje KaTeX. Dodatkowa wtyczka próbuje odwrócić podwojone ukośniki przed poleceniami oraz ukośniki dodane przed `_` i `*` po zapisie edytorem wizualnym. Nie naprawia wszystkich uszkodzeń ani utraconych znaków. Wybrane tytuły mają osobny renderer, który przetwarza matematykę, pozostawiając pozostały tekst dosłownie.

## 23. Łamanie i limity prezentacji

Komórki tabel do 30 znaków, bez wzorów, dostają znacznik limitu dwóch linii. Nazwiska i e-maile w rozpoznanych kontaktach także dostają znaczniki limitu. E-mail może łamać się przed `@`. Mechanizm mierzenia układu wykorzystuje te znaczniki; tekst źródłowy nie jest usuwany.

## 24. Komentarze

```markdown
<!-- EDYTOR: Tu zaczyna się oś semestrów. -->
```

Komentarze HTML nie są widoczne na stronie. Umieszczaj je przed całymi blokami. Nie używaj jako komentarzy redakcyjnych znaczników technicznych `<!--specjalnosci-->`, `<!--wstaw:seminaria-->`, `<!--wstaw:opiekun-->` ani `<!--wstaw:wybor-->`; są przeznaczone do automatycznych wstawek.

## 25. Kolejność i pułapki

Listy punktowane są sprawdzane w kolejności: kontakty, kafelki, linki/pliki, zwykła lista. Na specjalności odpowiednie sekcje mogą później nadać zwykłej liście kreski.

Najczęstsze błędy to pogrubiony cały zapis nagłówka, inna nazwa sekcji lub dopisana kropka, `\-` zamiast listy, `\(` przy linku, pogrubione „Termin:”, brak spacji po dwukropku, brak wymuszonego złamania, złe wcięcie, dodatkowy tekst przy przycisku, niepasujący punkt listy albo zmiana słów służących do wyliczania banera.

Tryb `code` CMS zmienia sposób edycji, nie reguły renderowania strony.

## 26. Które nazwy uruchamiają szczególne funkcje?

### Funkcje zależne od nazwy sekcji

- Kierunek: „Program studiów”/„Program kształcenia”/„Curriculum”/„Programme” — zakładki.
- Kierunek: „Specjalności”/„Specialisations”/„Specializations” — automatyczne kafelki.
- Specjalność: „Seminaria”/„Seminars” — automatyczne seminaria.
- Specjalność: rozpoznane warianty „Opiekun specjalności”/„Coordinator” — automatyczne dane opiekunów.
- Specjalność: „Wybór specjalności”/„Choosing a specialisation” — miejsce ramki wyboru.
- Specjalność: „Jak przebiega specjalność”/„How the specialisation works” — miejsce ramki i odczyt osi do liczb banera.
- Specjalność: „Czego się uczysz”/„What you will learn” — odczyt grup do licznika przedmiotów.
- Specjalność: „Co będziesz umieć”/„Skills” — listy z kreskami.
- Specjalność: „Przykładowe tematy prac”/„Sample thesis topics” — kreski i przygaszony opis.
- Specjalność: „Przydatne strony”/„Useful pages” — wyłączenie wyglądu dokumentów.
- /instytut: „Ostatnie sukcesy”/„Recent achievements” — przeniesienie sekcji do miejsca listy.
- /nauka/publikacje: „Czasopisma redagowane w Instytucie”/„Journals edited at the Institute” — przeniesienie sekcji do miejsca listy.

### Nazwy nadające głównie kotwicę i układ

Pozostałe nazwy w mapach, np. „Dlaczego warto”, „Kontakt”, „Terminy i formularze”, „Pytania i odpowiedzi”, „Dokumenty”, nie są same w sobie poleceniem utworzenia kafelków, kontaktów czy pytań. Nadają sekcji stały adres i układ. Elementy powstają z budowy treści: listy, kursywy, pogrubienia, tabeli lub `### …?`.

„Konsultacje”/„Office hours” nadaje stały adres `#konsultacje`.

### Znaczące słowa inne niż nagłówki

W polskiej treści specjalności słowa „program od” i „wspóln” w nazwach grup oraz fragmenty dotyczące deklaracji/wyboru specjalności w tytułach kroków wpływają na liczby banera. Same nazwy „Termin”, „Formularz”, „Dla kogo” nie są wymaganymi słowami kluczowymi — decyduje struktura.

## Źródła kodu

- [Parser bloków](https://github.com/IM-UWr/Web-Core/blob/main/src/plugins/rehype-bloki.mjs)
- [Mapa nagłówków](https://github.com/IM-UWr/Web-Core/blob/main/src/plugins/kotwice.mjs)
- [Automatyka specjalności](https://github.com/IM-UWr/Web-Core/blob/main/src/lib/widoki/specjalnosc.ts)
- [Teksty działów i list](https://github.com/IM-UWr/Web-Core/blob/main/src/lib/tekstyStron.ts)
- [Konfiguracja Markdownu](https://github.com/IM-UWr/Web-Core/blob/main/astro.config.mjs)
- [Linki wewnętrzne](https://github.com/IM-UWr/Web-Core/blob/main/src/plugins/rehype-base.mjs)
- [Linki zewnętrzne](https://github.com/IM-UWr/Web-Core/blob/main/src/plugins/rehype-zewn.mjs)
- [Naprawianie zapisu wzorów](https://github.com/IM-UWr/Web-Core/blob/main/src/plugins/remark-wzory-edytora.mjs)
- [Limity prezentacji](https://github.com/IM-UWr/Web-Core/blob/main/src/plugins/rehype-limity.mjs)
