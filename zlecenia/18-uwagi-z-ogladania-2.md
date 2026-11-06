# Zlecenie 18: uwagi z oglądania, część 2 (OTWARTE, 6.11.2026)

Stan: **otwarte** — właściciel dopisuje kolejne punkty. Wykonuj tylko punkty oznaczone **GOTOWE** i dopiero po zakończeniu zlecenia 17.

**Gdzie i jak** (tak samo jak w zleceniu 17)
- Gałąź `wyglad/zlecenie-16`, po commitach zlecenia 17. Osobny commit na każdy punkt. **Bez pushowania**, także w repozytoriach treści.
- **Nie uruchamiaj `skrypty/pobierz_tresci.py`.**
- Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-18.md`.

## 1. Nazwa „Instytut Matematyczny” w górnym pasku: bez podkreślenia, przygaszenie na szaro — GOTOWE (decyzja 6.11, 00:33)
- Dziś najechanie na markę w górnym pasku podkreśla „Instytut Matematyczny” (`src/styles/zalozyciele.css`, `.z-marka:hover b { text-decoration: underline … }`). Usuń podkreślenie.
- Zamiast niego nazwa zmienia kolor na szary `var(--na-ciemnym-2)` (#c9d0de, ten sam co podpis „Wydział Matematyki i Informatyki”), z przejściem `color var(--t-krotki) var(--rytm)`, bez przejścia przy `prefers-reduced-motion`. Podpis bez zmian.
- Pasek jest granatowy w obu motywach, więc wartość ta sama w jasnym i ciemnym. Sprawdź też baner strony głównej, jeśli marka stoi tam na innym tle.
- Fokus z klawiatury bez zmian (obrys zostaje).
- Sprawdź komputer i telefon, PL i EN.

## 2. Aktualności: chudszy baner bez liczb — GOTOWE (decyzja 6.11, 00:39)
- Na stronie `/aktualnosci` i `/en/aktualnosci` usuń z banera liczby („nowe ogłoszenia”, „nadchodzące wydarzenia”, „zapowiedziane referaty”). W `src/views/ListaAktualnosci.astro` jest to `<Fragment slot="baner"><LiczbyBanera … /></Fragment>`. Właściciel: „to nie tutaj”, „odchudzamy banner”.
- Baner ma wtedy zwykłą wysokość nagłówka podstrony bez liczb (`.z-nagl-pod` bez `.z-liczbami`: `min-height: calc(190px + var(--gora))` zamiast 268 px). Zostają „← Strona główna”, tytuł i hasło „Co słychać w Instytucie”. Sprawdź, czy klasa liczb znika sama, gdy slot jest pusty.
- Jeśli `liczby` z `daneListyAktualnosci` nie są już nigdzie używane, usuń ich liczenie z `src/lib/widoki/listaAktualnosci.ts`. Funkcje w `liczbyTerminow` zostają, jeśli używają ich inne strony. Komponentu `LiczbyBanera` nie ruszaj, bo używa go 9 innych widoków.
- Inne strony z liczbami w banerze (Kalendarz, Konferencje, Obrony, Seminaria, Sukcesy, Pracownicy, Publikacje) bez zmian.
- Popraw komentarz na górze `ListaAktualnosci.astro`.
- Sprawdź komputer i telefon, PL i EN. Zrzut przed i po → `raport-zrzuty/z18-aktualnosci-baner-*`.

## 3. Lista Aktualności: filtry z boku, wyróżniony wpis mniejszy, reszta w dwóch kolumnach — GOTOWE (decyzja 6.11, 00:41–00:53)
Podgląd: https://claude.ai/artifact/G8E6FJUPczYPiABsEdpyM5. Ustawienia: filtry w prawej kolumnie, wyróżniony **B · na papierze** (decyzja 01:01), pozostałe w dwóch kolumnach, „… czytaj dalej”, kolor jednolity, nagłówki miesięcy zostają. Dotyczy `/aktualnosci` i `/en/aktualnosci` na komputerze (≥ 761 px). Telefon bez zmian. Pliki: `ListaAktualnosci.astro`, `WierszAktualnosci.astro`.

**Filtry w prawej kolumnie** (dziś przyklejony pasek `.ak-narz` nad listą zabiera miejsce w pionie)
- Układ jak na podstronach ze spisem: lista w kolumnie treści (948 px), filtry w prawej kolumnie (236 px), w miejscu spisu „Na tej stronie”.
- Panel: etykieta „Pokaż” (EN „Show”, 13 px, 700, `--muted`), pod nią pionowa lista rodzajów z `RODZAJE_FILTRY` z cienką linią z lewej. Wybrany rodzaj pogrubiony, w kolorze tytułów, z kreską 2 px z lewej, jak aktywna pozycja spisu. Pod listą pole szukania (`border-radius: 5px`). Napis zawężenia `?dla=…` i przycisk „Pokaż wszystkie” też w panelu.
- Panel przyklejony: `position: sticky; top: calc(var(--gora) + 16px)`. Przewija się, dopóki nie dojdzie pod pasek nawigacji, potem zostaje na miejscu do końca listy.
- Działanie filtrów i szukania bez zmian, tylko w nowym miejscu. Pasek `.ak-narz` na komputerze znika. Na telefonie zostaje jak dziś (lista wyboru i pole szukania nad listą).

**Wyróżniony wpis** (pierwszy widoczny, `.wa.wyr`; dziś 44 / 30 px i zdjęcie 360 px, ok. 290 px wysokości) — wariant **B · na papierze** (ok. 165 px)
- Boks na całą szerokość kolumny listy: tło `var(--surface)`, `border-radius: 5px`, `padding: 16px 20px`, `margin: 12px 0 4px`, bez kreski pod spodem (jak boksy zakładów).
- W boksie: data 38 px, tytuł 24 px / 1,22 (margines 3 px 0 5 px), zajawka 15,5 px najwyżej w 2 liniach, zdjęcie 200 px szerokości (3:2, `border-radius: 3px`).
- Bez zdjęcia: większe tylko data i tytuł.
- Popraw `sizes` zdjęcia wyróżnionego (200 px zamiast 360).
- „… czytaj dalej” w wyróżnionym wpisie na tle boksu (`--surface`), a nie strony.

**Pozostałe wpisy w dwóch kolumnach**
- Lista w siatce `repeat(2, minmax(0, 1fr))`, `column-gap: 40px`. Nagłówki miesięcy i wyróżniony wpis na obie kolumny (`grid-column: 1 / -1`). Wpisy w rzędzie mają równą wysokość, więc kreski pod nimi się wyrównują.
- Wiersz: kolumny `58px minmax(0, 1fr) auto`, `gap: 12px`, `padding: 14px 0`; data 26 px (pod nią „mie rrrr” 12 px bez łamania); tytuł 18,5 px / 1,28 **zawsze w całości**; „Kiedy:” 13 px; zajawka 14,5 px / 1,5 **najwyżej 2 linie**; miniatura 72 px szerokości (3:2).
- Po filtrze lub szukaniu siatka układa się na nowo (ukryte wpisy nie zostawiają dziur), a klasa wyróżnienia przechodzi na pierwszy widoczny wpis, jak dziś.

**„… czytaj dalej” w uciętej zajawce** (wyróżniony i pozostałe)
- Gdy zajawka się nie mieści (`scrollHeight > clientHeight`), na końcu ostatniej widocznej linii pojawia się „… czytaj dalej” (EN „… read more”). Pogrubione, w kolorze `--d-a`, na tle wiersza z krótkim przejściem gradientu z lewej (`position: absolute; right: 0; bottom: 0`), `aria-hidden="true"`, bo klikalny jest cały wiersz.
- Gdy tekst się mieści, dopisku nie ma.
- Sprawdzaj po narysowaniu, po załadowaniu fontów (`document.fonts.ready`), po zmianie rozmiaru okna i po filtrze lub szukaniu.
- Najechanie na wiersz podkreśla dopisek.

**Bez zmian:** kolory dat i etykiet (jednolite), nagłówki miesięcy, kolumna Aktualności na Szybkim dostępie, telefon.
**Panel testowy (zlecenie 17, punkt 2):** grupa „Aktualności” nie dotyczy już strony Aktualności. Zostaw ją tylko dla Szybkiego dostępu albo usuń. Napisz w raporcie, co wybrałeś.

## 4. Pojedyncza aktualność: karta boczna ze zdjęciem i szczegółami wydarzenia — GOTOWE (decyzja 6.11, 00:53)
Podgląd: https://claude.ai/artifact/N7nsUs5XQAZZ6sMnqFxBGP, wariant **B · karta boczna**. Dziś zdjęcie ma 800 px szerokości (ok. 530 px wysokości), a prawa kolumna strony stoi pusta. Małe zdjęcia są przy tym rozciągane (np. prof. Franz: oryginał 400 px). Plik: `src/views/Aktualnosc.astro`, strony `/aktualnosci/<wpis>` i `/en/aktualnosci/<wpis>`.

**Komputer (≥ 761 px)**
- Dwie kolumny: treść `minmax(0, 1fr)` i karta 360 px, odstęp 56 px, razem szerokość kolumny strony (1240 px).
- **Karta:**
  - tło `var(--surface)`, `border-radius: 5px`, `padding: 16px 16px 18px`, odstęp między elementami 14 px;
  - przyklejona: `position: sticky; top: calc(var(--gora) + 16px)`;
  - w karcie kolejno:
    - zdjęcie na szerokość karty (proporcje oryginału, `border-radius: 3px`, **nie większe niż naturalna szerokość pliku**) z podpisem (13,5 px, `--muted`);
    - blok wydarzenia (jeśli wpis to wydarzenie), oddzielony od zdjęcia cienką linią: data Brygadą 30 px (pod nią „mie rrrr”), obok jedna pod drugą pary „Kiedy” i „Gdzie” (15 px), pod nimi stan „Odbyło się / Trwa” jak dziś.
- **Lewa kolumna:** etykieta (rodzaj · opublikowano · dla), zajawka (`p.wst`), tekst, album, Galeria, Załączniki, Najbliższe wydarzenia, „Nowszy / Starszy wpis”. Blok wydarzenia i zdjęcie znikają z lewej kolumny.
- **Wpis bez zdjęcia:** karta tylko z blokiem wydarzenia. **Wpis bez zdjęcia i bez wydarzenia:** bez karty, tekst w lewej kolumnie, prawa pusta (jak dziś).
- **Węższe okno** (gdy lewa kolumna miałaby mniej niż ok. 560 px): karta nad tekstem na całą szerokość, zdjęcie z lewej (ok. 240 px), szczegóły wydarzenia z prawej, bez przyklejania. Podaj w raporcie, od jakiej szerokości okna.
- `sizes` zdjęcia: ok. 328 px (karta minus padding), `srcset` jak dziś.
- Obraz dla udostępniania (`obraz={d.zdjecie}` w `Podstrona`) bez zmian.

**Telefon (≤ 760 px):** bez zmian (jedna kolumna: etykieta, zajawka, blok wydarzenia, zdjęcie, tekst).

**Odbiór:** zrzuty wpisów „Wykład prof. Uwe Franza”, „2. Kongres Młodych Odkrywców”, jednego wpisu bez zdjęcia i jednego bez wydarzenia, przy 1536 i 2048 px oraz 390 px, w obu motywach → `raport-zrzuty/z18-wpis-*`.

## 5. USOSweb poza menu — GOTOWE (decyzja 6.11, 00:53)
Właściciel: „USOSweb wszędzie wywalić. Na telefonie też skrót.”

**USOSweb**
- Usuń link USOSweb z grupy „Na co dzień” Studiów w `src/data/nawigacja.json`.
- Źródło: repozytorium treści z tym plikiem (Web-Ustawienia). Zmiana w klonie `C:\Users\Szymek\source\tresci\Web-Ustawienia`, commit bez pushu. Do podglądu ta sama zmiana w nakładce Web-Core; najpierw kopia oryginału do `.przekazanie\robocze\nakladka-przed-18\`.
- Po usunięciu z danych filtr jest zbędny: usuń `jestUsos` z `src/lib/menu.ts` i jego użycia w `PanelMenu.astro` i `TrescDzialu.astro`, popraw komentarze.
- **Bez zmian:** wzmianki i linki do USOSweb w tekstach stron (m.in. Pierwszy rok, Sprawy studenckie, Zajęcia, kierunki, specjalności, Polityka prywatności) i linki przedmiotów do USOS w Planie zajęć. To instrukcje i dane, a nie menu.

**SIAD na telefonie:** załatwia punkt 6 (jedno menu ze skrótem z `PanelMenu.astro`). Tu tylko USOSweb.

**Odbiór**
- `astro check` bez nowych błędów, `npm run build` przechodzi.
- W `dist`, PL i EN: żadnego linku do `usosweb` w `.z-menu`, `.mnav` i `.z-dz-pas`.
- Linki USOS w tekście Pierwszego roku i w Planie zajęć działają jak dotąd.

## 6. Jedno menu hamburgera na komputerze i telefonie (hybryda) — GOTOWE (decyzja 6.11, 00:57)
Wykonaj po punkcie 5. Właściciel: „w obu przypadkach to samo, ale hybryda”. Wspólny jest `src/components/zal/PanelMenu.astro`; stare menu telefonu (`.mnav` w `Naglowek.astro`) znika.

| Sprawa | Wybór | Co to znaczy |
|---|---|---|
| Kolejność | komputer | Instytut, Nauka, Studia, Popularyzacja, Aktualności, Rekrutacja |
| Strona główna | komputer | bez tej pozycji; na główną prowadzi nazwa Instytutu w nagłówku |
| Szukanie | komputer | pole w panelu; lupa `.search-narrow` znika z nagłówka telefonu |
| Język | komputer | przełącznik z flagą w górnym pasku, poza panelem; na telefonie w `.hdr-tools`, w miejscu lupy; wiersz „English version” znika |
| Kolor | komputer | panel granatowy, jasny przy jasnym pasku (jak dziś `.z-menu-jasny`); na telefonie pasek jest ciemny, więc granatowy |
| Grupy podstron | nagłówki jak na telefonie | na obu nagłówek grupy w kolorze działu; linki na telefonie jeden pod drugim, na komputerze obok siebie (zmiana 01:10) |
| Bieżąca strona | telefon, z poprawką | na obu: `aria-current="page"` i widoczne oznaczenie (niżej) |

**Grupy**
- Nagłówek grupy: 12,5 px, bez wersalików, `letter-spacing: .02em`; na granacie `var(--d-j)`, w jasnym panelu `var(--d-a)`. Działy mają już `data-dzial`.
- Linki, waga 500: na granacie `var(--na-ciemnym-2)`, w jasnym panelu `var(--text)`.
- **Telefon (≤ 760 px):** `ul` w kolumnie, każdy link w osobnym wierszu, `min-height: 40px`.
- **Komputer (≥ 761 px):** linki obok siebie z zawijaniem, jak dziś (`display: flex; flex-wrap: wrap; gap: 2px 16px`, 14,5 px).
- Działy dalej zwijane, otwarty jeden naraz. Bez JS grupy widoczne.

**Szerszy panel na komputerze (decyzja 6.11, 01:10)**
Właściciel: „zależy, żeby Studia zmieściły się bez przewijania”, „można zrobić hamburger menu szersze na PC, mamy miejsce”. Sama szerokość nie wystarcza: przy 1536×730 panel z rozwiniętymi Studiami ma dziś 968 px, a przy szerokości 640 px nadal 843 px. Dlatego także niższe rzędy. Wartości sprawdzone wstrzykniętym CSS na `/studia/plan-zajec`: treść ok. 625 px, bez przewijania przy 1536×730, 1366×640 i 1920×950. Tylko od 761 px, telefon bez tych zmian.
- `.z-menu`: `width: min(640px, calc(100vw - 64px))`, `padding: 20px 36px 14px`.
- `.z-menu-szukaj`: w jednym rzędzie z krzyżykiem, `margin: 0 calc(max(24px, var(--marg, 64px) - 2px) + 16px) 8px 0`, `padding: 8px 12px`. Pole nie może nachodzić na krzyżyk, także na okładce.
- `.z-menu section`: `padding: 7px 0`. `section[data-dzial]`: `grid-template-columns: 40px minmax(0, 1fr)`, `column-gap: 14px`.
- `.z-menu-sygnet`: 40×48 px.
- `.z-menu h2`: `margin: 0 0 3px`, 23 px; kreska działu `margin-top: 4px`.
- `section.duza`: `padding: 10px 0 10px 54px`, `h2` 24 px; pierwsza po działach `margin-top: 4px`.
- `.z-menu-grupa + .z-menu-grupa`: `margin-top: 5px`.

**Bieżąca strona**
- Dziś na telefonie `aria-current` jest w HTML, ale `!important` w `zal-telefon.css` przykrywa kolor, więc wizualnie nic nie widać. Tej reguły nie przenoś.
- Dopasowanie jak `pasuje()` i `tuJestem()` z `Naglowek.astro`, także dla podstron głębszych niż pozycja menu.
- Wygląd: waga 700 i kolor jak nagłówek grupy (`--d-j` na granacie, `--d-a` w jasnym panelu), po `/en` też.

**Rozwinięty bieżący dział (decyzja 6.11, 01:02)**
- Panel otwiera się z rozwiniętym działem, w którym jesteś: na stronie działu i na wszystkich jego podstronach, także głębszych (np. pojedyncze seminarium). Dział wyznacz ze ścieżki strony (`dzialZeSciezki`), a nie z samego `aria-current`, bo strona działu nie ma swojego linku w grupach.
- Poza działami (strona główna, Aktualności, Kalendarz, Szukaj) wszystkie działy są zwinięte.
- Przy każdym otwarciu panel wraca do tego stanu (dziś `otworz()` w `src/scripts/zal/menu.ts` zwija wszystko). Dalej otwarty jest jeden dział naraz: użytkownik może go zwinąć albo rozwinąć inny. Przycisk ma poprawny `aria-expanded`.
- Gdy bieżący link nie mieści się w widocznej części panelu, przewiń sam panel tak, żeby był widoczny, bez animacji i bez przesuwania strony.

**Na telefonie (≤ 760 px)**
- Przycisk `.burger` w `Naglowek.astro` otwiera `PanelMenu`. Dziś `zal-telefon.css` chowa `.z-menu`, a panel siedzi przy schowanym pasku: zapewnij jeden działający egzemplarz na każdej stronie, także głównej.
- Zachowanie otwierania jak dotąd w menu telefonu: wysuwa się z prawej pod nagłówkiem, strona przyciemniona i nieprzewijalna, klik obok i Esc zamykają, ikona hamburgera zmienia się w krzyżyk z poprawnym `aria-label`, fokus wraca na przycisk, bfcache zamyka panel. Własny krzyżyk panelu ukryj, żeby nie było dwóch.
- Przycisk rozwijania działu ma pole co najmniej 44×44 px.
- Pasek telefonu mieści się przy 320 px: logo, nazwa, język, motyw, hamburger.

**Sprzątanie**
- Usuń `.mnav`, `.mnav-tlo`, `.mitem`, `.mrow*`, `.mgroup*`, `menu-ciemne` i ich skrypt z `Naglowek.astro` (bez skryptu motywu i nagłówka). Usuń reguły z `global.css`, `telefon.css`, `uklad-zwarta.css`, `zal-telefon.css` i `zalozyciele.css`, jeśli `grep` nie znajdzie innych użyć. Popraw komentarze, także w `PasekMenu.astro`.

**Odbiór**
- `astro check` bez nowych błędów, `npm run build` przechodzi. W `dist` nie ma `id="menu-telefon"` ani klasy `mnav`.
- Na komputerze i telefonie, PL i EN, strona główna i podstrona: ta sama kolejność, pole szukania działa, SIAD jako skrót, brak USOSweb, bieżący dział rozwinięty od razu po otwarciu panelu, a bieżąca strona widoczna i oznaczona (np. `/studia/plan-zajec`, `/seminaria/geometria`). Na `/aktualnosci` i na głównej wszystko zwinięte.
- Klawiatura (Tab, Enter, Spacja, Esc), bez JS grupy widoczne.
- Komputer: panel bez przewijania z każdym rozwiniętym działem przy 1536×730, 1366×640 i 1920×950, na stronie głównej i podstronie; podaj zmierzone wysokości. Telefon 390×780: przewija się sam panel, strona pod nim stoi.
- Zrzuty panelu z rozwiniętymi Studiami przy 1536 px (ciemny i jasny pasek) i 390 px, obu motywach; pasek telefonu przy 320 px → `raport-zrzuty/z18-menu-*`.

## 7. Aktualności: baner ze zdjęciem jak w działach (granat przechodzi w zdjęcie) — GOTOWE (decyzja 6.11, 01:08)
- Zdjęcie: `.przekazanie\robocze\zdjecia\aktualnosci-skok.jpg` (1756×888, hol WMI, osoba w pomarańczowej bluzie w skoku). Wgraj je do repozytorium treści, w którym jest `public/pliki/naglowki/` (według `NaglowekZ.astro` Web-Ustawienia), jako **nowy plik** `public/pliki/naglowki/aktualnosci-skok.jpg` (bez pushowania) i do nakładki Web-Core. Obecnego `aktualnosci.jpg` nie podmieniaj.
- Gdzie: **lista `/aktualnosci` i pojedyncze wpisy `/aktualnosci/<wpis>`**, PL i EN. Inne strony spoza działów, które dziś biorą zdjęcie `granat` z `FOTO` w `NaglowekZ.astro`, bez zmian. Wypisz je w raporcie.
- Wygląd jak na banerach działów: z lewej, pod tytułem, pełny granat nagłówka podstrony, który przechodzi w zdjęcie po prawej. Zdjęcie widać wyraźnie na ok. 60% szerokości z prawej, przyciemnione tylko tam, gdzie jest tekst. Podgląd: https://claude.ai/artifact/G8E6FJUPczYPiABsEdpyM5, Baner → „bez liczb, ze zdjęciem”. Gradient tam: granat 0%, granat 60% krycia przy 26% szerokości zdjęcia, 12% przy 55%, przezroczysty od 75%.
- **Zdjęcie bez filtrów:** naturalne kolory, bez dwóch kolorów, szarości i rozjaśnienia, bez `--filtr`. Jeśli dwukolorowość banera podstrony robi CSS (np. `mix-blend-mode` lub tło `.z-foto` w kolorze), wyłącz ją dla tego zdjęcia.
- **Kadr na skaczącą osobę:** `object-position: 48% 52%` (osoba jest ok. 48% od lewej, w połowie wysokości). Sprawdź przy 1536, 2048 i 390 px, czy osoba jest cała w widocznej części (ręce i nogi), także na telefonie. W razie potrzeby popraw kadr i podaj go w raporcie.
- Wysokość banera bez zmian (bez liczb, punkt 2 tego zlecenia). Pasek nawigacji nad zdjęciem jak na banerach działów.
- `alt`: „Hol Wydziału Matematyki i Informatyki: student w skoku pod tablicą kierunkową” / EN „The hall of the Faculty of Mathematics and Computer Science: a student jumping under the direction sign”.
- Zdjęcie ma tylko 1756 px szerokości, więc na ekranach o podwójnej gęstości może być lekko miękkie. Jeśli właściciel dostarczy oryginał, podmień plik.
- Zrzuty listy i jednego wpisu przy 1536, 2048 i 390 px, w obu motywach → `raport-zrzuty/z18-aktualnosci-baner-foto-*`.

## 8. Szybki dostęp: kolumna Aktualności zwarta — GOTOWE (decyzja 6.11, 01:08)
Podgląd: https://claude.ai/artifact/UxesPffcoRaY5pEDeCKFn6, wariant **A · zwarta**. Dotyczy kolumny Aktualności na drugim ekranie strony głównej (`DrugiEkran.astro`, `zalozyciele-strony.css`), na komputerze. Telefon bez zmian. Kolumny Wydarzenia i Seminaria bez zmian.
- **Zwykłe wiersze:** kolumny `44px minmax(0, 1fr) auto`, `padding: 6px 0`; cyfra dnia 22 px (zamiast 25); tytuł 14 px (zamiast 14,5); miniatura **56×42** (zamiast 72×54), także zastępczy sygnet.
- **Wyróżniony (pierwszy) wpis:** kolumny `44px minmax(0, 1fr) 78px`, `padding: 8px 0`; miniatura **78×59** (4:3, o 40% większa od zwykłych, zamiast 168×126 / `clamp(112px, 28.8%, 168px)`); tytuł Brygadą **18 px stałe** (zamiast `clamp(18px, 1.094vw, 21px)`); zajawka 13 px **w 1 linii**, a gdy się nie mieści, „… czytaj dalej” jak w punkcie 3 (na tle strony).
- `sizes` miniatur: 56 px i 78 px (× gęstość).
- Kolumna nadal wypełnia wysokość i pokazuje tyle wpisów, ile się zmieści, z „i jeszcze N”. Na laptopie (okno ok. 1536×730) ma się mieścić ok. 7 wpisów zamiast 5. Podaj w raporcie liczbę przy 1536×730 i 1920×940.
- Kolory działów bez zmian. Reguła „najpierw rodzaj” czeka na decyzję i nie jest częścią tego punktu.

## 9. Kolor działu aktualności: najpierw rodzaj wpisu — GOTOWE (decyzja 6.11, 01:11)
Dziś `dzialWpisu` w `src/components/zal/DrugiEkran.astro` daje każdemu wpisowi „dla studentów” dział Studia. Prawie wszystko wychodzi niebieskie (nawet „Otrzymaliśmy kategorię naukową A+” i „Medal Sierpińskiego”), a kolor nic nie mówi. Podgląd: https://claude.ai/artifact/UxesPffcoRaY5pEDeCKFn6, „Kolor działu wpisu” → „najpierw rodzaj wpisu”.
- Nowa reguła, w tej kolejności:
  1. `sukces` (oraz `obrona`) → **Nauka**;
  2. `kariera` → **Studia**;
  3. `wydarzenie`: gdy pierwszym odbiorcą (`dla[0]`) są kandydaci → **Popularyzacja**, inaczej → **Nauka**;
  4. pozostałe (ogłoszenia): `dla` zawiera studentów lub kandydatów → **Studia**; wpisany `zaklad` → **Nauka**; reszta → **Instytut**.
- Dotyczy wszystkich miejsc, które używają `dzialWpisu`: kolumny Aktualności na Szybkim dostępie (etykieta działu, kolor i zastępczy sygnet) oraz wydarzeń z aktualności w kolumnie „Nadchodzące wydarzenia”. Strona Aktualności zostaje w jednolitym kolorze (punkt 3).
- Jeśli ta sama reguła jest jeszcze gdzieś skopiowana (np. telefon, panel menu), zmień ją tam też. Najlepiej przenieś ją do jednej funkcji w `src/lib/` i użyj wszędzie.
- Popraw komentarz przy funkcji i opis reguły w `dok/estetyka.md` (część „CMS: dział przy aktualnościach”).
- W raporcie tabela: ostatnie 15 wpisów → dział przed i po.

## 10. Pasek nawigacji: rozmycie zamiast przyciemnienia, na wszystkich banerach — GOTOWE (decyzja 6.11, 01:17)
Właściciel: „tego blura dodaj na wszystkich navbarach”, „przy zjeżdżaniu, zanim wejdziemy na białe tło, jest przyciemnienie — zamień na blura”. Podgląd stanu „na górze”: https://claude.ai/artifact/G8E6FJUPczYPiABsEdpyM5, Pasek nawigacji → „lekkie rozmycie”. Dotyczy paska na komputerze (`.z-pasek`, `src/styles/zalozyciele.css` ok. linii 102–130, `src/scripts/zal/pasek.ts`), na wszystkich stronach z banerem lub okładką (strona główna, banery działów, nagłówki podstron, Aktualności).
- **Na samej górze nad banerem lub okładką** (dziś w pełni przezroczysty): lekkie rozmycie, `backdrop-filter: blur(8px)`, tło granatu z ok. 30% krycia (`color-mix(in srgb, var(--granat) 30%, transparent)`), dolna linia `rgb(255 255 255 / .16)`. Napisy ze zdjęcia, np. tablica kierunkowa na zdjęciu Aktualności, nie mieszają się wtedy z menu.
- **Po przewinięciu, dopóki pod paskiem jest baner, i nad stopką** (dziś `::before`: `rgb(9 16 34 / .62)` + `blur(22px) saturate(1.3)`, czyli wyraźne przyciemnienie): **zamiast przyciemnienia rozmycie**, `blur(14px) saturate(1.1)` i to samo lekkie tło granatu co na górze (ok. 30%). Cień i dolna linia jak dziś.
- **Czytelność jest warunkiem:** tekst menu (dziś `rgb(255 255 255 / .8)`, 15 px) musi mieć kontrast **co najmniej 4,5:1** z tłem paska w najjaśniejszym miejscu pod paskiem. Sprawdź to na każdym banerze: Instytut, Nauka, Studia, Popularyzacja, podstrona każdego działu, Aktualności (zdjęcie w naturalnych kolorach, jasny sufit u góry), okładka strony głównej, także po przewinięciu, gdy pod paskiem przechodzi biały tytuł banera. Jeśli gdzieś wychodzi mniej:
  1. podnieś krycie tła stopniowo (35% → 40% → 45%), najlepiej tylko dla tego banera, np. przez zmienną na nagłówku;
  2. albo daj menu delikatny cień tekstu (`0 1px 2px rgb(0 0 0 / .35)`).
  
  Wybierz to, co mniej przyciemnia, i podaj w raporcie wartości i zmierzone kontrasty.
- Przejścia jak dziś: warstwy wchodzą przez `opacity`, bez animowania `backdrop-filter`. Przy `prefers-reduced-motion` bez przejść.
- Bez zmian: stan jasny nad treścią (`::after`), pełny granat na stronach bez banera, jasny pasek drugiego ekranu strony głównej (`.z-pasek-jasny`) i pełny granatowy nagłówek na telefonie (pod nim nie ma zdjęcia).
- Popraw komentarze w `zalozyciele.css` i `pasek.ts` (opis stanów).
- Zrzuty paska na górze i po przewinięciu nad banerem: Aktualności, Nauka, Studia, strona główna, przy 1536 px, w obu motywach → `raport-zrzuty/z18-pasek-*`.

## 11. Telefon: pierwsza aktualność bez wyróżnienia — GOTOWE (decyzja 6.11, 01:19)
Właściciel: „na telefonie zostaje jak jest, tylko pierwsze nie jest wyróżniane, traktujemy je normalnie jak pozostałe”, „teraz jest duże, ma nie być duże”.
- Na telefonie (≤ 760 px) pierwszy wpis wygląda jak każdy inny wiersz. Bez zdjęcia na całą szerokość, bez większego tytułu i daty, bez zajawki, jeśli zwykłe wiersze jej nie mają, miniatura jak w zwykłych wierszach.
  - Lista `/aktualnosci` (`WierszAktualnosci.astro`, reguły `.wa.wyr` w `@media (max-width: 760px)`).
  - Kolumna Aktualności drugiego ekranu strony głównej na telefonie (`.z-w.wyr` w regułach telefonu w `zalozyciele-strony.css`, m.in. `.z-druga .z-w.wyr .t { font-size: 19px }`).
- Najprościej: wyróżnienie (`.wyr`) działa tylko od 761 px, a na telefonie reguły `.wyr` nic nie zmieniają. Zdjęcie wpisu dostaje wtedy `sizes` zwykłej miniatury.
- Reszta telefonu bez zmian, zgodnie z punktami 3 i 8: tam telefon jest wyłączony z nowego układu.
- Zrzuty przy 390 px: lista Aktualności i drugi ekran strony głównej → `raport-zrzuty/z18-telefon-akt-*`.

## 12. Telefon, strona główna: Wydział w pasku, tytuł okładki wyżej — GOTOWE (decyzja 6.11, 01:20)
Właściciel: tytuł wyżej o 14 px, żeby oddzielić go od patronów; w pasku zamiast Instytutu Wydział; „czcionka WMI taka sama jak na stronie PC, pilnujemy czcionek”. Podgląd przy `npm run dev`: `http://localhost:4321/Web-Core/@fs/C:/Users/Szymek/source/Web-Core/.przekazanie/prototypy/telefon.html`. Tylko telefon (≤ 760 px) i tylko strona główna. Wykonaj po punkcie 6, bo on zmienia narzędzia w pasku.

