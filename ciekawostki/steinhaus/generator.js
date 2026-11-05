// Ciekawostki o Hugonie Steinhausie (dział Popularyzacja): rysunki liczone, nie „na oko”.
// Uruchomienie: node generator.js  →  ciekawostki.json, rysunki.html
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
  const kromkaK = [[-40, 54], [0, 56], [40, 54], [47, 44], [46, 2], [48, -10], [60, -22], [62, -40], [46, -56], [20, -60], [0, -58],
    [-20, -60], [-46, -56], [-62, -40], [-60, -22], [-48, -10], [-46, 2], [-47, 44]];
  const kromka = przeksztalc(catmull(kromkaK, 14), -0.06, 0.92, 76, 164);
  const skorka = offset(kromka, 6.5);                       // linia skórki, 6,5 jedn. do środka
  // plaster szynki: owal z lekką falą; tłuszczyk — półksiężyc wzdłuż części brzegu
  const N = 220, szynka = [];
  for (let i = 0; i < N; i++) { const t = 2 * Math.PI * i / N, r = 1 + 0.05 * Math.sin(3 * t + 0.6) + 0.035 * Math.cos(5 * t); szynka.push([37 * r * Math.cos(t), 27 * r * Math.sin(t)]); }
  const sz = przeksztalc(szynka, 0.42, 1, 139, 74);
  // tłuszczyk: krzywa wewnętrzna dla t ∈ [t1, t2], odsunięta o d(t) = 6·sin(π(t − t1)/(t2 − t1))
  const t1 = 0.30 * N, t2 = 0.80 * N, inn = offset(sz, 1), tl = [];
  for (let i = Math.ceil(t1); i <= Math.floor(t2); i++) {
    const w = 6 * Math.sin(Math.PI * (i - t1) / (t2 - t1)), q = sz[i], r = inn[i], nx = r[0] - q[0], ny = r[1] - q[1], L = Math.hypot(nx, ny);
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
  const phi = korzenie[0], n = [Math.cos(phi), Math.sin(phi)], c = polowa(kromka, n);
  const odc = prostaWProstokacie(n, c, 16, 38, 184, 220);
  const zachodza = kromka.some((q) => wSrodku(q, sz)) || sz.some((q) => wSrodku(q, kromka));
  log('kanapka: rozwiązań', korzenie.length, 'φ =', (phi * 180 / Math.PI).toFixed(1) + '°', ' figury zachodzą:', zachodza,
    ' połowy: kromka', (pole(tnij(kromka, n, c)) / pole(kromka)).toFixed(4), 'szynka', (pole(tnij(sz, n, c)) / pole(sz)).toFixed(4));
  if (korzenie.length !== 1) throw new Error('kanapka: oczekiwano jednej prostej');
  return [{ d: lam(kromka, true) }, { d: lam(skorka, true) }, { d: lam(sz, true) }, { d: lam(tl) }, { d: lam(odc), gruba: true }];
}

/* =====================================================================================
   2. Odkrycie Banacha na Plantach (1916): usłyszane słowa „miara Lebesgue'a”; wykres i zbiory {f > t} na kolejnych poziomach
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
  const D = 46, X0 = 18, Y0 = 40, X1 = 182, Y1 = 218, r = 2.8;
  const kr = catmull([[18, 92], [52, 70], [78, 112], [64, 152], [98, 178], [134, 150], [124, 108], [160, 92], [182, 128]], 40, false);
  const L = dl(kr);
  // przecięcia krzywej z rodzinami prostych; przesunięcia rodzin dobrane ziarnem: szacunek bliski długości, kropki nie zlewają się
  const uklad = (ziarno) => {
    const R = los(ziarno);
    const rodz = Array.from({ length: 6 }, (_, k) => { const a = (15 + 30 * k) * Math.PI / 180; return { n: [-Math.sin(a), Math.cos(a)], off: R() * D }; });
    const prz = [];
    for (const f of rodz) for (let j = 0; j + 1 < kr.length; j++) {
      const a = kr[j], b = kr[j + 1], sa = (f.n[0] * a[0] + f.n[1] * a[1] - f.off) / D, sb = (f.n[0] * b[0] + f.n[1] * b[1] - f.off) / D;
      const lo = Math.min(sa, sb), hi = Math.max(sa, sb);
      for (let m = Math.ceil(lo); m < hi; m++) { const u = (m - sa) / (sb - sa); prz.push([a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])]); }
    }
    let odst = Infinity;
    for (let i = 0; i < prz.length; i++) for (let j = 0; j < i; j++) odst = Math.min(odst, Math.hypot(prz[i][0] - prz[j][0], prz[i][1] - prz[j][1]));
    return { rodz, prz, odst, est: Math.PI * D / 12 * prz.length };
  };
  let best = null, bz = 0;
  for (let z = 1; z <= 4000; z++) { const u = uklad(z); if (Math.abs(u.est - L) / L < 0.03 && (!best || u.odst > best.odst)) { best = u; bz = z; } }
  log('longimetr: długość krzywej', L.toFixed(1), ' przecięć', best.prz.length, ' szacunek (π·D/12)·N =', best.est.toFixed(1), ' najmniejszy odstęp kropek', best.odst.toFixed(1), ' ziarno', bz);
  const out = [{ d: lam([[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], true) }];
  for (const f of best.rodz) {
    const v = [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].map((q) => (f.n[0] * q[0] + f.n[1] * q[1] - f.off) / D), s = [];
    for (let m = Math.ceil(Math.min(...v)); m <= Math.floor(Math.max(...v)); m++) {
      const o = prostaWProstokacie(f.n, f.off + m * D, X0, Y0, X1, Y1);
      if (o && Math.hypot(o[1][0] - o[0][0], o[1][1] - o[0][1]) > 8) s.push(lam(o));
    }
    out.push({ d: s.join(' ') });
  }
  out.push({ d: lam(kr), gruba: true });
  for (const q of best.prz) out.push({ d: kropka(Math.min(q[0], X1 - r), q[1], r), gruba: true });
  return out;
}

/* =====================================================================================
   5. Sprawiedliwy podział (1948): dzielący kroi tort z owocami na trzy części równej wartości (ciasto + owoce)
   ===================================================================================== */
function rysTort() {
  const cx = 100, cy = 130, R = 84, Rk = 74, rO = 7.5, WO = 900;   // owoc „wart” tyle co 900 jedn.² ciasta
  // owoce rozłożone na łuku 218° (po jednej stronie zostaje samo ciasto), parami rozłączne; układ dobrany tak, by cięcia nie trafiały w owoc
  const owoce = [[-144, 58], [-109, 59], [-75, 57], [-37, 59], [-4, 58], [35, 59], [74, 58]].map(([k, r]) => [cx + r * Math.cos(k * Math.PI / 180), cy + r * Math.sin(k * Math.PI / 180)]);
  for (let i = 0; i < owoce.length; i++) for (let j = 0; j < i; j++) if (Math.hypot(owoce[i][0] - owoce[j][0], owoce[i][1] - owoce[j][1]) < 2 * rO + 3) throw new Error('owoce nachodzą: ' + i + ',' + j);
  // wartość wycinka [a, b] (kąty od osi x, zgodnie z ruchem wskazówek w układzie y w dół)
  const probki = owoce.map(([ox, oy]) => { const s = []; for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) { const x = ox + rO * i / 10, y = oy + rO * j / 10; if ((x - ox) ** 2 + (y - oy) ** 2 <= rO * rO) s.push(Math.atan2(y - cy, x - cx)); } return s; });
  const w = (a, b) => {
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
  if (bl <= 0) throw new Error('cięcie przecina owoc');
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
  // losowa krzywa Kocha: każdy odcinek zastępują 4 krótsze z załamaniem 60° na losową stronę; długość rośnie 4/3 raza na poziom
  const krzywa = (z) => {
    const R = los(z), kat = Math.PI / 3;
    let pts = [[0, 0], [1, 0]];
    for (let lev = 0; lev < 3; lev++) {
      const nn = [pts[0]];
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1], dx = (b[0] - a[0]) / 3, dy = (b[1] - a[1]) / 3, zn = R() < 0.5 ? -1 : 1;
        const u = [a[0] + dx, a[1] + dy], w = [a[0] + 2 * dx, a[1] + 2 * dy];
        const sz = [u[0] + dx * Math.cos(kat) - zn * dy * Math.sin(kat), u[1] + zn * dx * Math.sin(kat) + dy * Math.cos(kat)];
        nn.push(u, sz, w, b);
      }
      pts = nn;
    }
    pts = nn;
  }
  const ys = pts.map((q) => q[1]), yMin = Math.min(...ys), yMax = Math.max(...ys), Hp = 54;   // krzywa ściśnięta w pionie do pasa 54 jedn.
  const kopia = (yc) => pts.map(([x, y]) => [16 + 168 * x, yc - Hp / 2 + Hp * (y - yMin) / (yMax - yMin)]);
  // pomiar cyrklem o rozstawie s: kolejny punkt na krzywej w odległości s od poprzedniego (pierwsze przecięcie dalej po krzywej)
  const cyrkiel = (c, s) => {
    const o = [c[0]];
    let i = 0, q = c[0];
    for (;;) {
      let zn = null;
      for (let j = i; j + 1 < c.length && !zn; j++) {
        const a = j === i ? q : c[j], b = c[j + 1];
        if (Math.hypot(b[0] - q[0], b[1] - q[1]) >= s) {
          let lo = 0, hi = 1;
          for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2, r = [a[0] + m * (b[0] - a[0]), a[1] + m * (b[1] - a[1])]; if (Math.hypot(r[0] - q[0], r[1] - q[1]) < s) lo = m; else hi = m; }
          zn = { p: [a[0] + lo * (b[0] - a[0]), a[1] + lo * (b[1] - a[1])], j };
        }
      }
      if (!zn) { o.push(c[c.length - 1]); return o; }
      o.push(zn.p); q = zn.p; i = zn.j;
    }
  };
  const out = [], kroki = [56, 18.7, 6.2], wys = [66, 129, 192];
  kroki.forEach((s, k) => {
    const c = kopia(pts, wys[k]), l = cyrkiel(c, s), y = wys[k] + 26;
    out.push({ d: lam(c) });
    out.push({ d: lam(l), gruba: true });
    // pasek: długość zmierzona tym rozstawem, wszystkie w tej samej skali
    out.push({ d: `M16,${y} L${f1(16 + sk * dl(l))},${y}`, gruba: true });
    out.push({ d: `M16,${y - 3} L16,${y + 3} M${f1(16 + sk * dl(l))},${y - 3} L${f1(16 + sk * dl(l))},${y + 3}` });
    log('wisła: rozstaw', s, ' kroków', l.length - 1, ' długość łamanej', dl(l).toFixed(1), ' (krzywa', dl(c).toFixed(1) + ')', ' ziarno', bz);
  });
  return out;
}

/* =====================================================================================
   7. Twierdzenie o trzech odległościach: punkty kα (mod 1) na okręgu, nad każdym odstępem łuk o wysokości ∝ długości
   ===================================================================================== */
