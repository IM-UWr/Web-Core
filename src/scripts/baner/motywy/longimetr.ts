// Seminarium Geometrii / Zakład Geometrii: longimetr Steinhausa (prototyp animacje-struktury.html, „Motyw własny”;
// zaakceptowany 31.10.2026). Przezroczysta płytka z trzema kwadratowymi siatkami prostych co 26 px, obróconymi względem
// siebie o 30° (sześć kierunków: 15°, 45°, …, 165°), i jedna krzywa; kropki to przecięcia krzywej z prostymi (wzór
// Croftona: długość krzywej jest proporcjonalna do liczby przecięć). Seminarium: krzywa otwarta, jak rzeka przez cały
// baner; wariant „zaklad”: krzywa zamknięta (pętla) po prawej stronie, za tekstem.
// Budowa raz przy wejściu (3 s): siatka wyłania się, krzywa rysuje się od prawej, kropki dochodzą. Potem siatka stoi
// (warstwa A), a krzywa meandruje (warstwa B): co 2,5–7 s jeden losowy punkt kontrolny (najwyżej dwa naraz, chętniej
// widoczny) jedzie 1,2 px/s do nowego, losowego celu blisko swojego położenia spoczynkowego (±10 px w poziomie,
// ±17 px w pionie) — krzywa nie odpływa i nie wraca w kółko; kropki przecięć wędrują razem z nią. Klatka po przesunięciu
// punktu o 0,5 px (2,4 kl./s), w przerwach zegar śpi.
// Pole (zlecenie 07): prototyp rysowano w polu od linku (+ 2 px) do 12 px nad liczbami; tu odpowiada mu [y0 + 2, y1 − 6]
// (zanik maski silnika wypada tam, gdzie zanik prototypu, krzywa kończy się ok. 14 px nad połową hasła). Przy 390 px
// i jednoliniowym tytule: 15 px wyżej niż w prototypie, rozrzut krzywej w pionie 83% (pole kończy się teraz w połowie
// hasła, a nie pod nim), przy dwóch liniach tytułu 87%; siatka (tło) bez zmian, wypełnia całe pole.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { S, generator } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const D = 26, SIATKA = 0.06, KRZYWA = 0.42, KROPKI = 0.62, RK = 1.5, ZIARNO = 1930, PROBKI = 14;
const BUDOWA = 3, FPS_BUD = 15, V = 1.2, KROK_PX = 0.5, NA_RAZ = 2, PRZERWA0 = 2.5, PRZERWA1 = 7, PIERWSZY = 1.5;

type Pt = [number, number];
const losowo = (a: number, b: number) => a + Math.random() * (b - a);

