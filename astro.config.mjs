import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import siteConfig from './src/data/site-config';

// https://astro.build/config
export default defineConfig({
    site: siteConfig.website,
    // base: '/dante',  <-- DELETE THIS LINE (or comment it out)
    vite: {
        plugins: [tailwindcss()],
        server: {
            fs: {
                allow: ['..']
            }
        }
    },
    integrations: [mdx(), sitemap(), vue()]
});