# Raport: zlecenie 28 — kierunki jako jeden Markdown, bloki z tekstu (7.11.2026)

**Aktualizacja 7.11, ok. 14:40:** etap 7 zrobiony razem z pushem po zleceniu 29. Wszystko jest na `origin/wyglad/zlecenie-16`, podgląd jest zbudowany, a `test-cms` w Web-Studia i Web-Ustawienia czeka na etap 8. Szczegóły: `RAPORT-ZLECENIE-29.md`, sekcje „Push i podgląd” i „Test w CMS”.

Etapy 0–6a zrobione lokalnie, kryteria odbioru lokalnego spełnione. **Nic nie jest wysłane na GitHub.** Czekam na „push” (etap 7), potem test w prawdziwym CMS (etap 8). Polecenie dotyczyło tylko zlecenia 28 (nie tryb bez nadzoru), więc nie zaczynam 29. Numer 28 był wolny.

## Etapy i commity

Wszystko na gałęzi `wyglad/zlecenie-16`, tylko lokalnie.

| Etap | Repozytorium | Commit | Co |
| --- | --- | --- | --- |
| 1 | Web-Core | `a07f05ed` | Wtyczka bloków: linie punktu (pary, przyciski), oś z listy numerowanej (kroki sklejane bez Shift+Enter), kontakty, listy plików, pytania z `### …?`, sekcje kierunku, kotwice; testy |
| 2 | Web-Core | `f3fa449a` | Model danych: kierunek (nazwa, treść, nazwa EN, treść EN), baner, lista menu i kafelków w Ustawieniach, przypomnienia w `src/data/przypomnienia.json` (UID jak dotąd) |
| 3 | Web-Core | `dc14a7ce` | Szablon kierunku z jednego Markdownu: sekcje, bloki, zakładki programów z `###`, kafelki specjalności |
| 4 | Web-Core | `eca4cafd` | Skrypt migracji `skrypty/migracja/kierunki.py` (ze sprawdzeniem każdej wartości) |
| 4 | Web-Studia | `320cefb` | 4 kierunki jako Markdown, banery w `src/content/kierunki-baner/`, `src/data/przypomnienia.json` |
| 4 | Web-Studia | `63ad234` | Matematyka, pytanie o program: „Wybierz zakładkę ze swoim programem…” (PL i EN) |
| 4 | Web-Ustawienia | `24dbf2d` | Jedna lista `studia.kierunki` (menu „Studia” i kafelki strony głównej) |
| 5 | Web-Studia | `98af815` | Formularze: grupa „Kierunki” (Treść, Baner), „Przypomnienia o terminach”; pole `kierunek` w banerach |
| 5 | Web-Ustawienia | `09431de` | Formularz listy kierunków |
| 5 | Web-Core | `7f0fbff5` | Ściągawka `dok/sciagawka-edytora.md`, pole `kierunek` banera, `sprawdz_tresci.py` dla nowych plików |
| 6 | Web-Core | `60193f77` | Poprawka regresji z etapu 1: kafelek „Dla nauczycieli” (linia z dwukropkiem pod samym tytułem to opis) |
| 6a | Web-Core | `a53a92a6` | Symulacja zapisu w TipTap (`skrypty/test-edytora/`), wtyczka `remark-wzory-edytora.mjs` |
| — | Web-Core | ten commit | Raport i zrzuty |

Nad `origin`: Web-Core 8 commitów (od `62b40a19`), Web-Studia 3 (od `910f99c`), Web-Ustawienia 2 (od `8c58e68`). Po „push” wyślę wszystkie trzy razem, sprawdzę przebieg Web-Podglad i założę `test-cms`.

## Co widzi edytor

- **Web-Studia → Kierunki → Treść:** Nazwa, Treść (Markdown), Nazwa EN, Treść EN.
- **Web-Studia → Kierunki → Baner:** osobny formularz i osobny plik `kierunki-baner/<kierunek>.json`. Kierunek bez banera ma w nagłówku samą nazwę, a opis w meta to pierwsze zdanie treści.
- **Web-Studia → Przypomnienia o terminach:** osobny plik.
- **Web-Ustawienia → Ustawienia:** lista „Kierunki w menu „Studia” i kafelki na stronie głównej”. Kolejność na liście to kolejność w menu i na kafelkach; pola `w_menu` i `na_stronie_glownej`.
- Ściągawka: `dok/sciagawka-edytora.md` (tekst ze zlecenia, przykłady, tabela „Gdzie co jest”). Pola: `.przekazanie/pola-do-cms.md`, sekcja „Zlecenie 28”.

