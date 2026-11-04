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
  - na samej górze strony, nad banerem: przezroczysty, biały tekst, jak dziś;
  - **po przewinięciu, dopóki jest nad banerem: ciemne półprzezroczyste tło (granat ok. 60%) z mocnym rozmyciem tła** (`backdrop-filter: blur(22px) saturate(1.3)`), żeby tekst banera pod paskiem nie prześwitywał (decyzja 23:27);
  - nad treścią jasny: tło strony z lekką przezroczystością i rozmyciem, tekst w kolorze tekstu, logo UWr w kolorze tekstu, kreski działów w kolorze głębokim (w ciemnym motywie jasnym), cienka linia u dołu;
  - nad stopką znowu ciemny (z tym samym rozmyciem);
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

### 9. Nagłówki podstron: liczby kierunków, długie tytuły, sygnet na środku (uwagi 4.11, 23:33)
- **Kierunki zgubiły liczby** (Matematyka, SIAD, ISIM): hasło jest, liczb nie ma.
  - Przyczyna (stan `d12c994`): w `zalozyciele.css` reguła `.z-slot .pt-liczby + .pt-liczby { display: none !important; }` chowa drugą listę liczb. W `Kierunek.astro` pierwsza jest lista telefonu (`LiczbyBanera`, `.tylko-telefon`), którą chowa reguła `.z-slot:has(.pt-liczby:not(.tylko-telefon)) .pt-liczby.tylko-telefon`. Druga jest lista komputera (`.kh-liczby`), którą chowa ta pierwsza reguła. W efekcie znikają obie.
  - Napraw tak, żeby kierunki znowu pokazywały liczby z faktów, z zasadą „hasło i liczby razem albo wcale” (zalecenie 2): bez liczb nie ma też hasła. Sprawdź wszystkie strony z dwiema listami liczb.
  - Po zleceniu 12 (jedna wersja HTML) lista telefonu i tak znika, więc zostaje jedna lista. Sprawdź, czy liczby się pokazują.
- **Długie tytuły najwyżej w dwóch liniach.** Np. „Indywidualne Studia Informatyczno-Matematyczne” łamie się dziś na 3 linie.
  - Jeśli tytuł w normalnym stopniu zająłby więcej niż 2 linie, stopień maleje krokami (np. co 4 px), najwyżej do ok. 44 px.
  - Szerokość tytułu może sięgać do ciekawostki z prawej, z odstępem ok. 40 px.
  - Łamanie najlepiej po pełnych słowach; przy wyrazie z łącznikiem dopuszczalne po łączniku.
  - Sprawdź też inne długie nazwy (specjalności, zakłady, seminaria).
- **Sygnet (pomniejszona twarz patrona) graficznie na środku nagłówka.** Zmienia to zasadę z 2.11 („środek sygnetu na pierwszej literze tytułu” / „podpis na linii bazowej”).
  - Twarz stoi w lewym marginesie z kreską jak dziś, ale **jej środek wypada na pionowy środek bloku tekstu nagłówka**: od „← Dział” do ostatniej linii (tytuł, hasło, liczby).
  - Podpis pod twarzą, wyśrodkowany względem niej (ok. 8 px niżej).
  - Działa tak samo dla nagłówków z liczbami i bez. Wzór: prototyp, podstrony.

### 10. Paleta i ciemny motyw (decyzje 4.11, 23:36)
- **Paleta działów: „Atramenty”** (potwierdzona; tak jest już w kodzie). „Stonowana” odpada.
- **Ciemny motyw: wariant A „Nocny granat”.** Specyfikacja, wartości i kontrasty są w `dok/ciemny/RAPORT-CIEMNY.md`, a gotowy CSS w `dok/ciemny/ciemny-propozycja.css` na gałęzi `kopia/2026-11-01-estetyka-prototypy`.
  - Bierzesz z CSS tylko wariant A i robisz z niego **zwykły ciemny motyw**, bez atrybutu `data-ciemny`. Obie formy jak dziś: `[data-theme="dark"]` i `prefers-color-scheme: dark` bez `data-theme="light"`.
  - Najważniejsze wartości:
    - tło `#18243b` zamiast `#0a1020`; banery i granat marki zostają o ton ciemniejsze od treści, jak w jasnym motywie;
    - powierzchnia `#222e46`, tekst `#ced5e3`, przygaszony `#a5afc1`;
    - panel menu `#24324f`, ramki przycisków i pól `#727c8f`.
  - **Kolor działu w ciemnym motywie:** jasny kolor działu z ok. 20% koloru nagłówków (pastel, nie neon). **Tło działu** (`--d-t`): ok. 11% koloru działu w powierzchni.
  - **Zdjęcia w dwóch kolorach** mają światła przygaszone granatem, a zwykłe zdjęcia lekko przyciemnione (`brightness(.86–.92) saturate(.92–.94)`).
  - **Nowe zmienne:**
    - `--m-line-ui` na ramki przycisków i pól (≥ 3:1);
    - `--m-rule` na grube kreski 2 px (zamiast prawie białej);
    - `--m-panel` na panel menu.
  - Sztywne kolory, które trzeba było nadpisać, wypisuje raport: panel hamburgera, pole szukania w panelu, przejście banera w treść i inne.
