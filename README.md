# Kopia prac nad estetyką strony IM UWr (1.11.2026)

Gałąź-kopia, bez wspólnej historii z kodem strony. Nie scalać z `main`.
Zawiera pliki robocze z rozmowy o estetyce, prowadzonej w projekcie „IM Strona” w claude.ai.

- `proto/*.src.html` to źródła prototypów. Gotowe pliki `proto/*.html` otwiera się bezpośrednio w przeglądarce, bo zdjęcia i fonty są w nich osadzone.
- Złożenie prototypu: `python3 skrypty/zloz.py proto/zalozyciele.src.html proto/zalozyciele.html`
- `proto/zasoby/` zawiera zdjęcia, zrzuty obecnej strony, dane (plan zajęć, projekty) i fonty.
- `skrypty/podglad.js` robi zrzuty przez Playwright. Lokalne fonty dla podglądu są w `fonty/lokalne.css` i wymagają paczek @fontsource.
- `dok/przekazanie.md` to stan dokumentu przekazania z 1.11.

Prototyp „Założyciele” jest też opublikowany jako artefakt w claude.ai (wersja 31).
