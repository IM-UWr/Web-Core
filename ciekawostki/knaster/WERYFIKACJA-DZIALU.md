# Weryfikacja strony działu Studia (patron: Bronisław Knaster)

Stan na 5.11.2026. Dane: `wz` gałąź `wyglad/zalozyciele` (`d12c994`) z nałożonymi treściami Web-* (Web-Studia `a8d13d3`, Web-Ustawienia `bbebd7f`, oba z 30.10.2026). Prototyp: `proto/zalozyciele.src.html`, czytany o 00:37. Prototyp jest równolegle edytowany, więc numery linii się przesuwają (o 01:03 `D.instytut` był już w linii 1835); treść `D` była wtedy bez zmian. Szukaj `const D`, `IN_INST`, `IN_DANE`, `rysujInstytut`.

**Odpowiedź w jednym zdaniu:** tekst nie łączy się z Knasterem i nie musi, ale nie objaśnia też liczb z nagłówka, skrót powtarza to, co już jest na stronie, a pełny tekst w CMS podaje nieaktualne zasady dyplomu na I stopniu.

## 1. Stan

### Prototyp, obiekt `D.studia` (linie 1816–1824)
- **Hasło:** „Studiuj matematykę we Wrocławiu”
- **Patron, lata:** Bronisław Knaster, 1893–1980
- **Fakt:** „Topolog, oddany dydaktyce.”
- **Znak:** Kontinuum Knastera: „Nierozkładalne: nie jest sumą dwóch mniejszych kontinuów.”
- **Linki:** Kierunki, Plan zajęć, Rok akademicki
- **Zakładki:** Kierunki, Specjalności, Plan zajęć, Rok akademicki, Sprawy studenckie, MOST
- **Liczby:** 3 kierunki studiów · 5 specjalności · 3 stopnie studiów
- **Tytuł:** O studiach
- **Tekst (309 znaków):**
  > Uczymy matematyki tak, jak ją uprawiamy. Zajęcia prowadzą aktywni badacze, a program łączy solidne podstawy z dużą swobodą wyboru: od pierwszego roku można dopasować poziom zajęć do swoich możliwości.
  >
  > Na kierunku matematyka studia I stopnia trwają trzy lata, a II stopnia dwa. Szczegóły są w zakładce Kierunki.
- **Skrót:** 3 lata studia I stopnia · 2 lata studia II stopnia · 5 specjalności do wyboru

### Różnice: trzy wersje tej samej strony

| Element | `D.studia` | Widok prototypu (`IN_DANE.studia`, `rysujInstytut`, linie 2448 i 2595) | Realna strona (`src/data/dzialy/studia.json`) |
|---|---|---|---|
| Gdzie widać | tylko schowany widok „Dział” (`.ustalone`) | widok, który dziś się ogląda | `TrescDzialu.astro` |
| Tekst | 2 akapity, 309 znaków | 5 akapitów, identyczne z CMS | `o_studiach`, 5 akapitów, ok. 2700 znaków |
| Skrót | 3 lata · 2 lata · 5 | Koła naukowe · PKA · Erasmus+ · Tutornia | `o_studiach_fakty`: **3 kierunki** · PKA · Erasmus+ · Tutornia (pierwsza pozycja inna niż w prototypie) |
| Link „Kierunki” | `<a href="#">` | brak | brak; tekst z CMS jest wstawiany jako zwykły tekst. Strony `/studia/kierunki` nie ma, „Kierunki” to grupa w menu |
| Zakładki „Kierunki”, „Specjalności”, „MOST” | w `D` | — | w menu są grupa „Kierunki”, osobne kierunki i „Program MOST”; strony „Specjalności” nie ma |
| Hasło | to samo | to samo | w CMS brak pola `haslo`; baner bierze je z `src/lib/patroni.ts` |
| Liczby | na stałe | na stałe, z `D` | liczone przy budowie: 3, 5, 3 (zgodne) |
| Notka na banerze | brak | `IN_NOTA` | „Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym. Wychował pokolenia wrocławskich matematyków.” Plus „· sala B” |

