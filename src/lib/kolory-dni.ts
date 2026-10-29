// Kolory dni (niebieski / pomarańczowy) liczone z src/data/kolory-dni.json — strona /studia/rok-akademicki,
// kafelek na stronie głównej i automatyczne aktualności o zamianach dni.
// Bez zależności od astro:content — działa przy budowaniu i w skrypcie przeglądarki.
//
// Reguła (sprawdzona dzień po dniu na kalendarzach PDF Instytutu z lat 2021/22–2026/27):
// każdy dzień tygodnia (pon–pt) liczymy osobno; dzień, w którym dany dzień tygodnia występuje
// w semestrze po raz nieparzysty (1., 3., 5. …), jest niebieski, po raz parzysty — pomarańczowy.
// Dni wolne (weekendy, święta ustawowe, dni z listy „wolne”) pomijamy, a zamiana
// („w piątek zajęcia środowe”) liczy się jak dzień, którego plan obowiązuje.
// Wyjątek zmienia kolor jednego dnia i nie przesuwa liczenia kolejnych dni.
import dane from '../data/kolory-dni.json';
import { addDays, weekday, dayShort, dayNum, monthShort, long, longWithDay, type Lang } from './daty';

export type Kolor = 'niebieski' | 'pomaranczowy';

export interface Wolne { od: string; do?: string | null; opis?: string | null; opis_en?: string | null }
export interface Zamiana { data: string; jak_dzien: string }
export interface Wyjatek { data: string; kolor: string }
// Terminy semestru do tabeli „Rok w skrócie” (zajęcia = poczatek–koniec). Wszystkie pola opcjonalne.
export interface TerminySemestru {
  semestr_od?: string | null;
  semestr_do?: string | null;
  inauguracja?: string | null;
  sesja_od?: string | null;
  sesja_do?: string | null;
  poprawkowa_od?: string | null;
  poprawkowa_do?: string | null;
  przerwy?: { od?: string | null; do?: string | null }[] | null;
}
export interface Semestr {
  nazwa: string;
  nazwa_en?: string | null;
  poczatek: string;
  koniec: string;
  terminy?: TerminySemestru | null;
  pdf?: string | null;
  uwagi?: string | null;
  uwagi_en?: string | null;
  wolne?: Wolne[] | null;
  zamiany?: Zamiana[] | null;
  wyjatki?: Wyjatek[] | null;
}

export interface Dzien {
  data: string; // RRRR-MM-DD
  dzienTygodnia: number; // 1 = poniedziałek … 7 = niedziela
  kolor: Kolor | null; // null = brak zajęć
  plan: number | null; // 1–5: dzień tygodnia, według którego planu są zajęcia
  ktory: number | null; // który raz ten dzień planu występuje w semestrze
  wolne: { opis: string; opis_en: string; swieto: boolean } | null; // dzień wolny od zajęć (pon–pt)
  zamiana: boolean;
  wyjatek: boolean;
}

export interface DzienSemestru extends Dzien { semestr: Semestr }

