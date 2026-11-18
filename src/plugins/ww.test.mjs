// Testy „Warto wiedzieć” (zlecenie 47): src/lib/ww.mjs i bloki :::w-skrocie / :::laureaci (remark-jawne-bloki.mjs, rehype-bloki.mjs).
//   node --test src/plugins/ww.test.mjs   (też w npm run test:jawne)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import directive from 'remark-directive';
import jawne from './remark-jawne-bloki.mjs';
import bloki from './rehype-bloki.mjs';
import {
  parsujLata, rokZLat, liniaWSkrocie, liniaLaureata, liczLaureatow, maBlokLaureatow, linkiDoWW, wybierzZZiarnem, rozsun,
  rocznicaBlisko, nowe, startOsi, wybierzNaGlowna, napisNaGlowna, zrodlaLicz, laureaciLicz, linieBlokow,
} from '../lib/ww.mjs';

const p = await createMarkdownProcessor({ remarkPlugins: [directive, jawne], rehypePlugins: [bloki] });
async function render(md, ww = {}) {
  const strona = { jawne: true, ww };
  const html = (await p.render(md, { frontmatter: { strona } })).code;
  return { html: html.replace(/>\s+</g, '><'), ww };
}

test('pole „Lata”: jedna data, dwie daty, inny tekst, puste', () => {
  assert.deepEqual(parsujLata('1956'), { tekst: 'ur. 1956', typ: 'urodzenie', rok: 1956, liczba: '1956' });
  assert.equal(parsujLata('ur. 1956').tekst, 'ur. 1956');
  assert.equal(parsujLata('ur.1956').tekst, 'ur. 1956');
  assert.equal(parsujLata('1956', 'en').tekst, 'b. 1956');
  for (const s of ['1956-2020', '1956 - 2020', '1956–2020', '1956 — 2020']) assert.deepEqual(parsujLata(s), { tekst: '1956–2020', typ: 'zycie', rok: 1956, liczba: '1956–2020' });
  assert.deepEqual(parsujLata('xxxx'), { tekst: 'xxxx', typ: 'tekst' });
  assert.deepEqual(parsujLata(''), { tekst: '', typ: 'pusto' });
  assert.deepEqual(parsujLata(undefined), { tekst: '', typ: 'pusto' });
  assert.equal(rokZLat('ok. 1887–1972'), 1887);
  assert.equal(rokZLat('xxxx'), undefined);
});

test('linie bloków: dobre i złe', () => {
  assert.deepEqual(liniaWSkrocie('- **1973** — doktorat w [IM PAN](https://www.impan.pl)'), { wartosc: '1973', podpis: 'doktorat w [IM PAN](https://www.impan.pl)' });
  assert.equal(liniaWSkrocie('- **1973** doktorat'), undefined);
  assert.equal(liniaWSkrocie('- 1973 — doktorat'), undefined);
  assert.deepEqual(liniaLaureata('- **2026** prof. [Marek Bożejko](/instytut/warto-wiedziec/marek-bozejko) — [aktualność](/aktualnosci/x)'),
    { rok: '2026', kto: 'prof. [Marek Bożejko](/instytut/warto-wiedziec/marek-bozejko)', po: '[aktualność](/aktualnosci/x)' });
  assert.deepEqual(liniaLaureata('- **2024** Czesław Ryll-Nardzewski'), { rok: '2024', kto: 'Czesław Ryll-Nardzewski', po: '' });
  assert.equal(liniaLaureata('- 2024 Jan Nowak'), undefined);
  assert.equal(liniaLaureata('- **2024**'), undefined);
});

test(':::w-skrocie: link w podpisie, pominięcie lat życia, zła linia (ostrzeżenie, nie błąd budowy)', async () => {
  const md = ':::w-skrocie\n\n- **1887–1972** — lata życia\n- **1973** — doktorat w [IM PAN](https://www.impan.pl)\n- **ur. 1946** — rok urodzenia\n- zła linia bez pogrubienia\n- **9** — wypromowanych doktorów\n\n:::';
  const { html, ww } = await render(md, { lata: '1887–1972' });
  assert.match(html, /<dl class="ww2-skrot"><div><dt>1973<\/dt><dd>doktorat w <a href="https:\/\/www.impan.pl">IM PAN<\/a><\/dd><\/div><div><dt>9<\/dt><dd>wypromowanych doktorów<\/dd><\/div><\/dl>/);
  assert.doesNotMatch(html, /lata życia|rok urodzenia|zła linia/);
  assert.deepEqual(ww.bledy, [{ nr: 6, tekst: '- zła linia bez pogrubienia', powod: 'punkt ma mieć postać: - **1973** — doktorat w IM PAN', blok: 'w-skrocie' }]);
});

