# Zlecenie 02: silnik animacji banerów i animacje pięciu działów (telefon)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`.

**Nie wymaga zlecenia 01.** Pięć działów ma już na telefonie docelowy baner: hasło, kreskę i liczby (Popularyzacja: 3× „TBA”), a zlecenie 01 ich nie zmienia. Silnik ma jednak od razu obsłużyć też strony bez kreski i liczb (dół pola rysunku to wtedy dół hasła), bo po zleceniu 01 takie podstrony się pojawią.

**Nie wykonuj 01 i 02 jednocześnie**, bo oba zmieniają `NaglowekStrony.astro` i style banera. Kolejność dowolna, ale jedno po drugim.

## Cel
W tle banerów działów zamiast statycznego rysunku ma być spokojna, losowa animacja matematyczna. Użytkownik zaakceptował wszystkie prototypy („wyglądają genialnie, wszystkie animacje akceptowane”).

W tym zleceniu powstaje **wspólny silnik**, który potem wykorzystają zlecenia 03–05 dla ok. 40 podstron, oraz **5 animacji działów**. Zmiany dotyczą tylko telefonu. Na komputerze zostaje dzisiejszy statyczny rysunek, a animacje na komputerze będą osobną decyzją.

## Prototypy (w `.przekazanie\prototypy\`)
| Dział | Plik | Wariant do wdrożenia |
|---|---|---|
| Nauka | `nauka-lorenz.html` (v3) | atraktor Lorenza z kometą; obrót o 5° (lewe skrzydło w miejscu, prawe wyżej); kometa startuje w niewidocznej części i pojawia się po ok. 2 s |
| Aktualności | `aktualnosci-fourier.html` (v5) | **wariant 3**: budowa 20 s, potem fala stoi i lekko „oddycha” wagami (30%); co losową przerwę (średnio 12 s, ±60%) rozkłada się do losowo 4–9 wyrazów i składa w tempie budowania (16 s na 8 wyrazów); dół zanika pod hasłem (`podHaslem` 70). **Zastępuje** obecny skrypt fali Fouriera w `NaglowekStrony.astro` (dziś rAF, w tę i z powrotem) |
| Instytut | `instytut-dendryt.html` (v2) | dendryt wrocławski (Florek, Łukaszewicz, Perkal, Steinhaus, Zubrzycki 1951); gałęzie losowo znikają i wracają średnio co 3 s, częściej długie, naraz ukrytych najwyżej 30% |
| Studia | `studia-riemann.html` | sumy Riemanna: podziały zagęszczają się i rozrzedzają, punkt ze strzałką stoi |
| Popularyzacja | `popularyzacja-cyrkiel.html` (v2) | **złoty podział odcinka**, ślad cyrkla „punkt wbicia”. Na telefonie konstrukcja stoi **nad bursztynowym hasłem**: mieści się od paska menu (wysokość nagłówka + 6 px) do górnej krawędzi hasła minus 6 px, dopasowana do rzeczywistego zasięgu łuków (kod w funkcji układu prototypu, komentarz „decyzja użytkownika 31.10, 22:23”). Budowa raz przy wejściu, potem co ok. 9 s (losowo 0,4–1,6×) jeden łuk albo prosta gaśnie i rysuje się od nowa |

## Zasady ruchu i techniki (wspólne, także dla zleceń 03–05)
- **Ruch:**
  - subtelny, naraz rusza się mało elementów;
  - zmiany **losowe, nie w kółko**;
  - spokojne tempo linii, ok. 1–3 px/s; budowanie przy wejściu może się odbyć raz.
- **Kolor na telefonie:** szaro-biały, słabo widoczny (jak Lorenz v3; użytkownik: „Dokładnie tak ma być”). Jedynym bursztynem jest hasło. Kolor bierz z tokenu CSS, żeby działał w trybie jasnym i ciemnym.
- **Pole rysunku:**
  - całe wnętrze banera: od linku „←” u góry do kreski nad liczbami, z odstępem ok. 12 px od dołu i 16 px od prawej;
  - na stronach bez liczb do dołu hasła z takim samym odstępem;
  - wyjątek: Popularyzacja (opisana wyżej).
