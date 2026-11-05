# Weryfikacja strony działu Instytut (patron: Edward Marczewski)

Stan na 5.11.2026. Dane: `wz` gałąź `wyglad/zalozyciele` (`d12c994`) z nałożonymi treściami Web-* (ostatnie commity 29–30.10.2026: Web-Pracownicy `48a9e24`, Web-Ustawienia `bbebd7f`, Web-Instytut `4259ed2`, Web-Nauka `271c818`). Prototyp: `proto/zalozyciele.src.html`, czytany o 00:37. Prototyp jest równolegle edytowany, więc numery linii się przesuwają (o 01:03 `D.instytut` był już w linii 1835); treść `D` była wtedy bez zmian. Szukaj `const D`, `IN_INST`, `IN_DANE`, `rysujInstytut`.

**Odpowiedź w jednym zdaniu:** tekst pasuje do hasła tematem (powstanie wrocławskiej matematyki), ale prawie nie mówi o Marczewskim, a skrót i notka mają po jednym błędzie (3 czasopisma, lata rektorstwa).

## 1. Stan

### Prototyp, obiekt `D.instytut` (linie 1798–1806)
- **Hasło:** „Wrocławska szkoła matematyczna”
- **Patron, lata:** Edward Marczewski, 1907–1976
- **Fakt:** „Pierwszy dyrektor Instytutu.”
- **Znak:** Twierdzenie Szpilrajna: „Każdy porządek częściowy da się rozszerzyć do liniowego (1930).”
- **Linki:** Pracownicy, Struktura i zakłady, Kontakt
- **Zakładki:** Władze, Pracownicy, Struktura i zakłady, Kontakt, Infrastruktura, Biblioteka
- **Liczby:** 81 nauczycieli akademickich · 17 doktorantów · 9 zakładów i pracowni
- **Tytuł:** O Instytucie
- **Tekst (428 znaków):**
  > Instytut wyrasta z tradycji przedwojennych szkół matematycznych: lwowskiej i warszawskiej. Wykłady na polskim Uniwersytecie we Wrocławiu ruszyły 15 listopada 1945 roku, a wrocławską matematykę budowało od podstaw czterech pionierów: Hugo Steinhaus, Edward Marczewski, Bronisław Knaster i Władysław Ślebodziński.
  >
  > W 1946 roku Steinhaus wpisał pierwsze zagadnienie do Nowej Księgi Szkockiej, kontynuacji lwowskiego zbioru problemów.
- **Skrót:** 1945 pierwsze wykłady · A+ kategoria naukowa · 3 czasopisma redagowane w Instytucie

### Różnice: trzy wersje tej samej strony

| Element | `D.instytut` | Widok prototypu (`IN_INST`, `rysujInstytut`, linie 2431 i 2594) | Realna strona (`src/data/dzialy/instytut.json`) |
|---|---|---|---|
| Gdzie widać | tylko schowany widok „Dział” (`.ustalone`, `rysujDzial`) | widok, który dziś się ogląda | `TrescDzialu.astro` |
| Tekst | 2 akapity, 428 znaków | 6 akapitów, identyczne z CMS | `o_instytucie`, 6 akapitów, 3553 znaki |
| Skrót | 3 pozycje z liczbami | 4 pozycje: 1945 · Pas startowy · Żywa gęś · 3 rektorów | `o_instytucie_fakty`, te same 4 pozycje |
| Link w tekście | `<a href="#">Nowej Księgi Szkockiej</a>` | brak | brak; `TrescDzialu.astro` wstawia tekst jako zwykły tekst, więc HTML z CMS by się nie wyświetlił jako link |
| Hasło | to samo | to samo | w CMS brak pola `haslo` (i żaden `.pages.yml` go nie ma), więc baner bierze je z `src/lib/patroni.ts`; telefon pokazuje wtedy opis `wstep` zamiast hasła |
| Liczby | wpisane na stałe | wpisane na stałe (z `D`) | liczone przy budowie: 81, 17, 9 (zgodne) |
| Notka na banerze | brak | `IN_NOTA` | `patroni.ts`, ta sama: „Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962. Zabiegał o budowę gmachu Instytutu.” Plus „· sala EM” |

