// Ciekawostki patrona działu Nauka: Władysław Ślebodziński (1884–1972).
// Liczy rysunki (ścieżki SVG, viewBox 0 0 200 240, pole x 12–188, y 34–224) i zapisuje:
//   ciekawostki.json  — dane + ścieżki,
//   rysunki.html      — podgląd,
//   rysunki.png       — zrzut podglądu (node generator.js --zrzut; Playwright).
// Każdy rysunek jest liczony: przepływy pól wektorowych (wzory jawne albo RK4), krzywe z równań, przenoszenie równoległe na sferze.
'use strict';
const fs = require('fs');
const path = require('path');

const KAT = __dirname;
const POLE = { x0: 12, x1: 188, y0: 34, y1: 224 };
const PI = Math.PI;

/* ---------------- narzędzia ---------------- */
const fmt = (v) => { let r = Math.round(v * 10) / 10; if (Object.is(r, -0)) r = 0; return String(r); };
const pt = (p) => fmt(p[0]) + ',' + fmt(p[1]);

// uproszczenie łamanej (Ramer–Douglas–Peucker), tolerancja w jednostkach rysunku
function rdp(p, eps) {
  if (p.length < 3) return p.slice();
  const [a, b] = [p[0], p[p.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-12;
  let iMax = 0, dMax = -1;
  for (let i = 1; i < p.length - 1; i++) {
    const d = L > 1e-9 ? Math.abs(dy * (p[i][0] - a[0]) - dx * (p[i][1] - a[1])) / L : Math.hypot(p[i][0] - a[0], p[i][1] - a[1]);
    if (d > dMax) { dMax = d; iMax = i; }
  }
  if (dMax <= eps) return [a, b];
  const l = rdp(p.slice(0, iMax + 1), eps), r = rdp(p.slice(iMax), eps);
  return l.slice(0, -1).concat(r);
}
function lamana(p, zamk = false, eps = 0.1) {
  let q = p;
  if (zamk) { // RDP na zamkniętej: tniemy w punkcie najdalszym od początku
    let iMax = 0, dMax = 0;
    p.forEach((s, i) => { const d = Math.hypot(s[0] - p[0][0], s[1] - p[0][1]); if (d > dMax) { dMax = d; iMax = i; } });
    q = rdp(p.slice(0, iMax + 1), eps).slice(0, -1).concat(rdp(p.slice(iMax).concat([p[0]]), eps).slice(0, -1));
  } else q = rdp(p, eps);
  return 'M' + pt(q[0]) + ' L' + q.slice(1).map(pt).join(' ') + (zamk ? 'Z' : '');
}
const kropka = (p) => `M${fmt(p[0] - 4.5)},${fmt(p[1])} a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0`;
// strzałka: od q w kierunku u (wektor jednostkowy), długość l, grot g pod kątem k
function strzalka(q, u, l, g = 6.5, k = 0.42) {
  const e = [q[0] + u[0] * l, q[1] + u[1] * l];
  const r = (a) => [Math.cos(a) * -u[0] - Math.sin(a) * -u[1], Math.sin(a) * -u[0] + Math.cos(a) * -u[1]];
  const h1 = r(k), h2 = r(-k);
  return `M${pt(q)} L${pt(e)} M${pt([e[0] + g * h1[0], e[1] + g * h1[1]])} L${pt(e)} ${pt([e[0] + g * h2[0], e[1] + g * h2[1]])}`;
}
const wPolu = (p, m = 0) => p[0] >= POLE.x0 + m && p[0] <= POLE.x1 - m && p[1] >= POLE.y0 + m && p[1] <= POLE.y1 - m;
// przycięcie łamanej do prostokąta pola (Liang–Barsky na każdym odcinku), zwraca listę kawałków
function przytnij(p, m = 0) {
  const X0 = POLE.x0 + m, X1 = POLE.x1 - m, Y0 = POLE.y0 + m, Y1 = POLE.y1 - m, out = [];
  let cur = null;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b] = [p[i], p[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1];
    let t0 = 0, t1 = 1, ok = true;
    [[-dx, a[0] - X0], [dx, X1 - a[0]], [-dy, a[1] - Y0], [dy, Y1 - a[1]]].forEach(([pp, q]) => {
      if (!ok) return;
      if (Math.abs(pp) < 1e-12) { if (q < 0) ok = false; return; }
      const r = q / pp;
      if (pp < 0) { if (r > t1) ok = false; else if (r > t0) t0 = r; } else { if (r < t0) ok = false; else if (r < t1) t1 = r; }
    });
    if (!ok) { if (cur) { out.push(cur); cur = null; } continue; }
    const A = [a[0] + t0 * dx, a[1] + t0 * dy], B = [a[0] + t1 * dx, a[1] + t1 * dy];
    if (!cur) cur = [A];
    else if (t0 > 1e-9) { out.push(cur); cur = [A]; }
    cur.push(B);
    if (t1 < 1 - 1e-9) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out.filter((c) => dlug(c) >= 6);
}
const dlug = (p) => p.reduce((s, q, i) => i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0, 0);
const poleWiel = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
const okrag = (c, r, n = 180, a0 = 0, a1 = 2 * PI) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]; });
const kontrola = {}; // wyniki kontroli numerycznych, trafiają do raportu w konsoli i do HTML

/* ---------------- 1. Pochodna Liego (1931) — poprawiony znak ---------------- */
// Pole liniowe X(p) = A p, A = aI + J (spirala logarytmiczna), przepływ φ_t = e^{tA}.
// Wektor w przeniesiony przepływem: w(t) = dφ_t(w0) = e^{tA} w0 — takie pole ma pochodną Liego L_X w = 0.
// Zmiany względem prototypu: wektory siedzą na narysowanej spirali, są ustawione pod kątem do przepływu
// (widać obrót i wzrost niesionego wektora; kąt do krzywej stały, bo e^{tA} jest podobieństwem), wszystko w polu.
function rysLie() {
  const a = 0.17, c = [100, 129], s = 60, KAT0 = 3, OBR = 2 * PI / KAT0;
  const fl = (p, t) => { const e = Math.exp(a * t), co = Math.cos(t), si = Math.sin(t); return [e * (co * p[0] - si * p[1]), e * (si * p[0] + co * p[1])]; };
  const P = (p) => [c[0] + s * p[0], c[1] - s * p[1]];
  const out = [];
  for (let k = 0; k < KAT0; k++) {
    const p0 = [0.24 * Math.cos(k * OBR), 0.24 * Math.sin(k * OBR)], pts = [];
    for (let t = 0; t <= 30; t += 0.01) pts.push(P(fl(p0, t)));
    przytnij(pts, 2).forEach((kaw) => out.push({ d: lamana(kaw) }));
  }
  // wektory niesione wzdłuż spirali k = 0: start na promieniu 0,56 (34 j.), kolejne chwile co 0,95 rad;
  // w(t) = e^{(t − t0)A} w0, długość rysowana proporcjonalnie do |w(t)|
  const p0 = [0.24, 0], t0 = Math.log(0.56 / 0.24) / a;
  const q0 = fl(p0, t0), X0 = [a * q0[0] - q0[1], q0[0] + a * q0[1]];
  const kat = 0.9; // kąt między niesionym wektorem a przepływem (do środka spirali)
  const w0 = [Math.cos(kat) * X0[0] - Math.sin(kat) * X0[1], Math.sin(kat) * X0[0] + Math.cos(kat) * X0[1]];
  const L0 = Math.hypot(...w0);
  let n = 0;
  for (let t = t0; t <= t0 + 5.7; t += 0.95) {
    const q = P(fl(p0, t)), w = fl(w0, t - t0), L = Math.hypot(w[0], w[1]);
    const u = [w[0] / L, -w[1] / L], l = 12 * L / L0;
    const e = [q[0] + u[0] * l, q[1] + u[1] * l];
    if (!wPolu(q, 2) || !wPolu(e, 6)) continue;
    out.push({ d: strzalka(q, u, l), gruba: true }); n++;
  }
  kontrola.lie = `${n} wektorów niesionych przepływem e^{tA}; stały kąt do spirali ${(kat * 180 / PI).toFixed(0)}°, długość rośnie jak e^{${a}t}`;
  return out;
}

/* ---------------- 2. Nazwa od van Dantziga (1932): „przeciąganie” ---------------- */
// Przepływ wirowy wokół c: punkt (r, θ) ↦ (r, θ + Ω(r) t), Ω(r) = 1 / (1 + (r/r0)²) — wnętrze obraca się szybciej.
// Kratka 3 × 3 przeciągana przepływem w trzech chwilach; każdy punkt liczony dokładnie. Brzeg ostatniej kopii gruby.
function rysDantzig() {
  const c = [100, 129], r0 = 42, Om = (r) => 1 / (1 + (r / r0) ** 2);
  const fl = (p, t) => { const x = p[0] - c[0], y = c[1] - p[1], r = Math.hypot(x, y), th = Math.atan2(y, x) + Om(r) * t; return [c[0] + r * Math.cos(th), c[1] - r * Math.sin(th)]; };
  const out = [];
  [20, 86].forEach((r) => out.push({ d: lamana(okrag(c, r, 240).slice(0, -1), true) }));
  const fi = -1.95, rs = 55, h = 15, sr = [c[0] + rs * Math.cos(fi), c[1] - rs * Math.sin(fi)];
  const er = [Math.cos(fi), -Math.sin(fi)], et = [-Math.sin(fi), -Math.cos(fi)]; // kierunek radialny i styczny (ekran)
  const Q = (a, b) => [sr[0] + h * (a * er[0] + b * et[0]), sr[1] + h * (a * er[1] + b * et[1])];
  const obwod = [], N = 60;
  [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i < N; i++) { const s = i / N; obwod.push(Q(x0 + (x1 - x0) * s, y0 + (y1 - y0) * s)); } });
  const wewn = [];
  [-1 / 3, 1 / 3].forEach((k) => { wewn.push((s) => Q(k, s)); wewn.push((s) => Q(s, k)); });
  const pola = [], CH = [0, 2.7, 5.4];
  CH.forEach((t, j) => {
    const brzeg = obwod.map((p) => fl(p, t));
    pola.push(poleWiel(brzeg));
    out.push({ d: lamana(brzeg, true), gruba: j === CH.length - 1 });
    wewn.forEach((f) => out.push({ d: lamana(Array.from({ length: 81 }, (_, m) => fl(f(-1 + 2 * m / 80), t))) }));
  });
  kontrola.dantzig = `pola kratki w chwilach ${CH.join('; ')}: ${pola.map((v) => v.toFixed(1)).join(' / ')} (ten przepływ zachowuje też pole)`;
  return out;
}

/* ---------------- 3. Równania Hamiltona (1931): przepływ zachowuje formę symplektyczną ---------------- */
// Wahadło H(q, p) = p²/2 − cos q, q′ = p, p′ = −sin q. Poziomice H (orbity) i koło warunków początkowych
// przeniesione przepływem (RK4) po czasie T — pole się nie zmienia (twierdzenie Liouville’a; L_{X_H} ω = 0).
function rysHamilton() {
  const c = [100, 130], s = 27, P = (q, p) => [c[0] + s * q, c[1] - s * p];
  const out = [];
  const qMax = PI * 0.985;
  [-0.55, 0.15].forEach((E) => { // oscylacje: zamknięte
    const qm = Math.acos(-E), g = [], d = [];
    for (let i = 0; i <= 200; i++) { const q = -qm + 2 * qm * (0.5 - 0.5 * Math.cos(PI * i / 200)); const p = Math.sqrt(Math.max(0, 2 * (E + Math.cos(q)))); g.push(P(q, p)); d.push(P(q, -p)); }
    out.push({ d: lamana(g.concat(d.reverse().slice(1, -1)), true) });
  });
  [1, 1.75].forEach((E) => [1, -1].forEach((zn) => { // separatrysa i rotacje
    const g = [];
    for (let i = 0; i <= 240; i++) { const q = -qMax + 2 * qMax * i / 240; g.push(P(q, zn * Math.sqrt(Math.max(0, 2 * (E + Math.cos(q)))))); }
    out.push({ d: lamana(g) });
  }));
  const f = ([q, p]) => [p, -Math.sin(q)];
  const rk4 = (z, dt) => { const k1 = f(z), k2 = f([z[0] + dt / 2 * k1[0], z[1] + dt / 2 * k1[1]]), k3 = f([z[0] + dt / 2 * k2[0], z[1] + dt / 2 * k2[1]]), k4 = f([z[0] + dt * k3[0], z[1] + dt * k3[1]]); return [z[0] + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), z[1] + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; };
  const sr = [-1.3, 0.25], R = 0.52, T = 10.2, dt = 0.004;
  const kolo = Array.from({ length: 360 }, (_, i) => [sr[0] + R * Math.cos(2 * PI * i / 360), sr[1] + R * Math.sin(2 * PI * i / 360)]);
  const obraz = kolo.map((z) => { let w = z; for (let t = 0; t < T - 1e-9; t += dt) w = rk4(w, dt); return w; });
  out.push({ d: lamana(kolo.map(([q, p]) => P(q, p)), true) });
  out.push({ d: lamana(obraz.map(([q, p]) => P(q, p)), true, 0.08), gruba: true });
  const Hmax = Math.max(...kolo.map(([q, p]) => p * p / 2 - Math.cos(q)));
  kontrola.hamilton = `max H na kole ${Hmax.toFixed(2)} (< 1: wewnątrz separatrysy); pole koła ${poleWiel(kolo).toFixed(4)}, pole obrazu po T = ${T}: ${poleWiel(obraz).toFixed(4)}`;
  return out;
}

