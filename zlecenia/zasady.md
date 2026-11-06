# Zasady wspólne dla zleceń 01–07 (strona IM UWr, wersja na telefon)

> **Uwaga (5.11.2026, 10:20): od zlecenia 10 pierwszeństwo ma nagłówek zlecenia.** Ten plik powstał dla zleceń 01–07 (telefon).
> Przy zleceniach 10 i dalszych **nie obowiązują** z niego: gałąź `agent-nauka-podglad` i stan wyjściowy, „nie commituj” (zlecenie samo mówi, czy commitować; pushować nadal tylko po słowie „push” właściciela), „zmiany tylko na telefonie / na komputerze nic się nie zmienia”, „ciemny motyw tylko na telefonie”, zasady akcentu bursztynowego i granic rysunków telefonu.
> **Nadal obowiązują:** nie uruchamiaj `skrypty/pobierz_tresci.py`; każdy nowy tekst ma wersję PL i EN; nowe pola CMS dopisuj do `.przekazanie\pola-do-cms.md`; w `.przekazanie\` zmieniaj tylko `dziennik.md` i `pola-do-cms.md`; dziennik po każdym zleceniu (format niżej); prototypy przenoś porządnie, bez paneli prototypu.

Przeczytaj ten plik przed każdym zleceniem z folderu `.przekazanie\zlecenia\`. Zlecenia przygotowała rozmowa w claude.ai; tam użytkownik omawia koncepcje i akceptuje prototypy. Kod zmieniasz Ty (Claude Code) na komputerze użytkownika.

## Projekt
- Repozytorium: `C:\Users\Szymek\source\Web-Core`, gałąź `agent-nauka-podglad`. Strona jest w Astro 5 z React i jest generowana statycznie.
- Użytkownik ma zwykle uruchomione `npm run dev`.
- Stan wyjściowy: gałąź ma 8 lokalnych, niewypchniętych commitów z poprzednich prac (94bea530 … 235ac2c1, HEAD = 235ac2c1). Nie cofaj ich i nie przepisuj historii.
- `src/data` i `src/content` to lokalna nakładka treści (pliki w `.gitignore`, pochodzą z repozytoriów treści IM-UWr/Web-*).

## Czego nie robić
- **Nie commituj i nie pushuj.** Zmiany zostają w drzewie roboczym. O commitach decyduje użytkownik.
- Nie uruchamiaj `skrypty/pobierz_tresci.py`, bo nadpisze lokalne teksty w nakładce.
- Nie dodawaj zależności npm bez potrzeby. Jeśli jakaś jest niezbędna, opisz ją w dzienniku.
- W folderze `.przekazanie\` zmieniaj tylko `dziennik.md` i `pola-do-cms.md`.

## Telefon i komputer
- Zmiany dotyczą **telefonu (≤ 760 px)**. Do rozdzielania służą klasy `.tylko-telefon` i `.tylko-komputer` oraz media query `max-width: 760px` (style telefonu są w `src/styles/telefon.css`, `portal.css` i `uklad-portal.css`).
- **Na komputerze (≥ 761 px) nic się nie zmienia**, chyba że zlecenie mówi inaczej. To jest kryterium odbioru każdego zlecenia: porównaj HTML i style stron przed zmianą i po niej, albo zrzuty przy 1280 px, jeśli masz jak je zrobić.
- **Jeden bursztynowy akcent na ekran.**
  - Na telefonie akcentem jest krótkie hasło pod tytułem banera (`.ph-haslo`, kolor `var(--accent)`). Rysunek w banerze jest na telefonie szaro-biały i słabo widoczny.
  - Na komputerze akcentem jest rysunek w banerze.
- Strona ma tryb jasny i ciemny. Ciemny („stalowy granat”, tokeny `--znacznik*`) działa tylko na telefonie. Baner jest zawsze granatowy.

## Teksty i dane
- Strona ma wersję PL i EN. Każdy nowy tekst musi mieć wersję angielską: pola `*_en` albo `T('…', '…')` / `i18n.ts`. Tłumaczenie może być robocze; użytkownik poprawi je później.
- Liczby w banerach liczą się **automatycznie przy budowie** z danych strony. Rzeczownik ma poprawną odmianę po liczebniku (`odmiana()` w `src/lib/i18n.ts`), a jednoliterowe wyrazy są sklejone twardą spacją (`bezSierotek()`). Pozycje z zerem się pomija, jak w `src/components/LiczbyBanera.astro`. Liczby nie są klikalne.
- **Hasła są robocze** i muszą być w danych, nie w kodzie, żeby redaktorzy mogli je zmienić w Pages CMS:
  - pole `haslo` / `haslo_en` w pliku danych strony, w nakładce `src/data` albo we front matter w `src/content`;
  - każde nowe pole dopisz do `.przekazanie\pola-do-cms.md` (plik, repozytorium treści, pole, przykład). Przy „push” rozmowa dopisze je do `.pages.yml`.
- Obsługa braku pola: gdy `haslo` jest puste, obowiązuje reguła podana w zleceniu (np. nazwa zakładu). Bez reguły zostaje dzisiejszy wygląd.

## Prototypy
- Źródła prototypów są w `.przekazanie\prototypy\` jako samodzielne pliki HTML. Otwórz je w przeglądarce, żeby zobaczyć zachowanie, i czytaj ich kod: logika rysunków jest w `<script>`, a obrazy i krój są wpisane jako data URI.
- Prototypy są wzorem wyglądu i ruchu. Kod przenieś porządnie: bez przełączników i panelu prototypu, w strukturze projektu.

## Dziennik (obowiązkowy)
Po każdym zleceniu dopisz na końcu `.przekazanie\dziennik.md` (utwórz plik, jeśli go nie ma) sekcję:

```
## NN-nazwa — RRRR-MM-DD GG:MM
Status: zrobione | częściowo | wstrzymane (dlaczego)
Zmienione pliki: (lista ścieżek; nowe pliki oznacz „nowy”)
Kryteria odbioru: (każde kryterium ze zlecenia: spełnione / niespełnione + jak sprawdzone)
Odstępstwa od zlecenia i powody:
Pytania do użytkownika:
```

Pisz po polsku, zwięźle. Wynik sprawdzi potem rozmowa w claude.ai: przeczyta dziennik i zmiany w repozytorium, zbuduje stronę w chmurze i zrobi zrzuty.

## Kolejność
**01 i 02 w dowolnej kolejności, ale nie jednocześnie** (oba zmieniają `NaglowekStrony.astro`). **03, 04 i 05 dopiero po obu**, w dowolnej kolejności, bo potrzebują nowych banerów podstron (01) i silnika animacji (02). Strony głównej nie zmieniaj w zleceniach 01–05. **Zlecenie 06 (strona główna B2)** to wyjątek (decyzja użytkownika 31.10, 23:36): rób je po 01, nie równolegle z innym zleceniem. **Zlecenie 07 (granice rysunków)** rób po 01, a przed 03–05.

## Granice rysunków w banerach (od zlecenia 07, decyzja 31.10, 23:52)
Każdy rysunek w banerze telefonu mieści się w polu `y0`–`y1` z silnika: od dołu paska menu + 6 px do **połowy wysokości hasła**. Nie wchodzi między linie tekstu (link, nadtytuł, tytuł i hasło tworzą jedną bryłę) ani pod hasło. Prototypy 03–05 rysowano w starym polu, do kreski nad liczbami. Przy przenoszeniu motyw najpierw przesuń w górę, a jeśli to nie wystarczy, lekko go zmniejsz (kształty proporcjonalnie, wykresy wolno spłaszczyć w pionie). Nie polegaj na ucinaniu przez maskę.
