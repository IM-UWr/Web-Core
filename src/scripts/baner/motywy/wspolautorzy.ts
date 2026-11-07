// Rocznik publikacji (/nauka/publikacje/<rok>/): łuki współautorstwa (prototyp animacje-badania.html, motyw
// „wspolautorzy”; zaakceptowany 31.10.2026). Na osi stoją wszyscy autorzy z wykazu danego roku (alfabetycznie, bez
// nazwisk), a każdy łuk to para współautorów jednej z prac wieloautorskich — prawdziwe pary z wykazu
// src/data/publikacje/RRRR.json (przez dane z widoku PublikacjeRok.astro: { n: liczba autorów, p: [i, j, i, j, …] }).
// Budowa raz przy wejściu, od lewej do prawej (ok. 10 s). Potem co kilka sekund (3–9 s) losowy łuk — częściej tam, gdzie
// go widać — gaśnie (3 s) i rysuje się od nowa od jednego z końców (3 px/s, gdy koniec widać; pod tekstem 70 px/s).
// Mechanizm łuków, warstwy i pole — wspólne z motywem „cytowania” (funkcja `luki`).
import type { Fabryka, Ustawienia } from '../typy';
import { luki } from './cytowania';

export const ustawienia: Ustawienia = { granica: 6, przejscie: 60 };

const motyw: Fabryka = (G, t0) => {
  const d = (G.dane ?? {}) as { n?: number; p?: number[] }, n = Math.max(0, Math.floor(Number(d.n) || 0));
  const p = Array.isArray(d.p) ? d.p : [];
  return luki(G, t0, {
    // autorzy równo na osi
    wezly: (_, x0, x1) => Array.from({ length: n }, (_, k) => ({ x: x0 + (k + 0.5) * (x1 - x0) / n, c: 0 })),
    // pary współautorów; łuk od prawego końca (a) do lewego (b)
    pary: () => {
      const out: [number, number][] = [];
      for (let i = 0; i + 1 < p.length; i += 2) {
        const a = Math.max(p[i], p[i + 1]), b = Math.min(p[i], p[i + 1]);
        if (a !== b && b >= 0 && a < n) out.push([a, b]);
      }
      return out;
    },
    cytowanie: false, gas: 3, przerwa: [3, 9],
  });
};

export default motyw;
