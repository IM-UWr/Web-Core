// Konferencje: punkt stały Banacha — „Punkt spotkania” (prototyp animacje-wydarzenia.html, motyw własny, ustawienia
// telefonu; zaakceptowany 31.10.2026). Łamane kolejnych przybliżeń x, f(x), f(f(x)), … odwzorowania zwężającego
// f(z) = P + D·r·Obr(θ)·D⁻¹(z − P) (zwężające w normie eliptycznej, D = diag(ax, ay)) z losowych punktów startu — wszystkie
// kończą się w jednym punkcie stałym P, jak goście konferencji zjeżdżający z różnych stron do jednego miejsca. Kąt obrotu,
// zwężenie i miejsce P losowane przy każdym wejściu, więc rysunek się nie powtarza.
// Przy wejściu pięć łamanych rysuje się raz (10 s). Potem z losowego punktu rośnie najwyżej jedna nowa łamana naraz
// (2,5 px/s, zwykle 1–3 min), po niej losowa przerwa (średnio 8 s); gdy żywych łamanych jest więcej niż pięć, najstarsza
// powoli gaśnie (16 s). Klatka po przyroście łamanej o ≥ 0,5 px (5 kl./s) albo po widocznej zmianie krycia gasnącej
// (ok. 2 kl./s); w przerwach zegar śpi. Jedna warstwa: łamane w jednej ścieżce, więc przy punkcie spotkania krycie się
// nie sumuje (bez jasnej plamy).
// Zlecenie 07: łamane mieszczą się w polu rysunku silnika (od paska menu + 6 px do połowy hasła; każdy wierzchołek
// w polu — łamane, które by z niego wyszły, są odrzucane). Przy 390 × 844 pole ma 104 px (w prototypie 114 px, od linku
// do 12 px nad kreską), więc P leży 13 px wyżej niż w prototypie, a elipsa ma tę samą wielkość (ay = 54 px, skala 100%).
// Warianty (G.wariant): domyślny plan (Konferencje) jest w fabryce `konferencje` niżej, a:
// - „pajeczyna” — Szkoła doktorska i jej podstrony (zlecenie 04; prototyp animacje-studia-codziennosc.html, rodzina
//   „banach”, ustawienia telefonu): klasyczny rysunek zasady Banacha na odcinku — wykres odwzorowania zwężającego
//   f(u) = p − (λ/b)·sin(b(u − p)) (p = 0,55, λ = 0,74, b = 2,4; |f′| ≤ 0,74), prosta y = x i „pajęczyna” kolejnych przybliżeń
//   (u, u) → (u, f(u)) → (f(u), f(u)) → … zwijająca się do punktu stałego p. Twierdzenie pochodzi z rozprawy doktorskiej
//   Banacha (Lwów 1920, Fundamenta Mathematicae 1922). Rysunek inny niż łamane Konferencji (płaszczyzna), więc ma własne
//   funkcje kwadrat() i siec() (siec() służy też Szukaj); mapa() i orbita() zostają dla Konferencji.
//   Pajęczyna wyłania się odcinek po odcinku (każdy przez 1,6 s, kolejny po 0,3–0,8 s), potem stoi; po 15–30 s (losowo)
//   gaśnie (4 s), a nowa zaczyna się z innego losowego punktu. Wykres, prosta i punkt stały stoją (warstwa A), pajęczyny
//   na warstwie B. Klatka po zmianie krycia odcinka o widoczny stopień (do 9 kl./s przy wyłanianiu), w przerwach zegar śpi.
//   Pole: kwadrat wykresu przy prawym brzegu treści, od y0 + 5 do y1 − 7 px (w prototypie od linku + 3 px do 15 px nad
//   kreską; bok 100 px przy 390 × 844), tu przy 390 × 844 pełny bok 119–121 px. Gdy punkt stały wypadłby pod tekstem (nadtytuł
//   „Kolegium Doktorskie Matematyki” na stronie szkoły, dwuliniowe tytuły podstron), kwadrat zmniejsza się (krokami po 5%,
//   najwyżej do połowy) przy dolnym albo górnym brzegu pola, aż punkt stały z otoczeniem 8 px będzie widoczny (maska > 0,7);
//   przy 390 × 844: strona szkoły 55% (nadtytuł), podstrony z dwuliniowym tytułem 50–70%, EN 50%.
// - „kratka” — Szukaj (zlecenie 05; prototyp animacje-ogolne.html, motyw „pajeczyna”, ustawienia telefonu): ta sama zasada
//   Banacha w wersji prototypu stron ogólnych, na wspólnej kratce (kratka.ts, krycie 0,055). Kwadrat [0, 1]² rozciągnięty
//   na całe pole: przekątna y = x i falisty wykres f(u) = us + A·sin(w(u − us)) (us 0,70–0,86, |A·w| 0,55–0,8, w 7–11;
//   w 65% nachylenie ujemne — pajęczyna się zwija, inaczej schodki), pajęczyna z siec() od losowego punktu startu
//   (60%: nad us, inaczej pod). Odcinki pojawiają się po kolei przez przenikanie (1 s, co 1,0–1,6 s; przy wejściu 0,5 s co
//   0,35 s), na końcu kółko w punkcie stałym (1,5 s); po 8–20 s pajęczyna gaśnie (3 s) i zaczyna się od nowego losowego
//   punktu, w 35% z nową funkcją (stary wykres gaśnie, nowy się pojawia, 3,2 s). Linie się nie przesuwają. Kratka,
//   przekątna i wykres — warstwa A, pajęczyny — warstwa B w swoim pudle; przy zmianie funkcji oba wykresy przenikają się
//   na warstwie B (A rysuje się wtedy tylko na początku i na końcu). Klatka po postępie przenikania, 5 kl./s (10 przy
//   wejściu), w przerwach zegar śpi.
//   Pole: v = 1 leży 4 px pod górą pola (w prototypie 2 px pod linkiem — przy 390 × 844 o 4 px wyżej), wysokość kwadratu
//   1,1 × pole — przy 390 × 844 te same 113–114 px co w prototypie (skala 100%). Dolny róg kwadratu wypada pod hasłem: nic
//   tam nie leży oprócz przekątnej, która zaczyna się 1 px nad dołem pola; pajęczyny (v ≥ 0,46), wykres (v ≥ 0,59)
//   i kółko mieszczą się w polu.
import type { Fabryka, Pole, Pudlo, Ustawienia } from '../typy';
import { S, ogr } from '../wspolne';
import { kratka } from './kratka';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const LINIA = 0.18, KROPKI = 1.5, PUNKT = 2.2;            // krycie łamanych; kropki i pierścień P — wielokrotności
const ILE = 5, BUDOWA = 10, TEMPO = 2.5, PRZERWA = 8, GASNIE = 16, FPS_BUDOWY = 24;

