# Raport: zlecenie 17 — uwagi z oglądania (6.11.2026)

Gałąź: `wyglad/zlecenie-16`, osobny commit na każdy punkt, bez pushu.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Władze: T. Elsner bez opisu komisji | klon `tresci\Web-Instytut`: `7c43bdb`; nakładka Web-Core jest poza gitem |
| 2 | Panel testowy skali | `3c3aa7ff` |
| 3 | Pas linków działu: otoczka i podświetlenie | `894017f8` |
| 4 | Strona seminarium: baner z samą nazwą, koordynatorzy w treści | `82d55d7b` |
| 5 | Popularyzacja: partnerzy bez domen | `f0ba658c` |
| 6 | Zakłady i seminaria w siatce boksów | `f20a2b1e` |
| — | Naprawa wąskich okien po punktach 3 i 4 | `79621f12` |

**Do Twojej decyzji**

1. **Skala:** uruchom `npm run dev`, kliknij zakładkę „Warianty” przy lewej krawędzi i wybierz zestaw. Właściwe wdrożenie to osobne zlecenie; listę selektorów ma punkt 2.
2. **Inne linki z tym samym problemem co pas działu:** lista w punkcie 3. Niczego tam nie zmieniałem.
3. **Pole CMS `haslo` seminariów:** strona seminarium już go nie używa, ale **lista `/seminaria` używa go teraz w boksie** (punkt 6, jak w podglądzie). Pola nie trzeba więc usuwać.
4. **Dwie rzeczy dodałem ponad zlecenie**, obie przy wąskich oknach (punkty 4 i 6). Obie cofa się jedną regułą.
5. **Push czeka na Twoje słowo:** Web-Core i klon Web-Instytut (`7c43bdb` jest kolejnym commitem bez pushu, klon ma ich teraz 2 przed `origin/main`).

**Stan sprawdzenia**

- `astro build` przechodzi, `pagefind` na zbudowanej stronie też. `dist` nie jest nadpisywany: buduję do katalogu tymczasowego, żeby nie ruszać Twoich serwerów, więc `npm run build` wykonałem jako te same dwa kroki osobno.
- `astro check`: 6 błędów, **żaden nowy** (3 `process` w `astro.config.mjs`, 3 w `src/lib/zdjecia.ts`).
- `skrypty/sprawdz_tresci.py`: „OK — sprawdzono 555 plików”. `skrypty/pobierz_tresci.py` nie był uruchamiany. `package.json` bez zmian, nowych pól CMS nie ma.
- Regresja po wszystkich punktach, w Edge na zbudowanej stronie: 15 stron PL i te same `/en` przy 1536, 1024, 900, 800, 761 i 390 px, a także przy granicach 979 i 980 px. Wynik: HTTP 200, bez błędów JavaScriptu, bez poziomego przewijania, nic nie wystaje z boksów ani kolumn koordynatorów.
- Polskie strony: względem stanu sprzed punktu 3 zmieniło się dokładnie 12: `/instytut/struktura`, `/seminaria`, `/popularyzacja` i 9 stron seminariów. Punkt 3 zmienia tylko CSS.
- **Czego nie sprawdzałem:** Firefoksa, Safari, prawdziwych telefonów, czytnika ekranu, wyszukiwarki po przeniesieniu koordynatorów do treści. Regresji panelu na wszystkich 20 stronach nie puściłem przy 2048 px, tylko przy 1536 px (zrzuty przy 2048 px są, bez uwag). Formularza zapisu nie klikałem: w lokalnych danych adres automatu jest pusty, więc strona pokazuje „Zapisy na listę ruszą wkrótce”. Kodu formularza nie zmieniałem.

**Moja pomyłka w trakcie:** przy uruchamianiu podglądu panelu raz wystartował Twój wpis `web-core-dev` z `--force` na porcie 4322, na którym miałem nie pracować. Zatrzymałem go od razu. `--force` czyści pamięć podręczną Vite, więc Twój serwer mógł chwilę przebudowywać zależności. Plików to nie zmieniło.

