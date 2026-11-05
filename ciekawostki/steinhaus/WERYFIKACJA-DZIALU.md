# Weryfikacja strony działu Popularyzacja (patron: Hugo Steinhaus)

Stan na 5.11.2026. Dane: `wz`, gałąź `wyglad/zalozyciele`, z nałożonymi treściami Web-*; gałęzi `wyglad/porzadki` (nowy telefon) nie sprawdzałem. Prototyp: `proto/zalozyciele.src.html`, obiekt `D.popularyzacja`, o 01:17 w liniach 1862–1870. Prototyp jest równolegle edytowany, więc numery linii się przesuwają: szukaj `popularyzacja: { nazwa`.

**Odpowiedź w jednym zdaniu:** tekst z prototypu nie łączy się ani z patronem, ani z hasłem i liczbami, część jego stwierdzeń nie ma pokrycia, liczby to zaślepki, a realna strona na komputerze nie ma w ogóle ani tekstu, ani hasła, ani liczb.

## 1. Stan

### Prototyp, obiekt `D.popularyzacja`

- **Hasło:** „Matematyka dla uczniów i nauczycieli”
- **Patron, lata:** Hugo Steinhaus, 1887–1972
- **Fakt:** „Między duchem a materią pośredniczy matematyka”.
- **Znak:** Kanapka z szynką: „Jedna prosta przepoławia naraz obie figury (Steinhaus, 1938).”
- **Linki:** Dla uczniów, Dla nauczycieli, Dla wszystkich
- **Zakładki:** Dla uczniów, Dla nauczycieli, Dla wszystkich, Organizatorzy
- **Liczby:** TBA warsztaty w tym roku · TBA wykłady otwarte · TBA szkoły partnerskie
- **Tytuł:** Popularyzacja
- **Tekst:**
  > Pracownia Dydaktyki i Popularyzacji Matematyki dba o kształcenie przyszłych nauczycieli i kontakt ze szkołami, a cały Instytut chętnie otwiera się na gości.
  >
  > Organizujemy seminaria, konferencje i wykłady otwarte. Najbliższe wydarzenia są w Kalendarzu.
- **Skrót:** TBA liczby po uzupełnieniu danych · 3 grupy odbiorców · 1 pracownia dydaktyki

### Trzy wersje tej samej strony

| Element | `D.popularyzacja` | Widok prototypu (`rysujInstytut`) | Realna strona, komputer | Realna strona, telefon |
|---|---|---|---|---|
| Tytuł | Popularyzacja | Popularyzacja | Popularyzacja (z menu) | Popularyzacja matematyki |
| Hasło | jest | **jest, choć liczb nie ma** | brak (pokazuje się tylko przy liczbach) | brak (`haslo` nie ma w CMS) |
| Liczby | 3 × TBA z opisami | puste | brak | **3 × TBA bez opisów** |
| Tekst | 2 akapity | pusty; zamiast niego `IN_DANE.popularyzacja.lead` | **brak** | `wstep` |
| Skrót | jest | pusty | brak | brak |
| Notka na banerze | brak | `IN_NOTA` | „Współtwórca szkoły lwowskiej i wrocławskiej, mistrz matematycznego aforyzmu i popularyzacji.” · sala HS | — |
| Sekcje | — | 4 × „To be announced” | 4 × „To be announced” | 4 × „To be announced” |

Linia, która w widoku prototypu czyści te pola: `dz === 'popularyzacja' ? { ...D[dz], liczby: [], tekst: [], skrot: [] }`. Czyli `tekst` i `skrot` z `D.popularyzacja` są dziś widoczne tylko w schowanym widoku.

Lead w widoku prototypu: „Kółka i obozy dla uczniów, konkursy, wykłady popularnonaukowe i szkolenia dla nauczycieli, prowadzone przez matematyków z Instytutu i partnerów.” Jest zgodny z `wstep` w CMS.

`wstep` z CMS: „Matematycy z Instytutu — razem z Fundacją Matematyków Wrocławskich, Wydziałem Matematyki i Informatyki UWr i Wrocławskim Oddziałem PTM — prowadzą kółka i obozy dla uczniów, konkursy, wykłady popularnonaukowe oraz szkolenia dla nauczycieli. Poniżej najważniejsze inicjatywy i linki do ich stron.”

**Uwaga o `wstep`:** zdanie „Poniżej najważniejsze inicjatywy i linki do ich stron” jest nieaktualne od commita 1690f8e, bo inicjatyw już poniżej nie ma, są tylko trzy linki i „To be announced”.

## 2. Ocena

