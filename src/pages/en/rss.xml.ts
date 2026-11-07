// Kanał RSS aktualności po angielsku (/en/rss.xml): tytuły i zajawki z pól *_en (bez nich — polskie), linki do stron /en.
// Polski kanał: src/pages/rss.xml.ts. Na stronach /en <head> wskazuje ten kanał (src/layouts/Baza.astro).
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { listaAktualnosci } from '../../lib/tresci';
import { absolute } from '../../lib/url';
import { wJezyku } from '../../lib/i18n';

export async function GET(context: APIContext) {
  const lista = (await listaAktualnosci('en')).slice(0, 30);
  return rss({
    title: 'Mathematical Institute, University of Wrocław — news',
    description: 'Announcements, events and achievements of the Mathematical Institute, University of Wrocław.',
    site: absolute('/en/', context.site),
    items: lista.map((p) => ({
      title: p.tytul,
      link: absolute(wJezyku(p.href, 'en'), context.site),
      pubDate: new Date(`${p.data}T12:00:00+02:00`),
      description: p.zajawka,
    })),
    customData: '<language>en</language>',
  });
}
