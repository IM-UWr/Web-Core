// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBase from './src/plugins/rehype-base.mjs';

// Adres strony. Na GitHub Pages (strona projektu) adres ma postać
// https://<konto>.github.io/<repozytorium>/ — stąd BASE_PATH.
// W GitHub Actions oba adresy podaje actions/configure-pages, więc po podpięciu
// domeny UWr (plik CNAME / ustawienia Pages) nic nie trzeba tu zmieniać.
const site = process.env.SITE_URL || 'https://im-uwr.github.io';
const base = process.env.BASE_PATH !== undefined ? process.env.BASE_PATH || '/' : '/Web-Core';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [react()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, [rehypeBase, { base }]],
  },
  build: {
    format: 'directory',
  },
});
