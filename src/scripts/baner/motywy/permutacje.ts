// ISIM (Indywidualne Studia Informatyczno-Matematyczne): permutacje przez zamiany sąsiadów — algorytm
// Steinhausa–Johnsona–Trottera dla n = 4 (prototyp animacje-kierunki.html, motyw „plecionka”; zaakceptowany 31.10.2026).
// Cztery nici zamieniają się miejscami tylko z sąsiadką; 23 zamiany przechodzą przez wszystkie 24 permutacje. Jaśniejsza
// nić to na początku największy element — idzie zygzakiem.
// Ruch: przy wejściu nici wyrastają od lewej (5 s, raz). Potem co losową przerwę (1,2–4 s po poprzedniej zmianie) jedno
// skrzyżowanie przesuwa się w bok o 2–4 px (w zakresie ±4 px od położenia wyjściowego, nie bliżej sąsiedniego niż 1 px),
// a co 20–35 s rozjaśnia się inna nić (3,5 s). Prototyp zgłaszał, że ruch jest za słaby, więc — przy tym samym zakresie
// i rytmie — przesuwają się tylko skrzyżowania w odsłoniętej części banera (przy trzyliniowym tytule ISIM to ok. jedna
// trzecia z nich), przesunięcie ma co najmniej 2 px (w prototypie 1,2 px), tempo do 2 px/s (w prototypie 1,2 px/s),
// a pierwsza zmiana jasnej nici przychodzi już 12–20 s po wyrośnięciu nici (w prototypie po 27–44 s).
// Klatka po przesunięciu skrzyżowania o ≥ 0,5 px (ok. 3 kl./s w czasie ruchu) albo po widocznej zmianie krycia nici
// (najwyżej 8 kl./s przez 3,5 s); w przerwach zegar śpi.
// Pole (zlecenie 07): pas nici ma wysokość jak w prototypie (68% pola, które było o 10 px wyższe), a jest wyśrodkowany
// w [y0 + 6, y1 − 8]: przy 390 × 844 nici na 93–229 px, 14 px wyżej niż w prototypie, skala 100%. Prawy brzeg gaśnie
// na ostatnich 14 px jak w masce prototypu.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { Anim, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const N = 4, BUDOWA = 5, NIC = 0.10, JASNA = 0.12;                   // krycie nici: 0,10, jasnej o 0,12 więcej
const ZAKRES = 4, MIN = 2, TEMPO = 2, JAS_D = 3.5, FPS_BUD = 15, PROG = 1.5 / 255;

const los = (a: number, b: number) => a + Math.random() * (b - a);

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

/** Steinhaus–Johnson–Trotter: kolejne zamiany sąsiednich miejsc (indeks lewego miejsca z pary) */
function sjt(n: number): number[] {
  const perm = Array.from({ length: n }, (_, i) => i + 1), dir = perm.map(() => -1), sw: number[] = [];
  for (;;) {
    let mi = -1;
    for (let i = 0; i < n; i++) {
      const j = i + dir[perm[i] - 1];
      if (j >= 0 && j < n && perm[j] < perm[i] && (mi < 0 || perm[i] > perm[mi])) mi = i;
    }
    if (mi < 0) break;
    const jj = mi + dir[perm[mi] - 1], k = perm[mi];
    sw.push(Math.min(mi, jj)); perm[mi] = perm[jj]; perm[jj] = k;
    for (let i = 0; i < n; i++) if (perm[i] > k) dir[perm[i] - 1] *= -1;
  }
  return sw;
}

