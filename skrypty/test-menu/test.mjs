// Uruchamiany w izolowanym workflow po buildzie. Nie publikuje strony.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../../', import.meta.url));
const dist = path.join(root, 'dist');
const base = '/Web-Podglad';
const nav = JSON.parse(await fs.readFile(path.join(root, 'src/data/nawigacja.json'), 'utf8')).menu;
const { widoczneMenu, kafelkiMenu } = await import(new URL('../../src/lib/nawigacja.mjs', import.meta.url));
const expected = widoczneMenu(nav);
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.avif':'image/avif', '.webp':'image/webp' };
const server = http.createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!rel.startsWith(base + '/') && rel !== base) throw new Error('Outside base');
    rel = rel.slice(base.length);
    let file = path.resolve(dist, '.' + rel);
    if (file !== dist && !file.startsWith(dist + path.sep)) throw new Error('Outside dist');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}${base}`;
await fs.mkdir(path.join(root, 'test-menu-results'), { recursive:true });
const browser = await chromium.launch();
const errors = [];
try {
  for (const mobile of [false, true]) for (const lang of ['pl', 'en']) {
    const page = await browser.newPage({ viewport: mobile ? {width:390,height:844} : {width:1440,height:1000}, isMobile:mobile, hasTouch:mobile });
    page.on('pageerror', (e) => errors.push(String(e)));
    const prefix = lang === 'en' ? '/en' : '';
    const response = await page.goto(origin + prefix + '/', { waitUntil:'networkidle' });
    assert.equal(response.status(), 200);
    await page.locator('nav[data-z-menu].zwijane').first().waitFor({state:'attached'});
    const button = page.locator('[data-z-menu-otworz]:visible').first();
    const panelId = await button.getAttribute('aria-controls');
    await button.click();
    const panel = page.locator('#'+panelId);
    await panel.locator('section').first().waitFor({state:'visible'});
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.deepEqual(await panel.locator('section > h2 > a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      expected.map((m) => m.adres.startsWith('/') ? base+prefix+m.adres : m.adres));
    const study = panel.locator('section[data-dzial="studia"]');
    const expand = study.locator('[data-z-menu-rozwin]');
    await expand.click();
    assert.equal(await expand.getAttribute('aria-expanded'), 'true');
    const studyMenu = expected.find((m) => m.adres === '/studia');
    assert.deepEqual(await study.locator('li a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      studyMenu.grupy.flatMap((g) => g.linki).map((l) => l.adres.startsWith('/') ? base+prefix+l.adres : l.adres));
    await page.screenshot({path:path.join(root,`test-menu-results/menu-${mobile?'telefon':'komputer'}-${lang}.png`),fullPage:false});
    await page.keyboard.press('Escape');
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    assert.deepEqual(await page.locator('.z-kier > a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
      kafelkiMenu(nav).map((k) => k.adres.startsWith('/') ? base+prefix+k.adres : k.adres));
    for (const id of ['matematyka','isim','siad','szkola-doktorska']) {
      assert.equal((await page.goto(origin+prefix+'/studia/'+id)).status(),200);
      assert.ok(await page.locator('h1').innerText());
    }
    for (const id of ['analiza-danych','matematyka-aktuarialno-finansowa','matematyka-nauczycielska','matematyka-stosowana','matematyka-teoretyczna']) {
      assert.equal((await page.goto(origin+prefix+'/studia/matematyka/'+id)).status(),200);
      assert.ok(await page.locator('[data-specjalnosc]').count());
    }
    console.log(`OK: ${mobile?'telefon':'komputer'}, ${lang}, menu, kafelki, kierunki i specjalności`);
    await page.close();
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
