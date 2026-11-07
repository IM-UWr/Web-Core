// Kierunek „Założyciele” (dok/estetyka.md): cztery działy, każdy z patronem z czwórki twórców wrocławskiej matematyki,
// własnym kolorem z palety „Lazur i malina” (zlecenie 14; wcześniej „Atramenty”), szkicem twarzy, sygnetem, podpisem i znakiem matematycznym.
// Teksty o patronach są robocze (z prototypu „Założyciele”, wersja 33) — DO SPRAWDZENIA u historyka Instytutu,
// zanim strona trafi do publikacji. Puste pole *_en = strona angielska pokazuje tekst polski. Notki i fakty po angielsku —
// tłumaczenie z audytu wersji angielskiej (dok/en/RAPORT-EN.md, K1–K2; zlecenie 11, zalecenie 12), do sprawdzenia razem z polskimi.
import szkice from '../assets/szkice/szkice.json';
import type { Lang } from './daty';

export type Dzial = 'instytut' | 'nauka' | 'studia' | 'popularyzacja';
export const DZIALY: Dzial[] = ['instytut', 'nauka', 'studia', 'popularyzacja'];

export interface Patron {
  dzial: Dzial;
  nazwa: string; nazwa_en: string;
  adres: string;
  // patron działu
  patron: string; lata: string;
  podpis: string;
  // sala wykładowa nazwana od patrona (sala B = Knaster — do sprawdzenia, w IM jest też zwykła sala A)
  sala: string;
  // notka na banerze działu (1–2 zdania); do sprawdzenia
  notka: string; notka_en: string;
  // krótki fakt (okładka, pod nazwą działu po najechaniu)
  fakt: string; fakt_en: string;
  // hasło działu na okładce strony głównej
  haslo: string; haslo_en: string;
  // znak matematyczny patrona (nagłówki podstron): nazwa twierdzenia i rok, jedno zdanie
  znakNazwa: string; znakNazwa_en: string;
  znakFakt: string; znakFakt_en: string;
  doSprawdzenia: true;
}

export const PATRONI: Record<Dzial, Patron> = {
  instytut: {
    dzial: 'instytut', nazwa: 'Instytut', nazwa_en: 'Institute', adres: '/instytut',
    patron: 'Edward Marczewski', lata: '1907–1976', podpis: 'E. Marczewski', sala: 'EM',
    notka: 'Współtwórca wrocławskiej matematyki, rektor Uniwersytetu w latach 1957–1962. Zabiegał o budowę gmachu Instytutu.',
    notka_en: 'A co-founder of Wrocław mathematics and Rector of the University in 1957–1962. He campaigned for the construction of the Institute building.',
    fakt: 'Pierwszy dyrektor Instytutu.', fakt_en: 'The Institute’s first director.',
    haslo: 'Wrocławska szkoła matematyczna', haslo_en: 'The Wrocław school of mathematics',
    znakNazwa: 'Twierdzenie Szpilrajna, 1930', znakNazwa_en: 'Szpilrajn’s theorem, 1930',
    znakFakt: 'Każdy porządek częściowy rozszerza się do liniowego. Szpilrajn to nazwisko, pod którym publikował Marczewski.',
    znakFakt_en: 'Every partial order extends to a linear order. Szpilrajn is the name under which Marczewski published.',
    doSprawdzenia: true,
  },
  nauka: {
    dzial: 'nauka', nazwa: 'Nauka', nazwa_en: 'Research', adres: '/nauka',
    patron: 'Władysław Ślebodziński', lata: '1884–1972', podpis: 'W. Ślebodziński', sala: 'WS',
    notka: 'Geometra różniczkowy. W 1931 roku wprowadził pochodną Liego, dziś jedno z podstawowych narzędzi geometrii.',
    notka_en: 'A differential geometer. In 1931 he introduced the Lie derivative, now one of the basic tools of geometry.',
    fakt: 'Wprowadził pochodną Liego.', fakt_en: 'Introduced the Lie derivative.',
    haslo: 'Poznaj nasze badania na A+', haslo_en: 'Explore our A+ research',
    znakNazwa: 'Pochodna Liego, 1931', znakNazwa_en: 'Lie derivative, 1931',
    znakFakt: 'Pole wektorów przenoszone wzdłuż przepływu innego pola.',
    znakFakt_en: 'A vector field carried along the flow of another field.',
    doSprawdzenia: true,
  },
  studia: {
    dzial: 'studia', nazwa: 'Studia', nazwa_en: 'Studies', adres: '/studia',
    patron: 'Bronisław Knaster', lata: '1893–1980', podpis: 'B. Knaster', sala: 'B',
    notka: 'Topolog, autor twierdzenia Knastera–Tarskiego o punkcie stałym. Wychował pokolenia wrocławskich matematyków.',
    notka_en: 'A topologist and co-author of the Knaster–Tarski fixed-point theorem. He trained generations of Wrocław mathematicians.',
    fakt: 'Topolog, oddany dydaktyce.', fakt_en: 'A topologist devoted to teaching.',
    haslo: 'Studiuj matematykę we Wrocławiu', haslo_en: 'Study mathematics in Wrocław',
    znakNazwa: 'Kontinuum Knastera, 1922', znakNazwa_en: 'Knaster continuum, 1922',
    znakFakt: 'Nierozkładalne: nie jest sumą dwóch mniejszych kontinuów.',
    znakFakt_en: 'Indecomposable: it is not the union of two smaller continua.',
    doSprawdzenia: true,
  },
  popularyzacja: {
    dzial: 'popularyzacja', nazwa: 'Popularyzacja', nazwa_en: 'Outreach', adres: '/popularyzacja',
    patron: 'Hugo Steinhaus', lata: '1887–1972', podpis: 'H. Steinhaus', sala: 'HS',
    notka: 'Współtwórca szkoły lwowskiej i wrocławskiej, mistrz matematycznego aforyzmu i popularyzacji.',
    notka_en: 'A co-founder of the Lwów and Wrocław schools of mathematics, and a master of the mathematical aphorism and of popularisation.',
    fakt: '„Między duchem a materią pośredniczy matematyka”.', fakt_en: '“Mathematics mediates between mind and matter.”',
    haslo: 'Matematyka dla wszystkich ciekawych', haslo_en: 'Mathematics for the curious',
    znakNazwa: 'Kanapka z szynką, 1938', znakNazwa_en: 'Ham sandwich theorem, 1938',
    znakFakt: 'Jedna prosta przepoławia naraz obie figury.',
    znakFakt_en: 'A single line bisects both shapes at once.',
    doSprawdzenia: true,
  },
};

