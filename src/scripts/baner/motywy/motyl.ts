// Infrastruktura informatyczna: sieć motylkowa (prototyp animacje-instytut.html, motyw „motyl”; zaakceptowany 31.10.2026).
// 8 wierszy (numery 0–7, czyli 3 bity) i kolumny przełączników co ok. 44 px. Na każdym etapie krawędź pozioma zostawia
// numer wiersza, a ukośna zmienia w nim jeden bit (kolejno bit 1., 2. i 3.). Taka sieć łączy procesory i przełączniki
// w komputerach równoległych, a jej układ to zarazem schemat szybkiej transformaty Fouriera.
// Ruch: przy wejściu (raz) sieć pojawia się w 1,5 s. Potem losowa trasa „pakietu” zapala się odcinek po odcinku (każdy
// w 0,8 s, kolejne co 1,2–2,1 s), stoi 6–14 s i gaśnie (2 s); następna zaczyna się, gdy poprzednia gaśnie. Trasa zaczyna
// się tuż przed widoczną częścią swojego wiersza (pierwszy odcinek wychodzi spod tekstu). Trasy są losowe, nic nie jedzie
// po liniach.
// Klatka w czasie zapalania odcinka 12 kl./s, gaśnięcia trasy 8 kl./s — tylko gdy zmianę widać; między zmianami zegar
// śpi (średnio ok. 3–4 kl./s).
// Pole (zlecenie 07): w prototypie wiersze leżały w [link „←” + 8, kreska − 15] (81–213 px przy 390 × 844 i tytule
// w dwóch liniach, odstęp 18,9 px); tu w [y0 + 4, y1 − 8] (71–190 px, odstęp 17 px): sieć 10 px wyżej u góry i 23 px
// u dołu, spłaszczona w pionie do 90% (poziomo bez zmian).
import type { Fabryka, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { budowa } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const RZ = 8, KOLUMNA = 44, GORA = 4, DOL = 8;
const POZIOME = 0.06, UKOSNE = 0.11, WEZLY = 0.2, TRASA = 0.42, KONCE = 0.5;
const ZAPAL = 0.8, GAS = 2, FPS_ZAP = 12, FPS_GAS = 8, PROG = 1 / 255;

/** odcinek trasy: etap s, z wiersza r do r2, zapala się od t0; ra — krycie na ostatniej klatce, wid — czy go widać */
type Odc = { s: number; r: number; r2: number; t0: number; ra: number; wid: boolean };
type Trasa = { od: Odc[]; koniec: number };

const los = (a: number, b: number) => a + Math.random() * (b - a);
const bit = (s: number) => s % 3;

const motyw: Fabryka = (G, t0) => {
  const top = G.y0 + GORA, dol = G.y1 - DOL, dy = (dol - top) / (RZ - 1);
  const Ck = Math.max(3, Math.round((G.x1 - G.x0) / KOLUMNA)), dx = (G.x1 - G.x0) / Ck, X: number[] = [];
  for (let c = 0; c <= Ck; c++) X.push(G.x0 + c * dx);
  const Yr = (r: number) => top + r * dy;
  // pierwsza kolumna trasy w każdym wierszu: tuż przed węzłem, który już dobrze widać (co najmniej dwa odcinki)
  const start = Array.from({ length: RZ }, (_, r) => {
    let s = 0;
    while (s < Ck - 2 && G.widac(X[s + 1], Yr(r)) < 0.5) s++;
    return s;
  });

  const bud = budowa(t0), tB = bud ? t0 : -1e9;
  let trasy: Trasa[] = [], tNast = bud ? tB + 3 : t0 + 1, stoi = false, pierwszy = true, raS = -1;
  const nowaTrasa = (t: number): Trasa => {
    let r = Math.floor(Math.random() * RZ), tt = t;
    const od: Odc[] = [];
    for (let s = start[r]; s < Ck; s++) {
      const r2 = Math.random() < 0.5 ? r : r ^ (1 << bit(s)), xm = (X[s] + X[s + 1]) / 2, ym = (Yr(r) + Yr(r2)) / 2;
      const wid = Math.max(G.widac(X[s], Yr(r)), G.widac(xm, ym), G.widac(X[s + 1], Yr(r2))) > 0.02;
      od.push({ s, r, r2, t0: tt, ra: 0, wid });
      r = r2; tt += los(1.2, 2.1);
    }
    return { od, koniec: tt + los(6, 14) };
  };
  const alfaS = (t: number) => (stoi ? 1 : S((t - tB) / 1.5));
  const alfaO = (T: Trasa, e: Odc, t: number) => (stoi ? 1 : S((t - e.t0) / ZAPAL) * (1 - S((t - T.koniec) / GAS)));

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      if (t >= tNast) { const T = nowaTrasa(tNast); trasy.push(T); tNast = T.koniec + 0.4; }
      let a = pierwszy, zap = false, gas = false, nast = tNast - t;
      pierwszy = false;
      const aS = alfaS(t);
      if (Math.abs(aS - raS) * UKOSNE * 255 >= 1) a = true;
      for (const T of trasy) {
        if (t > T.koniec && t < T.koniec + GAS) gas = true;
        else if (T.koniec > t) nast = Math.min(nast, T.koniec - t);
        for (const e of T.od) {
          if (t > e.t0 && t < e.t0 + ZAPAL) zap = true;
          else if (e.t0 > t) nast = Math.min(nast, e.t0 - t);
          // widoczna zmiana krycia odcinka (i dokończenie do 0 albo 1)
          const v = alfaO(T, e, t);
          if (e.wid && (Math.abs(v - e.ra) * TRASA >= PROG || ((v === 0 || v === 1) && v !== e.ra))) a = true;
        }
      }
      // trasa zgasła: znika
      const przed = trasy.length;
      trasy = trasy.filter((T) => t < T.koniec + GAS);
      if (trasy.length !== przed) a = true;
      if (a) { raS = aS; for (const T of trasy) for (const e of T.od) e.ra = alfaO(T, e, t); }
      const za = aS < 1 || zap ? 1 / FPS_ZAP : gas ? 1 / FPS_GAS : Math.max(0.05, nast);
      return { a, za: Math.min(za, Math.max(0.05, nast)) };
    },
    rysuj(c, t) {
      const aS = alfaS(t);
      c.lineWidth = 1; c.lineCap = 'round';
      // poziome krawędzie (wiersz bez zmian), ukośne (zmiana jednego bitu), węzły
      c.strokeStyle = G.rgba(POZIOME * aS);
      c.beginPath();
      for (let r = 0; r < RZ; r++) { c.moveTo(X[0], Yr(r)); c.lineTo(X[Ck], Yr(r)); }
      c.stroke();
      c.strokeStyle = G.rgba(UKOSNE * aS);
      c.beginPath();
      for (let s = 0; s < Ck; s++) for (let r = 0; r < RZ; r++) { c.moveTo(X[s], Yr(r)); c.lineTo(X[s + 1], Yr(r ^ (1 << bit(s)))); }
      c.stroke();
      c.fillStyle = G.rgba(WEZLY * aS);
      c.beginPath();
      for (let s = 0; s <= Ck; s++) for (let r = 0; r < RZ; r++) { c.moveTo(X[s] + 1, Yr(r)); c.arc(X[s], Yr(r), 1, 0, 2 * Math.PI); }
      c.fill();
      // zapalona trasa: odcinek i jego końce
      for (const T of trasy) for (const e of T.od) {
        const al = alfaO(T, e, t);
        if (al <= 0.003) continue;
        c.strokeStyle = G.rgba(TRASA * al); c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(X[e.s], Yr(e.r)); c.lineTo(X[e.s + 1], Yr(e.r2)); c.stroke();
        c.fillStyle = G.rgba(KONCE * al);
        c.beginPath();
        c.moveTo(X[e.s + 1] + 1.6, Yr(e.r2)); c.arc(X[e.s + 1], Yr(e.r2), 1.6, 0, 2 * Math.PI);
        c.moveTo(X[e.s] + 1.6, Yr(e.r)); c.arc(X[e.s], Yr(e.r), 1.6, 0, 2 * Math.PI);
        c.fill();
      }
    },
    // ograniczenie ruchu: sieć z jedną zapaloną trasą
    gotowy() { stoi = true; trasy = [nowaTrasa(0)]; },
  };
};

export default motyw;
