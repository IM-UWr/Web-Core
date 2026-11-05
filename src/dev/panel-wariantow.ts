// Panel testowy skali (zlecenie 17, punkt 2): przycisk przy lewej krawędzi i panel z grupami wariantów. Tylko `astro dev`
// (dołącza src/plugins/panel-wariantow.mjs, tam też skrypt ustawiający atrybuty przed narysowaniem strony). Style i warianty:
// src/styles/test-warianty.css. Właściwe wdrożenie wybranego wariantu będzie osobnym zleceniem; wtedy panel można usunąć.
export {}; // moduł: nazwy funkcji nie mieszają się z innymi skryptami

const KLUCZ = 'warianty-skali';
const KLUCZ_OTWARTY = 'warianty-skali-otwarty';

type Grupa = 'tekst' | 'nagl' | 'odst' | 'baner' | 'akt';
type Stan = Partial<Record<Grupa, string>>;

// Pusta wartość to „obecny”: bez atrybutu na <html>.
const GRUPY: { id: Grupa; nazwa: string; opcje: [string, string][] }[] = [
  { id: 'tekst', nazwa: 'Tekst', opcje: [['', '17 / 1,68'], ['16', '16 / 1,6'], ['155', '15,5 / 1,55']] },
  { id: 'nagl', nazwa: 'Nagłówki', opcje: [['', '100%'], ['90', '90%'], ['80', '80%'], ['plynne', 'płynne']] },
  { id: 'odst', nazwa: 'Odstępy', opcje: [['', 'obecne'], ['25', '−25%'], ['40', '−40%'], ['plynne', 'płynne']] },
  { id: 'baner', nazwa: 'Banery', opcje: [['', 'obecne'], ['25', 'niższe'], ['40', 'niskie'], ['plynne', 'płynne']] },
  { id: 'akt', nazwa: 'Aktualności', opcje: [['', 'obecne'], ['zwarte', 'zwarte'], ['bardzo', 'bardzo zwarte']] },
];

const ZESTAWY: { nazwa: string; stan: Stan }[] = [
  { nazwa: 'Obecny', stan: {} },
  { nazwa: 'Ciaśniej', stan: { tekst: '16', nagl: '90', odst: '25', baner: '25', akt: 'zwarte' } },
  { nazwa: 'Mniej', stan: { tekst: '16', nagl: '80', odst: '40', baner: '40', akt: 'bardzo' } },
  { nazwa: 'Płynny', stan: { tekst: '16', nagl: 'plynne', odst: 'plynne', baner: 'plynne', akt: 'zwarte' } },
];

function czytaj(klucz: string): string | null {
  try { return localStorage.getItem(klucz); } catch { return null; }
}
function pisz(klucz: string, wartosc: string): void {
  try { localStorage.setItem(klucz, wartosc); } catch { /* bez zapisu: wariant działa do końca tej strony */ }
}
function wczytajStan(): Stan {
  try {
    const w: unknown = JSON.parse(czytaj(KLUCZ) || '{}');
    if (!w || typeof w !== 'object') return {};
    const stan: Stan = {};
    for (const g of GRUPY) {
      const v = (w as Record<string, unknown>)[g.id];
      if (typeof v === 'string' && g.opcje.some(([o]) => o === v)) stan[g.id] = v;
    }
    return stan;
  } catch { return {}; }
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, klasa?: string, tekst?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (klasa) e.className = klasa;
  if (tekst) e.textContent = tekst;
  return e;
}
function przycisk(tekst: string, klik: () => void, klasa?: string): HTMLButtonElement {
  const b = element('button', klasa, tekst);
  b.type = 'button';
  b.addEventListener('click', klik);
  return b;
}

let stan = wczytajStan();
const koren = document.documentElement;
const zakladka = element('button', 't-zakladka', 'Warianty');
const panel = element('div', 't-panel');
const okno = element('span', 't-okno');
const przyciskiZestawow: { b: HTMLButtonElement; stan: Stan }[] = [];
const przyciskiGrup: { b: HTMLButtonElement; id: Grupa; wartosc: string }[] = [];

