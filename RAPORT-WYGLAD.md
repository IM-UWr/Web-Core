# Raport: nowy wygląd „Założyciele”, wersja na komputer (zlecenie 10, noc 2–3.11.2026)

Gałąź: `wyglad/zalozyciele` (z `kopia/2026-11-01-agent-nauka-podglad`, `ae6d5d96`). Pytania i przyjęte odpowiedzi: `PYTANIA.md`.

## Jak budowałem i sprawdzałem (ważne dla oceny wyników)
- **Treści.** W repozytorium Web-Core nie ma treści (są w Web-*, w `.gitignore`), a dostęp do repozytoriów Web-* w tej sesji został odmówiony. Nie uruchamiałem `skrypty/pobierz_tresci.py`. Buduję na **danych testowych** odtworzonych z prototypu i ze zbudowanej kopii obecnej strony (gałąź `podglad-agent-nauka-podglad`); dane testowe leżą tylko w ścieżkach ignorowanych przez git i nie są w żadnym commicie (`PYTANIA.md`, pytanie 1).
- **Data.** Wiele list zależy od „dziś” (wydarzenia, seminaria tygodnia, stopka). Do porównań data budowania jest zamrożona na 2.11.2026, 10:00 (moduł podpięty przez `NODE_OPTIONS=--import …`, poza repozytorium).
- **Build:** `npx astro build` (bez Pagefind).
- **Gałęzie etapów:** zgodnie z poleceniem w czacie pushuję tylko `wyglad/zalozyciele`; etapy są oznaczone w commitach, a ostatnie commity etapów są niżej.

## Etap 1: krok zero — zrobione
**Commity:** `aa293c48` (Instytut i strony ogólne), `10e8ebf6` (Nauka), `d38f749c` (Studia, Kalendarz, Aktualności) — ostatni commit etapu: `d38f749c` (gałąź etapu można założyć: `git branch wyglad/01-krok-zero d38f749c`).

**Co zrobione.** Przygotowanie danych z górnych części wszystkich 32 widoków `src/views/*.astro` przeniesione do funkcji w `src/lib/widoki/` (jeden plik na widok, np. `daneDzialuInstytut(lang)`, `daneWladz(lang)`, `daneListyGrantow(lang)`, `daneGrantu(grant, lang)`, `danePlanuZajec(lang)`). `src/views/publikacjeDane.ts` przeniesiony do `src/lib/widoki/publikacje.ts` (poprawione importy w `sitemap.xml.ts` i stronach rocznika publikacji). W widokach zostały: importy komponentów, `Astro.props`, jedno wywołanie funkcji danych i drobne pomocniki prezentacyjne (`T`, `href`, `mail`, `tel` itp.). Część HTML, `<style>` i `<script>` każdego widoku jest bajtowo bez zmian. Pracę podzieliłem między trzech podagentów (rozłączne zestawy widoków, osobne kopie robocze).

**Wynik porównania HTML.** `diff -r` całego `dist` (738 stron HTML i wszystkie pozostałe pliki) przed zmianą i po niej, oba buildy w tym samym katalogu i z zamrożoną datą: **brak różnic**. (Uwaga: build tego samego kodu w innym katalogu różni się w 5 plikach — `uid` wysp React w `pracownicy` i jednej aktualności oraz kolejność wierszy `sitemap.xml` — bo Astro bierze do nich ścieżkę katalogu; dlatego oba buildy robiłem w tym samym katalogu.) Na danych testowych, nie na prawdziwych treściach — patrz `PYTANIA.md`, pytanie 1.

