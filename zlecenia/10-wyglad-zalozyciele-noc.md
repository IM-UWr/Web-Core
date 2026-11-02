# Zlecenie 10: nowy wygląd „Założyciele”, wersja na komputer (praca nocna w chmurze, 2–3.11.2026)

Pracujesz sam, bez nadzoru. Nikt nie odpowie na pytania. Jeśli coś jest niejasne, wybierz najbezpieczniejszą wersję zgodną z ustaleniami, zapisz decyzję w raporcie i pracuj dalej.

## 0. Źródła i zasady (przeczytaj najpierw)
- Ustalenia wyglądu: `dok/estetyka.md` na gałęzi `origin/kopia/2026-11-01-estetyka-prototypy`. **To jest specyfikacja.** W razie sprzeczności z innymi źródłami ma pierwszeństwo.
- Kontekst projektu i zasady pracy: `dok/przekazanie.md` z tej samej gałęzi, sekcje 0 i 14.
- Wzorzec wyglądu: prototyp `proto/zalozyciele.src.html` z tej samej gałęzi. Zawiera dokładne wartości CSS, kolory, rozmiary i logikę JS (układ bloku tytułu, długa kolumna z FLIP, znaki patronów, paski czasu, filtr planu, maski podpisów). Gotowy plik `proto/zalozyciele.html` otwiera się w przeglądarce. **Panel przełączników i skalowanie podglądu to tylko narzędzia prototypu, ich nie przenosisz.** Obowiązują ustawienia domyślne prototypu.
- Szkice patronów: `szkice/*.svg` z tej samej gałęzi (pełny z grupami `kontur` i `detale`, sygnet, podpis z grupami `obrys` i `prowadzaca`). Źródła: `szkice/ZRODLA.md`.
- Pliki z tamtej gałęzi czytaj przez `git fetch origin kopia/2026-11-01-estetyka-prototypy` i `git show origin/kopia/2026-11-01-estetyka-prototypy:ŚCIEŻKA`, albo przez osobny `git worktree`. Nie scalaj tej gałęzi z kodem.
- **Gałąź robocza sesji: `wyglad/zalozyciele`.** Założona 2.11 z `kopia/2026-11-01-agent-nauka-podglad` (commit `ae6d5d96`, stan z komputera właściciela). Na niej pracujesz i na nią pushujesz.
- **Etapy oznaczaj w commitach** („Etap 1: …”, „Etap 2: …”). Jeśli push na dodatkowe gałęzie jest możliwy, po każdym etapie wypchnij też jego stan jako `wyglad/01-krok-zero`, `wyglad/02-fundament` itd. Jeśli jest zablokowany, wystarczy sama `wyglad/zalozyciele`.

## 1. Twarde zasady
1. **Push wyłącznie na `wyglad/zalozyciele` (i ewentualnie gałęzie etapów `wyglad/*`).** Nigdy na `main`, `agent-nauka-podglad` ani gałęzie `kopia/*`. Bez force-push i bez scalania do `main`.
2. **Nie uruchamiaj `skrypty/pobierz_tresci.py`.** Budujesz na treściach, które są w repozytorium.
3. **Struktury danych nie zmieniasz.** Nowe pola w `src/data` i schemacie treści tylko dodajesz, opcjonalnie. Istniejących treści nie przepisujesz. Konfiguracji CMS nie ruszasz, a potrzebne zmiany wypisujesz w raporcie.
4. **Telefon (≤ 760 px) zostaje bez zmian.** Nowy wygląd dotyczy tylko komputera: style nowego wyglądu za `@media (min-width: 761px)`, a style i bloki telefonu (`telefon.css`, `.tylko-telefon`, silnik banerów `src/scripts/baner/`) zostawiasz. Weryfikacja w punkcie 4.
5. **Wersja angielska (`/en`) ma działać.** Nowe teksty dodawaj po polsku z polem `_en`. Jeśli pole jest puste, strona pokazuje tekst polski.
6. **Dostępność:** przy `prefers-reduced-motion` żadnego ruchu (stan końcowy od razu, najwyżej krótkie rozjaśnienie). Animowane i ozdobne SVG mają `aria-hidden="true"`. Fokus i nawigacja z klawiatury muszą działać.
7. **Fonty Brygada 1918 i Manrope trzymasz w projekcie** (np. paczki `@fontsource`), bez Google Fonts.
8. **Zdjęcia nagłówków** na razie z `public/pliki/naglowki/*.jpg`. Zdjęcia osób Władz z `public/pliki/wladze/`.
9. **Commity po polsku**, krótkie i rzeczowe. Każdy etap kończysz udanym buildem, commitem i pushem gałęzi etapu.

