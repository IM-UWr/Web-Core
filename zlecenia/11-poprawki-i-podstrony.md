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
