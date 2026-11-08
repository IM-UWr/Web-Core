import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMarkdownProcessor} from '@astrojs/markdown-remark';
import directive from 'remark-directive';
import jawne from './remark-jawne-bloki.mjs';
import bloki from './rehype-bloki.mjs';
import {usunProze} from '../../skrypty/usun-otoczki-proza.mjs';
const processor=await createMarkdownProcessor({remarkPlugins:[directive,jawne],rehypePlugins:[bloki]});
const render=async source=>(await processor.render(source,{frontmatter:{kierunek:{jawne:true}}})).code.replace(/>\s+</g,'><').replace(/ data-proza-domyslna=""/g,'');

test('zwykły tekst otrzymuje prozę bez odgadywania kafelków z listy',async()=>{
 const html=await render('## Sekcja\n\nAkapit.\n\n- **Tytuł** — opis\n- **Drugi** — opis');
 assert.match(html,/class="prose"/);assert.doesNotMatch(html,/class="dwa"/);
});
test('usunięcie otoczki zachowuje HTML tekstu i jawnych bloków wewnątrz',async()=>{
 const source='## Sekcja {#sekcja}\n\n::::proza\n\nTekst.\n\n:::ramka{tytul="Uwaga"}\n\nTreść ramki.\n\n:::\n\nPo ramce.\n\n::::';
 const migrated=usunProze(source);
 assert.equal(migrated.blocks,1);assert.doesNotMatch(migrated.source,/::::/);
 assert.equal(await render(source),await render(migrated.source));
});
test('migracja omija przykłady w blokach kodu i jest idempotentna',()=>{
 const source='```markdown\n:::proza\n\nPrzykład.\n\n:::\n```\n\n:::proza\n\nTekst.\n\n:::';
 const first=usunProze(source),second=usunProze(first.source);
 assert.equal(first.blocks,1);assert.match(first.source,/```markdown\n:::proza/);
 assert.equal(second.blocks,0);assert.equal(second.source,first.source);
});
test('migracja odmawia usunięcia niezamkniętego bloku',()=>{
 assert.throws(()=>usunProze(':::proza\n\nTekst bez końca.'),/Niezamknięty/);
});
test('pusta otoczka nie usuwa następnego nagłówka',()=>{
 assert.match(usunProze(':::proza\n\n:::\n\n## AA\n\nTekst.').source,/^## AA/);
});