/* ---------------- 4. Pochodna Liego pola wektorów = nawias Liego ---------------- */
// X — obrót wokół O, Y — przesunięcie w prawo. Obieg: X przez kąt α, Y o τ, X wstecz, Y wstecz; luka
// P4 − P0 = τ (R(−α) e1 − e1) ≈ ατ [X, Y] (tu [X, Y] = −∂y, czyli „w dół” w układzie z osią y do góry).
function rysNawias() {
  const r0 = 66, al = 0.74, tau = 64;
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  // współrzędne matematyczne względem O (oś y do góry)
  const P0 = [r0, 0], P1 = rot(P0, al), P2 = [P1[0] + tau, P1[1]], P3 = rot(P2, -al), P4 = [P3[0] - tau, P3[1]];
  const luk = (p, a, n = 60) => Array.from({ length: n + 1 }, (_, i) => rot(p, a * i / n));
  const droga = luk(P0, al).concat([P2]).concat(luk(P2, -al).slice(1)).concat([P4]);
  // przesunięcie, by rysunek (droga) był na środku pola
  const xs = droga.map((p) => p[0]), ys = droga.map((p) => p[1]);
  const O = [100 - (Math.min(...xs) + Math.max(...xs)) / 2 - 2, 129 + (Math.min(...ys) + Math.max(...ys)) / 2];
  const S = (p) => [O[0] + p[0], O[1] - p[1]];
  const out = [];
  // tło: linie przepływu X (łuki wokół O) i Y (poziome)
  [r0, Math.hypot(...P2), 150].forEach((r) => {
    const pts = Array.from({ length: 241 }, (_, i) => { const a = -PI / 2 + PI * i / 240; return S([r * Math.cos(a), r * Math.sin(a)]); });
    przytnij(pts, 2).forEach((k) => out.push({ d: lamana(k) }));
  });
  [P1[1], P3[1], P1[1] + 44, P3[1] - 44].forEach((y) => {
    const Y = O[1] - y;
    if (Y > POLE.y0 + 3 && Y < POLE.y1 - 3) out.push({ d: `M${fmt(POLE.x0 + 4)},${fmt(Y)} L${fmt(POLE.x1 - 4)},${fmt(Y)}` });
  });
  out.push({ d: lamana(droga.map(S)), gruba: true });
  out.push({ d: kropka(S(P0)), gruba: true });
  out.push({ d: kropka(S(P4)), gruba: true });
  { // cienka strzałka od startu do końca obiegu (kierunek nawiasu), odsunięta od kropek
    const A = S(P0), B = S(P4), dd = [B[0] - A[0], B[1] - A[1]], LL = Math.hypot(...dd), u = [dd[0] / LL, dd[1] / LL];
    out.push({ d: strzalka([A[0] + 7 * u[0], A[1] + 7 * u[1]], u, LL - 14, 6) });
  }
  const gap = Math.hypot(P4[0] - P0[0], P4[1] - P0[1]);
  kontrola.nawias = `luka |P4 − P0| = ${gap.toFixed(1)} j.; przybliżenie ατ = ${(al * tau).toFixed(1)} j. (kierunek: w dół, czyli −∂y)`;
  return out;
}

/* ---------------- 5. Zjazd we Lwowie (1927): pole grawitacji — paraboloida Flamma ---------------- */
// Przestrzenny przekrój metryki Schwarzschilda: w(r) = 2√(r_s (r − r_s)), r ≥ r_s (Flamm 1916), rzut ukośny.
function rysFlamm() {
  const rs = 1, Rm = 4.4, k = 19.6, e = 0.42, c = [100, 186];
  const w = (r) => 2 * Math.sqrt(rs * (r - rs));
  const S = (r, f) => [c[0] + k * r * Math.cos(f), c[1] - k * (w(r) * Math.cos(e) - r * Math.sin(f) * Math.sin(e))];
  // przesunięcie w pionie, by środek rysunku był ok. y = 129
  const top = c[1] - k * (w(Rm) * Math.cos(e) + Rm * Math.sin(e)), bot = c[1] + k * rs * Math.sin(e);
  const dy = 129 - (top + bot) / 2;
  const T = (p) => [p[0], p[1] + dy];
  const out = [];
  const promienie = [1.3, 1.85, 2.6, 3.45, Rm];
  promienie.forEach((r) => out.push({ d: lamana(Array.from({ length: 240 }, (_, i) => T(S(r, 2 * PI * i / 240))), true) }));
  for (let j = 0; j < 12; j++) {
    const f = 2 * PI * j / 12 + PI / 12;
    out.push({ d: lamana(Array.from({ length: 121 }, (_, i) => { const r = rs + (Rm - rs) * (i / 120) ** 2; return T(S(r, f)); })) });
  }
  out.push({ d: lamana(Array.from({ length: 240 }, (_, i) => T(S(rs, 2 * PI * i / 240))), true), gruba: true });
  kontrola.flamm = `w(r) = 2√(r_s(r − r_s)); r od ${rs} do ${Rm}; wysokość w(${Rm}) = ${w(Rm).toFixed(2)} r_s`;
  return out;
}

/* ---------------- 6. Seminarium 1948: przeniesienie równoległe na sferze ---------------- */
// Trójkąt N → A → B → N (oktant, trzy kąty proste). Wektor przenoszony równolegle wraca obrócony o 90° = pole trójkąta.
function rysSfera() {
  const R = 80, c = [100, 129];
  const nor = (v) => { const L = Math.hypot(...v); return v.map((x) => x / L); };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const v = nor([0.85, 0.75, 1.15]); // kierunek patrzenia (od środka do widza): oktant widziany z góry, z ukosa
  const up = nor([0 - v[2] * v[0], 0 - v[2] * v[1], 1 - v[2] * v[2]]);
  const rt = cross(up, v);
  const S = (p) => [c[0] + R * dot(p, rt), c[1] - R * dot(p, up)];
  const out = [];
  out.push({ d: lamana(okrag(c, R, 240).slice(0, -1), true) });
  const widoczne = (f, n = 360) => { // krzywa na sferze, tylko część widoczna (p·v > 0)
    const kaw = []; let cur = [];
    for (let i = 0; i <= n; i++) { const p = f(i / n); if (dot(p, v) > 0.02) cur.push(S(p)); else if (cur.length) { kaw.push(cur); cur = []; } }
    if (cur.length) kaw.push(cur);
    return kaw.filter((k) => dlug(k) > 8);
  };
  widoczne((t) => [Math.cos(2 * PI * t), Math.sin(2 * PI * t), 0]).forEach((k) => out.push({ d: lamana(k) }));            // równik
  widoczne((t) => [0.707 * Math.cos(2 * PI * t), 0.707 * Math.sin(2 * PI * t), 0.707]).forEach((k) => out.push({ d: lamana(k) })); // równoleżnik 45°
  [0, PI / 2].forEach((f) => widoczne((t) => [Math.sin(2 * PI * t) * Math.cos(f), Math.sin(2 * PI * t) * Math.sin(f), Math.cos(2 * PI * t)]).forEach((k) => out.push({ d: lamana(k) })));
  // trójkąt
  const tr = [];
  for (let i = 0; i <= 90; i++) { const s = PI / 2 * i / 90; tr.push(S([Math.sin(s), 0, Math.cos(s)])); }
  for (let i = 1; i <= 90; i++) { const u = PI / 2 * i / 90; tr.push(S([Math.cos(u), Math.sin(u), 0])); }
  for (let i = 1; i < 90; i++) { const s = PI / 2 * (1 - i / 90); tr.push(S([0, Math.sin(s), Math.cos(s)])); }
  out.push({ d: lamana(tr, true), gruba: true });
  // wektory przenoszone równolegle; start w N pod kątem β do południka NA. Równolegle przenoszony wektor ma stały kąt
  // z kierunkiem geodezyjnej, więc na każdym boku: w = cos(·)·(styczna) + sin(·)·(normalna w sferze), wzory jawne.
  const L = 0.32, be = -0.7, cb = Math.cos(be), sb = Math.sin(be);
  const bok1 = (s) => [[Math.sin(s), 0, Math.cos(s)], [cb * Math.cos(s), sb, -cb * Math.sin(s)]];          // N → A
  const bok2 = (u) => [[Math.cos(u), Math.sin(u), 0], [-sb * Math.sin(u), sb * Math.cos(u), -cb]];          // A → B
  const bok3 = (s) => [[0, Math.sin(s), Math.cos(s)], [-sb, cb * Math.cos(s), -cb * Math.sin(s)]];          // B → N (s maleje)
  const wek = [[...bok1(0), true], [...bok1(PI / 4), false], [...bok2(0), false], [...bok2(PI / 4), false], [...bok2(PI / 2), false], [...bok3(PI / 4), false], [...bok3(0), true]];
  // kontrola ciągłości na wierzchołkach i styczności
  const bl = Math.max(...[[bok1(PI / 2)[1], bok2(0)[1]], [bok2(PI / 2)[1], bok3(PI / 2)[1]]].map(([x, y]) => Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])));
  const st = Math.max(...wek.map(([p, w]) => Math.abs(dot(p, w))));
  wek.forEach(([p, w, gr]) => {
    const q = S(p), e = S(p.map((x, i) => x + L * w[i])), d = [e[0] - q[0], e[1] - q[1]], l = Math.hypot(...d);
    out.push({ d: strzalka(q, [d[0] / l, d[1] / l], l), gruba: gr });
  });
  const kat = Math.acos(dot(wek[0][1], wek[6][1])) * 180 / PI;
  kontrola.sfera = `kąt między wektorem startowym i końcowym w N: ${kat.toFixed(1)}° = pole oktantu π/2; skok na wierzchołkach ${bl.toExponential(1)}, |p·w| ≤ ${st.toExponential(1)}`;
  return out;
}

/* ---------------- 7. Wykłady 1946: elipsa, ewoluta, okrąg ściśle styczny ---------------- */
// Elipsa (A cos t, B sin t); środek krzywizny K(t) = ((A² − B²)/A cos³t, (B² − A²)/B sin³t) leży na ewolucie,
// która jest obwiednią normalnych. Normalne rysowane od punktu elipsy do jej środka krzywizny.
function rysEwoluta() {
  const A = 82, B = 52, c = [100, 129];
  const E = (t) => [c[0] + A * Math.cos(t), c[1] - B * Math.sin(t)];
  const K = (t) => [c[0] + (A * A - B * B) / A * Math.cos(t) ** 3, c[1] - (B * B - A * A) / B * Math.sin(t) ** 3];
  const rho = (t) => (A * A * Math.sin(t) ** 2 + B * B * Math.cos(t) ** 2) ** 1.5 / (A * B);
  const out = [];
  out.push({ d: lamana(Array.from({ length: 360 }, (_, i) => E(2 * PI * i / 360)), true) });
  out.push({ d: lamana(Array.from({ length: 720 }, (_, i) => K(2 * PI * i / 720)), true, 0.06) });
  const NN = 20;
  for (let i = 0; i < NN; i++) {
    const t = 2 * PI * (i + 0.5) / NN;
    out.push({ d: `M${pt(E(t))} L${pt(K(t))}` });
  }
  const t0 = 0, p = E(t0), q = K(t0), r = rho(t0);
  out.push({ d: lamana(okrag(q, r, 160).slice(0, -1), true), gruba: true });
  out.push({ d: kropka(p), gruba: true });
  // kontrola: K(t) = punkt + ρ · normalna do środka
  let blad = 0;
  for (let i = 0; i < 50; i++) { const t = 2 * PI * i / 50, e = E(t), k = K(t); blad = Math.max(blad, Math.abs(Math.hypot(k[0] - e[0], k[1] - e[1]) - rho(t))); }
  kontrola.ewoluta = `okrąg ściśle styczny w wierzchołku: ρ = B²/A = ${r.toFixed(1)}; |K(t) − E(t)| = ρ(t) z dokładnością ${blad.toExponential(1)}; ${NN} normalnych`;
  return out;
}

/* ---------------- 8. Obrony: jedenaście krzywych całkowych z węzła ---------------- */
// Węzeł niestabilny x′ = x, y′ = λy (λ = 1,7): krzywe (ε cos φ eᵗ, ε sin φ e^{λt}), 11 kierunków startu.
function rysWezel() {
  const lam = 1.7, c = [100, 129], eps = 9, out = [];
  for (let k = 0; k < 11; k++) {
    const f = PI / 2 + 2 * PI * k / 11, pts = []; // symetria względem pionu
    for (let t = 0; t < 6; t += 0.004) { const x = eps * Math.cos(f) * Math.exp(t), y = eps * Math.sin(f) * Math.exp(lam * t); const p = [c[0] + x, c[1] - y]; pts.push(p); if (!wPolu(p, -4)) break; }
    const kaw = przytnij(pts, 2)[0];
    out.push({ d: lamana(kaw) });
    // grot w odległości ok. 44 j. od źródła (kierunek pola)
    let i = 0; while (i < kaw.length - 1 && Math.hypot(kaw[i][0] - c[0], kaw[i][1] - c[1]) < 44) i++;
    const a = kaw[Math.max(0, i - 1)], b = kaw[Math.min(kaw.length - 1, i + 1)], d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(...d);
    const u = [d[0] / L, d[1] / L], q = kaw[i];
    const r = (al) => [Math.cos(al) * -u[0] - Math.sin(al) * -u[1], Math.sin(al) * -u[0] + Math.cos(al) * -u[1]];
    const h1 = r(0.5), h2 = r(-0.5);
    out.push({ d: `M${pt([q[0] + 6.5 * h1[0], q[1] + 6.5 * h1[1]])} L${pt(q)} ${pt([q[0] + 6.5 * h2[0], q[1] + 6.5 * h2[1]])}` });
  }
  out.push({ d: kropka(c), gruba: true });
  kontrola.wezel = `11 krzywych całkowych x′ = x, y′ = ${lam}y`;
  return out;
}

/* ---------------- 9. Formes extérieures: forma dθ jako „warstwice” ---------------- */
// Forma zamknięta, niedokładna dθ na płaszczyźnie bez punktu. Warstwice θ = const to promienie.
// Pętla wokół środka przecina każdy promień raz (całka 2π), pętla obok — dwa razy w przeciwne strony (całka 0).
function rysForma() {
  const c = [100, 129], out = [];
  for (let k = 0; k < 16; k++) { const a = 2 * PI * k / 16; out.push({ d: `M${pt([c[0] + 22 * Math.cos(a), c[1] - 22 * Math.sin(a)])} L${pt([c[0] + 86 * Math.cos(a), c[1] - 86 * Math.sin(a)])}` }); }
  out.push({ d: lamana(okrag(c, 5, 60).slice(0, -1), true) });
  const r = (a) => 54 + 15 * Math.sin(3 * a + 0.5);
  out.push({ d: lamana(Array.from({ length: 360 }, (_, i) => { const a = 2 * PI * i / 360; return [c[0] + r(a) * Math.cos(a), c[1] - r(a) * Math.sin(a)]; }), true), gruba: true });
  const s2 = [c[0] + 50 * Math.cos(-2.2), c[1] - 50 * Math.sin(-2.2)];
  out.push({ d: lamana(okrag(s2, 15, 120).slice(0, -1), true) });
  // kontrola: całka dθ po pętlach (numerycznie)
  const calka = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; let d = Math.atan2(-(b[1] - c[1]), b[0] - c[0]) - Math.atan2(-(a[1] - c[1]), a[0] - c[0]); if (d > PI) d -= 2 * PI; if (d < -PI) d += 2 * PI; s += d; } return s; };
  const p1 = Array.from({ length: 720 }, (_, i) => { const a = 2 * PI * i / 720; return [c[0] + r(a) * Math.cos(a), c[1] - r(a) * Math.sin(a)]; });
  kontrola.forma = `całka dθ: pętla wokół środka ${(calka(p1) / PI).toFixed(3)}π, pętla obok ${(calka(okrag(s2, 15, 720).slice(0, -1)) / PI).toFixed(3)}π`;
  return out;
}

