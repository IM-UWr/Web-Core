# Raport: zlecenie 22 — wszystkie pola w CMS i praca edytorów na gałęzi (6.11.2026)

**Etapy 0–8 są zrobione i wypchnięte. Etap 9: gałęzie `test-cms` założone, czekam na zapisy właściciela w CMS.** Etap 10 czeka na słowo „przełącz”, etap 11 to sam dokument. Numer 22 był wolny. Zlecenie 22 ma osobne commity, zlecenia 21 w nich nie ma.

Skrypt kontrolny daje **0 problemów przy 575 plikach**: 567 po etapach 0–7 i 8 wpisów testowych, o które właściciel poprosił później. Żadnego formularza nie sprawdzono jeszcze w prawdziwym Pages CMS: to etap 9.

## Decyzje właściciela

Właściciel odpowiedział „Ukryj, potem push”. Zrobione w Web-Ustawienia `8c58e68`.

1. **`naglowki_podstron` (Web-Ustawienia):** ukryty cały, także `wariant`. Wartość w pliku zostaje, więc wygląd się nie zmienia. Etykieta `wariant` wróciła do „Wygląd”.
2. **`pochodzenie` (Web-Nauka, wykazy publikacji):** zostaje widoczne, jako lista wyboru, a nie tekst, jak chciało zlecenie. Wartość wybiera zdanie nad wykazem („Wersja tekstowa przygotowana na podstawie wykazu w pliku PDF…” albo „Wykaz przeniesiony z poprzedniej strony…”), a inna wpisana wartość po cichu usunęłaby to zdanie. Próba ukrytego pola w etapie 9 zostaje więc na `zrodla` w tym samym wykazie.
3. **`haslo`, `haslo_en` w „Strona główna i kontakt”:** ukryte. Etap 1 kazał je dopisać, ale nowa okładka tego pola nie czyta.

## Co zmieniło się na podglądzie po „push”

Zniknęły dane testowe, więc niektóre miejsca były uboższe albo puste. To skutek danych, a nie zmiana układu. Część tych miejsc znów się zapełniła po wpisach testowych z prośby właściciela (sekcja niżej). Porównanie jest w `raport-zrzuty/z22-glowna-bez-testowych.png` (na górze przed, na dole po).

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
| 2 | Decyzja właściciela: dwa pola ukryte | Web-Ustawienia | `8c58e68` |
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
| 7 | Raport | Web-Core, `wyglad/zlecenie-16` | `22b02dde` |
| 8 | Push | 21 repozytoriów treści, Web-Core | `main` Web-Core: `446e98e3` |
| 9 | Gałęzie `test-cms` | 6 repozytoriów | od `wyglad/zlecenie-16`, tabela niżej |
| — | Wpisy testowe, prośba właściciela | 5 repozytoriów | tabela niżej |

**Etap 1, commity:** Web-Instytut `418bf10`, Web-Nauka `13a8ef4`, Web-Studia `8dabf71`, Web-Ustawienia `045b2f3`, Web-Spec-Aktuarialno-Finansowa `a6aa522`, Web-Spec-Analiza-Danych `2f6e60d`, Web-Spec-Nauczycielska `78e9ca4`, Web-Spec-Stosowana `07d8459`, Web-Spec-Teoretyczna `f44f914`, Web-Sem-Analiza-Harmoniczna `c8a1a9c`, Web-Sem-Dydaktyka `009f7b5`, Web-Sem-Dyskretna-Analiza-Harmoniczna `7ef5606`, Web-Sem-Geometria `b99d156`, Web-Sem-Prawdopodobienstwo `0f91315`, Web-Sem-Rownania-Rozniczkowe `db9108c`, Web-Sem-Statystyka `731ef74`, Web-Sem-Teoria-Modeli `311a148`, Web-Sem-Topologia `2d5387c`.