const motyw: Fabryka = (G, t0) => {
  const SW = sjt(N), M = SW.length;
  const xa = G.x0 + 4, xb = G.x1 - 4, dx = (xb - xa) / M, hw = Math.min(6, dx * 0.36), luz = dx - 2 * hw - 1;
  const g0 = G.y0 + 6, g1 = G.y1 - 8, pas = Math.min(0.68 * (G.y1 - G.y0 + 10), g1 - g0), yc = (g0 + g1) / 2;
  const ys = Array.from({ length: N }, (_, s) => yc + pas * (s / (N - 1) - 0.5));
  const xs = (k: number) => xa + (k + 0.5) * dx;
  const off = SW.map(() => new Anim(0));                               // przesunięcie skrzyżowań (px)
  const jas = Array.from({ length: N }, (_, e) => new Anim(e === N - 1 ? 1 : 0)); // jasność nici (po miejscu startu)

  // skrzyżowania, które dobrze widać (oba końce łuku i jego środek); bez takich — sześć skrajnych z prawej
  const widac = (k: number) => {
    const p = SW[k], x = xs(k);
    return Math.min(G.widac(x - hw, ys[p]), G.widac(x, (ys[p] + ys[p + 1]) / 2), G.widac(x + hw, ys[p + 1]));
  };
  let kand = SW.map((_, k) => k).filter((k) => widac(k) > 0.5);
  if (!kand.length) kand = SW.map((_, k) => k).slice(-6);

  const bud = budowa(t0), tB = bud ? t0 : -1e9, tStart = bud ? t0 + BUDOWA : t0;
  let stoi = false, tZm = tStart + los(1, 3), tJas = tStart + los(12, 20);
  // stan z ostatniej klatki: postęp budowy, przesunięcia, jasność
  let rP = bud ? -1 : 1;
  const rOff = SW.map(() => 0), rJas = jas.map((j) => j.cel);

  // jedno skrzyżowanie przesuwa się o 2–4 px; zwraca chwilę końca ruchu
  const przesun = (t: number) => {
    for (let proba = 0; proba < 12; proba++) {
      const i = kand[Math.floor(Math.random() * kand.length)], a = off[i].cel;
      let b = Math.max(-ZAKRES, Math.min(ZAKRES, a + (Math.random() * 2 - 1) * ZAKRES));
      if (i > 0) b = Math.max(b, off[i - 1].cel - luz);
      if (i < M - 1) b = Math.min(b, off[i + 1].cel + luz);
      if (Math.abs(b - a) < MIN) continue;
      const d = Math.max(2, Math.abs(b - a) / TEMPO * 1.5);
      off[i].ustaw(t, b, d);
      return t + d;
    }
    return t;
  };
  // inna nić staje się jasna
  const jasniej = (t: number) => {
    let cur = 0;
    for (let e = 1; e < N; e++) if (jas[e].cel > jas[cur].cel) cur = e;
    const nw = (cur + 1 + Math.floor(Math.random() * (N - 1))) % N;
    jas[cur].ustaw(t, 0, JAS_D); jas[nw].ustaw(t, 1, JAS_D);
  };

  // nić zaczynająca się na miejscu e (do xMax — przy wejściu nici wyrastają od lewej)
  const nic = (c: CanvasRenderingContext2D, e: number, xMax: number) => {
    let sl = e;
    c.beginPath(); c.moveTo(xa - 2, ys[sl]);
    for (let k = 0; k < M; k++) {
      const p = SW[k];
      if (sl !== p && sl !== p + 1) continue;
      const x = xs(k) + rOff[k], ns = sl === p ? p + 1 : p;
      if (x - hw > xMax) break;
      c.lineTo(x - hw, ys[sl]); c.bezierCurveTo(x, ys[sl], x, ys[ns], x + hw, ys[ns]);
      sl = ns;
    }
    c.lineTo(Math.min(xb + 2, Math.max(xa, xMax)), ys[sl]);
    c.stroke();
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const p = bud ? S((t - tB) / BUDOWA) : 1;
      if (p >= 1) {
        if (t >= tZm && off.every((o) => !o.trwa(t))) tZm = przesun(t) + los(1.2, 4);
        if (t >= tJas) { jasniej(t); tJas = t + los(20, 35); }
      }
      let a = p !== rP, za = p < 1 ? 1 / FPS_BUD : Math.max(0.02, Math.min(tZm, tJas) - t);
      for (let k = 0; k < M; k++) {
        const v = off[k].w(t);
        if (off[k].trwa(t)) { za = Math.min(za, zaKlatka(off[k].v(t))); if (Math.abs(v - rOff[k]) >= 0.5) a = true; }
        else if (v !== rOff[k]) a = true;                                // dokończenie ruchu
      }
      for (let e = 0; e < N; e++) {
        const v = jas[e].w(t);
        if (jas[e].trwa(t)) { za = Math.min(za, 1 / 8); if (Math.abs(v - rJas[e]) * JASNA >= PROG) a = true; }
        else if (v !== rJas[e]) a = true;
      }
      if (a) {
        rP = p;
        for (let k = 0; k < M; k++) rOff[k] = off[k].w(t);
        for (let e = 0; e < N; e++) rJas[e] = jas[e].w(t);
      }
      return { a, za };
    },
    // nici od najciemniejszej do najjaśniejszej (jasna na wierzchu)
    rysuj(c) {
      const xMax = rP < 1 ? xa + Math.max(0, rP) * (xb - xa + 10) : Infinity;
      const kol = Array.from({ length: N }, (_, e) => e).sort((p, q) => rJas[p] - rJas[q]);
      for (const e of kol) {
        c.strokeStyle = G.rgba(NIC + JASNA * rJas[e]); c.lineWidth = 1 + 0.4 * rJas[e];
        nic(c, e, xMax);
      }
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: cała plecionka, jasna nić — największy element
    gotowy() { stoi = true; rP = 1; },
  };
};

export default motyw;
