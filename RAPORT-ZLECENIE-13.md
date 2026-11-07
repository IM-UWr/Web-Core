# Raport: zlecenie 13 — płynność strony (5.11.2026)

Gałąź: `wyglad/zlecenie-13` (z `wyglad/zlecenie-11`, `e8ae1099`), 9 commitów (punkty 2–10) + commit raportu, **bez pushowania**. Zlecenie: `.przekazanie/zlecenia/13-plynnosc.md`.

- `astro build`: bez błędów (748 stron). Czas budowania: przed 14 s; po — 57 s za pierwszym razem (generowanie AVIF/WebP), potem 16 s (gotowe zdjęcia w `node_modules/.astro`).
- Treści: lokalna nakładka, `skrypty/pobierz_tresci.py` **nie był uruchamiany**, repozytoriów Web-* nie zmieniałem. Bez service workera (zgodnie z „Nie robić”).
- Bez nowych zależności: Lighthouse 12.2.1 i Playwright uruchamiane przez `npx` / z katalogu tymczasowego; `sharp` do zdjęć to zależność, którą Astro już ma. `package.json` bez zmian.
- Sprawdzanie: Edge (Playwright), zbudowana strona w `astro preview` — wersja przed (`e8ae1099`) na porcie 4410, po na 4411. Zrzuty w `raport-zrzuty/z13-*`.

## Podsumowanie

| Punkt | Stan | Commit |
|---|---|---|
| 1. Pomiar przed i po (Lighthouse, komputer i telefon) | zrobione — tabele niżej | — |
| 2. Szkic rysuje się od razu (skrypt w linii) | zrobione | `143edb34` |
| 3. Kroje: preload, tylko latin i latin-ext, kroje zastępcze z metrykami | zrobione (pytanie 1 o Fast 3G) | `c879354c` |
| 4. Prerender następnej strony przy najechaniu | zrobione | `dce8b56a` |
| 5. Nic nie skacze (CLS ≈ 0) | zrobione — CLS ≤ 0,003 we wszystkich 8 pomiarach (przed do 0,189) | `6befed5e` |
| 6. Zdjęcia: `<picture>` AVIF/WebP, `srcset`, rozmyta wersja pod banerem | zrobione | `d1a6ad31` |
| 7. Natychmiastowy „wstecz” (bfcache) | zrobione — wszystkie sprawdzone strony wracają z pamięci | `bb9e003e` |
| 8. Animacje tylko `transform` i `opacity`; rozmyty pasek | zrobione; rozmycie zostaje (nie zacina) | `f226e160` |
| 9. Jeden rytm | zrobione | `d7604d38` |
| 10. `:hover`, `:active`, `:focus-visible` wszędzie | zrobione | `d153aada` |

## Pomiar przed i po (Lighthouse)

Lighthouse 12.2.1 (Edge bez okna), `astro preview` lokalnie, mediana z 3 przebiegów. Komputer: `--preset=desktop`; telefon: ustawienia domyślne (symulowane dławienie: wolne 4G, 4× CPU).

**Komputer**

| Strona | Wynik | FCP | LCP | CLS | SI | Waga |
|---|---|---|---|---|---|---|
| Strona główna | 94 → **98** | 0,62 → 0,46 s | 1,55 → **1,09 s** | 0,046 → 0,003 | 0,62 → 0,51 s | 1764 → **851 KB** |
| Nauka | 99 → **100** | 0,57 → 0,39 s | 0,75 → 0,68 s | 0,005 → 0 | 0,77 → 0,67 s | 451 → 412 KB |
| Plan zajęć | 98 → **100** | 0,57 → 0,42 s | 1,07 → 0,75 s | 0,015 → 0,001 | 0,64 → 0,62 s | 786 → **419 KB** |
| Aktualności | 97 → **100** | 0,49 → 0,39 s | 1,21 → 0,71 s | 0,001 → 0 | 0,49 → 0,44 s | 1829 → **471 KB** |

**Telefon**

| Strona | Wynik | FCP | LCP | CLS | SI | Waga |
|---|---|---|---|---|---|---|
| Strona główna | 73 → **82** | 2,56 → **1,75 s** | 6,54 → **4,77 s** | 0 → 0 | 2,56 → 1,75 s | 1145 → 737 KB |
| Nauka | 87 → **92** | 2,49 → 1,66 s | 3,61 → 3,33 s | 0 → 0 | 2,49 → 1,67 s | 449 → 430 KB |
| Plan zajęć | 69 → **95** | 2,49 → 1,59 s | 5,18 → **2,80 s** | **0,189 → 0** | 2,49 → 1,59 s | 760 → 329 KB |
| Aktualności | 93 → 93 | 2,19 → 1,53 s | 2,93 → 3,13 s | 0 → 0 | 2,19 → 1,53 s | 1827 → 480 KB |

