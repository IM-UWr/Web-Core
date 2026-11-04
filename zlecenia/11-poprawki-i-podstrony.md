# Zlecenie 11: poprawki po pracy nocnej (W PRZYGOTOWANIU, 4.11.2026)

Stan: **szkic, uzupełniany w rozmowie.** Nie wykonywać, dopóki w nagłówku nie będzie „GOTOWE”.
Podstawa: gałąź `wyglad/zalozyciele` (`d12c994`), raport `RAPORT-WYGLAD.md`, pytania `PYTANIA.md`, specyfikacja `dok/estetyka.md` na gałęzi `kopia/2026-11-01-estetyka-prototypy`.
**Kolejność (4.11, 22:27):** najpierw zlecenie 12 (przebudowa i porządki, gałąź `wyglad/porzadki`). To zlecenie nakłada się potem na gałąź po porządkach, jeśli właściciel ją przyjmie, a jeśli nie, na `wyglad/zalozyciele`. Zalecenia opisują wygląd i zachowanie; nazwy plików są ze stanu `d12c994` i po porządkach mogą być inne.

## Zalecenia

### 1. Okładka: barwienie zdjęcia przy najechaniu na dział (decyzja 4.11, 20:58)
- Po najechaniu kursorem (albo przejściu fokusem) na dział w rzędzie działów całe zdjęcie okładki lekko zabarwia się na **jasny kolor tego działu**, tak jak w prototypie (ustawienie domyślne „Barwione”). Po zjechaniu wraca do zwykłego zdjęcia.
- Wzór z prototypu (`proto/zalozyciele.src.html`):
  - warstwa `.barwa` nad zdjęciem, pod ciemnym polem: `position: absolute; inset: 0; background: var(--d-j); mix-blend-mode: soft-light; opacity: 0; transition: opacity .6s`;
  - stan `.zabarwione` z `opacity: .5`;
  - okładka dostaje `data-dzial` działu, na który najechano, żeby `--d-j` był jego kolorem.
- Przy `prefers-reduced-motion` bez przejścia (zmiana od razu). Na telefonie bez zmian.

### 2. Banery: trzy style, hasło i liczby razem, liczby w jednym rzędzie (decyzje 4.11, 21:07–22:01)
- **Trzy style banerów** (już tak jest, utrzymać jako zasadę):
  1. **baner działu** (4 strony działów): duże zdjęcie, tytuł, kolorowe hasło, kreska, liczby, szkic patrona z notką i podpisem;
  2. **podstrona z liczbami:** tytuł, kolorowe hasło, kreska, liczby, sygnet, większy znak;
  3. **podstrona bez liczb:** sam tytuł, sygnet, mniejszy znak.
- **Hasło i liczby razem albo wcale, pilnowane w kodzie:** jeśli strona ma liczby, ale w danych z CMS nie ma hasła, nie pokazuje liczb i przechodzi na styl 3. Hasło bez liczb też się nie pokazuje (już tak jest).
  - Przykład z 4.11: Web-Podglad (aktualne treści) pokazuje na „Struktura i zakłady” liczby bez hasła. Na treściach z 1.11 było hasło „Osiem zakładów i pracownia”, więc w CMS pole `struktura_haslo` jest dziś puste.
  - **Wypisz w raporcie wszystkie strony, które na aktualnych treściach mają liczby bez hasła** (do uzupełnienia w CMS przez właściciela).
- **Liczby zawsze w jednym rzędzie:** rząd liczb nigdy nie przechodzi do drugiej linii. Jeśli nie mieści się przed ciekawostką z prawej (opis i znak patrona; zachowaj odstęp ok. 40 px), **ostatnie liczby się nie pokazują**. O tym, które się chowają, decyduje kolejność w danych (pierwsze są najważniejsze).
  - Liczby chowają się w całości, nigdy w połowie.
  - Zawsze zostaje co najmniej jedna liczba.
  - Działa przy każdej szerokości okna, także 1536 i 1366 px.
  - Ta sama zasada na banerze działu (rząd liczb przed notką o patronie).
  - Proponowany sposób: rząd `display: flex; flex-wrap: wrap` z wysokością jednego rzędu i `overflow: hidden`. Liczby, które przeszłyby do drugiego rzędu, znikają w całości. Szerokość rzędu ograniczona do miejsca przed ciekawostką. Ukryte liczby oznacz `aria-hidden` (krótki skrypt po zmianie rozmiaru), żeby czytniki ekranu nie czytały niewidocznych.
