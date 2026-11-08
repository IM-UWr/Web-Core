# Jawny Markdown kierunków i specjalności

Format używany na `main` w Web-Studia i Web-Core. Dotyczy całej treści Markdown działu Studia w Web-Studia: kierunków, specjalności, pozostałych podstron oraz tekstów strony działu i Roku akademickiego. Dotychczasowy parser innych działów pozostaje dostępny. Dokument `zasady-parsera.md` opisuje wcześniejszy format, a poniższa instrukcja opisuje nowy.

## Jeden formularz, jedna strona

W Pages CMS otwórz **Web-Studia na branchu main**, następnie **Kierunki**, **Specjalności** albo **Strony**. Teksty `/studia` i `/studia/rok-akademicki` są odpowiednio w formularzach **Strona działu Studia** i **Rok akademicki**. Najpierw są nazwy PL/EN i treść Markdown PL/EN, poniżej dane; w kierunkach i specjalnościach baner jest na końcu. Polski tekst jest treścią pliku `.md`, angielski polem `tresc_en`. Puste tłumaczenie oznacza pokazanie polskiej treści na stronie angielskiej.

W tych wpisach treść, dane i baner znajdują się razem. Nie ma osobnych formularzy „Treść” i „Baner i kafelek”. Nie zmieniaj nazw istniejących plików: to ich identyfikatory używane w adresach i powiązaniach.

Pole `code` wyróżnia składnię. Wygląd strony sprawdzamy po jej przebudowaniu. Komentarze `<!-- ... -->` są instrukcjami redakcyjnymi i nie pojawiają się jako tekst na stronie.

Zwykły tekst jest prozą domyślnie. Akapity, zwykłe listy i tabele nie wymagają otaczania przez `:::proza` ani `::::proza`. Znaczniki są potrzebne do specjalnych układów. Dawne otoczki `proza` nadal są obsługiwane dla zgodności.

Dotyczy to również pól „Koniec strony” PL/EN Roku akademickiego. Dawny przełącznik „Bloki wzorca” w formularzach Studiów zastępują jawne znaczniki. Plan zajęć, kalendarz, terminy semestrów i zamiany dni nadal są generowane z danych; komentarze w plikach wyjaśniają, gdzie trafia część tekstowa. Nie trzeba przepisywać tych danych do Markdownu.

## Sekcje i kolejność

```markdown
## Dowolna nazwa sekcji {#program}

Zwykły tekst.
```

Nagłówek `##` rozpoczyna sekcję i wpis w spisie strony. Możesz zmieniać jego nazwę. Zachowaj `{#program}`: identyfikator utrzymuje działające odnośniki. Bez podanego identyfikatora adres powstaje z nazwy nagłówka. Identyfikatory nie mogą się powtarzać. Puste sekcje są pomijane.

Kolejność sekcji i bloków w Markdownie jest kolejnością na stronie. Nazwy „Program studiów”, „Specjalności”, „Opiekun specjalności” itp. **nie uruchamiają funkcji parsera**. Wygląd wskazują poniższe jawne znaczniki.

## Wszystkie znaczniki

