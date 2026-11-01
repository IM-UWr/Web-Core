# Przekazanie: strona IM UWr, wersja na telefon (31.10.2026, ok. 17:50; uzupełnione 18:40)

Ten plik ma pierwszeństwo przed `claude/stan-prac.md`. Tamten zawiera ogólną wiedzę o projekcie (repozytoria, CMS, publikacja, zasady treści), ale część zasad pracy jest w nim nieaktualna. Najważniejsza zmiana: **teraz nie pushujemy**. Od 31.10, 18:03 obowiązuje też **nowy podział pracy (sekcja 0)**, który zastępuje część sekcji 1 i 2. Najnowsze decyzje są w **sekcjach 9 i 10**, a w sprawach wyglądu od 1.11 w **sekcji 14** i w `claude/estetyka.md`.

## 0. Podział pracy od 31.10, 18:03 (słowa użytkownika; ma pierwszeństwo przed sekcjami 1 i 2)
- **Rozmowa w claude.ai** służy do koncepcji: dyskusji, raportów, prototypów jako artefaktów i przeglądu pracy Claude Code.
- **Kod zmienia wyłącznie Claude Code na komputerze użytkownika.** Rozmowa w claude.ai nie wgrywa plików z kodem.
- W folderze Web-Core rozmowa zapisuje **tylko w `.przekazanie\`**. Niczego nie commituje i nie pushuje.
- Prototypy publikuje jako artefakty. Drobne poprawki prototypów może robić sama.
- **„wdrażamy”**: zapisać samodzielne zlecenie z kryteriami odbioru w `.przekazanie\zlecenia\NN-nazwa.md` (kolejny numer; folder jeszcze nie istnieje, więc pierwsze to 01) oraz źródło prototypu w `.przekazanie\prototypy\`.
- **„sprawdź”**: przeczytać `.przekazanie\dziennik.md` i zmiany w Web-Core, potem ocenić wynik.
- Ustalenia i decyzje dopisywać do `claude/przekazanie.md` w projekcie.
- Odpowiadać po polsku. Najpierw odpowiadać na pytania, a zmiany robić tylko na prośbę.
- Podagenci rozmowy mogą robić prototypy w chmurze, na kopii repozytorium. Nie dotykają komputera użytkownika.
- Stare zlecenia agentów (archiwum `zlecenia-agentow-i-czesciowe.tar.gz`) wskazują ścieżki w starym kontenerze. Przed ponownym użyciem trzeba je przepisać.
- **Komentarze użytkownika:** w czacie albo jako komentarze w artefakcie. Komentarze w artefakcie nie dają powiadomienia, więc czytać je, gdy użytkownik napisze „przeczytaj komentarze”.
- **Stan sprawdzony 31.10, 18:05** (`device_bash`):
  - gałąź `agent-nauka-podglad`, HEAD `5cb2b469`;
  - 36 niezacommitowanych zmian (30 zmienionych plików, 5 nowych komponentów i `package-lock.json`);
  - lokalna kopia `.przekazanie\przekazanie-im-uwr.md` = wersja tego pliku sprzed sekcji 0.
- **W kodzie** Aktualności mają jeszcze starą falę Fouriera (rAF, w tę i z powrotem, x 150–641). Wariant 3 z v5 nie jest wdrożony, a Lorenz też nie jest wdrożony.

## 1. Zasady pracy (stałe, słowa użytkownika)
- Zawsze odpowiadaj po polsku. Najpierw odpowiadaj na pytania, a zmiany rób tylko na wyraźną prośbę.
- **„Na razie wszystkie zmiany tylko lokalnie”.**
  - Żadnych pushy na GitHub (ani main, ani gałęzie) i żadnych commitów w repozytoriach treści. Push dopiero, gdy użytkownik napisze „push”.
  - Jeśli hook stop prosi o push, odmów i wyjaśnij dlaczego.
- **„Ja z tobą będę dyskutował koncepcje, a potem agenci to wygenerują”.**
  - ~~Gdy użytkownik mówi „wprowadź (lokalnie)”, zadanie dostaje agent (w tle), a Ty potem sprawdzasz wynik i wgrywasz pliki na komputer.~~ Nieaktualne od 18:03. Teraz po „wdrażamy” powstaje zlecenie dla Claude Code (sekcja 0).
  - Drobne poprawki prototypów (artefaktów) możesz robić sam.
- Przed pushem nie uruchamiaj `skrypty/pobierz_tresci.py`, bo nadpisze lokalne teksty w nakładce `src/data`.
- Teraz dopracowujemy **wersję na telefon**. Do komputera wrócimy później (raport niżej, kierunek A/B/C do wyboru).

## 2. Gdzie jest stan kodu
- **Źródłem prawdy jest komputer użytkownika:** `C:\Users\Szymek\source\Web-Core`, gałąź `agent-nauka-podglad`.
  - HEAD = `5cb2b469` (= origin/main). Zmiany są niezacommitowane: to 8 lokalnych commitów z poprzedniej rozmowy plus nakładka. Wszystko wgrane o 18:00.
  - Użytkownik ma uruchomione `npm run dev`.
- **Lokalne commity** (w poprzednim kontenerze, niewypchnięte), od najstarszego:
  1. 94bea530: przejścia między stronami i łagodne wejście treści (telefon i komputer, na próbę).
  2. deab96de: Studia bez liczby nauczycieli w banerze.
  3. fd7babb7: liczby w banerach.
     - Nauka bez seminariów: „realizowanych projektów”, „konferencje w 2026 roku”, „doktoratów w ostatnim roku”.
     - Na telefonie trzy kolumny pod cienką kreską (portal.css).
  4. 4a9f0be3: na telefonie zamiast długiego opisu jedno bursztynowe hasło.
     - Prop `haslo` w `NaglowekStrony.astro`, pola `haslo`/`haslo_en` w nakładce.
     - Hasła: Instytut „Wrocławska szkoła matematyczna”, Nauka „Poznaj nasze badania na A+”, Studia „Studiuj matematykę we Wrocławiu”, Popularyzacja „Matematyka dla uczniów i nauczycieli”, Aktualności „Co słychać w Instytucie”, Kalendarz „Co, gdzie i kiedy”.
  5. 819806e7: Aktualności na telefonie.
     - Filtry to select + „Szukaj” w jednym wierszu; tagi z „+N”.
     - Liczby w banerze; szara fala.
     - Studia: „kierunki studiów · specjalności · stopnie studiów”.
     - Popularyzacja: kreska i 3× TBA.
  6. 8db5a0da: podstrony na telefonie.
     - Odstęp 26 px pod banerem, rytm list, jasne kafelki dat, lżejsze podkreślenia.
     - Stopka w dwóch kolumnach.
     - KaTeX w tytułach referatów; separator „·” nigdy na początku linii.
  8. 235ac2c1: Kalendarz na telefonie jak Aktualności, ciemny motyw A1 „stalowy granat”, etykiety B1 (szczegóły w sekcji 8).
  7. 9f394c81: „W tym dziale” jako rozwijane grupy (tylko telefon; otwarcie jednej zamyka pozostałe).
     - Aktualności: liczby ogłoszenia / wydarzenia / seminaria z 30 dni.
     - `bezSierotek()`.
- **Kopia zapasowa na komputerze**, w folderze `C:\Users\Szymek\source\Web-Core\.przekazanie\` (wykluczonym z gita przez `.git/info/exclude`):
  - `web-core-lokalne-commity.bundle`: 8 commitów; warunek wstępny to commit `5cb2b469` z main.
  - `web-core-nakladka-i-prototypy.tar.gz`: zawiera
    - `src/data` (nakładka z lokalnymi tekstami),
    - `prototypy/*/index.html` (źródła prototypów animacji),
    - `haslo-pages-yml.md` (fragmenty `.pages.yml` na czas pushu).
  - ten plik.
- **Odtworzenie w nowym kontenerze** (do prototypów i zrzutów; kod na komputerze zmienia tylko Claude Code):
  1. `add_repo` IM-UWr/Web-Core i sklonuj repozytorium.
  2. Ściągnij oba pliki z `.przekazanie` przez `device_stage_files`.
  3. W repozytorium: `git checkout -b agent-nauka-podglad origin/main && git pull <bundle> agent-nauka-podglad`.
  4. `tar xzf <tar> -C <repo> src/data`. Prototypy rozpakuj do scratchpadu.
  5. `npm ci`.
  - Alternatywa: czytaj pliki bezpośrednio z komputera (`device_bash`, git z `-c core.autocrlf=true`), bez zapisywania poza `.przekazanie\`.
  - **Najprostsza droga (użyta 31.10, 18:12):** przez `device_bash` spakować drzewo robocze (bez `node_modules`, `.git`, `.astro`, `.przekazanie`, `.tresci`) do `.przekazanie\robocze\drzewo-robocze.tar.gz`, ściągnąć przez `device_stage_files`, rozpakować, `npm ci`, zbudować. Ta droga daje dokładny stan z komputera, łącznie z treściami.
- ~~**Wgrywanie na komputer:** pliki tekstowe z końcami CRLF pod nową nazwą w `/mnt/user-data/outputs`, potem `device_commit_files` (md5 / `expectedMtimeMs`).~~ Nieaktualne od 18:03, bo kodu nie wgrywamy (sekcja 0). Te same zasady (CRLF, nowa nazwa, `expectedMtimeMs`) obowiązują przy zapisie plików do `.przekazanie\`.
- **Build w chmurze:**
  - `export NO_PROXY=localhost,127.0.0.1,::1 no_proxy=localhost,127.0.0.1,::1 npm_config_noproxy=localhost,127.0.0.1,::1; npx astro build --outDir <katalog>/Web-Core`.
  - Serwowanie: `python3 -m http.server` (strona pod `/Web-Core/`). Zrzuty: Playwright.
  - Agentom równoległym daj osobne kopie repo.

## 3. Zadania zlecone agentom w poprzedniej rozmowie
Pełne treści zleceń (do ponownego uruchomienia 1:1) leżą w `.przekazanie/zlecenia-agentow-i-czesciowe.tar.gz` → `zlecenia-agentow/*.md`. W tym samym archiwum są też:
- `warianty-A1-B1-C1.js`: źródłowy CSS wariantów A1, B1 i C1 z raportu telefonu;
- `tryb-ciemny-czesciowe/`: częściowa praca agenta nr 1 ze stanu na 17:57. Zawiera `zmiany-sledzone.patch` (do `git apply` na lokalne commity) i nowe pliki w `nowe/src/...`.

1. **Tryb ciemny, etykiety, Kalendarz** (zmienia kod).
   - **ZROBIONE:** commit 235ac2c1, wgrany na komputer o 18:00 (sekcja 8). Archiwum `tryb-ciemny-czesciowe/` jest już nieaktualne; nie stosować tej łatki.
   - A1: tryb ciemny tylko na telefonie, z tokenami `--znacznik`.
   - B1: etykiety jako lekko zaokrąglone prostokąty 6 px, nie pigułki.
     - „Obrona doktorska”: mocniejsza mgiełka (#c3d2ee / #0f2552; ciemny: `rgb(120 160 235 / .42)` / #eef3ff) i ikona biretu.
     - Adresaci: szary tekst z „+N”.
   - Kalendarz przebudowany jak Aktualności:
     - hasło „Co, gdzie i kiedy”;
     - 3 liczby: seminaria, wydarzenia i obrony w ciągu 30 dni;
     - select + Szukaj zamiast guzików;
     - zwarte „Nadchodzące | Archiwum”.
   - Aktualności: etykiety „z 30 dni”.
   - Aktualności i Kalendarz w tym samym stylu.
2. **Strona główna na telefon, 4 koncepcje** (zdjęcie na cały ekran + lepszy układ przycisków).
   - Zatrzymany na prośbę użytkownika, wyników brak. **Uruchomiony ponownie 31.10, 18:21 jako 2 agentów (sekcja 9).**
3. **Animacje banerów podstron**, 5 agentów pogrupowanych według podobieństwa. Zaczęli o 17:48 i mieli tylko zrzuty obecnych banerów.
   - **Uruchomione ponownie 31.10, 18:21 jako 8 agentów, w nowym podziale (sekcja 9).**
   - Dawny podział:
     1. seminaria (lista i każde seminarium z motywem swojej dziedziny),
     2. konferencje, obrony, kalendarz,
     3. kierunki studiów (Matematyka, SIAD, ISiM, specjalności, podyplomowe, szkoła doktorska, MOST),
     4. badania (granty, publikacje, sukcesy),
     5. instytut i codzienność (władze, pracownicy, zakłady, plan zajęć, rok akademicki, Warto wiedzieć, strony ogólne, szukaj).

## 4. Ustalony wygląd telefonu (≤760 px; komputer bez zmian, chyba że powiedziano inaczej)
- Klasy `.tylko-telefon` / `.tylko-komputer`.
- **Jeden bursztynowy akcent na ekran:** na telefonie to hasło, na komputerze rysunek w banerze. Na telefonie rysunek jest biały/szary.
- **Baner działu na telefonie:** bursztynowe hasło, cienka kreska, 3 liczby w 3 kolumnach (`.pt-liczby`, `text-wrap: balance`, `bezSierotek()`). **Liczby nie są klikalne.** Od 31.10, 18:19 ten sam układ obowiązuje także na podstronach (sekcje 9 i 10).
- **Kafelki:** białe kafelki na falach w tle, bez osłabiania fal. Później przedyskutujemy, czy są miejsca, gdzie usunąć kafelki. Unikać kafelków w kafelkach (C1, np. granty).
- **Etykiety:** wariant B1 (szczegóły w sekcji 3). Pigułki odrzucone („wróć z poprzednim kształtem”).
- **Filtry list** (Aktualności, Kalendarz, od 18:38 także Pracownicy): select + „Szukaj”, bez rzędu guzików. Tagi, które się nie mieszczą, zastępuje „+N”, a pełna lista jest na stronie wpisu.
- **„W tym dziale”** to akordeon: otwarta jest jedna grupa naraz, wszystkie zakładki.
- **Popularyzacja:** tytuł „Popularyzacja” / „Outreach” (bez „matematyki”), długi tekst usunięty, kreska i 3× TBA zamiast liczb.

## 5. Animacje w tle banerów
- **Zasady:**
  - Ruch subtelny, rusza się mało elementów naraz.
  - Zmiany **losowe, nie w kółko**. Spokojne tempo linii (ok. 1–3 px/s); budowanie przy wejściu może być raz.
  - Rysunek na całą szerokość banera, ale zanika (ok. 60 px) przy prawym końcu białego tytułu, mierzonym przez `Range.getBoundingClientRect`. Na telefonie maska może zachodzić pod hasło.
  - Pionowo rysunek sięga od „← Strona główna” do kreski nad liczbami, z odstępem ok. 12 px od dołu i 16 px od prawej.
  - Technika: canvas, pętla na `setTimeout` (nie rAF), klatka tylko po zmianie ≥ 0,5 px.
  - Pauza poza ekranem i w karcie w tle; `prefers-reduced-motion` daje statyczny rysunek; dpr ≤ 1,5.
  - Kolor: na telefonie szaro-biały, słabo widoczny (wzór: Lorenz v3; użytkownik 18:26: „Dokładnie tak ma być”); na komputerze bursztynowy.
- **Nauka: atraktor Lorenza z kometą.** Użytkownik: „obłędny”. https://claude.ai/artifact/4uweSCAeiD5NLYJkGUeZui (v3)
  - Odstęp od dołu i od prawej; obrót 5° (lewe skrzydło w miejscu, prawe wyżej).
  - Kometa startuje w niewidocznej części i pojawia się po ok. 2 s.
  - Czeka na „wdrażamy”, po którym powstaje zlecenie dla Claude Code (sekcja 0).
- **Aktualności: szereg Fouriera fali prostokątnej.** https://claude.ai/artifact/1yAm97Sv2HUR4i8igGJmCL (v5)
  - **Zaakceptowany wariant 3:** budowanie 20 s, potem fala stoi i lekko oddycha wagami (30%).
  - Co losową przerwę (średnio 12 s, ±60%) rozkłada się do losowo 4–9 wyrazów i składa w tempie budowania (16 s na 8 wyrazów).
  - Rysunek sięga do poziomu „Strona główna”; dół zanika pod hasłem (`podHaslem` 70).
  - **Niewdrożony** (stan 18:05): w kodzie jest stara wersja.
- **Instytut: dendryt wrocławski** (Florek, Łukaszewicz, Perkal, Steinhaus, Zubrzycki 1951). https://claude.ai/artifact/PjQDRCpA275zW3Zj9Xa6iD (v2)
  - Gałęzie losowo znikają i wracają, średnio co 3 s; częściej długie; naraz ukrytych najwyżej 30%.
  - Czeka na opinię. Wcześniejszy dendryt z „światełkiem” był „nieładny”.
  - Dwudziestościan dla Instytutu odrzucony (obrót odwraca uwagę): https://claude.ai/artifact/JTxqjDzMiYaRFma9S5MJFx
- **Studia: sumy Riemanna** (podziały zagęszczają się i rozrzedzają; punkt ze strzałką stoi). https://claude.ai/artifact/GCbUg9vRCVPnHTcaGPj8zY. Bez decyzji.
- **Popularyzacja: konstrukcja cyrklem i linijką.** Pomysł potwierdzony przez użytkownika 31.10, 18:28: raz przy wejściu, potem losowo jeden łuk rysuje się od nowa. Prototyp robi agent (3 warianty konstrukcji; sekcja 9).
- Kalendarz i podstrony: propozycje 8 agentów (sekcja 9).
- Do decyzji później: długie tytuły podstron a granica zanikania.

## 6. Przy „push”
- Commit i push kodu: najpierw Web-Ustawienia, potem Web-Core; fast-forward `agent-nauka-podglad:main` (`add_repo` z access push).
- Zapisać nakładkę w repozytoriach treści:
  - **Web-Ustawienia**: `dzialy/*.json` (krótkie `wstep`, `haslo`/`haslo_en`, „Koła naukowe” w Studiach).
  - **Web-Popularyzacja**: `wstep`, `haslo`, `tytul` „Popularyzacja” / `tytul_en` „Outreach”.
- Dopisać pola `haslo` do `.pages.yml` (fragmenty w `haslo-pages-yml.md`). Sprawdź miejsce, bo `.pages.yml` na GitHubie się zmienił. Brakują tam też `o_instytucie`, `badania_tekst`, `o_studiach`.

## 7. Do dyskusji później
- Zdjęcia w banerach (punkt 3 raportu telefonu) i zdjęcia w artykułach (punkt 14).
- Gdzie ewentualnie usunąć kafelki.
- Wersja na komputer: raport „Podstrony na komputerze” https://claude.ai/artifact/1GLHqwtetHTW7o6B7NUQQM. Polecany kierunek B „Rytm w wierszu”, alternatywy A i C.
- Raporty i propozycje telefonu:
  - https://claude.ai/artifact/2CQuvboTMXTEbdQQiYhkrK
  - https://claude.ai/artifact/DhWpb96C3MMwNCZ6tM8n3V (warianty A1, B1, C1…)
- Animowanie pozostałych działów według tych samych zasad.

## 8. Wyniki agentów (dopisuje poprzednia rozmowa)
- **31.10, 18:00: tryb ciemny, etykiety, Kalendarz.** Lokalny commit 235ac2c1, 11 plików wgranych na komputer, md5 sprawdzone. Komputer bez zmian: porównanie pikselowe i porównanie stylów dało 0 różnic.
  - **A1:** tokeny `--znacznik*`, na razie tylko w `telefon.css`. Żeby objąć też komputer, przenieść definicje do `global.css`.
    - Jasny: `#1b2d52` / `#fff`.
    - Ciemny: `#2b4170` / `#f1f4fa` / `#a9c0e8`, miesiąc `#f2a33a`.
  - **B1:** jedna reguła `.news-meta .badge` (6 px). Obrona doktorska: mgiełka i biret (komponent `EtykietaRodzaju`). Odbiorcy: szary tekst z pogrubionym „+N”.
  - **Kalendarz:** hasło „Co, gdzie i kiedy”, liczby w ciągu 30 dni (konferencje niewliczane), wspólny `FiltrISzukaj` (lista + Szukaj), przełącznik „Nadchodzące | Archiwum”. Baner 286 px, tak jak w Aktualnościach.
  - **Aktualności:** etykiety liczb „z 30 dni”.
  - **Ryzyka do przejrzenia:**
    - `--tint-ink` w ciemnym motywie zmienia ramki i cytaty z bursztynu na jasnoszary;
    - ikony „Na skróty” i `.sem-meta svg` dalej bursztynowe;
    - plakietki `.gw-m` w starym stylu;
    - na angielskiej stronie wpisu stary błąd „phd students” (do poprawy przez `odbiorcyMalymi`).
- **Strona główna, 4 koncepcje:** agent zatrzymany na prośbę użytkownika (był przy 3. koncepcji). Nic nie zdążył zapisać. Uruchomiony ponownie 18:21 (sekcja 9).
- **Animacje podstron (5 agentów):** zatrzymane o 18:02, jeszcze na etapie rozpoznania. Uruchomione ponownie 18:21 jako 8 agentów (sekcja 9).
  - Ich robocze skrypty pomiarowe: `.przekazanie\prototypy\animacje-podstron-robocze-skrypty.tar.gz`.
- **Źródła istniejących prototypów animacji** leżą w `.przekazanie\prototypy\`:
  - `nauka-lorenz.html`: https://claude.ai/artifact/4uweSCAeiD5NLYJkGUeZui
  - `aktualnosci-fourier.html`: https://claude.ai/artifact/1yAm97Sv2HUR4i8igGJmCL, v5, wariant 3 zaakceptowany
  - `instytut-dendryt.html`: https://claude.ai/artifact/PjQDRCpA275zW3Zj9Xa6iD, v2
  - `studia-riemann.html`: https://claude.ai/artifact/GCbUg9vRCVPnHTcaGPj8zY
  - `instytut-dwudziestoscian-odrzucony.html`: https://claude.ai/artifact/JTxqjDzMiYaRFma9S5MJFx
- **Poprzednia rozmowa jest zakończona (31.10, 18:05).** Wszyscy agenci zatrzymani, nic nie zostało wypchnięte na GitHub.
- **Do poprawy (z zrzutu po commicie 235ac2c1):** w Kalendarzu na telefonie rysunek w banerze jest nadal bursztynowy. Powinien być szary jak w Aktualnościach, bo na ekranie ma być jeden bursztynowy akcent.

## 9. Decyzje 31.10, 18:11–18:25 (rozmowa z 18:03)
- **Wspólny układ banerów na telefonie, dla działów i podstron.** Użytkownik: „Podoba mi się ta koncepcja”.
  - Kolejność: „← poziom wyżej”, biały tytuł, bursztynowe hasło (1 linia), cienka kreska, 3 liczby liczone automatycznie („Tak, liczby liczą się automatycznie”).
  - Gdzie liczby byłyby sztuczne (np. Władze, Plan zajęć), zostają tytuł i hasło, bez kreski i liczb.
  - Wszystko, co się klika (przyciski, koordynatorzy, filtry), schodzi pod baner. Długi szary opis znika z banera na telefonie.
  - Powód: podstrony mają dziś inny układ.
    - Listy: szary opis na 2–3 linie.
    - Kierunki: opis i 2–3 przyciski, baner 390–470 px, a pod nim kafelki z faktami.
    - Seminarium: lista koordynatorów z mailem, baner ok. 430 px.
  - **Kierunek:**
    - przycisk „Rekrutacja” usunąć (nie przenosić);
    - hasło zostaje bursztynowe;
    - 3 fakty z obecnych kafelków (np. 3 lata · 2 lata · 5 specjalności), a kafelki pod banerem znikają;
    - przyciski pod banerem: zob. sekcja 10 (usunięte).
  - **Seminarium:** termin odpada, bo się zmienia.
    - Propozycja, niepotwierdzona: hasło o tematyce wpisywane raz w CMS seminarium; puste pole daje nazwę zakładu.
    - Liczby: zapowiedziane referaty · referaty w archiwum · koordynatorzy.
  - **Listy:** hasło zamiast opisu, zatwierdzone.
- **Aktualności, nowe liczby (pomysł użytkownika):** nowe ogłoszenia (z 30 dni) · nadchodzące wydarzenia (wszystkie wpisane w przyszłość, bez seminariów) · zapowiedziane referaty (wszystkie seminaria zapowiedziane do przodu).
  - Etykiety bez „z 30 dni”, odmiana automatyczna (1 nowe ogłoszenie / 2 nowe ogłoszenia / 5 nowych ogłoszeń).
  - Definicja „wydarzeń” doprecyzowana w sekcji 10.
- **Kolor rysunków na telefonie:** motyl Lorenza na Nauce i jej podstronach oraz trójkąt na podstronach Instytutu są bursztynowe, więc na Nauce wychodzą dwa akcenty. Poprawi się przy wstawianiu animacji, bo na telefonie animacje są szare.
- **Animacje podstron.** Użytkownik: „Jeśli masz pomysły na fajne animacje… dawaj, puścimy, zobaczymy”.
  - Każdy prototyp ma przełącznik „Motyw własny / Motyw działu”. O dziedziczeniu decydujemy po obejrzeniu.
  - Seminarium i zakład tej samej dziedziny dzielą motyw.
- **10 agentów uruchomionych o 18:21, 11. (Popularyzacja) o 18:29.** Pracują w chmurze, robią prototypy, niczego nie zmieniają u użytkownika.
  - Wspólne zasady: `/home/claude/wspolne/KONTEKST.md` w kontenerze rozmowy (treść = sekcje 4, 5 i 9).
  - **Animacje (8):**
    1. analiza i probabilistyka: lista seminariów; seminaria analiza harmoniczna, dyskretna analiza harmoniczna, równania różniczkowe, prawdopodobieństwo, statystyka; zakłady analizy funkcjonalnej, analizy matematycznej, równań różniczkowych, statystyki;
    2. struktury: seminaria geometria, topologia, teoria modeli, dydaktyka; zakłady algebry i teorii modeli, geometrii, teorii mnogości i topologii, dydaktyki;
    3. wydarzenia: konferencje, obrony (lista i pojedyncza), Kalendarz;
    4. kierunki (Matematyka, SIAD, ISiM) i 5 specjalności;
    5. pozostałe strony Studiów (podyplomowe, szkoła doktorska, MOST, codzienność);
    6. badania: granty, publikacje, sukcesy;
    7. Instytut: władze, pracownicy, lista zakładów, struktura, kontakt, infrastruktura;
    8. strony ogólne: Warto wiedzieć, wpis aktualności, szukaj, powiadomienia, strony prawne, 404.
  - **Popularyzacja (1):** konstrukcja cyrklem, 3 warianty.
  - **Strona główna (2):**
    - A: nawigacja na zdjęciu (2 koncepcje);
    - B: nawigacja pod zdjęciem albo przy przewijaniu (2 koncepcje).
  - **Wyniki** trafiają do scratchpadu rozmowy (`animacje/<grupa>/index.html`, `glowna/<a|b>/index.html`), a potem do publikacji jako artefakty. Linki dopisać tutaj.
- **Kopia drzewa roboczego** do budowy w chmurze: `.przekazanie\robocze\drzewo-robocze.tar.gz` (118 MB, bez `node_modules` i `.git`). Można ją usunąć.

## 10. Prototyp „Układ banerów IM UWr” i decyzje 18:33–18:40
- **Artefakt:** https://claude.ai/artifact/27B6BVArAGKg471dRVPeNT (v4).
  - Zrzuty prawdziwych stron (390 px) „obecnie / propozycja”; propozycja to ta sama strona z przestawionym banerem (Playwright, zmiana DOM).
  - Wysokość banerów: obecnie 226–468 px, w propozycji 205–328 px.
- **Matematyka (kierunek): zaakceptowana** („bardzo dobrze”).
  - Pod banerem **bez przycisków** „Plan zajęć” i „Katalog przedmiotów” („pastylki … out”). To samo w SIAD („Plan zajęć”, „Program studiów”). Pod banerem od razu „Na tej stronie” i „O kierunku”.
  - Hasło robocze „Od teorii do zastosowań”; liczby 3 lata (studia I stopnia) · 2 lata (studia II stopnia) · 5 (specjalności).
  - Uwaga: link do katalogu przedmiotów był tylko w tych przyciskach, więc znika z telefonu. Ewentualnie wstawić go jako zwykły link w tekście (bez decyzji).
- **Pracownicy: zaakceptowany wariant A** („super”).
  - Baner: hasło robocze „Kontakt do każdego z nas”; 129 osób · 8 zakładów · 17 doktorantów.
  - Filtry: jeden wiersz jak w Aktualnościach, czyli lista „Wszyscy ▾” z grupami „Kto” (Nauczyciele akademiccy, Doktoranci, Administracja, Emerytowani) i „Zakład” (8 zakładów) oraz „Szukaj” (nazwisko, pokój, e-mail, zakład). **Bez pastylek.**
  - „Liczba osób: 129” znika; po przefiltrowaniu pokazuje się „Znaleziono N osób”.
  - Nie da się łączyć filtrów (np. doktoranci z jednego zakładu), co jest świadomym uproszczeniem.
- **Kalendarz, liczby (propozycja użytkownika):** nadchodzące obrony · zapowiedziane referaty · nadchodzące wydarzenia. **Bez „dziś”** („nie pisz dziś”). Teraz: 2 · 5 · 4.
- **Aktualności, liczby:** nowe ogłoszenia · nadchodzące wydarzenia · zapowiedziane referaty. Teraz: 2 · 4 · 5.
  - **Jedna definicja „wydarzeń” na obu stronach:** wszystko wpisane w przyszłość **bez seminariów i bez obron**. Obrony mają osobną liczbę w Kalendarzu. Ta sama etykieta daje wtedy tę samą liczbę na obu stronach.
  - Etykiety identyczne na obu stronach („zapowiedziane referaty”, „nadchodzące wydarzenia”).
- **Wciąż otwarte:**
  - hasła (wszystkie robocze; pole „hasło” w CMS dla kierunków i seminariów);
  - Obrony: 2 liczby czy trzecia (np. „doktoratów w ostatnim roku”);
  - czy konferencje wliczać do „nadchodzących wydarzeń” (teraz żadnej nie ma).
- **Źródła prototypu w kontenerze rozmowy:** `/home/claude/banery/` (`banery.js`, `karty.py`, `karty.json`, `art/szablon.html`). Przy „wdrażamy” skopiować `art/uklad-banerow.html` do `.przekazanie\prototypy\`.

## 11. Wyniki agentów, 31.10 wieczorem
- **Limit użycia.** Ok. 18:45 wszystkich 11 agentów zatrzymał 5-godzinny limit konta (odnowienie 21:20). O 22:03 wznawiani turami, po ok. 5 naraz.
  - Postęp widać na liście zadań obok rozmowy.
  - Wniosek: nie puszczać więcej niż ok. 5 agentów naraz.
- **Opublikowane prototypy** (źródła w scratchpadzie rozmowy: `animacje/<grupa>/`, `glowna/<a|b>/`):
  - **Wydarzenia** (konferencje, obrony, obrona, Kalendarz): https://claude.ai/artifact/TYJB5SLos6Ek8MJYvW6CG5
    - Motywy: zasada Banacha (Konferencje), drzewo genealogii doktorów (Obrony i obrona), trzy odległości Steinhausa (Kalendarz).
    - Rekomendacja agenta: motywy własne; Lorenz tylko na Nauce.
    - Proponowane liczby Obron: 2 zapowiedziane · „3 lis” najbliższa · 6 odbytych.
    - Pytania: data w liczbach; tytuł strony obrony „Obrona doktoratu: …”; hasła; krótszy link „Obrony doktorskie”.
  - **Strona główna B** (B1 „Arkusz działów”, B2 „Zwijany baner”): https://claude.ai/artifact/RnY3oxLtGGaenQB6wvZbTj
    - Rekomendacja agenta: B1 z miniaturami działów i granatowym pasem z B2.
    - Zdjęcie: pionowe wycinki ze zdjęcia kampusu o zmierzchu (`baner/kampus-zmierzch.jpg`), do wymiany na prawdziwe pionowe zdjęcie.
  - **Strona główna A** (A1 „Kafle na szybie”, A2 „Okładka ze spisem”): https://claude.ai/artifact/VG7EKn4PkC3wn7u1LBpvKL
    - Rekomendacja agenta: A1.
    - Kontrast zmierzony, wszystko spełnia AA.
  - **Popularyzacja** (cyrkiel: pięciokąt, złoty podział, rozeta; ślad cyrkla w 3 wersjach): https://claude.ai/artifact/KymiHkTbM6i9Fy7RbS6KYB
    - Rekomendacja agenta: rozeta z punktem wbicia.
    - Pytania: wariant; nachodzenie na koniec hasła; budowa ok. 25 s; kolory na komputerze.
  - **Analiza** (lista seminariów „Rozsadnik”; Haar, Czebyszew, wahadło, ruch Browna, histogram; zakłady jako warianty): https://claude.ai/artifact/1UdzFJemXzH3TAmCSz6tat
    - Rekomendacja agenta: motywy własne i nowa wspólna reguła „obrys linii” dla długich tytułów (granica zanikania osobno dla każdej linii).
    - Proponowane liczby zakładów: pracownicy · projekty · konferencje.
- **Decyzja 22:13:** użytkownik zaakceptował 4 animacje z prototypu Wydarzenia: Konferencje (zasada Banacha), Obrony (drzewo genealogii), pojedyncza obrona (wyróżniona gałąź), Kalendarz (trzy odległości Steinhausa). To motywy własne, nie Lorenz. Słowa użytkownika: „animacje są super… wszystkie z pierwszej czwórki… pozostałych nie oglądałem”. Reszty prototypów jeszcze nie oglądał, więc nie są zaakceptowane.
  - Otwarte przy Wydarzeniach:
    - data w liczbach Obron („3 lis — najbliższa”);
    - tytuł strony obrony („Obrona doktoratu: …” czy samo imię i nazwisko);
    - hasła;
  - **Zaakceptowane 22:14 („Tak 4 skrót ok”):** linki powrotu skrócone do nazwy strony wyżej, czyli „← Obrony doktorskie” zamiast „← Wszystkie obrony doktorskie” i „← Seminaria” zamiast „← Wszystkie seminaria”.
  - **Strony ogólne:** https://claude.ai/artifact/AtCTfAj4NjKhiktTiyQksC
    - Motywy: Warto wiedzieć, trzy odległości (rodzic Instytut); wpis aktualności, Fourier działu albo zjawisko Gibbsa; Szukaj, punkt stały Banacha; 404, błądzenie losowe Pólyi („Na płaszczyźnie każdy wraca do domu”); strony prawne, statyczna kratka; Powiadomienia bez banera.
    - Pytania:
      - czy wpis aktualności i 404 mają dostać baner (dziś go nie mają);
      - gładki granat bez zdjęcia na stronach bez działu;
      - hasła; hasło „Bez cookies i bez śledzenia” może być za mocne, skoro jest analityka (choć bez cookies).
  - **Kierunki i specjalności:** https://claude.ai/artifact/GHYf2SX2mnFhn6ZrqFgipU
    - Motywy:
      - Matematyka: twierdzenie o kanapce (Steinhaus/Banach); agent poleca tu jednak Riemanna z działu.
      - SIAD: spadek gradientu.
      - ISIM: permutacje Steinhausa–Johnsona–Trottera.
      - Analiza danych: k-średnie (Steinhaus 1956).
      - Aktuarialna: krzywe przeżycia.
      - Nauczycielska: okrąg opisany (Euklides IV.5).
      - Stosowana: Lotka–Volterra.
      - Teoretyczna: kule ℓᵖ.
    - Długie tytuły: zanik po liniach (nie dalej w lewo niż do 45% szerokości) i `text-wrap: balance`.
    - Rozbieżność z prototypem banerów: SIAD ma tu 6 · 180 ECTS · licencjat i nadtytuł „Studia I stopnia” (w „Układzie banerów”: 6 semestrów · 180 punktów ECTS · 70 ECTS do wyboru).
    - Pytania:
      - czy specjalności mają mieć liczby;
      - ISIM: skrót w tytule, a pełna nazwa w nadtytule;
      - hasła;
      - za słaby ruch w ISIM, Matematyce i aktuarialnej.
  - **Instytut:** https://claude.ai/artifact/38AnVSceAf7xSKPPwikgqr
    - Motywy:
      - Władze: kanapka z szynką na płaszczyźnie.
      - Pracownicy: diagram łukowy ze 129 kropek.
      - Struktura: dendrogram (taksonomia 1951).
      - Zakłady: k-średnie z komórkami Woronoja.
      - Kontakt: schematyczna mapa z brzegiem rzeki (Steinhaus 1954, Perkal).
      - Infrastruktura: sieć motylkowa.
    - **Powtórki między agentami:** kanapka z szynką (Władze i Matematyka w Kierunkach) oraz k-średnie (Zakłady i Analiza danych w Kierunkach). Trzeba rozdzielić.
    - Pytania:
      - /instytut/zaklady/ nie istnieje (lista zakładów jest na /instytut/struktura/);
      - cień 25% rysunku pod długim tytułem;
      - Infrastruktura może dostać rzuty monetą (Steinhaus 1923);
      - łuki u Pracowników są poglądowe;
      - link „←” brzmi raz „Instytut”, raz „Instytut Matematyczny”.
  - **Pozostałe strony Studiów:** https://claude.ai/artifact/3vrLB1XcJupFRFS9fQrCc9
    - Rodziny:
      - „Czas i rytm” (trzy odległości): plan zajęć, rok akademicki, zajęcia.
      - „Droga” po kratce: pierwszy rok, egzaminy, dyplomowanie.
      - Zasada Banacha: szkoła doktorska i jej 4 podstrony.
      - Most z kratownicą: MOST.
      - Wzór Picka: podyplomowe.
      - Riemann działu: sprawy studenckie, skrypty, archiwalne programy.
    - Propozycje: krótkie tytuły na telefonie (np. „Stopień doktora”) i zanik po liniach.
    - Pytania:
      - liczby Roku akademickiego (dni niebieskie i pomarańczowe);
      - link „←” w Archiwalnych programach prowadzi do strony głównej zamiast do Studiów;
      - Riemann działu porusza się w kółko, wbrew zasadzie losowości.
  - **Struktury:** https://claude.ai/artifact/6QjR6fFw5hWJaWLS1orYW1
    - Motywy:
      - Geometria: longimetr Steinhausa (wzór Croftona).
      - Topologia: kontinuum Knastera.
      - Teoria modeli: krzywa eliptyczna z prawem grupowym.
      - Dydaktyka: geoplan i wzór Picka.
    - Zakłady to warianty motywów seminariów.
    - Pytania:
      - zera w liczbach seminariów (te 4 nie mają referatów w danych);
      - Pracownia z jedną liczbą;
      - Geometria: longimetr czy motyw z badań.
  - **Badania:** https://claude.ai/artifact/WsVXHXCQuqMoT9sUGP1bUy
    - Motywy:
      - Granty: wachlarz Lelka (Wrocław 1961), a grant ma jaśniejszy promień postępu.
      - Publikacje: łuki cytowań (losowe).
      - Rocznik: łuki współautorstwa z prawdziwych danych.
      - Sukcesy i historia: schemat Bernoulliego.
    - Długie tytuły: tryb „Wolny róg”.
    - Pytania:
      - losowe cytowania;
      - skojarzenie z wykresem giełdowym;
      - promień postępu;
      - hasła;
      - sprawdzić rok 1961 i związek Lelka z Wrocławiem.
  - **Strona główna, 22:41: użytkownikowi podoba się B2** (jeszcze bez „wdrażamy”, „muszę się zastanowić”). Wersja 2 makiety B2 w tym samym artefakcie co B (https://claude.ai/artifact/RnY3oxLtGGaenQB6wvZbTj, v2):
    - bez listy działów (są w menu);
    - pod zwiniętym pasem od razu „Na skróty”, pod nimi „Nadchodzące wydarzenia” (zamiast „Najbliższe”; „Najbliższe seminaria” bez zmian);
    - aktualności jako zwykła lista (karty w bok „rozjeżdżały się”), potem seminaria, studia i stopka;
    - przycisk na zdjęciu: „Na skróty i wydarzenia”.
    - **22:45–22:47 (v3):** w sekcjach Nadchodzące wydarzenia, Aktualności i Najbliższe seminaria widać na telefonie **3 pozycje**, a pod nimi wiersz „••• Zobacz więcej (N)”. Kliknięcie rozwija resztę w miejscu i zmienia napis na „Zwiń”. Link „Wszystkie →” albo „Kalendarz →” w nagłówku sekcji zostaje. To samo jest w B1.
    - **22:48 (v4):** zachowanie jak typowe „Pokaż więcej” i akordeon „W tym dziale”, zaakceptowane („dokładnie o to chodziło”):
      - rozwinięcie jednej sekcji zwija pozostałe;
      - strona nie skacze: przy rozwijaniu ostatnia widoczna pozycja sekcji zostaje w tym samym miejscu ekranu, a nowe pozycje pojawiają się pod nią; zwinięcie sekcji wyżej jest wyrównane przewinięciem;
      - przy zwijaniu w miejscu zostaje przycisk;
      - fokus zostaje na przycisku (`aria-expanded`).
    - **22:50 (v5):** zdjęcie oddalone, żeby było widać cały budynek Instytutu („nad zdjęciem się zastanowimy”).
      - Kadr 880×1056 z `public/pliki/baner/kampus-zmierzch.jpg` (x 500–1380) zamiast mostu.
      - Zdjęcie stoi u góry na pełną szerokość, z maską przejścia w granat; tytuł, hasło i przycisk są na granacie niżej.
      - Paralaksa pokazuje w pasie środek zdjęcia.
      - Ostateczne zdjęcie jest nadal do decyzji.
    - **22:54 (v6):**
      - Po zwinięciu nazwa „Instytut Matematyczny” jest w pasku nawigacji, jak na podstronach, a pod paskiem zostaje samo bursztynowe hasło. Pas ma 100 px zamiast 148.
      - Zdjęcie odsłonięte niżej: kadr 810×1056 (x 530–1340), maska zanika od 80% zamiast 62%, dolne przyciemnienie zajmuje 40% wysokości zamiast 60%.
    - **22:57 (v7), propozycja użytkownika:** strona nie zatrzymuje się w połowie między zdjęciem a „Na skróty”.
      - Działa po zakończeniu przewijania (`scrollend` albo 140 ms ciszy, nigdy przy palcu na ekranie).
      - W dół wystarczy 8 px, żeby strona przeszła od razu do „Na skróty”. W górę wraca do zdjęcia dopiero po przewinięciu o ≥ 25% strefy, inaczej wraca do „Na skróty”.
      - Poza strefą (treść niżej) przewijanie jest zwykłe; przy reduced-motion przejście bez animacji.
      - Do sprawdzenia na prawdziwym telefonie (inercja iOS).
    - **23:00 (v8):** pasek nawigacji ma zawsze ciemnawe, lekko przezroczyste tło (`rgb(10 18 38 / .58)` z rozmyciem 10 px i cienką jasną linią pod spodem), na zdjęciu i po zwinięciu. Jaśniejsze zdjęcie z v6 zostaje (użytkownik zapytał, ale nie prosił o zmianę).
    - **23:01 (v9):**
      - Zdjęcie zaczyna się niżej, pod paskiem (top 60 px).
      - Przejścia gradientem: ciemny pasek → zdjęcie (maska od przezroczystości do pełnego krycia przy 30% wysokości), potem zdjęcie → granat tytułu (od 76%).
      - Na zdjęciu pasek nie ma linii pod spodem; linia jest tylko po zwinięciu.
      - Podpis „Fot. fotopolska.eu” przeniesiony na prawy dół zdjęcia.
    - **23:03 (v10):** zdjęcie sięga do dołu ekranu, a ciemny gradient jest tylko wokół tekstu.
      - Pod ostrym zdjęciem leży to samo zdjęcie rozmyte (blur 14 px) i przyciemnione, widoczne od ok. 40% wysokości w dół; budynek zostaje cały, bez przybliżania.
      - Ciemny gradient to dwa gradienty radialne: za tytułem i hasłem (lewy dół) oraz przy przycisku.
      - Alternatywa: ostre zdjęcie na cały ekran wymagałoby przybliżenia ok. 1,5× i ucięcia ok. 30% budynku (źródło ma tylko 1056 px wysokości).
    - **23:07 (v11):** ciemne tło (granat 90%) jest tylko pod tekstem: od lewej krawędzi do końca najdłuższej linii tytułu. Od końca tekstu idzie w prawo gradient na 64 px, więc obok tekstu wyłania się zdjęcie. Góra i dół tła mają miękkie przejście. Gradienty radialne z v10 usunięte. Użytkownik: „Tak, bardzo dobrze”.
    - **23:08 (v12):** zdjęcie pod tekstem ostre, bez rozmytego przedłużenia.
      - Jedno ostre zdjęcie od paska do dołu ekranu (object-fit: cover, object-position 88% 50%). To przybliżenie ok. 1,35×: mural i główna część budynku zostają, lewe skrzydło jest ucięte.
      - Przejście z ciemnego paska w zdjęcie zostaje (maska 0 → 170 px).
      - Ciemne tło pod tekstem z gradientem w prawo z v11 zostaje.
      - Podpis zdjęcia przeniesiony w prawy górny róg.
      - Użytkownik: „o to chodzi”.
    - **23:10 (v13):** ciemny gradient pod tekstem rozlewa się szerzej i miękciej. Ogon w prawo ma 160 px (stopnie .9 → .72 → .45 → .18 → 0), przejście u góry 96 px, u dołu 64 px, z łagodnymi krzywymi.
    - **23:11 (v14):** „dalej za mało, niech rozlewa się 3 razy więcej”. Gradient ma teraz w prawo 480 px, w górę 288 px, w dół 192 px, krzywą smoothstep w 8 stopniach, a pod tekstem 90% granatu. Ciemność obejmuje łagodnie całą dolną połowę ekranu, a budynek u góry zostaje jasny.
    - **23:12 (v15):** ciemność sięga w dół aż do dolnego brzegu ekranu, bez zaniku na dole. Zanik został tylko w górę i w prawo.
    - **Zdjęcie od użytkownika (23:12):** https://fotopolska.eu/1158570,foto.html
      - Opis na stronie: „Instytut Informatyki UWr (Nowy)”. Autor Corvus monedula, licencja CC-BY-SA 3.0, 3500×2623 px, 5.06.2017. Plik: https://fotopolska.eu/foto/1158/1158570.jpg
      - Kontener nie może go pobrać (proxy 403), więc użytkownik ma zapisać plik w `Web-Core\.przekazanie\` albo dołączyć go w czacie.
      - Przy użyciu podpisać: „Fot. Corvus monedula / fotopolska.eu, CC BY-SA 3.0”.
      - Użytkownik dołączył zdjęcie w czacie (wersja 2576×1931).
    - **23:15 (v16):**
      - Nowe zdjęcie w B2: kadr 580×1166 z dołączonego pliku (x 1385–1965, y 491–1657); szerokość to Instytut z małym marginesem („szerokość dopasuj do Instytutu plus troszkę”).
      - Budynek z muralem na środku ekranu, pod tekstem bulwar nad Odrą.
      - Podpis „Fot. Corvus monedula / fotopolska.eu, CC BY-SA 3.0”.
      - Pod samym tekstem pełne krycie granatem (tła nie widać), dopiero od końca tekstu gradient (w prawo 480 px, w górę 288 px, w dół do brzegu).
      - Do wdrożenia użyć oryginału 3500×2623 z fotopolska.eu; ten sam kadr da wtedy ok. 790 px szerokości (2× na telefonach), a z pliku z czatu jest 1,5×.
    - **23:17–23:18 (v17):**
      - Tło pod tekstem granat 84% (w v16 było 100%, „trochę mniej ciemny”).
      - Instytut przesunięty wyżej („mniej budynków nad nim, więcej przestrzeni pod nim”): kadr x 1385–1965, y 660–1826 z pliku 2576×1931.
      - Użytkownikowi wysłano ten kadr jako PNG (`instytut-kadr-B2.png`, 580×1166) z promptem do podbicia rozdzielczości w innym czacie. Licencja CC BY-SA obejmuje też wersję przerobioną.
    - **23:19 (v18):** podpis zdjęcia usunięty z makiety („tylko do testów, na docelowej stronie podmienimy zdjęcie”). Jeśli to zdjęcie trafi jednak na stronę, podpis CC BY-SA jest obowiązkowy.
    - **23:21 (v19):**
      - Pod tekstem granat 92% (z 84%).
      - Instytut trochę niżej: kadr x 1385–1965, y 590–1756.
      - Ciemność z paska nawigacji rozlewa się 2× dalej: maska zdjęcia 0 → 30% przy 70 px → 60% przy 140 → 85% przy 240 → 100% przy 340 px (było 170 px), a górne przyciemnienie ma 192 px (było 96).
      - Kadr wysłany wcześniej użytkownikowi do podbicia (y 660–1826) jest trochę wyżej niż obecny; przy podmianie przesunąć.
    - **23:23 (v20):** pod tekstem granat 97% („troszkę więcej ciemności na tekście”). Gradient wokół bez zmian.
    - **23:24 (v21):** zakres rozmycia przy tekście o połowę mniejszy: w bok 240 px (było 480), w górę 144 px (było 288). W dół dalej do brzegu.
    - **23:24 (v22):** zdjęcie w wysokiej jakości od użytkownika (884×1779 PNG, podbite z kadru y 660–1826; w czacie jako załącznik).
      - W makiecie jako JPEG q86, 356 KB.
      - Żeby Instytut stał tak nisko jak w v19, obraz zaczyna się 47 px niżej (top 107 px), a jego dół wychodzi poza ekran. Maska u góry przeliczona: pełne krycie przy 293 px od początku obrazu.
      - Przy wdrożeniu strony głównej użyć tego pliku albo podbić tak samo kadr z oryginału 3500 px.
    - **23:25 (v23):** zdjęcie przybliżone ok. 1,12× (szerokość 112%, left −6%), żeby budynek sięgał bliżej krawędzi ekranu: marginesy ok. 20 px zamiast ok. 38. Ostatnia wersja artefaktu B to 22 (licznik artefaktu; w opisie „v23”).
    - **23:26 (v24):** ciemna otoczka zaczyna się tuż nad tytułem: zanik w górę 56 px (było 144). W bok 240 px, w dół do brzegu, pod tekstem 97%.
    - **23:27–23:28 (v25–v26):**
      - Otoczka tekstu: u góry dłuższe i płynniejsze przejście (112 px, 12 stopni smoothstep), w bok 310 px (było 240, 10 stopni).
      - Gradient od paska nawigacji trochę krótszy: maska zdjęcia do pełnego krycia przy 234 px (było 293), górne przyciemnienie 154 px (było 192).
      - Krótka próba wydłużenia gradientu od paska (nieporozumienie: chodziło o otoczkę tekstu) została cofnięta.
    - **23:32 (v29, artefakt w wersji 27):** otoczka tekstu zanika w górę płynniej i dalej: 224 px (było 112), gładka krzywa smootherstep w 16 stopniach. Bok 310 px, dół do brzegu i 97% pod tekstem bez zmian.
    - **Ustawienia B2 na 23:32 (do zlecenia, gdy będzie „wdrażamy”):**
      - Zdjęcie 884×1779: szerokość 112%, left −6%, top 107 px, maska od góry 0 → 176 px (v27, 23:29; wcześniej 234), górne przyciemnienie 124 px.
      - Pasek nawigacji `rgb(10 18 38 / .58)` z blur 10 px; po zwinięciu pas 100 px: nazwa w pasku, a pod nim bursztynowe hasło.
      - Otoczka tekstu: 97% pod tekstem, w bok 310 px, w górę 224 px (smootherstep, 16 stopni), w dół do brzegu.
      - „Na skróty” → „Nadchodzące wydarzenia” → aktualności (lista) → seminaria → studia; po 3 pozycje plus „••• Zobacz więcej (N)”, jedna sekcja rozwinięta naraz.
      - Dociąganie przewijania między zdjęciem a „Na skróty”.
      - **Hasło strony głównej (23:30):** „Badania, studia i popularyzacja” (było „Badania, seminaria i studia”), w B2 na zdjęciu i w zwiniętym pasie, a także w B1.
    - Źródła: scratchpad `glowna/b/zrodla/` (`b2.html`, `buduj.py`).
  - **Popularyzacja, decyzja 22:23:** wybrany **złoty podział** („jest genialna”). Na telefonie konstrukcja przesunięta w górę NAD bursztynowe hasło: mieści się od paska menu (61 + 6 px) do górnej krawędzi hasła minus 6 px, liczona po rzeczywistym zasięgu łuków. Artefakt w wersji 2, domyślnie złoty podział. Kolory na komputerze i ślad cyrkla bez decyzji (domyślnie punkt wbicia).
  - **POWTÓRKI MOTYWÓW między agentami (do rozdzielenia w jednej rundzie po zakończeniu wszystkich):**
    - trzy odległości Steinhausa: Kalendarz (ZAAKCEPTOWANY), Warto wiedzieć, Studia „Czas i rytm”, a do tego „Rozsadnik” w Analizie się do nich odwołuje;
    - zasada Banacha (pajęczyna przybliżeń): Konferencje (ZAAKCEPTOWANE), Szukaj, szkoła doktorska;
    - kanapka z szynką: Matematyka (Kierunki) i Władze;
    - k-średnie: Analiza danych (Kierunki) i Zakłady (Instytut);
    - geoplan i wzór Picka: Dydaktyka (Struktury) i Podyplomowe (Studia).
    - Zasada: motyw zaakceptowany zostaje, pozostałe dostają nowe.
  - **Wspólna reguła dla długich tytułów** (prawie wszyscy agenci niezależnie): zanik liczony osobno dla każdej linii (link „←”, linie tytułu, hasło), z przejściem 60 px. Do przyjęcia jako jedna reguła dla całej strony.
  - **Błąd znaleziony przy okazji (do zlecenia):** `src/pages/404.astro` ma `opublikowany={false}`, więc `Baza.astro` (linia 107) pokazuje nad 404 pasek „Podgląd — ta strona nie jest jeszcze opublikowana”. Potwierdzone w kodzie.
- **DECYZJA 22:26:** „nie chce mi się wszystkich animacji przeglądać ręcznie, ale wyglądają genialnie. **Wszystkie animacje akceptowane**”. Obejmuje to wszystkie prototypy animacji z sekcji 11 i animacje działów z sekcji 5: Lorenz, Fourier v5 w wariancie 3, dendryt, Riemann, a w Popularyzacji złoty podział.
  - Przyjęte domyślnie rekomendacje agentów (do zmiany, jeśli użytkownik zgłosi):
    - na podstronach motywy własne; motyw działu tam, gdzie polecił agent:
      - Matematyka i sprawy studenckie, skrypty, archiwalne programy, MOST: Riemann;
      - wpis aktualności: Fourier;
      - Lorenz tylko na Nauce, dendryt tylko na Instytucie;
    - długie tytuły: zanik liczony osobno dla każdej linii („obrys linii”), z przejściem 60 px.
  - Wciąż otwarte (pytania z raportów agentów): hasła, liczby w kilku miejscach, powtórki motywów, krótkie tytuły na telefonie, banery dla wpisu aktualności i 404.
- **„WDRAŻAMY” (22:28)**, z wyjątkiem strony głównej („na to muszę się zastanowić”). O 22:35 zapisane w `C:\Users\Szymek\source\Web-Core\.przekazanie\`:
  - **`zlecenia\`:**
    - `zasady.md`: wspólne dla zleceń (nie commitować, nie pushować, komputer bez zmian, PL+EN, hasła w danych plus `.przekazanie\pola-do-cms.md`, format dziennika);
    - `01-uklad-banerow.md`: wspólny układ banerów na telefonie, tabela stron z hasłami i liczbami, filtry Pracowników, linki powrotu, szare rysunki, błąd 404;
    - `02-animacje-dzialow.md`: silnik animacji („obrys linii”, setTimeout, pauzy, reduced-motion, motyw na stronę) i 5 działów (Lorenz, Fourier v5 w3, dendryt, Riemann, Popularyzacja złoty podział nad hasłem);
    - `03-animacje-nauka-seminaria-zaklady.md`: Wydarzenia, seminaria i zakłady, Badania;
    - `04-animacje-studia.md`: kierunki, specjalności, codzienność Studiów (Matematyka, MOST, sprawy, skrypty, archiwalne: Riemann);
    - `05-animacje-instytut-ogolne.md`: Instytut (bez strony „Zakłady”), Warto wiedzieć, Szukaj, strony prawne (statyczne).
  - **`prototypy\`:** `uklad-banerow.html` (+ `uklad-banerow-zmiany-dom.js`, `uklad-banerow-pracownicy-filtry.js`), `popularyzacja-cyrkiel.html` (v2) oraz `animacje-{wydarzenia,analiza,struktury,badania,kierunki,studia-codziennosc,instytut,ogolne}.html`.
  - **Kolejność (poprawiona 22:40):** 01 i 02 w dowolnej kolejności, ale nie jednocześnie (oba zmieniają `NaglowekStrony.astro`); 03/04/05 po obu. 02 nie wymaga 01, bo działy mają już docelowy baner; użytkownik zaczyna od 02. Wszystko tylko na telefon, komputer bez zmian.
  - **Stan repozytorium o 22:40:** 8 lokalnych commitów jest już w gałęzi (HEAD 235ac2c1, niewypchnięte), a drzewo robocze jest czyste (poza `package-lock.json`).
  - **Decyzje podjęte w zleceniach domyślnie** (do zmiany na prośbę użytkownika):
    - przy rozbieżności hasło i liczby z prototypu układu banerów wygrywają z prototypami animacji (SIAD, Obrony, Seminaria, Plan zajęć);
    - polityka prywatności ma hasło „Jakie dane zbieramy i po co” zamiast „Bez cookies i bez śledzenia”;
    - powtórki motywów zostają;
    - nie wdrażamy krótkich tytułów na telefonie, cienia 25% ani banerów dla wpisu aktualności, 404 i Powiadomień.
  - Następny krok: użytkownik uruchamia Claude Code ze zleceniem 01; „sprawdź” oznacza przeczytać `.przekazanie\dziennik.md` i zmiany.
- **Wszystkich 11 agentów skończyło o ok. 22:30.** Lista zadań obok rozmowy jest cała odhaczona.

## 12. Stan prac i decyzje 31.10, 23:34–23:50
- **Zlecenie 02 zrobione** (dziennik 23:08): lokalny commit `b1fbd328` na `agent-nauka-podglad`, bez pushu. Lokalne commity bez pushu użytkownik dopuścił w rozmowie z Claude Code (dziennik, linia 3). Zlecenie 01 było o 23:35 w toku (32 zmienione pliki, bez wpisu w dzienniku).
- **Pytania z dziennika 02** (bez decyzji):
  - złoty podział przy dwuliniowym tytule; rada: zmniejszyć i przesunąć obok ostatniej linii;
  - fala Aktualności na komputerze stoi; rada: zostawić do decyzji o komputerze;
  - Windows użytkownika ma wyłączone efekty animacji (`prefers-reduced-motion`), więc animacje widać tylko na telefonie albo po ich włączeniu w ustawieniach Windows.
- **„Skok” animacji przy wejściu na stronę (pytanie 23:44).** Przyczyna w kodzie 02:
  - do startu silnika (czeka na koniec wjazdu tekstu i na krój, do ok. 1,5–3 s) widać stary statyczny rysunek działu `.ph-m`, np. w Nauce atraktor z `nauka-a.svg`;
  - potem `.ph-anim-gra` gasi go przez 0,8 s, a płótno rysuje atraktor w innym miejscu i skali;
  - proponowana poprawka: na telefonie, na stronach z `data-animacja` i przy JS, nie pokazywać `.ph-m` od początku; zostaje bez JS i przy błędzie silnika;
  - czeka na decyzję: osobne zlecenie poprawkowe czy uwaga przy „sprawdź”.
- **DECYZJA 23:36: „B2 wdrażamy. Stroną PC się na razie nie przejmujemy, to jest ogarnianie na później”.** Zapisane o 23:49 w `.przekazanie\`:
  - `zlecenia\06-strona-glowna-b2.md`: baner telefonu 100svh, sticky, pas = `--hdr-h` + 36 px (strona ma nagłówek 61 px, makieta 64); zdjęcie przez `<picture>` (art direction, telefon pobiera tylko swoje); wartości v29; nagłówek półprzezroczysty z rozmyciem; dociąganie; po 3 pozycje z „Zobacz więcej” w wydarzeniach, aktualnościach i seminariach; „Nadchodzące wydarzenia” (nowy klucz, bo `najblizsze` jest też w `Aktualnosc.astro`); pola danych; 10 kryteriów odbioru.
  - `prototypy\strona-glowna-b2.html` (makieta B1 i B2) oraz `prototypy\strona-glowna-b2\`: `b2.html`, `wnetrze.css`, `wnetrze.js`, `B2-widok-v29.png`, `instytut-telefon-884x1779.png` (oryginał od użytkownika, 2,9 MB) i `.jpg` (q86, 356 KB).
  - `zasady.md`: zlecenie 06 jako wyjątek od „nie zmieniaj strony głównej”; kolejność: 06 po 01, nie równolegle. Wersja na komputerze miała inną linię 8 („ok. 36 plików”) i została zachowana.
  - **Decyzje domyślne w zleceniu 06** (do zmiany na prośbę użytkownika):
    - wydarzenia na telefonie z 30 dni (pole `wydarzenia_dni_telefon`), najwyżej 10; komputer jak dziś (3 z 5 dni roboczych);
    - hasło EN „Research, education and outreach”;
    - podpis zdjęcia na telefonie pusty (pola `podpis_telefon`);
    - nowy alt wspólny dla obu zdjęć;
    - plik `public/pliki/baner/instytut-telefon.jpg` ≤ 300 KB;
    - „Warto wiedzieć” zostaje na dole jak dziś, choć w makiecie go nie było;
    - na telefonie bez wyróżnionej aktualności, wstępu i przycisków w banerze;
    - przycisk „Na skróty i wydarzenia” po zwinięciu niewidoczny i nieosiągalny Tabem (poprawka względem makiety).
  - **Prawa do zdjęcia** (fotopolska.eu nr 1158570, autor Corvus) do ustalenia przed pushem; zlecenie każe wpisać to do pytań w dzienniku.
- **Otwarte decyzje z prototypów (23:36–23:40):**
  - **wpis aktualności bez banera: DECYZJA „pełna zgoda” (23:38);**
  - 404 z banerem (błądzenie Pólyi): czeka; rada: tak, jako smaczek;
  - krótkie tytuły: czeka. Pomiar (kopia strony z 18:13, 390 px) wskazał 3+ linie na stronach:
    - Instytut: godziny otwarcia laboratorium, programy w pracowniach, regulamin sieci;
    - Seminaria: dyskretna analiza harmoniczna (4 linie), prawdopodobieństwo, dydaktyka;
    - Studia: archiwalne programy, ISIM;
    - 54 z 94 grantów.
    Rada: bez osobnego pola; skrócić wszędzie 3 tytuły Instytutu (i ewentualnie archiwalne programy), a nazwy seminariów i grantów zostawić.
- **DECYZJA 23:52 (zrzuty Nauki i Studiów): granice rysunków, zlecenie 07.** Zapisane o 23:58 w `.przekazanie\zlecenia\07-granice-rysunkow.md`:
  - rysunek nie wchodzi między linie tekstu: link, nadtytuł, tytuł i hasło to jedna bryła, a przerwy są maskowane do dłuższej z sąsiednich linii;
  - rysunek nie wchodzi pod hasło: hasło maskowane na całą długość, `podHaslem` usunięte;
  - dół pola rysunku w połowie hasła, góra przy dole paska menu + 6 px (jak atraktor);
  - silnik zmienia `Pole.y0` i `y1` oraz dodaje zanik 12 px na dole jako zabezpieczenie;
  - motywy najpierw przesuwają się w górę, a dopiero potem lekko zmniejszają (wykresy wolno spłaszczyć).
  - Do `zasady.md` dopisano kolejność (07 po 01, przed 03–05) i sekcję „Granice rysunków”, która obowiązuje też 03–05.
  - Uwaga techniczna: `device_commit_files` dwa razy zapisał na komputerze starą wersję `zasady.md` (linia 8). Poprawione na miejscu przez `device_bash`. Po każdym zapisie warto porównać md5.
- **23:55: zlecenie 01 zrobione**, lokalny commit `2c590dfe`. W commicie nie ma zmian samych końców linii. Nowe pola w `.przekazanie\pola-do-cms.md`.
- **Pytanie 23:54 o CMS:** Claude Code nie zmienia konfiguracji CMS. Wpisuje wartości do lokalnej nakładki i opisuje pola w `pola-do-cms.md`. Przy „push” są dwa kroki: zapis plików danych w repozytoriach treści i dopisanie pól do `.pages.yml`. Zrobi to zlecenie przygotowane przy „push”.
- **00:09: zlecenie 07 zrobione**, lokalny commit `fc977d64`. Nocna kolejka Code: 06 → 03 → 04 → 05. Użytkownik nie potwierdził, czy wybrał moją kolejność, czy kolejność Code.
- **Pytania z dziennika 01** (bez decyzji):
  - kafelki `.stats` pod banerem (Granty, Publikacje, Sukcesy, Struktura) usunięte, bo dublowały liczby; z telefonu zniknęły m.in. „73 z NCN”, „11 z UE” i liczba doktorantów. Przywrócić?
  - bardzo długie tytuły seminariów i ISIM: mniejszy krój, krótsza nazwa czy zostawić?
  - hasła robocze, m.in. Zakład Teorii Prawdopodobieństwa, skrócone EN;
  - „Archiwalne programy”: link „←” prowadzi na stronę główną; zmiana na „← Studia” zmienia też komputer;
  - „Zadania z egzaminów” bez hasła; propozycja „Archiwum zadań od 2002 r.”.
- **00:24: Code wybrał kolejność 07 → 03 → 04 → 05 → 06.** O 00:26 był w połowie 03 (motywy banach, brown, _analiza; bez commita). Użytkownik pyta o wyłączenie komputera. Rada: kazać Code zapisać w dzienniku 03 jako „częściowo”, a jutro w nowej sesji dokończyć 03 i zrobić kolejno 04, 05, 06.
- **DECYZJA 00:27: atraktor w Nauce bliżej prawej krawędzi** („za dużo miejsca z prawej”). Zapisane w `.przekazanie\zlecenia\08-poprawki.md`, pkt 1:
  - po obrocie i zmniejszeniu rysunek przesuwa się tak, żeby jego prawy brzeg wypadł na `G.x1` (16 px od krawędzi);
  - przyczyna: po 07 działa `fs < 1` wokół `px`, więc prawa strona odjechała w lewo.
  - Plik 08 zbiera drobne poprawki; kolejne punkty dopisywać po decyzjach użytkownika (lista z odpowiedzi 00:22, pkt 1–8).
- **00:28–00:29:** zlecenie 07 niczego nie przesunęło w poziomie. Fourier i Riemann idą przez całą szerokość, dendryt jest losowy na całej szerokości, złoty podział dosunięty do prawej. Tylko Lorenz był od początku na środku. Ogólnej reguły „do prawej” użytkownik nie chce („Oj to nie”).
- **DECYZJA 00:29: Fourier w Aktualnościach zaczyna się w poziomie na końcu tekstu „← Strona główna”** i kończy na `G.x1`. To pkt 2 w `08-poprawki.md`: nowe pole `Pole.link` (linia linku z silnika), liczba okresów liczona z krótszego odcinka, bez linku zostaje jak dziś.
- Uwaga techniczna: `device_commit_files` znów zapisał poprzednią wersję pliku (08, przed ostatnią poprawką). Poprawione na miejscu. **Po każdym zapisie sprawdzać md5 na komputerze.**
- W `.przekazanie\robocze\` są dwa archiwa (`head-fc977d64.tar`, `nakladka.tar`) do zbudowania podglądu w chmurze przy „sprawdź”. Można je usunąć.

## 13. Sprawdzenie zleceń 01–08 (1.11, 18:26–19:10)
- **Stan:** wszystkie zlecenia zrobione, lokalne commity do `ae6d5d96`, bez pushu. Nieśledzone `.claude/` i `package-lock.json` nie trafiły do commitów. Końce linii w commitach są czyste.
- **Sposób:**
  - bundle gałęzi i nakładka z komputera, build w chmurze HEAD i `235ac2c1` (`/home/claude/sprawdz/`);
  - pomiary Playwright na 408 stronach z animacją (390 px, `getImageData`);
  - zrzuty 61 stron (każdy motyw i wariant) i strony głównej;
  - porównanie komputera 1280 px na 22 stronach;
  - niezależny przegląd kodu (agent).
- **Wyniki:**
  - granice z 07: pod połową hasła, nad paskiem menu i w rdzeniu tekstu krycie 0 na wszystkich 408 stronach. W przerwach są tylko śladowe piksele przy prawym brzegu (wygładzenie maski);
  - konsola: bez błędów na 408 stronach, z ruchem i bez. 404 pagefind w Szukaj wynikały tylko z mojego builda bez pagefind;
  - Lorenz i Fourier mają 16 px od prawej, a Fourier zaczyna się na końcu linku;
  - komputer bez zmian poza „Nadchodzące wydarzenia” i usuniętym paskiem „Podgląd” w 404. Fala Aktualności na komputerze stoi (znane z 02);
  - B2 zgodna z v29: tylko `instytut-telefon.jpg` (274 KB), CLS 0, pas 97 px, przycisk ukryty po zwinięciu, fokus na „Na skróty”, dociąganie kółkiem działa, „Zobacz więcej” trzyma kotwicę (0–1 px) i zwija inne sekcje.
- **Znaleziska do poprawki (propozycja zlecenia 09):**
  1. silnik: przy błędzie motywu `start()` i tak dodaje `ph-anim-gra`, więc baner jest pusty zamiast statycznego rysunku (`silnik.ts:99–100`);
  2. brak reguły zapasowej `seminaria/*`: nowe seminarium z CMS bez animacji;
  3. hasło strony głównej wpisane na sztywno jako zapas (`StronaGlowna.astro:55`), a EN może brać polskie;
  4. `OBSZARY` zduplikowane w `Pracownicy.astro` i `ListaZakladow.astro`;
  5. drobne: brak zabezpieczenia NaN w `k.za`, `mapa.ts` sięga 10 px pod `y1`, 3 przyciski „Zobacz więcej” o tej samej nazwie dla czytnika (`aria-describedby`), powielony kod w motywach, nieaktualne komentarze;
  6. „Kalendarz →” przy 390 px schodzi pod nagłówek „Nadchodzące wydarzenia”.
- **Obserwacja wizualna:** część motywów jest prawie niewidoczna przy długich tytułach albo słabym rysunku. Najmniej „atramentu” mają: dendryt Instytutu, haar, brown, rytm, droga, kratka, pajęczyna (55%), lotka, okrąg. Zostawić albo podnieść krycie: decyzja użytkownika.
- **Pytania Code czekające na decyzję:**
  - 03: wariant Browna (teoria ryzyka) dla Zakładu Teorii Prawdopodobieństwa; struktury spłaszczone do 83%;
  - 04: pajęczyna w szkole doktorskiej 50–70%;
  - 06: wspólny alt dla obu zdjęć; EN podtytuł w 2 liniach, więc otoczka na całą szerokość; hasło robocze; prawa do zdjęcia;
  - 01: wcześniejsze pytania (sekcja 12).
- **Sprzątanie:** w `.przekazanie\robocze\` są moje paczki (`sprawdz.bundle`, `nakladka*.tar`, `head-fc977d64.tar`, `drzewo-robocze.tar.gz` 118 MB). Do usunięcia przez użytkownika.
- **19:47: nowy wątek „estetyka i dusza strony” w nowej rozmowie.** Zarzut użytkownika: strona wygląda bardzo „AI”, a wszystkie zakładki wyglądają tak samo. Zlecenie 09 i otwarte decyzje z sekcji 12–13 są odłożone („to później”).
- **19:51: pytanie o niewczytujących się Pracowników.** W buildzie lista działa. To uszkodzona pamięć `node_modules\.vite` serwera dev po pomocniczym buildzie Code (dziennik 01). Naprawa: `npm run dev -- --force`, a w razie potrzeby usunięcie `node_modules\.vite`.

## 14. Estetyka: kierunek „Założyciele” i nowa strona główna na komputer (1.11, 19:50–23:35)
- **Aktualizacja 23:35:** ustalono też wygląd strony działu (opcja 4, kolumna 1240 px, pasek menu na banerze, notka o patronie), podstron działów (pełny głęboki kolor ze zdjęciem działu, ścieżka „← Dział”, sygnet i podpis patrona, znak twierdzenia, boczna nawigacja), ciepłe tło, tryb ciemny i flagę przy EN. Prototypy: Władze, Projekty i granty, Plan zajęć. Szczegóły w `claude/estetyka.md`.
- **Kopie na GitHubie (23:33):** `kopia/2026-11-01-agent-nauka-podglad` (dokładna kopia lokalnej gałęzi, `ae6d5d96`) i `kopia/2026-11-01-estetyka-prototypy` (pliki robocze prototypów i dokumenty, nie scalać).
- **Pełny opis, ustawienia i linki: `claude/estetyka.md`.** W sprawach wyglądu ten plik i ta sekcja mają pierwszeństwo przed wcześniejszymi ustaleniami (m.in. „jeden bursztynowy akcent na ekran”).
- **Nic nie wdrożone, brak „wdrażamy”.** Zlecenie 09 i otwarte sprawy z sekcji 12–13 nadal odłożone.
- **Kierunek przyjęty: „Założyciele”** (pomysł użytkownika; 20:25 „obłęd, o coś takiego mi chodziło”; 22:14 „wygląda obłędnie”):
  - cztery działy mają patronów z czwórki twórców wrocławskiej szkoły (Instytut: Marczewski, Nauka: Ślebodziński, Studia: Knaster, Popularyzacja: Steinhaus) i własne kolory;
  - prawie niewidoczne szkice patronów rysują się w kolorze działu po najechaniu.
- **Prototyp:** https://claude.ai/artifact/UuuZUa4ByC4AEYWEkrhibv (wersja 16, widok „Okładka”, Full HD domyślnie). Inne kierunki do porównania:
  - Typografia: https://claude.ai/artifact/Qh5yQZWowXrHmkuXibcGdC
  - Preprint: https://claude.ai/artifact/RJ7SCRD12W2hHYfGQcoEhQ
  - Plakat: https://claude.ai/artifact/8nN82YM6MkGpGUynzmjGZV
- **Strona główna na komputerze (Full HD jako ekran domyślny):** dwie pozycje, każda na jeden ekran, zwykłe przewijanie.
  - **Okładka:**
    - zdjęcie, a na nim blok: pełne logo UWr, „Instytut” i „Matematyczny” od lewej, prawe końce na jednej skośnej linii, która jest granicą ciemnego pola;
    - cztery działy ze szkicami (bez linków do podstron i bez bursztynowego hasła);
    - w rogu Szukaj, EN, tryb ciemny i dyskretny hamburger (w panelu 4 działy z podstronami i duże Aktualności);
    - strzałka „Szybki dostęp”.
  - **Drugi ekran:**
    - pasek menu: działy, Aktualności, Rekrutacja | Szukaj, EN;
    - pasek „Szybki dostęp”;
    - dwie krótkie kolumny po 3 pozycje i długa trzecia kolumna z prawej. „Zobacz więcej” płynnie przenosi klikniętą listę do długiej kolumny;
    - Studia i Warto wiedzieć na 2/3 szerokości;
    - stopka w jednej linii z „© 2026 Uniwersytet Wrocławski · Created by Szymon Cygan”.
  - **Prelegent przy seminariach:** po tytule, półpauza i nazwisko kursywą (decyzja 21:40).
- **Szkice twarzy w prototypie są zastępcze.** Dokładne szkice patronów (z fotografii, do których Instytut ma prawa) podmienimy później (22:14).
- **Otwarte (szczegóły w `claude/estetyka.md`):**
  - twarze czy znaki matematyczne;
  - paleta;
  - krawędź okładki (pion, skos czy mocny skos) i proporcje „Instytut” / „Matematyczny”;
  - barwienie zdjęcia przy najechaniu;
  - typografia (rekomendacja: Brygada 1918 + Manrope);
  - telefon (okładka z 4 działami, hasło w B2);
  - docelowe zdjęcie.
