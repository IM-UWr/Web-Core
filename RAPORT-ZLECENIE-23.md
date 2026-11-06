# Raport: zlecenie 23 — telefon w poziomie i okładka „na próg” (6.11.2026)

Gałąź: `wyglad/zlecenie-16`. Zlecenie mówiło „bez pushowania”, więc wypchnąłem ją dopiero na słowo właściciela („Tak push”, 6.11). Repozytoriów treści to zlecenie nie zmieniało, a `main` nie jest ruszany. Zrobione wszystkie punkty GOTOWE: od 1 do 6. Zlecenie jest otwarte i rosło w trakcie pracy (doszły punkty 5 i 6, punkt 2 dostał status GOTOWE), więc na końcu pobrałem je jeszcze raz. Ostatnia wersja w źródle: `c9d3f0a2`, bez nowych punktów.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Telefon w poziomie: jedna definicja telefonu i niski ekran | `f6ec9126` |
| 3 | Telefon: pasek półprzezroczysty na banerze już na górze strony | `db2c0579` |
| 4 | Telefon: okładka pod paskiem, pasek prześwituje zdjęciem | `ca26ba53` |
| 2 | Okładka albo Szybki dostęp: palcem na próg, na komputerze kliknięciem, powrót z paska | `ecea03d2` |
| 5 | Telefon: bez jasnej linii pod okładką | `fd6e6313` |
| 6 | Telefon: sygnet przy linku i pierwszej linii tytułu | `61ed1dd0` |

Punkty 3 i 4 zrobiłem przed punktem 2, bo punkt 2 nie był jeszcze GOTOWE, gdy do nich doszedłem.

**Kolejność zleceń.** Zlecenie mówi „dopiero po zakończeniu zleceń 21 i 22”, a zlecenie 22 nadal czeka na etapie 9 na zapisy właściciela w CMS. Zrobiłem 23 na wyraźne polecenie właściciela. Obie prace się nie krzyżują: zlecenie 23 nie zmienia pól CMS ani treści.

## Co sprawdza właściciel na telefonie

Wszystkie moje próby dotyku to emulacja w Chromium. Tego emulacja nie pokaże:

- **Czucie progu i oporu (punkt 2).** Liczby są w jednym miejscu: `--z-prog: .333` i `--z-opor: .55` w `src/styles/zalozyciele-strony.css`.
- **Safari na iPhonie.** Nic nie było uruchomione na WebKicie.
- **Czytniki ekranu.** Przejście po fokusie sprawdziłem klawiszem Tab, nie czytnikiem.
- **Jasna linia na prawdziwym ekranie (punkt 5), w Brave i Chrome,** także po wysunięciu i schowaniu paska adresu. Emulacja nie ma paska adresu, więc `lvh` i `dvh` są w niej równe.
- **Laptop z ekranem dotykowym (punkt 2).** Chromium z dotykiem zawsze zgłasza `hover: none`, więc nie da się tego odtworzyć. Skrypt nie włącza wtedy ciągnięcia, a `touch-action` jest w CSS na każdym urządzeniu.
- **Prawdziwe obroty telefonu.** Obrót sprawdzony tylko zmianą rozmiaru okna emulacji.

## Punkt 1: telefon w poziomie

Definicje są w `src/lib/media.ts`. W CSS ten sam zapis dosłownie, z komentarzem. Niski ekran: `src/styles/zal-niski.css`.

