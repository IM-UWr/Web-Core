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

## 2. Strona główna: z okładki na Szybki dostęp — na dotyku „na próg”, na komputerze tylko kliknięciem; powrót tylko z paska — GOTOWE (decyzje 6.11, 16:34, 17:03 i 17:14)
Właściciel (16:20, telefon): „na głównym ekranie trzeba przeciągnąć scrolla mocno, może jakieś dyskretne animowanie strzałki do Szybkiego dostępu, żeby przejść na Szybki dostęp, nie leciutki scroll od razu przerzuca. A jak już jesteśmy na Szybkim dostępie, to tam normalne zasady scrolla, żadnych specjalnych, powrót na stronę główną tylko naciśnięciem przycisku na navbarze.” 16:34: „Wszystko zgoda” (próg 1/3 ekranu, „wstecz” wraca do Szybkiego dostępu, tablet jak telefon). 17:03 (komputer): „podobna zasada, scroll na głównej nie działa, tylko Szybki dostęp. Podobnie jak na telefonie można animować. Do powrotu scroll też nie działa, tylko guzik na navbarze.” 17:14 (doprecyzowanie): „Na PC scroll ma nie działać na ekranie głównym wcale, tylko rzeczywisty klik. Przeciągnięcie tylko w telefonie.”

**Wzór: prototyp** https://claude.ai/artifact/FupESJkYq78jUCRkhjHfcq — prawdziwa strona główna z `e6b6cb2` zbudowana z tymi zmianami (plus punkty 4 i 5). Przełącznik „Prototyp · próg” w rogu i makieta podstrony po stuknięciu linku są tylko w prototypie — **nie wdrażać** (`23-zalaczniki/23-prototyp-dodatki-NIE-WDRAZAC.html`).
**Kod prototypu:** `23-zalaczniki/23-prototyp-okladki.patch` (na `e6b6cb2`, `git apply --check` przechodzi; pliki: `src/scripts/zal/przejazd.ts` przepisany w całości — też osobno `23-przejazd.ts` — `zalozyciele-strony.css`, `zal-telefon.css`, `Okladka.astro`). Łatka zawiera też punkty 4 i 5 (w `zal-telefon.css` dopisane na końcu bloku telefonu — przy wdrożeniu wpisz je w istniejące reguły). Weź łatkę jako punkt wyjścia, przenieś porządnie na stan po zleceniach 21 i 22 i po punkcie 1 (nowa definicja „telefonu”).

**Przyczyna dzisiejszego „koślawego” przewijania** (dotyk):
- `scroll-snap-type: y mandatory` z trzema punktami: okładka, początek Szybkiego dostępu i koniec stopki (`src/styles/zalozyciele-strony.css:249–251`, `scroll-padding-top` w 260). Lekkie machnięcie przerzuca na Szybki dostęp, przy dole strony przeglądarka ściąga ją do końca stopki.
- Chowanie okładki po 150 ms spokoju na krawędzi i przywracanie przy nowym dotknięciu na górze (`przejazd.ts:216–255` i 272–293, zlecenie 21, punkt 3).
- Telefon zawsze wraca na okładkę (`przejazd.ts:257–271`, zlecenie 21, punkt 9).
- Komputer: kółko na okładce przenosi po 60 px sumy w 200 ms, a ruch w górę z krawędzi Szybkiego dostępu wraca na okładkę (`przejazd.ts:106–171`).

