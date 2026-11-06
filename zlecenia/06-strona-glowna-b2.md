# Zlecenie 06: strona główna B2 na telefonie (zwijany baner ze zdjęciem)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`. To zlecenie jest **wyjątkiem** od zdania „Strony głównej nie zmieniaj”: użytkownik zdecydował 31.10 o 23:36: „B2 wdrażamy. Stroną PC się na razie nie przejmujemy”.

**Kolejność:** wykonaj po zakończeniu zlecenia 01, bo oba zmieniają nagłówek i style telefonu. Zlecenia 03–05 są od tego niezależne, ale żadnego nie rób równolegle z tym.

## Cel
Na telefonie (≤ 760 px) strona główna zaczyna się od zdjęcia budynku Instytutu na cały pierwszy ekran. Tytuł, bursztynowe hasło i podtytuł stoją u dołu na ciemnej otoczce. Przy przewijaniu baner zwija się w wąski ciemny pas u góry: nazwa Instytutu przechodzi do paska nawigacji, a pod nim zostaje hasło. Pod pasem są dzisiejsze sekcje, ale listy pokazują po 3 pozycje i przycisk „••• Zobacz więcej”.

**Komputer (≥ 761 px) zostaje bez zmian**, z jednym wyjątkiem: nowym napisem „Nadchodzące wydarzenia” (pkt 4).

## Prototyp (w `.przekazanie\prototypy\`)
- `strona-glowna-b2.html`: samodzielna makieta. Pokazuje dwa warianty jeden pod drugim, B1 i B2, każdy w ramkach telefonu 390×844 (jasna i ciemna). **Wdrażamy B2**, czyli drugą część strony.
- `strona-glowna-b2\b2.html`: źródło B2, czyli CSS banera, znaczniki i skrypt zwijania z dociąganiem. To jest **wzór kodu i wartości**.
- `strona-glowna-b2\wnetrze.css` i `wnetrze.js`: wspólne style i skrypty makiety, w tym wzór „Zobacz więcej” (sekcja „··· Zobacz więcej” w CSS i obsługa `.wiecej-row` w JS).
- `strona-glowna-b2\B2-widok-v29.png`: zatwierdzony pierwszy ekran w trybie jasnym i ciemnym.
- `strona-glowna-b2\instytut-telefon-884x1779.png` (oryginał) i `instytut-telefon-884x1779.jpg` (JPEG q86, 356 KB): zdjęcie do banera.

Opisy obok ramek są częściowo nieaktualne: wspominają listę działów, „arkusz”, IntersectionObserver i stare zdjęcie 810×1056. **Obowiązuje to zlecenie i kod `b2.html`.** Makieta ma nagłówek 64 px, a strona na telefonie ma 61 px (`--hdr-h` w `telefon.css`). Wartości poniżej są przeliczone na stronę.

## 1. Baner na telefonie (`StronaGlowna.astro`, sekcja `.hero`)
Wszystko w tym punkcie dotyczy tylko `max-width: 760px`.

**Wymiary i zwijanie**
- Wysokość banera to `100svh` (zapas `100vh`).
- Z JS (`.js`) baner ma `position: sticky` i `top: calc(var(--pas) - 100svh)`, gdzie `--pas: calc(var(--hdr-h) + 36px)`. Po przewinięciu zostaje z niego pas o wysokości nagłówka + 36 px. To samo CSS, bez nasłuchiwania, przypina pas.
- Pas zostaje u góry do końca treści strony. Przy stopce może odjechać razem z treścią; wtedy nagłówek przyjmuje kolor stopki, jak dziś, bez migania.
- Bez JS baner jest zwykłym blokiem `100svh`, bez przypinania i bez pasa.
- `overflow: hidden`, tło `#0b1428`, `z-index` nad treścią.

