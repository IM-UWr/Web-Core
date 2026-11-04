# Ciemny motyw „Założycieli”: trzy warianty

Prototyp: `proto/zalozyciele.src.html` → `proto/zalozyciele.html` (moja kopia w `/home/claude/ciemny/`).
CSS do wklejenia: `ciemny-propozycja.css` (274 wiersze, ok. 21 KB). W prototypie jest już wklejony między znacznikami `/* >>> ciemny-propozycja */ … /* <<< ciemny-propozycja */`, a w panelu jest nowa grupa **Ciemny**: obecny / A nocny granat / B ciepły grafit / C łupek.
Zrzuty: `podglad/ciemny-<obecny|A|B|C>-<widok>.png`.

**Polecam wariant A „Nocny granat”** (uzasadnienie w punkcie 4).

---

## 1. Co było nie tak w obecnym ciemnym

| problem | liczby | skutek |
|---|---|---|
| Tło `#0a1020` (OKLCH L 0,18) jest **ciemniejsze od granatu** banerów `#0d1830` (L 0,21) | granat / tło 1,07:1 | Baner nie odcina się od treści: lewa, granatowa część banera zlewa się z tłem. Stopka i dół okładki są *jaśniejsze* od treści (odwrócona hierarchia). Całość wygląda na czarną. |
| Tekst prawie biały na prawie czarnym | tekst 13,4:1, nagłówki 16,6:1 | Ostro, „świeci” (halacja), szczególnie w długim tekście „O studiach”. |
| Linie `#243049` | 1,44:1 na tle, 1,32:1 na powierzchni | Linie podziału prawie niewidoczne. **Ramki przycisków i pól** (Plan zajęć, „Przyciski”, menu B) **poniżej wymaganego 3:1**. |
| Kolory działów jako tekst: czyste jasne `--d-j` (`#f2a33a`, `#f07d5e`…) | kontrast w porządku (7–9:1) | Neon na czerni, za ostre przy dużych liczbach „W skrócie”. |
| `--d-t` = głęboki kolor 55% + `#0a1020` | Studia `#381819`, Instytut `#372716` | Brudny brąz / bordo: wybrana karta menu D, mapa, inicjały, miniatury zastępcze. |
| Zdjęcia w dwóch kolorach: światła w pełnym `--d-j` | — | Najjaśniejsza plama na stronie: ekran w sali na banerze Studiów świeci łososiowym prostokątem, Władze świecą ochrą, Plan zajęć jaskrawą cegłą. |
| Panel hamburgera: sztywne `rgb(9 16 34 / .96)` | panel / tło 1,0:1 | Panel ma kolor tła, oddziela go tylko cień. Ramka pola „Szukaj” (biel 30%) ma 2,66:1, poniżej 3:1. |
| Grube kreski 2 px (Szybki dostęp, „W skrócie”, Plan zajęć, menu B/C, nawigacja podstrony) w `--m-ink` | 16,6:1 | Na ciemnym prawie biała kreska jest najmocniejszym elementem strony. |
| „Przyciski”, stan dziś: `--pk-stary-ink: #0a1020` wpisane na sztywno | — | Wiązało tekst pigułki ze starym tłem. |
| Telefon: ramka `#05070c` | — | Na ciemnym tle prototypu ramka telefonu znika. |

## 2. Jak to jest zbudowane

- **Tylko zmienne tam, gdzie się da.** Każdy wariant ustawia tokeny `--m-*`, prototypu `--p-*` i kilka pokręteł `--c-*`. Reguły wspólne są pisane raz i korzystają z tokenów.
- **Nowe tokeny** (dotąd jedna `--m-line` służyła i do podziałów, i do ramek przycisków):
  - `--m-line-ui`: ramki przycisków i pól, ≥ 3:1;
  - `--m-rule`: grube kreski 2 px zamiast `--m-ink`;
  - `--m-panel`: panel menu.
- **Kolory działu w ciemnym** liczone z `--d-j`, więc działają też dla palety Stonowanej (JS wpisuje paletę inline na `:root`, więc samej palety z CSS nadpisać się nie da):
  - `--d-a: color-mix(in oklab, var(--d-j) var(--c-a), var(--m-ink))`: jasny kolor działu z domieszką 20–22% koloru nagłówków; pastel zamiast neonu;
  - `--d-t: color-mix(in oklab, var(--d-j) var(--c-t), var(--c-t-baza))`: 11–12% koloru działu w powierzchni; lekko podbarwiona powierzchnia zamiast brązu. Wybrana karta menu D dostaje dodatkowo kreskę 2 px w `--d-a`, żeby kolor działu nie zginął.