**Tytuł okładki** (`src/styles/zal-telefon.css`)
- `.z-okl-tytul`: `margin-bottom: 28px` zamiast 14 px.
- `.z-okladka::after`: `transform: translateY(-14px)`, żeby ciemne przejście na zdjęciu poszło w górę razem z tytułem.

**Pasek na okładce** (`src/components/Naglowek.astro`)
- Zamiast „Instytut Matematyczny” pokaż `t(lang, 'wydzial')` w dwóch liniach, tym samym podziałem co na okładce komputera (`wydz1`, `wydz2` w `Okladka.astro`; przenieś podział do wspólnej funkcji).
- **Krój identyczny jak na komputerze** (`.z-okl-marka > span:last-child`): `var(--f-text)`, 14 px, waga 500, `line-height: 1.25`, kolor `rgb(255 255 255 / .85)`. Użyj wspólnej reguły, żeby wartości się nie rozjechały. **Nie zmniejszaj kroju na żadnej szerokości.**
- Szerokość tekstu przy 14 px: PL 133 px, EN 154 px. Na węższych telefonach zrób miejsce w pasku, bez ruszania kroju: od 380 px w dół przyciski narzędzi 40×40 px zamiast 44×44 px. Jeśli dwie linie nadal się nie mieszczą, tekst łamie się najwyżej na trzy. Pasek zostaje wysoki na 61 px (w podglądzie 320 px dawało cztery linie i 71 px, tak ma nie być).
- **Link:** tak jak na komputerze prowadzi na stronę Wydziału (`wmiAdres` z `Okladka.astro`), bez widocznej ↗ (wyjątek z zalecenia 23) i z dopiskiem dla czytników ekranu. Logo bez zmian.

