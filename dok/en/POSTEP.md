# Wersja angielska — postęp (zlecenie 11, zalecenie 12)

Gałąź `wyglad/en` (z `wyglad/porzadki`, `f315100`). Audyt: `dok/en/RAPORT-EN.md` na gałęzi `kopia/2026-11-01-estetyka-prototypy`
(numery K…, C…, D… poniżej to pozycje z tego raportu). Wyglądu nie zmieniam — tylko teksty.

## Krok 1: problemy w kodzie (sekcja K) — zrobione (5.11, ok. 02:20)
- **K1, K2** — notki o patronach na banerach działów i fakty na okładce `/en/` po angielsku (`src/lib/patroni.ts`;
  tłumaczenie z audytu, do sprawdzenia razem z polskimi tekstami).
- **K3** — `short()` w `src/lib/daty.ts` zależy od języka: `29 Oct 2026` (bez roku `28 Oct`); daty „Published …” we wpisach,
  obronach i zamianach dni, data aktualizacji z USOS w banerze Planu.
- **K4** — obrony: nowe opcjonalne pole `tresc_en` (Markdown); bez niego na `/en` zaproszenie po angielsku złożone z danych
  (kandydat, tytuł rozprawy, termin, miejsce, promotorzy, dostępne dokumenty; po terminie „The public defence … took place …”).
- **K5** — „grant promotorski” → „supervisor grant” w plakietce, w „Funding”, w opisie strony (meta) i na liście projektów
  (`programGrantu()` w `src/lib/widoki/grant.ts`).
- **K6** — tematy prac: nowe opcjonalne pole `tematy_prac[].opis_en`; tytuły prac zostają w oryginale.
- **K7** — referaty: nowe opcjonalne pola `afiliacja_en`, `sala_en`, `tresc_en` (streszczenie); użyte na stronie seminarium,
  w liście seminariów, w Kalendarzu, na stronie zakładu, na drugim ekranie głównej i w danych powiadomień e-mail.
  Tytuł referatu zostaje w oryginale.
- **K8** — terminy i etapy kierunku: nowe opcjonalne pole `formularz_en` (np. „Form C1”); także w przypomnieniach terminów.
- **K9** — sale z USOS: „inna” → „other”, „zd” (zdalnie) → „online” (`src/lib/en/plan.ts`).
- **K10** — drugi ekran głównej: „r. HS” → „room HS”.
- **K11** — „and 4 · All news →” → „4 more · All news →” (wzór z `{n}` w `data-wiecej`).
- **K12** — typy zajęć w Planie: „Exercise class”, „Discussion class” (skrót „disc.”), „Master’s seminar”, „Workshop”
  (skrót „wkshp”), „Teaching practice”, „Exam” (`src/lib/en/plan.ts`; dane z USOS bez zmian).
- **Linki w treściach Markdown na `/en`** — `src/plugins/rehype-base.mjs` (opcja `lang`) dopisuje `/en` do linków
  wewnętrznych w tekstach renderowanych na stronach `/en` (poza plikami, adresami z rozszerzeniem i `/powiadomienia`).
  Sprawdzone: linki na stronach specjalności prowadzą do `/en/…`.
- **RSS** — nowy kanał `/en/rss.xml` (tytuły i zajawki po angielsku, linki do `/en`); strony `/en` wskazują go w `<head>`.
- Nowe pola w schemacie (`src/content.config.ts`) są opcjonalne; puste = na `/en` wartość polska, jak dotąd. Pola trzeba
  jeszcze dodać do konfiguracji Pages CMS (`.pages.yml`) w repozytoriach treści — to część łatek z kroku 3.
- Sprawdzenie: `npm run build` bez błędów, `astro check` — te same 3 błędy co na `wyglad/porzadki` (`process`
  w `astro.config.mjs`), `skrypty/sprawdz_tresci.py` OK.

## Zostało
- Krok 2: mapy tłumaczeń dla danych z USOS (uwagi, nazwy przedmiotów) i wykazów publikacji (`src/lib/en/…`).
- Krok 3: łatki z tłumaczeniami pól `_en` dla repozytoriów Web-* (`dok/en/latki/`), tabela `dok/en/TLUMACZENIA.md`
  (też „Do decyzji”), martwy link w `warto_wiedziec/wyklad-terencea-tao.md`.