Pełny tekst CMS, akapitami: 1. sposób uczenia, umiejętności; 2. matematyka: czas, poziomy, specjalności, dyplom; 3. SIAD, ISIM, szkoła doktorska, podyplomowe; 4. opieka, koła, wymiana; 5. PKA, absolwenci.

## 2. Ocena

**Tekst a motyw patrona**
- Knastera nie ma ani w `D.studia`, ani w CMS. Znak (kontinuum) też nie ma związku ze studiami i nie musi mieć.
- **Tu nie wciskałbym patrona do tekstu.** Czytelnik to kandydat, który szuka kierunków i czasu trwania, a związek z Knasterem niesie już notka na banerze. Trzeba tylko, żeby ta notka była prawdziwa i konkretna.
- Jeśli związek ma być w tekście, jest jeden naturalny punkt: „Uczymy matematyki tak, jak ją uprawiamy”, bo tak wyglądało jego seminarium. Sekcja 4 ma takie zdanie jako opcję.

**Tekst a hasło**
- Hasło i pierwsze zdanie grają razem. Hasło mówi tylko o matematyce, a dwa z trzech kierunków mają też informatykę lub sztuczną inteligencję. Tolerowalne, bo Instytut jest matematyczny.

**Tekst a liczby**
- **To główna wada `D.studia`.** Nagłówek mówi: 3 kierunki, 5 specjalności, 3 stopnie. Tekst wymienia tylko matematykę, nie nazywa SIAD ani ISIM, nie wspomina o specjalnościach ani o szkole doktorskiej. Czytelnik nie wie, co liczą te trójki.
- CMS to objaśnia (akapit 3 i pierwsza pozycja skrótu).
- Trzy liczby razem sugerują siatkę, której nie ma: II stopień ma tylko matematyka, a specjalności też tylko ona.
- „3 kierunki” liczą bez szkoły doktorskiej, a „3 stopnie” liczą ją (`dzialStudia.ts`). Dwie sąsiednie liczby mają różne podstawy.

**Skrót a reszta**
- `D.studia`: „3 lata” i „2 lata” powtarzają drugi akapit, a „5 specjalności” powtarza nagłówek. Skrót nic nie dodaje. To także dokładnie fakty ze strony kierunku Matematyka.
- CMS: „3 kierunki” powtarza nagłówek, ale „PKA”, „Erasmus+” i „Tutornia” są nową i pożyteczną informacją, która ma oparcie w tekście.

**Zasada „hasło i liczby razem albo wcale” (zlecenie 11):** spełniona. Kolejność danych dobra: przy braku miejsca znika najpierw trzecia liczba, najsłabsza.

## 3. Fakty i liczby

Liczenie: pliki w `src/content/kierunki` i `src/content/specjalnosci`, filtry jak w `src/lib/widoki/dzialStudia.ts`.

