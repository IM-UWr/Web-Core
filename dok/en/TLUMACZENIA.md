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
