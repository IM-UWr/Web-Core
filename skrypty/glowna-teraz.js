const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto('http://localhost:8765/Web-Core/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'podglad/teraz-glowna.png', fullPage: true });
  const t = await p.evaluate(() => [...document.querySelectorAll('main section')].map((s) => (s.className + ' :: ' + s.innerText.replace(/\n+/g, ' | ')).slice(0, 900)).join('\n\n'));
  console.log(t);
  await b.close();
})();