## Migracja

| Kierunek | Przeniesione | Pominięte | Sekcje | Punkty list | Wiersze tabel | Pytania | Przypomnienia |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Matematyka | 319 | 39 | 11 | 40 | 9 | 7 | 3 |
| SIAD | 146 | 21 | 10 | 21 | 3 | 5 | 0 |
| ISIM | 249 | 23 | 10 | 29 | 27 | 11 | 0 |
| Szkoła doktorska | 309 | 27 | 9 | 50 | 8 | 8 | 0 |
| **Razem** | **1023** | **110** | 40 | 140 | 47 | 31 | 3 |

Lista menu i kafelków: 4 kierunki i dawny „dodatkowy kafelek” Podyplomowe (poza menu, jak dotąd).

Pominięte wartości (110):
- 27 × przyciski Matematyki, ISIM i SIAD (po 9): strona kierunku ich nie pokazywała, pokazywała tylko przyciski Szkoły doktorskiej.
- 24 × `od_roku` i `do_roku` programów: służyły tylko liście wyboru roku, którą zlecenie usuwa.
- 20 × `etapy[].stopien`: zastępuje je podsekcja osi `### Studia I stopnia` / `### Studia II stopnia`.
- 17 × ikony kafelków „Dlaczego warto”: strona ich nie pokazywała.
- 12 × pola przypomnień w terminach Matematyki (`data`, `przypomnienie`, `dni_przed`, `co_roku`): przeniesione do `src/data/przypomnienia.json` jako 3 przypomnienia.
- 4 × `kolejnosc`: zastępuje je miejsce na liście w Ustawieniach.
- 4 × `opublikowany`: domyślnie „tak”.
- 2 × nazwa jedynego programu SIAD (PL i EN): przy jednym programie nie było zakładek, więc nazwa się nie wyświetlała.

Stare pliki zostają w historii Web-Studia (`910f99c`). Skrypt na końcu sprawdza, że każda stara wartość jest w nowych plikach albo na liście pominiętych. Drugiego uruchomienia na przerobionych plikach odmawia. Puściłem go jeszcze raz na kopii starych plików: daje te same pliki co w klonie, poza zdaniem poprawionym w `63ad234`.

## Porównanie przed/po

- **Przed:** Web-Core `62b40a19` z klonami sprzed zlecenia.
- **Po:** `a53a92a6` z klonami po zleceniu.
- Oba buildy z czystą pamięcią podręczną (`.astro`, `node_modules/.astro`). HTML normalizowany skryptem.
- Wynik: 859 plików, różni się 111.

| Różnica | Gdzie | Ocena |
| --- | --- | --- |
| Brak listy „Rozpocząłem / rozpoczęłam studia w roku” i zdania „Program zależy od roku…” | Matematyka, ISIM, Szkoła doktorska, PL i EN (SIAD ma jeden program i listy nie miał) | dozwolona |
| „Szczegóły egzaminów…” i „Wszystkie formularze…” jako zwykły akapit: 17 px w kolorze tekstu zamiast 15,5 px na szaro | Matematyka (oś, terminy), ISIM i SIAD (terminy) | dozwolona; styl się zmienił, są zrzuty |
| „Wybierz swój rok…” → „Wybierz zakładkę ze swoim programem…” | Matematyka, pytanie o program, PL i EN | dozwolona |
| `id` przy nagłówkach `###` (kotwice) | 4 kierunki | bez zmiany wyglądu |
| `data-limit-linii="2"` przy nagłówkach tabel i w kolumnie „Formularz” | tabele terminów | tak jak w innych tabelach z Markdownu; pomiar bez problemów |
| Typograficzne apostrofy (’) w tekście EN | 4 kierunki EN | tak jak na pozostałych stronach EN z Markdownu |
| Brak `data-od` i `data-do` przy zakładkach programów | Matematyka, ISIM, Szkoła doktorska | atrybuty usuniętej listy roku |
| Style treści kierunku przeniesione z zakresu komponentu do globalnych (treść z `set:html`) | 4 kierunki | style każdego elementu sekcji sprawdzone skryptem; identyczne |
| `.ics`: zmienia się tylko `DTSTAMP` (czas budowy) | 100 plików | szum; UID bez zmian |
| Kolejność w `sitemap.xml`, skrót indeksu `pagefind-entry.json` (366 stron, jak przed), czas w `powiadomienia.json` | 3 pliki | szum |

