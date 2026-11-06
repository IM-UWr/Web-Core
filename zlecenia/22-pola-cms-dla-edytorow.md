# Zlecenie 22: wszystkie pola w CMS i praca edytorów na gałęzi (GOTOWE, 6.11.2026)

**Cel.** Edytorzy mają pracować w Pages CMS na gałęzi `wyglad/zlecenie-16`, z kompletnymi formularzami i z jednym linkiem, który zadziała też po przeniesieniu treści na `main` i usunięciu gałęzi. Obecna strona (`im-uwr.github.io/Web-Core`) ma się w tym czasie nie zmienić, poza planem zajęć, który sam się aktualizuje.

**Decyzje właściciela (6.11, 12:50–13:01)**
- Na `main` repozytoriów treści nikt już nie edytuje. Formularzy na `main` nie nadpisujemy.
- Link dla edytorów jest bez nazwy gałęzi: `https://app.pagescms.org/IM-UWr/<Repozytorium>`. Otwiera gałąź domyślną repozytorium, więc na czas pracy domyślna jest `wyglad/zlecenie-16`, a przy starcie wraca `main`.
- Dane testowe znikają z gałęzi. Na `main` zostają do startu.
- Podgląd bez przyspieszania: Web-Podglad co godzinę, o :23.
- Ciekawostki, notki patronów i kadry zdjęć działów zostają w kodzie.

**Dlaczego to pilne.** Pages CMS przy zapisie zostawia w pliku tylko pola z formularza, bo walidacja i `deepMap` budują wynik wyłącznie z pól `.pages.yml`, a opcji `settings.content.merge` nie używamy. Pole spoza formularza znika więc przy pierwszym zapisie redaktora. Formularze muszą być kompletne, zanim edytorzy dostaną dostęp.

**Gdzie i jak**
- Treści: klony `C:\Users\Szymek\source\tresci\<Repozytorium>`, gałąź `wyglad/zlecenie-16`.
- Kod: Web-Core, ta sama gałąź, plus jeden commit na `main` (etap 5). **Nazwy gałęzi nie zmieniaj:** Web-Podglad szuka treści na gałęzi o tej samej nazwie co gałąź kodu.
- **Bramki:** etapy 0–7 lokalnie, bez pushowania. Po słowie „push”: etap 8. Etap 9 wymaga właściciela. Po słowie „przełącz”: etap 10. Etap 11 to tylko dokument.
- Do końca etapu 7 nie uruchamiaj `skrypty/pobierz_tresci.py` bez `--lokalnie`.
- Bez zmian w wyglądzie strony. Osobny commit na etap w każdym repozytorium.
- Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-22.md`.
- Załączniki: `22-zalaczniki\sprawdz_pola_cms.py`, `22-zalaczniki\22-pliki-testowe.txt`.
- Liczby w tym zleceniu policzono na stanie z GitHuba: Web-Core `68fa6265`, treści do 6.11, 11:37. Jeśli numer 22 jest zajęty, użyj kolejnego i napisz to w raporcie.

## Etap 0. Stan wyjściowy
1. W Web-Core i w klonach treści: `git fetch`, `git status`. Gałąź ma być czysta i równa `origin/wyglad/zlecenie-16`. Lokalne commity wypisz w raporcie i nie gub ich.
2. Porównaj `src/` i `public/` każdego klonu z lokalną nakładką w Web-Core. Każdą różnicę wpisz do raportu. Nowszą treść z nakładki przenieś do klonu osobnym commitem. Niczego nie nadpisuj bez wpisu.
3. Przeczytaj `.przekazanie\pola-do-cms.md`. Pole opisane tam, którego nie ma w formularzu ani w etapie 1, dopisz i zgłoś w raporcie.

## Etap 1. Brakujące pola w `.pages.yml`
Pola dopisz w miejscach pasujących do układu formularza: pole polskie przy polskich, `_en` przy angielskich. Etykiety poniżej to wzór.

```yaml
- name: haslo
  label: Hasło na banerze (jedna linia; liczby w banerze pokażą się tylko razem z hasłem)
  type: string
