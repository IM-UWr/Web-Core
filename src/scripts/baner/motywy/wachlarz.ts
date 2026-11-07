// Projekty i granty: wachlarz Lelka (prototyp animacje-badania.html, motyw „wachlarz”; zaakceptowany 31.10.2026).
// Z jednego punktu w prawym dolnym rogu pola wychodzą promienie w kierunkach ze zbioru Cantora (16 kierunków po 4 krokach
// podziału, kąty 94°–178°; stąd przerwy między wiązkami), każdy innej długości. Budowa raz przy wejściu (8 s), potem co
// losową przerwę (2–7 s) jeden promień rośnie albo się cofa (2,5 px/s, gdy koniec widać; pod tekstem 60 px/s), czasem
// jeden znika, a w wolnym kierunku wyrasta nowy. Warstwa A — promienie stojące i nit, warstwa B — promień w ruchu
// (klatka co 0,5 px, czyli 5 kl./s); między zmianami zegar śpi.
// Wariant „grant” (strona projektu, /nauka/granty/<slug>/): 8 kierunków (3 kroki podziału) i jaśniejszy promień ok. 112°.
// Jego długość to część okresu realizacji, która minęła w dniu budowy strony (dane z widoku Grant.astro: lata od–do
// i dzień budowy), a kropki — reszta do końca projektu; ten promień stoi. Bez lat projektu — wachlarz bez wyróżnienia.
// Pole (zlecenie 07): wierzchołek 10 px nad dołem pola (maska silnika wygasza ostatnie 12 px), końce promieni najwyżej
// 4 px pod górą pola — długości promieni liczą się z pola, więc wachlarz mieści się sam.
import type { Fabryka, Pudlo, Ustawienia } from '../typy';
import { generator, ogr } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 6, przejscie: 60 };

const POZIOM = 4, POZIOM_GRANT = 3, CANTOR = 0.36, F0 = 94, F1 = 178, KAT_GRANTU = 112, ZYJE = 0.78;
const A = 0.22, NIT = 0.24, R0 = 7, V = 2.5, VSZ = 60, BUDOWA = 8, FPS_BUDOWY = 15, DOL = 10, GORA = 4;
// ziarno raz na wczytanie strony: nowy układ (obrót telefonu, zmiana rozmiaru) daje ten sam wachlarz
const ZIARNO = (Math.random() * 2 ** 32) >>> 0;

type Promien = { f: number; dx: number; dy: number; Lm: number; L: number; Lr: number; cel: number; zyje: boolean; wyr: boolean; opozn: number };

/** środki przedziałów po `poziom` krokach podziału Cantora (z każdego przedziału zostają dwa skrajne, po r długości) */
function cantor(poziom: number, r: number): number[] {
  let iv: [number, number][] = [[0, 1]];
  for (let k = 0; k < poziom; k++) iv = iv.flatMap(([a, b]): [number, number][] => [[a, a + r * (b - a)], [b - r * (b - a), b]]);
  return iv.map(([a, b]) => (a + b) / 2);
}

/** część okresu realizacji, która minęła w dniu budowy strony (od 1 stycznia roku początku do końca roku zakończenia) */
function postep(d: unknown): number | null {
  const o = (d ?? {}) as { od?: number; do?: number; dzien?: string };
  if (!o.od || !o.do || !o.dzien) return null;
  const a = Date.UTC(o.od, 0, 1), b = Date.UTC(o.do + 1, 0, 1), t = Date.parse(`${o.dzien}T12:00:00Z`);
  return b > a && Number.isFinite(t) ? ogr((t - a) / (b - a), 0, 1) : null;
}

