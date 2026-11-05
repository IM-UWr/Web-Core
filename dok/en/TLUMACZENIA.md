# Wersja angielska — tłumaczenia do przejrzenia (zlecenie 11, zalecenie 12)

Gałąź `wyglad/en`. Audyt: `dok/en/RAPORT-EN.md` na gałęzi `kopia/2026-11-01-estetyka-prototypy` (numery K…, C…, D…).
Tabela zbiera wszystkie tłumaczenia wprowadzone w kodzie i przygotowane w łatkach treści, żeby właściciel mógł je przejrzeć
w jednym miejscu. Zmiana tłumaczenia: w kodzie — plik podany w nagłówku sekcji; w treściach — pole `_en` w CMS (albo w łatce
przed nałożeniem).

## 1. Teksty w kodzie

### Patroni działów (`src/lib/patroni.ts`; K1, K2)

| Pole | PL | EN |
|---|---|---|
| Marczewski — notka (baner Instytutu) | Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962. Zabiegał o budowę gmachu Instytutu. | A co-founder of Wrocław mathematics and Rector of the University in 1957–1962. He campaigned for the construction of the Institute building. |
| Marczewski — fakt (okładka) | Pierwszy dyrektor Instytutu. | The Institute’s first director. |
| Ślebodziński — notka (baner Nauki) | Geometra różniczkowy. W 1931 roku wprowadził pochodną Liego, dziś jedno z podstawowych narzędzi geometrii. | A differential geometer. In 1931 he introduced the Lie derivative, now one of the basic tools of geometry. |
| Ślebodziński — fakt | Wprowadził pochodną Liego. | Introduced the Lie derivative. |
| Knaster — notka (baner Studiów) | Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym. Wychował pokolenia wrocławskich matematyków. | A topologist and co-author of the Knaster–Tarski fixed-point theorem. He trained generations of Wrocław mathematicians. |
| Knaster — fakt | Topolog, oddany dydaktyce. | A topologist devoted to teaching. |
| Steinhaus — notka (baner Popularyzacji) | Współtwórca szkoły lwowskiej i wrocławskiej, mistrz matematycznego aforyzmu i popularyzacji. | A co-founder of the Lwów and Wrocław schools of mathematics, and a master of the mathematical aphorism and of popularisation. |
| Steinhaus — fakt | „Między duchem a materią pośredniczy matematyka”. | “Mathematics mediates between mind and matter.” |

Uwaga: „autor twierdzenia Knastera–Tarskiego” przetłumaczone jako „co-author” (twierdzenie ma dwóch autorów).

### Inne napisy w kodzie

| Gdzie | PL | EN | Pozycja audytu |
|---|---|---|---|
| daty (`src/lib/daty.ts`, `short()`) | 29.10.2026 · 28.10 | 29 Oct 2026 · 28 Oct | K3 |
| obrona bez `tresc_en` (`src/lib/widoki/obrona.ts`) | Zapraszamy na publiczną obronę rozprawy doktorskiej … pt. *…*. Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of [kandydat], entitled *[tytuł]*, on [dzień, data, godzina], in [miejsce]. Supervisor: [promotor]. The dissertation, abstracts and reviews are available below. (po terminie: „The public defence of … took place on …”) | K4 |
| program grantu (`src/lib/widoki/grant.ts`) | grant promotorski | supervisor grant | K5 |
| drugi ekran głównej — sala (`DrugiEkran.astro`) | s. HS | room HS | K10 |
| drugi ekran — „więcej” (`DrugiEkran.astro`, `drugi-ekran.ts`) | i jeszcze 4 · Wszystkie aktualności → | 4 more · All news → | K11 |
| kanał RSS (`src/pages/en/rss.xml.ts`) | Instytut Matematyczny UWr — aktualności | Mathematical Institute, University of Wrocław — news | L |

## 2. Plan zajęć — dane z USOS (`src/lib/en/plan.ts`; K9, K12, D1)

Dane w `src/data/plan/plan.json` bez zmian; tłumaczenie przy wyświetlaniu na `/en/studia/plan-zajec`. Gdy USOS dostanie
angielską nazwę przedmiotu, ma ona pierwszeństwo przed mapą. Nowe uwagi, których reguły nie znają, zostaną po polsku —
wtedy dopisać zwrot w `UWAGI_EN`.

### Sale

| USOS | EN |
|---|---|
| inna | other |
| zd (zajęcia zdalne — do potwierdzenia) | online |

### Nazwy przedmiotów (brak angielskiej nazwy w USOS)

