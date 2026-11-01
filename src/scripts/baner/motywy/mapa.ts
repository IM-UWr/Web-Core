// Kontakt: schematyczna mapa z brzegiem rzeki w zmiennej skali (prototyp animacje-instytut.html, motyw „mapa”;
// zaakceptowany 31.10.2026). Rzeka, most, siatka ulic, szeroka aleja od mostu i znacznik Instytutu (pl. Grunwaldzki 2,
// tuż przy moście Grunwaldzkim) — mapa poglądowa, nie dokładny plan. Jasna smuga wokół brzegów to ε-otoczka linii brzegu.
// Steinhaus zauważył (Length, shape and area, 1954), że zmierzona długość brzegu rzeki rośnie z dokładnością mapy;
// Julian Perkal zaproponował ε-długość i „obiektywną generalizację” linii: szczegóły mniejsze od ε znikają.
// Brzeg to linia środka rzeki ± pół szerokości plus 5 oktaw gładkiego szumu (fale 80, 40, 20, 10, 5 px); szczegółowość D
// włącza kolejne oktawy (waga oktawy j to smoothstep(D − j)), a ε = 2,2 · 2^(3,1 − D) px (1,4–8 px).
// Ruch: przy wejściu (raz) brzeg buduje się od gładkiej linii (D od 0,3 do 3,8 w 9 s), znacznik pojawia się po 6 s. Potem co
// 10–18 s (losowo) brzeg zyskuje albo traci szczegóły (nowe D z 0,8–5, różne o ≥ 1,2) — punkty brzegu idą ok. 1–2 px/s,
// a ε-otoczka zwęża się albo rozszerza. Ulice, most, aleja i znacznik stoją.
// Klatka po zmianie brzegu albo ε o ≥ 0,5 px (ok. 3–4 kl./s w czasie zmiany), przy wejściu 15 kl./s; między zmianami
// zegar śpi.
// Pole (zlecenie 07): mapa przesunięta o 8 px w górę względem prototypu, bez zmiany skali: dawne pole od linku „←” + 2
// do 12 px nad kreską (75–189 px przy 390 × 844) to tu [y0, y1 + 10] (67–181 px). Rzeka, most i znacznik leżą w górnych
// dwóch trzecich pola; ulice i aleja (jak w prototypie) sięgają dołu pola i łagodnie gasną w masce silnika.
import type { Fabryka, Ustawienia } from '../typy';
import { S, generator, ogr } from '../wspolne';
import { budowa } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const ZIARNO = 1954, J = 5, LAM = [80, 40, 20, 10, 5], AMP = [4.4, 2.6, 1.5, 0.9, 0.5];
const D0 = 0.3, D1 = 3.8, BUDOWA = 9, PRZERWA = [10, 18], FPS_BUD = 15;
const SMUGA = 0.05, ULICE = 0.11, ALEJA = 0.17, BRZEG = 0.32, MOST = 0.36, ZNACZNIK = 0.55;

const los = (a: number, b: number) => a + Math.random() * (b - a);
const wagi = (D: number) => LAM.map((_, j) => S(D - j));
/** ε-otoczka (px) przy szczegółowości D */
const eps = (D: number) => ogr(2.2 * Math.pow(2, 3.1 - D), 1.4, 8);