const motyw: Fabryka = (G, t0) => {
  const grant = G.wariant === 'grant', rnd = generator(ZIARNO + (grant ? 1 : 0));
  const ax = G.x1 - 3, ay = G.y1 - DOL, top = G.y0 + GORA;
  const P: Promien[] = cantor(grant ? POZIOM_GRANT : POZIOM, CANTOR).map((u) => {
    const f = (F0 + (F1 - F0) * u) * Math.PI / 180, dx = Math.cos(f), dy = -Math.sin(f);
    const Lm = Math.max(R0 + 6, Math.min(dx < -1e-6 ? (ax - G.x0) / -dx : 1e9, (ay - top) / Math.sin(f)) - 2);
    return { f, dx, dy, Lm, L: 0, Lr: 0, cel: 0, zyje: false, wyr: false, opozn: 0 };
  });
  const nowyCel = (p: Promien) => p.Lm * (0.32 + 0.64 * rnd());
  P.forEach((p) => { if (rnd() < ZYJE) { p.zyje = true; p.cel = nowyCel(p); p.opozn = 2 * rnd(); } });
  // strona projektu: promień najbliżej 112° pokazuje, jaka część okresu realizacji minęła
  const pst = grant ? postep(G.dane) : null;
  if (pst !== null) {
    const k = KAT_GRANTU * Math.PI / 180, w = P.reduce((a, p) => (Math.abs(p.f - k) < Math.abs(a.f - k) ? p : a));
    Object.assign(w, { wyr: true, zyje: true, cel: Math.max(R0 + 4, w.Lm * pst), opozn: 0 });
  }

  // budowa raz przy wejściu; po zmianie układu (t0 > 0) wachlarz od razu gotowy
  let budowa = t0 <= 0, tPrev = t0, zd: Promien | null = null, ostL = 0;
  let tNast = t0 + (budowa ? BUDOWA : 0) + 2 + 3 * Math.random();
  if (!budowa) P.forEach((p) => { if (p.zyje) p.L = p.Lr = p.cel; });

  const koniec = (p: Promien, L = p.L): [number, number] => [ax + p.dx * L, ay + p.dy * L];
  const widacKoniec = (p: Promien) => { const [x, y] = koniec(p); return G.widac(x, y) > 0.02; };
  const linia = (c: CanvasRenderingContext2D, p: Promien, od: number, doL: number) => {
    if (doL <= od + 0.3) return;
    c.moveTo(ax + p.dx * od, ay + p.dy * od); c.lineTo(ax + p.dx * doL, ay + p.dy * doL);
  };
  const rysujPromienie = (c: CanvasRenderingContext2D, lista: Promien[]) => {
    c.lineWidth = 1;
    c.strokeStyle = G.rgba(A);
    c.beginPath();
    for (const p of lista) if (!p.wyr) linia(c, p, R0, p.L);
    c.stroke();
    for (const p of lista) {
      if (!p.wyr) continue;
      // jaśniejszy promień — część okresu za nami; kropki — reszta do końca projektu
      c.strokeStyle = G.rgba(A * 2.2);
      c.beginPath(); linia(c, p, R0, p.L); c.stroke();
      c.setLineDash([1.5, 3.5]); c.strokeStyle = G.rgba(A * 1.3);
      c.beginPath(); linia(c, p, p.L + 3, p.Lm * 0.97); c.stroke();
      c.setLineDash([]);
    }
  };

  // zdarzenie: jeden promień się cofa i znika, wyrasta w wolnym kierunku albo zmienia długość o 15–60 px
  const zdarzenie = (): Promien | null => {
    const zywe = P.filter((p) => p.zyje && !p.wyr), martwe = P.filter((p) => !p.zyje), r = Math.random();
    const los = (a: Promien[]) => a[Math.floor(Math.random() * a.length)];
    if (r < 0.16 && zywe.length > 5) { const p = los(zywe); p.cel = 0; return p; }
    if (r < 0.36 && martwe.length) { const p = los(martwe); p.zyje = true; p.L = 0; p.cel = p.Lm * (0.32 + 0.64 * Math.random()); return p; }
    if (!zywe.length) return null;
    const p = los(zywe), d = (15 + 45 * Math.random()) * (Math.random() < 0.5 ? -1 : 1);
    let c = p.L + d;
    if (c < p.Lm * 0.3 || c > p.Lm * 0.97) c = p.L - d;
    p.cel = ogr(c, p.Lm * 0.3, p.Lm * 0.97);
    return p;
  };

  return {
    krok(t) {
      const dt = Math.max(0, t - tPrev);
      tPrev = t;
      if (budowa) {
        // promienie rosną z opóźnieniem 0–2 s, z wyhamowaniem; klatka, gdy któryś urósł o ≥ 0,5 px
        const tb = t - t0;
        if (tb >= BUDOWA) budowa = false;
        let zm = 0;
        for (const p of P) {
          if (!p.zyje) continue;
          const u = budowa ? ogr((tb - p.opozn) / (BUDOWA - 2), 0, 1) : 1;
          p.L = p.cel * (1 - (1 - u) ** 3);
          zm = Math.max(zm, Math.abs(p.L - p.Lr));
        }
        const a = zm >= 0.5 || !budowa;
        if (a) P.forEach((p) => { p.Lr = p.L; });
        return { a, za: budowa ? 1 / FPS_BUDOWY : Math.max(0.05, tNast - t) };
      }
      if (!zd) {
        if (t < tNast) return { a: false, za: tNast - t };
        zd = zdarzenie();
        if (!zd) { tNast = t + 2; return { a: false, za: 2 }; }
        ostL = zd.L;
        // promień przechodzi z warstwy A na B
        return { a: true, b: true, za: 0.1 };
      }
      const p = zd, w0 = widacKoniec(p), v = w0 ? V : VSZ;
      p.L += Math.sign(p.cel - p.L) * Math.min(Math.abs(p.cel - p.L), v * dt);
      if (Math.abs(p.cel - p.L) < 1e-6) {
        p.L = p.cel;
        if (p.cel === 0) p.zyje = false;
        zd = null;
        tNast = t + 2 + 5 * Math.random();
        return { a: true, b: true, za: tNast - t };
      }
      const w1 = widacKoniec(p), b = (w0 || w1) && Math.abs(p.L - ostL) >= 0.5;
      if (b) ostL = p.L;
      return { a: false, b, za: w1 ? 0.5 / V : 0.1 };
    },
    rysuj(c) {
      rysujPromienie(c, P.filter((p) => p.zyje && p !== zd));
      c.lineWidth = 1; c.strokeStyle = G.rgba(NIT);
      c.beginPath(); c.arc(ax, ay, 3, 0, 2 * Math.PI); c.stroke();
    },
    rysujB(c): Pudlo {
      if (!zd || zd.L <= R0 + 0.3) return [0, 0, 0, 0];
      rysujPromienie(c, [zd]);
      const [x, y] = koniec(zd);
      return [Math.min(x, ax) - 3, Math.min(y, ay) - 3, Math.max(x, ax) + 3, Math.max(y, ay) + 3];
    },
    gotowy() {
      budowa = false; zd = null;
      P.forEach((p) => { if (p.zyje) p.L = p.cel; });
    },
  };
};

export default motyw;
