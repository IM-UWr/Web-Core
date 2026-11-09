# Archiwum starego silnika animacji banerów

9.11.2026 wycofano z `main` nieaktywny katalog `src/scripts/baner/`: silnik,
typy, pomocniki, motywy matematyczne, niepodpięty arkusz `baner.css` i jego README.

## Zachowana wersja

- Gałąź archiwalna: [`archiwum/2026-11-09-silnik-banerow`](https://github.com/IM-UWr/Web-Core/tree/archiwum/2026-11-09-silnik-banerow).
- Pełny SHA sprzed usunięcia: [`ec63774647a165693e356f0555a87cb7a3b40c2f`](https://github.com/IM-UWr/Web-Core/commit/ec63774647a165693e356f0555a87cb7a3b40c2f).
- [Kod i pierwotna instrukcja ponownego podłączenia](https://github.com/IM-UWr/Web-Core/tree/ec63774647a165693e356f0555a87cb7a3b40c2f/src/scripts/baner).

Archiwum zachowuje całe repozytorium, więc zawiera także ówczesne zależności silnika:
`src/lib/media.ts`, mapę `src/lib/motywyBanerow.ts` i maski `src/assets/naglowki/`.
Nie wymaga odtwarzania plików z kilku różnych wersji.

## Sprawdzone powiązania

`NaglowekStrony.astro` używa `components/zal/NaglowekZ.astro` i nie importuje silnika
ani nie emituje jego atrybutów `data-animacja`. Poza wycofywanym katalogiem nie ma
importów jego modułów lub arkusza CSS, także po nałożeniu treści z `main` repozytoriów
wymienionych w `tresci.json`.

Aktywne animacje patronów są w `src/scripts/zal/szkice.ts`. Ten kod, komponenty
„Założycieli” oraz responsywne arkusze stylów pozostają bez zmian.

Mapa `motywyBanerow.ts` nadal jest odczytywana przez `lib/widoki/zaklad.ts`, który
wylicza zgodnościowe pole `motyw`. Nagłówek go nie renderuje. Mapa, pola `motyw` /
`motywDane` i ich obliczenia pozostają na miejscu, aby ta operacja nie zmieniała
kontraktu widoków. Nie importują ani nie uruchamiają archiwalnego silnika.
Historyczne komentarze wskazujące `src/scripts/baner/` odnoszą się do powyższego SHA.

## Odtworzenie do dalszej pracy

Na osobnej gałęzi roboczej można przywrócić sam katalog:

```sh
git fetch origin archiwum/2026-11-09-silnik-banerow
git restore --source=ec63774647a165693e356f0555a87cb7a3b40c2f -- src/scripts/baner
```

Samo przywrócenie plików nie włącza animacji. Ponowne podłączenie wymaga osobnej
decyzji oraz adaptacji do bieżącego nagłówka według archiwalnego README.
