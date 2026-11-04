// Ciekawostki o Hugonie Steinhausie (dział Popularyzacja): rysunki liczone, nie „na oko”.
// Uruchomienie: node generator.js  →  ciekawostki.json, rysunki.html (zrzut: node generator.js --png → rysunki.png)
// Układ: viewBox 0 0 200 240, rysunek w polu x 12–188, y 34–224; tylko linie; kropki to okręgi r = 4.5 (gruba).
'use strict';
const fs = require('fs');
const path = require('path');

const KAT = __dirname;
const POLE = { x0: 12, x1: 188, y0: 34, y1: 224 };

/* ---------- narzędzia ---------- */
const f1 = (v) => { const r = Math.round(v * 10) / 10; return Object.is(r, -0) ? 0 : r; };
const P = (p) => `${f1(p[0])},${f1(p[1])}`;
/** łamana (otwarta albo zamknięta) */
const lam = (pts, zamk = false) => 'M' + pts.map(P).join(' L') + (zamk ? ' Z' : '');
/** okrąg ścieżką (dwa półłuki), jak kropki w obecnych znakach */
const okr = (x, y, r) => `M${f1(x - r)},${f1(y)} a${r},${r} 0 1,0 ${f1(2 * r)},0 a${r},${r} 0 1,0 ${f1(-2 * r)},0`;
const kropka = (x, y, r = 4.5) => okr(x, y, r);
/** generator liczb pseudolosowych (mulberry32) — rysunki są powtarzalne */
function los(ziarno) {
  let a = ziarno >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pole = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const [a, b] = p[i], [c, d] = p[(i + 1) % p.length]; s += a * d - c * b; } return Math.abs(s) / 2; };
/** część wielokąta po stronie n·p ≤ c (obcinanie Sutherlanda–Hodgmana jedną półpłaszczyzną) */
function tnij(p, n, c) {
  const o = [];
  for (let i = 0; i < p.length; i++) {
    const A = p[i], B = p[(i + 1) % p.length], da = A[0] * n[0] + A[1] * n[1] - c, db = B[0] * n[0] + B[1] * n[1] - c;
    if (da <= 0) o.push(A);
    if (da * db < 0) { const t = da / (da - db); o.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); }
  }
  return o;
}
const wSrodku = (q, p) => { let w = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > q[1]) !== (yj > q[1]) && q[0] < (xj - xi) * (q[1] - yi) / (yj - yi) + xi) w = !w; } return w; };
/** zamknięta krzywa Catmulla–Roma przez punkty (k próbek na odcinek) */
function catmull(pk, k = 16, zamk = true) {
  const n = pk.length, o = [];
  const g = (i) => (zamk ? pk[(i + n) % n] : pk[Math.max(0, Math.min(n - 1, i))]);
  for (let i = 0; i < (zamk ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let s = 0; s < k; s++) {
      const t = s / k, t2 = t * t, t3 = t2 * t;
      o.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  if (!zamk) o.push(pk[n - 1]);
  return o;
}
/** krzywa przesunięta o d wzdłuż normalnej (d > 0 — do środka, dla wielokąta zorientowanego jak `orient`) */
function offset(p, d) {
  const n = p.length, s = Math.sign(pole2(p));
  return p.map((q, i) => {
    const a = p[(i - 1 + n) % n], b = p[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty);
    // normalna do środka: dla obiegu dodatniego (w układzie y w dół: zgodnie z zegarem) to (−ty, tx)
    return [q[0] - s * ty / L * d, q[1] + s * tx / L * d];
  });
}
const pole2 = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const [a, b] = p[i], [c, d] = p[(i + 1) % p.length]; s += a * d - c * b; } return s / 2; };
/** przekształcenie punktów: obrót o kąt (rad) wokół (0,0), skala, przesunięcie */
const przeksztalc = (pts, kat, s, dx, dy) => pts.map(([x, y]) => [dx + s * (x * Math.cos(kat) - y * Math.sin(kat)), dy + s * (x * Math.sin(kat) + y * Math.cos(kat))]);
/** dzieli łamaną na kawałki, w których warunek `ok` jest spełniony (granice szukane bisekcją) */
function kawalki(pts, ok, zamk = false) {
  const L = zamk ? pts.concat([pts[0]]) : pts, out = [];
  let cur = null;
  for (let i = 0; i < L.length; i++) {
    const q = L[i], w = ok(q);
    if (i > 0) {
      const p = L[i - 1], wp = ok(p);
      if (wp !== w) {
        let lo = 0, hi = 1;
        for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, r = [p[0] + m * (q[0] - p[0]), p[1] + m * (q[1] - p[1])]; if (ok(r) === wp) lo = m; else hi = m; }
        const t = (lo + hi) / 2, r = [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
        if (cur) { cur.push(r); out.push(cur); cur = null; } else cur = [r];
      }
    }
    if (w) { if (!cur) cur = []; cur.push(q); }
  }
  if (cur && cur.length > 1) out.push(cur);
  // zamknięta: sklej pierwszy i ostatni kawałek, jeśli krzywa zaczyna się w środku kawałka
  if (zamk && out.length > 1 && ok(L[0])) { const a = out.pop(); out[0] = a.concat(out[0].slice(1)); }
  return out.filter((k) => k.length > 1);
}
/** odcinek prostej {p : n·p = c} obcięty do prostokąta */
function prostaWProstokacie(n, c, x0, y0, x1, y1) {
  const t = [-n[1], n[0]], p0 = [n[0] * c, n[1] * c];
  let a = -1e5, b = 1e5;
  for (const [dv, pv, mn, mx] of [[t[0], p0[0], x0, x1], [t[1], p0[1], y0, y1]]) {
    if (Math.abs(dv) < 1e-12) { if (pv < mn || pv > mx) return null; continue; }
    let u = (mn - pv) / dv, v = (mx - pv) / dv; if (u > v) [u, v] = [v, u];
    a = Math.max(a, u); b = Math.min(b, v);
  }
  return a < b ? [[p0[0] + t[0] * a, p0[1] + t[1] * a], [p0[0] + t[0] * b, p0[1] + t[1] * b]] : null;
}
const dl = (pts) => pts.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0);
const log = (...a) => console.log(...a);

