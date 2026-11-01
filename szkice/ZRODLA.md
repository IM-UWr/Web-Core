# Szkice patronów — źródła i parametry

Opracowanie paczki: 2 listopada 2026.

## Co zawiera eksport

To eksport wcześniej zaakceptowanych rysunków z podglądu projektu IM UWr. Twarze powstały wcześniej w narzędziu imagegen na podstawie fotografii wymienionych poniżej, następnie zostały zamienione na linie środkowe. W tej paczce nie generowano nowych twarzy ani podpisów.

Wszystkie osiem plików twarzy używa identycznego odwzorowania dotychczasowego płótna 1122×1402 na viewBox `0 0 200 240`: skala jednostajna 240/1402 i wyśrodkowanie w poziomie. Zachowano kierunek spojrzenia, układ głowy i szyi. Współrzędne są zaokrąglone do 0,1 jednostki. Drobne nadmiarowe punkty zostały odchudzone poniżej skali pojedynczego piksela przy docelowej wielkości; nie pomijano kresek rysunku. Kontury główne mają ciaśniejszą tolerancję niż mikroszczegóły.

Limity rozmiaru osiągnięto także przez łączenie elementów path w ścieżki złożone. Odrębne kreski pozostają podścieżkami rozpoczynanymi poleceniami M/m: nie dodano widocznych połączeń między nimi. Demo rozdziela te podścieżki w pamięci, aby rysować kolejne kreski. Ścieżki w grupie kontur są uporządkowane do odtwarzania; grupa detale jest przeznaczona do płynnego pojawiania.

Pliki `*-podpis.svg` zawierają wypełniony kształt śladu atramentu, wyznaczony z oryginalnego skanu, oraz osobną grupę prowadzącą. Kształt atramentu zachowuje zmienną grubość pisma. Grupa `prowadzaca` jest domyślnie ukryta atrybutem visibility; demo używa jej kopii jako maski odsłaniającej `obrys`. Pieczęcie, nadruki i papier nie są częścią obrysu autografu. Nieruchomy skan nie zapisuje ruchu ręki: kolejność pisania i oderwania pióra są rekonstrukcją, nie nagraniem historycznego gestu.

Skany PNG w folderze `skany/` są niezmienionymi kopiami najwyższej zachowanej rozdzielczości źródłowych wycinków. Nie podbijano im kontrastu, nie odszumiano ich, nie retuszowano ani nie skalowano. Utrzymano orientację zgodną z dokumentem PDF. Ślebodziński ma w wycinku również fragment stempla i nadruk formularza; Steinhaus — drobny fragment drukowanego słowa „Prezes”. Pozostały w PNG jako część źródła.

## Edward Marczewski

### Twarz

