// Panel menu z hamburgera (src/components/zal/PanelMenu.astro): ten sam na komputerze i telefonie (zlecenie 18, punkt 6).
// Przycisk [data-z-menu-otworz] z aria-controls otwiera swój panel; krzyżyk, Esc i klik obok zamykają, fokus wraca na przycisk.
// Fokus przenosimy z preventScroll: zwykłe focus() na wysuwającym się panelu przesuwało całą okładkę w bok (prototyp).
// Skrypt wczytywany z okładki, paska i nagłówka telefonu: moduł wykonuje się raz, więc obsługa podpina się tylko raz.
import { MQ_KOMPUTER } from '../../lib/media';

const przyciski = [...document.querySelectorAll<HTMLButtonElement>('[data-z-menu-otworz]')];
const tlo = document.querySelector<HTMLElement>('[data-z-menu-tlo]');
const hdr = document.querySelector<HTMLElement>('.hdr');
let otwarty: { panel: HTMLElement; przycisk: HTMLButtonElement } | null = null;

// Telefon (hamburger w nagłówku, Naglowek.astro): panel pod nagłówkiem, strona przyciemniona i nieprzewijalna, ikona zmienia się w krzyżyk
function ustawTelefon(przycisk: HTMLButtonElement, otw: boolean) {
  if (!przycisk.hasAttribute('data-burger')) return;
  if (otw && hdr) document.documentElement.style.setProperty('--menu-top', `${Math.max(0, Math.round(hdr.getBoundingClientRect().bottom))}px`);
  tlo?.classList.toggle('otwarte', otw);
  hdr?.classList.toggle('menu-otwarte', otw);
  document.documentElement.classList.toggle('menu-otwarte', otw);
  przycisk.setAttribute('aria-label', (otw ? przycisk.dataset.zamknij : przycisk.dataset.otworz) || '');
}

function zamknij(zwrocFokus = true) {
  if (!otwarty) return;
  const { panel, przycisk } = otwarty;
  panel.classList.remove('otwarte');
  przycisk.setAttribute('aria-expanded', 'false');
  ustawTelefon(przycisk, false);
  otwarty = null;
  if (zwrocFokus) przycisk.focus({ preventScroll: true });
}

// Zwijane działy (zlecenie 14, zalecenie 24): bez JS grupy są widoczne; skrypt włącza zwijanie klasą .zwijane na panelu.
// Przycisk przy nazwie działu rozwija jego grupy, otwarty jest jeden dział naraz.
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

// Przy każdym otwarciu panel wraca do tego samego stanu: rozwinięty dział, w którym jesteś (poza działami wszystkie zwinięte;
// section[data-biezacy] wyznacza PanelMenu.astro), panel od góry, a bieżący link w widocznej części. Przewija się sam panel, bez animacji.
// Ten stan ustawia się bez animacji wysokości (.bez-animacji, zlecenie 20, punkt 1): pomiar bieżącego linku trafiłby w grupy jeszcze zwinięte.
function stanPoczatkowy(panel: HTMLElement) {
  panel.classList.add('bez-animacji');
  requestAnimationFrame(() => panel.classList.remove('bez-animacji'));
  zwinWszystkie(panel);
  const b = panel.querySelector<HTMLButtonElement>('section[data-biezacy] [data-z-menu-rozwin]');
  if (b) ustawDzial(b, true);
  panel.scrollTop = 0;
  const link = panel.querySelector('[aria-current="page"]')?.getBoundingClientRect();
  const dol = panel.getBoundingClientRect().bottom;
  if (link && link.bottom > dol) panel.scrollTop = Math.ceil(link.bottom - dol + 24);
}

function otworz(przycisk: HTMLButtonElement) {
  const panel = document.getElementById(przycisk.getAttribute('aria-controls') || '');
  if (!panel) return;
  zamknij(false);
  ustawTelefon(przycisk, true);
  stanPoczatkowy(panel);
  panel.classList.add('otwarte');
  przycisk.setAttribute('aria-expanded', 'true');
  otwarty = { panel, przycisk };
  // na telefonie krzyżyk panelu jest schowany (krzyżykiem jest hamburger): fokus na sam panel, następny Tab wchodzi w jego pozycje
  if (przycisk.hasAttribute('data-burger')) panel.focus({ preventScroll: true });
  else panel.querySelector<HTMLElement>('[data-z-menu-zamknij]')?.focus({ preventScroll: true });
}

przyciski.forEach((b) => b.addEventListener('click', () => (otwarty?.przycisk === b ? zamknij() : otworz(b))));
document.querySelectorAll<HTMLButtonElement>('[data-z-menu-zamknij]').forEach((b) => b.addEventListener('click', () => zamknij()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && otwarty) zamknij(); });
document.addEventListener('click', (e) => {
  if (!otwarty) return;
  const cel = e.target as Element;
  // nagłówek telefonu zostaje w użyciu (np. tryb ciemny przy otwartym panelu); klik w przyciemnienie oddaje fokus przyciskowi
  if (!cel.closest('[data-z-menu], [data-z-menu-otworz], .hdr')) zamknij(!!cel.closest('[data-z-menu-tlo]'));
});
// powrót przyciskiem „wstecz” z pamięci przeglądarki (bfcache, zlecenie 13, punkt 7): strona wraca w stanie sprzed wyjścia,
// więc panel, z którego kliknięto link, byłby wciąż otwarty — zamykamy go
window.addEventListener('pageshow', (e) => { if (e.persisted) zamknij(false); });
// przejście między komputerem a telefonem (obrót, zmiana okna): panel się zamyka, żeby strona znów się przewijała, a przycisk był widoczny
window.matchMedia(MQ_KOMPUTER).addEventListener('change', () => zamknij(false));
