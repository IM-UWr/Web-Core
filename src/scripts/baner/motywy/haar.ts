// Seminarium „Analiza harmoniczna i rozwinięcia ortogonalne”: układ Haara — schodki diadyczne (prototyp
// animacje-analiza.html, motyw „haar”; zaakceptowany 31.10.2026). Wariant „zaklad” (Zakład Analizy Funkcjonalnej):
// łamana Schaudera z węzłami.
// Słaba gładka krzywa (suma pięciu sinusoid o losowych fazach) i jej rzut na układ Haara: na każdym przedziale diadycznym
// średnia funkcji; tam, gdzie funkcja szybko się zmienia, przedziały są drobniejsze. Na dole „linijka diadyczna”: kreski
// podziałów, dłuższe dla grubszych poziomów. W wariancie zamiast schodków łamana przez węzły diadyczne (rozwinięcie
// Fabera–Schaudera — całki funkcji Haara), węzły zaznaczone kropkami.
// Ruch: przy wejściu schodki powstają poziom po poziomie (raz, ok. 5 s). Potem co 4–12 s (losowo) jeden przedział dzieli się
// na połowy (dochodzi jedna falka Haara; w wariancie nowy węzeł wyrasta z cięciwy na krzywą) albo dwie połowy się scalają
// (w wariancie węzeł opada na cięciwę i znika), ok. 2 px/s; zmiana zawsze lokalna i w odsłoniętej części banera.
// Pole (zlecenie 07): schodki od góry pola + 4 px, linijka 9 px nad jego dołem (połowa hasła; w prototypie była tuż pod
// polem, pod hasłem). Przy 390×844 schodki są ok. 21 px wyżej niż w prototypie, w pionie 89% jego wielkości.
// Klatka tylko wtedy, gdy któryś stopień albo węzeł przesunął się o ≥ 0,5 px albo zmienił się podział.
import type { Fabryka, Ustawienia } from '../typy';
import { generator, ogr } from '../wspolne';
import { Anim, ZIARNO, budowa, wazone, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const SKL = [[0.85, 0.5], [2.15, 0.32], [4.3, 0.18], [8.6, 0.09], [16.2, 0.05]]; // [częstotliwość, amplituda]
const NF = 2048, MAXLEV = 6, TB = 0.35, TK = 0.75, DB = 0.7;    // próbki krzywej, najdrobniejszy poziom, budowanie (s)
const KRZYWA = 0.09, LINIJKA = 0.13, SCHODKI = 0.22, WEZLY = 0.3;

// Haar: przedział [a, b] ze średnią val; Schauder: węzeł w punkcie a (= b) z wartością val. zn — chwila scalenia/usunięcia
type El = { a: number; b: number; val: Anim; zn: number };

const motyw: Fabryka = (G, t0) => {
  const schauder = G.wariant === 'zaklad', los = generator(ZIARNO), w = G.x1 - G.x0, h = G.y1 - G.y0;
  // krzywa unormowana do |f| ≤ 1 i jej całka (średnie na przedziałach)
  const faz = SKL.map(() => los() * 2 * Math.PI), tab = new Float64Array(NF + 1), cal = new Float64Array(NF + 1);
  let mx = 0;
  for (let i = 0; i <= NF; i++) {
    let v = 0;
    SKL.forEach(([k, a], j) => { v += a * Math.sin(2 * Math.PI * k * i / NF + faz[j]); });
    tab[i] = v; mx = Math.max(mx, Math.abs(v));
  }
  for (let i = 0; i <= NF; i++) tab[i] /= mx;
  for (let i = 1; i <= NF; i++) cal[i] = cal[i - 1] + (tab[i - 1] + tab[i]) / (2 * NF);
  const interp = (T: Float64Array, u: number) => { const x = ogr(u, 0, 1) * NF, k = Math.min(NF - 1, Math.floor(x)); return T[k] + (T[k + 1] - T[k]) * (x - k); };
  const f = (u: number) => interp(tab, u), sr = (a: number, b: number) => (interp(cal, b) - interp(cal, a)) / (b - a);

  // prototyp: amplituda 0,38 h, schodki od 0,08 h pod górą pola, linijka tuż pod polem; tu całość od góry pola + 4 px
  // do linijki 9 px nad dołem (skala k tylko o tyle, ile trzeba)
  const k = Math.min(1, (h - 13) / (0.92 * h + 1)), A = 0.38 * h * k, yc = G.y0 + 4 + A, yb = G.y1 - 9;
  const X = (u: number) => G.x0 + u * w, Y = (v: number) => yc - A * v;
  const poz = (a: number, b: number) => Math.round(-Math.log2(b - a));
  const szczegol = (a: number, b: number) => { const m = (a + b) / 2; return (schauder ? Math.abs(f(m) - (f(a) + f(b)) / 2) : Math.abs(sr(a, m) - sr(m, b))) * A; };
  // podział startowy: poziomy 0–1 zawsze, dalej częściej tam, gdzie szczegół jest duży
  const cel = new Set<string>();
  const podziel = (lev: number, k: number) => {
    const d = 1 / (1 << lev), s = szczegol(k * d, (k + 1) * d);
    if (!(lev < 2 || (lev < MAXLEV && (s > 2.4 ? los() < 0.9 : los() < (lev < 4 ? 0.3 : 0.05))))) return;
    cel.add(lev + ':' + k); podziel(lev + 1, 2 * k); podziel(lev + 1, 2 * k + 1);
  };
  podziel(0, 0);
  const krzywa = new Path2D();
  krzywa.moveTo(X(0), Y(f(0)));
  for (let u = 1.5 / w; u < 1; u += 1.5 / w) krzywa.lineTo(X(u), Y(f(u)));
  krzywa.lineTo(X(1), Y(f(1)));

  const el: El[] = schauder ? [{ a: 0, b: 0, val: new Anim(f(0)), zn: 0 }, { a: 1, b: 1, val: new Anim(f(1)), zn: 0 }] : [{ a: 0, b: 1, val: new Anim(sr(0, 1)), zn: 0 }];
  const n = () => (schauder ? el.length - 1 : el.length);
  const kon = (i: number): [number, number] => (schauder ? [el[i].a, el[i + 1].a] : [el[i].a, el[i].b]);
  const podzielP = (i: number, t: number, D: number) => {
    const [a, b] = kon(i), m = (a + b) / 2;
    if (schauder) {
      const v = new Anim((el[i].val.w(t) + el[i + 1].val.w(t)) / 2);  // nowy węzeł startuje na cięciwie
      v.ustaw(t, f(m), D);
      el.splice(i + 1, 0, { a: m, b: m, val: v, zn: 0 });
    } else {
      const L = el[i], v = L.val.w(t), c1 = new Anim(v), c2 = new Anim(v);
      c1.ustaw(t, sr(a, m), D); c2.ustaw(t, sr(m, b), D);
      el.splice(i, 1, { a, b: m, val: c1, zn: 0 }, { a: m, b, val: c2, zn: 0 });
    }
  };
  const budujPoziom = (lev: number, t: number, D: number) => {
    for (let i = n() - 1; i >= 0; i--) { const [a, b] = kon(i); if (poz(a, b) === lev && cel.has(lev + ':' + Math.round(a * (1 << lev)))) podzielP(i, t, D); }
  };
  const wRuchu = (t: number) => el.some((e) => e.val.trwa(t) || e.zn > 0);

  // kandydaci zdarzenia (tylko widoczne miejsca): podział — przedział z wyraźnym szczegółem; scalenie — dwie siostry
  // jednego przedziału poziomu ≥ 2 (w wariancie: węzeł, którego sąsiedzi są końcami przedziału diadycznego)
  const kandydaci = (dziel: boolean) => {
    const L: { i: number; d: number }[] = [], W: number[] = [];
    if (dziel) {
      for (let i = 0; i < n(); i++) {
        const [a, b] = kon(i);
        if (poz(a, b) >= MAXLEV) continue;
        const yv = Y(schauder ? (el[i].val.cel + el[i + 1].val.cel) / 2 : el[i].val.cel);
        if (G.widac(X((a + b) / 2), yv) < 0.6) continue;
        const d = szczegol(a, b);
        if (d < 1) continue;
        L.push({ i, d }); W.push(Math.min(d, 18));
      }
    } else if (schauder) {
      for (let i = 1; i < el.length - 1; i++) {
        const d0 = el[i].a - el[i - 1].a;
        if (Math.abs(el[i + 1].a - el[i].a - d0) > 1e-9) continue;
        const q = el[i - 1].a / (2 * d0);
        if (poz(el[i - 1].a, el[i + 1].a) < 2 || Math.abs(q - Math.round(q)) > 1e-6) continue;
        if (G.widac(X(el[i].a), Y(el[i].val.cel)) < 0.6) continue;
        const d = Math.abs(el[i].val.cel - (el[i - 1].val.cel + el[i + 1].val.cel) / 2) * A;
        L.push({ i, d }); W.push(Math.min(Math.max(d, 1), 18));
      }
    } else {
      for (let i = 0; i < el.length - 1; i++) {
        const a = el[i], b = el[i + 1], l = poz(a.a, a.b);
        if (l < 3 || poz(b.a, b.b) !== l) continue;
        const q = a.a * (1 << (l - 1));
        if (Math.abs(q - Math.round(q)) > 1e-6) continue;
        const p = sr(a.a, b.b);
        if (G.widac(X(a.b), Y(p)) < 0.6) continue;
        const d = Math.max(Math.abs(a.val.cel - p), Math.abs(b.val.cel - p)) * A;
        L.push({ i, d }); W.push(Math.min(Math.max(d, 1), 18));
      }
    }
    return { L, W };
  };

  // zdarzenie: podział albo scalenie (częściej to, co przywraca startową liczbę przedziałów); zwraca czas trwania (s)
  let n0 = 1;
  const zdarzenie = (t: number) => {
    let dz = Math.random() < ogr(0.5 + (n0 - n()) / n0 * 3, 0.15, 0.85), kd = kandydaci(dz);
    if (!kd.L.length) { dz = !dz; kd = kandydaci(dz); }
    if (!kd.L.length) return 3;
    const x = wazone(kd.L, kd.W, Math.random), D = Math.max(3, x.d / 2.2), i = x.i;
    if (dz) podzielP(i, t, D);
    else if (schauder) { el[i].val.ustaw(t, (el[i - 1].val.cel + el[i + 1].val.cel) / 2, D); el[i].zn = t + D; }
    else { const p = sr(el[i].a, el[i + 1].b); el[i].val.ustaw(t, p, D); el[i + 1].val.ustaw(t, p, D); el[i].zn = t + D; }
    return D;
  };
  let brudny = true;
  const porzadki = (t: number) => {
    for (let i = el.length - 1; i >= 0; i--) {
      if (!el[i].zn || t < el[i].zn) continue;
      if (schauder) el.splice(i, 1);
      else el.splice(i, 2, { a: el[i].a, b: el[i + 1].b, val: new Anim(el[i].val.cel), zn: 0 });
      brudny = true;
    }
  };

  let budLev = 0, gotowe = false, tNast = 0;
  const zbuduj = () => { for (let l = 0; l < MAXLEV; l++) budujPoziom(l, -100, 0); budLev = MAXLEV; gotowe = true; n0 = n(); };
  // po zmianie układu (t0 > 2 s) — od razu gotowy podział, zdarzenia toczą się dalej
  if (!budowa(t0)) { zbuduj(); tNast = t0 + 2 + Math.random() * 4; }

  return {
    krok(t) {
      let za = 1 / 15;
      if (!gotowe) {
        while (budLev < MAXLEV && t >= t0 + TB + budLev * TK) { budujPoziom(budLev, t0 + TB + budLev * TK, DB); budLev++; brudny = true; }
        if (budLev >= MAXLEV && t >= t0 + TB + (MAXLEV - 1) * TK + DB) { gotowe = true; n0 = n(); tNast = t + 2 + Math.random() * 4; brudny = true; }
      } else {
        porzadki(t);
        if (t >= tNast && !wRuchu(t)) { const D = zdarzenie(t); tNast = t + D + 4 + Math.random() * 8; brudny = true; }
      }
      let vmax = 0, ruch = false, prz = 0;
      for (const e of el) {
        vmax = Math.max(vmax, e.val.v(t) * A);
        if (e.val.trwa(t)) ruch = true;
        prz = Math.max(prz, Math.abs(e.val.w(t) - e.val.r) * A);
      }
      if (gotowe) {
        za = ruch ? zaKlatka(vmax) : Math.max(0.05, tNast - t);
        for (const e of el) if (e.zn) za = Math.min(za, Math.max(0.02, e.zn - t + 0.01));
      }
      // klatka po przesunięciu o ≥ 0,5 px, po zmianie podziału i raz na końcu ruchu (dokładne położenie)
      const a = brudny || prz >= 0.5 || (!ruch && prz > 0.05);
      if (a) { for (const e of el) e.val.r = e.val.w(t); brudny = false; }
      return { a, za };
    },
    rysuj(c, t) {
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(KRZYWA);
      c.stroke(krzywa);
      // linijka diadyczna: kreski na granicach przedziałów (w wariancie — w węzłach), dłuższe dla grubszych poziomów
      c.strokeStyle = G.rgba(LINIJKA);
      c.beginPath();
      for (let i = 1; i < n(); i++) {
        const ub = kon(i)[0];
        let lv = 0;
        while (lv < 8 && Math.abs(ub * (1 << lv) - Math.round(ub * (1 << lv))) > 1e-9) lv++;
        c.moveTo(X(ub), yb); c.lineTo(X(ub), yb - Math.max(2, 11 - 1.6 * lv));
      }
      c.moveTo(X(0), yb + 0.5); c.lineTo(X(1), yb + 0.5);
      c.stroke();
      c.lineWidth = 1.3;
      c.strokeStyle = G.rgba(SCHODKI);
      c.beginPath();
      el.forEach((e, i) => {
        const y = Y(e.val.w(t));
        if (i) c.lineTo(X(e.a), y); else c.moveTo(X(e.a), y);
        if (!schauder) c.lineTo(X(e.b), y);
      });
      c.stroke();
      if (schauder) {
        c.fillStyle = G.rgba(WEZLY);
        c.beginPath();
        for (const e of el) { const x = X(e.a), y = Y(e.val.w(t)); c.moveTo(x + 1.4, y); c.arc(x, y, 1.4, 0, 2 * Math.PI); }
        c.fill();
      }
    },
    // ograniczenie ruchu: gotowy podział startowy, bez zdarzeń
    gotowy() { zbuduj(); tNast = 1e9; },
  };
};

export default motyw;
