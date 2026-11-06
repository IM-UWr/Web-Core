# Zlecenie 20: uwagi z oglądania, część 4 (OTWARTE, 6.11.2026)

Stan: **otwarte** — właściciel może dopisywać kolejne punkty. Wykonuj tylko punkty oznaczone **GOTOWE** i dopiero po zakończeniu zlecenia 19.

**Gdzie i jak** (tak samo jak w zleceniach 17–19)
- Gałąź `wyglad/zlecenie-16`, po commitach zlecenia 19. Osobny commit na każdy punkt. **Bez pushowania**, także w repozytoriach treści.
- **Nie uruchamiaj `skrypty/pobierz_tresci.py`.**
- Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-20.md`.

## 1. Hamburger na komputerze: większe pismo, rzędy na całą wysokość, nazwy grup bez koloru — GOTOWE (decyzja 6.11, 10:24)
Właściciel: „powiększ trochę czcionki w hamburgerze, są zbyt malutkie”, „zwiększ trochę odstępy, żeby optycznie na PC hamburger menu zajmowało na wysokość więcej miejsca”, „przy otwieraniu zakładki możesz zmieniać wysokości, żeby optycznie ładnie to wyglądało zawsze”, „nazwy poddziałów, ludzie, organizacja itd. nie powinny być jednak kolorowe, za dużo kolorów”. Po obejrzeniu podglądu: „wygląda bardzo dobrze, akceptujemy nowy”.

**Wzór:** artefakt https://claude.ai/artifact/8pvfFaFhfijaeFhLJ7LZHA (obecny i nowy panel obok siebie). Źródło: `.przekazanie\prototypy\20-hamburger-podglad.html`, blok `nowe-css`. Poniżej to samo, dopasowane do pliku. Pliki: `src/styles/zal-menu.css`, `src/components/zal/PanelMenu.astro`, `src/scripts/zal/menu.ts`.

**Co się zmienia**
- Pismo, sygnet i szerokość panelu rosną z wysokością okna (nie z szerokością): przy 640 px jak dziś, pełny rozmiar od 800 px. Na wąskim telefonie bez zmian.

| Element | Okno 640 px i niżej (jak dziś) | 730 px | 800 px i wyżej |
|---|---|---|---|
| Nazwa działu | 23 px | ok. 27 px | 30 px |
| Link | 14,5 px | ok. 16,2 px | 17,5 px |
| Nazwa grupy | 12,5 px | ok. 13,6 px | 14,5 px |
| Sygnet (szer.) | 40 px | ok. 48 px | 54 px |
| Szerokość panelu | 640 px | ok. 685 px | 720 px |

- Rzędy (działy, Aktualności, Rekrutacja) dzielą między siebie całą wolną wysokość panelu. Rozwinięcie działu samo ściska pozostałe, a zwinięcie je rozsuwa, płynnie.
- Górne granice wysokości rzędów: przy bardzo wysokim oknie (np. 2560×1440) odstępy przestają rosnąć i na dole panelu zostaje pusto. To zamierzone.
- Nazwy grup („Ludzie”, „Organizacja”, „Kierunki”…) bez koloru działu, **także na telefonie**. Kolor działu zostaje na sygnecie, kresce pod nazwą i bieżącej stronie.

**1. Nazwy grup bez koloru.** W istniejących regułach zmień tylko kolor:
```css
.z-menu .z-menu-grupa h3 { /* … */ color: rgb(255 255 255 / .58); }
.z-menu-jasny .z-menu-grupa h3 { color: var(--muted); }
```
Bieżąca strona zostaje bez zmian (`--d-j` na granacie, `--d-a` w jasnym panelu), ale jej kolor nie jest już „kolorem nagłówka grupy”: popraw komentarze w `zal-menu.css` i w nagłówku pliku.

**2. HTML.** W `PanelMenu.astro` grupy dostają dodatkowy element, przez który płynnie zmienia się wysokość:
```astro
<div class="z-menu-grupy" id={`${id}-${d.dz}`}>
  <div class="z-menu-grupy-w">
    {d.grupy.map((g) => ( … ))}
  </div>
