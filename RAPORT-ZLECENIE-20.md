# Raport: zlecenie 20 — uwagi z oglądania, część 4 (6.11.2026)

Gałąź: `wyglad/zlecenie-16`, osobny commit na każdy punkt. Zrobione oba punkty GOTOWE. Właściciel kazał tym razem wysłać całość i pokazać ją na podglądzie, więc zapis „bez pushowania” nie obowiązuje w tej rundzie: gałęzie wysłane, `main` żadnego repozytorium nietknięty.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Hamburger na komputerze: większe pismo, rzędy na całą wysokość, nazwy grup bez koloru | `352f6d49` |
| 2 | Strona działu na komputerze: pas z kafelkami i pole ze stronami | `16740eea` |

`astro check`: 6 błędów, tyle samo co przed zleceniem, żaden nowy. `npm run build` przechodzi.

## Do Twojej decyzji

1. **Kontrast na kafelku po najechaniu i po rozwinięciu jest miejscami poniżej 4,5:1 (punkt 2).** Kolorów nie zmieniałem, tak każe zlecenie.
   - Liczba stron (`--d-a` na `--ton`): jasny motyw Nauka 4,26, Studia 4,40; ciemny Instytut 4,45, Studia 4,48, Popularyzacja 4,35. Pozostałe 4,56–4,74.
   - Opis grupy po najechaniu (`--muted` na `--ton`): jasny motyw 4,24–4,35, ciemny 3,68–3,79. Po rozwinięciu jest dobrze, bo opis przechodzi na `--text` (5,52–9,21).
   - Propozycja: `.z-dz-karta:is(:hover, [aria-expanded="true"]) :is(em, small) { color: var(--text); }`. Daje 5,52–9,21. Liczba stron traci wtedy kolor działu na podświetlonym kafelku.
2. **EN Studia przy 1536×730 przewijają się o 6 px (punkt 1).** To jedyny taki przypadek. Wartości zostawiłem, tak każe zlecenie. Możliwa droga, jeszcze niesprawdzona: krótsza etykieta „Lecture notes and materials”.
3. **Teksty angielskie do przejrzenia (punkt 2).** Wszystkie `opis_en` i `menu_opis_en` to propozycje ze zlecenia. Całość: `dok/latki/zlecenie-20/`.

## Punkt 1: hamburger

**Wysokości, panel bez przewijania.** Te same liczby na stronie działu, podstronie i okładce. Nadmiar to `scrollHeight − clientHeight`, z każdym rozwiniętym działem i z żadnym.

| Okno | Panel | Rzędy zwinięte (działy, Aktualności i Rekrutacja) | Nadmiar PL | Nadmiar EN |
| --- | --- | --- | --- | --- |
| 1366×640 | 640×640 | 103 i 72 | 0 | 0 |
| 1536×730 | 685×730 | 117 i 82 | 0 | 0, poza Studiami: 6 |
| 1920×950 | 720×950 | 155 i 106 | 0 | 0 |
| 2560×1305 | 720×1305 | 155 i 106 (górne granice, na dole pusto, zamierzone) | 0 | 0 |

- **Ruch przy 1920×950:** otwarcie panelu bez animacji (grupy bieżącego działu mają pełną wysokość już w klatce kliknięcia). Rozwinięcie i zwinięcie to około 27 klatek przejścia, największa zmiana rzędu 32 i 43 px na klatkę.
- **Klawiatura:** 26 kroków Tab po panelu, 0 wejść w linki zwiniętych działów. Enter i Spacja działają na strzałce, Esc zamyka i oddaje fokus hamburgerowi.
- **Bez JS:** grupy widoczne (158, 158, 189 i 135 px), nic nie jest ucięte, panel przewija się (1061 px treści w 640 px).
- **Kontrast nazw grup:** granat 6,55–6,79, granat w ciemnym motywie 4,99–5,52, jasny panel 5,41–5,79, jasny panel w ciemnym motywie 6,45–7,11. Podaję oba skrajne przypadki przezroczystego tła (biel i czerń pod spodem).
- **Telefon 390×780:** położenie i rozmiary wszystkich elementów bez zmian, zmienia się tylko kolor nazw grup.

**Poza wzorem ze zlecenia** (bez tego odbiór by nie przeszedł):
- `position: relative` na `.z-menu-grupy-w`. Niewidoczne dopiski „(external site)” ze zwiniętych grup wystawały z nich i dawały panelowi pasek przewijania, przy 1366×640 i 1536×730 na EN 10–39 px, choć treść się mieściła. Po poprawce został tylko przypadek z decyzji 2.
- Przejście `max-height` na rzędach. Bez niego przy zwijaniu wszystkie rzędy skakały w pierwszej klatce, a grupy na chwilę wystawały na następny rząd.
- `padding-top: 0` na zwiniętych grupach: 4 px skoku przy rozwijaniu.
- `!important` w regule `prefers-reduced-motion`. Reguła ze zlecenia przegrywa szczegółowością z regułami rozwijania i nie działała.

