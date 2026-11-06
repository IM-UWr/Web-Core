# Wersja angielska (/en): polskie zaleciałości, audyt

Gałąź `wyglad/zalozyciele`, commit `d12c994`, treści z CMS nałożone tak jak w `/home/claude/wz`. Build: `npx astro build` w kopii `/home/claude/en-audyt` (bez Pagefind, więc wyszukiwarka nie ma indeksu; jej napisy sprawdziłem w kodzie). Data: 4.11.2026. Kodu nie zmieniałem.

## Podsumowanie

**Co sprawdziłem**
- **373 strony `/en/**`**, każdą w Chromium (Playwright) w szerokości 1440 i 390 px (746 renderów). Zebrałem tekst po wykonaniu JS, atrybuty `alt`, `title`, `aria-label`, `placeholder`, `<title>`, `meta` (description, og:*), atrybuty `data-*` i skrypty inline. Każdy fragment ma oznaczenie, czy widać go na komputerze, na telefonie, czy jest ukryty (np. zamknięty panel hamburgera).
- Wykrywanie polskiego tekstu: polskie znaki, słowniki częstości PL/EN (`wordfreq`), wzorce (`dd.mm.rrrr`, `s.`, `pok.`, `godz.`, `r.`, `ul.`, skróty dni i miesięcy). Nazwiska (1473 z pól osobowych CMS) i nazwy miejsc odfiltrowałem.
- **Interakcje na 17 typowych stronach × 2 szerokości** (ok. 170 akcji): główna, 4 działy, Plan zajęć, Pracownicy, Seminaria i jedno seminarium, Aktualności i jeden wpis, Kalendarz, Projekty i granty, Władze, Rok akademicki, Publikacje, Szukaj. Obejmowały filtry, listy rozwijane, wyszukiwarki z wpisanym „zzqx” (komunikaty o braku wyników), „See more”, przełączniki semestrów, „Archive”, `<details>` streszczeń, hamburger i przełącznik motywu. Ruch poza localhost był blokowany. Strony nie zgłosiły żadnego błędu JS.
- **Linki:** wszystkie `<a>` na stronach `/en`. Sprawdziłem, czy wewnętrzne prowadzą do `/en/…`, czy przełącznik języka prowadzi do polskiej wersji tej samej strony i czy cel istnieje w `dist`.
- Po stronie źródeł: pola CMS bez odpowiednika `_en`, dane z USOS (`src/data/plan/plan.json`) i wykazy publikacji (`src/data/publikacje/*.json`).

**Wynik**

| | liczba |
|---|---|
| Problemy w **kodzie** (tabela K) | **12** |
| Problemy w **treściach CMS** (tabela C) | **7** grup (ok. 100 pozycji w ok. 35 plikach) |
| **Dane zewnętrzne** (USOS, wykazy publikacji) | **2** grupy (26 nazw przedmiotów, 53 rodzaje uwag; 264 z 2165 pozycji bibliograficznych) |
| **Linki** z `/en` do polskich stron | **37 linków na 10 stronach** (wszystkie w treściach Markdown) + 1 martwy link + kanał RSS |
| **Do decyzji** (nazwy własne, tytuły po polsku, stopnie naukowe itd.) | **16** |

Elementy wspólne działają dobrze. Menu, stopka, panel hamburgera, okruszki, „← Dział”, „Następna strona w dziale”, przełącznik języka (2234 linki, wszystkie poprawne), `<html lang="en">`, `og:locale=en_GB`, `hreflang` i `canonical` są w porządku. Komunikaty JS też są po angielsku: „Nothing matches your search.”, „Nobody matches the search.”, „No posts match the selected filters.”, „Nothing of this kind here.”, „Show less”. Formularz zapisu na seminarium jest wyłączony, bo w `ustawienia.json` nie ma adresu. W kodzie ma wersje EN (`data-ok`, `data-blad`, placeholder `you@example.com`).

---

## Najważniejsze 10 (to, co najbardziej rzuca się w oczy)