// Skróty nazw w listach (dok/estetyka.md, 01:47): „SIAD” zamiast pełnej nazwy, żeby zajmowała jedną linię; pełna nazwa
// zostaje w tekstach i w podpowiedzi (title) po najechaniu.
const SKROTY: Record<string, string> = {
  'Sztuczna inteligencja w analizie danych': 'SIAD',
  'Artificial Intelligence in Data Analysis': 'SIAD',
  'Artificial intelligence in data analysis': 'SIAD',
};
export const skrotNazwy = (nazwa: string): string | undefined => SKROTY[nazwa.trim()];

export const pole = (p: Patron, k: 'nazwa' | 'notka' | 'fakt' | 'haslo' | 'znakNazwa' | 'znakFakt', lang: Lang): string =>
  (lang === 'en' && (p as any)[`${k}_en`]) || p[k];

// Dział strony po pierwszym członie adresu (bez /en). Aktualności, kalendarz i strony ogólne nie mają działu (granat).
const CZLONY: Record<string, Dzial> = {
  instytut: 'instytut', pracownicy: 'instytut', 'warto-wiedziec': 'instytut',
  nauka: 'nauka', seminaria: 'nauka', 'obrony-doktorskie': 'nauka',
  studia: 'studia', popularyzacja: 'popularyzacja',
};
// Dział wpisu aktualności (pola „Dział” w CMS jeszcze nie ma; zlecenie 18, punkt 9): kolor, etykieta i zastępczy sygnet na drugim ekranie
// strony głównej. Najpierw rodzaj wpisu, dopiero potem odbiorcy, bo prawie każdy wpis jest „dla studentów”:
// 1. sukces, obrona → Nauka; 2. kariera → Studia; 3. wydarzenie: pierwszym odbiorcą kandydaci → Popularyzacja, inaczej Nauka;
// 4. pozostałe: studenci lub kandydaci → Studia; wpisany zakład → Nauka; reszta → Instytut.
export function dzialWpisu(p: { rodzaj: string; dla: string[]; zaklad?: string }): Dzial {
  if (p.rodzaj === 'sukces' || p.rodzaj === 'obrona') return 'nauka';
  if (p.rodzaj === 'kariera') return 'studia';
  if (p.rodzaj === 'wydarzenie') return p.dla[0] === 'kandydaci' ? 'popularyzacja' : 'nauka';
  if (p.dla.some((x) => x === 'studenci' || x === 'kandydaci')) return 'studia';
  return p.zaklad ? 'nauka' : 'instytut';
}

