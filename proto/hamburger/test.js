const { chromium } = require('playwright'); const S = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1700, height: 1100 }, colorScheme: 'light', screen: { width: 1920, height: 1080 } });
  const p = await c.newPage();
  const bl = []; p.on('pageerror', (e) => bl.push(e.message));
  await p.route(/^https?:\/\/(?!127)/, (r) => r.abort());
  await p.goto('http://127.0.0.1:8766/hamburger.html');
  await p.waitForTimeout(2500);
  for (const mon of ['1366', '1536', '1920', '2560']) {
    await p.click(`[data-mn="${mon}"]`); await p.waitForTimeout(1500);
    for (const dz of ['', 'instytut', 'nauka', 'studia', 'popularyzacja']) {
      await p.click(`[data-dz="${dz}"]`); await p.waitForTimeout(500);
      const w = await p.evaluate(() => ramki.map((r) => { const e = r.d.querySelector('.z-menu.otwarte'); const cs = r.d.defaultView.getComputedStyle(e); const secs = [...e.querySelectorAll('section')].map((s) => Math.round(s.getBoundingClientRect().height)); const ul = e.querySelector('section.rozwiniety ul'); return { v: r.v, wys: e.clientHeight, tresc: e.scrollHeight, szer: Math.round(e.getBoundingClientRect().width), h2: r.d.defaultView.getComputedStyle(e.querySelector('h2')).fontSize, l: ul ? r.d.defaultView.getComputedStyle(ul).fontSize : '', rzedy: secs.join(',') }; }));
      console.log(mon, dz || '-', w.map((x) => `${x.v}: ${x.tresc}/${x.wys}${x.tresc > x.wys ? ' PRZEWIJA' : ''} sz${x.szer} h2 ${x.h2} l ${x.l} [${x.rzedy}]`).join(' | '));
    }
  }
  await p.click('[data-mn="1920"]'); await p.waitForTimeout(1500); await p.click('[data-dz="studia"]'); await p.waitForTimeout(600);
  await p.screenshot({ path: S + '/a-1920-studia.png', fullPage: true });
  await p.click('[data-dz=""]'); await p.waitForTimeout(600);
  await p.screenshot({ path: S + '/b-1920-zaden.png', fullPage: true });
  await p.click('[data-mn="1536"]'); await p.waitForTimeout(1500); await p.click('[data-dz="studia"]'); await p.click('[data-pa="jasny"]'); await p.waitForTimeout(600);
  await p.screenshot({ path: S + '/c-1536-jasny.png', fullPage: true });
  await p.click('[data-pa="ciemny"]'); await p.click('[data-mo="dark"]'); await p.click('[data-wi="ekran"]'); await p.waitForTimeout(1500);
  await p.screenshot({ path: S + '/d-1536-ciemny-ekran.png', fullPage: true });
  console.log('szer', await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]), 'błędy', bl);
  const q = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage(); await q.route(/^https?:\/\/(?!127)/, (r) => r.abort());
  await q.goto('http://127.0.0.1:8766/hamburger.html'); await q.waitForTimeout(2000);
  console.log('telefon szer', await q.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  await b.close();
})().catch((e) => { console.log('BŁĄD', e.message.slice(0, 500)); process.exit(1); });
