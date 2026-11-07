// Testy wtyczki bloków (zlecenia 28 i 29):  node --test src/plugins/rehype-bloki.test.mjs  (albo npm run test:bloki)
// Przypadki z wzoru kierunków (28-zalaczniki\wzor) i zapisy edytora Pages CMS (Enter zamiast Shift+Enter itd.).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBloki from './rehype-bloki.mjs';
import remarkWzoryEdytora from './remark-wzory-edytora.mjs';

const procesory = {};
async function render(md, { lang = 'pl', kierunek, bloki = true } = {}) {
  procesory[lang] ??= await createMarkdownProcessor({
    remarkPlugins: [remarkMath, remarkWzoryEdytora],
    rehypePlugins: [rehypeKatex, [rehypeBloki, { lang, site: 'https://im-uwr.github.io', base: '/Web-Core' }]],
  });
  const fm = kierunek ? { kierunek: { specjalnosci: false, ...kierunek } } : { bloki };
  const r = await procesory[lang].render(md, { frontmatter: fm });
  return { html: r.code.replace(/>\s+</g, '><').replace(/\n/g, ' '), sekcje: fm.kierunek?.sekcje };
}
const zawiera = (html, ...czesci) => czesci.forEach((c) => assert.ok(html.includes(c), `brak: ${c}\nw: ${html}`));

test('kafelki: pogrubienie — opis w jednej linii', async () => {
  const { html } = await render('- **Kategoria A+** — Najwyższa ocena.\n- **Pomoc na starcie** — Kurs i tutornia.');
  zawiera(html, '<ul class="dwa"><li><b>Kategoria A+</b><span>Najwyższa ocena.</span></li>');
});

test('kafelek z opisem po Shift+Enter i parą', async () => {
  const { html } = await render('- **Kategoria A+**  \n  Najwyższa ocena.  \n  Termin: do 30 czerwca\n- **Pomoc** — Kurs.');
  zawiera(html, '<li><b>Kategoria A+</b><span>Najwyższa ocena.</span><dl class="para"><dt>Termin</dt><dd>do 30 czerwca</dd></dl></li>');
});

test('kafelki jak dawniej: tytuł i opis w osobnych akapitach', async () => {
  const { html } = await render('- **Tytuł**\n\n  Opis kafelka.\n\n- **Drugi**\n\n  Opis drugi.');
  zawiera(html, '<li><b>Tytuł</b><span>Opis kafelka.</span></li>');
});

test('kafelek: linia z dwukropkiem zaraz pod samym tytułem to opis, nie para', async () => {
  const { html } = await render('- **Materiały do lekcji**\n\n  Archiwa zadań: Matematyka dla Myślących.\n\n  [Strona](https://example.com/)\n- **Drugi** — Opis.');
  zawiera(html, '<li><b>Materiały do lekcji</b><span>Archiwa zadań: Matematyka dla Myślących.</span><p class="akcja"><a href="https://example.com/">Strona</a></p></li>');
});

test('pogrubienie bez separatora („**6 przedmiotów**, w tym …”) to zwykła lista', async () => {
  const { html } = await render('- **6 przedmiotów**, w tym 2 informatyczne\n- **12 ECTS**, z matematyki', { kierunek: {} });
  assert.ok(!html.includes('class="dwa"'), html);
});

test('oś z wzoru: etykieta przed dwukropkiem, opis, pary i przycisk', async () => {
  const md = '1. **Semestry 1–2: Podstawy** — Przedmioty podstawowe.  \n   Termin: do 31 grudnia  \n   Formularz: Formularz C1\n'
    + '2. **Semestry 3–4: Wybór** — Wybierasz specjalność.  \n   Termin: do 30 czerwca  \n   [Formularz C2](https://forms.example.com/c2)';
  const { html } = await render(md);
  zawiera(html,
    '<ol class="etapy"><li><span class="etyk">Semestry 1–2</span><p class="t">Podstawy</p><p>Przedmioty podstawowe.</p><dl class="para"><dt>Termin</dt><dd>do 31 grudnia</dd><dt>Formularz</dt><dd>Formularz C1</dd></dl></li>',
    '<dl class="para"><dt>Termin</dt><dd>do 30 czerwca</dd></dl><p class="akcja"><a href="https://forms.example.com/c2">Formularz C2</a></p></li></ol>');
});

test('oś wpisana samymi Enterami (każda linia jako nowy punkt)', async () => {
  const md = '1. **Semestry 1–2: Podstawy** — Przedmioty podstawowe.\n2. Termin: do 31 grudnia\n3. [Formularz C2](https://forms.example.com/c2)\n4. **Semestr 3: Dalej**\n5. Opis trzeciego semestru.';
  const { html } = await render(md);
  zawiera(html,
    '<li><span class="etyk">Semestry 1–2</span><p class="t">Podstawy</p><p>Przedmioty podstawowe.</p><dl class="para"><dt>Termin</dt><dd>do 31 grudnia</dd></dl><p class="akcja"><a href="https://forms.example.com/c2">Formularz C2</a></p></li>',
    '<li><span class="etyk">Semestr 3</span><p class="t">Dalej</p><p>Opis trzeciego semestru.</p></li></ol>');
  assert.equal(html.match(/<li>/g).length, 2);
});