**Tekst a motyw patrona**
- Steinhausa nie ma w tekście ani słowem. Znak (kanapka) i fakt (aforyzm) też nie mają z tekstem nic wspólnego.
- **To największa strata tego działu.** U Knastera czy Ślebodzińskiego związek z treścią strony jest słaby i można go pominąć. Tu patron wybrany jest właśnie za popularyzację: „Kalejdoskop matematyczny”, „Sto zadań”, zadanie o kanapce. Jedno zdanie wystarczy (sekcja 4).
- Notka na banerze jest w porządku, ale to jedyne miejsce, które mówi, dlaczego to on.

**Tekst a hasło**
- Hasło mówi o uczniach i nauczycielach. Tekst mówi o przyszłych nauczycielach i o „gościach”, a o uczniach nie wspomina.
- Hasło pomija trzecią grupę: „Dla wszystkich”. Strona ma sekcję dla wszystkich, a jej zapowiedź w banerze tego nie obiecuje.
- Tekst nie mówi o kółkach, obozach ani konkursach, czyli o głównej działalności z `wstep` i z lead w prototypie.

**Tekst a liczby**
- Tekst wymienia seminaria, konferencje i wykłady otwarte. Liczby: warsztaty, wykłady otwarte, szkoły partnerskie. Wspólne są tylko wykłady otwarte.
- O warsztatach i szkołach partnerskich tekst milczy, więc nie wiadomo, co te liczby liczyłyby.
- „Warsztaty w tym roku” wymagałyby corocznej aktualizacji i zliczania cudzych wydarzeń. Na stronie głównej prototypu przykłady warsztatów i wykładu to wpisy testowe (`aktualnosci/test-2026-10-29-warsztaty-…`, `test-2026-10-30-wyklad-otwarty-…`).

**Spójność wewnętrzna**
- **Liczby „TBA”:** w prototypie to zaślepka; na komputerze słusznie ukryte. Na telefonie wiszą trzy „TBA” bez opisów, co wygląda jak błąd.
- **„TBA liczby po uzupełnieniu danych” w skrócie:** to notatka do redakcji, nie treść.
- **„3 grupy odbiorców” przy czterech sekcjach:** rachunek się zgadza, bo Organizatorzy to nie odbiorcy. Ale czytelnik widzi cztery pozycje i trzy, więc to brzmi jak błąd. Sama liczba nic nie mówi.
- **„1 pracownia dydaktyki”:** prawda, ale „jedna” to żadna wiadomość. W tym samym nagłówku brakuje partnerów, którzy robią większość pracy.
- **„Pracownia Dydaktyki” w tekście a sekcje strony:** tekst zaczyna od jednostki, której na stronie nie ma; realne menu i `linki` prowadzą do Fundacji, Portalu i PTM. W menu działu Pracownia się nie pojawia, a była na usuniętej karcie.
- **Odnośnik do Kalendarza:** patrz sekcja 3, punkt 11. Kalendarz istnieje, ale wydarzeń popularyzacyjnych prawie w nim nie ma.
- **Linki a zakładki:** `linki` ma 3 pozycje, `zakladki` 4. To nie błąd, bo `linki` to wybór na okładkę.
- **„Podstrony” działu:** Popularyzacja to jedna strona z czterema kotwicami, nie cztery podstrony. Zasada losowania ciekawostek zakłada podstrony; w prototypie „strony” to pozycje grupy „Na tej stronie”. Trzeba zdecydować, gdzie ciekawostki mają się pokazywać na realnej stronie.

**Zasada „hasło i liczby razem albo wcale” (zlecenie 11, zalecenie 2)**

| Miejsce | Hasło | Liczby | Zgodne? |
|---|---|---|---|
| Realna strona, komputer | nie | nie | tak |
| Realna strona, telefon | nie (`haslo` nie ma w CMS) | tak, 3 × TBA | **nie** |
| Widok prototypu | tak | nie | **nie** |

Kod `NaglowekZ.astro` przestrzega zasady na komputerze: `const haslo = zLiczbami ? … : undefined`. Na telefonie liczby są wpisane na stałe w `Popularyzacja.astro` (`ul.pt-liczby.tylko-telefon`), a pole `haslo` nie istnieje w `.pages.yml`, więc redakcja nie może go uzupełnić.

## 3. Fakty i liczby

