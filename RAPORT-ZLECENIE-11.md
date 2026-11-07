# Raport: zlecenie 11 — poprawki i podstrony (5.11.2026)

Gałąź: `wyglad/zlecenie-11` (z `origin/wyglad/en`), 15 commitów, **bez pushowania**. Zlecenie: `.przekazanie/zlecenia/11-poprawki-i-podstrony.md`.

- `npm run build`: bez błędów (748 stron). `astro check`: 3 błędy, te same co przed zleceniem (`process` w `astro.config.mjs`); nowy błąd typu z zalecenia 20 poprawiony (`eab091a0`).
- Treści: lokalna nakładka (`.tresci/`, ścieżki z `.gitignore`), `skrypty/pobierz_tresci.py` **nie był uruchamiany**, repozytoriów Web-* nie zmieniałem. Do porównań z repozytoriami treści użyłem świeżych klonów tylko do odczytu (poza repozytorium).
- Sprawdzanie: Edge (Playwright, `channel: msedge`), zbudowana strona (`astro build`), szerokości 1366, 1440, 1536, 1920, 2560, 3440 i 390 px, jasny i ciemny motyw. Zrzuty w `raport-zrzuty/z11-*`.

## Podsumowanie

| Zalecenie | Stan | Commity |
|---|---|---|
| 1. Okładka: barwienie przy najechaniu na dział | zrobione | `2ae9c48c` |
| 2. Banery: trzy style, hasło i liczby razem, liczby w jednym rzędzie | zrobione (odstęp 20 px wg zmiany z 5.11, 11:30) | `714f5df8`, `e0ce6c5c` |
| 3. Podstrony: bez listy z lewej, spis z prawej | sprawdzone, zgodne (zrobione w zleceniu 12) | — |
| 4. Przyciski: jeden styl | zrobione | `e9476129` |
| 5. Strona działu: „wiersze na pasie” | zrobione | `91798842` |
| 6. Pasek menu i hamburger | zrobione | `d828db20` |
| 7. Okładka: logo i wydział w górnej linii | zrobione | `d828db20` |
| 8. EN: flaga przy przełączniku | zrobione | `0f0681d5` |
| 9. Nagłówki podstron: liczby kierunków, długie tytuły, sygnet | zrobione | `714f5df8` |
| 10. Paleta i ciemny motyw „Nocny granat” | zrobione; propozycja 3:1 w jasnym **nie wdrożona** (opis niżej) | `598d2a11`, `1a2ef702` |
| 11. Lead bez powiększenia | zrobione | `35a9bf46` |
| 12. Wersja angielska | zrobione wcześniej na gałęzi bazowej `wyglad/en` (`fd9673d6`…`498538c5`); tu tylko teksty nowe z tego zlecenia | — |
| 13. Studia: „Rekrutacja” w pasie, bez USOS | zrobione w kodzie; usunięcie USOSweb z danych menu — do CMS | `91798842` |
| 14. Wzorzec treści na wszystkich podstronach | zrobione (Władze, Projekty i granty; reszta zgodna) | `eeec54f3` |
| 15. Okładka: liczby nad „Szybkim dostępem” | zrobione | `2ae9c48c` |
| 16. Szkic patrona mocniej, z cieniem, bez plamy | zrobione | `c0955a06` |
| 17. Studia: zdjęcie z sali HS przypięte do szkicu | zrobione w kodzie; **plik zdjęcia trzeba wgrać do Web-Ustawienia** | `11da8f4d` |
| 18. Okładka: nowe ułożenie zdjęcia | **CZEKA — nie wykonane** (zgodnie ze zleceniem) | — |
| 19. Ciekawostki patronów losowane na wizytę | zrobione | `587dc404` |
| 20. Okładka ↔ Szybki dostęp bez zatrzymywania w połowie | zrobione | `2ae9c48c`, `eab091a0` |

## Do zrobienia przez właściciela i redakcję (CMS)