1. **Notki o patronach po polsku na banerach czterech działów** (komputer): „Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962…” na `/en/instytut`, `/en/nauka`, `/en/studia` i `/en/popularyzacja`. Przyczyna: puste `notka_en` w `src/lib/patroni.ts`.
2. **Okładka strony głównej** (komputer, po najechaniu na dział): „1907–1976. Pierwszy dyrektor Instytutu.”, „Wprowadził pochodną Liego.” itd. Przyczyna: puste `fakt_en` w `src/lib/patroni.ts`.
3. **Polski format dat na 192 stronach**: `29.10.2026`, `— 04.03.2024`, `Wed 04.11`, `27.10`, „Published 02.10.2026”. Występuje na listach i we wpisach aktualności, na stronach zakładów, seminariów, obron i sukcesów oraz na głównej i w Studiach na telefonie. Przyczyna: `short()` w `src/lib/daty.ts` nie ma wersji EN.
4. **Wpisy testowe z polskim przedrostkiem** widoczne na `/en/` (kolumna seminariów), w Kalendarzu i na stronach seminariów: „Testowe: Dimension-free estimates…”, streszczenie „Wpis testowy — przykład do podglądu nowej strony.”, polskie `alt`/podpisy grafik testowych („Mozaika Voronoi… Grafika testowa”). To treść testowa do usunięcia przed startem.
5. **Strony obron doktorskich (8)**: cała treść wpisu po polsku, np. „Zapraszamy na publiczną obronę rozprawy doktorskiej mgr Malwiny Mrowińskiej pt. … Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej.” Obrony nie mają pola `tresc_en`.
6. **Specjalności (5 stron), „Sample thesis topics”**: 53 pozycje z polskim opisem, np. „praca licencjacka; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024)”. Pole `tematy_prac` nie ma `_en`.
7. **Plan zajęć**: polskie uwagi z USOS („tylko dla SIAD”, „co 2 tygodnie”, „pierwsze zajęcia 6.11”, „ostatnia edycja przedmiotu”, „ang.”), 26 przedmiotów bez angielskiej nazwy („Pisemny egzamin licencjacki 1”, „Podstawy statystyki (AI)”) i sala „inna”.
8. **Linki w angielskich tekstach prowadzą do polskich stron**: 37 linków na 10 stronach, głównie na stronach specjalności, np. „Department of Statistics” → `/instytut/zaklady/statystyka`.
9. **Seminaria i Kalendarz**: afiliacje po polsku („(Uniwersytet Warszawski)”, „(Uniwersytet Kopenhaski)”, „(Międzynarodowy Instytut Biologii Molekularnej i Komórkowej)”), sala „D1.2, budynek C-16, Politechnika Wrocławska”, streszczenie „Streszczenie w materiałach seminarium”.
10. **Wykazy publikacji `/en/nauka/publikacje/2018/`, `/2019/` i `/2025/`** (pojedyncze pozycje też w latach 2004–2012): polskie metadane bibliograficzne, m.in. „jęz. angielski, wydawnictwo zagraniczne, praca recenzowana, JCR IF=…, afiliacja UWr” (168×), „s. 405-422” (227×), „nr 3” (105×), „Dostęp do abstraktu:” (143×), „Przy nazwisku … podwójna afiliacja” (21×).

Blisko pierwszej dziesiątki są jeszcze dwie sprawy. Na stronach 7 grantów stoi „grant promotorski” (plakietka na komputerze, wiersz „Funding”, meta description), choć tłumaczenie istnieje w kodzie. Na stronach pracowników, zakładów, władz, grantów i obron stopnie naukowe są w polskiej formie „prof. dr hab.” i „dr hab. …, prof. UWr” (do decyzji).

---

## K. Problemy w kodzie

„Komputer” to ≥ 761 px (bloki `z-*`, `.tylko-komputer`), „telefon” to ≤ 760 px (`.tylko-telefon`).

