// Dopisuje ścieżkę bazową strony (np. /Web-Core) do linków i obrazków
// zaczynających się od "/" w treściach Markdown. Dzięki temu redaktorzy piszą
// zawsze "/pliki/…" albo "/studia/…", a strona działa i na GitHub Pages,
// i później pod domeną UWr.
// Opcja lang: 'en' (teksty na stronach /en — src/lib/markdown.ts): linki wewnętrzne do stron dostają też /en, jak
// w wJezyku() (src/lib/i18n.ts) — redaktor pisze w polu angielskim „/studia/…”, a link prowadzi do „/en/studia/…”.
// Bez zmian: pliki (/pliki/, /grafiki/, adresy z rozszerzeniem, np. .pdf, .ics, .xml, .json) i adresy już z /en.
// Kotwica (#…) i zapytanie (?…) zostają.
const zEn = (value) => {
  const sciezka = value.split(/[?#]/)[0];
  if (/^\/(pliki|grafiki|pagefind|_astro)\//.test(sciezka) || /\.[a-z0-9]{2,5}$/i.test(sciezka)) return value;
  if (/^\/en(\/|$)/.test(sciezka)) return value;
  return sciezka === '/' ? '/en/' + value.slice(1) : '/en' + value;
};
export default function rehypeBase(options = {}) {
  const base = (options.base || '/').replace(/\/$/, '');
  const en = options.lang === 'en';
  const fix = (value, link) => {
    if (typeof value !== 'string') return value;
    if (!value.startsWith('/') || value.startsWith('//')) return value;
    if (base && (value === base || value.startsWith(base + '/'))) return value;
    if (en && link) value = zEn(value);
    return base ? base + value : value;
  };
  const walk = (node) => {
    if (node.type === 'element' && node.properties) {
      if (node.tagName === 'a' && node.properties.href) node.properties.href = fix(node.properties.href, true);
      if ((node.tagName === 'img' || node.tagName === 'source') && node.properties.src) node.properties.src = fix(node.properties.src, false);
    }
    if (node.children) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
