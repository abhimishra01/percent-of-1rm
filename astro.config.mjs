import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';

// PAGES_BASE and PAGES_SITE are set only for the GitHub Pages build (see .github/workflows/pages.yml).
export default defineConfig({
  site: process.env.PAGES_SITE || `https://${site.domain}`,
  base: process.env.PAGES_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
