# Raport: zlecenie 25 — treść, gdy brakuje miejsca (7.11.2026)

Gałąź: `wyglad/zlecenie-16`, bez pushowania, także w repozytoriach treści. `skrypty/pobierz_tresci.py` uruchamiałem tylko z `--lokalnie`, w osobnym katalogu roboczym.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Zasada: pole ustępuje, tekst łamie się między słowami, potem widok telefonu treści | `0091b81e`, poprawki `2fb39d0f` (Władze), `1385aa22` (e-mail w tabeli zakładu) |
| 2.1 | Pole stron pod kafelkami działu | `a52f0420` |
| 2.2 | Kafelek „Rekrutacja” | `8a43c4bb` |
| 2.3 | Kontakty, kolumny co najmniej 250 px | `1df6588b` |
| 2.4 | Dane seminarium | `649ad96d` |
| 2.5 | Listy linków | `359c01fb` |
| 2.6 | Siatka lat publikacji | `0e6e2f9c` |
| 2.7 | Władze: zastępcy i kontakt | `d8ba7a20`, poprawka `15603c28` |
| 2.8 | Pasek czasu grantów | `dd2d56cf` |
| 2.9 | Minione konferencje | `b622ee7b` |
| 2.10 | Plan zajęć bez łamania w środku słowa | `ecb8ce9a` |
| 2.11 | Tekst działu i „W skrócie” | `ca901729`, poprawki `21e6ce48`, `f6bc5a10` |
| 2.12 | Karty projektów i „Dla kogo” | `07828433` |
| 2.13 | Wpis aktualności ze zdjęciem bez wydarzenia | `23966669` |
| 2.14 | Lista Aktualności: dwie kolumny od 880 px | `42ce2a09` |
| 2.15 | Długi spis zanika przy dolnej krawędzi | `9d039b14` |

Wynik w skrócie: Plan zajęć ma pole zwinięte do 1280 px, a od 1366 px wraca stan pełny. W obu semestrach, po polsku i po angielsku, żadna osoba nie zajmuje więcej niż 2 linie, a przedmiot więcej niż 3. Żaden wyraz nie łamie się w środku. Widok telefonu treści przy obecnych danych nie włącza się na żadnej sprawdzanej stronie. Narzędzie zgłasza 1 pozycję na 715 pomiarów: przewijany spis na Pierwszym roku przy 1366×620, który celowo zanika przy dolnej krawędzi (punkt 2.15).

## Jak działa widok telefonu tylko dla treści

Wtyczka PostCSS `src/plugins/postcss-tresc-telefon.mjs`, działa przy budowie. Żadnych reguł nie kopiowałem ręcznie.

- Każda reguła z `@media` telefonu dostaje kopię w `@media` komputera z dopiskiem `:where([data-tresc=telefon], [data-tresc=telefon] *)`.
- Każda reguła komputerowa (`min-width` od 1024 px) dostaje `:where(:not([data-tresc=telefon], [data-tresc=telefon] *))`, więc wewnątrz takiej treści się wyłącza.
- `:where` ma zerową specyficzność, więc kolejność i siła reguł zostają bez zmian. Działa to także dla stylów `scoped` w plikach Astro.
- Nagłówek, pasek i stopka są poza `.z-pd`, więc zostają w widoku komputera.

Skrypt w linii na końcu `.z-pd` (`src/components/zal/Podstrona.astro`) mierzy tak, jak opisuje zlecenie: przed pierwszym narysowaniem, po `document.fonts.ready`, przy zmianie szerokości i po przełączeniu semestru. Stan: stan pełny → `data-pole="zwiniete"` → `data-tresc="telefon"` na `.z-pd`.

Bez JavaScriptu działa zapasowy próg w CSS: `html:not(.js) .z-pd:has([data-limit-linii])` zwija pole poniżej 1300 px.

## Pozycje z limitem

Oznaczone atrybutem `data-limit-linii`, nie listą selektorów w skrypcie.

| Pozycja | Limit | Gdzie |
| --- | --- | --- |
| Osoba w Planie zajęć | 2 | `PlanZajec.astro`, `.pl-pelne` |
| Nazwa przedmiotu | 3 | `PlanZajec.astro`, `h3` |
| Nazwisko w kontaktach | 2 | `dzial/Kontakt.astro`, `Kierunek.astro`, `Seminarium.astro`, `Specjalnosc.astro`, `Zaklad.astro`; w treści z Markdownu `rehype-limity.mjs` (`b` w `.kontakty`) |
| E-mail, łamanie tylko przed „@” | 2 | te same pliki oraz `Publikacje.astro`, `OsobaZ.astro`, `WladzeZ.astro`, `TabelaPracownikow.tsx`; pomocnik `src/lib/limity.mjs` |
| Nazwisko w tabeli Pracowników | 2 | `TabelaPracownikow.tsx`, `.zp-imie` |
| Nazwisko na Władzach | **3** | `OsobaZ.astro` (odstępstwo 2) |
| Komórka tabeli w treści | 2 | `rehype-limity.mjs`, `RokAkademicki.astro`, `Kierunek.astro` (odstępstwo 1) |