**Zdjęcie: art direction, jedno `<img>`**
- Zamień `<img>` w `.hero-fig` na `<picture>` z `<source media="(max-width: 760px)" srcset={zdjecie_telefon} width="884" height="1779">`. Telefon pobiera wtedy tylko zdjęcie telefonu, a komputer tylko dzisiejsze `kampus-zmierzch`.
- Na telefonie zdjęcie ma `position: absolute; left: -6%; width: 112%; top: 107px; height: auto; aspect-ratio: 884 / 1779`. Górna krawędź jest 107 px od góry banera, dół wychodzi poza ekran (tam jest rzeka).
- Maska u góry (przejście z paska w zdjęcie): `linear-gradient(180deg, transparent 0, rgb(0 0 0 / .3) 36px, rgb(0 0 0 / .6) 72px, rgb(0 0 0 / .85) 120px, #000 176px)`. Daj też `-webkit-mask-image`.
- W trybie ciemnym zdjęcie ma `filter: brightness(.9) saturate(.95)`.
- Przyciemnienie u góry banera: 124 px, od `rgb(var(--scrim) / .72)` do 0.
- Dzisiejsze gradienty `.hero-fig::before` / `::after` i podpis `figcaption` są na telefonie wyłączone. Podpis telefonu opisuje pkt 5.
- `fetchpriority="high"`, bez `loading="lazy"`.

**Ciemna otoczka tekstu.** Przenieś regułę `.b2-duzy::before` z `b2.html` (linie 36–41) **dosłownie**, z tymi samymi stopniami gradientu i maski.
- Blok tekstu ma `width: fit-content`. Pod tekstem jest krycie 97%, od lewej krawędzi ekranu do końca najdłuższej linii.
- W prawo zanik przez 310 px w 10 stopniach (smoothstep).
- **W górę zanik przez 224 px w 16 stopniach (smootherstep)**, przez maskę.
- W dół otoczka sięga do dolnej krawędzi (`bottom: -240px`).
- Kolor `--scrim`: `8 14 30` w trybie jasnym i `5 9 20` w ciemnym, jak w `wnetrze.css`. Jeśli strona ma bliski odpowiednik (np. `--hero-cien`), możesz go użyć, ale wynik ma się nie różnić od zrzutu.

**Tekst** (blok `left: 16px; bottom: 98px; max-width: calc(100% - 32px)`)
- `h1`: „Instytut Matematyczny” / „Mathematical Institute”, w dwóch liniach. 40 px, 800, `line-height: 1.02`, `letter-spacing: -.028em`, biały, `text-wrap: balance`.
- Hasło: z danych (pkt 5), 18 px, 700, `line-height: 1.3`, `var(--accent)`, `margin-top: 12px`, w jednej linii (`white-space: nowrap`).
- Podtytuł: „Wydział Matematyki i Informatyki UWr” / „Faculty of Mathematics and Computer Science, University of Wrocław”. 14 px, 500, `line-height: 1.4`, `rgb(255 255 255 / .9)`, `margin-top: 6px`.
- Wejście przy załadowaniu: każdy z trzech elementów pojawia się z przesunięciem o 10 px w górę (0,6 s, opóźnienie 0,15 s, `cubic-bezier(.2,.7,.2,1)`). Bez tego przy ograniczeniu ruchu.
- Na telefonie **nie ma** wyróżnionej aktualności (`.hero-flag`), wstępu (`.hero-lead`) ani przycisków `.hero-btns`. Na komputerze zostają.

**Przycisk „Na skróty i wydarzenia”** (EN „Shortcuts and events”)
- To link do sekcji „Na skróty” (kotwica, działa też bez JS).
- Wygląd: na środku, `bottom: 24px`, `min-height: 48px`, `padding: 0 16px 0 20px`, `border-radius: 999px`, 15 px, 700, biały. Tło `rgb(var(--scrim) / .72)`, obwódka `inset 0 0 0 1.5px rgb(255 255 255 / .5)`, strzałka w dół 20 px.
- Strzałka podskakuje 2 razy o 5 px (1,4 s, opóźnienie 1,4 s). Bez tego przy ograniczeniu ruchu.
- Kliknięcie z JS przewija dokładnie do stanu zwiniętego, `innerHeight − pas`: płynnie, a przy ograniczeniu ruchu bez animacji.

