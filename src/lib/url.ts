// Budowanie adresów z uwzględnieniem ścieżki bazowej (np. /Web-Core na GitHub Pages).
import { zewnetrzny } from '../plugins/rehype-zewn.mjs';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const SITE = import.meta.env.SITE || 'https://im-uwr.github.io';

export function u(path = '/'): string {
  if (!path) return BASE + '/';
  if (/^(https?:|mailto:|tel:|#|data:)/.test(path)) return path;
  if (BASE && (path === BASE || path.startsWith(BASE + '/'))) return path;
  const p = path.startsWith('/') ? path : '/' + path;
  return BASE + p;
}

// Adres bezwzględny http(s) — także do naszej strony (np. pole CMS z pełnym adresem); do budowania href.
export function isAbsolute(href: string): boolean {
  return /^https?:\/\//.test(href);
}

// Link poza stronę (zlecenie 14, zalecenie 23): http(s) do innej strony niż nasza — inna domena niż `site`
// z astro.config.mjs albo ścieżka spoza bazy (/Web-Core). Inne strony UWr (rekrutacja, USOS, wydział, BIP) są zewnętrzne;
// mailto:, tel:, kotwice, linki wewnętrzne i nasze pliki — nie. Ta sama zasada w treściach Markdown (rehype-zewn.mjs).
export function isExternal(href: string): boolean {
  return zewnetrzny(href, SITE, BASE || '/');
}

// Bezwzględny adres (do RSS, kalendarza, podglądów linków).
export function absolute(path: string, site: URL | undefined): string {
  if (isAbsolute(path)) return path;
  const origin = site ? site.origin : '';
  return origin + u(path);
}

// Ścieżka bez bazy — do porównywania z aktualnym adresem w menu.
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) return pathname.slice(BASE.length) || '/';
  return pathname;
}
