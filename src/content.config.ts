import { defineCollection, z } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { relative } from 'node:path';

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

// lista z pola CMS (puste = brak pozycji)
const lista = <T extends z.ZodTypeAny>(item: T) => z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(item));

const plik = z.object({ nazwa: optStr, nazwa_en: optStr, plik: z.string() });
const plikList = lista(plik);

// Puste pozycje list (zlecenie 31, etap 1b). Pages CMS potrafi zapisać pozycję bez wymaganego pola — np. „- {}” po kliknięciu
// „Add an item” bez wybrania zdjęcia. Formularze blokują to od zlecenia 31 (ukryte pole „pozycja” w każdej takiej liście), a gdyby
// coś jednak przeszło (zmiana na GitHubie, inna wersja CMS), strona pomija taką pozycję z ostrzeżeniem w logu budowy (plik, pole,
// numer pozycji), zamiast przerywać budowę. Klucz: pole-lista (z kropką: lista w obiekcie, np. baner.liczby), wartość: pola,
// bez których pozycja nie ma sensu. Pole „pozycja” (false) w pliku strona pomija jak każde pole spoza schematu.
const WYMAGANE_W_LISTACH: Record<string, Record<string, string[]>> = {
  aktualnosci: { galeria: ['plik'], zalaczniki: ['plik'], termin: ['dzien'], zgloszenia: ['do_dnia'] },
  strony: { liczby: ['n', 'etykieta'] },
  referaty: { pliki: ['plik'] },
  obrony: { recenzje: ['recenzent', 'plik'] },
  kierunki: { 'baner.liczby': ['wartosc', 'etykieta'] },
  kierunki_baner: { liczby: ['wartosc', 'etykieta'] },
  specjalnosci: { 'baner.liczby': ['n', 'etykieta'] },
  ww_sylwetki: { liczby: ['n', 'etykieta'] },
};

type Dane = Record<string, unknown>;
const brakWartosci = (v: unknown) => v == null || (typeof v === 'string' && v.trim() === '');
const obiekt = (v: unknown): v is Dane => !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

// Jedna funkcja pomocnicza dla wszystkich list: zwraca dane bez pozycji, którym brakuje wymaganego pola.
function bezPustychPozycji(kolekcja: string, dane: Dane, plik: string, ostrzez: (m: string) => void): Dane {
  const wynik: Dane = { ...dane };
  for (const [sciezka, wymagane] of Object.entries(WYMAGANE_W_LISTACH[kolekcja] ?? {})) {
    const [gora, dol] = sciezka.split('.');
    const rodzic = dol ? wynik[gora] : wynik;
    const pole = dol ?? gora;
    if (!obiekt(rodzic) || !Array.isArray(rodzic[pole])) continue;
    const pozycje = rodzic[pole] as unknown[];
    const zostaja = pozycje.filter((poz, i) => {
      const brak = obiekt(poz) ? wymagane.filter((k) => brakWartosci(poz[k])) : wymagane;
      if (brak.length) ostrzez(`${plik}: ${sciezka}, pozycja ${i + 1} pominięta — brak pola ${brak.map((k) => `„${k}”`).join(', ')}`);
      return brak.length === 0;
    });
    if (zostaja.length === pozycje.length) continue;
    if (dol) wynik[gora] = { ...rodzic, [pole]: zostaja };
    else wynik[pole] = zostaja;
  }
  return wynik;
}

// Godzina terminu: „13:00”, „9.30”, „9:30” → „GG:MM”; liczba z YAML-a (np. 9.3 z ręcznie wpisanego 9.30) też; zła wartość = brak.
const GODZINA = /^([01]?\d|2[0-3])[:.]([0-5]\d)$/;
function godzinaGGMM(v: unknown): string | undefined {
  if (v == null || v === '') return undefined;
  const s = typeof v === 'number' ? ((([h, m = '']) => `${h}:${m.padEnd(2, '0')}`)(String(v).split('.'))) : String(v).trim();
  const m = s.match(GODZINA);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : undefined;
}

