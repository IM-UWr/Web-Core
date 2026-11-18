# Ściągawka edytora: Strony, strony działów, kierunki, wpisy i aktualności

W Pages CMS są dwa rodzaje tekstu (zlecenie 40):

- **Jawny Markdown** — kierunki i specjalności (Web-Studia) oraz Strony i strona działu w Web-Instytut, Web-Nauka, Web-Studia, Web-Popularyzacja, Web-Pracownicy i strony ze stopki (Web-Ustawienia: deklaracja dostępności, polityka prywatności, „O stronie”). Zwykły tekst, listy i tabele piszesz bez znaczników, specjalny układ (kafelki, oś kroków, pytania, pliki, kontakty) zamykasz w bloku `:::nazwa` … `:::`. Pełny opis: `dok/jawny-markdown.md`. Plik ma `format_tresci: jawne` (ukryte pole formularza; nowa Strona dostaje je sama).
- **Zwykły Markdown** — wpisy: aktualności, obrony, zakłady, „Warto wiedzieć”, konferencje, projekty i granty, opisy seminariów i referaty. Bez bloków `:::`; wzory w LaTeX-u (`$\ell^2$`).

Strony Web-Aktualnosci (`aktualnosci`, `obrony-doktorskie` i inne) są jeszcze w dawnym formacie, w którym strona sama rozpoznaje układy (etap 3 zlecenia 40; opis dawnego formatu: `zasady-parsera.md`).

**Formularze:** tytuł, tytuł EN (i „Opublikowane”) → Treść, Treść EN → reszta pól; pola EN tuż pod polskimi, z etykietą „… EN”. Puste pole EN = strona angielska pokaże tekst polski. Pole Treść to edytor Markdownu (pole `code`): wygląd sprawdzasz na Podglądzie po przebudowaniu (ok. 10 minut).

## Ściągawka w opisie pola „Treść”

Strony i strony działów (jawny Markdown):

> Jawny Markdown: ## rozpoczyna sekcję i pozycję spisu; {#id} zachowuje adres sekcji. Zwykły tekst jest prozą domyślnie; nie wymaga otaczających znaczników. Specjalne układy wymagają znaczników, np. :::kafelki, :::etapy, :::zakladki. Komentarze <!-- … --> objaśniają bloki; na stronie ich nie widać. Zachowaj pasujące końcowe dwukropki. Plik PDF: wgraj w „Media” i wklej link. Wygląd sprawdzaj po przebudowaniu strony (Podgląd).

Formularz dopisuje do tego, co dotyczy danej strony, np. na stronie działu Instytut: „Zdanie nad ostatnimi sukcesami: na końcu, pod „## Ostatnie sukcesy {#sukcesy}””; na stronie Pracownicy: „tekst stoi nad listą osób”. Kierunki i specjalności mają własny, dłuższy opis (Web-Studia).

Wpisy (zwykły Markdown):

