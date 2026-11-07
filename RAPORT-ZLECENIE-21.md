# Raport: zlecenie 21 — uwagi z oglądania, część 5 (6.11.2026)

Gałąź: `wyglad/zlecenie-16`. **Zrobione wszystkie punkty GOTOWE, od 1 do 10, i dwie uwagi dodatkowe właściciela.** Ten raport zastępuje wcześniejszy, który mówił o „jedynym punkcie GOTOWE”: zlecenie urosło do 10 punktów w ciągu dnia.

Zlecenie mówi „bez pushowania”, ale właściciel kazał wysłać całość („Po tym zlecenie 21 i push”), więc gałąź jest wysłana, a podgląd przebudowany. Punkty 3, 9 i 10 i tak wymagają zbudowanej strony i prawdziwego telefonu. `main` wszystkich 22 repozytoriów bez zmian. Zlecenia 22 tu nie ma.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Lista Seminaria: podtytuł na karcie kursywą, bez zieleni | `5b30aa4c` |
| 2 | Telefon: kolor nagłówka według zasad paska z komputera | `0c8e36aa` |
| Uwaga dodatkowa | Jasny pasek: kreski pod działami w kolorach działów | `c58938e7` |
| 3 | Telefon: rozpęd zatrzymuje się na krawędzi Szybkiego dostępu | `19772490` |
| Uwaga dodatkowa | Nagłówek przy stopce w jej kolorze | `646dad8a` |
| 4 | Telefon: „Ostatnie sukcesy” w układzie listy Aktualności | `36972ca5` |
| 5 | Panel menu: jedna grubość pisma, bieżącą pozycję oznacza kolor | `30507f14` |
| 6 | Wpis o wydarzeniu w kolorze swojego wiersza na liście | `0d151990` |
| 2, poprawka | `astro check` bez nowego błędu z punktu 2 | `58249970` |
| 7 | Ciekawostki: nazwisko patrona w każdej karcie | `58e45142` |
| 8 | „Na tej stronie” bez paska przewijania | `846df24b` |
| 9 | Telefon: powrót zawsze na górę, okładka do pełnej wysokości okna | `ee9215c3` |
| 10 | Krócej rozmazane zdjęcie okładki | `a0a41461` |
| 9, poprawka | Adres z kotwicą na dotyku zawsze na krawędzi | `4c234da8` |

## Co sprawdza właściciel na telefonie

Wszystkie moje próby na telefonie to emulacja w Chromium. Tego emulacja nie pokazuje:

- **Prawdziwy pasek adresu (punkt 9).** W emulacji go nie ma. Zmiana na `dvh` jest potwierdzona tylko przy zmianie wysokości okna o 56 px.
- **Safari na iPhonie i prawdziwy Android:** rozpęd (punkt 3) i powrót (punkt 9).
- **Gest odświeżania** w ciągu 400 ms od zatrzymania rozpędu (punkt 3).
- **VoiceOver, TalkBack i szukanie na stronie** przy schowanej okładce (punkt 3). Nie docierają do niej, ale jej treść jest też w menu.
- **Odczucie zdjęcia okładki na prawdziwym łączu** (punkt 10).

## Punkt 1. Lista Seminaria: podtytuł na karcie kursywą, bez zieleni

| Warunek | Wynik |
| --- | --- |
| Krój, kursywa, 16 px, grubość 400, `--muted` | Zgodne na każdym podtytule: 9 kart PL i 9 kart EN, jasny i ciemny motyw, 1536 i 390 px. Na opublikowanym podglądzie przy 1536 px też |
| Kursywa prawdziwa, także dla polskich znaków | Przeglądarka rysuje każdy podtytuł krojem `Brygada-1918-Italic`, z pliku strony, bez kroju zapasowego. Dotyczy też „Od danych do wniosków” i „Jak uczyć matematyki i o niej mówić”. Po polsku ładuje się plik kursywy ze znakami rozszerzonymi, w którym jest „ś” |
| Przesunięcie elementów pod podtytułem | Najwyżej 1,0 px w karcie (0,9 px różnicy linii i zaokrąglenie pomiaru). Linia 20,8 px. Każdy podtytuł ma jedną linię, przed i po |
| Kontrast na tle karty, co najmniej 4,5:1 | 5,34 w jasnym, 6,14 w ciemnym, tyle samo co w artefakcie. Po najechaniu na kartę (tło `--d-t`): 5,37 i 5,01 |
| `git diff` tylko wskazana reguła | Tak, 1 wiersz w `src/styles/zal-tresc.css` |
| `astro check` | 6 błędów, tyle samo co przed zleceniem, żaden nowy |
| `npm run build` | Przeszedł w przebiegu Web-Podglad 42209881498, krok „Budowanie strony”. Lokalnie nie uruchamiałem, bo przy działających serwerach dev psuje on wyspy React (tabela na `/pracownicy`) |
| Zrzuty przed i po | `raport-zrzuty/z21-seminaria-*`: PL 1536 i 390 px w obu motywach, EN 1536 px w jasnym |

