# Jawny Markdown: kierunki, specjalności, Strony i strony działów

Format używany w Web-Studia i Web-Popularyzacja: kierunki, specjalności, podstrony Studiów, teksty strony działu i Roku akademickiego oraz wszystkie teksty działu Popularyzacja. Od zlecenia 40 także Strony i strona działu w Web-Instytut i Web-Nauka, Strony Web-Aktualnosci, strona Pracownicy (Web-Pracownicy) i strony ze stopki (Web-Ustawienia) — szczegóły w „Pozostałe działy (zlecenie 40)”. Plik jest w jawnym formacie, gdy ma `format_tresci: jawne`; bez tego pola działa dotychczasowy parser (od etapu 3 zlecenia 40 nie używa go żadna Strona ani strona działu). Wpisy (aktualności, zakłady, granty, konferencje, referaty…) są zwykłym Markdownem. Dokument `zasady-parsera.md` opisuje wcześniejszy format, a poniższa instrukcja opisuje nowy.

## Jeden formularz, jedna strona

W Pages CMS otwórz **Web-Studia na branchu main**, następnie **Kierunki**, **Specjalności** albo **Strony**. Teksty `/studia` i `/studia/rok-akademicki` są odpowiednio w formularzach **Strona działu Studia** i **Rok akademicki**. Najpierw są nazwy PL/EN i treść Markdown PL/EN, poniżej dane; w kierunkach i specjalnościach baner jest na końcu. Polski tekst jest treścią pliku `.md`, angielski polem `tresc_en`. Puste tłumaczenie oznacza pokazanie polskiej treści na stronie angielskiej.

Teksty Popularyzacji są w **Web-Popularyzacja/main**: strona działu i podstrony mają te same jawne znaczniki. Karty działu i „W skrócie” nadal pochodzą z menu i pól formularza.

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
| `:::pary` | Lista `- **Etykieta:** treść`: etykieta w kolumnie obok treści, kreski między parami; na telefonie etykieta nad treścią. Dalsze linie punktu należą do tej samej treści. |
| `:::grafik` | Tylko zwykłe Strony: grafik dyżurów (Tutornia). Linie `Sala:`, `Od:`, `Do:`, potem jeden dyżur na linię `- pon. 12:15–14:00 **Imię Nazwisko** — przedmioty`. Strona rysuje plan tygodnia, ramkę „Teraz” nad treścią i liczby banera. Jeden blok na stronę; pusty blok w Treści EN bierze grafik z wersji polskiej. Szczegóły: „Grafik dyżurów i pary”. |
| `:::w-skrocie` | Tylko sylwetka „Warto wiedzieć”: liczby obok portretu, `- **1973** — doktorat w IM PAN` (podpis: Markdown w jednej linii, także link). Punkt z latami życia strona pomija (lata są w polu „Lata”). Szczegóły: „Warto wiedzieć (zlecenie 47)”. |
| `:::laureaci` | Tylko nagroda „Warto wiedzieć”: `- **2026** Imię Nazwisko — [aktualność](/aktualnosci/…)` (część po ` — ` opcjonalna). Link do sylwetki daje mini portret i powiązanie; licznik „N laureatów z Instytutu” liczy się sam. |
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

## Grafik dyżurów i pary (zlecenie 45)

Strona `/studia/tutornia` (Web-Studia, „Strony studiów”) ma grafik dyżurów wpisywany w Treści, bez nowych pól formularza: sala i daty to linie w bloku. Pole „Liczby” zostaje puste — liczby banera (tutorzy, dyżury w tygodniu, sala) strona liczy z bloku; wpisane „Liczby” mają pierwszeństwo.

```markdown
<!-- GRAFIK: Najpierw Sala:, Od: (np. 19.10.2026) i Do: (puste = do końca zajęć), potem jeden dyżur na linię: - pon. 12:15–14:00 **Imię Nazwisko** — przedmioty. -->

:::grafik
Sala: 202
Od: 19.10.2026
Do:

- pon. 12:15–14:00 **Paulina Pawlik** — AM1, AM3, Algebra liniowa 1
- śr. 14:15–16:00 **Jacek Kowalski** — AM1, Algebra liniowa 1
:::
```