// Uwagi do pojedynczego wpisu (przed walidacją), z nazwą pliku w logu budowy.
function kontrolaWpisu(kolekcja: string, dane: unknown, plik: string, ostrzez: (m: string) => void): unknown {
  if (!obiekt(dane)) return dane;
  const wynik = bezPustychPozycji(kolekcja, dane, plik, ostrzez);
  if (kolekcja === 'aktualnosci') {
    const termin = Array.isArray(wynik.termin) ? (wynik.termin as unknown[]) : [];
    if (termin.length > 1) ostrzez(`${plik}: termin ma ${termin.length} pozycje — strona bierze pierwszą`);
    const t = termin[0];
    if (obiekt(t)) {
      for (const k of ['godzina', 'godzina_konca'])
        if (!brakWartosci(t[k]) && !godzinaGGMM(t[k])) ostrzez(`${plik}: termin.${k} „${t[k]}” to nie godzina (GG:MM) — pominięta`);
    } else if (!brakWartosci(wynik.wydarzenie_poczatek)) {
      ostrzez(`${plik}: stary zapis terminu (wydarzenie_poczatek) — przenieś do pola „termin” (skrypty/migracja/termin.py)`);
    }
    // termin zgłoszeń (zlecenie 44): tylko oferty („Kariera”); przy innym rodzaju strona go pomija
    const zgl = Array.isArray(wynik.zgloszenia) ? (wynik.zgloszenia as unknown[]) : [];
    if (zgl.length > 1) ostrzez(`${plik}: termin zgłoszeń ma ${zgl.length} pozycje — strona bierze pierwszą`);
    if (zgl.length && (wynik.rodzaj ?? 'ogloszenie') !== 'kariera') ostrzez(`${plik}: termin zgłoszeń przy rodzaju innym niż „Kariera” — strona go pomija`);
    // nazwa pliku zajęta przez podstronę /aktualnosci/kariera (ZAJETE_NAZWY_AKTUALNOSCI w src/lib/tresci.ts)
    if (/(^|\/)kariera\.md$/.test(plik)) ostrzez(`${plik}: nazwa pliku „kariera” jest zajęta przez stronę ofert /aktualnosci/kariera — wpis pominięty; zmień nazwę pliku`);
  }
  return wynik;
}

// Loader z kontrolą wpisu: dane każdego pliku przechodzą przez kontrolaWpisu, zanim sprawdzi je schemat kolekcji.
function zKontrola(kolekcja: string, loader: Loader): Loader {
  return {
    ...loader,
    load: (ctx) => loader.load({
      ...ctx,
      parseData: ((wpis) => ctx.parseData({
        ...wpis,
        data: kontrolaWpisu(kolekcja, wpis.data, relative(process.cwd(), wpis.filePath ?? wpis.id).replaceAll('\\', '/'),
          (m) => ctx.logger.warn(m)) as typeof wpis.data,
      })) as typeof ctx.parseData,
    }),
  };
}
const zrodlo = (kolekcja: string, pattern: string, base: string) => zKontrola(kolekcja, glob({ pattern, base }));

// Termin wydarzenia w aktualności (zlecenie 31, etap 2): grupa „termin” w formularzu — lista z najwyżej jedną pozycją, dodawana
// jednym kliknięciem; bez niej wpis jest zwykłą aktualnością. Strona wylicza z niej dotychczasowe pola wydarzenie_poczatek,
// wydarzenie_koniec i wydarzenie_miejsce, więc reszta kodu się nie zmienia:
//   początek = dzień (+ godzina); koniec = dzień zakończenia (+ godzina zakończenia), albo dzień + godzina zakończenia,
//   albo brak (strona przyjmie 2 godziny po początku albo cały dzień); miejsce = miejsce.
// Okres przejściowy: wpis bez terminu, a ze starymi polami wydarzenie_* — strona bierze stare pola (z ostrzeżeniem w logu).
const godzina = z.preprocess(godzinaGGMM, z.string().optional());
const terminWydarzenia = z.object({ dzien: date, godzina, dzien_konca: optDate, godzina_konca: godzina, miejsce: optStr });
type Termin = z.infer<typeof terminWydarzenia>;
const polaWydarzenia = (t: Termin) => ({
  wydarzenie_poczatek: t.godzina ? `${t.dzien}T${t.godzina}` : t.dzien,
  wydarzenie_koniec: t.dzien_konca
    ? (t.godzina_konca ? `${t.dzien_konca}T${t.godzina_konca}` : t.dzien_konca)
    : (t.godzina_konca ? `${t.dzien}T${t.godzina_konca}` : undefined),
  wydarzenie_miejsce: t.miejsce,
});

