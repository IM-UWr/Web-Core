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
