// Kalendarz: trzy odległości (twierdzenie Steinhausa; prototyp animacje-wydarzenia.html, motyw „Trzy odległości”,
// ustawienia telefonu; zaakceptowany 31.10.2026). Kropki na osi czasu to kolejne wielokrotności kα + β (mod 1) liczby
// niewymiernej α — jak kolejne wydarzenia w kalendarzu. Steinhaus przypuszczał, że takie punkty zawsze dzielą okrąg
// (oś zwiniętą w okrąg) na odstępy co najwyżej trzech długości, a najdłuższy jest sumą dwóch pozostałych; w latach 50.
// udowodnili to m.in. Vera T. Sós i Stanisław Świerczkowski. Łuk nad odstępem ma wysokość proporcjonalną do odstępu,
// więc łuki mają tylko trzy wysokości. N kolejnych wielokrotności to zawsze obrót pierwszych N, więc twierdzenie działa
// w każdej chwili; α (jedna z sześciu niewymiernych) i początek β są losowane przy wejściu.
// Przy wejściu punkty dochodzą po kolei, od trzech (po 0,55 s, ok. 10 s; widać, jak łuki się dzielą). Potem co losową
// przerwę (średnio 8 s) na zmianę: najstarszy punkt znika (dwa łuki płynnie zlewają się w jeden), a później dochodzi
// następny (łuk dzieli się na dwa); profil zmienia się najwyżej w tempie linii (2,5 px/s, przejście co najmniej 6 s).
// Klatka po zmianie profilu o ≥ 0,5 px; w przerwach zegar śpi.
// Zlecenie 07: oś leży 12 px nad dołem pola rysunku (połową hasła), czyli tam, gdzie maska już nie wygasza rysunku —
// przy 390 × 844 przy górnej krawędzi hasła, o 28 px wyżej niż w prototypie (tam 2 px nad dołem starego pola, pod hasłem);
// łuki mają te same wysokości w pikselach co w prototypie (bez spłaszczania).
//
// Warianty (G.wariant, tabela WARIANTY; domyślny — Kalendarz, opisany wyżej):
// - „rytm” — „Czas i rytm” na stronach Studiów: Plan zajęć, Rok akademicki, Zajęcia i konsultacje (zlecenie 04; prototyp
//   animacje-studia-codziennosc.html, rodzina „rytm”, ustawienia telefonu). Ta sama oś i te same przejścia, ale jak
//   w prototypie: N ≈ szerokość/27 punktów (13 przy 390 px), łuki półeliptyczne o wysokości nasyconej
//   Hmax·(1 − e^(−1,25·g/Hmax)), grubsze (1,4 px) i słabsze (0,17; kropki 0,30, oś 0,09). Budowa od jednego punktu (po 1,5 s,
//   ok. 19 s). Potem po losowej przerwie 2–9 s jeden łuk nad osią dzieli się (dochodzi następny punkt) albo łączy
//   z sąsiednim (znika najstarszy) — losowo, okno N − 1…N + 1 punktów; przejście ok. 2,5 px/s (6–24 s). Zmiana, której nie
//   widać (cała pod tekstem), dzieje się od razu i bez przerwy (najwyżej 6 z rzędu), więc widoczne zmiany przychodzą
//   regularnie. Pole: oś jak w Kalendarzu (12 px nad połową hasła, o 19–24 px wyżej niż w prototypie); Hmax 0,86 wysokości od
//   góry pola do osi — przy 390 × 844 te same 79 px co 0,74 starego pola w prototypie (skala 100%).
// - na później (zlecenie 05): Warto wiedzieć (okno punktów nα przesuwa się co 3–8 s) — własny wybór kolejnej zmiany
//   w funkcji `nastepna` na tych samych profilach i przejściach.
import type { Fabryka, Ustawienia } from '../typy';
import { S, ogr } from '../wspolne';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const ALFY = [(Math.sqrt(5) - 1) / 2, Math.SQRT2 - 1, Math.sqrt(3) - 1, Math.sqrt(7) - 2, (3 - Math.sqrt(5)) / 2, (Math.sqrt(13) - 3) / 2];
const LUKI = 0.22, OS = 0.45, KROPKI = 1.8;               // krycie łuków; oś i kropki — wielokrotności
const TEMPO = 2.5, PRZERWA = 8, PRZEJSCIE = 6, KROK_BUDOWY = 0.55, FPS_BUDOWY = 24;
// oś: NAD px nad dołem pola; największy łuk (przy N − 1 punktach) i górny limit łuku — części wysokości od góry pola do osi
// (0,61 i 0,73 dają przy 390 × 844 te same 56 i 67 px co 0,5 i 0,6 starego, wyższego pola w prototypie)
const NAD = 12, WYS = 0.61, HMAX = 0.73;
const CIEMNE = 6;                                          // rytm: najwyżej tyle niewidocznych zmian z rzędu bez przerwy

/** przerwa losowa: rozkład wykładniczy o średniej sr, przycięty do [0,35·sr; 2,5·sr] — bez rytmu i bez skrajności */
const przerwa = (sr: number) => Math.min(2.5 * sr, Math.max(0.35 * sr, -Math.log(1 - Math.random()) * sr));

