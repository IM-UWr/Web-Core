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

const plik = z.object({ nazwa: optStr, plik: z.string() });
const plikList = z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(plik));

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
    galeria: z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(z.object({ plik: z.string(), podpis: optStr }))),
    album: optStr,
    zalaczniki: plikList,
    wydarzenie_poczatek: optDate,
    wydarzenie_koniec: optDate,
    wydarzenie_miejsce: optStr,
    wyroznij_do: optDate,
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
    tytul: z.string(),
    opis: optStr,
    tytul_en: optStr,
    opis_en: optStr,
    tresc_en: optStr,
    // prawy pasek: spis „Na tej stronie”, menu działu (podstrony) albo oba
    // puste = domyślnie tylko spis „Na tej stronie” (bez menu działu)
    pasek_boczny: z.preprocess(empty, z.enum(['oba', 'spis', 'menu', 'brak']).optional()),
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
    termin: date,
    sala: optStr,
    pliki: plikList,
    opublikowany: published,
  }),
});

const obrony = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/obrony' }),
  schema: z.object({
    kandydat: z.string(),
    tytul_rozprawy: z.string(),
    // zdjęcie (opcjonalne) — na karcie na stronie głównej, na liście aktualności i na stronie obrony
    zdjecie: optStr,
    zdjecie_opis: optStr,
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

const zaklady = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zaklady' }),
  schema: z.object({
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
    tresc_en: optStr,
    opublikowany: published,
  }),
});

// Kierunek studiów (np. matematyka): treść w polach, a wygląd w szablonie src/views/Kierunek.astro.
const lista = <T extends z.ZodTypeAny>(item: T) => z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(item));
const link = z.object({ etykieta: z.string(), etykieta_en: optStr, adres: z.string() });
// Dokument: plik wgrany w CMS (pole „wgraj”) albo link (pole „plik”, np. do BIP). Szablony używają zawsze „plik”.
const dokument = z
  .object({ nazwa: z.string(), nazwa_en: optStr, wgraj: optStr, plik: optStr, opis: optStr, opis_en: optStr })
  .refine((d) => !!(d.wgraj || d.plik), { message: 'Dokument: wgraj plik albo podaj link' })
  .transform((d) => ({ ...d, plik: (d.wgraj || d.plik) as string }));

const kierunki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kierunki' }),
  schema: z.object({
    nazwa: z.string(),
    nazwa_en: optStr,
    // gdzie kierunek pojawia się automatycznie: menu „Studia” i kafelki na stronie głównej (kolejność rosnąco)
    kolejnosc: z.preprocess(empty, z.coerce.number().default(99)),
    w_menu: z.preprocess((v) => (v == null || v === '' ? true : v), z.boolean()),
    menu_etykieta: optStr,
    menu_etykieta_en: optStr,
    na_stronie_glownej: z.preprocess((v) => (v == null || v === '' ? true : v), z.boolean()),
    kafelek_poziom: optStr,
    kafelek_poziom_en: optStr,
    kafelek_opis: optStr,
    kafelek_opis_en: optStr,
    podtytul: optStr,
    podtytul_en: optStr,
    opis: optStr,
    opis_en: optStr,
    // wartosc_en — wartość w wersji angielskiej (np. „3 years”; puste = jak po polsku)
    fakty: lista(z.object({ wartosc: z.string(), wartosc_en: optStr, etykieta: z.string(), etykieta_en: optStr })),
    przyciski: lista(link),
    dlaczego: lista(z.object({ tytul: z.string(), tytul_en: optStr, opis: z.string(), opis_en: optStr, ikona: optStr })),
    etapy: lista(z.object({
      stopien: z.string(),
      kiedy: z.string(),
      kiedy_en: optStr,
      tytul: z.string(),
      tytul_en: optStr,
      opis: optStr,
      opis_en: optStr,
      termin: optStr,
      termin_en: optStr,
      formularz: optStr,
      formularz_adres: optStr,
    })),
    programy: lista(z.object({
      nazwa: z.string(),
      nazwa_en: optStr,
      dotyczy: optStr,
      dotyczy_en: optStr,
      od_roku: z.preprocess(empty, z.coerce.number().int().optional()),
      do_roku: z.preprocess(empty, z.coerce.number().int().optional()),
      dokumenty: lista(dokument),
    })),
    terminy: lista(z.object({
      co: z.string(),
      co_en: optStr,
      kogo: optStr,
      kogo_en: optStr,
      termin: optStr,
      termin_en: optStr,
      formularz: optStr,
      formularz_adres: optStr,
      // przypomnienie w „Najbliższych wydarzeniach” (strona główna, aktualności) przed terminem
      data: optDate,
      przypomnienie: z.preprocess(empty, z.boolean().default(false)),
      dni_przed: z.preprocess(empty, z.coerce.number().int().min(0).default(14)),
      co_roku: z.preprocess(empty, z.boolean().default(true)),
    })),
    praktyki: optStr,
    praktyki_en: optStr,
    praktyki_dokumenty: lista(dokument),
    kariera: optStr,
    kariera_en: optStr,
    faq: lista(z.object({ pytanie: z.string(), pytanie_en: optStr, odpowiedz: z.string(), odpowiedz_en: optStr })),
    kontakt: lista(z.object({ rola: z.string(), rola_en: optStr, osoba: z.string(), email: optStr, telefon: optStr, pokoj: optStr })),
    akty: lista(dokument),
    tresc_en: optStr,
    opublikowany: published,
  }),
});

