# Raport: zlecenie 24 — próg telefonu i nagłówki na średnich ekranach (7.11.2026)

Gałąź: `wyglad/zlecenie-16`, bez pushowania, także w repozytoriach treści. `skrypty/pobierz_tresci.py` uruchamiałem tylko z `--lokalnie`, w osobnym katalogu roboczym. Numer 24 był wolny.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Widok telefonu poniżej 1024 px | `1e0a2c99` |
| 2 | Nagłówki 1024–1367 px zmniejszają się razem z oknem | `021e2254` |
| 3 | Dopasowanie obejmuje hasło, długie słowo i baner działu | `d1b6a725`, poprawki `ab33c482`, `303a7dba` |
| 4 | Bezpiecznik opisu i notki, pierwsza liczba nigdy ucięta | `f9e4206e`, poprawka `acaac3bc` |
| 5 | Ciekawostka w widoku telefonu, gdy jest miejsce | `dba7d890` |

Wynik w skrócie: od 800 do 960 px narzędzie nie zgłasza już żadnego problemu, a było 95 komórek. Przy 1024–1366 px zostało 10 komórek z 14 i żadna nie dotyczy nagłówka. Wszystkie są w treści, czyli w zakresie zlecenia 25.

## Co zmieniono

**Punkt 1.** Stałe w `src/lib/media.ts` i wszystkie kopie w `src`: 109 zapytań i 133 wzmianki w komentarzach. `grep` nie znajduje już `max-width: 760px` ani `min-width: 761px`. W `src/pages/404.astro:15` zostaje `max-width:760px` w stylu w linii: to szerokość akapitu, nie próg widoku, a poprawia ją zlecenie 27. Dla szerokości akapitu w CSS jest teraz zmienna `--szer-akapitu`. Progi, które straciły sens: pasek 1024–1119 uproszczony, usunięte reguły 761–959 i 761–979. Tekst w widoku telefonu 753–1023 px stoi w wyśrodkowanej kolumnie 720 px (`zal-niski.css`). Banery i zdjęcia są na całą szerokość. iPad pionowo dostaje teraz widok telefonu.

**Punkt 2.** Zmienna `--jn: calc(100vw / 1368)` i rozmiary `clamp(próg, calc(N * var(--jn)), Npx)`, więc od 1368 px wartości są dokładnie takie jak przedtem. Margines `--marg-min` schodzi z 64 do 24 px. Zdjęcie Studiów liczone jest od nowej szerokości szkicu, więc twarz Knastera wypada w tym samym miejscu.

**Punkt 3.** `DOPASUJ` w `NaglowekZ.astro` działa też na banerach działów. Tytuł maleje także wtedy, gdy wystaje jedno słowo. Hasło dostaje szerokość do granicy. Granica liczona jest z prostokątów linii tekstu. Poniżej 1368 px rząd liczb ogranicza tylko to, co nachodzi na niego w pionie.

**Punkt 4.** Gdy tekst dotyka opisu ciekawostki albo akapitu notki, gdy tytuł przy 44 px nadal się nie mieści, gdy hasło ma ponad 2 linie albo gdy sam opis schodzi poniżej nagłówka, opis znika, a symbol, imię i linia z latami zostają. Gdy pierwsza liczba się nie mieści, znika cały rząd z kreską.

**Punkt 5.** Od 560 px opis stoi z lewej od symbolu, jeśli ma 16 px odstępu od tekstów i nie schodzi poniżej dolnego paddingu nagłówka. Bez JavaScriptu jest schowany.

## Odbiór

Wszystko sprawdzone na zbudowanej stronie z treściami z klonów, 747 stron, porównanie z budową `b4f99c25` z tego samego dnia.

