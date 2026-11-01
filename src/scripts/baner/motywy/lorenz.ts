// Nauka: atraktor Lorenza z kometą (prototyp nauka-lorenz.html v3, ustawienia telefonu; decyzja 31.10.2026: „obłędny”).
// Atraktor (warstwa A) rysowany raz; kometa (warstwa B) jedzie po narysowanej linii, okrążenie skrzydła w 16 s.
// Obrót 5° (lewe skrzydło w miejscu, prawe wyżej); kometa startuje w niewidocznej części i wyjeżdża po ok. 2 s.
// Klatki tylko komety: odstęp zależy od jej chwilowej prędkości (głowa ok. 1 px na klatkę), 10–24 kl./s; klatka pomijana,
// gdy głowa przesunęła się o < 0,3 px. To jedyny motyw, który w spoczynku rysuje stale (wyjątek ze zlecenia 02).
// Zlecenie 08: prawy brzeg atraktora 16 px od prawej krawędzi banera.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { ogr } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 0, przejscie: 60 };

const DT = 0.005, SIG = 10, RHO = 28, BETA = 8 / 3, PRZEJ = 4000, ZSZYW = 40;
const DLUGOSC = 25, TEMPO = 16, OBROT = 5;               // trajektoria (j.c.), s na okrążenie, stopnie
const ATRAKTOR = 0.12, KOMETA = 0.55, OGON = 0.18;       // krycie linii, krycie komety, ogon (część okrążenia)

type Traj = { n: number; h: Float64Array; v: Float64Array; okr: number };
let traj: Traj | null = null;

// σ = 10, ρ = 28, β = 8/3, RK4 z krokiem 0,005; stan przejściowy odrzucony. Pętla: od stanu s0 do chwili, w której
// trajektoria wraca najbliżej s0 (szukamy w oknie 8 j.c. za zadaną długością), ostatnie 0,2 j.c. płynnie przechodzą
// w odcinek tuż przed s0 — kometa wraca bez skoku. Rzut „z góry”: (x + y)/√2 poziomo, (y − x)/√2 pionowo.
function lorenz(T: number): Traj {
  let x = 1, y = 1, z = 1;
  const a = new Float64Array(3), b = new Float64Array(3), c = new Float64Array(3), d = new Float64Array(3);
  const f = (x: number, y: number, z: number, o: Float64Array) => { o[0] = SIG * (y - x); o[1] = x * (RHO - z) - y; o[2] = x * y - BETA * z; };
  const krok = () => {
    const h = DT / 2;
    f(x, y, z, a);
    f(x + h * a[0], y + h * a[1], z + h * a[2], b);
    f(x + h * b[0], y + h * b[1], z + h * b[2], c);
    f(x + DT * c[0], y + DT * c[1], z + DT * c[2], d);
    x += DT / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]);
    y += DT / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]);
    z += DT / 6 * (a[2] + 2 * b[2] + 2 * c[2] + d[2]);
  };
  const nMin = Math.round(T / DT), nMax = nMin + Math.round(8 / DT);
  for (let i = 0; i < PRZEJ - ZSZYW; i++) krok();
  const St = new Float64Array(3 * (ZSZYW + nMax + 1));    // St[m] = stan s_{m − ZSZYW}; s0 to m = ZSZYW
  for (let m = 0; m <= ZSZYW + nMax; m++) { St[3 * m] = x; St[3 * m + 1] = y; St[3 * m + 2] = z; krok(); }
  const o = 3 * ZSZYW;
  let K = nMin, best = Infinity;
  for (let m = nMin; m <= nMax; m++) {
    const p = 3 * (ZSZYW + m), dd = (St[p] - St[o]) ** 2 + (St[p + 1] - St[o + 1]) ** 2 + (St[p + 2] - St[o + 2]) ** 2;
    if (dd < best) { best = dd; K = m; }
  }
  const hh = new Float64Array(K), vv = new Float64Array(K), zz = new Float64Array(K), R2 = Math.SQRT1_2;
  for (let j = 0; j < K; j++) {
    const q = 3 * (ZSZYW + j);
    let X = St[q], Y = St[q + 1], Z = St[q + 2];
    if (j >= K - ZSZYW) {
      const t = (j - (K - ZSZYW)) / ZSZYW, w = t * t * (3 - 2 * t), r = 3 * (ZSZYW + j - K);
      X += (St[r] - X) * w; Y += (St[r + 1] - Y) * w; Z += (St[r + 2] - Z) * w;
    }
    hh[j] = (X + Y) * R2; vv[j] = (Y - X) * R2; zz[j] = Z;
  }
  let maks = 0;                                            // okrążenia skrzydeł = lokalne maksima z
  for (let j = 1; j < K - 1; j++) if (zz[j] > zz[j - 1] && zz[j] >= zz[j + 1]) maks++;
  return { n: K, h: hh, v: vv, okr: K * DT / Math.max(1, maks) };
}

