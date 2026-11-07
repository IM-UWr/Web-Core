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

## 6. Ciekawostki patronów (`src/data/ciekawostki/<dział>.json`; zlecenie 11, zalecenie 19)

Nagłówki podstron działów: tytuł (nazwa, rok) i jedno zdanie. Na `/en` pola `nazwa_en`, `rok_en` (tylko gdy rok ma słowa: „lata 30.”, „ok. 1921”, „po 1945”) i `zdanie_en`; puste pole — tekst polski.
Ciekawostki same w sobie czekają jeszcze na weryfikację faktów i źródeł (lista „przed wdrożeniem”); tłumaczenia trzeba poprawić razem z nimi. „ukryta” — poza losowaniem (robocza transkrypcja wywiadu).
Pula Popularyzacji nie ma dziś stron do losowania (menu działu ma tylko linki zewnętrzne) — tłumaczenia na zapas.

### Instytut — Edward Marczewski (25)

| id | PL | EN |
|---|---|---|
| `szpilrajn-porzadek` | **Twierdzenie Szpilrajna, 1930** — Każdy porządek częściowy da się rozszerzyć do liniowego: wszystkie elementy można ustawić w jednej kolejce. | **Szpilrajn’s theorem, 1930** — Every partial order can be extended to a linear one: all the elements can be placed in a single queue. |
| `uczniowie` | **Uczniowie Marczewskiego, 1947–1975** — Marczewski wypromował co najmniej 13 doktorów; jeden z nich, Kazimierz Urbanik, został rektorem Uniwersytetu. | **Marczewski’s students, 1947–1975** — Marczewski supervised at least 13 doctorates; one of his students, Kazimierz Urbanik, became Rector of the University. |
| `niezaleznosc-w-algebrach` | **Niezależność według Marczewskiego, 1958** — Marczewski ujął w jeden schemat różne niezależności w matematyce, np. liniową niezależność wektorów. | **Independence according to Marczewski, 1958** — Marczewski brought the various kinds of independence in mathematics, such as the linear independence of vectors, under one scheme. |
| `graf-przeciec` | **Każdy graf jest grafem przecięć, 1945** — Każdą sieć powiązań da się przedstawić zbiorami: dwa punkty łączymy, gdy ich zbiory mają część wspólną. | **Every graph is an intersection graph, 1945** — Any network of links can be represented by sets: two points are joined when their sets have a common part. |
| `odleglosc-marczewskiego-steinhausa` | **Odległość Marczewskiego–Steinhausa, 1958** — Zbiory są tym dalej, im większa część ich sumy należy tylko do jednego z nich; dziś to odległość Jaccarda. | **Marczewski–Steinhaus distance, 1958** — Two sets are the further apart, the larger the part of their union that belongs to only one of them; today this is the Jaccard distance. |
| `wymiar-i-miara` | **Wymiar i miara, 1937** — Wymiar topologiczny nigdy nie przekracza wymiaru Hausdorffa; sam autor uważał to za swój najważniejszy wynik. | **Dimension and measure, 1937** — Topological dimension never exceeds Hausdorff dimension; the author himself considered this his most important result. |
| `zbiory-s` | **Zbiory (s) Marczewskiego, 1935** — Zbiór (s): w każdym zbiorze doskonałym jest mniejszy doskonały, leżący cały w nim albo cały poza nim. | **Marczewski (s) sets, 1935** — An (s) set: every perfect set contains a smaller perfect set lying either entirely inside it or entirely outside it. |
| `funkcja-charakterystyczna` | **Funkcja charakterystyczna ciągu zbiorów, 1938** — Cały ciąg zbiorów można zapisać jedną funkcją: cyfra 2 znaczy „należy”, cyfra 0 — „nie należy”. | **Characteristic function of a sequence of sets, 1938** — A whole sequence of sets can be written as one function: the digit 2 means “belongs”, the digit 0 “does not belong”. |
| `zbiory-niezalezne` | **Zbiory niezależne, 1948** — Zbiory są niezależne, gdy każda kombinacja „w środku / na zewnątrz” wszystkich naraz jest możliwa. | **Independent sets, 1948** — Sets are independent when every combination of “inside / outside” for all of them at once is possible. |
| `colloquium-mathematicum` | **Colloquium Mathematicum, 1947** — Marczewski wymyślił wrocławskie czasopismo Colloquium Mathematicum i redagował je blisko 30 lat. | **Colloquium Mathematicum, 1947** — Marczewski conceived the Wrocław journal Colloquium Mathematicum and edited it for nearly 30 years. |
| `rektor-miary-zwarte` | **Rektor i miary zwarte, 1953** — W 1953 r. Marczewski został rektorem Uniwersytetu Wrocławskiego i ogłosił pracę o miarach zwartych. | **Rector and compact measures, 1953** — In 1953 Marczewski became Rector of the University of Wrocław and published a paper on compact measures. |
| `problem-marczewskiego` | **Problem Marczewskiego, 1930** — Pytanie Marczewskiego o paradoks Banacha–Tarskiego z „porządnymi” kawałkami rozstrzygnięto dopiero po 62 latach. | **Marczewski’s problem, 1930** — Marczewski’s question about the Banach–Tarski paradox with “decent” pieces was settled only 62 years later. |
| `hewitt-marczewski-pondiczery` | **Twierdzenie z fikcyjnym współautorem, 1947** — Iloczyn continuum przestrzeni ośrodkowych jest ośrodkowy; współodkrywca, E. S. Pondiczery, nigdy nie istniał. | **A theorem with a fictitious co-author, 1947** — A product of continuum many separable spaces is separable; one of its co-discoverers, E. S. Pondiczery, never existed. |
| `pierwsze-prace-1930` | **Pierwsze prace w wieku 22 lat, 1930** — Pierwsze prace ogłosił w 1930 r., mając 22 lata; jedna dotyczy hipotezy Borela o zbiorach „mocno miary zero”. | **First papers at the age of 22, 1930** — He published his first papers in 1930, aged 22; one concerns Borel’s conjecture on sets of “strong measure zero”. |
| `miara-i-kategoria` | **Miara i kategoria, 1932** — Już w doktoracie porównywał zbiory mierzalne ze zbiorami o własności Baire’a: dwa sposoby mówienia o „małości”. | **Measure and category, 1932** — Already in his doctoral thesis he compared measurable sets with sets having the Baire property: two ways of speaking about “smallness”. |
| `kierst-szpilrajn` | **Funkcje, których nie da się przedłużyć, 1933** — Z S. Kierstem pokazał, że „typowa” funkcja holomorficzna na kole nie przedłuża się przez żaden punkt jego brzegu. | **Functions that cannot be extended, 1933** — With S. Kierst he showed that a “typical” holomorphic function on the disc does not extend through any point of its boundary. |
| `marczewski-sikorski` | **Miary na ogromnych przestrzeniach, 1948** — Z Romanem Sikorskim: miara na przestrzeni metrycznej, nawet ogromnej, zwykle skupia się na małej części ośrodkowej. | **Measures on huge spaces, 1948** — With Roman Sikorski: a measure on a metric space, even a huge one, is usually concentrated on a small separable part. |
| `suma-plonki` | **Suma Płonki, 1967** — Jego doktorant Jerzy Płonka wymyślił sklejanie algebr wzdłuż półkraty; metoda żyje dziś w algebrze i logice. | **The Płonka sum, 1967** — His doctoral student Jerzy Płonka invented gluing algebras along a semilattice; the method lives on in algebra and logic. |
| `graffiti-fajtlowicz` | **Graffiti: program stawiający hipotezy, lata 80.** — Jego doktorant Siemion Fajtlowicz napisał Graffiti, program, który sam wysuwa hipotezy w teorii grafów. | **Graffiti: a program that makes conjectures, 1980s** — His doctoral student Siemion Fajtlowicz wrote Graffiti, a program that proposes conjectures in graph theory on its own. |
| `biblioteka-1945` | **Zaczęło się od zbierania książek, 1945** — Od 10 maja 1945 r. zbierał ocalałe książki matematyczne; jesienią było już kilkaset tomów, zalążek biblioteki. | **It began with collecting books, 1945** — From 10 May 1945 he gathered surviving mathematics books; by autumn there were several hundred volumes, the seed of a library. |
| `etos-szkoly` | **Autorzy w porządku alfabetycznym, po 1945** — Sformułował etos szkoły: autorzy zawsze alfabetycznie, a liczy się talent i wynik, nie stopień czy tytuł. | **Authors in alphabetical order, after 1945** — He set out the school’s ethos: authors always in alphabetical order, and what counts is talent and results, not degree or title. |
| `katedra-numeryczna-1962` | **Katedra Metod Numerycznych, 1962** — Z jego inicjatywy powstała w Instytucie Katedra Metod Numerycznych; objął ją jego wychowanek Stefan Paszkowski. | **Chair of Numerical Methods, 1962** — On his initiative the Institute set up a Chair of Numerical Methods, headed by his former student Stefan Paszkowski. |
| `dyrektor-instytutu` | **Dyrektor od pierwszego dnia, 1952–1967** — Instytut tworzyły cztery katedry; od początku kierował nim Marczewski, wybrany na dyrektora przez kolegów. | **Director from day one, 1952–1967** — The Institute was formed by four chairs; from the start it was headed by Marczewski, elected director by his colleagues. |
| `norwid-archytas` | **Platon i Archytas według Norwida, 1967** — Kochał Norwida: w 1967 r. omawiał publicznie jego wiersz „Platon i Archytas”, o dwóch postawach wobec matematyki. | **Plato and Archytas according to Norwid, 1967** — He loved Norwid: in 1967 he gave a public talk on his poem “Plato and Archytas”, about two attitudes to mathematics. |
| `zachowanie-miary` | **O zachowaniu miary we wszystkim, 1953** — W żartobliwej bibliografii z 1953 r. przypisano mu pracę „O zachowaniu miary we wszystkim”; śmiał się z innymi. | **On keeping measure in all things, 1953** — A humorous 1953 bibliography credited him with a paper “On keeping measure in all things”; he laughed along with the others. |