**Lokalny `main` Web-Core:** był 71 commitów za `origin/main`. Przesunąłem go do `origin/main` (`9606ef41`, bez własnych zmian) i dodałem commit z etapu 5. Po etapie 8 jest równy `origin/main`. Worktree do tego był osobny, nakładki ani serwerów dev to nie dotknęło.

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
| `naglowki_podstron.wariant` | `NaglowekStrony.astro` | Inny kolor linii pod nagłówkiem na podstronach komputera, na zrzutach 1536 px szerokości i 1 px wysokości. Telefon: 2 px na `/szukaj` przy wartości „Prosty” | Ukryte, decyzja właściciela |
| `pochodzenie` | `publikacjeRok.ts` | Wybiera zdanie nad wykazem | **Widoczne, lista wyboru** |
| `facebook`, `youtube`, `partnerzy`, `przyciski` | Nikt nie czyta | — | Ukryte |
| W `baner`: `zdjecie_male`, `zdjecie_telefon`, `podpis`, `podpis_en`, `podpis_telefon`, `podpis_telefon_en`, `kadr` | Nikt nie czyta | — | Ukryte |
| `sekretariat_zakres`, `sekretariat_zakres_en` | Nikt nie czyta | — | Ukryte |
| `zrodla`, `do_uzupelnienia` (publikacje), `zrodla` (wykazy) | Tylko typy i schemat, nic się nie wyświetla | — | Ukryte |

`przyciski` w kierunkach zostały widoczne, z dopiskiem w etykiecie. Kod potwierdza warunek: `Kierunek.astro` pokazuje je tylko przy doktoracie.

Pola `*_haslo` nazywają w etykiecie stronę, np. „Hasło na banerze: Projekty i granty”. W formularzu kierunków `haslo` i `haslo_en` mają numery sekcji jak sąsiednie pola (①, ⑥).

## Kryteria odbioru

| Kryterium | Wynik |
| --- | --- |
| Skrypt kontrolny na 21 repozytoriach | **0 problemów, kod wyjścia 0.** 567 plików po etapach 0–7, 575 z wpisami testowymi |
| Każde pole z etapu 1 w formularzu, widoczne | Tak, 104 pola sprawdzone osobnym skryptem, plus `pinezka`. `haslo`, `haslo_en` w `ustawienia` są w formularzu, ale ukryte decyzją właściciela |
| Każde z etapu 2 ukryte albo z powodem | 21 z 22 pozycji ukrytych, 1 widoczna z powodem: `pochodzenie` |
| Formularz „Stopka” usunięty, `stopka.json` nietknięty | Tak |
| 53 pliki testowe usunięte, 81 zadań egzaminacyjnych na miejscu | Tak, 22 wpisy i 31 załączników z listy, także z nakładki. `test-*.pdf` w `egzaminy`: 81 w klonie, nakładce i zbudowanej stronie |
| Web-Pracownicy ma gałąź | Tak, wypchnięta w etapie 8 |
| `pobierz_tresci.py` | Pełna próba po końcu etapu 7, tylko w osobnym worktree. Bez opcji: 1234 pliki z `main`, bez `o-stronie`. `--galaz wyglad/zlecenie-16`: 1240 plików, jest `o-stronie`, a Web-Pracownicy bez tej gałęzi na GitHubie daje `main`. `--lokalnie`: 1187 plików, bez wpisów testowych. Puste repozytorium: `pobierz()` na lokalnym pustym repozytorium daje „puste”, skrypt ma nadal komunikat „puste repozytorium — pomijam”. Nakładka w głównym drzewie bez zmian (1196 plików przed i po) |
| Budowanie w osobnym worktree | Udane, **739 stron HTML**, tyle co w chmurze |
| „Mister Test”, „Testowe:”, „Uniwersytet Test”, „Test University” | 0 plików w `dist` przy tym sprawdzeniu. Teraz na gałęzi jest 8 nowych wpisów testowych na prośbę właściciela |
| Odwołania do usuniętych plików w `dist` | 0 trafień na 53 nazwy |
| Lista stron względem podglądu | Zniknęło 20 adresów, wszystkie `test-*` (aktualności, obrony, Warto wiedzieć, PL i EN). Nowych 0 |
| `sprawdz_tresci.py` | OK, 533 pliki i 106 ciekawostek |
| `astro check` | 6 błędów, żaden nowy |
| Klony względem `origin/wyglad/zlecenie-16` | Tylko `.pages.yml` i pliki z listy. Commitów z etapu 0 nie było. Status czysty |
| `main` repozytoriów treści | Nieruszony: po etapie 8 i po wpisach testowych 21 repozytoriów ma ten sam `main` co przed pushem |
| Wygląd | Kod strony bez zmian. 72 zrzuty komputera względem zlecenia 21: 40 różnych, opis niżej |
| Etap 8 | Zrobiony, wyniki niżej |
| Etapy 9, 10; `dok/start-strony.md` | W toku: etap 9 czeka na zapisy właściciela, reszta na bramki |
| `.przekazanie\pola-do-cms.md` zaktualizowany | Tak |

