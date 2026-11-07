// Pomiar szerokości (zlecenie 27, punkt 7; narzędzie ze zlecenia 24 przeniesione do repozytorium). Renderuje zbudowaną stronę
// w 12 oknach (11 od 800 do 1920 px i 2560×1300), wersję polską i angielską każdej strony z listy, i szuka:
//   K — kolizji tekstu (dwie linie różnych elementów na sobie),
//   R — tekstu wychodzącego poza ramkę (kafelek, przycisk, pole),
//   O — tekstu obciętego przez overflow,
//   W — tekstu poza oknem w poziomie,
//   X — poziomego przewijania strony.
// Stany na stronie: start; strona główna — drugi ekran; strony działów — każdy rozwinięty kafelek; strony z menu — otwarty
// panel menu; nagłówki z ciekawostką patrona — każda ciekawostka z puli działu, która może się na tej stronie pokazać (sam
// nagłówek, podmiana jak w skrypcie nagłówka z NaglowekZ.astro, po niej zdarzenie resize). Na stronach z szablonem podstrony
// zapisuje atrybuty .z-pd ze zlecenia 25 (data-pole="zwiniete", data-tresc="telefon").
// Wynik: OUT/wyniki.json, zrzuty ekranów z problemami w OUT/zrzuty/<strona>/<okno>-<stan>.jpg. Raport: podsumuj.py.
//
// Uruchomienie (Playwright poza package.json — w przebiegu GitHub Actions instalowany osobno, zob. .github/workflows/qa.yml):
//   DIST=dist OUT=szerokosci-wyniki NODE_PATH=<katalog>/node_modules node skrypty/szerokosci/pomiar.cjs
// Zmienne:
//   DIST    katalog zbudowanej strony; narzędzie samo go serwuje (serwer w Node z dużą kolejką połączeń — python http.server
//           przy kilku oknach naraz gubi połączenia i strona bywa bez CSS), ścieżka bazowa z BASE_PATH (domyślnie „/”)
//   BAZA    zamiast DIST: adres działającej strony, np. http://localhost:4321/Web-Core
//   OUT     katalog wyników (domyślnie szerokosci-wyniki)
//   STRONY  tylko te strony (identyfikatory, po przecinku; „en-…” to wersja angielska), OKNA — tylko te okna (np. 1280x600)
//   KANAL   kanał przeglądarki dla Playwrighta (np. chrome — zainstalowany Chrome zamiast pobranego Chromium)
//   WATKI   liczba okien naraz (domyślnie 4)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const OUT = path.resolve(process.env.OUT || 'szerokosci-wyniki');
const ZRZUTY = path.join(OUT, 'zrzuty');
const WATKI = +(process.env.WATKI || 4);

// [szerokość, wysokość] w px CSS — realne okna przeglądarki (ekran / skala systemu − pasek przeglądarki)
const OKNA = [
  [800, 900],   // wąskie okno / tablet pionowo tuż nad progiem telefonu
  [860, 780],   // okno ~1075 px przy skali 125%
  [960, 950],   // pół ekranu Full HD
  [1024, 700],  // tablet poziomo / 1280 przy 125%
  [1180, 820],  // iPad Air poziomo
  [1280, 600],  // Full HD przy 150% (laptopy 14–15")
  [1366, 620],  // laptop 1366×768 przy 100%
  [1440, 780],  // MacBook / 1440×900
  [1536, 730],  // Full HD przy 125% (domyślne Windows na laptopach)
  [1707, 830],  // 2560×1440 przy 150%
  [1920, 950],  // Full HD przy 100% — wzorzec projektu
  [2560, 1300], // 2560×1440 przy 100%
];

