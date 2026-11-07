# Łatki treści: zlecenie 20 (pas działu na komputerze)

Względem gałęzi `wyglad/zlecenie-16` repozytoriów treści, czyli stanu po łatkach ze zleceń 14–16. Zmiany są już na tej gałęzi (podgląd w Web-Podglad), na `main` ich nie ma.

| Łatka | Repozytorium | Co zmienia |
|---|---|---|
| `Web-Ustawienia.patch` | Web-Ustawienia | `src/data/nawigacja.json`: pola `opis` i `opis_en` przy grupach i linkach; `.pages.yml`: te pola w formularzu „Menu główne” |
| `Web-Studia.patch` | Web-Studia | `src/content/kierunki/matematyka.md` i `szkola-doktorska.md`: pola `menu_opis` i `menu_opis_en`; `.pages.yml`: te pola w formularzu kierunku |

Nałożenie (w klonie danego repozytorium):

```bash
git apply ścieżka/do/Web-Ustawienia.patch
```

Angielskie opisy to propozycje do przejrzenia przez właściciela (`RAPORT-ZLECENIE-20.md`). Kopie plików nakładki sprzed zmiany: `.przekazanie/robocze/nakladka-przed-20/`.