**Zrzuty.** Web-Core zmienia w tym zleceniu tylko `skrypty/` i README, więc wygląd może się zmienić tylko przez dane. Tak też jest: 32 z 40 różnic to strona główna PL i EN, Aktualności i wpis (po usunięciu danych testowych pierwszy na liście jest inny wpis, więc te 8 zrzutów pokazuje inną stronę), 4 to licznik referatów na Seminariach, a 4 to banery Instytutu (szkic, różnica do 16 na 255, ten sam rodzaj szumu co w próbie kontrolnej). Na telefonie osobnego porównania całości nie robiłem, bo kod strony się nie zmienił.

## Etap 8: wynik

| Sprawdzenie | Wynik |
| --- | --- |
| `wyglad/zlecenie-16` | Wypchnięta w 21 repozytoriach treści i w Web-Core. Web-Pracownicy: nowa gałąź na GitHubie. Pierwsza próba stanęła na Web-Sem-Analiza-Harmoniczna na „Empty reply from server”, ponowienie przeszło |
| `main` Web-Core | `446e98e3`: dokładnie jeden commit nad `9606ef41`, `README.md` i `skrypty/pobierz_tresci.py` |
| Publikacja obecnej strony | Przebieg `42245846864` zielony |
| `https://im-uwr.github.io/Web-Core/o-stronie/` | 404 po tej publikacji, czyli obecna strona bierze treści z `main` |
| Przebieg Web-Podglad | `42245965876`, budowanie i publikacja zielone |
| Podgląd | Hasła są („Wrocławska szkoła matematyczna”, „Poznaj nasze badania na A+”…). Testowych znaczników 0 na stronie głównej PL i EN, w Instytucie, Seminariach, Aktualnościach i Kalendarzu. `/o-stronie/` działa |
| `main` 21 repozytoriów treści | Bez zmian względem stanu sprzed pushu |

**Harmonogram Web-Podglad nie działa co godzinę.** Zlecenie zakłada przebieg co godzinę, o :23, a `podglad.yml` ma taki cron, ale GitHub uruchamiał go nieregularnie: ostatnio o 08:04, 00:27, 18:52, 11:15, 02:37, 21:59 UTC. Workflow zostawiłem bez zmian. Ręcznie uruchomiłem dwa przebiegi: do sprawdzenia etapu 8 i po wpisach testowych. Zmiana treści może więc na podglądzie pojawić się dopiero po wielu godzinach, chyba że ktoś uruchomi przebieg ręcznie.

## Etap 9: próba w CMS (w toku)

Gałęzie `test-cms` założone i wypchnięte. Właściciel w każdym wpisie zmienia jedno słowo i zapisuje. Potem porównuję `wyglad/zlecenie-16` z `origin/test-cms`. Wpisy testowe nie dotykają tych sześciu repozytoriów, więc porównanie pokaże tylko zapisy z CMS.

