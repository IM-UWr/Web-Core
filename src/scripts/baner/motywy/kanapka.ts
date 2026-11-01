// Władze Instytutu: kanapka z szynką na płaszczyźnie (prototyp animacje-instytut.html, motyw „kanapka”; zaakceptowany
// 31.10.2026). Problem postawił Hugo Steinhaus we Lwowie, a rozwiązał Stefan Banach (lata 30.): dwa zbiory punktów na
// płaszczyźnie zawsze da się przeciąć jedną prostą na połowy — oba naraz. Tu dwa zbiory po 41 punktów (pełne kropki
// i kółka) i prosta przez jedną kropkę i jedno kółko: po 20 punktów każdego rodzaju z każdej strony. Jedna strona prostej
// jest ledwie rozjaśniona (Steinhaus jest też twórcą matematycznej teorii sprawiedliwego podziału, 1948).
// Ruch: przy wejściu (raz) punkty pojawiają się do ok. 3,8 s, potem prosta (do 5 s). Potem co losową przerwę (5–12 s po
// poprzednim ruchu) jeden punkt — częściej tam, gdzie go widać — przechodzi 14–36 px w nowe miejsce (1,5 px/s), a prosta
// spokojnie (najwyżej 2 px/s w widocznej części pola) idzie do najbliższego nowego podziału.
// Klatka po przesunięciu punktu albo prostej o ≥ 0,5 px (w czasie ruchu ok. 3–4 kl./s), przy wejściu po widocznej zmianie
// krycia (15 kl./s); między ruchami zegar śpi.
// Pole (zlecenie 07): w prototypie punkty leżały w [link „←” + 8, dół dawnego pola − 4], czyli 81–185 px przy 390 × 844
// (104 px); tu w [y0 + 4, y1 − 8] = 71–163 px (92 px): chmura 10 px wyżej u góry i 22 px u dołu, spłaszczona w pionie
// do 88% (poziomo bez zmian). Półpłaszczyzna i prosta sięgają brzegów pola i gasną w masce silnika, jak w prototypie.
import type { Fabryka, Ustawienia } from '../typy';
import { S, generator, ogr } from '../wspolne';
import { budowa } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const ZIARNO = 1938, NA = 41, NB = 41, ODST = 7, GORA = 4, DOL = 8;
const V = 1.5, VL = 2, BUDOWA = 5.2, PRZERWA = [5, 12];
const POLE = 0.035, PROSTA = 0.30, PUNKT = 0.34, NA_PROSTEJ = 0.6, RA = 1.7, RB = 2.1;
// zmiana krycia o ok. 1/255 liczy się jak 0,5 px (jak w prototypie)
const ALFA = 120, PROG = 0.5;

type Pkt = { x: number; y: number; t0: number };
/** prosta {p : cos φ · x + sin φ · y = c}, φ ∈ [0, π) */
type Prosta = { phi: number; c: number };

const los = (a: number, b: number) => a + Math.random() * (b - a);

