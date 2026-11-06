// Kolor paska u góry strony. Te same zasady na komputerze i na telefonie (zlecenie 21, punkt 2), inne tylko elementy i położenie.
// Komputer: przyklejony pasek menu (src/components/zal/PasekMenu.astro; zlecenie 11, zalecenie 6):
// - na samej górze, nad banerem — lekkie rozmycie i lekkie tło granatu (bez klasy; także bez JS; zlecenie 18, punkt 10);
// - po przewinięciu, dopóki pod paskiem jest baner — mocniejsze rozmycie z tym samym tłem, cień (.przewiniety);
// - nad treścią — jasny (.jasny). Strona bez banera: pełny granat zamiast rozmycia.
// Co jest pod paskiem, mówi IntersectionObserver: obszar obserwacji to linia okna na dolnej krawędzi paska, bo prześwitujący pasek
// może stać tylko nad samym banerem: gdy pod pasek wchodzi jasna treść, jest już jasny (zlecenie 18, punkt 10). Panel hamburgera
// przy pasku dostaje ten sam kolor (.z-menu-jasny). Strona główna ma własny, zawsze jasny pasek — tu pomijany.
// Stopka w oknie (na komputerze i telefonie, uwaga właściciela z 6.11, zmienia „nad stopką” z punktu 2): pasek w kolorze stopki, pełny granat
// (.przy-stopce). Liczy się samo pojawienie się stopki na dole okna, bo jest niska i pod pasek zwykle nie dochodzi. Strona główna bez tego.
// Telefon (≤ 760 px): nagłówek .hdr (src/components/Naglowek.astro), style w src/styles/zal-telefon.css. Stoi w układzie strony, więc:
// - strona z banerem: na górze pełny granat (pod paskiem nie ma jeszcze banera, prześwit dałby szarość), dalej jak na komputerze;
// - strona bez banera: na górze pełny granat, po przewinięciu jasny;
// - strona główna: nad okładką pełny granat, od krawędzi Szybkiego dostępu zawsze jasny, także przy stopce;
// - co jest pod paskiem, sprawdza linia 1 px tuż pod jego dolną krawędzią (na komputerze tuż nad nią): przy scrollY 0 baner zaczyna się
//   dokładnie na tej krawędzi, a na krawędzi Szybkiego dostępu okładka dokładnie na niej się kończy.
// Panel hamburgera ma kolor nagłówka. Panel strony głównej ma klasę .z-menu-jasny na stałe: na telefonie przełącza ją skrypt,
// a na komputerze panel zostaje jasny, także po obróceniu telefonu lub zmianie szerokości okna.
import { MQ_TELEFON } from '../../lib/media';

const TELEFON = matchMedia(MQ_TELEFON);
const baner = document.querySelector<HTMLElement>('.z-nagl');
const stopka = document.querySelector<HTMLElement>('.z-stopka');
const pasek = document.querySelector<HTMLElement>('[data-z-pasek]:not(.z-pasek-jasny)');

// obserwator, a nie zdarzenie scroll: stopka wchodzi w okno także bez przewijania, np. po zawężeniu listy filtrem
let stopkaWOknie = !!stopka && stopka.getBoundingClientRect().top < window.innerHeight;
const poStopce: (() => void)[] = [];
if (stopka) new IntersectionObserver((wpisy) => {
  stopkaWOknie = wpisy[wpisy.length - 1].isIntersecting;
  poStopce.forEach((f) => f());
}).observe(stopka);

