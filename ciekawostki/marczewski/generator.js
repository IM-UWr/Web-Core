// Ciekawostki patrona działu Instytut: Edward Marczewski (1907–1976; do wojny publikował jako Edward Szpilrajn).
// Generator liczy ścieżki rysunków (viewBox 0 0 200 240, pole x 12–188, y 34–224) i zapisuje:
//   ciekawostki.json — teksty z ./teksty.js + policzone ścieżki,
//   rysunki.html     — podgląd wszystkich rysunków z opisami.
// Uruchomienie: node generator.js   (bez zależności; zrzut rysunki.png robi zrzut.js przez Playwright)
'use strict';
const fs = require('fs');
const path = require('path');

/* ---------- narzędzia ---------- */
const f1 = (v) => { const r = Math.round(v * 10) / 10; return Object.is(r, -0) ? 0 : r; };
const P = (p) => `${f1(p[0])},${f1(p[1])}`;
const lamana = (pts, zamk = false) => 'M' + pts.map(P).join('L') + (zamk ? 'Z' : '');
const odcinek = (a, b) => `M${P(a)} L${P(b)}`;
const okrag = (c, r) => `M${f1(c[0] - r)},${f1(c[1])} a${f1(r)},${f1(r)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-2 * r)},0`;
const kropka = (c) => okrag(c, 4.5);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const POLE = { x0: 12, x1: 188, y0: 34, y1: 224 };
// krzywa Catmulla–Roma przez punkty (jak w obecnym znaku Szpilrajna)
function gladka(lin) {
  let d = `M${P(lin[0])}`;
  for (let i = 0; i < lin.length - 1; i++) {
    const p0 = lin[Math.max(0, i - 1)], p1 = lin[i], p2 = lin[i + 1], p3 = lin[Math.min(lin.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}
// dopasowanie chmury punktów do prostokąta (skala jednakowa w obu osiach, środek w środku prostokąta)
function dopasuj(pts, box) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
  const s = Math.min((box.x1 - box.x0) / (mxx - mnx), (box.y1 - box.y0) / (mxy - mny));
  const ox = (box.x0 + box.x1) / 2 - s * (mnx + mxx) / 2, oy = (box.y0 + box.y1) / 2 - s * (mny + mxy) / 2;
  return { s, f: (p) => [ox + s * p[0], oy + s * p[1]] };
}
function grot(od, tip, dl = 9, szer = 4.5) { // grot strzałki w punkcie tip, kierunek od→tip
  const L = dist(od, tip), u = [(tip[0] - od[0]) / L, (tip[1] - od[1]) / L], n = [-u[1], u[0]];
  return `M${P([tip[0] - u[0] * dl + n[0] * szer, tip[1] - u[1] * dl + n[1] * szer])} L${P(tip)} L${P([tip[0] - u[0] * dl - n[0] * szer, tip[1] - u[1] * dl - n[1] * szer])}`;
}
const LOG = [];
const log = (...a) => LOG.push(a.join(' '));

/* ---------- 1. Twierdzenie Szpilrajna (1930): rozszerzenie porządku częściowego do liniowego ---------- */
function rysPorzadek() {
  // diagram Hassego: 8 elementów na 4 poziomach, krawędzie pokrycia (dolny < górny)
  const W = { a: [62, 212], b: [138, 212], c: [32, 154], d: [100, 154], e: [168, 154], f: [66, 96], g: [134, 96], h: [100, 40] };
  const kr = ['ac', 'ad', 'bd', 'be', 'cf', 'df', 'dg', 'eg', 'fh', 'gh'];
  // sortowanie topologiczne (algorytm Kahna): spośród dostępnych (wszyscy poprzednicy już ustawieni) bierzemy najniższy poziom,
  // a na każdym poziomie idziemy na przemian w prawo i w lewo — kolejka wije się jak wąż przez diagram
  const pop = {}; Object.keys(W).forEach((k) => (pop[k] = []));
  kr.forEach((k) => pop[k[1]].push(k[0]));
  const poziomy = [...new Set(Object.values(W).map((p) => p[1]))].sort((a, b) => b - a);
  const lin = [], uzyte = new Set();
  while (lin.length < 8) {
    const dost = Object.keys(W).filter((k) => !uzyte.has(k) && pop[k].every((q) => uzyte.has(q)));
    const yMin = Math.max(...dost.map((k) => W[k][1]));
    const nr = poziomy.indexOf(yMin), kier = nr % 2 === 0 ? 1 : -1;
    const k = dost.filter((q) => W[q][1] === yMin).sort((p, q) => kier * (W[p][0] - W[q][0]))[0];
    lin.push(k); uzyte.add(k);
  }
  // sprawdzenie: to naprawdę rozszerzenie liniowe (każda krawędź pokrycia idzie w górę kolejki)
  kr.forEach((k) => { if (lin.indexOf(k[0]) > lin.indexOf(k[1])) throw new Error('to nie jest rozszerzenie liniowe'); });
  log('porządek: rozszerzenie liniowe', lin.join(''));
  const out = kr.map((k) => ({ d: odcinek(W[k[0]], W[k[1]]) }));
  out.push({ d: gladka(lin.map((k) => W[k])), gruba: true });
  Object.values(W).forEach((p) => out.push({ d: kropka(p), gruba: true }));
  return out;
}

/* ---------- 2. Uczniowie: 13 doktoratów (lista z nekrologu Dudy i Hartmana) ---------- */
function rysUczniowie() {
  const U = [['S. Hartman', 1947], ['M. Nosarzewska', 1949], ['K. Urbanik', 1956], ['S. Gładysz', 1956], ['S. Paszkowski', 1958],
    ['I. Koźniewska', 1961], ['B. Jasek', 1962], ['J. Płonka', 1964], ['S. Fajtlowicz', 1967], ['K. Głazek', 1969],
    ['J. Dudek', 1970], ['M. Wilhelm', 1974], ['E. Grzegorek', 1975]];
  const R = [100, 212]; // korzeń: Marczewski
  const rx = 80, ry = 160, out = [];
  // uczniowie na łuku elipsy, w kolejności lat (od lewej, najstarsze promocje), kąty co równy krok
  const pkt = U.map((u, i) => { const t = Math.PI * (0.93 - 0.86 * i / (U.length - 1)); return [R[0] + rx * Math.cos(t), R[1] - ry * Math.sin(t)]; });
  pkt.forEach((p, i) => {
    // gałąź: krzywa Béziera od korzenia — najpierw w górę, potem w stronę ucznia
    const c1 = [R[0] + (p[0] - R[0]) * 0.12, R[1] - 70], c2 = [p[0] - (p[0] - R[0]) * 0.1, p[1] + 42];
    out.push({ d: `M${P(R)} C${P(c1)} ${P(c2)} ${P(p)}`, gruba: U[i][0] === 'K. Urbanik' });
  });
  pkt.forEach((p) => out.push({ d: kropka(p), gruba: true }));
  out.push({ d: kropka(R), gruba: true });
  out.push({ d: okrag(R, 9), gruba: true }); // korzeń wyróżniony podwójnym kółkiem
  log('uczniowie:', U.length, 'gałęzi; grubo: K. Urbanik (rektor UWr 1975–1981)');
  return out;
}

/* ---------- 3. Niezależność w algebrach (1958): trzy liniowo niezależne wektory i równoległościan ---------- */
function rysNiezaleznoscAlgebr() {
  const u = [0.85, 0.04, 0.12], v = [0.12, 0.95, 0.04], w = [0.16, 0.12, 1.15];
  const det = u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0]);
  if (Math.abs(det) < 0.3) throw new Error('wektory prawie zależne');
  log('wektory: wyznacznik', det.toFixed(3), '(≠ 0, więc niezależne)');
  // rzut ukośny (jak w podręcznikach): oś x w prawo, oś y w głąb (w prawo i w górę, skrócona), oś z w górę
  const ex = [1, 0.06], ey = [0.5, -0.36], ez = [0, -1];
  const rzut = (p) => [p[0] * ex[0] + p[1] * ey[0] + p[2] * ez[0], p[0] * ex[1] + p[1] * ey[1] + p[2] * ez[1]];
  const add = (...a) => a.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]);
  const V = {}; // wierzchołki równoległościanu: sumy podzbiorów {u,v,w}
  [0, 1].forEach((i) => [0, 1].forEach((j) => [0, 1].forEach((k) => { V[`${i}${j}${k}`] = rzut(add(i ? u : [0, 0, 0], j ? v : [0, 0, 0], k ? w : [0, 0, 0])); })));
  const fit = dopasuj(Object.values(V), { x0: 22, x1: 178, y0: 44, y1: 214 });
  Object.keys(V).forEach((k) => (V[k] = fit.f(V[k])));
  const kraw = [];
  Object.keys(V).forEach((a) => Object.keys(V).forEach((b) => { if (a < b && [...a].filter((c, i) => c !== b[i]).length === 1) kraw.push([a, b]); }));
  const out = [];
  kraw.filter(([a]) => a !== '000').forEach(([a, b]) => out.push({ d: odcinek(V[a], V[b]) }));
  ['100', '010', '001'].forEach((k) => { out.push({ d: odcinek(V['000'], V[k]), gruba: true }); out.push({ d: grot(V['000'], V[k], 10, 5), gruba: true }); });
  out.push({ d: kropka(V['000']), gruba: true });
  return out;
}

