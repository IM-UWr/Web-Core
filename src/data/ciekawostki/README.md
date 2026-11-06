# Ciekawostki patronów (zlecenie 11, zalecenie 19)

Jeden plik na dział: `instytut.json` (Edward Marczewski), `nauka.json` (Władysław Ślebodziński), `studia.json` (Bronisław Knaster), `popularyzacja.json` (Hugo Steinhaus). Pule przeniesione z gałęzi `kopia/2026-11-01-estetyka-prototypy` (`ciekawostki/<patron>/ciekawostki.json`, stan 5.11.2026).

Ciekawostka stoi w nagłówku każdej podstrony z menu działu (znak z prawej, tytuł i jedno zdanie). Zestaw losuje się raz na wizytę: każda podstrona działu dostaje inną ciekawostkę (kod: `src/lib/ciekawostki.ts`, skrypt w `src/components/zal/NaglowekZ.astro`). Zmiana danych nie wymaga zmian w kodzie.

## Pola

| Pole | Wymagane | Opis |
|---|---|---|
| `id` | tak | stały identyfikator (zapisywany w zestawie wizyty) |
| `nazwa`, `nazwa_en` | tak / zalecane | tytuł; na stronie „nazwa, rok” w jednej linii |
| `rok`, `rok_en` | tak / gdy rok ma słowa | np. „1938”, „lata 30.” / „1930s”, „ok. 1921” / „c. 1921” |
| `zdanie`, `zdanie_en` | tak / zalecane | jedno zdanie pod tytułem, `zdanie` najwyżej 115 znaków (tyle mają obecne karty); puste `_en` — na `/en` tekst polski |
| `sciezki` | tak | rysunek: lista `{ "d": "<ścieżka SVG>", "gruba": true? }` w polu 200×240; `gruba` — element wyróżniony (rysuje się na końcu) |
| `stan` | nie | `przypieta` (zawsze na stronie z pola `strona`), `ulubiona` (3 razy większa szansa), `odpada` (poza losowaniem); brak — zwykła |
| `strona` | dla przypiętej | adres podstrony bez `/en`, np. `/instytut/wladze` |
| `ukryta` | nie | `true` — poza losowaniem (np. do czasu zgody na źródło) |
| `notka`, `rodzaj`, `pewnosc`, `zrodla` | nie | do przeglądu i weryfikacji; na stronie się nie pokazują |
| `podstrona`, `dlaczego_tu`, `przypiecie` | nie | podpowiedzi z przygotowania puli; **nie wchodzą do losowania** |

**Nazwisko patrona w każdej karcie.** Nazwisko pada w `nazwa` albo w `zdanie`, a po angielsku w `nazwa_en` albo w `zdanie_en`. „On”, „jego” („he”, „his”) o patronie nie stoją przed jego nazwiskiem, bo czytelnik nie musi wiedzieć, o kim mowa. Obecność nazwiska sprawdza `skrypty/sprawdz_tresci.py`, zaimków nie.

Strony w losowaniu: linki wewnętrzne z menu działu, których adres należy do działu (strony zewnętrzne, Biblioteka, Rada Dyscypliny i Szkoła doktorska w menu Nauki są poza nim). Bez JavaScriptu albo bez `sessionStorage` każda strona ma ciekawostkę stałą: przypiętą, a jeśli jej nie ma — kolejną z puli w kolejności pliku.

**Przed startem strony ciekawostki trzeba zweryfikować** (fakty, lata, źródła, prawa do cytatów).