**Po zjechaniu z okładki**
- Gdy `.z-okl-tytul` schowa się pod paskiem, pasek wraca do „Instytut Matematyczny” w zwykłym kroju, z linkiem na stronę główną. Po powrocie na górę znów Wydział.
- Dwa linki w HTML, widoczny jeden (ukryty bez fokusu i poza czytnikami). `IntersectionObserver`, bez zdarzenia `scroll`. Stan liczony także przy wejściu w środku strony i po powrocie z bfcache. Bez JS zostaje Wydział.
- Zamiana przez krótkie przenikanie (`--t-krotki`), bez niego przy `prefers-reduced-motion`.

**Odbiór**
- `astro check` bez nowych błędów, `npm run build` przechodzi. Inne strony i komputer bez zmian.
- Szerokości 320, 360, 375, 390 i 430 px, PL i EN: tekst nie nachodzi na przyciski, najwyżej trzy linie, pasek 61 px, bez przewijania w poziomie. W raporcie liczba linii przy każdej szerokości i zmierzony krój paska obok kroju z okładki komputera (mają być równe).
- Strzałka `.z-strzalka` („Szybki dostęp”) i cztery działy mieszczą się na okładce przy 360×640 i 390×760.
- Zrzuty przy 360 i 390 px: góra głównej i stan po zjechaniu, w obu motywach → `raport-zrzuty/z18-okladka-telefon-*`.

