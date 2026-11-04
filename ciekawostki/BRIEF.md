# Ciekawostki i rysunki patronów — wspólne zasady (4.11.2026)

## Po co
Strona Instytutu Matematycznego UWr ma cztery działy, każdy z patronem (założyciele wrocławskiej matematyki):
- Instytut: **Edward Marczewski** (1907–1976; do 1940 publikował jako Edward Szpilrajn),
- Nauka: **Władysław Ślebodziński** (1884–1972),
- Studia: **Bronisław Knaster** (1893–1980),
- Popularyzacja: **Hugo Steinhaus** (1887–1972).

W nagłówku każdej podstrony działu z prawej stoi **znak**: rysunek matematyczny związany z patronem, a przed nim **opis: nazwa (twierdzenia, pojęcia, faktu) + rok, jedno zdanie**. Dziś każdy dział ma jeden znak (Marczewski: rozszerzenie porządku Szpilrajna; Ślebodziński: pochodna Liego; Knaster: kontinuum Knastera; Steinhaus: kanapka z szynką). Chcemy **pulę ciekawostek**, żeby każda podstrona działu miała własną.

## Co oddajesz (w swoim katalogu `/home/claude/ciekawostki/<patron>/`)
1. `ciekawostki.json` — tablica obiektów:
   ```json
   {
     "id": "knaster-tarski",
     "nazwa": "Twierdzenie Knastera–Tarskiego",
     "rok": "1928",
     "zdanie": "Każda funkcja monotoniczna na kracie zupełnej ma punkt stały.",
     "notka": "2–4 zdania szerzej, dla redakcji (kontekst, kto, gdzie opublikowane, dlaczego ważne).",
     "rodzaj": "twierdzenie | pojęcie | historia | anegdota | zastosowanie",
     "pewnosc": "pewne | do sprawdzenia",
     "zrodla": ["https://…", "https://…"],
     "podstrona": "Rok akademicki",
     "dlaczego_tu": "krótko, czemu pasuje do tej podstrony (może być z przymrużeniem oka)",
     "sciezki": [{ "d": "M… L…", "gruba": false }, { "d": "…", "gruba": true }]
   }
   ```
2. `rysunki.html` — samodzielny podgląd wszystkich rysunków z opisami (do obejrzenia), oraz `rysunki.png` (zrzut tej strony, Playwright: `require('playwright')`, `chromium.launch()`).
3. `generator.js` (Node) — kod, który liczy ścieżki (rysunki mają być **policzone**, nie „na oko”), i z którego powstał `sciezki` w JSON.
4. `RAPORT.md` — krótko: lista ciekawostek, przypisanie do podstron, co pewne, co do sprawdzenia i dlaczego, źródła.

## Ciekawostki: zasady
- **Prawda przede wszystkim.** Każdy fakt (nazwisko, rok, treść twierdzenia, wydarzenie) potwierdź w co najmniej jednym wiarygodnym źródle: MacTutor (St Andrews), Encyclopedia of Mathematics, artykuły i prace oryginalne, Wikipedia pl/en (jako punkt wyjścia, sprawdź przypisy), strony UWr / IMPAN / PTM, Wiadomości Matematyczne, biografie. Rok = rok publikacji albo wydarzenia; jeśli źródła się różnią, napisz to w notce i daj `"pewnosc": "do sprawdzenia"`.
- **Zdanie:** po polsku, jedno, zrozumiałe dla studenta 1. roku, maks. ok. 110 znaków, bez wzorów. Nazwa krótka (maks. ok. 40 znaków).
- **Różnorodność:** głównie matematyka patrona (twierdzenia, pojęcia, przykłady jego imienia, prace ze współautorami), ale też historia i anegdoty (Lwów, Szkocka Księga, Wrocław po 1945, uczniowie, książki, życie). Anegdoty tylko udokumentowane.
- Bez polityki i bez drastycznych szczegółów biograficznych (wojna, Holokaust: tylko jeśli konieczne i taktownie, raczej pomijać w tej roli).
- Jeśli znajdziesz więcej ciekawostek niż podstron, dobrze — oddaj wszystkie dobre (zapas).

## Rysunki: zasady (format jak obecne znaki w prototypie)
- Układ współrzędnych: **viewBox 0 0 200 240**, rysunek w polu **x 12–188, y 34–224** (nie wychodź poza).
- **Tylko linie**, bez wypełnień, bez tekstu i liter (wyjątek: nic). Kropki jako małe okręgi ścieżką (`M x-4.5,y a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0`, `gruba: true`).
- `gruba: true` dla elementu głównego (wyróżnionego, np. rozwiązanie, punkt stały, prosta przepoławiająca), reszta cienka. Na stronie: cienkie ok. 1,1–1,3 px, grube ok. 2 px, kolor działu, rysunek ok. **145×170 px** (niski nagłówek) i do **200×200 px** (wyższy).
- **Czytelny w małym rozmiarze:** 5–60 ścieżek, bez drobnicy poniżej 3 jednostek, spokojny, elegancki, w stylu rycin/diagramów z podręcznika; ma od razu „mówić” o twierdzeniu (np. punkt stały wyróżniony, wachlarz Knastera–Kuratowskiego, łuki kontinuum).
- **Matematycznie wierny:** licz współrzędne w `generator.js` (np. prawdziwa konstrukcja, iteracja, rozwiązanie równania), zaokrąglaj do 1 miejsca po przecinku.
- Każda ciekawostka ma swój rysunek. Dwie ciekawostki mogą mieć podobny motyw, ale nie identyczny.
- Inspiracja (tylko do czytania, nie kopiuj stylu animacji): motywy banerów telefonu w `/home/claude/wz/src/scripts/baner/motywy/*.ts` (np. `knaster.ts`, `wachlarz.ts`, `kanapka.ts`, `trzy-odleglosci.ts`, `longimetr.ts`, `lorenz.ts`) oraz obecne znaki w `/home/claude/estetyka/proto/zalozyciele.src.html` (funkcje `znakSzpilrajn`, `znakLie`, `znakKnaster`, `znakKanapka`).

## Czego nie robisz
- Nie zmieniasz niczego poza swoim katalogiem `/home/claude/ciekawostki/<patron>/` (inne katalogi tylko czytasz). Nic nie publikujesz, nie pushujesz, nie zapisujesz na komputer użytkownika.
- Na koniec odpowiedz krótko (po polsku): ile ciekawostek, ile pewnych, przypisanie do podstron w jednej liście, ścieżki plików.
