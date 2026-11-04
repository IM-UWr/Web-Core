# Raport: zdjęcia z Commons i otwartych licencji (5.11.2026)

## Najpierw trzy ograniczenia

1. **Wikimedia Commons się nie otworzyło.** WebFetch odrzucił każdą stronę `commons.wikimedia.org` (kategorie i pliki, 13 prób, także po restarcie kontenera) z błędem `url_not_found`. Nie obchodziłem tego. Wymóg „każdy kandydat sprawdzony na stronie pliku Commons” **nie jest spełniony**.
2. **Nie widziałem ani jednego zdjęcia.** WebFetch zwraca sam tekst, a bezpośredni adres obrazu kończy się błędem. Wszystkie 56 wpisów ma `widziane: false`, a każda `ocena` jest wstępna, oparta na tytule, opisie i tagach. Kompozycji (spokojna lewa strona, miejsce na szkic twarzy) nikt jeszcze nie ocenił; trzeba to zrobić po obejrzeniu miniatur.
3. **Główne źródło to Flickr, nie Commons.** Sięgnąłem po niego jako po samodzielne źródło otwartych licencji, z autorem i licencją na stronie każdego zdjęcia.

## Co jest w `KANDYDACI.json`

| Grupa | Liczba | Co jest sprawdzone |
|---|---|---|
| Flickr, Pexels | 26 | strona otwarta: licencja, autor, rozmiar, adresy; wszystkie mają min. 2400 px szerokości |
| Unsplash | 6 | strona otwarta: licencja i autor; **rozmiaru oryginału strona nie podaje** |
| Commons i Wikipedia (`weryfikacja: NIESPRAWDZONE`) | 24 | tylko adres z wyszukiwarki; `obraz`, `miniatura`, rozmiar puste, licencja nieznana, ocena najwyżej 3 |

Dodałem pola `zrodlo` i `weryfikacja`. `miniatura` przy Flickr to wersja 1024 px (dosłowny adres ze strony), przy Pexels kadr 1200×627. Przy Unsplash miniatura jest pusta, bo jedyny krótszy adres ma logo; podglądem może być `obraz`.

## Najlepsze na okładkę (do obejrzenia w tej kolejności)

1. **Most Grunwaldzki, w tle Manhattan**, domena publiczna, 3570×2383. Opis wskazuje bezpośrednie sąsiedztwo Instytutu. https://www.flickr.com/photos/138245692@N04/28237511005
2. **Most Grunwaldzki o zmroku**, domena publiczna, 3500×2333. Nastrój najbliższy obecnej okładce. https://www.flickr.com/photos/138245692@N04/27077349093
3. **Most Grunwaldzki „Connected”**, Rob Oo, CC BY 4.0, 6120×4079. Największy plik. https://www.flickr.com/photos/105105658@N03/54324748079/
4. **Widok na Uniwersytet znad rzeki**, domena publiczna, 4000×2610, kamera GoPro. https://www.flickr.com/photos/138245692@N04/41045510362
5. **Odra zimą, „Ścieżka światła”**, CC0, 5281×2885. Wariant zimowo-nocny. https://www.flickr.com/photos/138245692@N04/30902209784

## Najlepsze na dział

**Instytut** (słabo: brak sprawdzonego zdjęcia samego budynku)
1. Aula Leopoldina, Wrocław Official, CC0, 5477×3651, trzy ujęcia. Barok może wyjść „zatłoczony” w dwóch kolorach. https://www.flickr.com/photos/138245692@N04/32006423730
2. Plac Grunwaldzki z okna biura, Olgierd Rudak, CC BY 2.0, 2640×1760, zdjęcie z 2010 r. https://www.flickr.com/photos/olgierd/4731138712
3. Audytorium Chemii UWr, Rob Oo, CC BY 4.0, 5814×3876. Ci sami architekci co gmach Instytutu, ale opis mówi o niszczejącym budynku. https://www.flickr.com/photos/105105658@N03/54188476428/

