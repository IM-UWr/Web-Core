// Ciekawostki patrona działu Studia — Bronisław Knaster (1893–1980).
// Generator rysunków: każda ścieżka jest policzona (konstrukcja, iteracja, rozwiązanie równania, symulacja procedury),
// współrzędne zaokrąglone do 0,1. Układ: viewBox 0 0 200 240, pole rysunku x 12–188, y 34–224.
// Uruchomienie:  node generator.js         → ciekawostki.json + rysunki.html
//                node generator.js --png   → dodatkowo rysunki.png (Playwright)
'use strict';
const fs = require('fs');
const path = require('path');
const FAKTY = require('./fakty.js');

const POLE = { x0: 12, x1: 188, y0: 34, y1: 224 };
const f1 = (v) => {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? '0' : String(r);
};

/* ---------- budowa ścieżek z kontrolą granic i drobnicy ---------- */
class Sciezka {
  constructor(gruba = false) { this.d = []; this.pkt = []; this.cur = null; this.gruba = gruba; this.dl = []; this.dlBiez = 0; }
  _sub() { if (this.cur !== null && this.dlBiez > 0) this.dl.push(this.dlBiez); this.dlBiez = 0; }
  M(x, y) { this._sub(); this.d.push(`M${f1(x)},${f1(y)}`); this.pkt.push([x, y]); this.cur = [x, y]; return this; }
  L(x, y) {
    this.d.push(`L${f1(x)},${f1(y)}`); this.pkt.push([x, y]);
    this.dlBiez += Math.hypot(x - this.cur[0], y - this.cur[1]); this.cur = [x, y]; return this;
  }
  // łuk okręgu o środku (cx, cy), promieniu r, od kąta a0 do a1 (kąty ekranowe: y w dół, rosnący kąt = zgodnie z zegarem)
  luk(cx, cy, r, a0, a1, odNowa = true) {
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
    if (odNowa) this.M(p0[0], p0[1]);
    // dzielimy na kawałki ≤ 180°, żeby flaga large-arc była jednoznaczna
    const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / Math.PI - 1e-9));
    for (let k = 1; k <= n; k++) {
      const a = a0 + (a1 - a0) * k / n;
      const p = [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      this.d.push(`A${f1(r)},${f1(r)} 0 0 ${a1 > a0 ? 1 : 0} ${f1(p[0])},${f1(p[1])}`);
      this.cur = p;
    }
    for (let k = 0; k <= 48; k++) { const a = a0 + (a1 - a0) * k / 48; this.pkt.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    this.dlBiez += Math.abs(a1 - a0) * r;
    return this;
  }
  // krzywa Béziera 3. stopnia (do kontroli granic próbkujemy)
  C(x1, y1, x2, y2, x, y) {
    const [x0, y0] = this.cur;
    this.d.push(`C${f1(x1)},${f1(y1)} ${f1(x2)},${f1(y2)} ${f1(x)},${f1(y)}`);
    let prev = [x0, y0];
    for (let k = 1; k <= 32; k++) {
      const t = k / 32, u = 1 - t;
      const p = [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y];
      this.pkt.push(p); this.dlBiez += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p;
    }
    this.cur = [x, y];
    return this;
  }
  lamana(P) { P.forEach((p, i) => (i ? this.L(p[0], p[1]) : this.M(p[0], p[1]))); return this; }
  // odcinek przerywany: kreski długości k, przerwy g, przesunięcie fazy s
  przerywana(ax, ay, bx, by, k = 4, g = 3, s = 0) {
    const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
    for (let t = -s; t < L - 0.5; t += k + g) {
      const t0 = Math.max(0, t), t1 = Math.min(L, t + k);
      if (t1 - t0 < 2.9) continue;
      this.M(ax + ux * t0, ay + uy * t0).L(ax + ux * t1, ay + uy * t1);
    }
    return this;
  }
  koniec() { this._sub(); return { d: this.d.join(' '), gruba: this.gruba, _pkt: this.pkt, _dl: this.dl }; }
}
const kropka = (x, y) => {
  const s = new Sciezka(true);
  s.d.push(`M${f1(x - 4.5)},${f1(y)} a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0`);
  s.pkt.push([x - 4.5, y - 4.5], [x + 4.5, y + 4.5]);
  s.dl.push(28);
  return { d: s.d.join(' '), gruba: true, _pkt: s.pkt, _dl: s.dl };
};
const grot = (s, x, y, kx, ky, dl = 7, sz = 4.2) => {
  // grot strzałki w punkcie (x, y) skierowany wzdłuż (kx, ky)
  const L = Math.hypot(kx, ky), ux = kx / L, uy = ky / L, nx = -uy, ny = ux;
  s.M(x - ux * dl + nx * sz, y - uy * dl + ny * sz).L(x, y).L(x - ux * dl - nx * sz, y - uy * dl - ny * sz);
};

/* ---------- zbiór Cantora ---------- */
function cantor(poziom) {
  // przedziały po `poziom` krokach (w jednostkach [0,1])
  let iv = [[0, 1]];
  for (let k = 0; k < poziom; k++) iv = iv.flatMap(([a, b]) => { const t = (b - a) / 3; return [[a, a + t], [b - t, b]]; });
  return iv;
}
const konce = (poziom) => [...new Set(cantor(poziom).flat().map((x) => Math.round(x * 3 ** poziom)))].sort((a, b) => a - b).map((k) => k / 3 ** poziom);

/* ===================================================================================================== */
/* 1. Kontinuum Knastera: łuki na zbiorze Cantora (poziom 3) i pogrubiony początek kompozanty punktu 0 */
function lukiKnastera(poziom) {
  // górne: środek 1/2, łączą c i 1−c; dolne: w [2/3ⁿ, 3/3ⁿ] środek 5/(2·3ⁿ), łączą c i 5/3ⁿ − c
  const E = konce(poziom), N = 3 ** poziom, luki = [];
  const r3 = (x) => Math.round(x * N);
  E.filter((c) => c < 0.5 - 1e-9).forEach((c) => luki.push({ g: true, a: r3(c), b: r3(1 - c), m: 0.5 }));
  for (let n = 1; n <= poziom; n++) {
    const lo = 2 / 3 ** n, m = 5 / (2 * 3 ** n);
    E.filter((c) => c >= lo - 1e-9 && c < m - 1e-9).forEach((c) => { if (E.some((e) => Math.abs(e - (2 * m - c)) < 1e-9)) luki.push({ g: false, a: r3(c), b: r3(2 * m - c), m }); });
  }
  return luki;
}
// kompozanta punktu 0: na zmianę łuk w górę (partner 1−c) i w dół (partner w swoim kawałku [2/3ⁿ, 3/3ⁿ])
function kompozanta(poziom, ileLukow) {
  const N = 3 ** poziom, seq = [];
  let c = 0, gora = true;
  for (let i = 0; i < ileLukow; i++) {
    let m, p;
    if (gora) { m = 0.5; p = 1 - c; } else {
      let n = 0;
      for (let k = 1; k <= poziom; k++) if (c >= 2 / 3 ** k - 1e-9 && c <= 3 / 3 ** k + 1e-9) { n = k; break; }
      if (!n) break;
      m = 5 / (2 * 3 ** n); p = 2 * m - c;
    }
    const pa = Math.round(p * N);
    if (Math.abs(pa / N - p) > 1e-9) break; // partner poza punktami danego poziomu
    seq.push({ g: gora, a: Math.round(c * N), b: pa, m });
    c = p; gora = !gora;
  }
  return seq;
}
function rysujLuk(s, l, N, X, Y0, sk, odNowa) {
  // łuk od punktu a do b (jednostki 1/N), górny albo dolny
  const cx = X(l.m), r = Math.abs(l.b / N - l.m) * sk;
  const lewy = l.a / N < l.m;
  let a0, a1;
  if (l.g) { a0 = lewy ? Math.PI : 2 * Math.PI; a1 = lewy ? 2 * Math.PI : Math.PI; }
  else { a0 = lewy ? Math.PI : 0; a1 = lewy ? 0 : Math.PI; }
  s.luk(cx, Y0, r, a0, a1, odNowa);
}
function znakKontinuum() {
  const P = 3, N = 3 ** P, sk = 168, X = (u) => 17 + sk * u, Y0 = 150;
  const wszystkie = lukiKnastera(P), droga = kompozanta(P, 6);
  const klucz = (l) => [Math.min(l.a, l.b), Math.max(l.a, l.b), l.g].join(':');
  const wDrodze = new Set(droga.map(klucz));
  const out = [];
  wszystkie.filter((l) => !wDrodze.has(klucz(l))).sort((a, b) => Math.abs(b.b - b.a) - Math.abs(a.b - a.a)).forEach((l) => {
    const s = new Sciezka(false); rysujLuk(s, l, N, X, Y0, sk, true); out.push(s.koniec());
  });
  const g = new Sciezka(true);
  droga.forEach((l, i) => rysujLuk(g, l, N, X, Y0, sk, i === 0));
  out.push(g.koniec());
  out.push(kropka(X(0), Y0));
  return { sciezki: out, opis: `poziom ${P}: ${wszystkie.length} łuków; pogrubione ${droga.length} łuków kompozanty punktu 0 (0→1→2/3→1/3→2/9→7/9→8/9)` };
}

