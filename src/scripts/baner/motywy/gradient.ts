// SIAD (Sztuczna inteligencja w analizie danych): spadek gradientu na poziomicach funkcji straty (prototyp
// animacje-kierunki.html, motyw „gradient”, ustawienia telefonu; zaakceptowany 31.10.2026). Poziomice funkcji
// f = √(1 + u² + v²) − 0,6·exp(−(…)²) — szeroka, obrócona dolina z płytkim minimum lokalnym na lewym zboczu (warstwa A,
// raz) — i ścieżka metody spadku gradientu z momentem (β = 0,5, krok najwyżej 24 px; warstwa B).
// Ruch: nic nie jedzie — co 1,4 s rozjaśnia się (przez 0,9 s) kolejny krok ścieżki; po dojściu do minimum na końcu
// pojawia się kółko, ścieżka stoi 7 s i gaśnie (2,5 s), a po losowej przerwie (2–6 s) następna startuje z losowego,
// widocznego miejsca (czasem utyka w minimum lokalnym). Przy wejściu poziomice wyłaniają się przez 3,5 s (raz).
// Klatka tylko przy widocznej zmianie krycia (≥ 1,5/255), w czasie rozjaśniania najwyżej 6 kl./s; między krokami zegar śpi.
// Pole (zlecenie 07): prototypowe pole (od linku „←” do 12 px nad kreską) to tu [y0 − 2, y1 − 2] — przy 390 × 844
// 10 px niżej u góry i 18 px wyżej u dołu, spłaszczone w pionie do 94%. Ścieżka zostaje w [y0 + 6, y1 − 8] (kropki i kółko
// nad dołem pola); poziomice to tło na całe pole i gasną w masce jak w prototypie. Dolina (oba minima) przesuwa się
// dalej w górę (najwyżej o ćwierć pola), aż kółko w minimum będzie widoczne — przy dwuliniowym tytule SIAD leżałoby pod
// pierwszą linią tytułu (w prototypie też); przy 390 × 844 to 32 px (wersja angielska 36 px), razem 48 px wyżej niż
// w prototypie. Prawy brzeg gaśnie na ostatnich 14 px jak w masce prototypu.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { budowa } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const BUDOWA = 3.5, KROK = 1.4, ROZB = 0.9, TRZYMAJ = 7, GAS = 2.5;      // s
const POZIOM = 0.10, LINIA = 0.26, KROPKA = 0.30, KOLKO = 0.28;            // krycie
const FPS_BUD = 10, FPS = 6, PROG = 1.5 / 255, SIATKA = 3;

/** ścieżka: start T, punkty (x, y kolejno), K kroków; kółko od tKon, gaśnie od tGas, następna od tNast */
type Sciezka = { T: number; p: number[]; K: number; tKon: number; tGas: number; tNast: number };

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

/** marching squares: odcinki poziomic funkcji f na siatce co `krok` px w prostokącie (x0, y0, w, h) */
function poziomice(f: (x: number, y: number) => number, x0: number, y0: number, w: number, h: number, krok: number, poziomy: number[]): Path2D {
  const nx = Math.ceil(w / krok) + 1, ny = Math.ceil(h / krok) + 1, V = new Float64Array(nx * ny), out = new Path2D();
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) V[j * nx + i] = f(x0 + i * krok, y0 + j * krok);
  // krawędzie komórki: 0 — góra, 1 — prawa, 2 — dół, 3 — lewa; przypadki siodłowe (5, 10) rozstrzyga średnia z narożników
  const T: Record<number, number[]> = { 1: [3, 2], 2: [2, 1], 3: [3, 1], 4: [0, 1], 6: [0, 2], 7: [0, 3], 8: [0, 3], 9: [0, 2], 11: [0, 1], 12: [3, 1], 13: [2, 1], 14: [3, 2] };
  for (const L of poziomy) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = V[j * nx + i], b = V[j * nx + i + 1], c = V[(j + 1) * nx + i + 1], d = V[(j + 1) * nx + i];
    const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
    if (idx === 0 || idx === 15) continue;
    const x = x0 + i * krok, y = y0 + j * krok;
    const E = (e: number): [number, number] => e === 0 ? [x + krok * (L - a) / (b - a), y] : e === 1 ? [x + krok, y + krok * (L - b) / (c - b)]
      : e === 2 ? [x + krok * (L - d) / (c - d), y + krok] : [x, y + krok * (L - a) / (d - a)];
    const pary = idx === 5 || idx === 10 ? ((idx === 5) === ((a + b + c + d) / 4 > L) ? [0, 3, 1, 2] : [0, 1, 3, 2]) : T[idx];
    for (let k = 0; k < pary.length; k += 2) { const p = E(pary[k]), r = E(pary[k + 1]); out.moveTo(p[0], p[1]); out.lineTo(r[0], r[1]); }
  }
  return out;
}

