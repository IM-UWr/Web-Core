# Pytania z pracy nocnej (zlecenie 10, wygląd „Założyciele”)

Każde pytanie: co było niejasne, jaką odpowiedź przyjąłem (najbezpieczniejszą zgodną z ustaleniami), w którym commicie i jak ją cofnąć. Odpowiedzi w czacie uwzględniam od następnego kroku.

## 1. Treści do budowania: w repozytorium ich nie ma
**Pytanie.** Zlecenie mówi „nie uruchamiaj `skrypty/pobierz_tresci.py`, budujesz na treściach, które są w repozytorium”. Ale w Web-Core nie ma treści: `src/content/**`, większość `src/data/**` i `public/pliki/**` są w `.gitignore` i przychodzą z repozytoriów IM-UWr/Web-*. Bez nich `npx astro build` kończy się błędem (`Could not resolve "../data/publikacje.json"`). Treści nie ma też w żadnej gałęzi ani w historii Web-Core. Próba dołączenia repozytoriów Web-* do sesji została odrzucona przez uprawnienia środowiska. Na czym budować?

**Przyjęta odpowiedź.** Nie uruchamiam skryptu i nie pobieram repozytoriów Web-*. Buduję na **danych testowych** wygenerowanych lokalnie (poza gitem, tylko w ścieżkach z `.gitignore`), odtworzonych z danych prototypu (`proto/zasoby/*.json`) i ze zbudowanej kopii obecnej strony na gałęzi `podglad-agent-nauka-podglad`. Zdjęcia nagłówków i Władz biorę z `proto/zasoby/`. Data budowania jest zamrożona na 2.11.2026, 10:00, żeby dwa buildy dawały ten sam HTML.
- Konsekwencje: dowód z etapu 1 (identyczny HTML) jest zrobiony na danych testowych, nie na prawdziwych. Zrzuty pokazują dane testowe (struktura i teksty jak na obecnej stronie, ale niekompletne).
- **Do zrobienia u Ciebie:** powtórzyć porównanie z etapu 1 na komputerze z prawdziwymi treściami (instrukcja w `RAPORT-WYGLAD.md`).

**Commit.** Żaden — dane testowe nie trafiają do repozytorium (są w ścieżkach ignorowanych przez git).
**Jak cofnąć.** Nic do cofania. Jeśli pozwolisz na dostęp do repozytoriów Web-*, zbuduję i porównam jeszcze raz na prawdziwych treściach.

## 2. Gałęzie etapów
**Pytanie.** Zlecenie pozwala wypychać stan po każdym etapie na `wyglad/01-krok-zero`, `wyglad/02-fundament` itd. W czacie napisałeś: „Pracujesz na gałęzi wyglad/zalozyciele i tylko na nią pushujesz”.

**Przyjęta odpowiedź.** Pushuję wyłącznie na `wyglad/zalozyciele`. Etapy oznaczam w opisach commitów („Etap 1: …”). Ostatni commit każdego etapu jest wypisany w `RAPORT-WYGLAD.md`, więc gałęzie etapów można później założyć jednym poleceniem (`git branch wyglad/01-krok-zero <commit>`).

**Commit.** Nie dotyczy.
**Jak cofnąć.** Nie dotyczy (gałęzie etapów można założyć w każdej chwili z commitów podanych w raporcie).

## 3. Przełącznik trybu ciemnego na komputerze
**Pytanie.** Specyfikacja wymienia w pasku menu tylko działy, Aktualności, Rekrutację, Szukaj i EN. Księżyc (tryb ciemny) jest tylko na okładce strony głównej. Czy na podstronach komputerowych zostawić przełącznik motywu?

**Przyjęta odpowiedź.** Jak w specyfikacji i prototypie: księżyc tylko na okładce. Wybór motywu jest zapamiętany w przeglądarce (`localStorage`), więc obowiązuje na wszystkich stronach. Na telefonie przełącznik zostaje bez zmian.

**Commit.** Etap 2 (`src/components/zal/PasekMenu.astro`). **Jak cofnąć.** Dodać w `PasekMenu.astro` przycisk `<button type="button" data-motyw …>` (obsługę ma już skrypt w `Naglowek.astro`).

## 4. Wyróżniona aktualność („Wyróżnij do…”) na okładce
**Pytanie.** Na obecnej stronie wpis z polem „Wyróżnij do…” pokazuje się jako żółty pasek nad nazwą Instytutu. W prototypie okładki plakietka jest ukryta („propozycja do potwierdzenia: plakietka na sprawy pilne”). Ukryć ją?

