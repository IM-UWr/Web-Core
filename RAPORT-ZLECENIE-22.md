# Raport: zlecenie 22 — wszystkie pola w CMS i praca edytorów na gałęzi (6.11.2026)

**Etapy 0–7 są zrobione lokalnie, z commitami. Nic nie jest wypchnięte.** Etapy 8–11 czekają na bramki: „push”, próbę w CMS, „przełącz”. Numer 22 był wolny. Zlecenie 22 ma osobne commity, zlecenia 21 w nich nie ma.

Skrypt kontrolny daje **0 problemów przy 567 plikach**. Dwa pola zostawiłem widoczne wbrew tabeli etapu 2, bo zmieniają wygląd. Żadnego formularza nie sprawdzono jeszcze w prawdziwym Pages CMS: to etap 9.

## Do decyzji właściciela

1. **`naglowki_podstron.wariant` (Web-Ustawienia, „Wygląd”).** Zlecenie każe ukryć cały `naglowki_podstron`, ale `wariant` zmienia cienką linię pod nagłówkiem każdej podstrony na komputerze. Reguła etapu 2 mówi wtedy: zostawić widoczne. Ukryłem więc tylko `zdjecia`, które nic nie zmieniają, a `wariant` ma etykietę z objaśnieniem. To efekt uboczny, a nie funkcja dla redaktora, więc radzę ukryć też `wariant`. Wymaga to jednego wiersza i żaden wygląd się nie zmieni.
2. **`pochodzenie` (Web-Nauka, wykazy publikacji).** Wartość wybiera zdanie nad wykazem („Wersja tekstowa przygotowana na podstawie wykazu w pliku PDF…” albo „Wykaz przeniesiony z poprzedniej strony…”). Zostawiłem pole widoczne, ale jako listę wyboru, a nie tekst, jak chciało zlecenie, bo inna wpisana wartość po cichu usunęłaby zdanie. Etap 9 wymienia je jako ukryte. Próba ukrytego pola zostaje na `zrodla` w tym samym wykazie. Gdyby miało być ukryte, to też jeden wiersz.
3. **`haslo`, `haslo_en` w „Strona główna i kontakt”.** Dopisałem, bo każe tak etap 1, ale nowa okładka tego pola nie czyta. Redaktor zobaczy pole bez działania. Tabela etapu 2 go nie wymienia, więc nie ukrywałem. Radzę ukryć.

## Co się zmieni na podglądzie po „push”

Znikną dane testowe, więc niektóre miejsca będą uboższe albo puste. To skutek danych, a nie zmiana układu. Porównanie jest w `raport-zrzuty/z22-glowna-bez-testowych.png` (na górze przed, na dole po).

- **Strona główna, „Nadchodzące wydarzenia”:** „Brak wydarzeń w najbliższych tygodniach”, bo wszystkie 3 pozycje z listy były testowe. Kolumna jest przez to w dużej części pusta.
- **Okładka:** znika licznik „1 wydarzenie” nad „Szybki dostęp”. Układ zostaje.
- **„Warto wiedzieć” na głównej:** 3 pozycje zamiast 4.
- **Seminaria:** 22 referaty w archiwum zamiast 27.
- **Aktualności:** lista krótsza, na pierwszym miejscu „Rusza tutoria”.

## Etapy i commity