const motyw: Fabryka = (G, t0) => {
  const tr = (traj ??= lorenz(DLUGOSC)), n = tr.n;
  let hmin = Infinity, hmax = -Infinity, vmin = Infinity, vmax = -Infinity, i: number;
  for (i = 0; i < n; i++) { hmin = Math.min(hmin, tr.h[i]); hmax = Math.max(hmax, tr.h[i]); vmin = Math.min(vmin, tr.v[i]); vmax = Math.max(vmax, tr.v[i]); }
  // największy rysunek, który mieści się w wysokości pola i w szerokości banera (16 px od brzegów)
  const s = Math.min((G.y1 - G.y0) / (vmax - vmin), (G.W - 32) / (hmax - hmin));
  const cx = G.W / 2, cy = (G.y0 + G.y1) / 2, hm = (hmin + hmax) / 2, vm = (vmin + vmax) / 2;
  const X = new Float32Array(n), Y = new Float32Array(n);
  for (i = 0; i < n; i++) { X[i] = cx + (tr.h[i] - hm) * s; Y[i] = cy - (tr.v[i] - vm) * s; }
  // obrót wokół środka lewego skrzydła (prawa część wyżej), potem zmniejszenie, jeśli rysunek wyszedłby poza pole
  // (zlecenie 07: od paska menu + 6 px do połowy hasła)
  let px = Infinity;
  for (i = 0; i < n; i++) px = Math.min(px, X[i]);
  px += (cx - px) * 0.5;
  const co = Math.cos(OBROT * Math.PI / 180), si = Math.sin(OBROT * Math.PI / 180);
  let ymin = Infinity, ymax = -Infinity;
  for (i = 0; i < n; i++) {
    const dx = X[i] - px, dy = Y[i] - cy;
    X[i] = px + dx * co + dy * si; Y[i] = cy + dy * co - dx * si;
    ymin = Math.min(ymin, Y[i]); ymax = Math.max(ymax, Y[i]);
  }
  const gora = G.y0;
  const fs = Math.min(1, (cy - gora) / Math.max(1e-6, cy - ymin), (G.y1 - cy) / Math.max(1e-6, ymax - cy));
  if (fs < 1) for (i = 0; i < n; i++) { X[i] = px + (X[i] - px) * fs; Y[i] = cy + (Y[i] - cy) * fs; }
  // zlecenie 08: cały rysunek w poziomie do prawej — najdalszy punkt trajektorii (tej, po której jedzie kometa) na G.x1,
  // 16 px od prawej krawędzi; wielkość, obrót i położenie w pionie bez zmian, lewe skrzydło gasi maska przy tytule
  let xmax = -Infinity;
  for (i = 0; i < n; i++) xmax = Math.max(xmax, X[i]);
  const dx = G.x1 - xmax;
  for (i = 0; i < n; i++) X[i] += dx;
  const sciezka = new Path2D();
  sciezka.moveTo(X[0], Y[0]);
  for (i = 1; i < n; i++) sciezka.lineTo(X[i], Y[i]);
  sciezka.closePath();

  const krokiNaS = (tr.okr / TEMPO) / DT, dl = Math.min(500, OGON * tr.okr / DT);
  // start komety: spośród miejsc, w których trajektoria wychodzi spod tekstu w widoczną część, to, przed którym kometa
  // przez ostatnie ok. 2 s była najmniej widoczna
  const d0 = Math.max(1, Math.round(2 * krokiNaS));
  let u0 = -1, najl = Infinity;
  for (i = d0; i < n; i++) {
    if (G.widac(X[i], Y[i]) > 0.3 && G.widac(X[i - 1], Y[i - 1]) <= 0.3) {
      let mx = 0;
      for (let m = i - d0; m < i; m += 2) mx = Math.max(mx, G.widac(X[m], Y[m]));
      if (mx < najl) { najl = mx; u0 = i - d0; }
    }
  }
  if (u0 < 0) { u0 = 0; for (i = 1; i < n; i++) if (tr.h[i] > tr.h[u0]) u0 = i; }
  // górny limit klatek: w szybszych fragmentach (90. percentyl kroku) głowa idzie o ≤ 1 px na klatkę, najwyżej 24 kl./s
  const kr = new Float32Array(n);
  for (i = 0; i < n; i++) { const j = i + 1 === n ? 0 : i + 1; kr[i] = Math.hypot(X[j] - X[i], Y[j] - Y[i]); }
  kr.sort();
  const fpsMax = [10, 12, 15, 20, 24].filter((f) => f <= Math.max(10, kr[Math.floor(n * 0.9)] * krokiNaS)).pop() ?? 10;

  const P = { x: 0, y: 0 };
  const pkt = (uu: number) => {
    uu %= n; if (uu < 0) uu += n;
    const a = Math.floor(uu), f = uu - a, b = a + 1 === n ? 0 : a + 1;
    P.x = X[a] + (X[b] - X[a]) * f; P.y = Y[a] + (Y[b] - Y[a]) * f;
    return P;
  };
  let u = u0, pierwszy = true, stoi = false, ostX = NaN, ostY = NaN;
  const bx = new Float32Array(512), by = new Float32Array(512);

  return {
    krok(t) {
      u = u0 + (t - t0) * krokiNaS;
      let v = 0;                                           // prędkość teraz i za ok. 0,1 s (żeby nie spóźnić się przy przyspieszaniu)
      for (let k = 0; k <= 1; k++) {
        const a = Math.floor(u + k * krokiNaS * 0.1) % n, b = a + 1 === n ? 0 : a + 1;
        v = Math.max(v, Math.hypot(X[b] - X[a], Y[b] - Y[a]) * krokiNaS);
      }
      const g = pkt(u), rusz = !(Math.abs(g.x - ostX) < 0.3 && Math.abs(g.y - ostY) < 0.3);
      const r = { a: pierwszy, b: rusz, za: 1 / ogr(v, 10, fpsMax) };
      pierwszy = false;
      return r;
    },
    rysuj(c) {
      c.lineWidth = 0.9;
      c.strokeStyle = G.rgba(ATRAKTOR);
      c.stroke(sciezka);
    },
    // kometa: głowa i ogon z ostatnich położeń, w 12 kawałkach coraz słabszy (krycie ~ (1 − t)²) i cieńszy (1,5 → 0,6 px)
    rysujB(c): Pudlo {
      if (stoi) return [0, 0, 0, 0];
      const g = pkt(u), gx = g.x, gy = g.y;
      ostX = gx; ostY = gy;
      let np = 0;
      bx[np] = gx; by[np] = gy; np++;
      const koniec = u - dl;
      for (let k = Math.floor(u); k > koniec && np < 510; k--) { if (k === u) continue; pkt(k); bx[np] = P.x; by[np] = P.y; np++; }
      pkt(koniec); bx[np] = P.x; by[np] = P.y; np++;
      let x0 = gx, x1 = gx, y0 = gy, y1 = gy;
      for (let m = 0; m < np; m++) { x0 = Math.min(x0, bx[m]); x1 = Math.max(x1, bx[m]); y0 = Math.min(y0, by[m]); y1 = Math.max(y1, by[m]); }
      const Gk = Math.min(12, np - 1);
      c.lineCap = 'butt';
      for (let q = 0; q < Gk; q++) {
        const a0 = Math.round(q * (np - 1) / Gk), a1 = Math.round((q + 1) * (np - 1) / Gk), tt = (q + 0.5) / Gk, al = KOMETA * (1 - tt) * (1 - tt);
        if (al < 0.004) continue;
        c.strokeStyle = G.rgba(al);
        c.lineWidth = 1.5 * (1 - 0.6 * tt);
        c.beginPath(); c.moveTo(bx[a0], by[a0]);
        for (let e = a0 + 1; e <= a1; e++) c.lineTo(bx[e], by[e]);
        c.stroke();
      }
      c.fillStyle = G.rgba(KOMETA * 0.16); c.beginPath(); c.arc(gx, gy, 3.6, 0, 2 * Math.PI); c.fill();
      c.fillStyle = G.rgba(KOMETA); c.beginPath(); c.arc(gx, gy, 1.6, 0, 2 * Math.PI); c.fill();
      return [x0 - 6, y0 - 6, x1 + 6, y1 + 6];
    },
    gotowy() { stoi = true; },
  };
};

export default motyw;