// Strony (wersja polska; angielska powstaje sama: „en-” + id, „/en” + adres, chyba że en: false).
// zapas: gdy stałego adresu nie ma (np. usunięty wpis), pierwszy adres z mapy strony pasujący do wzoru i zawierający „zawiera”.
const S = (id, adres, grupa, opcje = {}) => ({ id, adres, grupa, ...opcje });
const WPIS_AKT = { wzor: /^\/aktualnosci\/[^/]+\/?$/ };
const STRONY = [
  S('glowna', '/', 'glowna', { glowna: true, menu: true }),
  S('instytut', '/instytut/', 'dzial', { dzial: true }),
  S('nauka', '/nauka/', 'dzial', { dzial: true }),
  S('studia', '/studia/', 'dzial', { dzial: true, menu: true }),
  S('popularyzacja', '/popularyzacja/', 'dzial', { dzial: true }),
  S('instytut-kontakt', '/instytut/kontakt/', 'podstrona', { menu: true }),
  S('instytut-struktura', '/instytut/struktura/', 'podstrona'),
  S('instytut-wladze', '/instytut/wladze/', 'podstrona'),
  S('instytut-infrastruktura', '/instytut/infrastruktura-informatyczna/', 'podstrona'),
  S('instytut-infra-siec', '/instytut/infrastruktura-informatyczna/siec-studencka/', 'podstrona'),
  S('instytut-zaklad', '/instytut/zaklady/analiza-funkcjonalna/', 'wpis', { zapas: { wzor: /^\/instytut\/zaklady\/[^/]+\/?$/ } }),
  S('nauka-granty', '/nauka/granty/', 'lista'),
  S('nauka-grant', '/nauka/granty/2009-nieliniowe-rownania-ewolucji-z-dyfuzja-typu-levy-ego/', 'wpis', { zapas: { wzor: /^\/nauka\/granty\/[^/]+\/?$/ } }),
  S('nauka-konferencje', '/nauka/konferencje/', 'lista'),
  S('nauka-publikacje', '/nauka/publikacje/', 'lista'),
  S('nauka-publikacje-rok', '/nauka/publikacje/2018/', 'lista', { zapas: { wzor: /^\/nauka\/publikacje\/\d{4}\/?$/ } }),
  S('nauka-sukcesy', '/nauka/sukcesy/', 'lista'),
  S('nauka-sukcesy-historia', '/nauka/sukcesy/historia/', 'podstrona'),
  S('studia-matematyka', '/studia/matematyka/', 'podstrona'),
  S('studia-siad', '/studia/siad/', 'podstrona'),
  S('studia-isim', '/studia/isim/', 'podstrona'),
  S('studia-szkola-doktorska', '/studia/szkola-doktorska/', 'podstrona'),
  S('studia-sd-rekrutacja', '/studia/szkola-doktorska/rekrutacja/', 'podstrona'),
  S('studia-podyplomowe', '/studia/podyplomowe/', 'podstrona'),
  S('studia-plan-zajec', '/studia/plan-zajec/', 'lista'),
  S('studia-rok-akademicki', '/studia/rok-akademicki/', 'lista'),
  S('studia-zajecia', '/studia/zajecia/', 'podstrona'),
  S('studia-pierwszy-rok', '/studia/pierwszy-rok/', 'podstrona'),
  S('studia-egzaminy', '/studia/egzaminy-i-dyplom/', 'podstrona'),
  S('studia-sprawy', '/studia/sprawy-studenckie/', 'podstrona'),
  S('studia-procedura', '/studia/procedura-dyplomowania/', 'podstrona'),
  S('studia-skrypty', '/studia/skrypty/', 'podstrona'),
  S('studia-most', '/studia/program-most/', 'podstrona'),
  S('studia-archiwalne', '/studia/archiwalne-programy/', 'podstrona'),
  S('popularyzacja-uczniowie', '/popularyzacja/uczniowie/', 'podstrona'),
  S('popularyzacja-nauczyciele', '/popularyzacja/nauczyciele/', 'podstrona'),
  S('popularyzacja-organizatorzy', '/popularyzacja/organizatorzy/', 'podstrona'),
  S('popularyzacja-wszyscy', '/popularyzacja/wszyscy/', 'podstrona'),
  S('aktualnosci', '/aktualnosci/', 'lista'),
  S('aktualnosc', '/aktualnosci/2026-03-01-sukces-motiejusa-valiunasa-w-konkursie-ncn/', 'wpis', { zapas: WPIS_AKT }),
  S('aktualnosc-wydarzenie', '/aktualnosci/test-2026-11-06-dzien-otwarty-dla-kandydatow/', 'wpis', { zapas: { ...WPIS_AKT, zawiera: 'class="akt-wyd' } }),
  S('kalendarz', '/kalendarz/', 'lista'),
  S('seminaria', '/seminaria/', 'lista'),
  S('seminarium', '/seminaria/topologia/', 'wpis', { zapas: { wzor: /^\/seminaria\/[^/]+\/?$/ } }),
  S('pracownicy', '/pracownicy/', 'lista'),
  S('obrony', '/obrony-doktorskie/', 'lista'),
  S('obrona', '/obrony-doktorskie/2026-10-27-malwina-mrowinska/', 'wpis', { zapas: { wzor: /^\/obrony-doktorskie\/[^/]+\/?$/ } }),
  S('warto-wiedziec', '/warto-wiedziec/', 'lista'),
  S('warto-wpis', '/warto-wiedziec/wyklad-terencea-tao/', 'wpis', { zapas: { wzor: /^\/warto-wiedziec\/[^/]+\/?$/ } }),
  S('o-stronie', '/o-stronie/', 'ogolna'),
  S('dostepnosc', '/deklaracja-dostepnosci/', 'ogolna'),
  S('prywatnosc', '/polityka-prywatnosci/', 'ogolna'),
  S('szukaj', '/szukaj/', 'ogolna'),
  S('powiadomienia', '/powiadomienia/', 'ogolna'),
  S('404', '/404.html', 'ogolna', { en: false }),
];
const WSZYSTKIE = [
  ...STRONY.map((s) => ({ ...s, jezyk: 'pl' })),
  ...STRONY.filter((s) => s.en !== false).map((s) => ({ ...s, id: 'en-' + s.id, adres: '/en' + s.adres, jezyk: 'en',
    zapas: s.zapas && { ...s.zapas, en: true } })),
];