### Jak powtórzyć dowód z etapu 1 na prawdziwych treściach (na komputerze z treściami Web-*)
```bash
git worktree add ../wzorzec ae6d5d96          # stan przed etapem 1
git worktree add ../etap1 <ostatni commit etapu 1>
# w obu katalogach: te same treści (skopiować src/content, src/data, public/pliki z bieżącego katalogu) i npm ci
# zamrożona data, żeby „dziś” było takie samo w obu buildach:
echo "const S=Date.UTC(2026,10,2,9);const D=Date;globalThis.Date=class extends D{constructor(...a){a.length?super(...a):super(S)}static now(){return S}}" > /tmp/zamroz.mjs
(cd ../wzorzec && NODE_OPTIONS="--import /tmp/zamroz.mjs" npx astro build)
(cd ../etap1 && NODE_OPTIONS="--import /tmp/zamroz.mjs" npx astro build)
diff -r ../wzorzec/dist ../etap1/dist && echo IDENTYCZNE
```

## Etap 2: fundament — zrobione
**Commit:** `d98f3383` (ostatni commit etapu; gałąź etapu: `git branch wyglad/02-fundament d98f3383`).

**Co zrobione (tylko komputer, wszystko za `@media (min-width: 761px)`):**
- **Zmienne** (`src/styles/zalozyciele.css`): paleta „Atramenty” (4 odcienie na dział jako `--instytut-j/g/a/t` itd. i `--d-*` w miejscu z `data-dzial`), granat `#0d1830`, ciepłe tło `#fcfaf6` / `#f4f1ea` / `#e5e0d6` w jasnym motywie, ciemny motyw `#0a1020` (tekst w kolorze działu bierze odcień jasny). Stare zmienne (`--bg`, `--accent`…) nadpisane na komputerze, więc dotychczasowa treść podstron też dostaje nowe kolory; bursztyn tylko w Instytucie, poza działami neutralnie. Ozdobne tło („pole”) wyłączone na komputerze.
- **Kroje:** Brygada 1918 (paczka `@fontsource-variable/brygada-1918`, w projekcie) w nagłówkach, Manrope (już w projekcie) w tekście.
- **Szablon** (`Baza.astro`): pasek menu na banerze (`src/components/zal/PasekMenu.astro`: przezroczysty, biały tekst, kolumna 1240 px, bieżący dział pogrubiony, kreski 18 px w kolorach działów, Rekrutacja za kreską, Szukaj, EN z flagą 20×10), odchudzona stopka w jednej linii (`StopkaZ.astro`), kolumna `--marg: max(64px, (100% − 1240px)/2)`. Stary nagłówek i stopka zostają dla telefonu.
- **Trzy nagłówki:**
  - okładka strony głównej (`Okladka.astro` + `src/scripts/zal/okladka.ts`): blok tytułu z równymi końcami i ciemnym polem po skosie s = 0,32 (liczone jak w prototypie), zdjęcie przesunięte w prawo i w górę, 4 działy ze szkicami („duch” w spoczynku, rysowanie po najechaniu), hamburger z panelem (Esc, klik obok, fokus), Szukaj, EN, księżyc, strzałka „Szybki dostęp”;
  - baner działu („opcja 4”, `NaglowekZ.astro`, rodzaj `dzial`): granat → zdjęcie w dwóch kolorach, szkic patrona z poświatą, notka o patronie z salą, podpis; hasło i liczby tylko gdy są liczby;
  - nagłówek podstrony (`NaglowekZ.astro`, rodzaj `podstrona`): głęboki kolor działu na zdjęciu (≈90% z lewej, ≈55% z prawej), „← Dział”, sygnet z kreską i małym podpisem w lewym marginesie, znak patrona z opisem przy prawej krawędzi (niski 145×170, wysoki 200×200 przycięty do rysunku). Zasady położenia według „Zasady nagłówka podstrony”, w tym wąskie okna < 1500 px (sygnet w kolumnie, tytuł o 122 px w prawo). Wchodzi przez `NaglowekStrony.astro`, więc od razu na wszystkich podstronach (PYTANIA.md, pytanie 6).
