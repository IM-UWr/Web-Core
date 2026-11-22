// PDF-y dla redaktorów — Edge z systemu (Playwright), A4. Jedyne miejsce PDF-ów to public/dla-redaktorow/ w Web-Core, więc
// strona publikuje je pod stałymi adresami (link otwiera od razu PDF):
//   https://im-uwr.github.io/Web-Podglad/dla-redaktorow/Mapa-CMS-IM-UWr.pdf
//   https://im-uwr.github.io/Web-Podglad/dla-redaktorow/Sciagawka-edytora-IM-UWr.pdf
// Zmiana mapy albo ściągawki: edycja źródła, ten skrypt, commit — te same nazwy plików i te same adresy, kopii nigdzie indziej
// (decyzja właściciela 22.11.2026, zlecenie 67).
// Uruchomienie (z katalogu Web-Core):  node skrypty/pdf-dla-redaktorow.mjs  [katalog wyjściowy; domyślnie public/dla-redaktorow]
// Źródło → plik:
//   dok/dla-redaktorow/mapa-cms.html → Mapa-CMS-IM-UWr.pdf (dwie strony; skrypt kończy się błędem, gdy wyjdzie inna liczba stron);
//   dok/sciagawka-edytora.md → Sciagawka-edytora-IM-UWr.pdf (Markdown z GFM → HTML, kolory jak w mapie; liczba stron dowolna,
//   numery stron w stopce).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const PLIKI = [
  { zrodlo: 'dok/dla-redaktorow/mapa-cms.html', pdf: 'Mapa-CMS-IM-UWr.pdf', stron: 2 },
  { zrodlo: 'dok/sciagawka-edytora.md', pdf: 'Sciagawka-edytora-IM-UWr.pdf', tytul: 'Ściągawka edytora — IM UWr' },
];
const wyjscie = process.argv[2] || 'public/dla-redaktorow';
fs.mkdirSync(wyjscie, { recursive: true });

// Markdown → samodzielna strona HTML do druku (style w środku, bez zewnętrznych plików)
const dzis = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Europe/Warsaw' });
const STYL = `
  @page { size: A4; margin: 13mm 14mm 15mm; }
  :root { --tekst: #1d2433; --szary: #5d6576; --linia: #d9dde5; --tlo: #f2f4f7; --link: #2a5a9c; --akcent: #24548a; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 9.4pt/1.45 'DejaVu Sans', 'Segoe UI', Verdana, sans-serif; color: var(--tekst); }
  .glowka { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4mm; padding-bottom: 2mm;
    border-bottom: 2px solid var(--akcent); color: var(--szary); font-size: 8pt; }
  .glowka b { color: var(--akcent); }
  h1 { margin: 0 0 3mm; font-size: 15pt; line-height: 1.2; }
  h2 { margin: 6mm 0 2mm; padding-bottom: 1mm; border-bottom: 1px solid var(--linia); font-size: 11.5pt; color: var(--akcent); break-after: avoid; }
  h3 { margin: 4mm 0 1.5mm; font-size: 10pt; break-after: avoid; }
  p { margin: 0 0 2mm; }
  ul, ol { margin: 0 0 2mm; padding-left: 5mm; }
  li { margin: .5mm 0; }
  a { color: var(--link); text-decoration: none; }
  code { font: 8.2pt/1.35 'DejaVu Sans Mono', Consolas, monospace; background: var(--tlo); padding: 0 .25em; border-radius: 2px; }
  pre { margin: 0 0 2.5mm; padding: 2mm 3mm; background: var(--tlo); border-left: 3px solid var(--linia); border-radius: 2px;
    white-space: pre-wrap; overflow-wrap: anywhere; break-inside: avoid; }
  pre code { padding: 0; background: none; font-size: 7.9pt; }
  blockquote { margin: 0 0 2.5mm; padding: 1.5mm 3mm; border-left: 3px solid var(--akcent); background: #f6f8fb; break-inside: avoid; }
  blockquote p:last-child { margin-bottom: 0; }
  table { width: 100%; margin: 0 0 3mm; border-collapse: collapse; font-size: 8.3pt; line-height: 1.35; }
  th, td { padding: 1.2mm 2mm; border: 1px solid var(--linia); text-align: left; vertical-align: top; }
  th { background: var(--tlo); }
  tr { break-inside: avoid; }
`;
const doHtml = async (plik, tytul) => {
  const md = fs.readFileSync(plik, 'utf8');
  const tresc = String(await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(md));
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>${tytul}</title><style>${STYL}</style></head><body>
<div class="glowka"><span><b>Instytut Matematyczny UWr</b> · strona w Pages CMS (app.pagescms.org)</span><span>stan z ${dzis}</span></div>
${tresc}</body></html>`;
};

const przegladarka = await chromium.launch({ channel: 'msedge' });
// układ jak przy druku: szerokość A4 bez marginesów (210 − 2 × 12 mm ≈ 703 px), media print
const strona = await przegladarka.newPage({ viewport: { width: 703, height: 1000 } });
await strona.emulateMedia({ media: 'print' });
let bledy = 0;
for (const { zrodlo, pdf, stron, tytul } of PLIKI) {
  if (zrodlo.endsWith('.md')) await strona.setContent(await doHtml(zrodlo, tytul), { waitUntil: 'load' });
  else await strona.goto(pathToFileURL(path.resolve(zrodlo)).href);
  await strona.evaluate(() => document.fonts.ready);
  // mapa: treść każdej strony A4 musi się zmieścić w swojej sekcji (inaczej Edge przeniesie resztę na dodatkową stronę)
  const za = await strona.evaluate(() => [...document.querySelectorAll('.strona')].map((s, i) => (s.scrollHeight > s.clientHeight + 1 ? i + 1 : 0)).filter(Boolean));
  const cel = path.join(wyjscie, pdf);
  const stopka = stron ? {} : {
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;padding:0 14mm;font:7pt 'Segoe UI',sans-serif;color:#5d6576;display:flex;justify-content:space-between"><span>${tytul}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  };
  await strona.pdf({ path: cel, preferCSSPageSize: true, printBackground: true, tagged: true, outline: !stron, ...stopka });
  const liczba = (fs.readFileSync(cel, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const ok = (!stron || liczba === stron) && !za.length;
  if (!ok) bledy++;
  console.log(`${ok ? 'OK ' : 'ŹLE'} ${pdf}: ${liczba} str.${stron ? ` (oczekiwane ${stron})` : ''}${za.length ? `; treść nie mieści się na stronie ${za.join(', ')}` : ''}`);
}
await przegladarka.close();
process.exit(bledy ? 1 : 0);