1. **Zdjęcie Studiów (zalecenie 17):** wgrać `raport-zrzuty/z11-17-studia-hs-3200.jpg` (3200×1802, JPEG q82, 476 KB) jako `public/pliki/naglowki/studia.jpg` w repozytorium **Web-Ustawienia**. Kod liczy kadr pod proporcje tego pliku; bez podmiany produkcja pokaże stare zdjęcie w nowym kadrze. Przed publikacją: porównać wzory na tablicach z oryginałem (zdjęcie przeszło przez obróbkę) i uzupełnić autora.
2. **Hasła stron z liczbami (zalecenie 2):** pola hasła są dziś tylko w lokalnej nakładce, w repozytoriach treści ich nie ma. Na treściach z repozytoriów 59 stron (i te same `/en`) ma liczby bez hasła, więc **liczby się tam nie pokażą** (zasada „razem albo wcale”), dopóki hasła nie trafią do CMS. Lista stron niżej.
3. **Menu Studiów (zalecenie 13):** usunąć USOSweb z grupy „Na co dzień” w `nawigacja.json` (Web-Ustawienia). W kodzie pominięty tylko w pasie działu; w panelu hamburgera i w menu na telefonie zostaje do zmiany w CMS.
4. **Ciekawostki (zalecenie 19):** przed startem zweryfikować fakty, lata, źródła i prawa do cytatów; przejrzeć tłumaczenia (`dok/en/TLUMACZENIA.md`, sekcja 6); po przeglądzie kart uzupełnić `stan` / `strona` w `src/data/ciekawostki/*.json` (bez zmian w kodzie).

### Strony z liczbami bez hasła (na treściach z repozytoriów, 5.11)

Ostrzeżenie `[baner] liczby bez hasła` przy budowaniu zostaje w kodzie (`NaglowekZ.astro`). Na lokalnej nakładce nie pojawia się ani razu — wszystkie te strony mają tam hasła. Na świeżych klonach repozytoriów: 59 stron PL i te same `/en`:

- **Instytut:** `/instytut/struktura/` i 9 zakładów `/instytut/zaklady/`: `algebra-i-teoria-modeli`, `analiza-funkcjonalna`, `analiza-matematyczna`, `dydaktyka`, `geometria`, `rownania-rozniczkowe`, `statystyka`, `teoria-mnogosci-i-topologia`, `teoria-prawdopodobienstwa`; `/pracownicy/`.
- **Nauka:** `/nauka/granty/`, `/nauka/konferencje/`, `/nauka/publikacje/` i 23 roczniki (`/nauka/publikacje/2003/` … `/2025/`), `/nauka/sukcesy/`, `/seminaria/`, `/obrony-doktorskie/` i 8 obron (w tym 3 wpisy testowe `test-*`).
- **Studia:** `/studia/isim/`, `/studia/siad/`, `/studia/matematyka/` i 5 specjalności (`analiza-danych`, `matematyka-aktuarialno-finansowa`, `matematyka-nauczycielska`, `matematyka-stosowana`, `matematyka-teoretyczna`), `/studia/plan-zajec/`, `/studia/rok-akademicki/`, `/studia/szkola-doktorska/`.

Pola, które są tylko lokalnie (do wpisania w CMS): Web-Ustawienia `src/data/dzialy/instytut.json` (`haslo`, `pracownicy_haslo`, `struktura_haslo`, `warto_wiedziec_haslo` + `_en`), `nauka.json` (`haslo`, `granty_`, `konferencje_`, `obrona_`, `obrony_`, `publikacje_`, `rocznik_`, `seminaria_`, `sukcesy_haslo` + `_en`), `studia.json` (`haslo`, `plan_haslo` + `_en`), `ustawienia.json` (`haslo`, `szukaj_haslo` + `_en`); Web-Instytut (`wladze.json`, strony kontakt i infrastruktura, 9 zakładów); Web-Nauka (`sukcesy/historia`); Web-Popularyzacja; 9 seminariów; 5 specjalności; 4 kierunki; strony Studiów (11); deklaracja dostępności i polityka prywatności. Do sprawdzenia: z którego pola bierze hasło Rok akademicki (`studia.json` czy `rok-akademicki.md`).

## Zalecenie 10: ramki przycisków i pól 3:1 w jasnym motywie — propozycja (nie wdrożona)

Dziś w jasnym motywie ramki przycisków, pól, list wyboru i pasków przełączników mają kolor `--line` = `#e5e0d6`: kontrast **1,26:1** z tłem `#fcfaf6` i 1,17:1 z powierzchnią `#f4f1ea`. WCAG 2.2 (1.4.11) wymaga dla granic elementów interfejsu **3:1**.

