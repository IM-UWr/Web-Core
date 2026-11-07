# Raport: zlecenie 29 — specjalności i strona działu Popularyzacja jako Markdown (7.11.2026)

Etapy 1–4 zrobione, kryteria odbioru lokalnego spełnione (4 akapity EN „No. …” pogrubione po decyzji właściciela). Etap 5: wynik pushu i podglądu jest w sekcji „Push i podgląd”. Test w prawdziwym CMS robi właściciel. Polecenie dotyczyło tylko zlecenia 29, więc nie zaczynam 30.

## Etapy i commity

Wszystko na gałęzi `wyglad/zlecenie-16`, tylko lokalnie.

| Etap | Repozytorium | Commit | Co |
| --- | --- | --- | --- |
| 1 | Web-Core | `0715563b` | Specjalność z jednego Markdownu i pliku „Baner i kafelek”: kotwice z typem, sekcje liczone (wstawki), wtyczka bloków, kolekcje, widok; testy |
| 2 | Web-Core | `5d4f3c32` | Popularyzacja: tekst „O popularyzacji” z Markdownu (`src/data/popularyzacja.md`) |
| 3 | Web-Core | `db36b984` | Skrypty migracji, jeden szablon formularza specjalności, `sprawdz_tresci.py`, ściągawka |
| 3 | Web-Spec-Analiza-Danych | `a249995`, `e10514d` | Treść i baner; formularze |
| 3 | Web-Spec-Aktuarialno-Finansowa | `9ce52b7`, `72bc53e` | jw. |
| 3 | Web-Spec-Nauczycielska | `e3a3ea7`, `ddc9f4b` | jw. |
| 3 | Web-Spec-Stosowana | `5021e9d`, `4806331` | jw. |
| 3 | Web-Spec-Teoretyczna | `22c7dc7`, `4f89fa8` | jw. |
| 3 | Web-Studia | `9e28ae7`, `55e1a55` | Matematyka w ekonomii (wygaszana): treść i baner; formularz (i 2 linijki w opisach „Kierunków”, zob. uwaga 3) |
| 2, 3 | Web-Popularyzacja | `6608b03`, `a4f50c8` | `popularyzacja.md` zamiast `.json`; formularz „Strona działu Popularyzacja” |
| 4 | Web-Core | `ec2bc857` | Raport i zrzuty |
| 4 (decyzja 1) | Web-Spec-Analiza-Danych, Web-Spec-Nauczycielska | `eb14354`, `891742b` | Pogrubione „No.” na początku 4 odpowiedzi EN (zapis w edytorze ich nie psuje) |
| 4 | Web-Core | ten commit | Raport po decyzji i po „push” |

Nad `origin`: Web-Core 12 commitów (z 28), Web-Studia 5 (z 28), Web-Ustawienia 2 (z 28), Web-Popularyzacja 2, Web-Spec-Analiza-Danych i Web-Spec-Nauczycielska po 3, pozostałe Web-Spec-* po 2. Po „push” wyślę wszystkie 9 repozytoriów razem i sprawdzę przebieg Web-Podglad.

## Co widzi edytor

- **Web-Spec-* → „Specjalność: …” → Treść:** Nazwa, Treść (Markdown, cała strona), Nazwa EN, Treść EN. Pięć formularzy jest identycznych poza nazwą, bo powstają z jednego szablonu `skrypty/migracja/specjalnosc.pages.yml` (wstawia go `formularze_specjalnosci.py`).
- **… → Baner i kafelek:** osobny plik `src/content/specjalnosci-baner/<id>.json`. Pola: kierunek, kolejność i dwa zdania kafelka, skrót, poziom, zdanie pod nazwą, hasło, zakład, opiekunowie, seminaria, wygaszana, niżej wersje EN. Ukryte są `zrodla` i `do_uzupelnienia`. Listy kierunku, zakładu i seminariów zostają stałe, jak dotąd.
- **Web-Studia → „Specjalność wygaszana: Matematyka w ekonomii”:** ten sam szablon. Pole „Kierunek” jest odnośnikiem do kolekcji kierunków, jak dotąd.
- **Web-Popularyzacja → Strona działu Popularyzacja** (pierwsza pozycja, osobno od „Stron Popularyzacji”): Tytuł, Treść, Tytuł EN, Treść EN. Niżej: tekst pod tytułem, hasło, „W skrócie”, lata tradycji, wersje EN. Pole `linki` jest ukryte, bo strona go nie czyta (grupy linków nad tekstem są z menu działu). Sprawdziłem to w kodzie sprzed zlecenia.
- Opis pola „Treść” to ściągawka z `dok/sciagawka-edytora.md`. Ma linijki o sekcjach liczonych („Seminaria”, „Opiekun specjalności”, ramka „Wybór specjalności”) i listę stałych kotwic strony. Pola są w `.przekazanie/pola-do-cms.md`, sekcja „Zlecenie 29”.