- **Linia dyżuru:** dzień (`pon.`, `pn`, `poniedziałek`, `Mon`, `Monday`…), godziny (`12:15–14:00`, `12.15-14`, `12:15 do 14:00`), potem imię i nazwisko (pogrubione albo bez pogrubienia przed `—`, ` - ` lub `:`), dalej przedmioty. Kolejność linii dowolna; nakładające się dyżury dzielą kolumnę.
- **Od / Do:** `19.10.2026` albo `2026-10-19`. Puste `Do` = do końca zajęć semestru, w którym leży `Od` (kalendarz zajęć z Web-Studia „Kalendarz zajęć”). Dni wolne, przerwy i zamiany dni (np. piątek według planu środy) strona bierze z tego samego kalendarza.
- **Oś godzin** liczy się sama: od najwcześniejszego do najpóźniejszego dyżuru w tygodniu, etykiety na początkach dyżurów i na końcu ostatniego; w lukach ponad 90 min dochodzą pełne godziny.
- **Treść EN:** pusty blok `:::grafik` + `:::` wstawia grafik z wersji polskiej (napisy po angielsku). Nie przepisuj dyżurów.
- **Błędna linia nie zatrzymuje budowy:** strona pomija linię, na Podglądzie nad planem stoi czerwona ramka „Podgląd: tych linii grafiku strona nie rozumie” (numer linii w bloku — `:::grafik` to linia 1 — tekst, powód, wzór linii); na stronie publicznej ramki nie ma. `skrypty/sprawdz_tresci.py` wypisuje to samo jako ostrzeżenie (ten sam parser, `src/lib/grafik.mjs`, przez Node). Drugi blok `:::grafik` na stronie też trafia do tej ramki (strona pokazuje pierwszy). Błędem budowy jest tylko blok poza zwykłą Stroną (np. w kierunku).
- **Ramka „Teraz”** nad pierwszą sekcją i podpis kafelka „Tutornia” w Szybkim dostępie liczą się w przeglądarce co minutę (Europe/Warsaw). Bez JavaScriptu: „Sala 202 · dyżury według planu poniżej” i plan bez zaznaczeń.

`:::pary` to ogólny blok etykieta–treść (klasa `dl.pary`), np. „Gdzie i jak” w Tutorni:

```markdown
<!-- PARY: Każdy punkt: **Etykieta:** treść. -->

:::pary
- **Gdzie:** sala 202 na poziomie 200.
- **Dla kogo:** dla wszystkich studentów.
:::
```

**Komentarze wzorcowe** (jednoliniowy komentarz, pusta linia, blok; komentarze nie trafiają na stronę):

| Gdzie | Komentarz |
|-|-|
| początek Treści i Treści EN | `<!-- UKŁAD JAWNY: ## rozpoczyna sekcję w spisie. Nazwę można zmieniać; {#id} zachowuje adres. Bloki :::nazwa … ::: sterują wyglądem; komentarze są tylko instrukcjami dla redaktora. -->` |
| przed pierwszą sekcją strony z grafikiem | `<!-- TERAZ: Ramkę „Teraz” (kto dyżuruje teraz, kiedy następny dyżur) strona tworzy sama z grafiku. Nic tu nie wpisuj. -->` |
| przed tekstem sekcji | `<!-- TEKST: Zwykły Markdown. Specjalny układ wymaga jawnego znacznika bloku. -->` |
| przed `:::grafik` (Treść) | `<!-- GRAFIK: Najpierw Sala:, Od: (np. 19.10.2026) i Do: (puste = do końca zajęć), potem jeden dyżur na linię: - pon. 12:15–14:00 **Imię Nazwisko** — przedmioty. -->` |
| przed `:::grafik` (Treść EN) | `<!-- GRAFIK: Pusty blok wstawia grafik z wersji polskiej. Nie przepisuj dyżurów. -->` |
| przed `:::pary` | `<!-- PARY: Każdy punkt: **Etykieta:** treść. -->` |
| przed `:::linki` | `<!-- LINKI: Jeden link na punkt; po — można dopisać opis. -->` |

Kod: parser i stany `src/lib/grafik.mjs` (testy `src/plugins/grafik.test.mjs`), blok `src/plugins/rehype-bloki.mjs`, widok `src/components/grafik/` (Plan, Teraz, Kafelek), skrypt `src/scripts/grafik.ts`, wygląd `src/styles/grafik.css`.

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

