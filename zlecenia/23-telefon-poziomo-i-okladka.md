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