| Etap | Co | Repozytorium | Commit |
| --- | --- | --- | --- |
| 0 | Stan wyjściowy | wszystkie | bez commitów, nic nie trzeba było przenosić |
| 1 | Brakujące pola | 18 repozytoriów | tabela niżej |
| 2 | Pola techniczne i bez działania | Web-Nauka | `dcd364f` |
| 2 | ″ | Web-Ustawienia | `8d7ce42` |
| 2 | ″ | Web-Studia | `910f99c` |
| 3 | Gałąź Web-Pracownicy | Web-Pracownicy | gałąź na `48a9e24`, równa `origin/main`, bez commitu |
| 4 | 53 pliki testowe | Web-Aktualnosci: 7 wpisów, 25 załączników | `bcedb4e` |
| 4 | ″ | Web-Instytut: 10 wpisów, 6 załączników | `f6c4625` |
| 4 | ″ | Web-Sem-Analiza-Harmoniczna: 1 wpis | `0828356` |
| 4 | ″ | Web-Sem-Dyskretna-Analiza-Harmoniczna: 1 wpis | `6c9a2fd` |
| 4 | ″ | Web-Sem-Prawdopodobienstwo: 1 wpis | `5e45fd0` |
| 4 | ″ | Web-Sem-Rownania-Rozniczkowe: 1 wpis | `8bf46ea` |
| 4 | ″ | Web-Sem-Statystyka: 1 wpis | `a972fe6` |
| 5 | `pobierz_tresci.py` i README | Web-Core, `wyglad/zlecenie-16` | `a43fb368` |
| 5 | Ten sam commit | Web-Core, lokalny `main` | `446e98e3` |
| 6 | `skrypty/sprawdz_pola_cms.py` | Web-Core, `wyglad/zlecenie-16` | `0ca71fff` |
| 7 | Raport | Web-Core, `wyglad/zlecenie-16` | ten commit |

**Etap 1, commity:** Web-Instytut `418bf10`, Web-Nauka `13a8ef4`, Web-Studia `8dabf71`, Web-Ustawienia `045b2f3`, Web-Spec-Aktuarialno-Finansowa `a6aa522`, Web-Spec-Analiza-Danych `2f6e60d`, Web-Spec-Nauczycielska `78e9ca4`, Web-Spec-Stosowana `07d8459`, Web-Spec-Teoretyczna `f44f914`, Web-Sem-Analiza-Harmoniczna `c8a1a9c`, Web-Sem-Dydaktyka `009f7b5`, Web-Sem-Dyskretna-Analiza-Harmoniczna `7ef5606`, Web-Sem-Geometria `b99d156`, Web-Sem-Prawdopodobienstwo `0f91315`, Web-Sem-Rownania-Rozniczkowe `db9108c`, Web-Sem-Statystyka `731ef74`, Web-Sem-Teoria-Modeli `311a148`, Web-Sem-Topologia `2d5387c`.

**Lokalny `main` Web-Core:** był 71 commitów za `origin/main`. Przesunąłem go do `origin/main` (`9606ef41`, bez własnych zmian) i dodałem commit z etapu 5. Jest 1 commit przed `origin/main`. Worktree do tego był osobny, nakładki ani serwerów dev to nie dotknęło.

## Etap 0: stan i różnice

**Commity zlecenia 21:** wszystkie są już wypchnięte. Web-Core stał na `e6b6cb25`, równo z `origin/wyglad/zlecenie-16`. Niezacommitowane były tylko `.claude/` i `package-lock.json`. Zlecenie 21 nie dodało pól danych: `src/content.config.ts` bez zmian, a w `src/data` zmieniły się tylko `ciekawostki/*`, które zostają w kodzie.

| Sprawa | Stan | Co zrobiłem |
| --- | --- | --- |
| Gałąź 20 klonów | Stały na lokalnym `main`, nie na `wyglad/zlecenie-16` | Przełączyłem. `wyglad/zlecenie-16` była w każdym równa `origin`, 0 lokalnych commitów |
| Lokalny `main` w 20 klonach | Przed `origin/main` o commity, które są też na gałęzi | Zostawiłem bez zmian, praca się nie zgubiła. Tych `main` nie wolno wypychać |
| Web-Pracownicy | Nie było klonu | Sklonowałem do `tresci\Web-Pracownicy` |
| Inna treść, klon a nakładka | 0 plików na 1240 | Nic do przeniesienia |
| Tylko końce linii, klon a nakładka | 193 pliki: 129 `.yml`, 60 `.md`, 4 `.json` | Nie ruszałem |
| Tylko w klonie | 0 plików | — |
| Tylko w nakładce | `public/pliki/baner/instytut-telefon.jpg` | Nie przeniosłem: kod nie używa go od zlecenia 18, a prawa do zdjęcia są nieustalone. `baner.zdjecie_telefon` nadal na niego wskazuje, bez skutku; pole jest teraz ukryte |
| Skrypt kontrolny przed zmianami | 211 problemów w 590 plikach | Zgodnie ze zleceniem |
| `.przekazanie\pola-do-cms.md` | Żadnego pola spoza formularzy i etapu 1 | Nic nie dopisywałem ponad zlecenie. Dopisałem podsumowanie zlecenia 22 |

