# Raport: zlecenie 27 — listy w stylu Aktualności i drobne (7.11.2026)

Gałąź: `wyglad/zlecenie-16`. Na polecenie właściciela wysłana na GitHub razem z wcześniejszymi zleceniami 22–26 (podgląd przebudowany ręcznie). Repozytoria treści bez zmian. `skrypty/pobierz_tresci.py` nie był uruchamiany w głównym drzewie, tylko z `--lokalnie` w osobnej kopii. Build „przed” (HEAD `00963ca1`) i „po” robione w kopii poza głównym drzewem: przed 747 stron, po 749 (doszły 2 strony przekierowania).

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Kalendarz w stylu Aktualności, wspólny panel „Pokaż” | `b73b943b` |
| 2 | Obrony doktorskie i „Warto wiedzieć” w tym samym stylu | `4eb3aa25` |
| 3 | Cała skacząca postać pod paskiem menu | `0e812dff` |
| 4 | `/instytut/zaklady/` przekierowuje na Strukturę | `74c92909` |
| 5 | Krzyżyk panelu menu w prawym górnym rogu panelu | `9ed260c8` |
| 6 | Stopka, Szukaj i 404 w kolumnie strony, godziny w karcie wydarzenia | `08fe2676` |
| 7 | Cotygodniowy pomiar szerokości w GitHub Actions | `272b693b` |

Wynik w skrócie:
- **Listy:** Kalendarz, Obrony i „Warto wiedzieć” mają baner, panel „Pokaż” i kolory jak Aktualności. Każdy filtr, rok, dział i wyszukiwanie działa w PL i EN, na komputerze i telefonie. Lista Aktualności po przeniesieniu na wspólny komponent jest piksel w piksel taka jak przed (64 porównania).
- **Kadr:** od 1024 do 2560 px ręce są 12–25 px pod paskiem; przed zmianą od 1536 px chowały się pod nim (do −47 px).
- **Menu:** krzyżyk 24 px od górnej i prawej krawędzi panelu; pole szukania przy 1920 px ma 566 px zamiast 252 px.
- **Pomiar szerokości:** pierwszy przebieg na komputerze (1308 renderów, 16 368 ciekawostek) bez kolizji i bez poziomego przewijania; jedno fałszywe X z renderu bez CSS i jedno fałszywe O poprawione w narzędziu. Wzorzec jest pusty.

Zrzut zbiorczy z odbioru: `raport-zrzuty/z27-listy-obok-siebie.jpg` (Aktualności, Kalendarz, Obrony, „Warto wiedzieć” przy 1024, 1280, 1536 i 1920 px).

## Punkt 1: Kalendarz

Nowy wspólny komponent `src/components/zal/ListaPokaz.astro` ze skryptem `src/scripts/zal/panel-pokaz.ts`: lista w kolumnie treści i panel „Pokaż” z prawej (236 px, odstęp 56 px, przyklejony 16 px pod paskiem). Używają go Aktualności, Kalendarz, Obrony i „Warto wiedzieć”. W panelu jest mały napis „Pokaż”, opcje filtra jako lista z kreską przy wybranej i pole szukania. Na telefonie (poniżej 1024 px) zamiast przycisków jest lista wyboru, a pod nią pole szukania, oba nad listą. Bez JS filtrów nie ma i widać całą listę.

Kalendarz:
- baner jak w Aktualnościach (`z-foto-nat`, `aktualnosci-skok.jpg`), bez liczb, samo hasło „Co, gdzie i kiedy” / „What, where and when”;
- w panelu: Wszystkie, Wydarzenia, Obrony, Konferencje, Seminaria i pole „Szukaj w kalendarzu”; rząd przycisków nad listą zniknął;
- przełącznik Nadchodzące / Archiwum nad listą, na całą szerokość kolumny listy: dwie równe połówki, 44 px, napis 15 px, wybrana połówka wypełniona kolorem tekstu (granat; w ciemnym motywie jasna), druga z obrysem; `aria-pressed`, obrys fokusu 2 px; na telefonie nad filtrami, na całą szerokość;
- data i etykieta wiersza w kolorze działu: seminarium — Nauka, obrona i konferencja — Nauka, wydarzenie — `dzialWydarzenia()` jak w Aktualnościach (zielony, różowy itd.);
- wiersze w wariancie zwartym (`WierszWydarzenia.astro`, `zwarty`): rozmiary daty, etykiety i tytułu jak w wierszu Aktualności.

