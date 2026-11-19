# Ściągawka edytora: Strony, strony działów, kierunki, wpisy i aktualności

W Pages CMS są dwa rodzaje tekstu (zlecenie 40):

- **Jawny Markdown** — kierunki i specjalności (Web-Studia) oraz Strony i strona działu w Web-Instytut, Web-Nauka, Web-Studia, Web-Popularyzacja, Web-Aktualnosci, Web-Pracownicy, strony ze stopki (Web-Ustawienia: deklaracja dostępności, polityka prywatności, „O stronie”) i od zlecenia 47 „Warto wiedzieć” (Web-Instytut: sylwetki, nagrody, historie). Zwykły tekst, listy i tabele piszesz bez znaczników, specjalny układ (kafelki, oś kroków, pytania, pliki, kontakty) zamykasz w bloku `:::nazwa` … `:::`. Pełny opis: `dok/jawny-markdown.md`. Plik ma `format_tresci: jawne` (ukryte pole formularza; nowa Strona dostaje je sama).
- **Zwykły Markdown** — wpisy: aktualności, obrony, zakłady, konferencje, projekty i granty, opisy seminariów i referaty. Bez bloków `:::`; wzory w LaTeX-u (`$\ell^2$`).

**Formularze:** tytuł, tytuł EN (i „Opublikowane”) → Treść, Treść EN → reszta pól; pola EN tuż pod polskimi, z etykietą „… EN”. Puste pole EN = strona angielska pokaże tekst polski. Pole Treść to edytor Markdownu (pole `code`): wygląd sprawdzasz na Podglądzie po przebudowaniu (ok. 10 minut).

## Ściągawka w opisie pola „Treść”

Strony i strony działów (jawny Markdown):

> Jawny Markdown: ## rozpoczyna sekcję i pozycję spisu; {#id} zachowuje adres sekcji. Zwykły tekst jest prozą domyślnie; nie wymaga otaczających znaczników. Specjalne układy wymagają znaczników, np. :::kafelki, :::etapy, :::zakladki. Komentarze <!-- … --> objaśniają bloki; na stronie ich nie widać. Zachowaj pasujące końcowe dwukropki. Plik PDF: wgraj w „Media” i wklej link. Wygląd sprawdzaj po przebudowaniu strony (Podgląd).

W „Stronach studiów” (Web-Studia) lista przykładowych bloków ma też `:::pary` i `:::grafik` (zlecenie 45; w Treści EN: „pusty blok wstawia grafik z wersji polskiej”). Formularz dopisuje do tego, co dotyczy danej strony, np. na stronie działu Instytut: „Zdanie nad ostatnimi sukcesami: na końcu, pod „## Ostatnie sukcesy {#sukcesy}””; na stronie Pracownicy: „tekst stoi nad listą osób”. Kierunki i specjalności mają własny, dłuższy opis (Web-Studia).

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

Pary etykieta–treść (etykieta w kolumnie obok treści; na telefonie nad treścią):

```markdown
:::pary
- **Gdzie:** sala 202 na poziomie 200.
- **Dla kogo:** dla wszystkich studentów.
:::
```

Grafik dyżurów (zlecenie 45, Tutornia; tylko zwykłe Strony, jeden blok na stronę). Strona rysuje z niego plan tygodnia, ramkę „Teraz” nad treścią, liczby banera i podpis kafelka „Tutornia” w Szybkim dostępie:

```markdown
:::grafik
Sala: 202
Od: 19.10.2026
Do:

- pon. 12:15–14:00 **Paulina Pawlik** — AM1, AM3, Algebra liniowa 1
- śr. 14:15–16:00 **Jacek Kowalski** — AM1, Algebra liniowa 1
:::
```

- jeden dyżur na linię: dzień, godziny, **imię i nazwisko**, po `—` przedmioty; kolejność linii dowolna;
- `Do:` puste = do końca zajęć semestru; dni wolne i zamiany dni strona bierze z „Kalendarza zajęć”;
- w Treści EN wystarczy pusty blok (`:::grafik` i `:::`) — grafik przyjdzie z wersji polskiej;
- linia, której strona nie rozumie, nie psuje budowy: nie ma jej w planie, a na Podglądzie nad planem stoi czerwona ramka z numerem linii i powodem.

Pozostałe znaczniki (`:::zakladki`, `:::tabela`, `:::kreski`, `:::tematy`, `:::specjalnosci`, wstawki `::opiekun`, `::seminaria`, `::wybor`) opisuje `dok/jawny-markdown.md`.