Pełny tekst CMS, akapitami: 1. pionierzy, Księga, Colloquium, Studia; 2. szkoła, taksonomia, aksjomat determinacji, Urbanik; 3. osiem zakładów, Mirek, A+; 4. kierunki, PKA, doktoranci; 5. budynek i pas startowy (Marczewski); 6. Pracownia, wykład Tao.

## 2. Ocena

**Tekst a motyw patrona**
- `D.instytut`: Marczewski występuje tylko jako jedno z czterech nazwisk. Nic nie mówi, co zrobił, a fakt z okładki („Pierwszy dyrektor”) nie ma w tekście oparcia.
- CMS jest lepszy: akapit 5 ma budynek i pas startowy, a skrót „Pas startowy” i „rektorzy” też go dotyczą. Też jednak nie ma tam, że był pierwszym dyrektorem.
- **Tu nawiązanie jest naturalne:** tekst opowiada o powstaniu Instytutu, a patron był jego pierwszym dyrektorem. Wystarczy jedno zdanie.
- Znak (rozszerzenie porządku) z tekstem się nie łączy i nie musi. Zostaje w nagłówku podstron; na samej stronie działu znaku nie ma.

**Tekst a hasło**
- Temat się zgadza, ale `D.instytut` nie używa słów „wrocławska szkoła matematyczna”, a pisze „wrocławską matematykę”. CMS ma te słowa w akapicie 2. Drobna zmiana to naprawia.

**Tekst a liczby**
- Baner mówi o dziś (81, 17, 9), tekst `D` kończy się w 1946 roku. Sprzeczności nie ma, ale tekst niczego z banera nie objaśnia. CMS objaśnia zakłady w akapicie 3.
- „9 zakładów i pracowni” to 8 zakładów i 1 pracownia. Liczba jest dobra, a „ośmiu zakładach” w CMS z nią zgodne, tylko czytelnik musi to sam złożyć.

**Skrót a reszta**
- „1945” powtarza tekst: w porządku.
- „A+” w tekście `D` nie występuje. W CMS jest w akapicie 3. Fakt prawdziwy, ale to raczej rzecz działu Nauka, gdzie stoi w haśle.
- „3 czasopisma redagowane w Instytucie”: tekst `D` nie mówi o czasopismach, a samo twierdzenie jest za mocne (sekcja 3).
- Liczby banera i skrótu się nie powtarzają: dobrze.

**Zasada „hasło i liczby razem albo wcale” (zlecenie 11):** spełniona. Kolejność danych też dobra: przy braku miejsca znika najpierw „9 zakładów”.

## 3. Fakty i liczby

Liczenie: `src/content/pracownicy/*.yml` (129 plików, wszystkie opublikowane), pole `grupa`, tak samo jak `src/lib/widoki/dzialInstytut.ts`. Wynik: nauczyciel 81, emeryt 23, doktorant 17, administracja 8.