/* ---------- 4. Każdy graf jest grafem przecięć (1945): koła i graf ich przecięć ---------- */
function rysGrafPrzeciec() {
  // sześć kół na pierścieniu (na przemian bliżej i dalej od środka, na przemian większe i mniejsze) i jedno w środku;
  // graf przecięć wychodzi z geometrii: cykl sześciu wierzchołków i środek połączony z co drugim (sprawdzane niżej z zapasem)
  const C = [100, 129], sk = 0.92;
  const K = Array.from({ length: 6 }, (_, i) => {
    const bliski = i % 2 === 0, R = sk * (bliski ? 46 : 62), r = sk * (bliski ? 34 : 30), t = -Math.PI / 2 + Math.PI / 6 + i * Math.PI / 3;
    return [C[0] + R * Math.cos(t), C[1] + R * Math.sin(t), r];
  });
  K.push([C[0], C[1], sk * 22]);
  const E = [];
  for (let i = 0; i < K.length; i++) for (let j = i + 1; j < K.length; j++) {
    const d = dist(K[i], K[j]), s = K[i][2] + K[j][2];
    if (d < s - 7) E.push([i, j]);
    else if (d < s + 5) throw new Error(`koła ${i},${j} niejednoznaczne: zapas ${(s - d).toFixed(1)}`);
  }
  K.forEach((k) => { if (k[0] - k[2] < POLE.x0 || k[0] + k[2] > POLE.x1 || k[1] - k[2] < POLE.y0 || k[1] + k[2] > POLE.y1) throw new Error('koło poza polem'); });
  log('graf przecięć: krawędzie', E.map(([i, j]) => `${i}${j}`).join(' '), `(${E.length} krawędzi, ${K.length} wierzchołków)`);
  const out = K.map((k) => ({ d: okrag(k, k[2]) }));
  E.forEach(([i, j]) => out.push({ d: odcinek(K[i], K[j]), gruba: true }));
  K.forEach((k) => out.push({ d: kropka(k), gruba: true }));
  return out;
}

