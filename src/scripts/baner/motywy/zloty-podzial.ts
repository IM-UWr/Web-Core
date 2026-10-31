// Popularyzacja: złoty podział odcinka cyrklem i linijką (prototyp popularyzacja-cyrkiel.html v2, ślad cyrkla
// „punkt wbicia”; decyzja użytkownika 31.10.2026, 22:23: „jest genialna”).
// Na telefonie konstrukcja stoi NAD bursztynowym hasłem: od paska menu (+ 6 px) do górnej krawędzi hasła (− 6 px),
// dopasowana do rzeczywistego zasięgu łuków i dosunięta do prawej. Budowa raz przy wejściu (kolejne kroki konstrukcji,
// pióro 60 px/s), potem co ok. 9 s (losowo 0,4–1,6×) jeden łuk, prosta albo odcinek gaśnie i rysuje się od nowa (30 px/s).
// Warstwa A — gotowe elementy i punkty (przerysowywana tylko, gdy element się kończy albo zaczyna gasnąć), warstwa B —
// element, który się właśnie rysuje lub gaśnie, i ślad cyrkla; klatka po zmianie ≥ 0,5 px, najwyżej 15 kl./s.
// W spoczynku zegar śpi do następnego przerysowania.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { S } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60, podHaslem: 40 };

const POM = 0.14, WYNIK = 0.28, PUNKTY = 0.34, TEMPO_B = 60, TEMPO_P = 30, PRZERWA = 9, WIELKOSC = 0.92, PION = 0.45;
const START = 0.6, P_EL = 0.15, P_KROK = 0.45, PRZED = 0.3, PO = 0.5, GAS = 1.6, ODDECH = 0.7, LINIA = 2, MIEKKO = 20;

type Pt = [number, number];
type Def = { t: 'luk' | 'prosta' | 'odc'; rola: 'pom' | 'wynik'; pkt0: string[]; pkt: string[]; c?: Pt; r?: number; a0?: number; a1?: number; p?: Pt; d?: Pt; a?: Pt; b?: Pt; e?: number };
type El = { t: Def['t']; wynik: boolean; pkt0: string[]; pkt: string[]; len: number; cx: number; cy: number; r: number; a0: number; a1: number; x0: number; y0: number; x1: number; y1: number; miekko: number };
type Akcja = { typ: 'rysuj' | 'gas'; s: number; d: number };

// konstrukcja w jednostkach odcinka AB = 1 (oś y w dół, kąty w stopniach zgodnie z ruchem wskazówek)
const kat = (p: Pt, q: Pt) => Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
const z = (e: Partial<Def> & { t: Def['t'] }, o: Partial<Def> = {}): Def => ({ rola: 'pom', pkt0: [], pkt: [], ...e, ...o });
const L = (c: Pt, r: number, a0: number, a1: number, o?: Partial<Def>) => z({ t: 'luk', c, r, a0, a1 }, o);
const P = (p: Pt, d: Pt, o?: Partial<Def>) => z({ t: 'prosta', p, d }, o);
const O = (a: Pt, b: Pt, o?: Partial<Def>) => z({ t: 'odc', a, b, e: 0 }, o);
const znak = (c: Pt, r: number, p: Pt, s: number) => { const a = kat(c, p); return L(c, r, a - s, a + s); };   // krótka kreska cyrklem przez p