- **Zdjęcia w dwóch kolorach**: światła w `color-mix(in oklab, var(--d-j) 52–55%, var(--granat))`. Cienie zostają granatowe, więc nie ma szwu z lewą, granatową częścią banera. Nagłówek podstrony ze zdjęciem bierze głęboki kolor z 28% granatu (`--c-g`).
- **Zwykłe zdjęcia** (portrety, miniatury, sukcesy, zdjęcie okładki): `brightness(.86–.92) saturate(.92–.94)`.
- **Dwie formy**, jak w zleceniu: `:root[data-theme="dark"][data-ciemny="A"]` oraz `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"])[data-ciemny="A"] }`. Reguły komponentów mają prefiks w `:where(…)`, więc ich waga jest taka jak reguły bazowej, wygrywa kolejność, a `:hover` i stany wybrane działają dalej. Reguła `[data-dzial]` ma wagę 0,3,0, taką jak obecna reguła ciemna, więc pasek na banerze dalej bierze `--d-j`.
- Plik CSS powstaje z `narzedzia/generuj-css.py`, a tokeny z `narzedzia/warianty.py` (ten sam kod liczy tabelę kontrastów), więc obie formy są identyczne.

## 3. Trzy warianty

### A „Nocny granat” (polecany)
Głęboki granat zamiast czerni (L 0,26, odcień 263°, ten sam co granat strony głównej). Banery, stopka i dół okładki w `--granat` są teraz **o ton ciemniejsze** od treści, tak jak w jasnym motywie, gdzie granat jest najciemniejszy. Powierzchnie są o pół tonu jaśniejsze, panel menu to podniesiony granat.

### B „Ciepły grafit”
Ciepła szarość (odcień 75°, prawie bez nasycenia), w parze z ciepłym jasnym tłem `#fcfaf6`. Tekst w ciepłej bieli. Granat zostaje w banerach, stopce, okładce i panelu menu: nawigacja jest granatowa, treść grafitowa. Kolory działów, zwłaszcza ciepłe (bursztyn, cynober), wypadają tu najnaturalniej.

### C „Łupek”
Przygaszony, mało nasycony granat (L 0,29, nasycenie o połowę mniejsze niż w A). Najspokojniejsze i najbardziej neutralne tło do długiego czytania, nieco jaśniejsze od A. Najbliżej „uniwersalnego” przygaszonego ciemnego trybu.

### Wartości

| token | obecny | A nocny granat | B ciepły grafit | C łupek |
|---|---|---|---|---|
| `--m-bg` | `#0a1020` | `#18243b` · oklch(.26 .047 263) | `#272420` · oklch(.26 .009 75) | `#242b36` · oklch(.29 .023 259) |
| `--m-surface` | `#111a2e` | `#222e46` | `#312e2a` | `#2d3640` |
| `--m-panel` (nowy) | `rgb(9 16 34/.96)` | `#24324f` | `#232f47` (granat) | `#2d3848` |
| `--m-ink` | `#ecf0f7` | `#e4eaf5` | `#efece7` | `#e9edf2` |
| `--m-text` | `#d3d9e6` | `#ced5e3` | `#dbd7d0` | `#d5d9e0` |
| `--m-muted` | `#98a3b8` | `#a5afc1` | `#b4afa6` | `#b0b6be` |
| `--m-line` | `#243049` | `#3a465c` | `#484541` | `#454c57` |
| `--m-line-ui` (nowy) | = `--m-line` | `#727c8f` | `#7e7b78` | `#7c828b` |
| `--m-rule` (nowy) | = `--m-ink` | `#7d8697` | `#888683` | `#878d94` |
| `--p-bg` (pasek prototypu) | `#11141b` | `#0f1a30` | `#1e1a17` | `#19212b` |
| `--c-a` / `--c-t` | — | 78% / 11% | 80% / 12% | 78% / 11% |
| `--c-foto` / `--c-zdj` | — | 55% / .88 | 55% / .88 | 52% / .86 |

