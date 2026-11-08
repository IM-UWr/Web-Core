# Reorganizacja Pages CMS i integracja strony — 8 listopada 2026

Wykonano zmiany w lokalnych klonach 23 repozytoriów na branchach `cms-reorganizacja-2026-11`. Wszystkie lokalne i zdalne `main` pozostają bez zmian. Build z połączonymi zmienionymi danymi działa. Zapis na GitHub jest zablokowany: próby utworzenia brancha w Web-Studia i Web-Core zwróciły `403 Resource not accessible by integration`; odczyt metadanych wskazuje `push: false`. Nie utworzono zdalnych branchy ani draft PR-ów. Nie opublikowano podglądu i nie wykonano merge.

Pakiet zawiera komplet zmian w postaci osobnych commitów/patchy, ich bazowe SHA, szczegółowy audyt oraz opisy przygotowanych draft PR-ów. Nie jest to zestaw samych rekomendacji: kod i dane zostały zmienione, a build uruchomiony.

## A. Repozytoria i pliki

We wszystkich poniższych repozytoriach istnieje lokalny branch `cms-reorganizacja-2026-11`. Linki prowadzą do istniejących repozytoriów; linków do nieutworzonych branchy i PR-ów nie podano.

| Repozytorium | Zakres |
|---|---|
| [Web-Aktualnosci](https://github.com/IM-UWr/Web-Aktualnosci) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Core](https://github.com/IM-UWr/Web-Core) | Odczyt danych, ręczne menu, schematy i testy |
| [Web-Instytut](https://github.com/IM-UWr/Web-Instytut) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Nauka](https://github.com/IM-UWr/Web-Nauka) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Podglad](https://github.com/IM-UWr/Web-Podglad) | Izolowany workflow testowy |
| [Web-Popularyzacja](https://github.com/IM-UWr/Web-Popularyzacja) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Pracownicy](https://github.com/IM-UWr/Web-Pracownicy) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Analiza-Harmoniczna](https://github.com/IM-UWr/Web-Sem-Analiza-Harmoniczna) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Dydaktyka](https://github.com/IM-UWr/Web-Sem-Dydaktyka) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Dyskretna-Analiza-Harmoniczna](https://github.com/IM-UWr/Web-Sem-Dyskretna-Analiza-Harmoniczna) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Geometria](https://github.com/IM-UWr/Web-Sem-Geometria) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Prawdopodobienstwo](https://github.com/IM-UWr/Web-Sem-Prawdopodobienstwo) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Rownania-Rozniczkowe](https://github.com/IM-UWr/Web-Sem-Rownania-Rozniczkowe) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Statystyka](https://github.com/IM-UWr/Web-Sem-Statystyka) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Teoria-Modeli](https://github.com/IM-UWr/Web-Sem-Teoria-Modeli) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Sem-Topologia](https://github.com/IM-UWr/Web-Sem-Topologia) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Spec-Aktuarialno-Finansowa](https://github.com/IM-UWr/Web-Spec-Aktuarialno-Finansowa) | Archiwum: wyłączenie formularza, zachowanie danych |
| [Web-Spec-Analiza-Danych](https://github.com/IM-UWr/Web-Spec-Analiza-Danych) | Archiwum: wyłączenie formularza, zachowanie danych |
| [Web-Spec-Nauczycielska](https://github.com/IM-UWr/Web-Spec-Nauczycielska) | Archiwum: wyłączenie formularza, zachowanie danych |
| [Web-Spec-Stosowana](https://github.com/IM-UWr/Web-Spec-Stosowana) | Archiwum: wyłączenie formularza, zachowanie danych |
| [Web-Spec-Teoretyczna](https://github.com/IM-UWr/Web-Spec-Teoretyczna) | Archiwum: wyłączenie formularza, zachowanie danych |
| [Web-Studia](https://github.com/IM-UWr/Web-Studia) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |
| [Web-Ustawienia](https://github.com/IM-UWr/Web-Ustawienia) | Formularze CMS, opisy i statusy; dane zgodne z formularzami |

Najważniejsze pliki:

- Web-Studia: `.pages.yml`, `src/content/specjalnosci/*.md`, usunięty zbędny `src/content/specjalnosci-baner/matematyka-w-ekonomii.json`, statusy w pozostałych treściach.
- Web-Ustawienia: `.pages.yml`, `src/data/nawigacja.json`, `src/data/ustawienia.json`, `src/data/skroty.json`.
- Web-Core: `tresci.json`, `src/content.config.ts`, `src/lib/specjalnosci.ts`, `src/lib/kierunki.ts`, `src/lib/menu.ts`, `src/lib/nawigacja.mjs`, `src/components/zal/{Okladka,PanelMenu,PasekMenu,DrugiEkran}.astro`, `src/layouts/Baza.astro`, `src/components/NaglowekStrony.astro`, funkcje działów, skrypty kontroli i pobierania, testy menu, aktualna ściągawka edytora.
- Web-Podglad: nowy `.github/workflows/cms-reorganizacja-test.yml`; dotychczasowy workflow publikacji pozostaje bez zmian.
- Pozostałe aktywne repozytoria: `.pages.yml`, wartości `status_publikacji` w istniejących danych i aktualne README.
- Pięć repozytoriów archiwalnych: usunięcie `.pages.yml` z brancha reorganizacji, README wskazujące nowe miejsce edycji. Całe stare dane specjalności pozostają.

## B. Specjalności

Jedyny aktywny zbiór: `Web-Studia/src/content/specjalnosci/`. Każda specjalność ma jeden Markdown i jeden formularz **Specjalności**. Scalono tekst polski, tekst angielski, baner, kafelek, kierunek, opiekunów i seminaria. Dawna osobna kolekcja `specjalnosci_baner` nie jest już odczytywana.

| Plik | Zachowany adres PL | EN |
|---|---|---|
| `analiza-danych.md` | `/studia/matematyka/analiza-danych` | ten sam adres z `/en` |
| `matematyka-aktuarialno-finansowa.md` | `/studia/matematyka/matematyka-aktuarialno-finansowa` | ten sam adres z `/en` |
| `matematyka-nauczycielska.md` | `/studia/matematyka/matematyka-nauczycielska` | ten sam adres z `/en` |
| `matematyka-stosowana.md` | `/studia/matematyka/matematyka-stosowana` | ten sam adres z `/en` |
| `matematyka-teoretyczna.md` | `/studia/matematyka/matematyka-teoretyczna` | ten sam adres z `/en` |
| `matematyka-w-ekonomii.md` | zachowany kafelek wygaszanej specjalności | zachowany kafelek EN |

Matematyka w ekonomii już przed migracją miała `bez_podstrony: true`; nadal nie otrzymuje własnej podstrony. Nie usunięto żadnego istniejącego adresu.

Kierunek w formularzu jest wybierany z lokalnej kolekcji kierunków. Dane zapisują ścieżkę referencji; schemat normalizuje ją do dotychczasowego identyfikatora, więc adres się nie zmienia. Pozostałe powiązania oraz kolejność seminariów i opiekunów zachowano. Pięć przenoszonych repozytoriów nie zawierało dodatkowych plików publicznych; używane dokumenty już są w Web-Studia.

`Web-Spec-*` usunięto z `Web-Core/tresci.json`. Nakładanie 16 aktywnych repozytoriów daje 1215 plików i nie zgłasza konfliktów. Manifest poprzedniego nakładania usuwa stare JSON-y banerów przy kolejnej synchronizacji.

## C. Ręczne menu i kafelki

Jedynym miejscem konfiguracji jest `Web-Ustawienia/src/data/nawigacja.json`, formularz **Menu główne**. Zachowano istniejący układ: pozycje główne → grupy → linki. Wszystkie listy zachowują kolejność redaktora, z pominięciem pozycji wyłączonych przełącznikiem `w_menu`.

Kierunki nie są pobierane ani dopisywane przy generowaniu menu. Podczas migracji jednorazowo zapisano dotychczasowe automatyczne pozycje jako zwykłe wpisy. Kolejność główna odpowiada dotychczas wyświetlanej: Instytut, Nauka, Studia, Popularyzacja, Aktualności, Rekrutacja. Rekrutacja pozostaje wyłącznie w panelu, tak jak wcześniej (`w_pasku: false`). Nowy wpis dowolnego typu nie pojawia się w menu ani kafelkach bez decyzji redaktora.

| Pole | Znaczenie |
|---|---|
| `etykieta`, `etykieta_en` | Nazwa w menu PL/EN |
| `adres` | Wspólny adres; ścieżki wewnętrzne otrzymują właściwy język |
| `opis`, `opis_en` | Opis pozycji, także w zestawieniach stron działu |
| `w_menu` | Widoczność pozycji, grupy lub linku w menu |
| `w_pasku` | Dodatkowa widoczność głównej pozycji w pasku komputera |
| `na_stronie_glownej` | Kafelek w sekcji studiów, niezależnie od widoczności linku w menu |
| `kafelek_nazwa`, `kafelek_nazwa_en` | Osobny tekst kafelka; pusty bierze etykietę menu |
| `kafelek_poziom`, `kafelek_poziom_en` | Napis nad nazwą kafelka |
| `kafelek_opis`, `kafelek_opis_en` | Opis kafelka; pusty bierze opis pozycji |
| `rekrutacja` | Jeden wybrany adres dla przycisków rekrutacji i menu |

Usunięto dublowanie `ustawienia.studia.kierunki` oraz adresu `ustawienia.studia.rekrutacja`. Wszystkie pięć dotychczasowych kafelków, ich teksty PL/EN oraz widoczne linki zachowano, w tym różne nazwy menu i kafelka studiów podyplomowych.

Statystyki czytają rzeczywiste kolekcje przez `listaKierunkow()` i `specjalnosci()`. Nie zależą od menu. Dla obecnych danych wynik PL/EN to 3 kierunki, 5 aktywnych specjalności i 3 stopnie studiów. Test z dodatkowym kierunkiem zwiększył statystykę do 4, pozostawiając menu i pięć kafelków bez zmian.

## D. Czyszczenie CMS i podstawy decyzji

Punktem wyjścia były aktywne trasy `src/pages`, wspólne `src/views`, `StronaGlowna.astro`, komponenty `zal` oraz ich importy. Sprawdzono również wspólne funkcje, filtry, renderowanie Markdownu, kalendarz/ICS, RSS, mapę strony, SEO i powiązania między kolekcjami. Samo wystąpienie nazwy pola w schemacie lub starym opakowaniu nie było powodem jego zachowania.

| Formularz / repozytorium | Usunięte pola | Powód i aktywne źródło prawdy |
|---|---|---|
| Ustawienia / Web-Ustawienia | `baner.zdjecie_male`, `baner.zdjecie_telefon`, `baner.podpis*`, `baner.kadr` | Okladka i StronaGlowna używają wspólnego `baner.zdjecie` oraz opisu alternatywnego; kadrowanie realizuje Okladka. |
| Ustawienia / Web-Ustawienia | `tlo_strony`, `sekcje` | Baza przekazywała stare atrybuty, lecz nowy wygląd nadpisuje ich reguły na komputerze i telefonie; wzorzec treści ma własne sekcje. Usunięto też odczyt tych pól w Baza. |
| Ustawienia / Web-Ustawienia | całe `naglowki_podstron` z wariantami i zdjęciami | NaglowekStrony generował wyłącznie dawne klasy opakowania; właściwy NaglowekZ wybiera oprawę i zdjęcia sam. Odczyt wycofany. |
| Ustawienia / Web-Ustawienia | `haslo`, `haslo_en`, `przyciski`, `facebook`, `youtube`, `partnerzy` | Okladka, DrugiEkran i StopkaZ nie wyświetlają tych danych. |
| Ustawienia / Web-Ustawienia | `studia.tytul`, `studia.tytul_en` | DrugiEkran ma własny stały tytuł sekcji. Opis sekcji pozostaje edytowalny. |
| Na skróty / Web-Ustawienia | `kafelki.ikona` | DrugiEkran nie czyta tego pola przy generowaniu skrótów. |
| Strona działu Studia | `sekretariat_zakres`, `sekretariat_zakres_en` | Brak odbiorcy w DzialStudia i funkcji daneDzialuStudia. |
| Banery kierunków / Web-Studia | `podtytul_en`, `liczby.etykieta_krotka`, `liczby.etykieta_krotka_en` | Kierunek używa pełnych etykiet; stopnieKierunku czyta tylko polski podtytuł i tekst. |
| Specjalności / wszystkie sześć | `zrodla`, `do_uzupelnienia` | Notatki migracyjne bez odbiorcy w Specjalnosc, Kierunek, statystykach i generatorach. |
| Seminarium / wszystkie dziewięć repozytoriów | `do_uzupelnienia` | Niewyświetlane notatki; aktualne widoki i daneSeminarium ich nie odczytują. |
| Konferencje / Web-Nauka | `body`, `organizatorzy`, `zdjecie` | Lista, dział Nauka, zakłady i kalendarz nie używają tych pól; brak osobnej strony konferencji. Zachowano pliki i ich historyczny tekst. |
| Publikacje / Web-Nauka | `zrodla`, `do_uzupelnienia` | Wykazy i lista publikacji ich nie wyświetlają; źródło bibliograficzne pojedynczej pracy (`zrodlo`) pozostaje. |
| Wykazy prac / Web-Nauka | `zrodla` | Niewyświetlane źródła migracji. `pochodzenie` pozostaje, bo tworzy widoczną notę rocznika. |
| Władze i Warto wiedzieć / Web-Instytut | `zrodla`, `do_uzupelnienia` tam, gdzie występowały | Notatki bez wpływu na daneWladz, WladzeZ oraz widoki osiągnięć. |
| Popularyzacja / Web-Popularyzacja | `linki` | Grupy linków są pobierane z menu; karty odbiorców ze stron Popularyzacji. |
| Menu / Web-Ustawienia | `menu.grupy.kierunki` | Usunięty mechanizm dopisywania kierunków; zastąpiony ręcznymi wpisami. |

To rzeczywiste usunięcia z konfiguracji, nie ukrycie. Z danych usunięto odpowiednie nieużywane właściwości, zachowując teksty merytoryczne PL/EN. Nie skasowano stron, wpisów ani dokumentów Instytutu. Nie zmieniono arkuszy CSS, szkiców patronów ani koncepcji graficznej.

Zachowano technicznie potrzebne pola: `opublikowany` (osobna, nadal aktywna stara flaga; zachowana w ukrytym polu, aby zapis CMS nie zmieniał istniejącej wartości), `przypomnienia.uid` (tożsamość zdarzeń kalendarza), identyfikację banera kierunku, pola nazw używane do tworzenia plików oraz dotychczasową grupę `karta`. Zachowano też polski `podtytul` kierunku: niewidoczny w nagłówku, ale używany przy obliczaniu statystyk.

Szczegółowe ścieżki usuniętych kontrolek, źródłowe repozytoria i bazowe SHA są w `cms-audit.json` pakietu. Poprawiono opisy wszystkich 844 kontrolek w 16 aktywnych konfiguracjach oraz opisy formularzy. Wprowadzono aktualny zapis sortowania `view.sort` + `view.default`, a przy okazji walidacji poprawiono starą uszkodzoną etykietę uwag publikacji.

## E. Przełączniki

| Mechanizm | Zapis | Stan |
|---|---|---|
| Opublikowana — strona oficjalna i podgląd | `status_publikacji: oficjalna` | Widoczny w CMS, poprawny w danych i schematach; bez nowego filtrowania |
| Tylko podgląd | `status_publikacji: podglad` | Jak wyżej; na razie nie wyklucza niczego z oficjalnego buildu |
| Standardowa strona CMS | `sposob_prezentacji: cms` | Zapisany wybór; bieżące renderowanie CMS |
| Autorska strona zewnętrzna | `sposob_prezentacji: zewnetrzna`, `adres_zewnetrzny: https://...` | Zapisane wartości; przekierowanie pozostaje niewłączone |
| Widoczność menu i kafelków | `w_menu`, `w_pasku`, `na_stronie_glownej` | Działa w kodzie strony |

Status jest przy aktualnościach, obronach, stronach, pracownikach, zakładach, osiągnięciach, kierunkach, specjalnościach, seminariach, referatach, konferencjach i grantach; także przy stronach działów, władzach, tekście roku akademickiego, rocznikach i czasopismach publikacji oraz przypomnieniach. Jest 46 widocznych kontrolek statusu w formularzach i listach. Dane istniejące otrzymały `oficjalna`. Baner kierunku nie ma niezależnego statusu, bo jest częścią strony kierunku.

Nie pomylono statusu z `opublikowany`. Nie wdrożono filtrowania dwóch wersji, CSS-owego ukrywania, noindex jako zastępstwa filtrowania ani przekierowań specjalności.

## F. Testy wykonane

| Kontrola | Wynik |
|---|---|
| Build bazowy z pierwotnymi 21 repozytoriami | OK — punkt odniesienia |
| Walidacja YAML i oficjalne ConfigSchema Pages CMS | OK — 16 plików; źródło pages-cms/pages-cms, commit `6f4e860a35d934406580287e7042e5e111e207a1`, Zod 3 |
| Schematy pól select/reference/string z Pages CMS | OK — nowe wartości statusów, sposób prezentacji, adresy, wartości domyślne i odnośniki do kierunków |
| Pokrycie danych formularzami | OK — 591 plików, 16 repozytoriów, 0 problemów |
| Kontrola treści i powiązań | OK — 561 plików i 106 ciekawostek |
| Testy ręcznego menu | OK — 3 testy |
| Istniejące testy bloków Markdownu | OK — 25 testów |
| Nakładanie nowych źródeł | OK — 1215 plików, 16 repozytoriów, bez konfliktów |
| Build Astro + Pagefind z pełnym lokalnym zestawem branchy | OK — 749 stron HTML PL/EN |
| Porównanie stron z bazą | Zachowane wszystkie adresy HTML; tekst głównej treści wszystkich 749 stron bez zmian |
| Kafelek i menu PL/EN | Zgodne teksty i adresy z generowaną wcześniej wersją |
| Niezależność statystyk | Dodatkowy kierunek dał 4 zamiast 3; nadal 5 specjalności, menu i kafelki bez automatycznego wpisu |
| Przełączniki bez zmiany działania | Testowa specjalność z `podglad`, `zewnetrzna` i adresem zewnętrznym nadal ma dotychczasową stronę CMS, bez przekierowania |
| Testy przeglądarkowe w tym środowisku | Niewykonane: lokalny Chromium i serwer podglądu napotkały ograniczenia systemowe; pobranie headless-shell nie powiodło się; chmurowa przeglądarka odrzuciła lokalny protokół plików |
| Formularze w zalogowanej aplikacji Pages CMS | Nie testowano interakcyjnie. Wykonano walidację aktualnym schematem i kontrolę zapisywanych danych |
| Zdalny test branchy / GitHub Actions | Nie uruchomiono — brak prawa zapisu blokuje utworzenie branchy i workflow na GitHub |

Test danych tymczasowych odbył się wyłącznie na ignorowanej nakładce testowej. Te pliki i zmienione wartości usunięto po teście; nie należą do commitów.

## G. Podgląd i warunki wdrożenia

Nowy workflow w Web-Podglad działa na branchu reorganizacji. Pobiera Web-Core i wszystkie 16 aktywnych źródeł z branchy o tej samej nazwie. Flaga `--scisle` celowo nie pozwala zamienić brakującego brancha na `main`. Zapisuje pełne SHA pobranych źródeł. Przygotowano również test Playwright menu na komputerze i telefonie, PL/EN, zrzuty kontrolne i przejście przez kierunki oraz specjalności. Nie twierdzimy, że ten test przeglądarkowy już przeszedł.

Wynik workflow jest artefaktem `cms-reorganizacja-strona-testowa`; nie ma kroku deploy, uprawnień Pages, zapisu na `zbudowana` ani dostępu do domeny produkcyjnej. Nie istnieje nowy publiczny adres podglądu. Po uzyskaniu prawa zapisu należy wypchnąć komplet branchy, utworzyć draft PR-y i uruchomić ten workflow. Lokalne polecenie odtwarzające zestaw danych:

```sh
python3 skrypty/pobierz_tresci.py --lokalnie .. --galaz cms-reorganizacja-2026-11 --scisle
SITE_URL=https://im-uwr.github.io BASE_PATH=/Web-Podglad npm run build
```

Przed przyszłym wdrożeniem potrzebna jest skoordynowana zmiana Web-Studia, Web-Ustawienia i Web-Core oraz pozostałych konfiguracji. Nie należy uruchamiać publikacji na mieszance starego Core i nowej migracji: stary Core nadal pobierałby Web-Spec-* i zgłaszał powielone ścieżki. Należy wstrzymać publikację na czas skoordynowanego wdrożenia, wykonać test pełnego zestawu i dopiero potem wznowić obecny workflow. W tym zadaniu niczego nie scalano ani nie wyłączano w działającej publikacji.

Formularze reorganizacji pokażą się w Pages CMS po wybraniu brancha `cms-reorganizacja-2026-11`; samo ich istnienie na tym branchu nie zmienia formularzy `main`.