**Sekcje liczone zostają liczone.** Seminaria biorą się z pola „Seminaria”, opiekunowie ze spisu pracowników (z zakładem pod spodem), a ramka „Wybór specjalności” linkuje do terminów kierunku. Każda ma kotwicę w `src/plugins/kotwice.mjs` (`#seminaria`, `#opiekun`, `#wybor`).
- Strona wstawia sekcję pod nagłówkiem o tej nazwie.
- Bez nagłówka wstawia ją w dzisiejszym miejscu.
- Bez danych sekcji nie ma.
- Nagłówek opiekuna ma liczbę z danych („Opiekun” albo „Opiekunowie specjalności”).

Migracja wpisała nagłówki „Seminaria” (4 specjalności; Nauczycielska seminarium nie ma) i „Opiekun specjalności” (5) w dzisiejszej kolejności, PL i EN.

## Migracja

| Specjalność | Przeniesione | Pominięte | Sekcje | Punkty list | Pytania | Pola banera |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Analiza danych | 351 | 7 | 12 | 69 | 8 | 19 |
| Matematyka aktuarialno-finansowa | 336 | 7 | 12 | 71 | 7 | 19 |
| Matematyka nauczycielska | 420 | 7 | 11 | 88 | 8 | 17 |
| Matematyka stosowana | 419 | 7 | 12 | 86 | 8 | 19 |
| Matematyka teoretyczna | 447 | 7 | 12 | 96 | 8 | 18 |
| Matematyka w ekonomii (bez podstrony) | 8 | 1 | 0 | 0 | 0 | 6 |
| **Razem** | **1981** | **36** | | | | |

Pominięte (36):
- 30 × ikony kafelków „Dlaczego warto”: strona ich nie pokazywała;
- 6 × `opublikowany`: domyślnie „tak”.

**Popularyzacja:** 42 wartości przeniesione, 0 pominiętych. Treść ma 5 akapitów, „W skrócie” 4 pozycje, tradycja 3 i ukryte linki 3.

Oba skrypty na końcu sprawdzają, że każda stara wartość jest w nowych plikach albo na liście pominiętych. Drugiego uruchomienia na przerobionych plikach odmawiają (sprawdzone). Puściłem je jeszcze raz na kopiach starych plików z historii: dają pliki identyczne z commitami migracji (późniejsze pogrubienie „No.” to osobny commit, decyzja 1). Stare pliki są w historii repozytoriów (np. Web-Spec-Stosowana `07d8459`, Web-Popularyzacja `53f6556`).

## Porównanie przed/po

- **Przed:** Web-Core `05886991` z klonami sprzed zlecenia. **Po:** obecny kod z klonami po zleceniu.
- Oba buildy z czystą pamięcią podręczną. HTML normalizowany skryptem.
- Wynik: 749 stron HTML i 1481 plików; różni się 112 plików: 10 stron specjalności i szum.
- Identyczne są: kafelki specjalności na stronach kierunków, `/studia`, `/popularyzacja` PL i EN (z kartami „Dla kogo” i grupami linków), okładka, menu, spis pracowników i kalendarium.

