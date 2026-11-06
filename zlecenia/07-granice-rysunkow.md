# Zlecenie 07: granice rysunków w banerach (telefon, wszystkie animacje)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`. Wymaga zleceń 01 i 02 (silnik `src/scripts/baner/silnik.ts`).

**Kolejność:** po 01, a przed 03–05, żeby nowe motywy od razu trzymały te granice. Względem 06 kolejność jest dowolna, ale nie równolegle.

## Cel (decyzja użytkownika 31.10, 23:52, na podstawie zrzutów Nauki i Studiów)
1. **Rysunek nie wchodzi między linie tekstu.** Atraktor w Nauce dobrze omija tytuł, ale przechodzi przez pustą przestrzeń między „← Strona główna” a „Nauka”. Blok tekstu ma być jedną całością: link, nadtytuł, linie tytułu i hasło razem z przerwami między nimi.
2. **Rysunek nie schodzi poniżej bursztynowego hasła, najlepiej nie niżej niż do połowy jego wysokości.** Dziś np. krzywa Riemanna w Studiach schodzi aż do kreski nad liczbami.
3. **U góry rysunek może sięgać lekko ponad link „← Strona główna”**, tak jak dziś atraktor: do dołu paska menu + 6 px. Do paska nie wchodzi.
4. **Dopasowanie motywów:**
   - jeśli się da, rysunek przesuwa się w górę;
   - jeśli nie, lekko się zmniejsza: kształty proporcjonalnie, a wykresy (Riemann, Fourier) wolno spłaszczyć w pionie;
   - zmniejszenie ma być jak najmniejsze.

Dotyczy **wszystkich banerów z rysunkiem na telefonie**: dziś 5 działów, a po zleceniach 03–05 wszystkich podstron, łącznie ze statyczną kratką stron prawnych. Komputer bez zmian.

## Co zmienić
**Silnik (`silnik.ts`, `zmierz()` i maska):**
- **Pole rysunku w pionie (`Pole.y0`, `Pole.y1`):**
  - `y0`, czyli góra: `menu + 6`, gdy pasek menu leży na banerze. Bez paska na banerze: górna krawędź linku „←” (albo nadtytułu lub tytułu) minus 30 px, ale nie mniej niż 6.
  - `y1`, czyli dół: **połowa wysokości hasła**. Bez hasła: połowa ostatniej linii tytułu.
  - Liczby i kreska przestają wyznaczać dół pola.
  - Zaktualizuj komentarze w `typy.ts`.
- **Przerwy między liniami tekstu są zamaskowane.**
  - Linie z `prz` posortowane od góry tworzą jedną bryłę. Każda przerwa między kolejnymi liniami (link–nadtytuł–tytuł–kolejne linie tytułu–hasło) dostaje granicę równą **dłuższej** z dwóch sąsiednich linii.
  - Reszta zostaje jak dziś: 60 px przejścia, wygładzenie.
- **Hasło maskowane na całą długość:** `r = koniec linii + granica`. Bez obcinania do końca tytułu i bez `podHaslem`. Rysunek nie wchodzi pod hasło. Pole `podHaslem` usuń z `Ustawienia` albo ustaw je na 0 we wszystkich motywach.
- **Twarda granica na dole:** maska silnika gasi rysunek łagodnie przez ostatnie 12 px nad `y1` i ma 0 poniżej `y1`. To zabezpieczenie: motywy mają się mieścić same, a nie być ucinane. Płótno kończy się na `y1`, bez dzisiejszego zapasu `+ 8`.
- Na górze to samo: 6 px łagodnego przejścia od `y0`.

**Motywy z 02 (dopasowanie do nowego pola):**
- **Lorenz:** atraktor i kometa mają się mieścić w `y0`–`y1`. Dziś skala liczy się z wysokości pola, więc najpierw przesuń środek w górę, a skalę zmniejsz tylko o tyle, ile trzeba.
- **Fourier:** `podHaslem` 70 → 0. Krzywa mieści się w polu; wolno ją spłaszczyć w pionie.
- **Dendryt:** dziś losuje punkty do `y1 + 7`, a ma najwyżej do `y1`.
- **Riemann:** oś i dolne krawędzie prostokątów są na `y1`, czyli w połowie hasła. Krzywa jest nad nimi; wolno ją spłaszczyć w pionie.
- **Złoty podział:** już stoi nad hasłem (`haslo.t − 6`), więc sprawdź tylko, czy nic nie wychodzi poza nowe pole.

**Motywy z 03–05** (jeśli są już zrobione, popraw je tu; jeśli nie, obowiązuje je reguła dopisana do `zasady.md`): mieszczą się w `y0`–`y1` według tej samej zasady: najpierw przesunięcie w górę, potem lekkie zmniejszenie.

## Kryteria odbioru
1. `npm run build` przechodzi. W konsoli przeglądarki nie ma błędów.
2. **Dół:** na telefonie 390×844 na każdej stronie z animacją piksele płócien poniżej połowy hasła mają krycie 0. Sprawdź `getImageData` w wierszach pod `y1`, a w trybie ograniczonego ruchu na gotowym rysunku. Strony: 5 działów i /en/nauka/.
3. **Przerwy:** w przerwie między „← Strona główna” a tytułem oraz między tytułem a hasłem, aż do końca dłuższej z sąsiednich linii plus granica, krycie wynosi 0. W Nauce atraktor nie przechodzi między linkiem a „Nauka”.
4. **Góra:** rysunek nie wchodzi w pasek menu, najwyżej do dołu paska + 6 px.
5. **Dopasowanie, nie ucinanie:** żaden motyw nie jest widocznie ucięty na dolnej granicy; zanik 12 px to tylko zabezpieczenie. W dzienniku podaj dla każdego motywu przesunięcie (px) i zmianę skali (%) przy 390×844. Zmniejszenie powyżej 15% opisz i uzasadnij.
6. **Długi tytuł:** tymczasowy dwuliniowy tytuł na Nauce i Popularyzacji (jak przy 02). Reguły z pkt 2–4 nadal obowiązują, a pole jest wyższe.
7. Tryb ciemny, ograniczony ruch i zmiana rozmiaru okna dają te same granice.
8. Wydajność bez zmian względem 02 (klatki/s w spoczynku jak w dzienniku 02).
9. Komputer (≥ 761 px) bez zmian.
10. W `.przekazanie\dziennik.md` jest sekcja „07-granice-rysunkow” ze zrzutami albo opisem Nauki i Studiów przed i po.
