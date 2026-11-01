// Aktualności: szereg Fouriera fali prostokątnej (prototyp aktualnosci-fourier.html v5, wariant 3 — zaakceptowany 31.10.2026).
// Budowanie raz przy wejściu: przez 20 s płynnie dochodzą kolejne wyrazy (od samej sinusoidy do 13 wyrazów).
// Potem fala stoi i lekko „oddycha” wagami wyższych harmonicznych (30%), a co losową przerwę (średnio 12 s, ±60%)
// rozkłada się do losowo 4–9 wyrazów i składa w tempie budowania (16 s na zejście o 8 wyrazów). Słabe linie pod spodem
// to sumy częściowe do 1, 3 i 7 harmonicznej. Fala wypełnia pole rysunku (do połowy hasła; zlecenie 07 — spłaszczona w pionie),
// w poziomie od końca linku „←” do prawego brzegu treści (zlecenie 08).
// Klatka tylko wtedy, gdy któryś punkt fali przesunął się o ≥ 0,5 px; zegar budzi się 15 razy/s w trakcie zmian
// i 4 razy/s, gdy fala tylko oddycha.
import type { Fabryka, Ustawienia } from '../typy';
import { S, ogr } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const FALA = 0.14, SUMY = 0.06;                          // krycie fali i sum częściowych
const J = 13, WYSOKOSC = 0.8, OKRES = 120, BUDOWA = 20;  // wyrazy, część wysokości pola, okres (px), budowanie (s)
const M_MIN = 4, M_MAX = 9, PRZERWA = 12, OSC = 0.3, OSC_T = 16, START = 1.5;

type Rozklad = { s: number; m: number; d: number };

const motyw: Fabryka = (G) => {
  // zlecenie 08: fala zaczyna się w poziomie na końcu tekstu linku „← Strona główna” (bez linku — od G.x0), kończy na G.x1;
  // liczba okresów z długości tego odcinka
  const top = G.y0, dol = G.y1, xa = ogr(G.link ? G.link.r : G.x0, G.x0, G.x1 - OKRES / 2), span = G.x1 - xa;
  const P = Math.max(1, Math.round(span / OKRES)), okres = span / P, yc = (top + dol) / 2, N = Math.round(span) + 1;
  const xs = new Float64Array(N), tab = new Float64Array(N * J);
  for (let i = 0; i < N; i++) {
    const x = xa + i * span / (N - 1), th = 2 * Math.PI * (x - xa) / okres;
    xs[i] = x;
    for (let j = 0; j < J; j++) tab[i * J + j] = Math.sin((2 * j + 1) * th) / (2 * j + 1);
  }
  // A·Σ: amplituda pierwszej sinusoidy = 80% połowy wysokości pola — sumy częściowe mieszczą się w polu
  const skala = (dol - top) * WYSOKOSC / 2;
  const w = new Float64Array(J);
  const suma = (out: Float64Array) => {
    for (let i = 0; i < N; i++) { let v = 0; const o = i * J; for (let j = 0; j < J; j++) v += w[j] * tab[o + j]; out[i] = yc - skala * v; }
    return out;
  };
  const wagiM = (M: number) => { for (let j = 0; j < J; j++) w[j] = S(M - j); };   // M ciągłe 1…J; kolejne wyrazy wchodzą płynnie
  const sumy = [1, 2, 4].map((m) => { wagiM(m); return suma(new Float64Array(N)); });
  // pierwszy punkt, który ma sens rysować (na lewo od granicy zanikania i tak nic nie widać)
  let xMin = Infinity;
  for (let y = top; y <= dol; y += 2) xMin = Math.min(xMin, G.granica(y));
  const i0 = ogr(Math.floor(xMin - xa) - 2, 0, N - 2);

  // plan rozkładów: fala stoi, a co losową przerwę rozkłada się do losowej liczby wyrazów i składa z powrotem;
  // czas rozkładu rośnie z głębokością, więc linia rusza się zawsze w tym samym tempie co przy budowaniu
  const lista: Rozklad[] = [];
  let koniec = 0;
  const plan = (t: number) => {
    while (koniec < t + 0.001) {
      const m = M_MIN + Math.random() * (M_MAX - M_MIN), d = OSC_T * (J - m) / 8, s = koniec + PRZERWA * (0.4 + 1.2 * Math.random());
      lista.push({ s, m, d }); koniec = s + d;
      if (lista.length > 8) lista.shift();
    }
    for (let q = lista.length - 1; q >= 0; q--) {
      const z = lista[q];
      if (t >= z.s && t < z.s + z.d) return { M: J - (J - z.m) * (1 - Math.cos(2 * Math.PI * (t - z.s) / z.d)) / 2, doNast: 0 };
      if (t >= z.s + z.d) break;
    }
    const nast = lista.find((z) => z.s > t);
    return { M: J, doNast: nast ? nast.s - t : 5 };
  };

  const ys = new Float64Array(N), ost = new Float64Array(N);
  let jest = false, stoi = false;
  // ustawia ys dla chwili t; zwraca czas do następnego kroku (s)
  const stan = (t: number) => {
    if (stoi) { wagiM(J); suma(ys); return 5; }
    if (t < BUDOWA) { wagiM(1 + (J - 1) * (1 - Math.cos(Math.PI * t / BUDOWA)) / 2); suma(ys); return 1 / 15; }
    const tp = Math.max(0, t - BUDOWA - START), pl = plan(tp), el = OSC * S(tp / 5);   // oddychanie narasta przez 5 s
    for (let j = 0; j < J; j++) {
      const a = j === 0 ? 0 : Math.min(1, j / 4);
      w[j] = S(pl.M - j) * (1 + el * a * Math.sin(2 * Math.PI * tp / (11 * (1 + 0.37 * j)) + 2.1 * j));
    }
    suma(ys);
    return pl.doNast > 0 ? Math.min(0.25, pl.doNast) : 1 / 15;
  };

  return {
    krok(t) {
      const za = stan(t);
      let m = 0;
      if (jest) for (let i = i0; i < N; i += 2) m = Math.max(m, Math.abs(ys[i] - ost[i]));
      const a = !jest || m >= 0.5;
      if (a) { ost.set(ys); jest = true; }
      return { a, za };
    },
    rysuj(c) {
      const linia = (y: Float64Array) => {
        c.beginPath(); c.moveTo(xs[i0], y[i0]);
        for (let i = i0 + 1; i < N; i++) c.lineTo(xs[i], y[i]);
        c.stroke();
      };
      c.strokeStyle = G.rgba(SUMY); c.lineWidth = 1;
      sumy.forEach(linia);
      c.strokeStyle = G.rgba(FALA); c.lineWidth = 1.5;
      linia(ost);
    },
    gotowy() { stoi = true; stan(0); ost.set(ys); jest = true; },
  };
};

export default motyw;
