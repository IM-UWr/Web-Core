# Archiwum: raport roboczy (w toku, zapis po restarcie kontenera)

## Najważniejsze zastrzeżenie
Żadnego z tych zdjęć nie widziałem. WebFetch zwraca błąd przy plikach graficznych (sprawdzone na trzech adresach na dwóch serwerach). Wszystkie wpisy mają `widziane: false`, a oceny są wstępne: opierają się na opisach alt, podpisach i nazwach plików.

## Co się nie otworzyło
- web.archive.org: WebFetch odmówił (SITE_BLOCKED). Nie obchodziłem tego, więc dawnych wersji math.uni.wroc.pl nie sprawdziłem.
- Pliki graficzne: błąd serwera przy pobieraniu przez WebFetch.
- `wmi.uwr.edu.pl/wp-json/wp/v2/pages?per_page=100`: błąd serwera. Pojedyncze wpisy REST (`posts/52254`, `pages/51651`): błąd klienta.

## Główne znalezisko
Biblioteka mediów strony WMI (WordPress REST API) podaje wymiary i adresy. Jest tam seria sesji zdjęciowej `Kopia-_MG_28xx–29xx` (ok. 60 plików, wielu o szerokości 14173 px) oraz seria ze stycznia 2023 `Kopia-20230104_*` (część 4000×2252). Autor sesji nie jest podany.

## Prośby o oryginały (na razie)
- Zuzanna Pelc: Immatrykulacja 2026, Kongres Młodych Odkrywców 2025 i 2026.
- Paweł Piotrowski / UWr: konferencja SPA 2025, konferencja AI 2024, Kongres Nauczycieli Matematyki 2026.
- Dominika Hull-Bruska: 9. Kongres Młodych Matematyków 2024, gmach 2016.
- Magdalena Marcula, Biuro ds. Promocji UWr: seria „studenci UWr”.