// --- serwer zbudowanej strony (DIST) ---
const TYPY = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain',
  '.ics': 'text/calendar', '.wasm': 'application/wasm' };
function serwer(dist, baza) {
  const korzen = path.resolve(dist);
  const pref = baza.replace(/\/$/, '');
  return new Promise((ok) => {
    const s = http.createServer((zap, odp) => {
      let u = decodeURIComponent(new URL(zap.url, 'http://x').pathname);
      if (pref && u === pref) { odp.writeHead(301, { Location: pref + '/' }); return odp.end(); }
      if (pref && !u.startsWith(pref + '/')) { odp.writeHead(404); return odp.end(); }
      u = u.slice(pref.length);
      let plik = path.normalize(path.join(korzen, u));
      if (!plik.startsWith(korzen)) { odp.writeHead(403); return odp.end(); }
      try {
        let st = fs.statSync(plik);
        if (st.isDirectory()) {
          if (!u.endsWith('/')) { odp.writeHead(301, { Location: pref + u + '/' }); return odp.end(); }
          plik = path.join(plik, 'index.html'); st = fs.statSync(plik);
        }
        odp.writeHead(200, { 'Content-Type': TYPY[path.extname(plik).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size });
        fs.createReadStream(plik).pipe(odp);
      } catch {
        const t = path.join(korzen, '404.html');
        if (fs.existsSync(t)) { odp.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); fs.createReadStream(t).pipe(odp); }
        else { odp.writeHead(404); odp.end('404'); }
      }
    });
    s.listen(0, '127.0.0.1', 1024, () => ok({ s, baza: `http://127.0.0.1:${s.address().port}${pref}` }));
  });
}

