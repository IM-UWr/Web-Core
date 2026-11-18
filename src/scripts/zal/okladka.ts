// Okładka strony głównej na komputer (src/components/zal/Okladka.astro).
// 1. Blok tytułu i skos — od zlecenia 13 (punkt 5) skrypt w linii na końcu okładki (ULOZ w Okladka.astro), żeby zdjęcie
//    stało na miejscu od pierwszej klatki.
// 2. Barwienie (zlecenie 11, zalecenie 1): po najechaniu kursorem albo fokusie na dział całe zdjęcie lekko barwi się na
//    jasny kolor tego działu (warstwa .z-barwa, soft-light, 50%; przejście 0,6 s, bez przejścia przy ograniczonym ruchu).
//    Kolor (--d-j) bierze warstwa z własnego data-dzial — reszta okładki zostaje w swoich kolorach. Telefon bez zmian.
// 3. Dotyk (zlecenie 36, wariant A; tablety w poziomie, duże ekrany dotykowe, laptop z ekranem dotykowym — układ komputerowy):
//    palec rozpoznawany przy każdym naciśnięciu (pointerType „touch”, nie media query), więc laptop działa palcem jak tablet,
//    a myszą jak komputer.
//    - Naciśnięcie palcem na dziale: kafel dostaje .z-dotyk — wygląda jak po najechaniu (szkic, poświata, kreska i poświata
//      nazwy, nazwisko patrona zamiast hasła) i barwi zdjęcie; rysunek kończy się w ok. 0,3 s (czasy w zalozyciele.css).
//    - Stuknięcie (click po naciśnięciu palcem, lewy przycisk, bez klawiszy): preventDefault, kolejne kliknięcia ignorowane,
//      przejście do działu po dorysowaniu — koniec przejścia ostatniej kreski i detali; gdy rysunek był już gotowy, licznik
//      0,3 s od naciśnięcia; zawsze najpóźniej 0,45 s od naciśnięcia. Strona działu przygotowuje się w tym czasie
//      (speculationrules w Baza.astro ruszają przy naciśnięciu). Dalej jak z myszą: w banerze działu patron rysuje się od zera.
//    - Przewinięcie i przytrzymanie: zdjęte .z-dotyk i barwienie, bez przejścia. Przewinięcie: pointercancel (przeglądarka przejęła
//      palec) albo palec ruszył o ponad 12 px — na okładce touch-action: pinch-zoom (przejazd.ts), więc przeglądarka palca nie
//      przejmuje. Przytrzymanie: contextmenu (podgląd linku, menu) albo naciśnięcie dłuższe niż 0,5 s (próg długiego naciśnięcia
//      w Chrome; nie każda przeglądarka wysyła contextmenu). Palec podniesiony bez kliknięcia — też zgaszone.
//    - Ograniczony ruch: bez .z-dotyk i bez czekania — przejście od razu.
//    - [data-z-dotyk] na okładce: ostatnim wskaźnikiem był palec. Wyłącza reguły :hover kafli (zalozyciele.css; tam też
//      @media (hover: hover)), żeby po „wstecz” nie zostało zawieszone najechanie; ruch myszy zdejmuje atrybut.
// Strzałka „Szybki dostęp”, liczby nad nią i przejazd okładka ↔ drugi ekran: src/scripts/zal/przejazd.ts.
// Hamburger i panel menu: src/scripts/zal/menu.ts.
import { MQ_TELEFON } from '../../lib/media';

