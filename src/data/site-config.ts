// You can remove or comment out these imports if you are using the public folder paths below
// import avatar from '../assets/images/avatar.jpg';
// import hero from '../assets/images/hero.jpg';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://abs-garden.com',
    avatar: {
        // Change this to the path of your desired avatar image
        src: '/assets/images/book/555b.png', 
        alt: 'Abs'
    },
    title: 'Abs',
    subtitle: 'Digital Garden & Books', // Fixed typo "Digtial" -> "Digital"
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
            text: 'Links',
            href: '/links'
        },
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
        text: "Welcome to my digital garden. 🌿 I plant ideas here, water them with code, and watch them grow.",
        image: {
            // Change this to the path of your desired hero image
            src: '/assets/images/book/555.png',
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