| # | Stwierdzenie | Wynik | Źródło |
|---|---|---|---|
| 1 | „Między duchem a materią pośredniczy matematyka” | **Potwierdzone.** Dokładnie to brzmienie: Steinhaus, „Słownik racjonalny”, 1980, s. 54, wg Murawskiego (2011, s. 149). Przypis Murawskiego: wyryte też na nagrobku. Tytuł wyboru pism (PWN 2000). Po angielsku w dwóch wersjach. Książka ukazała się po śmierci autora, więc rok 1980 nie jest rokiem powstania zdania. | https://czasopisma.pan.pl/Content/93495 ; https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/ ; https://kolekcje.polin.pl/en/hugo-steinhaus-1970 |
| 2 | Kanapka z szynką, 1938 | **Potwierdzone.** Notatka w „Mathesis Polska” 11 (1938), s. 26–28. Problem Steinhausa, rozwiązanie przypisane Banachowi. | https://en.wikipedia.org/wiki/Ham_sandwich_theorem |
| 3 | „Jedna prosta przepoławia naraz obie figury (Steinhaus, 1938)” | **Prawda, ale nieprecyzyjne.** Notatka mówi o trzech bryłach i płaszczyźnie; dwie figury i prosta to przypadek płaski. Dopisek „Steinhaus” sugeruje autorstwo dowodu, a pierwsze rozwiązanie to Banach. | jw. |
| 4 | Lata 1887–1972 | **Potwierdzone.** | MacTutor, jw. |
| 5 | Współtwórca szkoły lwowskiej i wrocławskiej | **Potwierdzone.** | MacTutor; https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2024/05/11-BKPW-PiP-3-2015.pdf |
| 6 | Sala HS | **Potwierdzone:** „audytorium im. Prof. Hugona Steinhausa”. | `src/content/strony/studia/pierwszy-rok.md`, linia 583 |
| 7 | Pracownia Dydaktyki i Popularyzacji Matematyki istnieje | **Potwierdzone.** Kierownik: Małgorzata Mikołajczyk. | `src/content/zaklady/dydaktyka.md` |
| 8 | Pracownia „dba o kształcenie przyszłych nauczycieli” | **Potwierdzone,** w tym praktyki pedagogiczne studentów. | jw. |
| 9 | Pracownia dba o „kontakt ze szkołami” | **Nie potwierdzone wprost.** Treści mówią o praktykach pedagogicznych i popularyzacji wśród uczniów i nauczycieli. | jw. |
| 10 | „Cały Instytut chętnie otwiera się na gości” | **Nie do sprawdzenia.** Ozdobnik bez treści. | brak |
| 11 | „Najbliższe wydarzenia są w Kalendarzu” | **Tylko częściowo.** Kalendarz istnieje (`/kalendarz`, rodzaje: referat, wydarzenie, obrona, konferencja). Wrocławskich Spotkań Matematycznych i I³ nie ma w treściach (`grep` po `src/content` i `src/data`), a seminarium Pracowni nie ma żadnego referatu (`src/content/referaty/dydaktyka` jest puste). Z rzeczywistych wydarzeń popularyzacyjnych znalazłem tylko 2. Kongres Młodych Odkrywców. | `src/lib/widoki/kalendarz.ts`; `src/content/aktualnosci/2026-09-23-2-kongres-mlodych-odkrywcow.md` |
| 12 | „Organizujemy seminaria” | **Częściowo.** I³ odbywa się w Instytucie, kierownik z Instytutu. Seminarium Pracowni jest w CMS z notatką `do_uzupelnienia`: na dawnej stronie go nie było, nazwę przyjęto tymczasowo. | https://fmw.math.uni.wroc.pl/dla-nauczycieli/seminarium-i3/seminarium-dla-nauczycieli-i3 ; `src/content/seminaria/dydaktyka.md` |
| 13 | „Organizujemy konferencje” | **Częściowo.** II Dolnośląski Kongres Nauczycieli Matematyki: 20.03.2026, Instytut Informatyki UWr. Kto dokładnie organizuje, nie ustaliłem. Kongres Młodych Odkrywców: FMW i Wydział. „My” nie jest ścisłe. | https://dokonamat2.math.uni.wroc.pl/ ; aktualność wyżej |
| 14 | „Organizujemy wykłady otwarte” | **Potwierdzone w treści, „my” nieścisłe.** Wrocławskie Spotkania Matematyczne od 1991 r., raz w miesiącu, w Instytucie, na stronie FMW. Historia FMW podaje 1993 r. dla spotkań organizowanych przez fundację. | https://fmw.math.uni.wroc.pl/dla-uczni%C3%B3w/spotkania-matematyczne/wroc%C5%82awskie-spotkania-matematyczne ; https://fmw.math.uni.wroc.pl/o-fundacji/historia/historia-fundacji-matematyk%C3%B3w-wroc%C5%82awskich |
| 15 | TBA warsztaty w tym roku | **Brak danych.** Nikt tego nie zlicza w jednym miejscu. | — |
| 16 | TBA wykłady otwarte | **Brak danych.** Znany rytm (raz w miesiącu), nieznana liczba. | jw. |
| 17 | TBA szkoły partnerskie | **Brak danych i brak definicji.** Klasy uniwersyteckie są w dwóch szkołach (SP 3, SP 76), we współpracy z Wydziałem; niemal 20 szkół to uczestnicy kongresu, nie partnerzy. | https://wmi.uwr.edu.pl/klasy_uniwersyteckie/ ; aktualność wyżej |
| 18 | 3 grupy odbiorców | **Zgadza się** z sekcjami: uczniowie, nauczyciele, wszyscy. | `src/data/popularyzacja.json` |
| 19 | 1 pracownia dydaktyki | **Zgadza się.** | `src/content/zaklady/dydaktyka.md` |
| 20 | Zimowe Szkoły Matematyki od 1989 r. (do propozycji niżej) | **Potwierdzone.** Pierwsza szkoła: Wojcieszów 1989, z udziałem IM UWr. | historia FMW, jw. |
| 21 | Seminarium I³ od semestru letniego 2003/2004 (do propozycji niżej) | **Potwierdzone.** 412 posiedzeń do końca 2018/19. Nowszej liczby brak. | strona I³, jw. |
| 22 | Prawie 170 uczniów z niemal 20 szkół (Kongres 2026) | **Potwierdzone** w aktualności. Jednorazowe. | aktualność wyżej |

