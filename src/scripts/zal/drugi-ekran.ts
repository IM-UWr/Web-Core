// Drugi ekran strony głównej (src/components/zal/DrugiEkran.astro): trzy kolumny, z których jedna (slot 2) jest długa.
// - Długa kolumna pokazuje tyle pozycji, ile się zmieści; pod nimi „i jeszcze N · Wszystkie … →” („N more · All … →”).
// - Zajawka wyróżnionej aktualności: jedna linia, a gdy się nie mieści, „… czytaj dalej” (komputer; zlecenie 18, punkt 8).
// - „Zobacz więcej” zamienia klikniętą krótką kolumnę z długą: płynne przejście FLIP (0,35 s — jeden rytm,
//   zlecenie 13, punkt 9), kolejne pozycje rozwiniętej listy pojawiają się po kolei. Przy prefers-reduced-motion — od razu, z krótkim rozjaśnieniem kolumn, które zmieniły
//   miejsce. Fokus zawsze przechodzi na nagłówek rozwiniętej kolumny (klawiatura, czytniki ekranu).
// - Wydarzenia, które już się skończyły, znikają od razu w przeglądarce (zlecenie 06, punkt 4).
// - Na niskim oknie komputera drabinka wysokości (zlecenie 26, punkt 3): kolejno ustępują stopka, „Warto wiedzieć” i trzecia pozycja krótkich kolumn.
import { hasTime, now, today } from '../../lib/daty';
import { MQ_TELEFON } from '../../lib/media';

const siatka = document.querySelector<HTMLElement>('[data-z-siatka]');
// Telefon (≤ 1023 px): na wąskim ekranie kolumny stoją jedna pod drugą, „Zobacz więcej” rozwija listę w miejscu
const TELEFON = matchMedia(MQ_TELEFON);
// jeden rytm ruchu (zlecenie 13, punkt 9; --rytm w global.css)
const RYTM = 'cubic-bezier(.22, .8, .2, 1)';

const druga = siatka?.closest<HTMLElement>('.z-druga') ?? null;

// Strona przebudowuje się 2× dziennie, więc po usunięciu zakończonych liczymy widok od nowa: CSS pokazuje pierwsze trzy
// pozostałe, N w „Zobacz więcej (N)” liczy liczWiecej(), przy 0 pokazuje się komunikat.
function schowajZakonczone() {
  const kol = siatka?.querySelector<HTMLElement>('.z-kolumna[data-key="wyd"]');
  if (!kol) return;
  const n = now(), d = today();
  kol.querySelectorAll<HTMLElement>('[data-koniec]').forEach((w) => {
    const koniec = w.dataset.koniec || '';
    if (koniec && (hasTime(koniec) ? koniec < n : koniec < d)) w.remove();
  });
  if (!kol.querySelector('.z-w')) kol.querySelector('.z-pusto')?.removeAttribute('hidden');
}

// „Zobacz więcej (N)”: N = pozycje, których krótka kolumna nie pokazuje. Komputer: 3, z powiększonym wpisem 2, na niskim oknie (krok 3 drabinki) o jedną mniej;
// telefon: zawsze 3 (.z-ile-k i .z-ile-t, CSS pokazuje właściwą). Bez ukrytych pozycji przycisk znika.
function liczWiecej() {
  const krok3 = druga?.dataset.krok === '3' || druga?.dataset.krok === '4';
  siatka?.querySelectorAll<HTMLElement>('.z-kolumna').forEach((kol) => {
    const b = kol.querySelector<HTMLElement>('.z-wiecej');
    if (!b) return;
    const n = kol.querySelectorAll('.z-w').length;
    const k = Math.max(0, n - ((kol.querySelector('.z-w.wyr') ? 2 : 3) - (krok3 ? 1 : 0)));
    const t = Math.max(0, n - 3);
    const ik = b.querySelector('.z-ile-k'), it = b.querySelector('.z-ile-t');
    if (ik) ik.textContent = String(k);
    if (it) it.textContent = String(t);
    b.hidden = !(TELEFON.matches ? t : k);
  });
}