> Zwykły Markdown: akapity oddziela pusta linia; \*\*pogrubienie\*\*, \*kursywa\*, [tekst linku](https://…); lista: „- ” na początku linii; ## = nagłówek sekcji. Plik PDF: wgraj w „Media” i wklej link. Komentarze <!-- … --> to podpowiedzi; na stronie ich nie widać.

## Przykłady (jawny Markdown)

Każdy znacznik bloku w osobnej linii, z pustą linią przed i po. Blok w bloku: na zewnątrz cztery dwukropki (`::::zakladki` … `::::`).

Sekcja ze stałym adresem (zmieniasz nazwę, `{#…}` zostawiasz):

```markdown
## Dlaczego warto {#dlaczego-warto}

Zwykły akapit, bez znaczników.
```

Kafelki:

```markdown
:::kafelki

- **Kategoria A+** — Najwyższa ocena naukowa dyscypliny w Polsce.
- **Pomoc na starcie** — Kurs wyrównawczy i tutornia.

:::
```

Oś kroków z parą i przyciskiem (dalsze linie punktu wcięte trzema spacjami):

```markdown
:::etapy

1. **Semestry 3–4: Wybór specjalności** — Pod koniec 4. semestru wybierasz specjalność.
   Termin: do 30 czerwca
   [Formularz C2](https://forms.cloud.microsoft/e/SWEQQ1YF5L)

:::
```

Pytania (każdy `###` to jedno rozwijane pytanie):

```markdown
:::pytania

### Kiedy wybieram specjalność?

Pod koniec 4. semestru (formularz C2, do 30 czerwca).

:::
```

Kontakt:

```markdown
:::kontakty

- *Sekretariat dydaktyczny* **Justyna Jędrzejewska-Idczak**
  e-mail: [Justyna.Jedrzejewska-Idczak@uwr.edu.pl](mailto:Justyna.Jedrzejewska-Idczak@uwr.edu.pl)
  pokój: 315

:::
```

Lista plików (opis po myślniku opcjonalny; `:::linki` = lista zwykłych linków):

```markdown
:::pliki

- [Regulamin studiów](/pliki/studia/regulamin.pdf)
- [Harmonogram wygaszania](/pliki/studia/zmiany2026.pdf) — Część przedmiotów jest wygaszana.

:::
```

Ramka z tytułem:

```markdown
:::ramka{tytul="Dla kogo"}

Dla osób, które lubią równania różniczkowe i chcą łączyć matematykę z programowaniem.

:::
```

Pozostałe znaczniki (`:::zakladki`, `:::tabela`, `:::kreski`, `:::tematy`, `:::specjalnosci`, wstawki `::opiekun`, `::seminaria`, `::wybor`) opisuje `dok/jawny-markdown.md`.

## Strony z listą, sekcje przenoszone, karty

- **Tekst nad listą:** tytuł, opis, hasło i tekst stron Seminaria, Konferencje, Projekty i granty, Sukcesy, Publikacje, Obrony doktorskie, Aktualności, Pracownicy, Struktura i zakłady, Warto wiedzieć i Plan zajęć to zwykłe Strony w repozytorium, z którego pochodzi lista, pod adresem strony z listą (np. `nauka/konferencje.md` → `/nauka/konferencje`). Tekst stoi nad listą. Brak takiej Strony nic nie psuje: lista ma domyślny tytuł i hasło, bez tekstu.
- **Sekcja przenoszona** (decyduje jawne id, nie nazwa nagłówka):
  - `## Ostatnie sukcesy {#sukcesy}` (EN: `## Recent achievements {#sukcesy}`) na końcu strony działu Instytut — zdanie nad ostatnimi sukcesami;
  - `## Czasopisma redagowane w Instytucie {#czasopisma}` (EN: `## Journals edited at the Institute {#czasopisma}`) na Stronie Publikacje — tekst nad listą czasopism; bez tego nagłówka czasopisma są bez tekstu.
- **Karty „Dla kogo” (Popularyzacja):** każda Strona z katalogu `popularyzacja/` ma kartę na stronie działu; tytuł karty = pole „Hasło” (puste = tytuł strony), zdanie = pole „Opis”.

## Szablony nowych wpisów i pola, których strona nie pokazuje

- **Szablon Treści:** nowy zakład, pozycja „Warto wiedzieć”, konferencja, projekt i referat startują z komentarzem w Treści, np. `<!-- TEKST: … -->` albo `<!-- STRESZCZENIE: … -->`. Treść z samym komentarzem liczy się jak pusta: wpis nie dostaje pustej podstrony ani pustego streszczenia. Konferencja i projekt z opisem mają własną stronę; konferencja bez opisu prowadzi od razu na swoją stronę internetową.
- **Opis strony dla Google** (dawniej „Wstęp pod tytułem”, strony działów) i **Krótki opis** Stron trafiają tylko do Google i do podglądu linku; nowy nagłówek ich nie pokazuje. Wyjątek: w Popularyzacji opis Strony to zdanie na karcie „Dla kogo”.
- **Hasło Strony** pokazuje się na banerze tylko razem z liczbami (hasło bez liczb i liczby bez hasła się nie wyświetlają). Listy Aktualności, Kalendarza, Obron, Ofert i „Warto wiedzieć” pokazują hasło także bez liczb.
- **Nadtytuł kierunku** (Kierunki → Baner) na stronie się nie wyświetla; strona liczy z niego stopnie studiów na stronie „Studia”.
- **Pola ukryte** (np. „Do uzupełnienia”, „Format treści”, dawne „Bloki wzorca”, hasło stron ze stopki): formularz ich nie pokazuje, wartości zostają w plikach.

## Aktualności: termin wydarzenia, zdjęcia i załączniki (zlecenie 31)

> **Wydarzenie = kliknij »Add an item« pod »Termin wydarzenia«; zwykła informacja = nic nie klikaj, dzień w polu »Data«.**

- **Termin wydarzenia** (pod „Rodzaj”): obowiązkowy jest tylko „Dzień”; puste pole po „Add an item” daje czerwone „Invalid date” i blokuje zapis. Bez godziny wydarzenie jest całodniowe. Godzinę wpisz jak 13:00 („9.30” też przejdzie, strona pokaże 09:30; „25:00” da czerwone „Wpisz godzinę w formacie 13:00”). Bez godziny zakończenia strona przyjmie 2 godziny po rozpoczęciu; „Dzień zakończenia” tylko przy wydarzeniach wielodniowych. Termin jest najwyżej jeden (przycisk „Add an item” znika); usuwasz go ikoną kosza.
- Wpis z terminem trafia do Kalendarza, „Nadchodzących wydarzeń”, pliku .ics i Szybkiego dostępu, a po końcu wydarzenia znika z Aktualności na stronie głównej. Wpis bez terminu to zwykła aktualność, także z rodzajem „Wydarzenie”. CMS nie wpisuje już sam żadnej daty wydarzenia.
- **Galeria i załączniki:** każda pozycja musi mieć zdjęcie albo plik. Pozycja pusta albo z samym podpisem daje czerwone „This field is required” i zapis jest zablokowany; zwinięta pozycja ma wtedy czerwony nagłówek, a na górze pojawia się „Please fix the errors before saving.”. Niepotrzebną pozycję usuń ikoną kosza („Remove item”). Tak samo w innych listach: recenzje obron (recenzent i plik), pliki referatów, liczby i fakty, przyciski, skróty i linki menu.
- **Nazwa pliku nowego wpisu** powstaje z tytułu przy pierwszym zapisie (np. `2026-11-18-medale-uniwersytetu.md`), więc tytuł wpisz przed zapisem. Późniejsza zmiana tytułu nie zmienia adresu wpisu. Tak samo w obronach, konferencjach, grantach i referatach.

## Szkic: przełącznik „Opublikowane” (zlecenie 33)

> **Nowa strona jest od razu opublikowana. Żeby przygotować ją po cichu, odznacz »Opublikowane«: wtedy widać ją tylko na Podglądzie, z żółtym paskiem i etykietą »szkic«.**

- Przełącznik stoi pod tytułem i tytułem EN w formularzach: Kierunki, Specjalności, Strony, Strona działu … (Web-Instytut, Web-Nauka, Web-Studia, Web-Popularyzacja), Zakłady i „Warto wiedzieć” (Web-Instytut).
- Na Podglądzie szkic widać zawsze. Pod paskiem menu jest żółty pasek, a plakietka stanu budowy (w rogu ekranu) ma żółty wiersz „Szkic: tej strony nie będzie na stronie publicznej. Włącz »Opublikowane« w CMS →” z linkiem do formularza tej strony. Przy każdym linku do szkicu (menu, listy, kafelki, tekst) stoi mała etykieta „szkic”.
- Na przyszłej stronie publicznej szkicu nie ma: znika strona, link w menu, kafelek, pozycja w liczbach, mapie strony i wyszukiwarce. Link do szkicu w tekście innej strony zostaje samym tekstem.
- Szkic strony działu: strona działu zostaje (prowadzi do niej menu), ale bez tekstu z formularza. Plakietka ma wtedy wiersz „Szkic: tekstu tej strony nie będzie na stronie publicznej (strona zostanie, bez tekstu)” z linkiem do formularza.
- Dymek „Nowa wersja strony gotowa — Odśwież” pojawia się tylko wtedy, gdy nowa budowa zmieniła otwartą stronę.
- Bez przełącznika: aktualności, obrony, konferencje, granty, seminaria, referaty i pracownicy.

## Gdzie co jest

| Co | Gdzie w Pages CMS |
|---|---|
| Treść strony kierunku (PL i EN) | Web-Studia → Kierunki → Treść Markdown, Treść Markdown EN |
| Zdanie pod nazwą, hasło, liczby w nagłówku kierunku | Web-Studia → Kierunki → Baner (nazwa pliku = nazwa pliku kierunku, np. `matematyka`; bez banera nagłówek ma samą nazwę; nadtytuł się nie wyświetla) |
| Przypomnienia na stronie głównej (np. deklaracja specjalności) | Web-Studia → Przypomnienia o terminach |
| Kolejność i napisy w menu „Studia” i na kafelkach strony głównej | Web-Ustawienia → Strona główna i kontakt → „Kierunki w menu „Studia” i kafelki na stronie głównej”. Nowy kierunek pojawi się w menu i kafelkach dopiero po dopisaniu go tutaj (robi to administrator). Każda pozycja ma wszystko wpisane: nazwa i opis w menu, nazwa, napis nad nią i zdanie na kafelku (puste pole zostaje puste na stronie). Studia podyplomowe to też kierunek (`/studia/podyplomowe`). |
| Treść strony specjalności (PL i EN), opiekunowie, zakład, seminaria, baner | Web-Studia → Specjalności (repozytoria Web-Spec-* nie są już czytane) |
| Kafelki specjalności na stronie kierunku | Web-Studia → Kierunki → Treść Markdown, blok `:::specjalnosci` (nowa specjalność nie dopisuje kafelka sama) |
| Tekst „O popularyzacji”, tytuł, „W skrócie”, lata tradycji | Web-Popularyzacja → Strona działu Popularyzacja |
| Karty „Dla kogo” na stronie Popularyzacji | Web-Popularyzacja → Strony (tytuł karty = Hasło, zdanie = Opis) |
| Tekst „O Instytucie” / „Badania w Instytucie” / „O studiach”, tytuł, hasło, „W skrócie” (Instytut: też godziny sekretariatu), opis strony dla Google | Web-Instytut / Web-Nauka / Web-Studia → Strona działu … |
| Tytuł, opis, hasło i tekst nad listą: Seminaria, Konferencje, Projekty i granty, Sukcesy, Publikacje (też hasło rocznika) | Web-Nauka → Strony → `seminaria`, `nauka/konferencje`, `nauka/granty`, `nauka/sukcesy`, `nauka/publikacje` |
| To samo: Struktura i zakłady, Warto wiedzieć | Web-Instytut → Strony → `instytut/struktura`, `warto-wiedziec` |
| To samo: Aktualności, Obrony doktorskie (też hasło strony obrony) | Web-Aktualnosci → Strony → `aktualnosci`, `obrony-doktorskie` |
| To samo: Pracownicy; Plan zajęć | Web-Pracownicy → Strony → `pracownicy`; Web-Studia → Strony → `studia/plan-zajec` |
| Termin wydarzenia (Kalendarz, nadchodzące wydarzenia, .ics) | Web-Aktualnosci → Aktualności → Termin wydarzenia (pod „Rodzaj”; zwykła informacja: tylko „Data”) |
| Deklaracja dostępności, Polityka prywatności, O stronie (linki w stopce) | Web-Ustawienia → formularze o tych nazwach (jawny Markdown; tylko administrator) |
| Zdjęcia i kadry nagłówków działów, ikony Facebooka i YouTube w stopce | Web-Ustawienia → Strona główna i kontakt → Nagłówki działów; Facebook; YouTube (tylko administrator) |

**Stały adres sekcji w jawnym Markdownie** to `{#id}` przy nagłówku `##` (np. `## Terminy {#terminy}`); przy migracji każdy nagłówek dostał id z dawnym adresem, więc linki działają jak przedtem. Zmieniając nazwę nagłówka, id zostaw; bez `{#…}` adres powstaje z tekstu nagłówka. Kotwicy w HTML (`<a id="…">`) w treści nie wpisuj.

Dawny format (Strony Web-Aktualnosci): stałe kotwice nazw sekcji (np. `#terminy`) są w `src/plugins/kotwice.mjs` (typ `strona` — strony działów i strony z listą, typ `naglowek` — zwykłe strony); inny nagłówek 2 dostaje kotwicę z tekstu. Kotwica w HTML nie przetrwa zapisu, stała kotwica idzie do `kotwice.mjs`.