/* ---------------- 10. Zespół IM PAN, 1956: ta sama forma pola w innych współrzędnych ---------------- */
// Obraz kratki przez Φ = S2 ∘ S1, S1(u, v) = (u + α sin(v/L), v), S2(x, y) = (x, y + β sin(x/L)); oba ścinania mają
// jakobian 1, więc du∧dv = dx∧dy: każde oczko krzywoliniowej siatki ma to samo pole.
function rysSiatka() {
  const c = [100, 129], al = 10, be = 10, L = 26, h = 16, n = 4;
  const F = (u, v) => { const x = u + al * Math.sin(v / L), y = v + be * Math.sin(x / L); return [c[0] + x, c[1] - y]; };
  const out = [];
  for (let i = -n; i <= n; i++) {
    out.push({ d: lamana(Array.from({ length: 161 }, (_, m) => F(i * h, -n * h + 2 * n * h * m / 160))) });
    out.push({ d: lamana(Array.from({ length: 161 }, (_, m) => F(-n * h + 2 * n * h * m / 160, i * h))) });
  }
  const oczko = (i, j) => { const p = [], N = 40; [[0, 0, 1, 0], [1, 0, 1, 1], [1, 1, 0, 1], [0, 1, 0, 0]].forEach(([a, b, cc, d]) => { for (let m = 0; m < N; m++) { const s = m / N; p.push(F((i + a + (cc - a) * s) * h, (j + b + (d - b) * s) * h)); } }); return p; };
  const pola = [];
  [[-3, 1], [1, -3], [0, 0]].slice(0, 2).forEach(([i, j]) => { const p = oczko(i, j); pola.push(poleWiel(p)); out.push({ d: lamana(p, true), gruba: true }); });
  kontrola.siatka = `pola wyróżnionych oczek: ${pola.map((v) => v.toFixed(1)).join(' i ')} (oczko kratki: ${h * h})`;
  return out;
}

/* ---------------- 11. Referat o geometrii tkanin (1945): tkanina heksagonalna ---------------- */
// Trzy rodziny u = const, v = const, u + v = const (tkanina równoległa), przeniesione dyfeomorfizmem
// (siatka trójkątna zgięta „biegunowo”): krzywe przestają być proste, ale sześciokąt zamykania nadal się domyka.
function rysTkanina() {
  const d = 20, n = 4, R0 = 125;
  // dyfeomorfizm: siatka trójkątna (x, y), potem „zgięcie biegunowe” (x, y) ↦ ((R0 + y) sin(x/R0), (R0 + y) cos(x/R0) − R0)
  // (współrzędne biegunowe o promieniu R0 + y > 0 i kącie x/R0 ∈ (−π/2, π/2): różnowartościowe i gładkie);
  // na końcu przesunięcie i skala dobrane tak, by całość była na środku pola
  const G0 = (u, v) => { const x = u + v / 2, y = Math.sqrt(3) / 2 * v; return [(R0 + y) * Math.sin(x / R0), (R0 + y) * Math.cos(x / R0) - R0]; };
  const M = n * d, odc = (f, a, b) => Array.from({ length: 81 }, (_, m) => f(a + (b - a) * m / 80));
  const krzywe = [];
  for (let k = -n; k <= n; k++) {
    const v = k * d; // rodzina v = const: u ∈ [max(−M, −M − v), min(M, M − v)]
    krzywe.push(odc((u) => G0(u, v), Math.max(-M, -M - v), Math.min(M, M - v)));
    const u = k * d; // rodzina u = const
    krzywe.push(odc((vv) => G0(u, vv), Math.max(-M, -M - u), Math.min(M, M - u)));
    const s = k * d; // rodzina u + v = s: u ∈ [max(−M, s − M), min(M, s + M)]
    krzywe.push(odc((uu) => G0(uu, s - uu), Math.max(-M, s - M), Math.min(M, s + M)));
  }
  const wsz = krzywe.flat(), xs = wsz.map((p) => p[0]), ys = wsz.map((p) => p[1]);
  const sk = Math.min(1, 168 / (Math.max(...xs) - Math.min(...xs)), 182 / (Math.max(...ys) - Math.min(...ys)));
  const sx = (Math.min(...xs) + Math.max(...xs)) / 2, sy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const T = (p) => [100 + sk * (p[0] - sx), 129 - sk * (p[1] - sy)];
  const out = krzywe.map((k) => ({ d: lamana(k.map(T)) }));
  const hh = 2 * d, W = [[hh, 0], [hh, -hh], [0, -hh], [-hh, 0], [-hh, hh], [0, hh]];
  const szesc = [];
  W.forEach((a, i) => { const b = W[(i + 1) % 6]; for (let m = 0; m < 40; m++) { const s = m / 40; szesc.push(T(G0(a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s))); } });
  out.push({ d: lamana(szesc, true), gruba: true });
  out.push({ d: kropka(T(G0(0, 0))), gruba: true });
  kontrola.tkanina = `R0 + y ≥ ${(R0 - Math.sqrt(3) / 2 * M).toFixed(1)} > 0, |x|/R0 ≤ ${(M / R0).toFixed(2)} < π/2; 3 × ${2 * n + 1} krzywych, skala ${sk.toFixed(2)}; sześciokąt po liniach tkaniny: (±${hh}, 0), (0, ±${hh}), (${hh}, −${hh}), (−${hh}, ${hh}) w parametrach (u, v)`;
  return out;
}

/* ================ Dopisane 5.11: rysunki nowych ciekawostek ================ */
const grot = (e, u, g = 7, k = 0.42) => { // sam grot w punkcie e, u = kierunek jednostkowy
  const r = (a) => [Math.cos(a) * -u[0] - Math.sin(a) * -u[1], Math.sin(a) * -u[0] + Math.cos(a) * -u[1]];
  const h1 = r(k), h2 = r(-k);
  return `M${pt([e[0] + g * h1[0], e[1] + g * h1[1]])} L${pt(e)} ${pt([e[0] + g * h2[0], e[1] + g * h2[1]])}`;
};
const jedn = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };

/* 12. Teoria Galois: pierwiastki siódmego stopnia z jedynki i generator grupy Galois k ↦ 3k (mod 7) */
function rysGalois() {
  const c = [100, 129], R = 78, n = 7;
  const P = (k, r = R) => { const a = PI / 2 - 2 * PI * k / n; return [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]; };
  const orb = [1]; for (let x = 3; x !== 1; x = (x * 3) % n) orb.push(x);
  const out = [{ d: lamana(okrag(c, R, 180).slice(0, -1), true) }];
  for (let k = 0; k < n; k++) out.push({ d: `M${pt(c)} L${pt(P(k))}` });
  orb.forEach((k, i) => { // grot w 3/4 każdej cięciwy
    const a = P(k), b = P(orb[(i + 1) % orb.length]);
    out.push({ d: grot([a[0] + (b[0] - a[0]) * 0.76, a[1] + (b[1] - a[1]) * 0.76], jedn(a, b), 8), gruba: true });
  });
  out.push({ d: lamana(orb.map((k) => P(k)), true), gruba: true });
  for (let k = 0; k < n; k++) out.push({ d: kropka(P(k)), gruba: true });
  out.push({ d: lamana(okrag(P(0), 9.5, 36).slice(0, -1), true), gruba: true }); // k = 0 jest punktem stałym
  kontrola.galois = `orbita k ↦ 3k mod 7: ${orb.join(' → ')} → 1 (długość ${orb.length} = 7 − 1, więc 3 generuje grupę Galois); ζ⁰ = 1 pozostaje na miejscu`;
  return out;
}

/* 13. Ogród botaniczny: filotaksja wg modelu Vogla (n-ty liść: r = C√n, kąt n · 137,508°); 13 + 21 parastych */
function rysLiscie() {
  const c = [100, 129], zloty = PI * (3 - Math.sqrt(5)), Nmax = 430, C = 86 / Math.sqrt(Nmax), n0 = 72;
  const owin = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const out = [];
  [[21, 0], [13, 5]].forEach(([k, wyr]) => {
    const dl = owin(k * zloty);
    for (let j = 0; j < k; j++) {
      const nS = n0 + ((j - n0) % k + k) % k; // pierwszy liść tej parastychy; krzywą przedłużamy w obie strony do promieni n0 i Nmax
      const p = [], s0 = (n0 - nS) / k, s1 = (Nmax - nS) / k, kr = Math.ceil((s1 - s0) / 0.25);
      for (let q = 0; q <= kr; q++) {
        const s = s0 + (s1 - s0) * q / kr, m = nS + k * s, r = C * Math.sqrt(m), a = nS * zloty + s * dl;
        p.push([c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]);
      }
      out.push({ d: lamana(p, false, 0.25), gruba: j === wyr });
    }
  });
  out.push({ d: lamana(okrag(c, C * Math.sqrt(Nmax), 200).slice(0, -1), true, 0.2) }, { d: lamana(okrag(c, C * Math.sqrt(n0), 120).slice(0, -1), true, 0.2) });
  kontrola.liscie = `kąt ${(zloty * 180 / PI).toFixed(3)}°; ${Nmax} liści; 13 i 21 parastych (kolejne liczby Fibonacciego), odcięte wnętrze n < ${n0}; obrót na krok parastychy: 21 → ${(owin(21 * zloty) * 180 / PI).toFixed(2)}°, 13 → ${(owin(13 * zloty) * 180 / PI).toFixed(2)}°`;
  return out;
}

/* 14. Getynga: krzywa Hilberta rzędu 4 (Hilbert 1891); pogrubiony obraz odcinka [0, 1/4] */
function rysHilbert() {
  const rzad = 4, N = 1 << rzad, bok = 168, x0 = 16, y0 = 45;
  const d2xy = (d) => {
    let x = 0, y = 0, t = d;
    for (let s = 1; s < N; s *= 2) {
      const rx = 1 & (t / 2), ry = 1 & (t ^ rx);
      if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } [x, y] = [y, x]; }
      x += s * rx; y += s * ry; t = Math.floor(t / 4);
    }
    return [x, y];
  };
  const P = Array.from({ length: N * N }, (_, d) => { const [x, y] = d2xy(d); return [x0 + (x + 0.5) * bok / N, y0 + bok - (y + 0.5) * bok / N]; });
  const cw = N * N / 4, out = [];
  for (let q = 0; q < 4; q++) out.push({ d: 'M' + pt(P[q * cw]) + ' L' + P.slice(q * cw + 1, Math.min((q + 1) * cw + 1, N * N)).map(pt).join(' '), gruba: q === 0 });
  out.push({ d: `M${x0},${y0} L${x0 + bok},${y0} ${x0 + bok},${y0 + bok} ${x0},${y0 + bok}Z` });
  const krok = P.every((p, i) => !i || Math.abs(Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) - bok / N) < 1e-9);
  kontrola.hilbert = `${N * N} punktów, każdy krok ma długość ${(bok / N).toFixed(1)}: ${krok}; każda ćwiartka odcinka wypełnia jedną ćwiartkę kwadratu`;
  return out;
}

/* 15. Toczenie: elipsa toczona bez poślizgu po prostej; ognisko kreśli „elipsoidalną łańcuchową”, której obrót daje undoloid Delaunaya */
function rysToczenie() {
  const a = 31, b = 22, f = Math.sqrt(a * a - b * b), y0 = 136, N = 3000;
  const E = (t) => [a * Math.cos(t), b * Math.sin(t)];
  const T = [], S = [0];
  for (let i = 0; i <= N; i++) T.push(2 * PI * i / N); // start: dotyka wierzchołek osi wielkiej przy ognisku, ognisko najniżej
  for (let i = 1; i <= N; i++) S.push(S[i - 1] + Math.hypot(E(T[i])[0] - E(T[i - 1])[0], E(T[i])[1] - E(T[i - 1])[1]));
  const obw = S[N], x0 = (200 - obw) / 2;
  const obraz = (i, q) => { // położenie punktu q elipsy, gdy prostej dotyka punkt o parametrze T[i] (toczenie bez poślizgu)
    const t = T[i], p = E(t), tx = -a * Math.sin(t), ty = b * Math.cos(t), L = Math.hypot(tx, ty), u = [tx / L, ty / L], n = [ty / L, -tx / L];
    const d = [q[0] - p[0], q[1] - p[1]];
    return [x0 + S[i] + (d[0] * u[0] + d[1] * u[1]), y0 - (d[0] * -n[0] + d[1] * -n[1])];
  };
  const F = [f, 0], slad = T.map((_, i) => obraz(i, F));
  const dol = slad.map((p) => [p[0], 2 * y0 - p[1]]);
  const out = [{ d: `M${fmt(x0 - 3)},${y0} L${fmt(x0 + obw + 3)},${y0}` }, { d: lamana(dol) }, { d: lamana(slad), gruba: true }];
  // pod osią: połówki przekrojów powierzchni obrotowej (undoloidu)
  for (let k = 1; k <= 5; k++) {
    const i = Math.round(N * k / 6), p = slad[i], h = y0 - p[1], w = 0.26 * h;
    out.push({ d: lamana(Array.from({ length: 33 }, (_, m) => { const s = PI * m / 32; return [p[0] + w * Math.cos(s), y0 + h * Math.sin(s)]; })) });
  }
  // trzy położenia elipsy nad osią
  [0.2, 0.5, 0.8].forEach((u, m) => {
    const i = Math.round(N * u), el = Array.from({ length: 120 }, (_, q) => obraz(i, E(2 * PI * q / 120)));
    out.push({ d: lamana(el, true), gruba: m === 1 });
    out.push({ d: kropka(obraz(i, F)), gruba: true });
  });
  const hs = slad.map((p) => y0 - p[1]);
  kontrola.toczenie = `a = ${a}, b = ${b}, obwód ${obw.toFixed(1)}; odległość ogniska od prostej: min ${Math.min(...hs).toFixed(2)} = a − c (${(a - f).toFixed(2)}), max ${Math.max(...hs).toFixed(2)} = a + c (${(a + f).toFixed(2)})`;
  return out;
}

