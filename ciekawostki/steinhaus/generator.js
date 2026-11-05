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
  const kromkaK = [[-40, 54], [0, 56], [40, 54], [47, 44], [46, 2], [48, -10], [60, -22], [62, -40], [46, -56], [20, -60], [0, -58],
    [-20, -60], [-46, -56], [-62, -40], [-60, -22], [-48, -10], [-46, 2], [-47, 44]];
  const kromka = przeksztalc(catmull(kromkaK, 14), -0.06, 0.98, 72, 160);
  const skorka = offset(kromka, 6.5);                       // linia skórki, 6,5 jedn. do środka
  // plaster szynki: owal z lekką falą; tłuszczyk — półksiężyc wzdłuż części brzegu
  const N = 220, szynka = [];
  for (let i = 0; i < N; i++) { const t = 2 * Math.PI * i / N, r = 1 + 0.05 * Math.sin(3 * t + 0.6) + 0.035 * Math.cos(5 * t); szynka.push([46 * r * Math.cos(t), 31 * r * Math.sin(t)]); }
  const sz = przeksztalc(szynka, -0.5, 1, 134, 76);
  // tłuszczyk: krzywa wewnętrzna dla t ∈ [t1, t2], odsunięta o d(t) = 7·sin(π(t − t1)/(t2 − t1))
  const t1 = 0.55 * N, t2 = 0.98 * N, inn = offset(sz, 1), tl = [];
  for (let i = Math.ceil(t1); i <= Math.floor(t2); i++) {
    const w = 8 * Math.sin(Math.PI * (i - t1) / (t2 - t1)), q = sz[i], r = inn[i], nx = r[0] - q[0], ny = r[1] - q[1], L = Math.hypot(nx, ny);
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
  const odc = prostaWProstokacie(n, c, 16, 38, 184, 222);
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
   3. Zadanie o 18 punktach („Sto zadań”, 1958): 17 punktów, pierwsze n zawsze w różnych n-tych częściach odcinka
   ===================================================================================== */
/** wszystkie układy N punktów spełniające warunek Steinhausa: backtracking po przedziałach (pierwsze n punktów w różnych n-tych częściach) */
function szukajPunktow(N) {
  const roz = [];
  (function poziom(n, I) {
    if (n > N) { roz.push(I.map((p) => p.slice())); return; }
    // przydział n − 1 dotychczasowych punktów do różnych części; nowy punkt dostaje część, która została
    const uzyte = new Array(n).fill(false), J = I.map((p) => p.slice());
    (function przydziel(i) {
      if (i === I.length) { const k = uzyte.indexOf(false); poziom(n + 1, J.map((p) => p.slice()).concat([[k / n, (k + 1) / n]])); return; }
      const [lo, hi] = I[i];
      for (let j = Math.floor(lo * n + 1e-12); j < n && j / n < hi - 1e-12; j++) {
        if (uzyte[j]) continue;
        const a = Math.max(lo, j / n), b = Math.min(hi, (j + 1) / n);
        if (b - a < 1e-12) continue;
        uzyte[j] = true; J[i] = [a, b]; przydziel(i + 1); uzyte[j] = false; J[i] = [lo, hi];
      }
    })(0);
  })(1, []);
  return roz;
}
function szukaj17() {
  const r18 = szukajPunktow(18).length, r17 = szukajPunktow(17);
  // układ o największym najmniejszym przedziale: kropki stoją daleko od granic części
  const zapas = (r) => Math.min(...r.map(([a, b]) => b - a));
  const najl = r17.reduce((m, r) => (zapas(r) > zapas(m) ? r : m), r17[0]);
  log('18 punktów: układów przedziałów dla N = 17:', r17.length, ' dla N = 18:', r18, ' najwęższy przedział wybranego układu:', zapas(najl).toFixed(5));
  return najl.map(([a, b]) => (a + b) / 2);
}
function rys18() {
  const xs = szukaj17(), N = xs.length;
  // kontrola warunku Steinhausa
  for (let n = 1; n <= N; n++) { const s = new Set(xs.slice(0, n).map((x) => Math.floor(n * x))); if (s.size !== n) throw new Error('warunek nie spełniony dla n = ' + n); }
  log('18 punktów: ciąg', xs.map((x) => x.toFixed(4)).join(' '));
  const X = (x) => 16 + 168 * x, Yn = (n) => 40 + (n - 1) * (180 / 16), G = 2.1;  // przerwa na granicy części: 2·1,6 jedn.
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
  const R = los(1930), D = 42, X0 = 16, Y0 = 38, X1 = 184, Y1 = 220;
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
  out.push({ d: prz.map((q) => kropka(q[0], q[1], 2.8)).join(' '), gruba: true });
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
  // krzywa samopodobna: losowa krzywa Kocha (każdy odcinek → 4 odcinki 1/3, wypustka losowo w górę lub w dół), 4 poziomy → 256 odcinków
  const R = los(1954);
  let pts = [[0, 0], [1, 0]];
  for (let lev = 0; lev < 4; lev++) {
    const nn = [pts[0]];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], dx = (b[0] - a[0]) / 3, dy = (b[1] - a[1]) / 3, zn = R() < 0.5 ? 1 : -1, k = Math.sqrt(3) / 2;
      const p1 = [a[0] + dx, a[1] + dy], p3 = [a[0] + 2 * dx, a[1] + 2 * dy], p2 = [p1[0] + dx / 2 - zn * k * dy, p1[1] + dy / 2 + zn * k * dx];
      nn.push(p1, p2, p3, b);
    }
    pts = nn;
  }
  const kopia = (yc) => pts.map(([x, y]) => [16 + 168 * x, yc + 168 * y]);
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
  const out = [], kroki = [56, 18.7, 6.2], wys = [68, 130, 192];
  kroki.forEach((s, k) => {
    const c = kopia(wys[k]), l = cyrkiel(c, s);
    out.push({ d: lam(c) });
    out.push({ d: lam(l), gruba: k === 0 || k === 1 || k === 2 });
    log('wisła: rozstaw', s, ' kroków', l.length - 1, ' długość łamanej', dl(l).toFixed(1), ' (krzywa', dl(c).toFixed(1) + ')');
  });
  return out;
}