`banerAktualnosci()` w `src/lib/patroni.ts` decyduje, które strony mają ten baner: lista i wpisy Aktualności oraz listy `/kalendarz`, `/obrony-doktorskie` i `/warto-wiedziec`, PL i EN. Te listy nie mają w nagłówku sygnetu ani ciekawostki działu, jak Aktualności.

Zrzuty: `z27-kalendarz-1536-przed.jpg`, `z27-kalendarz-1536.jpg`, `z27-kalendarz-archiwum-konferencje-1536.jpg` (adres `?rodzaj=konferencja#archiwum`), `z27-kalendarz-390.jpg`, `z27-kalendarz-ciemny-1280.jpg`, `z27-aktualnosci-1536.jpg`.

## Punkt 2: Obrony doktorskie i „Warto wiedzieć”

**Obrony** (`/obrony-doktorskie`):
- baner bez liczb, z hasłem „Publiczne obrony rozpraw”;
- nad listą tekst wprowadzający z CMS (jak dotąd), pod nim grupy „Nadchodzące obrony” i „Odbyte obrony” z nagłówkiem jak miesiąc w Aktualnościach;
- wiersz jak w Kalendarzu: dzień w kolorze Nauki, obok dzień tygodnia, godzina i miejsce, kandydat (cały wiersz prowadzi do strony obrony), tytuł rozprawy, „Promotor:” (dziś żadna obrona w danych nie ma promotora, więc wiersza nie widać);
- panel: „Filtruj według roku” — Wszystkie i lata z obronami od najnowszego (dziś tylko 2026), pole „Szukaj w obronach” (kandydat, tytuł rozprawy, promotor, termin, miejsce);
- link do archiwum starej strony pod listą jak dotąd.

**„Warto wiedzieć”** (`/warto-wiedziec`):
- baner bez liczb, z hasłem „Czym chwalimy się od lat”;
- wiersz jak w Aktualnościach: rok w kolorze działu pozycji, tytuł, zajawka, miniatura z prawej (na telefonie pod rokiem), cały wiersz klikalny, gdy pozycja ma link;
- panel: działy, które mają wpisy (dziś Nauka i Studia), i pole „Szukaj w Warto wiedzieć”;
- link do „Sukcesów” pod listą.

Kolory panelu, nagłówków grup i linków pod listą są neutralne jak w Aktualnościach, także w ciemnym motywie. Bez tego Obrony dostawały zieleń Nauki, a „Warto wiedzieć” brąz Instytutu, bo `<body>` ma `data-dzial` działu z menu. Pojedyncze wpisy (obrona, pozycja „Warto wiedzieć”) bez zmian.

Zrzuty: `z27-obrony-1536-przed.jpg`, `z27-obrony-1536.jpg`, `z27-obrony-lista-1536.jpg`, `z27-obrony-390.jpg`, `z27-warto-1536-przed.jpg`, `z27-warto-1536.jpg`, `z27-warto-390.jpg`.

### Filtry i ich adresy

| Strona | Filtr (parametr) | Wartości | Szukanie |
| --- | --- | --- | --- |
| Aktualności | `?rodzaj=` | jak dotąd | tytuł, zajawka, etykiety |
| Kalendarz | `?rodzaj=` + `#archiwum` | `wydarzenie`, `obrona`, `konferencja`, `referat` (Seminaria) | etykieta, termin, miejsce, tytuł, prelegent, seminarium |
| Obrony | `?rok=` | lata z obronami, np. `2026` | kandydat, tytuł rozprawy, promotor, termin, miejsce |
| „Warto wiedzieć” | `?dzial=` | działy z wpisami: `nauka`, `studia` (później `instytut`, `popularyzacja`) | rok, tytuł, zajawka, etykieta linku |

Nieznana wartość w adresie (np. `?rodzaj=nieznany`) daje „Wszystkie”. W Kalendarzu przełącznik zapisuje `#archiwum` w adresie (`history.replaceState`), a powrót na „Nadchodzące” go usuwa. Przykłady: `/kalendarz/?rodzaj=referat#archiwum`, `/obrony-doktorskie/?rok=2026`, `/warto-wiedziec/?dzial=studia`. Wyszukiwanie nie zależy od wielkości liter ani polskich znaków („rownania rozniczkowe” znajduje „Równania różniczkowe”).