- Referencja: [fotografia Edwarda Marczewskiego w MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Marczewski/Marczewski.jpeg).
- Kontekst: [biografia i galeria, University of St Andrews](https://mathshistory.st-andrews.ac.uk/Biographies/Marczewski/).
- Autor fotografii: niepodany; nie ustalono.
- Licencja i podmiot praw do konkretnej fotografii: nieustalone. MacTutor zaznacza, że nie posiada praw do większości publikowanych zdjęć i nie prowadzi pełnej ewidencji ich pochodzenia: [informacja o prawach](https://mathshistory.st-andrews.ac.uk/Miscellaneous/copyright/), [FAQ o ilustracjach](https://mathshistory.st-andrews.ac.uk/Miscellaneous/faq/).

### Podpis

- Forma autografu: **E. Marczewski**. To powojenny podpis nazwiskiem Marczewski.
- Dokument: *Nowa Księga Szkocka*, tom I, dolny autograf pod wpisem z **7 lipca 1946**, strona 9 PDF. Na tej stronie znajdują się dwa zgodne podpisy.
- [Opis zbioru Biblioteki WMI UWr](https://wmi.uwr.edu.pl/biblioteka-wydzialowa/nowa-ksiega-szkocka/).
- [Oryginalny skan tomu I, strona 9](https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2022/11/ksiega_szkocka_1.pdf#page=9).
- Depozytariusz rękopisu i dostawca skanu: Biblioteka Wydziału Matematyki i Informatyki UWr. Strona nie wskazuje odrębnej licencji reprodukcji tego autografu ani właściciela praw do samego podpisu — nie ustalono.
- `skany/marczewski-podpis.png`: **284×85 px**. Kadr (650,0,934,85) z oryginalnego pasa JPEG 934×178 wydobytego z PDF. Zachowano zakończenie podpisu i margines za końcową literą.

## Władysław Ślebodziński

### Twarz

- Referencja: [Władysław Ślebodziński.jpg, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:W%C5%82adys%C5%82aw_%C5%9Alebodzi%C5%84ski.jpg).
- [Bezpośredni plik fotografii 502×634](https://upload.wikimedia.org/wikipedia/commons/1/17/W%C5%82adys%C5%82aw_%C5%9Alebodzi%C5%84ski.jpg).
- Według opisu pliku: **4 lipca 1938**, pamiątka ze zbiorów rodzinnych, kopia i retusz fotografii nieznanego autora.
- Autor fotografii: **nieznany**. Użytkownik przesyłający plik nie został potraktowany jako fotograf.
- Oznaczenie na stronie Commons: **domena publiczna, PD-Poland**. To informacja z opisu konkretnego pliku, a nie licencja całej paczki.

### Podpis

- Forma autografu: **Władysław Ślebodziński**.
- Dokument: legitymacja tymczasowa Polskiego Związku Byłych Więźniów Politycznych Hitlerowskich Więzień i Obozów Koncentracyjnych, **1948**. Podpis pod fotografią znajduje się w polu „podpis posiadacza”.
- Reprodukcja: Hanna Langner-Matuszczyk, *Władysław Ślebodziński – matematyk, więzień KL Auschwitz nr 79053*, w: *Śląska Republika Uczonych*, tom 7, red. Marek Hałub, Anna Mańko-Matysiak, Neisse Verlag / Oficyna Wydawnicza ATUT, Dresden–Wrocław **2016**. Strona drukowana **421**, strona PDF **24**, ilustracja **3**.
- [Instytucjonalna strona PWr z publikacją](https://sites.google.com/pwr.edu.pl/slebodzinski/strona-g%C5%82%C3%B3wna).
- [Publiczny skan artykułu](https://drive.google.com/file/d/1DTuDXINxQw26L0rvdBOiXqORNw9oTbxr/view).
- Autorka artykułu: Hanna Langner-Matuszczyk; wydawcy tomu: Neisse Verlag i ATUT. Odrębnego właściciela praw do reprodukcji legitymacji i samego autografu ani otwartej licencji tej ilustracji nie wskazano w wykorzystanym źródle — nie ustalono.
- `skany/slebodzinski-podpis.png`: **570×150 px**, kadr (235,1770,805,1920) z najwyższej osadzonej grafiki strony 1754×2572. Zachowano również obecny w kadrze fragment stempla, ramki i druku.

## Bronisław Knaster

### Twarz

- Referencja: [Knaster_4.jpeg, dokładnie czwarta fotografia w MacTutor](https://mathshistory.st-andrews.ac.uk/Biographies/Knaster/Knaster_4.jpeg).
- [Galeria MacTutor, University of St Andrews](https://mathshistory.st-andrews.ac.uk/Biographies/Knaster/pictdisplay/).
- Autor fotografii: niepodany; nie ustalono.
- Licencja i podmiot praw do konkretnej fotografii: nieustalone. [Informacja MacTutor o prawach do ilustracji](https://mathshistory.st-andrews.ac.uk/Miscellaneous/copyright/) nie przypisuje praw do tego zdjęcia i nie podaje jego osobnej otwartej licencji.

### Podpis

- Forma autografu: **Bronisław Knaster**.
- Dokument: zaświadczenie egzaminacyjne dla Mieczysława Warmusa, Wrocław, **6 sierpnia 1946**; potwierdza egzamin z algebry wyższej zdany dzień wcześniej.
- Reprodukcja: Jadwiga Dutkiewicz, *Mieczysław Warmus. Życie i praca naukowa*, Sydney **2003**, strona **17**, ilustracja **5**. Dokumenty pochodzą z oryginalnego archiwum Mieczysława Warmusa, co opisuje nota i przedmowa na stronach 4–5.
- [Katalog Biblioteki Cyfrowej Politechniki Warszawskiej](https://bcpw.bg.pw.edu.pl/dlibra/publication/1567/edition/1591?language=pl).
- [Skan publikacji, strona 17](https://bcpw.bg.pw.edu.pl/Content/1591/PDF/biografia_Warmus.pdf#page=17).
- Katalog BCPW przypisuje prawa do publikacji **Jadwidze Dutkiewicz**, ©2003. Osobnego właściciela praw do dokumentu i autografu oraz odrębnej otwartej licencji reprodukcji nie ustalono.
- `skany/knaster-podpis.png`: **305×70 px**. Kadr (475,151,780,221) z grafiki osadzonej 838×257 po odtworzeniu prawidłowej orientacji osi Y zgodnie z PDF. Bez skalowania i retuszu.

## Hugo Steinhaus

### Twarz

- Referencja: [Hugo Steinhaus.jpg, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Hugo_Steinhaus.jpg).
- [Bezpośredni plik fotografii 1659×2481](https://upload.wikimedia.org/wikipedia/commons/3/36/Hugo_Steinhaus.jpg).
- Commons podaje rok **1968** i źródło: *Księga Pamiątkowa. Stulecie Gimnazjum i Liceum im. Króla Stanisława Leszczyńskiego w Jaśle 1868–1968*.
- Autor fotografii: **nieznany**. Widoczne dane techniczne współczesnej digitalizacji nie zostały utożsamione z autorstwem historycznego zdjęcia.
- Oznaczenie konkretnego pliku na Commons: **domena publiczna, PD-Poland**.

### Podpis

- Forma autografu: **H. Steinhaus**.
- Dokument: pismo Wrocławskiego Towarzystwa Naukowego zawiadamiające Mieczysława Warmusa o wyborze na członka nadzwyczajnego, **23 grudnia 1957**. Wybrano kompletny autograf po prawej, nad drukowanym nazwiskiem prezesa.
- Reprodukcja: J. Dutkiewicz, *Mieczysław Warmus. Życie i praca naukowa*, **2003**, strona **34**, ilustracja **18**.
- [Katalog BCPW](https://bcpw.bg.pw.edu.pl/dlibra/publication/1567/edition/1591?language=pl).
- [Skan publikacji, strona 34](https://bcpw.bg.pw.edu.pl/Content/1591/PDF/biografia_Warmus.pdf#page=34).
- Prawa do publikacji według katalogu: **Jadwiga Dutkiewicz**, ©2003. Osobnego właściciela praw do autografu, reprodukcji pisma WTN i otwartej licencji samego skanu nie ustalono.
- `skany/steinhaus-podpis.png`: **155×59 px**, natywny kadr (545,770,700,829) z osadzonego JPEG 745×1070 po odtworzeniu orientacji PDF. To najwyższa zachowana rozdzielczość tego wycinka; nie powiększano go sztucznie. Przy dolnej krawędzi pozostał drobny fragment drukowanego słowa „Prezes”.

## Demo i użycie

`demo.html` jest samodzielny: zawiera kod SVG i nie pobiera skryptów, fontów, zdjęć ani innych plików z sieci. Można otworzyć go po rozpakowaniu bez serwera. SVG w osobnych plikach nie zawierają stylów, skryptów, masek ani rastrów; maski istnieją wyłącznie w kodzie demo.

Demo rysuje kolejne kreski konturu przez 1200 ms, ujawnia detale od 600 do 1200 ms, a autograf zapisuje od 900 do 1200 ms. Wszystkie cztery postaci animują się równocześnie. Rekomendowane miejsce podpisu: centralnie pod szyją, z odstępem 10 px. Sygnety są pokazane przy 48, 72 i 90 px. Grubości kreski ustawione są w CSS demo; w plikach SVG nie ma atrybutu stroke-width.

## Liczby ścieżek i rozmiary

Liczba oznacza elementy path w pliku. Ścieżki złożone mogą zawierać wiele odrębnych podścieżek M/m; ich liczby podano osobno dla twarzy. W podpisie pierwsza ścieżka jest wypełnionym obrysem, pozostałe należą do grupy prowadzącej.

| Plik | path | Podścieżki twarzy / grupy podpisu | Bajty |
| --- | ---: | --- | ---: |
| marczewski-pelny.svg | 3 | 335 | 14941 |
| marczewski-sygnet.svg | 6 | 60 | 4349 |
| marczewski-podpis.svg | 15 | 1 obrys + 14 prowadzących | 5183 |
| slebodzinski-pelny.svg | 3 | 434 | 14557 |
| slebodzinski-sygnet.svg | 8 | 78 | 4960 |
| slebodzinski-podpis.svg | 62 | 1 obrys + 61 prowadzących | 18132 |
| knaster-pelny.svg | 3 | 446 | 14688 |
| knaster-sygnet.svg | 8 | 73 | 4794 |
| knaster-podpis.svg | 30 | 1 obrys + 29 prowadzących | 7267 |
| steinhaus-pelny.svg | 3 | 528 | 14776 |
| steinhaus-sygnet.svg | 4 | 40 | 4188 |
| steinhaus-podpis.svg | 27 | 1 obrys + 26 prowadzących | 5973 |

## Integralność skanów

Weryfikacja porównuje sumy SHA-256 kopii PNG w paczce z zachowanymi oryginalnymi wycinkami. Poniższe sumy dotyczą plików znajdujących się w folderze skany.

- `marczewski-podpis.png`: `27f4467821ddccdfe0b34ce13182f52ff297afa1129023d5019b3fa4677c99fb`
- `slebodzinski-podpis.png`: `9efd8d0015d59027fbc2b6c4b6ea898ee7f1887844cad6fc6d03d9683484d410`
- `knaster-podpis.png`: `9c7b2cf834a6c798f3ed7014b57857eb1b02a68ffd9e69a7b712995f8f8290e2`
- `steinhaus-podpis.png`: `b6366d5e1e738754989ea31dd44f1391565cb50c0b74c21a08d8da3fc9da5e20`

Informacje o prawach powyżej odzwierciedlają oznaczenia w źródłach i wskazane braki w dokumentacji; paczka nie nadaje cudzym fotografiom, dokumentom ani reprodukcjom nowej zbiorczej licencji.

## Weryfikacja końcowa

- Wszystkie 12 SVG oraz cztery PNG otwarto w przeglądarce przez lokalny serwer HTTP. SVG zostały rozpoznane jako dokumenty SVG, bez błędów parsera i niedozwolonych elementów.
- Kontrola XML sprawdza wymagane grupy, atrybuty każdego path, precyzję współrzędnych, brak stroke-width, rastrów, stylów, skryptów, masek, filtrów, gradientów i elementów tekstowych w plikach SVG.
- Wszystkie pliki twarzy mają viewBox `0 0 200 240`; pełne mają mniej niż 15000 bajtów, sygnety mniej niż 5000 bajtów.
- Demo sprawdzono w przeglądarce: przy 500 ms detale i podpisy są niewidoczne, przy 900 ms detale mają połowę krycia, przy 1050 ms trwa równocześnie rysowanie konturu i podpisu, przy 1200 ms wszystkie komponenty są gotowe.
- Kopie skanów przeszły porównanie SHA-256 z oryginalnymi wycinkami.
- Samowystarczalność demo sprawdzono także statycznie: wszystkie SVG, CSS i JS są wewnątrz HTML, bez żądań do zewnętrznych zasobów. Przeglądarka testowa dopuszcza HTTP/HTTPS i blokuje protokół plików lokalnych, więc próby otwarcia przez file:// nie wykonano pomyślnie. Demo nie wymaga mechanizmów dostępnych wyłącznie przez serwer, takich jak pobieranie SVG przez fetch.
