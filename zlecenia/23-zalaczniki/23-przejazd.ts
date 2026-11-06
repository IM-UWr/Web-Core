// Strona główna: okładka i Szybki dostęp (zlecenie 23, punkt 2 — telefon, tablet i komputer; zastępuje zlecenie 11, zalecenie 20
// oraz zlecenie 21, punkty 3 i 9).
// Dwa stany: okładka (strona się nie przewija) albo Szybki dostęp (okładki nie ma w układzie — html.bez-okladki — zwykłe przewijanie).
// - Z okładki na Szybki dostęp „na próg”: palec (dotyk) albo kółko / gładzik (komputer) przesuwa okładkę i treść Szybkiego dostępu
//   z oporem (--z-opor; za progiem połowa oporu), strzałka jaśnieje i podjeżdża (--z-postep), za progiem obraca grot w górę.
//   Próg: --z-prog × wysokość okna drogi palca albo sumy ruchu kółka. Prędkość się nie liczy. Puszczenie palca za progiem
//   (kółko: samo przekroczenie progu) — odjazd do końca; przed progiem — powrót (palec puszczony, kółko w spoczynku KOLKO_CISZA ms).
// - Od razu, bez progu: strzałka i liczby nad nią, klawisze w dół (PgDn, spacja, ↓, End), fokus w Szybkim dostępie.
// - Z Szybkiego dostępu na okładkę: tylko link do strony głównej w pasku (telefon: nazwa Instytutu, komputer: znak z nazwą) — strona
//   na górę, okładka zjeżdża. Przewijanie w górę kończy się na górze Szybkiego dostępu; klawisze w górę też nie wracają.
// - Historia: znacznik zBezOkladki w history.state; „wstecz” i odświeżenie wracają tam, skąd się wyszło (skrypt w linii w Okladka.astro
//   chowa okładkę przed pierwszym układem), położenie odtwarza przeglądarka. Nowe wejście — okładka.
// - Przewinięcie „z zewnątrz” na okładce (pasek przewijania, szukanie, czytnik ekranu, kotwica): w spoczynku od połowy drogi —
//   Szybki dostęp, wcześniej — z powrotem na okładkę.
// - Okładka nie mieści się w oknie (bardzo niskie okno, telefon w poziomie): bez progu, zwykłe przewijanie; okładka chowa się dopiero
//   na krawędzi Szybkiego dostępu, w spoczynku.
// - Dotyk: na okładce touch-action: pinch-zoom (klasa html.z-prog, zalozyciele-strony.css), więc bez JS przewija się zwyczajnie.
//   Nasłuchy dotyku pasywne. Kółko: nasłuch niepasywny tylko na tej stronie (zatrzymuje przewijanie okładki).
// - prefers-reduced-motion: przesunięcie za palcem / kółkiem zostaje, przejścia natychmiastowe.
// Liczby nad strzałką (zalecenie 15): odjazd i krótkie (1,6 s) podświetlenie kolumny.
const okladka = document.querySelector<HTMLElement>('.z-okladka');
const obszar = document.getElementById('szybki-dostep');

