// Drobne funkcje wspólne dla silnika i motywów animacji banerów.

/** smoothstep na [0, 1] (wartości spoza przedziału obcięte) */
export function S(x: number): number { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }

export function ogr(x: number, a: number, b: number): number { return x < a ? a : x > b ? b : x; }

/** mulberry32: mały, powtarzalny generator liczb losowych — to samo ziarno daje ten sam rysunek */
export function generator(ziarno: number): () => number {
  let a = ziarno >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** losowy odstęp: średnio `sr`, rozrzut ±60% (0,4–1,6 × sr) */
export function losowyOdstep(sr: number): number { return sr * (0.4 + 1.2 * Math.random()); }
