// Seminarium „Statystyka”: histogram próby i gęstość rozkładu normalnego (prototyp animacje-analiza.html, motyw
// „histogram”; zaakceptowany 31.10.2026). Wariant „zaklad” (Zakład Statystyki): obszar krytyczny testu — przerywana linia
// wartości krytycznej μ + 1,645σ i lekko rozjaśniony prawy ogon gęstości (5%).
// Histogram 240 obserwacji w 16 klasach i krzywa gęstości N(μ, σ²) z modą w odsłoniętej części banera (62% szerokości).
// Ruch: przy wejściu histogram zapełnia się obserwacjami (raz, ok. 5 s); potem co 1–6 s (losowo) jedna obserwacja zostaje
// zastąpiona nową: jeden słupek opada, inny rośnie o jedną obserwację (2–3 px) w 1,2 s. Histogram drga wokół gęstości.
// Pole (zlecenie 07): podstawa 6 px nad dołem pola (połowa hasła), szczyt gęstości 18 px pod jego górą (zapas na wahania
// słupków jak w prototypie). Przy 390×844 podstawa jest ok. 23 px wyżej niż w prototypie, w pionie 86% jego wielkości
// (mniej tylko przy próbie startowej z wyjątkowo wysokim słupkiem).
// Klatka tylko wtedy, gdy któryś słupek w odsłoniętej części zmienił wysokość o ≥ 0,5 px.
import type { Fabryka, Ustawienia } from '../typy';
import { generator, ogr } from '../wspolne';
import { Anim, ZIARNO, budowa, gauss, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const NB = 16, N = 240, MU = 0.62, SD = 0.135, WYS = 0.82, KRYT = 1.645;
const SLUPKI = 0.14, GESTOSC = 0.21, OGON = 0.06, LINIA = 0.26;

const motyw: Fabryka = (G, t0) => {
  const test = G.wariant === 'zaklad', los = generator(ZIARNO), w = G.x1 - G.x0, h = G.y1 - G.y0;
  const losuj = (rnd: () => number) => { let u: number; do { u = MU + SD * gauss(rnd); } while (u < 0 || u >= 1); return u; };
  const gest = (u: number) => { const z = (u - MU) / SD; return Math.exp(-0.5 * z * z) / (SD * Math.sqrt(2 * Math.PI)); };
  const kosz = (u: number) => Math.min(NB - 1, Math.floor(u * NB));
  const obs = new Float64Array(N), cnt = new Int32Array(NB), hb = Array.from({ length: NB }, () => new Anim(0));
  for (let i = 0; i < N; i++) { obs[i] = losuj(los); cnt[kosz(obs[i])]++; }
  // prototyp: szczyt gęstości 0,82 h nad podstawą tuż nad dołem pola, ok. 20 px zapasu nad nim na wahania słupków.
  // Tu podstawa 6 px nad dołem pola (połowa hasła), szczyt gęstości najwyżej 18 px pod górą pola (ten sam zapas);
  // gdy próba startowa ma wyjątkowo wysoki słupek, całość jest niższa, żeby i on zmieścił się 4 px pod górą pola.
  // Późniejsze wahania: słupek najwyżej 2 px pod górą pola.
  const base = G.y1 - 6, hMax = base - G.y0 - 2;
  const kH = Math.min(Math.min(WYS * h, h - 24) / gest(MU), (base - G.y0 - 4) * N / (NB * Math.max(...cnt)));
  cnt.fill(0);
  const X = (u: number) => G.x0 + u * w;
  const wys = (c: number) => c / N * NB * kH;
  // czy górną krawędź słupka na wysokości y gdziekolwiek widać (ruch pod tekstem nie wymaga klatki)
  const widac = (b: number, y: number) => [0.1, 0.5, 0.9].some((s) => G.widac(X((b + s) / NB), y) > 0.02);
  const tPrzyb = (n: number) => t0 + 0.3 + 5.2 * Math.pow(n / N, 0.75);   // budowanie: kolejne obserwacje coraz gęściej
  const gestosc = new Path2D();
  gestosc.moveTo(X(0), base - gest(0) * kH);
  for (let u = 0.004; u <= 1.0001; u += 0.004) gestosc.lineTo(X(u), base - gest(u) * kH);

  let przyb = 0, wsk = 0, gotowe = false, tNast = 0, brudny = true;
  const zbuduj = () => { cnt.fill(0); for (let i = 0; i < N; i++) cnt[kosz(obs[i])]++; hb.forEach((a, i) => { a.od = a.cel = a.r = wys(cnt[i]); a.d = 0; }); przyb = N; gotowe = true; };
  if (!budowa(t0)) { zbuduj(); tNast = t0 + 1.5 + Math.random() * 2; }

  return {
    krok(t) {
      if (!gotowe) {
        while (przyb < N && t >= tPrzyb(przyb)) { const b = kosz(obs[przyb]); cnt[b]++; hb[b].ustaw(t, wys(cnt[b]), 0.35); przyb++; }
        if (przyb >= N && t >= tPrzyb(N) + 0.4) { gotowe = true; tNast = t + 1.5 + Math.random() * 2; }
      } else if (t >= tNast) {
        // wymiana najstarszej obserwacji na nową
        const st = kosz(obs[wsk]), nu = losuj(Math.random), nw = kosz(nu);
        obs[wsk] = nu; wsk = (wsk + 1) % N;
        if (st !== nw) { cnt[st]--; cnt[nw]++; hb[st].ustaw(t, wys(cnt[st]), 1.2); hb[nw].ustaw(t, wys(cnt[nw]), 1.2); }
        tNast = t + ogr(0.8 - 2.2 * Math.log(1 - Math.random()), 1, 6);
      }
      let vmax = 0, ruch = false, prz = 0;
      hb.forEach((a, b) => {
        if (a.trwa(t)) { ruch = true; vmax = Math.max(vmax, a.v(t)); }
        const d = Math.abs(a.w(t) - a.r);
        if (d > prz && (!gotowe || widac(b, base - a.w(t)) || widac(b, base - a.r))) prz = d;
      });
      const za = !gotowe ? 1 / 15 : ruch ? zaKlatka(vmax) : Math.max(0.05, tNast - t);
      const zm = brudny || prz >= 0.5 || (!ruch && prz > 0.05);
      if (zm) { for (const a of hb) a.r = a.w(t); brudny = false; }
      return { a: zm, za };
    },
    rysuj(c, t) {
      const bw = 1 / NB;
      if (test) {
        const uc = MU + KRYT * SD;
        c.fillStyle = G.rgba(OGON);
        c.beginPath(); c.moveTo(X(uc), base);
        for (let u = uc; u <= 1.0001; u += 0.004) c.lineTo(X(u), base - gest(u) * kH);
        c.lineTo(X(1), base); c.closePath(); c.fill();
        c.setLineDash([3, 3]);
        c.lineWidth = 1; c.strokeStyle = G.rgba(LINIA);
        c.beginPath(); c.moveTo(X(uc), base); c.lineTo(X(uc), base - gest(uc) * kH - 16); c.stroke();
        c.setLineDash([]);
      }
      // słupki: obrys schodków i kreski między słupkami
      c.lineWidth = 1; c.strokeStyle = G.rgba(SLUPKI); c.lineJoin = 'miter';
      c.beginPath(); c.moveTo(X(0), base);
      hb.forEach((a, b) => { const y = base - Math.min(hMax, a.w(t)); c.lineTo(X(b * bw), y); c.lineTo(X((b + 1) * bw), y); });
      c.lineTo(X(1), base); c.lineTo(X(0), base);
      for (let b = 1; b < NB; b++) {
        const hm = Math.min(hMax, hb[b - 1].w(t), hb[b].w(t));
        if (hm > 0.5) { c.moveTo(X(b * bw), base); c.lineTo(X(b * bw), base - hm); }
      }
      c.stroke();
      c.lineWidth = 1.3; c.strokeStyle = G.rgba(GESTOSC); c.lineJoin = 'round';
      c.stroke(gestosc);
    },
    // ograniczenie ruchu: pełna próba, bez wymian
    gotowy() { zbuduj(); tNast = 1e9; },
  };
};

export default motyw;