test('oś bez dwukropka: „Krok N” / „Step N”', async () => {
  zawiera((await render('1. **Zapisz się**\n\n   Opis.\n\n2. **Przyjdź**\n\n   Opis 2.')).html, '<span class="etyk">Krok 2</span><p class="t">Przyjdź</p>');
  zawiera((await render('1. **Sign up** — Text.', { lang: 'en' })).html, '<span class="etyk">Step 1</span><p class="t">Sign up</p><p>Text.</p>');
});

test('kontakty: rola i osoba w osobnych liniach i w jednej linii', async () => {
  const md = '- *Sekretariat*  \n  **Justyna Kowalska**  \n  e-mail: [a.b@uwr.edu.pl](mailto:a.b@uwr.edu.pl)  \n  tel.: 71 375 7436\n- *Opiekun roku* **dr Jan Nowak**  \n  pokój: 305';
  const { html } = await render(md);
  zawiera(html,
    '<div class="kontakty"><div><span class="etyk">Sekretariat</span><b>Justyna Kowalska</b><dl class="para"><dt>e-mail</dt><dd><a href="mailto:a.b@uwr.edu.pl">a.b@uwr.edu.pl</a></dd><dt>tel.</dt><dd>71 375 7436</dd></dl></div>',
    '<div><span class="etyk">Opiekun roku</span><b>dr Jan Nowak</b><dl class="para"><dt>pokój</dt><dd>305</dd></dl></div></div>');
});

test('lista mieszana (plik i strona) — ul.pliki z typami', async () => {
  const md = '## Akty prawne\n\n- [Regulamin](/pliki/studia/regulamin.pdf)\n- [Procedura](/studia/procedura) — Opis procedury.\n- [BIP](https://bip.uni.wroc.pl/uchwala)';
  const pl = (await render(md, { kierunek: {} })).html;
  zawiera(pl, '<ul class="pliki"><li><a href="/pliki/studia/regulamin.pdf"><svg', '<span>Regulamin</span><span class="typ">PDF</span>',
    '<span>Procedura<small>Opis procedury.</small></span><span class="typ">strona</span>');
  const en = (await render(md.replace('Akty prawne', 'Regulations'), { kierunek: {}, lang: 'en' })).html;
  zawiera(en, '<span class="typ">page</span>', '<span class="typ">website</span>');
});

test('lista samych stron — ul.linki', async () => {
  zawiera((await render('## Strony szkoły doktorskiej\n\n- [Rekrutacja](/studia/rekrutacja)\n- [SzD](https://szd.uwr.edu.pl/)', { kierunek: {} })).html,
    '<ul class="linki"><li><a href="/studia/rekrutacja">Rekrutacja</a></li>');
});

test('pytania: ### z „?” rozwijane, bez „?” zostaje nagłówkiem', async () => {
  const { html } = await render('## Pytania i odpowiedzi\n\n### Kiedy wybieram?\n\nPod koniec 4. semestru.\n\n### Gdzie?\n\nW sali 202.\n\n### Uwagi\n\nTekst.', { kierunek: {} });
  zawiera(html, '<div class="faq"><details><summary>Kiedy wybieram?</summary><div><p>Pod koniec 4. semestru.</p></div></details><details><summary>Gdzie?</summary>', '<h3 id="uwagi">Uwagi</h3>');
});

test('sekcje kierunku: kotwice, spis, krótkie etykiety, .prose i table.tab', async () => {
  const md = '## O Kolegium Doktorskim\n\nTekst.\n\n## Terminy\n\n| Sprawa | Termin |\n| --- | --- |\n| Ślubowanie | 30 dni |\n\n## Najczęstsze pytania\n\n### Czy?\n\nTak.';
  const { html, sekcje } = await render(md, { kierunek: {} });
  zawiera(html, '<section id="o-kierunku" aria-labelledby="o-kierunku-h"><h2 id="o-kierunku-h">O Kolegium Doktorskim</h2><div class="prose"><p>Tekst.</p></div></section>',
    '<section id="terminy" aria-labelledby="terminy-h"><h2 id="terminy-h">Terminy</h2><table class="tab">');
  assert.deepEqual(sekcje.map((s) => [s.id, s.krotka]), [['o-kierunku', 'O Kolegium'], ['terminy', undefined], ['pytania', 'Pytania']]);
});