### Nauka — Władysław Ślebodziński (25)

| id | PL | EN |
|---|---|---|
| `pochodna-liego` | **Pochodna Liego, 1931** — Jako pierwszy podał ogólny wzór na zmianę pola tensorów niesionego przepływem pola wektorów. | **Lie derivative, 1931** — He was the first to give a general formula for the change of a tensor field carried along by the flow of a vector field. |
| `nazwa-van-dantzig` | **Skąd nazwa „pochodna Liego”, 1932** — Nazwę nadał jej w 1932 r. David van Dantzig, zaznaczając, że operator pierwszy wprowadził Ślebodziński. | **Where the name “Lie derivative” comes from, 1932** — It was named in 1932 by David van Dantzig, who noted that the operator had first been introduced by Ślebodziński. |
| `hamilton-1931` | **Równania Hamiltona, 1931** — Pokazał, że ruch według równań Hamiltona zachowuje formę symplektyczną (na płaszczyźnie: pole figur). | **Hamilton’s equations, 1931** — He showed that motion according to Hamilton’s equations preserves the symplectic form (in the plane: the area of figures). |
| `nawias-liego` | **Pochodna pola wektorów, 1931** — Dla pól wektorów pochodna Liego to nawias Liego: mierzy, o ile obieg czterema przepływami mija start. | **Derivative of a vector field, 1931** — For vector fields the Lie derivative is the Lie bracket: it measures how far a loop of four flows misses its starting point. |
| `zjazd-lwow-1927` | **Zjazd matematyków we Lwowie, 1927** — Na I Polskim Zjeździe Matematycznym współprowadził sekcję geometrii i wygłosił trzy referaty. | **Mathematicians’ congress in Lwów, 1927** — At the First Polish Mathematical Congress he co-chaired the geometry section and gave three talks. |
| `seminarium-1948` | **Seminarium geometrii różniczkowej, 1948** — Jego seminarium, działające od wiosny 1948 r., uczyniło Wrocław obok Krakowa ośrodkiem geometrii różniczkowej. | **Seminar in differential geometry, 1948** — His seminar, running from spring 1948, made Wrocław, alongside Kraków, a centre of differential geometry. |
| `wyklady-1946` | **Wykłady specjalne z geometrii, 1946** — W 1946 r. zaczął wykłady wprowadzające młodych w geometrię różniczkową, prawie nieznaną w przedwojennej Polsce. | **Special lectures in geometry, 1946** — In 1946 he began lectures introducing young people to differential geometry, almost unknown in pre-war Poland. |
| `jedenastu-doktorow` | **Jedenastu doktorów, 1947–1971** — Wypromował jedenastu doktorów; ostatnia, Hanna Matuszczyk, uzyskała doktorat w 1971 r., gdy miał 87 lat. | **Eleven doctorates, 1947–1971** — He supervised eleven doctorates; the last, Hanna Matuszczyk, obtained hers in 1971, when he was 87. |
| `formes-exterieures` | **Formes extérieures, 1954** — Napisał dwutomową monografię o formach zewnętrznych (1954 i 1963), w 1970 r. wydaną po angielsku. | **Formes extérieures, 1954** — He wrote a two-volume monograph on exterior forms (1954 and 1963), published in English in 1970. |
| `zespol-impan-1956` | **Zespół geometrii w IM PAN, 1956** — Kierował zespołem geometrii w IM PAN; w 1956 r. zbadał, kiedy dwie formy różniczkowe stopnia 2 są równoważne. | **Geometry group at IM PAN, 1956** — He led the geometry group at IM PAN; in 1956 he studied when two differential forms of degree 2 are equivalent. |
| `geometria-tkanin-1945` | **Referat o geometrii tkanin, 1945** — 20 października 1945 r., na zebraniu założycielskim wrocławskiego oddziału PTM, mówił o geometrii tkanin. | **A talk on web geometry, 1945** — On 20 October 1945, at the founding meeting of the Wrocław branch of the Polish Mathematical Society, he spoke on web geometry. |
| `galois-tarnobrzeg` | **Teoria Galois w Tarnobrzegu, 1909–1912** — Badania zaczął jako nauczyciel w szkole realnej w Tarnobrzegu; najpierw pociągała go teoria Galois. | **Galois theory in Tarnobrzeg, 1909–1912** — He began research as a teacher at the secondary school in Tarnobrzeg; at first he was drawn to Galois theory. |
| `ogrod-botaniczny` | **Szkolny ogród botaniczny, 1909–1912** — W Tarnobrzegu uczył też niemieckiego, polskiego i geografii oraz opiekował się szkolnym ogrodem botanicznym. | **The school botanical garden, 1909–1912** — In Tarnobrzeg he also taught German, Polish and geography, and looked after the school botanical garden. |
| `getynga-1913` | **Rok w Getyndze, 1913–1914** — Dzięki stypendium fundacji Kretkowskiego słuchał w Getyndze wykładów Hilberta, Landaua i Carathéodory’ego. | **A year in Göttingen, 1913–1914** — A Kretkowski Foundation scholarship took him to Göttingen, where he attended lectures by Hilbert, Landau and Carathéodory. |
| `toczenie-1923` | **Toczenie się powierzchni, 1923** — Jedna z jego wczesnych prac, ogłoszona po polsku w 1923 r., zawiera kilka twierdzeń o toczeniu się powierzchni. | **Rolling of surfaces, 1923** — One of his early papers, published in Polish in 1923, contains several theorems on the rolling of surfaces. |
| `ptm-1923-1963` | **Od oddziału do prezesury PTM, 1923–1963** — Założył poznański oddział PTM (1923), a w latach 1961–1963 był prezesem całego Towarzystwa. | **From branch founder to Society president, 1923–1963** — He founded the Poznań branch of the Polish Mathematical Society (1923), and in 1961–1963 he was president of the whole Society. |
| `doktorat-1928` | **Doktorat w wieku 44 lat, 1928** — Doktorat obronił w wieku 44 lat, mając już dorobek; zachęcił go Sierpiński, który załatwił wsparcie finansowe. | **A doctorate at 44, 1928** — He defended his doctorate at the age of 44, with a body of work already behind him; Sierpiński encouraged him and arranged financial support. |
| `wnuk-liego` | **Naukowy wnuk Sophusa Liego, 1891–1928** — Jego promotor Żorawski był doktorantem Liego, więc twórca pochodnej Liego to naukowy wnuk jej patrona. | **Sophus Lie’s academic grandson, 1891–1928** — His supervisor Żorawski was Lie’s doctoral student, so the creator of the Lie derivative is the academic grandson of its namesake. |
| `pole-grawitacji-1926` | **Geometria pola grawitacji, 1926** — Dekadę po Einsteinie badał geometrię statycznego pola grawitacji i metrykę wokół punktu materialnego. | **Geometry of the gravitational field, 1926** — A decade after Einstein he studied the geometry of the static gravitational field and the metric around a point mass. |
| `nagroda-doktoraty-hc` | **Nagroda i trzy doktoraty honoris causa, 1955–1970** — Dostał Nagrodę Państwową (1955) i trzy doktoraty honorowe: Politechnik Wrocławskiej i Poznańskiej oraz UWr. | **A prize and three honorary doctorates, 1955–1970** — He received the State Prize (1955) and three honorary doctorates: from the Wrocław and Poznań Universities of Technology and from the University of Wrocław. |
| `pionier-elektryki` | **Pionier dolnośląskiej elektryki, 1946** — Matematyk wśród „Pionierów Dolnośląskiej Elektryki”: od marca 1946 r. zasiadał w radzie wydziału Politechniki. | **Pioneer of Lower Silesian electrical engineering, 1946** — A mathematician among the “Pioneers of Lower Silesian Electrical Engineering”: from March 1946 he sat on a faculty council of the University of Technology. |
| `yano-1957` | **Monografia Kentaro Yano, 1957** — Kentaro Yano poświęcił pochodnej Liego i jej zastosowaniom całą monografię, wznowioną jeszcze w 2020 r. | **Kentaro Yano’s monograph, 1957** — Kentaro Yano devoted an entire monograph to the Lie derivative and its applications, reprinted as late as 2020. |
| `cartan-1922` | **Cartan był o krok wcześniej, 1922** — W 1922 r. Cartan określił taki operator, ale tylko dla form; wzór dla wszystkich tensorów dał Ślebodziński. | **Cartan was one step ahead, 1922** — In 1922 Cartan defined such an operator, but only for forms; the formula for all tensors was given by Ślebodziński. |
| `spinory-kosmann` | **Pochodna Liego spinorów, 1963–1972** — Pojęcie rosło dalej: Lichnerowicz i Yvette Kosmann rozszerzyli pochodną Liego na spinory znane z fizyki cząstek. | **Lie derivative of spinors, 1963–1972** — The concept kept growing: Lichnerowicz and Yvette Kosmann extended the Lie derivative to the spinors of particle physics. |
| `tom-26-colloquium` | **Tom ku jego pamięci, 1972** — Tom 26 „Colloquium Mathematicum” uczcił jego pamięć; otwiera go praca Kentaro Yano o izometriach. | **A volume in his memory, 1972** — Volume 26 of Colloquium Mathematicum honoured his memory; it opens with a paper by Kentaro Yano on isometries. |