Reszta karty bez zmian: krój, rozmiar, kolor, grubość i styl nazwy zakładu, tytułu, „Brak zapowiedzianych referatów” i „Prowadzą” są takie same przed i po. Kolor tytułu po najechaniu też.

**Opublikowany podgląd** (nowa wersja od 12:29:57): 14 adresów, w tym `/seminaria/` i `/en/seminaria/`, przy 390, 360 i 1536 px, bez błędów JS i HTTP, bez przewijania w poziomie.

## Punkt 2. Telefon: kolor nagłówka według zasad paska komputera

Pomiar: 390 px, 7 rodzajów stron, PL i EN, oba motywy (`raport-zrzuty/z21-pasek-*`).

| Położenie | Stan | Tło | Rozmycie |
| --- | --- | --- | --- |
| Góra strony | bez klasy | granat `13,24,48`, napisy białe | brak |
| Nad banerem | `przewiniety` | granat α 0,40, 0,45 lub 0,60, napisy białe | `blur(14px) saturate(1.1)` |
| Treść, jasny motyw | `przewiniety jasny` | `252,250,246` α 0,95 | `blur(8px)` |
| Treść, ciemny motyw | `przewiniety jasny` | `24,36,59` α 0,95 | `blur(8px)` |
| Dół strony, widać stopkę | `przewiniety przy-stopce` | pełny granat `13,24,48`, napisy białe | brak |
| Główna, okładka | bez klasy | granat | brak |
| Główna, od krawędzi Szybkiego dostępu w dół, też przy stopce | `jasny po-okladce` | jasny | `blur(8px)` |

- Kontrast białego nad banerem: najmniej 6,48:1 (10 stron, oba motywy).
- Miganie jasnej klatki po wejściu: 0 na 7 stronach na serwerze dev; wynik z opublikowanej wersji niżej.
- Panel menu: ciemny przy ciemnym pasku, jasny przy jasnym, szerokości 335 i 275 px, bez przewijania w poziomie.
- `/powiadomienia` przewija się tylko w niskim oknie (420 px), więc nad 780 px zostaje w stanie z góry strony.

## Uwagi dodatkowe właściciela

- **Podkreślenia działów w jasnym nagłówku (`c58938e7`).** Były czarne, są w jasnym kolorze działu `--d-j`. Porównałem z `--d-a` i `--d-g` na montażu.
- **Nagłówek przy stopce (`646dad8a`).** Gdy widać stopkę, nagłówek jest ciemny jak ona (przy `top` stopki 804 jasny, przy 729 granatowy). Strona główna bez zmian. Zmienia to wiersz „nad stopką” z punktu 2. Właściciel nie wskazał urządzenia, a telefon i komputer mają wspólne reguły, więc działa na obu. Łatwo ograniczyć do jednego.

## Punkt 3. Telefon: rozpęd zatrzymuje się na krawędzi Szybkiego dostępu

Emulacja Pixel 7 (412×839), prawdziwe zdarzenia dotyku przez CDP. Machnięcia z +1000 px i ze stopki oraz pozostałe sytuacje powtórzone po punkcie 9, wyniki te same.