- **Boczna nawigacja podstron** (`BocznaNawigacja.astro`, grupy z menu, bieżąca z kreską, „Na tej stronie”) i „Następna strona w dziale” (`NastepnaStrona.astro`) — gotowe komponenty, użyte w etapie 3.
- **Szkice** (`src/assets/szkice/`: pliki SVG z gałęzi prototypów, `ZRODLA.md` i `szkice.json` — wyciąg z tych SVG użyty w prototypie, z kreskami rozdzielonymi do rysowania; `Szkic.astro` wstawia je jako SVG w linii, `aria-hidden`). Animacje (`src/scripts/zal/szkice.ts`): kontur się rysuje (1,5 s, odstęp 45 ms), detale się pojawiają, podpis odsłania się maską i kończy razem ze szkicem; na stronie działu tylko przy pierwszym wejściu w wizycie (`sessionStorage`, gdy nie da się zapisać — jak przy powrocie), start dopiero gdy widoczny; podstrony bez animacji; po narysowaniu jednolity (1,3 i 1,1 px); `prefers-reduced-motion` — od razu gotowe, z rozjaśnieniem 0,15 s; bez JS — od razu narysowany.
- Dane patronów, notki, sale i znaki matematyczne (liczone jak w prototypie): `src/lib/patroni.ts`, oznaczone jako **do sprawdzenia**; puste `*_en` = tekst polski.

**Sprawdzenie:**
- `npx astro build` bez błędów i ostrzeżeń (738 stron, PL i EN). Linki wewnętrzne: te same 3 zepsute cele co przed zmianami (brak pliku w danych testowych i Pagefind, który nie jest budowany), żadnych nowych.
- **Telefon 390 px, 29 stron (PL i EN), jasny motyw + 6 stron w ciemnym:** zrzuty po zmianach są identyczne piksel w piksel ze zrzutami sprzed zmian (porównanie z dwoma przebiegami wzorca; jedyne różnice to szum ozdobnego tła, który występuje też między dwoma przebiegami starego kodu).
- Komputer: zrzuty 1920×950, 1536×760 i 1366×640, jasny i ciemny motyw; porównanie z prototypem w 1920×950 (okładka, baner Instytutu, nagłówek Projektów i grantów) — zgodne poza różnicami niżej.
- Przeglądarka: pierwsze wejście na stronę działu rysuje szkic i podpis, powrót i `prefers-reduced-motion` dają stan gotowy; hamburger działa z klawiatury (Esc, powrót fokusu); brak błędów JS.

**Różnice względem prototypu (etap 2) i powody:**
- Plakietka wyróżnionego wpisu nad logo okładki pokazuje się, gdy w CMS jest wpis z „Wyróżnij do…” (PYTANIA.md, 4).
- Strzałka okładki bez licznika („3 wydarzenia w tym tygodniu” to propozycja do potwierdzenia).
- Opis znaku z rokiem: „Pochodna Liego, 1931”, „Kontinuum Knastera, 1922” (PYTANIA.md, 5).
- Księżyc tylko na okładce, jak w prototypie (PYTANIA.md, 3).
- Strony bez banera (pojedyncza aktualność, obrona itp.) — pasek na granacie; Aktualności, Kalendarz i strony ogólne — nagłówek w granacie ze zdjęciem Aktualności, bez sygnetu i znaku (prototyp tych stron nie ma).
- Opis strony (`lead`) nie jest pokazywany w nowych nagłówkach (jak w prototypie; zostaje w meta description).
- Flaga UK uproszczona (czerwone skosy bez przesunięcia — przy 20 px niewidoczne).
- Pasek po przewinięciu się nie przykleja (w `dok/estetyka.md` „do zrobienia”, otwarte).
- Treść pod nagłówkami (poza stronami z etapu 3) jest jeszcze stara, tylko w nowych kolorach i krojach.

