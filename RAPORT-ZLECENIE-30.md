# Raport: zlecenie 30 — teksty działów i stron z listą w „Stronach”, porządek formularzy, bez wyróżnień aktualności (7.11.2026)

## Zlecenia 28–30 w skrócie

**Zrobione.**
- 28: każdy kierunek to jeden Markdown (Treść i Treść EN) plus plik „Baner”, przypomnienia o terminach z pliku, lista kierunków w Ustawieniach.
- 29: specjalności i strona działu Popularyzacja jako Markdown, jeden szablon formularza specjalności.
- 30: teksty stron działów Instytut, Nauka i Studia oraz 11 stron z listą przeszły z Web-Ustawienia do repozytoriów działów. Formularze mają tekst na górze. Nie ma już wyróżniania aktualności.
- Porównania przed/po bez niedozwolonych różnic, kontrole czyste.
- 28 i 29 wypchnięte o 14:37, 30 — po słowie „push” (sekcja „Push i podgląd”).

**Przyjęte bez pytania (30).**
- Kolekcja „Strony” w Web-Instytut i Web-Nauka ma ścieżkę `src/content/strony` (dotąd `…/strony/instytut` i `…/strony/nauka`). Dzięki temu wpis strony z listą leży pod jej adresem, np. `seminaria.md`.
- „Kolejność” zakładu i wpisu „Warto wiedzieć” stoi pod grupą „Karta”, a nie w niej, bo nie jest częścią karty. „Hasło” zakładu jest w Karcie, bo karta je pokazuje.
- Pola `haslo_podstron` / `haslo_podstron_en` (hasło podstron wpisów) przeszły z kodu do „Stron” Nauki i Aktualności, jak reszta tekstów strony.
- Dwie poprawki z symulacji zapisu w edytorze (sekcja „Zapis w edytorze”). Pierwsza: wtyczka wzorów działa teraz w każdym Markdownie, co rozstrzyga pytanie 1 z raportu 28 na „tak”. Druga: oś toleruje zapis ostatniego kroku przez edytor.

**Czeka na właściciela.**
- Test w CMS na gałęziach `test-cms`, jedno podejście dla 28, 29 i 30 (sekcja „Test w CMS”).
- Pytanie o kotwicę `#konsultacje` na stronie EN — rozstrzygnięte: „Tak, dodaj kotwicę”, zrobione (sekcja „Pytania”).

## Etapy i commity

Wszystko na gałęzi `wyglad/zlecenie-16`.