- name: haslo_en
  label: 'EN: hasło na banerze'
  type: string
```

```yaml
- name: liczby
  label: Liczby pod hasłem na banerze (tylko gdy nie da się ich policzyć z danych)
  type: object
  list: true
  fields:
  - name: n
    label: Liczba (np. 8 albo 3 lata)
    type: string
    required: true
  - name: n_en
    label: 'EN: liczba (puste = jak po polsku)'
    type: string
  - name: etykieta
    label: Podpis
    type: string
    required: true
  - name: etykieta_en
    label: 'EN: podpis'
    type: string
```

| Repozytorium | Formularz (`name`) | Co dopisać |
|---|---|---|
| Web-Instytut | `zaklady`, `wladze` | `haslo`, `haslo_en` |
| Web-Instytut | `strony` | `haslo`, `haslo_en`, `liczby` |
| Web-Nauka | `strony` | `haslo`, `haslo_en`, `liczby` |
| Web-Studia | `strony` | `haslo`, `haslo_en`, `liczby` |
| Web-Studia | `kierunki` | `haslo`, `haslo_en`; w `fakty`: `etykieta_krotka`, `etykieta_krotka_en` (krótszy podpis do liczb w banerze na telefonie); w `dlaczego.ikona`: wartość `pinezka` na liście (używa jej `szkola-doktorska.md`, a ikona jest w `Ikona.astro`) |
| Web-Studia | `rok-akademicki` | `haslo`, `haslo_en` |
| Web-Studia | `spec-matematyka-w-ekonomii` | `haslo`, `haslo_en`; w `opiekunowie`: `rola_en` |
| Web-Spec-* (5) | `specjalnosc` | `haslo`, `haslo_en`; w `opiekunowie`: `rola_en` |
| Web-Sem-* (9) | `seminarium` | `haslo`, `haslo_en`. Etykieta: „Hasło (podtytuł na liście seminariów)”, bo strona seminarium go nie pokazuje |
| Web-Ustawienia | `ustawienia` | `haslo`, `haslo_en` (strona główna); `szukaj_haslo`, `szukaj_haslo_en`; `wydarzenia_dni_telefon` (`type: number`, przy `wydarzenia_dni_robocze`, etykieta „Nadchodzące wydarzenia na telefonie: ile dni naprzód”) |
| Web-Ustawienia | `dzial-instytut` | `haslo`, `pracownicy_haslo`, `struktura_haslo`, `warto_wiedziec_haslo`, każde z `_en` |
| Web-Ustawienia | `dzial-nauka` | `haslo`, `granty_haslo`, `konferencje_haslo`, `obrona_haslo`, `obrony_haslo`, `publikacje_haslo`, `rocznik_haslo`, `seminaria_haslo`, `sukcesy_haslo`, każde z `_en` |
| Web-Ustawienia | `dzial-studia` | `haslo`, `plan_haslo`, każde z `_en` |
| Web-Ustawienia | `deklaracja`, `prywatnosc` | `haslo`, `haslo_en` |

Etykiety pól `*_haslo` mają mówić, której strony dotyczą, np. „Hasło na banerze: Projekty i granty”.

Web-Popularyzacja, Web-Aktualnosci i Web-Pracownicy nie potrzebują nowych pól.

## Etap 2. Pola techniczne i pola bez działania
`hidden: true` chowa pole przed edytorem, a jego wartość ma przetrwać zapis (sprawdzisz to w etapie 9). **Zasada: danych nie kasujemy, tylko chowamy.** Przed ukryciem potwierdź wyszukiwaniem w `src/`, że pole nie zmienia nowego wyglądu. Jeśli zmienia, zostaw je widoczne i napisz o tym w raporcie.

| Repozytorium / formularz | Co zrobić |
|---|---|
| Web-Nauka / `publikacje` | Dodać jako ukryte: `zrodla`, `do_uzupelnienia` (listy tekstów) |
| Web-Nauka / `publikacje-wykazy` | Dodać jako ukryte: `pochodzenie` (tekst), `zrodla` (lista tekstów) |
| Web-Ustawienia / `ustawienia` | Ukryć: `tlo_strony`, `sekcje`, cały `naglowki_podstron`, `facebook`, `youtube`, `partnerzy`, `przyciski`, w `baner`: `zdjecie_male`, `podpis`, `podpis_en`, `kadr`. Dodać jako ukryte w `baner`: `zdjecie_telefon`, `podpis_telefon`, `podpis_telefon_en` |
| Web-Ustawienia / `dzial-studia` | Ukryć: `sekretariat_zakres`, `sekretariat_zakres_en` |
| Web-Ustawienia / `stopka` | Usunąć cały formularz „Stopka”. Plik `src/data/stopka.json` zostaje. Nowa stopka go nie czyta |
| Web-Studia / `kierunki` | Nie ukrywać `przyciski`. W etykiecie dopisać, że wyświetlają się tylko przy Szkole doktorskiej |

## Etap 3. Web-Pracownicy
To jedyne repozytorium bez gałęzi. Załóż `wyglad/zlecenie-16` od `origin/main`. Bez innych zmian.

## Etap 4. Dane testowe
Usuń na gałęzi dokładnie 53 pliki z `22-zalaczniki\22-pliki-testowe.txt`: 22 wpisy i 31 załączników z Web-Aktualnosci, Web-Instytut i pięciu seminariów. Usuń je także z lokalnej nakładki.

**Uwaga:** 81 plików `test-*.pdf` w `Web-Studia/public/pliki/studia/egzaminy/` to prawdziwe zadania egzaminacyjne. **Zostają.** Nie usuwaj niczego po samym wzorcu nazwy.

## Etap 5. `skrypty/pobierz_tresci.py` pobiera `main`
Dziś skrypt bierze gałąź domyślną w dwóch miejscach: `git clone` bez gałęzi oraz `fetch origin HEAD`. Po etapie 10 obecna strona budowałaby się więc z gałęzi roboczej.

Dodaj opcję `--galaz` (domyślnie `main`) i zmień `pobierz()` (sprawdzone w chmurze dla: `main`, `--galaz`, ponownego pobrania, repozytorium bez gałęzi, pustego repozytorium):

```python
GALAZ = sys.argv[sys.argv.index('--galaz') + 1] if '--galaz' in sys.argv else 'main'