// Listy w stylu Aktualności (zlecenie 27, punkty 1–2): baner bez działu (bez sygnetu i ciekawostki), w którym granat przechodzi w zdjęcie
// Aktualności w naturalnych kolorach — lista i wpisy Aktualności, listy Kalendarza, Obron doktorskich i „Warto wiedzieć”.
// strona: ścieżka bez /en i bez końcowego „/” (np. '/kalendarz').
export const banerAktualnosci = (strona: string): boolean => /^\/(aktualnosci(\/|$)|kalendarz$|warto-wiedziec$)/.test(strona);

export function dzialZeSciezki(sciezka: string): Dzial | undefined {
  const czlon = sciezka.replace(/^\/en(?=\/|$)/, '').split('/').filter(Boolean)[0] ?? '';
  return CZLONY[czlon];
}

// Dział wiersza wydarzenia (kolumna „Nadchodzące wydarzenia” na stronie głównej, „Najbliższe wydarzenia” na wpisie o wydarzeniu; zlecenie 21, punkt 6):
// obrona i konferencja → Nauka, termin → Studia, wydarzenie → dział jego wpisu, reszta (referat) z adresu; adres poza stronę nie ma działu.
export function dzialWydarzenia(w: { rodzaj: string; href?: string }, wpis?: { rodzaj: string; dla: string[]; zaklad?: string }): Dzial | undefined {
  if (w.rodzaj === 'obrona' || w.rodzaj === 'konferencja') return 'nauka';
  if (w.rodzaj === 'termin') return 'studia';
  if (wpis) return dzialWpisu(wpis);
  return w.href ? dzialZeSciezki(w.href) : undefined;
}

// ---------- szkice (src/assets/szkice/szkice.json: wyciąg z plików SVG w tym samym folderze, jak w prototypie) ----------
// k — kontur (kreski w kolejności rysowania), dt — detale (pojawiają się), s — sygnet (uproszczony szkic),
// p — podpis: vb (viewBox), o (obrys atramentu ze skanu), pr (niewidoczne linie prowadzące, maska odsłaniająca obrys)
type Szkic = { k: string[]; dt: string[]; s: string[]; p: { vb: [number, number]; o: string; pr: string[] } };
export const SZKICE = szkice as unknown as Record<Dzial, Szkic>;

// ---------- znaki matematyczne (liczone dokładnie, jak w prototypie; viewBox 0 0 200 240) ----------
export type Kreska = { d: string; gruba?: boolean };
const f1 = (v: number) => Math.round(v * 10) / 10;

function znakKnaster(): Kreska[] {
  // kontinuum Knastera („wiadro z rączką”): łuki nad osią o środku 1/2 łączą punkty zbioru Cantora symetryczne względem 1/2,
  // łuki pod osią o środkach 5/(2·3^n) łączą punkty zbioru Cantora z [2/3^n, 1/3^(n−1)]
  const N = 3, kon: number[] = [];
  (function c(a: number, b: number, d: number) { if (d === 0) { kon.push(a, b); return; } const t = (b - a) / 3; c(a, a + t, d - 1); c(b - t, b, d - 1); })(0, 1, N);
  const X = (x: number) => 16 + 168 * x, Y = 146, R = (r: number) => 168 * r, d: string[] = [];
  kon.filter((x) => x < 0.5 - 1e-9).forEach((x) => { const r = 0.5 - x; d.push(`M${f1(X(x))},${Y} A${f1(R(r))},${f1(R(r))} 0 0 1 ${f1(X(1 - x))},${Y}`); });
  for (let n = 1; n <= N; n++) {
    const s = 5 / (2 * Math.pow(3, n));
    kon.filter((x) => x >= 2 / Math.pow(3, n) - 1e-9 && x < s - 1e-9).forEach((x) => { const r = s - x; d.push(`M${f1(X(x))},${Y} A${f1(R(r))},${f1(R(r))} 0 0 0 ${f1(X(2 * s - x))},${Y}`); });
  }
  return d.map((p) => ({ d: p }));
}

