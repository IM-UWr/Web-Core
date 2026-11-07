# Raport: zlecenie 26 — strona główna: skala, drabinka wysokości, drobne (7.11.2026)

Gałąź: `wyglad/zlecenie-16`, bez pushowania, także w repozytoriach treści. `skrypty/pobierz_tresci.py` nie był uruchamiany. Build „przed” (HEAD `41d82a0d`) i „po” robione w kopii poza głównym drzewem; obie wersje mają 747 stron.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Okładka jako jedna kompozycja skalowana od Full HD | `c56b2861` |
| 2 | Szybki dostęp powyżej Full HD w tej samej skali; Ctrl + działa | `3b8efbcd` |
| 3 | Drabinka wysokości na niskich oknach | `fb27c52a` |
| 4 | Nagłówki kolumn, pasek Szybkiego dostępu, kierunki | `facb8bf3` |
| 5 | Zdjęcie okładki w większej rozdzielczości | pominięty: brak katalogu `.przekazanie\zdjecia\` |

Wynik w skrócie:
- **Okładka:** łuk stoi przy 25% szerokości od 1536×730 do 3840×2000, a przy 1920×950 i 1920×1080 wszystko jest piksel w piksel jak przed zmianą.
- **Szybki dostęp powyżej Full HD:** przy 2560×1300 i 3840×2000 wygląda jak 1920×950 w powiększeniu.
- **Ctrl + przy 3840×2000:** przy 200% tekst ma 40,8 px na ekranie zamiast 29 px. Tak jest w Chrome, Edge i Firefoksie; Safari niesprawdzone. Mechanizm odbiega od dosłownego zlecenia (odstępstwo 1).
- **Drabinka:** spełnia odbiór poza jednym oknem. Przy 1366×620 po krokach 1–3 brakuje 73 px, a przed punktem 4.3 brakowało 12 px (pytanie 5).

## Punkt 1: okładka

Skala `s = min(szerokość okna / 1920, wysokość okna / 950)`. Liczy ją skrypt okładki przed pierwszym narysowaniem i zapisuje na `<html>` jako `--z-s`, a `--z-k = max(1, s)` służy drugiemu ekranowi. Ze skali powstają:
- marka;
- margines tytułu;
- `ODSTEP` i pozostałe odstępy łuku;
- maska zdjęcia;
- rząd działów, który przechodzi na `s`;
- liczby;
- strzałka.

Progi minimalne: logo ≥ 30 px, napis ≥ 12 px, marginesy ≥ 24 px, drobny tekst ≥ 13 px. Hasła działów mają `text-wrap: balance`. Telefon jest bez zmian.

### Położenie łuku (% szerokości okna, na wysokości pierwszej linii tytułu)

| Okno | Przed | Po | s |
| --- | --- | --- | --- |
| 1024×600 | 42,9 | 33,1 | 0,533 |
| 1024×700 | 44,6 | **34,0** | 0,533 |
| 1180×820 | 39,9 | 31,4 | 0,615 |
| 1280×600 | 34,3 | 27,5 | 0,632 |
| 1366×620 | 32,4 | 26,1 | 0,653 |
| 1440×780 | 32,4 | 26,7 | 0,75 |
| 1536×730 | 30,0 | **25,0** | 0,768 |
| 1707×830 | 27,6 | 24,7 | 0,874 |
| 1920×950 | 25,2 | 25,2 | 1 |
| 1920×1080 | 25,8 | 25,8 | 1 |
| 2048×1040 | 24,0 | **25,3** | 1,067 |
| 2560×1300 | 20,2 | **25,3** | 1,333 |
| 3440×1300 | 15,0 | 19,2 | 1,368 |
| 3840×2000 | 15,2 | **25,4** | 2 |

Odbiór:
- Łuk w granicach 25% ± 2 przy 1536×730, 2048×1040, 2560×1300 i 3840×2000.
- Przy 1024×700 wynosi 34%, czyli mieści się w limicie 35%.
- Przy 3440×1300 jest 19,2%. Okno 21:9 ogranicza wysokość (s = 1,368), więc kompozycja ma 2627 px szerokości i jest tak duża jak przy 2560×1300; reszta szerokości to zdjęcie.

Pozostałe sprawdzenia:
- **Tytuł:** nie wchodzi na łuk. Odstęp od końca tytułu do łuku wynosi od 30,9 px (1024×600) do 115,9 px (3840×2000), a dół tytułu zawsze leży nad szkicami działów.
- **Okładka w jednym ekranie od 1024×600:** rząd działów kończy się na 533,9 px, a strzałka i liczby mieszczą się nad dolną krawędzią.
- **Porównanie build z buildem:** okładka przy 1920×950 i 1920×1080 jest identyczna co do piksela.
- **Rząd działów:** przy 2560×1300 ma te same proporcje co przy 1920×950 (zrzut `z26-dzialy-1920-2560.jpg`).

## Punkt 2: Szybki dostęp powyżej Full HD

`.z-druga`, jasny pasek i stopka strony głównej mają `zoom: var(--z-k)`. Pod CSS `zoom` rośnie wszystko, także `100svh`, przesunięcia i animacje, więc trzy miejsca dzielą przez skalę:
- `min-height` drugiego ekranu;
- przesunięcie przy ciągnięciu palcem;
- przesunięcie FLIP „Zobacz więcej” (bez tego kolumna startowała o (k−1)·dx za daleko).

| Okno | zoom | dół stopki względem okna | poziome przewijanie | aktualności widać |
| --- | --- | --- | --- | --- |
| 1920×950 | 1 | +0,7 px (jak przed) | nie | 10 z 12 |
| 2048×1040 | 1,067 | +0,7 | nie | 10 |
| 2560×1300 | 1,333 | +0,9 | nie | 10 |
| 3440×1300 | 1,368 | +0,9 | nie | 11 |
| 3840×2000 | 2 | +1,4 | nie | 11 |

Animacje sprawdzone przy 1920×950, 2560×1300 i 3840×2000:
- **Przejazd z okładki:** okładka, pasek i treść jadą o te same wartości w każdej klatce.
- **„Zobacz więcej”:** pierwsza klatka FLIP stoi dokładnie tam, gdzie kolumna stała przed kliknięciem (dx = dy = 0).
- **Ciągnięcie o 100 px:** wszystkie trzy części przesuwają się o −100 px.

Drugi ekran przy 1920×950 i 1920×1080 jest identyczny co do piksela z wersją przed zmianą. Zestawienie: `z26-drugi-porownanie.jpg` (1920×950 | 2560×1300 | 3840×2000).

### Ctrl + (WCAG 1.4.4)

Sprawdzone na Windows 11 przez przeglądarkę bez okna, tym samym mechanizmem co Ctrl +: w Chrome i Edge `tabs.setZoom` z małego rozszerzenia testowego, w Firefoksie `fullZoom` przez Marionette. Klawiszy nie wciskałem fizycznie. Tabela podaje wielkość tekstu wiersza listy na ekranie; przy 100% i Full HD jest to 14,5 px.

| Powiększenie | Chrome 156, 3840×2000 | Edge 157, 3840×2000 | Firefox 159, 3840×2000 | Chrome, 2560×1300 | Chrome, 1920×950 |
| --- | --- | --- | --- | --- | --- |
| 100% | 29 | 28,9 | 29 | 19,3 | 14,5 |
| 110% | 32 | 32 | 31,9 | — | — |
| 125% | 36,4 | 36,4 | 36,3 | 24,3 | 18,3 |
| 150% | 40,8 | 40,7 | 40,8 | 27,2 | 21,8 |
| 175% | 40,8 | 40,7 | 40,4 | — | — |
| **200%** | **40,8** | **40,7** | **40,8** | 29 | 29 (widok telefonu) |
| 250% | 40,7 | 40,7 | 40,7 | — | — |
| 300% | 43,5 | 43,5 | 43,5 | 43,5 (widok telefonu) | 43,5 (widok telefonu) |
| 400% | 58 (widok telefonu) | 58 (widok telefonu) | 58 (widok telefonu) | — | — |

- **4K:** przy 3840×2000 i 200% tekst jest 1,41 raza większy niż przy 100%. Przy żadnym stopniu nie ma poziomego przewijania; jedyny wyjątek to Firefox przy 400% w widoku telefonu, o którym niżej. Odświeżenie strony przy 150% daje ten sam stan. Zrzut: `z26-ctrl-chrome-3840.jpg`.
- **Między 150% a 250%** wielkość tekstu stoi w miejscu. Dwukrotność rozmiaru ze 100% daje dopiero 400%. Wyjaśnienie i warianty: odstępstwo 1 i pytanie 1.
- **Firefox:** przy 400% w widoku telefonu strona przewija się poziomo. To ten sam widok telefonu co przy oknie 960 px, więc zjawisko nie pochodzi z tego zlecenia, ale zapisuję je do sprawdzenia.
- **Safari:** niesprawdzone, bo nie da się go uruchomić na Windows. Wykrywanie w Safari korzysta z tej samej ścieżki co w Chrome (`outerWidth / innerWidth`). Zakładam, że WebKit przy Cmd + zmniejsza `innerWidth`, a `outerWidth` zostawia, ale tego nie potwierdziłem. Prośba o sprawdzenie na Macu: okno pełnoekranowe, Cmd + do 200%, tekst listy ma być wyraźnie większy niż przy 100%.

Skala systemu (Windows) nie wyłącza skali strony. Sprawdzone w Chrome:

| Monitor i skala systemu | Okno w CSS | s | Tekst na ekranie (px fizyczne) |
| --- | --- | --- | --- |
| 4K przy 150% | 2560×1300 | 1,333 | 29 |
| 4K przy 200% | 1920×1000 | 1 | 29 |
| Full HD przy 125% | 1538×731 | 0,769 | 18,1 |

## Punkt 3: drabinka wysokości

Skrypt `drabinka()` w `src/scripts/zal/drugi-ekran.ts` mierzy układ i ustawia `data-krok` na `.z-druga`; wysokości trafiają do `--z-druga-h` i `--z-siatka-h`. Działa tylko na komputerze przy s ≤ 1. Uruchamia się:
- przy wczytaniu;
- po zmianie okna i po załadowaniu czcionek;
- po zmianie wysokości paska Szybkiego dostępu (kolor dnia ustawiany po wczytaniu);
- po „Zobacz więcej”, bo krótką kolumną staje się wtedy inna.

Kolejność w HTML się nie zmienia.

| Krok | Co się dzieje |
| --- | --- |
| — | Wszystko mieści się w oknie (stopka liczona jako 47 px). Układ jak dotąd. |
| 0 | Wszystko mieści się, ale stopka jest wyższa niż 47 px (70,6 px poniżej 1707 px). Drugi ekran sięga dokładnie do stopki. |
| 1 | Stopka schodzi pod ekran. |
| 2 | „Warto wiedzieć” w całości pod ekranem. Długa kolumna kończy się razem ze Studiami, które stoją na dole pierwszego ekranu. |
| 3 | Jak 2, a krótkie kolumny pokazują po 2 pozycje (powiększony wpis liczy się za dwie). |
| 4 | Jak 3, ale i to się nie mieści, więc strona się przewija. |

### Okno → krok (zbudowana strona)

„Przed” to wysunięcie dołu stopki poza okno przy dzisiejszym układzie. „Dół Studiów” liczony jest od górnej krawędzi paska i porównywany z wysokością okna.

| Okno | Przed | Krok | Dół Studiów / okno | Krótkie kolumny: widać + ukryte, N | Odbiór |
| --- | --- | --- | --- | --- | --- |
| 1024×600 | +558,7 | 4 | 849,5 / 600 | 2+2 N2, 2+1 N1 | przewija się |
| 1024×700 | +458,7 | 4 | 849,5 / 700 | 2+2 N2, 2+1 N1 | przewija się |
| 1180×820 | +240,7 | 2 | 804,6 / 820 | 3+1 N1, 3+0 | siatka w ekranie |
| 1280×600 | +422,2 | 4 | 713,2 / 600 | 2+2 N2, 2+1 N1 | przewija się, długa kolumna bez pozycji uciętej w pół ✓ |
| 1280×720 | — | 3 | 713,2 / 720 | 2+2 N2, 2+1 N1 | siatka w ekranie |
| 1366×620 | +329,6 | 4 | 693,4 / 620 | 2+2 N2, 2+1 N1 | **brakuje 73 px** (przed punktem 4.3: 12 px) ✗; ostatnia widoczna pozycja długiej kolumny wystaje 0,8 px poza kolumnę (ułamek piksela; przed zmianą przy 1536×730 było 0,2 px) |
| 1366×768 | — | 2 | 762,7 / 768 | 3+1 N1, 3+0 | siatka w ekranie |
| 1440×780 | +149,3 | **2** | 758 / 780 | 3+1 N1, 3+0 | ✓ |
| 1440×900 | — | 2 | 878 / 900 | 3+1 N1, 3+0 | siatka w ekranie; po „Zobacz więcej” w wydarzeniach krok 1 |
| 1536×730 | +166,5 | **2** | 708 / 730 | 3+1 N1, 3+0 | ✓ |
| 1536×864 | — | 1 | 687,8 / 864 | 3+1 N1, 3+0 | stopka pod ekranem |
| 1600×900 | — | — | — | 3+1 N1, 3+0 | bez kroku |
| 1707×830 | +0,7 | — | — | 3+1 N1, 3+0 | bez zmian, piksel w piksel ✓ |
| 1920×950 | +0,7 | — | — | 3+1 N1, 3+0 | bez zmian, piksel w piksel ✓ |
| 1920×1080 | +0,7 | — | — | 3+1 N1, 3+0 | bez zmian, piksel w piksel ✓ |

Liczba w „Zobacz więcej (N)” zgadza się z ukrytymi pozycjami w każdym oknie, przed kliknięciem i po nim:
- 15 okien, w każdym 2 krótkie kolumny przed kliknięciem i 2 po nim: 60 porównań, 0 niezgodnych, bez błędów w konsoli;
- w kroku 3 przycisk „Zobacz więcej (1)” pojawia się także w kolumnie z trzema pozycjami;
- na telefonie N jak dotąd: wydarzenia (1), aktualności (9), seminaria bez przycisku.

Stan bez JS na komputerze i na telefonie jest jak przed zmianą. Zrzuty: `z26-drugi-1280x600.jpg`, `z26-drugi-1366x620.jpg`, `z26-drugi-1536x730.jpg`.

**1366×620 nie mieści się „na styk”.**
- Przy treści testowej po krokach 1–3 brakowało 12 px. Lewą kolumnę wyznacza pierwsze wydarzenie, którego tytuł zajmuje 3 linie.
- Po punkcie 4.3 kierunki studiów przy tej szerokości stoją pod opisem, a nie obok niego, więc Studia są o 61 px wyższe. Brakuje 73 px i zostaje krok 4.
- Pytanie 5.

## Punkt 4: drobne

- **4.1:**
  - `.z-h` ma `flex-wrap: wrap`.
  - Zakres dat seminariów ma `white-space: nowrap`, a w HTML stoi przed nim spacja. Dzięki spacji wiersz może się złamać, a czytnik ekranu nie skleja „Seminaria7–13”. Margines przed zakresem pomniejszyłem o szerokość spacji (8 − 4,796875 px), więc przy 22 px odstęp jest jak dotąd.
  - `h2` drugiego ekranu ma `clamp(18px, 1.7vw, 22px)`. Przy 18 px „Nadchodzące wydarzenia” już się nie łamie, ale po polsku przy 1024–1072 px link „Kalendarz →” nadal schodził pod nagłówek (brakowało do 15 px). Skrypt wyrównuje wtedy wysokość trzech nagłówków, więc kreski stoją na jednej wysokości przy każdej szerokości od 1024 do 1400 px, po polsku i po angielsku.
- **4.2:**
  - Poniżej 1100 px „Szybki dostęp” stoi w osobnym wierszu, jak na telefonie, a cztery pozycje w rzędzie pod nim.
  - „e-maile” i „e-mails” nie łamią się po łączniku (odstępstwo 6).
- **4.3:**
  - Kierunki mają `repeat(auto-fit, minmax(110px, 1fr))`. Używam `auto-fit`, a nie `auto-fill`: przy 1920 px `auto-fill` dałby siedem torów i pięć kierunków ściśniętych z lewej.
  - Przy 1366–1451 px kierunki ułożyłyby się 4 + 1, z ostatnim samym w drugim rzędzie (zrzut `z26-kierunki-4plus1-1366x768.jpg`). Dlatego próg „opis nad kierunkami” przesunąłem z 1366 na 1452 px (odstępstwo 7).
  - Kierunki mają teraz co najmniej 110 px i „Szkoła doktorska” mieści się w jednej linii.

## Punkt 5

Katalogu `.przekazanie\zdjecia\` nie ma, więc punkt pominięty, a pytanie zapisane w dzienniku. Zestaw zdjęcia okładki jest bez zmian, największy wariant ma 2400 px.

## Inne sprawdzenia

| Co | Wynik |
| --- | --- |
| Build | 747 stron, tyle co przed |
| `astro check` | 6 błędów, tyle co przed zleceniem (3 × `process` w `astro.config.mjs`, 3 w `src/lib/zdjecia.ts`), żaden nowy |
| Build z buildem, 1920×950 i 1920×1080 | okładka i drugi ekran identyczne |
| Build z buildem, 1707×830 | drugi ekran identyczny; okładka zmieniona celowo (s = 0,874) |
| Telefon 390×844 i 412×915, PL i EN | okładka i drugi ekran identyczne |
| EN, 1920×950 | identyczne |
| Ciemny motyw, 1920×950 | identyczne |
| Bez JS, 1920×950 | identyczne |
| Flaga wyróżnionej aktualności (wariant budowy z datą w przyszłości, treść potem przywrócona) | między marką a tytułem w 6 oknach od 1024×600 do 3840×2000, od 13 do 48 px nad tytułem, bez poziomego przewijania; skaluje się z okładką |
| Narzędzie `24-pomiar-szerokosci.cjs`, strona główna, 11 okien, okładka i Szybki dostęp | 0 problemów przed i po, bez poziomego przewijania |

## Zrzuty (`raport-zrzuty/`)

- Okładka: `z26-okl-1280x600.jpg`, `-1536x730`, `-1920x950`, `-2560x1300`, `-3440x1300`, `-3840x2000`. Zrzuty szersze niż 1920 px są zmniejszone do 1920 px.
- Drugi ekran: `z26-drugi-` z tymi samymi oknami oraz `z26-drugi-1366x620.jpg`.
- Obok siebie: `z26-okl-porownanie.jpg` i `z26-drugi-porownanie.jpg` (1920×950 | 2560×1300 | 3840×2000), `z26-dzialy-1920-2560.jpg`.
- Ctrl +: `z26-ctrl-chrome-3840.jpg`.
- Do pytań: `z26-panel-3840x2000.jpg`, `z26-kierunki-4plus1-1366x768.jpg`.

## Odstępstwa od zlecenia

1. **Ctrl + i skala.** Zlecenie mówi, że przy wykrytym powiększeniu `s` się wyłącza. Sprawdziłem to: przy 3840×2000 tekst miałby 29 px przy 100%, 16 px przy 110% (maleje) i 29 px przy 200% (bez zmian), więc odbiór „200% daje tekst wyraźnie większy” by nie przeszedł. Dlatego:
   - skala liczona jest z rozmiaru okna sprzed powiększenia, a powiększenie ją mnoży, jak na każdej innej stronie;
   - limit: po skali zostaje co najmniej 1366 px szerokości projektu, bo węższy projekt przy oknie liczonym jeszcze jako szerokie ułożyłby się nieprawdziwie (progi układu liczą się od okna, nie od projektu);
   - stąd plateau między 150% a 250%.

   Powrót do wersji dosłownej to jedna linia w `Okladka.astro`.
2. **Wykrywanie powiększenia w Firefoksie.** W Firefoksie `outerWidth` rośnie razem ze stroną, więc stosunek `outerWidth / innerWidth` niczego nie mówi. Powiększenie liczę tam jako `devicePixelRatio` względem `devicePixelRatio` przy 100%, zapamiętanym w `localStorage` (`im-dpr-100`) razem z fizyczną szerokością ekranu. Zapis powstaje w każdej przeglądarce, w której stosunek `outerWidth / innerWidth` wynosi około 1, czyli także w Chrome, Edge i Safari przy 100%. O wyniku decyduje jednak tylko tam, gdzie ten stosunek nic nie mówi, czyli w Firefoksie. Ograniczenia:
   - pierwsza wizyta już z powiększeniem przyjmuje je za 100%;
   - zmiana skali systemu przy tym samym ekranie zostawia stary zapis.

   W obu przypadkach skutkiem jest wygląd jak bez tego zlecenia przy danym oknie, nie błąd. Panele boczne przeglądarki (pionowe karty Edge, panel boczny Chrome, zadokowane narzędzia) mogą w Chrome i Edge dać stosunek ponad 1,05. Skala liczy się wtedy z całego okna, czyli strona jest nieco większa.
3. **Krok 4 drabinki.** Zlecenie 25 sumuje kroki („zwiń pole → mierz → widok telefonu”), więc w kroku 4 zostaje układ z kroku 3, a nie wraca pełny. Strona jest wtedy krótsza.
4. **„Na styk”.** Studia mogą sięgać dolnej krawędzi okna; odstęp 22 px nad krawędzią zostaje tylko wtedy, gdy jest na niego miejsce.
5. **Dodatki ponad listę:**
   - krok 0, gdy jedynym problemem jest stopka wyższa niż 47 px;
   - wyrównanie wysokości nagłówków (4.1);
   - przyciski w prawym górnym rogu okładki (`.z-narz`) rosną powyżej Full HD razem z okładką, a poniżej trzymają wysokość marki;
   - przeliczanie skali także po powrocie „wstecz” i po prerenderingu.
6. **„e-maile”:** Manrope nie ma łącznika niełamiącego U+2011, przeglądarka wzięłaby go z innego kroju (13,3–22 px zamiast 16,8). Zostaje zwykły łącznik, a po nim łącznik słów U+2060 (bez szerokości), który zabrania łamania. Wygląd identyczny.
7. **Kierunki (4.3):** opis nad kierunkami poniżej 1452 px zamiast 1366 px, żeby nie było układu 4 + 1. Studia przy 1366–1451 px są wtedy o 43–61 px wyższe niż dawniej; w układzie 4 + 1 byłyby o 55–92 px wyższe. Próg zależy od liczby kierunków na stronie głównej (5). Wzór na inną liczbę jest w komentarzu w CSS.
8. **Liczby na okładce (`.z-okl-liczby a`)** zostają przy 12,5 px, poniżej progu 13 px, bo 1920×950 ma być piksel w piksel.

## Pytania

1. **Ctrl + przy 150–250%.** Do wyboru są trzy warianty:
   - **(a) zostaje jak jest:** 200% daje tekst 1,41 raza większy, 400% dwa razy;
   - **(b) limit 1024 px zamiast 1366 px:** 200% daje 1,87 raza, ale progi układu (pasek, Studia, Warto wiedzieć, powiększony wpis) trzeba by przenieść z okna na kontener, czyli osobne zlecenie;
   - **(c) wersja dosłowna:** przy powiększeniu bez skali, ale wtedy 200% przy 4K nie powiększa tekstu.

   Który wariant?
2. **Polityka prywatności.** Wymienia w `localStorage` tylko motyw i mapę, a teraz dochodzi `im-dpr-100`. Wpis zawiera `devicePixelRatio` i szerokość ekranu w pikselach, bez danych osobowych, i nigdzie nie jest wysyłany. Powstaje w każdej przeglądarce przy wizycie bez powiększenia (odstępstwo 2). Strona jest w repozytorium treści (`src/content/strony/polityka-prywatnosci.md`); nie zmieniałem jej. Czy dopisać zdanie?
3. **Safari.** Proszę o sprawdzenie na Macu: Cmd + do 200% na pełnym ekranie, tekst listy ma być wyraźnie większy niż przy 100%.
4. **Panel menu powyżej Full HD** nie rośnie: ma 670 px i tekst 14,5 px, a strona przy 4K 29 px (`z26-panel-3840x2000.jpg`). Zlecenie wymienia tylko drugi ekran, pasek i stopkę. Czy skalować także panel? Ma własny układ zależny od wysokości okna, więc to kilka zmian, nie jedna linia.
5. **1366×620.** Po krokach 1–3 brakuje 73 px, z czego 61 px to Studia z opisem nad kierunkami (punkt 4.3). Do wyboru:
   - zostaje przewijanie;
   - przy tej szerokości wracają kierunki obok opisu (98 px, „Szkoła / doktorska”), a wtedy brakuje 12 px;
   - piąty krok, np. bez opisów kierunków na niskim oknie.
6. **Kierunki 4.3:** czy przesunięcie progu na 1452 px jest dobre, czy wolisz dosłowne `auto-fill` z układem 4 + 1 przy 1366–1451 px?
7. **Zdjęcie okładki (punkt 5):** w `.przekazanie\zdjecia\` nie ma pliku szerszego niż 2400 px. Po jego dodaniu punkt jest do zrobienia osobno.