| # | Tekst po polsku (przykład) | Proponowany angielski | Plik:linia | Strony (przykład) | Gdzie |
|---|---|---|---|---|---|
| K1 | „Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962. Zabiegał o budowę gmachu Instytutu.” · „Geometra różniczkowy. W 1931 roku wprowadził pochodną Liego, dziś jedno z podstawowych narzędzi geometrii.” · „Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym. Wychował pokolenia wrocławskich matematyków.” · „Współtwórca szkoły lwowskiej i wrocławskiej, mistrz matematycznego aforyzmu i popularyzacji.” | “A co-founder of Wrocław mathematics and Rector of the University in 1957–1962. He campaigned for the construction of the Institute building.” · “A differential geometer. In 1931 he introduced the Lie derivative, now one of the basic tools of geometry.” · “A topologist and co-author of the Knaster–Tarski fixed-point theorem. He trained generations of Wrocław mathematicians.” · “A co-founder of the Lwów and Wrocław schools of mathematics, and a master of the mathematical aphorism and of popularisation.” | `src/lib/patroni.ts:36, 47, 58, 69` (`notka_en: ''`); wyświetla `src/components/zal/NaglowekZ.astro:82` | `/en/instytut/`, `/en/nauka/`, `/en/studia/`, `/en/popularyzacja/` | komputer |
| K2 | „Pierwszy dyrektor Instytutu.” · „Wprowadził pochodną Liego.” · „Topolog, oddany dydaktyce.” · „„Między duchem a materią pośredniczy matematyka”.” | “The Institute’s first director.” · “Introduced the Lie derivative.” · “A topologist devoted to teaching.” · “‘Mathematics mediates between mind and matter.’” | `src/lib/patroni.ts:37, 48, 59, 70` (`fakt_en: ''`); wyświetla `src/components/zal/Okladka.astro:76` | `/en/` (okładka, po najechaniu na dział) | komputer |
| K3 | Daty `29.10.2026`, `— 04.03.2024`, `Wed 04.11`, `27.10`, „Published 02.10.2026”, „28.10” (liczba w banerze Planu) | `29 Oct 2026`, `— 4 Mar 2024`, `Wed 4 Nov`, `27 Oct`, “Published 2 Oct 2026” (`short()` z parametrem `lang`, dla EN `d MMM yyyy`, skrót `d MMM`) | `src/lib/daty.ts:72` (`short()` bez `lang`), wywołania: `WierszAktualnosci.astro:29`, `KartaAktualnosci.astro:21, 29`, `StronaGlowna.astro:203`, `views/DzialStudia.astro:94`, `TabelaReferatow.astro:17`, `ListaReferatow.astro:26`, `views/Zaklad.astro:158, 167`, `views/Seminarium.astro:91`, `views/Obrona.astro:57`, `views/Aktualnosc.astro:40`, `views/AktualnoscZamianaDni.astro:35`, `views/ListaSukcesow.astro:55`; Plan: `src/lib/widoki/planZajec.ts:68` (`dzien: dd.mm`) | 192 strony: `/en/aktualnosci/`, każdy wpis, `/en/instytut/zaklady/*`, `/en/seminaria/*`, `/en/obrony-doktorskie/*`, `/en/nauka/sukcesy/`, `/en/` i `/en/studia/` (telefon) | oba (lista `pt-d` na głównej i w Studiach tylko telefon, „28.10” w Planie tylko komputer) |
| K4 | Cała treść strony obrony: „Zapraszamy na publiczną obronę rozprawy doktorskiej mgr. … pt. *…*. Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej.” | “You are cordially invited to the public defence of the doctoral dissertation of [Name], MSc, entitled *…*. The dissertation, abstracts and reviews are available below.” Najprościej: na `/en` składać to zdanie z pól (`kandydat`, `tytul_rozprawy`) albo dodać `tresc_en` | Schemat `src/content.config.ts:138–161` (kolekcja `obrony` bez `tresc_en`); `src/views/Obrona.astro:48` (`<Content />` zawsze) | 8 stron `/en/obrony-doktorskie/*`, np. `/en/obrony-doktorskie/2026-10-27-malwina-mrowinska/` | oba |
| K5 | „grant promotorski” (plakietka, „Funding: National Science Centre (NCN) — grant promotorski”, meta „Project: NCN (grant promotorski)”) | “supervisor grant” (mapa `PROGRAMY_EN` już to tłumaczy, ale nie wszędzie jest użyta) | `src/views/Grant.astro:36` (plakietka komputer, `d.program`), `:52` (`dd` „Funding”), `src/lib/widoki/grant.ts:56` (meta description); także `src/views/ListaGrantow.astro:46, 92` (surowe `g.data.program`; dziś niewidoczne, bo te granty mają kod) | 7 stron, np. `/en/nauka/granty/2009-n-201-365736/` | plakietka: komputer; „Funding” i meta: oba (na telefonie plakietka jest już poprawna) |
| K6 | 53 tematy prac z polskimi tytułami i opisami: „— praca licencjacka; promotor prof. Grzegorz Karch; lista tematów prac dyplomowych IM (2024)” | Opis: “— bachelor’s thesis; supervisor: Prof. Grzegorz Karch; Institute list of thesis topics (2024)”. Potrzebne pola `tytul_en`, `opis_en` (treść w tabeli C2) | `src/content.config.ts:313` (`tematy_prac` bez `_en`), `src/views/Specjalnosc.astro:117` | `/en/studia/matematyka/{analiza-danych, matematyka-aktuarialno-finansowa, matematyka-nauczycielska, matematyka-stosowana, matematyka-teoretyczna}/` | oba |
| K7 | Afiliacje i sale prelegentów po polsku: „(Uniwersytet Warszawski)”, „D1.2, budynek C-16, Politechnika Wrocławska”; streszczenia tylko po polsku | Pola `afiliacja_en`, `sala_en` (albo słownik nazw uczelni jak `MIEJSCA_EN`), opcjonalnie `tresc_en`/`tytul_en` w referatach (treść w tabeli C3–C5) | `src/content.config.ts:123–136` (`referaty`: `afiliacja`, `sala`, treść bez `_en`); `src/views/Seminarium.astro:77, 93`; `src/lib/tresci.ts:145` (`sala()` przepuszcza dłuższe opisy bez zmian), `:219` (podtytuł w Kalendarzu) | `/en/seminaria/statystyka/`, `/en/seminaria/dyskretna-analiza-harmoniczna/`, `/en/kalendarz/` (Archive) | oba |
| K8 | Nazwy formularzy w tabelach terminów: „System Zapisów”, „Formularz C1”, „Formularz C2”, „Formularz C3”, „Formularz E” | “Enrolment System”, “Form C1”, “Form C2”, “Form C3”, “Form E” (pole `formularz_en` albo automatycznie „Formularz” → „Form”) | `src/content.config.ts:232, 251` (`formularz` bez `_en`); `src/views/Kierunek.astro:94, 177` | `/en/studia/isim/`, `/en/studia/matematyka/` | oba |
| K9 | Sala w Planie: „inna”, „zd” (wartości z USOS wstawiane bez tłumaczenia) | “other”, “online” (do potwierdzenia, czy „zd” = zdalnie) | `src/views/PlanZajec.astro:133, 202` (`{z.sala}`) | `/en/studia/plan-zajec/` | oba |
| K10 | „r. HS”, „r. 601” w kolumnach „Upcoming events”/„Seminars” na drugim ekranie głównej. To kalka polskiego „s.” („r.” po angielsku oznacza zwykle „rok” albo nic) | “Room HS” / “Rm 601” | `src/components/zal/DrugiEkran.astro:37` (`krotkaSala`), `:53` (`krotkieMiejsce`) | `/en/` | komputer |
| K11 | „and 4 · All news →”. Kalka „i jeszcze 4 · Wszystkie aktualności →” | “4 more · All news →” (zmienić szablon: liczba przed słowem) | `src/components/zal/DrugiEkran.astro:164` (`data-wiecej={T('i jeszcze','and')}`), `src/scripts/zal/drugi-ekran.ts:22` | `/en/` (długa kolumna) | komputer |
| K12 | Typy zajęć w Planie: „Conversatorium”, „Master Degree Seminar”, „Class” (dla ćwiczeń). To kalki, a nie polskie słowa, ale ich źródłem jest polski system | “Discussion class” (albo “Seminar class”), “Master’s seminar”, “Tutorial” / “Exercise class” | `skrypty/plan/pobierz_plan.py:71–79` (`TYPY`, `NADPISANE_EN`), wynik w `src/data/plan/plan.json` → `typy` | `/en/studia/plan-zajec/` | oba |