**Przyjęta odpowiedź.** Pole CMS działa dalej, więc plakietka pokazuje się nad logo tylko wtedy, gdy jest wyróżniony wpis (wygląd z prototypu). Bez wyróżnionego wpisu okładka wygląda dokładnie jak prototyp.

**Commit.** Etap 2 (`src/components/zal/Okladka.astro`). **Jak cofnąć.** Usunąć linię z `z-okl-flaga` w `Okladka.astro`.

## 5. Rok przy „Kontinuum Knastera”
**Pytanie.** Opis znaku ma mieć nazwę twierdzenia i rok. W prototypie przy Studiach roku nie było, a przy Nauce rok był tylko w notce („1931”).

**Przyjęta odpowiedź.** „Pochodna Liego, 1931” (rok z notki w prototypie) i „Kontinuum Knastera, 1922” (praca Knastera w Fundamenta Mathematicae, 1922). Wszystkie teksty o patronach są w `src/lib/patroni.ts` oznaczone jako do sprawdzenia.

**Commit.** Etap 2. **Jak cofnąć.** Zmienić `znakNazwa` w `src/lib/patroni.ts`.

## 6. Nowy nagłówek od razu na wszystkich podstronach
**Pytanie.** Etap 2 to „fundament” (szablon i nagłówki), a przeniesienie pozostałych podstron na wspólny szablon to etap 4. Pasek menu leży na banerze, więc strony ze starym banerem i nowym paskiem wyglądałyby źle.

**Przyjęta odpowiedź.** Nowy nagłówek podstrony (głęboki kolor działu ze zdjęciem, „← Dział”, sygnet, podpis, znak) wchodzi w etapie 2 na wszystkie podstrony komputerowe przez `NaglowekStrony.astro`. Treść pod nagłówkiem zostaje stara (z nowymi kolorami i krojami) aż do etapów 3–4. Strony bez banera (np. pojedyncza aktualność) mają pasek na granacie.

**Commit.** Etap 2. **Jak cofnąć.** W `NaglowekStrony.astro` usunąć wstawkę `<NaglowekZ …>` i klasę `ph-z`.

## 7. Drugi ekran strony głównej: kolumna 1240 px czy cała szerokość?
**Pytanie.** Kolumna 1240 px jest ustalona dla stron działów i podstron. Prototyp drugiego ekranu strony głównej idzie na całą szerokość (marginesy 48 px, pasek 40 px).

**Przyjęta odpowiedź.** Jak w prototypie: drugi ekran, jego pasek i stopka na całą szerokość z marginesem 48/40 px; pozostałe strony w kolumnie 1240 px.

**Commit.** Etap 3 (`4796664a`). **Jak cofnąć.** W `src/styles/zalozyciele-strony.css` zmienić `--marg: 48px` w `.z-druga` na `max(48px, calc((100% - var(--kol)) / 2))` i usunąć dwie reguły „strona główna: drugi ekran na całą szerokość”.

## 8. Kolor działu przy wpisach na stronie głównej
**Pytanie.** Wpisy w kolumnach mają nazwę działu w jego kolorze, a miniatura bez zdjęcia — sygnet działu. Aktualności nie mają jeszcze pola „Dział” (zmiana CMS „na później”).

**Przyjęta odpowiedź.** Reguła z `dok/estetyka.md` („jeśli pole jest puste, dział liczy się automatycznie”): `dla` studenci lub kandydaci → Studia; sukces, obrona albo wpisany zakład → Nauka; reszta → Instytut. Wydarzenia biorą dział ze swojego wpisu, obrony i konferencje — Nauka, terminy kierunków — Studia. Popularyzacji automatycznie nie przypisujemy (potrzebne pole CMS).

**Commit.** Etap 3 (`4796664a`). **Jak cofnąć / zmienić.** Funkcja `dzialWpisu` w `src/components/zal/DrugiEkran.astro`; po dodaniu pola CMS wystarczy, żeby brała `dzial` z wpisu, gdy jest.

## 9. „Warto wiedzieć” na drugim ekranie
**Pytanie.** Prototyp pokazuje cztery stałe pozycje; obecna strona losuje je przy każdym wejściu (decyzja 30.10.2026).

**Przyjęta odpowiedź.** Zachowane losowanie (ten sam skrypt co dotąd): „Zawsze pokazuj” na początku, reszta losowo, bez JS — pierwsze cztery według kolejności.

