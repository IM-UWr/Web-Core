import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import directive from 'remark-directive';
import jawne from './remark-jawne-bloki.mjs';
import bloki from './rehype-bloki.mjs';

const p=await createMarkdownProcessor({remarkPlugins:[directive,jawne],rehypePlugins:[bloki]});
const render=async (md,typ='kierunek',extra={}) => (await p.render(md,{frontmatter:{[typ]:{jawne:true,specjalnosci:false,wstawki:{opiekun:true,seminaria:true,wybor:true},...extra}}})).code;
test('dowolna nazwa sekcji i stabilna kotwica; zakładki działają bez magicznej nazwy',async()=>{
 const html=await render('## Dowolny tytuł {#program}\n\n:::zakladki\n\n### Nowy\n\nTekst.\n\n### Stary\n\nInny.\n\n:::');
 assert.match(html,/id="program"/);assert.match(html,/role="tablist"/);assert.doesNotMatch(html,/\{#program\}/);
});
test('nazwa Program studiów nie uruchamia zakładek bez znacznika',async()=>{
 const html=await render('## Program studiów\n\n### Nowy\n\nA\n\n### Stary\n\nB');assert.doesNotMatch(html,/tablist/);
});
test('brak wstawki nie powoduje automatycznego dopisania opiekuna',async()=>{
 const html=await render('## O specjalności\n\nOpis.','specjalnosc');assert.doesNotMatch(html,/wstaw:/);
});
test('wstawka ma dokładnie wskazane miejsce',async()=>{
 const html=await render('## Kontakt {#kontakt}\n\nPrzed.\n\n::opiekun\n\nPo.','specjalnosc');assert.match(html,/Przed\.[\s\S]*<!--wstaw:opiekun-->[\s\S]*Po\./);
});
test('powtórzone wstawki i nieistniejące bloki zgłaszają błąd',async()=>{
 await assert.rejects(render('::opiekun\n\n::opiekun','specjalnosc'),/Powtórzona/);
 await assert.rejects(render(':::literowka\n\nTekst\n\n:::'),/znacznik/);
});
test('niepoprawny krok nie znika i nie jest doklejany do poprzedniego',async()=>{
 await assert.rejects(render(':::etapy\n\n1. **Etap: Tytuł** — Opis\n2. Bez tytułu\n\n:::'),/Każdy krok/);
});
test('termin po zwykłej nowej linii zostaje parą, także z pogrubioną etykietą',async()=>{
 const html=await render(':::etapy\n\n1. **Etap: Tytuł** — Opis\n   Termin: Do czerwca\n\n:::');assert.match(html,/<dt>Termin<\/dt>/);
 const bold=await render(':::etapy\n\n1. **Etap: Tytuł** — Opis  \n   **Termin:** Do czerwca\n\n:::');assert.match(bold,/<dt>Termin<\/dt>/);
});
test('kafelki kierunku pochodzą wyłącznie z treści i zachowują kolejność',async()=>{
 const html=await render('## Oferta\n\n:::specjalnosci\n\n- **[Druga](/studia/matematyka/druga)** — B\n- **Pierwsza** — A\n\n:::');
 assert.match(html,/class="dwa kier-spec"/);assert.ok(html.indexOf('Druga')<html.indexOf('Pierwsza'));assert.doesNotMatch(html,/<!--specjalnosci-->/);
});
test('ramka i pytanie nie wymagają magicznych tytułów',async()=>{
 const html=await render(':::ramka{tytul="Uwaga"}\n\nOpis.\n\n:::\n\n:::pytania\n\n### Dowolny tytuł\n\nOdpowiedź.\n\n:::');assert.match(html,/class="uwaga"/);assert.match(html,/<summary>Dowolny tytuł<\/summary>/);
});

test('sekcja zawierająca tylko wstawkę pozostaje widoczna',async()=>{
 const html=await render('## Opiekun {#opiekun}\n\n::opiekun','specjalnosc');assert.match(html,/id="opiekun"/);assert.match(html,/<!--wstaw:opiekun-->/);
});
test('niezamknięty blok zgłasza linię błędu',async()=>{
 await assert.rejects(render(':::kafelki\n\n- **Tytuł** — opis'),/Niezamknięty/);
});

test('kilka bloków zakładek ma niezależne identyfikatory paneli',async()=>{
 const block=':::zakladki\n\n### A\n\nTreść A.\n\n### B\n\nTreść B.\n\n:::';
 const html=await render(block+'\n\n'+block,'specjalnosc');
 const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,8);assert.equal(new Set(ids).size,8);
 for(const m of html.matchAll(/aria-controls="([^"]+)"/g))assert.ok(ids.includes(m[1]));
});

test('zwykła strona zachowuje adres nagłówka, Unicode i zwykłe listy wewnątrz prozy',async()=>{
 const html=await render('## Inna nazwa {#ważne-terminy}\n\n::::proza\n\n- **Tytuł** — opis\n- **Drugi** — opis\n\n::::','strona');
 assert.match(html,/<h2 id="ważne-terminy">Inna nazwa<\/h2>/);
 assert.doesNotMatch(html,/class="dwa"|class="prose"|data-sekcja-id|\{#/);
});

test('na zwykłej stronie układ uruchamia wyłącznie jawny blok',async()=>{
 const html=await render('## Program studiów\n\n:::kafelki\n\n- **A** — opis\n- **B** — opis\n\n:::','strona');
 assert.match(html,/class="dwa"/);assert.doesNotMatch(html,/tablist/);
});

test('komentarz redakcyjny bez treści nie tworzy pustego opisu nad planem',async()=>{
 const html=await render('<!-- PLAN ZAJĘĆ: instrukcja dla redaktora. -->','strona');
 assert.equal(html.trim(),'');
});

test('pusta sekcja zwykłej strony nie trafia do HTML ani spisu',async()=>{
 const html=await render('## Pusta\n\n<!-- Tylko komentarz. -->\n\n## AA\n\n::::proza\n\nTreść.\n\n::::','strona');
 assert.doesNotMatch(html,/>Pusta</);assert.match(html,/<h2 id="aa">AA<\/h2>/);
});