/* =====================================================================================
   1. Twierdzenie o kanapce z szynką (1938): kromka i plaster szynki, prosta dzieli pole każdej figury na pół
   ===================================================================================== */
function rysKanapka() {
  // kromka chleba (kontur „tostowy”: prostokątny dół, szersza czapa z dwoma garbami), krzywa Catmulla–Roma
  const kromkaK = [[-38, 50], [0, 52], [38, 50], [46, 40], [45, 6], [47, -10], [57, -24], [55, -44], [36, -58], [12, -56], [0, -50],
    [-12, -56], [-36, -58], [-55, -44], [-57, -24], [-47, -10], [-45, 6], [-46, 40]];
  const kromka = przeksztalc(catmull(kromkaK, 14), -0.1, 0.93, 84, 154);
  const skorka = offset(kromka, 6.5);                       // linia skórki, 6,5 jedn. do środka
  // plaster szynki: owal z lekką falą; tłuszczyk — półksiężyc wzdłuż części brzegu
  const N = 220, szynka = [];
  for (let i = 0; i < N; i++) { const t = 2 * Math.PI * i / N, r = 1 + 0.05 * Math.sin(3 * t + 0.6) + 0.035 * Math.cos(5 * t); szynka.push([44 * r * Math.cos(t), 33 * r * Math.sin(t)]); }
  const sz = przeksztalc(szynka, 0.42, 1, 126, 98);
  // tłuszczyk: krzywa wewnętrzna dla t ∈ [t1, t2], odsunięta o d(t) = 7·sin(π(t − t1)/(t2 − t1))
  const t1 = 0.30 * N, t2 = 0.80 * N, inn = offset(sz, 1), tl = [];
  for (let i = Math.ceil(t1); i <= Math.floor(t2); i++) {
    const w = 7 * Math.sin(Math.PI * (i - t1) / (t2 - t1)), q = sz[i], r = inn[i], nx = r[0] - q[0], ny = r[1] - q[1], L = Math.hypot(nx, ny);
    tl.push([q[0] + nx / L * w, q[1] + ny / L * w]);
  }
  // prosta dzieląca obie figury na połowy: dla kierunku n szukamy c_A, c_B (bisekcja po c), potem kąta, przy którym c_A = c_B
  const polowa = (p, n) => { let lo = -1e3, hi = 1e3; const cel = pole(p) / 2; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (pole(tnij(p, n, m)) < cel) lo = m; else hi = m; } return (lo + hi) / 2; };
  const roz = (phi) => { const n = [Math.cos(phi), Math.sin(phi)]; return polowa(kromka, n) - polowa(sz, n); };
  const korzenie = [];
  const K = 720;
  for (let i = 0; i < K; i++) {
    let a = Math.PI * i / K, b = Math.PI * (i + 1) / K;
    const fa = roz(a), fb = roz(b);
    if (Math.sign(fa) !== Math.sign(fb)) { for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (Math.sign(roz(m)) === Math.sign(fa)) a = m; else b = m; } korzenie.push((a + b) / 2); }
  }
  // wybieramy rozwiązanie najbardziej „ukośne” (najdalej od pionu i poziomu)
  const phi = korzenie.reduce((best, f) => (Math.abs(Math.sin(2 * f)) > Math.abs(Math.sin(2 * best)) ? f : best), korzenie[0]);
  const n = [Math.cos(phi), Math.sin(phi)], c = polowa(kromka, n);
  const odc = prostaWProstokacie(n, c, 16, 38, 184, 220);
  log('kanapka: rozwiązań', korzenie.length, 'φ =', (phi * 180 / Math.PI).toFixed(1) + '°',
    'połowy: kromka', (pole(tnij(kromka, n, c)) / pole(kromka)).toFixed(4), 'szynka', (pole(tnij(sz, n, c)) / pole(sz)).toFixed(4));
  // szynka leży na kromce: linie kromki pod szynką są zasłonięte
  const pod = (q) => !wSrodku(q, sz);
  const out = [];
  for (const k of kawalki(kromka, pod, true)) out.push({ d: lam(k) });
  for (const k of kawalki(skorka, pod, true)) out.push({ d: lam(k) });
  out.push({ d: lam(sz, true) }, { d: lam(tl) });
  out.push({ d: lam(odc), gruba: true });
  return out;
}

/* =====================================================================================
   2. Odkrycie Banacha na Plantach (1916): „całka Lebesgue'a” — wykres i zbiory {f > t} na kolejnych poziomach
   ===================================================================================== */
