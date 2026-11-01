// Konferencje: punkt stały Banacha — „Punkt spotkania” (prototyp animacje-wydarzenia.html, motyw własny, ustawienia
// telefonu; zaakceptowany 31.10.2026). Łamane kolejnych przybliżeń x, f(x), f(f(x)), … odwzorowania zwężającego
// f(z) = P + D·r·Obr(θ)·D⁻¹(z − P) (zwężające w normie eliptycznej, D = diag(ax, ay)) z losowych punktów startu — wszystkie
// kończą się w jednym punkcie stałym P, jak goście konferencji zjeżdżający z różnych stron do jednego miejsca. Kąt obrotu,
// zwężenie i miejsce P losowane przy każdym wejściu, więc rysunek się nie powtarza.
// Przy wejściu pięć łamanych rysuje się raz (10 s). Potem z losowego punktu rośnie najwyżej jedna nowa łamana naraz
// (2,5 px/s, zwykle 1–3 min), po niej losowa przerwa (średnio 8 s); gdy żywych łamanych jest więcej niż pięć, najstarsza
// powoli gaśnie (16 s). Klatka po przyroście łamanej o ≥ 0,5 px (5 kl./s) albo po widocznej zmianie krycia gasnącej
// (ok. 2 kl./s); w przerwach zegar śpi. Jedna warstwa: łamane w jednej ścieżce, więc przy punkcie spotkania krycie się
// nie sumuje (bez jasnej plamy).
// Zlecenie 07: łamane mieszczą się w polu rysunku silnika (od paska menu + 6 px do połowy hasła; każdy wierzchołek
// w polu — łamane, które by z niego wyszły, są odrzucane). Przy 390 × 844 pole ma 104 px (w prototypie 114 px, od linku
// do 12 px nad kreską), więc P leży 13 px wyżej niż w prototypie, a elipsa ma tę samą wielkość (ay = 54 px, skala 100%).
// Warianty na później (G.wariant): szkoła doktorska i Szukaj (pajęczyny) — własne plany zdarzeń na tych samych funkcjach
// mapa() i orbita(); domyślny plan (Konferencje) jest w fabryce niżej.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const LINIA = 0.18, KROPKI = 1.5, PUNKT = 2.2;            // krycie łamanych; kropki i pierścień P — wielokrotności
const ILE = 5, BUDOWA = 10, TEMPO = 2.5, PRZERWA = 8, GASNIE = 16, FPS_BUDOWY = 24;

type Mapa = { px: number; py: number; ax: number; ay: number; r: number; cs: number; sn: number };
/** łamana: wierzchołki (x, y kolejno), droga od startu do każdego wierzchołka, długość */
type Lamana = { p: number[]; c: number[]; L: number };
/** łamana na rysunku: rośnie od chwili `od` (przy budowie — razem z innymi przez BUDOWA s), gaśnie od chwili `gas` */
type Lam = Lamana & { od: number; bud: boolean; gas: number; s: number; a: number; sR: number; aR: number };

const los = (a: number, b: number) => a + Math.random() * (b - a);
/** przerwa losowa: rozkład wykładniczy o średniej sr, przycięty do [0,35·sr; 2,5·sr] — bez rytmu i bez skrajności */
const przerwa = (sr: number) => Math.min(2.5 * sr, Math.max(0.35 * sr, -Math.log(1 - Math.random()) * sr));

/** odwzorowanie zwężające: P tam, gdzie rysunek dobrze widać (też 18 px wyżej i niżej) — od pierwszego takiego miejsca
 *  na wysokości środka pola losowo 40–70% drogi do prawego brzegu (z zapasem 40 px); elipsa na całą wysokość pola
 *  (półoś ay o 2 px większa niż połowa pola — przy 390 × 844 tyle co w prototypie; skrajne łamane i tak odpadają w orbita()) */
