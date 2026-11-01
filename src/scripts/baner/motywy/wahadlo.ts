// Seminarium „Równania różniczkowe”: portret fazowy wahadła x″ = −sin x (prototyp animacje-analiza.html, motyw „wahadlo”;
// zaakceptowany 31.10.2026). Wariant „zaklad” (Zakład Równań Różniczkowych): wahadło tłumione x″ = −sin x − 0,22·x′.
// Pole kierunków (krótkie kreski), dwie separatrysy (w wariancie: rozmaitości stabilne siodeł — granice basenów) i kilka
// trajektorii: zamknięte „oczka” wahań i faliste obroty (w wariancie spirale zbiegające do położeń równowagi).
// Ruch: przy wejściu pole kierunków się pojawia, a trzy trajektorie szybko się rysują (raz). Potem co 6–14 s (losowo)
// z losowego punktu w odsłoniętej części wyrasta nowa trajektoria: linia wydłuża się wzdłuż pola o ok. 3 px/s, bez punktu
// na końcu. Gdy jest ich więcej niż cztery, najstarsza gaśnie przez 6 s.
// Pole (zlecenie 07): portret od góry pola do 6 px nad jego dołem (połowa hasła) — kreski pola kierunków najwyżej 4 px pod
// górą pola; trajektorie kończą się tuż przed brzegiem pola (3 px nad dołem, gdzie maska już prawie gasi). Przy 390×844
// środek jest ok. 16 px wyżej niż w prototypie, wykres spłaszczony w pionie do 86–88% (poziomo bez zmian).
// Klatka tylko wtedy, gdy koniec rosnącej linii przesunął się w odsłoniętej części o ≥ 0,75 px (najwyżej 4 kl./s) albo
// krycie pojawiającej się lub gasnącej linii zmieniło się o widoczny stopień.
import type { Fabryka, Ustawienia } from '../typy';
import { S, generator, ogr } from '../wspolne';
import { Anim, ZIARNO, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

// p na pół wysokości pola, siatka pola kierunków (px), najwięcej trajektorii, wzrost linii (px/s), krok klatki (px)
const PM = 2.55, GX = 17, GY = 15.5, MAXTR = 4, TEMPO = 3, KROK = 0.75;
const POLE = 0.12, SEP = 0.17, TRAJ = 0.17;
const START = [1.0, 1.7, 2.4];                                      // chwile startu trzech pierwszych trajektorii (s)

type Traj = { x: Float32Array; y: Float32Array; L: Float32Array; dl: number; s0: number; v: number; a: Anim; kw: number; umrze: number; rl: number };

const motyw: Fabryka = (G, t0) => {
  const gam = G.wariant === 'zaklad' ? 0.22 : 0, w = G.x1 - G.x0, los = generator(ZIARNO);
  const b0 = G.y0, b1 = G.y1 - 6, yc = (b0 + b1) / 2;
  const sy = (b1 - b0) / 2 / PM, sx = ogr(w / 16, 17, 26), xc = G.x0 + 0.68 * w;
  const X = (q: number) => xc + q * sx, Y = (p: number) => yc - p * sy;
  const Q = (x: number) => (x - xc) / sx, P = (y: number) => (yc - y) / sy;
  const k1 = [0, 0], k2 = [0, 0], k3 = [0, 0], k4 = [0, 0];
  const f = (q: number, p: number, o: number[]) => { o[0] = p; o[1] = -Math.sin(q) - gam * p; };
  const rk = (s: number[], dt: number) => {
    const q = s[0], p = s[1];
    f(q, p, k1); f(q + dt / 2 * k1[0], p + dt / 2 * k1[1], k2); f(q + dt / 2 * k2[0], p + dt / 2 * k2[1], k3); f(q + dt * k3[0], p + dt * k3[1], k4);
    s[0] = q + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); s[1] = p + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  };
  // trajektoria kończy się tuż za brzegiem pola (u dołu 3 px nad jego dołem — tam maska i tak już prawie gasi)
  const wPolu = (x: number, y: number) => x > G.x0 - 14 && x < G.x1 + 14 && y > G.y0 + 1 && y < G.y1 - 3;
  // punkty co ≥ 0,7 px z długością łuku; koniec: wyjście z pola, powrót do startu (oczko), równowaga (tłumione), maxL
  const trajektoria = (q: number, p: number, dt: number, maxL: number) => {
    const s = [q, p], xs = [X(q)], ys = [Y(p)], L = [0], xa = xs[0], ya = ys[0];
    let dal = false;
    for (let it = 0; it < 30000; it++) {
      rk(s, dt);
      const x = X(s[0]), y = Y(s[1]), d = Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]);
      if (d >= 0.7) { xs.push(x); ys.push(y); L.push(L[L.length - 1] + d); }
      if (!wPolu(x, y)) break;
      if (!gam && dt > 0) {
        const dd = Math.hypot(x - xa, y - ya);
        if (dd > 25) dal = true;
        else if (dal && dd < 2) { xs.push(xa); ys.push(ya); L.push(L[L.length - 1] + dd); break; }
      }
      if (gam && dt > 0) { const qn = s[0] - 2 * Math.PI * Math.round(s[0] / (2 * Math.PI)); if (Math.hypot(qn, s[1]) < 0.035) break; }
      if (L[L.length - 1] > maxL) break;
    }
    return { x: Float32Array.from(xs), y: Float32Array.from(ys), L: Float32Array.from(L), dl: L[L.length - 1] };
  };

  // pole kierunków i separatrysy — raz (Path2D)
  const pole = new Path2D(), sep = new Path2D();
  for (let y = b0 + GY / 2; y < b1; y += GY) for (let x = G.x0 + GX / 2; x < G.x1; x += GX) {
    const q = Q(x), p = P(y);
    let dx = p * sx, dy = (Math.sin(q) + gam * p) * sy;
    const nr = Math.hypot(dx, dy);
    if (nr < 1e-6) continue;
    dx *= 3.5 / nr; dy *= 3.5 / nr;
    pole.moveTo(x - dx, y - dy); pole.lineTo(x + dx, y + dy);
  }
  if (!gam) {
    for (let zn = -1; zn <= 1; zn += 2) {
      sep.moveTo(G.x0 - 10, Y(zn * 2 * Math.abs(Math.cos(Q(G.x0 - 10) / 2))));
      for (let x = G.x0 - 8.5; x <= G.x1 + 10; x += 1.5) sep.lineTo(x, Y(zn * 2 * Math.abs(Math.cos(Q(x) / 2))));
    }
  } else {
    // rozmaitości stabilne siodeł (2k + 1)π: całkowanie wstecz od siodła wzdłuż wektora własnego (1, λs)
    const ls = (-gam - Math.sqrt(gam * gam + 4)) / 2;
    for (let kk = Math.floor((Q(G.x0) - Math.PI) / (2 * Math.PI)); kk <= Math.ceil((Q(G.x1) + Math.PI) / (2 * Math.PI)); kk++) {
      const qs = (2 * kk + 1) * Math.PI;
      for (let zz = -1; zz <= 1; zz += 2) {
        const T = trajektoria(qs + zz * 0.004, zz * 0.004 * ls, -0.02, 900);
        sep.moveTo(T.x[0], T.y[0]);
        for (let i = 1; i < T.x.length; i++) sep.lineTo(T.x[i], T.y[i]);
      }
    }
  }

  // nowa trajektoria z losowego, widocznego punktu (z dala od separatrys i od samego środka), rosnąca z prędkością v px/s
  const nowa = (t: number, v: number, rnd: () => number): Traj | null => {
    for (let proba = 0; proba < 80; proba++) {
      const x = G.x0 + 10 + rnd() * (w - 20), y = b0 + 8 + rnd() * (b1 - b0 - 16);
      if (G.widac(x, y) < 0.75) continue;
      const q = Q(x), p = P(y);
      if (!gam) { const E = p * p / 2 - Math.cos(q); if (Math.abs(E - 1) < 0.12 || E < -0.8) continue; }
      else { const qn = q - 2 * Math.PI * Math.round(q / (2 * Math.PI)); if (Math.hypot(qn, p) < 0.9) continue; }
      const T = trajektoria(q, p, 0.02, gam ? 480 : 640);
      if (T.dl < 70) continue;
      let wid = 0;
      for (let i = 1; i < T.x.length; i++) if (G.widac(T.x[i], T.y[i]) > 0.5) wid += T.L[i] - T.L[i - 1];
      if (wid < 55) continue;
      const a = new Anim(0);
      a.ustaw(t, 1, 1);
      return { ...T, s0: t, v, a, kw: t + T.dl / v, umrze: 0, rl: 0 };
    }
    return null;
  };
  const dlug = (T: Traj, t: number) => Math.max(0, Math.min(T.dl, (t - T.s0) * T.v));
  // punkt na trajektorii w odległości len od początku (koniec rosnącej linii)
  const punkt = (T: Traj, len: number): [number, number] => {
    let i = 1;
    while (i < T.x.length - 1 && T.L[i] < len) i++;
    const r = ogr((len - T.L[i - 1]) / Math.max(1e-6, T.L[i] - T.L[i - 1]), 0, 1);
    return [T.x[i - 1] + (T.x[i] - T.x[i - 1]) * r, T.y[i - 1] + (T.y[i] - T.y[i - 1]) * r];
  };

  const tr: Traj[] = [], start = START.map((s) => t0 + s);
  let gotowe = false, tNast = 0, brudny = true;
  // od razu narysowane trajektorie startowe (ograniczenie ruchu, zmiana układu)
  const zbuduj = () => {
    for (const s of start) { const T = nowa(s - 1e3, 1e6, los); if (T) { T.a = new Anim(1); tr.push(T); } }
    start.length = 0; gotowe = true;
  };
  if (!budowa(t0)) { zbuduj(); tNast = t0 + 4 + Math.random() * 5; }

  return {
    krok(t) {
      if (!gotowe) {
        while (start.length && t >= start[0]) { const T = nowa(start.shift()!, 90, los); if (T) tr.push(T); }
        if (!start.length && tr.every((T) => t >= T.kw) && t > t0 + 2.6) { gotowe = true; tNast = t + 4 + Math.random() * 5; brudny = true; }
      } else if (t >= tNast && tr.every((T) => t >= T.kw)) {
        const T = nowa(t, TEMPO, Math.random);
        if (T) {
          tr.push(T);
          const zyw = tr.filter((x) => !x.umrze);
          if (zyw.length > MAXTR) { zyw[0].a.ustaw(t, 0, 6); zyw[0].umrze = t + 6; }
          tNast = T.kw + 6 + Math.random() * 8;
        } else tNast = t + 3;
      }
      for (let k = tr.length - 1; k >= 0; k--) if (tr[k].umrze && t >= tr[k].umrze) { tr.splice(k, 1); brudny = true; }
      // co się zmieniło od ostatniej klatki: długość (gdy koniec linii jest w odsłoniętej części) albo krycie
      let za = Math.max(0.05, tNast - t), zmiana = brudny || !gotowe;
      for (const T of tr) {
        const len = dlug(T, t);
        if (t < T.kw) {
          za = Math.min(za, KROK / T.v);
          if (len - T.rl >= KROK * 0.9 && G.widac(...punkt(T, len)) > 0.02) zmiana = true;
        } else if (len - T.rl > 0.05) zmiana = true;   // dokończenie linii
        if (T.a.trwa(t)) {
          za = Math.min(za, zaKlatka(2.2));
          if (Math.abs(T.a.w(t) - T.a.r) * TRAJ * 255 >= 1.5) zmiana = true;
        } else if (T.a.w(t) !== T.a.r) zmiana = true;
      }
      if (!gotowe) za = 1 / 15;
      if (zmiana) { for (const T of tr) { T.rl = dlug(T, t); T.a.r = T.a.w(t); } brudny = false; }
      return { a: zmiana, za };
    },
    rysuj(c, t) {
      const t1 = t - t0;
      c.lineWidth = 1;
      c.strokeStyle = G.rgba(POLE * (gotowe ? 1 : S(t1 / 1.6)));
      c.stroke(pole);
      c.lineWidth = 1.2;
      c.strokeStyle = G.rgba(SEP * (gotowe ? 1 : S((t1 - 0.5) / 1.6)));
      c.stroke(sep);
      c.lineWidth = 1.15;
      for (const T of tr) {
        const len = dlug(T, t), al = TRAJ * T.a.w(t);
        if (len <= 0 || al < 0.002) continue;
        c.strokeStyle = G.rgba(al);
        c.beginPath(); c.moveTo(T.x[0], T.y[0]);
        let i = 1;
        for (; i < T.x.length && T.L[i] < len; i++) c.lineTo(T.x[i], T.y[i]);
        const [x, y] = punkt(T, len);
        c.lineTo(x, y);
        c.stroke();
      }
    },
    // ograniczenie ruchu: pole, separatrysy i trzy narysowane trajektorie
    gotowy() { if (!gotowe || start.length) zbuduj(); tNast = 1e9; },
  };
};

export default motyw;
