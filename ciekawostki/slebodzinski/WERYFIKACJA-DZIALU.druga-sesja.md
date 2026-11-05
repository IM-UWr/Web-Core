# Weryfikacja strony działu Nauka (patron: Władysław Ślebodziński)

Stan na 5.11.2026. Dane: `wz` gałąź `wyglad/zalozyciele` (`d12c994`) z nałożonymi treściami Web-* (Web-Nauka `271c818`, Web-Ustawienia `bbebd7f`, oba z 30.10.2026). Okna czasowe liczone od 5.11.2026. Prototyp: `proto/zalozyciele.src.html`.

**Odpowiedź w jednym zdaniu:** tekst nie łączy się z patronem ani z geometrią różniczkową, krótka wersja gubi połowę badań, a liczba doktoratów jest zawyżona przez wpisy testowe.

## 1. Stan

### Prototyp, obiekt `D.nauka` (linie 1807–1815)
- **Hasło:** „Poznaj nasze badania na A+”
- **Patron, lata:** Władysław Ślebodziński, 1884–1972
- **Fakt:** „Wprowadził pochodną Liego.”
- **Znak:** Pochodna Liego: „Pole wektorów przenoszone wzdłuż przepływu innego pola.”
- **Linki:** Seminaria, Projekty i granty, Obrony doktorskie
- **Zakładki:** Seminaria, Konferencje, Obrony doktorskie, Projekty i granty, Publikacje, Sukcesy
- **Liczby:** 5 realizowanych projektów · 2 konferencje w ostatnim roku · 6 doktoratów w ostatnim roku
- **Tytuł:** Badania w Instytucie
- **Tekst (339 znaków):**
  > Trzy zakłady pracują na styku logiki, algebry, topologii i geometrii. Mocną wrocławską tradycję ma analiza: analiza harmoniczna, wielomiany ortogonalne i nieprzemienna probabilistyka.
  >
  > Codzienne życie naukowe toczy się na seminariach: każdy zakład prowadzi własne, a referaty wygłaszają pracownicy, doktoranci i goście z kraju i z zagranicy.
- **Skrót:** A+ najwyższa kategoria naukowa · 2000+ publikacji od 2003 roku · 90+ projektów badawczych od 2005 roku

### Różnice: trzy wersje tej samej strony

| Element | `D.nauka` | Widok prototypu (`IN_DANE.nauka`, `rysujInstytut`, linie 2448 i 2595) | Realna strona (`src/data/dzialy/nauka.json`) |
|---|---|---|---|
| Gdzie widać | tylko schowany widok „Dział” (`.ustalone`) | widok, który dziś się ogląda | `TrescDzialu.astro` |
| Tekst | 2 akapity, 339 znaków | 6 akapitów, identyczne z CMS | `badania_tekst`, 6 akapitów, ok. 3070 znaków |
| Skrót | A+ · 2000+ · 90+ | A+ · 2000+ · 3 czasopisma · 90+ | `badania_fakty`, te same 4 pozycje |
| Link „seminariach” | `<a href="#">` | brak | brak; tekst z CMS jest wstawiany jako zwykły tekst, HTML nie zadziała |
| Hasło | to samo | to samo | w CMS brak pola `haslo`; baner bierze je z `src/lib/patroni.ts` |
| Liczby | na stałe: 5, 2, 6 | na stałe, z `D` | liczone przy budowie, 5.11: **5, 2, 7** (komputer); telefon: 5, „2 konferencje w 2026 roku”, 7 |
| Notka na banerze | brak | `IN_NOTA` | „Geometra różniczkowy. W 1931 roku wprowadził pochodną Liego, dziś jedno z podstawowych narzędzi geometrii.” Plus „· sala WS” |

Pełny tekst CMS, akapitami: 1. trzy zakłady pierwszego obszaru, nazwane; 2. analiza, równania, prawdopodobieństwo, statystyka, Pracownia; 3. seminaria, finansowanie; 4. cykliczne spotkania, stopnie naukowe; 5. czasopisma; 6. ostatnie sukcesy.

## 2. Ocena