Kolory działów (paleta Atramenty; obie wartości zmierzone w Chrome, zgodne co do bajtu z obliczeniem):

| dział | `--d-a` A | `--d-t` A | `--d-a` B | `--d-t` B | `--d-a` C | `--d-t` C |
|---|---|---|---|---|---|---|
| Instytut | `#f0b46e` | `#373b4a` | `#f3b266` | `#463b2f` | `#f2b46d` | `#414243` |
| Nauka | `#76ccc0` | `#273d51` | `#76ccbc` | `#373e38` | `#77cdc0` | `#32444c` |
| Studia | `#f19780` | `#38384b` | `#f3957a` | `#463730` | `#f29780` | `#423e45` |
| Popularyzacja | `#b5a5f8` | `#303857` | `#b6a4f5` | `#3e3940` | `#b6a6f7` | `#394052` |

## 4. Kontrasty (WCAG 2.x, paleta Atramenty)

„Tekst na wypełnionym przycisku” to tekst `--m-bg` na tle `--d-a` (Plan zajęć, menu B, „Przyciski”); ta para ma z definicji ten sam kontrast co `--d-a` na tle. ✗ = poniżej progu.

| para | obecny | A | B | C | próg |
|---|---:|---:|---:|---:|---|
| tekst / tło | 13,39 | 10,52 | 10,77 | 10,06 | ≥ 4,5 |
| tekst / powierzchnia | 12,25 | 9,21 | 9,42 | 8,66 | ≥ 4,5 |
| nagłówki (ink) / tło | 16,58 | 12,84 | 13,11 | 12,12 | ≥ 4,5 |
| przygaszony / tło | 7,46 | 7,02 | 7,08 | 6,98 | ≥ 4,5 |
| przygaszony / powierzchnia | 6,83 | 6,14 | 6,19 | 6,00 | ≥ 4,5 |
| linia / tło (dekoracyjna) | 1,44 | 1,63 | 1,62 | 1,64 | — |
| linia przycisków i pól / tło | 1,44 ✗ | 3,69 | 3,67 | 3,68 | ≥ 3 |
| linia przycisków i pól / powierzchnia | 1,32 ✗ | 3,23 | 3,21 | 3,17 | ≥ 3 |
| ramka pola „Szukaj” w panelu / panel | 2,66 ✗ | 3,89 | 3,95 | 3,78 | ≥ 3 |
| panel menu: `#fff` / panel | 18,94 | 12,77 | 13,38 | 11,86 | ≥ 4,5 |
| panel menu: `#c9d0de` (linki) / panel | 12,23 | 8,25 | 8,64 | 7,66 | ≥ 4,5 |
| Instytut: `--d-a` / tło | 9,09 | 8,46 | 8,36 | 7,82 | ≥ 4,5 |
| Instytut: `--d-a` / powierzchnia | 8,32 | 7,41 | 7,31 | 6,73 | ≥ 4,5 |
| Instytut: `--d-a` / `--d-t` | 6,88 | 6,07 | 5,90 | 5,53 | ≥ 4,5 |
| Instytut: tekst na wypełnionym przycisku | 9,09 | 8,46 | 8,36 | 7,82 | ≥ 4,5 |
| Instytut: przygaszony / `--d-t` | 5,65 | 5,04 | 4,99 | 4,93 | ≥ 4,5 |
| Nauka: `--d-a` / tło | 8,81 | 8,25 | 8,19 | 7,65 | ≥ 4,5 |
| Nauka: `--d-a` / powierzchnia | 8,06 | 7,22 | 7,16 | 6,58 | ≥ 4,5 |
| Nauka: `--d-a` / `--d-t` | 6,56 | 5,96 | 5,83 | 5,46 | ≥ 4,5 |
| Nauka: tekst na wypełnionym przycisku | 8,81 | 8,25 | 8,19 | 7,65 | ≥ 4,5 |
| Nauka: przygaszony / `--d-t` | 5,56 | 5,07 | 5,04 | 4,97 | ≥ 4,5 |
| Studia: `--d-a` / tło | 7,04 | 7,00 | 6,91 | 6,46 | ≥ 4,5 |
| Studia: `--d-a` / powierzchnia | 6,44 | 6,13 | 6,04 | 5,55 | ≥ 4,5 |
| Studia: `--d-a` / `--d-t` | 5,94 | 5,16 | 5,08 | 4,74 | ≥ 4,5 |
| Studia: tekst na wypełnionym przycisku | 7,04 | 7,00 | 6,91 | 6,46 | ≥ 4,5 |
| Studia: przygaszony / `--d-t` | 6,30 | 5,18 | 5,20 | 5,12 | ≥ 4,5 |
| Popularyzacja: `--d-a` / tło | 7,29 | 7,16 | 7,07 | 6,64 | ≥ 4,5 |
| Popularyzacja: `--d-a` / powierzchnia | 6,67 | 6,27 | 6,19 | 5,71 | ≥ 4,5 |
| Popularyzacja: `--d-a` / `--d-t` | 6,25 | 5,30 | 5,16 | 4,82 | ≥ 4,5 |
| Popularyzacja: tekst na wypełnionym przycisku | 7,29 | 7,16 | 7,07 | 6,64 | ≥ 4,5 |
| Popularyzacja: przygaszony / `--d-t` | 6,39 | 5,20 | 5,16 | 5,07 | ≥ 4,5 |