**Skrypt zwijania** (wzór: skrypt w `b2.html`)
- Postęp `p = clamp(scrollY / (innerHeight − pas), 0, 1)` zapisuj jako `--p`, w `requestAnimationFrame`, przy `scroll` i `resize`. Wymiary zdjęcia odczytuj przy załadowaniu i przy `resize`, **nie w każdej klatce**.
- Tytuł: `opacity: clamp(0, 1 − 1.6p, 1)`, `translateY(−36p px)`.
- Przycisk: `opacity: clamp(0, 1 − 4p, 1)`. Od `p > .25` dostaje `visibility: hidden`, bo stoi w obszarze pasa i inaczej byłby niewidocznym, klikalnym celem w kolejności Tab.
- Przyciemnienie całego banera: `rgb(14 25 52 / .9)`, w trybie ciemnym `rgb(9 16 34 / .92)`, `opacity: clamp(0, (p − .35)·1.6, 1)`.
- Mały napis w pasie: samo hasło, 15 px, 700, `var(--accent)`, `left: 16px; bottom: 9px`, `opacity: clamp(0, (p − .62)·3, 1)`, `aria-hidden="true"`.
- Paralaksa zdjęcia: `translateY(p · przes)`, gdzie `przes = innerHeight − pas/2 − top_zdjęcia − wysokość_zdjęcia/2`. W zwiniętym pasie widać wtedy środek zdjęcia, czyli budynek. Przy ograniczeniu ruchu `przes = 0`.
- Nazwa w pasku nawigacji pojawia się przy `p > .8` (pkt 2).

**Dociąganie** (bez zatrzymania w połowie między zdjęciem a „Na skróty”; wzór w `b2.html` od komentarza „v7”)
- Strefa `Z = innerHeight − pas`.
- Po zakończeniu przewijania (`scrollend`, a bez niego 140 ms ciszy), **nigdy, gdy palec jest na ekranie**, i tylko gdy `0 < scrollY < Z`:
  - w dół: przy `scrollY > 8` do `Z`, inaczej do 0;
  - w górę: przy `scrollY < 0,75·Z` do 0, inaczej do `Z`.
- Poza strefą przewijanie jest zupełnie zwykłe. Przy ograniczeniu ruchu dociąganie działa bez animacji.

## 2. Nagłówek na stronie głównej, telefon
- Tło przez cały czas, na zdjęciu i w pasie: `rgb(10 18 38 / .58)`, `backdrop-filter: blur(10px) saturate(1.15)` (z `-webkit-`).
- Na zdjęciu nagłówek nie ma dolnej linii. Po zwinięciu (`p > .8`) dostaje `box-shadow: 0 1px 0 rgb(255 255 255 / .06)`.
- Nazwa Instytutu w pasku (`.brand-txt`) jest na zdjęciu ukryta (`opacity: 0; transform: translateY(4px)`, przejście 0,25 s), a po zwinięciu widoczna jak na podstronach. Logo UWr, lupa, przełącznik motywu i menu są białe jak dziś na zdjęciu.
- Na telefonie wyłącz dzisiejsze przejście w biały nagłówek po przewinięciu strony głównej (`przewiniety`) i animację `hero-hdr` (`animation-timeline`). Menu otwarte w dowolnym miejscu strony głównej ma kolory ciemne. Przy stopce zachowanie zostaje jak dziś.
- `scroll-padding-top` na stronie głównej telefonu ma wynosić `pas + 8px`, żeby fokus i kotwice nie chowały się pod pasem.