/* ---------- 5. Odległość Marczewskiego–Steinhausa (1958): μ(AΔB)/μ(A∪B) = 1/2 ---------- */
function soczewka(r1, r2, d) { // pole części wspólnej dwóch kół
  if (d >= r1 + r2) return 0; if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a1 = Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)), a2 = Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  return r1 * r1 * a1 + r2 * r2 * a2 - 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
}
function rysOdlegloscMS() {
  const rA = 52, rB = 45, cel = 0.5;
  const ms = (d) => { const I = soczewka(rA, rB, d), S = Math.PI * (rA * rA + rB * rB) - I; return (S - I) / S; };
  let lo = rA - rB, hi = rA + rB; // ms rośnie z odległością środków
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (ms(m) < cel) lo = m; else hi = m; }
  const d = (lo + hi) / 2;
  log('odległość M–S: odstęp środków', d.toFixed(2), '→ d(A,B) =', ms(d).toFixed(4));
  // środki na skośnej osi (lewa góra → prawa dół), całość wyśrodkowana w polu
  const kat = 0.72, u = [Math.cos(kat), Math.sin(kat)];
  const sr = [100, 129], t0 = (rA - rB) / 2 - d / 2; // środek odcinka między skrajnymi punktami sumy
  const A = [sr[0] + u[0] * (t0 - 0), sr[1] + u[1] * (t0 - 0)];
  const B = [A[0] + u[0] * d, A[1] + u[1] * d];
  // kreskowanie różnicy symetrycznej: proste pod kątem −45°, co 6,5 jednostki
  const n = [Math.SQRT1_2, Math.SQRT1_2], t = [Math.SQRT1_2, -Math.SQRT1_2], kreski = [];
  const przedzial = (C, r, c) => { // przecięcie prostej {p: p·n = c} z kołem, w parametrze wzdłuż t
    const p0 = [n[0] * c, n[1] * c], q = [p0[0] - C[0], p0[1] - C[1]], b = q[0] * t[0] + q[1] * t[1], cc = q[0] * q[0] + q[1] * q[1] - r * r, D = b * b - cc;
    return D <= 0 ? null : [-b - Math.sqrt(D), -b + Math.sqrt(D)];
  };
  for (let c = -400; c < 400; c += 6.5) {
    const ia = przedzial(A, rA, c), ib = przedzial(B, rB, c); if (!ia && !ib) continue;
    // różnica symetryczna na prostej: XOR dwóch przedziałów
    const pkt = [...(ia || []), ...(ib || [])].sort((x, y) => x - y);
    const kaw = [];
    if (ia && ib && Math.max(ia[0], ib[0]) < Math.min(ia[1], ib[1])) { kaw.push([pkt[0], pkt[1]], [pkt[2], pkt[3]]); }
    else { if (ia) kaw.push(ia); if (ib) kaw.push(ib); }
    kaw.forEach(([s, e]) => { if (e - s < 3) return; const p0 = [n[0] * c, n[1] * c]; kreski.push(odcinek([p0[0] + t[0] * s, p0[1] + t[1] * s], [p0[0] + t[0] * e, p0[1] + t[1] * e])); });
  }
  return kreski.map((d) => ({ d })).concat([{ d: okrag(A, rA), gruba: true }, { d: okrag(B, rB), gruba: true }]);
}