Banach „moje największe odkrycie” nie jest użyte w `D`, ale na potrzeby ciekawostek: sens potwierdzony, polskiego brzmienia nie znalazłem (szczegóły w `RAPORT.md`).

## 4. Propozycje poprawek

### Wariant A dla liczb: daty zamiast zliczeń (rekomendowany)

Działa bez corocznej aktualizacji, każda pozycja jest potwierdzona, po jednej na każdą grupę odbiorców. Kolejność daje najważniejsze na początku, bo liczby chowają się od końca.

- **Było:** `liczby: [['TBA', 'warsztaty w tym roku'], ['TBA', 'wykłady otwarte'], ['TBA', 'szkoły partnerskie']]`
- **Ma być:** `liczby: [['od 1991', 'Wrocławskie Spotkania Matematyczne'], ['od 1989', 'Zimowe Szkoły Matematyki'], ['od 2004', 'seminarium I³ dla nauczycieli']]`
- **Dlaczego:** to jedyne liczby, które da się dziś potwierdzić i które nie zestarzeją się po roku.

Semestr letni 2003/2004 to wiosna 2004, stąd „od 2004”. Pole wartości ma krótkie liczby na innych działach; „od 1991” jest dłuższe, co trzeba sprawdzić w układzie.

### Wariant B dla liczb: wcale

- **Było:** trzy pozycje TBA w `D.popularyzacja` i `ul.pt-liczby.tylko-telefon` w `Popularyzacja.astro`
- **Ma być:** `liczby: []`, bez hasła w banerze i bez listy TBA na telefonie
- **Dlaczego:** zgodne z zasadą „razem albo wcale” i z obecnym stanem komputera; to najprostsze wyjście, jeśli redakcja nie chce wariantu A.

### Hasło

- **Było:** „Matematyka dla uczniów i nauczycieli”
- **Ma być (przy wariancie A):** „Matematyka dla uczniów, nauczycieli i wszystkich”
- **Dlaczego:** strona ma trzy grupy odbiorców, a hasło wymieniało dwie.

Przy wariancie B hasła w banerze nie ma, ale to samo zdanie zostaje na okładce (`patroni.ts`). Tam też warto je poprawić. Wersja angielska: „Mathematics for pupils, teachers and everyone”.

### Tekst (`D.popularyzacja.tekst`, a na realnej stronie `wstep`)

- **Było, akapit 1:** „Pracownia Dydaktyki i Popularyzacji Matematyki dba o kształcenie przyszłych nauczycieli i kontakt ze szkołami, a cały Instytut chętnie otwiera się na gości.”
- **Ma być:** „Hugo Steinhaus, jeden z założycieli wrocławskiej matematyki, wydał w 1938 r. „Kalejdoskop matematyczny”: książkę z samych niemal obrazków, bez dowodów. Dziś matematycy z Instytutu, razem z Fundacją Matematyków Wrocławskich, Wydziałem Matematyki i Informatyki UWr i Wrocławskim Oddziałem PTM, prowadzą kółka i obozy dla uczniów, konkursy, wykłady popularnonaukowe oraz szkolenia dla nauczycieli.”
- **Dlaczego:** łączy patrona z działalnością i usuwa dwa stwierdzenia bez pokrycia.