**Jak ma działać** (tak działa prototyp, wersja 2)
1. **Dwa stany.** Okładka: strona się nie przewija. Szybki dostęp: okładki nie ma w układzie (`html.bez-okladki` — teraz także na komputerze), zwykłe przewijanie bez żadnych reguł, ruch w górę kończy się na górze Szybkiego dostępu. Usunąć: `scroll-snap`, chowanie po spokoju, „zawsze na okładkę” na telefonie, dwa położenia z dociąganiem na komputerze (`jedz`, `dociagnij`, `ResizeObserver` krawędzi).
2. **„Na próg” palcem (dotyk):** okładka i treść Szybkiego dostępu jadą za palcem z oporem (do progu 0,55 drogi palca, za progiem 0,3). Spod okładki wyłania się Szybki dostęp. Strzałka „Szybki dostęp” jaśnieje i podjeżdża do 10 px, a za progiem obraca grot w górę. Próg: `--z-prog` (1/3) × wysokość okna drogi palca; prędkość się nie liczy. Puszczenie za progiem — odjazd do końca (0,4 s, `cubic-bezier(.22, .8, .2, 1)`), przed progiem — powrót (0,3 s). Drugi palec przerywa i wraca. Na okładce `touch-action: pinch-zoom` (klasa `html.z-prog` ze skryptu; bez JS zwykłe przewijanie), nasłuchy dotyku pasywne.
3. **Komputer: na okładce przewijanie nie działa wcale.** Kółko, gładzik i klawisze przewijania (PgDn, PgUp, spacja, strzałki, Home, End) na okładce nic nie robią — bez animacji i bez przesuwania okładki. Przeciąganie „na próg” jest tylko na dotyku. Ctrl + kółko (powiększanie) i przewijanie wewnątrz otwartego panelu menu bez zmian. Ekran dotykowy laptopa: okładka też się nie przesuwa palcem (`touch-action` z punktu 2 działa na każdym urządzeniu), przejście tylko stuknięciem strzałki.
4. **Przejście od razu, bez progu, wszędzie:** kliknięcie/stuknięcie strzałki i liczb nad nią (zalecenie 15, z podświetleniem kolumny), Enter na strzałce (Tab), fokus z klawiatury lub czytnika w Szybkim dostępie. Na Szybkim dostępie klawisze działają zwyczajnie i nie wracają na okładkę.
5. **Powrót na okładkę tylko z paska:** link do strony głównej w pasku (telefon: nazwa Instytutu w `.hdr`; komputer: znak z nazwą `.z-marka` w pasku Szybkiego dostępu) na stronie głównej — bez przeładowania: strona od razu na górę, okładka nad Szybkim dostępem i płynne przewinięcie na nią. Na innych stronach te linki działają jak dziś. Także `#okladka` w adresie.
6. **Historia:** „wstecz” i odświeżenie wracają tam, skąd się wyszło: znacznik `zBezOkladki` w `history.state`, położenie odtwarza przeglądarka (`scrollRestoration` domyślne). Skrypt w linii w `Okladka.astro` (linia 129) chowa okładkę przed pierwszym układem przy znaczniku albo przy `#szybki-dostep` — na każdym urządzeniu. Nowe wejście (link, wpisany adres, „← Strona główna”, link z innej strony) zawsze na okładkę.
7. **Przewinięcie „z zewnątrz” na okładce:** paskiem przewijania myszą — po puszczeniu przycisku płynnie z powrotem na okładkę (przewijanie na okładce ma nie działać). Szukanie na stronie, czytnik ekranu, kotwica — w spoczynku (150 ms) od połowy drogi Szybki dostęp, wcześniej z powrotem na okładkę.
8. **Okładka nie mieści się w oknie** (dół bloku działów `.z-okl-dzialy` poniżej okna, np. bardzo niskie okno, telefon w poziomie po punkcie 1): bez progu i bez `touch-action`, zwykłe przewijanie; okładka chowa się na krawędzi Szybkiego dostępu, w spoczynku.
9. **Strzałka podskakuje** co 2,6 s także na telefonie (`z-bob`; dziś na telefonie stoi), bez podskoku przy „ogranicz ruch” i w trakcie ciągnięcia.
10. **Przesuwane elementy:** `.z-okladka` oraz `.z-druga-obszar > .z-pasek` i `.z-druga-obszar > .z-druga`, a **nie** sam `.z-druga-obszar`: stoi w nim panel menu (`position: fixed`), który pod przesuniętym rodzicem wychodzi w bok poza stronę, a telefon oddala wtedy widok (w prototypie `innerHeight` skakał z 839 na 1560 — znalezione i poprawione).
11. **Pasek telefonu** po schowaniu okładki na górze strony nie dostaje zdarzenia `scroll` — skrypt musi sam poprosić `pasek.ts` o przeliczenie koloru (w prototypie sztuczne zdarzenie `scroll`; w kodzie lepiej własne zdarzenie, np. `z-okladka`).
12. **„Ogranicz ruch”:** przesunięcie za palcem zostaje, przejścia natychmiastowe.
13. Próg i opór jako zmienne CSS (`--z-prog: .333`, `--z-opor: .55`) — jedno miejsce do zmiany po próbach właściciela.

