# Zlecenie 03: animacje podstron Nauki, seminariów i zakładów (telefon)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`. Wymaga zleceń 01 (układ banerów) i 02 (silnik animacji i jego zasady: kolor, zanik „obrys linii”, technika, kryteria wydajności).

## Cel
Na podstronach Nauki, wszystkich seminariach i zakładach ma być własny animowany motyw w tle banera, zamiast powtarzania Lorenza z działu. Prototypy zaakceptował użytkownik. Każdy motyw to nowy plik motywu w silniku i wpis w mapie strona → motyw. Dotyczy tylko telefonu.

## Prototypy (w `.przekazanie\prototypy\`)
- `animacje-wydarzenia.html`: Konferencje, Obrony, Obrona, Kalendarz
- `animacje-analiza.html`: lista seminariów oraz seminaria i zakłady z analizy, równań, prawdopodobieństwa i statystyki
- `animacje-struktury.html`: seminaria i zakłady z geometrii, topologii, teorii modeli i dydaktyki
- `animacje-badania.html`: granty, grant, publikacje, rocznik, sukcesy, historia

Przy wdrażaniu wybierz zawsze „Motyw własny”. Przełącznik „Motyw działu” w prototypach służył tylko do porównania. Przy długich tytułach stosuj zanik z silnika („obrys linii”), a nie tryby prototypów.

## Strona → motyw → ruch
| Strona | Motyw | Ruch (losowo, nie w kółko) |
|---|---|---|
| Konferencje | punkt stały Banacha: łamane kolejnych przybliżeń z losowych punktów schodzą się w jednym punkcie | rośnie najwyżej jedna łamana naraz (ok. 2,5 px/s), najstarsza gaśnie |
| Obrony doktorskie (lista) | drzewo genealogii (promotor → doktor), kształt startowy z procesu Galtona–Watsona | pojedyncze zdarzenia: nowy liść albo wygasający liść |
| Obrona (pojedyncza) | to samo drzewo z wyróżnioną gałęzią do nowego liścia | liść dorasta przy wejściu, potem rzadsze zdarzenia |
| Kalendarz | trzy odległości (twierdzenie Steinhausa): łuki nad osią czasu mają tylko trzy wysokości | najstarszy punkt znika, później dochodzi nowy |
| Seminaria (lista) | „Rozsadnik”: nasiona pod złotym kątem | co 1–8 s nowe nasiono, reszta odsuwa się o włos, najstarsze gasną |
| Sem. Analiza harmoniczna | układ Haara: schodki diadyczne | co 4–12 s jeden przedział się dzieli albo dwa się scalają |
| Zakład Analizy Funkcjonalnej | wariant: łamana Schaudera z węzłami | nowy węzeł wyrasta z cięciwy |
| Sem. Dyskretna analiza harmoniczna… | wielomiany Czebyszewa T₂…T₈ | co 10–25 s jeden wielomian płynnie zmienia stopień o 1 |
| Zakład Analizy Matematycznej | wariant: przeplatanie zer | jw. |
| Sem. Równania różniczkowe | portret fazowy wahadła: pole kierunków, separatrysy, trajektorie | nowa trajektoria wyrasta (ok. 3 px/s), najstarsza gaśnie |
| Zakład Równań Różniczkowych | wariant: wahadło tłumione (spirale) | jw. |
| Sem. Teoria prawdopodobieństwa… | ruch Browna (konstrukcja Lévy’ego–Ciesielskiego) | jeden odcinek trajektorii losowany na nowo (most Browna) |
| Sem. Statystyka | histogram i gęstość normalna | wymiana jednej obserwacji: dwa słupki zmieniają się o 2–3 px |
| Zakład Statystyki | wariant: obszar krytyczny testu | jw. |
| Sem. Geometria / Zakład Geometrii | longimetr Steinhausa: 3 siatki obrócone o 30°, krzywa, kropki przecięć (seminarium: krzywa otwarta, zakład: pętla) | krzywa meandruje (ok. 1,2 px/s), siatka stoi |
| Sem. Topologia / Zakład Teorii Mnogości i Topologii | kontinuum Knastera („wiadro z rączką”) na zbiorze Cantora (zakład: dodatkowo zbiór Cantora na osi) | kawałek kompozanty dorysowuje się (2,5 px/s), po 25–45 s gaśnie |
| Sem. Teoria modeli / Zakład Algebry i Teorii Modeli | krzywa eliptyczna z prawem grupowym (zakład: na przemian sieczna i styczna) | prosta rośnie do R, potem odcinek do P + Q, potem gaśnie |
| Sem. Pracowni Dydaktyki… / Pracownia | geoplan i wzór Picka (wariant: inny kształt startowy) | wierzchołek gumki przesuwa się na sąsiedni kołek |
| Projekty i granty | wachlarz Lelka (promienie w kierunkach ze zbioru Cantora) | jeden promień naraz rośnie, cofa się, znika albo wyrasta nowy |
| Grant | ten sam wachlarz; jaśniejszy promień pokazuje, jaka część okresu realizacji minęła | jw., ten promień stoi |
| Publikacje | łuki cytowań nad osią lat (gęstość z wykazów, cytowania poglądowe) | co kilka sekund nowy łuk (3 px/s), jeden stary gaśnie |
| Rocznik publikacji | łuki współautorstwa z prawdziwych par autorów danego roku | losowy łuk gaśnie i rysuje się od nowa |
| Sukcesy / zestawienie historyczne | schemat Bernoulliego: ścieżka sukcesów i porażek ze schodkami rekordów | losowy odcinek przestawia kolejność kroków |

**Seminaria i zakłady przypisuj według danych.** Seminarium ma pole `zaklad`, a zakład dostaje wariant motywu swojego seminarium. Seminarium albo zakład spoza tabeli dostaje motyw z tej samej rodziny dziedzin, a jeśli żadna nie pasuje, Lorenza z działu. Odnotuj to w dzienniku. Dotyczy to np. Zakładu Teorii Prawdopodobieństwa: dostaje ruch Browna w wariancie.

Dane do rysunków (np. pary współautorów, gęstość publikacji, liczba osób) mają pochodzić z danych strony przy budowie, a nie być wpisane na sztywno. Wyjątkiem są rysunki opisane w tabeli jako poglądowe.

## Kryteria odbioru
1. `npm run build` przechodzi; w konsoli przeglądarki na tych stronach nie ma błędów.
2. Każda strona z tabeli ma na telefonie swój motyw, zgodny z prototypem wyglądem i ruchem, szaro-biały i z zanikiem przy tekście z silnika.
3. Kalendarz na telefonie nie ma już bursztynowego motyla; ma trzy odległości.
4. Wydajność i dostępność jak w zleceniu 02 (pkt 3, 4, 7, 8), sprawdzone na co najmniej 6 stronach, w tym jednej z długim tytułem (np. „Analiza harmoniczna i rozwinięcia ortogonalne”).
5. Strona ładuje tylko kod swojego motywu. W dzienniku podaj rozmiary plików motywów.
6. Komputer bez zmian.
7. Sekcja „03-animacje-nauka-seminaria-zaklady” w `.przekazanie\dziennik.md`.