| Próba | Przed | Po |
| --- | --- | --- |
| Machnięcie w górę z +30, +120, +300, +600 px | zwykle okładka | krawędź, 3 z 3 przy każdym |
| Z +1000 px i ze stopki, 720 px przy 12000 px/s | zwykle okładka | krawędź; czasem +301 px, czyli sam ruch palca, bez rozpędu w emulatorze. Okładki nigdy |
| Następny ruch po chwili | | okładka |
| Z okładki w dół: −120, −200, −500 px | | krawędź |
| Z krawędzi w dół | | swobodnie (+485, +1006) |
| Dwa machnięcia co 131–155 ms | | krawędź, 3 z 3 |
| Powolny palec z +100, +300 | | krawędź |
| Obrót i niższe okno | | położenie zostaje (y 0 i y 500), bez fałszywego skoku z `ResizeObserver` |
| Strzałka | | krawędź, okładka schowana |
| Link na krawędzi | | położenie 122,3 px bez zmian, przechodzi na stronę |
| Przytrzymanie palca | | 61 px ×10, bez skoku |
| Panel otwarty na krawędzi | | okładka w układzie, pasek zostaje jasny, po zamknięciu schowana |
| Komputer: kółko 800, 872, 800, 0; PageDown 800, PageUp 0 | | bez zmian, klasa nigdy nie pada |

„Wstecz” i odświeżenie z punktu 3 (300 → 300) zastąpił punkt 9.

**Czego emulacja nie sprawdza.** To tylko Chromium. Safari na iPhonie i prawdziwy Android sprawdza właściciel na swoim telefonie. Na telefonie trzeba też sprawdzić: gest odświeżania w ciągu 400 ms od zatrzymania, gesty VoiceOver i TalkBack oraz szukanie na stronie. Te ostatnie nie docierają do schowanej okładki, ale jej treść jest też w menu.

## Punkt 4. Telefon, Instytut: „Ostatnie sukcesy” w układzie listy Aktualności

| Miara | Przed | Po |
| --- | --- | --- |
| Sekcja przy 390 px, PL | 1400 px | 674 px |
| Sekcja przy 390 px, EN | 1379 px | 654 px |
| Sekcja przy 320 px, PL | 1333 px | 768 px |
| Sekcja przy 320 px, EN | | 721 px |
| Zdjęcia, DPR 1 / 2 / 3 | 35,7 / 71,3 / 112,7 KB | 3,9 / 8,8 / 16,0 KB |
| Zdjęcia, 320 px, DPR 2 | 55,6 KB | 8,8 KB |

- Te same 3 wpisy w tej samej kolejności. Miary wiersza równe Aktualnościom: 54 + 292 px, odstęp 13 px, pisma 28, 12, 18,5 i 15 px.
- Stuknięcie w miniaturę prowadzi tam co tytuł.
- Sygnet 32,4×38,9 mieści się w polu 54×54 (`z21-sukcesy-sygnet-390.png`, dzisiejsze wpisy mają zdjęcia, więc do zrzutu wstawiłem kopię).
- Komputer: 14 z 72 zrzutów różni się od stanu sprzed zmiany, wszystkie w miejscach szumu pomiaru, żaden w tej sekcji. Te same pliki zdjęć według `sizes`.
- Zrzuty: `z21-sukcesy-*`.

## Punkt 5. Panel menu: jedna grubość, bieżącą pozycję oznacza kolor

- Telefon 390 i 320 px, `/aktualnosci`, wpis, `/nauka`, `/instytut/wladze`, `/`, EN: nazwy działów i linki 500, odstęp nazw −0,24 px, bieżący link w kolorze działu, też 500.
- Komputer 1536 px: −0,2996 i −0,3096 px, czyli −0,01em przy dwóch rozmiarach pisma.
- Bieżące Aktualności i News: kreska 26×2 px na telefonie, 33×2 px na komputerze, nigdzie indziej.
- Panel 1920×1080 i 1366×640: bez przewijania (1080/1080, 640/640), także po rozwinięciu każdego działu, na `/nauka`, `/aktualnosci`, `/en/aktualnosci`.
- Panel jasny: kolor `--d-a`, kreska `currentColor` (`19,28,49`, Nauka `3,115,74`), w ciemnym motywie tak samo.
- Komputer zmienia się tu zgodnie ze zleceniem. Zrzuty: `z21-menu-*`.