**Nauka** (słabo: tylko stock)
1. Tablica pełna wzorów, Vitaly Gariev, Pexels, 3840×2160. Matematyk powinien sprawdzić sens wzorów. https://www.pexels.com/photo/close-up-of-complicated-equations-written-on-a-blackboard-22690751/
2. Ręka pisząca kredą, Vitaly Gariev, Unsplash, rozmiar nieznany. https://unsplash.com/photos/hand-writing-mathematical-formulas-on-a-blackboard-with-chalk-0uKaXrG9zaQ
3. Czytelnia w Trnawie, Trnava University, Unsplash, rozmiar nieznany. https://unsplash.com/photos/books-on-shelves-in-library-sd8uJsf4XM4

Trop do sprawdzenia: trzy pliki Wieży Matematycznej w Commons (w JSON jako niesprawdzone).

**Studia**
1. „Sedesowce”, osiedle Manhattan, Rob Oo, CC BY 4.0, 6108×4076, czarno-białe, tagi „wzór, powtarzalność”. https://www.flickr.com/photos/105105658@N03/54181532037/
2. Akademiki Kredka i Ołówek, Rob Oo, CC BY 4.0, 5271×3518. Politechnika, nie UWr. https://www.flickr.com/photos/105105658@N03/54190719705/
3. Panorama kampusu Politechniki i bulwarów, domena publiczna, 4900×1537. Proporcja bliska banerowi. https://www.flickr.com/photos/138245692@N04/26951046274

Na razie żadne z nich nie pokazuje sali ani zajęć. Zapas: pusta sala, Pexels, 2889×2063, nie nasza. https://www.pexels.com/photo/brown-and-black-wooden-chairs-inside-room-207691/

**Popularyzacja**
1. Origami modularne na motywach parkietażu Penrose'a, fdecomite, CC BY 2.0, 4608×3456. https://www.flickr.com/photos/fdecomite/9971646014/
2. Modele matematyczne Institut Henri Poincaré, fdecomite, CC BY 2.0, 4608×3456. https://www.flickr.com/photos/fdecomite/15190340673/
3. Hala Stulecia, „Discs of light”, Rob Oo, CC BY 4.0, 6085×4056. Geometria w architekturze, bez związku z Instytutem. https://www.flickr.com/photos/105105658@N03/54212004866/

Duże zasoby do ręcznego przeglądu u fdecomite: 229 zdjęć z tagiem `ihp`, 588 z tagiem `origami`. Licencję trzeba sprawdzić przy każdym zdjęciu.

## Wzory podpisów

- Rob Oo: `Fot. Rob Oo, CC BY 4.0, przetworzone` (link do strony zdjęcia i do creativecommons.org/licenses/by/4.0/)
- Olgierd Rudak: `Fot. Olgierd Rudak, CC BY 2.0, przetworzone` (link do strony zdjęcia i do creativecommons.org/licenses/by/2.0/)
- fdecomite: `Fot. fdecomite (Flickr), CC BY 2.0, przetworzone` (nazwisko Francesco De Comité jest spoza strony; potwierdzić przed użyciem)
- Wrocław Official: `Fot. Wrocław Official (Flickr), CC0` albo `…, domena publiczna`. Podpis nie jest wymagany, ale zalecam go.
- Pexels i Unsplash: `Fot. Vitaly Gariev, Pexels`, `Fot. Michal Chruscielski, Unsplash`. Podpis nie jest wymagany, ale zalecam go.

„Przetworzone” jest potrzebne przy CC BY, bo banery zmieniają kolory i kadr.

## Uwagi o prawach

