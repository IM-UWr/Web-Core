# Dziennik zleceń (Claude Code, komputer użytkownika)

Przed zleceniami (31.10, ok. 22:30): 8 lokalnych commitów z `web-core-lokalne-commity.bundle` przywrócone jako historia gałęzi `agent-nauka-podglad` (`git fetch` z bundla + `git reset --mixed 235ac2c1`, pliki bez zmian, drzewo robocze było identyczne z `235ac2c1`). Uwaga: zasady.md mówią „nie commituj”, ale użytkownik w rozmowie pozwolił na lokalne commity (bez pushy) i prosi o numer commita w dzienniku.

## 02-animacje-dzialow — 2026-10-31 23:08
Status: zrobione (zlecenie 01 jeszcze niezrobione — za zgodą użytkownika 02 przed 01, zob. odstępstwa)
Commit: `b1fbd328` (lokalny, gałąź `agent-nauka-podglad`, bez pushu)

Zmienione pliki:
- `src/scripts/baner/silnik.ts` (nowy) — silnik: pomiar banera, maska „obrys linii”, płótna, pętla, pauzy, reduced-motion, nowy układ
- `src/scripts/baner/typy.ts` (nowy) — interfejs motywu i geometrii
- `src/scripts/baner/wspolne.ts` (nowy) — smoothstep, generator losowy
- `src/scripts/baner/motywy/lorenz.ts` (nowy) — Nauka
- `src/scripts/baner/motywy/fourier.ts` (nowy) — Aktualności
- `src/scripts/baner/motywy/dendryt.ts` (nowy) — Instytut
- `src/scripts/baner/motywy/riemann.ts` (nowy) — Studia
- `src/scripts/baner/motywy/zloty-podzial.ts` (nowy) — Popularyzacja
- `src/lib/motywyBanerow.ts` (nowy) — mapa strona → motyw
- `src/components/NaglowekStrony.astro` — atrybut `data-animacja`, skrypt silnika (tylko na stronach z motywem), usunięta stara fala na requestAnimationFrame
- `src/styles/telefon.css` — płótna `.ph-anim`, token koloru `--ph-rysunek`, gaśnięcie `.ph-m`, szary akcent statycznego rysunku (wszystko w `@media (max-width: 760px)`)

Kryteria odbioru:
1. Build i konsola — spełnione. `npm run build` bez błędów i ostrzeżeń; na zbudowanej stronie (astro preview) Nauka, Instytut, Studia, Aktualności, Popularyzacja i /en/nauka/ bez komunikatów w konsoli.
2. Animacje zgodne z prototypami (390 px) — spełnione; parametry przeniesione 1:1 z ustawień „telefon” prototypów (krycie, tempo, liczba wyrazów/punktów, ziarno 1951, obrót 5°, start komety w niewidocznej części, `podHaslem` 70 we Fourierze, złoty podział nad hasłem od paska menu + 6 px do hasła − 6 px). Kolor: biały z niskim kryciem z tokenu `--ph-rysunek`. Sprawdzone zrzutami w przeglądarce. Wyjątek: Riemann losowo, nie w kółko (odstępstwa).
3. Klatki (pomiar: licznik nałożeń maski na płótna, okno 15–40 s; z wymuszonym ruchem — w przeglądarce testowej system ma „ogranicz ruch”):
   - Nauka (Lorenz): atraktor 0 kl./s; kometa średnio 15,3 kl./s, odstępy 42–112 ms (10–24 kl./s zależnie od prędkości, jak w prototypie) — wyjątek przewidziany w zleceniu;
   - Aktualności (Fourier): budowanie 4,3 kl./s (21 s), spoczynek 3,6 kl./s (oddychanie + losowe rozkłady);
   - Instytut (dendryt): 4,3 kl./s;
   - Studia (Riemann): 2,3 kl./s;
   - Popularyzacja (złoty podział): budowanie ok. 8 kl./s (jednorazowe, ok. 30 s), spoczynek 3,2 kl./s (40 s; przed zmniejszeniem kroku gaśnięcia elementu z 40 do 20 stopni krycia było 4,1).
   - Poza ekranem i w karcie w tle: pętla zatrzymana (IntersectionObserver + visibilitychange; czas motywu stoi). Sprawdzone w kodzie, nie pomiarem.
4. prefers-reduced-motion — spełnione: na wszystkich 5 stronach gotowy rysunek, 0 klatek w 5 s (przeglądarka testowa ma to ustawienie w systemie).
5. Brak requestAnimationFrame — spełnione: stary skrypt fali usunięty; w `NaglowekStrony.astro` i `src/scripts/` słowo występuje tylko w komentarzach.
6. Długi tytuł — spełnione: w przeglądarce tymczasowo „Popularyzacja matematyki we Wrocławiu” (2 linie) na Popularyzacji i na Nauce. Silnik przeliczył układ (baner 254 → 282 px). Maska po liniach: w pasie pierwszej linii (koniec ok. 347 px z 390) rysunek znika, obok krótszej drugiej linii i przy „← Strona główna” jest widoczny; nigdzie nie wchodzi pod tekst. Lorenz wygląda dobrze; złoty podział jest wtedy przecięty pasem pierwszej linii (zob. pytania).
7. Komputer bez zmian — spełnione: przy 1280 px brak płótna, brak wczytanego motywu, `.ph-m` jak dziś. Porównanie zbudowanego HTML z wersją sprzed zmian (build `235ac2c1` w osobnym katalogu): różnice tylko na 5 stronach działów (PL i EN) — atrybut `data-animacja` i `<script type="module">` silnika; na Aktualnościach dodatkowo usunięty stary skrypt fali. Inne strony (granty, władze, kalendarz, plan zajęć, seminaria, seminarium) — HTML identyczny. CSS: wszystkie zmiany w `@media (max-width: 760px)`. Jedyna różnica widoczna na komputerze: bursztynowa fala Aktualności stoi (wcześniej skrypt rAF ją animował) — wynika z kryterium 5.
8. Tryb ciemny na telefonie — spełnione: kolor rysunku 210, 222, 240 (lekko przygaszony), rysunek słaby, ale widoczny; hasło jedynym bursztynem (zrzut Instytutu).
9. Silnik gotowy na kolejne motywy (dla zleceń 03–05): nowy motyw to plik `src/scripts/baner/motywy/<nazwa>.ts`, który eksportuje domyślnie fabrykę `(G, t0) => Motyw` i opcjonalnie `ustawienia` maski (`granica`, `podHaslem`, `przejscie`), plus wpis `'<adres strony>': '<nazwa>'` w `src/lib/motywyBanerow.ts` (adres bez bazy, bez /en, bez ukośników na końcach). Silnik znajduje plik sam (`import.meta.glob`) i ładuje tylko jego kod. Motyw rysuje we współrzędnych banera; `G` daje pole (`y0`/`y1` — od linku „←” do kreski nad liczbami − 12 px), `widac(x, y)`, `granica(y)`, linie tytułu, hasło, dół paska menu i `rgba(krycie)` w kolorze z tokenu. `krok(t)` zwraca, które warstwy przerysować (`a` — stała, `b` — ruchoma, może zwrócić pudło do częściowego czyszczenia) i za ile sekund obudzić pętlę; `gotowy()` daje rysunek dla reduced-motion. Można też podać motyw wprost propem `motyw` w `NaglowekStrony`.
10. Rozmiary (build, bez kompresji): silnik 8,8 KB (wspólny dla wszystkich), lorenz 4,0 KB, fourier 2,0 KB, dendryt 2,5 KB, riemann 2,3 KB, zloty-podzial 6,4 KB — każdy ≤ 15 KB. Strona wczytuje tylko swój motyw (sprawdzone w zakładce sieci).
11. Ten wpis — spełnione.

Odstępstwa od zlecenia i powody:
- Kolejność: 02 przed 01 (decyzja użytkownika). Działy miały już na telefonie hasło, kreskę i liczby, a tabela 01 przewiduje dla nich „bez zmian”. Silnik mierzy `.wstecz`, `h1`, `.ph-haslo`, `.pt-liczby`, więc po 01 zadziała też na podstronach.
- Atrybut `data-animacja` zamiast `data-motyw` (przykład ze zlecenia): `data-motyw` oznacza w `Naglowek.astro` przycisk trybu jasny/ciemny i jego skrypt podpina kliknięcie pod każdy taki element — kliknięcie w baner przełączałoby motyw. Wyłapane porównaniem HTML przed commitem.
- Riemann: w prototypie poziom podziału szedł w kółko (cykl 40 s), co łamie zasadę „losowo, nie w kółko” (zauważył to też agent prototypów). Teraz co losową przerwę (średnio 6 s, ±60%) podział przechodzi do losowego innego poziomu (5/10/20/40 przedziałów) w tempie prototypu; między zmianami rysunek stoi.
- Dendryt: przejścia gałęzi 8 kl./s zamiast 12 (inaczej średnia ok. 6 kl./s, ponad limit 5); zmiana krycia na klatkę < 1%, schodków nie widać.
- Maska pod hasłem: granica przy linii hasła nie wychodzi dalej w prawo niż przy ostatniej linii tytułu (minus `podHaslem` motywu). Daje to dokładnie zachowanie prototypów działów (rysunek może zachodzić pod hasło za końcem krótkiego tytułu), a przy długim tytule hasło jest objęte jak każda linia.
- Pole rysunku wspólne (link „←” + 2 px do kreski − 12 px) także dla Fouriera (prototyp: − 6 px) i Riemanna (prototyp: od dołu linku „←”) — różnica kilku pikseli wysokości.
- Statyczny rysunek `.ph-m` na telefonie: bursztynowy akcent (`::after`) teraz szary na wszystkich stronach (zlecenie 02: „szary na telefonie”; to samo wymaga kryterium 5 zlecenia 01).
- Aktualności na komputerze: fala już się nie porusza (zob. kryterium 7).