## Punkt 6. Wpis o wydarzeniu: kolor działu jak w wierszu listy

- 9 wydarzeń, oba motywy: etykieta i data mają kolor wiersza z listy we wszystkich (próbki na `z21-wydarzenie-*`).
- Kontrast w jasnym: etykieta 5,67 Nauka i 6,45 Popularyzacja, data 5,24 i 5,96, linki 5,67 i 6,45. W ciemnym: etykieta 8,7 i 8,04, data 7,61 i 7,04, linki 8,7 i 8,04.
- Porównanie stylów ze zdjętym `data-dzial` i klasą, razem z pseudoelementami: zmieniają się tylko `.akt-meta`, jej pierwszy `span`, `.akt-wyd-data`, linki w `.prose` i to, co w nich.
- Inne rodzaje wpisów (138 sukcesów, 11 karier, próbka ogłoszeń): bez `data-dzial` i bez klasy. Wiersz najbliższych wydarzeń ma własny `data-dzial`, bez działu zostaje neutralny.
- Komputer: 31 z 72 zrzutów różni się, wszystkie to panele (punkt 5), wpis o wydarzeniu albo szum.

**Dwa odstępstwa od litery zlecenia, efekt ten sam:**

1. Etykieta i data nie dostają koloru „same”. Samo `data-dzial` zabarwiłoby też nagłówki treści, punktory, cytat, załączniki, „Nowszy/Starszy” i `--accent`. Dlatego pod `.akt-wydarzenie` zmienne wracają do neutralnych, a kolor działu dostają tylko te trzy cele. Reguła po najechaniu rozszerzona, żeby podkreślenie zostało.
2. Reguła `.akt-wyd-data.minione` i klasa zostały dla innych rodzajów wpisów. `2026-09-20-kurs-dla-studentow-pierwszego-roku` to ogłoszenie z minioną datą i ma wyglądać jak dotąd.

## Punkt 7. Ciekawostki: nazwisko patrona w każdej karcie

- 153 pola, 76 kart, identyfikatory bez zmian. `praca-na-glos` nadal ukryta. Najdłuższe `zdanie` ma 115 znaków.
- `skrypty/sprawdz_tresci.py` sprawdza nazwiska, tylko gdy uruchomiony bez argumentów: „OK — sprawdzono 555 plików i 106 ciekawostek”, kod 0.
- Próba na `jedenastu-doktorow`: błędy PL i EN, kod 1, plik przywrócony, próba bez commita.
- `git diff --stat`: tylko 4 pliki JSON, `README.md` i skrypt. Przy zestawie wylosowanym na stałe w `im-ciek-zestaw` działa tak samo.
- Zrzuty 7 kart PL i EN (`z21-ciekawostki-*`): tytuł w 1 linii, zdanie w 3, wszystko w nagłówku.
- Sprawdzenie faktów zostaje na liście właściciela.

## Punkt 8. „Na tej stronie”: bez paska przewijania

**Odtworzyłem to na Windows,** dopiero z prawdziwą skalą ekranu i widocznym paskiem. Pierwsza moja tabela pokazała 0 pasków, bo Playwright domyślnie chowa paski i tylko emuluje skalę.

| Miara | Przed | Po |
| --- | --- | --- |
| Wiersze tabeli z widocznym paskiem (9 stron, 3 skale, 2 okna) | 12 z 54 | 0 z 54 |
| Sprawa właściciela: skala 1,25, 1538×731, `/studia/matematyka`, dół strony, „Akty prawne” | 367/367, szerokość 236/221 | 367/367, szerokość 236/236 |
| Pasek w czasie, od skoku na dół | od ok. 256 ms do końca próby (1,5 s) | 0 klatek |

- Przyczyna: znacznik bieżącej pozycji wystaje poza listę o 0,1–0,5 px (`/studia/matematyka` 0,1 px, `/nauka/konferencje` 491/490), to wystarcza, żeby pojawił się pasek.
- Niskie okno 1366×640, `/studia/pierwszy-rok`: lista 647/528, kółko przesuwa listę do 118 px, strona stoi, paska nie ma.
- `/studia/pierwszy-rok` przy 1536×730 naprawdę się nie mieści (646/616, 18 pozycji): przewija się dalej, bez paska.
- Zrzuty: `z21-spis-konferencje-dol-strony-przed.png` z ostatniej opublikowanej wersji (pasek 15 px widać), `-po.png` z poprawką, `z21-spis-niskie-okno-1366x640.png`. Przy `/studia/matematyka` na tamtej wersji w tej próbie paska nie było, ale był na serwerze dev, więc dowodem jest tabela. Zrzut `z21-spis-matematyka-dol-strony-po.png` pokazuje stan po.

