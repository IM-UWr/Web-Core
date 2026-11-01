// Obrony doktorskie: drzewo genealogii matematycznej — kropka to doktor, krawędź prowadzi od promotora do doktoranta
// (jak w Mathematics Genealogy Project); prototyp animacje-wydarzenia.html, motywy „Drzewo genealogii” i „Nowy liść
// drzewa”, ustawienia telefonu; zaakceptowany 31.10.2026.
// Pokolenia w kolumnach co 30 px: najstarsze po lewej (giną pod tytułem), najmłodsze przy prawym brzegu; wiersze co 11 px.
// Kształt startowy losowany jak proces Galtona–Watsona (każdy doktor ma 0–3 doktorantów, w najmłodszych trzech kolumnach
// co najmniej po trzy kropki). Przy wejściu drzewo rośnie raz, pokolenie po pokoleniu (9 s). Potem co losową przerwę
// (średnio 9 s) jedno zdarzenie: nowy doktor (krawędź rośnie 2,5 px/s, potem kropka pojawia się przez 1,5 s) albo
// wygaśnięcie liścia (kropka gaśnie, krawędź się cofa). Miejsca losowane tam, gdzie rysunek dobrze widać (G.widac),
// a liczba doktorów trzyma się blisko startowej.
// Wariant „obrona” (strona jednej obrony): to samo drzewo z wyróżnioną gałęzią od korzenia do nowego liścia — doktora
// z tej strony (liść z cienkim pierścieniem, gałąź trochę jaśniejsza, nadal szara). Liść dorasta na końcu budowy, potem
// zdarzenia są rzadsze (średnio co 14 s), a wyróżniona gałąź stoi.
// Klatki: co 0,5 px rosnącej albo cofającej się krawędzi (5 kl./s), 8 kl./s przez 1,5 s pojawiania się albo gaśnięcia
// kropki; między zdarzeniami zegar śpi. Jedna warstwa: krawędzie w jednej ścieżce, więc wspólne odcinki rodzeństwa
// się nie sumują.
// Zlecenie 07: wiersze mieszczą się w polu rysunku silnika (od paska menu + 6 px do połowy hasła) z zapasem na łagodne
// brzegi maski (5 px u góry, 10 px u dołu). Liczba wierszy wynika z wysokości pola, jak w prototypie: przy 390 × 844
// pole ma 104 px, więc jest 9 wierszy (72–160 px) zamiast 10 (82–181 px) — górny wiersz 10 px wyżej, odstępy bez zmian
// (wiersze co 11 px, kolumny co 30 px; skala 100%).
import type { Fabryka, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const LINIA = 0.2, KROPKI = 1.9, GALAZ = 1.3, PIERSCIEN = 2.3, LISC = 2.6;   // krycie krawędzi; reszta — wielokrotności
const DX = 30, DY = 11, MAXK = 7, GORA = 5, DOL = 10;                       // siatka (px), kropek w kolumnie, zapas pola
const BUDOWA = 9, TEMPO = 2.5, KROPKA = 1.5, PRZERWA = 9, PRZERWA_OBRONA = 14, FPS_BUDOWY = 24, FPS_KROPKI = 8;

type Stan = 'jest' | 'rosnie' | 'kropka' | 'gasnie' | 'cofa';
/** doktor: kolumna (pokolenie), wiersz, promotor; g — narysowana część krawędzi od promotora (L — cała), a — krycie kropki;
 *  linia — na wyróżnionej gałęzi (wariant „obrona”) */
type Wezel = { c: number; j: number; p: Wezel | null; dzieci: Wezel[]; g: number; L: number; a: number; stan: Stan; usun: boolean; linia: boolean };

/** przerwa losowa: rozkład wykładniczy o średniej sr, przycięty do [0,35·sr; 2,5·sr] — bez rytmu i bez skrajności */
const przerwa = (sr: number) => Math.min(2.5 * sr, Math.max(0.35 * sr, -Math.log(1 - Math.random()) * sr));
function tasuj<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** indeks losowany z wagami (−1, gdy wszystkie wagi są zerowe) */
function wybierz(wagi: number[]): number {
  let r = Math.random() * wagi.reduce((s, w) => s + w, 0);
  if (r <= 0) return -1;
  for (let i = 0; i < wagi.length; i++) { r -= wagi[i]; if (r <= 0) return i; }
  return wagi.length - 1;
}
/** liczba doktorantów (Galton–Watson): pierwsze dwa pokolenia 1–3, dalej 0–3 (średnio ok. 1,2) */
function dzieciLos(c: number): number {
  const u = Math.random();
  if (c < 2) return u < 0.2 ? 1 : u < 0.8 ? 2 : 3;
  return u < 0.24 ? 0 : u < 0.64 ? 1 : u < 0.93 ? 2 : 3;
}

const motyw: Fabryka = (G, t0) => {
  const obrona = G.wariant === 'obrona', sr = obrona ? PRZERWA_OBRONA : PRZERWA;
  // siatka: kolumny od prawego brzegu treści w lewo, wiersze wyśrodkowane w polu (z zapasem na brzegi maski)
  const C = Math.floor((G.x1 - G.x0) / DX) + 1, X: number[] = [], Y: number[] = [];
  for (let c = 0; c < C; c++) X.push(G.x1 - (C - 1 - c) * DX);
  const h = G.y1 - DOL - (G.y0 + GORA), R = Math.max(3, Math.floor(h / DY) + 1), yp = G.y0 + GORA + (h - (R - 1) * DY) / 2;
  for (let j = 0; j < R; j++) Y.push(yp + j * DY);

  let wezly: Wezel[] = [], zaj: (Wezel | null)[][] = [];
  const dodaj = (c: number, j: number, p: Wezel | null, stan: Stan = 'jest'): Wezel => {
    const n: Wezel = { c, j, p, dzieci: [], g: 0, L: 0, a: 0, stan, usun: false, linia: false };
    if (p) { p.dzieci.push(n); n.L = DX + Math.abs(Y[j] - Y[p.j]); }
    wezly.push(n); zaj[c][j] = n;
    return n;
  };
  const usun = (n: Wezel) => { n.usun = true; zaj[n.c][n.j] = null; if (n.p) n.p.dzieci.splice(n.p.dzieci.indexOf(n), 1); };
  const ileWKol = (c: number) => zaj[c].reduce((k, n) => k + (n ? 1 : 0), 0);
  // wolne wiersze w kolumnie c najbliżej wiersza j (±2), od najbliższego; równe odległości w losowej kolejności
  const wolne = (c: number, j: number) => {
    const o: number[] = [];
    for (let d = -2; d <= 2; d++) { const q = j + d; if (q >= 0 && q < R && !zaj[c][q]) o.push(q); }
    return tasuj(o).sort((a, b) => Math.abs(a - j) - Math.abs(b - j));
  };

  // drzewo startowe: korzeń w środkowym wierszu, pokolenia po kolei; do 80 prób, aż prawa część będzie dość gęsta
  for (let proba = 0; proba < 80; proba++) {
    wezly = []; zaj = Array.from({ length: C }, () => new Array<Wezel | null>(R).fill(null));
    dodaj(0, Math.floor((R - 1) / 2) + (Math.random() < 0.5 ? 0 : 1), null);
    for (let c = 0; c < C - 1; c++) {
      tasuj(wezly.filter((n) => n.c === c)).forEach((n) => {
        wolne(c + 1, n.j).slice(0, dzieciLos(c)).forEach((j) => { if (ileWKol(c + 1) < MAXK) dodaj(c + 1, j, n); });
      });
    }
    if (C < 4 || (ileWKol(C - 1) >= 3 && ileWKol(C - 2) >= 3 && ileWKol(C - 3) >= 3)) break;
  }

  // wariant „obrona”: miejsce na nowy liść (ta obrona) — dobrze widoczne razem z pierścieniem (też 5 px wyżej i niżej),
  // w trzech najmłodszych kolumnach, z promotorem obok (najwyżej 3 doktorantów); chętniej w ostatniej kolumnie
  // i na wprost promotora
  let kand: Wezel | null = null;
  if (obrona) {
    const opcje: [number, number, Wezel][] = [], wagi: number[] = [];
    for (let c = C - 1; c >= Math.max(1, C - 3); c--) for (let j = 0; j < R; j++) {
      if (zaj[c][j]) continue;
      const v = Math.min(G.widac(X[c], Y[j]), G.widac(X[c], Y[j] - 5), G.widac(X[c], Y[j] + 5));
      if (v < 0.9) continue;
      for (let d = -1; d <= 1; d++) {
        const p = zaj[c - 1][j + d];
        if (p && p.dzieci.length < 3) { opcje.push([c, j, p]); wagi.push(v * (c === C - 1 ? 1.4 : 1) * (d === 0 ? 1.3 : 1)); }
      }
    }
    const i = wybierz(wagi);
    if (i >= 0) {
      kand = dodaj(opcje[i][0], opcje[i][1], opcje[i][2], 'rosnie');
      for (let p = kand.p; p; p = p.p) p.linia = true;
    }
  }
  const T0 = wezly.length;

  // nowy układ w trakcie oglądania (t0 > 0): drzewo od razu gotowe, bez budowania
  const pelne = () => {
    for (const n of wezly) {
      if (n.usun) continue;
      if (n.stan === 'gasnie' || n.stan === 'cofa') { usun(n); continue; }
      n.g = n.L; n.a = 1; n.stan = 'jest';
    }
    wezly = wezly.filter((n) => !n.usun);
  };
  let budowa = !(t0 > 0), tPrev = t0, nast = t0 + przerwa(sr), zd: Wezel | null = null, zm = 1, zmA = 0;
  if (!budowa) pelne();

  // zdarzenie: narodziny (nowa krawędź do wolnego miejsca obok doktora) albo wygaśnięcie liścia; wagi — kwadrat widoczności
  const zdarzenie = () => {
    const rodzic: [Wezel, number][] = [], rw: number[] = [], liscie: Wezel[] = [], lw: number[] = [];
    for (const n of wezly) {
      if (n.usun || n.stan !== 'jest') continue;
      if (n.c < C - 1 && n.dzieci.length < 3 && n !== kand && ileWKol(n.c + 1) < MAXK) {
        for (const j of wolne(n.c + 1, n.j)) {
          const w = G.widac(X[n.c + 1], Y[j]) ** 2 * (0.4 + n.c / C) * (n.dzieci.length ? 1 : 1.5);
          if (w > 0.02) { rodzic.push([n, j]); rw.push(w); }
        }
      }
      if (n.p && !n.dzieci.length && !n.linia && n !== kand) {
        const w = G.widac(X[n.c], Y[n.j]) ** 2 * (0.3 + n.c / C);
        if (w > 0.02) { liscie.push(n); lw.push(w); }
      }
    }
    const zywe = wezly.filter((n) => !n.usun).length;
    let narodziny = zywe < T0 - 2 ? true : zywe > T0 + 2 ? false : Math.random() < 0.5;
    if (narodziny && !rodzic.length) narodziny = false;
    if (!narodziny && !liscie.length) narodziny = rodzic.length > 0;
    if (narodziny) { const i = wybierz(rw); if (i >= 0) zd = dodaj(rodzic[i][0].c + 1, rodzic[i][1], rodzic[i][0], 'rosnie'); }
    else if (liscie.length) { const i = wybierz(lw); if (i >= 0) { zd = liscie[i]; zd.stan = 'gasnie'; } }
  };

  // krawędź łokciem jak w drzewie genealogicznym: w prawo, w pionie, w prawo — narysowana do drogi g
  const krawedz = (c: CanvasRenderingContext2D, n: Wezel, g: number) => {
    const p = n.p!, x0 = X[p.c], y0 = Y[p.j], a = DX * 0.45, xm = x0 + a, y1 = Y[n.j], b = Math.abs(y1 - y0);
    c.moveTo(x0, y0);
    if (g <= a) { c.lineTo(x0 + g, y0); return; }
    c.lineTo(xm, y0);
    if (g <= a + b) { c.lineTo(xm, y0 + Math.sign(y1 - y0) * (g - a)); return; }
    c.lineTo(xm, y1); c.lineTo(Math.min(X[n.c], xm + (g - a - b)), y1);
  };

  return {
    krok(t) {
      const dt = Math.max(0, t - tPrev);
      tPrev = t;
      let za = Math.max(0.05, nast - t);
      if (budowa) {
        // pokolenie po pokoleniu: krawędzie kolumny c rosną, gdy q przechodzi od c − 1 do c; kropka, gdy krawędź dojdzie
        const q = S((t - t0) / BUDOWA) * (C - 1);
        for (const n of wezly) {
          if (n === kand) continue;
          const f = n.p ? Math.min(1, Math.max(0, q - (n.c - 1))) : 1, g = n.L * f, a = f >= 1 ? 1 : 0;
          zm += Math.abs(g - n.g); zmA += Math.abs(a - n.a);
          n.g = g; n.a = a;
        }
        za = 1 / FPS_BUDOWY;
        if (t - t0 >= BUDOWA) {
          budowa = false;
          if (kand) zd = kand; else nast = t + przerwa(sr);
        }
      } else if (zd) {
        const n: Wezel = zd;
        if (n.stan === 'rosnie') { const g = Math.min(n.L, n.g + TEMPO * dt); zm += g - n.g; n.g = g; if (g >= n.L) n.stan = 'kropka'; }
        else if (n.stan === 'kropka') { const a = Math.min(1, n.a + dt / KROPKA); zmA += a - n.a; n.a = a; if (a >= 1) { n.stan = 'jest'; zd = null; nast = t + przerwa(sr); } }
        else if (n.stan === 'gasnie') { const a = Math.max(0, n.a - dt / KROPKA); zmA += n.a - a; n.a = a; if (a <= 0) n.stan = 'cofa'; }
        else if (n.stan === 'cofa') {
          const g = Math.max(0, n.g - TEMPO * dt);
          zm += n.g - g; n.g = g;
          if (g <= 0) { usun(n); wezly = wezly.filter((w) => !w.usun); zm = 1; zd = null; nast = t + przerwa(sr); }
        }
        za = zd ? (zd.stan === 'rosnie' || zd.stan === 'cofa' ? 0.5 / TEMPO : 1 / FPS_KROPKI) : Math.max(0.05, nast - t);
      } else if (t >= nast) {
        zdarzenie();
        if (!zd) nast = t + przerwa(sr);
        za = zd ? 1 / FPS_KROPKI : Math.max(0.05, nast - t);
      }
      // klatka po zmianie krawędzi o ≥ 0,5 px albo krycia kropki o widoczny stopień
      const a = zm >= 0.5 || zmA * 255 * KROPKI * LINIA >= 1.5;
      if (a) { zm = 0; zmA = 0; }
      return { a, za };
    },
    rysuj(c) {
      c.lineWidth = 1;
      c.beginPath();
      for (const n of wezly) if (n.p && n.g > 0) krawedz(c, n, n.g);
      c.strokeStyle = G.rgba(LINIA); c.stroke();
      if (kand) {                                          // gałąź tej obrony: od korzenia do nowego liścia
        c.beginPath();
        for (let p: Wezel | null = kand; p && p.p; p = p.p) if (p.g > 0) krawedz(c, p, p.g);
        c.lineWidth = 1.4; c.strokeStyle = G.rgba(LINIA * GALAZ); c.stroke(); c.lineWidth = 1;
      }
      c.beginPath();
      for (const n of wezly) {
        if (n.a < 1) continue;
        const r = n.p ? 1.5 : 2.2;
        c.moveTo(X[n.c] + r, Y[n.j]); c.arc(X[n.c], Y[n.j], r, 0, 2 * Math.PI);
      }
      c.fillStyle = G.rgba(LINIA * KROPKI); c.fill();
      for (const n of wezly) {
        if (n.a <= 0 || n.a >= 1) continue;
        c.beginPath(); c.arc(X[n.c], Y[n.j], 1.5, 0, 2 * Math.PI); c.fillStyle = G.rgba(LINIA * KROPKI * n.a); c.fill();
      }
      if (kand && kand.a > 0) {
        c.beginPath(); c.arc(X[kand.c], Y[kand.j], 4.4, 0, 2 * Math.PI);
        c.lineWidth = 1.1; c.strokeStyle = G.rgba(LINIA * PIERSCIEN * kand.a); c.stroke();
        c.beginPath(); c.arc(X[kand.c], Y[kand.j], 2, 0, 2 * Math.PI); c.fillStyle = G.rgba(LINIA * LISC * kand.a); c.fill();
      }
    },
    // ograniczenie ruchu: całe drzewo (z liściem tej obrony), bez zdarzeń
    gotowy() { budowa = false; zd = null; nast = Infinity; pelne(); },
  };
};

export default motyw;