**Tekst a motyw patrona**
- Ani `D.nauka`, ani CMS nie wspominają o Ślebodzińskim. Słowo „geometria” pojawia się, ale chodzi o geometryczną teorię grup. Geometrii różniczkowej nie ma nigdzie: w `zaklady/geometria.md` i `seminaria/geometria.md` nie pada słowo „różniczkowa”.
- Znak i notka opowiadają więc o dziedzinie, której tekst obok nie zna. Czytelnik nie ma jak tego powiązać.
- **Naturalny most istnieje jeden: seminaria.** Tekst mówi, że życie naukowe toczy się na seminariach, a Ślebodziński prowadził we Wrocławiu seminarium z geometrii różniczkowej od 1948 roku. To jedno zdanie, które coś objaśnia.
- **Czego nie pisać:** że Zakład Geometrii kontynuuje jego tradycję. Po podziale uczelni w 1951 roku Ślebodziński kierował Katedrą Matematyki Politechniki Wrocławskiej, a dzisiejszy zakład zajmuje się czym innym.

**Tekst a hasło**
- Hasło obiecuje badania na A+. `D.nauka` nie mówi o A+, nie wymienia większości dziedzin i pomija prawdopodobieństwo, statystykę i równania. CMS opisuje wszystko i mówi o ewaluacji.

**„Trzy zakłady” a liczba zakładów**
- W CMS zdanie jest w porządku, bo następne wymienia te trzy zakłady z nazwy, a `wstep` mówi o ośmiu.
- W `D.nauka` nazw już nie ma. Zdanie brzmi, jakby zakłady były trzy, podczas gdy dział Instytut podaje 9 zakładów i pracowni. To skutek skrócenia, nie błąd danych.

**Tekst a liczby i skrót**
- Skrót dobrze podpiera hasło („A+”, „najwyższa kategoria”) i wszystkie jego liczby się bronią.
- Liczby banera (projekty, konferencje, doktoraty) nie mają odpowiednika w tekście `D`, ale prowadzą do zakładek. CMS ma te tematy w akapitach 3–4.
- Baner i skrót się nie powtarzają: dobrze. Jedna prawdziwa niespójność: prototyp pokazuje 6 doktoratów, a strona 7, i obie liczby zawierają wpisy testowe.

**Zasada „hasło i liczby razem albo wcale” (zlecenie 11):** spełniona. Kolejność danych dobra: przy braku miejsca znika najpierw liczba doktoratów.

## 3. Fakty i liczby

Liczenie: pliki w `src/content/`, te same filtry co `src/lib/widoki/dzialNauka.ts` (`opublikowany` różne od false; granty: `rok_do` ≥ 2026; konferencje bez `odwolana`, początek od 5.11.2025 do 5.11.2026; obrony: termin w tym samym oknie i już odbyte).

