# Raport: zlecenie 19 — uwagi z oglądania, część 3 (6.11.2026)

Gałąź: `wyglad/zlecenie-16`, po commitach zlecenia 18, osobny commit na każdy punkt, bez pushu. Zrobione wszystkie trzy punkty GOTOWE, jakie zlecenie miało o 10:29. Repozytoriów treści nie zmieniałem.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Lista Aktualności w kolorach działów | `a7b61e45` |
| 2 | Okładka: tytuł i ciemne pole na jednym łuku, PL i EN | `2eeb7d89` |
| 3 | Telefon: podpis na wysokości krótkiego opisu, szkic tuż nad nim | `c59eb46e` |

**Do Twojej decyzji**

1. **Tytuł na okładce jest mniejszy niż w tabeli kontrolnej, a łuk EN mocniej wygięty (punkt 2).** Tabela ze zlecenia powstała w podglądzie, który wyświetlał tytuł krojem zastępczym Times, nie Brygadą. Sprawdziłem to: te same wzory w szerokościach Times dają tę tabelę prawie co do piksela (PL przy 730: 127 / 78 / 29, R 1018; EN: 63 / 114 / 26, R 1833). Brygada jest szersza, więc przy tej samej długości linii ma mniejszy stopień: „Instytut” ma 99 px zamiast 128. Końce linii i łuk PL są podobne (R 968 zamiast ≈ 1020). Po angielsku R to 984 zamiast ≈ 1820, bo „Institute” jest w Brygadzie szerszy względem „Mathematical”. Wdrożyłem stałe ze zlecenia bez zmian. Obejrzyj zrzuty `z19-luk-*`. Stałe są w jednym miejscu na początku skryptu w `Okladka.astro`. Policzone, niewdrożone warianty: EN `MAT` 0,585 daje łagodniejszy łuk (R 1661 przy 730), ale „Institute” 90 px zamiast 104; PL `MAT` 0,64 daje „Instytut” 104 px i R 907.
2. **Baner Popularyzacji jest wyższy, niż wymagał odbiór (punkt 3).** Przy 390 px 354 zamiast 335 (EN 346 zamiast 328), bo opis „Między duchem a materią…” ma 316 px, a podpis 80 px. Razem nie mieszczą się w jednej linii na żadnym telefonie do ok. 440 px, więc opis zawija się na 2 linie. Tak samo EN Studia przy 360 px: 347 zamiast 329. Żeby wyrównać, trzeba skrócić opis albo zmniejszyć podpis. Zostawić?
3. **`dok/estetyka.md` nie istnieje** (punkty 1 i 2, tak samo jak w zleceniu 18, punkt 9). Opisy są w komentarzach w kodzie.
4. **Kolor Instytutu nie występuje na liście Aktualności (punkt 1).** Reguła daje dziś Naukę 152, Studia 16, Popularyzację 3 i Instytut 0. To skutek danych: każde ogłoszenie ma odbiorców „studenci” albo „kandydaci”. Reguły nie zmieniałem.
5. **Bardzo długa flaga „wyróżnione” przy niskim oknie (punkt 2):** przy 1280×600 tytuł na 97 znaków łamie się na więcej niż dwie linie i wchodzi na markę o 10 px. Przy 1536×730 ten sam tytuł mieści się z zapasem 54 px. Dziś na stronie głównej flagi nie ma. Skracać tytuł flagi do dwóch linii?
6. **Push czeka na Twoje słowo.**

**Stan sprawdzenia**