/* ---------- 6. Wymiar i miara (1937): płatek Kocha przykryty kołami ---------- */
function koch(a, b, n) {
  if (n === 0) return [a];
  const d = [(b[0] - a[0]) / 3, (b[1] - a[1]) / 3], p1 = [a[0] + d[0], a[1] + d[1]], p3 = [a[0] + 2 * d[0], a[1] + 2 * d[1]];
  // wierzchołek ząbka: obrót d o −60° (na zewnątrz przy obiegu zgodnym z ruchem wskazówek zegara w układzie SVG)
  const c = Math.cos(-Math.PI / 3), s = Math.sin(-Math.PI / 3), p2 = [p1[0] + d[0] * c - d[1] * s, p1[1] + d[0] * s + d[1] * c];
  return [...koch(a, p1, n - 1), ...koch(p1, p2, n - 1), ...koch(p2, p3, n - 1), ...koch(p3, b, n - 1)];
}
function rysWymiarMiara() {
  const s = 1, h = Math.sqrt(3) / 2;
  const T = [[0, 0], [s, 0], [s / 2, h]]; // trójkąt; obieg tak, by ząbki szły na zewnątrz
  let pts = [];
  for (let i = 0; i < 3; i++) pts = pts.concat(koch(T[i], T[(i + 1) % 3], 3));
  // pokrycie: każdy z 12 kawałków poziomu 1 osobno → jego kawałki poziomu 2 (48 kawałków) przykryte kołami
  const kaw = []; // [środek, promień] liczone z punktów krzywej
  for (let i = 0; i < 3; i++) {
    const lvl2 = koch(T[i], T[(i + 1) % 3], 2).concat([T[(i + 1) % 3]]);
    for (let j = 0; j < lvl2.length - 1; j++) {
      const sub = koch(lvl2[j], lvl2[j + 1], 1).concat([lvl2[j + 1]]);
      const sr = [(lvl2[j][0] + lvl2[j + 1][0]) / 2, (lvl2[j][1] + lvl2[j + 1][1]) / 2];
      kaw.push([sr, Math.max(...sub.map((p) => dist(p, sr)))]);
    }
  }
  const fit = dopasuj(pts.concat(kaw.flatMap(([c, r]) => [[c[0] - r, c[1] - r], [c[0] + r, c[1] + r]])), { x0: 14, x1: 186, y0: 38, y1: 220 });
  const out = [{ d: lamana(pts.map(fit.f), true), gruba: true }];
  kaw.forEach(([c, r]) => out.push({ d: okrag(fit.f(c), r * fit.s) }));
  log('płatek Kocha: poziom 3,', pts.length, 'odcinków, bok odcinka', (fit.s / 27).toFixed(1), '; kół', kaw.length, 'o promieniu', (kaw[0][1] * fit.s).toFixed(1),
    '; wymiar Hausdorffa log4/log3 =', (Math.log(4) / Math.log(3)).toFixed(4));
  return out;
}

/* ---------- 7. Zbiory (s) Marczewskiego (1935): drzewo zbioru doskonałego i doskonałe poddrzewo ---------- */
function rysZbioryS() {
  const N = 5, q = 0.46, out = [];
  const sumH = Array.from({ length: N }, (_, k) => q ** k).reduce((a, b) => a + b, 0), h0 = 84 / sumH;
  const dy = Array.from({ length: N }, (_, k) => 0.8 ** k), sdy = dy.reduce((a, b) => a + b, 0);
  const Y = [216]; dy.forEach((v) => Y.push(Y[Y.length - 1] - 176 * v / sdy));
  const cienkie = Array.from({ length: N }, () => []), grube = Array.from({ length: N }, () => []); // krawędzie pogrupowane po poziomach
  // węzeł = ciąg znaków ±; Q (pogrubione): na poziomach parzystych rozgałęzia się, na nieparzystych idzie jedną gałęzią
  (function rek(x, k, wQ) {
    if (k === N) return;
    [-1, 1].forEach((sg) => {
      const x2 = x + sg * h0 * q ** k;
      const dalejQ = wQ && (k % 2 === 0 || sg === (k % 4 === 1 ? 1 : -1));
      (dalejQ ? grube : cienkie)[k].push(odcinek([x, Y[k]], [x2, Y[k + 1]]));
      rek(x2, k + 1, dalejQ);
    });
  })(100, 0, true);
  log('zbiory (s): drzewo', N, 'poziomów, liście co najmniej', (2 * h0 * q ** (N - 1)).toFixed(1), 'jedn.; poddrzewo Q:', grube.flat().length, 'krawędzi');
  cienkie.forEach((k) => out.push({ d: k.join(' ') }));
  grube.forEach((k) => out.push({ d: k.join(' '), gruba: true }));
  out.push({ d: kropka([100, Y[0]]), gruba: true });
  return out;
}