## 1. Władze

Pola `zakres` i `zakres_en` T. Elsnera są puste, w klonie Web-Instytut i w nakładce. Kopia oryginału: `.przekazanie\robocze\nakladka-przed-17\src\data\wladze.json`. Plik nakładki ma dwa wiersze, których klon nie ma (`haslo`, `haslo_en`: „Dyrekcja i sekretariat”), więc zmieniłem oba pliki osobno, bez kopiowania.

Sprawdzone `/instytut/wladze/` i `/en/instytut/wladze/` przy 390, 800, 1280 i 1920 px. Na polskiej stronie jedyna różnica tekstu to to zdanie, kontakt T. Elsnera został.

## 2. Panel testowy skali

**Jak używać:** `npm run dev`, zakładka „Warianty” przy lewej krawędzi. Po zmianie `astro.config.mjs` serwer restartuje się sam; jeśli panelu nie widać, uruchom go ponownie. Czarny pasek na zrzutach to pasek narzędzi Astro, też tylko w trybie deweloperskim. Teksty panelu są tylko po polsku.

Pliki: `src/plugins/panel-wariantow.mjs` (włącza się tylko przy `astro dev`), `src/dev/panel-wariantow.ts`, `src/styles/test-warianty.css`.

**Wyniki**

- Budowa przed i po: 786 plików html, css, js i xml identycznych, 0 trafień panelu.
- Odczyt w panelu na żywo, np. „1536 × 730 · 1”. Wybór zapisuje się między stronami, a atrybut jest już ustawiony, gdy powstaje `<body>`, więc nie ma mignięcia. Zepsuty zapis i zablokowany `localStorage` nie psują panelu.
- Telefon 390 px: przycisk ukryty, wysokość strony 4747 px z wariantem i bez.
- Regresja 20 stron przy 1536 px na 7 wariantach: żaden nie wydłuża strony, nic nie jest ucięte.
- Plan zajęć: Tekst, Nagłówki i Odstępy bez zmian (11892 px); Banery skracają go o 51 px.

| Strona (1536 i 2048 px) | Obecny | Ciaśniej | Mniej |
| --- | --- | --- | --- |
| Dział Studia, cała strona | 2247 | 1995 | 1929 |
| Dział Studia, baner | 366 | 310 | 286 |
| Zakład, cała strona | 3857 | 3556 | 3368 |
| Zakład, baner | 334 | 293 | 271 |
| Aktualności, cała strona | 28304 | 24930 | 23448 |
| Aktualności, baner | 334 | 293 | 271 |

Główna: 1588 px (2048 px: 2007 px) we wszystkich zestawach, zmienia się tylko kolumna Aktualności.

Zrzuty Obecny / Ciaśniej / Mniej: `raport-zrzuty/z17-{glowna,dzial,zaklad,aktualnosci}-{1536,2048}.jpg`, panel: `z17-panel.jpg`.

**Selektory nadpisane w każdej grupie** (w nawiasie wartość obecna)

- **Tekst:** `.tresc`; `.z-dz-tresc p`; `.z-pd-tresc:where(:not(.tresc, .z-pl)) :is(p, li)`; `.z-pd-tresc:where(:not(.tresc, .z-pl)) .wst`; `:is(.z-dz-kont, .z-kont) dd`.
- **Nagłówki:**
  - Banery: `.z-baner-dzialu h1` (76); `.z-baner-dzialu:not(:has(.z-slot)) h1` (`clamp(56px, 4vw, 76px)`, przy „płynne” bez zmian); `.z-nagl-pod h1` (58, bez Planu).
  - Treść: `.tresc h2`, `body .tresc .prose h2`, `.z-pd-tresc h2` (32); `.tresc h3`, `body .tresc .prose h3` (23); `.tresc ul.dwa b`, `.tresc .faq summary`, `.tresc .kontakty b` (20); `.tresc .boks h3` (22, dopisane w punkcie 6); `.tresc ul.linki a`, `.tresc ol.etapy .t`, `body .tresc .prose ol.etapy .t` (21).
  - Działy: `.z-dz-tresc h2`, `.z-dz-sek h2`, `.z-dz-skrot dt` (34); `.z-dz-suk h3` (23); `.z-dz-kart h3`, `.z-dz-wiersz h3`, `.z-dz-rzad a` (21); `.z-dz-kont .nazwa`, `.z-dz-rekr`, `.z-nast-link` (22, bez Planu).
  - Osoby: `.z-os .imie` (21); `.z-drzewo .z-dyr .imie` (30); `.z-sek-osoby .z-os .imie`, `.z-pd-tresc .z-zob a` (19).
  - Przez `#tresc`: `.wa h3`, `.wiersz h3`, `.wiersz h4`, `.ref h3`, `.zk-daty .t`, `.ww-t`, `.ww-tr .t` (21); `.wa.wyr h3` (30); `.zk-sem .t`, `.akt-pn a` (20); `.ak-mies h2`, `.kal-mies h2` (23).