- **Było, akapit 2:** „Organizujemy seminaria, konferencje i wykłady otwarte. Najbliższe wydarzenia są w Kalendarzu.”
- **Ma być:** „W Instytucie od 1991 r. raz w miesiącu odbywają się Wrocławskie Spotkania Matematyczne, a od 2004 r. seminarium I³ dla nauczycieli. Przyszłych nauczycieli kształci Pracownia Dydaktyki i Popularyzacji Matematyki. Terminy i zapisy są na stronach partnerów.”
- **Dlaczego:** objaśnia liczby z wariantu A, zdejmuje nieścisłe „my” i odsyła tam, gdzie terminy naprawdę są.

Do Kalendarza można wrócić, gdy będą w nim Spotkania Matematyczne i I³.

### Skrót (`D.popularyzacja.skrot`)

- **Było:** `[['TBA', 'liczby po uzupełnieniu danych'], ['3', 'grupy odbiorców'], ['1', 'pracownia dydaktyki']]`
- **Ma być:** `[['Kółka i obozy', 'dla uczniów, z Fundacją'], ['Ligi zadaniowe', 'na Wrocławskim Portalu Matematycznym'], ['Pracownia Dydaktyki', 'kształcenie przyszłych nauczycieli']]`
- **Dlaczego:** usuwa zaślepkę i liczby bez znaczenia; dział Studia też ma tu nazwy (PKA, Erasmus+, Tutornia), nie tylko liczby, i nic nie powtarza nagłówka.

Na realnej stronie skrótu dziś nie ma, bo `Popularyzacja.astro` nie przekazuje `tekst` do `TrescDzialu`.

### Znak

- **Było:** „Jedna prosta przepoławia naraz obie figury (Steinhaus, 1938).”
- **Ma być:** „Jedna prosta przepoławia naraz obie figury (problem Steinhausa, 1938).”
- **Dlaczego:** pierwsze rozwiązanie przypisuje się Banachowi.

Na realnej stronie rok jest w nazwie, a opis bez nazwiska, więc tam to nie jest potrzebne.

### `wstep` w CMS, jeśli zostaje stary tekst

- **Było:** „Poniżej najważniejsze inicjatywy i linki do ich stron.”
- **Ma być:** „Poniżej linki do stron partnerów.”
- **Dlaczego:** kart inicjatyw już nie ma.

### Pola angielskie (`patroni.ts`, puste)

Zlecenie 11 (zalecenie 12) i tak wymaga ich uzupełnienia:

- **`fakt_en`:** „Mathematics mediates between spirit and matter.” Brzmienie jak na stronie POLIN.
- **`notka_en`:** „Co-founder of the Lwów and Wrocław schools of mathematics, master of the mathematical aphorism and of popularisation.”

Pole `doSprawdzenia: true` przy Steinhausie można zdjąć, jeśli wystarczy to sprawdzenie: daty, szkoły, kanapka i aforyzm są potwierdzone. Do zapamiętania: notatka z 1938 r. mówi o bryłach, a znak pokazuje wersję płaską.

## 5. Do decyzji użytkownika

1. **Liczby:** wariant A (daty) czy wariant B (bez liczb i hasła w banerze)?
2. **Hasło:** zostawić „dla uczniów i nauczycieli” czy dopisać „wszystkich”?
3. **Wstęp i skrót na komputerze:** czy `Popularyzacja.astro` ma przekazywać `tekst` do `TrescDzialu`? Bez tego strona działu na komputerze nie ma żadnego tekstu.
4. **Telefon:** usunąć listę TBA, także jeśli wejdzie wariant B? (Bezsporne, ale to zmiana w kodzie.)
5. **Pole `haslo` i `liczby` w `.pages.yml`:** dodać, żeby redakcja mogła je zmieniać?
6. **Karty inicjatyw:** które wracają (lista w `TEKST-POPULARYZACJA.md`)?
7. **Pracownia:** czy ma się pojawić w menu działu i w linkach? Dziś ma tylko wzmiankę w tekście prototypu.
8. **Kalendarz:** czy wpisywać tam Spotkania Matematyczne i I³? Wtedy odnośnik z tekstu ma sens.
9. **Ciekawostki:** Popularyzacja to jedna strona z kotwicami. Czy zakładki mają stać się podstronami, czy nagłówek ma mieć jedną wylosowaną ciekawostkę?
