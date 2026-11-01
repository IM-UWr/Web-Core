// Seminarium Pracowni Dydaktyki / Pracownia Dydaktyki i Popularyzacji Matematyki: geoplan i wzór Picka (prototyp
// animacje-struktury.html, „Motyw własny”; zaakceptowany 31.10.2026). Tablica z kołkami co 18 px i gumka rozpięta
// na kilku kołkach; kołki na gumce (brzeg, B) i w jej środku (W) są jaśniejsze — pole = W + B/2 − 1.
// Budowa raz przy wejściu (2,5 s): kołki wyłaniają się od prawej, potem gumka. Potem tablica stoi (warstwa A), a co
// 3–9 s jeden losowy wierzchołek gumki przesuwa się (2 px/s, warstwa B) na sąsiedni kołek — tak, żeby gumka została
// wielokątem prostym o polu 2,5–16, a wierzchołek widoczny i z dala od hasła; kołki w środku i na brzegu płynnie się
// przełączają. Klatka po przesunięciu o 0,5 px (4 kl./s), przełączanie kołków 8 kl./s, w przerwach zegar śpi.
// Warianty (Pole.wariant, tabela WARIANTY niżej): seminarium — gumka w kształcie sześciokąta, „zaklad” (Pracownia) —
// pięciokąt „domek”. Kolejny wariant (np. Studia podyplomowe, zlecenie 04) to nowy wpis w WARIANTY i „geoplan/<wariant>”
// w mapie strona → motyw (src/lib/motywyBanerow.ts).
// Pole (zlecenie 07): prototypowe [fy0, fy1] (od linku + 2 px do 12 px nad liczbami) to tu [y0 + 2, y1 − 6] — dolny
// rząd kołków najniżej ok. 14 px nad połową hasła. Przy 390 px: kratka bez zmian (18 px, skala 100%), środek 15 px wyżej
// niż w prototypie, o jeden rząd kołków mniej (jednoliniowy tytuł: 5 zamiast 6).
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const KRATKA = 18, KOLKI = 0.2, RK = 1.15, BRZEG = 0.72, SRODEK = 0.44, GUMKA = 0.5;
const BUDOWA = 2.5, FPS_BUD = 15, FPS = 8, V = 2, KROK_PX = 0.5, TEMPO_K = 1.6, PIERWSZY = 3;

type Pt = [number, number];
type Wariant = {
  /** kształty startowe gumki w kratce (kolumna, rząd); pierwszy główny, kolejne mniejsze — gdy główny się nie mieści */
  wzory: Pt[][];
  /** o ile kołków może przeskoczyć wierzchołek */
  sasiedzi: Pt[];
  /** przerwa między ruchami (s) i dopuszczalne pole gumki (w oczkach kratki) */
  przerwa: [number, number];
  pole: [number, number];
};
const SASIEDZI_8: Pt[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const MNIEJSZE: Pt[][] = [[[0, 0], [3, 0], [4, 2], [1, 2]], [[0, 0], [3, 1], [1, 2]]];
const WARIANTY: Record<string, Wariant> = {
  seminarium: {
    wzory: [[[1, 0], [4, 0], [5, 2], [4, 4], [1, 4], [0, 2]], [[1, 0], [3, 0], [4, 2], [3, 3], [0, 2]], ...MNIEJSZE],
    sasiedzi: SASIEDZI_8, przerwa: [3, 9], pole: [2.5, 16],
  },
  zaklad: {
    wzory: [[[0, 4], [0, 2], [2, 0], [4, 2], [4, 4]], [[0, 3], [0, 1], [2, 0], [4, 1], [4, 3]], [[0, 2], [0, 0], [3, 0], [4, 2]], [[0, 0], [3, 0], [1, 2]]],
    sasiedzi: SASIEDZI_8, przerwa: [3, 9], pole: [2.5, 16],
  },
};

const losowo = (a: number, b: number) => a + Math.random() * (b - a);
const tasuj = <T>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** czy wielokąt (wierzchołki w kratce) jest prosty, bez trzech kolejnych wierzchołków na prostej, o polu w [lo, hi] */
function prosty(V: Pt[], lo: number, hi: number): boolean {
  const n = V.length;
  const o = (p: Pt, q: Pt, r: Pt) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  const na = (p: Pt, q: Pt, r: Pt) => Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) && Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
  const przec = (a: Pt, b: Pt, c: Pt, d: Pt) => {
    const o1 = o(a, b, c), o2 = o(a, b, d), o3 = o(c, d, a), o4 = o(c, d, b);
    return (o1 !== o2 && o3 !== o4) || (!o1 && na(a, c, b)) || (!o2 && na(a, d, b)) || (!o3 && na(c, a, d)) || (!o4 && na(c, b, d));
  };
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    if (przec(V[i], V[(i + 1) % n], V[j], V[(j + 1) % n])) return false;
  }
  let pole = 0;
  for (let i = 0; i < n; i++) { const p = V[i], q = V[(i + 1) % n]; pole += p[0] * q[1] - q[0] * p[1]; }
  pole = Math.abs(pole) / 2;
  for (let i = 0; i < n; i++) if (!o(V[(i + n - 1) % n], V[i], V[(i + 1) % n])) return false;
  return pole >= lo && pole <= hi;
}

