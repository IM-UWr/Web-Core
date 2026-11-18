// „… czytaj dalej” w wierszach list aktualności (WierszAktualnosci.astro; zlecenie 18, punkt 3), wspólne dla listy Aktualności
// i strony Kariera (zlecenie 44): dopisek tylko w zajawce, która się nie mieści; bez znaczenia dla czytnika ekranu, bo klikalny jest
// cały wiersz. Tolerancja 1 px na zaokrąglenie wysokości linii (ucięta linia to co najmniej 20 px).
// Dwie fazy (zlecenie 50): najpierw same odczyty (czy zajawka ucięta), potem same zapisy. Odczyt po każdym zapisie wymuszał
// przeliczenie układu całej strony — przy 160 wpisach jedna raptowna zmiana szerokości okna dawała ponad 100 przeliczeń i klatkę
// ok. 1 s. Wynik bez zmian: .wa-dalej ma position: absolute (WierszAktualnosci.astro), więc nie zmienia wymiarów zajawki.
export function czytajDalej(pozycje: HTMLElement[], dopisek: string) {
  const zajawki: [HTMLElement, boolean][] = [];
  for (const p of pozycje) {
    const z = p.querySelector<HTMLElement>('.wa-zaj');
    if (!z || p.hidden) continue;
    zajawki.push([z, z.scrollHeight > z.clientHeight + 1]);
  }
  for (const [z, ucieta] of zajawki) {
    const d = z.querySelector('.wa-dalej');
    if (ucieta && !d) {
      const s = document.createElement('span');
      s.className = 'wa-dalej';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = dopisek;
      z.append(s);
    } else if (!ucieta && d) d.remove();
  }
}

// dopisek zależy od szerokości i fontu: po narysowaniu, po załadowaniu fontów i po zmianie rozmiaru okna
export function czytajDalejNaBiezaco(odswiez: () => void) {
  requestAnimationFrame(odswiez);
  document.fonts?.ready.then(odswiez);
  let klatka = 0;
  addEventListener('resize', () => { cancelAnimationFrame(klatka); klatka = requestAnimationFrame(odswiez); });
}