test('tabela w tekście „O kierunku” zostaje zwykłą tabelą', async () => {
  const { html } = await render('## O kierunku\n\n| A | B |\n| --- | --- |\n| 1 | 2 |', { kierunek: {} });
  zawiera(html, '<div class="prose"><table>');
});

test('specjalności: miejsce na kafelki, bez specjalności sekcji nie ma, brak nagłówka — na końcu', async () => {
  const md = '## O kierunku\n\nTekst.\n\n## Specjalności\n\n## Kontakt\n\nTel.';
  zawiera((await render(md, { kierunek: { specjalnosci: true } })).html, '<h2 id="specjalnosci-h">Specjalności</h2><!--specjalnosci--></section>');
  assert.ok(!(await render(md, { kierunek: {} })).html.includes('specjalnosci'));
  const { html, sekcje } = await render('## About\n\nText.', { kierunek: { specjalnosci: true }, lang: 'en' });
  zawiera(html, '<h2 id="specjalnosci-h">Specialisations</h2><!--specjalnosci-->');
  assert.equal(sekcje.at(-1).id, 'specjalnosci');
});

test('program: ### jako zakładki, akapit jako p.dotyczy, jedna lista plików w sekcji', async () => {
  const md = '## Program studiów\n\n### Nowy program\n\nDla rocznika 2026.\n\n- [Program](/pliki/studia/p.pdf)\n\n### Programy archiwalne\n\n- [Archiwalne programy](/studia/archiwalne-programy)';
  const { html } = await render(md, { kierunek: {} });
  zawiera(html,
    '<div class="tresc-taby" role="tablist" aria-label="Program studiów"><button type="button" role="tab" id="tab-0" aria-controls="prog-0" aria-selected="true" tabindex="0">Nowy program</button>',
    '<div class="kier-prog" role="tabpanel" id="prog-0" aria-labelledby="tab-0" data-panel=""><p class="kier-podpis">Nowy program</p><p class="dotyczy">Dla rocznika 2026.</p><ul class="pliki">',
    '<span>Archiwalne programy</span><span class="typ">strona</span>');
  const jeden = (await render('## Program studiów\n\nDla wszystkich.\n\n- [Program](/pliki/studia/p.pdf)', { kierunek: {} })).html;
  zawiera(jeden, '<div class="kier-prog" id="prog-0" data-panel=""><p class="dotyczy">Dla wszystkich.</p><ul class="pliki">');
  assert.ok(!jeden.includes('tresc-taby'));
});

test('wzór w akapicie i strona z polem bloki: .wst', async () => {
  zawiera((await render('## O kierunku\n\nPrzestrzeń $\\ell^2$ w tekście.', { kierunek: {} })).html, '<span class="katex">');
  zawiera((await render('## Sekcja\n\nPierwszy akapit.')).html, '<p class="wst">Pierwszy akapit.</p>');
  assert.ok(!(await render('## O kierunku\n\nPierwszy akapit.', { kierunek: {} })).html.includes('wst'));
});

test('strona bez pola bloki: bez zmian', async () => {
  const { html } = await render('- **A** — b\n- **C** — d', { bloki: false });
  assert.ok(!html.includes('class='), html);
});

// String.raw: w źródłach testu ukośniki dokładnie jak w pliku Markdown
test('wzór po zapisie w edytorze jak przed zapisem; wzór bez śladu edytora bez zmian', async () => {
  const katex = async (md) => (await render(String.raw`## O kierunku` + '\n\n' + md, { kierunek: {} })).html.match(/<span class="katex">[\s\S]*?<\/annotation>/)[0];
  assert.equal(await katex(String.raw`$\\ell^2$`), await katex(String.raw`$\ell^2$`));
  assert.equal(await katex(String.raw`$a\_1 + x^\*$`), await katex(String.raw`$a_1 + x^*$`));
  assert.ok((await katex(String.raw`$a \\ b$`)).includes(String.raw`a \\ b`));
});

// Specjalności (zlecenie 29): tryb sekcji z kotwicami typu „specjalnosc”, wstawki sekcji liczonych z innych danych.
const procesorySpec = {};
async function renderSpec(md, opcje = {}, lang = 'pl') {
  procesorySpec[lang] ??= await createMarkdownProcessor({
    remarkPlugins: [remarkMath, remarkWzoryEdytora],
    rehypePlugins: [rehypeKatex, [rehypeBloki, { lang, site: 'https://im-uwr.github.io', base: '/Web-Core', polski: (t) => /[ąćęłńóśźż]/i.test(t) }]],
  });
  const naglowki = lang === 'en' ? { seminaria: 'Seminars', opiekun: 'Coordinator' } : undefined;
  const fm = { specjalnosc: { wstawki: { seminaria: true, opiekun: true, wybor: true }, naglowki, klasaRamki: 'sp-dla', ...opcje } };
  const r = await procesorySpec[lang].render(md, { frontmatter: fm });
  return { html: r.code.replace(/>\s+</g, '><').replace(/\n/g, ' '), sekcje: fm.specjalnosc.sekcje, dane: fm.specjalnosc.dane };
}