/* 2. Pierwsze kroki konstrukcji: na poziomie 2 łuki składają się w jedną linię (od 0 do 1/9) nad etapami zbioru Cantora */
function znakPoczatek() {
  const P = 2, N = 3 ** P, sk = 172, X = (u) => 14 + sk * u, Y0 = 134;
  const droga = kompozanta(P, 20), wszystkie = lukiKnastera(P);
  if (droga.length !== wszystkie.length) throw new Error('na poziomie 2 kompozanta 0 powinna przejść przez wszystkie łuki');
  const out = [];
  const g = new Sciezka(true);
  droga.forEach((l, i) => rysujLuk(g, l, N, X, Y0, sk, i === 0));
  out.push(g.koniec());
  // etapy zbioru Cantora pod spodem: poziomy 0–3
  for (let k = 0; k <= 3; k++) {
    const s = new Sciezka(false), y = 182 + 11 * k;
    cantor(k).forEach(([a, b]) => s.M(X(a), y).L(X(b), y));
    out.push(s.koniec());
  }
  return { sciezki: out, opis: `poziom 2: ${droga.length} łuków tworzy jedną krzywą; pod spodem 4 etapy zbioru Cantora` };
}

/* 3. Twierdzenie Knastera–Tarskiego: rosnąca funkcja ze skokami na [0,1], przekątna, iteracje od 0 i od 1, punkty stałe */
function znakKnasterTarski() {
  const x0 = 28, x1 = 180, y0 = 214, S = x1 - x0, X = (u) => x0 + S * u, Y = (v) => y0 - S * v;
  const kawalki = [
    { a: 0, b: 0.36, f: (u) => 0.16 + 0.42 * u - 0.3 * u * u },
    { a: 0.36, b: 0.68, f: (u) => 0.5 + 0.35 * (u - 0.36) },
    { a: 0.68, b: 1, f: (u) => 0.78 + 0.15 * (u - 0.68) },
  ];
  const f = (u) => kawalki.find((k) => u >= k.a && (u < k.b || k.b === 1)).f(u);
  // monotoniczność (sprawdzenie)
  for (let u = 0; u < 1; u += 0.001) if (f(u + 0.001) < f(u) - 1e-12) throw new Error('f nie jest rosnąca');
  // punkty stałe: bisekcja na każdym kawałku
  const stale = [];
  kawalki.forEach((k) => {
    const g = (u) => k.f(u) - u;
    let a = k.a, b = k.b - 1e-12;
    if (g(a) * g(b) > 0) return;
    for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (g(a) * g(m) <= 0) b = m; else a = m; }
    stale.push((a + b) / 2);
  });
  const out = [];
  const ramka = new Sciezka(false); ramka.M(X(0), Y(0)).L(X(1), Y(0)).L(X(1), Y(1)).L(X(0), Y(1)).L(X(0), Y(0)); out.push(ramka.koniec());
  const diag = new Sciezka(false); diag.przerywana(X(0), Y(0), X(1), Y(1), 4, 3.5); out.push(diag.koniec());
  kawalki.forEach((k) => {
    const s = new Sciezka(false), P = [];
    for (let i = 0; i <= 24; i++) { const u = k.a + (k.b - k.a) * i / 24 - (i === 24 && k.b < 1 ? 1e-9 : 0); P.push([X(u), Y(k.f(u))]); }
    s.lamana(P); out.push(s.koniec());
  });
  // pajęczyna (iteracja) od dołu: 0 → f(0) → f(f(0)) …, stop gdy krok < 3 jednostek
  const pajeczyna = (start) => {
    const s = new Sciezka(false); let u = start; s.M(X(u), Y(u));
    for (let i = 0; i < 40; i++) {
      const v = f(u);
      if (Math.abs(v - u) * S < 3) break;
      s.L(X(u), Y(v)).L(X(v), Y(v)); u = v;
    }
    return s.koniec();
  };
  out.push(pajeczyna(0), pajeczyna(1));
  stale.forEach((u) => out.push(kropka(X(u), Y(u))));
  return { sciezki: out, opis: `punkty stałe: ${stale.map((u) => u.toFixed(4)).join(', ')} (najmniejszy, środkowy, największy); iteracje od 0 i od 1` };
}

/* 4. Wachlarz Knastera–Kuratowskiego: odcinki z wierzchołka do punktów zbioru Cantora (poziom 3) */
function znakWachlarz() {
  const A = [100, 42], yB = 212, X = (u) => 16 + 168 * u;
  const out = [];
  const E = konce(3);
  E.forEach((c, i) => {
    const bx = X(c);
    // punkty 0 i 1 nie są końcami usuniętych przedziałów — na tych odcinkach zostają punkty o wysokości niewymiernej (prawie cały odcinek);
    // nad końcami usuniętych przedziałów zostają tylko punkty o wysokości wymiernej — rysujemy je przerywaną kreską
    const s = new Sciezka(false);
    const L = Math.hypot(A[0] - bx, A[1] - yB), ux = (A[0] - bx) / L, uy = (A[1] - yB) / L;
    const kon = [A[0] - ux * 9, A[1] - uy * 9]; // do brzegu kropki wierzchołka
    if (c === 0 || c === 1) s.M(bx, yB).L(kon[0], kon[1]);
    else s.przerywana(bx, yB, kon[0], kon[1], 3.6, 3.2, ((i * 2.3) % 6.8));
    out.push(s.koniec());
  });
  const baza = new Sciezka(false);
  cantor(3).forEach(([a, b]) => baza.M(X(a), yB + 7).L(X(b), yB + 7));
  out.push(baza.koniec());
  out.push(kropka(A[0], A[1]));
  return { sciezki: out, opis: `16 odcinków (końce przedziałów zbioru Cantora po 3 krokach); ciągłe: nad 0 i 1, przerywane: nad końcami usuniętych przedziałów` };
}

