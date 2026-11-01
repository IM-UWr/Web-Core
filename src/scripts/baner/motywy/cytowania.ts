// Publikacje: łuki cytowań nad osią lat (prototyp animacje-badania.html, motyw „cytowania”; zaakceptowany 31.10.2026).
// Na osi, od lewej do prawej, leżą prace z kolejnych lat — w każdym roku tyle kresek, ile prac w wykazie w skali 1 : 20
// (gęstość z wykazów src/data/publikacje/RRRR.json, przez dane z widoku Publikacje.astro). Łuk łączy pracę z wcześniejszą,
// którą „cytuje”; częściej cytowane są prace już cytowane (model Price’a). Cytowania są poglądowe, losowe.
// Budowa raz przy wejściu: łuki rysują się od lewej do prawej jak kolejne lata (ok. 10 s). Potem co kilka sekund rysuje się
// jeden nowy łuk (3 px/s, gdy koniec widać; pod tekstem 70 px/s), a po nim jeden losowy stary łuk gaśnie (5 s).
// Ten sam mechanizm łuków (z innymi węzłami i zdarzeniem) ma motyw „wspolautorzy” — stąd eksport funkcji `luki`.
// Warstwa A — oś, kreski i łuki stojące, warstwa B — łuk, który rośnie albo gaśnie (klatka co 0,75 px drogi, 4 kl./s;
// gaśnięcie — co 5% krycia, 4 kl./s); między zmianami zegar śpi.
// Pole (zlecenie 07): oś 10 px nad dołem pola (maska silnika wygasza ostatnie 12 px), najwyższy łuk ok. 5 px pod górą pola.
import type { Fabryka, Motyw, Pole, Pudlo, Ustawienia } from '../typy';
import { generator, ogr } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 6, przejscie: 60 };

const A = 0.11, OS = 0.05, KRESKI = 0.12, KRESKA = 2, V = 3, VSZ = 70, KROK = 0.75, BUDOWA = 10, V_BUDOWY = 90, FPS_BUDOWY = 15;
const DOL = 10, WYS = 0.95, SKALA = 20;
// ziarno raz na wczytanie strony: nowy układ (obrót telefonu, zmiana rozmiaru) daje ten sam rysunek
const ZIARNO = (Math.random() * 2 ** 32) >>> 0;

type Wezel = { x: number; c: number };
type Luk = { a: number; b: number; pts: Float32Array; cum: Float32Array; K: number; s: number; al: number; start: number; pud: Pudlo };
type Zd = { l: Luk; faza: 'rosnie' | 'gasnie'; ost: number };
export type Uklad = {
  /** węzły na osi (x rosnąco) i początkowe łuki [a, b] — a na prawo od b */
  wezly: (G: Pole, x0: number, x1: number, rnd: () => number) => Wezel[];
  pary: (wezly: Wezel[], rnd: () => number, cytuj: (i: number, r: () => number) => number) => [number, number][];
  /** zdarzenie po przerwie: „cytowanie” (nowy łuk rośnie, potem stary gaśnie i znika) albo „odnowa” (łuk gaśnie i rysuje się od nowa) */
  cytowanie: boolean;
  /** czas gaśnięcia łuku (s) i przerwa między zdarzeniami: min + losowo do max (s) */
  gas: number; przerwa: [number, number];
};