test(':::laureaci: z linkiem do sylwetki (portret), bez, bez części po „ — ”, zła linia, licznik', async () => {
  const md = '## Laureaci z Instytutu {#laureaci}\n\n:::laureaci\n\n- **2026** prof. [Marek Bożejko](/instytut/warto-wiedziec/marek-bozejko) — [aktualność](/aktualnosci/a)\n- **2025** [Tomasz Rolski](/instytut/warto-wiedziec/tomasz-rolski) — [aktualność](/aktualnosci/b)\n- **2024** Dominik Gdesz\n- 2023 bez roku w pogrubieniu\n\n:::';
  const { html, ww } = await render(md, { portrety: { 'tomasz-rolski': '<span class="ww2-portret ww2-mini"></span>' } });
  assert.match(html, /<h2 id="laureaci">Laureaci z Instytutu<\/h2><ul class="ww2-l">/);
  // link do sylwetki bez portretu (szkic przy fladze) zostaje zwykłym linkiem; z portretem cały napis („prof. …”) jest linkiem z portretem
  assert.match(html, /<li><span class="ww2-l-rok">2026<\/span><span class="ww2-l-kto">prof. <a href="\/instytut\/warto-wiedziec\/marek-bozejko">Marek Bożejko<\/a><\/span><a href="\/aktualnosci\/a">aktualność<span class="sr-only">: prof. Marek Bożejko<\/span><span aria-hidden="true"> →<\/span><\/a><\/li>/);
  assert.match(html, /<span class="ww2-l-kto"><a class="ww2-l-os" href="\/instytut\/warto-wiedziec\/tomasz-rolski"><span class="ww2-portret ww2-mini"><\/span>Tomasz Rolski<\/a><\/span>/);
  assert.match(html, /<li><span class="ww2-l-rok">2024<\/span><span class="ww2-l-kto">Dominik Gdesz<\/span><\/li>/);
  assert.doesNotMatch(html, /bez roku/);
  assert.equal(ww.bledy.length, 1);
  assert.equal(ww.bledy[0].nr, 8);
  assert.equal(liczLaureatow(md), 3);
  assert.equal(maBlokLaureatow(md), true);
});

test(':::laureaci: „prof. [sylwetka]” — cały napis linkiem z mini portretem (jak w prototypie)', async () => {
  const md = ':::laureaci\n\n- **2026** prof. [Marek Bożejko](/instytut/warto-wiedziec/marek-bozejko) — [aktualność](/aktualnosci/a)\n\n:::';
  const { html } = await render(md, { portrety: { 'marek-bozejko': '<span class="ww2-portret ww2-mini"></span>' } });
  assert.match(html, /<span class="ww2-l-kto"><a class="ww2-l-os" href="\/instytut\/warto-wiedziec\/marek-bozejko"><span class="ww2-portret ww2-mini"><\/span>prof. Marek Bożejko<\/a><\/span>/);
});

test(':::laureaci: link do sylwetki-szkicu przy fladze — bez portretu (portrety tylko widocznych sylwetek)', async () => {
  const md = ':::laureaci\n\n- **2025** [Tomasz Rolski](/instytut/warto-wiedziec/tomasz-rolski)\n\n:::';
  const { html } = await render(md, { portrety: {} });
  assert.match(html, /<span class="ww2-l-kto"><a href="\/instytut\/warto-wiedziec\/tomasz-rolski">Tomasz Rolski<\/a><\/span>/);
  assert.doesNotMatch(html, /ww2-portret/);
});