## Strona × okno → stan

Sprawdzone na zbudowanej stronie, bez przekroczeń (`!n` oznaczałoby n pozycji ponad limit).

| Strona | 1024 | 1100 | 1180 | 1280 | 1366 | 1440 | 1536 | 1920 |
|---|---|---|---|---|---|---|---|---|
| `/studia/plan-zajec/` | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny |
| `/studia/plan-zajec/ (semestr letni)` | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny |
| `/en/studia/plan-zajec/` | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny |
| `/en/studia/plan-zajec/ (semestr letni)` | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny |
| `/studia/matematyka/` | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny | pełny | pełny |
| `/en/studia/matematyka/` | **pole zwinięte** | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny | pełny |
| `/studia/siad/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/isim/` | **pole zwinięte** | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/en/studia/isim/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/szkola-doktorska/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/en/studia/szkola-doktorska/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/szkola-doktorska/rekrutacja/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/szkola-doktorska/dokumenty/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/szkola-doktorska/stopien-doktora/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/szkola-doktorska/stypendia-i-granty/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/pracownicy/` | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny | pełny | pełny |
| `/en/pracownicy/` | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny | pełny | pełny |
| `/instytut/wladze/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/en/instytut/wladze/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/sprawy-studenckie/` | **pole zwinięte** | **pole zwinięte** | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/zajecia/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/pierwszy-rok/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/o-stronie/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/deklaracja-dostepnosci/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/polityka-prywatnosci/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/program-most/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |
| `/studia/skrypty/` | pełny | pełny | pełny | pełny | pełny | pełny | pełny | pełny |

Test ze sztucznie długim nazwiskiem i e-mailem w danych, tylko w osobnym katalogu roboczym, niczego nie commitowałem. Przy 1024, 1180, 1280, 1440 i 1920 px treść `/studia/matematyka/` przechodzi na widok telefonu (kolumna 720 px, jeden kontakt pod drugim), nagłówek i pasek zostają komputerowe, poziomego przewijania nie ma. Zrzuty: `z25-dlugie-gora-1024.jpg`, `z25-dlugie-kontakt-1024.jpg`.

Bez JavaScriptu, 8 okien od 1024 do 1920 px: Plan, Matematyka, SIAD, Szkoła doktorska, Pracownicy, Władze (PL) oraz Plan i Pracownicy (EN) mają pole zwinięte do 1299 px, a od 1300 px pełne. O stronie, deklaracja dostępności i Skrypty mają pole przy każdym oknie. Polityka prywatności w ogóle nie ma spisu. Nigdzie nie ma poziomego przewijania.

## Macierz narzędzia

Przed to stan po zleceniu 24 (`dba7d890`), po to `f6bc5a10`. Okna od 800×900 do 1920×950, 65 stron.

| Strona | Przed | Po |
| --- | --- | --- |
| `en-studia` | R1 przy 1024 | ok |
| `en-studia-matematyka` | K1 przy 1024 i 1180 | ok |
| `popularyzacja` | K1 przy 1024 | ok |
| `studia` | K1 przy 1024 i 1180 | ok |
| `studia-isim` | K1 przy 1024 | ok |
| `studia-plan-zajec` | K1 przy 1024 | ok |
| `studia-szkola-doktorska` | K2 przy 1024 | ok |
| `studia-pierwszy-rok` | O1 przy 1366 | O1 przy 1366 |

Zostająca pozycja to „Budynek Instytutu” w spisie, który przy 1366×620 jest dłuższy niż okno i się przewija. Narzędzie nie odróżnia przewijania od ucięcia. Zlecenie 27 przenosi narzędzie do repozytorium i wtedy można je nauczyć pomijania elementów przewijanych.

## Porównanie piksel w piksel ze stanem po zleceniu 24

**Telefon 390 i 412 px, 130 zrzutów:** 101 identycznych, 13 różni się tylko odcieniem. W 16 litery przy „@” przesuwają się o mniej niż piksel, bo e-mail składa się teraz z dwóch części. Wysokości stron bez zmian.

**Sam nagłówek od 1368 px, 260 zrzutów:** 259 identycznych, 1 różni się tylko odcieniem.

**Cała strona od 1368 px (1368, 1440, 1536, 1920), 260 zrzutów:** 154 identyczne, 48 różni się tylko odcieniem. Pozostałe 58:

| Co | Strony | Ocena |
| --- | --- | --- |
| E-mail łamie się przed „@”, a nie w środku | Matematyka, Seminarium, SIAD (strona wyższa o 22 px, bo wcześniej adres wystawał 20 px poza kolumnę) | zamierzone |
| Litery przy „@” przesunięte o mniej niż piksel | Pracownicy, zakład, ISIM, Szkoła doktorska | niewidoczne |
| Spis zanika przy dolnej krawędzi | Pierwszy rok | zamierzone (2.15) |
| Kolumna nazw 232 zamiast 220 px | Plan zajęć, strona wyższa o 93 px | odstępstwo 3 |
| Ilustracja patrona, zdjęcia ładowane leniwie | działy, Sukcesy, główna | szum pomiaru całej strony: zmienia się między oknami, nagłówek osobno daje 259 z 260 |

## Odbiór punktu 2

Narzędzie od 1024 do 1920 px na 4 działach z rozwiniętymi kafelkami i na stronach z punktu 1: 0 K/R/O/W/X. Zrzuty w `raport-zrzuty/`:

- `z25-studia-dyplom-1280.jpg`, `z25-studia-dyplom-1180.jpg`
- `z25-popularyzacja-partnerzy-1180.jpg`
- `z25-rekrutacja-1024.jpg`
- `z25-wladze-1024.jpg`, `z25-wladze-kontakt-1024.jpg`
- `z25-granty-1024.jpg`, `z25-konferencje-1024.jpg`, `z25-publikacje-1024.jpg`
- dodatkowo `z25-plan-1024.jpg`, `z25-matematyka-kontakt-1024.jpg`, `z25-pracownicy-1024.jpg`

`astro check`: 6 błędów, tyle co przed zleceniem, żaden nowy.

## Odstępstwa od zlecenia

1. **Limit komórki tabeli tylko dla komórek do 30 znaków.** Dłuższe mają 3 i więcej linii już przy 1920 px (na przykład 143 znaki w tabeli „Pierwszy rok”). Limit 2 przełączałby te strony na widok telefonu przy każdej szerokości. Komórki do 30 znaków nigdy nie przekraczają 2 linii, poza wzorami, których nie oznaczam.
2. **Nazwisko na Władzach: limit 3, nie 2.** Nazwa zawiera tytuły, a „dr hab. Piotr Borodulin-Nadzieja, prof. UWr” ma 3 linie w kolumnie 219 px przy każdym oknie. Samo imię i nazwisko mieści się w 2.
3. **Kolumna nazw przedmiotów w Planie 232 zamiast 220 px.** „Inteligentne systemy decyzyjne - praktyka nowoczesnego matematyka” ma 4 linie przy 220 px, a najmniejsza szerokość dla 3 linii to 232 px. Inaczej semestr letni byłby w widoku telefonu przy każdym oknie. Skutek: Plan jest wyższy o 93 px, także od 1368 px.
4. **Wzory `auto-fill` z `max(…, %)`.** Same wartości ze zlecenia dałyby inną liczbę kolumn od 1368 px (lata publikacji 5 zamiast 4, konferencje 3 zamiast 2, karty 5 zamiast 4). Dopisek z procentem trzyma dotychczasową liczbę kolumn przy zwykłej szerokości, a poniżej działa minimum ze zlecenia.
5. **Listy linków bez zapytania kontenerowego.** Kontener na `.z-pd-tresc` ogranicza układ strony i mógłby zmienić pomiar wystawania. Ten sam efekt daje `auto-fill` z minimum 280 px.
6. **Telefon zachowuje interlinię 1,6 w nagłówku sekcji działu** (2.11). Zlecenie dotyczy szerokości komputerowych, a telefon ma zostać bez zmian.

## Pytania

1. **„Na tej stronie” na telefonie.** Zlecenie mówi, że pole zwija się „jak dziś na telefonie”, ale na telefonie spisu nie ma od zlecenia 18, punkt 18 (`68ca1a7f`, decyzja właściciela: „wywal »Na tej stronie« ze wszystkich stron”). Przywróciłem wygląd sprzed tamtej zmiany tylko dla stanu zwiniętego na komputerze. Telefon i widok telefonu treści nadal nie mają spisu. Czy tak ma zostać?
2. **Plan zajęć wyższy o 93 px** (odstępstwo 3). Alternatywą jest krótsza nazwa przedmiotu w USOS, której nie zmieniam, albo limit 4 linie dla przedmiotu.