- **Odstępy:** `.z-pd-tresc > section`, `.z-pd-tresc.tresc > section` (bez ostatniej; padding-bottom 44, margin-bottom 40); `body .tresc .prose h2` bez pierwszego (margin-top 44, padding-top 40); `.tresc h2`, `body .tresc .prose h2`, `.z-pd-tresc h2` (margin-bottom 16); `.tresc h3`, `body .tresc .prose h3` (margin-top 30); `.tresc :is(h2 + h3, h2 + p + h3)` i wersja prose (10); `.z-pd` (40/30, bez Planu); `.z-nast` (32/40/18, bez Planu); `.z-dz-tresc` (30/50); `.z-dz-pas + .z-dz-tresc` (34); `.z-dz-sek` (34/40); `.z-dz-opis` (22); `.z-dz-kont` (22).
- **Banery:** `.z-baner-dzialu` (`height: auto; min-height` 300 + góra); `.z-baner-dzialu .z-tytul` (padding 50 + góra / 16); `.z-haslo`; `.z-slot .pt-liczby`; `.z-szkic-ramka`; `.z-podpis-ramka`; `.z-patron`; `.z-nagl-pod` (190 + góra, 52 + góra, 34); `.z-nagl-pod.z-liczbami` (268 + góra, 30 + góra); `.z-znak`; `.z-znak-opis`; wersje `.z-liczbami`.
- **Aktualności:** `.z-kolumna[data-key="akt"] .z-w:nth-child(n+7)` (ukryte); `.z-w.wyr` (50 px, tekst, 120 px); `.z-w.wyr .min` (120×90); `.z-w.wyr .t` (18); `.z-w.wyr .zaj` (1 linia); `.z-w:not(.wyr) .min` (56×42); `#tresc .wa` (padding-block 11); `#tresc .wa.wyr` (16/18); `#tresc .wa.wyr .wa-fot` (280); `#tresc .ak-mies h2` (margin-top 18). „Bardzo zwarte”: `.z-w:not(.wyr) .min` i `#tresc .wa:not(.wyr) .wa-fot` ukryte.

**Czego nie dało się objąć albo nie objąłem**

- Cyfry dat 34 px (`.wa-data`, `.wiersz .dz`, `.zk-daty .dz`, `.ww-data`, `.ref .dz`, `.termin .dz`, `.akt-wyd-data`, `.z-dz-wiersz .dz`) i liczby w banerze `.pt-liczby .n` 30 px: to nie tytuły.
- Mniejsze tytuły: `.rok` (Publikacje 28), `.prace .t`, `.lata a`, `.inne .t` (Grant), `.kd-dzis .kd-tytul`, `.zd-dzien .zd-plan`, `.kd-mies caption`, `.ww-rok`, `.ww-bez`, `.z-patron b`.
- Odstępy: akapity `.tresc p`, wiersze list (`.wiersz`, `.zk-daty li`, `.z-dz-wiersz`), łącznik schematu Władz `.z-drzewo .z-dyr` 44 px.
- Baner działu nie może być niższy niż jego treść: Studia osiągają 310 px (cel 291) i 286 px (cel 246).
- Zdjęcie Studiów jest przypięte do szkicu, więc mniejszy szkic nie przelicza kadru. Atrybuty `sizes` zdjęć zostają bez zmian.
- Długie tytuły `.z-nagl-pod h1` dopasowuje skrypt stylem w linii, więc tam wygrywa skrypt.