## Etap 2: co sprawdziłem przed ukryciem

Same wyszukiwanie nie wystarczyło, bo `tlo_strony` i `sekcje` trafiają do atrybutów `<body>`, a `tlo.css` ma do nich 54 reguły. Zmieniałem więc te wartości na żywej stronie i porównywałem style obliczone wszystkich elementów: 23 strony różnych typów, komputer jasny i ciemny, telefon.

| Pole | Odczyt w `src/` | Wynik | Decyzja |
| --- | --- | --- | --- |
| `tlo_strony` | `Baza.astro` | 0 różnic przy 4 innych wartościach. Tło jest zgaszone (`content: none`) | Ukryte |
| `sekcje` | `Baza.astro` | 0 różnic przy 3 innych wartościach | Ukryte |
| `naglowki_podstron.zdjecia` | `NaglowekStrony.astro` | 0 różnic | Ukryte |
| `naglowki_podstron.wariant` | `NaglowekStrony.astro` | Inny kolor linii pod nagłówkiem na podstronach komputera, na zrzutach 1536 px szerokości i 1 px wysokości. Telefon: 2 px na `/szukaj` przy wartości „Prosty” | **Widoczne, decyzja 1** |
| `pochodzenie` | `publikacjeRok.ts` | Wybiera zdanie nad wykazem | **Widoczne, decyzja 2** |
| `facebook`, `youtube`, `partnerzy`, `przyciski` | Nikt nie czyta | — | Ukryte |
| W `baner`: `zdjecie_male`, `zdjecie_telefon`, `podpis`, `podpis_en`, `podpis_telefon`, `podpis_telefon_en`, `kadr` | Nikt nie czyta | — | Ukryte |
| `sekretariat_zakres`, `sekretariat_zakres_en` | Nikt nie czyta | — | Ukryte |
| `zrodla`, `do_uzupelnienia` (publikacje), `zrodla` (wykazy) | Tylko typy i schemat, nic się nie wyświetla | — | Ukryte |

`przyciski` w kierunkach zostały widoczne, z dopiskiem w etykiecie. Kod potwierdza warunek: `Kierunek.astro` pokazuje je tylko przy doktoracie.

Pola `*_haslo` nazywają w etykiecie stronę, np. „Hasło na banerze: Projekty i granty”. W formularzu kierunków `haslo` i `haslo_en` mają numery sekcji jak sąsiednie pola (①, ⑥).

## Kryteria odbioru

| Kryterium | Wynik |
| --- | --- |
| Skrypt kontrolny na 21 repozytoriach | **0 problemów, 567 plików, kod wyjścia 0** |
| Każde pole z etapu 1 w formularzu, widoczne | Tak, 106 pól sprawdzonych osobnym skryptem, plus `pinezka` |
| Każde z etapu 2 ukryte albo z powodem | 18 z 20 pozycji ukrytych, 2 widoczne z powodem (wyżej) |
| Formularz „Stopka” usunięty, `stopka.json` nietknięty | Tak |
| 53 pliki testowe usunięte, 81 zadań egzaminacyjnych na miejscu | Tak, 22 wpisy i 31 załączników z listy, także z nakładki. `test-*.pdf` w `egzaminy`: 81 w klonie, nakładce i zbudowanej stronie |
| Web-Pracownicy ma gałąź | Tak, lokalnie. Na GitHub pójdzie w etapie 8 |
| `pobierz_tresci.py` | Pełna próba po końcu etapu 7, tylko w osobnym worktree. Bez opcji: 1234 pliki z `main`, bez `o-stronie`. `--galaz wyglad/zlecenie-16`: 1240 plików, jest `o-stronie`, a Web-Pracownicy bez tej gałęzi na GitHubie daje `main`. `--lokalnie`: 1187 plików, bez wpisów testowych. Puste repozytorium: `pobierz()` na lokalnym pustym repozytorium daje „puste”, skrypt ma nadal komunikat „puste repozytorium — pomijam”. Nakładka w głównym drzewie bez zmian (1196 plików przed i po) |
| Budowanie w osobnym worktree | Udane, **739 stron HTML**, tyle co w chmurze |
| „Mister Test”, „Testowe:”, „Uniwersytet Test”, „Test University” | 0 plików w `dist` |
| Odwołania do usuniętych plików w `dist` | 0 trafień na 53 nazwy |
| Lista stron względem podglądu | Zniknęło 20 adresów, wszystkie `test-*` (aktualności, obrony, Warto wiedzieć, PL i EN). Nowych 0 |
| `sprawdz_tresci.py` | OK, 533 pliki i 106 ciekawostek |
| `astro check` | 6 błędów, żaden nowy |
| Klony względem `origin/wyglad/zlecenie-16` | Tylko `.pages.yml` i pliki z listy. Commitów z etapu 0 nie było. Status czysty |
| `main` repozytoriów treści | Nieruszony, nic nie jest wypchnięte |
| Wygląd | Kod strony bez zmian. 72 zrzuty komputera względem zlecenia 21: 40 różnych, opis niżej |
| Po etapach 8, 9, 10; `dok/start-strony.md` | Jeszcze nie: czekają na bramki |
| `.przekazanie\pola-do-cms.md` zaktualizowany | Tak |

