# Ślebodziński: raport

## Dopisane 5.11

Było 11 ciekawostek, jest 25 (nowych 14). Pewnych: 22 z 25 (nowych 12 z 14). Pierwsze 11 obiektów JSON sprawdzone skryptem: identyczne jak w `HEAD`. Rysunki obejrzane w rozmiarze 145×174 px.

### Nowe pozycje i podstrony

| id | nazwa, rok | podstrona | pewność |
|---|---|---|---|
| `galois-tarnobrzeg` | Teoria Galois w Tarnobrzegu, 1909–1912 | zapas | pewne |
| `ogrod-botaniczny` | Szkolny ogród botaniczny, 1909–1912 | zapas | pewne |
| `getynga-1913` | Rok w Getyndze, 1913–1914 | Projekty i granty | pewne |
| `toczenie-1923` | Toczenie się powierzchni, 1923 | zapas | pewne (treści pracy nie widzieliśmy) |
| `ptm-1923-1963` | Od oddziału do prezesury PTM, 1923–1963 | Konferencje | pewne |
| `doktorat-1928` | Doktorat w wieku 44 lat, 1928 | Szkoła doktorska | pewne |
| `wnuk-liego` | Naukowy wnuk Sophusa Liego, 1891–1928 | Obrony doktorskie | do sprawdzenia |
| `pole-grawitacji-1926` | Geometria pola grawitacji, 1926 | zapas | pewne |
| `nagroda-doktoraty-hc` | Nagroda i trzy doktoraty honoris causa, 1955–1970 | Sukcesy | pewne |
| `pionier-elektryki` | Pionier dolnośląskiej elektryki, 1946 | zapas | pewne |
| `yano-1957` | Monografia Kentaro Yano, 1957 | Publikacje | do sprawdzenia |
| `cartan-1922` | Cartan był o krok wcześniej, 1922 | zapas | pewne |
| `spinory-kosmann` | Pochodna Liego spinorów, 1963–1972 | zapas | pewne |
| `tom-26-colloquium` | Tom ku jego pamięci, 1972 | Publikacje | pewne |

### Proponowane przypięcia

Żadnej nowej pozycji nie proponuję przypinać: limit 3–4 na patrona zajmują istniejące, mocniejsze związki (pola w JSON nie zmieniałem):
- `pochodna-liego` → Sukcesy: główny wynik patrona.
- `jedenastu-doktorow` → Obrony doktorskie: dosłownie o tym.
- `seminarium-1948` → Seminaria: seminarium, które stworzyło wrocławską geometrię.
- `zjazd-lwow-1927` → Konferencje: referaty na zjeździe.

### Do sprawdzenia i dlaczego

- `wnuk-liego`: promotora Żorawskiego podają Mathematics Genealogy Project, MacTutor i angielska Wikipedia, ale lista w artykule Dudy i Werona (Wiad. Mat. 42, 2006) ma przy Ślebodzińskim „dr 1928 (W. Sierpiński)”. Też biografia Żorawskiego w MacTutor nie nazywa Liego promotorem wprost; robi to MGP. Rozstrzygnęłyby dokumenty doktoratu w UW.
- `yano-1957`: rok wydania książki: 1957 (Wikipedia, Dover), 1955 (MacTutor), „[1956?]” (katalog w Nantes). Zdanie nie podaje roku, rok jest tylko w polu `rok`. Sama książka i jej temat są pewne.

### Świadome ograniczenia

