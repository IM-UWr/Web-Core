# Marczewski: raport

## Dopisane 5.11

Było 12 ciekawostek, jest 25 (nowych 13). Pewnych: 22 z 25 (nowych 10 z 13). Pierwsze 12 obiektów JSON sprawdzone skryptem: identyczne jak w `HEAD`. Rysunki obejrzane w rozmiarze 145×174 px.

**Uwaga techniczna:** `generator.js` wymagał pliku `teksty.js`, którego nie było w repozytorium (nie dało się go uruchomić). Odtworzyłem `teksty.js` z `ciekawostki.json`, wynik dla starych pozycji jest bajt w bajt taki sam, a nowe teksty są dopisane na końcu tego pliku. Rysunki nowych pozycji są w `generator.js`.

### Nowe pozycje i podstrony

| id | nazwa, rok | podstrona | pewność |
|---|---|---|---|
| `hewitt-marczewski-pondiczery` | Twierdzenie z fikcyjnym współautorem, 1947 | zapas | pewne |
| `pierwsze-prace-1930` | Pierwsze prace w wieku 22 lat, 1930 | zapas | do sprawdzenia |
| `miara-i-kategoria` | Miara i kategoria, 1932 | zapas | pewne |
| `kierst-szpilrajn` | Funkcje, których nie da się przedłużyć, 1933 | zapas | pewne |
| `marczewski-sikorski` | Miary na ogromnych przestrzeniach, 1948 | zapas | pewne |
| `suma-plonki` | Suma Płonki, 1967 | Struktura i zakłady | pewne |
| `graffiti-fajtlowicz` | Graffiti: program stawiający hipotezy, lata 80. | Infrastruktura informatyczna | pewne |
| `biblioteka-1945` | Zaczęło się od zbierania książek, 1945 | Biblioteka | pewne |
| `etos-szkoly` | Autorzy w porządku alfabetycznym, po 1945 | Pracownicy | pewne |
| `katedra-numeryczna-1962` | Katedra Metod Numerycznych, 1962 | Infrastruktura informatyczna | pewne |
| `dyrektor-instytutu` | Dyrektor od pierwszego dnia, 1952–1967 | Władze | do sprawdzenia |
| `norwid-archytas` | Platon i Archytas według Norwida, 1967 | zapas | pewne |
| `zachowanie-miary` | O zachowaniu miary we wszystkim, 1953 | zapas | do sprawdzenia |

### Proponowane przypięcia

Pole `przypiecie: true` mają trzy nowe pozycje:
- `biblioteka-1945` → Biblioteka: dosłownie początek matematycznej biblioteki we Wrocławiu. „Biblioteka” w menu to link zewnętrzny; przypięcie ma sens, jeśli strona zachowa własną zakładkę z nagłówkiem (w prototypie jest).
- `dyrektor-instytutu` → Władze: pierwszy dyrektor.
- `katedra-numeryczna-1962` → Infrastruktura informatyczna: początek obliczeń numerycznych w Instytucie.

Z istniejących proponuję jeszcze `uczniowie` → Pracownicy (pola w JSON nie zmieniałem).

### Do sprawdzenia i dlaczego

- `pierwsze-prace-1930`: PDF noty „Sur une hypothèse de M. Borel” jest niedostępny; to, że chodzi o hipotezę o zbiorach mocno miary zero, wnioskuję z tytułu i daty (Borel 1919). Sama nota, rok i wiek są pewne.
- `dyrektor-instytutu`: lata 1952–1967 (nekrolog Dudy i Hartmana) albo 1951–1968 (Duda i Weron 2006). W zdaniu lat nie ma, są w polu `rok`.
- `zachowanie-miary`: polski tytuł żartu to mój przekład z angielskiej wersji wspomnienia J. Łosia („On preserving measure in everything”); oryginał: Wiad. Mat. 22 (1980). Fakt pewny, brzmienie do sprawdzenia.

### Świadome ograniczenia