type Wariant = {
  /** krycie łuków, osi i kropek; grubość łuków (px); promień kropki — zwykłej i najnowszej */
  luki: number; os: number; kropki: number; gr: number; r: number; rN: number;
  /** liczba punktów N przy szerokości pola span (px) */
  ile: (span: number) => number;
  /** łuk półeliptyczny (inaczej sinus); wysokość nasycona Hmax·(1 − e^(−nas·g/Hmax)) przy nas > 0, inaczej liniowa do Hmax */
  elipsa: boolean; nas: number;
  /** górny limit łuku — część wysokości od góry pola do osi */
  hmax: number;
  /** budowa: od ilu punktów, po ilu sekundach od wejścia pierwszy nowy punkt, ile sekund trwa jeden punkt */
  od: number; start: number; krok: number;
  /** czas przejścia przy zmianie profilu o hq px; przerwa po zmianie (s) */
  czas: (hq: number) => number; przerwa: () => number;
  /** wybór zmiany: losowo dzieli albo łączy (okno N − 1…N + 1), niewidoczne zmiany od razu; inaczej na zmianę (okno N − 1…N) */
  losowo: boolean;
};
const WARIANTY: Record<string, Wariant> = {
  kalendarz: {
    luki: LUKI, os: LUKI * OS, kropki: LUKI * KROPKI, gr: 1, r: 1.3, rN: 1.9,
    ile: (s) => Math.max(14, Math.min(30, Math.round(s / 17))), elipsa: false, nas: 0, hmax: HMAX,
    od: 3, start: 0, krok: KROK_BUDOWY, czas: (hq) => Math.max(PRZEJSCIE, 1.5 * hq / TEMPO), przerwa: () => przerwa(PRZERWA), losowo: false,
  },
  rytm: {
    luki: 0.17, os: 0.09, kropki: 0.3, gr: 1.4, r: 1.7, rN: 1.7,
    ile: (s) => Math.max(8, Math.round(s / 27)), elipsa: true, nas: 1.25, hmax: 0.86,
    od: 1, start: 0.8, krok: 1.5, czas: (hq) => ogr(hq / TEMPO, PRZEJSCIE, 24), przerwa: () => 2 + 7 * Math.random(), losowo: true,
  },
};