- Nie widzieliśmy treści prac z 1923, 1926 i 1928 ani książki Yano; notki mówią to wprost, a rysunki są podpisane jako ilustracje pojęcia, nie jako wyniki z tych prac.
- `toczenie-1923`: polskiego tytułu tej pracy nie znamy (MacTutor podaje tylko angielski z dopiskiem „Polish”), dlatego zdanie opisuje ją, a nie cytuje.
- `pionier-elektryki`: rok objęcia Katedry Matematyki PWr jest niezgodny (1951: strona PWr o patronie, MacTutor, Duda i Weron; 1952: strona Wydziału Elektrycznego). Dlatego roku nie ma w zdaniu; rozbieżność opisana w notce.
- Z rozmysłem pominąłem dobrze udokumentowane, ale obozowe wątki (nauczanie matematyki współwięźnia, zapowiedź profesury we Wrocławiu, napis na nagrobku); brief każe raczej je pomijać. Pominąłem też aulę i ulicę jego imienia: strona Instytutu nie mówi o auli, a źródłem jest tylko MacTutor.
- Nie dopisałem ciekawostki o pierwszym doktorancie S. Droboście (doktorat o równaniach sprężystości, PWr 1947, MGP), bo jest już na liście w `jedenastu-doktorow`, i o szkole Rotera i Deszcza (Roter jest w `seminarium-1948`).

### Rysunki (wszystkie policzone w `generator.js`)

Pierwiastki siódmego stopnia z jedynki i cykl k ↦ 3k; filotaksja Vogla (13 + 21 parastych); krzywa Hilberta rzędu 4; elipsa tocząca się po prostej i undoloid; okręgi ściśle styczne spirali Eulera (Tait–Kneser); teselacja Fareya w dysku Poincarégo; orbity grupy obrotów hiperbolicznych; orbita Schwarzschilda z równania Bineta; linie krzywizny elipsoidy trójosiowej; prąd trójfazowy; okręgi Apoloniusza; pętla niesiona przepływem; wstęga Möbiusa; pole Killinga na sferze. Wyniki kontroli liczbowych są w `rysunki.html`.

### Uwagi do istniejących pozycji (nic nie zmieniałem)

- `pochodna-liego`: tytuł pracy z 1931 r. w źródłach ma dwie formy: „Sur les équations canoniques de Hamilton” (MacTutor, przekład w GRG) i „Sur les équations de Hamilton” (Trautman, Wikipedia). Notka używa pierwszej, co wygląda na właściwe, ale warto zerknąć do oryginału.

### Źródła nowych pozycji

- MacTutor: https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/ oraz https://mathshistory.st-andrews.ac.uk/Biographies/Zorawski/
- Trautman, „Remarks on the history of the notion of Lie differentiation”: https://users.fuw.edu.pl/~amt/4Krupka.pdf
- Mathematics Genealogy Project: https://mathgenealogy.org/id.php?id=157629, https://mathgenealogy.org/id.php?id=60302
- Duda, Weron, „Wrocławska szkoła matematyczna”: https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf
- Strony PWr: https://sites.google.com/pwr.edu.pl/slebodzinski/ oraz dwa pliki „pionierzy” na weny.pwr.edu.pl (adresy w JSON)
- Spis tomu 26 w IMPAN: https://www.impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum/all/26
- EuDML (praca z 1926): https://eudml.org/doc/215456
- Spinory: https://arxiv.org/pdf/1411.7845, https://en.wikipedia.org/wiki/Lie_derivative
- Yano: https://en.wikipedia.org/wiki/Kentaro_Yano_(mathematician), https://store.doverpublications.com/products/9780486842097, https://nantilus.univ-nantes.fr/vufind/Record/PPN006430244
- Do ilustracji: https://en.wikipedia.org/wiki/Unduloid, https://en.wikipedia.org/wiki/Hilbert_curve, https://en.wikipedia.org/wiki/Golden_angle, https://en.wikipedia.org/wiki/Tait%E2%80%93Kneser_theorem, https://en.wikipedia.org/wiki/Apollonian_circles, https://arxiv.org/pdf/1206.1869, https://geodesic.mathdoc.fr/articles/10.14708/am.v10i0.1918, https://kconrad.math.uconn.edu/blurbs/galoistheory/cyclotomic.pdf, https://algorithmicbotany.org/papers/abop/abop-ch4.pdf, https://homepages.warwick.ac.uk/staff/C.M.Series/HypGeomandCntdFractions-2.pdf