/* 5. Lemat KKM: pokrycie trójkąta trzema zbiorami domkniętymi Cᵢ = {p : λᵢ(p)·wᵢ(p) ≥ λⱼ(p)·wⱼ(p) dla wszystkich j} */
function znakKKM() {
  const V = [[16, 206], [184, 206], [100, 206 - 168 * Math.sqrt(3) / 2]];
  const G = [(V[0][0] + V[1][0] + V[2][0]) / 3, (V[0][1] + V[1][1] + V[2][1]) / 3];
  const pkt = (l) => [l[0] * V[0][0] + l[1] * V[1][0] + l[2] * V[2][0], l[0] * V[0][1] + l[1] * V[1][1] + l[2] * V[2][1]];
  // wagi dodatnie, gładkie: krzywią granice zbiorów (dowolne wagi dają pokrycie KKM: na ścianie {i,j} λₖ = 0)
  const w = [
    (p) => Math.exp(0.9 * (p[0] - G[0]) / 100 + 0.5 * (p[1] - G[1]) / 100),
    (p) => Math.exp(-0.7 * Math.sin((p[1] - G[1]) / 40) + 0.3 * (p[0] - G[0]) / 100),
    (p) => Math.exp(0.6 * Math.cos((p[0] - G[0]) / 45) - 0.35),
  ];
  const g = (l, i) => l[i] * w[i](pkt(l));
  // punkt wspólny: λᵢ ∝ 1/wᵢ(p) — iteracja punktu stałego
  let l = [1 / 3, 1 / 3, 1 / 3];
  for (let it = 0; it < 200; it++) {
    const p = pkt(l), q = w.map((wi) => 1 / wi(p)), s = q[0] + q[1] + q[2];
    l = q.map((x) => x / s);
  }
  const T = pkt(l);
  if (Math.abs(g(l, 0) - g(l, 1)) > 1e-9 || Math.abs(g(l, 1) - g(l, 2)) > 1e-9) throw new Error('KKM: brak zbieżności');
  const out = [];
  const tr = new Sciezka(false); tr.M(...V[0]).L(...V[1]).L(...V[2]).L(...V[0]); out.push(tr.koniec());
  // granica Cᵢ/Cⱼ: dla t∈[0,1] na prostej λₖ = t·λₖ(T) szukamy λᵢ z λᵢwᵢ = λⱼwⱼ (bisekcja)
  [[0, 1, 2], [1, 2, 0], [2, 0, 1]].forEach(([i, j, k]) => {
    const s = new Sciezka(false), P = [];
    for (let n = 0; n <= 40; n++) {
      const lk = (n / 40) * l[k], reszta = 1 - lk;
      let a = 1e-9, b = reszta - 1e-9;
      const h = (li) => { const L = []; L[i] = li; L[j] = reszta - li; L[k] = lk; return g(L, i) - g(L, j); };
      for (let it = 0; it < 60; it++) { const m = (a + b) / 2; if (h(a) * h(m) <= 0) b = m; else a = m; }
      const L = []; L[i] = (a + b) / 2; L[j] = reszta - L[i]; L[k] = lk;
      // kontrola: na granicy trzeci zbiór nie przeważa
      if (n < 40 && g(L, k) > g(L, i) + 1e-9) throw new Error('KKM: granica wchodzi w trzeci zbiór');
      P.push(pkt(L));
    }
    s.lamana(P); out.push(s.koniec());
  });
  // łuki przy wierzchołkach numerują zbiory: 1, 2 i 3 łuki (wierzchołek i należy tylko do Cᵢ)
  V.forEach((v, i) => {
    const s = new Sciezka(false);
    const a = V[(i + 1) % 3], b = V[(i + 2) % 3];
    let a0 = Math.atan2(a[1] - v[1], a[0] - v[0]), a1 = Math.atan2(b[1] - v[1], b[0] - v[0]);
    if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI; if (a0 - a1 > Math.PI) a0 -= 2 * Math.PI;
    for (let k = 0; k <= i; k++) s.luk(v[0], v[1], 15 + 5 * k, Math.min(a0, a1), Math.max(a0, a1));
    out.push(s.koniec());
  });
  out.push(kropka(T[0], T[1]));
  return { sciezki: out, opis: `punkt wspólny trzech zbiorów: (${T[0].toFixed(1)}, ${T[1].toFixed(1)}), współrzędne barycentryczne ${l.map((x) => x.toFixed(3)).join(', ')}` };
}

/* 6. Ostatni pomniejszający (Banach–Knaster): 3 osoby, różne gęstości wartości tortu, symulacja procedury */
function znakTort() {
  // gęstości (całka z części kosinusowej po [0,1] = 0, więc każda ma całkę 1); nigdzie się nie zerują
  const C = (a, k, m) => (x) => 1 + a * Math.cos(2 * Math.PI * k * (x - m));
  const surowe = [C(0.85, 1, 0.74), C(0.6, 2, 0.12), C(0.85, 1, 0.08)];
  const M = 2000, dx = 1 / M;
  const calk = surowe.map((v) => { let s = 0; for (let i = 0; i < M; i++) s += v((i + 0.5) * dx) * dx; return s; });
  const v = surowe.map((f, i) => (x) => f(x) / calk[i]); // gęstości o całce 1
  const V = (i, a, b) => { let s = 0; const n = Math.max(1, Math.round((b - a) * M)); const h = (b - a) / n; for (let k = 0; k < n; k++) s += v[i](a + (k + 0.5) * h) * h; return s; };
  const ciecie = (i, a, cel) => { let lo = a, hi = 1; for (let it = 0; it < 50; it++) { const m = (lo + hi) / 2; if (V(i, a, m) < cel) lo = m; else hi = m; } return (lo + hi) / 2; };
  // procedura: w każdej rundzie kawałek ma być wart 1/m reszty (m — liczba pozostałych) w ocenie tnącego
  let gracze = surowe.map((_, i) => i), a = 0;
  const propozycje = [], ciecia = [], przydzial = [];
  while (gracze.length > 2) {
    const m = gracze.length, cel = (i) => V(i, a, 1) / m;
    let c = ciecie(gracze[0], a, cel(gracze[0])), ostatni = gracze[0];
    propozycje.push(c);
    for (const j of gracze.slice(1)) if (V(j, a, c) > cel(j) + 1e-9) { c = ciecie(j, a, cel(j)); ostatni = j; propozycje.push(c); }
    ciecia.push(c); przydzial.push({ gracz: ostatni, od: a, do: c });
    gracze = gracze.filter((g) => g !== ostatni); a = c;
  }
  // dwie osoby: dziel i wybieraj
  const [p, q] = gracze, c2 = ciecie(p, a, V(p, a, 1) / 2);
  ciecia.push(c2); propozycje.push(c2);
  const qLewy = V(q, a, c2) >= V(q, c2, 1);
  przydzial.push({ gracz: qLewy ? q : p, od: a, do: c2 }, { gracz: qLewy ? p : q, od: c2, do: 1 });
  // kontrola proporcjonalności: każdy ≥ 1/4 we własnej ocenie
  przydzial.forEach((k) => { if (V(k.gracz, k.od, k.do) < 1 / surowe.length - 1e-6) throw new Error('tort: ktoś dostał mniej niż 1/n'); });

  const x0 = 18, x1 = 182, X = (u) => x0 + (x1 - x0) * u, base = 150, H = 104;
  let vmax = 0; for (let i = 0; i < v.length; i++) for (let k = 0; k <= 200; k++) vmax = Math.max(vmax, v[i](k / 200));
  const out = [];
  const os = new Sciezka(false); os.M(X(0), base).L(X(1), base); out.push(os.koniec());
  v.forEach((vi) => { const s = new Sciezka(false), P = []; for (let k = 0; k <= 80; k++) P.push([X(k / 80), base - H * vi(k / 80) / vmax]); s.lamana(P); out.push(s.koniec()); });
  const rt = new Sciezka(false); rt.M(X(0), 176).L(X(1), 176).L(X(1), 206).L(X(0), 206).L(X(0), 176); out.push(rt.koniec());
  const tk = new Sciezka(false); propozycje.forEach((c) => tk.M(X(c), 160).L(X(c), 169)); out.push(tk.koniec());
  ciecia.forEach((c) => { const s = new Sciezka(true); s.M(X(c), 172).L(X(c), 210); out.push(s.koniec()); });
  return {
    sciezki: out,
    opis: `cięcia: ${ciecia.map((c) => c.toFixed(3)).join(', ')}; propozycje (z pomniejszeniami): ${propozycje.map((c) => c.toFixed(3)).join(', ')}; ` +
      `każdy dostaje we własnej ocenie: ${przydzial.map((k) => `osoba ${k.gracz + 1}: ${V(k.gracz, k.od, k.do).toFixed(3)}`).join(', ')}`,
  };
}

/* 7. Metoda Knastera (licytacja w kopertach): przykład z MacTutor — 3 spadkobierców, oferty 9000, 8100, 7200 */
function znakKoperty() {
  const oferty = [9000, 8100, 7200], n = oferty.length;
  const wyg = oferty.indexOf(Math.max(...oferty));
  // zwycięzca wpłaca (n−1)/n swojej oferty, pozostali biorą 1/n swojej, nadwyżkę dzieli się po równo
  let kasa = oferty[wyg] * (n - 1) / n;
  oferty.forEach((b, i) => { if (i !== wyg) kasa -= b / n; });
  const nadwyzka = kasa / n;
  const dostaje = oferty.map((b) => b / n + nadwyzka); // wartość tego, co każdy dostaje, we własnej ocenie
  const base = 214, sk = 160 / 9000, w = 34, xs = [30, 83, 136];
  const out = [];
  const os = new Sciezka(false); os.M(18, base).L(182, base); out.push(os.koniec());
  oferty.forEach((b, i) => {
    const x = xs[i], top = base - b * sk;
    const s = new Sciezka(false); s.M(x, base).L(x, top).L(x + w, top).L(x + w, base); out.push(s.koniec());
    const u = new Sciezka(false); u.przerywana(x + 2, base - (b / n) * sk, x + w - 2, base - (b / n) * sk, 4, 3); out.push(u.koniec());
    const g = new Sciezka(true); g.M(x - 3, base - dostaje[i] * sk).L(x + w + 3, base - dostaje[i] * sk); out.push(g.koniec());
  });
  // przedmiot dostaje najwyższa oferta: kropka nad jej słupkiem
  out.push(kropka(xs[wyg] + w / 2, base - oferty[wyg] * sk - 12));
  return { sciezki: out, opis: `udziały 1/3: ${oferty.map((b) => b / n).join(', ')}; nadwyżka na osobę: ${nadwyzka}; każdy dostaje: ${dostaje.join(', ')}` };
}

