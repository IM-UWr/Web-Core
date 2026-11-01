// Drobne narzędzia wspólne dla motywów rodziny „analiza i probabilistyka” (prototyp animacje-analiza.html; zlecenie 03):
// rozsadnik, haar, czebyszew, wahadlo, brown, histogram. Plik zaczyna się od „_”: nie jest motywem żadnej strony
// (mapa strona → motyw go nie wskazuje), motywy importują go statycznie.
import { S, ogr } from '../wspolne';

/** ziarno kształtu startowego: losowe przy każdym wczytaniu strony, to samo przy przeliczeniu układu (zmiana rozmiaru,
 *  motyw jasny/ciemny) — rysunek się nie podmienia. Zdarzenia (kiedy i co się zmienia) losuje Math.random. */
export const ZIARNO = Math.floor(Math.random() * 4294967296);

/** budowanie przy wejściu tylko przy pierwszym układzie; po zmianie układu (t0 > 2 s) rysunek od razu stoi gotowy */
export const budowa = (t0: number) => t0 < 2;

/** wartość przechodzi płynnie (smoothstep) od `od` do `cel` w czasie [t0, t0 + d]; `r` — wartość na ostatniej klatce */
export class Anim {
  od: number; cel: number; t0 = 0; d = 0; r: number;
  constructor(v: number) { this.od = v; this.cel = v; this.r = v; }
  w(t: number): number {
    if (this.d <= 0 || t >= this.t0 + this.d) return this.cel;
    if (t <= this.t0) return this.od;
    return this.od + (this.cel - this.od) * S((t - this.t0) / this.d);
  }
  ustaw(t: number, cel: number, d: number) { this.od = this.w(t); this.cel = cel; this.t0 = t; this.d = d; }
  trwa(t: number): boolean { return this.d > 0 && t < this.t0 + this.d && this.od !== this.cel; }
  /** chwilowa prędkość (jednostki wartości na sekundę) */
  v(t: number): number {
    if (!this.trwa(t) || t < this.t0) return 0;
    const u = (t - this.t0) / this.d;
    return Math.abs(this.cel - this.od) * 6 * u * (1 - u) / this.d;
  }
}

/** odstęp do następnego kroku: tyle, żeby linia przesunęła się o ok. 0,55 px (najwyżej 15 kl./s, najrzadziej co 0,25 s) */
export function zaKlatka(vpx: number): number { return vpx > 1e-6 ? ogr(0.55 / vpx, 1 / 15, 0.25) : 0.25; }

/** liczba z rozkładu N(0, 1) (Box–Muller) */
export function gauss(los: () => number): number { return Math.sqrt(-2 * Math.log(1 - los())) * Math.cos(2 * Math.PI * los()); }

/** losowy element listy, prawdopodobieństwo proporcjonalne do wagi */
export function wazone<T>(lista: T[], wagi: number[], los: () => number): T {
  let x = los() * wagi.reduce((s, w) => s + w, 0), i = 0;
  for (; i < lista.length - 1 && x > wagi[i]; i++) x -= wagi[i];
  return lista[i];
}
