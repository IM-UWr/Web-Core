// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBase from './src/plugins/rehype-base.mjs';
import rehypeZewn from './src/plugins/rehype-zewn.mjs';
import rehypeBloki from './src/plugins/rehype-bloki.mjs';
import rehypeLimity from './src/plugins/rehype-limity.mjs';
import remarkWzoryEdytora from './src/plugins/remark-wzory-edytora.mjs';
import panelWariantow from './src/plugins/panel-wariantow.mjs';
import trescTelefon from './src/plugins/postcss-tresc-telefon.mjs';

// Adres strony. Na GitHub Pages (strona projektu) adres ma postać
// https://<konto>.github.io/<repozytorium>/ — stąd BASE_PATH.
// W GitHub Actions oba adresy podaje actions/configure-pages, więc po podpięciu
// domeny UWr (plik CNAME / ustawienia Pages) nic nie trzeba tu zmieniać.
const site = process.env.SITE_URL || 'https://im-uwr.github.io';
const base = process.env.BASE_PATH !== undefined ? process.env.BASE_PATH || '/' : '/Web-Core';

// Panel wariantów skali (tylko `astro dev`) ukryty 6.11.2026 na prośbę właściciela. Żeby wrócił: true.
const PANEL_WARIANTOW = false;

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [react(), ...(PANEL_WARIANTOW ? [panelWariantow()] : [])],
  markdown: {
    // wzory zapisane edytorem Pages CMS (Treść stron i wpisów, zlecenie 30) — src/plugins/remark-wzory-edytora.mjs
    remarkPlugins: [remarkMath, remarkWzoryEdytora],
    rehypePlugins: [rehypeKatex, [rehypeBloki, { site, base }], rehypeLimity, [rehypeBase, { base }], [rehypeZewn, { site, base }]],
  },
  build: {
    format: 'directory',
  },
  vite: {
    css: { postcss: { plugins: [trescTelefon()] } },
  },
});
