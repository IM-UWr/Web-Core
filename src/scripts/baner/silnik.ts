// Silnik animacji w tle banerów podstron — tylko telefon (≤ 760 px; zlecenie 02, decyzje 31.10.2026).
// Baner deklaruje motyw atrybutem data-animacja na .ph (NaglowekStrony.astro, mapa strona → motyw w src/lib/motywyBanerow.ts);
// silnik ładuje tylko kod tego motywu (osobny plik w motywy/, dynamiczny import), mierzy baner, nakłada maskę
// „obrys linii” i prowadzi pętlę. Na komputerze nic nie robi — zostaje statyczny rysunek .ph-m. Bez JS, przy błędzie
// i do chwili startu też zostaje .ph-m; po pierwszej klatce .ph dostaje klasę .ph-anim-gra (telefon.css chowa wtedy .ph-m).
//
// Zasady (wspólne dla wszystkich motywów):
// - pole rysunku: od linku „←” do kreski nad liczbami z odstępem 12 px (bez liczb — do dołu banera minus 12 px);
// - maska „obrys linii”: granica zanikania liczona osobno dla każdej linii linku „←”, nadtytułu, tytułu i hasła
//   (Range.getClientRects), łagodne przejście ok. 60 px; pod hasłem maska nie sięga dalej niż przy ostatniej linii
//   tytułu, a motyw może ją jeszcze cofnąć (ustawienia.podHaslem). Maska alfa liczona raz na układ, nakładana
//   przez destination-in;
// - pętla na setTimeout (bez requestAnimationFrame); motyw sam mówi, kiedy coś się zmieni o ≥ 0,5 px, a w spoczynku
//   zegar śpi; pauza poza ekranem (IntersectionObserver) i w karcie w tle (visibilitychange);
// - prefers-reduced-motion: reduce — gotowy, nieruchomy rysunek, bez pętli; płótna najwyżej 1,5 px urządzenia na px CSS;
// - nowy układ po zmianie rozmiaru banera, po wczytaniu kroju i po wejściu treści (przejscia.css przesuwa tekst
//   o 12 px przez 0,5 s — mierzymy dopiero po końcu tej animacji), po zmianie motywu jasny/ciemny (kolor z tokenu).
import type { Linia, Modul, Motyw, Pole, Pudlo, Ustawienia } from './typy';
import { S, ogr } from './wspolne';

const MODULY = import.meta.glob<Modul>('./motywy/*.ts');
const TELEFON = matchMedia('(max-width: 760px)');
const RUCH = matchMedia('(prefers-reduced-motion: reduce)');
const DPR_MAX = 1.5;
const PUSTO = 16 - 90; // „brak tekstu w tym wierszu”: granica tak daleko w lewo, że od brzegu treści rysunek widać w pełni

const czekaj = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const widoczny = (e: Element | null): e is Element => !!e && e.getClientRects().length > 0;

/** linie tekstu elementu w układzie banera (prostokąty Range.getClientRects sklejone po wysokości) */
function linie(el: Element, bb: DOMRect): Linia[] {
  const rg = document.createRange();
  rg.selectNodeContents(el);
  const out: Linia[] = [];
  for (const q of Array.from(rg.getClientRects())) {
    if (q.width < 0.5 || q.height < 0.5) continue;
    const o = { t: q.top - bb.top, b: q.bottom - bb.top, r: q.right - bb.left };
    const z = out.find((x) => Math.abs((x.t + x.b) / 2 - (o.t + o.b) / 2) < (o.b - o.t) / 2);
    if (z) { z.t = Math.min(z.t, o.t); z.b = Math.max(z.b, o.b); z.r = Math.max(z.r, o.r); } else out.push(o);
  }
  return out.sort((a, b) => a.t - b.t);
}

/** linie wyśrodkowane na wysokość wiersza (line-height), a nie na wysokość kroju — sąsiednie wiersze się nie nakładają */
function wiersze(el: Element, bb: DOMRect): Linia[] {
  const lh = parseFloat(getComputedStyle(el).lineHeight);
  return linie(el, bb).map((l) => {
    const c = (l.t + l.b) / 2, p = Number.isFinite(lh) ? lh / 2 : (l.b - l.t) / 2;
    return { t: c - p, b: c + p, r: l.r };
  });
}