function mapa(G: Pole): Mapa {
  const yc = (G.y0 + G.y1) / 2 + los(-4, 4);
  let xv = G.x1;
  for (let x = G.x0; x < G.x1; x += 2) if (G.widac(x, yc) > 0.97 && G.widac(x, yc - 18) > 0.9 && G.widac(x, yc + 18) > 0.9) { xv = x; break; }
  const ay = (G.y1 - G.y0) / 2 + 2, th = los(30, 40) * Math.PI / 180 * (Math.random() < 0.5 ? 1 : -1);
  return { px: Math.min(G.x1 - 40, xv + Math.max(0, G.x1 - 40 - xv) * los(0.4, 0.7)), py: yc, ax: ay * los(2, 2.5), ay, r: los(0.84, 0.88), cs: Math.cos(th), sn: Math.sin(th) };
}

/** łamana kolejnych przybliżeń z losowego punktu (w normie elipsy 0,55–1,3 od P, najlepiej tam, gdzie ją widać);
 *  wszystkie wierzchołki w polu rysunku; kończy się, gdy do P zostaje < 0,6 px */
function orbita(G: Pole, m: Mapa): Lamana | null {
  for (let proba = 0; proba < 400; proba++) {
    const x = los(G.x0, G.x1), y = los(G.y0 + 2, G.y1 - 2);
    let u = (x - m.px) / m.ax, v = (y - m.py) / m.ay;
    const R = Math.hypot(u, v);
    if (R < 0.55 || R > 1.3 || (proba < 300 && G.widac(x, y) < 0.4)) continue;
    const p: number[] = [];
    let ok = true;
    for (let n = 0; n < 300; n++) {
      const X = m.px + m.ax * u, Y = m.py + m.ay * v;
      if (X < G.x0 - 0.5 || X > G.x1 + 0.5 || Y < G.y0 - 0.5 || Y > G.y1 + 0.5) { ok = false; break; }
      p.push(X, Y);
      if (Math.hypot(m.ax * u, m.ay * v) < 0.6) break;
      const u2 = m.r * (m.cs * u - m.sn * v);
      v = m.r * (m.sn * u + m.cs * v); u = u2;
    }
    if (!ok || p.length < 8) continue;
    const c = [0];
    for (let i = 2; i < p.length; i += 2) c.push(c[c.length - 1] + Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]));
    return { p, c, L: c[c.length - 1] };
  }
  return null;
}

/** łamana do drogi s (px od startu) */
function sciezka(c: CanvasRenderingContext2D, o: Lamana, s: number) {
  const p = o.p, d = o.c;
  c.moveTo(p[0], p[1]);
  for (let i = 1; i < d.length; i++) {
    if (d[i] <= s) { c.lineTo(p[2 * i], p[2 * i + 1]); continue; }
    const f = (s - d[i - 1]) / (d[i] - d[i - 1]);
    c.lineTo(p[2 * i - 2] + f * (p[2 * i] - p[2 * i - 2]), p[2 * i - 1] + f * (p[2 * i + 1] - p[2 * i - 1]));
    break;
  }
}

/** kropki w wierzchołkach, do których łamana już doszła — bez tych przy samym P (< 5 px), żeby nie było plamy */
function kropki(c: CanvasRenderingContext2D, o: Lamana, s: number, m: Mapa) {
  const p = o.p;
  for (let i = 0; i < o.c.length && o.c[i] <= s; i++) {
    if (Math.hypot(p[2 * i] - m.px, p[2 * i + 1] - m.py) < 5) break;
    c.moveTo(p[2 * i] + 1.1, p[2 * i + 1]); c.arc(p[2 * i], p[2 * i + 1], 1.1, 0, 2 * Math.PI);
  }
}

