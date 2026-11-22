# Web-Core: wskazówki dla Claude Code

## Zlecenia, dziennik i raporty: prywatne repozytorium IM-UWr/Web-Zlecenia
Historia pracy (changelog) jest w prywatnym repozytorium https://github.com/IM-UWr/Web-Zlecenia. Jego lokalny klon to folder `.przekazanie/` w tym repozytorium. Web-Core go ignoruje (`.gitignore`), a nic z niego nie trafia do Web-Core ani na stronę.

- **Brak folderu `.przekazanie/`** (np. nowy komputer): `git clone https://github.com/IM-UWr/Web-Zlecenia.git .przekazanie`.
- **Na początku pracy:** `git -C .przekazanie pull --ff-only`. Zlecenia czytaj z `.przekazanie/zlecenia/`, bo nowe mogą przyjść prosto na GitHub. Zasady pracy są w `.przekazanie/zlecenia/zasady.md`.
- **Po każdym zapisie** commituj i od razu wypychaj zmiany w `.przekazanie` (`git -C .przekazanie add …`, `commit`, `push`). Dotyczy to:
  - zlecenia, także wykonanego zapisanego jako changelog `NN-*.md` z „WYKONANE” w tytule;
  - wpisu w `dziennik.md`;
  - raportu w `raporty/`.