## Strony z listą, sekcje przenoszone, karty

- **Tekst nad listą:** tytuł, opis, hasło i tekst stron Seminaria, Konferencje, Projekty i granty, Sukcesy, Publikacje, Obrony doktorskie, Aktualności, Kariera, Pracownicy, Struktura i zakłady, Warto wiedzieć i Plan zajęć to zwykłe Strony w repozytorium, z którego pochodzi lista, pod adresem strony z listą (np. `nauka/konferencje.md` → `/nauka/konferencje`). Tekst stoi nad listą. Brak takiej Strony nic nie psuje: lista ma domyślny tytuł i hasło, bez tekstu.
- **Sekcja przenoszona** (decyduje jawne id, nie nazwa nagłówka):
  - `## Ostatnie sukcesy {#sukcesy}` (EN: `## Recent achievements {#sukcesy}`) na końcu strony działu Instytut — zdanie nad ostatnimi sukcesami;
  - `## Czasopisma redagowane w Instytucie {#czasopisma}` (EN: `## Journals edited at the Institute {#czasopisma}`) na Stronie Publikacje — tekst nad listą czasopism; bez tego nagłówka czasopisma są bez tekstu.
- **Karty „Dla kogo” (Popularyzacja):** każda Strona z katalogu `popularyzacja/` ma kartę na stronie działu; tytuł karty = pole „Hasło” (puste = tytuł strony), zdanie = pole „Opis”.

## Szablony nowych wpisów i pola, których strona nie pokazuje

- **Szablon Treści:** nowa aktualność, obrona, zakład, pozycja „Warto wiedzieć”, konferencja, projekt i referat startują z komentarzem w Treści, np. `<!-- TEKST: … -->` albo `<!-- STRESZCZENIE: … -->`. Treść z samym komentarzem liczy się jak pusta: wpis nie dostaje pustej podstrony ani pustego streszczenia, a obrona dostaje zaproszenie złożone z danych. Konferencja i projekt z opisem mają własną stronę; konferencja bez opisu prowadzi od razu na swoją stronę internetową.
- **Opis strony dla Google** (dawniej „Wstęp pod tytułem”, strony działów) i **Krótki opis** Stron trafiają tylko do Google i do podglądu linku; nowy nagłówek ich nie pokazuje. Wyjątek: w Popularyzacji opis Strony to zdanie na karcie „Dla kogo”.
- **Hasło Strony** pokazuje się na banerze tylko razem z liczbami (hasło bez liczb i liczby bez hasła się nie wyświetlają). Listy Aktualności, Kalendarza, Obron, Ofert i „Warto wiedzieć” pokazują hasło także bez liczb.
- **Nadtytuł kierunku** (Kierunki → Baner) na stronie się nie wyświetla; strona liczy z niego stopnie studiów na stronie „Studia”.
- **Pola ukryte** (np. „Do uzupełnienia”, „Format treści”, dawne „Bloki wzorca”, hasło stron ze stopki): formularz ich nie pokazuje, wartości zostają w plikach.

## Aktualności: termin wydarzenia, zdjęcia i załączniki (zlecenie 31)

> **Wydarzenie = kliknij »Add an item« pod »Termin wydarzenia«; zwykła informacja = nic nie klikaj, dzień w polu »Data«.**