### Odbiór punktów 1–2

Na wersji zbudowanej, 1280×900 i telefon 390×844 (lista wyboru), PL i EN:

| Strona | Sprawdzenie | Wynik (PL, komputer i telefon tak samo) |
| --- | --- | --- |
| Kalendarz, Nadchodzące | Wszystkie / Wydarzenia / Obrony / Konferencje / Seminaria | 8 / 4 / 0 + komunikat „Brak pozycji tego rodzaju.” / 0 + komunikat / 4 |
| Kalendarz, Archiwum | to samo | 85 / 6 / 5 / 52 / 22 |
| Kalendarz | „Gaussian” / „xyzqwerty” / „rownania rozniczkowe” | 1 / 0 + „Brak pozycji spełniających wybrane kryteria.” / 1 |
| Kalendarz | klawiatura: Tab na „Archiwum”, Enter, Shift+Tab, Spacja | obrys 2 px; Enter → `#archiwum`, `aria-pressed="true"`; Spacja → z powrotem „Nadchodzące” |
| Kalendarz | `?rodzaj=referat#archiwum`, `?rodzaj=nieznany` | Archiwum i Seminaria wybrane, same referaty; „Wszystkie” |
| Obrony | Wszystkie / 2026 | 5 / 5 |
| Obrony | „Mrowinska” / początek tytułu rozprawy / „xyzqwerty” | 1 / 1 / 0 + komunikat |
| Obrony | `?rok=2026` | 2026 wybrany |
| „Warto wiedzieć” | Wszystkie / Nauka / Studia | 3 / 2 / 1 |
| „Warto wiedzieć” | „Tao” / „xyzqwerty” | 2 / 0 + komunikat |
| „Warto wiedzieć” | `?dzial=studia` | Studia wybrane, 1 pozycja |

W EN te same liczby; „rownania rozniczkowe” daje 0, bo nazwy seminariów są tam po angielsku. Błędów JS: 0.

- **Aktualności bez zmian:** lista pod banerem porównana piksel w piksel z wersją przed (dwa ekrany: początek listy i po przewinięciu) przy 1024, 1280, 1536, 1920, 2560 px i na telefonie 390, 412, 900 px, PL i EN, jasny i ciemny motyw: 64 z 64 identyczne. Baner Aktualności zmienia się tylko przez kadr z punktu 3.
- **Narzędzie ze zlecenia 24** na Aktualnościach, Kalendarzu, Obronach, „Warto wiedzieć”, karcie wydarzenia, Szukaj i 404 w 11 oknach od 800 do 1920 px: 0 K/R/O/W/X przed i po.
- **Telefon 390 i 900 px:** przełącznik na całą szerokość, pod nim lista wyboru i pole szukania, kreska, lista. Na Obronach tekst wprowadzający stoi nad filtrami (zrzut `z27-obrony-390.jpg`).
- **Ciemny motyw:** wybrana połówka przełącznika jasna, napis ciemny; panel, nagłówki grup i daty czytelne (`z27-kalendarz-ciemny-1280.jpg`).
- **Pusty pas z prawej:** zniknął; panel wypełnia prawą kolumnę jak w Aktualnościach.

## Punkt 3: kadr zdjęcia Aktualności

Postać zajmuje 39% wysokości zdjęcia, a między paskiem a dołem banera zostaje ok. 215 px. Szersze zdjęcie jest wyższe, więc zmieniona jest górna granica szerokości zdjęcia: 980 px zamiast 1270 px. Kadr pionowy zmieniony z 48% 63% na 48% 52% (`zalozyciele.css`, `NaglowekZ.astro`, także `sizes` obrazka). Dotyczy Aktualności (lista i wpisy), Kalendarza, Obron i „Warto wiedzieć”, PL i EN.

Odległość rąk od paska i stóp od dołu banera (px, Aktualności; Kalendarz, Obrony, „Warto wiedzieć” i `/en/kalendarz` mierzone tak samo, wyniki identyczne):

