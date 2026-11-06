# Zlecenie 23: telefon w poziomie i okładka „na próg” (OTWARTE, 6.11.2026)

Stan: **otwarte** — właściciel może dopisywać kolejne punkty. Wykonuj tylko punkty oznaczone **GOTOWE** i dopiero po zakończeniu zleceń 21 i 22.

**Gdzie i jak** (tak samo jak w zleceniach 17–21)
- Gałąź `wyglad/zlecenie-16`, po commitach zleceń 21 i 22. Osobny commit na każdy punkt. **Bez pushowania**, także w repozytoriach treści.
- **Nie uruchamiaj `skrypty/pobierz_tresci.py`** (po zleceniu 22 tylko z `--lokalnie`, jeśli naprawdę trzeba).
- Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-23.md`, zrzuty `raport-zrzuty/z23-*`.
- Numery linii są ze stanu `e6b6cb2` (6.11, 15:51). Jeśli numer 23 jest zajęty, użyj kolejnego i napisz to w raporcie.

## 1. Telefon w poziomie: zawsze widok telefonu, poprawiony niski ekran — GOTOWE (decyzja 6.11, 16:39)
Właściciel: „Ta strona wygląda do bani na widoku poziomym telefonu, możemy to zablokować?” Odpowiedź: zablokować obrotu strona nie może (Chrome tylko w trybie pełnoekranowym, Safari wcale), a zasłona „obróć telefon” łamie WCAG 2.1, kryterium 1.3.4 „Orientacja” (AA), które uczelnię obowiązuje. Decyzja: naprawić widok poziomy. **Żadnej blokady obrotu ani zasłony.**

**Co dziś jest źle** (emulacja, `e6b6cb2`; zrzuty od rozmowy w claude.ai)
- Granica telefon/komputer to sama szerokość 760 px. Pixel 7 w poziomie (863×360) dostaje widok komputera: na okładce mieści się sam tytuł, bez działów; w banerze Nauki notka o patronie zachodzi na hasło „Poznaj nasze badania na A+”, a podpisy liczb są ucięte („realizowanych projektó…”).
- iPhone 13 w poziomie (750×342) dostaje widok telefonu rozciągnięty na szerokość: okładka ściśnięta pod paskiem, ucięte podpisy liczb w banerze Nauki, pasek zabiera prawie 1/6 ekranu, a tekst biegnie przez ok. 720 px.

**Co się zmienia**
1. **Jedna definicja „telefonu”:** `(max-width: 760px), (max-height: 500px) and (pointer: coarse)`. „Komputer” to jej dopełnienie: `(min-width: 761px) and (min-height: 501px), (min-width: 761px) and (pointer: fine)`. Niski ekran dotykowy dostaje więc widok telefonu także przy szerokości ponad 760 px. Tablety (wysokość ponad 500 px) i komputery z myszą, także w niskim oknie, zostają przy widoku komputera.
   - Dziś w CSS jest 59× `max-width: 760px` i 41× `min-width: 761px` (plus jedno `min-width: 760px`), w TS i skryptach w linii ok. 10 miejsc z `matchMedia` (m.in. `pasek.ts`, `menu.ts`, `drugi-ekran.ts`, `okladka.ts`, `przejazd.ts`, `SpisStrony.astro`, `Okladka.astro`, `DrugiEkran.astro`, `src/scripts/baner/silnik.ts`). Zamień wszystkie.
   - Jedno źródło w kodzie: stałe w nowym `src/lib/media.ts` (TS i skrypty w linii budowane w `.astro` biorą je stamtąd). W CSS ten sam zapis dosłownie, z komentarzem przy pierwszym użyciu w pliku. Bez nowych zależności npm. Jeśli wolisz `@custom-media` przez wtyczkę PostCSS, opisz to w raporcie i nie dodawaj jej bez potrzeby.
   - Pozostałe progi (`max-width: 720px`, `min-width: 780px`, `min-width: 820px`) przejrzyj: jeśli są częścią widoku komputera, nie mogą działać w widoku telefonu na szerokim, niskim ekranie.
   - Obrót telefonu bez przeładowania przełącza widok poprawnie: nasłuchy `change` na nowym zapytaniu, menu zamyka się jak dziś przy przejściu na komputer (`menu.ts:89`).
2. **Niski ekran w widoku telefonu** (`(orientation: landscape) and (max-height: 500px)` wewnątrz telefonu):
   - **Pasek u góry niższy:** ok. 52 px zamiast 61 (`--hdr-h`), bez drugiej linii nazwy (`.brand-sub`). Wszystko, co liczy się od `--hdr-h`, ma się zgadzać.
   - **Treść czytelna:** tekst ciągły i listy w kolumnie najwyżej ok. 680 px, wyśrodkowanej. Banery, zdjęcia i paski zostają na całą szerokość.
   - **Banery działów i podstron:** wysokość z treści, nic nie jest ucięte. Liczby w trzech kolumnach, a podpisy się zawijają. Szkic patrona może być mniejszy, ale nie zasłania tekstu.
   - **Okładka strony głównej:** dwie kolumny na zdjęciu: tytuł („Instytut / Matematyczny”) z lewej, cztery działy z prawej (ciaśniejsze wiersze, bez opisów, jeśli trzeba), strzałka „Szybki dostęp” na dole na środku. Jeśli mimo to okładka nie mieści się w oknie pod paskiem, ma wysokość z treści i strona przewija się zwyczajnie.
3. Telefon w pionie i komputer **bez zmian**.

**Odbiór**
- Emulacja w poziomie: Pixel 7 (863×360 i 915×412), iPhone 13 (750×342 i 844×390), iPhone SE (667×375), Galaxy S8+ (740×360). Strony: główna (okładka i Szybki dostęp), cztery działy, `/studia/matematyka/`, `/instytut/wladze/`, `/nauka/granty/`, jedno seminarium, `/aktualnosci/`, `/kalendarz/`, `/pracownicy/`, PL i EN, jasny i ciemny motyw. Wszędzie widok telefonu, bez przewijania w poziomie, żaden tekst nie jest ucięty ani zasłonięty, tekst ciągły nie szerszy niż ok. 680 px.
- Telefon w pionie (390×844, 412×915, 360×740) i komputer (1280×720, 1366×640, 1920×1080 oraz niskie okno 1280×450 z myszą): **piksel w piksel jak przed zmianą** na tych samych stronach.
- Tablet: iPad w poziomie 1024×768 i 1180×820, w pionie 820×1180, iPad Pro 1366×1024 — bez zmian.
- Obrót bez przeładowania (pion → poziom → pion) na głównej, dziale i podstronie: właściwy widok, menu zamknięte, pasek w dobrym kolorze, brak zawieszonych klas.
- `grep` w `src`: zero wystąpień samego `(max-width: 760px)` lub `(min-width: 761px)` poza nowymi definicjami.
- `astro check` bez nowych błędów, `npm run build` przechodzi.
- Zrzuty przed i po: `raport-zrzuty/z23-poziomo-*` (Pixel 7 i iPhone 13 w poziomie, główna, Nauka, Matematyka).

## 2. Telefon, strona główna: z okładki na Szybki dostęp „na próg” — CZEKA (właściciel najpierw próbuje prototypu na telefonie)
Właściciel (6.11, 16:20): „na głównym ekranie trzeba przeciągnąć scrolla mocno, może jakaś dyskretne animowanie strzałki do Szybkiego dostępu, żeby przejść na Szybki dostęp, nie leciutki scroll od razu przerzuca. A jak już jesteśmy na Szybkim dostępie, to tam normalne zasady scrolla, żadnych specjalnych, powrót na stronę główną tylko naciśnięciem przycisku na navbarze.” Decyzje 16:34: „Wszystko zgoda” (próg 1/3 ekranu, „wstecz” wraca do Szybkiego dostępu, tablet jak telefon).

**Przyczyna dzisiejszego „koślawego” przewijania** (dotyk, `(hover: none) and (pointer: coarse)`):
- `scroll-snap-type: y mandatory` z trzema punktami: okładka, początek Szybkiego dostępu i koniec stopki (`src/styles/zalozyciele-strony.css:249–251`, `scroll-padding-top` w 260). Przeglądarka dociąga do najbliższego punktu, więc lekkie machnięcie przerzuca na Szybki dostęp, a przy dole strony ściąga ją do końca stopki.
- Chowanie okładki po 150 ms spokoju na krawędzi i jej przywracanie przy nowym dotknięciu na górze (`src/scripts/zal/przejazd.ts:216–255` i 272–293, zlecenie 21, punkt 3).
- Telefon zawsze wraca na okładkę (`przejazd.ts:257–271`, zlecenie 21, punkt 9).

**Co się zmienia** (tylko dotyk; kółko, klawisze i kliknięcia na komputerze w `przejazd.ts` bez zmian)
1. **Usunąć** wszystkie trzy mechanizmy wyżej. Zostaje `html.bez-okladki .z-okladka { display: none !important }` i `bez-wejscia`, poprawka `dvh` z punktu 9 zlecenia 21 też zostaje.
2. **Okładka nie przewija się palcem**, gdy mieści się na ekranie: `touch-action: pinch-zoom` na okładce i pasku `.hdr`, włączane klasą ze skryptu (bez JS zwykłe przewijanie). Bez nasłuchów `touchmove` z `passive: false`.
3. **Ciągnięcie w górę** (palec od dotknięcia): okładka i Szybki dostęp jadą za palcem z oporem. Do progu przesuwają się o 0,55 drogi palca, za progiem o 0,3. Spod okładki wyłania się początek Szybkiego dostępu. Strzałka „Szybki dostęp” jaśnieje i podjeżdża do 10 px, a za progiem obraca się grotem w górę.
   - **Próg:** 1/3 wysokości okna drogi palca. Prędkość się nie liczy: samo szybkie machnięcie nie przenosi.
   - **Puszczenie za progiem:** okładka odjeżdża do końca (0,4 s, krzywa `cubic-bezier(.22, .8, .2, 1)`), Szybki dostęp staje pod paskiem, potem okładka znika z układu (`html.bez-okladki`) bez żadnego skoku na ekranie.
   - **Puszczenie przed progiem:** wszystko wraca (0,3 s).
   - Drugi palec (szczypanie) przerywa ciągnięcie i wraca. Ruch palca w dół na okładce nic nie robi.
   - Próg i opór jako zmienne CSS (`--z-prog: .333`, `--z-opor: .55`), jedno miejsce do zmiany.
4. **Strzałka:** na telefonie podskakuje co 2,6 s jak na komputerze (`z-bob`; dziś na telefonie stoi). Bez podskoku przy „ogranicz ruch” i w trakcie ciągnięcia. Stuknięcie strzałki i liczb: ten sam odjazd co za progiem.
5. **Szybki dostęp:** zwykłe przewijanie, okładki nie ma w układzie, ruch w górę kończy się na górze strony. Żadnych własnych reguł.
6. **Powrót na okładkę:** stuknięcie nazwy Instytutu w pasku na stronie głównej, bez przeładowania: strona od razu na górę, okładka zjeżdża z góry (0,4 s). Na innych stronach ten link działa jak dziś.
7. **Historia:** „wstecz” i odświeżenie wracają tam, skąd się wyszło. Z Szybkiego dostępu na to samo miejsce: znacznik `zBezOkladki` w `history.state`, położenie odtwarza przeglądarka (`history.scrollRestoration = 'auto'`), a skrypt w linii w `Okladka.astro` (linia 129) chowa okładkę przed pierwszym układem także na telefonie. Nowe wejście (link, wpisany adres, „← Strona główna”, nazwa w pasku z innej strony) zawsze na okładkę.
8. **Tablet:** to samo co telefon.
9. **Okładka nie mieści się w oknie** (np. bardzo niski ekran): bez progu i bez `touch-action`, zwykłe przewijanie, okładka zostaje w układzie.
10. **Dostępność:** fokus z klawiatury lub czytnika ekranu w Szybkim dostępie przy widocznej okładce → przejście bez animacji. Przewinięcie przez czytnik ekranu albo szukanie na stronie do krawędzi lub niżej (w spoczynku, nie w trakcie ciągnięcia) → okładka się chowa. Przy „ogranicz ruch” palec dalej przesuwa okładkę, ale przejścia są natychmiastowe.

**Wzór:** prototyp do wypróbowania na telefonie (link dopisze rozmowa w claude.ai).

**Odbiór** (uzupełni się po prototypie): emulacja Pixel 7 i iPhone 13, prawdziwe zdarzenia dotyku przez CDP (`Input.dispatchTouchEvent`). Ciągnięcia 100, 200, 260, 300, 400 px wolno (okno 839, próg ok. 280): przejście tylko od progu. Machnięcie 150 px w 80 ms: bez przejścia. Na Szybkim dostępie machnięcie w górę z +600 px kończy się na górze, okładki nie widać. Nazwa w pasku: okładka. „Wstecz” z podstrony otwartej z +800 px: +800, okładka schowana. Nowe wejście: okładka. Bez JS: zwykłe przewijanie. Brak nasłuchów dotyku z `passive: false` (CDP `DOMDebugger.getEventListeners`). Komputer: kółko i klawisze jak dziś.

## 3. Telefon: pasek u samej góry podstrony w kolorze banera — GOTOWE (decyzja 6.11, 16:45)
Właściciel (zrzut `/obrony-doktorskie/` przy 400 px): „Navbar na podstronach dalej ma swój własny kolor, a nie motyw banera. Przy zjechaniu kawałek jest ok, ale na samej górze też powinno być z motywem banera.”

**Przyczyna:** na telefonie pasek `.hdr` stoi w układzie nad banerem, więc na górze strony nie ma pod sobą banera i dostaje pełny granat (`src/styles/zal-telefon.css:30–33`, opis w `src/scripts/zal/pasek.ts:13`). Kolor banera prześwituje dopiero po przewinięciu (`.przewiniety`).

**Zmiana** (tylko telefon, strony z banerem `.z-nagl`: działy i podstrony): baner zaczyna się pod paskiem już na górze strony, a pasek ma na górze to samo półprzezroczyste tło z rozmyciem co po przewinięciu, bez cienia. Treść banera stoi tam, gdzie dziś. Sprawdzone w emulacji wstrzykniętym CSS:
```css
@media (max-width: 760px) {   /* po punkcie 1: nowa definicja „telefonu” */
  .z-nagl.z-nagl-pod { margin-top: calc(-1 * var(--hdr-h)); padding-top: calc(16px + var(--hdr-h)); }
  .z-nagl.z-baner-dzialu { margin-top: calc(-1 * var(--hdr-h)); padding-top: calc(18px + var(--hdr-h)); }
  body:has(.z-nagl) .hdr:not(.jasny):not(.przy-stopce) { background: color-mix(in srgb, var(--granat) var(--pasek-krycie), transparent) !important;
    -webkit-backdrop-filter: blur(14px) saturate(1.1) !important; backdrop-filter: blur(14px) saturate(1.1) !important; border-bottom-color: rgb(255 255 255 / .1) !important; }
}
```
Wpisz to w istniejące reguły (`zal-telefon.css`: 30–37, 145, 190), nie jako osobną łatkę, i popraw komentarze w `zal-telefon.css` i `pasek.ts` („na górze pełny granat” przestaje dotyczyć stron z banerem). Strony bez banera, strona główna (okładka) i pasek przy stopce bez zmian. Komputer bez zmian.

**Wzór:** `23-zalaczniki/23-pasek-na-banerze.png` (przed: góra i +70 px; po: góra i +70 px; Obrony doktorskie, Nauka, Władze, Matematyka, Popularyzacja).

**Odbiór**
- Telefon 390 i 412 px, PL i EN, jasny i ciemny motyw: na górze każdej strony z banerem (4 działy, Obrony doktorskie, Władze, Matematyka, seminarium, Aktualności, Kalendarz, Pracownicy) górna krawędź banera = 0, pasek półprzezroczysty, pod nim zdjęcie i kolor banera; po przewinięciu do końca banera pasek jasny jak dziś.
- Położenie tytułu, linku „←”, sygnetu, hasła i liczb w banerze: to samo co przed zmianą (±1 px), zmienia się tylko pas pod paskiem.
- Przejścia między stronami (pasek stoi) bez mignięcia granatem; wejście na adres z kotwicą (`#…`) kończy z nagłówkiem sekcji pod paskiem jak dziś.
- Strony bez banera i strona główna: piksel w piksel bez zmian; komputer bez zmian.
- Zrzuty: `raport-zrzuty/z23-pasek-*`.

