# Raport: zlecenie 14 — poprawki po zleceniu 11 (5.11.2026)

Gałąź: `wyglad/zlecenie-14` (z ostatniego commita zlecenia 13), 10 commitów + commit raportu, **bez pushowania**. Zlecenie: `.przekazanie/zlecenia/14-poprawki-po-11.md`.

**Do Twojej decyzji albo działania**

1. **Zalecenie 22 nie jest zrobione.** Na czacie napisałeś „W zleceniu 14 nie wykonuj zaleceń 21 i 22”, a w pliku zlecenia jest późniejszy dopisek „dalej od 22”. Trzymałem się polecenia z czatu. Jeśli 22 ma wejść, napisz (pytanie 1).
2. **Link „O stronie” w stopce daje 404, dopóki łatka `dok/latki/zlecenie-14/Web-Ustawienia.patch` nie wejdzie do Web-Ustawienia.** Łatkę trzeba nałożyć przed publikacją kodu albo razem z nią.
3. **Adres redakcji na stronie „O stronie”** jest do wpisania: dziś „(adres do uzupełnienia)” / „(address to be added)”.

Stan sprawdzenia:

- `astro build`: bez błędów, 747 plików `index.html` (745 stron i przekierowania).
- `astro check`: 6 błędów, **żaden nowy z tego zlecenia**: 3 `process` w `astro.config.mjs` i 3 w `src/lib/zdjecia.ts` (`node:path`, `node:fs/promises`, `process`), te ostatnie ze zlecenia 13, commit `d1a6ad31`. Znikną po dodaniu `@types/node`, czego nie robiłem (pytanie 6).
- Treści: `skrypty/pobierz_tresci.py` nie był uruchamiany, repozytoriów Web-* nie zmieniałem, nakładka przywrócona do stanu sprzed sprawdzania. `package.json` bez zmian.
- Sprawdzane w Edge (Playwright, CDP) na zbudowanej stronie: przed = zlecenie 13 (port 4411), po = zlecenie 14 (port 4412). Firefoksa, Safari i prawdziwych telefonów nie sprawdzałem. Czytnika ekranu też nie: sprawdziłem tylko atrybuty `aria-expanded` i `aria-controls`, etykiety i ukryte dopiski.

## Podsumowanie

| Zalecenie | Stan | Commit |
|---|---|---|
| 21. Wpisy na listach | **nie zrobione**: CZEKA, treść dopisze właściciel | — |
| 22. Pierwsza aktualność powiększona | **nie zrobione**: polecenie z czatu (pytanie 1) | — |
| 25. Paleta „Lazur i malina” | zrobione | `28d9fdcd` |
| 26. EN: linia pod nazwiskiem patrona w jednej linii | zrobione, z poprawką | `4ba018a6`, `005b79da` |
| 23. Linki poza stronę zawsze z ↗ | zrobione, z 2 poprawkami; wyjątki niżej | `2cbaa92b`, `d5ce64a0`, `1525e96f` |
| 24. Hamburger na zwijanych działach | zrobione, z poprawką | `55e0976d`, `c03f9c82` |
| 27. Stopka i strona „O stronie” | zrobione, treść jako łatka | `415a309d` |
| 28. Strona główna zeruje pierwsze wejście | zrobione | `ec84f695` |

## Usterki znalezione przy końcowym sprawdzaniu (naprawione)

Porównałem zbudowane strony zlecenia 13 i 14 na wszystkich 745 stronach. Wyszły trzy błędy, które wcześniejsze sprawdzenia przepuściły. Wszystkie weszły w tym zleceniu i mają osobne commity:

- **Baner działu tracił liczbę (zalecenie 26).** Ujemny margines linii patrona poszerzał jej pudełko, a skrypt dopasowania liczb liczy granicę z pudełek. Nauka przy 1440 px: rząd 680 → 520 px, 3 → 2 liczby. Teraz `flex-end`: pudełko ma 270 px, a dłuższa linia i tak wyszłaby w lewo. Rząd znowu ma 680 px.
- **Tytuły konferencji straciły krój (zalecenie 23).** Stara reguła `.wiersz .zew` dla strzałki po przeniesieniu klasy na link dotyczyła całego tytułu: Manrope 15 px zamiast Brygady 21 px, strona niższa o 433 px. Teraz reguła dotyczy tylko `::after`.
- **„Rekrutacja ↗” w panelu (zalecenie 24).** Strzałka spadała pod kreskę, bo działała reguła kreski działu (blok 28×2 px). Teraz jest w linii.

Wynik porównania po poprawkach:

| Sprawdzenie | 1440 px | 390 px |
|---|---|---|
| Liczby w rzędzie banera, tytuł `h1`, poziome przewijanie | bez różnic | bez różnic |
| Linia patrona | 4 strony działów EN: 39 → 19 px (cel zalecenia 26) | bez różnic |
| Wysokość strony | 20 stron | 379 stron |