/* =====================================================================================
   7. Twierdzenie o trzech odległościach: punkty kα (mod 1) na okręgu, nad każdym odstępem łuk o wysokości ∝ długości
   ===================================================================================== */
function rysTrzy() {
  const al = (Math.sqrt(5) - 1) / 2, N = 11, cx = 100, cy = 130, R = 56;
  const t = Array.from({ length: N }, (_, k) => ((k + 1) * al) % 1).sort((a, b) => a - b);
  const gaps = t.map((a, i) => ((i + 1 < N ? t[i + 1] : t[0] + 1) - a));
  const rozne = [...new Set(gaps.map((g) => g.toFixed(9)))].map(Number).sort((a, b) => a - b);
  log('trzy odległości: N =', N, ' długości odstępów', rozne.map((g) => g.toFixed(4)).join(', '), ' (największa − suma dwóch mniejszych =', (rozne[2] - rozne[0] - rozne[1]).toExponential(1) + ')');
  const kat = (u) => -Math.PI / 2 + 2 * Math.PI * u, Hk = 28 / rozne[2];   // wysokość łuku: 0,62·R przy największym odstępie
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
  const cx = 100, cy = 130, Rk = 86, s = 58, h = s * Math.sqrt(3) / 2;
  const T0 = [[cx, cy - 2 * h / 3], [cx - s / 2, cy + h / 3], [cx + s / 2, cy + h / 3]];
  // motyw w trójkącie T0 (współrzędne barycentryczne → punkty): koralik, łuk szkiełka i odcinek
  const B = (a, b, c) => [a * T0[0][0] + b * T0[1][0] + c * T0[2][0], a * T0[0][1] + b * T0[1][1] + c * T0[2][1]];
  const kor = [], cent = B(0.52, 0.30, 0.18);
  for (let i = 0; i <= 24; i++) { const u = 2 * Math.PI * i / 24; kor.push([cent[0] + 5 * Math.cos(u), cent[1] + 5 * Math.sin(u)]); }
  const luk = []; for (let i = 0; i <= 20; i++) { const u = i / 20; luk.push(B(0.12 + 0.10 * Math.sin(Math.PI * u), 0.80 - 0.62 * u, 0.08 + 0.52 * u)); }
  const motyw = [kor, luk];
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
  [2, 4, 7, 12].forEach((n, i) => {
    const s = [];
    for (let j = 0; j <= 336; j++) { const x = -Math.PI + 2 * Math.PI * j / 336; s.push([X(x), Y0 - k * D(n, x)]); }
    out.push({ d: lam(s), gruba: i === 3 });
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


/* =====================================================================================
   13. Dendryt (taksonomia wrocławska, 1951): najkrótsze drzewo łączące punkty; po usunięciu najdłuższych krawędzi zostają skupienia
   ===================================================================================== */
function rysDendryt() {
  const R = los(1951), pkt = [];
  // trzy skupienia punktów (wstępnie rozmieszczone, z minimalnym odstępem), jak grupy obiektów w pracy antropologów
  const sk = [[56, 78, 34, 30, 14], [142, 92, 30, 36, 13], [92, 178, 58, 28, 16]];
  for (const [cx, cy, rx, ry, ile] of sk) for (let i = 0; i < ile; i++) {
    let p, proba = 0;
    do { const t = 2 * Math.PI * R(), r = Math.sqrt(R()); p = [cx + rx * r * Math.cos(t), cy + ry * r * Math.sin(t)]; proba++; } while (proba < 200 && pkt.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 11.5));
    pkt.push(p);
  }
  // algorytm Prima: najkrótsze drzewo rozpinające
  const n = pkt.length, w = [0], kraw = [], d = pkt.map((p) => Math.hypot(p[0] - pkt[0][0], p[1] - pkt[0][1])), od = new Array(n).fill(0), jest = new Array(n).fill(false);
  jest[0] = true;
  for (let k = 1; k < n; k++) {
    let m = -1; for (let i = 0; i < n; i++) if (!jest[i] && (m < 0 || d[i] < d[m])) m = i;
    jest[m] = true; kraw.push({ a: od[m], b: m, l: d[m] }); w.push(m);
    for (let i = 0; i < n; i++) { const q = Math.hypot(pkt[i][0] - pkt[m][0], pkt[i][1] - pkt[m][1]); if (!jest[i] && q < d[i]) { d[i] = q; od[i] = m; } }
  }
  kraw.sort((a, b) => b.l - a.l);
  const usuniete = kraw.slice(0, 2), zostaja = kraw.slice(2);
  log('dendryt: punktów', n, ' suma krawędzi', kraw.reduce((s, e) => s + e.l, 0).toFixed(1), ' dwie najdłuższe', usuniete.map((e) => e.l.toFixed(1)).join(', '), ' następna', zostaja[0].l.toFixed(1));
  const out = [];
  // usuwane krawędzie: cienkie, przerwane w środku (cięcie dzielące drzewo na trzy skupienia)
  for (const e of usuniete) {
    const A = pkt[e.a], B = pkt[e.b], ux = (B[0] - A[0]) / e.l, uy = (B[1] - A[1]) / e.l, s = e.l / 2 - 5;
    out.push({ d: `${lam([A, [A[0] + ux * s, A[1] + uy * s]])} ${lam([[B[0] - ux * s, B[1] - uy * s], B])}` });
  }
  out.push({ d: zostaja.map((e) => lam([pkt[e.a], pkt[e.b]])).join(' '), gruba: true });
  out.push({ d: pkt.map((p) => okr(p[0], p[1], 2.2)).join(' ') });
  out.push({ d: pkt.slice(0, 14).map((p) => okr(p[0], p[1], 3.4)).join(' ') });
  out.push({ d: pkt.slice(14, 27).map((p) => okr(p[0], p[1], 3.4)).join(' ') });
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
  for (let k = 0; k < 11; k++) d.push(lam(trojkat(144, 180, 44 * 0.8 ** k), true));
  out.push({ d: d.join(' ') });
  return out;
}

/* =====================================================================================
   16. Twierdzenie o odległościach (1920): zbiór A o dodatniej mierze (gruby zbiór Cantora) i jego przesunięcia: A ∩ (A + t) ≠ ∅ dla małych t
   ===================================================================================== */
function rysRoznice() {
  // zbiór Smitha–Volterry–Cantora: na poziomie k usuwamy z każdego kawałka środek długości 4^(−k); miara granicy 1/2
  let A = [[0, 1]];
  for (let k = 1; k <= 4; k++) { const dl = 4 ** -k, n = []; for (const [a, b] of A) { const m = (a + b) / 2; n.push([a, m - dl / 2], [m + dl / 2, b]); } A = n; }
  log('różnice: miara czwartego etapu', A.reduce((s, [a, b]) => s + b - a, 0).toFixed(4));
  const X = (x) => 16 + 168 * x;
  const rys = (S, y, g) => ({ d: S.filter(([a, b]) => X(b) - X(a) >= 3).map(([a, b]) => lam([[X(a), y], [X(b), y]])).join(' '), gruba: g });
  const out = [rys(A, 42, false)];
  const ts = [0.012, 0.03, 0.06, 0.11];
  ts.forEach((t, k) => {
    const Y0 = 66 + k * 42, B = A.map(([a, b]) => [a + t, Math.min(b + t, 1)]).filter(([a, b]) => b > a), W = [];
    for (const [a, b] of A) for (const [c, d] of B) { const u = Math.max(a, c), v = Math.min(b, d); if (v > u) W.push([u, v]); }
    log('różnice: t =', t, ' miara przecięcia', W.reduce((s, [a, b]) => s + b - a, 0).toFixed(4));
    out.push(rys(B, Y0, false), rys(W, Y0 + 14, true));
    // znacznik przesunięcia t: krótka kreska pionowa na początku wiersza
    out.push({ d: lam([[X(t), Y0 - 5], [X(t), Y0 + 5]]) });
  });
  return out;
}

/* =====================================================================================
   17. Koło z dokładnie n punktami kratowymi (Steinhaus, 1957): środek (√2, 1/3), każdy punkt kratowy ma inną odległość
   ===================================================================================== */
function rysKolo() {
  const S = 21, Ox = 15.5, Oy = 38, K = 8;    // kratka: punkty (i, j), i, j = 0…K; 21 jedn. między punktami
  const c = [3 + Math.SQRT2 % 1 + 0, 4 + 1 / 3];  // środek: (√2 + 3, 1/3 + 4) — przesunięcie kratowe środka (√2, 1/3) (√2 = 1 + 0,4142…; razem daje 3,4142…)
  const pk = [];
  for (let i = 0; i <= K; i++) for (let j = 0; j <= K; j++) pk.push({ i, j, d: Math.hypot(i - c[0], j - c[1]) });
  pk.sort((a, b) => a.d - b.d);
  // kontrola: odległości parami różne (na tej kratce)
  for (let m = 1; m < pk.length; m++) if (Math.abs(pk[m].d - pk[m - 1].d) < 1e-9) throw new Error('równe odległości');
  log('koło: najbliższe odległości', pk.slice(0, 8).map((p) => p.d.toFixed(3)).join(', '));
  const P_ = (x, y) => [Ox + S * x, Oy + S * y];
  const out = [];
  const promien = (n) => (pk[n - 1].d + pk[n].d) / 2;     // koło zawiera dokładnie n punktów
  const C = P_(c[0], c[1]);
  for (const n of [1, 3, 6]) out.push({ d: okr(C[0], C[1], f1(S * promien(n))) });
  const N = 12, R = S * promien(N);
  out.push({ d: okr(C[0], C[1], f1(R)), gruba: true });
  const w = pk.slice(0, N), z = pk.slice(N);
  out.push({ d: w.map((p) => { const [x, y] = P_(p.i, p.j); return kropka(x, y, 3.2); }).join(' '), gruba: true });
  out.push({ d: z.map((p) => { const [x, y] = P_(p.i, p.j); return `M${P([x - 3, y])} L${P([x + 3, y])} M${P([x, y - 3])} L${P([x, y + 3])}`; }).join(' ') });
  log('koło: w grubym okręgu', N, 'punktów, promień (krok kratki)', promien(N).toFixed(3));
  return out;
}

/* =====================================================================================
   18. Kieszeń „Kalejdoskopu” (1938): dwie płaskie połówki dwunastościanu (po 6 pięciokątów), składane gumką
   ===================================================================================== */
function rysDwunastoscian() {
  const s = 21, Rp = s / (2 * Math.sin(Math.PI / 5)), ap = s / (2 * Math.tan(Math.PI / 5));
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
  const A = kwiat(62, 86, -Math.PI / 2), B = kwiat(138, 172, Math.PI / 2);
  log('dwunastościan: bok pięciokąta', dl([A.srodek[0], A.srodek[1]]).toFixed(2), ' odległość wierzchołków sąsiedniej ścianki od środka', Math.hypot(A.scianki[0][0][0] - 62, A.scianki[0][0][1] - 86).toFixed(2));
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
  const cialo = []; for (let i = 0; i < 120; i++) { const t = 2 * Math.PI * i / 120, r = 1 + 0.05 * Math.cos(3 * t + 1) + 0.03 * Math.sin(5 * t); cialo.push([O[0] - 8 + 62 * r * Math.cos(t), O[1] + 4 + 40 * r * Math.sin(t)]); }
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
  const X = (t) => 26 + 148 * t / 24, Y0 = 210, K = 13;
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
  const rzedy = [1, 3, 5, 9, 17, 33], out = [];
  const X = (t) => 16 + 168 * t;
  const S = (m, x) => { let s = 0; for (let k = 1; k <= m; k += 2) s += Math.sin(k * x) / k; return 4 / Math.PI * s; };
  const A = 14, y0 = 50, dy = 26;
  rzedy.forEach((m, i) => {
    const s = []; for (let j = 0; j <= 400; j++) { const t = j / 400; s.push([X(t), y0 + i * dy - A * S(m, t * 4 * Math.PI)]); }
    out.push({ d: lam(s), gruba: i === 2 });
  });
  // na dole sama fala prostokątna (granica)
  const yk = y0 + rzedy.length * dy, kw = []; for (let k = 0; k < 4; k++) { const v = k % 2 === 0 ? 1 : -1; kw.push([X(k / 4), yk - A * v], [X((k + 1) / 4), yk - A * v]); }
  out.push({ d: lam(kw) });
  log('duch–materia: efekt Gibbsa, max S_33 =', Math.max(...Array.from({ length: 2000 }, (_, j) => S(33, j / 2000 * Math.PI))).toFixed(3));
  return out;
}

/* =====================================================================================
   29. Rzuty monetą (1923): ciąg orłów i reszek jako punkt odcinka; drzewo podziałów dwójkowych
   ===================================================================================== */
function rysMoneta() {
  const X = (x) => 16 + 168 * x, Y = (k) => 44 + k * 34, out = [], gal = [], odc = [];
  const N = 5;
  for (let k = 0; k <= N; k++) {
    const n = 2 ** k, s = [];
    for (let j = 0; j < n; j++) {
      const a = X(j / n) + (k ? 1.4 : 0), b = X((j + 1) / n) - (k ? 1.4 : 0);
      s.push(lam([[a, Y(k)], [b, Y(k)]]));
      if (k < N) { const m = (j + 0.5) / n; gal.push(lam([[X(m), Y(k)], [X((2 * j + 0.5) / (2 * n)), Y(k + 1)]]), lam([[X(m), Y(k)], [X((2 * j + 1.5) / (2 * n)), Y(k + 1)]])); }
    }
    odc.push(s.join(' '));
  }
  out.push({ d: gal.join(' ') });
  for (const s of odc) out.push({ d: s });
  // ciąg rzutów: 1 0 1 1 0
  const ciag = [1, 0, 1, 1, 0]; let lo = 0, w = 1; const dr = [[X(0.5), Y(0)]];
  ciag.forEach((b, k) => { w /= 2; lo += b * w; dr.push([X(lo + w / 2), Y(k + 1)]); });
  out.push({ d: lam(dr), gruba: true });
  out.push({ d: dr.map((p) => kropka(p[0], p[1], 3.2)).join(' '), gruba: true });
  log('moneta: ciąg', ciag.join(''), '→ przedział', lo, lo + w, ' długość', w);
  return out;
}

/* =====================================================================================
   30. Kontrola jakości (1951): krzywe operacyjne planów odbioru: partia przechodzi, gdy w próbce n jest najwyżej c wadliwych
   ===================================================================================== */
function rysKontrola() {
  const X = (p) => 28 + 144 * p / 0.3, Y = (P) => 208 - 158 * P;
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  const OC = (n, c, p) => { let s = 0; for (let k = 0; k <= c; k++) s += C(n, k) * p ** k * (1 - p) ** (n - k); return s; };
  const out = [{ d: `${lam([[X(0), Y(1)], [X(0), Y(0)], [X(0.3), Y(0)]])}` }];
  const zn = []; for (let p = 0.05; p <= 0.3001; p += 0.05) zn.push(lam([[X(p), Y(0)], [X(p), Y(0) + 6]]));
  for (let P_ = 0.25; P_ <= 1.0001; P_ += 0.25) zn.push(lam([[X(0) - 6, Y(P_)], [X(0), Y(P_)]]));
  out.push({ d: zn.join(' ') });
  const plany = [[10, 0], [20, 1], [50, 3], [200, 12]];
  plany.forEach(([n, c], i) => {
    const s = []; for (let j = 0; j <= 120; j++) { const p = 0.3 * j / 120; s.push([X(p), Y(OC(n, c, p))]); }
    out.push({ d: lam(s), gruba: i === 3 });
    log('kontrola: plan n =', n, 'c =', c, ' P(przyjęcia przy 5%) =', OC(n, c, 0.05).toFixed(3), ' przy 10%:', OC(n, c, 0.1).toFixed(3));
  });
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

//@@KONIEC@@
const RYS_TEST = { rysKanapka, rysLebesgue, rys18, rysLongimetr, rysTort, rysWisla, rysTrzy, rysKalejdoskop, rysSzachownica, rysZapalki, rysBanachSteinhaus, rysKSrednich, rysDendryt, rysSJT, rysMoser, rysRoznice, rysKolo, rysDwunastoscian, rysPewniki, rysRademacher, rysBayes, rysIntrowizor, rysTaryfa, rysDirichlet, rysZnaczek, rysGalton, rysTowarzystwo, rysDuchMateria, rysMoneta, rysKontrola };
module.exports = { ...RYS_TEST, kontrola };
