// Specjalność „Analiza danych”: metoda k-średnich (pomysł Hugona Steinhausa, Wrocław 1956, „Sur la division des corps
// matériels en parties”; prototyp animacje-kierunki.html, motyw „kmeans”; zaakceptowany 31.10.2026). Chmura punktów
// (4 grupy po 20), cztery środki grup (kółka) i granice między grupami (podział Woronoja).
// Ruch: przy wejściu punkty pojawiają się (do 3,6 s), potem środki i granice (raz, 6 s). Potem co losową przerwę (2–6 s
// po poprzedniej zmianie) dwa losowe punkty gasną, a dwa nowe pojawiają się w jednej grupie, której „prawdziwy” środek
// lekko dryfuje (napływ danych; 1,8 s). Sekundę później środki idą do nowych średnich (dwa kroki Lloyda), a granice za
// nimi — granice najwyżej ok. 1,4 px/s. Punkty gasną tylko w grupach, w których zostaje ich co najmniej 14 (w prototypie
// z dowolnej — po długim oglądaniu grupa mogłaby zniknąć).
// Klatka po przesunięciu granic o ≥ 0,5 px (granice idą ok. 2,5 razy szybciej niż środki) albo po widocznej zmianie
// krycia punktów (najwyżej 6 kl./s); w przerwach zegar śpi.
// Pole (zlecenie 07): prototypowe pole (od linku „←” do 12 px nad kreską) to tu [y0 − 1, y1 − 2], a punkty leżą
// w [y0 + 5, y1 − 8] (w prototypie 4 px od brzegów pola, w miękkiej masce). Przy 390 × 844 rysunek jest 15 px wyżej niż
// w prototypie, spłaszczony w pionie do 92% (poziomo bez zmian). Granice to linie przez całe pole — gasną w masce na jego
// brzegach, jak w prototypie; prawy brzeg gaśnie na ostatnich 14 px jak w masce prototypu.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S, generator, ogr } from '../wspolne';
import { ZIARNO, budowa, gauss, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const K = 4, NA = 20, MIN_GR = 14, BUDOWA = 6, ROZB = 1.8;
const GRANICE = 0.10, PUNKT = 0.28, SRODEK = 0.32;                     // krycie
const BAZA = [[0.36, 0.34], [0.58, 0.72], [0.75, 0.30], [0.90, 0.70]];  // środki grup (ułamki pola)
const FPS = 6, FPS_BUD = 15, PROG = 1.5 / 255;

type P2 = [number, number];
/** punkt: położenie, grupa, z której pochodzi, pojawia się od tIn, gaśnie od tOut; r — krycie na ostatniej klatce */
type Pkt = { x: number; y: number; g: number; tIn: number; tOut: number; r: number };

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

/** `it` kroków algorytmu Lloyda: przypisz punkty do najbliższych środków, środki — do średnich swoich punktów */
function lloyd(C: P2[], P: Pkt[], it: number): P2[] {
  for (let q = 0; q < it; q++) {
    const sx = C.map(() => 0), sy = C.map(() => 0), ile = C.map(() => 0);
    for (const p of P) {
      let b = 0, bd = Infinity;
      C.forEach((c, i) => { const d = (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2; if (d < bd) { bd = d; b = i; } });
      sx[b] += p.x; sy[b] += p.y; ile[b]++;
    }
    C = C.map((c, i) => (ile[i] ? [sx[i] / ile[i], sy[i] / ile[i]] : c));
  }
  return C;
}

/** krawędzie komórek Woronoja środków C, przycięte do prostokąta R (bez jego brzegów); każda komórka to przecięcie
 *  półpłaszczyzn „bliżej ci niż cj” (Sutherland–Hodgman) */
function granice(C: P2[], R: [number, number, number, number]): Path2D {
  const out = new Path2D();
  C.forEach((ci, i) => {
    let P = [R[0], R[1], R[2], R[1], R[2], R[3], R[0], R[3]];
    C.forEach((cj, j) => {
      if (i === j) return;
      const nx = cj[0] - ci[0], ny = cj[1] - ci[1], c = (cj[0] ** 2 + cj[1] ** 2 - ci[0] ** 2 - ci[1] ** 2) / 2, Q: number[] = [], n = P.length / 2;
      for (let k = 0; k < n; k++) {
        const m = (k + 1) % n, ax = P[2 * k], ay = P[2 * k + 1], bx = P[2 * m], by = P[2 * m + 1];
        const da = nx * ax + ny * ay - c, db = nx * bx + ny * by - c;
        if (da <= 0) Q.push(ax, ay);
        if ((da <= 0) !== (db <= 0)) { const u = da / (da - db); Q.push(ax + u * (bx - ax), ay + u * (by - ay)); }
      }
      P = Q;
    });
    const n = P.length / 2;
    for (let k = 0; k < n; k++) {
      const m = (k + 1) % n, ax = P[2 * k], ay = P[2 * k + 1], bx = P[2 * m], by = P[2 * m + 1];
      const brzeg = (Math.abs(ax - bx) < 0.01 && (Math.abs(ax - R[0]) < 0.01 || Math.abs(ax - R[2]) < 0.01))
        || (Math.abs(ay - by) < 0.01 && (Math.abs(ay - R[1]) < 0.01 || Math.abs(ay - R[3]) < 0.01));
      if (!brzeg) { out.moveTo(ax, ay); out.lineTo(bx, by); }
    }
  });
  return out;
}

const motyw: Fabryka = (G, t0) => {
  const xa = G.x0, w = G.x1 - G.x0, ya = G.y0 - 1, h = G.y1 - 2 - ya, pMin = G.y0 + 5, pMax = G.y1 - 8;
  const R: [number, number, number, number] = [G.x0 - 40, G.y0 - 40, G.x1 + 40, G.y1 + 40];
  const baza: P2[] = BAZA.map(([u, v]) => [xa + u * w, ya + v * h]);
  const sd = [0.05 * w, 0.12 * h], prawdz: P2[] = baza.map((c) => [c[0], c[1]]);
  const losuj = (k: number, r: () => number, tIn: number): Pkt => ({
    x: ogr(prawdz[k][0] + gauss(r) * sd[0], G.x0 + 3, G.x1 - 3), y: ogr(prawdz[k][1] + gauss(r) * sd[1], pMin, pMax),
    g: k, tIn, tOut: Infinity, r: 0,
  });

  const bud = budowa(t0), tB = bud ? t0 : -1e9, los = generator(ZIARNO);
  let pkt: Pkt[] = [];
  for (let k = 0; k < K; k++) for (let q = 0; q < NA; q++) pkt.push(losuj(k, los, tB + 3.6 * los()));
  // środki: przejście od CA do CB od chwili cs przez cd (dl — największe przesunięcie środka w tym przejściu)
  let CA = lloyd(baza, pkt, 10), CB = CA, cs = 0, cd = 0, dl = 0;
  const srodki = (t: number): P2[] => {
    const e = cd > 0 ? S((t - cs) / cd) : 1;
    return CA.map((c, i) => [c[0] + (CB[i][0] - c[0]) * e, c[1] + (CB[i][1] - c[1]) * e]);
  };
  const alfa = (p: Pkt, t: number) => S((t - p.tIn) / ROZB) * (1 - S((t - p.tOut) / ROZB));
  let stoi = false, tZd = (bud ? tB + BUDOWA : t0) + 3 + 4 * Math.random();
  // stan z ostatniej klatki: środki i krycie granic
  let rC: P2[] = CA, rV = bud ? 0 : 1, rysowano = false;

  // napływ danych w chwili s: dryf jednej grupy, dwa punkty gasną, dwa nowe; potem krok Lloyda (od s + 1)
  const zdarzenie = (s: number) => {
    const k = Math.floor(Math.random() * K), b = baza[k];
    prawdz[k] = [ogr(prawdz[k][0] + (Math.random() * 2 - 1) * 8, b[0] - 20, b[0] + 20), ogr(prawdz[k][1] + (Math.random() * 2 - 1) * 6, b[1] - 14, b[1] + 14)];
    const ile = baza.map(() => 0);
    for (const p of pkt) if (p.tOut === Infinity) ile[p.g]++;
    for (let q = 0; q < 2; q++) {
      const ob = pkt.filter((p) => p.tOut === Infinity && p.tIn < s && ile[p.g] > MIN_GR);
      if (!ob.length) break;
      const p = ob[Math.floor(Math.random() * ob.length)];
      p.tOut = s; ile[p.g]--;
    }
    for (let q = 0; q < 2; q++) pkt.push(losuj(k, Math.random, s));
    const C1 = lloyd(CB, pkt.filter((p) => p.tOut === Infinity), 2);
    dl = Math.max(...C1.map((c, i) => Math.hypot(c[0] - CB[i][0], c[1] - CB[i][1])));
    CA = CB; CB = C1; cs = s + 1; cd = Math.max(3, dl * 2.5 / 1.4 * 1.5);
    tZd = cs + Math.max(cd, ROZB) + 2 + 4 * Math.random();
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const p = bud ? (t - tB) / BUDOWA : 1;
      if (p >= 1) while (t >= tZd) zdarzenie(tZd);
      pkt = pkt.filter((q) => q.tOut + ROZB > t);
      const C = srodki(t), eV = bud ? S((t - tB - 3.8) / 2) : 1;
      let a = !rysowano || p < 1 || eV !== rV;
      // środki: przesunięcie granic o ≥ 0,5 px albo dokończenie ruchu
      const kon = t >= cs + cd;
      for (let i = 0; i < K && !a; i++) {
        const d = Math.hypot(C[i][0] - rC[i][0], C[i][1] - rC[i][1]) * 2.5;
        if (d >= 0.5 || (kon && d > 0.02)) a = true;
      }
      // punkty: widoczna zmiana krycia albo dokończenie pojawiania się lub gaśnięcia
      let zmPkt = false;
      for (const q of pkt) {
        const v = alfa(q, t);
        if (Math.abs(v - q.r) * PUNKT >= PROG || ((v === 0 || v === 1) && v !== q.r)) { a = true; zmPkt = true; break; }
      }
      if (a) { rC = C; rV = eV; rysowano = true; for (const q of pkt) q.r = alfa(q, t); }
      // kiedy następna klatka: budowa, gaśnięcie lub pojawianie się punktów, ruch środków, następne zdarzenie
      let za = p < 1 ? 1 / FPS_BUD : Math.max(0.02, tZd - t);
      if (zmPkt || pkt.some((q) => (t >= q.tIn && t < q.tIn + ROZB) || (t >= q.tOut && t < q.tOut + ROZB))) za = Math.min(za, 1 / FPS);
      if (t < cs) za = Math.min(za, Math.max(0.02, cs - t));
      else if (t < cs + cd) { const u = (t - cs) / cd; za = Math.min(za, zaKlatka(2.5 * dl * 6 * u * (1 - u) / cd)); }
      return { a, za };
    },
    // granice Woronoja, punkty, kółka środków
    rysuj(c) {
      if (rV > 0.002) { c.lineWidth = 1; c.strokeStyle = G.rgba(GRANICE * rV); c.stroke(granice(rC, R)); }
      for (const q of pkt) {
        if (q.r < 0.003) continue;
        c.fillStyle = G.rgba(PUNKT * q.r); c.beginPath(); c.arc(q.x, q.y, 1.6, 0, 2 * Math.PI); c.fill();
      }
      if (rV > 0.002) {
        c.lineWidth = 1.3; c.strokeStyle = G.rgba(SRODEK * rV); c.beginPath();
        for (const s of rC) { c.moveTo(s[0] + 3.4, s[1]); c.arc(s[0], s[1], 3.4, 0, 2 * Math.PI); }
        c.stroke();
      }
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: wszystkie punkty, środki po 10 krokach Lloyda, granice
    gotowy() { stoi = true; rC = CB; rV = 1; for (const q of pkt) q.r = 1; },
  };
};

export default motyw;