| Kod USOS | Nazwa (PL) | Proponowana nazwa (EN) |
|---|---|---|
| `28-MT-S-oObow4` | Grafy i algorytmy | Graphs and Algorithms |
| `28-MT-S-oPWarAI` | Podstawowy warsztat AI | Basic AI Workshop |
| `28-MT-S-oObow5` | Programowanie 2 (Python) (AI) | Programming 2 (Python) (AI) |
| `28-MT-S-oObow3` | Rachunek prawdopodobieństwa (AI) | Probability Theory (AI) |
| `28-MT-S-oObow1` | Warsztat informatyczny matematyka | Computing Workshop for Mathematicians |
| `28-MT-S-oObow2` | Wstęp do kombinatoryki | Introduction to Combinatorics |
| `28-MT-S-tNielRDyf` | Nieliniowe równania dyfuzji | Nonlinear Diffusion Equations |
| `28-MT-S-tTopologia2R` | Topologia 2 R | Topology 2 R |
| `28-MT-S-qAnRyzP` | Analiza ryzyka płynności i nadmiernej koncentracji | Analysis of Liquidity Risk and Excessive Concentration |
| `28-MT-S-qGrOl` | Grupy olighomorficzne | Oligomorphic Groups |
| `28-MT-S-qKurProLDr` | Kurs programowania trajektorii lotu dronów | Programming Drone Flight Trajectories |
| `28-MT-S-qMetProb` | Metoda probabilistyczna | The Probabilistic Method |
| `28-MT-S-qTopos` | Toposy | Toposes |
| `28-MT-S-uWarPomDyd` | Warsztaty pomocy dydaktycznych | Teaching Aids Workshop |
| `28-MT-S-yPisEgzLic` | Pisemny egzamin licencjacki 1 | Written Bachelor’s Examination 1 |
| `28-MT-S-yPisEgzLic2` | Pisemny egzamin licencjacki 2 | Written Bachelor’s Examination 2 |
| `28-MT-S-yPisEgzMgr` | Pisemny egzamin magisterski 1 | Written Master’s Examination 1 |
| `28-MT-S-yPisEgzMgr2` | Pisemny egzamin magisterski 2 | Written Master’s Examination 2 |
| `28-MT-S-yPisEgzWst` | Pisemny egzamin wstępny | Written Entrance Examination |
| `28-MT-S-oPodStatAI` | Podstawy statystyki (AI) | Foundations of Statistics (AI) |
| `28-MT-S-oProjKarAI` | Projektowanie kariery zawodowej | Career Planning |
| `28-MT-S-oUczMaszAI` | Uczenie maszynowe (AI) | Machine Learning (AI) |
| `28-MT-S-oZaaWarAI` | Zaawansowany warsztat AI | Advanced AI Workshop |
| `28-MT-S-lMatPodSiecN` | Matematyczne podstawy sieci neuronowych | Mathematical Foundations of Neural Networks |
| `28-MT-S-t0122` | Inteligentne systemy decyzyjne - praktyka nowoczesnego matematyka | Intelligent Decision Systems: the Practice of a Modern Mathematician |
| `28-MT-S-tMUbezpZdr` | Matematyka ubezpieczeń zdrowotnych | Health Insurance Mathematics |
| `28-MT-S-tTopologia1R` | Topologia R | Topology R |
| `28-MT-S-qPAktFin` | Przegląd aktuarialno-finansowy | Actuarial and Financial Mathematics Survey |
| `28-MT-S-qSemNaucz` | Seminarium dla nauczycieli | Seminar for Teachers |
| `28-MT-S-qSpacLosZ` | Spacery losowe i ich zastosowania | Random Walks and Their Applications |
| `28-MT-S-qUczWzmZ` | Uczenie ze wzmocnieniem i zastosowania | Reinforcement Learning and Its Applications |

### Typy zajęć (nazwy z USOS to kalki)

| Kod | PL | EN w USOS | Proponowane EN (pełna / skrót) |
|---|---|---|---|
| `CW` | Ćwiczenia | Class | Exercise class |
| `CW2` | Ćwiczenia | Class | Exercise class |
| `KONW` | Konwersatorium | Conversatorium | Discussion class / disc. |
| `KONW2` | Konwersatorium | Conversatorium | Discussion class / disc. |
| `SEM-MGR` | Seminarium magisterskie | Master Degree Seminar | Master’s seminar |
| `WAR` | Warsztat | Workshop | Workshop / wkshp |
| `PRK-PED` | Praktyki pedagogiczne | Pedagogical Practice | Teaching practice |
| `EGZ` | Egzamin | Examination | Exam |
| `KON` | — | — | Office hours (optional) |

### Uwagi z USOS (49 różnych tekstów w obecnym planie)

| Uwaga (PL) | Na /en |
|---|---|
| tylko dla ISIM | ISIM students only |
| dni  | dates  |
| , pierwsze zajęcia 21.10 | , first class on 21 Oct |
| dla ISIM | for ISIM |
| dla MT | for MT |
| tylko dla SIAD, wykład wspólny z Algebra liniowa 1 | SIAD students only, lecture shared with Algebra liniowa 1 |
| pierwsze zajęcia 10.11 | first class on 10 Nov |
| ostatnia edycja przedmiotu | last edition of this course |
| tylko dla SIAD | SIAD students only |
| pierwsze zajęcia 6.11 | first class on 6 Nov |
| ostatnia edycja przedmiotu zgodna ze starym programem | last edition under the previous curriculum |
| TU będą kolokwia ↵ strona www przedmiotu:  | Tests will be posted here. ↵ Course website:  |
| tylko dla SIAD, pierwsze 10 wykładów w sali EM (wspólnie z Programowanie 2 (Python)) | SIAD students only, first 10 lectures in room EM (together with Programowanie 2 (Python)) |
| co 2 tygodnie | every other week |
| , dla semestru 2 studiów mgr | , for 2nd-semester master’s students |
| , dla semestru 4 studiów mgr | , for 4th-semester master’s students |
| dla T, dla semestru 4 studiów mgr | for T, for 4th-semester master’s students |
| dla AF, dla semestru 4 studiów mgr | for AF, for 4th-semester master’s students |
| dla SIAD | for SIAD |
| pol. | in Polish |
| ang., Erasmus | in English, Erasmus |
| tylko dla TEOR | TEOR students only |
| ang., prow. R. Sullivan, pierwsze zajęcia 12.10. | in English, taught by R. Sullivan, first class on 12 Oct |
| ang. | in English |
| w semestrze letnim ostatnia edycja przedmiotu | last edition in the summer semester |
| ostatnia edycja przedmiotu (nadal oferowane będzie Programowanie i analiza danych w R) | last edition of this course (Programowanie i analiza danych w R will still be offered) |
| przedmiot w nowym programie występuje pod nazwą 'Miara i całka R' | in the new curriculum this course is called ‘Miara i całka R’ |
| (= Analiza numeryczna), co 2 tygodnie, pierwsze zajęcia 6.10 | (= Analiza numeryczna), every other week, first class on 6 Oct |
| zajęcia co 2 tygodnie, dni  | every other week, dates  |
| ang.,  | in English,  |
| co 2 tygodnie, dni N | every other week, dates N |
| pl | in Polish |
| ang., E + Erasmus | in English, E + Erasmus |
| pl, AF | in Polish, AF |
| tylko dla studiów II stopnia, obowiązują osobne zapisy ↵ pn 19.10 (20.00-21.30), pt 20.11 (19.00-20.00), wt 1.12 (20.00-21.30), pn 21.12 (20.00-21.30) | master’s students only; separate registration ↵ Mon 19 Oct (20:00–21:30), Fri 20 Nov (19:00–20:00), Tue 1 Dec (20:00–21:30), Mon 21 Dec (20:00–21:30) |
| tylko dla studiów II stopnia, obowiązują osobne zapisy ↵ cz 22.10 (18.00-19.00), cz 19.11 (18.00-19.00), cz 26.11 (19.00-20.00), cz 17.12 (19.30-21.00) | master’s students only; separate registration ↵ Thu 22 Oct (18:00–19:00), Thu 19 Nov (18:00–19:00), Thu 26 Nov (19:00–20:00), Thu 17 Dec (19:30–21:00) |
| tylko dla studiów II stopnia, obowiązują osobne zapisy | master’s students only; separate registration |
| wymagane zaliczenie przedmiotu Numerical methods (= Metody numeryczne) | requires a pass in Numerical methods (= Metody numeryczne) |
| sem. 3 | semester 3 |
| sem. 5 | semester 5 |
| wrześniowa | September resit |
| studia I stopnia | bachelor’s studies |
| studia II stopnia | master’s studies |
| tylko dla MS | MS students only |
| Pierwsze zajęcia CZWARTEK 8X, godz.: 18:00-21:00 | first class on Thursday 8 Oct, 18:00–21:00 |
| zajęcia od 12X, ostatnia edycja przedmiotu | classes from 12 Oct, last edition of this course |
| tylko dla SI | SI students only |
| dla AF | for AF |
| dla T | for T |