function rysTrzy() {
  const al = (Math.sqrt(5) - 1) / 2, N = 18, cx = 100, cy = 130, R = 58;
  const t = Array.from({ length: N }, (_, k) => ((k + 1) * al) % 1).sort((a, b) => a - b);
  const gaps = t.map((a, i) => ((i + 1 < N ? t[i + 1] : t[0] + 1) - a));
  const rozne = [...new Set(gaps.map((g) => g.toFixed(9)))].map(Number).sort((a, b) => a - b);
  if (rozne.length !== 3 || Math.abs(rozne[2] - rozne[0] - rozne[1]) > 1e-8) throw new Error('trzy odległości: ' + rozne);
  log('trzy odległości: N =', N, ' długości odstępów', rozne.map((g) => g.toFixed(4)).join(', '), ' największa − suma dwóch mniejszych =', (rozne[2] - rozne[0] - rozne[1]).toExponential(1), ' liczebności', rozne.map((r) => gaps.filter((g) => g.toFixed(9) === r.toFixed(9)).length).join(', '));
  const kat = (u) => -Math.PI / 2 + 2 * Math.PI * u, Hk = 24 / rozne[2];   // wysokość łuku proporcjonalna do odstępu; 24 jedn. przy największym
  const out = [{ d: okr(cx, cy, R) }];
  for (let i = 0; i < N; i++) {
    const a = t[i], g = gaps[i], h = Hk * g, s = [];
    for (let k = 0; k <= 60; k++) { const u = a + g * k / 60, r = R + h * Math.sin(Math.PI * k / 60); s.push([cx + r * Math.cos(kat(u)), cy + r * Math.sin(kat(u))]); }
    const naj = Math.abs(g - rozne[2]) < 1e-8;
    out.push({ d: lam(s), gruba: naj });
  }
  for (const u of t) out.push({ d: kropka(cx + R * Math.cos(kat(u)), cy + R * Math.sin(kat(u)), 3.2), gruba: true });
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
  // znaczniki −π i π na osi oraz kreski na wysokości szczytów 2n + 1
  out.push({ d: `M${f1(X(-Math.PI))},${Y0 - 4} L${f1(X(-Math.PI))},${Y0 + 4} M${f1(X(Math.PI))},${Y0 - 4} L${f1(X(Math.PI))},${Y0 + 4}` });
  const lebesgue = (n) => { let s = 0; const M = 20000; for (let i = 0; i < M; i++) { const x = -Math.PI + 2 * Math.PI * (i + 0.5) / M; s += Math.abs(D(n, x)); } return s * 2 * Math.PI / M / (2 * Math.PI); };
  [3, 6, 12].forEach((n, i) => {
    const s = [];
    for (let j = 0; j <= 672; j++) { const x = -Math.PI + 2 * Math.PI * j / 672; s.push([X(x), Y0 - k * D(n, x)]); }
    out.push({ d: lam(s), gruba: i === 2 });
    const yy = Y0 - k * (2 * n + 1);
    out.push({ d: `M${f1(X(0) + 12)},${f1(yy)} L${f1(X(0) + 20)},${f1(yy)}` });
    log('banach–steinhaus: n =', n, ' D_n(0) =', 2 * n + 1, ' stała Lebesgue’a (1/2π)∫|D_n| =', lebesgue(n).toFixed(3));
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

/* =====================================================================================
   13. Liczby w wielokątach (Mega): △n = nⁿ; □n = n w n trójkątach; ○n = n w n kwadratach. Kolejne kroki rozwijania „2 w kole”
   ===================================================================================== */
function rysMega() {
  // kontrola rachunku: △2 = 4, △4 = 256, więc □2 = △△2 = 256, a Mega = ○2 = □□2 = □256
  const troj = (n) => n ** n; const kw2 = troj(troj(2n));
  if (kw2 !== 256n) throw new Error('mega');
  log('mega: △2 =', troj(2n).toString(), ' □2 = △△2 =', kw2.toString(), ' Mega = □256');
  const kw = (cx, cy, a) => lam([[cx - a, cy - a], [cx + a, cy - a], [cx + a, cy + a], [cx - a, cy + a]], true);
  const tr = (cx, cy, r) => lam([0, 1, 2].map((i) => [cx + r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 3), cy + r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 3)]), true);
  const dwie = (cx, cy, r, odst) => [kropka(cx - odst, cy, r), kropka(cx + odst, cy, r)];
  const strz = (a, b) => { const u = Math.atan2(b[1] - a[1], b[0] - a[0]), g = 6; return `${lam([a, b])} ${lam([[b[0] - g * Math.cos(u - 0.5), b[1] - g * Math.sin(u - 0.5)], b, [b[0] - g * Math.cos(u + 0.5), b[1] - g * Math.sin(u + 0.5)]])}`; };
  const A = [52, 80], B = [148, 80], C = [52, 178], E = [148, 178], a = 37;
  const out = [];
  // 1: dwójka w kole
  out.push({ d: okr(A[0], A[1], a), gruba: true });
  dwie(A[0], A[1], 4.5, 10).forEach((d) => out.push({ d, gruba: true }));
  // 2: dwójka w dwóch kwadratach
  out.push({ d: kw(B[0], B[1], a) }, { d: kw(B[0], B[1], a - 11) });
  dwie(B[0], B[1], 4.5, 10).forEach((d) => out.push({ d, gruba: true }));
  // 3: kwadrat, w nim dwójka w dwóch trójkątach
  out.push({ d: kw(C[0], C[1], a) }, { d: tr(C[0], C[1] + 5, 35) }, { d: tr(C[0], C[1] + 5, 22) });
  dwie(C[0], C[1] + 7, 3.2, 5).forEach((d) => out.push({ d, gruba: true }));
  // 4: kwadrat, w nim czwórka w jednym trójkącie (bo dwójka w trójkącie to 2² = 4)
  out.push({ d: kw(E[0], E[1], a) }, { d: tr(E[0], E[1] + 5, 35) });
  [[-5.5, 2], [5.5, 2], [-5.5, 13], [5.5, 13]].forEach(([dx, dy]) => out.push({ d: kropka(E[0] + dx, E[1] + dy, 3.2), gruba: true }));
  // strzałki: kolejność rozwijania
  out.push({ d: strz([A[0] + a + 5, A[1]], [B[0] - a - 5, B[1]]) });
  out.push({ d: strz([B[0] - 20, B[1] + a + 4], [C[0] + 20, C[1] - a - 4]) });
  out.push({ d: strz([C[0] + a + 5, C[1]], [E[0] - a - 5, E[1]]) });
  return out;
}

/* =====================================================================================
   14. Dendryt wrocławski (1951): najkrótsza sieć łącząca punkty; usunięcie najdłuższych krawędzi dzieli zbiór na grupy
   ===================================================================================== */
function rysDendryt() {
  const R = los(1951), pts = [];
  // punkty w czterech skupiskach (rozkład normalny metodą Boxa–Mullera), odległości co najmniej 15 jedn.
  const srodki = [[56, 72], [146, 66], [50, 178], [146, 176]];
  const gauss = () => Math.sqrt(-2 * Math.log(1 - R())) * Math.cos(2 * Math.PI * R());
  for (let p = 0; pts.length < 26 && p < 5000; p++) {
    const c = srodki[pts.length % 4], q = [c[0] + 19 * gauss(), c[1] + 19 * gauss()];
    if (q[0] < 18 || q[0] > 182 || q[1] < 40 || q[1] > 218) continue;
    if (pts.every((u) => Math.hypot(u[0] - q[0], u[1] - q[1]) >= 15)) pts.push(q);
  }
  const d = (i, j) => Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
  // algorytm Kruskala
  const kraw = [];
  for (let i = 0; i < pts.length; i++) for (let j = 0; j < i; j++) kraw.push([d(i, j), i, j]);
  kraw.sort((a, b) => a[0] - b[0]);
  const oj = pts.map((_, i) => i), f = (x) => (oj[x] === x ? x : (oj[x] = f(oj[x])));
  const mst = [];
  for (const [w, i, j] of kraw) { const a = f(i), b = f(j); if (a !== b) { oj[a] = b; mst.push([w, i, j]); } }
  // kontrola algorytmem Prima (ta sama suma długości)
  const w = new Set([0]); let suma = 0;
  while (w.size < pts.length) { let b = null; for (let i = 0; i < pts.length; i++) if (w.has(i)) for (let j = 0; j < pts.length; j++) if (!w.has(j) && (!b || d(i, j) < b[0])) b = [d(i, j), j]; w.add(b[1]); suma += b[0]; }
  const sumaK = mst.reduce((s, e) => s + e[0], 0);
  if (Math.abs(sumaK - suma) > 1e-6) throw new Error('dendryt: Kruskal ≠ Prim');
  const dlugie = mst.slice().sort((a, b) => b[0] - a[0]).slice(0, 3);
  log('dendryt: punktów', pts.length, ' krawędzi', mst.length, ' suma', sumaK.toFixed(1), '(Prim', suma.toFixed(1) + ')', ' trzy najdłuższe', dlugie.map((e) => e[0].toFixed(1)).join(', '));
  const out = [];
  for (const e of mst) out.push({ d: lam([pts[e[1]], pts[e[2]]]), gruba: !dlugie.includes(e) });
  for (const q of pts) out.push({ d: kropka(q[0], q[1], 3.6), gruba: true });
  return out;
}

/* =====================================================================================
   14. Permutacje przez zamiany sąsiadów (Steinhaus–Johnson–Trotter, n = 4): 24 ustawienia, 23 zamiany; nić 4 idzie zygzakiem
   ===================================================================================== */
function rysSJT() {
  // klasyczna rekurencja: permutacje n powstają z permutacji n − 1 przez wędrówkę n tam i z powrotem
  const perm = (n) => { if (n === 1) return [[1]]; const o = []; perm(n - 1).forEach((p, i) => { const pos = i % 2 === 0 ? [...Array(n).keys()].reverse() : [...Array(n).keys()]; for (const k of pos) o.push([...p.slice(0, k), n, ...p.slice(k)]); }); return o; };
  const L = perm(4);
  // kontrola: każde kolejne dwie różnią się zamianą dwóch sąsiadów, wszystkie różne
  const zn = new Set(L.map((p) => p.join('')));
  for (let i = 1; i < L.length; i++) { const r = L[i].map((v, j) => (v !== L[i - 1][j] ? j : -1)).filter((j) => j >= 0); if (r.length !== 2 || r[1] - r[0] !== 1) throw new Error('nie sąsiedzi'); }
  log('permutacje: ustawień', L.length, ' różnych', zn.size);
  const X = (j) => 34 + j * (132 / 3), Y = (i) => 38 + i * (182 / 23), out = [];
  for (let v = 1; v <= 4; v++) {
    const s = L.map((p, i) => [X(p.indexOf(v)), Y(i)]);
    // gładzimy tylko wizualnie: pionowe odcinki łączone skosami (każdy krok po jednym wierszu)
    out.push({ d: lam(s), gruba: v === 4 });
  }
  // rzędy ustawień: krótkie kreski po bokach co cztery ustawienia (blok przejścia nici 4)
  const zn2 = []; for (let i = 0; i <= 23; i += 4) zn2.push(lam([[14, Y(i)], [22, Y(i)]]), lam([[178, Y(i)], [186, Y(i)]]));
  out.push({ d: zn2.join(' ') });
  out.push({ d: L[0].map((v, j) => kropka(X(j), Y(0), 3.2)).join(' '), gruba: true });
  return out;
}

/* =====================================================================================
   15. Notacja Steinhausa–Mosera: mega = 2 w kole = 2 w dwóch kwadratach; 2 w kwadracie = 2 w dwóch trójkątach = 256
   ===================================================================================== */
function rysMoser() {
  const trojkat = (cx, cy, r) => { const o = []; for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + 2 * Math.PI * k / 3; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; };
  const kwadrat = (cx, cy, r) => [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]];
  const dwie = (cx, cy, d = 6.5) => `${kropka(cx - d, cy, 3)} ${kropka(cx + d, cy, 3)}`;
  // n w trójkącie = n^n; n w kwadracie = n w n trójkątach; n w kole = n w n kwadratach
  const tr = (n) => n ** n, kw2 = tr(tr(2));
  log('moser: 2 w trójkącie =', tr(2), ' 2 w dwóch trójkątach =', kw2, ' czyli 2 w kwadracie = 256; mega = 256 w 256 trójkątach');
  const out = [];
  // A: koło z dwiema kropkami
  out.push({ d: okr(56, 78, 36), gruba: true }, { d: dwie(56, 78), gruba: true });
  // B: dwa zagnieżdżone kwadraty
  out.push({ d: lam(kwadrat(144, 78, 34), true) }, { d: lam(kwadrat(144, 78, 23), true) }, { d: dwie(144, 78) });
  // C: kwadrat, w nim dwa trójkąty
  out.push({ d: lam(kwadrat(56, 172, 34), true) }, { d: lam(trojkat(56, 176, 28), true) }, { d: lam(trojkat(56, 176, 19), true) }, { d: dwie(56, 178, 4.5) });
  // D: 256 w 256 trójkątach: zagnieżdżone trójkąty (narysowane pierwsze, promień maleje geometrycznie)
  const d = [];
  for (let k = 0; k < 8; k++) d.push(lam(trojkat(144, 180, 44 * 0.76 ** k), true));
  out.push({ d: d.join(' ') });
  return out;
}

/* =====================================================================================
   16. Twierdzenie o odległościach (1920): zbiór A o dodatniej mierze (gruby zbiór Cantora) i jego przesunięcia: A ∩ (A + t) ≠ ∅ dla małych t
   ===================================================================================== */
function rysRoznice() {
  // zbiór Smitha–Volterry–Cantora: na poziomie k usuwamy z każdego kawałka środek długości 4^(−k); miara granicy 1/2
  const etap = (Lv) => { let A = [[0, 1]]; for (let k = 1; k <= Lv; k++) { const dl = 4 ** -k, n = []; for (const [a, b] of A) { const m = (a + b) / 2; n.push([a, m - dl / 2], [m + dl / 2, b]); } A = n; } return A; };
  const A4 = etap(4), A = etap(6), X = (x) => 16 + 168 * x;
  const miara = (S) => S.reduce((s, [a, b]) => s + b - a, 0);
  const przec = (S, t) => { let s = 0, i = 0, j = 0; const T = S.map(([a, b]) => [a + t, b + t]); while (i < S.length && j < T.length) { const u = Math.max(S[i][0], T[j][0]), v = Math.min(S[i][1], T[j][1]); if (v > u) s += v - u; if (S[i][1] < T[j][1]) i++; else j++; } return s; };
  log('różnice: miara etapu 6', miara(A).toFixed(4));
  const rysuj = (S, y, g) => ({ d: S.filter(([a, b]) => X(b) - X(a) >= 3).map(([a, b]) => lam([[X(a), y], [X(b), y]])).join(' '), gruba: g });
  const t0 = 0.045, B4 = A4.map(([a, b]) => [a + t0, Math.min(1, b + t0)]).filter(([a, b]) => b > a), W4 = [];
  for (const [a, b] of A4) for (const [c, d] of B4) { const u = Math.max(a, c), v = Math.min(b, d); if (v > u) W4.push([u, v]); }
  const out = [rysuj(A4, 42, false), rysuj(B4, 54, false), rysuj(W4, 66, true)];
  // f(t) = |A ∩ (A + t)| dla t ∈ [−1, 1]: ciągła, f(0) = |A| > 0, więc dodatnia na otoczeniu zera
  const Xt = (t) => 100 + 84 * t, Y0 = 208, H = 118 / przec(A, 0), s = [];
  for (let i = 0; i <= 600; i++) { const t = -1 + 2 * i / 600; s.push([Xt(t), Y0 - H * przec(A, t)]); }
  out.push({ d: lam([[Xt(-1), Y0], [Xt(1), Y0]]) }, { d: lam([[Xt(0), Y0 + 8], [Xt(0), Y0 - 124]]) }, { d: lam(s), gruba: true });
  let d = 0; while (d < 1 && przec(A, d + 0.002) > 1e-9) d += 0.002;
  log('różnice: f(0) =', przec(A, 0).toFixed(4), ' f > 0 co najmniej na |t| <', d.toFixed(3));
  return out;
}

/* =====================================================================================
   17. Koło z dokładnie n punktami kratowymi (Steinhaus, 1957): środek (√2, 1/3), każdy punkt kratowy ma inną odległość
   ===================================================================================== */