const ok = document.querySelector<HTMLElement>('.z-okladka');
if (ok) {
  const barwa = ok.querySelector<HTMLElement>('.z-barwa');
  const telefon = matchMedia(MQ_TELEFON);
  const ruch = matchMedia('(prefers-reduced-motion: reduce)');
  const LICZNIK = 300; // ms od naciśnięcia, gdy rysunek był już gotowy
  const LIMIT = 450; // ms od naciśnięcia, twardy limit czekania na dorysowanie
  const PRZESUNIECIE = 12; // px — palec ruszył dalej: przewinięcie / przeciągnięcie okładki, nie stuknięcie
  const PRZYTRZYMANIE = 500; // ms — dłuższe naciśnięcie to przytrzymanie, nie stuknięcie
  let wToku = false; // po stuknięciu czekamy na przejście; kolejne kliknięcia (także w inne działy) są ignorowane

  // ostatni wskaźnik: palec → [data-z-dotyk] (reguły :hover kafli nie działają), mysz → bez atrybutu; pióro bez zmian
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') ok.setAttribute('data-z-dotyk', '');
    else if (e.pointerType === 'mouse') ok.removeAttribute('data-z-dotyk');
  }, { capture: true, passive: true });
  document.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') ok.removeAttribute('data-z-dotyk'); }, { passive: true });

  const wlacz = (dz: HTMLElement) => { if (!barwa || telefon.matches) return; barwa.dataset.dzial = dz.dataset.dzial || ''; ok.classList.add('zabarwione'); };
  const wylacz = () => ok.classList.remove('zabarwione');

  ok.querySelectorAll<HTMLAnchorElement>('.z-okl-dz').forEach((dz) => {
    // zgodne zdarzenia myszy po stuknięciu (mouseenter/mouseleave) nie sterują barwieniem — przy palcu robi to sam dotyk
    dz.addEventListener('mouseenter', () => { if (!ok.hasAttribute('data-z-dotyk')) wlacz(dz); });
    dz.addEventListener('mouseleave', () => { if (!ok.hasAttribute('data-z-dotyk')) wylacz(); });
    // fokus z klawiatury (po kliknięciu myszą wystarcza mouseenter; fokus po kliknięciu wracałby po powrocie „wstecz”)
    dz.addEventListener('focus', () => { if (dz.matches(':focus-visible')) wlacz(dz); });
    dz.addEventListener('blur', () => { if (!dz.classList.contains('z-dotyk')) wylacz(); });

    // dotyk: ostatnia kreska konturu i detale — ich koniec przejścia to „dorysowane”
    const kreski = dz.querySelectorAll<SVGPathElement>('.z-okl-szkic .tusz path');
    const ostatnia = kreski[kreski.length - 1];
    const detale = dz.querySelector<SVGGElement>('.z-okl-szkic .detale');
    let palec = false; // ostatnie naciśnięcie na tym kaflu było palcem
    let anulowane = false; // przytrzymanie albo przesunięcie: kliknięcie po nim (jeśli przyjdzie) nie przechodzi
    let klik = false; // przyszło kliknięcie po tym naciśnięciu
    let nr = 0; // numer naciśnięcia (licznik po podniesieniu palca dotyczy tylko swojego)
    let start = 0;
    let x0 = 0;
    let y0 = 0;
    let kontur = false;
    let det = false;
    let gotowe = Infinity; // chwila (performance.now), od której rysunek jest gotowy
    let poGotowym: (() => void) | null = null;

    const zgas = () => { dz.classList.remove('z-dotyk'); wylacz(); };

    dz.addEventListener('pointerdown', (e) => {
      palec = e.pointerType === 'touch' && e.isPrimary;
      anulowane = false;
      klik = false;
      nr++;
      if (!palec || wToku || telefon.matches || ruch.matches) return;
      start = performance.now();
      x0 = e.clientX;
      y0 = e.clientY;
      // rysunek już gotowy (np. po fokusie) — przejścia nie będzie, zostaje licznik
      const juz = !!ostatnia && !!detale && parseFloat(getComputedStyle(ostatnia).strokeDashoffset) === 0
        && getComputedStyle(ostatnia).opacity === '1' && getComputedStyle(detale).opacity === '1';
      kontur = juz || !ostatnia;
      det = juz || !detale;
      gotowe = juz ? start + LICZNIK : Infinity;
      dz.classList.add('z-dotyk');
      wlacz(dz);
    });
    dz.addEventListener('transitionend', (e) => {
      if (!dz.classList.contains('z-dotyk')) return;
      if (e.target === ostatnia && e.propertyName === 'stroke-dashoffset') kontur = true;
      if (e.target === detale && e.propertyName === 'opacity') det = true;
      if (kontur && det && gotowe === Infinity) { gotowe = performance.now(); poGotowym?.(); }
    });
    // przewinięcie (przeglądarka przejęła palec) i przytrzymanie (podgląd linku, menu): bez przejścia, patron gaśnie
    dz.addEventListener('pointercancel', () => { if (palec && !wToku) zgas(); });
    dz.addEventListener('pointermove', (e) => {
      if (!palec || wToku || anulowane || e.pointerType !== 'touch' || !dz.classList.contains('z-dotyk')) return;
      if (Math.hypot(e.clientX - x0, e.clientY - y0) > PRZESUNIECIE) { anulowane = true; zgas(); }
    });
    dz.addEventListener('pointerup', (e) => {
      if (!palec || e.pointerType !== 'touch') return;
      const ten = nr;
      setTimeout(() => { if (ten === nr && !klik && !wToku) { anulowane = false; zgas(); } }, 400);
    });
    dz.addEventListener('contextmenu', () => { if (!palec) return; anulowane = true; if (!wToku) zgas(); });

    dz.addEventListener('click', (e) => {
      klik = true;
      if (wToku) { e.preventDefault(); return; }
      if (anulowane) { e.preventDefault(); anulowane = false; zgas(); return; }
      if (!palec || !dz.classList.contains('z-dotyk') || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (performance.now() - start >= PRZYTRZYMANIE) { zgas(); return; }
      wToku = true;
      let poszlo = false;
      const idz = () => { if (poszlo || !wToku) return; poszlo = true; location.href = dz.href; };
      const teraz = performance.now();
      setTimeout(idz, Math.max(0, start + LIMIT - teraz));
      if (gotowe !== Infinity) setTimeout(idz, Math.max(0, gotowe - teraz));
      else poGotowym = idz;
    });

    // powrót „wstecz” z pamięci przeglądarki: okładka czysta, przejścia odblokowane
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      dz.classList.remove('z-dotyk');
      palec = false; anulowane = false; poGotowym = null; gotowe = Infinity;
    });
  });
  // powrót „wstecz” z pamięci przeglądarki (bfcache, zlecenie 13, punkt 7): strona wraca zabarwiona kolorem klikniętego
  // działu, a kursora nad nim już nie ma (mouseleave nie przyjdzie) — zdejmujemy barwienie
  window.addEventListener('pageshow', (e) => { if (e.persisted) { ok.classList.remove('zabarwione'); wToku = false; } });
}