## 13. Okładka strony głównej: kadr zdjęcia, który zachowuje się tak samo na każdym monitorze — GOTOWE (decyzja 6.11, 01:27–01:48)
Właściciel: na komputerze „mniej więcej taki kadr jak teraz: budynek przy lewej części i część mostu Grunwaldzkiego”, „odrobinę niżej”, „żeby się skalowało przy różnych monitorach”, sprawdzić ultrawide. Telefon: budynek Instytutu optycznie w połowie między paskiem a słowem „Instytut” (01:43). Narzędzie z kadrem: https://claude.ai/artifact/TJgxyVTeqZhg8gLfEYTh5J. Pliki: `src/styles/zalozyciele.css` (`.z-okl-foto`, ok. linii 330), skrypt `ULOZ` w `src/components/zal/Okladka.astro`.

**Ustawienia właściciela z narzędzia** (6.11, 01:35–01:44):
- komputer przy 1920×940: powiększenie 85%, prawa krawędź 92%, pionowo −7%, potwierdzone na ultrawide z poprawioną regułą pionową („widok PC jest OK”);
- telefon: budynek Instytutu na środku w poziomie i optycznie **w połowie między paskiem a początkiem słowa „Instytut”**, potwierdzone na podglądzie 01:48 („super”).

Poniżej przeliczone na reguły, które dają tę samą kompozycję na każdym ekranie. W narzędziu: pola „Kadr ustalony 6.11, 01:35” (komputer) i „Kadr 6.11, 01:43” (telefon). r = proporcje zdjęcia (2400/1056 ≈ 2,27; bierz z `naturalWidth/naturalHeight` lub atrybutów `width`/`height`). Środek budynku Instytutu na zdjęciu: 47% wysokości i ok. 38% szerokości.

