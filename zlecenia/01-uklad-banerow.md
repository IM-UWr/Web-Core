# Zlecenie 01: wspólny układ banerów na telefonie

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`.

## Cel
Działy (Instytut, Nauka, Studia, Aktualności, Kalendarz) mają już na telefonie baner w układzie: „← poziom wyżej”, biały tytuł, bursztynowe hasło, cienka kreska i 3 liczby w 3 kolumnach. Podstrony mają dziś inny układ: szary opis na 2–3 linie, przyciski i listy koordynatorów w banerze, banery od 226 do 468 px.

**Zadanie: ten sam szkielet na wszystkich podstronach, tylko na telefonie.** Użytkownik zaakceptował prototyp („Tak, to wygląda świetnie. Wdrażamy”).

## Prototyp
- `.przekazanie\prototypy\uklad-banerow.html`: zrzuty 390 px „obecnie / propozycja” dla 12 stron, z wysokościami banerów i opisem każdej zmiany.
- `.przekazanie\prototypy\uklad-banerow-zmiany-dom.js` i `uklad-banerow-pracownicy-filtry.js`: skrypty Playwright, które zbudowały propozycje przez zmianę DOM prawdziwych stron. Pokazują dokładnie, które elementy usunąć, przenieść albo dodać. Klasy `.ph-haslo` i `.pt-liczby` są już w `telefon.css` i `portal.css`.

## Szkielet banera (telefon)
1. `← poziom wyżej` (`nav.wstecz`)
2. nadtytuł (`.eyebrow`), tylko tam, gdzie jest dziś (kierunki, specjalności)
3. tytuł `h1`
4. hasło `p.ph-haslo.tylko-telefon`: jedna linia, bursztynowe
5. kreska i 3 liczby `ul.pt-liczby.tylko-telefon`. Gdy liczby byłyby sztuczne, nie ma ani kreski, ani liczb.

- **Długi opis (`lead`)** na telefonie znika z banera, gdy strona ma hasło. Ten mechanizm już działa w `NaglowekStrony.astro`: przy haśle `lead` dostaje `.tylko-komputer`. Na komputerze opis zostaje.
- **Wszystko, co się klika** (przyciski, koordynatorzy, filtry), leży pod banerem albo znika z telefonu, jak opisano niżej.
- **Liczby:** rozszerz `LiczbyBanera.astro` albo dodaj obok wariant, który przyjmuje liczbę albo krótki napis (np. „3 lata”, „I i II”, „20 paź”) i etykietę bez okresu. Dzisiejsze użycie w Aktualnościach i Kalendarzu ma działać dalej.
- **Rysunek w banerze na telefonie** (`.ph-m`) ma być szary jak w Aktualnościach na **wszystkich** stronach, bo jedynym bursztynem jest hasło. Dziś bursztynowe zostały: motyl Lorenza na Nauce i jej podstronach (Seminaria, Granty, Obrony, Kalendarz…) oraz trójkąt na podstronach Instytutu. Docelowo rysunki zastąpią animacje (zlecenia 02–05); do tego czasu mają być szare.

## Strony: hasło (robocze, w danych) i liczby
Hasła są robocze i trafiają do danych (zob. zasady). Wartości liczb w nawiasach to stan na 31.10, do kontroli; liczyć je ma kod. Hasła stron spoza tej tabeli są w prototypach animacji (`animacje-*.html`, obiekty z polami `haslo` w skrypcie). Przy różnicy wygrywa ta tabela.

| Strona (widok) | Hasło robocze | Liczby (etykiety) | Inne zmiany na telefonie |
|---|---|---|---|
| Aktualności (`ListaAktualnosci`) | bez zmian | **nowe ogłoszenia** (ogłoszenia z ostatnich 30 dni) · **nadchodzące wydarzenia** · **zapowiedziane referaty** (2 · 4 · 5); etykiety bez „z 30 dni” | — |
| Kalendarz (`Kalendarz`) | bez zmian („Co, gdzie i kiedy”) | **nadchodzące obrony** · **zapowiedziane referaty** · **nadchodzące wydarzenia** (2 · 5 · 4) | rysunek szary |
| Kierunek (`Kierunek`): Matematyka | „Od teorii do zastosowań” | 3 lata (studia I stopnia) · 2 lata (studia II stopnia) · 5 (specjalności) | **usuń z telefonu wszystkie przyciski** (Rekrutacja, Plan zajęć, Katalog przedmiotów, Program studiów: `.kh-btns`) oraz **kafelki faktów** (`.kh-fakty`); pod banerem od razu „Na tej stronie” i „O kierunku” |
| Kierunek: SIAD | „Matematyka, informatyka i AI” | 6 (semestrów) · 180 (punktów ECTS) · 70 (ECTS do wyboru) | jak Matematyka |
| Kierunek: ISIM | „Własny plan studiów z tutorem” | 3 lata (studia I stopnia) · 210 (punktów ECTS) · 2 (instytuty prowadzące) | jak Matematyka |
| Specjalność (`Specjalnosc`) | z prototypu `animacje-kierunki.html` | jak w tym prototypie (stopnie · semestr wyboru · przedmioty specjalności) | nadtytuł „Specjalność” |
| Lista seminariów (`ListaSeminariow`) | „Otwarte dla wszystkich” | seminaria · zapowiedziane referaty · referaty w archiwum (9 · 5 · 22) | link powrotu bez zmian („← Nauka”) |
| Seminarium (`Seminarium`) | **o tematyce, nie o terminie**; pole `haslo` w danych seminarium, a puste pole daje nazwę zakładu; robocze np. Analiza harmoniczna: „Operatory, mnożniki, rozwinięcia”, pozostałe z `animacje-analiza.html` i `animacje-struktury.html` | zapowiedziane referaty · referaty w archiwum · koordynatorzy (np. 1 · 2 · 5) | koordynatorzy, e-mail i zakład w zwartym bloku **pod** banerem (wzór w `uklad-banerow-zmiany-dom.js`, strona `seminarium`); **link powrotu „← Seminaria”** zamiast „← Wszystkie seminaria” |
| Zakład (`Zaklad`) | z `animacje-analiza.html` / `animacje-struktury.html` | pracownicy · projekty · konferencje (zera pomijane) | — |
| Struktura i zakłady (`ListaZakladow`) | „Osiem zakładów i pracownia” | profesorowie · doktorzy habilitowani · doktorzy (18 · 16 · 43) | — |
| Projekty i granty (`ListaGrantow`) | „Projekty NCN, unijne i inne” | realizowane projekty · zakończone · projekty łącznie (5 · 87 · 94) | — |
| Grant (`Grant`) | składane automatycznie z pól grantu: źródło lub program i lata realizacji, np. „NCN OPUS · 2024–2028” | bez liczb | — |
| Publikacje (`Publikacje`) | „Nasze wyniki, rok po roku” | jak w `animacje-badania.html` | — |
| Rocznik publikacji (`PublikacjeRok`) | „Rocznik prac Instytutu” | jak w `animacje-badania.html` | — |
| Sukcesy (`ListaSukcesow`) i zestawienie historyczne | „Nagrody, granty, stypendia” / „Wybrane wyróżnienia do 2014 r.” | jak w `animacje-badania.html` | — |
| Obrony doktorskie (`ListaObron`) | „Publiczne obrony rozpraw” | **2 liczby**: nadchodzące obrony · odbyte obrony | — |
| Obrona (`Obrona`) | „Publiczna obrona doktoratu” | data (dzień, rok) · godzina (sala) · recenzje, np. „20 paź” · „14:00” · „3” | tytuł bez zmian (imię i nazwisko); **link powrotu „← Obrony doktorskie”** zamiast „← Wszystkie obrony doktorskie” |
| Konferencje (`ListaKonferencji`) | „Spotkania, które współtworzymy” | w bieżącym roku · od pierwszego roku w danych · we Wrocławiu (bez odwołanych) | — |
| Pracownicy (`Pracownicy`) | „Kontakt do każdego z nas” | osoby · zakłady · doktoranci (129 · 8 · 17) | **filtry w jednym wierszu**, tak jak w Aktualnościach (zob. niżej) |
| Władze (`Wladze`) | „Dyrekcja i sekretariat” | **bez kreski i liczb** | — |
| Plan zajęć (`PlanZajec`) | „Zawsze aktualny, prosto z USOS” | **bez kreski i liczb** | — |
| Rok akademicki (`RokAkademicki`) | „Semestry, sesje, kolory dni” | dni zajęć · dni niebieskie · dni pomarańczowe (75 · 40 · 35) | — |
| Pozostałe strony Studiów (`Strona` i inne) | z `animacje-studia-codziennosc.html` | tylko tam, gdzie ma je prototyp (Egzaminy i dyplom, Szkoła doktorska, Dokumenty, Studia podyplomowe, Skrypty); inne bez kreski i liczb | — |
| Kontakt, Infrastruktura informatyczna | „pl. Grunwaldzki 2, Wrocław” / „Sieć, pracownie, programy” | bez kreski i liczb | — |
| Warto wiedzieć: lista / wpis | „Czym chwalimy się od lat” / wpis: składane automatycznie „rok · dział”, np. „2017 · Nauka” | bez kreski i liczb | — |
| Szukaj (`Szukaj`) | „Osoby, referaty i ogłoszenia” | bez kreski i liczb | — |
| Deklaracja dostępności / Polityka prywatności | „Jak dbamy o dostępność” / „Jakie dane zbieramy i po co” | bez kreski i liczb | — |
| Działy Instytut, Nauka, Studia, Popularyzacja | bez zmian | bez zmian | — |
| Wpis aktualności, 404, Powiadomienia | **bez zmian** (decyzja o banerze jeszcze nie zapadła) | — | 404: zob. „Błąd 404” niżej |

**Definicje liczb** (jedne dla całej strony):
- **wydarzenia:** wpisy z terminem w przyszłości (koniec, a gdy go nie ma, początek, nie wcześniej niż teraz), bez seminariów i bez obron; konferencje się wliczają.
- **zapowiedziane referaty:** wszystkie referaty seminariów z terminem w przyszłości.
- **nadchodzące obrony:** obrony z terminem w przyszłości.
- **nowe ogłoszenia:** wpisy rodzaju „ogłoszenie” z datą publikacji z ostatnich 30 dni.

## Pracownicy: jeden wiersz filtrów (telefon)
- Zamiast pola wyszukiwania, osobnej listy zakładów i 5 pastylek (Wszyscy, Nauczyciele akademiccy, Doktoranci, Administracja, Emerytowani) jest jeden wiersz jak w Aktualnościach (`FiltrISzukaj.astro` albo ten sam wygląd):
  - lista rozwijana „Wszyscy ▾” z grupami `<optgroup label="Kto">` (Nauczyciele akademiccy, Doktoranci, Administracja, Emerytowani) i `<optgroup label="Zakład">` (wszystkie zakłady z danych);
  - pole „Szukaj”, które szuka po nazwisku, pokoju, e-mailu i nazwie zakładu.
- Wybór działa jak dziś pastylki albo lista zakładów. Łączenie obu filtrów naraz nie jest potrzebne.
- Napis „Liczba osób: 129” znika. Po przefiltrowaniu pokazuje się „Znaleziono N osób” (z odmianą), w `aria-live`.
- Komputer zostaje bez zmian.

## Błąd 404
`src/pages/404.astro` przekazuje `opublikowany={false}` do `Baza.astro`, a to pokazuje nad treścią pasek „Podgląd — ta strona nie jest jeszcze opublikowana” (`Baza.astro`, ok. linii 107). Popraw tak, żeby 404:
- **nie** miała paska;
- miała dalej `noindex` i nie miała `canonical`;
- nie trafiała do indeksu wyszukiwarki (pagefind).

Dotyczy telefonu i komputera.

## Kryteria odbioru
1. `npm run build` przechodzi bez nowych błędów i ostrzeżeń.
2. Na telefonie każda strona z tabeli ma baner w podanym układzie: hasło z danych, a liczby policzone przez kod. Przy obecnych danych wartości zgadzają się z liczbami w nawiasach albo różnica jest wyjaśniona w dzienniku.
3. Na telefonie nie ma na żadnym banerze długiego szarego opisu (gdy jest hasło), przycisków ani listy koordynatorów. Kierunki nie mają pod banerem przycisków ani kafelków faktów.
4. Wysokość banera przy 390 px mieści się w przedziale ok. 200–330 px na wszystkich stronach z tabeli. Wyjątkiem mogą być tytuły w 3 liniach; odnotuj je w dzienniku.
5. Rysunek w banerze na telefonie jest wszędzie szary; na ekranie jest tylko jeden bursztynowy element w banerze (hasło).
6. Pracownicy na telefonie mają jeden wiersz filtrów („Wszyscy ▾” z grupami + „Szukaj”), bez pastylek; filtrowanie i licznik „Znaleziono N osób” działają.
7. Linki powrotu: seminarium ma „← Seminaria”, a obrona „← Obrony doktorskie” (EN: odpowiednio).
8. Strona 404 nie ma paska „Podgląd”, ma `noindex`.
9. Wersja EN ma hasła i etykiety liczb po angielsku (bez polskich resztek).
10. **Komputer bez zmian:** dla co najmniej 10 stron z tabeli wygląd przy 1280 px jest taki jak przed zmianą (porównanie HTML i stylów albo zrzutów). Jedynym wyjątkiem jest poprawka 404.
11. Tryb ciemny na telefonie: hasło, liczby i filtry są czytelne.
12. Wszystkie nowe pola danych są wpisane w `.przekazanie\pola-do-cms.md`, a w `.przekazanie\dziennik.md` jest sekcja „01-uklad-banerow”.
