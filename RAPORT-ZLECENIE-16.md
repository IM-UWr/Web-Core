# Raport: zlecenie 16 — wersja angielska (5.11.2026)

Gałąź: `wyglad/zlecenie-16` (z `9fd255ee`, ostatniego commita zlecenia 15), 12 commitów + 2 commity raportu (drugi z decyzją o obronach), **bez pushowania**. Repozytoria treści: 35 commitów w 20 klonach, też bez pushowania. Zlecenie: `.przekazanie/zlecenia/16-wersja-angielska.md`.

**Do Twojej decyzji albo działania**

1. **Wklej nowy skrypt e-maili do Google (D16).** Zmiana w repozytorium nie wdraża się sama. Otwórz projekt na https://script.google.com, zastąp zawartość `Code.gs` plikiem `skrypty/powiadomienia/Code.gs`, zapisz i wybierz **Wdróż → Zarządzaj wdrożeniami → Edytuj → Nowa wersja → Wdróż**. Adres `/exec` się nie zmienia. Dopóki tego nie zrobisz, e-maile linkują do `/powiadomienia/`, a ta strona działa dalej i jest dwujęzyczna.
2. **Przejrzyj tłumaczenia:** D4, D6, D8 (tabele niżej) oraz 31 nazw przedmiotów i notki patronów (załączniki na końcu). Tych dwóch ostatnich nie zatwierdziłeś od zalecenia 12.
3. **Push czeka na Twoje słowo.** 20 repozytoriów treści i Web-Core; lista niżej.

Stan sprawdzenia:

- `astro build`: bez błędów.
- `astro check`: 6 błędów, **żaden nowy** (3 `process` w `astro.config.mjs`, 3 w `src/lib/zdjecia.ts` ze zlecenia 13).
- `skrypty/sprawdz_tresci.py`: „OK — sprawdzono 555 plików”.
- Treści: `skrypty/pobierz_tresci.py` nie był uruchamiany, repozytoria Web-* na GitHubie bez zmian. `package.json` bez zmian. **Nakładka zostaje zmieniona**, żebyś mógł obejrzeć wynik lokalnie (przywracanie niżej).
- Wszystkie łatki weszły czysto, na klony i na nakładkę: bez `git apply -3` i bez konfliktów.
- Sprawdzane w Edge (Playwright) na zbudowanej stronie: 20 stron `/en` na 1440 i 390 px przed i po, 3 strony na 1920 px w ciemnym motywie, otwarte menu na 390, 1024, 1280 i 1440 px. Żadna z tych stron nie ma poziomego przewijania.
- **Czego nie sprawdzałem:** Firefoksa, Safari, prawdziwych telefonów, czytnika ekranu (`lang="pl"` z D14 sprawdzony tylko w HTML), formularzy w samym Pages CMS. Skryptu `Code.gs` nie uruchamiałem w Google: strony potwierdzania i wypisywania testowałem z podstawionymi odpowiedziami serwera.

## Podsumowanie

| Punkt | Stan | Commit w Web-Core | Łatka treści |
|---|---|---|---|
| D1 tytuły przy nazwiskach | zrobione | `cfe65d03`, `63b3f4a1` | Web-Aktualnosci, Web-Studia |
| D2 pełna nazwa w `<title>`, `og:site_name`, stopce | zrobione | `b1f1b578` | — |
| D3 logo | bez zmian, decyzja | — | — |
| D4 tytuły w aktualnościach | zrobione, do przejrzenia | — | Web-Aktualnosci |
| D5 „Original title:” na stronie grantu | zrobione | `1f6d4a4f` | — |
| D6 nazwy przedmiotów i systemów | zrobione, do przejrzenia | — | Web-Studia |
| D7, D9, D12, D13, D17 | bez zmian, decyzja | — | — |
| D8 nazwy konkursów i programów | zrobione, do przejrzenia | — | Web-Aktualnosci, Web-Spec-Nauczycielska |
| D10 pole `jezyk`, „(talk in Polish)” | zrobione | `5d4cc6da`, `0bd1fac9` | dziewięć Web-Sem-* |
| D11 Szklarska Poręba | zrobione | — | Web-Nauka |
| D14 `lang="pl"` przy wartości polskiej | zrobione, zakres niżej | `d49be5c1` | — |
| D15 strona 404 w obu językach | zrobione | `b11dd764`, `1137c1fe` | — |
| D16 `/en/powiadomienia/`, link w e-mailach | zrobione, **do wklejenia** | `4011138a` | — |
| D18 sala „zd” → „online” | potwierdzone, bez zmian (`src/lib/en/plan.ts:18`) | — | — |
| D19 daty po angielsku | zrobione | — | Web-Studia |
| D20 „(in Polish)” w menu | zrobione | `bf562674` | Web-Ustawienia |
| 17 łatek z `dok/en/latki` i łatki 14, 15 | nałożone | — | 20 repozytoriów |
| Obrony bez `tresc_en` (Twoja decyzja po raporcie) | zrobione | ten commit (łatka) | Web-Aktualnosci |
| Łatki tego zlecenia | zapisane | `ec0b0a4a` | `dok/latki/zlecenie-16/` |

