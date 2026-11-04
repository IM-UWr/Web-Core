# Weryfikacja tekstów działu Instytut (patron: Edward Marczewski)

Stan na 5.11.2026. Sprawdzono: `proto/zalozyciele.src.html` (obiekt `instytut`, `IN_INST`, `IN_NOTA`, `SALE`), podgląd strony (`im-uwr.github.io/Web-Podglad/instytut/`), `Web-Ustawienia/src/data/dzialy/instytut.json`, `Web-Core/src/lib/patroni.ts` i `src/lib/widoki/dzialInstytut.ts` (gałąź `wyglad/zalozyciele`), repozytoria `tresci/Web-*`.

## 1. Werdykt

Tekst działu w większości trzyma się publikacji o wrocławskiej matematyce, ale ma dwa błędy widoczne od razu: Marczewski był rektorem w latach **1953–1957**, a nie 1957–1962, a rektorów-matematyków było **pięciu**, a nie trzech. Dalsze poprawki dotyczą nazwy PKA w 2010 roku, „studiów III stopnia” we wstępie, daty budynku, „3 czasopism redagowanych w Instytucie” oraz sformułowania o pracy przymusowej, które jest prawdziwe, ale można je napisać dokładniej i taktowniej. Strona jest zgodna z prototypem (poza wstępem), więc poprawki trzeba nanieść w obu miejscach, także w wersji angielskiej.

## 2. Do poprawy

### Błędy rzeczowe