/* 16. PTM: okręgi ściśle styczne spirali Eulera są zagnieżdżone (twierdzenie Taita–Knesera) */
function rysOkregi() {
  const M = 4000, sMax = 3.3, ds = sMax / M, kl = [[0, 0]]; let th = 0;
  for (let i = 1; i <= M; i++) { const s = (i - 0.5) * ds; th = s * s / 2; const q = kl[i - 1]; kl.push([q[0] + Math.cos(th) * ds, q[1] + Math.sin(th) * ds]); }
  const dane = [0.62, 1.0, 1.4, 1.8, 2.2, 2.6, 3.0].map((s) => {
    const i = Math.round(s / ds), a = s * s / 2, r = 1 / s, p = kl[i];
    return { s, p, r, c: [p[0] - Math.sin(a) * r, p[1] + Math.cos(a) * r] };
  });
  const wsz = dane.flatMap((d) => [[d.c[0] - d.r, d.c[1] - d.r], [d.c[0] + d.r, d.c[1] + d.r]]);
  const xs = wsz.map((p) => p[0]), ys = wsz.map((p) => p[1]);
  const sk = Math.min(172 / (Math.max(...xs) - Math.min(...xs)), 186 / (Math.max(...ys) - Math.min(...ys)));
  const sx = (Math.min(...xs) + Math.max(...xs)) / 2, sy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const P = (p) => [100 + sk * (p[0] - sx), 129 - sk * (p[1] - sy)];
  const i0 = Math.round(0.45 / ds), luk = kl.slice(i0).filter((_, i) => i % 8 === 0).map(P);
  const pole = luk.filter((p) => wPolu(p));
  const out = dane.map((d) => ({ d: lamana(okrag(P(d.c), d.r * sk, 160).slice(0, -1), true) }));
  out.push({ d: lamana(pole), gruba: true });
  dane.forEach((d) => out.push({ d: kropka(P(d.p)), gruba: true }));
  const zag = dane.every((d, i) => !i || Math.hypot(d.c[0] - dane[i - 1].c[0], d.c[1] - dane[i - 1].c[1]) < dane[i - 1].r - d.r);
  kontrola.okregi = `spirala Eulera, krzywizna = s; ${dane.length} okręgów; każdy leży wewnątrz poprzedniego (odległość środków < różnica promieni): ${zag}`;
  return out;
}

/* 17. Doktorat: dysk Poincarégo i teselacja Fareya; łuki to geodezyjne przestrzeni o stałej krzywiźnie ujemnej */
function rysPoincare() {
  const c = [100, 129], R = 84;
  const kat = (u) => PI / 2 - 2 * Math.atan(u.q === 0 ? Infinity : u.p / u.q); // wartość ∞ na górze dysku, 0 na dole
  const geod = (al, be) => {
    const d = Math.atan2(Math.sin(be - al), Math.cos(be - al));
    const A = [Math.cos(al), Math.sin(al)], B = [Math.cos(be), Math.sin(be)];
    if (Math.abs(Math.abs(d) - PI) < 1e-6) return [A, B].map((q) => [c[0] + R * q[0], c[1] - R * q[1]]);
    const sr = al + d / 2, r = Math.tan(Math.abs(d) / 2), C = [Math.cos(sr) / Math.cos(d / 2), Math.sin(sr) / Math.cos(d / 2)];
    const a0 = Math.atan2(A[1] - C[1], A[0] - C[0]), a1 = Math.atan2(B[1] - C[1], B[0] - C[0]);
    let da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
    const n = Math.max(12, Math.ceil(Math.abs(da) * 40));
    return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + da * i / n; return [c[0] + R * (C[0] + r * Math.cos(a)), c[1] - R * (C[1] + r * Math.sin(a))]; });
  };
  const krawedzie = [];
  const dodaj = (a, b, g) => { krawedzie.push([a, b, g]); };
  const rek = (a, b, g) => { // trójkąt nad krawędzią (a, b): mediant
    if (g === 0) return;
    const m = { p: a.p + b.p, q: a.q + b.q };
    dodaj(a, m, g); dodaj(m, b, g); rek(a, m, g - 1); rek(m, b, g - 1);
  };
  const O = { p: 0, q: 1 }, J = { p: 1, q: 1 }, N = { p: 1, q: 0 }, Jm = { p: -1, q: 1 }, Nm = { p: -1, q: 0 };
  dodaj(O, N, 9); dodaj(O, J, 9); dodaj(J, N, 9); dodaj(O, Jm, 9); dodaj(Jm, Nm, 9);
  rek(O, J, 3); rek(J, N, 3); rek(Jm, O, 3); rek(Nm, Jm, 3);
  const out = [{ d: lamana(okrag(c, R, 200).slice(0, -1), true) }];
  const gr = new Set(['0/1|1/0', '0/1|1/1', '1/1|1/0']);
  krawedzie.forEach(([a, b]) => {
    const kl = `${a.p}/${a.q}|${b.p}/${b.q}`;
    const pts = geod(kat(a), kat(b));
    if (Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 9) return;
    out.push({ d: lamana(pts, false, 0.2), gruba: gr.has(kl) });
  });
  const det = krawedzie.every(([a, b]) => Math.abs(a.p * b.q - a.q * b.p) === 1);
  kontrola.poincare = `${krawedzie.length} krawędzi Fareya; każda łączy p/q i r/s z |ps − qr| = 1: ${det}; łuki prostopadłe do brzegu (środek w sec(δ/2), promień tan(δ/2))`;
  return out;
}

/* 18. Wnuk Liego: grupa jednoparametrowa obrotów hiperbolicznych, orbity x² − y² = const i równe kroki parametru */
function rysLie1p() {
  const c = [100, 129], P = (x, y) => [c[0] + x, c[1] - y];
  const hip = (r, f) => Array.from({ length: 121 }, (_, i) => { const t = -3 + 6 * i / 120; return f(r * Math.cosh(t), r * Math.sinh(t)); });
  const out = [];
  out.push({ d: `M${pt(P(-84, -84))} L${pt(P(84, 84))}` }, { d: `M${pt(P(-84, 84))} L${pt(P(84, -84))}` });
  [24, 42, 62].forEach((r) => {
    [(a, b) => P(a, b), (a, b) => P(-a, b), (a, b) => P(b, a), (a, b) => P(b, -a)].forEach((f, m) => {
      const g = r === 42 && m === 0;
      przytnij(hip(r, f), 1).forEach((k) => out.push({ d: lamana(k), gruba: g }));
    });
  });
  const r0 = 42, krok = 0.46, zb = [];
  for (let k = -2; k <= 2; k++) {
    const t = k * krok, p = P(r0 * Math.cosh(t), r0 * Math.sinh(t));
    zb.push(p); out.push({ d: kropka(p), gruba: true });
  }
  const nien = zb.map((_, k) => { const t = (k - 2) * krok, x = r0 * Math.cosh(t), y = r0 * Math.sinh(t); return x * x - y * y; });
  kontrola.lie1p = `punkty φ_t(r, 0), t = k · ${krok}: x² − y² = ${nien.map((v) => v.toFixed(0)).join(', ')} (stałe na orbicie = ${r0 * r0}); φ_s ∘ φ_t = φ_{s+t}`;
  return out;
}

/* 19. Geometria grawitacji: orbita w polu Schwarzschilda, równanie Bineta u'' + u = 1/p + 3μu² (RK4), μ dobrane przesadnie duże */
function rysPeryhelium() {
  const p0 = 1, e = 0.5, mu = 0.018, h = 0.002, f = (u) => 1 / p0 + 3 * mu * u * u - u;
  const c = [100, 129];
  let u = (1 + e) / p0, v = 0, phi = 0, poprz = v;
  const bieg = [[1 / u, 0]], peri = [0], nrOd = [];
  const obr = 7;
  while (peri.length <= obr) {
    const k1u = v, k1v = f(u), k2u = v + h * k1v / 2, k2v = f(u + h * k1u / 2), k3u = v + h * k2v / 2, k3v = f(u + h * k2u / 2), k4u = v + h * k3v, k4v = f(u + h * k3u);
    u += h * (k1u + 2 * k2u + 2 * k3u + k4u) / 6; v += h * (k1v + 2 * k2v + 2 * k3v + k4v) / 6; phi += h;
    if (Math.round(phi / h) % 5 === 0) bieg.push([1 / u, phi]);
    if (poprz > 0 && v <= 0) { peri.push(phi); nrOd.push(bieg.length - 1); }
    poprz = v;
  }
  const rMax = Math.max(...bieg.map((q) => q[0])), skala = 84 / rMax;
  const Q = (q) => [c[0] + skala * q[0] * Math.cos(q[1]), c[1] - skala * q[0] * Math.sin(q[1])];
  const pts = bieg.map(Q), rP = 1 / ((1 + e) / p0);
  const out = [{ d: lamana(pts.slice(nrOd[0]), false, 0.12) }, { d: lamana(pts.slice(0, nrOd[0] + 1), false, 0.12), gruba: true }];
  peri.forEach((a) => out.push({ d: `M${pt(c)} L${pt(Q([rP, a]))}` }));
  out.push({ d: kropka(c), gruba: true });
  const dph = peri[1] - peri[0] - 2 * PI;
  kontrola.peryhelium = `μ/p = ${mu}, e = ${e}: przesunięcie peryhelium ${(dph * 180 / PI).toFixed(1)}° na obieg (przybliżenie 6πμ/p = ${(6 * PI * mu * 180 / PI).toFixed(1)}°; dla Merkurego μ/p ≈ 2,7·10⁻⁸); ${obr} obiegów`;
  return out;
}