| Twierdzenie | Wynik | Dowód |
|---|---|---|
| 3 kierunki | potwierdzone | 4 pliki, bez `szkola-doktorska`: matematyka, SIAD, ISIM. Tak samo https://studia-wmi.uwr.edu.pl/ |
| 5 specjalności | potwierdzone, tylko na matematyce | 6 plików, bez wygaszanej „Matematyki w ekonomii”. Uchwała Senatu 48/2026 i https://studia-wmi.uwr.edu.pl/matematyka/ wymieniają te same 5. Uchwała zna też ścieżkę ogólną bez specjalności |
| 3 stopnie studiów | **nieprecyzyjne** | I i II to studia. III w danych to `szkola-doktorska`, a MNiSW pisze, że szkoły doktorskie „zastąpiły dotychczasowy system studiów doktoranckich (studia trzeciego stopnia)”: https://www.gov.pl/web/nauka/doktoranci-i-szkoly-doktorskie |
| Matematyka I stopnia: 3 lata | potwierdzone | Uchwała Senatu nr 48/2026: 6 semestrów, 180 ECTS, licencjat: https://bip.uni.wroc.pl/download/attachment/52226/uchwala-nr-48_2026-senatu-uwr-z-2026-05-27-w-sprawie-programu-studiow-dla-kierunku-matematyka-stacjonarne-i-i-ii-stopnia.pdf?v=1779865106 |
| Matematyka II stopnia: 2 lata | potwierdzone | `kierunki/matematyka.md`; `public/pliki/studia/przewodnik-mt-mgr.pdf` (120 ECTS). Części uchwały o II stopniu nie udało się odczytać |
| SIAD: 3 lata | potwierdzone w CMS | `kierunki/siad.md`: „Trzyletnie studia licencjackie”, 6 semestrów, 180 ECTS. Strona rekrutacji tego nie podaje |
| ISIM: 3 lata | potwierdzone | „3-letnie studia licencjackie”: https://studia-wmi.uwr.edu.pl/isim/ |
| ISIM: 210 ECTS | niepotwierdzone | `kierunki/isim.md`; nietypowe przy 3 latach, a SIAD i matematyka mają 180. Na dostępnych stronach tego nie ma |
| „Od pierwszego roku można dopasować poziom zajęć” | potwierdzone z zastrzeżeniami | Dotyczy matematyki. Na 1. semestrze o wersji decydują matura i test kwalifikacyjny, z uwzględnieniem preferencji; można przejść z rozszerzonej na standardową. „Od 2. semestru: wersję wybierasz sam”: `strony/studia/zajecia.md`, `pierwszy-rok.md`, `public/pliki/studia/przewodnik-mt-lic.pdf` |
| „duża swoboda wyboru” | ocena, trochę za mocna | Przewodnik: student „do pewnego stopnia sam kształtuje swój tok studiów” |
| „Zajęcia prowadzą aktywni badacze” | ocena | Nie da się policzyć; A+ dyscypliny ją wspiera |
| CMS: „Studia I stopnia kończą się pracą licencjacką i egzaminem licencjackim” | **nieaktualne dla programu od 2026/27** | Przewodnik: „Student studiów I stopnia na kierunku matematyka nie przygotowuje pracy dyplomowej”; `strony/studia/egzaminy-i-dyplom.md`: stary program ma pracę, nowy tylko egzamin dyplomowy. Uchwała 48/2026 też wymienia egzamin. Notatka poprzedniego agenta to wskazała; sprawdziłem osobno |
| `kierunki/matematyka.md`, etap „Specjalność i dyplom licencjacki” | **nieaktualne w ten sam sposób** | Opis etapu mówi o pracy licencjackiej i egzaminie licencjackim |
| CMS: „Każdy rocznik ma swojego opiekuna” | potwierdzone dla pierwszego roku | `pierwszy-rok.md`: opiekun roku dr Kraszewski. O starszych rocznikach nie sprawdzono |
| PKA, ocena wyróżniająca | potwierdzone | Uchwały 280/2010 (Państwowa Komisja Akredytacyjna) i 744/2018 (Polska): `warto_wiedziec/wyrozniajaca-ocena-pka.md` |
| Tutornia, Erasmus+, MOST | potwierdzone w CMS | `pierwszy-rok.md` (sala 202), `strony/studia/program-most.md` |
| 1893–1980 | potwierdzone | 22.05.1893–3.11.1980: https://mathshistory.st-andrews.ac.uk/Biographies/Knaster/ |
| „Topolog, oddany dydaktyce” | **słabo udokumentowane** | Jedna wzmianka: R. Duda u MacTutor pisze, że we Wrocławiu poświęcił się „didactical, organising and editorial tasks”. Dydaktyka to jedna z trzech rzeczy. Duda, Weron 2006 i „Wrocławska szkoła matematyczna” nie oceniają jego nauczania. O wykładach kursowych wiemy tylko, że prowadził katedrę topologii i wykładał od 1945 (Duda, Weron, s. 81). Dobrze udokumentowana jest praca przez seminarium |
| Środowe seminarium Knastera | potwierdzone | Od 26.11.1947: „Wrocławska szkoła matematyczna”, https://dbc.wroc.pl/Content/1789/PDF/Dzielo%2023%20Wroc%C5%82awska%20Szko%C5%82a%20Matematyczna.pdf ; „kuźnią licznych kadr matematycznych”: Duda, Weron, s. 76, 82, 86, https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf |
| Tablica, czytanie prac na głos, seminarium w domu | potwierdzone jednym źródłem | Wywiad T. Pavlíčka z R. Dudą, 2024, s. 2–3, transkrypcja robocza: https://entanglements.ihpan.edu.pl/wp-content/uploads/2024/09/TWP_interview_DUDA_Roman_2024-03-21_wywiad3_seminarium_Knastera_part2-edit-02-09-2024-web.pdf . „To była naprawdę świetna nauka” |
| „Wychował pokolenia wrocławskich matematyków” | niepotwierdzone w tym brzmieniu | 8 doktorantów, 110 potomków, m.in. Charatonik, Duda, Lelek, Mioduszewski, Reichaw: https://mathgenealogy.com/id.php?id=25831 . Liczby są, „pokoleń wrocławskich” nikt tak nie ujmuje; Duda doktoryzował się w IM PAN, a Reichaw wyjechał |
| „autor twierdzenia Knastera–Tarskiego” | nieprecyzyjne | Współautor: nazwa mówi to sama. Roku nie sprawdzałem; w proponowanym tekście go nie ma |
| „Nierozkładalne: nie jest sumą dwóch mniejszych kontinuów” | potwierdzone | Definicja: https://en.wikipedia.org/wiki/Indecomposable_continuum . Tam też nazwa Brouwer–Janiszewski–Knaster |
| „Kontinuum Knastera, 1922” | częściowo | Rok 1922 w Wikipedii i MacTutor dotyczy innego kontinuum, dziedzicznie nierozkładalnego (rozprawa). Dla tego z rysunku ciekawostka `kontinuum-knastera` podaje pracę Kuratowskiego z 1922; jej nie czytałem |
| „sala B” = Knaster | **niepotwierdzone i wątpliwe** | `pierwszy-rok.md`: „Sale A, B i EM”. A i B wyglądają na zwykłe litery. `estetyka.md` też oznacza to jako do sprawdzenia |