const motyw: Fabryka = (G, t0) => {
  // pole prototypu w nowym polu: [y0 − 2, y1 − 2]; ścieżka w [yMin, yMax]
  const xa = G.x0, w = G.x1 - G.x0, ya = G.y0 - 2, h = G.y1 - G.y0, yMin = G.y0 + 6, yMax = G.y1 - 8;
  // minimum doliny (74% szerokości, 60% wysokości) — w górę, aż kółko w nim (promień 3,6 px) będzie dobrze widoczne
  const c1x = xa + 0.74 * w;
  let dy = 0;
  const wid = (y: number) => Math.min(G.widac(c1x, y), G.widac(c1x, y - 5), G.widac(c1x, y + 5));
  while (dy < 0.25 * h && wid(ya + 0.6 * h - dy) < 0.9) dy += 2;
  if (wid(ya + 0.6 * h - dy) < 0.9) dy = 0;
  const c1y = ya + 0.6 * h - dy, s1x = 0.30 * w, s1y = 0.40 * h, C1 = Math.cos(-0.3), S1 = Math.sin(-0.3);
  const c2x = xa + 0.50 * w, c2y = ya + 0.30 * h - dy, s2x = 0.075 * w, s2y = 0.20 * h;
  const f = (x: number, y: number) => {
    const dx = x - c1x, dd = y - c1y, u = (dx * C1 + dd * S1) / s1x, v = (-dx * S1 + dd * C1) / s1y;
    const ex = (x - c2x) / s2x, ey = (y - c2y) / s2y;
    return Math.sqrt(1 + u * u + v * v) - 0.6 * Math.exp(-(ex * ex + ey * ey));
  };
  const grad = (x: number, y: number) => [f(x + 0.5, y) - f(x - 0.5, y), f(x, y + 0.5) - f(x, y - 0.5)];
  let fmin = Infinity, fmax = -Infinity;
  for (let i = 0; i <= 40; i++) for (let j = 0; j <= 20; j++) { const v = f(xa + i * w / 40, ya + j * h / 20); fmin = Math.min(fmin, v); fmax = Math.max(fmax, v); }
  const poz: number[] = [];
  for (let L = fmin + 0.05; L < fmax; L += 0.16) poz.push(L);
  // poziomice to tło na całe pole rysunku (gasną w masce na jego brzegach, jak w prototypie)
  const kontury = poziomice(f, xa, G.y0 - 1, w + SIATKA, G.y1 - G.y0 + 2, SIATKA, poz);

  // nowa ścieżka z losowego miejsca na prawo od tekstu (tam, gdzie strata jest wyraźnie większa od minimum)
  const nowa = (T: number): Sciezka => {
    let p: number[] = [];
    for (let proba = 0; proba < 10 && p.length < 8; proba++) {
      let x = 0, y = 0;
      for (let q = 0; q < 40; q++) {
        y = yMin + 2 + Math.random() * (yMax - yMin - 6);
        const xg = Math.max(G.granica(y) + 36, xa + 0.42 * w);
        x = xg + Math.random() * Math.max(8, G.x1 - 10 - xg);
        if (f(x, y) > fmin + 0.35) break;
      }
      p = [x, y];
      let vx = 0, vy = 0, g = grad(x, y);
      const eta = (13 + 7 * Math.random()) / Math.max(Math.hypot(g[0], g[1]), 1e-6);
      for (let k = 0; k < 30; k++) {
        g = grad(x, y); vx = 0.5 * vx - eta * g[0]; vy = 0.5 * vy - eta * g[1];
        let L = Math.hypot(vx, vy);
        if (L > 24) { vx *= 24 / L; vy *= 24 / L; L = 24; }
        x += vx; y += vy;
        if (x < G.x0 || x > G.x1 || y < yMin || y > yMax) break;
        p.push(x, y);
        if (L < 1.5) break;
      }
    }
    const K = p.length / 2 - 1, tKon = T + K * KROK + ROZB, tGas = tKon + TRZYMAJ;
    return { T, p, K, tKon, tGas, tNast: tGas + GAS + 2 + 4 * Math.random() };
  };

  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let stoi = false, aGot = false, sc = nowa(bud ? t0 + BUDOWA + 0.4 : t0 + 0.5);
  // krycie kroków i kółka na ostatniej klatce (rysujB rysuje dokładnie to, co porównał krok)
  let al = new Float32Array(sc.K + 1), kol = 0, rys: Sciezka | null = null;
  const wyj = (s: Sciezka, t: number) => 1 - S((t - s.tGas) / GAS);
  // czas do następnej zmiany krycia (0 — coś się właśnie rozjaśnia albo gaśnie)
  const cisza = (s: Sciezka, t: number) => {
    const u = t - s.T, k = Math.floor(u / KROK);
    if (u >= 0 && k <= s.K && u - k * KROK < ROZB) return 0;
    if ((t >= s.tKon && t < s.tKon + ROZB) || (t >= s.tGas && t < s.tGas + GAS)) return 0;
    let n = s.tNast;
    if (u < 0) n = s.T; else if (k < s.K) n = s.T + (k + 1) * KROK;
    else if (t < s.tKon) n = s.tKon; else if (t < s.tGas) n = s.tGas;
    return n - t;
  };

  return {
    krok(t) {
      if (stoi) return { a: false, b: false, za: 5 };
      const p = bud ? S((t - tB) / BUDOWA) : 1;
      const a = !aGot;
      if (p >= 1) aGot = true;
      while (t >= sc.tNast) sc = nowa(sc.tNast);
      const o = wyj(sc, t), nAl = new Float32Array(sc.K + 1);
      for (let k = 0; k <= sc.K; k++) nAl[k] = S((t - (sc.T + k * KROK)) / ROZB) * o;
      const nKol = S((t - sc.tKon) / ROZB) * o;
      let b = rys !== sc || Math.abs(nKol - kol) * KOLKO >= PROG;
      for (let k = 0; k <= sc.K && !b; k++) b = Math.abs(nAl[k] - al[k]) * KROPKA >= PROG;
      if (b) { al = nAl; kol = nKol; rys = sc; }
      const c = cisza(sc, t);
      return { a, b, za: !aGot ? 1 / FPS_BUD : c > 0 ? Math.max(0.02, c) : 1 / FPS };
    },
    // poziomice (przy wejściu wyłaniają się przez 3,5 s)
    rysuj(c, t) {
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(POZIOM * (stoi || !bud ? 1 : S((t - tB) / BUDOWA)));
      c.stroke(kontury);
      prawyBrzeg(c, G);
    },
    // ścieżka: odcinki i kropki kolejnych kroków, kółko w minimum
    rysujB(c) {
      if (!rys) return;
      const P = rys.p;
      c.lineWidth = 1.3;
      for (let k = 0; k <= rys.K; k++) {
        const a = al[k];
        if (a < 0.003) continue;
        if (k > 0) { c.strokeStyle = G.rgba(LINIA * a); c.beginPath(); c.moveTo(P[2 * k - 2], P[2 * k - 1]); c.lineTo(P[2 * k], P[2 * k + 1]); c.stroke(); }
        c.fillStyle = G.rgba(KROPKA * a); c.beginPath(); c.arc(P[2 * k], P[2 * k + 1], 1.5, 0, 2 * Math.PI); c.fill();
      }
      if (kol > 0.003) { c.strokeStyle = G.rgba(KOLKO * kol); c.beginPath(); c.arc(P[2 * rys.K], P[2 * rys.K + 1], 3.6, 0, 2 * Math.PI); c.stroke(); }
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: poziomice i jedna cała ścieżka z kółkiem w minimum
    gotowy() { stoi = true; sc = rys = nowa(-1e9); al = new Float32Array(sc.K + 1).fill(1); kol = 1; },
  };
};

export default motyw;