if (pasek) {
  const panel = document.getElementById(pasek.querySelector('[data-z-menu-otworz]')?.getAttribute('aria-controls') || '');
  const pod = new Set<Element>();
  let obs: IntersectionObserver | null = null;

  const ustaw = () => {
    const przewiniety = window.scrollY > 2;
    // bez banera pasek stoi na górze w zwykłym układzie (na granacie) i jaśnieje dopiero po przewinięciu
    const ciemny = pod.size > 0 || (!baner && !przewiniety) || stopkaWOknie;
    pasek.classList.toggle('przewiniety', przewiniety);
    pasek.classList.toggle('jasny', !ciemny);
    pasek.classList.toggle('przy-stopce', stopkaWOknie);
    if (!TELEFON.matches) panel?.classList.toggle('z-menu-jasny', !ciemny);
  };

  const obserwuj = () => {
    obs?.disconnect();
    pod.clear();
    const h = pasek.offsetHeight || 66;
    // stan od razu, z położenia (pierwsza odpowiedź obserwatora przychodzi dopiero po klatce — bez mignięcia jasnym)
    if (baner) { const r = baner.getBoundingClientRect(); if (r.top < h && r.bottom >= h) pod.add(baner); }
    obs = new IntersectionObserver((wpisy) => {
      wpisy.forEach((w) => (w.isIntersecting ? pod.add(w.target) : pod.delete(w.target)));
      ustaw();
    }, { rootMargin: `${-(h - 1)}px 0px ${-(Math.max(1, window.innerHeight - h))}px 0px`, threshold: 0 });
    if (baner) obs.observe(baner);
  };

  let rama = 0;
  window.addEventListener('scroll', () => { cancelAnimationFrame(rama); rama = requestAnimationFrame(ustaw); }, { passive: true });
  let czas = 0;
  window.addEventListener('resize', () => { clearTimeout(czas); czas = window.setTimeout(obserwuj, 150); });
  TELEFON.addEventListener('change', ustaw);
  poStopce.push(ustaw);
  obserwuj();
  ustaw();
}

const hdr = document.querySelector<HTMLElement>('.hdr');

if (hdr) {
  const okladka = document.querySelector<HTMLElement>('.z-okladka');
  const szybkiDostep = document.getElementById('szybki-dostep');
  const panel = document.getElementById(hdr.querySelector('[data-z-menu-otworz]')?.getAttribute('aria-controls') || '');
  const pod = (el: Element | null, h: number) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return Math.round(r.top) <= h && Math.round(r.bottom) > h;
  };
  // Okładka pod paskiem, liczona od Szybkiego dostępu: sama okładka bywa bez pudełka (schowana na dotyku, src/scripts/zal/przejazd.ts),
  // a przy wejściu strony jest przesunięta o 12 px w dół (przejscia.css), więc jej góra byłaby wtedy poniżej paska.
  const nadOkladka = (h: number) => !document.documentElement.classList.contains('bez-okladki') && !!szybkiDostep && Math.round(szybkiDostep.getBoundingClientRect().top) > h;

  const ustaw = () => {
    if (!TELEFON.matches) {
      if (okladka) panel?.classList.add('z-menu-jasny');
      return;
    }
    const h = hdr.offsetHeight;
    const y = window.scrollY;
    let przewiniety = false;
    let ciemny: boolean;
    if (okladka) ciemny = nadOkladka(h);
    else if (baner) { przewiniety = y > h; ciemny = pod(baner, h) || stopkaWOknie; }
    else { przewiniety = y > 2; ciemny = !przewiniety || stopkaWOknie; }
    hdr.classList.toggle('przewiniety', przewiniety);
    hdr.classList.toggle('jasny', !ciemny);
    hdr.classList.toggle('przy-stopce', !okladka && stopkaWOknie);
    panel?.classList.toggle('z-menu-jasny', !ciemny);
  };

  let rama = 0;
  window.addEventListener('scroll', () => { cancelAnimationFrame(rama); rama = requestAnimationFrame(ustaw); }, { passive: true });
  window.addEventListener('resize', ustaw);
  window.addEventListener('pageshow', ustaw);
  document.addEventListener('animationend', (e) => { if (e.animationName === 'wejscie') ustaw(); }); // koniec przesunięcia przy wejściu strony
  TELEFON.addEventListener('change', ustaw);
  poStopce.push(ustaw);
  ustaw();
}
export {}; // moduł, nie skrypt globalny: nazwa hdr jest też w menu.ts (astro check)