| Okno | Ręce przed | Ręce po | Stopy przed | Stopy po |
| --- | --- | --- | --- | --- |
| 1024 | 19 | 25 | 51 | 44 |
| 1280 | 9 | 22 | 46 | 32 |
| 1366 | 5 | 22 | 43 | 27 |
| 1440 | 0 | 18 | 40 | 21 |
| 1536 | −8 | 14 | 36 | 14 |
| 1707 | −21 | 12 | 28 | 10 |
| 1920 | −37 | 12 | 19 | 10 |
| 2560 | −47 | 12 | 13 | 10 |

Na telefonie kadr też jest wyżej: przy 900 px ręce były schowane pod paskiem, teraz są widoczne; przy 390 px postać jest cała. Od 1707 px zdjęcie ma stałą szerokość 980 px, więc przy szerokich oknach granat zajmuje większą część banera niż dotąd (pytanie 4).

Zrzuty: `z27-kadr-1024-przed.jpg`, `z27-kadr-1024.jpg`, `z27-kadr-1920-przed.jpg`, `z27-kadr-1920.jpg`, `z27-kadr-2560-przed.jpg`, `z27-kadr-2560.jpg`.

## Punkt 4: przekierowanie `/instytut/zaklady/`

`src/pages/instytut/zaklady/index.astro` i `src/pages/en/instytut/zaklady/index.astro`. Mechanizm ten sam co `studia/kalendarz-zajec.astro` (`Przekierowanie.astro`): `<meta http-equiv="refresh">`, skrypt z kotwicą, zwykły link, `noindex`, canonical na cel.

- W przeglądarce: `/instytut/zaklady/` → `/instytut/struktura/`, `/en/instytut/zaklady/` → `/en/instytut/struktura/`, `/instytut/zaklady/#x` → `/instytut/struktura/#x`.
- Mapa strony: `sitemap.xml.ts` to lista adresów wpisanych w kod, a tego adresu w niej nie ma.
- Wyszukiwarka: strona przekierowania nie ma `data-pagefind-body`; indeks Pagefind ma 366 stron przed i po.
- Strony zakładów `/instytut/zaklady/<nazwa>/` bez zmian.

## Punkt 5: krzyżyk panelu menu

Na komputerze krzyżyk stoi 24 px od górnej i prawej krawędzi panelu, przy pasku i na okładce (`zal-menu.css`). Pole „Szukaj na stronie” jest w jednym rzędzie z nim, na całą szerokość panelu bez krzyżyka i 12 px odstępu. Środek pola stoi na wysokości środka krzyżyka (44 px od góry panelu). Pole ma podaną wprost wysokość (42 → 50 px z wysokością okna, jak dotąd), żeby to wyrównanie nie zależało od kroju. Górna granica `--marg` (340 px) przy pasku była tylko dla krzyżyka, więc zniknęła.

| Okno | Krzyżyk od prawej krawędzi panelu przed (pasek) | po | Pole szukania przed (pasek) | po |
| --- | --- | --- | --- | --- |
| 1024×700 | 46 | 24 | 507 | 529 |
| 1366×640 | 62 | 24 | 468 | 506 |
| 1536×730 | 146 | 24 | 418 | 540 |
| 1707×830 | 232 | 24 | 359 | 566 |
| 1920×950 | 338 | 24 | 252 | 566 |
| 2560×1300 | 338 | 24 | 252 | 566 |

Na okładce krzyżyk stał przedtem 18 px od góry i 32 px od prawej, teraz 24 i 24. Po otwarciu fokus jest na krzyżyku, Esc zamyka panel; sprawdzone w 7 oknach na okładce, przy pasku i na stronie EN. Telefon bez zmian (tam krzyżykiem jest przycisk w nagłówku).

Zrzuty: `z27-menu-pasek-1920-przed.jpg`, `z27-menu-pasek-1920.jpg`, `z27-menu-okladka-1366-przed.jpg`, `z27-menu-okladka-1366.jpg`.

## Punkt 6: drobne