- **Na zbudowanej stronie:** 6 urządzeń × 12 stron × PL i EN × jasny i ciemny, razem 288 prób: bez przewijania w poziomie, tekst nie szerszy niż próg skryptu (700 px; kolumna ma 680 px). Widok telefonu i pasek 52 px mierzone tam osobno: obrót, 4 rozmiary okna i 150 prób przy 863×360. Na serwerze dev po punkcie 1 te same 288 prób sprawdzały też widok telefonu.
- Skrypt oznaczył 48 z tych prób, ale żadna nie jest prawdziwym błędem. To zdjęcia przycięte przez baner (`IMG.z-lqip`, `z-pelne`) i teksty tylko dla czytników (`.kier-podpis`, `.zp-lbl`).
- Przegląd 141 stron przy 915×412: bez problemów z układem. Jedyne zgłoszenie to `/publikacje/`, adres 404 z mojej listy startowej, takiej strony nie ma.
- Obrót bez przeładowania na głównej, dziale i podstronie: 0 problemów, menu się zamyka, panel przewija się w poziomie.
- **Komputer i tablet wobec stanu sprzed zlecenia:** 264 strony (położenia, style, wybrane zdjęcie). Na oknach komputera i tabletu jedyna różnica na końcu to jedno zdjęcie wczytywane z opóźnieniem. Zrzuty pikselowe (192) porównałem tylko po punkcie 1: różnice tej samej wielkości co między dwoma zrzutami tego samego stanu (miniatury, zdjęcia wczytywane z opóźnieniem, animacja szkicu). Telefon w pionie zmieniają tylko punkty 3–6, patrz niżej.
- `grep`: samo `(max-width: 760px)` lub `(min-width: 761px)` zostało tylko w definicjach.

Zostawione świadomie, bo nie działają w widoku telefonu na szerokim, niskim ekranie albo dotyczą tylko `sizes`:

- `@container (min-width: 760px)` w `ListaAktualnosci.astro`
- `(max-width: 720px)` w `global.css:242` i `telefon.css:202` (nieużywane `.hero-in`)
- `(min-width: 780px)` w `Obrona.astro:56`, `(min-width: 820px)` w `WartoWiedziecWpis.astro:49` i `Zaklad.astro:53` (tylko `sizes`)
- progi 980, 1104, 1180, 1400 i 1600 wewnątrz widoku komputera

Bez `@custom-media`. Opisowe komentarze „≤ 760 px” w starszym kodzie zostały, a `media.ts` wyjaśnia, co znaczą.

Ekran szeroki i niski z `pointer: none` (bez myszy i dotyku) nie pasuje do żadnej z dwóch definicji. To wprost wzór ze zlecenia, zostawiam go.

Zrzuty: `raport-zrzuty/z23-poziomo-*`, odświeżone po wszystkich punktach, z wersji zbudowanej.

## Punkt 2: okładka albo Szybki dostęp

`przejazd.ts` przepisany z prototypu. Usunięte: `scroll-snap`, chowanie po spokoju, „zawsze na okładkę” na telefonie i dociąganie na komputerze.

**Odbiór na zbudowanej stronie: 174 sprawdzenia, 0 błędów.**

- **Telefon, Pixel 7, 412×839, PL jasny i EN ciemny, prawdziwy dotyk przez CDP:** 150 i 260 px powoli wraca, machnięcie 200 px w ok. 60 ms wraca, 300 px powoli daje Szybki dostęp pod paskiem (61 px), okładka schowana, pasek jasny. Nazwa w pasku wraca na okładkę bez przeładowania, strzałka przechodzi, odświeżenie i „wstecz” wracają w to samo miejsce, nowe wejście daje okładkę. W trakcie ciągnięcia `innerHeight` stały i bez przewijania w poziomie. Drugi palec przerywa.
- **Komputer 1920×950 i 1366×640:** 1 i 4 ząbki kółka nic, PgDn, PgUp, spacja, strzałki, Home, End nic. Ctrl + kółko przechodzi. Strzałka, liczby z podświetleniem kolumny, Enter i Tab przechodzą. Dalej zwykłe przewijanie, PgUp i Home nie wracają, mocno w górę staje na górze Szybkiego dostępu, znak w pasku wraca.
- **Pasek przewijania prawdziwą myszą:** w trakcie trzymania nic nie skacze, po puszczeniu płynnie wraca na okładkę.
- **Z zewnątrz (jak szukanie lub kotwica):** do 30% drogi wraca, do 70% Szybki dostęp, głębiej położenie zostaje.
- **Tablet 820×1180:** próg działa, znak w pasku wraca.
- **Niskie ekrany:** telefon 915×412, 844×390 i 667×375 mieści okładkę, więc próg działa. Komputer 1366×420 i 1100×360 nie mieści: bez progu, zwykłe przewijanie, okładka chowa się na krawędzi.
- **Nasłuchy na `window`:** dotyk pasywny, `wheel` niepasywny tylko na stronie głównej, na podstronach ani jednego.
- **Bez JS:** zwykłe przewijanie, także palcem. „Ogranicz ruch”: przesunięcie za palcem zostaje, przejścia natychmiastowe, strzałka nie podskakuje.

