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
const kontrolaId = { 'pochodna-liego': 'lie', 'nazwa-van-dantzig': 'dantzig', 'hamilton-1931': 'hamilton', 'nawias-liego': 'nawias', 'zjazd-lwow-1927': 'flamm', 'seminarium-1948': 'sfera', 'wyklady-1946': 'ewoluta', 'jedenastu-doktorow': 'wezel', 'formes-exterieures': 'forma', 'zespol-impan-1956': 'siatka', 'geometria-tkanin-1945': 'tkanina' };
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