Uwagi do tabeli K:
- K4, K6, K7 i K8 to luki w schemacie: w CMS nie ma gdzie wpisać tłumaczenia. Po dodaniu pól trzeba jeszcze uzupełnić treści (tabela C).
- `wybierz()` w `src/lib/i18n.ts:303` i `pole()` w `src/lib/patroni.ts:88` celowo cofają się do polskiego, gdy brak `_en`. Dzięki temu każda luka w treściach jest widoczna jako polski tekst, a nie pusta. Warto rozważyć ostrzeżenie w `skrypty/sprawdz_tresci.py` przy pustym `_en`.

---

## C. Problemy w treściach CMS

| # | Plik treści | Pole bez `_en` | Polski tekst (przykład) | Propozycja angielskiego |
|---|---|---|---|---|
| C1 | `src/content/obrony/2026-06-18-maciej-korpalski.md`, `2026-06-19-aleksander-antasik.md`, `2026-09-21-tomasz-zuchowski.md`, `2026-10-20-maciej-tadej.md`, `2026-10-27-malwina-mrowinska.md` (+ 3 testowe `test-*.md`) | treść Markdown (schemat nie ma `tresc_en`, por. K4) | „Zapraszamy na publiczną obronę rozprawy doktorskiej mgr Malwiny Mrowińskiej pt. *Estimation of a block-structured covariance matrix*. Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej.” | “You are cordially invited to the public defence of the doctoral dissertation of Malwina Mrowińska, MSc, entitled *Estimation of a block-structured covariance matrix*. The dissertation, abstracts and reviews are available below.” |
| C2 | `src/content/specjalnosci/analiza-danych.md` (7), `matematyka-aktuarialno-finansowa.md` (12), `matematyka-nauczycielska.md` (11), `matematyka-stosowana.md` (11), `matematyka-teoretyczna.md` (12) | `tematy_prac[].opis` (53×), `tematy_prac[].tytul` (tytuły polskie, do decyzji) | „Zuzanna Nogala, praca licencjacka (promotor: dr Grzegorz Wyłupek); nagroda w konkursie WMI na najlepszą pracę dyplomową, 2024” · „praca magisterska; promotor Marek Arendarczyk; lista tematów Komisji Prac Dyplomowych (2022 i 2024)” · „praca licencjacka (stary program)” · „praca licencjacka na specjalności, geometria (lista z 2017 r.)” · „temat pracy magisterskiej, promotor dr Jarosław Wróblewski (listy tematów z 2022 i 2024 r.)” · „lista oferowanych tematów, 2024” | “Zuzanna Nogala, bachelor’s thesis (supervisor: Dr Grzegorz Wyłupek); prize in the Faculty competition for the best diploma thesis, 2024” · “master’s thesis; supervisor: Marek Arendarczyk; Diploma Theses Committee list of topics (2022 and 2024)” · “bachelor’s thesis (previous curriculum)” · “bachelor’s thesis in the specialisation, geometry (2017 list)” · “master’s thesis topic; supervisor: Dr Jarosław Wróblewski (2022 and 2024 topic lists)” · “list of proposed topics, 2024”. Słowniczek: wyróżnienie → honourable mention, nagroda → prize, finał → finalist |
| C3 | `src/content/referaty/statystyka/2026-06-24-linke.md`, `2026-10-13-morzywolek.md`, `2026-06-22-nowakowski.md`, `2026-06-24-tracz.md`, `2026-06-22-{kos,grzesiak,bogdan}.md`, `2026-06-24-{staniak,pokora,bochenek}.md`; `rownania-rozniczkowe/2026-10-05-karch.md`, `2026-10-12-karch-2.md`; `dyskretna-analiza-harmoniczna/2026-06-18-chelstowski.md`, `2026-06-11-bhattacharjee.md`; `analiza-harmoniczna/2026-06-03-lyzwa.md` | `afiliacja` | „Międzynarodowy Instytut Biologii Molekularnej i Komórkowej” · „Uniwersytet Kopenhaski” · „Uniwersytet Medyczny w Białymstoku” · „Wydział Biotechnologii UWr” · „IM UWr” · „MIM UW” · „Uniwersytet Wrocławski” · „Uniwersytet Warszawski” · „Uniwersytet w Białymstoku” · „UWr” | “International Institute of Molecular and Cell Biology in Warsaw” · “University of Copenhagen” · “Medical University of Białystok” · “Faculty of Biotechnology, University of Wrocław” · “Mathematical Institute, University of Wrocław” · “Faculty of Mathematics, Informatics and Mechanics, University of Warsaw” · “University of Wrocław” · “University of Warsaw” · “University of Białystok” · “University of Wrocław” |
| C4 | `src/content/referaty/dyskretna-analiza-harmoniczna/2026-10-22-kogiso.md` | `sala` | „D1.2, budynek C-16, Politechnika Wrocławska” | “Room D1.2, Building C-16, Wrocław University of Science and Technology” |
| C5 | `src/content/referaty/statystyka/*.md` (9 referatów z czerwca 2026) | treść Markdown (streszczenie) | „Streszczenie w [materiałach seminarium](/aktualnosci/2026-06-19-seminarium-ze-statystyki).” (link prowadzi do polskiej strony) | “Abstract in the [seminar materials](/en/aktualnosci/2026-06-19-seminarium-ze-statystyki).” |
| C6 | `src/content/aktualnosci/test-2026-10-27-dzien-otwarty-dla-kandydatow.md`, `test-2026-10-28-kolo-naukowe-gry-kombinatoryczne.md`, `test-2026-10-29-warsztaty-dla-licealistow-liczby-pierwsze.md`, `test-2026-10-30-wyklad-otwarty-macierze-losowe.md` | `zdjecie_opis_en` (widoczne jako `alt` i podpis, także w kartach na `/en/`) | „Mozaika Voronoi w kolorach strony Instytutu. Grafika testowa” · „Tabela dodawania w grze Nim (a XOR b); bursztynowe pola na przekątnej to pozycje przegrywające. Grafika testowa” · „Spirala Ulama: liczby pierwsze jako jasne punkty…” · „Kolorowanie dziedziny wielomianu charakterystycznego losowej macierzy unitarnej…” | “A Voronoi mosaic in the Institute’s colours. Test image” · “Addition table of the game of Nim (a XOR b); the amber cells on the diagonal are losing positions. Test image” · “The Ulam spiral: primes as bright dots, with values of Euler’s polynomial n² + n + 41 in amber. Test image” · “Domain colouring of the characteristic polynomial of a random unitary matrix; the white dots are eigenvalues on the unit circle. Test image” (albo usunąć wpisy testowe) |
| C7 | `src/content/kierunki/isim.md` (`terminy[].formularz`: „System Zapisów”, „Formularz E”), `src/content/kierunki/matematyka.md` („Formularz C1”, „Formularz C2”, „Formularz C3”, „Formularz E”) | `formularz` (schemat bez `_en`, por. K8) | jw. | “Enrolment System”, “Form E”, “Form C1”, “Form C2”, “Form C3” |