**Commit.** Etap 3 (`95f76d6b`). **Jak cofnąć.** Usunąć `data-losuj` i skrypt `LOSUJ` w `DrugiEkran.astro`.

## 10. Popularyzacja: „To be announced” czy inicjatywy z danych?
**Pytanie.** Prototyp pokazuje cztery sekcje „To be announced”. W danych (`src/data/popularyzacja.json`) trzy grupy mają już opisane inicjatywy, widoczne dziś na telefonie.

**Przyjęta odpowiedź.** Pokazuję inicjatywy z danych (nazwa, opis, „Dla kogo · domena”); „To be announced” tylko przy grupie bez inicjatyw. Liczby TBA w banerze ukryte jak w prototypie.

**Commit.** Etap 3 (`658fd48d`). **Jak cofnąć.** W `src/views/Popularyzacja.astro` (blok `TrescDzialu`) pokazywać dla każdej grupy tylko „To be announced”.

## 11. Usuwanie starego kodu wyglądu komputerowego (etap 4)
**Pytanie.** Zlecenie każe usunąć stary kod komputera, którego nic już nie używa, bez ruszania telefonu. Część starych reguł (nagłówek, baner strony głównej, układy „zwarta”/„portal”) jest wspólna z telefonem albo potrzebna stronom, których jeszcze nie przeniesiono.

**Przyjęta odpowiedź.** Nic nie usunąłem; kandydaci są wypisani w raporcie (etap 4). Bezpieczniej usuwać po przeniesieniu wszystkich podstron i ze sprawdzeniem na prawdziwych treściach.

**Commit.** Nie dotyczy. **Jak zmienić.** Osobne zadanie po przeniesieniu pozostałych podstron.

## 12. Gdzie trzymać próbną wersję na telefon (prośba z 2.11.2026)?
**Pytanie.** Właściciel poprosił o **testową** wersję „Założycieli” na telefon, wyraźnie oznaczoną, żeby inni agenci się na niej nie wzorowali. Push wolno robić tylko na `wyglad/zalozyciele`, a na tę gałąź test trafić nie powinien.

**Przyjęta odpowiedź.** Test nie trafia do Web-Core w ogóle: to łatka `testy/telefon-TEST.patch` w repozytorium `IM-UWr/Web-Podglad`, nakładana na `wyglad/zalozyciele` tylko przy budowaniu podglądu https://im-uwr.github.io/Web-Podglad/test-telefon/ (plakietka „TEST · wersja na telefon” na każdej stronie). **Agenci: to nie jest ustalony projekt telefonu — nie wzorować się, nie nakładać łatki.** Obowiązujący telefon na tej gałęzi to dotychczasowy wygląd (`.tylko-komputer` / `.tylko-telefon` bez zmian).

**Commit.** Web-Podglad `1965ae5`; na tej gałęzi tylko ten wpis. **Jak cofnąć.** Usunąć `testy/telefon-TEST.patch` i krok „TEST telefonu” z `.github/workflows/podglad.yml` w Web-Podglad.

# Zlecenie 12: przebudowa i porządki (noc 4–5.11.2026)

Odpowiedzi przyjęte samodzielnie (najbezpieczniejsze zgodne z ustaleniami); szczegóły i zrzuty: `RAPORT-PORZADKI.md`.

## 12.1. Menu: pasek na komputerze, nagłówek z hamburgerem na telefonie
**Pytanie.** „Jedna wersja HTML” — czy menu też ma być jednym elementem? Łatka telefonu zostawiła na telefonie dotychczasowy
nagłówek (`Naglowek.astro`, przemalowany na granat, z sygnetami działów w menu), a komputer ma pasek `PasekMenu.astro`.
**Przyjęta odpowiedź.** Dwa elementy nawigacji, każdy tylko na swoją szerokość (pasek ≥ 761 px, nagłówek z menu ≤ 760 px),
bez powtarzania treści strony. Z `Naglowek.astro` usunąłem stare menu komputera (rozwijane listy, pole szukania). Połączenie
w jeden komponent to osobna praca projektowa (zalecenie 6 zlecenia 11 dotyczy paska i hamburgera).
**Jak zmienić.** Nowy komponent menu dla obu szerokości zamiast `PasekMenu` + `Naglowek`.

## 12.2. Strony bez działu (Deklaracja dostępności, Polityka prywatności)
**Pytanie.** Te strony miały dotąd stary układ ze spisem w kafelku. **Przyjęta odpowiedź.** Dostały wspólny szablon
podstrony i wzorzec treści, z granatowym nagłówkiem (jak Aktualności).

