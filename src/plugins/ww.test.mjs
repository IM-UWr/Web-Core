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

test('liczby w banerze sylwetki (zlecenie 52): pole „Liczby”, puste pozycje, więcej niż 3, zapas z :::w-skrocie, nic', async () => {
  const { liczbySylwetki, krotkiTekst } = await import('../lib/ww.mjs');
  const blok = ':::w-skrocie\n\n- **1887–1972** — lata życia\n- **1945** — pierwszy dziekan [Wydziału](https://x.pl) Matematyki\n- **20** — *doktorów*\n- **1800+** — publikacji\n- **9** — czwarty punkt\n\n:::\n\nWstęp.';
  const pole = [{ n: '1945', etykieta: 'pierwszy dziekan', etykieta_en: 'first dean' }, { n: ' ', etykieta: 'pusta liczba' }, { n: 20, n_en: '', etykieta: 'doktorów' }];
  assert.deepEqual(liczbySylwetki(pole, blok, '1887–1972'), {
    pozycje: [{ n: '1945', n_en: undefined, pl: 'pierwszy dziekan', en: 'first dean' }, { n: '20', n_en: undefined, pl: 'doktorów', en: undefined }],
    zrodlo: 'pole', wszystkich: 2, blok: true,
  });
  const cztery = ['1', '2', '3', '4'].map((n) => ({ n, etykieta: `p${n}` }));
  assert.deepEqual(liczbySylwetki(cztery, '', undefined).pozycje.map((x) => x.n), ['1', '2', '3']);
  assert.equal(liczbySylwetki(cztery, '', undefined).wszystkich, 4);
  // zapas: pole puste → punkty bloku bez lat życia, bez linków i wyróżnień, podpis do 20 znaków całymi słowami
  assert.deepEqual(liczbySylwetki([], blok, '1887–1972'), {
    pozycje: [{ n: '1945', pl: 'pierwszy dziekan…' }, { n: '20', pl: 'doktorów' }, { n: '1800+', pl: 'publikacji' }],
    zrodlo: 'w-skrocie', wszystkich: 4, blok: true,
  });
  assert.deepEqual(liczbySylwetki(undefined, 'Sam tekst.', ''), { pozycje: [], zrodlo: 'brak', wszystkich: 0, blok: false });
  // blok w komentarzu (szablon) nie jest blokiem
  assert.equal(liczbySylwetki([], '<!--\n:::w-skrocie\n\n- **1950** — doktorat\n\n:::\n-->', '').zrodlo, 'brak');
  assert.equal(krotkiTekst('doktorat w [IM PAN](https://www.impan.pl)'), 'doktorat w IM PAN');
  assert.equal(krotkiTekst('pierwszy dziekan Wydziału Matematyki', 20), 'pierwszy dziekan…');
});

test('fnv1a: wektory wzorcowe FNV-1a 32 bit (bajty UTF-8)', async () => {
  const { fnv1a } = await import('../lib/ww.mjs');
  assert.equal(fnv1a(''), 0x811c9dc5);
  assert.equal(fnv1a('a'), 0xe40c292c);
  assert.equal(fnv1a('foobar'), 0xbf9cf968);
  assert.notEqual(fnv1a('ł'), fnv1a('B'));
});