## 4. Propozycje poprawek

### Prototyp `D.studia`

**Tekst, pełne akapity (305 znaków, dziś 309):**

> Uczymy matematyki tak, jak ją uprawiamy: zajęcia prowadzą aktywni badacze. Główne przedmioty na matematyce mają wersję standardową i rozszerzoną; od 2. semestru wybierasz sam.
>
> Matematyka trwa trzy lata na I stopniu i dwa na II. Sztuczna inteligencja w analizie danych i ISIM to trzyletnie studia I stopnia.

Uzasadnienie: konkret zamiast „swobody wyboru”, a tekst nazywa kierunki, które liczy nagłówek. Link „Kierunki” znika: nazwy trzech kierunków mogą prowadzić do `/studia/<kierunek>`.

**Opcja z patronem (dopisane na końcu pierwszego akapitu, ok. 105 znaków ponad limit, więc nie polecam bez zgody na dłuższy tekst):**

> Tak uczył już Bronisław Knaster: referaty przy szkolnej tablicy, a teksty do druku czytane na głos z autorem.

**Liczby**
- było: `['3', 'stopnie studiów']` → ma być: `['3', 'poziomy kształcenia']`. Uzasadnienie: III poziom to szkoła doktorska, nie studia. Dotyczy też etykiety w `src/lib/widoki/dzialStudia.ts` (poziom kształcenia / poziomy kształcenia / poziomów kształcenia).

**Skrót**
- było: `['3 lata', 'studia I stopnia'], ['2 lata', 'studia II stopnia'], ['5', 'specjalności do wyboru']`
- ma być: `['3 + 2', 'lata studiów na kierunku matematyka'], ['2 wersje', 'głównych przedmiotów: standardowa i rozszerzona'], ['PKA', 'ocena wyróżniająca dla kierunku matematyka, 2010 i 2018']`
- Uzasadnienie: nic nie powtarza nagłówka, a każda pozycja ma oparcie w tekście albo w potwierdzonym dokumencie.