type Mapa = { px: number; py: number; ax: number; ay: number; r: number; cs: number; sn: number };
/** łamana: wierzchołki (x, y kolejno), droga od startu do każdego wierzchołka, długość */
type Lamana = { p: number[]; c: number[]; L: number };
/** łamana na rysunku: rośnie od chwili `od` (przy budowie — razem z innymi przez BUDOWA s), gaśnie od chwili `gas` */
type Lam = Lamana & { od: number; bud: boolean; gas: number; s: number; a: number; sR: number; aR: number };

const los = (a: number, b: number) => a + Math.random() * (b - a);
/** przerwa losowa: rozkład wykładniczy o średniej sr, przycięty do [0,35·sr; 2,5·sr] — bez rytmu i bez skrajności */
const przerwa = (sr: number) => Math.min(2.5 * sr, Math.max(0.35 * sr, -Math.log(1 - Math.random()) * sr));

/** odwzorowanie zwężające: P tam, gdzie rysunek dobrze widać (też 18 px wyżej i niżej) — od pierwszego takiego miejsca
 *  na wysokości środka pola losowo 40–70% drogi do prawego brzegu (z zapasem 40 px); elipsa na całą wysokość pola
 *  (półoś ay o 2 px większa niż połowa pola — przy 390 × 844 tyle co w prototypie; skrajne łamane i tak odpadają w orbita()) */
function mapa(G: Pole): Mapa {
  const yc = (G.y0 + G.y1) / 2 + los(-4, 4);
  let xv = G.x1;
  for (let x = G.x0; x < G.x1; x += 2) if (G.widac(x, yc) > 0.97 && G.widac(x, yc - 18) > 0.9 && G.widac(x, yc + 18) > 0.9) { xv = x; break; }
  const ay = (G.y1 - G.y0) / 2 + 2, th = los(30, 40) * Math.PI / 180 * (Math.random() < 0.5 ? 1 : -1);
  return { px: Math.min(G.x1 - 40, xv + Math.max(0, G.x1 - 40 - xv) * los(0.4, 0.7)), py: yc, ax: ay * los(2, 2.5), ay, r: los(0.84, 0.88), cs: Math.cos(th), sn: Math.sin(th) };
}