Zmiana byłaby jedną linią: w `src/styles/zalozyciele.css` `:root { --line-ui: #8c8679; }` (ciepły szary z palety tła) zamiast `var(--line)`. Kontrast: **3,47:1** z tłem, 3,21:1 z powierzchnią, 3,62:1 z bielą. Od tego zlecenia wszystkie ramki przycisków i pól biorą kolor z `--line-ui` (`1a2ef702`), więc zmiana obejmie naraz: przyciski-linki (`.akcja a`, `a.przycisk`), paski przełączników (semestry, dni, rodzaje w Aktualnościach i Kalendarzu, `.tresc-taby`), pola szukania (Plan, Pracownicy, Aktualności, Kalendarz), listy wyboru (`.z-pole-wyboru`, zakłady na Pracownikach), pole e-mail powiadomień seminarium i „PDF” przy rocznikach. Kreski sekcji i list (`--line`) zostają jasne. Ciemny motyw ma już `#727c8f` (≥ 3:1).

Jak by to wyglądało (styl wstrzyknięty tylko w przeglądarce): `raport-zrzuty/z11-10-line-ui-propozycja-jasny.png`. Ramki stają się wyraźnie widoczne, przyciski nadal lżejsze od głównego (wypełnionego). Alternatywa łagodniejsza: `#938d80` (3,17:1 z tłem, ale 2,93:1 z powierzchnią).

## Szczegóły zaleceń

### 1. Barwienie okładki
- Warstwa `.z-barwa` (`soft-light`, krycie .5, przejście .6 s; bez przejścia przy ograniczonym ruchu). `data-dzial` dostaje sama warstwa, nie cała okładka (inaczej kolory działu zmieniłyby się wszystkim elementom okładki); efekt ten sam.
- Przy okazji: nazwa działu po najechaniu była granatowa na granacie (globalne `a:hover` wygrywało) — poprawione. Błąd był już przed zleceniem.
- Zrzut: `z11-01-barwienie-okladki-1440.jpg`.

### 2. i 9. Banery i nagłówki podstron
- Trzy style: baner działu; podstrona z liczbami (tytuł, hasło, kreska, liczby); podstrona bez liczb. Hasło i liczby razem albo wcale.
- Liczby zawsze w jednym rzędzie: skrypt w nagłówku liczy szerokość rzędu do granicy (20 px przed notką o patronie albo opisem ciekawostki, zmiana z 40 px z 5.11, 11:30); liczby, które się nie mieszczą, znikają w całości (`aria-hidden`), pierwsza zostaje zawsze. Telefon: najwyżej trzy.
- Długie tytuły podstron: najwyżej dwie linie; stopień maleje co 4 px, najwyżej do 44 px; szerokość tytułu do ciekawostki minus 40 px. Przy dwóch liniach sygnet z podpisem podnosi się o pół linii.
- Kierunki na telefonie: dotąd bez liczb, ale z hasłem (sprzeczne z zasadą „razem albo wcale”) — teraz trzy pierwsze fakty.
- Pomiar odstępu 20 px (baner Nauki): 1440, 1536, 1920 — 3 z 3 liczb (przy 40 px trzecia znikała); 1366 — 2 z 3. Instytut, Studia, Struktura — komplet przy każdej szerokości.
- Zrzuty: `z11-02-09-isim-1440.jpg`, `z11-02-struktura-1440.jpg`, `z11-09-isim-390.png`, `z11-02-nauka-baner-odstep-1440.jpg`.

### 3. Podstrony (tylko sprawdzenie)
- 1920×1080, 1536×864, 1366×768, 1366×640; Plan zajęć, Projekty i granty, Władze, Rok akademicki, kierunek, specjalność, strona tekstowa (Zajęcia), seminarium; `/en`: Plan, Władze, Granty, kierunek.
- Wszędzie kolumny „treść 946–948 px + 236 px”, odstęp 56 px, bez listy podstron z lewej; spis przyklejony pod paskiem (top 90 px), mieści się w 1366×640 bez przewijania (najdłuższy: Zajęcia, 13 pozycji), nie wychodzi poza kolumnę treści. Klawiatura: Tab dochodzi do linków spisu (fokus widoczny), Enter przewija, `aria-current="location"` na klikniętej pozycji, znacznik 3 px w kolorze działu. Różnic do poprawienia nie znalazłem.