| Twierdzenie | Wynik | Dowód |
|---|---|---|
| 81 nauczycieli akademickich | potwierdzone w danych | `grupa: nauczyciel` = 81. Inne definicje: z przypisanym zakładem lub pracownią 75; bez magistrów 77; z emerytami 104. Elżbieta Kalinowska ma drugi wpis w administracji, ale tu liczy się raz |
| 17 doktorantów | potwierdzone w danych | `grupa: doktorant` = 17. Kompletności nie dało się sprawdzić poza CMS |
| 9 zakładów i pracowni | potwierdzone | `src/content/zaklady/`: 8 zakładów i Pracownia Dydaktyki i Popularyzacji Matematyki |
| „Każdy nauczyciel akademicki … pracuje w jednym z ośmiu zakładów … albo w Pracowni” (CMS `struktura_tekst`) | niezgodne z danymi | 6 osób bez pola `zaklad`: Kępczyński, Kołodziejska, Klusik, W. Świątkowski, Zaitseva, Kowalski |
| Wykłady ruszyły 15 listopada 1945 | potwierdzone | Duda, Weron, Wiad. Mat. 2006, s. 81: https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf ; MacTutor: https://mathshistory.st-andrews.ac.uk/Biographies/Marczewski/ |
| „na polskim Uniwersytecie” | potwierdzone z zastrzeżeniem | Uczelnia nazywała się wtedy „Uniwersytet i Politechnika” (Duda, Weron, s. 76) |
| Czterej pionierzy | potwierdzone | Duda, Weron, s. 81; Biler i in., Pamięć i Przyszłość 3/2015: https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2024/05/11-BKPW-PiP-3-2015.pdf |
| Steinhaus wpisał pierwsze zagadnienie w 1946 | potwierdzone | 1 lipca 1946: Duda, Weron, s. 78; Dzieło 23: https://dbc.wroc.pl/Content/1789/PDF/Dzielo%2023%20Wroc%C5%82awska%20Szko%C5%82a%20Matematyczna.pdf |
| „Pierwszy dyrektor Instytutu” | potwierdzone | Nekrolog: katedry „formed, first unofficially and since 1952 officially, the Mathematical Institute. From the very beginning Marczewski was its director, elected to this post by his colleagues”: https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_obituary/ |
| Lata dyrektury | źródła się różnią | Nekrolog: od początku, oficjalnie od 1952, ustąpił w 1967. Duda, Weron, s. 90: „z lat 1951–1968”. Urbanik dyrektorem od 1967: https://mathshistory.st-andrews.ac.uk/Biographies/Urbanik/ . Nazwa: „Instytut Matematyczny” (s. 76–77, 88), raz „Instytut Matematyki” (s. 90) |
| Rektor „w latach 1957–1962” (notka) | **błędne** | 1.12.1953–26.10.1957: https://en.wikipedia.org/wiki/List_of_rectors_of_the_University_of_Wroc%C5%82aw ; nekrolog; Duda, Weron, s. 90. W latach 1957–1962 rektorami byli Szarski i Świda |
| „Zabiegał o budowę gmachu Instytutu” | potwierdzone | Biler i in. 2015: „dzięki staraniom m.in. Marczewskiego powstał budynek” |
| 1907–1976 | potwierdzone | MacTutor, biografia |
| 3 czasopisma „redagowane w Instytucie” | **błędne w tym brzmieniu** | W Instytucie jest redakcja jednego: Colloquium Mathematicum (IMPAN podaje adres IM UWr). Applicationes Mathematicae ma adres w Warszawie, IMPAN (w radzie P. Biler). Probability and Mathematical Statistics: redaktorzy K. Bogdan i K. Dębicki z Wrocławia, wydawca to Oficyna PWr, wsparcie dwóch wydziałów. Źródła: https://impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum , https://impan.pl/en/publishing-house/journals-and-series/applicationes-mathematicae , https://www.math.uni.wroc.pl/~pms/ , `src/data/publikacje.json` (`do_uzupelnienia` już to zgłasza) |
| 3 czasopisma „z udziałem” pracowników Instytutu | potwierdzone | Karch (Colloquium), Dębicki (PMS), Biler (Applicationes): role z powyższych stron, przynależność z `pracownicy` |
| A+ | potwierdzone | Decyzja Ministra nr 5/704/2026 z 31.07.2026: „przyznaję Uniwersytetowi Wrocławskiemu kategorię naukową A+ w dyscyplinie matematyka” (`public/pliki/aktualnosci/decyzja_5_704_2026_matematyka.jpg`). Kategoria dotyczy dyscypliny na Uniwersytecie, nie samego Instytutu |
| CMS: Colloquium od 1947 | potwierdzone, źródła się różnią | Tom 1, zeszyt 1 datowany 1947: https://www.impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum/all/1 . Gdzie indziej: 1946 (MacTutor, biografia), 1948 (Duda, Weron; Biler i in.), 1950 (MacTutor, Ślebodziński) |
| CMS: 1948, wznowienie Studia Mathematica | potwierdzone | https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/ |
| CMS: pas startowy, przymusowa praca Marczewskiego | potwierdzone | Biler i in. 2015; https://mathshistory.st-andrews.ac.uk/Extras/Marczewski_friend/ („level the grounds for a military airfield”) |
| CMS: „3 rektorów” | **błędne** | Co najmniej 5: Marczewski, Urbanik (1975–81), Łukaszewicz (1981–82), Duda (1995–99), Pacholski (2005–08). Lista rektorów jak wyżej. Łukaszewicz: doktorat u Steinhausa, https://mathgenealogy.org/id.php?id=127470 . Pacholski: Nagroda im. Banacha 1974 (`strony/nauka/sukcesy/historia.md`). Notatka poprzedniego agenta wskazała tę lukę; listę sprawdziłem osobno |
| CMS: „Polska Komisja Akredytacyjna w 2010” | **błędna nazwa** | W 2010: Państwowa Komisja Akredytacyjna, uchwała 280/2010 (`warto_wiedziec/wyrozniajaca-ocena-pka.md`) |
| CMS: Instytut przy pl. Grunwaldzkim 2 „od końca lat sześćdziesiątych” | potwierdzone | Biler i in. 2015 (koniec lat 60.) |
| Twierdzenie Szpilrajna, 1930 | przyjęte, nie sprawdzane ponownie | Ciekawostka `szpilrajn-porzadek` (Fund. Math. 16, 1930). Nazwisko Szpilrajn potwierdza MacTutor |
| CMS: żywa gęś, Enflo 1972 | niepotwierdzone | Wyszukiwarka znalazła strony, ale limit WebFetch skończył się przed ich przeczytaniem |
| CMS: Urbanik i „pierwsza w polskiej matematyce katedra rachunku prawdopodobieństwa” | niepotwierdzone | MacTutor o tym nie pisze; biografii `KU.pdf` nie dało się już odczytać (limit) |
| CMS: taksonomia 1951, aksjomat determinacji 1962, Mirek w Annals 2022, Tao 2017 | nie sprawdzano | Poza głównym pytaniem; w `D.instytut` ich nie ma |
| „sala EM” = Marczewski | niepotwierdzone | Sala EM jest w `strony/studia/pierwszy-rok.md`, ale pełną nazwę w CMS ma tylko audytorium Steinhausa. `estetyka.md` to założenie |
| Link do Nowej Księgi Szkockiej | brak celu | W treściach CMS nie ma żadnej strony o Księdze |