def pobierz(repo):
    if lokalnie:
        return repo, os.path.join(lokalnie, repo), 'lokalnie'
    cel = os.path.join(CACHE, repo)
    url = f'https://github.com/{ORG}/{repo}.git'
    try:
        if not git('ls-remote', '--heads', url):
            return repo, None, 'puste'
        galaz = GALAZ
        if galaz != 'main' and not git('ls-remote', '--heads', url, galaz):
            print(f'  {repo}: brak gałęzi {galaz}, biorę main')
            galaz = 'main'
        if os.path.isdir(os.path.join(cel, '.git')):
            git('fetch', '-q', '--depth', '1', 'origin', galaz, cwd=cel)
            git('reset', '-q', '--hard', 'FETCH_HEAD', cwd=cel)
        else:
            shutil.rmtree(cel, ignore_errors=True)
            git('clone', '-q', '--depth', '1', '--branch', galaz, url, cel)
        return repo, cel, git('rev-parse', '--short', 'HEAD', cwd=cel)
    except subprocess.CalledProcessError as e:
        raise SystemExit(f'Nie udało się pobrać {url}:\n{e.stderr}')
```

Pusty klon ma nadal dawać „puste repozytorium — pomijam”. Popraw opis na górze skryptu. W README dopisz, że lokalnie, na czas pracy na gałęzi, skrypt uruchamia się z `--galaz wyglad/zlecenie-16`, bo bez tej opcji nadpisze nakładkę treściami z `main`.

Commit na `wyglad/zlecenie-16` i ten sam commit na lokalnym `main` Web-Core (użyj osobnego worktree, żeby nie ruszać nakładki ani serwerów dev). Żadnych innych zmian na `main`. Web-Podglad używa `--lokalnie`, więc go to nie dotyczy.

## Etap 6. Skrypt kontrolny
Skopiuj `22-zalaczniki\sprawdz_pola_cms.py` do `skrypty\` (commit na `wyglad/zlecenie-16`). Zgłasza pliki bez formularza, pola spoza formularza i wartości, których formularz nie przyjmie. Pomija `opublikowany` (celowo bez pola) i `stopka.json`.

```
python skrypty\sprawdz_pola_cms.py C:\Users\Szymek\source\tresci
```

Dziś daje 211 problemów w 590 plikach. Po etapach 1–4 ma dać 0 problemów, przy 567 plikach, jeśli etap 0 nie dodał plików.

## Etap 7. Odbiór lokalny
- `sprawdz_pola_cms.py`: 0 problemów, kod wyjścia 0.
- `skrypty/sprawdz_tresci.py`: OK.
- Zbudowanie strony z treściami z klonów, w osobnym worktree, żeby nie psuć serwerów dev: udane. W chmurze ten stan dał 739 stron HTML. Nigdzie nie ma „Mister Test”, „Testowe:”, „Uniwersytet Test” ani „Test University”.
- `astro check`: 6 błędów, żaden nowy.
- Względem `origin/wyglad/zlecenie-16` w klonach zmienia się tylko `.pages.yml` i usuwane pliki z listy (plus ewentualne commity z etapu 0).
- **Stop.** Raport i czekanie na „push”.

## Etap 8. Po słowie „push”
1. Wypchnij `wyglad/zlecenie-16` we wszystkich 21 repozytoriach treści i w Web-Core.
2. Wypchnij na `main` Web-Core commit z etapu 5 (najpierw `git pull --rebase`, bo plan zajęć codziennie dodaje tam commit).
3. Sprawdź:
   - publikacja obecnej strony przeszła;
   - `https://im-uwr.github.io/Web-Core/o-stronie/` dalej daje 404, co potwierdza treści z `main`;
   - przebieg Web-Podglad przeszedł, a na podglądzie są hasła i nie ma danych testowych.

