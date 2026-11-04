# Zlecenie 12: przebudowa i porządki — jedna wersja strony, telefon w nowym wyglądzie (praca nocna w chmurze, 4–5.11.2026)

Pracujesz sam, bez nadzoru. Nikt nie odpowie na pytania. Jeśli coś jest niejasne, wybierz najbezpieczniejszą wersję zgodną z ustaleniami, zapisz decyzję w raporcie i pracuj dalej.

## 0. O co chodzi
Na gałęzi `wyglad/zalozyciele` jest dziś **hybryda**. Każda przeniesiona strona ma w HTML dwie wersje:
- **dotychczasową** (telefon i wyszukiwarka Pagefind);
- **nową** (komputer, bloki `.tylko-komputer`).

Dotychczasową na komputerze chowają reguły w rodzaju `body:has(.z-pd > .z-pl) main > :not(...) { display: none }`. Nowy blok stoi w HTML po starym, więc w trakcie wczytywania widać przez chwilę starą wersję (np. okrągłe przyciski semestrów na Planie zajęć). Plan zajęć jest w HTML dwa razy.

**Decyzja właściciela (4.11, 22:22–22:27):** telefon dostaje nowy wygląd, a stary wygląd idzie do kosza. Bazą telefonu jest próbna wersja z łatki `telefon-TEST.patch` (podgląd: https://im-uwr.github.io/Web-Podglad/test-telefon/).
- To zlecenie **znosi zakaz** z pliku `TEST-TELEFON.md` w łatce („nie wzorować się, nie nakładać”), ale **tylko dla tej gałęzi**.
- Punkt 4 zlecenia 10 („telefon bez zmian”) **już nie obowiązuje**.

**Cel:** każda strona ma jedną wersję HTML, która dopasowuje się do szerokości ekranu: komputer ≥ 761 px, telefon ≤ 760 px. Stary kod wyglądu jest usunięty.

## 1. Źródła
Pliki z gałęzi `origin/kopia/2026-11-01-estetyka-prototypy`. Czytasz je przez `git fetch origin kopia/2026-11-01-estetyka-prototypy` i `git show origin/kopia/2026-11-01-estetyka-prototypy:ŚCIEŻKA`. Tej gałęzi nie scalasz.
- `zlecenia/12-zalaczniki/telefon-TEST.patch` — łatka telefonu (nakłada się czysto na `d12c994`). Opis zmian jest w pliku `TEST-TELEFON.md` wewnątrz łatki.
- `dok/estetyka.md` — specyfikacja wyglądu; w razie sprzeczności ma pierwszeństwo.
- `proto/zalozyciele.src.html` — prototyp. Gotowy `proto/zalozyciele.html` otwiera się w przeglądarce. Panel przełączników i skalowanie to narzędzia prototypu; obowiązują ustawienia domyślne.
- `zlecenia/11-poprawki-i-podstrony.md` — **z niego wykonujesz tylko zalecenie 3** (nawigacja podstron, etap 2 niżej). Zalecenia 1 i 2 i ewentualne dalsze **pomijasz**: to zlecenie jest jeszcze w przygotowaniu.
- `zlecenia/10-wyglad-zalozyciele-noc.md` — poprzednia noc. Zasady z punktów 1.2–1.9 obowiązują dalej, poza „telefon bez zmian”.
- Na gałęzi `wyglad/zalozyciele`: `RAPORT-WYGLAD.md` (co jest zrobione, podział `src/scripts/`, lista podstron nieprzeniesionych) i `PYTANIA.md`.

## 2. Twarde zasady
1. **Gałąź robocza: `wyglad/porzadki`.** Założona z `wyglad/zalozyciele` (`d12c994`). Push wyłącznie na `wyglad/porzadki` i gałęzie etapów `wyglad/porzadki-01-telefon`, `wyglad/porzadki-02-szablon` itd.
   - Nigdy na `main`, `wyglad/zalozyciele`, `agent-nauka-podglad` ani `kopia/*`.
   - Bez force-push i bez scalania.
2. **Nie uruchamiaj `skrypty/pobierz_tresci.py`.** Budujesz na treściach, które są w repozytorium.
3. **Danych, treści i konfiguracji CMS nie zmieniasz.** Nowe pola tylko opcjonalnie i tylko dodawane; potrzebne zmiany w CMS wypisujesz w raporcie.
4. **Wygląd komputera się nie zmienia** poza nawigacją podstron z etapu 2 i przeniesieniem podstron z etapu 3. Pozostałe strony mają być co do piksela takie same jak na `wyglad/zalozyciele` (punkt 4).
5. **Nowych detali nie wymyślasz.** Propozycje z `dok/estetyka.md` („Proponowane detale innych podstron”: indeks A–Ż, przekrój budynku, kalendarium, siatka tygodnia…) zostają propozycjami.
6. **`/en` działa.** Bez JS wszystko jest czytelne. Przy `prefers-reduced-motion` nie ma ruchu. Ozdobne SVG mają `aria-hidden="true"`. Fokus i klawiatura działają.
7. Commity po polsku, krótkie. Każdy etap kończysz udanym `npm run build`, commitem i pushem gałęzi etapu.

## 3. Etapy (w tej kolejności; każdy etap = gałąź oparta na poprzedniej)

### Etap 0 → bez gałęzi, tylko wzorce do porównań
- Zbuduj `wyglad/zalozyciele` (`npm ci`, `npm run build`).
- Zrób zrzuty wzorcowe komputera: 1920×950, 1536×760, 1366×640, jasny i ciemny motyw. Strony:
  - główna;
  - 4 strony działów;
  - Władze, Projekty i granty, Plan zajęć;
  - jedna strona tekstowa (np. Kontakt);
  - wszystkie podstrony z listy w etapie 3;
  - wersje `/en` głównej i jednego działu.
- Nałóż łatkę (`git apply`) i zbuduj ponownie. Zrób zrzuty telefonu 390×844 tych samych stron (wzorzec telefonu). Potem cofnij łatkę.
- Zapisz rozmiary przed porządkami: suma CSS i JS w `dist/_astro`, rozmiar HTML Planu zajęć i strony głównej, liczba plików w `src/styles`, `src/scripts`, `src/components`.

### Etap 1 → `wyglad/porzadki-01-telefon`: telefon z łatki jako prawdziwa wersja, jedna wersja HTML na stronach już przeniesionych
- **Przenieś zawartość łatki do kodu jako docelowy telefon:**
  - `zal-telefon-TEST.css` → np. `src/styles/zal-telefon.css`;
  - usuń plakietkę TEST, komentarze „TEST telefonu” i plik `TEST-TELEFON.md`;
  - klasa `z-tel` przestaje być potrzebna, gdy blok jest jedyną wersją.
- **Na stronach, które mają już nowy wygląd, usuń dotychczasową wersję z HTML.** Zostaje jeden blok, widoczny na każdej szerokości, bez `.tylko-komputer` / `.tylko-telefon`. Strony:
  - główna (okładka, drugi ekran);
  - 4 strony działów;
  - nagłówki wszystkich podstron (baner `.ph` / `.page-head` → `NaglowekZ`);
  - menu i stopka;
  - Władze, Projekty i granty, Plan zajęć;
  - strony tekstowe (`Strona.astro`).
- Usuń reguły chowające (`body:has(...) ... { display: none }`) dla tych stron.
- **Telefon na stronach, których nie ma w łatce:** prosta wersja w jednej kolumnie, w tym samym stylu co łatka (kolory, kroje, nagłówek podstrony). Zapisz decyzje w raporcie, właściciel oceni je rano.
  - **Plan zajęć:**
    - przedmiot jako blok: nazwa Brygadą, pod nią wiersze zajęć w dwóch liniach („wyk. · gr. 1 · pon. 10:15–12:00 · HS” / prowadzący, uwagi);
    - pasek u góry przyklejony: semestr i wyszukiwarka w jednym rzędzie, dni w drugim;
    - spis kategorii zwijany nad planem (jak dotychczasowe `SpisTresci` w wariancie `gora`).
  - **Projekty i granty:** wiersz projektu w jednej kolumnie, pasek czasu pod tytułem na pełną szerokość z osią lat nad listą.
  - **Strony tekstowe:** treść w jednej kolumnie, spis „Na tej stronie” zwijany nad treścią.
- **Wyszukiwarka Pagefind:** dziś indeksuje starą treść, a nowe bloki mają `data-pagefind-ignore`. Po usunięciu starej wersji indeksowana ma być nowa treść: `data-pagefind-ignore` tylko na nawigacji, ozdobach, szkicach i powtórzeniach.
  - Sprawdź, że wyszukiwarka znajduje: przedmiot z planu, nazwisko z Władz, tytuł projektu, słowo ze strony tekstowej.
- **Sprawdzenie:**
  - komputer: zrzuty identyczne z wzorcem z etapu 0;
  - telefon na stronach z łatki: identyczny z wzorcem łatki (poza plakietką);
  - przy wczytywaniu nie miga żadna stara wersja: zrzut zaraz po `domcontentloaded` przy spowolnionym połączeniu na Planie zajęć.

### Etap 2 → `wyglad/porzadki-02-szablon`: wspólny szablon podstrony z nową nawigacją
- Wykonaj **zalecenie 3 ze zlecenia 11** w całości (decyzja 4.11):
  - na komputerze bez listy podstron działu z lewej (`BocznaNawigacja`);
  - „Na tej stronie” z prawej w wariancie „kreska”, przyklejony;
  - scrollspy, płynne przewinięcie, krótkie etykiety kategorii planu;
  - kategorie ukryte filtrem znikają ze spisu;
  - strony z mniej niż 2 sekcjami bez spisu, przy stałej szerokości treści.
  
  Wzór: prototyp, ustawienie domyślne „Nawigacja na podstronie: A”.
- Zrób z tego **jeden komponent szablonu podstrony** dla Władz, Projektów, Planu, stron tekstowych i wszystkich stron z etapu 3: nagłówek, treść, spis z prawej, „Następna strona w dziale”.
  - Zastępuje własne spisy w widokach (`SpisTresci` w wariancie `bok`, `z-bok-spis`, spisy w `ListaGrantow`, `ListaKonferencji`, `ListaSukcesow`, `PlanZajec`).
  - Na telefonie spis zwijany nad treścią.
- Sygnet w bocznej nawigacji (pytanie z `PYTANIA.md`) odpada razem z listą podstron.
- **Sprawdzenie:** Władze, Projekty, Plan i strona tekstowa porównane wzrokowo z prototypem w 1920 i 1366 px. Różnice względem zrzutów z etapu 0 tylko w kolumnach (brak listy z lewej, spis z prawej).

### Etap 3 → `wyglad/porzadki-03-podstrony`: pozostałe podstrony na wspólny szablon (komputer i telefon)
Mają dziś nowy nagłówek, ale dotychczasowy układ treści. Przenieś je na szablon z etapu 2, po jednej stronie na commit, w tej kolejności (najważniejsze najpierw):
1. Pracownicy
2. Struktura i zakłady, zakład
3. Seminaria, seminarium
4. Aktualności (lista), pojedyncza aktualność, Kalendarz
5. Rok akademicki, kierunek, specjalność
6. Konferencje, Obrony i obrona, Publikacje i rocznik, Sukcesy, grant
7. Warto wiedzieć (lista i wpis)

Zasady:
- Zakres danych i funkcje bez zmian (filtry, wyszukiwarki, przełączniki działają jak dziś).
- Wygląd w języku Władz, Projektów i Planu:
  - treść bez kafelków, pasów i cieni;
  - nagłówki sekcji Brygadą w kolorze działu;
  - listy z cienkimi liniami;
  - typografia i odstępy z `zalozyciele.css`;
  - jeden wzór daty.
- **Strony poza działami** (Aktualności, Kalendarz, pojedyncza aktualność) mają granatowy nagłówek i nie należą do działu. Spis z prawej mają tylko wtedy, gdy mają sekcje.
- Każda strona w jednej wersji HTML, z telefonem w jednej kolumnie.
- **Jeśli kończy się czas lub kredyt:** dokończ bieżącą stronę i przejdź do etapu 4 z tym, co jest. Strony nieprzeniesione zostają w dotychczasowym układzie i wypisujesz je w raporcie.

### Etap 4 → `wyglad/porzadki` (gałąź końcowa): usunięcie starego kodu
- **Usuń wszystko, czego nic już nie używa.** Kandydaci:
  - style: `telefon.css`, `portal.css`, `uklad-portal.css`, `uklad-zwarta.css`, `tlo.css`, `plan.css`, nieużywane części `global.css`;
  - komponenty starego banera i starych układów (`NaglowekStrony.astro`, `LiczbyBanera.astro`, stary `SpisTresci` w wariancie `bok`, `Wstecz`…);
  - klasy `.tylko-komputer` / `.tylko-telefon`;
  - przełączniki wariantów układu (`uklad="zwarta portal-baner"`, `skrypty/warianty.py`, jeśli nic poza starym wyglądem z nich nie korzysta).
- **Wyjątek: silnik animacji banerów zostaje w repozytorium** (decyzja właściciela 4.11, 22:30), choć nowy wygląd go nie używa:
  - zostają bez zmian `src/scripts/baner/` (silnik, 36 motywów), `src/lib/motywyBanerow.ts` i dane „animacji banera” w `src/lib/widoki/*` (np. `pracownicy.ts`, `listaZakladow.ts`);
  - nic go nie importuje, więc nie trafia do zbudowanej strony; build i `astro check` mają przechodzić;
  - style, którymi stary baner obsługiwał silnik (z `telefon.css`: maska, `.ph-anim-gra`, pole rysunku), przenieś do jednego niepodpiętego pliku obok silnika, np. `src/scripts/baner/baner.css`;
  - dopisz `src/scripts/baner/README.md`: do czego służył, od kiedy jest nieużywany i jak go podpiąć do banera (atrybut `data-animacja`, potrzebne elementy, mapa stron i motywów);
  - animacja szkiców patronów (`src/scripts/zal/szkice.ts`) to osobna rzecz i działa dalej.
- **Przed usunięciem każdego pliku** sprawdź użycia (`grep`) i workflowy w `.github/` (`plan-zajec.yml`, `qa.yml`, `sprawdz-galaz.yml`). Czego nie da się bezpiecznie usunąć, to zostaw i wypisz w raporcie z powodem.
- **Zostaje bez zmian:**
  - warstwa danych (`src/lib/`, `src/lib/widoki/`, `src/data/`, `src/content/`, `content.config.ts`);
  - skrypty treści i planu;
  - przekierowania, RSS, ICS, wersja `/en`;
  - workflowy.
- Strony nieprzeniesione w etapie 3 mogą zatrzymać potrzebne im stare style. Wtedy zostaw tylko te reguły, oznacz je komentarzem „do usunięcia po przeniesieniu <strona>” i wypisz w raporcie.
- **Sprawdzenie:**
  - `npm run build` bez błędów i ostrzeżeń o brakujących importach;
  - linki wewnętrzne i `/en` działają; jeśli się da, uruchom `.github/qa/qa.py` lokalnie, a jeśli brakuje narzędzi, pomiń i napisz to w raporcie;
  - komputer: strony nieruszane w etapach 2–3 identyczne z wzorcem;
  - telefon: strony z łatki identyczne z wzorcem łatki;
  - rozmiary po porządkach (to samo co w etapie 0).

## 4. Zrzuty i porównania
- Playwright i Chromium są w środowisku. Porównanie pikselowe np. przez `pixelmatch` albo porównanie PNG w Pythonie (PIL). Animacje przy zrzutach wyłączone (`reducedMotion: 'reduce'`), sesja z ustawionym pierwszym wejściem, stała data, jeśli strona ją pokazuje.
- Różnica na stronie, która miała zostać bez zmian, to błąd do poprawienia, nie do opisania. Wyjątek: różnica nie do uniknięcia, np. kolejność ładowania fontu. Wtedy opisz ją w raporcie ze zrzutem.
- Zrzuty porównań (przed / po / różnica) zapisz w `raport-zrzuty/` na gałęzi końcowej. Tylko te z różnicami i po jednym przykładowym na typ strony; reszta jako lista „identyczne”.

## 5. Raport
- Plik `RAPORT-PORZADKI.md` w katalogu głównym ostatniej wypchniętej gałęzi `wyglad/porzadki*`, uzupełniany po każdym etapie.
- W raporcie:
  - co zrobione, z gałęziami i commitami;
  - wyniki porównań zrzutów;
  - decyzje podjęte samodzielnie, zwłaszcza wygląd telefonu na stronach spoza łatki;
  - usunięte pliki i rozmiary przed i po;
  - czego nie usunięto i dlaczego;
  - strony nieprzeniesione;
  - potrzebne zmiany w CMS.
- Pytania do właściciela dopisuj do `PYTANIA.md` (nowa sekcja „Zlecenie 12”).
- Na koniec sesji to samo w skrócie w ostatniej wiadomości.

## 6. Budżet
- Kredyt sesji w chmurze wygasa 5.11 o 8:59 czasu polskiego. Pracuj tak, żeby przed 8:30 wszystko było wypchnięte.
- Najwyżej 3 podagenty naraz, tylko tam, gdzie pliki się nie pokrywają (np. różne podstrony w etapie 3).
- **Kolejność ważności:** etap 1 > etap 4 dla tego, co już jest jednowersyjne > etap 2 > etap 3. Jeśli widzisz, że nie zdążysz, po etapie 1 zrób najpierw etap 4 (sprzątanie tego, co da się usunąć), a potem wróć do etapów 2 i 3.
- Jeśli kończy się czas lub kredyt: dokończ bieżący krok, zbuduj, zrób commit, wypchnij, uzupełnij raport. Lepiej mniej etapów skończonych niż wszystkie rozgrzebane.