function rysKolo() {
  const S = 24, Ox = 16, Oy = 46, K = 7;       // kratka: punkty (i, j), i, j = 0…7; 24 jedn. między punktami
  const c = [Math.SQRT2 + 2, 1 / 3 + 3];       // środek: (√2, 1/3) przesunięty o wektor kratowy (2, 3), więc odległości dalej parami różne
  const pk = [];
  for (let i = 0; i <= K; i++) for (let j = 0; j <= K; j++) pk.push({ i, j, d: Math.hypot(i - c[0], j - c[1]) });
  pk.sort((a, b) => a.d - b.d);
  for (let m = 1; m < pk.length; m++) if (Math.abs(pk[m].d - pk[m - 1].d) < 1e-9) throw new Error('równe odległości');
  log('koło: najbliższe odległości', pk.slice(0, 6).map((p) => p.d.toFixed(3)).join(', '));
  const P_ = (x, y) => [Ox + S * x, Oy + S * y];
  const promien = (n) => (pk[n - 1].d + pk[n].d) / 2;     // koło o tym promieniu zawiera dokładnie n punktów
  const C = P_(c[0], c[1]), out = [];
  for (const n of [2, 7]) out.push({ d: okr(C[0], C[1], f1(S * promien(n))) });
  const N = 18;
  out.push({ d: okr(C[0], C[1], f1(S * promien(N))), gruba: true });
  // kontrola: liczba punktów kratowych wewnątrz grubego okręgu
  const wew = pk.filter((p) => p.d < promien(N)).length; if (wew !== N) throw new Error('liczba punktów');
  out.push({ d: pk.slice(0, N).map((p) => { const [x, y] = P_(p.i, p.j); return kropka(x, y, 3.2); }).join(' '), gruba: true });
  out.push({ d: pk.slice(N).map((p) => { const [x, y] = P_(p.i, p.j); return `M${P([x - 3, y])} L${P([x + 3, y])} M${P([x, y - 3])} L${P([x, y + 3])}`; }).join(' ') });
  out.push({ d: `M${P([C[0] - 3.5, C[1]])} L${P([C[0] + 3.5, C[1]])} M${P([C[0], C[1] - 3.5])} L${P([C[0], C[1] + 3.5])}` });
  log('koło: w grubym okręgu', wew, 'punktów, promień w krokach kratki', promien(N).toFixed(3));
  return out;
}

/* =====================================================================================
   18. Kieszeń „Kalejdoskopu” (1938): dwie płaskie połówki dwunastościanu (po 6 pięciokątów), składane gumką
   ===================================================================================== */
function rysDwunastoscian() {
  const s = 23, Rp = s / (2 * Math.sin(Math.PI / 5)), ap = s / (2 * Math.tan(Math.PI / 5));
  const pieciokat = (cx, cy, obr) => Array.from({ length: 5 }, (_, k) => { const a = obr + 2 * Math.PI * k / 5; return [cx + Rp * Math.cos(a), cy + Rp * Math.sin(a)]; });
  const kwiat = (cx, cy, obr) => {
    const srodek = pieciokat(cx, cy, obr), scianki = [];
    for (let k = 0; k < 5; k++) {
      // środek krawędzi k i kierunek na zewnątrz; sąsiedni pięciokąt ma wierzchołek naprzeciw tej krawędzi
      const a = obr + 2 * Math.PI * (k + 0.5) / 5, ox = cx + 2 * ap * Math.cos(a), oy = cy + 2 * ap * Math.sin(a);
      scianki.push(pieciokat(ox, oy, a));
    }
    return { srodek, scianki };
  };
  // kontrola: krawędź wspólna ma długość s
  const A = kwiat(65, 90, -Math.PI / 2), B = kwiat(135, 168, Math.PI / 2);
  log('dwunastościan: bok pięciokąta', dl([A.srodek[0], A.srodek[1]]).toFixed(2), ' odległość wierzchołków sąsiedniej ścianki od środka', Math.hypot(A.scianki[0][0][0] - 65, A.scianki[0][0][1] - 90).toFixed(2));
  const out = [];
  for (const { srodek, scianki } of [A, B]) {
    out.push({ d: lam(srodek, true), gruba: true });
    for (const p of scianki) out.push({ d: lam(p, true) });
  }
  return out;
}

/* =====================================================================================
   19. „Czem jest a czem nie jest matematyka” (1923): pewniki są do wyboru; dysk Poincarégo: przez punkt P wiele prostych nie przecina prostej l
   ===================================================================================== */
function rysPewniki() {
  const cx = 100, cy = 130, R = 84;
  const mob = (p) => (z) => { // f(z) = (z + p)/(1 + conj(p) z)
    const n = [z[0] + p[0], z[1] + p[1]], m = [1 + p[0] * z[0] + p[1] * z[1], p[0] * z[1] - p[1] * z[0]], d = m[0] * m[0] + m[1] * m[1];
    return [(n[0] * m[0] + n[1] * m[1]) / d, (n[1] * m[0] - n[0] * m[1]) / d];
  };
  const naEkran = (z) => [cx + R * z[0], cy + R * z[1]];
  // prosta l: geodezyjna o końcach pod kątami a, b (łuk okręgu prostopadłego do brzegu)
  const luk = (a, b) => { const mid = (a + b) / 2, del = (b - a) / 2, r = Math.tan(del), c = [Math.cos(mid) / Math.cos(del), Math.sin(mid) / Math.cos(del)]; const start = Math.atan2(Math.sin(a) - c[1], Math.cos(a) - c[0]); let end = Math.atan2(Math.sin(b) - c[1], Math.cos(b) - c[0]); let d = end - start; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Array.from({ length: 61 }, (_, i) => { const t = start + d * i / 60; return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]; }); };
  const a0 = 0.35 * Math.PI, b0 = 0.85 * Math.PI, Pz = [0.08, -0.34], f = mob(Pz);
  const out = [{ d: okr(cx, cy, R) }, { d: lam(luk(a0, b0).map(naEkran)), gruba: true }, { d: kropka(...naEkran(Pz)), gruba: true }];
  // proste przez P: obrazy średnic; końce na brzegu to f(±e^{iθ})
  const kat = (z) => { let t = Math.atan2(z[1], z[0]); while (t < 0) t += 2 * Math.PI; return t; };
  const przecina = (th) => { const u = kat(f([Math.cos(th), Math.sin(th)])), v = kat(f([-Math.cos(th), -Math.sin(th)])), a = kat([Math.cos(a0), Math.sin(a0)]), b = kat([Math.cos(b0), Math.sin(b0)]); const wUku = (t) => t > Math.min(a, b) && t < Math.max(a, b); return wUku(u) !== wUku(v); };
  let ile = 0, nieP = 0;
  for (let k = 0; k < 13; k++) {
    const th = Math.PI * (k + 0.5) / 13, punkty = []; for (let i = -40; i <= 40; i++) { const t = i / 40, z = [t * Math.cos(th), t * Math.sin(th)]; punkty.push(naEkran(f(z))); }
    if (!przecina(th)) { out.push({ d: lam(punkty) }); nieP++; } ile++;
  }
  log('pewniki: kierunków', ile, ' prostych przez P nieprzecinających l', nieP);
  return out;
}

/* =====================================================================================
   20. Nowa Księga Szkocka (1946): funkcje Rademachera (temat problemów Steinhausa: funkcje niezależne); iloczyn dwóch na dole
   ===================================================================================== */
function rysRademacher() {
  const X = (x) => 16 + 168 * x, wys = 11, out = [];
  const r = (k, x) => (Math.floor(x * 2 ** k) % 2 === 0 ? 1 : -1);
  const fala = (k, y0, g) => { const n = 2 ** k, s = []; for (let j = 0; j < n; j++) { const yy = y0 - wys * (j % 2 === 0 ? 1 : -1); s.push([X(j / n), yy], [X((j + 1) / n), yy]); } return { d: lam(s), gruba: g }; };
  const rzedy = [1, 2, 3, 4];
  rzedy.forEach((k, i) => { const y0 = 56 + i * 34; out.push({ d: lam([[16, y0], [184, y0]]) }); out.push(fala(k, y0, false)); });
  // iloczyn r2 · r3: też przyjmuje ±1 i ma średnią 0 (niezależność)
  const y0 = 206, m = 8, iloczyn = []; let srednia = 0;
  for (let j = 0; j < m; j++) { const x = (j + 0.5) / m, w = r(2, x) * r(3, x); srednia += w / m; iloczyn.push([X(j / m), y0 - wys * w], [X((j + 1) / m), y0 - wys * w]); }
  log('rademacher: średnia iloczynu r2·r3 =', srednia, ' (powinno być 0 = iloczyn średnich)');
  out.push({ d: lam([[16, y0], [184, y0]]) }, { d: lam(iloczyn), gruba: true });
  return out;
}

/* =====================================================================================
   21. Dochodzenie ojcostwa (1954): wzór Bayesa; prawdopodobieństwo po badaniu jako funkcja prawdopodobieństwa a priori, dla kilku ilorazów wiarygodności
   ===================================================================================== */
function rysBayes() {
  const X = (p) => 28 + 144 * p, Y = (p) => 208 - 144 * p;
  const post = (p, L) => (p * L) / (p * L + 1 - p);
  const out = [{ d: lam([[X(0), Y(0)], [X(1), Y(0)], [X(1), Y(1)], [X(0), Y(1)]], true) }];
  const iloraz = [1 / 16, 1 / 4, 1, 4, 16];
  for (const L of iloraz) { const s = []; for (let i = 0; i <= 80; i++) { const p = i / 80; s.push([X(p), Y(post(p, L))]); } out.push({ d: lam(s) }); }
  // a priori 1/2 (założenie używane w sądowych obliczeniach): pionowa prosta i wartości a posteriori
  out.push({ d: lam([[X(0.5), Y(0)], [X(0.5), Y(1)]]), gruba: true });
  out.push({ d: iloraz.map((L) => kropka(X(0.5), Y(post(0.5, L)), 3.4)).join(' '), gruba: true });
  log('bayes: a posteriori dla a priori 1/2:', iloraz.map((L) => post(0.5, L).toFixed(3)).join(', '));
  return out;
}

/* =====================================================================================
   22. Introwizor (patent 1938/1948): lampa i ekran na obrotowym pręcie; obiekt leży na osi obrotu, gdy jego cień nie schodzi z punktu na ekranie
   ===================================================================================== */
function rysIntrowizor() {
  const O = [100, 130], dL = 78, dE = 62, pol = 26, out = [];
  // przekrój ciała: krzywa zamknięta wokół obiektu
  const cialo = []; for (let i = 0; i < 120; i++) { const t = 2 * Math.PI * i / 120, r = 1 + 0.05 * Math.cos(3 * t + 1) + 0.03 * Math.sin(5 * t); cialo.push([O[0] + 62 * r * Math.cos(t), O[1] + 4 + 40 * r * Math.sin(t)]); }
  out.push({ d: lam(cialo, true) });
  const polozenia = [-0.48, 0.48];
  polozenia.forEach((a) => {
    const u = [Math.sin(a), -Math.cos(a)], v = [Math.cos(a), Math.sin(a)];
    const L = [O[0] + dL * u[0], O[1] + dL * u[1]], E = [O[0] - dE * u[0], O[1] - dE * u[1]];
    const e1 = [E[0] + pol * v[0], E[1] + pol * v[1]], e2 = [E[0] - pol * v[0], E[1] - pol * v[1]];
    // stożek promieni z ogniska lampy (cienki), ekran i główny promień przez obiekt (gruby)
    out.push({ d: `${lam([L, e1])} ${lam([L, e2])}` });
    out.push({ d: lam([[e1[0], e1[1]], [e2[0], e2[1]]]) });
    out.push({ d: lam([L, E]), gruba: true });
    out.push({ d: okr(L[0], L[1], 5) });
    out.push({ d: kropka(E[0], E[1], 3), gruba: true });
    log('introwizor: ognisko', P(L), ' punkt na ekranie', P(E));
  });
  out.push({ d: kropka(O[0], O[1], 4.5), gruba: true });
  return out;
}

/* =====================================================================================
   23. Kwadratowa taryfa (1939): ta sama energia ∫P, inna opłata √∫P²: równy pobór płaci mniej niż szczyty
   ===================================================================================== */
function rysTaryfa() {
  const X = (t) => 26 + 148 * t / 24, Y0 = 210, K = 9.8;
  const surowy = (t) => 1.2 + 6.5 * Math.exp(-(((t - 8) / 1.5) ** 2)) + 9 * Math.exp(-(((t - 18.5) / 1.7) ** 2));
  const M = 480, srednia = Array.from({ length: M }, (_, i) => surowy(24 * (i + 0.5) / M)).reduce((a, b) => a + b, 0) / M;
  const P0 = 5, skala = P0 / srednia, Pt = (t) => surowy(t) * skala;
  const calka = (f) => { let s = 0; for (let i = 0; i < M; i++) s += f(24 * (i + 0.5) / M) * 24 / M; return s; };
  const E1 = calka(Pt), E0 = calka(() => P0), T1 = Math.sqrt(calka((t) => Pt(t) ** 2)), T0 = Math.sqrt(calka(() => P0 * P0));
  log('taryfa: energia', E0.toFixed(1), E1.toFixed(1), ' opłata √∫P²: równy', T0.toFixed(1), ' szczyty', T1.toFixed(1), ' stosunek', (T1 / T0).toFixed(3));
  const out = [{ d: lam([[X(0), Y0], [X(24), Y0]]) }, { d: lam([[X(0), Y0], [X(0), 42]]) }];
  const zn = []; for (let t = 4; t <= 24; t += 4) zn.push(lam([[X(t), Y0], [X(t), Y0 + 7]])); out.push({ d: zn.join(' ') });
  const s = []; for (let i = 0; i <= 192; i++) { const t = 24 * i / 192; s.push([X(t), Y0 - K * Pt(t)]); }
  out.push({ d: lam(s) });
  out.push({ d: lam([[X(0), Y0 - K * P0], [X(24), Y0 - K * P0]]), gruba: true });
  // poziom równoważny: stały pobór, za który zapłacono by tyle co za szczyty (√(∫P²/24))
  const Pr = T1 / Math.sqrt(24), kw = []; for (let t = 0; t < 24; t += 2) kw.push(lam([[X(t), Y0 - K * Pr], [X(t + 1.1), Y0 - K * Pr]]));
  out.push({ d: kw.join(' ') });
  log('taryfa: poziom równoważny', Pr.toFixed(2), ' przy P0 =', P0, ' szczyt', Math.max(...s.map((q) => (Y0 - q[1]) / K)).toFixed(2));
  return out;
}