## Etap 9. Test w prawdziwym CMS (właściciel i Ty)
Nikt jeszcze nie sprawdził tych formularzy w samym Pages CMS.

1. Załóż i wypchnij gałąź `test-cms` od `wyglad/zlecenie-16` w sześciu repozytoriach z tabeli.
2. Właściciel otwiera `https://app.pagescms.org/IM-UWr/<Repozytorium>/test-cms`, w każdym wpisie zmienia jedno słowo i zapisuje.

| Repozytorium | Wpis | Co sprawdza |
|---|---|---|
| Web-Studia | Kierunek Matematyka; strona „Skrypty” | `etykieta_krotka`, `liczby`, `pinezka` (przy Szkole doktorskiej) |
| Web-Popularyzacja | Strona „Dla uczniów” | bloki: czy listy z kilkoma akapitami przetrwają |
| Web-Ustawienia | „Strona główna i kontakt”; „Menu główne” | pola ukryte, `opis` w menu |
| Web-Nauka | Jeden wykaz publikacji | ukryte `pochodzenie`, `zrodla` |
| Web-Spec-Aktuarialno-Finansowa | Specjalność | `rola_en` |
| Web-Sem-Topologia | Seminarium | `haslo` |

3. Porównaj `wyglad/zlecenie-16` z `origin/test-cms` w każdym repozytorium i wpisz wynik do raportu. Dopuszczalne: zmienione słowo, formatowanie pliku, zniknięcie `opublikowany`. Niedopuszczalne: utrata jakiegokolwiek innego pola, w tym ukrytego, albo rozsypanie treści.
4. Jeśli pola ukryte znikają: nie przełączaj niczego, opisz wynik i zaproponuj rozwiązanie.
5. Po pozytywnym wyniku usuń `test-cms`. **Stop**, czekanie na „przełącz”.

## Etap 10. Po słowie „przełącz”
Warunek: etapy 8 i 9 zakończone pomyślnie.