Poprawki względem prototypu, wszystkie znalezione na kodzie:

1. **Otwarcie menu na telefonie przenosiło na Szybki dostęp.** Panel stoi w obszarze `#szybki-dostep` i po otwarciu dostaje fokus, a fokus w tym obszarze to przejście. Teraz fokus w panelu się nie liczy.
2. **Otwarty panel na komputerze nie był rozpoznawany,** bo klasa `html.menu-otwarte` jest tylko na telefonie. Teraz sprawdzam sam panel.
3. **Kółko i klawisze na końcu panelu przewijały stronę pod spodem,** a po zamknięciu mogła zostać w połowie drogi. Teraz na okładce nie ruszają strony.
4. **Link w pasku przy otwartym menu:** strona się nie przeładowuje, więc panel zamykam sam.
5. **Adres z ukośnikiem i bez** (`/Web-Core` i `/Web-Core/`, `/en` i `/en/`) traktuję jak ten sam.
6. **Szukanie lub kotwica głębiej niż krawędź** cofałyby stronę do góry Szybkiego dostępu i gubiły trafienie. Teraz położenie zostaje.
7. **Własne zdarzenie `z-okladka`** zamiast udawanego `scroll`, jak sugerowało zlecenie.
8. Drobne: nasłuch końca przejścia nie gromadzi się przy kolejnych przejazdach, `pointercancel` zeruje stan myszy, po animacji wejścia strony warunek „okładka się mieści” liczy się od nowa.

Nowe wejście z innej strony zawsze daje okładkę. Jedno niesprawdzone: zlecenie mówi „wpisany adres”, a przejście na ten sam adres, na którym się już stoi, Chromium w teście traktuje jak odświeżenie i zostaje Szybki dostęp. Ręcznego wpisania w pasek adresu emulacja nie odtworzy, więc to do sprawdzenia na telefonie.

## Punkt 3: pasek na banerze

Telefon 390 i 412 px, PL i EN, oba motywy, wszystkie strony z banerem:

- górna krawędź banera 0 na wszystkich 88 wpisach, pasek półprzezroczysty, po przewinięciu nad treścią jasny;
- 616 porównań położeń: poza tolerancją tylko 2, oba to sygnet przy dwulinijkowym tytule „Władze” po angielsku, czyli zmiana zamierzona w punkcie 6;
- kotwice: 14, bez różnic wobec Web-Podglad, także na wersji zbudowanej;
- przejścia między stronami bez mignięcia granatem: na serwerze dev kilka tras, na wersji zbudowanej dwie (Obrony → Władze, Władze → Popularyzacja, motyw jasny);
- strony bez banera (`/powiadomienia/`, 404) i komputer bez zmian.

Dwie rzeczy do decyzji właściciela, obie zostawione:

- **Znak na banerze** stoi w całości pod paskiem, jak każe zlecenie 18, punkt 15. Wzór w zleceniu 23 pokazuje go wchodzącego pod pasek. Jeśli ma wejść, to jedna liczba w `.z-znak`.
- **Krótka strona `/szukaj/`** ma stopkę w oknie już na górze, więc pasek ma tam pełny granat zamiast prześwitu. Tak wynika z zasady stopki właściciela.

Zrzuty: `raport-zrzuty/z23-pasek-*`.

## Punkt 4: pasek na okładce

- Telefon 390×844, 412×915, 360×740, PL i EN, oba motywy: góra okładki 0, 30% granatu i rozmycie, także w trakcie ciągnięcia. Środek budynku bez zmian (223, 259 i 171 px).
- Kontrast na najjaśniejszym miejscu zdjęcia: nazwa Wydziału 6,53, język 8,33, tryb ciemny 8,62, hamburger 5,48. Wszystko powyżej 4,5, więc krycia nie podnosiłem.
- Otwarte menu: pełny granat, jak dotąd. Szybki dostęp i stopka: pasek jasny, jak dotąd.
- Dodałem jedno, czego nie ma w zleceniu: przy wejściu strony cała okładka gasła, więc przez prześwitujący pasek migało jasne tło przez ok. 100–200 ms. Teraz okładka stoi, a wjeżdżają napisy i działy, jak w pasach podstron. Na wersji zbudowanej pasek stoi w tym samym kolorze przez wszystkie 90 klatek, w obu motywach.
- Usunięte martwe reguły `.hdr-glowna` z `telefon.css`.

