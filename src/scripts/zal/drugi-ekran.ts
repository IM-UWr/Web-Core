// Drugi ekran strony głównej (src/components/zal/DrugiEkran.astro): trzy kolumny, z których jedna (slot 2) jest długa.
// - Długa kolumna pokazuje tyle pozycji, ile się zmieści; pod nimi „i jeszcze N · Wszystkie … →” („N more · All … →”). Minione pozycje
//   („Ostatnio”, zlecenie 35, część B) stoją pod nadchodzącymi tylko wtedy, gdy zmieściły się wszystkie nadchodzące i zostało miejsce.
// - Krótkie kolumny i odstępy między rzędami (zlecenie 35, D3.4; zastępuje drabinkę wysokości ze zlecenia 26, punkt 3): uloz().
//   Krótkie kolumny pokazują tyle pozycji, ile się zmieści (co najmniej 3 nadchodzące, na niskim oknie 2), a w wolnym miejscu pod
//   nadchodzącymi minione („Ostatnio”). Odstępy rosną z wolnym miejscem do 88 px; Studia nie są przypinane do dołu ekranu.
// - Zajawka wyróżnionej aktualności: jedna linia, a gdy się nie mieści, „… czytaj dalej” (komputer; zlecenie 18, punkt 8).
// - „Zobacz więcej” zamienia klikniętą krótką kolumnę z długą: płynne przejście FLIP (0,35 s — jeden rytm,
//   zlecenie 13, punkt 9), kolejne pozycje rozwiniętej listy pojawiają się po kolei. Przy prefers-reduced-motion — od razu, z krótkim rozjaśnieniem kolumn, które zmieniły
//   miejsce. Fokus zawsze przechodzi na nagłówek rozwiniętej kolumny (klawiatura, czytniki ekranu).
// - Wydarzenia, które skończą się przy otwartej stronie, przechodzą na początek „Ostatnio” (zlecenie 35, punkt 12; dawniej znikały, zlecenie 06, punkt 4).
import { hasTime, now, today } from '../../lib/daty';
import { MQ_TELEFON } from '../../lib/media';

const siatka = document.querySelector<HTMLElement>('[data-z-siatka]');
// Telefon (≤ 1023 px): na wąskim ekranie kolumny stoją jedna pod drugą, „Zobacz więcej” rozwija listę w miejscu
const TELEFON = matchMedia(MQ_TELEFON);
// jeden rytm ruchu (zlecenie 13, punkt 9; --rytm w global.css)
const RYTM = 'cubic-bezier(.22, .8, .2, 1)';

const druga = siatka?.closest<HTMLElement>('.z-druga') ?? null;
const rt = document.documentElement;

// Odstępy między rzędami siatki (kolumny → Studia: --z-g1, Studia → „Warto wiedzieć”: --z-g2) w px projektu, czyli przed skalą k (zlecenie 35):
// G0 — odstęp nominalny (i jedyny na oknie, które i tak się przewija);
// GPREF — krótkie kolumny dostają kolejne pozycje, dopóki odstępy między rzędami nie spadłyby poniżej tej wartości;
// GMAX — odstęp nigdy nie jest większy; nadwyżka wysokości zostaje pod „Warto wiedzieć”, a długa kolumna sięga do stopki.
const G0 = 22, GPREF = 56, GMAX = 88;

// skala k drugiego ekranu (CSS zoom na ekranach większych od Full HD, zlecenie 26, punkt 2; --z-k ustawia skrypt okładki)
const zoomK = () => parseFloat(getComputedStyle(rt).getPropertyValue('--z-k')) || 1;
// wysokości z getBoundingClientRect są w px okna (pod CSS zoom k razy większe niż px CSS)
const wys = (e: Element | null) => (e ? e.getBoundingClientRect().height : 0);
const kolumny = () => Array.from(siatka?.querySelectorAll<HTMLElement>('.z-kolumna') ?? []);
const krotkie = () => kolumny().filter((k) => k.dataset.slot !== '2');
// pozycje kolumny w kolejności z HTML: nadchodzące, potem minione („Ostatnio”, klasa z-przeszle)
const pozycje = (k: HTMLElement) => Array.from(k.querySelectorAll<HTMLElement>('.pozycje > .z-w'));
const przeszla = (w: HTMLElement) => w.classList.contains('z-przeszle');
const nadchodzace = (k: HTMLElement) => pozycje(k).filter((w) => !przeszla(w));
const widac = (k: HTMLElement) => pozycje(k).filter((w) => !w.hidden).length;

