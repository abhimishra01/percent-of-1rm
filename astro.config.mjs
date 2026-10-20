import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import site from './src/site.config.ts';

// PAGES_BASE and PAGES_SITE are set only for the GitHub Pages build (see .github/workflows/pages.yml).
// SITE_MODE=bingemind builds the copy that lives at https://bingemind.com/<slug>/ (npm run build:bingemind).
const bingemind = site.bingemind;

// The Bingemind root owns robots.txt and ads.txt, so this build does not ship its own.
const dropRootFiles = {
  name: 'drop-root-files',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (!bingemind) return;
      for (const f of ['robots.txt', 'ads.txt']) rmSync(fileURLToPath(new URL(f, dir)), { force: true });
    },
  },
};

export default defineConfig({
  site: bingemind ? 'https://bingemind.com' : process.env.PAGES_SITE || `https://${site.domain}`,
  base: bingemind ? `/${site.slug}/` : process.env.PAGES_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap(), dropRootFiles],
  vite: { plugins: [tailwindcss()] },
});