| Twierdzenie | Wynik | Dowód |
|---|---|---|
| 5 realizowanych projektów | potwierdzone w danych, **dane niepełne** | 5 plików z `rok_do` ≥ 2026: 2021/43/B/ST1/00405, 2021/43/O/ST6/02805, 2022/47/D/ST1/00779, 2023/49/N/ST1/02512, 2024/53/N/ST1/02294. Brakuje co najmniej dwóch projektów, które zapowiadają aktualności: OPUS 28 Dębickiego (`aktualnosci/2025-05-27-…`) i SONATA BIS 15 Valiunasa (`aktualnosci/2026-03-01-…`). Daty ich rozpoczęcia niesprawdzone |
| Trwałość liczby 5 | uwaga | 4 z 5 projektów mają `rok_do` 2026. Od 1.01.2027 liczba sama spadnie do 1, jeśli nikt nie uzupełni danych |
| 2 konferencje w ostatnim roku | potwierdzone w danych | 7.09.2026 Chilijsko-polski Kongres Matematyczny (Wrocław); 17.05.2026 Discrete Random Structures II (Będlewo). Kompletności listy nie sprawdzano poza CMS |
| 6 doktoratów w ostatnim roku | **błędne** | Prawdziwych obron w oknie: **5** (Korpalski 18.06, Antasik 19.06, Żuchowski 21.09, Tadej 20.10, Mrowińska 27.10.2026). Liczba 6 z 2.11 i liczba 7 z 5.11 zawierają wpisy `test-*` („Testowe: Mister Test”) |
| Czy 5 to pełna liczba | niepotwierdzone | Kolekcja `obrony` zaczyna się 18.06.2026. O obronach od 5.11.2025 do 17.06.2026 dane milczą, a wyszukiwanie w sieci nic nie dało. 5 to więc dolna granica |
| „doktorat” a obrona | uwaga | Kolekcja liczy obrony, a stopień nadaje później Rada Dyscypliny (`nauka.json`, `obrony_tekst`). Dla obron z października 2026 „doktorat” może być przedwczesny |
| 2000+ publikacji od 2003 | potwierdzone | `src/data/publikacje/2003…2025.json`, `grupy[].prace[]`: 2165 wpisów. Po usunięciu powtórek tytułu (zapis znormalizowany; dla 344 wpisów bez pola `tytul` pełny `opis`): 2129. Powtórek jest 36, 35 z nich między latami, np. ta sama praca w 2003 i 2004 |
| Notatka poprzedniego agenta: „378 powtórzeń” | sprostowane | To efekt liczenia pustego tytułu: 344 wpisy nie mają pola `tytul`. Rzeczywiste powtórki to 36 |
| „publikacji naukowych” (CMS `badania_fakty`) | za mocne | Wykazy obejmują też teksty dydaktyczne, popularyzatorskie i recenzje (`publikacje_tekst`). Nie rozdzielano ich |
| 90+ projektów od 2005 | potwierdzone | 94 pliki w `src/content/granty/`, 93 różne: `2018-31-b-st1-00204.md` i `2019-2018-31-b-st1-00204.md` to ten sam projekt. Najwcześniejszy `rok_od`: 2005. Bez lat: ten duplikat i `merg-ct-2006-046543.md` |
| „głównie grantów NCN” (CMS) | potwierdzone | `rodzaj: ncn` 73 z 94. Numer w formacie NCN ma 54; 19 ma numery „N 201 …” z lat 2006–2010, więc pole `rodzaj` je upraszcza. Także 54 to większość |
| A+, najwyższa kategoria | potwierdzone | Decyzja Ministra nr 5/704/2026 z 31.07.2026: A+ dla Uniwersytetu w dyscyplinie matematyka (`public/pliki/aktualnosci/decyzja_5_704_2026_matematyka.jpg`); za 2017–2021 po odwołaniu: `aktualnosci/2023-02-15-matematyka-na-a-plus.md` |
| „Trzy zakłady … logiki, algebry, topologii i geometrii” | potwierdzone, w `D` mylące | `instytut.json`, `struktura_tekst`: trzy obszary. Pierwszy to Algebra i Teoria Modeli, Teoria Mnogości i Topologia, Geometria. Razem jest 8 zakładów i pracownia |
| „Każdy zakład prowadzi własne” | potwierdzone | `src/content/seminaria/`: 9 seminariów, po jednym na każdą z 9 jednostek |
| Czy seminaria działają | uwaga | Referaty w CMS ma 5 z 9 seminariów (22 bez testowych, 3.06–26.10.2026). Geometria, teoria modeli, topologia i dydaktyka nie mają żadnego |
| Referaty: pracownicy, doktoranci, goście | potwierdzone | Na 22 referaty: 5 nauczycieli, 2 doktorantów, 15 osób spoza spisu; afiliacje m.in. NTNU, Kopenhaga, Madryt, Praga, Warszawa |
| „analiza harmoniczna, wielomiany ortogonalne, nieprzemienna probabilistyka” | potwierdzone w CMS | Zakłady i nazwy seminariów. Nazwa seminarium używa „niekomutatywna”, tekst „nieprzemienna” |
| „Wprowadził pochodną Liego” (1931) | potwierdzone | Praca „Sur les équations canoniques de Hamilton”, 1931, nazwa od van Dantziga 1932: https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/ ; Biler i in. 2015: „uznawany za twórcę pojęcia”: https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2024/05/11-BKPW-PiP-3-2015.pdf ; Dzieło 23: https://dbc.wroc.pl/Content/1789/PDF/Dzielo%2023%20Wroc%C5%82awska%20Szko%C5%82a%20Matematyczna.pdf ; https://encyclopediaofmath.org/wiki/Lie_differentiation |
| „Pole wektorów przenoszone wzdłuż przepływu” jako opis | niedokładne | To opis rysunku, nie pojęcia. Encyclopedia of Mathematics: pochodna mierzy, jak obiekt zmienia się wzdłuż grupy przekształceń generowanej przez pole |
| Seminarium z geometrii różniczkowej, 1948 | potwierdzone | Duda, Weron, Wiad. Mat. 2006, s. 82: „wczesną wiosną 1948 r. ruszyło seminarium z geometrii różniczkowej”: https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf ; MacTutor wymienia to seminarium |
| Ślebodziński po 1951 na Politechnice | potwierdzone | Duda, Weron, s. 76; MacTutor |
| Lata 1884–1972 | niepotwierdzone dokładnie | Przyjęte z `BRIEF.md`. Nie odczytałem dat wprost. Streszczenie MacTutor łączyło doktorat Matuszczyk z 10.11.1971 ze śmiercią „około sześć tygodni później”, co nie zgadza się z rokiem 1972 ani z ciekawostką `jedenastu-doktorow`. To może być błąd streszczenia; limit WebFetch nie pozwolił sprawdzić |
| „sala WS” = Ślebodziński | niepotwierdzone | Sala WS jest w CMS, ale jej pełnej nazwy nie ma. `estetyka.md` to założenie |
| CMS: Medal Sierpińskiego, Nagroda Kuratowskiego (2026), ICCM, zaproszenie Mirka na ICM | potwierdzone w CMS | Aktualności 2026-05-29, 2026-05-21, 2023-11-25, 2025-07-09. Że wykład się odbył, nie sprawdzano |
| CMS: „Eksperci oceniający … podkreślili jakość publikacji” | niepotwierdzone | Nie ma tego w treściach CMS ani w widocznej części decyzji |
| CMS: Bogdan IMS Fellow 2024, SPA 2025 jako 44. edycja | nie sprawdzano | Poza głównym pytaniem; SPA 2025 jest w kolekcji konferencji |

