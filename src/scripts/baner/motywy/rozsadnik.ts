// Lista seminariów: „rozsadnik” — nasiona pod złotym kątem (prototyp animacje-analiza.html, motyw „rozsadnik”;
// zaakceptowany 31.10.2026). „Seminarium” to po łacinie rozsadnik (semen — nasienie).
// Kropki jak pestki w koszyczku słonecznika: każda kolejna o złoty kąt (ok. 137,5°) dalej, w odległości ∝ √n od środka;
// same układają się w spirale, których liczby ramion są liczbami Fibonacciego.
// Ruch: przy wejściu koszyczek wypełnia się nasionami (raz, 6 s). Potem co 1–8 s (losowo) w środku rodzi się nowe nasiono,
// a pozostałe odsuwają się o włos (przy środku ok. 1–2 px, dalej niezauważalnie); najstarsze gasną na brzegu.
// Między narodzinami nic się nie rysuje.
// Pole (zlecenie 07): koszyczek większy niż pole (promień 0,75 jego wysokości), u góry i u dołu łagodnie wygaszony przez sam
// motyw — od 2 px pod górą pola do 6 px nad jego dołem (prototyp: 2 px poza polem). Przy 390×844 środek jest ok. 15 px
// wyżej niż w prototypie, koszyczek ma 91% jego wielkości (promień idzie za wysokością pola, a nowe pole jest niższe).
// Klatka tylko wtedy, gdy nasiona przy środku przesunęły się o ≥ 0,5 px.
import type { Fabryka, Ustawienia } from '../typy';
import { S, ogr } from '../wspolne';
import { Anim, budowa, zaKlatka } from './_analiza';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const PHI = Math.PI * (3 - Math.sqrt(5)), ODSTEP = 4.6, KRYCIE = 0.36, BUDOWA = 6, NARODZINY = 2;
const RUCH = ODSTEP * 0.9;                                 // ok. przesunięcie nasion przy środku na jedno nowe nasiono (px)

const motyw: Fabryka = (G, t0) => {
  const h = G.y1 - G.y0, w = G.x1 - G.x0, g0 = G.y0 + 2, g1 = G.y1 - 6;
  const cx = G.x0 + 0.72 * w, cy = (g0 + g1) / 2, R = Math.min(0.75 * h, 0.62 * w);
  const Nmax = Math.ceil((R / ODSTEP) ** 2) + 3;
  let ur = new Anim(0), gotowe = !budowa(t0), tNast = 0, brudny = true, rn = 0;
  if (gotowe) { ur = new Anim(Nmax); tNast = t0 + 1 + Math.random() * 2; } else ur.ustaw(t0, Nmax, BUDOWA);

  return {
    krok(t) {
      if (!gotowe && t >= t0 + BUDOWA) { gotowe = true; tNast = t + 1 + Math.random() * 2; }
      if (gotowe && t >= tNast && !ur.trwa(t)) {
        ur.ustaw(t, Math.round(ur.cel) + 1, NARODZINY);
        tNast = t + NARODZINY + ogr(-2.6 * Math.log(1 - Math.random()), 0.5, 6);
      }
      const ruch = ur.trwa(t), n = ur.w(t), prz = Math.abs(n - rn) * RUCH;
      const za = !gotowe ? 1 / 15 : ruch ? zaKlatka(ur.v(t) * RUCH) : Math.max(0.05, tNast - t);
      const a = brudny || prz >= 0.5 || (!ruch && prz > 0.05);
      if (a) { rn = n; brudny = false; }
      return { a, za };
    },
    rysuj(c, t) {
      // kropki grupowane po kryciu (jedno wypełnienie na stopień krycia)
      const n = ur.w(t), grupy = new Map<number, Path2D>();
      for (let b = Math.max(0, Math.floor(n - Nmax - 2)); b <= n; b++) {
        const m = n - b, r = ODSTEP * Math.sqrt(m + 0.3), a = b * PHI, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        const q = Math.round(255 * KRYCIE * S((R - r) / 18) * S(m / 0.8) * S((y - g0) / 9) * S((g1 - y) / 9));
        if (q < 1) continue;
        let p = grupy.get(q);
        if (!p) grupy.set(q, (p = new Path2D()));
        const rr = 0.95 + 0.55 * r / R;
        p.moveTo(x + rr, y); p.arc(x, y, rr, 0, 2 * Math.PI);
      }
      for (const [q, p] of grupy) { c.fillStyle = G.rgba(q / 255); c.fill(p); }
    },
    // ograniczenie ruchu: pełny koszyczek
    gotowy() { ur = new Anim(Nmax); gotowe = true; tNast = 1e9; },
  };
};

export default motyw;