### 4. Przyciski, pola, listy wyboru
- Wspólne klasy w `zal-tresc.css`: przycisk-link (`.akcja a`, `a.przycisk`), pasek przełączników (`.tresc-taby`), nowy wariant główny (`.akcja.glowny`, `a.przycisk.glowny` — wypełniony kolorem działu) i opakowanie listy wyboru `.z-pole-wyboru` (ramka 1 px, 15 px, strzałka w kolorze działu, fokus 2 px; na telefonie 16 px, żeby iOS nie powiększał).
- Pracownicy: lista wyboru grup usunięta (grupy są sekcjami i są w spisie); zostały szukanie i zakłady.
- Seminarium: powiadomienia e-mail w prawej kolumnie pod spisem (nowy slot `bok` w `zal/Podstrona.astro`), na telefonie na końcu treści; „Zapisz mnie” jako przycisk główny. Lokalnie formularz pokazuje „Zapisy na listę ruszą wkrótce” (puste `adresListy`).
- Grant: „Strona projektu ↗” jako główny (żaden grant w lokalnych treściach nie ma pola `strona`, więc bez zrzutu). Warto wiedzieć: link pod treścią jako główny.
- Aktualności i Kalendarz na telefonie: lista wyboru rodzaju zamiast paska (zalecenie 4 ma pierwszeństwo przed siatką ze zlecenia 12).
- Publikacje: „PDF” przy rocznikach jako przycisk-link, ciaśniejszy (4 px 12 px), bo pełny rozpychał wiersze.
- Kierunki: przyciski pod opisem nie są wyświetlane (pole `przyciski` w CMS nietknięte); Szkoła doktorska pokazuje je jako listę linków (zalecenie 14). Linki, które przez to znikają z kierunków: matematyka — „Plan zajęć”, „Katalog przedmiotów (USOS)”, „Rekrutacja”; ISIM — „ISIM na stronie Wydziału” (nie ma go nigdzie indziej); SIAD — „Rekrutacja”.
- Sukcesy: ramka „Wcześniejsze sukcesy” usunięta; strona `/nauka/sukcesy/historia` zostaje, ale nic do niej nie prowadzi (tylko wyszukiwarka i adres).
- Zrzuty: `z11-04-przyciski-pola-1440.jpg`, `z11-04-przyciski-pola-390.png`.

### 5. i 13. Menu działu, Rekrutacja
- „Wiersze na pasie” jak wariant E w prototypie; Popularyzacja bez zmian (trzy kolumny). Podpowiedź (`title`) tylko przy nazwach skróconych (np. SIAD) — w danych menu nie ma opisów, nie dopisywałem ich.
- Rekrutacja: przycisk z prawej obok wszystkich wierszy, rok z danych (ostatni rok akademicki z `kolory-dni.json` + 1, dziś 2027/28); najdłuższy wiersz łamie się na dwie linie (zamierzone).
- Odstępstwo: w ciemnym motywie przycisk Rekrutacji ma granatowy napis (kolor działu w ciemnym to pastel, biały byłby nieczytelny); prototyp nie ma reguły ciemnej.
- Zrzut: `z11-05-13-menu-dzialu-studia-1440.png`.

### 6. i 7. Pasek menu, hamburger, górna linia okładki
- Pasek przyklejony tylko z JS i tylko na stronach z banerem; strony bez banera: przyklejony na granacie, po przewinięciu jasny; bez JS jak dotąd.
- Panel hamburgera na całą wysokość, krzyżyk w miejscu hamburgera, fokus na krzyżyk bez przewijania okładki; w ciemnym motywie tło `--panel` (`#24324f`). Telefon bez zmian (własne menu).
- Spis „Na tej stronie” i narzędzia Planu, Kalendarza i Aktualności przyklejone pod paskiem.
- Kreska „nad stopką”: stopka jest niska, więc pasek ciemnieje nad nią tylko, gdy stopka dojdzie do góry okna (np. krótka strona w dużym oknie) — działa, ale rzadko widać.
- Okładka: logo i wydział → `https://wmi.uwr.edu.pl/` (ten sam adres w EN — nie znalazłem pewnej strony angielskiej); tekst EN „Faculty of Mathematics and Computer Science”. Na telefonie górna linia schowana (logo jest w nagłówku telefonu). Tytuł: `top: clamp(84px, 20% wysokości, 220px)` jak w prototypie.
- Zrzuty: `z11-06-07-okladka-gorna-linia-1920.jpg`, `z11-06-panel-hamburgera-1440.jpg`.

### 8. Przełącznik języka
- Flaga języka docelowego (na `/en` polska: biały/czerwony `#DC143C`, 20×10 z obwódką); menu na telefonie też dostało flagę przed „Wersja polska / English version”. Zrzut: `z11-08-przelacznik-jezyka-en-1440.jpg`.