## 4. Propozycje poprawek

### Prototyp `D.nauka`

**Tekst, pełne akapity (326 znaków, dziś 339):**

> Osiem zakładów bada logikę, algebrę, topologię i geometrię, analizę i równania różniczkowe, rachunek prawdopodobieństwa i statystykę.
>
> Życie naukowe toczy się na seminariach: każdy zakład ma własne. W 1948 roku ruszyło we Wrocławiu seminarium z geometrii różniczkowej Władysława Ślebodzińskiego, który wprowadził pochodną Liego.

Uzasadnienie: pierwszy akapit obejmuje wszystkie trzy obszary badań z `struktura_tekst` i zgadza się z liczbą zakładów; drugi łączy seminaria z patronem. Odpada zdanie o tradycji analizy i o prelegentach; zostają w CMS. Dopisanie Pracowni to ok. 30 znaków ponad limit.

**Wariant bez patrona, jeśli wystarczy sam znak (drugi akapit, 149 znaków):**

> Życie naukowe toczy się na seminariach: każdy zakład ma własne, a referaty wygłaszają pracownicy, doktoranci i goście z kraju i z zagranicy.

**Liczby**
- było: `['6', 'doktoratów w ostatnim roku']` → ma być: `['5', 'obron doktorskich w ostatnim roku']`. Uzasadnienie: bez wpisów testowych obron jest 5, a dane liczą obrony, nie nadane stopnie.
- `5` i `2` bez zmian w prototypie.

**Znak**
- było: „Pole wektorów przenoszone wzdłuż przepływu innego pola.” → ma być: „Mierzy, jak pole zmienia się wzdłuż przepływu innego pola.” Uzasadnienie: opisuje pojęcie zamiast rysunku. Dotyczy też `znakFakt` w `src/lib/patroni.ts`.

**Skrót, hasło, fakt:** bez zmian, wszystko potwierdzone.

