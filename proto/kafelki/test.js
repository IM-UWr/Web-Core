const { chromium } = require('playwright'); const S = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1700, height: 1000 }, colorScheme: 'light', screen: { width: 1920, height: 1080 } });
  const p = await c.newPage();
  const bl = []; p.on('pageerror', (e) => bl.push(e.message));
  const nieudane = []; p.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) nieudane.push(r.url().slice(-60)); });
  await p.route(/^https?:\/\/(?!127)/, (r) => r.abort());
  await p.goto('http://127.0.0.1:8765/kafelki-dzialow.html');
  await p.waitForTimeout(3500);
  const stan = () => p.evaluate(() => ramki.map((r) => { const d = r.d; if (!d) return r.k + ':?'; const n = d.querySelector('.z-dz-kaf, .z-dz-pas').getBoundingClientRect(); const t = d.querySelector('.z-dz-tresc'); const ban = d.querySelector('.z-nagl'); return `${r.k}: pas ${Math.round(n.top)}+${Math.round(n.height)} baner ${ban ? Math.round(ban.getBoundingClientRect().bottom) : '-'} tekst ${t ? Math.round(t.getBoundingClientRect().top) : '-'} h ${r.h}`; })).then((x) => x.join(' | '));
  console.log('start', await p.evaluate(() => [st.dz, st.mon, st.uk]), await stan());
  await p.screenshot({ path: S + '/w-zwin.png', fullPage: true });
  await p.click('[data-st="pierwszy"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: S + '/w-otw.png', fullPage: true });
  // drugi pasek: czy mieści się w jednej linii i na ekranie, każda grupa, każdy dział
  await p.click('[data-st="nic"]');
  for (const dz of ['instytut', 'nauka', 'studia', 'popularyzacja']) {
    await p.click(`[data-dz="${dz}"]`); await p.waitForTimeout(3000);
    const w = await p.evaluate(() => ramki.filter((r) => r.k !== 'teraz').flatMap((r) => [...r.d.querySelectorAll('.pas2')].map((q) => { const rr = q.getBoundingClientRect(); const W = r.d.documentElement.clientWidth; return [r.k, Math.round(q.scrollHeight), Math.round(rr.left), Math.round(rr.right), rr.right > W + 1 ? 'POZA' : '']; })));
    const zle = w.filter((x) => x[1] > 62 || x[4]);
    console.log(dz, 'drugie paski', w.length, 'zawinięte lub poza:', JSON.stringify(zle));
  }
  await p.click('[data-dz="studia"]'); await p.click('[data-mn="1366"]'); await p.waitForTimeout(3000);
  const w1366 = await p.evaluate(() => ramki.filter((r) => r.k !== 'teraz').flatMap((r) => [...r.d.querySelectorAll('.pas2')].map((q) => [r.k, q.scrollHeight, Math.round(q.getBoundingClientRect().right)])));
  console.log('1366 Studia', JSON.stringify(w1366.filter((x) => x[1] > 62 || x[2] > 1366)));
  // pod banerem
  await p.click('[data-mn="1920"]'); await p.click('[data-po="dol"]'); await p.click('[data-st="pierwszy"]'); await p.waitForTimeout(3000);
  console.log('pod banerem', await stan());
  await p.screenshot({ path: S + '/w-dol.png', fullPage: true });
  await p.click('[data-po="gora"]'); await p.click('[data-st="nic"]'); await p.click('[data-uk="A"]'); await p.click('[data-wi="ekran"]'); await p.waitForTimeout(1500);
  await p.evaluate(() => ramki[0].d.defaultView.scrollTo(0, 700)); await p.waitForTimeout(400);
  console.log('przewijana', await p.evaluate(() => { const d = ramki[0].d, n = d.querySelector('.z-dz-kaf').getBoundingClientRect(), s = d.querySelector('.z-pasek'); return [Math.round(n.top), s.className, d.defaultView.innerHeight, ramki[0].f.getAttribute('scrolling')]; }));
  await p.screenshot({ path: S + '/j-przew.png', fullPage: true });
  await p.click('[data-wi="cala"]'); await p.click('[data-uk="wszystkie"]'); await p.click('[data-mo="dark"]'); await p.click('[data-st="pierwszy"]'); await p.waitForTimeout(3500);
  await p.screenshot({ path: S + '/w-ciemny.png', fullPage: true });
  console.log('szer', await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]), 'błędy', bl, 'nieudane', [...new Set(nieudane)].slice(0, 10));
  await b.close();
})().catch((e) => { console.log('BŁĄD', e.message.slice(0, 500)); process.exit(1); });