- **Kolor hasła na stronach poza działami** (granatowy nagłówek: Aktualności, Kalendarz, strony ogólne): dziś jasnoszary `#c9d0de`, przez co wygląda jak brak hasła. **Do decyzji.**

### 3. Podstrony: bez listy podstron z lewej, „Na tej stronie” z prawej jako kreska (decyzja 4.11)
- **Wykonywane w zleceniu 12 (etap 2).** Tu tylko sprawdź, że jest zrobione zgodnie z opisem niżej, i popraw różnice.
- **Powód:** boczna nawigacja z listą podstron działu (`src/components/zal/BocznaNawigacja.astro`) jest za długa. W Studiach zajmuje cały ekran i spycha „Na tej stronie” poza widok.
- **Na komputerze (≥ 761 px) usuń listę podstron działu z lewej** na wszystkich podstronach. Do innych stron działu prowadzą „← Dział” w nagłówku, menu i „Następna strona w dziale”. Strony działów bez zmian: lista podstron w grupach jest tam treścią.
- **Zamiast niej „Na tej stronie” z prawej**, jeden wspólny komponent dla wszystkich podstron. Zastępuje na komputerze `SpisTresci.astro` w wariancie `bok`, `z-bok-spis` i własne spisy w widokach (`ListaGrantow`, `ListaKonferencji`, `ListaSukcesow`, `PlanZajec`). Wzór: prototyp, ustawienie „Nawigacja na podstronie: A” (`zbudujSpis`, `odswiezSpis`, style `.spis-p` i `[data-bok="A"]`).
  - **Układ:** treść i kolumna spisu 236 px, odstęp 56 px (`grid-template-columns: minmax(0, 1fr) 236px; gap: 56px`). Stopka strony („Następna strona w dziale”, „Ostatnia aktualizacja”) wyrównana do kolumny treści.
  - **Wygląd „kreska”:**
    - nad listą mały napis „Na tej stronie” (EN „On this page”) w kolorze działu, 12,5 px, pogrubiony;
    - pod nim lista z cienką linią po lewej (`1px var(--m-line)`), pozycje 14 px w kolorze przygaszonym, odstęp 6 px, wcięcie 16 px;
    - bieżąca sekcja: tekst w kolorze tekstu i pogrubiony, przy niej na linii odcinek 3 px w kolorze działu (`--d-a`), który przesuwa się między pozycjami (`transition: top .25s, height .25s`);
    - bez numerów, kropek i paska postępu (warianty B i C z prototypu odpadają).
  - **Przyklejony:** `position: sticky; top: 24px` (jeśli dojdzie przyklejany pasek u góry, `top` powiększ o jego wysokość). Nie wychodzi poza kolumnę treści na dole.
  - **Bieżąca sekcja (scrollspy):** ostatnia sekcja, której początek minął ok. 30% wysokości okna. Link bieżący ma `aria-current="location"`.
  - **Kliknięcie:** płynne przewinięcie do sekcji (20 px zapasu, `scroll-margin-top`). Przy `prefers-reduced-motion` przewinięcie i przesunięcie znacznika od razu, bez animacji. Zwykłe linki `#kotwica`, więc działają też bez JS.
  - **Krótkie etykiety:** w spisie krótka nazwa sekcji, w nagłówku sekcji pełna. Na Planie zajęć skróty kategorii:
    - Przedmioty obowiązkowe (O) → Obowiązkowe (O);
    - Standardowe przedmioty do wyboru (L) → Do wyboru (L);
    - Zaawansowane przedmioty do wyboru (M) → Zaawansowane do wyboru (M);
    - …(M): przedmioty niestandardowe (E) → Niestandardowe (E);
    - …(M): seminaria przeglądowe (S) → Seminaria przeglądowe (S);
    - Przedmioty z zakresu nauk humanistycznych i społecznych (H) → Humanistyczne i społeczne (H);
    - Przedmioty dla specjalności nauczycielskiej (N) → Specjalność nauczycielska (N);
    - Przedmioty z zakresu nauk przyrodniczych (NP) → Przyrodnicze (NP);
    - Pozostałe przedmioty → Pozostałe.
    
    Mapa w kodzie widoku planu (`src/lib/widoki/planZajec.ts`), z angielskimi odpowiednikami. Na innych stronach etykietą jest tekst nagłówka sekcji.
  - **Plan zajęć:** spis pokazuje kategorie pokazanego semestru i zmienia się przy przełączeniu semestru. Kategorie ukryte wyszukiwarką albo filtrem dni znikają ze spisu, a znacznik ich pomija (tak już działa w prototypie).
  - **Strony z mniej niż 2 sekcjami** nie mają spisu. Kolumna treści zostaje tej samej szerokości, a miejsce po prawej puste, żeby treść nie zmieniała szerokości między stronami.