function rysLebesgue() {
  const f = (x) => 0.16 + 0.50 * Math.exp(-(((x - 0.27) / 0.15) ** 2)) + 0.80 * Math.exp(-(((x - 0.70) / 0.13) ** 2)) + 0.06 * Math.sin(9 * x);
  const X = (x) => 18 + 164 * x, Y0 = 212, S = 168, Y = (y) => Y0 - S * y;
  const wyk = [];
  for (let i = 0; i <= 328; i++) { const x = i / 328; wyk.push([X(x), Y(f(x))]); }
  const out = [{ d: lam([[14, Y0], [186, Y0]]) }];
  // poziomy t_k = k·Δ; dla każdego — przedziały, na których f > t_k (końce: miejsca zerowe f − t, bisekcja)
  const fmax = Math.max(...wyk.map((q) => (Y0 - q[1]) / S)), K = 9, D = fmax / (K + 0.35);
  for (let k = 1; k <= K; k++) {
    const t = k * D, segs = [];
    let a = null;
    const M = 2000;
    for (let i = 0; i <= M; i++) {
      const x = i / M, w = f(x) > t;
      if (w && a === null) { if (i === 0) a = 0; else { let lo = (i - 1) / M, hi = x; for (let j = 0; j < 50; j++) { const m = (lo + hi) / 2; if (f(m) > t) hi = m; else lo = m; } a = (lo + hi) / 2; } }
      if (!w && a !== null) { let lo = (i - 1) / M, hi = x; for (let j = 0; j < 50; j++) { const m = (lo + hi) / 2; if (f(m) > t) lo = m; else hi = m; } segs.push([a, (lo + hi) / 2]); a = null; }
    }
    if (a !== null) segs.push([a, 1]);
    out.push({ d: segs.map(([u, v]) => `M${P([X(u), Y(t)])} L${P([X(v), Y(t)])}`).join(' ') });
    if (k === 4 || k === 7) log('lebesgue: poziom', k, 'przedziały', segs.map((s) => s.map((v) => v.toFixed(3)).join('–')).join(', '));
  }
  // brzegi dziedziny (pionowe odcinki do wykresu)
  out.push({ d: `M${P([X(0), Y0])} L${P(wyk[0])} M${P([X(1), Y0])} L${P(wyk[wyk.length - 1])}` });
  out.push({ d: lam(wyk), gruba: true });
  return out;
}

/* =====================================================================================
   3. Zadanie o 18 punktach („Sto zadań”, 1958): 17 punktów, pierwsze n zawsze w różnych n-tych częściach odcinka; przeszukanie wyczerpujące
   ===================================================================================== */
/** dokładne przeszukiwanie (przedziały w jednostkach 1/lcm(1..18)): wszystkie układy N punktów spełniające warunek Steinhausa */
function szukajPunktow(N, naRozw) {
  const L = 12252240, iv = [];
  let liczba = 0;
  (function poziom(n) {
    if (n > N) { liczba++; if (naRozw) naRozw(iv.map((a) => a.slice())); return; }
    const m = n - 1, zajete = new Array(n).fill(false), wyb = new Array(m), k = L / n;
    (function przydz(j) {
      if (j === m) {
        const p = zajete.indexOf(false), zap = iv.map((a) => a.slice());
        for (let i = 0; i < m; i++) { iv[i][0] = Math.max(iv[i][0], wyb[i] * k); iv[i][1] = Math.min(iv[i][1], (wyb[i] + 1) * k); }
        iv.push([p * k, (p + 1) * k]);
        poziom(n + 1);
        iv.pop();
        for (let i = 0; i < m; i++) { iv[i][0] = zap[i][0]; iv[i][1] = zap[i][1]; }
        return;
      }
      for (let q = Math.floor(iv[j][0] / k); q <= Math.ceil(iv[j][1] / k) - 1; q++) if (!zajete[q]) { zajete[q] = true; wyb[j] = q; przydz(j + 1); zajete[q] = false; }
    })(0);
  })(1);
  return liczba;
}
function szukaj17() {
  const L = 12252240;
  let najl = null, zapas = -1;
  const ile17 = szukajPunktow(17, (iv) => { const z = Math.min(...iv.map(([a, b]) => b - a)); if (z > zapas) { zapas = z; najl = iv; } });
  const ile18 = szukajPunktow(18);
  // Warmus (1976): 768 układów przedziałów, 1536 z odbiciami; dla 18 punktów rozwiązań nie ma
  log('18 punktów: układów dla 17 punktów:', ile17, '(z odbiciami; Warmus: 768·2), dla 18 punktów:', ile18, '; najwęższy przedział (jedn. rysunku):', (zapas / L * 168).toFixed(2));
  if (ile17 !== 1536 || ile18 !== 0) throw new Error('niezgodność z literaturą');
  return najl.map(([a, b]) => (a + b) / 2 / L);
}
function rys18() {
  const xs = szukaj17(), N = xs.length;
  // kontrola warunku Steinhausa
  for (let n = 1; n <= N; n++) { const s = new Set(xs.slice(0, n).map((x) => Math.floor(n * x))); if (s.size !== n) throw new Error('warunek nie spełniony dla n = ' + n); }
  log('18 punktów: ciąg', xs.map((x) => x.toFixed(4)).join(' '));
  const X = (x) => 16 + 168 * x, Yn = (n) => 40 + (n - 1) * (180 / 16), G = 1.6;  // przerwa na granicy części: 2·1,6 jedn.
  const out = [];
  for (let n = 1; n <= N; n++) {
    const y = Yn(n), s = [];
    for (let j = 0; j < n; j++) { const a = X(j / n) + (j ? G : 0), b = X((j + 1) / n) - (j < n - 1 ? G : 0); s.push(`M${P([a, y])} L${P([b, y])}`); }
    out.push({ d: s.join(' ') });
  }
  for (let k = 1; k < N; k++) out.push({ d: lam([[X(xs[k - 1]), Yn(k) + 4.5], [X(xs[k - 1]), Yn(N)]]) });
  for (let k = 1; k <= N; k++) out.push({ d: kropka(X(xs[k - 1]), Yn(k), 3.6), gruba: true });
  return out;
}

/* =====================================================================================
   4. Longimetr (1930): trzy kwadratowe siatki obrócone o 30° (sześć kierunków co 30°), krzywa i jej przecięcia
   ===================================================================================== */
