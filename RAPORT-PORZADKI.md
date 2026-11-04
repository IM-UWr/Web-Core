# Raport: przebudowa i porządki (zlecenie 12, noc 4–5.11.2026)

Gałąź robocza: `wyglad/porzadki` (z `wyglad/zalozyciele`, `d12c994`). Gałęzie etapów: `wyglad/porzadki-01-telefon`, …
Pytania do właściciela: `PYTANIA.md`, sekcja „Zlecenie 12”.

## Jak budowałem i sprawdzałem
- **Treści:** prawdziwe, pobrane `skrypty/pobierz_tresci.py` w chmurze (zgoda w czacie 4.11: zakaz dotyczył komputera
  właściciela), raz, na początku pracy (1234 pliki z 21 repozytoriów Web-*). Leżą tylko w ścieżkach z `.gitignore` i nie są
  w żadnym commicie (pliki dodawane do commitów po nazwie, `git status` przed każdym commitem). Wszystkie buildy i zrzuty
  „przed” i „po” są na tych samych treściach (kopia w archiwum poza repozytorium).
- **Data budowania zamrożona** na 2.11.2026, 10:00 (moduł `--import` poza repozytorium, jak w zleceniu 10); w przeglądarce przy
  zrzutach ta sama data, stałe `Math.random`, `reducedMotion: 'reduce'`, sesja z pierwszym wejściem do działów.
- **Zrzuty:** Playwright + Chromium, całe strony, `deviceScaleFactor: 1`. Przejścia CSS (`transition`) wyłączone przy zrzutach
  — bez tego zrzut całej strony łapał przejście `border-color` kart w połowie i dwa przebiegi tego samego kodu różniły się
  (Kalendarz, Obrony). Porównanie pikselowe PIL (`ImageChops`), próg 0 — „identyczne” znaczy co do piksela.
- **Strony w porównaniach (36):** główna; Instytut, Nauka, Studia, Popularyzacja; Władze, Projekty i granty, Plan zajęć;
  Kontakt, Sprawy studenckie, Pierwszy rok, Deklaracja dostępności; Pracownicy, Struktura, zakład (Geometria), Seminaria,
  seminarium (Statystyka), Aktualności, aktualność, Kalendarz, Rok akademicki, kierunek (Matematyka), specjalność (Analiza
  danych), Konferencje, Obrony, obrona, Publikacje, rocznik 2024, Sukcesy, grant, Warto wiedzieć, wpis Warto wiedzieć; `/en`,
  `/en/nauka`, `/en/studia/plan-zajec`, `/en/nauka/granty`.
  - komputer: 1920×950, 1536×760, 1366×640 × jasny i ciemny motyw = 216 zrzutów;
  - telefon: 390×844 × jasny i ciemny = 72 zrzuty (wzorzec telefonu: `wyglad/zalozyciele` + łatka `telefon-TEST.patch`,
    plakietka TEST schowana przy zrzucie).

## Etap 0: wzorce — zrobione
- `wyglad/zalozyciele` (`d12c994`) zbudowany (`npm install` — `package-lock.json` nie ma w repozytorium, więc `npm ci` nie działa;
  `npm run build`): 748 stron, bez błędów.
- Zrzuty wzorcowe komputera (216) i telefonu z łatką (72; łatka nałożona czysto `git apply`, potem cofnięta).
- **Rozmiary przed porządkami** (`d12c994`, te same treści):

| | przed (`d12c994`) |
|---|---|
| CSS w `dist/_astro` | 268 639 B |
| JS w `dist/_astro` | 395 316 B |
| HTML Planu zajęć | 1 126 257 B |
| HTML strony głównej | 213 322 B |
| HTML wszystkich stron | 42 361 439 B |
| pliki w `src/styles` / `src/scripts` / `src/components` | 13 / 43 / 42 |

## Etap 1: telefon z łatki, jedna wersja HTML — zrobione
Gałąź etapu: `wyglad/porzadki-01-telefon`.

**Co zrobione**
- **Łatka telefonu w kodzie jako docelowy telefon:** `zal-telefon-TEST.css` → `src/styles/zal-telefon.css` (bez plakietki TEST,
  bez komentarzy „TEST telefonu”, bez `TEST-TELEFON.md`). Klasa `z-tel` usunięta: bloki są jedyną wersją. Reguły telefonu dla
  bloków, które mają wspólne reguły na każdej szerokości, są na końcu ich plików (`zal-dzialy.css`, `zalozyciele-strony.css`),
  żeby wygrywały kolejnością; w nagłówkach — selektory dwuklasowe (`.z-nagl.z-nagl-pod`), bo bez `z-tel` stare reguły
  `.ph.ph-dlugi h1` z `telefon.css` wygrywały (inny stopień tytułu na stronie grantu i wpisu „Warto wiedzieć”).
