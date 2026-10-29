import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { listaAktualnosci } from '../lib/tresci';
import { absolute } from '../lib/url';

export async function GET(context: APIContext) {
  const lista = (await listaAktualnosci()).slice(0, 30);
  return rss({
    title: 'Instytut Matematyczny UWr — aktualności',
    description: 'Ogłoszenia, wydarzenia i sukcesy Instytutu Matematycznego Uniwersytetu Wrocławskiego.',
    site: absolute('/', context.site),
    items: lista.map((p) => ({
      title: p.tytul,
      link: absolute(p.href, context.site),
      pubDate: new Date(`${p.data}T12:00:00+02:00`),
      description: p.zajawka,
    })),
    customData: '<language>pl</language>',
  });
}