function rysLongimetr() {
  const R = los(1930), D = 30, X0 = 18, Y0 = 40, X1 = 182, Y1 = 218;
  const rodz = Array.from({ length: 6 }, (_, k) => { const a = (15 + 30 * k) * Math.PI / 180; return { n: [-Math.sin(a), Math.cos(a)], off: R() * D }; });
  const out = [{ d: lam([[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], true) }];
  for (const r of rodz) {
    const v = [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].map((q) => (r.n[0] * q[0] + r.n[1] * q[1] - r.off) / D), s = [];
    for (let m = Math.ceil(Math.min(...v)); m <= Math.floor(Math.max(...v)); m++) {
      const o = prostaWProstokacie(r.n, r.off + m * D, X0, Y0, X1, Y1);
      if (o && Math.hypot(o[1][0] - o[0][0], o[1][1] - o[0][1]) > 4) s.push(lam(o));
    }
    out.push({ d: s.join(' ') });
  }
  // rzeka: krzywa przez punkty kontrolne, od lewego brzegu płytki do prawego
  const kr = catmull([[18, 92], [52, 70], [78, 112], [64, 152], [98, 178], [134, 150], [124, 108], [160, 92], [182, 128]], 40, false);
  const krz = [], prz = [];
  for (const q of kr) krz.push(q);
  for (const r of rodz) for (let j = 0; j + 1 < krz.length; j++) {
    const a = krz[j], b = krz[j + 1], sa = (r.n[0] * a[0] + r.n[1] * a[1] - r.off) / D, sb = (r.n[0] * b[0] + r.n[1] * b[1] - r.off) / D;
    for (let m = Math.ceil(Math.min(sa, sb)); m <= Math.max(sa, sb) && Math.abs(sb - sa) > 1e-12; m++) {
      if (m === Math.min(sa, sb) && j > 0) continue;
      const u = (m - sa) / (sb - sa); prz.push([a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])]);
    }
  }
  const L = dl(krz);
  log('longimetr: długość krzywej', L.toFixed(1), ' przecięć', prz.length, ' szacunek z przecięć (π·D/12 · N)', (Math.PI * D / 12 * prz.length).toFixed(1));
  out.push({ d: lam(krz), gruba: true });
  for (const q of prz) out.push({ d: kropka(q[0], q[1], 3), gruba: true });
  return out;
}

/* =====================================================================================
   5. Sprawiedliwy podział (1948): dzielący kroi tort z owocami na trzy części równej wartości (ciasto + owoce)
   ===================================================================================== */
function rysTort() {
  const cx = 100, cy = 132, R = 80, Rk = 70, rO = 7.5, WO = 900;   // owoc „wart” tyle co 900 jedn.² ciasta
  const owoce = [[128, 82], [150, 104], [154, 136], [112, 70], [138, 160], [70, 80], [158, 112]].map(([x, y]) => [x, y]);
  // wartość wycinka [a, b] (kąty od osi x, zgodnie z ruchem wskazówek w układzie y w dół)
  const probki = owoce.map(([ox, oy]) => { const s = []; for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) { const x = ox + rO * i / 10, y = oy + rO * j / 10; if ((x - ox) ** 2 + (y - oy) ** 2 <= rO * rO) s.push(Math.atan2(y - cy, x - cx)); } return s; });
  const w = (a, b) => {
    // a ≤ b, b − a ≤ 2π
    let v = R * R / 2 * (b - a);
    for (const s of probki) { let k = 0; for (const t of s) { let u = t; while (u < a) u += 2 * Math.PI; if (u <= b) k++; } v += WO * k / s.length; }
    return v;
  };
  const V = w(0, 2 * Math.PI), ciecia = (t0) => { const o = [t0]; let a = t0; for (let i = 0; i < 2; i++) { let lo = a, hi = a + 2 * Math.PI; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (w(a, m) < V / 3) lo = m; else hi = m; } a = (lo + hi) / 2; o.push(a); } return o; };
  // kąt pierwszego cięcia: tak, by żadne cięcie nie przecinało owocu (największy luz)
  const luz = (cc) => Math.min(...cc.flatMap((t) => owoce.map(([ox, oy]) => {
    const dx = Math.cos(t), dy = Math.sin(t), px = ox - cx, py = oy - cy, rzut = px * dx + py * dy;
    return rzut < 0 ? Math.hypot(px, py) - rO : Math.abs(px * dy - py * dx) - rO;
  })));
  let best = null, bl = -1e9;
  for (let i = 0; i < 720; i++) { const cc = ciecia(-Math.PI + 2 * Math.PI * i / 720), l = luz(cc); if (l > bl) { bl = l; best = cc; } }
  log('tort: kąty kawałków', best.map((t, i) => (((best[(i + 1) % 3] - t + 4 * Math.PI) % (2 * Math.PI)) * 180 / Math.PI).toFixed(1) + '°').join(', '),
    ' wartości', best.map((t, i) => (w(t, t + ((best[(i + 1) % 3] - t + 4 * Math.PI) % (2 * Math.PI))) / V).toFixed(4)).join(', '), ' luz', bl.toFixed(1));
  const out = [{ d: okr(cx, cy, R) }, { d: okr(cx, cy, Rk) }];
  for (const [x, y] of owoce) out.push({ d: okr(x, y, rO) });
  out.push({ d: best.map((t) => `M${P([cx, cy])} L${P([cx + R * Math.cos(t), cy + R * Math.sin(t)])}`).join(' '), gruba: true });
  return out;
}

/* =====================================================================================
   6. Paradoks długości Wisły (1954): ta sama „rzeka” mierzona cyrklem o coraz mniejszym rozstawie
   ===================================================================================== */
