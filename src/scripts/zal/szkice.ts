// Szkice patronów na banerze działu (komputer i telefon, kierunek „Założyciele”; dok/estetyka.md, „Animacje” i „Przejścia”).
// Stan banera i start rysowania ustawia skrypt w linii na końcu banera (NaglowekZ.astro), zanim strona się narysuje — szkic
// nie czeka na ten moduł (zlecenie 13, punkt 2):
// - .z-czeka — pierwsze wejście w dział w tej wizycie: szkic czeka niewidoczny, aż będzie widać; potem .z-rysuj (kontur 1,5 s
//   z odstępem 45 ms, detale się pojawiają), czas startu w data-z-start i zdarzenie „z-rysuj”;
// - .z-gotowe — powrót w tej wizycie, ograniczony ruch albo brak zapisu w sessionStorage: od razu gotowe.
// Tu tylko tempo podpisu: „pisze się” w drugiej połowie rysowania szkicu, kreska po kresce (czas proporcjonalny do długości),
// tak żeby skończył się razem ze szkicem. Moduł spóźniony — opóźnienia pomniejszone o czas od startu; po końcu szkicu podpis
// zostaje zastępczej animacji z CSS (z-pisz-zast).
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
  if (!szkic || !podpis) return;
  const koniec = 1.5 + ((szkic.querySelectorAll('.tusz path').length || 18) - 1) * 0.045;
  const zgraj = () => {
    const minelo = (performance.now() - Number(baner.dataset.zStart)) / 1000;
    if (minelo >= 0 && minelo < koniec - 0.05) zgrajPodpis(podpis, koniec / 2 - minelo, koniec / 2);
  };
  if (baner.dataset.zStart) zgraj();
  else if (baner.classList.contains('z-czeka')) baner.addEventListener('z-rysuj', zgraj, { once: true });
});