## 3. Pas linków działu

W `src/styles/zal-dzialy.css` są wartości ze zlecenia: otoczka, `gap: 6px 24px`, tło po najechaniu, przejście, `:active`, `:focus-visible` (obrys 2 px, offset 2 px; tło też zostaje przy fokusie). Przycisk „Rekrutacja” bez zmian.

**Pomiar:** 8 stron działów (PL i EN) przy 2048, 1536, 1024 i 390 px.

- Napisy zostają w tym samym miejscu poziomo (różnica 0 px). W pionie rusza się tylko każdy zawinięty wiersz, o 4 px na wiersz, od nowego odstępu.
- Pas rośnie tylko tam, gdzie wiersze się zawijają: Studia 190,4 → 194,4 px, EN Studia 221 → 229 px.
- Obszar kliknięcia: 37 px wysokości na komputerze, 35 px na telefonie.
- Telefon: te same otoczki, tło przy `:active`, układ bez zmian (przy 390 px wysokość pasa identyczna).

| Motyw | Pas | Najechanie |
| --- | --- | --- |
| Jasny, Instytut | rgb(250, 239, 225) | rgb(233, 217, 194), tekst rgb(132, 85, 2) |
| Jasny, Studia | rgb(227, 244, 253) | rgb(195, 225, 238), tekst rgb(0, 105, 143) |
| Ciemny, Instytut | jasność oklab 0,353 | 0,287, czyli ciemniej |
| Ciemny, Studia | jasność oklab 0,353 | 0,287, czyli ciemniej |

Przy ograniczonym ruchu nie ma przejścia ani przesunięcia przy kliknięciu.

**Na telefonie** odstęp w liście został 2 px / 18 px („układ bez innych zmian”), więc otoczki zawiniętych wierszy nachodzą na siebie o 7 px, a sąsiednie w wierszu o 2 px. Widać to tylko przy dotknięciu.

**Inne miejsca z tym samym problemem** (nie zmieniane, decyzja należy do Ciebie):

| Miejsce | Selektor | Obszar kliknięcia | Najechanie |
| --- | --- | --- | --- |
| Osoby (Władze, zakłady) | `.z-os .imie a` | napis | sam kolor |
| Granty, kierownik | `.z-gr .gr-w .imie a` | napis | sam kolor |
| Plan zajęć | `.z-pl .pl-p h3 a`, `.z-pl .pl-w .uw a` | napis | sam kolor |
| Aktualność, poprzednia i następna | `.akt-pn a` | napis | sam kolor |
| Kierunek, specjalności | `.kier-spec li > b a` | napis | sam kolor |
| Publikacje, lata | `.rok a`, `.lata a` | napis | sam kolor |
| Zakład, daty | `.zk-daty .t a` | napis | sam kolor |
| Kafelki działów | `.z-dz-suk article h3 a`, `.z-dz-kart article h3 a` | tytuł; kolor rusza się przy najechaniu na cały kafelek | sam kolor tytułu |
| Linki przy nagłówkach sekcji działu | `.z-dz-linki a` | napis | podkreślenie |
| Kierunki w działach | `.z-kier a` | blok | sam kolor nazwy |
| „Zobacz też”, listy linków | `.z-pd-tresc .z-zob a`, `.tresc ul.linki a` | cały wiersz, więc klika się dobrze | sam kolor |

Zrzuty z najechaniem na „Władze” i „Matematyka”: `raport-zrzuty/z17-pas-{instytut,studia}-{light,dark}.jpg`.

## 4. Strona seminarium