**Komputer (≥ 761 px)**, liczone w `ULOZ` w `Okladka.astro` (już liczy `--foto-x`):
- Zdjęcie w naturalnych proporcjach (`object-fit: fill`, `max-width: none`, bez `object-position`), lewa krawędź w `--foto-x`, maska z lewej (140 px) bez zmian.
- **Szerokość:** `D = max((W − fotoX) / 0.92, 0.77 · H · r)`, wysokość `Dh = D / r`. W = szerokość okładki, H = jej wysokość (`max(600px, 100svh)`). Przy prawej krawędzi ekranu wypada wtedy 92% szerokości zdjęcia: budynek z lewej, przęsło mostu Grunwaldzkiego z prawej. Dolna granica pilnuje, żeby zdjęcie sięgało pełnego granatu u dołu.
- **Pionowo:** `top = min(0, 0.345 · H − 0.47 · Dh)`. Środek budynku jest zawsze na 34,5% wysokości okładki, a u góry nigdy nie zostaje puste miejsce. Na ultrawide zdjęcie jest dużo większe i stały procent nad krawędzią (wersja z 01:35, „−8,2%”) zepchnąłby budynek pod granat; ta reguła to naprawia.
- Ustaw `--foto-w: Dpx`, `--foto-top: topPx`; w CSS `width: var(--foto-w); height: auto; top: var(--foto-top)`. Przeliczaj tam, gdzie dziś `ULOZ` (rozmiar, fonty), i po `load` zdjęcia.
- Bez JS zostaje obecny CSS (`top: -13%`, `cover`, `object-position: 2% 50%`). To samo dla `.z-okl-foto.z-lqip`. Popraw `sizes` w `rozmiarOkl`: szerokość zdjęcia ok. 1,09 · (100vw − foto-x), na ultrawide więcej.
- Usuń wcześniejsze wersje z tego punktu: „prawa krawędź na 86%” i `translateY(-8.2%)`.
- Wynik w narzędziu (fonty zastępcze, na stronie ±2 pkt): wszędzie środek budynku na 35% wysokości i 92% szerokości zdjęcia przy prawej krawędzi, bez pustych miejsc.

  | Ekran | Zdjęcie | Dół zdjęcia |
  |---|---|---|
  | 1366×768 | 1397×615 | 87% wysokości okładki |
  | 1536×864 | 1550×682 | 84% |
  | 1920×1080 | 1899×836 | 82% |
  | 2K przy 125% | 2017×887 | 81% |
  | 2560×1440 | 2562×1127 | 80% |
  | 2560×1080 | 2595×1142 | 99% |
  | 3440×1440 | 3519×1548 | 98% |

