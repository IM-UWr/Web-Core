// PDF-y dla redaktorów (Web-Podglad/dla-redaktorow/) z źródeł HTML w dok/dla-redaktorow/ — Edge z systemu (Playwright), A4.
// Uruchomienie:  node skrypty/pdf-dla-redaktorow.mjs <katalog wyjściowy, np. ..\Web-Podglad\dla-redaktorow>
// Źródło → plik: mapa-cms.html → Mapa-CMS-IM-UWr.pdf (dwie strony; skrypt kończy się błędem, gdy wyjdzie inna liczba stron).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const PLIKI = [['mapa-cms.html', 'Mapa-CMS-IM-UWr.pdf', 2]];
const [wyjscie] = process.argv.slice(2);
if (!wyjscie) { console.error('Użycie: node skrypty/pdf-dla-redaktorow.mjs <katalog wyjściowy>'); process.exit(2); }
fs.mkdirSync(wyjscie, { recursive: true });

const przegladarka = await chromium.launch({ channel: 'msedge' });
// układ jak przy druku: szerokość A4 bez marginesów (210 − 2 × 12 mm ≈ 703 px), media print
const strona = await przegladarka.newPage({ viewport: { width: 703, height: 1000 } });
await strona.emulateMedia({ media: 'print' });
let bledy = 0;
for (const [zrodlo, pdf, stron] of PLIKI) {
  await strona.goto(pathToFileURL(path.resolve('dok/dla-redaktorow', zrodlo)).href);
  await strona.evaluate(() => document.fonts.ready);
  // treść każdej strony A4 musi się zmieścić w swojej sekcji (inaczej Edge przeniesie resztę na dodatkową stronę)
  const za = await strona.evaluate(() => [...document.querySelectorAll('.strona')].map((s, i) => (s.scrollHeight > s.clientHeight + 1 ? i + 1 : 0)).filter(Boolean));
  const cel = path.join(wyjscie, pdf);
  await strona.pdf({ path: cel, preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
  const liczba = (fs.readFileSync(cel, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const ok = liczba === stron && !za.length;
  if (!ok) bledy++;
  console.log(`${ok ? 'OK ' : 'ŹLE'} ${pdf}: ${liczba} str. (oczekiwane ${stron})${za.length ? `; treść nie mieści się na stronie ${za.join(', ')}` : ''}`);
}
await przegladarka.close();
process.exit(bledy ? 1 : 0);