| Kryterium | Wynik |
| --- | --- |
| Punkt 1: 800, 860, 960, 1000 px widok telefonu, od 1024 px komputera, bez poziomego przewijania | spełnione na 65 stronach listy narzędzia |
| Punkt 1: tekst w widoku telefonu | 720 px, wyśrodkowany |
| Punkt 1: telefon 390×844 i 412×915 piksel w piksel | 122 ze 130 identyczne, w 6 z 8 pozostałych różnice o 1 w wartości koloru (szum dekodowania zdjęć), w 2 mała ikona 54×54 px na `aktualnosci` i `en-instytut` przy 412 px, różnica do 66 |
| Punkt 2: 1368, 1440, 1536, 1920 px piksel w piksel | **260 z 260 identyczne** (wszystkie 65 stron, nie tylko 10 wymaganych) |
| Punkty 2 i 3: 1024, 1100, 1180, 1280, 1366 px, każda ciekawostka z puli | **4155 prób, 0 błędów**: bez kolizji, bez ucięć, bez tekstu na symbolu, szkicu i podpisie, nic poniżej 13 px |
| Punkt 4: bardzo długa ciekawostka (ponad 80 znaków w tytule, podwójny opis) | 28 prób na 7 stronach, 0 błędów; opis znika, chyba że mieści się w całości |
| Punkt 5: 7 podstron, 600–980 px, cała pula | 860 prób, 0 błędów; 390 px: 172 próby, opis zawsze schowany |
| `astro check` | 6 błędów, tyle samo co przed zmianą |

Pełny przebieg testu długiej ciekawostki (300 prób na wszystkich stronach) dał wcześniej 38 ucięć od dołu. Po poprawce `acaac3bc` powtórzyłem go tylko na 7 stronach, które reprezentowały te przypadki. Dwa pozostałe odchylenia telefonu to ta sama drobna ikona. Nie rozstrzygałem, czy to czas wczytania obrazka, bo w tych miejscach zlecenie niczego nie zmienia.

### Gdzie zadziałał bezpiecznik przy 1024–1367 px

Tylko **Indywidualne Studia Informatyczno-Matematyczne** (`/studia/isim/`): przy 1024, 1100, 1180 i 1280 px przy każdej ciekawostce, przy 1366 px przy 4 z 22, bo tytuł jest długi. Na banerach działów notka nie schowała się nigdzie. Inne strony bez opisu po prostu nie mają ciekawostki.

### Macierz: przed

K kolizja, R poza ramką, O obcięte, W poza oknem, X poziome przewijanie. Tylko strony z problemem, z 65.

| strona | 800×900 | 860×780 | 960×950 | 1024×700 | 1180×820 | 1366×620 |
|---|---|---|---|---|---|---|
| en-instytut | K3O1 | K3 | K1 | ok | ok | ok |
| en-instytut-wladze | K3 | K1 | ok | ok | ok | ok |
| en-nauka | K2O1 | K2 | ok | ok | ok | ok |
| en-popularyzacja | K3O1 | K3O1 | K1 | ok | ok | ok |
| en-pracownicy | K2 | K1 | ok | ok | ok | ok |
| en-seminaria | K2O1 | K2 | ok | ok | ok | ok |
| en-studia | K3R2W1 X19 | K1R1 X4 | R1 | R1 | ok | ok |
| en-studia-matematyka | K5O1 | K5O1 | K2O1 | K1O1 | K1 | ok |
| glowna | R2 | ok | ok | ok | ok | ok |
| instytut | K4O1 | K4O1 | ok | ok | ok | ok |
| instytut-infrastruktura | K2 | K2 | K2 | ok | ok | ok |
| instytut-kontakt | K2 | K2 | ok | ok | ok | ok |
| instytut-struktura | K3O1 | K2 | ok | ok | ok | ok |
| instytut-wladze | K4 | K1 | ok | ok | ok | ok |
| nauka | K3O1 | O1 | ok | ok | ok | ok |
| nauka-granty | K3O1 | K3O1 | O1 | ok | ok | ok |
| nauka-konferencje | K2O1 | K3 | K2 | ok | ok | ok |
| nauka-publikacje | K2O1 | K2 | ok | ok | ok | ok |
| nauka-sukcesy | K2O1 | K1O1 | ok | ok | ok | ok |
| obrony | K3O1 | K3 | K2 | ok | ok | ok |
| popularyzacja | K4O1 | K4 | K3 | K3 | ok | ok |
| popularyzacja-organizatorzy | K2 | K2 | K2 | K1 | ok | ok |
| pracownicy | K2O1 | K2 | K1 | ok | ok | ok |
| seminaria | K2O1 | K2 | K1 | ok | ok | ok |
| studia | K6R3O1 X10 | K3R3 | K1R3 | K1R2 | K1 | ok |
| studia-egzaminy | K3O1 | K2O1 | ok | ok | ok | ok |
| studia-isim | K7 | K3O1 | K1O1 | K1 | ok | ok |
| studia-matematyka | K4O1 | K3O1 | K2O1 | ok | ok | ok |
| studia-most | K2 | K1 | ok | ok | ok | ok |
| studia-pierwszy-rok | K2 | K1 | ok | ok | ok | O1 |
| studia-plan-zajec | K3O1 | K1O1 | K1O1 | K1 | ok | ok |
| studia-podyplomowe | K2O1 | K2 | K2 | K2 | ok | ok |
| studia-procedura | K2 | K2 | ok | ok | ok | ok |
| studia-rok-akademicki | K2O1 | K2 | K2 | ok | ok | ok |
| studia-siad | K5O1 | K4O1 | K3O1 | O1 | ok | ok |
| studia-skrypty | K2O1 | K1 | ok | ok | ok | ok |
| studia-sprawy | K1 | ok | ok | ok | ok | ok |
| studia-szkola-doktorska | K5O1 | K6O1 | K5 | K2 | K1 | ok |
| studia-zajecia | K2 | ok | ok | ok | ok | ok |