// Wydarzenia, które skończyły się już w przeglądarce (strona przebudowuje się 2× dziennie), przechodzą na początek „Ostatnio”: klasy
// minelo i z-przeszle, zaraz pod nagłówkiem, najnowsze pierwsze. Gdy nie zostało żadne nadchodzące — komunikat „Brak wydarzeń…”.
// Zwraca, czy coś się zmieniło (wtedy układ liczy się od nowa).
function schowajZakonczone(): boolean {
  const kol = siatka?.querySelector<HTMLElement>('.z-kolumna[data-key="wyd"]');
  if (!kol) return false;
  const n = now(), d = today();
  const h = kol.querySelector<HTMLElement>('.z-ostatnio-h');
  let zmiana = false;
  kol.querySelectorAll<HTMLElement>('.pozycje > .z-w:not(.z-przeszle)[data-koniec]').forEach((w) => {
    const koniec = w.dataset.koniec || '';
    if (!koniec || !(hasTime(koniec) ? koniec < n : koniec < d)) return;
    w.classList.add('minelo', 'z-przeszle');
    w.hidden = true;
    delete w.dataset.koniec;
    // kolejne zakończone (chronologicznie) wstawiane tuż pod nagłówek, więc najnowsze stoi pierwsze
    if (h) h.after(w); else w.remove();
    zmiana = true;
  });
  if (!kol.querySelector('.pozycje > .z-w:not(.z-przeszle)')) kol.querySelector('.z-pusto')?.removeAttribute('hidden');
  return zmiana;
}

// Nagłówek „Ostatnio…” tylko razem z pierwszą widoczną minioną pozycją.
function ostatnioNaglowek(k: HTMLElement) {
  const h = k.querySelector<HTMLElement>('.z-ostatnio-h');
  if (h) h.hidden = !k.querySelector('.pozycje > .z-w.z-przeszle:not([hidden])');
}

// „Zobacz więcej (N)”: na komputerze N = ukryte nadchodzące (.z-ile-k; minione się nie liczą), na telefonie wszystkie nadchodzące ponad
// trzy (.z-ile-t; CSS pokazuje właściwą liczbę). Przy N = 0 przycisk znika.
function liczWiecej(k: HTMLElement) {
  const b = k.querySelector<HTMLElement>('.z-wiecej');
  if (!b) return;
  const nad = nadchodzace(k);
  const ukryte = nad.filter((w) => w.hidden).length, t = Math.max(0, nad.length - 3);
  const ik = b.querySelector('.z-ile-k'), it = b.querySelector('.z-ile-t');
  if (ik) ik.textContent = String(ukryte);
  if (it) it.textContent = String(t);
  b.hidden = !(TELEFON.matches ? t : ukryte);
}

// Krótka kolumna: widać pierwsze n pozycji (nadchodzące, potem minione).
function pokaz(k: HTMLElement, n: number) {
  pozycje(k).forEach((w, i) => { w.hidden = i >= n; });
  ostatnioNaglowek(k);
  liczWiecej(k);
}

// Kreski pod nagłówkami kolumn na jednej wysokości (zlecenie 26, punkt 4.1): gdy w wąskiej kolumnie link (po polsku „Kalendarz →” przy 1024–1072 px)
// schodzi pod nagłówek, pozostałe nagłówki dostają tę samą wysokość. Przy równych nagłówkach nic się nie zmienia.
function wyrownajKreski() {
  const h = Array.from(siatka?.querySelectorAll<HTMLElement>('.z-kolumna > .z-h') ?? []);
  h.forEach((e) => { e.style.minHeight = ''; });
  if (TELEFON.matches) return;
  const ws = h.map((e) => e.getBoundingClientRect().height), max = Math.max(...ws);
  if (ws.some((x) => x < max - 0.5)) h.forEach((e) => { e.style.minHeight = `${max}px`; });
}