function zloty() {
  const A: Pt = [0, 0], B: Pt = [1, 0], M: Pt = [0.5, 0], M2: Pt = [1.5, 0], C: Pt = [1, -0.5], F: Pt = [1, -Math.sqrt(0.5625 - 0.25)];
  const ac = Math.sqrt(1.25), D: Pt = [1 - 0.5 / ac, -0.5 + 0.25 / ac], g = (Math.sqrt(5) - 1) / 2, Sz: Pt = [g, 0];
  const wynik = (e: Def) => ({ ...e, rola: 'wynik' as const });
  return {
    bbox: [-0.03, -0.68, 1.53, 0.68],
    pkt: { A, B, M, M2, C, D, S: Sz } as Record<string, Pt>,
    kroki: [
      [P(A, [1, 0], { pkt0: ['A', 'B'] })],                                                  // dany odcinek AB na prostej
      [L(A, 0.75, -62, 62), L(B, 0.75, 242, 118), P(M, [0, 1], { pkt: ['M'] })],              // symetralna AB, środek M
      [L(B, 0.5, 180, 360, { pkt: ['M2'] }), znak(M, 0.75, F, 11), znak(M2, 0.75, F, 11), P(B, [0, 1], { pkt: ['C'] })], // prostopadła w B, BC = AB/2
      [O(A, C)],                                                                             // odcinek AC
      [L(C, 0.5, 90, kat(C, D), { pkt: ['D'] })],                                            // łuk o środku C przez B tnie AC w D
      [L(A, ac - 0.5, kat(A, D), 0, { pkt: ['S'] })],                                        // łuk o środku A przez D tnie AB w S
      [O(A, Sz), O(Sz, B), O([0, -0.07], [0, 0.07]), O([g, -0.07], [g, 0.07]), O([1, -0.07], [1, 0.07])].map(wynik), // AB : AS = AS : SB
    ],
  };
}

// prosta p + t·d przycięta do prostokąta (Liang–Barsky)
function przytnij(px: number, py: number, dx: number, dy: number, x0: number, x1: number, y0: number, y1: number) {
  let tl = -1e9, th = 1e9;
  const os = (p: number, d: number, a: number, b: number) => {
    if (Math.abs(d) < 1e-9) { if (p < a || p > b) { tl = 1; th = 0; } return; }
    let u = (a - p) / d, v = (b - p) / d;
    if (u > v) [u, v] = [v, u];
    tl = Math.max(tl, u); th = Math.min(th, v);
  };
  os(px, dx, x0, x1); os(py, dy, y0, y1);
  return th > tl ? [px + tl * dx, py + tl * dy, px + th * dx, py + th * dy] : null;
}