**Telefon (≤ 760 px)**, mały skrypt w `Okladka.astro` (dziś `ULOZ` na telefonie od razu wychodzi):
- Rozmiar i poziomo czysty CSS: `left: 50%; right: auto; height: 62%; width: auto; max-width: none; object-fit: fill; transform: translateX(-38%)`. Środek ekranu wypada na 38% szerokości zdjęcia, czyli na budynku Instytutu. Zastępuje `inset: 0 0 auto 0; width: 100%; height: 52%; object-position: 62% 50%`.
- **Pionowo, skrypt:** G = odległość od góry okładki (spod paska) do górnej krawędzi liter „Instytut” (`.w1`: góra pola + ok. 0,14 · font-size). `top = min(0, G / 2 − 0.47 · Dh)`, gdzie `Dh` to wysokość zdjęcia (62% okładki). Środek budynku wypada w połowie między paskiem a tytułem. Ustaw jako `--foto-top`.
- Przeliczaj przy zmianie rozmiaru, po fontach, po `load` zdjęcia i po zmianach z punktu 12 (tytuł 14 px wyżej, pasek 61 px). Bez JS: `top: -12%`.
- Wynik w narzędziu (z punktem 12): G = 108 px przy 360×600, 168 px przy 390×660 i 268 px przy 430×760. Środek budynku odpowiednio na 54, 84 i 134 px. Na najniższych ekranach dach budynku chowa się pod paskiem; jeśli właściciel zechce, można tam zdjęcie zmniejszyć, żeby budynek mieścił się w całości.
- Zdjęcie pionowe `instytut-telefon.jpg` zostaje nieużywane.

