// Mapa strony dla wyszukiwarek (widoczne treści — przy fladze TYLKO_OPUBLIKOWANE tylko opublikowane, zlecenie 33; obie wersje językowe).
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { aktualnosci, obrony, seminaria, konferencje, granty, slugOf, widoczny, maTresc } from '../lib/tresci';
import { absolute } from '../lib/url';
import { wJezyku } from '../lib/i18n';
import { wykazy } from '../lib/widoki/publikacje';
import { specjalnosci } from '../lib/specjalnosci';
import { jestTekstemListy } from '../lib/tekstyStron';
import { powstaje } from '../lib/szkice';

export async function GET(context: APIContext) {
  const sciezki: string[] = ['/', '/instytut', '/nauka', '/studia', '/popularyzacja', '/aktualnosci', '/kalendarz', '/seminaria', '/pracownicy', '/obrony-doktorskie', '/nauka/konferencje', '/nauka/granty', '/nauka/sukcesy', '/studia/rok-akademicki'];
  for (const a of await aktualnosci()) sciezki.push(`/aktualnosci/${slugOf(a.id)}`);
  for (const o of await obrony()) sciezki.push(`/obrony-doktorskie/${slugOf(o.id)}`);
  for (const s of await seminaria()) sciezki.push(`/seminaria/${s.id}`);
  // własną stronę ma tylko konferencja z opisem (zlecenie 40; reszta prowadzi na zewnętrzną stronę konferencji)
  for (const k of await konferencje()) if (maTresc(k.body)) sciezki.push(`/nauka/konferencje/${slugOf(k.id)}`);
  for (const g of await granty()) sciezki.push(`/nauka/granty/${slugOf(g.id)}`);
  // teksty stron z listą (zlecenie 30) nie mają własnych stron — ich adresy są wyżej
  for (const s of await getCollection('strony')) if (widoczny(s) && !jestTekstemListy(s.id)) sciezki.push(`/${s.id}`);
  for (const k of await getCollection('kierunki')) if (widoczny(k)) sciezki.push(`/studia/${k.id}`);
  for (const z of await getCollection('zaklady')) if (widoczny(z)) sciezki.push(`/instytut/zaklady/${z.id}`);
  sciezki.push('/instytut/struktura', '/instytut/wladze');
  sciezki.push('/nauka/publikacje', ...Object.keys(wykazy).map((r) => `/nauka/publikacje/${r}`));
  for (const s of await specjalnosci()) if (widoczny(s) && !s.data.bez_podstrony) sciezki.push(`/studia/${s.data.kierunek}/${s.id}`);
  sciezki.push('/warto-wiedziec');
  for (const w of await getCollection('warto_wiedziec')) if (widoczny(w) && maTresc(w.body)) sciezki.push(`/warto-wiedziec/${slugOf(w.id)}`);
  sciezki.push('/studia/plan-zajec');
  const url = (p: string) => absolute(p, context.site);
  // podstrony szkiców (src/lib/szkice.ts) — przy fladze ich nie ma
  const powstajace = [];
  for (const p of sciezki) if (await powstaje(p)) powstajace.push(p);
  const wpisy = powstajace
    .map((p) => {
      const pl = url(p);
      const en = url(wJezyku(p, 'en'));
      const alt = `<xhtml:link rel="alternate" hreflang="pl" href="${pl}"/><xhtml:link rel="alternate" hreflang="en" href="${en}"/>`;
      return `<url><loc>${pl}</loc>${alt}</url><url><loc>${en}</loc>${alt}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${wpisy}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