## Etap 3: strony z prototypu — zrobione
**Commity:** `4796664a`, `95f76d6b`, `363125c6` (strona główna, Władze), `0bcfcc2e` (Projekty i granty, Plan zajęć), `94b13c48` („Następna strona w dziale” w szablonie, SIAD, poprawki ramy), `658fd48d` (strony działów), `5ef8d511` (poprawki; ostatni commit etapu: `git branch wyglad/03-strony 5ef8d511`). Projekty i granty, Plan zajęć oraz strony działów robili podagenci w osobnych kopiach roboczych (rozłączne pliki); ich commity przeniosłem na gałąź.

**Strona główna, drugi ekran** (`src/components/zal/DrugiEkran.astro`, `src/scripts/zal/drugi-ekran.ts`): pasek „Szybki dostęp” (Plan zajęć z nazwą bieżącego semestru z planu USOS, kolor dnia z tą samą logiką i odświeżaniem w przeglądarce co kafelek na telefonie, Pracownicy z liczbą osób, Seminaria z liczbą referatów w tygodniu), trzy kolumny (Nadchodzące wydarzenia — te same co na telefonie: 30 dni i przypomnienia terminów; Seminaria — 7 dni od dziś, prelegent po tytule; Aktualności — miniatury 72×54, bez zdjęcia sygnet działu), długa trzecia kolumna z „i jeszcze N · Wszystkie …”, zamiana FLIP 0,52 s (bez ruchu: tylko rozjaśnienie 0,15 s; fokus na nagłówek rozwiniętej kolumny), jeden wzór daty, Studia z klikalnym „Studiuj matematykę we Wrocławiu ↗” (adres rekrutacji z Ustawień) i SIAD jako skrót z pełną nazwą w podpowiedzi, Warto wiedzieć (losowanie jak dotąd). Stopka odchudzona.

**Władze** (`src/components/zal/WladzeZ.astro`, `OsobaZ.astro`, dane `daneWladzKomputer()` w `src/lib/widoki/wladze.ts`): schemat dyrekcji (dyrektor 120×150, zastępcy 96×120 połączeni liniami), Władze Wydziału w dwóch kolumnach (76×95), Sekretariat jako blok kontaktu bez zdjęć, Kadencja, Rada Instytutu, Zobacz też; boczna nawigacja działu z „Na tej stronie”; „Następna strona w dziale” i „Zgłoś błąd na tej stronie”.


**Strony działów** (`src/components/zal/TrescDzialu.astro`, `src/components/zal/dzial/*`, `src/styles/zal-dzialy.css`): pod banerem podstrony w trzech grupach jak w menu (linie, Brygada, strzałki, ↗ przy zewnętrznych; SIAD skrótem), tekst działu z większym pierwszym akapitem i „W skrócie” (wartości Brygadą w kolorze działu), sekcje: Instytut — Ostatnie sukcesy (miniatury; bez zdjęcia sygnet na tle działu) i Kontakt i dojazd (podpisy zamiast ikon, mapa Google dopiero po kliknięciu, zapamiętana zgoda jak dotąd); Nauka — Realizowane projekty (karty) i Konferencje (nadchodzące, a bez nich „Ostatnio odbyły się”); Studia — Aktualności dla studentów; Popularyzacja — sekcje strony i partnerzy z domenami.
**Liczba konferencji w banerze Nauki** liczona automatycznie z kolekcji `konferencje` (bez odwołanych, początek w ostatnich 365 dniach): „2 konferencje w ostatnim roku” na danych testowych (17.05 i 7.09.2026). Osobna lista tylko dla komputera, bo lista telefonu się nie zmienia.