- **Usunięte dotychczasowe wersje z HTML:**
  - strona główna: stary baner i wszystkie sekcje telefonu i komputera (`StronaGlowna.astro` z 528 do 24 linii);
    zostały okładka, pasek menu i drugi ekran;
  - 4 strony działów: stara treść, style i skrypt mapy (mapa jest w `zal/dzial/Kontakt.astro`);
  - nagłówki wszystkich podstron: `NaglowekStrony.astro` wstawia już tylko `NaglowekZ` (bez starego `.wrap`, fali Fouriera,
    skryptu `naPasie` i silnika animacji banera); opakowanie `.page-head.ph-z` zostało, bo od jego klas zależą odstępy treści
    stron jeszcze nieprzeniesionych (na każdej szerokości ma `display: contents`);
  - menu i stopka: stara stopka (`Stopka.astro`) wyłączona; z `Naglowek.astro` usunięte menu komputera (rozwijane listy,
    pole szukania, link EN schowany na wąskich ekranach) i jego skrypt — nagłówek jest już tylko nagłówkiem telefonu;
  - Władze: karty dotychczasowej wersji i ich style; Projekty i granty: stara lista, karty i skrypt spisu;
    Plan zajęć: stara tabela, okrągłe przyciski semestrów (`PrzelacznikSemestrow`), drugi spis, `plan.css`;
    strony tekstowe: stary spis u góry i pasek boczny (na stronach z działem).
- **Reguły chowające usunięte:** `body:has(.z-dz) main > …`, `body:has(.z-druga) :is(.gl-…)`, `body:has(.z-wladze) …`,
  `body:has(.z-okladka) .hero`, `body:has(.z-pd > .z-gr, .z-pd > .z-pl) …`, `body:has(.z-okladka) main > …` (telefon), `.ftr`.
- **Kolor dnia** w pasku „Szybki dostęp”: skrypt był w starym kafelku `KafelekKoloryDni.astro` (już niewstawianym) —
  przeniesiony do `src/scripts/zal/kolor-dnia.ts`, ładuje go drugi ekran.
- **Telefon na stronach spoza łatki** (decyzje — do oceny rano, zrzuty `raport-zrzuty/etap1-telefon-*.png`):
  - **wspólny spis „Na tej stronie”** `src/components/zal/SpisStrony.astro` (+ `src/styles/zal-podstrona.css`): na telefonie
    zwijany nad treścią (przycisk z kreską u góry i u dołu, lista z cienką linią po lewej, bez JS rozwinięty); w etapie 2
    ten sam komponent jest spisem z prawej na komputerze. Na komputerze w etapie 1 schowany (spis był jeszcze w bocznej
    nawigacji).
  - **Plan zajęć:** przedmiot jako blok (nazwa Brygadą 19 px), zajęcia w dwóch liniach: „wyk. · gr. 1 · pon. 10:15–12:00 · HS”
    (dzień w kolorze działu, godziny pogrubione) i pod spodem prowadzący z uwagami; pasek przyklejony pod nagłówkiem:
    semestr (mniejsze przyciski) i wyszukiwarka w jednym rzędzie, dni w drugim; spis kategorii zwijany nad planem;
    kategorie Brygadą w kolorze działu, cienkie linie między przedmiotami. Wybrany semestr zapisuje się w adresie
    (dotąd robił to stary przełącznik).
  - **Projekty i granty:** wiersz w jednej kolumnie (rodzaj · lata, tytuł Brygadą, kierownik · zakład · numer), pasek czasu
    pod tytułem na pełną szerokość, oś lat nad listą — paski i oś z marginesem 14 px, żeby skrajne lata się mieściły;
    linia „dziś” jak na komputerze.
  - **Strony tekstowe:** treść w jednej kolumnie, spis zwijany nad treścią; lista podstron działu (stary pasek boczny) na
    telefonie odpada — do innych stron prowadzą menu, „← Dział” i „Następna strona w dziale” (komputer).
- **Wyszukiwarka Pagefind:** nowe bloki są indeksowane; `data-pagefind-ignore` zostało na nawigacji (pasek menu, nagłówek
  telefonu, lista podstron działu, boczna nawigacja, spis, pasek narzędzi planu, „Szybki dostęp”), ozdobach i nagłówkach
  (zdjęcie, szkic, podpis, znak). Tytuł wyniku z `<h1 data-pagefind-meta="title">` w nagłówku.
  Sprawdzone na pełnym buildzie (`npm run build`, 734 strony w indeksie):
  - „Algebra liniowa” → 1. wynik: Plan zajęć;
  - „Karch” → Władze Instytutu (2. wynik, po aktualności o prof. Karchu);
  - „Ekstrema fragmentacji” → strona projektu, Nauka, Projekty i granty;
  - „Dziekanat” → 1. wynik: Kontakt.

**Sprawdzenie etapu 1**
- Build bez błędów i ostrzeżeń (748 stron).
- **Komputer: 216/216 zrzutów identycznych z wzorcem** (wszystkie 36 stron, 3 rozdzielczości, 2 motywy).
- **Telefon na stronach z łatki: identyczny z wzorcem łatki** — 64/72 zrzutów identycznych; różnią się tylko strony, które
  łatka zostawiała w starym wyglądzie i które dostały nowy telefon w tym etapie: Plan zajęć, Projekty i granty, Kontakt,
  Sprawy studenckie (oba motywy).
- **Miganie:** w HTML Planu zajęć nie ma już starej wersji (0 × `pz-semestr`, `data-ps`, `pz-tabela`; HTML 1,13 MB → 353 kB);
  zrzut zaraz po `DOMContentLoaded` przy łączu 50 kB/s, 400 ms opóźnienia pokazuje tylko nowy plan
  (`raport-zrzuty/etap1-miganie-plan-przed-i-po.png`: u góry `wyglad/zalozyciele`, niżej po porządkach).
- Na komputerze zostało `uklad="zwarta portal-baner"` na przeniesionych stronach: reguła `uklad-portal.css` ustawia w banerze
  interlinię 1,55 (bez niej hasło i liczby w banerach działów przesuwają się o ułamek piksela) — do przeniesienia w etapie 4.