| Etap | Repozytorium | Commit | Co |
| --- | --- | --- | --- |
| 1 | Web-Core | `8cdeba19` | Strony działów z `src/data/<dział>.md`, teksty stron z listą z „Stron” (`src/lib/tekstyStron.ts`), kotwice typu „strona”, tekst nad listą w panelu „Pokaż”; skrypty `migracja/dzialy.py`, `migracja/formularze.py` |
| 1 | Web-Ustawienia | `f1509cd` | Bez `src/data/dzialy/*.json` i formularzy „Strona działu …” |
| 1 | Web-Instytut | `f886ffb` | „Strona działu Instytut” (`src/data/instytut.md`), wpisy `instytut/struktura`, `warto-wiedziec` |
| 1 | Web-Nauka | `dad4a5d` | „Strona działu Nauka”, wpisy `seminaria`, `nauka/konferencje`, `nauka/granty`, `nauka/sukcesy`, `nauka/publikacje`; z `publikacje.json` znikają przeniesione pola |
| 1 | Web-Studia | `ef51fa8` | „Strona działu Studia”, wpis `studia/plan-zajec` |
| 1 | Web-Aktualnosci | `1a2a832` | Nowa kolekcja „Strony”: `aktualnosci`, `obrony-doktorskie` |
| 1 | Web-Pracownicy | `43c9cd5` | Nowa kolekcja „Strony”: `pracownicy` |
| 2 | Web-Core | `f9d6699a` | Bez `wyroznij_do`: schemat, okładka, lista na stronie głównej, style; skrypt `migracja/wpisy.py` |
| 2 | Web-Aktualnosci | `6319d7c` | Pole „Wyróżnij na stronie głównej do…” usunięte z formularza i z jedynego pliku, który je miał (`2026-08-03-kategoria-naukowa-a-plus.md`, data 24.10 — plakietka i tak już się nie pokazywała) |
| 3 | Web-Core | `2a491085` | Grupa „karta” w schemacie zakładów i „Warto wiedzieć”, pole „Bloki” w Roku akademickim, ściągawka |
| 3 | Web-Ustawienia | `217a9bf` | Strony prawne: Tytuł, Treść, Tytuł EN, Treść EN, reszta, „Bloki” |
| 3 | Web-Instytut | `a71e260` | Strony; zakłady (9) i „Warto wiedzieć” (3) z grupą „Karta” w formularzu i w plikach |
| 3 | Web-Nauka | `5de4170` | Strony; konferencje (`organizatorzy` ukryte) i granty: pola wymagane, potem tekst |
| 3 | Web-Studia | `0200b1a` | Strony; Rok akademicki: Treść, Treść EN, Koniec strony, Koniec strony EN (wszystkie rich-text), „Bloki” |
| 3 | Web-Aktualnosci | `2fdd547` | Aktualności i obrony: pola podstawowe, Treść, Treść EN (rich-text), reszta; Strony |
| 3 | Web-Pracownicy | `c4aa5f1` | Strony |
| 3 | Web-Popularyzacja | `9ad0954` | Strony Popularyzacji; „Bloki” z nową etykietą |
| 4 | Web-Core | `158128c0` | Symulacja zapisu dla stron i wpisów, poprawki z niej: wzory w każdym Markdownie, ostatni krok osi; test wtyczki |
| 4 | Web-Core | `01bb0437` | Raport i zrzuty; uzupełnienie po pushu `c0a1e154` |
| pyt. 1 | Web-Core | `84f3499f` | Stała kotwica `#konsultacje` (kotwice typu `naglowek`), test, ściągawka |
| pyt. 1 | Web-Studia | `8c7e561` | Bez `<a id="konsultacje">` w Treści EN Zajęć; link w Pierwszym roku EN do `#konsultacje` |

## Co widzi edytor

- **Strona działu Instytut / Nauka / Studia** (Web-Instytut, Web-Nauka, Web-Studia; pierwsza pozycja w menu repozytorium) ma pola:
  - na górze Tytuł, Treść, Tytuł EN i Treść EN;
  - niżej tekst pod tytułem, hasło, liczby „W skrócie”, godziny sekretariatu (Instytut) albo zakres sekretariatu (Studia), każde z wersją EN.
  - Treść Instytutu ma sekcję `## Ostatnie sukcesy`: zdanie pod tym nagłówkiem stoi nad listą sukcesów, jak dotąd.
- **Strony** w pięciu repozytoriach działów mają wpis pod adresem strony z listą, razem 11 wpisów. Pola:
  - Tytuł, Treść (tekst nad listą), Tytuł EN, Treść EN;
  - opis, hasło, liczby, pasek boczny i „Bloki”.
  - Na stronie Publikacje sekcja `## Czasopisma redagowane w Instytucie` stoi na miejscu dawnej ramki czasopism.
- **Wszystkie formularze „Strony”, strony prawne i Rok akademicki:**
  - tekst na górze, Treść EN w edytorze z przyciskami;
  - pole „Bloki” widoczne, z etykietą „Kafelki, oś i kontakty z list — zob. ściągawka”, domyślnie wyłączone.
- **Wpisy** (aktualności, obrony, konferencje, granty, zakłady, „Warto wiedzieć”):
  - najpierw pola wymagane, potem Treść i Treść EN, potem reszta;
  - zakłady i „Warto wiedzieć” mają pola karty w jednej grupie „Karta”.
- **Opis pola „Treść”:** krótka ściągawka i reguła „tekst nad listą: lista stoi pod całym tekstem, chyba że jest kotwica”. Pełna ściągawka jest w `dok/sciagawka-edytora.md`, pola w `.przekazanie/pola-do-cms.md`.
- **Bez zmian:** seminaria i referaty (Web-Sem-*), Władze, Kalendarz zajęć, publikacje i wykazy, pracownicy.