**Projekty i granty** (`src/views/ListaGrantow.astro`, dane w `src/lib/widoki/listaGrantow.ts`, `src/styles/zal-granty-plan.css`): wstęp, Realizowane z paskami czasu na wspólnej osi lat i przerywaną linią „dziś” (data budowania), Zakończone według roku zakończenia z małymi paskami na osi od 2004, Pozostałe; boczna nawigacja ze spisem.
**Plan zajęć** (`src/views/PlanZajec.astro`, `src/lib/widoki/planZajec.ts`): wszystkie przedmioty w kategoriach, zajęcia w równych kolumnach (typ, gr., prowadzący, dzień, godziny, sala, uwagi), przyklejony pasek z przełącznikiem semestrów (zsynchronizowanym z dotychczasowym), wyszukiwarką (przedmiot, prowadzący, sala, uwagi; także bez polskich znaków) i filtrem dni (kilka naraz, klawiatura), komunikat „Nic nie pasuje do wyszukiwania.”, w nagłówku liczby: przedmioty w semestrze i ostatnia aktualizacja z USOS; bez JS pasek schowany, plan pełny.

**Sprawdzenie etapu 3:** build bez błędów (738 stron), linki wewnętrzne bez nowych zepsutych; telefon 390 px na 29 stronach identyczny ze wzorcem (poza znanym szumem tła i pojedynczymi pikselami wygładzania rogów kart na `/studia` i `/popularyzacja`, ≤ 56 px, kanał ±1–2 — zmienia się nawet od zmian samego CSS komputera, nie od treści); telefon w ciemnym motywie dla grantów i planu bez różnic; komputer: zrzuty 1920/1536/1366 w obu motywach i EN, porównanie z prototypem w 1920 (okładka, drugi ekran, 4 działy, Władze, granty, plan — zgodne, poza różnicami niżej). Działanie sprawdzone w Playwright (zamiana kolumn, menu, mapa, filtr planu, animacja szkicu); bez błędów JS.

**Różnice względem prototypu (strony działów, granty, plan):**
- Treści z danych zamiast przykładowych z prototypu (inne wpisy sukcesów, 6 realizowanych projektów zamiast 5, zapowiedziana konferencja 2027 → „Najbliższe konferencje”, w menu dodatkowo Kalendarz i Warto wiedzieć, w kontakcie wiersz „Godziny”).
- Popularyzacja: w danych trzy grupy mają inicjatywy, więc są pokazane jako lista (nazwa, opis, „Dla kogo · domena”); „To be announced” tylko przy grupie bez inicjatyw. Same „TBA” schowałyby na komputerze treść widoczną na telefonie.
- Tytuł banera z danych „Popularyzacja matematyki” jest dłuższy niż w prototypie — łamie się i jest mniejszy, żeby nie wchodził pod notkę o patronie.
- Oś zakończonych projektów od najwcześniejszego roku zaokrąglonego w dół do wielokrotności 4 (wychodzi 2004, jak w prototypie). Projekt bez numeru — na końcu nazwa programu.
- Okładka po angielsku: „Mathematical / Institute” — drugie słowo jest krótsze od pierwszego, więc końce nie są dociągane do skosu (zostają stopnie z CSS); skos liczony od końca pierwszej linii.

**Różnice względem prototypu (strona główna, Władze):**
- Wstęp sekcji „Dyrekcja” to pole `wstep` z danych Władz (w prototypie zdanie przykładowe).
- „Ostatnia aktualizacja: data z historii zmian” — pominięta, bo historia zmian treści jest w repozytoriach Web-* i nie ma jej przy budowaniu; zostaje „Zgłoś błąd na tej stronie” (e-mail z tytułem i adresem strony).
- Wydarzenia nie mają w danych rodzaju typu „koło naukowe” / „warsztaty” — w wierszu jest dział, godzina i miejsce (skrócone do „s. HS”).
- Warto wiedzieć losowane (PYTANIA.md, 9); drugi ekran na całą szerokość jak w prototypie (PYTANIA.md, 7).