/** wspólny mechanizm łuków nad osią (cytowania, współautorzy) */
export function luki(G: Pole, t0: number, U: Uklad): Motyw {
  const rnd = generator(ZIARNO), X0 = G.x0, X1 = G.x1, Y = G.y1 - DOL, Hm = (Y - G.y0) * WYS;
  const wezly = U.wezly(G, X0, X1, rnd);
  // „cytowanie”: wcześniejsza praca (co najmniej 8 px na lewo) z wagą liczba cytowań + 1
  const cytuj = (i: number, r: () => number) => {
    let s = 0;
    const kand: number[] = [];
    for (let k = 0; k < i; k++) if (wezly[k].x < wezly[i].x - 8) { kand.push(k); s += wezly[k].c + 1; }
    if (!kand.length) return -1;
    let x = r() * s;
    for (const k of kand) { x -= wezly[k].c + 1; if (x <= 0) return k; }
    return kand[kand.length - 1];
  };
  // łuk: połówka elipsy od prawego końca (a) do lewego (b); wysokość jak półokrąg, dla długich łuków spłaszczona
  const luk = (a: number, b: number): Luk => {
    const xa = wezly[a].x, xb = wezly[b].x, cx = (xa + xb) / 2, rx = (xa - xb) / 2, ry = Hm * Math.tanh(rx / Hm);
    const K = ogr(Math.round(rx / 2.5), 8, 48), pts = new Float32Array(2 * (K + 1)), cum = new Float32Array(K + 1);
    for (let k = 0; k <= K; k++) {
      const t = Math.PI * k / K;
      pts[2 * k] = cx + rx * Math.cos(t); pts[2 * k + 1] = Y - ry * Math.sin(t);
      if (k) cum[k] = cum[k - 1] + Math.hypot(pts[2 * k] - pts[2 * k - 2], pts[2 * k + 1] - pts[2 * k - 1]);
    }
    return { a, b, pts, cum, K, s: 0, al: 1, start: 0, pud: [xb - 3, Y - ry - 3, xa + 3, Y + 3] };
  };
  const odwroc = (l: Luk) => {
    const K = l.K, p = new Float32Array(l.pts.length), c = new Float32Array(K + 1);
    for (let k = 0; k <= K; k++) {
      p[2 * k] = l.pts[2 * (K - k)]; p[2 * k + 1] = l.pts[2 * (K - k) + 1];
      if (k) c[k] = c[k - 1] + Math.hypot(p[2 * k] - p[2 * k - 2], p[2 * k + 1] - p[2 * k - 1]);
    }
    l.pts = p; l.cum = c;
  };
  const dl = (l: Luk) => l.cum[l.K];
  const glowa = (l: Luk): [number, number] => {
    let k = 0;
    while (k < l.K && l.cum[k + 1] < l.s) k++;
    if (k >= l.K) return [l.pts[2 * l.K], l.pts[2 * l.K + 1]];
    const f = (l.s - l.cum[k]) / (l.cum[k + 1] - l.cum[k] || 1);
    return [l.pts[2 * k] + (l.pts[2 * k + 2] - l.pts[2 * k]) * f, l.pts[2 * k + 1] + (l.pts[2 * k + 3] - l.pts[2 * k + 1]) * f];
  };
  const widacGlowe = (l: Luk) => { const [x, y] = glowa(l); return G.widac(x, y) > 0.02; };
  const widacLuk = (l: Luk) => { let m = 0; for (let k = 0; k <= l.K; k += 2) m = Math.max(m, G.widac(l.pts[2 * k], l.pts[2 * k + 1])); return m; };
  const sciezka = (c: CanvasRenderingContext2D, l: Luk) => {
    if (l.s <= 0.2) return;
    c.moveTo(l.pts[0], l.pts[1]);
    let k = 1;
    for (; k <= l.K && l.cum[k] <= l.s; k++) c.lineTo(l.pts[2 * k], l.pts[2 * k + 1]);
    if (l.s < dl(l)) { const g = glowa(l); c.lineTo(g[0], g[1]); }
  };
  /** losowy łuk z wagą: stała + widoczność (zdarzenia częściej tam, gdzie je widać) */
  const losujLuk = (lista: Luk[], w0: number) => {
    const wagi = lista.map((l) => w0 + widacLuk(l));
    let x = Math.random() * wagi.reduce((s, w) => s + w, 0), k = 0;
    while (k < lista.length - 1 && (x -= wagi[k]) > 0) k++;
    return lista[k];
  };

  const L: Luk[] = U.pary(wezly, rnd, cytuj).map(([a, b]) => luk(a, b));
  // budowa: łuki zaczynają się od lewej do prawej (według prawego końca), każdy rośnie 90 px/s
  L.forEach((l) => { l.start = (wezly[l.a].x - X0) / Math.max(1, X1 - X0) * (BUDOWA - 3) + rnd() * 0.6; });
  let budowa = t0 <= 0, tPrev = t0, zd: Zd | null = null, ostBud = -1;
  let tNast = t0 + (budowa ? BUDOWA : 0) + 2 + 3 * Math.random();
  if (!budowa) L.forEach((l) => { l.s = dl(l); });

  const przerwa = (t: number) => { tNast = t + U.przerwa[0] + (U.przerwa[1] - U.przerwa[0]) * Math.random(); };
  const zdarzenie = (): Zd | null => {
    if (U.cytowanie) {
      // nowa praca po prawej, tam, gdzie oś widać, cytuje jedną z wcześniejszych
      const Yk = Y - 8, kand: number[] = [];
      wezly.forEach((w, i) => { if (i > 2 && G.widac(w.x, Yk) > 0.3) kand.push(i); });
      if (!kand.length) for (let i = Math.floor(wezly.length * 0.6); i < wezly.length; i++) kand.push(i);
      const a = kand[Math.floor(Math.random() * kand.length)], b = a === undefined ? -1 : cytuj(a, Math.random);
      if (b < 0) return null;
      const l = luk(a, b);
      wezly[b].c++; L.push(l);
      return { l, faza: 'rosnie', ost: 0 };
    }
    return L.length ? { l: losujLuk(L, 0.05), faza: 'gasnie', ost: 1 } : null;
  };

  return {
    krok(t) {
      const dt = Math.max(0, t - tPrev);
      tPrev = t;
      if (budowa) {
        const tb = t - t0;
        let gotowe = true;
        for (const l of L) { if (tb > l.start) l.s = Math.min(dl(l), V_BUDOWY * (tb - l.start)); if (l.s < dl(l)) gotowe = false; }
        if (gotowe && tb > BUDOWA - 3) budowa = false;
        // klatka, gdy łuki urosły w sumie o ≥ 0,5 px
        const suma = L.reduce((s, l) => s + l.s, 0), a = suma - ostBud >= 0.5 || !budowa;
        if (a) ostBud = suma;
        return { a, za: budowa ? 1 / FPS_BUDOWY : Math.max(0.05, tNast - t) };
      }
      if (!zd) {
        if (t < tNast) return { a: false, za: tNast - t };
        zd = zdarzenie();
        if (!zd) { tNast = t + 2; return { a: false, za: 2 }; }
        return { a: true, b: true, za: zd.faza === 'gasnie' ? 0.25 : 0.1 };
      }
      const l = zd.l;
      if (zd.faza === 'gasnie') {
        l.al = Math.max(0, l.al - dt / U.gas);
        if (l.al <= 0) {
          if (U.cytowanie) {
            // stary łuk zgasł: znika z rysunku (tyle samo łuków co przed zdarzeniem)
            L.splice(L.indexOf(l), 1);
            wezly[l.b].c = Math.max(0, wezly[l.b].c - 1);
            zd = null; przerwa(t);
            return { a: true, b: true, za: tNast - t };
          }
          // współautorzy: ten sam łuk rysuje się od nowa, od jednego z końców
          l.al = 1; l.s = 0;
          if (Math.random() < 0.5) odwroc(l);
          zd = { l, faza: 'rosnie', ost: 0 };
          return { a: false, b: true, za: 0.1 };
        }
        const b = Math.abs(l.al - zd.ost) >= 0.05;
        if (b) zd.ost = l.al;
        return { a: false, b, za: 0.25 };
      }
      const w0 = widacGlowe(l);
      l.s = Math.min(dl(l), l.s + (w0 ? V : VSZ) * dt);
      if (l.s >= dl(l)) {
        if (U.cytowanie) {
          // nowy łuk gotowy (przechodzi na warstwę A); jeden losowy inny łuk gaśnie
          const inne = L.filter((q) => q !== l);
          zd = inne.length ? { l: losujLuk(inne, 0.1), faza: 'gasnie', ost: 1 } : null;
          if (!zd) przerwa(t);
          return { a: true, b: true, za: zd ? 0.25 : tNast - t };
        }
        zd = null; przerwa(t);
        return { a: true, b: true, za: tNast - t };
      }
      const w1 = widacGlowe(l), b = (w0 || w1) && l.s - zd.ost >= KROK;
      if (b) zd.ost = l.s;
      return { a: false, b, za: w1 ? KROK / V : 0.1 };
    },
    rysuj(c) {
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(OS);
      c.beginPath(); c.moveTo(X0, Y + 0.5); c.lineTo(X1, Y + 0.5); c.stroke();
      c.strokeStyle = G.rgba(KRESKI);
      c.beginPath();
      for (const w of wezly) { c.moveTo(w.x, Y + 0.5); c.lineTo(w.x, Y - KRESKA); }
      c.stroke();
      c.strokeStyle = G.rgba(A);
      c.beginPath();
      for (const l of L) if (l !== zd?.l) sciezka(c, l);
      c.stroke();
    },
    rysujB(c): Pudlo {
      if (!zd || zd.l.s <= 0.2 || zd.l.al <= 0) return [0, 0, 0, 0];
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(A * zd.l.al);
      c.beginPath(); sciezka(c, zd.l); c.stroke();
      return zd.l.pud;
    },
    gotowy() {
      budowa = false;
      if (zd && U.cytowanie && zd.faza === 'gasnie') { L.splice(L.indexOf(zd.l), 1); }
      zd = null;
      L.forEach((l) => { l.s = dl(l); l.al = 1; });
    },
  };
}

