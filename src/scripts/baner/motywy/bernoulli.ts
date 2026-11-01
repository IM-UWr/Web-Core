// Sukcesy i zestawienie historyczne: schemat Bernoulliego (prototyp animacje-badania.html, motyw „bernoulli”;
// zaakceptowany 31.10.2026). Ścieżka idzie krok w górę po sukcesie i krok w dół po porażce (prawdopodobieństwo sukcesu
// 0,56), kropkowane schodki to kolejne rekordy — najlepszy wynik do danej chwili. Rysunek poglądowy, bez danych strony.
// Budowa raz przy wejściu (10 s, ścieżka rysuje się od lewej). Potem co losową przerwę (3–9 s) losowy odcinek ścieżki
// (8–20 kroków, częściej tam, gdzie go widać) przestawia kolejność swoich kroków: ta sama liczba sukcesów, inna kolejność.
// Odcinek w kilka sekund przechodzi w nowy kształt (≤ 3 px/s), a schodki rekordów idą za nim; klatka po zmianie ≥ 0,5 px.
// Wariant „historia” (zestawienie historyczne, lata 1946–2014): dwa razy gęstsza ścieżka (krok co 1,5 px), p = 0,53, odcinki
// 12–36 kroków i drobne znaczki co dekadę (1950–2010) pod ścieżką.
// Jedna warstwa (ścieżka i schodki przerysowywane w całości — to ok. 250 odcinków); między zmianami zegar śpi.
// Pole (zlecenie 07): dół ścieżki 10 px nad dołem pola (w wariancie „historia” 16 px, a znaczki dekad 8–12 px nad nim;
// maska silnika wygasza ostatnie 12 px), szczyt ok. 13 px pod górą pola. Lewa część ścieżki, schowana pod tytułem,
// może zejść niżej — jest spłaszczona 2 px nad dołem pola.
import type { Fabryka, Ustawienia } from '../typy';
import { S as ss, generator, ogr } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 6, przejscie: 60 };

const A = 0.22, REKORDY = 0.32, ZNACZKI = 0.2, BUDOWA = 10, FPS_BUDOWY = 15;
// ziarno raz na wczytanie strony: nowy układ (obrót telefonu, zmiana rozmiaru) daje tę samą ścieżkę
const ZIARNO = (Math.random() * 2 ** 32) >>> 0;

type Zd = { i: number; L: number; stare: Float32Array; nS: Float32Array; nowe: number[]; md: number; t0: number; T: number; ost: number };