if (okladka && obszar) {
  const html = document.documentElement;
  const BEZ_RUCHU = matchMedia('(prefers-reduced-motion: reduce)');
  const DOTYK = matchMedia('(hover: none) and (pointer: coarse)');
  const ODJAZD = 400; // ms
  const POWROT = 300; // ms
  const KOLKO_CISZA = 260; // ms bez ruchu kółka — powrót, jeśli próg nie został przekroczony
  const KOLKO_PODAZANIE = 140; // ms — wygładzenie przesunięcia za kółkiem
  const WYGASZANIE = 350; // ms — po odjeździe rozpęd gładzika nie przewija Szybkiego dostępu
  const naglowek = document.querySelector<HTMLElement>('.hdr'); // telefon: przyklejony nagłówek; komputer: brak (offsetHeight 0)
  const strzalka = okladka.querySelector<HTMLElement>('.z-strzalka');
  const dzialy = okladka.querySelector<HTMLElement>('.z-okl-dzialy');

  let schowana = html.classList.contains('bez-okladki');
  let animacja = false;
  let ciagPx = 0; // bieżące przesunięcie okładki i treści Szybkiego dostępu (transform, nie przewinięcie)
  let ciag: { y0: number; d: number } | null = null; // palec
  let kolko = 0; // suma ruchu kółka w dół na okładce
  let kolkoZegar = 0;
  let wygaszanieDo = 0;
  let wcisniety = false;

  const zmienna = (nazwa: string, domyslna: number) => {
    const v = parseFloat(getComputedStyle(html).getPropertyValue(nazwa));
    return Number.isFinite(v) && v > 0 ? v : domyslna;
  };
  const prog = () => zmienna('--z-prog', 1 / 3) * window.innerHeight;
  // odległość od okładki do Szybkiego dostępu (obszar sam się nie przesuwa, przesuwa się jego treść)
  const y1 = () => Math.max(0, Math.round(obszar.getBoundingClientRect().top + window.scrollY - (naglowek?.offsetHeight || 0)));
  // okładka jest z założenia dłuższa niż okno (punkt 5) — liczy się dół bloku działów na górze strony
  const miesci = () => !dzialy || dzialy.getBoundingClientRect().bottom + ciagPx + window.scrollY <= window.innerHeight + 1;
  const naOkladce = () => !schowana && miesci();
  const ustawProg = () => { html.classList.toggle('z-prog', DOTYK.matches && naOkladce()); };
  // pasek (pasek.ts) przelicza kolor przy przewinięciu; schowanie okładki na górze strony nie przewija, więc dajemy znać sami
  const powiadomPasek = () => window.dispatchEvent(new Event('scroll'));

  const znacznik = (ustaw: boolean) => {
    const { zBezOkladki: _, ...stan } = history.state ?? {};
    history.replaceState(ustaw ? { ...stan, zBezOkladki: true } : stan, '');
  };
  function schowaj() {
    const d = y1();
    if (d <= 0) return;
    const y = window.scrollY;
    html.classList.add('bez-okladki', 'bez-wejscia'); // bez-wejscia: po przywróceniu z display: none powtórzyłoby się wejście strony (przejscia.css)
    window.scrollTo({ top: Math.max(0, y - d), behavior: 'instant' });
    schowana = true;
    znacznik(true);
    ustawProg();
    powiadomPasek();
  }
  function pokaz() {
    const y = window.scrollY;
    html.classList.remove('bez-okladki');
    window.scrollTo({ top: y + y1(), behavior: 'instant' });
    schowana = false;
    znacznik(false);
    ustawProg();
    powiadomPasek();
  }

  // ---------- przesunięcie okładki (palec, kółko, odjazd, powrót) ----------
  const przesun = (px: number, postep: number) => {
    ciagPx = px;
    html.style.setProperty('--z-ciag', `${px.toFixed(1)}px`);
    html.style.setProperty('--z-postep', Math.min(1, Math.max(0, postep)).toFixed(3));
    strzalka?.classList.toggle('z-za-progiem', postep >= 1);
  };
  const zOporem = (d: number) => {
    const p = prog(), opor = zmienna('--z-opor', 0.55);
    return Math.min(d <= p ? d * opor : p * opor + (d - p) * opor * 0.55, y1());
  };
  const koniecCiagu = () => {
    ciagPx = 0;
    html.classList.remove('z-ciagnie', 'z-jedzie');
    html.style.removeProperty('--z-ciag');
    html.style.removeProperty('--z-postep');
    html.style.removeProperty('--z-czas');
    strzalka?.classList.remove('z-za-progiem');
  };
  // płynne dojście do położenia: przejście CSS na transform (klasa z-jedzie), zapasowo zegar
  function dojedz(doPx: number, postep: number, czas: number, potem: () => void) {
    html.classList.add('z-ciagnie');
    if (BEZ_RUCHU.matches || czas <= 0) { przesun(doPx, postep); potem(); return; }
    animacja = true;
    html.style.setProperty('--z-czas', `${czas}ms`);
    void okladka.offsetWidth; // styl bieżącego położenia, zanim zmieni się wartość — przejście rusza stąd
    html.classList.add('z-jedzie');
    przesun(doPx, postep);
    let zrobione = false;
    const skoncz = () => { if (zrobione) return; zrobione = true; animacja = false; potem(); };
    okladka.addEventListener('transitionend', (e) => { if (e.target === okladka && e.propertyName === 'transform') skoncz(); });
    window.setTimeout(skoncz, czas + 120);
  }
  function przejdz(natychmiast = false) {
    if (schowana || animacja) return;
    ciag = null;
    kolko = 0;
    clearTimeout(kolkoZegar);
    if (window.scrollY > 1) window.scrollTo({ top: 0, behavior: 'instant' });
    // najpierw bez przesunięcia, potem schowanie — w tej samej klatce, więc nic nie skacze
    dojedz(y1(), 1, natychmiast ? 0 : ODJAZD, () => { koniecCiagu(); schowaj(); });
  }
  function wroc() { kolko = 0; dojedz(0, 0, POWROT, koniecCiagu); }
  // link do strony głównej w pasku: strona na górę, okładka zjeżdża z góry
  function naOkladke() {
    const plynnie = BEZ_RUCHU.matches ? 'instant' : 'smooth';
    if (!schowana) { window.scrollTo({ top: 0, behavior: plynnie }); return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
    pokaz(); // okładka nad Szybkim dostępem, widok bez zmian
    window.scrollTo({ top: 0, behavior: plynnie });
  }

  // ---------- palec ----------
  window.addEventListener('touchstart', (e) => {
    if (ciag && e.touches.length > 1) { ciag = null; wroc(); return; } // drugi palec: szczypanie
    if (!html.classList.contains('z-prog') || animacja || html.classList.contains('menu-otwarte') || e.touches.length !== 1) return;
    const t = e.target instanceof Element ? e.target : null;
    if (!t?.closest('.z-okladka, .hdr') || t.closest('.z-menu')) return;
    ciag = { y0: e.touches[0].clientY, d: 0 };
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!ciag) return;
    if (e.touches.length !== 1) { ciag = null; wroc(); return; }
    const d = Math.max(0, ciag.y0 - e.touches[0].clientY);
    ciag.d = d;
    if (d > 2) html.classList.add('z-ciagnie');
    przesun(zOporem(d), d / prog());
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (!ciag) return;
    const { d } = ciag;
    ciag = null;
    if (d >= prog()) przejdz();
    else if (d > 2) wroc();
    else koniecCiagu();
  }, { passive: true });
  window.addEventListener('touchcancel', () => { if (ciag) { ciag = null; wroc(); } }, { passive: true });

  // ---------- kółko i gładzik ----------
  // czy zdarzenie przewinie najpierw coś wewnątrz (np. długi panel menu)
  function przewijaWewnatrz(el: EventTarget | null, dy: number): boolean {
    for (let n = el instanceof Element ? el : null; n && n !== document.body && n !== html; n = n.parentElement) {
      if (n.scrollHeight <= n.clientHeight + 1) continue;
      const o = getComputedStyle(n).overflowY;
      if (o !== 'auto' && o !== 'scroll') continue;
      if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
    }
    return false;
  }
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return; // Ctrl + kółko / szczypanie = powiększanie
    const teraz = performance.now();
    // po odjeździe: rozpęd gładzika wygasa, zanim Szybki dostęp zacznie się przewijać
    if (teraz < wygaszanieDo) { e.preventDefault(); wygaszanieDo = teraz + 120; return; }
    if (!naOkladce()) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1);
    const t = e.target instanceof Element ? e.target : null;
    if (t?.closest('.z-menu') || przewijaWewnatrz(t, dy)) return; // panel menu przewija się sam
    e.preventDefault();
    if (animacja || html.classList.contains('menu-otwarte') || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    kolko = Math.max(0, kolko + dy);
    clearTimeout(kolkoZegar);
    if (kolko >= prog()) { przejdz(); wygaszanieDo = teraz + WYGASZANIE; return; }
    html.style.setProperty('--z-czas', `${KOLKO_PODAZANIE}ms`);
    html.classList.add('z-ciagnie', 'z-jedzie');
    przesun(zOporem(kolko), kolko / prog());
    kolkoZegar = window.setTimeout(() => { if (kolko > 0) wroc(); }, KOLKO_CISZA);
  }, { passive: false });

  // ---------- klawisze na okładce ----------
  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !naOkladce()) return;
    const k = e.key;
    const dol = k === 'PageDown' || k === 'ArrowDown' || k === 'End' || (k === ' ' && !e.shiftKey);
    const gora = k === 'PageUp' || k === 'ArrowUp' || k === 'Home' || (k === ' ' && e.shiftKey);
    if (!dol && !gora) return;
    if (html.classList.contains('menu-otwarte')) return; // otwarty panel menu: klawisze należą do niego
    const t = e.target instanceof Element ? e.target : null;
    if (t?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="listbox"], [role="menu"], [role="tablist"]')) return;
    if (k === ' ' && t?.closest('button, summary, [role="button"]')) return; // spacja naciska przycisk
    e.preventDefault();
    if (dol && !e.repeat) przejdz();
  });

  // ---------- kliknięcia ----------
  // strzałka „Szybki dostęp” i liczby nad nią (zalecenie 15)
  okladka.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('.z-strzalka, .z-okl-liczby a') : null;
    if (!a) return;
    e.preventDefault();
    if (miesci()) przejdz();
    else window.scrollTo({ top: y1(), behavior: BEZ_RUCHU.matches ? 'instant' : 'smooth' });
    const key = a.dataset.kol;
    const kol = key ? document.querySelector<HTMLElement>(`.z-kolumna[data-key="${key}"]`) : null;
    // fokus tam, dokąd prowadzi link: nagłówek kolumny albo początek drugiego ekranu
    (kol?.querySelector<HTMLElement>('.z-h h2') ?? obszar).focus({ preventScroll: true });
    if (!kol) return;
    window.setTimeout(() => {
      kol.classList.remove('z-podswietl');
      void kol.offsetWidth; // od nowa, gdy kliknięto drugi raz
      kol.classList.add('z-podswietl');
      window.setTimeout(() => kol.classList.remove('z-podswietl'), 1600);
    }, BEZ_RUCHU.matches ? 0 : 450);
  });
  // link do tej samej strony (bez kotwicy) w pasku — przed innymi nasłuchami kliknięć
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.closest('.z-okladka')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || url.hash) return;
    e.preventDefault();
    naOkladke();
  }, true);

  // ---------- dostępność i przewijanie „z zewnątrz” ----------
  // fokus z klawiatury albo czytnika w Szybkim dostępie przy widocznej okładce (fokus z kliknięcia strzałki — już po przejściu)
  obszar.addEventListener('focusin', () => { if (naOkladce() && !ciag && !animacja) przejdz(true); });
  let czasSpokoju = 0;
  const wSpoczynku = () => {
    if (schowana || ciag || animacja || kolko > 0 || wcisniety || html.classList.contains('menu-otwarte')) return;
    const y = window.scrollY, Y1 = y1();
    if (y <= 1) return;
    if (!miesci()) { if (y >= Y1 - 1) schowaj(); return; }
    if (y >= Y1 / 2) { window.scrollTo({ top: Y1, behavior: 'instant' }); schowaj(); }
    else window.scrollTo({ top: 0, behavior: BEZ_RUCHU.matches ? 'instant' : 'smooth' });
  };
  window.addEventListener('scroll', () => { clearTimeout(czasSpokoju); czasSpokoju = window.setTimeout(wSpoczynku, 150); }, { passive: true });
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') wcisniety = true; }, { passive: true });
  window.addEventListener('pointerup', () => { if (wcisniety) { wcisniety = false; wSpoczynku(); } }, { passive: true });

  window.addEventListener('hashchange', () => {
    if (!schowana) return;
    if (location.hash === '#okladka') naOkladke();
    else znacznik(true); // nowy wpis w historii nie ma znacznika
  });
  window.addEventListener('pageshow', () => { schowana = html.classList.contains('bez-okladki'); ustawProg(); });
  window.addEventListener('resize', ustawProg);
  new ResizeObserver(ustawProg).observe(okladka);
  document.fonts?.ready.then(ustawProg);
  DOTYK.addEventListener('change', ustawProg);
  ustawProg();
}