/** izolinie pola f na siatce (marching squares, ze sklejaniem odcinków w łamane) */
function izolinie(F, nx, ny, X, Y, poziom) {
  const odc = [], kl = (p) => `${Math.round(p[0] * 50)},${Math.round(p[1] * 50)}`;
  for (let i = 0; i + 1 < nx; i++) for (let j = 0; j + 1 < ny; j++) {
    const v = [F[i][j], F[i + 1][j], F[i + 1][j + 1], F[i][j + 1]];
    if (v.some((q) => q === null)) continue;
    const r = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], pk = [];
    for (let e = 0; e < 4; e++) { const a = v[e], b = v[(e + 1) % 4]; if ((a < poziom) !== (b < poziom)) { const t = (poziom - a) / (b - a), A = r[e], B = r[(e + 1) % 4]; pk.push([X(A[0] + t * (B[0] - A[0])), Y(A[1] + t * (B[1] - A[1]))]); } }
    if (pk.length === 2) odc.push(pk); else if (pk.length === 4) odc.push([pk[0], pk[1]], [pk[2], pk[3]]);
  }
  const uzyte = odc.map(() => false), przy = new Map();
  odc.forEach((o, i) => { for (const p of o) { const k = kl(p); if (!przy.has(k)) przy.set(k, []); przy.get(k).push(i); } });
  const lamane = [];
  for (let i = 0; i < odc.length; i++) {
    if (uzyte[i]) continue;
    uzyte[i] = true; const l = [odc[i][0], odc[i][1]];
    for (const koniec of [1, 0]) {
      for (;;) {
        const p = koniec ? l[l.length - 1] : l[0], nast = (przy.get(kl(p)) || []).find((j) => !uzyte[j]);
        if (nast === undefined) break;
        uzyte[nast] = true; const q = kl(odc[nast][0]) === kl(p) ? odc[nast][1] : odc[nast][0];
        if (koniec) l.push(q); else l.unshift(q);
      }
    }
    lamane.push(l);
  }
  return lamane;
}

/* =====================================================================================
   24. Doktorat u Hilberta (1911): zasada Dirichleta; funkcja harmoniczna w obszarze o zadanych wartościach na brzegu (relaksacja) i jej poziomice
   ===================================================================================== */
function rysDirichlet() {
  const brzeg = catmull([[52, 62], [110, 48], [168, 70], [182, 128], [150, 176], [168, 214], [96, 216], [34, 200], [48, 150], [20, 112]], 20);
  const h = 2, nx = Math.round(176 / h) + 1, ny = Math.round(190 / h) + 1, X = (i) => 12 + i * h, Y = (j) => 34 + j * h;
  const g = (x, y) => { const t = Math.atan2(y - 130, x - 100); return Math.cos(2 * t + 0.5) + 0.35 * Math.sin(5 * t); };
  const F = [], W = [];
  for (let i = 0; i < nx; i++) { F.push([]); W.push([]); for (let j = 0; j < ny; j++) { const w = wSrodku([X(i), Y(j)], brzeg); W[i].push(w); F[i].push(w ? 0 : g(X(i), Y(j))); } }
  // relaksacja (SOR): wewnątrz średnia czterech sąsiadów; na zewnątrz obszaru wartości brzegowe g
  const om = 1.9;
  let zm = 1, it = 0;
  for (; it < 4000 && zm > 1e-6; it++) { zm = 0; for (let i = 1; i + 1 < nx; i++) for (let j = 1; j + 1 < ny; j++) if (W[i][j]) { const n = (F[i - 1][j] + F[i + 1][j] + F[i][j - 1] + F[i][j + 1]) / 4, d = n - F[i][j]; F[i][j] += om * d; zm = Math.max(zm, Math.abs(d)); } }
  log('dirichlet: iteracji', it, ' zmiana', zm.toExponential(1));
  const out = [{ d: lam(brzeg, true), gruba: true }];
  const obc = (l) => kawalki(l, (q) => wSrodku(q, brzeg));
  for (let k = -5; k <= 5; k++) {
    const lv = k * 0.2 + 0.03, kaw = [];
    for (const l of izolinie(F, nx, ny, X, Y, lv)) for (const o of obc(l)) if (dl(o) >= 8) kaw.push(lam(o));
    if (kaw.length) out.push({ d: kaw.join(' ') });
  }
  return out;
}

/* =====================================================================================
   25. Znaczek pocztowy (Kac, lata 30.): 150 funtów × 1/5000 prawdopodobieństwa = trochę mniej niż znaczek
   ===================================================================================== */
function rysZnaczek() {
  // znaczek: prostokąt z ząbkami (półokręgi co 12 jedn.), współrzędne liczone wzdłuż boków
  const x0 = 22, x1 = 178, y0 = 44, y1 = 214, zab = 12, r = 3.6;
  const bok = (A, B) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.round(L / zab), o = [], ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, nx = uy, ny = -ux, kr = L / n; for (let k = 0; k < n; k++) { const s = k * kr + (kr - 2 * r) / 2; o.push([A[0] + ux * (k * kr), A[1] + uy * (k * kr)]); for (let i = 0; i <= 8; i++) { const t = Math.PI * i / 8, w = s + r - r * Math.cos(t), g = r * Math.sin(t); o.push([A[0] + ux * w - nx * g, A[1] + uy * w - ny * g]); } } return o; };
  const krawedz = [...bok([x0, y0], [x1, y0]), ...bok([x1, y0], [x1, y1]), ...bok([x1, y1], [x0, y1]), ...bok([x0, y1], [x0, y0])];
  const out = [{ d: lam(krawedz, true) }];
  // wartość oczekiwana E(p) = 150·p [funtów] i koszt znaczka: osie p ∈ [0, 1/1500], E ∈ [0, 0,1]
  const X = (p) => 46 + 112 * p * 1500, Y = (e) => 188 - 118 * e * 10;
  out.push({ d: `${lam([[X(0), Y(0)], [X(1 / 1500), Y(0)]])} ${lam([[X(0), Y(0)], [X(0), Y(0.1)]])}` });
  out.push({ d: lam([[X(0), Y(0)], [X(1 / 1500), Y(150 / 1500)]]), gruba: true });
  const p = 1 / 5000, E = 150 * p, K = 0.032;   // koszt znaczka: tylko poziom „trochę więcej niż 0,03 funta” (MacTutor nie podaje kwoty)
  out.push({ d: lam([[X(0), Y(K)], [X(1 / 1500), Y(K)]]) });
  out.push({ d: lam([[X(p), Y(0)], [X(p), Y(E)]]) });
  out.push({ d: kropka(X(p), Y(E), 4), gruba: true });
  log('znaczek: E =', E.toFixed(3), 'funta przy p = 1/5000');
  return out;
}

/* =====================================================================================
   26. Konkurs PTM (od 1967, inicjator Łukaszewicz, uczeń Steinhausa): rachunek prawdopodobieństwa: deska Galtona, rozkład dwumianowy
   ===================================================================================== */
function rysGalton() {
  const N = 8, dx = 17, dy = 12, cx = 100, y0 = 46, out = [];
  const Pk = (w, k) => [cx + (k - w / 2) * dx, y0 + w * dy];
  const kol = []; for (let w = 0; w < N; w++) for (let k = 0; k <= w; k++) { const [x, y] = Pk(w, k); kol.push(okr(x, y, 1.9)); }
  out.push({ d: kol.join(' ') });
  // przegródki i rozkład (wysokości ∝ C(N, k))
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  const yd = y0 + N * dy + 6, yk = 222, H = yk - yd, sc = []; const wysKol = (k) => H * C(N, k) / C(N, N / 2);
  for (let k = 0; k <= N + 1; k++) { const x = cx + (k - (N + 1) / 2) * dx; sc.push(lam([[x, yd], [x, yk]])); }
  sc.push(lam([[cx - (N + 1) / 2 * dx, yk], [cx + (N + 1) / 2 * dx, yk]]));
  out.push({ d: sc.join(' ') });
  const slup = []; for (let k = 0; k <= N; k++) { const a = cx + (k - (N + 1) / 2) * dx + 3, b = a + dx - 6, y = yk - wysKol(k); if (wysKol(k) >= 3) slup.push(lam([[a, yk], [a, y], [b, y], [b, yk]])); else slup.push(lam([[a, y], [b, y]])); }
  out.push({ d: slup.join(' ') });
  // jedna droga kulki (ziarno stałe)
  const R = los(1967); let k = 0; const dr = [[cx, y0 - 8], Pk(0, 0)]; for (let w = 0; w < N; w++) { if (R() < 0.5) k++; dr.push(Pk(w + 1, k)); }
  dr[dr.length - 1] = [dr[dr.length - 1][0], yd + 2];
  out.push({ d: lam(dr), gruba: true });
  out.push({ d: kropka(cx, y0 - 8, 4), gruba: true });
  log('galton: kulka do przegródki', k, ' rozkład', Array.from({ length: N + 1 }, (_, j) => C(N, j)).join(','));
  return out;
}

/* =====================================================================================
   27. Z ławki do towarzystwa (1916–1919): trzech na ławce i szesnastu na zebraniu założycielskim
   ===================================================================================== */
