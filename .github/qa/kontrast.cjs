// Szczegóły kontrastu: dla stron, na których pa11y (axe) zgłosił color-contrast, uruchamia
// axe-core jeszcze raz (tylko ta reguła) i zapisuje kolory oraz współczynnik kontrastu
// (pa11y podaje sam komunikat bez liczb). Używa puppeteer i axe-core zainstalowanych z pa11y-ci.
// Wynik: $QA_OUT/kontrast.json  { url: [ {selektor, html, dane:{fgColor,bgColor,contrastRatio,...}} ] }
const fs = require('fs');
const path = require('path');

const P = process.env.PA11Y_DIR;
const OUT = process.env.QA_OUT || 'qa-wyniki';
const zapisz = (d) => fs.writeFileSync(path.join(OUT, 'kontrast.json'), JSON.stringify(d, null, 1));

(async () => {
  let wyniki;
  try {
    wyniki = JSON.parse(fs.readFileSync(path.join(OUT, 'pa11y-wyniki.json'), 'utf8'));
  } catch (e) {
    console.log('Brak wyników pa11y — pomijam.');
    return;
  }
  const urls = Object.entries(wyniki.results || {})
    .filter(([, l]) => (l || []).some((p) => p && p.code === 'color-contrast'))
    .map(([u]) => u);
  if (!urls.length) return zapisz({});
  const puppeteer = require(require.resolve('puppeteer', { paths: [P] }));
  const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [P] }), 'utf8');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const out = {};
  for (const u of urls) {
    const page = await browser.newPage();
    try {
      const telefon = u.includes('qa=telefon');
      await page.setViewport(telefon ? { width: 390, height: 844, isMobile: true } : { width: 1280, height: 900 });
      await page.goto(u, { waitUntil: 'load', timeout: 60000 });
      if (u.includes('qa=ciemny')) {
        await page.click('[data-motyw]');
        await page.waitForSelector('html[data-theme=dark]', { timeout: 5000 });
      }
      await new Promise((r) => setTimeout(r, 500));
      await page.addScriptTag({ content: axeSrc });
      out[u] = await page.evaluate(async () => {
        document.querySelectorAll('.katex-html').forEach((e) => (e.style.visibility = 'hidden'));
        const r = await window.axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } });
        return r.violations.flatMap((v) =>
          v.nodes.map((n) => ({
            selektor: n.target.join(' '),
            html: n.html.slice(0, 160),
            dane: (n.any[0] || {}).data || null,
            komunikat: ((n.any[0] || {}).message || n.failureSummary || '').slice(0, 300),
          }))
        );
      });
    } catch (e) {
      out[u] = [{ blad: String(e).slice(0, 300) }];
    }
    await page.close();
  }
  await browser.close();
  zapisz(out);
})().catch((e) => {
  console.error(e);
  zapisz({ blad: String(e).slice(0, 500) });
});