test('blok w komentarzu (szablon nowego wpisu) nie liczy się i nie psuje budowy', async () => {
  const md = '<!-- LAUREACI: skopiuj:\n## Laureaci z Instytutu {#laureaci}\n\n:::laureaci\n\n- **2026** Imię Nazwisko — [aktualność](/aktualnosci/…)\n\n:::\n-->';
  assert.equal(liczLaureatow(md), 0);
  assert.equal(maBlokLaureatow(md), false);
  const { html } = await render(md);
  assert.doesNotMatch(html, /ww2-l|Laureaci/);
  assert.deepEqual(linieBlokow('```\n:::laureaci\n```', 'laureaci'), []);
});

test('niezamknięty blok i nieznany blok nadal zatrzymują budowę', async () => {
  await assert.rejects(render(':::laureaci\n\n- **2026** Jan'), /Niezamknięty blok laureaci/);
  await assert.rejects(render(':::laureat\n\n- **2026** Jan\n\n:::'), /Nieznany/);
});

test('powiązania z linków w Treści (bez komentarzy, z /en, kotwicą i ukośnikiem)', () => {
  const md = 'Pod kierunkiem [prof. Hartmana](/instytut/warto-wiedziec/stanislaw-hartman) i [Hulanickiego](/en/instytut/warto-wiedziec/andrzej-hulanicki/#droga).\n<!-- [x](/instytut/warto-wiedziec/ukryty) -->\n[strona](/instytut/wladze)';
  assert.deepEqual([...linkiDoWW(md)], ['stanislaw-hartman', 'andrzej-hulanicki']);
});

test('wybór stałym ziarnem: ten sam przy każdej budowie, różny dla różnych stron, n pozycji', () => {
  const l = Array.from({ length: 16 }, (_, i) => `s${i}`);
  const a = wybierzZZiarnem(l, 'hugo-steinhaus', 4);
  assert.equal(a.length, 4);
  assert.deepEqual(wybierzZZiarnem(l, 'hugo-steinhaus', 4), a);
  assert.notDeepEqual(wybierzZZiarnem(l, 'marek-bozejko', 4), a);
});

test('oś czasu: rozsuwanie punktów bez nakładania, w granicach', () => {
  for (const W of [1920, 1366, 1024, 390]) {
    const lata = [1945, 1946, 1947, 1953, 1958, 1980, 1985, 2005, 2006];
    const pad = W * 0.03, od = 1940, doo = 2010, gap = W < 560 ? 24 : 30;
    const x = lata.map((r) => pad + (r - od) / (doo - od) * (W - 2 * pad));
    const p = rozsun(x, Math.min(gap, W / (lata.length + 1)), pad, W - pad);
    for (let i = 1; i < p.length; i++) assert.ok(p[i] - p[i - 1] >= Math.min(gap, W / (lata.length + 1)) - 0.5, `${W}: ${p[i - 1]} ${p[i]}`);
    assert.ok(p[0] >= pad - 0.01 && p.at(-1) <= W - pad + 0.01);
  }
});

test('rocznice ±7 dni (także na przełomie roku), „Nowe” 30 dni, start osi', () => {
  assert.deepEqual(rocznicaBlisko('11-15', '2026-11-18'), { roznica: -3, rok: 2026 });
  assert.equal(rocznicaBlisko('11-15', '2026-11-23'), undefined);
  assert.deepEqual(rocznicaBlisko('01-02', '2026-12-29'), { roznica: 4, rok: 2027 });
  assert.equal(nowe('2026-11-19', '2026-11-19'), true);
  assert.equal(nowe('2026-11-19', '2026-12-19'), true);
  assert.equal(nowe('2026-11-19', '2026-12-20'), false);
  assert.equal(nowe('', '2026-12-20'), false);
  const r = ['', '', '11-15', '', '09-06'];
  assert.equal(startOsi(r, '2026-11-15', rocznicaBlisko), 2);
  assert.equal(startOsi(r, '2026-03-01', rocznicaBlisko), 0);
});

