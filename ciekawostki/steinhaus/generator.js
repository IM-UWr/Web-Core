// Ciekawostki o Hugonie Steinhausie (dział Popularyzacja): rysunki liczone, nie „na oko”.
// Uruchomienie: node generator.js  →  ciekawostki.json, rysunki.html (zrzut: NODE_PATH=$(npm root -g) node generator.js --png → rysunki.png)
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
  // kromka chleba: prostokątny dół i szersza „czapa” z dwoma garbami (krzywa Catmulla–Roma), wyraźnie osobno od plastra szynki
  const kromkaK = [[-38, 50], [0, 52], [38, 50], [46, 40], [45, 6], [47, -10], [57, -24], [55, -44], [36, -58], [12, -56], [0, -50],
    [-12, -56], [-36, -58], [-55, -44], [-57, -24], [-47, -10], [-45, 6], [-46, 40]];
  const kromka = przeksztalc(catmull(kromkaK, 14), -0.14, 0.86, 72, 166);
  const skorka = offset(kromka, 6);                         // linia skórki, 6 jedn. do środka
  // plaster szynki: owal z lekką falą; tłuszczyk: półksiężyc wzdłuż części brzegu
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
    return pts;
  };
  const H = 42, kopia = (pts, yc) => { const ys = pts.map((q) => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys); return pts.map(([x, y]) => [16 + 168 * x, yc - H / 2 + H * (y - y0) / (y1 - y0)]); };
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
  const kroki = [60, 24, 8], wys = [58, 122, 186];
  let pts = null, bz = 0, bw = 0;
  for (let z = 1; z < 600; z++) {
    const p = krzywa(z), a = kopia(p, 100), u = dl(cyrkiel(a, kroki[2])) / dl(cyrkiel(a, kroki[0]));
    if (u > bw) { bw = u; pts = p; bz = z; }
  }
  const out = [], dl0 = kroki.map((s) => dl(cyrkiel(kopia(pts, 100), s))), mx = Math.max(...dl0), sk = 168 / mx;
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
   15. Rzuty monetą jako miara (1923): drzewo rzutów; każdy rzut połowi przedział, prawdopodobieństwo = długość przedziału
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
   17. Tres faciunt collegium (opowiadał M. Kac): sala w rzucie z góry, wykładowca i dwóch słuchaczy
   ===================================================================================== */