## Migracja

- `skrypty/migracja/dzialy.py` przeniósł 108 wartości do 14 plików: 3 strony działów i 11 wpisów „Stron”.
  - Źródło: `src/data/dzialy/*.json` (Web-Ustawienia), pola tekstowe `publikacje.json` (Web-Nauka) i dotychczasowe teksty z kodu.
  - Niczego nie pominął. Pliki źródłowe usunął; wartości zostają w historii Web-Ustawienia (`f1509cd^`).
  - Drugiego uruchomienia skrypt odmawia.
- `skrypty/migracja/wpisy.py` zebrał pola karty w grupę `karta:` w 12 plikach (9 zakładów, 3 „Warto wiedzieć”) i usunął `wyroznij_do` z 1 pliku. Wartości nie zmieniły się (skrypt to sprawdza), a ponowne uruchomienie nic nie zmienia.
- `skrypty/migracja/formularze.py --etap 1|2|3` przerobił `.pages.yml` w 7 repozytoriach.

## Porównanie przed/po

Porównałem build sprzed zlecenia (`900b0342` z tymi samymi klonami na stanie sprzed migracji) z buildem po zmianach: 5450 plików, wszystkie strony PL i EN.

- **Różny tekst: 0 stron.**
- **Inny HTML przy tym samym tekście: 17 stron.** Wszystkie te różnice są niewidoczne:
  - akapity tekstu nad listą bez atrybutu `data-astro-cid`, bo tekst idzie teraz z Markdownu; style są te same (6 stron z listą PL i EN);
  - apostrof typograficzny `’` zamiast `'` w tekstach EN z Markdownu (8 stron EN);
  - okładka strony głównej (PL i EN): skrypt bez flagi plakietki;
  - Obrony doktorskie (PL i EN): klasa `ob-wstep` → `lp-wstep`, style tekstu nad listą przeniesione do panelu „Pokaż” bez zmiany wartości.
- **Szum:** `DTSTAMP` w plikach `.ics` i kolejność wpisów w mapie strony (te same 732 adresy).
- **Pomiar w przeglądarce** (położenie i styl każdego elementu, 34 adresy × 1440 i 390 px): bez różnic. Wyjątki to losowa ciekawostka w banerze, losowa kolejność kart „Warto wiedzieć” na stronie głównej, nazwa klasy na Obronach i apostrofy.
- Po porównaniu doszły dwie poprawki z etapu 4 (wzory, oś). Build z nimi daje **0 różnic** w HTML wobec buildu „po”.

**Zrzuty** (`raport-zrzuty/z30-*`, PL, góra strony do 1600 px, 1440 i 390 px) są tylko dla stron, których HTML się różni.
- Na Obronach, Seminariach, Konferencjach, Publikacjach, Sukcesach i w „Strukturze i zakładach” zrzuty przed i po są **identyczne co do piksela**, więc jest tylko „po”.
- Strona główna ma przed i po (`z30-glowna-*-przed.jpg`). Okładka jest bez plakietki. Różnice między zrzutami to animacja banera: dwa zrzuty „po” też się między sobą różnią.

**Strona bez wpisu.** Usunąłem próbnie wpis `nauka/konferencje.md` i zbudowałem stronę.
- `/nauka/konferencje` i `/en/nauka/konferencje` działają.
- Tytuł, opis i hasło są z kodu (te same co dotąd), lista konferencji jest bez zmian. Brak tylko tekstu nad listą.
- Wpis wrócił z klonu.

## Zapis w edytorze

Symulacja jak w 28, etap 6a (`skrypty/test-edytora/symulacja.mjs`, TipTap 3 jak w Pages CMS). Każdy plik wczytany do edytora i zapisany bez zmian: Treść, Treść EN, Koniec strony i Koniec strony EN. Objęła 227 plików:
- 43 strony, w tym Pierwszy rok;
- 4 strony działów;
- 163 aktualności, 5 obron, 9 zakładów, 3 „Warto wiedzieć”.

