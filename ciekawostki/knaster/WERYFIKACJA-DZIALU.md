# Weryfikacja działu Studia (patron: Bronisław Knaster)

Stan na 5 listopada 2026 r. Liczy się oferta na rok 2026/27.

Sprawdzone: `proto/zalozyciele.src.html` (obiekt `studia`, `IN_NOTA.studia`, `SALE`), `proto/zasoby/dane-dzialow.json` (`studia`), `Web-Studia/src/content/kierunki/*.md` (liczby, opisy, etapy, terminy deklaracji) oraz strona na żywo `im-uwr.github.io/Web-Core/studia`.

## 1. Werdykt

Liczby 3 kierunki, 5 specjalności, 3 + 2 lata, lata życia Knastera i opis kontinuum nierozkładalnego są zgodne ze źródłami. Są dwa wyraźne błędy rzeczowe: tekst działu i strona kierunku matematyka nadal mówią o pracy licencjackiej, której w programie od 2026/27 nie ma, a „3 stopnie studiów” są niezgodne z ustawą, bo szkoła doktorska nie jest już stopniem studiów. Przypisanie sali B do Knastera pozostaje niepotwierdzone: żadne znalezione źródło go nie podaje, więc proponuję usunąć dopisek do czasu odpowiedzi z Instytutu.

## 2. Do poprawy

### A. Błędy rzeczowe