Paleta Stonowana: wszystkie pary też przechodzą. Najmniejsze wartości: A 5,07, B 4,99, C 4,86.
Kontrast celowo **spadł** w tekście (z 13–17:1 do 10–13:1): to wciąż daleko powyżej AAA (7:1), a znika efekt świecenia.

## 5. Który polecam: A „Nocny granat”

- **Tożsamość:** cała strona jest w rodzinie granatu strony głównej. Okładka, banery, stopka i treść to jedna skala granatów, gdzie granat marki jest najciemniejszy, tak jak w jasnym motywie. W B treść jest grafitowa, a nawigacja granatowa (dwa światy). W C granat jest tak przygaszony, że strona przestaje być „nasza”.
- **Hierarchia:** baner jest o ton ciemniejszy od treści, powierzchnie (karty menu D, „W skrócie”, karta dyrektora) o pół tonu jaśniejsze, a panel menu jeszcze jaśniejszy. Wszystko jest czytelne bez linii.
- **Kontrast:** najlepszy zapas w kolorach działów na `--d-t` (najsłabiej 5,04). C ma najmniejszy zapas (Studia `--d-a` / `--d-t` 4,74).
- **Wybrana karta menu D** w A wygląda najlepiej: lekko podbarwiony granat (Nauka petrol, Popularyzacja indygo). W B ten sam mechanizm daje kawowe brązy, w C szarości.
- Jeśli ciepłe tło `#fcfaf6` zostaje w jasnym motywie i właściciel chce, żeby ciemny był „tym samym papierem nocą”, naturalną parą jest **B**. Jeśli A wyda się za niebieski, zapasowo **C**.

## 6. Sztywne kolory: co nadpisane, co świadomie zostawione

**Nadpisane w ciemnym (każde z komentarzem w CSS):**
1. `.ok-menu` (panel hamburgera, na okładce i przy pasku): tło `rgb(9 16 34 / .96)` → `--m-panel` 97%; cień `rgb(0 0 0 / .3)` → `rgb(4 8 18 / .38)`; linie sekcji `rgb(255 255 255 / .12)` → `.14`.
2. `.menu-szukaj`: ramka `rgb(255 255 255 / .3)` → `.45` (3,8–3,95:1), tekst `.75` → `.8`.
3. `.pk` („Przyciski”, stan dziś): `--pk-stary: #c9d0de` / `--pk-stary-ink: #0a1020` → `--m-text` / `--m-bg`.
4. `.in-foto`: tło `var(--d-j)` (pełne światła zdjęcia dwubarwnego) → `--d-j` z granatem.
5. `.pd-b.pd-foto` (nagłówek podstrony ze zdjęciem): tło, `::before` i `::after` w pełnym `--d-g` → `--c-g` (`--d-g` 72% + granat). Gradienty są te same co w bazie, zmienia się tylko kolor.
6. `.t-przejscie`, `.d-przejscie`: gradient przez stare `--d-t` (brązowy pas) → z `--d-g` prosto w `--m-bg` (interpolacja oklab).
7. `.tel`: ramka `#05070c` zostaje (to obudowa urządzenia), dochodzi obwódka 1 px w `--p-line`.
8. Zdjęcia `.ok-okladka > img`, `.in-suk img`, `.ok-w .min img`, `.os .fot`: filtr przygaszający.
9. Tokeny zamiast tokenów: grube kreski `--m-ink` → `--m-rule` (`.skrot`, `.ok-skr`, `.ok-h`, `.ok-studia`, `.pl-narz`, `.pd-nav > a`, `.pd-stopka`, menu „obecne”, B, C); ramki `--m-line` → `--m-line-ui` (`.pk-seg`, `.pk-btn`, `.pk-pole`, `.pk-s-chips button`, `.pk-s-btn`, `.pk-s-pole`, `.pl-sem`, `.pl-dni`, `#pl-szukaj`, menu B).
10. Nowe tła tylko w ciemnym: `.skrot` („W skrócie”) dostaje `--m-surface` i wcięcie 20 px; niewybrane karty menu D dostają `--m-surface`, a wybrana kreskę `inset 0 2px 0 var(--d-a)`.