/** łamana kolejnych przybliżeń z losowego punktu (w normie elipsy 0,55–1,3 od P, najlepiej tam, gdzie ją widać);
 *  wszystkie wierzchołki w polu rysunku; kończy się, gdy do P zostaje < 0,6 px */
function orbita(G: Pole, m: Mapa): Lamana | null {
  for (let proba = 0; proba < 400; proba++) {
    const x = los(G.x0, G.x1), y = los(G.y0 + 2, G.y1 - 2);
    let u = (x - m.px) / m.ax, v = (y - m.py) / m.ay;
    const R = Math.hypot(u, v);
    if (R < 0.55 || R > 1.3 || (proba < 300 && G.widac(x, y) < 0.4)) continue;
    const p: number[] = [];
    let ok = true;
    for (let n = 0; n < 300; n++) {
      const X = m.px + m.ax * u, Y = m.py + m.ay * v;
      if (X < G.x0 - 0.5 || X > G.x1 + 0.5 || Y < G.y0 - 0.5 || Y > G.y1 + 0.5) { ok = false; break; }
      p.push(X, Y);
      if (Math.hypot(m.ax * u, m.ay * v) < 0.6) break;
      const u2 = m.r * (m.cs * u - m.sn * v);
      v = m.r * (m.sn * u + m.cs * v); u = u2;
    }
    if (!ok || p.length < 8) continue;
    const c = [0];
    for (let i = 2; i < p.length; i += 2) c.push(c[c.length - 1] + Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]));
    return { p, c, L: c[c.length - 1] };
  }
  return null;
}

/** łamana do drogi s (px od startu) */
function sciezka(c: CanvasRenderingContext2D, o: Lamana, s: number) {
  const p = o.p, d = o.c;
  c.moveTo(p[0], p[1]);
  for (let i = 1; i < d.length; i++) {
    if (d[i] <= s) { c.lineTo(p[2 * i], p[2 * i + 1]); continue; }
    const f = (s - d[i - 1]) / (d[i] - d[i - 1]);
    c.lineTo(p[2 * i - 2] + f * (p[2 * i] - p[2 * i - 2]), p[2 * i - 1] + f * (p[2 * i + 1] - p[2 * i - 1]));
    break;
  }
}

/** kropki w wierzchołkach, do których łamana już doszła — bez tych przy samym P (< 5 px), żeby nie było plamy */
function kropki(c: CanvasRenderingContext2D, o: Lamana, s: number, m: Mapa) {
  const p = o.p;
  for (let i = 0; i < o.c.length && o.c[i] <= s; i++) {
    if (Math.hypot(p[2 * i] - m.px, p[2 * i + 1] - m.py) < 5) break;
    c.moveTo(p[2 * i] + 1.1, p[2 * i + 1]); c.arc(p[2 * i], p[2 * i + 1], 1.1, 0, 2 * Math.PI);
  }
}

