// „… czytaj dalej” w wierszach list aktualności (WierszAktualnosci.astro; zlecenie 18, punkt 3), wspólne dla listy Aktualności
// i strony Kariera (zlecenie 44): dopisek tylko w zajawce, która się nie mieści; bez znaczenia dla czytnika ekranu, bo klikalny jest
// cały wiersz. Tolerancja 1 px na zaokrąglenie wysokości linii (ucięta linia to co najmniej 20 px).
export function czytajDalej(pozycje: HTMLElement[], dopisek: string) {
  for (const p of pozycje) {
    const z = p.querySelector<HTMLElement>('.wa-zaj');
    if (!z || p.hidden) continue;
    const d = z.querySelector('.wa-dalej');
    const ucieta = z.scrollHeight > z.clientHeight + 1;
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
