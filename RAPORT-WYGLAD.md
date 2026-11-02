# Raport: nowy wygląd „Założyciele”, wersja na komputer (zlecenie 10, noc 2–3.11.2026)

Gałąź: `wyglad/zalozyciele` (z `kopia/2026-11-01-agent-nauka-podglad`, `ae6d5d96`). Pytania i przyjęte odpowiedzi: `PYTANIA.md`.

## Jak budowałem i sprawdzałem (ważne dla oceny wyników)
- **Treści.** W repozytorium Web-Core nie ma treści (są w Web-*, w `.gitignore`), a dostęp do repozytoriów Web-* w tej sesji został odmówiony. Nie uruchamiałem `skrypty/pobierz_tresci.py`. Buduję na **danych testowych** odtworzonych z prototypu i ze zbudowanej kopii obecnej strony (gałąź `podglad-agent-nauka-podglad`); dane testowe leżą tylko w ścieżkach ignorowanych przez git i nie są w żadnym commicie (`PYTANIA.md`, pytanie 1).
- **Data.** Wiele list zależy od „dziś” (wydarzenia, seminaria tygodnia, stopka). Do porównań data budowania jest zamrożona na 2.11.2026, 10:00 (moduł podpięty przez `NODE_OPTIONS=--import …`, poza repozytorium).
- **Build:** `npx astro build` (bez Pagefind).
- **Gałęzie etapów:** zgodnie z poleceniem w czacie pushuję tylko `wyglad/zalozyciele`; etapy są oznaczone w commitach, a ostatnie commity etapów są niżej.

## Etap 1: krok zero — zrobione
**Commity:** `aa293c48` (Instytut i strony ogólne), `10e8ebf6` (Nauka), `d38f749c` (Studia, Kalendarz, Aktualności) — ostatni commit etapu: `d38f749c` (gałąź etapu można założyć: `git branch wyglad/01-krok-zero d38f749c`).

**Co zrobione.** Przygotowanie danych z górnych części wszystkich 32 widoków `src/views/*.astro` przeniesione do funkcji w `src/lib/widoki/` (jeden plik na widok, np. `daneDzialuInstytut(lang)`, `daneWladz(lang)`, `daneListyGrantow(lang)`, `daneGrantu(grant, lang)`, `danePlanuZajec(lang)`). `src/views/publikacjeDane.ts` przeniesiony do `src/lib/widoki/publikacje.ts` (poprawione importy w `sitemap.xml.ts` i stronach rocznika publikacji). W widokach zostały: importy komponentów, `Astro.props`, jedno wywołanie funkcji danych i drobne pomocniki prezentacyjne (`T`, `href`, `mail`, `tel` itp.). Część HTML, `<style>` i `<script>` każdego widoku jest bajtowo bez zmian. Pracę podzieliłem między trzech podagentów (rozłączne zestawy widoków, osobne kopie robocze).

**Wynik porównania HTML.** `diff -r` całego `dist` (738 stron HTML i wszystkie pozostałe pliki) przed zmianą i po niej, oba buildy w tym samym katalogu i z zamrożoną datą: **brak różnic**. (Uwaga: build tego samego kodu w innym katalogu różni się w 5 plikach — `uid` wysp React w `pracownicy` i jednej aktualności oraz kolejność wierszy `sitemap.xml` — bo Astro bierze do nich ścieżkę katalogu; dlatego oba buildy robiłem w tym samym katalogu.) Na danych testowych, nie na prawdziwych treściach — patrz `PYTANIA.md`, pytanie 1.

### Jak powtórzyć dowód z etapu 1 na prawdziwych treściach (na komputerze z treściami Web-*)
```bash
git worktree add ../wzorzec ae6d5d96          # stan przed etapem 1
git worktree add ../etap1 <ostatni commit etapu 1>
# w obu katalogach: te same treści (skopiować src/content, src/data, public/pliki z bieżącego katalogu) i npm ci
# zamrożona data, żeby „dziś” było takie samo w obu buildach:
echo "const S=Date.UTC(2026,10,2,9);const D=Date;globalThis.Date=class extends D{constructor(...a){a.length?super(...a):super(S)}static now(){return S}}" > /tmp/zamroz.mjs
(cd ../wzorzec && NODE_OPTIONS="--import /tmp/zamroz.mjs" npx astro build)
(cd ../etap1 && NODE_OPTIONS="--import /tmp/zamroz.mjs" npx astro build)
diff -r ../wzorzec/dist ../etap1/dist && echo IDENTYCZNE
```

## Podział `src/scripts/` i skryptów w komponentach
`src/scripts/` zawiera tylko silnik animacji banerów (`src/scripts/baner/`). Pozostałe zachowanie strony siedzi w `<script>` w komponentach i widokach.

**Dekoracje (do wymiany albo usunięcia na komputerze; telefon zostaje bez zmian):**
- `src/scripts/baner/silnik.ts`, `typy.ts`, `wspolne.ts` i 37 motywów w `src/scripts/baner/motywy/` (Lorenz, Fourier, Knaster, kanapka, motyl itd.) — animacje w tle banerów podstron. **Działają tylko na telefonie** (silnik sam się wyłącza powyżej 760 px), więc zostają nietknięte.
- `NaglowekStrony.astro`: skrypt `naPasie` (przezroczysty nagłówek na granatowym pasie) i statyczna fala Fouriera w Aktualnościach — wygląd starego banera.
- `WartoWiedziec.astro`: losowanie kolejności kart (skrypt w linii) — wygląd/układ, nie funkcja.

**Zachowanie (zostaje, nowy wygląd ma z niego korzystać):**
- `Baza.astro`: motyw jasny/ciemny z `localStorage` przed narysowaniem strony, `speculationrules` (wczytywanie z wyprzedzeniem).
- `Naglowek.astro`: przełącznik trybu ciemnego, rozwijanie menu, menu na telefonie, wyszukiwarka w nagłówku.
- `FiltrISzukaj.astro` (podpowiedź w polu szukania), `ListaAktualnosci.astro` (filtry i szukanie), `Kalendarz.astro` (widok, filtr rodzaju, szukanie), `ListaGrantow.astro` (podświetlanie spisu), `SpisTresci.astro` (podświetlanie bieżącej sekcji), `Szukaj.astro` (Pagefind), `Seminarium.astro` (zapis na listę), `Kierunek.astro` (zakładki programów i wybór roku), `PrzelacznikSemestrow.astro` + `wyborSemestru.ts`, `RokAkademicki.astro` i `KafelekKoloryDni.astro` (kolor dnia liczony w przeglądarce), `DzialInstytut.astro` (mapa ładowana po kliknięciu), `powiadomienia.astro`, `Przekierowanie.astro`.
- `StronaGlowna.astro`: „Zobacz więcej” i odliczanie wydarzeń (telefon i komputer).
- Telefon: `WTymDziale.astro` (akordeon), `WierszAktualnosci.astro` (zwijanie plakietek do „+N”).