## 2. Etapy (w tej kolejności; każdy etap = osobna gałąź oparta na poprzedniej)

### Etap 1 → gałąź `wyglad/01-krok-zero`
- Zbuduj stronę na gałęzi bazowej (`npm ci`, `npx astro build`) i zachowaj kopię `dist` jako wzorzec.
- Przenieś przygotowanie danych z górnych części plików `src/views/*.astro` do funkcji w `src/lib/` (np. `daneDzialuInstytut()`). W widokach zostaje tylko wyświetlanie.
- **Dowód poprawności:** zbuduj ponownie. Wszystkie pliki HTML w `dist` muszą być identyczne z wzorcem (`diff -r`). Jeśli nie są, poprawiaj do skutku albo wycofaj zmiany w pliku, który psuje wynik, i opisz to w raporcie.
- Wypisz w raporcie podział `src/scripts/` na zachowanie, które zostaje, i dekoracje.

### Etap 2 → gałąź `wyglad/02-fundament`
- Zmienne: kolory działów z palety „Atramenty” (4 odcienie na dział), granat, ciepłe tło `#fcfaf6` w jasnym motywie, ciemny motyw (`#0a1020`; w ciemnym motywie tekst w kolorze działu bierze odcień jasny).
- Typografia: Brygada 1918 w nagłówkach, Manrope 400–600 w tekście.
- Szablon strony:
  - pasek menu na banerze (przezroczysty, biały tekst, zwężony do kolumny 1240 px, bieżący dział pogrubiony, flaga UK przy EN, Rekrutacja w pasku za kreską);
  - odchudzona stopka w jednej linii;
  - kolumna treści `--marg: max(64px, (100% − 1240px)/2)`.
- Trzy nagłówki:
  - okładka strony głównej;
  - baner działu (opcja 4: granat przechodzący w zdjęcie w dwóch kolorach, szkic patrona, notka o patronie, podpis);
  - nagłówek podstrony (głęboki kolor działu ze zdjęciem na całą szerokość, „← Dział”, sygnet z małym podpisem, znak patrona z opisem).
- Boczna nawigacja podstron.
- Zasady położenia sygnetu, podpisu i znaku dokładnie według sekcji „Zasady nagłówka podstrony” w `dok/estetyka.md`. Dotyczy to też wąskich okien poniżej ok. 1500 px.
- Szkice z `szkice/` wstawione jako SVG inline (pełny szkic, sygnet, podpis). Animacje według sekcji „Animacje” w `dok/estetyka.md`:
  - kontur się rysuje, detale się pojawiają, podpis odsłania się maską i kończy razem ze szkicem;
  - na stronie działu animacja tylko przy pierwszym wejściu w wizycie (`sessionStorage`);
  - na podstronach bez animacji;
  - po narysowaniu szkic jest jednolity.

