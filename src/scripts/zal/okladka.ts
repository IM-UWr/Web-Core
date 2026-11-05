// Okładka strony głównej na komputer (src/components/zal/Okladka.astro).
// 1. Blok tytułu i skos — od zlecenia 13 (punkt 5) skrypt w linii na końcu okładki (ULOZ w Okladka.astro), żeby zdjęcie
//    stało na miejscu od pierwszej klatki.
// 2. Barwienie (zlecenie 11, zalecenie 1): po najechaniu kursorem albo fokusie na dział całe zdjęcie lekko barwi się na
//    jasny kolor tego działu (warstwa .z-barwa, soft-light, 50%; przejście 0,6 s, bez przejścia przy ograniczonym ruchu).
//    Kolor (--d-j) bierze warstwa z własnego data-dzial — reszta okładki zostaje w swoich kolorach. Telefon bez zmian.
// Strzałka „Szybki dostęp”, liczby nad nią i przejazd okładka ↔ drugi ekran: src/scripts/zal/przejazd.ts.
// Hamburger i panel menu: src/scripts/zal/menu.ts.
const ok = document.querySelector<HTMLElement>('.z-okladka');
if (ok) {
  const barwa = ok.querySelector<HTMLElement>('.z-barwa');
  const telefon = matchMedia('(max-width: 760px)');
  if (barwa) ok.querySelectorAll<HTMLElement>('.z-okl-dz').forEach((dz) => {
    const wlacz = () => { if (telefon.matches) return; barwa.dataset.dzial = dz.dataset.dzial || ''; ok.classList.add('zabarwione'); };
    const wylacz = () => ok.classList.remove('zabarwione');
    dz.addEventListener('mouseenter', wlacz);
    dz.addEventListener('mouseleave', wylacz);
    // fokus z klawiatury (po kliknięciu myszą wystarcza mouseenter; fokus po kliknięciu wracałby po powrocie „wstecz”)
    dz.addEventListener('focus', () => { if (dz.matches(':focus-visible')) wlacz(); });
    dz.addEventListener('blur', wylacz);
  });
  // powrót „wstecz” z pamięci przeglądarki (bfcache, zlecenie 13, punkt 7): strona wraca zabarwiona kolorem klikniętego
  // działu, a kursora nad nim już nie ma (mouseleave nie przyjdzie) — zdejmujemy barwienie
  window.addEventListener('pageshow', (e) => { if (e.persisted) ok.classList.remove('zabarwione'); });
}
