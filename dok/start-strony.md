# Start nowej strony

Jak przenieść nową wersję strony na `main`. To sam opis: nikt jeszcze tego nie wykonał. Uruchamia się to dopiero na decyzję właściciela, bo od kroku 2 zmiany trafiają na działającą stronę `im-uwr.github.io/Web-Core`.

Stan repozytoriów sprawdzony 6.11.2026 (zlecenie 22, etap 11). Przed startem trzeba go sprawdzić jeszcze raz.

Polecenia zakładają, że katalog roboczy to `Web-Core`, a klony treści leżą obok w `tresci`:

```bash
REPOZYTORIA=$(python -c "import json; print(*json.load(open('tresci.json', encoding='utf-8'))['repozytoria'])")
KLONY=../tresci
```

## Zanim zaczniesz

**1. Próba zapisu w CMS (zlecenie 22, etap 9) ma wynik pozytywny.** Właściciel odłożył ją 6.11. Dopóki jej nie ma, formularzy nie sprawdzono w prawdziwym Pages CMS. Wymaga aplikacji Pages CMS zainstalowanej w organizacji IM-UWr na 21 repozytoriach treści: bez niej każdy zapis, także edytorów, kończy się błędem „Resource not accessible by integration” (tak było 6.11).

**2. Wpisy testowe są usunięte.** To 8 wpisów i 4 zdjęcia dodane na prośbę właściciela, wyłącznie na gałęzi `wyglad/zlecenie-16`. Usunąć je w klonach, na tej gałęzi, i wypchnąć tylko tę gałąź.

| Repozytorium | Pliki do usunięcia |
| --- | --- |
| Web-Aktualnosci | `src/content/aktualnosci/test-2026-11-03-kolo-naukowe-gry-kombinatoryczne.md` |
| | `src/content/aktualnosci/test-2026-11-04-warsztaty-dla-licealistow-liczby-pierwsze.md` |
| | `src/content/aktualnosci/test-2026-11-05-wyklad-otwarty-macierze-losowe.md` |
| | `src/content/aktualnosci/test-2026-11-06-dzien-otwarty-dla-kandydatow.md` |
| | `public/pliki/aktualnosci/test-kolo-gry-kombinatoryczne.jpg` |
| | `public/pliki/aktualnosci/test-warsztaty-liczby-pierwsze.jpg` |
| | `public/pliki/aktualnosci/test-wyklad-macierze-losowe.jpg` |
| | `public/pliki/aktualnosci/test-dzien-otwarty.jpg` |
| Web-Sem-Rownania-Rozniczkowe | `src/content/referaty/rownania-rozniczkowe/test-2026-11-09-mister-test.md` |
| Web-Sem-Statystyka | `src/content/referaty/statystyka/test-2026-11-10-mister-test.md` |
| Web-Sem-Prawdopodobienstwo | `src/content/referaty/prawdopodobienstwo/test-2026-11-12-mister-test.md` |
| Web-Sem-Analiza-Harmoniczna | `src/content/referaty/analiza-harmoniczna/test-2026-11-18-mister-test.md` |

**Usuwać tylko pliki z tej tabeli, po pełnych ścieżkach, bez masek typu `test-*`.** 81 plików `test-*.pdf` w Web-Studia to prawdziwe zadania egzaminacyjne.

Potem sprawdzić na podglądzie, że wpisów nie ma w Aktualnościach, Kalendarzu i Seminariach. Wydarzenia testowe mają tytuły zaczynające się od „Testowe:”, a referaty prelegenta „Mister Test”.

**3. Gałęzie `test-cms` są usunięte**, jeśli po próbie w CMS jeszcze istnieją: Web-Studia, Web-Popularyzacja, Web-Ustawienia, Web-Nauka, Web-Spec-Aktuarialno-Finansowa, Web-Sem-Topologia.

## Procedura

### 1. Przerwa dla edytorów

Poprosić edytorów o przerwę i poczekać na potwierdzenie. Zapis w CMS po kroku 2 by przepadł.

### 2. Treści na `main`

W każdym repozytorium treści przenieść gałąź na `main` (fast-forward):

