# Raport: zlecenie 18 — uwagi z oglądania, część 2 (6.11.2026)

Gałąź: `wyglad/zlecenie-16`, osobny commit na każdy punkt, bez pushu. Zrobione wszystkie punkty GOTOWE. Punkty 1–5 powstały we wcześniejszej sesji i tam nie powstał ich raport, więc opisuję je tylko krótko. Punkty 6–19 zrobiłem i zmierzyłem w tej.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Marka w pasku przygasa zamiast podkreślenia | `da484544` |
| 2 | Aktualności: chudszy baner bez liczb | `4265fac4` |
| 3 | Lista Aktualności: filtry z boku, dwie kolumny | `15e58e19` |
| 4 | Pojedyncza aktualność: karta boczna | `2f2cc10f` |
| 5 | USOSweb poza menu | `70c3c6f9`, klon `tresci\Web-Ustawienia`: `9e91818` |
| 6 | Jedno menu hamburgera (hybryda) | `3d91ed60`, `a1fca71b` |
| 7 | Aktualności: baner ze zdjęciem | `ed8b9d9e`, klon `tresci\Web-Ustawienia`: `e3d250a` |
| 8 | Szybki dostęp: kolumna Aktualności zwarta | `61cbbd0e` |
| 9 | Kolor działu aktualności: najpierw rodzaj | `df04dde6` |
| 10 | Pasek: rozmycie zamiast przyciemnienia | `f5c355d1` |
| 11 | Telefon: pierwsza aktualność bez wyróżnienia | `f4e791c7` |
| 12 | Telefon: Wydział w pasku, tytuł okładki wyżej | `c9059874` |
| 13 | Okładka: kadr zdjęcia na każdym monitorze | `9da772d4` |
| 14 | Telefon: baner działu, liczby pod opisem patrona | `7a6a3bf6` |
| 15 | Telefon: pełny rysunek ciekawostki | `1c9c52f1` |
| 16 | Telefon: pas działu jako karty grup | `87d5339a` |
| 17 | Telefon: podstrony Studiów, zdjęcie na tablice | `dc2b3b58` |
| 18 | Telefon: bez „Na tej stronie” | `68ca1a7f` |
| 19 | Telefon: Plan zajęć w jednej linii | `388bfdf9` |

**Inaczej, niż zakładało polecenie:** w drzewie roboczym nie było niezacommitowanej pracy nad punktem 6. Drzewo było czyste, a punkt leżał już w commicie `3d91ed60`. Brakowało w nim części „Szerszy panel” z decyzji 01:10 (panel miał 968 px wysokości i przewijał się przy 1536×730), więc dorobiłem ją osobnym commitem `a1fca71b`. Punkt 6 ma przez to dwa commity.

**Do Twojej decyzji**

1. **Aktualności, krycie paska (punkt 10):** żeby dojść do 4,5:1, pasek nad zdjęciem ma po przewinięciu 60% krycia zamiast 30–45%. Alternatywa: 45% i cień tekstu. Zostawić 60%?
2. **Okładka bez paska (punkt 10):** na okładce nie ma paska, tylko logo i przyciski z własnym tłem. Tak zostało. Chcesz tam pas z rozmyciem?
3. **Podtytuł na innych stronach EN (punkt 12):** przy oknie ok. 421–490 px „Faculty of…” nachodzi na przyciski (np. `/en/kalendarz` przy 430 px). Na stronie głównej go schowałem, innych stron nie ruszałem. Poprawić tak samo?
4. **Długa nazwa grupy EN (punkt 16):** „Diploma and student affairs” łamie się na 3–4 linie zamiast dwóch (karta 99–118 px, pas 115–134 px). To nazwa z menu, nie ruszałem. Krótsza nazwa?
5. **SIAD po angielsku (punkt 6):** w polskim panelu jest skrót „SIAD”, w angielskim kierunek „AI in Data Science” skrótu nie ma. Zostawić?
6. **`dok/estetyka.md` nie istnieje (punkt 9):** plik jest tylko w archiwum `.przekazanie\robocze`, więc regułę opisałem wyłącznie w komentarzu przy funkcji. Dopisać ją gdzieś jeszcze?
7. **Zrzuty `z18-wpis-*` (punkt 4):** nie ma ich w `raport-zrzuty`, choć wymagał ich odbiór punktu 4. Polecenie obejmowało punkty od 6, więc ich nie dorabiałem. Dorobić?
8. **Poza zleceniem, znalezione przy regresji:** `/studia/sprawy-studenckie` i wersja EN przy 320 px przewijają się w poziomie o 8 px, przez tabelę w treści („Studia II stopnia”, ukryte dopiski „(inna strona)”). Reguł `.prose` w tym zleceniu nie ruszałem. Przy 360 px i więcej problemu nie ma. Nie poprawiałem.
9. **Oryginał zdjęcia (punkt 7):** `aktualnosci-skok.jpg` ma 1756 px, na ekranach 2× jest lekko miękkie. Jeśli masz większy plik, podmienię.
10. **Push czeka na Twoje słowo:** Web-Core i klon Web-Ustawienia (w tym zleceniu `9e91818` i `e3d250a`, klon ma teraz 5 commitów przed `origin/main`).