Pytania do użytkownika:
- Złoty podział przy długim, dwuliniowym tytule jest przecięty pasem pierwszej linii (widać górę i dół konstrukcji). Dzisiejszy tytuł „Popularyzacja” jest krótki, więc problem nie występuje. Czy dla długich tytułów zmniejszać konstrukcję i przesuwać ją obok ostatniej linii?
- Na komputerze bursztynowa fala Aktualności stoi. Zostawić tak do decyzji o animacjach na komputerze?
- W systemie tego komputera (Windows) najwyraźniej jest wyłączony ruch („Efekty animacji” albo podobne): przeglądarka zgłasza `prefers-reduced-motion: reduce`. Wtedy strona pokazuje gotowe, nieruchome rysunki. Żeby zobaczyć ruch, trzeba włączyć animacje w systemie albo oglądać na telefonie.

Co sprawdzić:
- Telefon (390 px), strony: /nauka/, /aktualnosci/, /instytut/, /studia/, /popularyzacja/ i wersje /en/ — ruch, tempo, zanik przy tekście, kolor; Fourier buduje się 20 s, złoty podział ok. 30 s.
- Tryb ciemny (przycisk księżyca) — rysunek słaby, ale widoczny.
- Komputer (1280 px) — bez płótna, rysunki jak dotąd (fala Aktualności nieruchoma).
- `npm run build`; w konsoli brak błędów.

## 01-uklad-banerow — 2026-10-31 23:55
Status: zrobione (po zleceniu 02, za zgodą użytkownika)
Commit: `2c590dfe` (lokalny, gałąź `agent-nauka-podglad`, bez pushu). Zmiany w danych (nakładka `src/data`, `src/content`) są poza gitem — lista w `pola-do-cms.md`.
Wykonanie: część wspólną zrobił koordynator, a widoki czterech grup stron czterej podagenci, każdy na swoich plikach. Wynik przejrzał i poprawił koordynator, a build i sprawdzenia poniżej zrobił sam.

Zmienione pliki (kod):
- wspólne:
  - `src/content.config.ts`: pola `haslo`/`haslo_en` (strony, seminaria, zakłady, kierunki, specjalności), `strony.liczby`, `kierunki.fakty[].etykieta_krotka(_en)`;
  - `src/components/LiczbyBanera.astro`: przyjmuje też gotowe napisy;
  - `src/components/NaglowekStrony.astro`: `nadtytulTelefon`, `wstecz.telefon`;
  - `src/components/Wstecz.astro`: krótsza etykieta tylko na telefonie;
  - `src/views/Strona.astro`: hasło i liczby z front matter;
  - `src/styles/telefon.css`: 4 px pod hasłem w banerze bez liczb;
  - `src/lib/liczbyTerminow.ts` (nowy): jedne definicje wydarzeń, referatów, obron i nowych ogłoszeń.
- wydarzenia: `ListaAktualnosci`, `Kalendarz`, `ListaSeminariow`, `Seminarium`, `ListaObron`, `Obrona`, `ListaKonferencji` (`src/views/*.astro`).
- badania: `ListaGrantow`, `Grant`, `Publikacje`, `PublikacjeRok`, `ListaSukcesow`, `publikacjeDane.ts`.
- studia: `Kierunek`, `Specjalnosc`, `PlanZajec`, `RokAkademicki`.
- instytut i ogólne: `Zaklad`, `ListaZakladow`, `Pracownicy`, `src/components/TabelaPracownikow.tsx`, `Wladze`, `ListaWartoWiedziec`, `WartoWiedziecWpis`, `Szukaj`, `src/pages/404.astro`, `src/layouts/Baza.astro` (prop `pozaIndeksem` tylko dla 404).
- dane (poza gitem): zob. `pola-do-cms.md`.

Kryteria odbioru:
1. Build — spełnione: `npm run build` bez błędów i ostrzeżeń, 748 stron.
2. Baner na telefonie (390 px; zbudowana strona, pomiar w przeglądarce, PL i EN) — spełnione. Wartości:
   - Aktualności 2·4·5, Kalendarz 2·5·4 (bez „z 30 dni”), Seminaria 9·5·22.
   - Seminarium AH 1·2·5. Seminaria bez referatów w danych mają tylko liczbę koordynatorów, bo zera się pomija (np. Geometria: 1 koordynator).
   - Obrony: 2 nadchodzące · 6 odbytych. Obrona: „21 wrz / poniedziałek, 2026” · „17:00 / sala WS” · „3 recenzje”.
   - Konferencje: 2 w 2026 roku · 52 od 2013 roku · 15 we Wrocławiu (bez odwołanych).
   - Granty 5·87·94. Grant: hasło „UE i międzynarodowe · 2005–2009”, bez liczb.
   - Publikacje 2165·23 (2003–2025)·3, rocznik 2010: 113·53·68, Sukcesy 138·8·12.
   - Historia sukcesów 32·100·1946 (stałe w danych, policzone raz z treści).
   - Kierunki: Matematyka 3 lata·2 lata·5, SIAD 6·180·70, ISIM 3 lata·210·2, szkoła doktorska 17·8·270.
   - Specjalności: I i II · 4. sem. · 17 (AD), 14, 32 (1. sem.), 22, 15 — z danych specjalności.
   - Rok akademicki 75·40·35.
   - Egzaminy 81·65·25, Skrypty 30·7·25 (prototyp miał 33, ale wliczał 3 linki z „Innych źródeł”), Podyplomowe 3·380·90, SD Dokumenty 29·15·4 — stałe w danych.
   - Pracownicy 129·8·17, Struktura 18·16·43, zakłady jak w prototypach (np. Geometria 14·8·2).
3. Bez długiego opisu, przycisków i koordynatorów w banerze — spełnione: na wszystkich sprawdzonych stronach w banerze nie ma nic klikalnego poza „←” ani widocznego opisu. Kierunki nie mają przycisków ani kafelków faktów.
4. Wysokość 200–330 px — spełniona z wyjątkami:
   - tytuły w 3 liniach: ISIM 372 px, Archiwalne programy 261 px;
   - tytuły w 4 liniach (ponad wyjątek ze zlecenia): Dyskretna analiza harmoniczna 371 px, Teoria prawdopodobieństwa i modelowanie stochastyczne 371 px;
   - tytuł w 2 liniach i dwulinijkowe etykiety: Matematyka aktuarialno-finansowa 344 px.
   Pozostałe strony 204–328 px (SIAD 328).
5. Rysunek szary, jeden bursztyn — spełnione: akcent statycznego rysunku jest szary od zlecenia 02. Sprawdzone automatycznie: poza hasłem nie ma w banerze bursztynowego tekstu.
6. Pracownicy — spełnione na zbudowanej stronie: lista „Wszyscy ▾” (grupy Kto: 4, Zakład: 9) + „Szukaj”, bez pastylek. Po wybraniu „Doktoranci” jest „Znaleziono 17 osób” (17 wierszy), po wpisaniu „karch” — „Znaleziono 1 osobę”. Komunikat jest w `aria-live`.
7. Linki powrotu — spełnione: na telefonie „← Seminaria” / „← Obrony doktorskie” (EN „Seminars”, „PhD defences”). Na komputerze zostaje dawny napis (osobna etykieta w `Wstecz`).
8. 404 — spełnione: brak paska, `noindex, nofollow`, brak canonical, brak `data-pagefind-body`, poza indeksem pagefind.
9. EN — spełnione: hasła i etykiety po angielsku (sprawdzone m.in. seminaria, obrona, SIAD, granty, pracownicy, struktura, AD, egzaminy, aktualności, kalendarz). Na stronach EN brane są tylko pola `_en`.
10. Komputer bez zmian — spełnione:
    - HTML wszystkich 748 stron porównany z buildem sprzed zlecenia (stan po 02), po usunięciu bloków `.tylko-telefon` i klasy `tylko-komputer`: identyczny poza 404 (zamierzone) i losowym `uid` wyspy React na Pracownikach.
    - Przy 1280 px na 44 stronach (wszystkie typy z tabeli, PL i EN) położenie, wymiary, kolory, kroje i teksty każdego widocznego elementu są identyczne.
11. Tryb ciemny — spełnione: hasło, liczby, nadtytuł i filtry czytelne (zrzut specjalności AD, Pracownicy sprawdzeni przez podagenta).
12. `pola-do-cms.md` uzupełniony (z repozytoriami ustalonymi na klonach `.tresci`). Ten wpis.