function znakLie(): Kreska[] {
  // pochodna Liego: przepływ pola liniowego A = aI + bJ (spirale) i pole w przeniesione wzdłuż jednej krzywej, w(t) = e^{tA} w
  const a = 0.11, b = 1, cx = 100, cy = 128, s = 62;
  const fl = (p: number[], t: number) => { const e = Math.exp(a * t), c = Math.cos(b * t), si = Math.sin(b * t); return [e * (c * p[0] - si * p[1]), e * (si * p[0] + c * p[1])]; };
  const P = (p: number[]) => [cx + s * p[0], cy - s * p[1]];
  const out: Kreska[] = [];
  [[0.2, 0], [-0.2, 0], [0, 0.2], [0, -0.2]].forEach((p0) => {
    let d = '';
    for (let t = -0.4, k = 0; t <= 14; t += 0.08, k++) { const q = P(fl(p0, t)); if (q[0] < 6 || q[0] > 194 || q[1] < 30 || q[1] > 226) break; d += (k ? 'L' : 'M') + f1(q[0]) + ',' + f1(q[1]); }
    out.push({ d });
  });
  const p0 = [0.62, 0.0], w0 = [0.0, 1];
  for (let t = 0; t <= 5.6; t += 0.8) {
    const q = P(fl(p0, t)), w = fl(w0, t), L = Math.hypot(w[0], w[1]), u = [w[0] / L, -w[1] / L], l = 20;
    const e = [q[0] + u[0] * l, q[1] + u[1] * l], n = [-u[1], u[0]];
    if (q[0] < 10 || q[0] > 190 || q[1] < 34 || q[1] > 222) continue;
    out.push({ d: `M${f1(q[0])},${f1(q[1])} L${f1(e[0])},${f1(e[1])} M${f1(e[0] - u[0] * 6 + n[0] * 4)},${f1(e[1] - u[1] * 6 + n[1] * 4)} L${f1(e[0])},${f1(e[1])} L${f1(e[0] - u[0] * 6 - n[0] * 4)},${f1(e[1] - u[1] * 6 - n[1] * 4)}`, gruba: true });
  }
  return out;
}