| Różnica | Gdzie | Ocena |
| --- | --- | --- |
| Style treści specjalności przeniesione z zakresu komponentu do globalnych z prefiksem `.tresc[data-specjalnosc]` (treść z `set:html`), bez `data-astro-cid-*` w treści, nowy atrybut `data-specjalnosc` | 10 stron | style i położenie każdego elementu treści sprawdzone skryptem w przeglądarce (1440 i 390 px, PL i EN): identyczne |
| `id` przy 48 nagłówkach `###` (kotwice) | 10 stron | bez zmiany wyglądu, jak na kierunkach w 28 |
| Typograficzne apostrofy (’) w tekście EN | 5 stron EN | jak na pozostałych stronach EN z Markdownu; jedyny ślad w pomiarze to 1 px szerokości tematu „Algebry Boole’a z miarą” |
| `.ics`: tylko `DTSTAMP`; kolejność `sitemap.xml` (ta sama zawartość); czas w `powiadomienia.json`; indeks wyszukiwarki | 102 pliki | szum |

**Zrzuty.** Różnice w HTML są niewidoczne. Zrzuty przed i po strony Matematyka stosowana (od początku treści do końca „Jak przebiega specjalność”, PL, 1440 i 390 px) są identyczne co do piksela. Dlatego zostawiłem tylko wersję „po”: `raport-zrzuty/z29-stosowana-1440.jpg` i `z29-stosowana-390.jpg`.

**Przyjąłem:**
1. Tematy prac zostają w dzisiejszym wyglądzie: lista z kreskami, dopisek „— …” na szaro. W Markdownie to zwykła lista „Tytuł — dopisek”. Na stronie EN polski tytuł dostaje `lang="pl"`, jak dotąd.
2. „Dla kogo” to cytat zaczynający się pogrubionym „Dla kogo” („Who is it for”), a strona robi z niego ramkę, jak dotąd.
3. Migracja nie wpisuje nagłówka „Wybór specjalności”. Ramka stoi na końcu „Jak przebiega specjalność” i nie ma osobnej pozycji w spisie, jak dotąd. Edytor może dopisać taki nagłówek: wtedy ramka trafi pod niego.
4. „Przydatne strony” na specjalności to zawsze zwykłe linki. Link USOS kończy się na `.php`, więc bez tego wtyczka zrobiłaby z sekcji listę plików z ikonami. Znalazłem to w porównaniu i poprawiłem przed commitem.
5. Tekst „O popularyzacji” przechodzi przez wtyczkę bloków, więc kafelki i listy plików z ściągawki działają też tam. Dzisiejsze akapity wychodzą bez zmian.

## Zapis w edytorze

Symulacja jak w 28, etap 6a (`skrypty/test-edytora/symulacja.mjs`, TipTap 3 z `@tiptap/markdown`). Każdy plik specjalności i `popularyzacja.md` (Treść i Treść EN) wczytałem i zapisałem bez zmian, potem zbudowałem stronę i porównałem z „po”:
- Popularyzacja: Markdown bez zmian, strona identyczna.
- Specjalności: zapis zmienia 4 linie, strona różni się tylko w nich:
  - 2 odpowiedzi w FAQ EN Analizy danych i 2 w FAQ EN Matematyki nauczycielskiej zaczynają się od „No. …”;
  - edytor zapisuje każdą z nich jako listę numerowaną „1. …”, a słowo „No” znika.

To cecha edytora, nie strony. Wtyczka nie może tego naprawić, bo po zapisie słowa już nie ma w pliku.
- TipTap 3.33 bierze „Xy. ” na początku akapitu za punkt listy alfabetycznej. Dotyczy to wielkiej litery, małej litery, kropki i spacji: „Np. ”, „Nr. ”, „Dr. ”, „St. ”, „No. ”.
- Bezpieczne są skróty w środku akapitu, po Shift+Enter, w punkcie listy, małą literą („ul.”, „pl.”) i jednoliterowe („B. Krause”).
- Ukośnik (`No\.`) ani encja (`&#32;`) nie pomagają, za to pogrubienie („**No.** …”) wytrzymuje zapis.
- W całej treści wszystkich 21 repozytoriów takie akapity są tylko te 4.