const konferencje: Fabryka = (G, t0) => {
  const m = mapa(G);
  // nowy układ w trakcie oglądania (t0 > 0): łamane od razu gotowe, bez budowania
  const bez = t0 > 0, lam: Lam[] = [];
  const dodaj = (o: Lamana, od: number, bud: boolean): Lam => {
    const l: Lam = { ...o, od, bud, gas: Infinity, s: 0, a: 1, sR: -1, aR: 1 };
    lam.push(l);
    return l;
  };
  for (let i = 0; i < ILE; i++) { const o = orbita(G, m); if (o) dodaj(o, bez ? -1e9 : t0, !bez); }
  const koniecBudowy = bez ? t0 : t0 + BUDOWA;
  let nast = koniecBudowy + przerwa(PRZERWA), rosnie: Lam | null = null, stoi = false, ile = -1;
  const dlugosc = (l: Lam, t: number) => stoi ? l.L : l.bud ? l.L * S((t - l.od) / BUDOWA) : Math.min(l.L, Math.max(0, (t - l.od) * TEMPO));

  // nowa łamana zaczyna rosnąć w chwili s; gdy żywych jest więcej niż ILE, najstarsza stojąca zaczyna gasnąć
  const nowa = (s: number) => {
    const o = orbita(G, m);
    if (!o) { nast = s + przerwa(PRZERWA); return; }
    rosnie = dodaj(o, s, false);
    nast = Infinity;                                       // następna dopiero po skończeniu tej (i losowej przerwie)
    const zywe = lam.filter((l) => l.gas === Infinity);
    if (zywe.length > ILE) { const st = zywe.find((l) => l !== rosnie); if (st) st.gas = s; }
  };

  return {
    krok(t) {
      for (let g = 0; g < 8 && !stoi; g++) {
        if (rosnie && t >= rosnie.od + rosnie.L / TEMPO) { nast = rosnie.od + rosnie.L / TEMPO + przerwa(PRZERWA); rosnie = null; continue; }
        if (!rosnie && t >= nast) { nowa(nast); continue; }
        break;
      }
      for (let i = lam.length - 1; i >= 0; i--) if (t >= lam[i].gas + GASNIE) lam.splice(i, 1);
      // klatka, gdy któraś łamana urosła o ≥ 0,5 px, krycie gasnącej zmieniło się o widoczny stopień albo ubyła łamana
      let a = ile !== lam.length, gas = false;
      for (const l of lam) {
        l.s = dlugosc(l, t); l.a = l.gas === Infinity ? 1 : Math.max(0, 1 - (t - l.gas) / GASNIE);
        if (l.gas < Infinity) gas = true;
        if (Math.abs(l.s - l.sR) >= 0.5 || Math.abs(l.a - l.aR) * LINIA * 255 >= 1.5) a = true;
      }
      if (a) { ile = lam.length; for (const l of lam) { l.sR = l.s; l.aR = l.a; } }
      let za = Math.max(0.05, nast - t);
      if (t < koniecBudowy) za = 1 / FPS_BUDOWY;
      else if (rosnie) za = 0.5 / TEMPO;
      if (gas) za = Math.min(za, 1.5 / 255 / LINIA * GASNIE);
      return { a, za };
    },
    rysuj(c) {
      c.lineWidth = 1;
      c.beginPath();
      for (const l of lam) if (l.gas === Infinity) sciezka(c, l, l.s);
      c.strokeStyle = G.rgba(LINIA); c.stroke();
      c.beginPath();
      for (const l of lam) if (l.gas === Infinity) kropki(c, l, l.s, m);
      c.fillStyle = G.rgba(LINIA * KROPKI); c.fill();
      for (const l of lam) {
        if (l.gas === Infinity || l.a <= 0.003) continue;
        c.beginPath(); sciezka(c, l, l.s); c.strokeStyle = G.rgba(LINIA * l.a); c.stroke();
        c.beginPath(); kropki(c, l, l.s, m); c.fillStyle = G.rgba(LINIA * KROPKI * l.a); c.fill();
      }
      c.beginPath(); c.arc(m.px, m.py, 3.2, 0, 2 * Math.PI);
      c.lineWidth = 1.1; c.strokeStyle = G.rgba(LINIA * PUNKT); c.stroke();
    },
    // ograniczenie ruchu: pięć gotowych łamanych i punkt stały
    gotowy() {
      stoi = true; rosnie = null;
      for (let i = lam.length - 1; i >= 0; i--) if (lam[i].gas < Infinity) lam.splice(i, 1);
      for (const l of lam) { l.s = l.L; l.a = 1; }
    },
  };
};

// ---------- wariant „pajeczyna” (Szkoła doktorska) ----------
const P = 0.55, LAM = 0.74, BB = 2.4;                      // punkt stały, zwężenie (|f′| ≤ λ), częstość
const P_LINIA = 0.17, P_PROSTA = 0.11, P_PUNKT = 0.2;      // krycie: wykres i pajęczyny, prosta y = x, punkt stały
const WYLANIA = 1.6, ZGASA = 4, FPS_P = 9;                 // wyłanianie odcinka i gaśnięcie starej pajęczyny (s)

/** odwzorowanie zwężające odcinka [0, 1] w siebie, jedyny punkt stały p */
const fP = (u: number) => P - LAM / BB * Math.sin(BB * (u - P));

/** odcinek pajęczyny: x0, y0, x1, y1, chwila wyłonienia (s od początku pajęczyny), ostatnio narysowane krycie */
type Odc = [number, number, number, number, number, number];

/** pajęczyna kolejnych przybliżeń (u, u) → (u, f(u)) → (f(u), f(u)) → … od u0 w układzie X, Y (s px na jednostkę),
 *  aż krok spadnie poniżej 3 px; bez odcinków krótszych niż `min` px (domyślnie 2) */