/* 8. Kontinuum dziedzicznie nierozkładalne (pseudołuk): łańcuch ogniw i łańcuch „krzywy” w nim — wykres ψ = φ∘φ */
function znakPseudoluk() {
  // wzorzec „krzywy” dla 7 ogniw: z ogniwa 1 do 6, z powrotem do 2, potem do 7 — φ: 0 → 5/6 → 1/6 → 1 (stała prędkość)
  const W = [0, 5 / 6, 1 / 6, 1], dl = [5 / 6, 4 / 6, 5 / 6], T = [0, 5 / 14, 9 / 14, 1];
  const phi = (t) => { for (let k = 0; k < 3; k++) if (t <= T[k + 1] + 1e-12) return W[k] + (W[k + 1] - W[k]) * (t - T[k]) / (T[k + 1] - T[k]); return 1; };
  const psi = (t) => phi(phi(t));
  const K = 7, rx = 13.5, ry = 84, cy = 130, xa = 14 + rx, xb = 186 - rx, d = (xb - xa) / (K - 1);
  if (2 * rx <= d) throw new Error('ogniwa się nie zachodzą');
  const out = [];
  for (let k = 0; k < K; k++) {
    // elipsa jako dwa łuki Béziera (przybliżenie 4-łukowe, κ = 0,5523)
    const x = xa + k * d, kk = 0.5523, s = new Sciezka(false);
    s.M(x, cy - ry).C(x + kk * rx, cy - ry, x + rx, cy - kk * ry, x + rx, cy).C(x + rx, cy + kk * ry, x + kk * rx, cy + ry, x, cy + ry)
      .C(x - kk * rx, cy + ry, x - rx, cy + kk * ry, x - rx, cy).C(x - rx, cy - kk * ry, x - kk * rx, cy - ry, x, cy - ry);
    out.push(s.koniec());
  }
  // ψ jest kawałkami liniowa; punkty załamania: załamania φ oraz t, dla których φ(t) trafia w załamanie φ
  const g = new Sciezka(true), y0 = cy - ry + 16, y1 = cy + ry - 16;
  const tz = new Set(T);
  for (let k = 0; k < 3; k++) [T[1], T[2]].forEach((c) => {
    const lo = Math.min(W[k], W[k + 1]), hi = Math.max(W[k], W[k + 1]);
    if (c > lo && c < hi) tz.add(T[k] + (T[k + 1] - T[k]) * (c - W[k]) / (W[k + 1] - W[k]));
  });
  const P = [...tz].sort((a, b) => a - b).map((t) => [t, psi(t)]);
  const zalamania = P.map((p) => +p[1].toFixed(3));
  g.lamana(P.map(([t, x]) => [xa + (xb - xa) * x, y0 + (y1 - y0) * t])); out.push(g.koniec());
  return { sciezki: out, opis: `${K} ogniw (elipsy ${2 * rx}×${2 * ry}); w środku wykres ψ = φ∘φ, φ: 0→5/6→1/6→1; kolejne położenia: ${zalamania.join(' → ')}` };
}

/* 9. Warunek Knastera: rodzina przedziałów (plan zajęć); pogrubiona — największa podrodzina przecinająca się parami */
function znakPrzedzialy() {
  let z = 20231941; const los = () => ((z = (z * 1103515245 + 12345) % 2147483648) / 2147483648);
  const n = 13, P = [];
  for (let i = 0; i < n; i++) {
    const dl = 0.16 + 0.34 * los(), a = los() * (1 - dl);
    P.push([a, a + dl]);
  }
  // przedziały na prostej przecinają się parami ⇔ mają punkt wspólny (Helly): szukamy punktu w największej liczbie przedziałów
  let best = -1, tBest = 0;
  for (let t = 0; t <= 1; t += 0.001) { const k = P.filter(([a, b]) => a <= t && t <= b).length; if (k > best) { best = k; tBest = t; } }
  const wyb = P.map(([a, b]) => a <= tBest && tBest <= b);
  // środek najszerszego przedziału t z maksymalną liczbą
  let lo = tBest, hi = tBest;
  while (lo - 0.001 >= 0 && P.filter(([a, b]) => a <= lo - 0.001 && lo - 0.001 <= b).length === best) lo -= 0.001;
  while (hi + 0.001 <= 1 && P.filter(([a, b]) => a <= hi + 0.001 && hi + 0.001 <= b).length === best) hi += 0.001;
  const tS = (lo + hi) / 2;
  const X = (u) => 20 + 160 * u, Y = (i) => 52 + 13 * i;
  const out = [];
  P.forEach(([a, b], i) => {
    const s = new Sciezka(wyb[i]), y = Y(i);
    s.M(X(a), y - 3.5).L(X(a), y + 3.5).M(X(a), y).L(X(b), y).M(X(b), y - 3.5).L(X(b), y + 3.5);
    out.push(s.koniec());
  });
  const pion = new Sciezka(false); pion.przerywana(X(tS), 40, X(tS), 220, 4, 3.5); out.push(pion.koniec());
  return { sciezki: out, opis: `${n} przedziałów, pogrubione ${best} (wszystkie zawierają t = ${tS.toFixed(3)}, więc przecinają się parami)` };
}

/* 10. Problem Knastera (przypadek okręgu): f na okręgu, para punktów pod kątem α, obrót wyrównujący wartości */
function znakSfera() {
  const cx = 100, cy = 128, R0 = 62, A = 16;
  const f = (t) => 0.55 * Math.sin(t) + 0.3 * Math.cos(2 * t + 0.7) + 0.15 * Math.sin(3 * t - 1.1);
  const r = (t) => R0 + A * f(t);
  const alfa = 115 * Math.PI / 180;
  // g(φ) = f(φ+α) − f(φ) ma średnią 0, więc ma miejsce zerowe; wybieramy pierwsze po φ₀ (konfiguracja wyjściowa)
  const phi0 = -40 * Math.PI / 180, g = (p) => f(p + alfa) - f(p);
  let a = phi0, b = phi0, krok = 0.01;
  while (g(a) * g(b + krok) > 0) b += krok;
  b += krok;
  for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (g(a) * g(m) <= 0) b = m; else a = m; }
  const phi = (a + b) / 2, rs = r(phi);
  // kąty matematyczne (oś y w górę) → ekran
  const P = (t, rr) => [cx + rr * Math.cos(t), cy - rr * Math.sin(t)];
  const out = [];
  const kr = new Sciezka(false), Q = [];
  for (let i = 0; i <= 240; i++) { const t = 2 * Math.PI * i / 240; Q.push(P(t, r(t))); }
  kr.lamana(Q); out.push(kr.koniec());
  const poz = new Sciezka(false);
  for (let i = 0; i < 64; i++) { const t0 = 2 * Math.PI * i / 64; const p0 = P(t0, rs), p1 = P(t0 + 2 * Math.PI / 128, rs); poz.M(...p0).L(...p1); }
  out.push(poz.koniec());
  // konfiguracja wyjściowa (cienko, przerywana) i obrócona (grubo)
  const wy = new Sciezka(false);
  [phi0, phi0 + alfa].forEach((t) => { const e = P(t, r(t)); wy.przerywana(cx, cy, e[0], e[1], 4, 3.5); });
  out.push(wy.koniec());
  const ob = new Sciezka(true);
  [phi, phi + alfa].forEach((t) => { const e = P(t, rs); ob.M(cx, cy).L(e[0], e[1]); });
  out.push(ob.koniec());
  // strzałka obrotu: łuk od φ₀+α do φ+α na promieniu 24
  const st = new Sciezka(false), ra = 24;
  const t0 = phi0 + alfa + 0.12, t1 = phi + alfa - 0.12;
  const Ql = []; for (let i = 0; i <= 24; i++) { const t = t0 + (t1 - t0) * i / 24; Ql.push(P(t, ra)); }
  st.lamana(Ql);
  const te = P(t1, ra), tp = P(t1 - 0.05 * Math.sign(t1 - t0), ra);
  grot(st, te[0], te[1], te[0] - tp[0], te[1] - tp[1], 6, 3.6);
  out.push(st.koniec());
  [phi, phi + alfa].forEach((t) => { const e = P(t, rs); out.push(kropka(e[0], e[1])); });
  return { sciezki: out, opis: `α = 115°, obrót o ${((phi - phi0) * 180 / Math.PI).toFixed(1)}°; f(φ) = f(φ+α) = ${f(phi).toFixed(4)} (φ = ${(phi * 180 / Math.PI).toFixed(1)}°)` };
}