function rysTres() {
  const cx = 100, cy = 212, out = [], st = Math.PI / 180;
  const A0 = -120 * st, A1 = -60 * st;
  const luk = (r) => { const s = []; for (let k = 0; k <= 48; k++) { const u = A0 + (A1 - A0) * k / 48; s.push([cx + r * Math.cos(u), cy + r * Math.sin(u)]); } return lam(s); };
  const rzedy = [62, 84, 106, 128, 150, 172];
  for (const r of rzedy) out.push({ d: luk(r) });
  for (const u of [A0, A1]) out.push({ d: lam([[cx + 62 * Math.cos(u), cy + 62 * Math.sin(u)], [cx + 172 * Math.cos(u), cy + 172 * Math.sin(u)]]) });
  out.push({ d: lam([[62, 220], [138, 220]]) });
  // wykładowca przy tablicy i dwaj słuchacze: siedzą w rzędach r = 106 i r = 150
  const W = [100, 205], S1 = [cx + 106 * Math.cos(-106 * st), cy + 106 * Math.sin(-106 * st)], S2 = [cx + 150 * Math.cos(-72 * st), cy + 150 * Math.sin(-72 * st)];
  out.push({ d: lam([W, S1, S2], true), gruba: true });
  for (const q of [W, S1, S2]) out.push({ d: kropka(q[0], q[1]), gruba: true });
  log('tres: rzędów', rzedy.length, ', osób 3');
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

module.exports = { rysKanapka, rysLebesgue, rys18, rysLongimetr, rysTort, rysWisla, rysTrzy, rysKalejdoskop, rysSzachownica, rysZapalki, rysBanachSteinhaus, rysKSrednich, rysMega, rysDendryt, rysMoneta, rysKolo, rysTres, kontrola };

/* =====================================================================================
   Teksty ciekawostek (źródła i rozbieżności: RAPORT.md). Sprawdzone 4–5.11.2026.
   ===================================================================================== */
const FAKTY = [
  {
    rys: 'rysSzachownica', id: 'twierdzenie-o-szachownicy', nazwa: 'Twierdzenie o szachownicy', rok: '1954',
    zdanie: 'Na szachownicy z minami albo król przejdzie w poprzek bez min, albo wieża z góry na dół po samych minach.',
    notka: 'Twierdzenie nosi imię Steinhausa. Kulpa, Socha i Turzański (2000) przytaczają je za „Kalejdoskopem matematycznym” w wydaniu PWN z 1954 r.; nie ustalono, czy było już w wydaniu z 1938 r. To kombinatoryczny odpowiednik faktów topologicznych: wariant sześciokątny, jak w grze Hex, i związek z twierdzeniem Brouwera o punkcie stałym opisał Gale (1979), a wersję wielowymiarową Tkacz i Turzański (2008). Rysunek: 27 min na polach 8×8, gruba linia to droga wieży po minach; program sprawdza przeszukiwaniem, że król nie ma drogi w poprzek bez min.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Steinhaus_chessboard_theorem', 'https://dml.cz/bitstream/handle/10338.dmlcz/702068/ActaCarolinae_041-2000-2_7.pdf'],
    podstrona: 'Dla uczniów', dlaczego_tu: 'Szachy i miny: treść rozumie każdy uczeń, a własną planszę można narysować w zeszycie w kratkę.',
  },
  {
    rys: 'rysLongimetr', id: 'longimetr', nazwa: 'Longimetr Steinhausa', rok: '1930',
    zdanie: 'Przezrocze z trzema siatkami mierzy długość krzywej: liczba przecięć to długość w milimetrach.',
    notka: 'Pomysł przyszedł Steinhausowi, gdy jego córka dostała zadanie zmierzenia Wisły na mapie (jego Autobiografia, Wiadomości Matematyczne 1973, za Gądek-Moszczak i Matusiewiczem 2017). Metodę opisał w 1930 r. („Zur Praxis der Rektifikation und zum Längenbegriff”, Lipsk), a po polsku w 1932 r. („W sprawie mierzenia długości linij krzywych płaskich”, Polski Przegląd Kartograficzny 10). Przezrocze to trzy siatki kwadratowe obrócone o 30°, z liniami co 3,82 mm; ta liczba to 12/π, więc liczba przecięć w przybliżeniu równa się długości w milimetrach (wzór Croftona). Rysunek: sześć kierunków co 30°, kropki to przecięcia; odstęp linii powiększony dla czytelności, a długość policzona z przecięć różni się od prawdziwej o ok. 1%.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Steinhaus_longimeter', 'https://ias-iss.org/ojs/IAS/article/download/1808/1056'],
    podstrona: 'Dla nauczycieli', dlaczego_tu: 'Zaczęło się od zadania córki (zmierzyć Wisłę na mapie), a metodę opisał w piśmie dla nauczycieli geografii i kartografów; takie przezrocze można zrobić na lekcję.',
  },
  {
    rys: 'rysKalejdoskop', id: 'kalejdoskop-matematyczny', nazwa: 'Kalejdoskop matematyczny', rok: '1938',
    zdanie: 'Książka o matematyce do oglądania; pierwsze wydanie miało w kieszonce okulary do obrazków 3D.',
    notka: 'Steinhaus napisał ją w 1937 r. (MacTutor). W 1938 r. ukazała się jako „Kalejdoskop matematyczny” i „Mathematical Snapshots”; według strony Centrum im. Hugona Steinhausa na Politechnice Wrocławskiej po polsku i po angielsku tego samego dnia. W pierwszym wydaniu wiele rysunków to anaglify oglądane przez czerwono-zielone okulary schowane w kieszonce na końcu książki (Linda Hall Library). Drugie wydanie: Oxford, 1950–1951. Mark Kac pisał, że książka ma przemawiać do „naukowca w dziecku i dziecka w naukowcu” (przekład nasz). Angielska Wikipedia podaje dla polskiego tytułu rok 1939; pozostałe źródła 1938. Rysunek: trzy lustra tworzą trójkąt, a motyw z jego wnętrza (gruby) odbija się w całym polu; każde odbicie to złożenie symetrii względem boków.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/', 'https://hsc.pwr.edu.pl/steinhaus', 'https://www.lindahall.org/about/news/scientist-of-the-day/hugo-steinhaus/', 'https://www.wroclaw.pl/dla-mieszkanca/hugo-steinhaus-w-galerii-slawnych', 'https://mathshistory.st-andrews.ac.uk/Strick/steinhaus.pdf'],
    podstrona: 'Dla wszystkich', dlaczego_tu: 'Najbardziej znana książka popularna Steinhausa, pisana dla czytelnika w każdym wieku.',
  },
  {
    rys: 'rysTort', id: 'sprawiedliwy-podzial', nazwa: 'Sprawiedliwy podział', rok: '1948',
    zdanie: 'Jak podzielić tort między trzy osoby, by każda dostała co najmniej 1/3 według własnej oceny?',
    notka: 'Steinhaus postawił to pytanie w czasie wojny (MacTutor podaje 1944 r.) i znalazł sposób dla trzech osób: jedna kroi tort na trzy części równe w swojej ocenie, dwie pozostałe wskazują części, które uważają za wystarczające. Jeśli któraś wskaże co najmniej dwie, każdy dostaje część dla siebie dobrą; jeśli obie wskażą tylko jedną, dzielący bierze część niewskazaną, a one dzielą resztę metodą „dzielę i wybieram”. Opublikował to w „The problem of fair division” (Econometrica 16, 1948, s. 101–104). To podział proporcjonalny, nie wolny od zazdrości: taki dla trzech osób podali Conway i Selfridge (1962), a dla dowolnej liczby osób Brams i Taylor (1995). Rysunek: tort z siedmioma owocami i trzy wycinki równej wartości w ocenie dzielącego (ciasto plus owoce), choć ich kąty to 110°, 110° i 140°.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Lone_divider', 'https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/', 'https://en.wikipedia.org/wiki/Fair_cake-cutting'],
    podstrona: 'Organizatorzy', dlaczego_tu: 'Każdy, kto dzieli zadania przy wydarzeniu, rozwiązuje zadanie Steinhausa (z przymrużeniem oka).',
  },
  {
    rys: 'rysKanapka', id: 'kanapka-z-szynka', nazwa: 'Twierdzenie o kanapce z szynką', rok: '1938',
    zdanie: 'Trzy bryły zawsze da się przepołowić jednym płaskim cięciem; na rysunku wersja płaska: dwie figury i prosta.',
    notka: 'Pytanie postawił Steinhaus; to zagadnienie 123 Księgi Szkockiej, a w jednym ze sformułowań chodzi o kawałek szynki pod krajalnicą: czy mięso, kość i tłuszcz da się przeciąć naraz na połowy. Rozwiązanie ukazało się w 1938 r. w notatce „Z topologii” w piśmie Mathesis Polska; dowód, oparty na twierdzeniu Borsuka–Ulama, pochodzi od Banacha. Na dowolny wymiar uogólnili to Stone i Tukey (1942). Wersja na płaszczyźnie to tzw. twierdzenie o naleśniku. Rysunek: kromka i plaster szynki; prosta policzona bisekcją, każda figura dzieli się na połowy co do 0,0001 pola. To obecny znak działu, tu w wersji z kromką.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/Miller/mathword/h/', 'https://en.wikipedia.org/wiki/Ham_sandwich_theorem', 'https://arxiv.org/pdf/2010.00478v2'],
    podstrona: 'zapas', dlaczego_tu: 'Obecny znak całego działu (strona główna Popularyzacji), więc nie dublujemy go na podstronie.',
  },
  {
    rys: 'rysLebesgue', id: 'banach-na-plantach', nazwa: 'Odkrycie Banacha na Plantach', rok: '1916',
    zdanie: 'Steinhaus usłyszał na krakowskich Plantach słowa „miara Lebesgue’a” i tak poznał Stefana Banacha.',
    notka: 'Wiosną 1916 r., podczas spaceru po Plantach, usłyszał te słowa i podszedł do rozmawiających: byli to Stefan Banach i Otto Nikodym (wspomnienie Steinhausa w MacTutor). Za swoje największe odkrycie uważał właśnie Banacha (H.-K. Strick, Wikipedia). Rysunek: wykres funkcji i zbiory, na których przekracza ona kolejne poziomy; miara tych zbiorów to punkt wyjścia całki Lebesgue’a.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/Biographies/Banach/', 'https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/', 'https://mathshistory.st-andrews.ac.uk/Strick/steinhaus.pdf', 'https://en.wikipedia.org/wiki/Hugo_Steinhaus'],
    podstrona: 'zapas', dlaczego_tu: 'Dobre na wydarzenia dla szerokiej publiczności: wielkie odkrycie zaczęte od rozmowy usłyszanej w parku.',
  },
  {
    rys: 'rys18', id: 'zadanie-o-18-punktach', nazwa: 'Zadanie o 18 punktach', rok: '1958',
    zdanie: 'Stawiaj punkty na odcinku tak, by pierwsze n leżało w różnych n-tych częściach: da się 17, ale 18 już nie.',
    notka: 'Zadanie ze „Stu zadań” Steinhausa (1958; po angielsku „One Hundred Problems in Elementary Mathematics”, 1964, zadania 6–7). Steinhaus pytał o 10 punktów i o to, czy można więcej. Granicę 17 wykazał Warmus, który doliczył się 768 układów przedziałów (1536 z odbiciami); zob. też Berlekamp i Graham (1970), Warmus (1976). Generator sprawdza to przeszukiwaniem wyczerpującym: dla 17 punktów wychodzi 1536 układów, dla 18 żaden. Rysunek: n-ty wiersz to odcinek podzielony na n części; kółko to punkt dodany w tym kroku, a pionowa kreska pokazuje jego miejsce w kolejnych wierszach.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Irregularity_of_distributions', 'https://mathworld.wolfram.com/18-PointProblem.html', 'https://www.cut-the-knot.org/Curriculum/Algebra/SteinhausProblem.shtml'],
    podstrona: 'zapas', dlaczego_tu: 'Zadanie na kółko: pierwsze kilka punktów można sprawdzić na kartce, a odpowiedź „17” zaskakuje.',
  },
  {
    rys: 'rysWisla', id: 'dlugosc-brzegu-wisly', nazwa: 'Długość brzegu Wisły', rok: '1954',
    zdanie: 'Im dokładniej mierzysz brzeg Wisły, tym jest dłuższy: 10, 100, nawet 1000 razy dłuższy niż na szkolnej mapie.',
    notka: 'W pracy „Length, shape and area” (Colloquium Mathematicum 3, 1954, s. 1–13) Steinhaus zauważył w przypisie, że lewy brzeg Wisły mierzony z większą dokładnością dałby długość dziesięć, sto, a nawet tysiąc razy większą niż odczytana ze szkolnej mapy, a większość łuków spotykanych w przyrodzie lepiej uważać za nieprostowalne. To ten sam paradoks, który badał L. F. Richardson i który spopularyzował B. Mandelbrot w 1967 r. („How Long Is the Coast of Britain?”). Rysunek: losowa krzywa Kocha (nie prawdziwa Wisła) mierzona cyrklem o coraz mniejszym rozstawie; paski pokazują zmierzoną długość w tej samej skali.',
    rodzaj: 'pojęcie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Coastline_paradox', 'https://eudml.org/doc/210004'],
    podstrona: 'zapas', dlaczego_tu: 'Mapa i rzeka, którą zna każdy we Wrocławiu (choć tu płynie Odra).',
  },
  {
    rys: 'rysTrzy', id: 'trzy-odleglosci', nazwa: 'Twierdzenie o trzech odległościach', rok: '1957',
    zdanie: 'Punkty stawiane na okręgu co stały kąt dzielą go na łuki co najwyżej trzech długości.',
    notka: 'Hipotezę postawił Steinhaus, a dowody ogłosili Vera T. Sós (1957), János Surányi (1958) i Stanisław Świerczkowski (1959). Gdy długości są trzy, największa równa się sumie dwóch pozostałych. Rysunek: 18 punktów co złoty kąt; nad każdym łukiem garb o wysokości proporcjonalnej do jego długości, grube garby to największe łuki (długości 0,0344, 0,0557 i 0,0902 okręgu).',
    rodzaj: 'twierdzenie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Three-gap_theorem'],
    podstrona: 'zapas', dlaczego_tu: 'Zapas; podobny motyw ma animacja Kalendarza (dok/przekazanie.md), więc lepiej go tu nie powtarzać.',
  },
  {
    rys: 'rysZapalki', id: 'pudelka-zapalek', nazwa: 'Zadanie o pudełkach zapałek', rok: '1941',
    zdanie: 'Dwa pudełka zapałek w kieszeniach: ile zostało w drugim, gdy pierwsze okaże się puste?',
    notka: 'Ostatnie, 193. zagadnienie Księgi Szkockiej podpisał Steinhaus; ostatnia data w księdze to 31 maja 1941 r. Dziś znane jest jako zadanie Banacha o pudełkach zapałek, ale według W. Fellera Banach go nie postawił: nazwa wzięła się z żartobliwej aluzji Steinhausa do palenia Banacha w przemówieniu na jego cześć. Rysunek: jedna losowa historia wyjmowania zapałek jako droga po kratce (7 zapałek w pudełku), krzyżyk to sięgnięcie do pustego pudełka; w drugim zostały 2 zapałki.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: ['https://mathshistory.st-andrews.ac.uk/HistTopics/Scottish_Book/', 'https://en.wikipedia.org/wiki/Scottish_Book', 'https://en.wikipedia.org/wiki/Banach%27s_matchbox_problem'],
    podstrona: 'zapas', dlaczego_tu: 'Rachunek prawdopodobieństwa z kieszeni palacza: na lekcję albo wykład popularny.',
  },
  {
    rys: 'rysBanachSteinhaus', id: 'banach-steinhaus', nazwa: 'Twierdzenie Banacha–Steinhausa', rok: '1927',
    zdanie: 'Operatory liniowe ograniczone w każdym punkcie z osobna są też ograniczone wspólną stałą.',
    notka: 'Banach i Steinhaus, „Sur le principe de la condensation de singularités”, Fundamenta Mathematicae 9 (1927), s. 50–61; niezależnie udowodnił to Hans Hahn. Twierdzenie dotyczy ciągłych operatorów liniowych na przestrzeni Banacha. Klasyczne zastosowanie: istnieją funkcje ciągłe, których szereg Fouriera jest rozbieżny w danym punkcie. Rysunek: jądra Dirichleta D₃, D₆ i D₁₂ o szczytach 7, 13 i 25; ich normy (stałe Lebesgue’a: 1,78, 2,03, 2,29) rosną bez ograniczenia.',
    rodzaj: 'twierdzenie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Uniform_boundedness_principle', 'https://mathshistory.st-andrews.ac.uk/Biographies/Steinhaus/'],
    podstrona: 'zapas', dlaczego_tu: 'Najbardziej znane twierdzenie patrona, ale za trudne na stronę dla szerokiego odbiorcy.',
  },
  {
    rys: 'rysKSrednich', id: 'k-srednich', nazwa: 'Metoda k-średnich', rok: '1956',
    zdanie: 'Steinhaus dzielił bryłę na części wokół ich środków ciężkości: to dzisiejsza metoda k-średnich.',
    notka: 'W „Sur la division des corps matériels en parties” (Bulletin de l’Académie Polonaise des Sciences, Cl. III, 4, 1956, s. 801–804) Steinhaus szukał podziału niejednorodnej bryły na k części o najmniejszej sumie momentów bezwładności. Według H.-H. Bocka (2008) to pierwsze jawne ujęcie algorytmu k-średnich w wielu wymiarach. Nazwę „k-means” wprowadził J. MacQueen (1967), a wersję dyskretną dla danych E. Forgy (1965). Angielska Wikipedia podaje dla pracy Steinhausa rok 1957 w przypisie, a 1956 w tekście; Bock: 1956. Rysunek: iteracja do zbieżności dla pięciu części; kółka to środki ciężkości, grube linie to granice.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne',
    zrodla: ['https://emis.univie.ac.at/journals/JEHPS/Decembre2008/Bock.pdf', 'https://en.wikipedia.org/wiki/K-means_clustering'],
    podstrona: 'zapas', dlaczego_tu: 'Dziś to jeden z najpopularniejszych algorytmów analizy danych: dobry przykład, że matematyka bryły wraca w informatyce.',
  },
  {
    rys: 'rysMega', id: 'mega', nazwa: 'Mega: liczba w kole', rok: '1951',
    zdanie: 'Trójkąt: n do potęgi n. Kwadrat: n w n trójkątach. Koło: n w n kwadratach. Dwójka w kole to Mega.',
    notka: 'Notacja wielokątów Steinhausa z „Mathematical Snapshots”: liczba w trójkącie, kwadracie i kole; dwójka w kole nosi nazwę Mega, a dziesiątka w kole Megiston. Leo Moser rozszerzył to na dowolne wielokąty (notacja Steinhausa–Mosera). Rok niepewny: strona R. Munafo podaje wydanie z 1951 r., a Wikipedia cytuje wydanie z 1969 r., s. 28–29; nie sprawdzono wydania z 1938 r. Rysunek (bez cyfr, dwójka to dwie kropki): dwójka w kole; dwójka w dwóch kwadratach; kwadrat, a w nim dwójka w dwóch trójkątach; kwadrat, a w nim czwórka w trójkącie, bo dwójka w trójkącie to 2² = 4. A czwórka w trójkącie to już 256.',
    rodzaj: 'pojęcie', pewnosc: 'do sprawdzenia',
    zrodla: ['https://en.wikipedia.org/wiki/Steinhaus%E2%80%93Moser_notation', 'https://mrob.com/pub/math/largenum-5.html'],
    podstrona: 'zapas', dlaczego_tu: 'Zabawa dla uczniów, którzy lubią wielkie liczby: reguły mieszczą się w jednym zdaniu.',
  },
  {
    rys: 'rysDendryt', id: 'dendryt-wroclawski', nazwa: 'Dendryt wrocławski', rok: '1951',
    zdanie: 'Najkrótsza sieć łącząca punkty pozwala je pogrupować: to taksonomia wrocławska.',
    notka: 'Florek, Łukaszewicz, Perkal, Steinhaus i Zubrzycki, „Sur la liaison et la division des points d’un ensemble fini”, Colloquium Mathematicum 2 (1951), s. 282–285. Duda i Weron (2006) opisują taksonomię wrocławską jako metodę opisu i klasyfikacji indywiduów. Sam problem najkrótszej sieci rozwiązał wcześniej O. Borůvka (1926); późniejsze algorytmy to Kruskal (1956) i Prim (1957). Rysunek: 26 punktów, sieć policzona algorytmem Kruskala i sprawdzona algorytmem Prima; cienkie krawędzie to trzy najdłuższe, po ich usunięciu punkty rozpadają się na grupy.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne',
    zrodla: ['https://eudml.org/doc/209969', 'https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf', 'https://geodesic.mathdoc.fr/item/ARM_1997_33_1-2_a3'],
    podstrona: 'zapas', dlaczego_tu: 'Lokalna, wrocławska historia, która trafiła do informatyki; dział Instytut ma podobny motyw w animacji banera (dok/przekazanie.md).',
  },
  {
    rys: 'rysMoneta', id: 'rzuty-moneta', nazwa: 'Rzuty monetą jako miara', rok: '1923',
    zdanie: 'Nieskończone rzucanie monetą opisał językiem miary: prawdopodobieństwo to długość przedziału.',
    notka: 'H. Steinhaus, „Les probabilités dénombrables et leur rapport à la théorie de la mesure”, Fundamenta Mathematicae 4 (1923), s. 286–310. Podał aksjomatyczną definicję miary prawdopodobieństwa na ciągach zero-jedynkowych; T. Bednarski (2018) stawia tezę, że praca mogła mieć znaczenie dla aksjomatyki Kołmogorowa z 1933 r. Rysunek: drzewo czterech rzutów; każdy rzut połowi przedział, więc ciąg orzeł, reszka, orzeł, orzeł prowadzi do przedziału o długości 1/16, a to właśnie jego prawdopodobieństwo.',
    rodzaj: 'pojęcie', pewnosc: 'pewne',
    zrodla: ['https://eudml.org/doc/213613', 'https://czasopisma.uni.lodz.pl/foe/article/view/2433', 'https://en.wikipedia.org/wiki/Hugo_Steinhaus'],
    podstrona: 'zapas', dlaczego_tu: 'Moneta to najprostszy przykład na lekcji rachunku prawdopodobieństwa, a tu dostaje poważną matematykę.',
  },
  {
    rys: 'rysKolo', id: 'kolo-z-n-punktami', nazwa: 'Koło z n punktami kratowymi', rok: '1957',
    zdanie: 'Dla każdego n istnieje koło, w którym leży dokładnie n punktów kratki.',
    notka: 'Pytanie przypisywane Steinhausowi; w „One Hundred Problems” to zadanie 24. W. Sierpiński opisał rozwiązanie w 1958 r. („Sur quelques problèmes concernant les points aux coordonnées entières”, L’Enseignement Mathématique 4): wystarczy środek (√2, 1/3), bo wtedy wszystkie punkty kratki są od niego w różnych odległościach i rosnące koło „połyka” je po jednym. Steinhaus wykazał nawet, że można wybrać koło o polu n (MathWorld, za Honsbergerem). Rok 1957 podaje tylko cut-the-knot. Rysunek: środek (√2, 1/3), koła z 4 i 12 punktami (kółka w środku, krzyżyki na zewnątrz).',
    rodzaj: 'twierdzenie', pewnosc: 'do sprawdzenia',
    zrodla: ['https://www.cut-the-knot.org/do_you_know/diffDist.shtml', 'https://arxiv.org/html/2505.06234v1', 'https://mathworld.wolfram.com/CircleLatticePoints.html'],
    podstrona: 'zapas', dlaczego_tu: 'Dowód mieści się na jednej stronie zeszytu: dobre na kółko matematyczne.',
  },
  {
    rys: 'rysTres', id: 'tres-faciunt-collegium', nazwa: 'Tres faciunt collegium', rok: '',
    zdanie: 'Steinhaus do dwóch słuchaczy: „Troje czyni kolegium”. Do jednego, na następnym wykładzie: „Bóg jest zawsze obecny”.',
    notka: 'Anegdotę opowiadał Marek Kac; zapisał ją P. Pragacz w „Humorze w matematyce” (Konspekt 1/2007, s. 106–115), a w wersji skróconej podaje ją też wroclaw.pl z okazji odsłonięcia popiersia Steinhausa w Galerii Sławnych Wrocławian (2013). Źródła nie podają roku ani miejsca, więc pole roku jest puste. Rysunek: sala w rzucie z góry, wykładowca przy tablicy i dwaj słuchacze; to nie plan żadnej konkretnej sali.',
    rodzaj: 'anegdota', pewnosc: 'pewne',
    zrodla: ['https://www.impan.pl/~pragacz/download/konspekt-humor.pdf', 'https://www.wroclaw.pl/dla-mieszkanca/hugo-steinhaus-w-galerii-slawnych'],
    podstrona: 'zapas', dlaczego_tu: 'Dobre pocieszenie dla wykładowcy, gdy na wykład otwarty przyjdzie mało osób.',
  },
];

