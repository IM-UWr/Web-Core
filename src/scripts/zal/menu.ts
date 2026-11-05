// Panel menu z hamburgera (src/components/zal/PanelMenu.astro) — na okładce i przy pasku menu (zlecenie 11, zalecenie 6).
// Przycisk [data-z-menu-otworz] z aria-controls otwiera swój panel; krzyżyk, Esc i klik obok zamykają, fokus wraca na przycisk.
// Fokus przenosimy z preventScroll: zwykłe focus() na wysuwającym się panelu przesuwało całą okładkę w bok (prototyp).
// Skrypt wczytywany z okładki i z paska — moduł wykonuje się raz, więc obsługa podpina się tylko raz.
const przyciski = [...document.querySelectorAll<HTMLButtonElement>('[data-z-menu-otworz]')];
let otwarty: { panel: HTMLElement; przycisk: HTMLButtonElement } | null = null;

function zamknij(zwrocFokus = true) {
  if (!otwarty) return;
  const { panel, przycisk } = otwarty;
  panel.classList.remove('otwarte');
  przycisk.setAttribute('aria-expanded', 'false');
  otwarty = null;
  if (zwrocFokus) przycisk.focus({ preventScroll: true });
}

// Zwijane działy (zlecenie 14, zalecenie 24): bez JS grupy są widoczne; skrypt włącza zwijanie klasą .zwijane na panelu.
// Przycisk przy nazwie działu rozwija jego grupy, otwarty jest jeden dział naraz; panel otwiera się ze zwiniętymi działami.
const panele = [...document.querySelectorAll<HTMLElement>('[data-z-menu]')];
panele.forEach((p) => p.classList.add('zwijane'));
function ustawDzial(b: HTMLButtonElement, otw: boolean) {
  b.setAttribute('aria-expanded', String(otw));
  b.closest('section')?.classList.toggle('rozwiniety', otw);
}
const zwinWszystkie = (panel: Element) => panel.querySelectorAll<HTMLButtonElement>('[data-z-menu-rozwin]').forEach((b) => ustawDzial(b, false));
panele.forEach((panel) => panel.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-z-menu-rozwin]');
  if (!b) return;
  const otw = b.getAttribute('aria-expanded') !== 'true';
  zwinWszystkie(panel);
  if (otw) ustawDzial(b, true);
}));

function otworz(przycisk: HTMLButtonElement) {
  const panel = document.getElementById(przycisk.getAttribute('aria-controls') || '');
  if (!panel) return;
  zamknij(false);
  zwinWszystkie(panel);
  panel.classList.add('otwarte');
  przycisk.setAttribute('aria-expanded', 'true');
  otwarty = { panel, przycisk };
  panel.querySelector<HTMLElement>('[data-z-menu-zamknij]')?.focus({ preventScroll: true });
}

przyciski.forEach((b) => b.addEventListener('click', () => (otwarty?.przycisk === b ? zamknij() : otworz(b))));
document.querySelectorAll<HTMLButtonElement>('[data-z-menu-zamknij]').forEach((b) => b.addEventListener('click', () => zamknij()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && otwarty) zamknij(); });
document.addEventListener('click', (e) => {
  if (!otwarty) return;
  const cel = e.target as Element;
  if (!cel.closest('[data-z-menu], [data-z-menu-otworz]')) zamknij(false);
});
// powrót przyciskiem „wstecz” z pamięci przeglądarki (bfcache, zlecenie 13, punkt 7): strona wraca w stanie sprzed wyjścia,
// więc panel, z którego kliknięto link, byłby wciąż otwarty — zamykamy go
window.addEventListener('pageshow', (e) => { if (e.persisted) zamknij(false); });