TBT 0 ms wszędzie przed i po. Dostępność 100 (telefon) / 96 (komputer, przed i po): kontrast `<b>`/`<small>` w liczbach banera — bez zmian, poza tym zleceniem. Najlepsze praktyki 100. SEO 66 przed i po: wersja podglądowa ma `<meta name="robots" content="noindex">` (celowo, audyt `is-crawlable`).

Aktualności na telefonie: LCP to zdjęcie banera; przychodzi o 0,2 s później, bo z krojami z preload (punkt 3) dzieli łącze (pytanie 1). Pozostałe strony mają LCP lepszy.

## Kryteria odbioru

**Zrzuty bez zmian w wyglądzie.** Porównanie pikseli całych stron (przed: 4410, po: 4411; próg 24/255):

| Strona | 1440 px | 390 px |
|---|---|---|
| Plan zajęć | 0 różnych pikseli | — |
| Nauka | 28 (wygładzanie krawędzi) | 359 (wygładzanie krawędzi w banerze) |
| Władze | 5 | 29 |
| Aktualności, Sukcesy | tylko miniatury (AVIF zamiast JPG, ta sama treść) | tylko miniatury |
| Strona główna | tylko drugi ekran: liczba nadchodzących wydarzeń | jw. (strona krótsza o jeden przycisk „Zobacz więcej”) |

Na stronie głównej i w banerze Aktualności różnica wynika z godziny budowania (wydarzenia z 5.11 przed południem już minęły w wersji „po”), nie ze zmian w kodzie. Przykład: `raport-zrzuty/z13-wyglad-aktualnosci-przed-po-roznica.png` (przed | po | różnica ×4).

**Szkic rysuje się od pierwszej klatki (Fast 3G, `astro preview`).** Dławienie jak w DevTools (Fast 3G: 562,5 ms, 1,44 Mb/s) i 4× wolniejszy CPU, klatki z `Page.screencastFrame`:

| Strona | Start rysowania (`.z-rysuj`) | Pierwsza klatka (FCP) | Wynik |
|---|---|---|---|
| Nauka — przed (2 próby) | 2668 / 2630 ms | 2571 / 2630 ms | rysowanie czeka na moduł: raz ~0,1 s po pierwszej klatce, raz razem z nią (lokalnie moduł przychodzi szybko; na GitHub Pages — później, stąd zlecenie) |
| Nauka — po (2 próby) | 3014 / 2856 ms | 3033 / 2972 ms | rysowanie rusza przed pierwszą klatką |
| Studia — po | 2601 ms | 2615 ms | jw. |
| Instytut — po | 2657 ms | 2679 ms | jw. |

Klatki: `raport-zrzuty/z13-szkic-fast3g-nauka.png` (górny rząd przed, dolny po; pierwsza klatka i +0,1 / +0,4 / +1,2 s). Po: kreska rysuje się od pierwszej klatki, zdjęcie najpierw w rozmytej wersji, potem pełne. Na Fast 3G pierwsza klatka przychodzi teraz o 0,35–0,45 s później (pytanie 1).

**Przejścia bez przycięć przy 4× spowolnieniu CPU.** Odstępy między klatkami (`requestAnimationFrame`) w czasie animacji, Edge bez okna; „długie” = dłuższe niż 34 ms (zgubione 2 klatki):

| Animacja | Przed: maks / długie | Po: maks / długie |
|---|---|---|
| Okładka: barwienie przy najechaniu działu | 33 ms / 0 | 34 ms / 0 |
| Okładka → Szybki dostęp (przejazd) | 50 ms / 1 | 17 ms / 0 |
| Panel menu: otwarcie / zamknięcie | 17 ms / 0 | 17 ms / 0 |
| Spis „Na tej stronie” (znacznik) | 17 ms / 0 | 17 ms / 0 |
| Telefon: przewijanie z paskiem | 17 ms / 0 | 17 ms / 0 |
| Przewijanie pod rozmytym paskiem (Nauka, 6 przebiegów) | 0–1 długich | 0–2 długich; **z wyłączonym rozmyciem tak samo** 0–2 |

Rozmycie paska (`backdrop-filter`) nie jest przyczyną pojedynczych długich klatek, więc zostało bez zmian (22 px). Przewijanie mierzone w Edge bez okna (rysowanie programowe) — na zwykłej karcie graficznej rozmycie jest tańsze.

## Szczegóły punktów

**2. Szkic od razu.** Start rysowania (`.z-rysuj` po widoczności szkicu i dwóch klatkach) przeniesiony z modułu `szkice.ts` do skryptu w linii na końcu banera (`NaglowekZ.astro`). Moduł tylko zgrywa tempo podpisu z poprawką na spóźnienie; gdy nie zdąży przed końcem szkicu, podpis pisze się zastępczą animacją z CSS. W czasie składania strony w tle (prerender) skrypt tylko czyta stan — rysowanie i zapis wizyty po pokazaniu (`prerenderingchange`).

