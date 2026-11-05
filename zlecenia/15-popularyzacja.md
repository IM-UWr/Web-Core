# Zlecenie 15: przebudowa Popularyzacji (GOTOWE, 5.11.2026, 12:25)

Stan: **GOTOWE do wykonania — po zleceniu 14.**
Decyzje właściciela: 5.11, 10:37–11:36 (godziny przy punktach). Popularyzacja dostaje ten sam układ co pozostałe działy: opowieść z „W skrócie”, liczby w banerze, menu „wiersze na pasie” i prawdziwe podstrony zamiast „To be announced”.

**Wzór:** prototyp `proto/zalozyciele.src.html` na gałęzi `kopia/2026-11-01-estetyka-prototypy` (artefakt https://claude.ai/artifact/UuuZUa4ByC4AEYWEkrhibv, wersja 90 lub nowsza; czytaj przez `git show origin/kopia/2026-11-01-estetyka-prototypy:<ścieżka>`). W prototypie: widok „Strona działu”, dział Popularyzacja, tekst „opowieść”; podstrony w grupie przełączników „Podstrona Popularyzacji”. Dane w kodzie prototypu:
- `POP_OP`: hasło, wstęp, tytuł i pięć akapitów opowieści, „W skrócie” (`skrot`), lata tradycji (`tradycja`);
- `popLata()`: liczby w banerze (lata liczone od roku założenia, z odmianą);
- `IN_GRUPY.popularyzacja`: menu działu;
- `POP_POD`, `trescPop()`, `popPoz()`, `POP_U`: treść czterech podstron i adresy;
- karty „Dla kogo”: w `htmlReszta()` gałąź `popTekst === 'opowiesc'`.

**Materiał źródłowy** (gałąź kopii): `popularyzacja/inwentarz/INWENTARZ.md` (spis oferty: 47 pozycji, źródła, daty sprawdzenia, co aktualne) i `popularyzacja/tekst/TEKST.md` (wcześniejszy tekst agenta ze źródłami i listą wątpliwości). Fakty bierz z prototypu; przy wątpliwościach sprawdzaj w spisie oferty.

**Gdzie i jak pracować**
- Baza: gałąź `wyglad/zlecenie-14` po zakończeniu zlecenia 14. Nowa gałąź: `git switch -c wyglad/zlecenie-15` w głównym folderze `C:\Users\Szymek\source\Web-Core`.
- Commit po każdym punkcie. **Bez pushowania**, dopóki właściciel nie napisze „push”. **Nie uruchamiaj `skrypty/pobierz_tresci.py`.** Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-15.md`.
- **Treści to łatki, nie zmiany nakładki na stałe.** Teksty, menu i nowe strony leżą w repozytoriach treści (nakładka `src/data`, `src/content`, `public/pliki` jest poza gitem Web-Core). Przed zmianą pliku nakładki skopiuj oryginał do `.przekazanie\robocze\nakladka-przed-15\` (ta sama ścieżka). Zmieniaj nakładkę lokalnie, żeby budować i robić zrzuty. Na koniec zapisz różnice jako łatki `dok/latki/zlecenie-15/<Repozytorium>.patch` (jak `dok/en/latki/`), razem ze zmianami formularza CMS (`.pages.yml` repozytorium). Nowe pliki też idą do łatki. Repozytorium pliku ustal z `tresci.json` (np. `src/data/popularyzacja.json` i strony Popularyzacji: `Web-Popularyzacja`; `nawigacja.json`: sprawdź, które repozytorium go zawiera). Jeśli nie da się tego ustalić, napisz w raporcie. Nakładki z oryginałów **nie przywracaj** (właściciel chce oglądać wynik lokalnie), ale w raporcie podaj, jak ją przywrócić.
- Zmiany kodu (schemat, widoki, style) normalnie w commitach Web-Core.
- Po każdym punkcie: `npm run build`, zrzuty 1440 i 1920 px oraz telefon 390 px, jasny i ciemny motyw, PL i EN.

## Zakres

### 1. Dane i formularz CMS
- `src/data/popularyzacja.json` (formularz działu w CMS) dostaje pola na wzór `src/data/dzialy/instytut.json` i `studia.json`:
  - `haslo` / `haslo_en`: **„Matematyka dla wszystkich ciekawych”** / **„Mathematics for the curious”** (decyzje 5.11, 10:37–11:02). Jedno pole dla okładki, banera działu i menu telefonu (dziś „Matematyka dla uczniów i nauczycieli”);
  - `wstep` / `wstep_en`: z `POP_OP.wstep` (opis do `<meta description>` i tam, gdzie inne działy pokazują wstęp);
  - `o_popularyzacji` / `o_popularyzacji_en`: pięć akapitów z `POP_OP.tekst` (akapity oddzielone pustą linią jak w `o_studiach`). **Popraw literówkę:** w drugim akapicie „w roku szkolnym,, na które” → „w roku szkolnym, na które”;
  - `o_popularyzacji_fakty`: „W skrócie” z `POP_OP.skrot`, ten sam kształt co `o_studiach_fakty` (`wartosc`, `wartosc_en`, `opis`, `opis_en`): **Okulary 3D · Od 3. klasy · 4 miasta · 11–15 godzin** (decyzje 5.11, 10:37–11:02; „Od 3. klasy” zamiast „Od 1989”, bo rok jest już w liczbach);
  - `tradycja`: lista `{ rok, nazwa, nazwa_en }`: 1989 Zimowych Szkół, 1991 Spotkań Matematycznych, 2003 Marszy na Orientację (dopełniacz, bo liczba stoi przed nazwą: „37 lat Zimowych Szkół”). EN np. „37 years of Winter Schools”.
- Typy w `src/lib/widoki/popularyzacja.ts` (typ `Dane`) i formularz w `.pages.yml` repozytorium treści (łatka).
- Pole `grupy` (dziś cztery puste grupy, z których bierze się „To be announced”) przestaje być używane. Usunięcie go z formularza zaproponuj w łatce i opisz.

### 2. Strona działu
- **Baner:** hasło jak wyżej. Liczby: lata tradycji liczone przy budowie (rok bieżący − `rok`, odmiana: 1 rok / 2–4 lata / 5+ lat; w 2026: 37 lat Zimowych Szkół, 35 lat Spotkań Matematycznych, 23 lata Marszy na Orientację). Zasada z zalecenia 2 bez zmian: jeden rząd, przed notką o patronie (odstęp 20 px), nadmiarowe znikają w całości od końca. Liczby „TBA” znikają.
- **Treść** w tym samym układzie i komponentach co „O Instytucie” i „O studiach” (`TrescDzialu.astro`): tytuł „O popularyzacji” / „About outreach”, pięć akapitów (pierwszy w kolorze nagłówków), obok „W skrócie”.
- **Sekcja „Dla kogo”** pod treścią: cztery karty jak w prototypie (`.in-kart`): nad tytułem nazwa podstrony, tytuł jako link do podstrony, jedno zdanie opisu:
  - Dla uczniów — „Kółka, obozy i zawody” — „Kółka w soboty od 3. klasy, Zimowe Szkoły i Letni Obóz, kilkanaście konkursów w roku szkolnym.”;
  - Dla nauczycieli — „Seminarium, studia, wyjazdy” — „Seminarium I³ co wtorek, studia podyplomowe, Poznajemy Matematyczną Europę.”;
  - Dla wszystkich — „Wykłady, festiwal, zawody” — „Wrocławskie Spotkania, Dolnośląski Festiwal Nauki, zawody dla dorosłych i rodzin.”;
  - Organizatorzy — „Kto to robi” — „Fundacja Matematyków Wrocławskich, Portal, PTM i Pracownia Dydaktyki.”
  
  Dane kart najlepiej z nagłówka stron (punkt 4): nazwa = `tytul`, tytuł karty = `haslo`, opis = `opis`. Wtedy nowa strona sama dostaje kartę.
- Sekcje „To be announced” znikają.

### 3. Menu działu i hamburger
- Menu działu w wariancie E („wiersze na pasie”, zalecenie 5 zlecenia 11), jak w pozostałych działach (decyzja 5.11, 10:37):
  - wiersz **„Dla kogo”** (EN „Who it’s for”): Dla uczniów · Dla nauczycieli · Dla wszystkich (EN: For pupils · For teachers · For everyone);
  - wiersz **„Partnerzy”**: Fundacja Matematyków Wrocławskich ↗ · Wrocławski Portal Matematyczny ↗ · Wrocławski Oddział PTM ↗ (z domeną jako podpisem, jak dziś).
- **Organizatorzy nie ma w menu** (decyzja 5.11, 11:36: „Z menu popularyzacji wywal organizatorów”). Strona istnieje i prowadzą do niej karta „Dla kogo” oraz link „Kto prowadzi popularyzację →” na stronie Dla nauczycieli.
- Zmiana w `nawigacja.json` (łatka): grupa „Dla kogo” przed „Partnerami”. Panel hamburgera (zalecenie 24) i „Następna strona” biorą to samo menu: „Następna strona” pomija linki zewnętrzne.

### 4. Cztery podstrony
- Strony Markdown w kolekcji `strony` (np. `src/content/strony/popularyzacja/uczniowie.md`, `nauczyciele.md`, `wszyscy.md`, `organizatorzy.md`; adresy `/popularyzacja/<slug>` i `/en/popularyzacja/<slug>`, jak inne strony działów). Nagłówek: `tytul`, `tytul_en`, `haslo`, `haslo_en`, `opis`, `opis_en`, `tresc_en`, a treść polska w treści pliku.
- Treść 1:1 z prototypu (`trescPop()`), w **wzorcu treści** z zalecenia 14 zlecenia 11: sekcje `##`, podsekcje `###`, listy, tabela kalendarza („Kiedy · Co · Dla kogo”), pozycje dwukolumnowe (`ul.dwa` → „cechy”), ścieżka etapów, ramka uwagi (`>`), kontakty. Użyj tych samych konstrukcji Markdown co strony już przeniesione na wzorzec (np. Szkoła doktorska, Pierwszy rok). Jeśli któryś blok nie ma odpowiednika, użyj najbliższego i opisz to w raporcie.
  - **Dla uczniów:** Matematyka po lekcjach · Regularnie: kółka matematyczne · Obozy · Rok szkolny w skrócie: zawody i konkursy · Wykłady: Wrocławskie Spotkania Matematyczne · Do samodzielnej pracy · Jak zacząć · Dla rodziców.
  - **Dla nauczycieli:** Dla nauczycieli matematyki · Rok szkolny nauczyciela matematyki · Dla Twoich uczniów · Przyszli nauczyciele.
  - **Dla wszystkich:** Matematyka bez egzaminów · Rok w skrócie · Zawody, w których startują dorośli i rodziny · Do czytania.
  - **Organizatorzy:** Kto to robi · Partnerzy · W Instytucie · Chcesz pomóc?
- Wszystkie linki z `POP_U` zostają. Linki zewnętrzne otwierają się w tej samej karcie i dostają ↗ automatycznie (zalecenie 23; w prototypie jest jeszcze `target="_blank"`, tego nie przenoś).
- Ramek „Do potwierdzenia” z prototypu **nie przenoś na stronę**: ich treść idzie do raportu (niżej).
- Ciekawostki Steinhausa przypisane do tych podstron (pole `podstrona` w `src/data/ciekawostki/popularyzacja.json`) pokazują się jak na innych podstronach (zalecenie 19). Ciekawostki mają dziś `podstrona`: Dla uczniów (7), Dla nauczycieli (5), Dla wszystkich (9), Organizatorzy (5), „zapas” (5) — nazwy muszą pasować do `tytul` stron.

### 5. Wersja angielska
- Wszystko także po angielsku (zasada z zalecenia 12): hasło jak wyżej, opowieść, „W skrócie”, karty, menu, cztery podstrony, lata tradycji. Tłumaczenie robisz Ty. W raporcie oznacz je jako „do przejrzenia” i wypisz terminy, przy których się wahałeś (np. nazwy konkursów i obozów: zostaw polskie nazwy własne, a w nawiasie dodaj krótkie objaśnienie po angielsku).

### 6. Do potwierdzenia przez właściciela (do raportu, nie na stronę)
Łatki treści nałoży właściciel dopiero po sprawdzeniu tych punktów:
1. **Okulary 3D:** czy czerwono-zielone okulary były w kieszeni **polskiego** pierwszego wydania „Kalejdoskopu matematycznego” (1938). Agent potwierdził je tylko dla wydania angielskiego. Od tego zależy pierwsza pozycja „W skrócie” i zdanie w pierwszym akapicie.
2. **Wrocławskie Spotkania Matematyczne:** od 1991 czy od 1993 roku (liczba lat w banerze).
3. **Seminarium I³:** czy nadal działa i czy „co wtorek”.
4. **Kurs „Dyskalkulia – Pomocy!”:** ostatnia potwierdzona edycja 2023; czy będzie nabór w 2026/27.
5. **Wrocławski Portal Matematyczny:** czy jest jeszcze aktualizowany (zapowiedzi na stronie głównej wyglądają na sezon 2022/23).
6. **Daty zawodów** zmieniają się co rok (stan z 5.11.2026). Etapy OM i OMJ w Instytucie potwierdzają ogłoszenia z 2019 i 2024.
Przy każdym punkcie podaj w raporcie źródło ze spisu oferty i miejsce w treści, które od niego zależy.

## Kryteria odbioru
- Strona działu i cztery podstrony w PL i EN wyglądają jak w prototypie (zrzuty obok siebie w raporcie), bez „To be announced” i bez liczb „TBA”.
- Hasło „Matematyka dla wszystkich ciekawych” na okładce, w banerze i w menu telefonu.
- Menu działu, panel hamburgera i „Następna strona” bez Organizatorów. Do Organizatorów prowadzą karta i link.
- Łatki treści w `dok/latki/zlecenie-15/` z opisem, kopia oryginałów w `.przekazanie\robocze\nakladka-przed-15\`, lista „do potwierdzenia” w raporcie, `astro check` bez nowych błędów.
