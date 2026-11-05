// Drugi ekran strony głównej (src/components/zal/DrugiEkran.astro): trzy kolumny, z których jedna (slot 2) jest długa.
// - Długa kolumna pokazuje tyle pozycji, ile się zmieści; pod nimi „i jeszcze N · Wszystkie … →” („N more · All … →”).
// - „Zobacz więcej” zamienia klikniętą krótką kolumnę z długą: płynne przejście FLIP (0,52 s), kolejne pozycje rozwiniętej
//   listy pojawiają się po kolei. Przy prefers-reduced-motion — od razu, z krótkim rozjaśnieniem kolumn, które zmieniły
//   miejsce. Fokus zawsze przechodzi na nagłówek rozwiniętej kolumny (klawiatura, czytniki ekranu).
const siatka = document.querySelector<HTMLElement>('[data-z-siatka]');
// Telefon (≤ 760 px): na wąskim ekranie kolumny stoją jedna pod drugą, „Zobacz więcej” rozwija listę w miejscu
const TELEFON = matchMedia('(max-width: 760px)');

function dopasujDluga() {
  if (!siatka || !siatka.offsetHeight || TELEFON.matches) return;
  const kol = siatka.querySelector<HTMLElement>('.z-kolumna[data-slot="2"]');
  if (!kol) return;
  const box = kol.querySelector<HTMLElement>('.pozycje');
  const link = kol.querySelector<HTMLAnchorElement>('.reszta');
  if (!box || !link) return;
  const wiersze = Array.from(box.querySelectorAll<HTMLElement>('.z-w'));
  wiersze.forEach((w) => { w.hidden = false; });
  const limit = box.clientHeight;
  let ukryte = 0;
  wiersze.forEach((w) => {
    if (ukryte || w.offsetTop - box.offsetTop + w.offsetHeight > limit + 1) { w.hidden = true; ukryte++; }
  });
  // data-wiecej: wzór z {n} („i jeszcze {n}”, po angielsku „{n} more” — liczba przed słowem)
  link.textContent = ukryte ? `${(link.dataset.wiecej || '{n}').replace('{n}', String(ukryte))} · ${link.dataset.wsz}` : link.dataset.wsz || '';
}

function zamien(key: string) {
  if (!siatka) return;
  if (TELEFON.matches) {
    const kol = siatka.querySelector<HTMLElement>(`.z-kolumna[data-key="${key}"]`);
    kol?.classList.add('z-rozwin');
    kol?.querySelector<HTMLElement>('.z-h h2')?.focus({ preventScroll: true });
    return;
  }
  const kliknieta = siatka.querySelector<HTMLElement>(`.z-kolumna[data-key="${key}"]`);
  const dluga = siatka.querySelector<HTMLElement>('.z-kolumna[data-slot="2"]');
  if (!kliknieta || !dluga || kliknieta === dluga) return;
  const kolumny = Array.from(siatka.querySelectorAll<HTMLElement>('.z-kolumna'));
  const stare = new Map(kolumny.map((el) => [el, el.getBoundingClientRect()]));
  const slot = kliknieta.dataset.slot!;
  kliknieta.dataset.slot = '2';
  dluga.dataset.slot = slot;
  // w krótkiej kolumnie wszystkie pozycje z powrotem widoczne (CSS i tak pokazuje pierwsze trzy)
  dluga.querySelectorAll<HTMLElement>('.z-w').forEach((w) => { w.hidden = false; });
  dopasujDluga();
  kliknieta.querySelector<HTMLElement>('.z-h h2')?.focus({ preventScroll: true });
  const bezRuchu = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const el of [kliknieta, dluga]) {
    const o = stare.get(el)!, n = el.getBoundingClientRect();
    const dx = o.left - n.left, dy = o.top - n.top;
    if (bezRuchu) { el.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' }); continue; }
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    if (el === kliknieta) el.style.zIndex = '2';
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.22,.8,.2,1)' })
      .finished.then(() => { el.style.zIndex = ''; }).catch(() => {});
  }
  if (bezRuchu) return;
  Array.from(kliknieta.querySelectorAll<HTMLElement>('.z-w:not([hidden])')).slice(3).forEach((w, i) =>
    w.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 380 + i * 45, easing: 'ease-out', fill: 'backwards' }));
}

if (siatka) {
  siatka.querySelectorAll<HTMLButtonElement>('.z-wiecej').forEach((b) => b.addEventListener('click', () => zamien(b.dataset.key || '')));
  new ResizeObserver(() => dopasujDluga()).observe(siatka);
  document.fonts?.ready.then(dopasujDluga);
}
