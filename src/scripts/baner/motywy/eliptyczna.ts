// Seminarium Teorii Modeli / Zakład Algebry i Teorii Modeli: prawo grupowe na krzywej eliptycznej y² = x³ − 2x + 1
// (owal i gałąź; prototyp animacje-struktury.html, „Motyw własny”; zaakceptowany 31.10.2026). Prosta przez P i Q tnie
// krzywą w trzecim punkcie R, a odbicie R względem osi to P + Q (P + Q + R = 0). Wariant „zaklad”: na przemian sieczna
// (P + Q) i styczna (podwojenie 2P).
// Budowa raz przy wejściu (3 s): oś i krzywa rysują się. Potem krzywa stoi (warstwa A), a co 5–12 s nowa, losowa
// konstrukcja w widocznej części (warstwa B): wyłaniają się P i Q (1,2 s), prosta rośnie do R i trochę za nim (3 px/s),
// R (0,8 s), przerywany pionowy odcinek do P + Q (3 px/s), P + Q (1 s), postój 6–10 s i wszystko gaśnie (2,5 s).
// Klatki: wzrost odcinków co 0,75 px (4 kl./s — w prototypie co 0,5 px, czyli 6 kl./s, a prosta rośnie przez większość
// czasu; tak średnia zostaje wyraźnie poniżej 5 kl./s), pojawianie się i gaśnięcie 8 kl./s, w przerwach zegar śpi.
// Pole (zlecenie 07): prototypowe [fy0, fy1] (od linku + 2 px do 12 px nad liczbami) to tu [y0 + 2, y1 − 6] — krzywa
// od y0 + 8 do y1 − 12, nad połową hasła. Przy 390 px i jednoliniowym tytule: 15 px wyżej niż w prototypie, wysokość
// 83% (pole kończy się teraz w połowie hasła, a nie pod nim), przy dwóch liniach tytułu 87%; krzywa jest wykresem —
// spłaszczona tylko w pionie, szerokość jak w prototypie.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { S, generator } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const A = -2, B = 1, XM0 = -1.8, XM1 = 2.15, OS = 0.07, KRZYWA = 0.34, PROSTA = 0.36, PION = 0.32, PQ = 0.66, RR = 0.6, SUMA = 0.85;
const BUDOWA = 3, FPS_BUD = 15, FPS = 8, V = 3, KROK_PX = 0.75, PIERWSZA = 2.5;
const T_PQ = 1.2, T_R = 0.8, T_SUMA = 1, T_GAS = 2.5, ZA_PROSTA = 9;

type Pt = [number, number];
type Q4 = [number, number, number, number];             // x, y na banerze i współrzędne na krzywej
type Konstr = { P: Pt; Q: Pt; R: Pt; S: Pt; A: Pt; B: Pt; dl: number; pion: number; styczna: boolean; box: Pudlo; t: number[] };
const losowo = (a: number, b: number) => a + Math.random() * (b - a);
const f = (x: number) => x * x * x + A * x + B;