## Etap 4 (częściowo): przejścia, wspólny szablon stron treści
**Commit:** patrz „Stan gałęzi” na końcu.
- **Przejścia między stronami** (`src/styles/zal-przejscia.css`): wspólne elementy z `view-transition-name`, tylko komputer i tylko bez „ogranicz ruch”: okładka → dział (szkic i nazwa działu przelatują na miejsce w banerze, pasek się pojawia, zdjęcie przenika), dział → podstrona (pasek stoi, szkic maleje do sygnetu, podpis leci z nim, tytuł przenika), podstrona → podstrona (nagłówek stoi, znak przenika, boczna nawigacja stoi, zaznaczenie się przesuwa), inny dział — przenikanie. Czas 0,3 s. Na każdej stronie nazwy są unikalne (sprawdzone w Chromium, bez błędów w konsoli). Działa w Chrome/Edge 126+ i Safari 18.2+.
- **Strony treści** (`src/views/Strona.astro` — wszystkie strony z `src/content/strony`, np. Kontakt, Pierwszy rok, Sprawy studenckie): boczna nawigacja działu z lewej ze spisem „Na tej stronie” z nagłówków, treść bez pasów i kafelków, „Następna strona w dziale” (z etapu 3). Dotychczasowy pasek boczny i spis u góry schowane na komputerze.
- **Nie przeniesione na wspólny szablon** (mają nowy nagłówek, kolory, kroje i „Następną stronę w dziale”, ale dotychczasowy układ treści): Pracownicy, Struktura i zakłady, zakład, Seminaria i seminarium, Konferencje, Obrony i obrona, Publikacje i rocznik, Sukcesy, grant, Rok akademicki, kierunek, specjalność, Warto wiedzieć, Aktualności, Kalendarz. Każda ma własny blok treści; przeniesienie to osobna praca na stronę (wzór: Władze, Projekty i granty, Plan zajęć).
- **Stary kod wyglądu komputerowego — nie usuwałem.** Kandydaci (już niewidoczni na komputerze, ale część reguł jest wspólna z telefonem, więc usuwanie wymaga osobnego sprawdzenia na prawdziwych treściach): style `.hdr .nav`/`.dropdown` dla komputera w `global.css`, desktopowe reguły `.hero` (`global.css`, `tlo.css`), `src/styles/uklad-portal.css` i część `uklad-zwarta.css` (używane jeszcze przez nieprzeniesione strony), fala Fouriera i skrypt `naPasie` w `NaglowekStrony.astro`, warianty `ustawienia.naglowki_podstron` i `tlo_strony` na komputerze.

**Sprawdzenie:** build bez błędów; telefon na 31 stronach bez różnic (poza znanym szumem); komputer — zrzuty stron treści w obu motywach.

## Podział `src/scripts/` i skryptów w komponentach
`src/scripts/` zawiera tylko silnik animacji banerów (`src/scripts/baner/`). Pozostałe zachowanie strony siedzi w `<script>` w komponentach i widokach.

**Dekoracje (do wymiany albo usunięcia na komputerze; telefon zostaje bez zmian):**
- `src/scripts/baner/silnik.ts`, `typy.ts`, `wspolne.ts` i 37 motywów w `src/scripts/baner/motywy/` (Lorenz, Fourier, Knaster, kanapka, motyl itd.) — animacje w tle banerów podstron. **Działają tylko na telefonie** (silnik sam się wyłącza powyżej 760 px), więc zostają nietknięte.
- `NaglowekStrony.astro`: skrypt `naPasie` (przezroczysty nagłówek na granatowym pasie) i statyczna fala Fouriera w Aktualnościach — wygląd starego banera.
- `WartoWiedziec.astro`: losowanie kolejności kart (skrypt w linii) — wygląd/układ, nie funkcja.

