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
    status: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
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
  }),
});






// ... inside content.config.ts
// 2. Library (Your Books)
//const books = defineCollection({
  //loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
  //schema: ({ image }) => z.object({  // ensure ({ image }) is here
   // title: z.string(),
   // author: z.string(),
   // cover: image().refine((img) => img.width >= 100, {
   //     message: "Cover image must be at least 100px wide.",
   // }).optional(),
   // rating: z.number().min(1).max(5).optional(),
   // dateRead: z.coerce.date().optional(),
 // }),
//});

// 3. Blog
const blog = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            excerpt: z.string().optional(),
            publishDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            isFeatured: z.boolean().default(false),
            tags: z.array(z.string()).default([]),
            status: z.enum(['🌱 seedling', '🌿 budding', '🌳 evergreen']).default('🌱 seedling'),
            seo: seoSchema(image).optional()
        })
});

// 4. Projects (Digital Garden Portfolio items)
const projects = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/digital-garden' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string().optional(),
            publishDate: z.coerce.date(),
            isFeatured: z.boolean().default(false),
            tags: z.array(z.string()).default([]),
            status: z.enum(['🌱 seedling', '🌿 budding', '🌳 evergreen']).default('🌱 seedling'),
            seo: seoSchema(image).optional()
        })
});

// 5. Pages
const pages = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            seo: seoSchema(image).optional()
        })
});

// --- SINGLE EXPORT ---
export const collections = {
  garden,
  books,
  blog,
  projects,
  pages
};