// node podglad.js plik.html wyjscie-prefiks [szerokosc] [akcje JSON]
const { chromium } = require('playwright');
const [plik, wy, szer = '1360', akcje = '[]'] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const tryb of (process.env.TRYBY || 'light').split(',')) {
    const p = await b.newPage({ viewport: { width: +szer, height: 900 }, colorScheme: tryb });
    const bledy = [];
    const fs = require('fs');
    await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fs.readFileSync('/home/claude/estetyka/fonty/lokalne.css', 'utf8') }));
    await p.route('https://fonts.gstatic.com/lok/**', (r) => { const u = new URL(r.request().url()); r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync('/home/claude/estetyka/fonty/node_modules/' + decodeURIComponent(u.pathname.replace('/lok/', ''))) }); });
    p.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
    p.on('pageerror', (e) => bledy.push(e.message));
    const html = require('fs').readFileSync(plik, 'utf8');
    await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + html + '</body></html>', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    let i = 0;
    for (const a of JSON.parse(akcje)) {
      if (a.klik) await p.click(a.klik);
      if (a.hover) await p.hover(a.hover);
      if (a.czekaj) await p.waitForTimeout(a.czekaj);
      if (a.zrzut) { if (a.el) await (await p.$(a.el)).screenshot({ path: `${wy}-${tryb}-${a.zrzut}.png` }); else await p.screenshot({ path: `${wy}-${tryb}-${a.zrzut}.png`, fullPage: !!a.cala }); i++; }
    }
    if (!i) await p.screenshot({ path: `${wy}-${tryb}.png`, fullPage: true });
    const szerokosc = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(tryb, 'bledy:', bledy.length ? bledy : 'brak', 'scrollWidth', szerokosc);
    await p.close();
  }
  await b.close();
})();