### Studia — Bronisław Knaster (25)

| id | PL | EN |
|---|---|---|
| `kontinuum-knastera` | **Kontinuum Knastera, 1922** — Półokręgi oparte na zbiorze Cantora tworzą kontinuum, którego nie da się złożyć z dwóch mniejszych kontinuów. | **Knaster continuum, 1922** — Semicircles based on the Cantor set form a continuum that cannot be composed of two smaller continua. |
| `ostatni-pomniejszajacy` | **Ostatni pomniejszający, 1948** — Banach i Knaster wymyślili, jak dzielić tort między dowolnie wiele osób, by nikt nie czuł się pokrzywdzony. | **Last diminisher, 1948** — Banach and Knaster devised a way to divide a cake among any number of people so that no one feels short-changed. |
| `knaster-tarski` | **Twierdzenie Knastera–Tarskiego, 1928** — Funkcja monotoniczna na kracie zupełnej zawsze ma punkt stały, a nawet najmniejszy i największy. | **Knaster–Tarski theorem, 1928** — A monotone function on a complete lattice always has a fixed point, and even a least and a greatest one. |
| `najpierw-medycyna` | **Najpierw medycyna, 1915** — Knaster zdał w Paryżu egzaminy lekarskie, a dopiero potem zaczął w Warszawie studiować matematykę. | **Medicine first, 1915** — Knaster passed his medical examinations in Paris, and only then began studying mathematics in Warsaw. |
| `warunek-knastera` | **Warunek Knastera (K), 1941** — Własność (K): każda nieprzeliczalna rodzina zbiorów otwartych zawiera nieprzeliczalną, przecinającą się parami. | **Knaster’s condition (K), 1941** — Property (K): every uncountable family of open sets contains an uncountable subfamily whose members intersect pairwise. |
| `problem-knastera` | **Problem Knastera, 1947** — Czy zawsze da się obrócić sferę, by funkcja miała równe wartości w zadanych punktach? W dużych wymiarach — nie. | **Knaster’s problem, 1947** — Can a sphere always be rotated so that a function takes equal values at given points? In high dimensions, no. |
| `seminarium-w-salonie` (ukryta) | **Seminarium w salonie, lata 50.–70.** — Knaster prowadził seminarium u siebie w domu na Biskupinie — przy szkolnej tablicy, z herbatą i kanapkami. | **A seminar in the living room, 1950s–1970s** — Knaster ran a seminar at his home in Biskupin — at a school blackboard, with tea and sandwiches. |
| `wachlarz-knastera-kuratowskiego` | **Wachlarz Knastera–Kuratowskiego, 1921** — Ten zbiór jest spójny, ale po usunięciu jednego punktu — wierzchołka — rozsypuje się na pojedyncze punkty. | **Knaster–Kuratowski fan, 1921** — This set is connected, but after removing a single point — the apex — it falls apart into single points. |
| `kontinuum-dziedzicznie-nierozkladalne` | **Doktorat: pierwszy pseudołuk, 1922** — W rozprawie doktorskiej Knaster zbudował kontinuum, w którym każde podkontinuum jest nierozkładalne. | **Doctorate: the first pseudo-arc, 1922** — In his doctoral thesis Knaster constructed a continuum in which every subcontinuum is indecomposable. |
| `obrona-w-willi` | **Obrona w willi na Biskupinie, 1968** — Aleksander Weron bronił pracy magisterskiej u Knastera nie w Instytucie, lecz w willi profesora na Biskupinie. | **A defence in a villa in Biskupin, 1968** — Aleksander Weron defended his master’s thesis under Knaster not at the Institute but in the professor’s villa in Biskupin. |
| `metoda-knastera` | **Metoda Knastera (oferty w kopertach), 1948** — Rzeczy niepodzielne da się podzielić uczciwie: oferty w kopertach, rzecz dla najwyższej, dla reszty dopłaty. | **Knaster’s method (sealed bids), 1948** — Indivisible goods can be shared fairly: sealed bids, each item to the highest bid, compensating payments for the rest. |
| `problem-bijednorodnosci` | **Problem bijednorodności, ok. 1921** — Knaster pytał: jeśli w przestrzeni każdy punkt wygląda jak każdy, to czy każde dwa można zamienić miejscami? | **The bihomogeneity problem, c. 1921** — Knaster asked: if every point of a space looks like every other, can any two of them be swapped? |
| `lemat-kkm` | **Lemat KKM, 1929** — Trzy zbiory domknięte pokrywające trójkąt w zgodzie z jego bokami muszą mieć punkt wspólny. | **KKM lemma, 1929** — Three closed sets covering a triangle in agreement with its sides must have a common point. |
| `twierdzenie-knastera-reichbacha` (ukryta) | **Twierdzenie Knastera–Reichbacha, 1953** — Każdy homeomorfizm między domkniętymi, nigdzie gęstymi podzbiorami zbioru Cantora przedłuża się na cały zbiór. | **Knaster–Reichbach theorem, 1953** — Every homeomorphism between closed nowhere dense subsets of the Cantor set extends to the whole set. |
| `jednorodne-kontinua` | **Problem z pierwszego tomu Fundamenta, 1920–2016** — Z Kuratowskim pytał w 1920 r., czy okrąg to jedyne jednorodne kontinuum płaskie; pełna odpowiedź padła w 2016 r. | **A problem from the first volume of Fundamenta, 1920–2016** — In 1920 he and Kuratowski asked whether the circle is the only homogeneous plane continuum; the full answer came in 2016. |
| `podkowa-smalea` | **Podkowa Smale’a, 1986** — Kontinuum Knastera wróciło w teorii chaosu: jest atraktorem podkowy Smale’a, wzorcowego układu dynamicznego. | **Smale’s horseshoe, 1986** — The Knaster continuum returned in chaos theory: it is the attractor of Smale’s horseshoe, a model dynamical system. |
| `wachlarz-lelka` | **Wachlarz Lelka, 1961** — Jego uczeń Andrzej Lelek zbudował wachlarz, w którym końce włókien leżą gęsto; jest tylko jeden taki. | **Lelek fan, 1961** — His student Andrzej Lelek constructed a fan in which the endpoints of the fibres lie densely; there is only one such fan. |
| `praca-na-glos` (ukryta) | **Praca czytana na głos, lata 50.–60.** — Prace uczniów czytał z nimi na głos, tropiąc luki; gdy wynik okazał się znany: „Musi pan wymyślić coś więcej”. | **A thesis read aloud, 1950s–1960s** — He read his students’ papers aloud with them, hunting for gaps; when a result turned out to be known: “You must think up something more.” |
| `seria-b-wtn` | **Redaktor 131 tomów, 1949–1978** — Współtworzył Wrocławskie Towarzystwo Naukowe, zredagował 131 tomów jego serii B i zorganizował drukarnię naukową. | **Editor of 131 volumes, 1949–1978** — He co-founded the Wrocław Scientific Society, edited 131 volumes of its Series B and organised a scientific printing house. |
| `gosc-zermelo` | **Zermelo w mieszkaniu Knastera, 1929** — W 1929 r. zorganizował warszawską wizytę Ernsta Zermela, który zamieszkał u niego; korespondowali potem do 1932 r. | **Zermelo in Knaster’s flat, 1929** — In 1929 he organised Ernst Zermelo’s visit to Warsaw; Zermelo stayed with him, and they corresponded until 1932. |
| `referat-borsuka` | **Referat za Borsuka, 1932** — W Zurychu wygłosił też referat Borsuka o dzieleniu kuli; dlaczego, skoro autor był na miejscu, nie wiadomo. | **A talk for Borsuk, 1932** — In Zurich he also gave Borsuk’s talk on dividing the ball; why, when the author was there himself, is not known. |
| `banach-po-francusku` | **Banach po francusku, 1932** — Według monografii szkoły wrocławskiej to on przełożył na francuski słynną książkę Stefana Banacha. | **Banach in French, 1932** — According to a monograph on the Wrocław school, it was he who translated Stefan Banach’s famous book into French. |
| `roze-i-skamander` | **Róże i Skamander, lata 30.** — Próbował hodować nowe odmiany róż, grywał dla siebie, a przez żonę Marię był blisko poetów Skamandra. | **Roses and Skamander, 1930s** — He tried to breed new varieties of roses, played music for himself, and through his wife Maria was close to the Skamander poets. |
| `doktorat-am-1961` | **Doktorat Akademii Medycznej, 1961** — Niedoszły lekarz został doktorem honoris causa Akademii Medycznej we Wrocławiu; w 1961 r., tak jak Steinhaus. | **A doctorate from the Medical Academy, 1961** — The would-be physician became an honorary doctor of the Medical Academy in Wrocław in 1961, as did Steinhaus. |
| `katedra-topologii` | **Katedra Topologii, 1945** — Gdy 15 listopada 1945 r. ruszyły wykłady, objął jedną z czterech pierwszych katedr matematyki: Katedrę Topologii. | **Chair of Topology, 1945** — When lectures began on 15 November 1945, he took one of the first four chairs of mathematics: the Chair of Topology. |