Bez działań w CMS (naprawa w kodzie): `src/content/granty/*.md`, `program: "grant promotorski"` (7 plików), zob. K5.

**Treści testowe** widoczne na `/en` (22 pliki `test-*` w `aktualnosci`, `referaty`, `obrony`, `warto_wiedziec`). Tytuły referatów testowych mają polski przedrostek „Testowe:” (referaty nie mają `tytul_en`), a streszczenia brzmią „Wpis testowy — przykład do podglądu nowej strony. / Test entry — …”. Są na `/en/` (kolumna seminariów), w Kalendarzu i na pięciu stronach seminariów. Do usunięcia przed publikacją.

---

## D. Dane zewnętrzne

### D1. Plan zajęć z USOS (`src/data/plan/plan.json`, pobiera `skrypty/plan/pobierz_plan.py`) → `/en/studia/plan-zajec/`, oba wyglądy
- **26 przedmiotów (35 wpisów w dwóch semestrach) bez `nazwa_en`**, więc wyświetla się nazwa polska: „Grafy i algorytmy”, „Podstawowy warsztat AI”, „Programowanie 2 (Python) (AI)”, „Rachunek prawdopodobieństwa (AI)”, „Warsztat informatyczny matematyka”, „Wstęp do kombinatoryki”, „Nieliniowe równania dyfuzji”, „Topologia 2 R”, „Analiza ryzyka płynności i nadmiernej koncentracji”, „Grupy olighomorficzne”, „Kurs programowania trajektorii lotu dronów”, „Metoda probabilistyczna”, „Toposy”, „Warsztaty pomocy dydaktycznych”, „Pisemny egzamin licencjacki 1/2”, „Pisemny egzamin magisterski 1/2”, „Pisemny egzamin wstępny”, „Podstawy statystyki (AI)”, „Projektowanie kariery zawodowej”, „Uczenie maszynowe (AI)”, „Zaawansowany warsztat AI”, „Matematyczne podstawy sieci neuronowych”, „Inteligentne systemy decyzyjne - praktyka nowoczesnego matematyka”, „Matematyka ubezpieczeń zdrowotnych”, „Topologia R”, „Przegląd aktuarialno-finansowy”, „Seminarium dla nauczycieli”, „Spacery losowe i ich zastosowania”, „Uczenie ze wzmocnieniem i zastosowania”. Brak angielskiej nazwy w USOS. Do uzupełnienia w USOS albo w słowniku nadpisań w `pobierz_plan.py`.
- **53 rodzaje uwag po polsku (ok. 150 wystąpień w kolumnie „notes”)**. Propozycja: słownik najczęstszych zwrotów w `pobierz_plan.py` albo w `PlanZajec.astro`, a dla reszty dopisek “(notes from USOS, in Polish)”.

  | z USOS | EN |
  |---|---|
  | „tylko dla SIAD/ISIM/MS/SI/TEOR” | “SIAD/ISIM/MS/SI/TEOR students only” |
  | „dla MT/AF/T/SIAD/ISIM” | “for MT/AF/T/SIAD/ISIM” |
  | „co 2 tygodnie”, „zajęcia co 2 tygodnie, dni N/P” | “every two weeks”, “every two weeks, odd/even weeks” |
  | „pierwsze zajęcia 6.11” | “first class on 6 Nov” |
  | „zajęcia od 12X” | “classes from 12 Oct” |
  | „ostatnia edycja przedmiotu” | “last time this course is offered” |
  | „ostatnia edycja przedmiotu zgodna ze starym programem” | “last edition under the previous curriculum” |
  | „w semestrze letnim ostatnia edycja przedmiotu” | “last edition in the summer semester” |
  | „ang.” / „pol.” | “in English” / “in Polish” |
  | „prow. R. Sullivan” | “taught by R. Sullivan” |
  | „, dla semestru 4 studiów mgr” | “, for 4th-semester master’s students” |
  | „studia I stopnia” / „studia II stopnia” | “first-cycle (bachelor’s) studies” / “second-cycle (master’s) studies” |
  | „tylko dla studiów II stopnia, obowiązują osobne zapisy” | “master’s students only; separate registration” |
  | „wymagane zaliczenie przedmiotu Numerical methods (= Metody numeryczne)” | “requires a pass in Numerical methods” |
  | „przedmiot w nowym programie występuje pod nazwą 'Miara i całka R'” | “in the new curriculum this course is called ‘Miara i całka R’” |
  | „wrześniowa” | “September resit” |
  | „TU będą kolokwia strona www przedmiotu:” | “Tests will be posted here. Course website:” |
