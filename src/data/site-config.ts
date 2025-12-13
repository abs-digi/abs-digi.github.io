import avatar from '../assets/images/avatar.jpg';
import hero from '../assets/images/hero.jpg';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://abs-garden.com',
    avatar: {
        src: avatar,
        alt: 'Ethan Donovan'
    },
    title: 'Abs',
    subtitle: 'Digtial Garden & Books',
    description: 'Astro.js and Tailwind CSS theme for blog and portfolio by justgoodui.com',
    image: {
        src: '/dante-preview.jpg',
        alt: 'Dante - Astro.js and Tailwind CSS theme'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Digital Garden',
            href: '/digital-garden'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Tags',
            href: '/tags'
        },
        {
            text: 'Books',
            href: '/books'
        },
        {
            text: 'Social Links',
            href: '/links'
        },
        {
            text: 'Favorites',
            href: '/favorites'
        }
        
    ],
    footerNavLinks: [
        // You can leave this empty to remove all links:
    ],
    socialLinks: [
        
        {
            text: 'X',
            href: 'https://x.com/abs_digi'
        }
    ],
    hero: {
        title: 'Hi There & Welcome to My Corner of the Web!',
        // CHANGE THIS LINE:
        text: "Welcome to my digital garden. 🌿 I plant ideas here, water them with code, and watch them grow.",
        image: {
            src: hero,
            alt: 'A person sitting at a desk in front of a computer'
        },
    },
    subscribe: {
        enabled: false,
        title: 'Subscribe to Dante Newsletter',
        text: 'One update per week. All the latest posts directly in your inbox.',
        form: {
            action: '#'
        }
    },
    postsPerPage: 8,
    projectsPerPage: 8 
};

export default siteConfig;