### Kod i prototyp: patron
- **Fakt:** było „Topolog, oddany dydaktyce.” → ma być „Topolog, prowadził środowe seminarium.” Uzasadnienie: to, co jest dobrze udokumentowane. Miejsca: `D.studia`, `src/lib/patroni.ts`.
- **Notka:** było „Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym. Wychował pokolenia wrocławskich matematyków.” → ma być „Topolog, współautor twierdzenia Knastera–Tarskiego o punkcie stałym. Jego doktoranci to m.in. Lelek, Mioduszewski, Duda i Charatonik.” Uzasadnienie: nazwiska z Mathematics Genealogy Project zamiast ogólnika. Miejsca: `IN_NOTA`, `src/lib/patroni.ts`.
- **„· sala B”:** ukryć w notce do czasu potwierdzenia. Uzasadnienie: oparcia brak, a sala obok nazywa się A.

### CMS, jeśli zostaje pełny tekst

**`o_studiach`, akapit 2, pełny (650 znaków, dziś 685):**

> Na kierunku matematyka studia I stopnia trwają trzy lata, a II stopnia — dwa. Pierwsze semestry to fundamenty: analiza matematyczna, algebra liniowa i wstęp do matematyki, w wersji standardowej albo rozszerzonej. Później studenci wybierają specjalność: przygotowującą do pracy badawczej, do zastosowań w analizie danych, finansach i ubezpieczeniach albo do pracy nauczyciela matematyki. Studia I stopnia kończą się egzaminem dyplomowym, a w programach sprzed 2026/27 także pracą licencjacką. Na studiach II stopnia wybór przedmiotów jest jeszcze szerszy, a praca magisterska powstaje pod opieką pracownika naukowego, często na styku z jego badaniami.

Uzasadnienie: zgodne z uchwałą Senatu i przewodnikiem. Skreślone „dla osób, które chcą od początku pracować intensywniej” sugerowało wolny wybór, a na 1. semestrze decyduje przydział.

**Pozostałe pary**
- `o_studiach_fakty[0]`: było „3 kierunki / matematyka, sztuczna inteligencja w analizie danych i ISIM — a po nich szkoła doktorska” → ma być „Koła naukowe / studenci rozwijają zainteresowania w kołach, które organizują wykłady, warsztaty i szkoły” (jak w prototypie). Uzasadnienie: nie powtarza nagłówka, a kierunki objaśnia akapit 3.
- `kierunki/matematyka.md`, etap „Specjalność i dyplom licencjacki”: było „Przedmioty specjalności, zespołowy projekt specjalnościowy i praca licencjacka. Studia kończy pisemny egzamin licencjacki (luty, czerwiec lub wrzesień).” → ma być „Przedmioty specjalności i projekt zespołowy, a na matematyce teoretycznej indywidualny. Studia kończy pisemny egzamin dyplomowy; w programie sprzed 2026/27 także praca licencjacka.” Uzasadnienie: `egzaminy-i-dyplom.md`.
- `kierunki/siad.md`, fakt: było „6 semestrów” → ma być „3 lata”. Uzasadnienie: ta sama forma co na matematyce i ISIM; ważne, bo te liczby wracają na nagłówki kierunków (zlecenie 11, zalecenie 9).

## 5. Do decyzji użytkownika
1. **Który tekst jest docelowy:** krótki `D` czy pełny CMS (widoczny dziś w prototypie i na stronie)? Jeśli CMS, akapit 2 trzeba poprawić niezależnie od reszty.
2. **Patron w tekście:** moja rada to zostawić go w notce. Opcjonalne zdanie opiera się na jednym wywiadzie w transkrypcji roboczej i wydłuża tekst.
3. **Fakt:** „oddany dydaktyce” (jedna wzmianka) czy „prowadził środowe seminarium” (kilka źródeł)?
4. **Etykieta trzeciej liczby:** „poziomy kształcenia”, „stopnie studiów” czy inna liczba zamiast niej?
5. **Skrót:** nowa wersja powyżej, czy wersja z prototypu (Koła naukowe, PKA, Erasmus+, Tutornia)?
6. **„sala B”:** ktoś w Instytucie musi potwierdzić, czy to sala Knastera.
7. **ISIM, 210 ECTS:** sprawdzić w programie studiów, nie dotyczy strony działu, ale widać to w nagłówku kierunku.
