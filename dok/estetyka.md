# Estetyka i „dusza” strony IM UWr (rozmowa 1.11.2026, 19:50–23:35)

Wątek koncepcyjny. **Nic nie jest jeszcze wdrożone.** Zasady pracy jak w `claude/przekazanie.md` (sekcja 0). W sprawach wyglądu ten dokument ma pierwszeństwo przed starszymi ustaleniami.

## Zarzut użytkownika
Strona wygląda bardzo „AI”, a wszystkie zakładki wyglądają tak samo. Chce zobaczyć różne koncepcje, także odważne i zmieniające wcześniejsze ustalenia.

## Diagnoza (kopia strony z 1.11, zrzuty 1440 i 390 px)
- Jeden krój (Manrope) do wszystkiego, prawie zawsze 700–800.
- Kolory i kształty z gotowego zestawu: szarości „slate” z Tailwinda, zaokrąglenia 16–20 px, przyciski‑pigułki, miękki cień, etykiety wersalikami z rozstrzeleniem.
- Wszystko jest kafelkiem, a przed nagłówkami bursztynowa kreska 4 px.
- Jeden szablon działu: granatowy baner, bursztynowe hasło, 3 liczby, „W tym dziale”, ściana tekstu.
- Brak prawdziwego materiału: mało zdjęć ludzi i miejsca, nic z archiwum, ogólne ikonki.

## Kierunek „Założyciele” (20:25: „obłęd, o coś takiego mi chodziło”)
- Patroni działów, czyli czwórka twórców wrocławskiej szkoły (źródła: MacTutor; Duda i Weron, Wiadomości Matematyczne 2006):
  - Instytut: Edward Marczewski (1907–1976);
  - Nauka: Władysław Ślebodziński (1884–1972), pochodna Liego;
  - Studia: Bronisław Knaster (1893–1980);
  - Popularyzacja: Hugo Steinhaus (1887–1972).
  - Aktualności i Kalendarz zostają w granacie, wpisy dostają kolor działu.
- Szkice twarzy są **zastępcze**. Dokładne szkice zrobimy później (22:14). Potrzebne zdjęcia z prawami Instytutu i ilustrator.
- Alternatywa i dopełnienie twarzy: **znak matematyczny patrona**, liczony dokładnie:
  - Instytut: rozszerzenie porządku Szpilrajna (Marczewski publikował jako Szpilrajn);
  - Nauka: pochodna Liego (przepływ i przeniesione wektory);
  - Studia: kontinuum Knastera;
  - Popularyzacja: kanapka Steinhausa.
- **Paleta „Atramenty”** (jasny / głęboki / atrament / tło):
  - Instytut, bursztyn: #f2a33a / #5c3a0e / #8a5300 / #fbf1e1;
  - Nauka, zieleń morska: #4cc3b2 / #0a4a47 / #0a6b63 / #e2f3f0;
  - Studia, cynober: #f07d5e / #5e1f14 / #b03a1f / #fbe8e2;
  - Popularyzacja, fiolet: #a991f7 / #30216a / #5b3fc4 / #eeeafd;
  - granat #0d1830.
  - W ciemnym motywie tekst w kolorze działu bierze odcień jasny.
  - Alternatywa: „Stonowana” (ochra, patyna, terakota, wrzos).
- **Bursztyn jest tylko kolorem Instytutu**, a nie ogólnym akcentem strony. Poza działami jest neutralnie.
- **Typografia:** nagłówki Brygada 1918, tekst Manrope 400–600. Alternatywa: Latin Modern + IBM Plex Sans.
- **Tło stron lekko ciepłe (22:58):** `--m-bg: #fcfaf6`, `--m-surface: #f4f1ea`, `--m-line: #e5e0d6`, tylko w jasnym motywie. Ciemny motyw: tło #0a1020 (bardzo ciemny granat).
- **Tryb ciemny pasuje do koncepcji (22:53).** Baner i tak jest ciemny. Pod banerem cienka linia, żeby baner nie zlewał się z tłem.
- **Flaga brytyjska przy „EN” (23:00):** 20×10 px z cienką obwódką, we wszystkich trzech miejscach przełącznika języka.