const motyw: Fabryka = (G, t0) => {
  const m = mapa(G);
  // nowy układ w trakcie oglądania (t0 > 0): łamane od razu gotowe, bez budowania
  const bez = t0 > 0, lam: Lam[] = [];
  const dodaj = (o: Lamana, od: number, bud: boolean): Lam => {
    const l: Lam = { ...o, od, bud, gas: Infinity, s: 0, a: 1, sR: -1, aR: 1 };
    lam.push(l);
    return l;
  };
  for (let i = 0; i < ILE; i++) { const o = orbita(G, m); if (o) dodaj(o, bez ? -1e9 : t0, !bez); }
  const koniecBudowy = bez ? t0 : t0 + BUDOWA;
  let nast = koniecBudowy + przerwa(PRZERWA), rosnie: Lam | null = null, stoi = false, ile = -1;
  const dlugosc = (l: Lam, t: number) => stoi ? l.L : l.bud ? l.L * S((t - l.od) / BUDOWA) : Math.min(l.L, Math.max(0, (t - l.od) * TEMPO));

  // nowa łamana zaczyna rosnąć w chwili s; gdy żywych jest więcej niż ILE, najstarsza stojąca zaczyna gasnąć
  const nowa = (s: number) => {
    const o = orbita(G, m);
    if (!o) { nast = s + przerwa(PRZERWA); return; }
    rosnie = dodaj(o, s, false);
    nast = Infinity;                                       // następna dopiero po skończeniu tej (i losowej przerwie)
    const zywe = lam.filter((l) => l.gas === Infinity);
    if (zywe.length > ILE) { const st = zywe.find((l) => l !== rosnie); if (st) st.gas = s; }
  };

  return {
    krok(t) {
      for (let g = 0; g < 8 && !stoi; g++) {
        if (rosnie && t >= rosnie.od + rosnie.L / TEMPO) { nast = rosnie.od + rosnie.L / TEMPO + przerwa(PRZERWA); rosnie = null; continue; }
        if (!rosnie && t >= nast) { nowa(nast); continue; }
        break;
      }
      for (let i = lam.length - 1; i >= 0; i--) if (t >= lam[i].gas + GASNIE) lam.splice(i, 1);
      // klatka, gdy któraś łamana urosła o ≥ 0,5 px, krycie gasnącej zmieniło się o widoczny stopień albo ubyła łamana
      let a = ile !== lam.length, gas = false;
      for (const l of lam) {
        l.s = dlugosc(l, t); l.a = l.gas === Infinity ? 1 : Math.max(0, 1 - (t - l.gas) / GASNIE);
        if (l.gas < Infinity) gas = true;
        if (Math.abs(l.s - l.sR) >= 0.5 || Math.abs(l.a - l.aR) * LINIA * 255 >= 1.5) a = true;
      }
      if (a) { ile = lam.length; for (const l of lam) { l.sR = l.s; l.aR = l.a; } }
      let za = Math.max(0.05, nast - t);
      if (t < koniecBudowy) za = 1 / FPS_BUDOWY;
      else if (rosnie) za = 0.5 / TEMPO;
      if (gas) za = Math.min(za, 1.5 / 255 / LINIA * GASNIE);
      return { a, za };
    },
    rysuj(c) {
      c.lineWidth = 1;
      c.beginPath();
      for (const l of lam) if (l.gas === Infinity) sciezka(c, l, l.s);
      c.strokeStyle = G.rgba(LINIA); c.stroke();
      c.beginPath();
      for (const l of lam) if (l.gas === Infinity) kropki(c, l, l.s, m);
      c.fillStyle = G.rgba(LINIA * KROPKI); c.fill();
      for (const l of lam) {
        if (l.gas === Infinity || l.a <= 0.003) continue;
        c.beginPath(); sciezka(c, l, l.s); c.strokeStyle = G.rgba(LINIA * l.a); c.stroke();
        c.beginPath(); kropki(c, l, l.s, m); c.fillStyle = G.rgba(LINIA * KROPKI * l.a); c.fill();
      }
      c.beginPath(); c.arc(m.px, m.py, 3.2, 0, 2 * Math.PI);
      c.lineWidth = 1.1; c.strokeStyle = G.rgba(LINIA * PUNKT); c.stroke();
    },
    // ograniczenie ruchu: pięć gotowych łamanych i punkt stały
    gotowy() {
      stoi = true; rosnie = null;
      for (let i = lam.length - 1; i >= 0; i--) if (lam[i].gas < Infinity) lam.splice(i, 1);
      for (const l of lam) { l.s = l.L; l.a = 1; }
    },
  };
};

export default motyw;