const motyw: Fabryka = (G, t0) => {
  const W = WARIANTY[G.wariant ?? ''] ?? WARIANTY.kalendarz;
  // M ≥ 1: baner bez szerokości (np. ukryty w chwili pomiaru) nie wywraca motywu
  const xa = G.x0, span = Math.max(1, G.x1 - G.x0), M = Math.floor(span), yb = G.y1 - NAD;
  const al = ALFY[Math.floor(Math.random() * ALFY.length)], be = Math.random();
  const N = W.ile(span), k0 = Math.floor(1 + Math.random() * 399);
  /** położenie punktu k na osi (px od xa) */
  const poz = (k: number) => { const f = k * al + be; return (f - Math.floor(f)) * span; };
  /** położenia punktów kMin…kMax (bez punktu `bez`), posortowane */
  const lista = (bez: number | null) => {
    const o: number[] = [];
    for (let k = kMin; k <= kMax; k++) if (k !== bez) o.push(poz(k));
    return o.sort((a, b) => a - b);
  };
  /** wysokość łuku nad odstępem g */
  const wys = (g: number) => (W.nas ? Hmax * (1 - Math.exp(-W.nas * g / Hmax)) : Math.min(Hmax, kap * g));
  // profil łuków co 1 px: nad odstępem g łuk (sinus albo półelipsa) o wysokości wys(g); okresowo (ostatni łuk zawija się na początek)
  const profil = (l: number[], out: Float32Array) => {
    out.fill(0);
    for (let i = 0; i < l.length; i++) {
      const a = l[i], b = i + 1 < l.length ? l[i + 1] : l[0] + span, g = b - a, hh = wys(g);
      for (let s = Math.ceil(a); s <= b; s++) {
        const q = ((s % M) + M) % M, u = (s - a) / g;
        out[q] = Math.max(out[q], hh * (W.elipsa ? Math.sqrt(Math.max(0, 4 * u * (1 - u))) : Math.sin(Math.PI * (s - a) / g)));
      }
    }
    return out;
  };

  // skala wysokości: największy odstęp przy N − 1 punktach daje łuk na WYS wysokości od góry pola do osi
  let kMin = k0, kMax = k0 + N - 2;
  let gm = 0;
  const l0 = lista(null);
  for (let i = 0; i < l0.length; i++) gm = Math.max(gm, (i + 1 < l0.length ? l0[i + 1] : l0[0] + span) - l0[i]);
  const kap = WYS * (yb - G.y0) / gm, Hmax = W.hmax * (yb - G.y0);
  const hA = new Float32Array(M), hB = new Float32Array(M), wyn = new Float32Array(M);

  // przejście: punkt akt dochodzi (kier = 1) albo znika (kier = −1) od chwili tS przez D s; hA — profil bez niego, hB — z nim
  let akt: number | null = null, kier = 0, tS = 0, D = 1, hq = 0, w = 1, wR = 1;
  let budowa = !(t0 > 0), nast = Infinity, stoi = false, ciemna = false, ciemne = 0;
  const przejscie = (k: number, kr: number, s: number, d?: number) => {
    akt = k; kier = kr; tS = s;
    profil(lista(k), hA); profil(lista(null), hB);
    hq = 0;
    for (let i = 0; i < M; i++) hq = Math.max(hq, Math.abs(hA[i] - hB[i]));
    // najszybsze miejsce profilu (środek smoothstepu: 1,5 × średnia) porusza się z prędkością ≤ TEMPO
    D = d ?? W.czas(hq);
    w = wR = kr > 0 ? 0 : 1;                               // na początku przejścia profil jest taki jak dotąd
    // rytm: zmiana w całości pod tekstem (maska) — od razu, bez animacji
    ciemna = false;
    if (W.losowo && d === undefined) {
      let v = 0;
      for (let i = 0; i < M && v < 0.15; i++) if (Math.abs(hA[i] - hB[i]) > 0.5) v = Math.max(v, G.widac(xa + i, yb - Math.max(hA[i], hB[i])));
      if (v < 0.15) { ciemna = true; D = 0.001; }
    }
  };
  // kolejna zmiana po przerwie. Kalendarz: na zmianę — najstarszy punkt znika, potem dochodzi następny (okno N wielokrotności);
  // rytm: losowo jedno albo drugie (okno N − 1…N + 1)
  const nastepna = (s: number) => {
    const n = kMax - kMin + 1;
    if (W.losowo ? n > N || (n === N && Math.random() < 0.5) : n >= N) przejscie(kMin, -1, s);
    else { kMax++; przejscie(kMax, 1, s); }
  };
  const pelny = () => { kMin = k0; kMax = k0 + N - 1; akt = null; profil(lista(null), wyn); };

  if (budowa) { kMin = k0; kMax = k0 + W.od; przejscie(kMax, 1, t0 + W.start, W.krok); }   // od W.od punktów, po jednym
  else { pelny(); nast = t0 + W.przerwa(); }

  return {
    krok(t) {
      let zmiana = false;
      for (let g = 0; g < 64 && !stoi; g++) {
        if (akt !== null && t >= tS + D) {
          const koniec = tS + D;
          if (kier < 0) kMin++;
          akt = null; zmiana = true;
          if (budowa && kMax - kMin + 1 < N) { kMax++; przejscie(kMax, 1, koniec, W.krok); continue; }
          if (budowa) budowa = false;
          profil(lista(null), wyn);
          ciemne = ciemna ? ciemne + 1 : 0;
          nast = koniec + (ciemna && ciemne < CIEMNE ? 0 : W.przerwa());
          if (ciemne >= CIEMNE) ciemne = 0;
          continue;
        }
        if (akt === null && t >= nast) { nastepna(nast); nast = Infinity; continue; }
        break;
      }
      if (akt !== null) { const e = S((t - tS) / D); w = kier > 0 ? e : 1 - e; }
      const a = zmiana || (akt !== null && Math.abs(w - wR) * hq >= 0.5);
      if (a && akt !== null) wR = w;
      let za = Math.max(0.05, nast - t);
      if (budowa) za = 1 / FPS_BUDOWY;
      else if (akt !== null) za = Math.max(1 / 30, 0.5 * D / (1.5 * Math.max(1, hq)));
      return { a, za };
    },
    rysuj(c) {
      const h = wyn;
      if (akt !== null) for (let i = 0; i < M; i++) h[i] = hA[i] + w * (hB[i] - hA[i]);
      c.lineWidth = W.gr;
      c.beginPath(); c.moveTo(xa, yb - h[0]);
      for (let i = 1; i < M; i++) c.lineTo(xa + i, yb - h[i]);
      c.lineTo(xa + span, yb - h[0]);
      c.strokeStyle = G.rgba(W.luki); c.stroke();
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(xa, yb + 0.5); c.lineTo(xa + span, yb + 0.5);
      c.strokeStyle = G.rgba(W.os); c.stroke();
      // punkty (wydarzenia); najnowszy (w Kalendarzu) trochę większy, ten w przejściu pojawia się albo gaśnie razem z łukami
      c.beginPath();
      for (let k = kMin; k <= kMax; k++) {
        if (k === akt) continue;
        const x = xa + poz(k), r = k === kMax ? W.rN : W.r;
        c.moveTo(x + r, yb); c.arc(x, yb, r, 0, 2 * Math.PI);
      }
      c.fillStyle = G.rgba(W.kropki); c.fill();
      if (akt !== null && w > 0.003) {
        c.beginPath(); c.arc(xa + poz(akt), yb, akt === kMax ? W.rN : W.r, 0, 2 * Math.PI);
        c.fillStyle = G.rgba(W.kropki * w); c.fill();
      }
    },
    // ograniczenie ruchu: pełne okno N punktów, bez przejść
    gotowy() { stoi = true; budowa = false; pelny(); },
  };
};

export default motyw;
