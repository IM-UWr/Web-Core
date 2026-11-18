// Zlecenie 33: odnośniki do szkiców (opublikowany: false), w jednym miejscu dla całej strony.
// - Podgląd: przy każdym linku do strony-szkicu (także podstrony szkicu, src/lib/szkice.ts) mała etykieta „szkic” / „draft” (menu, panel hamburgera, listy, kafelki,
//   „Następna strona w dziale”, linki w treści). Etykieta stoi po pierwszym <b> w linku (nazwa w menu), inaczej na końcu.
// - Flaga TYLKO_OPUBLIKOWANE=1 (przyszła strona publiczna): stron-szkiców nie ma; menu i listy pomijają je same
//   (widoczny(), menu.ts, kierunki.ts), a pozostałe linki do nich zamieniamy na sam tekst, z ostrzeżeniem w logu budowy.
// Bez szkiców w danych middleware nie zmienia niczego (HTML bajt w bajt jak bez niego). Styl etykiety idzie do <head> tylko tych
// stron, które ją mają, więc nie trafia do wspólnego CSS (ani na stronę publiczną).
import { defineMiddleware } from 'astro:middleware';
import { szkice as wczytajSzkice, adresDoPorownania } from './lib/szkice';
import { TYLKO_OPUBLIKOWANE } from './lib/tresci';
import { stripBase } from './lib/url';

const LINK = /<a\b([^>]*?)\shref="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g;
// Etykieta dyskretna: obrys w kolorze tekstu linku (działa na jasnym i ciemnym tle, w menu na banerze i na liście).
const STYL = '<style>.szkic-etykieta{display:inline-block;margin-inline-start:.45em;padding:0 .45em;border:1px solid currentColor;border-radius:999px;font-size:.68em;font-weight:600;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;vertical-align:.12em;white-space:nowrap;opacity:.8;text-decoration:none}</style>';
const ETYKIETA = {
  pl: '<span class="szkic-etykieta" title="Szkic: widoczny tylko na Podglądzie, nie trafi na stronę publiczną">szkic</span>',
  en: '<span class="szkic-etykieta" title="Draft: visible only in the preview, not on the public site">draft</span>',
};

export const onRequest = defineMiddleware(async (kontekst, dalej) => {
  const odp = await dalej();
  const sciezka = kontekst.url.pathname;
  const typ = odp.headers.get('content-type');
  if (typ ? !typ.includes('text/html') : /\.[a-z0-9]+$/i.test(sciezka) && !sciezka.endsWith('.html')) return odp;
  const szkice = await wczytajSzkice();
  if (!szkice.size) return odp;
  const html = await odp.text();
  const etykieta = /^\/en(\/|$)/.test(stripBase(sciezka)) ? ETYKIETA.en : ETYKIETA.pl;
  const nowy = html.replace(LINK, (caly, przed: string, href: string, po: string, srodek: string) => {
    if (!szkice.has(adresDoPorownania(href))) return caly;
    if (TYLKO_OPUBLIKOWANE) {
      console.warn(`[szkice] ${stripBase(sciezka)}: link do szkicu ${href} zamieniony na sam tekst`);
      return srodek;
    }
    if (srodek.includes('szkic-etykieta')) return caly;
    const b = srodek.indexOf('</b>');
    const z = b >= 0 ? srodek.slice(0, b + 4) + etykieta + srodek.slice(b + 4) : srodek + etykieta;
    return `<a${przed} href="${href}"${po}>${z}</a>`;
  });
  const zEtykieta = nowy !== html && nowy.includes('szkic-etykieta') ? nowy.replace('</head>', `${STYL}</head>`) : nowy;
  return new Response(zEtykieta, { status: odp.status, statusText: odp.statusText, headers: odp.headers });
});
