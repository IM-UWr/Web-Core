// Panel menu z hamburgera (src/components/zal/PanelMenu.astro): ten sam na komputerze i telefonie (zlecenie 18, punkt 6).
// Przycisk [data-z-menu-otworz] z aria-controls otwiera swój panel; krzyżyk, ponowny klik przycisku, Esc i klik obok zamykają,
// fokus wraca na przycisk. Na komputerze panel to zwarta lista pod przyciskiem (zlecenie 32): położenie liczy ustawPolozenie().
// Fokus przenosimy z preventScroll: zwykłe focus() na wysuwającym się panelu przesuwało całą okładkę w bok (prototyp).
// Skrypt wczytywany z okładki, paska i nagłówka telefonu: moduł wykonuje się raz, więc obsługa podpina się tylko raz.
import { MQ_KOMPUTER, MQ_TELEFON } from '../../lib/media';

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

// Przy każdym otwarciu panel wraca do tego samego stanu, od góry. Telefon: wszystkie działy zwinięte, menu nie wskazuje, gdzie jesteś
// (prośba właściciela, 6.11). Komputer: rozwinięty dział, w którym jesteś (poza działami wszystkie zwinięte; section[data-biezacy]
// wyznacza PanelMenu.astro), a bieżący link w widocznej części. Przewija się sam panel, bez animacji.
// Ten stan ustawia się bez animacji wysokości (.bez-animacji, zlecenie 20, punkt 1): pomiar bieżącego linku trafiłby w grupy jeszcze zwinięte.
function stanPoczatkowy(panel: HTMLElement) {
  panel.classList.add('bez-animacji');
  requestAnimationFrame(() => panel.classList.remove('bez-animacji'));
  zwinWszystkie(panel);
  panel.scrollTop = 0;
  if (window.matchMedia(MQ_TELEFON).matches) return;
  const b = panel.querySelector<HTMLButtonElement>('section[data-biezacy] [data-z-menu-rozwin]');
  if (b) ustawDzial(b, true);
  const link = panel.querySelector('[aria-current="page"]')?.getBoundingClientRect();
  const dol = panel.getBoundingClientRect().bottom;
  if (link && link.bottom > dol) panel.scrollTop = Math.ceil(link.bottom - dol + 24);
}

// Komputer (zlecenie 32): lista tuż pod przyciskiem, który ją otworzył — góra 8 px pod nim, prawa krawędź równo z nim, co najmniej 16 px
// od krawędzi okna; wysokość najwyżej do 16 px nad dołem okna (dalej przewijanie w liście). Przy pasku lista jest stała (fixed),
// na okładce w obrębie okładki (absolute), więc --menu-x i --menu-y liczymy od jej bloku zawierającego.
function ustawPolozenie(panel: HTMLElement, przycisk: HTMLButtonElement) {
  if (przycisk.hasAttribute('data-burger') || !window.matchMedia(MQ_KOMPUTER).matches) return;
  const b = przycisk.getBoundingClientRect();
  const szer = document.documentElement.clientWidth;
  const rodzic = getComputedStyle(panel).position === 'fixed' ? null : (panel.offsetParent as HTMLElement | null)?.getBoundingClientRect();
  const gora = b.bottom + 8;
  const prawa = Math.max(16, szer - b.right);
  panel.style.setProperty('--menu-y', `${gora - (rodzic ? rodzic.top : 0)}px`);
  panel.style.setProperty('--menu-x', `${prawa - (rodzic ? szer - rodzic.right : 0)}px`);
  panel.style.setProperty('--menu-max-h', `${Math.max(200, Math.floor(window.innerHeight - gora - 16))}px`);
}

function otworz(przycisk: HTMLButtonElement) {
  const panel = document.getElementById(przycisk.getAttribute('aria-controls') || '');
  if (!panel) return;
  zamknij(false);
  ustawTelefon(przycisk, true);
  ustawPolozenie(panel, przycisk);
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
// Komputer: Tab za ostatnią pozycją listy (fokus przechodzi poza listę i jej przycisk) zamyka listę, fokus idzie dalej po stronie.
// Shift+Tab z pierwszej pozycji wraca na hamburger i lista zostaje. relatedTarget null (klik w puste miejsce, wyjście z okna) nie zamyka.
panele.forEach((panel) => panel.addEventListener('focusout', (e) => {
  if (otwarty?.panel !== panel || !window.matchMedia(MQ_KOMPUTER).matches) return;
  const cel = (e as FocusEvent).relatedTarget as Node | null;
  if (cel && !panel.contains(cel) && cel !== otwarty.przycisk) zamknij(false);
}));
// zmiana rozmiaru okna albo przewinięcie (pasek może zmienić wysokość): lista zostaje pod swoim przyciskiem
let ramka = 0;
const popraw = () => { cancelAnimationFrame(ramka); ramka = requestAnimationFrame(() => { if (otwarty) ustawPolozenie(otwarty.panel, otwarty.przycisk); }); };
window.addEventListener('resize', popraw);
window.addEventListener('scroll', popraw, { passive: true });
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