- **1440 px:** 17 stron rośnie o 22–45 px, bo strzałka przenosi ostatnie słowo do nowej linii. Plan zajęć rośnie o 193 px (EN 116 px), bo ↗ ma każdy przedmiot z USOS. Władze maleją o 21 px, bo „strona domowa ↗” mieści się teraz w linii.
- **390 px:** 348 stron EN maleje o 24–25 px, bo „About this site” jest krótsze i stopka ma o jedną linię mniej. Pozostałe 31 stron rośnie przez strzałki, najwięcej publikacje 2019 (+157 px).
- **Typografia linków w treści** (krój, stopień, grubość, podkreślenie; 745 stron, 1440 px): jedyna różnica to nazwa działu w panelu na okładce, która jest teraz elementem flex (zamierzone).
- **Rząd liczb:** różnice szerokości na 30 podstronach pochodzą z losowanych ciekawostek, nie ze zmian w kodzie.

## Zalecenia

**25. Paleta.** Wartości ze zlecenia w jednym bloku `:root` w `zalozyciele.css`. Ciemny motyw liczy kolor działu z jasnego, więc zmienia się sam.

| Kontrast | Jasny motyw | Ciemny motyw |
|---|---|---|
| atrament / kolor działu na tle strony | 5,7–6,5 : 1 | 8,0–8,7 : 1 |
| na powierzchni (`--surface`) | 5,2–6,0 : 1 | 7,0–7,6 : 1 |
| na tle działu | 5,3–5,9 : 1 | 5,8–6,3 : 1 |
| na panelu menu | — | 6,6–7,2 : 1 |
| biały na głębokim | 10,8–11,8 : 1 | — |
| jasny na granacie | 7,9–8,8 : 1 | — |

Stary akcent `#f2a33a` zostaje (`global.css`, `tlo.css`, `telefon.css`, `baner.css`, kolory dni w kalendarzu): obrys fokusu, favicon, stary wygląd. Nigdzie nie udaje koloru Instytutu. Wartości Atramentów poza tym blokiem nie było.
Zrzuty: `raport-zrzuty/z14-25-paleta-przed-po-1440.jpg`, `z14-25-paleta-ciemny-i-telefon.jpg`.

**26. Linia patrona.** EN: „1887–1972 · section patron · room HS”. Sprawdzone 4 działy × PL/EN przy 1366, 1440, 1920, 390 i 360 px: zawsze jedna linia. EN ma ok. 220 px z 270 na komputerze i 210 z 328 na telefonie, więc zawijanie na telefonie nie było potrzebne. Polska wersja bez zmian.
Zrzut: `z14-26-patron-en-przed-po.png`.

**23. Strzałki.**
- `isExternal()` porównuje domenę z `site` (w `astro.config.mjs`) i ścieżkę z bazą, dawne działanie zostało jako `isAbsolute()`.
- Komponent `Link.astro` dodaje klasę `zew` i ukryty dopisek „(inna strona)” / „(external site)”. Wtyczka `rehype-zewn.mjs` robi to samo w treściach z CMS.
- Strzałka jest tylko z CSS, sklejona z ostatnim słowem twardą spacją. Ręczne ↗, ikona SVG i `TytulZewn.astro` zniknęły.
- Nakładki klikalnych wierszy przeszły na `::before`, bo zasłaniały `::after` ze strzałką.

| Kontrola całego `dist/` (PL i EN) | Wynik |
|---|---|
| linki wewnętrzne z `zew` | **0** |
| linki z `zew` bez ukrytego dopisku | **0** |
| ręcznie wpisane ↗ | **0** |
| `target="_blank"` | **0** |
| linki do innej domeny bez `zew` | 748 (wyjątki 1 i 2 niżej) |
| linki `zew` bez ↗ w obliczonych stylach (745 stron, 12 555 linków) | 214 (wyjątek 3 niżej) |

Świadome wyjątki:
1. Logo UWr w pasku (746 stron): bez strzałki i dopisku, nazwę podaje `aria-label`.
2. Znak Wydziału na okładce (PL i EN): bez widocznej strzałki, z ukrytym dopiskiem.
3. Nazwiska w tabeli pracowników (214 linków): klasa i dopisek są, a widoczna strzałka stoi w kolumnie WWW.

Skutek do obejrzenia: w Planie zajęć ↗ ma teraz każdy przedmiot, bo każdy prowadzi do USOS (pytanie 4).
Zrzuty: `z14-23-strzalki-1440-a.jpg`, `-b.jpg`, `z14-23-telefon-390.jpg`, `z14-23-ciemny-1920.jpg`.

**24. Hamburger.** Grupy z `nawigacja.json` z małym nagłówkiem, przycisk ze strzałką, otwarty jeden dział naraz, domyślnie zwinięte.
- **Bez JS:** grupy widoczne, przyciski schowane.
- **Klawiatura:** Tab, Enter, Spacja, Esc działają; Esc wraca fokusem na hamburger.
- **Przy okazji:** USOSweb poza Studiami (wspólny `jestUsos` z pasem działu), SIAD jako skrót z pełną nazwą w podpowiedzi, Szkoła doktorska w Nauce i w Studiach.
- **1920×950:** zwinięty panel i rozwinięte Studia mieszczą się bez przewijania.
- **Telefon, 390 px:** zwinięty mieści się, a rozwinięte Studia przewijają panel (1155 z 783 px), strona stoi.