- **Termin wydarzenia** (pod „Rodzaj”): obowiązkowy jest tylko „Dzień”; puste pole po „Add an item” daje czerwone „Invalid date” i blokuje zapis. Bez godziny wydarzenie jest całodniowe. Godzinę wpisz jak 13:00 („9.30” też przejdzie, strona pokaże 09:30; „25:00” da czerwone „Wpisz godzinę w formacie 13:00”). Bez godziny zakończenia strona przyjmie 2 godziny po rozpoczęciu; „Dzień zakończenia” tylko przy wydarzeniach wielodniowych. Termin jest najwyżej jeden (przycisk „Add an item” znika); usuwasz go ikoną kosza.
- Wpis z terminem trafia do Kalendarza, „Nadchodzących wydarzeń”, pliku .ics i Szybkiego dostępu, a po końcu wydarzenia znika z Aktualności na stronie głównej. Wpis bez terminu to zwykła aktualność, także z rodzajem „Wydarzenie”. CMS nie wpisuje już sam żadnej daty wydarzenia.
- **Seminarium wydziałowe:** Rodzaj „Wydarzenie” i „Termin wydarzenia”. W tytule „Seminarium wydziałowe — prof. Jan Kowalski” (EN „Faculty seminar — Prof. Jan Kowalski”), w zajawce tytuł wykładu. Osobnego rodzaju „Seminarium wydziałowe” już nie ma (zlecenie 54 cofnęło 49).
- **Zajawka** (1–2 zdania) pokazuje się na listach, na stronie głównej, w Kalendarzu i w podglądzie linku (np. na Facebooku), ale nie na stronie wpisu (zlecenie 46). Może więc powtarzać pierwsze zdanie treści. Wyjątek: wpis bez treści (albo z samymi komentarzami `<!-- … -->`) pokazuje zajawkę zamiast tekstu. „Zajawka EN” działa tak samo; strona angielska bez Treści EN pokazuje tekst polski, więc też bez zajawki.
- **Galeria i załączniki:** każda pozycja musi mieć zdjęcie albo plik. Pozycja pusta albo z samym podpisem daje czerwone „This field is required” i zapis jest zablokowany; zwinięta pozycja ma wtedy czerwony nagłówek, a na górze pojawia się „Please fix the errors before saving.”. Niepotrzebną pozycję usuń ikoną kosza („Remove item”). Tak samo w innych listach: recenzje obron (recenzent i plik), pliki referatów, liczby i fakty, przyciski, skróty i linki menu.
- **Nazwa pliku nowego wpisu** powstaje z tytułu przy pierwszym zapisie (np. `2026-11-18-medale-uniwersytetu.md`), więc tytuł wpisz przed zapisem. Późniejsza zmiana tytułu nie zmienia adresu wpisu. Tak samo w obronach, konferencjach, grantach i referatach.

## Szkic: przełącznik „Opublikowane” (zlecenia 33 i 48)

> **Nowa strona jest od razu opublikowana. Żeby przygotować ją po cichu, odznacz »Opublikowane«: wtedy widać ją tylko na Podglądzie, z żółtym paskiem i etykietą »szkic«.**

- Przełącznik stoi pod tytułem i tytułem EN (referat nie ma tytułu EN: zaraz pod tytułem) w formularzach: Kierunki, Specjalności, Strony, Strona działu … (Web-Instytut, Web-Nauka, Web-Studia, Web-Popularyzacja), Zakłady, trzy formularze grupy „Warto wiedzieć”: Sylwetki, Nagrody i wyróżnienia, Historie (Web-Instytut), a od zlecenia 48 także Aktualności (Web-Aktualnosci, razem z ofertami „Kariera”) oraz opis seminarium i Referaty (każde z 9 repozytoriów seminariów Web-Sem-…). Redaktor seminarium nie musi go dotykać: jest domyślnie włączony.
- Na Podglądzie szkic widać zawsze. Pod paskiem menu jest żółty pasek, a plakietka stanu budowy (w rogu ekranu) ma żółty wiersz „Szkic: tej strony nie będzie na stronie publicznej. Włącz »Opublikowane« w CMS →” z linkiem do formularza tej strony. Przy każdym linku do szkicu (menu, listy, kafelki, tekst) stoi mała etykieta „szkic”.
- Na przyszłej stronie publicznej szkicu nie ma: znika strona, link w menu, kafelek, pozycja w liczbach, mapie strony i wyszukiwarce. Link do szkicu w tekście innej strony zostaje samym tekstem.
- Szkic strony działu: strona działu zostaje (prowadzi do niej menu), ale bez tekstu z formularza. Plakietka ma wtedy wiersz „Szkic: tekstu tej strony nie będzie na stronie publicznej (strona zostanie, bez tekstu)” z linkiem do formularza.
- Dymek „Nowa wersja strony gotowa — Odśwież” pojawia się tylko wtedy, gdy nowa budowa zmieniła otwartą stronę.
- **Odznaczenie »Opublikowane« w opisie seminarium ukrywa całe seminarium razem z referatami.** Na stronie publicznej znika strona seminarium, pozycja na liście seminariów, w Kalendarzu i na stronach kierunków i specjalności, a z nim wszystkie jego referaty (także z „Najbliższych seminariów” i plików kalendarza).
- Referat nie ma własnej strony (to pozycja na stronie seminarium). Referat-szkic widać na Podglądzie z etykietą „szkic” przy tytule, a plakietka strony seminarium ma żółty wiersz „Szkic: referatu „…” nie będzie na stronie publicznej. Włącz »Opublikowane« w CMS →”. Na stronie publicznej znika z zapowiedzi i archiwum seminarium, z „Najbliższych seminariów” na stronie głównej, z Kalendarza i plików kalendarza i nie wchodzi do liczb („zapowiedziane referaty”, „referaty w archiwum”).
- Aktualność-szkic (także oferta „Kariera”) znika z listy Aktualności, ze strony głównej, z Kalendarza, z Kariery i ze strony Studiów, a liczby (okładka, ramka Kariery, banery) liczą się bez niej. Powiększona na liście jest zawsze najnowsza opublikowana aktualność.
- Bez przełącznika: obrony, konferencje, granty i pracownicy.

