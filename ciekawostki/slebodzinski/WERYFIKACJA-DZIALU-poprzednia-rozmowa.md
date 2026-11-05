# Weryfikacja tekstów działu Nauka (patron: Władysław Ślebodziński)

Stan na 5 listopada 2026. Sprawdzone pliki: `proto/zalozyciele.src.html` (obiekt `nauka`, `IN_NOTA`, `SALE`, karty w `htmlReszta`), `proto/zasoby/dane-dzialow.json` (`nauka`) i strona działająca `im-uwr.github.io/Web-Core/nauka/`. W `Web-Nauka` nie ma plików działu: `git ls-files | grep -i dzial` nie zwraca nic, także w pozostałych trzech repozytoriach treści. Według `dok/przekazanie.md` (sekcja 6) teksty działów są w `Web-Ustawienia` (`dzialy/*.json`), którego nie ma w kontenerze.

## 1. Werdykt

Teksty o patronie są poprawne: Ślebodziński podał ogólny wzór w 1931 roku, a nazwę „pochodna Liego” nadał van Dantzig w 1932 roku; nazwiska, nagrody, konferencje i opisy zakładów też się potwierdzają. Do poprawy są głównie liczby: „6 doktoratów” jest za mało (stara strona podaje 8 obron w 12 miesięcy, a strona działająca liczy 2 wpisy testowe), a lista „5 realizowanych projektów” ma 2 zakończone projekty i nie ma 2 trwających. Trzeba też wyjaśnić kategorię A+, na której stoi hasło działu: komunikaty UWr z sierpnia 2026 podają A+, ale lista UWr z 23 lipca podaje A (punkt 1 w sekcji 3).

## 2. Do poprawy

### Tabela poprawek

Najpierw błędy rzeczowe, potem nieścisłości, na końcu sformułowania zbyt mocne.