- Sale „inna” i „zd”: zob. K9.

### D2. Wykazy publikacji (`src/data/publikacje/*.json`, import ze starej strony i bibliografii UWr) → głównie `/en/nauka/publikacje/2018/`, `/2019/`, `/2025/`, pojedyncze pozycje w latach 2004–2012; oba wyglądy
Pola `prace[].uwagi`, `prace[].zrodlo`, `prace[].opis` nie mają `_en`. 264 z 2165 pozycji (prawie wszystkie z lat 2018, 2019 i 2025) mają opisy w polskiej konwencji:

| fraza | wystąpień | EN |
|---|---|---|
| „jęz. angielski / jęz. polski” (`uwagi`) | 168 (+23 w `zrodlo`) | “in English / in Polish” |
| „wydawnictwo zagraniczne / krajowe / własne” | jw. | “foreign / Polish / in-house publisher” |
| „praca recenzowana” | jw. | “peer-reviewed” |
| „afiliacja UWr / inna afiliacja / afiliacja wielokrotna / brak informacji o afiliacji” | jw. | “UWr affiliation / other affiliation / multiple affiliations / no affiliation information” |
| „w druku” | 4 | “in press” |
| „s. 405-422” | 227 | “pp. 405–422” |
| „nr 3”, „nr art. 114” | 105 | “no. 3”, “art. no. 114” |
| „Dostęp:”, „Dostęp do abstraktu:”, „Zasób elektroniczny” | 143 | “Available at:”, “Abstract:”, “Electronic resource” |
| „(red.)” | 17 | “(ed.)/(eds.)” |
| „Przy nazwisku X podwójna afiliacja: … oraz …” | 21 | “X has a dual affiliation: … and …” |
| „w tomie”, „w książce”, „T. 151, z. 2”, „link zweryfikowany” | ok. 15 | “in:”, “in the book”, “Vol. 151, issue 2”, “link verified” |

Propozycja: zamiany tych zwrotów przy wyświetlaniu w `src/views/PublikacjeRok.astro:58–68` (dla `lang === 'en'`) albo jedna nota nad listą “Bibliographic details are given as in the University’s bibliography (in Polish)”. Tytuły prac i nazwy czasopism (np. „Wiadomości Matematyczne”, „Magazyn Miłośników Matematyki”) zostają bez zmian.

---

## L. Linki z `/en` do polskich stron

Elementy szablonu nie mają problemu: menu, panel hamburgera, stopka, okruszki, „← Dział”, „Następna strona w dziale” i przełącznik języka prowadzą do `/en/…`, a przełącznik do polskiej wersji tej samej strony (2234 linki). Jedyny wyjątek przełącznika to `/en/studia/kalendarz-zajec/` → `/studia/rok-akademicki/`, co jest poprawne, bo to strona-przekierowanie.

**37 linków na 10 stronach `/en` prowadzi do polskich stron.** Wszystkie są w treściach Markdown pisanych w CMS (`[…](/studia/…)` bez `/en`). Źródło systemowe: `src/plugins/rehype-base.mjs` i `src/lib/markdown.ts:20` dopisują tylko bazę `/Web-Core`, nie dopisują `/en` dla tekstów angielskich. Do wyboru: poprawić 37 linków w treściach albo przekazać `lang` do `renderMarkdown()` i w `rehype-base` dopisywać `/en` do linków wewnętrznych (poza `/pliki/`, `.ics`, `.xml`, `.json`), tak jak robi `wJezyku()`.

