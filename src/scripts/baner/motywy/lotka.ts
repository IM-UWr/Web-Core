// Specjalność „Matematyka stosowana”: układ drapieżnik–ofiara Lotki–Volterry x′ = x(1 − y), y′ = y(x − 1) (prototyp
// animacje-kierunki.html, motyw „lotka”; zaakceptowany 31.10.2026). Pole kierunków (warstwa A) i trzy orbity okresowe wokół
// punktu równowagi (1, 1) — poziomice całki pierwszej H = x − ln x + y − ln y − 2 — z grotem pokazującym kierunek ruchu
// (warstwa B).
// Ruch: przy wejściu pole kierunków się pojawia, a orbity rysują się (6 s, raz). Potem co losową przerwę (2,5–7 s po
// poprzedniej zmianie) jedna orbita powoli rośnie albo maleje (poziom H zmienia się w jej przedziale), najwyżej 1,2 px/s;
// pole kierunków stoi.
// Klatka po przesunięciu orbity o ≥ 0,5 px (najwyżej ok. 2,5 kl./s); w przerwach zegar śpi.
// Pole (zlecenie 07): w prototypie największa możliwa orbita (H = 0,14) wychodziła górą poza pole (w miękką maskę). Tu
// skala pionowa jest dobrana tak, żeby ta orbita z grotem mieściła się w [y0 + 4, y1 − 8]: przy 390 × 844 punkt
// równowagi jest 6 px wyżej niż w prototypie, wykres spłaszczony w pionie do 92% (poziomo bez zmian — orbity, jak
// w prototypie, sięgają prawym bokiem za brzeg treści i tam gasną na ostatnich 14 px, jak w masce prototypu).
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { Anim, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const BUDOWA = 6, POLE = 0.075, ORBITY = 0.15, NR = 96, TEMPO = 1.2, FPS_BUD = 15;
const ZAK = [[0.012, 0.035], [0.045, 0.08], [0.095, 0.14]], START = [0.025, 0.065, 0.12];   // przedziały i start H

const H = (x: number, y: number) => x - Math.log(x) + y - Math.log(y) - 2;
const los = (a: number, b: number) => a + Math.random() * (b - a);
/** pierwiastek y − ln y − 1 = h na przedziale [lo, hi] (bisekcja) */
function pierw(h: number, lo: number, hi: number): number {
  const g = (y: number) => y - Math.log(y) - 1 - h, zn = g(lo) < 0;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if ((g(m) < 0) === zn) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
// zasięg pionowy największej orbity (H = 0,14, przy x = 1) w jednostkach układu
const YG = pierw(0.14, 1, 3), YD = pierw(0.14, 0.2, 1);
const KIER = Array.from({ length: NR }, (_, k) => [Math.cos(2 * Math.PI * k / NR), Math.sin(2 * Math.PI * k / NR)]);

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

const motyw: Fabryka = (G, t0) => {
  // poziomo jak w prototypie (x = 1 w 62% szerokości, x = 1,55 przy prawym brzegu − 6 px); pionowo: orbita H = 0,14
  // od y0 + 7 (grot ±3 px) do y1 − 8
  const w = G.x1 - G.x0, sx = (0.38 * w - 6) / 0.55, Ex = G.x0 + 0.62 * w;
  const g0 = G.y0 + 7, g1 = G.y1 - 8, sy = (g1 - g0) / (YG - YD), Ey = g0 + (YG - 1) * sy;
  // odległość od punktu równowagi do orbity H = h w kierunku d (bisekcja; x, y > 0)
  const promien = (d: number[], h: number) => {
    let hi = 4 * w, lo = 0;
    if (d[0] < 0) hi = Math.min(hi, -sx / d[0] * 0.999);
    if (d[1] > 0) hi = Math.min(hi, sy / d[1] * 0.999);
    for (let it = 0; it < 26; it++) { const m = (lo + hi) / 2; if (H(1 + m * d[0] / sx, 1 - m * d[1] / sy) < h) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const orbita = (h: number) => {
    const P = new Float64Array(2 * NR);
    KIER.forEach((d, k) => { const r = promien(d, h); P[2 * k] = Ex + r * d[0]; P[2 * k + 1] = Ey + r * d[1]; });
    return P;
  };
  // pole kierunków: kreski 7 px co 20 px
  const pole = new Path2D();
  for (let gy = G.y0 + 4; gy < G.y1 - 6; gy += 20) for (let gx = G.x0 + 10; gx < G.x1 - 4; gx += 20) {
    const x = 1 + (gx - Ex) / sx, y = 1 + (Ey - gy) / sy;
    let vx = x * (1 - y) * sx, vy = -y * (x - 1) * sy;
    const L = Math.hypot(vx, vy);
    if (L < 1e-6) continue;
    vx *= 3.5 / L; vy *= 3.5 / L;
    pole.moveTo(gx - vx, gy - vy); pole.lineTo(gx + vx, gy + vy);
  }

  const poz = START.map((h) => new Anim(h));
  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let stoi = false, tZm = (bud ? tB + BUDOWA : t0) + 1.5 + los(2.5, 7), ruch = -1, px = 0, rP = -1;
  const rH = START.slice(), rO = START.map((h) => orbita(h));         // stan z ostatniej klatki

  // jedna orbita do nowego poziomu H w swoim przedziale (co najmniej o ćwierć przedziału); zwraca koniec ruchu
  const zmiana = (s: number) => {
    const i = Math.floor(Math.random() * 3), [lo, hi] = ZAK[i], a = poz[i].cel;
    for (let q = 0; q < 8; q++) {
      const b = lo + Math.random() * (hi - lo);
      if (Math.abs(b - a) < 0.25 * (hi - lo)) continue;
      px = 0;
      for (let k = 0; k < NR; k += 8) px = Math.max(px, Math.abs(promien(KIER[k], a) - promien(KIER[k], b)));
      const d = Math.max(3, px / TEMPO * 1.5);
      poz[i].ustaw(s, b, d); ruch = i; px /= Math.abs(b - a);           // px na jednostkę H
      return s + d;
    }
    return s;
  };
  const obrys = (c: CanvasRenderingContext2D, P: Float64Array, e: number) => {
    const m = Math.ceil(NR * e);
    c.moveTo(P[0], P[1]);
    for (let k = 1; k <= m; k++) c.lineTo(P[2 * (k % NR)], P[2 * (k % NR) + 1]);
  };
  // grot w najwyższym punkcie orbity (tam ruch idzie w lewo: drapieżników najwięcej, ofiar ubywa)
  const grot = (c: CanvasRenderingContext2D, P: Float64Array) => {
    let mi = 0;
    for (let k = 1; k < NR; k++) if (P[2 * k + 1] < P[2 * mi + 1]) mi = k;
    const x = P[2 * mi], y = P[2 * mi + 1];
    c.moveTo(x + 3.5, y - 3); c.lineTo(x - 1.5, y); c.lineTo(x + 3.5, y + 3);
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const p = bud ? Math.min(1, (t - tB) / BUDOWA) : 1;
      if (p >= 1) while (t >= tZm) tZm = zmiana(tZm) + los(2.5, 7);
      const a = p !== rP;
      let b = a, za = p < 1 ? 1 / FPS_BUD : Math.max(0.02, tZm - t);
      if (ruch >= 0) {
        const z = poz[ruch], h = z.w(t);
        if (h !== rH[ruch]) {
          const O = orbita(h), R = rO[ruch];
          let m = 0;
          for (let k = 0; k < 2 * NR; k++) m = Math.max(m, Math.abs(O[k] - R[k]));
          if (m >= 0.5 || (!z.trwa(t) && m > 0.02)) { rH[ruch] = h; rO[ruch] = O; b = true; }
        }
        if (z.trwa(t)) za = Math.min(za, zaKlatka(z.v(t) * px));
      }
      rP = p;
      return { a, b, za };
    },
    // pole kierunków (przy wejściu się pojawia)
    rysuj(c) {
      c.lineWidth = 1; c.strokeStyle = G.rgba(POLE * (rP < 1 ? S(rP / 0.4) : 1)); c.stroke(pole);
      prawyBrzeg(c, G);
    },
    // trzy orbity (przy wejściu obrysowują się od prawego boku), potem groty
    rysujB(c) {
      const e = rP < 1 ? S((rP - 0.33) / 0.67) : 1;
      if (e <= 0) return;
      c.lineWidth = 1.3; c.strokeStyle = G.rgba(ORBITY); c.beginPath();
      for (const O of rO) obrys(c, O, e);
      c.stroke();
      if (e >= 1) { c.lineWidth = 1.1; c.beginPath(); for (const O of rO) grot(c, O); c.stroke(); }
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: pole kierunków, trzy orbity z grotami
    gotowy() { stoi = true; rP = 1; },
  };
};

export default motyw;