/* ---------- 8. Funkcja charakterystyczna ciągu zbiorów (1938): c(x) = Σ 2·χ_An(x)/3^n ---------- */
function rysFunkcjaCharakterystyczna() {
  const X0 = 20, X1 = 180, Xl = (t) => X0 + (X1 - X0) * t;
  // A1, A2, A3: sumy odcinków prostej; każdy odcinek jak klamra (krótkie „nóżki” na końcach)
  const A = [[[56, 128]], [[20, 72], [142, 180]], [[34, 92], [108, 164]]];
  const yA = [46, 62, 78], yX = 96, x0 = 116;
  const nalezy = A.map((Ai) => Ai.some(([a, b]) => x0 >= a && x0 <= b));
  const cyfry = nalezy.map((b) => (b ? 2 : 0));
  const c = cyfry.reduce((s, dg, i) => s + dg / 3 ** (i + 1), 0);
  log('funkcja charakterystyczna: x należy do A1,A2,A3 =', nalezy.join(','), '→ cyfry trójkowe', cyfry.join(''), '→ c(x) =', c.toFixed(4));
  const out = [];
  A.forEach((Ai, i) => out.push({ d: Ai.map(([a, b]) => `M${a},${yA[i] + 5} L${a},${yA[i]} L${b},${yA[i]} L${b},${yA[i] + 5}`).join(' ') }));
  out.push({ d: odcinek([X0, yX], [X1, yX]) });
  out.push({ d: odcinek([x0, 38], [x0, yX - 4.5]) }); // pion nad x: widać, przez które zbiory przechodzi
  // zbiór Cantora, poziomy 0–3: odcinki i cienkie gałęzie od środka przedziału do środków jego dwóch trzecich części
  const yC = [124, 156, 188, 218];
  let kaw = [[0, 1]];
  yC.forEach((y, k) => {
    out.push({ d: kaw.map(([a, b]) => odcinek([Xl(a), y], [Xl(b), y])).join(' ') });
    if (k < yC.length - 1) {
      const dzieci = kaw.flatMap(([a, b]) => { const t = (b - a) / 3; return [[a, a + t], [b - t, b]]; });
      out.push({ d: kaw.map(([a, b], i) => [dzieci[2 * i], dzieci[2 * i + 1]].map(([p, q]) => odcinek([Xl((a + b) / 2), y], [Xl((p + q) / 2), yC[k + 1]])).join(' ')).join(' ') });
      kaw = dzieci;
    }
  });
  // droga adresu: środek przedziału na każdym poziomie, wybór lewej (cyfra 0) albo prawej (cyfra 2) trzeciej części;
  // na końcu punkt c(x) = 0,202₃ (dalsze cyfry 0), lewy koniec ostatniego przedziału
  let [a, b] = [0, 1]; const droga = [[x0, yX], [Xl(0.5), yC[0]]];
  cyfry.forEach((dg) => { const t = (b - a) / 3; if (dg === 2) a = b - t; else b = a + t; droga.push([Xl((a + b) / 2), yC[droga.length - 1]]); });
  droga[droga.length - 1] = [Xl(c), yC[3]];
  out.push({ d: lamana(droga), gruba: true });
  out.push({ d: kropka([x0, yX]), gruba: true }, { d: kropka([Xl(c), yC[3]]), gruba: true });
  return out;
}