Do ściągawki i opisów pola „Treść” (specjalności, Popularyzacja i kierunki) dopisałem ostrzeżenie.

**Decyzja 1 (właściciel, 7.11):** pogrubić. Cztery odpowiedzi zaczynają się teraz od „**No.**”. Symulowany zapis tych plików nie zmienia żadnej linii, także drugi zapis z rzędu. W całej treści nie ma już akapitu, który edytor zamieniłby na listę. Na stronie zmieniło się tylko pogrubienie „No.” w tych 4 odpowiedziach EN. Zrzutów nie ma, bo według zlecenia robię je tylko po polsku, a strony PL są bez zmian.

## Kryteria odbioru

- [x] Specjalność: formularz „Treść” (4 pola) i osobno „Baner i kafelek”, we wszystkich 6 (5 × Web-Spec-*, Web-Studia).
- [x] Popularyzacja: „Strona działu” z Treścią na górze; karty „Dla kogo” bez zmian (HTML identyczny).
- [x] Wszystkie wartości przeniesione (1981 + 42) albo zgłoszone z powodem (36).
- [x] Porównanie przed/po: tylko zgłoszone i uzasadnione różnice (tabela wyżej).
- [x] `sprawdz_pola_cms.py`: 586 plików w 21 repozytoriach, 0 problemów. Próba z dopisanym polem w treści i w banerze: oba wykryte.
- [x] `sprawdz_tresci.py`: OK (553 pliki). Doszło sprawdzenie banerów specjalności (specjalność, kierunek i seminaria istnieją, opiekunowie mają nazwisko) i `popularyzacja.md`.
- [x] `astro check`: 6 błędów, te same co przed zleceniem (`process` i `node:*` w `astro.config.mjs` i `src/lib/zdjecia.ts`), żadnych uwag w zmienionych plikach.
- [x] Testy wtyczki: 23/23 (4 nowe dla specjalności).
- [x] Symulowany zapis w edytorze nie zmienia strony (po pogrubieniu „No.” w 4 odpowiedziach EN, decyzja 1).
- [ ] Test w prawdziwym CMS: po „push”.

## Gałąź domyślna repozytoriów treści

- Wszystkie 7 repozytoriów mają gałąź domyślną `main`.
- Od rozejścia z `wyglad/zlecenie-16` na `main` nie ma żadnego nowego commitu (`git fetch` 7.11, 14:20), więc nie ma edycji do przeniesienia.
- Edycję specjalności albo Popularyzacji zrobioną na `main` przed scaleniem trzeba będzie przenieść ręcznie, bo skrypty migracji nie pracują na przerobionych plikach.

## Odstępstwa i uwagi

1. W głównym drzewie Web-Core uruchomiłem `pobierz_tresci.py --help`, żeby zobaczyć opcje.
   - Skrypt nie zna `--help`, więc pobrał treści z `main` i nałożył je na główne drzewo (stary format specjalności i kierunków).
   - Po ok. minucie nałożyłem z powrotem lokalne klony: `--lokalnie`, 1210 plików, wszystkie 21 klonów na `wyglad/zlecenie-16`.
   - Serwery dev 4321/4322 w tym czasie nie działały.
   - Nakładka w głównym drzewie jest teraz równa klonom.
2. Wtyczka bloków się zmieniła, więc serwer dev trzeba uruchomić od nowa z `--force`.
3. Web-Studia, grupa „Kierunki” (spoza zlecenia, 2 linijki):
   - w opisie Treści jest ostrzeżenie o skrótach;
   - w opisie grupy było „Specjalności edytuje się w sekcji „Specjalności””, a takiej sekcji w Web-Studia nie ma; teraz wskazuje repozytoria Web-Spec-*.
4. Sprawy „strony bezobsługowej” dla nowych seminariów i specjalności nie ruszałem: listy wyboru zostają stałe, zgodnie ze zleceniem.

## Pytania

1. ~~Czy pogrubić „No.” w 4 odpowiedziach EN?~~ Decyzja: tak, zrobione (`eb14354`, `891742b`).