Budowanie wykrywa nieznane znaczniki, niezamknięte bloki, powtórzone identyfikatory sekcji i wstawki, nieprawidłowe listy i brak wskazanego opiekuna. Formularz `code` nie wykonuje tej walidacji podczas pisania — wynik pochodzi z testu/budowania. Wyjątek: błędne linie grafiku dyżurów nie zatrzymują budowy (czerwona ramka na Podglądzie i ostrzeżenie w `sprawdz_tresci.py`, „Grafik dyżurów i pary”).

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

## Pozostałe działy (zlecenie 40)

Zlecenie 40 przenosi do jawnego formatu Strony i stronę działu kolejnych repozytoriów, po jednym (kolejność: Instytut, Nauka, Aktualności, Pracownicy, seminaria, Ustawienia; na koniec porządek pól w Studiach i Popularyzacji). Wpisy (aktualności, zakłady, „Warto wiedzieć”, granty…) zostają zwykłym Markdownem; pole Treść ma przy nich ściągawkę. W każdym repozytorium tekst i wygląd stron bez zmian (porównanie HTML całej strony przed/po: 0 różnic, poza zatwierdzonymi).

- **Web-Instytut** (etap 1): 12 Stron i `src/data/instytut.md`. Przy każdym `##` jest `{#id}` z dawnym adresem sekcji (np. `{#sieć-eduroam}`), na początku Treści i Treści EN komentarz `<!-- UKŁAD JAWNY: … -->`.
- **Web-Nauka** (etap 2): 6 Stron i `src/data/nauka.md`, 10 nagłówków z `{#id}`. Na stronie Publikacje tekst pod `## Czasopisma redagowane w Instytucie {#czasopisma}` (EN: `## Journals edited at the Institute {#czasopisma}`) stoi nad listą czasopism. Konferencja z opisem (Treść nie tylko z komentarzem) ma własną stronę `/nauka/konferencje/<plik>`, jak projekt.
- **Web-Aktualnosci** (etap 3): Strony `aktualnosci`, `kariera` (zlecenie 44) i `obrony-doktorskie` — teksty nad listami, bez nagłówków `##`; pusta Treść (albo sam komentarz) = sama lista. Nowa aktualność i nowa obrona startują z szablonem Treści; obrona z samym komentarzem dostaje zaproszenie złożone z danych.
- **Web-Pracownicy** (etap 4): strona `pracownicy`; tekst stoi nad listą osób, pusta Treść (albo sam komentarz) = sama lista.
- **Seminaria** (etap 5, 9 repozytoriów `Web-Sem-*`): bez Stron; opis seminarium i streszczenia referatów to zwykły Markdown. Nowy referat startuje z szablonem streszczenia (komentarz), który liczy się jak pusta Treść.
- **Web-Ustawienia** (etap 6): Deklaracja dostępności, Polityka prywatności i O stronie (`src/content/strony/`), 18 nagłówków z `{#id}`.
- **Web-Studia, Web-Popularyzacja** (etap 7): format bez zmian (był jawny), tylko porządek pól w formularzach.
- **Formularze we wszystkich repozytoriach:** tytuł, tytuł EN → Treść, Treść EN → reszta; pola EN tuż pod polskimi, etykiety „… EN”; ukryte pole `format_tresci` (`default: jawne`), więc nowa Strona od razu jest w jawnym formacie; dawne „Bloki wzorca” ukryte (w jawnym formacie strona ich nie czyta). Pola, których strona nie pokazuje, są ukryte albo opisane (np. „Opis strony dla Google” zamiast „Wstęp pod tytułem”: nowy nagłówek działu go nie pokazuje).
- **Sekcja przenoszona** (kotwica typu „strona” w `src/plugins/kotwice.mjs`): w jawnym formacie decyduje tylko jawne id, nie nazwa nagłówka. Na `/instytut` tekst pod `## Ostatnie sukcesy {#sukcesy}` (EN: `## Recent achievements {#sukcesy}`) stoi nad listą ostatnich sukcesów; bez `{#sukcesy}` zostaje na końcu „O Instytucie”.
- **Limity linii** (`rehype-limity.mjs`: krótkie komórki tabel, kontakty) w jawnych Stronach działają dla tekstu polskiego jak w dawnym formacie; Strony Studiów zostają bez nich, jak od początku jawnego formatu.
- **Szablony Treści** nowych wpisów (pole `default`, np. `<!-- TEKST: … -->` w aktualnościach, zakładach i „Warto wiedzieć”): sama Treść z komentarzem liczy się jak pusta (`maTresc()` w `src/lib/tresci.ts`), więc wpis nie dostaje pustej podstrony ani pustego streszczenia.

