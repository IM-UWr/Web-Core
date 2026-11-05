// Okładka strony głównej na komputer (src/components/zal/Okladka.astro).
// 1. Blok tytułu jako całość: „Instytut” i „Matematyczny” zaczynają się od lewej, a ich prawe końce leżą na jednej
//    prostej o nachyleniu s (px w prawo na px w dół). Dobieramy stopień „Matematyczny” do „Instytut” (logo UWr jest od
//    zlecenia 11 w górnej linii okładki, nie w bloku tytułu). Ta prosta (plus odstęp) to granica ciemnego pola po skosie;
//    za nią krótki gradient w zdjęcie (jak w prototypie).
// 2. Barwienie (zlecenie 11, zalecenie 1): po najechaniu kursorem albo fokusie na dział całe zdjęcie lekko barwi się na
//    jasny kolor tego działu (warstwa .z-barwa, soft-light, 50%; przejście 0,6 s, bez przejścia przy ograniczonym ruchu).
//    Kolor (--d-j) bierze warstwa z własnego data-dzial — reszta okładki zostaje w swoich kolorach. Telefon bez zmian.
// Strzałka „Szybki dostęp”, liczby nad nią i przejazd okładka ↔ drugi ekran: src/scripts/zal/przejazd.ts.
// Hamburger i panel menu: src/scripts/zal/menu.ts.
const ok = document.querySelector<HTMLElement>('.z-okladka');
const S = 0.32;

function uloz() {
  if (!ok || !ok.offsetHeight || matchMedia('(max-width: 760px)').matches) return; // telefon: bez skosu
  const tyt = ok.querySelector<HTMLElement>('.z-okl-tytul');
  const w1 = ok.querySelector<HTMLElement>('.w1');
  const w2 = ok.querySelector<HTMLElement>('.w2');
  if (!tyt || !w1 || !w2) return;
  const H = ok.clientHeight, W = ok.clientWidth;
  tyt.style.removeProperty('--f2');
  const f1 = parseFloat(getComputedStyle(w1).fontSize);
  const o = ok.getBoundingClientRect();
  const b = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return { x2: r.right - o.left, yc: (r.top + r.bottom) / 2 - o.top }; };
  const lewa = tyt.getBoundingClientRect().left - o.left;
  // Po angielsku („Mathematical / Institute”) drugie słowo jest krótsze od pierwszego — dociągnięte do skosu byłoby
  // większe od pierwszego, a logo ogromne. Wtedy zostają stopnie z CSS, a skos liczymy od końca pierwszej linii.
  const wyrownaj = (w2.textContent ?? '').trim().length >= (w1.textContent ?? '').trim().length;
  for (let i = 0; wyrownaj && i < 4; i++) {
    const A = b(w1), M = b(w2);
    const f2 = parseFloat(getComputedStyle(w2).fontSize);
    const celM = A.x2 + S * (M.yc - A.yc);
    tyt.style.setProperty('--f2', Math.max(24, (f2 * (celM - lewa)) / (M.x2 - lewa)) + 'px');
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

  const barwa = ok.querySelector<HTMLElement>('.z-barwa');
  const telefon = matchMedia('(max-width: 760px)');
  if (barwa) ok.querySelectorAll<HTMLElement>('.z-okl-dz').forEach((dz) => {
    const wlacz = () => { if (telefon.matches) return; barwa.dataset.dzial = dz.dataset.dzial || ''; ok.classList.add('zabarwione'); };
    const wylacz = () => ok.classList.remove('zabarwione');
    dz.addEventListener('mouseenter', wlacz);
    dz.addEventListener('mouseleave', wylacz);
    dz.addEventListener('focus', wlacz);
    dz.addEventListener('blur', wylacz);
  });
}