Bez zmian: menu, strona główna z kafelkami, `/studia`, kalendarium, wszystkie pozostałe strony, etykiety spisu.

**Zrzuty.** Tylko sekcje z różnicą, przed/po, 1440 i 390 px, PL; 28 plików `raport-zrzuty/z28-<kierunek>-<sekcja>-<szerokość>[-przed].jpg`:
- matematyka: przebieg, terminy, program;
- isim: terminy, program;
- siad: terminy;
- szkola-doktorska: program.

Pytanie o program zmienia tylko tekst, więc nie ma zrzutu.

**Pomiar szerokości** (`skrypty/szerokosci/`), 4 kierunki PL i EN: 96 renderów przed i 96 po. Układ jest identyczny (spis, przejście na widok telefonu), 0 problemów. Strony są 90–117 px niższe, bo nie ma listy roku.

**Przypomnienia:** 16 wydarzeń z przypomnień w `.ics` ma te same UID i daty co przed.

## Etap 6a: zapis w edytorze

**Symulacja.** `skrypty/test-edytora/symulacja.mjs` uruchamia TipTap 3.x z `@tiptap/markdown` bez przeglądarki (happy-dom), z rozszerzeniami jak w Pages CMS. Zależności są tylko w tym katalogu. Każdy plik kierunku (PL i EN) wczytałem i zapisałem bez zmian:
- zapis zmienia 254 linie Markdownu: wyrównuje tabele spacjami, zmienia wcięcia linii w punktach, dodaje puste linie;
- strona zbudowana z tych plików jest identyczna z „po” na wszystkich 8 stronach kierunków.

**Wzór `$\ell^2$` w akapicie.**
- Edytor zapisuje go jako `$\\ell^2$`, a KaTeX pokazałby `\\` jako nową linię.
- Poprawka: wtyczka `src/plugins/remark-wzory-edytora.mjs` (działa w treści kierunku) cofa ukośniki dopisane przez edytor: `\\ell` → `\ell`, `a\_1` → `a_1`, `x^\*` → `x^*`. Test jest w `rehype-bloki.test.mjs`.

**Czego nie da się cofnąć.** Edytor traci to już przy wczytaniu:
- ukośnik przed `{`, `}` i `|` we wzorze: `$\{x\}$` → `${x}$`;
- dwa `_` w jednym akapicie mogą zamienić się w kursywę.

Dziś kierunki nie mają żadnego wzoru. Wzory są w 1 aktualności i 1 testowym referacie, czyli w innych formularzach z tym samym edytorem. Zob. pytanie 1.

## Kryteria odbioru

- [x] Formularz kierunku: Nazwa, Treść, Nazwa EN, Treść EN. Baner i przypomnienia osobno, menu i kafelki w Ustawieniach.
- [x] Wszystkie wartości z 4 starych plików są w nowych plikach albo w raporcie jako pominięte z powodem (110).
- [x] Porównanie przed/po pokazuje tylko dozwolone różnice. Menu, kafelki, kalendarium i UID w `.ics` bez zmian.
- [x] Wtyczka bloków: 19 testów zielonych, w tym oś wpisana samymi Enterami.
- [x] Próbny `kierunki/proba.md` bez banera i spoza listy:
  - build przechodzi; strona jest po polsku i angielsku (EN z polską treścią, bo nie ma Treści EN);
  - kierunek jest w menu „Studia” na końcu grupy „Kierunki”, na `/studia`, jako ostatni kafelek strony głównej („Kierunek”, nazwa, pierwsze zdanie) i w `sitemap.xml`;
  - opis w meta to pierwsze zdanie;
  - plik usunięty.