| Fragment dosłownie | Co jest nie tak | Proponowana wersja | Źródło |
|---|---|---|---|
| **Błędy rzeczowe** | | | |
| `['6', 'doktoratów w ostatnim roku']` (prototyp) | Od 5.11.2025 stara strona ma 8 obron: Jachimek (2.03), K. Kowalski (3.03), Staniak (2.06), Korpalski (18.06), Antasik (19.06), Żuchowski (21.09), Tadej (20.10), Mrowińska (27.10.2026). 6 odpowiada liczbie wpisów na pierwszej stronie Wydarzeń (od 2.06), czyli nie całemu rokowi; skąd wzięto 6, nie ustaliłem. Obrona to też nie doktorat: stopień nadaje rada uchwałą. | `['8', 'obron doktorskich w ostatnich 12 miesiącach']` | [Wydarzenia, s. 1](https://math.uni.wroc.pl/wydarzenia), [s. 2](https://math.uni.wroc.pl/wydarzenia?page=1); uchwała rady: `Web-Studia/.../stopien-doktora.md` |
| „7 obron doktorskich w ostatnich 12 miesiącach” (strona) | 2 z 7 to wpisy testowe „Mister Test” (29.10 i 3.11.2026), zapowiedź z 27.11 też. Brakuje Staniaka, K. Kowalskiego i Jachimka. Liczba jest automatyczna, więc zawyżają ją dane testowe. | Usunąć wpisy testowe, dopisać 3 obrony; wynik: 8 | [Obrony na stronie](https://im-uwr.github.io/Web-Core/obrony-doktorskie), [Wydarzenia](https://math.uni.wroc.pl/wydarzenia) |
| `['NCN · 2024–2026', 'Wolne i iteratywne operatory na ciałach', 'mgr J. Gogolok', '2023/49/N/ST1/02512']` pod `Wybrane spośród 5 realizowanych projektów.` | Projekt skończył się 28.10.2026, a kierownik ma już doktorat. | Karta zastępcza: `['NCN · 2025–2028', 'Asymptotyczne własności funkcjonałów pobytu wielowymiarowych procesów gaussowskich w zbiorze', 'prof. dr hab. K. Dębicki', '2024/55/B/ST1/01062']` | [NCN 592769](https://projekty.ncn.gov.pl/?projekt_id=592769), [NCN 636716](https://projekty.ncn.gov.pl/?projekt_id=636716) |
| `Realizowane projekty (5)`; lista 5 projektów na stronie `/nauka/granty` | Liczba 5 pasuje przypadkiem, skład listy nie. Skończyły się: Gogolok (28.10.2026) i Bogdan (30.09.2026). Trwają, a brak ich na liście: Dębicki, OPUS 28 (9.07.2025–8.07.2028) i „Graph Algebras”, MSCA Staff Exchanges (1.01.2023–31.12.2026, UWr jest uczestnikiem, koordynuje IM PAN). Na 5.11.2026 trwają: Kowalski (do 23.12.2026), Valiunas (do 18.01.2027), Frączek/Mika (do 23.01.2028), Dębicki, Graph Algebras. | Zostawić 5, dodać 2 wpisy do `Web-Nauka`, a „realizowane” liczyć z dat, nie z samego `rok_do` | [NCN 533132](https://projekty.ncn.gov.pl/?projekt_id=533132), [538244](https://projekty.ncn.gov.pl/?projekt_id=538244), [573806](https://projekty.ncn.gov.pl/?projekt_id=573806), [614942](https://projekty.ncn.gov.pl/?projekt_id=614942), [CORDIS 101086394](https://cordis.europa.eu/project/id/101086394), [stara strona: granty](https://math.uni.wroc.pl/granty) |
| **Nieścisłości** | | | |
| `3 czasopisma` / „naukowe redagowane z udziałem Instytutu, w tym Colloquium Mathematicum (od 1947 roku)”; `/nauka/publikacje`: „Czasopisma redagowane w Instytucie”; `['3', 'czasopisma redagowane w Instytucie']` (Instytut) | Stara strona wymienia 2: Colloquium i PMS. Applicationes Mathematicae ma redakcję w IM PAN w Warszawie, a w jej radzie jest P. Biler. Wersja „z udziałem” jest do obrony, wersja „w Instytucie” nie. `Web-Nauka` sam ma ten punkt w `do_uzupelnienia`. | „2 czasopisma redagowane w Instytucie: Colloquium Mathematicum i Probability and Mathematical Statistics” | [redagowane czasopisma](https://math.uni.wroc.pl/redagowane-czasopisma), [IMPAN: Applicationes](https://impan.pl/en/publishing-house/journals-and-series/applicationes-mathematicae) |
| `['2', 'konferencje w ostatnim roku']`; „2 konferencje w 2026 roku” (strona) | 2 to tyle, ile jest w repozytorium, nie tyle, ile było. Nie ma tam PandA 2026 (Będlewo, 11–15.05.2026), którą współorganizował UWr. „W ostatnim roku” jest też niejednoznaczne. | Etykieta jak na stronie: „konferencje w 2026 roku”; wartość 3, jeśli Instytut potwierdzi PandA | [PandA 2026](https://panda2026.pwr.edu.pl), `Web-Nauka/src/content/konferencje/` |
| `'Konferencje': 'organizowane przez Instytut'` | Na liście są też spotkania bez wskazanej roli Instytutu (Wiedeń i Warszawa 2025), a kongres chilijski organizują według CMM towarzystwa PTM i SoMaChi. Współorganizację Instytutu potwierdziłem dla DRS II i SPA 2025. | `'organizowane i współorganizowane przez pracowników Instytutu'` | [DRS 2026](https://sites.google.com/impan.pl/drs2026/home-page?authuser=0), [CMM](https://www.cmm.uchile.cl/?p=65485) |
| `2000+` / „publikacji naukowych pracowników Instytutu od 2003 roku” | Liczba jest prawdziwa (zob. „Liczby” niżej), ale wykazy mają też pojedyncze teksty popularne, np. „Magazyn Miłośników Matematyki” (2005). | „publikacji pracowników Instytutu od 2003 roku” | `Web-Nauka/src/data/publikacje/2005.json` |
| `90+` / „projektów badawczych od 2005 roku, głównie grantów Narodowego Centrum Nauki” | 90+ jest dolnym oszacowaniem, „głównie NCN” też się trzyma, ale dane są dziurawe: duplikat, 10 wewnętrznych grantów z 2010 r., 19 grantów „N 201” sprzed NCN, ok. 25 projektów NCN brak (szczegóły niżej). | Zostawić, po uzupełnieniu danych zmienić na rzeczywistą liczbę; dopisać „i wcześniejszych grantów ministerialnych”, jeśli Instytut potwierdzi źródło „N 201” | [NCN: UWr, ST1](https://projekty.ncn.gov.pl/index.php?jednostka=Uniwersytet+Wroc%C5%82awski&panel=16), [s. 2](https://projekty.ncn.gov.pl/?jednostka=Uniwersytet%20Wroc%C5%82awski&panel=16&strona=2) |
| „a Instytut uczestniczył też w programach europejskich, m.in. w sieci Marie Curie MODNET poświęconej teorii modeli” | Czas przeszły: projekt „Graph Algebras” trwa do 31.12.2026. MODNET się zgadza (lata 2005–2008). | „a Instytut uczestniczy też w programach europejskich: w latach 2005–2008 w sieci Marie Curie MODNET, a obecnie w wymianie MSCA „Graph Algebras””. | [CORDIS 512234](https://cordis.europa.eu/project/id/512234), [CORDIS 101086394](https://cordis.europa.eu/project/id/101086394) |
| „od PRELUDIUM dla doktorantów” | PRELUDIUM jest dla osób bez stopnia doktora; doktorantów szkół doktorskich dotyczy PRELUDIUM BIS. | „od PRELUDIUM dla osób bez doktoratu” | [NCN: typy konkursów](https://ncn.gov.pl/finansowanie-nauki/konkursy/typy) |
| „Colloquium Mathematicum, wydawanego od 1947 roku” | Źródła się różnią: IMPAN ma „Volume 1 / 1947”, Duda i Weron piszą, że pomysł powstał w 1947, a pierwszy zeszyt wyszedł w 1948, MacTutor podaje założenie w 1950 (bez uzasadnienia, odstaje od pozostałych). | „założonego w 1947 roku” (bezpieczniej) albo zostawić, bo IMPAN liczy tom 1 od 1947 | [IMPAN, t. 1](https://www.impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum/all/1/1/93544/comptes-rendus-societe-polonaise-de-mathematique-section-de-wroclaw-1945-1947), [Duda, Weron 2006](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf), [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/) |
| `znakFakt: 'Pole wektorów przenoszone wzdłuż przepływu innego pola.'` | To opis rysunku, nie pochodnej Liego: pochodna to tempo zmiany przy takim przenoszeniu, L(X)A = d/dt φ_t^*A w t = 0. Interpretacja przez przeciąganie pochodzi od van Dantziga, nie od Ślebodzińskiego. | „Tempo zmiany pola wektorów wzdłuż przepływu innego pola.” | [Trautman 2008](https://users.fuw.edu.pl/~amt/4Krupka.pdf) |
| „Zakład Analizy Funkcjonalnej kontynuuje szkołę analizy harmonicznej stworzoną przez Andrzeja Hulanickiego” | Źródła się różnią. Strona nagrody Hulanickiego nazywa go założycielem szkoły. Duda i Weron nie wskazują twórcy: najważniejsze wyniki przypisują Hartmanowi i Ryll-Nardzewskiemu, a Hulanickiego wymieniają wśród dalszych badaczy. Nie jest to błąd, ale „stworzoną” jest za mocne. | „kontynuuje wrocławską szkołę analizy harmonicznej, którą rozwinął Andrzej Hulanicki” | [Nagroda Hulanickiego](https://hulanickiaward-eng.math.uni.wroc.pl/), [Duda, Weron 2006](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf) |
| **Sformułowania zbyt mocne** | | | |
| „Mocną wrocławską tradycję ma analiza: analiza harmoniczna, wielomiany ortogonalne i nieprzemienna probabilistyka.” | Długą tradycję dokumentują źródła tylko dla analizy harmonicznej. Wielomianów ortogonalnych Duda i Weron nie wymieniają wcale, a probabilistykę kwantową tylko przy Bożejce i Lenczewskim. Dla tych dwóch „tradycja” jest niepotwierdzona, choć badania są pewne. | „Mocną wrocławską tradycję ma analiza harmoniczna. W Instytucie rozwijane są też wielomiany ortogonalne i nieprzemienna probabilistyka.” | [Duda, Weron 2006](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf), [NCN: Szwarc, Bożejko](https://projekty.ncn.gov.pl/index.php?jednostka=Uniwersytet+Wroc%C5%82awski&panel=16) |
| „Trzy zakłady pracują na styku logiki, algebry, topologii i geometrii.” | Każdy zakład ma osobny profil: teoria modeli i algebra; teoria mnogości i topologia (z teorią miary i przestrzeniami Banacha); geometryczna teoria grup. Styki są (np. grant „Związki teorii modeli z topologią i algebrą”), ale „na styku” opisuje je jako jeden obszar. Brak też teorii mnogości. | „Trzy zakłady zajmują się logiką, algebrą, teorią mnogości, topologią i geometrią.” | [stara strona: struktura](https://math.uni.wroc.pl/struktura), [NCN s. 2](https://projekty.ncn.gov.pl/?jednostka=Uniwersytet%20Wroc%C5%82awski&panel=16&strona=2), `Web-Instytut/src/content/zaklady/` |
| „Badania finansują przede wszystkim granty Narodowego Centrum Nauki” | Dane mówią o liczbie projektów, nie o budżecie. Subwencji uczelni nie sprawdzałem, więc całość jest niepotwierdzona. | „Projekty badawcze finansuje przede wszystkim Narodowe Centrum Nauki” | `Web-Nauka/src/content/granty/` |
| `fakt: 'Wprowadził pochodną Liego.'` (poprawka opcjonalna) | Nazwa i przypisanie są poprawne (sekcja 4), ale szczególne przypadki znali wcześniej Lie, Hilbert i Cartan. | Bez zmian albo: „W 1931 roku podał ogólny wzór na pochodną Liego.” | [Trautman 2008](https://users.fuw.edu.pl/~amt/4Krupka.pdf) |

### Liczby: porównanie i to, czy liczą się same

Publiczne komunikaty ewaluacji podają kategorie. Nie znalazłem w nich liczb publikacji ani projektów dyscypliny, więc z danymi ewaluacji da się porównać tylko A+.

| Liczba | Prototyp | Strona 5.11.2026 | Dane | Czy liczy się samo |
|---|---|---|---|---|
| A+ | wpis ręczny | tekst: „ponownie otrzymała najwyższą kategorię A+” | sekcja 3, punkt 1 | nie |
| 2000+ publikacji od 2003 | wpis ręczny | wpis ręczny; `/nauka/publikacje` podaje 2165 | 2165 wpisów za lata 2003–2025; 37 powtórzeń tytułów (rocznika 2008 i lat 2012–2014 tak nie sprawdziłem, bo nie mają osobnego pola tytułu); liczba się trzyma | „2000+” nie; 2165 tak (`.pages.yml`) |
| 90+ projektów od 2005 | wpis ręczny | wpis ręczny; `/nauka/granty` podaje 94 | 94 pliki, w tym 2 bez lat: duplikat `2018-31-b-st1-00204.md` i `merg-ct-2006-046543.md`; 93 różne; 73 `ncn` (54 z numerem NCN, 19 „N 201” z lat 2006–2010, których nie ma w wyszukiwarce NCN), 11 `ue`, 10 `wewnetrzny`. W bazie NCN (UWr, ST1: 78 projektów) ok. 25 pozycji nie ma w repozytorium, np. OPUS 28 Dębickiego | „90+” nie; 94 tak |
| 5 realizowanych | wpis ręczny | 5 | zob. tabela wyżej; liczba zgodna z `rok_do` ≥ 2026 | tak (wniosek), ale logika jest błędna |
| 2 konferencje | wpis ręczny | 2 w 2026 roku | 2 pliki z 2026 w `Web-Nauka` | tak (wniosek) |
| 6 doktoratów / 7 obron | wpis ręczny (6) | 7 | stara strona: 8; repozytorium: 5 prawdziwych i 2 testowe | tak (wniosek) |
| 3 czasopisma | wpis ręczny | wpis ręczny | stara strona: 2; `publikacje.json`: 3 | nie |
| 9 seminariów | brak | 9 | stara strona wymienia 11, ale z terminami z lat 2019–2023 | tak (wniosek) |

- **Prototyp** ma wszystkie liczby wpisane na stałe.
- **Strona:** „tak (wniosek)” wynika z zachowania liczb: zgadzają się co do sztuki z plikami, a „Mister Test” je podbija, plus decyzja w `dok/przekazanie.md`, w. 190. Kodu Web-Core nie widziałem: w kontenerze jest gałąź bez `src/`, a GitHub odmówił strony.
- **Kolejna pułapka:** `rok_do` jest przestarzałe. Repozytorium ma 2020/39/B/ST1/00209 w latach 2021–2024, a NCN do 1.07.2026; 2020/39/D/ST1/00258 w latach 2021–2024, a NCN do 31.07.2025; MODNET do 2009, a CORDIS do 31.12.2008. Od 1.01.2027 reguła `rok_do` ≥ bieżący rok da 1 projekt (Frączek), choć trwać będzie też Dębicki, a do 18.01 Valiunas.

### Różnice między stroną a prototypem

- **Hasło i lead:** prototyp ma „Poznaj nasze badania na A+”, a strona pod tytułem „Nauka” ma lead „Instytut Matematyczny prowadzi badania w ośmiu zakładach naukowych…” i zdanie „dyscyplina matematyka na Uniwersytecie Wrocławskim ponownie otrzymała najwyższą kategorię A+”. `lead` z `dane-dzialow.json` jest inny: „Badania w ośmiu zakładach naukowych, od algebry i logiki po prawdopodobieństwo i statystykę. Matematyka na Uniwersytecie Wrocławskim ma kategorię A+.”
- **Patron:** na stronie nie ma notki o patronie, sali WS ani nazwiska Ślebodzińskiego.
- **Liczby w banerze:** prototyp ma 5 / 2 / 6 („realizowanych projektów”, „konferencje w ostatnim roku”, „doktoratów w ostatnim roku”), strona 5 / 9 / 2 / 7 („realizowanych projektów badawczych”, „aktywnych seminariów”, „konferencje w 2026 roku”, „obron doktorskich w ostatnich 12 miesiącach”).
- **W skrócie:** obiekt `nauka` w prototypie ma 3 pozycje (A+, 2000+, 90+), a strona i `dane-dzialow.json` 4 (dodatkowo „3 czasopisma”).
- **Długi tekst:** 13 sprawdzonych fraz z `dane-dzialow.json` jest na stronie dosłownie. WebFetch nie przepisuje całych akapitów, więc pełnej zgodności nie potwierdzam. Z prototypu („Trzy zakłady…”, „Mocną…”) strona ma wersję długą, a nie skróconą.
- **Gogolok:** prototyp „mgr J. Gogolok”, strona „dr Jakub Gogolok”.

Można też dopisać do działu nowsze sukcesy: nagroda im. Kopernika dla Mirka (2025), Frontiers of Science Award dla Mirka i Wróbla (2026) i praca Mirka w Annals, o której pisze WMI ([sukcesy WMI](https://wmi.uwr.edu.pl/sukcesy-naukowe/)).

## 3. Do potwierdzenia w Instytucie

1. **Kategoria A+ za lata 2022–2025.** Za A+: [IM UWr, 3.08.2026](https://math.uni.wroc.pl/news/otrzymalismy-kategorie-naukowa) i [UWr, 6.08.2026](https://uwr.edu.pl/cztery-dyscypliny-uwr-z-kategoria-a/) („utrzymała”, po doręczeniu decyzji). Przeciw: [UWr, 23.07.2026](https://uwr.edu.pl/wyniki-ewaluacji-na-uniwersytecie-wroclawskim-2022-2025/) podaje „Matematyka A” przy trzech dyscyplinach A+, a [IM PAN](https://www.impan.pl/pl/instytut/kategoria-a) pisze, że A+ w matematyce ma „tylko trzy jednostki”: IM PAN, UJ i UW. Wpis z 6.08 tej różnicy nie wyjaśnia. W [wykazie ministra z 22.07](https://www.gov.pl/attachment/2b439eb2-c39e-4412-8f16-87d1257954bf) wiersza UWr nie odczytałem, bo WebFetch urywa plik na Lp 1008. Od decyzji przysługiwał wniosek o ponowne rozpatrzenie w 30 dni. **Kogo pytać:** dziekan WMI prof. Dariusz Buraczewski lub prorektor ds. badań prof. Artur Błażejewski o kopię decyzji. Niepotwierdzone, a nie błędne, bo najnowsze komunikaty podają A+.
2. **Sala WS nosi imię Ślebodzińskiego.** Sala WS istnieje (stara strona, plan zajęć), ale rozwinięcia skrótu nie znalazłem w żadnym źródle; jedyne oparcie to ustalenie w `dok/estetyka.md` (2.11). **Kogo pytać:** dyrektor prof. Grzegorz Karch lub sekretariat Instytutu.
3. **Drugi projekt Valiunasa.** Strona Sukcesy (1.03.2026) podaje, że jego projekt jest najwyżej oceniony w SONATA BIS 15, ale [wyszukiwarka NCN](https://projekty.ncn.gov.pl/?kierownik=Valiunas) pokazuje tylko SONATA 18. Jeśli projekt trwa, realizowanych jest 6. **Kogo pytać:** dr Motiejus Valiunas.
4. **Frączek czy Mika.** NCN podaje jako kierownika 2024/53/N/ST1/02294 Tamarę Mikę, a Sukcesy i prototyp T. Frączek. Prawdopodobna zmiana nazwiska, niepotwierdzona. **Kogo pytać:** kierowniczka projektu lub sekretariat.
5. **Liczba obron i doktoratów.** Czy 8 obron ze starej strony to pełna lista i ile stopni rada już nadała. **Kogo pytać:** przewodniczący Rady Dyscypliny Matematyka lub obsługa rady (pok. 303).
6. **Pełna lista trwających projektów, także przedłużonych.** Daty NCN wyprzedzają bazę uczelni z IX 2025 (np. Kowalski: 23.06 i 23.12.2026). **Kogo pytać:** Biuro Projektów UWr, dla „Graph Algebras” dr Mariusz Tobolski.
7. **Konferencje.** Kto z Instytutu współorganizował PandA 2026, jaka jest rola Instytutu w kongresie chilijskim i czy polska nazwa „Chilijsko-polski Kongres Matematyczny” jest oficjalna (CMM pisze „Chilean-Polish Mathematical Meeting”). Dla Hejnic potwierdziłem współorganizację UWr tylko w edycji 2017. **Kogo pytać:** kierownicy zakładów: prof. Krzysztof Dębicki (PandA), prof. Grzegorz Plebanek (Hejnice).
8. **Applicationes Mathematicae.** Czy Instytut chce je liczyć jako swoje czasopismo. **Kogo pytać:** prof. Piotr Biler (członek rady czasopisma).
9. **Pełne uzasadnienie opinii ekspertów.** Mamy tylko omówienie UWr, bez tekstu decyzji. **Kogo pytać:** dziekan WMI.
10. **Opisy zakładów.** Potwierdzone pośrednio (`Web-Instytut`, tytuły grantów, seminaria). Dobrze, żeby przeczytali je kierownicy: Newelski, Damek, Szwarc, Świątkowski, Biler, Plebanek, Dębicki, Bogdan i Mikołajczyk.

**Strony, których nie udało się otworzyć (nie obchodziłem tego inną drogą):**

- `github.com/IM-UWr/Web-Aktualnosci/...`: odmowa `robots_disallowed`; pliki Web-Core i Web-Ustawienia są niedostępne z tego samego powodu i nie są sklonowane.
- `somachi-ptm.pwr.edu.pl`: odmowa `robots_disallowed`.
- `link.springer.com/article/10.1007/s10714-010-1056-7` (nota Trautmana z 2010): zablokowane przez narzędzie.
- `imstat.org`: ekran weryfikacji Anubis.
- `epubs.siam.org` (tom ICM) i `icm2026.org`: błąd lub strona niedostępna.
- `math.uni.wroc.pl/rada-dyscypliny-naukowej-matematyka`: błąd.
- Praca van Dantziga z 1932: nie czytałem oryginału, cytat mam za Trautmanem.

WebFetch zwraca wyciągi modelu pomocniczego, a nie pełny tekst. Przy cytatach ważnych dla decyzji warto otworzyć źródło ręcznie, zwłaszcza punkt 1.

## 4. Potwierdzone

**Patron**

- Lata 1884–1972 → [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/) (ur. 6.02.1884, Pysznica; zm. 3.01.1972, Wrocław), [Wikipedia](https://en.wikipedia.org/wiki/W%C5%82adys%C5%82aw_%C5%9Alebodzi%C5%84ski), [PWr](https://weny.pwr.edu.pl/fcp/zGBUKOQtTKlQhbx08SlkTUAxQX2o8DAoHNiwFE1xVSX1RFVZpCFghUHcKVigEQUw/38/public/o_wydziale/profil_wydzialu/pionierzy/wladyslaw-slebodzinski.pdf) (same lata).
- „Geometra różniczkowy” → [Duda, Weron 2006](https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf): wykłady od 1946, seminarium od 1948.
- Rok i praca → „Sur les équations canoniques de Hamilton”, Bull. Cl. Sci. Acad. Roy. Belgique (5) 17 (1931), s. 864–870; przekład w GRG 42 (2010), s. 2529–2535 ([Springer](https://link.springer.com/article/10.1007/s10714-010-1057-6)). Rozbieżność: [Trautman 2008](https://users.fuw.edu.pl/~amt/4Krupka.pdf) ma tytuł bez „canoniques”.
- „Wprowadził pochodną Liego” → [Trautman 2008](https://users.fuw.edu.pl/~amt/4Krupka.pdf): jawny wzór dla pola tensorowego dowolnej walencji, reguła Leibniza, przemienność z kontrakcją; priorytet uznali van Dantzig („Der Operator wurde zum ersten Mal von W. Slebodziński eingeführt”) i Schouten (Ricci-Calculus, s. 102); tak samo [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/).
- Co było wcześniej → Lie (funkcje, nawias pól), Hilbert 1915, Cartan ok. 1920–22 (formy zewnętrzne), De Donder 1927; u fizyków Rosenfeld 1940 ([Trautman 2008](https://users.fuw.edu.pl/~amt/4Krupka.pdf)) i Pauli 1921 ([Wikipedia](https://en.wikipedia.org/wiki/Lie_derivative)). Ślebodziński podał przypadek ogólny, ale operatora nie nazwał.
- Skąd nazwa → D. van Dantzig 1932, „Liesche Ableitung”, Proc. Amsterdam 35, przypis na s. 536; tenże dodał obraz przeciągania wzdłuż pola ([Trautman 2008](https://users.fuw.edu.pl/~amt/4Krupka.pdf), [MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/)).
- Rozbieżność → Duda i Weron w ogóle nie wspominają pochodnej Liego; to brak, nie sprzeczność.
- „Dziś jedno z podstawowych narzędzi geometrii” → osobne hasło w [Encyclopedia of Mathematics](https://encyclopediaofmath.org/wiki/Lie_differentiation), wzór Cartana i uogólnienia w [Wikipedii](https://en.wikipedia.org/wiki/Lie_derivative); to ocena, nie fakt mierzalny.
- Sala WS istnieje → [Wydarzenia IM](https://math.uni.wroc.pl/wydarzenia?page=1), `proto/zasoby/plan-zimowy.json` (nazwa od patrona: sekcja 3).

**Kategoria**

- A+ to najwyższa kategoria (skala A+, A, B+, B, C) → [Gazeta Prawna](https://www.gazetaprawna.pl/urzad/oswiata/artykuly/11279388,minister-opublikowal-wyniki-ewaluacji-2026-sprawdz-jak-oceniono-twoja-uczelnie.html).
- Za 2017–2021 A+, po odwołaniu → [UWr, 16.02.2023](https://uwr.edu.pl/en/mathematics-at-uwr-with-an-a-grade/).
- Za 2022–2025 A+ → [UWr, 6.08.2026](https://uwr.edu.pl/cztery-dyscypliny-uwr-z-kategoria-a/), [IM, 3.08.2026](https://math.uni.wroc.pl/news/otrzymalismy-kategorie-naukowa) (rozbieżność: sekcja 3, punkt 1). A+ dotyczy dyscypliny na UWr, nie samego Instytutu, ale hasło „na A+” tego nie przekręca.
- Eksperci podkreślili jakość publikacji oraz szerokość i siłę badań → [UWr, 6.08.2026](https://uwr.edu.pl/cztery-dyscypliny-uwr-z-kategoria-a/) (omówienie; „wyjątkową jakość”).

**Zakłady i seminaria**

- Osiem zakładów i Pracownia Dydaktyki i Popularyzacji Matematyki → [stara strona: struktura](https://math.uni.wroc.pl/struktura).
- Algebra i teoria modeli: grupy definiowalne, ciała z operatorami → [granty NCN](https://projekty.ncn.gov.pl/index.php?jednostka=Uniwersytet+Wroc%C5%82awski&panel=16) (Gismatullin, Kowalski), `Web-Instytut`.
- Teoria mnogości i topologia z teorią miary i przestrzeniami Banacha → granty Plebanka i Borodulin-Nadziei tamże.
- Geometria: grupy, kompleksy niedodatnio zakrzywione → granty Osajdy i Valiunasa tamże; „Nonpositively Curved Complexes” w `Web-Nauka`.
- Analiza funkcjonalna: analiza harmoniczna → seminarium Damek na [stronie seminariów](https://math.uni.wroc.pl/seminaria).
- Analiza matematyczna: wielomiany ortogonalne, dyskretna analiza harmoniczna, nieprzemienna probabilistyka → seminarium Szwarca i Bożejki tamże, grant Szwarca o macierzach Jacobiego. Strona używa słowa „nieprzemienna”, seminarium „niekomutatywna”.
- Równania różniczkowe: chemotaksja, tworzenie się wzorców → [praca Bilera, Karcha, Zienkiewicza](https://digilab.uwr.edu.pl/en/dlibra/publication/863/large-global-in-time-solutions-to-a-nonlocal-model-of-chemotaxis-biler-piotr-karch-grzegorz-zienkiewicz-jacek), `Web-Instytut`.
- Teoria prawdopodobieństwa: procesy stochastyczne, ryzyko → granty Dębickiego w NCN; teoria kolejek tylko za `Web-Instytut`.
- Statystyka: dane wysokowymiarowe, biologia i medycyna → [IMS Fellow Bogdan](https://lusem.lu.se/internal/article/statistics-professor-malgorzata-bogdan-named-ims-fellow-2024), [NCN 533132](https://projekty.ncn.gov.pl/?projekt_id=533132).
- „Każdy zakład prowadzi własne” seminarium → [stara strona](https://math.uni.wroc.pl/seminaria) ma seminaria odpowiadające wszystkim 8 zakładom (terminy z lat 2019–2023).

**Finansowanie, spotkania, czasopisma**

- Projekty NCN to większość: 54 z 93 różnych → `Web-Nauka/src/content/granty/`.
- PRELUDIUM, OPUS i SONATA BIS w Instytucie → [NCN](https://projekty.ncn.gov.pl/index.php?jednostka=Uniwersytet+Wroc%C5%82awski&panel=16) (np. SONATA BIS: Buraczewski, Krupiński).
- MODNET, sieć Marie Curie o teorii modeli, UWr uczestnikiem → [CORDIS 512234](https://cordis.europa.eu/project/id/512234).
- Forum Równań Różniczkowych Cząstkowych, Będlewo → [XIII FPDE 2024](https://sites.google.com/impan.pl/xiiifpde/organizing-committee): w komitecie G. Karch (UWr); w [XII Forum 2021](https://impan.pl/en/activities/banach-center/conferences/21-xiiforumpde/komitet-organizacyjny) nikogo z tego komitetu nie umiem przypisać do UWr, więc współorganizacja dotyczy co najmniej edycji 2024.
- Stochastic Models, Będlewo → [edycja VII, 2023](https://impan.pl/en/activities/banach-center/conferences/23-stochasticmodels7/komitet-organizacyjny): Dębicki, Lorek, Rolski, Szekli.
- Winter School in Abstract Analysis, Hejnice, współorganizator UWr → [Uniwersytet Karola, edycja 2017](https://www.ff.cuni.cz/event/45th-run-winter-school-abstract-analysis/?view=full).
- 44. konferencja SPA, 14–18.07.2025, WMI UWr wspólnie z PWr → [spa.pwr.edu.pl](https://spa.pwr.edu.pl/).
- DRS II, 17–22.05.2026, Będlewo, IM UWr współorganizatorem → [strona konferencji](https://sites.google.com/impan.pl/drs2026/home-page?authuser=0).
- Spotkanie chilijsko-polskie 7–11.09.2026, Wrocław (daty i miejsce) → [CMM](https://www.cmm.uchile.cl/?p=65485).
- Stopnie nadaje rada dyscypliny; nazwa „Rada Dyscypliny Naukowej Matematyka” → `Web-Instytut/src/data/wladze.json`, uchwała Senatu UWr 131/2019 w `Web-Studia`; na starej stronie w menu „Rada Dyscypliny Matematyka”.
- Redakcja Colloquium Mathematicum w Instytucie, pl. Grunwaldzki 2/4; założyciele: Knaster, Marczewski, Steinhaus, Ślebodziński → [IMPAN](https://impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum).
- PMS założone w 1980 z inicjatywy probabilistów (Urbanik, Ryll-Nardzewski) i statystyków (Klonecki), sponsorowane przez WMI UWr i wydział PWr → [strona czasopisma](https://www.math.uni.wroc.pl/~pms/pmsins.php).

**Sukcesy i projekty**

- Krause, Mirek, Tao, Annals 195 (2022), s. 997–1109 → [Annals](https://annals.math.princeton.edu/2022/195-3/p04). Stara strona ma w „Ciekawostkach” rok 2023; poprawny jest 2022.
- ICCM Best Paper Award (edycja 2023, wręczenie w Szanghaju w styczniu 2024) → [UWr, 13.12.2023](https://uwr.edu.pl/en/?p=230622). UWr pisze „Best Paper Award in Mathematics 2023”, strona Sukcesy „ICCM Best Paper Award”; [strona nagród ICCM](https://iccm.tsinghua.edu.cn/_awards/) nie ma tej edycji.
- Mirek na ICM 2026, sekcja analizy, Filadelfia, 23–30.07.2026, wykład wygłoszony → [WMI, 21.07.2025](https://wmi.uwr.edu.pl/2025/07/21/mariusz-mirek-zaproszony-na-miedzynarodowy-kongres-matematyczny/), [UWr, 6.08.2026](https://uwr.edu.pl/cztery-dyscypliny-uwr-z-kategoria-a/) („był prelegentem”), [relacja Y. He](https://yanhe-math.com/icm2026/).
- Januszkiewicz, Medal im. Wacława Sierpińskiego 2026 (UW i PTM, 28.05.2026) → [IM PAN](https://impan.pl/en/institute/news/1865-prof-tadeusz-januszkiewicz-awarded-the-waclaw-sierpinski-medal). Afiliacja podwójna: IM PAN i UWr.
- Dr Maciej Kucharski (UWr), Nagroda im. Kuratowskiego 2026 → [IM PAN](https://impan.pl/en/institute/news/1857-kazimierz-kuratowski-award2026).
- Bogdan, IMS Fellow 2024 → [Lund, 22.05.2024](https://lusem.lu.se/internal/article/statistics-professor-malgorzata-bogdan-named-ims-fellow-2024). Afiliacje: Lund i UWr.
- Karta Kowalskiego: 2021/43/B/ST1/00405, 24.06.2022–23.12.2026, trwa → [NCN](https://projekty.ncn.gov.pl/?projekt_id=538244).
- Karta Valiunasa: 2022/47/D/ST1/00779, 19.06.2023–18.01.2027, trwa → [NCN](https://projekty.ncn.gov.pl/?projekt_id=573806).
- Karta Frączek: 2024/53/N/ST1/02294, 24.01.2025–23.01.2028, trwa → [NCN](https://projekty.ncn.gov.pl/?projekt_id=614942) (nazwisko: sekcja 3).