## 3. Sekcje pod banerem: po 3 pozycje i „Zobacz więcej”
Kolejność i wygląd sekcji zostają jak dziś: Na skróty, wydarzenia, Aktualności, Najbliższe seminaria, Studia, Warto wiedzieć.
- W sekcjach **wydarzenia, Aktualności i seminaria** widać pierwsze 3 pozycje. Pod nimi jest przycisk na całą szerokość ramki: trzy kropki (5 px), „Zobacz więcej” i wyciszone „(N)”, gdzie N to liczba ukrytych pozycji. EN „Show more”.
- Wygląd przycisku: `min-height: 44px`, 14 px, 700, kolor `var(--znacznik-tekst)`, górna linia `var(--line)`. Wzór jest w `wnetrze.css`.
- Po rozwinięciu przycisk ma napis „Zwiń” (EN „Show less”), bez kropek i licznika. Ustawiaj `aria-expanded` i `aria-controls`.
- **Rozwinięta może być tylko jedna sekcja.** Rozwinięcie jednej zwija pozostałe.
- **Strona nie skacze.**
  - Przy rozwijaniu kotwicą jest ostatnia widoczna pozycja tej sekcji, przy zwijaniu sam przycisk.
  - Po zmianie przewiń o różnicę położenia kotwicy (`scrollBy`, bez animacji). To wyrównuje też zwinięcie sekcji wyżej.
  - Fokus zostaje na przycisku: `focus({ preventScroll: true })`, bez obwódki po kliknięciu palcem.
  - Wzór jest w `wnetrze.js`.
- Ukryte pozycje mają `display: none`, więc nie są w kolejności Tab.
- Bez JS widać wszystkie pozycje, a przycisku nie ma: ukrywanie działa tylko pod `.js`.
- Przy ≤ 3 pozycjach przycisku nie ma.
- Studia i Warto wiedzieć zostają bez zmian.

## 4. Wydarzenia
- Nagłówek „Najbliższe wydarzenia” zmień na **„Nadchodzące wydarzenia”** (EN „Upcoming events” bez zmian). Zmiana jest w `i18n.ts` i obejmuje też komputer, co jest dopuszczalne. Klucz `najblizsze` jest używany też we wpisie aktualności (`src/views/Aktualnosc.astro`, ramka z wydarzeniami). Tam zostaw dzisiejszy tekst, a dla strony głównej dodaj nowy klucz, np. `nadchodzace`.
- Lista na telefonie obejmuje nadchodzące wydarzenia z **30 dni** (nowe pole `wydarzenia_dni_telefon`, domyślnie 30) i przypomnienia terminów jak dziś. Pozycje idą chronologicznie, najwyżej 10.
- Na komputerze zostaje jak dziś: 3 wydarzenia z `wydarzenia_dni_robocze`.
- Skrypt, który w przeglądarce chowa zakończone wydarzenia, po usunięciu ma przeliczyć widok: pierwsze 3 pozostałe są widoczne, N jest aktualne, przy ≤ 3 nie ma przycisku, przy 0 pokazuje się komunikat jak dziś.

## 5. Dane (`src/data/ustawienia.json`), wszystko też do `.przekazanie\pola-do-cms.md`
- `haslo`: „Badania, studia i popularyzacja”; `haslo_en`: „Research, education and outreach”. Hasła są robocze.
- `baner.zdjecie_telefon`: `/pliki/baner/instytut-telefon.jpg`.
- `baner.podpis_telefon` / `podpis_telefon_en`: **puste**, bo podpis jest wyłączony do testów (decyzja użytkownika).
  - Gdy pole nie jest puste, pokaż mały podpis w prawym górnym rogu zdjęcia: `right: 12px`, `top: calc(var(--hdr-h) + 13px)`, 12 px, 600, biały, tło `rgb(var(--scrim) / .62)`, `padding: 3px 8px`, `border-radius: 6px`.
  - Podpis znika przy przewijaniu: `opacity: 1 − 3p`.
- `baner.opis` / `opis_en` (alt wspólny dla obu zdjęć): „Kampus przy placu Grunwaldzkim o zmierzchu: budynek Instytutu Matematycznego wśród drzew, nad Odrą” / „The campus at plac Grunwaldzki at dusk: the Mathematical Institute building among trees, by the Oder”.
- `wydarzenia_dni_telefon`: 30.