## Kryteria odbioru

| Kryterium | Wynik |
|---|---|
| `/en` bez polskich stopni przy nazwiskach (poza „Dr hab.”) | skan całego `/en`: zostały 3 trafienia, wszystkie w cytowaniach bibliograficznych na `/en/nauka/publikacje/2006` i `/2018` („prof. E. Wirsinga”, „ks. dr hab. Adam Olszewski, prof. UP JPII”). To cytaty, więc ich nie ruszałem |
| Poprawne tytuły stron | „Study · Mathematical Institute, University of Wrocław”; `og:site_name` tak samo; polskie strony bez zmian („Instytut · Instytut Matematyczny UWr”) |
| Łatki w klonach (commity bez pushu) i na nakładce | 35 commitów w 20 klonach, wszystkie klony czyste; każda łatka z `dok/latki/zlecenie-16/` zgadza się ze stanem klonu |
| Kopia oryginałów nakładki | `.przekazanie/robocze/nakladka-przed-16/` |
| Build, `astro check`, `sprawdz_tresci.py` | bez nowych błędów, OK (wyżej) |
| Zrzuty `/en` przed/po | niżej; `dok/en/POSTEP.md` nie zawiera nazwanej listy stron, więc wybrałem 20 reprezentatywnych |

## Co warto wiedzieć o wykonaniu

**Obrony (Twoja decyzja „Usuń”, 5.11).** Łatka z `dok/en/latki` dodawała `tresc_en` do ośmiu obron (5 prawdziwych, 3 testowe), przez co minione obrony zapraszały „You are cordially invited”, a obok było „This event has taken place”. Pola usunąłem, więc tekst składa widok z danych obrony. W zbudowanej stronie siedem minionych obron ma „… took place on …”, a jedna przyszła (testowa, 27.11) nadal zaprasza. Pole `tresc_en` zostaje w formularzu CMS, ale wpisany tam tekst znów zastąpi ten z kodu.

**D1.** Osobna reguła dla „dr, prof. UWr”, której zlecenie nie wymienia: daję „Dr” (pytanie 2). Na stronie obrony „X, MSc” stoi w tekście, a nagłówek to samo nazwisko, bo tak wygląda on po polsku.

**D2.** Pełna nazwa mieści się w stopce: wiersz kontaktu ma 835 px (było 706) i jest w jednym wierszu na 1024, 1280, 1440 i 1920 px. Linki stopki były w drugim wierszu już wcześniej.

**D4.** Zlecenie zakładało ok. 90 tytułów na 46 stronach. Rozpoznałem 113 polskich tytułów, ale większość miała już tłumaczenie z `dok/en/latki`. Doszło 14 nowych i jedno pełne tłumaczenie w miejsce parafrazy (problem Waringa). Kolejne wzmianki tego samego tytułu na stronie zostają bez nawiasu. Polskie nazwy szkół zgodnie z D9 bez zmian.

**D6.** Tam, gdzie USOS ma angielską nazwę (`src/data/plan/plan.json`), użyłem jej zamiast własnej („Advanced calculus 1”, nie „Mathematical analysis 1”). „kolokwia”, „starosta” i „dziekanat” miały już objaśnienia, więc ich nie ruszałem.

**D10.** Pole `jezyk` jest opcjonalne, puste nic nie zmienia. Tytuł zostaje w oryginale. W zbudowanej stronie dopisek jest dziś na `/en/kalendarz` i na stronach dwóch seminariów, a na polskich stronach go nie ma. Lista seminariów, strona zakładu i „Seminars” na stronie głównej mają ten sam kod, ale tych referatów dziś tam nie pokazują, więc w tych miejscach sprawdziłem tylko kod. E-maili o referatach nie zmieniałem. `jezyk: pl` dostały wszystkie referaty o polskim tytule:

| Repozytorium | Plik | Tytuł |
|---|---|---|
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `2026-06-18-chelstowski` | Kwantowe grafy Knesera |
| Web-Sem-Rownania-Rozniczkowe | `2026-10-05-karch`, `2026-10-12-karch-2` | Rozwiązania automorficzne (self-similar) równań konwekcji-dyfuzji |

**D14: odstępstwo od prostego rozwiązania.** Zlecenie mówi: `lang="pl"`, gdy pokazujemy wartość polską w miejsce pustego `_en`. Puste `_en` tego nie rozstrzyga, bo „polskie” pola konferencji i grantów często zawierają angielski oryginał. Dlatego `src/lib/jezykTekstu.ts` rozpoznaje polszczyznę po wyrazach funkcyjnych, końcówkach i ogonkach.

