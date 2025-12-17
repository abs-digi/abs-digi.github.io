import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config.ts';

export async function GET(context) {
    const gardenNotes = (await getCollection('garden')).sort((a, b) =>
        new Date(b.data.created).getTime() - new Date(a.data.created).getTime()
    );
    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site,
        items: gardenNotes.map((item) => ({
            title: item.data.title,
            description: item.data.description,
            link: `/garden/${item.id}/`,
            pubDate: item.data.created.setUTCHours(0)
        }))
    });
}
