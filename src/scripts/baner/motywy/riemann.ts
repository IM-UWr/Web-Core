// Studia: sumy Riemanna (prototyp studia-riemann.html, ustawienia telefonu; zaakceptowany 31.10.2026).
// Łagodny garb z punktem i styczną (warstwa A, rysowana raz) i prostokąty wzoru punktu środkowego (warstwa B).
// Podziały zagęszczają się i rozrzedzają: 5 → 10 → 20 → 40 przedziałów, każdy prostokąt dzieli się na dwa, nowe kreski
// wyłaniają się z przezroczystości. W prototypie poziom szedł w kółko (cykl 40 s); tu — zgodnie z zasadą „zmiany losowe,
// nie w kółko” — co losową przerwę (średnio 6 s, ±60%) podział idzie do losowo wybranego innego poziomu w tym samym
// tempie co w prototypie (pełne przejście 5 → 40 w 20 s), a między zmianami rysunek stoi i zegar śpi.
// Klatka tylko wtedy, gdy któraś krawędź przesunie się o ≥ 0,5 px albo krycie nowych kresek zmieni się o widoczny stopień.
import type { Fabryka, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const KRZYWA = 0.14, PROST = 0.07, NMIN = 5, NMAX = 40, WYS = 0.92, SZCZYT = 0.7, GARB = 0.22;
const PELNE = 20, PRZERWA = 6, START = 2;                // s na przejście przez wszystkie poziomy, przerwa, pierwsza przerwa

const motyw: Fabryka = (G, t0) => {
  const top = G.y0, dol = G.y1, xa = G.x0, xb = G.x1, span = xb - xa;
  // krzywa: łagodny garb (z lewej dłuższe zbocze), szczyt w 70% szerokości banera
  const xp = SZCZYT * G.W, sR = GARB * span, sL = 1.36 * sR, base = 0.14;
  const f = (x: number) => { const d = x - xp, s = d < 0 ? sL : sR; return base + (1 - base) * Math.exp(-(d * d) / (s * s)); };
  const df = (x: number) => { const d = x - xp, s = d < 0 ? sL : sR; return (1 - base) * (-2 * d / (s * s)) * Math.exp(-(d * d) / (s * s)); };
  const xt = xp + 0.42 * sR, ft = f(xt), nach = df(xt), Lt = 0.5 * sR;
  const fmax = Math.max(1, ft - nach * Lt), yB = dol - 1, hP = (dol - top) * WYS - 2;
  const Y = (v: number) => yB - v / fmax * hP;

  // poziomy podziału: 5, 10, 20, 40 przedziałów
  let K = 0;
  while (NMIN * 2 ** (K + 1) <= NMAX) K++;
  const poziomy = Array.from({ length: K + 1 }, (_, l) => {
    const n = NMIN * 2 ** l, w = span / n, h = new Float64Array(n);
    for (let i = 0; i < n; i++) h[i] = f(xa + (i + 0.5) * w);
    return { n, w, h };
  });

  // poziom λ (ciągły, 0…K): ruch od λa do λb zaczęty w chwili ts, trwa d; potem przerwa do tNast
  let la = 0, lb = 0, ts = t0, d = 0, tNast = t0 + START, stoi = false;
  const lam = (t: number) => (t >= ts + d || d <= 0 ? lb : la + (lb - la) * (1 - Math.cos(Math.PI * (t - ts) / d)) / 2);
  const stan = (t: number) => {
    const L = stoi ? Math.min(1, K) : lam(t), l = Math.min(K - 1, Math.floor(L)), e = S(L - l);
    const Pp = poziomy[l], C = poziomy[l + 1], y = new Float64Array(C.n);
    for (let c = 0; c < C.n; c++) { const hp = Pp.h[c >> 1]; y[c] = Y(hp + e * (C.h[c] - hp)); }
    return { l, e, y, w: C.w, n: C.n };
  };
  let ost: ReturnType<typeof stan> | null = null;

  return {
    krok(t) {
      if (t >= tNast && t >= ts + d) {
        let cel = Math.floor(Math.random() * K);
        if (cel >= lb) cel++;                              // inny niż obecny poziom
        la = lb; lb = cel; ts = tNast; d = PELNE * Math.abs(lb - la) / K;
        tNast = ts + d + PRZERWA * (0.4 + 1.2 * Math.random());
      }
      const S1 = stan(t);
      let zmiana = !ost || ost.l !== S1.l;
      if (!zmiana && ost) {
        let m = 0;
        for (let c = 0; c < S1.n; c++) m = Math.max(m, Math.abs(S1.y[c] - ost.y[c]));
        zmiana = m >= 0.5 || Math.abs(S1.e - ost.e) * PROST * 255 >= 1;
      }
      const r = { a: !ost, b: zmiana, za: t < ts + d ? 1 / 15 : Math.max(0.05, tNast - t) };
      if (zmiana) ost = S1;
      return r;
    },
    // oś, krzywa, styczna i punkt — raz
    rysuj(c) {
      c.lineWidth = 1; c.strokeStyle = G.rgba(PROST);
      c.beginPath(); c.moveTo(xa, yB); c.lineTo(xb, yB); c.stroke();
      c.lineWidth = 1.4; c.strokeStyle = G.rgba(KRZYWA);
      c.beginPath(); c.moveTo(xa, Y(f(xa)));
      for (let x = xa + 2; x < xb; x += 2) c.lineTo(x, Y(f(x)));
      c.lineTo(xb, Y(f(xb))); c.stroke();
      c.beginPath(); c.moveTo(xt - Lt, Y(ft - nach * Lt)); c.lineTo(xt + Lt, Y(ft + nach * Lt)); c.stroke();
      c.fillStyle = G.rgba(Math.min(1, KRZYWA * 1.5));
      c.beginPath(); c.arc(xt, Y(ft), 2.6, 0, 2 * Math.PI); c.fill();
    },
    // prostokąty: wypełnienie i obrys schodków, kreski podziału (nowe wyłaniają się z przezroczystości)
    rysujB(c) {
      const s = ost ?? stan(0), { w, n } = s;
      c.beginPath(); c.moveTo(xa, yB);
      for (let i = 0; i < n; i++) { c.lineTo(xa + i * w, s.y[i]); c.lineTo(xa + (i + 1) * w, s.y[i]); }
      c.lineTo(xb, yB);
      c.fillStyle = G.rgba(PROST * 0.45); c.fill();
      c.strokeStyle = G.rgba(PROST); c.lineWidth = 1; c.stroke();
      c.beginPath();
      for (let i = 2; i < n; i += 2) { c.moveTo(xa + i * w, yB); c.lineTo(xa + i * w, Math.max(s.y[i - 1], s.y[i])); }
      c.stroke();
      if (s.e > 0.002) {
        c.globalAlpha = s.e;
        c.beginPath();
        for (let i = 1; i < n; i += 2) { c.moveTo(xa + i * w, yB); c.lineTo(xa + i * w, Math.max(s.y[i - 1], s.y[i])); }
        c.stroke();
        c.globalAlpha = 1;
      }
    },
    // ograniczenie ruchu: jeden stały obraz — 10 przedziałów (czytelna suma Riemanna)
    gotowy() { stoi = true; ost = stan(0); },
  };
};

export default motyw;