- **Zanikanie przy tekście („obrys linii”).** Rysunek nie wchodzi pod tekst.
  - Granica zanikania jest liczona **osobno dla każdej linii**: linku „←”, nadtytułu, każdej linii tytułu i hasła.
  - Linie mierzy się przez `Range.getClientRects()` i skleja w wiersze.
  - Na prawo od końca linii jest łagodne przejście ok. 60 px. Pod hasłem maska może trochę zachodzić (parametr jak `podHaslem`).
  - Przy jednoliniowym tytule to daje to samo co dawna reguła „zanik za końcem tytułu”, a przy długich tytułach rysunek widać obok krótszych linii. Implementacje są w prototypach `animacje-analiza.html` i `animacje-struktury.html` (funkcje liczące linie i maskę).
- **Technika:**
  - `canvas`, pętla na `setTimeout` (nie `requestAnimationFrame`);
  - klatka tylko wtedy, gdy coś zmieniło się o ≥ 0,5 px, zwykle 2–15 kl./s, a w spoczynku zero klatek;
  - maska alfa liczona raz na układ i nakładana przez `destination-in`;
  - dpr płótna ≤ 1,5;
  - pauza, gdy baner jest poza ekranem (IntersectionObserver) i gdy karta jest w tle (`visibilitychange`);
  - `prefers-reduced-motion: reduce` daje statyczny, gotowy rysunek bez pętli;
  - przeliczenie geometrii przy zmianie rozmiaru (ResizeObserver albo `resize` z opóźnieniem), przy wczytaniu fontu (`document.fonts.ready`) i przy przejściach między stronami (`przejscia.css`, Astro View Transitions, jeśli są używane).
- **Bez JS** zostaje dzisiejszy statyczny rysunek, szary na telefonie.

## Silnik: wymagania
- **Jeden moduł**, np. `src/scripts/baner/`: pomiar geometrii, płótno, maska „obrys linii”, pętla, pauzy, reduced-motion. Każdy motyw to osobny plik z prostym interfejsem (start, krok(dt), rysuj, czy brudny, gotowy).
- **Wybór motywu:**
  - baner deklaruje motyw atrybutem, np. `data-motyw="lorenz"` na `.page-head`, ustawianym w `NaglowekStrony.astro` z mapy strona → motyw (w kodzie albo w danych);
  - strona ładuje **tylko kod swojego motywu**: osobne skrypty albo dynamiczny import, bez jednego wielkiego pakietu dla wszystkich ~45 motywów;
  - na komputerze (≥ 761 px) silnik nic nie robi.
- **Geometria** jest liczona z prawdziwych elementów banera (`.wstecz`, `h1`, `.ph-haslo`, `.pt-liczby`), więc działa dla każdej podstrony z układu ze zlecenia 01.
- **Statyczny rysunek `.ph-m`** na telefonie chowa się, gdy animacja wystartuje. Bez JS i przy błędzie zostaje.

## Kryteria odbioru
1. `npm run build` przechodzi; w konsoli przeglądarki na stronach działów nie ma błędów.
2. Na telefonie (390 px) Nauka, Aktualności, Instytut, Studia i Popularyzacja mają animację zgodną z prototypem: ten sam motyw, tempo, zanik przy tekście i kolor szaro-biały. Popularyzacja ma złoty podział nad hasłem.
3. W spoczynku (po zbudowaniu rysunku) animacja rysuje średnio ≤ 5 kl./s; wyjątkiem jest kometa Lorenza, opisz jej liczbę klatek w dzienniku. Poza ekranem i w karcie w tle rysuje 0 klatek.
4. Przy `prefers-reduced-motion: reduce` rysunek jest statyczny i gotowy, bez pętli.
5. Stary skrypt fali Fouriera (rAF) w `NaglowekStrony.astro` jest zastąpiony nowym; nigdzie nie zostaje `requestAnimationFrame` po stronie banera.
6. Długi tytuł nie psuje rysunku. Przetestuj tymczasowo dłuższy tytuł działu, np. „Popularyzacja matematyki we Wrocławiu”, i opisz wynik w dzienniku.
7. **Komputer bez zmian** (≥ 761 px): statyczny rysunek jak dziś, żadnego płótna ani pętli.
8. Tryb ciemny na telefonie: rysunek jest widoczny, ale słaby, a hasło zostaje jedynym akcentem.
9. Silnik jest gotowy na kolejne motywy: dodanie motywu to nowy plik plus wpis w mapie strona → motyw, co opisz w dzienniku w 3–5 zdaniach dla zleceń 03–05.
10. Rozmiar: kod jednego motywu wysyłany do przeglądarki ma ≤ ok. 15 KB (bez kompresji); podaj rozmiary w dzienniku.
11. Sekcja „02-animacje-dzialow” w `.przekazanie\dziennik.md`.