### Popularyzacja — Hugo Steinhaus (31)

| id | PL | EN |
|---|---|---|
| `kanapka-z-szynka` | **Kanapka z szynką, 1938** — Trzy dowolnie położone bryły da się przepołowić naraz jednym cięciem płaszczyzną. | **Ham sandwich, 1938** — Any three solids, however placed, can be halved at once by a single plane cut. |
| `banach-na-plantach` | **Banach na krakowskich Plantach, 1916** — Na wieczornym spacerze usłyszał słowa o całce Lebesgue’a i tak poznał Banacha, swoje największe odkrycie. | **Banach on the Kraków Planty, 1916** — On an evening walk he overheard the words “Lebesgue integral” and so met Banach, his greatest discovery. |
| `osiemnascie-punktow` | **Zadanie o 18 punktach, 1958** — Punkty stawiamy po kolei tak, by n pierwszych leżało w różnych n-tych częściach odcinka; 18 już się nie da. | **The 18-point problem, 1958** — Points are placed one by one so that the first n lie in different n-ths of a segment; with 18 it is no longer possible. |
| `longimetr` | **Longimetr, 1930** — Przezroczysta płytka z siatkami: policz przecięcia krzywej z liniami, a dostaniesz jej długość w milimetrach. | **Longimeter, 1930** — A transparent plate with grids: count where a curve crosses the lines and you get its length in millimetres. |
| `sprawiedliwy-podzial` | **Sprawiedliwy podział tortu, 1948** — Jak podzielić tort między trzy osoby o różnych gustach, by każda dostała według siebie co najmniej 1/3? | **Fair division of a cake, 1948** — How to divide a cake among three people with different tastes so that each gets at least 1/3 by their own measure? |
| `dlugosc-wisly` | **Jak długa jest Wisła?, 1954** — Lewy brzeg Wisły mierzony coraz dokładniej dałby długość nawet tysiąc razy większą niż z mapy szkolnej. | **How long is the Vistula?, 1954** — Measured ever more precisely, the left bank of the Vistula would come out up to a thousand times longer than on a school map. |
| `trzy-odleglosci` | **Twierdzenie o trzech odległościach, 1957–1959** — Kolejne obroty o ten sam kąt dzielą okrąg na łuki najwyżej trzech długości; największa to suma dwóch innych. | **Three-distance theorem, 1957–1959** — Successive rotations by the same angle divide a circle into arcs of at most three lengths; the largest is the sum of the other two. |
| `kalejdoskop-matematyczny` | **Kalejdoskop matematyczny, 1938** — Książka z samych niemal obrazków, bez dowodów, od razu po polsku i angielsku, potem w wielu innych językach. | **Mathematical Snapshots, 1938** — A book of almost nothing but pictures, without proofs, published at once in Polish and English, later in many other languages. |
| `kieszen-ksiazki` | **Co było w kieszeni książki, 1938** — Książka miała kieszeń: okulary do obrazów 3D, karty do kartkowania i dwie połówki dwunastościanu do złożenia. | **What was in the book’s pocket, 1938** — The book had a pocket: glasses for 3D pictures, flip cards and two halves of a dodecahedron to assemble. |
| `krol-wieza-miny` | **Król, wieża i miny, 1954** — Albo król przejdzie szachownicę w poprzek, omijając miny, albo wieża przejedzie z góry na dół po samych minach. | **King, rook and mines, 1954** — Either the king can cross the chessboard avoiding the mines, or the rook can travel from top to bottom on mines alone. |
| `zapalki-banacha` | **Zapałki Banacha, 1941** — Ostatni wpis w Księdze Szkockiej: ile zapałek zostaje w jednym pudełku, gdy drugie okazuje się puste? | **Banach’s matchbox problem, 1941** — The last entry in the Scottish Book: how many matches are left in one box when the other turns out to be empty? |
| `banach-steinhaus` | **Twierdzenie Banacha–Steinhausa, 1927** — Rodzina operatorów liniowych ograniczona w każdym punkcie jest ograniczona jedną wspólną stałą. | **Banach–Steinhaus theorem, 1927** — A family of linear operators bounded at every point is bounded by a single common constant. |
| `k-srednich` | **Metoda k-średnich, 1956** — Jak podzielić bryłę na k części, by suma ich momentów bezwładności była najmniejsza? Dziś tak grupuje się dane. | **k-means method, 1956** — How to divide a solid into k parts so that the sum of their moments of inertia is smallest? Today this is how data are clustered. |
| `dendryt` | **Dendryt: taksonomia wrocławska, 1951** — Najkrótsze drzewo łączące punkty, po usunięciu najdłuższych krawędzi, rozpada się na naturalne grupy. | **The dendrite: Wrocław taxonomy, 1951** — The shortest tree joining the points, with its longest edges removed, falls apart into natural groups. |
| `zamiany-sasiadow` | **Zamiany sąsiadów, 1958** — Wszystkie ustawienia n elementów można obejść, zamieniając za każdym razem tylko dwa sąsiednie. | **Swapping neighbours, 1958** — All arrangements of n elements can be visited by swapping only two adjacent ones each time. |
| `liczby-w-figurach` | **Liczby w kole i w kwadracie, 1969** — Olbrzymie liczby zapisywał figurami: 2 w kole to mega, czyli 256 w 256 zagnieżdżonych trójkątach. | **Numbers in circles and squares, 1969** — He wrote huge numbers with shapes: 2 in a circle is mega, that is 256 in 256 nested triangles. |
| `twierdzenie-o-odleglosciach` | **Twierdzenie o odległościach, 1920** — W każdym zbiorze na prostej o dodatniej mierze są dwa różne punkty odległe o liczbę wymierną. | **Theorem on distances, 1920** — Every set of positive measure on the line contains two distinct points a rational distance apart. |
| `kolo-n-punktow` | **Koło z n punktami kratki, 1957** — Dla każdego n istnieje koło, w którego wnętrzu leży dokładnie n punktów o współrzędnych całkowitych. | **A circle with n lattice points, 1957** — For every n there is a circle with exactly n points with integer coordinates inside it. |
| `czem-jest-matematyka` | **Czem jest, a czem nie jest matematyka, 1923** — „Żadna nauka nie wzmacnia tak wiary w potęgę umysłu ludzkiego, jak matematyka”: pisał w popularnej książce. | **What mathematics is and what it is not, 1923** — “No science strengthens faith in the power of the human mind as much as mathematics does”, he wrote in a popular book. |
| `nowa-ksiega-szkocka` | **Nowa Księga Szkocka, 1946** — Wrocławska kontynuacja lwowskiej księgi problemów: pierwszy wpis zrobił Steinhaus w lipcu 1946 r. | **The New Scottish Book, 1946** — The Wrocław continuation of the Lwów book of problems: Steinhaus made the first entry in July 1946. |
| `ojcostwo-i-bayes` | **Ojcostwo i wzór Bayesa, 1954** — Do sporów o ojcostwo zastosował wyniki badań krwi i rachunek prawdopodobieństwa. | **Paternity and Bayes’ formula, 1954** — He applied blood test results and probability theory to paternity disputes. |
| `introwizor` | **Introwizor, 1938** — Przyrząd rentgenowski wskazujący chirurgowi miejsce odłamka w ciele: lusterko pokazuje tam świecący znacznik. | **Introvisor, 1938** — An X-ray device showing a surgeon where a fragment lies in the body: a mirror displays a glowing marker at that spot. |
| `taryfa-kwadratowa` | **Kwadratowa taryfa za prąd, 1939** — Płacić według pierwiastka z całki kwadratu mocy: przy tej samej energii równy pobór wychodzi wtedy taniej. | **A quadratic electricity tariff, 1939** — Pay according to the square root of the integral of the squared power: for the same energy, steady consumption then costs less. |
| `doktorat-u-hilberta` | **Doktorat u Hilberta, 1911** — W Getyndze obronił u Hilberta pracę o nowych zastosowaniach zasady Dirichleta. | **A doctorate under Hilbert, 1911** — In Göttingen he defended, under Hilbert, a thesis on new applications of the Dirichlet principle. |
| `rachunek-za-znaczek` | **Rachunek za znaczek, ok. 1937** — Szansa 1 do 5000 razy pensja 150 funtów: tak Steinhaus radził Kacowi, czy warto wysłać podanie do Londynu. | **Worth the stamp?, c. 1937** — A 1 in 5000 chance times a salary of £150: that is how Steinhaus advised Kac on whether to send an application to London. |
| `konkurs-ptm` | **Konkurs od ucznia Steinhausa, 1967** — Konkurs na prace studenckie we Wrocławskim Oddziale PTM zainicjował Józef Łukaszewicz, uczeń Steinhausa. | **A competition from a student of Steinhaus, 1967** — The student paper competition at the Wrocław branch of the Polish Mathematical Society was started by Józef Łukaszewicz, a student of Steinhaus. |
| `z-lawki-do-towarzystwa` | **Z ławki do towarzystwa, 1919** — Po rozmowach na Plantach postanowili założyć towarzystwo; od 1919 r. działało w Krakowie, dziś to PTM. | **From a bench to a society, 1919** — After the talks on the Planty they decided to found a society; from 1919 it worked in Kraków, and today it is the Polish Mathematical Society. |
| `miedzy-duchem-a-materia` | **Między duchem a materią, 1980** — „Między duchem a materią pośredniczy matematyka”: aforyzm Steinhausa wyryty też na jego nagrobku. | **Between mind and matter, 1980** — “Mathematics mediates between mind and matter”: an aphorism of Steinhaus, also engraved on his gravestone. |
| `rzuty-moneta` | **Nieskończone rzuty monetą, 1923** — Ciągi orłów i reszek opisał jak punkty odcinka: krok ku dzisiejszym aksjomatom rachunku prawdopodobieństwa. | **Infinite coin tosses, 1923** — He described sequences of heads and tails as points of a segment: a step towards today’s axioms of probability. |
| `kontrola-jakosci` | **Kontrola jakości z próbki, 1951** — Ile sztuk sprawdzić, by przyjąć partię? Steinhaus bronił tu wzoru Bayesa i współtworzył polskie normy. | **Quality control from a sample, 1951** — How many items to inspect before accepting a batch? Steinhaus defended Bayes’ formula here and co-authored Polish standards. |
| `uczniowie-steinhausa` | **Uczniowie i ich uczniowie, 1920–1968** — Według bazy MGP wypromował 20 doktorów, m.in. Banacha, Orlicza i Kaca, a ma ponad 3400 akademickich potomków. | **Students and their students, 1920–1968** — According to the Mathematics Genealogy Project he supervised 20 doctorates, including Banach, Orlicz and Kac, and has over 3,400 academic descendants. |