**Proporcje:** zdjęcie ma być szersze niż jego pojemnik, a ogólna reguła `img { max-width: 100% }` ściskałaby je w poziomie. Na podglądzie to się zdarzyło. `max-width: none` na `.z-okl-foto` (komputer i telefon) jest więc obowiązkowe. Sprawdź na zrzutach, że proporcje zdjęcia są 2400 : 1056 (np. porównując `getBoundingClientRect()` z `naturalWidth/naturalHeight`).

**Odbiór:** zrzuty okładki przy 1366×768, 1536×864, 1920×1080, 2048×1152, 2560×1440, 2560×1080 i 3440×1440 (tryb urządzeń w DevTools) → `raport-zrzuty/z18-okladka-*`. W raporcie wyliczone `v` i `X` dla każdego.

## 14. Telefon: baner działu, liczby pod krótkim opisem patrona — GOTOWE (decyzja 6.11, 01:52)
Właściciel: „cyferki pod opisem patrona”, krótsze opisy, „ta linia przechodzi przez zdjęcie patrona, powinno jej nie być”, szkic trochę niżej, żeby pasował do podpisu. Podgląd przy `npm run dev`: `http://localhost:4321/Web-Core/@fs/C:/Users/Szymek/source/Web-Core/.przekazanie/prototypy/telefon.html#s=instytut&m=i`. Dotyczy `.z-baner-dzialu` (cztery strony działów, PL i EN), tylko telefon (≤ 760 px, `zal-telefon.css`). Komputer bez zmian.

- **Kolejność:** link wstecz, tytuł, hasło, potem patron, na końcu liczby. Bez drugiej wersji HTML:
  - `.z-nagl.z-baner-dzialu { display: flex; flex-direction: column; }`;
  - `.z-tytul { display: contents; }`, a jego dzieci `position: relative; z-index: 1`; `.z-wstecz { align-self: flex-start; }`;
  - `.z-patron { order: 2; }`, `.z-slot { order: 3; }`, `.pt-liczby { margin-top: 12px; }`.
  - Sprawdź skrypt `dopasuj` w `NaglowekZ.astro`, bo mierzy `.z-tytul`, a przy `display: contents` jego pudełko ma 0 px. Na telefonie liczby mają się pokazywać jak dotąd (najwyżej trzy).
- **Bez linii nad patronem:** `.z-patron { margin-top: 12px; padding-top: 0; border-top: 0; }`. Kreska nad liczbami zostaje.
- **Szkic niżej:** `.z-szkic-ramka { top: 24px; }` zamiast 12 px, żeby kończył się na wysokości podpisu. Podpis bez zmian.
- **Krótki opis:** na telefonie pod nazwiskiem i linią lat zamiast `notka` / `notka_en` pokazuj istniejące pole `fakt` / `fakt_en` z `src/lib/patroni.ts`, w jednej linii. Na komputerze zostaje `notka`. Użyj klas `.tylko-telefon` i `.tylko-komputer`, żeby czytnik ekranu dostawał jeden tekst.

**Odbiór**
- Przy 390 px baner Instytutu ma ok. 344 px (dziś 405). Podaj wysokości wszystkich działów przy 360 i 390 px.
- Podpis nie nachodzi na nazwisko ani linię lat przy 320, 360 i 390 px, PL i EN. Jeśli nachodzi, popraw to i opisz w raporcie.
- Zrzuty czterech działów przy 390 px, jasny i ciemny motyw → `raport-zrzuty/z18-baner-dzial-*`.

## 15. Telefon: pełny rysunek ciekawostki na podstronach — GOTOWE (decyzja 6.11, 01:52)
Właściciel: w niskim banerze rysunek jest ucięty, czasem wychodzi poza ekran i zlewa się z tłem. Tekst ciekawostki na telefonie nadal schowany (zalecenie 19). Tylko telefon.
- `.z-nagl.z-nagl-pod .z-znak { right: 6px; top: 6px; width: 104px; height: min(130px, calc(100% - 12px)); opacity: .7; }` zamiast `right: -14px; top: 4px; width: 112px; height: 130px; opacity: .4`.

**Odbiór**
- Na Władzach (niski baner) i Planie zajęć (baner z liczbami) przy 320, 360 i 390 px cały rysunek mieści się w banerze i na ekranie. Sprawdź kilka losowań ciekawostek każdego działu; policz to z pudełek rysunku, a nie z `svg`.
- Tytuł zostaje czytelny, gdy zachodzi na rysunek. Jeśli gdzieś nie jest, podaj stronę w raporcie.
- Zrzuty przy 390 px → `raport-zrzuty/z18-znak-telefon-*`.

## 16. Telefon: pas działu jako karty grup (wariant I) — GOTOWE (decyzja 6.11, 01:52)
Właściciel wybrał wariant „I Karty” z podglądu (adres w punkcie 14) i: „w widoku mobilnym wywal rekrutację, jest w navbarze”. Tylko telefon (≤ 760 px), PL i EN. Komputer bez zmian, także przycisk Rekrutacja. Kod: `src/components/zal/TrescDzialu.astro`, `src/styles/zal-dzialy.css`.

**Działanie**
- Na górze pasa po jednej karcie na grupę, w jednym rzędzie (`grid-template-columns: repeat(<liczba grup>, minmax(0, 1fr))`, odstęp 6 px; Popularyzacja ma dwie).
- Na starcie wszystko zwinięte. Naciśnięcie karty pokazuje niżej strony tej grupy, inna karta je podmienia, ponowne naciśnięcie zamyka. Otwarta jedna grupa naraz.
- Karta to `button` z `aria-expanded` i `aria-controls`. Zwykłe nagłówki grup (`h3`) schowane na telefonie.
- Bez JS: karty schowane, wszystkie grupy z nagłówkami widoczne, jak dziś.
- `.z-dz-rekr` schowany na telefonie.

**Pas:** bez tła, `padding: 16px 16px 0`.

**Karta**
- `display: flex; flex-direction: column; justify-content: space-between; gap: 6px; min-height: 76px; padding: 10px 10px 9px; border-radius: 5px; background: var(--d-t); text-align: left`.
- Nazwa grupy: Brygada 500, 16 px / 1,15. Długa nazwa łamie się na dwie linie.
- Pod nią liczba stron, 12 px, 600, `var(--d-a)`, z odmianą („1 strona”, „4 strony”, „5 stron”; EN „1 page”, „5 pages”).
- Wybrana: tło `var(--d-a)`, tekst `var(--bg)`, liczba w tym samym kolorze z `opacity: .85`. Pod nią strzałka: `::after` 14×14 px, `left: 18px; bottom: -7px`, obrócona o 45°, w kolorze `var(--d-a)`.

