# Strona Instytutu Matematycznego UWr

Nowa strona Instytutu Matematycznego Uniwersytetu Wrocławskiego — kod strony (repozytorium **Web-Core** organizacji [IM-UWr](https://github.com/IM-UWr)). Treści są w osobnych repozytoriach `IM-UWr/Web-*`.

- **Podgląd:** https://im-uwr.github.io/Web-Core/
- **Technologia:** [Astro](https://astro.build) (strona statyczna, jeden plik HTML na podstronę) + komponenty React (tabela pracowników, galeria zdjęć)
- **Treści:** pliki Markdown/YAML w repozytoriach `IM-UWr/Web-*` (lista w `tresci.json`), edytowane w [Pages CMS](https://app.pagescms.org)
- **Wzory:** LaTeX w treściach (`$...$` i `$$...$$`), wyświetlany przez KaTeX
- **Publikacja:** GitHub Actions → GitHub Pages: po zmianie w Web-Core, po zmianie w dowolnym repozytorium treści (sygnał „tresc-zmieniona”, 2–3 minuty) i dwa razy dziennie

## Dla redaktorów (Pages CMS)

1. Wejdź na https://app.pagescms.org i zaloguj się kontem GitHub (albo przez link z zaproszenia e-mailowego).
2. Wybierz repozytorium swojej części strony, np. `IM-UWr/Web-Aktualnosci`, `IM-UWr/Web-Sem-Topologia`, `IM-UWr/Web-Ustawienia`.
3. Edytuj treści w sekcjach po lewej.
4. Po zapisaniu strona przebuduje się sama w ok. 2–3 minuty. **Nie ma wersji roboczych:** zapisany wpis od razu trafia na stronę,
   a repozytoria są publiczne (także historia zmian) — nie wgrywaj niczego, co nie może być jawne.

| Repozytorium | Co zawiera |
|---|---|
| Web-Ustawienia | menu, stopka, kafelki „Na skróty”, baner, nagłówki działów, tło i sekcje, deklaracja dostępności, polityka prywatności |
| Web-Aktualnosci | aktualności i obrony doktorskie |
| Web-Pracownicy | pracownicy, doktoranci, administracja |
| Web-Instytut | zakłady, władze, kontakt, infrastruktura informatyczna, „Warto wiedzieć” |
| Web-Nauka | konferencje, projekty i granty, publikacje, sukcesy |
| Web-Studia | kierunki, strony studiów i szkoły doktorskiej, rok akademicki i kolory dni |
| Web-Popularyzacja | popularyzacja |
| Web-Spec-… | po jednej specjalności |
| Web-Sem-… | po jednym seminarium (opis i referaty) |

Wskazówki:

- **Wydarzenie** — wpis w Aktualnościach z wypełnionym polem *Wydarzenie: początek* trafia do „Najbliższych wydarzeń” i do kalendarza (.ics).
- **Wyróżnij do…** — wpis pokazuje się w żółtym pasku nad nazwą Instytutu na stronie głównej i znika sam po tej dacie.
- **Referaty** — dodawaj w folderze właściwego seminarium. Streszczenia piszemy w Markdown, wzory w `$...$`.
- **Wersja angielska** — pola „EN: …”. Jeśli są puste, angielska wersja strony pokaże tekst polski z odpowiednią informacją.
- **Linki wewnętrzne** zaczynaj od `/`, np. `/studia/matematyka` albo `/pliki/aktualnosci/plakat.pdf`.

## Struktura repozytorium

Web-Core zawiera kod; treści z repozytoriów `IM-UWr/Web-*` mają **te same ścieżki** co poniżej i są nakładane na Web-Core
przez `skrypty/pobierz_tresci.py` przed każdym budowaniem (każdy plik może pochodzić tylko z jednego repozytorium).

```
tresci.json                lista repozytoriów treści (nowe seminarium → dopisz repozytorium)
skrypty/pobierz_tresci.py  pobieranie i nakładanie treści (kopie w .tresci/, pomijane przez git)
src/content/…, src/data/…  treści — w repozytoriach Web-* (tu tylko src/data/plan: plan zajęć z USOS)
public/pliki/              zdjęcia i dokumenty — w repozytoriach Web-* (tu tylko logo UWr)
src/styles/global.css      kolory (tokeny na górze pliku), typografia, układ
src/views, src/components  szablony stron
```

Kolory i zaokrąglenia zmienia się w jednym miejscu — w zmiennych na początku `src/styles/global.css` (tryb jasny i ciemny).

## Praca lokalna

Wymagany Node.js 20 lub nowszy.

```bash
npm install
python3 skrypty/pobierz_tresci.py   # treści z repozytoriów IM-UWr/Web-* (powtórz, żeby odświeżyć)
npm run dev        # podgląd na http://localhost:4321/Web-Core/
npm run build      # pełna wersja do katalogu dist/ (z wyszukiwarką)
npm run preview
```

## Kalendarz

- `/kalendarz/wszystko.ics` — wydarzenia, obrony i referaty
- `/kalendarz/wydarzenia.ics` — bez seminariów
- `/kalendarz/seminarium-<nazwa>.ics` — jedno seminarium

## Kierunki, specjalności i programy studiów — jak edytować

Wszystko jest w Pages CMS, bez zaglądania do kodu. Każda informacja jest wpisana w jednym miejscu.

- **Kierunek** (np. Matematyka, SIAD, ISIM, Szkoła doktorska): sekcja **Kierunki studiów**. Pola są ułożone jak sekcje strony (① nagłówek … ⑦ menu i strona główna). Kierunek sam pojawia się w menu „Studia” i jako kafelek na stronie głównej (pola ⑦: kolejność, krótka nazwa, napis i zdanie na kafelku).
- **Nowy program studiów** (np. od 2027/28): w kierunku, pole ③ *Programy studiów* → dodaj pozycję z „od roku” = 2027 i dokumentami (przycisk *Wgraj plik* albo link do BIP); staremu programowi wpisz „do roku” = 2026. Uaktualnij ③ *Jak wyglądają studia* (semestry, ECTS, terminy) i ③ *Terminy i formularze*.
- **Specjalność**: sekcja **Specjalności** — podstrona i kafelek na stronie kierunku budują się z tego samego wpisu (nazwa, skrót, zdanie pod nazwą, opiekunowie, zakład; na kafelek dodatkowo jedno zdanie „Dla kogo” i „Po studiach”). Specjalność bez podstrony (np. wygaszana): zaznacz *Bez własnej podstrony*.
- **Opiekunowie**: wpisuj imię i nazwisko dokładnie jak w spisie pracowników — tytuł, e-mail i pokój dobiorą się same.
- **Dodatkowe kafelki** na stronie głównej (np. studia podyplomowe): Ustawienia → Ustawienia ogólne → Sekcja „Studiuj matematykę”.

## Powiadomienia e-mail o referatach

Na stronie każdego seminarium jest formularz „Powiadomienia e-mail”. Zapisani dostają elegancką wiadomość po angielsku o każdym nowym referacie, z linkiem do wypisania się. Obsługuje to skrypt Google Apps Script z katalogu `skrypty/powiadomienia/` (lista adresów w arkuszu Google, wysyłka z konta Google, które uruchomi skrypt).

- Zapis z podwójnym potwierdzeniem: adres trafia na listę dopiero po kliknięciu linku w e-mailu (nikt nie zapisze cudzego adresu).
- Duplikaty: wielkość liter jest ignorowana zawsze; kropki i dopiski `+coś` — tylko w adresach Gmaila (`gmail.com`, `googlemail.com`), bo tylko Gmail je ignoruje. Ten sam adres w kilku wersjach dostanie wiadomość raz.
- Wysyłka: skrypt co 10 minut czyta `/seminaria/powiadomienia.json` (generowany przez stronę). Nowy, przyszły i opublikowany referat → wiadomość do zapisanych (po 15 minutach od pojawienia się, żeby zdążyć poprawić literówki). Referaty dodane po fakcie nie są ogłaszane.
- Linki z wiadomości prowadzą na stronę `/powiadomienia/` (potwierdzenie zapisu, wypisanie przyciskiem).
- Limity Google: konto Gmail ok. 100 odbiorców dziennie, konto Google Workspace ok. 1500. Gdy limit się skończy, skrypt dokończy wysyłkę następnego dnia. Do większych list najlepiej osobne konto Workspace Instytutu (np. seminaria@…).

### Instalacja (jednorazowo, ok. 10 minut)

1. Zaloguj się na konto Google, z którego mają wychodzić wiadomości, i otwórz https://script.google.com → **Nowy projekt** (nazwa np. „Powiadomienia seminaria IM UWr”).
2. Wklej zawartość `skrypty/powiadomienia/Code.gs` zamiast domyślnego kodu. W **Ustawieniach projektu** zaznacz „Pokaż plik manifestu appsscript.json” i wklej do niego `skrypty/powiadomienia/appsscript.json`.
3. Na górze `Code.gs` w `KONFIG` sprawdź: `KANAL` (adres strony + `/seminaria/powiadomienia.json`), `NADAWCA`, `ODPOWIEDZ_DO` (np. adres sekretariatu).
4. Wybierz funkcję **ustaw** i kliknij **Uruchom** → zezwól na dostęp. Funkcja tworzy arkusz „Powiadomienia seminaria IM UWr” na Dysku, zapamiętuje obecne referaty (żeby nie rozesłać starych) i włącza sprawdzanie co 10 minut.
5. **Wdróż → Nowe wdrożenie → Aplikacja internetowa**: „Wykonaj jako: ja”, „Kto ma dostęp: każdy”. Skopiuj adres kończący się na `/exec`.
6. W Pages CMS: **Ustawienia → Ustawienia ogólne → Powiadomienia e-mail o referatach → Adres automatu** — wklej adres i zapisz. Po przebudowie formularze na stronach seminariów zaczną działać.
7. Test: zapisz się na stronie seminarium, kliknij link w e-mailu. Funkcja **wyslijTest** wysyła podgląd wiadomości o referacie na Twój adres, **podsumowanie** pokazuje liczbę zapisanych.

Po zmianie kodu skryptu: **Wdróż → Zarządzaj wdrożeniami → Edytuj → Nowa wersja** (adres `/exec` się nie zmienia). Po przeniesieniu strony na domenę UWr zmień `KANAL` w `KONFIG`.

## Plan zajęć (automatycznie z USOS)

Strona `/studia/plan-zajec` ma układ dawnego planZ.php / planL.php: alfabetyczna lista przedmiotów w tych samych sekcjach, oba semestry (kotwice `#zimowy`, `#letni`).

- Dane: `src/data/plan/plan.json` — **nie edytuje się ich ręcznie**.
- Workflow „Plan zajęć z USOS” (`.github/workflows/plan-zajec.yml`) uruchamia `skrypty/plan/pobierz_plan.py` 3 razy dziennie (1:47, 9:37, 15:47 UTC) albo ręcznie (Actions → Run workflow). Gdy plan się zmienił, commituje plik i zleca przebudowę strony.
- Źródło: publiczny eksport USOSweb `https://usosweb.uwr.edu.pl/planIM.php?cdyd_kod=<semestr>` (ten sam, z którego korzystał stary plan); zapasowo anonimowe USOS API (bez uwag). Semestry ustalają się same. Przy przerwie technicznej USOS zostają poprzednie dane.
- Bez klucza USOS API. Warto poprosić zespół USOS UWr o utrzymanie eksportu `planIM.php` po wyłączeniu starej strony.
- Jeśli gałąź main dostanie ochronę, trzeba dopuścić commity GitHub Actions.

## Kalendarz zajęć (kolory dni)

Strona `/studia/rok-akademicki` (scalona z dawnym kalendarzem zajęć; stary adres przekierowuje) i kafelek na stronie głównej liczą kolory dni same (reguła sprawdzona na PDF-ach z lat 2021–2027). W CMS: **Kalendarz zajęć (kolory dni)** → semestr → okres zajęć, dni wolne i zamiany dni z zarządzenia o organizacji roku; święta ustawowe dodają się same. Kontrola: na stronie każdy dzień tygodnia powinien wypaść 15 razy. Ogłoszenia o zamianach dni tworzą się same (5 dni roboczych przed, znikają po dniu zamiany); szablon tekstu: ten sam wpis → „Automatyczne ogłoszenia o zamianach dni”. Tekst strony (sesje, terminy): CMS → „Rok akademicki — tekst strony”.

## Repozytoria treści i przebudowa strony

Każde repozytorium treści ma workflow `.github/workflows/powiadom.yml`: po każdej zmianie wysyła do Web-Core zdarzenie
`repository_dispatch` typu `tresc-zmieniona`, które uruchamia budowanie i publikację. Klucz to aplikacja GitHub organizacji
„powiadomienia” (zainstalowana tylko na Web-Core, uprawnienie Contents: read & write) — zmienna `POWIADOM_APP_ID`
i sekret `POWIADOM_KLUCZ` ustawione raz dla organizacji (dla repozytoriów publicznych).

**Nowe repozytorium treści** (np. nowe seminarium): utwórz je w IM-UWr jako publiczne, skopiuj `.pages.yml`,
`README.md` i `.github/workflows/powiadom.yml` z repozytorium tego samego rodzaju (np. innego seminarium), zmień ścieżki
w `.pages.yml`, dodaj plik treści i dopisz nazwę repozytorium w `tresci.json` w Web-Core.

## Domena UWr

Po przydzieleniu domeny: Settings → Pages → Custom domain. Adres i ścieżkę bazową workflow pobiera automatycznie z ustawień Pages, więc w kodzie nic nie trzeba zmieniać.
