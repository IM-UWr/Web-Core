// Pracownicy: diagram łukowy (prototyp animacje-instytut.html, motyw „luki”; zaakceptowany 31.10.2026). U dołu pola,
// w jednym rzędzie, kropki — osoby ze spisu, w grupach z danych (widok Pracownicy.astro: osoby bez zakładu —
// administracja, doktoranci, pozostali — potem zakłady w kolejności obszarów i pracownia; dziś 129 osób w 12 grupach,
// między grupami 5 px przerwy). Półeliptyczne łuki łączą pary osób. Łuki są losowe i poglądowe (nie przedstawiają
// prawdziwych współautorstw): częściej łączą osoby z jednego zakładu albo z sąsiednich grup.
// Ruch: przy wejściu (raz) łuki pojawiają się od najkrótszych (ok. 7 s). Potem co 3–7 s (losowo) nowy łuk rośnie z obu
// końców ku środkowi (2,5 px/s), a jego dwie kropki lekko jaśnieją, albo jeden stary łuk gaśnie (2 s). Naraz rosną
// najwyżej dwa łuki; łuków jest ok. 58 (±4).
// Klatka co 0,75 px drogi rosnącego łuku (3,3 kl./s), gaśnięcie 8 kl./s, wejście 12 kl./s; zmiana, której nie widać (pod
// tekstem), nie rysuje klatki; w przerwach zegar śpi.
// Pole (zlecenie 07): w prototypie kropki stały 2 px nad dołem dawnego pola (187 px przy 390 × 844), a łuki sięgały do
// linku „←” + 8 (81 px); tu kropki 9 px nad dołem pola (162 px, 25 px wyżej), łuki najwyżej do y0 + 3 (70 px). Najwyższe
// łuki mają 92 zamiast 106 px (87%); krótsze łuki (do ok. 50 px promienia) bez zmian.
import type { Fabryka, Ustawienia } from '../typy';
import { S, generator, ogr } from '../wspolne';
import { budowa } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

// bez danych: grupy z prototypu (administracja 8, doktoranci 15 i pozostali 9 bez zakładu; zakłady i pracownia)
const GRUPY = [8, 15, 9, 11, 12, 15, 17, 7, 8, 12, 9, 6], BEZ = 3;
const ZIARNO = 129, PRZ = 5, R_MAX = 150, CEL = 58, V = 2.5, KROK = 0.75, DOL = 9, GORA = 3;
const A_LUK = 0.13, A_DLUGI = 0.10, KROPKA = 0.32, JASNA = 0.3, RK = 0.95;
const WEJSCIE = 1, GAS = 2, FPS_WEJ = 12, FPS_GAS = 8, PROG = 1 / 255;

type Faza = 'wchodzi' | 'rosnie' | 'stoi' | 'gasnie';
/** łuk: kropki a < b, półosie r (pozioma) i ry, długość ćwiartki (pol), postęp wzrostu f i krycie al (rf, ral — na ostatniej
 *  klatce), faza od chwili t0 (wzrost trwa T), wid — największa widoczność łuku po masce */
type Luk = { a: number; b: number; r: number; ry: number; cx: number; pol: number; kl: string; f: number; al: number; rf: number; ral: number; faza: Faza; t0: number; T: number; wid: number };

const los = (a: number, b: number) => a + Math.random() * (b - a);

