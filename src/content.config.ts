import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Pages CMS zapisuje puste pola jako "" albo null — traktujemy je jak brak wartości.
const empty = (v: unknown) => (v === '' || v === null ? undefined : v);

// Daty trzymamy jako tekst "RRRR-MM-DD" lub "RRRR-MM-DDTGG:MM" w czasie lokalnym (Warszawa),
// żeby nie było przesunięć stref czasowych przy budowaniu na serwerach GitHuba.
const toDateString = (v: unknown) => {
  v = empty(v);
  if (v instanceof Date) {
    const iso = v.toISOString();
    return iso.slice(11, 16) === '00:00' ? iso.slice(0, 10) : iso.slice(0, 16);
  }
  return v;
};
const date = z.preprocess(toDateString, z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/, 'Data w formacie RRRR-MM-DD lub RRRR-MM-DDTGG:MM'));
const optDate = z.preprocess(toDateString, z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/).optional());
const optStr = z.preprocess(empty, z.string().optional());
// Pola CMS typu „reference” zapisują ścieżkę pliku (np. src/content/zaklady/geometria.md) — zamieniamy ją na id wpisu (geometria).
// Dzięki temu nowy zakład / seminarium / kierunek dodany w CMS od razu pojawia się na listach wyboru w innych sekcjach.
const idWpisu = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/^.*\//, '').replace(/\.(md|ya?ml|json)$/i, '') : v);
const optId = z.preprocess((v) => { const x = empty(v); return x == null ? undefined : idWpisu(x); }, z.string().optional());
const idList = z.preprocess((v) => (v == null || v === '' ? [] : (Array.isArray(v) ? v : [v]).map(idWpisu)), z.array(z.string()));
const strList = z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.string()));
const published = z.preprocess((v) => (v == null || v === '' ? true : v), z.boolean());

const plik = z.object({ nazwa: optStr, nazwa_en: optStr, plik: z.string() });
const plikList = z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(plik));

// Baner podstrony na telefonie (zlecenie 01, decyzje 31.10.2026): krótkie bursztynowe hasło zamiast opisu (puste = opis
// jak dotąd albo reguła widoku) i — tylko tam, gdzie liczb nie da się policzyć z danych — stałe liczby pod kreską
// (wartość, np. „8” albo „3 lata”, i etykieta). Komputer bez zmian.
const haslo = { haslo: optStr, haslo_en: optStr };
const liczbyBanera = z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.object({
  n: z.preprocess((v) => (typeof v === 'number' ? String(v) : v), z.string()),
  n_en: optStr,
  etykieta: z.string(),
  etykieta_en: optStr,
})));

const aktualnosci = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/aktualnosci' }),
  schema: z.object({
    tytul: z.string(),
    data: date,
    rodzaj: z.preprocess(empty, z.enum(['ogloszenie', 'wydarzenie', 'sukces', 'kariera']).default('ogloszenie')),
    dla: z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.enum(['studenci', 'doktoranci', 'pracownicy', 'kandydaci']))),
    zajawka: optStr,
    zdjecie: optStr,
    zdjecie_opis: optStr,
    zdjecie_opis_en: optStr,
    galeria: z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.object({ plik: z.string(), podpis: optStr }))),
    album: optStr,
    zalaczniki: plikList,
    wydarzenie_poczatek: optDate,
    wydarzenie_koniec: optDate,
    wydarzenie_miejsce: optStr,
    tytul_en: optStr,
    zajawka_en: optStr,
    tresc_en: optStr,
    zaklad: optId,
    opublikowany: published,
  }),
});

const strony = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/strony' }),
  schema: z.object({
    format_tresci: z.enum(['jawne']).optional(),
    tytul: z.string(),
    opis: optStr,
    tytul_en: optStr,
    opis_en: optStr,
    tresc_en: optStr,
    // prawy pasek: spis „Na tej stronie”, menu działu (podstrony) albo oba
    // puste = domyślnie tylko spis „Na tej stronie” (bez menu działu)
    pasek_boczny: z.preprocess(empty, z.enum(['oba', 'spis', 'menu', 'brak']).optional()),
    // listy Markdown jako bloki wzorca treści: dwie kolumny, kontakty, etapy, linki (src/plugins/rehype-bloki.mjs)
    bloki: z.boolean().optional(),
    ...haslo,
    // strona z listą (zlecenie 30, src/lib/tekstyStron.ts): hasło stron pojedynczych wpisów (rocznik publikacji, obrona)
    haslo_podstron: optStr,
    haslo_podstron_en: optStr,
    liczby: liczbyBanera,
    opublikowany: published,
  }),
});