## Strona główna na komputerze (20:25–21:54)
- **Ekran domyślny: Full HD** (okno ok. 1920×950). Strona główna ma dwie pozycje, każda na jeden ekran: okładkę i pod nią „Szybki dostęp” z resztą i odchudzoną stopką. Zwykłe przewijanie.
- „Szybki dostęp” zamiast „Na skróty”.

### Okładka
- Bez napisu w lewym górnym rogu i bez paska menu.
- Prawy górny róg: Szukaj, EN z flagą, tryb ciemny (księżyc przełącza motyw) i dyskretny hamburger.
  - Hamburger otwiera panel z prawej na granacie: 4 działy z podstronami, a pod nimi duże „Aktualności”.
  - Z panelu usunięte: Szukaj, English, Kalendarz i duża „Rekrutacja” (zostaje jako podstrona Studiów i w pasku drugiego ekranu).
- **Blok tytułu z równymi końcami:** logo UWr (pełny logotyp, biel), „Instytut” (~104 px na FHD) i „Matematyczny” (~60–65 px). Prawe końce leżą na jednej prostej, która jest granicą ciemnego pola po skosie (s = 0,32).
- Zdjęcie gmachu przesunięte w prawo i w górę (`top: -13%`, `object-position: 2% 50%`). Docelowe zdjęcie do wyboru.
- Rząd 4 działów nisko: szkic, nazwa i hasło, bez linków do podstron. Hasło „Badania, studia i popularyzacja” usunięte z okładki.
- Propozycje do potwierdzenia: strzałka z licznikiem („Szybki dostęp · 3 wydarzenia w tym tygodniu”), plakietka na sprawy pilne. Barwienie zdjęcia przy najechaniu: decyzja otwarta (rada: bez zmian).

### Drugi ekran
- Pasek menu: Instytut, Nauka, Studia, Popularyzacja, Aktualności, Rekrutacja, a za kreską Szukaj i EN. Kreski działów mają po 18 px.
- Pasek „Szybki dostęp”: Plan zajęć, „Dziś brak zajęć” z kolorem dnia, Pracownicy, Seminaria.
- **Długa trzecia kolumna (21:27–21:34):** sloty 0 i 1 to krótkie kolumny po 3 pozycje i „Zobacz więcej (N)”. Slot 2 to długa kolumna na całą wysokość, a liczba pozycji zależy od wysokości. „Zobacz więcej” płynnie zamienia klikniętą kolumnę z długą (FLIP 0,52 s, bez animacji przy `prefers-reduced-motion`).
- **Prelegent przy seminariach (21:40):** po tytule półpauza i nazwisko kursywą Brygady, szare, bez łamania, bez afiliacji.
- Jeden wzór daty we wszystkich kolumnach: dzień dużą Brygadą, pod nim „lis · pon.”.
- Miniatury w aktualnościach: 72×54 px. Wpis bez zdjęcia dostaje szkic patrona działu.
- „Studiuj matematykę we Wrocławiu” w spokojnej wersji i „Warto wiedzieć” na 2/3 szerokości.
- Stopka w jednej linii, z „© 2026 Uniwersytet Wrocławski · Created by Szymon Cygan”.

## Strona działu na komputerze (22:15–23:00)
- **Wybrany układ: „opcja 4” (22:34: „4 jest dużo lepsza”).**
  - Baner ma 300 px plus pasek menu 66 px.
  - Z lewej granat z tytułem, płynnie przechodzi w zdjęcie nagłówka działu w dwóch kolorach: cienie granatowe, światła w jasnym kolorze działu (zdjęcie w skali szarości z `multiply` na kolorze działu i warstwa granatu z `lighten`).
  - Na zdjęciu szkic patrona jasną kreską z poświatą, rysowany przy wejściu.
  - Opcja 2 (kalendarium) jako baner odrzucona. Oś czasu może trafić niżej na stronę Instytutu.