function rysTowarzystwo() {
  const cx = 100, cy = 130, R = 76, r = 20, out = [];
  const krag = Array.from({ length: 16 }, (_, k) => { const a = -Math.PI / 2 + 2 * Math.PI * k / 16; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  const trzy = Array.from({ length: 3 }, (_, k) => { const a = -Math.PI / 2 + 2 * Math.PI * k / 3; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  // cienkie: każdy z szesnastu połączony z najbliższym z trzech, co szósty krok gwiazdki {16/5} w tle
  const gw = []; for (let k = 0; k < 16; k++) gw.push(lam([krag[k], krag[(k + 5) % 16]]));
  out.push({ d: gw.join(' ') });
  const lacz = krag.map((p) => { const q = trzy.reduce((m, t) => (Math.hypot(t[0] - p[0], t[1] - p[1]) < Math.hypot(m[0] - p[0], m[1] - p[1]) ? t : m), trzy[0]); return lam([q, p]); });
  out.push({ d: lacz.join(' ') });
  out.push({ d: lam(krag, true) });
  out.push({ d: krag.map((p) => kropka(p[0], p[1], 3.4)).join(' '), gruba: true });
  out.push({ d: lam(trzy, true), gruba: true });
  out.push({ d: trzy.map((p) => kropka(p[0], p[1], 4.5)).join(' '), gruba: true });
  return out;
}

/* =====================================================================================
   28. Między duchem a materią (1980): od gładkiej fali do twardej fali prostokątnej: sumy częściowe szeregu Fouriera (rzędy 1, 3, 5, …)
   ===================================================================================== */
function rysDuchMateria() {
  const rzedy = [1, 3, 5, 9, 21], out = [];
  const X = (t) => 16 + 168 * t;
  const S = (m, x) => { let s = 0; for (let k = 1; k <= m; k += 2) s += Math.sin(k * x) / k; return 4 / Math.PI * s; };
  const A = 15, y0 = 57, dy = 30;
  rzedy.forEach((m, i) => {
    const s = []; for (let j = 0; j <= 400; j++) { const t = j / 400; s.push([X(t), y0 + i * dy - A * S(m, t * 4 * Math.PI)]); }
    out.push({ d: lam(s), gruba: i === 2 });
  });
  // na dole sama fala prostokątna (granica)
  const yk = y0 + rzedy.length * dy, kw = []; for (let k = 0; k < 4; k++) { const v = k % 2 === 0 ? 1 : -1; kw.push([X(k / 4), yk - A * v], [X((k + 1) / 4), yk - A * v]); }
  out.push({ d: lam(kw) });
  log('duch–materia: efekt Gibbsa, max S_21 =', Math.max(...Array.from({ length: 2000 }, (_, j) => S(21, j / 2000 * Math.PI))).toFixed(3));
  return out;
}

/* =====================================================================================
   29. Rzuty monetą (1923): ciąg orłów i reszek jako punkt odcinka; drzewo podziałów dwójkowych
   ===================================================================================== */
function rysMoneta() {
  const G = 4, X0 = 16, Y0 = 42, dX = 168, dY = 38, Yd = Y0 + G * dY + 18;
  const X = (k, i) => X0 + dX * (i + 0.5) / 2 ** k, Y = (k) => Y0 + k * dY;
  const ciag = [1, 0, 1, 1];                      // przykładowy ciąg rzutów (1 = orzeł)
  const out = [];
  for (let k = 0; k < G; k++) {
    const s = [];
    for (let i = 0; i < 2 ** k; i++) for (const c of [0, 1]) s.push(lam([[X(k, i), Y(k)], [X(k + 1, 2 * i + c), Y(k + 1)]]));
    out.push({ d: s.join(' ') });
  }
  // odcinek [0, 1] z podziałem na 2^G części
  const kr = []; for (let i = 0; i <= 2 ** G; i++) kr.push(`M${f1(X0 + dX * i / 2 ** G)},${Yd - (i % 4 === 0 ? 6 : 3)} L${f1(X0 + dX * i / 2 ** G)},${Yd + (i % 4 === 0 ? 6 : 3)}`);
  out.push({ d: `M${X0},${Yd} L${X0 + dX},${Yd} ` + kr.join(' ') });
  // wyróżniona droga: ciąg rzutów prowadzi do jednego przedziału długości 2^−G
  let i = 0; const dr = [[X(0, 0), Y(0)]], przedz = [];
  ciag.forEach((c, k) => { i = 2 * i + c; dr.push([X(k + 1, i), Y(k + 1)]); });
  const a = X0 + dX * i / 2 ** G, b = X0 + dX * (i + 1) / 2 ** G;
  dr.push([(a + b) / 2, Yd]);
  out.push({ d: lam(dr), gruba: true });
  out.push({ d: `M${f1(a)},${Yd} L${f1(b)},${Yd}`, gruba: true });
  out.push({ d: kropka(X(0, 0), Y(0)), gruba: true });
  log('moneta: ciąg', ciag.join(''), ' przedział [', i, '/16 ,', i + 1, '/16 ], prawdopodobieństwo 1/16 =', (1 / 16).toFixed(4));
  return out;
}

/* =====================================================================================
   16. Koło z n punktami kratowymi (Steinhaus; Sierpiński: środek (√2, 1/3)): wszystkie odległości są różne, koło „połyka” punkty po jednym
   ===================================================================================== */
function rysKolo() {
  const c = 30, sx = Math.SQRT2, sy = 1 / 3, X = (i) => 100 + c * (i - sx), Y = (j) => 129 + c * (j - sy);
  const pk = [];
  for (let i = -5; i <= 8; i++) for (let j = -6; j <= 7; j++) if (X(i) >= 18 && X(i) <= 182 && Y(j) >= 40 && Y(j) <= 218) pk.push({ i, j, r: Math.hypot(i - sx, j - sy) });
  pk.sort((a, b) => a.r - b.r);
  const luka = Math.min(...pk.slice(1).map((q, k) => q.r - pk[k].r));
  if (luka < 1e-9) throw new Error('koło: równe odległości');
  const rn = (n) => (pk[n - 1].r + pk[n].r) / 2;
  // liczba punktów n w kole: tam, gdzie kolejne punkty są najdalej od okręgu (czytelność)
  const luk = (n) => (pk[n].r - pk[n - 1].r) * c;
  const kola = [4], n = 12;   // największe luki w tym zakresie: 26,6–41,9 i 53,0–58,3 jedn.
  log('koło: środek (√2, 1/3), najmniejsza różnica odległości', luka.toFixed(4), ' promienie:', [...kola, n].map((m) => m + ' pkt → ' + (rn(m) * c).toFixed(1) + ' (luka ' + luk(m).toFixed(1) + ')').join(', '));
  const out = [];
  for (const m of kola) out.push({ d: okr(100, 129, f1(rn(m) * c)) });
  out.push({ d: okr(100, 129, f1(rn(n) * c)), gruba: true });
  pk.forEach((q, k) => {
    const x = X(q.i), y = Y(q.j);
    if (k < n) out.push({ d: kropka(x, y, 3.2), gruba: true });
    else out.push({ d: `M${f1(x - 3.5)},${f1(y)} L${f1(x + 3.5)},${f1(y)} M${f1(x)},${f1(y - 3.5)} L${f1(x)},${f1(y + 3.5)}` });
  });
  return out;
}

/* =====================================================================================
   31. Uczniowie (Mathematics Genealogy Project): 20 doktorów; długość promienia ∝ log(1 + liczba potomków); grube: Wrocław
   ===================================================================================== */
function rysUczniowie() {
  const dane = [['Banach', 1920, 346, 0], ['Rajchman', 1921, 1976, 0], ['Schauder', 1923, 0, 0], ['Weinlös', 1927, 0, 0], ['Orlicz', 1928, 371, 0], ['Birnbaum', 1929, 168, 0], ['Kac', 1937, 408, 0],
    ['Warmus', 1949, 1, 1], ['Fisz', 1950, 22, 1], ['Perkal', 1950, 31, 1], ['Oderfeld', 1951, 1, 1], ['Zubrzycki', 1954, 0, 1], ['Łukaszewicz', 1957, 27, 1], ['Fast', 1958, 0, 1], ['Zięba', 1959, 17, 1], ['Lysik', 1960, 8, 1], ['Trybuła', 1960, 42, 1], ['Cheng', 1961, 34, 1], ['Kotlarski', 1961, 3, 1], ['Plucińska', 1961, 6, 1]];
  const cx = 100, cy = 130, R0 = 22, Rm = 84, Lm = Math.log10(1 + 1976);
  const Rr = (d) => R0 + 8 + (Rm - R0 - 8) * Math.log10(1 + d) / Lm;
  const out = [{ d: okr(cx, cy, R0) }];
  for (const d of [10, 100, 1000]) out.push({ d: okr(cx, cy, f1(Rr(d))) });
  const cien = [], gr = [], kr1 = [], kr2 = [];
  dane.forEach(([, , d, w], i) => {
    const a = -Math.PI / 2 + 2 * Math.PI * i / dane.length, u = [Math.cos(a), Math.sin(a)], A = [cx + R0 * u[0], cy + R0 * u[1]], r = Rr(d), B = [cx + r * u[0], cy + r * u[1]];
    (w ? gr : cien).push(lam([A, B]));
    (w ? kr2 : kr1).push(kropka(B[0], B[1], 3));
  });
  out.push({ d: cien.join(' ') }, { d: kr1.join(' ') }, { d: gr.join(' '), gruba: true }, { d: kr2.join(' '), gruba: true });
  out.push({ d: kropka(cx, cy, 4.5), gruba: true });
  log('uczniowie: doktorów', dane.length, ' suma potomków w tabeli', dane.reduce((s, q) => s + q[2], 0), ' (MGP: 3409 łącznie, liczone bez powtórzeń)');
  return out;
}

/* ---------- kontrola pola i liczby ścieżek ---------- */
function kontrola(id, sc) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, drob = [], nan = false;
  for (const { d } of sc) {
    if (/NaN|undefined/.test(d)) nan = true;
    const tok = d.match(/[MLZa]|-?\d+(\.\d+)?/g);
    let i = 0, cx = 0, cy = 0, sub = 0, poz = false;
    const koniec = () => { if (poz && sub > 0 && sub < 2.95) drob.push(+sub.toFixed(2)); sub = 0; };
    while (i < tok.length) {
      const t = tok[i++];
      if (t === 'M') { koniec(); cx = +tok[i++]; cy = +tok[i++]; poz = true; x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy); }
      else if (t === 'L') { const nx = +tok[i++], ny = +tok[i++]; sub += Math.hypot(nx - cx, ny - cy); cx = nx; cy = ny; x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy); }
      else if (t === 'a') { const r = +tok[i]; const dx = +tok[i + 5]; i += 7; poz = false; if (dx > 0) { x1 = Math.max(x1, cx + 2 * r); y0 = Math.min(y0, cy - r); y1 = Math.max(y1, cy + r); } cx += dx; }
    }
    koniec();
  }
  const ok = !nan && x0 >= POLE.x0 && x1 <= POLE.x1 && y0 >= POLE.y0 && y1 <= POLE.y1 && sc.length >= 5 && sc.length <= 60 && drob.length === 0;
  log(`  [${ok ? 'OK' : 'BŁĄD'}] ${id}: ścieżek ${sc.length} (grubych ${sc.filter((p) => p.gruba).length}), zakres x ${f1(x0)}–${f1(x1)}, y ${f1(y0)}–${f1(y1)}${drob.length ? ', drobnica: ' + drob.join(' ') : ''}`);
  if (!ok) process.exitCode = 1;
  return ok;
}


/* =====================================================================================
   FAKTY (treść sprawdzona w źródłach, patrz RAPORT.md)
   ===================================================================================== */
const W = 'https://en.wikipedia.org/wiki/';
const MT = 'https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/';
const FAKTY = [
  { id: 'kanapka-z-szynka', rys: rysKanapka, nazwa: 'Kanapka z szynką', rok: '1938',
    zdanie: 'Trzy dowolnie położone bryły da się przepołowić naraz jednym cięciem płaszczyzną.',
    notka: 'Problem postawił Steinhaus; pierwsza znana publikacja to notatka „Z topologii” w „Mathesis Polska” 11 (1938), s. 26–28, która pierwsze rozwiązanie przypisuje Banachowi (dowód przez twierdzenie Borsuka–Ulama). Wersję n-wymiarową podali Stone i Tukey (1942). Notatka ma też wersję żartobliwą: szynka pod krajalnicą. Rysunek: płaski odpowiednik (dwie figury, jedna prosta); prosta wyliczona bisekcją, dzieli pole kromki i plastra na połowy z dokładnością do czterech miejsc po przecinku. To obecny znak działu.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: [W + 'Ham_sandwich_theorem', 'https://mathshistory.st-andrews.ac.uk/Strick/steinhaus.pdf', 'https://maa.org/press/maa-reviews/mathematical-snapshots'],
    dlaczego_tu: 'Zadanie, które da się opowiedzieć każdemu przy śniadaniu, a dowód prowadzi do topologii.' },
  { id: 'banach-na-plantach', rys: rysLebesgue, nazwa: 'Banach na krakowskich Plantach', rok: '1916',
    zdanie: 'Na wieczornym spacerze usłyszał słowa o całce Lebesgue’a i tak poznał Banacha, swoje największe odkrycie.',
    notka: 'Latem 1916 r. Steinhaus usłyszał z ławki na Plantach słowa „całka Lebesgue’a” (MacTutor pisze „miara Lebesgue’a”) i dosiadł się do Banacha i Nikodyma. Podał im zadanie o zbieżności w średniej sum częściowych szeregu Fouriera; po kilku dniach Banach przyszedł z rozwiązaniem, a wspólna praca ukazała się w 1918 r. Że Banach to jego największe odkrycie, potwierdzają MacTutor, Ciesielscy i Strick („My discovery of Stefan Banach”), ale tylko w przekazie, bez polskiego oryginału, więc zdanie nie jest cytatem. Na Plantach stoi od 14 października 2016 r. ławka z rzeźbami Banacha i Nikodyma. Rysunek: pomysł Lebesgue’a: wykres dzielony poziomo, zbiory {f > t} na kolejnych poziomach.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://ems.press/content/serial-article-files/9616', MT, 'https://mathshistory.st-andrews.ac.uk/Strick/steinhaus.pdf', 'https://hsc.pwr.edu.pl/steinhaus'],
    dlaczego_tu: 'Rozmowa o matematyce na ławce w parku: popularyzacja w najczystszej postaci.' },
  { id: 'osiemnascie-punktow', rys: rys18, nazwa: 'Zadanie o 18 punktach', rok: '1958', przypiecie: true,
    zdanie: 'Punkty stawiamy po kolei tak, by n pierwszych leżało w różnych n-tych częściach odcinka; 18 już się nie da.',
    notka: 'Zadania 6 i 7 ze „Stu zadań” (wyd. polskie 1958, angielskie 1964, s. 12–13). Steinhaus podał przykład dla 14 punktów; Berlekamp i Graham (1970) oraz Warmus (1976) wykazali, że 17 to maksimum; Warmus, doktorant Steinhausa, naliczył 768 wzorów rozwiązań z dokładnością do symetrii. Rysunek: układ 17 punktów znaleziony przeszukaniem z nawrotami (ten sam program dla 18 punktów nie znajduje niczego); wiersz n to odcinek podzielony na n części, kropka to n-ty punkt, pionowa linia pokazuje go w niższych wierszach.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne', podstrona: 'Dla uczniów',
    zrodla: [W + 'Irregularity_of_distributions', 'https://mathworld.wolfram.com/18-PointProblem.html', 'https://openlibrary.org/works/OL460252W', 'https://www.mathgenealogy.org/id.php?id=7383'],
    dlaczego_tu: 'Zadanie wystarczy przeczytać, by zacząć próbować z ołówkiem, a odpowiedź „dokładnie siedemnaście” zaskakuje.' },
  { id: 'longimetr', rys: rysLongimetr, nazwa: 'Longimetr', rok: '1930',
    zdanie: 'Przezroczysta płytka z siatkami: policz przecięcia krzywej z liniami, a dostaniesz jej długość w milimetrach.',
    notka: 'Metodę Steinhaus opisał w 1930 r. („Zur Praxis der Rektifikation und zum Längenbegriff”), a przyrząd w 1932 r. w „Polskim Przeglądzie Kartograficznym”: trzy siatki obrócone o 30°, linie co 3,82 mm. Sprawdzenie: trzy siatki kwadratowe to sześć kierunków, a ze wzoru Croftona na każdy kierunek wypada 2L/(πd) przecięć, więc d = 12/π ≈ 3,82 mm daje liczbę przecięć równą długości w mm. Źródła opisują siatki różnie („równoległe” lub „kwadratowe”); wartość 3,82 mm pasuje tylko do sześciu kierunków. Rysunek: te trzy siatki (rzadsze niż w przyrządzie, dla czytelności) i krzywa z przecięciami.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Dla nauczycieli',
    zrodla: [W + 'Steinhaus_longimeter', 'https://ias-iss.org/ojs/IAS/article/download/1808/1056'],
    dlaczego_tu: 'Kalka, ołówek i mapa wystarczą, by na lekcji zmierzyć rzekę i dojść do liczby π tam, gdzie nikt się jej nie spodziewa.' },
  { id: 'sprawiedliwy-podzial', rys: rysTort, nazwa: 'Sprawiedliwy podział tortu', rok: '1948',
    zdanie: 'Jak podzielić tort między trzy osoby o różnych gustach, by każda dostała według siebie co najmniej 1/3?',
    notka: 'Dla dwóch osób wystarczy „jeden dzieli, drugi wybiera”. Steinhaus postawił problem w 1944 r. (MacTutor), a w „The problem of fair division” (Econometrica 16, 1948, s. 101–104) podał sposób dla trzech: jeden dzieli na trzy równe według siebie, pozostali wskazują kawałki dla nich dobre. Uogólnienie na dowolną liczbę osób przypisuje Banachowi i Knasterowi (ta procedura jest w puli Knastera). Rysunek: pierwszy krok: dzielący uważa, że owoce są warte więcej niż ciasto, więc jego trzy równe części mają kąty 158°, 109° i 93°; wartości wyliczone numerycznie.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Dla uczniów',
    zrodla: [W + 'Lone_divider', 'https://arxiv.org/pdf/0901.2360', MT],
    dlaczego_tu: 'Każdy kiedyś dzielił tort z rodzeństwem, a tu z tego robi się matematyka.' },
  { id: 'dlugosc-wisly', rys: rysWisla, nazwa: 'Jak długa jest Wisła?', rok: '1954',
    zdanie: 'Lewy brzeg Wisły mierzony coraz dokładniej dałby długość nawet tysiąc razy większą niż z mapy szkolnej.',
    notka: 'Steinhaus w „Length, shape and area” (Colloquium Mathematicum 3, 1954, s. 1–13): „The left bank of the Vistula, when measured with increased precision would furnish lengths ten, hundred and even thousand times as great as the length read off the school map”. To jedna z pierwszych wzmianek o paradoksie długości brzegu, później badanym przez Richardsona, a rozsławionym przez Mandelbrota (1967). Rysunek: ta sama losowa krzywa Kocha mierzona cyrklem o rozstawie 56, 18,7 i 6,2 jedn.: łamane mają długość 170, 216 i 271.',
    rodzaj: 'pojęcie', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: [W + 'Coastline_paradox', 'https://eudml.org/doc/210004'],
    dlaczego_tu: 'Pytanie, na które każdy zna „szkolną” odpowiedź, a która okazuje się zależeć od linijki.' },
  { id: 'trzy-odleglosci', rys: rysTrzy, nazwa: 'Twierdzenie o trzech odległościach', rok: '1957–1959',
    zdanie: 'Kolejne obroty o ten sam kąt dzielą okrąg na łuki najwyżej trzech długości; największa to suma dwóch innych.',
    notka: 'Hipotezę postawił Steinhaus, a pierwsze dowody podali Vera T. Sós (1957/58), János Surányi (1958) i Stanisław Świerczkowski (Fundamenta Mathematicae 46, 1959). Twierdzenie mówi o co najwyżej trzech długościach; gdy jest ich trzy, największa jest sumą dwóch pozostałych. Rysunek: 11 punktów przy kącie złotego podziału; łuk nad odstępem ma wysokość proporcjonalną do jego długości, a program sprawdza, że długości są trzy (0,056; 0,090; 0,146) i że największa jest sumą dwóch mniejszych.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne', podstrona: 'Dla nauczycieli',
    zrodla: [W + 'Three-gap_theorem'],
    dlaczego_tu: 'Można to sprawdzić na lekcji kalkulatorem albo cyrklem, zanim padnie słowo „dowód”.' },
  { id: 'kalejdoskop-matematyczny', rys: rysKalejdoskop, nazwa: 'Kalejdoskop matematyczny', rok: '1938', przypiecie: true,
    zdanie: 'Książka z samych niemal obrazków, bez dowodów, od razu po polsku i angielsku, potem w wielu innych językach.',
    notka: 'Po angielsku „Mathematical Snapshots” (Stechert 1938; Oxford 1950, 1969; Dover 1999). MAA liczy 391 szkiców i zdjęć na 295 stronach (późniejsze wydanie). MacTutor przytacza, że ma trafiać do „the scientist in the child and the child in the scientist”. Daty w źródłach: MacTutor i MAA piszą, że książka powstała w 1937 r., en.wikipedia podaje 1939, a Centrum Steinhausa PWr, Linda Hall i recenzja w Mathematical Gazette 1938. Rysunek nawiązuje do tytułu (nie jest ilustracją z książki): trójkąt luster i odbicia motywu, liczone złożeniami symetrii.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://hsc.pwr.edu.pl/steinhaus', 'https://www.lindahall.org/about/news/scientist-of-the-day/hugo-steinhaus/', 'https://maa.org/press/maa-reviews/mathematical-snapshots', 'https://mathshistory.st-andrews.ac.uk/Strick/steinhaus.pdf', MT],
    dlaczego_tu: 'Najbardziej znana popularna książka patrona, pisana dla każdego wieku.' },
  { id: 'kieszen-ksiazki', rys: rysDwunastoscian, nazwa: 'Co było w kieszeni książki', rok: '1938',
    zdanie: 'Książka miała kieszeń: okulary do obrazów 3D, karty do kartkowania i dwie połówki dwunastościanu do złożenia.',
    notka: 'Biblioteka Linda Hall opisuje egzemplarz „Mathematical Snapshots” z 1938 r.: okulary czerwono-zielone do 15 anaglifów w książce, talia 31 kart, które po przekartkowaniu pokazują m.in. punkt kreślący cykloidę, oraz dwie płaskie połówki dwunastościanu foremnego, które gumka składa w bryłę. Nie sprawdzono, czy polskie wydanie miało to samo. Rysunek: dwie połówki po sześć pięciokątów (siatka dokładna, kontrola długości boków).',
    rodzaj: 'anegdota', pewnosc: 'pewne', podstrona: 'Dla uczniów',
    zrodla: ['https://www.lindahall.org/about/news/scientist-of-the-day/hugo-steinhaus-2/', 'https://www.lindahall.org/about/news/scientist-of-the-day/hugo-steinhaus/'],
    dlaczego_tu: 'Matematyka do wzięcia do ręki: można odtworzyć ten model z kartonu i gumki.' },
  { id: 'krol-wieza-miny', rys: rysSzachownica, nazwa: 'Król, wieża i miny', rok: '1954',
    zdanie: 'Albo król przejdzie szachownicę w poprzek, omijając miny, albo wieża przejedzie z góry na dół po samych minach.',
    notka: 'Twierdzenie Steinhausa o szachownicy. Kulpa, Socha i Turzański (2000) cytują jako źródło „Kalejdoskop matematyczny” w wydaniu PWN z 1954 r. Rok do sprawdzenia: to najwcześniejsze wydanie, które znalazłem w cytowaniu; nie wiem, czy twierdzenie było już w wydaniu z 1938 r. Wariant na planszy heksagonalnej to gra Hex (Gale 1979). Rysunek: 8×8, 27 min (kółka) i droga wieży; program przeszukaniem grafu sprawdza, że król nie przechodzi w poprzek.',
    rodzaj: 'twierdzenie', pewnosc: 'do sprawdzenia', podstrona: 'Dla uczniów',
    zrodla: ['https://dml.cz/bitstream/handle/10338.dmlcz/702068/ActaCarolinae_041-2000-2_7.pdf', W + 'Steinhaus_chessboard_theorem'],
    dlaczego_tu: 'Twierdzenie o szachownicy, które da się sprawdzić na prawdziwej planszy z pionkami.' },
  { id: 'zapalki-banacha', rys: rysZapalki, nazwa: 'Zapałki Banacha', rok: '1941',
    zdanie: 'Ostatni wpis w Księdze Szkockiej: ile zapałek zostaje w jednym pudełku, gdy drugie okazuje się puste?',
    notka: 'Pozycję 193, z datą 31 maja 1941 r., podpisał Steinhaus; Ulam nazywa ją „dość tajemniczym zestawem wyników liczbowych” o rozkładzie liczby zapałek w pudełku. Znana postać zadania (matematyk z dwoma pudełkami po N zapałek sięga do losowej kieszeni) pochodzi od Fellera, który wiąże ją z żartem Steinhausa o paleniu Banacha. Rysunek: historia wyjmowania zapałek jako droga po kratce dla N = 7: krok w prawo to lewa kieszeń, krok w górę to prawa; krzyżyk: sięgnięcie do pustego pudełka, gdy w drugim są jeszcze dwie. Prawdopodobieństwa: C(2N − k, N)/2^(2N − k).',
    rodzaj: 'anegdota', pewnosc: 'pewne', podstrona: 'Dla nauczycieli',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/HistTopics/Scottish_Book/', W + 'Scottish_Book', W + 'Banach%27s_matchbox_problem'],
    dlaczego_tu: 'Gotowe zadanie na lekcję rachunku prawdopodobieństwa, z historią w tle.' },
  { id: 'banach-steinhaus', rys: rysBanachSteinhaus, nazwa: 'Twierdzenie Banacha–Steinhausa', rok: '1927',
    zdanie: 'Rodzina operatorów liniowych ograniczona w każdym punkcie jest ograniczona jedną wspólną stałą.',
    notka: 'Banach i Steinhaus, „Sur le principe de la condensation de singularités”, Fundamenta Mathematicae 9 (1927), s. 50–61; niezależnie Hans Hahn. Twierdzenie wymaga przestrzeni Banacha i operatorów ciągłych. Wniosek: istnieje funkcja ciągła, której szereg Fouriera jest rozbieżny w punkcie. Rysunek: jądra Dirichleta dla n = 2, 4, 7, 12; szczyt to 2n + 1, a norma funkcjonału sumy częściowej (stała Lebesgue’a) rośnie: 1,64; 1,88; 2,09; 2,29.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne', podstrona: 'zapas',
    zrodla: ['https://encyclopediaofmath.org/wiki/Banach-Steinhaus_theorem', W + 'Uniform_boundedness_principle'],
    dlaczego_tu: 'Najważniejszy wynik patrona, ale wymaga wykładu z analizy funkcjonalnej; dobry raczej dla studentów.' },
  { id: 'k-srednich', rys: rysKSrednich, nazwa: 'Metoda k-średnich', rok: '1956',
    zdanie: 'Jak podzielić bryłę na k części, by suma ich momentów bezwładności była najmniejsza? Dziś tak grupuje się dane.',
    notka: 'Steinhaus, „Sur la division des corps matériels en parties”, Bull. Acad. Polon. Sci. 4 (1956), s. 801–804. Według przeglądu Bocka (2008) to pierwsze jawne sformułowanie, z ciągłą wersją algorytmu i przykładami z antropologii i przemysłu; Lloyd zapisał jednowymiarowy wariant w 1957 r., a nazwę „k-means” dał MacQueen (1967). Rysunek: płaska bryła podzielona iteracją na pięć części, kółka to środki ciężkości, granice to komórki Woronoja.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://emis.univie.ac.at/journals/JEHPS/Decembre2008/Bock.pdf'],
    dlaczego_tu: 'Algorytm z każdego kursu analizy danych wyrósł z pytania o bryły i momenty bezwładności.' },
  { id: 'dendryt', rys: rysDendryt, nazwa: 'Dendryt: taksonomia wrocławska', rok: '1951',
    zdanie: 'Najkrótsze drzewo łączące punkty, po usunięciu najdłuższych krawędzi, rozpada się na naturalne grupy.',
    notka: 'Florek, Łukaszewicz, Perkal, Steinhaus i Zubrzycki: „Sur la liaison et la division des points d’un ensemble fini”, Colloquium Mathematicum 2 (1951), s. 282–285, oraz „Taksonomia wrocławska”, Przegląd Antropologiczny 17 (1951), s. 193–210. Mielniczuk (2013): metoda najkrótszego dendrytu jest dotąd stosowana przez praktyków. Rysunek: 43 punkty, najkrótsze drzewo wyliczone algorytmem Prima; dwie najdłuższe krawędzie są przerwane, zostają trzy grupy.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Organizatorzy',
    zrodla: ['https://eudml.org/doc/209969', 'https://dbc.wroc.pl//Content/141514/Dudek_Metoda_taksonomii_wroclawskiej.pdf', 'https://home.ipipan.waw.pl/j.mielniczuk/J-MielniczukPS2013.pdf'],
    dlaczego_tu: 'Pięciu autorów z jednego miasta: wynik wspólnej pracy wrocławskiego środowiska.' },
  { id: 'zamiany-sasiadow', rys: rysSJT, nazwa: 'Zamiany sąsiadów', rok: '1958',
    zdanie: 'Wszystkie ustawienia n elementów można obejść, zamieniając za każdym razem tylko dwa sąsiednie.',
    notka: 'Algorytm Steinhausa–Johnsona–Trottera. W „Stu zadaniach” (1958; angielskie wyd. 1964, s. 49–50) Steinhaus opisuje pokrewną zagadkę o cząstkach, które mijają się na prostej; książkę długo uważano za pierwszą publikację algorytmu, co Ruskey (1989) zakwestionował. Jawnie podali go Trotter (1962) i Johnson (1963), a angielscy dzwonnicy znali tę metodę już w XVII w. Rysunek: n = 4, 24 ustawienia i 23 zamiany (program sprawdza, że każda dotyczy sąsiadów); gruba nić to element 4, idzie zygzakiem.',
    rodzaj: 'pojęcie', pewnosc: 'pewne', podstrona: 'Dla uczniów',
    zrodla: [W + 'Steinhaus%E2%80%93Johnson%E2%80%93Trotter_algorithm'],
    dlaczego_tu: 'Da się to odtworzyć kartami na ławce albo dzwonkami, a to już algorytm.' },
  { id: 'liczby-w-figurach', rys: rysMoser, nazwa: 'Liczby w kole i w kwadracie', rok: '1969',
    zdanie: 'Olbrzymie liczby zapisywał figurami: 2 w kole to mega, czyli 256 w 256 zagnieżdżonych trójkątach.',
    notka: 'Notacja Steinhausa–Mosera. n w trójkącie to n do potęgi n; n w kwadracie to n w n trójkątach; n w kole to n w n kwadratach. Stąd 2 w kwadracie = 256, a mega = 256 w 256 trójkątach. Leo Moser rozszerzył zapis na dowolne wielokąty. Rok do sprawdzenia: en.wikipedia podaje tylko wydanie „Mathematical Snapshots” z 1969 r., s. 28–29; nie sprawdziłem, od którego wydania zapis tam jest. Rysunek: 2 w kole; 2 w dwóch kwadratach; kwadrat z 2 w dwóch trójkątach; trójkąty zagnieżdżone (narysowane tylko pierwsze).',
    rodzaj: 'pojęcie', pewnosc: 'do sprawdzenia', podstrona: 'Dla uczniów',
    zrodla: [W + 'Steinhaus%E2%80%93Moser_notation'],
    dlaczego_tu: 'Rysunki w miejsce cyfr: zabawa, od której łatwo dojść do liczb większych, niż da się zapisać.' },
  { id: 'twierdzenie-o-odleglosciach', rys: rysRoznice, nazwa: 'Twierdzenie o odległościach', rok: '1920',
    zdanie: 'W każdym zbiorze na prostej o dodatniej mierze są dwa różne punkty odległe o liczbę wymierną.',
    notka: 'Steinhaus, „Sur les distances des points dans les ensembles de mesure positive”, Fundamenta Mathematicae 1 (1920), s. 93–104, czyli pierwszy tom tego pisma. Ogólniej: różnice punktów takiego zbioru wypełniają przedział wokół zera. Rysunek: u góry gruby zbiór Cantora A, jego przesunięcie i część wspólna; niżej wykres t ↦ |A ∩ (A + t)|, liczony na szóstym etapie konstrukcji: jest ciągły i dodatni wokół zera, a na tym opiera się dowód.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne', podstrona: 'zapas',
    zrodla: ['https://eudml.org/doc/212590', W + 'Steinhaus_theorem'],
    dlaczego_tu: 'Ładne, ale wymaga pojęcia miary; raczej dla studentów niż na stronę popularyzacji.' },
  { id: 'kolo-n-punktow', rys: rysKolo, nazwa: 'Koło z n punktami kratki', rok: '1957', przypiecie: true,
    zdanie: 'Dla każdego n istnieje koło, w którego wnętrzu leży dokładnie n punktów o współrzędnych całkowitych.',
    notka: 'Pytanie Steinhausa z 1957 r., opublikowane w czasopiśmie dla nauczycieli szkół średnich (cut-the-knot; tytułu pisma nie ustaliłem); to też zadania 23 i 24 w „Stu zadaniach”. Rozwiązanie jest piękne: ze środka (√2, 1/3) (pomysł Sierpińskiego z 1958 r.) każdy punkt kratowy jest w innej odległości, więc rosnące koło zgarnia je po jednym. Schinzel opracował pokrewne zagadnienie punktów na okręgu. Rysunek: ten środek (przesunięty o wektor kratowy), koła z dokładnie 2, 7 i 18 punktami; program sprawdza liczbę punktów.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne', podstrona: 'Dla nauczycieli',
    zrodla: ['https://www.cut-the-knot.org/do_you_know/diffDist.shtml', 'https://mathworld.wolfram.com/CircleLatticePoints.html'],
    dlaczego_tu: 'Steinhaus zadał to pytanie właśnie nauczycielom; dowód mieści się w jednym akapicie.' },
  { id: 'czem-jest-matematyka', rys: rysPewniki, nazwa: 'Czem jest, a czem nie jest matematyka', rok: '1923',
    zdanie: '„Żadna nauka nie wzmacnia tak wiary w potęgę umysłu ludzkiego, jak matematyka”: pisał w popularnej książce.',
    notka: 'Książka wydana przez Księgarnię H. Altenberga we Lwowie w 1923 r.; Murawski (2011) nazywa ją popularną i cytuje to zdanie z jej zakończenia (s. 169). Stamtąd też: „Charakterystyczną cechą matematyki jest jej metoda” oraz myśl, że pewniki i definicje „mają w dużej mierze cechę dowolności”. Rysunek jest ilustracją tej myśli, nie rycina z książki (nie miałem jej w ręku): dysk Poincarégo, w którym przez punkt P przechodzi wiele prostych niespotykających prostej grubej; liczone jako obrazy średnic.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Dla nauczycieli',
    zrodla: ['https://czasopisma.pan.pl/Content/93495', W + 'Hugo_Steinhaus'],
    dlaczego_tu: 'Pierwsza popularna książka patrona, o tym, po co się tego uczyć.' },
  { id: 'nowa-ksiega-szkocka', rys: rysRademacher, nazwa: 'Nowa Księga Szkocka', rok: '1946',
    zdanie: 'Wrocławska kontynuacja lwowskiej księgi problemów: pierwszy wpis zrobił Steinhaus w lipcu 1946 r.',
    notka: 'Biler, Krupski, Plebanek i Woyczyński (Pamięć i Przyszłość 3/2015) podają jako datę pierwszego wpisu 2 lipca 1946 r.; wcześniejsze notatki w tym projekcie wskazywały 1 lipca (Duda, Weron), czego nie sprawdziłem, więc w zdaniu jest tylko miesiąc. Problemy pojawiały się regularnie do 1979 r., sporadycznie do 1987 r.; już w 1946 r. wpisali się Choquet i Jarník. Księga to zeszyty z biblioteki Instytutu Matematycznego, od 2014 r. oprawione w skórę. Rysunek: temat problemów Steinhausa, które wiązały się z serią „Sur les fonctions indépendantes”: funkcje Rademachera i iloczyn dwóch z nich o średniej zero.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Organizatorzy',
    zrodla: ['https://wmi.uwr.edu.pl/wp-content/uploads/sites/288/2024/05/11-BKPW-PiP-3-2015.pdf', MT],
    dlaczego_tu: 'Własna księga problemów Instytutu: tak wrocławscy matematycy zaczęli organizować wspólne życie naukowe.' },
  { id: 'ojcostwo-i-bayes', rys: rysBayes, nazwa: 'Ojcostwo i wzór Bayesa', rok: '1954',
    zdanie: 'Do sporów o ojcostwo zastosował wyniki badań krwi i rachunek prawdopodobieństwa.',
    notka: '„O dochodzeniu ojcostwa”, Zastosowania Matematyki 1 (1953–54), s. 67–82. Mielniczuk (2013) nazywa te prace nowatorskimi. Szczotkowa i Szczotka (1976) powołują się na Steinhausa (1954) przy prawdopodobieństwie a priori 1/2 we wzorze Bayesa i ostrzegają, że same grupy krwi w przedziale 55–90% nie wystarczają do wyroku. Rysunek jest ogólny, nie z pracy Steinhausa (nie czytałem pełnego tekstu): prawdopodobieństwo po badaniu w zależności od a priori, dla ilorazów wiarygodności 1/16, 1/4, 1, 4, 16; pionowa linia: a priori 1/2.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://geodesic.mathdoc.fr/articles/10.4064/am-1-2-67-82', 'https://home.ipipan.waw.pl/j.mielniczuk/J-MielniczukPS2013.pdf', 'https://czasopisma.uni.lodz.pl/ar/article/download/20398/19983/47916', 'https://sztetl.org.pl/en/biographies/192717-steinhaus-hugo-dyonizy'],
    dlaczego_tu: 'Matematyka w sądzie, opowiedziana bez wzorów: pokazuje, po co jest prawdopodobieństwo warunkowe.' },
  { id: 'introwizor', rys: rysIntrowizor, nazwa: 'Introwizor', rok: '1938',
    zdanie: 'Przyrząd rentgenowski wskazujący chirurgowi miejsce odłamka w ciele: lusterko pokazuje tam świecący znacznik.',
    notka: 'Patent USA nr 2 441 538 („Method of and apparatus for localizing and visualizing foreign bodies”): pierwszeństwo w Polsce 8 marca 1938 r., udzielony 11 maja 1948 r. Lampa i ekran stoją na obrotowym pręcie; gdy cień obiektu nie schodzi z punktu na ekranie w dwóch położeniach pręta, obiekt leży na osi obrotu. Półprzezroczyste lusterko pokazuje wtedy znacznik w miejscu obiektu. Centrum Steinhausa podaje pokaz w USA w 1947 r. Rysunek: przekrój ciała, dwa położenia lampy i ekranu, promienie przecinają się w obiekcie; geometria według patentu, wymiary dobrane.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://patents.google.com/patent/US2441538', 'https://hsc.pwr.edu.pl/steinhaus', 'https://sztetl.org.pl/en/biographies/192717-steinhaus-hugo-dyonizy'],
    dlaczego_tu: 'Geometria dwóch prostych, która trafia na salę operacyjną.' },
  { id: 'taryfa-kwadratowa', rys: rysTaryfa, nazwa: 'Kwadratowa taryfa za prąd', rok: '1939',
    zdanie: 'Płacić według pierwiastka z całki kwadratu mocy: przy tej samej energii równy pobór wychodzi wtedy taniej.',
    notka: 'Centrum Hugona Steinhausa PWr: propozycja z 1939 r. (Bulletin of the Swiss Electrotechnical Society), a prototyp licznika wyprodukowała 16 stycznia 1948 r. fabryka w Świdnicy, dziś „Pafal”. Takie rozliczenie premiuje stały pobór, wygodny dla producenta prądu. Jedno źródło, ale to wyspecjalizowany ośrodek noszący imię Steinhausa. Rysunek: dwa pobory o tej samej energii na dobę: stały (gruby) i ze szczytami; przy tej taryfie szczyty są o 33% droższe (przerywana: stały pobór w tej samej cenie).',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://hsc.pwr.edu.pl/steinhaus'],
    dlaczego_tu: 'Rachunek za prąd: całka, którą każdy widział na liczniku, choć o tym nie wie.' },
  { id: 'doktorat-u-hilberta', rys: rysDirichlet, nazwa: 'Doktorat u Hilberta', rok: '1911',
    zdanie: 'W Getyndze obronił u Hilberta pracę o nowych zastosowaniach zasady Dirichleta.',
    notka: 'Rozprawa „Neue Anwendungen des Dirichlet’schen Prinzips”, Getynga 1911, obroniona z wyróżnieniem. Rysunek: sama zasada, nie treść rozprawy: spośród funkcji o zadanych wartościach na brzegu obszaru najmniejszą energię ma funkcja harmoniczna; tu policzona relaksacją, z poziomicami wewnątrz obszaru.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'zapas',
    zrodla: [MT, 'https://www.mathgenealogy.org/id.php?id=7383'],
    dlaczego_tu: 'Ciekawostka biograficzna, luźno związana z popularyzacją; do użycia, gdy zabraknie innych.' },
  { id: 'rachunek-za-znaczek', rys: rysZnaczek, nazwa: 'Rachunek za znaczek', rok: 'ok. 1937',
    zdanie: 'Szansa 1 do 5000 razy pensja 150 funtów: tak Steinhaus radził Kacowi, czy warto wysłać podanie do Londynu.',
    notka: 'Kac wspomina, że po doktoracie (czerwiec 1937) zapytał Steinhausa o podanie na posadę młodszego wykładowcy w Imperial College. Steinhaus, po części żartem, ocenił szanse na 1 do 5000 i kazał porównać iloczyn z rocznym wynagrodzeniem z ceną znaczka. „It turned out to be a little bit less than the cost of the stamp, so I wrote.” Posady nie dostał; w 1938 r. pojechał na stypendium do Johns Hopkins. Rysunek: wartość oczekiwana jako funkcja szansy; 150/5000 = 0,03 funta. Poziomą linię znaczka dobrano orientacyjnie, bo MacTutor nie podaje jego ceny.',
    rodzaj: 'anegdota', pewnosc: 'pewne', podstrona: 'Dla uczniów',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/Biographies/Kac/', W + 'Mark_Kac'],
    dlaczego_tu: 'Wartość oczekiwana w codziennej decyzji, z uśmiechem.' },
  { id: 'konkurs-ptm', rys: rysGalton, nazwa: 'Konkurs od ucznia Steinhausa', rok: '1967',
    zdanie: 'Konkurs na prace studenckie w Wrocławskim Oddziale PTM zainicjował Józef Łukaszewicz, uczeń Steinhausa.',
    notka: 'Strona Oddziału: historia konkursu sięga 1967 r.; to jeden z najstarszych wciąż odbywających się konkursów na prace studenckie w Polsce; edycja z 2024 r. ma numer LVIII. Kategorie w zestawieniach to rachunek prawdopodobieństwa i zastosowania matematyki. Łukaszewicz doktoryzował się u Steinhausa w 1957 r. (Mathematics Genealogy). Rysunek jest symbolem tematyki, nie dotyczy konkursu wprost: deska Galtona, jedna droga kulki i rozkład dwumianowy dla 8 rzędów.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Organizatorzy',
    zrodla: ['https://ptm.math.uni.wroc.pl/konkurs/historia-konkursu', 'https://www.mathgenealogy.org/id.php?id=7383'],
    dlaczego_tu: 'Bezpośrednia nić od patrona do jednego z organizatorów wymienionych na tej stronie.' },
  { id: 'z-lawki-do-towarzystwa', rys: rysTowarzystwo, nazwa: 'Z ławki do towarzystwa', rok: '1919', przypiecie: true,
    zdanie: 'Po rozmowach na Plantach postanowili założyć towarzystwo; od 1919 r. działało w Krakowie, dziś to PTM.',
    notka: 'Steinhaus wspomina rozmowy z 1916 r. z Banachem i Nikodymem: „we decided to establish a mathematical society”. Formalnie Towarzystwo Matematyczne ukonstytuowało się w Krakowie 2 kwietnia 1919 r.; wśród szesnastu obecnych MacTutor wymienia Banacha, Nikodyma, Zarembę i Żorawskiego (o obecności samego Steinhausa nic nie pisze). Nazwę Polskie Towarzystwo Matematyczne przyjęto 21 kwietnia 1920 r. W październiku 1945 r. przyjęto delegatów nowej sekcji wrocławskiej. Rysunek jest symbolem: trzy kropki z ławki i krąg szesnastu.',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Organizatorzy',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/Societies/Polish/', MT],
    dlaczego_tu: 'Wrocławski Oddział PTM wywodzi się z towarzystwa, które zaczęło się od tej rozmowy.' },
  { id: 'miedzy-duchem-a-materia', rys: rysDuchMateria, nazwa: 'Między duchem a materią', rok: '1980',
    zdanie: '„Między duchem a materią pośredniczy matematyka”: aforyzm Steinhausa wyryty też na jego nagrobku.',
    notka: 'Zdanie przytacza Murawski (2011) za „Słownikiem racjonalnym” (Ossolineum 1980, s. 54), z przypisem, że wyryto je na nagrobku; to też tytuł wyboru pism (PWN 2000). Steinhaus zmarł w 1972 r., więc rok 1980 to rok druku książki, nie powstania zdania. MacTutor podaje po angielsku „Between spirit and matter, there is mathematics”, POLIN „Mathematics mediates between spirit and matter”; polskie brzmienie napisu znam tylko z Murawskiego. Rysunek jest moją ilustracją: sumy częściowe szeregu Fouriera (rzędy 1, 3, 5, 9, 21) prowadzą od gładkiej fali do twardej fali prostokątnej.',
    rodzaj: 'anegdota', pewnosc: 'pewne', podstrona: 'Dla wszystkich',
    zrodla: ['https://czasopisma.pan.pl/Content/93495', MT, 'https://kolekcje.polin.pl/en/hugo-steinhaus-1970', 'https://sztetl.org.pl/en/biographies/192717-steinhaus-hugo-dyonizy', 'https://digilab.uwr.edu.pl/en/dlibra/publication/109789/slownik-racjonalny-steinhaus-hugo'],
    dlaczego_tu: 'Dewiza patrona; jedyny udokumentowany aforyzm, który pasuje na nagłówek całego działu.' },
  { id: 'rzuty-moneta', rys: rysMoneta, nazwa: 'Nieskończone rzuty monetą', rok: '1923',
    zdanie: 'Ciągi orłów i reszek opisał jak punkty odcinka: krok ku dzisiejszym aksjomatom rachunku prawdopodobieństwa.',
    notka: 'Steinhaus, „Les probabilités dénombrables et leur rapport à la théorie de la mesure”, Fundamenta Mathematicae 4 (1923), s. 286–310. Bednarski (2018): przestrzenią są nieskończone ciągi zero-jedynkowe, ich odpowiednikiem rozwinięcia dwójkowe liczb z [0, 1], a miara odpowiada niezależnym rzutom monetą i służy do dowodu mocnego prawa wielkich liczb; praca zawiera kluczowe elementy późniejszej aksjomatyki Kołmogorowa. Rysunek: drzewo podziałów dwójkowych; ciąg 1, 0, 1, 1, 0 wyznacza przedział długości 1/32.',
    rodzaj: 'pojęcie', pewnosc: 'pewne', podstrona: 'zapas',
    zrodla: ['https://czasopisma.uni.lodz.pl/foe/article/download/2433/pdf/9990'],
    dlaczego_tu: 'Mocne, ale specjalistyczne; dobre w zapasie, gdy potrzebny będzie wątek prawdopodobieństwa.' },
  { id: 'kontrola-jakosci', rys: rysKontrola, nazwa: 'Kontrola jakości z próbki', rok: '1951',
    zdanie: 'Ile sztuk sprawdzić, by przyjąć partię? Steinhaus bronił tu wzoru Bayesa i współtworzył polskie normy.',
    notka: 'MacTutor wymienia pracę „Quality control by sampling (a plea for Bayes’ rule)” z 1951 r. Mielniczuk (2013): ze Steinhausem, Oderfeldem i Wiśniewskim wiążą się pierwsze polskie normy statystyczne kontroli jakości (bez daty). Rysunek jest ogólny: krzywe operacyjne planów odbioru (n, c) = (10, 0), (20, 1), (50, 3), (200, 12), czyli szansa przyjęcia partii w zależności od odsetka braków.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne', podstrona: 'zapas',
    zrodla: [MT, 'https://home.ipipan.waw.pl/j.mielniczuk/J-MielniczukPS2013.pdf'],
    dlaczego_tu: 'Dobry przykład zastosowań, ale temat techniczny; w zapasie.' },
  { id: 'uczniowie-steinhausa', rys: rysUczniowie, nazwa: 'Uczniowie i ich uczniowie', rok: '1920–1968',
    zdanie: 'Według bazy MGP wypromował 20 doktorów, m.in. Banacha, Orlicza i Kaca, a ma ponad 3400 akademickich potomków.',
    notka: 'Dane z Mathematics Genealogy Project (stan z 5.11.2026, baza bywa niepełna i się zmienia): 20 studentów, 3409 potomków, od Banacha (Lwów 1920) po Trybułę (Wrocław 1960, 1968). Ulam nie jest na tej liście (w przedmowie do Księgi Szkockiej nazywa Steinhausa „moim nauczycielem i przyjacielem”). Infobox w en.wikipedii nie ma przypisu i podaje tylko siedem nazwisk. Rysunek: promień na ucznia, długość zależna od logarytmu liczby jego potomków (okręgi: 10, 100, 1000), grube: 13 promocji powojennych (w bazie: 9 UWr, 1 PWr, 3 IMPAN).',
    rodzaj: 'historia', pewnosc: 'pewne', podstrona: 'Organizatorzy',
    zrodla: ['https://www.mathgenealogy.org/id.php?id=7383', 'https://www.osti.gov/servlets/purl/7218289'],
    dlaczego_tu: 'Dobrze pokazuje, że organizowanie matematyki to przede wszystkim ludzie.' },
];

