const { chromium } = require('playwright'); const S = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const stw = async (o) => { const p = await (await b.newContext(o)).newPage(); p.bl = []; p.on('pageerror', (e) => p.bl.push(e.message)); await p.route(/^https?:/, (r) => r.abort()); await p.goto('file://' + S + '/kafelki-dzialow.html'); await p.waitForTimeout(400); return p; };
  const p = await stw({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });

  // Harmonijka: czy każda otwarta grupa mieści się w stałej wysokości, w każdym dziale.
  await p.click('[data-uk="3"]');
  for (const dz of ['instytut', 'nauka', 'studia', 'popularyzacja']) {
    await p.click(`[data-dz="${dz}"]`); await p.waitForTimeout(100);
    const n = await p.locator('[data-pas="3"] button.kafel').count();
    for (let i = 0; i < n; i++) {
      if (i) { await p.click(`[data-pas="3"] button.kafel[data-i="${i}"]`); await p.waitForTimeout(600); }
      const w = await p.evaluate(() => { const e = document.querySelector('.har-k.otw'); const l = e.querySelector('.har-l'); const r = e.getBoundingClientRect(); const a = [...l.querySelectorAll('.lnk')].map((x) => x.getBoundingClientRect()); return { szer: Math.round(r.width), gora: Math.round(a[0].top - r.top), dol: Math.round(r.bottom - a[a.length - 1].bottom), ile: a.length, prawo: Math.round(r.right - Math.max(...a.map((x) => x.right))) }; });
      console.log(dz, i, JSON.stringify(w));
    }
  }
  await p.click('[data-uk="wszystkie"]');
  await p.click('[data-dz="studia"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: S + '/s-rozw.png', fullPage: true });
  await p.click('[data-tr="false"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: S + '/s-stat.png', fullPage: true });
  await p.click('[data-dz="instytut"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: S + '/i-stat.png', fullPage: true });
  await p.click('[data-tr="true"]'); await p.click('[data-dz="popularyzacja"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: S + '/p-rozw.png', fullPage: true });
  // Zwijanie i klawiatura.
  await p.click('[data-uk="1"]'); await p.click('[data-pas="1"] button.kafel[data-i="0"]'); await p.waitForTimeout(450);
  console.log('zwiniete 1', await p.evaluate(() => [...document.querySelectorAll('[data-pas="1"] .pole-rama')].map((e) => Math.round(e.getBoundingClientRect().height))));
  await p.click('[data-pas="1"] button.kafel[data-i="1"]'); await p.waitForTimeout(450); await p.keyboard.press('Escape'); await p.waitForTimeout(450);
  console.log('po escape', await p.evaluate(() => [...document.querySelectorAll('[data-pas="1"] .pole-rama')].map((e) => Math.round(e.getBoundingClientRect().height))));
  await p.click('[data-uk="2"]'); await p.waitForTimeout(450);
  console.log('pas 2 szer', await p.evaluate(() => { const a = document.querySelector('.pelny').getBoundingClientRect(), r = document.querySelector('.ram').getBoundingClientRect(); return [Math.round(a.width), Math.round(r.width)]; }));
  await p.click('[data-uk="wszystkie"]'); await p.click('[data-dz="nauka"]'); await p.click('[data-mo="dark"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: S + '/n-ciemny.png', fullPage: true });
  console.log('szer', await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]), 'błędy', p.bl);
  const f = await stw({ viewport: { width: 390, height: 800 }, colorScheme: 'light' });
  await f.click('[data-dz="popularyzacja"]'); await f.waitForTimeout(300);
  console.log('telefon szer', await f.evaluate(() => [document.documentElement.scrollWidth, innerWidth]), 'błędy', f.bl);
  await b.close();
})().catch((e) => { console.log('BŁĄD', e.message.slice(0, 400)); process.exit(1); });