- **Kolumna treści 1240 px, wyśrodkowana (22:35).** Baner idzie na całą szerokość, a tytuł stoi na lewej linii kolumny: `--marg: max(64px, (100% − 1240px) / 2)`.
- **Pod tytułem tylko krótkie hasło w kolorze działu, bez opisu (22:46–22:51).** Opis zostaje w meta description. Hasło pokazujemy tylko wtedy, gdy pod nim są liczby (23:16).
- **Notka o patronie zamiast podpisu w rogu (22:51):** stoi z lewej strony szkicu. Nazwisko kursywą, lata i „patron działu”, pod kreską 1–2 zdania. Bez cytatów, bo pewny cytat mamy tylko od Steinhausa.
  - Notki są robocze i trzeba je sprawdzić u historyka Instytutu. Lata rektorstwa Marczewskiego (1957–1962) podane z pamięci.
- **Pasek menu leży na banerze (22:58–23:00):** przezroczysty, biały tekst, zwężony do kolumny 1240, bieżący dział pogrubiony, u góry zdjęcia lekkie przyciemnienie.
  - Do zrobienia: po przewinięciu pasek przykleja się u góry i dostaje granatowe tło.
- **Pod banerem:**
  - podstrony w trzech grupach jak w menu (linie, Brygada, strzałki, bez kafelków);
  - potem tekst działu i „W skrócie” (wartości Brygadą w kolorze działu, pierwszy akapit większy);
  - potem sekcje działu:
    - Instytut: Ostatnie sukcesy z miniaturami zdjęć wpisów; Kontakt i dojazd z podpisami zamiast ikon i mapą ładowaną po kliknięciu;
    - Nauka: Realizowane projekty i ostatnie Konferencje;
    - Studia: Aktualności dla studentów;
    - Popularyzacja: cztery sekcje „To be announced”, partnerzy z linkami zewnętrznymi, liczby TBA ukryte.
  - Stopka odchudzona, w kolumnie.
- Treści działów w prototypie są wzięte z obecnej strony (kopia z wieczoru 1.11). Nowa wersja Instytutu jest o ok. 1/4 dłuższa, bo tekst ma węższą kolumnę. Pomysł do decyzji: „Czytaj dalej” albo element w luce pod „W skrócie”.

## Podstrony działów (23:02–23:31)
- **Wspólna rama, różne treści.**
  - Wspólne: niski nagłówek, boczna nawigacja (podstrony działu w grupach, bieżąca z kreską w kolorze działu, pod spodem „Na tej stronie”) i treść bez kafelków.
  - Na dole: „Następna strona w dziale” oraz „Ostatnia aktualizacja: data z historii zmian · Zgłoś błąd na tej stronie”.
  - Każdy typ strony ma własny blok treści i jeden wyróżniający detal.
- **Nagłówek podstrony: pełny głęboki kolor działu ze zdjęciem działu na całą szerokość (23:16–23:17).**
  - Zdjęcie jest w dwóch kolorach. Przykrywa je głęboki kolor działu, mocniej z lewej (ok. 90%), w prawo słabiej (ok. 55%).
  - Pasek menu leży na nagłówku.
  - Odrzucone warianty: samo przejście z granatu, pełny głęboki bez zdjęcia („lipny”) i pełny jasny (plakatowy). Osobnych zdjęć dla podstron nie dobieramy.
- **Kolory poziomów:** strona główna granatowa, strona działu przechodzi z granatu w kolor działu, podstrona jest od początku w kolorze działu.
- **Ścieżka „← Nazwa działu”** zamiast „Dział › Podstrona” (23:16).
- **Z prawej znak matematyczny patrona** z podpisem: nazwa twierdzenia i rok, jedno zdanie.
  - Na podstronach rysunek może się różnić (inny porządek, inny poziom). To „odcisk palca” podstrony; w prototypie tak jest na Władzach.
- **Sygnet działu (23:20–23:22):** uproszczony szkic twarzy patrona, wysunięty w lewy margines przed tytułem, oddzielony pionową kreską.
  - Każdy patron ma dwa warianty: pełny szkic (baner działu, okładka) i uproszczony sygnet (podstrony, nawigacja działu, ewentualnie menu na telefonie).
  - Uproszczone sygnety powstaną razem z dokładnymi szkicami. Teraz w prototypie jest pomniejszony szkic zastępczy.