### 10. Ciemny motyw „Nocny granat”
- Wariant A jako zwykły ciemny motyw: tło `#18243b`, powierzchnia `#222e46`, tekst `#ced5e3`, przygaszony `#a5afc1`, panel `#24324f`, ramki przycisków i pól `#727c8f`, grube kreski `#7d8697`. Kolor działu: jasny z 22% koloru nagłówków (≥ 4,5:1 na tle, powierzchni i tle działu); tło działu z 11% koloru w powierzchni. Zdjęcia w dwóch kolorach z przygaszonymi światłami, zwykłe `brightness(.88–.92) saturate(.92–.94)`. Nazwy zmiennych bez przedrostka `m-` (kod używa `--bg`, `--line`…): `--line-ui`, `--rule`, `--panel`.
- Sztywne kolory zastąpione zmiennymi: grube kreski 2 px w `var(--ink)` → `var(--rule)` (strona działu, „W skrócie”, nagłówki kolumn strony głównej, Studia na stronie głównej, tabele, kontakty, „Następna strona”, nagłówki narzędzi Planu, Kalendarza, Aktualności, Pracowników, Aktualność); panel hamburgera `rgb(9 16 34)` → `--panel`; ramki przycisków i pól `--line` → `--line-ui` (poprawka `1a2ef702`: zmienna była zdefiniowana, ale nieużywana, więc w ciemnym ramki miały `#3a465c`); tło nagłówka podstrony z domieszką granatu (`--g-pod`); „W skrócie” na powierzchni.
- **Odstępstwo:** tylko forma `[data-theme="dark"]`. Skrypt w `<head>` zawsze ustawia `data-theme` (domyślnie jasny, także przy ciemnym systemie — wcześniejsza decyzja w `Baza.astro`), więc forma z `prefers-color-scheme` nie miałaby kiedy zadziałać.
- Zrzut: `z11-10-ciemny-motyw-1440.png`.

### 11. Lead
- Pierwszy akapit tekstu działu: 17 px / 1,68 jak reszta, kolor `--ink` zamiast `--text`.

### 14. Wzorzec treści
- Audyt stylów obliczonych na 15 podstronach (Władze, Plan, Granty, strony działów, Pracownicy, Kalendarz, Aktualności, Warto wiedzieć, Struktura, zakład, Kalendarz zajęć, Kontakt, strony tekstowe).
- Władze i Projekty i granty stały na starym stylu: wspólna reguła `.z-pd-tresc` według wzorca (sekcje 44/40 px, telefon 30/28; h2 32 px / 1,2, 16 px pod; telefon 26 px). Władze: „Kadencja” i „Rada Instytutu” jak proza wzorca (17 px / 1,68, 70 znaków, listy z kreskami). Granty: wstęp według wzorca; rok na osi jak podsekcja (23 px / 1,3, 30 px nad, 8 px pod; telefon 20 px). Pozostałe strony — bez zmian (porównanie stylów przed i po).
- Strony działów: nagłówki 34 px, nie 32 — tak jest w prototypie strony działu; wzorzec dotyczy podstron. Plan zajęć: kategorie 24 px w kolorze działu jak w prototypie.
- Aktualności i Kalendarz: wpisy list czekają na „wpisy na listach” (zalecenia 21–22 osobnej paczki).
- Zrzuty: `z11-14-wladze-1440.png`, `z11-14-granty-1440.png`.

### 15. Liczby nad „Szybkim dostępem”
- Wydarzenia dziś + 6 dni (z przypomnieniami terminów, jak kolumna), referaty z kolumny Seminaria (ten sam tydzień), aktualności z ostatnich 7 dni bez wpisów, których wydarzenie już się odbyło. Liczone przy budowaniu.
- Bez JS link prowadzi do nagłówka kolumny; z JS przejazd, podświetlenie kolumny 1,6 s i fokus na nagłówek. EN: „1 event · 2 seminars · 1 new post”.
- **Odstępstwo:** przy niskich oknach (1366×768: −15 px, 1280×720: −18 px) trzyliniowy opis patrona środkowych działów wchodzi na linię liczb, więc przy najechaniu Nauki lub Studiów liczby gasną (.25 s). Prototyp tego nie ma.
- Zrzut: `z11-15-liczby-nad-szybkim-dostepem-1440.jpg`.

### 16. Szkic patrona
- Nowe tokeny `--instytut-jm` `#ffa625`, `--nauka-jm` `#0aceba`, `--studia-jm` `#ff7d5b`, `--popularyzacja-jm` `#af97ff` (wartości „Lazur i malina” zapisane w komentarzu). Kreski i podpis w `--d-jm`, kontur 2 px, dwa ciemne cienie (1,5 i 4 px) i poświata 10 px w kolorze działu. Plamy w kodzie nie było — nic do usuwania. Animacja bez zmian.
- Telefon: to samo na banerze działu (prototyp pokazuje tylko komputer).
- Zrzuty: `z11-16-szkic-studia-1920.jpg`, `z11-16-szkic-nauka-1920.jpg`.

