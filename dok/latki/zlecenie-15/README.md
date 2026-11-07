# Łatki treści: zlecenie 15 (Popularyzacja)

Łatki powstały z nakładki po przebudowie działu; repozytoriów treści nie zmieniałem. Nakładaj je dopiero po sprawdzeniu
listy „Do potwierdzenia” z `RAPORT-ZLECENIE-15.md`.

| Łatka | Repozytorium | Co zmienia |
|---|---|---|
| `Web-Popularyzacja.patch` | Web-Popularyzacja | `src/data/popularyzacja.json`: hasło, wstęp, „O popularyzacji”, „W skrócie”, lata tradycji; bez pola `grupy`. Cztery nowe strony `src/content/strony/popularyzacja/` (PL i EN). `.pages.yml`: nowe pola działu, bez `grupy`, nowy formularz „Strony Popularyzacji” |
| `Web-Ustawienia.patch` | Web-Ustawienia | `src/data/nawigacja.json`: grupa „Dla kogo” przed „Partnerami” w menu Popularyzacji (bez Organizatorów) |

Nałożenie (w klonie danego repozytorium):

```bash
git apply ścieżka/do/Web-Popularyzacja.patch
```

Pole `grupy` znika z danych i z formularza. Były w nim cztery puste grupy, z których brało się „To be announced”, a nowy widok go nie czyta.

Strony mają w nagłówku `bloki: true`: listy Markdown stają się blokami wzorca treści (`src/plugins/rehype-bloki.mjs`). Budowa list jest opisana w `.przekazanie/pola-do-cms.md`.