function taki(a: Stan, b: Stan): boolean {
  return GRUPY.every((g) => (a[g.id] ?? '') === (b[g.id] ?? ''));
}

function pokaz(): void {
  for (const g of GRUPY) {
    const v = stan[g.id];
    if (v) koren.setAttribute(`data-t-${g.id}`, v);
    else koren.removeAttribute(`data-t-${g.id}`);
  }
  for (const p of przyciskiGrup) p.b.setAttribute('aria-pressed', String((stan[p.id] ?? '') === p.wartosc));
  for (const p of przyciskiZestawow) p.b.setAttribute('aria-pressed', String(taki(stan, p.stan)));
  zakladka.toggleAttribute('data-aktywne', GRUPY.some((g) => stan[g.id]));
}

function ustaw(nowy: Stan): void {
  stan = nowy;
  pisz(KLUCZ, JSON.stringify(stan));
  pokaz();
  // tytuły banerów liczą się skryptem przy zmianie rozmiaru okna, a długa kolumna głównej przy zmianie rozmiaru siatki
  window.dispatchEvent(new Event('resize'));
  const siatka = document.querySelector<HTMLElement>('[data-z-siatka]');
  if (siatka) {
    siatka.style.minHeight = `${siatka.offsetHeight + 1}px`;
    requestAnimationFrame(() => { siatka.style.minHeight = ''; });
  }
}

function otworz(otwarty: boolean, fokus = false): void {
  panel.hidden = !otwarty;
  zakladka.setAttribute('aria-expanded', String(otwarty));
  zakladka.hidden = otwarty;
  pisz(KLUCZ_OTWARTY, otwarty ? '1' : '');
  if (fokus) (otwarty ? panel.querySelector('button') : zakladka)?.focus();
}

function pokazOkno(): void {
  const dpr = String(Math.round(window.devicePixelRatio * 100) / 100).replace('.', ',');
  okno.textContent = `${window.innerWidth} × ${window.innerHeight} · ${dpr}`;
}

function zbuduj(): void {
  panel.id = 't-panel';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Warianty skali (test)');
  zakladka.type = 'button';
  zakladka.setAttribute('aria-controls', panel.id);
  zakladka.addEventListener('click', () => otworz(true, true));

  const glowa = element('div', 't-glowa');
  glowa.append(element('b', undefined, 'Warianty'), okno, przycisk('×', () => otworz(false, true), 't-zamknij'));
  panel.append(glowa);

  const zestawy = element('div', 't-grupa t-zestawy');
  const segZ = element('div', 't-seg');
  zestawy.append(element('span', undefined, 'Gotowe zestawy'), segZ);
  for (const z of ZESTAWY) {
    const b = przycisk(z.nazwa, () => ustaw({ ...z.stan }));
    przyciskiZestawow.push({ b, stan: z.stan });
    segZ.append(b);
  }
  panel.append(zestawy);

  for (const g of GRUPY) {
    const grupa = element('div', 't-grupa');
    const seg = element('div', 't-seg');
    grupa.append(element('span', undefined, g.nazwa), seg);
    for (const [wartosc, etykieta] of g.opcje) {
      const b = przycisk(etykieta, () => {
        const nowy: Stan = { ...stan };
        if (wartosc) nowy[g.id] = wartosc;
        else delete nowy[g.id];
        ustaw(nowy);
      });
      przyciskiGrup.push({ b, id: g.id, wartosc });
      seg.append(b);
    }
    panel.append(grupa);
  }
  panel.append(przycisk('Przywróć obecny', () => ustaw({}), 't-przywroc'));

  document.body.append(zakladka, panel);
  pokaz();
  pokazOkno();
  otworz(czytaj(KLUCZ_OTWARTY) === '1');

  window.addEventListener('resize', pokazOkno);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) otworz(false, true);
  });
  // powrót przyciskiem „wstecz” z pamięci przeglądarki: stan z ostatniej zmiany
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) { stan = wczytajStan(); pokaz(); pokazOkno(); }
  });
}

zbuduj();