/* ---------- porządkowanie ścieżek: upraszczanie łamanych (Douglas–Peucker, tolerancja 0,12 jedn.) ---------- */
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let m = -1, md = 0;
  for (let i = 1; i < pts.length - 1; i++) { const d = L < 1e-9 ? Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]) : Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / L; if (d > md) { md = d; m = i; } }
  if (md <= tol) return [a, b];
  return dp(pts.slice(0, m + 1), tol).slice(0, -1).concat(dp(pts.slice(m), tol));
}
function uprosc(d) {
  return d.split(/(?=M)/).map((sub) => {
    if (/[a]/.test(sub)) return sub.trim();
    const zamk = /Z/.test(sub), l = (sub.match(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g) || []).map((q) => q.split(',').map(Number));
    if (l.length < 3) return sub.trim();
    // zamknięta: tniemy na dwie połowy, żeby końce algorytmu nie zlały się w jeden punkt
    let w;
    if (zamk) { const m = Math.floor(l.length / 2); w = dp(l.slice(0, m + 1), 0.12).slice(0, -1).concat(dp(l.slice(m).concat([l[0]]), 0.12).slice(0, -1)); } else w = dp(l, 0.12);
    return 'M' + w.map(P).join(' L') + (zamk ? ' Z' : '');
  }).join(' ');
}

