# Łatki treści: zlecenie 16 (wersja angielska)

Względem stanu po łatkach z `dok/en/latki/` (a w repozytoriach, których dotyczą, także po `dok/latki/zlecenie-14/` i `zlecenie-15/`). Są już nałożone jako commity w klonach `C:\Users\Szymek\source\tresci\<Repozytorium>`, bez pushowania, i na lokalnej nakładce (część `src/`).

| Łatka | Co zmienia |
|---|---|
| `Web-Aktualnosci.patch` | 21 wpisów: D4 (tytuły w nawiasach), D8 (nazwy konkursów, pisownia „Krok w Przyszłość” także w polu polskim), stopnie z D1. Osiem obron: usuwa `tresc_en` dodane przez `dok/en/latki` i polską treść wpisu (decyzje właściciela; tekst w obu językach składa widok i sam dobiera czas). `.pages.yml`: nowy opis pola `body` |
| `Web-Nauka.patch` | D11: „Szklarska Poręba” w `2020-model-theory-conference.md` |
| `Web-Sem-*.patch` (9) | D10: pole `jezyk` w `.pages.yml`; w Dyskretnej Analizie Harmonicznej i Równaniach Różniczkowych także `jezyk: pl` przy trzech referatach |
| `Web-Spec-Nauczycielska.patch` | D8: „Krok w Przyszłość” (Step into the Future) |
| `Web-Studia.patch` | `tresc_en` czterech stron: D1, D6, D19 |
| `Web-Ustawienia.patch` | D20: „(in Polish)” przy sześciu pozycjach menu w `src/data/nawigacja.json` |

Kolejność w czystym klonie: najpierw łatki 14 i 15, jeśli dotyczą repozytorium, potem `dok/en/latki/`, na końcu ta:

```bash
git apply ścieżka/do/dok/latki/zlecenie-16/Web-Studia.patch
```

Tłumaczenia do przejrzenia są w `RAPORT-ZLECENIE-16.md`.