const pracownicy = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/pracownicy' }),
  schema: z.object({
    imie_nazwisko: z.string(),
    stopien: optStr,
    grupa: z.preprocess(empty, z.enum(['nauczyciel', 'doktorant', 'administracja', 'emeryt']).default('nauczyciel')),
    funkcja: optStr,
    funkcja_en: optStr,
    zaklad: optId,
    rok_studiow: z.preprocess(empty, z.coerce.number().int().optional()),
    email: optStr,
    telefon: optStr,
    pokoj: optStr,
    strona: optStr,
    opublikowany: published,
  }),
});

const seminaria = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/seminaria' }),
  schema: z.object({
    nazwa: z.string(),
    nazwa_en: optStr,
    prowadzacy: strList,
    kontakt: optStr,
    strona: optStr,
    grupa_google: optStr,
    archiwum: optStr,
    // seminarium zakładu (każdy zakład ma jedno); puste = seminarium niezależne
    zaklad: idList,
    aktywne: published,
    do_uzupelnienia: strList,
    tresc_en: optStr,
    ...haslo,
    opublikowany: published,
  }),
});

const referaty = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/referaty' }),
  schema: z.object({
    // seminarium referatu (puste = folder, w którym leży plik)
    seminarium: optId,
    tytul: z.string(),
    prelegent: z.string(),
    afiliacja: optStr,
    // afiliacja, sala i streszczenie (Markdown) po angielsku — opcjonalne; puste = na /en wartość polska (sala: jak dotąd,
    // „605” → „room 605”). Tytuł referatu zostaje w języku oryginału (zlecenie 11, zalecenie 12).
    afiliacja_en: optStr,
    // język referatu: „pl” = na /en po tytule dopisek „(talk in Polish)” (decyzja D10, zlecenie 16); puste = bez dopisku
    jezyk: z.preprocess(empty, z.enum(['pl', 'en']).optional()),
    termin: date,
    sala: optStr,
    sala_en: optStr,
    tresc_en: optStr,
    pliki: plikList,
    opublikowany: published,
  }),
});

const obrony = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/obrony' }),
  schema: z.object({
    kandydat: z.string(),
    tytul_rozprawy: z.string(),
    // treść po angielsku (Markdown, opcjonalnie); pusta = na /en zaproszenie składane z danych obrony (src/lib/widoki/obrona.ts)
    tresc_en: optStr,
    // zdjęcie (opcjonalne) — na karcie na stronie głównej, na liście aktualności i na stronie obrony
    zdjecie: optStr,
    zdjecie_opis: optStr,
    zdjecie_opis_en: optStr,
    promotorzy: strList,
    termin: date,
    miejsce: optStr,
    data_ogloszenia: optDate,
    zawiadomienie: optStr,
    rozprawa: optStr,
    streszczenie_pl: optStr,
    streszczenie_en: optStr,
    recenzje: z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.object({ recenzent: z.string(), plik: z.string() }))),
    bip: optStr,
    zaklad: optId,
    w_aktualnosciach: published,
    opublikowany: published,
  }),
});

const rok = z.preprocess(empty, z.coerce.number().int().optional());

// Grupa pól „Karta” w formularzu Pages CMS (zlecenie 30; zakłady, „Warto wiedzieć”): Pages CMS grupuje pola tylko polem typu object,
// więc w pliku leżą pod kluczem karta. Strona czyta je jak dotąd z wierzchu — przy wczytaniu karta jest spłaszczana.
const zKarta = <T extends z.ZodRawShape>(pola: T) => z.preprocess((v) => {
  if (!v || typeof v !== 'object' || !('karta' in v)) return v;
  const { karta, ...reszta } = v as Record<string, unknown>;
  return { ...(karta && typeof karta === 'object' ? karta : {}), ...reszta };
}, z.object(pola));