Zrzuty: `raport-zrzuty/z23-okladka-pasek-*`.

## Punkt 5: jasna linia

Metoda: CDP przyjmuje tylko całkowitą wysokość, więc ułamkową (801–806 px co 0,25, skala 2,75) dałem przez stronę w ramce.

| | Prób | Z jasną linią | Kolor ostatniego rzędu |
| --- | --- | --- | --- |
| Web-Podglad, stan przed | 21 | 17 | m.in. (73, 81, 98), (132, 137, 147), (192, 193, 196) |
| Po zmianie, dev i wersja zbudowana | 21 | 0 | (13, 24, 48), kolor okładki |

To ta sama usterka co na zrzucie właściciela, więc metoda ją łapie.

Dodatkowo 6 prób wprost przez CDP na całkowitych wysokościach. Przy 4 z 6 ostatni rząd bywa zabarwiony, ale to artefakt narzędzia: przy tej samej emulacji na pustej stronie testowej ostatni rząd bierze kolor z górnego rzędu okna. Na tych próbach nie opieram wyniku, a kolor nie jest jasny.

- 616 położeń strzałki, działów i banerów w tolerancji; Szybki dostęp niżej o zamierzony 1 px.
- Komputer i tablet bez zmian. Niski ekran: nadmiar też wliczony.
- Dodałem `@supports not (height: 1lvh)` dla starszych przeglądarek: bez tego `padding` z `var()` byłby nieprawidłowy.

Zrzut: `raport-zrzuty/z23-linia-pod-okladka-przed-po.png`.

## Punkt 6: sygnet

Zamiast `margin-top: 13px` ze zlecenia sygnet stoi w wierszu tytułu i sięga w górę. Dzięki temu nie zależy od wysokości linku, także gdy ten się zawinie. Wymiary są w zmiennych, a niski ekran zmienia tylko je.

- 360, 390, 412 px, PL i EN: Teoria modeli, Analiza harmoniczna, Dyskretna analiza harmoniczna, Prawdopodobieństwo, ISIM (1–4 linie): sygnet zawsze 13,2–61,2 px od góry linku, dół pierwszej linii 61,2 px. Też na wersji zbudowanej.
- Niskie ekrany 915×412, 844×390, 667×375: dół sygnetu równy dołowi pierwszej linii (56,9 px).
- Tytuły w jednej linii piksel w piksel jak ze starą regułą: 15 z 15 prób, też granty.
- Na 264 stronach zmienia się tylko sygnet przy długich tytułach, a treść niżej ani o ułamek piksela. Pierwsza wersja przesuwała ją o 1/64 px przez zaokrąglenie wysokości wiersza, poprawione.
- Komputer bez zmian.

Zrzut: `raport-zrzuty/z23-sygnet-po.png`.

## Sprawdzenia całości

- `astro check`: 6 błędów, te same co przed zleceniem, żadnego nowego.
- `npm run build` w osobnym katalogu z własnym `node_modules` i treściami przez `--lokalnie`: przechodzi, 747 stron. Na tej wersji powtórzone odbiory punktów 1, 2, 5, 6, obrót, kotwice i przejścia.
- Rzadki stan w teście na wersji zbudowanej (pasek 72 px, przewijanie w poziomie): strona bez CSS, bo testowy serwer `http.server` odrzucał połączenia. Na innym serwerze 150 prób bez ani jednego przypadku. To nie błąd strony.
- Zatrzymywałem tylko własne serwery testowe. Katalog budowania i moje wpisy w `.claude/launch.json` usunięte.

## Sprostowanie

W trakcie pracy napisałem właścicielowi, że wcześniejszy wynik „pasek 0 px” na Pixelu to serwer, który jeszcze przeliczał style. To było źle. Prawdziwa przyczyna: mój test czytał wymiary po zrzucie całej strony, a taki zrzut w emulacji zmienia wysokość okna, więc `(max-height: 500px)` przestawało pasować. Strona nie miała tego błędu.