- **Telefon (≤ 760 px) bez zmian:** zostaje rozwijane „Na tej stronie” nad treścią (`SpisTresci` w wariancie `gora`).
- **Sygnet w bocznej nawigacji** (punkt z `PYTANIA.md`) odpada razem z listą podstron.
- **Sprawdź:**
  - Plan zajęć, Projekty i granty, Władze, Rok akademicki, kierunek, specjalność i strona tekstowa w 1920, 1536 i 1366 px;
  - spis mieści się w oknie 1366×640 bez przewijania; jeśli jest dłuższy niż okno, przewija się w swojej kolumnie (`max-height` i `overflow-y: auto`);
  - nawigacja klawiaturą po linkach spisu;
  - `/en`.

### 4. Przyciski: jeden styl na całej stronie, jak na Planie zajęć (decyzje 4.11, 22:37–22:51)
- **Koniec okrągłych przycisków.** Wszystkie przyciski, zakładki, pola wyszukiwania i listy wyboru dostają styl przycisków z Planu zajęć (`.pl-sem`, `.pl-dni`, `.pl-szukaj` w `zal-granty-plan.css`). Wzór: prototyp, widok „Przyciski” (dziś i po zmianie, na prawdziwych etykietach).
- Najprościej: zmienić wspólne klasy `.chip`, `.btn`, `.search`, `.tabs`, `.zapis` w jednym miejscu, zamiast poprawiać każdą stronę osobno.
- **Grupa przełączników** (filtr, widok, semestr, zakładki):
  - przyciski sklejone w jeden pasek w ramce `1px var(--line)`, między nimi kreska `1px`;
  - bez zaokrągleń, 14 px, waga 600, `padding: 7px 12px`;
  - wybrany wypełniony kolorem działu (`--d-a`, tekst w kolorze tła). Na stronach poza działami (Aktualności, Kalendarz, pojedyncza aktualność) wypełniony kolorem tekstu: granatem, a w ciemnym motywie jasnym;
  - najechanie zmienia kolor tekstu na kolor działu, fokus to obrys `2px` w kolorze działu.
- **Przyciski-linki:**
  - ramka `1px var(--line)`, bez zaokrągleń, 14 px, waga 600, `padding: 7px 14px`;
  - najechanie: ramka i tekst w kolorze działu;
  - główny przycisk („Strona projektu”, „Zapisz mnie”) wypełniony kolorem działu.