test('strona główna: rocznica, zawsze, nowa sylwetka, wagi ulubionych, bez powtórzeń', () => {
  const pom = { rocznicaBlisko, nowe };
  const poz = [
    { rocznica: '01-14', rok: 1887, zawsze: false, dodano: '', waga: 1 }, // Steinhaus
    { rocznica: '11-15', rok: 1945, zawsze: false, dodano: '', waga: 3 }, // pierwsze wykłady
    { rocznica: '', rok: 0, zawsze: false, dodano: '2026-11-19', waga: 1 }, // nowa sylwetka
    { rocznica: '', rok: 0, zawsze: false, dodano: '', waga: 3 }, // ulubione
    ...Array.from({ length: 10 }, () => ({ rocznica: '', rok: 0, zawsze: false, dodano: '', waga: 1 })),
  ];
  const w1 = wybierzNaGlowna(poz, '2026-11-19', 4, pom, Math.random);
  assert.deepEqual(w1.slice(0, 2), [{ i: 1, napis: { typ: 'rocznica', lat: 81, mies: 11, dzien: 15 } }, { i: 2, napis: { typ: 'nowe' } }]);
  assert.equal(napisNaGlowna(w1[0].napis, false, false, 'pl'), '81 lat temu · 15 listopada');
  assert.equal(napisNaGlowna(w1[0].napis, false, false, 'en'), '81 years ago · 15 November');
  assert.equal(napisNaGlowna(w1[1].napis, false, true, 'pl'), 'Nowa sylwetka');
  const w2 = wybierzNaGlowna(poz, '2027-01-14', 4, pom, Math.random);
  assert.equal(napisNaGlowna(w2[0].napis, true, true, 'pl'), '140. urodziny · 14 stycznia');
  assert.equal(napisNaGlowna(w2[0].napis, true, true, 'en'), '140th birthday · 14 January');
  const w3 = wybierzNaGlowna(poz, '2026-12-20', 4, pom, Math.random);
  assert.ok(!w3.some((x) => x.napis?.typ === 'nowe'));
  // 2000 losowań bez rocznic i „Nowe”: ulubione (waga 3) ok. 3× częściej niż zwykła pozycja, bez powtórzeń
  const zwykle = [{ waga: 3 }, ...Array.from({ length: 11 }, () => ({ waga: 1 }))].map((x) => ({ rocznica: '', rok: 0, zawsze: false, dodano: '', ...x }));
  const ile = new Array(zwykle.length).fill(0);
  for (let k = 0; k < 2000; k++) {
    const w = wybierzNaGlowna(zwykle, '2026-06-01', 1, pom, Math.random);
    ile[w[0].i]++;
  }
  const sr = ile.slice(1).reduce((a, b) => a + b, 0) / 11;
  assert.ok(ile[0] / sr > 2.4 && ile[0] / sr < 3.6, `ulubione ${ile[0]} vs średnio ${sr}`);
  const w4 = wybierzNaGlowna(zwykle, '2026-06-01', 4, pom, Math.random);
  assert.equal(new Set(w4.map((x) => x.i)).size, 4);
});

test('odmiany: źródła i laureaci', () => {
  assert.equal(zrodlaLicz(1), '1 źródło');
  assert.equal(zrodlaLicz(22), '22 źródła');
  assert.equal(zrodlaLicz(12), '12 źródeł');
  assert.equal(zrodlaLicz(3, 'en'), '3 sources');
  assert.equal(laureaciLicz(1), '1 laureat z Instytutu');
  assert.equal(laureaciLicz(10), '10 laureatów z Instytutu');
  assert.equal(laureaciLicz(1, 'en'), '1 recipient from the Institute');
});

test('duplikat nazwy pliku: pierwszy w kolejności sylwetki, nagrody, historie zostaje, drugi wypada', async () => {
  const { bezDuplikatow } = await import('../lib/ww.mjs');
  const { wpisy, duplikaty } = bezDuplikatow([
    { slug: 'hugo-steinhaus', grupa: 'sylwetki' }, { slug: 'medal', grupa: 'nagrody' }, { slug: 'hugo-steinhaus', grupa: 'historie' },
  ]);
  assert.deepEqual(wpisy.map((w) => `${w.grupa}/${w.slug}`), ['sylwetki/hugo-steinhaus', 'nagrody/medal']);
  assert.equal(duplikaty.length, 1);
  assert.equal(duplikaty[0].pominiety.grupa, 'historie');
});