// --- wykrywanie w przeglądarce (korzen: tylko ten fragment strony, np. nagłówek przy ciekawostkach) ---
function wykryj(korzen) {
  const W = innerWidth;
  const wynik = { przewijanieX: Math.max(0, document.documentElement.scrollWidth - W), problemy: [] };
  const baza = (korzen && document.querySelector(korzen)) || document.body;
  const opis = (el) => {
    const czesci = [];
    for (let e = el; e && e !== document.body && czesci.length < 4; e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id) s += '#' + e.id;
      const kl = [...e.classList].filter((k) => !k.startsWith('astro-')).slice(0, 2);
      if (kl.length) s += '.' + kl.join('.');
      czesci.unshift(s);
    }
    return czesci.join(' > ');
  };
  const widoczny = (el) => (el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
  // tekst tylko dla czytnika ekranu (.sr-only: clip: rect(0 0 0 0)); przy skali okładki jego 1 px bywa szerszy niż 1 px
  const pamiecSr = new Map();
  function tylkoCzytnik(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (pamiecSr.has(el)) return pamiecSr.get(el);
    const cs = getComputedStyle(el);
    const w = (/^rect\(0px,? 0px,? 0px,? 0px\)$/.test(cs.clip) || cs.clipPath === 'inset(50%)') || tylkoCzytnik(el.parentElement);
    pamiecSr.set(el, w);
    return w;
  }
  const pamiecKlipu = new Map();
  const NIESK = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
  function klip(el) {
    if (!el || el === document.documentElement) return NIESK;
    if (pamiecKlipu.has(el)) return pamiecKlipu.get(el);
    const p = klip(el.parentElement);
    const cs = getComputedStyle(el);
    let c = p;
    const ox = cs.overflowX !== 'visible', oy = cs.overflowY !== 'visible';
    if ((ox || oy) && el !== document.body && cs.display !== 'contents' && cs.display !== 'inline') {
      const r = el.getBoundingClientRect();
      c = { l: ox ? Math.max(p.l, r.left) : p.l, r: ox ? Math.min(p.r, r.right) : p.r, t: oy ? Math.max(p.t, r.top) : p.t, b: oy ? Math.min(p.b, r.bottom) : p.b };
    }
    pamiecKlipu.set(el, c);
    return c;
  }
  // ramka: najbliższy przodek z tłem, obramowaniem lub cieniem (kafelek, przycisk, pole) — poza dużymi sekcjami pełnej szerokości
  const pamiecRamki = new Map();
  function ramka(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    if (pamiecRamki.has(el)) return pamiecRamki.get(el);
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const tlo = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    const kreska = ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs['border' + s + 'Width']) > 0).length >= 2;
    const cien = cs.boxShadow !== 'none' && /inset/.test(cs.boxShadow);
    const pelnaSzer = r.width >= W - 2;
    let w = null;
    if (cs.display === 'contents') w = ramka(el.parentElement);
    else if ((tlo || kreska || cien) && !pelnaSzer && cs.display !== 'inline' && r.width > 20 && r.height > 14) w = el;
    else w = ramka(el.parentElement);
    pamiecRamki.set(el, w);
    return w;
  }
  const linie = [];
  const tw = document.createTreeWalker(baza, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2) });
  let n;
  while ((n = tw.nextNode())) {
    const el = n.parentElement;
    if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(el.tagName)) continue;
    if (!widoczny(el) || tylkoCzytnik(el)) continue;
    const zakres = document.createRange();
    zakres.selectNodeContents(n);
    const c = klip(el);
    const fixed = (() => { for (let e = el; e; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return true; } return false; })();
    for (const r of zakres.getClientRects()) {
      if (r.width < 2 || r.height < 4) continue;
      const v = { l: Math.max(r.left, c.l), r: Math.min(r.right, c.r), t: Math.max(r.top, c.t), b: Math.min(r.bottom, c.b) };
      if (v.r - v.l <= 1 || v.b - v.t <= 1) continue; // całkiem schowane (sr-only, zwinięte pola)
      const tekst = n.nodeValue.trim().replace(/\s+/g, ' ').slice(0, 60);
      const obcX = (r.right - r.left) - (v.r - v.l), obcY = (r.bottom - r.top) - (v.b - v.t);
      if (obcX > 4 || obcY > r.height * 0.35) wynik.problemy.push({ typ: 'obciety', tekst, el: opis(el), px: Math.round(Math.max(obcX, obcY)), y: Math.round(r.top + scrollY) });
      linie.push({ el, tekst, fixed, l: v.l, r: v.r, t: v.t, b: v.b, y0: r.top + scrollY });
      const rm = ramka(el);
      if (rm) {
        const R = rm.getBoundingClientRect();
        const wyjX = Math.max(R.left - v.l, v.r - R.right), wyjY = Math.max(R.top - v.t, v.b - R.bottom);
        if (wyjX > 3 || wyjY > 6) wynik.problemy.push({ typ: 'poza-ramka', tekst, el: opis(el), ramka: opis(rm), px: Math.round(Math.max(wyjX, wyjY)), y: Math.round(r.top + scrollY) });
      }
      if (v.r > W + 2 || v.l < -2) wynik.problemy.push({ typ: 'poza-oknem', tekst, el: opis(el), px: Math.round(Math.max(v.r - W, -v.l)), y: Math.round(r.top + scrollY) });
    }
  }
  // kolizje: środkowy pas wysokości linii (60%), różne elementy, żaden nie zawiera drugiego
  const pas = linie.map((x) => { const h = x.b - x.t; return { ...x, t2: x.t + h * 0.2, b2: x.b - h * 0.2, l2: x.l + 1, r2: x.r - 1 }; }).sort((a, b) => a.t2 - b.t2);
  const widziane = new Set();
  for (let i = 0; i < pas.length; i++) {
    const a = pas[i];
    for (let j = i + 1; j < pas.length && pas[j].t2 < a.b2; j++) {
      const b = pas[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.fixed !== b.fixed) continue; // przyklejony pasek nad treścią — osobna sprawa
      const w = Math.min(a.r2, b.r2) - Math.max(a.l2, b.l2), h = Math.min(a.b2, b.b2) - Math.max(a.t2, b.t2);
      if (w > 3 && h > 2 && w * h > 30) {
        const k = opis(a.el) + '|' + opis(b.el);
        if (widziane.has(k)) continue;
        widziane.add(k);
        wynik.problemy.push({ typ: 'kolizja', tekst: a.tekst + '  ⟷  ' + b.tekst, el: opis(a.el), el2: opis(b.el), px: Math.round(w), y: Math.round(a.y0) });
      }
    }
  }
  if (!korzen) {
    const nagl = document.querySelector('.z-nagl, .z-okladka, [class*="z-okl"]');
    wynik.banerDol = nagl ? Math.round(nagl.getBoundingClientRect().bottom + scrollY) : null;
    wynik.wysokoscStrony = document.documentElement.scrollHeight;
    // układ podstrony (zlecenie 25): pole „Na tej stronie” zwinięte nad treścią / treść w widoku telefonu
    const pd = document.querySelector('.z-pd');
    wynik.uklad = pd ? { pole: pd.getAttribute('data-pole') || '', tresc: pd.getAttribute('data-tresc') || '' } : null;
  }
  const ile = {};
  wynik.problemy = wynik.problemy.filter((p) => (ile[p.typ] = (ile[p.typ] || 0) + 1) <= 40);
  wynik.licznik = ile;
  return wynik;
}