function siec(f: (u: number) => number, u0: number, X: (u: number) => number, Y: (v: number) => number, s: number, min = 2): Odc[] {
  const o: Odc[] = [];
  let u = u0, y = u0;
  for (let k = 0; k < 60; k++) {
    const fu = f(u);
    o.push([X(u), Y(y), X(u), Y(fu), 0, 0], [X(u), Y(fu), X(fu), Y(fu), 0, 0]);
    if (Math.abs(fu - u) * s < 3) break;
    u = y = fu;
  }
  return o.filter((q) => Math.hypot(q[2] - q[0], q[3] - q[1]) > min);
}

/** kwadrat wykresu (bok s, dół yD) przy prawym brzegu treści: cała wysokość pola, a gdy punkt stały (z otoczeniem 8 px)
 *  wypada pod tekstem — mniejszy (do 50%), przy dolnym albo górnym brzegu pola; pierwszy z dobrze widocznym punktem */
function kwadrat(G: Pole): { s: number; yD: number } {
  const yG = G.y0 + 5, yD0 = G.y1 - 7, H = yD0 - yG;
  let naj = { s: H, yD: yD0 }, nw = -1;
  for (let k = 1; k > 0.49; k -= 0.05) for (const yD of [yD0, yG + H * k]) {
    const x = G.x1 - (1 - P) * H * k, y = yD - P * H * k;
    const v = Math.min(G.widac(x, y), G.widac(x - 8, y), G.widac(x, y - 8), G.widac(x, y + 8));
    if (v > 0.7) return { s: H * k, yD };
    if (v > nw + 0.05) { nw = v; naj = { s: H * k, yD }; }
  }
  return naj;
}

const pajeczyna: Fabryka = (G, t0) => {
  const { s, yD } = kwadrat(G), xP = G.x1;
  const X = (u: number) => xP - (1 - u) * s, Y = (v: number) => yD - v * s;
  type Siec = { o: Odc[]; t0: number; gas: number };
  // nowa pajęczyna od chwili `od`: start losowy, co najmniej 0,25 od p; odcinki wyłaniają się co 0,3–0,8 s (dłuższe — później)
  const nowa = (od: number): Siec => {
    let u = 0, g = 0;
    do u = los(0.03, 0.98); while (Math.abs(u - P) < 0.25 && ++g < 50);
    const o = siec(fP, u, X, Y, s);
    let c = 0;
    for (const q of o) { q[4] = c; c += ogr(Math.hypot(q[2] - q[0], q[3] - q[1]) / 45, 0.3, 0.8); }
    return { o, t0: od, gas: Infinity };
  };
  // nowy układ w trakcie oglądania (t0 > 0): pajęczyna od razu gotowa
  const sieci: Siec[] = [nowa(t0 > 0 ? -1e9 : t0 + 0.6)];
  let tNowa = Infinity, stoi = false, ile = -1;
  const zbudowana = (w: Siec) => w.t0 + (w.o.length ? w.o[w.o.length - 1][4] : 0) + WYLANIA;
  const alfa = (w: Siec, q: Odc, t: number) => (stoi ? 1 : S((t - w.t0 - q[4]) / WYLANIA) * (1 - S((t - w.gas) / ZGASA)));

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      // po zbudowaniu losowa przerwa 15–30 s, potem stara gaśnie, a nowa zaczyna się 1 s później
      const ost = sieci[sieci.length - 1];
      if (tNowa === Infinity && t >= zbudowana(ost)) tNowa = Math.max(zbudowana(ost), t0) + los(15, 30);
      if (t >= tNowa) { ost.gas = tNowa; sieci.push(nowa(tNowa + 1)); tNowa = Infinity; }
      for (let i = sieci.length - 1; i >= 0; i--) if (t >= sieci[i].gas + ZGASA) sieci.splice(i, 1);
      // klatka, gdy krycie któregoś odcinka zmieniło się o widoczny stopień (≥ 3/255 krycia linii), doszło do końca
      // albo ubyła pajęczyna; zegar: 9 kl./s przy wyłanianiu i gaśnięciu, inaczej śpi do następnego odcinka albo zmiany
      let b = ile !== sieci.length, za = tNowa - t;
      for (const w of sieci) {
        if (t >= w.gas && t < w.gas + ZGASA) za = 0;
        for (const q of w.o) {
          const s0 = w.t0 + q[4], a = alfa(w, q, t), d = Math.abs(a - q[5]);
          if (t >= s0 && t < s0 + WYLANIA) za = 0; else if (s0 > t) za = Math.min(za, s0 - t);
          if (d * P_LINIA * 255 >= 3 || (d > 0.001 && (a >= 1 || a <= 0))) b = true;
        }
      }
      const nw = sieci[sieci.length - 1];
      if (tNowa === Infinity) za = Math.min(za, Math.max(0.05, zbudowana(nw) - t));
      if (b) { ile = sieci.length; for (const w of sieci) for (const q of w.o) q[5] = alfa(w, q, t); }
      return { a: false, b, za: za <= 0 ? 1 / FPS_P : Math.max(0.02, za) };
    },
    // warstwa stała: wykres f przez całą szerokość pola (po lewej znika pod tekstem), prosta y = x i punkt stały
    rysuj(c) {
      c.lineWidth = 1.4;
      c.beginPath();
      for (let x = G.x0; x <= xP + 0.01; x++) { const y = Y(fP((x - xP) / s + 1)); if (x === G.x0) c.moveTo(x, y); else c.lineTo(x, y); }
      c.strokeStyle = G.rgba(P_LINIA); c.stroke();
      c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(1), Y(1));
      c.strokeStyle = G.rgba(P_PROSTA); c.stroke();
      c.beginPath(); c.arc(X(P), Y(P), 2.6, 0, 2 * Math.PI);
      c.fillStyle = G.rgba(P_PUNKT); c.fill();
    },
    // warstwa ruchoma: pajęczyny (w kwadracie wykresu)
    rysujB(c, t): Pudlo {
      c.lineWidth = 1.3;
      for (const w of sieci) for (const q of w.o) {
        const a = alfa(w, q, t);
        if (a < 0.004) continue;
        c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[2], q[3]);
        c.strokeStyle = G.rgba(P_LINIA * a); c.stroke();
      }
      return [X(0) - 3, Y(1) - 3, xP + 3, Y(0) + 3];
    },
    // ograniczenie ruchu: ostatnia pajęczyna w całości
    gotowy() {
      stoi = true; tNowa = Infinity;
      const w = sieci[sieci.length - 1];
      sieci.length = 0; sieci.push({ ...w, gas: Infinity });
    },
  };
};