1. **Stopka** (`StopkaZ.astro`): nazwa, adres, telefon, e-mail, „© … Uniwersytet Wrocławski” i „Created by Szymon Cygan” są osobnymi elementami bez łamania w środku. Kropka „·” to `::before` następnego elementu, a kropka elementu, który zaczyna linię, wypada przed krawędzią i jest ucięta (`clip-path` tylko z lewej). Po zawinięciu żadna kropka nie zostaje więc na końcu ani na początku linii. Sprawdzone przy 390, 412, 800, 960, 1024, 1280 i 1920 px, PL i EN: przy 390 px trzy linie danych bez kropek na brzegach, przy 960 px EN jedna linia. W lewym marginesie stopki na zrzutach nie ma śladów kropek. Obrys fokusu linków w stopce ma 2 px bez odstępu, żeby nie był przycięty z lewej. Linki „Deklaracja dostępności” itd. też się nie łamią.
2. **Szukaj i 404:** treść w linii kolumny strony (`--marg` na komputerze, 16 px na telefonie), w nowej klasie `.z-w-kolumnie` zamiast `.wrap`. Lewa krawędź treści i tytułu nagłówka po zmianie: 48/48 (1024), 60/60 (1280), 64/64 (1366), 148/148 (1536), 340/340 (1920), 660/660 (2560), telefon 16/16. Przed: 40/48, 40/60, 83/64, 168/148, 360/340, a przy 900 px 36/16.
3. **Godziny w karcie wydarzenia** (`Aktualnosc.astro`): przedział „10:00–14:00” w jednym kawałku (`nowrap`), dzień i data przed nim łamią się normalnie. Przy 1280–1920 px karta ma dwie linie: „sobota, 14 listopada 2026,” i „10:00–14:00”. Przed zmianą łamało się „10:00–” / „14:00”.

## Punkt 7: pomiar szerokości co tydzień

Pliki:
- `skrypty/szerokosci/pomiar.cjs` — narzędzie ze zlecenia 24 przeniesione i rozszerzone;
- `skrypty/szerokosci/podsumuj.py` — raport i ocena;
- `skrypty/szerokosci/wzorzec.json` — zaakceptowane K i X;
- nowe zadanie „Szerokości okna” w `.github/workflows/qa.yml`, obok linków i dostępności; uruchamia się w te same dni i tak samo (poniedziałek 5:17 UTC, ręcznie, gałęzie `qa-*`). GitHub uruchamia harmonogram tylko z gałęzi `main`, więc co tydzień zadanie ruszy dopiero po scaleniu tej gałęzi z `main`. Wcześniej można je uruchomić ręcznie: `gh workflow run qa.yml --repo IM-UWr/Web-Core --ref wyglad/zlecenie-16` (cały przebieg „Kontrola jakości”, ok. 20–30 min).

Co robi przebieg:
- buduje stronę (ścieżka „/”), sam serwuje `dist`. Serwer jest w Node z dużą kolejką połączeń, bo `python -m http.server` przy kilku oknach naraz gubił połączenia i strona bywała bez CSS;
- renderuje 55 stron po polsku i 54 po angielsku (wszystkie z listy zlecenia 24 bez `/instytut/zaklady/`, który teraz przekierowuje; 404 tylko raz) w 12 oknach: 800×900, 860×780, 960×950, 1024×700, 1180×820, 1280×600, 1366×620, 1440×780, 1536×730, 1707×830, 1920×950, 2560×1300;
- stany na stronie: start; drugi ekran strony głównej; każdy kafelek na stronach działów; otwarte menu (strona główna, Studia, Kontakt);
- przy nagłówkach z ciekawostką: **każda ciekawostka z puli działu, która może się na tej stronie pokazać** (bez przypiętych do innych stron; strona z przypiętą ma tylko ją). Ciekawostka jest podmieniana tak jak w skrypcie nagłówka (`NaglowekZ.astro`, potem zdarzenie `resize`), a mierzony jest sam nagłówek. Sprawdzone, że to daje to samo co prawdziwe wejście z tą ciekawostką: 72 z 72 porównań położenia tytułu, hasła, znaku i opisu identyczne (3 strony, 4 okna, 6 ciekawostek);
- wpisy (aktualność, aktualność z wydarzeniem, obrona, grant, zakład, seminarium, „Warto wiedzieć”) mają stały adres. Gdy wpisu już nie ma (np. testowe wpisy przed startem), narzędzie bierze pierwszy pasujący adres z mapy strony, a dla aktualności z wydarzeniem pierwszą z kartą wydarzenia;
- wynik: `raport.md` (macierz strona × okno osobno PL i EN; tabela, na których stronach i w których oknach pole „Na tej stronie” jest zwinięte albo treść jest w widoku telefonu, z atrybutów `data-pole` i `data-tresc` ze zlecenia 25; szczegóły problemów ze stanami), `wyniki.json` i zrzuty ekranu z pierwszym problemem każdego stanu. Wszystko w artefakcie przebiegu „szerokosci-wyniki” (14 dni) i w podsumowaniu przebiegu;
- przebieg kończy się błędem, gdy pojawi się kolizja (K) albo poziome przewijanie (X), których nie ma w `wzorzec.json`, albo gdy ponad 10% renderów skończy się błędem. R, O i W są tylko w raporcie. Zaakceptowanie nowego stanu: `python3 skrypty/szerokosci/podsumuj.py <wyniki> --zapisz-wzorzec` i commit wzorca.

