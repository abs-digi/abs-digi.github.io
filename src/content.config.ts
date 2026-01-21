import { glob } from 'astro/loaders';
import { defineCollection, z, type ImageFunction } from 'astro:content';

// --- HELPERS ---
const imageSchema = (image: ImageFunction) =>
    z.object({
        src: image(),
        alt: z.string().optional()
    });

const seoSchema = (image: ImageFunction) =>
    z.object({
        title: z.string().min(5).max(120).optional(),
        description: z.string().min(15).max(160).optional(),
        image: imageSchema(image).optional(),
        pageType: z.enum(['website', 'article']).default('website')
    });

// --- COLLECTIONS ---

// 1. Garden (Your Notes)
const garden = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/garden' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['seeds', 'trees', 'fruit']).default('seeds'),
    // FIXED: Use coerce.date() to allow strings like "Dec 16 2025"
    created: z.coerce.date(), 
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});



// Find this section:
const books = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    author: z.string(),
    
    // REPLACE THIS LINE:
    // cover: image().refine((img) => img.width >= 100, { ... }),
    
    // WITH THIS LINE:
    cover: image().optional(), // Accepts any image size
    
    rating: z.number().min(1).max(5).optional(),
    dateRead: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// --- SINGLE EXPORT ---
export const collections = {
  garden,
  books
};