**Stan sprawdzenia**

- `npm run build` przechodzi: 759 stron, `pagefind` 744 strony. Tym razem budowałem do `dist`, nie do katalogu tymczasowego. W `dist` nie ma `id="menu-telefon"` ani klasy `mnav` (0 plików).
- `astro check`: 6 błędów, **żaden nowy** (3 `process` w `astro.config.mjs`, 3 w `src/lib/zdjecia.ts`). `skrypty/sprawdz_tresci.py`: „OK — sprawdzono 555 plików”. `skrypty/pobierz_tresci.py` nie był uruchamiany. `package.json` bez zmian. Nowych pól CMS nie ma.
- **Regresja końcowa** na serwerze deweloperskim, po wszystkich punktach: 17 stron PL i te same `/en` przy 320, 360, 375, 390, 430, 800, 1536 i 2560 px, razem 272 wejścia. Wynik: HTTP 200, bez błędów JavaScriptu, bez przewijania w poziomie, z jednym wyjątkiem: pytanie 8.
- **Miara przewijania w poziomie:** skrypty poszczególnych punktów liczyły ją względem `innerWidth`, a to w emulacji telefonu potrafi ukryć przewijanie (tak było z pytaniem 8). Regresja końcowa liczy względem `clientWidth`, więc to ona jest wiążąca, ale tylko dla tych 17 stron i szerokości.
- **Przeglądarka:** Chrome 156 przez Playwright, nie Edge jak w zleceniu 17. Edge po aktualizacji (156.0.4314.50 → .58) przestał startować pod Playwrightem. Silnik ten sam.
- **Czego nie sprawdzałem:** Firefoksa, Safari, prawdziwych telefonów, czytnika ekranu (sprawdzone tylko drzewo dostępności). Powrót z bfcache tylko zasymulowany zdarzeniem `pageshow`. Dzielenie wyrazów z punktu 16 tylko w Chrome na Windows, nie na Androidzie ani iOS. Zamiany kolumn na Szybkim dostępie nie dało się sprawdzić przy obecnych danych: Wydarzenia mają tylko 3 pozycje i nie mają „Zobacz więcej”.
- **Punktów 1–5 nie sprawdzałem ponownie osobno**, poza tym, co objęła regresja i odbiór punktu 6 (brak USOSweb w panelu, PL i EN).

## Punkty 1–5 (wcześniejsza sesja)

