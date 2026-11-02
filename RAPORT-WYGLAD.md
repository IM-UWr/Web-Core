# Raport: nowy wygląd „Założyciele”, wersja na komputer (zlecenie 10, noc 2–3.11.2026)

Gałąź: `wyglad/zalozyciele` (z `kopia/2026-11-01-agent-nauka-podglad`, `ae6d5d96`). Pytania i przyjęte odpowiedzi: `PYTANIA.md`.

## Jak budowałem i sprawdzałem (ważne dla oceny wyników)
- **Treści.** W repozytorium Web-Core nie ma treści (są w Web-*, w `.gitignore`), a dostęp do repozytoriów Web-* w tej sesji został odmówiony. Nie uruchamiałem `skrypty/pobierz_tresci.py`. Buduję na **danych testowych** odtworzonych z prototypu i ze zbudowanej kopii obecnej strony (gałąź `podglad-agent-nauka-podglad`); dane testowe leżą tylko w ścieżkach ignorowanych przez git i nie są w żadnym commicie (`PYTANIA.md`, pytanie 1).
- **Data.** Wiele list zależy od „dziś” (wydarzenia, seminaria tygodnia, stopka). Do porównań data budowania jest zamrożona na 2.11.2026, 10:00 (moduł podpięty przez `NODE_OPTIONS=--import …`, poza repozytorium).
- **Build:** `npx astro build` (bez Pagefind).
- **Gałęzie etapów:** zgodnie z poleceniem w czacie pushuję tylko `wyglad/zalozyciele`; etapy są oznaczone w commitach, a ostatnie commity etapów są niżej.

## Etap 1: krok zero — zrobione
**Commity:** `aa293c48` (Instytut i strony ogólne), `10e8ebf6` (Nauka), `d38f749c` (Studia, Kalendarz, Aktualności) — ostatni commit etapu: `d38f749c` (gałąź etapu można założyć: `git branch wyglad/01-krok-zero d38f749c`).

**Co zrobione.** Przygotowanie danych z górnych części wszystkich 32 widoków `src/views/*.astro` przeniesione do funkcji w `src/lib/widoki/` (jeden plik na widok, np. `daneDzialuInstytut(lang)`, `daneWladz(lang)`, `daneListyGrantow(lang)`, `daneGrantu(grant, lang)`, `danePlanuZajec(lang)`). `src/views/publikacjeDane.ts` przeniesiony do `src/lib/widoki/publikacje.ts` (poprawione importy w `sitemap.xml.ts` i stronach rocznika publikacji). W widokach zostały: importy komponentów, `Astro.props`, jedno wywołanie funkcji danych i drobne pomocniki prezentacyjne (`T`, `href`, `mail`, `tel` itp.). Część HTML, `<style>` i `<script>` każdego widoku jest bajtowo bez zmian. Pracę podzieliłem między trzech podagentów (rozłączne zestawy widoków, osobne kopie robocze).

**Wynik porównania HTML.** `diff -r` całego `dist` (738 stron HTML i wszystkie pozostałe pliki) przed zmianą i po niej, oba buildy w tym samym katalogu i z zamrożoną datą: **brak różnic**. (Uwaga: build tego samego kodu w innym katalogu różni się w 5 plikach — `uid` wysp React w `pracownicy` i jednej aktualności oraz kolejność wierszy `sitemap.xml` — bo Astro bierze do nich ścieżkę katalogu; dlatego oba buildy robiłem w tym samym katalogu.) Na danych testowych, nie na prawdziwych treściach — patrz `PYTANIA.md`, pytanie 1.

### Jak powtórzyć dowód z etapu 1 na prawdziwych treściach (na komputerze z treściami Web-*)
```bash
git worktree add ../wzorzec ae6d5d96          # stan przed etapem 1
git worktree add ../etap1 <ostatni commit etapu 1>
# w obu katalogach: te same treści (skopiować src/content, src/data, public/pliki z bieżącego katalogu) i npm ci
# zamrożona data, żeby „dziś” było takie samo w obu buildach:
echo "const S=Date.UTC(2026,10,2,9);const D=Date;globalThis.Date=class extends D{constructor(...a){a.length?super(...a):super(S)}static now(){return S}}" > /tmp/zamroz.mjs
(cd ../wzorzec && NODE_OPTIONS="--import /tmp/zamroz.mjs" npx astro build)
(cd ../etap1 && NODE_OPTIONS="--import /tmp/zamroz.mjs" npx astro build)
diff -r ../wzorzec/dist ../etap1/dist && echo IDENTYCZNE
```

## Etap 2: fundament — zrobione
**Commit:** patrz niżej („Etap 2: …”); gałąź etapu: `git branch wyglad/02-fundament <commit>`.

