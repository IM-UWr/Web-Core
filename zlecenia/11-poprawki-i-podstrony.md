# Zlecenie 11: poprawki po pracy nocnej (W PRZYGOTOWANIU, 4.11.2026)

Stan: **szkic, uzupełniany w rozmowie.** Nie wykonywać, dopóki w nagłówku nie będzie „GOTOWE”.
Podstawa: gałąź `wyglad/zalozyciele` (`d12c994`), raport `RAPORT-WYGLAD.md`, pytania `PYTANIA.md`, specyfikacja `dok/estetyka.md` na gałęzi `kopia/2026-11-01-estetyka-prototypy`.

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