- **Znak Public Domain Mark to nie licencja.** To oświadczenie konta miasta, że zdjęcie jest wolne. Zdjęcia są z lat 2013–2016, więc na okładkę warto poprosić Urząd Miejski Wrocławia o krótkie potwierdzenie. CC0 jest pewniejsze.
- **Licencje na koncie Wrocław Official są różne.** Dwa zdjęcia z tego konta mają „All rights reserved” („wieczór na Bulwarze Dunikowskiego”, unicykl na moście), więc nie można założyć wolnej licencji dla całego konta. Stan licencji jest z 5.11.2026 i warto zachować zrzut strony przy publikacji.
- **Odrzucone z powodu licencji:** `CC BY-ND` i `CC BY-NC-ND` zabraniają przeróbek, czyli także dwóch kolorów (konto MSZ polandmfa, magro_kr, petrOlly). `CC BY-NC` odpadło jako mniej pewne (Wojtek Gurak, Manhattan).
- **Odrzucone z powodu rozmiaru:** wolne ujęcia poniżej 2400 px (Ostrów Tumski 1920 px, Bulwar Kaczyńskich nocą 1920 px, Ostrów z bulwaru 1200 px).
- **Mozaika Anny Szpakowskiej-Kujawskiej** to utwór chroniony prawem autorskim, także na zdjęciu. Art. 33 prawa autorskiego zwykle dopuszcza pokazywanie dzieł stojących na stałe w przestrzeni publicznej; przy przeróbce na dwa kolory warto to potwierdzić u prawnika UWr.
- **Do poproszenia o zgodę (All rights reserved, sprawdzono wybrane):** Grzegorz Polak i Maciek Lulko mają dziesiątki zdjęć gmachu UWr, Wieży Matematycznej, Oratorium Marianum i pl. Grunwaldzkiego. To najlepszy trop jakościowy, jeśli otwarte źródła nie wystarczą. https://www.flickr.com/photos/tags/uniwersytetwrocławski/ oraz https://www.flickr.com/photos/tags/sedesowce/

## Czego brakuje (tematy na własną sesję)

Nie znalazłem sprawdzonych, wolnych zdjęć tych tematów. Commons może mieć część z nich, ale nie mogłem tego zweryfikować.

- **Budynek Instytutu**, zwłaszcza od strony Odry z mozaiką. Na okładkę: niebieska godzina, budynek w prawej części kadru.
- **Sale HS, WS, EM, B**: puste, jasne, rząd ławek w perspektywie.
- **Biblioteka matematyczna**: regały w perspektywie, spokojne światło.
- **Prawdziwa tablica po seminarium**: zamiast stocku, z wzorami, które mają sens.
- **Studenci i zajęcia**: wymagają zgody na wizerunek.
- **Popularyzacja**: Festiwal Nauki, warsztaty, obozy. Zgody, w tym opiekunów uczniów. Bez tego można sfotografować samą gablotę z origami na spokojnym tle.

## Czego nie udało się otworzyć

- **`commons.wikimedia.org`, wszystkie strony:** `url_not_found`. Najważniejsza do obejrzenia: https://commons.wikimedia.org/wiki/Category:Mathematics_Institute_of_Wroc%C5%82aw_University (tu powinny być zdjęcia budynku). Dalej: `Category:Faculty_of_Mathematics_and_Computer_Science,_University_of_Wrocław`, `Category:Grunwaldzki_Square,_Wrocław`, `Category:Aula_Leopoldina`, `Category:Oratorium_Marianum`, `Category:Wrocław_University_Library`. Wyróżnionych zdjęć (Quality images, Wiki Loves Monuments) nie dało się sprawdzić; wyszukiwarka pokazuje `Category:Quality_images_of_Wrocław` i galerię `User:Nova/WLM2014`, ale bez ich zawartości.
- **Wyszukiwarka Flickr z filtrem licencji:** `robots_disallowed`. Licencje sprawdzałem więc przy każdym zdjęciu z osobna.
- **Pexels:** `search/wroclaw` i dwa zdjęcia biblioteki (16689053, 33461675): `client_error`.
- **Flickr:** jedno zdjęcie Rob Oo (54208902417): `server_error`.
- **Celowo nieotwarte:** strony `Plik:`/`File:` w pl. i en.wikipedia, bo to kopie stron plików z Commons, oraz przeglądarka użytkownika.

## Co dalej (do decyzji)

1. **Przegląd miniatur przez człowieka.** Bez tego żadna ocena nie jest ostateczna.
2. **Dostęp do Commons.** Jeśli właściciel odblokuje stronę lub zgodzi się na strony `Plik:` w Wikipedii, 24 tropy można sprawdzić jednym przebiegiem.
