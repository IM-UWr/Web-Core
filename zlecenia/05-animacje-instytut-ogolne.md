# Zlecenie 05: animacje podstron Instytutu i stron ogólnych (telefon)

Najpierw przeczytaj `.przekazanie\zlecenia\zasady.md`. Wymaga zleceń 01 i 02. Zakłady są w zleceniu 03.

## Cel
Podstrony Instytutu i strony ogólne dostają animowane motywy w tle banera. Dendryt z działu zostaje tylko na stronie Instytutu. Prototypy zaakceptował użytkownik. Dotyczy tylko telefonu.

## Prototypy (w `.przekazanie\prototypy\`)
- `animacje-instytut.html`: Władze, Pracownicy, Struktura i zakłady, Kontakt, Infrastruktura. Strony „Zakłady” z prototypu nie wdrażaj: adres /instytut/zaklady/ nie istnieje, a lista zakładów jest na /instytut/struktura/.
- `animacje-ogolne.html`: Warto wiedzieć (lista i wpis), Szukaj, strony prawne

Przy długich tytułach stosuj zanik z silnika („obrys linii”). Cienia 25% pod tytułem (propozycja z prototypu Instytutu) **nie wdrażaj**.

## Strona → motyw → ruch
| Strona | Motyw | Ruch (losowo, nie w kółko) |
|---|---|---|
| Władze Instytutu | kanapka z szynką na płaszczyźnie (problem Steinhausa, rozwiązanie Banacha): jedna prosta dzieli na połowy dwa zbiory punktów | co 5–12 s jeden punkt przechodzi w nowe miejsce (1,5 px/s), prosta szuka nowego podziału (≤ 2 px/s) |
| Pracownicy | diagram łukowy: kropki w grupach z danych (liczba osób z danych), łuki poglądowe | nowy łuk rośnie z obu końców (2,5 px/s) albo stary gaśnie |
| Struktura i zakłady | dendrogram: osoby → zakłady i pracownia → obszary → Instytut (z danych) | raz rośnie od liści, potem jedna belka powoli się podnosi albo opada |
| Kontakt | schematyczna mapa: rzeka, most, ulice, znacznik; brzeg rzeki w zmiennej skali (Steinhaus, Perkal) | brzeg losowo zyskuje i traci szczegóły (1–2 px/s), reszta stoi |
| Infrastruktura informatyczna | sieć motylkowa: 8 wierszy, ukośna krawędź zmienia jeden bit | losowa trasa zapala się odcinek po odcinku i gaśnie |
| Warto wiedzieć (lista i wpis) | trzy odległości (Steinhaus) | okno punktów nα przesuwa się co 3–8 s, łuki dzielą się i łączą przez przenikanie |
| Szukaj | punkt stały Banacha (pajęczyna iteracji) na kratce | odcinki pojawiają się po kolei, potem nowy losowy start |
| Deklaracja dostępności, Polityka prywatności | wspólna kratka | **statyczna** (bez pętli) |
| Powiadomienia, wpis aktualności, 404 | bez zmian | — |

Strona Instytutu spoza tabeli dostaje dendryt z działu; odnotuj to w dzienniku.

## Kryteria odbioru
1. `npm run build` przechodzi; w konsoli przeglądarki nie ma błędów.
2. Każda strona z tabeli ma na telefonie przypisany motyw, zgodny z prototypem, szaro-biały i z zanikiem przy tekście z silnika. Strony prawne mają statyczną kratkę.
3. Na podstronach Instytutu nie ma już bursztynowo-brązowego trójkąta.
4. Wydajność i dostępność jak w zleceniu 02 (pkt 3, 4, 7, 8), sprawdzone na co najmniej 5 stronach, w tym na Infrastrukturze informatycznej (długi tytuł).
5. Komputer bez zmian.
6. Sekcja „05-animacje-instytut-ogolne” w `.przekazanie\dziennik.md`.