const motyw: Fabryka = (G, t0) => {
  // pole „prototypu”: od y0 + 2 do y1 − 6
  const f0 = G.y0 + 2, f1 = G.y1 - 6, h = f1 - f0, mid = (f0 + f1) / 2, x1 = G.x1;
  // jak alfa prototypu: maska silnika i 10 px zaniku przy prawym brzegu treści
  const alfa = (x: number, y: number) => G.widac(x, y) * S((x1 - x) / 10);
  // kolor z zanikiem w ostatnich 10 px przed prawym brzegiem treści (proste i krzywa sięgają za brzeg)
  const prawy = (c: CanvasRenderingContext2D, a: number) => {
    const g = c.createLinearGradient(x1 - 10, 0, x1, 0);
    for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, G.rgba(a * S(1 - i / 4)));
    return g;
  };

  const los = generator(ZIARNO);
  // sześć rodzin prostych: normalna (nx, ny), przesunięcie off; prosta m: nx·x + ny·y = off + m·D
  const rodziny = Array.from({ length: 6 }, (_, k) => {
    const a = (15 + 30 * k) * Math.PI / 180;
    return { nx: -Math.sin(a), ny: Math.cos(a), off: los() * D };
  });
  const petla = G.wariant === 'zaklad', P: Pt[] = [];
  if (!petla) {
    // seminarium: 7 punktów kontrolnych od prawej za brzegiem do lewej za brzegiem
    for (let i = 0; i < 7; i++) P.push([x1 + 34 - i * (x1 + 68) / 6, mid + (los() - 0.5) * 0.62 * h]);
  } else {
    // zakład: pętla po prawej, zaczyna się tam, gdzie w środkowej części pola rysunek jest już w pełni widoczny
    let wolne = 0;
    for (let y = f0 + 0.25 * h; y <= f1 - 0.25 * h; y += 4) wolne = Math.max(wolne, G.granica(y));
    const start = Math.min(x1 - 150, Math.max(G.W * 0.42, wolne + 45)), rx = Math.max(55, (x1 - 6 - start) / 2), cx = x1 - 6 - rx, ry = 0.4 * h;
    for (let j = 0; j < 7; j++) { const t = 2 * Math.PI * j / 7 + 0.4, f = 0.82 + 0.3 * los(); P.push([cx + rx * f * Math.cos(t), mid + ry * f * Math.sin(t)]); }
  }
  const R = P.map((p): Pt => [p[0], p[1]]);              // położenia spoczynkowe

  // krzywa Catmulla–Roma przez punkty kontrolne (14 próbek na odcinek) i jej przecięcia z prostymi siatki
  let krzywa: number[] = [], kropki: number[] = [], box: Pudlo = [0, 0, 0, 0];
  const przelicz = () => {
    const n = P.length, pts: number[] = [];
    const pt = (i: number) => (petla ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
    for (let i = 0, segs = petla ? n : n - 1; i < segs; i++) {
      const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2);
      for (let s = 0; s < PROBKI; s++) {
        const t = s / PROBKI, t2 = t * t, t3 = t2 * t;
        for (let k = 0; k < 2; k++) pts.push(0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3));
      }
    }
    const ost = petla ? P[0] : P[n - 1];
    pts.push(ost[0], ost[1]);
    // kropki: [x, y, część długości krzywej, do której należą — do budowy]
    const K: number[] = [];
    for (const r of rodziny) {
      for (let j = 0; j + 3 < pts.length; j += 2) {
        const sa = (r.nx * pts[j] + r.ny * pts[j + 1] - r.off) / D, sb = (r.nx * pts[j + 2] + r.ny * pts[j + 3] - r.off) / D;
        const lo = Math.min(sa, sb), hi = Math.max(sa, sb);
        for (let m = Math.ceil(lo); m <= hi && hi - lo > 1e-9; m++) {
          const u = (m - sa) / (sb - sa);
          K.push(pts[j] + u * (pts[j + 2] - pts[j]), pts[j + 1] + u * (pts[j + 3] - pts[j + 1]), j / pts.length);
        }
      }
    }
    let ya = Infinity, yb = -Infinity, xa = Infinity, xb = -Infinity;
    for (let j = 0; j < pts.length; j += 2) { xa = Math.min(xa, pts[j]); xb = Math.max(xb, pts[j]); ya = Math.min(ya, pts[j + 1]); yb = Math.max(yb, pts[j + 1]); }
    krzywa = pts; kropki = K; box = [xa - 3, ya - 3, xb + 3, yb + 3];
  };
  przelicz();

  // ---------- czas: budowa od t0 (po zmianie układu — od razu gotowe), potem ruch punktów ----------
  const tB = t0 > 0 ? -1e9 : t0;                          // początek budowy
  const postep = (t: number) => (stoi ? 1 : Math.min(1, Math.max(0, (t - tB) / BUDOWA)));
  const ruchome: number[] = [], cel: Pt[] = P.map((p): Pt => [p[0], p[1]]);
  let stoi = false, pOst = -1, tPrev = -1, akum = 0, tNast = Math.max(t0, tB + BUDOWA) + PIERWSZY;

  const wybierz = (t: number) => {
    const wolne = P.map((_, i) => i).filter((i) => !ruchome.includes(i));
    const widoczne = wolne.filter((i) => alfa(P[i][0], P[i][1]) > 0.3), z = widoczne.length ? widoczne : wolne;
    if (!z.length) return;
    const i = z[Math.floor(Math.random() * z.length)], r = R[i];
    cel[i] = [r[0] + losowo(-10, 10), Math.max(f0 + 8, Math.min(f1 - 8, r[1] + losowo(-17, 17)))];
    ruchome.push(i);
    tNast = t + losowo(PRZERWA0, PRZERWA1);
  };

  return {
    krok(t) {
      const p = postep(t);
      if (p < 1 || pOst < 1) {
        // budowa: obie warstwy co klatkę; ostatnia klatka dokładnie w p = 1
        const a = p !== pOst;
        pOst = p; tPrev = t;
        return { a, b: a, za: p < 1 ? Math.min(1 / FPS_BUD, Math.max(0.01, tB + BUDOWA - t)) : Math.max(0.05, tNast - t) };
      }
      const dt = tPrev < 0 ? 0 : Math.max(0, t - tPrev);
      tPrev = t;
      if (!stoi && t >= tNast && ruchome.length < NA_RAZ) wybierz(t);
      let ruszone = 0;
      for (let q = ruchome.length - 1; q >= 0; q--) {
        const i = ruchome[q], pp = P[i], c = cel[i], dx = c[0] - pp[0], dy = c[1] - pp[1], dl = Math.hypot(dx, dy), s = V * dt;
        if (dl <= s) { pp[0] = c[0]; pp[1] = c[1]; ruchome.splice(q, 1); ruszone = Math.max(ruszone, dl); }
        else { pp[0] += dx / dl * s; pp[1] += dy / dl * s; ruszone = Math.max(ruszone, s); }
      }
      akum += ruszone;
      const b = akum >= KROK_PX || (ruszone > 0 && !ruchome.length);
      if (b) { przelicz(); akum = 0; }
      return { a: false, b, za: ruchome.length ? KROK_PX / V : Math.max(0.05, tNast - t) };
    },
    // siatka: sześć rodzin prostych przez całe pole (tło)
    rysuj(c, t) {
      const a = SIATKA * S(postep(t) * 2);
      if (a <= 0) return;
      const ya = G.y0 - 2, yb = G.y1 + 2, L = Math.hypot(G.W, yb) + 10;
      c.lineWidth = 0.8; c.strokeStyle = prawy(c, a);
      c.beginPath();
      for (const r of rodziny) {
        const v = [[0, ya], [G.W, ya], [0, yb], [G.W, yb]].map((q) => (r.nx * q[0] + r.ny * q[1] - r.off) / D);
        const dx = r.ny, dy = -r.nx;
        for (let m = Math.floor(Math.min(...v)); m <= Math.ceil(Math.max(...v)); m++) {
          const s = r.off + m * D, px = r.nx * s, py = r.ny * s;
          c.moveTo(px - dx * L, py - dy * L); c.lineTo(px + dx * L, py + dy * L);
        }
      }
      c.stroke();
    },
    // krzywa i kropki przecięć (w budowie — narysowana część krzywej i jej kropki)
    rysujB(c, t) {
      const p = postep(t);
      if (p <= 0.18) return [0, 0, 0, 0];
      const pts = krzywa, n = pts.length / 2, ile = Math.max(2, Math.floor(n * S(p * 1.4 - 0.25)));
      c.lineWidth = 1.25; c.strokeStyle = prawy(c, KRZYWA);
      c.beginPath(); c.moveTo(pts[0], pts[1]);
      for (let i = 1; i < ile; i++) c.lineTo(pts[2 * i], pts[2 * i + 1]);
      c.stroke();
      const ak = KROPKI * S((p - 0.5) * 3), fr = ile / n;
      if (ak > 0.003) {
        c.fillStyle = prawy(c, ak);
        c.beginPath();
        for (let j = 0; j < kropki.length; j += 3) if (kropki[j + 2] <= fr) { c.moveTo(kropki[j] + RK, kropki[j + 1]); c.arc(kropki[j], kropki[j + 1], RK, 0, 2 * Math.PI); }
        c.fill();
      }
      return box;
    },
    gotowy() { stoi = true; },
  };
};

export default motyw;
