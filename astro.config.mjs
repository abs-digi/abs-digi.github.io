import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import siteConfig from './src/data/site-config';

// https://astro.build/config
export default defineConfig({
    site: 'https://abs-digi.codeberg.page',
    base: 'pages',    
    vite: {
        plugins: [tailwindcss()],
        server: {
            fs: {
                // Fixes the error by allowing Vite to load fonts/scripts from your parent node_modules
                allow: ['..']
            }
        }
    },
    integrations: [mdx(), sitemap()]
});