const motyw: Fabryka = (G, t0) => {
  const f0 = G.y0 + 2, f1 = G.y1 - 6, h = f1 - f0, x1 = G.x1;
  const alfa = (x: number, y: number) => G.widac(x, y) * S((x1 - x) / 10);
  const prawy = (c: CanvasRenderingContext2D, a: number) => {
    const g = c.createLinearGradient(x1 - 10, 0, x1, 0);
    for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, G.rgba(a * S(1 - i / 4)));
    return g;
  };
  // zasięg w poziomie: od miejsca, gdzie w środkowej części pola rysunek jest już widoczny (160–235 px szerokości)
  let wolne = 0;
  for (let y = f0 + 0.25 * h; y <= f1 - 0.25 * h; y += 4) wolne = Math.max(wolne, G.granica(y));
  const zx1 = x1 - 4, zx0 = Math.max(zx1 - 235, Math.min(zx1 - 160, wolne + 45));
  const sx = (zx1 - zx0) / (XM1 - XM0), sy = (h - 12) / (2 * Math.sqrt(f(XM1))), cy = (f0 + f1) / 2;
  const X = (x: number) => zx0 + (x - XM0) * sx, Y = (y: number) => cy - y * sy;

  // owal (x = środek − promień·cos t, gęściej przy końcach) i gałąź (gęściej przy wierzchołku x = 1)
  const e1 = (-1 - Math.sqrt(5)) / 2, e2 = (-1 + Math.sqrt(5)) / 2, e3 = 1, yy = (x: number) => Math.sqrt(Math.max(0, f(x)));
  const owal: Pt[] = [], gal: Pt[] = [];
  for (let k = 0; k <= 80; k++) { const x = (e1 + e2) / 2 - (e2 - e1) / 2 * Math.cos(Math.PI * k / 80); owal.push([x, yy(x)]); }
  const owalD = owal.slice(0, -1).reverse().map((q): Pt => [q[0], -q[1]]);
  for (let k = 60; k >= 0; k--) { const x = e3 + (XM1 - e3) * (k / 60) ** 2; gal.push([x, -yy(x)]); }
  for (let k = 1; k <= 60; k++) { const x = e3 + (XM1 - e3) * (k / 60) ** 2; gal.push([x, yy(x)]); }
  const galezie: Q4[][] = [owal.concat(owalD), gal].map((g) => g.map((q): Q4 => [X(q[0]), Y(q[1]), q[0], q[1]]));

  // losowa konstrukcja: P i Q (dla stycznej P = Q) w widocznej części krzywej, R i P + Q też widoczne,
  // prosta 40–230 px; rośnie od strony P
  const ok = (px: number, py: number, prog: number) => py > f0 + 8 && py < f1 - 8 && px < x1 - 6 && alfa(px, py) > prog;
  const widoczne = galezie.flat().filter((q) => ok(q[0], q[1], 0.9) && Math.abs(q[3]) > 0.05);
  const losuj = (styczna: boolean, rnd: () => number, t: number): Konstr | null => {
    for (let proba = 0; proba < 80 && widoczne.length > 4; proba++) {
      const P = widoczne[Math.floor(rnd() * widoczne.length)], Q = styczna ? P : widoczne[Math.floor(rnd() * widoczne.length)];
      if (!styczna && Math.hypot(P[0] - Q[0], P[1] - Q[1]) < 34) continue;
      if (!styczna && Math.abs(Q[2] - P[2]) < 1e-3) continue;
      const m = styczna ? (3 * P[2] * P[2] + A) / (2 * P[3]) : (Q[3] - P[3]) / (Q[2] - P[2]);
      const xr = m * m - P[2] - Q[2], yr = P[3] + m * (xr - P[2]);
      const R: Pt = [X(xr), Y(yr)], Sm: Pt = [X(xr), Y(-yr)];
      if (!ok(R[0], R[1], 0.7) || !ok(Sm[0], Sm[1], 0.7) || Math.abs(yr) < 0.15) continue;
      const l = [[P[0], P[1]], [Q[0], Q[1]], R].sort((u, v) => u[0] - v[0]), a = l[0], b = l[2], dl = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (dl < 40 || dl > 230) continue;
      const ux = (b[0] - a[0]) / dl, uy = (b[1] - a[1]) / dl;
      let s: Pt = [a[0] - ux * ZA_PROSTA, a[1] - uy * ZA_PROSTA], e: Pt = [b[0] + ux * ZA_PROSTA, b[1] + uy * ZA_PROSTA];
      if (Math.hypot(P[0] - b[0], P[1] - b[1]) < Math.hypot(P[0] - a[0], P[1] - a[1])) [s, e] = [e, s];
      const D = dl + 2 * ZA_PROSTA, pion = Math.abs(Sm[1] - R[1]);
      // chwile: P i Q, prosta, R, pion, P + Q, postój, gaśnięcie, koniec
      const T = [t];
      [T_PQ, D / V, T_R, pion / V, T_SUMA, losowo(6, 10), T_GAS].forEach((d) => T.push(T[T.length - 1] + d));
      const xs = [s[0], e[0], Sm[0], P[0], Q[0]], ys = [s[1], e[1], Sm[1], R[1], P[1], Q[1]];
      return { P: [P[0], P[1]], Q: [Q[0], Q[1]], R, S: Sm, A: s, B: e, dl: D, pion, styczna, t: T,
        box: [Math.min(...xs) - 5, Math.min(...ys) - 5, Math.max(...xs) + 5, Math.max(...ys) + 5] };
    }
    return null;
  };

  // ---------- czas ----------
  const tB = t0 > 0 ? -1e9 : t0;
  const postep = (t: number) => (stoi ? 1 : Math.min(1, Math.max(0, (t - tB) / BUDOWA)));
  let stoi = false, pOst = -1, k: Konstr | null = null, licznik = 0, syg = '', tNast = Math.max(t0, tB + BUDOWA) + PIERWSZA;
  // stan konstrukcji w chwili t: krycie P i Q, długość prostej, krycie R, długość pionu, krycie P + Q, krycie całości
  const stan = (t: number) => {
    const T = k!.t;
    if (stoi) return { pq: 1, sL: k!.dl, r: 1, sV: k!.pion, s: 1, a: 1 };
    return { pq: S((t - T[0]) / T_PQ), sL: Math.min(k!.dl, Math.max(0, V * (t - T[1]))), r: S((t - T[2]) / T_R),
      sV: Math.min(k!.pion, Math.max(0, V * (t - T[3]))), s: S((t - T[4]) / T_SUMA), a: 1 - S((t - T[6]) / T_GAS) };
  };

  return {
    krok(t) {
      const p = postep(t);
      if (p < 1 || pOst < 1) {
        const a = p !== pOst;
        pOst = p;
        return { a, za: p < 1 ? Math.min(1 / FPS_BUD, Math.max(0.01, tB + BUDOWA - t)) : Math.max(0.05, tNast - t) };
      }
      if (stoi) return { a: false, za: 5 };
      if (k && t >= k.t[7]) { k = null; tNast = t + losowo(5, 12); }
      if (!k && t >= tNast) {
        k = losuj(G.wariant === 'zaklad' && licznik % 2 === 1, Math.random, t);
        if (k) licznik++; else tNast = t + 3;
      }
      let b: boolean, za: number;
      if (!k) { b = syg !== ''; syg = ''; za = Math.max(0.05, tNast - t); }
      else {
        const s = stan(t), T = k.t;
        // sygnatura: przyrost odcinka o 0,75 px albo 1/40 krycia
        const s1 = [s.pq, s.r, s.s, s.a].map((v) => Math.round(v * 40)).join(':') + ':' + Math.floor(s.sL / KROK_PX) + ':' + Math.floor(s.sV / KROK_PX);
        b = s1 !== syg; syg = s1;
        if ((t >= T[1] && t < T[2]) || (t >= T[3] && t < T[4])) za = KROK_PX / V;   // rośnie prosta albo pion
        else if (t >= T[5] && t < T[6]) za = Math.max(0.02, T[6] - t);              // postój
        else za = 1 / FPS;                                                            // wyłanianie się, gaśnięcie
      }
      return { a: false, b, za };
    },
    // oś i krzywa (w budowie — rysowane od końca każdej gałęzi)
    rysuj(c, t) {
      const p = postep(t);
      c.lineWidth = 1; c.strokeStyle = prawy(c, OS * S(p * 2));
      c.beginPath(); c.moveTo(zx0 - 30, cy); c.lineTo(x1, cy); c.stroke();
      c.lineWidth = 1.25; c.strokeStyle = prawy(c, KRZYWA);
      c.beginPath();
      for (const P of galezie) {
        const ile = Math.max(1, Math.round((P.length - 1) * S(p * 1.2)));
        c.moveTo(P[0][0], P[0][1]);
        for (let i = 1; i <= ile; i++) c.lineTo(P[i][0], P[i][1]);
      }
      c.stroke();
    },
    // konstrukcja: prosta, przerywany pion, P, Q, okrąg R i P + Q
    rysujB(c, t): Pudlo {
      if (!k) return [0, 0, 0, 0];
      const s = stan(t), a = s.a;
      if (a <= 0.003) return [0, 0, 0, 0];
      c.lineWidth = 1;
      if (s.sL > 0) {
        const u = s.sL / k.dl;
        c.strokeStyle = G.rgba(PROSTA * a);
        c.beginPath(); c.moveTo(k.A[0], k.A[1]); c.lineTo(k.A[0] + (k.B[0] - k.A[0]) * u, k.A[1] + (k.B[1] - k.A[1]) * u); c.stroke();
      }
      if (s.sV > 0) {
        const u = s.sV / k.pion;
        c.setLineDash([3, 3]); c.strokeStyle = G.rgba(PION * a);
        c.beginPath(); c.moveTo(k.R[0], k.R[1]); c.lineTo(k.R[0], k.R[1] + (k.S[1] - k.R[1]) * u); c.stroke();
        c.setLineDash([]);
      }
      const kropka = (q: Pt, r: number, al: number) => { if (al <= 0.003) return; c.fillStyle = G.rgba(al); c.beginPath(); c.arc(q[0], q[1], r, 0, 2 * Math.PI); c.fill(); };
      kropka(k.P, 2.2, PQ * s.pq * a);
      if (!k.styczna) kropka(k.Q, 2.2, PQ * s.pq * a);
      if (s.r * a > 0.003) { c.strokeStyle = G.rgba(RR * s.r * a); c.beginPath(); c.arc(k.R[0], k.R[1], 2.6, 0, 2 * Math.PI); c.stroke(); }
      kropka(k.S, 2.6, SUMA * s.s * a);
      return k.box;
    },
    // ograniczenie ruchu: jedna gotowa konstrukcja P + Q (powtarzalna — ziarno 7 jak w prototypie; gdy przy tym
    // układzie nic się nie mieści, np. przy dwuliniowym tytule, kolejne ziarna)
    gotowy() {
      stoi = true; k = null;
      for (let z = 7; z < 15 && !k; z++) k = losuj(false, generator(z), 0);
    },
  };
};

export default motyw;