| Znacznik | Efekt i zawartość |
|-|-|
| `:::proza` | Opcjonalny zapis zgodności: akapity, zwykłe listy i tabele są prozą również bez tej otoczki. |
| `:::kafelki` | Lista `- **Tytuł** — opis`, dalsze linie mogą zawierać pary i przyciski. |
| `:::specjalnosci` | Kafelki specjalności w treści kierunku. Taka sama budowa jak kafelków; opcjonalna para `Etykieta: AD` tworzy mały podpis. |
| `:::etapy` | Oś: lista `1. **Semestry 1–2: Tytuł** — opis`, dalsze linie w obrębie punktu. |
| `:::kontakty` | Lista `- *Rola* **Osoba**`, poniżej pary `e-mail:`, `pokój:` itp. |
| `:::linki` | Lista odnośników `- [Nazwa](adres)`, opcjonalny opis po `—`. |
| `:::pliki` | Lista dokumentów w tym samym zapisie, z typem pliku i ikoną. |
| `:::tabela` | Jedna tabela Markdown z wyglądem tabeli blokowej. Zwykła tabela wewnątrz `proza` pozostaje tabelą opisową. |
| `:::kreski` | Zwykła lista z kreskami. |
| `:::tematy` | Lista tematów; opis po `—` jest przygaszony. |
| `:::pytania` | Każdy nagłówek `###` tworzy rozwijany punkt, odpowiedź znajduje się pod nim. Znak zapytania nie jest wymagany. |
| `:::ramka{tytul="Dla kogo"}` | Ramka z podaną etykietą i treścią wewnątrz. |
| `:::zakladki` | Nagłówki `###` rozpoczynają zakładki. Jedna podsekcja to jeden panel bez przycisków; bez JavaScriptu wszystkie panele są widoczne. |
| `::opiekun` | Tylko specjalność: wstawia opiekunów wybranych w formularzu, ich aktualne kontakty i przypisany zakład. |
| `::seminaria` | Tylko specjalność: wstawia odnośniki do seminariów wybranych w formularzu. |
| `::wybor` | Tylko specjalność: wstawia ramkę z odnośnikiem do terminów i formularzy na stronie kierunku. |

Każdy blok otwarty `:::nazwa` zamknij osobną linią `:::`. Przed i po znacznikiem zostaw pustą linię. Wstawki `::opiekun`, `::seminaria`, `::wybor` nie mają zamknięcia i mogą wystąpić tylko raz na stronę. Jeśli nie ma danych opiekunów lub seminariów, odpowiednia wstawka jest pomijana. Nic nie jest dopisywane bez wstawki.

Jeżeli blok zawiera inne bloki, użyj na zewnątrz **czterech** dwukropków (`::::proza` … `::::`), a wewnątrz trzech. Liczba dwukropków zamknięcia musi odpowiadać otwarciu. Nagłówki sekcji `##` umieszczaj poza blokami.

```markdown
<!-- ZAKŁADKI: każdy nagłówek ### rozpoczyna osobną zakładkę. -->
::::zakladki

### Nowy program

Dla osób rozpoczynających studia od 2026/27.

<!-- PLIKI: jeden dokument na punkt. -->
:::pliki

- [Program studiów][program]

:::

### Stary program

Dotychczasowe zasady.

::::

[program]: /pliki/studia/program.pdf
```

## Oś i terminy

```markdown
<!-- ETAPY: dalsze linie punktu są wcięte trzema spacjami. -->
:::etapy

1. **Semestry 3–4: Poszerzanie i wybór specjalności** — Kolejne przedmioty podstawowe i pierwsze przedmioty do wyboru. Pod koniec 4. semestru wybierasz specjalność.
   Termin: Deklaracja specjalności do 30 czerwca (4. semestr)
   [Formularz C2](https://example.org/formularz)

:::
```

Trzy spacje utrzymują `Termin:` wewnątrz numerowanego punktu. Dwie spacje **na końcu** poprzedniej linii wymuszają łamanie linii Markdown; parser rozpoznaje też zwykły Enter przed parą `Klucz: wartość`. Obsługuje `Termin: ...`, `**Termin:** ...` oraz całe `**Termin: ...**`. Najczytelniej stosować zwykłą etykietę. Nie używaj `&#x20;` do wcięć.

To tekstowa informacja o terminie, widoczna razem z osią. Nie jest harmonogramem przypomnień z `src/data/przypomnienia.json` i nie znika automatycznie po upływie daty. Automatyczne przypomnienia i ogłoszenia o zamianach dni nie są zmieniane w tej migracji.

## Kafelki specjalności i opiekunowie

Kafelki na stronie kierunku edytujesz **w Markdownie kierunku**, w `:::specjalnosci`: tekst, kolejność, odnośniki, etykiety i podpisy są jawne. Dodanie specjalności w formularzu nie dopisuje automatycznie kafelka. Zmiana banera specjalności nie zmienia treści kafelka.