/* ---------- budowa wyniku ---------- */
const WYNIK = FAKTY.map(({ rys, ...f }) => ({ ...f, sciezki: rys().map((p) => ({ d: uprosc(p.d), gruba: !!p.gruba })) }));
const WSZYSTKIE = () => WYNIK.map((f) => ({ id: f.id, sciezki: f.sciezki }));

function sprawdz() {
  const bledy = [], ID = new Set(), POD = ['Dla uczniów', 'Dla nauczycieli', 'Dla wszystkich', 'Organizatorzy', 'zapas'], rodz = ['twierdzenie', 'pojęcie', 'historia', 'anegdota', 'zastosowanie'];
  for (const f of WYNIK) {
    const e = (m) => bledy.push(`${f.id}: ${m}`);
    if (ID.has(f.id)) e('powtórzone id'); ID.add(f.id);
    if ([...f.nazwa].length > 40) e(`nazwa ${[...f.nazwa].length} znaków`);
    if ([...f.zdanie].length > 118) e(`zdanie ${[...f.zdanie].length} znaków`);
    if (!f.zrodla || !f.zrodla.length) e('brak źródeł');
    if (!f.notka || !f.dlaczego_tu) e('brak notki');
    if (!POD.includes(f.podstrona)) e('zła podstrona ' + f.podstrona);
    if (!rodz.includes(f.rodzaj)) e('zły rodzaj');
    if (!['pewne', 'do sprawdzenia'].includes(f.pewnosc)) e('zła pewność');
    if (f.sciezki.length < 5 || f.sciezki.length > 60) e(`ścieżek ${f.sciezki.length}`);
    if (!f.sciezki.some((s) => s.gruba)) e('brak grubej ścieżki');
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const { d } of f.sciezki) {
      const tok = d.match(/[MLZa]|-?\d+(?:\.\d+)?/g); let i = 0, cx = 0, cy = 0;
      if (/NaN|undefined/.test(d)) e('NaN w ścieżce');
      while (i < tok.length) {
        const t = tok[i++];
        if (t === 'M' || t === 'L') { cx = +tok[i++]; cy = +tok[i++]; x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy); }
        else if (t === 'a') { const r = +tok[i], dx = +tok[i + 5]; i += 7; if (dx > 0) { x1 = Math.max(x1, cx + 2 * r); y0 = Math.min(y0, cy - r); y1 = Math.max(y1, cy + r); } cx += dx; }
      }
    }
    if (x0 < POLE.x0 - 0.05 || x1 > POLE.x1 + 0.05 || y0 < POLE.y0 - 0.05 || y1 > POLE.y1 + 0.05) e(`poza polem x ${f1(x0)}–${f1(x1)}, y ${f1(y0)}–${f1(y1)}`);
    f._box = `x ${f1(x0)}–${f1(x1)}, y ${f1(y0)}–${f1(y1)}`;
  }
  if (WYNIK.filter((f) => f.przypiecie).length > 4) bledy.push('za dużo przypięć');
  return bledy;
}

