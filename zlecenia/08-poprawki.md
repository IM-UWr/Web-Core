# Zlecenie 08: drobne poprawki (telefon)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`. Wymaga zlecenia 07 (granice rysunków). Rób je po zleceniach z bieżącej kolejki (03–06), nie równolegle z nimi.

Rozmowa w claude.ai dopisuje tu kolejne punkty, gdy użytkownik podejmie decyzję. Zrób punkty, które są w pliku w chwili startu, a w dzienniku wypisz, które to były.

## 1. Nauka: atraktor bliżej prawej krawędzi (decyzja użytkownika 1.11, 00:27)
„Przesunąć go bliżej prawej krawędzi, za dużo miejsca z prawej”.

**Przyczyna:**
- w `src/scripts/baner/motywy/lorenz.ts` atraktor stoi na środku banera (`cx = G.W / 2`);
- obraca się i zmniejsza wokół punktu `px`, położonego między lewym brzegiem a środkiem;
- po zleceniu 07 pole jest niższe, więc działa zmniejszenie `fs < 1` i prawa strona odjeżdża w lewo.

**Zmiana:** po obrocie i zmniejszeniu przesuń cały rysunek w poziomie tak, żeby jego najdalszy prawy punkt wypadł na `G.x1`, czyli 16 px od prawej krawędzi.
- Najdalszy punkt liczy się z całej trajektorii, po której jedzie kometa.
- Wielkość, obrót i pionowe położenie zostają bez zmian.
- Lewe skrzydło może przez to wejść głębiej pod tytuł; maska je wygasi i to jest w porządku.
- Start komety liczy się po przesunięciu, jak dziś.

**Kryteria odbioru:**
1. Przy 390×844 prawy brzeg rysunku jest 16 px (±2) od prawej krawędzi. To samo przy 360 i 430 px szerokości, na `/nauka/` i `/en/nauka/`.
2. Granice ze zlecenia 07 (góra, połowa hasła, przerwy między liniami) nadal obowiązują.
3. Przy ograniczonym ruchu gotowy rysunek ma to samo położenie.
4. Komputer bez zmian.

## 2. Aktualności: fala Fouriera zaczyna się na wysokości końca „← Strona główna” (decyzja użytkownika 1.11, 00:29)
„Fourier z Aktualności też do prawej. Niech się zaczyna na wysokości końca słowa »Strona główna«”.

**Dziś:** w `src/scripts/baner/motywy/fourier.ts` fala biegnie przez całą szerokość, od `G.x0` (16 px) do `G.x1`, a jej lewą część gasi maska przy tekście.

**Zmiana:**
- Fala zaczyna się w poziomie tam, gdzie kończy się tekst linku „← Strona główna” (prawy koniec linii linku, bez granicy zanikania). Kończy się jak dziś na `G.x1`.
- Cała fala (okresy, sumy częściowe, rozkłady) mieści się w tym krótszym odcinku. Liczba okresów liczy się z nowej długości (`round(długość / OKRES)`, co najmniej 1). Pionowo zostaje jak po zleceniu 07.
- Silnik nie podaje dziś położenia linku. Dodaj do `Pole` (`typy.ts`, `zmierz()` w `silnik.ts`) pole `link: Linia | null`, czyli linię linku „←” (`t`, `b`, `r`), żeby motywy nie mierzyły DOM same.
- Bez linku fala zaczyna się od `G.x0`, jak dziś.
- Maska przy tekście działa jak dotąd: tam, gdzie tytuł jest dłuższy od linku, początek fali i tak zgaśnie przy tytule.

**Kryteria odbioru:**
1. Przy 390×844 na `/aktualnosci/` i `/en/aktualnosci/` (link „← Home” jest krótszy) pierwszy punkt fali jest na x = koniec tekstu linku (±2 px), a ostatni na `G.x1`.
2. Budowanie, oddychanie i rozkłady działają jak dotąd. Granice ze zlecenia 07 nadal obowiązują.
3. Przy ograniczonym ruchu gotowy rysunek ma to samo położenie.
4. Komputer bez zmian.

## Dziennik
Sekcja „08-poprawki” w `.przekazanie\dziennik.md`, z listą zrobionych punktów.