## 4. Telefon, strona główna: pasek na okładce na tle zdjęcia, nie granatowy — GOTOWE (decyzja 6.11, 16:52)
Właściciel: „Na stronie głównej w mobilce navbar powinien mieć tło zdjęcia, ewentualnie rozmazane, ale nie niebieski pasek jak teraz.”

**Przyczyna ta sama co w punkcie 3:** okładka zaczyna się pod paskiem, więc pasek na górze dostaje pełny granat (`zal-telefon.css:30–33`).

**Zmiana** (telefon, strona główna, tylko gdy pod paskiem jest okładka): okładka zaczyna się pod paskiem (pełna wysokość okna), a pasek jest półprzezroczysty z rozmyciem i prześwituje przez niego zdjęcie. Budynek zostaje tam, gdzie dziś: skrypt `ULOZ` w `Okladka.astro` (gałąź telefonu, linia 94) liczy środek budynku w połowie między **dolną krawędzią paska** a górą liter „Instytut”, a nie od górnej krawędzi okładki. Sprawdzone w emulacji wstrzykniętym CSS i skryptem:
```css
@media (max-width: 760px) {   /* po punkcie 1: nowa definicja „telefonu” */
  .z-okladka { margin-top: calc(-1 * var(--hdr-h)); padding-top: var(--hdr-h); min-height: 100svh; min-height: 100dvh; }
  body:has(.z-okladka) .hdr:not(.jasny):not(.menu-otwarte) { background: color-mix(in srgb, var(--granat) 30%, transparent) !important;
    -webkit-backdrop-filter: blur(14px) saturate(1.1) !important; backdrop-filter: blur(14px) saturate(1.1) !important; border-bottom-color: rgb(255 255 255 / .12) !important; }
}
```
```js
// ULOZ, telefon: h = wysokość paska .hdr (offsetHeight)
--foto-top = Math.min(0, (h + l.top - ok.top + .14 * fontSize(l)) / 2 - .47 * f.offsetHeight)
```
- Wpisz w istniejące reguły (`zal-telefon.css:107` okładka, `30–37` pasek), popraw komentarze. Usuń martwe reguły starego nagłówka strony głównej w `src/styles/telefon.css:240–248` (`.hdr-glowna`), jeśli nic ich już nie używa.
- Okładka nadal kończy się dokładnie na dolnej krawędzi okna, więc Szybki dostęp zaczyna się tam, gdzie dziś. Gdy Szybki dostęp jest pod paskiem, pasek jasny jak dziś. Otwarte menu: pasek jak dziś.
- Z punktem 2 (okładka „na próg”): pasek prześwituje także podczas ciągnięcia okładki.