**Odbiór** (w prototypie zmierzone w emulacji; powtórz na kodzie, także EN)
- Telefon (Pixel 7, 412×839, prawdziwe zdarzenia dotyku przez CDP `Input.dispatchTouchEvent`): 150 i 260 px wolno — powrót; machnięcie 200 px w 60 ms — powrót; 300 px wolno — Szybki dostęp pod paskiem (61 px), okładka schowana, pasek jasny; nazwa w pasku — okładka; strzałka — Szybki dostęp; odświeżenie z Szybkiego dostępu — Szybki dostęp; brak przewijania w poziomie i stały `innerHeight` w trakcie ciągnięcia.
- Komputer 1920×950 i 1366×640: 1 i 4 ząbki kółka na okładce — nic (położenie 0, okładka bez przesunięcia); PageDown na okładce — nic; klik strzałki — Szybki dostęp; dalej kółkiem — zwykłe przewijanie; mocno w górę — zatrzymuje się na górze Szybkiego dostępu; znak w pasku — okładka; PageUp na Szybkim dostępie — bez powrotu.
- Nasłuchy na `window` (CDP `DOMDebugger.getEventListeners`): dotyk pasywny; `wheel` niepasywny tylko na stronie głównej (zatrzymuje przewijanie okładki).
- Bez JS: zwykłe przewijanie od okładki w dół. Bez błędów w konsoli.
- **Czego emulacja nie sprawdzi** (właściciel na telefonie): czucie progu i oporu, Safari na iPhonie, czytniki ekranu.

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

## 6. Telefon: sygnet przy długich tytułach na wysokości linku i pierwszej linii — GOTOWE (decyzja 6.11, 17:00)
Właściciel (zrzuty „Teoria modeli” i „Analiza harmoniczna i rozwinięcia ortogonalne”): „Przy długich nazwach seminariów głowa powinna być jak przy krótkich: szary napis + pierwsza linia.”

**Przyczyna:** w `.z-tyt-g` jest `align-items: end`, a sygnet zajmuje oba wiersze (`zal-telefon.css:205–207`), więc przy tytule w kilku liniach zjeżdża na dół, do ostatnich linii. Pomiar przy 412 px (od góry bloku): krótki tytuł — sygnet 13–61 px, czyli od linku „← Seminaria” do dołu pierwszej linii tytułu (61 px); 3 linie — 78–126 px; 4 linie — 110–158 px.

**Zmiana:** sygnet zawsze tam, gdzie przy tytule w jednej linii: dół sygnetu na dole pierwszej linii tytułu, niezależnie od liczby linii; kreska obok bez zmian (48 px). Sprawdzone w emulacji wstrzykniętym CSS — wynik 13–61 px przy 1, 3 i 4 liniach:
```css
.z-nagl.z-nagl-pod .z-sygnet-nagl { align-self: start; margin-top: 13px; }
```
Lepiej liczyć to z wymiarów (wysokość linku + 4 px odstępu + jedna linia tytułu `1.08 × 30 px` − 48 px), żeby zmiana kroju albo rozmiaru linku nie rozjechała sygnetu. Dotyczy wszystkich podstron z sygnetem na telefonie (seminaria, ISIM, granty i inne długie tytuły), nie tylko seminariów. Komputer bez zmian (ma własną zasadę z zalecenia 9 zlecenia 11) — chyba że właściciel zdecyduje inaczej.

**Wzór:** `23-zalaczniki/23-sygnet-dlugie-tytuly.png` (góra: dziś; dół: po; Teoria modeli, Analiza harmoniczna…, Dyskretna analiza harmoniczna…).

**Odbiór**
- 360, 390 i 412 px, PL i EN: na seminariach Teoria modeli (1 linia), Analiza harmoniczna i rozwinięcia ortogonalne (3), Dyskretna analiza harmoniczna… i Prawdopodobieństwo (4) oraz ISIM: górna i dolna krawędź sygnetu w tym samym miejscu względem linku (±1 px), dół sygnetu = dół pierwszej linii tytułu (±1 px).
- Tytuły w jednej linii piksel w piksel bez zmian.
- Zrzuty: `raport-zrzuty/z23-sygnet-*`.