const motyw: Fabryka = (G, t0) => {
  const hist = G.wariant === 'historia', rnd = generator(ZIARNO + (hist ? 1 : 0));
  const w = G.x1 - G.x0, n = Math.max(40, Math.round(w / (hist ? 1.5 : 3))), p = hist ? 0.53 : 0.56;
  // ścieżka: koniec blisko rekordu, rozpiętość co najmniej 10 (14) kroków, a w 35% długości wyraźnie pod rekordem
  const kroki = new Int8Array(n), Sc = new Float32Array(n + 1);
  let mn = 0, mx = 0;
  for (let proba = 0; proba < 300; proba++) {
    mn = 0; mx = 0; Sc[0] = 0;
    for (let k = 0; k < n; k++) { kroki[k] = rnd() < p ? 1 : -1; Sc[k + 1] = Sc[k] + kroki[k]; mn = Math.min(mn, Sc[k + 1]); mx = Math.max(mx, Sc[k + 1]); }
    if (Sc[n] >= mx - 2 && mx - mn >= (hist ? 14 : 10) && Sc[Math.round(n * 0.35)] < mx - (hist ? 8 : 6)) break;
  }
  // skala pionowa z prawych 60% ścieżki (ta część jest widoczna); lewa, schowana pod tytułem, może zejść niżej
  let mn2 = mx;
  for (let k = Math.floor(n * 0.4); k <= n; k++) mn2 = Math.min(mn2, Sc[k]);
  const yDol = G.y1 - (hist ? 16 : 10), dy = (yDol - G.y0 - 3) * 0.9 / Math.max(4, mx - mn2), dx = w / n;
  const y = (s: number) => Math.min(G.y1 - 2, yDol - (s - mn2) * dy);
  const xk = (k: number) => G.x0 + k * dx;
  // najwyższy poziom, który jeszcze mieści się w polu (4 px pod górą): przestawienie nie może wyprowadzić ścieżki wyżej
  const sMax = mn2 + (yDol - G.y0 - 4) / dy;

  let budowa = t0 <= 0, glowa = budowa ? 0 : n, ostG = -1, zd: Zd | null = null;
  let tNast = t0 + (budowa ? BUDOWA : 0) + 2 + 3 * Math.random();

  // przestawienie kroków w losowym odcinku; odcinek, który prawie się nie zmienia (< 1,5 px) albo wyszedłby nad pole,
  // losujemy jeszcze raz
  const zdarzenie = (t: number): Zd | null => {
    const Lmin = hist ? 12 : 8, Lmax = hist ? 36 : 20;
    for (let proba = 0; proba < 12; proba++) {
      const L = Lmin + Math.floor(Math.random() * (Lmax - Lmin + 1)), wagi: number[] = [];
      let s = 0;
      for (let i = 1; i < n - L; i++) { const m = i + (L >> 1), v = 0.02 + G.widac(xk(m), y(Sc[m])); wagi.push(v); s += v; }
      let r = Math.random() * s, i = 0;
      while (i < wagi.length - 1 && (r -= wagi[i]) > 0) i++;
      i += 1;
      const nowe = Array.from(kroki.subarray(i, i + L));
      for (let a = nowe.length - 1; a > 0; a--) { const b = Math.floor(Math.random() * (a + 1)); [nowe[a], nowe[b]] = [nowe[b], nowe[a]]; }
      const stare = new Float32Array(L + 1), nS = new Float32Array(L + 1);
      let md = 0;
      stare[0] = nS[0] = Sc[i];
      for (let a = 0; a < L; a++) { stare[a + 1] = Sc[i + a + 1]; nS[a + 1] = nS[a] + nowe[a]; md = Math.max(md, Math.abs(nS[a + 1] - stare[a + 1]) * dy); }
      if (md < 1.5 || nS.some((v) => v > sMax)) continue;
      return { i, L, stare, nS, nowe, md, t0: t, T: Math.max(5, md / 1.8), ost: 0 };
    }
    return null;
  };
  const zakoncz = (z: Zd) => {
    for (let a = 1; a < z.L; a++) Sc[z.i + a] = z.nS[a];
    for (let b = 0; b < z.L; b++) kroki[z.i + b] = z.nowe[b];
  };

  return {
    krok(t) {
      if (budowa) {
        const u = ogr((t - t0) / BUDOWA, 0, 1);
        glowa = n * (1 - Math.cos(Math.PI * u)) / 2;
        if (u >= 1) budowa = false;
        // klatka, gdy głowa ścieżki przesunęła się o ≥ 0,5 px w poziomie
        const a = Math.abs(glowa - ostG) * dx >= 0.5 || !budowa;
        if (a) ostG = glowa;
        return { a, za: budowa ? 1 / FPS_BUDOWY : Math.max(0.05, tNast - t) };
      }
      if (!zd) {
        if (t < tNast) return { a: false, za: tNast - t };
        zd = zdarzenie(t);
        if (!zd) { tNast = t + 2; return { a: false, za: 2 }; }
      }
      const z = zd, u = ogr((t - z.t0) / z.T, 0, 1), e = ss(u);
      if (u >= 1) {
        zakoncz(z); zd = null;
        tNast = t + 3 + 6 * Math.random();
        return { a: true, za: tNast - t };
      }
      const a = Math.abs(e - z.ost) * z.md >= 0.5;
      if (a) { z.ost = e; for (let k = 1; k < z.L; k++) Sc[z.i + k] = z.stare[k] + (z.nS[k] - z.stare[k]) * e; }
      // następna klatka, gdy najdalszy punkt odcinka przejdzie ok. 0,5 px (prędkość z pochodnej smoothstep)
      const v = z.md * 6 * u * (1 - u) / z.T;
      return { a, za: ogr(0.5 / Math.max(v, 0.01), 1 / 15, 0.5) };
    },
    rysuj(c) {
      const m = Math.min(n, glowa), k0 = Math.floor(m), f = m - k0;
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(A);
      c.beginPath(); c.moveTo(xk(0), y(Sc[0]));
      for (let k = 1; k <= k0; k++) c.lineTo(xk(k), y(Sc[k]));
      if (f > 0 && k0 < n) c.lineTo(xk(k0) + dx * f, y(Sc[k0]) + (y(Sc[k0 + 1]) - y(Sc[k0])) * f);
      c.stroke();
      // schodki rekordów: poziomo na wysokości rekordu, w górę przy każdym nowym rekordzie
      c.setLineDash([1.5, 3]); c.strokeStyle = G.rgba(REKORDY);
      let M = Sc[0];
      c.beginPath(); c.moveTo(xk(0), y(M));
      for (let k = 1; k <= k0; k++) { c.lineTo(xk(k), y(M)); if (Sc[k] > M) { M = Sc[k]; c.lineTo(xk(k), y(M)); } }
      c.stroke(); c.setLineDash([]);
      if (hist) {
        // znaczki co dekadę (1950–2010) na osi lat 1946–2014
        c.strokeStyle = G.rgba(ZNACZKI);
        c.beginPath();
        for (let r = 1950; r <= 2010; r += 10) { const x = G.x0 + (r - 1946 + 0.5) / 69 * w; c.moveTo(x, G.y1 - 12); c.lineTo(x, G.y1 - 8); }
        c.stroke();
      }
    },
    gotowy() {
      budowa = false; glowa = n;
      if (zd) { zakoncz(zd); zd = null; }
    },
  };
};

export default motyw;