- `npm run build` przechodzi: 759 stron, `pagefind` 744 strony, w `dist` nadal 0 plików z `menu-telefon`.
- `astro check`: 6 błędów, **żaden nowy** (3 `process` w `astro.config.mjs`, 3 w `src/lib/zdjecia.ts`). `skrypty/sprawdz_tresci.py`: „OK — sprawdzono 555 plików”. `skrypty/pobierz_tresci.py` nie był uruchamiany. `package.json` bez zmian. Nowych pól CMS nie ma.
- **Regresja końcowa** na serwerze deweloperskim: 17 stron PL i te same `/en` przy 320, 360, 390, 430, 800, 1536 i 2560 px, razem 238 wejść. HTTP 200, bez błędów JavaScriptu, bez przewijania w poziomie, poza `/studia/sprawy-studenckie` przy 320 px (8 px, PL i EN). To ten sam problem z tabelą w treści co w pytaniu 8 raportu zlecenia 18, tu nic go nie zmieniło.
- **Przeglądarka:** Chrome 156 przez Playwright (Edge nie startuje pod Playwrightem, opis w raporcie 18).
- **Czego nie sprawdzałem:** Firefoksa, Safari, prawdziwych telefonów, czytnika ekranu. Łuku z prawdziwą flagą: flagę wstawiłem do strony skryptem, bo dziś nie ma wyróżnionego wpisu. Ostrzeżenia w konsoli i dawnego skosu na wypadek złego koła: przy wszystkich sprawdzonych oknach koło wychodzi poprawne, więc ta gałąź kodu nie została wykonana.

## 1. Lista Aktualności: kolory działów

- `WierszAktualnosci.astro` ma `data-dzial` z `dzialWpisu`, tej samej funkcji co Szybki dostęp (`src/lib/patroni.ts`), bez kopii reguły. `PozycjaListy` ma nowe pole `zaklad`, ustawiane w `listaAktualnosci()`.
- **Ten sam dział na obu widokach:** 12 wpisów jest na obu, różnic 0, PL i EN. Reszta listy nie trafia na Szybki dostęp (minione wydarzenia, limit 12 pozycji).

| Data | Wpis | Rodzaj | Lista | Szybki dostęp |
| --- | --- | --- | --- | --- |
| 2026-10-30 | Testowe: Wykład otwarty: Co macierze losowe wiedzą o liczbach pierwszych | wydarzenie | Nauka | Nauka |
| 2026-10-29 | Testowe: Warsztaty dla licealistów: od spirali Ulama do szyfru RSA | wydarzenie | Popularyzacja | nie ma |
| 2026-10-28 | Testowe: Spotkanie koła naukowego: gry kombinatoryczne… | wydarzenie | Nauka | nie ma |
| 2026-10-28 | Testowe: Mister Test | obrona | Nauka | Nauka |
| 2026-10-27 | Testowe: Dzień otwarty matematyki dla kandydatów | wydarzenie | Popularyzacja | Popularyzacja |
| 2026-10-20 | Maciej Tadej | obrona | Nauka | nie ma |
| 2026-10-17 | Rusza tutornia | ogłoszenie | Studia | Studia |
| 2026-10-16 | Praca dla korepetytora z matematyki | kariera | Studia | Studia |
| 2026-10-02 | Testowe: Mister Test | obrona | Nauka | nie ma |
| 2026-10-01 | Witamy studentów pierwszego roku | ogłoszenie | Studia | Studia |
| 2026-09-29 | Testowe: Mister Test | obrona | Nauka | nie ma |
| 2026-09-28 | Malwina Mrowińska | obrona | Nauka | nie ma |
| 2026-09-23 | 2. Kongres Młodych Odkrywców | wydarzenie | Popularyzacja | nie ma |
| 2026-09-21 | Tomasz Żuchowski | obrona | Nauka | nie ma |
| 2026-09-20 | Kurs dla studentów pierwszego roku | ogłoszenie | Studia | nie ma |

**Kontrast daty i etykiety** (obie mają ten sam kolor):

| Dział | Jasny, tło | Jasny, boks | Ciemny, tło | Ciemny, boks |
| --- | --- | --- | --- | --- |
| Instytut | 6,14 | 5,67 | 8,29 | 7,25 |
| Nauka | 5,67 | 5,24 | 8,70 | 7,61 |
| Studia | 5,89 | 5,45 | 8,54 | 7,47 |
| Popularyzacja | 6,45 | 5,96 | 8,04 | 7,04 |

- Najechanie: tytuł w kolorze działu. Fokus: obrys 3 px w kolorze działu. „… czytaj dalej” także w kolorze działu, bo korzysta z tej samej zmiennej.
- Po filtrze „Wydarzenia”: 9 widocznych, wyróżnienie przechodzi na pierwszy widoczny, kolor zostaje.
- 1536 i 390 px, PL i EN, oba motywy: wszystkie 171 wiersze mają dział, bez przewijania w poziomie, bez błędów JavaScriptu.

