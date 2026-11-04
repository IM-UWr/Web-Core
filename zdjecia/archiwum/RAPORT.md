# Archiwum IM i WMI: raport (5.11.2026)

48 wpisów w `KANDYDACI.json` (instytut 13, popularyzacja 12, studia 9, nauka 8, okładka 6; część plików powtarza się w dwóch działach). 18 wpisów ma co najmniej 2400 px szerokości.

## Najważniejsze zastrzeżenie
**Żadnego z tych zdjęć nie widziałem.** Wszystkie wpisy mają `widziane: false`. WebFetch zwraca błąd przy plikach graficznych, a sieć z terminala jest zablokowana. Oceny są wstępne: opierają się na opisach alt, podpisach, nazwach plików i kontekście strony. Nie mogę więc powiedzieć, czy temat stoi po prawej, czy lewa strona jest spokojna ani jak zdjęcie zniesie dwa kolory. Dlatego najwyższa ocena to 4. Właściciel musi obejrzeć kadry: pola `miniatura` i `obraz` prowadzą wprost do plików.

Adresy i wymiary przepisał model pomocniczy WebFetch. Nie mogłem ich sprawdzić otwarciem pliku, więc pojedyncza literówka jest możliwa.

## Główne znalezisko
Biblioteka mediów strony WMI (WordPress REST API) podaje wymiary i pełne pliki. Są tam dwie serie:
- **Sesja zdjęciowa `Kopia-_MG_28xx–29xx`** (ok. 60 plików, wgrane 04–05.2023). Autor niepodany. Większość plików ma szerokość 14173 px, ale to prawdopodobnie powiększenie do druku: jeden plik serii ma 5616×3744. To przypuszczenie. Do podglądu używać wersji 768 px, a pełne pliki mogą być bardzo ciężkie.
- **Seria `Kopia-20230104_*`** (nazwy wskazują 4.01.2023), część 4000×2252, reszta 1600×901. Zawiera budynek IM, budynek II i salę HS.

Drugie znalezisko to **galeria FMW** (`fmw.math.uni.wroc.pl/galeria/galeria`, podlinkowana z menu IM): albumy mają linki do plików pełnego rozmiaru. Wymiarów strona nie podaje. Trzecie to plan kampusu z licencją CC0.

## Najlepsze na dział (wstępnie, do obejrzenia)

| Dział | Kandydat | Rozmiar | Licencja |
|---|---|---|---|
| Instytut | Plan sytuacyjny Kampusu Grunwaldzkiego, akwarela, 1975–1980; w legendzie budynek Instytutu Matematyki i audytorium | nieznany (oryginał 90×90 cm, kwadrat) | **CC0** |
| Instytut | Budynek IM od strony Odry (`Kopia-20230104_113854`) | 4000×2252 | prawa UWr/IM, wymaga zgody |
| Instytut | „budynek IM” (`Kopia-20230104_113516`) | 3853×2169 | prawa UWr/IM, wymaga zgody |
| Nauka | „Diagramy” (`_MG_2862-1`), znak działu Badania na stronie WMI | 14173×9449 | prawa UWr/IM, wymaga zgody |
| Nauka | „Notatki” (`_MG_2860`) | 14173×9449 | prawa UWr/IM, wymaga zgody |
| Nauka | Biblioteka Wydziałowa (`Biblioteka1`), budynek IM, 6. poziom | 1600×1066, trzeba oryginału | prawa UWr/IM, wymaga zgody |
| Studia | „Zajęcia w HS” (`_MG_2916`) | 13999×9333 | prawa UWr/IM, wymaga zgody |
| Studia | „Studenci w holu” (`_MG_2840`) | 4963×3309 | prawa UWr/IM, wymaga zgody |
| Studia | „Studenci z mostem” (`_MG_2940-1`) | 14173×9449 | prawa UWr/IM, wymaga zgody |
| Popularyzacja | Wystawa Mat-origami Żuraw 2016 (FMW, `0_wystawa01.jpg`) | nieznany | nieznana, wymaga zgody |
| Popularyzacja | Wykład WSM Lei Chen 2025 (FMW, 9 zdjęć) | nieznany | nieznana, wymaga zgody |
| Popularyzacja | Kongres Młodych Odkrywców 2025, grupa w sali, fot. Zuzanna Pelc | 1600×1067, trzeba oryginału | prawa UWr/IM, wymaga zgody |

