// Drugi ekran strony głównej (src/components/zal/DrugiEkran.astro): trzy kolumny, z których jedna (slot 2) jest długa.
// - Długa kolumna pokazuje tyle pozycji, ile się zmieści; pod nimi „i jeszcze N · Wszystkie … →” („N more · All … →”).
// - Zajawka wyróżnionej aktualności: jedna linia, a gdy się nie mieści, „… czytaj dalej” (komputer; zlecenie 18, punkt 8).
// - „Zobacz więcej” zamienia klikniętą krótką kolumnę z długą: płynne przejście FLIP (0,35 s — jeden rytm,
//   zlecenie 13, punkt 9), kolejne pozycje rozwiniętej listy pojawiają się po kolei. Przy prefers-reduced-motion — od razu, z krótkim rozjaśnieniem kolumn, które zmieniły
//   miejsce. Fokus zawsze przechodzi na nagłówek rozwiniętej kolumny (klawiatura, czytniki ekranu).
// - Wydarzenia, które już się skończyły, znikają od razu w przeglądarce (zlecenie 06, punkt 4).
import { hasTime, now, today } from '../../lib/daty';
import { MQ_TELEFON } from '../../lib/media';

const siatka = document.querySelector<HTMLElement>('[data-z-siatka]');
// Telefon (≤ 760 px): na wąskim ekranie kolumny stoją jedna pod drugą, „Zobacz więcej” rozwija listę w miejscu
const TELEFON = matchMedia(MQ_TELEFON);
// jeden rytm ruchu (zlecenie 13, punkt 9; --rytm w global.css)
const RYTM = 'cubic-bezier(.22, .8, .2, 1)';

// Strona przebudowuje się 2× dziennie, więc po usunięciu zakończonych liczymy widok od nowa: CSS pokazuje pierwsze trzy
// pozostałe, N w „Zobacz więcej (N)” jest aktualne, przy ≤ 3 nie ma przycisku, przy 0 pokazuje się komunikat.
function schowajZakonczone() {
  const kol = siatka?.querySelector<HTMLElement>('.z-kolumna[data-key="wyd"]');
  if (!kol) return;
  const n = now(), d = today();
  kol.querySelectorAll<HTMLElement>('[data-koniec]').forEach((w) => {
    const koniec = w.dataset.koniec || '';
    if (koniec && (hasTime(koniec) ? koniec < n : koniec < d)) w.remove();
  });
  const zostalo = kol.querySelectorAll('.z-w').length;
  const przycisk = kol.querySelector('.z-wiecej');
  if (zostalo <= 3) przycisk?.remove();
  else { const ile = przycisk?.querySelector('.z-ile'); if (ile) ile.textContent = String(zostalo - 3); }
  if (!zostalo) kol.querySelector('.z-pusto')?.removeAttribute('hidden');
}

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

// dopisek bez znaczenia dla czytnika ekranu, bo klikalny jest cały wiersz; tolerancja 1 px na zaokrąglenie wysokości linii
function dalej() {
  if (!siatka) return;
  siatka.querySelectorAll<HTMLElement>('.z-w.wyr .zaj').forEach((z) => {
    const d = z.querySelector('.dalej');
    const ucieta = !TELEFON.matches && z.scrollHeight > z.clientHeight + 1;
    if (ucieta && !d) {
      const s = document.createElement('span');
      s.className = 'dalej';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = siatka.dataset.dalej ?? '';
      z.append(s);
    } else if (!ucieta && d) d.remove();
  });
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
  // w krótkiej kolumnie wszystkie pozycje z powrotem widoczne (CSS i tak pokazuje pierwsze trzy, przy powiększonym wpisie dwa)
  dluga.querySelectorAll<HTMLElement>('.z-w').forEach((w) => { w.hidden = false; });
  dopasujDluga();
  kliknieta.querySelector<HTMLElement>('.z-h h2')?.focus({ preventScroll: true });
  const bezRuchu = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const el of [kliknieta, dluga]) {
    const o = stare.get(el)!, n = el.getBoundingClientRect();
    const dx = o.left - n.left, dy = o.top - n.top;
    if (bezRuchu) { el.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 150, easing: RYTM }); continue; }
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    if (el === kliknieta) el.style.zIndex = '2';
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 350, easing: RYTM })
      .finished.then(() => { el.style.zIndex = ''; }).catch(() => {});
  }
  if (bezRuchu) return;
  Array.from(kliknieta.querySelectorAll<HTMLElement>('.z-w:not([hidden])')).slice(kliknieta.querySelector('.z-w.wyr') ? 2 : 3).forEach((w, i) =>
    w.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 250, delay: 250 + i * 35, easing: RYTM, fill: 'backwards' }));
}

if (siatka) {
  schowajZakonczone();
  siatka.querySelectorAll<HTMLButtonElement>('.z-wiecej').forEach((b) => b.addEventListener('click', () => zamien(b.dataset.key || '')));
  const dopasuj = () => { dopasujDluga(); dalej(); };
  new ResizeObserver(dopasuj).observe(siatka);
  document.fonts?.ready.then(dopasuj);
}