**Strony grupy**
- Pole pod kartami: `margin-top: 12px; padding: 6px 12px; border-radius: 5px; background: var(--d-t)`.
- Lista w dwóch kolumnach (`repeat(2, minmax(0, 1fr))`, `gap: 0 12px`). Link: Brygada jak dziś, 16 px / 1,2, `min-height: 44px`, `padding: 4px 0`, bez zawijania w wiersz i bez ujemnych marginesów z punktu 3 zlecenia 17. Linki zewnętrzne z ↗. Podświetlenie po dotknięciu: tło jak w punkcie 3 zlecenia 17, z zaokrągleniem i odstępem, żeby nie nachodziło na sąsiada.

**Stany:** `:active` na karcie `transform: translateY(1px)`, `:focus-visible` obrys 2 px w `--d-a`. Przy `prefers-reduced-motion` bez przesunięcia. W ciemnym motywie sprawdź kontrast tekstu na wybranej karcie.

**Odbiór**
- `astro check` bez nowych błędów, `npm run build` przechodzi. Komputer co do układu bez zmian.
- Przy 390 px pas na starcie ma ok. 92–97 px. Podaj wysokości zwiniętego i z najdłuższą grupą w każdym dziale.
- Przy 320, 360 i 390 px, PL i EN: nazwy grup mieszczą się w kartach, nie ma przewijania w poziomie.
- Klawiatura (Tab, Enter, Spacja), czytnik ekranu dostaje stan rozwinięcia, działanie bez JS.
- Zrzuty czterech działów przy 390 px, zwinięte i z otwartą grupą, jasny i ciemny motyw → `raport-zrzuty/z18-pas-karty-*`.

## 17. Telefon: podstrony Studiów, zdjęcie przybliżone na tablice — GOTOWE (decyzja 6.11, 02:06)
Właściciel: „zoomuj zdjęcie, żeby focus był na tablicy”, tylko w widoku podstrony. Baner strony działu Studia bez zmian. Podgląd przy `npm run dev`: `http://localhost:4321/Web-Core/@fs/C:/Users/Szymek/source/Web-Core/.przekazanie/prototypy/telefon.html#s=studia%2Fplan-zajec&m=i&p=linia`. Tylko telefon (≤ 760 px).
- `.z-nagl-pod[data-dzial="studia"] .z-foto { container-type: inline-size; }`.
- `.z-nagl-pod[data-dzial="studia"] .z-foto img { position: absolute; left: -53.4cqw; top: min(0px, calc(50% - 29.7cqw)); width: 220cqw; max-width: none; height: 123.9cqw; object-fit: fill; }`. Dotyczy też małej wersji zdjęcia (`.z-lqip`). Reguły muszą wygrać z `img.z-pelne { position: relative }` w `zal-telefon.css`.
- **Ostrość:** w `NaglowekZ.astro` (`sizes`, ok. wiersze 77–80) daj na telefonie dla podstron Studiów `220vw`. Dziś przeglądarka bierze plik 640 px, a zdjęcie jest wyświetlane w szerokości ok. 860 px.

**Odbiór**
- Plan zajęć (wysoki baner, 232 px) i Sprawy studenckie (niski, 95 px) przy 320, 360, 390 i 430 px: w kadrze tablice, nad zdjęciem nie ma pustego pasa, także przy dwulinijkowym tytule.
- Baner działu Studia i komputer bez zmian (na stronie działu zdjęcie nadal ma rozmiar banera).
- Podaj szerokość wczytanego pliku przy 390 px i gęstości 2×.
- Zrzuty → `raport-zrzuty/z18-studia-tablice-*`.

## 18. Telefon: bez „Na tej stronie” — GOTOWE (decyzja 6.11, 02:06)
Właściciel: „wywal »Na tej stronie« ze wszystkich stron, nie pasuje”. Tylko telefon; na komputerze spis zostaje.
- W `@media (max-width: 760px)`: `.z-spis { display: none; }`. Usuń zbędne reguły zwijania spisu na telefonie (`zal-podstrona.css`) i skrypt zwijania w `SpisStrony.astro`, jeśli na komputerze nie jest potrzebny.
- Blok ze slotu „bok” (np. powiadomienia e-mail seminarium) zostaje pod treścią.
- Odstęp nad pierwszą treścią jak dotąd (`.z-pd`: 18 px), bez przyklejenia do banera.

**Odbiór**
- Przy 390 px brak spisu na podstronach wszystkich działów, PL i EN. Kotwice z zewnątrz (np. `#z-nadchodzace`) działają.
- Komputer bez zmian. Zrzuty kilku podstron → `raport-zrzuty/z18-bez-spisu-*`.

## 19. Telefon: Plan zajęć, pasek bez szukania i zajęcia w jednej linii — GOTOWE (decyzja 6.11, 02:06)
Właściciel: „dwa wiersze, zimowy, letni i dni, były spoko”, „wywal szukaj przedmiotu”, jedna linia na prowadzących; podgląd zaakceptowany. Tylko telefon; na komputerze szukanie i pełne nazwiska zostają. Kod: `src/views/PlanZajec.astro`, `src/styles/zal-granty-plan.css`.

**Pasek**
- `.pl-szukaj` schowane. Filtrowanie dni i semestrów działa dalej (skrypt nie może się wysypać na pustym, ukrytym polu).
- Dwa rzędy: `.pl-sem { grid-column: 1 / -1; }`, przyciski po równo (`flex: 1 1 0`), pełne etykiety „Zimowy 2026/27”, „Letni 2026/27”, 13,5 px. Pod spodem dni jak dziś.

**Wiersz zajęć w jednej linii**
- Kolejność: typ · grupa · prowadzący · dzień, godziny · sala, np. `ćw. · gr. 1 · G. Jagiełła · wt. 08:15–10:00 · 601`. Czcionka bez zmian (14,5 px).
- `.pl-w::before { display: none; }`, `.pl-w > .prow { order: 1; }`, przed niepustym `.prow` separator `·` jak przy innych polach (margines 6 px), `.uw` zostaje na końcu.
- Prowadzący na telefonie: inicjał imienia i nazwisko („Piotr Kowalski” → „P. Kowalski”). Kilku prowadzących w tej samej linii po przecinku. W HTML obie wersje: krótka tylko na telefonie, pełna na komputerze i dla czytnika ekranu, żeby jedna osoba nie była czytana dwa razy. Nazwiska z łącznikiem i imiona złożone sprawdź na danych, bez ucinania nazwiska.
- **Te same inicjał i nazwisko u różnych osób:** sprawdź w `plan.json`. Takie osoby pokazuj z pełnym imieniem i wypisz je w raporcie.
- Dłuższe wiersze łamią się zwyczajnie, bez ucinania tekstu.

**Odbiór**
- Przy 390 px co najmniej ok. 180 z 300 wierszy semestru zimowego w jednej linii (podgląd: 189) i strona ok. 17 800 px (dziś ok. 21 500). Podaj liczby dla obu semestrów.
- 320, 360 i 430 px bez przewijania w poziomie. Wyszukiwarka na komputerze działa jak dotąd.
- Zrzuty przy 390 px, jasny i ciemny motyw → `raport-zrzuty/z18-plan-telefon-*`.
