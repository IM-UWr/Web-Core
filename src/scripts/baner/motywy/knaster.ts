// Seminarium Topologii / Zakład Teorii Mnogości i Topologii: kontinuum Knastera („wiadro z rączką”) na zbiorze Cantora
// (prototyp animacje-struktury.html, „Motyw własny”; zaakceptowany 31.10.2026). Nad osią półokręgi o środku w ½ łączą
// symetryczne punkty zbioru Cantora (poziom 4), pod osią — w kawałkach [2/3ⁿ, 3/3ⁿ] półokręgi o środkach 5/(2·3ⁿ);
// na telefonie spłaszczone do półelips (spłaszczenie liczone z wysokości pola, jak w prototypie). Wariant „zaklad”:
// dodatkowo zbiór Cantora zaznaczony na osi.
// Budowa raz przy wejściu (3 s): łuki wyłaniają się od największych. Potem łuki stoją (warstwa A), a co 6–14 s
// z losowego, widocznego punktu zbioru Cantora dorysowuje się (2,5 px/s, warstwa B) jaśniejszy kawałek jednej
// kompozanty — łuk w dół, łuk w górę… — długi na 65–115 px, czyli rośnie 26–46 s; po 2,5 s postoju gaśnie (3 s).
// Klatka po przyroście o 0,6 px (ok. 4 kl./s; w prototypie co 0,5 px, czyli równo 5 kl./s przez większość czasu),
// gaśnięcie 8 kl./s, w przerwach zegar śpi.
// Pole (zlecenie 07): prototypowe [fy0, fy1] (od linku + 2 px do 12 px nad liczbami) to tu [y0 + 2, y1 − 6] — łuki
// od y0 + 6 do y1 − 10, nad połową hasła. Przy 390 px i jednoliniowym tytule: 15 px wyżej niż w prototypie, łuki
// w pionie 83% (pole kończy się teraz w połowie hasła, a nie pod nim), przy dwóch liniach tytułu 87%; szerokość bez
// zmian — zbiór Cantora od brzegu do brzegu treści, jak w prototypie, który spłaszczenie i tak liczy z wysokości pola.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const POZIOM = 4, N3 = 3 ** POZIOM, LUKI = 0.17, CANTOR = 0.5, SCIEZKA = 0.34, V = 2.5, KROK_PX = 0.6;
const BUDOWA = 3, FPS_BUD = 15, FPS_GAS = 8, PIERWSZA = 4, POSTOJ = 2.5, GAS = 3, MAX_LUKOW = 7;

const losowo = (a: number, b: number) => a + Math.random() * (b - a);
type Sciezka = { xy: number[]; cum: Float32Array; sMax: number; t0: number; tKon: number };

