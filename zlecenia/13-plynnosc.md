# Zlecenie 13: płynność strony (GOTOWE, 5.11.2026, 11:10)

Stan: **GOTOWE do wykonania — bezpośrednio po zleceniu 11.**
Decyzje właściciela: 5.11, 00:13 i 00:18, „można zrobić wszystko”.

**Gdzie i jak pracować**
- Baza: gałąź `wyglad/zlecenie-11` po zakończeniu zlecenia 11 (z jego ostatnim commitem). Nowa gałąź: `git switch -c wyglad/zlecenie-13` w głównym folderze `C:\Users\Szymek\source\Web-Core`.
- Commit po każdym punkcie. **Bez pushowania**, dopóki właściciel nie napisze „push”. Nie uruchamiaj `skrypty/pobierz_tresci.py`. Dziennik w `.przekazanie\dziennik.md`, raport `RAPORT-ZLECENIE-13.md`.
- **Pomiar lokalnie** (podgląd online buduje inną gałąź): `npm run build`, potem `npm run preview` (port inny niż 4321/4322) i Lighthouse (`npx lighthouse <adres> --preset=desktop` oraz wersja mobilna; to narzędzie, nie zależność projektu — nie dopisuj go do `package.json`). Mierz te same strony przed i po: strona główna, strona działu (Nauka), podstrona (Plan zajęć), Aktualności. Do sprawdzenia „szkic od pierwszej klatki” użyj dławienia sieci w DevTools (Fast 3G) na wersji z `preview`, nie `dev`.
- **Zdjęcia przypięte do szkicu (zlecenie 11, zalecenie 17):** przy `<Picture>` zachować szerokość `--sz` i dopasować `sizes` do niej, a nie do szerokości okna.
- **Przejście okładka ↔ Szybki dostęp (zlecenie 11, zalecenie 20)** i ciekawostki losowane na wizytę (zalecenie 19) muszą działać także przy `prerender` (punkt 4 niżej).

## Diagnoza
 na podglądzie z GitHub Pages szkic patrona na banerze czeka niewidoczny (`.z-czeka`), aż załaduje się moduł `src/scripts/zal/szkice.ts`; lokalnie (dev) to natychmiast. Prototyp-artefakt (5 MB, zdjęcia i fonty w środku) jest wolny z natury i nie odzwierciedla strony. 

## Zakres (wszystko)
1. **Pomiar przed i po:** Lighthouse lokalnie (wyżej), komputer i telefon, wyniki w raporcie. PageSpeed Insights na podglądzie online — później, po pushu (nie w tym zleceniu).
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
- pomiar przed/po (Lighthouse lokalnie, wyniki w raporcie), zrzuty bez zmian w wyglądzie, szkic rysuje się od pierwszej klatki na wersji `preview` przy dławieniu Fast 3G, przejścia bez przycięć przy 4× spowolnieniu CPU.