**Zachowanie (zostaje, nowy wygląd ma z niego korzystać):**
- `Baza.astro`: motyw jasny/ciemny z `localStorage` przed narysowaniem strony, `speculationrules` (wczytywanie z wyprzedzeniem).
- `Naglowek.astro`: przełącznik trybu ciemnego, rozwijanie menu, menu na telefonie, wyszukiwarka w nagłówku.
- `FiltrISzukaj.astro` (podpowiedź w polu szukania), `ListaAktualnosci.astro` (filtry i szukanie), `Kalendarz.astro` (widok, filtr rodzaju, szukanie), `ListaGrantow.astro` (podświetlanie spisu), `SpisTresci.astro` (podświetlanie bieżącej sekcji), `Szukaj.astro` (Pagefind), `Seminarium.astro` (zapis na listę), `Kierunek.astro` (zakładki programów i wybór roku), `PrzelacznikSemestrow.astro` + `wyborSemestru.ts`, `RokAkademicki.astro` i `KafelekKoloryDni.astro` (kolor dnia liczony w przeglądarce), `DzialInstytut.astro` (mapa ładowana po kliknięciu), `powiadomienia.astro`, `Przekierowanie.astro`.
- `StronaGlowna.astro`: „Zobacz więcej” i odliczanie wydarzeń (telefon i komputer).
- Telefon: `WTymDziale.astro` (akordeon), `WierszAktualnosci.astro` (zwijanie plakietek do „+N”).

**Nowe skrypty komputera (`src/scripts/zal/`):** `okladka.ts` — układ bloku tytułu i skosu (dekoracja) oraz hamburger i strzałka (zachowanie); `szkice.ts` — animacja szkicu i podpisu na banerze działu (dekoracja, z flagą wizyty); `drugi-ekran.ts` — długa kolumna i zamiana kolumn (zachowanie). Filtr planu zajęć jest w `PlanZajec.astro`.

## Potrzebne zmiany w CMS (nie wprowadzałem ich — tylko lista)
- **Aktualności: opcjonalne pole „Dział”** (Instytut, Nauka, Studia, Popularyzacja) w `src/content.config.ts` i w formularzu Pages CMS (już w `dok/estetyka.md`). Dziś dział wpisu liczy się z reguły (PYTANIA.md, 8); Popularyzacji nie da się wykryć automatycznie.
- **„Warto wiedzieć”: Popularyzacja w polu `dzial`** (już w `dok/estetyka.md`).
- **Patroni działów:** notki, lata, sale, nazwy i opisy znaków są w kodzie (`src/lib/patroni.ts`, oznaczone „do sprawdzenia”). Gdy teksty zostaną sprawdzone, można je przenieść do Ustawień (np. `ustawienia.patroni.<dział>.notka`, `notka_en`, `znak_nazwa`, `znak_opis` — pola opcjonalne; kod brałby je, gdy są).
- **Zdjęcia nagłówków działów** dalej z `public/pliki/naglowki/*.jpg` (Web-Ustawienia); docelowe zdjęcia według „Zdjęcia na tła” w `dok/estetyka.md`. Kadry i jasność są w `src/components/zal/NaglowekZ.astro` (stała `FOTO`).
- **Hasła i liczby nagłówków** podstron bez liczb w danych (np. Plan zajęć) — tekst w kodzie z wersją angielską; jeśli redaktorzy mają je zmieniać, potrzebne pola `haslo`/`haslo_en` w danych tej strony.

## Czego nie zrobiono i dlaczego
- **Prawdziwe treści:** wszystko budowane i sprawdzane na danych testowych (PYTANIA.md, 1). Na prawdziwych treściach mogą wyjść inne długości tekstów (np. łamanie liczb w banerze).
- **Gałęzie etapów** (`wyglad/01-krok-zero` itd.) — nie zakładałem (polecenie w czacie: tylko `wyglad/zalozyciele`); hashe ostatnich commitów etapów są wyżej.
- **„Ostatnia aktualizacja: data z historii zmian”** na dole podstron — brak danych o historii zmian treści przy budowaniu (repozytoria Web-*); jest tylko „Zgłoś błąd na tej stronie”.
- **Pasek przyklejony po przewinięciu** — w specyfikacji „do zrobienia”/otwarte; nie robiłem.
- **Podmenu w pasku** — wyłączone 2.11 (zgodnie ze zleceniem).
- **Telefon** — bez zmian (sprawdzone zrzutami).