Zapis zmienił 743 linie Markdownu. Strony zbudowane z zapisanych plików porównałem z buildem „po”.

**Pierwszy rok** (PL i EN, Treść EN pierwszy raz w edytorze z przyciskami): strona po zapisie identyczna.

**Znalezione i poprawione** (ta sama symulacja po poprawkach — wynik niżej):
1. **Wzory.** Edytor dopisuje ukośnik we wzorze (`\dfrac` → `\\dfrac`), a strona pokazałaby „d f r a c”. Dotyczy Procedury dyplomowania (PL i EN) i 2 testowych aktualności.
   - Wtyczka `remark-wzory-edytora` z 28 działała tylko w treści kierunku.
   - Teraz działa w każdym Markdownie: w treści z plików i w polach tekstowych (Treść EN, Koniec strony).
   - Na dzisiejszych treściach niczego nie zmienia (0 różnic w buildzie).
2. **Oś „Jak zacząć” na stronie „Dla uczniów”** (Web-Popularyzacja, PL i EN). Edytor zapisuje tytuł i opis ostatniego punktu listy bez pustej linii między nimi. Wtyczka bloków brała wtedy punkt za „bez pogrubienia” i doklejała krok 3 do kroku 2.
   - Teraz „**Tytuł**” i tekst w następnej linii to tytuł i opis kroku.
   - Nowy test w `rehype-bloki.test.mjs` (24/24 zielone).
   - Na dzisiejszych treściach niczego nie zmienia (0 różnic).

**Wynik po poprawkach: tekst bez różnic na wszystkich stronach.** Inny HTML na 14 stronach:
- link w pogrubieniu zapisany jako pogrubienie w linku — wygląda tak samo (10 stron: 3 aktualności, Sukcesy → Historia, Sprawy studenckie, każda PL i EN);
- znika `<div lang="en">` wokół angielskiego tekstu w 3 polskich aktualnościach. Czytnik ekranu przeczyta ten tekst polskim głosem. Tak było i przed zleceniem, bo polska Treść aktualności już była w edytorze z przyciskami;
- strona EN „Zajęcia”: znikała kotwica `<a id="konsultacje">` — po decyzji z pytania 1 kotwica jest w kodzie, a HTML w treści już nie ma.

## Kryteria odbioru

- [x] W Web-Ustawienia nie ma tekstów działów ani stron z listami; formularze „Strona działu …” są w repozytoriach działów.
- [x] Każda strona z tabeli w etapie 1 ma swój wpis (11); usunięcie wpisu niczego nie psuje (próba na Konferencjach).
- [x] `wyroznij_do` usunięte z formularza, schematu, pliku i kodu; plakietki na okładce nie ma; pierwsza aktualność na listach dalej powiększona.
- [x] Formularze stron: tekst na górze, Treść EN w edytorze z przyciskami, pole „Bloki”. Formularze wpisów: pola wymagane, potem tekst.
- [x] Porównanie przed/po: tekst bez różnic, HTML tylko z niewidocznymi różnicami, zrzuty identyczne.
- [x] Kontrole:
  - `sprawdz_pola_cms.py`: 0 problemów (597 plików, 21 repozytoriów);
  - `sprawdz_tresci.py`: OK (567 plików, 106 ciekawostek);
  - `astro check`: 6 błędów, te same co przed zleceniem (`process` i `node:*` w `astro.config.mjs` i `src/lib/zdjecia.ts`);
  - testy wtyczki 24/24.
- [ ] Test w CMS: zapis bez zmian daje tę samą stronę — czeka na właściciela.
- [x] Zasada w `.przekazanie/zlecenia/zasady.md` („Teksty stron”), wpisy w `pola-do-cms.md` i dzienniku.

## Push i podgląd (etap 5)