- **Pola wyszukiwania i listy wyboru:** jak pole szukania na Planie (ramka `1px`, bez zaokrągleń, 15 px, `padding: 8px 12px`, fokus: obrys `2px` w kolorze działu). Lista wyboru ma strzałkę w dół.
- **Strona po stronie** (stan `d12c994`):
  - **Aktualności:** filtr rodzajów jako pasek i pole szukania **w jednej linii** (pole zajmuje resztę szerokości). „Pokaż wszystkie” jako przycisk-link.
  - **Kalendarz:** rodzaj wydarzeń i widok (Nadchodzące / Archiwum) jako dwa paski.
  - **Pracownicy:**
    - pole szukania i lista zakładów zostają (w nowym stylu);
    - **przyciski grup osób znikają**: grupy (Nauczyciele akademiccy, Doktoranci, Administracja, Emerytowani pracownicy) są sekcjami listy i trafiają do spisu „Na tej stronie” z prawej (zalecenie 3).
  - **Kierunek:**
    - zakładki programu studiów jako pasek;
    - **przyciski pod opisem (Rekrutacja, Plan zajęć, Katalog przedmiotów) usunąć**, bo te linki są wyżej na stronie.
    
    Pola `przyciski` w CMS nie ruszać, tylko ich nie wyświetlać; w raporcie zapisz, czy pole jest jeszcze potrzebne.
  - **Rok akademicki, Kolory dni:** przełącznik semestrów (`PrzelacznikSemestrow.astro`) jak na Planie, z krótkimi etykietami („Zimowy 2026/27”).
  - **Specjalność:** linki na dole treści, pod opiekunem (zakład, katalog przedmiotów, koło naukowe) jako przyciski-linki. **Do potwierdzenia przez właściciela**; do tego czasu w nowym stylu.
  - **Seminarium — pole powiadomień e-mail:**
    - nie karta w bocznym pasku, tylko blok w prawej kolumnie **pod spisem „Na tej stronie”**, oddzielony kreską `1px`;
    - nagłówek „Powiadomienia e-mail” jak nagłówek spisu (12,5 px, pogrubiony, w kolorze działu);
    - tekst 13,5 px, pole e-mail na całą szerokość kolumny, „Zapisz mnie” jako główny przycisk z ikoną koperty, notka o prywatności 13 px przygaszona;
    - działanie formularza bez zmian.
  - **Grant:** „Strona projektu ↗” jako główny przycisk.
  - **Publikacje i rocznik:** „PDF”, „Wykaz w PDF” jako przyciski-linki.
  - **Pojedyncza aktualność:** „Pełny album zdjęć ↗” i link do kalendarza zajęć jako przyciski-linki. **Warto wiedzieć (wpis):** link pod treścią jako główny przycisk.
  - **Konferencje, Sukcesy, Projekty i granty:**
    - lata w bocznym pasku przestają być przyciskami i trafiają do spisu „Na tej stronie”;
    - **na Sukcesach usunąć ramkę „Wcześniejsze sukcesy”** (tekst, „Zestawienie historyczne”, „Archiwum starej strony”).
    
    Uwaga: to jedyny link do strony `/nauka/sukcesy/historia`. Po usunięciu zostaje dostępna tylko z wyszukiwarki i spod adresu. Decyzja właściciela, co z tą stroną; do tego czasu nie usuwaj samej strony.
- **Także na telefonie** (po zleceniu 12 telefon ma ten sam wygląd):
  - długie paski na wąskim ekranie mogą przejść do drugiego rzędu, ramki i kreski mają zostać spójne;
  - na Aktualnościach i Kalendarzu na telefonie zostaje lista wyboru zamiast paska (jak dziś), w nowym stylu pola.
- **Nie dotyczy** (to nie przyciski): kropki kolorów dni, liczniki przy latach, etykiety rodzaju przy aktualnościach. Do osobnej decyzji.

### 5. Strona działu: menu podstron „wiersze na pasie” (decyzja 4.11, 23:13; wariant E w prototypie)
- Zamiast dotychczasowych trzech kolumn z pięcioma wierszami każda (Instytut, Nauka, Studia; Popularyzacja bez zmian): **pas w jasnym kolorze działu (`--d-t`) tuż pod banerem, na całą szerokość**.
- W kolumnie treści trzy wiersze, po jednym na grupę z menu:
  - z lewej nazwa grupy (13,5 px, pogrubiona, kolor działu, kolumna 140 px);
  - z prawej strony grupy jako zwykłe linki Brygadą 21 px, odstęp 24 px; zewnętrzne z „↗”.