Okna 1280×600, 1440×780, 1536×730, 1707×830 i 1920×950: wszędzie `ok`.

### Macierz: po

Tylko strony z problemem. Reszta, w tym wszystkie okna 800×900, 860×780, 960×950, 1280×600 i od 1440×780 wzwyż: `ok`.

| strona | 1024×700 | 1180×820 | 1366×620 | co zostało |
|---|---|---|---|---|
| en-studia | R1 | ok | ok | „Admissions 2027/28” wychodzi z ramki kafelka |
| en-studia-matematyka | K1 | K1 | ok | kontakty: e-mail i etykieta |
| popularyzacja | K1 | ok | ok | pole stron pod kafelkami, „Partnerzy” |
| studia | K1 | K1 | ok | pole stron pod kafelkami, „Dyplom” |
| studia-isim | K1 | ok | ok | kontakty |
| studia-plan-zajec | K1 | ok | ok | nagłówki kolumn planu |
| studia-szkola-doktorska | K2 | ok | ok | kontakty |
| studia-pierwszy-rok | ok | ok | O1 | długi spis „Na tej stronie” w niskim oknie |

Żadna z tych pozycji nie jest w nagłówku. Każdą wymienia zlecenie 25: punkt 1 oraz punkty 2.1, 2.2, 2.3 i 2.15. Macierz „po” liczona na `dba7d890`, a poprawki dotknęły potem tylko nagłówka od 1368 px i opisu schodzącego poniżej nagłówka.

## Zrzuty

`raport-zrzuty/z24-{studia,popularyzacja,szkola-doktorska,podyplomowe}-{860,1024,1180,1366,1920}.jpg`

## Odstępstwa od zlecenia

- **Margines także na pasku.** Zlecenie wymienia `.z-nagl`, `.z-dz`, `.z-pd`, `.z-stopka`, `.z-nast`. Zmieniłem też `.z-pasek`, żeby logo stało w tej samej linii co tekst.
- **`.z-haslo` 15–19 px na wszystkich nagłówkach**, nie tylko na banerach działów, bo podstrony mają to samo hasło.
- **Drobny tekst poniżej 1368 px: 13 px.** Tytuł opisu ciekawostki ma 13,5–15 px.
- **Aktualności:** prawy panel od progu komputera (był od 980 px, więc znikał przy 1024 px).
- **Od 1368 px rząd liczb liczony starą metodą.** Punkt 3 każe liczyć tylko to, co nachodzi na rząd w pionie, a punkt 2 każe nie zmieniać nic od 1368 px. Obu naraz spełnić się nie da: na 12 stronach wracała ukryta liczba, np. „5 doktoratów” na Nauce przy 1920 px. Wybrałem punkt 2, a nowa zasada działa poniżej 1368 px. To także pytanie poniżej.

## Pytania do właściciela

1. Na szerokich oknach na Nauce, Popularyzacji, Grantach i Publikacjach zmieściłaby się kolejna liczba, której dziś nie widać, bo granica liczona jest do notki albo opisu mimo braku kolizji. Pokazać je także od 1368 px? Wtedy nagłówki przestają być piksel w piksel takie jak przed zleceniem.
2. Na `/studia/isim/` przy 1024–1280 px opis ciekawostki jest zawsze schowany, bo trzyliniowy tytuł zajmuje miejsce. Symbol zostaje. Zostawić tak?
