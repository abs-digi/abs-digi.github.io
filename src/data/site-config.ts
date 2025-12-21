// 1. IMPORT YOUR IMAGES HERE
// Note: We use the relative path to where the files are located in src/assets/images/books/book/
import heroImage from '../assets/images/book/555.png';
import avatarImage from '../assets/images/book/555b.png';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://abs-garden.com',
    avatar: {
        // 2. USE THE IMPORTED VARIABLE HERE
        src: avatarImage, 
        alt: 'Ab'
    },
    title: "Ab's Website",
    subtitle: 'Website & Books',
    description: 'A curated collection of notes, books, and resources on technology, development, and digital innovation.',
    image: {
        src: '/dante-preview.jpg', // This is fine if dante-preview.jpg is still in public/
        alt: 'Dante - Astro.js and Tailwind CSS theme'
    },
    headerNavLinks: [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
        { text: 'Garden', href: '/garden' },
        { text: 'Tags', href: '/tags' },
        { text: 'Books', href: '/books' },
        { text: 'Guestbook', href: '/guestbook' },
        { text: 'Links', href: '/links' },
        { text: 'Favorites', href: '/favorites' },
    ],
    footerNavLinks: [],
    socialLinks: [
        { text: 'X', href: 'https://x.com/abs_digi' }
    ],
    hero: {
        title: 'Hi There & Welcome to My Corner of the Web!',
        text: "Welcome to my website. I share my thoughts on technology, development, and continuous learning through curated notes and resources.",
        image: {
            // 3. USE THE IMPORTED VARIABLE HERE
            src: heroImage,
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