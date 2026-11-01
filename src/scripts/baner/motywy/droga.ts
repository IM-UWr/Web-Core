// Pierwszy rok, Egzaminy i dyplom, Procedura dyplomowania: „Droga” po kratce do celu (zlecenie 04; prototyp
// animacje-studia-codziennosc.html, rodzina „droga”, ustawienia telefonu; zaakceptowany 31.10.2026). Schodkowa droga
// z lewego dolnego rogu kratki do celu (kółko) w prawym górnym rogu, tylko kroki w prawo i w górę. Takich dróg jest tyle,
// ile wynosi współczynnik dwumianowy (m + n po n): różne drogi, ten sam cel (taką drogę rysuje też zadanie Banacha
// o dwóch pudełkach zapałek). Kolejność kroków losowana przy wejściu.
// Ruch: co kilka sekund (1,5–7 s po poprzednim, losowo) jeden narożnik drogi przeskakuje na drugą stronę oczka kratki
// („w prawo, w górę” ↔ „w górę, w prawo”): wierzchołek idzie po przekątnej oczka średnio 2,5 px/s (9 s); początek i cel
// stoją. W 92% przypadków losowany jest narożnik, który widać (poza tekstem); przeskok całkiem pod tekstem dzieje się od
// razu i bez przerwy (najwyżej 6 z rzędu). Dwie warstwy: A — kropki kratki i cel, B — droga. Klatka po przesunięciu
// wierzchołka o ≥ 0,5 px (średnio ok. 3,4 kl./s), w przerwach zegar śpi. Bez budowania: droga pojawia się z płótnem.
// Pole (zlecenie 07): w prototypie dolny rząd kratki leżał 3 px nad dołem starego pola (przy dole hasła), a rzędów było
// tyle, ile się zmieściło. Tu kratka mieści się między y0 + 9 px (kółko celu) a y1 − 10 px, wyśrodkowana w pionie; oczko
// 16 px jak w prototypie (skala 100%), przy 390 × 844 i jednoliniowym tytule jeden rząd mniej (6 zamiast 7), środek
// kratki 12–16 px wyżej. Kolumn tyle co w prototypie: od granicy, za którą rysunek widać w ¾ wierszy pola, minus dwa
// oczka, ale co najmniej 6.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const OKO = 16, DROGA = 0.19, KROPKI = 0.14, CEL = 1.2, V = 2.5;   // oczko (px), krycie drogi i kropek, cel ×, px/s
const PIERWSZY = 1.5, PRZERWA = [1.5, 7], CIEMNE = 6, GORA = 9, DOL = 10;

type Pt = [number, number];
const los = (a: number, b: number) => a + Math.random() * (b - a);
/** odwrotność smoothstepu na [0, 1] */
const Sodw = (y: number) => 0.5 - Math.sin(Math.asin(1 - 2 * y) / 3);