Nazwy przedmiotów cytowane w uwagach („Analiza numeryczna”, „Miara i całka R”, „Programowanie i analiza danych w R”)
zostają po polsku — to nazwy z USOS, które student musi odnaleźć w systemie.

## 3. Wykazy publikacji (`src/lib/en/publikacje.ts`; D2)

Dane w `src/data/publikacje/*.json` bez zmian. Tłumaczone są tylko zwroty opisu bibliograficznego; tytuły prac, nazwy
czasopism, wydawnictw, serii i miejsc wydania zostają w oryginale (np. „Mr MAT, Mały ilustrowany słownik terminów
matematycznych, cz. XL”, „Wiadomości Matematyczne”, „Warszawa”).

| Zwrot (PL) | EN |
|---|---|
| jęz. angielski / język angielski · jęz. polski | in English · in Polish |
| wydawnictwo zagraniczne / krajowe / własne | foreign / Polish / in-house publisher |
| praca recenzowana | peer-reviewed |
| afiliacja UWr · inna afiliacja · afiliacja wielokrotna · brak informacji o afiliacji | University of Wrocław affiliation · other affiliation · multiple affiliations · no affiliation information |
| w druku | in press |
| s. 405-422 · s.1-15 · 625 s. · ss.141 | pp. 405–422 · pp. 1–15 · 625 pp. · 141 pp. |
| nr 3 · nr art. 114 · Numer artykułu:116587 | no. 3 · art. no. 114 · article no. 116587 |
| T. 151, z. 2 · Tom 79, Numer 3 · tom 2 | Vol. 151, issue 2 · Vol. 79, No. 3 · vol. 2 |
| Dostęp: · Dostęp do abstraktu: · Dostęp do spisu treści: · Dostęp do początku artykułu: · Zasób elektroniczny: | Available at: · Abstract: · Table of contents: · Beginning of the article: · Electronic resource: |
| link zweryfikowany | link verified |
| W: · w tomie · w książce | In: · in the volume · in the book |
| (red.) · / red. · / red. nauk. · / redakcja · / pod redakcją | (ed.) (przy autorach: (eds.)) · / ed. by |
| [i in.] · …, współautorów oraz 53 innych | [et al.] · … and 53 other co-authors |
| : il. · [wyd. 2018] | : ill. · [published 2018] |
| Bibliografia na stronach 493-548 · Bibliogr. · Streszcz. w jęz. ang. | Bibliography on pp. 493–548 · Bibliography. · Abstract in English. |
| Przy nazwisku X podwójna / potrójna afiliacja: A oraz B. · dwie afiliacje | X has a dual / triple affiliation: A and B. |
| Oświadczenie o afiliowaniu na WMiI UWr. | Affiliation declared with Faculty of Mathematics and Computer Science, University of Wrocław. |
| Instytut Matematyczny, Uniwersytet Wrocławski · Uniwersytet Wrocławski | Mathematical Institute, University of Wrocław · University of Wrocław |
| Materiały (z) sympozjum "…", poświęconego książce Andrzeja Kisielewicza "…", Wrocław, grudzień 2017. | Proceedings of the symposium "…" devoted to the book "…" by Andrzej Kisielewicz, Wrocław, December 2017. |
| (tom, mimo daty 2007r., ukazał się dopiero w roku 2008, praca nie była sprawozdawana w 2007r.) | (the volume, although dated 2007, appeared only in 2008; the paper was not reported in 2007) |
| Praca zbiorowa pod redakcją Witolda Więsława | collective work edited by Witold Więsław |

## 4. Treści CMS — łatki (`dok/en/latki/<Repozytorium>.patch`; sekcja C audytu)

Łatki zmieniają tylko pola `_en` (i dodają je do konfiguracji Pages CMS, `.pages.yml`); jedyny wyjątek to martwy link
w „Wykładzie Terence’a Tao” — poprawiony w polu `tresc_en` i w treści polskiej (ten sam link, zalecenie 12 wymienia go
wprost). W repozytoriach Web-* nic nie jest commitowane. Nałożenie (po akceptacji, w kopii repozytorium):

```bash
git apply ../Web-Core/dok/en/latki/Web-Studia.patch
```

Podstawa łatek (commit repozytorium treści, od którego liczona jest różnica) i zakres:

