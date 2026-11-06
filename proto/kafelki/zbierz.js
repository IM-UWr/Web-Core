// Zbiera prawdziwe strony działów z działającego serwera strony (astro dev) do strona.json i zas/.
// Dla każdego działu i szerokości monitora: gotowe body po uruchomieniu skryptów strony, wszystkie style, grupy z pasa.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:4321';
const SZER = [1366, 1536, 1920, 2560];
const DZ = { instytut: '/instytut/', nauka: '/nauka/', studia: '/studia/', popularyzacja: '/popularyzacja/' };
const sha = (t) => crypto.createHash('sha1').update(t).digest('hex').slice(0, 10);
const ZAS = path.join(OUT, 'zas', 'strona');
fs.mkdirSync(ZAS, { recursive: true });

const pobrane = new Map();
async function plik(u) {
  if (pobrane.has(u)) return pobrane.get(u);
  const url = new URL(u, BASE);
  const r = await fetch(url);
  if (!r.ok) { console.log('BRAK', r.status, u); pobrane.set(u, null); return null; }
  const b = Buffer.from(await r.arrayBuffer());
  const typ = r.headers.get('content-type') || '';
  const zTypu = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/svg+xml': '.svg', 'image/avif': '.avif', 'image/gif': '.gif' }[typ.split(';')[0].trim()];
  const w = { b, typ, ext: zTypu || path.extname(url.pathname).toLowerCase() };
  pobrane.set(u, w);
  return w;
}
const naPlik = async (u) => {
  const w = await plik(u); if (!w) return u;
  const n = `zas/strona/${sha(u)}${w.ext || '.bin'}`;
  fs.writeFileSync(path.join(OUT, n), w.b);
  return n;
};
async function poprawCss(css) {
  if (/\.katex\b/.test(css) && /KaTeX_/.test(css)) return ''; // na stronach działów nie ma wzorów
  css = css.replace(/@font-face\s*\{[^}]*greek[^}]*\}/gi, '');
  const adresy = [...new Set([...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]))].filter((u) => !/^(data:|#|https?:\/\/(?!127))/.test(u));
  for (const u of adresy) {
    let cel = u;
    if (/\.woff2?(\?|$)/.test(u)) { const w = await plik(u); if (w) cel = `data:font/woff2;base64,${w.b.toString('base64')}`; }
    else cel = await naPlik(u);
    css = css.split(u).join(cel);
  }
  return css;
}

(async () => {
  const b = await chromium.launch();
  const STY = [], indeks = new Map();
  const wynik = { STY, STRONY: {}, GR: {} };
  for (const [dz, url] of Object.entries(DZ)) {
    const strona = { tresc: {} };
    for (const w of SZER) {
      const p = await (await b.newContext({ viewport: { width: w, height: 950 }, colorScheme: 'light' })).newPage();
      await p.goto(BASE + url, { waitUntil: 'networkidle', timeout: 180000 });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(700);
      const d = await p.evaluate(async () => {
        const grupy = [...document.querySelectorAll('.z-dz-rzad')].map((s) => [s.querySelector('h3').textContent.trim(), [...s.querySelectorAll('a')].map((a) => [a.textContent.trim(), a.title || '', a.classList.contains('zew') || /^https?:/.test(a.getAttribute('href') || '') ? 1 : 0])]);
        const re = document.querySelector('.z-dz-rekr');
        const rekr = re ? [re.querySelector('small')?.textContent.trim() || '', re.querySelector('.z-dz-rekr-t')?.textContent.trim() || ''] : null;
        document.querySelectorAll('script, noscript, link[rel="preload"], link[rel="modulepreload"], link[rel="icon"], astro-dev-toolbar, vite-error-overlay, .z-lqip, picture source').forEach((e) => e.remove());
        document.querySelectorAll('body > *').forEach((e) => { if (/^\s*Warianty/.test(e.textContent || '') && (e.textContent || '').length < 4000) e.remove(); });
        const style = [];
        for (const e of [...document.querySelectorAll('style, link[rel="stylesheet"]')]) {
          if (e.tagName === 'STYLE') style.push(e.textContent);
          else { try { style.push(await (await fetch(e.href)).text()); } catch { style.push(''); } }
          e.remove();
        }
        if (document.querySelector('.z-baner-dzialu[data-dzial="studia"]')) { const f = document.querySelector('.z-foto img'); f.setAttribute('src', 'zas/strona/studia-hs.jpg'); f.removeAttribute('srcset'); f.removeAttribute('style'); f.setAttribute('alt', 'Sala wykładowa HS: wykład przy tablicach, studenci w ławkach od tyłu'); }
        document.querySelectorAll('img').forEach((i) => { const s = /^zas\//.test(i.getAttribute('src') || '') ? i.getAttribute('src') : i.currentSrc || i.getAttribute('src'); if (s) i.setAttribute('src', s); ['srcset', 'sizes', 'loading', 'fetchpriority', 'decoding', 'onload'].forEach((a) => i.removeAttribute(a)); i.classList.remove('z-ladowanie'); });
        const atr = (e) => Object.fromEntries([...e.attributes].map((a) => [a.name, a.value]));
        return { grupy, rekr, style, html: atr(document.documentElement), body: atr(document.body), tresc: document.body.innerHTML, wys: document.documentElement.scrollHeight, pas: document.querySelector('.z-dz-pas')?.getBoundingClientRect().top };
      });
      await p.context().close();
      if (!strona.sty) {
        strona.sty = [];
        for (const css of d.style) {
          const k = sha(css);
          if (!indeks.has(k)) { indeks.set(k, STY.length); STY.push(await poprawCss(css)); }
          strona.sty.push(indeks.get(k));
        }
        strona.html = d.html; strona.body = d.body;
        wynik.GR[dz] = { grupy: d.grupy, rekr: d.rekr };
      }
      // adresy obrazków w treści
      let t = d.tresc;
      const adresy = new Set([...t.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]).concat([...t.matchAll(/url\((?:&quot;|['"])?([^'")&]+)(?:&quot;|['"])?\)/g)].map((m) => m[1])));
      for (const u of adresy) {
        if (/^(zas\/|data:|#|https?:\/\/(?!127))/.test(u)) continue;
        t = t.split(u).join(await naPlik(u));
      }
      strona.tresc[w] = t;
      console.log(dz, w, 'wys', d.wys, 'pas', Math.round(d.pas), 'treść', Math.round(t.length / 1024), 'KB');
    }
    wynik.STRONY[dz] = strona;
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'strona.json'), JSON.stringify(wynik));
  console.log('style', STY.length, Math.round(STY.join('').length / 1024), 'KB');
  for (const [dz, g] of Object.entries(wynik.GR)) console.log(dz, JSON.stringify(g));
  const bez = (s) => s.replace(/\s+/g, ' ');
  for (const dz of Object.keys(DZ)) { const a = bez(wynik.STRONY[dz].tresc[1920]); for (const w of [1366, 1536, 2560]) { const c = bez(wynik.STRONY[dz].tresc[w]); console.log('różnica', dz, w, a === c ? 'brak' : a.length - c.length); } }
})().catch((e) => { console.log('BŁĄD', e.stack.slice(0, 600)); process.exit(1); });