Zrzuty: `z19-akt-kolory-*`.

## 2. Okładka: łuk

**PL** (f1 „Instytut”, f2 „Matematyczny”). Odległość w poziomie: marka / „Instytut” / „Matematyczny”.

| Okno | f1 | f2 | Odstęp | top | R | cx | cy | Odległość | Monotoniczny | Nachodzi | Do szkiców | Do marki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1280×600 | 92,6 | 57,4 | 21,3 | 141,6 | 742 | 1120 | −108 | 58 / 58 / 58 | tak | nie | 24 | 83,6 |
| 1536×730 | 98,7 | 61,2 | 22,7 | 208,2 | 968 | 1344 | −139 | 58 / 58 / 58 | tak | nie | 24 | 150,2 |
| 1920×940 | 104,5 | 64,8 | 24 | 272,6 | 1188 | 1562 | −171 | 58 / 58 / 58 | tak | nie | 80,7 | 214,6 |
| 2560×940 | 104,5 | 64,8 | 24 | 272,6 | 1188 | 1562 | −171 | 58 / 58 / 58 | tak | nie | 80,7 | 214,6 |
| 2560×1300 | 114 | 70,7 | 26,2 | 377 | 1541 | 1912 | −220 | 58 / 58 / 58 | tak | nie | 294,4 | 319 |
| 3440×1300 | 114 | 70,7 | 26,2 | 377 | 1541 | 1912 | −220 | 58 / 58 / 58 | tak | nie | 294,4 | 319 |

**EN** (f1 „Mathematical”, f2 „Institute”).

| Okno | f1 | f2 | Odstęp | top | R | cx | cy | Odległość | Monotoniczny | Nachodzi | Do szkiców | Do marki |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1280×600 | 53,9 | 98 | 22,5 | 138,6 | 740 | 1142 | −94 | 58 / 58 / 58 | tak | nie | 24 | 80,6 |
| 1536×730 | 56,9 | 103,4 | 23,8 | 206,6 | 984 | 1384 | −123 | 58 / 58 / 58 | tak | nie | 24 | 148,6 |
| 1920×940 | 59,8 | 108,7 | 25 | 272,6 | 1215 | 1613 | −150 | 58 / 58 / 58 | tak | nie | 80,5 | 214,6 |
| 2560×940 | 59,8 | 108,7 | 25 | 272,6 | 1215 | 1613 | −150 | 58 / 58 / 58 | tak | nie | 80,5 | 214,6 |
| 2560×1300 | 64,4 | 117,1 | 26,9 | 377 | 1592 | 1988 | −195 | 58 / 58 / 58 | tak | nie | 296,7 | 319 |
| 3440×1300 | 64,4 | 117,1 | 26,9 | 377 | 1592 | 1988 | −195 | 58 / 58 / 58 | tak | nie | 296,7 | 319 |

- **Jak mierzona odległość:** w poziomie, tak jak algorytm ze zlecenia stawia punkty, wychodzi 58 ± 0,1 px. Najkrótsza odległość do łuku, po promieniu, to 50–57 px, bo łuk jest nachylony. Kryterium „58 ± 2 px” spełnia więc tylko miara w poziomie.
- **Szerokość okna** nie zmienia tytułu ani łuku, tylko zdjęcie (2560×940 jak 1920×940, 3440×1300 jak 2560×1300).
- **Porównanie z tabelą kontrolną**, pytanie 1:

| Okładka | PL strona: f1 / f2 / odstęp, R | PL zlecenie | EN strona: f1 / f2 / odstęp, R | EN zlecenie |
| --- | --- | --- | --- | --- |
| 730 | 99 / 61 / 23, R 968 | 128 / 79 / 29, ≈ 1020 | 57 / 103 / 24, R 984 | 63 / 115 / 27, ≈ 1820 |
| 940 | 105 / 65 / 24, R 1188 | 136 / 84 / 31, ≈ 1220 | 60 / 109 / 25, R 1215 | 65 / 118 / 27, ≈ 2190 |
| 1300 | 114 / 71 / 26, R 1541 | 150 / 93 / 34, ≈ 1560 | 64 / 117 / 27, R 1592 | 68 / 123 / 28, ≈ 2820 |