const motyw: Fabryka = (G, t0) => {
  const K = zloty(), prawo = G.W - 16;
  // pole konstrukcji: nad hasłem (od paska menu do górnej krawędzi hasła), bez hasła — całe pole rysunku
  let fTop = G.y0, fDol = G.y1, bx = K.bbox.slice();
  if (G.haslo) {
    fTop = G.menu + 6; fDol = Math.round(G.haslo.t - 6);
    // rzeczywisty zasięg łuków i odcinków (bbox konstrukcji nie obejmuje całych łuków), żeby nic nie zeszło na hasło
    const ex = [Infinity, Infinity, -Infinity, -Infinity];
    const dodaj = (x: number, y: number) => { ex[0] = Math.min(ex[0], x); ex[1] = Math.min(ex[1], y); ex[2] = Math.max(ex[2], x); ex[3] = Math.max(ex[3], y); };
    K.kroki.flat().forEach((e) => {
      if (e.t === 'luk') for (let i = 0; i <= 48; i++) { const a = (e.a0! + (e.a1! - e.a0!) * i / 48) * Math.PI / 180; dodaj(e.c![0] + e.r! * Math.cos(a), e.c![1] + e.r! * Math.sin(a)); }
      else if (e.t === 'odc') { dodaj(e.a![0], e.a![1]); dodaj(e.b![0], e.b![1]); }
    });
    bx = [Math.min(bx[0], ex[0]), Math.min(bx[1], ex[1]), Math.max(bx[2], ex[2]), Math.max(bx[3], ex[3])];
  }
  const top = Math.min(G.y0, fTop), dol = G.y1, hd = fDol - fTop;
  const sk = hd / (bx[3] - bx[1]) * WIELKOSC, ox = prawo - sk * bx[2], oy = fTop + (hd - sk * (bx[3] - bx[1])) * PION - sk * bx[1];
  const X = (p: Pt): Pt => [ox + sk * p[0], oy + sk * p[1]];
  // proste kończą się tam, gdzie i tak zaczyna się zanikanie przy tekście, i przy prawym brzegu treści
  let widacOd = Infinity;
  for (let y = top; y <= dol; y += 2) widacOd = Math.min(widacOd, G.granica(y));
  widacOd = Math.max(G.x0, widacOd);

  const el: El[] = [], kroki: number[][] = [];
  K.kroki.forEach((kr) => {
    const idx: number[] = [];
    kr.forEach((e) => {
      const o: El = { t: e.t, wynik: e.rola === 'wynik', pkt0: e.pkt0, pkt: e.pkt, len: 0, cx: 0, cy: 0, r: 0, a0: 0, a1: 0, x0: 0, y0: 0, x1: 0, y1: 0, miekko: 0 };
      if (e.t === 'luk') {
        const c = X(e.c!);
        Object.assign(o, { cx: c[0], cy: c[1], r: sk * e.r!, a0: e.a0! * Math.PI / 180, a1: e.a1! * Math.PI / 180 });
        o.len = Math.abs(o.a1 - o.a0) * o.r;
      } else if (e.t === 'odc') {
        const a = X(e.a!), b = X(e.b!), dl = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / dl, uy = (b[1] - a[1]) / dl, ee = sk * e.e!;
        Object.assign(o, { x0: a[0] - ux * ee, y0: a[1] - uy * ee, x1: b[0] + ux * ee, y1: b[1] + uy * ee, len: dl + 2 * ee });
      } else {
        const p = X(e.p!), q = przytnij(p[0], p[1], e.d![0], e.d![1], widacOd - 2, prawo, top - 2, dol + 2);
        if (!q) return;
        Object.assign(o, { x0: q[0], y0: q[1], x1: q[2], y1: q[3], len: Math.hypot(q[2] - q[0], q[3] - q[1]) });
        o.miekko = Math.min(0.45, MIEKKO / Math.max(1, o.len));
      }
      idx.push(el.length); el.push(o);
    });
    kroki.push(idx);
  });
  const pkt: Record<string, Pt> = {};
  for (const n in K.pkt) pkt[n] = X(K.pkt[n]);

  // ---------- czas: akcje na elementach (rysuj / gaś); stan elementu wynika z ostatniej rozpoczętej akcji ----------
  const czasRys = (e: El, v: number) => Math.max(0.5, e.len / (e.t === 'luk' ? v : v * LINIA));
  const akcje: Akcja[][] = el.map(() => []), odkryte: Record<string, number> = {};
  let s = t0 + START;
  if (t0 > 0) s = -1e9;                                    // nowy układ w trakcie oglądania: konstrukcja od razu gotowa
  kroki.forEach((kr) => kr.forEach((i, j) => {
    const e = el[i], d = t0 > 0 ? 0.01 : czasRys(e, TEMPO_B);
    if (e.t === 'luk') s += PRZED;
    akcje[i].push({ typ: 'rysuj', s, d });
    e.pkt0.forEach((n) => { if (!(n in odkryte)) odkryte[n] = s; });
    e.pkt.forEach((n) => { if (!(n in odkryte)) odkryte[n] = s + d; });
    s += d + (j < kr.length - 1 ? P_EL : P_KROK);
  }));
  const koniecBudowy = Math.max(s, t0);
  let ostKoniec = koniecBudowy, ostLos = -1, stoi = false;

  const zaplanuj = (start: number) => {
    let i: number;
    do i = Math.floor(Math.random() * el.length); while (el.length > 1 && i === ostLos);
    ostLos = i;
    const e = el[i], d = czasRys(e, TEMPO_P), s2 = start + GAS + ODDECH + (e.t === 'luk' ? PRZED : 0);
    akcje[i].push({ typ: 'gas', s: start, d: GAS }, { typ: 'rysuj', s: s2, d });
    if (akcje[i].length > 4) akcje[i].splice(0, akcje[i].length - 4);
    ostKoniec = s2 + d + PO;
  };
  // 'caly' | 'brak' | część narysowana (f) | gaśnięcie (m — krycie)
  const stanEl = (i: number, t: number): { f: number; m: number } => {
    if (stoi) return { f: 1, m: 1 };
    const A = akcje[i];
    for (let q = A.length - 1; q >= 0; q--) {
      const a = A[q];
      if (t < a.s) continue;
      const tau = (t - a.s) / a.d;
      if (a.typ === 'rysuj') return tau >= 1 ? { f: 1, m: 1 } : { f: S(tau), m: 1 };
      return tau >= 1 ? { f: 0, m: 0 } : { f: 1, m: 1 - S(tau) };
    }
    return { f: 0, m: 0 };
  };
  // ślady cyrkla (punkt wbicia) przy łukach, które się rysują — z łagodnym wejściem i wyjściem
  const slady = (t: number) => {
    const out: Record<string, { e: El; al: number }> = {};
    if (stoi) return [];
    el.forEach((e, i) => {
      if (e.t !== 'luk') return;
      for (let q = akcje[i].length - 1; q >= 0; q--) {
        const a = akcje[i][q];
        if (a.typ !== 'rysuj') continue;
        if (t < a.s - PRZED || t > a.s + a.d + PO) break;
        const al = t < a.s ? S((t - (a.s - PRZED)) / PRZED) : t > a.s + a.d ? 1 - S((t - a.s - a.d) / PO) : 1;
        const k = Math.round(e.cx) + ',' + Math.round(e.cy);
        if (!out[k] || out[k].al < al) out[k] = { e, al };
        break;
      }
    });
    return Object.values(out);
  };

  // ---------- rysowanie ----------
  const koniecPiora = (e: El, f: number): Pt => {
    if (e.t === 'luk') { const a = e.a0 + (e.a1 - e.a0) * f; return [e.cx + e.r * Math.cos(a), e.cy + e.r * Math.sin(a)]; }
    return [e.x0 + (e.x1 - e.x0) * f, e.y0 + (e.y1 - e.y0) * f];
  };
  const rysujEl = (c: CanvasRenderingContext2D, e: El, f: number, m: number) => {
    const a = (e.wynik ? WYNIK : POM) * m;
    if (a < 0.003 || f <= 0) return;
    c.lineWidth = e.wynik ? 1.6 : 1;
    c.beginPath();
    if (e.t === 'luk') c.arc(e.cx, e.cy, e.r, e.a0, e.a0 + (e.a1 - e.a0) * f, e.a1 < e.a0);
    else { const q = koniecPiora(e, f); c.moveTo(e.x0, e.y0); c.lineTo(q[0], q[1]); }
    if (e.t === 'prosta') {
      // prosta bez ostrych końców: krycie narasta na pierwszych i gaśnie na ostatnich ok. 20 px
      const g = c.createLinearGradient(e.x0, e.y0, e.x1, e.y1);
      for (let i = 0; i <= 4; i++) { const s2 = i / 4, v = G.rgba(a * S(s2)); g.addColorStop(e.miekko * s2, v); g.addColorStop(1 - e.miekko * s2, v); }
      c.strokeStyle = g;
    } else c.strokeStyle = G.rgba(a);
    c.stroke();
  };
  const pudloEl = (e: El, f: number): Pudlo => {
    const p = 5;
    if (e.t === 'luk') return [e.cx - e.r - p, e.cy - e.r - p, e.cx + e.r + p, e.cy + e.r + p];
    const q = koniecPiora(e, f);
    return [Math.min(e.x0, q[0]) - p, Math.min(e.y0, q[1]) - p, Math.max(e.x0, q[0]) + p, Math.max(e.y0, q[1]) + p];
  };

  let stale: number[] = [], ruch: [number, { f: number; m: number }][] = [], ile: string[] = [], sl: { e: El; al: number }[] = [];
  let sygA = '', sygB = '';
  const policz = (t: number) => {
    if (!stoi && t >= koniecBudowy && t >= ostKoniec) zaplanuj(t + PRZERWA * (0.4 + 1.2 * Math.random()));
    stale = []; ruch = [];
    el.forEach((_, i) => { const st = stanEl(i, t); if (st.f >= 1 && st.m >= 1) stale.push(i); else if (st.m > 0 && st.f > 0) ruch.push([i, st]); });
    ile = Object.keys(odkryte).filter((n) => stoi || t >= odkryte[n]);
    sl = slady(t);
  };

  return {
    krok(t) {
      policz(t);
      const a1 = stale.join(',') + '|' + ile.length;
      // pióro: klatka co 0,5 px drogi; gaśnięcie: 20 stopni krycia (przy kryciu linii 0,14 to < 1/255 na stopień)
      const b1 = ruch.map(([i, st]) => i + (st.m >= 1 ? 'c' + Math.round(st.f * el[i].len / 0.5) : 'g' + Math.round(st.m * 20))).join(',') + '|' +
        sl.map((x) => Math.round(x.al * 30) + ':' + Math.round(x.e.cx) + ':' + Math.round(x.e.cy)).join(',');
      const r = { a: a1 !== sygA, b: b1 !== sygB, za: 0 };
      sygA = a1; sygB = b1;
      if (ruch.length || sl.length) r.za = 1 / 15;
      else {
        // nic się nie rusza: śpij do początku następnej akcji (przed łukiem — z wyprzedzeniem na ślad cyrkla)
        let nast = Infinity;
        akcje.forEach((A, i) => A.forEach((a) => { const s0 = a.s - (el[i].t === 'luk' && a.typ === 'rysuj' ? PRZED : 0); if (s0 > t) nast = Math.min(nast, s0); }));
        for (const n in odkryte) if (odkryte[n] > t) nast = Math.min(nast, odkryte[n]);
        if (t < ostKoniec) nast = Math.min(nast, ostKoniec);
        r.za = Math.max(0.02, nast - t + 0.005);
      }
      return r;
    },
    rysuj(c) {
      stale.forEach((i) => rysujEl(c, el[i], 1, 1));
      c.fillStyle = G.rgba(PUNKTY);
      for (const n of ile) { const p = pkt[n]; c.beginPath(); c.arc(p[0], p[1], 2, 0, 2 * Math.PI); c.fill(); }
    },
    rysujB(c): Pudlo {
      let box: Pudlo | null = null;
      const dolacz = (b: Pudlo) => { box = box ? [Math.min(box[0], b[0]), Math.min(box[1], b[1]), Math.max(box[2], b[2]), Math.max(box[3], b[3])] : b; };
      ruch.forEach(([i, st]) => { rysujEl(c, el[i], st.f, st.m); dolacz(pudloEl(el[i], st.f)); });
      sl.forEach(({ e, al }) => {
        const a = Math.min(0.9, POM * 2.6) * al;
        if (a < 0.004) return;
        c.lineWidth = 1; c.strokeStyle = c.fillStyle = G.rgba(a);
        c.beginPath(); c.arc(e.cx, e.cy, 3, 0, 2 * Math.PI); c.stroke();
        c.beginPath(); c.arc(e.cx, e.cy, 0.9, 0, 2 * Math.PI); c.fill();
        dolacz([e.cx - 5, e.cy - 5, e.cx + 5, e.cy + 5]);
      });
      return box ?? [0, 0, 0, 0];
    },
    gotowy() { stoi = true; policz(0); },
  };
};

export default motyw;