// pula ciekawostek z wbudowanego skryptu nagłówka (NaglowekZ.astro): D = {s, p: {strona: id} przypięte, c: [[id, tytuł, zdanie, waga, kreski]]}
function pulaCiekawostek() {
  const s = [...document.querySelectorAll('script')].find((x) => x.textContent.includes("'im-ciek-zestaw'") && x.textContent.includes('parentElement,'));
  if (!s) return null;
  const m = s.textContent.match(/parentElement,(\{[\s\S]*\}),("[^"]*"),("[^"]*")\);\s*$/);
  if (!m) return null;
  const D = JSON.parse(m[1]), st = JSON.parse(m[3]);
  // przypięta do tej strony: tylko ona; przypięte do innych stron: nie pokażą się tutaj
  if (D.p[st]) return [D.p[st]];
  const gdzieIndziej = new Set(Object.values(D.p));
  return D.c.map((c) => c[0]).filter((id) => !gdzieIndziej.has(id));
}
// podmiana ciekawostki jak pokaz() w skrypcie nagłówka, potem resize (dopasowanie nagłówka); zwraca false, gdy się nie da
function pokazCiekawostke(id) {
  const s = [...document.querySelectorAll('script')].find((x) => x.textContent.includes("'im-ciek-zestaw'") && x.textContent.includes('parentElement,'));
  const n = s && s.parentElement;
  const m = s && s.textContent.match(/parentElement,(\{[\s\S]*\}),("[^"]*"),("[^"]*")\);\s*$/);
  if (!n || !m) return false;
  const c = JSON.parse(m[1]).c.find((x) => x[0] === id);
  const v = n.querySelector('.z-znak'), o = n.querySelector('.z-znak-opis');
  if (!c || !v || !o) return false;
  while (v.firstChild) v.removeChild(v.firstChild);
  for (const k of c[4]) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', k[0]); p.setAttribute('pathLength', '1');
    if (k[1]) p.setAttribute('class', 'gruba');
    v.appendChild(p);
  }
  o.querySelector('b').textContent = c[1];
  o.querySelector('span').textContent = c[2];
  n.setAttribute('data-ck', id);
  dispatchEvent(new Event('resize'));
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => r(true), 30))));
}