function rysWisla() {
  // krzywa samopodobna: przesunięcia środków odcinków (ziarno stałe), 7 poziomów → 128 odcinków
  const R = los(1954);
  let pts = [[0, 0], [1, 0]];
  for (let lev = 0, h = 0.22; lev < 7; lev++, h *= 0.62) {
    const nn = [pts[0]];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], u = (R() - 0.5) * 2 * h;
      nn.push([(a[0] + b[0]) / 2 - dy * u, (a[1] + b[1]) / 2 + dx * u], b);
    }
    pts = nn;
  }
  const ys = pts.map((q) => q[1]), ymin = Math.min(...ys), ymax = Math.max(...ys), H = 46;
  const kopia = (yc) => pts.map(([x, y]) => [16 + 168 * x, yc - H / 2 + H * (y - ymin) / (ymax - ymin)]);
  // pomiar cyrklem o rozstawie s: kolejny punkt na krzywej w odległości s od poprzedniego (pierwsze przecięcie dalej po krzywej)
  const cyrkiel = (c, s) => {
    const o = [c[0]];
    let i = 0, q = c[0];
    for (;;) {
      let zn = null;
      for (let j = i; j + 1 < c.length && !zn; j++) {
        const a = j === i ? q : c[j], b = c[j + 1];
        if (Math.hypot(b[0] - q[0], b[1] - q[1]) >= s) {
          // na odcinku a–b punkt w odległości s od q (bisekcja; a jest bliżej niż s)
          let lo = 0, hi = 1;
          for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2, r = [a[0] + m * (b[0] - a[0]), a[1] + m * (b[1] - a[1])]; if (Math.hypot(r[0] - q[0], r[1] - q[1]) < s) lo = m; else hi = m; }
          zn = { p: [a[0] + lo * (b[0] - a[0]), a[1] + lo * (b[1] - a[1])], j };
        }
      }
      if (!zn) { o.push(c[c.length - 1]); return o; }
      o.push(zn.p); q = zn.p; i = zn.j;
    }
  };
  const out = [], kroki = [52, 24, 10], wys = [70, 130, 190];
  kroki.forEach((s, k) => {
    const c = kopia(wys[k]), l = cyrkiel(c, s);
    out.push({ d: lam(c) });
    out.push({ d: lam(l), gruba: true });
    log('wisła: rozstaw', s, ' kroków', l.length - 1, ' długość łamanej', dl(l).toFixed(1), ' (krzywa', dl(c).toFixed(1) + ')');
  });
  return out;
}

/* =====================================================================================
   7. Twierdzenie o trzech odległościach: punkty kα (mod 1) na okręgu, nad każdym odstępem łuk o wysokości ∝ długości
   ===================================================================================== */
function rysTrzy() {
  const al = (Math.sqrt(5) - 1) / 2, N = 13, cx = 100, cy = 134, R = 54;
  const t = Array.from({ length: N }, (_, k) => ((k + 1) * al) % 1).sort((a, b) => a - b);
  const gaps = t.map((a, i) => ((i + 1 < N ? t[i + 1] : t[0] + 1) - a));
  const rozne = [...new Set(gaps.map((g) => g.toFixed(9)))].map(Number).sort((a, b) => a - b);
  log('trzy odległości: N =', N, ' długości odstępów', rozne.map((g) => g.toFixed(4)).join(', '), ' (największa − suma dwóch mniejszych =', (rozne[2] - rozne[0] - rozne[1]).toExponential(1) + ')');
  const kat = (u) => -Math.PI / 2 + 2 * Math.PI * u, Hk = 1.0 * R / rozne[2] * 0.62;   // wysokość łuku: 0,62·R przy największym odstępie
  const out = [{ d: okr(cx, cy, R) }];
  for (let i = 0; i < N; i++) {
    const a = t[i], g = gaps[i], h = Hk * g * 1, s = [];
    for (let k = 0; k <= 60; k++) { const u = a + g * k / 60, r = R + h * Math.sin(Math.PI * k / 60); s.push([cx + r * Math.cos(kat(u)), cy + r * Math.sin(kat(u))]); }
    out.push({ d: lam(s) });
  }
  for (const u of t) out.push({ d: kropka(cx + R * Math.cos(kat(u)), cy + R * Math.sin(kat(u)), 3.6), gruba: true });
  return out;
}

/* =====================================================================================
   8. Kalejdoskop matematyczny (1938): trzy lustra (trójkąt równoboczny) i odbicia motywu — liczone złożeniami symetrii
   ===================================================================================== */