const motyw: Fabryka = (G, t0) => {
  const R = generator(ZIARNO), W = G.W, top = G.y0, h = G.y1 + 10 - G.y0, NX = Math.ceil(W) + 1;
  // środek rzeki i jej szerokość
  const yc = (x: number) => { const u = x / W; return top + h * (0.30 + 0.18 * u) + h * 0.05 * Math.sin(2 * Math.PI * (0.9 * u + 0.15)); };
  const szer = (x: number) => 18 + 3.5 * Math.sin(2 * Math.PI * (1.3 * x / W + 0.4));
  // szum wartości z gładkim przejściem (smootherstep), osobno dla dwóch brzegów
  const OKT: Float32Array[][] = [];
  for (let b = 0; b < 2; b++) {
    OKT.push([]);
    for (let j = 0; j < J; j++) {
      const nk = Math.ceil(W / LAM[j]) + 3, wez: number[] = [];
      for (let q = 0; q < nk; q++) wez.push(R() * 2 - 1);
      const tab = new Float32Array(NX), off = R() * LAM[j];
      for (let x = 0; x < NX; x++) {
        const u = (x + off) / LAM[j], i0 = Math.floor(u);
        let f = u - i0;
        f = f * f * f * (f * (f * 6 - 15) + 10);
        tab[x] = wez[i0] + (wez[i0 + 1] - wez[i0]) * f;
      }
      OKT[b].push(tab);
    }
  }
  const YC = new Float32Array(NX), SZ = new Float32Array(NX);
  for (let x = 0; x < NX; x++) { YC[x] = yc(x); SZ[x] = szer(x); }

  // most i aleja (pl. Grunwaldzki) prostopadle do rzeki, 92 px od prawej krawędzi; t — wzdłuż rzeki, n — w poprzek
  const xB = Math.round(W - 92), t1 = (YC[xB + 1] - YC[xB - 1]) / 2, tl = Math.hypot(1, t1), tx = 1 / tl, ty = t1 / tl, nx = -ty, ny = tx;
  const polS = SZ[xB] / 2, mB = { x: xB, y: YC[xB] };
  const P = (o: { x: number; y: number }, a: number, b: number) => ({ x: o.x + tx * a + nx * b, y: o.y + ty * a + ny * b });
  // siatka ulic: gęstsza na brzegu z aleją, rzadsza na drugim; część odcinków losowo pominięta, wzdłuż alei bez ulicy
  const surowe: { x: number; y: number }[][] = [];
  const o1 = P(mB, 0, polS + 10), du = 21, dv = 24;
  for (let a = -8; a <= 6; a++) for (let c = 0; c <= 6; c++) {
    for (const s of [[P(o1, a * dv, c * du + 6), P(o1, (a + 1) * dv, c * du + 6)], [P(o1, a * dv, c * du + 6), P(o1, a * dv, (c + 1) * du + 6)]]) {
      if (R() < 0.22) continue;
      if (Math.abs((s[0].x - mB.x) * tx + (s[0].y - mB.y) * ty) < 6 && Math.abs((s[1].x - mB.x) * tx + (s[1].y - mB.y) * ty) < 6) continue;
      surowe.push(s);
    }
  }
  const o2 = P(mB, 0, -(polS + 12));
  for (let a = -9; a <= 5; a++) for (let c = 0; c <= 3; c++) {
    for (const s of [[P(o2, a * 27 + 9, -c * 24), P(o2, (a + 1) * 27 + 9, -c * 24)], [P(o2, a * 27 + 9, -c * 24), P(o2, a * 27 + 9, -(c + 1) * 24)]]) {
      if (R() < 0.3) continue;
      surowe.push(s);
    }
  }
  // przycięcie do pola i z dala od rzeki (stały korytarz 10 px od brzegów); na dole do 3 px nad dołem pola
  const ulice: number[][] = [];
  for (const [A, B] of surowe) {
    const kroki = Math.ceil(Math.hypot(B.x - A.x, B.y - A.y) / 2);
    let cur: number[] | null = null;
    for (let m = 0; m <= kroki; m++) {
      const u = m / kroki, X = A.x + u * (B.x - A.x), Y = A.y + u * (B.y - A.y), xi = Math.round(ogr(X, 0, NX - 1));
      const ok = X > -4 && X < G.x1 && Y > G.y0 - 2 && Y < G.y1 - 3 && Math.abs(Y - YC[xi]) > SZ[xi] / 2 + 10;
      if (ok) { if (!cur) { cur = [X, Y, X, Y]; ulice.push(cur); } else { cur[2] = X; cur[3] = Y; } } else cur = null;
    }
  }
  const ulicePath = new Path2D();
  for (const s of ulice) if (Math.hypot(s[2] - s[0], s[3] - s[1]) > 3) { ulicePath.moveTo(s[0], s[1]); ulicePath.lineTo(s[2], s[3]); }
  const pin = P(mB, 13, polS + 17);

  const BRZ = [new Float32Array(NX), new Float32Array(NX)];
  const brzegi = (D: number) => {
    const wg = wagi(D);
    for (let b = 0; b < 2; b++) for (let x = 0; x < NX; x++) {
      let v = 0;
      for (let j = 0; j < J; j++) if (wg[j] > 0) v += wg[j] * AMP[j] * OKT[b][j][x];
      BRZ[b][x] = YC[x] + (b ? 1 : -1) * SZ[x] / 2 + v;
    }
  };

  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let D = bud ? D0 : D1, cel = D, Dr = -9, tPrev = t0, stoi = false, aSr = -1, aPr = -1;
  let tNast = bud ? tB + 12 + los(0, 4) : t0 + los(3, 8);
  const alfaS = (t: number) => (stoi ? 1 : S((t - tB) / 1.2));
  const alfaP = (t: number) => (stoi ? 1 : S((t - tB - 6) / 1.5));
  /** największe przesunięcie punktu brzegu między szczegółowością D0 a D1 (px), z uwzględnieniem ε-otoczki */
  const zmiana = (Da: number, Db: number) => {
    const w1 = wagi(Da), w0 = wagi(Db);
    let z = 0;
    for (let j = 0; j < J; j++) z += AMP[j] * Math.abs(w1[j] - w0[j]);
    return Math.max(z, Math.abs(eps(Da) - eps(Db)));
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const dt = Math.max(0, t - tPrev), tb = t - tB;
      tPrev = t;
      let koniec = false;
      if (tb < BUDOWA) { D = D0 + (D1 - D0) * (1 - Math.cos(Math.PI * tb / BUDOWA)) / 2; cel = D; }
      else {
        if (bud && tb - dt < BUDOWA) { D = cel = D1; koniec = true; }
        if (Math.abs(cel - D) < 1e-3 && t >= tNast) {
          // nowa szczegółowość, wyraźnie inna niż dziś
          for (let g = 0; g < 10; g++) { cel = los(0.8, 5); if (Math.abs(cel - D) > 1.2) break; }
        }
        // tempo w jednostkach D na sekundę: punkty brzegu idą ok. 1–2 px/s (wolniej przy dużych falach)
        const jj = ogr(Math.floor(D), 0, J - 1), st = Math.min(0.6, 1.2 / AMP[jj]) * dt;
        if (Math.abs(cel - D) <= st) { if (D !== cel) { D = cel; koniec = true; tNast = t + los(PRZERWA[0], PRZERWA[1]); } }
        else D += cel > D ? st : -st;
      }
      const aS = alfaS(t), aP = alfaP(t);
      const a = zmiana(D, Dr) >= 0.5 || (koniec && D !== Dr) || Math.abs(aS - aSr) * BRZEG * 255 >= 1 || Math.abs(aP - aPr) * ZNACZNIK * 255 >= 1;
      if (a) { Dr = D; aSr = aS; aPr = aP; }
      if (tb < BUDOWA || aS < 1 || aP < 1) return { a, za: 1 / FPS_BUD };
      if (Math.abs(cel - D) > 1e-3) {
        // klatka co ok. 0,5 px ruchu brzegu
        const j2 = ogr(Math.floor(D), 0, J - 1);
        return { a, za: Math.max(1 / 15, 0.5 / (1.5 * AMP[j2] * Math.min(0.6, 1.2 / AMP[j2]))) };
      }
      return { a, za: Math.max(0.05, tNast - t) };
    },
    rysuj(c, t) {
      const aS = alfaS(t), aP = alfaP(t), e = eps(D);
      brzegi(D);
      c.lineCap = 'round'; c.lineJoin = 'round';
      // ε-otoczka brzegów (Perkal): smuga szeroka na 2ε
      c.strokeStyle = G.rgba(SMUGA * aS); c.lineWidth = 2 * e;
      for (let b = 0; b < 2; b++) { c.beginPath(); c.moveTo(0, BRZ[b][0]); for (let x = 2; x < NX; x += 2) c.lineTo(x, BRZ[b][x]); c.stroke(); }
      // ulice
      c.strokeStyle = G.rgba(ULICE * aS); c.lineWidth = 1; c.lineCap = 'butt';
      c.stroke(ulicePath);
      // aleja od mostu
      const a0 = P(mB, 0, polS + 9), a1 = P(a0, 0, 140);
      c.strokeStyle = G.rgba(ALEJA * aS);
      c.beginPath();
      for (const o of [-3.5, 3.5]) { c.moveTo(a0.x + tx * o, a0.y + ty * o); c.lineTo(a1.x + tx * o, a1.y + ty * o); }
      c.stroke();
      // brzegi
      c.strokeStyle = G.rgba(BRZEG * aS); c.lineWidth = 1.1; c.lineCap = 'round';
      for (let b = 0; b < 2; b++) { c.beginPath(); c.moveTo(0, BRZ[b][0]); for (let x = 1; x < NX; x++) c.lineTo(x, BRZ[b][x]); c.stroke(); }
      // most: pomost i pylony
      const m0 = P(mB, 0, -(polS + 8)), m1 = P(mB, 0, polS + 9);
      c.strokeStyle = G.rgba(MOST * aS); c.lineWidth = 1; c.lineCap = 'butt';
      c.beginPath();
      for (const o of [-2.4, 2.4]) { c.moveTo(m0.x + tx * o, m0.y + ty * o); c.lineTo(m1.x + tx * o, m1.y + ty * o); }
      for (const o of [-polS + 2, polS - 2]) { const q = P(mB, 0, o); c.moveTo(q.x - tx * 5, q.y - ty * 5); c.lineTo(q.x + tx * 5, q.y + ty * 5); }
      c.stroke();
      // znacznik Instytutu
      if (aP > 0.003) {
        c.strokeStyle = G.rgba(ZNACZNIK * aP); c.lineWidth = 1.2;
        c.beginPath(); c.arc(pin.x, pin.y, 4.2, 0, 2 * Math.PI); c.stroke();
        c.fillStyle = G.rgba(ZNACZNIK * aP);
        c.beginPath(); c.arc(pin.x, pin.y, 1.4, 0, 2 * Math.PI); c.fill();
      }
    },
    // ograniczenie ruchu: mapa w szczegółowości końca budowy, ze znacznikiem
    gotowy() { stoi = true; D = cel = D1; },
  };
};

export default motyw;