/** liczba z rozkładu N(0, 1) — wzór z prototypu (ta sama kolejność losowań, więc ten sam rysunek dla ziarna 1938) */
function gaussP(R: () => number): number { const u = R() || 1e-9, v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

function norm(phi: number, c: number): Prosta {
  while (phi < 0) { phi += Math.PI; c = -c; }
  while (phi >= Math.PI) { phi -= Math.PI; c = -c; }
  return { phi, c };
}

const motyw: Fabryka = (G, t0) => {
  const R = generator(ZIARNO), x0 = G.x0 + 4, x1 = G.x1 - 2, y0 = G.y0 + GORA, y1 = G.y1 - DOL, w = x1 - x0, h = y1 - y0;
  const A: Pkt[] = [], B: Pkt[] = [], P: Pkt[] = [];
  const wolne = (x: number, y: number, pom?: Pkt) => P.every((p) => p === pom || (p.x - x) ** 2 + (p.y - y) ** 2 >= ODST * ODST);
  // punkt z rozkładu normalnego wokół (cx, cy), w polu i co najmniej 7 px od pozostałych
  const dodaj = (T: Pkt[], cx: number, cy: number, sx: number, sy: number) => {
    for (let g = 0; g < 400; g++) {
      const x = cx + sx * gaussP(R), y = cy + sy * gaussP(R);
      if (x < x0 || x > x1 || y < y0 || y > y1 || !wolne(x, y)) continue;
      const p = { x, y, t0: 0 }; T.push(p); P.push(p); return;
    }
    const q = { x: x0 + R() * w, y: y0 + R() * h, t0: 0 }; T.push(q); P.push(q);
  };
  for (let i = 0; i < NA; i++) dodaj(A, x0 + 0.66 * w, y0 + 0.42 * h, 0.22 * w, 0.30 * h);
  for (let i = 0; i < NB; i++) dodaj(B, x0 + 0.56 * w, y0 + 0.60 * h, 0.30 * w, 0.24 * h);
  P.forEach((p) => { p.t0 = 0.3 + 2.6 * R(); });

  // widoczna część pola (od miejsca, gdzie w najgorszym wierszu rysunek widać w ok. 60%): tam mierzymy przesunięcie prostej
  let xw = Infinity;
  for (let y = G.y0 + 10; y <= G.y1; y += 3) xw = Math.min(xw, G.granica(y) + 36);
  const xs = ogr(xw - 30, x0, x1 - 40), PROBY = [[xs, y0], [x1, y0], [xs, y1], [x1, y1]];
  /** największe przesunięcie prostej w widocznej części pola (px) */
  const odl = (L1: Prosta, L2: Prosta) => {
    let m = 0;
    const c1 = Math.cos(L1.phi), s1 = Math.sin(L1.phi), c2 = Math.cos(L2.phi), s2 = Math.sin(L2.phi);
    for (const [px, py] of PROBY) m = Math.max(m, Math.abs((c1 * px + s1 * py - L1.c) - (c2 * px + s2 * py - L2.c)));
    return m;
  };
  /** T w tej z równoważnych postaci (φ, c), (φ ± π, −c), która jest najbliżej L */
  const bliski = (L: Prosta, T: Prosta) => {
    let best = T, bd = odl(L, T);
    for (const o of [-Math.PI, Math.PI]) { const Q = { phi: T.phi + o, c: -T.c }, d = odl(L, Q); if (d < bd) { bd = d; best = Q; } }
    return best;
  };
  // wszystkie proste przez jeden punkt A i jeden punkt B, które dzielą oba zbiory na połowy
  const rozwiazania = () => {
    const out: Prosta[] = [], ha = (NA - 1) / 2, hb = (NB - 1) / 2;
    for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) {
      const a = A[i], b = B[j], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 2) continue;
      let l = 0;
      for (let k = 0; k < NA; k++) if (k !== i && dx * (A[k].y - a.y) - dy * (A[k].x - a.x) > 0) l++;
      if (l !== ha) continue;
      l = 0;
      for (let k = 0; k < NB; k++) if (k !== j && dx * (B[k].y - a.y) - dy * (B[k].x - a.x) > 0) l++;
      if (l !== hb) continue;
      out.push(norm(Math.atan2(dx / L, -dy / L), (-dy / L) * a.x + (dx / L) * a.y));
    }
    return out;
  };
  /** rozwiązanie najbliższe prostej L (w postaci najbliższej L) */
  const najblizsze = (L: Prosta): Prosta | null => {
    let best: Prosta | null = null, bd = Infinity;
    for (const r of rozwiazania()) { const q = bliski(L, r), d = odl(L, q); if (d < bd) { bd = d; best = q; } }
    return best;
  };
  // na start: rozwiązanie najbliższe poziomej prostej przez środek pola
  const poziom = { phi: Math.PI / 2, c: (y0 + y1) / 2 };
  const linia: Prosta = { ...(najblizsze(poziom) ?? poziom) };
  let cel: Prosta = { ...linia };

  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let ruch: { p: Pkt; x: number; y: number } | null = null, stoi = false, tPrev = t0;
  let tNast = bud ? tB + 6 + los(1, 4) : t0 + los(2, 5);
  // stan z ostatniej klatki
  const snap = { phi: NaN, c: NaN, x: 0, y: 0, a: 0, aL: 0 };
  const alfa = (p: Pkt, t: number) => S((t - tB - p.t0) / 0.9);
  const alfaL = (t: number) => S((t - tB - 3.6) / 1.4);
  const sumaA = (t: number) => P.reduce((s, p) => s + alfa(p, t), 0);
  let tRys = t0;

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const dt = Math.max(0, t - tPrev), wBudowie = t - tB < BUDOWA;
      tPrev = t;
      let koniec = false;
      if (ruch) {
        const p = ruch.p, dx = ruch.x - p.x, dy = ruch.y - p.y, d = Math.hypot(dx, dy), s = V * dt;
        if (d <= s) { p.x = ruch.x; p.y = ruch.y; ruch = null; koniec = true; tNast = t + los(PRZERWA[0], PRZERWA[1]); }
        else { p.x += dx / d * s; p.y += dy / d * s; }
        cel = najblizsze(linia) ?? cel;
      } else if (!wBudowie && t >= tNast) {
        // jeden punkt idzie 14–36 px w losową stronę (w pionie skrócone do 60%), raczej tam, gdzie go widać
        for (let g = 0; g < 40; g++) {
          const q = P[Math.floor(Math.random() * P.length)], kat = Math.random() * 2 * Math.PI, r = los(14, 36);
          const nx = ogr(q.x + r * Math.cos(kat), x0, x1), ny = ogr(q.y + r * Math.sin(kat) * 0.6, y0, y1);
          if (G.widac(nx, ny) < 0.4 && Math.random() < 0.8) continue;
          if (!wolne(nx, ny, q)) continue;
          ruch = { p: q, x: nx, y: ny }; snap.x = q.x; snap.y = q.y;
          break;
        }
        if (!ruch) tNast = t + 2;
      }
      // prosta goni najbliższy podział, najwyżej VL px/s w widocznej części pola
      const C = bliski(linia, cel), dd = odl(linia, C), k = VL * dt;
      if (dd <= k || dd < 0.05) { if (dd > 0) koniec = true; linia.phi = C.phi; linia.c = C.c; }
      else { const f = k / dd; linia.phi += f * (C.phi - linia.phi); linia.c += f * (C.c - linia.c); }
      Object.assign(linia, norm(linia.phi, linia.c));

      // czy przerysować: przesunięcie prostej albo punktu o ≥ 0,5 px, widoczna zmiana krycia; dokończenie ruchu
      let z = Number.isNaN(snap.phi) ? 99 : odl(snap, linia);
      if (ruch) z = Math.max(z, Math.hypot(ruch.p.x - snap.x, ruch.p.y - snap.y));
      if (t - tB < BUDOWA + 1) z = Math.max(z, Math.abs(sumaA(t) - snap.a) * PUNKT * ALFA / 4, Math.abs(alfaL(t) - snap.aL) * PROSTA * ALFA);
      const a = z >= PROG || (koniec && z > 0.02) || (tRys < tB + BUDOWA + 1 && t >= tB + BUDOWA + 1);
      if (a) {
        snap.phi = linia.phi; snap.c = linia.c; snap.a = sumaA(t); snap.aL = alfaL(t); tRys = t;
        if (ruch) { snap.x = ruch.p.x; snap.y = ruch.p.y; }
      }
      if (wBudowie) return { a, za: 1 / 15 };
      if (ruch || dd > 0.05) return { a, za: Math.min(0.5 / V, 0.5 / VL) };
      return { a, za: Math.max(0.05, tNast - t) };
    },
    rysuj(c, t) {
      const aL = stoi ? 1 : alfaL(t), co = Math.cos(linia.phi), si = Math.sin(linia.phi);
      const X0 = 0, X1 = G.W, Y0 = G.y0 - 2, Y1 = G.y1 + 2;
      const f = (x: number, y: number) => co * x + si * y - linia.c;
      if (aL > 0.002) {
        // półpłaszczyzna n · p > c (ledwie widoczna): prostokąt pola przycięty prostą
        const rog = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], wiel: number[][] = [], kraw: number[][] = [];
        for (let i = 0; i < 4; i++) {
          const p = rog[i], q = rog[(i + 1) % 4], fp = f(p[0], p[1]), fq = f(q[0], q[1]);
          if (fp >= 0) wiel.push(p);
          if ((fp >= 0) !== (fq >= 0)) {
            const u = fp / (fp - fq), m = [p[0] + u * (q[0] - p[0]), p[1] + u * (q[1] - p[1])];
            wiel.push(m); kraw.push(m);
          }
        }
        if (wiel.length > 2) {
          c.fillStyle = G.rgba(POLE * aL);
          c.beginPath(); c.moveTo(wiel[0][0], wiel[0][1]);
          for (let i = 1; i < wiel.length; i++) c.lineTo(wiel[i][0], wiel[i][1]);
          c.closePath(); c.fill();
        }
        if (kraw.length >= 2) {
          c.strokeStyle = G.rgba(PROSTA * aL); c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(kraw[0][0], kraw[0][1]); c.lineTo(kraw[1][0], kraw[1][1]); c.stroke();
        }
      }
      // punkty: na prostej jaśniejsze; A — pełne kropki, B — kółka
      const krycie = (p: Pkt) => (Math.abs(f(p.x, p.y)) < 0.8 && aL > 0.5 ? NA_PROSTEJ : PUNKT) * (stoi ? 1 : alfa(p, t));
      for (const p of A) {
        const k = krycie(p);
        if (k < 0.003) continue;
        c.fillStyle = G.rgba(k); c.beginPath(); c.arc(p.x, p.y, RA, 0, 2 * Math.PI); c.fill();
      }
      c.lineWidth = 1;
      for (const p of B) {
        const k = krycie(p);
        if (k < 0.003) continue;
        c.strokeStyle = G.rgba(k); c.beginPath(); c.arc(p.x, p.y, RB, 0, 2 * Math.PI); c.stroke();
      }
    },
    // ograniczenie ruchu: wszystkie punkty i prosta podziału
    gotowy() { stoi = true; ruch = null; linia.phi = cel.phi; linia.c = cel.c; },
  };
};

export default motyw;