function rysKalejdoskop() {
  const cx = 100, cy = 130, Rk = 84, s = 46, h = s * Math.sqrt(3) / 2;
  const T0 = [[cx, cy - 2 * h / 3], [cx - s / 2, cy + h / 3], [cx + s / 2, cy + h / 3]];
  // motyw w trójkącie T0 (współrzędne barycentryczne → punkty): koralik, łuk szkiełka i odcinek
  const B = (a, b, c) => [a * T0[0][0] + b * T0[1][0] + c * T0[2][0], a * T0[0][1] + b * T0[1][1] + c * T0[2][1]];
  const kor = [], cent = B(0.52, 0.30, 0.18);
  for (let i = 0; i <= 24; i++) { const u = 2 * Math.PI * i / 24; kor.push([cent[0] + 4.2 * Math.cos(u), cent[1] + 4.2 * Math.sin(u)]); }
  const luk = []; for (let i = 0; i <= 20; i++) { const u = i / 20; luk.push(B(0.12 + 0.10 * Math.sin(Math.PI * u), 0.80 - 0.62 * u, 0.08 + 0.52 * u)); }
  const kreska = [B(0.30, 0.12, 0.58), B(0.10, 0.20, 0.70)];
  const motyw = [kor, luk, kreska];
  // odbicie względem prostej przez p, q; izometria jako [a, b, c, d, e, f]: x' = a x + b y + e, y' = c x + d y + f
  const odb = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = dx * dx + dy * dy, a = (dx * dx - dy * dy) / L, b = 2 * dx * dy / L; return [a, b, b, -a, p[0] - a * p[0] - b * p[1], p[1] - b * p[0] + a * p[1]]; };
  const zloz = (M, N) => [M[0] * N[0] + M[1] * N[2], M[0] * N[1] + M[1] * N[3], M[2] * N[0] + M[3] * N[2], M[2] * N[1] + M[3] * N[3], M[0] * N[4] + M[1] * N[5] + M[4], M[2] * N[4] + M[3] * N[5] + M[5]];
  const ap = (M, q) => [M[0] * q[0] + M[1] * q[1] + M[4], M[2] * q[0] + M[3] * q[1] + M[5]];
  const klucz = (T) => T.map((q) => q.map((v) => Math.round(v * 10)).join(',')).sort().join(';');
  const tr = [{ T: T0, M: [1, 0, 0, 1, 0, 0] }], znane = new Set([klucz(T0)]);
  for (let i = 0; i < tr.length; i++) {
    const { T, M } = tr[i];
    for (let e = 0; e < 3; e++) {
      const p = T[e], q = T[(e + 1) % 3], S = odb(p, q), T2 = T.map((v) => ap(S, v)), k = klucz(T2);
      const sr = [(T2[0][0] + T2[1][0] + T2[2][0]) / 3, (T2[0][1] + T2[1][1] + T2[2][1]) / 3];
      if (znane.has(k) || Math.hypot(sr[0] - cx, sr[1] - cy) > Rk + s) continue;
      znane.add(k); tr.push({ T: T2, M: zloz(S, M) });
    }
  }
  const wKole = (q) => Math.hypot(q[0] - cx, q[1] - cy) <= Rk - 2;
  const out = [{ d: okr(cx, cy, Rk) }];
  // siatka luster (trzy rodziny prostych przez boki trójkątów), obcięta do koła
  for (let r = 0; r < 3; r++) {
    const a = Math.PI / 3 * r, n = [-Math.sin(a), Math.cos(a)], c0 = n[0] * T0[1][0] + n[1] * T0[1][1], s2 = [];
    for (let m = -4; m <= 4; m++) {
      const c = c0 + m * h, p0 = [n[0] * c, n[1] * c], t = [-n[1], n[0]], dd = (p0[0] - cx) * t[0] + (p0[1] - cy) * t[1], foot = [p0[0] - t[0] * dd, p0[1] - t[1] * dd];
      const d = Math.hypot(foot[0] - cx, foot[1] - cy); if (d >= Rk - 3) continue;
      const half = Math.sqrt(Rk * Rk - d * d);
      s2.push(lam([[foot[0] - t[0] * half, foot[1] - t[1] * half], [foot[0] + t[0] * half, foot[1] + t[1] * half]]));
    }
    out.push({ d: s2.join(' ') });
  }
  let kopii = 0;
  for (const { M } of tr) {
    if (M === tr[0].M) continue;
    const czesci = [];
    for (const m of motyw) for (const k of kawalki(m.map((q) => ap(M, q)), wKole)) if (dl(k) >= 3) czesci.push(lam(k));
    if (czesci.length) { out.push({ d: czesci.join(' ') }); kopii++; }
  }
  // trójkąt luster i motyw oryginalny (grube)
  out.push({ d: lam(T0, true), gruba: true });
  out.push({ d: motyw.map((m) => lam(m)).join(' '), gruba: true });
  log('kalejdoskop: trójkątów', tr.length, ' odbić motywu w kole', kopii);
  return out;
}

/* =====================================================================================
   9. Twierdzenie o szachownicy: miny (kółka) i droga wieży z górnego brzegu na dolny po samych minach
   ===================================================================================== */
function rysSzachownica() {
  const n = 8, c = 20, X0 = 20, Y0 = 52;
  // droga wieży (kolumna, wiersz) — zaplanowana kręta; reszta min losowa, ale tak, by nie skracała drogi
  const droga = [[2, 0], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [3, 3], [2, 3], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 6], [4, 6], [5, 6], [5, 7]];
  const R = los(1954), miny = new Set(droga.map(([i, j]) => i + ',' + j));
  const bfs = (M) => {
    const q = [], od = new Map();
    for (let i = 0; i < n; i++) if (M.has(i + ',0')) { q.push([i, 0]); od.set(i + ',0', 1); }
    while (q.length) { const [i, j] = q.shift(), d = od.get(i + ',' + j); if (j === n - 1) return d; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (i + a) + ',' + (j + b); if (M.has(k) && !od.has(k)) { od.set(k, d + 1); q.push([i + a, j + b]); } } }
    return Infinity;
  };
  // król nie przejdzie z lewej na prawą omijając miny ⇔ wieża przejdzie z góry na dół po minach (Steinhaus)
  const krol = (M) => {
    const q = [], wiz = new Set();
    for (let j = 0; j < n; j++) if (!M.has('0,' + j)) { q.push([0, j]); wiz.add('0,' + j); }
    while (q.length) { const [i, j] = q.shift(); if (i === n - 1) return true; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const x = i + a, y = j + b, k = x + ',' + y; if (x >= 0 && y >= 0 && x < n && y < n && !M.has(k) && !wiz.has(k)) { wiz.add(k); q.push([x, y]); } } }
    return false;
  };
  const L0 = bfs(miny);
  for (let p = 0; p < 400 && miny.size < 27; p++) {
    const i = Math.floor(R() * n), j = Math.floor(R() * n), k = i + ',' + j;
    if (miny.has(k)) continue;
    miny.add(k);
    if (bfs(miny) < L0) miny.delete(k);
  }
  log('szachownica: min', miny.size, ' najkrótsza droga wieży', bfs(miny), 'pól (planowana', L0 + ')', ' król przechodzi w poprzek:', krol(miny));
  const sr = ([i, j]) => [X0 + c * (i + 0.5), Y0 + c * (j + 0.5)];
  const out = [];
  const lin = [];
  for (let k = 0; k <= n; k++) { lin.push(lam([[X0 + c * k, Y0], [X0 + c * k, Y0 + n * c]]), lam([[X0, Y0 + c * k], [X0 + n * c, Y0 + c * k]])); }
  out.push({ d: lin.join(' ') });
  for (const k of miny) { const [i, j] = k.split(',').map(Number), [x, y] = sr([i, j]); out.push({ d: okr(x, y, 4.2) }); }
  const pd = droga.map(sr);
  pd.unshift([pd[0][0], Y0 - 10]); pd.push([pd[pd.length - 1][0], Y0 + n * c + 10]);
  out.push({ d: lam(pd), gruba: true });
  return out;
}