- **Do potwierdzenia (propozycja agenta):** w jasnym motywie ramki przycisków i pól mają ok. 1,3:1, a norma WCAG dla elementów interfejsu to 3:1. Ta sama zmienna `--m-line-ui` w jasnym motywie by to naprawiła. Nie wdrażaj bez decyzji, tylko wypisz w raporcie, jak by to wyglądało.

### 11. Lead na stronach działów bez powiększenia (decyzja 4.11, 23:37)
- Pierwszy akapit tekstu działu (`.z-dz-tresc p.wst`, „O studiach”, „O Instytucie” itd.) ma **ten sam stopień i interlinię co reszta tekstu** (17 px / 1,68). Wyróżnia go tylko **odrobinę mocniejszy kolor** (kolor nagłówków `--ink` zamiast `--text`). Dziś ma 20 px.

### 12. Wersja angielska bez polskich zaleciałości (audyt 4.11, 23:41)
- Pełny raport: `dok/en/RAPORT-EN.md` na gałęzi `kopia/2026-11-01-estetyka-prototypy`. Sprawdzono 373 strony `/en` w 1440 i 390 px. Menu, stopka, hamburger, „← Dział”, „Następna strona”, przełącznik języka i komunikaty JS są w porządku.
- **Popraw w kodzie** wszystkie pozycje z sekcji „K. Problemy w kodzie” (12), m.in.:
  - puste `notka_en` i `fakt_en` w `src/lib/patroni.ts` (polskie notki na banerach działów i fakty na okładce `/en/`). Przetłumacz notki;
  - daty w polskim formacie: `short()` w `src/lib/daty.ts` ma zależeć od języka (EN np. „29 Oct 2026”, „Wed 4 Nov”);
  - „grant promotorski” mimo istniejącego tłumaczenia (`Grant.astro`, `grant.ts`);
  - kalki na drugim ekranie („r. HS”, „and 4 · All news →”) w `DrugiEkran.astro`;
  - treść obron bez `tresc_en`: na `/en` pokaż angielski szablon zaproszenia z danych (data, sala, kandydat, promotor, tytuł) zamiast polskiej treści;
  - linki w treściach Markdown na `/en`: `rehype-base.mjs` ma dopisywać `/en` do linków wewnętrznych, jeśli angielska strona istnieje. Popraw też martwy link w `warto_wiedziec/wyklad-terencea-tao.md` i polski kanał RSS w `<head>` na `/en`.
- **Nie zmieniaj treści CMS.** Pozycje z sekcji „C. Problemy w treściach CMS” (brakujące pola `_en`, ok. 100 pozycji w ok. 35 plikach) wypisz w raporcie jako listę dla redakcji. Tam, gdzie brakuje pola `_en` w schemacie (np. `tematy_prac`, afiliacja i sala referatu, `tresc_en` obron), dodaj je jako **opcjonalne** i pokaż polską wartość, dopóki puste.
- **Dane zewnętrzne** (sekcja D: plan z USOS, wykazy publikacji) bez zmian w danych. W planie na `/en` przetłumacz w kodzie powtarzalne uwagi z USOS („co 2 tygodnie” → „every other week” itd.) według listy z raportu. Nazwy przedmiotów bez angielskiej wersji zostają po polsku.
- **Wpisy testowe** („Testowe:”, pliki `test-*`) to sprawa redakcji przed startem strony. Nie usuwaj ich.
- **„Do decyzji”** (sekcja raportu, 16 pozycji, np. „prof. dr hab.” w wersji EN) zostaw bez zmian.

### 13. Studia: przycisk „Rekrutacja” w pasie menu, bez linku do USOS (decyzja 4.11, 23:54)
- Na stronie działu Studia, w pasie menu (zalecenie 5) **z prawej przycisk** wypełniony kolorem działu, kanciasty: małe „Dla kandydatów” (12,5 px, pogrubione) nad „Rekrutacja 2027/28 ↗” (Brygada ok. 22 px), biały tekst, `padding: 16px 22px`. Link do strony rekrutacji (dziś `studia-wmi.uwr.edu.pl`), rok z danych.
- Układ: przycisk stoi obok **dwóch pierwszych wierszy** (pionowo wyśrodkowany), a **trzeci wiersz (Dyplom i sprawy) idzie na całą szerokość pod nim**. Dzięki temu żaden wiersz się nie łamie przy kolumnie 1240 px (siatka: dwie kolumny, wiersze 1–2 w pierwszej, przycisk w drugiej przez dwa wiersze, wiersz 3 przez obie). Wzór: prototyp.
- **USOSweb usunięty z menu Studiów** (grupa „Na co dzień”), żeby wiersze były krótsze. To zmiana w danych menu (`nawigacja.json`, Web-Ustawienia), czyli w CMS: wypisz ją w raporcie dla redakcji. Do czasu zmiany w CMS możesz pominąć zewnętrzny link USOS w tym pasie w kodzie.
- Rekrutacja zostaje też w panelu hamburgera (zalecenie 6).