- Wiersze oddzielone kreską `1px` w kolorze działu z przezroczystością ok. 20%. Pas ma padding 12 px góra i dół. Pod pasem treść działu z odstępem ok. 34 px.
- Nic się nie rozwija ani nie przełącza: wszystkie strony widać od razu. Bez JS. Grupy i linki z menu (`nawigacja.json`), jak dziś.
- Opis strony (np. „przedmioty, terminy i sale z USOS”) jest tylko w `title` linku, jeśli istnieje w danych. Nie wymyślaj opisów.
- Szerokości tak dobrane, żeby na Studiach każdy wiersz mieścił się w jednej linii przy kolumnie 1240 px. Jeśli się nie mieści, wiersz zawija się pod sobą (linki nie są ucinane).
- Telefon: nazwa grupy nad linkami, linki zawijane.

### 6. Pasek menu i hamburger (decyzje 4.11, 22:56–23:21)
- **Pasek:** Instytut · Nauka · Studia · Popularyzacja · Aktualności, za cienką kreską: **przełącznik trybu ciemnego, EN, hamburger** (w tej kolejności). Rekrutacja i Szukaj znikają z paska.
- **Hamburger na każdej stronie**, ten sam panel co na okładce (z prawej, wysuwany):
  - na górze pole „Szukaj na stronie”;
  - cztery działy z podstronami, **przed każdym działem mała twarz patrona** (uproszczony sygnet, ok. 52×62 px, kreska w kolorze działu, bez podpisu);
  - na dole duże „Aktualności” i „Rekrutacja ↗”, z większym oddechem (ok. 20 px góra/dół, Brygada 28 px), wyrównane do tekstu działów. Rekrutacja nie dubluje się w liście Studiów.
- **Okładka:** w rogu ten sam zestaw: tryb ciemny, EN, hamburger. Szukaj jest w panelu.
- **Pasek przyklejony u góry na stronach działów i podstronach, zmienia kolor:**
  - nad banerem ciemny (przezroczysty, biały tekst, jak dziś);
  - nad treścią jasny: tło strony z lekką przezroczystością i rozmyciem, tekst w kolorze tekstu, logo UWr w kolorze tekstu, kreski działów w kolorze głębokim (w ciemnym motywie jasnym), cienka linia u dołu;
  - nad stopką znowu ciemny;
  - przejście kolorów ok. 0,25 s, bez przejścia przy `prefers-reduced-motion`.
  
  Kolor wybiera skrypt według tego, co jest pod paskiem (IntersectionObserver na banerze i stopce).
- **Panel hamburgera w kolorze paska:** gdy pasek ciemny, panel granatowy jak dziś; gdy jasny, panel jasny (tło strony, tekst w kolorze tekstu, linki przygaszone, sygnety i kreski w kolorze działu, ramka pola szukania `--line`).
- **Fokus przy otwieraniu panelu** przenosić z `focus({ preventScroll: true })`, bo w prototypie zwykłe `focus()` na wysuwającym się panelu przesuwało całą okładkę w bok.

### 7. Okładka: logo i wydział w górnej linii (decyzja 4.11, 23:16)
- Logo UWr (z napisem „Uniwersytet Wrocławski”) przechodzi z bloku tytułu do górnej linii okładki, z lewej, na wysokości narzędzi z prawej. Obok, za pionową kreską: „Wydział Matematyki / i Informatyki” w dwóch liniach (14 px, biały 85%). Logo i wydział to link do strony wydziału.
- W bloku tytułu zostaje samo „Instytut Matematyczny”, trochę niżej niż dziś.
- **Do decyzji (prototyp, przełączniki na okładce):** wielkość liter tytułu („równe końce”: dziś, różne wielkości, końce na skosie; „równa wielkość”) i zakręt ciemnego pola („jak dotąd” albo „płynny”: skos przechodzi łukiem w pas pod działami).

### 8. Wersja angielska: flaga przy „PL” (decyzja 4.11, 23:19)
- Przełącznik języka zawsze z flagą języka docelowego: na stronach polskich flaga UK i „EN” (jak dziś), na stronach angielskich **flaga Polski i „PL”**. Ten sam wygląd i rozmiar co flaga UK, także w panelu i na telefonie.