const maProblem = (d) => d && (d.problemy.length > 0 || d.przewijanieX > 1);

async function zrzut(p, kat, nazwa, d) {
  // ekran z pierwszym problemem (bez fullPage: zmienia emulowany rozmiar okna)
  const y = d.problemy.length ? Math.min(...d.problemy.map((x) => x.y)) : 0;
  const przed = await p.evaluate(() => scrollY);
  await p.evaluate((y) => scrollTo(0, Math.max(0, y - 120)), y);
  await p.waitForTimeout(150);
  fs.mkdirSync(kat, { recursive: true });
  await p.screenshot({ path: path.join(kat, nazwa + '.jpg'), type: 'jpeg', quality: 70 });
  await p.evaluate((y) => scrollTo(0, y), przed);
}

// wejście na stronę; gdy nie doszedł arkusz stylów, skrypt albo krój (zgubione połączenie), strona bez CSS dałaby fałszywe
// przewijanie i kolizje — wtedy do 3 prób, potem błąd renderu
const ZASOBY = new Set(['stylesheet', 'script', 'font']);
async function wejdz(p, adres) {
  for (let proba = 1; ; proba++) {
    const zle = [];
    const odp = (r) => { if (ZASOBY.has(r.request().resourceType()) && r.status() >= 400) zle.push(`${r.status()} ${r.url()}`); };
    const blad = (rq) => { if (ZASOBY.has(rq.resourceType())) zle.push(`${rq.failure()?.errorText || 'błąd'} ${rq.url()}`); };
    p.on('response', odp);
    p.on('requestfailed', blad);
    try {
      await p.goto(adres, { waitUntil: 'load', timeout: 45000 });
      await p.evaluate(() => document.fonts && document.fonts.ready);
    } finally {
      p.off('response', odp);
      p.off('requestfailed', blad);
    }
    const pusteArkusze = await p.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')]
      .filter((l) => { try { return !l.sheet || l.sheet.cssRules.length === 0; } catch { return false; } }).map((l) => `pusty arkusz ${l.href}`));
    zle.push(...pusteArkusze);
    if (!zle.length) return;
    if (proba >= 3) throw new Error(`zasoby się nie wczytały: ${zle.join(', ')}`);
    await p.waitForTimeout(500 * proba);
  }
}

