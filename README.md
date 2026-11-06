# Kopia bezpieczeństwa — 6.11.2026, ok. 02:08

Stan z komputera właściciela (C:\Users\Szymek\source\Web-Core), w trakcie zlecenia 18 (Code pracuje).

- Gałąź z kodem: `kopia/2026-11-06-wyglad-zlecenie-16` (= lokalna `wyglad/zlecenie-16`, commit 70c3c6f9, cały łańcuch wyglad/en → 11 → 13 → 14 → 15 → 16 + zlecenia 17–18 do punktu 5).
- `niezacommitowane.patch` — zmiany w drzewie roboczym, których Code jeszcze nie zacommitował (git diff), `status.txt` — lista plików.
- `nakladka-src-content-data.tar.gz` — lokalna nakładka treści (`src/content`, `src/data`, poza gitem) z łatkami ze zleceń 14–16.

Odtworzenie: `git switch -c przywrocona origin/kopia/2026-11-06-wyglad-zlecenie-16`, `git apply niezacommitowane.patch`, `tar -xzf nakladka-src-content-data.tar.gz`.
Ta gałąź nie ma wspólnej historii z kodem — tylko pliki kopii. Nie scalać.
