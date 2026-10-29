import type { APIContext } from 'astro';
import { absolute } from '../lib/url';

export function GET(context: APIContext) {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml', context.site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