async function pracownik(przegladarka, BAZA, zadania, wyniki) {
  while (zadania.length) {
    const { strona, okno } = zadania.shift();
    const [w, h] = okno;
    const klucz = `${w}x${h}`;
    const kat = path.join(ZRZUTY, strona.id);
    const ctx = await przegladarka.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light', locale: strona.jezyk === 'en' ? 'en-GB' : 'pl-PL' });
    const p = await ctx.newPage();
    const zapis = { strona: strona.id, adres: strona.adresUzyty, grupa: strona.grupa, jezyk: strona.jezyk, okno: klucz, stany: {}, ciekawostki: 0 };
    try {
      await wejdz(p, BAZA + strona.adresUzyty);
      await p.waitForTimeout(400);
      const start = await p.evaluate(wykryj);
      zapis.stany.start = start;
      if (maProblem(start)) await zrzut(p, kat, `${klucz}-start`, start);
      if (strona.glowna) {
        const jest = await p.$('.z-druga');
        if (jest) {
          await p.evaluate(() => document.querySelector('.z-druga').scrollIntoView({ block: 'start' }));
          await p.waitForTimeout(400);
          const d = await p.evaluate(wykryj);
          zapis.stany.drugi = d;
          if (maProblem(d)) await zrzut(p, kat, `${klucz}-drugi`, d);
          await p.evaluate(() => scrollTo(0, 0));
        }
      }
      if (strona.dzial) {
        const karty = await p.$$('.z-dz-karta');
        for (let i = 0; i < karty.length; i++) {
          if (!(await karty[i].isVisible())) continue;
          await karty[i].click();
          await p.waitForTimeout(450);
          await p.evaluate(() => { const e = document.querySelector('.z-dz-karty'); if (e) scrollTo(0, Math.max(0, e.getBoundingClientRect().top + scrollY - 120)); });
          await p.waitForTimeout(150);
          const d = await p.evaluate(wykryj);
          zapis.stany[`karta${i + 1}`] = d;
          if (maProblem(d)) await zrzut(p, kat, `${klucz}-karta${i + 1}`, d);
          await karty[i].click();
          await p.waitForTimeout(350);
          await p.evaluate(() => scrollTo(0, 0));
        }
      }
      // ciekawostki patrona: każda z puli, która może się tu pokazać (zapis tylko stanów z problemem)
      const pula = await p.evaluate(pulaCiekawostek);
      if (pula && pula.length > 1) {
        await p.evaluate(() => scrollTo(0, 0));
        for (const id of pula) {
          if (!(await p.evaluate(pokazCiekawostke, id))) continue;
          zapis.ciekawostki++;
          const d = await p.evaluate(wykryj, '.z-nagl');
          if (maProblem(d)) {
            zapis.stany[`ck:${id}`] = d;
            await zrzut(p, kat, `${klucz}-ck-${id}`, d);
          }
        }
      }
      if (strona.menu) {
        await p.evaluate(() => scrollTo(0, 0));
        const b = (await p.$$('[data-z-menu-otworz]'));
        let otw = null;
        for (const x of b) if (await x.isVisible()) { otw = x; break; }
        if (otw) {
          await otw.click();
          await p.waitForTimeout(600);
          const d = await p.evaluate(wykryj);
          zapis.stany.menu = d;
          if (maProblem(d)) await zrzut(p, kat, `${klucz}-menu`, d);
        }
      }
    } catch (e) {
      zapis.blad = String(e).slice(0, 300);
    }
    wyniki.push(zapis);
    await ctx.close();
    process.stdout.write('.');
  }
}