### 17. Studia: sala HS
- Plik ze zdjęcia z gałęzi kopii (4800×2703) → 3200×1802, JPEG q82 progresywny. Bez rozjaśnienia; tekst alternatywny PL/EN (tylko Studia — pozostałe zdjęcia działów zostają ozdobne).
- Strona działu (komputer): przypięcie jak w prototypie, ale margines liczony w `cqw` kontenera zdjęcia — w prototypie `100%` z `--marg` w `top` liczy się względem wysokości banera (przy oknach szerszych niż ok. 2100 px zdjęcie przesunęłoby się w pionie). Pomiar: środek szkicu w 44,25% szerokości zdjęcia przy 1366, 1536, 1920, 2560 i 3440 px; lewy brzeg zdjęcia zawsze pod pełnym granatem; przy 2560 i 3440 z prawej skrawek jasnej ściany, napisu i portretu nie widać.
- Podstrony Studiów: same tablice. Telefon: zwykłe `object-fit: cover`, kadr 50% 40% — do oceny.
- Zrzuty: `z11-17-studia-baner-1920.jpg`, `z11-17-plan-naglowek-1920.jpg`, `z11-17-studia-390.jpg`.

### 19. Ciekawostki patronów
- **Dane:** `src/data/ciekawostki/{instytut,nauka,studia,popularyzacja}.json` (25/25/25/31) z gałęzi kopii, z dodanymi `nazwa_en`, `zdanie_en` (wszystkie 106) i `rok_en` (7 lat ze słowami). `ukryta: true`: `praca-na-glos`, `seminarium-w-salonie`, `twierdzenie-knastera-reichbacha`. Pola `podstrona`, `dlaczego_tu`, `przypiecie` zostały jako podpowiedź (nie wchodzą do losowania); `stan` i `strona` puste do przeglądu. Opis pól: `src/data/ciekawostki/README.md`.
- **Strony w losowaniu (25):** linki wewnętrzne z menu działu, których adres należy do działu — Instytut 5, Nauka 6, Studia 14 (Biblioteka, Rada Dyscypliny i Szkoła doktorska w menu Nauki poza losowaniem, jak `CK_POZA`). Popularyzacja ma w menu tylko linki zewnętrzne, więc dziś nie ma gdzie pokazać ciekawostek (pula gotowa).
- **Losowanie** jak `ckUloz` w prototypie: przypięte → pozycje zestawu wizyty → reszta w kolejności ważonej `Math.random() ** (1 / waga)` (waga 3 dla ulubionych), bez powtórzeń w dziale. `sessionStorage` `im-ciek-zestaw` = `{dział: {strona: id}}`; ten sam zestaw dla PL i EN. Zestaw działu losuje się przy pierwszej stronie tego działu (dla odwiedzającego to samo co „przy pierwszej stronie wizyty”, a strona Instytutu nie musi nieść puli Studiów).
- **Bez mignięcia:** skrypt w linii tuż za znakiem; do jego końca znak i opis są niewidoczne (klasa `z-ck-losuje`, tylko z JS). Sonda wstawiona tuż przed skryptem: znak i opis ukryte (1440 i 390 px).
- **Bez JS albo bez `sessionStorage`:** ciekawostka stała z budowania.
- **Prerender (pod zlecenie 13):** w trakcie składania w tle bez zapisu; po pokazaniu strony uzgodnienie z zestawem wizyty (gdy go nie ma, ten wybór staje się zestawem).
- **Wygląd:** znak 145×170 (z liczbami 200×200), linie 1,3 px / gruba 2 px, `vector-effect: non-scaling-stroke`, opis w kolumnie 300 px, tytuł w jednej linii (`nowrap`, −160 px). Najechanie: znak rysuje się od nowa (cienkie 0,7 s, gruba 0,35 s od 0,65 s), bez animacji przy ograniczonym ruchu i bez kursora; telefon: sam rysunek, bez rysowania. Znak dostał `z-index: 2` — wcześniej przykrywał go blok tytułu, więc kursor nigdy nie trafiał w znak.
- **Granica tytułu strony** liczona z linii tekstu opisu, nie z pudełka tytułu ciekawostki (wysuniętego o 160 px w lewo) — inaczej tytuł strony zawsze tracił 160 px (ISIM spadało do trzech linii po 44 px).
- **Pomiar** (każda ciekawostka puli, PL i EN, 1366 / 1440 / 1920; ISIM, SIAD, Skrypty, Infrastruktura, Granty): tytuł ciekawostki nigdzie nie wchodzi na tytuł strony (co najmniej 40 px) ani na znak. Najdłuższe: PL „Problem z pierwszego tomu Fundamenta, 1920–2016” (349 px), EN „A problem from the first volume of Fundamenta, 1920–2016” (393 px; mieści się w 460 px).
- **Testy odbioru** (dwie wizyty): zestaw stały na kolejnych stronach i po odświeżeniu, zgodny z `sessionStorage`, bez powtórzeń (Studia 14 różnych, Nauka 6, Instytut 5); druga wizyta — 14 z 14 stron Studiów z inną ciekawostką; 40 losowań — 0 powtórzeń, 0 ukrytych, użyte wszystkie dostępne (22 / 25 / 25).
- Zrzuty: `z11-19-ciekawostki-dwie-wizyty.jpg` (1440 i 1920, dwie wizyty), `z11-19-ciekawostki-390.png`, `z11-19-rysowanie-po-najechaniu.png` (klatki 40–1000 ms).