const DNI_PL = ['', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
const DNI_PL_JAK = ['', 'w poniedziałek', 'we wtorek', 'w środę', 'w czwartek', 'w piątek', 'w sobotę', 'w niedzielę'];
const DNI_PL_PRZYM = ['', 'poniedziałkowe', 'wtorkowe', 'środowe', 'czwartkowe', 'piątkowe'];
const DNI_PL_DOP = ['', 'poniedziałku', 'wtorku', 'środy', 'czwartku', 'piątku', 'soboty', 'niedzieli'];
const DNI_EN = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DNI_SKROT = { pl: ['', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'], en: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };

export const NAZWA_KOLORU: Record<Lang, Record<Kolor, string>> = {
  pl: { niebieski: 'niebieski', pomaranczowy: 'pomarańczowy' },
  en: { niebieski: 'blue', pomaranczowy: 'orange' },
};
// Duży napis w komórce dnia z zamianą: według planu którego dnia są zajęcia („ŚR” = plan środy).
// W komórkach nie ma liter N/P — kolor dnia podaje tekst dla czytników ekranu i legenda.
export const SKROT_PLANU: Record<Lang, string[]> = {
  pl: ['', 'PN', 'WT', 'ŚR', 'CZ', 'PT', 'SO', 'ND'],
  en: ['', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
};

// ---------- pomocnicze ----------
const dzien = (s: unknown): string => (typeof s === 'string' ? s.trim().slice(0, 10) : '');
const poprawna = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
// 1 = pon … 7 = niedz
export const dzienTygodnia = (data: string) => ((weekday(data) + 6) % 7) + 1;

function numerDnia(s: string): number | null {
  const t = String(s ?? '').trim().toLowerCase();
  if (/^[1-7]$/.test(t)) return Number(t);
  if (/^(pn|pon)/.test(t) || t.startsWith('mon')) return 1;
  if (/^wt/.test(t) || t.startsWith('tue')) return 2;
  if (/^(śr|sr)/.test(t) || t.startsWith('wed')) return 3;
  if (/^cz/.test(t) || t.startsWith('thu')) return 4;
  if (/^pt|^pi/.test(t) || t.startsWith('fri')) return 5;
  if (/^so/.test(t) || t.startsWith('sat')) return 6;
  if (/^n/.test(t) || t.startsWith('sun')) return 7;
  return null;
}

function kolorZTekstu(s: string): Kolor | null {
  const t = String(s ?? '').trim().toLowerCase();
  if (t.startsWith('nie') || t === 'n' || t.startsWith('blue')) return 'niebieski';
  if (t.startsWith('pom') || t === 'p' || t.startsWith('orange')) return 'pomaranczowy';
  return null;
}

// Wielkanoc (algorytm Meeusa/Jonesa/Butchera, kalendarz gregoriański).
function wielkanoc(y: number): string {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mies = Math.floor((h + l - 7 * m + 114) / 31), dz = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(mies).padStart(2, '0')}-${String(dz).padStart(2, '0')}`;
}

// Dni ustawowo wolne od pracy w Polsce — uwzględniane automatycznie (nie trzeba ich wpisywać).
export function swietaPanstwowe(rok: number): Map<string, { pl: string; en: string }> {
  const w = wielkanoc(rok);
  const d = (m: number, dz: number) => `${rok}-${String(m).padStart(2, '0')}-${String(dz).padStart(2, '0')}`;
  const s = new Map<string, { pl: string; en: string }>([
    [d(1, 1), { pl: 'Nowy Rok', en: "New Year's Day" }],
    [d(1, 6), { pl: 'Święto Trzech Króli', en: 'Epiphany' }],
    [w, { pl: 'Wielkanoc', en: 'Easter Sunday' }],
    [addDays(w, 1), { pl: 'Poniedziałek Wielkanocny', en: 'Easter Monday' }],
    [d(5, 1), { pl: 'Święto Pracy', en: 'Labour Day' }],
    [d(5, 3), { pl: 'Święto Konstytucji 3 Maja', en: 'Constitution Day' }],
    [addDays(w, 49), { pl: 'Zielone Świątki', en: 'Pentecost' }],
    [addDays(w, 60), { pl: 'Boże Ciało', en: 'Corpus Christi' }],
    [d(8, 15), { pl: 'Wniebowzięcie Najświętszej Maryi Panny', en: 'Assumption Day' }],
    [d(11, 1), { pl: 'Wszystkich Świętych', en: "All Saints' Day" }],
    [d(11, 11), { pl: 'Narodowe Święto Niepodległości', en: 'Independence Day' }],
    [d(12, 25), { pl: 'Boże Narodzenie', en: 'Christmas Day' }],
    [d(12, 26), { pl: 'Drugi dzień Bożego Narodzenia', en: 'Second Day of Christmas' }],
  ]);
  if (rok >= 2025) s.set(d(12, 24), { pl: 'Wigilia Bożego Narodzenia', en: 'Christmas Eve' });
  return s;
}

// ---------- semestry ----------
const SEMESTRY: Semestr[] = (((dane as any).semestry ?? []) as any[])
  .map((s) => ({ ...s, poczatek: dzien(s?.poczatek), koniec: dzien(s?.koniec) }) as Semestr)
  .filter((s) => poprawna(s.poczatek) && poprawna(s.koniec) && s.poczatek <= s.koniec)
  .sort((a, b) => (a.poczatek < b.poczatek ? -1 : 1));

export function semestry(): Semestr[] {
  return SEMESTRY;
}

export function nazwaSemestru(s: Semestr, lang: Lang = 'pl'): string {
  return (lang === 'en' && s.nazwa_en) || s.nazwa;
}

const pamiec = new WeakMap<Semestr, Map<string, Dzien>>();

function oblicz(s: Semestr): Map<string, Dzien> {
  const gotowe = pamiec.get(s);
  if (gotowe) return gotowe;
  const wolne = new Map<string, { opis: string; opis_en: string; swieto: boolean }>();
  for (const rok of new Set([Number(s.poczatek.slice(0, 4)), Number(s.koniec.slice(0, 4))])) {
    for (const [d, n] of swietaPanstwowe(rok)) wolne.set(d, { opis: n.pl, opis_en: n.en, swieto: true });
  }
  for (const w of s.wolne ?? []) {
    const od = dzien(w?.od), d0 = dzien(w?.do);
    if (!poprawna(od)) continue;
    const doD = poprawna(d0) && d0 >= od ? d0 : od;
    for (let d = od; d <= doD; d = addDays(d, 1)) {
      const sw = wolne.get(d);
      wolne.set(d, {
        opis: (w.opis || '').trim() || sw?.opis || 'Dzień wolny od zajęć',
        opis_en: (w.opis_en || '').trim() || sw?.opis_en || (w.opis || '').trim() || 'No classes',
        swieto: !!sw?.swieto,
      });
    }
  }
  const zamiany = new Map<string, number>();
  for (const z of s.zamiany ?? []) {
    const d = dzien(z?.data), n = numerDnia(z?.jak_dzien);
    if (poprawna(d) && n) zamiany.set(d, n);
  }
  const wyjatki = new Map<string, Kolor>();
  for (const w of s.wyjatki ?? []) {
    const d = dzien(w?.data), k = kolorZTekstu(w?.kolor);
    if (poprawna(d) && k) wyjatki.set(d, k);
  }
  const licz = [0, 0, 0, 0, 0, 0, 0, 0];
  const wynik = new Map<string, Dzien>();
  for (let d = s.poczatek; d <= s.koniec; d = addDays(d, 1)) {
    const dt = dzienTygodnia(d);
    let plan: number | null = null;
    let wolny: Dzien['wolne'] = null;
    if (zamiany.has(d)) plan = zamiany.get(d)!;
    else if (dt <= 5) {
      if (wolne.has(d)) wolny = wolne.get(d)!;
      else plan = dt;
    }
    let kolor: Kolor | null = null;
    let ktory: number | null = null;
    if (plan) {
      ktory = ++licz[plan];
      kolor = ktory % 2 === 1 ? 'niebieski' : 'pomaranczowy';
    }
    const wyj = wyjatki.get(d);
    if (wyj) kolor = wyj;
    wynik.set(d, { data: d, dzienTygodnia: dt, kolor, plan, ktory, wolne: wyj ? null : wolny, zamiana: zamiany.has(d), wyjatek: !!wyj });
  }
  pamiec.set(s, wynik);
  return wynik;
}

// Wszystkie dni semestru (od początku do końca zajęć), w kolejności.
export function dniSemestru(s: Semestr): Dzien[] {
  return [...oblicz(s).values()];
}

export function semestrDnia(data: string): Semestr | null {
  const d = dzien(data);
  return SEMESTRY.find((s) => s.poczatek <= d && d <= s.koniec) ?? null;
}

export function infoDnia(data: string): DzienSemestru | null {
  const s = semestrDnia(data);
  if (!s) return null;
  const d = oblicz(s).get(dzien(data));
  return d ? { ...d, semestr: s } : null;
}

// Kolor dnia albo null (brak zajęć lub dzień poza semestrami w danych).
export function kolorDnia(data: string): Kolor | null {
  return infoDnia(data)?.kolor ?? null;
}

// Najbliższy dzień zajęć po podanej dacie (albo od niej, gdy wlacznie = true).
export function najblizszyDzienZajec(data: string, wlacznie = false): DzienSemestru | null {
  const d0 = dzien(data);
  for (const s of SEMESTRY) {
    if (s.koniec < d0) continue;
    for (const d of oblicz(s).values()) {
      if ((wlacznie ? d.data >= d0 : d.data > d0) && d.kolor) return { ...d, semestr: s };
    }
  }
  return null;
}

// Liczba dni zajęć według dnia planu (1–5) — do kontroli (zwykle 15 każdego dnia).
export function statystykiSemestru(s: Semestr) {
  const plan = [0, 0, 0, 0, 0, 0];
  let niebieskie = 0, pomaranczowe = 0;
  for (const d of oblicz(s).values()) {
    if (!d.kolor) continue;
    if (d.plan) plan[d.plan]++;
    if (d.kolor === 'niebieski') niebieskie++;
    else pomaranczowe++;
  }
  return { plan, niebieskie, pomaranczowe, razem: niebieskie + pomaranczowe };
}

// Dni wolne od zajęć (pon–pt) w okresie zajęć, zgrupowane w zakresy (weekendy w środku nie przerywają zakresu).
export function wolneSemestru(s: Semestr): { od: string; do: string; opis: string; opis_en: string; swieto: boolean }[] {
  const out: { od: string; do: string; opis: string; opis_en: string; swieto: boolean }[] = [];
  let ost: Dzien | null = null;
  for (const d of oblicz(s).values()) {
    if (d.wolne) {
      const g = out[out.length - 1];
      if (g && ost && ost.wolne && g.opis === d.wolne.opis) g.do = d.data;
      else out.push({ od: d.data, do: d.data, opis: d.wolne.opis, opis_en: d.wolne.opis_en, swieto: d.wolne.swieto });
      ost = d;
    } else if (d.kolor || d.dzienTygodnia <= 5) {
      ost = null;
    }
  }
  return out;
}

export function zamianySemestru(s: Semestr): Dzien[] {
  return dniSemestru(s).filter((d) => d.zamiana && d.plan);
}

// ---------- napisy ----------
export function nazwaDnia(n: number, lang: Lang = 'pl'): string {
  return lang === 'en' ? DNI_EN[n] : DNI_PL[n];
}

// „zajęcia środowe” / „Wednesday classes”
export function opisZamiany(plan: number, lang: Lang = 'pl'): string {
  return lang === 'en' ? `${DNI_EN[plan]} classes` : `zajęcia ${DNI_PL_PRZYM[plan]}`;
}

// „jak w środę” / „as on Wednesday”
export function jakWDniu(plan: number, lang: Lang = 'pl'): string {
  return lang === 'en' ? `as on ${DNI_EN[plan]}` : `jak ${DNI_PL_JAK[plan]}`;
}

// „pon. 26 paź” / „Mon 26 Oct”
export const krotkaData = (d: string, lang: Lang = 'pl') => `${dayShort(d, lang)} ${dayNum(d)} ${monthShort(d, lang)}`;
const porzadkowy = (n: number) => {
  const r = n % 100;
  return `${n}${r >= 11 && r <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};

export interface TekstDnia {
  data: string;
  kolor: Kolor | null; // kolor dzisiejszego dnia (null = brak zajęć)
  zamiana: number | null; // dziś zamiana dni: według planu którego dnia (1–5), inaczej null
  litera: string; // napis w kółku: skrót dnia planu przy zamianie („ŚR”), „–” bez zajęć, inaczej pusty
  tytul: string; // np. „Dziś: dzień niebieski” albo „Dziś zajęcia jak w środę”
  opis: string; // krótki dopisek (kafelek)
  opisDlugi: string; // pełne zdanie (strona Rok akademicki)
  nastepny: DzienSemestru | null;
  nastepnyKolor: Kolor | null;
}

// Wspólne napisy dla kafelka na stronie głównej i strony /studia/rok-akademicki.
export function tekstDnia(data: string, lang: Lang = 'pl'): TekstDnia {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const info = infoDnia(data);
  const nastepny = najblizszyDzienZajec(data);
  const nk = nastepny?.kolor ?? null;
  const opisNast = nastepny && nk
    ? T(`Następny dzień zajęć: ${krotkaData(nastepny.data, lang)} — ${NAZWA_KOLORU.pl[nk]}`, `Next class day: ${krotkaData(nastepny.data, lang)} — ${NAZWA_KOLORU.en[nk]}`)
      + (nastepny.zamiana && nastepny.plan ? ` (${jakWDniu(nastepny.plan, lang)})` : '')
    : '';
  const dlugiNast = nastepny && nk
    ? T(`Następny dzień zajęć: ${longWithDay(nastepny.data, lang)} — dzień ${NAZWA_KOLORU.pl[nk]}`, `Next class day: ${longWithDay(nastepny.data, lang)} — ${NAZWA_KOLORU.en[nk]} day`)
      + (nastepny.zamiana && nastepny.plan ? ` (${opisZamiany(nastepny.plan, lang)})` : '') + '.'
    : '';
  if (info?.kolor) {
    const k = info.kolor;
    const zam = info.zamiana && info.plan ? info.plan : null;
    const nazwaK = T(`dzień ${NAZWA_KOLORU.pl[k]}`, `${NAZWA_KOLORU.en[k]} day`);
    const ktory = info.plan && info.ktory
      ? T(`${nazwaDnia(info.plan, 'pl')[0].toUpperCase()}${nazwaDnia(info.plan, 'pl').slice(1)} występuje w semestrze po raz ${info.ktory}.`, `The ${porzadkowy(info.ktory)} ${nazwaDnia(info.plan, 'en')} of the semester.`)
      : '';
    return {
      data, kolor: k, zamiana: zam, litera: zam ? SKROT_PLANU[lang][zam] : '', nastepny, nastepnyKolor: nk,
      tytul: zam ? T(`Dziś zajęcia ${jakWDniu(zam, 'pl')}`, `Today: ${DNI_EN[zam]} timetable`) : T(`Dziś: dzień ${NAZWA_KOLORU.pl[k]}`, `Today: ${NAZWA_KOLORU.en[k]} day`),
      opis: zam ? `${krotkaData(data, lang)} · ${nazwaK}` : krotkaData(data, lang),
      opisDlugi: [
        zam ? T(`Zamiana dni: dziś zajęcia odbywają się według planu ${DNI_PL_DOP[zam]}. To ${nazwaK}.`, `Day swap: today classes follow the ${DNI_EN[zam]} timetable. It is ${k === 'pomaranczowy' ? 'an' : 'a'} ${nazwaK}.`) : '',
        ktory,
        dlugiNast,
      ].filter(Boolean).join(' '),
    };
  }
  const brak = !nastepny;
  const powod = info?.wolne ? T(info.wolne.opis, info.wolne.opis_en) : '';
  return {
    data, kolor: null, zamiana: null, litera: '–', nastepny, nastepnyKolor: nk,
    tytul: brak ? T('Kalendarz zajęć', 'Class calendar') : T('Dziś brak zajęć', 'No classes today'),
    opis: brak ? T('Brak danych o kolejnym semestrze', 'No data for the next semester') : opisNast,
    opisDlugi: brak
      ? T('Brak danych o kolejnym semestrze.', 'No data for the next semester yet.')
      : [powod ? `${powod}.` : '', dlugiNast].filter(Boolean).join(' '),
  };
}

// ---------- automatyczne aktualności o zamianach dni ----------
// Dla każdej zamiany z kolory-dni.json powstaje ogłoszenie widoczne na listach aktualności od dnia, który jest
// N dni roboczych przed zamianą (domyślnie 5), do dnia zamiany włącznie. Strona jest statyczna i przebudowuje się
// 2× dziennie, więc widoczność liczy się podczas budowania (today() z daty.ts). Tekst — szablon z pola „aktualnosci”.
export interface SzablonAktualnosci {
  wlaczone: boolean;
  dni_robocze_przed: number;
  tytul: string;
  tytul_en: string;
  tresc: string;
  tresc_en: string;
}

export const DOMYSLNY_SZABLON: SzablonAktualnosci = {
  wlaczone: true,
  dni_robocze_przed: 5,
  tytul: 'Zamiana dni: {w_dniu} {data} zajęcia {jak_w_dniu}',
  tytul_en: 'Day swap on {dzien_tygodnia}, {data}: {plan_dnia} timetable',
  tresc: '{W_dniu}, {data} r., obowiązuje zamiana dni: zostaną przeprowadzone zajęcia według planu {plan_dnia}. Będzie to dzień {kolor}.',
  tresc_en: '{W_dniu}, {data}, the days are swapped: classes will follow the {plan_dnia} timetable. Day colour: {kolor}.',
};

const tekst = (v: unknown, dom: string) => (typeof v === 'string' && v.trim() ? v.trim() : dom);

export function szablonAktualnosci(): SzablonAktualnosci {
  const a = ((dane as any).aktualnosci ?? {}) as Record<string, unknown>;
  const n = Number(a.dni_robocze_przed);
  return {
    wlaczone: a.wlaczone !== false && a.wlaczone !== 'false',
    dni_robocze_przed: a.dni_robocze_przed !== '' && a.dni_robocze_przed != null && Number.isFinite(n) ? Math.min(30, Math.max(0, Math.round(n))) : DOMYSLNY_SZABLON.dni_robocze_przed,
    tytul: tekst(a.tytul, DOMYSLNY_SZABLON.tytul),
    tytul_en: tekst(a.tytul_en, DOMYSLNY_SZABLON.tytul_en),
    tresc: tekst(a.tresc, DOMYSLNY_SZABLON.tresc),
    tresc_en: tekst(a.tresc_en, DOMYSLNY_SZABLON.tresc_en),
  };
}

// Dni wolne od zajęć z danych (wszystkie semestry) — nie są dniami roboczymi.
let wolneZDanych: Set<string> | null = null;
const swietaRoku = new Map<number, Map<string, { pl: string; en: string }>>();
function wolnyZDanych(d: string): boolean {
  if (!wolneZDanych) {
    wolneZDanych = new Set();
    for (const s of SEMESTRY) {
      for (const w of s.wolne ?? []) {
        const od = dzien(w?.od), d0 = dzien(w?.do);
        if (!poprawna(od)) continue;
        const doD = poprawna(d0) && d0 >= od ? d0 : od;
        for (let x = od; x <= doD; x = addDays(x, 1)) wolneZDanych.add(x);
      }
    }
  }
  return wolneZDanych.has(d);
}

// Dzień roboczy: poniedziałek–piątek, bez świąt ustawowych i bez dni wolnych od zajęć z danych.
export function dzienRoboczy(d: string): boolean {
  if (dzienTygodnia(d) > 5) return false;
  const rok = Number(d.slice(0, 4));
  if (!swietaRoku.has(rok)) swietaRoku.set(rok, swietaPanstwowe(rok));
  if (swietaRoku.get(rok)!.has(d)) return false;
  return !wolnyZDanych(d);
}

// Pierwszy dzień widoczności: N dni roboczych przed datą (N = 0 → sam dzień zamiany).
export function poczatekOkna(data: string, n: number): string {
  let d = data;
  for (let k = 0; k < n; ) {
    d = addDays(d, -1);
    if (dzienRoboczy(d)) k++;
  }
  return d;
}

// Pola do podstawienia w szablonie. Wielka pierwsza litera w nazwie ({W_dniu}) = wielka litera w tekście.
export function polaZamiany(d: Dzien, lang: Lang = 'pl'): Record<string, string> {
  const dt = d.dzienTygodnia, plan = d.plan ?? dt;
  return {
    data: long(d.data, lang, false),
    dzien_tygodnia: nazwaDnia(dt, lang),
    w_dniu: lang === 'en' ? `on ${DNI_EN[dt]}` : DNI_PL_JAK[dt],
    plan_dnia: lang === 'en' ? DNI_EN[plan] : DNI_PL_DOP[plan],
    jak_w_dniu: jakWDniu(plan, lang),
    kolor: d.kolor ? NAZWA_KOLORU[lang][d.kolor] : '',
  };
}

export function wypelnijSzablon(szablon: string, pola: Record<string, string>): string {
  return szablon.replace(/\{([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż_]+)\}/g, (cale, klucz: string) => {
    const v = pola[klucz.toLowerCase()];
    if (v == null) return cale;
    const p = klucz.charAt(0);
    return p !== p.toLowerCase() ? v.charAt(0).toUpperCase() + v.slice(1) : v;
  });
}

// Zwykły tekst z krótkiego Markdownu (zajawka na kartach aktualności).
const bezMarkdownu = (s: string) =>
  s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`#>]+/g, '').replace(/\s+/g, ' ').trim();

export interface AktualnoscZamiany {
  data: string; // dzień zamiany
  od: string; // pierwszy dzień widoczności na listach
  dzien: Dzien;
  semestr: Semestr;
  tytul: string;
  tresc: string; // Markdown
  zajawka: string; // zwykły tekst (pierwszy akapit)
  wOknie: boolean; // czy w dniu `dzis` widać ją na listach
  href: string;
}

// Wszystkie zamiany dni z danych (daty, rosnąco) — do wygenerowania stron /aktualnosci/zamiana-dni-RRRR-MM-DD.
export function datyZamian(): string[] {
  return [...new Set(SEMESTRY.flatMap((s) => zamianySemestru(s).map((d) => d.data)))].sort();
}

export function aktualnoscZamiany(data: string, lang: Lang, dzis: string): AktualnoscZamiany | null {
  const info = infoDnia(data);
  if (!info || !info.zamiana || !info.plan) return null;
  const sz = szablonAktualnosci();
  const pola = polaZamiany(info, lang);
  const tresc = wypelnijSzablon(lang === 'en' ? sz.tresc_en : sz.tresc, pola);
  const od = poczatekOkna(info.data, sz.dni_robocze_przed);
  const { semestr, ...dz } = info;
  return {
    data: info.data, od, dzien: dz, semestr,
    tytul: wypelnijSzablon(lang === 'en' ? sz.tytul_en : sz.tytul, pola),
    tresc, zajawka: bezMarkdownu(tresc.split(/\n\s*\n/)[0] ?? ''),
    wOknie: sz.wlaczone && od <= dzis && dzis <= info.data,
    href: `/aktualnosci/zamiana-dni-${info.data}`,
  };
}

// Pozycje do list aktualności (format PozycjaListy z src/lib/tresci.ts) — tylko te w oknie widoczności.
export function pozycjeZamianDni(lang: Lang, dzis: string) {
  return datyZamian()
    .map((d) => aktualnoscZamiany(d, lang, dzis))
    .filter((a): a is AktualnoscZamiany => !!a && a.wOknie)
    .map((a) => ({
      rodzaj: 'ogloszenie', tytul: a.tytul, data: a.od, zajawka: a.zajawka, dla: ['studenci', 'pracownicy'],
      href: a.href, wydarzenie: a.data, id: `zam-${a.data}`, pilne: true,
    }));
}

// ---------- „Rok w skrócie”: terminy semestru ----------
export interface WierszTerminow { etykieta: string; wartosc: string; wazne: boolean }

const MIES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// „1.10.2026” / „1 Oct 2026” (w angielskiej dacie twarde spacje — zakres łamie się tylko przy „–”)
export function dataKrotka(d: string, lang: Lang = 'pl'): string {
  const [y, m, dd] = d.split('-').map(Number);
  return lang === 'en' ? `${dd}\u00a0${MIES_EN[m - 1]}\u00a0${y}` : `${dd}.${String(m).padStart(2, '0')}.${y}`;
}
const okres = (od: unknown, d: unknown, lang: Lang): string => {
  const a = dzien(od), b = dzien(d);
  if (!poprawna(a)) return '';
  return poprawna(b) && b !== a ? `${dataKrotka(a, lang)} – ${dataKrotka(b, lang)}` : dataKrotka(a, lang);
};

// Wiersze tabeli terminów semestru; puste pola są pomijane. Zajęcia zawsze z okresu zajęć semestru.
export function terminySemestru(s: Semestr, lang: Lang = 'pl'): WierszTerminow[] {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const t = s.terminy ?? {};
  const przerwy = (t.przerwy ?? []).map((p) => okres(p?.od, p?.do, lang)).filter(Boolean);
  return [
    { etykieta: T('Semestr', 'Semester'), wartosc: okres(t.semestr_od, t.semestr_do, lang), wazne: false },
    { etykieta: T('Uroczysta inauguracja roku', 'Inauguration of the academic year'), wartosc: okres(t.inauguracja, null, lang), wazne: false },
    { etykieta: T('Zajęcia dydaktyczne', 'Classes'), wartosc: okres(s.poczatek, s.koniec, lang), wazne: true },
    { etykieta: T('Sesja egzaminacyjna', 'Exam session'), wartosc: okres(t.sesja_od, t.sesja_do, lang), wazne: true },
    { etykieta: T('Sesja poprawkowa', 'Resit session'), wartosc: okres(t.poprawkowa_od, t.poprawkowa_do, lang), wazne: true },
    { etykieta: T('Przerwa semestralna (wakacje)', 'Semester break (holidays)'), wartosc: przerwy.join(T(' oraz ', ' and ')), wazne: false },
  ].filter((w) => w.wartosc);
}
