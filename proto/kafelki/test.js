const { chromium } = require('playwright'); const S = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1700, height: 1000 }, colorScheme: 'light', screen: { width: 1920, height: 1080 } });
  const p = await c.newPage();
  const bl = []; p.on('pageerror', (e) => bl.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load/.test(m.text())) bl.push(m.text()); });
  const nieudane = []; p.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) nieudane.push(r.url().slice(-60)); });
  await p.route(/^https?:\/\/(?!127)/, (r) => r.abort());
  await p.goto('http://127.0.0.1:8765/kafelki-dzialow.html');
  await p.waitForTimeout(2500);
  const stan = () => p.evaluate(() => ramki.map((r) => ({ k: r.k, h: r.h, pas: r.d && (r.d.querySelector('.z-dz-kaf, .z-dz-pas')?.getBoundingClientRect().top | 0), wys: r.d && (r.d.querySelector('.z-dz-kaf, .z-dz-pas')?.getBoundingClientRect().height | 0), tekst: r.d && (r.d.querySelector('.z-dz-tresc')?.getBoundingClientRect().top | 0) })));
  console.log('monitor', await p.evaluate(() => st.mon), JSON.stringify(await stan()));
  await p.click('[data-dz="studia"]'); await p.waitForTimeout(2500);
  console.log('studia', JSON.stringify(await stan()));
  await p.screenshot({ path: S + '/w-studia.png', fullPage: true });
  await p.click('[data-uk="1"]'); await p.waitForTimeout(1500);
  console.log('studia 1', JSON.stringify(await stan()));
  await p.screenshot({ path: S + '/j-studia-1.png', fullPage: true });
  // harmonijka mieści się w każdym dziale
  await p.click('[data-uk="3"]');
  for (const dz of ['instytut', 'nauka', 'studia', 'popularyzacja']) {
    await p.click(`[data-dz="${dz}"]`); await p.waitForTimeout(1000);
    const f = p.frameLocator('iframe');
    const n = await f.locator('.har button.kafel').count();
    for (let i = 0; i < n; i++) {
      if (i) { await f.locator(`.har button.kafel[data-i="${i}"]`).click(); await p.waitForTimeout(600); }
      const w = await p.evaluate(() => { const d = ramki[0].d, e = d.querySelector('.har-k.otw'); if (!e) return null; const r = e.getBoundingClientRect(); const a = [...e.querySelectorAll('.lnk')].map((x) => x.getBoundingClientRect()); return { szer: Math.round(r.width), gora: Math.round(a[0].top - r.top), dol: Math.round(r.bottom - a[a.length - 1].bottom), prawo: Math.round(r.right - Math.max(...a.map((x) => x.right))) }; });
      console.log(dz, i, JSON.stringify(w));
    }
  }
  // zwijanie, rozwijanie, nie rozwijane bez przeładowania ramki
  await p.click('[data-dz="nauka"]'); await p.click('[data-uk="1"]'); await p.waitForTimeout(1200);
  const f1 = p.frameLocator('iframe');
  console.log('przed', JSON.stringify(await stan()));
  await f1.locator('button.kafel[data-i="0"]').click(); await p.waitForTimeout(600);
  console.log('zwinięte', JSON.stringify(await stan()));
  await p.click('[data-tr="nie"]'); await p.waitForTimeout(500);
  console.log('nie rozwijane', JSON.stringify(await stan()));
  await p.click('[data-tr="tak"]'); await p.click('[data-mn="1366"]'); await p.waitForTimeout(1500);
  console.log('1366', JSON.stringify(await stan()), await p.evaluate(() => getComputedStyle(ramki[0].okno).width));
  await p.screenshot({ path: S + '/j-nauka-1366.png', fullPage: true });
  await p.click('[data-mn="1920"]'); await p.click('[data-uk="wszystkie"]'); await p.click('[data-mo="dark"]'); await p.waitForTimeout(2500);
  await p.screenshot({ path: S + '/w-nauka-ciemny.png', fullPage: true });
  await p.click('[data-mo="light"]'); await p.click('[data-dz="popularyzacja"]'); await p.click('[data-tr="nie"]'); await p.waitForTimeout(2500);
  await p.screenshot({ path: S + '/w-pop-stat.png', fullPage: true });
  console.log('szer', await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]), 'błędy', bl, 'nieudane', [...new Set(nieudane)].slice(0, 10));
  const q = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage(); await q.route(/^https?:\/\/(?!127)/, (r) => r.abort());
  await q.goto('http://127.0.0.1:8765/kafelki-dzialow.html'); await q.waitForTimeout(2500);
  console.log('telefon szer', await q.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  await b.close();
})().catch((e) => { console.log('BŁĄD', e.message.slice(0, 500)); process.exit(1); });