- Na prawdziwych danych żaden angielski tytuł konferencji ani grantu nie dostał `lang="pl"`.
- Omija kilka krótkich polskich tytułów: „Teoria Galois”, „Ciała cyklotomiczne”, „Nielokalny model epidemii”, „Konsekwencje Hipotezy Continuum”. Tam czytnik przeczyta je po angielsku, czyli tak jak dotąd.
- Bez `lang`: etykiety menu i zakładów oraz pola zakładów i kierunków (dziś wszystkie przetłumaczone), `<title>`, polskie tytuły wpisane w Markdownie `tresc_en` (CMS nie pozwala tam na HTML).

**D15.** Strona 404 jest jedna na oba języki, więc menu i stopka zostają polskie. Na adresach `/en/…` skrypt kieruje przyciski „strona główna” i „szukaj” do wersji angielskiej. Na telefonie przyciski zajmują do dwóch wierszy.

**D16.** Nowa strona `/en/powiadomienia/`; `/powiadomienia/` zostaje dwujęzyczna dla linków w już wysłanych e-mailach. Potwierdzenie, wypisanie i błędny link przetestowane w obu wersjach (z podstawioną odpowiedzią serwera).

**D20.** Wyniki sprawdzenia każdego linku:

| Pozycja menu | Adres | Wersja angielska | Dopisek |
|---|---|---|---|
| Library | wmi.uwr.edu.pl/biblioteka-wydzialowa | brak (`hreflang` tylko pl) | (in Polish) |
| Mathematics Discipline Council | bip.uni.wroc.pl | brak (`lang="pl"`) | (in Polish) |
| USOSweb | usosweb.uwr.edu.pl | system ma wersję angielską; **pobranie się nie udało** (pętla przekierowań), więc to nie jest sprawdzone tą drogą | bez dopisku |
| Wrocław Mathematicians Foundation | fmw.math.uni.wroc.pl | brak (`/en` daje 404) | (in Polish) |
| Wrocław Mathematical Portal | matematyka.wroc.pl | brak (`/en` daje 404) | (in Polish) |
| Polish Mathematical Society, Wrocław Branch | ptm.math.uni.wroc.pl | brak (treść polska; atrybut `en-US` Google Sites jest mylący, `/en` daje 404) | (in Polish) |
| Admissions | studia-wmi.uwr.edu.pl | brak (`/en` daje 404) | (in Polish) |

Etykieta „Admissions” zasila też kartę na `/en/studia`. Tam dopisek powiększał kartę z 275 do 383 px i przesuwał ją, więc kod przenosi go do małego wiersza: „For applicants · in Polish / Admissions 2027/28”. Karta ma znów 275×75 px, jak przed zmianą. W panelu menu na 1024 px „Admissions (in Polish)” łamie się na dwa wiersze; na 390, 1280 i 1440 px mieści się w jednym.

## Zmiany na polskich stronach

Z 380 polskich stron zmieniło się 17, wszystkie zgodnie ze zleceniem, i doszła jedna:

| Strony | Przyczyna |
|---|---|
| 11 stron (aktualności, sukcesy) | D8: pisownia „Krok w Przyszłość” |
| `nauka/konferencje`, `instytut/zaklady/algebra-i-teoria-modeli` | D11: „Szklarska Poręba” |
| `404` | D15 |
| `powiadomienia` | D16: `lang="en"` przy tekście angielskim |
| `warto-wiedziec/wyklad-terencea-tao` | naprawiony link z `dok/en/latki` |
| `pracownicy` | bez zmiany treści, tylko losowy identyfikator Astro |
| **nowa:** `o-stronie` | łatka ze zlecenia 14 weszła na nakładkę, więc link „O stronie” w stopce już działa. Adres redakcji nadal trzeba tam wpisać (zlecenie 14) |

## Repozytoria z commitami czekającymi na „push”