**Wzór:** `23-zalaczniki/23-pasek-na-okladce.png` (390 px; jasny motyw: dziś | po, ciemny motyw: dziś | po).

**Odbiór**
- Telefon 390×844, 412×915, 360×740, PL i EN, jasny i ciemny motyw: górna krawędź okładki = 0, pasek półprzezroczysty z rozmyciem, środek budynku na tej samej wysokości ekranu co dziś (±2 px), Szybki dostęp zaczyna się na dolnej krawędzi okna jak dziś.
- Kontrast nazwy Wydziału i ikon w pasku na zdjęciu co najmniej 4,5:1 (zmierz na najjaśniejszym miejscu zdjęcia pod paskiem; jeśli mniej, podnieś krycie granatu, nie zmieniaj rozmycia).
- Po przejściu na Szybki dostęp pasek jasny, przy stopce jak dziś; komputer i tablet bez zmian.
- Zrzuty: `raport-zrzuty/z23-okladka-pasek-*`.

## 5. Telefon, strona główna: jasna linia pod okładką — GOTOWE (decyzja 6.11, 16:58)
Właściciel (zrzut z telefonu, Brave na Androidzie, Web-Podglad): „Na mobilce pod sam koniec głównej zostaje cieniutki jasny pasek z Szybkiego dostępu. Z czego to wynika? Jak naprawić?”