- **Podpis patrona (23:23–23:24):**
  - na banerze działu zachodzi na szkic i „pisze się” po narysowaniu twarzy;
  - na podstronie stoi pod sygnetem, w marginesie.
  - Teraz jest **zastępczy**, odręczna czcionka Alex Brush (pierwsza czcionka nie miała polskich liter).
  - Docelowo skan prawdziwego podpisu przerysowany na wektor, animowany kreską.
  - Źródła: Nowa Księga Szkocka (biblioteka WMI), Archiwum UWr, zbiory PAN lub IMPAN. Potrzebna zgoda na publikację i podanie źródła. Marczewski przed 1940 podpisywał się „Szpilrajn”.
- **Władze (prototyp, dane obecnej strony):**
  - dyrektor wyróżniony, pod nim 4 zastępców połączonych cienkimi liniami w schemat;
  - zdjęcia osób z `public/pliki/wladze/`: dyrektor 120×150, zastępcy 96×120, władze Wydziału 76×95; sekretariat bez zdjęć;
  - dalej: Władze Wydziału w 2 kolumnach, Sekretariat jako blok kontaktu, Kadencja, Rada Instytutu, Zobacz też.
- **Projekty i granty (prototyp):**
  - liczby 94 / 5 / 73 / 11;
  - 5 realizowanych projektów z paskami czasu na wspólnej osi lat 2022–2028 i przerywaną linią „dziś”;
  - wszystkie 87 zakończonych według roku zakończenia, z małymi paskami na osi 2005–2026;
  - 2 „pozostałe”.
- **Plan zajęć (prototyp):**
  - wszystkie 88 przedmiotów semestru zimowego 2026/27;
  - nazwa przedmiotu z lewej, zajęcia w równych kolumnach: typ, grupa, prowadzący, dzień, godziny, sala, uwagi;
  - przyklejony pasek: semestr, wyszukiwarka (przedmiot, prowadzący, sala) i filtr dni, działające;
  - semestr letni do dorobienia.
- **Proponowane detale innych podstron** (jeszcze bez prototypów):
  - Pracownicy: indeks A–Ż, filtry według zakładu i grupy, wyszukiwarka;
  - Struktura: przekrój budynku z zakładami na piętrach (potrzebne dane o piętrach);
  - Warto wiedzieć: kalendarium;
  - Seminaria: siatka tygodnia z kolorami dni;
  - Obrony: wzór prelegenta i promotor;
  - Rok akademicki: kalendarz kolorów dni;
  - Pierwszy rok: lista kroków.

## Prototypy (artefakty)
- **Założyciele:** https://claude.ai/artifact/UuuZUa4ByC4AEYWEkrhibv (wersja 31)
  - Widoki: Okładka, Strona działu, Główna v1, Dział (stary), Telefon.
  - Przełączniki: Motyw (system / jasny / ciemny), Tło (ciepłe / białe), Szkic, Paleta, Dział, Wersja (nowa / zrzut obecnej strony), Baner (samo hasło / hasło + opis), Pasek menu (na banerze / jasny), Strona (strona działu / podstrona), Nagłówek podstrony, Zdjęcia osób, Wariant (4 / 2), Przejście, Krawędź, Seminaria, Prelegent.
  - Podstrony w prototypie: Instytut → Władze, Nauka → Projekty i granty, Studia → Plan zajęć.
- **Typografia:** https://claude.ai/artifact/Qh5yQZWowXrHmkuXibcGdC
- **Preprint:** https://claude.ai/artifact/RJ7SCRD12W2hHYfGQcoEhQ
- **Plakat:** https://claude.ai/artifact/8nN82YM6MkGpGUynzmjGZV

## Kopie na GitHubie (23:33)
- Repozytorium IM-UWr/Web-Core:
  - `kopia/2026-11-01-agent-nauka-podglad` to dokładna kopia lokalnej gałęzi `agent-nauka-podglad` (do `ae6d5d96`, 30 commitów niewypchniętych wcześniej);
  - `kopia/2026-11-01-estetyka-prototypy` to osobna gałąź bez historii kodu, **nie scalać**. Zawiera źródła i gotowe pliki prototypów, skrypty (`skrypty/zloz.py`, `skrypty/podglad.js`), zasoby i dokumenty (`dok/`).