## Okładka
Nic z archiwum nie jest pewnym kandydatem. Zgodności z układem (temat po prawej) nie umiem ocenić bez obejrzenia, więc oceny są niższe. W kolejności sprawdzania:
1. **Budynek IM od strony Odry**, 4000×2252: jedyny znaleziony tu plik w proporcji 16:9 i rozdzielczości na pełny ekran.
2. **Studenci z mostem**, jeśli okładka ma pokazać ludzi i miasto; wymaga zgód i przycięcia z 3:2.
3. **Widok na Odrę z Instytutu Informatyki**, 1600×1067: temat bez ludzi, ale trzeba oryginału.
4. **Zdjęcie „WMI”, fot. Janusz Pietroszek**, 1280×848: nie wiem, co pokazuje; sprawdzić, czy to budynek.
5. **Gmach główny UWr**, fot. Dominika Hull, 1600×998: zapas.

Skąd pochodzi obecne nocne ujęcie z lotu ptaka, nie ustaliłem. Więcej propozycji okładkowych ma dać agent `uwr-okladka`.

## Mural
To ceramiczna mozaika **Anny Szpakowskiej-Kujawskiej z 1971 r.**, według wroclaw.pl na ścianie IM od strony ul. Joliot-Curie. Znalazłem dwa zdjęcia z niejasnymi prawami (wroclaw.pl: miniatura 224 px; Street Art Cities: fot. Teresa Radek). Najprościej zrobić własne zdjęcie w dobrej rozdzielczości, z podpisem autorki mozaiki.

## Do obejrzenia hurtem
Nie mam opisów, więc nie dodawałem ich do JSON pojedynczo.

**Sesja `_MG_`, wersje 768 px podane przez API.** Wzór adresu: `https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2023/05/Kopia-_MG_{numer}-768x512.jpg`. Numery: 2832, 2837, 2844, 2851, 2852, 2870, 2874, 2877, 2879, 2882, 2887, 2888, 2897, 2899, 2901, 2911, 2914, 2919, 2920, 2922, 2923, 2924, 2929, 2931, 2932, 2936, 2939, 2942, 2947, 2963, 2972, 2976. Numer 2976 ma 5616×3744, czyli najpewniej rozmiar bez powiększenia.

**Sesja `_MG_`, znane tylko pełne pliki** (ciężkie): 2846, 2853, 2869, 2880, 2884, 2921, 2967, 2971, 2974.

**Seria styczniowa, 4000×2252, bez opisu:** `Kopia-20230104_112625`, `_112725`, `_114206`. Pierwsze dwa są czasowo blisko zdjęć budynku Informatyki.

**Seria styczniowa, 1600×901, czasowo obok „Studenci w HS”** (może sala HS, to przypuszczenie): `_123148`, `_123223`, `_123227`, `_123231`, `_123326`, `_123341`, `_123429`, `_123449`.

## Prawa
- Żadne zdjęcie z WMI, UWr ani FMW nie ma jawnej licencji. Na stronach WMI i UWr oznaczyłem je „prawa UWr/IM, wymaga zgody”, a dla FMW licencję „nieznana”, bo to osobna fundacja.
- **Plan kampusu** to jedyny materiał z wolną licencją: CC0 1.0, podmiot praw UWr, autor niepodany. Pliku nie ma pod bezpośrednim adresem, jest przycisk Download. Podpisać: Muzeum Cyfrowe.
- **Ludzie:** zdjęcia studentów i uczniów wymagają zgód, a przy uczniach także zgód opiekunów niepełnoletnich. Sama sesja dla Wydziału nie przesądza, że zgody obejmują inną stronę. „Panie z dziekanatu” i osoby wymienione w altach (np. `_MG_2900`, Daria Perkowska) to prywatne osoby.
- **Nie używać:** `pexels-*` z WMI (nazwy wskazują obce zdjęcia stockowe, m.in. „Tablica”), a także plików z galerii Żuraw nazwanych imieniem i nazwiskiem uczestnika.
- **Pominięte zgodnie z briefem:** „Pięciu matematyków” (`5_prof.jpg`: Hartman, Ryll-Nardzewski, Hulanicki, Urbanik, Marczewski w Oberwolfach; 671×500), czyli portret znanych osób i za mały plik. Warto o nim pamiętać na stronę o historii.