Odstępstwa od zlecenia i powody:
- Kolejność 02 → 01 (decyzja użytkownika).
- Kafelki liczb `.stats` pod banerem (tylko telefon) usunięte w Grantach, Publikacjach, Sukcesach i Strukturze. Te kafelki zastępowały na telefonie liczby z banera komputerowego, więc po zmianie dublowały liczby z banera. Z telefonu znikają przez to m.in. „73 z NCN”, „11 z UE” i liczba doktorantów w Strukturze. Łatwo przywrócić.
- Grant: plakietki i tytuł w drugim języku na telefonie są pod banerem. Rocznik: przycisk „Wykaz w PDF” też jest pod banerem.
- Seminarium: koordynatorzy, e-mail i zakład w zwartym bloku pod banerem. Obrona: tytuł rozprawy na telefonie pod banerem, bo w banerze zostaje imię i nazwisko.
- Wpis Warto wiedzieć: zajawka i link do działu są pod banerem. Zakład: obszary badań są pod banerem.
- Specjalność: nadtytuł na telefonie to „Specjalność · skrót” (jak w prototypie), a nie samo „Specjalność”. Skrót i poziom zniknęły z banera.
- Szkoła doktorska (widok kierunku): na telefonie nadtytuł skrócony do „Kolegium Doktorskie Matematyki”.
- Liczby kierunków: z pola `fakty` — pierwsze trzy fakty z wartością od cyfry, z krótszą etykietą `etykieta_krotka` (nowe pole). Szkoła doktorska: liczba doktorantów liczona ze spisu pracowników.
- Stałe liczby (pole `liczby` w danych) na 5 stronach Studiów i w historii sukcesów: te wartości to fakty z treści albo wymagałyby parsowania Markdownu.
- Obrona: etykieta daty to „dzień tygodnia, rok” (jak w prototypie animacji). Etykieta godziny to sala, a bez niej „godzina”.
- Konferencje: etykiety „w 2026 roku · od 2013 roku · we Wrocławiu”.
- Hasło Zakładu Teorii Prawdopodobieństwa („Procesy gaussowskie i teoria ryzyka”) jest nowe: brak go w prototypach.
- Odmiana rzeczowników męskoosobowych po 2–4: dopełniacz („2 koordynatorów”, „43 doktorów”).

Pytania do użytkownika:
- Kafelki `.stats` pod banerem na telefonie (Granty, Publikacje, Sukcesy, Struktura): usunąć jak teraz czy przywrócić?
- Bardzo długie tytuły seminariów (4 linie, 371 px) i ISIM (3 linie, 372 px): mniejszy krój tytułu na telefonie, krótsza nazwa do banera, czy zostawić?
- Hasła robocze: m.in. Teoria prawdopodobieństwa (zakład), „Nonlinear PDEs” (EN, skrócone), EN dydaktyki „Teaching and talking mathematics” (skrócone, żeby było w 1 linii).
- „Archiwalne programy studiów”: link „←” prowadzi do strony głównej, bo strony nie ma w menu. Poprawka (np. „← Studia”) zmieniłaby też komputer — zrobić?
- Strona „Zadania z egzaminów” (`studia/egzaminy-i-dyplom/zadania`) nie ma hasła (nie było jej w tabeli). Propozycja: „Archiwum zadań od 2002 r.”.

Co sprawdzić:
- Telefon (390 px): strony z tabeli zlecenia, PL i /en/, także tryb ciemny.
- Pracownicy: lista „Wszyscy ▾” i „Szukaj”.
- 404: brak paska „Podgląd”.
- Komputer (1280 px): wygląd bez zmian.
- **Serwer `npm run dev` trzeba uruchomić od nowa** (`npm run dev -- --force`). Pomocniczy build starej wersji w scratchpadzie (porównanie przy zleceniu 02) nadpisał `node_modules/.vite/deps`, więc w działającym serwerze dev komponenty React (np. lista Pracowników) się nie podpinają. Zbudowana strona działa poprawnie.