### 20. Okładka ↔ Szybki dostęp
- `src/scripts/zal/przejazd.ts`: próg 60 px w 200 ms, cisza 400 ms, przejazd 700 ms (`cubic-bezier(.22, .8, .2, 1)`), dociągnięcie 300 ms; kółko w liniach ×33 px. Przewinięcie z zewnątrz (pasek, Ctrl+F, kotwice, Tab, wstecz) dociąga do bliższego położenia. Home/PgUp z dołu zatrzymują się na krawędzi Szybkiego dostępu.
- Dotyk: CSS `scroll-snap` (okładka + obszar; stopka ma własny punkt). Skutek uboczny: przy samym dole stopka pokazuje się w całości albo wcale.
- Test w Edge (prawdziwe zdarzenia kółka i klawiszy): 32 z 32 przy 1440×900, 1366×640, 1920×1080, także `/en/`; dotyk 390 i 1024 (emulacja). **Nie sprawdzone** na iOS Safari i Chrome na Androidzie (brak urządzeń).

## Odstępstwa (zebrane)
1. Ciemny motyw tylko w formie `[data-theme="dark"]` (zalecenie 10) — powód wyżej.
2. Rekrutacja w ciemnym motywie z granatowym napisem (zalecenie 13).
3. Liczby nad „Szybkim dostępem” gasną przy najechaniu środkowych działów w niskich oknach (zalecenie 15).
4. Ciekawostka bez JS: kolejne strony dostają kolejne ciekawostki z puli, nie wszystkie „pierwszą z puli” — żeby i bez JS nie było powtórzeń (zalecenie 19).
5. Zestaw ciekawostek losowany przy pierwszej stronie działu, nie całej witryny naraz (zalecenie 19) — dla odwiedzającego bez różnicy.
6. Przez szerszą kolumnę opisu ciekawostki (300 px zamiast 205) SIAD i Projekty i granty przy 1366 i 1440 px pokazują o jedną liczbę mniej (reguła „20 px przed opisem znaku”, jak `przytnijLiczby` w prototypie).

