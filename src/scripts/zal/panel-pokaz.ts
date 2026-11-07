// Panel „Pokaż” list (src/components/zal/ListaPokaz.astro; zlecenie 27): przyciski filtra (komputer) i lista wyboru (telefon) zawsze
// pokazują ten sam wybór, pole szukania filtruje przy każdym znaku. Co filtr i szukanie robią z listą, decyduje strona (zmiana()).
// Wartość spoza opcji (np. nieznana w adresie ?rodzaj=…) = „Wszystkie”.

// tekst do porównań: małe litery, bez polskich znaków (ł → l)
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');

export function panelPokaz(korzen: ParentNode, zmiana: () => void) {
  const przyciski = Array.from(korzen.querySelectorAll<HTMLButtonElement>('button[data-filtr]'));
  const lista = korzen.querySelector<HTMLSelectElement>('[data-filtr-lista]');
  const pole = korzen.querySelector<HTMLInputElement>('[data-szukaj]');
  let filtr = '';
  const znany = (w: string) => przyciski.some((b) => (b.dataset.filtr ?? '') === w);
  const ustaw = (w: string | null) => {
    filtr = w && znany(w) ? w : '';
    przyciski.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.filtr ?? '') === filtr)));
    if (lista) lista.value = filtr;
    zmiana();
  };
  przyciski.forEach((b) => b.addEventListener('click', () => ustaw(b.dataset.filtr ?? '')));
  lista?.addEventListener('change', () => ustaw(lista.value));
  pole?.addEventListener('input', zmiana);
  return {
    filtr: () => filtr,
    // szukany tekst po norm() (pusty = bez szukania)
    szukane: () => norm(pole?.value.trim() ?? ''),
    znany,
    ustaw,
  };
}