| Baner przy 1920 i 1536 px | Przed | Po |
| --- | --- | --- |
| Geometria | 425,8 | **256** |
| Teoria prawdopodobieństwa (dwie linie) | 484,9 | **301,1** |
| Dydaktyka (dwie linie) | 484,9 | 301,1 |
| `/en` Probability Theory (jedna linia) | 425,8 | 256 |
| Władze, `/seminaria`, `/en/seminaria`, Struktura | 256, 334, 334, 334 | bez zmian, z podpisem i liczbami tam, gdzie były |

- `dist`: 18 stron seminariów (PL i EN), w nagłówku nie ma `.z-haslo`, `.z-slot`, `.z-podpis-maly`, `.pt-liczby`.
- Właściwość `bezPodpisu` idzie przez `Podstrona` → `NaglowekStrony` → `NaglowekZ`, domyślnie wyłączona. Daje klasę `z-bez-podpisu` i `bottom: -5px` dla sygnetu.
- Środek sygnetu stoi 5,5 px poniżej środka bloku z linkiem i tytułem (168,5 wobec 163). To wartość ze zlecenia, zostawiłem ją. Przy dwóch liniach działa `--syg-podnies` (198 wobec 192,6).
- Blok na końcu `section.opis`: Koordynator(zy) / Coordinator(s), Kontakt / Contact, Zakład / Department. Wartości z podglądu zmierzone: 18 px nad blokiem, `b` 19 px, e-mail i zakład 15,5 px. Kolumn bez danych nie ma: Dydaktyka ma Koordynator i Zakład, bez Kontaktu. Trzecie miejsce w siatce po prawej zostaje wolne, jak w podglądzie.
- Każda osoba w osobnym `<b>`, linki poza stronę dostają ↗ z klasy `zew`.
- Gdyby opis był pusty, blok nie ma odstępu nad sobą, a gdy nie ma ani opisu, ani danych, całej sekcji nie ma.
- Kotwice referatów działają (sprawdzone na `#test-2026-11-05-mister-test`, PL i EN, komputer i telefon).
- Usunięte: `LiczbyBanera` z tego widoku, `haslo`, `liczby`, `.sem-koord*`, `.sem-meta*` także z `global.css`, `telefon.css`, `uklad-zwarta.css`. `grep` w `src` nie znajduje ich już nigdzie.

**Dodane ponad zlecenie:** przy oknie 761–979 px koordynatorzy stoją w jednej kolumnie. W trzech kolumnach kolumna ma tam 93–165 px i „Świątkowski ↗” wychodzi poza nią. Reguła jest w `src/views/Seminarium.astro`, media query `(min-width: 761px) and (max-width: 979px)`; wystarczy ją usunąć, żeby cofnąć zmianę. Ten sam wzorzec `.kontakty` na innych podstronach zostawiłem bez zmian.

Zrzuty, jasny i ciemny motyw obok siebie: `raport-zrzuty/z17-seminarium-{geometria,prawdopodobienstwo,dydaktyka,en-prawdopodobienstwo}-{1536,1920,390}.jpg`.

## 5. Popularyzacja

Domeny zniknęły z pasa działu. Usunąłem też funkcję `domena()` i **całą obsługę `podpis`**: typ `LinkPod`, `<small>` w `TrescDzialu.astro`, regułę w `zal-dzialy.css` i komentarze, bo nic innego jej nie używało.

Sprawdzone PL i EN przy 1536 i 390 px, także w otwartym panelu hamburgera (tam domen nie było nigdy). Same nazwy ze strzałką ↗. Pas Popularyzacji przy 1536 px ma teraz 114,2 px.

**Przy okazji:** na `/en/popularyzacja` przy oknie 761 px „Polish Mathematical Society, Wrocław Branch” wychodziło poza ekran i strona przewijała się w poziomie. Wynikało to z `white-space: nowrap`, a przed tym punktem z domeną było jeszcze dłuższe. Usunąłem `nowrap` w pasie. Link zawija się tylko wtedy, gdy sam jest szerszy od wiersza. Pomiar: przy 2048, 1536, 1024 i 390 px na 8 stronach żaden napis się nie przesunął.

## 6. Siatka boksów