- **Pull:** `git pull --rebase` przed pushem w 12 klonach (wszystkie dotknięte przez 28–30) i w Web-Core. Nic nie przyszło z serwera, konfliktów nie było.
- **Push** 7.11 o 15:53 (słowo właściciela „Po zakończeniu push”): `wyglad/zlecenie-16` w 8 repozytoriach, wszystkie bez wymuszania:
  - Web-Core `01bb0437`;
  - Web-Ustawienia `217a9bf`, Web-Instytut `a71e260`, Web-Nauka `5de4170`, Web-Studia `0200b1a`, Web-Aktualnosci `2fdd547`, Web-Pracownicy `c4aa5f1`, Web-Popularyzacja `9ad0954`.
  - Web-Spec-* nie miały nowych commitów (wypchnięte z 29).
  - Gałęzi `main` nie ruszałem, więc stara strona się nie przebudowuje.
- **Web-Podglad:** przebieg uruchomiony ręcznie (run `42383706719`, 14:53–14:59 UTC) zakończył się sukcesem.
  - Zbudował Web-Core `01bb0437` z 1221 plikami treści, tyle samo co lokalnie.
  - 12 błędów „patch does not apply” w kroku „TEST telefonu” — tyle samo co w poprzednim przebiegu.
- **Strony na [podglądzie](https://im-uwr.github.io/Web-Podglad/)** porównałem z lokalnym buildem: 26 adresów (strona główna, strony działów, 11 stron z listą, Rok akademicki, Pierwszy rok, „Dla uczniów”, Procedura dyplomowania, kilka EN).
  - Tekst jest wszędzie ten sam.
  - HTML różni się tylko nazwami obrazów (hash z innej maszyny), nazwą arkusza CSS (treść ta sama poza adresem `/Web-Podglad`) i adresem strony w linkach „zgłoś błąd”.
- **`test-cms`** (do testu niżej) ustawione na nowe `wyglad/zlecenie-16`:
  - Web-Studia, Web-Ustawienia i Web-Popularyzacja przesunięte do przodu. Były to czubki gałęzi z 29, bez zapisów.
  - Web-Spec-Stosowana bez zmian.
  - Web-Aktualnosci: nowa gałąź.
  - Web-Nauka: stare `test-cms` z zapisem właściciela z 6.11 (`b0a71bd`, „Update src/data/publikacje/2025.json”) zachowane jako `kopia/test-cms-zlecenie-22`, potem `test-cms` ustawione na `5de4170`.

## Test w CMS (właściciel)

Jedno podejście dla 28, 29 i 30, na gałęziach `test-cms` ustawionych na nowe `wyglad/zlecenie-16`. Jako edytor, w Pages CMS, gałąź `test-cms`:

| Repozytorium | Co zrobić |
| --- | --- |
| [Web-Studia](https://app.pagescms.org/IM-UWr/Web-Studia/test-cms) | **28:** Kierunki → Treść, Matematyka: zapisz **bez zmian**, potem dodaj wiersz w tabeli terminów, krok osi (zwykłym Enterem), pytanie (Nagłówek 3 z „?”), PDF z „Media” podlinkowany w „Aktach prawnych”, wzór `$\ell^2$` w akapicie, zmień jedno słowo w Treści EN. Kierunki → Baner: zmień hasło Matematyki. **30:** Strony → Pierwszy rok: otwórz i zapisz **bez zmian**; Strony → Zajęcia i konsultacje: otwórz i zapisz **bez zmian** (link do konsultacji w stopce strony EN ma dalej prowadzić do sekcji „Office hours”) |
| [Web-Ustawienia](https://app.pagescms.org/IM-UWr/Web-Ustawienia/test-cms) | **28:** przesuń jeden kierunek na liście kierunków |
| [Web-Spec-Stosowana](https://app.pagescms.org/IM-UWr/Web-Spec-Stosowana/test-cms) | **29:** Specjalność → Treść: zapisz **bez zmian**, potem dodaj temat pracy, krok osi i pytanie |
| [Web-Popularyzacja](https://app.pagescms.org/IM-UWr/Web-Popularyzacja/test-cms) | **29:** Strona działu Popularyzacja: zapisz **bez zmian**, potem zmień jedną liczbę „W skrócie” |
| [Web-Nauka](https://app.pagescms.org/IM-UWr/Web-Nauka/test-cms) | **30:** Strony → Konferencje (`nauka/konferencje`): dodaj link w tekście. Strona działu Nauka: zmień jedną liczbę „W skrócie” |
| [Web-Aktualnosci](https://app.pagescms.org/IM-UWr/Web-Aktualnosci/test-cms) | **30:** dodaj nową aktualność (formularz bez pola wyróżnienia), zapisz, potem ją usuń |

Potem ja: porównam `origin/test-cms` z `wyglad/zlecenie-16` w każdym repozytorium, zbuduję stronę z `test-cms` i sprawdzę każdy punkt (zapis bez zmian — ta sama strona; pola, wzór, tabela, oś i link mają przetrwać). Wynik dopiszę tu, a `test-cms` usunę.

## Odstępstwa i uwagi

1. Poprawki spoza dosłownego zakresu, obie z symulacji zapisu (sekcja „Zapis w edytorze”): wtyczka wzorów w każdym Markdownie i ostatni krok osi. Wtyczka wzorów rozstrzyga pytanie 1 z raportu 28.
   - Cofnięcie wtyczki wzorów: usunąć `remarkWzoryEdytora` z `astro.config.mjs` i `src/lib/markdown.ts`.
   - Po zmianie wtyczek serwer dev trzeba uruchomić od nowa z `--force`.
2. Usunąłem nieużywane importy, które zostały po przeniesieniu tekstów (6 plików list).
3. Pierwsze `astro check` w drzewie budowania pokazało 61 błędów. Wszystkie dotyczyły typu kolekcji specjalności (nieaktualne `.astro` po buildzie z innymi treściami). Po czystym buildzie zostaje 6 błędów jak przed zleceniem.
4. Pomiar i zrzuty robiłem w Edge przez Playwright, bo Chromium z Playwright jest na tej maszynie niekompletny.
5. `skrypty/migracja/formularze.py` ma wszystkie trzy etapy w jednym pliku i wszedł do commitu etapu 1.

## Pytania

1. **Kotwica `#konsultacje` na stronie EN „Classes and office hours”.**
   - Treść EN strony Zajęcia (Web-Studia) ma przed nagłówkiem „Office hours” kotwicę w HTML: `<a id="konsultacje"></a>`. Prowadzi do niej link „Konsultacje” ze stopki w wersji EN.
   - Edytor z przyciskami usuwa HTML przy zapisie, więc po pierwszym zapisie Treści EN link ze stopki otworzy górę strony.
   - Po polsku działa sam nagłówek „Konsultacje”.
   - Propozycja: stała kotwica dla nagłówka „Office hours” na tej stronie (jak kotwice w `src/plugins/kotwice.mjs`) i usunięcie HTML z treści.
   - **Decyzja właściciela (7.11): „Tak, dodaj kotwicę”. Zrobione** — Web-Core `84f3499f`, Web-Studia `8c7e561` (wypchnięte, `test-cms` w Web-Studia przesunięte na `8c7e561`):
     - nowa kotwica typu `naglowek` w `kotwice.mjs`: nagłówek 2 „Konsultacje” / „Office hours” na zwykłej stronie dostaje id `konsultacje`, po polsku i po angielsku; test wtyczki (25/25);
     - z Treści EN strony Zajęcia zniknął `<a id="konsultacje"></a>`;
     - link „Office hours” w Pierwszym roku EN prowadzi teraz do `#konsultacje`, bo dawne `#office-hours` już nie istnieje (nagłówek ma jedno id);
     - build: zmieniły się tylko `/en/studia/zajecia` (id nagłówka, spis „Na tej stronie”, bez pustego akapitu z kotwicą) i `/en/studia/pierwszy-rok` (adres linku). Na stronie Pracownicy (PL i EN) zamieniły się miejscami dwa wpisy tej samej osoby (Elżbieta Kalinowska: zakład i administracja) — nieustalona kolejność przy budowaniu, niezwiązana z kotwicą;
     - symulowany zapis obu stron w edytorze zostawia nagłówek i link bez zmian;
     - ściągawka: kotwic w HTML nie wpisywać, stałe kotwice są w `kotwice.mjs`.
