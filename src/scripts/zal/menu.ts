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

function otworz(przycisk: HTMLButtonElement) {
  const panel = document.getElementById(przycisk.getAttribute('aria-controls') || '');
  if (!panel) return;
  zamknij(false);
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