**Świadomie zostawione:**
- Okładka: ciemne pole po skosie (JS, `rgb(9 16 34)`), cień u góry `rgb(9 16 34 / .5)`, przyciski w rogu `rgb(9 16 34 / .42)`. Okładka jest zawsze ciemna i taka sama w obu motywach; w ciemnym przygaszone jest tylko zdjęcie.
- Biały tekst i `--na-ciemnym-2` na granacie (banery, panel), cienie tekstu `rgb(13 24 48 / …)`, nagłówek telefonu `rgb(10 18 38 / .9)`: na granacie są poprawne.
- Kropki dnia `.kd` (`#0e9cbc`, `#e0841b`): mają podpis tekstowy.
- `.mega` (podmenu w pasku, wyłączone w JS) i zrzut obecnej strony `.in-obecna` (obraz referencyjny, nieprzygaszany).

## 7. Sprawdzone

- **Izolacja (porównanie piksel w piksel sceny, `narzedzia/test-form.js`):**
  - jasny motyw z `data-ciemny="A|B|C"` = jasny bez atrybutu;
  - `data-theme="light"` przy systemowym ciemnym + wariant = bez wariantu;
  - jawny `data-theme="dark"` + A = systemowy ciemny + A;
  - ciemny bez `data-ciemny` = ciemny z usuniętym blokiem.

  Wszystkie 8 testów: OK.
- **Kolory w Chrome** (po `color-mix`, `narzedzia/zmierz.js`) zgadzają się z obliczeniem w `warianty.py` dla obu palet.
- **Brak błędów JS.** Zrzuty każdego wariantu obejrzane:
  - okładka: pierwszy ekran, najechanie, drugi ekran, menu;
  - Studia i Nauka z menu A i D (Studia też B);
  - Plan zajęć ze spisem, Władze;
  - Przyciski;
  - otwarty hamburger;
  - Telefon.

## 8. Uwagi poza zakresem
- W **jasnym** motywie ramki przycisków i pól też mają za mały kontrast (`--m-line` `#dfe2e8` na białym ok. 1,3:1, na ciepłym podobnie). Ten sam token `--m-line-ui` rozwiązałby to w jasnym.
- Liczba przy wybranej zakładce menu B (`sup`, krycie .7) na wypełnionym przycisku ma niższy kontrast niż reszta przycisku (w obu motywach).
- Szkice-duchy na okładce (`rgb(255 255 255 / .2)`) są celowo słabe do najechania. W ciemnym ich nie ruszałem, bo okładka jest wspólna dla obu motywów.

## Pliki
- `ciemny-propozycja.css`: blok do wklejenia.
- `proto/zalozyciele.src.html`, `proto/zalozyciele.html`: prototyp z blokiem i przełącznikiem „Ciemny”.
- `podglad/ciemny-<obecny|A|B|C>-*.png`: zrzuty.
- `narzedzia/`:
  - `warianty.py`: tokeny i kontrasty (`python3 warianty.py [stonowana]`);
  - `generuj-css.py`: CSS;
  - `wklej.py`: wklejenie do prototypu;
  - `zrzuty-ciemne.js <wariant>`: zrzuty;
  - `test-form.js`, `zmierz.js`: testy;
  - `kolory.py`, `porownaj.py`, `proba.js`: pomocnicze.