| Repozytorium | Commity (od najstarszego) | Co zawierają |
|---|---|---|
| Web-Aktualnosci | `c803e95`, `6b42382`, `feeacb9` | tłumaczenia z `dok/en/latki`; D4 (tytuły w nawiasach), D8 (nazwy konkursów, pisownia „Krok w Przyszłość” także w polu polskim), stopnie z D1; obrony bez `tresc_en` z tamtej łatki |
| Web-Instytut | `dc44f49` | tylko łatka z `dok/en/latki`: naprawiony martwy link w „Wykładzie Terence’a Tao” (PL i EN) |
| Web-Nauka | `13745e4` | D11: „Szklarska Poręba” w polu `miejsce` |
| Web-Popularyzacja | `53f6556` | tylko łatka ze zlecenia 15: dane działu, cztery strony, formularz CMS |
| Web-Sem-Analiza-Harmoniczna | `35247f7`, `6c23c98` | tłumaczenia z `dok/en/latki`; pole `jezyk` w `.pages.yml` |
| Web-Sem-Dydaktyka | `a0dfe76`, `1fbf7aa` | pola `_en` w `.pages.yml` z `dok/en/latki`; pole `jezyk` |
| Web-Sem-Dyskretna-Analiza-Harmoniczna | `ad68cbf`, `555961d` | tłumaczenia z `dok/en/latki`; pole `jezyk`, `jezyk: pl` przy jednym referacie |
| Web-Sem-Geometria | `9bdcdbe`, `dcb5f49` | pola `_en` w `.pages.yml` z `dok/en/latki`; pole `jezyk` |
| Web-Sem-Prawdopodobienstwo | `534f3f2`, `bfd5bfa` | tłumaczenia z `dok/en/latki`; pole `jezyk` |
| Web-Sem-Rownania-Rozniczkowe | `d247184`, `2476b7c` | tłumaczenia z `dok/en/latki`; pole `jezyk`, `jezyk: pl` przy dwóch referatach |
| Web-Sem-Statystyka | `cbbdb54`, `a8faf44` | tłumaczenia z `dok/en/latki`; pole `jezyk` |
| Web-Sem-Teoria-Modeli | `8481425`, `9dc5e28` | pola `_en` w `.pages.yml` z `dok/en/latki`; pole `jezyk` |
| Web-Sem-Topologia | `58c1576`, `df00da7` | pola `_en` w `.pages.yml` z `dok/en/latki`; pole `jezyk` |
| Web-Spec-Aktuarialno-Finansowa | `e11ed6c` | tylko łatka z `dok/en/latki`: tłumaczenia specjalności |
| Web-Spec-Analiza-Danych | `c4c03ad` | tylko łatka z `dok/en/latki`: tłumaczenia specjalności |
| Web-Spec-Nauczycielska | `15451f6`, `fc9844a` | tłumaczenia z `dok/en/latki`; D8: „Krok w Przyszłość” (Step into the Future) |
| Web-Spec-Stosowana | `0ec9422` | tylko łatka z `dok/en/latki`: tłumaczenia specjalności |
| Web-Spec-Teoretyczna | `ed7f374` | tylko łatka z `dok/en/latki`: tłumaczenia specjalności |
| Web-Studia | `187d2de`, `db6eae3` | tłumaczenia z `dok/en/latki`; D1 (stopnie w `tresc_en`), D6 (nazwy przedmiotów i systemów), D19 (daty) |
| Web-Ustawienia | `d649b38`, `9f12643`, `0d12108` | łatki ze zleceń 14 i 15 (m.in. strona „O stronie”, menu Popularyzacji); D20: dopisek „(in Polish)” przy sześciu pozycjach menu |

Commity mają opis „Wersja angielska: tłumaczenia (zlecenie 16)”, osobno dla każdego źródła łatki. Klony: `C:\Users\Szymek\source\tresci\<Repozytorium>`.

## Łatki i nakładka

- `dok/latki/zlecenie-16/`: 14 łatek względem stanu po `dok/en/latki`, opis w `README.md`. Łatka Web-Aktualnosci cofa też `tresc_en` obron dodane przez `dok/en/latki`, więc kolejność nakładania ma znaczenie. Samego `dok/en/latki` nie zmieniałem.
- Nakładka zawiera łatki 14, 15, `dok/en/latki` i 16 (tylko `src/`).
- **Przywracanie nakładki:** skopiuj zawartość `.przekazanie/robocze/nakladka-przed-16/src/` na `src/`. Plik z końcówką `.BRAK.txt` oznacza, że przed zleceniem pliku nie było, więc przywrócenie to usunięcie (dotyczy `src/content/strony/o-stronie.md`).
- Nowe pole `jezyk` jest opisane w `.przekazanie/pola-do-cms.md`.

## Tłumaczenia do przejrzenia

### D4: tytuły w aktualnościach

