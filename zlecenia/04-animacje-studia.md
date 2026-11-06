# Zlecenie 04: animacje podstron Studiów (telefon)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`. Wymaga zleceń 01 i 02.

## Cel
Kierunki, specjalności i pozostałe strony Studiów dostają animowane motywy w tle banera. Gdzie tak zalecono w prototypie, dziedziczą sumy Riemanna z działu Studia (motyw ze zlecenia 02). Prototypy zaakceptował użytkownik. Dotyczy tylko telefonu.

## Prototypy (w `.przekazanie\prototypy\`)
- `animacje-kierunki.html`: Matematyka, SIAD, ISIM i 5 specjalności
- `animacje-studia-codziennosc.html`: pozostałe 16 stron Studiów

Przy długich tytułach stosuj zanik z silnika („obrys linii”). Krótkich tytułów na telefonie (propozycja z prototypu) **nie wdrażaj**, bo nie ma jeszcze decyzji. Tytuły zostają jak dziś.

## Strona → motyw → ruch
| Strona | Motyw | Ruch (losowo, nie w kółko) |
|---|---|---|
| Matematyka | **motyw działu: sumy Riemanna** (rekomendacja prototypu: Matematyka to rdzeń Studiów). Motyw „kanapka z szynką” zostaw w kodzie jako nieużywany zapas albo pomiń | jak w dziale |
| SIAD | spadek gradientu na poziomicach | co ok. 1,4 s rozjaśnia się kolejny krok ścieżki, potem nowy start z losowego miejsca |
| ISIM | permutacje przez zamiany sąsiadów (Steinhaus–Johnson–Trotter) | skrzyżowania przesuwają się o 1–4 px, co 20–35 s rozjaśnia się inna nić |
| Specjalność: Analiza danych | k-średnie (Steinhaus 1956) | punkty gasną i pojawiają się, środki grup i granice idą za nimi |
| Specjalność: Matematyka aktuarialno-finansowa | krzywe przeżycia (prawo Gompertza i 2 próbki) | jeden schodek przesuwa się w bok |
| Specjalność: Matematyka nauczycielska | okrąg opisany na trójkącie, konstrukcja cyrklem (Euklides IV.5) | rysuje się raz krok po kroku, potem drga jeden wierzchołek |
| Specjalność: Matematyka stosowana | Lotka–Volterra: pole kierunków i 3 orbity | jedna orbita rośnie albo maleje |
| Specjalność: Matematyka teoretyczna | kule jednostkowe ℓᵖ | jedna z trzech kul zmienia p |
| Plan zajęć, Rok akademicki, Zajęcia i konsultacje | „Czas i rytm”: trzy odległości (Steinhaus) | losowo jeden łuk nad osią dzieli się albo łączy z sąsiednim (ok. 2,5 px/s) |
| Pierwszy rok, Egzaminy i dyplom, Procedura dyplomowania | „Droga” po kratce do celu | losowo przeskakuje jeden narożnik drogi |
| Szkoła doktorska i jej 4 podstrony (Dokumenty, Rekrutacja, Stopień doktora, Stypendia) | punkt stały Banacha: pajęczyna kolejnych przybliżeń | pajęczyna wyłania się odcinek po odcinku; co 15–30 s nowa, z losowego punktu |
| Studia podyplomowe | geoplan i wzór Picka | jeden wierzchołek przesuwa się o oczko kratki |
| Program MOST, Sprawy studenckie, Skrypty, Archiwalne programy | **motyw działu: sumy Riemanna** | jak w dziale |
| Kalendarz zajęć | brak (przekierowuje na Rok akademicki) | — |

Podstrony szkoły doktorskiej dziedziczą motyw po szkole doktorskiej, a nie po Studiach. Strona Studiów spoza tabeli dostaje sumy Riemanna; odnotuj to w dzienniku.

## Kryteria odbioru
1. `npm run build` przechodzi; w konsoli przeglądarki nie ma błędów.
2. Każda strona z tabeli ma na telefonie przypisany motyw, zgodny z prototypem, szaro-biały i z zanikiem przy tekście z silnika.
3. Strony z motywem działu korzystają z tego samego kodu Riemanna co dział Studia (bez kopii).
4. Wydajność i dostępność jak w zleceniu 02 (pkt 3, 4, 7, 8), sprawdzone na co najmniej 6 stronach, w tym na SIAD i ISIM (długie tytuły).
5. Komputer bez zmian.
6. Sekcja „04-animacje-studia” w `.przekazanie\dziennik.md`.