/* 20. Nagroda: linie krzywizny elipsoidy trójosiowej (przecięcia z konfokalnymi kwadrykami) i punkty kuliste */
function rysElipsoida() {
  const a = 1, b = 0.76, c0 = 0.52, a2 = a * a, b2 = b * b, c2 = c0 * c0;
  // obrót: oś widzenia v, rzut prostokątny
  const al = 0.62, be = 0.42, ce = 0.28;
  const Rz = (p, t) => [p[0] * Math.cos(t) - p[1] * Math.sin(t), p[0] * Math.sin(t) + p[1] * Math.cos(t), p[2]];
  const Rx = (p, t) => [p[0], p[1] * Math.cos(t) - p[2] * Math.sin(t), p[1] * Math.sin(t) + p[2] * Math.cos(t)];
  const Ry = (p, t) => [p[0] * Math.cos(t) + p[2] * Math.sin(t), p[1], -p[0] * Math.sin(t) + p[2] * Math.cos(t)];
  const obr = (p) => Rx(Ry(Rz(p, ce), al), be); // po obrocie patrzymy wzdłuż osi z
  const skala = 84, sr = [100, 129], rz = (q) => { const r = obr(q); return [sr[0] + skala * r[0], sr[1] - skala * r[1]]; };
  const widoczny = (q) => obr([q[0] / a2, q[1] / b2, q[2] / c2])[2] > 0;
  const kawalki = (f) => { // krzywa zamknięta τ ↦ f(τ), tylko część widoczna
    const n = 240, wyn = []; let cur = [];
    const start = (() => { for (let i = 0; i < n; i++) if (!widoczny(f(2 * PI * i / n))) return i; return 0; })();
    for (let i = 0; i <= n; i++) {
      const q = f(2 * PI * (start + i) / n);
      if (widoczny(q)) cur.push(rz(q)); else { if (cur.length > 2) wyn.push(cur); cur = []; }
    }
    if (cur.length > 2) wyn.push(cur);
    return wyn.filter((k) => dlug(k) >= 8);
  };
  const out = [];
  // kontur: u na okręgu wielkim prostopadłym do D⁻¹ v
  const v = (() => { let w = [0, 0, 1]; const rI = (p) => { const q1 = Rx(p, -be), q2 = Ry(q1, -al); return Rz(q2, -ce); }; return rI(w); })();
  const w = [v[0] / a, v[1] / b, v[2] / c0], Lw = Math.hypot(...w), wn = w.map((x) => x / Lw);
  const e1 = (() => { const t = Math.abs(wn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; const d = t[0] * wn[0] + t[1] * wn[1] + t[2] * wn[2]; const x = [t[0] - d * wn[0], t[1] - d * wn[1], t[2] - d * wn[2]], L = Math.hypot(...x); return x.map((y) => y / L); })();
  const e2 = [wn[1] * e1[2] - wn[2] * e1[1], wn[2] * e1[0] - wn[0] * e1[2], wn[0] * e1[1] - wn[1] * e1[0]];
  const kontur = Array.from({ length: 200 }, (_, i) => { const t = 2 * PI * i / 200, u = [0, 1, 2].map((k) => Math.cos(t) * e1[k] + Math.sin(t) * e2[k]); return rz([a * u[0], b * u[1], c0 * u[2]]); });
  out.push({ d: lamana(kontur, true), gruba: true });
  // rodzina λ = const (c² < λ < b²): krzywe wokół osi z
  const lam = [0.12, 0.3, 0.5, 0.72, 0.9].map((u) => c2 + (b2 - c2) * u);
  lam.forEach((la, i) => [1, -1].forEach((sg) => {
    const f = (t) => { const s = Math.sin(t), mu2 = b2 + (a2 - b2) * s * s; return [a * Math.sqrt((a2 - la) / (a2 - c2)) * Math.cos(t), b * Math.sqrt((b2 - la) / (b2 - c2)) * s, sg * c0 * Math.sqrt((la - c2) * (mu2 - c2) / ((a2 - c2) * (b2 - c2)))]; };
    kawalki(f).forEach((k) => out.push({ d: lamana(k, false, 0.2) }));
  }));
  // rodzina μ = const (b² < μ < a²): krzywe wokół osi x
  const mu = [0.12, 0.3, 0.5, 0.72, 0.9].map((u) => b2 + (a2 - b2) * u);
  mu.forEach((m, i) => [1, -1].forEach((sg) => {
    const f = (t) => { const s = Math.sin(t), la = c2 + (b2 - c2) * s * s; return [sg * a * Math.sqrt((a2 - m) * (a2 - la) / ((a2 - b2) * (a2 - c2))), b * Math.sqrt((m - b2) / (a2 - b2)) * Math.cos(t), c0 * Math.sqrt((m - c2) / (a2 - c2)) * s]; };
    kawalki(f).forEach((k) => out.push({ d: lamana(k, false, 0.2) }));
  }));
  // punkty kuliste (umbiliki): y = 0
  const ux = a * Math.sqrt((a2 - b2) / (a2 - c2)), uz = c0 * Math.sqrt((b2 - c2) / (a2 - c2));
  const umb = [[ux, 0, uz], [ux, 0, -uz], [-ux, 0, uz], [-ux, 0, -uz]].filter(widoczny);
  umb.forEach((q) => out.push({ d: kropka(rz(q)), gruba: true }));
  // kontrola: punkt z rodziny leży na elipsoidzie
  const q = (() => { const la = lam[1], t = 0.7, s = Math.sin(t), mu2 = b2 + (a2 - b2) * s * s; return [a * Math.sqrt((a2 - la) / (a2 - c2)) * Math.cos(t), b * Math.sqrt((b2 - la) / (b2 - c2)) * s, c0 * Math.sqrt((la - c2) * (mu2 - c2) / ((a2 - c2) * (b2 - c2)))]; })();
  kontrola.elipsoida = `półosie ${a}, ${b}, ${c0}; x²/a² + y²/b² + z²/c² = ${(q[0] * q[0] / a2 + q[1] * q[1] / b2 + q[2] * q[2] / c2).toFixed(6)}; widocznych punktów kulistych: ${umb.length} z 4`;
  return out;
}

/* 21. Pionier elektryki: prąd trójfazowy, wskazy co 120° i trzy sinusoidy; suma w każdej chwili = 0 */
function rysTrojfaza() {
  const c = [100, 78], R = 40, y0 = 172, A = 42, x0 = 18, x1 = 182, t0 = 2 * PI + 0.95;
  const wsk = (k) => { const a = t0 - 2 * PI * k / 3; return [Math.cos(a), Math.sin(a)]; };
  const out = [{ d: lamana(okrag(c, R, 120).slice(0, -1), true) }];
  [0, 1, 2].forEach((k) => {
    const w = wsk(k), u = [w[0], -w[1]];
    out.push({ d: strzalka(c, u, R, 8), gruba: k === 0 });
  });
  out.push({ d: `M${x0},${y0} L${x1},${y0}` });
  const X = (t) => x0 + (x1 - x0) * t / (4 * PI);
  [1, 2, 0].forEach((k) => {
    const p = Array.from({ length: 201 }, (_, i) => { const t = 4 * PI * i / 200; return [X(t), y0 - A * Math.sin(t - 2 * PI * k / 3)]; });
    out.push({ d: lamana(p), gruba: k === 0 });
  });
  const xt = X(t0);
  out.push({ d: `M${fmt(xt)},${fmt(y0 - A - 5)} L${fmt(xt)},${fmt(y0 + A + 5)}` });
  const wart = [0, 1, 2].map((k) => Math.sin(t0 - 2 * PI * k / 3));
  wart.forEach((v, k) => out.push({ d: kropka([xt, y0 - A * v]), gruba: k === 0 }));
  kontrola.trojfaza = `sinusoidy przesunięte o 120°; suma wartości w chwili t₀: ${wart.reduce((s, v) => s + v, 0).toFixed(12)}`;
  return out;
}

/* 22. Monografia Yano: przepływ konforemny (hiperboliczne przekształcenie Möbiusa): okręgi przez dwa punkty i prostopadłe okręgi Apoloniusza */
function rysApollo() {
  const c = [100, 129], d = 62, F1 = [c[0], c[1] - d], F2 = [c[0], c[1] + d], out = [];
  const plaski = (pk) => przytnij(pk, 0).forEach((k) => out.push({ d: lamana(k) }));
  [[17, -1], [62, 1], [62, -1], [150, 1], [150, -1]].forEach(([h, s]) => plaski(okrag([c[0] + s * h, c[1]], Math.hypot(h, d), 500))); // linie przepływu: okręgi przez F1 i F2
  [14, 30, 52].forEach((r) => [1, -1].forEach((s) => plaski(okrag([c[0], c[1] + s * Math.hypot(d, r)], r, 300)))); // okręgi Apoloniusza
  out.push({ d: `M${POLE.x0},${c[1]} L${POLE.x1},${c[1]}` }, { d: `M${pt(F1)} L${pt(F2)}` });
  const h0 = 17, r0 = Math.hypot(h0, d), a1 = Math.atan2(F1[1] - c[1], F1[0] - (c[0] + h0)), a2 = Math.atan2(F2[1] - c[1], F2[0] - (c[0] + h0));
  let da = a2 - a1; if (da < 0) da += 2 * PI; // od F1 do F2 przez prawą stronę
  const prawa = Array.from({ length: 161 }, (_, i) => { const a = a1 + da * i / 160; return [c[0] + h0 + r0 * Math.cos(a), c[1] + r0 * Math.sin(a)]; });
  out.push({ d: lamana(prawa), gruba: true });
  [0.3, 0.52, 0.74].forEach((u) => { const i = Math.round(160 * u); out.push({ d: grot(prawa[i], jedn(prawa[i - 1], prawa[i + 1]), 8), gruba: true }); });
  out.push({ d: kropka(F1), gruba: true }, { d: kropka(F2), gruba: true });
  const h = 62, r = 30, c1 = [c[0] + h, c[1]], c2 = [c[0], c[1] + Math.hypot(d, r)], dd = (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2, rr = Math.hypot(h, d) ** 2 + r * r;
  kontrola.apollo = `prostopadłość rodzin: |c₁ − c₂|² = ${dd.toFixed(3)}, r₁² + r₂² = ${rr.toFixed(3)}`;
  return out;
}

/* 23. Cartan: pętla przeniesiona przepływem; pas między pętlami realizuje wzór L_X = d i_X + i_X d (Stokes) */
function rysCartan() {
  const s0 = [80, 136], al = 0.1, T = 2.1;
  // przepływ spiralny wokół s0 (na ekranie przeciwnie do ruchu wskazówek zegara)
  const fl = (p, t) => { const e = Math.exp(al * t), co = Math.cos(t), si = Math.sin(t), x = p[0] - s0[0], y = p[1] - s0[1]; return [s0[0] + e * (co * x + si * y), s0[1] + e * (-si * x + co * y)]; };
  const start = (a) => { const r = 23 * (1 + 0.2 * Math.cos(2 * a + 0.5) + 0.1 * Math.sin(3 * a)); return [s0[0] + 36 + r * 1.15 * Math.cos(a), s0[1] + 42 + r * Math.sin(a)]; };
  const n = 160, Pet0 = Array.from({ length: n }, (_, i) => start(2 * PI * i / n));
  const Pet1 = Pet0.map((p) => fl(p, T)), Pol = Pet0.map((p) => fl(p, T / 2));
  const out = [{ d: lamana(Pet0, true) }, { d: lamana(Pol, true) }, { d: lamana(Pet1, true), gruba: true }];
  const ile = 16;
  for (let k = 0; k < ile; k++) {
    const q = start(2 * PI * k / ile);
    out.push({ d: lamana(Array.from({ length: 61 }, (_, i) => fl(q, T * i / 60)), false, 0.2) });
  }
  [0.4, 3.5].forEach((a) => { const z = start(a); out.push({ d: grot(fl(z, T), jedn(fl(z, T - 0.03), fl(z, T)), 8), gruba: true }); });
  kontrola.cartan = `przepływ spiralny, t ∈ [0, ${T}]; pole pętli: ${poleWiel(Pet0).toFixed(0)} → ${poleWiel(Pet1).toFixed(0)} (stosunek ${(poleWiel(Pet1) / poleWiel(Pet0)).toFixed(3)}, e^{2·${al}·${T}} = ${Math.exp(2 * al * T).toFixed(3)})`;
  return out;
}

/* 24. Spinory: wstęga Möbiusa. Jej brzeg to jedna krzywa, a pełny obieg odwraca normalną (analogia: spinor po obrocie o 360° zmienia znak) */
function rysMobius() {
  const W = 0.46, R0 = 1, skala = 57, c = [100, 129];
  const F = (u, w) => { const r = R0 + w * Math.cos(u / 2); return [r * Math.cos(u), r * Math.sin(u), w * Math.sin(u / 2)]; };
  const ax = -1.02, az = 0.35;
  const obr = (p) => { const x = p[0] * Math.cos(az) - p[1] * Math.sin(az), y = p[0] * Math.sin(az) + p[1] * Math.cos(az), z = p[2]; return [x, y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)]; };
  const P = (p) => { const r = obr(p); return [c[0] + skala * r[0], c[1] - skala * r[1]]; };
  const out = [];
  const ile = 34;
  for (let k = 0; k < ile; k++) { const u = 2 * PI * k / ile; out.push({ d: `M${pt(P(F(u, -W)))} L${pt(P(F(u, W)))}` }); }
  out.push({ d: lamana(Array.from({ length: 240 }, (_, i) => P(F(2 * PI * i / 240, 0))), true) });
  const brzeg = Array.from({ length: 480 }, (_, i) => P(F(4 * PI * i / 480, W)));
  out.push({ d: lamana(brzeg, true), gruba: true });
  // kontrola: F(u + 2π, w) = F(u, −w), więc po jednym obiegu „góra” staje się „dołem”
  const a = F(0.7 + 2 * PI, W), b = F(0.7, -W);
  kontrola.mobius = `F(u + 2π, w) = F(u, −w): różnica ${Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]).toExponential(1)}; brzeg to jedna krzywa zamknięta o parametrze u ∈ [0, 4π]`;
  return out;
}

/* 25. Tom 26: pole Killinga na sferze; długość wektora rośnie z odległością od osi, a przepływ jest izometrią */
function rysIzometrie() {
  const c = [100, 134], R = 84, tilt = 0.42;
  const P3 = (la, fi) => { const x = Math.cos(la) * Math.cos(fi), y = Math.cos(la) * Math.sin(fi), z = Math.sin(la); return [x, y * Math.sin(tilt) + z * Math.cos(tilt), -y * Math.cos(tilt) + z * Math.sin(tilt)]; }; // (x, pion, głębia)
  const S = (p) => [c[0] + R * p[0], c[1] - R * p[1]];
  const out = [{ d: lamana(okrag(c, R, 200).slice(0, -1), true) }];
  const kawalki = (f, a0, a1, n = 240) => { const wyn = []; let cur = []; for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n, p = f(t); if (p[2] > 0.0) cur.push(S(p)); else { if (cur.length > 2) wyn.push(cur); cur = []; } } if (cur.length > 2) wyn.push(cur); return wyn; };
  // południki
  for (let k = 0; k < 8; k++) { const fi = -PI / 2 + PI / 8 + k * 2 * PI / 8; kawalki((t) => P3(t, fi), -PI / 2, PI / 2).forEach((q) => out.push({ d: lamana(q) })); }
  // równoleżniki; pogrubiony: równoleżnik 0°... przepływ
  const szer = [-40, -20, 0, 20, 40, 60].map((d) => d * PI / 180);
  szer.forEach((la) => {
    const g = Math.abs(la - 20 * PI / 180) < 1e-9;
    const f = (t) => P3(la, t);
    // start w punkcie niewidocznym, by nie przecinać łuku
    kawalki(f, PI / 2, PI / 2 + 2 * PI).forEach((q) => out.push({ d: lamana(q), gruba: g }));
    // grot na równoleżniku: strzałka w kierunku rosnącego φ, długość ∝ cos φ
    [-PI / 2 - 0.9, -PI / 2, -PI / 2 + 0.9].forEach((t0) => {
      const p = f(t0), q = f(t0 + 0.2);
      if (p[2] > 0.05 && q[2] > 0.05 && Math.abs(la) < 0.75) out.push({ d: grot(S(q), jedn(S(p), S(q)), 6.5), gruba: g });
    });
  });
  const biegun = P3(PI / 2, 0);
  out.push({ d: `M${pt(S(biegun))} L${pt([S(biegun)[0], S(biegun)[1] - 22])}`, gruba: true });
  out.push({ d: kropka(S(biegun)), gruba: true });
  kontrola.izometrie = `pole V = ∂/∂φ (obrót wokół osi): |V| = cos(szerokość), L_V g = 0; widoczna tylko przednia półkula, oś nachylona o ${(tilt * 180 / PI).toFixed(0)}°`;
  return out;
}