const motyw: Fabryka = (G, t0) => {
  const d = (G.dane ?? {}) as { g?: unknown; b?: unknown };
  const dg = Array.isArray(d.g) ? d.g.map((n) => Math.max(0, Math.floor(Number(n) || 0))).filter((n) => n > 0) : [];
  const GR = dg.length ? dg : GRUPY, nG = GR.length, nB = dg.length ? ogr(Math.floor(Number(d.b) || 0), 0, nG) : BEZ;
  const N = GR.reduce((s, n) => s + n, 0);
  // kropki: równo od lewego do prawego brzegu treści, między grupami przerwa
  const s = (G.x1 - G.x0 - PRZ * (nG - 1)) / Math.max(1, N - 1), X: number[] = [], POCZ: number[] = [];
  let x = G.x0;
  GR.forEach((n) => { POCZ.push(X.length); for (let i = 0; i < n; i++) { X.push(x); x += s; } x += PRZ; });
  const Y = G.y1 - DOL, hP = Math.max(20, Y - (G.y0 + GORA));

  const luki: Luk[] = [], klucze = new Set<string>();
  const widacLuk = (cx: number, r: number, ry: number) => {
    let m = 0;
    for (let k = 0; k <= 8; k++) { const u = Math.PI * (1 + k / 8); m = Math.max(m, G.widac(cx + r * Math.cos(u), Y + ry * Math.sin(u))); }
    return m;
  };
  // losowy łuk: 82% z jednego z zakładów (dalsze grupy), 18% spośród osób bez zakładu; w 55% do innej grupy, zwykle sąsiedniej
  const losujLuk = (RR: () => number): Luk | null => {
    for (let g = 0; g < 60; g++) {
      const gi = nB === nG || (nB > 0 && RR() >= 0.82) ? Math.floor(RR() * nB) : nB + Math.floor(RR() * (nG - nB));
      const i = POCZ[gi] + Math.floor(RR() * GR[gi]);
      let gj = gi;
      if (RR() > 0.45) {
        const k = 1 + Math.floor(-Math.log(RR() || 1e-9) / 0.6);
        gj = gi + (RR() < 0.5 ? -k : k);
        if (gj < 0 || gj >= nG) continue;
      }
      const j = POCZ[gj] + Math.floor(RR() * GR[gj]);
      if (i === j) continue;
      const a = Math.min(i, j), b = Math.max(i, j), r = (X[b] - X[a]) / 2, kl = a + '-' + b;
      if (r > R_MAX || r < 2 || klucze.has(kl)) continue;
      // półelipsy wyższe niż półokrąg, żeby wypełniły pole nad kropkami
      const ry = Math.min(hP, 1.7 * r + 6), cx = (X[a] + X[b]) / 2;
      // łuki raczej tam, gdzie je widać (wierzchołek za tytułem)
      if (G.widac(cx, Y - ry) < 0.3 && RR() < 0.6) continue;
      return { a, b, r, ry, cx, pol: Math.PI / 2 * Math.sqrt((r * r + ry * ry) / 2), kl, f: 1, al: 0, rf: -1, ral: -1, faza: 'stoi', t0: 0, T: 0, wid: widacLuk(cx, r, ry) };
    }
    return null;
  };

  // łuki startowe (ziarno z prototypu): przy wejściu pojawiają się od najkrótszych; po zmianie układu stoją od razu
  const bud = budowa(t0), tB = bud ? t0 : -1e9, R = generator(ZIARNO);
  for (let q = 0; q < CEL; q++) {
    const L = losujLuk(R);
    if (!L) continue;
    klucze.add(L.kl);
    L.t0 = tB + 0.2 + 5 * (L.r / R_MAX) + 0.6 * R(); L.faza = 'wchodzi';
    luki.push(L);
  }
  let tNast = bud ? tB + 7 + los(1, 3) : t0 + los(2, 5), stoi = false, pierwszy = true;

  const rosnace = () => luki.filter((l) => l.faza === 'rosnie').length;
  const zdarzenie = (t: number) => {
    const n = luki.filter((l) => l.faza !== 'gasnie').length;
    let nowy = n < CEL - 4 ? true : n > CEL + 4 ? false : Math.random() < 0.5;
    // dwa łuki już rosną: przy niedoborze łuków czekamy (w prototypie gasł wtedy stary łuk i łuków z czasem ubywało)
    if (nowy && rosnace() >= 2) { if (n < CEL) return; nowy = false; }
    if (nowy) {
      const L = losujLuk(Math.random);
      if (L) {
        klucze.add(L.kl);
        Object.assign(L, { faza: 'rosnie', f: 0, al: 1, rf: 0, ral: 1, t0: t, T: Math.max(1.5, L.pol / V) });
        luki.push(L);
        return;
      }
    }
    const stoja = luki.filter((l) => l.faza === 'stoi');
    if (stoja.length) { const z = stoja[Math.floor(Math.random() * stoja.length)]; z.faza = 'gasnie'; z.t0 = t; }
  };
  /** końce rosnącego łuku (lewy i prawy) — czy któryś widać */
  const widacKonce = (l: Luk) => {
    const k = l.f * Math.PI / 2, dx = l.r * Math.cos(k), y = Y - l.ry * Math.sin(k);
    return G.widac(l.cx - dx, y) > 0.02 || G.widac(l.cx + dx, y) > 0.02;
  };

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      for (let g = 0; t >= tNast && g < 20; g++) { zdarzenie(tNast); tNast += los(3, 7); }
      let a = pierwszy, wej = false, gas = false, ros = false;
      pierwszy = false;
      for (let i = luki.length - 1; i >= 0; i--) {
        const l = luki[i];
        if (l.faza === 'wchodzi') {
          l.al = S((t - l.t0) / WEJSCIE);
          if (l.al >= 1) l.faza = 'stoi'; else if (l.al > 0) wej = true;
        } else if (l.faza === 'rosnie') {
          l.f = Math.min(1, (t - l.t0) / l.T);
          if (l.f >= 1) l.faza = 'stoi'; else ros = true;
          // co 0,75 px drogi końca (i na koniec wzrostu), jeśli któryś koniec widać
          if ((l.f - l.rf) * l.pol >= KROK || (l.f >= 1 && l.rf < 1)) if (l.f >= 1 || widacKonce(l)) a = true;
        } else if (l.faza === 'gasnie') {
          l.al = 1 - S((t - l.t0) / GAS);
          if (l.al <= 0) { klucze.delete(l.kl); luki.splice(i, 1); if (l.wid > 0.02) a = true; continue; }
          gas = true;
        }
        if (l.faza !== 'rosnie' && Math.abs(l.al - l.ral) * A_LUK >= PROG && l.wid > 0.02) a = true;
      }
      if (a) luki.forEach((l) => { l.rf = l.f; l.ral = l.al; });
      return { a, za: wej ? 1 / FPS_WEJ : gas ? 1 / FPS_GAS : ros ? KROK / V : Math.max(0.05, tNast - t) };
    },
    rysuj(c) {
      const jasne = new Float32Array(N);
      c.lineWidth = 1;
      for (const l of luki) {
        const al = l.al, f = l.f;
        if (al <= 0.003 || f <= 0) continue;
        c.strokeStyle = G.rgba((l.r > 70 ? A_DLUGI : A_LUK) * al);
        c.beginPath();
        if (f >= 1) c.ellipse(l.cx, Y, l.r, l.ry, 0, Math.PI, 2 * Math.PI);
        else {
          // rośnie z obu końców ku środkowi; kropki na końcach jaśnieją
          const k = f * Math.PI / 2;
          c.ellipse(l.cx, Y, l.r, l.ry, 0, Math.PI, Math.PI + k);
          c.moveTo(l.cx + l.r, Y); c.ellipse(l.cx, Y, l.r, l.ry, 0, 2 * Math.PI, 2 * Math.PI - k, true);
          jasne[l.a] = Math.max(jasne[l.a], 1 - f * 0.5); jasne[l.b] = Math.max(jasne[l.b], 1 - f * 0.5);
        }
        c.stroke();
      }
      c.fillStyle = G.rgba(KROPKA);
      c.beginPath();
      for (let i = 0; i < N; i++) if (!jasne[i]) { c.moveTo(X[i] + RK, Y); c.arc(X[i], Y, RK, 0, 2 * Math.PI); }
      c.fill();
      for (let i = 0; i < N; i++) {
        if (!jasne[i]) continue;
        c.fillStyle = G.rgba(KROPKA + JASNA * jasne[i]); c.beginPath(); c.arc(X[i], Y, RK, 0, 2 * Math.PI); c.fill();
      }
    },
    // ograniczenie ruchu: łuki startowe, bez gasnących
    gotowy() {
      stoi = true;
      for (let i = luki.length - 1; i >= 0; i--) if (luki[i].faza === 'gasnie') luki.splice(i, 1);
      luki.forEach((l) => { l.f = 1; l.al = 1; l.faza = 'stoi'; });
    },
  };
};

export default motyw;
