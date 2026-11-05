# Zlecenie 16: wersja angielska — decyzje i łatki tłumaczeń (GOTOWE, 5.11.2026, 13:55)

Stan: **GOTOWE do wykonania — po zleceniu 15.**
Decyzje właściciela 5.11: D1 (13:34), D17 (13:32), D2–D16 i D19–D20 (13:39: „Tak, pełna zgoda” na propozycje), D3 (13:41), D18 (13:42).

**Materiały** (są w drzewie roboczym, bo łańcuch zleceń wyrasta z `wyglad/en`):
- `dok/en/TLUMACZENIA.md`: sekcja 4 (łatki, ich podstawy i zakres) i sekcja 5 (sprawy D1–D20 z propozycjami i miejscem w kodzie);
- `dok/en/POSTEP.md`: co zrobiła sesja w chmurze i co zostało;
- `dok/en/latki/<Repozytorium>.patch`: 17 łatek tłumaczeń treści CMS (tylko pola `_en` i `.pages.yml`), sprawdzonych `git apply --check` 5.11 ok. 02:45.

**Gdzie i jak pracować**
- Baza: gałąź `wyglad/zlecenie-15` po zakończeniu zlecenia 15. Nowa gałąź: `git switch -c wyglad/zlecenie-16` w głównym folderze `C:\Users\Szymek\source\Web-Core`.
- Commit po każdym punkcie. **Bez pushowania**, dopóki właściciel nie napisze „push”. Dotyczy także repozytoriów treści. **Nie uruchamiaj `skrypty/pobierz_tresci.py`.** Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-16.md`.
- **Repozytoria treści:**
  - Pracuj w świeżych klonach poza Web-Core: `C:\Users\Szymek\source\tresci\<Repozytorium>`, `git clone https://github.com/IM-UWr/<Repozytorium>`.
  - W każdym klonie najpierw nałóż łatki ze zleceń 14 i 15 (`dok/latki/zlecenie-14/`, `dok/latki/zlecenie-15/`), jeśli dotyczą tego repozytorium. Potem łatkę z `dok/en/latki/`, na końcu nowe zmiany z tego zlecenia.
  - Commit w klonie. Opis: „Wersja angielska: tłumaczenia (zlecenie 16)”, osobno dla każdego źródła łatki. Bez pushowania.
  - Jeśli łatka nie wchodzi czysto (treść zmieniła się po 5.11, 02:45), użyj `git apply -3`. Jeśli i to nie wystarczy, opisz konflikt w raporcie i nie zgaduj.
