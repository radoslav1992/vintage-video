import { defineCollection, z } from 'astro:content'

// Curated, editorially-written collections. Each markdown file is an
// original essay (the body) that frames a set of films pulled live from the
// Internet Archive via `query`. This original writing is what gives the
// site genuine value beyond a bare aggregator.
const collectionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    emoji: z.string().default('🎬'),
    order: z.number().default(0),
    // 'movie' or 'video' — controls which detail route the cards link to.
    kind: z.enum(['movie', 'video']).default('movie'),
    // Internet Archive advanced-search query used to populate the films.
    query: z.string(),
    // Optional editor's pull-quote shown under the title.
    pullquote: z.string().optional(),
    updated: z.string().optional(),
  }),
})

export const collections = { collections: collectionsCollection }