**Co zrobione (tylko komputer, wszystko za `@media (min-width: 761px)`):**
- **Zmienne** (`src/styles/zalozyciele.css`): paleta „Atramenty” (4 odcienie na dział jako `--instytut-j/g/a/t` itd. i `--d-*` w miejscu z `data-dzial`), granat `#0d1830`, ciepłe tło `#fcfaf6` / `#f4f1ea` / `#e5e0d6` w jasnym motywie, ciemny motyw `#0a1020` (tekst w kolorze działu bierze odcień jasny). Stare zmienne (`--bg`, `--accent`…) nadpisane na komputerze, więc dotychczasowa treść podstron też dostaje nowe kolory; bursztyn tylko w Instytucie, poza działami neutralnie. Ozdobne tło („pole”) wyłączone na komputerze.
- **Kroje:** Brygada 1918 (paczka `@fontsource-variable/brygada-1918`, w projekcie) w nagłówkach, Manrope (już w projekcie) w tekście.
- **Szablon** (`Baza.astro`): pasek menu na banerze (`src/components/zal/PasekMenu.astro`: przezroczysty, biały tekst, kolumna 1240 px, bieżący dział pogrubiony, kreski 18 px w kolorach działów, Rekrutacja za kreską, Szukaj, EN z flagą 20×10), odchudzona stopka w jednej linii (`StopkaZ.astro`), kolumna `--marg: max(64px, (100% − 1240px)/2)`. Stary nagłówek i stopka zostają dla telefonu.
- **Trzy nagłówki:**
  - okładka strony głównej (`Okladka.astro` + `src/scripts/zal/okladka.ts`): blok tytułu z równymi końcami i ciemnym polem po skosie s = 0,32 (liczone jak w prototypie), zdjęcie przesunięte w prawo i w górę, 4 działy ze szkicami („duch” w spoczynku, rysowanie po najechaniu), hamburger z panelem (Esc, klik obok, fokus), Szukaj, EN, księżyc, strzałka „Szybki dostęp”;
  - baner działu („opcja 4”, `NaglowekZ.astro`, rodzaj `dzial`): granat → zdjęcie w dwóch kolorach, szkic patrona z poświatą, notka o patronie z salą, podpis; hasło i liczby tylko gdy są liczby;
  - nagłówek podstrony (`NaglowekZ.astro`, rodzaj `podstrona`): głęboki kolor działu na zdjęciu (≈90% z lewej, ≈55% z prawej), „← Dział”, sygnet z kreską i małym podpisem w lewym marginesie, znak patrona z opisem przy prawej krawędzi (niski 145×170, wysoki 200×200 przycięty do rysunku). Zasady położenia według „Zasady nagłówka podstrony”, w tym wąskie okna < 1500 px (sygnet w kolumnie, tytuł o 122 px w prawo). Wchodzi przez `NaglowekStrony.astro`, więc od razu na wszystkich podstronach (PYTANIA.md, pytanie 6).
- **Boczna nawigacja podstron** (`BocznaNawigacja.astro`, grupy z menu, bieżąca z kreską, „Na tej stronie”) i „Następna strona w dziale” (`NastepnaStrona.astro`) — gotowe komponenty, użyte w etapie 3.
- **Szkice** (`src/assets/szkice/`: pliki SVG z gałęzi prototypów, `ZRODLA.md` i `szkice.json` — wyciąg z tych SVG użyty w prototypie, z kreskami rozdzielonymi do rysowania; `Szkic.astro` wstawia je jako SVG w linii, `aria-hidden`). Animacje (`src/scripts/zal/szkice.ts`): kontur się rysuje (1,5 s, odstęp 45 ms), detale się pojawiają, podpis odsłania się maską i kończy razem ze szkicem; na stronie działu tylko przy pierwszym wejściu w wizycie (`sessionStorage`, gdy nie da się zapisać — jak przy powrocie), start dopiero gdy widoczny; podstrony bez animacji; po narysowaniu jednolity (1,3 i 1,1 px); `prefers-reduced-motion` — od razu gotowe, z rozjaśnieniem 0,15 s; bez JS — od razu narysowany.
- Dane patronów, notki, sale i znaki matematyczne (liczone jak w prototypie): `src/lib/patroni.ts`, oznaczone jako **do sprawdzenia**; puste `*_en` = tekst polski.