## Punkt 9. Telefon, strona główna: powrót zawsze na górę, bez białego paska

Emulacja Pixel 7, 412×839, prawdziwe stuknięcia. Wszystkie wiersze PL i EN.

| Wejście | `scrollY` | Okładka | Szybki dostęp od (okno 839) | Przelot w klatkach |
| --- | --- | --- | --- | --- |
| „Wstecz” z krawędzi, po linku z Szybkiego dostępu | 0 | widoczna | 839 | 0 |
| „Wstecz” z głębi strony (+1000 px) | 0 | widoczna | 839 | 0 |
| Pamięć przeglądarki: prawdziwy powrót, `pageshow` z `persisted` = true | 0 | widoczna | 839 | 0 |
| Odświeżenie z głębi strony | 0 | widoczna | 839 | |
| Nazwa Instytutu, z podstrony | 0 | widoczna | 839 | 0 |
| Nazwa Instytutu, na głównej z głębi | 0 | widoczna | 839 | |
| „← Strona główna” (`/studia`, `/en/studia`) | 0 | widoczna | 839 | 0 |
| Logo UWr i „wstecz” | 0 | widoczna | 839 | 0 |
| „Wstecz” z `#szybki-dostep` na adres bez kotwicy, ten sam dokument | 0 | widoczna | 839 | |

- **Logo na telefonie prowadzi na uwr.edu.pl, nie na stronę główną** (`Naglowek.astro`), więc samo w sobie nie wraca na górę. Sprawdziłem powrót „wstecz” z tamtej strony, z odpowiedzią podstawioną zamiast sieci.
- „Przelot” liczy klatki po powrocie, w których strona stała niżej niż 12 px albo okładka była schowana. Próbki `requestAnimationFrame` od pierwszej klatki.
- Komputer bez zmian: `history.scrollRestoration` = `auto`, „wstecz” z 852 i 892 px wraca tam samo jak na starej wersji.

**Wysokość okna ±56 px, `scrollY` = 0:**

| Okno | Okładka | Szybki dostęp od | Zdjęcie | Tytuł |
| --- | --- | --- | --- | --- |
| 839 | 778 | 839 | −6 do 476 | 372 |
| 783 | 722 | 783 | −18 do 430 | 316 |
| 895 | 834 | 895 | 5 do 523 | 428 |

Na krawędzi Szybkiego dostępu przy tych samych zmianach: 61 px, 61 px, 61 px, bez skoku. Powiększanie okna na okładce nie daje żadnego zdarzenia `scroll`. Zrzuty: `z21-powrot-*`.

**Prawdziwy pasek adresu właściciel sprawdza na swoim telefonie.** W emulacji go nie ma, więc zmiana na `dvh` jest potwierdzona tylko przy zmianie wysokości okna.

**Punkt 3 po tej zmianie:** rozpęd i pozostałe sytuacje bez zmian (`z21-rozped2`, `z21-okl`). Adres `#szybki-dostep` niżej.

**Adres z `#szybki-dostep`: znalazłem i naprawiłem własny błąd (`4c234da8`).** Opublikowana wersja po `a0a41461` przy animacji wejścia kończyła 2 z 8 wejść na okładce i 2 z 8 po 11 px za krawędzią. Stara wersja: 8 z 8 na krawędzi, raz o 12 px dalej. Przy `prefers-reduced-motion` zawsze było dobrze, więc winna jest animacja wejścia razem ze scroll-snap. Takie wejście na dotyku idzie teraz bez animacji.