## Skąd prosić o oryginały
| Kto | Co | Kontakt lub trop |
|---|---|---|
| Wydział WMI (promocja) | Sesja `_MG_` 2023, seria `20230104`, Biblioteka1, Widok na Odrę, Wystawa origami; także pytanie, kto robił zdjęcia i jakie zgody obejmują | `promocja [at] cs.uni.wroc.pl` (adres z wpisów o MISIU i DFN) |
| Zuzanna Pelc / UWr | Immatrykulacja 29.09.2026; Kongres Młodych Odkrywców 2025 i 2026 | `odkrywcy@math.uni.wroc.pl`; galerie DKMO są w Google Slides na odkrywcy.math.uni.wroc.pl |
| Paweł Piotrowski / UWr | SPA 2025, konferencja AI 2024, Kongres Nauczycieli 2026 | przez Biuro Promocji UWr |
| Dominika Hull-Bruska | 9. Kongres Młodych Matematyków 2024, gmach główny 2016 | przez Biuro Promocji UWr |
| Magdalena Marcula, Biuro ds. Promocji UWr | Seria „studenci UWr”, m.in. numer 35 (2560×1709) | Biuro Promocji UWr |
| Janusz Pietroszek | Zdjęcie „WMI” z 2024 | do ustalenia |
| Teresa Radek | Zdjęcie mozaiki | Instagram `@teresa_radek` |
| FMW | Żuraw 2010–2019, Mistrzostwa 2006/2007/2010, WSM 2025, Matematyka bez granic 2006–2012, Maraton 2015 | `fmw@math.uni.wroc.pl` |
| Marcin Preisner, KUMAM | Warsztaty olimpijskie w Instytucie, 2023 | organizator wg wpisu WMI |
| Ewa Martyniszyn, Ksenia Prakhina | Galeria Łącznik, Matematyka i Sztuka 2023 | kuratorka i autorka fotorelacji |

## Czego nie udało się otworzyć
Żadnej z tych odmów nie obchodziłem inną drogą.
- **web.archive.org:** odmowa (SITE_BLOCKED). **Dawnych wersji math.uni.wroc.pl nie sprawdziłem**, więc ta część zakresu pozostaje otwarta.
- **matematyka.wroc.pl (Portal Matematyczny):** robots_disallowed.
- **Pliki graficzne:** błąd WebFetch przy czterech adresach na trzech serwerach (math.uni.wroc.pl, wmi.uwr.edu.pl, studia-wmi.uwr.edu.pl).
- **API WMI:** `pages?per_page=100` błąd serwera; `pages/51651` i `posts/52254` błąd klienta. Pełnej listy stron nie mam.

Brak zdjęć (strona się otworzyła, ale ich nie ma):
- obozy OM i Festiwal Nauki na FMW,
- lista konferencji na math.uni.wroc.pl,
- library.math.uni.wroc.pl (katalog czasopism).

Stron kół naukowych nie znalazłem. Większości z 47 wystaw Galerii Łącznik nie otwierałem.

## Uwagi o metodzie
- Adresy zapytań do API WordPressa (`wp-json/...`) i do wyszukiwarki Muzeum Cyfrowego zbudowałem sam, bo nie były podlinkowane. Adresy kandydatów pochodzą z odpowiedzi tych zapytań lub z otwartych stron, a nie z mojego składania. W polu `strona` kilku wpisów jest więc adres API, a nie zwykła strona.
- Przy wystawie „Antyczna matematyka” WebFetch sam obciął sufiksy wymiarów z adresów i zaznaczył, że ich nie sprawdzał, więc tych adresów nie użyłem.
- Jedno wywołanie wyszukiwarki obrazów na początku pokazało w rozmowie 5 zdjęć („Instytut Matematyczny, pl. Grunwaldzki”), ale nie dało mi ani adresów, ani podglądu, więc nic z niego nie wzięto. Więcej go nie używałem.

## Główne źródła
- [Strona WMI](https://wmi.uwr.edu.pl/) i jej [biblioteka mediów](https://wmi.uwr.edu.pl/wp-json/wp/v2/media?per_page=10&search=_MG_&page=2)
- [Instytut Matematyczny](https://math.uni.wroc.pl/) i [wydarzenia](https://math.uni.wroc.pl/wydarzenia)
- [Galeria FMW](https://fmw.math.uni.wroc.pl/galeria/galeria)
- [Plan kampusu, Muzeum Cyfrowe](https://muzeumcyfrowe.pl/en/dlibra/publication/9389/edition/9284)
- [Mozaiki we Wrocławiu, wroclaw.pl](https://www.wroclaw.pl/kultura/najpiekniejsze-mozaiki-we-wroclawiu-zobacz-zdjecia)
- [Mozaika, Street Art Cities](https://streetartcities.com/markers/32222)
- [Kampus Grunwaldzki, wroclaw.pl](https://www.wroclaw.pl/dla-mieszkanca/zobacz-jak-wypieknial-kampus-grunwaldzki-galeria)
- [Warsztaty Młodych Odkrywców, UWr](https://uwr.edu.pl/en/?p=349149)
