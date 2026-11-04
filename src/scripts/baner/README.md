# Silnik animacji banerów — nieużywany od 4–5.11.2026

## Do czego służył
Animacje w tle banerów podstron **na telefonie** (≤ 760 px) w dotychczasowym wyglądzie (zlecenia 02–05, 31.10–1.11.2026):
każda podstrona miała „swój” rysunek matematyczny, który powoli się rysował za tytułem (atraktor Lorenza w Nauce,
dendryt w Instytucie, sumy Riemanna w Studiach, fala Fouriera w Aktualnościach, histogram na seminarium ze statystyki,
genealogia przy obronach itd.). Na komputerze silnik nic nie robił — zostawał statyczny rysunek działu `.ph-m`.

- `silnik.ts` — mierzy baner i tekst w nim, liczy pole rysunku i maskę „obrys linii” (rysunek nie wchodzi pod tekst),
  ładuje kod jednego motywu (dynamiczny import), prowadzi pętlę (setTimeout, pauza poza ekranem i w karcie w tle),
  przy `prefers-reduced-motion` rysuje od razu gotowy, nieruchomy obraz;
- `typy.ts`, `wspolne.ts` — typy i pomocniki motywów;
- `motywy/*.ts` — 36 motywów (`_analiza.ts` to wspólne narzędzia, nie motyw); nazwa pliku = nazwa motywu;
- `baner.css` — style, którymi obsługiwał go stary baner (`.ph-m`, `.ph-fala`, `.ph-anim`, `.ph-anim-gra`, `--ph-rysunek`,
  pole rysunku na telefonie), przeniesione bez zmian z `src/styles/tlo.css` i `src/styles/telefon.css`; **niepodpięte**.

Mapa „strona → motyw”: `src/lib/motywyBanerow.ts` (`MOTYWY_STRON`, `motywStrony(ścieżka)`), np. `nauka` → `lorenz`,
`seminaria/statystyka` → `histogram`, `nauka/granty/*` → `wachlarz/grant`. Dane z budowy strony dla niektórych motywów
(pary współautorów rocznika, zakłady, pracownicy, zespół grantu) liczą dalej funkcje w `src/lib/widoki/`
(`publikacjeRok.ts`, `publikacje.ts`, `listaZakladow.ts`, `pracownicy.ts`, `grant.ts`) — widoki przekazują je jako
`motywDane` do `NaglowekStrony.astro`, który je dziś pomija.

## Od kiedy jest nieużywany
Od zlecenia 12 (przebudowa i porządki, gałąź `wyglad/porzadki`, 4–5.11.2026): telefon dostał nowy wygląd „Założyciele”,
stary baner `.ph` zastąpił nagłówek `src/components/zal/NaglowekZ.astro`, a `src/components/NaglowekStrony.astro` przestał
wstawiać skrypt silnika i atrybuty `data-animacja`. Nic w `src/` nie importuje silnika, więc nie trafia do zbudowanej
strony. Decyzja właściciela (4.11, 22:30): kod zostaje w repozytorium („usunąć łatwiej niż przywrócić”).
Animacja szkiców patronów (`src/scripts/zal/szkice.ts`) to osobna rzecz i działa dalej.

## Jak go podpiąć z powrotem
1. **Baner** — element z klasą `ph` (silnik szuka `.ph[data-animacja]`), `position: relative; overflow: hidden;
   isolation: isolate` (silnik wstawia do niego płótna `.ph-anim` z `z-index: -1`) i atrybutami:
   - `data-animacja="<motyw>"` — nazwa pliku z `motywy/` (np. z `motywStrony(stripBase(Astro.url.pathname))`);
     wartość „nazwa/wariant” rozdziel na `data-animacja="nazwa"` i `data-animacja-wariant="wariant"`;
   - opcjonalnie `data-animacja-dane='…JSON…'` — dane motywu (`motywDane` z widoku).
2. **Tekst w banerze**, który silnik mierzy (maska omija go z łagodnym przejściem ok. 60 px): link „←” (`.wstecz a`
   albo `.wstecz`), nadtytuł `.eyebrow`, tytuł `h1`, hasło `.ph-haslo`. Pole rysunku: od paska menu (`.hdr.hdr-foto`,
   gdy baner jest pierwszym elementem `<main>`) + 6 px do połowy hasła albo ostatniej linii tytułu.
3. **Skrypt** — w banerze: `{motyw && <script>import '../scripts/baner/silnik';</script>}` (Astro dołączy silnik, a kod
   motywu wczyta się dopiero na stronie, która go potrzebuje).
4. **Style** — `import '../scripts/baner/baner.css';` (w komponencie banera). Kolor rysunku: `--ph-rysunek` (składowe RGB),
   linie i akcent statycznego rysunku: `--ph-linie`, `--ph-akcent` na `.ph`.
5. **Szerokość** — silnik działa tylko przy `(max-width: 760px)` (stała `TELEFON` w `silnik.ts`); na komputerze trzeba ją
   zmienić i sprawdzić pole rysunku względem nowego nagłówka (znak patrona i opis po prawej).

Wzór: `src/components/NaglowekStrony.astro` w stanie z `d12c994` (`git show d12c994:src/components/NaglowekStrony.astro`).