| Próba na opublikowanej `4c234da8` | Wynik |
| --- | --- |
| Wejście na `/#szybki-dostep` i `/en/#szybki-dostep`, animacja włączona i wyłączona | krawędź, 16 z 16 |
| Odświeżenie na tym adresie | krawędź. Stara wersja wracała tu na okładkę |
| „Wstecz” z podstrony, gdy strona stała +200 px, bez pamięci przeglądarki | +200 px, 4 z 4 |
| To samo z +800 px | ok. 10 px za krawędzią, 4 z 4, nie wraca na miejsce (patrz „Do wiadomości”) |
| Zmiana adresu na `#szybki-dostep` i na `#okladka` | krawędź i okładka |

Świadomie zostawione: wąskie okno na komputerze (bez dotyku) działa jak dotąd, bo cała ta logika jest w części dotykowej. Telefon obrócony szerzej niż 760 px liczy się jak dotąd, czyli odtwarza położenie.

## Punkt 10. Okładka strony głównej: krócej rozmazane zdjęcie

Zmiany: `<link rel="preload">` AVIF w nagłówku strony głównej (`ZdjeciePreload.astro`), opcja `szybkieWejscie` w `ZdjecieZ` tylko dla okładki. `rozmiarOkl` i wyliczanie szerokości przeniesione do `src/lib/zdjecia.ts`, żeby link i `<source>` brały je z jednego miejsca.

**Czas od początku wejścia do ostrego zdjęcia.** Opublikowany podgląd, stara wersja `68fa6265` i nowa `a0a41461`, Chrome na Windows, łącze ograniczane przez CDP (50 Mb/s z opóźnieniem 20 ms, 10 Mb/s z 40 ms). Dwie miary, bo mówią co innego:

- **Pełne krycie:** kiedy pełne zdjęcie ma krycie 1, mediana z 5 wejść, próbka w każdej klatce `requestAnimationFrame`.
- **Klatki:** `Page.startScreencast`, pierwsza klatka, od której pole zdjęcia ma co najmniej 90% końcowej ostrości, 1 nagranie. Miara ostrości nie zależy od wygaszenia całej strony.

| Okno | Wejście | Pełne krycie, ms | Klatki, ms | Klatki w trakcie przejścia | Przejście po zmianie |
| --- | --- | --- | --- | --- | --- |
| 1920×940 | ponowne | 150 → 150 | 307 → 283 | 0 → 0 | brak |
| 1920×940 | pierwsze, 50 Mb/s | **629 → 289** | **430 → 374** | 2 → 0 | brak |
| 1920×940 | pierwsze, 10 Mb/s | 1161 → 1226 | 937 → 1013 | 1 → 3 | 0,35 s |
| Telefon 412×839 | ponowne | 122 → 120 | 432 → 480 | 5 → 5 | brak |
| Telefon 412×839 | pierwsze, 50 Mb/s | **571 → 234** | 597 → 577 | 18 → 6 | brak |
| Telefon 412×839 | pierwsze, 10 Mb/s | 1120 → 1158 | 1144 → 1171 | 18 → 19 | 0,35 s |

Co z tego wynika:

- **Zysk jest przy pierwszym wejściu na dobrym łączu.** Pełne zdjęcie ma krycie 1 o ok. 0,34 s wcześniej i wchodzi od razu, bez przejścia.
- **Rozmyta wersja przy 50 Mb/s nie znika całkiem.** Plik przychodzi po ok. 0,29 s, a pierwsza klatka strony bywa wcześniej (`z21-okladka-klatki-1920-50mbs.png`, rozmycie do ok. 370 ms). Właściciel może to dalej zobaczyć przy pierwszym wejściu.
- **Ponowne wejście: nie powtórzyłem zysku z próby na Linuksie** (tam 0,6 → 0,3 s). Na Windows zdjęcie było gotowe już przy pierwszej klatce strony, także przed zmianą. Różnice 24–48 ms to jedno nagranie, mieszczą się w rozrzucie.
- **10 Mb/s bez zysku, a nawet 40–80 ms później.** Zlecenie przewidywało brak zysku. Prawdopodobna przyczyna opóźnienia to dekodowanie `sync` w wątku głównym; tego nie mierzyłem osobno.
- **Na telefonie klatki prawie się nie zmieniają.** Całą stronę przez ok. 0,4 s wprowadza animacja wejścia z `przejscia.css`, więc to ona, nie zdjęcie, wyznacza czas (`z21-okladka-klatki-telefon-*.png`). Zlecenie jej nie obejmuje, nie ruszałem. Patrz „Do decyzji”.