| Repozytorium | Podstawa | Zmiany |
|---|---|---|
| `Web-Aktualnosci` | `b9f78b5` | 13 files changed, 39 insertions(+) |
| `Web-Instytut` | `4259ed2` | 1 file changed, 2 insertions(+), 2 deletions(-) |
| `Web-Sem-Analiza-Harmoniczna` | `9b078f8` | 3 files changed, 11 insertions(+) |
| `Web-Sem-Dydaktyka` | `ec6f2d2` | 1 file changed, 9 insertions(+) |
| `Web-Sem-Dyskretna-Analiza-Harmoniczna` | `ec428a2` | 5 files changed, 14 insertions(+) |
| `Web-Sem-Geometria` | `4223941` | 1 file changed, 9 insertions(+) |
| `Web-Sem-Prawdopodobienstwo` | `e5fee7c` | 2 files changed, 10 insertions(+) |
| `Web-Sem-Rownania-Rozniczkowe` | `4da1cf8` | 4 files changed, 12 insertions(+) |
| `Web-Sem-Statystyka` | `9627eef` | 12 files changed, 29 insertions(+) |
| `Web-Sem-Teoria-Modeli` | `46fe52c` | 1 file changed, 9 insertions(+) |
| `Web-Sem-Topologia` | `e64d56a` | 1 file changed, 9 insertions(+) |
| `Web-Spec-Aktuarialno-Finansowa` | `e3bdfc7` | 2 files changed, 15 insertions(+) |
| `Web-Spec-Analiza-Danych` | `cc6b8bb` | 2 files changed, 10 insertions(+) |
| `Web-Spec-Nauczycielska` | `3ee9aa6` | 2 files changed, 14 insertions(+) |
| `Web-Spec-Stosowana` | `5a4635d` | 2 files changed, 14 insertions(+) |
| `Web-Spec-Teoretyczna` | `2c4b2f4` | 2 files changed, 15 insertions(+) |
| `Web-Studia` | `a8d13d3` | 3 files changed, 15 insertions(+) |

Konfiguracja Pages CMS (`.pages.yml`) — nowe pola, wszystkie opcjonalne (puste = na `/en` wartość polska):
- Web-Aktualnosci, kolekcja „Obrony doktorskie”: `tresc_en` (EN: treść; bez niej na `/en` zaproszenie złożone z danych);
- Web-Sem-* (9 repozytoriów), kolekcja „Referaty”: `afiliacja_en`, `sala_en`, `tresc_en` (streszczenie po angielsku);
- Web-Spec-* (5) i Web-Studia, „Specjalności” → „Przykładowe tematy prac”: `opis_en` (temat zostaje w oryginale);
- Web-Studia, „Kierunki” → etapy i terminy: `formularz_en`.

Tytuły referatów, tematy prac i tytuły rozpraw zostają w języku oryginału (cytaty). Wpisy testowe („Testowe:”, `test-*`)
dostały tłumaczenia pól jak pozostałe (redakcja usunie je przed startem strony).

Słowniczek przyjęty w tłumaczeniach: praca licencjacka / magisterska → bachelor’s / master’s thesis; promotor →
supervisor; wyróżnienie → honourable mention; nagroda → prize; finał → finalist; konkurs WMI → Faculty competition;
Komisja Prac Dyplomowych → Diploma Theses Committee; stary program → previous curriculum; mgr → MSc; „Formularz C1” →
„Form C1”; System Zapisów → Enrolment System; stopnie w tekście angielskim: Prof., Dr hab., Dr (jak w istniejących
tekstach EN na stronie).