## 07-granice-rysunkow — 2026-11-01 00:09
Status: zrobione
Commit: `fc977d64` (lokalny, bez pushu)
Zmienione pliki:
- `src/scripts/baner/silnik.ts`: pole, maska przerw, hasło na całą długość, pionowe wygaszenie, płótno do dołu pola; przy okazji wariant i dane motywu dla 03–05;
- `src/scripts/baner/typy.ts`: komentarze pola, usunięte `podHaslem`, nowe `wariant` i `dane`;
- motywy w `src/scripts/baner/motywy/`: `fourier.ts`, `zloty-podzial.ts`, `dendryt.ts`, `lorenz.ts`;
- `src/components/NaglowekStrony.astro`: „nazwa/wariant”, `motywDane`;
- `src/lib/motywyBanerow.ts`: klucze „adres/*”.

Kryteria odbioru (pomiar na zbudowanej stronie przy 390×844, gotowy rysunek przy wymuszonym ograniczeniu ruchu, `getImageData` wszystkich płócien):
1. Build — spełnione: bez błędów i ostrzeżeń, konsola czysta.
2. Dół — spełnione: na 5 działach i /en/nauka/ suma krycia pikseli poniżej połowy hasła wynosi 0. Przed zmianą było 12–398, najwięcej w Studiach (Riemann).
3. Przerwy — spełnione:
   - Krycie w przerwach „← Strona główna”–tytuł i tytuł–hasło (do końca dłuższej linii + granica) wynosi 0.
   - Przed zmianą: Nauka 107, Studia 54.
   - W Nauce atraktor nie przechodzi już między linkiem a „Nauka”.
4. Góra — spełnione: płótno zaczyna się na 67 px (pasek menu 61 + 6), nad nim krycie 0.
5. Dopasowanie (390×844):
   - **Poprawka (1.11, podczas zlecenia 03):** pierwsze liczby w tym punkcie były zawyżone. Mierzyłem w ukrytym panelu przeglądarki, gdzie animacja wejścia tekstu (`przejscia.css`, 12 px) stała w miejscu, więc tekst był 12 px niżej niż naprawdę. Wartości poniżej są po korekcie (tekst na miejscu).
   - Pole przed: od linku + 2 px do 12 px nad kreską, 84–189 px (105 px). Pole po: 67–171 px (104 px).
   - Środek pola przesunął się o ok. 17 px w górę, a wysokość prawie się nie zmieniła (−1%). Motywy liczone z pola przesunęły się więc w górę o ok. 17 px przy tej samej wielkości; zmniejszania nie było.
   - Lorenz, Fourier, Riemann: środek ok. 17 px wyżej, skala ok. 99%.
   - Dendryt: losowanie w polu 69–169 zamiast 86–196, czyli ok. 22 px wyżej, wysokość 91% (dawniej sięgał 7 px pod dół pola).
   - Złoty podział: bez zmian (już stał nad hasłem); proste przycięte do pola.
   - Na dolnej granicy nic nie jest ucięte.
6. Długi tytuł — spełnione. Tymczasowo „Popularyzacja matematyki we Wrocławiu” na Nauce i Popularyzacji:
   - pole 67–210, pod połową hasła krycie 0, nad menu 0;
   - w przerwie tytuł–hasło tylko 4 jednostki w strefie przejścia za krótszą drugą linią tytułu (dozwolone).
7. Tryb ciemny, ograniczony ruch i zmiana rozmiaru — spełnione: ta sama maska i pole (liczone z układu, kolor nie wpływa); pomiar robiony w trybie ograniczonego ruchu.
8. Wydajność — spełnione: Nauka (kometa) 14 kl./s (w 02 było 15), Instytut 4,3 kl./s (w 02 było 4,3).
9. Komputer — spełnione: HTML 748 stron taki jak po 01. Różnice na 6 stronach wynikają tylko z daty budowy („dziś”, nowe ogłoszenia z 30 dni). Silnik działa tylko na telefonie.
10. Ten wpis — Nauka i Studia przed i po opisane w pkt 2–5.

Odstępstwa od zlecenia i powody:
- Wielkość rysunków działów praktycznie bez zmian (pole 104 zamiast 105 px), tylko przesunięcie w górę o ok. 17 px.
- Pole i maska przyjmują już wariant motywu i dane z budowy strony; to przygotowanie pod 03–05.

Pytania do użytkownika:
- Brak. (Wcześniejsze pytanie o powiększenie o 10% było skutkiem błędnego pomiaru — zob. pkt 5.)

## 03-animacje-nauka-seminaria-zaklady — 2026-11-01 10:53
Status: zrobione
Commit: `1c645c59` (lokalny, bez pushu)
Wykonanie: motywy pisali czterej podagenci (wydarzenia, analiza, struktury, badania), każdy na swoich plikach. Mapę, przypisanie zakładów i silnik zrobił koordynator, on też zbudował stronę i sprawdził wynik.

Zmienione pliki:
- **Nowe motywy** w `src/scripts/baner/motywy/`:
  - wydarzenia: `banach.ts`, `genealogia.ts`, `trzy-odleglosci.ts`;
  - analiza: `rozsadnik.ts`, `haar.ts`, `czebyszew.ts`, `wahadlo.ts`, `brown.ts`, `histogram.ts`, wspólne `_analiza.ts`;
  - struktury: `longimetr.ts`, `knaster.ts`, `eliptyczna.ts`, `geoplan.ts`;
  - badania: `wachlarz.ts`, `cytowania.ts` (wspólne łuki), `wspolautorzy.ts`, `bernoulli.ts`.
- **Zmienione:**
  - `src/lib/motywyBanerow.ts`: mapa stron;
  - `src/views/Zaklad.astro`: wariant „zaklad” motywu seminarium zakładu, bez seminarium — Lorenz;
  - `src/views/Grant.astro`, `Publikacje.astro`, `PublikacjeRok.astro`, `publikacjeDane.ts`: dane dla motywu (`motywDane`);
  - `src/scripts/baner/silnik.ts`: nowy pomiar po końcu wejścia tekstu, czyli `animationend`.

Kryteria odbioru:
1. Build i konsola — spełnione. `npm run build` bez błędów i ostrzeżeń. Na 14 stronach przejrzanych w przeglądarce (zbudowana strona) konsola bez błędów; na 32 stronach (zob. pkt 2) silnik wystartował bez ostrzeżeń `[baner]`.
2. Motyw każdej strony — spełnione. Sprawdziłem 32 strony (390 px): wszystkie seminaria, wszystkie 9 zakładów, Konferencje, Obrony, Obrona, Kalendarz, Granty, Grant, Publikacje, rocznik 2010, Sukcesy, Historia i 2 strony EN.
   - Na każdej motyw wystartował i ma właściwy wariant.
   - Każda wczytuje tylko swój kod (seminaria analizy dodatkowo `_analiza` 0,9 KB, rocznik — `cytowania`).
   - Gotowy rysunek mieści się w polu: pod połową hasła i nad paskiem menu krycie 0.
   - Kolor szaro-biały z tokenu.
   - Zgodność z prototypami podagenci sprawdzili zrzutami i odczytem pikseli (prototyp otwierany przez serwer dev).
3. Kalendarz bez bursztynowego motyla — spełnione: animacja trzech odległości. Statyczny rysunek od 02 jest szary.
4. Wydajność i dostępność — spełnione.
   - Spoczynek (pomiary podagentów, ≥ 30 s; moje kontrolne w nawiasach):
     - banach 4,4–4,7 w czasie wzrostu, ok. 1,8 między łamanymi (moje: 1,8);
     - genealogia 3,1, obrona 3,3; trzy odległości 0,8–2,0; rozsadnik 1,4;
     - haar 0,4–0,6 (moje, długi tytuł: 0,58); czebyszew 1,8–3,2; wahadło 2,9–3,9; brown 1,4–1,8; histogram 0,8–1,0;
     - longimetr 2,1–2,3; knaster 3,9 (moje: 4,1); eliptyczna 3,9; geoplan 2,6;
     - wachlarz 3,2–4,3 (moje: 0,8 w przerwie); cytowania 3,6–4; współautorzy 3,7; bernoulli 2,2.
   - Ograniczony ruch: statyczny rysunek, zero klatek, sprawdzony na wszystkich stronach.
   - Długi tytuł „Analiza harmoniczna i rozwinięcia ortogonalne” i tytuły 3- i 4-liniowe: granice trzymają.
   - Tryb ciemny: kolor z tokenu, hasło jedynym akcentem.
5. Rozmiary po budowie (bez kompresji):
   - wydarzenia: banach 3,2 KB, genealogia 4,9, trzy-odleglosci 2,5;
   - analiza: rozsadnik 1,2, haar 4,8, czebyszew 2,2, wahadlo 4,3, brown 3,1, histogram 2,5 (+ wspólne `_analiza` 0,9);
   - struktury: longimetr 3,7, knaster 3,4, eliptyczna 4,4, geoplan 4,6;
   - badania: wachlarz 3,2, cytowania 4,7, wspolautorzy 0,6 (+ cytowania), bernoulli 2,8;
   - silnik: 10,8 KB, wspólny.
6. Komputer bez zmian — spełnione: HTML 748 stron identyczny z buildem po 07, poza atrybutem `data-animacja*` i skryptem silnika (bez wpływu na wygląd na komputerze); CSS bez zmian.
7. Ten wpis.

Dopasowanie do pola (390×844): środki rysunków 10–28 px wyżej niż w prototypach. Skala w pionie:
- 100%: banach, genealogia, trzy odległości, wachlarz (ok. 93%), cytowania i bernoulli (ok. 95%);
- 89–94%: rozsadnik, haar, czebyszew, brown;
- 86–88%: wahadło i histogram (spłaszczenie wykresu);
- 83%: longimetr, knaster i eliptyczna przy jednoliniowym tytule (87–89% przy dłuższych), więcej niż 15% — uzasadnienie w odstępstwach.

Odstępstwa od zlecenia i powody:
- **Zmniejszenie powyżej 15% (struktury: 83% w pionie).** Pole w prototypie miało 114 px, nowe ma 104 px, a dół musi zostać 6–12 px nad połową hasła. Zmniejszone jest tylko w pionie (spłaszczenie łuków, krzywych i rozrzutu); szerokość i kratki geoplanu bez zmian.
- **Zakład Teorii Prawdopodobieństwa** (prototyp nie miał wariantu): ruch Browna w duchu teorii ryzyka — trzy trajektorie B(t) − ct, linie bieżącego maksimum i przerywany poziom ruiny u. Do akceptacji.
- **Rzadsze klatki przy wzroście linii** (krok 0,6–0,75 px zamiast 0,5 px) w knasterze, krzywej eliptycznej, wahadle, cytowaniach i Czebyszewie, żeby średnia mieściła się w 5 kl./s. Tempo linii bez zmian.
- **Czebyszew i Brown:** losowanie zdarzeń tylko tam, gdzie zmiana jest możliwa albo widoczna (w prototypie zdarzały się długie przestoje).
- **Bernoulli:** przestawienie, które wyprowadziłoby ścieżkę nad pole, losuje się od nowa. Historia ma osobny wariant (gęstsza ścieżka, znaczki dekad).
- **Krzywa eliptyczna:** gdy konstrukcja nie mieści się obok długiego tytułu (EN Algebra), widać samą krzywą.
- **Zanik 10 px przy prawym brzegu treści** jak w prototypach struktur — w kolorze motywu (silnik go nie robi).

Pytania do użytkownika:
- Wariant Browna dla Zakładu Teorii Prawdopodobieństwa (teoria ryzyka) — akceptujesz?
- Spłaszczenie motywów struktur do 83% w pionie przy krótkich tytułach — w porządku?

## 04-animacje-studia — 2026-11-01 11:44
Status: zrobione
Commit: `a6ec9087` (lokalny, bez pushu)
Wykonanie: motywy pisało dwóch podagentów (kierunki i specjalności; codzienność). Mapę zrobił koordynator, on też zbudował stronę i sprawdził wynik.

Zmienione pliki:
- **Nowe motywy** w `src/scripts/baner/motywy/`: `gradient.ts`, `permutacje.ts`, `kmeans.ts`, `przezycie.ts`, `okrag.ts`, `lotka.ts`, `kule.ts`, `droga.ts`.
- **Zmienione:**
  - motywy: `trzy-odleglosci.ts` (wariant `rytm`), `banach.ts` (wariant `pajeczyna`), `geoplan.ts` (wariant `podyplomowe`), `_analiza.ts` (tylko komentarz, bo korzystają z niego też motywy Studiów);
  - `src/lib/motywyBanerow.ts`: mapa Studiów i reguła „studia/*” → Riemann.

Kryteria odbioru:
1. Build i konsola — spełnione: `npm run build` bez błędów i ostrzeżeń. Na stronach sprawdzonych w zbudowanej wersji silnik wystartował bez ostrzeżeń; podagenci: brak błędów w konsoli.
2. Motyw każdej strony — spełnione. Sprawdziłem 26 stron (390 px, zbudowana strona):
   - kierunki: Matematyka, SIAD, ISIM;
   - wszystkie specjalności;
   - codzienność: plan zajęć, rok akademicki, zajęcia, pierwszy rok, egzaminy, procedura, szkoła doktorska i 2 podstrony, podyplomowe;
   - z Riemannem działu: MOST, skrypty, zadania z egzaminów (spoza tabeli);
   - EN: SIAD, ISIM, plan zajęć.

   Na każdej motyw wystartował z właściwym wariantem i wczytał tylko swój kod. Gotowy rysunek: pod połową hasła i nad paskiem menu krycie 0. Kalendarz zajęć to przekierowanie (bez banera).
3. Ten sam kod Riemanna — spełnione: Matematyka i strony Studiów spoza tabeli mają `data-animacja="riemann"` i wczytują ten sam plik co dział.
4. Wydajność i dostępność — spełnione. Pomiary podagentów (≥ 20–30 s albo symulacja pętli silnika):
   - kierunki i specjalności: gradient (SIAD) 2,5–2,8 kl./s, permutacje (ISIM) 1,6, kmeans 1,8, przezycie 1,0, okrag 0,7, lotka 1,0, kule 0,6;
   - codzienność: droga 3,6, rytm 2,2–2,4, pajęczyna 2,3–2,8 (chwilowo do 9 przy wyłanianiu odcinków), podyplomowe 2,3–2,7.

   Ograniczony ruch: statyczny rysunek na wszystkich stronach, także EN SIAD i ISIM. Tryb ciemny: kolor z tokenu.
5. Komputer bez zmian — spełnione: HTML 748 stron identyczny z buildem po 03, poza znacznikami motywu.
6. Ten wpis.

Rozmiary po budowie: gradient 4,0 KB, permutacje 3,0, kmeans 3,9, przezycie 2,4, okrag 4,9, lotka 3,0, kule 2,3, droga 2,4. Warianty powiększyły trzy-odleglosci do 3,4 KB, banach do 5,6 i geoplan do 5,8 (wszystko ≤ 15 KB).

Dopasowanie do pola (390 px): środki 6–48 px wyżej niż w prototypach. Skala 91–100%. W gradiencie SIAD minimum doliny przesunięte o 48 px w górę, żeby kółko nie leżało pod tytułem.

Odstępstwa od zlecenia i powody:
- **Pajęczyna w szkole doktorskiej jest zmniejszona do 50–70%** (szkoła 55%, podstrony 50–70%). Długi nadtytuł „Kolegium Doktorskie Matematyki” i dwuliniowe tytuły podstron zasłaniają środek pola. Przy 100% punkt stały wypadałby pod tekstem. Zmniejszanie krokami po 5%, aż punkt stały będzie widoczny. Na EN Rekrutacji punkt stały i tak zostaje częściowo pod tytułem.
- **ISIM:** ruch skrzyżowań trochę mocniejszy niż w prototypie (2–4 px, do 2 px/s), bo prototyp zgłaszał za słaby ruch. Tempo zmian nici zgodnie z tabelą.
- **Rytm:** łuk losowo dzieli się albo łączy (zgodnie z opisem w zleceniu). Kod prototypu robił to na przemian.
- **Nauczycielska (91%) i stosowana (92%):** w prototypach część konstrukcji i największa orbita wychodziły poza pole.
- **k-średnie:** grupa nie znika do zera (w prototypie mogła po długim czasie).
- **Podyplomowe:** korzysta z mechaniki geoplanu seminarium. Ma budowę 2,5 s, której prototyp nie miał.
- **Długie hasła i tytuły zasłaniają część rysunku.** Np. przy haśle Planu zajęć łuki widać od x ≈ 260 px. Tak działa maska silnika.

Pytania do użytkownika:
- Pajęczyna w szkole doktorskiej zmniejszona do 50–70%, żeby punkt stały był widoczny. Zostawić tak, czy 100% z punktem stałym pod tekstem?

## 05-animacje-instytut-ogolne — 2026-11-01 12:23
Status: zrobione
Commit: `dc5efbf3` (lokalny, bez pushu)
Wykonanie: motywy pisało dwóch podagentów (podstrony Instytutu; strony ogólne). Mapę i poprawkę silnika zrobił koordynator, on też zbudował stronę i sprawdził wynik.

Zmienione pliki:
- Nowe motywy w `src/scripts/baner/motywy/`: `kanapka.ts`, `luki.ts`, `dendrogram.ts`, `mapa.ts`, `motyl.ts`, `kratka.ts`.
- Zmienione motywy: `trzy-odleglosci.ts` (wariant `warto`), `banach.ts` (wariant `kratka`; `siec()` z parametrem domyślnym, pajęczyna jak dotąd).
- `src/views/Pracownicy.astro`, `src/views/ListaZakladow.astro`: tylko dane dla motywu (`motywDane`: liczby osób w grupach i zakładach, 42–43 B).
- `src/lib/motywyBanerow.ts`: mapa Instytutu i stron ogólnych, reguła „instytut/*” → dendryt.
- `src/scripts/baner/silnik.ts`: po pierwszym układzie silnik czeka na koniec wejścia tekstu i mierzy jeszcze raz. Gdy karta była w tle, pierwszy pomiar mógł trafić w trakcie animacji, a `animationend` przyjść, zanim powstał motyw.

Kryteria odbioru:
1. Build i konsola — spełnione: `npm run build` bez błędów i ostrzeżeń; silnik startuje bez ostrzeżeń; podagenci: brak błędów z motywów.
2. Motyw każdej strony — spełnione. Sprawdziłem w zbudowanej wersji (390 px):
   - strony z tabeli: Władze, Pracownicy, Struktura, Kontakt, Infrastruktura, Warto wiedzieć (lista i wpis), Szukaj, Deklaracja, Polityka;
   - Instytut i podstrona Infrastruktury (spoza tabeli: dendryt);
   - EN: Pracownicy, Szukaj.

   Motyw wystartował z właściwym wariantem i wczytuje tylko swój kod. Gotowy rysunek: pod połową hasła i nad paskiem menu krycie 0. Strony prawne: statyczna kratka, zero klatek po pierwszej (pomiar podagenta, 25 s).
3. Bez bursztynowo-brązowego trójkąta — spełnione: na telefonie statyczny rysunek jest szary od 02, a animacja go zastępuje (`.ph-m` ma krycie 0).
4. Wydajność i dostępność — spełnione:
   - spoczynek: kanapka 1,3 kl./s, łuki 2,6, dendrogram 0,8, mapa 0,6, motyl (Infrastruktura, długi tytuł) 2,4, Warto wiedzieć 2,0, Szukaj 2,1–2,2, kratka 0;
   - ograniczony ruch: gotowy rysunek, 0 klatek, na wszystkich stronach;
   - tryb ciemny: kolor z tokenu.
5. Komputer bez zmian — spełnione: HTML 748 stron identyczny z buildem po 04, poza znacznikami motywu.
6. Ten wpis.

Dotychczasowe warianty po zmianach (Kalendarz, plan zajęć, Konferencje, szkoła doktorska) — sprawdzone: działają jak przed zmianą.

Rozmiary po budowie: kanapka 4,3 KB, luki 3,7, dendrogram 3,6, mapa 4,3, motyl 2,5, kratka 0,5. Z wariantami trzy-odleglosci ma 6,2 KB, a banach 8,8 KB (+ kratka 0,5).

Dopasowanie do pola (390 px):
- środki 8–25 px wyżej niż w prototypach;
- skala: mapa i Szukaj 100%, Warto wiedzieć 100% (górny limit łuku 88%), kanapka 88%, łuki 87%, dendrogram 88%, motyl 90%.

Odstępstwa od zlecenia i powody:
- Łuki (Pracownicy): nowy łuk czeka, gdy dwa już rosną. W prototypie liczba łuków z czasem malała.
- Klatki rosnących linii co 0,75 px, gaśnięcie 8 kl./s zamiast 12 (łuki, motyl, belki dendrogramu). Tempo bez zmian.
- Motyl: trasa startuje od pierwszego widocznego węzła w swoim wierszu, żeby nie zaczynała się pod tekstem.
- Mapa: przy ograniczonym ruchu znacznik jest widoczny. W prototypie w statycznym rysunku znikał.
- Dendrogram: wysokości złączeń z prototypu są dla dzisiejszego układu 3/3/2 zakładów. Dla innego jest wzór ogólny.
- Warto wiedzieć: własna fabryka przenikania zamiast funkcji profili Kalendarza (inny rodzaj ruchu w prototypie); losowe przesunięcie β, jak w Kalendarzu.
- Mniej rysunku widać niż w prototypach. Hasło jest maskowane na całą długość (07), a cienia 25% nie wdrożono. Rysunki są więc widoczne głównie z prawej i nad tytułem; na EN Struktury głównie górne belki.
- Stała `OBSZARY` (zakład → obszar) jest w dwóch widokach, bo frontmatter `.astro` nie eksportuje. Przy zmianie obszarów trzeba poprawić oba.

Pytania do użytkownika:
- Podstrony Infrastruktury informatycznej (np. regulamin sieci) mają dendryt z działu (zgodnie z regułą „spoza tabeli”). Dać im motyl jak strona nadrzędna?

## 06-strona-glowna-b2 — 2026-11-01 13:35
Status: zrobione
Commit: `bcec3666` (lokalny, bez pushu)
Wykonanie: kod napisał jeden podagent i sprawdził go na serwerze dev. Koordynator przejrzał zmiany, zbudował stronę i sprawdził kryteria na buildzie. Potem zapisał pola, ten wpis i commit.

Zmienione pliki (Web-Core):
- `src/components/StronaGlowna.astro`: baner `.hero-b2` z `<picture>` i elementami telefonu (hasło, podtytuł, mały napis w pasie, przycisk, podpis). Osobny blok wydarzeń dla telefonu. Pozycje od czwartej mają klasę `.nadmiar`. Skrypt zwijania, dociągania i „Zobacz więcej”. Chowanie zakończonych wydarzeń przelicza teraz każdy blok osobno.
- `src/components/ZobaczWiecej.astro` (nowy): przycisk „••• Zobacz więcej (N)” / „Zwiń”.
- `src/components/Naglowek.astro`: klasa `hdr-glowna`. Na telefonie nagłówek strony głównej jest stale ciemny. „Przewinięty” znaczy tam „baner zwinięty”, od tego zależy kolor stopki na dole strony.
- `src/components/KartaWydarzenia.astro` (właściwość `klasa`), `src/components/ListaReferatow.astro` (`id`, `widoczne`).
- `src/lib/tresci.ts`: `wydarzeniaNaTelefon()` (30 dni kalendarzowych, najwyżej 10, z przypomnieniami terminów). `wydarzeniaNaGlowna()` bez zmian w działaniu.
- `src/lib/i18n.ts`: `nadchodzaceWydarzenia`, `naSkrotyIWydarzenia`, `wydzialUwr`, `zobaczWiecej`, `zwin` (PL, EN). `najblizsze` zostaje dla wpisu aktualności.
- `src/styles/telefon.css`: blok „Strona główna B2”, w całości w `@media (max-width: 760px)`.

Nakładka (poza gitem, do repozytorium Web-Ustawienia przy „push”, opis w `pola-do-cms.md`):
- `src/data/ustawienia.json`: `haslo`, `haslo_en`, `baner.zdjecie_telefon`, `baner.podpis_telefon(_en)` (puste), `wydarzenia_dni_telefon`, nowe `baner.opis(_en)`.
- `public/pliki/baner/instytut-telefon.jpg` (nowy): 884×1779, JPEG progresywny, 274 055 B, bez metadanych. Zrobiony z `instytut-telefon-884x1779.png` przez `sharp` z `node_modules` (q82, mozjpeg).

Kryteria odbioru (sprawdzone na buildzie, serwer plików, 390×844; panel przeglądarki był ukryty, więc przewijanie testowane w ramce z podmienionym `requestAnimationFrame` i zdarzeniami `scroll`/`scrollend`):
1. Build i konsola — spełnione: `npm run build` bez błędów; `/` i `/en/` bez błędów w konsoli.
2. Pierwszy ekran — spełnione. Zrzut zgodny z `B2-widok-v29.png`.
   - Zdjęcie od 107 px, z przejściem od paska.
   - Budynek kończy się ok. 440 px, a tytuł zaczyna na 603 px.
   - Hasło bursztynowe, w 1 linii. Przycisk 24 px nad dołem.
   - Tryb ciemny i EN sprawdził podagent.
3. Inne rozmiary — spełnione (PL i EN). Tytuł jest pod nagłówkiem: 338/319 px (360×640), 366/346 (375×667), 630/611 (430×932), 58/58 (740×360). Przycisk jest 26 px pod podtytułem. Hasło w 1 linii, bez przewijania w poziomie (EN 360 px: hasło do 316 px).
4. Przewijanie — spełnione.
   - Pas: dół banera na 97 px (61 + 36), nazwa w nagłówku, hasło w pasie (krycie 1).
   - Dociąganie: w dół 50 → Z, 9 → Z, 5 → 0; w górę z Z 600 → Z, 500 → 0.
   - Z palcem na ekranie nic się nie dzieje; po puszczeniu dociąga.
   - Poza strefą (1500, 2000) przewijanie jest zwykłe.
   - Przycisk: dokładnie Z = 747, fokus na „Na skróty”; od p > .25 `visibility: hidden`.
5. Sekcje — spełnione (dane testowe: 6 wydarzeń, 6 aktualności, 5 referatów).
   - „Nadchodzące wydarzenia”.
   - „Zobacz więcej (3)”, „(3)”, „(2)”; po rozwinięciu sam napis „Zwiń”.
   - Rozwinięta jedna sekcja; kotwica stoi w miejscu (0 px), a przewinięcie wyrównuje zwinięcie sekcji wyżej (−412 px).
   - Fokus zostaje na przycisku. Tab z 3. pozycji idzie prosto do przycisku.
   - Chowanie zakończonych wydarzeń z przestawionym zegarem sprawdził podagent: 4 → „(1)”, 2 → bez przycisku, 0 → komunikat.
6. Dostępność — spełnione.
   - Jeden `h1`.
   - Kontrast w najjaśniejszym miejscu pod tekstem (pomiar podagenta): biel 18,2 : 1, bursztyn 8,7 : 1, podtytuł 14,8 : 1.
   - `scroll-padding-top` 105 px.
   - Ograniczony ruch: bez wejścia, podskoku i paralaksy, przewijanie bez animacji (podagent).
   - Bez JS (ramka bez skryptów): baner 844 px, nie przyklejony, wszystkie 8 ukrytych pozycji widać, przycisków nie ma.
7. Wydajność — spełnione.
   - Na telefonie z banera pobiera się tylko `instytut-telefon.jpg` (274 KB), bez `kampus-zmierzch*`.
   - CLS 0 (pomiar w ukrytym panelu, warto potwierdzić na telefonie).
   - Skrypt w klatce czyta tylko `scrollY`; wymiary przy załadowaniu i `resize`.
8. Komputer 1280 px — spełnione.
   - HTML 748 stron porównany z buildem po 05 (bez skryptów): różni się tylko `/` i `/en/`.
   - Różnice: klasy `hdr-glowna` i `hero-b2`, `<picture>` z `<source>` telefonu, nowy alt, napis „Nadchodzące wydarzenia”, opakowanie `div[data-wydarzenia-blok]` wokół siatki wydarzeń.
   - Skrypt nagłówka zmienił się na wszystkich stronach, ale na komputerze działa jak dotąd.
   - Położenie i kolory elementów strony głównej (1280×900) identyczne. Wyjątki: szerokość nowego napisu i wysokość „Warto wiedzieć”, która zmienia się przy każdym wczytaniu, bo sekcja losuje kolejność.
9. `pola-do-cms.md` — sekcja „Zlecenie 06”.
10. Ten wpis.

Odstępstwa od zlecenia i powody:
- Strefa Z = wysokość banera (100svh) − pas zamiast `innerHeight − pas`. W emulacji to samo. Na telefonie z chowanym paskiem adresu `innerHeight` rośnie, a baner przykleja się zawsze po 100svh − pas.
- Po kliknięciu przycisku w banerze fokus idzie na nagłówek „Na skróty” (`tabindex="-1"`). Przycisk zaraz znika, więc inaczej fokus by przepadł.
- Ukryta nazwa w nagłówku (`.brand-txt`) ma też `visibility: hidden`, żeby nie była niewidocznym celem Tab.
- Tytuł w dwóch liniach przez `width: min-content`, bez `<br>` (bez zmiany znaczników komputera).
- Timer 140 ms tylko bez `scrollend` i po `touchend` (prototyp używał obu sposobów zawsze).
- Bez `baner.zdjecie` telefon zostaje przy dzisiejszym wyglądzie. Bez `zdjecie_telefon` dostaje zdjęcie komputera przycięte do kadru.
- Przy ok. ≤ 400 px link „Kalendarz →” przechodzi pod dłuższy nagłówek „Nadchodzące wydarzenia” (sekcja zawija się jak dotąd).
- Bez JS u góry banera zostaje ok. 107 px ciemnego pasa pod nagłówkiem (zdjęcie zaczyna się na 107 px).

Co sprawdzić na prawdziwym telefonie: płynność zwijania i dociągania (tu tylko symulacja zdarzeń), zachowanie przy chowanym pasku adresu, CLS.

Pytania do użytkownika:
- **Prawa do zdjęcia:** baner telefonu to kadr z fotografii fotopolska.eu nr 1158570 (autor: Corvus), powiększony do 884×1779. Przed pushem trzeba ustalić prawo do publikacji i treść podpisu (`baner.podpis_telefon`, dziś pusty).
- Nowy alt (`baner.opis`) jest wspólny dla obu zdjęć, więc zmienił się też na komputerze. Czy tak może zostać?
- W EN podtytuł ma 2 linie, więc otoczka obejmuje całą szerokość ekranu. Czy to w porządku?
- Hasło „Badania, studia i popularyzacja” / „Research, education and outreach” jest robocze, do zatwierdzenia.

## 05-animacje-instytut-ogolne (uzupełnienie) — 2026-11-01 14:05
Status: zrobione (odpowiedź na pytanie z 05: „Tak, motyl”)
Commit: `a7422bd4` (lokalny, bez pushu)

Zmienione pliki:
- `src/lib/motywyBanerow.ts`: reguła `'instytut/infrastruktura-informatyczna/*': 'motyl'`. 8 podstron Infrastruktury informatycznej (PL i EN, razem 16) ma sieć motylkową jak strona nadrzędna zamiast dendrytu z działu.

Sprawdzone:
- `npm run build` bez błędów.
- Komputer bez zmian: HTML 748 stron identyczny z buildem po 06, poza znacznikiem `data-animacja` na tych 16 stronach.
- Telefon 390 px, wszystkie 18 stron (z nadrzędną, PL i EN):
  - motyw `motyl` startuje i wczytuje tylko swój kod;
  - płótno zaczyna się 6 px pod paskiem (67 px) i kończy najpóźniej w połowie hasła albo ostatniej linii tytułu;
  - rysunek się pojawia; przy krótkich tytułach pole ma 68 px wysokości, ale sieć się mieści.

Co sprawdzić: podstrony z krótkim tytułem (np. „Tablica interaktywna”) — niska sieć w wąskim polu.

## 08-poprawki — 2026-11-01 14:50
Status: zrobione — oba punkty z pliku w chwili startu: 1. Nauka, atraktor bliżej prawej krawędzi; 2. Aktualności, fala Fouriera od końca „← Strona główna”.
Commit: `ae6d5d96` (lokalny, bez pushu)

Zmienione pliki:
- `src/scripts/baner/motywy/lorenz.ts`: po obrocie i zmniejszeniu cały rysunek przesunięty w poziomie tak, że najdalszy prawy punkt trajektorii (tej, po której jedzie kometa) leży na `G.x1`. Wielkość, obrót, pion i start komety (liczony po przesunięciu) bez zmian.
- `src/scripts/baner/motywy/fourier.ts`: fala od `G.link.r` do `G.x1`, liczba okresów `round(długość / 120)` (co najmniej 1). Bez linku od `G.x0` jak dotąd.
- `src/scripts/baner/typy.ts`, `src/scripts/baner/silnik.ts`: nowe pole `Pole.link: Linia | null`, czyli linia linku „←” (`t`, `b`, `r` — prawy koniec tekstu, bez granicy zanikania). Maska bez zmian.

Kryteria odbioru (build, serwer plików; ramki bez paska przewijania, bo w ukrytym panelu pasek zabierał 15 px szerokości):
- Punkt 1 (Lorenz):
  1. Prawy brzeg rysunku 16,0 px od prawej krawędzi przy 390 i 430 px, 15,2 px przy 360 px (grubość linii); `/nauka/` i `/en/nauka/` — spełnione.
  2. Granice z 07 — spełnione: płótno 67–170 px (pasek 61 + 6, połowa hasła 171), maska bez zmian.
  3. Ograniczony ruch — spełnione: gotowy rysunek, prawy brzeg 374,7 px przy 390.
  4. Komputer bez zmian — spełnione: HTML 748 stron identyczny z poprzednim buildem (silnik działa tylko na telefonie).
- Punkt 2 (Fourier):
  1. `/aktualnosci/` i `/en/aktualnosci/` — spełnione. Pierwszy punkt fali na końcu tekstu linku: PL 141,6 px (360, 390), 142,8 (430); EN „← Home” 81,7 / 82,9. Fala narysowana bez maski zaczyna się 1,5 px wcześniej (grubość linii) i kończy na `G.x1`.
  2. Budowanie, oddychanie i rozkłady — bez zmian w kodzie; granice z 07 jak w pkt 1.
  3. Ograniczony ruch — spełnione: gotowa fala od 143 px (PL) i 83 px (EN) do prawego brzegu.
  4. Komputer bez zmian — jak w pkt 1.

Co sprawdzić na telefonie: na stronie Aktualności początek fali przy końcu linku widać głównie nad linią linku i pod nią, bo przy samym tekście działa maska. Na EN fala zaczyna się dużo bardziej w lewo (krótki link) i gaśnie pod tytułem.

## 11-poprawki-i-podstrony — 2026-11-05 12:28
Status: zrobione — zalecenia 1–17, 19, 20 (3 sprawdzone bez zmian, 12 zrobione wcześniej na `wyglad/en`); **18 CZEKA — nie wykonane**. Gałąź `wyglad/zlecenie-11` (z `origin/wyglad/en`), 15 commitów `598d2a11`…`1a2ef702` + commit raportu, bez pushu. Szczegóły: `RAPORT-ZLECENIE-11.md`, zrzuty `raport-zrzuty/z11-*`.

Zmienione pliki (główne):
- Style: `src/styles/zalozyciele.css` (paleta, ciemny motyw, `--line-ui`, `--rule`, `--panel`, znak ciekawostki), `zal-tresc.css` (przyciski, pola, wzorzec treści), `zal-telefon.css`, `zal-granty-plan.css`.
- Nagłówki i strony: `src/components/zal/NaglowekZ.astro` (hasło i liczby razem, liczby w jednym rzędzie, długie tytuły, ciekawostki), `Podstrona.astro` (slot `bok`), strona główna (barwienie, górna linia, liczby nad „Szybkim dostępem”), menu działu i hamburger, przełącznik języka; Kalendarz, Aktualności, Pracownicy, Seminarium, Publikacje, Władze, Granty.
- Skrypty: `src/scripts/zal/przejazd.ts` (okładka ↔ Szybki dostęp).
- Nowe: `src/data/ciekawostki/{instytut,nauka,studia,popularyzacja}.json` + `README.md`, `src/lib/ciekawostki.ts`; `dok/en/TLUMACZENIA.md` sekcja 6.
- `.przekazanie/pola-do-cms.md` — sekcja „Zlecenie 11”.

Kryteria odbioru:
- Build bez błędów (748 stron). `astro check`: 3 błędy jak przed zleceniem (`process` w `astro.config.mjs`); nowy błąd z zalecenia 20 poprawiony (`eab091a0`). `astro check` uruchamiany z osobnej instalacji `@astrojs/check@0.9.4` + `typescript@5.6.3` w katalogu tymczasowym — **bez zmian w `package.json`**.
- Edge (Playwright), 1366–3440 i 390 px, jasny i ciemny motyw; wyniki pomiarów przy każdym zaleceniu w raporcie.
- Ciekawostki: dwie wizyty różne (14/14 stron Studiów), zestaw stały w obrębie wizyty, 0 powtórzeń w 40 losowaniach, bez mignięcia, działa bez JS i bez `sessionStorage`, tytuły nie wchodzą na tytuł strony (≥ 40 px).
- Przejazd okładki: 32/32 w Edge; iOS i Android niesprawdzone (brak urządzeń).

Odstępstwa: ciemny motyw tylko przez `[data-theme="dark"]`; Rekrutacja w ciemnym z granatowym napisem; liczby nad „Szybkim dostępem” gasną przy najechaniu środkowych działów w niskich oknach; ciekawostki bez JS kolejne z puli zamiast pierwszej; zestaw ciekawostek losowany przy pierwszej stronie działu; SIAD i Granty przy 1366/1440 o jedną liczbę mniej (szerszy opis znaku). Powody w raporcie.

Pytania (12, pełna lista w raporcie): ramki 3:1 w jasnym (`--line-ui: #8c8679`, niewdrożone); pole `przyciski` kierunków i link ISIM; `/nauka/sukcesy/historia` bez linku; „referaty” zamiast „seminaria” w liczbach okładki; szkic mocniej na telefonie; kadr zdjęcia Studiów na telefonie i autor; liczby pod opisem ciekawostki; pula ciekawostek w linii (18–43 KB po kompresji) czy w pliku; rektor Marczewski 1953 czy 1957–1962; test przejazdu na telefonach; angielska strona Wydziału.

Do zrobienia w CMS: wgrać `raport-zrzuty/z11-17-studia-hs-3200.jpg` jako `public/pliki/naglowki/studia.jpg` (Web-Ustawienia); wpisać hasła stron z liczbami (59 stron PL i EN — lista w raporcie); usunąć USOSweb z menu Studiów (`nawigacja.json`); zweryfikować ciekawostki.

## 13-plynnosc — 2026-11-05 15:10
Status: zrobione — punkty 1–10. Gałąź `wyglad/zlecenie-13` (z `wyglad/zlecenie-11`, `e8ae1099`), 9 commitów `143edb34`…`d153aada` + commit raportu, bez pushu. Szczegóły: `RAPORT-ZLECENIE-13.md`, zrzuty `raport-zrzuty/z13-*`.

Zmienione pliki (główne):
- Nowe: `src/components/ZdjecieZ.astro` (zdjęcia przez `astro:assets`: AVIF/WebP, `srcset`, `sizes` z pola kadru, rozmyta wersja w linii), `src/components/Fonty.astro` (`@font-face` latin/latin-ext/greek, preload, kroje zastępcze z metrykami).
- `src/lib/zdjecia.ts` (`rozmiarPola`, malutkie wersje z `sharp`), `src/layouts/Baza.astro` (kroje, `speculationrules` z `prerender`, pusty `touchstart`), `NaglowekZ.astro` i `Okladka.astro` (skrypty w linii: rysowanie szkicu, układ okładki), `SpisStrony.astro`, `menu.ts`, `okladka.ts`, `drugi-ekran.ts`, `szkice.ts`.
- Style: `global.css` (zmienne rytmu `--rytm`, `--t-*`; `:active`), `zalozyciele.css` (warstwy paska, okładka), `zalozyciele-strony.css`, `zal-dzialy.css`, `zal-podstrona.css`, `zal-tresc.css`, `przejscia.css`, `telefon.css`; zdjęcia w widokach (aktualności, obrony, Warto wiedzieć, zakłady, Władze, sukcesy).

Kryteria odbioru:
- Lighthouse przed/po (4 strony × komputer i telefon, mediana z 3): wynik telefon 73/87/69/93 → 82/92/95/93, komputer 94/99/98/97 → 98/100/100/100; CLS ≤ 0,003 (przed do 0,189); waga strony głównej na komputerze 1764 → 851 KB.
- Zrzuty bez zmian w wyglądzie (porównanie pikseli 1440 i 390 px; różnice tylko w miniaturach AVIF i w liczbie wydarzeń zależnej od godziny budowania).
- Szkic rysuje się od pierwszej klatki na `astro preview` przy Fast 3G (Nauka, Studia, Instytut).
- 4× wolniejszy CPU: bez długich klatek w animacjach; rozmycie paska zostawione (wyłączenie nic nie zmienia).
- bfcache: 14 stron × 2 — wszystkie z pamięci.

Narzędzia: Lighthouse 12.2.1 przez `npx` i Playwright w katalogu tymczasowym; `sharp` — zależność, którą Astro już ma. **Bez zmian w `package.json`.** Bez service workera.

Pytania (9, pełna lista w raporcie): preload krojów a Fast 3G (dławienie DevTools: pierwsza klatka o ~0,4 s później; Lighthouse: lepiej); kroje zastępcze na Androidzie; pominięta cyrylica i wietnamski; czas budowania (cache `node_modules/.astro` w Actions); osobny kadr okładki na telefon; ekrany 1×; galeria w aktualnościach; prerender tylko w Chromium; krótsze „Zobacz więcej”.

## 14-poprawki-po-11 — 2026-11-05 20:40
Status: zrobione zalecenia 25, 26, 23, 24, 27, 28. **Nie zrobione: 21 (CZEKA) i 22 (polecenie z czatu „nie wykonuj zaleceń 21 i 22”; w zleceniu dopisek „dalej od 22” — pytanie w raporcie).** Gałąź `wyglad/zlecenie-14`, bez pushu. Szczegóły: `RAPORT-ZLECENIE-14.md`, zrzuty `raport-zrzuty/z14-*`.

Do zrobienia przed publikacją: nałożyć `dok/latki/zlecenie-14/Web-Ustawienia.patch` (bez niej link „O stronie” w stopce daje 404) i wpisać adres redakcji na „O stronie”.

Zmienione pliki (główne): `zalozyciele.css` (paleta, panel, linia patrona), `Link.astro`, `src/lib/url.ts`, `src/plugins/rehype-zewn.mjs` i około 20 widoków (strzałki ↗), `PanelMenu.astro`, `src/scripts/zal/menu.ts`, `src/lib/menu.ts`, `StopkaZ.astro`, `i18n.ts`, `Okladka.astro` (zerowanie wizyty).

Sprawdzenie: `astro check` 6 błędów, żaden nowy (3 `process` w `astro.config.mjs`, 3 w `src/lib/zdjecia.ts` ze zlecenia 13). `dist/`: 0 linków wewnętrznych z `zew`, 0 `target="_blank"`, wyjątki w raporcie. Porównanie 745 stron ze zleceniem 13 znalazło 3 błędy tego zlecenia, naprawione osobnymi commitami (liczby banera, tytuły konferencji, „Rekrutacja ↗”).

Pytania (6, pełna lista w raporcie): zalecenie 22; filtr USOSweb i skrót SIAD w menu telefonu; panel rozwinięty na bieżącym dziale; ↗ przy każdym przedmiocie w Planie zajęć; adres redakcji; `@types/node`.

## 15-popularyzacja — 2026-11-05 21:05
Status: zrobione punkty 1–6. Gałąź `wyglad/zlecenie-15` (z `14fbe3cb`), 6 commitów `f04cc238`…`d609bd87` + commit raportu, bez pushu. Szczegóły: `RAPORT-ZLECENIE-15.md`.

Do zrobienia przed publikacją: sprawdzić sześć punktów „Do potwierdzenia” (raport), przejrzeć tłumaczenie, nałożyć łatki `dok/latki/zlecenie-15/Web-Popularyzacja.patch` i `Web-Ustawienia.patch`.

Zmienione pliki (główne): `src/views/Popularyzacja.astro`, `src/lib/widoki/popularyzacja.ts`, `TrescDzialu.astro` (jeden układ wierszy), `zal-dzialy.css`, `zal-tresc.css`, nowa wtyczka `src/plugins/rehype-bloki.mjs` i pole `bloki` w kolekcji `strony`, `src/lib/markdown.ts`, `astro.config.mjs`, `src/lib/widoki/strona.ts`, `NastepnaStrona.astro`, `patroni.ts`, `.gitignore`.

Nakładka zmieniona i **nieprzywrócona** (polecenie w zleceniu): `src/data/popularyzacja.json`, `src/data/nawigacja.json`, nowy katalog `src/content/strony/popularyzacja/`; oryginały w `.przekazanie/robocze/nakladka-przed-15/`.

Sprawdzenie: `astro check` 6 błędów, żaden nowy. Zrzuty 1440, 1920 i 390 px, jasny i ciemny, PL i EN; obok prototypu w raporcie. Bez sprawdzenia w samym Pages CMS.

Pytania (5, pełna lista w raporcie): trzecia liczba w banerze nie mieści się o 9 px; krótkie etykiety spisu; bloki w edytorze CMS; pole `linki`; pole `podstrona` w ciekawostkach.

## 16-wersja-angielska — 2026-11-05 21:51
Status: zrobione D1, D2, D4, D5, D6, D8, D10, D11, D14, D15, D16, D19, D20; D18 potwierdzone; D3, D7, D9, D12, D13, D17 bez zmian (decyzje). Gałąź `wyglad/zlecenie-16` (z `9fd255ee`), 12 commitów `cfe65d03`…`1137c1fe`, 2 commity decyzji o obronach (`4fe03c13`, `ac7855c2`), zalecenie 22 ze zlecenia 14 (`8f0019b2`), naprawa układu (`775aa7bf`), naprawa paska i okładki (`f6c64acf`) i 4 commity raportu, bez pushu. Szczegóły: `RAPORT-ZLECENIE-16.md`.

Decyzja właściciela po raporcie („Usuń”): osiem obron bez `tresc_en` (Web-Aktualnosci `feeacb9`, łatka odświeżona); tekst angielski składa widok i sam dobiera czas. Druga decyzja („Tak, zmień”): to samo po polsku, osiem obron bez `body` (Web-Aktualnosci `af154c1`), kod `src/lib/widoki/obrona.ts` i `src/views/Obrona.astro` (`ac7855c2`).

Do zrobienia przed publikacją: wkleić `skrypty/powiadomienia/Code.gs` do Google i wdrożyć nową wersję, przejrzeć tłumaczenia D4, D6, D8, 31 nazw przedmiotów i notki patronów, napisać „push”.

Repozytoria treści: 36 commitów w 20 klonach `C:\Users\Szymek\source\tresci\`, bez pushu. Wszystkie łatki (`dok/latki/zlecenie-14`, `-15`, `dok/en/latki`, `dok/latki/zlecenie-16`) weszły czysto, bez `-3`.

Zmienione pliki (główne): `src/lib/osoby.ts`, `src/lib/i18n.ts`, nowy `src/lib/jezykTekstu.ts`, `src/layouts/Baza.astro`, `StopkaZ.astro`, `TytulReferatu.astro`, `TrescDzialu.astro`, `DrugiEkran.astro`, `src/pages/404.astro`, nowy `src/views/Powiadomienia.astro` i `src/pages/en/powiadomienia.astro`, `src/plugins/rehype-base.mjs`, `src/content.config.ts`, `skrypty/powiadomienia/Code.gs`, widoki grantów, seminariów, aktualności, kierunków.

Nakładka zmieniona i **nieprzywrócona** (polecenie w zleceniu); oryginały w `.przekazanie/robocze/nakladka-przed-16/`.

Sprawdzenie: `astro check` 6 błędów, żaden nowy; `sprawdz_tresci.py` OK (555 plików). Zrzuty 1440 i 390 px przed/po, 1920 px ciemny motyw, otwarte menu. Bez czytnika ekranu, Pages CMS i samego Google Apps Script.

Pytania (8, pełna lista w raporcie): „dr, prof. UWr”; „Mathematical Analysis” a „Advanced calculus”; „Iuvenes Wratislaviae”; „Admission” na stronie głównej bez dopisku; USOSweb; wpisy testowe; zalecenie 22 na telefonie; ciekawostka w banerze nachodząca na tytuł przy oknach 761–900 px.

## 14-poprawki-po-11, zalecenie 22 — 2026-11-05 23:35
Status: zrobione na polecenie właściciela, na gałęzi `wyglad/zlecenie-16`, osobnym commitem `8f0019b2`, bez pushu. Opis w `RAPORT-ZLECENIE-16.md`; `RAPORT-ZLECENIE-14.md` celowo bez zmian. Zalecenie 21 nadal CZEKA.

Zmienione pliki: `src/components/zal/DrugiEkran.astro`, `src/scripts/zal/drugi-ekran.ts`, `src/styles/zalozyciele-strony.css`, `src/components/WierszAktualnosci.astro`, `src/views/ListaAktualnosci.astro`. Bez nowych pól CMS.

Sprawdzenie: `astro check` 6 błędów, żaden nowy; `sprawdz_tresci.py` OK (555 plików). Główna i lista na 5 szerokościach, PL i EN, jasny i ciemny, filtry i szukanie; prototyp obok wyniku w raporcie. Bez Firefoksa, Safari i prawdziwych telefonów.

Decyzja właściciela po raporcie („Tak, napraw obie”), commit `775aa7bf`: pasek Studia i Warto wiedzieć na głównej poniżej 1366 px, lista Aktualności bez pustej kolumny poniżej 1368 px (klasa `z-pd-bez-boku`). Pliki: `src/styles/zalozyciele-strony.css`, `src/styles/zal-podstrona.css`, `src/views/ListaAktualnosci.astro`, `src/components/WierszAktualnosci.astro`.

Decyzja właściciela po raporcie („Tak, napraw”), commit `f6c64acf`, plik `src/styles/zalozyciele.css`: poniżej 1024 px linki tylko w panelu z burgera, przy 1024–1119 px bez podpisu Wydziału, nazwy działów na okładce maleją z oknem, panel co najmniej 360 px. Burger na podstronach był poza ekranem przy 761–971 px (EN 761–906 px). Pomiary w Edge bez alarmów; bez Firefoksa, Safari i prawdziwych urządzeń.

## 17-uwagi-z-ogladania — 2026-11-06 01:15
Status: zrobione punkty 1–6, na gałęzi `wyglad/zlecenie-16`, osobne commity, bez pushu. Raport: `RAPORT-ZLECENIE-17.md`.

Commity: klon Web-Instytut `7c43bdb` (punkt 1, kopia nakładki w `robocze/nakladka-przed-17`); Web-Core `3c3aa7ff` (2, panel testowy skali, tylko dev), `894017f8` (3, pas linków), `82d55d7b` (4, baner seminarium), `f0ba658c` (5, partnerzy bez domen), `f20a2b1e` (6, siatka boksów), `79621f12` (wąskie okna po punktach 3 i 4).

Ponad zlecenie: koordynatorzy i boksy w jednej kolumnie przy oknie 761–979 px; `white-space: nowrap` usunięte z linków pasa działu. Bez nowych pól CMS i zależności npm. Pole `haslo` seminariów: strona seminarium go nie używa, lista `/seminaria` tak.

Sprawdzenie: `astro check` 6 błędów, żaden nowy; `sprawdz_tresci.py` OK (555 plików); 30 stron (PL i EN) na 6 szerokościach od 390 do 1536 px i na granicy 979/980 px. Bez Firefoksa, Safari, prawdziwych telefonów i czytnika ekranu.

Pytania i decyzje czekające na właściciela są na początku raportu: wybór skali, inne linki z samą zmianą koloru, push.