if (require.main === module && !process.argv.includes('--test')) {
  const bledy = sprawdz();
  for (const f of WYNIK) console.log(`${bledy.some((b) => b.startsWith(f.id + ':')) ? '!!' : 'ok'} ${f.id}: ${f.sciezki.length} ścieżek, ${f._box}, zdanie ${[...f.zdanie].length}, nazwa ${[...f.nazwa].length}`);
  if (bledy.length) { console.log('BŁĘDY:\n' + bledy.join('\n')); process.exitCode = 1; }
  const czyste = WYNIK.map(({ _box, ...f }) => f);
  fs.writeFileSync(path.join(KAT, 'ciekawostki.json'), JSON.stringify(czyste, null, 2) + '\n');
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = (ps, w, h) => `<svg viewBox="0 0 200 240" width="${w}" height="${h}" aria-hidden="true">${ps.map((p) => `<path d="${p.d}"${p.gruba ? ' class="gruba"' : ''}/>`).join('')}</svg>`;
  const karty = czyste.map((c, i) => `
  <article class="karta">
    <div class="baner"><div class="podpis"><b>${esc(c.nazwa)}, ${esc(c.rok)}</b>${esc(c.zdanie)}</div>${svg(c.sciezki, 145, 170)}</div>
    <div class="opis">
      <div class="duzy">${svg(c.sciezki, 200, 240)}</div>
      <div>
        <p class="meta"><span class="nr">${i + 1}</span> <span class="pod">${esc(c.podstrona)}${c.przypiecie ? ' · przypięcie' : ''}</span> · ${esc(c.rodzaj)} · <span class="${c.pewnosc === 'pewne' ? 'ok' : 'spr'}">${esc(c.pewnosc)}</span></p>
        <h2>${esc(c.nazwa)} <small>${esc(c.rok)}</small></h2>
        <p class="zd">${esc(c.zdanie)} <small>(${[...c.zdanie].length} zn.)</small></p>
        <p class="nt">${esc(c.notka)}</p>
        <p class="dl"><i>Dlaczego tu:</i> ${esc(c.dlaczego_tu)}</p>
        <p class="rys">${c.sciezki.length} ścieżek · źródła: ${c.zrodla.map((u) => `<a href="${esc(u)}">${esc(new URL(u).hostname.replace(/^www\./, ''))}</a>`).join(', ')}</p>
      </div>
    </div>
  </article>`).join('');
  const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Steinhaus: ciekawostki i rysunki</title>
<style>
:root { --granat: #0d1830; --j: #a991f7; --g: #30216a; --a: #5b3fc4; --t: #eeeafd; --tekst: #1d2433; --szary: #5b6475; }
* { box-sizing: border-box; }
body { margin: 0; padding: 28px 24px 40px; background: #f2f1f6; color: var(--tekst); font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
h1 { margin: 0 0 4px; font-size: 24px; } .lead { margin: 0 0 22px; color: var(--szary); max-width: 900px; }
.siatka { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 1fr)); gap: 18px; }
.karta { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgb(0 0 0 / .12); }
.baner { position: relative; height: 190px; color: #fff; background: linear-gradient(100deg, var(--granat) 0, var(--granat) 42%, color-mix(in srgb, var(--granat) 55%, var(--g)) 72%, var(--g) 100%); }
.baner svg { position: absolute; right: 18px; top: 10px; }
.baner .podpis { position: absolute; right: 178px; top: 54px; width: min(230px, calc(100% - 190px)); text-align: right; font-size: 12.5px; line-height: 1.45; color: rgb(255 255 255 / .72); }
.baner .podpis b { display: block; font-style: italic; font-weight: 500; font-size: 15px; color: #fff; font-family: Georgia, serif; }
svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.baner svg path { stroke: color-mix(in srgb, var(--j) 55%, transparent); stroke-width: 1.3; vector-effect: non-scaling-stroke; }
.baner svg path.gruba { stroke: var(--j); stroke-width: 2; }
.opis { display: grid; grid-template-columns: 120px 1fr; gap: 14px; padding: 14px 16px 16px; }
.duzy svg { width: 120px; height: 144px; background: var(--t); border-radius: 6px; }
.duzy svg path { stroke: color-mix(in srgb, var(--a) 60%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
.duzy svg path.gruba { stroke: var(--a); stroke-width: 2; }
h2 { margin: 2px 0 6px; font-size: 17px; } h2 small { font-weight: 500; color: var(--szary); }
.meta { margin: 0; font-size: 12px; color: var(--szary); } .nr { display: inline-block; min-width: 20px; padding: 0 5px; border-radius: 9px; background: var(--granat); color: #fff; text-align: center; }
.pod { font-weight: 700; color: var(--a); } .ok { color: #23753a; font-weight: 600; } .spr { color: #a35b00; font-weight: 600; }
.zd { margin: 0 0 6px; font-weight: 600; } .zd small, .rys { color: var(--szary); font-weight: 400; font-size: 12px; }
.nt, .dl { margin: 0 0 6px; font-size: 13px; } .rys { margin: 0; }
</style></head><body>
<h1>Hugo Steinhaus: ciekawostki do podstron działu Popularyzacja</h1>
<p class="lead">${czyste.length} ciekawostek (${czyste.filter((c) => c.pewnosc === 'pewne').length} pewnych, ${czyste.filter((c) => c.pewnosc !== 'pewne').length} do sprawdzenia; ${czyste.filter((c) => c.przypiecie).length} propozycje przypięcia, ${czyste.filter((c) => c.podstrona === 'zapas').length} w zapasie). U góry każdej karty podgląd w niskim nagłówku (rysunek 145×170 px, kreski 1,3 i 2 px, kolor działu); niżej mały rysunek na jasnym tle. Współrzędne policzone w <code>generator.js</code>.</p>
<div class="siatka">${karty}</div>
</body></html>
`;
  fs.writeFileSync(path.join(KAT, 'rysunki.html'), html);
  console.log(`zapisano: ciekawostki.json (${czyste.length}), rysunki.html`);
}

module.exports = { WSZYSTKIE, FAKTY };