| Repozytorium | `test-cms` na | Wpis | Co sprawdza |
| --- | --- | --- | --- |
| [Web-Studia](https://app.pagescms.org/IM-UWr/Web-Studia/test-cms) | `910f99c` | Kierunek Matematyka; strona „Skrypty” | `etykieta_krotka`, `liczby`, `pinezka` (przy Szkole doktorskiej) |
| [Web-Popularyzacja](https://app.pagescms.org/IM-UWr/Web-Popularyzacja/test-cms) | `53f6556` | Strona „Dla uczniów” | bloki: czy listy z kilkoma akapitami przetrwają |
| [Web-Ustawienia](https://app.pagescms.org/IM-UWr/Web-Ustawienia/test-cms) | `8c58e68` | „Strona główna i kontakt”; „Menu główne” | pola ukryte, `opis` w menu |
| [Web-Nauka](https://app.pagescms.org/IM-UWr/Web-Nauka/test-cms) | `dcd364f` | Jeden wykaz publikacji | ukryte `zrodla`; `pochodzenie` jest teraz widoczne (decyzja 2) |
| [Web-Spec-Aktuarialno-Finansowa](https://app.pagescms.org/IM-UWr/Web-Spec-Aktuarialno-Finansowa/test-cms) | `a6aa522` | Specjalność | `rola_en` |
| [Web-Sem-Topologia](https://app.pagescms.org/IM-UWr/Web-Sem-Topologia/test-cms) | `2d5387c` | Seminarium | `haslo` |

## Wpisy testowe na prośbę właściciela (6.11)

Właściciel: „Dodaj też po 4 testowe wpisy do cms w wydarzeniach i seminariach na najbliższe 2 tygodnie”. Wziąłem teksty i zdjęcia usunięte w etapie 4, z nowymi datami, więc mają te same znaczniki („Testowe:”, „Mister Test”, „Uniwersytet Test”). Są tylko na `wyglad/zlecenie-16`: na obecnej stronie ich nie ma, a `main` tych repozytoriów się nie zmienił.

**Trzeba je usunąć przed startem strony.** `22-pliki-testowe.txt` zawiera tylko 4 zdjęcia, bo wpisy mają nowe nazwy. Lista jest tu:

| Termin | Wpis | Plik | Commit |
| --- | --- | --- | --- |
| pn 9.11, 18:15 | Wydarzenie: koło naukowe, gry kombinatoryczne | `Web-Aktualnosci/src/content/aktualnosci/test-2026-11-03-kolo-naukowe-gry-kombinatoryczne.md` | `092316a` |
| czw 12.11, 9:30 | Wydarzenie: warsztaty dla licealistów | `Web-Aktualnosci/src/content/aktualnosci/test-2026-11-04-warsztaty-dla-licealistow-liczby-pierwsze.md` | `092316a` |
| sob 14.11, 10:00 | Wydarzenie: dzień otwarty dla kandydatów | `Web-Aktualnosci/src/content/aktualnosci/test-2026-11-06-dzien-otwarty-dla-kandydatow.md` | `092316a` |
| czw 19.11, 13:15 | Wydarzenie: wykład otwarty, macierze losowe | `Web-Aktualnosci/src/content/aktualnosci/test-2026-11-05-wyklad-otwarty-macierze-losowe.md` | `092316a` |
| pn 9.11, 15:15 | Referat: równania różniczkowe | `Web-Sem-Rownania-Rozniczkowe/src/content/referaty/rownania-rozniczkowe/test-2026-11-09-mister-test.md` | `4ff405e` |
| wt 10.11, 14:15 | Referat: statystyka | `Web-Sem-Statystyka/src/content/referaty/statystyka/test-2026-11-10-mister-test.md` | `d92bebc` |
| czw 12.11, 12:15 | Referat: prawdopodobieństwo | `Web-Sem-Prawdopodobienstwo/src/content/referaty/prawdopodobienstwo/test-2026-11-12-mister-test.md` | `364ede0` |
| śr 18.11, 10:15 | Referat: analiza harmoniczna | `Web-Sem-Analiza-Harmoniczna/src/content/referaty/analiza-harmoniczna/test-2026-11-18-mister-test.md` | `760e34a` |

Zdjęcia, też w `092316a`: `Web-Aktualnosci/public/pliki/aktualnosci/test-kolo-gry-kombinatoryczne.jpg`, `test-warsztaty-liczby-pierwsze.jpg`, `test-dzien-otwarty.jpg`, `test-wyklad-macierze-losowe.jpg`.

W CMS przed „przełącz” widać je pod adresem gałęzi, np. https://app.pagescms.org/IM-UWr/Web-Aktualnosci/wyglad/zlecenie-16 . Pod adresem bez gałęzi CMS otwiera `main`, gdzie ich nie ma. Wpisy są też w lokalnej nakładce Web-Core. `sprawdz_tresci.py`: OK, 541 plików i 106 ciekawostek. `sprawdz_pola_cms.py`: 0 problemów, 575 plików. Podgląd z wpisami: przebieg `42247624583` zielony, wpisy widać na stronie głównej, w Kalendarzu, Seminariach i pod własnymi adresami.

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
