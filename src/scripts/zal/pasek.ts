// Kolor przyklejonego paska menu (src/components/zal/PasekMenu.astro; zlecenie 11, zalecenie 6):
// - na samej górze, nad banerem — przezroczysty (jak dotąd);
// - po przewinięciu, dopóki pod paskiem jest baner — ciemny z mocnym rozmyciem (.przewiniety);
// - nad treścią — jasny (.jasny); nad stopką — znowu ciemny.
// Co jest pod paskiem, mówi IntersectionObserver: obszar obserwacji to pas okna o wysokości paska. Panel hamburgera
// przy pasku dostaje ten sam kolor (.z-menu-jasny). Strona główna ma własny, zawsze jasny pasek — tu pomijany.
const pasek = document.querySelector<HTMLElement>('[data-z-pasek]:not(.z-pasek-jasny)');

if (pasek) {
  const panel = document.getElementById(pasek.querySelector('[data-z-menu-otworz]')?.getAttribute('aria-controls') || '');
  const baner = document.querySelector<HTMLElement>('.z-nagl');
  const stopka = document.querySelector<HTMLElement>('.z-stopka');
  const pod = new Set<Element>();
  let obs: IntersectionObserver | null = null;

  const ustaw = () => {
    const przewiniety = window.scrollY > 2;
    // bez banera pasek stoi na górze w zwykłym układzie (na granacie) i jaśnieje dopiero po przewinięciu
    const ciemny = pod.size > 0 || (!baner && !przewiniety);
    pasek.classList.toggle('przewiniety', przewiniety);
    pasek.classList.toggle('jasny', !ciemny);
    panel?.classList.toggle('z-menu-jasny', !ciemny);
  };

  const obserwuj = () => {
    obs?.disconnect();
    pod.clear();
    const h = pasek.offsetHeight || 66;
    // stan od razu, z położenia (pierwsza odpowiedź obserwatora przychodzi dopiero po klatce — bez mignięcia jasnym)
    [baner, stopka].forEach((el) => { if (!el) return; const r = el.getBoundingClientRect(); if (r.top < h && r.bottom > 0) pod.add(el); });
    obs = new IntersectionObserver((wpisy) => {
      wpisy.forEach((w) => (w.isIntersecting ? pod.add(w.target) : pod.delete(w.target)));
      ustaw();
    }, { rootMargin: `0px 0px ${-(Math.max(1, window.innerHeight - h))}px 0px`, threshold: 0 });
    [baner, stopka].forEach((el) => el && obs!.observe(el));
  };

  let rama = 0;
  window.addEventListener('scroll', () => { cancelAnimationFrame(rama); rama = requestAnimationFrame(ustaw); }, { passive: true });
  let czas = 0;
  window.addEventListener('resize', () => { clearTimeout(czas); czas = window.setTimeout(obserwuj, 150); });
  obserwuj();
  ustaw();
}