/* ---------- 9. Zbiory niezależne (1948): cztery elipsy, kropka w każdym z 16 obszarów ---------- */
function rysZbioryNiezalezne() {
  // diagram Venna z czterech przystających elips (para wewnętrzna i para zewnętrzna, symetrycznie względem pionu);
  // parametry dobrane przeszukiwaniem: wszystkie 16 kombinacji „w środku / na zewnątrz” niepuste, największa najmniejsza „głębokość” obszaru
  const elipsy = (pr) => { const { a, b, th, p, q, hh } = pr; return [[-p, 0, th], [p, 0, -th], [-q, hh, th], [q, hh, -th]].map(([x, y, t]) => ({ x, y, t, a, b })); };
  const F = (E, X, Y) => { const dx = X - E.x, dy = Y - E.y, c = Math.cos(E.t), s = Math.sin(E.t), u = dx * c + dy * s, v = -dx * s + dy * c; return { f: (u / E.a) ** 2 + (v / E.b) ** 2 - 1, g: 2 * Math.hypot(u / E.a ** 2, v / E.b ** 2) }; };
  const ocena = (pr, krok) => {
    const E = elipsy(pr), naj = {};
    for (let X = -3.4; X <= 3.4; X += krok) for (let Y = -3.4; Y <= 3.4; Y += krok) {
      let sig = 0, gl = Infinity;
      E.forEach((e, i) => { const r = F(e, X, Y); if (r.f < 0) sig |= 1 << i; gl = Math.min(gl, Math.abs(r.f) / r.g); });
      if (sig === 0) continue; // obszar zewnętrzny pomijamy w ocenie (kropka zewnętrzna osobno)
      if (!naj[sig] || naj[sig].gl < gl) naj[sig] = { gl, X, Y };
    }
    const k = Object.keys(naj);
    return { pelny: k.length === 15, min: k.length === 15 ? Math.min(...k.map((s) => naj[s].gl)) : 0, naj };
  };
  // przeszukiwanie z ziarnem (deterministyczne)
  let ziarno = 7; const los = () => ((ziarno = (ziarno * 16807) % 2147483647) / 2147483647);
  let best = null;
  for (let it = 0; it < 2500; it++) {
    const pr = { a: 1.9, b: 1, th: 0.55 + 0.35 * los(), p: 0.2 + 0.9 * los(), q: 0.9 + 1.2 * los(), hh: -0.4 + 1.6 * los() };
    const o = ocena(pr, 0.09);
    if (o.pelny && (!best || o.min > best.o.min)) best = { pr, o };
  }
  const E = elipsy(best.pr);
  // obrys elips jako łamane (po 96 punktów); dopasowanie do pola z osobną skalą w pionie i poziomie —
  // przekształcenie afiniczne zachowuje układ obszarów (elipsy pozostają elipsami), a obszary rosną
  const kontur = E.map((e) => Array.from({ length: 96 }, (_, i) => { const t = 2 * Math.PI * i / 96, u = e.a * Math.cos(t), v = e.b * Math.sin(t); return [e.x + u * Math.cos(e.t) - v * Math.sin(e.t), e.y + u * Math.sin(e.t) + v * Math.cos(e.t)]; }));
  const pk = kontur.flat(), bx = { x0: 16, x1: 184, y0: 38, y1: 204 };
  const mnx = Math.min(...pk.map((q) => q[0])), mxx = Math.max(...pk.map((q) => q[0])), mny = Math.min(...pk.map((q) => q[1])), mxy = Math.max(...pk.map((q) => q[1]));
  const sx = (bx.x1 - bx.x0) / (mxx - mnx), sy = (bx.y1 - bx.y0) / (mxy - mny);
  const fx = (q) => [bx.x0 + sx * (q[0] - mnx), bx.y0 + sy * (q[1] - mny)], odwr = (X, Y) => [mnx + (X - bx.x0) / sx, mny + (Y - bx.y0) / sy];
  // kropki: na siatce co 0,5 jednostki w układzie rysunku liczymy, w których elipsach leży punkt, potem transformata
  // odległości (dwa przejścia, metryka bliska euklidesowej) od granic obszarów; kropka w najgłębszym punkcie każdego obszaru
  const h = 0.5, nx = Math.round(176 / h) + 1, ny = Math.round(190 / h) + 1, sig = new Int8Array(nx * ny), gl = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const [X, Y] = odwr(12 + i * h, 34 + j * h); let sg = 0; E.forEach((e, k) => { if (F(e, X, Y).f < 0) sg |= 1 << k; }); sig[j * nx + i] = sg; }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, brzeg = i === 0 || j === 0 || i === nx - 1 || j === ny - 1 || sig[k] !== sig[k - 1] || sig[k] !== sig[k + 1] || sig[k] !== sig[k - nx] || sig[k] !== sig[k + nx];
    gl[k] = brzeg ? 0 : 1e9;
  }
  const a1 = h, a2 = h * Math.SQRT2;
  for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) { const k = j * nx + i; gl[k] = Math.min(gl[k], gl[k - 1] + a1, gl[k - nx] + a1, gl[k - nx - 1] + a2, gl[k - nx + 1] + a2); }
  for (let j = ny - 2; j > 0; j--) for (let i = nx - 2; i > 0; i--) { const k = j * nx + i; gl[k] = Math.min(gl[k], gl[k + 1] + a1, gl[k + nx] + a1, gl[k + nx + 1] + a2, gl[k + nx - 1] + a2); }
  const naj = {};
  for (let k = 0; k < nx * ny; k++) {
    const X = 12 + (k % nx) * h, Y = 34 + Math.floor(k / nx) * h;
    if (sig[k] === 0 && (Math.abs(X - 100) > 4 || Y < 150)) continue; // kropka „poza wszystkimi” — na osi symetrii, pod diagramem
    if (!naj[sig[k]] || gl[k] > naj[sig[k]].g) naj[sig[k]] = { g: gl[k], X, Y };
  }
  if (Object.keys(naj).length !== 16) throw new Error('nie ma 16 obszarów');
  const out = kontur.map((k) => ({ d: lamana(k.map(fx), true) }));
  Object.keys(naj).forEach((sg) => out.push({ d: kropka([naj[sg].X, naj[sg].Y]), gruba: true }));
  const mn = Math.min(...Object.values(naj).map((r) => r.g));
  log('zbiory niezależne: parametry', JSON.stringify(Object.fromEntries(Object.entries(best.pr).map(([k, v]) => [k, +v.toFixed(3)]))),
    '; skale', sx.toFixed(1), sy.toFixed(1), '; najmniejsza głębokość obszaru', mn.toFixed(1), 'jedn. (kropka ma promień 4,5)');
  return out;
}

/* ---------- 10. Colloquium Mathematicum (1947): cztery niezależne zbiory „cyfr dwójkowych” ---------- */
function rysColloquium() {
  const X0 = 20, X1 = 180, Xl = (t) => X0 + (X1 - X0) * t, H = 20, base = [76, 122, 168, 214], out = [];
  // A_n = { x : n-ta cyfra dwójkowa x jest 1 } — wykres funkcji charakterystycznej (fala prostokątna)
  base.forEach((y0, i) => {
    const n = i + 1, m = 2 ** n, pts = [[Xl(0), y0]];
    for (let j = 0; j < m; j++) { const yy = j % 2 ? y0 - H : y0; pts.push([Xl(j / m), yy], [Xl((j + 1) / m), yy]); }
    pts.push([Xl(1), y0]);
    const czyste = pts.filter((p, k) => k === 0 || dist(p, pts[k - 1]) > 0.01);
    out.push({ d: lamana(czyste), gruba: true });
  });
  // komórka 1011: x ∈ [11/16, 12/16) — należy do A1, nie do A2, należy do A3 i A4; każda z 16 komórek ma długość 1/16
  const wz = [1, 0, 1, 1], a = wz.reduce((s, b, i) => s + b / 2 ** (i + 1), 0), b = a + 1 / 16;
  out.push({ d: `${odcinek([Xl(a), 40], [Xl(a), 220])} ${odcinek([Xl(b), 40], [Xl(b), 220])}` });
  log('Colloquium: komórka', wz.join(''), '= [', a, ',', b, ') — szerokość', (Xl(b) - Xl(a)).toFixed(1), 'jedn.');
  return out;
}