| Fragment (dosłownie) | Co jest nie tak | Proponowana wersja | Źródło |
|---|---|---|---|
| „rektor Uniwersytetu w latach 1957–1962” (`IN_NOTA`, `patroni.ts`) | Marczewski był rektorem 1.12.1953–26.10.1957. W latach 1957–1962 rektorami byli Szarski i Świda. Daty zapisano z pamięci (`dok/estetyka.md`). `ciekawostki.json` ma już dobre lata. | „Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1953–1957. Zabiegał o budowę gmachu Instytutu.” | [Duda, Hartman](https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_obituary/); [Duda, Weron 2006, s. 90](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf); [Biler, Buraczewski, s. 3–4](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/07/historiamat.pdf); [lista rektorów](https://en.wikipedia.org/wiki/List_of_rectors_of_the_University_of_Wroc%C5%82aw) (dokładne daty) |
| „3 rektorów” / „matematycy Marczewski, Urbanik i Duda kierowali Uniwersytetem Wrocławskim jako rektorzy” | Wydziałowa historia wymienia pięciu: Marczewski (1953–57), Urbanik (1975–81), Łukaszewicz (1981–82), Duda (1995–99), Pacholski (2005–08). Polska Wikipedia podaje czterech z Instytutu, bez Pacholskiego, którego Biler i Buraczewski nazywają „matematykiem z wykształcenia”. | „5 rektorów” / „matematycy Marczewski, Urbanik, Łukaszewicz, Duda i Pacholski kierowali Uniwersytetem Wrocławskim jako rektorzy”. Węższy wariant: „4 rektorów” / „z Instytutu wywodzili się rektorzy Marczewski, Urbanik, Łukaszewicz i Duda”. | [Biler, Buraczewski, s. 3–4, 13](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/07/historiamat.pdf); [Wikipedia: IM UWr](https://pl.wikipedia.org/wiki/Instytut_Matematyczny_Uniwersytetu_Wroc%C5%82awskiego) |
| „Polska Komisja Akredytacyjna w 2010 i 2018 roku przyznała kierunkowi matematyka ocenę wyróżniającą.” | W 2010 roku była to Państwowa Komisja Akredytacyjna (uchwała 280/2010). Obecna nazwa obowiązuje od 2011 roku. „Warto wiedzieć” w Web-Instytut ma to dobrze. | „Państwowa, a później Polska Komisja Akredytacyjna przyznała kierunkowi matematyka ocenę wyróżniającą w 2010 i 2018 roku.” | `Web-Instytut/src/content/warto_wiedziec/wyrozniajaca-ocena-pka.md`; [gov.pl o PKA](https://www.gov.pl/web/nauka/polska-komisja-akredytacyjna--20-lat-dzialan-na-rzecz-zapewnienia-i-doskonalenia-jakosci-w-szkolnictwie-wyzszym) |
| „Prowadzimy badania naukowe i seminaria oraz studia I, II i III stopnia i studia podyplomowe.” (wstęp na stronie, pole `wstep`; nie ma go w prototypie) | Od 2019/20 doktoranci kształcą się w szkołach doktorskich, a studia III stopnia są wygaszane. Sama strona pisze dalej o Kolegium Doktorskim Matematyki Szkoły Doktorskiej UWr. | „Prowadzimy badania naukowe i seminaria, studia I i II stopnia oraz studia podyplomowe, a doktoranci kształcą się w Szkole Doktorskiej UWr.” | [gov.pl: szkoły doktorskie](https://www.gov.pl/web/nauka/doktoranci-i-szkoly-doktorskie); `Web-Studia/src/content/kierunki/szkola-doktorska.md` |

### Nieścisłości i sformułowania zbyt mocne

| Fragment (dosłownie) | Co jest nie tak | Proponowana wersja | Źródło |
|---|---|---|---|
| „Budynek powstał m.in. dzięki staraniom Marczewskiego — w miejscu, gdzie pod koniec wojny on sam jako robotnik przymusowy budował pas startowy dla oblężonej Festung Breslau.” | Sam fakt ma dwa niezależne potwierdzenia (Biler i in. 2015; J. Łoś). „On sam… budował” brzmi jednak jak czynność z wyboru, a zdanie nie mówi, że wywieźli go Niemcy. Łoś pisze o niwelowaniu terenu pod lotnisko, a Łoś i Wrocław.pl lokalizują je ogólniej niż „w miejscu”. Informacja o „staraniach” ma tylko jedno źródło, więc „m.in.” musi zostać. | „Budynek powstał m.in. dzięki staraniom Marczewskiego, na terenie, na którym w 1945 roku Niemcy zmusili go do pracy przy budowie lotniska wojskowego oblężonej Festung Breslau; do obozu pracy we Wrocławiu wywieziono go we wrześniu 1944 roku, w czasie powstania warszawskiego.” | [Biler, Krupski, Plebanek, Woyczyński 2015](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2024/05/11-BKPW-PiP-3-2015.pdf); [Łoś, s. xix](https://www.impan.pl/shop/media/wysiwyg/83-86806-00-1/mar-los.pdf); [Duda, Hartman](https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_obituary/); [Wrocław.pl](https://www.wroclaw.pl/dla-mieszkanca/z-powstanczej-warszawy-do-breslau) |
| „Pas startowy” / „budynek Instytutu stoi tam, gdzie pod koniec wojny Marczewski jako robotnik przymusowy budował lotnisko” | Fakt się zgadza, ale hasło stoi obok „Żywej gęsi” i czyta się jak anegdotę, a chodzi o przymusową pracę w oblężonym mieście, przy której część warszawiaków skierowanych do budowy pasa zginęła w walkach o miasto. W wersji angielskiej trzeba też zmienić „Airstrip”. | „Plac Grunwaldzki” / „budynek Instytutu stoi na terenie, na którym w 1945 roku Niemcy zmusili Marczewskiego do pracy przy budowie lotniska wojskowego”. Decyzja, czy zostawić to w „W skrócie”, należy do Instytutu. | jak wyżej; `ciekawostki/BRIEF.md` (zasada taktu przy wojnie) |
| „Od końca lat sześćdziesiątych Instytut mieści się przy placu Grunwaldzkim 2” | Źródła się różnią: „w końcu lat sześćdziesiątych” (Biler i in. 2015), „W 1970 powstają pierwsze obiekty” (Biler, Buraczewski), budowa audytorium na zdjęciu z 1968 r. i „Zbudowano: 1972” (fotopolska), 1967–1972 (polska Wikipedia). Wcześniej Instytut mieścił się w gmachu Wydziału Inżynierii Sanitarnej, też przy pl. Grunwaldzkim (Duda, Weron). Żadne źródło nie podaje daty przeprowadzki. | „Od około 1970 roku Instytut mieści się w gmachu przy placu Grunwaldzkim 2” | [Biler, Buraczewski](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/07/historiamat.pdf); [fotopolska](https://fotopolska.eu/Wroclaw/b15603,Wydzial_Matematyki_i_Informatyki_UW.html); [Duda, Weron, s. 76–77](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf) |
| „Kazimierz Urbanik kierował pierwszą w polskiej matematyce katedrą rachunku prawdopodobieństwa” | Tylko jedno, niepodpisane źródło: „została utworzona dla niego pierwsza w historii matematyki polskiej Katedra Rachunku Prawdopodobieństwa” (ok. 1962). Duda i Weron, Biler i Buraczewski („zakład kierowany przez”) oraz nekrolog IMPAN tego nie podają. „Pierwsza” niepotwierdzona, a nie błędna. | Bezpiecznie: „Kazimierz Urbanik stworzył we Wrocławiu silną szkołę rachunku prawdopodobieństwa”. Albo po potwierdzeniu (sekcja 3): „Dla Kazimierza Urbanika utworzono na początku lat sześćdziesiątych katedrę rachunku prawdopodobieństwa, według opracowań pierwszą w polskiej matematyce”. | [„Wrocławska Szkoła Matematyczna”, DBC](https://dbc.wroc.pl/Content/1789/PDF/Dzielo%2023%20Wroc%C5%82awska%20Szko%C5%82a%20Matematyczna.pdf); [IMPAN o Urbaniku](https://old.impan.pl/Great/Urbanik) |
| „a w 1980 roku wrocławscy probabiliści założyli czasopismo „Probability and Mathematical Statistics”” | Pismo podaje jako założyciela Urbanika. Web-Nauka pisze o probabilistach i statystykach (Urbanik, Ryll-Nardzewski, Klonecki). Ta sama strona ma więc dwie wersje. | „a w 1980 roku z jego inicjatywy, wraz z wrocławskimi probabilistami i statystykami, powstało czasopismo „Probability and Mathematical Statistics”” | [PMS](https://www.math.uni.wroc.pl/~pms/); Duda, Weron, s. 82; `Web-Nauka/src/data/publikacje.json` |
| „3 czasopisma redagowane w Instytucie” (`D.instytut.skrot`; na stronie jako nagłówek domyślny „Czasopisma redagowane w Instytucie” w Web-Nauka) | Applicationes Mathematicae ma według IMPAN redakcję w Warszawie (Ł. Stettner, Śniadeckich 8), a wśród redaktorów z podaną lokalizacją nie ma Wrocławia. Stara strona Instytutu wymienia je jednak jako „redagowane”. Pozostałe dwa są wrocławskie: Colloquium i PMS. Web-Nauka ma już to samo jako zadanie „do uzupełnienia”. | „2 czasopisma redagowane w Instytucie” albo, jak w tekście Nauki, „3 czasopisma redagowane z udziałem Instytutu”, jeśli Instytut potwierdzi udział w Applicationes. | [IMPAN: Applicationes](https://impan.pl/en/publishing-house/journals-and-series/applicationes-mathematicae); [IMPAN: Colloquium](https://impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum); [stara strona](https://www.math.uni.wroc.pl/redagowane-czasopisma) |
| „konferencji „Analiza i zastosowania” na cześć Eliasa M. Steina” | Cudzysłów sugeruje oficjalny tytuł, a konferencja nazywała się „Analysis and Applications”. Wersja angielska i Web-Nauka mają to dobrze. | „konferencji „Analysis and Applications” na cześć Eliasa M. Steina” | [math.uni.wroc.pl](https://www.math.uni.wroc.pl/news/konferencja-analysis-and-applications-2017); `Web-Nauka/src/content/konferencje/2017-analysis-and-applications-…md` |
| „otwarty wykład Terence’a Tao przyciągnął ponad pół tysiąca słuchaczy” | To własny szacunek Instytutu („Szacujemy, że przyszło ponad pół tysiąca osób”). | „…przyciągnął według naszych szacunków ponad pół tysiąca słuchaczy” | [math.uni.wroc.pl](https://www.math.uni.wroc.pl/news/tlumy-na-wykladzie-terencea-tao); `wyklad-terencea-tao.md` |
| „a Wrocław szybko stał się jednym z najważniejszych ośrodków matematycznych w Polsce” | Ocena bez źródła w tym brzmieniu; „szybko” jest niepotwierdzone. Duda i Weron piszą o „czołowym ośrodku wydawnictw matematycznych” i przytaczają słowa Marczewskiego o seminarium „największym w Polsce”, obok UW. | „a Wrocław stał się jednym z czołowych ośrodków matematycznych w Polsce” | Duda, Weron, s. 82–83 |
| „Edward Marczewski, od początku dyrektor Instytutu, założyciel „Colloquium Mathematicum”” (tabela patronów w prototypie) | Założycieli było czterech; pomysł był Marczewskiego. | „…współzałożyciel i wieloletni redaktor „Colloquium Mathematicum”” | [IMPAN](https://impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum); [Łoś](https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_friend/) |
| „Annals of Mathematics, najbardziej prestiżowym czasopiśmie matematycznym na świecie” (Warto wiedzieć) | Superlatyw bez źródła. | „jednym z najbardziej prestiżowych czasopism matematycznych na świecie” | `artykul-w-annals-of-mathematics.md` |
| „Lvzhou Chen laureatem Nagrody im. Kamila Duszenki” w sekcji „Ostatnie sukcesy” | Fakty się zgadzają, ale to nagroda Fundacji Matematyków Wrocławskich dla matematyka z Purdue, a nie sukces Instytutu. Sekcja bierze trzy ostatnie wpisy z `rodzaj: 'sukces'`. | Zmienić `rodzaj` tego wpisu albo nazwać sekcję „Nagrody i wyróżnienia”. | [Kamil Duszenko Award](https://kamil.math.uni.wroc.pl/mathematics); [Purdue](https://www.math.purdue.edu/news/2026/purdue-mathematician-receives-kamil-duszenko-award.html); `dzialInstytut.ts` |
| „Benem Krausem i Terence’em Tao” (tekst) a „Benem Krause i Terencem Tao” (Warto wiedzieć) | Różna odmiana tych samych nazwisk na jednej stronie. | Ujednolicić; proponuję wersję z tekstu działu. | `o_instytucie`, `artykul-w-annals-of-mathematics.md` |

**Gdzie to zmienić:** `Web-Ustawienia/src/data/dzialy/instytut.json` (`wstep`, `o_instytucie`, `o_instytucie_fakty` i pola `_en`), `Web-Core/src/lib/patroni.ts` (notka), `Web-Nauka/src/data/publikacje.json`, `Web-Instytut/.../artykul-w-annals-of-mathematics.md`, prototyp (`IN_INST`, `IN_NOTA`, `D.instytut`, tabela patronów), `dok/en/RAPORT-EN.md` (K1: „Rector of the University in 1957–1962”), `dok/estetyka.md` (uwaga o latach z pamięci).

## 3. Do potwierdzenia w Instytucie

| Sprawa | Stan w źródłach | Kogo zapytać |
|---|---|---|
| Czy sala EM jest nazwana od Edwarda Marczewskiego | Sala EM istnieje (`pierwszy-rok.md`: „Sale A, B i EM”). Tylko HS ma w treściach opis „audytorium im. Prof. Hugona Steinhausa”. Dla EM nie znalazłem w sieci żadnego potwierdzenia. **Niepotwierdzone.** Dopisek „sala EM” przy patronie sugeruje patronat sali. | Dyrekcja, administracja budynku |
| Czy „pierwsza” katedra rachunku prawdopodobieństwa | Jedno niepodpisane źródło; nie znalazłem też strony o katedrach M. Fisza w Warszawie, która by to rozstrzygała. **Niepotwierdzone.** | Zakład Teorii Prawdopodobieństwa, prof. A. Weron lub prof. R. Duda (jeśli to możliwe), archiwum UWr |
| Rok przeprowadzki do obecnego gmachu | Patrz sekcja 2. | Archiwum UWr, dyrekcja, biblioteka WMI |
| Starania Marczewskiego o budynek | Jedno źródło (Biler i in. 2015), bez szczegółów. Ustąpił z funkcji dyrektora w 1967 lub 1968 roku, a gmach ukończono później, więc nie należy tego wzmacniać. | Prof. P. Biler, archiwum UWr |
| Czy praca Marczewskiego przy lotnisku i jej opis mają zostać na stronie | Fakt ma źródła; to decyzja redakcyjna. Dobrze, by zaakceptował to ktoś z Instytutu, najlepiej w porozumieniu z rodziną, jeśli jest kontakt. | Dyrektor Instytutu |
| Czy Instytut redaguje Applicationes Mathematicae | Patrz sekcja 2. | Redaktorzy z Instytutu, Ł. Stettner (IMPAN) |
| Gdzie leży oryginał Nowej Księgi Szkockiej | Biler i Buraczewski: „dostępna w Bibliotece WMI UWr” (przypis, s. 2). „Przechowywana” prawdopodobnie się zgadza, ale nie widziałem tego słowa w źródle. | Biblioteka Wydziałowa im. Prof. K. Urbanika |
| „z widokiem na Odrę i Ostrów Tumski” | Widok na Odrę potwierdzony („szeroką panoramę Odry”, [opis budynku](https://fmw.math.uni.wroc.pl/sites/default/files/upload_attach/hist_wroc.pdf)). Ostrów Tumski **niepotwierdzony**; wystarczy wyjrzeć przez okno. | Ktokolwiek w budynku |
| Liczby 81, 17, 9 a stan kadr | Liczą się z danych strony (sekcja 4), ale nie porównywałem ich z danymi kadrowymi. | Sekretariat Instytutu |
| Kategoria A+ za 2022–2025 | Decyzja ministra jest w aktualności z 3.08.2026, ale tabela UWr z 23.07.2026 ma „Matematyka: A” (patrz niżej). | Dziekan WMI, biuro prasowe UWr (sprostowanie tabeli) |

## 4. Potwierdzone

### Patron
- Edward Marczewski, ur. 15.11.1907 w Warszawie, zm. 17.10.1976 we Wrocławiu → [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Marczewski/).
- Urodzony jako Szpilrajn; w czasie wojny ukrywał się pod zmienionym nazwiskiem (Zakrzewski, potem Marczewski) → [Duda, Hartman](https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_obituary/), DBC. Dokładnej daty 1940 nie znalazłem; praca z 1945 r. jest podpisana Szpilrajn-Marczewski (`ciekawostki.json`).
- „Pierwszy dyrektor Instytutu” → Duda, Hartman: cztery katedry utworzyły Instytut „first unofficially and since 1952 officially”, „From the very beginning Marczewski was its director”. **Rozbieżność:** Duda i Weron podają 1951–1968 (s. 90); Duda i Hartman piszą, że ustąpił w 1967, a odszedł z Uniwersytetu w 1969 (Duda i Weron: 1968). Na stronie nie ma tych lat, więc sformułowanie zostaje.
- Współtwórca wrocławskiej matematyki, jeden z czterech pionierów → Duda, Weron, s. 75.
- We wrześniu 1944 wywieziony do obozu pracy we Wrocławiu, praca fizyczna na rzecz twierdzy → Duda, Hartman; Duda, Weron, s. 74 („Po upadku Starówki”). **Rozbieżność:** Biler i in. piszą „aresztowany przez Niemców”.
- Zmuszony do prac przy lotnisku wojskowym na terenie późniejszej uczelni → [Łoś, s. xix](https://www.impan.pl/shop/media/wysiwyg/83-86806-00-1/mar-los.pdf) („ordered him to level the grounds for a military airfield”); Biler i in. 2015 („do budowy pasa startowego w obecnej osi pl. Grunwaldzkiego”). Duda i Hartman oraz Duda i Weron nie wspominają lotniska, ale mu nie przeczą.
- Lotnisko na dzisiejszym pl. Grunwaldzkim w Festung Breslau → [Wikipedia](https://en.wikipedia.org/wiki/Grunwald_Square_(town_square_in_Wroc%C5%82aw)), [Wrocław.pl](https://www.wroclaw.pl/plac-grunwaldzki-wroclaw-wystawa-wroclawskie-metamorfozy).
- Twierdzenie Szpilrajna, 1930 → [„Sur l’extension de l’ordre partiel”, Fund. Math. 16 (1930), 386–389](https://eudml.org/doc/212499).

### Historia
- Tradycja szkół lwowskiej i warszawskiej → Duda, Weron, s. 75 („ducha przedwojennej szkoły warszawskiej i lwowskiej”).
- Wykłady od 15.11.1945 → [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Marczewski/); Duda, Weron; DBC.
- Czterech pionierów: Steinhaus, Marczewski, Knaster, Ślebodziński → Duda, Weron, s. 75 („Na początku tych matematyków było czterech”); Biler, Buraczewski.
- Steinhaus wpisał pierwsze zagadnienie do Nowej Księgi Szkockiej w 1946 → Duda, Weron; Biler i in. 2015. **Rozbieżność:** 1 lipca (Duda, Weron; DBC) a 2 lipca 1946 (Biler i in.); angielska Wikipedia ma błędne „1945”. Tekst podaje tylko rok, więc nic nie trzeba zmieniać.
- Nowa Księga jako kontynuacja lwowskiej → Biler i in. 2015.
- Założyciele Colloquium Mathematicum: Knaster, Marczewski, Steinhaus, Ślebodziński → [IMPAN](https://impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum). **Rozbieżność co do roku:** 1946 (MacTutor), 1947 ([IMPAN: t. 1 z. 1](https://www.impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum/all/1); Duda, Hartman), 1948 (Duda, Weron; Biler i in.; Biler, Buraczewski). Tekst działu nie podaje roku; tekst Nauki ma „od 1947”, co zgadza się z IMPAN.
- Redakcja Colloquium w Instytucie → [IMPAN](https://impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum): Institute of Mathematics, University of Wrocław, Pl. Grunwaldzki 2/4; redaktorzy G. Karch, A. Nowak.
- W 1948 we Wrocławiu wznowiono lwowskie Studia Mathematica → Duda, Weron, s. 82; [Wikipedia](https://en.wikipedia.org/wiki/Studia_Mathematica) (t. 10, 1948).
- Wrocławska szkoła matematyczna → Duda, Weron, s. 75–76.
- Taksonomia wrocławska z seminarium zastosowań → Duda, Weron, s. 82, 87.
- Autorzy i rok taksonomii → [Colloq. Math. 2 (1951), 282–285](https://eudml.org/doc/209969); „Taksonomia wrocławska”, Przegląd Antropologiczny 17 (1951), 193–211.
- Jedno z wczesnych, niezależnych rozwiązań MST → [Graham, Hell](https://math.ucdavis.edu/~saito/data/acha.read.w12/graham-hell-mst.pdf) („Another independent discovery”; praca zgłoszona w 1950, po Borůvce 1926, Jarníku 1930, Choquecie 1938).
- Aksjomat determinacji, Mycielski i Steinhaus, 1962 → Bull. Acad. Polon. Sci. 10 (1962), 1–3; [Wikipedia](https://en.wikipedia.org/wiki/Axiom_of_determinacy); Duda, Weron, s. 86.
- PMS założone w 1980 → Duda, Weron, s. 82; [Biler, Buraczewski](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/07/historiamat.pdf).
- Rektorzy Marczewski, Urbanik, Duda: lata jak w sekcji 2 → Biler, Buraczewski; lista rektorów.
- Żywa gęś: nagroda Mazura za problem 153 z 6.11.1936 → [Wikipedia](https://en.wikipedia.org/wiki/Scottish_Book), [Per Enflo](https://www.wikiwand.com/en/articles/Per_Enflo).
- Enflo odebrał gęś w 1972 → [MacTutor: Mazur](https://mathshistory.st-andrews.ac.uk/Biographies/Mazur/) (rozwiązanie 1972, gęś w Warszawie przy okazji wykładu; bez roku wręczenia); Wikipedia: 1972, transmisja w całej Polsce. Rok wręczenia ma więc słabsze oparcie niż rok rozwiązania.

### Instytut dziś
- Osiem zakładów, nazwy zgodne → `Web-Instytut/src/content/zaklady/` (8 zakładów + Pracownia).
- Projekty NCN → `Web-Nauka/src/content/granty/`.
- Krause, Mirek, Tao, Annals 195 (2022), 997–1109 → [Annals](https://annals.math.princeton.edu/2022/195-3/p04).
- Mirek: mgr UWr 2007, dr UWr 2011 (promotor E. Damek) → [autoreferat](https://old.wmi.uni.wroc.pl/sites/default/files/upload_attach/Mirek_habilitacja_autoreferat.pdf), [MGP](https://mathgenealogy.org/id.php?id=285005). Na podglądzie jest też wśród nauczycieli akademickich.
- A+ za 2017–2021 → [UWr, 16.02.2023](https://uwr.edu.pl/matematyka-na-uwr-z-ocena-a/) („po uwzględnieniu odwołania”).
- A+ za 2022–2025 → [UWr, 6.08.2026](https://uwr.edu.pl/cztery-dyscypliny-uwr-z-kategoria-a/); [aktualność z 3.08.2026](https://im-uwr.github.io/Web-Podglad/aktualnosci/2026-08-03-kategoria-naukowa-a-plus). **Rozbieżność:** [tabela UWr z 23.07.2026](https://uwr.edu.pl/wyniki-ewaluacji-na-uniwersytecie-wroclawskim-2022-2025/) ma „Matematyka: A”, a jako A+ wymienia tylko trzy inne dyscypliny. Późniejsze źródła mówią o A+, przyczyny różnicy nie znalazłem.
- Pięć specjalności, SIAD I stopnia, ISIM z Instytutem Informatyki → `Web-Studia/src/content/kierunki/` (`matematyka.md`, `siad.md`, `isim.md`).
- Ocena wyróżniająca 2010 i 2018 → `wyrozniajaca-ocena-pka.md` (uchwały 280/2010 i 744/2018).
- Kolegium Doktorskie Matematyki → `szkola-doktorska.md`.
- Studia podyplomowe dla nauczycieli → `Web-Studia/src/content/strony/studia/podyplomowe.md`.
- Pl. Grunwaldzki 2 → `kontakt.md`, [SIP Wrocław](https://geoportal.wroclaw.pl/poi/poi/462). IMPAN i starsze dokumenty mają „2/4”.
- Przy moście Grunwaldzkim → Duda, Weron, s. 76–77 („do nowego gmachu przy moście Grunwaldzkim”).
- Instytut częścią WMI → `wstep`.
- Pracownia: kształcenie nauczycieli i popularyzacja → `Web-Instytut/src/content/zaklady/dydaktyka.md`.
- Wykład Tao 6.09.2017, konferencja 4–8.09.2017 na cześć E. M. Steina → `wyklad-terencea-tao.md`, [math.uni.wroc.pl](https://www.math.uni.wroc.pl/news/konferencja-analysis-and-applications-2017).
- Nagroda Hulanickiego, laureaci Dyszewski i Marcinkowski → [strona nagrody](https://hulanickiaward-eng.math.uni.wroc.pl/news) (12.06.2026), [aktualność](https://im-uwr.github.io/Web-Podglad/aktualnosci/2026-06-16-nagroda-im-andrzeja-hulanickiego) (16.06.2026).
- Lvzhou Chen, 12. edycja, Purdue → [lista laureatów](https://kamil.math.uni.wroc.pl/mathematics/winners) (12 osób, 2015–2026), [Purdue](https://www.math.purdue.edu/news/2026/purdue-mathematician-receives-kamil-duszenko-award.html).

### Liczby

| Liczba | Stan | Czy liczy się sama |
|---|---|---|
| 81 nauczycieli akademickich | Zgodne z listą na [podglądzie](https://im-uwr.github.io/Web-Podglad/pracownicy/): 81 + 17 doktorantów + 8 administracja + 23 emerytowani = 129 | Tak: `pracownicy()` z filtrem `grupa === 'nauczyciel'` (`src/lib/widoki/dzialInstytut.ts`) |
| 17 doktorantów | Zgodne (6 + 4 + 3 + 4 w latach 1–4) | Tak: `grupa === 'doktorant'` |
| 9 zakładów i pracowni | Zgodne: 9 plików w `Web-Instytut/src/content/zaklady/` | Tak: `zaklady().length` |
| „w ośmiu zakładach” (tekst) | Zgodne z repozytorium | **Nie:** wpisane w `o_instytucie`, przy zmianie struktury trzeba poprawić ręcznie |
| 3 czasopisma | 3 pozycje w `Web-Nauka/src/data/publikacje.json`, ale patrz sekcja 2 | **Nie:** wpisane ręcznie |
| 3 rektorów | Błędne, patrz sekcja 2 | **Nie:** wpisane ręcznie |

W prototypie wszystkie liczby są wpisane ręcznie. Dane pracowników nie leżą w `Web-Instytut`, więc liczyłem je z podglądu, przez WebFetch (patrz zastrzeżenie niżej).

### Prototyp a strona
- **Wstęp różni się.** Prototyp (`IN_INST.lead`): „Instytut Matematyczny Uniwersytetu Wrocławskiego: badania, seminaria i studia na wszystkich poziomach, w tradycji wrocławskiej szkoły matematycznej.” Strona (`wstep`): „Instytut Matematyczny jest częścią Wydziału Matematyki i Informatyki Uniwersytetu Wrocławskiego.” + „Prowadzimy badania naukowe i seminaria oraz studia I, II i III stopnia i studia podyplomowe.” + „Dyscyplina matematyka na Uniwersytecie Wrocławskim otrzymała najwyższą kategorię naukową A+.”
- **Akapity „O Instytucie” (6) i fakty „W skrócie” (4):** bez różnic względem `IN_INST`.
- **Notka, dopisek „sala EM”, sukcesy, liczby:** bez różnic.
- **`D.instytut.tekst` i `D.instytut.skrot`** (skrócony tekst, „1945 / A+ / 3 czasopisma”) to starsza wersja: w widoku działu nadpisują je `IN_INST`, na podglądzie ich nie ma.
- **Web-Instytut:** teksty działu tu nie ma; leży w `Web-Ustawienia/src/data/dzialy/instytut.json`. Polecenie `git ls-files | grep -i dzial` w Web-Instytut nic nie zwraca. Różnice względem „Warto wiedzieć” są w tabelach wyżej (PKA, tytuł konferencji, odmiana nazwisk).

### Zastrzeżenia do metody
- WebFetch zwraca odpowiedź małego modelu z krótkimi cytatami, a nie surowy tekst. Porównanie prototypu ze stroną i cytaty z PDF-ów warto traktować jako bardzo wiarygodne, ale nie jako porównanie bajt po bajcie. Dotyczy to też policzenia osób na liście.
- Nie udało się otworzyć (nie obchodziłem tego): [polska-org: Instytut Matematyczny](https://polska-org.pl/511618,Wroclaw,Instytut_Matematyczny.html), [tuwroclaw: plac Grunwaldzki](https://tuwroclaw.com/artykul/przed-wojna-plac-grunwaldzki-n2259394), [strona Nowej Księgi Szkockiej](https://wmi.uni.wroc.pl/New_Scottish_Book), [uwr.edu.pl: wyniki 2017–2021](https://uwr.edu.pl/ewaluacja/wyniki-ewaluacji-2017-2021/), polskie Wikipedie o Urbaniku i Ficie (brak strony pod tym adresem).
- Prof. Duda i prof. Weron są w sekcji 3 wskazani jako autorzy opracowań; nie sprawdzałem, czy kontakt z nimi jest dziś możliwy.
