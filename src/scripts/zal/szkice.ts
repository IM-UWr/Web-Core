// Szkice patronów na banerze działu (komputer, kierunek „Założyciele”; dok/estetyka.md, „Animacje”).
// - Szkic i podpis rysują się tylko przy pierwszym wejściu na stronę działu w danej wizycie (flaga w sessionStorage).
//   Przy powrocie (np. z podstrony przez „← Dział”) są od razu gotowe. Gdy flagi nie da się zapisać — jak przy powrocie.
// - Animacja rusza dopiero, gdy szkic jest widoczny na ekranie, i nie powtarza się.
// - Podpis „pisze się” szybciej i startuje później, tak żeby skończył się razem ze szkicem (tempo wg długości linii prowadzących).
// - prefers-reduced-motion: od razu stan końcowy (CSS dodaje tylko krótkie rozjaśnienie).
// Bez JS szkic i podpis są od razu narysowane (klasy .rysuj / .gotowe ustawia tylko ten skrypt, CSS ukrywa szkic tylko pod .js).
const KLUCZ = 'im-wizyta-dzialy';
const RUCH = matchMedia('(prefers-reduced-motion: reduce)');
// baner działu jest tylko na komputerze — na telefonie nie zużywamy flagi wizyty
const KOMPUTER = matchMedia('(min-width: 761px)');

function pierwszeWejscie(dzial: string): boolean {
  try {
    const z: string[] = JSON.parse(sessionStorage.getItem(KLUCZ) || '[]');
    if (z.includes(dzial)) return false;
    z.push(dzial);
    sessionStorage.setItem(KLUCZ, JSON.stringify(z));
    // zapis mógł się nie udać po cichu (np. tryb prywatny) — sprawdzamy
    return (JSON.parse(sessionStorage.getItem(KLUCZ) || '[]') as string[]).includes(dzial);
  } catch {
    return false;
  }
}

// Kontur: 1,5 s na kreskę i 45 ms odstępu między kolejnymi (jak w prototypie) — koniec rysowania szkicu.
function koniecSzkicu(szkic: SVGSVGElement): number {
  const n = szkic.querySelectorAll('.tusz path').length || 18;
  return 1.5 + (n - 1) * 0.045;
}

function zgrajPodpis(podpis: SVGSVGElement, koniec: number) {
  const ps = Array.from(podpis.querySelectorAll<SVGPathElement>('mask path'));
  const dl = ps.map((p) => p.getTotalLength());
  const suma = dl.reduce((a, b) => a + b, 0) || 1;
  // podpis startuje w połowie rysowania szkicu i kończy się razem z nim
  let t = koniec / 2;
  ps.forEach((p, i) => {
    const d = ((koniec / 2) * dl[i]) / suma;
    p.style.animation = `z-pisz ${d.toFixed(3)}s linear ${t.toFixed(3)}s forwards`;
    t += d;
  });
}

document.querySelectorAll<HTMLElement>('[data-z-baner-dzialu]').forEach((baner) => {
  const dzial = baner.dataset.zBanerDzialu || '';
  const szkic = baner.querySelector<SVGSVGElement>('.z-szkic');
  const podpis = baner.querySelector<SVGSVGElement>('.z-podpis.pisze');
  const gotowe = () => baner.classList.add('z-gotowe');
  if (!szkic || !KOMPUTER.matches || RUCH.matches || !pierwszeWejscie(dzial)) return gotowe();
  const start = () => {
    if (podpis) zgrajPodpis(podpis, koniecSzkicu(szkic));
    // dwie klatki: przeglądarka musi najpierw narysować stan początkowy, żeby przejście ruszyło
    requestAnimationFrame(() => requestAnimationFrame(() => baner.classList.add('z-rysuj')));
  };
  if (!('IntersectionObserver' in window)) return start();
  const io = new IntersectionObserver((wpisy) => {
    if (wpisy.some((w) => w.isIntersecting)) { io.disconnect(); start(); }
  });
  io.observe(szkic);
});