## Pytania do właściciela
1. **Zalecenie 10:** wdrożyć `--line-ui: #8c8679` w jasnym motywie (ramki 3:1)? Zrzut `z11-10-line-ui-propozycja-jasny.png`.
2. **Zalecenie 4:** czy pole `przyciski` na kierunkach jest jeszcze potrzebne? Czy dopisać do treści ISIM link „ISIM na stronie Wydziału” (zniknął razem z przyciskami)?
3. **Zalecenie 4:** linki pod opiekunem na stronie specjalności — lista linków (zalecenie 14, tak jest) czy przyciski-linki (zalecenie 4, „do potwierdzenia”)?
4. **Zalecenie 4:** `/nauka/sukcesy/historia` — nic do niej nie prowadzi. Zostawić, dodać link czy usunąć?
5. **Zalecenie 15:** etykieta „seminarium / seminaria / seminariów” liczy referaty — czy nie lepiej „referaty”?
6. **Zalecenie 16:** szkic mocniej i z cieniem także na telefonie — zostawić?
7. **Zalecenie 17:** kadr zdjęcia Studiów na telefonie (`z11-17-studia-390.jpg`) — dobry? Autor zdjęcia do podpisu?
8. **Zalecenie 19:** czy liczby mogą wchodzić pod opis ciekawostki, gdy opis stoi wyżej niż rząd liczb (komentarz w CSS: „liczby pod nim mogą iść dalej w prawo”)? Dziś jak w prototypie — kończą się 20 px przed opisem niezależnie od wysokości.
9. **Zalecenie 19:** pula ciekawostek w linii na każdej podstronie działu to ok. 53 KB (Instytut), 66 KB (Studia), 115 KB (Nauka) HTML, po kompresji 18 / 25 / 43 KB. Zostawić w linii (jak w zleceniu) czy przenieść do osobnego pliku działu w pamięci podręcznej przeglądarki (mniejsze strony, ale pierwsze wejście czeka na plik)? Do rozważenia przy pomiarach zlecenia 13.
10. **Zalecenie 19, dane:** ciekawostka `rektor-miary-zwarte` mówi „w 1953 r. Marczewski został rektorem”, a notka patrona w `src/lib/patroni.ts` — „rektor w latach 1957–1962”. Które jest prawdziwe?
11. **Zalecenie 20:** sprawdzenie na prawdziwym iPhonie i telefonie z Androidem (gładkość przejazdu, scroll-snap).
12. **Zalecenie 7:** czy jest angielska wersja strony Wydziału do linku z logo na `/en`?

## Pola CMS
Nowe pola: `src/data/ciekawostki/*.json` — `stan`, `strona`, `ukryta` (opcjonalne) oraz `nazwa_en`, `rok_en`, `zdanie_en`; opis w `.przekazanie/pola-do-cms.md` (sekcja „Zlecenie 11”) i `src/data/ciekawostki/README.md`. Dane są na razie w repozytorium kodu. Zmiany w istniejących danych CMS (bez nowych pól): USOSweb poza menu Studiów (`nawigacja.json`), plik `studia.jpg` (Web-Ustawienia), hasła stron z liczbami (lista wyżej).

## Zrzuty (`raport-zrzuty/`)
| Plik | Co pokazuje |
|---|---|
| `z11-01-barwienie-okladki-1440.jpg` | przed / po: okładka przy najechaniu Nauki |
| `z11-02-09-isim-1440.jpg` | przed / po: nagłówek ISIM (hasło i liczby, tytuł, ciekawostka) |
| `z11-02-struktura-1440.jpg` | przed / po: Struktura i zakłady |
| `z11-09-isim-390.png` | przed / po: ISIM na telefonie |
| `z11-02-nauka-baner-odstep-1440.jpg` | baner Nauki, odstęp 20 px przed notką |
| `z11-04-przyciski-pola-1440.jpg`, `z11-04-przyciski-pola-390.png` | Pracownicy, Seminarium, Rok akademicki; Aktualności, Kalendarz, Seminarium na telefonie |
| `z11-05-13-menu-dzialu-studia-1440.png` | pas menu Studiów z Rekrutacją |
| `z11-06-07-okladka-gorna-linia-1920.jpg` | przed / po: górna linia okładki |
| `z11-06-panel-hamburgera-1440.jpg` | panel hamburgera, jasny i ciemny |
| `z11-08-przelacznik-jezyka-en-1440.jpg` | przed / po: przełącznik języka na `/en` |
| `z11-10-ciemny-motyw-1440.png` | ciemny motyw, treść Studiów |
| `z11-10-line-ui-propozycja-jasny.png` | propozycja ramek 3:1 (niewdrożona) |
| `z11-14-wladze-1440.png`, `z11-14-granty-1440.png` | przed / po: wzorzec treści |
| `z11-15-liczby-nad-szybkim-dostepem-1440.jpg` | przed / po / po kliknięciu |
| `z11-16-szkic-studia-1920.jpg`, `z11-16-szkic-nauka-1920.jpg` | przed / po: szkic patrona |
| `z11-17-studia-baner-1920.jpg`, `z11-17-plan-naglowek-1920.jpg`, `z11-17-studia-390.jpg` | przed / po: zdjęcie z sali HS |
| `z11-17-studia-hs-3200.jpg` | plik zdjęcia do wgrania w Web-Ustawienia |
| `z11-19-ciekawostki-dwie-wizyty.jpg`, `z11-19-ciekawostki-390.png` | ciekawostki w dwóch wizytach (1440, 1920, 390) |
| `z11-19-rysowanie-po-najechaniu.png` | klatki rysowania znaku po najechaniu |
