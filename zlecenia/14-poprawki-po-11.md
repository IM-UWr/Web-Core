# Zlecenie 14: poprawki po zleceniu 11 (GOTOWE, 5.11.2026, 12:25)

Stan: **GOTOWE do wykonania — po zleceniu 13.**
Decyzje właściciela z 5.11 przed południem (godziny przy zaleceniach). Wzór wyglądu: prototyp `proto/zalozyciele.src.html` na gałęzi `kopia/2026-11-01-estetyka-prototypy` (artefakt https://claude.ai/artifact/UuuZUa4ByC4AEYWEkrhibv, wersja 90 lub nowsza), czytaj przez `git show origin/kopia/2026-11-01-estetyka-prototypy:proto/zalozyciele.src.html`.

**Gdzie i jak pracować**
- Baza: gałąź `wyglad/zlecenie-13` po zakończeniu zlecenia 13 (z jego ostatnim commitem). Nowa gałąź: `git switch -c wyglad/zlecenie-14` w głównym folderze `C:\Users\Szymek\source\Web-Core`.
- Commit po każdym zaleceniu. **Bez pushowania**, dopóki właściciel nie napisze „push”. **Nie uruchamiaj `skrypty/pobierz_tresci.py`.** Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-14.md`.
- Treści (nakładka: `src/data`, `src/content`, `public/pliki`) są poza gitem. Gdy zalecenie wymaga zmiany treści, **nie zmieniaj nakładki na stałe**: przygotuj łatkę dla repozytorium treści w `dok/latki/zlecenie-14/<Repozytorium>.patch` (jak `dok/en/latki/`) i opisz ją w raporcie. Do sprawdzenia lokalnie możesz zmienić plik nakładki, ale najpierw skopiuj oryginał do `.przekazanie\robocze\nakladka-przed-14\` (ta sama ścieżka), a po sprawdzeniu przywróć oryginał.
- Po każdym zaleceniu: `npm run build`, zrzuty 1440 i 1920 px oraz telefon 390 px, jasny i ciemny motyw.

**Zakres i kolejność:** 25 → 26 → 23 → 24 → 22. Zalecenie **21 CZEKA** (nie wykonywać).

## Zalecenia

### 21. Wpisy na listach — CZEKA
Treść zalecenia dopisze właściciel. Nie wykonywać.

### 22. Pierwsza aktualność zawsze powiększona (decyzja 5.11, 12:36: „chodzi żeby pierwsza była powiększona, dwa wiersze, duże zdjęcie, ale nie wtedy gdy jest wyróżniona, tylko zawsze pierwsza i najnowsza”)
- Zastępuje „wyróżnioną aktualność” (11:51, odłożona o 12:00). **Bez znacznika i bez nowego pola w CMS.** Pole `wyroznij_do` i dotychczasowa plakietka na okładce zostają bez zmian.
- **Wzór:** prototyp v92: okładka → Szybki dostęp (kolumna „Aktualności”) i widok „Aktualności”; przełącznik „Pierwsza aktualność” (Powiększona / Zwykła). Kod: `wierszWyr()`, `rysujAktualnosci()`, CSS `.ok-w.wyr` i `.wa.wyr`.
- **Szybki dostęp, kolumna „Aktualności”:** pierwszy wpis kolumny (najnowszy) zajmuje miejsce dwóch wierszy:
  - kolumny 50 px | tekst | zdjęcie 168×126 (`object-fit: cover`), odstępy 9 px nad i 10 px pod;
  - data w kolorze tekstu (nie przygaszona jak w pozostałych wierszach), etykieta „Dział · rodzaj” jak dziś;
  - tytuł Brygadą 21 px / 1,25 (zamiast pogrubionego tekstu), pod nim zajawka 13 px / 1,45, najwyżej 2 linie (`line-clamp`);
  - w krótkiej kolumnie (pozycje 1 i 2 siatki) widać powiększony wpis i jeszcze jeden zwykły; „Zobacz więcej (N)” liczy powiększony za dwa; w długiej kolumnie dopasowanie liczby wierszy działa jak dziś;
  - wpis bez zdjęcia: w polu 168×126 zastępczy sygnet patrona działu, jak przy miniaturach bez zdjęcia.
  - Jeśli dzisiejsze reguły (`aktualnosciNaGlowna`: wpisy pilne i wyróżnione na górze) postawią na pierwszym miejscu inny wpis niż najnowszy, powiększony jest i tak pierwszy wpis kolumny. Opisz w raporcie, czy taki wpis jest dziś w danych.
- **Strona Aktualności** (`ListaAktualnosci`, `WierszAktualnosci.astro`): pierwszy widoczny wpis listy powiększony: kolumny 76 px | tekst | 360 px (zdjęcie 3:2), data 44 px, tytuł 30 px / 1,2, tekst 16,5 px, odstępy 22 / 24 px. Po filtrze rodzaju albo szukaniu powiększa się pierwszy widoczny wpis (skrypt listy przestawia klasę). Bez zdjęcia: bez pola zdjęcia, powiększone tylko data i tytuł.
- **Telefon:** pierwszy wpis z większym zdjęciem (na całą szerokość kolumny tekstu, 3:2, nad etykietą) i tytułem o krok większym; zrzuty w raporcie do oceny.
- Ciemny motyw i wersja angielska jak reszta listy.

### 25. Kolory działów: paleta „Lazur i malina” zamiast „Atramentów” (decyzja 5.11, 10:32)
- Instytut bursztyn, Nauka szmaragd, Studia lazur, Popularyzacja malina. W OKLCH każda rola (jasny, głęboki, atrament, tło) ma tę samą jasność i nasycenie we wszystkich działach, różni się tylko odcień.
- Zmiana wartości w jednym miejscu: `src/styles/zalozyciele.css`, blok `:root` (zmienne `--<dział>-j/-g/-a/-t` i `--<dział>-jm`):

  | dział | `-j` jasny | `-g` głęboki | `-a` atrament | `-t` tło | `-jm` mocny (szkic na banerze, zalecenie 16) |
  |---|---|---|---|---|---|
  | instytut | `#e4a550` | `#523300` | `#845502` | `#faefe1` | `#faa401` |
  | nauka | `#61cb97` | `#00472c` | `#03734a` | `#e5f6ec` | `#03da91` |
  | studia | `#50c0f4` | `#004059` | `#00698f` | `#e3f4fd` | `#4cc7ff` |
  | popularyzacja | `#ef90bb` | `#59273f` | `#953c68` | `#feebf2` | `#ff8fc3` |

  Źródło: `PALETY.lazur` w prototypie; kolory mocne podane już w zaleceniu 16 zlecenia 11 i w komentarzu w `zalozyciele.css`. Komentarz nad blokiem zmień na „paleta »Lazur i malina«”.
- Kontrast (policzone 5.11): atrament na tle strony `#fcfaf6` 5,7–6,5 : 1, atrament na tle działu 5,3–5,9 : 1, biały na głębokim 10,8–11,8 : 1, jasny na granacie 7,9–8,8 : 1. Sprawdź jeszcze ciemny motyw na prawdziwych tłach (`--bg`, `--surface`, panel menu).
- Poszukaj wartości Atramentów wpisanych na sztywno poza tym blokiem (`#f2a33a`, `#4cc3b2`, `#f07d5e`, `#a991f7` i odcienie głęboki/atrament/tło). 5.11 w kodzie działów były tylko w `zalozyciele.css`. Stary akcent `--accent`/`--primary: #f2a33a` (`global.css`, `tlo.css`, `telefon.css`) nie jest kolorem działu: zostaw, chyba że gdzieś udaje kolor Instytutu (wtedy opisz w raporcie).
- Sprawdź zrzutami: okładka (szkice po najechaniu), cztery strony działów (baner, menu działu, „W skrócie”), po jednej podstronie z każdego działu, panel hamburgera, Aktualności i Kalendarz (wpisy w kolorach działów), oba motywy.

### 26. Wersja angielska: linia pod nazwiskiem patrona nie może się łamać (uwaga 5.11, 11:03)
- Dziś na banerze działu w EN: „1887–1972 · patron of the section · lecture room HS” łamie się w dwie linie.
- `src/components/zal/NaglowekZ.astro`: `patronDzialu` w EN → `section patron`, `salaNapis` w EN → `room` (wynik: „1887–1972 · section patron · room HS”). Polska wersja bez zmian.
- `white-space: nowrap` na tej linii (`.z-patron span` w `zalozyciele.css`). Blok `.z-patron` jest wyrównany do prawej i ma 270 px; dłuższa linia może wyjść w lewo (jak tytuł ciekawostki), nie w prawo.
- Telefon (`zal-telefon.css`, `.z-patron span`): sprawdź 390 px w obu językach. Jeśli się nie mieści, na telefonie zostaw zawijanie (opisz w raporcie).

### 23. Linki poza stronę zawsze ze strzałką ↗ — jedna zasada na całej stronie (decyzja 5.11, 11:47)
- **Dziś:** ↗ dostaje tylko link z klasą `.zew` (reguły w `zal-tresc.css`, `zal-dzialy.css`, `zalozyciele-strony.css`), w wielu widokach ↗ jest wpisane ręcznie (m.in. `Zaklad`, `Specjalnosc`, `Seminarium`, `Obrona`, `Kierunek`, `Grant`, `Aktualnosc`, `WartoWiedziec`, `WartoWiedziecWpis`, `ListaKonferencji`, `zal/dzial/Wiersz`, `zal/dzial/Sekcja`, `zal/TrescDzialu`, `zal/DrugiEkran`, `zal/PanelMenu` z klasą `z-zew`), starsze komponenty mają ikonę SVG `zewnetrzny` (`Naglowek.astro`, `TytulZewn.astro`, `WierszWydarzenia.astro`). Link wpisany w treść w Pages CMS strzałki nie dostaje. Pełna lista: `git grep -n "↗\|zewnetrzny" -- src`.
- **Co jest zewnętrzne:** adres `http(s)://` z inną domeną niż strona. Porównuj z `site` z `astro.config.mjs` (po przejściu na domenę UWr nic nie trzeba zmieniać). Dziś `isExternal()` w `src/lib/url.ts` uznaje za zewnętrzny każdy adres bezwzględny: dodaj porównanie domeny (bezwzględny adres do własnej strony nie jest zewnętrzny). Inne strony UWr (rekrutacja, USOS, wydział, BIP) **są** zewnętrzne. Bez strzałki: `mailto:`, `tel:`, kotwice, linki wewnętrzne i pliki z naszej strony (PDF, ICS).
- **Jeden znak:** tekstowe ↗ dopisywane przez CSS (`a.zew::after`), nie wpisywane ręcznie. W tekście ciągłym `.8em`; znak sklejony z ostatnim słowem, żeby nie spadał sam do nowej linii (jak dziś `TytulZewn`: ostatnie słowo i znak w jednym `nowrap`). Ikona SVG `zewnetrzny` znika. Miejsca z własnym ustawieniem strzałki (lista linków, menu działu, „Zobacz też”, przycisk „Rekrutacja”, nagłówek „Studiuj matematykę we Wrocławiu”, panel hamburgera) zostają, ale korzystają z tej samej klasy.
- **Treści z CMS (Markdown):** wtyczka rehype przy budowie (rozszerzenie `src/plugins/rehype-base.mjs` albo osobna `rehype-zewn.mjs`), podpięta w `astro.config.mjs` i w obu procesorach w `src/lib/markdown.ts`. Dodaje linkom zewnętrznym klasę `zew` i ukryty dopisek dla czytników ekranu: „(inna strona)”, w EN „(external site)”.
- **Komponenty:** jeden pomocnik (np. `isExternal()` z porównaniem domeny plus funkcja albo mały komponent dający `class="zew"` i ukryty dopisek). Ręcznie wpisane ↗ usuń.
- **Ta sama karta:** linki zewnętrzne otwierają się w tej samej karcie (bez `target="_blank"`). Jeśli gdzieś nowa karta musi zostać, to z `rel="noopener"` i z opisem w raporcie.
- **Sprawdzenie:** po `npm run build` przejdź skryptem cały `dist/` (PL i EN): policz linki do innej domeny bez klasy `zew` i linki wewnętrzne z `zew`. Oba mają wyjść 0, poza świadomymi wyjątkami spisanymi w raporcie.

### 24. Hamburger: zwijane działy (decyzja 5.11, 12:05: „Hamburger na zwijanych działach. Wygląda bardzo dobrze”)
- **Wzór:** prototyp v90, przełącznik „Hamburger” → „Zwijane działy” (okładka i strona działu). Kod: `htmlPanelu()`, `rysujPanel()`, klasy `.mg`, `.mg-rozwin`, `[data-nagl="zwijane"]`.
- **Dziś:** `src/components/zal/PanelMenu.astro` spłaszcza grupy menu w jedną listę na dział (`flatMap`). Skrypt: `src/scripts/zal/menu.ts`, style: `zalozyciele.css` i `zal-telefon.css` (`.z-menu`).
- **Bez zmian:** pole „Szukaj na stronie”, cztery działy z sygnetem patrona, nazwą działu (link do strony działu) i kreską w kolorze działu, na dole duże „Aktualności” i „Rekrutacja ↗”.
- **Nowe:**
  - Przy nazwie działu, z prawej, przycisk ze strzałką w dół: `button`, `aria-expanded`, `aria-controls` (id listy grup), etykieta „Pokaż podstrony: <dział>” / EN „Show pages: <section>”, ok. 30×30 px, przy najechaniu lekkie tło.
  - Przycisk rozwija grupy tego działu. **Otwarty jest jeden dział naraz:** otwarcie innego zwija poprzedni. Strzałka obraca się o 180° (0,2 s, bez obrotu przy `prefers-reduced-motion`). Domyślnie wszystkie zwinięte.
  - Po rozwinięciu **grupy jak w menu działu** (z `nawigacja.json`, nie spłaszczone): mały nagłówek grupy (12 px, 600; na granacie `rgb(255 255 255 / .5)`, w jasnym panelu `--muted`), pod nim linki w wierszu z zawijaniem jak dziś. Linki poza stronę ze strzałką według zalecenia 23.
  - Bez JavaScriptu grupy są widoczne (zwijanie włącza skrypt: np. klasa na panelu ustawiana przy starcie), żeby menu zawsze działało.
  - Ten sam panel na komputerze i telefonie, panel jasny i ciemny (kolor paska) jak dziś.
- **Przy okazji:**
  - USOSweb poza Studiami w panelu, tym samym filtrem co w pasie działu (`bezUsos` w `TrescDzialu.astro`, zalecenie 13).
  - SIAD w panelu i w pasie działu jako skrót „SIAD” z pełną nazwą w podpowiedzi (decyzja 2.11, 01:47; ten sam sposób co `skrotNazwy` w `DrugiEkran.astro`).
  - Szkoła doktorska zostaje i w Nauce, i w Studiach (jak w menu działów).
- **Otwarte pytanie właściciela** (nie robić, dopóki nie zostanie dopisane): czy na stronie działu i jego podstronach panel ma się otwierać z rozwiniętym bieżącym działem.
- **Sprawdzenie:** klawiatura (Tab, Enter/Spacja na przycisku, Esc zamyka panel jak dziś), czytnik ekranu (stan rozwinięcia), wysokość panelu na 1920×950 i telefonie: zwinięty mieści się bez przewijania, a najdłuższy rozwinięty dział (Studia) z przewijaniem panelu, nie strony.

## Na koniec
`RAPORT-ZLECENIE-14.md`: co zrobione, czego nie i dlaczego, łatki treści (jeśli są), wyjątki z zalecenia 23, zrzuty przed/po, `astro check` bez nowych błędów.
