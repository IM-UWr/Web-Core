// Specjalność „Matematyka nauczycielska”: okrąg opisany na trójkącie, konstrukcja cyrklem i linijką (Euklides,
// „Elementy”, księga IV, twierdzenie 5; prototyp animacje-kierunki.html, motyw „konstrukcja”; zaakceptowany 31.10.2026).
// Trójkąt, łuki cyrkla (promień 0,66 boku z obu jego końców) wyznaczające symetralne boków, symetralne, środek i okrąg.
// Ruch: przy wejściu konstrukcja rysuje się raz, krok po kroku (9 s): boki, łuki, symetralne, środek, okrąg. Potem co
// losową przerwę (2–6 s po poprzedniej zmianie) jeden wierzchołek przesuwa się o 4–15 px (w prostokącie ±12 × ±9 px wokół
// położenia wyjściowego), a łuki, symetralne i okrąg nadążają jak w programie do geometrii dynamicznej (najszybszy
// element najwyżej ok. 1,2 px/s).
// Klatka po przesunięciu któregoś elementu o ≥ 0,5 px (najwyżej ok. 3 kl./s); w przerwach zegar śpi.
// Pole (zlecenie 07): trójkąt jak w prototypie (te same ułamki jego pola, które było o 10 px wyższe, i to samo zmniejszanie
// o 6%, aż okrąg się w nim zmieści), potem cała konstrukcja — okrąg, łuki i końce symetralnych — przesunięta w górę,
// tak żeby zaczynała się 5 px pod górą pola, a gdy nie kończy się ≥ 6 px nad jego dołem, zmniejszana po 1%. W prototypie
// dolne łuki i koniec symetralnej schodziły pod pole (w miękką maskę), a nowe pole jest o 10 px niższe — stąd skala.
// Przy 390 × 844: środek okręgu 39 px wyżej niż w prototypie, skala 91%; ruchy wierzchołków też trzymają konstrukcję
// w tym pasie. Prawy brzeg gaśnie na ostatnich 14 px jak w masce prototypu.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { Anim, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const BUDOWA = 9, TEMPO = 1.2, FPS_BUD = 15;
const BOKI = 0.18, LUKI = 0.12, SYMETRALNE = 0.085, OKRAG = 0.13, WIERZCHOLKI = 0.28, SRODEK = 0.22;   // krycie
const BAZA: [number, number][] = [[0.56, 0.86], [0.93, 0.76], [0.76, 0.12]];

type P2 = [number, number];
type Bok = { A: P2; B: P2; M: P2; nx: number; ny: number; rc: number; h: number; I1: P2; I2: P2; s0: number; s1: number };
type Geo = { P: P2[]; O: { x: number; y: number; R: number }; boki: Bok[] };

const los = (a: number, b: number) => a + Math.random() * (b - a);

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

/** okrąg opisany (środek i promień) albo null dla punktów współliniowych */
function okrag(P: P2[]) {
  const [ax, ay] = P[0], [bx, by] = P[1], [cx, cy] = P[2];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-9) return null;
  const a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy;
  const x = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d, y = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  return { x, y, R: Math.hypot(ax - x, ay - y) };
}

/** konstrukcja: dla każdego boku środek M, normalna n, promień cyrkla rc, punkty przecięcia łuków I1, I2 (w odległości h
 *  od M) i zasięg symetralnej [s0, s1] wzdłuż n (przez I1, I2 i środek okręgu, 8 px dalej) */
function geo(P: P2[]): Geo | null {
  const O = okrag(P);
  if (!O) return null;
  const boki = P.map((A, i): Bok => {
    const B = P[(i + 1) % 3], L = Math.hypot(B[0] - A[0], B[1] - A[1]), nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
    const M: P2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], rc = 0.66 * L, h = Math.sqrt(rc * rc - L * L / 4);
    const sO = (O.x - M[0]) * nx + (O.y - M[1]) * ny;
    return { A, B, M, nx, ny, rc, h, I1: [M[0] + h * nx, M[1] + h * ny], I2: [M[0] - h * nx, M[1] - h * ny], s0: Math.min(-h, sO) - 8, s1: Math.max(h, sO) + 8 };
  });
  return { P, O, boki };
}

