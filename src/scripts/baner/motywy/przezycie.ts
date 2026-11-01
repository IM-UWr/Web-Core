// Specjalność „Matematyka aktuarialno-finansowa”: krzywe przeżycia (prototyp animacje-kierunki.html, motyw „przezycie”;
// zaakceptowany 31.10.2026). Gładka krzywa przeżycia S(x) = exp(−∫μ) według prawa Gompertza z małym składnikiem stałym
// (μ(x) = A + B·cˣ, jak w tablicach trwania życia) z osią wieku 0–105 lat (warstwa A) i dwie schodkowe krzywe empiryczne
// z próbek 14 i 28 osób, których wiek śmierci losowany jest z tego rozkładu (warstwa B).
// Ruch: przy wejściu oś i krzywa rysują się, potem pojawiają się schodki (5 s, raz). Potem co losową przerwę (1,2–3,5 s
// po poprzedniej zmianie) jedno losowe „życie” w próbce wydłuża się albo skraca o kilka lat — jeden schodek przesuwa się
// w bok (najwyżej 1,4 px/s). Zmiany losuje algorytm Metropolisa, więc próbki dalej pasują do krzywej.
// Klatka po przesunięciu schodka o ≥ 0,5 px (najwyżej ok. 3 kl./s); w przerwach i przy odrzuconej propozycji zegar śpi.
// Pole (zlecenie 07): w prototypie S = 1 leżało 5 px pod górą pola, a oś 4 px nad jego dołem (12 px nad kreską); tu S = 1
// jest na y0 + 5, a oś na y1 − 7. Przy 390 × 844 góra wykresu jest 8 px wyżej, oś 21 px wyżej niż w prototypie, wykres
// spłaszczony w pionie do 92% (poziomo bez zmian). Prawy brzeg gaśnie na ostatnich 14 px jak w masce prototypu.
import type { Fabryka, Pole, Ustawienia } from '../typy';
import { S, generator } from '../wspolne';
import { Anim, ZIARNO, budowa, gauss, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const AMAX = 105, A = 4e-4, B = 4e-5, C = 1.1, LC = Math.log(C), N1 = 14, N2 = 28;
const BUDOWA = 5, OS = 0.08, KRZYWA = 0.19, SCHODKI = 0.12, TEMPO = 1.4, FPS_BUD = 15;

const los = (a: number, b: number) => a + Math.random() * (b - a);
/** skumulowane natężenie zgonów, przeżycie i gęstość wieku śmierci */
const Hc = (a: number) => A * a + B * (C ** a - 1) / LC;
const Sv = (a: number) => Math.exp(-Hc(a));
const gest = (a: number) => (A + B * C ** a) * Sv(a);
/** wiek, w którym przeżycie spada do u (bisekcja) */
function odwr(u: number): number {
  const h = -Math.log(u);
  let lo = 0, hi = 140;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Hc(m) < h) lo = m; else hi = m; }
  return Math.min(AMAX - 0.5, (lo + hi) / 2);
}

/** prawy brzeg jak w masce prototypu: rysunek gaśnie na ostatnich 14 px przed x1 + 2 (maska silnika tego nie robi) */
function prawyBrzeg(c: CanvasRenderingContext2D, G: Pole) {
  const g = c.createLinearGradient(G.x1 - 12, 0, G.x1 + 2, 0);
  for (let i = 0; i <= 4; i++) g.addColorStop(i / 4, `rgba(0,0,0,${S(1 - i / 4).toFixed(3)})`);
  c.globalCompositeOperation = 'destination-in';
  c.fillStyle = g; c.fillRect(0, G.y0 - 2, G.W + 2, G.y1 - G.y0 + 4);
  c.globalCompositeOperation = 'source-over';
}

