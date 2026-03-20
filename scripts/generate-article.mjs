import Anthropic from "@anthropic-ai/sdk";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/content/blog";
const AGENCES_DIR = "src/content/agences";

async function getExistingArticles() {
  const files = await readdir(BLOG_DIR);
  const articles = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const content = await readFile(join(BLOG_DIR, file), "utf-8");
    const titleMatch = content.match(/^title:\s*"(.+)"/m);
    articles.push({
      slug: file.replace(".md", ""),
      title: titleMatch ? titleMatch[1] : file,
    });
  }
  return articles;
}

async function getAgences() {
  const files = await readdir(AGENCES_DIR);
  const agences = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const content = await readFile(join(AGENCES_DIR, file), "utf-8");
    const nameMatch = content.match(/^name:\s*"(.+)"/m);
    const slugMatch = content.match(/^slug:\s*"(.+)"/m);
    agences.push({
      slug: slugMatch ? slugMatch[1] : file.replace(".md", ""),
      name: nameMatch ? nameMatch[1] : file,
    });
  }
  return agences;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

async function main() {
  const existingArticles = await getExistingArticles();
  const agences = await getAgences();

  const existingTitles = existingArticles.map((a) => `- "${a.title}"`).join("\n");
  const existingSlugs = existingArticles.map((a) => a.slug).join(", ");

  const agenceLinks = agences
    .map((a) => `- [${a.name}](/agences/${a.slug}/)`)
    .join("\n");

  const blogLinks = existingArticles
    .map((a) => `- [${a.title}](/blog/${a.slug}/)`)
    .join("\n");

  const client = new Anthropic();

  const today = getTodayDate();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `Tu es le rédacteur principal du blog site-confiance-seo.fr, un média indépendant de type "guide consommateur" qui aide les entreprises à choisir et travailler avec des agences digitales (SEO, dev web, marketing).

## Consignes d'écriture

- **Voix** : première personne du singulier ("je", "j'ai constaté", "dans mon expérience")
- **Ton** : réflexif, authentique et profond. Tu partages tes observations avec du recul, des nuances, des doutes parfois. Pas de ton commercial ou superficiel.
- **Longueur** : 1800-2500 mots
- **Structure** : titre H1, sections H2 et H3, paragraphes aérés
- **Obligatoire** :
  - Minimum **2 tableaux** comparatifs ou récapitulatifs en markdown
  - Minimum **2 citations** en blockquote (de professionnels, entrepreneurs, ou réflexions personnelles)
- **Maillage interne** : inclure 3 à 5 liens vers d'autres pages du site, en utilisant un texte d'ancre naturel

## Pages existantes pour le maillage interne

### Articles de blog
${blogLinks}

### Fiches agences
${agenceLinks}

## Articles déjà publiés (NE PAS refaire)
${existingTitles}

## Ta mission

Génère UN SEUL nouvel article de blog sur une thématique liée au choix et à la collaboration avec des agences digitales ou freelances. Choisis un angle ORIGINAL qui n'a pas encore été traité.

Idées possibles (mais tu peux en inventer d'autres) :
- Pourquoi j'ai arrêté de croire aux audits SEO gratuits
- Ce que j'ai appris en changeant 3 fois d'agence web
- Le vrai coût caché d'un site "pas cher"
- Pourquoi la transparence est le critère n°1 que je regarde
- Comment j'évalue la qualité technique d'un prestataire web
- Les erreurs que je vois répéter par les PME avec leurs agences
- Faut-il exiger un accès à la Search Console de son agence SEO
- Mon framework personnel pour évaluer un devis digital
- Pourquoi le moins-disant est rarement le bon choix en SEO

## Format de sortie

Génère le fichier markdown COMPLET avec le frontmatter YAML. Le frontmatter doit suivre exactement ce format :

\`\`\`
---
title: "Titre de l'article"
metaTitle: "Meta title SEO optimisé (max 60 caractères)"
metaDescription: "Meta description SEO (max 155 caractères)"
date: "${today}"
author: "La rédaction"
excerpt: "Résumé accrocheur de l'article en 1-2 phrases"
tags: ["tag1", "tag2", "tag3"]
---
\`\`\`

Génère UNIQUEMENT le contenu markdown, sans bloc de code autour. Commence directement par les trois tirets du frontmatter.`,
      },
    ],
  });

  const articleContent = response.content[0].text.trim();

  // Extract title from frontmatter for slug
  const titleMatch = articleContent.match(/^title:\s*"(.+)"/m);
  if (!titleMatch) {
    console.error("Could not extract title from generated article");
    process.exit(1);
  }

  const title = titleMatch[1];
  const slug = slugify(title);

  // Check slug doesn't already exist
  if (existingArticles.some((a) => a.slug === slug)) {
    console.error(`Article with slug "${slug}" already exists. Aborting.`);
    process.exit(1);
  }

  const filePath = join(BLOG_DIR, `${slug}.md`);
  await writeFile(filePath, articleContent, "utf-8");

  console.log(`Article created: ${filePath}`);
  console.log(`Title: ${title}`);
  console.log(`Slug: ${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