## 4. Propozycje poprawek

### Prototyp `D.instytut`

**Tekst, pełne akapity (424 znaki, dziś 428):**

> Instytut wyrasta z przedwojennych szkół: lwowskiej i warszawskiej. Wykłady ruszyły we Wrocławiu 15 listopada 1945 roku, a wrocławską szkołę matematyczną budowało czterech pionierów: Hugo Steinhaus, Edward Marczewski, Bronisław Knaster i Władysław Ślebodziński.
>
> W 1946 roku Steinhaus wpisał pierwsze zagadnienie do Nowej Księgi Szkockiej. Marczewski redagował „Colloquium Mathematicum” i został pierwszym dyrektorem Instytutu.

Uzasadnienie: tekst dostaje słowa z hasła i jedno zdanie o patronie, a długość się nie zmienia.

**Skrót**
- było: `['3', 'czasopisma redagowane w Instytucie']` → ma być: `['1947', '„Colloquium Mathematicum”, redakcja do dziś w Instytucie']`. Uzasadnienie: fakt potwierdzony, łączy się ze zdaniem o Marczewskim.
- Zapasowo, jeśli ma zostać liczba: `['3', 'czasopisma z udziałem pracowników Instytutu']`.
- „1945” i „A+” bez zmian. Fakt „Pierwszy dyrektor Instytutu.” i liczby 81, 17, 9 bez zmian.

### Kod i prototyp: notka
- było: „Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962. Zabiegał o budowę gmachu Instytutu.”
- ma być: „Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1953–1957. Zabiegał o budowę gmachu Instytutu.”
- Uzasadnienie: lata były podane z pamięci i są błędne. Miejsca: `src/lib/patroni.ts`, `IN_NOTA` w prototypie, zapis w `dok/estetyka.md` (wiersz 75).

### CMS (`src/data/dzialy/instytut.json`), jeśli zostaje pełny tekst

**Akapit 1, pełny (664 znaki, dziś 671):**