/* 11. Bijednorodność: okrąg — symetria względem osii zamienia p i q; cięciwy łączą pary punktów zamienianych */
function znakZamiana() {
  const cx = 100, cy = 129, R = 76, beta = 62 * Math.PI / 180; // kierunek osi symetrii
  const P = (t) => [cx + R * Math.cos(t), cy - R * Math.sin(t)];
  const odbij = (t) => 2 * beta - t; // symetria względem prostej o kierunku β przez środek
  const out = [];
  const ok = new Sciezka(false); ok.luk(cx, cy, R, 0, 2 * Math.PI); out.push(ok.koniec());
  const osS = new Sciezka(false);
  const e1 = [cx + 84 * Math.cos(beta), cy - 84 * Math.sin(beta)], e2 = [cx - 84 * Math.cos(beta), cy + 84 * Math.sin(beta)];
  osS.przerywana(e2[0], e2[1], e1[0], e1[1], 5, 3.5); out.push(osS.koniec());
  const tp = beta + 1.15; // p; q = odbicie p
  const cie = new Sciezka(false);
  [0.35, 0.75, 1.55, 1.95, 2.4, 2.8].forEach((d) => {
    const a = P(beta + d), b = P(odbij(beta + d)); cie.M(...a).L(...b);
  });
  out.push(cie.koniec());
  const p = P(tp), q = P(odbij(tp));
  const g = new Sciezka(true);
  const ux = (q[0] - p[0]) / Math.hypot(q[0] - p[0], q[1] - p[1]), uy = (q[1] - p[1]) / Math.hypot(q[0] - p[0], q[1] - p[1]);
  const pa = [p[0] + ux * 8, p[1] + uy * 8], qa = [q[0] - ux * 8, q[1] - uy * 8];
  g.M(...pa).L(...qa);
  grot(g, qa[0], qa[1], ux, uy, 7, 4); grot(g, pa[0], pa[1], -ux, -uy, 7, 4);
  out.push(g.koniec());
  out.push(kropka(...p), kropka(...q));
  return { sciezki: out, opis: `symetria osiowa okręgu (oś pod kątem 62°) zamienia p i q; 5 cięciw prostopadłych do osi` };
}

/* 12. Wachlarz harmoniczny — klasyczny dendroid (seminarium Knastera: kolebka teorii dendroidów) */
function znakDendroid() {
  const A = [36, 42], yB = 214, W = 148;
  const out = [];
  for (let n = 1; n <= 7; n++) { const s = new Sciezka(false); s.M(A[0], A[1]).L(A[0] + W / n, yB); out.push(s.koniec()); }
  const g = new Sciezka(true); g.M(A[0], A[1]).L(A[0], yB); out.push(g.koniec());
  const baza = new Sciezka(false);
  for (let n = 1; n <= 7; n++) { const x = A[0] + W / n; baza.M(x, yB + 4).L(x, yB + 8); }
  out.push(baza.koniec());
  out.push(kropka(A[0], A[1]));
  return { sciezki: out, opis: `odcinki z wierzchołka do punktów 1/n (n = 1…7) i odcinek graniczny (pogrubiony); odstęp przy n = 7: ${(W / 42).toFixed(1)}` };
}

/* 13. Drzewo doktoratów Knastera (dane: Mathematics Genealogy Project), gałązka ≈ 4 potomków */
function znakDrzewo() {
  const dane = [ // [nazwisko, rok doktoratu, liczba potomków wg MGP]
    ['Reichbach', 1956, 32], ['Lelek', 1959, 17], ['Mioduszewski', 1959, 29], ['Duda', 1961, 6],
    ['Charatonik', 1965, 18], ['Rudolf', 1969, 0], ['Mańka', 1977, 0], ['Zaremba', null, 0],
  ];
  const root = [110, 216], rx = 62, ry = 96;
  const out = [];
  const kr = new Sciezka(true);
  const wezly = dane.map((d, i) => {
    const th = (160 - i * (140 / 7)) * Math.PI / 180;
    const w = [root[0] + rx * Math.cos(th), root[1] - ry * Math.sin(th)];
    const L = Math.hypot(w[0] - root[0], w[1] - root[1]), u = [(w[0] - root[0]) / L, (w[1] - root[1]) / L];
    const o = [root[0] + u[0] * 9, root[1] + u[1] * 9];
    kr.M(...o).L(...w);
    return { w, u, k: Math.round(d[2] / 4) };
  });
  out.push(kr.koniec());
  wezly.forEach(({ w, u, k }) => {
    if (!k) return;
    const s = new Sciezka(false), base = Math.atan2(u[1], u[0]), sp = 10 * Math.PI / 180, dl = 28;
    for (let j = 0; j < k; j++) { const a = base + (j - (k - 1) / 2) * sp; s.M(...w).L(w[0] + dl * Math.cos(a), w[1] + dl * Math.sin(a)); }
    out.push(s.koniec());
  });
  out.push(kropka(...root));
  const suma = dane.reduce((s, d) => s + d[2], 0) + dane.length;
  return { sciezki: out, opis: `8 doktoratów (MGP), gałązki: ${wezly.map((x) => x.k).join(', ')} (zaokrąglone potomkowie/4); łącznie potomków wg MGP: ${suma}` };
}

/* 14. Twierdzenie Knastera–Reichbacha: zbiór Cantora u góry i u dołu; homeomorfizm zadany na kawałkach (grubo) i jego przedłużenie */
function znakPrzedluzenie() {
  const iv = cantor(3), X = (u) => 16 + 168 * u, yG = 58, yD = 200;
  // h permutuje 8 przedziałów poziomu 3 (na każdym liniowo); P = {0, 3, 5} → K = {6, 1, 4} (zadane), reszta — przedłużenie
  const h = [6, 3, 0, 1, 7, 4, 2, 5];
  const P = new Set([0, 3, 5]);
  const odw = new Set([3]); // na tym kawałku h odwraca orientację
  const Kset = new Set([...P].map((i) => h[i]));
  if (new Set(h).size !== 8) throw new Error('h nie jest permutacją');
  const out = [];
  const rzad = (y, wyr, gruba) => { const s = new Sciezka(gruba); iv.forEach(([a, b], i) => { if (wyr(i) === gruba) s.M(X(a), y).L(X(b), y); }); return s.koniec(); };
  out.push(rzad(yG, (i) => P.has(i), false), rzad(yG, (i) => P.has(i), true), rzad(yD, (i) => Kset.has(i), false), rzad(yD, (i) => Kset.has(i), true));
  // wcześniejsze etapy zbioru Cantora nad górnym i pod dolnym rzędem
  [1, 2].forEach((k) => { const s = new Sciezka(false); cantor(k).forEach(([a, b]) => { s.M(X(a), yG - 9 * (3 - k)).L(X(b), yG - 9 * (3 - k)); s.M(X(a), yD + 9 * (3 - k)).L(X(b), yD + 9 * (3 - k)); }); out.push(s.koniec()); });
  const cienkie = new Sciezka(false), grube = new Sciezka(true);
  iv.forEach(([a, b], i) => {
    const [c, d] = iv[h[i]], s = P.has(i) ? grube : cienkie;
    const xa = X((a + b) / 2), xb = X((c + d) / 2), ym = (yG + yD) / 2;
    s.M(xa, yG + 5).C(xa, ym, xb, ym, xb, yD - 5);
    if (odw.has(i)) { /* odwrócenie orientacji: krzyżyk-znacznik niepotrzebny w małej skali */ }
  });
  out.push(cienkie.koniec(), grube.koniec());
  return { sciezki: out, opis: `poziom 3 zbioru Cantora; h = [${h.join(', ')}]; zadane na kawałkach 0, 3, 5 (grubo), reszta to przedłużenie` };
}

