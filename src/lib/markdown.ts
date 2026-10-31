// Renderowanie Markdownu z pól tekstowych (np. treść angielska wpisana w formularzu).
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBase from '../plugins/rehype-base.mjs';

let processor: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;

export interface Naglowek { depth: number; slug: string; text: string }

export async function renderMarkdown(src: string | undefined): Promise<string> {
  return (await renderMarkdownZNaglowkami(src)).html;
}

export async function renderMarkdownZNaglowkami(src: string | undefined): Promise<{ html: string; naglowki: Naglowek[] }> {
  if (!src) return { html: '', naglowki: [] };
  if (!processor) {
    processor = await createMarkdownProcessor({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, [rehypeBase, { base: import.meta.env.BASE_URL }]],
    } as any);
  }
  const result = await processor.render(src);
  return { html: result.code, naglowki: ((result.metadata as any)?.headings ?? []) as Naglowek[] };
}

// ---------- Wzory w tytułach (np. tytuły referatów: „… $\ell^2$ estimates …”) ----------
// Ten sam renderer co treść (remark-math + rehype-katex), wzory w trybie inline, bez owijania w <p> (decyzja 31.10.2026).
// Z Markdownu bierzemy tylko wzory: reszta tytułu zostaje dosłownym tekstem ze źródła — bez kursywy z gwiazdek
// (np. „C*-algebras … C*-dynamical”), list z „1.”, nagłówków z „#” ani cudzysłowów drukarskich.
// Tytuł bez „$” (albo bez poprawnego wzoru) → undefined: szablon wstawia sam tekst, jak dotąd. Atrybuty (title, alt),
// meta, .ics i powiadomienia e-mail dostają dalej zwykły tekst — ta funkcja jest tylko do treści strony.
let processorTytulow: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;

// wtyczka remark: drzewo = jeden akapit z tekstem ze źródła i wzorami (math → inlineMath, czyli też w trybie inline)
function tylkoWzory() {
  return (tree: any, file: any) => {
    const zrodlo = String(file.value);
    const wzory: any[] = [];
    const szukaj = (n: any) => {
      if ((n.type === 'inlineMath' || n.type === 'math') && n.position) wzory.push(n);
      else n.children?.forEach(szukaj);
    };
    szukaj(tree);
    const dzieci: any[] = [];
    let poz = 0;
    for (const w of wzory) {
      const od = w.position.start.offset;
      const doo = w.position.end.offset;
      if (od > poz) dzieci.push({ type: 'text', value: zrodlo.slice(poz, od) });
      dzieci.push({
        type: 'inlineMath',
        value: w.value,
        data: { hName: 'code', hProperties: { className: ['language-math', 'math-inline'] }, hChildren: [{ type: 'text', value: w.value }] },
      });
      poz = doo;
    }
    if (poz < zrodlo.length) dzieci.push({ type: 'text', value: zrodlo.slice(poz) });
    tree.children = [{ type: 'paragraph', children: dzieci }];
  };
}

export async function renderTytulZWzorami(src: string | undefined): Promise<string | undefined> {
  const tekst = src?.trim();
  if (!tekst || !tekst.includes('$')) return undefined;
  if (!processorTytulow) {
    processorTytulow = await createMarkdownProcessor({
      remarkPlugins: [remarkMath, tylkoWzory],
      rehypePlugins: [rehypeKatex],
      gfm: false,
      smartypants: false,
      syntaxHighlight: false,
    } as any);
  }
  const html = (await processorTytulow.render(tekst)).code.trim();
  const akapit = /^<p>([\s\S]*)<\/p>$/.exec(html);
  return akapit && html.includes('class="katex') ? akapit[1] : undefined;
}