export function znakSzpilrajn(kol = 'abedcfgh'): Kreska[] {
  // rozszerzenie porządku: diagram Hassego (krawędzie pokrycia) i krzywa przez wszystkie elementy w kolejności liniowej
  const W: Record<string, [number, number]> = { a: [62, 206], b: [138, 206], c: [36, 152], d: [100, 152], e: [164, 152], f: [68, 98], g: [132, 98], h: [100, 44] };
  const kr = ['ac', 'ad', 'bd', 'be', 'cf', 'df', 'dg', 'eg', 'fh', 'gh'];
  const out: Kreska[] = kr.map((k) => ({ d: `M${W[k[0]][0]},${W[k[0]][1]} L${W[k[1]][0]},${W[k[1]][1]}` }));
  const lin = kol.split('').map((k) => W[k]);
  let d = `M${lin[0][0]},${lin[0][1]}`;
  for (let i = 0; i < lin.length - 1; i++) {
    const p0 = lin[Math.max(0, i - 1)], p1 = lin[i], p2 = lin[i + 1], p3 = lin[Math.min(lin.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${p2[0]},${p2[1]}`;
  }
  out.push({ d, gruba: true });
  Object.values(W).forEach(([x, y]) => out.push({ d: `M${x - 4.5},${y} a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0`, gruba: true }));
  return out;
}

function znakKanapka(): Kreska[] {
  // twierdzenie o kanapce na płaszczyźnie: jedna prosta przepoławia pola obu figur
  type Pt = [number, number];
  const figura = (cx: number, cy: number, r: number, f: (t: number) => number): Pt[] => { const p: Pt[] = []; for (let i = 0; i < 160; i++) { const t = i / 160 * Math.PI * 2; const q = r * f(t); p.push([cx + q * Math.cos(t), cy + q * Math.sin(t)]); } return p; };
  const A = figura(78, 160, 40, (t) => 1 + 0.18 * Math.sin(3 * t) + 0.08 * Math.cos(2 * t));
  const B = figura(128, 86, 33, (t) => 1 + 0.2 * Math.cos(3 * t + 0.4) + 0.07 * Math.sin(5 * t));
  const pole = (p: Pt[]) => { let s = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s) / 2; };
  const tnij = (p: Pt[], n: number[], c: number) => { const o: Pt[] = []; for (let i = 0; i < p.length; i++) { const P = p[i], Q = p[(i + 1) % p.length]; const dp = P[0] * n[0] + P[1] * n[1] - c, dq = Q[0] * n[0] + Q[1] * n[1] - c; if (dp <= 0) o.push(P); if (dp * dq < 0) { const t = dp / (dp - dq); o.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); } } return o; };
  const polowa = (p: Pt[], n: number[]) => { let lo = -400, hi = 400; const cel = pole(p) / 2; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (pole(tnij(p, n, m)) < cel) lo = m; else hi = m; } return (lo + hi) / 2; };
  const roz = (phi: number) => { const n = [Math.cos(phi), Math.sin(phi)]; return polowa(A, n) - polowa(B, n); };
  let lo = 0, hi = Math.PI; const flo = roz(lo);
  for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (Math.sign(roz(m)) === Math.sign(flo)) lo = m; else hi = m; }
  const phi = (lo + hi) / 2, n = [Math.cos(phi), Math.sin(phi)], c = polowa(A, n), t = [-n[1], n[0]], p0 = [n[0] * c, n[1] * c];
  const kraw = (p: Pt[]) => 'M' + p.map((q) => f1(q[0]) + ',' + f1(q[1])).join('L') + 'Z';
  // odcinek prostej przycięty do pola rysunku [12,188]×[34,224]
  let t0 = -1e4, t1 = 1e4;
  ([[t[0], p0[0], 12, 188], [t[1], p0[1], 34, 224]] as number[][]).forEach(([dv, pv, mn, mx]) => {
    if (Math.abs(dv) < 1e-9) return; let a1 = (mn - pv) / dv, a2 = (mx - pv) / dv; if (a1 > a2) [a1, a2] = [a2, a1]; t0 = Math.max(t0, a1); t1 = Math.min(t1, a2); });
  return [{ d: kraw(A) }, { d: kraw(B) }, { d: `M${f1(p0[0] + t[0] * t0)},${f1(p0[1] + t[1] * t0)} L${f1(p0[0] + t[0] * t1)},${f1(p0[1] + t[1] * t1)}`, gruba: true }];
}

// Znak działu. Na podstronach Instytutu rysunek ma inną kolejność liniową („odcisk palca” podstrony, jak Władze w prototypie).
export function znakDzialu(dzial: Dzial, podstrona = false): Kreska[] {
  if (dzial === 'instytut') return znakSzpilrajn(podstrona ? 'badecgfh' : 'abedcfgh');
  if (dzial === 'nauka') return znakLie();
  if (dzial === 'studia') return znakKnaster();
  return znakKanapka();
}

// Pole rysunku znaku (do przycięcia viewBox w wyższym nagłówku: „znak przycięty do własnego rysunku”).
// Liczone z punktów ścieżek (przybliżenie: współrzędne występujące w d, łuki — z promieniem).
export function ramkaZnaku(kreski: Kreska[]): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const dodaj = (x: number, y: number) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const { d } of kreski) {
    // łuki A rx,ry … x,y: oba końce i wierzchołek (środek − promień w górę/dół)
    const luk = /A([\d.]+),([\d.]+) 0 0 ([01]) ([\d.-]+),([\d.-]+)/g;
    let m: RegExpExecArray | null;
    const start = /^M([\d.-]+),([\d.-]+)/.exec(d);
    while ((m = luk.exec(d)) && start) {
      const r = Number(m[1]), xs = Number(start[1]), ys = Number(start[2]), xe = Number(m[4]);
      const cx = (xs + xe) / 2;
      dodaj(cx, m[3] === '1' ? ys - r : ys + r);
    }
    // a4.5,4.5 … (kółka węzłów): środek ± promień
    const kolo = /^M([\d.-]+),([\d.-]+) a([\d.]+),/.exec(d);
    if (kolo) { const x = Number(kolo[1]), y = Number(kolo[2]), r = Number(kolo[3]); dodaj(x, y - r); dodaj(x + 2 * r, y + r); continue; }
    for (const p of d.matchAll(/(?:^|[MLC ])\s*([\d.-]+),([\d.-]+)/g)) dodaj(Number(p[1]), Number(p[2]));
  }
  const m = Math.max(x1 - x0, y1 - y0) * 0.04;
  return [f1(x0 - m), f1(y0 - m), f1(x1 - x0 + 2 * m), f1(y1 - y0 + 2 * m)];
}
