// Instytut: dendryt wrocławski (Florek, Łukaszewicz, Perkal, Steinhaus, Zubrzycki 1951) — minimalne drzewo rozpinające
// 64 punktów (prototyp instytut-dendryt.html v2, ruch „podział”; zaakceptowany 31.10.2026).
// Co losowy odstęp (średnio 3 s, ±60%) jedna gałąź łagodnie (1,5 s) znika albo jedna z ukrytych wraca. Znikają
// częściej długie (losowanie ważone kwadratem długości), więc drzewo rozpada się na skupienia jak przy podziale zbioru
// metodą dendrytu; ukrytych naraz najwyżej 30% widocznych gałęzi. Klatki tylko w trakcie przejść, 8 kl./s
// (zmiana krycia gałęzi o < 1% na klatkę — nie widać schodków); między zmianami zegar śpi.
import type { Fabryka, Ustawienia } from '../typy';
import { S, generator } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const PUNKTY = 64, ZIARNO = 1951, KRAWEDZIE = 0.1, KROPKI = 0.16, RK = 1.25;
const PODZIAL = 0.3, KROK = 3, ZANIK = 1.5, FPS = 8;

// Próbkowanie „najlepszego kandydata” (Mitchell): z 16 losowych kandydatów najdalszy od dotychczasowych punktów —
// rozkład jak przy dysku Poissona; odbicia od brzegów liczą się jak sąsiedzi. Gęstość rośnie w prawo (0,7 → 1,3 średniej),
// bo lewa część i tak znika pod tytułem.
function losujPunkty(n: number, x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const los = generator(ZIARNO), w = x1 - x0, X = new Float64Array(n), Y = new Float64Array(n), out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    let bx = 0, by = 0, bs = -1;
    for (let c = 0, K = i ? 16 : 1; c < K; c++) {
      const x = x0 + los() * w, y = y0 + los() * (y1 - y0);
      let d = 2 * Math.min(y - y0, y1 - y, x - x0, x1 - x); d *= d;
      for (let j = 0; j < i; j++) { const ex = X[j] - x, ey = Y[j] - y, e2 = ex * ex + ey * ey; if (e2 < d) d = e2; }
      const s = Math.sqrt(d) * Math.sqrt(0.7 + 0.6 * (x - x0) / w);
      if (s > bs) { bs = s; bx = x; by = y; }
    }
    X[i] = bx; Y[i] = by; out.push([bx, by]);
  }
  return out;
}

// minimalne drzewo rozpinające (Prim na pełnym grafie odległości); krawędzie [a, b, długość]
function dendryt(P: [number, number][]): [number, number, number][] {
  const n = P.length, best = new Float64Array(n).fill(Infinity), od = new Int32Array(n).fill(-1), jest = new Uint8Array(n), E: [number, number, number][] = [];
  best[0] = 0;
  for (let it = 0; it < n; it++) {
    let v = -1, m = Infinity;
    for (let i = 0; i < n; i++) if (!jest[i] && best[i] < m) { m = best[i]; v = i; }
    jest[v] = 1;
    if (od[v] >= 0) E.push([od[v], v, Math.sqrt(m)]);
    for (let i = 0; i < n; i++) if (!jest[i]) {
      const dx = P[i][0] - P[v][0], dy = P[i][1] - P[v][1], d = dx * dx + dy * dy;
      if (d < best[i]) { best[i] = d; od[i] = v; }
    }
  }
  return E.sort((a, b) => a[2] - b[2]);
}

const motyw: Fabryka = (G, t0) => {
  // punkty losowane w polu szerokim na co najmniej 430 px, zaczepionym z lewej: węższy ekran pokazuje ten sam rysunek
  // (zlecenie 07: punkty najwyżej do dołu pola, czyli połowy hasła; z odstępem na promień kropki)
  const P = losujPunkty(PUNKTY, 0, G.y0 + 2, Math.max(G.W, 430), G.y1 - 2), E = dendryt(P), m = E.length;
  // gałęzie, które mogą znikać: środek widoczny i w obrębie banera; od najdłuższej
  const ciecia: number[] = [];
  for (let i = 0; i < m; i++) {
    const a = P[E[i][0]], b = P[E[i][1]], mx = (a[0] + b[0]) / 2;
    if (G.widac(mx, (a[1] + b[1]) / 2) > 0.5 && mx < G.W - 3) ciecia.push(i);
  }
  // krycie gałęzi: przejście od a0 do a1 zaczęte w chwili t0g
  const a0 = new Float32Array(m).fill(1), a1 = new Float32Array(m).fill(1), tg = new Float64Array(m).fill(-1e9), ukryte: number[] = [];
  const alfa = (i: number, t: number) => a0[i] + (a1[i] - a0[i]) * S((t - tg[i]) / ZANIK);
  const limit = Math.round(PODZIAL * ciecia.length);
  let tNast = t0 + 0.5 * KROK + Math.random() * KROK, pierwszy = true, stoi = false, tRys = 0;

  const zdarzenie = (t: number) => {
    const h = ukryte.length;
    const ukryj = limit <= 0 ? false : h === 0 ? true : h >= limit ? false : Math.random() < 1 - h / limit;
    if (ukryj) {
      const kand = ciecia.filter((i) => a1[i] === 1);
      if (kand.length) {
        let x = Math.random() * kand.reduce((s, i) => s + E[i][2] ** 2, 0), r = 0;
        for (; r < kand.length - 1 && x > E[kand[r]][2] ** 2; r++) x -= E[kand[r]][2] ** 2;
        const i = kand[r];
        a0[i] = alfa(i, t); a1[i] = 0; tg[i] = t; ukryte.push(i);
        return;
      }
    }
    if (!h) return;
    const i = ukryte.splice(Math.floor(Math.random() * h), 1)[0];
    a0[i] = alfa(i, t); a1[i] = 1; tg[i] = t;
  };

  return {
    krok(t) {
      let guard = 0;
      while (!stoi && t >= tNast && guard++ < 50) { zdarzenie(tNast); tNast += KROK * (0.4 + 1.2 * Math.random()); }
      const ruch = ciecia.some((i) => t > tg[i] && t < tg[i] + ZANIK);
      // jeszcze jedna klatka tuż po końcu przejścia, żeby gałąź doszła dokładnie do krycia 0 albo 1
      const dokoncz = ciecia.some((i) => tg[i] + ZANIK > tRys && tg[i] + ZANIK <= t);
      const a = pierwszy || ruch || dokoncz;
      pierwszy = false;
      if (a) tRys = t;
      return { a, za: ruch ? 1 / FPS : Math.max(0.05, tNast - t) };
    },
    rysuj(c, t) {
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(KRAWEDZIE);
      c.beginPath();
      const czesc: number[] = [];
      for (let i = 0; i < m; i++) {
        const al = stoi ? 1 : alfa(i, t);
        if (al <= 0.003) continue;
        if (al < 0.997) { czesc.push(i); continue; }
        const a = P[E[i][0]], b = P[E[i][1]];
        c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
      }
      c.stroke();
      for (const i of czesc) {
        const a = P[E[i][0]], b = P[E[i][1]];
        c.strokeStyle = G.rgba(KRAWEDZIE * alfa(i, t));
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      }
      c.fillStyle = G.rgba(KROPKI);
      c.beginPath();
      for (const p of P) { c.moveTo(p[0] + RK, p[1]); c.arc(p[0], p[1], RK, 0, 2 * Math.PI); }
      c.fill();
    },
    gotowy() { stoi = true; },
  };
};

export default motyw;