```bash
for r in $REPOZYTORIA; do
  git -C "$KLONY/$r" fetch -q origin
  git -C "$KLONY/$r" merge-base --is-ancestor origin/main origin/wyglad/zlecenie-16 \
    && git -C "$KLONY/$r" push origin origin/wyglad/zlecenie-16:main \
    || echo "STOP: $r"
done
```

- 6.11 `main` nie miał własnych commitów w żadnym z 21 repozytoriów. Jeśli przy którymś pojawi się `STOP`, to repozytorium trzeba scalić i przejrzeć ręcznie. Bez `--force`.
- Wypychać dokładnie `origin/wyglad/zlecenie-16`. Lokalny `main` klonów bywa przed `origin/main` (6.11 m.in. Web-Instytut i Web-Studia o 2 commity) i nie wolno go wypchnąć.
- Web-Pracownicy ma gałąź równą `main`, więc push nic tam nie zmieni.
- Każdy push uruchamia `powiadom.yml`, a ten publikację obecnej strony. Do kroku 3 strona działa na starym kodzie i nowych treściach.

### 3. Kod Web-Core na `main`

Treści idą przed kodem, bo sprawdzono, że stary kod buduje się z nowymi treściami. Odwrotnej kolejności nie sprawdzano.

6.11 `main` miał 3 commity spoza gałęzi: `446e98e3` z etapu 5 (ta sama zmiana jest na gałęzi jako `a43fb368`) i 2 aktualizacje planu zajęć z USOS. Takich aktualizacji może przybyć, bo dodaje je `plan-zajec.yml`. Próbne scalenie (`git merge-tree`) nie dało konfliktów.

Scalać w osobnym katalogu, żeby nie ruszać działających serwerów dev:

```bash
git fetch origin
git worktree add -q --detach ../Web-Core-start origin/main
git -C ../Web-Core-start merge --no-ff origin/wyglad/zlecenie-16 -m "Start nowej strony: scalenie wyglad/zlecenie-16"
git -C ../Web-Core-start push origin HEAD:main
git worktree remove ../Web-Core-start
```

Jeśli push zostanie odrzucony, bo w międzyczasie przybył commit z planem zajęć, pobrać i scalić jeszcze raz. Bez `--force`.

### 4. `main` znów gałęzią domyślną

```bash
for r in $REPOZYTORIA; do
  gh api -X PATCH "repos/IM-UWr/$r" -f default_branch=main --jq '.full_name + " " + .default_branch'
done
```

Każda linia wyniku ma kończyć się na `main`. Jeśli etapu 10 zlecenia 22 nie wykonano, ten krok niczego nie zmienia.

### 5. Sprawdzenie

- `https://app.pagescms.org/IM-UWr/Web-Instytut` otwiera `main` i nowe formularze (właściciel, po zalogowaniu).
- Publikacja Web-Core po scaleniu jest zielona.
- `https://im-uwr.github.io/Web-Core/` pokazuje nową stronę, a `/o-stronie/`, które do startu daje 404, działa.
- Nie ma wpisów testowych.

Do końca tego kroku gałąź `wyglad/zlecenie-16` zostaje na miejscu. Przy problemie nie przechodzić dalej.

### 6. Usunięcie gałęzi w repozytoriach treści

Gałęzi domyślnej GitHub nie pozwala usunąć, stąd ta kolejność. Tylko w repozytoriach treści, nie w Web-Core:

```bash
for r in $REPOZYTORIA; do
  git -C "$KLONY/$r" push origin --delete wyglad/zlecenie-16
done
```

Zakładka edytora z nazwą gałęzi w adresie pokaże „Branch not found” z przyciskiem „Open default branch”.

## Po starcie

- Dać edytorom znać, że mogą wrócić do pracy, pod linkiem `https://app.pagescms.org/IM-UWr/<Repozytorium>`.
- Reguła z `.przekazanie\zlecenia\zasady.md`, że nikt nie zapisuje na `main` repozytoriów treści, przestaje obowiązywać. Treści pobiera się bez `--galaz`.
- Web-Podglad nadal buduje kod z gałęzi `wyglad/zlecenie-16` w Web-Core. Gdy repozytorium treści nie ma tej gałęzi, bierze jego `main`, więc przebieg się nie wysypie, ale podgląd przestanie pokazywać nowe zmiany kodu. Trzeba zdecydować, czy przestawić go na `main`, czy wyłączyć.