/** zasięg całej konstrukcji [xmin, ymin, xmax, ymax]: okrąg, łuki cyrkla (±0,2 rad wokół I1, I2) i końce symetralnych */
function zasieg(g: Geo): [number, number, number, number] {
  const z: [number, number, number, number] = [g.O.x - g.O.R, g.O.y - g.O.R, g.O.x + g.O.R, g.O.y + g.O.R];
  const dodaj = (x: number, y: number) => { z[0] = Math.min(z[0], x); z[1] = Math.min(z[1], y); z[2] = Math.max(z[2], x); z[3] = Math.max(z[3], y); };
  for (const b of g.boki) {
    dodaj(b.M[0] + b.nx * b.s0, b.M[1] + b.ny * b.s0); dodaj(b.M[0] + b.nx * b.s1, b.M[1] + b.ny * b.s1);
    for (const I of [b.I1, b.I2]) for (const C of [b.A, b.B]) {
      const f = Math.atan2(I[1] - C[1], I[0] - C[0]);
      for (let q = -0.2; q <= 0.201; q += 0.05) dodaj(C[0] + b.rc * Math.cos(f + q), C[1] + b.rc * Math.sin(f + q));
    }
  }
  return z;
}

/** kąty trójkąta w (0,45; 1,85) rad — bez trójkątów zbyt płaskich i zbyt rozwartych */
function katy(P: P2[]): boolean {
  for (let i = 0; i < 3; i++) {
    const A = P[i], B = P[(i + 1) % 3], C = P[(i + 2) % 3], u = [B[0] - A[0], B[1] - A[1]], v = [C[0] - A[0], C[1] - A[1]];
    const k = Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / Math.hypot(u[0], u[1]) / Math.hypot(v[0], v[1]))));
    if (k > 1.85 || k < 0.45) return false;
  }
  return true;
}

const zmniejsz = (P: P2[], k: number): P2[] => {
  const gx = (P[0][0] + P[1][0] + P[2][0]) / 3, gy = (P[0][1] + P[1][1] + P[2][1]) / 3;
  return P.map(([x, y]) => [gx + (x - gx) * k, gy + (y - gy) * k]);
};