## „Warto wiedzieć”: sylwetki, nagrody i historie (zlecenie 47)

> **Nowa pozycja: Web-Instytut → Warto wiedzieć → Sylwetki / Nagrody i wyróżnienia / Historie → „Add an entry”. Tytuł (imię i nazwisko) wpisz przed pierwszym zapisem: z niego powstaje nazwa pliku i adres `/instytut/warto-wiedziec/<plik>`.**

- **Trzy grupy, jeden adres.** Strona `/instytut/warto-wiedziec` pokazuje siatkę sylwetek, listę nagród i oś czasu historii. Adres każdego wpisu jest płaski (`/instytut/warto-wiedziec/hugo-steinhaus`), więc nazwa pliku nie może się powtórzyć w dwóch grupach: drugi wpis o tej samej nazwie strona pominie (ostrzeżenie w logu budowy i w `sprawdz_tresci.py`).
- **Sylwetka:** Imię i nazwisko, „Lata”, podpis (jedno zdanie), „Liczby w banerze”, rocznica urodzin (MM-DD), portret ze źródłem zdjęcia w „Karcie”. Każda sylwetka ma stronę. Kolejność w siatce: rok urodzenia z pola „Lata”. Na stronie osoby wstęp (tekst przed pierwszym `##`) opływa portret, a sekcje `##` zaczynają się pod nim.
- **Nagroda:** tytuł, „Kolejność” (10, 20, 30…; mniejsza = wyżej), w „Karcie” zajawka, zdjęcie z opisem i link z napisem na przycisku. Własną stronę ma tylko nagroda z Treścią; bez Treści karta prowadzi do linku.
- **Historia:** tytuł, w „Karcie” **Rok** (wymagany: stawia punkt na osi czasu), zajawka (1–2 zdania: pokazuje się w panelu osi), rocznica (MM-DD: przez 7 dni przed i po niej historia ma pierwszeństwo na stronie głównej, a oś startuje od niej). Bez Treści punkt osi prowadzi do linku z karty.
- **TBA:** sylwetka z pustą Treścią (albo z samymi komentarzami `<!-- … -->`) ma stronę z imieniem, latami, portretem zastępczym i ramką „TBA: sylwetka w przygotowaniu”; na Podglądzie dodatkowo zdanie „wpisz tekst w CMS (Warto wiedzieć → Sylwetki) i zapisz”. Na liście ma znaczek „TBA”, nie liczy się w banerze i nie losuje się na stronie głównej ani w „Innych sylwetkach”.
- **„Lata”:** `1887–1972` (dwie daty, dowolna kreska i spacje) albo `1956` (= „ur. 1956”, po angielsku „b. 1956”). Inny tekst (np. `xxxx`, `ok. 1900`) pokaże się tak, jak wpisany, z ostrzeżeniem „Lata: nie data”. Puste = bez lat. Lata stoją raz, pod portretem.
- **„Dodano” i „Nowe”:** dzień dodania wpisu (RRRR-MM-DD). Przez 30 dni wpis ma znaczek „Nowe” (na liście; sylwetka na stronie głównej: „Nowa sylwetka”), potem znaczek znika sam. Ustaw tylko przy nowym wpisie albo przy publikacji szkicu, nie przy poprawkach. Puste = bez „Nowe”.
- **Szkic osoby żyjącej:** sylwetka osoby żyjącej jest szkicem (odznaczone „Opublikowane”), dopóki osoba nie zaakceptuje tekstu: widać ją tylko na Podglądzie, z etykietą „szkic”; na stronie publicznej nie ma jej w siatce, liczbach, „Innych sylwetkach”, na stronie głównej, w mapie strony i w wyszukiwarce, a linki do niej (laureaci, teksty innych sylwetek) zostają samym tekstem. **Opublikowanie szkicu po akceptacji: włącz »Opublikowane« i ustaw »Dodano« na ten dzień.**
- **„Liczby w banerze (3 pozycje)”** (sylwetka, pole pod „Podpis EN”; zlecenie 52): trzy krótkie pozycje pod podpisem na banerze, np. „1945 · pierwszy dziekan”, „20 · doktorów”. Liczba: same cyfry (rok, liczba, `1800+`); podpis: najwyżej ok. 20 znaków, małą literą, bez linków. „Liczba EN” i „Podpis EN” puste = jak po polsku. Pokazują się pierwsze trzy (więcej = ostrzeżenie w logu budowy). Puste pole = baner bez liczb.
- **Figurka w banerze sylwetki** (bez opisu) losuje się przy każdym wejściu z figurek Instytutu (ulubione częściej); nie powtarza figurki z poprzedniej sylwetki ani ciekawostki, którą w tej wizycie pokazała lista „Warto wiedzieć”. Na komputerze imię i nazwisko stoi zawsze w jednej linii: gdy się obok figurki nie mieści, figurka znika. Bez JavaScriptu figurka jest stała (zależy od nazwy pliku).
- **`:::w-skrocie` już się nie wpisuje** (do zlecenia 52: liczby obok portretu w Treści). Liczby do banera wpisuje się w polu „Liczby”. Stary plik z blokiem i pustym polem „Liczby”: baner weźmie pierwsze 3 punkty bloku (bez linków, podpis skrócony), w treści bloku nie ma, a log budowy ma ostrzeżenie „przenieś do pola Liczby”.
- **`:::laureaci`** (nagroda, w sekcji `## Laureaci z Instytutu {#laureaci}`): jedna osoba na linię, `- **2026** Imię Nazwisko — [aktualność](/aktualnosci/…)` (część po ` — ` jest opcjonalna). Link do sylwetki (`[Imię Nazwisko](/instytut/warto-wiedziec/imie-nazwisko)`, także z „prof.” przed linkiem) daje mini portret, kartę w „Sylwetkach laureatów” i wpis w „Zobacz też” na stronie osoby. Licznik „N laureatów z Instytutu” na liście liczy się sam. Nagroda z laureatami nie losuje się na stronie głównej.
- **Nagłówki sekcji:** zalecany zapis to nadal `## Tytuł {#id}` (`{#id}` działa też bez spacji, np. `## Tytuł{#id}`). Tekst wklejony np. z czatu AI strona poprawia sama (zlecenie 53): usuwa `#` z imieniem i nazwiskiem albo tytułem wpisu na początku Treści, pozostałe `#` traktuje jak `##`, a gdy w Treści nie ma żadnego `##`, najwyższe użyte nagłówki (np. `###`) stają się sekcjami. Strona wygląda wtedy jak inne wpisy, a log budowy ma ostrzeżenie „nagłówki poprawione automatycznie”.
- **„Do pobrania”** (np. noty biograficzne; tylko pliki, których nie ma w „Źródłach”): sekcja `## Do pobrania {#do-pobrania}` z blokiem `:::pliki` (jak na Stronach: `- [Nota biograficzna](/pliki/….pdf) — opis`).
- **„Źródła”**: sekcja `## Źródła {#zrodla}` na końcu Treści; na stronie jest zwinięta, z liczbą („22 źródła · rozwiń”).
- **Powiązania biorą się z linków:** link w Treści nagrody albo historii do sylwetki (`/instytut/warto-wiedziec/<plik>`) dodaje kartę osoby w „Ludzie w tej historii” (przy nagrodzie z laureatami: „Sylwetki laureatów”) i ten wpis w „Zobacz też” na stronie osoby. Samo nazwisko bez linku powiązania nie daje. Pola „Osoby” nie ma.
- **Strona główna:** rząd „Warto wiedzieć” losuje wpisy z włączonym „Pokaż na stronie głównej”: najpierw rocznice (±7 dni: „140. urodziny · 14 stycznia”, „81 lat temu · 15 listopada”), potem „Zawsze pokazuj”, potem najnowsza „Nowa sylwetka”, resztę losowo („Ulubione” 3× częściej). Bez nagród z laureatami, TBA i (na stronie angielskiej) wpisów bez Treści EN.
- **Wersja angielska:** pusta Treść EN przy wypełnionej polskiej = strona angielska z ramką „Translation in preparation” i linkiem „Read in Polish →”, na liście EN znaczek „PL”. Puste tytuł, zajawka albo podpis EN = tekst polski.
- **Styl tekstu (zlecenie 54; sylwetki, nagrody i historie):**
  - **Tytuł naukowy** ma w sylwetce tylko jej bohater, tylko przy pierwszej wzmiance i krótko: „Prof. Hugo Steinhaus należy…”, „Dr Krzysztof Tabisz jest…” (nie „Profesor” ani „Prof. dr hab.”).
    - Dalej samo nazwisko albo „jego”/„jej”.
    - Inne osoby bez tytułów. Opis kariery („był profesorem we Lwowie”) zostaje.
    - Pole „Imię i nazwisko” (baner) i zajawka bez tytułów. Zajawka nie zaczyna się od imienia i nazwiska, bo karta pokazuje je nad nią.
    - W nagrodzie i historii tytuł ma najwyżej laureat albo główna osoba wpisu, przy pierwszej wzmiance.
  - **Pierwsze zdanie sylwetki** to ciągłe zdanie, bez definicji z myślnikiem („X (1900–1980) – matematyk…”) i bez lat w nawiasie: lata stoją pod portretem.
  - **Bez pogrubień w tekście.** Zostają tylko:
    - hasło na początku akapitu wyliczenia (`**Twierdzenie Knastera–Tarskiego (1928).** …`);
    - rok w `:::laureaci`.

    Powiązanie z sylwetką daje link, nie pogrubienie.
  - **Publikacja ze „Źródeł”** wspomniana w tekście jest linkiem do niej.

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
| To samo: Struktura i zakłady, Warto wiedzieć | Web-Instytut → Strony → `instytut/struktura`, `instytut/warto-wiedziec` |
| Sylwetki, nagrody i wyróżnienia, historie (`/instytut/warto-wiedziec`) | Web-Instytut → Warto wiedzieć → Sylwetki / Nagrody i wyróżnienia / Historie (opis niżej: „Warto wiedzieć”) |
| Laureaci nagrody (licznik na liście, portrety) | Web-Instytut → Warto wiedzieć → Nagrody i wyróżnienia → Treść, blok `:::laureaci` |
| To samo: Aktualności, Kariera (oferty), Obrony doktorskie (też hasło strony obrony) | Web-Aktualnosci → Strony → `aktualnosci`, `kariera`, `obrony-doktorskie` |
| To samo: Pracownicy; Plan zajęć | Web-Pracownicy → Strony → `pracownicy`; Web-Studia → Strony → `studia/plan-zajec` |
| Termin wydarzenia (Kalendarz, nadchodzące wydarzenia, .ics) | Web-Aktualnosci → Aktualności → Termin wydarzenia (pod „Rodzaj”; zwykła informacja: tylko „Data”) |
| Deklaracja dostępności, Polityka prywatności, O stronie (linki w stopce) | Web-Ustawienia → formularze o tych nazwach (jawny Markdown; tylko administrator) |
| Zdjęcia i kadry nagłówków działów, ikony Facebooka i YouTube w stopce | Web-Ustawienia → Strona główna i kontakt → Nagłówki działów; Facebook; YouTube (tylko administrator) |
| Grafik dyżurów Tutorni (plan, ramka „Teraz”, liczby w banerze, podpis kafelka w Szybkim dostępie) | Web-Studia → Strony studiów → `studia/tutornia` → Treść, blok `:::grafik` (Treść EN: pusty blok) |
| Link przy pozycji „W skrócie” (np. „Tutornia →”) | Web-Studia / Web-Instytut / Web-Nauka / Web-Popularyzacja → Strona działu … → „W skrócie” → „Link (opcjonalnie)” |
| Kafelki „Szybki dostęp” na stronie głównej (pierwsze pięć) | Web-Ustawienia → Kafelki „Na skróty” (tylko właściciel); kafelek z adresem strony z grafikiem dyżurów ma podpis na żywo |

**Stały adres sekcji w jawnym Markdownie** to `{#id}` przy nagłówku `##` (np. `## Terminy {#terminy}`); przy migracji każdy nagłówek dostał id z dawnym adresem, więc linki działają jak przedtem. Zmieniając nazwę nagłówka, id zostaw; bez `{#…}` adres powstaje z tekstu nagłówka. Kotwicy w HTML (`<a id="…">`) w treści nie wpisuj.

Dawny format (plik bez `format_tresci: jawne`; od etapu 3 zlecenia 40 żadna Strona): stałe kotwice nazw sekcji (np. `#terminy`) są w `src/plugins/kotwice.mjs` (typ `strona` — strony działów i strony z listą, typ `naglowek` — zwykłe strony); inny nagłówek 2 dostaje kotwicę z tekstu. Kotwica w HTML nie przetrwa zapisu, stała kotwica idzie do `kotwice.mjs`.