- [x] `sprawdz_pola_cms.py`: 580 plików w 21 repozytoriach, 0 problemów. Skrypt czyta formularze z `.pages.yml`, więc nowe kolekcje objął bez zmian w kodzie.
- [x] `sprawdz_tresci.py`: OK (546 plików).
- [x] `astro check`: 6 błędów, te same co przed zleceniem (`process` i `node:*` w `astro.config.mjs` i `src/lib/zdjecia.ts`).
- [x] Etap 6a: symulowany zapis w edytorze nie zmienia strony.
- [ ] Etap 8 (test w prawdziwym CMS): nie zrobiony, będzie po „push”.

## Gałąź domyślna repozytoriów treści

- Web-Studia i Web-Ustawienia mają gałąź domyślną `main` (Web-Studia `a8d13d3`, Web-Ustawienia `bbebd7f`).
- Od rozejścia z `wyglad/zlecenie-16` na `main` nie ma nowych commitów (`git fetch` 7.11, 13:30), więc nie ma edycji kierunków do przeniesienia.
- Edytorzy pracują w Pages CMS na `main` i do scalenia nie widzą nowych formularzy. Nic nie trzeba wstrzymywać.
- Edycja starego kierunku na `main` przed scaleniem trzeba będzie przenieść ręcznie, bo skrypt migracji nie pracuje na przerobionych plikach.

## Odstępstwa i uwagi

1. `pobierz_tresci.py --lokalnie` uruchomiłem też w głównym drzewie Web-Core, a wcześniej nie sprawdziłem, czy nakładka jest równa klonom.
   - Skrypt zgłosił 14 konfliktów: pliki były na miejscu, ale nie w manifeście.
   - Wszystkie były identyczne z klonami (`o-stronie` różnił się tylko końcami linii CRLF). Usunąłem je i powtórzyłem pobranie.
   - Teraz nakładka w głównym drzewie jest równa klonom; podgląd na 4321/4322 pokaże nowe kierunki.
2. Zrzuty pokazują sekcje z różnicą, nie całe strony.
3. Pole `podpis` / `podpis_en` przypomnień jest spoza zlecenia: trzyma dawny podtytuł wpisu w kalendarzu („1. semestr studiów II stopnia · formularz C3”). Zob. pytanie 3.
4. Etap 1 zepsuł kafelek „Dla nauczycieli” (Popularyzacja): zamiast opisu pokazywał parę. Wykryło to porównanie; po poprawce w etapie 6 strona jest jak przed, test dopisany.
5. Narzędzia poza repozytorium, do usunięcia po odbiorze:
   - worktree `C:\Users\Szymek\source\wc28` (odłączony na `a53a92a6`);
   - buildy `wc28-przed`, `wc28-po`, `wc28-po2`, `wc28-po3`, `wc28-edytor`;
   - `wc28-check` (astro check, playwright) i `wc28-venv` (PyYAML).

   `skrypty/test-edytora/package-lock.json` jest poza repozytorium (tworzy go `npm install`).
6. Nie przepisałem „Jak zacząć” na „Dla uczniów” w formacie osi (sugestia z dziennika, poza zakresem). Zob. pytanie 5.

## Pytania do właściciela

1. **Wzory w edytorze.** Włączyć `remark-wzory-edytora` dla wszystkich pól rich-text (aktualności, strony, referaty)? Przyjąłem: tylko kierunki, zgodnie z zakresem zlecenia. Na to, czego nie da się cofnąć, proponuję zdanie w ściągawce: „klamry i normę we wzorze pisz jako `\lbrace … \rbrace` i `\Vert` albo popraw wzór w GitHubie”. Te zapisy przechodzą przez edytor bez strat.
2. **Akapity „Szczegóły egzaminów…” i „Wszystkie formularze…”.** Zostawić je jako zwykły akapit (stan obecny) czy przywrócić mniejszy szary styl, np. dla ostatniego akapitu sekcji z samym „…: [link]”?
3. **Pole `podpis` przypomnień.** Zostawić (podtytuł wpisu w kalendarzu) czy usunąć z formularza i plików?
4. **Miejsce nowego kierunku.** Kierunek spoza listy trafia na koniec menu i za ostatni kafelek (za „Podyplomowe”). Tak ma zostać?
5. **„Jak zacząć” na „Dla uczniów”.** Przepisać w formacie osi w osobnym zleceniu?