// Termin zgłoszeń w ofercie (zlecenie 44): grupa „zgloszenia” jak „termin” wyżej (lista z najwyżej jedną pozycją, dodawana kliknięciem),
// jedno pole „Do dnia”. Strona wylicza z niej zgloszenia_do (RRRR-MM-DD), tylko przy rodzaju „Kariera” (przy innym pomija;
// ostrzeżenie w logu i w skrypty/sprawdz_tresci.py). Bez terminu oferta jest aktualna (ofertaAktualna w src/lib/tresci.ts).
const terminZgloszen = z.object({ do_dnia: date });

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
  loader: zrodlo('aktualnosci', '**/*.md', './src/content/aktualnosci'),
  schema: z.object({
    tytul: z.string(),
    data: date,
    // zlecenie 49 cofnięte w 54: stara wartość „seminarium-wydzialowe” (plik zapisany starą wersją formularza) czytana jako
    // „wydarzenie”, żeby nie psuła budowy; sprawdz_tresci.py ostrzega przy takim pliku
    rodzaj: z.preprocess((v) => (v === 'seminarium-wydzialowe' ? 'wydarzenie' : empty(v)), z.enum(['ogloszenie', 'wydarzenie', 'sukces', 'kariera']).default('ogloszenie')),
    dla: z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.enum(['studenci', 'doktoranci', 'pracownicy', 'kandydaci']))),
    zajawka: optStr,
    zdjecie: optStr,
    zdjecie_opis: optStr,
    zdjecie_opis_en: optStr,
    galeria: lista(z.object({ plik: z.string(), podpis: optStr })),
    album: optStr,
    zalaczniki: plikList,
    termin: lista(terminWydarzenia),
    zgloszenia: lista(terminZgloszen),
    // stary zapis terminu (do migracji danych, skrypty/migracja/termin.py); przy polu „termin” nieużywany
    wydarzenie_poczatek: optDate,
    wydarzenie_koniec: optDate,
    wydarzenie_miejsce: optStr,
    tytul_en: optStr,
    zajawka_en: optStr,
    tresc_en: optStr,
    zaklad: optId,
    opublikowany: published,
  }).transform(({ termin, zgloszenia, ...d }) => ({
    ...d,
    ...(termin[0] ? polaWydarzenia(termin[0]) : {}),
    zgloszenia_do: d.rodzaj === 'kariera' && zgloszenia[0] ? zgloszenia[0].do_dnia.slice(0, 10) : undefined,
  })),
});

const strony = defineCollection({
  loader: zrodlo('strony', '**/*.md', './src/content/strony'),
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
    // zlecenie 42: „Pracuje w Instytucie” (odznaczone = osoba odeszła: znika ze spisu i z list zakładów, zostaje przy dawnych
    // grantach jako tekst bez linku; src/lib/osobySpisu.ts) i opcjonalna data odejścia (strona jej nie pokazuje)
    pracuje: published,
    data_odejscia: z.preprocess(toDateString, z.string().optional()),
  }),
});

const seminaria = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/seminaria' }),
  schema: z.object({
    nazwa: z.string(),
    nazwa_en: optStr,
    prowadzacy: strList,
    // zlecenie 42: koordynatorzy wybrani ze spisu (reference → id osoby) i wpisani ręcznie; stare „prowadzacy” działa do migracji
    prowadzacy_ze_spisu: idList,
    prowadzacy_spoza: strList,
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
  loader: zrodlo('referaty', '**/*.md', './src/content/referaty'),
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
  loader: zrodlo('obrony', '**/*.md', './src/content/obrony'),
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
    recenzje: lista(z.object({ recenzent: z.string(), plik: z.string() })),
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
    // zlecenie 42: kierownik wybrany ze spisu (reference → id osoby); stare „kierownik” (tekst) działa do migracji
    kierownik_ze_spisu: optId,
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
  loader: zrodlo('kierunki', '**/*.md', './src/content/kierunki'),
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
  loader: zrodlo('kierunki_baner', '*.json', './src/content/kierunki-baner'),
  schema: banerKierunkuSchema,
});