**3. Kroje.** `Fonty.astro` zamiast importu całych arkuszy `@fontsource-variable`: `@font-face` dla latin i latin-ext (z preload: Brygada 1918 i Manrope, razem 96 KB) oraz greek (bez preload — greckie litery w kilku tytułach publikacji). Cyrylica i wietnamski pominięte. Kroje zastępcze „Brygada zast” (Georgia) i „Manrope zast” (Arial): `size-adjust` dobrany na 400 akapitach i 400 nagłówkach, `ascent-`/`descent-`/`line-gap-override` z metryk docelowych, tylko w zakresach znaków docelowego kroju. Szerokość tekstu `70ch` → `42,7em` (to samo w Manrope; `ch` zależy od kroju i rozjeżdżało łamanie na kroju zastępczym). Porównanie pikseli 20 zrzutów po wczytaniu krojów: bez zmian.

**4. Prerender.** Reguła `prerender` (eagerness `moderate`, czyli po ok. 200 ms najechania) dla linków wewnętrznych z tymi samymi wyłączeniami co prefetch, dodatkowo bez plików `.ics`; prefetch zostaje, gdy przeglądarka nie złoży strony. W Edge strona składa się po najechaniu, zestaw ciekawostek (zalecenie 19) i zapis wizyty dopiero po pokazaniu, przejazd okładki (zalecenie 20) działa po aktywacji.

**5. CLS.** Spis strony na telefonie zwinięty od pierwszej klatki (klasa `html.js` zamiast modułu): Plan zajęć, telefon 0,195 → 0. Blok tytułu, skos i położenie zdjęcia okładki liczone skryptem w linii przed pierwszym narysowaniem: strona główna, komputer 0,071 → 0. Zdjęcia dostały `width`/`height` (punkt 6).

**6. Zdjęcia.** Nowy komponent `ZdjecieZ.astro` (+ `src/lib/zdjecia.ts`): zdjęcia z `public/pliki` jako `<picture>` z AVIF i WebP (jakość 60) w kilku szerokościach. `sizes` liczone z pola, w którym zdjęcie jest kadrowane (`object-fit: cover` → potrzebna szerokość = większa z: szerokość pola, wysokość pola × proporcje zdjęcia); miniatury w 1×/2×/3×. Okładka i banery: `fetchpriority="high"` i malutka rozmyta wersja w linii (WebP 32 px, 0,3–0,5 KB), na którą pełne zdjęcie łagodnie wchodzi (tylko z JS; bez JS od razu pełne); do tego czasu tło w kolorze działu. Reszta leniwie. Studia: szerokość `--sz` bez zmian, `sizes` liczone z niej. Przykład: okładka na telefonie — AVIF 1920 px, 329 KB zamiast JPG 574 KB. Pliki spoza `public/pliki` i zewnętrzne — zwykły `<img>` jak dotąd.

**7. bfcache.** Na stronie nie ma `unload`/`beforeunload`, `no-store`, `BroadcastChannel` ani otwartych połączeń. Test w Edge (CDP `Page.backForwardCacheNotUsed`, `pageshow.persisted`): 14 stron × komputer i telefon — wszystkie wracają z pamięci; po ostatnich zmianach powtórzony na 5 stronach × 2. Po powrocie zamyka się panel hamburgera, z którego kliknięto link, a okładka zdejmuje barwienie (fokus po kliknięciu myszą już nie barwi — tylko fokus z klawiatury).

**8. `transform` i `opacity`.** Pasek menu: tła stanów w warstwach `::before` (ciemna z rozmyciem) i `::after` (jasna), przełączanych przez `opacity`; ukryta warstwa ma `visibility: hidden`, więc jej rozmycie nie jest liczone. Okładka: kreska pod nazwą działu przez `scaleX`, poświata przez `opacity`. Znacznik spisu: `translateY` + `scaleY` zamiast `top`/`height`. Podświetlenie kolumny po kliknięciu liczby i jaśniejsza „Rekrutacja”: warstwy przez `opacity`. Zostają przejścia koloru (`color`, `background-color` linków i przycisków — tylko przemalowanie małego obszaru, bez przeliczania układu) i rysowanie szkicu (`stroke-dashoffset`).