class Baner {
  private modul: Modul | null = null;
  private m: Motyw | null = null;
  private plotna: { el: HTMLCanvasElement; c: CanvasRenderingContext2D; pudlo: Pudlo | null }[] = [];
  private maska: HTMLCanvasElement | null = null;
  private sc = 1; private cT = 0;
  private t = 0; private prev: number | null = null; private ostZa = 0; private timer = 0;
  private gra = false; private naEkranie = true; private aktywny = false; private klucz = '';
  private czekaUklad = 0;

  constructor(private ph: HTMLElement, private nazwa: string) {
    // nowy pomiar dopiero po pierwszym układzie (start() sam czeka na koniec wejścia treści i na krój)
    const odswiez = () => { if (!this.m) return; clearTimeout(this.czekaUklad); this.czekaUklad = window.setTimeout(() => this.uklad(), 120); };
    new ResizeObserver(odswiez).observe(ph);
    document.fonts?.ready.then(odswiez);
    document.fonts?.addEventListener?.('loadingdone', odswiez);
    new MutationObserver(odswiez).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    new IntersectionObserver((e) => { this.naEkranie = e[e.length - 1].isIntersecting; this.ustawRuch(); }).observe(ph);
    document.addEventListener('visibilitychange', () => this.ustawRuch());
    RUCH.addEventListener('change', () => { if (this.aktywny) { this.klucz = ''; this.uklad(); } });
    TELEFON.addEventListener('change', () => (TELEFON.matches ? this.start() : this.stop()));
    if (TELEFON.matches) this.start();
  }

  private async start() {
    if (this.aktywny) return;
    this.aktywny = true;
    try {
      const wczytaj = MODULY[`./motywy/${this.nazwa}.ts`];
      if (!wczytaj) throw new Error(`nieznany motyw banera: ${this.nazwa}`);
      this.modul ??= await wczytaj();
      // tekst banera wjeżdża przez 0,5 s (przejscia.css) — mierzymy po końcu animacji i po wczytaniu kroju
      const anim = this.ph.getAnimations?.({ subtree: true }) ?? [];
      await Promise.race([Promise.all(anim.map((a) => a.finished.catch(() => {}))), czekaj(1500)]);
      if (document.fonts) await Promise.race([document.fonts.ready, czekaj(1500)]);
      if (!this.aktywny) return;
      this.klucz = '';
      this.uklad();
      this.ph.classList.add('ph-anim-gra');
    } catch (e) {
      this.stop();
      console.warn('[baner]', e);
    }
  }

  private stop() {
    this.aktywny = false;
    this.zatrzymajPetle();
    this.m = null; this.klucz = '';
    this.plotna.forEach((p) => p.el.remove());
    this.plotna = [];
    this.ph.classList.remove('ph-anim-gra');
  }

  // ---------- pomiar i maska ----------
  private zmierz(u: Ustawienia) {
    const ph = this.ph, bb = ph.getBoundingClientRect(), W = ph.clientWidth, H = ph.clientHeight;
    const q = (s: string) => { const e = ph.querySelector(s); return widoczny(e) ? e : null; };
    const wst = q('.wstecz a') ?? q('.wstecz'), brw = q('.eyebrow'), h1 = q('h1'), has = q('.ph-haslo'), lic = q('.pt-liczby');
    const y0 = Math.round(wst ? wst.getBoundingClientRect().top - bb.top + 2 : h1 ? h1.getBoundingClientRect().top - bb.top - 8 : 12);
    const y1 = Math.round((lic ? lic.getBoundingClientRect().top - bb.top : H) - 12);
    const hdr = document.querySelector<HTMLElement>('.hdr.hdr-foto');
    const menu = hdr && ph.parentElement?.firstElementChild === ph ? hdr.offsetHeight : 0;
    const gr = u.granica ?? 12;
    const tytul = h1 ? wiersze(h1, bb) : [];
    const hasla = has ? wiersze(has, bb) : [];
    // prostokąty „zakazane” dla rysunku: każda linia tekstu z granicą zanikania na prawo od jej końca
    const prz: Linia[] = [];
    if (wst) linie(wst, bb).forEach((l) => prz.push({ t: l.t, b: l.b, r: l.r + gr + 2 }));
    if (brw) linie(brw, bb).forEach((l) => prz.push({ t: l.t, b: l.b, r: l.r + gr }));
    tytul.forEach((l) => prz.push({ t: l.t, b: l.b, r: l.r + gr }));
    const ost = tytul[tytul.length - 1];
    hasla.forEach((l) => prz.push({ t: l.t, b: l.b, r: Math.min(l.r + 8, ost ? ost.r + gr : l.r + 8) - (u.podHaslem ?? 0) }));
    return { W, H, y0, y1, menu, tytul, haslo: hasla.length ? { t: hasla[0].t, b: hasla[hasla.length - 1].b, r: Math.max(...hasla.map((l) => l.r)) } : null, prz };
  }