| Fragment dosłownie | Co jest nie tak | Proponowana wersja | Źródło |
|---|---|---|---|
| 1. „Studia I stopnia kończą się pracą licencjacką i egzaminem licencjackim.” (`dane-dzialow.json`, `studia.tekst[1]`; także strona na żywo) | Od 2026/27 student I stopnia matematyki nie pisze pracy, zdaje tylko pisemny egzamin dyplomowy (na specjalności teoretycznej Projekt indywidualny daje pracę „o charakterze zbliżonym do pracy dyplomowej”). Pracę piszą jeszcze osoby, które zaczęły studia przed 1.10.2026. | „Studia I stopnia kończą się pisemnym egzaminem dyplomowym; osoby, które zaczęły studia przed 2026/27, piszą jeszcze pracę licencjacką.” | Przewodnik I st. (25.09.2026), rozdz. XI: „nie przygotowuje pracy dyplomowej” (`Web-Studia/public/pliki/studia/przewodnik-mt-lic.pdf`); `egzaminy-i-dyplom.md`, tabela programów; [uchwała Senatu 48/2026](https://bip.uni.wroc.pl/download/attachment/52226/uchwala-nr-48_2026-senatu-uwr-z-2026-05-27-w-sprawie-programu-studiow-dla-kierunku-matematyka-stacjonarne-i-i-ii-stopnia.pdf?v=1779865106) (przedmiot „Egzamin dyplomowy”) |
| 2. „Przedmioty specjalności, zespołowy projekt specjalnościowy i praca licencjacka. Studia kończy pisemny egzamin licencjacki (luty, czerwiec lub wrzesień).” (`matematyka.md`, etap „Semestry 5–6”; ten sam błąd w `opis_en`, tytuł „Specjalność i dyplom licencjacki”) | To opis starego programu, a strona ma kafelek „Nowy program studiów od roku 2026/27”. Rozjazd także z `egzaminy-i-dyplom.md` w tym samym repozytorium. | „Przedmioty specjalności i projekt zespołowy (na specjalności teoretycznej także projekt indywidualny). Studia kończy pisemny egzamin dyplomowy (luty, czerwiec lub wrzesień). Program dotychczasowy: także praca licencjacka.” | Jak wyżej; `przewodnik-mt-lic.pdf`, tabele 12 i 16 |
| 3. `['3', 'stopnie studiów']` (`D.studia.liczby`); na żywo „stopnie studiów (I, II, III)”; `kafelek_poziom: "III stopień"` (`szkola-doktorska.md`) | Ustawa zna tylko studia I i II stopnia oraz jednolite magisterskie. Kształcenie doktorantów w szkole doktorskiej to osobna forma, nie „studia III stopnia”. | Etykieta: „2 stopnie studiów i szkoła doktorska” albo „3 poziomy kształcenia”. Kafelek: „Szkoła doktorska”. | [Ustawa PSWN, art. 64 ust. 1](https://standardyprawa.pl/akt/232/art/28316); [Eurydice: szkolnictwo wyższe w Polsce](https://eurydice.eacea.ec.europa.eu/pl/eurypedia/poland/szkolnictwo-wyzsze) (osobno, ISCED 8); [strona Kolegium](https://www.math.uni.wroc.pl/kolegium-doktorskie-matematyki-rekrutacja) (mówi o „kształceniu”) |

### B. Nieścisłości

| Fragment dosłownie | Co jest nie tak | Proponowana wersja | Źródło |
|---|---|---|---|
| 4. „Później studenci wybierają specjalność: przygotowującą do pracy badawczej, do zastosowań w analizie danych, finansach i ubezpieczeniach albo do pracy nauczyciela matematyki.” | Pominięta matematyka stosowana (jest 5 specjalności). „Później” myli: nauczycielską deklaruje się do 31 grudnia na 1. semestrze, a start kształcenia nauczycielskiego po 2. semestrze uniemożliwia terminowe ukończenie studiów. Brak ścieżki ogólnej. | „Do końca 4. semestru studenci wybierają specjalność: analizę danych, matematykę aktuarialno-finansową, stosowaną lub teoretyczną. Matematykę nauczycielską trzeba zadeklarować już na 1. semestrze, do 31 grudnia. Można też studiować bez specjalności.” | Przewodnik I st., rozdz. IX pkt 1, 3, 4 |
| 5. „Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym.” (`IN_NOTA.studia`) | Knaster nie był jedynym autorem. Tarski pisze, że udowodnili je razem w 1927 r.; Knaster ogłosił wynik w 1928 r., wersję kratową Tarski podał w 1955 r. | „Topolog, współautor twierdzenia Knastera–Tarskiego o punkcie stałym.” | [Tarski, Pacific J. Math. 5 (1955), przypis 2](https://msp.org/pjm/1955/5-2/pjm-v5-n2-p11-p.pdf) |
| 6. „sztuczną inteligencję w analizie danych oraz Indywidualne Studia Informatyczno-Matematyczne (ISIM), prowadzone wspólnie z Instytutem Informatyki, z indywidualnym planem studiów i opieką tutora.” | Składnia pozwala odnieść „wspólnie”, „indywidualny plan” i „tutora” do obu kierunków. Dotyczą tylko ISIM. SIAD ma opiekuna kierunku i prowadzi go, wg repozytorium, Instytut Matematyczny. | „sztuczną inteligencję w analizie danych, prowadzoną w naszym Instytucie, oraz Indywidualne Studia Informatyczno-Matematyczne (ISIM): wspólny kierunek z Instytutem Informatyki, z indywidualnym planem studiów i opieką tutora.” | `siad.md`, `isim.md`; [studia-wmi: ISIM](https://studia-wmi.uwr.edu.pl/isim/) |
| 7. „Matematyka, sztuczna inteligencja w analizie danych i ISIM: studia I i II stopnia, szkoła doktorska oraz studia podyplomowe dla nauczycieli.” (`lead`) | Czyta się tak, jakby wszystkie trzy kierunki miały II stopień. II stopień ma tylko matematyka. | „Matematyka (I i II stopień), sztuczna inteligencja w analizie danych i ISIM (I stopień), szkoła doktorska oraz studia podyplomowe dla nauczycieli.” | `matematyka.md`, `siad.md`, `isim.md`; [studia-wmi](https://studia-wmi.uwr.edu.pl/) |
| 8. „od pierwszego roku można dopasować poziom zajęć do swoich możliwości” | Prawda co do dwóch poziomów, ale na 1. semestrze przydział ustala Instytut (matura, test, preferencje), a student może przejść tylko z rozszerzonego na standardowy. Wybór poziomu przez studenta jest od 2. semestru. Dotyczy matematyki: SIAD ma wersje „dla kierunku”, a ISIM domyślnie zaawansowaną. | „Na matematyce główne przedmioty od pierwszego semestru są prowadzone na dwóch poziomach, standardowym i rozszerzonym.” | Przewodnik I st., rozdz. I.1, II, VIII; `pierwszy-rok.md`, „Wersja standardowa czy rozszerzona?” |
| 9. „prowadzone w wersji standardowej albo rozszerzonej — dla osób, które chcą od początku pracować intensywniej” | Sugeruje wybór na życzenie. Na start decydują wyniki matury i testu kwalifikacyjnego, preferencje są tylko uwzględniane. Wersja rozszerzona to głębsza teoria, nie tylko intensywniejsza praca. | „prowadzone w wersji standardowej albo rozszerzonej, która głębiej traktuje teorię; przydział na 1. semestrze zależy od matury i testu kwalifikacyjnego” | Przewodnik I st., rozdz. II i VIII pkt 1 |
| 10. „Jakość kształcenia potwierdza ocena wyróżniająca, którą Polska Komisja Akredytacyjna przyznała kierunkowi matematyka.”; `skrot`: „ocena wyróżniająca Polskiej Komisji Akredytacyjnej dla kierunku matematyka” | Fakt prawdziwy, ale bez daty: ocena jest z 6.12.2018, dotyczy poprzedniego programu, a następna ma być w 2026/27. | „W 2018 roku Polska Komisja Akredytacyjna przyznała kierunkowi matematyka ocenę wyróżniającą.”; `skrot`: „ocena wyróżniająca PKA (2018) dla kierunku matematyka”. Przed publikacją sprawdzić wynik nowej oceny. | [Uchwała Prezydium PKA 744/2018](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/07/uchwala_UWR_matematyka.pdf), zapis o następnej ocenie |
| 11. „Zgłoszenie promotora do 31 października (rekrutacja letnia) lub 31 marca (zimowa)” (`matematyka.md`, etap i `terminy`) | Przewodnik II st. dla programu od 2026/27 podaje 30 października i 30 marca. `egzaminy-i-dyplom.md` odnotowuje tę rozbieżność, strona kierunku nie. | Do decyzji Instytutu (punkt 8 sekcji 3). Do tego czasu: „do 31 października / 31 marca; w programie od 2026/27 do 30 października / 30 marca”. | Przewodnik II st. (25.09.2026), rozdz. II pkt 6 |
| 12. `['5', 'specjalności']` obok `['3', 'kierunki studiów']`; `skrot`: „specjalności do wyboru” | Liczba dotyczy tylko kierunku matematyka, a układ sugeruje całość działu. | „5 specjalności na matematyce” | Przewodnik I st., rozdz. IX; `siad.md`, `isim.md` |
| 13. „Tradycja Hugona Steinhausa i Edwarda Marczewskiego, którzy po wojnie tworzyli wrocławską matematykę.” (`matematyka.md`) | Nie jest błędne, ale pomija patrona działu i Ślebodzińskiego, choć reszta strony mówi o czwórce pionierów. | „Tradycja czterech pionierów: Steinhausa, Marczewskiego, Knastera i Ślebodzińskiego, którzy po wojnie tworzyli wrocławską matematykę.” | [Duda, Weron, Wiad. Mat. XLII (2006), s. 75](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf); [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Knaster/) |
| 14. „Nierozkładalne: nie jest sumą dwóch mniejszych kontinuów.” (`znakFakt`) | Treść poprawna, „mniejszych” to skrót od „właściwych podkontinuów”. Drobiazg: znak nie ma roku, choć mają go znaki Szpilrajna (1930) i kanapki (1938), a `ciekawostki/BRIEF.md` chce „nazwa + rok”. | Dla laika bez zmian, z rokiem: „Nierozkładalne: nie jest sumą dwóch mniejszych kontinuów (1922).” Wersja ścisła: „nie jest sumą dwóch swoich właściwych podkontinuów”. | [Wikipedia: Indecomposable continuum](https://en.wikipedia.org/wiki/Indecomposable_continuum) (punkt wyjścia); [Pyrih, Examples in Continuum Theory](https://karlin.mff.cuni.cz/~pyrih/e/e2001v1/c/ect/node97.html) |

### C. Sformułowania zbyt mocne lub niepotwierdzone

| Fragment dosłownie | Co jest nie tak | Proponowana wersja | Źródło |
|---|---|---|---|
| 15. `SALE.studia = 'B'`, baner „· patron działu · sala B”; plan w `dok/estetyka.md`: „Nasze sale wykładowe noszą imiona założycieli wrocławskiej matematyki” | **Niepotwierdzone.** Żadne źródło nie wiąże sali B z Knasterem. Jedyna nazwa imienna w repozytorium to „HS (audytorium im. Prof. Hugona Steinhausa)”; A i B stoją obok siebie jako zwykłe sale. Poszlaka, nie dowód: dla Knastera wzór HS, WS, EM dałby „BK”, a para A i B wygląda na litery porządkowe. Także dla WS i EM nie znalazłem potwierdzenia, że noszą czyjeś imiona. | Usunąć „· sala B”: „1893–1980 · patron działu”. Ciekawostki o salach nie publikować przed potwierdzeniem. | `pierwszy-rok.md`, „Budynek Instytutu”; `plan-zimowy.json` (sale A i B obok EM, HS, WS). Brak wzmianki u Dudy i Werona (2006), w MacTutor i w [wywiadzie z Dudą (2024)](https://entanglements.ihpan.edu.pl/wp-content/uploads/2024/09/TWP_interview_DUDA_Roman_2024-03-21_wywiad3_seminarium_Knastera_part2-edit-02-09-2024-web.pdf) |
| 16. „Zajęcia prowadzą aktywni badacze”; `matematyka.md`: „uczysz się u aktywnych badaczy”, „Zajęcia prowadzą pracownicy naukowi” | Jako zdanie o wszystkich zajęciach zbyt mocne. Instytut sam pisze, że część zajęć prowadzą przedstawiciele firm i aktuariusze; zajęcia prowadzą też doktoranci. Oparcie ma ogólna teza o kadrze (A+, dorobek w raporcie PKA). „Uczymy matematyki tak, jak ją uprawiamy” to hasło, nie fakt; może zostać. | „Wykładają u nas badacze z Instytutu o kategorii A+; część zajęć prowadzą także doktoranci i praktycy z firm.” | [Rekrutacja IM 2025](https://rekrutacja.math.uni.wroc.pl/index.php?www=program-nauczania); `pierwszy-rok.md` (konsultacje doktorantów); `szkola-doktorska.md` (praktyki); [raport PKA 2018](https://backend.deqar.eu/reports/PKA/364043_20251021_0728_Raport_mat_UWR_signed.pdf); [studia-wmi: matematyka](https://studia-wmi.uwr.edu.pl/matematyka/) |
| 17. „a program łączy solidne podstawy z dużą swobodą wyboru” | Przewodnik sam ogranicza tę tezę: w sem. 2–4 wpływ studenta jest „ograniczony ze względu na znaczną liczbę przedmiotów obowiązkowych”, a w sem. 5–6 plan „niemal w całości zależy od indywidualnych decyzji”. Uchwała liczy 86 ze 180 ECTS jako „do wyboru”, ale obejmuje to bloki specjalności. Pula swobodnego wyboru to minimum 6–12 ECTS (AD, MAF, MS), 24 (N), 30 (TEOR), 54 (ścieżka ogólna). | „a program łączy solidne podstawy z coraz większym wyborem: po wyborze specjalności, w semestrach 5–6, plan zależy niemal w całości od Twoich decyzji.” | Przewodnik I st., rozdz. I.1, X.1, tabele 13–18; uchwała 48/2026 |
| 18. „Topolog, oddany dydaktyce.” (`fakt`); „we Wrocławiu poświęcił się głównie dydaktyce i pracy wydawniczej” (tabela patronów) | Do obrony, ale to skrót. MacTutor wymienia trzy rzeczy: „didactical, organising and editorial tasks”, a przy tym prace „especially in the 1950s”. Źródła pokazują dydaktykę jako seminarium i promotorstwo. Żadne ze sprawdzonych nie opisuje jego zwykłych wykładów we Wrocławiu, a seminarium, wg Dudy, prowadził w domu ze względów zdrowotnych. | `fakt`: „Topolog, prowadził legendarne seminarium.” Tabela patronów: „poświęcił się głównie dydaktyce, organizacji i pracy wydawniczej”. | [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Knaster/); [Duda, Weron (2006)](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf); [Krupski o Charatoniku](https://paginas.matem.unam.mx/matematicos/images/C/Janusz/Krupski.pdf) („legendary”); wywiad z Dudą (2024) |
| 19. „Wychował pokolenia wrocławskich matematyków.” (`IN_NOTA.studia`) | „Wrocławskich” zawęża, „pokolenia” brzmi mocno przy 8 doktorantach, choć seminarium trwało ponad 30 lat (1947–1980). Doktoranci rozjechali się: Lelek do USA, Charatonik do Meksyku, Mioduszewski do Katowic, Reichaw do Izraela. | „Jego środowe seminarium z topologii wykształciło wielu matematyków, nie tylko wrocławskich.” | Duda, Weron (2006), s. 76, 86, 92–94: „kuźnią licznych kadr matematycznych”, „nie tylko wrocławskich”; [MGP](https://mathgenealogy.org/id.php?id=25831) |
| 20. „Każdy rocznik ma swojego opiekuna” | **Niepotwierdzone.** Sprawdzone źródła mówią tylko o opiekunie I roku i opiekunach specjalności. | „Pierwszy rok ma swojego opiekuna” (punkt 2 sekcji 3) | `pierwszy-rok.md`, `sprawy-studenckie.md`, `matematyka.md`; raport PKA 2018 |
| 21. „pomagają w rozwiązywaniu zadań i w nadrabianiu zaległości” | **Niepotwierdzone** co do „nadrabiania zaległości”: źródła mówią o pomocy w zadaniach i nauce. | „pomagają w rozwiązywaniu zadań” | `pierwszy-rok.md`; [studia-wmi: matematyka](https://studia-wmi.uwr.edu.pl/matematyka/) |
| 22. „seminaria naukowe Instytutu są otwarte dla wszystkich zainteresowanych” | **Niepotwierdzone**: brak źródła na regułę dla wszystkich seminariów. | „studenci mogą przychodzić na seminaria naukowe Instytutu” (po potwierdzeniu) | Brak w Web-Studia i Web-Nauka; punkt 6 sekcji 3 |
| 23. „często na styku z jego badaniami” | **Niepotwierdzone**: brak danych o częstości. Sama opieka promotora jest potwierdzona. | Usunąć: „praca magisterska powstaje pod opieką promotora, którego student wybiera wśród pracowników badawczo-dydaktycznych”. | Przewodnik II st., rozdz. II pkt 6 |

### Różnice między prototypem, repozytorium i stroną na żywo

- **`Web-Studia` nie ma tekstu działu.** `git ls-files | grep -iE 'dzial|kierunk'` daje tylko cztery pliki kierunków. Tekst „O studiach” jest w `dane-dzialow.json`.
- **`dane-dzialow.json` a `IN_DANE` w prototypie:** `studia` identyczne.
- **`D.studia` a `dane-dzialow.json`:** `D.studia.tekst` to starsza, krótka wersja (2 akapity, kończy się „Szczegóły są w zakładce Kierunki.”). `D.studia.skrot` to „3 lata / 2 lata / 5”, a JSON ma „Koła naukowe / PKA / Erasmus+ / Tutornia”. Widok `.in-*` nadpisuje `tekst` i `skrot` danymi z JSON, widok `.d-baner` używa `D.studia`.
- **Strona na żywo a prototyp** (odczyt WebFetch z 5.11.2026, warto sprawdzić w przeglądarce; zrzut `proto/zasoby/obecna-studia.jpg`, bez daty, pokazuje stan zgodny z JSON):
  - lead zaczyna się: „Instytut Matematyczny prowadzi studia I i II stopnia na kierunku matematyka,” (w JSON: „Matematyka, sztuczna inteligencja w analizie danych i ISIM: …”);
  - liczby: „3 kierunki studiów”, „5 specjalności do wyboru”, „3 stopnie studiów (I, II, III)”, „81 nauczycieli akademickich” (w prototypie 3, 5, 3, bez 81);
  - pierwsza pozycja „W skrócie”: „3 kierunki: matematyka, sztuczna inteligencja w analizie danych i ISIM — a po nich szkoła doktorska” (w JSON „Koła naukowe”);
  - brak nazwiska Knastera i sali B; to nowe elementy prototypu.
- **Kierunki a tekst działu:** „Zajęcia prowadzą pracownicy naukowi” (`matematyka.md`) wobec „aktywni badacze” (dział); „Opiekun I roku” (`matematyka.md`, `siad.md`) wobec „Każdy rocznik” (dział); `egzaminy-i-dyplom.md` rozróżnia programy, a etap w `matematyka.md` i tekst działu nie.

## 3. Do potwierdzenia w Instytucie

Osoby podaję za `Web-Studia` (strony kontaktowe i tabela „Opiekun roku i ważne osoby”).

1. **Sala B i pozostałe nazwy (WS, EM):** czy mają patronów i czy jest na to uchwała lub tabliczka. Sekretariat dydaktyczny (Justyna Jędrzejewska-Idczak, pok. 315), dr Tomasz Elsner (pok. 305), w razie wątpliwości dyrektor prof. Grzegorz Karch.
2. **Czy opiekuna ma każdy rocznik,** czy tylko pierwszy: dr Jan Kraszewski lub dr Elsner.
3. **Czy liczyć kierunek Sztuczna inteligencja II st.:** `siad.md` mówi, że prowadzą go wspólnie Instytut Informatyki i Instytut Matematyczny, a plan zajęć ma grupy „tylko dla SI”. Wtedy „3 kierunki” to liczba niepełna albo trzeba napisać „3 kierunki I stopnia”. [Uchwała 9/2025](https://studia-wmi.uwr.edu.pl/UWr-program-SI-IIst.pdf) wskazuje tylko Wydział (informatyka 51%, matematyka 37%). Dr Elsner lub dziekan prof. Dariusz Buraczewski.
4. **SIAD a jednostka prowadząca:** `siad.md` podaje Instytut Matematyczny, [uchwała 8/2025](https://studia-wmi.uwr.edu.pl/UWr-program-siad.pdf) tylko Wydział. Dr hab. Michał Marcinkowski.
5. **PKA:** czy i kiedy jest ocena w 2026/27, skoro uchwała 744/2018 wyznacza ten rok. Dr Elsner lub prodziekan dr hab. Andrzej Raczyński.
6. **Otwartość seminariów** i prawo studentów do udziału: dyrekcja.
7. **Koła naukowe:** repozytorium wymienia dwa (Matematyków Teoretyków, Zastosowań Matematyki), raport PKA 2018 trzy inne nazwy. Potwierdzenie mam tylko dla współorganizacji szkoły Baby Steps Beyond the Horizon; „wykłady, warsztaty” są niepotwierdzone, a przykład koła w prototypie jest oznaczony „Testowe”. Samorząd WMI lub opiekunowie kół.
8. **Termin Formularza E:** 30 czy 31 października i marca w programie od 2026/27: dr Elsner.
9. **„Studia są stacjonarne i prowadzone po polsku”** (`matematyka.md`): [rekrutacja IM 2025](https://rekrutacja.math.uni.wroc.pl/index.php?www=program-nauczania) pisze, że niektóre zajęcia są po angielsku. Dr Elsner.
10. **Studia podyplomowe:** czy jest nabór 2026/27. Treści w repozytorium opisują 3 semestry, ale strony rekrutacji UWr nie udało się otworzyć. Kierownik studiów dr hab. Ziemowit Rzeszotnik.
11. **„Nasi absolwenci pracują w firmach technologicznych, bankach i towarzystwach ubezpieczeniowych, w szkołach i na uczelniach”:** zgodne z `kariera` w repozytorium, ale bez danych. Instytut może to oprzeć o [ELA](https://ela.nauka.gov.pl/).
12. **Dydaktyka Knastera:** potwierdzić w pełnym tekście Dudy (Wiad. Mat. 25, 1983; Colloq. Math. 51, 1987) i ewentualnie w protokołach seminarium, które wg Krupskiego są przechowywane w Katedrze Topologii. Zakład Teorii Mnogości i Topologii.

**Strony, których nie udało się odczytać (bez prób obejścia):**
- [Duda, Wiad. Mat. 25 (1983)](https://wydawnictwa.ptm.org.pl/index.php/wiadomosci-matematyczne/article/download/4004/3610): serwis zwrócił bramkę JavaScript zamiast treści.
- [Duda, Colloq. Math. 51 (1987), PLDML](http://pldml.icm.edu.pl/pldml/element/bwmeta1.element.desklight-69a95ad6-4028-4be9-85b5-80650c7ce492/c/cm51_1_07.pdf): `client_error`.
- `rekrutacja.uwr.edu.pl/kierunek/193` i `/lista-kierunkow`: `robots_disallowed`. Stąd brak oficjalnej strony rekrutacji UWr; ofertę 2026/27 sprawdziłem na `studia-wmi.uwr.edu.pl` i `uwr.edu.pl`.

**Zakres i zastrzeżenia:**
- Treść stron pobieranych przez WebFetch przechodzi przez model streszczający, więc cytaty internetowe to krótkie wyjątki. Warto je porównać z oryginałem przed przedrukiem. Numery stron Dudy i Werona są przybliżone.
- Uchwała 48/2026 odczytana do ok. s. 25 z 76. II stopień potwierdziłem więc Przewodnikiem II st., a nie samą uchwałą.
- Nie sprawdzałem pojedynczo wszystkich dat, osób i ECTS w 1392 wierszach kierunków. W `szkola-doktorska.md` nie weryfikowałem „8 semestrów” i „270 godzin” z programu: `program_matematyka_od_2026_2027.pdf` nie daje czytelnego tekstu. Oceny 2010 z tekstu Instytutu nie sprawdzałem.

## 4. Potwierdzone

**Knaster**
- Urodzony 22.05.1893 w Warszawie → MacTutor, Wikipedia.
- Zmarł 3.11.1980 we Wrocławiu → MacTutor, Wikipedia; lata 1893–1980 → Duda, Weron (2006), s. 93.
- Topolog → Duda, Weron: katedra topologii (s. 81), kontynuator warszawskiej szkoły topologii mnogościowej (s. 76).
- „the great four”, czterej pionierzy we Wrocławiu → MacTutor; Duda, Weron, s. 75.
- We Wrocławiu „soon devoted himself completely to didactical, organising and editorial tasks” → MacTutor.
- Seminarium wyższe z topologii od 26.11.1947, w środy → Duda, Weron, s. 82–83, 86.
- Seminarium w domu za zgodą, ze względów zdrowotnych, zwykle do 10 osób → wywiad z Dudą (2024).
- Praca wydawnicza: 131 tomów serii B Wrocławskiego Towarzystwa Naukowego, 1949–1978 → MacTutor.
- Wrocławska Drukarnia Naukowa → Duda, Weron (2006).
- 8 doktorantów, 110 potomków → [MGP](https://mathgenealogy.org/id.php?id=25831); „8 dr.” → [Wrocławska Szkoła Matematyczna, dbc.wroc.pl](https://dbc.wroc.pl/Content/1789/PDF/Dzielo%2023%20Wroc%C5%82awska%20Szko%C5%82a%20Matematyczna.pdf), s. 336 (autor nieustalony).
- Twierdzenie: Knaster i Tarski 1927, publikacja Knastera 1928 (Ann. Soc. Polon. Math. 6, 133–134), wersja kratowa 1955 → Tarski (1955), przypis 2.
- Definicja kontinuum nierozkładalnego: brak rozkładu na dwa właściwe podkontinua → Wikipedia.
- Konstrukcja: półokręgi nad osią o środku 1/2 oraz pod osią na [2/3ⁿ, 3/3ⁿ] o środkach 5/(2·3ⁿ) → Pyrih.
- Historia: Brouwer 1910, Janiszewski 1912, opis i pierwszy pełny dowód nierozkładalności Knastera w pracy Kuratowskiego (Fund. Math. 3, 1922) → Pyrih.
- Nazwa w użyciu: „Knaster's Buckethandle”, „B-J-K continuum” → Pyrih.
- Znak w prototypie (`znakKnaster`) zgodny z konstrukcją: 16 punktów zbioru Cantora, 15 łuków, jedna droga od 0 do 1/27 → obliczenie własne na wzorze z kodu.

**Liczby i kierunki**
- 3 kierunki w ofercie: matematyka, SIAD, ISIM → [studia-wmi](https://studia-wmi.uwr.edu.pl/); [UWr, Rekrutacja 2026/27](https://uwr.edu.pl/rekrutacja-2026-27-studia-matematyczne-i-informatyczne-na-uwr/) (z zastrzeżeniem z punktu 3 sekcji 3).
- Matematyka I st.: 6 semestrów, 180 ECTS, licencjat, profil ogólnoakademicki, stacjonarne → uchwała 48/2026.
- Matematyka II st.: 4 semestry, 120 ECTS → Przewodnik II st., rozdz. II; [raport PKA 2018](https://backend.deqar.eu/reports/PKA/364043_20251021_0728_Raport_mat_UWR_signed.pdf).
- 5 specjalności na I st.: analiza danych, aktuarialno-finansowa, stosowana, teoretyczna, nauczycielska → uchwała 48/2026; Przewodnik I st., rozdz. IX; [studia-wmi](https://studia-wmi.uwr.edu.pl/matematyka/).
- 5 specjalności na II st. → Przewodnik II st., rozdz. I; [studia-wmi](https://studia-wmi.uwr.edu.pl/matematyka2/).
- Ścieżka ogólna bez specjalności → oba przewodniki.
- Limity 2026/27: 175 miejsc (I st.), 100 miejsc (II st.) → studia-wmi.
- Pierwszy semestr: analiza matematyczna, algebra liniowa, wstęp do matematyki, po dwie wersje → Przewodnik I st., tabela 1.
- Deklaracje: C2 do 30 czerwca, C1 do 31 grudnia, C3 do 15 października → przewodniki; `matematyka.md`.
- Na II st. wybór szerszy: minimum 36–56 z 104 ECTS wobec 6–54 ze 175 na I st. → przewodniki, tabele planów.
- Praca magisterska u promotora; egzamin pisemny i ustny → Przewodnik II st., rozdz. II pkt 6, 8.
- SIAD: I st., 6 semestrów, 180 ECTS, licencjat, od 2025/26 → uchwała 8/2025.
- SIAD: matematyka 71%, informatyka 29%; 70 ECTS do wyboru i co najmniej 53 ECTS wg przypisów → uchwała 8/2025; dwie liczby `siad.md` mają różne zakresy, nie są sprzeczne.
- SIAD: projekt zespołowy i egzamin dyplomowy, bez pracy → uchwała 8/2025.
- ISIM: 3 lata, prowadzony wspólnie przez Instytut Informatyki i Instytut Matematyczny → [studia-wmi](https://studia-wmi.uwr.edu.pl/isim/).
- ISIM: 6 semestrów, 210 ECTS, w tym co najmniej 182 → [program ISIM](https://studia-wmi.uwr.edu.pl/UWr-program-isim.pdf).
- ISIM: tutor, plan uzgadniany co semestr, praca i egzamin w dwóch częściach → program ISIM.

**Jakość i otoczenie**
- Matematyka: ocena wyróżniająca PKA, uchwała 744/2018 z 6.12.2018 → [PKA](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/07/uchwala_UWR_matematyka.pdf).
- ISIM: ocena pozytywna, uchwała 391/2023 z 15.06.2023 → [PKA](https://backend.deqar.eu/reports/PKA/368343_20251021_0853_3._oc_uchw_indyw_st_informat-matemat_UnWrocl.pdf).
- ISIM i informatyka: certyfikat doskonałości; matematyka UWr: brak na liście → [wykaz PKA](https://pka.edu.pl/wp-content/uploads/2026/04/Wykaz-Certyfikatow-Doskonalosci-Ksztalcenia-PKA-1.pdf).
- Kategoria A+ matematyki za lata 2022–2025 → [IM, 3.08.2026](https://math.uni.wroc.pl/news/otrzymalismy-kategorie-naukowa); [UWr, 6.08.2026](https://uwr.edu.pl/cztery-dyscypliny-uwr-z-kategoria-a/).
- Kolegium Doktorskie Matematyki w Szkole Doktorskiej UWr → [strona IM](https://www.math.uni.wroc.pl/kolegium-doktorskie-matematyki-rekrutacja).
- Tutornia: sala 202, od 19.10.2026, starsi studenci → `pierwszy-rok.md`; ogłoszenie w prototypie.
- Tutoring rówieśniczy dla pierwszego roku → raport PKA 2018; studia-wmi.
- Erasmus+, MOST: semestr lub rok, w Polsce i za granicą; koordynatorzy w IM → `sprawy-studenckie.md`, `program-most.md` (Erasmus+: wyjazd od III roku licencjatu).
- Koło Matematyków Teoretyków współorganizuje szkołę Baby Steps Beyond the Horizon → `sprawy-studenckie.md`.
- Plan zajęć, kalendarz z kolorami dni, zapisy, terminy i formularze, egzaminy i dyplom → pliki w `Web-Studia` (`kolory-dni.json`, `rok-akademicki.md`, `zajecia.md`, `egzaminy-i-dyplom.md`).
- Kwalifikacyjne studia podyplomowe dla nauczycieli, 3 semestry → `podyplomowe.md` (nabór 2026/27: punkt 10 sekcji 3).

**Rozbieżności między źródłami**
- Doktorat Knastera: MGP podaje 1922 (rok rozprawy), Duda i Weron oraz „Wrocławska Szkoła Matematyczna” 1923. Nie dotyczy tekstu działu, tylko ciekawostek.
- Kategoria A+ matematyki: [UWr, 23.07.2026](https://uwr.edu.pl/wyniki-ewaluacji-na-uniwersytecie-wroclawskim-2022-2025/) podał A, po decyzjach administracyjnych UWr (6.08.2026) i IM (3.08.2026) podają A+. Przyjmuję A+ jako późniejsze.
- Liczba specjalności: 9 (PKA 2018), 6 ([rekrutacja IM 2025](https://rekrutacja.math.uni.wroc.pl/index.php?www=program-nauczania)), 5 (2026/27); „matematyka w ekonomii” jest wygaszana (`specjalnosci/matematyka-w-ekonomii.md`).
- Nazwa kontinuum: Pyrih „Knaster's Buckethandle”, Wikipedia „Brouwer–Janiszewski–Knaster”, [Iyer, 2022](https://arxiv.org/abs/2208.02461) „Brouwer bucket handle” jako najprostsze z rodziny „Knaster continua”.
- Nazwisko doktoranta: Reichbach (MGP: Reichaw-Reichbach), Duda i Weron: Meir Reichaw.