const motyw: Fabryka = (G, t0) => {
  const W = WARIANTY[G.wariant ?? ''] ?? WARIANTY.seminarium;
  const f0 = G.y0 + 2, f1 = G.y1 - 6, h = f1 - f0, x1 = G.x1, g = KRATKA;
  const alfa = (x: number, y: number) => G.widac(x, y) * S((x1 - x) / 10);
  const prawy = (c: CanvasRenderingContext2D, a: number) => {
    const gr = c.createLinearGradient(x1 - 10, 0, x1, 0);
    for (let i = 0; i <= 4; i++) gr.addColorStop(i / 4, G.rgba(a * S(1 - i / 4)));
    return gr;
  };
  // kratka: tyle rzędów, ile się mieści w polu (wyśrodkowane), kolumny dosunięte do prawego brzegu treści
  const wier = Math.floor((h - 10) / g) + 1, ky0 = (f0 + f1) / 2 - (wier - 1) * g / 2;
  const kol = Math.floor((x1 - 8) / g) + 1, kx0 = x1 - 2 - (kol - 1) * g;
  const px = (c: number) => kx0 + c * g, py = (r: number) => ky0 + r * g;
  // kołek użyteczny: w kratce, rysunek tam w pełni widoczny i gumka z dala od hasła
  const H = G.haslo;
  const uzyteczny = (c: number, r: number) => {
    if (c < 0 || r < 0 || c >= kol || r >= wier) return false;
    const x = px(c), y = py(r);
    if (H && y > H.t - 6 && y < H.b + 6 && x < H.r + 10) return false;
    return alfa(x, y) >= 0.9;
  };
  // kształt startowy: pierwszy wzór, który mieści się cały, jak najbliżej środka pola w pionie i jak najbardziej w prawo
  let najl: Pt = [0, 0], najW = -Infinity, wzor = W.wzory[0];
  W.wzory.forEach((wz, wi) => {
    const szer = Math.max(...wz.map((q) => q[0])), wys = Math.max(...wz.map((q) => q[1]));
    for (let c0 = kol - 2 - szer; c0 >= 0; c0--) for (let r0 = 0; r0 + wys < wier; r0++) {
      const w = wz.filter((q) => uzyteczny(c0 + q[0], r0 + q[1])).length;
      const pref = (w === wz.length ? 1000 - wi * 100 : w * 10 - 500) - Math.abs(r0 + wys / 2 - (wier - 1) / 2) * 2 + c0 * 0.1;
      if (pref > najW) { najW = pref; najl = [c0, r0]; wzor = wz; }
    }
  });
  const Vk: Pt[] = wzor.map((q): Pt => [najl[0] + q[0], najl[1] + q[1]]);          // wierzchołki w kratce
  const poz: Pt[] = Vk.map((q): Pt => [px(q[0]), py(q[1])]);                         // wierzchołki na banerze

  // kołki: krycie wyróżnienia (brzeg 0,72, środek 0,44, reszta 0) — bieżące i docelowe
  const n = kol * wier, alfaK = new Float32Array(n), celK = new Float32Array(n);
  const klasyfikuj = (odRazu: boolean) => {
    const m = poz.length;
    for (let c = 0; c < kol; c++) for (let r = 0; r < wier; r++) {
      const x = px(c), y = py(r);
      let w = false, brzeg = false;
      for (let i = 0, j = m - 1; i < m; j = i++) {
        const [xi, yi] = poz[i], [xj, yj] = poz[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) w = !w;
        const dx = xj - xi, dy = yj - yi, L2 = dx * dx + dy * dy, u = L2 ? Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / L2)) : 0;
        if (Math.hypot(x - xi - u * dx, y - yi - u * dy) < 0.6) brzeg = true;
      }
      const k = c * wier + r;
      celK[k] = brzeg ? BRZEG : w ? SRODEK : 0;
      if (odRazu) alfaK[k] = celK[k];
    }
  };
  klasyfikuj(true);

  // ---------- czas ----------
  const tB = t0 > 0 ? -1e9 : t0;
  const postep = (t: number) => (stoi ? 1 : Math.min(1, Math.max(0, (t - tB) / BUDOWA)));
  type Ruch = { i: number; z: Pt; do: Pt; nv: Pt; t: number; dl: number };
  let stoi = false, pOst = -1, tPrev = -1, akum = 0, ruch: Ruch | null = null, tNast = Math.max(t0, tB + BUDOWA) + PIERWSZY;

  const zaplanuj = (t: number) => {
    for (const vi of tasuj(Vk.map((_, i) => i))) for (const d of tasuj(W.sasiedzi.slice())) {
      const nv: Pt = [Vk[vi][0] + d[0], Vk[vi][1] + d[1]];
      if (!uzyteczny(nv[0], nv[1]) || !prosty(Vk.map((q, j) => (j === vi ? nv : q)), W.pole[0], W.pole[1])) continue;
      ruch = { i: vi, z: [px(Vk[vi][0]), py(Vk[vi][1])], do: [px(nv[0]), py(nv[1])], nv, t, dl: Math.hypot(d[0], d[1]) * g };
      return;
    }
    tNast = t + 2;
  };

  return {
    krok(t) {
      const p = postep(t);
      if (p < 1 || pOst < 1) {
        const a = p !== pOst;
        pOst = p; tPrev = t;
        return { a, b: a, za: p < 1 ? Math.min(1 / FPS_BUD, Math.max(0.01, tB + BUDOWA - t)) : Math.max(0.05, tNast - t) };
      }
      if (stoi) return { a: false, za: 5 };
      const dt = tPrev < 0 ? 0 : Math.max(0, t - tPrev);
      tPrev = t;
      let b = false;
      if (!ruch && t >= tNast) zaplanuj(t);
      const R = ruch as Ruch | null;
      if (R) {
        const u = Math.min(1, V * (t - R.t) / R.dl), q = poz[R.i], nx = R.z[0] + (R.do[0] - R.z[0]) * u, ny = R.z[1] + (R.do[1] - R.z[1]) * u;
        akum += Math.hypot(nx - q[0], ny - q[1]);
        poz[R.i] = [nx, ny];
        if (u >= 1) { Vk[R.i] = R.nv; ruch = null; tNast = t + losowo(W.przerwa[0], W.przerwa[1]); akum = KROK_PX; }
        if (akum >= KROK_PX) { akum = 0; b = true; klasyfikuj(false); }
      }
      // kołki zmieniają krycie płynnie (1,6 na sekundę)
      let trwa = false;
      for (let i = 0; i < n; i++) {
        const d = celK[i] - alfaK[i];
        if (Math.abs(d) > 0.004) { alfaK[i] += Math.sign(d) * Math.min(Math.abs(d), TEMPO_K * dt); trwa = true; b = true; }
        else alfaK[i] = celK[i];
      }
      return { a: false, b, za: trwa ? 1 / FPS : ruch ? KROK_PX / V : Math.max(0.05, tNast - t) };
    },
    // kołki tablicy (w budowie — kolumnami od prawej)
    rysuj(c, t) {
      const p = postep(t);
      c.fillStyle = prawy(c, KOLKI);
      for (let k = 0; k < kol; k++) {
        const a = S(p * 1.6 - (kol - 1 - k) / kol * 0.6);
        if (a <= 0.01) continue;
        c.globalAlpha = a;
        c.beginPath();
        for (let r = 0; r < wier; r++) { const x = px(k), y = py(r); c.moveTo(x + RK, y); c.arc(x, y, RK, 0, 2 * Math.PI); }
        c.fill();
      }
      c.globalAlpha = 1;
    },
    // gumka i wyróżnione kołki; pudło — ich zasięg
    rysujB(c, t): Pudlo {
      const a = S(postep(t) * 2 - 1);
      if (a <= 0) return [0, 0, 0, 0];
      let xa = Infinity, ya = Infinity, xb = -Infinity, yb = -Infinity;
      const dolacz = (x: number, y: number) => { xa = Math.min(xa, x); ya = Math.min(ya, y); xb = Math.max(xb, x); yb = Math.max(yb, y); };
      for (let k = 0; k < n; k++) {
        const v = alfaK[k];
        if (v < 0.01) continue;
        const x = px(Math.floor(k / wier)), y = py(k % wier);
        c.fillStyle = prawy(c, v * a);
        c.beginPath(); c.arc(x, y, 1.2 + v * 0.75, 0, 2 * Math.PI); c.fill();
        dolacz(x, y);
      }
      c.strokeStyle = prawy(c, GUMKA * a); c.lineWidth = 1.4;
      c.beginPath();
      poz.forEach((q, i) => { if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); dolacz(q[0], q[1]); });
      c.closePath(); c.stroke();
      return [xa - 4, ya - 4, xb + 4, yb + 4];
    },
    gotowy() { stoi = true; },
  };
};

export default motyw;