Playwright (1.49.1, Chromium) instaluje się tylko w przebiegu (`npm install --prefix "$RUNNER_TEMP/pw" --no-save`, `playwright install --with-deps chromium`), jak pa11y-ci. `package.json` bez zmian.

### Pierwszy przebieg

Lokalnie (Windows, Chrome, 4 wątki), na zbudowanej wersji „po”: 1308 renderów (109 stron × 12 okien), 16 368 podmian ciekawostek, 0 błędów renderu, 12 min 18 s. W GitHub Actions jeszcze nie był uruchamiany (pytanie 6).

| Wynik | Gdzie | Co to jest |
| --- | --- | --- |
| K | — | brak kolizji |
| X 324 px | Kalendarz, 1440×780 | fałszywy: strona wyrenderowała się bez CSS, bo arkusz stylów nie doszedł z lokalnego serwera testowego. Narzędzie sprawdza teraz arkusze, skrypty i kroje i wczytuje stronę ponownie (do 3 razy, potem błąd renderu). Kalendarz po poprawce: bez problemów |
| O | strona główna PL i EN, 2560×1300 | fałszywy: „(inna strona)” to tekst tylko dla czytnika ekranu (`.sr-only`), który przy skali okładki ma ponad 1 px. Narzędzie go teraz pomija |
| O 10–11 px | `/studia/pierwszy-rok/` 1366×620, EN 1280×600 | „Budynek Instytutu” w zwiniętym spisie „Na tej stronie” (zanik przy dolnej krawędzi ze zlecenia 25); tak samo przed zleceniem |
| O 16 px | `/en/studia/` 1280×600, otwarte menu | „Admissions (in Polish)” na dole przewijanego panelu menu (dalsza część po przewinięciu); przed zleceniem 13 px |

R, O i W nie kończą przebiegu błędem, więc trzy ostatnie zostają tylko w raporcie. `wzorzec.json` jest pusty: od teraz każda kolizja i każde poziome przewijanie kończą przebieg błędem. Obie poprawki narzędzia sprawdziłem na 7 stronach w 4 oknach (28 renderów), na wersji przed i po. Pełny przebieg po poprawkach przerwałem na prośbę właściciela.

Pole „Na tej stronie” i widok telefonu dla treści, okna od 1024 px:

| Strona | Pole zwinięte nad treścią | Treść w widoku telefonu | Pierwsze okno z pełnym układem |
| --- | --- | --- | --- |
| Pracownicy, Studia: ISIM, Matematyka, Sprawy studenckie | 1024×700 | — | 1180×820 |
| Studia: Plan zajęć (PL i EN) | 1024×700, 1180×820, 1280×600 | — | 1366×620 |
| EN: Staff | 1024×700 | — | 1180×820 |
| EN: Mathematics | 1024×700, 1180×820 | — | 1280×600 |

Treść nie przechodzi na widok telefonu na żadnej stronie w oknach od 1024 px. Zrzuty z problemami zajęły 2,5 MB (artefakt).

## Inne sprawdzenia