// adres strony: stały, a gdy go nie ma — pierwszy pasujący z mapy strony
async function ustalAdresy(BAZA) {
  const sciezkaBazy = new URL(BAZA).pathname.replace(/\/$/, '');
  let mapa = [];
  try {
    const xml = await (await fetch(BAZA + '/sitemap.xml')).text();
    mapa = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/^\/[^/]+(?=\/)/, (x) => (x === sciezkaBazy ? '' : x)));
  } catch { /* bez mapy: same stałe adresy */ }
  const jest = async (a) => { try { return (await fetch(BAZA + a, { redirect: 'manual' })).status === 200; } catch { return false; } };
  const braki = [];
  for (const s of WSZYSTKIE) {
    if (await jest(s.adres)) { s.adresUzyty = s.adres; continue; }
    if (s.zapas) {
      const kandydaci = mapa.filter((a) => (s.zapas.en ? a.startsWith('/en/') && s.zapas.wzor.test(a.slice(3)) : s.zapas.wzor.test(a)));
      for (const a of kandydaci.slice(0, 40)) {
        const html = await (await fetch(BAZA + a)).text().catch(() => '');
        if (!s.zapas.zawiera || html.includes(s.zapas.zawiera)) { s.adresUzyty = a.endsWith('/') ? a : a + '/'; break; }
      }
    }
    if (!s.adresUzyty) braki.push(s.id + ' ' + s.adres);
  }
  return braki;
}

(async () => {
  fs.mkdirSync(ZRZUTY, { recursive: true });
  let BAZA = process.env.BAZA, srv = null;
  if (!BAZA) {
    const dist = process.env.DIST || 'dist';
    if (!fs.existsSync(path.join(dist, 'index.html'))) { console.error(`Brak zbudowanej strony w ${dist}`); process.exit(2); }
    ({ s: srv, baza: BAZA } = await serwer(dist, process.env.BASE_PATH || ''));
  }
  BAZA = BAZA.replace(/\/$/, '');
  const braki = await ustalAdresy(BAZA);
  const przegladarka = await chromium.launch({ ...(process.env.KANAL ? { channel: process.env.KANAL } : {}), args: ['--disable-gpu', '--font-render-hinting=none'] });
  const tylko = process.env.STRONY ? process.env.STRONY.split(',') : null;
  const tylkoOkna = process.env.OKNA ? process.env.OKNA.split(',') : null;
  const zadania = [];
  for (const strona of WSZYSTKIE) for (const okno of OKNA) {
    if (!strona.adresUzyty) continue;
    if (tylko && !tylko.includes(strona.id)) continue;
    if (tylkoOkna && !tylkoOkna.includes(`${okno[0]}x${okno[1]}`)) continue;
    zadania.push({ strona, okno });
  }
  const wyniki = [];
  const t0 = Date.now();
  await Promise.all(Array.from({ length: WATKI }, () => pracownik(przegladarka, BAZA, zadania, wyniki)));
  await przegladarka.close();
  if (srv) srv.close();
  wyniki.sort((a, b) => (a.strona + ' ' + a.okno).localeCompare(b.strona + ' ' + b.okno, 'pl', { numeric: true }));
  const okna = OKNA.map(([w, h]) => `${w}x${h}`).filter((o) => !tylkoOkna || tylkoOkna.includes(o));
  fs.writeFileSync(path.join(OUT, 'wyniki.json'), JSON.stringify({ okna, braki, czas: Math.round((Date.now() - t0) / 1000), wyniki }, null, 1));
  console.log(`\n${wyniki.length} renderów w ${Math.round((Date.now() - t0) / 1000)} s` + (braki.length ? `; brak stron: ${braki.join(', ')}` : ''));
})().catch((e) => { console.error(e); process.exit(2); });