- Nie widziałem treści prac 1929–1948 poza spisami, tytułami i opisami w źródłach wtórnych. Rysunki przy pozycjach `kierst-szpilrajn`, `marczewski-sikorski` i `miara-i-kategoria` są podpisane jako przykłady pojęcia, nie zawartość tych prac.
- Z rozmysłem pominąłem wątki wojenne i wydarzenia 1968–1969; brief każe je raczej pomijać. Pas startowy pod gmachem Instytutu jest już w tekście strony, więc nie powtarzam go tu.
- Nie dopisałem: prezesury PTM 1957–1959 ani doktoratu h.c. UWr 1973 (sucha lista bez dobrego rysunku); procesu Poissona z 1953 r. (bez wglądu w treść nie umiałbym powiedzieć nic ponad tytuł); złotego pierścienia od Senatu i prośby „mówcie mi Eddie” (Łoś, jedno źródło, można je dodać przy okazji).

### Rysunki (wszystkie policzone w `generator.js`)

Bramki i funkcja schodkowa o wymiernych progach; odcinki przykrywające dla zadanych długości; gruby zbiór Cantora i otoczenia wymiernych; szereg z lukami na trzech okręgach; „jeż”; układ prosty Z₄, Z₂ nad półkratą (przemienność sprawdzona); graf Petersena (przegląd zupełny); stos książek z równowagą na każdym poziomie; sieć sortująca Batchera (sprawdzona dla wszystkich 2⁸ ciągów 0-1); najlepsze przybliżenie x⁵ i błąd T₅/16; pięć kół stycznych; dwa sześciany i średnie proporcjonalne; przekształcenie piekarza (pole liczone na siatce).

### Uwagi do istniejących pozycji i strony (nic nie zmieniałem)

- `wymiar-i-miara`: `podstrona` to „Warto wiedzieć”, a takiej pozycji nie ma w `nawigacja.json`. Trzeba przypisać inną albo zapas.
- `src/lib/patroni.ts` (poza zakresem, na wiedzę): notka „rektor Uniwersytetu w latach 1957–1962” jest sprzeczna z nekrologiem i `rektor-miary-zwarte` (1953–1957); `WERYFIKACJA-DZIALU.md` też to odnotowuje.
- `problem-marczewskiego`: bez uwag; przedmowa do dzieł zebranych potwierdza Dougherty’ego i Foremana (rozkład na sześć części z własnością Baire’a).

### Źródła nowych pozycji

- Nekrolog (Duda, Hartman): https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_obituary/
- Wspomnienie (Łoś): https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_friend/
- MacTutor: https://mathshistory.st-andrews.ac.uk/Biographies/Marczewski/
- Duda, Weron, „Wrocławska szkoła matematyczna”: https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf
- Collected Mathematical Papers (IMPAN): spis https://www.impan.pl/shop/media/wysiwyg/83-86806-00-1/mar-cont.pdf, przedmowa https://www.impan.pl/shop/media/wysiwyg/83-86806-00-1/mar-pref.pdf, esej o Norwidzie https://bcc.impan.pl/shop/media/wysiwyg/83-86806-00-1/mar-edw.pdf
- Prace: https://eudml.org/doc/213121, https://eudml.org/doc/212670, https://eudml.org/doc/209895, https://eudml.org/doc/213988, https://eudml.org/doc/267343, https://eudml.org/doc/268542, https://impan.pl/en/publishing-house/journals-and-series/fundamenta-mathematicae/all/15/0/92814/sur-une-hypothese-de-m-borel
- Opracowania: https://en.wikipedia.org/wiki/Ralph_P._Boas_Jr., https://en.wikipedia.org/wiki/Separable_space, https://arxiv.org/pdf/1701.00356, https://en.wikipedia.org/wiki/Strong_measure_zero_set, https://mortini.perso.math.cnrs.fr/Mainz/Calderon.pdf, https://arxiv.org/pdf/1103.0247, https://arxiv.org/html/2602.06188, https://en.wikipedia.org/wiki/Siemion_Fajtlowicz, https://www.uhd.edu/documents/academics/sciences/history.pdf, https://mathshistory.st-andrews.ac.uk/Biographies/Archytas/