const motyw: Fabryka = (G, t0) => {
  const w = G.x1 - G.x0, yG = G.y0 + 5, yD = G.y1 - 7, px = w / AMAX;
  const X = (a: number) => G.x0 + a * px, Y = (s: number) => yG + (1 - s) * (yD - yG);
  const r0 = generator(ZIARNO);
  const zycie = Array.from({ length: N1 + N2 }, () => new Anim(odwr(1 - r0())));
  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let stoi = false, tZm = (bud ? tB + BUDOWA : t0) + 1.5 + los(1.2, 3.5), rP = -1;
  const rW = zycie.map((z) => z.cel);                                  // wiek śmierci na ostatniej klatce

  // propozycja Metropolisa w chwili s: jedno życie o N(0; 3,2) lat; zwraca chwilę końca ruchu (s, gdy odrzucona)
  const zmiana = (s: number) => {
    const z = zycie[Math.floor(Math.random() * zycie.length)], a = z.cel, b = a + gauss(Math.random) * 3.2;
    if (b < 0.5 || b > AMAX - 0.5 || Math.abs(b - a) < 0.8 || Math.random() > Math.min(1, gest(b) / gest(a))) return s;
    const d = Math.max(2.5, Math.abs(b - a) * px / TEMPO * 1.5);
    z.ustaw(s, b, d);
    return s + d;
  };

  const os = (c: CanvasRenderingContext2D) => {
    c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(AMAX), Y(0));
    for (let a = 10; a < AMAX; a += 10) { c.moveTo(X(a), Y(0)); c.lineTo(X(a), Y(0) - 4); }
    c.stroke();
  };
  const gompertz = (c: CanvasRenderingContext2D, aMax: number) => {
    c.beginPath(); c.moveTo(X(0), Y(1));
    for (let a = 0.5; a <= aMax; a += 0.5) c.lineTo(X(a), Y(Sv(a)));
    c.stroke();
  };
  // krzywa Kaplana–Meiera próbki: schodek w dół o 1/n w każdym wieku śmierci
  const km = (c: CanvasRenderingContext2D, wieki: number[]) => {
    const wk = wieki.slice().sort((p, q) => p - q), n = wk.length;
    let lev = 1;
    c.moveTo(X(0), Y(1));
    for (const a of wk) { c.lineTo(X(a), Y(lev)); lev -= 1 / n; c.lineTo(X(a), Y(Math.max(0, lev))); }
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      const p = bud ? Math.min(1, (t - tB) / BUDOWA) : 1;
      if (p >= 1) while (t >= tZm) tZm = zmiana(tZm) + los(1.2, 3.5);
      const a = p !== rP;
      let b = a, za = p < 1 ? 1 / FPS_BUD : Math.max(0.02, tZm - t);
      zycie.forEach((z, i) => {
        const v = z.w(t);
        if (z.trwa(t)) { za = Math.min(za, zaKlatka(z.v(t) * px)); if (Math.abs(v - rW[i]) * px >= 0.5) b = true; }
        else if (v !== rW[i]) b = true;                                  // dokończenie ruchu
      });
      rP = p;
      if (b) zycie.forEach((z, i) => { rW[i] = z.w(t); });
      return { a, b, za };
    },
    // oś wieku i krzywa Gompertza (przy wejściu rysuje się od lewej)
    rysuj(c) {
      const p = Math.max(0, rP);
      c.lineWidth = 1; c.strokeStyle = G.rgba(OS * (p < 1 ? S(p / 0.3) : 1)); os(c);
      c.lineWidth = 1.4; c.strokeStyle = G.rgba(KRZYWA); gompertz(c, AMAX * (p < 1 ? S(p / 0.7) : 1));
      prawyBrzeg(c, G);
    },
    // dwie krzywe schodkowe z próbek — jedną ścieżką: wspólny początek (S = 1 od urodzenia do pierwszej śmierci) nie
    // jaśnieje podwójnie (w prototypie dwie osobne kreski; tam ten odcinek chowała maska tekstu, tu leży nad linkiem „←”)
    rysujB(c) {
      const e = rP < 1 ? S((rP - 0.55) / 0.45) : 1;
      if (e <= 0) return;
      c.lineWidth = 1; c.strokeStyle = G.rgba(SCHODKI * e);
      c.beginPath(); km(c, rW.slice(0, N1)); km(c, rW.slice(N1)); c.stroke();
      prawyBrzeg(c, G);
    },
    // ograniczenie ruchu: oś, krzywa i obie próbki
    gotowy() { stoi = true; rP = 1; },
  };
};

export default motyw;