Narzędzia (z katalogu Web-Core):

```sh
node skrypty/jawny-markdown-repo.mjs ../Web-Instytut            # raport: co dostanie {#id} i komentarz
node skrypty/jawny-markdown-repo.mjs ../Web-Instytut --zapisz   # migracja (bez zmian tekstu; skrypt sam to sprawdza)
node skrypty/migracja/formularze_40.mjs ../Web-Instytut         # formularze: kolejność, opisy, ukryte pola, szablony
node skrypty/sprawdz-jawny-markdown.mjs ../Web-Instytut         # formularze i pliki: format, pola, {#id} przy ##
```

## Warto wiedzieć (zlecenie 47)

Od zlecenia 47 „Warto wiedzieć” to trzy kolekcje w jawnym Markdownie w Web-Instytut (`src/content/warto_wiedziec/{sylwetki,nagrody,historie}/`, w CMS grupa „Warto wiedzieć” z formularzami `ww_sylwetki`, `ww_nagrody`, `ww_historie`; ukryte `format_tresci: jawne`). Strony: `/instytut/warto-wiedziec` (lista: siatka sylwetek, nagrody, oś czasu historii) i `/instytut/warto-wiedziec/<plik>` (adres płaski, wspólny dla trzech grup); stare `/warto-wiedziec/…` przekierowują. Tekst nad listą: Strona `instytut/warto-wiedziec`.

- **Sylwetka:** na początku Treści `:::w-skrocie` (liczby obok portretu), potem wstęp (tekst przed pierwszym `##`), sekcje `##` z `{#id}`, „Do pobrania” (`## Do pobrania {#do-pobrania}` z `:::pliki`), na końcu `## Źródła {#zrodla}` (na stronie zwinięte, liczba w nagłówku). Strona dokłada „W »Warto wiedzieć«” (nagrody i historie, które linkują do tej osoby) i „Inne sylwetki”.
- **Nagroda:** opis, `## Laureaci z Instytutu {#laureaci}` z `:::laureaci`, ewentualnie `:::pliki`. **Historia:** zwykły tekst z sekcjami `##`.
- **Bloki tylko tu:** `:::w-skrocie` i `:::laureaci` działają wyłącznie w „Warto wiedzieć” (gdzie indziej to nieznany znacznik). Zła linia bloku nie zatrzymuje budowy (inaczej niż w pozostałych blokach): strona ją pomija, log budowy ma ostrzeżenie `[warto-wiedziec] … linia N bloku :::… pominięta`, a na Podglądzie nad treścią stoi czerwona ramka z numerem linii i wzorem. Parser: `src/plugins/remark-jawne-bloki.mjs` (linie: `src/lib/ww.mjs`), HTML: `src/plugins/rehype-bloki.mjs` (`naWSkrocie`, `naLaureatow`).
- **Powiązania z linków:** link `[…](/instytut/warto-wiedziec/<plik>)` (także z `/en`, kotwicą albo pełnym adresem) w Treści nagrody albo historii łączy wpis z sylwetką (`linkiDoWW` w `src/lib/ww.mjs`). Pola „Osoby” nie ma.
- **Pusta Treść** (albo same komentarze): sylwetka = TBA (strona z ramką), nagroda i historia = bez własnej strony (karta prowadzi do linku). Pusta Treść EN przy polskiej: ramka „Translation in preparation”.
- **Kontrola:** `npm run test:jawne` (testy `src/plugins/ww.test.mjs`), `node skrypty/sprawdz-jawny-markdown.mjs ../Web-Instytut` (formularze, format i złe linie bloków), `python skrypty/sprawdz_tresci.py` (Lata, Dodano, rocznice, rok historii, duplikat nazwy pliku w trzech grupach, stary układ).