// ---------- wariant „kratka” (Szukaj) ----------
const K_LINIA = 0.3, K_WYKRES = 0.16, K_PROSTA = 0.11, K_START = 0.32, K_KOLO = 0.42, K_KRATKA = 0.055; // krycie
const K_GASNIE = 3, K_ZMIANA = 3.2, K_FPS = 5, K_FPS_BUD = 10;    // gaśnięcie pajęczyny, zmiana funkcji (s); klatki/s

/** f(u) = us + A·sin(w(u − us)), |f′| ≤ |A·w| = 0,55–0,8 < 1 — odwzorowanie zwężające, jedyny punkt stały us */
type FunK = { us: number; A: number; w: number };
const nowaF = (): FunK => { const w = los(7, 11); return { us: los(0.7, 0.86), A: (Math.random() < 0.65 ? -1 : 1) * los(0.55, 0.8) / w, w }; };
const fK = (f: FunK) => (u: number) => f.us + f.A * Math.sin(f.w * (u - f.us));
/** cykl: pajęczyna od u0 (odcinki `o`, w o[i][4] chwila pojawienia się), kropka startu od t0, kółko w punkcie stałym od
 *  tKolo, gaśnięcie od tCzeka; zmiana — następny cykl ma nową funkcję; fPop, fZm — poprzednia funkcja i początek zmiany */
type Cykl = { f: FunK; u0: number; o: Odc[]; t0: number; fade: number; tKolo: number; tCzeka: number; zmiana: boolean; fPop: FunK | null; fZm: number; box: Pudlo };