Szerokość słów przy 100 px, „Instytut” / „Matematyczny” / „Mathematical” / „Institute”: Brygada 3,60 / 6,67 / 6,35 / 3,95; Times 2,96 / 5,80 / 5,35 / 3,17.

- **Zdjęcie:** proporcje 2,273–2,274 przy naturalnych 2,271–2,277, bez ściskania. `--foto-x` 205 px PL, 225 px EN. Kadr z punktu 13 zlecenia 18 bez zmian.
- **Telefon bez zmian:** stopnie, tytuł i zdjęcie przy 360, 390 i 430 px, PL i EN, identyczne przed i po. W jednym oknie komputer → telefon → komputer układ wraca poprawnie.
- **Bez JS:** zwykły gradient, jak było (`z19-luk-bez-js-1536x730.png`).
- **Flaga** wstawiona skryptem: nie przesuwa h1 (0 px), długa łamie się z zapasem 24 px do łuku (`z19-luk-flaga-1536x730.png`, pytanie 5).

**Odstępstwa:**
1. Dopisałem `letter-spacing: -.012em` na samych liniach tytułu (tylko komputer). Wartość z `h1` dziedziczyła się jako stała liczba pikseli, więc miarka przy 100 px i prawdziwe linie się rozjeżdżały: R wychodził 1289 zamiast 968. Tytuł jest przez to o ułamek piksela na literę ciaśniejszy.
2. Krok 5 jednym przeliczeniem zamiast 2–3 przebiegów. Stopnie zależą od `top` liniowo, więc jedno wystarcza, a odstęp do szkiców wychodzi dokładnie 24 px.

Zrzuty: `z19-luk-pl-*`, `z19-luk-en-*`, `z19-luk-telefon-390-*`.

## 3. Telefon: podpis i szkic

Wysokość banera, po punkcie 14 zlecenia 18 → teraz:

| Dział | 390 PL | 390 EN | 360 PL | 360 EN |
| --- | --- | --- | --- | --- |
| Instytut | 344 → 344 | 344 → 344 | 344 → 344 | 344 → 344 |
| Nauka | 321 → 321 | 321 → 321 | 321 → 321 | 321 → 321 |
| Studia | 329 → 329 | 305 → 305 | 329 → 329 | **329 → 347** |
| Popularyzacja | **335 → 354** | **328 → 346** | **335 → 354** | **328 → 346** |

- **Odstępstwo od kryterium wysokości:** pogrubione wiersze. Ujemne marginesy nie zmieniają wysokości, ale wymagane `max-width: calc(100% - 150px)` zawija dłuższy opis na 2 linie (pytanie 2). Przy 320–340 px opisy mają 2–3 linie, a baner 340–388 px.
- **Podpis stoi na wysokości ostatniej linii opisu:** środek podpisu 0,3 px od środka linii we wszystkich działach, przy 320, 340, 360, 390 i 430 px, PL i EN.
- **Kolizje:** liczone z punktów na kreskach szkicu i podpisu względem prostokątów tekstu (tytuł, hasło, nazwisko, linia lat, opis). Co 2 px od 320 do 440 px, 8 stron, 488 pomiarów: **0 kolizji**, bez przewijania w poziomie. Same ramki zachodzą miejscami na tekst przy wąskich ekranach (np. przy 360 px EN podpis na linię lat 27×2 px), ale w tych miejscach ramka jest pusta.
- **Zmiana względem zlecenia 18:** reguły dla wąskich ekranów z punktu 14 (podpis 22 i 18 px, stałe `top`) usunięte. Podpis ma wszędzie 28 px, przy pozycji w przepływie nie były już potrzebne.
- **Komputer i banery podstron:** pomiary identyczne przed i po.

Zrzuty: `z19-baner-dzial-*`.