const motyw: Fabryka = (G, t0) => {
  // pole prototypu (od linku „←” do 12 px nad kreską): przy tym samym układzie banera [y0 + 8, y1 + 18]
  const w = G.x1 - G.x0, fy0 = G.y0 + 8, fh = G.y1 - G.y0 + 10, g0 = G.y0 + 5, g1 = G.y1 - 6;
  const okProto = (P: P2[]) => {
    const O = okrag(P);
    return !!O && O.R <= 0.49 * fh && O.x + O.R <= G.x1 + 2 && O.y - O.R >= fy0 - 4 && O.y + O.R <= fy0 + fh + 4 && katy(P);
  };
  let baza: P2[] = BAZA.map(([u, v]) => [G.x0 + u * w, fy0 + v * fh]);
  for (let it = 0; it < 30 && !okProto(baza); it++) baza = zmniejsz(baza, 0.94);
  // w górę do g0; gdy cała konstrukcja nie mieści się w [g0, g1] — mniejsza o 1% i znów w górę
  for (let it = 0; ; it++) {
    const z = zasieg(geo(baza)!), dy = g0 - z[1];
    baza = baza.map(([x, y]) => [x, y + dy]);
    if ((z[3] - z[1] <= g1 - g0 && z[2] <= G.x1 + 2) || it >= 60) break;
    baza = zmniejsz(baza, 0.99);
  }
  const okNowy = (P: P2[]) => {
    const g = geo(P);
    if (!g || g.O.R > 0.49 * fh || !katy(P)) return false;
    const z = zasieg(g);
    return z[1] >= g0 - 1 && z[3] <= g1 && z[2] <= G.x1 + 2;
  };

  const wx = baza.map((p) => new Anim(p[0])), wy = baza.map((p) => new Anim(p[1]));
  const punkty = (t: number): P2[] => wx.map((a, i) => [a.w(t), wy[i].w(t)]);
  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let stoi = false, tZm = (bud ? tB + BUDOWA : t0) + 2 + los(2, 6), ruch = -1, rT = -1, rG = geo(baza)!;

  // jeden wierzchołek o 4–15 px (w prostokącie wokół położenia wyjściowego, konstrukcja w polu); koniec ruchu albo s
  const przesun = (s: number) => {
    for (let q = 0; q < 14; q++) {
      const i = Math.floor(Math.random() * 3), b: P2 = [baza[i][0] + (Math.random() * 2 - 1) * 12, baza[i][1] + (Math.random() * 2 - 1) * 9];
      const P: P2[] = wx.map((a, j) => (j === i ? b : [a.cel, wy[j].cel]));
      const dl = Math.hypot(b[0] - wx[i].cel, b[1] - wy[i].cel);
      if (dl < 4 || !okNowy(P)) continue;
      const d = Math.max(3, dl * 1.8 / TEMPO * 1.5);
      wx[i].ustaw(s, b[0], d); wy[i].ustaw(s, b[1], d); ruch = i;
      return s + d;
    }
    return s;
  };
  // największe przesunięcie elementu konstrukcji między dwiema chwilami
  const roznica = (a: Geo, b: Geo) => {
    let m = Math.max(Math.hypot(a.O.x - b.O.x, a.O.y - b.O.y), Math.abs(a.O.R - b.O.R));
    for (let i = 0; i < 3; i++) {
      const p = a.boki[i], q = b.boki[i];
      m = Math.max(m, Math.hypot(a.P[i][0] - b.P[i][0], a.P[i][1] - b.P[i][1]), Math.hypot(p.I1[0] - q.I1[0], p.I1[1] - q.I1[1]), Math.hypot(p.I2[0] - q.I2[0], p.I2[1] - q.I2[1]));
    }
    return m;
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const tau = bud ? Math.min(BUDOWA, t - tB) : BUDOWA;
      if (tau >= BUDOWA) while (t >= tZm) tZm = przesun(tZm) + los(2, 6);
      const g = geo(punkty(t)) ?? rG, trwa = ruch >= 0 && wx[ruch].trwa(t);
      const a = tau !== rT || roznica(g, rG) >= (trwa ? 0.5 : 0.02);
      let za = tau < BUDOWA ? 1 / FPS_BUD : Math.max(0.02, tZm - t);
      if (trwa) za = Math.min(za, zaKlatka(1.8 * Math.hypot(wx[ruch].v(t), wy[ruch].v(t))));
      if (a) { rT = tau; rG = g; }
      return { a, za };
    },
    // boki, łuki cyrkla, symetralne, okrąg, wierzchołki i środek — przy wejściu po kolei
    rysuj(c) {
      const g = rG, tau = Math.max(0, rT);
      let e: number;
      c.lineWidth = 1.3; c.strokeStyle = G.rgba(BOKI);
      g.boki.forEach((b, i) => {
        e = S((tau - 0.7 * i) / 0.8);
        if (e <= 0) return;
        c.beginPath(); c.moveTo(b.A[0], b.A[1]); c.lineTo(b.A[0] + (b.B[0] - b.A[0]) * e, b.A[1] + (b.B[1] - b.A[1]) * e); c.stroke();
      });
      c.lineWidth = 1; c.strokeStyle = G.rgba(LUKI);
      g.boki.forEach((b, i) => {
        e = S((tau - 2.2 - i) / 1);
        if (e <= 0) return;
        c.beginPath();
        for (const C of [b.A, b.B]) for (const I of [b.I1, b.I2]) {
          const f = Math.atan2(I[1] - C[1], I[0] - C[0]) - 0.2;
          c.moveTo(C[0] + b.rc * Math.cos(f), C[1] + b.rc * Math.sin(f)); c.arc(C[0], C[1], b.rc, f, f + 0.4 * e);
        }
        c.stroke();
      });
      c.strokeStyle = G.rgba(SYMETRALNE);
      g.boki.forEach((b, i) => {
        e = S((tau - 5.2 - 0.4 * i) / 0.8);
        if (e <= 0) return;
        c.beginPath(); c.moveTo(b.M[0] + b.nx * b.s0 * e, b.M[1] + b.ny * b.s0 * e); c.lineTo(b.M[0] + b.nx * b.s1 * e, b.M[1] + b.ny * b.s1 * e); c.stroke();
      });
      e = S((tau - 6.8) / 2.2);
      if (e > 0) {
        const f0 = Math.atan2(g.P[2][1] - g.O.y, g.P[2][0] - g.O.x);
        c.lineWidth = 1.2; c.strokeStyle = G.rgba(OKRAG); c.beginPath(); c.arc(g.O.x, g.O.y, g.O.R, f0, f0 + 2 * Math.PI * e); c.stroke();
      }
      c.fillStyle = G.rgba(WIERZCHOLKI * S(tau / 0.5)); c.beginPath();
      for (const p of g.P) { c.moveTo(p[0] + 1.8, p[1]); c.arc(p[0], p[1], 1.8, 0, 2 * Math.PI); }
      c.fill();
      e = S((tau - 6.4) / 0.6);
      if (e > 0) { c.fillStyle = G.rgba(SRODEK * e); c.beginPath(); c.arc(g.O.x, g.O.y, 1.6, 0, 2 * Math.PI); c.fill(); }
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: cała konstrukcja w położeniu wyjściowym
    gotowy() { stoi = true; rT = BUDOWA; rG = geo(baza)!; },
  };
};

export default motyw;
