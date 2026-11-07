// Wzory zapisane edytorem Pages CMS (zlecenie 28, etap 6a). TipTap nie zna wzorów: „$…$” to dla niego zwykły tekst, więc przy
// zapisie dopisuje ukośniki Markdownu — „$\ell^2$” → „$\\ell^2$”, „$a_1$” → „$a\_1$”, „$x^*$” → „$x^\*$” — a KaTeX
// pokazałby „\\” jako nową linię. Wzór z takim śladem (dwa ukośniki przed literą albo ukośnik przed „_” lub „*”) wraca
// do postaci sprzed zapisu; wzór wpisany w pliku bez edytora (bez śladu) zostaje bez zmian. Działa po remark-math.
// Czego nie da się cofnąć: przy wczytaniu edytor gubi ukośnik w „\{ \}” i zamienia pary „_…_” poza wzorem na kursywę.
const SLAD = /\\\\[A-Za-z]|\\[_*]/;
const odwroc = (s) => s.replace(/\\([\\_*])/g, '$1');

function popraw(n, stary, nowy) {
  if (n.type === 'text' && n.value === stary) n.value = nowy;
  for (const d of n.children ?? []) popraw(d, stary, nowy);
}

function przejdz(n) {
  if ((n.type === 'inlineMath' || n.type === 'math') && SLAD.test(n.value)) {
    const stary = n.value;
    n.value = odwroc(stary);
    for (const h of n.data?.hChildren ?? []) popraw(h, stary, n.value);
  }
  for (const d of n.children ?? []) przejdz(d);
}

export default function remarkWzoryEdytora() {
  return (tree) => przejdz(tree);
}