Ustaw `wyglad/zlecenie-16` jako gałąź domyślną we wszystkich 21 repozytoriach treści (nie w Web-Core):

```bash
gh api -X PATCH "repos/IM-UWr/<Repozytorium>" -f default_branch=wyglad/zlecenie-16 --jq '.full_name + " " + .default_branch'
```

Jeśli nie masz uprawnień, przekaż właścicielowi listę do zrobienia w Settings → Branches.

Sprawdź:
- `https://app.pagescms.org/IM-UWr/Web-Instytut` otwiera `wyglad/zlecenie-16` (właściciel, po zalogowaniu);
- po następnej publikacji `/o-stronie/` na obecnej stronie dalej daje 404;
- następny przebieg Web-Podglad przechodzi.

Dopisz do `.przekazanie\zlecenia\zasady.md`: gałąź treści jest teraz wspólna z edytorami, więc przed każdą zmianą treści `git pull --rebase` w klonie; nakładkę odświeża `python skrypty/pobierz_tresci.py --galaz wyglad/zlecenie-16`; do czasu startu nikt nie zapisuje na `main` repozytoriów treści.

## Etap 11. Dokument startu (tylko napisać, nie wykonywać)
Utwórz `dok/start-strony.md` z tą procedurą:
1. Poprosić edytorów o przerwę, bo zapis po kroku 2 by przepadł.
2. W każdym repozytorium treści przenieść gałąź na `main` (fast-forward): `git push origin origin/wyglad/zlecenie-16:main`. Dziś `main` nie ma własnych commitów w żadnym z 20 repozytoriów z gałęzią. Jeśli gdzieś się pojawią, scalić i przejrzeć ręcznie.
3. Scalić kod Web-Core do `main`. Treści idą przed kodem, bo sprawdzono, że stary kod buduje się z nowymi treściami. Odwrotnej kolejności nie sprawdzano.
4. Przywrócić `main` jako gałąź domyślną w 21 repozytoriach.
5. Sprawdzić link `https://app.pagescms.org/IM-UWr/Web-Instytut` i stronę.
6. Usunąć `wyglad/zlecenie-16` w repozytoriach treści. Gałęzi domyślnej GitHub nie pozwala usunąć, stąd ta kolejność. Zakładka edytora z nazwą gałęzi pokaże „Branch not found” z przyciskiem „Open default branch”.

## Kryteria odbioru
- [ ] Skrypt kontrolny: 0 problemów na 21 repozytoriach.
- [ ] Każde pole z etapu 1 jest w formularzu, widoczne dla edytora; każde z etapu 2 ukryte albo z opisanym powodem pozostawienia.
- [ ] Formularz „Stopka” usunięty, `stopka.json` nietknięty.
- [ ] 53 pliki testowe usunięte, 81 zadań egzaminacyjnych na miejscu.
- [ ] Web-Pracownicy ma gałąź.
- [ ] `pobierz_tresci.py`: bez opcji pobiera `main`, z `--galaz` wskazaną gałąź, puste repozytorium pomija, `--lokalnie` działa jak dotąd.
- [ ] Budowanie udane, `sprawdz_tresci.py` OK, `astro check` bez nowych błędów, wygląd bez zmian.
- [ ] Po etapie 8: obecna strona na treściach z `main` (`/o-stronie/` = 404), podgląd działa.
- [ ] Po etapie 9: w próbnych zapisach nie zniknęło żadne pole poza `opublikowany`.
- [ ] Po etapie 10: link bez gałęzi otwiera gałąź roboczą.
- [ ] `dok/start-strony.md` istnieje, `.przekazanie\pola-do-cms.md` zaktualizowany.

## Raport (`RAPORT-ZLECENIE-22.md`)
Tabela etapów i commitów, wynik każdego kryterium, różnice z etapu 0, pola pozostawione widoczne wbrew etapowi 2 wraz z powodem. Lista linków dla edytorów: po jednym na repozytorium, w postaci `https://app.pagescms.org/IM-UWr/<Repozytorium>`.