### Kod i treści
- **Obrony testowe:** usunąć `test-2026-10-29-…`, `test-2026-11-03-…`, `test-2026-11-27-…` przed publikacją. Uzasadnienie: same zawyżają liczbę na banerze.
- `src/lib/widoki/dzialNauka.ts`: było odmiana „doktorat / doktoraty / doktoratów” → ma być „obrona doktorska / obrony doktorskie / obron doktorskich”. Uzasadnienie: nazwa zgodna z tym, co się liczy, i z zakładką.
- **Granty:** usunąć `2018-31-b-st1-00204.md` (duplikat `2019-2018-31-b-st1-00204.md`). Uzasadnienie: lista „Pozostałe” w prototypie spadnie z 2 do 1, a suma z 94 do 93.
- **Granty:** dodać OPUS 28 Dębickiego i SONATA BIS 15 Valiunasa, z numerami i latami od redakcji. Liczba na banerze zmieni się sama.
- `badania_fakty[1]`: było „publikacji naukowych pracowników Instytutu od 2003 roku” → ma być „publikacji pracowników Instytutu od 2003 roku”. Uzasadnienie: wykazy obejmują też teksty dydaktyczne i popularyzatorskie.

### CMS (`src/data/dzialy/nauka.json`), jeśli zostaje pełny tekst

**Akapit 3, pełny (dopisane jedno zdanie):**

> Codzienne życie naukowe toczy się na seminariach: każdy zakład prowadzi własne, a referaty wygłaszają na nich pracownicy, doktoranci i goście z kraju i z zagranicy. W 1948 roku ruszyło we Wrocławiu seminarium z geometrii różniczkowej Władysława Ślebodzińskiego, który wprowadził pochodną Liego. Badania finansują przede wszystkim granty Narodowego Centrum Nauki — od PRELUDIUM dla doktorantów po OPUS i SONATA BIS — a Instytut uczestniczył też w programach europejskich, m.in. w sieci Marie Curie MODNET poświęconej teorii modeli.

**Akapit 6, pełny (usunięte ostatnie zdanie, co z nawiązką równoważy dopisek):**

> Z ostatnich lat warto wspomnieć artykuł Bena Krause, Mariusza Mirka i Terence’a Tao w Annals of Mathematics (2022), wyróżniony nagrodą ICCM Best Paper Award, oraz zaproszony wykład, który prof. Mirek wygłosił w 2026 roku na Międzynarodowym Kongresie Matematyków w Filadelfii. W tym samym roku prof. Tadeusz Januszkiewicz otrzymał Medal im. Wacława Sierpińskiego, a dr Maciej Kucharski — Nagrodę im. Kazimierza Kuratowskiego; prof. Małgorzata Bogdan została w 2024 roku wyróżniona tytułem IMS Fellow.

Uzasadnienie: zdania o ekspertach nie da się potwierdzić, a brzmi jak reklama. Jeśli istnieje dokument z tą oceną, można je zostawić i skrócić tekst gdzie indziej.

## 5. Do decyzji użytkownika
1. **Który tekst jest docelowy:** krótki `D` czy pełny CMS (widoczny dziś w prototypie i na stronie)?
2. **Patron w tekście:** zdanie o seminarium z 1948 roku czy sam znak w nagłówku? Moja rada: zdanie, bo tylko ono wyjaśnia, skąd na stronie pochodna Liego.
3. **Etykieta na banerze:** „doktoratów” czy „obron doktorskich”?
4. **Obrony sprzed 18.06.2026:** dopisać je do CMS czy zmienić etykietę, żeby nie sugerowała pełnego roku? Bez tego „w ostatnim roku” jest niepełne do czerwca 2027.
5. **Dwa brakujące projekty:** redakcja podaje numery i lata; czy są już realizowane.
6. **Zdanie o ekspertach:** usunąć czy podać źródło?
7. **Hasło „Poznaj nasze badania na A+”:** zostaje gra słów? Fakt prawdziwy, ale kategoria dotyczy dyscypliny na Uniwersytecie, nie samego Instytutu.
8. **„sala WS”** w notce: zostawić bez potwierdzenia nazwy?
9. **Data śmierci Ślebodzińskiego:** ktoś z dostępem do MacTutor powinien porównać ją z ciekawostką `jedenastu-doktorow`.
