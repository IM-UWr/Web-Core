# Knaster: raport

## Dopisane 5.11

Było 14 ciekawostek, jest 25 (nowych 11). Pewnych: 23 z 25 (nowych 9 z 11). Pierwsze 14 obiektów JSON sprawdzone skryptem: identyczne jak w `HEAD`. Rysunki obejrzane w rozmiarze 145×174 px.

**Uwaga techniczna:** `generator.js` wymagał pliku `fakty.js`, którego nie było w repozytorium (nie dało się go uruchomić). Odtworzyłem `fakty.js` z `ciekawostki.json`; wynik dla starych pozycji jest bajt w bajt taki sam, a nowe teksty są dopisane na końcu tego pliku. Rysunki nowych pozycji są w `generator.js`.

### Nowe pozycje i podstrony

| id | nazwa, rok | podstrona | pewność |
|---|---|---|---|
| `jednorodne-kontinua` | Problem z pierwszego tomu Fundamenta, 1920–2016 | zapas | pewne |
| `podkowa-smalea` | Podkowa Smale’a, 1986 | zapas | pewne |
| `wachlarz-lelka` | Wachlarz Lelka, 1961 | zapas | pewne |
| `praca-na-glos` | Praca czytana na głos, lata 50.–60. | Procedura dyplomowania | do sprawdzenia |
| `seria-b-wtn` | Redaktor 131 tomów, 1949–1978 | Skrypty i materiały | pewne |
| `gosc-zermelo` | Zermelo w mieszkaniu Knastera, 1929 | Program MOST | pewne |
| `referat-borsuka` | Referat za Borsuka, 1932 | Plan zajęć | pewne |
| `banach-po-francusku` | Banach po francusku, 1932 | Skrypty i materiały | do sprawdzenia |
| `roze-i-skamander` | Róże i Skamander, lata 30. | zapas | pewne |
| `doktorat-am-1961` | Doktorat Akademii Medycznej, 1961 | Egzaminy i dyplom | pewne |
| `katedra-topologii` | Katedra Topologii, 1945 | Rok akademicki | pewne |

### Proponowane przypięcia

Pole `przypiecie: true` mają dwie nowe pozycje:
- `seria-b-wtn` → Skrypty i materiały: wydawanie książek było jego pasją.
- `katedra-topologii` → Rok akademicki: pierwszy rok akademicki polskiego Uniwersytetu.

Z istniejących proponuję jeszcze (pola w JSON nie zmieniałem):
- `obrona-w-willi` → Procedura dyplomowania.
- `seminarium-w-salonie` → Zajęcia i konsultacje. Patrz niżej: ta pozycja opiera się na transkrypcji „nie szerzyć”.

### Do sprawdzenia i dlaczego

- `praca-na-glos`: jedyne źródło to wywiad z Romanem Dudą (2024) na stronie entanglements.ihpan.edu.pl, a plik to **robocza transkrypcja oznaczona „nie szerzyć”**. Fakty wyglądają wiarygodnie (mówi uczeń), ale przed publikacją potrzebna jest zgoda albo inne źródło (np. R. Duda, „Life and work of Bronisław Knaster”, Colloq. Math. 51, 1987).
- `banach-po-francusku`: jedno źródło, „Wrocławska szkoła matematyczna” (Dzieło 23, s. 336), bez tytułu książki. To, że chodzi o „Théorie des opérations linéaires” (1932), wnioskuję. Rozstrzygnie wstęp do książki.

### Świadome ograniczenia

- `doktorat-am-1961`: sam tytuł potwierdza Dzieło 23 (s. 337), ale rok 1961 i informację o Steinhausie mam tylko z zestawienia „Sukcesy naukowe” na stronie Instytutu (`src/content/strony/nauka/sukcesy/historia.md`). Nie mam publicznego adresu tej starej strony, więc nie ma jej w `zrodla`; ścieżka jest w notce.
- `podkowa-smalea`: rok to rok pracy Barge’a, a nie samej podkowy; roku pracy Smale’a nie potwierdzałem, więc w notce go nie ma.
- `jednorodne-kontinua`, `wachlarz-lelka`: rysunki to schematy, co notki mówią wprost: prawdziwego pseudołuku ani gęstych końców nie da się narysować.
- Z rozmysłem pominąłem pracę w Instytucie Weigla we Lwowie (brief każe raczej pomijać). Nie dopisałem też osobnej pozycji o kontinuach unikoherentnych (temat jest w notce `referat-borsuka`) ani o tomie XXXIII Fundamenta (jest w notce `seria-b-wtn`), żeby nie mnożyć podobnych haseł redakcyjnych.

### Rysunki (wszystkie policzone w `generator.js`)

Trzy typy jednorodnych kontinuów płaskich (schemat); obrazy odcinka w podkowie, poziomy z konstrukcji Cantora; wachlarz z różnymi długościami (schemat); y = sin(1/x) z odcinkiem granicznym; krzywa smoka rzędu 9; dobry porządek ω²; podział koła na 2 i na 3 części (średnice policzone); kule ℓp; krzywe różane; kardioida jako obwiednia cięciw; twierdzenie Jordana (liczba przecięć i indeks punktu policzone).

### Uwagi do istniejących pozycji (nic nie zmieniałem)

- `seminarium-w-salonie` i `twierdzenie-knastera-reichbacha` cytują tę samą transkrypcję „nie szerzyć” co `praca-na-glos`. Warto to rozstrzygnąć razem.
- `twierdzenie-knastera-reichbacha`: notka podaje doktorat Mariana Reichbacha (1956). Artykuł Dudy i Werona wymienia doktorat „Meir Reichaw (1956)” i osobno Mariana Reichbacha wśród uczestników seminarium. To prawdopodobnie ta sama osoba; warto sprawdzić.
- `kontinuum-dziedzicznie-nierozkladalne`: rok doktoratu jest opisany w notce jako rozbieżny; Duda i Weron oraz Dzieło 23 też podają 1923.

### Źródła nowych pozycji

- MacTutor: https://mathshistory.st-andrews.ac.uk/Biographies/Knaster/
- Duda, Weron: https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf
- „Wrocławska szkoła matematyczna”, Dzieło 23: https://dbc.wroc.pl/Content/1789/PDF/Dzielo%2023%20Wroc%C5%82awska%20Szko%C5%82a%20Matematyczna.pdf
- Wywiad z R. Dudą (robocza transkrypcja): https://entanglements.ihpan.edu.pl/wp-content/uploads/2024/09/TWP_interview_DUDA_Roman_2024-03-21_wywiad3_seminarium_Knastera_part2-edit-02-09-2024-web.pdf
- Jednorodne kontinua: https://arxiv.org/pdf/1409.6324, https://projecteuclid.org/euclid.acta/1485802479, https://en.wikipedia.org/wiki/Pseudo-arc
- Podkowa: https://arxiv.org/pdf/1603.03887, https://en.wikipedia.org/wiki/Indecomposable_continuum
- Wachlarz Lelka: https://arxiv.org/pdf/1512.09252, https://eudml.org/doc/213597, https://scholarsmine.mst.edu/math_stat_facwork/605
- Borsuk: https://en.wikipedia.org/wiki/Borsuk%27s_conjecture
- Banach: https://www.cambridge.org/core/journals/mathematical-gazette/article/theorie-des-operations-lineaires-by-s-banach-pp-viii-254-3-1932-monografje-matematyczne-1-warsaw/93CC4C2064FBF8928D574FC4FD008A6A
