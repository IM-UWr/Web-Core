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