**Sprawdzenie:**
- `npx astro build` bez błędów i ostrzeżeń (738 stron, PL i EN). Linki wewnętrzne: te same 3 zepsute cele co przed zmianami (brak pliku w danych testowych i Pagefind, który nie jest budowany), żadnych nowych.
- **Telefon 390 px, 29 stron (PL i EN), jasny motyw + 6 stron w ciemnym:** zrzuty po zmianach są identyczne piksel w piksel ze zrzutami sprzed zmian (porównanie z dwoma przebiegami wzorca; jedyne różnice to szum ozdobnego tła, który występuje też między dwoma przebiegami starego kodu).
- Komputer: zrzuty 1920×950, 1536×760 i 1366×640, jasny i ciemny motyw; porównanie z prototypem w 1920×950 (okładka, baner Instytutu, nagłówek Projektów i grantów) — zgodne poza różnicami niżej.
- Przeglądarka: pierwsze wejście na stronę działu rysuje szkic i podpis, powrót i `prefers-reduced-motion` dają stan gotowy; hamburger działa z klawiatury (Esc, powrót fokusu); brak błędów JS.

**Różnice względem prototypu (etap 2) i powody:**
- Plakietka wyróżnionego wpisu nad logo okładki pokazuje się, gdy w CMS jest wpis z „Wyróżnij do…” (PYTANIA.md, 4).
- Strzałka okładki bez licznika („3 wydarzenia w tym tygodniu” to propozycja do potwierdzenia).
- Opis znaku z rokiem: „Pochodna Liego, 1931”, „Kontinuum Knastera, 1922” (PYTANIA.md, 5).
- Księżyc tylko na okładce, jak w prototypie (PYTANIA.md, 3).
- Strony bez banera (pojedyncza aktualność, obrona itp.) — pasek na granacie; Aktualności, Kalendarz i strony ogólne — nagłówek w granacie ze zdjęciem Aktualności, bez sygnetu i znaku (prototyp tych stron nie ma).
- Opis strony (`lead`) nie jest pokazywany w nowych nagłówkach (jak w prototypie; zostaje w meta description).
- Flaga UK uproszczona (czerwone skosy bez przesunięcia — przy 20 px niewidoczne).
- Pasek po przewinięciu się nie przykleja (w `dok/estetyka.md` „do zrobienia”, otwarte).
- Treść pod nagłówkami (poza stronami z etapu 3) jest jeszcze stara, tylko w nowych kolorach i krojach.

## Podział `src/scripts/` i skryptów w komponentach
`src/scripts/` zawiera tylko silnik animacji banerów (`src/scripts/baner/`). Pozostałe zachowanie strony siedzi w `<script>` w komponentach i widokach.

**Dekoracje (do wymiany albo usunięcia na komputerze; telefon zostaje bez zmian):**
- `src/scripts/baner/silnik.ts`, `typy.ts`, `wspolne.ts` i 37 motywów w `src/scripts/baner/motywy/` (Lorenz, Fourier, Knaster, kanapka, motyl itd.) — animacje w tle banerów podstron. **Działają tylko na telefonie** (silnik sam się wyłącza powyżej 760 px), więc zostają nietknięte.
- `NaglowekStrony.astro`: skrypt `naPasie` (przezroczysty nagłówek na granatowym pasie) i statyczna fala Fouriera w Aktualnościach — wygląd starego banera.
- `WartoWiedziec.astro`: losowanie kolejności kart (skrypt w linii) — wygląd/układ, nie funkcja.

**Zachowanie (zostaje, nowy wygląd ma z niego korzystać):**
- `Baza.astro`: motyw jasny/ciemny z `localStorage` przed narysowaniem strony, `speculationrules` (wczytywanie z wyprzedzeniem).
- `Naglowek.astro`: przełącznik trybu ciemnego, rozwijanie menu, menu na telefonie, wyszukiwarka w nagłówku.
- `FiltrISzukaj.astro` (podpowiedź w polu szukania), `ListaAktualnosci.astro` (filtry i szukanie), `Kalendarz.astro` (widok, filtr rodzaju, szukanie), `ListaGrantow.astro` (podświetlanie spisu), `SpisTresci.astro` (podświetlanie bieżącej sekcji), `Szukaj.astro` (Pagefind), `Seminarium.astro` (zapis na listę), `Kierunek.astro` (zakładki programów i wybór roku), `PrzelacznikSemestrow.astro` + `wyborSemestru.ts`, `RokAkademicki.astro` i `KafelekKoloryDni.astro` (kolor dnia liczony w przeglądarce), `DzialInstytut.astro` (mapa ładowana po kliknięciu), `powiadomienia.astro`, `Przekierowanie.astro`.
- `StronaGlowna.astro`: „Zobacz więcej” i odliczanie wydarzeń (telefon i komputer).
- Telefon: `WTymDziale.astro` (akordeon), `WierszAktualnosci.astro` (zwijanie plakietek do „+N”).