**Odbiór:**

| Warunek | Wynik |
| --- | --- |
| Zdjęcie pobrane raz przy każdym wejściu | Tak: 8 kombinacji okna i języka, po 1 pobraniu `kampus-zmierzch` przy pierwszym wejściu, przy ponownym 1 z pamięci przeglądarki |
| Ten sam plik co dziś | Tak: 1920×940 i 412×839 `…JpHV6.avif`, 1536×730 `…ZNNYyM.avif`, 390×664 `…JpHV6.avif`, identycznie przed i po, PL i EN. Przy 390×664 i 412×839 to ten sam plik co przy 1920×940, bo wymiar liczy się z wysokości i gęstości ekranu. Żadnej nowej wersji pliku |
| `imagesrcset` i `imagesizes` równe `<source type="image/avif">` | Tak, porównanie napisów na opublikowanej stronie, PL i EN. Link stoi przed arkuszami stylów |
| Bez JavaScriptu | Krycie 1 od razu, 1 pobranie, przy wszystkich 4 oknach |
| `prefers-reduced-motion` | 0 klatek z kryciem pośrednim, przejście 0 s, jak przed zmianą |
| Kadr i układ okładki (`ULOZ`) | Położenia zdjęcia, rozmytej wersji i tytułu co do 0,1 px równe staremu podglądowi, 4 okna, PL i EN. 1 położenie przez całe wczytywanie, czyli bez skoku |
| 2 Mb/s | Najpierw rozmyta wersja, potem 16 klatek krycia od 0,18 do 0,99, przejście 0,35 s. Czas jak przed zmianą (`z21-okladka-klatki-*-2mbs.png`) |
| Pozostałe strony | 12 adresów: 0 linków `preload` obrazu, banery z `decoding="async"` i dotychczasowym `onload` |

Pomiar „przed” zrobiłem na starej wersji tuż przed pushem. Nagrania klatek są w `raport-zrzuty/z21-okladka-klatki-*.png`.

## Budowanie i podgląd

| Warunek | Wynik |
| --- | --- |
| `astro check` | 6 błędów, tyle samo co przed zleceniem. Moja zmiana z punktu 2 dodała 2 (nazwa `hdr` w `pasek.ts` i `menu.ts`). Zauważyłem to po commicie punktu 6 i naprawiłem osobnym commitem `58249970` |
| `npm run build` | Przeszedł w przebiegach Web-Podglad 42226417017 (`a0a41461`) i 42235208419 (`4c234da8`). Lokalnie nie uruchamiałem, bo przy działających serwerach dev psuje on wyspy React na `/pracownicy` |
| `skrypty/pobierz_tresci.py` | Nie uruchamiany |
| `main` 22 repozytoriów | Bez zmian względem `main-przed` |
| Opublikowany podgląd, `4c234da8` | Nowa wersja od 15:41. 42 adresy przy 390, 360 i 1536 px: bez błędów JS i HTTP, bez przewijania w poziomie |
| Miganie jasnej klatki paska na telefonie, zbudowana strona | 0 klatek na 7 stronach |
| Rozpęd na zbudowanej stronie, 8 prób z +1000 px i 8 ze stopki | krawędź, raz +301 px (sam ruch palca), okładki nigdy |
| Powrót „wstecz” na zbudowanej stronie | 18 z 18 wierszy tabeli punktu 9; prawdziwa pamięć przeglądarki użyta w 5 z nich |

**Komputer, zrzuty piksel po pikselu (72 zrzuty przy 1536 px).** Próba kontrolna na tym samym kodzie dała 12 z 72 różnic w tych samych miejscach: zdjęcia do 3 poziomów na 255, miniatury i szkic banera do 26, więc to szum. Punkty 7–10 względem punktu 6: 11 z 72. 4 zrzuty Seminariów to nowy tekst ciekawostki z punktu 7 (obejrzane), reszta to szum w tych samych miejscach co w próbie kontrolnej. Zmiany na komputerze są zgodne ze zleceniem: panel menu (punkt 5), wpis o wydarzeniu (punkt 6), nagłówek przy stopce, ciekawostki, pasek spisu.