// Drabinka wysokości (zlecenie 26, punkt 3; komputer przy skali ≤ 1): gdy drugi ekran z paskiem i stopką nie mieści się w oknie, ustępują kolejno
// 1. stopka (schodzi pod ekran), 2. „Warto wiedzieć” (w całości pod ekran), 3. trzecia pozycja krótkich kolumn; 4. gdy i to za mało, układ z kroku 3 i zwykłe przewijanie.
// „Pod ekran”: siatka (Szybki dostęp, kolumny, Studia) wypełnia pierwszy ekran, reszta stoi pod nią. Kolejność w HTML (czytnik ekranu) się nie zmienia.
// Krok zapisany w data-krok na .z-druga, wysokości w --z-druga-h i --z-siatka-h (CSS: zalozyciele-strony.css). Bez kroku układ jak dotąd:
// tak jest przy 1707×830, 1920×950 i każdym oknie, w którym wszystko się mieści. Tolerancja 1 px na zaokrąglenia.
let skrH = -1;
function drabinka() {
  if (!siatka || !druga) return;
  const pasek = document.querySelector<HTMLElement>('.z-pasek-jasny'), stopka = document.querySelector<HTMLElement>('.z-stopka');
  const skr = druga.querySelector<HTMLElement>('.z-skr'), studia = siatka.querySelector<HTMLElement>('.z-studia');
  const k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z-k')) || 1;
  const ustaw = (krok: string | null, druga_h?: number, siatka_h?: number) => {
    if (krok === null) delete druga.dataset.krok; else druga.dataset.krok = krok;
    if (druga_h === undefined) druga.style.removeProperty('--z-druga-h'); else druga.style.setProperty('--z-druga-h', `${druga_h}px`);
    if (siatka_h === undefined) druga.style.removeProperty('--z-siatka-h'); else druga.style.setProperty('--z-siatka-h', `${siatka_h}px`);
    // przycisk „Zobacz więcej” zależy od kroku (w kroku 3 pojawia się także w kolumnie z trzema pozycjami), a ma wysokość: przed każdym pomiarem
    liczWiecej();
  };
  ustaw(null);
  skrH = skr?.offsetHeight ?? -1;
  if (TELEFON.matches || k > 1 || !druga.offsetHeight) return;
  const H = document.documentElement.clientHeight;
  const wys = (e: HTMLElement | null) => (e ? e.getBoundingClientRect().height : 0);
  const P = wys(pasek), F = wys(stopka);
  const wybierz = (): void => {
    // bez kroku: min-height z CSS (okno − pasek − 47 px) — mieści się albo nie
    if (P + wys(druga) + F <= H + 1) return ustaw(null);
    ustaw('1');
    const D = wys(druga);
    // wszystko mieści się bez rozciągania, tylko stopka na niższych oknach jest wyższa niż 47 px: druga część dokładnie do stopki
    if (P + D + F <= H + 1) return ustaw('0', H - P - F);
    if (P + D <= H + 1) return ustaw('1', H - P);
    // „na styk”: Studia mogą sięgać krawędzi okna; gdy jest miejsce, nad krawędzią zostaje odstęp siatki (22 px), a długa kolumna sięga do dołu Studiów
    const gap = parseFloat(getComputedStyle(siatka).rowGap) || 0;
    for (const krok of ['2', '3']) {
      ustaw(krok);
      const g = druga.getBoundingClientRect(), s = siatka.getBoundingClientRect();
      if (studia && P + studia.getBoundingClientRect().bottom - g.top <= H + 1) return ustaw(krok, undefined, H - P - (s.top - g.top) - gap);
    }
    // jak w zleceniu 25 kroki się sumują: układ z kroku 3 zostaje, strona się przewija
    ustaw('4');
  };
  wybierz();
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
  // ile pozycji było widać w klikniętej krótkiej kolumnie: kolejne pojawią się po kolei
  const bylo = Array.from(kliknieta.querySelectorAll<HTMLElement>('.z-w')).filter((w) => w.getClientRects().length).length;
  const slot = kliknieta.dataset.slot!;
  kliknieta.dataset.slot = '2';
  dluga.dataset.slot = slot;
  // w krótkiej kolumnie wszystkie pozycje z powrotem widoczne (CSS i tak pokazuje pierwsze trzy, przy powiększonym wpisie dwa)
  dluga.querySelectorAll<HTMLElement>('.z-w').forEach((w) => { w.hidden = false; });
  // inna krótka kolumna może mieć inną wysokość, więc drabinka liczy krok od nowa
  drabinka();
  dopasujDluga();
  kliknieta.querySelector<HTMLElement>('.z-h h2')?.focus({ preventScroll: true });
  const bezRuchu = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // getBoundingClientRect podaje piksele okna, a przesunięcie pod CSS zoom rośnie k razy (ekrany większe od Full HD, zlecenie 26, punkt 2)
  const k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z-k')) || 1;
  for (const el of [kliknieta, dluga]) {
    const o = stare.get(el)!, n = el.getBoundingClientRect();
    const dx = (o.left - n.left) / k, dy = (o.top - n.top) / k;
    if (bezRuchu) { el.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 150, easing: RYTM }); continue; }
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    if (el === kliknieta) el.style.zIndex = '2';
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 350, easing: RYTM })
      .finished.then(() => { el.style.zIndex = ''; }).catch(() => {});
  }
  if (bezRuchu) return;
  Array.from(kliknieta.querySelectorAll<HTMLElement>('.z-w:not([hidden])')).slice(bylo).forEach((w, i) =>
    w.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 250, delay: 250 + i * 35, easing: RYTM, fill: 'backwards' }));
}

if (siatka) {
  schowajZakonczone();
  drabinka();
  siatka.querySelectorAll<HTMLButtonElement>('.z-wiecej').forEach((b) => b.addEventListener('click', () => zamien(b.dataset.key || '')));
  const dopasuj = () => { dopasujDluga(); dalej(); };
  new ResizeObserver(dopasuj).observe(siatka);
  // drabinka zależy od okna (resize; skalę --z-k ustawia wcześniej skrypt okładki), czcionek i wysokości paska Szybkiego dostępu, którą po wczytaniu
  // może zmienić kolor dnia (kolor-dnia.ts). Ta ostatnia przez requestAnimationFrame: zmiana siatki wewnątrz ResizeObservera dałaby błąd pętli obserwatora.
  addEventListener('resize', drabinka);
  document.fonts?.ready.then(() => { drabinka(); dopasuj(); });
  const skr = siatka.parentElement?.querySelector<HTMLElement>('.z-skr');
  if (skr) new ResizeObserver(() => { if (skr.offsetHeight !== skrH) requestAnimationFrame(drabinka); }).observe(skr);
}