| Plik treści (pole) | Link → cel | Strona `/en` |
|---|---|---|
| `src/content/specjalnosci/matematyka-teoretyczna.md` (`tresc_en`, `kariera_en`, `faq[0,7].odpowiedz_en`) | 12 linków: 7 zakładów (`/instytut/zaklady/*`), `/nauka/granty` ×2, `/studia/szkola-doktorska`, `/studia/matematyka#terminy`, `/studia/egzaminy-i-dyplom#egzamin-magisterski` | `/en/studia/matematyka/matematyka-teoretyczna/` |
| `src/content/specjalnosci/matematyka-aktuarialno-finansowa.md` (`tresc_en`, `kariera_en`, `faq[0,6]`) | 6: `/instytut/zaklady/teoria-prawdopodobienstwa`, `/nauka/granty`, `/studia/matematyka#program`, `/studia/matematyka#terminy`, `/studia/egzaminy-i-dyplom`, `/aktualnosci?rodzaj=kariera` | `/en/studia/matematyka/matematyka-aktuarialno-finansowa/` |
| `src/content/specjalnosci/analiza-danych.md` (`tresc_en`, `faq[0,6]`) | 5: `/instytut/zaklady/statystyka`, `/nauka/granty`, `/studia/siad`, `/studia/matematyka#terminy`, `/studia/egzaminy-i-dyplom#egzamin-magisterski` | `/en/studia/matematyka/analiza-danych/` |
| `src/content/specjalnosci/matematyka-stosowana.md` (`tresc_en`, `kariera_en`, `faq[0,7]`) | 5: `/instytut/zaklady/rownania-rozniczkowe`, `/seminaria/rownania-rozniczkowe`, `/studia/szkola-doktorska`, `/studia/matematyka#terminy`, `/studia/matematyka` | `/en/studia/matematyka/matematyka-stosowana/` |
| `src/content/specjalnosci/matematyka-nauczycielska.md` (`kariera_en`) | `/aktualnosci?rodzaj=kariera` | `/en/studia/matematyka/matematyka-nauczycielska/` |
| `src/content/strony/studia/skrypty.md` (`tresc_en`) | 5: `/studia/isim`, `/studia/matematyka#praktyki`, `/studia/egzaminy-i-dyplom`, `/studia/zajecia`, `/pracownicy` | `/en/studia/skrypty/` |
| `src/content/strony/nauka/sukcesy/historia.md` (`tresc_en`) | `/nauka/sukcesy` | `/en/nauka/sukcesy/historia/` |
| `src/content/warto_wiedziec/artykul-w-annals-of-mathematics.md` (`tresc_en`) | `/aktualnosci/2023-11-25-mariusz-mirek-z-nagroda-best-paper-award-in-mathematics-2023` | `/en/warto-wiedziec/artykul-w-annals-of-mathematics/` |
| `src/content/warto_wiedziec/wyklad-terencea-tao.md` (`tresc_en`) | `/nauka/konferencje/2017-analysis-and-applications-in-honor-of-professor-elias-m-stein`, czyli **martwy link** (konferencje nie mają podstron, 404 także po polsku). Proponuję `/en/nauka/konferencje` albo zewnętrzną stronę konferencji | `/en/warto-wiedziec/wyklad-terencea-tao/` |
| `src/content/referaty/statystyka/*.md` (treść, 9 plików, zob. C5) | `/aktualnosci/2026-06-19-seminarium-ze-statystyki` („materiałach seminarium”) | `/en/seminaria/statystyka/` (w rozwijanym streszczeniu) |

Pozostałe:
- **Kanał RSS:** każda strona `/en` ma w `<head>` `<link rel="alternate" type="application/rss+xml" title="News — Mathematical Institute" href="/Web-Core/rss.xml">`. Kanał jest polski (`<language>pl</language>`, polskie tytuły, linki do polskich wpisów). Źródło: `src/layouts/Baza.astro` i `src/pages/rss.xml.ts:9–18`. Do wyboru: osobny `/en/rss.xml` albo nie podawać kanału na `/en`.
- **Linki zewnętrzne do stron tylko po polsku** bez dopisku “(in Polish)” w menu: „Library” → `wmi.uwr.edu.pl/biblioteka-wydzialowa/`, „Mathematics Discipline Council” → `bip.uni.wroc.pl/…`, „Admissions”/„Prospective students” → `studia-wmi.uwr.edu.pl` (sprawdzić, czy jest wersja EN). Dane w `src/data/nawigacja.json`. Przykład dobrej praktyki już na stronie: „All Faculty authorities (in Polish) ↗”.

---

## Do decyzji (nie traktuję jako błędów)

