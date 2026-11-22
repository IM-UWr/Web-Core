// Przełącznik języka zabiera bieżącą #kotwicę (decyzja właściciela z 22.11, po zleceniu 59): {#id} sekcji są wspólne w PL i EN,
// więc po zmianie języka czytelnik zostaje w tej samej sekcji zamiast wracać na górę strony. Bez kotwicy w adresie link prowadzi
// jak dotąd na górę strony w drugim języku.
// Przełączniki: a.z-jezyk w pasku menu (zal/PasekMenu.astro), w nagłówku telefonu (Naglowek.astro) i na okładce (zal/Okladka.astro).
// Kotwica trafia do adresu po kliknięciu w spis „Na tej stronie” (history.replaceState — bez zdarzenia hashchange), po kliknięciu
// linku z kotwicą albo z adresu wpisanego ręcznie, dlatego href ustawiamy tuż przed użyciem linku: przy najechaniu (zanim reguły
// speculationrules złożą stronę w tle), fokusie, naciśnięciu, kliknięciu (także środkowym i z Ctrl) i menu kontekstowym.
// Kotwica, której nie ma na stronie w drugim języku, niczego nie psuje: strona otwiera się u góry.
const ZDARZENIA = ['pointerover', 'focusin', 'pointerdown', 'click', 'auxclick', 'contextmenu'];

for (const typ of ZDARZENIA) {
  document.addEventListener(typ, (e) => {
    const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a.z-jezyk') : null;
    if (a && a.hash !== location.hash) a.hash = location.hash; // pusty hash usuwa kotwicę z linku
  }, { capture: true, passive: true });
}