| Wpis | Tytuł oryginalny | Tłumaczenie w nawiasie |
|---|---|---|
| `2019-09-27-konkurs-na-najlepsze-prace-dyplomowe` | Symetria jądra ciepła operatorów nielokalnych | Symmetry of the heat kernel of nonlocal operators |
| `2019-09-27-konkurs-na-najlepsze-prace-dyplomowe` | Regresja logistyczna – asymptotyczne własności estymatorów największej wiarygodności | Logistic regression – asymptotic properties of maximum likelihood estimators |
| `2019-09-27-konkurs-na-najlepsze-prace-dyplomowe` | O pewnych własnościach topologii logicznej | On some properties of the logic topology |
| `2019-09-27-konkurs-na-najlepsze-prace-dyplomowe` | Analiza niestandardowa i jej zastosowania | Nonstandard analysis and its applications |
| `2019-10-04-konkurs-na-najlepsza-prace-dyplomowa-wyniki-finalu` | Prostokątne grupy Coxetera o brzegu homeomorficznym z krzywą Mengera | Right-angled Coxeter groups with boundary homeomorphic to the Menger curve |
| `2024-12-01-wyniki-konkursu-na-najlepsza-prace-dyplomowa` | O reprezentacji w teorii operatorów Dunkla funkcji harmonicznych z warunkiem Carlesona | On the representation of harmonic functions satisfying the Carleson condition in Dunkl theory |
| `2024-12-01-wyniki-konkursu-na-najlepsza-prace-dyplomowa` | Zastosowanie operatora Steina do testowania zgodności z rozkładem Weibulla w obecności prawostronnego cenzurowania | Applying the Stein operator to goodness-of-fit testing for the Weibull distribution under right censoring |
| `2024-12-01-wyniki-konkursu-na-najlepsza-prace-dyplomowa` | Charakterystyka dominacji oraz krzywych Lorenza z zastosowaniem do testów ilorazu wiarogodności | Characterising dominance and Lorenz curves, with applications to likelihood ratio tests |
| `2024-12-01-wyniki-konkursu-na-najlepsza-prace-dyplomowa` | Dekompozycje grafów na grafy regularne | Decompositions of graphs into regular graphs |
| `2024-12-01-wyniki-konkursu-na-najlepsza-prace-dyplomowa` | Zastosowanie ukrytych modeli Markowa do klasyfikacji szeregów czasowych | Applying hidden Markov models to time series classification |
| `2026-04-20-konkurs-prac-dyplomowych` | Modelowanie wariantywności wewnątrzgatunkowej w mailach generowanych przez LLM | Modelling intra-genre variation in LLM-generated emails |
| `2026-04-20-konkurs-prac-dyplomowych` | Akcelerator graficzny fixed-pipeline oparty na FPGA | An FPGA-based fixed-pipeline graphics accelerator |
| `2026-04-20-konkurs-prac-dyplomowych` | Implementacja systemu dystrybucji powiadomień na platformie MS Teams w oparciu o architekturę chmurową MS Azure | Implementing a notification distribution system on the MS Teams platform using the MS Azure cloud architecture |
| `2026-04-20-konkurs-prac-dyplomowych` | Maszyna do rozwiązywania Sudoku | A Sudoku-solving machine |
| `2022-11-18-wyniki-konkursu-na-najlepsza-prace-dyplomowa` | Rozwiązanie problemu Waringa ze szczególnym uwzględnieniem zależności od wymiaru w oszacowania błędu. Znalezienie jawnych oszacowań dla błędów wyższego rzędu w pracy Vaughan-Wooley | Solving Waring's problem with particular attention to the dependence of the error estimates on the dimension. Finding explicit estimates for higher-order errors in the work of Vaughan and Wooley |

### D6: nazwy przedmiotów i systemów