// prace z kolejnych lat: dane z widoku { lata: [rok, liczba prac, rok, liczba, …] } (rosnąco); bez danych — 23 lata po 100 prac
function wezlyLat(G: Pole, x0: number, x1: number, rnd: () => number): Wezel[] {
  const d = (G.dane ?? {}) as { lata?: number[] }, lata: number[] = [];
  if (Array.isArray(d.lata)) for (let i = 1; i < d.lata.length; i += 2) lata.push(Number(d.lata[i]) || 0);
  if (!lata.length) for (let i = 0; i < 23; i++) lata.push(100);
  const sz = (x1 - x0) / lata.length, out: Wezel[] = [];
  lata.forEach((n, k) => { for (let i = 0, m = Math.max(1, Math.round(n / SKALA)); i < m; i++) out.push({ x: x0 + (k + rnd()) * sz, c: 0 }); });
  return out.sort((a, b) => a.x - b.x);
}

// początkowe cytowania: każda praca (od trzeciej) cytuje jedną albo (45%) dwie wcześniejsze
function cytowaniaStartowe(wezly: Wezel[], rnd: () => number, cytuj: (i: number, r: () => number) => number): [number, number][] {
  const out: [number, number][] = [], jest = new Set<string>();
  for (let i = 2; i < wezly.length; i++) {
    for (let q = 0, ile = rnd() < 0.45 ? 2 : 1; q < ile; q++) {
      const j = cytuj(i, rnd);
      if (j >= 0 && !jest.has(i + ',' + j)) { jest.add(i + ',' + j); out.push([i, j]); wezly[j].c++; }
    }
  }
  return out;
}

const motyw: Fabryka = (G, t0) => luki(G, t0, { wezly: wezlyLat, pary: cytowaniaStartowe, cytowanie: true, gas: 5, przerwa: [3, 8] });

export default motyw;
