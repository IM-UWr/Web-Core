# Zlecenie 13: płynność strony (W PRZYGOTOWANIU, 5.11.2026)

Stan: **szkic.** Nie wykonywać, dopóki w nagłówku nie będzie „GOTOWE”.
Decyzje właściciela: 5.11, 00:13 i 00:18, „można zrobić wszystko”.
**Kolejność:** po zleceniach 12 i 11, na posprzątany kod.
**Zdjęcia przypięte do szkicu (zlecenie 11, zalecenie 17):** przy `<Picture>` zachować szerokość `--sz` i dopasować `sizes` do niej, a nie do szerokości okna.

## Diagnoza
 na podglądzie z GitHub Pages szkic patrona na banerze czeka niewidoczny (`.z-czeka`), aż załaduje się moduł `src/scripts/zal/szkice.ts`; lokalnie (dev) to natychmiast. Prototyp-artefakt (5 MB, zdjęcia i fonty w środku) jest wolny z natury i nie odzwierciedla strony. 

## Zakres (wszystko)
1. **Pomiar przed i po:** PageSpeed Insights / Lighthouse na podglądzie (komputer i telefon), wyniki w raporcie.
2. **Głowa rysuje się od razu:** start rysowania ze skryptu w linii w banerze (`NaglowekZ.astro`), bez czekania na moduł; moduł tylko zgrywa tempo podpisu.
3. **Font tytułów:** preload woff2 Brygady 1918 (i Manrope), tylko potrzebne podzbiory (latin, latin-ext); font zastępczy z dopasowanymi metrykami (`size-adjust`, `ascent-override`), żeby podmiana kroju nic nie przesuwała.
4. **Następna strona gotowa przed kliknięciem:** `speculationrules` już robi prefetch (`Baza.astro`); dodać `prerender` przy najechaniu (eagerness `moderate`). Uwaga: rysowanie szkicu i flaga wizyty w `sessionStorage` mają ruszać dopiero po pokazaniu strony (`document.prerendering` / zdarzenie `prerenderingchange`), nie w czasie składania w tle.
5. **Nic nie skacze (CLS ≈ 0):** wymiary / `aspect-ratio` dla wszystkich zdjęć i rysunków, miejsce zarezerwowane dla elementów wczytywanych później.
6. **Zdjęcia:** `astro:assets` (`<Picture>`, AVIF/WebP, `srcset`, mniejsze na telefonie), `fetchpriority="high"` tylko dla okładki/banera, `loading="lazy"` poniżej pierwszego ekranu; **wyostrzanie zamiast wskakiwania:** malutka rozmyta wersja zdjęcia w linii (ok. 1 KB) pod pełnym zdjęciem, które łagodnie na nią wchodzi; do tego czasu baner ma kolor działu. Robić razem z podmianą zdjęć (punkt 3 kolejki), mechanizm można ustawić od razu.
7. **Natychmiastowy „wstecz”:** sprawdzić, że strony trafiają do pamięci wstecz/naprzód przeglądarki (bfcache; brak `unload`, nic nie blokuje; test w Chrome DevTools → Application → Back/forward cache).
8. **Animacje tylko z `transform` i `opacity`:** przejrzeć wszystkie przejścia; rozmyty pasek (`backdrop-filter`) sprawdzić na słabszym sprzęcie (spowolnienie CPU w DevTools) i w razie zacinania dać słabsze rozmycie.
9. **Jeden rytm:** ta sama krzywa (`cubic-bezier(.22, .8, .2, 1)`) i czasy 0,15–0,35 s we wszystkich przejściach i rozwinięciach; elementy wspólne (pasek, nagłówek) stoją.
10. **Natychmiastowa reakcja:** stany `:hover`, `:active` i `:focus-visible` na wszystkich linkach i przyciskach, zmiana wyglądu od razu po naciśnięciu (także dotyk na telefonie).

## Nie robić
- pamięci offline (service worker) — komplikuje publikację i grozi nieaktualnymi treściami.

## Kryteria odbioru
- pomiar przed/po, zrzuty bez zmian w wyglądzie, szkic rysuje się od pierwszej klatki na podglądzie z GitHub Pages, przejścia bez przycięć przy 4× spowolnieniu CPU.