/* ---------- 11. Rektor i miary zwarte (1953): zstępujący ciąg zbiorów ma punkt wspólny ---------- */
function rysMiaryZwarte() {
  const C = [100, 129], R = 74, M = 240;
  const K0 = Array.from({ length: M }, (_, i) => { const t = 2 * Math.PI * i / M, r = R * (1 + 0.1 * Math.sin(3 * t + 0.5) + 0.06 * Math.cos(2 * t)); return [C[0] + r * Math.cos(t), C[1] + 1.08 * r * Math.sin(t)]; });
  const p = [118, 106], lam = 0.7, al = 0.42; // podobieństwo T: obrót o al i skala lam wokół p
  const T = (z) => { const dx = z[0] - p[0], dy = z[1] - p[1]; return [p[0] + lam * (dx * Math.cos(al) - dy * Math.sin(al)), p[1] + lam * (dx * Math.sin(al) + dy * Math.cos(al))]; };
  const wewn = (q, poly) => { let w = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > q[1]) !== (yj > q[1]) && q[0] < (xj - xi) * (q[1] - yi) / (yj - yi) + xi) w = !w; } return w; };
  if (!wewn(p, K0)) throw new Error('punkt stały poza K0');
  const K1 = K0.map(T);
  // K1 ⊂ K0 z zapasem; wtedy też K(n+1) ⊂ K(n) dla każdego n (T^n zachowuje zawieranie)
  const zapas = Math.min(...K1.map((q) => Math.min(...K0.map((r) => dist(q, r)))));
  if (!K1.every((q) => wewn(q, K0)) || zapas < 3) throw new Error('ciąg nie jest zstępujący z zapasem');
  const out = []; let K = K0, n = 0;
  while (true) { const sr = Math.max(...K.map((q) => dist(q, p))); if (sr < 7) break; out.push({ d: lamana(K.filter((_, i) => i % 3 === 0), true) }); K = K.map(T); n++; }
  out.push({ d: kropka(p), gruba: true });
  log('miary zwarte:', n, 'zbiorów, K1 ⊂ K0 z zapasem', zapas.toFixed(1), 'jedn.; punkt wspólny', P(p));
  return out;
}

/* ---------- 12. Problem Marczewskiego (1930): drzewo Cayleya grupy wolnej (mechanizm paradoksu Banacha–Tarskiego) ---------- */
function rysProblemMarczewskiego() {
  const C = [100, 129], L0 = 44, q = 0.48, N = 4, D = [[1, 0], [0, -1], [-1, 0], [0, 1]]; // a, b, a⁻¹, b⁻¹
  const cienkie = Array.from({ length: N }, () => []), grube = Array.from({ length: N }, () => []); // po poziomach
  (function rek(p, k, zakaz, gal) {
    if (k === N) return;
    D.forEach((d, i) => {
      if (i === zakaz) return;
      const L = L0 * q ** k, p2 = [p[0] + d[0] * L, p[1] + d[1] * L], g = k === 0 ? i === 0 : gal;
      (g ? grube : cienkie)[k].push(odcinek(p, p2));
      rek(p2, k + 1, (i + 2) % 4, g);
    });
  })(C, 0, -1, false);
  log('grupa wolna: krawędzi', cienkie.flat().length + grube.flat().length, '; najkrótsza', (L0 * q ** (N - 1)).toFixed(1), 'jedn.; pogrubiona gałąź W(a):', grube.flat().length);
  return cienkie.map((k) => ({ d: k.join(' ') })).concat(grube.map((k) => ({ d: k.join(' '), gruba: true })), [{ d: kropka(C), gruba: true }]);
}

/* ---------- składanie ---------- */
const RYSUNKI = {
  'szpilrajn-porzadek': rysPorzadek,
  'uczniowie': rysUczniowie,
  'niezaleznosc-w-algebrach': rysNiezaleznoscAlgebr,
  'graf-przeciec': rysGrafPrzeciec,
  'odleglosc-marczewskiego-steinhausa': rysOdlegloscMS,
  'wymiar-i-miara': rysWymiarMiara,
  'zbiory-s': rysZbioryS,
  'funkcja-charakterystyczna': rysFunkcjaCharakterystyczna,
  'zbiory-niezalezne': rysZbioryNiezalezne,
  'colloquium-mathematicum': rysColloquium,
  'rektor-miary-zwarte': rysMiaryZwarte,
  'problem-marczewskiego': rysProblemMarczewskiego
};
const TEKSTY = require('./teksty.js');
const wynik = TEKSTY.map((t) => {
  if (!RYSUNKI[t.id]) throw new Error('brak rysunku: ' + t.id);
  log(`— ${t.id}`);
  const sciezki = RYSUNKI[t.id]().filter((p) => p.d.trim() !== ''); // puste grupy (np. poziom bez cienkich krawędzi) pomijamy
  if (sciezki.length < 5 || sciezki.length > 60) log(`UWAGA ${t.id}: ${sciezki.length} ścieżek`);
  return { ...t, sciezki };
});
Object.keys(RYSUNKI).forEach((k) => { if (!TEKSTY.find((t) => t.id === k)) throw new Error('rysunek bez tekstu: ' + k); });
fs.writeFileSync(path.join(__dirname, 'ciekawostki.json'), JSON.stringify(wynik, null, 2) + '\n');