1. **Stopnie i tytuły naukowe w polskiej formie** na stronach pracowników, zakładów (`/en/instytut/zaklady/*`), władz, grantów („PI: prof. dr hab. …”) i obron („Review: dr hab. Łukasz Smaga”, „dr hab. inż.”): „prof. dr hab.”, „dr hab. …, prof. UWr”, „mgr inż.”. Źródło: `src/lib/osoby.ts:3` (`zTytulem()` bez `lang`) oraz napisy w polach CMS (`prowadzacy`, `recenzent`, `kierownik`, `wykonawcy`). Po angielsku (UK/US) zwykle „Prof. Name” / „Dr Name”. Jeśli forma polska ma zostać, przynajmniej wielka litera („Prof. dr hab.”).
2. **„UWr” w nazwie strony:** „… · Mathematical Institute UWr” w `<title>` 372 stron, `og:site_name`, stopka komputera „Mathematical Institute UWr” (`src/layouts/Baza.astro:57, 93`, `src/components/zal/StopkaZ.astro:17`, `src/views/Przekierowanie.astro:19`). Alternatywa: „Mathematical Institute, University of Wrocław”. Także „IM UWr”, „MIM UW”, „WMI” w treściach.
3. **Logo graficzne „Uniwersytet Wrocławski”** na `/en` (`/pliki/uwr-logo.png`, `src/components/zal/PasekMenu.astro:36`, `src/components/Naglowek.astro:34`, okładka). UWr ma wersję angielską logo „University of Wrocław”.
4. **Polskie tytuły prac, grantów i referatów cytowane w aktualnościach:** ok. 90 tytułów w `<em>` na 46 stronach `/en/aktualnosci/*` (np. „O zlokalizowanych sharp funkcjach”, „Spacery losowe na grafach nieskończonych”). Część ma tłumaczenie w nawiasie, część nie. Propozycja: zawsze dodać tłumaczenie w nawiasie.
5. **Oryginalny polski tytuł grantu pod angielskim** (`p.lead` z `lang="pl"`, 87 z 94 grantów, np. „Osobliwe rozwiązania nieliniowych równań parabolicznych”). To zamierzone (`src/lib/widoki/grant.ts:12`, `src/views/Grant.astro:33, 48`). Warto dodać etykietę “Original title:”.
6. **Polskie nazwy przedmiotów w angielskich tekstach o studiach** (`/en/studia/pierwszy-rok/`, `/en/studia/zajecia/`, `/en/studia/skrypty/`, `/en/studia/procedura-dyplomowania/`, `/en/studia/egzaminy-i-dyplom/`): „Analiza matematyczna 1”, „Algebra liniowa 1R”, „Wstęp do matematyki”, „Mój USOSweb”, „Plany użytkownika”, sekcja „Założenia”, „kolokwia”, „starosta”, „dziekanat”. To nazwy z USOS, które student musi rozpoznać. Propozycja: zostawić, z angielskim odpowiednikiem w nawiasie przy pierwszym użyciu.
7. **Tytuły skryptów po polsku** na `/en/studia/skrypty/` („Spacery losowe na skończonych grafach”, „Miara i całka”…) z dopiskiem „(in Polish)”. Poprawne, można zostawić.
8. **Nazwy konkursów, programów i nagród:** „Krok w Przyszłość” (raz z tłumaczeniem „Step into the Future”, raz bez), „Perspektywy”, „Preludium”, „POWROTY”, „MISTRZ”, „KOLUMB”, „Iuvenes Wratislaviae”, „Najlepszy Dyplom Roku”, „Akcja Reaktywacja – Odrodzenie Budzika”, „Mamy pokojowe zamiary”. Nazwy własne; warto dawać tłumaczenie w nawiasie przy pierwszym użyciu.
9. **Polskie nazwy szkół, firm i instytucji** w ogłoszeniach pracy i w nagrodach (z angielskim opisem obok): „Autorska Szkoła Podstawowa „Jaskółka””, „Technikum i Liceum TEB Edukacja”, „Centrum Edukacyjne Chowaniak”, „Krajowa Szkoła Administracji Publicznej”, „Allianz Deutschland AG SA Oddział w Polsce”, „Koło Naukowe Matematyków Teoretyków”. Można zostawić.
10. **Polskie tytuły i streszczenia referatów** (`referaty` bez `tytul_en`/`tresc_en`): „Rozwiązania automorficzne (self-similar) równań konwekcji-dyfuzji” (`rownania-rozniczkowe/2026-10-05-karch.md`, `2026-10-12-karch-2.md`), „Kwantowe grafy Knesera” i streszczenie „Grafy kwantowe są nieprzemiennym uogólnieniem…” (`dyskretna-analiza-harmoniczna/2026-06-18-chelstowski.md`). Język referatu wybiera prelegent; można dodać “(talk in Polish)”.
11. **Adresy i nazwy miejsc:** „pl. Grunwaldzki 2”, „ul. Joliot-Curie 15”, „ul. Kuźnicza 49/55”, „plac Grunwaldzki”, „Będlewo”, „Hejnice”, „Szklarska P.” (skrót w polu `miejsce` konferencji: lepiej „Szklarska Poręba”). Adresy zostają.
12. **Juwenalia** („Rector's day off (Juwenalia student festival)”) w kalendarzu roku akademickiego. Z objaśnieniem, poprawne.
13. **Przełącznik języka „Wersja polska” / „PL”** z `lang="pl"` na `/en` to standardowa konwencja (nazwa języka w tym języku). Zostawić.
14. **Fragmenty po polsku bez `lang="pl"`** (notki patronów, tematy prac, uwagi z USOS, metadane publikacji): czytnik ekranu przeczyta je angielskim głosem. Dopóki tekst nie jest przetłumaczony, warto oznaczyć `lang="pl"`.
15. **Strona 404** (`src/pages/404.astro`): ktoś z `/en` trafia na nagłówek i przyciski po polsku, a angielski jest tylko opis. Można dodać angielski nagłówek i przyciski albo osobny wariant.
16. **Strona `/powiadomienia/`** (link z angielskich e-maili o referatach) ma polski szablon (menu, stopka), a treść jest dwujęzyczna. Jest poza `/en`, ale odbiorcy są głównie anglojęzyczni.

---

## Drobne uwagi o angielskim (nie polskie słowa)

- Kalendarz, przyciski filtrów na komputerze: „Event”, „PhD defence”, „Conference” w liczbie pojedynczej, a obok „Seminars” w mnogiej (`src/views/Kalendarz.astro:38–40` używa `RODZAJE` zamiast `RODZAJE_FILTRY`). Na telefonie lista ma liczbę mnogą.
- Plan zajęć: skróty typów „lect.”, „worksh.”, „pract.”, „prosem.”. Zrozumiałe; „worksh.” można zamienić na „wkshp” albo pełne słowo.

## Jak powtórzyć

Skrypty pomocnicze (poza repozytorium): `/tmp/claude-0/-home-claude/6b7c63d3-0298-5d0f-bcb3-9f062681cdd9/scratchpad/an/`. `crawl.js` renderuje wszystkie strony `/en` w dwóch szerokościach, `interact.js` wykonuje interakcje, `analyze.py` wykrywa polski tekst, `cms_gaps.py` szuka pól CMS bez `_en`. Surowe wyniki są w `all.jsonl`, `rows.json`, `links.json` i `interact.json`.