> Instytut wyrasta z tradycji przedwojennych szkół matematycznych: lwowskiej i warszawskiej. Wykłady na polskim Uniwersytecie we Wrocławiu ruszyły 15 listopada 1945 roku, a wrocławską matematykę budowało od podstaw czterech pionierów: Hugo Steinhaus, Edward Marczewski, Bronisław Knaster i Władysław Ślebodziński. W 1946 roku Steinhaus wpisał pierwsze zagadnienie do Nowej Księgi Szkockiej — kontynuacji lwowskiego zbioru problemów. Czwórka założyła czasopismo „Colloquium Mathematicum”, którego redakcja do dziś mieści się w Instytucie, a Marczewski został pierwszym dyrektorem Instytutu. W 1948 roku we Wrocławiu wznowiono wydawanie lwowskich „Studia Mathematica”.

Uzasadnienie: CMS też nie mówił, że patron był pierwszym dyrektorem.

**Akapit 4, pełny:**

> Kształcimy na wszystkich poziomach. Prowadzimy studia I i II stopnia na kierunku matematyka z pięcioma specjalnościami, studia I stopnia na kierunku sztuczna inteligencja w analizie danych oraz — wspólnie z Instytutem Informatyki — Indywidualne Studia Informatyczno-Matematyczne. Komisja akredytacyjna (PKA) w 2010 i 2018 roku przyznała kierunkowi matematyka ocenę wyróżniającą. Doktoranci przygotowują rozprawy w Kolegium Doktorskim Matematyki Szkoły Doktorskiej UWr, a nauczyciele mogą zdobyć kwalifikacje na studiach podyplomowych.

Uzasadnienie: skrót PKA obejmuje obie nazwy komisji i jest krótszy.

**Pozostałe pary**
- `o_instytucie_fakty[3]`: było „3 rektorów / matematycy Marczewski, Urbanik i Duda kierowali Uniwersytetem Wrocławskim jako rektorzy” → ma być „5 rektorów / matematycy Marczewski, Urbanik, Łukaszewicz, Duda i Pacholski kierowali Uniwersytetem Wrocławskim jako rektorzy”. Uzasadnienie: lista rektorów ma pięciu matematyków.
- `wstep`: było „oraz studia I, II i III stopnia i studia podyplomowe” → ma być „oraz studia I i II stopnia, studia podyplomowe i kształcenie doktorantów”. Uzasadnienie: szkoła doktorska zastąpiła studia III stopnia (https://www.gov.pl/web/nauka/doktoranci-i-szkoly-doktorskie).
- `publikacje.json`: było „Czasopisma redagowane w Instytucie” → ma być „Czasopisma z udziałem Instytutu”. Uzasadnienie: to samo co w skrócie; `nauka.json` ma już to brzmienie.
- `struktura_tekst`: było „Każdy nauczyciel akademicki Instytutu pracuje w jednym z ośmiu zakładów naukowych albo w Pracowni” → uzupełnić 6 brakujących pól `zaklad` albo napisać „Nauczyciele akademiccy Instytutu pracują w ośmiu zakładach naukowych i w Pracowni”. Uzasadnienie: dziś tekst i dane się rozchodzą.

## 5. Do decyzji użytkownika
1. **Który tekst jest docelowy:** krótki `D` czy pełny CMS (widoczny dziś w prototypie i na stronie)? Od tego zależy, które poprawki z sekcji 4 wdrażać.
2. **Skrót:** liczby z `D` czy fakty z CMS (Pas startowy, Żywa gęś, rektorzy)? Moja rada: CMS po poprawce „rektorów”, bo tylko on naprawdę łączy się z Marczewskim. Warunek: ktoś potwierdzi gęś.
3. **„5 rektorów”:** zostawić liczbę czy pisać bez niej? Liczenie zależy od tego, kogo uznać za matematyka.
4. **Lata dyrektury:** nie podaję ich w tekście, bo źródła mówią 1951 albo 1952 i 1967 albo 1968. Jeśli mają się pojawić, rozstrzygnąć w Instytucie.
5. **„sala EM”** w notce: zostawić bez potwierdzenia nazwy?
6. **Link do Nowej Księgi Szkockiej:** dodać stronę, linkować zewnętrznie do artykułu Bilera i in. albo zrezygnować z linku.
7. **6 nauczycieli bez zakładu:** uzupełnić w CMS czy zostawić.
