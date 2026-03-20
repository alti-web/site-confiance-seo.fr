// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://site-confiance-seo.fr',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Homepage — highest priority
        if (item.url === 'https://site-confiance-seo.fr/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        }
        // Agency pages — high priority (money pages)
        else if (item.url.includes('/agences/avis-')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        // Agency listing
        else if (item.url.endsWith('/agences/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        }
        // Blog listing
        else if (item.url.endsWith('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'daily';
        }
        // Blog articles
        else if (item.url.includes('/blog/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
});
