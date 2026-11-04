# Zdjęcia dla strony Instytutu Matematycznego UWr — wspólne zasady (5.11.2026)

## Po co
Nowy wygląd strony („Założyciele”) ma duże zdjęcia:
- **okładka strony głównej**: zdjęcie na cały ekran (1920×1080 i więcej). Lewa część jest przykryta granatem z tytułem „Instytut Matematyczny”, więc temat zdjęcia powinien stać w prawej części albo w prawej górnej. Pod spodem, w ciemnym pasie, są nazwy czterech działów. Dziś to nocne zdjęcie z lotu ptaka budynku Instytutu (pl. Grunwaldzki) z ulicą i drzewami.
- **banery 4 działów**: szeroki pas 1920×300 px. Z lewej granat z tytułem, a zdjęcie wchodzi od ok. 1/3 szerokości, przerobione na **dwa kolory**: skala szarości, cienie granatowe, światła w kolorze działu. Do tego szkic twarzy patrona z prawej. Jasne, spokojne zdjęcia z wyraźną strukturą (architektura, wnętrza, światło) wychodzą najlepiej. Ciemne i „zatłoczone” gorzej.
- **nagłówki podstron**: to samo zdjęcie działu na całej szerokości, przykryte w 55–90% głębokim kolorem działu.

Działy i ich charakter:
- **Instytut** (patron Edward Marczewski): instytucja, historia, budynek, ludzie, organizacja.
- **Nauka** (patron Władysław Ślebodziński): badania, seminaria, tablica z wzorami, konferencje, biblioteka.
- **Studia** (patron Bronisław Knaster): studenci, sale wykładowe (HS, WS, EM, B), kampus, zajęcia.
- **Popularyzacja** (patron Hugo Steinhaus): uczniowie, warsztaty, wykłady otwarte, festiwale nauki, koła, obozy.

Obecne zdjęcia (do porównania, są „średnie”): w repozytorium Web-Core `public/pliki/naglowki/{instytut,nauka,studia,popularyzacja,aktualnosci}.jpg` (ok. 1200×800, za mała rozdzielczość na 1920 px), a na gałęzi kopii `kopia/2026-11-01-estetyka-prototypy` także `proto/zasoby/{kampus-2000,inst-naglowek,nauka-naglowek,studia-naglowek,popularyzacja-naglowek}.jpg` (okładka: nocne ujęcie budynku z lotu ptaka). Obejrzyj je narzędziem Read, żeby wiedzieć, co poprawiamy.

## Co oddajesz (w katalogu `zdjecia/<twój-katalog>/`)
1. `KANDYDACI.json` — tablica:
   ```json
   { "dzial": "instytut|nauka|studia|popularyzacja|okladka|ogolne",
     "tytul": "krótki opis zdjęcia",
     "strona": "URL strony ze zdjęciem (np. strona pliku w Commons, wpis na starej stronie)",
     "obraz": "bezpośredni URL pliku w pełnej rozdzielczości (jeśli znany)",
     "miniatura": "bezpośredni URL miniatury do ok. 800 px szerokości (np. upload.wikimedia.org/…/800px-…)",
     "szer": 4000, "wys": 2667,
     "licencja": "CC BY-SA 4.0 | CC0 | domena publiczna | Unsplash | prawa UWr/IM | nieznana",
     "autor": "…",
     "prawa": "wolne (z podpisem) | wymaga zgody | nieznane",
     "kompozycja": "gdzie jest temat, czy lewa strona jest spokojna, czy jasne/ciemne, czy dobrze zniesie dwa kolory",
     "dlaczego": "1–2 zdania, czemu pasuje do działu",
     "ocena": 1-5 }
   ```
2. `RAPORT.md` — skrót: najlepsze 3 na każdy dział, 3–5 propozycji na okładkę, uwagi o prawach.

## Zasady
- **Nie pobieraj plików**: sieć z terminala jest zablokowana (5.11 sprawdzone: upload.wikimedia.org, commons, web.archive.org, math.uni.wroc.pl, uwr.edu.pl odrzucone, w kontenerze i na komputerze użytkownika). Zbieraj adresy przez WebSearch / WebFetch; właściciel zatwierdza otwieranie stron ręcznie, więc otwieraj, ile trzeba — liczy się jakość.
- **Prawa:** zapisuj licencję i autora przy każdym zdjęciu. Preferuj wolne licencje (Commons CC0/CC BY/CC BY-SA, domena publiczna, Unsplash/Pexels) i zdjęcia Instytutu / Wydziału / UWr (te oznacz „wymaga zgody”, chyba że licencja jest jawnie wolna). Nie wybieraj zdjęć ze znakiem wodnym, stockowych płatnych ani ewidentnie chronionych.
- **Ludzie:** zdjęcia, na których głównym tematem jest rozpoznawalna prywatna osoba, oznacz w uwagach (będą wymagały zgody). Zdjęć portretowych znanych osób (w tym patronów) nie zbieraj — mamy szkice.
- **Rozdzielczość:** dla okładki i banerów min. 2400 px szerokości (najlepiej 3000+); mniejsze tylko wyjątkowo, z uwagą.
- **Konkret:** prawdziwe miejsca związane z Instytutem są cenniejsze niż ogólne „matematyczne” obrazki: budynek przy pl. Grunwaldzkim 2/4 (Wydział Matematyki i Informatyki UWr), jego mural, sale, biblioteka matematyczna, kampus Grunwaldzki, gmach główny UWr, Aula Leopoldina, Wrocław (Odra, Ostrów Tumski, most Grunwaldzki).
- Nic nie publikujesz, nie pushujesz, nie zapisujesz na komputer użytkownika. Wyniki zapisz w katalogu podanym w zleceniu (np. `zdjecia/<agent>/` w klonie gałęzi kopii). Na koniec odpowiedz krótko: ile kandydatów, najlepsze 2–3 na dział i na okładkę (z licencją), ścieżka plików.

## Podział na agentów (propozycja)
1. **archiwum** — stara strona IM i WMI: math.uni.wroc.pl (obecna i dawne wersje w web.archive.org), galerie wydarzeń, strony kół, obozów, Festiwalu Nauki, wykładów otwartych; zdjęcia budynku, sal, biblioteki, tablic.
2. **commons** — Wikimedia Commons i otwarte licencje: kategorie „Instytut Matematyczny UWr”, „Wydział Matematyki i Informatyki UWr”, „Plac Grunwaldzki (Wrocław)”, „University of Wrocław”, „Aula Leopoldina”, Wrocław nocą; plus Unsplash/Pexels dla motywów (tablica z wzorami, biblioteka, sala wykładowa) — tylko jako zapas.
3. **uwr-okladka** — oficjalne źródła: uwr.edu.pl (galerie, informacje prasowe), Dolnośląski Festiwal Nauki, Portal Matematyczny, PTM Wrocław; a przede wszystkim **5–8 propozycji na okładkę strony głównej** w różnych nastrojach (noc / dzień / zima / detal architektury / ludzie z daleka), każda z opisem kadru.
