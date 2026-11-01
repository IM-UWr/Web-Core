const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fs.readFileSync('fonty/lokalne.css', 'utf8') }));
  await p.route('https://fonts.gstatic.com/lok/**', (r) => { const u = new URL(r.request().url()); r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync('fonty/node_modules/' + decodeURIComponent(u.pathname.replace('/lok/', ''))) }); });
  await p.setContent('<!doctype html><html><head><meta charset=utf-8></head><body>' + fs.readFileSync(process.argv[2], 'utf8') + '</body></html>', { waitUntil: 'networkidle' });
  for (const sel of ['#e-1920', '#e-1536', '#e-1366']) {
    await p.click(sel); await p.waitForTimeout(400);
    const m = await p.evaluate(() => {
      const r = document.getElementById('ok-ramka'); r.style.scrollBehavior = 'auto';
      const okl = document.getElementById('ok-okladka').offsetHeight; r.scrollTop = okl;
      const top = r.getBoundingClientRect().top, sk = r.getBoundingClientRect().height / r.clientHeight;
      const y = (el) => Math.round((document.querySelector(el).getBoundingClientRect().bottom - top) / sk);
      return { okno: r.clientHeight, okladka: okl, pasek: y('.ok-pasek'), skroty: y('.ok-skr'), kol3: y('.ok-kol3'), studia: y('.ok-studia'), warto: y('.ok-warto'), stopka: y('.ok-stopka') };
    });
    console.log(sel, JSON.stringify(m));
    if (sel === '#e-1920') await (await p.$('#ok-ramka')).screenshot({ path: 'podglad/fhd-pod.png' });
  }
  await b.close();
})();