// Podstrona specjalności (np. /studia/matematyka/analiza-danych).
const specjalnosci = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specjalnosci' }),
  schema: z.object({
    nazwa: z.string(),
    nazwa_en: optStr,
    kierunek: z.preprocess((v) => idWpisu(empty(v)), z.string().default('matematyka')),
    // kafelek na stronie kierunku budowany z tego pliku (jedno miejsce edycji)
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
    opiekunowie: lista(z.object({ imie_nazwisko: z.string(), rola: optStr, rola_en: optStr })),
    wygaszana: z.preprocess((v) => (v == null || v === '' ? false : v), z.boolean()),
    dla_kogo: optStr,
    dla_kogo_en: optStr,
    // „Co wyróżnia specjalność” — kafelki jak na stronie kierunku
    dlaczego: lista(z.object({ tytul: z.string(), tytul_en: optStr, opis: z.string(), opis_en: optStr, ikona: optStr })),
    // „Jak przebiega specjalność” — oś semestrów/etapów
    etapy: lista(z.object({ kiedy: z.string(), kiedy_en: optStr, tytul: z.string(), tytul_en: optStr, opis: optStr, opis_en: optStr })),
    // identyfikatory seminariów (pliki z src/content/seminaria) związanych ze specjalnością
    seminaria: idList,
    przedmioty: lista(z.object({
      grupa: z.string(),
      grupa_en: optStr,
      lista: lista(z.object({ nazwa: z.string(), nazwa_en: optStr, opis: optStr, opis_en: optStr })),
    })),
    umiejetnosci: strList,
    umiejetnosci_en: strList,
    kariera: optStr,
    kariera_en: optStr,
    tematy_prac: lista(z.object({ tytul: z.string(), opis: optStr })),
    dokumenty: lista(dokument),
    linki: lista(link),
    faq: lista(z.object({ pytanie: z.string(), pytanie_en: optStr, odpowiedz: z.string(), odpowiedz_en: optStr })),
    tresc_en: optStr,
    zrodla: strList,
    do_uzupelnienia: strList,
    opublikowany: published,
  }),
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
  schema: z.object({
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

export const collections = { aktualnosci, strony, pracownicy, seminaria, referaty, obrony, konferencje, granty, zaklady, kierunki, specjalnosci, warto_wiedziec };