/* ================ Dopisane 5.11: rysunki nowych ciekawostek ================ */
const PI = Math.PI;
function rdp(p, eps) { // uproszczenie łamanej (Ramer–Douglas–Peucker)
  if (p.length < 3) return p.slice();
  const a = p[0], b = p[p.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  let iM = 0, dM = -1;
  for (let i = 1; i < p.length - 1; i++) {
    const d = L > 1e-9 ? Math.abs(dy * (p[i][0] - a[0]) - dx * (p[i][1] - a[1])) / L : Math.hypot(p[i][0] - a[0], p[i][1] - a[1]);
    if (d > dM) { dM = d; iM = i; }
  }
  if (dM <= eps) return [a, b];
  return rdp(p.slice(0, iM + 1), eps).slice(0, -1).concat(rdp(p.slice(iM), eps));
}
const linia = (P, gruba = false, eps = 0.12) => new Sciezka(gruba).lamana(rdp(P, eps)).koniec();
const petla = (P, gruba = false, eps = 0.12) => linia(P.concat([P[0]]), gruba, eps);
const kolo = (c, r, gruba = false, n = 180) => petla(Array.from({ length: n }, (_, i) => { const a = 2 * PI * i / n; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; }), gruba, 0.08);

/* 15. Problem Knastera–Kuratowskiego (1920): trzy typy jednorodnych kontinuów płaskich (Hoehn, Oversteegen 2016), schematycznie */
function znakJednorodne() {
  const g = (t) => t <= 0.4 ? 1.5 * t : t <= 0.6 ? 0.6 - (t - 0.4) : 0.4 + 1.5 * (t - 0.6); // przekształcenie „pokręcone”: w górę do 0,6, w dół do 0,4, w górę do 1
  const gn = (t, n) => { let x = t; for (let i = 0; i < n; i++) x = g(x); return x; };
  const out = [];
  // 1. okrąg
  out.push(kolo([58, 84], 41, true));
  // 2. pseudołuk: wykres trzykrotnego złożenia g
  const N = 1600, x0 = 113, y0 = 124, B = 75;
  const wyk = Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return [x0 + B * t, y0 - 80 * gn(t, 3)]; });
  out.push(linia(wyk, true, 0.05));
  const ram = new Sciezka(false); ram.M(x0, y0 - 80).L(x0 + B, y0 - 80).L(x0 + B, y0).L(x0, y0).L(x0, y0 - 80); out.push(ram.koniec());
  // 3. okrąg pseudołuków: ten sam wzorzec zawinięty dookoła pierścienia
  const c = [100, 173], R0 = 38, D = 7.5, ile = 12, wz = [];
  for (let k = 0; k < ile; k++) {
    for (let i = 0; i < 90; i++) {
      const t = i / 90, a = 2 * PI * (k + gn(t, 2)) / ile - PI / 2, r = R0 + D * Math.sin(2 * PI * t);
      wz.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
    }
  }
  out.push(petla(wz, true, 0.08));
  out.push(kolo(c, R0 - D - 3.5), kolo(c, R0 + D + 3.5));
  const nadal = [0, 0.4, 0.6, 1].map((t) => g(t));
  return { sciezki: out, opis: `okrąg; wykres złożenia g³ (g przyjmuje w 0; 0,4; 0,6; 1 wartości ${nadal.map((v) => v.toFixed(1)).join('; ')}, ${3 ** 3} monotonicznych kawałków); ten sam wzór zawinięty ${ile} razy dookoła pierścienia` };
}

/* 16. Podkowa Smale'a: F na kwadracie i na czapkach; obraz poziomego odcinka to coraz dłuższy wąż, którego poziomy leżą w zbiorze Cantora */
function znakPodkowa() {
  const F = (p) => {
    const [x, y] = p;
    if (x < 0) return [x, y / 3];
    if (x <= 1 / 3) return [3 * x, y / 3];
    if (x < 2 / 3) { const u = 3 * (x - 1 / 3), r = 0.5 - y / 3, a = -PI / 2 + PI * u; return [1 + r * Math.cos(a), 0.5 + r * Math.sin(a)]; }
    if (x <= 1) return [3 - 3 * x, 1 - y / 3];
    return [-(x - 1) / 3, 1 - y / 3];
  };
  const S = 104, X0 = 32, Y0 = 77, E = (p) => [X0 + S * p[0], Y0 + S * (1 - p[1])];
  const obraz = (n) => {
    let P = Array.from({ length: 243 * 12 + 1 }, (_, i) => [i / (243 * 12), 0.5]);
    for (let k = 0; k < n; k++) P = P.map(F);
    return P;
  };
  const out = [];
  const ram = new Sciezka(false); ram.M(X0, Y0).L(X0 + S, Y0).L(X0 + S, Y0 + S).L(X0, Y0 + S).L(X0, Y0); out.push(ram.koniec());
  [2, 3].forEach((n) => out.push(linia(obraz(n).map(E), false, 0.08)));
  out.push(linia(obraz(1).map(E), true, 0.08));
  out.push(kropka(...E([0, 0])));
  const poz = [...new Set(obraz(3).filter((p) => p[0] > 0.2 && p[0] < 0.8).map((p) => p[1].toFixed(6)))].length;
  return { sciezki: out, opis: `F(x, y) = (3x, y/3) i (3 − 3x, 1 − y/3) na paskach, czapka między nimi; obraz odcinka po 1 (pogrubiony), 2 i 3 krokach; po 3 krokach ${poz} poziomych przejść na poziomach z konstrukcji zbioru Cantora; punkt stały (0, 0)` };
}

/* 17. Wachlarz Lelka (schematycznie): odcinki z wierzchołka do punktów zbioru Cantora, różne długości, końce gęste */
function znakLelek() {
  const A = [100, 40], E = konce(4), Rm = 182;
  const vdc = (k) => { let x = 0, f = 0.5; for (let m = k; m > 0; m >>= 1, f /= 2) if (m & 1) x += f; return x; };
  const kat = (u) => PI / 2 + (u - 0.5) * 0.92; // ekranowo: w dół, rozpiętość ok. 53°
  const out = [];
  const wyr = new Set([1, 6, 10, 15, 18, 22, 27, 30]);
  E.forEach((u, i) => {
    const dl = 0.42 + 0.58 * vdc(i + 1), a = kat(u), p = [A[0] + Rm * dl * Math.cos(a), A[1] + Rm * dl * Math.sin(a)];
    const s = new Sciezka(false); s.M(A[0], A[1]).L(p[0], p[1]); out.push(s.koniec());
    if (wyr.has(i)) out.push(kropka(p[0], p[1]));
  });
  return { sciezki: out, opis: `${E.length} odcinków do końców 4. kroku zbioru Cantora (na łuku), długości 0,42–1 z ciągu van der Corputa; kropki: wybrane końce (w prawdziwym wachlarzu końce są gęste)` };
}

/* 18. Praca czytana na głos: krzywa y = sin(1/x) i jej odcinek graniczny; spójne, a jednak bez drogi: luka, której na pierwszy rzut oka nie widać */
function znakSinus() {
  const X0 = 22, X1 = 181, Yc = 129, A = 66, xM = 0.13, S = (X1 - X0) / xM, P = (x) => [X0 + S * x, Yc - A * Math.sin(1 / x)];
  // próbkowanie równe w 1/x; kończymy, gdy fala ma ok. 3,5 jednostki szerokości
  const xMin = (() => { let x = xM; while (S * 2 * PI * x * x > 3.6) x *= 0.995; return x; })();
  const pts = []; for (let u = 1 / xM; u <= 1 / xMin; u += 0.03) pts.push(P(1 / u));
  const trzy = [0, 1, 2].map((k) => pts.slice(Math.floor(pts.length * k / 3), Math.floor(pts.length * (k + 1) / 3) + 1));
  const out = trzy.map((p) => linia(p, false, 0.1));
  const gr = new Sciezka(true); gr.M(X0, Yc - A).L(X0, Yc + A); out.push(gr.koniec());
  const os = new Sciezka(false); os.M(X0, Yc + A + 16).L(X1, Yc + A + 16); out.push(os.koniec());
  const k = P(xM); out.push(kropka(k[0], k[1]));
  return { sciezki: out, opis: `y = sin(1/x), x ∈ (${xMin.toFixed(3)}, ${xM}]; fale węższe niż 3,6 jedn. pominięte; pogrubiony odcinek graniczny x = 0` };
}

/* 19. Seria B: krzywa smoka, czyli wielokrotnie złożony pasek papieru (rząd 9) */
function znakSmok() {
  const n = 9; let zw = [];
  for (let k = 0; k < n; k++) zw = zw.concat([1], zw.slice().reverse().map((v) => -v)); // ciąg zgięć
  const pkt = [[0, 0]]; let dx = 1, dy = 0;
  pkt.push([dx, dy]);
  zw.forEach((v) => { [dx, dy] = [-v * dy, v * dx]; const o = pkt[pkt.length - 1]; pkt.push([o[0] + dx, o[1] + dy]); });
  const xs = pkt.map((p) => p[0]), ys = pkt.map((p) => p[1]);
  const sk = Math.min(172 / (Math.max(...xs) - Math.min(...xs)), 186 / (Math.max(...ys) - Math.min(...ys)));
  const sx = (Math.min(...xs) + Math.max(...xs)) / 2, sy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const E = (p) => [100 + sk * (p[0] - sx), 129 + sk * (p[1] - sy)];
  const kaw = 8, dl = (pkt.length - 1) / kaw, out = [];
  for (let k = 0; k < kaw; k++) out.push(new Sciezka(k === 0).lamana(pkt.slice(k * dl, (k + 1) * dl + 1).map(E)).koniec());
  return { sciezki: out, opis: `rząd ${n}: ${pkt.length - 1} odcinków po ${sk.toFixed(1)} jedn.; ciąg zgięć papieru; pogrubiona pierwsza z ${kaw} części` };
}