## Punkt 2: pas działu

| Szerokość | PL: pas | EN: pas | Pole: lewa = pierwsza komórka | Pole: prawa = koniec kolumny = Rekrutacja | Tekst komórki = tekst linku |
| --- | --- | --- | --- | --- | --- |
| 1366 | 98 | 98, Studia 121,1 | 44 | 1302 | 64 |
| 1536 | 98 | 98, Studia 121,1 | 128 | 1388 | 148 |
| 1920 | 98 | 98, Studia 121,1 | 320 | 1580 | 340 |
| 2560 | 98 | 98, Studia 121,1 | 640 | 1900 | 660 |

- **PL:** opis każdej grupy w jednej linii, także Kierunki. Wszystkie nazwy stron w jednej linii. „Procedura dyplomowania” przy 1366 px wychodzi 1,3 px poza swoją kolumnę, w odstęp 22 px, nie dotyka następnej.
- **EN Studia:** 121,1 px, bo „Diploma and student affairs” ma dwie linie, a opisy Programmes i Everyday w tej wysokości też. Nic nie wystaje poza komórkę ani nie jest ucięte. Rekrutacja 105,1 px.
- **Wysokość pola:** 78 px, Kierunki 96,2 px (dwie linie opisu SIAD i ISIM). EN: Diploma and student affairs i Partners 100,8 px.
- **Działanie (jasny i ciemny motyw):** na starcie wszystko zwinięte, otwarta jedna grupa, drugie naciśnięcie zamyka, Esc z linku w polu zamyka i oddaje fokus karcie. Kolor po najechaniu i rozwiniętej karty równy co do wartości `getComputedStyle`.
- **Klawiatura:** Tab przechodzi karty i Rekrutację, nie wchodzi w linki zamkniętych grup, po otwarciu wchodzi w linki tej grupy. `aria-expanded` poprawne. Fokus widoczny na karcie, Rekrutacji i linku.
- **Przewijanie:** pas odjeżdża ze stroną (o 500 px przewinięcia 366 → −134), `position: relative`.
- **Bez JS:** wiersze i przycisk Rekrutacja jak dotąd, 0 kart, opisów, strzałek i drugiej Rekrutacji. Kolumna nazw grup 140 px, pasek 194 px na Studiach.
- **Telefon 390 px:** wszystkie 19 zrzutów pasa (karty, każda grupa otwarta, cztery działy i EN Studia) identyczne co do bajtu przed i po.
- **Kontrast poza decyzją 1:** opis grupy na `--d-t` 5,01–5,37; liczba stron na `--d-t` 5,27–6,21; opis po rozwinięciu 5,52–9,21; opis strony 5,01–5,37; nazwa strony 9,17–15,12; Rekrutacja na `--bg` 5,78–8,54.

**Poza wzorem ze zlecenia:**
- `.z-dz-rzad-w { display: contents; }` na każdej szerokości, a `display: block` tylko na komputerze z JS. Otoczka z HTML-a zlecenia rozbijała siatkę wierszy bez JS.
- Otwarte pole dopisane do reguły `prefers-reduced-motion`. Z regułą ze zlecenia pole dalej się animowało.
- **Po angielsku nazwy stron mogą się złamać** (`a:lang(en) b { white-space: normal; }`). W jednej linii „Wrocław Mathematicians Foundation (in Polish)” wchodziła 13 px na następną kolumnę, „Polish Mathematical Society, Wrocław Branch (in Polish)” wychodziła 88 px poza pole, a „Lecture notes and materials” 2,5 px poza pole. Po polsku bez zmian.
- Pusty `opis_en` to brak opisu, a nie polski tekst na stronie angielskiej.

**Dane:** oryginały w `.przekazanie\robocze\nakladka-przed-20\`, łatki w `dok/latki/zlecenie-20/`, nowe pola w `.przekazanie\pola-do-cms.md`. `dok/estetyka.md` na tej gałęzi nie ma, więc opisu tam nie poprawiałem.

## Zrzuty

- `raport-zrzuty/z20-menu-*`: rozwinięte Studia i zwinięte działy przy 1366×640, 1536×730 i 1920×950, granatowy i jasny panel; po jednym w ciemnym motywie; telefon 390 px.
- `raport-zrzuty/z20-pas-*`: Studia zwinięte i każda grupa przy 1536 i 1920 px, po jednej rozwiniętej w pozostałych działach, EN Studia, ciemny motyw, bez JS, telefon.