/* ---------------- dane ---------------- */
const Z = {
  mactutor: 'https://mathshistory.st-andrews.ac.uk/Biographies/Slebodzinski/',
  trautman: 'https://users.fuw.edu.pl/~amt/4Krupka.pdf',
  grg: 'https://link.springer.com/article/10.1007/s10714-010-1057-6',
  grgNota: 'https://link.springer.com/article/10.1007/s10714-010-1056-7',
  eomLie: 'https://encyclopediaofmath.org/wiki/Lie_differentiation',
  wikiLie: 'https://en.wikipedia.org/wiki/Lie_derivative',
  wikiSleb: 'https://en.wikipedia.org/wiki/W%C5%82adys%C5%82aw_%C5%9Alebodzi%C5%84ski',
  dudaWeron: 'https://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-bc45390f-a74e-48aa-80c4-7d6fec3d7108/c/WiadMat_2006_1_6.pdf',
  pwrSite: 'https://sites.google.com/pwr.edu.pl/slebodzinski/',
  pwrWeny: 'https://weny.pwr.edu.pl/fcp/zGBUKOQtTKlQhbx08SlkTUAxQX2o8DAoHNiwFE1xVSX1RFVZpCFghUHcKVigEQUw/38/public/o_wydziale/profil_wydzialu/pionierzy/wladyslaw-slebodzinski.pdf',
  genealogy: 'https://mathgenealogy.org/id.php?id=157629'
};
const DANE = [
  {
    id: 'pochodna-liego', rys: rysLie,
    nazwa: 'Pochodna Liego', rok: '1931',
    zdanie: 'Jako pierwszy podał ogólny wzór na zmianę pola tensorów niesionego przepływem pola wektorów.',
    notka: 'Operator pojawił się w pracy „Sur les équations canoniques de Hamilton” (Bull. Cl. Sci. Acad. Roy. Belgique (5) 17, 1931, s. 864–870): Ślebodziński podał jawny wzór dla pola tensorowego dowolnej walencji, regułę Leibniza i przemienność z kontrakcją, ale operatora nie nazwał. J. A. Schouten w „Ricci-Calculus” (1954) cytuje tę pracę jako pierwszą o różniczkowaniu Liego, a w 2010 r. przełożono ją na angielski i przedrukowano w Gen. Relativ. Gravit. (seria „Golden Oldies”) z notą A. Trautmana. Rysunek (poprawiony obecny znak): przepływ liniowego pola wektorów (spirale) i wektor niesiony tym przepływem, rysowany w kolejnych chwilach na jednej spirali; pole tak przeniesione ma pochodną Liego równą zeru.',
    rodzaj: 'pojęcie', pewnosc: 'pewne',
    zrodla: [Z.trautman, Z.grg, Z.mactutor, Z.eomLie, Z.wikiLie],
    podstrona: 'Sukcesy',
    dlaczego_tu: 'Największy sukces patrona: pojęcie z jego pracy jest dziś w każdym podręczniku geometrii różniczkowej i fizyki teoretycznej.'
  },
  {
    id: 'nazwa-van-dantzig', rys: rysDantzig,
    nazwa: 'Skąd nazwa „pochodna Liego”', rok: '1932',
    zdanie: 'Nazwę nadał jej w 1932 r. David van Dantzig, zaznaczając, że operator pierwszy wprowadził Ślebodziński.',
    notka: 'D. van Dantzig, „Zur allgemeinen projektiven Differentialgeometrie”, Proc. Roy. Acad. Amsterdam 35 (1932), s. 524–542; w przypisie na s. 536 pisze: „Der Operator wurde zum ersten Mal von W. Ślebodziński eingeführt” i nazywa go „Liesche Ableitung”. Van Dantzig dodał interpretację przez „przeciąganie” obiektu wzdłuż przepływu pola (dragging along), która jest dziś standardową definicją (Trautman 2008). Rysunek: przepływ wirowy, w którym wnętrze obraca się szybciej; mała kratka przeciągana przez przepływ (trzy chwile) wygina się i wydłuża, a pochodna Liego mierzy właśnie taką zmianę. Ilustracja jest nasza, nie z pracy van Dantziga.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.trautman, Z.mactutor, Z.wikiLie],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: pasowałoby do Sukcesów albo Publikacji (cudze uznanie pierwszeństwa patrona).'
  },
  {
    id: 'hamilton-1931', rys: rysHamilton,
    nazwa: 'Równania Hamiltona', rok: '1931',
    zdanie: 'Pokazał, że ruch według równań Hamiltona zachowuje formę symplektyczną (na płaszczyźnie: pole figur).',
    notka: 'Praca z 1931 r. dotyczyła mechaniki: dla pola Hamiltona X_H Ślebodziński wprowadził formę symplektyczną A = Σ dq∧dp i dwuwektor Poissona B i pokazał, że ich pochodne Liego wzdłuż X_H znikają; uogólnił tak wyniki Th. De Dondera o niezmiennikach całkowych (Trautman 2008). Samo zachowanie objętości fazowej (Liouville, niezmienniki całkowe Poincarégo) znano wcześniej; nowe było ujęcie przez nowy operator. W wymiarze 2 forma symplektyczna to po prostu pole, w wyższych wymiarach suma pól rzutów na płaszczyzny (q, p). Rysunek: portret fazowy wahadła (poziomice energii) i koło warunków początkowych przeniesione przepływem (RK4): rozciąga się w sierp, a pole się nie zmienia (sprawdzone w generator.js).',
    rodzaj: 'twierdzenie', pewnosc: 'pewne',
    zrodla: [Z.trautman, Z.grg, 'https://en.wikipedia.org/wiki/Liouville%27s_theorem_(Hamiltonian)'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: geometria w służbie fizyki; mogłoby pójść do Publikacji albo Projektów (zastosowania).'
  },
  {
    id: 'nawias-liego', rys: rysNawias,
    nazwa: 'Pochodna pola wektorów', rok: '1931',
    zdanie: 'Dla pól wektorów pochodna Liego to nawias Liego: mierzy, o ile obieg czterema przepływami mija start.',
    notka: 'Wzór Ślebodzińskiego z 1931 r. zastosowany do pola wektorów Y daje L_X Y = [X, Y], czyli nawias, który wprowadził sam Sophus Lie w XIX w.; nawias nie jest więc wynikiem Ślebodzińskiego, tylko szczególnym przypadkiem jego operatora (rok w polu „rok” dotyczy wzoru ogólnego). Geometrycznie: idąc przepływem X, potem Y, potem wstecz X i wstecz Y, na ogół nie wracamy do startu; luka jest w przybliżeniu iloczynem czasów razy nawias. Rysunek: X to obrót wokół punktu (łuki), Y to przesunięcie w poziomie; czworobok z łuków i odcinków się nie domyka, a cienka strzałka przez lukę (policzoną dokładnie) wskazuje kierunek nawiasu.',
    rodzaj: 'pojęcie', pewnosc: 'pewne',
    zrodla: ['https://en.wikipedia.org/wiki/Lie_bracket_of_vector_fields', Z.wikiLie, Z.trautman],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: ilustracja zaproponowana w zleceniu; pasuje wszędzie, gdzie potrzebny drugi motyw pochodnej Liego.'
  },
  {
    id: 'zjazd-lwow-1927', rys: rysFlamm,
    nazwa: 'Zjazd matematyków we Lwowie', rok: '1927',
    zdanie: 'Na I Polskim Zjeździe Matematycznym współprowadził sekcję geometrii i wygłosił trzy referaty.',
    notka: 'Zjazd odbył się we Lwowie 7–10 września 1927 r. (ok. 200 uczestników). Ślebodziński, wtedy profesor Szkoły Budowy Maszyn w Poznaniu, był jednym z trzech przewodniczących sekcji geometrii (z Garlickim i Hoborskim). Według Księgi pamiątkowej zjazdu wygłosił referaty „O nadpowierzchniach czterowymiarowej przestrzeni euklidesowej”, „Rozwój geometrji różniczkowej w ostatniem dziesięcioleciu” i „Kilka własności grawitacyjnego pola statycznego”. Rysunek jest związany, ale nie jego: paraboloida Flamma (1916), która pokazuje geometrię przestrzeni wokół masy w rozwiązaniu Schwarzschilda; Ślebodziński pisał o geometrii statycznego pola grawitacji (Prace Mat.-Fiz. 34, 1926, s. 91–118).',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: ['https://100latptm.matinf.uj.edu.pl/images/Izjazd1927/ksiega_pamiatkowa_pierwszego_polskiego_zjazdu_matematycznego.pdf', 'https://mathshistory.st-andrews.ac.uk/HistTopics/Polish_Congresses/', Z.mactutor, 'https://eudml.org/doc/215456', 'https://en.wikipedia.org/wiki/Schwarzschild_metric'],
    podstrona: 'Konferencje',
    dlaczego_tu: 'Zjazd, sekcja i trzy referaty: konferencyjny komplet sprzed niemal stu lat.'
  },
  {
    id: 'seminarium-1948', rys: rysSfera,
    nazwa: 'Seminarium geometrii różniczkowej', rok: '1948',
    zdanie: 'Jego seminarium, działające od wiosny 1948 r., uczyniło Wrocław obok Krakowa ośrodkiem geometrii różniczkowej.',
    notka: 'Według R. Dudy i A. Werona („Wrocławska szkoła matematyczna”, Wiad. Mat. 42, 2006) seminarium z geometrii różniczkowej ruszyło wczesną wiosną 1948 r. i wyniosło Wrocław do grona dwóch (obok Krakowa) polskich ośrodków tej dziedziny. MacTutor wspomina dwa seminaria Ślebodzińskiego: z geometrii różniczkowej i z przestrzeni Riemanna o krzywiźnie rekurencyjnej; o przestrzeniach rekurencyjnych był doktorat jego ucznia W. Rotera (1963). Rysunek (standardowa ilustracja, nie wynik patrona): przeniesienie równoległe wektora wzdłuż trójkąta sferycznego o trzech kątach prostych; wektor wraca obrócony o 90°, bo trójkąt zajmuje ósmą część sfery. Tak krzywizna ujawnia się w przeniesieniu równoległym.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.dudaWeron, Z.mactutor, 'https://en.wikipedia.org/wiki/Witold_Roter', 'https://www3.nd.edu/~lnicolae/GradStudSemFall2003.pdf'],
    podstrona: 'Seminaria',
    dlaczego_tu: 'Seminarium patrona dało początek wrocławskiej geometrii różniczkowej.'
  },
  {
    id: 'wyklady-1946', rys: rysEwoluta,
    nazwa: 'Wykłady specjalne z geometrii', rok: '1946',
    zdanie: 'W 1946 r. zaczął wykłady wprowadzające młodych w geometrię różniczkową, prawie nieznaną w przedwojennej Polsce.',
    notka: 'Duda i Weron (Wiad. Mat. 42, 2006) piszą, że w 1946 r. rozpoczął się cykl wykładów specjalnych Ślebodzińskiego, które miały przygotować adeptów do geometrii różniczkowej, „niemal nieznanej w przedwojennej Polsce”; dwa lata później ruszyło jego seminarium. Wykłady dla studentów zaczął już pod koniec listopada 1945 r. (strona Wydziału Elektrycznego PWr). Rysunek: elipsa i jej normalne, których obwiednią jest ewoluta (krzywa środków krzywizny), oraz okrąg ściśle styczny w wierzchołku; to pierwsza lekcja geometrii różniczkowej krzywych.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.dudaWeron, Z.pwrWeny, 'https://en.wikipedia.org/wiki/Evolute'],
    podstrona: 'Szkoła doktorska',
    dlaczego_tu: 'Wykłady przygotowujące młodych do badań: praprzodek dzisiejszej szkoły doktorskiej.'
  },
  {
    id: 'jedenastu-doktorow', rys: rysWezel,
    nazwa: 'Jedenastu doktorów', rok: '1947–1971',
    zdanie: 'Wypromował jedenastu doktorów; ostatnia, Hanna Matuszczyk, uzyskała doktorat w 1971 r., gdy miał 87 lat.',
    notka: 'Mathematics Genealogy Project wymienia 11 doktoratów: S. Drobot (1947), A. Goetz (1957), R. Krasnodębski (1960), T. Huskowski (1961), H. Boroch (1962), W. Roter (1963), M. Rochowski (1964), S. Fudali i M. Kłeczek (1967), E. Dornfeld (1969), H. Matuszczyk (1971). Według MacTutor osiem z nich powstało po jego przejściu na emeryturę w 1960 r., a ostatni doktorat nadano 10 listopada 1971 r.; liczbę 11 podaje też strona PWr. W 1982 r. H. Matuszczyk ogłosiła w Colloquium Mathematicum pracę „On the formula of Ślebodziński for Lie derivative of tensor fields in a differential space”. Rysunek: węzeł niestabilny pola wektorów, z którego wychodzi jedenaście krzywych całkowych.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.genealogy, Z.mactutor, Z.pwrSite, 'https://www.impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum/all/46/2/103637/on-the-formula-of-slebodzinski-for-lie-derivative-of-tensor-fields-in-a-differential-space'],
    podstrona: 'Obrony doktorskie',
    dlaczego_tu: 'Promotor, który bronił doktorantów do końca życia; jedenaście obron rozchodzi się jak krzywe całkowe z jednego punktu.'
  },
  {
    id: 'formes-exterieures', rys: rysForma,
    nazwa: 'Formes extérieures', rok: '1954',
    zdanie: 'Napisał dwutomową monografię o formach zewnętrznych (1954 i 1963), w 1970 r. wydaną po angielsku.',
    notka: '„Formes extérieures et leurs applications”, t. I (Monografie Matematyczne 31, PWN, Warszawa 1954, vi + 154 s.; recenzował ją W. V. D. Hodge w Mathematical Gazette 1956), t. II (Monografie Matematyczne 40, 1963, 271 s.). Tom I ma m.in. rozdział o grupie i przestrzeni symplektycznej. Angielski przekład „Exterior forms and their applications” (Monografie Matematyczne 52, 1970, 427 s.) przygotował jego uczeń Abraham Goetz. Rozbieżność: Duda i Weron (Wiad. Mat. 2006) podają dla t. I rok 1955, a EuDML, katalogi bibliotek i tytuł recenzji Hodge’a podają 1954. Rysunek: forma dθ narysowana jako warstwice (promienie); całka po pętli liczy przecięcia: wokół środka daje pełny obrót, obok daje zero (forma zamknięta, ale nie dokładna).',
    rodzaj: 'historia', pewnosc: 'do sprawdzenia',
    zrodla: ['https://eudml.org/doc/219344', 'https://www.cambridge.org/core/journals/mathematical-gazette/article/abs/formes-exterieures-et-leurs-applications-i-by-w-slebodzinski-pp-vi-154-1954-monografie-matematyczne-31-warsaw/E0264A98EE962E91CE3F899D136708A2', 'https://lmbp.uca.fr/biblio/notice.php?num=6144', 'https://lmbp.uca.fr/biblio/notice.php?num=6146', 'https://ersearch2.cvtisr.sk/vufind/Record/192874/Details', Z.dudaWeron],
    podstrona: 'Publikacje',
    dlaczego_tu: 'Najważniejsza książka patrona, w dwóch tomach i w przekładzie ucznia.'
  },
  {
    id: 'zespol-impan-1956', rys: rysSiatka,
    nazwa: 'Zespół geometrii w IM PAN', rok: '1956',
    zdanie: 'Kierował zespołem geometrii w IM PAN; w 1956 r. zbadał, kiedy dwie formy różniczkowe stopnia 2 są równoważne.',
    notka: 'Strona Wydziału Elektrycznego PWr: „Stworzył także zespół geometrii różniczkowej w Instytucie Matematycznym PAN i był jego kierownikiem” (wg angielskiej Wikipedii pracował w IM PAN w latach 1949–1960). W serii IM PAN „Rozprawy Matematyczne” ogłosił m.in. „Géométrie textile et les espaces à connexion affine” (t. 3, 1953) i „Sur l’équivalence des formes différentielles extérieures du second degré” (t. 11, 1956, 32 s.); Duda i Weron nazywają rozwiązanie tego zagadnienia równoważności jednym z jego najważniejszych osiągnięć. Treści pracy nie sprawdzaliśmy w oryginale. Rysunek: ta sama forma pola w dwóch układach współrzędnych; krzywoliniowa siatka (obraz kratki przez dwa ścinania) ma wszystkie oczka o równym polu, co sprawdza generator.js. To ilustracja pojęcia równoważności, nie treści pracy.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.pwrWeny, Z.wikiSleb, 'https://oeaw.ac.at/resources/Record/990001927810504498', 'https://oeaw.ac.at/resources/Record/990001927720504498', Z.dudaWeron],
    podstrona: 'Projekty i granty',
    dlaczego_tu: 'Zespół badawczy z własnym programem: tak wyglądał projekt w latach 50., zanim pojawiły się granty.'
  },
  {
    id: 'geometria-tkanin-1945', rys: rysTkanina,
    nazwa: 'Referat o geometrii tkanin', rok: '1945',
    zdanie: '20 października 1945 r., na zebraniu założycielskim wrocławskiego oddziału PTM, mówił o geometrii tkanin.',
    notka: 'Na posiedzeniu organizacyjnym Oddziału Wrocławskiego PTM 20 października 1945 r. wygłoszono dwa referaty naukowe: E. Marczewskiego i W. Ślebodzińskiego; prezesem oddziału został H. Steinhaus, wiceprezesem Ślebodziński (Duda, Weron 2006). Strona PWr poświęcona patronowi podaje tytuł jego referatu, „O geometrii tkanin”, i nazywa go pierwszym referatem naukowym w polskim Wrocławiu; strona Wydziału Elektrycznego PWr dodaje, że odbył się w prywatnym mieszkaniu. Geometria tkanin (szkoła Blaschkego; Blaschke i Bol, „Geometrie der Gewebe”, 1938) bada rodziny krzywych przecinających się jak nici; Ślebodziński wrócił do niej w „Géométrie textile et les espaces à connexion affine” (Rozprawy Mat. 3, 1953). Rysunek: tkanina heksagonalna, czyli trzy rodziny krzywych, w której sześciokąt zamykania zawsze się domyka.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.dudaWeron, Z.pwrSite, Z.pwrWeny, 'https://oeaw.ac.at/resources/Record/990001927720504498', 'https://encyclopediaofmath.org/wiki/Webs,_geometry_of'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: pasuje do Seminariów albo Konferencji (pierwsze zebranie naukowe), a także do historii w dziale Instytut.'
  },
  /* ================ Dopisane 5.11 ================ */
  {
    id: 'galois-tarnobrzeg', rys: rysGalois,
    nazwa: 'Teoria Galois w Tarnobrzegu', rok: '1909–1912',
    zdanie: 'Badania zaczął jako nauczyciel w szkole realnej w Tarnobrzegu; najpierw pociągała go teoria Galois.',
    notka: 'Od 13 października 1909 r. do sierpnia 1912 r. uczył w c.k. Szkole Realnej w Tarnobrzegu i tam, według MacTutor, zaczął pracę badawczą; na początku interesowała go teoria Galois, a dopiero później geometria różniczkowa (to samo podaje angielska Wikipedia). Prac z tego okresu nie widzieliśmy. Rysunek to standardowy przykład, nie jego wynik: pierwiastki siódmego stopnia z jedynki i generator grupy Galois k ↦ 3k (mod 7), który przestawia sześć pierwiastków w jeden cykl, a jedynkę zostawia w miejscu (sprawdzone w generator.js).',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.mactutor, Z.wikiSleb, 'https://kconrad.math.uconn.edu/blurbs/galoistheory/cyclotomic.pdf'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: dobry początek opowieści „jak zaczyna się nauka”: bez instytutu, po lekcjach w szkole; ogólnie do działu Nauka.'
  },
  {
    id: 'ogrod-botaniczny', rys: rysLiscie,
    nazwa: 'Szkolny ogród botaniczny', rok: '1909–1912',
    zdanie: 'W Tarnobrzegu uczył też niemieckiego, polskiego i geografii oraz opiekował się szkolnym ogrodem botanicznym.',
    notka: 'MacTutor: poza matematyką i fizyką uczył w Tarnobrzegu niemieckiego i polskiego, przyrody, geografii i rysunku geometrycznego, zarządzał bibliotekami szkolnymi i „looked after the school’s botanical garden”. Rysunek nawiązuje do ogrodu, nie do jego pracy: układ liści według modelu Vogla (n-ty liść pod kątem n · 137,508° w odległości proporcjonalnej do √n), czyli klasyczny przykład matematyki w botanice. Widać dwie rodziny spiral, 13 i 21: kolejne liczby Fibonacciego.',
    rodzaj: 'anegdota', pewnosc: 'pewne',
    zrodla: [Z.mactutor, 'https://en.wikipedia.org/wiki/Golden_angle', 'https://algorithmicbotany.org/papers/abop/abop-ch4.pdf'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: pogodna ciekawostka do działu jako całości; twórca pochodnej Liego zaczynał od lekcji geografii i grządek.'
  },
  {
    id: 'getynga-1913', rys: rysHilbert,
    nazwa: 'Rok w Getyndze', rok: '1913–1914',
    zdanie: 'Dzięki stypendium fundacji Kretkowskiego słuchał w Getyndze wykładów Hilberta, Landaua i Carathéodory’ego.',
    notka: 'W 1913 r. dostał stypendium Fundacji Władysława Kretkowskiego i roczny urlop ze szkoły w Krakowie, by studiować w Getyndze, wówczas światowym centrum matematyki; słuchał Carathéodory’ego, Landaua i Hilberta. Wrócił do Krakowa 1 sierpnia 1914 r., gdy wybuchła wojna (MacTutor). Rysunek: krzywa Hilberta (D. Hilbert, 1891), która w granicy przechodzi przez każdy punkt kwadratu; tu krok czwarty, pogrubiony obraz pierwszej czwartej odcinka, czyli jedna ćwiartka kwadratu. Ilustracja nawiązuje do wykładowcy, nie do pracy Ślebodzińskiego.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.mactutor, Z.wikiSleb, Z.pwrSite, 'https://en.wikipedia.org/wiki/Hilbert_curve'],
    podstrona: 'Projekty i granty',
    dlaczego_tu: 'Stypendium zagraniczne fundacji sprzed ponad stu lat: przodek dzisiejszego grantu wyjazdowego.'
  },
  {
    id: 'toczenie-1923', rys: rysToczenie,
    nazwa: 'Toczenie się powierzchni', rok: '1923',
    zdanie: 'Jedna z jego wczesnych prac, ogłoszona po polsku w 1923 r., zawiera kilka twierdzeń o toczeniu się powierzchni.',
    notka: 'MacTutor wymienia tę pracę wśród publikacji poprzedzających doktorat, jako „Several theorems on the rolling of surfaces” (po polsku, 1923); nie podaje polskiego tytułu ani czasopisma, a treści nie widzieliśmy, więc o twierdzeniach nic tu nie mówimy. Rysunek to płaski, klasyczny odpowiednik, nie wynik z pracy: elipsa toczona bez poślizgu po prostej; jej ognisko kreśli krzywą, której obrót wokół prostej daje undoloid Delaunaya (1841), powierzchnię o stałej krzywiźnie średniej. Odległość ogniska od prostej waha się od a − c do a + c, co sprawdza generator.js.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.mactutor, 'https://en.wikipedia.org/wiki/Unduloid'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: mogłoby trafić do Publikacji; pokazuje, od czego zaczynał geometrię różniczkową.'
  },
  {
    id: 'ptm-1923-1963', rys: rysOkregi,
    nazwa: 'Od oddziału do prezesury PTM', rok: '1923–1963',
    zdanie: 'Założył poznański oddział PTM (1923), a w latach 1961–1963 był prezesem całego Towarzystwa.',
    notka: 'Według MacTutor w 1923 r. założył oddział Polskiego Towarzystwa Matematycznego w Poznaniu, gdzie wykładał w Państwowej Wyższej Szkole Mechaniczno-Elektrotechnicznej (1921–1939) i na Uniwersytecie. Po wojnie był wiceprezesem, a potem wieloletnim przewodniczącym oddziału wrocławskiego (strona Wydziału Elektrycznego PWr), w latach 1961–1963 prezesem PTM, później członkiem honorowym. Rysunek (z przymrużeniem oka: koła w kołach): spirala Eulera i jej okręgi ściśle styczne; twierdzenie Taita–Knesera mówi, że przy monotonicznej krzywiźnie leżą jeden w drugim.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.mactutor, Z.wikiSleb, Z.pwrWeny, 'https://en.wikipedia.org/wiki/Tait%E2%80%93Kneser_theorem'],
    podstrona: 'Konferencje',
    dlaczego_tu: 'Praca organizacyjna środowiska: bez towarzystw naukowych nie byłoby zjazdów i konferencji.'
  },
  {
    id: 'doktorat-1928', rys: rysPoincare,
    nazwa: 'Doktorat w wieku 44 lat', rok: '1928',
    zdanie: 'Doktorat obronił w wieku 44 lat, mając już dorobek; zachęcił go Sierpiński, który załatwił wsparcie finansowe.',
    notka: 'Doktorat uzyskał na Uniwersytecie Warszawskim 20 czerwca 1928 r. (urodzony 6 lutego 1884 r.), choć publikował już wcześniej na wysokim poziomie; zachęcali go koledzy, a Sierpiński załatwił wsparcie finansowe (MacTutor). Tytuł rozprawy: MacTutor „On a Certain Class of Riemann Space”, Wikipedia „O pewnej klasie powierzchni Riemanna”; rozprawy nie widzieliśmy. Rysunek to tylko ilustracja pojęcia, nie treść rozprawy: płaszczyzna hiperboliczna, najprostsza przestrzeń Riemanna o stałej ujemnej krzywiźnie, z teselacją Fareya; łuki to jej „proste” (geodezyjne).',
    rodzaj: 'anegdota', pewnosc: 'pewne',
    zrodla: [Z.mactutor, Z.genealogy, Z.wikiSleb, 'https://homepages.warwick.ac.uk/staff/C.M.Series/HypGeomandCntdFractions-2.pdf'],
    podstrona: 'Szkoła doktorska',
    dlaczego_tu: 'Dla doktorantów: na doktorat nigdy nie jest za późno, a późniejszy wielki wynik przyszedł trzy lata po obronie.'
  },
  {
    id: 'wnuk-liego', rys: rysLie1p,
    nazwa: 'Naukowy wnuk Sophusa Liego', rok: '1891–1928',
    zdanie: 'Jego promotor Żorawski był doktorantem Liego, więc twórca pochodnej Liego to naukowy wnuk jej patrona.',
    notka: 'Mathematics Genealogy Project: Kazimierz Żorawski, doktorat w Lipsku 1891 u Sophusa Liego, o zastosowaniach grup przekształceń w geometrii różniczkowej; Ślebodziński, doktorat na UW 1928 u Żorawskiego. Promotora Żorawskiego podają też MacTutor i Wikipedia. Rozbieżność: lista w artykule Dudy i Werona (Wiad. Mat. 42, 2006) przy Ślebodzińskim ma „dr 1928 (W. Sierpiński)”, a biografia Żorawskiego w MacTutor nie nazywa Liego promotorem wprost (pisze o studiach w Lipsku i pochwale Liego dla jego pracy). Warto sprawdzić dokumenty doktoratu. Rysunek: pojęcie Liego, grupa jednoparametrowa; obroty hiperboliczne, ich orbity i pięć punktów w równych krokach parametru.',
    rodzaj: 'anegdota', pewnosc: 'do sprawdzenia',
    zrodla: [Z.genealogy, 'https://mathgenealogy.org/id.php?id=60302', 'https://mathshistory.st-andrews.ac.uk/Biographies/Zorawski/', Z.mactutor, Z.dudaWeron],
    podstrona: 'Obrony doktorskie',
    dlaczego_tu: 'Genealogia naukowa: promotor, promotor promotora; nazwa operatora okazuje się sprawą rodzinną.'
  },
  {
    id: 'pole-grawitacji-1926', rys: rysPeryhelium,
    nazwa: 'Geometria pola grawitacji', rok: '1926',
    zdanie: 'Dekadę po Einsteinie badał geometrię statycznego pola grawitacji i metrykę wokół punktu materialnego.',
    notka: '„Recherches géométriques sur le champ statique de gravitation” (Prace Mat.-Fiz. 34, 1925–1926, s. 91–118) oraz polska praca o metryce przestrzeni w otoczeniu stacjonarnego punktu materialnego (MacTutor, 1926). Treści nie sprawdzaliśmy w oryginale; ogólną teorię względności Einstein ogłosił w 1915 r. Rysunek to znany efekt tej teorii, nie jego wynik: orbita w polu Schwarzschilda z równania Bineta (RK4), pogrubiony pierwszy obieg, cienkie kreski do kolejnych peryheliów. Przesunięcie jest mocno przesadzone: tu ok. 23° na obieg, dla Merkurego ok. 0,1 sekundy łuku.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: ['https://eudml.org/doc/215456', Z.mactutor, 'https://arxiv.org/pdf/1206.1869'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: geometria w służbie fizyki; mogłoby pójść do Publikacji.'
  },
  {
    id: 'nagroda-doktoraty-hc', rys: rysElipsoida,
    nazwa: 'Nagroda i trzy doktoraty honoris causa', rok: '1955–1970',
    zdanie: 'Dostał Nagrodę Państwową (1955) i trzy doktoraty honorowe: Politechnik Wrocławskiej i Poznańskiej oraz UWr.',
    notka: 'Państwowa Nagroda Naukowa z 1955 r. (Wikipedia: zespołowa II stopnia, za geometrię różniczkową; strona Wydziału Elektrycznego PWr: Państwowa Nagroda Naukowa). Doktoraty honoris causa: Politechnika Wrocławska 1965, Politechnika Poznańska 1967, Uniwersytet Wrocławski 1970 (MacTutor, strona PWr). Rysunek (Monge, klasyka geometrii różniczkowej, nie jego wynik): linie krzywizny elipsoidy trójosiowej, policzone jako przecięcia z konfokalnymi kwadrykami, oraz dwa z czterech punktów kulistych, w których obie rodziny linii się spotykają.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.mactutor, Z.pwrSite, Z.pwrWeny, Z.wikiSleb, 'https://geodesic.mathdoc.fr/articles/10.14708/am.v10i0.1918'],
    podstrona: 'Sukcesy',
    dlaczego_tu: 'Lista wyróżnień: naturalne miejsce to Sukcesy.'
  },
  {
    id: 'pionier-elektryki', rys: rysTrojfaza,
    nazwa: 'Pionier dolnośląskiej elektryki', rok: '1946',
    zdanie: 'Matematyk wśród „Pionierów Dolnośląskiej Elektryki”: od marca 1946 r. zasiadał w radzie wydziału Politechniki.',
    notka: 'Strony Wydziału Elektrycznego PWr zaliczają go do Pionierów Dolnośląskiej Elektryki: uczestniczył w pracach Rady Wydziału Mechaniczno-Elektrotechnicznego od jej pierwszego posiedzenia 13 marca 1946 r., pilnował programów z matematyki, był organizatorem i pierwszym kierownikiem Katedry Matematyki PWr. Rozbieżność co do tej katedry: strona PWr o patronie podaje 1 września 1951 r. (także MacTutor, Duda i Weron: 1951), a strona Wydziału Elektrycznego: od 1952 r.; w zdaniu nie podajemy tego roku. Rysunek: prąd trójfazowy, wskazy co 120° i sinusoidy, których suma jest w każdej chwili równa zeru.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.pwrWeny, 'https://weny.pwr.edu.pl/fcp/zGBUKOQtTKlQhbx08SlkTUAxQX2o8DAoHNiwFE1xVSX1RFVZpCFghUHcKVigEQUw/38/public/o_wydziale/profil_wydzialu/pionierzy/slebodzinski.pdf', Z.pwrSite, Z.mactutor, Z.dudaWeron],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: matematyka w służbie techniki; pasuje też do „Rady Dyscypliny”, ale ta pozycja menu to link zewnętrzny.'
  },
  {
    id: 'yano-1957', rys: rysApollo,
    nazwa: 'Monografia Kentaro Yano', rok: '1957',
    zdanie: 'Kentaro Yano poświęcił pochodnej Liego i jej zastosowaniom całą monografię, wznowioną jeszcze w 2020 r.',
    notka: 'K. Yano (uczeń É. Cartana), „The Theory of Lie Derivatives and its Applications”, North-Holland (Bibliotheca Mathematica 3). Rozbieżność co do roku: Wikipedia i wydawnictwo Dover (wznowienie 2020) podają 1957, MacTutor 1955, a katalog w Nantes „[1956?]”, stąd „do sprawdzenia”; najczęściej cytowany jest 1957. Rysunek: pochodna Liego opisuje też przekształcenia konforemne, zachowujące kąty. Tu przepływ przekształcenia Möbiusa z dwoma punktami stałymi: okręgi przez oba punkty (linie przepływu) i okręgi Apoloniusza, prostopadłe do nich. Czy i jak ten przykład występuje w książce Yano, nie sprawdzaliśmy.',
    rodzaj: 'historia', pewnosc: 'do sprawdzenia',
    zrodla: ['https://en.wikipedia.org/wiki/Kentaro_Yano_(mathematician)', 'https://store.doverpublications.com/products/9780486842097', 'https://nantilus.univ-nantes.fr/vufind/Record/PPN006430244', Z.mactutor, 'https://en.wikipedia.org/wiki/Apollonian_circles'],
    podstrona: 'Publikacje',
    dlaczego_tu: 'Cudza książka o jego pojęciu: najlepsza miara tego, jak publikacja żyje dalej.'
  },
  {
    id: 'cartan-1922', rys: rysCartan,
    nazwa: 'Cartan był o krok wcześniej', rok: '1922',
    zdanie: 'W 1922 r. Cartan określił taki operator, ale tylko dla form; wzór dla wszystkich tensorów dał Ślebodziński.',
    notka: 'Trautman (2008): É. Cartan w „Leçons sur les invariants intégraux” (Paryż 1922) zdefiniował operator L(X) na formach zewnętrznych, wykazał, że komutuje z różniczką zewnętrzną d, i podał wzór L(X) = d∘i(X) + i(X)∘d, używany do dziś jako „magiczny wzór Cartana”. Dziewięć lat później Ślebodziński podał wzór dla dowolnego tensora i regułę Leibniza; właśnie dlatego Trautman uznaje go za pierwszego, który zdefiniował pochodną Liego w ogólnym przypadku. Rysunek: wzór Cartana po scałkowaniu: pętla przeniesiona przepływem; zmiana całki z formy po pętli to całka z dω po pasie zamiatanym przez pętlę plus brzeg.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.trautman, Z.wikiLie],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: o pierwszeństwie w nauce; pasuje do Publikacji albo Sukcesów.'
  },
  {
    id: 'spinory-kosmann', rys: rysMobius,
    nazwa: 'Pochodna Liego spinorów', rok: '1963–1972',
    zdanie: 'Pojęcie rosło dalej: Lichnerowicz i Yvette Kosmann rozszerzyli pochodną Liego na spinory znane z fizyki cząstek.',
    notka: 'A. Lichnerowicz („Spineurs harmoniques”, C. R. Acad. Sci. Paris 257, 1963) określił pochodną Liego spinora wzdłuż pól Killinga, czyli izometrii. Y. Kosmann (noty 1966–1967, teza „Dérivées de Lie des spineurs”, Ann. Mat. Pura Appl. 91, 1972, s. 317–395) przyjęła ten wzór jako definicję dla dowolnych pól wektorów. Sprawa nie jest prosta, bo spinory nie są obiektami tensorowymi; późniejsze prace ujmują to przez wiązki. Rysunek to analogia, nie treść tych prac: wstęga Möbiusa; pełny obieg odwraca jej normalną, jak obrót o 360° zmienia znak spinora; brzeg wstęgi (pogrubiony) domyka się dopiero po dwóch obiegach.',
    rodzaj: 'zastosowanie', pewnosc: 'pewne',
    zrodla: ['https://arxiv.org/pdf/1411.7845', Z.wikiLie, 'https://scilit.com/publications/127328e2d72e287f3902a1b18fed03be'],
    podstrona: 'zapas',
    dlaczego_tu: 'Zapas: jak pomysł z 1931 r. żyje w badaniach następnych pokoleń; do działu Nauka jako całości.'
  },
  {
    id: 'tom-26-colloquium', rys: rysIzometrie,
    nazwa: 'Tom ku jego pamięci', rok: '1972',
    zdanie: 'Tom 26 „Colloquium Mathematicum” uczcił jego pamięć; otwiera go praca Kentaro Yano o izometriach.',
    notka: 'Współzakładane przez niego pismo poświęciło mu w 1972 r. cały tom 26 (s. 1–389; MacTutor: „A collection of articles commemorating Władysław Ślebodziński”). Spis na stronie IMPAN zaczyna się pracami: K. Yano „Notes on isometries”, G. Gheorghiev o pochodnej Liego w rozmaitościach Banacha, G. H. Katzin i J. Levine o zastosowaniach pochodnych Liego, S. Gołąb o pochodnej kowariantnej i pochodnej Liego, H. V. Craig o „formulation given by W. Ślebodziński”. Rysunek: pole Killinga na sferze (obrót wokół osi): jego przepływ jest izometrią, czyli pochodna Liego metryki wzdłuż tego pola znika.',
    rodzaj: 'historia', pewnosc: 'pewne',
    zrodla: [Z.mactutor, 'https://www.impan.pl/en/publishing-house/journals-and-series/colloquium-mathematicum/all/26', Z.trautman],
    podstrona: 'Publikacje',
    dlaczego_tu: 'Cały tom czasopisma z tytułami, w których wraca pochodna Liego: publikacyjny pomnik patrona.'
  }
];

/* ---------------- liczenie i kontrola ---------------- */
const liczby = (d) => { // współrzędne bezwzględne (M/L) do kontroli pola; kropki osobno
  const out = []; const re = /([MLZa])([^MLZa]*)/g; let m;
  while ((m = re.exec(d))) {
    if (m[1] === 'a' || m[1] === 'Z') continue;
    const v = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    for (let i = 0; i + 1 < v.length; i += 2) out.push([v[i], v[i + 1]]);
  }
  return out;
};
const wyniki = DANE.map((z) => {
  const sciezki = z.rys();
  const bledy = [];
  if (sciezki.length < 5 || sciezki.length > 60) bledy.push(`liczba ścieżek ${sciezki.length}`);
  sciezki.forEach((s, i) => {
    const pk = liczby(s.d);
    const kr = /a4\.5/.test(s.d);
    const P = kr ? [[pk[0][0], pk[0][1]], [pk[0][0] + 9, pk[0][1]], [pk[0][0] + 4.5, pk[0][1] - 4.5], [pk[0][0] + 4.5, pk[0][1] + 4.5]] : pk;
    P.forEach((p) => { if (!(p[0] >= POLE.x0 - 1e-9 && p[0] <= POLE.x1 + 1e-9 && p[1] >= POLE.y0 - 1e-9 && p[1] <= POLE.y1 + 1e-9)) bledy.push(`ścieżka ${i}: punkt ${p} poza polem`); });
    const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
    const roz = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    if (roz < 3) bledy.push(`ścieżka ${i}: drobna (${roz})`);
  });
  const { rys, ...dane } = z;
  return { ...dane, sciezki, _bledy: bledy };
});

let ok = true;
wyniki.forEach((w) => {
  const zn = [...w.zdanie].length, nz = [...w.nazwa].length;
  const uw = [];
  if (zn > 115) uw.push(`zdanie ${zn} zn.`);
  if (nz > 40) uw.push(`nazwa ${nz} zn.`);
  console.log(`${w.id.padEnd(24)} ścieżek ${String(w.sciezki.length).padStart(2)}, grubych ${w.sciezki.filter((s) => s.gruba).length}, zdanie ${zn} zn., nazwa ${nz} zn., ${w.podstrona}${w._bledy.length ? '  BŁĘDY: ' + w._bledy.slice(0, 4).join('; ') : ''}${uw.length ? '  UWAGI: ' + uw.join('; ') : ''}`);
  if (w._bledy.length) ok = false;
});
Object.entries(kontrola).forEach(([k, v]) => console.log(`  kontrola ${k}: ${v}`));

const json = wyniki.map(({ _bledy, ...w }) => ({ ...w, sciezki: w.sciezki.map((s) => s.gruba ? { d: s.d, gruba: true } : { d: s.d, gruba: false }) }));
fs.writeFileSync(path.join(KAT, 'ciekawostki.json'), JSON.stringify(json, null, 2) + '\n');

/* ---------------- podgląd HTML ---------------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (w, kl) => `<svg class="${kl}" viewBox="0 0 200 240" aria-hidden="true">${kl === 'duzy' ? '<rect class="ramka" x="12" y="34" width="176" height="190"/>' : ''}${w.sciezki.map((s) => `<path d="${s.d}"${s.gruba ? ' class="gruba"' : ''}/>`).join('')}</svg>`;
const kontrolaId = { 'pochodna-liego': 'lie', 'nazwa-van-dantzig': 'dantzig', 'hamilton-1931': 'hamilton', 'nawias-liego': 'nawias', 'zjazd-lwow-1927': 'flamm', 'seminarium-1948': 'sfera', 'wyklady-1946': 'ewoluta', 'jedenastu-doktorow': 'wezel', 'formes-exterieures': 'forma', 'zespol-impan-1956': 'siatka', 'geometria-tkanin-1945': 'tkanina', 'galois-tarnobrzeg': 'galois', 'ogrod-botaniczny': 'liscie', 'getynga-1913': 'hilbert', 'toczenie-1923': 'toczenie', 'ptm-1923-1963': 'okregi', 'doktorat-1928': 'poincare', 'wnuk-liego': 'lie1p', 'pole-grawitacji-1926': 'peryhelium', 'nagroda-doktoraty-hc': 'elipsoida', 'pionier-elektryki': 'trojfaza', 'yano-1957': 'apollo', 'cartan-1922': 'cartan', 'spinory-kosmann': 'mobius', 'tom-26-colloquium': 'izometrie' };
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ślebodziński: rysunki ciekawostek</title>
<style>
:root { --j: #4cc3b2; --g: #0a4a47; --t: #e2f3f0; --granat: #0d1830; --tlo: #f6f8f7; --tekst: #1b2a2a; --szary: #5a6b6a; }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px 16px 40px; background: var(--tlo); color: var(--tekst); font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
h1 { font-size: 22px; margin: 0 0 4px; } p.wstep { margin: 0 0 20px; color: var(--szary); max-width: 900px; }
.siatka { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.karta { background: #fff; border: 1px solid #d9e4e2; border-radius: 10px; padding: 14px; display: grid; grid-template-columns: 200px 1fr; gap: 14px; }
.rysy { display: flex; flex-direction: column; gap: 8px; align-items: center; }
svg.duzy { width: 200px; height: 240px; background: #fff; }
svg.duzy path { fill: none; stroke: color-mix(in srgb, var(--g) 55%, transparent); stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
svg.duzy path.gruba { stroke: var(--g); stroke-width: 2; }
svg.duzy .ramka { fill: none; stroke: #e3ecea; stroke-dasharray: 3 3; stroke-width: .8; }
.ciemne { background: var(--granat); border-radius: 8px; padding: 6px; display: flex; gap: 6px; align-items: center; }
svg.maly { width: 145px; height: 170px; }
svg.maly path { fill: none; stroke: color-mix(in srgb, var(--j) 55%, transparent); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
svg.maly path.gruba { stroke: var(--j); stroke-width: 2; }
.opis b.nazwa { display: block; font-size: 16px; font-style: italic; }
.meta { font-size: 12px; color: var(--szary); margin: 2px 0 8px; }
.znaczek { display: inline-block; padding: 1px 7px; border-radius: 9px; font-size: 11.5px; margin-right: 4px; background: var(--t); color: var(--g); }
.znaczek.spr { background: #fbe7c6; color: #7a4b00; }
.znaczek.zapas { background: #eceff3; color: #44506a; }
.zdanie { font-size: 14.5px; margin: 0 0 8px; }
.notka { font-size: 12.5px; color: #3c4b4a; margin: 0 0 6px; }
.kontr { font-size: 11.5px; color: var(--szary); font-family: ui-monospace, monospace; }
@media (max-width: 520px) { .karta { grid-template-columns: 1fr; } .siatka { grid-template-columns: 1fr; } }
</style></head><body>
<h1>Władysław Ślebodziński (1884–1972): ciekawostki i rysunki</h1>
<p class="wstep">Patron działu Nauka. ${json.length} ciekawostek; rysunki policzone w <code>generator.js</code> (viewBox 0 0 200 240, pole 12–188 × 34–224 zaznaczone przerywaną ramką). Po lewej rysunek w skali 1:1 na jasnym tle, niżej w rozmiarze nagłówka (145 × 170) w kolorze działu na ciemnym tle.</p>
<div class="siatka">
${json.map((w) => `<section class="karta" id="${w.id}"><div class="rysy">${svg(w, 'duzy')}<div class="ciemne">${svg(w, 'maly')}</div></div>
<div class="opis"><b class="nazwa">${esc(w.nazwa)}, ${esc(w.rok)}</b>
<div class="meta"><span class="znaczek${w.podstrona === 'zapas' ? ' zapas' : ''}">${esc(w.podstrona)}</span><span class="znaczek${w.pewnosc === 'pewne' ? '' : ' spr'}">${esc(w.pewnosc)}</span>${esc(w.rodzaj)} · ${w.sciezki.length} ścieżek</div>
<p class="zdanie">${esc(w.zdanie)}</p><p class="notka">${esc(w.notka)}</p><p class="kontr">${esc(kontrola[kontrolaId[w.id]] || '')}</p></div></section>`).join('\n')}
</div></body></html>
`;
fs.writeFileSync(path.join(KAT, 'rysunki.html'), html);
console.log(ok ? 'OK: wszystkie ścieżki w polu' : 'UWAGA: są błędy');

/* ---------------- zrzut ---------------- */
if (process.argv.includes('--zrzut')) {
  (async () => {
    const { chromium } = require('playwright');
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 1 });
    await p.goto('file://' + path.join(KAT, 'rysunki.html'));
    await p.screenshot({ path: path.join(KAT, 'rysunki.png'), fullPage: true });
    await b.close();
    console.log('zapisano rysunki.png');
  })();
}
