// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://site-confiance-seo.fr',
  integrations: [sitemap()],
});
