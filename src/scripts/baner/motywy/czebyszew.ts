// Seminarium „Dyskretna analiza harmoniczna i niekomutatywna probabilistyka”: wielomiany Czebyszewa (prototyp
// animacje-analiza.html, motyw „czebyszew”; zaakceptowany 31.10.2026). Wariant „zaklad” (Zakład Analizy Matematycznej):
// dodatkowo słaba oś i kropki w zerach — zera kolejnych wielomianów się przeplatają.
// Sześć wielomianów T₂, T₃, T₄, T₅, T₆, T₈ na [−1, 1], rozciągniętych na szerokość banera (x = 1 z prawej): wszystkie
// wychodzą z jednego punktu w prawym górnym rogu i splatają się w siatkę.
// Ruch: przy wejściu krzywe rozwijają się kolejno od tego punktu (raz, ok. 6 s). Potem co 10–25 s (losowo) jeden wielomian
// płynnie zmienia stopień o 1, w górę albo w dół (T_n(cos θ) = cos nθ, n przechodzi przez wartości pośrednie; zera
// w wariancie przesuwają się po osi razem z nim), ok. 3 px/s. Reszta stoi.
// Pole (zlecenie 07): amplituda jak w prototypie (0,43 wysokości pola), środek 2 px nad środkiem pola — wykres od góry
// pola + 4 px do 8 px nad jego dołem. Przy 390×844 rysunek jest ok. 15 px wyżej niż w prototypie, w pionie 92–94% jego
// wielkości (nowe pole jest niższe od dawnego), poziomo bez zmian.
// Klatka tylko wtedy, gdy któraś krzywa w odsłoniętej części przesunęła się o ≥ 0,5 px; w trakcie zmiany najwyżej 4 kl./s.
import type { Fabryka, Ustawienia } from '../typy';
import { S } from '../wspolne';
import { Anim, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const NT = 320, STOPNIE = [2, 3, 4, 5, 6, 8], NMIN = 1, NMAX = 11;
const TB = 0.3, TK = 0.5, DB = 3.2;                   // budowanie: start, odstęp kolejnych krzywych, rozwijanie (s)
const OS = 0.08, LINIE = 0.13, ZERA = 0.32;

const motyw: Fabryka = (G, t0) => {
  const zera = G.wariant === 'zaklad', h = G.y1 - G.y0, w = G.x1 - G.x0;
  const A = Math.min(0.43 * h, (h - 12) / 2), yc = (G.y0 + G.y1) / 2 - 2;
  const th = new Float64Array(NT), xs = new Float64Array(NT), wid = new Uint8Array(NT);
  for (let i = 0; i < NT; i++) {
    th[i] = Math.PI * i / (NT - 1);
    xs[i] = G.x0 + (Math.cos(th[i]) + 1) / 2 * w;
    // czy w tej kolumnie cokolwiek widać (ruch pod tekstem nie wymaga klatki)
    for (let y = yc - A; y <= yc + A && !wid[i]; y += 3) if (G.widac(xs[i], y) > 0.02) wid[i] = 1;
  }
  const st = STOPNIE.map((k) => new Anim(k));
  let gotowe = !budowa(t0), tNast = gotowe ? t0 + 4 + Math.random() * 6 : 0, brudny = true;
  const odsl = (k: number, t: number) => (gotowe ? 1 : S((t - t0 - TB - TK * k) / DB));
  const ktos = (t: number) => st.some((a) => a.trwa(t));
  // jeden wielomian (losowo spośród tych, które mają wolny sąsiedni stopień) zmienia stopień o 1; zwraca czas trwania
  const zdarzenie = (t: number) => {
    const zaj = st.map((a) => Math.round(a.cel)), wolny = (c: number) => c >= NMIN && c <= NMAX && !zaj.includes(c);
    const kol = st.map((_, k) => k).sort(() => Math.random() - 0.5);
    for (const k of kol) {
      const nn = zaj[k], kier = Math.random() < 0.5 ? -1 : 1, c = wolny(nn + kier) ? nn + kier : wolny(nn - kier) ? nn - kier : 0;
      if (!c) continue;
      let dm = 0;
      for (let i = 0; i < NT; i++) dm = Math.max(dm, Math.abs(Math.cos(c * th[i]) - Math.cos(nn * th[i])) * A);
      const D = Math.max(8, dm / 3);
      st[k].ustaw(t, c, D);
      return D;
    }
    return 2;
  };

  return {
    krok(t) {
      if (!gotowe && t >= t0 + TB + TK * (STOPNIE.length - 1) + DB) { gotowe = true; tNast = t + 4 + Math.random() * 6; brudny = true; }
      if (gotowe && t >= tNast && !ktos(t)) tNast = t + zdarzenie(t) + 10 + Math.random() * 15;
      const ruch = ktos(t);
      let vmax = 0;
      for (const a of st) vmax = Math.max(vmax, a.v(t) * A * 2.2);
      // w trakcie zmiany stopnia najwyżej 4 kl./s (zmiana trwa 8–55 s, a przerwa 10–25 s)
      const za = !gotowe ? 1 / 15 : ruch ? Math.max(0.25, zaKlatka(vmax)) : Math.max(0.05, tNast - t);
      // przesunięcie krzywych w odsłoniętych kolumnach od ostatniej klatki
      let prz = 0;
      if (!brudny && gotowe) {
        for (const a of st) {
          const nu = a.w(t);
          if (Math.abs(nu - a.r) < 1e-6) continue;
          for (let i = 0; i < NT; i++) if (wid[i]) prz = Math.max(prz, Math.abs(Math.cos(nu * th[i]) - Math.cos(a.r * th[i])) * A);
        }
      }
      const a = brudny || !gotowe || prz >= 0.5 || (!ruch && prz > 0.05);
      if (a) { for (const s of st) s.r = s.w(t); brudny = false; }
      return { a, za };
    },
    rysuj(c, t) {
      if (zera) {
        c.lineWidth = 1; c.strokeStyle = G.rgba(OS);
        c.beginPath(); c.moveTo(G.x0, yc); c.lineTo(G.x1, yc); c.stroke();
      }
      c.lineWidth = 1.1;
      c.strokeStyle = G.rgba(LINIE);
      st.forEach((a, k) => {
        const nu = a.w(t), fr = odsl(k, t);
        if (fr <= 0) return;
        const iE = Math.max(1, Math.round(fr * (NT - 1)));
        c.beginPath(); c.moveTo(xs[0], yc - A * Math.cos(nu * th[0]));
        for (let i = 1; i <= iE; i++) c.lineTo(xs[i], yc - A * Math.cos(nu * th[i]));
        c.stroke();
      });
      if (zera) {
        // zera T_ν: θ = (m − ½)π/ν; przy niecałkowitym ν (w trakcie zmiany stopnia) przesuwają się płynnie
        c.fillStyle = G.rgba(ZERA);
        c.beginPath();
        st.forEach((a, k) => {
          const nu = a.w(t), fr = odsl(k, t);
          for (let m = 1; m < 30; m++) {
            const tm = (m - 0.5) * Math.PI / nu;
            if (tm > Math.PI * fr) break;
            const x = G.x0 + (Math.cos(tm) + 1) / 2 * w;
            c.moveTo(x + 1.3, yc); c.arc(x, yc, 1.3, 0, 2 * Math.PI);
          }
        });
        c.fill();
      }
    },
    // ograniczenie ruchu: wszystkie krzywe rozwinięte, bez zmian stopnia
    gotowy() { gotowe = true; tNast = 1e9; },
  };
};

export default motyw;
