// Linki poza stronę w treściach Markdown (zlecenie 14, zalecenie 23): klasa `zew` (strzałka ↗ z CSS, global.css)
// i ukryty dopisek dla czytników ekranu „(inna strona)” / „(external site)”. Zewnętrzny = adres http(s) do innej strony
// niż nasza (site + base z astro.config.mjs; po przejściu na domenę UWr nic nie trzeba zmieniać) — ta sama zasada
// co isExternal() w src/lib/url.ts. Bez zmian: mailto:, tel:, kotwice, linki wewnętrzne i nasze pliki.
// Opcje: site (np. 'https://im-uwr.github.io'), base (np. '/Web-Core'), lang ('pl' | 'en').
export function zewnetrzny(href, site, base = '/') {
  if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return false;
  let a, s;
  try { a = new URL(href); s = new URL(site); } catch { return true; }
  if (a.host !== s.host) return true;
  const b = (base || '/').replace(/\/$/, '');
  return !!b && !(a.pathname === b || a.pathname.startsWith(b + '/'));
}

export default function rehypeZewn(options = {}) {
  const { site = '', base = '/', lang = 'pl' } = options;
  const dopisek = lang === 'en' ? ' (external site)' : ' (inna strona)';
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && node.properties && zewnetrzny(String(node.properties.href ?? ''), site, base)) {
      const kl = node.properties.className;
      const lista = Array.isArray(kl) ? kl : typeof kl === 'string' ? kl.split(/\s+/) : [];
      if (!lista.includes('zew')) node.properties.className = [...lista, 'zew'];
      // ta sama karta (bez target="_blank"), więc bez noopener
      delete node.properties.target;
      node.children = [...(node.children || []), { type: 'element', tagName: 'span', properties: { className: ['sr-only'] }, children: [{ type: 'text', value: dopisek }] }];
    }
    if (node.children) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