Opiekunów podstrony specjalności wybierasz **poniżej Markdownu w formularzu specjalności**. Lista pokazuje nazwiska, zapisuje `_cms/pracownicy/<id>.yml`. Identyfikator odpowiada istniejącej nazwie pliku pracownika w Web-Pracownicy, więc nie trzeba nadawać nowych numerów. Aktualne nazwisko, tytuł, e-mail i pokój strona pobiera przy budowaniu z Web-Pracownicy. Brak wskazanego opiekuna przerywa budowanie z błędem.

Lista wyboru w CMS jest lokalnym katalogiem nazwisk, ponieważ powiązania Pages CMS nie obejmują innego repozytorium. Odśwież ją po dodaniu pracownika lub zmianie nazwiska:

```sh
python skrypty/pobierz_tresci.py
node skrypty/synchronizuj-katalog-opiekunow.mjs ../Web-Studia
```

Zapisz zmiany katalogu w Web-Studia. Katalog nie zawiera kontaktów i ma pola tylko do odczytu. Nazwiska wpisane jako zwykły tekst w kafelkach kierunku lub w akapitach pozostają tekstem redakcyjnym — trzeba je aktualizować osobno.

## Baner i dane

Baner edytuje się na końcu tego samego formularza. Liczby w banerze specjalności są teraz jawnymi polami; parser nie szuka nazw przedmiotów ani słów o wyborze specjalności, żeby je wyliczać. Zmiana tekstu nie zmienia tych liczb. Dotychczasowe liczby i dane przeniesiono do nowych pól.

Matematyka w ekonomii pozostaje specjalnością wygaszaną bez osobnej podstrony. Jej kafelek pozostaje w kierunku. Stare repozytoria Web-Spec-* nie są kasowane; nowy Web-Core przestaje pobierać z nich treści.

## Błędy i kontrola

Budowanie wykrywa nieznane znaczniki, niezamknięte bloki, powtórzone identyfikatory sekcji i wstawki, nieprawidłowe listy i brak wskazanego opiekuna. Formularz `code` nie wykonuje tej walidacji podczas pisania — wynik pochodzi z testu/budowania.

Po pobraniu nowych treści:

```sh
npm ci
npm run test:jawne
node skrypty/sprawdz-jawny-markdown.mjs ../Web-Studia
npm run check
npm run build
npx playwright install chromium
npm run test:jawne-ui
```

Lokalnie można podstawić zmienione Web-Studia bez pobierania repozytoriów ponownie: `python skrypty/pobierz_tresci.py --lokalnie .tresci --zrodlo Web-Studia=../Web-Studia`.

Workflow `markdown-jawne-test.yml` w Web-Podglad buduje tylko artefakt i zrzuty testowe; nie publikuje strony. Można wskazać main lub wspólny branch Web-Core i Web-Studia. Brak wskazanego brancha Web-Studia przerywa test. Standardowa publikacja korzysta z main.

## Zakres migracji

Przeniesiono 4 kierunki i 6 specjalności (5 z własnymi podstronami), obie wersje językowe, dane i banery. Następnie ten sam jawny format zastosowano do pozostałych 15 wpisów w `src/content/strony/studia` (także z podfolderów) oraz `src/data/studia.md` i `src/data/rok-akademicki.md`: łącznie 27 wpisów. Wprowadzono komentarze redakcyjne i opiekunów po ID, zachowując adresy i układ strony. W zwykłych podstronach blok `proza` korzysta z istniejącego kontenera typografii; listy i tabele zachowują zwykły wygląd, dopóki redaktor nie wybierze specjalnego bloku.

Nie obejmuje to pozostałych pomysłów z `cms-reorganizacja-2026-11`: ręcznego głównego menu, nowych statusów publikacji dla wszystkich kolekcji, zewnętrznych stron specjalności ani ogólnego porządkowania innych formularzy. Branch nie zmienia standardowego workflow publikacji.