**Przyczyna (z pomiaru zrzutu, 1178×2576):** na dolnej krawędzi okładki, tuż nad dolnym paskiem przeglądarki, jest linia grubości 2 pikseli ekranu w kolorze (112, 116, 127), czyli granat zmieszany mniej więcej pół na pół z jasnym tłem Szybkiego dostępu (`23-zalaczniki/23-szczelina-pod-okladka.png`, powiększenie 12×). Telefon ma skalę ok. 2,75, więc wysokość okna w pikselach CSS jest ułamkowa, a okładka (`min-height: calc(100dvh - var(--hdr-h))`, `zal-telefon.css:107`) kończy się ok. 0,4 px nad dołem ekranu. W tę szczelinę wchodzi początek Szybkiego dostępu. W emulacji (okrągłe wymiary) tego nie widać. To samo stanie się przy każdej chwilowej różnicy między oknem a `dvh` (wysuwanie paska adresu).

**Zmiana** (telefon; zapis po punkcie 4, gdy okładka zaczyna się pod paskiem): okładka zawsze trochę wychodzi poza dół widocznego okna: wysokość największego okna (`lvh`, jak przy schowanych paskach przeglądarki) plus 1 px. Tytuł, działy i strzałka zostają w widocznej części (`dvh`), a nadmiar pod nimi to sam granat:
```css
.z-okladka { --z-nadmiar: calc(100lvh - 100dvh + 1px);
  min-height: calc(100vh + 1px); min-height: calc(100lvh + 1px);   /* zamiast 100svh / 100dvh z punktu 4 */
  padding-bottom: calc(52px + var(--z-nadmiar)); }
.z-okladka .z-strzalka { bottom: calc(14px + var(--z-nadmiar)); }
```
- Z punktem 2 strona na okładce się nie przewija, więc granatowego nadmiaru nie widać. Tam, gdzie próg nie działa (bez JS, okładka nie mieści się w oknie), nadmiar to kawałek granatu przed Szybkim dostępem — dopuszczalne.
- Punkt 2: warunek „okładka mieści się w oknie” liczyć z dolnej krawędzi bloku działów (`.z-okl-dzialy`), a nie z wysokości całej okładki (ta jest teraz z założenia wyższa niż okno). Odjazd po progu przesuwa o pełną wysokość okładki do Szybkiego dostępu, jak dotąd (`y1()`).
- Komputer, tablet (widok komputera) i telefon w poziomie po punkcie 1 (okładka w dwóch kolumnach): sprawdź, że nadmiar nie psuje układu; w poziomie, gdy okładka ma wysokość z treści, nadmiar może zostać.

**Odbiór**
- Emulacja z ułamkową skalą i wysokością (CDP `Emulation.setDeviceMetricsOverride`: skala 2,75, wysokości 801–806 px co 0,25 przez `screenHeight`/`height` i paski przeglądarki): na górze strony głównej ostatni rząd pikseli okna ma kolor okładki, nigdy jasny. Pomiar: zrzut i kolor dolnych 3 pikseli ekranu.
- Strzałka „Szybki dostęp” i ostatni dział stoją tam, gdzie dziś (±1 px) przy 390×844, 412×915, 360×740.
- Właściciel sprawdza na swoim telefonie (Brave, Chrome): brak jasnej linii na dole okładki, także po wysunięciu i schowaniu paska adresu.