### Etap 3 → gałąź `wyglad/03-strony`
Strony, które mają prototyp. Przenoś je możliwie wiernie, na prawdziwych danych:
- **Strona główna na komputerze:**
  - okładka: blok tytułu z równymi końcami i ciemnym polem po skosie, 4 działy ze szkicami i najechaniem, hamburger z panelem, strzałka „Szybki dostęp”;
  - drugi ekran: pasek „Szybki dostęp”, trzy kolumny z długą trzecią i zamianą FLIP, prelegent po tytule, jeden wzór daty, miniatury aktualności (bez zdjęcia: sygnet działu), blok Studiów z klikalnym „Studiuj matematykę we Wrocławiu ↗”, SIAD jako skrót, stopka.
- **Cztery strony działów:** podstrony w grupach jak w menu, tekst i „W skrócie”, sekcje działu jak w prototypie (Instytut: sukcesy i kontakt; Nauka: projekty i konferencje; Studia: aktualności dla studentów; Popularyzacja: sekcje).
- **Podstrony z prototypu:**
  - Władze: schemat dyrekcji ze zdjęciami;
  - Projekty i granty: paski czasu na wspólnej osi i linia „dziś”;
  - Plan zajęć: kolumny, przyklejony pasek z wyszukiwarką i filtrem dni.
- Liczba konferencji w banerze Nauki liczona automatycznie: data początku w ostatnich 365 dniach, podpis „w ostatnim roku”.

### Etap 4 (tylko jeśli starczy czasu i kredytu) → gałąź `wyglad/04-reszta`
- Pozostałe podstrony komputerowe przenieś na wspólny szablon podstrony: nagłówek, boczna nawigacja, treść bez kafelków, „Następna strona w dziale”. Bez wymyślania nowych detali; te opisane w `dok/estetyka.md` jako propozycje zostaw.
- Przejścia między stronami według sekcji „Przejścia między stronami” (wspólne elementy z `view-transition-name`).
- Usuń stary kod wyglądu komputerowego, którego nic już nie używa. Kodu telefonu nie ruszasz.

## 3. Czego NIE robisz
- Projektu telefonu ani zmian na telefonie.
- Podmenu w pasku (wyłączone 2.11).
- Zmian w konfiguracji CMS i schematach poza opcjonalnymi nowymi polami.
- Nowych zdjęć i nowych ciekawostek. Notki o patronach bierzesz z prototypu i oznaczasz w danych jako „do sprawdzenia”.

## 4. Sprawdzanie po każdym etapie
- `npx astro build` bez błędów. Linki wewnętrzne działają, w tym wersja `/en`.
- Jeśli w środowisku działa przeglądarka (Playwright lub Chromium; jeśli instalacja jest zablokowana, pomiń i napisz to w raporcie):
  - zrzuty nowych stron w 1920×950, 1536×760 i 1366×640, w jasnym i ciemnym motywie;
  - porównanie wzrokowe z prototypem w tej samej rozdzielczości (prototyp otwierasz z `proto/zalozyciele.html`);
  - **telefon 390 px: zrzuty stron przed zmianami (z gałęzi bazowej) i po nich muszą być takie same.**
- Zapisz w raporcie każdą różnicę względem prototypu i jej powód.

## 5. Raport
- Plik `RAPORT-WYGLAD.md` w katalogu głównym ostatniej wypchniętej gałęzi `wyglad/*`, uzupełniany po każdym etapie.
- W raporcie:
  - co zrobione, z nazwami gałęzi i commitów;
  - wynik porównania HTML w etapie 1;
  - podział `scripts/`;
  - różnice względem prototypu;
  - decyzje podjęte samodzielnie;
  - potrzebne zmiany w CMS;
  - czego nie zrobiono i dlaczego.
- Na koniec sesji to samo w skrócie w ostatniej wiadomości.

## 6. Budżet
- Pracujesz na kredycie sesji w chmurze. Najwyżej 3 podagenty naraz, tylko tam, gdzie pliki się nie pokrywają (np. strony działów w etapie 3).
- Jeśli kończy się czas lub kredyt: dokończ bieżący krok, zbuduj, zrób commit, wypchnij i uzupełnij raport. Lepiej mniej etapów skończonych niż wszystkie rozgrzebane.