| Okno | Kolumny (obie strony tak samo) | Szerokość kolumny treści |
| --- | --- | --- |
| ≥ 1300 px | **3** | 880–948 px |
| 980–1299 px | **2** | 560–879 px |
| 761–979 px | **1** | 341–559 px |
| ≤ 760 px (telefon) | **1** | |

**Dodane ponad zlecenie:** jedna kolumna przy 761–979 px. Zlecenie mówi o dwóch kolumnach poniżej 880 px i jednej na telefonie, ale przy oknie 761 px boks miałby w dwóch kolumnach 164 px szerokości, czyli 116 px na tekst, a „prawdopodobieństwa” ma ok. 215 px. Żeby to cofnąć, usuń jeden wiersz `@container (max-width: 559.98px)` w `src/styles/zal-tresc.css`.

**Wykonanie**

- Wspólny wzorzec w `src/styles/zal-tresc.css`: `.boksy-ramka` (kontener), `ul.boksy`, `.boks`. Wartości ze zlecenia zmierzone: 5 px, `22px 24px 24px`, nazwa Brygadą 22 px, odstęp 12 px, tło `--surface`.
- Najechanie: `--d-t` działu i nazwa w `--d-a`, Instytut i Nauka.
- Kliknięcie w dowolne miejsce boksu przenosi na stronę zakładu; sprawdziłem klik przy dolnej krawędzi. Przesunięcie 1 px przy wciśnięciu, przy ograniczonym ruchu bez przesunięcia i przejścia.
- Fokus z klawiatury: obrys 2 px w `--d-a` wokół całego boksu, na `::after`. Kliknięcie myszą go nie pokazuje. Innych linków w boksach nie ma, więc reguły `z-index` nie dodawałem.
- Dolne linie w rzędzie wyrównane: wszędzie 24 px od dołu boksu.
- Bez zmian: sekcja najbliższych referatów, nieaktywne seminaria, spis „Na tej stronie”.
- `.tresc ul.dwa` zostaje dla innych stron. Panel testowy obejmuje boksy w grupie Nagłówki.

**Treść boksu: co rozstrzygnąłem według podglądu**

- **Zakład:** etykieta Zakład / Pracownia (EN Department / Unit), **nazwa krótka** z pola `nazwa_krotka`, np. „Geometria”. Przy etykiecie „Zakład” pełna nazwa „Zakład Geometrii” powtarzałaby to samo. Dalej opis, obszary i na dole Kierownik i Skład, jak dziś. Hasło pokaże się tylko przy pustym opisie („opis lub hasło”); podgląd ma oba, więc jeśli chcesz oba, to jeden wiersz.
- **Seminarium:** etykieta z pełną nazwą zakładu, jak dziś; nazwa; hasło; najbliższy referat albo „Brak zapowiedzianych referatów”; na dole Prowadzi / Prowadzą (EN Led by). Prowadzących na tej liście wcześniej nie było, są z podglądu, razem ze skrótem „X, Y i 3 inne osoby” (EN „and 3 others”).
- **Data referatu w boksie** ma 28 px i kolumnę 54 px, czyli wzór z telefonu, bo 34 px i kolumna 76 px zjadłyby ponad jedną trzecią boksu.

Dziś żadne seminarium nie ma przyszłego referatu w danych. Boks z referatem sprawdziłem więc na dwóch tymczasowych wpisach w nakładce i na serwerze deweloperskim, po czym je usunąłem. Widać je na `z17-siatka-seminaria-z-referatem-1536.jpg`.

**Pytanie:** `/instytut/struktura` nie ma spisu, więc prawa kolumna strony stoi pusta, a siatka ma 948 px, nie 1240 px. Zostawiłem tak, bo zlecenie mówi o trzech kolumnach; rozciągnięcie na całą szerokość to jedna reguła.

Zrzuty z najechaniem na jeden boks, jasny i ciemny motyw obok siebie: `raport-zrzuty/z17-siatka-{struktura,seminaria}-{1536,2048,390}.jpg`, `z17-siatka-en-{struktura,seminaria}-1536.jpg`.