/* =====================================================================================
   10. Zadanie o pudełkach zapałek (Księga Szkocka, zad. 193, 1941): losowa historia jako droga po kratce
   ===================================================================================== */
function rysZapalki() {
  const N = 7, c = 20, X0 = 30, Y0 = 202;   // punkt (a, b): a zapałek wyjętych z lewej kieszeni, b — z prawej
  const Pk = (a, b) => [X0 + c * a, Y0 - c * b];
  // szukamy ziarna, przy którym historia jest „ciekawa”: kończy się po sięgnięciu do pustego lewego pudełka, w prawym zostają 2
  let droga = null, ziarno = 0;
  for (let z = 1; z < 5000 && !droga; z++) {
    const R = los(z), d = [[0, 0]];
    let a = 0, b = 0, koniec = null;
    for (;;) {
      const lewa = R() < 0.5;
      if (lewa) { if (a === N) { koniec = 'L'; break; } a++; } else { if (b === N) { koniec = 'P'; break; } b++; }
      d.push([a, b]);
    }
    // warunki estetyczne: koniec przy lewym pudełku, zostały 2 zapałki, droga przynajmniej raz idzie wzdłuż ściany a = N i ma ≥ 8 zakrętów
    let zakr = 0; for (let i = 2; i < d.length; i++) if ((d[i][0] - d[i - 1][0]) !== (d[i - 1][0] - d[i - 2][0])) zakr++;
    const naScianie = d.filter((q) => q[0] === N).length;
    if (koniec === 'L' && N - b === 2 && zakr >= 9 && naScianie >= 2) { droga = d; ziarno = z; }
  }
  log('zapałki: ziarno', ziarno, ' ruchów', droga.length - 1, ' koniec przy', droga[droga.length - 1].join(','), '→ w drugim pudełku zostały', N - droga[droga.length - 1][1]);
  // prawdopodobieństwo (Banach/Feller): P(zostało k) = C(2N − k, N) / 2^(2N − k)
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  log('zapałki: rozkład dla N = 7:', Array.from({ length: N + 1 }, (_, k) => C(2 * N - k, N) / 2 ** (2 * N - k)).map((v) => v.toFixed(3)).join(' '));
  const out = [];
  // kratka jako krzyżyki w punktach (a, b), a, b = 0…N (ramię 3 jedn.)
  const kz = [];
  for (let a = 0; a <= N; a++) for (let b = 0; b <= N; b++) { const [x, y] = Pk(a, b); kz.push(`M${P([x - 3, y])} L${P([x + 3, y])} M${P([x, y - 3])} L${P([x, y + 3])}`); }
  out.push({ d: kz.join(' ') });
  // ściany: lewe pudełko puste (a = N), prawe puste (b = N)
  out.push({ d: lam([Pk(N, 0), Pk(N, N)]) + ' ' + lam([Pk(0, N), Pk(N, N)]) });
  // sięgnięcie do pustego pudełka: krótka kreska za ścianą
  const ost = droga[droga.length - 1], [ex, ey] = Pk(ost[0], ost[1]);
  out.push({ d: lam(droga.map(([a, b]) => Pk(a, b))), gruba: true });
  out.push({ d: `M${P([ex, ey])} L${P([ex + 11, ey])} M${P([ex + 7, ey - 4])} L${P([ex + 15, ey + 4])} M${P([ex + 7, ey + 4])} L${P([ex + 15, ey - 4])}`, gruba: true });
  out.push({ d: kropka(...Pk(0, 0)), gruba: true });
  return out;
}

/* =====================================================================================
   11. Twierdzenie Banacha–Steinhausa (1927): jądra Dirichleta D_n — szczyt 2n + 1 rośnie bez ograniczenia
   ===================================================================================== */