## 12.3. „Warto wiedzieć” na stronie głównej na telefonie
**Pytanie.** Łatka losuje cztery pozycje tylko na komputerze; na telefonie pokazuje je w stałej kolejności.
**Przyjęta odpowiedź.** Jak w łatce (telefon identyczny z łatką). **Jak zmienić.** W `DrugiEkran.astro` (stała `LOSUJ`)
usunąć warunek `matchMedia('(min-width: 761px)')`.

## 12.4. Pole CMS „Prawy pasek” (`pasek_boczny`) na stronach tekstowych
**Pytanie.** Wartości `menu` i `oba` pokazywały dotąd menu działu w prawym pasku; w nowym szablonie menu działu na
podstronie nie ma. **Przyjęta odpowiedź.** `spis` i `oba` — spis „Na tej stronie”; `menu` i `brak` — bez spisu.
**Potrzebna zmiana w CMS (do decyzji):** uprościć pole do „Spis na tej stronie: tak / nie”.

## 12.5. Ustawienia wyglądu w CMS, które już nic nie zmieniają
**Pytanie.** „Tło strony” (`tlo_strony`), „Sekcje” (`sekcje`: pasy / linia / karty) i „Nagłówki podstron”
(`naglowki_podstron.wariant`) dotyczyły starego wyglądu. **Przyjęta odpowiedź.** Pola zostają w CMS i w danych (nie zmieniam
konfiguracji CMS), ale nowy wygląd ich nie używa (stare style usunięte w etapie 4). **Do decyzji:** usunąć te pola z Pages CMS.

## 12.6. Liczby w banerze Projektów i grantów na telefonie
**Pytanie.** Cztery liczby w trzech kolumnach — ostatnia wychodzi poza ekran (tak było w łatce). **Przyjęta odpowiedź.**
Bez zmian (telefon identyczny z łatką); rozwiązuje to zalecenie 2 zlecenia 11 (liczby w jednym rzędzie, nadmiarowe chowane).

## 12.7. Menu telefonu: ciemne kolory panelu na każdej stronie
**Pytanie.** Dotąd panel menu dostawał ciemne kolory (`.menu-ciemne`) tylko na stronie głównej (nagłówek na zdjęciu);
na podstronach kreski w panelu były jasne. Nagłówek jest teraz zawsze granatowy. **Przyjęta odpowiedź.** Ciemne kolory
panelu na każdej stronie (jak na głównej). **Jak cofnąć.** Usunąć klasę `menu-ciemne` z `.mnav` i `.mnav-tlo` w `Naglowek.astro`.

## 12.8. Liczby w banerze Kierunku
**Pytanie.** Baner Kierunku miał na komputerze miejsce na liczby, ale żadnej nie pokazywał (dwie listy chowały się nawzajem).
**Przyjęta odpowiedź.** Pokazuję fakty kierunku (np. „3 lata — studia I stopnia”, „A+ — kategoria naukowa”); na telefonie
schowane jak dotąd. Przy czterech faktach rząd łamie się na komputerze — rozwiązuje to zalecenie 2 zlecenia 11.
**Jak cofnąć.** W `Kierunek.astro` usunąć listę `.kh-liczby` ze slotu `baner`.

## 12.9. Sygnety w menu telefonu a rozmiar stron
**Pytanie.** Łatka telefonu wstawia w menu cztery szkice-sygnety w linii: +16 kB HTML na każdej z 748 stron (łącznie HTML
+3%). **Przyjęta odpowiedź.** Zostawione (telefon identyczny z łatką). **Do decyzji:** sygnety jako jeden plik SVG z maską CSS.

## 12.10. Przełącznik `uklad` („zwarta portal-baner”)
**Pytanie.** Zlecenie wymienia przełączniki wariantów jako kandydatów do usunięcia, „jeśli nic poza starym wyglądem z nich nie
korzysta”. Nowy wygląd korzysta: interlinia nagłówka i treści na 105 stronach zależy od `data-uklad`. **Przyjęta odpowiedź.**
Przełącznik zostaje (pliki przycięte do żywych reguł); usunięcie = jedna wartość dla wszystkich stron i zmiana pikseli na
części z nich — do zrobienia razem z ujednoliceniem odstępów. `skrypty/warianty.py` zostaje, bo używa go `deploy.yml`.