const motyw: Fabryka = (G, t0) => {
  const c = OKO, x1 = G.x1;
  // granica, za którą rysunek widać w ¾ wierszy pola (25. percentyl granicy pełnej widoczności; prototyp: xWid25)
  const gr: number[] = [];
  for (let y = G.y0; y <= G.y1; y += 2) gr.push(G.granica(y) + 60);
  gr.sort((a, b) => a - b);
  const x25 = gr[Math.floor(gr.length / 4)];
  const nx = Math.max(1, Math.min(Math.floor((x1 - G.x0) / c), Math.max(6, Math.floor((x1 - Math.max(G.x0, x25 - 2 * c)) / c))));
  const yT = G.y0 + GORA, yB = G.y1 - DOL, ny = Math.max(3, Math.floor((yB - yT) / c));
  const gx0 = x1 - nx * c, gy0 = yB - Math.max(0, (yB - yT - ny * c) / 2), iL = -Math.floor((gx0 - G.x0) / c);
  const PX = (i: number) => gx0 + i * c, PY = (j: number) => gy0 - j * c;
  const widac = (p: Pt) => G.widac(PX(p[0]), PY(p[1]));

  // kroki drogi: 0 — w prawo, 1 — w górę; nx + ny kroków w losowej kolejności
  const kroki: number[] = [];
  for (let i = 0; i < nx + ny; i++) kroki.push(i < nx ? 0 : 1);
  for (let i = kroki.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [kroki[i], kroki[j]] = [kroki[j], kroki[i]]; }
  const wierzcholki = () => {
    const v: Pt[] = [[0, 0]];
    let a = 0, b = 0;
    for (const k of kroki) { if (k) b++; else a++; v.push([a, b]); }
    return v;
  };

  // przeskok narożnika k (wierzchołek między krokami k − 1 i k) z punktu z do na, od chwili t przez T s
  type Ruch = { k: number; z: Pt; na: Pt; t: number; T: number; ciemny: boolean };
  let ruch: Ruch | null = null, tNast = t0 + PIERWSZY, stoi = false, ciemne = 0, eR = 0;
  const zacznij = (t: number) => {
    const v = wierzcholki(), wsz: number[] = [], wid: number[] = [];
    const cel = (k: number): Pt => (kroki[k - 1] === 0 ? [v[k - 1][0], v[k - 1][1] + 1] : [v[k - 1][0] + 1, v[k - 1][1]]);
    for (let k = 1; k < kroki.length; k++) if (kroki[k - 1] !== kroki[k]) {
      wsz.push(k);
      if (Math.max(widac(v[k]), widac(cel(k))) > 0.5) wid.push(k);
    }
    if (!wsz.length) { tNast = t + 5; return; }                // droga bez narożników (kratka w jeden rząd) — nic do przeskoku
    const lista = wid.length && Math.random() < 0.92 ? wid : wsz, k = lista[Math.floor(Math.random() * lista.length)];
    const na = cel(k), ciemny = Math.max(widac(v[k]), widac(na)) < 0.15;
    ruch = { k, z: v[k], na, t, T: ciemny ? 0.001 : c * Math.SQRT2 / V, ciemny };
  };
  const L = c * Math.SQRT2;                                 // droga wierzchołka (px)
  /** wierzchołek w ruchu (px) albo null */
  const pozycja = (t: number): Pt | null => {
    if (!ruch) return null;
    const e = S((t - ruch.t) / ruch.T), R = ruch;
    return [PX(R.z[0] + (R.na[0] - R.z[0]) * e), PY(R.z[1] + (R.na[1] - R.z[1]) * e)];
  };

  return {
    krok(t) {
      let zmiana = false;
      for (let g = 0; g < 16 && !stoi; g++) {
        const R = ruch as Ruch | null;
        if (R && t >= R.t + R.T) {
          [kroki[R.k - 1], kroki[R.k]] = [kroki[R.k], kroki[R.k - 1]];
          ciemne = R.ciemny ? ciemne + 1 : 0;
          tNast = R.t + R.T + (R.ciemny && ciemne < CIEMNE ? 0 : los(PRZERWA[0], PRZERWA[1]));
          if (ciemne >= CIEMNE) ciemne = 0;
          ruch = null; zmiana = true; eR = 0;
          continue;
        }
        if (!R && t >= tNast) { zacznij(tNast); continue; }
        break;
      }
      const R = ruch as Ruch | null;
      if (!R) return { a: false, b: zmiana, za: stoi ? 5 : Math.max(0.05, tNast - t) };
      // klatka po przesunięciu o ≥ 0,5 px; następna wtedy, gdy smoothstep przejdzie kolejne 0,5 px drogi
      const e = S((t - R.t) / R.T), b = zmiana || L * (e - eR) >= 0.5;
      if (b) eR = e;
      return { a: false, b, za: Math.max(1 / 30, R.t + R.T * Sodw(Math.min(1, eR + 0.5 / L)) - t) };
    },
    // kropki kratki (od lewego brzegu treści, tylko tam, gdzie je widać) i kółko celu
    rysuj(k) {
      k.beginPath();
      for (let a = iL; a <= nx; a++) for (let b = 0; b <= ny; b++) {
        const x = PX(a), y = PY(b);
        if (G.widac(x, y) < 0.01) continue;
        k.moveTo(x + 1.05, y); k.arc(x, y, 1.05, 0, 2 * Math.PI);
      }
      k.fillStyle = G.rgba(KROPKI); k.fill();
      k.beginPath(); k.arc(PX(nx), PY(ny), 3.4, 0, 2 * Math.PI);
      k.lineWidth = 1.4; k.strokeStyle = G.rgba(DROGA * CEL); k.stroke();
    },
    // droga (wierzchołek w ruchu na swoim miejscu); pudło — kratka
    rysujB(k, t): Pudlo {
      const v = wierzcholki(), p = pozycja(t);
      k.beginPath();
      v.forEach((q, i) => {
        const x = ruch && p && i === ruch.k ? p[0] : PX(q[0]), y = ruch && p && i === ruch.k ? p[1] : PY(q[1]);
        if (i) k.lineTo(x, y); else k.moveTo(x, y);
      });
      k.lineWidth = 1.6; k.strokeStyle = G.rgba(DROGA); k.stroke();
      return [gx0 - 3, PY(ny) - 3, x1 + 3, gy0 + 3];
    },
    // ograniczenie ruchu: droga stoi
    gotowy() { stoi = true; ruch = null; },
  };
};

export default motyw;
