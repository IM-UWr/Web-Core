// Renderowanie Markdownu z pól tekstowych (np. treść angielska wpisana w formularzu).
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBase from '../plugins/rehype-base.mjs';
import rehypeZewn from '../plugins/rehype-zewn.mjs';
import rehypeBloki from '../plugins/rehype-bloki.mjs';
import rehypeLimity from '../plugins/rehype-limity.mjs';
import remarkWzoryEdytora from '../plugins/remark-wzory-edytora.mjs';

import type { Lang } from './daty';

// osobny procesor dla stron /en: linki wewnętrzne w tekście dostają /en (src/plugins/rehype-base.mjs, opcja lang)
const procesory = new Map<Lang, Awaited<ReturnType<typeof createMarkdownProcessor>>>();

export interface Naglowek { depth: number; slug: string; text: string }

export async function renderMarkdown(src: string | undefined, lang: Lang = 'pl'): Promise<string> {
  return (await renderMarkdownZNaglowkami(src, lang)).html;
}

// bloki — pole „Bloki wzorca” strony: listy Markdown jako bloki wzorca treści (src/plugins/rehype-bloki.mjs)
export async function renderMarkdownZNaglowkami(src: string | undefined, lang: Lang = 'pl', bloki = false): Promise<{ html: string; naglowki: Naglowek[] }> {
  if (!src) return { html: '', naglowki: [] };
  let processor = procesory.get(lang);
  if (!processor) {
    processor = await createMarkdownProcessor({
      remarkPlugins: [remarkMath],
      // linki poza stronę: klasa zew (↗ z CSS) i ukryty dopisek „(inna strona)” / „(external site)” — zlecenie 14, zalecenie 23
      rehypePlugins: [rehypeKatex, [rehypeBloki, { lang }], [rehypeBase, { base: import.meta.env.BASE_URL, lang }], [rehypeZewn, { site: import.meta.env.SITE, base: import.meta.env.BASE_URL, lang }]],
    } as any);
    procesory.set(lang, processor);
  }
  const result = await processor.render(src, { frontmatter: { bloki } });
  return { html: result.code, naglowki: ((result.metadata as any)?.headings ?? []) as Naglowek[] };
}

// ---------- Treść kierunku (zlecenie 28): jeden Markdown, sekcje po ## (src/plugins/rehype-bloki.mjs, kotwice w kotwice.mjs) ----------
// Ten sam procesor dla treści polskiej (body) i angielskiej (tresc_en), z limitami linii (rehype-limity.mjs: komórki tabel,
// nazwiska i e-maile w kontaktach), jak treść z pliku. Wynik: HTML sekcji (miejsce na kafelki specjalności: <!--specjalnosci-->)
// i spis sekcji do „Na tej stronie”.
export interface SekcjaKierunku { id: string; etykieta: string; krotka?: string }
const procesoryKierunku = new Map<Lang, Awaited<ReturnType<typeof createMarkdownProcessor>>>();

export async function renderKierunku(src: string | undefined, lang: Lang, opcje: { specjalnosci: boolean; polski?: boolean }): Promise<{ html: string; sekcje: SekcjaKierunku[] }> {
  let processor = procesoryKierunku.get(lang);
  if (!processor) {
    const site = import.meta.env.SITE, base = import.meta.env.BASE_URL;
    processor = await createMarkdownProcessor({
      // wzory zapisane edytorem Pages CMS (ukośniki Markdownu we wzorze) — src/plugins/remark-wzory-edytora.mjs
      remarkPlugins: [remarkMath, remarkWzoryEdytora],
      rehypePlugins: [rehypeKatex, [rehypeBloki, { lang, site, base }], rehypeLimity, [rehypeBase, { base, lang }], [rehypeZewn, { site, base, lang }]],
    } as any);
    procesoryKierunku.set(lang, processor);
  }
  const kierunek: Record<string, unknown> = { specjalnosci: opcje.specjalnosci, ...(opcje.polski ? { lang: 'pl' } : {}) };
  const result = await processor.render(src ?? '', { frontmatter: { kierunek } });
  return { html: result.code, sekcje: (kierunek.sekcje ?? []) as SekcjaKierunku[] };
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
