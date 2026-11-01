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