**Odstępstwo od zlecenia:** na telefonie (≤ 760 px) panelu `.z-menu` nie ma. Działa menu z nagłówka (`Naglowek.astro`), które było już zwijane, więc nie jest to „ten sam panel” i nie ma w nim filtra USOSweb ani skrótu SIAD (pytanie 2). Otwarte pytanie ze zlecenia (panel rozwinięty na bieżącym dziale) zostawiłem bez zmian.
Zrzuty: `z14-24-panel-przed-po-1920.jpg`, `z14-24-panel-telefon-390.jpg`.

**27. Stopka i „O stronie”.** Stopka: Deklaracja dostępności · Polityka prywatności · O stronie · ©. Klucz `archiwum` w `i18n` zostaje, bo używają go strona 404 i lista obron.
- **Łatka treści:** `dok/latki/zlecenie-14/Web-Ustawienia.patch` dodaje `src/content/strony/o-stronie.md` (PL i EN, pięć sekcji) i formularz w `.pages.yml`. `git apply --check` przechodzi na obecnym `.pages.yml` z GitHuba. Pola opisane w `.przekazanie/pola-do-cms.md`.
- **Podgląd:** plik był w nakładce tylko na czas zrzutów, potem go usunąłem (notatka w `.przekazanie/robocze/nakladka-przed-14/`).
- **Kolory patronów neutralne:** treść w Pages CMS to rich-text (Markdown), surowy HTML by zniknął.
- **Zdanie o ciasteczkach sprawdzone:** strona nie ma ciasteczek ani analityki, a mapa Google wczytuje się dopiero po kliknięciu.
- **Adres archiwum** jest wpisany w Markdown, ten sam co `ustawienia.archiwum`. Po jego zmianie w ustawieniach trzeba go poprawić także tu.

Zrzuty: `z14-27-stopka-przed-po.jpg`, `z14-27-o-stronie-en.jpg`, `z14-27-o-stronie-telefon.jpg`.

**28. Zerowanie wizyty.** Okładka czyści `im-wizyta-dzialy` przy pokazaniu strony. W prerenderze dopiero po `prerenderingchange`, także przy `pageshow` z `persisted`. Zestaw ciekawostek zostaje.

| Krok (Edge, bfcache włączone) | Baner | `im-wizyta-dzialy` |
|---|---|---|
| okładka → Nauka | rysuje | `["nauka"]` |
| podstrona → „← Nauka” | gotowy, bez rysowania | `["nauka"]` |
| strona główna | — | wyczyszczone |
| → Nauka | rysuje | `["nauka"]` |
| → Studia | rysuje | `["nauka","studia"]` |
| wstecz, wstecz → okładka (z pamięci przeglądarki) | — | wyczyszczone |
| → Studia | rysuje | `["studia"]` |
| EN: `/en/` → Nauka | rysuje | `["nauka"]` |
| ograniczony ruch: okładka → Nauka | od razu gotowy | — |

- **Zestaw ciekawostek:** przez całą sekwencję `im-ciek-zestaw` się nie zmienia.
- **Prerender:** najechanie na link strony głównej na podstronie, 3,5 s, potem „← Nauka” bez kliknięcia: wizyta zostaje, baner gotowy. Najechanie i kliknięcie: okładka z wyprzedzenia (`activationStart` 3307 ms), wizyta wyczyszczona dopiero teraz. Samo złożenie okładki w tle sprawdzałem pośrednio: tą aktywacją, bez podglądania żądań przy pierwszym najechaniu.
- **Miganie:** klatki przejścia okładka → dział pokazują start od pustego szkicu, bez gotowego szkicu w pierwszej klatce; klasy banera idą `z-czeka → z-rysuj`. Zrzut: `z14-28-klatki-okladka-dzial.jpg`. Dół strony pojawia się chwilę po banerze, jak przed zmianą.

## Pytania

1. **Zalecenie 22:** czy wykonać? Polecenie z czatu („nie wykonuj zaleceń 21 i 22”) i dopisek w zleceniu („dalej od 22”) mówią co innego. Jeśli tak, zrobię je osobnym commitem; po zleceniach 15 i 16 trzeba będzie wybrać gałąź.
2. **Menu na telefonie:** czy dodać tam filtr USOSweb i skrót SIAD jak w panelu? W tym menu USOSweb nadal jest w działach poza Studiami, jeśli jest w `nawigacja.json`.
3. **Panel na stronie działu:** czy ma się otwierać z rozwiniętym bieżącym działem? To Twoje otwarte pytanie ze zlecenia.
4. **Plan zajęć:** czy ↗ przy każdym przedmiocie zostaje? Strona jest przez to dłuższa o 193 px. Zasada „jedna na całej stronie” mówi, że tak, ale wygląda to gęsto.
5. **Adres redakcji** na „O stronie”: jaki wpisać?
6. **`@types/node`:** czy dodać do `devDependencies`? Usunie wszystkie 6 błędów `astro check`. Zlecenie każe nie dodawać zależności bez potrzeby, więc nie dodałem.