- **Podgląd lokalny:**
  - Zmiany z `src/` łatek nałóż także na nakładkę w Web-Core (`git apply --include='src/*'` z katalogu Web-Core).
  - Najpierw zrób kopię zmienianych plików do `.przekazanie\robocze\nakladka-przed-16\`.
  - Nakładki nie przywracaj: właściciel chce oglądać wynik.
- Nowe tłumaczenia z tego zlecenia (D4, D6, D8, D19) zapisz także jako łatki: `dok/latki/zlecenie-16/<Repozytorium>.patch`, względem stanu po łatkach z `dok/en/latki/`.
- Po każdym punkcie `npm run build` i `astro check` bez nowych błędów. Na koniec zrzuty stron `/en` z listy w `dok/en/POSTEP.md`, porównanie przed/po i `skrypty/sprawdz_tresci.py`.

## Zakres

### 1. Kod (Web-Core)
- **D1 — tytuły przy nazwiskach na `/en`** (`zTytulem()` w `src/lib/osoby.ts` z parametrem `lang`; ta sama zamiana w polach tekstowych z tytułem: `prowadzacy`, `recenzent`, `kierownik`, `wykonawcy`, `promotorzy`):
  - prof. dr hab. X → **Prof. X**;
  - dr hab. X, prof. UWr → **Prof. X**;
  - dr hab. X → **Dr hab. X**;
  - dr X, dr inż. X → **Dr X**;
  - mgr X, mgr inż. X → **X** (bez tytułu), z jednym wyjątkiem: doktorant na stronie obrony → „X, MSc”;
  - **bez** stanowisk w stylu amerykańskim (Assistant/Associate Professor) i bez nowego pola „stanowisko”.

  Wersja polska bez zmian.
- **D2:** w `<title>` i `og:site_name` na `/en` „Mathematical Institute, University of Wrocław” (`src/layouts/Baza.astro`). W stopce EN to samo, jeśli mieści się w jednej linii. Jeśli nie, zostaw „Mathematical Institute UWr” i napisz o tym w raporcie.
- **D3:** logo zostaje polskie (UWr nie ma wersji angielskiej, a jego angielska strona używa polskiego logo). Nic nie zmieniaj.
- **D5:** na stronie grantu (`src/views/Grant.astro`, `p.lead` w banerze) na `/en` przed oryginalnym polskim tytułem etykieta „Original title:”.
- **D10:** nowe opcjonalne pole referatu `jezyk` (`pl` / `en`) w schemacie `referaty` (`src/content.config.ts`) i w `.pages.yml` dziewięciu repozytoriów Web-Sem-* (łatki). Gdy `jezyk` = `pl`, na `/en` po tytule dopisek „(talk in Polish)”. Tytuł zostaje w oryginale. W łatkach ustaw `jezyk: pl` referatom o polskim tytule, m.in. „Rozwiązania automorficzne (self-similar) równań konwekcji-dyfuzji” i „Kwantowe grafy Knesera”. Listę wszystkich podaj w raporcie.
- **D14:** gdy na `/en` pokazujemy wartość polską w miejsce pustego pola `_en`, element dostaje `lang="pl"` (czytnik ekranu przeczyta go po polsku). `wybierz()` w `src/lib/i18n.ts` niech zwraca też informację o języku, a widoki z niej korzystają.
- **D15:** strona 404 (`src/pages/404.astro`) ma nagłówek i przyciski w obu językach naraz, bo strona jest jedna.
- **D16:** angielska wersja `/en/powiadomienia/` (albo dwujęzyczny szablon) i link do niej w angielskich e-mailach. **Uwaga:** skrypt e-maili (`skrypty/powiadomienia/Code.gs`) działa w Google Apps Script. Zmiana w repozytorium nie wdraża się sama. Opisz w raporcie, co właściciel ma wkleić i gdzie.
- **D18:** sala „zd” z USOS = zajęcia zdalne → „online” (`SALE_EN` w `src/lib/en/plan.ts`): potwierdzone, bez zmian.

### 2. Treści (łatki do repozytoriów treści)
- **17 łatek z `dok/en/latki/`** nałożyć według „Gdzie i jak pracować”.
- **D4:** polskie tytuły prac, grantów i referatów cytowane w angielskich aktualnościach (ok. 90 tytułów na 46 stronach `/en/aktualnosci/*`). Po tytule oryginalnym tłumaczenie w nawiasie: „… (Dimension-free estimates for …)”, jak już jest w części wpisów. Zmiana w `tresc_en` wpisów w Web-Aktualnosci.
- **D6:** polskie nazwy przedmiotów i systemów w angielskich tekstach o studiach („Analiza matematyczna 1”, „Wstęp do matematyki”, „Grupy zajęciowe”, „Mój USOSweb”, „kolokwia”, „starosta”, „dziekanat”). Nazwa z USOS zostaje, bo student musi ją znaleźć. Przy pierwszym użyciu na stronie dodaj angielski odpowiednik w nawiasie. Zmiana w `tresc_en` stron w Web-Studia. Dla nazw przedmiotów użyj tłumaczeń z `TLUMACZENIA.md`, sekcja 2.
- **D8:** nazwy konkursów i programów („Krok w Przyszłość”, „Perspektywy”, „POWROTY”, „Iuvenes Wratislaviae”…) przy pierwszym użyciu z tłumaczeniem w nawiasie (`tytul_en`, `zajawka_en`, `tresc_en` wpisów). Ujednolić pisownię „Krok w Przyszłość” we wszystkich polach, także polskich.
- **D11:** w konferencji `2020-model-theory-conference.md` (Web-Nauka) w polu `miejsce` zmienić „Szklarska P.” na „Szklarska Poręba”. To pole polskie. Adresy i nazwy miejsc zostają.
- **D19:** daty w angielskich tekstach o studiach w zapisie angielskim: „Mon 8 Feb”, „7 Jan – 2 Feb”, „13 Nov — University Day” zamiast „Mon 8.02”, „7.01–2.02”. Dotyczy `tresc_en` stron `/en/studia/pierwszy-rok`, `/zajecia` i `/egzaminy-i-dyplom` w Web-Studia.
- **D20:** w angielskim menu (`etykieta_en` w `nawigacja.json`, repozytorium z tym plikiem) przy linkach zewnętrznych do stron tylko po polsku dopisek „(in Polish)”, jak przy „All Faculty authorities (in Polish) ↗”. Dotyczy m.in. Library, Mathematics Discipline Council, Admissions i partnerów Popularyzacji. Każdy link sprawdź: czy strona docelowa ma wersję angielską.

### 3. Bez zmian (decyzje „zostawić”)
- D7: tytuły skryptów po polsku z „(in Polish)”;
- D9: polskie nazwy szkół, firm i instytucji;
- D12: „Juwenalia” z objaśnieniem;
- D13: przełącznik „Wersja polska / PL”;
- D17: tematy prac na stronach specjalności w oryginale, bez tłumaczenia (decyzja 13:32).

## Do przejrzenia przez właściciela (do raportu)
- **31 nazw przedmiotów bez angielskiej nazwy w USOS** (`TLUMACZENIA.md`, sekcja 2) i notki patronów po angielsku (sekcja 1). Tłumaczenia są już w kodzie od zalecenia 12, ale właściciel ich nie zatwierdził.
- Tłumaczenia z D4, D6 i D8 oznacz w raporcie jako „do przejrzenia”: tabela oryginał → tłumaczenie.
- Lista repozytoriów z commitami czekającymi na „push”, z jedną linią opisu na każde.

## Kryteria odbioru
- `/en` bez polskich stopni przy nazwiskach (poza „Dr hab.”), z poprawnymi tytułami stron.
- Łatki nałożone w klonach repozytoriów (commity bez pushowania) i na lokalnej nakładce. Kopia oryginałów nakładki w `.przekazanie\robocze\nakladka-przed-16\`.
- `npm run build` i `astro check` bez nowych błędów, `sprawdz_tresci.py` OK, zrzuty `/en` przed/po w raporcie.
