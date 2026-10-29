// Dopisuje ścieżkę bazową strony (np. /Web-Core) do linków i obrazków
// zaczynających się od "/" w treściach Markdown. Dzięki temu redaktorzy piszą
// zawsze "/pliki/…" albo "/studia/…", a strona działa i na GitHub Pages,
// i później pod domeną UWr.
export default function rehypeBase(options = {}) {
  const base = (options.base || '/').replace(/\/$/, '');
  const fix = (value) => {
    if (typeof value !== 'string') return value;
    if (!base) return value;
    if (!value.startsWith('/') || value.startsWith('//')) return value;
    if (value === base || value.startsWith(base + '/')) return value;
    return base + value;
  };
  const walk = (node) => {
    if (node.type === 'element' && node.properties) {
      if (node.tagName === 'a' && node.properties.href) node.properties.href = fix(node.properties.href);
      if ((node.tagName === 'img' || node.tagName === 'source') && node.properties.src) node.properties.src = fix(node.properties.src);
    }
    if (node.children) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
