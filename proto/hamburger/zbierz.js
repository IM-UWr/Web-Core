// Zbiera prawdziwą stronę /studia/ z otwartym panelem hamburgera z działającego astro dev: strona.json + zas/.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:4321';
const EKR = [[1366, 633], [1536, 729], [1920, 945], [2560, 1305]];
const sha = (t) => crypto.createHash('sha1').update(t).digest('hex').slice(0, 10);
fs.mkdirSync(path.join(OUT, 'zas'), { recursive: true });
const pobrane = new Map();
async function plik(u) {
  if (pobrane.has(u)) return pobrane.get(u);
  const url = new URL(u, BASE);
  const r = await fetch(url);
  if (!r.ok) { console.log('BRAK', r.status, u); pobrane.set(u, null); return null; }
  const b = Buffer.from(await r.arrayBuffer());
  const typ = (r.headers.get('content-type') || '').split(';')[0].trim();
  const ext = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/svg+xml': '.svg', 'image/avif': '.avif' }[typ] || path.extname(url.pathname).toLowerCase();
  const w = { b, typ, ext }; pobrane.set(u, w); return w;
}
const naPlik = async (u) => { const w = await plik(u); if (!w) return u; const n = `zas/${sha(u)}${w.ext || '.bin'}`; fs.writeFileSync(path.join(OUT, n), w.b); return n; };
async function poprawCss(css) {
  if (/\.katex\b/.test(css) && /KaTeX_/.test(css)) return '';
  css = css.replace(/@font-face\s*\{[^}]*greek[^}]*\}/gi, '');
  const adresy = [...new Set([...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]))].filter((u) => !/^(data:|#|https?:\/\/(?!127))/.test(u));
  for (const u of adresy) {
    let cel = u;
    if (/\.woff2?(\?|$)/.test(u)) { const w = await plik(u); if (w) cel = `data:font/woff2;base64,${w.b.toString('base64')}`; } else cel = await naPlik(u);
    css = css.split(u).join(cel);
  }
  return css;
}
(async () => {
  const b = await chromium.launch();
  const wynik = { STY: [], tresc: {} };
  for (const [w, v] of EKR) {
    const p = await (await b.newContext({ viewport: { width: w, height: v }, colorScheme: 'light' })).newPage();
    await p.goto(BASE + '/studia/', { waitUntil: 'networkidle', timeout: 180000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    await p.locator('[data-z-pasek] [data-z-menu-otworz]').first().click();
    await p.waitForTimeout(800);
    const d = await p.evaluate(async () => {
      const f = document.querySelector('.z-baner-dzialu .z-foto img'); if (f) { f.setAttribute('src', 'zas/studia-hs.jpg'); f.removeAttribute('srcset'); f.removeAttribute('style'); }
      document.querySelectorAll('script, noscript, link[rel="preload"], link[rel="modulepreload"], link[rel="icon"], astro-dev-toolbar, vite-error-overlay, .z-lqip, picture source').forEach((e) => e.remove());
      document.querySelectorAll('body > *').forEach((e) => { if (/^\s*Warianty/.test(e.textContent || '') && (e.textContent || '').length < 4000) e.remove(); });
      const style = [];
      for (const e of [...document.querySelectorAll('style, link[rel="stylesheet"]')]) {
        if (e.tagName === 'STYLE') style.push(e.textContent); else { try { style.push(await (await fetch(e.href)).text()); } catch { style.push(''); } }
        e.remove();
      }
      document.querySelectorAll('img').forEach((i) => { const s = /^zas\//.test(i.getAttribute('src') || '') ? i.getAttribute('src') : i.currentSrc || i.getAttribute('src'); if (s) i.setAttribute('src', s); ['srcset', 'sizes', 'loading', 'fetchpriority', 'decoding', 'onload'].forEach((a) => i.removeAttribute(a)); });
      const atr = (e) => Object.fromEntries([...e.attributes].map((a) => [a.name, a.value]));
      return { style, html: atr(document.documentElement), body: atr(document.body), tresc: document.body.innerHTML, panel: !!document.querySelector('.z-menu.otwarte') };
    });
    await p.context().close();
    if (!wynik.sty) { wynik.sty = 1; for (const css of d.style) wynik.STY.push(await poprawCss(css)); wynik.html = d.html; wynik.body = d.body; }
    let t = d.tresc;
    const adresy = new Set([...t.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]).concat([...t.matchAll(/url\((?:&quot;|['"])?([^'")&]+)(?:&quot;|['"])?\)/g)].map((m) => m[1])));
    for (const u of adresy) { if (/^(zas\/|data:|#|https?:\/\/(?!127))/.test(u)) continue; t = t.split(u).join(await naPlik(u)); }
    wynik.tresc[w] = t;
    console.log(w, v, 'panel', d.panel, Math.round(t.length / 1024), 'KB');
  }
  await b.close();
  delete wynik.sty;
  fs.writeFileSync(path.join(OUT, 'strona.json'), JSON.stringify(wynik));
  console.log('style', Math.round(wynik.STY.join('').length / 1024), 'KB');
})().catch((e) => { console.log('BŁĄD', e.stack.slice(0, 600)); process.exit(1); });