- Nie weszły do kopii nieśledzone pliki z komputera: `.claude/` i `package-lock.json`.
- Na komputerze w `.przekazanie\robocze\` leżą stare paczki (ok. 140 MB, m.in. `drzewo-robocze.tar.gz`, `estetyka-drzewo.tar.gz`). Można je usunąć.

## Otwarte
- Dokładne szkice patronów, uproszczone sygnety i prawdziwe podpisy (skany).
- Sprawdzenie notek o patronach.
- Paleta: Atramenty czy Stonowana.
- Barwienie zdjęcia okładki przy najechaniu.
- Proporcja „Instytut” / „Matematyczny”.
- Docelowe zdjęcia: okładka i nagłówki działów. Jasne zdjęcia lepiej przyjmują kolor działu; obecne zdjęcie Nauki jest ciemne.
- Długość tekstu „O Instytucie” na stronie działu.
- Pasek menu przyklejony po przewinięciu.
- Telefon: okładka z 4 działami? Zwijany pas B2? Jak wyglądają strona działu i podstrony na telefonie?
- Wzór prelegenta przy obronach.

## Plan wdrożenia (2.11, 00:07–00:10; start w środę)
- **Zostajemy w repo IM-UWr/Web-Core.** Warstwę wyglądu piszemy od nowa na osobnej gałęzi (np. `wyglad-zalozyciele`). Nowe repo odrzucone: przepadłyby podpięcie Pages CMS, wdrażanie, repozytoria treści Web-*, domena i historia.
- **Podział kodu (stan z 1.11):**
  - bez zmian: `content/`, `data/`, `lib/`, `pages/`;
  - od nowa: `styles/`, `components/`, `layouts/`;
  - wymieszane: `views/` (u góry przygotowanie danych, pod spodem HTML i style) oraz `scripts/` (zachowanie strony i dekoracje).
- **Kolejność:**
  1. Porządek w gałęziach: `agent-nauka-podglad` do `main` (po słowie „push”).
  2. **Krok zero, na obecnym wyglądzie:** przygotowanie danych z `views/` do funkcji w `lib/`, np. `daneDzialuInstytut()`. Dowód poprawności: wygenerowane HTML przed zmianą i po niej muszą być identyczne. Do tego podział `scripts/` na zachowanie, które zostaje, i dekoracje.
  3. Projekt telefonu dla strony działu i podstron.
  4. Gałąź z nowym wyglądem: fundament (kolory działów, fonty na serwerze, szablon z paskiem na banerze, trzy nagłówki, boczna nawigacja), potem strony po kolei. Stary kod wyglądu usuwamy na bieżąco.
- **Zasady przy scalaniu:**
  - struktury danych nie zmieniamy, nowe pola tylko dodajemy;
  - w starych widokach na czas przebudowy tylko poprawki;
  - `main` wciągamy do gałęzi co kilka dni;
  - podgląd online przez osobne repo przeznaczone tylko do podglądu.

## Animacje (2.11, 00:15–00:18)
- **Strona główna:** animacja tak. Na okładce widać słaby szkic („duch”). Po najechaniu na dział jasna kreska rysuje się po nim w kolorze działu (ok. 1–1,5 s).
- **Strona działu:** szkic i podpis rysują się **tylko przy pierwszym wejściu w danej wizycie** (flaga w sessionStorage). Przy powrotach, np. z podstrony przez „← Dział”, są od razu gotowe. Jeśli flagi nie da się zapisać, strona działa jak przy powrocie. Treść jest widoczna od pierwszej chwili, animuje się tylko szkic z boku. Po szkicu i przerwie ok. 0,2 s podpis „pisze się” kreską.
- **Podstrony:** bez animacji. Sygnet, podpis i znak patrona są statyczne.
- **Technika:** SVG z liniami środkowymi w kolejności rysowania (`pathLength=1`, `stroke-dasharray`/`stroke-dashoffset`), rysowane przez przeglądarkę. Bez GIF-ów i filmów. Kolor przez `currentColor`, więc działa w kolorze działu i w obu motywach. Animacja rusza dopiero, gdy element jest widoczny na ekranie, i nie powtarza się.
- **Wyłączony ruch (`prefers-reduced-motion`):** wszystko od razu w stanie końcowym, zostaje najwyżej krótkie rozjaśnienie (ok. 0,15 s). Dotyczy też zamiany kolumn, „Zobacz więcej”, panelu menu, powiększenia miniatur, rozwijanych sekcji i dekoracji z obecnej strony. Funkcje strony działają tak samo.
- **Szkice od ChatGPT:** po 3 pliki SVG na patrona (pełny szkic, sygnet, podpis):
  - same ścieżki `fill="none"` i `stroke="currentColor"`;
  - kreski jako linie środkowe, w kolejności rysowania;
  - portrety w `viewBox="0 0 200 240"`, podpis bez `<text>`;
  - do tego HTML z animacją jako wzór i źródła zdjęć i podpisów.
  - Wymyślone podpisy tylko jako zastępcze. Na stronę trafiają wyłącznie przerysowane ze skanów, z podanym źródłem.
- **Dwie grubości linii w szkicach (00:19, pomysł użytkownika):**
  - grube kontury się rysują;
  - cienkie detale pojawiają się płynnie (przezroczystość, ok. 0,6 s na grupę, kolejno od góry do dołu), startując ok. 0,6 s po konturach;
  - podpis po ok. 1,4 s, całość ok. 2 s.
  - Na okładce słaby szkic w spoczynku to tylko kontury. Po najechaniu kontury się rysują, a detale się pojawiają, w sumie ok. 1 s.
  - Sygnet: tylko kontury.
  - Grubości w CSS (np. 1,8 px kontur i 0,9 px detale, `vector-effect: non-scaling-stroke`).
  - W plikach SVG dwie grupy: `<g id="kontur">` i `<g id="detale">`, bez `stroke-width`.
- **Dwa typy rysunków (00:20).** O typie decyduje rozmiar.
  - **Szkic z detalami** (od ok. 150 px, patron jako „bohater”): okładka strony głównej na komputerze i baner strony działu.
  - **Uproszczony** (patron jako znak lub ikona): sygnet przy tytule podstrony, boczna nawigacja działu, miniatury aktualności bez zdjęcia (72×54), panel menu i menu na telefonie, prawdopodobnie też okładka na telefonie (do rozstrzygnięcia przy projekcie telefonu).
- **Tempo, wersja ostateczna (00:24, ustalenie użytkownika; zastępuje wcześniejsze „podpis po szkicu” i „całość ok. 2 s”):**
  - szkic rysuje się jak w prototypie;
  - podpis rysuje się szybciej i startuje później, tak że **wszystkie animacje kończą się w tym samym momencie**;
  - przykład przy konturze 1,2 s: detale pojawiają się w drugiej połowie, podpis startuje ok. 0,6 s i trwa ok. 0,6 s, całość ok. 1,2 s.
- **Podpisy są prawdziwe, odręczne (ChatGPT znalazł je 2.11):**
  - potrzebne oryginalne skany w najwyższej rozdzielczości i źródło każdego (dokument, gdzie leży skan, kto ma prawa), a dla Marczewskiego sprawdzić, czy podpis to „Marczewski”;
  - wykonanie: wierny obrys podpisu ze skanu (zmienna grubość pióra) odsłaniany przez niewidoczną linię środkową w kolejności pisania (maska);
  - podpis zawsze w osobnym pliku, nie w rysunku.

## CMS: dział przy aktualnościach (2.11, 00:50; do zrobienia później)
- **Stan dziś:** aktualności nie mają pola „dział”. Mają tylko `rodzaj` (ogłoszenie, wydarzenie, sukces, kariera), `dla` (studenci, doktoranci, pracownicy, kandydaci) i `zaklad`. Pole `dzial` ma tylko „Warto wiedzieć”, i to bez Popularyzacji.
- **Do zrobienia:**
  - dodać do aktualności opcjonalne pole „Dział” (Instytut, Nauka, Studia, Popularyzacja) w schemacie `src/content.config.ts` i w formularzu CMS;
  - jeśli pole jest puste, dział liczy się automatycznie: `dla` studenci lub kandydaci daje Studia, `rodzaj` sukces albo wpisany zakład daje Nauka, w pozostałych przypadkach Instytut. Dzięki temu starych wpisów nie trzeba poprawiać;
  - dodać Popularyzację do pola `dzial` w „Warto wiedzieć”.

## Szkice patronów od ChatGPT (2.11, 00:55): wstawione do prototypu (wersja 33)
- **Paczka `szkice-patronow.zip`:** po 3 pliki SVG na patrona (pełny z grupami `kontur` i `detale`, sygnet, podpis z `obrys` i `prowadzaca`), skany podpisów, `demo.html` i `ZRODLA.md`. Pliki spełniają wymagania: same ścieżki, kontur i detale rozdzielone, bez `<text>` i bez `stroke-width`. Kopia jest na gałęzi kopii w `szkice/`.
- **W prototypie:**
  - okładka: słaby kontur w spoczynku, po najechaniu kontur się rysuje (18 kresek, odstęp 45 ms), a detale pojawiają się płynnie;
  - baner działu: to samo, a podpis odsłania się maską z linii prowadzących i kończy razem ze szkicem;
  - podstrony, panel podmenu i miniatury: sygnet; na podstronach podpis statyczny.
  - Z obrysu podpisu Ślebodzińskiego usunięto kropki linii „podpis posiadacza” z dokumentu.
- **Źródła i prawa (z `ZRODLA.md`, do sprawdzenia przed publikacją):**
  - Twarze:
    - Ślebodziński i Steinhaus: zdjęcia z Wikimedia Commons oznaczone jako domena publiczna (PD-Poland);
    - **Marczewski i Knaster: zdjęcia z MacTutor, autor i prawa nieustalone.** Najlepiej oprzeć te szkice na zdjęciach z archiwum Instytutu albo UWr.
  - Podpisy:
    - Marczewski: Nowa Księga Szkocka, t. I, wpis z 7.07.1946 (Biblioteka WMI, zapytać o zgodę);
    - Ślebodziński: legitymacja z 1948 w publikacji „Śląska Republika Uczonych” t. 7 (2016);
    - Knaster (zaświadczenie z 6.08.1946) i Steinhaus (pismo WTN z 23.12.1957): książka J. Dutkiewicz o M. Warmusie (2003, BCPW).
    - Przy każdym potrzebna zgoda wydawcy lub depozytariusza i podanie źródła.

## Zasady nagłówka podstrony: sygnet, podpis i znak (2.11, 01:00–01:19)
- **Sygnet** stoi w lewym marginesie przed tytułem, oddzielony pionową kreską. **Podpis** jest bardzo mały (ok. 56 px szerokości, węższy niż głowa) i stoi pod sygnetem, wyśrodkowany.
- **Nagłówek z hasłem i liczbami** (np. Projekty i granty, Plan zajęć): środek sygnetu wypada na środek pierwszej litery tytułu, a podpis stoi pod sygnetem.
- **Nagłówek bez hasła i liczb** (np. Władze Instytutu): podpis leży mniej więcej na linii bazowej tytułu, a sygnet tuż nad nim.
- **Znak patrona z opisem:**
  - w niskim nagłówku (bez liczb): ok. 145×170 px przy prawej krawędzi kolumny, opis obok;
  - w wyższym nagłówku (z liczbami): większy, w polu 200×200 px, przycięty do własnego rysunku, wysunięty ok. 90 px w prawy margines; opis po lewej stronie znaku, wyrównany do prawej, w kolumnie.
- **Siatka:** tekst w banerze (tytuł, hasło, liczby, opis znaku) trzyma się krawędzi kolumny 1240 px. Poza kolumnę mogą wychodzić tylko grafiki: zdjęcie i kolor (cała szerokość), sygnet z podpisem (lewy margines), znak (prawy margines). Na mniejszych ekranach wracają do kolumny.
- **Opis znaku** to zawsze nazwa twierdzenia i jedno zdanie, niezależnie od ilości miejsca.
- **Ciekawostki** (znak i opis) są tylko na podstronach z menu działu. Na stronach głębiej (pojedyncze seminarium, projekt, aktualność, profil) nagłówek ma tylko sygnet i tytuł. To propozycja, czeka na potwierdzenie.
- **Liczby w Planie zajęć:** na razie obie. Jedną można usunąć, jeśli zabraknie miejsca.