// Układ drugiego ekranu na komputerze (zlecenie 35, D3.4; przy każdej skali k). Kolejność ustępowania, gdy brakuje wysokości okna:
// stopka, „Warto wiedzieć”, trzecia pozycja krótkich kolumn, a na końcu zwykłe przewijanie. Tryb wybiera pierwszy, który się mieści,
// najpierw przy co najmniej 3 nadchodzących pozycjach na krótką kolumnę (albo tylu, ile ich jest), potem przy 2:
//   0 — pasek, drugi ekran i stopka w oknie;  1 — stopka pod ekranem;
//   2 — „Warto wiedzieć” pod ekranem: w oknie pasek, Szybki dostęp, kolumny i Studia (z dolnym marginesem drugiego ekranu); Studia nie są przypinane do dołu;
//   3 — nic się nie mieści: krótkie kolumny po 2 pozycje i zwykłe przewijanie.
// Potem każda krótka kolumna osobno dostaje kolejne pozycje (nadchodzące, a za nimi minione z nagłówkiem „Ostatnio”), dopóki jej wysokość
// nie przekroczy R = wysokość wyższej krótkiej kolumny + (budżet − wysokość całości − rezerwa), rezerwa = liczba odstępów × (GPREF − G0) × k.
// Krótsza kolumna dopełnia się więc do wysokości sąsiedniej bez kosztu. Na koniec odstępy z resztą wolnego miejsca (najwyżej GMAX).
// Pomiar w trybie „miara” (klasa z-miara: bez min-height i rozciągania). Stan: data-tryb na .z-druga, --z-druga-h, --z-g1, --z-g2.
let skrH = -1;
type Tryb = { id: number; budzet: number; miara: () => number; odstepy: number };
function uloz() {
  if (!siatka || !druga) return;
  const pasek = document.querySelector<HTMLElement>('.z-pasek-jasny'), stopka = document.querySelector<HTMLElement>('.z-stopka');
  const skr = druga.querySelector<HTMLElement>('.z-skr'), studia = siatka.querySelector<HTMLElement>('.z-studia');
  for (const p of ['--z-druga-h', '--z-g1', '--z-g2']) druga.style.removeProperty(p);
  // podczas pomiaru data-tryb="miara", nie brak atrybutu: bez niego działa zapas bez JS (CSS pokazuje 3 pozycje), a pomiar musi widzieć każdą dodaną pozycję
  druga.dataset.tryb = 'miara';
  wyrownajKreski();
  skrH = skr?.offsetHeight ?? -1;
  if (TELEFON.matches || !druga.offsetHeight || !studia) {
    delete druga.dataset.tryb;
    // telefon: nadchodzące w HTML (CSS pokazuje trzy, „Zobacz więcej” rozwija w miejscu), minione schowane
    kolumny().forEach((k) => { pozycje(k).forEach((w) => { w.hidden = przeszla(w); }); ostatnioNaglowek(k); liczWiecej(k); });
    return;
  }
  const kk = krotkie();
  const k = zoomK();
  const H = rt.clientHeight, P = wys(pasek), F = wys(stopka);
  const pad = parseFloat(getComputedStyle(druga).paddingBottom) * k;
  druga.classList.add('z-miara');
  const calosc = () => wys(druga);
  const doStudiow = () => studia.getBoundingClientRect().bottom - druga.getBoundingClientRect().top + pad;
  const TRYBY: Tryb[] = [
    { id: 0, budzet: H - P - F, miara: calosc, odstepy: 2 },
    { id: 1, budzet: H - P, miara: calosc, odstepy: 2 },
    { id: 2, budzet: H - P, miara: doStudiow, odstepy: 1 },
  ];
  let wybor: Tryb | null = null;
  for (const minimum of [3, 2]) {
    for (const t of TRYBY) {
      // minimum liczy tylko nadchodzące: minione nigdy nie są wymuszane
      kk.forEach((c) => pokaz(c, Math.min(nadchodzace(c).length, minimum)));
      if (t.miara() > t.budzet + 1) continue;
      const R = Math.max(...kk.map(wys)) + (t.budzet - t.miara() - t.odstepy * (GPREF - G0) * k);
      for (const c of kk) {
        const wszystkie = pozycje(c).length;
        for (let n = widac(c); n < wszystkie; n++) {
          pokaz(c, n + 1);
          if (wys(c) > R + 0.5) { pokaz(c, n); break; }
        }
      }
      wybor = t;
      break;
    }
    if (wybor) break;
  }
  if (!wybor) kk.forEach((c) => pokaz(c, Math.min(nadchodzace(c).length, 2)));
  // wolne miejsce w px projektu
  const luz = wybor ? Math.max(0, (wybor.budzet - wybor.miara()) / k) : 0;
  druga.classList.remove('z-miara');
  const id = wybor ? wybor.id : 3;
  druga.dataset.tryb = String(id);
  const ustaw = (p: string, v: number) => druga.style.setProperty(p, `${v}px`);
  if (id <= 1) {
    // odstępy rosną z wolnym miejscem, najwyżej do GMAX; reszta zostaje pod „Warto wiedzieć” (długa kolumna sięga do stopki)
    const g = G0 + Math.min(GMAX - G0, luz / 2);
    ustaw('--z-g1', g); ustaw('--z-g2', g);
    ustaw('--z-druga-h', (id === 0 ? H - P - F : H - P) / k);
  } else if (id === 2) {
    // w oknie: odstęp kolumny → Studia do GMAX, reszta przed „Warto wiedzieć”, które zaczyna się tuż pod dolną krawędzią okna
    const g1 = G0 + Math.min(GMAX - G0, luz);
    ustaw('--z-g1', g1); ustaw('--z-g2', G0 + luz - (g1 - G0));
    ustaw('--z-druga-h', 0);
  } else {
    ustaw('--z-druga-h', 0);
  }
}