// Podstrona specjalności (np. /studia/matematyka/analiza-danych), zlecenie 29: formularz „Treść” — jeden Markdown jak kierunek
// (body po polsku, tresc_en po angielsku; puste = polska z lang="pl"), sekcje po ## i bloki z list (src/plugins/rehype-bloki.mjs,
// kotwice typu „specjalnosc” w kotwice.mjs), wygląd w src/views/Specjalnosc.astro. Pola banera i kafelka na stronie kierunku —
// w nowym formacie: pole baner oraz relacje w tym samym wpisie. Specjalnosci_baner pozostaje zgodnością.
const specjalnosci = defineCollection({
  loader: zrodlo('specjalnosci', '**/*.md', './src/content/specjalnosci'),
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
    // zlecenie 42: kierownicy ze spisu (reference → id osoby) i spoza spisu (tekst z tytułem); stare „kierownik” działa do migracji
    kierownik_ze_spisu: idList,
    kierownik_spoza: strList,
    wykonawcy: optStr,
    rok_od: rok,
    rok_do: rok,
    kwota: optStr,
    zaklad: optId,
    strona: optStr,
    opublikowany: published,
  }),
});

// „Warto wiedzieć” (zlecenie 47): trzy kolekcje w podkatalogach Web-Instytut src/content/warto_wiedziec/ — sylwetki, nagrody
// i wyróżnienia, historie (grupa wpisu wynika z podkatalogu). Adres płaski: /instytut/warto-wiedziec/<plik> (duplikaty nazw:
// src/lib/wartoWiedziec.ts). Pola wspólne przez zWW (jak zKarta: grupa „Karta” formularza spłaszczona). Wartości, które mogą być złe
// po zapisie redaktora (Dodano, rocznice, rok historii), schemat tylko przepuszcza jako tekst — sprawdza je src/lib/wartoWiedziec.ts:
// zła wartość = ostrzeżenie w logu i pole puste (albo historia pominięta na osi), nie błąd budowy.
// Stary układ (plik leżący wprost w warto_wiedziec/, przed pushem Web-Instytut) — historia, z ostrzeżeniem w logu.
const tekst = z.preprocess((v) => (v == null || v === '' ? undefined : String(v)), z.string().optional());
const nie = z.preprocess((v) => (v == null || v === '' ? false : v), z.boolean());
const zWW = <T extends z.ZodRawShape>(pola: T) => zKarta({
  tytul: z.string(),
  opublikowany: published,
  zajawka: optStr,
  zajawka_en: optStr,
  obraz: optStr,
  // „Pokaż na stronie głównej” (domyślnie tak), „Ulubione” (×3 w losowaniu), „Zawsze pokazuj”
  na_glownej: published,
  ulubione: nie,
  zawsze: nie,
  // „Dodano” („RRRR-MM-DD” albo puste; data z YAML-a też) — znaczek „Nowe” przez 30 dni
  dodano: z.preprocess(toDateString, z.string().optional()),
  format_tresci: optStr,
  tresc_en: optStr,
  ...pola,
});
// Sylwetka: „Liczby” (zlecenie 52) — liczby w banerze jak na Stronach (n, n_en, etykieta, etykieta_en); pozycja bez liczby albo podpisu
// wypada z ostrzeżeniem (WYMAGANE_W_LISTACH), pierwsze 3 i zapas z :::w-skrocie — liczbyBaneraWW w src/lib/wartoWiedziec.ts.
const ww_sylwetki = defineCollection({
  loader: zrodlo('ww_sylwetki', '*.md', './src/content/warto_wiedziec/sylwetki'),
  schema: zWW({
    lata: tekst,
    podpis: optStr,
    podpis_en: optStr,
    liczby: liczbyBanera,
    rocznica_urodzin: tekst,
    obraz_zrodlo: optStr,
  }),
});
const obrazILink = {
  tytul_en: optStr,
  obraz_opis: optStr,
  obraz_opis_en: optStr,
  link: optStr,
  link_etykieta: optStr,
  link_etykieta_en: optStr,
  zrodla: strList,
};
const ww_nagrody = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/warto_wiedziec/nagrody' }),
  schema: zWW({ ...obrazILink, kolejnosc: z.preprocess(empty, z.coerce.number().default(100)) }),
});
const ww_historie = defineCollection({
  loader: glob({ pattern: ['historie/*.md', '*.md'], base: './src/content/warto_wiedziec' }),
  schema: zWW({ ...obrazILink, rok: tekst, rocznica: tekst }),
});

export const collections = { aktualnosci, strony, pracownicy, seminaria, referaty, obrony, konferencje, granty, zaklady, kierunki, kierunki_baner, specjalnosci, specjalnosci_baner, ww_sylwetki, ww_nagrody, ww_historie };