const motyw: Fabryka = (G, t0) => {
  const f0 = G.y0 + 2, f1 = G.y1 - 6, h = f1 - f0, xa = G.x0, x1 = G.x1, Sx = x1 - xa;
  const alfa = (x: number, y: number) => G.widac(x, y) * S((x1 - x) / 10);
  const prawy = (c: CanvasRenderingContext2D, a: number) => {
    const g = c.createLinearGradient(x1 - 10, 0, x1, 0);
    for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, G.rgba(a * S(1 - i / 4)));
    return g;
  };
  // spłaszczenie: największy łuk górny (promień ½) i największy dolny (promień 1/6) mieszczą się w [f0 + 4, f1 − 4]
  const ky = (h - 8) / ((0.5 + 1 / 6) * Sx), os = f0 + 4 + 0.5 * Sx * ky;
  const X = (u: number) => xa + u / N3 * Sx;

  // końce przedziałów zbioru Cantora (poziom 4), w jednostkach 1/81
  const pkt: number[] = [];
  const rek = (a: number, len: number, d: number) => { if (d === POZIOM) { pkt.push(a, a + len); return; } const t = len / 3; rek(a, t, d + 1); rek(a + 2 * t, t, d + 1); };
  rek(0, N3, 0);
  const cantor = [...new Set(pkt)].sort((a, b) => a - b);
  // łuki: górne (środek ½) i dolne (środki 2,5·3^(4−n) w kawałkach [2·3^(4−n), 3^(5−n)]), od największego
  const luki: { g: boolean; cx: number; rx: number; ry: number; f: number }[] = [];
  const surowe: { g: boolean; m: number; r: number }[] = [];
  cantor.forEach((c) => { if (2 * c < N3) surowe.push({ g: true, m: N3 / 2, r: N3 / 2 - c }); });
  for (let n = 1; n <= POZIOM; n++) {
    const lo = 2 * 3 ** (POZIOM - n), m = 2.5 * 3 ** (POZIOM - n);
    cantor.forEach((c) => { if (c >= lo && c < m) surowe.push({ g: false, m, r: m - c }); });
  }
  surowe.sort((a, b) => b.r - a.r).forEach((l, i, A) => luki.push({ g: l.g, cx: X(l.m), rx: l.r / N3 * Sx, ry: l.r / N3 * Sx * ky, f: i / A.length }));
  const zak = G.wariant === 'zaklad';

  // kompozanta: z punktu c łuk w górę do punktu symetrycznego względem ½, potem w dół do symetrycznego w swoim
  // kawałku [2/3ⁿ, 3/3ⁿ], i tak dalej (najwyżej 7 łuków); próbki co ok. 1,5 px
  const obszar = (c: number) => { for (let n = 1; n <= POZIOM; n++) if (c >= 2 * 3 ** (POZIOM - n) && c <= 3 ** (POZIOM - n + 1)) return n; return 0; };
  const nowaSciezka = (t: number): Sciezka => {
    let kand = cantor.filter((c) => c > 0 && alfa(X(c), os) > 0.85);
    if (!kand.length) kand = cantor.filter((c) => c > 0);
    let c = kand[Math.floor(Math.random() * kand.length)], gora = Math.random() < 0.35;
    const xy: number[] = [];
    for (let ile = 0; ile < MAX_LUKOW; ile++) {
      let m: number, partner: number;
      if (gora) { m = N3 / 2; partner = N3 - c; }
      else { const n = obszar(c); if (!n) break; m = 2.5 * 3 ** (POZIOM - n); partner = 5 * 3 ** (POZIOM - n) - c; }
      const cx = X(m), rx = Math.abs(c - m) / N3 * Sx, ry = rx * ky, a0 = c < m ? Math.PI : 0, a1 = c < m ? 0 : Math.PI;
      const kroki = Math.max(6, Math.ceil(Math.PI * Math.max(rx, ry) / 1.5));
      for (let k = 0; k <= kroki; k++) { const a = a0 + (a1 - a0) * k / kroki; xy.push(cx + rx * Math.cos(a), os + (gora ? -1 : 1) * ry * Math.sin(a)); }
      c = partner; gora = !gora;
    }
    const n2 = xy.length / 2, cum = new Float32Array(n2);
    for (let i = 1; i < n2; i++) cum[i] = cum[i - 1] + Math.hypot(xy[2 * i] - xy[2 * i - 2], xy[2 * i + 1] - xy[2 * i - 1]);
    const sMax = Math.min(cum[n2 - 1], losowo(65, 115));
    return { xy, cum, sMax, t0: t, tKon: t + sMax / V };
  };

  // ---------- czas ----------
  const tB = t0 > 0 ? -1e9 : t0;
  const postep = (t: number) => (stoi ? 1 : Math.min(1, Math.max(0, (t - tB) / BUDOWA)));
  let stoi = false, pOst = -1, sc: Sciezka | null = null, tNast = Math.max(t0, tB + BUDOWA) + PIERWSZA, syg = '';
  // stan ścieżki w chwili t: narysowana długość i krycie
  const stanSc = (t: number) => {
    if (!sc) return { s: 0, a: 0 };
    return { s: Math.min(sc.sMax, V * (t - sc.t0)), a: 1 - S((t - sc.tKon - POSTOJ) / GAS) };
  };

  return {
    krok(t) {
      const p = postep(t);
      if (p < 1 || pOst < 1) {
        const a = p !== pOst;
        pOst = p;
        return { a, za: p < 1 ? Math.min(1 / FPS_BUD, Math.max(0.01, tB + BUDOWA - t)) : Math.max(0.05, tNast - t) };
      }
      if (stoi) return { a: false, za: 5 };
      if (sc && t >= sc.tKon + POSTOJ + GAS) { sc = null; tNast = t + losowo(6, 14); }
      if (!sc && t >= tNast) sc = nowaSciezka(t);
      const st = stanSc(t);
      // sygnatura: przyrost o 0,6 px albo 1/40 krycia
      const s1 = sc ? Math.floor(st.s / KROK_PX) + ':' + Math.round(st.a * 40) : '';
      const b = s1 !== syg;
      syg = s1;
      let za: number;
      if (!sc) za = Math.max(0.05, tNast - t);
      else if (t < sc.tKon) za = KROK_PX / V;
      else if (t < sc.tKon + POSTOJ) za = Math.max(0.02, sc.tKon + POSTOJ - t);
      else za = 1 / FPS_GAS;
      return { a: false, b, za };
    },
    // łuki (w budowie — od największych) i w wariancie zakładu zbiór Cantora na osi
    rysuj(c, t) {
      const p = postep(t);
      c.lineWidth = 1;
      const luk = (l: (typeof luki)[number]) => { c.ellipse(l.cx, os, l.rx, l.ry, 0, l.g ? Math.PI : 0, l.g ? 2 * Math.PI : Math.PI); };
      if (p >= 1) {
        c.strokeStyle = prawy(c, LUKI);
        c.beginPath();
        for (const l of luki) { c.moveTo(l.cx + (l.g ? -l.rx : l.rx), os); luk(l); }
        c.stroke();
      } else {
        for (const l of luki) {
          const a = LUKI * S((p - 0.55 * l.f) / 0.45);
          if (a <= 0.002) continue;
          c.strokeStyle = prawy(c, a);
          c.beginPath(); c.moveTo(l.cx + (l.g ? -l.rx : l.rx), os); luk(l); c.stroke();
        }
      }
      if (zak) {
        const a = CANTOR * S(p * 1.5 - 0.3);
        if (a <= 0.002) return;
        const dl = Sx / N3;
        c.strokeStyle = prawy(c, a); c.lineWidth = 1.8;
        c.beginPath();
        for (let i = 0; i + 1 < pkt.length; i += 2) { c.moveTo(xa + pkt[i] * dl, os); c.lineTo(xa + pkt[i + 1] * dl, os); }
        c.stroke();
      }
    },
    // narysowana część kompozanty; pudło — jej zasięg
    rysujB(c, t): Pudlo {
      const st = stanSc(t);
      if (!sc || st.a <= 0.003 || st.s <= 0) return [0, 0, 0, 0];
      const { xy, cum } = sc;
      let xa0 = xy[0], xb0 = xy[0], ya0 = xy[1], yb0 = xy[1];
      const dodaj = (x: number, y: number) => { c.lineTo(x, y); xa0 = Math.min(xa0, x); xb0 = Math.max(xb0, x); ya0 = Math.min(ya0, y); yb0 = Math.max(yb0, y); };
      c.strokeStyle = prawy(c, SCIEZKA * st.a); c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(xy[0], xy[1]);
      for (let i = 1; i < cum.length; i++) {
        if (cum[i] > st.s) {
          const f = (st.s - cum[i - 1]) / (cum[i] - cum[i - 1]);
          dodaj(xy[2 * i - 2] + f * (xy[2 * i] - xy[2 * i - 2]), xy[2 * i - 1] + f * (xy[2 * i + 1] - xy[2 * i - 1]));
          break;
        }
        dodaj(xy[2 * i], xy[2 * i + 1]);
      }
      c.stroke();
      return [xa0 - 3, ya0 - 3, xb0 + 3, yb0 + 3];
    },
    gotowy() { stoi = true; sc = null; },
  };
};

export default motyw;