**9. Rytm.** Zmienne w `global.css`: `--rytm: cubic-bezier(.22, .8, .2, 1)`, `--t-krotki .15s`, `--t-sredni .25s`, `--t-dlugi .35s`. Na nich: pasek i panel menu, nagłówek telefonu, spis, hasła na okładce, liczby, przejścia widoków między stronami, rozwijane listy, zdjęcia działów. „Zobacz więcej” na drugim ekranie: FLIP 0,52 → 0,35 s, wiersze 0,25 s co 35 ms. Dłuższe ruchy z wcześniejszych zleceń zostają: rysowanie szkicu, podświetlenie kolumny 1,6 s, barwienie okładki 0,6 s, przejazd okładka ↔ Szybki dostęp 700 ms (z tą samą krzywą tam, gdzie to ruch). Pasek i nagłówek przy przejściach między stronami stoją (jak dotąd).

**10. Stany.** Wciśnięcie: link, przycisk, `summary` przygasają od razu (`opacity: .72`, bez przejścia) — myszą i palcem; na dotyku bez szarego prostokąta przeglądarki; pusty `touchstart` w `Baza.astro`, żeby Safari na iOS zgłaszało `:active`. Najechanie: na stronach poza działami (Aktualności, Kalendarz, wpisy) akcent działu jest kolorem tekstu, więc linki i przyciski dostają tam podkreślenie; linki już podkreślone w kolorze działu (kontakt Władz, „Zgłoś błąd”, archiwum) — grubsza kreska; znak „Instytut Matematyczny” w pasku — podkreślona nazwa (dawniej granat na granacie). Audyt prawdziwymi zdarzeniami (najechanie, wciśnięcie bez kliknięcia, fokus z Tab) na 6 stronach komputera i 4 telefonu: zmianę mają wszystkie widoczne linki i przyciski poza bieżącą pozycją menu i spisu (celowo).

## Pytania

1. **Fast 3G a preload krojów.** Lighthouse (symulacja z priorytetami pobierania) pokazuje FCP lepszy na wszystkich stronach (telefon: 2,2–2,6 → 1,5–1,8 s). Dławienie w stylu DevTools (Fast 3G, każde pobieranie dostaje równy kawałek łącza) pokazuje odwrotnie: pierwsza klatka Nauki 2,57–2,63 → 2,97–3,03 s, zdjęcie banera Aktualności 1,94 → 2,31 s. Powód: cztery kroje z preload (96 KB) dzielą łącze z arkuszem CSS i zdjęciem. Na HTTP/2 (GitHub Pages) arkusz ma pierwszeństwo, więc w praktyce różnica powinna być mniejsza. W zamian tekst nie zmienia kroju po wczytaniu. Do sprawdzenia w PageSpeed Insights po pushu. Jeśli wyjdzie gorzej: preload tylko Brygady (tytuły), Manrope bez preload. Zostawić czy zmienić?
2. **Kroje zastępcze na Androidzie.** Metryki dobrane do Georgii i Ariala (Windows, macOS, iOS). Na Androidzie zamiast nich są Noto Serif / Roboto — tam podmiana kroju może lekko przesunąć tekst. Nie sprawdzone (brak urządzenia).
3. **Pominięte podzbiory.** Cyrylica i wietnamski nie są wczytywane. Treści z cyrylicą (np. nazwiska w publikacjach) pokażą się krojem systemowym. Czy są takie treści?
4. **Czas budowania.** Pierwsze budowanie 57 s zamiast 14 s (AVIF/WebP). W GitHub Actions bez pamięci podręcznej `node_modules/.astro` tak będzie za każdym razem — warto dodać `actions/cache` dla tego katalogu (zmiana w workflow, poza tym zleceniem).
5. **Okładka na telefonie.** LCP na telefonie to zdjęcie okładki. Osobny, węższy kadr na telefon (art direction, `<source media>`) skróciłby LCP mniej więcej o 0,6 s. Wymaga drugiego pliku zdjęcia w CMS — czy robić?
6. **Ekrany o gęstości 1×.** Przeglądarka bierze tam mniejszy plik (np. 1280 px zamiast skalować JPG 2400 px), więc zdjęcie bywa minimalnie mniej ostre niż dotąd. Na ekranach 2× i 3× obraz jest nie do odróżnienia. Podniesienie jakości z 60 do 70 to około +25% wagi.
7. **Galeria w aktualnościach** (`Galeria.tsx`, wyspa React) — zdjęcia galerii zostały zwykłymi `<img>`. Przerobienie na `astro:assets` wymaga przekazania gotowych `srcset` do komponentu React — osobna, mała zmiana.
8. **Prerender** sprawdzony tylko w Edge (Chromium). Firefox i Safari nie znają `speculationrules` — strona ładuje się tam zwyczajnie.
9. **„Zobacz więcej” krócej (0,35 s zamiast 0,52 s)** i bez zmian w dłuższych ruchach (szkic, barwienie 0,6 s, podświetlenie 1,6 s, przejazd 700 ms) — czy tak zostawić, czy też skrócić do 0,35 s?