| Repozytorium | Plik | Pole | PL | EN |
|---|---|---|---|---|
| Web-Aktualnosci | `aktualnosci/test-2026-10-27-dzien-otwarty-dla-kandydatow.md` | `zdjecie_opis_en` | Mozaika Voronoi w kolorach strony Instytutu. Grafika testowa | A Voronoi mosaic in the Institute’s colours. Test image |
| Web-Aktualnosci | `aktualnosci/test-2026-10-28-kolo-naukowe-gry-kombinatoryczne.md` | `zdjecie_opis_en` | Tabela dodawania w grze Nim (a XOR b); bursztynowe pola na przekątnej to pozycje przegrywające. Grafika testowa | Addition table of the game of Nim (a XOR b); the amber cells on the diagonal are losing positions. Test image |
| Web-Aktualnosci | `aktualnosci/test-2026-10-29-warsztaty-dla-licealistow-liczby-pierwsze.md` | `zdjecie_opis_en` | Spirala Ulama: liczby pierwsze jako jasne punkty, na bursztynowo — wartości wielomianu Eulera n² + n + 41. Grafika testowa | The Ulam spiral: primes as bright dots, with values of Euler’s polynomial n² + n + 41 in amber. Test image |
| Web-Aktualnosci | `aktualnosci/test-2026-10-30-wyklad-otwarty-macierze-losowe.md` | `zdjecie_opis_en` | Kolorowanie dziedziny wielomianu charakterystycznego losowej macierzy unitarnej; białe punkty to wartości własne na okręgu jednostkowym. Grafika testowa | Domain colouring of the characteristic polynomial of a random unitary matrix; the white dots are eigenvalues on the unit circle. Test image |
| Web-Aktualnosci | `obrony/2026-06-18-maciej-korpalski.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Macieja Korpalskiego pt. *On isomorphic and geometric properties of Banach spaces of continuous functions*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Maciej Korpalski, MSc, entitled *On isomorphic and geometric properties of Banach spaces of continuous functions*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/2026-06-19-aleksander-antasik.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Aleksandra Antasika pt. *Rational approximation of surface group representations*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Aleksander Antasik, MSc, entitled *Rational approximation of surface group representations*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/2026-09-21-tomasz-zuchowski.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Tomasza Żuchowskiego pt. *On sequences of measures and ideals in Boolean algebras*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Tomasz Żuchowski, MSc, entitled *On sequences of measures and ideals in Boolean algebras*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/2026-10-20-maciej-tadej.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Macieja Tadeja pt. *Analysis and simulations of the non-linear models with non-local dispersal of species considered in finite, flat habitats*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Maciej Tadej, MSc, entitled *Analysis and simulations of the non-linear models with non-local dispersal of species considered in finite, flat habitats*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/2026-10-27-malwina-mrowinska.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr Malwiny Mrowińskiej pt. *Estimation of a block-structured covariance matrix*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Malwina Mrowińska, MSc, entitled *Estimation of a block-structured covariance matrix*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/test-2026-10-29-mister-test.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Mister Test pt. *Spectral gaps and cutoff for random walks on finite groups*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Mister Test, MSc, entitled *Spectral gaps and cutoff for random walks on finite groups*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/test-2026-11-03-mister-test.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Mister Test pt. *Regularity of free boundaries in the thin obstacle problem with variable coefficients*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Mister Test, MSc, entitled *Regularity of free boundaries in the thin obstacle problem with variable coefficients*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Aktualnosci | `obrony/test-2026-11-27-mister-test.md` | `tresc_en` | Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. Mister Test pt. *Topological dynamics of automorphism groups of countable homogeneous structures*. ↵  ↵ Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej. | You are cordially invited to the public defence of the doctoral dissertation of Mister Test, MSc, entitled *Topological dynamics of automorphism groups of countable homogeneous structures*. ↵  ↵ The dissertation, abstracts and reviews are available below. |
| Web-Sem-Analiza-Harmoniczna | `referaty/analiza-harmoniczna/2026-06-03-lyzwa.md` | `afiliacja_en` | UWr | University of Wrocław |
| Web-Sem-Analiza-Harmoniczna | `referaty/analiza-harmoniczna/test-2026-11-04-mister-test.md` | `afiliacja_en` | Uniwersytet Test | Test University |
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `referaty/dyskretna-analiza-harmoniczna/2026-06-11-bhattacharjee.md` | `afiliacja_en` | Uniwersytet w Białymstoku | University of Białystok |
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `referaty/dyskretna-analiza-harmoniczna/2026-06-18-chelstowski.md` | `afiliacja_en` | Uniwersytet Warszawski | University of Warsaw |
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `referaty/dyskretna-analiza-harmoniczna/2026-06-18-chelstowski.md` | `tresc_en` | Grafy kwantowe są nieprzemiennym uogólnieniem zwykłych, klasycznych grafów w duchu twierdzenia Gelfanda-Naimarka. Mają one wiele interesujących właściwości i zastosowanie w kwantowej teorii informacji. W swoim referacie przedstawię metodę konstrukcji grafów kwantowych, które można uznać za nieprzemienne analogi grafów Knesera - rodziny grafów mocno związanych z kombinatoryką topologiczną i pojęciem ułamkowych liczb chromatycznych. Następnie omówię ich właściwości, skupiając się w szczególności na ich liczbach chromatycznych. | Quantum graphs are a noncommutative generalisation of ordinary, classical graphs in the spirit of the Gelfand–Naimark theorem. They have many interesting properties and applications in quantum information theory. In my talk I will present a method of constructing quantum graphs that can be regarded as noncommutative analogues of Kneser graphs — a family of graphs closely related to topological combinatorics and to the notion of fractional chromatic number. I will then discuss their properties, focusing in particular on their chromatic numbers. |
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `referaty/dyskretna-analiza-harmoniczna/2026-10-22-kogiso.md` | `sala_en` | D1.2, budynek C-16, Politechnika Wrocławska | room D1.2, Building C-16, Wrocław University of Science and Technology |
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `referaty/dyskretna-analiza-harmoniczna/test-2026-11-05-mister-test.md` | `afiliacja_en` | Uniwersytet Test | Test University |
| Web-Sem-Prawdopodobienstwo | `referaty/prawdopodobienstwo/test-2026-11-05-mister-test.md` | `afiliacja_en` | Uniwersytet Test | Test University |
| Web-Sem-Rownania-Rozniczkowe | `referaty/rownania-rozniczkowe/2026-10-05-karch.md` | `afiliacja_en` | Uniwersytet Wrocławski | University of Wrocław |
| Web-Sem-Rownania-Rozniczkowe | `referaty/rownania-rozniczkowe/2026-10-12-karch-2.md` | `afiliacja_en` | Uniwersytet Wrocławski | University of Wrocław |
| Web-Sem-Rownania-Rozniczkowe | `referaty/rownania-rozniczkowe/test-2026-11-02-mister-test.md` | `afiliacja_en` | Uniwersytet Test | Test University |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-bogdan.md` | `afiliacja_en` | IM UWr | Mathematical Institute, University of Wrocław |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-bogdan.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-grzesiak.md` | `afiliacja_en` | IM UWr | Mathematical Institute, University of Wrocław |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-grzesiak.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-kos.md` | `afiliacja_en` | IM UWr | Mathematical Institute, University of Wrocław |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-kos.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-nowakowski.md` | `afiliacja_en` | Uniwersytet Medyczny w Białymstoku | Medical University of Białystok |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-22-nowakowski.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-bochenek.md` | `afiliacja_en` | MIM UW | Faculty of Mathematics, Informatics and Mechanics, University of Warsaw |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-bochenek.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-linke.md` | `afiliacja_en` | Międzynarodowy Instytut Biologii Molekularnej i Komórkowej | International Institute of Molecular and Cell Biology in Warsaw |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-linke.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-pokora.md` | `afiliacja_en` | IM UWr | Mathematical Institute, University of Wrocław |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-pokora.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-staniak.md` | `afiliacja_en` | IM UWr | Mathematical Institute, University of Wrocław |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-staniak.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-tracz.md` | `afiliacja_en` | Wydział Biotechnologii UWr | Faculty of Biotechnology, University of Wrocław |
| Web-Sem-Statystyka | `referaty/statystyka/2026-06-24-tracz.md` | `tresc_en` | Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki). | Abstract in the [seminar materials](/aktualnosci/2026-06-19-seminarium-ze-statystyki). |
| Web-Sem-Statystyka | `referaty/statystyka/2026-10-13-morzywolek.md` | `afiliacja_en` | Uniwersytet Kopenhaski | University of Copenhagen |
| Web-Sem-Statystyka | `referaty/statystyka/test-2026-11-03-mister-test.md` | `afiliacja_en` | Uniwersytet Test | Test University |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[0].opis_en` | praca magisterska, 2024; wyróżnienie w wydziałowym konkursie na najlepszą pracę dyplomową; promotor Marek Arendarczyk | master’s thesis, 2024; honourable mention in the Faculty competition for the best diploma thesis; supervisor: Marek Arendarczyk |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[1].opis_en` | praca magisterska; promotor Marek Arendarczyk; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | master’s thesis; supervisor: Marek Arendarczyk; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[2].opis_en` | praca magisterska; promotor Marek Arendarczyk; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | master’s thesis; supervisor: Marek Arendarczyk; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[3].opis_en` | praca magisterska; promotor Marek Arendarczyk; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | master’s thesis; supervisor: Marek Arendarczyk; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[4].opis_en` | praca magisterska; promotor Krzysztof Dębicki; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | master’s thesis; supervisor: Krzysztof Dębicki; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[5].opis_en` | praca magisterska; promotor Krzysztof Dębicki; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | master’s thesis; supervisor: Krzysztof Dębicki; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[6].opis_en` | praca licencjacka (stary program); promotor Marek Arendarczyk; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | bachelor’s thesis (previous curriculum); supervisor: Marek Arendarczyk; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[7].opis_en` | praca licencjacka (stary program); promotor Marek Arendarczyk; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | bachelor’s thesis (previous curriculum); supervisor: Marek Arendarczyk; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[8].opis_en` | praca licencjacka (stary program); promotor Krzysztof Dębicki; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | bachelor’s thesis (previous curriculum); supervisor: Krzysztof Dębicki; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[9].opis_en` | praca licencjacka (stary program); promotor Roman Urban; lista tematów Komisji Prac Dyplomowych (2022 i 2024) | bachelor’s thesis (previous curriculum); supervisor: Roman Urban; Diploma Theses Committee list of topics (2022 and 2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[10].opis_en` | praca licencjacka (stary program); promotor Anna Wysoczańska-Kula; lista tematów Komisji Prac Dyplomowych (2024) | bachelor’s thesis (previous curriculum); supervisor: Anna Wysoczańska-Kula; Diploma Theses Committee list of topics (2024) |
| Web-Spec-Aktuarialno-Finansowa | `specjalnosci/matematyka-aktuarialno-finansowa.md` | `tematy_prac[11].opis_en` | praca licencjacka (stary program); promotor Anna Wysoczańska-Kula; lista tematów Komisji Prac Dyplomowych (2024) | bachelor’s thesis (previous curriculum); supervisor: Anna Wysoczańska-Kula; Diploma Theses Committee list of topics (2024) |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[0].opis_en` | Zuzanna Nogala, praca licencjacka (promotor: dr Grzegorz Wyłupek); nagroda w konkursie WMI na najlepszą pracę dyplomową, 2024 | Zuzanna Nogala, bachelor’s thesis (supervisor: Dr Grzegorz Wyłupek); prize in the Faculty competition for the best diploma thesis, 2024 |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[1].opis_en` | Antoni Bieniasz, praca licencjacka (promotor: dr Grzegorz Wyłupek); wyróżnienie w konkursie WMI na najlepszą pracę dyplomową, 2024 | Antoni Bieniasz, bachelor’s thesis (supervisor: Dr Grzegorz Wyłupek); honourable mention in the Faculty competition for the best diploma thesis, 2024 |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[2].opis_en` | Filip Gaj, praca licencjacka (promotor: dr hab. Paweł Lorek); finał konkursu WMI na najlepszą pracę dyplomową, 2024 | Filip Gaj, bachelor’s thesis (supervisor: Dr hab. Paweł Lorek); finalist in the Faculty competition for the best diploma thesis, 2024 |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[3].opis_en` | Magda Kozajda, praca licencjacka (promotor: dr Grzegorz Wyłupek); wyróżnienie w konkursie WMI na najlepszą pracę dyplomową, 2023 | Magda Kozajda, bachelor’s thesis (supervisor: Dr Grzegorz Wyłupek); honourable mention in the Faculty competition for the best diploma thesis, 2023 |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[4].opis_en` | Kamil Zaborniak, praca licencjacka (promotor: dr Liudmyla Zaitseva); nagroda w konkursie WMI na najlepszą pracę dyplomową, 2023 | Kamil Zaborniak, bachelor’s thesis (supervisor: Dr Liudmyla Zaitseva); prize in the Faculty competition for the best diploma thesis, 2023 |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[5].opis_en` | Maciej Kaczyński, praca licencjacka (promotor: dr Michał Kos); wyróżnienie w konkursie WMI na najlepszą pracę dyplomową, 2022 | Maciej Kaczyński, bachelor’s thesis (supervisor: Dr Michał Kos); honourable mention in the Faculty competition for the best diploma thesis, 2022 |
| Web-Spec-Analiza-Danych | `specjalnosci/analiza-danych.md` | `tematy_prac[6].opis_en` | Patrycja Hęćka, praca magisterska (promotor: dr hab. Krzysztof Topolski); nagroda w konkursie WMI na najlepszą pracę dyplomową, 2022 | Patrycja Hęćka, master’s thesis (supervisor: Dr hab. Krzysztof Topolski); prize in the Faculty competition for the best diploma thesis, 2022 |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[0].opis_en` | praca absolwentki specjalności, promotor prof. Jacek Świątkowski; wyróżnienie w konkursie mBanku „Krok w Przyszłość” (2019; źródło — aktualności IM) | thesis by a graduate of the specialisation, supervisor: Prof. Jacek Świątkowski; honourable mention in mBank’s “Krok w Przyszłość” (Step into the Future) competition (2019; source: Institute news) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[1].opis_en` | temat pracy magisterskiej, promotor dr Jarosław Wróblewski (listy tematów z 2022 i 2024 r.) | master’s thesis topic, supervisor: Dr Jarosław Wróblewski (2022 and 2024 topic lists) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[2].opis_en` | temat pracy magisterskiej, promotor dr Jarosław Wróblewski (listy tematów z 2022 i 2024 r.) | master’s thesis topic, supervisor: Dr Jarosław Wróblewski (2022 and 2024 topic lists) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[3].opis_en` | temat pracy magisterskiej, promotor dr Jarosław Wróblewski (listy tematów z 2022 i 2024 r.) | master’s thesis topic, supervisor: Dr Jarosław Wróblewski (2022 and 2024 topic lists) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[4].opis_en` | praca licencjacka na specjalności, historia matematyki (lista z 2017 r.) | bachelor’s thesis in the specialisation, history of mathematics (2017 list) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[5].opis_en` | praca licencjacka na specjalności, historia matematyki (lista z 2017 r.) | bachelor’s thesis in the specialisation, history of mathematics (2017 list) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[6].opis_en` | praca licencjacka na specjalności, arytmetyka (lista z 2017 r.) | bachelor’s thesis in the specialisation, arithmetic (2017 list) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[7].opis_en` | praca licencjacka na specjalności, geometria (lista z 2017 r.) | bachelor’s thesis in the specialisation, geometry (2017 list) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[8].opis_en` | praca licencjacka na specjalności, geometria (lista z 2017 r.) | bachelor’s thesis in the specialisation, geometry (2017 list) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[9].opis_en` | praca licencjacka na specjalności, matematyka i sztuka (lista z 2017 r.) | bachelor’s thesis in the specialisation, mathematics and art (2017 list) |
| Web-Spec-Nauczycielska | `specjalnosci/matematyka-nauczycielska.md` | `tematy_prac[10].opis_en` | praca licencjacka na specjalności, matematyka i sztuka (lista z 2017 r.) | bachelor’s thesis in the specialisation, mathematics and art (2017 list) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[0].opis_en` | praca licencjacka; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024) | bachelor’s thesis; supervisor: Prof. Grzegorz Karch; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[1].opis_en` | praca licencjacka; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024) | bachelor’s thesis; supervisor: Prof. Grzegorz Karch; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[2].opis_en` | praca licencjacka; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024) | bachelor’s thesis; supervisor: Prof. Grzegorz Karch; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[3].opis_en` | praca magisterska; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024) | master’s thesis; supervisor: Prof. Grzegorz Karch; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[4].opis_en` | praca magisterska; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024) | master’s thesis; supervisor: Prof. Grzegorz Karch; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[5].opis_en` | praca licencjacka; promotor prof. Piotr Biler; lista tematów prac dyplomowych IM (2024) | bachelor’s thesis; supervisor: Prof. Piotr Biler; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[6].opis_en` | praca magisterska; promotor prof. Piotr Biler; lista tematów prac dyplomowych IM (2024) | master’s thesis; supervisor: Prof. Piotr Biler; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[7].opis_en` | praca magisterska; promotor dr Szymon Cygan; lista tematów prac dyplomowych IM (2024) | master’s thesis; supervisor: Dr Szymon Cygan; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[8].opis_en` | praca magisterska; promotor dr Szymon Cygan; lista tematów prac dyplomowych IM (2024) | master’s thesis; supervisor: Dr Szymon Cygan; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[9].opis_en` | praca licencjacka; promotor dr hab. Andrzej Raczyński; lista tematów prac dyplomowych IM (2024) | bachelor’s thesis; supervisor: Dr hab. Andrzej Raczyński; Institute list of thesis topics (2024) |
| Web-Spec-Stosowana | `specjalnosci/matematyka-stosowana.md` | `tematy_prac[10].opis_en` | praca magisterska; promotor dr hab. Andrzej Raczyński; lista tematów prac dyplomowych IM (2024) | master’s thesis; supervisor: Dr hab. Andrzej Raczyński; Institute list of thesis topics (2024) |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[0].opis_en` | praca magisterska; promotor Jan Dymara; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Jan Dymara; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[1].opis_en` | praca magisterska; promotor Piotr Borodulin-Nadzieja; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Piotr Borodulin-Nadzieja; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[2].opis_en` | praca magisterska; promotor Piotr Borodulin-Nadzieja; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Piotr Borodulin-Nadzieja; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[3].opis_en` | praca magisterska; promotor Piotr Kowalski; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Piotr Kowalski; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[4].opis_en` | praca magisterska; promotor Grzegorz Plebanek; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Grzegorz Plebanek; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[5].opis_en` | praca magisterska; promotor Ryszard Szwarc; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Ryszard Szwarc; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[6].opis_en` | praca magisterska; promotor Michał Marcinkowski; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Michał Marcinkowski; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[7].opis_en` | praca magisterska; promotor Błażej Wróbel; lista oferowanych tematów, 2024 | master’s thesis; supervisor: Błażej Wróbel; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[8].opis_en` | praca licencjacka; promotor Piotr Kowalski; lista oferowanych tematów, 2024 | bachelor’s thesis; supervisor: Piotr Kowalski; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[9].opis_en` | praca licencjacka; promotor Jan Kraszewski; lista oferowanych tematów, 2024 | bachelor’s thesis; supervisor: Jan Kraszewski; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[10].opis_en` | praca licencjacka; promotor Tadeusz Pezda; lista oferowanych tematów, 2024 | bachelor’s thesis; supervisor: Tadeusz Pezda; list of proposed topics, 2024 |
| Web-Spec-Teoretyczna | `specjalnosci/matematyka-teoretyczna.md` | `tematy_prac[11].opis_en` | praca licencjacka; promotor Błażej Wróbel; lista oferowanych tematów, 2024 | bachelor’s thesis; supervisor: Błażej Wróbel; list of proposed topics, 2024 |
| Web-Studia | `kierunki/isim.md` | `etapy[3].formularz_en` | Formularz E | Form E |
| Web-Studia | `kierunki/isim.md` | `terminy[5].formularz_en` | System Zapisów | Enrolment System |
| Web-Studia | `kierunki/matematyka.md` | `etapy[0].formularz_en` | Formularz C1 | Form C1 |
| Web-Studia | `kierunki/matematyka.md` | `etapy[1].formularz_en` | Formularz C2 | Form C2 |
| Web-Studia | `kierunki/matematyka.md` | `etapy[3].formularz_en` | Formularz C3 | Form C3 |
| Web-Studia | `kierunki/matematyka.md` | `etapy[4].formularz_en` | Formularz E | Form E |
| Web-Instytut | `warto_wiedziec/wyklad-terencea-tao.md` | `tresc_en` i treść PL | link `(/nauka/konferencje/2017-analysis-and-applications-in-honor-of-professor-elias-m-stein)` — martwy (konferencje nie mają podstron) | `(/nauka/konferencje#rok-2017)` — lista konferencji, rok 2017 (na `/en` link dostaje `/en` automatycznie) |