</div>
```

**3. CSS.** W `zal-menu.css`, przed blokiem „niskie okna”, nowy blok. Reguły zwijane mają warunek `.zwijane`, żeby bez JS (grupy widoczne) nic nie było ucięte:
```css
@media (min-width: 761px) {
  /* wielkości rosną z wysokością okna: przy 640 px jak dotąd, pełne przy 800 px i wyżej */
  .z-menu {
    --mw: clamp(0px, calc(100vh - 640px), 160px);
    --m-h2: calc(23px + var(--mw) / 23);    /* nazwa działu: 23 → 30 */
    --m-l: calc(14.5px + var(--mw) / 53);   /* link: 14,5 → 17,5 */
    --m-g: calc(12.5px + var(--mw) / 80);   /* nazwa grupy: 12,5 → 14,5 */
    --m-s: calc(40px + var(--mw) / 11.5);   /* sygnet: 40 → 54 */
    width: min(calc(640px + var(--mw) / 2), calc(100vw - 64px)); /* 640 → 720 */
    display: flex; flex-direction: column;
  }
  .z-menu-szukaj { flex: none; margin-bottom: calc(8px + var(--mw) / 15); padding: calc(8px + var(--mw) / 53) 13px; }
  .z-menu-szukaj input { font-size: calc(15px + var(--mw) / 106); }

  /* rzędy dzielą między siebie wolną wysokość panelu; rozwinięcie działu samo ściska pozostałe */
  .z-menu section { flex: 1 0 auto; }
  .z-menu.zwijane section { max-height: calc(var(--m-s) * 1.2 + 90px); }
  .z-menu.zwijane section.rozwiniety { max-height: calc(var(--m-s) * 1.2 + 360px); }
  .z-menu section[data-dzial] { grid-template-columns: var(--m-s) minmax(0, 1fr); grid-template-rows: auto auto; column-gap: calc(14px + var(--mw) / 53); align-content: center; }
  .z-menu section.duza { flex-grow: .72; display: flex; flex-direction: column; justify-content: center; padding-left: calc(var(--m-s) + 14px + var(--mw) / 53); }
  .z-menu.zwijane section.duza { max-height: calc(var(--m-h2) + 76px); }
  .z-menu .z-menu-sygnet { grid-row: 1; width: var(--m-s); height: calc(var(--m-s) * 1.2); }
  /* rozwinięty: sygnet nie rozpycha rzędu, grupy stoją tuż pod nazwą działu */
  .z-menu section.rozwiniety .z-menu-sygnet { grid-row: 1 / span 2; margin-bottom: calc(var(--m-s) * -1.2); }
  .z-menu h2 { font-size: var(--m-h2); }
  .z-menu h2 a::after { width: calc(28px + var(--mw) / 32); margin-top: calc(4px + var(--mw) / 53); }
  .z-menu section.duza h2 { font-size: calc(var(--m-h2) + 1px); }
  .z-menu section.duza h2 a.zew::after { font-size: .72em; }
  .z-menu-rozwin { width: calc(30px + var(--mw) / 30); height: calc(30px + var(--mw) / 30); }
  .z-menu-rozwin svg { width: calc(18px + var(--mw) / 53); height: calc(18px + var(--mw) / 53); }

  .z-menu .z-menu-grupa h3 { font-size: var(--m-g); }
  .z-menu .z-menu-grupa + .z-menu-grupa { margin-top: calc(5px + var(--mw) / 21); }
  .z-menu ul { font-size: var(--m-l); gap: 2px calc(16px + var(--mw) / 53); }

  /* rozwijanie płynne: wysokość grup przechodzi przez 0fr → 1fr */
  .z-menu.zwijane section[data-dzial]:not(.rozwiniety) .z-menu-grupy { display: grid; grid-template-rows: 0fr; visibility: hidden; transition: grid-template-rows .32s var(--rytm), visibility 0s linear .32s; }
  .z-menu.zwijane section[data-dzial].rozwiniety .z-menu-grupy { display: grid; grid-template-rows: 1fr; visibility: visible; padding-top: 0; transition: grid-template-rows .32s var(--rytm), visibility 0s; }
  .z-menu.zwijane .z-menu-grupy-w { min-height: 0; overflow: hidden; }
  .z-menu.zwijane .z-menu-grupy-w::before { content: ''; display: block; height: calc(4px + var(--mw) / 26); }
}
```
- Usuń z bloku komputera to, co ta sekcja zastępuje (szerokość panelu, `padding` pola szukania), zamiast zostawiać dwie wartości.
- Blok „niskie okna” (`max-height: 660px`) zostaje za nowym blokiem, bez zmian.
- `prefers-reduced-motion`: dopisz do istniejącej reguły `.z-menu.zwijane section[data-dzial] .z-menu-grupy { transition: none; }`.
- W podglądzie reguły wysokości nie miały warunku `.zwijane`, bo `.zwijane` było tam zawsze. Tu warunek jest celowo.

**4. Skrypt.** W `stanPoczatkowy` (`menu.ts`) dział rozwija się przed wysunięciem panelu, a skrypt od razu mierzy bieżący link, żeby przewinąć do niego panel. Z animacją pomiar trafiłby w grupy jeszcze zwinięte. Dlatego ten pierwszy stan ma się ustawić **bez animacji** (np. klasa na panelu wyłączająca `transition` na czas `stanPoczatkowy`, zdjęta w następnej klatce). Animacja działa tylko przy kliknięciu strzałki.

**Telefon (≤ 760 px):** poza kolorem nazw grup bez zmian. Dodatkowy element `.z-menu-grupy-w` nie może zmienić układu.

**Odbiór**
- `astro check` bez nowych błędów, `npm run build` przechodzi.
- Panel **bez przewijania** z każdym rozwiniętym działem i z żadnym przy 1366×640, 1536×730, 1920×950 i 2560×1305, na stronie działu, na podstronie i na okładce, PL i EN. Podaj w raporcie zmierzone wysokości. Pomiar z podglądu (PL, strona działu) dał brak przewijania przy 1366×633, 1536×729, 1920×945 i 2560×1305. Jeśli EN Studia nie mieszczą się bez przewijania przy jakimś rozmiarze, nie zmieniaj wartości sam: zgłoś to w raporcie.
- Przy 1920×950 i zwiniętych działach rzędy wypełniają całą wysokość panelu; po rozwinięciu działu pozostałe rzędy ściskają się płynnie, bez skoku.
- Bieżący dział rozwinięty od razu po otwarciu panelu, bez animacji; bieżąca strona widoczna i oznaczona (jak w zleceniu 18, punkt 6).
- Klawiatura: Tab nie wchodzi w linki zwiniętego działu (`visibility: hidden`), Enter i Spacja na strzałce działają, Esc zamyka.
- Bez JS grupy widoczne i nic nie jest ucięte; panel przewija się, jeśli się nie mieści.
- Kontrast nazw grup co najmniej 4,5:1 na granacie i w jasnym panelu, w obu motywach.
- Telefon 390×780: układ jak dotąd, nazwy grup bez koloru.
- Zrzuty: rozwinięte Studia i zwinięte działy przy 1366×640, 1536×730 i 1920×950, granatowy i jasny panel; telefon 390 px; po jednym w ciemnym motywie → `raport-zrzuty/z20-menu-*`.

## 2. Strona działu na komputerze: pas z kafelkami i pole ze stronami — GOTOWE (decyzja 6.11, 10:58)
Właściciel wybrał to na podglądzie: „Tak, zajebiste!”. Decyzje z tej rozmowy: pas pod banerem, na całą szerokość, działy rozdzielone cienką kreską, kafelek z krótkim opisem i liczbą stron, domyślnie wszystko zwinięte. Po naciśnięciu strzałka, lekki odstęp i pole **na szerokość tekstu, nie strony**, wyższe, pod każdą stroną krótki opis. Kolor rozwiniętego działu ten sam co po najechaniu, bez pełnego koloru. Rekrutacja lekko wyróżniona, pusta. Pas nie trzyma się paska menu przy przewijaniu.

Ten punkt **zmienia zapis „Komputer bez zmian” z punktu 16 zlecenia 18**. Telefon zostaje bez zmian.

**Wzór:** artefakt https://claude.ai/artifact/KN1U3BrE7qxMACVCXCkm7n (5. wersja; przełączniki działu, monitora i motywu). Źródło: `.przekazanie\prototypy\20-pas-dzialu-podglad.html`, blok `kaf-css`. Klasy w podglądzie są inne niż niżej, ale wartości te same. Pliki: `src/components/zal/TrescDzialu.astro`, `src/styles/zal-dzialy.css`, `src/lib/menu.ts`, `src/content.config.ts`, nakładka `src/data/nawigacja.json` i `src/content/kierunki/*.md`.

**Bez JS** na komputerze wszystko jak dziś: wiersze grup i przycisk Rekrutacja. Nowy układ tylko pod `html.js` i od 761 px.

### Dane: opisy grup i stron
- Treści to łatki, jak w zleceniu 15: oryginał pliku nakładki kopiuj do `.przekazanie\robocze\nakladka-przed-20\`, zmieniaj nakładkę lokalnie, a różnice zapisz w `dok/latki/zlecenie-20/<Repozytorium>.patch`, razem ze zmianami formularza CMS.
- `nawigacja.json`: nowe pola `opis` i `opis_en` przy grupach i linkach. Typy `Grupa` i `Link` w `menu.ts`.
- Kierunki z kolekcji: nowe pola `menu_opis`, `menu_opis_en`. Kierunek ze skrótem w menu i bez `menu_opis` (SIAD, ISIM) dostaje jako opis pełną nazwę (`nazwa`, `nazwa_en`), bez kopiowania tekstu. Wypełnij `menu_opis` przy Matematyce i Szkole doktorskiej.
- Teksty angielskie to propozycje. Oznacz je w raporcie jako do przejrzenia przez właściciela. Pole puste: bez opisu, układ się nie psuje.

| Grupa | `opis` | `opis_en` |
|---|---|---|
| Ludzie | władze i pracownicy | management and staff |
| Organizacja | zakłady i kontakt | departments and contact |
| Więcej | informatyka i biblioteka | IT and library |
| Wydarzenia naukowe | seminaria, konferencje, obrony | seminars, conferences, defences |
| Badania | projekty, publikacje, sukcesy | grants, publications, achievements |
| Stopnie naukowe | doktorat i habilitacja | PhD and habilitation |
| Kierunki | matematyka, SIAD, ISIM, doktorat | mathematics, SIAD, ISIM, PhD |
| Na co dzień | plan, kalendarz, zajęcia, pierwszy rok | timetable, calendar, classes, first year |
| Dyplom i sprawy | egzaminy, dyplom, wnioski, wyjazdy | exams, diploma, requests, exchanges |
| Dla kogo | uczniowie, nauczyciele, wszyscy | pupils, teachers, everyone |
| Partnerzy | fundacja, portal, PTM | foundation, portal, PTM |

| Strona | `opis` | `opis_en` |
|---|---|---|
| Władze | dyrekcja i Rada Instytutu | directors and Institute Council |
| Pracownicy | spis osób, pokoje, kontakt | people, rooms, contact |
| Struktura i zakłady | osiem zakładów i pracownia | eight departments and a unit |
| Kontakt | adres, sekretariat, dojazd | address, office, directions |
| Infrastruktura informatyczna | konta, sieć, drukarki | accounts, network, printers |
| Biblioteka | Biblioteka Matematyczna | Mathematics Library |
| Seminaria | cotygodniowe seminaria zakładów | weekly department seminars |
| Konferencje | organizowane przez Instytut | organised by the Institute |
| Obrony doktorskie | rozprawy i terminy obron | theses and defence dates |
| Projekty i granty | realizowane i zakończone | ongoing and completed |
| Publikacje | wykazy roczne | annual lists |
| Sukcesy | nagrody i wyróżnienia | awards and distinctions |
| Szkoła doktorska (obie pozycje) | Kolegium Doktorskie Matematyki | Doctoral College of Mathematics |
| Rada Dyscypliny Matematyka | doktoraty i habilitacje | PhDs and habilitations |
| Matematyka | I i II stopień, pięć specjalności | BSc and MSc, five specialisations |
| Studia podyplomowe | kwalifikacje do nauczania | teaching qualifications |
| Plan zajęć | przedmioty, terminy, sale | courses, times, rooms |
| Rok akademicki | semestry, sesje, przerwy | semesters, exam sessions, breaks |
| Zajęcia i konsultacje | zapisy i dyżury | enrolment and office hours |
| Pierwszy rok | pierwsze kroki na studiach | first steps at university |
| Egzaminy i dyplom | sesja i egzamin dyplomowy | exam session and final exam |
| Procedura dyplomowania | praca, recenzje, obrona | thesis, reviews, defence |
| Sprawy studenckie | wnioski, stypendia, dziekanat | requests, scholarships, dean’s office |
| Program MOST | semestr na innej polskiej uczelni | a semester at another Polish university |
| Skrypty i materiały | materiały do przedmiotów | course materials |
| Dla uczniów | kółka, obozy i konkursy | clubs, camps and competitions |
| Dla nauczycieli | szkolenia | training |
| Dla wszystkich | wykłady popularnonaukowe | popular science lectures |
| Fundacja Matematyków Wrocławskich | fmw.math.uni.wroc.pl | fmw.math.uni.wroc.pl |
| Wrocławski Portal Matematyczny | matematyka.wroc.pl | matematyka.wroc.pl |
| Wrocławski Oddział PTM | ptm.math.uni.wroc.pl | ptm.math.uni.wroc.pl |

### HTML (`TrescDzialu.astro`)
- `.z-dz-karty`: `style` z `--n` (liczba grup, dla telefonu) i `--nk` (grupy plus 1, gdy jest Rekrutacja).
- Karta:
  ```astro
  <button type="button" class="z-dz-karta" aria-expanded="false" aria-controls={`z-dz-gr-${i}`}>
    <b>{nazwa}</b>
    <svg class="z-dz-szew" viewBox="0 0 12 7" aria-hidden="true"><path d="M1 1l5 5 5-5" /></svg>
    {opis && <em>{opis}</em>}
    <small>{ileStron(g.linki.length)}</small>
  </button>
  ```
- Po kartach drugi egzemplarz Rekrutacji, w `.z-dz-karty`: `<Link class="z-dz-kart-rekr" href={rek.adres}><b>{etykietaRek} {rokRek}</b><span>{en ? 'for applicants' (z „· in Polish” jak dziś) : 'dla kandydatów'}</span></Link>`. Egzemplarz `.z-dz-rekr` zostaje dla wersji bez JS.
- Grupa: `<section class="z-dz-rzad" id=…><div class="z-dz-rzad-w"><h3>…</h3><ul style={`--m:${kolumny}`}>…</ul></div></section>`; `kolumny`: do 5 linków `max(n, 3)`, przy 6 linkach 3, powyżej 4.
- Link: `<Link …><b>{sk ?? e}</b>{opis && <span class="z-dz-l-opis">{opis}</span>}</Link>`.
- Skrypt: bez zmian w działaniu (otwarta jedna grupa, ponowne naciśnięcie zamyka). Popraw komentarz, bo działa też na komputerze, i dodaj Esc: zamyka otwartą grupę, gdy fokus jest w pasie, i oddaje fokus karcie.

### CSS (`zal-dzialy.css`)
Na każdej szerokości, przed blokiem telefonu, także bez JS:
```css
.z-dz-szew, .z-dz-karta em, .z-dz-l-opis, .z-dz-kart-rekr { display: none; }
.z-dz-rzad a b { font-weight: inherit; }
```
Komputer z JS:
```css
@media (min-width: 761px) {
  html.js .z-dz .z-dz-pas { display: block; padding: 0; background: none; }
  html.js .z-dz .z-dz-pas > .z-dz-rekr { display: none; }

  /* pas na całą szerokość, tekst równo z kolumną; komórka wystaje z kolumny o 20 px w lewo */
  html.js .z-dz-karty { --ton: color-mix(in srgb, var(--d-a) 15%, var(--d-t)); --kreska: color-mix(in srgb, var(--d-a) 34%, transparent);
    position: relative; z-index: 1; display: grid; grid-template-columns: repeat(var(--nk), minmax(0, 1fr)); min-height: 98px; padding-inline: calc(var(--marg) - 20px);
    background: var(--d-t); box-shadow: 0 1px 0 var(--kreska); }
  .z-dz-karta { position: relative; isolation: isolate; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "nz sz" "op op" "ile ile"; grid-template-rows: auto 1fr auto; gap: 3px 10px;
    min-width: 0; margin: 0; padding: 13px 20px 12px; border: 0; background: none; color: var(--ink); font-family: var(--f-text); line-height: 1.3; text-align: left; cursor: pointer;
    transition: background-color .3s var(--rytm); }
  .z-dz-karta + .z-dz-karta { box-shadow: inset 1px 0 0 var(--kreska); }
  .z-dz-karta b { grid-area: nz; justify-self: start; font-family: var(--f-display); font-weight: 500; font-size: 22px; line-height: 1.15; }
  .z-dz-szew { display: block; grid-area: sz; margin-top: 8px; width: 12px; height: 7px; fill: none; stroke: currentColor; stroke-width: 1.6; opacity: .65; transition: transform .3s var(--rytm); }
  .z-dz-karta[aria-expanded="true"] .z-dz-szew { transform: rotate(180deg); }
  .z-dz-karta em { display: block; grid-area: op; font-style: normal; font-size: 13.5px; line-height: 1.35; color: var(--muted); }
  .z-dz-karta small { grid-area: ile; margin-top: 5px; font-size: 12.5px; font-weight: 600; color: var(--d-a); }
  /* po najechaniu i po rozwinięciu ten sam kolor; strzałka też */
  .z-dz-karta:hover, .z-dz-karta[aria-expanded="true"] { background-color: var(--ton); }
  .z-dz-karta[aria-expanded="true"] em { color: var(--text); }
  .z-dz-karta[aria-expanded="true"]::after { content: ''; position: absolute; left: 24px; bottom: -7px; width: 14px; height: 14px; background: var(--ton); transform: rotate(45deg); }
  .z-dz-karta:focus-visible { outline: 2px solid var(--d-a); outline-offset: -3px; }

  /* Rekrutacja: pusta, sam obrys; prawa krawędź równo z kolumną */
  html.js .z-dz-kart-rekr { display: grid; align-content: center; gap: 3px; margin: 8px 20px 8px 12px; padding: 13px 8px 12px 14px; background: var(--bg); box-shadow: inset 0 0 0 1.5px var(--d-a); color: var(--d-a); line-height: 1.3; text-decoration: none; transition: background-color .3s var(--rytm); }
  .z-dz-kart-rekr:hover { background-color: color-mix(in srgb, var(--d-a) 7%, var(--bg)); }
  .z-dz-kart-rekr:focus-visible { outline: 2px solid var(--d-a); outline-offset: 2px; }
  .z-dz-kart-rekr b { font-family: var(--f-display); font-weight: 500; font-size: 21px; line-height: 1.15; white-space: nowrap; }
  .z-dz-kart-rekr span { font-family: var(--f-text); font-size: 13.5px; line-height: 1.35; color: var(--muted); }
  .z-dz-kart-rekr.zew::after { content: none; }
  .z-dz-kart-rekr.zew b::after { content: '\00a0↗'; font-family: var(--f-text); font-size: .72em; }

  /* pole ze stronami: 12 px pod pasem, od lewej krawędzi pierwszej komórki do końca kolumny tekstu, bez podziałów */
  html.js .z-dz .z-dz-rzad { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: 0fr; gap: 0; padding: 0; border: 0; transition: grid-template-rows .3s var(--rytm); }
  html.js .z-dz .z-dz-rzad.z-otwarta { grid-template-rows: 1fr; }
  html.js .z-dz .z-dz-rzad h3 { display: none; }
  html.js .z-dz .z-dz-rzad-w { min-height: 0; overflow: hidden; }
  html.js .z-dz .z-dz-rzad ul { display: grid; grid-template-columns: repeat(var(--m), minmax(0, 1fr)); gap: 10px 22px; margin: 12px var(--marg) 0 calc(var(--marg) - 20px); padding: 16px 20px 18px; background: var(--d-t);
    opacity: 0; transform: translateY(-8px); visibility: hidden; transition: opacity .3s linear, transform .3s var(--rytm), visibility 0s linear .3s; }
  html.js .z-dz .z-dz-rzad.z-otwarta ul { opacity: 1; transform: none; visibility: visible; transition: opacity .3s linear, transform .3s var(--rytm), visibility 0s; }
  html.js .z-dz .z-dz-rzad a { display: block; margin: -5px -10px; padding: 5px 10px 6px; font-family: var(--f-text); font-size: 13.5px; line-height: 1.3; }
  html.js .z-dz .z-dz-rzad a b { display: block; font-family: var(--f-display); font-weight: 500; font-size: 19px; line-height: 1.2; white-space: nowrap; color: var(--ink); transition: color var(--t-krotki) var(--rytm); }
  html.js .z-dz .z-dz-l-opis { display: block; margin-top: 2px; font-weight: 400; line-height: 1.35; color: var(--muted); }
  html.js .z-dz .z-dz-rzad a:is(:hover, :focus-visible) { background-color: color-mix(in srgb, var(--d-a) 10%, var(--d-t)); }
  html.js .z-dz .z-dz-rzad a:is(:hover, :focus-visible) b { color: var(--d-a); }
  html.js .z-dz .z-dz-rzad a.zew::after { content: none; }
  html.js .z-dz .z-dz-rzad a.zew b::after { content: '\00a0↗'; font-family: var(--f-text); font-size: .72em; color: var(--muted); }

  @media (prefers-reduced-motion: reduce) {
    .z-dz-karta, .z-dz-szew, .z-dz-kart-rekr, html.js .z-dz .z-dz-rzad, html.js .z-dz .z-dz-rzad ul { transition: none; }
  }
}
```
- Reguły ciemnego motywu (`--d-a`, `--d-t`, `--text`, `--muted`) działają bez osobnych wartości. Istniejąca reguła najechania linku w ciemnym motywie zostaje.
- Popraw komentarze na górze pliku i w `TrescDzialu.astro` („nic się nie rozwija”, „tylko telefon z JS”), opis w `dok/estetyka.md`, jeśli plik jest.

### Odbiór
- `astro check` bez nowych błędów, `npm run build` przechodzi.
- Komputer, cztery działy, PL i EN, przy 1366, 1536, 1920 i 2560 px, jasny i ciemny motyw: na starcie wszystko zwinięte; kliknięcie otwiera grupę, drugie zamyka, otwarta jedna naraz, Esc zamyka.
- PL: pas ma 98 px w każdym dziale, a opis grupy jedną linię (także Kierunki). EN: podaj wysokości; dłuższe nazwy mogą się złamać, ale nic nie może być ucięte ani wystawać poza komórkę.
- Pole: lewa krawędź równo z lewą krawędzią pierwszej komórki, prawa z końcem kolumny tekstu i prawą krawędzią Rekrutacji; tekst pierwszej komórki i pierwszego linku w jednej pionowej linii. Nazwa strony w jednej linii, także „Procedura dyplomowania” przy 1366 px, bez nachodzenia na następną kolumnę; opis może mieć dwie linie.
- Kolor po najechaniu i rozwiniętej karty równe (porównaj `getComputedStyle`).
- Tab nie wchodzi w linki zamkniętej grupy. `aria-expanded` poprawne. Fokus widoczny na karcie, Rekrutacji i linku.
- Przewijanie: pas odjeżdża razem ze stroną, pasek menu działa jak dotąd.
- Bez JS: wiersze i przycisk Rekrutacja jak dziś, bez kart, opisów i strzałek.
- Telefon 390 px: bez żadnej zmiany względem stanu sprzed punktu (karty, kolor `--d-a`, dwie kolumny linków, bez opisów, bez drugiej Rekrutacji). Porównaj zrzutami przed i po.
- Kontrast co najmniej 4,5:1: opis i liczba stron na `--d-t` i `--ton`, opis strony na `--d-t`, Rekrutacja na `--bg`, w obu motywach. Jeśli któryś nie spełnia, podaj wartość i proponowaną poprawkę, a nie zmieniaj koloru sam.
- Zrzuty: zwinięte i każda grupa rozwinięta na Studiach przy 1536 i 1920 px, po jednym rozwiniętym w pozostałych działach, EN Studia, ciemny motyw, bez JS, telefon → `raport-zrzuty/z20-pas-*`.
