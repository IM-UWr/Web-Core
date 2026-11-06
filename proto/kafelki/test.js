const { chromium } = require('playwright'); const S = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1700, height: 1000 }, colorScheme: 'light', screen: { width: 1920, height: 1080 } });
  const p = await c.newPage(); const bl = []; p.on('pageerror', (e) => bl.push(e.message));
  await p.route(/^https?:\/\/(?!127)/, (r) => r.abort());
  await p.goto('http://127.0.0.1:8765/kafelki-dzialow.html');
  await p.addStyleTag({ content: '.narz{position:static !important}' });
  await p.waitForTimeout(2500);
  const f = () => p.frameLocator('iframe');
  const stan = () => p.evaluate(() => { const r = ramki[0], d = r.d; const pas = d.querySelector('.pas1').getBoundingClientRect(); const t = d.querySelector('.z-dz-tresc').getBoundingClientRect(); return { otw: st.otw, pas: Math.round(pas.height), tekst: Math.round(t.top), pole: [...d.querySelectorAll('.pole-rama.otw .pole')].map((x) => { const q = x.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.right), Math.round(q.height)]; }) }; });
  console.log('start', JSON.stringify(await stan()));
  await p.screenshot({ path: S + '/j-zwin.png', fullPage: true });
  // najechanie tylko koloruje, klik otwiera i zamyka
  await f().locator('button.pseg[data-i="1"]').hover(); await p.waitForTimeout(500);
  console.log('najechanie', JSON.stringify((await stan()).otw));
  const kolor = (i) => p.evaluate((i) => { const d = ramki[0].d; return d.defaultView.getComputedStyle(d.querySelector(`button.pseg[data-i="${i}"]`)).backgroundColor; }, i);
  const naj = await kolor(1);
  await f().locator('button.pseg[data-i="1"]').click(); await p.waitForTimeout(500);
  await f().locator('.z-dz-tresc h2').hover(); await p.waitForTimeout(500);
  console.log('klik', JSON.stringify(await stan()), 'kolor najechania', naj, 'rozwinięty', await kolor(1));
  await p.screenshot({ path: S + '/j-otw1.png', fullPage: true });
  await f().locator('button.pseg[data-i="1"]').click(); await p.waitForTimeout(500);
  console.log('drugi klik', JSON.stringify((await stan()).otw));
  // każdy dział i grupa: czy nazwy mieszczą się w jednej linii
  for (const mon of ['1920', '1366']) {
    await p.click(`[data-mn="${mon}"]`);
    for (const dz of ['instytut', 'nauka', 'studia', 'popularyzacja']) {
      await p.click(`[data-dz="${dz}"]`); await p.waitForTimeout(1500);
      const w = await p.evaluate(() => { const d = ramki[0].d, win = d.defaultView; const op = [...d.querySelectorAll('.pas1 .op')].map((e) => { const lh = parseFloat(win.getComputedStyle(e).lineHeight); return [e.textContent, Math.round(e.getBoundingClientRect().height / lh)]; }).filter((x) => x[1] > 1); const nz = [...d.querySelectorAll('.lnk b')].map((e) => { const lh = parseFloat(win.getComputedStyle(e).lineHeight); return [e.textContent, Math.round(e.getBoundingClientRect().height / lh)]; }); return { pas: Math.round(d.querySelector('.pas1').getBoundingClientRect().height), opisy2linie: op }; });
      const zam = await p.evaluate(async () => { const d = ramki[0].d, r = ramki[0], g = [...d.querySelectorAll('.pole-rama')]; const out = []; for (const el of g) { const q = el.querySelector('.pole'); q.style.visibility = 'visible'; el.classList.add('otw'); } await new Promise((s) => setTimeout(s, 500)); const win = d.defaultView; for (const el of g) { const q = el.querySelector('.pole'); const h = Math.round(q.getBoundingClientRect().height); const dwu = [...q.querySelectorAll('.lnk b')].filter((e) => e.getBoundingClientRect().height > parseFloat(win.getComputedStyle(e).lineHeight) * 1.4).map((e) => e.textContent); const sz = [...q.querySelectorAll('.lnk span')].filter((e) => e.getBoundingClientRect().height > parseFloat(win.getComputedStyle(e).lineHeight) * 1.4).map((e) => e.textContent); out.push([h, dwu, sz]); el.classList.remove('otw'); q.style.visibility = ''; } return out; });
      console.log(mon, dz, 'pas', w.pas, 'opisy w 2 liniach', JSON.stringify(w.opisy2linie), 'pola', JSON.stringify(zam));
    }
  }
  await p.click('[data-mn="1920"]'); await p.click('[data-dz="studia"]'); await p.waitForTimeout(1500);
  await f().locator('button.pseg[data-i="0"]').click(); await p.waitForTimeout(600);
  await f().locator('.z-dz-tresc h2').hover(); await p.waitForTimeout(300);
  await p.screenshot({ path: S + '/j-kier.png', fullPage: true });
  await p.click('[data-mo="dark"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: S + '/j-ciemny.png', fullPage: true });
  console.log('błędy', bl, 'szer', await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  await b.close();
})().catch((e) => { console.log('BŁĄD', e.message.slice(0, 600)); process.exit(1); });