## 5. Do decyzji (propozycje — nie wdrożone; sekcja „Do decyzji” audytu i sprawy z tej pracy)

Każdą pozycję da się wdrożyć szybko po decyzji; miejsce w kodzie podane przy propozycji.

| # | Sprawa | Propozycja | Gdzie |
|---|---|---|---|
| D1 | Stopnie i tytuły w polskiej formie na `/en` („prof. dr hab. X”, „dr hab. X, prof. UWr”, „mgr inż. X”) — pracownicy, zakłady, granty („PI: …”), obrony („Review: …”) | **A (zalecam):** zwyczaj brytyjski — „Prof. X” (prof. dr hab. i dr hab. …, prof. UWr), „Dr X” (dr, dr hab., dr inż.), „mgr”, „mgr inż.” — bez tytułu. **B:** forma polska wielką literą — „Prof. dr hab. X”, „Dr hab. X, Prof. UWr”. Teksty EN pisane w CMS już używają „Prof.”, „Dr hab.”, „Dr” | `zTytulem()` w `src/lib/osoby.ts` z parametrem `lang`; pola tekstowe z tytułem (`prowadzacy`, `recenzent`, `kierownik`, `wykonawcy`, `promotorzy`) — ta sama zamiana przy wyświetlaniu |
| D2 | „UWr” w nazwie strony: „… · Mathematical Institute UWr” (`<title>`, `og:site_name`, stopka) | „Mathematical Institute, University of Wrocław” w `<title>` i `og:site_name`; w stopce to samo albo bez zmian (skrót znany) | `src/layouts/Baza.astro:61, 97`, `src/components/zal/StopkaZ.astro:17` |
| D3 | Logo „Uniwersytet Wrocławski” na `/en` | angielska wersja logo UWr („University of Wrocław”) — potrzebny plik od UWr (nie ma go w repozytorium) | `src/components/zal/PasekMenu.astro`, `src/components/Naglowek.astro`, okładka |
| D4 | Polskie tytuły prac, grantów i referatów cytowane w aktualnościach (ok. 90 tytułów na 46 stronach `/en/aktualnosci/*`) | zawsze tłumaczenie w nawiasie po tytule oryginalnym (jak już w części wpisów: „… (Dimension-free estimates for …)”); mogę przygotować łatkę `tresc_en` z tłumaczeniami | `tresc_en` wpisów w Web-Aktualnosci |
| D5 | Oryginalny polski tytuł grantu pod angielskim (87 z 94 grantów) | etykieta „Original title:” przed tytułem polskim | `src/views/Grant.astro` (`p.lead` w banerze) |
| D6 | Polskie nazwy przedmiotów i systemów w tekstach o studiach („Analiza matematyczna 1”, „Wstęp do matematyki”, „Grupy zajęciowe”, „Mój USOSweb”, „kolokwia”, „starosta”, „dziekanat”) | zostawić nazwy z USOS (student musi je znaleźć), przy pierwszym użyciu angielski odpowiednik w nawiasie | `tresc_en` stron w Web-Studia |
| D7 | Tytuły skryptów po polsku z dopiskiem „(in Polish)” | zostawić | — |
| D8 | Nazwy konkursów i programów („Krok w Przyszłość”, „Perspektywy”, „POWROTY”, „Iuvenes Wratislaviae”…) | tłumaczenie w nawiasie przy pierwszym użyciu; ujednolicić pisownię „Krok w Przyszłość” (dziś także „Krok w przyszłość”) | `tytul_en`, `zajawka_en`, `tresc_en` wpisów |
| D9 | Polskie nazwy szkół, firm i instytucji w ogłoszeniach | zostawić (nazwy własne; obok jest angielski opis) | — |
| D10 | Polskie tytuły referatów („Rozwiązania automorficzne (self-similar) równań konwekcji-dyfuzji”, „Kwantowe grafy Knesera”) | tytuł zostaje (cytat); dopisek „(talk in Polish)” — nowe pole `jezyk` referatu albo ręcznie w `tresc_en`. Streszczenie „Kwantowych grafów Knesera” jest już przetłumaczone w łatce | schemat `referaty`, `src/views/Seminarium.astro` |
| D11 | Adresy i miejsca („pl. Grunwaldzki 2”, „Będlewo”, „Hejnice”, „Szklarska P.”) | adresy zostają; w konferencji `2020-model-theory-conference.md` poprawić skrót „Szklarska P.” na „Szklarska Poręba” — to pole polskie, nie `_en`, więc poza łatkami | `miejsce` konferencji w Web-Nauka |
| D12 | „Juwenalia” z objaśnieniem | zostawić | — |
| D13 | Przełącznik „Wersja polska” / „PL” na `/en` | zostawić (nazwa języka w tym języku) | — |
| D14 | Fragmenty po polsku bez `lang="pl"` (wartości polskie pokazane, gdy `_en` jest puste) | oznaczać `lang="pl"`, gdy pokazujemy wartość polską w miejsce pustego `_en` — czytnik ekranu przeczyta je polskim głosem | `wybierz()` w `src/lib/i18n.ts` (zwracać też informację o języku), widoki |
| D15 | Strona 404 dla gościa z `/en`: nagłówek i przyciski po polsku | nagłówek i przyciski w obu językach (strona 404 jest jedna) | `src/pages/404.astro` |
| D16 | `/powiadomienia/` (link z angielskich e-maili) ma polskie menu i stopkę | wersja angielska `/en/powiadomienia/` albo dwujęzyczny szablon; link w e-mailach do wersji EN | `src/pages/powiadomienia.astro`, skrypty powiadomień |
| D17 | Tematy prac na stronach specjalności — tytuły polskie (53) | zostawić w oryginale (jak tytuły prac); ewentualnie tłumaczenie w nawiasie | `tematy_prac[].tytul` |
| D18 | Sala „zd” w planie z USOS — przyjąłem „zdalnie” → „online” | potwierdzić znaczenie skrótu | `src/lib/en/plan.ts` (`SALE_EN`) |
| D19 | Daty w tekstach angielskich w polskim zapisie („Mon 8.02, 8:30–13:00”, „7.01–2.02”, „13.11 — University Day”) na `/en/studia/pierwszy-rok`, `/zajecia`, `/egzaminy-i-dyplom` | zapis angielski „Mon 8 Feb”, „7 Jan – 2 Feb”; zmiana w `tresc_en` tych stron (mogę przygotować łatkę) | `tresc_en` stron w Web-Studia |
| D20 | Linki zewnętrzne do stron tylko po polsku w menu („Library”, „Mathematics Discipline Council”, „Admissions”) | dopisek „(in Polish)” jak przy „All Faculty authorities (in Polish) ↗” | `src/data/nawigacja.json` (Web-Ustawienia) |
