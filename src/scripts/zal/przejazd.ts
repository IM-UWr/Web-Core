import { MQ_TELEFON } from '../../lib/media';

// Strona główna: okładka ↔ Szybki dostęp bez zatrzymywania w połowie (zlecenie 11, zalecenie 20).
// Dwa położenia: okładka w całości (0) albo Szybki dostęp od swojej górnej krawędzi (Y1 = początek #szybki-dostep,
// na telefonie pod przyklejonym nagłówkiem). Niżej (Szybki dostęp, Studia, Warto wiedzieć, stopka) — swobodnie.
// - Kółko / gładzik: deltaY sumowane w oknie OKNO ms; po przekroczeniu PROG px — przejazd w całości (CZAS ms, krzywa
//   z zlecenia 13: cubic-bezier(.22, .8, .2, 1)); poniżej progu nic się nie dzieje (preventDefault — bez „podskoku”).
//   Na czas przejazdu i wygasania rozpędu (aż do CISZA ms bez zdarzeń) kolejne zdarzenia są pomijane.
// - Z dołu w górę: strona przewija się zwykle, ale zatrzymuje na górnej krawędzi Szybkiego dostępu; na okładkę prowadzi
//   dopiero nowy zdecydowany ruch po CISZA ms spokoju (histereza), nie ten sam rozpęd.
// - Klawisze: PgDn / spacja / ↓ / End na okładce → Szybki dostęp; PgUp / Shift+spacja / ↑ / Home u krawędzi → okładka
//   (przytrzymany klawisz nie przenosi dalej niż do krawędzi). Pola formularzy i przyciski (spacja) — bez zmian.
// - Wszystko inne (pasek przewijania, kotwice #…, Ctrl+F, zaznaczanie tekstu, „wstecz”, Tab): przeglądarka przewija
//   sama, a gdy skończy w połowie — dociągamy do bliższego z dwóch położeń (przy fokusie z klawiatury — tam, gdzie
//   jest fokus). Przy wciśniętym przycisku myszy (zaznaczanie) czekamy do puszczenia.
// - Dotyk (telefon, tablet): CSS scroll-snap (zalozyciele-strony.css) — przeglądarka sama dociąga; skrypt obsługuje kliknięcia
//   strzałki i liczb oraz zatrzymanie rozpędu na krawędzi (zlecenie 21, punkt 3): rozpędu palca nie da się przerwać ze skryptu, więc gdy
//   Szybki dostęp stoi w spoczynku na krawędzi lub niżej, okładki nie ma w układzie strony (html.bez-okladki) i rozpęd kończy się na
//   prawdziwej górze dokumentu. Wraca dopiero przy nowym dotknięciu na samej górze po CISZA ms spokoju; scroll-snap ją wtedy dociąga.
// - Telefon (≤ 760 px): powrót na stronę główną zawsze na okładkę, także „wstecz” i z pamięci przeglądarki; adres z kotwicą działa jak dotąd (zlecenie 21, punkt 9).
// - prefers-reduced-motion: przejście natychmiastowe.
// Zalecenie 15: kliknięcie liczby nad strzałką — przejazd na Szybki dostęp i krótkie (1,6 s) podświetlenie kolumny.
const okladka = document.querySelector<HTMLElement>('.z-okladka');
const obszar = document.getElementById('szybki-dostep');