| Strona | Było | Jest |
|---|---|---|
| `pierwszy-rok` | *Mój USOSweb* → *Grupy zajęciowe* | *Mój USOSweb* (My USOSweb) → *Grupy zajęciowe* (Class groups) |
| `pierwszy-rok` | *Mój USOSweb* → *Plany użytkownika* | *Mój USOSweb* → *Plany użytkownika* (User timetables) |
| `pierwszy-rok` | \| Analiza matematyczna 1 \| Mon 8 Feb | \| Analiza matematyczna 1 (Advanced calculus 1) \| Mon 8 Feb |
| `pierwszy-rok` | \| Analiza matematyczna I \| Wed 10 Feb | \| Analiza matematyczna I (Advanced calculus I) \| Wed 10 Feb |
| `pierwszy-rok` | \| Wstęp do matematyki R \| Thu 11 Feb | \| Wstęp do matematyki R (Introduction to abstract mathematics R) \| Thu 11 Feb |
| `pierwszy-rok` | \| Wstęp do matematyki \| Fri 12 Feb | \| Wstęp do matematyki (Introduction to abstract mathematics) \| Fri 12 Feb |
| `pierwszy-rok` | \| Algebra liniowa 1R \| Mon 15 Feb | \| Algebra liniowa 1R (Linear algebra 1R) \| Mon 15 Feb |
| `pierwszy-rok` | \| Algebra liniowa 1 and Algebra liniowa 1 (AI) \| Tue 16 Feb | \| Algebra liniowa 1 (Linear algebra 1) and Algebra liniowa 1 (AI) \| Tue 16 Feb |
| `pierwszy-rok` | - Analiza matematyczna 2 or Analiza matematyczna II | - Analiza matematyczna 2 (Advanced calculus 2) or Analiza matematyczna II (Advanced calculus II) |
| `pierwszy-rok` | - Algebra liniowa 2 or Algebra liniowa 2R | - Algebra liniowa 2 (Linear algebra 2) or Algebra liniowa 2R (Linear algebra 2R) |
| `pierwszy-rok` | - Programowanie 1 (Python) — compulsory | - Programowanie 1 (Python) (Programming 1 in Python) — compulsory |
| `pierwszy-rok` | **Warsztat informatyczny matematyka** (Computer skills workshop) | **Warsztat informatyczny matematyka** (Computing Workshop for Mathematicians) |
| `pierwszy-rok` | (groups marked "tylko dla SIAD") | (groups marked "tylko dla SIAD", i.e. SIAD students only) |
| `zajecia` | *Algebra liniowa 1R*, *Analiza matematyczna I* | *Algebra liniowa 1R* (Linear algebra 1R), *Analiza matematyczna I* (Advanced calculus I) |
| `zajecia` | *Analiza matematyczna* or *Algebra liniowa* sequence | *Analiza matematyczna* (Advanced calculus) or *Algebra liniowa* (Linear algebra) sequence |
| `zajecia` | *Zespołowy projekt specjalnościowy* | *Zespołowy projekt specjalnościowy*, in English Specialisation team project |
| `egzaminy-i-dyplom` | (course "Pisemny egzamin magisterski") | (course "Pisemny egzamin magisterski", in English Written Master's Examination) |

### D8: nazwy konkursów i programów

| Nazwa | Tłumaczenie w nawiasie |
|---|---|
| Krok w Przyszłość | Step into the Future |
| Perspektywy | Perspectives |
| POWROTY | Homing (nazwa programu Fundacji na rzecz Nauki Polskiej, była już w zajawce) |
| Iuvenes Wratislaviae | Young People of Wrocław |

Nazwy NCN (PRELUDIUM, SONATA, OPUS…) zostają bez tłumaczenia. „Krok w Przyszłość” ma jednolitą pisownię we wszystkich polach, także polskich, ale adresy (`krok-w-przyszlosc`) się nie zmieniają.

### D19: daty

Zmieniono 29 wierszy na trzech stronach. Przykłady:

| Strona | Było | Jest |
|---|---|---|
| `pierwszy-rok` | 29.09.2026 \| orientation day and matriculation (held) | 29 Sep 2026 \| orientation day and matriculation (held) |
| `pierwszy-rok` | 1.10.2026 \| inauguration of the academic year | 1 Oct 2026 \| inauguration of the academic year |
| `pierwszy-rok` | 2.10.2026 \| classes begin | 2 Oct 2026 \| classes begin |
| `pierwszy-rok` | 19.10.2026 \| the tutoring room opens | 19 Oct 2026 \| the tutoring room opens |
| `pierwszy-rok` | 12.11 and 13.11.2026 \| Rector's days (13.11 — University Day) | 12 and 13 Nov 2026 \| Rector's days (13 Nov — University Day) |
| `egzaminy-i-dyplom` | Written bachelor's exam (9:00–13:20) \| 13.02, resit 20.02 \| 29.06 \| 10.09 | Written bachelor's exam (9:00–13:20) \| 13 Feb, resit 20 Feb \| 29 Jun \| 10 Sep |
| `egzaminy-i-dyplom` | Written master's exam (9:00–11:00) \| 18.02 \| 26.06 \| 9.09 | Written master's exam (9:00–11:00) \| 18 Feb \| 26 Jun \| 9 Sep |
| `egzaminy-i-dyplom` | Oral master's exams \| 20.02 \| 30.06 \| 11.09 | Oral master's exams \| 20 Feb \| 30 Jun \| 11 Sep |

## Zrzuty `/en` przed i po (1440 px, jasny motyw)

Część stron różni się tylko pełną nazwą w stopce albo tekstem łatek. Zrzuty są przycięte do 1500 px wysokości.

Strona główna:

![Strona główna: przed i po](raport-zrzuty/z16-przed-po-glowna.jpg)

Instytut:

![Instytut: przed i po](raport-zrzuty/z16-przed-po-instytut.jpg)

Zakład:

![Zakład: przed i po](raport-zrzuty/z16-przed-po-zaklad.jpg)

Pracownicy:

![Pracownicy: przed i po](raport-zrzuty/z16-przed-po-pracownicy.jpg)

Granty:

![Granty: przed i po](raport-zrzuty/z16-przed-po-granty.jpg)

Grant z etykietą „Original title:”:

![Grant z etykietą „Original title:”: przed i po](raport-zrzuty/z16-przed-po-grant.jpg)

Obrony:

![Obrony: przed i po](raport-zrzuty/z16-przed-po-obrony.jpg)

Obrona:

![Obrona: przed i po](raport-zrzuty/z16-przed-po-obrona.jpg)

Seminaria:

![Seminaria: przed i po](raport-zrzuty/z16-przed-po-seminaria.jpg)

Seminarium z dopiskiem „(talk in Polish)”:

![Seminarium z dopiskiem „(talk in Polish)”: przed i po](raport-zrzuty/z16-przed-po-seminarium.jpg)

Studia:

![Studia: przed i po](raport-zrzuty/z16-przed-po-studia.jpg)

Pierwszy rok:

![Pierwszy rok: przed i po](raport-zrzuty/z16-przed-po-pierwszy-rok.jpg)

Zajęcia:

![Zajęcia: przed i po](raport-zrzuty/z16-przed-po-zajecia.jpg)

Egzaminy i dyplom:

![Egzaminy i dyplom: przed i po](raport-zrzuty/z16-przed-po-egzaminy.jpg)

Kierunek:

![Kierunek: przed i po](raport-zrzuty/z16-przed-po-kierunek.jpg)

Aktualności:

![Aktualności: przed i po](raport-zrzuty/z16-przed-po-aktualnosci.jpg)

Aktualność:

![Aktualność: przed i po](raport-zrzuty/z16-przed-po-aktualnosc.jpg)

Popularyzacja:

![Popularyzacja: przed i po](raport-zrzuty/z16-przed-po-popularyzacja.jpg)

Powiadomienia („przed” to strona 404, bo wersji angielskiej nie było):

![Powiadomienia („przed” to strona 404, bo wersji angielskiej nie było): przed i po](raport-zrzuty/z16-przed-po-powiadomienia.jpg)

Strona 404:

![Strona 404: przed i po](raport-zrzuty/z16-przed-po-404.jpg)

Telefon (390 px), po zmianach:

![Telefon: główna, Studia, Obrony, Powiadomienia, 404](raport-zrzuty/z16-telefon.jpg)

Ciemny motyw (1920 px), po zmianach:

![Ciemny motyw: główna, Studia, Obrony](raport-zrzuty/z16-ciemny-1920.jpg)

## Pytania

1. **Minione obrony po polsku:** na polskich stronach nadal stoi „Zapraszamy na publiczną obronę” po terminie. Ten tekst pochodzi z treści wpisów, nie z kodu, i zlecenie go nie obejmuje. Czy zrobić dla wersji polskiej to samo, co dla angielskiej (tekst z danych, dobierający czas)?
2. **„dr, prof. UWr”:** zlecenie opisuje tylko „dr hab. X, prof. UWr → Prof. X”. Daję „Dr X”. Czy tak zostawić?
3. **„Mathematical Analysis” czy „Advanced calculus”:** USOS używa „Advanced calculus” i tak jest teraz w nawiasach z D6, a strona skryptów i tabela struktury w „First year” mają „Mathematical Analysis”. Czy ujednolicić? Na razie zostawiłem, bo D6 każe trzymać nazwę z USOS przy nazwie polskiej, a tamte miejsca to nie są nazwy z USOS.
4. **„Iuvenes Wratislaviae”:** przetłumaczyłem jako „Young People of Wrocław”. To moje tłumaczenie; nie sprawdzałem, czy istnieje oficjalna angielska nazwa. Zostawić je czy samą nazwę łacińską?
5. **Strona główna:** „Admission ↗” i „Study mathematics in Wrocław ↗” prowadzą na tę samą polską stronę co menu, ale są bez „(in Polish)”, bo D20 mówi o menu. Czy dodać? To mała zmiana w kodzie.
6. **USOSweb:** bez dopisku, bo system ma wersję angielską, ale automatyczne pobranie się nie udało. Sprawdzisz po zalogowaniu?
7. **Wpisy testowe** („Testowe: …”, „Mister Test”) nadal są w danych i dostają tłumaczenia z łatek. Usunięcie należy do redakcji.

## Załącznik: 31 nazw przedmiotów bez angielskiej nazwy w USOS

Do zatwierdzenia. Plik: `src/lib/en/plan.ts`.

| Kod USOS | Nazwa (PL) | Proponowana nazwa (EN) |
|---|---|---|
| `28-MT-S-oObow4` | Grafy i algorytmy | Graphs and Algorithms |
| `28-MT-S-oPWarAI` | Podstawowy warsztat AI | Basic AI Workshop |
| `28-MT-S-oObow5` | Programowanie 2 (Python) (AI) | Programming 2 (Python) (AI) |
| `28-MT-S-oObow3` | Rachunek prawdopodobieństwa (AI) | Probability Theory (AI) |
| `28-MT-S-oObow1` | Warsztat informatyczny matematyka | Computing Workshop for Mathematicians |
| `28-MT-S-oObow2` | Wstęp do kombinatoryki | Introduction to Combinatorics |
| `28-MT-S-tNielRDyf` | Nieliniowe równania dyfuzji | Nonlinear Diffusion Equations |
| `28-MT-S-tTopologia2R` | Topologia 2 R | Topology 2 R |
| `28-MT-S-qAnRyzP` | Analiza ryzyka płynności i nadmiernej koncentracji | Analysis of Liquidity Risk and Excessive Concentration |
| `28-MT-S-qGrOl` | Grupy olighomorficzne | Oligomorphic Groups |
| `28-MT-S-qKurProLDr` | Kurs programowania trajektorii lotu dronów | Programming Drone Flight Trajectories |
| `28-MT-S-qMetProb` | Metoda probabilistyczna | The Probabilistic Method |
| `28-MT-S-qTopos` | Toposy | Toposes |
| `28-MT-S-uWarPomDyd` | Warsztaty pomocy dydaktycznych | Teaching Aids Workshop |
| `28-MT-S-yPisEgzLic` | Pisemny egzamin licencjacki 1 | Written Bachelor’s Examination 1 |
| `28-MT-S-yPisEgzLic2` | Pisemny egzamin licencjacki 2 | Written Bachelor’s Examination 2 |
| `28-MT-S-yPisEgzMgr` | Pisemny egzamin magisterski 1 | Written Master’s Examination 1 |
| `28-MT-S-yPisEgzMgr2` | Pisemny egzamin magisterski 2 | Written Master’s Examination 2 |
| `28-MT-S-yPisEgzWst` | Pisemny egzamin wstępny | Written Entrance Examination |
| `28-MT-S-oPodStatAI` | Podstawy statystyki (AI) | Foundations of Statistics (AI) |
| `28-MT-S-oProjKarAI` | Projektowanie kariery zawodowej | Career Planning |
| `28-MT-S-oUczMaszAI` | Uczenie maszynowe (AI) | Machine Learning (AI) |
| `28-MT-S-oZaaWarAI` | Zaawansowany warsztat AI | Advanced AI Workshop |
| `28-MT-S-lMatPodSiecN` | Matematyczne podstawy sieci neuronowych | Mathematical Foundations of Neural Networks |
| `28-MT-S-t0122` | Inteligentne systemy decyzyjne - praktyka nowoczesnego matematyka | Intelligent Decision Systems: the Practice of a Modern Mathematician |
| `28-MT-S-tMUbezpZdr` | Matematyka ubezpieczeń zdrowotnych | Health Insurance Mathematics |
| `28-MT-S-tTopologia1R` | Topologia R | Topology R |
| `28-MT-S-qPAktFin` | Przegląd aktuarialno-finansowy | Actuarial and Financial Mathematics Survey |
| `28-MT-S-qSemNaucz` | Seminarium dla nauczycieli | Seminar for Teachers |
| `28-MT-S-qSpacLosZ` | Spacery losowe i ich zastosowania | Random Walks and Their Applications |
| `28-MT-S-qUczWzmZ` | Uczenie ze wzmocnieniem i zastosowania | Reinforcement Learning and Its Applications |

## Załącznik: notki patronów po angielsku

Do zatwierdzenia. Plik: `src/lib/patroni.ts`. „Autor twierdzenia Knastera–Tarskiego” jest przetłumaczone jako „co-author”, bo twierdzenie ma dwóch autorów.

| Pole | PL | EN |
|---|---|---|
| Marczewski — notka (baner Instytutu) | Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962. Zabiegał o budowę gmachu Instytutu. | A co-founder of Wrocław mathematics and Rector of the University in 1957–1962. He campaigned for the construction of the Institute building. |
| Marczewski — fakt (okładka) | Pierwszy dyrektor Instytutu. | The Institute’s first director. |
| Ślebodziński — notka (baner Nauki) | Geometra różniczkowy. W 1931 roku wprowadził pochodną Liego, dziś jedno z podstawowych narzędzi geometrii. | A differential geometer. In 1931 he introduced the Lie derivative, now one of the basic tools of geometry. |
| Ślebodziński — fakt | Wprowadził pochodną Liego. | Introduced the Lie derivative. |
| Knaster — notka (baner Studiów) | Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym. Wychował pokolenia wrocławskich matematyków. | A topologist and co-author of the Knaster–Tarski fixed-point theorem. He trained generations of Wrocław mathematicians. |
| Knaster — fakt | Topolog, oddany dydaktyce. | A topologist devoted to teaching. |
| Steinhaus — notka (baner Popularyzacji) | Współtwórca szkoły lwowskiej i wrocławskiej, mistrz matematycznego aforyzmu i popularyzacji. | A co-founder of the Lwów and Wrocław schools of mathematics, and a master of the mathematical aphorism and of popularisation. |
| Steinhaus — fakt | „Między duchem a materią pośredniczy matematyka”. | “Mathematics mediates between mind and matter.” |