/* 20. Zermelo: dobry porządek typu ω², porządkowa „zapałczana”: każdy blok to kolejna kopia ω */
function znakPorzadek() {
  const X0 = 16, Y0 = 212, H0 = 170, out = [];
  const pod = new Sciezka(false); pod.M(14, Y0).L(186, Y0); out.push(pod.koniec());
  let x = X0, W = 88, H = H0, ileBl = 0, kresek = 0;
  const graniczne = new Sciezka(true);
  for (let b = 0; b < 6 && W > 5; b++) {
    const s = new Sciezka(false);
    graniczne.M(x, Y0).L(x, Y0 - H);
    let puste = true;
    for (let k = 1; ; k++) {
      const xk = x + W * (1 - 1 / (k + 1)), xn = x + W * (1 - 1 / (k + 2)), hk = H * 0.88 ** k;
      if (xn - xk < 2.2 || hk < 6) break;
      s.M(xk, Y0).L(xk, Y0 - hk); kresek++; puste = false;
    }
    if (!puste) out.push(s.koniec());
    x += W; W *= 0.52; H *= 0.72; ileBl++;
  }
  out.push(graniczne.koniec());
  return { sciezki: out, opis: `${ileBl} kopii ω (grube kreski: ω·k, liczby graniczne), ${kresek} cienkich; każdy niepusty podzbiór ma element najmniejszy` };
}

/* 21. Referat Borsuka: na płaszczyźnie dwie części nie wystarczą, trzy tak */
function znakBorsuk() {
  const R = 45, c1 = [100, 83], c2 = [100, 176], out = [];
  out.push(kolo(c1, R), kolo(c2, R));
  const cie = new Sciezka(true); cie.M(c1[0] - R, c1[1]).L(c1[0] + R, c1[1]); out.push(cie.koniec());
  out.push(kropka(c1[0] - R, c1[1]), kropka(c1[0] + R, c1[1]));
  const kp = [0, 1, 2].map((k) => { const a = -PI / 2 + k * 2 * PI / 3; return [c2[0] + R * Math.cos(a), c2[1] + R * Math.sin(a)]; });
  kp.forEach((q) => { const s = new Sciezka(true); s.M(c2[0], c2[1]).L(q[0], q[1]); out.push(s.koniec()); });
  // średnica każdego wycinka to cięciwa łącząca końce łuku 120°: R√3 < 2R
  kp.forEach((q, i) => { const r = kp[(i + 1) % 3]; const s = new Sciezka(false); s.M(q[0], q[1]).L(r[0], r[1]); out.push(s.koniec()); });
  const srednica = Math.hypot(kp[0][0] - kp[1][0], kp[0][1] - kp[1][1]);
  return { sciezki: out, opis: `u góry przecięcie na 2: punkty antypodyczne w tej samej części, średnica 2R = ${2 * R}; u dołu 3 wycinki o średnicy R√3 = ${srednica.toFixed(1)} < ${2 * R}` };
}

/* 22. Banach po francusku: kule jednostkowe przestrzeni ℓp na płaszczyźnie */
function znakKule() {
  const c = [100, 129], R = 84, out = [];
  const piln = (p) => Array.from({ length: 360 }, (_, i) => {
    const a = 2 * PI * i / 360, x = Math.cos(a), y = Math.sin(a);
    const n = p === Infinity ? Math.max(Math.abs(x), Math.abs(y)) : (Math.abs(x) ** p + Math.abs(y) ** p) ** (1 / p);
    return [c[0] + R * x / n, c[1] + R * y / n];
  });
  [1, 1.4, 3, Infinity].forEach((p) => out.push(petla(piln(p), false, 0.1)));
  out.push(petla(piln(2), true, 0.08));
  const os = new Sciezka(false); os.M(c[0] - R - 2, c[1]).L(c[0] + R + 2, c[1]).M(c[0], c[1] - R - 2).L(c[0], c[1] + R + 2); out.push(os.koniec());
  return { sciezki: out, opis: 'kule jednostkowe ℓp dla p = 1; 1,4; 2 (pogrubiona, przestrzeń Hilberta); 3; ∞' };
}

/* 23. Róże: krzywe różane (Grandi) r = cos(kθ) */
function znakRoza() {
  const c = [100, 129], out = [];
  const roza = (R, n, d, gruba) => {
    const obr = d % 2 === 1 && n % 2 === 1 ? d : 2 * d, N = 1400;
    const P = Array.from({ length: N }, (_, i) => { const t = obr * PI * i / N, r = R * Math.cos(n * t / d); return [c[0] + r * Math.cos(t - PI / 2), c[1] + r * Math.sin(t - PI / 2)]; });
    return petla(P, gruba, 0.1);
  };
  out.push(kolo(c, 86), roza(86, 7, 2, false), roza(58, 5, 1, false), roza(34, 3, 1, false), roza(86, 5, 3, true));
  return { sciezki: out, opis: 'krzywe różane r = R·cos(kθ): k = 5/3 (pogrubiona), 7/2, 5 i 3' };
}

/* 24. Akademia Medyczna: kardioida jako obwiednia cięciw k ↦ 2k na okręgu */
function znakKardioida() {
  const c = [100, 129], R = 86, n = 54, out = [kolo(c, R)];
  const P = (k) => { const a = 2 * PI * k / n + PI; return [c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]; };
  let ile = 0;
  for (let k = 1; k < n; k++) {
    const q = (2 * k) % n;
    if (q === k || Math.hypot(P(k)[0] - P(q)[0], P(k)[1] - P(q)[1]) < 3) continue;
    const s = new Sciezka(false); s.M(...P(k)).L(...P(q)); out.push(s.koniec()); ile++;
  }
  // obwiednia: dla cięciw (θ, 2θ) jest to kardioida o wierzchołku w punkcie 0
  const K = Array.from({ length: 300 }, (_, i) => { const t = 2 * PI * i / 300; const x = (2 * Math.cos(t) + Math.cos(2 * t)) / 3, y = (2 * Math.sin(t) + Math.sin(2 * t)) / 3; return [c[0] + R * x * Math.cos(PI) - R * y * Math.sin(PI), c[1] + R * x * Math.sin(PI) + R * y * Math.cos(PI)]; });
  out.push(petla(K, true, 0.1));
  return { sciezki: out, opis: `${ile} cięciw k ↦ 2k (n = ${n}), obwiednia to kardioida (2 cos t + cos 2t, 2 sin t + sin 2t)/3` };
}