if (okladka && obszar) {
  const BEZ_RUCHU = matchMedia('(prefers-reduced-motion: reduce)');
  const DOTYK = matchMedia('(hover: none) and (pointer: coarse)');
  const PROG = 60; // px
  const OKNO = 200; // ms
  const CISZA = 400; // ms
  const CZAS = 700; // ms — przejazd między położeniami
  const CZAS_KROTKI = 300; // ms — dociągnięcie z bliska

  // cubic-bezier(.22, .8, .2, 1)
  const krzywa = (() => {
    const [x1, y1, x2, y2] = [0.22, 0.8, 0.2, 1];
    const f = (t: number, a: number, b: number) => ((1 - 3 * b + 3 * a) * t * t * t) + ((3 * b - 6 * a) * t * t) + (3 * a * t);
    const df = (t: number, a: number, b: number) => (3 * (1 - 3 * b + 3 * a) * t * t) + (2 * (3 * b - 6 * a) * t) + (3 * a);
    return (x: number) => {
      if (x <= 0 || x >= 1) return Math.min(1, Math.max(0, x));
      let t = x;
      for (let i = 0; i < 8; i++) {
        const e = f(t, x1, x2) - x, d = df(t, x1, x2);
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t = Math.min(1, Math.max(0, t - e / d));
      }
      return f(t, y1, y2);
    };
  })();

  // na telefonie pierwszy ekran zaczyna się pod przyklejonym nagłówkiem (Naglowek.astro); na komputerze nagłówka nie ma
  const naglowek = document.querySelector<HTMLElement>('.hdr');
  const y1 = () => Math.max(0, Math.round(obszar.getBoundingClientRect().top + window.scrollY - (naglowek?.offsetHeight || 0)));

  let ramka = 0;
  let jedzie = false;
  let blokada = false; // po przejeździe / dojeździe do krawędzi: czekamy na CISZA ms spokoju
  let ostatnie = 0; // czas ostatniego zdarzenia kółka lub powtórzenia klawisza
  let wcisniety = false;
  const ruchy: [number, number][] = []; // [czas, deltaY] z ostatnich OKNO ms
  let cel = 0, celCzas = 0; // przewidywane położenie przy zwykłym przewijaniu kółkiem (rozpęd przeglądarki wyprzedza scrollY)

  const stop = () => { if (ramka) cancelAnimationFrame(ramka); ramka = 0; jedzie = false; };

  function jedz(doY: number, czas = CZAS) {
    stop();
    blokada = true;
    ostatnie = performance.now();
    ruchy.length = 0;
    const od = window.scrollY;
    if (Math.abs(doY - od) < 1) return;
    if (BEZ_RUCHU.matches) { window.scrollTo({ top: doY, behavior: 'instant' }); return; }
    // na dotyku przyciąga CSS (scroll-snap) — przewijanie po klatce byłoby tam co chwilę dociągane; płynnie robi to przeglądarka
    if (DOTYK.matches) { window.scrollTo({ top: doY, behavior: 'smooth' }); return; }
    const t0 = performance.now();
    jedzie = true;
    const krok = (t: number) => {
      const p = Math.min(1, (t - t0) / czas);
      window.scrollTo({ top: od + (doY - od) * krzywa(p), behavior: 'instant' });
      if (p < 1) ramka = requestAnimationFrame(krok);
      else { ramka = 0; jedzie = false; }
    };
    ramka = requestAnimationFrame(krok);
  }

  // czy zdarzenie przewinie najpierw coś wewnątrz (np. długi panel menu)
  function przewijaWewnatrz(el: EventTarget | null, dy: number): boolean {
    for (let n = el instanceof Element ? el : null; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      if (n.scrollHeight <= n.clientHeight + 1) continue;
      const o = getComputedStyle(n).overflowY;
      if (o !== 'auto' && o !== 'scroll') continue;
      if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
    }
    return false;
  }

  // po przewinięciu „z zewnątrz” (pasek przewijania, kotwica, Ctrl+F, Tab…): w połowie → do bliższego położenia
  function dociagnij() {
    if (jedzie || wcisniety || DOTYK.matches) return;
    const Y1 = y1(), y = window.scrollY;
    if (y <= 1 || y >= Y1 - 1) return;
    let doY = y < Y1 / 2 ? 0 : Y1;
    const a = document.activeElement;
    if (a instanceof HTMLElement && a !== document.body && a.matches(':focus-visible')) {
      doY = a.getBoundingClientRect().top + y >= Y1 + (naglowek?.offsetHeight || 0) ? Y1 : 0;
    }
    jedz(doY, CZAS_KROTKI);
  }

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented || DOTYK.matches) return; // Ctrl + kółko / szczypanie = powiększanie
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // ruch w bok
    const dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1);
    if (przewijaWewnatrz(e.target, dy) || (e.target instanceof Element && e.target.closest('.z-menu.otwarte'))) return; // kółko nad panelem menu nie rusza strony
    const teraz = performance.now();
    if (blokada) {
      if (jedzie || teraz - ostatnie < CISZA) { ostatnie = teraz; e.preventDefault(); return; }
      blokada = false;
    }
    ostatnie = teraz;
    const Y1 = y1(), y = window.scrollY;

    // niżej niż krawędź Szybkiego dostępu (choćby o piksel): swobodnie, ale w górę najwyżej do krawędzi — ruch w górę,
    // który zaczął się poniżej, kończy się na krawędzi (histereza), nawet gdy pod nią jest tylko kawałek strony
    if (y > Y1 + 0.9) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      cel = Math.min(max, Math.max(0, (teraz - celCzas < 250 ? cel : y) + dy));
      celCzas = teraz;
      if (dy < 0 && cel < Y1) { e.preventDefault(); jedz(Y1, CZAS_KROTKI); }
      return;
    }
    // u krawędzi w dół: swobodnie
    if (y >= Y1 - 1 && dy > 0) { cel = y + dy; celCzas = teraz; return; }

    // okładka (albo krawędź i ruch w górę): sumujemy ruch z ostatnich OKNO ms
    e.preventDefault();
    while (ruchy.length && (teraz - ruchy[0][0] > OKNO || Math.sign(ruchy[0][1]) !== Math.sign(dy))) ruchy.shift();
    ruchy.push([teraz, dy]);
    const suma = ruchy.reduce((s, [, d]) => s + d, 0);
    if (Math.abs(suma) < PROG) return;
    if (dy > 0) jedz(Y1);
    else if (y > 1) jedz(0);
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || DOTYK.matches) return;
    const k = e.key;
    const dol = k === 'PageDown' || k === 'ArrowDown' || k === 'End' || (k === ' ' && !e.shiftKey);
    const gora = k === 'PageUp' || k === 'ArrowUp' || k === 'Home' || (k === ' ' && e.shiftKey);
    if (!dol && !gora) return;
    if (document.querySelector('.z-menu.otwarte')) return; // otwarty panel menu: klawisze należą do niego
    const t = e.target instanceof Element ? e.target : null;
    if (t?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="listbox"], [role="menu"], [role="tablist"]')) return;
    if (k === ' ' && t?.closest('button, summary, [role="button"]')) return; // spacja naciska przycisk
    const Y1 = y1(), y = window.scrollY;
    const teraz = performance.now();

    if (y > Y1 + 0.9) {
      if (!gora) return;
      if (jedzie) { e.preventDefault(); return; }
      // przewidywany skok klawisza: strzałka ok. 40 px, strona — prawie całe okno, Home — na samą górę
      const skok = k === 'ArrowUp' ? 40 : k === 'Home' ? Infinity : window.innerHeight * 0.875;
      if (y - skok >= Y1) return;
      e.preventDefault();
      jedz(Y1, CZAS_KROTKI);
      return;
    }
    if (y >= Y1 - 1 && dol && !(e.repeat && blokada)) return; // u krawędzi w dół: swobodnie

    e.preventDefault();
    if (jedzie) return;
    // przytrzymany klawisz (powtórzenia) nie przenosi dalej niż do krawędzi — dopiero nowe naciśnięcie
    if (e.repeat && blokada && teraz - ostatnie < CISZA) { ostatnie = teraz; return; }
    if (dol) jedz(Y1);
    else if (y > 1) jedz(0);
  });

  // kliknięcia: strzałka „Szybki dostęp” i liczby nad nią (zalecenie 15)
  okladka.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('.z-strzalka, .z-okl-liczby a') : null;
    if (!a) return;
    e.preventDefault();
    jedz(y1());
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

  window.addEventListener('pointerdown', (e) => { wcisniety = true; if (jedzie && e.pointerType !== 'touch') stop(); }, { passive: true });
  window.addEventListener('pointerup', () => { wcisniety = false; dociagnij(); }, { passive: true });
  window.addEventListener('pointercancel', () => { wcisniety = false; }, { passive: true });
  // test na document (ten sam GlobalEventHandlers): przy teście na window TypeScript zawęża window w else do never
  if ('onscrollend' in document) window.addEventListener('scrollend', dociagnij);
  else {
    let czas = 0;
    window.addEventListener('scroll', () => { clearTimeout(czas); czas = window.setTimeout(dociagnij, 150); }, { passive: true });
  }
  document.addEventListener('focusin', () => requestAnimationFrame(dociagnij));
  window.addEventListener('pageshow', () => requestAnimationFrame(dociagnij));

  // zmiana wysokości okna: kto stał na krawędzi Szybkiego dostępu, zostaje na niej
  let poprzedniY1 = y1();
  new ResizeObserver(() => {
    const nowy = y1();
    if (nowy !== poprzedniY1 && Math.abs(window.scrollY - poprzedniY1) <= 1 && !jedzie) window.scrollTo({ top: nowy, behavior: 'instant' });
    poprzedniY1 = nowy;
  }).observe(okladka);

  // ---------- dotyk: okładka poza układem, gdy Szybki dostęp stoi na krawędzi lub niżej (zlecenie 21, punkt 3) ----------
  // Chowanie i przywracanie to w tej samej chwili przewinięcie o wysokość okładki, więc nic na ekranie się nie rusza. Spokój: USPOKOJENIE ms
  // bez zdarzeń scroll i bez palca na ekranie, nigdy w trakcie rozpędu. Odświeżenie i powrót „wstecz”: przeglądarka odtwarza położenie liczone
  // bez okładki, więc znacznik w history.state chowa ją jeszcze przed pierwszym układem strony (skrypt w linii w Okladka.astro). Telefon bez kotwicy
  // w adresie położenia nie odtwarza (punkt 9, niżej); znacznik zostaje dla kotwic i dla obróconego telefonu szerszego niż 760 px.
  const USPOKOJENIE = 150; // ms
  const html = document.documentElement;
  let schowana = html.classList.contains('bez-okladki'), palec = false, ostatniScroll = -Infinity, czasSpokoju = 0;

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
    poprzedniY1 = y1(); // bez tego ResizeObserver wyżej wziąłby schowanie za zmianę wysokości okna
    znacznik(true);
  }
  function pokaz() {
    const y = window.scrollY;
    html.classList.remove('bez-okladki');
    poprzedniY1 = y1();
    window.scrollTo({ top: y + poprzedniY1, behavior: 'instant' });
    schowana = false;
    znacznik(false);
  }
  const spokoj = () => {
    if (!DOTYK.matches || palec || schowana) return;
    if (html.classList.contains('menu-otwarte')) { pozniej(); return; } // strona stoi pod panelem: czekamy na jego zamknięcie
    if (window.scrollY >= y1() - 1) schowaj();
  };
  function pozniej() {
    clearTimeout(czasSpokoju);
    czasSpokoju = window.setTimeout(spokoj, USPOKOJENIE);
  }

  // ---------- telefon: powrót zawsze na okładkę (zlecenie 21, punkt 9) ----------
  // Wyjątek: adres z kotwicą. Przywracanie położenia zapisuje się przy wpisie historii, więc przełączamy je także przy zmianie kotwicy.
  const TELEFON = matchMedia(MQ_TELEFON);
  const kotwica = () => !!location.hash && location.hash !== '#okladka';
  const przywracanie = () => { history.scrollRestoration = TELEFON.matches && !kotwica() ? 'manual' : 'auto'; };
  let dotknieta = false; // palec w trakcie wczytywania: pierwsze pageshow nie zabiera strony spod palca
  function naOkladke() {
    if (schowana) pokaz();
    else if (history.state?.zBezOkladki) znacznik(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  przywracanie();
  TELEFON.addEventListener('change', przywracanie);
  window.addEventListener('pageshow', (e) => {
    if (TELEFON.matches && !kotwica() && (e.persisted || !dotknieta)) naOkladke();
  });

  window.addEventListener('touchstart', (e) => {
    dotknieta = true;
    palec = e.touches.length > 0;
    clearTimeout(czasSpokoju);
    if (schowana && DOTYK.matches && window.scrollY <= 1 && performance.now() - ostatniScroll >= CISZA && !html.classList.contains('menu-otwarte')) pokaz();
  }, { passive: true });
  const puszczony = (e: TouchEvent) => { palec = e.touches.length > 0; pozniej(); };
  window.addEventListener('touchend', puszczony, { passive: true });
  window.addEventListener('touchcancel', puszczony, { passive: true });
  window.addEventListener('scroll', () => { ostatniScroll = performance.now(); pozniej(); }, { passive: true });
  window.addEventListener('pageshow', pozniej);
  window.addEventListener('hashchange', () => {
    przywracanie();
    if (TELEFON.matches && !location.hash) { naOkladke(); return; } // „wstecz” z adresu z kotwicą na ten sam dokument, bez pageshow
    if (!schowana) return;
    if (location.hash === '#okladka') { pokaz(); window.scrollTo({ top: 0, behavior: 'instant' }); }
    else znacznik(true); // nowy wpis w historii nie ma znacznika
  });
  DOTYK.addEventListener('change', () => { if (schowana && !DOTYK.matches) pokaz(); });
  pozniej();
}
