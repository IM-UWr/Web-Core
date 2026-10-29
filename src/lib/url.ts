// Budowanie adresów z uwzględnieniem ścieżki bazowej (np. /Web-Core na GitHub Pages).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export function u(path = '/'): string {
  if (!path) return BASE + '/';
  if (/^(https?:|mailto:|tel:|#|data:)/.test(path)) return path;
  if (BASE && (path === BASE || path.startsWith(BASE + '/'))) return path;
  const p = path.startsWith('/') ? path : '/' + path;
  return BASE + p;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

// Bezwzględny adres (do RSS, kalendarza, podglądów linków).
export function absolute(path: string, site: URL | undefined): string {
  if (isExternal(path)) return path;
  const origin = site ? site.origin : '';
  return origin + u(path);
}

// Ścieżka bez bazy — do porównywania z aktualnym adresem w menu.
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/';
  return pathname;
}
