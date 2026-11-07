// Specjalność „Matematyka teoretyczna”: kule jednostkowe ℓᵖ na płaszczyźnie, {(x, y): |x|ᵖ + |y|ᵖ ≤ 1} (prototyp
// animacje-kierunki.html, motyw „kule”; zaakceptowany 31.10.2026) — przestrzenie unormowane, dziedzina lwowskiej szkoły
// Banacha. Osie przez cały baner, romb (p = 1) i kwadrat (p = ∞) — warstwa A — oraz trzy kule pośrednie (warstwa B).
// Ruch: przy wejściu osie się pojawiają, a kule obrysowują się kolejno od rombu do kwadratu (5,5 s, raz). Potem co losową
// przerwę (2–6 s po poprzedniej zmianie) jedna z trzech pośrednich kul powoli zmienia p w swoim przedziale (1,2–1,6;
// 1,75–2,5; 2,8–7), najwyżej 1 px/s w narożniku; romb i kwadrat stoją.
// Klatka po przesunięciu narożnika kuli o ≥ 0,5 px (najwyżej 2 kl./s); w przerwach zegar śpi.
// Pole (zlecenie 07): w prototypie R = 0,45 wysokości pola (kwadrat 7 px od jego brzegów, w miękkiej masce). Tu kwadrat
// leży w [y0 + 4, y1 − 8]: przy 390 × 844 środek jest 16 px wyżej niż w prototypie, kule mniejsze o 7% (proporcjonalnie).
// Osie biegną przez całe pole i gasną w masce na jego brzegach, jak w prototypie; prawy brzeg gaśnie na ostatnich 14 px
// jak w masce prototypu.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { Anim, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const BUDOWA = 5.5, OSIE = 0.08, SKRAJNE = 0.11, KULE = 0.14, TEMPO = 1.0, M = 160, FPS_BUD = 15;
const ZAK = [[1.2, 1.6], [1.75, 2.5], [2.8, 7]], START = [1.4, 2, 4];  // przedziały i start p trzech kul pośrednich

const los = (a: number, b: number) => a + Math.random() * (b - a);

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

const motyw: Fabryka = (G, t0) => {
  const w = G.x1 - G.x0, cx = G.x0 + 0.72 * w, Rv = (G.y1 - 8 - (G.y0 + 4)) / 2, cy = G.y0 + 4 + Rv;
  const R = Math.min(Rv, G.x1 - cx - 6);
  /** odległość narożnika kuli (na przekątnej) od środka */
  const rog = (p: number) => R * Math.SQRT2 * 2 ** (-1 / p);
  const kula = (c: CanvasRenderingContext2D, p: number, e: number) => {
    const m = Math.ceil(M * e);
    c.beginPath();
    for (let k = 0; k <= m; k++) {
      const t = 2 * Math.PI * k / M, co = Math.cos(t), si = Math.sin(t);
      let x: number, y: number;
      if (p === Infinity) { const mx = Math.max(Math.abs(co), Math.abs(si)); x = co / mx; y = si / mx; }
      else { x = Math.sign(co) * Math.abs(co) ** (2 / p); y = Math.sign(si) * Math.abs(si) ** (2 / p); }
      if (k === 0) c.moveTo(cx + R * x, cy - R * y); else c.lineTo(cx + R * x, cy - R * y);
    }
    c.stroke();
  };
  const osie = (c: CanvasRenderingContext2D) => {
    c.beginPath(); c.moveTo(G.x0, cy); c.lineTo(G.x1, cy); c.moveTo(cx, G.y0); c.lineTo(cx, G.y1);
    for (const s of [-1, 1]) { c.moveTo(cx + s * R, cy - 3); c.lineTo(cx + s * R, cy + 3); c.moveTo(cx - 3, cy + s * R); c.lineTo(cx + 3, cy + s * R); }
    c.stroke();
  };

  const kp = START.map((p) => new Anim(p));
  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let stoi = false, tZm = (bud ? tB + BUDOWA : t0) + 1.5 + los(2, 6), ruch = -1, px = 0, rT = -1;
  const rp = START.slice();                                            // p na ostatniej klatce

  // jedna kula do nowego p (trzecia — losowo w skali logarytmicznej), narożnik o ≥ 2 px; zwraca koniec ruchu
  const zmiana = (s: number) => {
    const i = Math.floor(Math.random() * 3), [lo, hi] = ZAK[i], a = kp[i].cel;
    for (let q = 0; q < 8; q++) {
      const b = i === 2 ? Math.exp(Math.log(lo) + Math.random() * Math.log(hi / lo)) : los(lo, hi);
      const d0 = Math.abs(rog(b) - rog(a));
      if (d0 < 2) continue;
      const d = Math.max(3, d0 / TEMPO * 1.5);
      kp[i].ustaw(s, b, d); ruch = i; px = d0 / Math.abs(b - a);          // px narożnika na jednostkę p (w przybliżeniu)
      return s + d;
    }
    return s;
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const tau = bud ? Math.min(BUDOWA, t - tB) : BUDOWA;
      if (tau >= BUDOWA) while (t >= tZm) tZm = zmiana(tZm) + los(2, 6);
      const a = tau !== rT;
      let b = a, za = tau < BUDOWA ? 1 / FPS_BUD : Math.max(0.02, tZm - t);
      if (ruch >= 0) {
        const z = kp[ruch], p = z.w(t), d = Math.abs(rog(p) - rog(rp[ruch]));
        if (d >= 0.5 || (!z.trwa(t) && d > 0.02)) { rp[ruch] = p; b = true; }
        if (z.trwa(t)) za = Math.min(za, zaKlatka(z.v(t) * px));
      }
      rT = tau;
      return { a, b, za };
    },
    // osie, romb i kwadrat
    rysuj(c) {
      const tau = Math.max(0, rT);
      c.lineWidth = 1; c.strokeStyle = G.rgba(OSIE * S(tau / 1.2)); osie(c);
      c.lineWidth = 1.2; c.strokeStyle = G.rgba(SKRAJNE);
      kula(c, 1, S((tau - 1) / 1.1)); kula(c, Infinity, S((tau - 4.2) / 1.1));
      prawyBrzeg(c, G);
    },
    // trzy kule pośrednie (przy wejściu obrysowują się kolejno)
    rysujB(c) {
      const tau = Math.max(0, rT);
      c.lineWidth = 1.2; c.strokeStyle = G.rgba(KULE);
      for (let i = 0; i < 3; i++) { const e = S((tau - 1.8 - 0.8 * i) / 1.1); if (e > 0) kula(c, rp[i], e); }
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: osie i wszystkie pięć kul
    gotowy() { stoi = true; rT = BUDOWA; },
  };
};

export default motyw;