/* 25. Katedra Topologii: twierdzenie Jordana; promień z punktu wewnątrz krzywej przecina ją nieparzyście wiele razy, z punktu na zewnątrz parzyście */
function znakJordan() {
  const c = [100, 129], N = 900;
  const K = Array.from({ length: N }, (_, i) => { const t = 2 * PI * i / N, r = 58 + 26 * Math.cos(3 * t + 0.6) + 11 * Math.cos(5 * t - 1); return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]; });
  const krzyz = (p, u) => { // punkty przecięcia promienia p + s·u z krzywą
    const w = [];
    for (let i = 0; i < N; i++) {
      const a = K[i], b = K[(i + 1) % N], d = [b[0] - a[0], b[1] - a[1]], det = u[0] * -d[1] + d[0] * u[1];
      if (Math.abs(det) < 1e-12) continue;
      const r = [a[0] - p[0], a[1] - p[1]], s = (r[0] * -d[1] + d[0] * r[1]) / det, q = (u[0] * r[1] - u[1] * r[0]) / det;
      if (s > 0 && q >= 0 && q < 1) w.push(s);
    }
    return w.sort((x, y) => x - y);
  };
  const wind = (p) => { let s = 0; for (let i = 0; i < N; i++) { const a = K[i], b = K[(i + 1) % N]; s += Math.atan2((a[0] - p[0]) * (b[1] - p[1]) - (a[1] - p[1]) * (b[0] - p[0]), (a[0] - p[0]) * (b[0] - p[0]) + (a[1] - p[1]) * (b[1] - p[1])); } return Math.round(s / (2 * PI)); };
  const w = [74, 176], z = [160, 56];
  // promień wyróżniony: 3 przecięcia, jak największe odstępy; promień zwykły: 2 przecięcia, blisko i z dużym odstępem
  let kw = null, kz = null, bW = -1, bZ = -1e9;
  for (let a = 0; a < 1440; a++) {
    const t = 2 * PI * a / 1440, u = [Math.cos(t), Math.sin(t)], lw = krzyz(w, u), lz = krzyz(z, u);
    if (lw.length === 3) {
      const m = Math.min(lw[0], lw[1] - lw[0], lw[2] - lw[1]), kon = [w[0] + u[0] * (lw[2] + 12), w[1] + u[1] * (lw[2] + 12)];
      if (m > bW && kon[0] > 14 && kon[0] < 186 && kon[1] > 36 && kon[1] < 222) { bW = m; kw = u; }
    }
    if (lz.length === 2) {
      const kon = [z[0] + u[0] * (lz[1] + 10), z[1] + u[1] * (lz[1] + 10)], oc = lz[1] - lz[0] - 0.4 * lz[0];
      if (oc > bZ && kon[0] > 14 && kon[0] < 186 && kon[1] > 36 && kon[1] < 222) { bZ = oc; kz = u; }
    }
  }
  const out = [petla(K, false, 0.1)];
  const pw = krzyz(w, kw), pz = krzyz(z, kz);
  const r1 = new Sciezka(true); r1.M(...w).L(w[0] + kw[0] * (pw[2] + 12), w[1] + kw[1] * (pw[2] + 12)); out.push(r1.koniec());
  const r2 = new Sciezka(false); r2.M(...z).L(z[0] + kz[0] * (pz[1] + 10), z[1] + kz[1] * (pz[1] + 10)); out.push(r2.koniec());
  out.push(kropka(...w), kropka(...z));
  pw.forEach((s) => { const q = [w[0] + kw[0] * s, w[1] + kw[1] * s]; out.push(kolo(q, 3, true, 24)); });
  return { sciezki: out, opis: `indeks punktu wewnętrznego ${wind(w)}, zewnętrznego ${wind(z)}; przecięcia promieni: ${pw.length} (nieparzyście) i ${pz.length} (parzyście)` };
}

const RYSUNKI = {
  'jednorodne-kontinua': znakJednorodne,
  'podkowa-smalea': znakPodkowa,
  'wachlarz-lelka': znakLelek,
  'praca-na-glos': znakSinus,
  'seria-b-wtn': znakSmok,
  'gosc-zermelo': znakPorzadek,
  'referat-borsuka': znakBorsuk,
  'banach-po-francusku': znakKule,
  'roze-i-skamander': znakRoza,
  'doktorat-am-1961': znakKardioida,
  'katedra-topologii': znakJordan,
  'kontinuum-knastera': znakKontinuum,
  'najpierw-medycyna': znakPoczatek,
  'knaster-tarski': znakKnasterTarski,
  'wachlarz-knastera-kuratowskiego': znakWachlarz,
  'lemat-kkm': znakKKM,
  'ostatni-pomniejszajacy': znakTort,
  'metoda-knastera': znakKoperty,
  'kontinuum-dziedzicznie-nierozkladalne': znakPseudoluk,
  'warunek-knastera': znakPrzedzialy,
  'problem-knastera': znakSfera,
  'problem-bijednorodnosci': znakZamiana,
  'seminarium-w-salonie': znakDendroid,
  'obrona-w-willi': znakDrzewo,
  'twierdzenie-knastera-reichbacha': znakPrzedluzenie,
};

/* ---------- kontrola: granice pola, liczba ścieżek, drobnica ---------- */
function sprawdz(id, sc) {
  const uw = [];
  if (sc.length < 5 || sc.length > 60) uw.push(`liczba ścieżek ${sc.length} poza 5–60`);
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  sc.forEach((s) => s._pkt.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }));
  if (minX < POLE.x0 - 0.05 || maxX > POLE.x1 + 0.05 || minY < POLE.y0 - 0.05 || maxY > POLE.y1 + 0.05) uw.push(`poza polem: x ${minX.toFixed(1)}–${maxX.toFixed(1)}, y ${minY.toFixed(1)}–${maxY.toFixed(1)}`);
  const drob = sc.flatMap((s) => s._dl).filter((l) => l < 2.95);
  if (drob.length) uw.push(`drobnica: ${drob.length} kawałków < 3 j. (min ${Math.min(...drob).toFixed(2)})`);
  return { uw, bbox: [minX, minY, maxX, maxY].map((v) => +v.toFixed(1)) };
}

/* ---------- wyjście ---------- */
const wynik = [], raportRys = [];
for (const fakt of FAKTY) {
  const gen = RYSUNKI[fakt.id];
  if (!gen) throw new Error('brak rysunku dla ' + fakt.id);
  const { sciezki, opis } = gen();
  const kontrola = sprawdz(fakt.id, sciezki);
  raportRys.push({ id: fakt.id, opis, sciezek: sciezki.length, grubych: sciezki.filter((s) => s.gruba).length, ...kontrola });
  wynik.push({ ...fakt, sciezki: sciezki.map((s) => ({ d: s.d, gruba: s.gruba })) });
}
const dir = __dirname;
fs.writeFileSync(path.join(dir, 'ciekawostki.json'), JSON.stringify(wynik, null, 2) + '\n');
raportRys.forEach((r) => console.log(`${r.uw.length ? '!!' : 'ok'} ${r.id}: ${r.sciezek} ścieżek (${r.grubych} grubych), bbox ${r.bbox.join(' ')}${r.uw.length ? ' — ' + r.uw.join('; ') : ''}\n   ${r.opis}`));


/* ---------- podgląd ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (ps, w, h) => `<svg viewBox="0 0 200 240" width="${w}" height="${h}" aria-hidden="true">${ps.map((p) => `<path d="${p.d}"${p.gruba ? ' class="gruba"' : ''}/>`).join('')}</svg>`;
const karty = wynik.map((c, i) => `
  <article class="karta">
    <div class="baner">
      <div class="podpis"><b>${esc(c.nazwa)}, ${esc(c.rok)}</b>${esc(c.zdanie)}</div>
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
        <p class="rys"><i>Rysunek:</i> ${esc(raportRys[i].opis)} · ${raportRys[i].sciezek} ścieżek</p>
      </div>
    </div>
  </article>`).join('');
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Knaster — ciekawostki i rysunki</title>
<style>
:root { --granat: #0d1830; --j: #f07d5e; --g: #5e1f14; --a: #b03a1f; --t: #fbe8e2; --tekst: #1d2433; --szary: #5b6475; }
* { box-sizing: border-box; }
body { margin: 0; padding: 28px 24px 40px; background: #f4f1ee; color: var(--tekst); font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
h1 { margin: 0 0 4px; font-size: 24px; } .lead { margin: 0 0 22px; color: var(--szary); max-width: 900px; }
.siatka { display: grid; grid-template-columns: repeat(auto-fill, minmax(560px, 1fr)); gap: 18px; }
.karta { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgb(0 0 0 / .12); }
.baner { position: relative; height: 190px; color: #fff; background: linear-gradient(100deg, var(--granat) 0, var(--granat) 42%, color-mix(in srgb, var(--granat) 55%, var(--g)) 72%, var(--g) 100%); }
.baner svg { position: absolute; right: 18px; top: 10px; }
.baner .podpis { position: absolute; right: 178px; top: 58px; width: 230px; text-align: right; font-size: 12.5px; line-height: 1.45; color: rgb(255 255 255 / .72); }
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
<h1>Bronisław Knaster — ciekawostki do podstron działu Studia</h1>
<p class="lead">${wynik.length} ciekawostek (${wynik.filter((c) => c.podstrona !== 'zapas').length} przypisanych, ${wynik.filter((c) => c.podstrona === 'zapas').length} w zapasie). U góry każdej karty: podgląd w niskim nagłówku (rysunek 145×170 px, kreski 1,3 i 2 px, kolor działu); niżej mały rysunek na jasnym tle. Wszystkie współrzędne policzone w <code>generator.js</code>.</p>
<div class="siatka">${karty}</div>
</body></html>
`;
fs.writeFileSync(path.join(dir, 'rysunki.html'), html);

if (process.argv.includes('--png')) {
  (async () => {
    const { chromium } = require('playwright');
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1.5 });
    await p.goto('file://' + path.join(dir, 'rysunki.html'));
    await p.screenshot({ path: path.join(dir, 'rysunki.png'), fullPage: true });
    await b.close();
    console.log('rysunki.png zapisany');
  })();
}