**Zrzuty.** Web-Core zmienia w tym zleceniu tylko `skrypty/` i README, więc wygląd może się zmienić tylko przez dane. Tak też jest: 32 z 40 różnic to strona główna PL i EN, Aktualności i wpis (po usunięciu danych testowych pierwszy na liście jest inny wpis, więc te 8 zrzutów pokazuje inną stronę), 4 to licznik referatów na Seminariach, a 4 to banery Instytutu (szkic, różnica do 16 na 255, ten sam rodzaj szumu co w próbie kontrolnej). Na telefonie osobnego porównania całości nie robiłem, bo kod strony się nie zmienił.

## Linki dla edytorów

Działają jako link do gałęzi roboczej dopiero po etapie 10. Do tego czasu otwierają `main`, więc **nie rozsyłaj ich przed „przełącz”.**

- https://app.pagescms.org/IM-UWr/Web-Aktualnosci
- https://app.pagescms.org/IM-UWr/Web-Pracownicy
- https://app.pagescms.org/IM-UWr/Web-Studia
- https://app.pagescms.org/IM-UWr/Web-Instytut
- https://app.pagescms.org/IM-UWr/Web-Nauka
- https://app.pagescms.org/IM-UWr/Web-Popularyzacja
- https://app.pagescms.org/IM-UWr/Web-Ustawienia
- https://app.pagescms.org/IM-UWr/Web-Spec-Analiza-Danych
- https://app.pagescms.org/IM-UWr/Web-Spec-Aktuarialno-Finansowa
- https://app.pagescms.org/IM-UWr/Web-Spec-Nauczycielska
- https://app.pagescms.org/IM-UWr/Web-Spec-Stosowana
- https://app.pagescms.org/IM-UWr/Web-Spec-Teoretyczna
- https://app.pagescms.org/IM-UWr/Web-Sem-Analiza-Harmoniczna
- https://app.pagescms.org/IM-UWr/Web-Sem-Dydaktyka
- https://app.pagescms.org/IM-UWr/Web-Sem-Dyskretna-Analiza-Harmoniczna
- https://app.pagescms.org/IM-UWr/Web-Sem-Geometria
- https://app.pagescms.org/IM-UWr/Web-Sem-Prawdopodobienstwo
- https://app.pagescms.org/IM-UWr/Web-Sem-Rownania-Rozniczkowe
- https://app.pagescms.org/IM-UWr/Web-Sem-Statystyka
- https://app.pagescms.org/IM-UWr/Web-Sem-Teoria-Modeli
- https://app.pagescms.org/IM-UWr/Web-Sem-Topologia

## Co obejmie słowo „push”

- `wyglad/zlecenie-16` w 21 repozytoriach treści (Web-Pracownicy: nowa gałąź na GitHubie) i w Web-Core.
- Jeden commit na `main` Web-Core: etap 5, po `git pull --rebase`. Na `main` nie pójdzie nic innego.
- Lokalne `main` klonów treści nie zostaną wypchnięte.