function rysBanachSteinhaus() {
  const D = (n, x) => (Math.abs(x) < 1e-9 ? 2 * n + 1 : Math.sin((n + 0.5) * x) / Math.sin(x / 2));
  const X = (x) => 100 + x * 84 / Math.PI, Y0 = 186, k = 147 / 25;
  const out = [{ d: lam([[14, Y0], [186, Y0]]) }];
  const lebesgue = (n) => { let s = 0; const M = 20000; for (let i = 0; i < M; i++) { const x = -Math.PI + 2 * Math.PI * (i + 0.5) / M; s += Math.abs(D(n, x)); } return s * 2 * Math.PI / M / (2 * Math.PI); };
  [3, 6, 12].forEach((n, i) => {
    const s = [];
    for (let j = 0; j <= 672; j++) { const x = -Math.PI + 2 * Math.PI * j / 672; s.push([X(x), Y0 - k * D(n, x)]); }
    out.push({ d: lam(s), gruba: i === 2 });
    log('banach–steinhaus: n =', n, ' D_n(0) =', 2 * n + 1, ' stała Lebesgue’a (1/2π)∫|D_n| =', lebesgue(n).toFixed(3), ' min y', Math.max(...s.map((q) => q[1])).toFixed(1));
  });
  return out;
}

/* =====================================================================================
   12. Metoda k-średnich (1956): bryła podzielona na k = 5 części wokół ich środków ciężkości (iteracja Lloyda)
   ===================================================================================== */
function rysKSrednich() {
  const ksz = catmull([[40, 60], [96, 46], [150, 58], [178, 104], [166, 158], [182, 204], [130, 218], [74, 208], [26, 182], [34, 130], [20, 92]], 24);
  // próbki bryły: siatka co 1,5 jedn.
  const pr = [];
  for (let x = 12; x <= 188; x += 1.5) for (let y = 34; y <= 224; y += 1.5) if (wSrodku([x, y], ksz)) pr.push([x, y]);
  const R = los(1956), k = 5;
  let C = Array.from({ length: k }, () => pr[Math.floor(R() * pr.length)].slice());
  let przes = 1;
  for (let it = 0; it < 500 && przes > 1e-6; it++) {
    const s = C.map(() => [0, 0, 0]);
    for (const q of pr) { let b = 0, bd = Infinity; C.forEach((c, i) => { const d = (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2; if (d < bd) { bd = d; b = i; } }); s[b][0] += q[0]; s[b][1] += q[1]; s[b][2]++; }
    const N = s.map((v) => [v[0] / v[2], v[1] / v[2]]);
    przes = Math.max(...N.map((v, i) => Math.hypot(v[0] - C[i][0], v[1] - C[i][1])));
    C = N;
  }
  // granice: komórki Woronoja środków (obcinanie dużego prostokąta półpłaszczyznami), krawędzie obcięte do bryły
  const kraw = [];
  for (let i = 0; i < k; i++) {
    let kom = [[-500, -500], [700, -500], [700, 700], [-500, 700]];
    for (let j = 0; j < k; j++) {
      if (j === i) continue;
      const n = [C[j][0] - C[i][0], C[j][1] - C[i][1]], c = (n[0] * (C[i][0] + C[j][0]) + n[1] * (C[i][1] + C[j][1])) / 2;
      kom = tnij(kom, n, c);
    }
    for (let m = 0; m < kom.length; m++) {
      const a = kom[m], b = kom[(m + 1) % kom.length];
      // krawędź wspólna z komórką j > i (żeby nie liczyć dwa razy): środek krawędzi równo odległy od C[i] i C[j]
      const s = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], di = Math.hypot(s[0] - C[i][0], s[1] - C[i][1]);
      const j = C.findIndex((c, jj) => jj > i && Math.abs(Math.hypot(s[0] - c[0], s[1] - c[1]) - di) < 1e-6);
      if (j < 0) continue;
      const seg = []; for (let t = 0; t <= 400; t++) seg.push([a[0] + (b[0] - a[0]) * t / 400, a[1] + (b[1] - a[1]) * t / 400]);
      for (const kk of kawalki(seg, (q) => wSrodku(q, ksz))) kraw.push([kk[0], kk[kk.length - 1]]);
    }
  }
  log('k-średnich: iteracja zbieżna (przesunięcie', przes.toExponential(1) + '), środki', C.map((c) => P(c)).join(' '), ' odcinków granic', kraw.length);
  const out = [{ d: lam(ksz, true) }];
  out.push({ d: kraw.map((s) => lam(s)).join(' '), gruba: true });
  for (const c of C) out.push({ d: kropka(c[0], c[1], 3.6), gruba: true });
  return out;
}

/* ---------- kontrola pola i liczby ścieżek ---------- */
function kontrola(id, sc) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { d } of sc) {
    const tok = d.match(/[MLZa]|-?\d+(\.\d+)?/g);
    let i = 0, cx = 0, cy = 0;
    while (i < tok.length) {
      const t = tok[i++];
      if (t === 'M' || t === 'L') { cx = +tok[i++]; cy = +tok[i++]; x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy); }
      else if (t === 'a') { const r = +tok[i]; const dx = +tok[i + 5]; i += 7; if (dx > 0) { x1 = Math.max(x1, cx + 2 * r); y0 = Math.min(y0, cy - r); y1 = Math.max(y1, cy + r); } cx += dx; }
    }
  }
  const ok = x0 >= POLE.x0 && x1 <= POLE.x1 && y0 >= POLE.y0 && y1 <= POLE.y1 && sc.length >= 5 && sc.length <= 60;
  log(`  [${ok ? 'OK' : 'BŁĄD'}] ${id}: ścieżek ${sc.length}, zakres x ${f1(x0)}–${f1(x1)}, y ${f1(y0)}–${f1(y1)}`);
  if (!ok) process.exitCode = 1;
}

module.exports = { rysKanapka, rysLebesgue, rys18, rysLongimetr, rysTort, rysWisla, rysTrzy, rysKalejdoskop, rysSzachownica, rysZapalki, rysBanachSteinhaus, rysKSrednich, kontrola };

if (require.main === module && process.argv.includes('--test')) {
  const fn = process.argv[process.argv.indexOf('--test') + 1];
  const sc = module.exports[fn]();
  kontrola(fn, sc);
}