## 6. Zdjęcie
- Przygotuj `public/pliki/baner/instytut-telefon.jpg` z `instytut-telefon-884x1779.png`: 884×1779, JPEG progresywny, bez metadanych, **≤ 300 KB** (np. jakość ok. 80, `sharp` z `node_modules`, jeśli jest).
  - Bez nowej zależności npm. Jeśli nie da się zejść do 300 KB, weź gotowy JPEG z prototypu i zapisz to w dzienniku.
- Pochodzenie: kadr z fotografii fotopolska.eu nr 1158570 (autor: Corvus), powiększony do 884×1779.
  - Do testów lokalnych zostaje bez podpisu.
  - **Prawo do publikacji i treść podpisu ustali użytkownik przed pushem.** Wpisz to do „Pytań do użytkownika” w dzienniku.

## Kryteria odbioru
1. `npm run build` przechodzi. Na `/` i `/en/` w konsoli przeglądarki nie ma błędów.
2. Telefon 390×844, tryb jasny i ciemny, PL i EN: pierwszy ekran zgodny z `B2-widok-v29.png`.
   - Zdjęcie zaczyna się pod paskiem z łagodnym przejściem.
   - Cały budynek jest widoczny między paskiem a tytułem.
   - Otoczka zanika w górę płynnie, bez widocznej krawędzi.
   - Hasło jest bursztynowe i w jednej linii. Przycisk jest na dole.
3. Przy 360×640, 375×667, 430×932 i 740×360 (poziomo) nic na siebie nie nachodzi: tytuł z nagłówkiem ani przycisk z podtytułem. Hasło mieści się w jednej linii od 360 px.
4. Przewijanie:
   - baner zwija się w pas wysokości nagłówek + 36 px, z nazwą w pasku i hasłem pod nim;
   - dociąganie działa jak w pkt 1 i nie działa przy palcu na ekranie;
   - przycisk przewija dokładnie do pasa;
   - po zwinięciu przycisk nie jest klikalny ani osiągalny Tabem.
5. Sekcje:
   - nagłówek „Nadchodzące wydarzenia”;
   - w wydarzeniach, aktualnościach i seminariach po 3 pozycje i „Zobacz więcej (N)”;
   - rozwinięta jest jedna sekcja naraz, strona nie skacze, fokus zostaje na przycisku;
   - Tab nie trafia w ukryte pozycje;
   - przy ≤ 3 pozycjach nie ma przycisku;
   - po schowaniu zakończonego wydarzenia liczby się zgadzają.
   Sprawdź na danych testowych z ≥ 5 wydarzeniami.
6. Dostępność:
   - na stronie jest jeden `h1`;
   - kontrast bieli i bursztynu na otoczce wynosi ≥ 4,5 : 1 (zmierz w najjaśniejszym miejscu pod tekstem);
   - fokus nie chowa się pod pasem;
   - przy ograniczeniu ruchu nie ma paralaksy, wejścia ani podskoku, a przewijanie jest bez animacji;
   - bez JS jest zwykły baner na cały ekran i pełne listy.
7. Wydajność:
   - na telefonie pobiera się tylko `instytut-telefon.jpg` (≤ 300 KB), bez `kampus-zmierzch*`; sprawdź w panelu sieci;
   - CLS ≤ 0,01;
   - skrypt nie czyta układu w każdej klatce przewijania.
8. Komputer 1280 px bez zmian poza napisem „Nadchodzące wydarzenia” i znacznikiem `<picture>`. Sprawdź zrzutem albo porównaniem HTML i stylów.
9. Nowe pola są opisane w `.przekazanie\pola-do-cms.md`.
10. W `.przekazanie\dziennik.md` jest sekcja „06-strona-glowna-b2”, a w niej pytanie o prawa do zdjęcia.