// ---------- zlecenie 53 (dawniej 51): autokorekta nagłówków Treści „Warto wiedzieć” (remark-jawne-bloki.mjs, poprawNaglowkiWW) ----------
test('autokorekta nagłówków: Tabisz w miniaturze (# z tytułem, akapit, 3 × ### z {#id}, jeden bez spacji)', async () => {
  const md = '<!-- TEKST: komentarz -->\n# Dr Krzysztof Tabisz\n\n**Dr Krzysztof Tabisz (ur. 1950)** – matematyk.\n\n### Działalność naukowa i akademicka{#DzialalnoscNaukowa}\n\nA.\n\n### Działalność społeczna {#DzialalnoscSpoleczna}\n\nB.\n\n### Odznaczenia i wyróżnienia {#Odznaczenia}\n\nC.';
  const { html, ww } = await render(md, { tytul: 'Krzysztof Tabisz' });
  assert.doesNotMatch(html, /<h1|\{#/);
  assert.match(html, /^<p><strong>Dr Krzysztof Tabisz \(ur\. 1950\)<\/strong> – matematyk\.<\/p><h2 id="DzialalnoscNaukowa">Działalność naukowa i akademicka<\/h2>/);
  assert.match(html, /<h2 id="DzialalnoscSpoleczna">Działalność społeczna<\/h2><p>B\.<\/p><h2 id="Odznaczenia">Odznaczenia i wyróżnienia<\/h2>/);
  assert.equal((html.match(/<h2/g) ?? []).length, 3);
  assert.deepEqual(ww.naglowki, ['usunięty tytuł „# Dr Krzysztof Tabisz”', '### → ## (3)']);
  // EN: tytuł „Krzysztof Tabisz” zawiera się w nagłówku; identyfikatory sekcji z tekstu nagłówka
  const en = await render('# Dr Krzysztof Tabisz\n\nIntro.\n\n### Academic work\n\nA.\n\n### Awards\n\nB.', { tytul: 'Krzysztof Tabisz' });
  assert.match(en.html, /^<p>Intro\.<\/p><h2 id="academic-work">Academic work<\/h2><p>A\.<\/p><h2 id="awards">Awards<\/h2>/);
});

test('autokorekta nagłówków: # na początku, który nie jest tytułem, staje się sekcją ##', async () => {
  const { html, ww } = await render('# Inny nagłówek\n\nTekst.', { tytul: 'Krzysztof Tabisz' });
  assert.equal(html, '<h2 id="inny-naglowek">Inny nagłówek</h2><p>Tekst.</p>');
  assert.deepEqual(ww.naglowki, ['# → ## (1)']);
  // proza przed # — reguła A nie działa (tylko B)
  const r = await render('Wstęp.\n\n# Krzysztof Tabisz\n\nT.', { tytul: 'Krzysztof Tabisz' });
  assert.match(r.html, /<h2 id="krzysztof-tabisz">Krzysztof Tabisz<\/h2>/);
  assert.deepEqual(r.ww.naglowki, ['# → ## (1)']);
});

test('autokorekta nagłówków: Treść z ## i ### zostaje bez zmian', async () => {
  const md = 'Wstęp.\n\n## Sekcja {#sekcja}\n\nA.\n\n### Pod\n\nB.';
  const z = await render(md, { tytul: 'Sekcja' });
  const bez = (await p.render(md, { frontmatter: { strona: { jawne: true } } })).code.replace(/>\s+</g, '><');
  assert.equal(z.html, bez);
  assert.equal(z.ww.naglowki, undefined);
  assert.match(z.html, /<h2 id="sekcja">Sekcja<\/h2><p>A\.<\/p><h3 id="pod">Pod<\/h3>/);
});

test('autokorekta nagłówków: ### i #### bez ## dają ## i ###', async () => {
  const { html, ww } = await render('### A\n\nT.\n\n#### B\n\nU.\n\n### C\n\nV.', { tytul: 'X' });
  assert.equal(html, '<h2 id="a">A</h2><p>T.</p><h3 id="b">B</h3><p>U.</p><h2 id="c">C</h2><p>V.</p>');
  assert.deepEqual(ww.naglowki, ['### → ## (2)', '#### → ### (1)']);
});

test('autokorekta nagłówków: nagłówek wewnątrz bloku ::: zostaje bez zmian', async () => {
  const { html, ww } = await render(':::ramka{tytul="Uwaga"}\n\n### Wewnątrz\n\nTekst.\n\n:::\n\n#### Sekcja\n\nA.', { tytul: 'X' });
  assert.match(html, /<blockquote><span class="etyk">Uwaga<\/span><h3 id="wewnątrz">Wewnątrz<\/h3>/);
  assert.match(html, /<h2 id="sekcja">Sekcja<\/h2>/);
  assert.deepEqual(ww.naglowki, ['#### → ## (1)']);
});
