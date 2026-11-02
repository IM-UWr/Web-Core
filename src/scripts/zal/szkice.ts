// Szkice patronów na banerze działu (komputer, kierunek „Założyciele”; dok/estetyka.md, „Animacje” i „Przejścia”).
// Stan banera ustawia już skrypt w linii na końcu banera (NaglowekZ.astro), zanim strona się narysuje:
// - .z-czeka — pierwsze wejście w tej wizycie: szkic rysuje się, gdy jest widoczny (kontur 1,5 s z odstępem 45 ms,
//   detale się pojawiają), a podpis „pisze się” szybciej i później, tak żeby skończył się razem ze szkicem;
// - .z-gotowe — powrót w tej wizycie, ograniczony ruch, telefon albo brak zapisu w sessionStorage: od razu gotowe.
// Tu tylko tempo podpisu i start rysowania.
function zgrajPodpis(podpis: SVGSVGElement, od: number, czas: number) {
  const ps = Array.from(podpis.querySelectorAll<SVGPathElement>('mask path'));
  const dl = ps.map((p) => p.getTotalLength());
  const suma = dl.reduce((a, b) => a + b, 0) || 1;
  let t = od;
  ps.forEach((p, i) => {
    const d = (czas * dl[i]) / suma;
    p.style.animation = `z-pisz ${d.toFixed(3)}s linear ${t.toFixed(3)}s forwards`;
    t += d;
  });
}

document.querySelectorAll<HTMLElement>('[data-z-baner-dzialu]').forEach((baner) => {
  const szkic = baner.querySelector<SVGSVGElement>('.z-szkic');
  const podpis = baner.querySelector<SVGSVGElement>('.z-podpis.pisze');
  if (!baner.classList.contains('z-czeka') || !szkic) return;
  const koniec = 1.5 + ((szkic.querySelectorAll('.tusz path').length || 18) - 1) * 0.045;
  const start = () => {
    if (podpis) zgrajPodpis(podpis, koniec / 2, koniec / 2);
    // dwie klatki: przeglądarka musi najpierw narysować stan początkowy, żeby przejście ruszyło
    requestAnimationFrame(() => requestAnimationFrame(() => { baner.classList.add('z-rysuj'); baner.classList.remove('z-czeka'); }));
  };
  if (!('IntersectionObserver' in window)) return start();
  const io = new IntersectionObserver((wpisy) => {
    if (wpisy.some((w) => w.isIntersecting)) { io.disconnect(); start(); }
  });
  io.observe(szkic);
});