  private uklad() {
    if (!this.aktywny || !this.modul) return;
    try { this.ukladTeraz(); } catch (e) { this.stop(); console.warn('[baner]', e); }
  }

  private ukladTeraz() {
    const u = this.modul!.ustawienia ?? {}, z = this.zmierz(u), ph = this.ph;
    const kolor = getComputedStyle(ph).getPropertyValue('--ph-rysunek').trim() || '255, 255, 255';
    const klucz = JSON.stringify([z.W, z.H, z.y0, z.y1, z.menu, z.prz.map((p) => [p.t, p.b, p.r].map(Math.round)), kolor, RUCH.matches]);
    if (klucz === this.klucz && this.m) return;
    this.klucz = klucz;
    this.zatrzymajPetle();

    // płótna: cała szerokość, w pionie od paska menu (albo pola rysunku) do dołu pola, z zapasem
    const cT = Math.max(0, Math.min(z.y0, z.menu ? z.menu + 6 : z.y0) - 6), cB = Math.min(z.H, z.y1 + 8), cH = cB - cT;
    const sc = Math.min(window.devicePixelRatio || 1, DPR_MAX), bw = Math.max(1, Math.round(z.W * sc)), bh = Math.max(1, Math.round(cH * sc));
    this.cT = cT; this.sc = sc;

    // granica zanikania w każdym wierszu pikseli: najdalszy koniec linii tekstu na tej wysokości, rozszerzony o 4 px
    // w górę i w dół i wygładzony (średnia z ±9 px), żeby przejścia między liniami były łagodne
    const n = Math.ceil(cH) + 2, g0 = new Float32Array(n).fill(PUSTO), g1 = new Float32Array(n), g = new Float32Array(n);
    for (let r = 0; r < n; r++) {
      const y = cT + r + 0.5;
      for (const p of z.prz) if (y >= p.t && y <= p.b) g0[r] = Math.max(g0[r], p.r);
    }
    for (let r = 0; r < n; r++) { let m = PUSTO; for (let i = Math.max(0, r - 4); i <= Math.min(n - 1, r + 4); i++) m = Math.max(m, g0[i]); g1[r] = m; }
    for (let r = 0; r < n; r++) {
      let s = 0, c = 0;
      for (let i = Math.max(0, r - 9); i <= Math.min(n - 1, r + 9); i++) { s += g1[i]; c++; }
      g[r] = s / c;
    }
    const w = u.przejscie ?? 60;
    const wiersz = (y: number) => g[ogr(Math.floor(y - cT), 0, n - 1)];
    const maska = (this.maska ??= document.createElement('canvas'));
    maska.width = bw; maska.height = bh;
    const mc = maska.getContext('2d')!, im = mc.createImageData(bw, bh), d = im.data;
    for (let j = 0; j < bh; j++) {
      const gg = wiersz(cT + (j + 0.5) / sc);
      for (let i = 0; i < bw; i++) d[4 * (j * bw + i) + 3] = Math.round(255 * S(((i + 0.5) / sc - gg) / w));
    }
    mc.putImageData(im, 0, 0);

    const G: Pole = {
      W: z.W, H: z.H, x0: 16, x1: z.W - 16, y0: z.y0, y1: z.y1, menu: z.menu, tytul: z.tytul, haslo: z.haslo,
      widac: (x, y) => S((x - wiersz(y)) / w),
      granica: (y) => wiersz(y),
      rgba: (a) => `rgba(${kolor},${a.toFixed(4)})`,
    };
    const m = this.modul!.default(G, this.t);
    const ile = m.rysujB ? 2 : 1;
    while (this.plotna.length > ile) this.plotna.pop()!.el.remove();
    while (this.plotna.length < ile) {
      const el = document.createElement('canvas');
      el.className = 'ph-anim';
      el.setAttribute('aria-hidden', 'true');
      ph.insertBefore(el, ph.firstChild);
      this.plotna.push({ el, c: el.getContext('2d')!, pudlo: null });
    }
    for (const p of this.plotna) {
      Object.assign(p.el.style, { top: `${cT}px`, width: `${z.W}px`, height: `${cH}px` });
      p.el.width = bw; p.el.height = bh; p.pudlo = null;
    }
    this.m = m;
    if (RUCH.matches) { m.gotowy(); this.klatka({ a: true, b: true, za: 5 }); return; }
    const k = m.krok(this.t);
    this.klatka({ a: true, b: true, za: k.za });
    this.ustawRuch();
  }