/* ---------- podgląd ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (c, kl) => `<svg class="${kl}" viewBox="0 0 200 240" aria-hidden="true">${c.sciezki.map((p) => `<path d="${p.d}"${p.gruba ? ' class="gruba"' : ''}/>`).join('')}</svg>`;
const karty = wynik.map((c, i) => `
  <article class="karta${c.podstrona === 'zapas' ? ' zapas' : ''}">
    <div class="baner">
      <p class="podpis"><b>${esc(c.nazwa)}, ${esc(c.rok)}</b>${esc(c.zdanie)}</p>
      ${svg(c, 'maly')}
    </div>
    <div class="opis">
      <p class="meta"><span class="nr">${i + 1}</span> <span class="pod">${esc(c.podstrona)}</span> · ${esc(c.rodzaj)} · <span class="pew ${c.pewnosc === 'pewne' ? 'ok' : 'spr'}">${esc(c.pewnosc)}</span> · ${c.sciezki.length} ścieżek</p>
      <p class="notka">${esc(c.notka)}</p>
      <p class="dl"><i>Dlaczego tu:</i> ${esc(c.dlaczego_tu)}</p>
    </div>
    ${svg(c, 'duzy')}
  </article>`).join('');
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ciekawostki Marczewskiego</title>
<style>
:root { --granat: #0d1830; --d-j: #f2a33a; --d-g: #8a5300; --na-ciemnym-2: #c9d0de; --tlo: #f6f3ee; --tekst: #1d2433; --szary: #5d6475; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--tlo); color: var(--tekst); font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; }
header { padding: 28px 24px 8px; max-width: 1180px; margin: 0 auto; }
h1 { margin: 0 0 4px; font: italic 500 30px/1.2 'Brygada 1918', Georgia, serif; }
header p { margin: 0; color: var(--szary); }
main { max-width: 1180px; margin: 0 auto; padding: 16px 24px 40px; display: grid; gap: 18px; }
.karta { display: grid; grid-template-columns: 420px 1fr 170px; gap: 18px; align-items: start; background: #fff; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgb(0 0 0 / .08); }
.karta.zapas { opacity: .96; }
.baner { position: relative; height: 190px; border-radius: 8px; overflow: hidden; background: linear-gradient(100deg, var(--granat) 0, var(--granat) 42%, color-mix(in srgb, var(--granat) 55%, var(--d-g)) 72%, var(--d-g) 100%); }
.baner .maly { position: absolute; right: 14px; top: 10px; width: 145px; height: 170px; }
.baner .podpis { position: absolute; right: 172px; top: 46px; width: 205px; margin: 0; text-align: right; font-size: 12.5px; line-height: 1.45; color: var(--na-ciemnym-2); }
.baner .podpis b { display: block; font: italic 500 15px/1.3 'Brygada 1918', Georgia, serif; color: #fff; margin-bottom: 2px; }
svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.maly path { stroke: color-mix(in srgb, var(--d-j) 55%, transparent); stroke-width: 1.3; }
.maly path.gruba { stroke: var(--d-j); stroke-width: 2; }
.duzy { width: 170px; height: 204px; background: #fbf1e1; border-radius: 8px; }
.duzy path { stroke: color-mix(in srgb, var(--d-g) 55%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
.duzy path.gruba { stroke: var(--d-g); stroke-width: 2; }
.opis p { margin: 0 0 6px; }
.meta { font-size: 12.5px; color: var(--szary); }
.nr { display: inline-block; min-width: 22px; padding: 0 6px; border-radius: 10px; background: var(--granat); color: #fff; text-align: center; font-weight: 700; }
.pod { font-weight: 700; color: var(--d-g); }
.pew.ok { color: #2d6a3a; font-weight: 600; } .pew.spr { color: #a3401f; font-weight: 600; }
.notka { font-size: 13px; }
.dl { font-size: 12.5px; color: var(--szary); }
@media (max-width: 900px) { .karta { grid-template-columns: 1fr; } .baner { max-width: 420px; } }
</style></head><body>
<header><h1>Edward Marczewski (Szpilrajn) — ciekawostki i znaki</h1>
<p>Dział Instytut · ${wynik.length} ciekawostek · baner jak na podstronie (145×170 px, kreska 1,3 / 2 px) i duży podgląd. Wygenerowane przez generator.js.</p></header>
<main>${karty}
</main></body></html>
`;
fs.writeFileSync(path.join(__dirname, 'rysunki.html'), html);
console.log(LOG.join('\n'));
