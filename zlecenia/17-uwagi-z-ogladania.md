# Zlecenie 17: uwagi z oglądania npm run dev (ZAMKNIĘTE 6.11.2026, 00:29)

Stan: **zamknięte 6.11, 00:29** — punkty 1–6 do wykonania. Nowe uwagi trafiają do zlecenia 18 (`18-uwagi-z-ogladania-2.md`).

**Gdzie i jak**
- Obecna gałąź `wyglad/zlecenie-16`, osobny commit na każdy punkt. **Bez pushowania**, także w repozytoriach treści.
- **Nie uruchamiaj `skrypty/pobierz_tresci.py`.**
- Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-17.md`.

## 1. Władze: T. Elsner bez opisu komisji — GOTOWE (decyzja 23:55)
- Na stronie Władze przy „Zastępca dyrektora ds. dydaktycznych” (Tomasz Elsner) usuń zdanie „Wchodzi w skład Komisji Prac Dyplomowych, która nadzoruje ofertę tematów i jakość prac dyplomowych.” i jego wersję angielską. Właściciel: „niepotrzebne we władzach”.
- Plik: `src/data/wladze.json`, pola `zakres` i `zakres_en` tej osoby → `""`. Pusty opis się nie wyświetla (`OsobaZ.astro`: `o.zakres &&`), tak jak u pozostałych zastępców.
- Źródło: repozytorium treści z plikiem `src/data/wladze.json` (sprawdź które, najpewniej Web-Instytut). Zmiana w klonie `C:\Users\Szymek\source\tresci\<Repozytorium>` (jeśli go nie ma: `git clone`, potem łatki ze zleceń 14–16 dotyczące tego repozytorium). Commit „Władze: bez opisu komisji przy T. Elsnerze (zlecenie 17)”, bez pushowania.
- Do podglądu ta sama zmiana w nakładce Web-Core. Najpierw kopia oryginału do `.przekazanie\robocze\nakladka-przed-17\`.
- Sprawdź stronę Władze po polsku i po angielsku.

## 2. Panel testowy skali (przycisk z lewej) — GOTOWE (decyzja 6.11, 00:00)
Właściciel ogląda stronę w różnych konfiguracjach (2K przy 125% i 100%, Full HD, laptop 1536 px) i wybierze skalę sam. Podstrony wyglądają na za duże: przy 125% w Windowsie (okno ok. 2048 px) wszystko jest „wielkie”, przy 100% (okno 2560 px) „bardzo dobrze”. Szybki dostęp (14,5 px) i Plan zajęć (13,5 px) mają dobrą skalę. Za duży jest „tryb czytania”: tekst 17 px z interlinią 1,68, h2 32 px z ok. 84 px odstępu, banery, aktualności.

**Przycisk i panel**
- Mały przycisk przy lewej krawędzi ekranu, w połowie wysokości (np. pionowa zakładka „Warianty”). Otwiera panel z grupami przełączników (segmenty jak w prototypie) i przyciskiem „Przywróć obecny”.
- W panelu na górze na żywo: szerokość × wysokość okna i `devicePixelRatio`, np. „2048 × 1003 · 1,25”.
- Wybór zapisany w `localStorage`, działa na wszystkich podstronach. Ustawiany na `<html>` atrybutami (np. `data-t-tekst`, `data-t-nagl`, `data-t-odst`, `data-t-baner`, `data-t-akt`) przez mały skrypt w `<head>` przed narysowaniem strony, bez mignięcia. Odczyt i zapis w try/catch.
- **Tylko w trybie deweloperskim** (`import.meta.env.DEV`). Po `npm run build` panelu ani jego CSS nie ma w `dist`. Sprawdź to.
- Warianty działają tylko na komputerze (≥ 761 px). Na telefonie przycisk ukryty, wygląd bez zmian.
- Nie zmieniaj obecnych wartości: wszystko jako nakładka w osobnym pliku (np. `src/styles/test-warianty.css`) z regułami pod atrybutami. Dla testu wolno nadpisywać selektory. Właściwe wdrożenie wybranego wariantu będzie osobnym zleceniem.
- Szybkiego dostępu i Planu zajęć grupy Tekst, Nagłówki i Odstępy **nie dotyczą**. Aktualności na głównej dotyczy tylko grupa Aktualności.

**Grupy**
1. **Tekst** (treść podstron: `.tresc`, proza z CMS, listy, kontakty): obecny 17 px / 1,68 · 16 px / 1,6 · 15,5 px / 1,55.
2. **Nagłówki** (h1 i tytuły banerów, w tym 76 px działów; h2 32 px i h3 23 px w treści; tytuły osób i kart): 100% · 90% · 80% · płynne.
3. **Odstępy** (przed h2 w treści, między sekcjami i blokami, padding sekcji): obecne · −25% · −40% · płynne.
4. **Banery** (wysokość i padding banerów działów i nagłówków podstron, `min-height`): obecne · niższe (−25%) · niskie (−40%) · płynne.
5. **Aktualności:**
   - obecne;
   - zwarte: na głównej 6 pozycji zamiast 12, pierwsza z miniaturą 120×90, tytułem 18 px i zajawką w 1 linii, pozostałe z miniaturą 56×42; na stronie Aktualności zdjęcie pierwszej 280 px zamiast 360 i ciaśniejsze wiersze;
   - bardzo zwarte: jak zwarte, ale pozostałe pozycje bez miniatur.

„Płynne” oznacza współczynnik zależny od szerokości okna `w`: 0,8 przy w ≤ 1366 px, 1 przy w ≥ 2400 px, liniowo pomiędzy (`clamp()` z `vw`). Zwykły tekst nigdy nie jest płynny: zostaje w px, żeby Ctrl + go powiększał.

**Gotowe zestawy** (pierwszy rząd panelu, ustawiają grupy naraz; potem można zmieniać pojedynczo):
- **Obecny:** wszystko obecne.
- **Ciaśniej:** tekst 16, nagłówki 90%, odstępy −25%, banery niższe, aktualności zwarte.
- **Mniej:** tekst 16, nagłówki 80%, odstępy −40%, banery niskie, aktualności bardzo zwarte.
- **Płynny:** tekst 16, nagłówki, odstępy i banery płynne, aktualności zwarte.

**Odbiór**
- `astro check` i `npm run build` bez nowych błędów; panelu brak w `dist`.
- Zrzuty strony głównej, strony działu, strony zakładu i Aktualności przy 1536 i 2048 px dla zestawów Obecny / Ciaśniej / Mniej → `raport-zrzuty/z17-*`.
- W raporcie: lista selektorów nadpisanych w każdej grupie (posłuży do właściwego wdrożenia) i co nie dało się objąć.

## 3. Pas linków pod banerem działu: klikalna otoczka i podświetlenie — GOTOWE (decyzja 6.11, 00:15)
Właściciel: klikanie jest niewygodne, linki słabo się podświetlają (np. „Władze”, kierunki). Dziś obszar kliknięcia to sam napis, a najechanie zmienia tylko kolor. Wybrany wariant z podglądu https://claude.ai/artifact/CVL2gH3Sr86eJrBY9LEs7u: **B (ciemniejsze tło), otoczka średnia, narożniki zaokrąglone**.

Dotyczy linków w pasie działu: `.z-dz-rzad a` w `src/styles/zal-dzialy.css` (TrescDzialu.astro), we wszystkich działach i po angielsku. Przycisk „Rekrutacja” bez zmian.
- **Otoczka:** `display: inline-block; padding: 4px 10px 5px; margin: -4px -10px -5px; border-radius: 5px`. Napisy zostają dokładnie w tym samym miejscu, większy jest tylko obszar kliknięcia.
- **Odstęp w liście:** `gap: 6px 24px` zamiast `2px 24px`, żeby otoczki zawiniętych wierszy na siebie nie nachodziły.
- **Po najechaniu:**
  - jasny motyw: `color: var(--d-a)` i tło `color-mix(in srgb, var(--d-a) 14%, var(--d-t))`, o ton mocniejsze od pasa;
  - ciemny motyw: tło `color-mix(in oklab, var(--d-j) 5%, #18243b)`, czyli ciemniejsze od pasa (pas ma `--d-j` 11% w `#222e46`).
- **Przejście:** `color` i `background-color` w `var(--t-krotki) var(--rytm)`. Przy `prefers-reduced-motion` bez przejścia.
- **Kliknięcie:** `:active { transform: translateY(1px) }`, bez tego przy ograniczonym ruchu.
- **Fokus z klawiatury:** `:focus-visible` z obrysem 2 px w `--d-a` (offset 2–3 px), widoczny razem z tłem.
- **Telefon:** jeśli pas używa tych samych linków, zostaje otoczka (większy obszar dotyku) i to samo tło przy `:active`. Układ telefonu bez innych zmian.
- Zgłoś w raporcie inne miejsca z tym samym problemem (linki z samą zmianą koloru i obszarem równym napisowi), np. „Zobacz też” lub kafelki. Ich nie zmieniaj, właściciel zdecyduje.
- **Odbiór:** zrzut pasa Instytutu i Studiów w obu motywach, z najechaniem na „Władze” i „Matematyka” → `raport-zrzuty/z17-pas-*`.

## 4. Strona seminarium: baner tylko z nazwą, koordynatorzy w treści — GOTOWE (decyzja 6.11, 00:21)
Właściciel: „Baner tylko z nazwą seminarium, bez cyferek i podpisu, trzymamy się ustalonego formatowania banerów”, „koordynatorzy do ciała strony”. Dziś baner ma do 485 px wysokości. Wynik zaakceptowany na podglądzie: `.przekazanie\prototypy\otoczki.html`, przełącznik „Nowy baner seminarium”, strony Teoria prawdopodobieństwa i Geometria (przy `npm run dev`: `http://localhost:4321/Web-Core/@fs/C:/Users/Szymek/source/Web-Core/.przekazanie/prototypy/otoczki.html`; funkcja `seminarium()` i blok stylów `#o-koord`). **Z tego pliku bierz tylko baner seminarium.** Warianty otoczek z tego podglądu nie obowiązują: otoczki opisuje punkt 3.

Dotyczy każdej strony `/seminaria/<id>` i `/en/seminaria/<id>`, na komputerze i na telefonie (jedna wersja HTML). Lista `/seminaria` i banery innych stron bez zmian.

**Baner**
- Zostają: link wstecz („← Wszystkie seminaria”, na telefonie jak dziś), sygnet i nazwa (`h1`).
- Znikają: hasło (`haslo`), liczby (`LiczbyBanera`), podpis patrona (`.z-podpis-maly`) i blok `.sem-koord`.
- Układ: zwykły niski nagłówek podstrony, czyli `.z-nagl-pod` bez `.z-liczbami`, bez nowych wartości wysokości. Ciekawostki i znaku nadal brak (strona głębiej niż menu działu).
- Podpis: nowa właściwość, np. `bezPodpisu`, przekazywana `Podstrona` → `NaglowekStrony` → `NaglowekZ`, domyślnie wyłączona. Inne strony zachowują podpis.
- Sygnet bez podpisu: `bottom: -5px` zamiast `26px`, żeby stał na środku bloku z linkiem i tytułem. Przy tytule w dwóch liniach zostaje obecna logika `--syg-podnies`; sprawdź na Teorii prawdopodobieństwa.

**Treść**
- Blok koordynatorów na końcu `section.opis`, pod `.prose`, ze wzorcem `.kontakty` (`src/styles/zal-tresc.css`; na telefonie wzorzec sam daje jedną kolumnę). Bez ikon.
- Kolumny, każda z etykietą `.etyk`:
  1. **Koordynator / Koordynatorzy** (EN Coordinator / Coordinators): każda osoba w osobnym `<b>`, z linkiem, gdy ma `strona`. Znak ↗ daje istniejąca klasa `zew`.
  2. **Kontakt** (EN Contact): `mailto:` z pola `kontakt`.
  3. **Zakład / Zakłady** (EN Department / Departments): linki `/instytut/zaklady/<id>`, nazwa w języku strony.
- Kolumny bez danych nie powstają (np. Dydaktyka nie ma pola `kontakt`). Bez żadnych danych nie ma całego bloku (`maKoord`).
- Wartości z podglądu: `margin-top: 18px` nad blokiem (0, gdy opis jest pusty); `b` 19 px, `margin: 2px 0 0`; e-mail i zakład jako `display: block; margin-top: 3px; font-size: 15.5px; line-height: 1.45`. Linki w stylu `.tresc a`.

**Sprzątanie**
- `src/views/Seminarium.astro`: usuń `<Fragment slot="baner">`, `haslo={haslo}`, import `LiczbyBanera` i style `.sem-koord*`, `.sem-meta*`; popraw komentarz na górze. `Ikona` zostaje (formularz zapisu, pliki).
- `src/lib/widoki/seminarium.ts`: usuń `haslo`, `liczby`, import `ETYKIETY` (`wPrzyszlosci` zostaje) i popraw komentarz.
- Stare reguły `.sem-koord`, `.sem-meta` w `global.css`, `telefon.css`, `uklad-zwarta.css`: usuń, jeśli po zmianie `grep` nie znajdzie innych użyć.
- Pole CMS `haslo` / `haslo_en` seminariów **zostaje**, treści bez zmian. W raporcie napisz, że strona go już nie używa; o usunięciu zdecyduje właściciel.

**Odbiór**
- `astro check` bez nowych błędów, `npm run build` przechodzi.
- W `dist` na wszystkich stronach seminariów (PL i EN) w nagłówku nie ma `.z-haslo`, `.z-slot`, `.z-podpis-maly`, `.pt-liczby`.
- Przy 1920 px baner Geometrii ma 256 px, a Teorii prawdopodobieństwa (dwie linie) ok. 300 px. Podaj wartości zmierzone.
- Banery Władz i listy `/seminaria` bez zmian (podpis i liczby zostają tam, gdzie były). Kotwice referatów (`#<slug>`) i zapis na powiadomienia działają jak dotąd.
- Dydaktyka: bez kolumny Kontakt i bez pustego miejsca po niej.
- Zrzuty Geometrii, Teorii prawdopodobieństwa i Dydaktyki przy 1536 i 1920 px oraz na telefonie 390 px, jasny i ciemny motyw, Teoria prawdopodobieństwa także `/en` → `raport-zrzuty/z17-seminarium-*`.

## 5. Popularyzacja: partnerzy bez domen — GOTOWE (decyzja 6.11, 00:25)
- W pasie działu Popularyzacja, w wierszu „Partnerzy”, przy nazwach stoją domeny małym drukiem (np. „fmw.math.uni.wroc.pl”). Usuń je. Zostają same nazwy ze strzałką ↗, jak w prototypie i w pozostałych działach.
- Źródło domen: `src/lib/widoki/popularyzacja.ts`, linia z `podpis: domena(l.adres)`. Usuń dopisywanie podpisu. Jeśli funkcja `domena()` nie jest nigdzie indziej używana, usuń też ją i komentarze. Obsługę `podpis` w `TrescDzialu.astro` i `zal-dzialy.css` możesz zostawić albo usunąć, jeśli nic jej nie używa. Napisz w raporcie, co wybrałeś.
- Sprawdź PL i EN oraz panel hamburgera.
- Przyczyna: sformułowanie „z domeną jako podpisem, jak dziś” w zleceniu 15 było błędem zlecenia, a nie wykonania.

## 6. Zakłady i seminaria w siatce 3×3, boksy na papierze z zaokrągleniem — GOTOWE (decyzja 6.11, 00:28)
Podgląd: https://claude.ai/artifact/Pr1SUcWbh6xzux4DhNPoHa. Wybór właściciela: **wariant F (boks na tle papieru) z narożnikami jak w G (5 px)**.

**Gdzie**
- `/instytut/struktura`: sekcja „Zakłady i pracownia” (`ListaZakladow.astro`, dziś `ul.dwa`, dwie kolumny), 9 pozycji.
- `/seminaria`: seminaria zakładów i niezależne z najbliższym referatem (`ListaSeminariow.astro`, dziś `.wiersze.dwie`).
- Bez zmian: sekcja „najbliższe referaty”, lista nieaktywnych seminariów i spis „Na tej stronie”.
- Po polsku i po angielsku.

**Siatka**
- Trzy równe kolumny (`repeat(3, minmax(0, 1fr))`), odstęp 12 px w obu kierunkach. Pozycje w jednym rzędzie mają równą wysokość.
- Jeśli kolumna treści (np. obok spisu „Na tej stronie” na `/seminaria`) jest węższa niż ok. 880 px, przy tej szerokości dwie kolumny. Telefon (≤ 760 px): jedna kolumna.
- W raporcie podaj, przy jakich szerokościach okna wychodzą 3, 2 i 1 kolumna.

**Boks**
- Tło `var(--surface)` (neutralny papier; ciemny motyw: `--surface` z „Nocnego granatu”), bez ramki, `border-radius: 5px`, `padding: 22px 24px 24px`.
- Po najechaniu: tło `var(--d-t)` działu (zakłady: Instytut, seminaria: Nauka) i nazwa w `var(--d-a)`. Przejście `.15s var(--rytm)`, bez przejścia przy `prefers-reduced-motion`.
- Kliknięcie: `:active { transform: translateY(1px) }`.
- **Cały boks klikalny:** link nazwy rozciągnięty na boks (`::after` z `inset: 0`). Inne linki w środku, jeśli są, nad nim (`position: relative; z-index: 1`).
- Fokus z klawiatury: obrys 2 px w `--d-a` wokół całego boksu (`:focus-within` albo na `::after`), offset 2 px.
- Treść boksu jak dziś: etykieta (Zakład/Pracownia; przy seminarium zakład), nazwa Brygadą 22 px, opis lub hasło i obszary, na dole kierownik/prowadzący (`margin-top: auto`, żeby dolne linie w rzędzie się wyrównały). Przy seminarium najbliższy referat zostaje, jeśli dziś jest pokazywany.

**Odbiór**
- Zrzuty `/instytut/struktura` i `/seminaria` przy 1536 i 2048 px oraz 390 px, w obu motywach, z najechaniem na jeden boks → `raport-zrzuty/z17-siatka-*`.
- `astro check` i `npm run build` bez nowych błędów.