const zaklady = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zaklady' }),
  schema: zKarta({
    nazwa: z.string(),
    nazwa_en: optStr,
    nazwa_krotka: optStr,
    nazwa_krotka_en: optStr,
    kolejnosc: z.preprocess(empty, z.coerce.number().default(99)),
    kierownik: optStr,
    telefon: optStr,
    opis: optStr,
    opis_en: optStr,
    obszary: strList,
    obszary_en: strList,
    strona: optStr,
    zdjecie: optStr,
    zdjecie_opis: optStr,
    zdjecie_opis_en: optStr,
    tresc_en: optStr,
    ...haslo,
    opublikowany: published,
  }),
});

// lista z pola CMS (puste = brak pozycji)
const lista = <T extends z.ZodTypeAny>(item: T) => z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(item));

const banerKierunkuSchema = z.object({
    kierunek: optStr,
    podtytul: optStr,
    podtytul_en: optStr,
    opis: optStr,
    opis_en: optStr,
    ...haslo,
    liczby: lista(z.object({ wartosc: z.string(), wartosc_en: optStr, etykieta: z.string(), etykieta_en: optStr, etykieta_krotka: optStr, etykieta_krotka_en: optStr })),
});
const banerSpecjalnosciSchema = z.object({
  opis: optStr, opis_en: optStr, ...haslo, skrot: optStr, poziom: optStr, poziom_en: optStr,
  liczby: liczbyBanera,
});
const polaSpecjalnosci = {
    kierunek: z.preprocess((v) => idWpisu(empty(v)), z.string().default('matematyka')),
    // Wyłącznie stary format kafelków; nowy format kierunku ma jawne :::specjalnosci.
    kolejnosc: z.preprocess(empty, z.coerce.number().default(99)),
    na_stronie_kierunku: z.preprocess((v) => (v == null || v === '' ? true : v), z.boolean()),
    bez_podstrony: z.preprocess((v) => (v == null || v === '' ? false : v), z.boolean()),
    kafelek_dla_kogo: optStr,
    kafelek_dla_kogo_en: optStr,
    kafelek_kariera: optStr,
    kafelek_kariera_en: optStr,
    skrot: optStr,
    poziom: optStr,
    poziom_en: optStr,
    opis: optStr,
    opis_en: optStr,
    zaklad: optId,
    opiekunowie: lista(z.object({ imie_nazwisko: optStr, osoba: optId, rola: optStr, rola_en: optStr })),
    // identyfikatory seminariów (pliki z src/content/seminaria) związanych ze specjalnością — sekcja „Seminaria”
    seminaria: idList,
    wygaszana: z.preprocess((v) => (v == null || v === '' ? false : v), z.boolean()),
    zrodla: strList,
    do_uzupelnienia: strList,
    ...haslo,
};
const jawnyFormat = z.enum(['jawne']).optional();
const schematSpecjalnosci = z.object({
  ...polaSpecjalnosci, nazwa: z.string(), nazwa_en: optStr, tresc_en: optStr,
  format_tresci: jawnyFormat, baner: banerSpecjalnosciSchema.optional(), opublikowany: published,
});

// Kierunek (zlecenie 28): jeden Markdown — treść polska w pliku (body), angielska w tresc_en (puste = polska z lang="pl").
// Sekcje po ## i bloki z list (src/plugins/rehype-bloki.mjs, kotwice w kotwice.mjs), wygląd w src/views/Kierunek.astro.
// Nowy format: format_tresci=jawne, baner w tym wpisie; kierunki_baner pozostaje zgodnością.
// Menu i kafelki działu Studia: Ustawienia (studia.kierunki), przypomnienia o terminach
// w src/data/przypomnienia.json (src/lib/kierunki.ts, src/lib/tresci.ts).
const kierunki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kierunki' }),
  schema: z.object({
    format_tresci: jawnyFormat,
    baner: banerKierunkuSchema.optional(),
    nazwa: z.string(),
    nazwa_en: optStr,
    tresc_en: optStr,
    opublikowany: published,
  }),
});

// Stary format banera kierunku (zgodność, nowy format ma pole baner w Markdownie).
// src/content/kierunki-baner/<id kierunku>.json; osobny formularz, bo Pages CMS przy zapisie usuwa z pliku pola
// spoza formularza). Brak pliku: baner z samą nazwą (bez zdania, liczb i hasła), opis strony (meta) = pierwsze zdanie treści.
// kierunek — nazwa pliku kierunku (w formularzu z niej powstaje nazwa nowego pliku banera; strona bierze id z nazwy pliku).
// liczby: wartosc_en — wartość po angielsku (np. „3 years”; puste = jak po polsku); etykieta_krotka(_en) — krótsza etykieta
// na telefon (wąskie kolumny; zlecenie 01), np. „punktów ECTS”
const kierunki_baner = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/kierunki-baner' }),
  schema: banerKierunkuSchema,
});