- `astro check`: 6 błędów, te same co przed zleceniem (`process` w `astro.config.mjs` i `src/lib/zdjecia.ts`, typy `node:`). Uruchamiany z osobnej instalacji `@astrojs/check@0.9.4` i `typescript@5.6.3` w katalogu tymczasowym; `package.json` bez zmian.
- Build po: 749 stron, bez błędów.
- Narzędzie ze zlecenia 24, cała lista 65 stron w 11 oknach (715 renderów przed i po): macierze identyczne. Jedyny wynik to O1 na `/studia/pierwszy-rok/` przy 1366×620 („Budynek Instytutu” w zwiniętym spisie „Na tej stronie” ucięty o 10 px), ten sam przed zmianami. Różnią się tylko wysokości nagłówków Kalendarza, Obron i „Warto wiedzieć” (baner Aktualności), na `/instytut/zaklady/` jest teraz przekierowanie, a na dwóch stronach z ciekawostką wypadła inna ciekawostka.

## Odstępstwa od zlecenia

1. **„Warto wiedzieć”, filtr działu:** filtr pokazuje działy, które mają wpisy, więc Popularyzacji dziś nie ma. Pola `dzial` w schemacie i w formularzu CMS nie zmieniałem. W formularzu znaczy ono „Gdzie pokazać poza stroną główną” (Nauka → `/nauka`, Studia → `/studia`, Instytut → tylko główna i lista), więc dopisanie Popularyzacji to decyzja o tym, gdzie taka pozycja się pokaże (pytanie 3).
2. **Obrony:** lista zostaje w dwóch grupach (nadchodzące i odbyte) zamiast miesięcy jak w Kalendarzu. Tekst wprowadzający stoi nad listą obok panelu; na telefonie nad filtrami.
3. **Kalendarz, Obrony i „Warto wiedzieć” w jednej kolumnie:** Aktualności przy kolumnie listy ≥ 880 px (od ok. 1536 px) układają wiersze w dwie kolumny, te trzy listy zostają w jednej. Wiersz z godziną, miejscem, prelegentem i seminarium w połowie szerokości łamałby się w 3–4 linie (pytanie 1).
4. **Daty w Archiwum Kalendarza** są w kolorze działu jak w nadchodzących, a nie szare jak minione wpisy w Aktualnościach. Inaczej Archiwum straciłoby rozróżnienie działów (pytanie 2).
5. **Stopka:** obrys fokusu linków w stopce 2 px bez odstępu zamiast domyślnego 3 px z odstępem 2 px, bo kropki są ucinane z lewej i szerszy obrys byłby tam przycięty.
6. **Pomiar szerokości:** ciekawostki mierzone podmianą w nagłówku, a nie osobnym wejściem na stronę. Pełne wejście dla każdej ciekawostki to ok. 18 tys. renderów w tygodniu. Zgodność obu sposobów sprawdzona (72 z 72).
7. **Pomiar szerokości:** zrzuty tylko ekranów z problemami (bez całych stron), żeby artefakt był mały.

## Pytania

1. Czy Kalendarz, Obrony i „Warto wiedzieć” mają przy szerokich oknach przejść na dwie kolumny jak Aktualności, czy zostają w jednej?
2. Daty w Archiwum Kalendarza: kolor działu (jak teraz) czy szare jak minione wpisy w Aktualnościach?
3. „Warto wiedzieć”: czy dopisać Popularyzację do pola `dzial` (schemat i formularz Web-Instytut)? Pozycja z Popularyzacją pokazywałaby się wtedy na stronie Popularyzacji (do zrobienia) i w filtrze listy.
4. Kadr przy szerokich oknach: zdjęcie ma najwyżej 980 px, więc przy 1920–2560 px granat zajmuje ok. 50–60% banera. Czy tak zostaje, czy wolisz szersze zdjęcie z inną fotografią (cała postać nie zmieści się w szerszym kadrze tego zdjęcia)?
5. Obrony: tekst wprowadzający (3 akapity) spycha listę pod pierwszy ekran przy 1024–1536 px. Skrócić go albo przenieść pod listę?
6. Pomiar szerokości w GitHub Actions: uruchomić teraz ręcznie na `wyglad/zlecenie-16`, żeby sprawdzić przebieg na Linuksie przed scaleniem z `main`? Kroje (Manrope, Brygada 1918) są częścią strony, ale renderowanie tekstu na Linuksie może się nieznacznie różnić. Nowe K albo X z pierwszego przebiegu trzeba będzie albo poprawić, albo dopisać do wzorca.