const naKratce: Fabryka = (G, t0) => {
  // kwadrat [0, 1]² rozciągnięty na pole: u = 1 przy prawym brzegu treści, v = 1 4 px pod górą pola, wysokość 1,1 × pole
  // (przy 390 × 844 tyle co w prototypie); dolny róg kwadratu wypada pod hasłem — przekątna zaczyna się 1 px nad dołem pola
  const span = G.x1 - G.x0, yG = G.y0 + 4, hh = 1.1 * (G.y1 - G.y0);
  const X = (u: number) => G.x0 + u * span, Y = (v: number) => yG + (1 - v) * hh;
  const vMin = 1 - (G.y1 - 1 - yG) / hh;
  const nowyCykl = (od: number, bud: boolean, f: FunK, u?: number): Cykl => {
    const u0 = u ?? (Math.random() < 0.6 ? los(Math.min(0.97, f.us + 0.1), 0.98) : los(0.46, f.us - 0.12));
    // kroki do < 0,8 px w poziomie (próg siec(): 3 px przy skali 3,75 × szerokość), bez odcinków krótszych niż 0,5 px
    const o = siec(fK(f), u0, X, Y, 3.75 * span, 0.5);
    let t = od + (bud ? 0.4 : 0.6);
    const xs = [X(u0), X(f.us) - 6, X(f.us) + 6], ys = [Y(u0), Y(f.us) - 6, Y(f.us) + 6];
    for (const q of o) { q[4] = t; t += bud ? 0.35 : los(1, 1.6); xs.push(q[0], q[2]); ys.push(q[1], q[3]); }
    const tKolo = t + 0.3;
    return { f, u0, o, t0: od, fade: bud ? 0.5 : 1, tKolo, tCzeka: tKolo + 1.5 + los(8, 20), zmiana: !bud && Math.random() < 0.35,
      fPop: null, fZm: -Infinity, box: [Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3] };
  };
  const cykle: Cykl[] = [nowyCykl(t0, !(t0 > 0), nowaF())];
  // nowy układ w trakcie oglądania (t0 > 0): pajęczyna od razu gotowa, dalej czekanie 8–20 s
  if (t0 > 0) {
    const c = cykle[0], d = c.tKolo + 1.5 - t0;
    c.t0 -= d; c.tKolo -= d; c.tCzeka -= d;
    for (const q of c.o) q[4] -= d;
  }
  const koniecWejscia = t0 > 0 ? 0 : cykle[0].tKolo + 1.5;
  let stoi = false, tRA = -Infinity, tRB = -Infinity;
  const wyg = (c: Cykl, t: number) => (stoi ? 1 : 1 - S((t - c.tCzeka) / K_GASNIE));

  // po czekaniu pajęczyna gaśnie (3 s), a 3,2 s później nowa zaczyna się z losowego punktu; czasem (35%) z nową funkcją —
  // stary wykres gaśnie, a nowy pojawia się przez te same 3,2 s
  const posun = (t: number) => {
    for (let g = 0; g < 20; g++) {
      const c = cykle[cykle.length - 1];
      if (t < c.tCzeka) break;
      const n = nowyCykl(c.tCzeka + K_ZMIANA, false, c.zmiana ? nowaF() : c.f);
      if (c.zmiana) { n.fPop = c.f; n.fZm = c.tCzeka; }
      cykle.push(n);
      if (cykle.length > 3) cykle.shift();
    }
  };
  const wykres = (c: CanvasRenderingContext2D, f: FunK, a: number) => {
    if (a <= 0.003) return;
    const fu = fK(f);
    c.lineWidth = 1.4;
    c.beginPath();
    for (let x = G.x0; x <= G.x1 + 0.01; x += 2) { const y = Y(fu((x - G.x0) / span)); if (x === G.x0) c.moveTo(x, y); else c.lineTo(x, y); }
    c.strokeStyle = G.rgba(K_WYKRES * a); c.stroke();
  };
  /** pudło wykresu f (cała szerokość, wysokość fali) */
  const pudloF = (f: FunK): Pudlo => [G.x0 - 2, Y(f.us + Math.abs(f.A)) - 2, G.x1 + 2, Y(f.us - Math.abs(f.A)) + 2];
  /** zmiana funkcji trwa — oba wykresy przenikają się na warstwie B (warstwa A jest wtedy bez wykresu), żeby w tych
   *  3,2 s nie przerysowywać obu warstw naraz */
  const zmiana = (cy: Cykl, t: number) => !stoi && !!cy.fPop && t >= cy.fZm && t < cy.fZm + K_ZMIANA;

  return {
    krok(t) {
      if (stoi) return { a: false, za: 5 };
      posun(t);
      // klatka warstwy B, gdy któreś przenikanie posunęło się od ostatniej klatki (także ta po jego końcu); warstwy A —
      // tylko na początku i na końcu zmiany funkcji. Zegar: 5 kl./s w przenikaniu (10 przy wejściu), inaczej śpi do
      // następnego odcinka, kółka albo gaśnięcia
      let a = false, b = false, trwa = false, nast = Infinity;
      const zd = (s: number, d: number) => {
        if (t >= s && t < s + d) trwa = true; else if (s > t) nast = Math.min(nast, s);
        if (t > s + 0.02 && s + d > tRB) b = true;
      };
      for (const c of cykle) {
        zd(c.t0, 0.6); zd(c.tKolo, 1.5); zd(c.tCzeka, K_GASNIE);
        for (const q of c.o) zd(q[4], c.fade);
        if (c.fPop) {
          zd(c.fZm, K_ZMIANA);
          for (const s of [c.fZm, c.fZm + K_ZMIANA]) if (tRA < s && s <= t) a = b = true;
        }
      }
      if (a) tRA = t;
      if (b) tRB = t;
      const za = trwa ? Math.min(1 / (t < koniecWejscia ? K_FPS_BUD : K_FPS), nast - t) : nast - t;
      return { a, b, za: Math.max(0.02, za) };
    },
    // warstwa stała: kratka, przekątna y = x i wykres f (poza zmianą funkcji)
    rysuj(c, t) {
      kratka(c, G, K_KRATKA);
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(X(vMin), Y(vMin)); c.lineTo(X(1), Y(1));
      c.strokeStyle = G.rgba(K_PROSTA); c.stroke();
      const ost = cykle[cykle.length - 1];
      if (!zmiana(ost, t)) wykres(c, ost.f, 1);
    },
    // warstwa ruchoma: pajęczyny z kropką startu i kółkiem w punkcie stałym, przy zmianie funkcji też oba wykresy;
    // pudło — suma pudeł tego, co narysowane
    rysujB(c, t) {
      let box: Pudlo | null = null;
      const ost = cykle[cykle.length - 1];
      if (zmiana(ost, t)) {
        const e = S((t - ost.fZm) / K_ZMIANA), p = pudloF(ost.fPop!), q = pudloF(ost.f);
        wykres(c, ost.fPop!, 1 - e); wykres(c, ost.f, e);
        box = [p[0], Math.min(p[1], q[1]), p[2], Math.max(p[3], q[3])];
      }
      for (const cy of cykle) {
        const wg = wyg(cy, t);
        if ((stoi && cy !== ost) || wg <= 0.003) continue;
        c.lineWidth = 1;
        // odcinki już w pełni widoczne — jedną ścieżką, wyłaniające się — każdy osobno
        c.beginPath();
        for (const q of cy.o) if (stoi || t >= q[4] + cy.fade) { c.moveTo(q[0], q[1]); c.lineTo(q[2], q[3]); }
        c.strokeStyle = G.rgba(K_LINIA * wg); c.stroke();
        if (!stoi) for (const q of cy.o) {
          const a = S((t - q[4]) / cy.fade);
          if (a <= 0.004 || a >= 1) continue;
          c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[2], q[3]);
          c.strokeStyle = G.rgba(K_LINIA * a * wg); c.stroke();
        }
        const as = stoi ? 1 : S((t - cy.t0) / 0.6), ak = stoi ? 1 : S((t - cy.tKolo) / 1.5);
        if (as > 0.003) { c.beginPath(); c.arc(X(cy.u0), Y(cy.u0), 1.8, 0, 2 * Math.PI); c.fillStyle = G.rgba(K_START * as * wg); c.fill(); }
        if (ak > 0.003) {
          c.lineWidth = 1.2;
          c.beginPath(); c.arc(X(cy.f.us), Y(cy.f.us), 4.5, 0, 2 * Math.PI); c.strokeStyle = G.rgba(K_KOLO * ak * wg); c.stroke();
        }
        const p = cy.box;
        box = box ? [Math.min(box[0], p[0]), Math.min(box[1], p[1]), Math.max(box[2], p[2]), Math.max(box[3], p[3])] : [p[0], p[1], p[2], p[3]];
      }
      return box;
    },
    // ograniczenie ruchu: gotowa pajęczyna od punktu nieco nad punktem stałym (jak w prototypie) i kółko
    gotowy() {
      stoi = true;
      const f = cykle[cykle.length - 1].f;
      cykle.length = 0;
      cykle.push(nowyCykl(0, true, f, Math.min(0.97, f.us + 0.16)));
    },
  };
};

const motyw: Fabryka = (G, t0) => (G.wariant === 'pajeczyna' ? pajeczyna(G, t0) : G.wariant === 'kratka' ? naKratce(G, t0) : konferencje(G, t0));

export default motyw;