  // ---------- rysowanie ----------
  /** prostokąt w pikselach płótna (zaokrąglony na zewnątrz, przycięty do płótna) */
  private px(p: Pudlo, el: HTMLCanvasElement): [number, number, number, number] {
    const s = this.sc;
    return [Math.max(0, Math.floor(p[0] * s) - 1), Math.max(0, Math.floor((p[1] - this.cT) * s) - 1),
      Math.min(el.width, Math.ceil(p[2] * s) + 1), Math.min(el.height, Math.ceil((p[3] - this.cT) * s) + 1)];
  }

  private rysujPlotno(i: number, fn: (c: CanvasRenderingContext2D, t: number) => Pudlo | null | void) {
    const p = this.plotna[i], c = p.c, el = p.el, s = this.sc;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (p.pudlo) { const [x, y, x1, y1] = this.px(p.pudlo, el); c.clearRect(x, y, x1 - x, y1 - y); } else c.clearRect(0, 0, el.width, el.height);
    c.setTransform(s, 0, 0, s, 0, -this.cT * s);
    c.lineCap = 'round'; c.lineJoin = 'round';
    const pud = fn(c, this.t) || null;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'destination-in';
    if (pud) {
      const [x, y, x1, y1] = this.px(pud, el);
      if (x1 > x && y1 > y) c.drawImage(this.maska!, x, y, x1 - x, y1 - y, x, y, x1 - x, y1 - y);
      else c.clearRect(0, 0, el.width, el.height);
    } else c.drawImage(this.maska!, 0, 0);
    c.globalCompositeOperation = 'source-over';
    p.pudlo = pud;
  }

  private klatka(k: { a: boolean; b?: boolean; za: number }) {
    const m = this.m!;
    if (k.a) this.rysujPlotno(0, (c, t) => m.rysuj(c, t));
    if (k.b && m.rysujB && this.plotna[1]) this.rysujPlotno(1, (c, t) => m.rysujB!(c, t));
    this.ostZa = ogr(k.za, 1 / 30, 5);
  }

  // ---------- pętla ----------
  private tik = () => {
    this.timer = 0;
    if (!this.gra || !this.m) return;
    const now = performance.now();
    // czas płynie tylko wtedy, gdy pętla chodzi; limit chroni przed skokiem po uśpieniu karty
    if (this.prev !== null) this.t += Math.min(now - this.prev, this.ostZa * 1000 + 250) / 1000;
    this.prev = now;
    try { this.klatka(this.m.krok(this.t)); } catch (e) { this.stop(); console.warn('[baner]', e); return; }
    this.timer = window.setTimeout(this.tik, this.ostZa * 1000);
  };

  private ustawRuch() {
    const g = this.aktywny && !!this.m && this.naEkranie && !document.hidden && !RUCH.matches;
    if (g && !this.gra) { this.gra = true; this.prev = null; this.timer = window.setTimeout(this.tik, 0); }
    else if (!g && this.gra) this.zatrzymajPetle();
  }

  private zatrzymajPetle() {
    this.gra = false;
    clearTimeout(this.timer);
    this.timer = 0;
  }
}

document.querySelectorAll<HTMLElement>('.ph[data-animacja]').forEach((ph) => new Baner(ph, ph.dataset.animacja!));