// Długa kolumna: nadchodzące, ile się zmieści, a gdy zmieściły się wszystkie — pod nimi minione z nagłówkiem „Ostatnio”, też ile się zmieści.
// „i jeszcze N” liczy tylko ukryte nadchodzące.
function dopasujDluga() {
  if (!siatka || !siatka.offsetHeight || TELEFON.matches) return;
  const kol = siatka.querySelector<HTMLElement>('.z-kolumna[data-slot="2"]');
  if (!kol) return;
  const box = kol.querySelector<HTMLElement>('.pozycje');
  const link = kol.querySelector<HTMLAnchorElement>('.reszta');
  if (!box || !link) return;
  const wiersze = pozycje(kol);
  const h = kol.querySelector<HTMLElement>('.z-ostatnio-h');
  wiersze.forEach((w) => { w.hidden = false; });
  if (h) h.hidden = false;
  const limit = box.clientHeight;
  const miesci = (w: HTMLElement) => w.offsetTop - box.offsetTop + w.offsetHeight <= limit + 1;
  let ukryte = 0, jestMiejsce = true;
  for (const w of wiersze.filter((x) => !przeszla(x))) if (!jestMiejsce || !miesci(w)) { w.hidden = true; ukryte++; jestMiejsce = false; }
  for (const w of wiersze.filter(przeszla)) if (!jestMiejsce || !miesci(w)) { w.hidden = true; jestMiejsce = false; }
  ostatnioNaglowek(kol);
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

function wszystko() { uloz(); dopasujDluga(); dalej(); }

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
  const stare = new Map(kolumny().map((el) => [el, el.getBoundingClientRect()]));
  // ile pozycji było widać w klikniętej krótkiej kolumnie: kolejne pojawią się po kolei
  const bylo = widac(kliknieta);
  const slot = kliknieta.dataset.slot!;
  kliknieta.dataset.slot = '2';
  dluga.dataset.slot = slot;
  // nowa krótka kolumna ma inną wysokość, więc układ (tryb, pozycje krótkich kolumn, odstępy) liczy się od nowa, przed FLIP
  uloz();
  dopasujDluga();
  kliknieta.querySelector<HTMLElement>('.z-h h2')?.focus({ preventScroll: true });
  const bezRuchu = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // getBoundingClientRect podaje piksele okna, a przesunięcie pod CSS zoom rośnie k razy (ekrany większe od Full HD, zlecenie 26, punkt 2)
  const k = zoomK();
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
  Array.from(kliknieta.querySelectorAll<HTMLElement>('.pozycje > .z-w:not([hidden])')).slice(bylo).forEach((w, i) =>
    w.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 250, delay: 250 + i * 35, easing: RYTM, fill: 'backwards' }));
}

if (siatka) {
  schowajZakonczone();
  wszystko();
  siatka.querySelectorAll<HTMLButtonElement>('.z-wiecej').forEach((b) => b.addEventListener('click', () => zamien(b.dataset.key || '')));
  const dopasuj = () => { dopasujDluga(); dalej(); };
  new ResizeObserver(dopasuj).observe(siatka);
  // układ zależy od okna (resize; skalę --z-k ustawia wcześniej skrypt okładki), czcionek i wysokości paska Szybkiego dostępu, którą po wczytaniu
  // może zmienić kolor dnia (kolor-dnia.ts). Przez requestAnimationFrame (raz na klatkę): zmiana siatki wewnątrz ResizeObservera dałaby błąd pętli obserwatora.
  let zaplanowane = false;
  const zaplanuj = () => {
    if (zaplanowane) return;
    zaplanowane = true;
    requestAnimationFrame(() => { zaplanowane = false; wszystko(); });
  };
  addEventListener('resize', zaplanuj);
  document.fonts?.ready.then(zaplanuj);
  const skr = siatka.parentElement?.querySelector<HTMLElement>('.z-skr');
  if (skr) new ResizeObserver(() => { if (skr.offsetHeight !== skrH) zaplanuj(); }).observe(skr);
  // wydarzenie kończy się przy otwartej stronie: co minutę sprawdzenie, przejście do „Ostatnio” i nowy układ
  setInterval(() => { if (schowajZakonczone()) wszystko(); }, 60_000);
}
