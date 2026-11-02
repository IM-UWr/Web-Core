// Okładka strony głównej na komputer (src/components/zal/Okladka.astro).
// 1. Blok tytułu jako całość: logo, „Instytut” i „Matematyczny” zaczynają się od lewej, a ich prawe końce leżą na jednej
//    prostej o nachyleniu s (px w prawo na px w dół). Dobieramy wysokość logo i stopień „Matematyczny” do „Instytut”.
//    Ta prosta (plus odstęp) to granica ciemnego pola po skosie; za nią krótki gradient w zdjęcie (jak w prototypie).
// 2. Hamburger: panel z prawej (Esc i klik obok zamykają, fokus wraca na przycisk).
// 3. Strzałka „Szybki dostęp”: przewinięcie do drugiego ekranu (bez animacji przy prefers-reduced-motion).
const ok = document.querySelector<HTMLElement>('.z-okladka');
const S = 0.32;

function uloz() {
  if (!ok || !ok.offsetHeight) return; // telefon: okładka schowana
  const tyt = ok.querySelector<HTMLElement>('.z-okl-tytul');
  const w1 = ok.querySelector<HTMLElement>('.w1');
  const w2 = ok.querySelector<HTMLElement>('.w2');
  const logo = ok.querySelector<HTMLElement>('.z-okl-logo');
  if (!tyt || !w1 || !w2 || !logo) return;
  const H = ok.clientHeight, W = ok.clientWidth;
  tyt.style.removeProperty('--f2');
  tyt.style.removeProperty('--logo-h');
  const f1 = parseFloat(getComputedStyle(w1).fontSize);
  const o = ok.getBoundingClientRect();
  const b = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return { x2: r.right - o.left, yc: (r.top + r.bottom) / 2 - o.top }; };
  const lewa = tyt.getBoundingClientRect().left - o.left;
  // Po angielsku („Mathematical / Institute”) drugie słowo jest krótsze od pierwszego — dociągnięte do skosu byłoby
  // większe od pierwszego, a logo ogromne. Wtedy zostają stopnie z CSS, a skos liczymy od końca pierwszej linii.
  const wyrownaj = (w2.textContent ?? '').trim().length >= (w1.textContent ?? '').trim().length;
  for (let i = 0; wyrownaj && i < 4; i++) {
    const L = b(logo), A = b(w1), M = b(w2);
    const f2 = parseFloat(getComputedStyle(w2).fontSize);
    const celM = A.x2 + S * (M.yc - A.yc);
    tyt.style.setProperty('--f2', Math.max(24, (f2 * (celM - lewa)) / (M.x2 - lewa)) + 'px');
    const celL = A.x2 - S * (A.yc - L.yc);
    tyt.style.setProperty('--logo-h', Math.max(34, (celL - lewa) / 3.125) + 'px');
  }
  // prosta przez końce „Instytut” i „Matematyczny”: x(y) = x0 + s·y
  const A = b(w1);
  const odstep = Math.max(24, f1 * 0.34), zanik = Math.max(90, W * 0.06);
  const x0 = A.x2 - S * A.yc + odstep * Math.sqrt(1 + S * S);
  // gradient prostopadły do prostej: n = (1, −s)/|·|, kąt CSS = atan2(n.x, −n.y)
  const nl = Math.hypot(1, S), n = [1 / nl, -S / nl], kat = (Math.atan2(n[0], -n[1]) * 180) / Math.PI;
  const dl = W * Math.abs(n[0]) + H * Math.abs(n[1]);
  const start = [W / 2 - (n[0] * dl) / 2, H / 2 - (n[1] * dl) / 2];
  const t1 = (x0 - start[0]) * n[0] + (0 - start[1]) * n[1];
  const g = 'rgb(9 16 34', st: [number, number][] = [[0, 0.97], [0.2, 0.86], [0.42, 0.6], [0.64, 0.32], [0.84, 0.1], [1, 0]];
  ok.style.setProperty('--skos', `linear-gradient(${kat.toFixed(2)}deg, ${g} / .97) 0px, ${st.map(([u, a]) => `${g} / ${a}) ${(t1 + u * zanik).toFixed(1)}px`).join(', ')})`);
  // zdjęcie zaczyna się tak, żeby jego lewa krawędź (z krótką maską) była schowana w pełnym ciemnym polu
  ok.style.setProperty('--foto-x', Math.max(0, x0 - 150) + 'px');
  ok.classList.add('z-ulozona');
}

if (ok) {
  new ResizeObserver(() => uloz()).observe(ok);
  document.fonts?.ready.then(uloz);

  const menu = ok.querySelector<HTMLElement>('#z-menu');
  const burger = ok.querySelector<HTMLButtonElement>('#z-burger');
  const zamknij = ok.querySelector<HTMLButtonElement>('#z-zamknij');
  const ustaw = (otw: boolean) => {
    if (!menu || !burger) return;
    menu.classList.toggle('otwarte', otw);
    burger.setAttribute('aria-expanded', String(otw));
    (otw ? zamknij : burger)?.focus();
  };
  burger?.addEventListener('click', () => ustaw(true));
  zamknij?.addEventListener('click', () => ustaw(false));
  ok.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.classList.contains('otwarte')) ustaw(false); });
  document.addEventListener('click', (e) => {
    const cel = e.target as Element;
    if (menu?.classList.contains('otwarte') && !cel.closest('#z-menu, #z-burger')) ustaw(false);
  });

  // wejście w dział z okładki: na stronie działu szkic jest już narysowany (przylatuje w przejściu), dopisuje się podpis
  ok.querySelectorAll<HTMLAnchorElement>('.z-okl-dz').forEach((a) => a.addEventListener('click', () => {
    try { sessionStorage.setItem('im-z-okladki', a.dataset.dzial || ''); } catch {}
  }));

  const strzalka = ok.querySelector<HTMLAnchorElement>('.z-strzalka');
  strzalka?.addEventListener('click', (e) => {
    const cel = document.querySelector<HTMLElement>(strzalka.getAttribute('href') || '');
    if (!cel) return;
    e.preventDefault();
    const ruch = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: cel.getBoundingClientRect().top + window.scrollY, behavior: ruch ? 'smooth' : 'auto' });
    cel.setAttribute('tabindex', '-1');
    cel.focus({ preventScroll: true });
  });
}
