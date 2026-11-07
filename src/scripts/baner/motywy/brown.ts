// Seminarium „Teoria prawdopodobieństwa i modelowanie stochastyczne”: trajektorie ruchu Browna w konstrukcji
// Lévy’ego–Ciesielskiego (prototyp animacje-analiza.html, motyw „brown”; zaakceptowany 31.10.2026).
// Cztery trajektorie procesu Wienera z jednego punktu (pod tytułem) i słaba obwiednia ±2√t.
// Wariant „zaklad” (Zakład Teorii Prawdopodobieństwa — w prototypie go nie było; propozycja w duchu teorii ryzyka, jednego
// z obszarów zakładu): trzy trajektorie ruchu Browna z ujemnym dryfem B(t) − ct, nad każdą słaba linia jej bieżącego
// maksimum (płaskie „dachy” nad rekordami) i przerywany poziom u — ruina, gdy supremum przekroczy u:
// ψ(u) = P(sup (B(t) − ct) > u). Bieżące maksimum zależy od trajektorii w sposób ciągły, więc ruch jest równie spokojny.
// Ruch: przy wejściu trajektorie powstają przez dokładanie punktów w połowach przedziałów, jak w konstrukcji Lévy’ego
// (raz, ok. 6 s). Potem co 5–14 s (losowo) jeden odcinek jednej trajektorii zostaje wylosowany na nowo jako most Browna
// i płynnie (ok. 2 px/s) przechodzi w nowy kształt; rozkład trajektorii się nie zmienia.
// Pole (zlecenie 07): trajektorie od góry pola + 4 px do 8 px nad jego dołem (|B| ≤ 2,45 jak w prototypie). Przy 390×844
// punkt startu jest ok. 15 px wyżej niż w prototypie, w pionie 89–92% jego wielkości, poziomo bez zmian.
// Klatka tylko wtedy, gdy któryś punkt trajektorii przesunął się o ≥ 0,5 px.
import type { Fabryka, Ustawienia } from '../typy';
import { generator } from '../wspolne';
import { Anim, ZIARNO, budowa, gauss, wazone, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const LV = 8, M = 1 << LV, TB = 0.35, TK = 0.62, DB = 0.58;   // 256 przedziałów; budowanie: poziom co 0,62 s
const LIM = 2.45, OBWIEDNIA = 0.06, ALF = [0.19, 0.15, 0.17, 0.14];
// wariant ryzyka (jednostki σ): dryf c, poziom u, zakres trajektorii od DOL do GORA; linie maksimów i poziomu
const C = 1.2, U = 0.8, GORA = 1.3, DOL = -3.4, MAKSIMA = 0.08, POZIOM = 0.2;

const motyw: Fabryka = (G, t0) => {
  const ryzyko = G.wariant === 'zaklad', K = ryzyko ? 3 : 4, los = generator(ZIARNO), w = G.x1 - G.x0;
  const g0 = G.y0 + 4, g1 = G.y1 - 8;
  const sig = ryzyko ? (g1 - g0) / (GORA - DOL) : (g1 - g0) / 2 / LIM;   // px na jednostkę
  const y00 = ryzyko ? g0 + GORA * sig : (g0 + g1) / 2;                 // wysokość punktu startu
  const X = (i: number) => G.x0 + i / M * w;
  const dryf = (i: number) => (ryzyko ? C * i / M : 0);
  const Yp = (i: number, b: number) => y00 - sig * (b - dryf(i));
  // dopuszczalne trajektorie: |B| ≤ 2,45 (wariant: DOL ≤ B(t) − ct ≤ GORA)
  const dobra = (B: Float64Array, a: number, b: number) => {
    for (let i = a; i <= b; i++) { const v = B[i] - dryf(i); if (ryzyko ? v < DOL || v > GORA : Math.abs(v) > LIM) return false; }
    return true;
  };
  const poziom = (i: number) => { if (i === 0) return -1; if (i === M) return 0; let j = LV; while (i % 2 === 0) { i /= 2; j--; } return j; };
  // most Browna na [a, b] (wartości w a i b zostają): punkty w połowach przedziałów, wariancja (b − a)/4M
  const most = (B: Float64Array, a: number, b: number, rnd: () => number) => {
    if (b - a < 2) return;
    const m = (a + b) / 2;
    B[m] = (B[a] + B[b]) / 2 + Math.sqrt((b - a) / M / 4) * gauss(rnd);
    most(B, a, m, rnd); most(B, m, b, rnd);
  };
  const B: Float64Array[] = [], disp: Anim[][] = [];
  for (let k = 0; k < K; k++) {
    let b = new Float64Array(M + 1);
    for (let p = 0; p < 400; p++) { b = new Float64Array(M + 1); b[M] = gauss(los); most(b, 0, M, los); if (dobra(b, 0, M)) break; }
    B.push(b);
    disp.push(Array.from({ length: M + 1 }, () => new Anim(0)));
  }

  let rev = -1, gotowe = false, tNast = 0, brudny = true;
  // odsłonięcie poziomu: nowe punkty startują w połowie cięciwy (rysunek się nie zmienia) i dochodzą do swoich wartości
  const odslon = (lev: number, t: number) => {
    for (let k = 0; k < K; k++) for (let i = 1; i <= M; i++) if (poziom(i) === lev) {
      const h = 1 << (LV - lev), D = disp[k], a = D[i];
      a.od = a.cel = a.r = lev === 0 ? 0 : (D[i - h].w(t) + D[i + h].w(t)) / 2; a.d = 0;
      a.ustaw(t, B[k][i], DB);
    }
  };
  const zbuduj = () => { disp.forEach((D, k) => D.forEach((a, i) => { a.od = a.cel = a.r = B[k][i]; a.d = 0; })); rev = LV; gotowe = true; };
  if (!budowa(t0)) { zbuduj(); tNast = t0 + 3 + Math.random() * 4; }

  // zdarzenie: losowy odcinek diadyczny losowej trajektorii (w odsłoniętej części) losowany na nowo jako most Browna.
  // Poziom odcinka j = 1…4 z wagami jak w prototypie (0,4 : 1 : 1 : 0,8), odcinek w poziomie — równo prawdopodobny;
  // losujemy tylko spośród odcinków, których środek widać (przy długich tytułach jest ich niewiele)
  const zdarzenie = (t: number) => {
    const kand: [number, number, number][] = [], wagi: number[] = [];
    for (let k = 0; k < K; k++) for (let j = 1; j <= 4; j++) {
      const h = 1 << (LV - j);
      for (let a = 0; a < M; a += 2 * h) if (G.widac(X(a + h), Yp(a + h, B[k][a + h])) >= 0.6) { kand.push([k, a, h]); wagi.push([0.4, 1, 1, 0.8][j - 1] / (1 << (j - 1))); }
    }
    for (let proba = 0; proba < 12 && kand.length; proba++) {
      const [k, a, h] = wazone(kand, wagi, Math.random), b = a + 2 * h;
      const nb = B[k].slice();
      let ok = false;
      for (let p = 0; p < 12 && !ok; p++) { most(nb, a, b, Math.random); ok = dobra(nb, a, b); }
      if (!ok) continue;
      let dm = 0;
      for (let i = a + 1; i < b; i++) dm = Math.max(dm, Math.abs(nb[i] - B[k][i]) * sig);
      if (dm < 3) continue;
      const D = Math.max(3.5, dm / 2.3);
      for (let i = a + 1; i < b; i++) disp[k][i].ustaw(t, nb[i], D);
      B[k] = nb;
      return D;
    }
    return 2;
  };
  const ktos = (t: number) => disp.some((D) => D.some((a) => a.trwa(t)));

  return {
    krok(t) {
      if (!gotowe) {
        while (rev < LV && t >= t0 + TB + (rev + 1) * TK) { rev++; odslon(rev, t0 + TB + rev * TK); brudny = true; }
        if (rev >= LV && t >= t0 + TB + LV * TK + DB) { gotowe = true; tNast = t + 3 + Math.random() * 4; }
      } else if (t >= tNast && !ktos(t)) tNast = t + zdarzenie(t) + 5 + Math.random() * 9;
      let vmax = 0, ruch = false, prz = 0;
      for (const D of disp) for (const a of D) {
        if (a.trwa(t)) { ruch = true; vmax = Math.max(vmax, a.v(t) * sig); }
        prz = Math.max(prz, Math.abs(a.w(t) - a.r) * sig);
      }
      const za = !gotowe ? 1 / 15 : ruch ? zaKlatka(vmax) : Math.max(0.05, tNast - t);
      const zm = brudny || prz >= 0.5 || (!ruch && prz > 0.05);
      if (zm) { for (const D of disp) for (const a of D) a.r = a.w(t); brudny = false; }
      return { a: zm, za };
    },
    rysuj(c, t) {
      c.lineWidth = 1;
      if (ryzyko) {
        // poziom u (przerywany), na całą szerokość
        c.setLineDash([3, 3]);
        c.strokeStyle = G.rgba(POZIOM);
        c.beginPath(); c.moveTo(G.x0, y00 - U * sig); c.lineTo(G.x1, y00 - U * sig); c.stroke();
        c.setLineDash([]);
      } else {
        // obwiednia ±2√t
        c.strokeStyle = G.rgba(OBWIEDNIA);
        c.beginPath();
        for (let zn = -1; zn <= 1; zn += 2) {
          c.moveTo(G.x0, y00);
          for (let x = 0.005; x <= 1.0001; x += 0.005) c.lineTo(G.x0 + x * w, y00 - zn * 2 * sig * Math.sqrt(x));
        }
        c.stroke();
      }
      if (rev < 0) return;
      const krk = 1 << (LV - rev);
      c.lineWidth = 1.05;
      for (let k = 0; k < K; k++) {
        c.strokeStyle = G.rgba(ALF[k]);
        c.beginPath(); c.moveTo(X(0), y00);
        for (let i = krk; i <= M; i += krk) c.lineTo(X(i), Yp(i, disp[k][i].w(t)));
        c.stroke();
      }
      if (ryzyko) {
        // bieżące maksima (na ekranie: najmniejsze y dotąd)
        c.lineWidth = 1;
        c.strokeStyle = G.rgba(MAKSIMA);
        c.beginPath();
        for (let k = 0; k < K; k++) {
          let ym = y00;
          c.moveTo(X(0), ym);
          for (let i = krk; i <= M; i += krk) { ym = Math.min(ym, Yp(i, disp[k][i].w(t))); c.lineTo(X(i), ym); }
        }
        c.stroke();
      }
    },
    // ograniczenie ruchu: gotowe trajektorie, bez zdarzeń
    gotowy() { zbuduj(); tNast = 1e9; },
  };
};

export default motyw;
