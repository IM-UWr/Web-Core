// Struktura i zakłady: dendrogram (prototyp animacje-instytut.html, motyw „dendrogram”; zaakceptowany 31.10.2026). Liście
// u dołu to członkowie zakładów i pracowni (liczebności z danych: widok ListaZakladow.astro; dziś 97 osób). Liście łączą
// się w zakłady (wysokości złączeń wewnątrz zakładu losowe: pojedyncze wiązanie na prostej), zakłady w trzy obszary
// z tekstu strony (logika, algebra, topologia i geometria; analiza i równania; prawdopodobieństwo i statystyka), obszary
// i pracownia w Instytut; pień jest u góry z prawej. To „syn” dendrytu z banera Instytutu: podział zbioru przez
// rozcinanie najdłuższych krawędzi najkrótszego dendrytu (Florek, Łukaszewicz, Perkal, Steinhaus, Zubrzycki 1951) to
// grupowanie metodą pojedynczego wiązania, a jego hierarchię pokazuje dendrogram.
// Ruch: przy wejściu (raz) drzewo rośnie od liści — złączenia pojawiają się od najniższego do najwyższego, jak
// w algorytmie Kruskala (ok. 7,5 s). Potem co 4–9 s (losowo) jedna pozioma belka wewnątrz zakładu (czasem belka całego
// zakładu), częściej taka, którą widać, powoli (1,5 px/s) podnosi się albo opada — między dziećmi a rodzicem.
// Klatka co 0,5 px ruchu belki (3 kl./s), tylko gdy belkę widać; przy wejściu 15 kl./s; między ruchami zegar śpi.
// Pole (zlecenie 07): w prototypie liście stały 1 px nad dołem dawnego pola (188 px przy 390 × 844), a czubek pnia
// na linku „←” + 8 (81 px); tu liście 8 px nad dołem pola (163 px, 25 px wyżej), czubek pnia 2 px pod górą pola (69 px).
// Drzewo ma 94 zamiast 107 px wysokości (spłaszczenie w pionie do 88%, poziomo bez zmian).
import type { Fabryka, Ustawienia } from '../typy';
import { S, generator } from '../wspolne';
import { budowa } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

// bez danych: liczebności z prototypu — trzy obszary zakładów i pracownia
const OBSZARY = [[11, 12, 15], [17, 7, 8], [12, 9]], POZA = [6];
// wysokości złączeń zakładów w obszarach (prototyp; dla innej liczby zakładów — wzór ogólny 0,55–0,67)
const H_OBSZAROW = [[0.56, 0.64], [0.55, 0.67], [0.60]];
const ZIARNO = 1951, PRZ = 4, DOL = 8, GORA = 2, PIEN = 5;
const KRYCIE = [0.15, 0.2, 0.24, 0.26, 0.3], LISC = 0.3, RL = 0.85;
const V = 1.5, BUDOWA = 7.5, ZANIK = 0.6, FPS_BUD = 15, PROG = 1 / 255;

/** węzeł: x, wysokość h ∈ [0, 1] (0 — liście), dzieci c1, c2, rodzic p, poziom (0 — wewnątrz zakładu, 1 — zakład,
 *  2 — obszar, 3 — obszary razem, 4 — Instytut), chwila pojawienia się t0; rh, ra — wysokość i krycie na ostatniej klatce */
type Wezel = { x: number; h: number; c1: number; c2: number; p: number; lev: number; t0: number; rh: number; ra: number };

const los = (a: number, b: number) => a + Math.random() * (b - a);
const liczby = (a: unknown) => (Array.isArray(a) ? a.map((n) => Math.max(0, Math.floor(Number(n) || 0))).filter((n) => n > 0) : []);