Opis na podstawie commitów i kodu. Kopia nakładki sprzed zmian: `.przekazanie\robocze\nakladka-przed-18\`.

- **Punkt 3, panel testowy:** grupa zostaje, tylko dla Szybkiego dostępu, pod nazwą „Aktualności na Szybkim dostępie”.
- **Punkt 4, węższe okno:** karta nad tekstem na całą szerokość przy oknie 761–1103 px, dwie kolumny od 1104 px.
- **Punkt 5:** link USOSweb usunięty z danych w klonie Web-Ustawienia, filtr `jestUsos` usunięty z kodu.

## 6. Jedno menu hamburgera

**Wysokość treści panelu, bez przewijania, każdy dział rozwinięty.** Te same liczby na podstronie oraz na stronie głównej w obu egzemplarzach panelu.

| Okno | Instytut | Nauka | Studia | Popularyzacja |
| --- | --- | --- | --- | --- |
| 1536×730 | 589 | 589 | 620 (EN 651) | 566 (EN 597) |
| 1366×640 | 573 | 573 | 604 (EN 635) | 550 (EN 581) |
| 1920×950 | 589 | 589 | 620 (EN 651) | 566 (EN 597) |

- **Panel:** 640 px szerokości. Pole szukania 406 px przy 1536 (na okładce 490), 214 px od 1920, odstęp do krzyżyka 12 px (na okładce 42). Krzyżyk w panelu do 3440 px.
- **Zawartość:** kolejność taka sama na komputerze i telefonie, PL i EN. USOSweb brak. SIAD jako skrót (w EN patrz pytanie 5). Szukanie prowadzi do `/szukaj?q=…` i `/en/szukaj?q=…`.
- **Bieżący dział i strona:** `/studia/plan-zajec` rozwija Studia z Planem zajęć, `/seminaria/geometria` rozwija Naukę z Seminariami. `/`, `/aktualnosci`, `/kalendarz` zwinięte, w Aktualnościach oznaczona sama pozycja „Aktualności”.
- **Telefon 390×780:** przewija się panel (383 px), strona stoi. `aria-label` Otwórz/Zamknij, przycisk rozwijania 44×44, klik obok i Esc zamykają, fokus wraca na hamburger.
- **Pasek przy 320 px:** odstęp nazwy do narzędzi 8 px PL, 15 px EN, 61 px wysokości, bez przewijania w poziomie, przyciski 40×40 (do 380 px), 44×44 przy 390.
- **Klawiatura** działa. **Bez JS** grupy widoczne, przycisk rozwijania schowany.

**Odstępstwa:**
- `--marg` w panelu ma górną granicę 340 px. Bez niej przy oknie szerszym niż 1920 px krzyżyk wypadałby poza panel, a pole szukania nie miałoby miejsca.
- Przy oknie niższym niż 660 px panel jest o 16 px ciaśniejszy, żeby Studia zmieściły się przy 1366×640.

Zrzuty: `z18-menu-*`.

## 7. Aktualności: baner ze zdjęciem

- **Kadr:** `48% 63%` zamiast `48% 52%`, bo przy 2048 px ucinało stopy. Zdjęcie 62% szerokości, najwyżej 1270 px. Na telefonie od prawej 78%, nie 100%, bo osoba tonęła pod tekstem.
- **Osoba cała** przy 2560, 2048, 1536, 800, 390 i 320 px. Baner: lista 281 px, wpis 256 px; telefon: lista 126 px, wpis 95 px. Filtr `none`, mieszanie `normal`.
- **Inne strony z granatem, bez zmian:** deklaracja dostępności, kalendarz, o stronie, polityka prywatności, szukaj (PL i EN).
- Plik w klonie Web-Ustawienia (`e3d250a`) i w nakładce.

Zrzuty: `z18-aktualnosci-baner-foto-*`.

## 8. Kolumna Aktualności zwarta

| Okno | Wpisów | Dalej |
| --- | --- | --- |
| 1536×730 | 7 | i jeszcze 5 |
| 1920×940 | 10 | i jeszcze 2 |
| 1366×640 | 7–8 | |

Liczba zależy od wysokości „Warto wiedzieć”, które jest losowane: lista ma 471–560 px przy 1536.

**Odstępstwa:**
- Poniżej 1180 px wyróżniony wpis nadal ma zdjęcie nad tekstem, bo przy miniaturze 78 px kolumna tekstu miałaby tylko 65–139 px.
- Kolor „czytaj dalej” to `--ink`, jak w podglądzie, nie `--d-a` z listy.

## 9. Kolor działu: najpierw rodzaj

Funkcja przeniesiona do `src/lib/patroni.ts`. W sumie 163 wpisy: przed Studia 118, Nauka 45; po Nauka 144, Studia 16, Popularyzacja 3.

| Data | Wpis | Rodzaj | Dla | Przed | Po |
| --- | --- | --- | --- | --- | --- |
| 2026-10-30 | Testowe: Wykład otwarty: Co macierze losowe wiedzą o liczbach pierwszych | wydarzenie | studenci, doktoranci, pracownicy | Studia | Nauka |
| 2026-10-29 | Testowe: Warsztaty dla licealistów: od spirali Ulama do szyfru RSA | wydarzenie | kandydaci | Studia | Popularyzacja |
| 2026-10-28 | Testowe: Spotkanie koła naukowego: gry kombinatoryczne… | wydarzenie | studenci | Studia | Nauka |
| 2026-10-27 | Testowe: Dzień otwarty matematyki dla kandydatów | wydarzenie | kandydaci | Studia | Popularyzacja |
| 2026-10-17 | Rusza tutornia | ogłoszenie | studenci | Studia | Studia |
| 2026-10-16 | Praca dla korepetytora z matematyki | kariera | studenci | Studia | Studia |
| 2026-10-01 | Witamy studentów pierwszego roku | ogłoszenie | studenci, pracownicy | Studia | Studia |
| 2026-09-23 | 2. Kongres Młodych Odkrywców | wydarzenie | kandydaci | Studia | Popularyzacja |
| 2026-09-20 | Kurs dla studentów pierwszego roku | ogłoszenie | kandydaci, studenci | Studia | Studia |
| 2026-09-10 | Wykład prof. Uwe Franza | wydarzenie | studenci, pracownicy | Studia | Nauka |
| 2026-08-03 | Otrzymaliśmy kategorię naukową A+ | sukces | pracownicy, studenci | Studia | Nauka |
| 2026-07-24 | Praca dla nauczyciela matematyki w Technikum i Liceum TEB Edukacja… | kariera | studenci | Studia | Studia |
| 2026-07-14 | Szkoła dla studentów Baby Steps Beyond the Horizon | wydarzenie | studenci, doktoranci | Studia | Nauka |
| 2026-07-02 | Praca dla nauczyciela matematyki w Szkole Podstawowej nr 107… | kariera | studenci | Studia | Studia |
| 2026-06-26 | Praca na Uniwersytecie Przyrodniczym w Poznaniu | kariera | studenci | Studia | Studia |

## 10. Pasek: rozmycie

- **Przyczyna:** `view-transition-name` na `.z-pasek` tworzył osobny korzeń tła, więc rozmycie, także dawne, nie działało przy włączonych animacjach. Nazwę przeniosłem na `.z-pasek-in`, tło przenika razem ze stroną.
- **Odstępstwo:** pasek przechodzi na jasny, gdy krawędź banera dochodzi do **dolnej** krawędzi paska, nie górnej. Inaczej prześwitujący pasek nad jasną treścią miał tylko 1,8:1.
- **Krycie po przewinięciu:** domyślnie 30%, działy 45%, podstrony działów 40%, Aktualności 60%. Na górze 30% wszędzie. Aktualności są jedynym miejscem powyżej drabinki ze zlecenia: 45% daje tam 3,23:1, 60% daje 4,6:1 (pytanie 1).

**Kontrast tekstu menu** (góra / najmniejszy po przewinięciu, animacje włączone). Metoda: zrzut paska bez treści, najjaśniejszy piksel całego paska, przewijanie co 20 px aż do przejścia na jasny.

| Baner | Jasny motyw | Ciemny motyw |
| --- | --- | --- |
| Instytut | 6,38 / 4,84 | 9,01 / 6,06 |
| Nauka | 5,48 / 4,81 | 8,27 / 5,51 |
| Studia | 6,34 / 4,89 | 8,94 / 5,73 |
| Popularyzacja | 6,86 / 4,53 | 9,27 / 5,44 |
| Podstrona Instytutu | 8,6 / 4,84 | 9,97 / 5,16 |
| Podstrona Nauki | 8,25 / 5,04 | 9,67 / 5,53 |
| Podstrona Studiów | 8,62 / 4,8 | 9,76 / 5,32 |
| Podstrona Popularyzacji | 8,72 / 5,14 | 9,89 / 5,5 |
| Aktualności | 6,14 / 4,61 | 6,14 / 4,61 |
| Pojedynczy wpis | 5,51 / 4,6 | 5,51 / 4,6 |
| Kalendarz | 9,04 / 4,87 | 10,34 / 5,21 |
| Szukaj | 10,02 | 10,85 |

Okładka nie ma paska: tylko logo i przyciski z tłem 42% i `blur(6px)`, biały na najjaśniejszym pikselu wewnątrz przycisku 8,8–12,7:1. Bez zmian (pytanie 2).

Zrzuty: `z18-pasek-*`.

## 11. Telefon: pierwsza aktualność

- **Drugi ekran, 390 px:** 3 wiersze, przycisk „Zobacz więcej (9)” / „See more (9)”. Pierwszy wiersz: kolumny 44/230/64, dzień 25 px, tytuł 14,5 px, miniatura 64×48, bez zajawki.
- **Lista, 390 px:** pierwszy wiersz jak inne: kolumny 54/292, data 28, tytuł 18,5, zajawka 15 (zwykłe wiersze też ją mają, więc została), zdjęcie 54×54, `sizes` 81 px.
- **Komputer bez zmian:** drugi ekran 44/310/78, lista 76/596/200.

Zrzuty: `z18-telefon-akt-*`.

## 12. Telefon: Wydział w pasku

**Krój:** pasek telefonu i okładka komputera mają tę samą wspólną regułę i zmierzone te same wartości: Manrope Variable, 14 px, 500, 17,5 px, `rgb(255 255 255 / .85)`.

| Szerokość | Linie PL | Linie EN | Odstęp do przycisków PL | Odstęp do przycisków EN |
| --- | --- | --- | --- | --- |
| 320 | 3 | 3 | 48 | 8 |
| 360 | 2 | 2 | 26 | 7 |
| 375 | 2 | 2 | 41 | 22 |
| 390 | 2 | 2 | 27 | 8 |
| 430 | 2 | 2 | 64 | 46 |

- Pasek 61 px. Sprawdzone co 1 px od 320 do 760: PL 3 linie do 340, potem 2; EN 3 linie do 359 i przy 381–387, poza tym 2.
- **Okładka:** 360×640: ostatni dział do 588, strzałka do 626 z 640. 390×760: 708 i 746 z 760.
- **Po zjechaniu:** Instytut, gdy tytuł schowa się pod paskiem. Przeładowanie w środku strony: Instytut. Bez JS: Wydział. Ukryty link nie dostaje fokusu i nie ma go w drzewie dostępności.

**Odstępstwa** (wszystkie, żeby tekst się zmieścił bez zmiany kroju):
1. W EN przy ≤ 389 px bez podziału z komputera, inaczej 4 linie i 71 px.
2. Przy ≤ 330 px marginesy paska 12 px zamiast 16 i odstęp logo–tekst 8 zamiast 10, tylko strona główna.
3. Odstęp w pasku strony głównej 6 px zamiast 16, inaczej EN nie mieści się przy 360 i 390.
4. Po zjechaniu w EN ≤ 500 px bez podtytułu, bo nachodził na przyciski (pytanie 3).

Zrzuty: `z18-okladka-telefon-*`.

## 13. Okładka: kadr

v = środek budynku w wysokości okładki, X = ile szerokości zdjęcia wypada przy prawej krawędzi.

| Ekran | Zdjęcie | v | X | Dół zdjęcia |
| --- | --- | --- | --- | --- |
| 1366×768 | 1344×591 | 34,5 | 88,6 | 75% |
| 1536×864 | 1512×665 | 34,5 | 87,7 | 75% |
| 1920×1080 | 1890×832 | 34,5 | 86,9 | 75% |
| 2048×1152 | 2016×887 | 34,5 | 87,9 | 75% |
| 2560×1440 | 2520×1109 | 34,5 | 90,6 | 75% |
| 2560×1080 | 2481×1091 | 34,5 | 92 | 88% |
| 3440×1440 | 3439×1513 | 34,5 | 92 | 90% |
| 1536×730 (okno z paskami przeglądarki) | 1494×658 | 34,5 | 92 | 82% |
| 1920×940 (okno z paskami przeglądarki) | 1829×805 | 34,5 | 92 | 80% |

- **Różnica względem tabeli ze zlecenia:** tamta jest liczona dla okna niższego o ok. 128 px i z mniejszym `--foto-x` z fontów zastępczych (narzędzie 81–203 px, strona 161–278 px). W pełnej wysokości ekranu rządzi dolna granica `0,77·H·r`, więc X spada do 87–91%. Dla okna z paskami przeglądarki wychodzi 92%, jak w narzędziu.
- **Proporcje** 2,273 przy naturalnych 2,271–2,273. Bez pustych miejsc u góry i z prawej.
- **Telefon, środek budynku dokładnie w G/2:** 320×568 G 30, 360×600 G 80, 360×640 G 120, 375×667 G 147, 390×660 G 140, 390×760 G 240, 430×760 G 240, 430×932 G 412. Narzędzie podawało 108, 168, 268: strona ma G mniejsze o ok. 28 px, bo strzałka i działy zajmują więcej. Na niskich ekranach dach chowa się pod paskiem, jak zapowiadało zlecenie.
- „Prawa krawędź 86%” i `translateY(-8.2%)` nie było w kodzie, nie było czego usuwać.

**Odstępstwa:**
1. Zanik dolnych 22% zdjęcia na telefonie. Inaczej przy 360×640 i niżej widać ostrą krawędź zdjęcia na pierwszym dziale.
2. Telefon obrócony poziomo: zdjęcie na całą szerokość zamiast 62% wysokości, bo byłoby węższe od ekranu (667×375: pas 83 px z lewej).
3. Wysokość zdjęcia w skrypcie z pomiaru, nie ze stałych 62%, żeby działało też po obróceniu.
4. `sizes` na telefonie: `max(100vw, 62·r vh)`, ok. 8% więcej niż faktyczna szerokość.

Zrzuty: `z18-okladka-*`, `z18-okladka-telefon-kadr-*`.

## 14. Telefon: baner działu

| Dział | 390 px przed → po | 360 px przed → po | EN po: 390 / 360 |
| --- | --- | --- | --- |
| Instytut | 406 → 344 | 406 → 344 | 344 / 344 |
| Nauka | 363 → 321 | 382 → 321 | 321 / 321 |
| Studia | 371 → 329 | 390 → 329 | 305 / 329 |
| Popularyzacja | 378 → 335 | 378 → 335 | 328 / 328 |

- **Podpis nachodził** na nazwisko lub linię lat: przy 360 Nauka PL i EN, przy 320 wszystkie poza Popularyzacją. **Poprawa, ponad zlecenie:** do 389 px podpis 22 px zamiast 28 i top 152 zamiast 156, do 340 px 18 px, Popularyzacja bez zmian. Przy 390 jak w zleceniu. Po poprawce bez nakładania przy 320, 360, 390, PL i EN, liczone z pudełek.
- **Fakt** w jednej linii wszędzie poza Popularyzacją przy 320 px: tam 2 linie, bez ucinania i zmniejszania.
- `.tylko-telefon` i `.tylko-komputer` nie miały już żadnej reguły w CSS (usunięte w zleceniu 12), dopisałem je do `zalozyciele.css`.
- Skrypt `dopasuj` bez zmian: na banerze działu nie mierzy `.z-tytul`, bo ma granicę z prawej z `.z-patron`. Komputer: pomiary pudełek identyczne przed i po przy 1536×730.

Zrzuty: `z18-baner-dzial-*`.

## 15. Telefon: rysunek ciekawostki

Sprawdziłem całą pulę działu zamiast kilku losowań: Instytut 25 (Władze, Struktura), Studia 22 (Plan zajęć, Sprawy studenckie), Nauka 25 (Seminaria), Popularyzacja 31 (Uczniowie), przy 320, 360 i 390 px. Liczone z pudełek ścieżek: **0 poza banerem, 0 poza ekranem, 0 poza svg**. Rysunek ma 104 px szerokości; 83 px wysokości w niskim banerze (95 px), 116 przy 128, 130 w wyższych.

Tytuł zachodzi na rysunek m.in. na Sprawach studenckich przy 360, Strukturze i Władzach. Jest czytelny: biały nad kreską 70%. Brak strony do zgłoszenia.

Zrzuty: `z18-znak-telefon-*`.

## 16. Telefon: karty grup

Wysokość pasa, zwinięty / z najdłuższą grupą:

| Szerokość | Instytut | Nauka | Studia | Popularyzacja |
| --- | --- | --- | --- | --- |
| 390 PL | 92 / 162 | 97 / 209 | 97 / 255 | 92 / 228 |
| 390 EN | 97 / 167 | 97 / 209 | 115 / 274 | 92 / 286 |
| 360 PL | 97 / 167 | 97 / 209 | 97 / 255 | 92 / 228 |
| 360 EN | 97 / 167 | 97 / 209 | 134 / 295 | 92 / 286 |
| 320 PL | 97 / 167 | 115 / 230 | 97 / 260 | 92 / 228 |
| 320 EN | 97 / 167 | 97 / 209 | 134 / 297 | 92 / 324 |

- **Kontrast** na wybranej karcie: jasny 5,67–6,45:1, ciemny 8,04–8,70:1. Liczba stron na niewybranej 5,27–6,21:1.
- **Odstępstwo:** nazwy dłuższe niż karta przenoszone z dywizem (`hyphens: auto`, w razie braku słownika `overflow-wrap: anywhere`), krój 16 px bez zmian. Bez tego „Organizacja”, „Wydarzenia”, „Organisation”, „Programmes” wychodziły poza kartę o 1–16 px przy 320 i 360.
- Przy 320 px „Wydarzenia naukowe” ma 3 linie, a EN „Diploma and student affairs” 3–4 linie (pytanie 4).
- **Podświetlenie** na `::before` wysuniętym o 6 px, bez ujemnych marginesów i bez nachodzenia na sąsiada.
- **Bez JS:** karty schowane, 3 grupy z nagłówkami. Rekrutacja schowana także bez JS. **Klawiatura** i `aria-expanded` działają. **Komputer:** pudełka pasa, rzędów i Rekrutacji przy 1536 i 1000 px identyczne przed i po.

Zrzuty: `z18-pas-karty-*`.

## 17. Telefon: tablice na podstronach Studiów

- Plan zajęć (232 px przy 320–390, 216 przy 430) i Sprawy studenckie (95 px; 128 px z dwulinijkowym tytułem przy 320), PL i EN: zdjęcie góra ≤ 0, dół i boki poza banerem, bez pustego pasa. Mała wersja zdjęcia w tych samych wymiarach. Przy 390: 858×483, lewa −208.
- **Wczytany plik przy 390 px i 2×: 1920 px** (przy 320 i 360: 1600).
- Baner działu Studia przy 390: zdjęcie 390×329, `cover`, bez zmian. Komputer bez zmian.

Zrzuty: `z18-studia-tablice-*`.

## 18. Telefon: bez „Na tej stronie”

- **390 px, PL i EN** (Władze, Seminaria, Konferencje, Granty, Plan zajęć, Matematyka, Sprawy studenckie, Uczniowie): spis schowany, odstęp treści od banera 18 px.
- **Kotwice z zewnątrz** działają: `/seminaria#z-zakladow`, `/en/seminaria#z-zakladow`, `/seminaria/geometria#z-nadchodzace`. Cel 146 px od góry okna, pod paskiem 61 px. Duży zapas to reguły sprzed zlecenia.
- **Blok „Powiadomienia e-mail”** seminarium 28 px pod treścią.
- **Komputer:** spis 236 px, nagłówek, znacznik i bieżąca sekcja działają. Przycisk zwijania usunięty z HTML, skrypt zwijania i reguły telefonu też.