// Podstrona specjalności (np. /studia/matematyka/analiza-danych), zlecenie 29: formularz „Treść” — jeden Markdown jak kierunek
// (body po polsku, tresc_en po angielsku; puste = polska z lang="pl"), sekcje po ## i bloki z list (src/plugins/rehype-bloki.mjs,
// kotwice typu „specjalnosc” w kotwice.mjs), wygląd w src/views/Specjalnosc.astro. Pola banera i kafelka na stronie kierunku —
// w nowym formacie: pole baner oraz relacje w tym samym wpisie. Specjalnosci_baner pozostaje zgodnością.
const specjalnosci = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specjalnosci' }),
  schema: schematSpecjalnosci,
});

// „Baner i kafelek” specjalności (src/content/specjalnosci-baner/<id specjalności>.json; osobny formularz, bo Pages CMS przy zapisie
// usuwa z pliku pola spoza formularza). Brak pliku: wartości domyślne (kierunek matematyka, kafelek na stronie kierunku, bez
// banera i opiekunów) — src/lib/specjalnosci.ts. zrodla i do_uzupelnienia — pola ukryte w formularzu (notatki redakcyjne).
const specjalnosci_baner = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/specjalnosci-baner' }),
  schema: z.object(polaSpecjalnosci),
});

const konferencje = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/konferencje' }),
  schema: z.object({
    tytul: z.string(),
    tytul_en: optStr,
    poczatek: date,
    koniec: optDate,
    miejsce: optStr,
    strona: optStr,
    organizatorzy: optStr,
    zaklad: optId,
    zdjecie: optStr,
    odwolana: z.preprocess((v) => (v == null || v === '' ? false : v), z.boolean()),
    opublikowany: published,
  }),
});

const granty = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/granty' }),
  schema: z.object({
    tytul: z.string(),
    tytul_en: optStr,
    kod: optStr,
    rodzaj: z.preprocess(empty, z.enum(['ncn', 'ue', 'wewnetrzny', 'inny']).default('inny')),
    program: optStr,
    kierownik: optStr,
    wykonawcy: optStr,
    rok_od: rok,
    rok_do: rok,
    kwota: optStr,
    zaklad: optId,
    strona: optStr,
    opublikowany: published,
  }),
});

// „Warto wiedzieć”: krótka lista trwałych, wyjątkowych osiągnięć Instytutu (pasek na stronie głównej + sekcje na /nauka i /studia).
// Pozycja z treścią (body) dostaje własną podstronę /warto-wiedziec/<plik>; bez treści karta prowadzi do pola „link”.
const warto_wiedziec = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/warto_wiedziec' }),
  schema: zKarta({
    tytul: z.string(),
    tytul_en: optStr,
    // rok jako tekst (np. „2017” albo „2010, 2018”) — liczba z YAML-a też przejdzie
    rok: z.preprocess((v) => (v == null || v === '' ? undefined : String(v)), z.string().optional()),
    zajawka: optStr,
    zajawka_en: optStr,
    dzial: z.preprocess(empty, z.enum(['nauka', 'studia', 'instytut']).default('instytut')),
    na_glownej: published,
    // „Zawsze pokazuj na stronie głównej” — pozycja nie bierze udziału w losowaniu (patrz WartoWiedziec.astro)
    zawsze: z.preprocess((v) => (v == null || v === '' ? false : v), z.boolean()),
    kolejnosc: z.preprocess(empty, z.coerce.number().default(100)),
    obraz: optStr,
    obraz_opis: optStr,
    obraz_opis_en: optStr,
    link: optStr,
    link_etykieta: optStr,
    link_etykieta_en: optStr,
    tresc_en: optStr,
    zrodla: strList,
    opublikowany: published,
  }),
});

export const collections = { aktualnosci, strony, pracownicy, seminaria, referaty, obrony, konferencje, granty, zaklady, kierunki, kierunki_baner, specjalnosci, specjalnosci_baner, warto_wiedziec };
