const { chromium } = require('playwright');
const out = '/home/claude/estetyka/zrzuty';
const base = 'http://localhost:8765/Web-Core';
const strony = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const [nazwa, w, h, full] of [['pc', 1440, 900, false], ['tel', 390, 844, false]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const p = await ctx.newPage();
    for (const s of strony) {
      try {
        await p.goto(base + s, { waitUntil: 'networkidle', timeout: 30000 });
        await p.waitForTimeout(3500);
        const plik = `${out}/${nazwa}${s.replace(/\//g, '_') || '_'}.png`;
        await p.screenshot({ path: plik, fullPage: true, clip: undefined });
        console.log(plik);
      } catch (e) { console.log('BLAD', s, e.message); }
    }
    await ctx.close();
  }
  await b.close();
})();