/* ---------- wyjście: ciekawostki.json, rysunki.html, rysunki.png ---------- */
function main() {
  const zapis = [], raport = [];
  for (const { rys, ...f } of FAKTY) {
    const sc = module.exports[rys]();
    const ok = kontrola(f.id, sc);
    if (!ok) throw new Error('kontrola nie przeszła: ' + f.id);
    if ([...f.nazwa].length > 40) log('  uwaga: długa nazwa', f.id, [...f.nazwa].length);
    if ([...f.zdanie].length > 115) log('  uwaga: długie zdanie', f.id, [...f.zdanie].length);
    zapis.push({ ...f, sciezki: sc.map((p) => (p.gruba ? { d: p.d, gruba: true } : { d: p.d, gruba: false })) });
    raport.push({ id: f.id, sciezek: sc.length, grubych: sc.filter((p) => p.gruba).length });
  }
  fs.writeFileSync(path.join(KAT, 'ciekawostki.json'), JSON.stringify(zapis, null, 2) + '\n');
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = (ps, w, h) => `<svg viewBox="0 0 200 240" width="${w}" height="${h}" aria-hidden="true">${ps.map((p) => `<path d="${p.d}"${p.gruba ? ' class="gruba"' : ''}/>`).join('')}</svg>`;
  const karty = zapis.map((c, i) => `
  <article class="karta">
    <div class="baner">
      <div class="podpis"><b>${esc(c.nazwa)}${c.rok ? ', ' + esc(c.rok) : ''}</b>${esc(c.zdanie)}</div>
      ${svg(c.sciezki, 145, 170)}
    </div>
    <div class="opis">
      <div class="duzy">${svg(c.sciezki, 200, 240)}</div>
      <div>
        <p class="meta"><span class="nr">${i + 1}</span> <span class="pod">${esc(c.podstrona)}</span> · ${esc(c.rodzaj)} · <span class="${c.pewnosc === 'pewne' ? 'ok' : 'spr'}">${esc(c.pewnosc)}</span></p>
        <h2>${esc(c.nazwa)} <small>${esc(c.rok)}</small></h2>
        <p class="zd">${esc(c.zdanie)} <small>(${[...c.zdanie].length} zn.)</small></p>
        <p class="nt">${esc(c.notka)}</p>
        <p class="dl"><i>Dlaczego tu:</i> ${esc(c.dlaczego_tu)}</p>
        <p class="rys">${raport[i].sciezek} ścieżek, ${raport[i].grubych} grubych · źródła: ${c.zrodla.map((u) => `<a href="${esc(u)}">${esc(new URL(u).hostname.replace(/^www\./, ''))}</a>`).join(', ')}</p>
      </div>
    </div>
  </article>`).join('');
  const przyp = zapis.filter((c) => c.podstrona !== 'zapas').length, zap = zapis.length - przyp, pew = zapis.filter((c) => c.pewnosc === 'pewne').length;
  const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Steinhaus: ciekawostki i rysunki</title>
<style>
:root { --granat: #0d1830; --j: #a991f7; --g: #30216a; --a: #5b3fc4; --t: #eeeafd; --tekst: #1d2433; --szary: #5b6475; }
* { box-sizing: border-box; }
body { margin: 0; padding: 28px 24px 40px; background: #f2f0f7; color: var(--tekst); font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
h1 { margin: 0 0 4px; font-size: 24px; } .lead { margin: 0 0 22px; color: var(--szary); max-width: 900px; }
.siatka { display: grid; grid-template-columns: repeat(auto-fill, minmax(560px, 1fr)); gap: 18px; }
.karta { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgb(0 0 0 / .12); }
.baner { position: relative; height: 190px; color: #fff; background: linear-gradient(100deg, var(--granat) 0, var(--granat) 42%, color-mix(in srgb, var(--granat) 55%, var(--g)) 72%, var(--g) 100%); }
.baner svg { position: absolute; right: 18px; top: 10px; }
.baner .podpis { position: absolute; right: 178px; top: 54px; width: 240px; text-align: right; font-size: 12.5px; line-height: 1.45; color: rgb(255 255 255 / .72); }
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
.nt, .dl { margin: 0 0 6px; font-size: 13px; } .rys { margin: 0; } a { color: var(--a); }
</style></head><body>
<h1>Hugo Steinhaus: ciekawostki do podstron działu Popularyzacja</h1>
<p class="lead">${zapis.length} ciekawostek (${przyp} przypisane do podstron, ${zap} w zapasie; ${pew} pewnych, ${zapis.length - pew} do sprawdzenia). U góry każdej karty: podgląd w niskim nagłówku (rysunek 145×170 px, kreska 1,3 i 2 px, kolor działu). Pod spodem: ten sam rysunek na jasnym tle, notka i źródła.</p>
<div class="siatka">${karty}</div>
</body></html>
`;
  fs.writeFileSync(path.join(KAT, 'rysunki.html'), html);
  log(`zapisano ${zapis.length} ciekawostek (${pew} pewnych)`);
  if (process.argv.includes('--png')) {
    (async () => {
      const { chromium } = require('playwright');
      const b = await chromium.launch();
      const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1.5 });
      await p.goto('file://' + path.join(KAT, 'rysunki.html'));
      await p.screenshot({ path: path.join(KAT, 'rysunki.png'), fullPage: true });
      await b.close();
      log('rysunki.png zapisany');
    })();
  }
}

if (require.main === module) {
  if (process.argv.includes('--test')) {
    const fn = process.argv[process.argv.indexOf('--test') + 1];
    kontrola(fn, module.exports[fn]());
  } else main();
}