## Do decyzji właściciela

1. **Animacja wejścia strony na telefonie.** To ona trzyma cały pierwszy ekran wygaszony przez ok. 0,4 s, więc na telefonie punkt 10 prawie nie skraca czasu do ostrego obrazu w klatkach. Bez niej obraz byłby pełny wcześniej, ale znika efekt wejścia. Nie zmieniałem, zlecenie jej nie obejmuje.
2. **Nagłówek przy stopce działa też na telefonie,** bo reguły są wspólne, a uwaga nie wskazała urządzenia. Łatwo ograniczyć do komputera.

## Do wiadomości, nic nie zmieniałem

1. **Przesunięcia sumują się w dół strony.** W karcie to 0,9 px, ale każdy kolejny rząd kart jest o tyle wyżej. Lista jest krótsza o 3 px na komputerze i o 8 px na telefonie. Nie widać tego i mieści się w odbiorze, który mówi o elementach pod podtytułem.
2. **Dwie kursywy obok siebie.** Tuż pod podtytułem stoi „Brak zapowiedzianych referatów”, też kursywą, ale innym krojem. Lokalnie jest tak na wszystkich 9 kartach. Manrope nie ma w projekcie pliku kursywy, więc tę linię pochyla przeglądarka. Artefakt uprzedzał o tym sąsiedztwie, a zlecenie każe tej linii nie ruszać. Gdy pojawią się zapowiedziane referaty, sąsiedztwo zniknie na ich kartach.
3. **Adres z kotwicą, powrót z głębi strony.** Gdy ktoś wejdzie na `/#szybki-dostep`, zjedzie o 800 px, otworzy link i wróci „wstecz”, a przeglądarka nie użyje pamięci, strona staje ok. 10 px za krawędzią, a nie w poprzednim miejscu. Przy +200 px wraca dokładnie. Żaden link na stronie nie prowadzi na ten adres (strzałka obsługiwana jest skryptem), więc to rzadkie. Starej wersji już nie porównam, podgląd jest przebudowany.
4. **Przy zwykłym wczytaniu strony głównej na telefonie** przez ok. 200 ms początek Szybkiego dostępu stoi 3–11 px nad dolną krawędzią okna (828–836 przy oknie 839), bo animacja wejścia przesuwa treść o 12 px. Stara wersja zachowuje się tak samo (832–841). Po animacji jest 839. Gdyby właściciel dalej widział krótki biały błysk na dole, to jest to, a nie to, co naprawił punkt 9.
5. **Logo UWr na telefonie prowadzi na uwr.edu.pl,** nie na stronę główną. Zlecenie wymienia logo wśród dróg powrotu; sprawdziłem powrót „wstecz” z tamtej strony. Zmiana celu logo to osobna decyzja.
6. **`/studia/kalendarz-zajec` ma dziś baner,** choć zlecenie (punkt 2) wymienia tę stronę jako bez banera. Skrypt paska kieruje się samą obecnością banera, więc działa poprawnie.
7. **Sukcesy po angielsku (punkt 4):** „Aug 2026” i „May 2026” łamią się na dwie linie w kolumnie 54 px. Ten sam styl co lista Aktualności na telefonie.
8. **Znacznik w „Na tej stronie”:** `.z-spis-lista li { margin: 0 }` kasuje `margin-left: -2px` znacznika, więc stoi na prawo od linii, bez 2 px wysunięcia w lewo. Tak było przed punktem 8 i jest po nim.
9. **Emulator a pamięć przeglądarki:** po powrocie z pamięci Chromium w emulacji zgłasza `hover: none` jako fałsz, przez co okładka wraca na adresie z kotwicą. Na prawdziwym telefonie to się nie zdarza; na adresie bez kotwicy i tak wraca się na okładkę.
10. **GitHub Pages:** po pierwszej przebudowie publikacja zgłosiła sukces, a strona serwowała starą wersję jeszcze po 37 minutach. Pomogło ponowne uruchomienie samego kroku publikacji w przebiegu 42226417017. Druga przebudowa weszła po 77 s.