Zrzuty: `z18-bez-spisu-*`.

## 19. Telefon: Plan zajęć

| Szerokość | Semestr | W jednej linii | Strona |
| --- | --- | --- | --- |
| 390 PL | zimowy | 187 z 300 (przed 39) | 17 807 px (przed 21 475) |
| 390 PL | letni | 293 z 304 (przed 87) | 16 245 px (przed 20 618) |
| 390 EN | zimowy | 165 z 300 | 18 066 px |
| 320 PL / EN | zimowy | 66 / 63 z 300 | 21 801 / 21 425 px |
| 360 PL / EN | zimowy | 139 / 114 z 300 | 19 262 / 19 417 px |
| 430 PL / EN | zimowy | 233 / 218 z 300 | 16 642 / 16 716 px |

- **Pasek:** 114 px, semestry 178 i 179 px, 13,5 px, pod nimi dni. Filtr dni i semestr działają (300 → 58 we wtorek), bez błędów w konsoli.
- **Te same inicjał i nazwisko:** w `plan.json` (oba semestry, 93 osoby) nikogo. Kod ma regułę na taki przypadek (pełne imię). Imion złożonych w danych nie ma. Nazwiska z łącznikiem: 6 osób, np. „M. Romanowska-Majsnerowska”, całe.
- **Czytnik** w drzewie dostępności: „wyk. · Piotr Kowalski · czw. 10:15–11:00 · sala HS”. Skrót ma `aria-hidden`.
- **Komputer:** wysokość 11 892 px i kolumny bez zmian. Wyszukiwarka: „kowalski” 9 wierszy, „jagiella” 6.

Zrzuty: `z18-plan-telefon-*`.