const motyw: Fabryka = (G, t0) => {
  const d = (G.dane ?? {}) as { o?: unknown; p?: unknown };
  const dO = Array.isArray(d.o) ? d.o.map(liczby).filter((o) => o.length) : [], dP = liczby(d.p);
  const obs = dO.length || dP.length ? dO : OBSZARY, poza = dO.length || dP.length ? dP : POZA;
  const jed = [...obs.flat(), ...poza], N = jed.reduce((s, n) => s + n, 0), R = generator(ZIARNO);

  // liście równo od lewego do prawego brzegu treści, między zakładami przerwa
  const W: Wezel[] = [], s = (G.x1 - G.x0 - PRZ * (jed.length - 1)) / Math.max(1, N - 1);
  const nowy = (x: number, h: number, c1 = -1, c2 = -1, lev = -1): Wezel => ({ x, h, c1, c2, p: -1, lev, t0: 0, rh: -1, ra: -1 });
  let x = G.x0;
  jed.forEach((n) => { for (let i = 0; i < n; i++) { W.push(nowy(x, 0)); x += s; } x += PRZ; });
  const wezel = (a: number, b: number, h: number, lev: number) => {
    W.push(nowy((W[a].x + W[b].x) / 2, h, a, b, lev));
    W[a].p = W[b].p = W.length - 1;
    return W.length - 1;
  };
  // wewnątrz zakładu: pojedyncze wiązanie na prostej — losowe przerwy między sąsiadami, złączenia od najmniejszej
  const korzenie: number[] = [];
  let start = 0;
  jed.forEach((n) => {
    const hU = 0.30 + 0.14 * R(), wys: number[] = [], kol: number[] = [];
    for (let i = 0; i < n - 1; i++) { wys.push(0.05 + (hU - 0.05) * R()); kol.push(i); }
    kol.sort((p, q) => wys[p] - wys[q]);
    const hs = wys.slice().sort((p, q) => p - q), grupa = Array.from({ length: n }, (_, i) => start + i);
    kol.forEach((k, r) => {
      const A = grupa[k], B = grupa[k + 1], v = wezel(A, B, hs[r], 0);
      for (let m = 0; m < n; m++) if (grupa[m] === A || grupa[m] === B) grupa[m] = v;
    });
    korzenie.push(grupa[0]); start += n;
  });
  korzenie.forEach((k) => { W[k].lev = 1; });
  // zakłady w obszary, obszary razem, na końcu pracownia (i zakłady spoza obszarów) — pień
  let ki = 0;
  const rObs = obs.map((o, i) => {
    let v = korzenie[ki++];
    const m = o.length, hs = H_OBSZAROW[i]?.length === m - 1 ? H_OBSZAROW[i] : null;
    for (let j = 1; j < m; j++) v = wezel(v, korzenie[ki++], hs ? hs[j - 1] : m === 2 ? 0.6 : 0.55 + 0.12 * (j - 1) / (m - 2), j === m - 1 ? 2 : 1);
    return v;
  });
  let pien = rObs.length ? rObs[0] : korzenie[ki++] ?? -1;
  for (let k = 1; k < rObs.length; k++) pien = wezel(pien, rObs[k], 0.80 + 0.07 * (k - 1) / Math.max(1, rObs.length - 2), 3);
  for (let q = poza.length - (rObs.length ? 0 : 1), j = 0; ki < korzenie.length; j++) pien = wezel(pien, korzenie[ki++], 0.95 - 0.03 * (q - 1 - j), 4);
  const wew: number[] = [];
  for (let i = N; i < W.length; i++) wew.push(i);
  const hMax = pien >= N ? W[pien].h : 1;

  // pionowo: liście 8 px nad dołem pola, czubek pnia (5 px nad najwyższą belką) 2 px pod górą pola
  const yL = G.y1 - DOL, H = Math.max(20, (yL - G.y0 - GORA - PIEN) / hMax), Y = (h: number) => yL - h * H;

  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  wew.forEach((k) => { W[k].t0 = tB + 0.4 + 6.2 * W[k].h / hMax; });
  let ruch: { k: number; h: number } | null = null, tPrev = t0, stoi = false, pierwszy = true, raL = -1;
  let tNast = bud ? tB + 9 + los(0, 3) : t0 + los(2, 5);
  const alfa = (v: Wezel, t: number) => (stoi ? 1 : S((t - v.t0) / ZANIK));
  const alfaL = (t: number) => (stoi ? 1 : S((t - tB) / 0.8));
  /** czy belkę węzła (i pionowe kreski do dzieci) widać po masce */
  const widac = (v: Wezel) => {
    const y = Y(v.h), A = W[v.c1], B = W[v.c2];
    return Math.max(G.widac(A.x, y), G.widac(v.x, y), G.widac(B.x, y), G.widac(A.x, (y + Y(A.h)) / 2), G.widac(B.x, (y + Y(B.h)) / 2)) > 0.02;
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const dt = Math.max(0, t - tPrev), wBud = t - tB < BUDOWA;
      tPrev = t;
      let a = pierwszy, koniec = false;
      pierwszy = false;
      if (ruch) {
        const v = W[ruch.k], dh = ruch.h - v.h, kh = V / H * dt;
        if (Math.abs(dh) <= kh) { v.h = ruch.h; ruch = null; koniec = true; tNast = t + los(4, 9); } else v.h += dh > 0 ? kh : -kh;
      } else if (!wBud && t >= tNast) {
        // belka wewnątrz zakładu (belka całego zakładu rzadziej), raczej taka, którą widać; nowa wysokość między
        // wyższym z dzieci a rodzicem (z zapasem 0,03), co najmniej 4 px od dzisiejszej
        for (let g = 0; g < 30; g++) {
          const k = wew[Math.floor(Math.random() * wew.length)], v = W[k];
          if (v.lev > 1 || (v.lev === 1 && Math.random() < 0.7)) continue;
          if (G.widac(v.x, Y(v.h)) < 0.4 && Math.random() < 0.85) continue;
          const lo = Math.max(W[v.c1].h, W[v.c2].h) + 0.03, hi = (v.p >= 0 ? W[v.p].h : 1) - 0.03;
          if (hi - lo < 0.05) continue;
          const cel = lo + Math.random() * (hi - lo);
          if (Math.abs(cel - v.h) * H < 4) continue;
          ruch = { k, h: cel };
          break;
        }
        if (!ruch) tNast = t + 1.5;
      }
      // klatka: belka przesunęła się o ≥ 0,5 px (jeśli ją widać), widoczna zmiana krycia przy wejściu, koniec ruchu
      for (const k of wew) {
        const v = W[k], dy = Math.abs(v.h - v.rh) * H;
        if ((dy >= 0.5 || (koniec && dy > 0.01)) && widac(v)) a = true;
        if (wBud || t - tB < BUDOWA + 1) if (Math.abs(alfa(v, t) - v.ra) * KRYCIE[v.lev] >= PROG) a = true;
      }
      if (Math.abs(alfaL(t) - raL) * LISC >= PROG) a = true;
      if (a) { for (const k of wew) { W[k].rh = W[k].h; W[k].ra = alfa(W[k], t); } raL = alfaL(t); }
      if (wBud || alfaL(t) < 1) return { a, za: 1 / FPS_BUD };
      if (ruch) return { a, za: 0.5 / V };
      return { a, za: Math.max(0.05, tNast - t) };
    },
    rysuj(c, t) {
      c.lineWidth = 1; c.lineCap = 'butt';
      for (const k of wew) {
        const v = W[k], al = alfa(v, t);
        if (al <= 0.003) continue;
        const A = W[v.c1], B = W[v.c2], y = Y(v.h);
        c.strokeStyle = G.rgba(KRYCIE[v.lev] * al);
        c.beginPath();
        c.moveTo(A.x, Y(A.h)); c.lineTo(A.x, y); c.lineTo(B.x, y); c.lineTo(B.x, Y(B.h));
        if (k === pien) { c.moveTo(v.x, y); c.lineTo(v.x, y - PIEN); }
        c.stroke();
      }
      const aL = alfaL(t);
      if (aL <= 0.003) return;
      c.fillStyle = G.rgba(LISC * aL);
      c.beginPath();
      for (let i = 0; i < N; i++) { c.moveTo(W[i].x + RL, yL); c.arc(W[i].x, yL, RL, 0, 2 * Math.PI); }
      c.fill();
    },
    // ograniczenie ruchu: całe drzewo
    gotowy() { stoi = true; if (ruch) { W[ruch.k].h = ruch.h; ruch = null; } },
  };
};

export default motyw;
