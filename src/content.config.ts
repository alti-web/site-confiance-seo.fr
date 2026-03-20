import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    date: z.string(),
    author: z.string().default('La rédaction'),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const agences = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agences' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    h1: z.string(),
    speciality: z.string(),
    city: z.string(),
    note: z.number(),
    noteCount: z.number(),
    type: z.enum(['agency', 'freelance']),
    website: z.string().optional(),
    keywordSeo: z.string(),
    reviews: z.array(
      z.object({
        author: z.string(),
        initials: z.string(),
        rating: z.number(),
        text: z.string(),
        date: z.string(),
      })
    ),
    relatedArticles: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, agences };