test('specjalność: kotwice, krótka etykieta spisu, „Przydatne strony” z adresem .php to ul.linki', async () => {
  const md = '## O specjalności\n\nTekst.\n\n## Przydatne strony\n\n- [Zakład](/instytut/zaklady/statystyka)\n- [Katalog (USOS)](https://usosweb.uwr.edu.pl/kontroler.php?_action=x)\n\n## Jak przebiega specjalność\n\n1. **Semestr 5: Wybór** — Opis.';
  const { html, sekcje } = await renderSpec(md);
  zawiera(html, '<section id="o-specjalnosci"', '<section id="linki"', '<ul class="linki"><li><a href="/instytut/zaklady/statystyka">Zakład</a></li>', '<section id="przebieg"');
  assert.ok(!html.includes('class="pliki"'), html);
  assert.deepEqual(sekcje.map((s) => s.id), ['o-specjalnosci', 'linki', 'przebieg', 'seminaria', 'opiekun']);
  assert.equal(sekcje[2].krotka, 'Jak przebiega');
});

test('specjalność: cytat „Dla kogo” to ramka, listy w „Co będziesz umieć” i tematach to kreski z szarym dopiskiem', async () => {
  const md = '## O specjalności\n\nTekst.\n\n> **Dla kogo**\n>\n> Dla osób lubiących liczby.\n\n## Co będziesz umieć\n\n- liczyć\n- modelować\n\n## Przykładowe tematy prac\n\n- Równania z dyfuzją — praca magisterska; promotor: X';
  const { html } = await renderSpec(md);
  zawiera(html, '<div class="uwaga"><span class="etyk">Dla kogo</span><div class="sp-dla"><p>Dla osób lubiących liczby.</p></div></div>',
    '<ul class="kreski"><li>liczyć</li><li>modelować</li></ul>', '<li>Równania z dyfuzją<span class="sp-opis"> — praca magisterska; promotor: X</span></li>');
  const en = (await renderSpec(md.replace('Co będziesz umieć', 'Skills').replace('Przykładowe tematy prac', 'Sample thesis topics'), {}, 'en')).html;
  zawiera(en, '<li><span lang="pl">Równania z dyfuzją</span><span class="sp-opis">', '<h2 id="seminaria-h">Seminars</h2>');
});

test('specjalność: wstawki pod nagłówkiem, bez nagłówka w zwykłym miejscu, bez danych bez sekcji; nagłówek opiekuna z danych', async () => {
  const md = '## O specjalności\n\nTekst.\n\n## Jak przebiega specjalność\n\n1. **Semestr 5: Seminarium** — Opis.\n\n## Seminaria\n\n## Dokumenty\n\n- [Plik](/pliki/a.pdf)\n\n## Opiekun specjalności';
  const { html, sekcje } = await renderSpec(md, { naglowki: { opiekun: 'Opiekunowie specjalności' } });
  zawiera(html, '</ol><!--wstaw:wybor-->', '<h2 id="seminaria-h">Seminaria</h2><!--wstaw:seminaria-->', '<h2 id="opiekun-h">Opiekunowie specjalności</h2><!--wstaw:opiekun-->');
  assert.deepEqual(sekcje.map((s) => s.id), ['o-specjalnosci', 'przebieg', 'seminaria', 'dokumenty', 'opiekun']);
  const bez = await renderSpec(md.replace('## Seminaria\n\n', ''), { wstawki: { seminaria: true, opiekun: false, wybor: true } });
  assert.deepEqual(bez.sekcje.map((s) => s.id), ['o-specjalnosci', 'przebieg', 'seminaria', 'dokumenty']);
  const bezOsi = (await renderSpec('## O specjalności\n\nTekst.', { wstawki: { seminaria: false, opiekun: false, wybor: true } })).html;
  zawiera(bezOsi, '<p>Tekst.</p></div><!--wstaw:wybor--></section>');
});

test('specjalność: dane do liczb w banerze (etapy osi i grupy przedmiotów)', async () => {
  const md = '## Jak przebiega specjalność\n\n1. **Semestr 4: Deklaracja specjalności** — Opis.\n\n## Czego się uczysz\n\n### Przedmioty specjalności (program od 2026/27)\n\n- **Analiza** — Opis.\n- **Algebra** — Opis.';
  const { dane } = await renderSpec(md);
  assert.deepEqual(dane.etapy, [{ etyk: 'Semestr 4', t: 'Deklaracja specjalności' }]);
  assert.deepEqual(dane.grupy, [{ nazwa: 'Przedmioty specjalności (program od 2026/27)', n: 2 }]);
});
