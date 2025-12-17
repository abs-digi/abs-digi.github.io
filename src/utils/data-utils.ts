import { type CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

// Add this type union
type TaggedPost = CollectionEntry<'garden'> | CollectionEntry<'books'>;
type BookEntry = CollectionEntry<'books'>;

// Helper function to get the date from different collection types
function getItemDate(item: TaggedPost): Date {
    if (item.collection === 'garden') {
        return new Date(item.data.created);
    } else if (item.collection === 'books') {
        return item.data.dateRead ? new Date(item.data.dateRead) : new Date(0);
    } else {
        // blog has publishDate
        return new Date(item.data.publishDate);
    }
}

// Update function signature to use TaggedPost
export function sortItemsByDateDesc(itemA: TaggedPost, itemB: TaggedPost) {
    return getItemDate(itemB).getTime() - getItemDate(itemA).getTime();
}

// Sorting function for books based on dateRead
export function sortBooksByDateDesc(itemA: BookEntry, itemB: BookEntry) {
    const dateA = itemA.data.dateRead ? new Date(itemA.data.dateRead).getTime() : 0;
    const dateB = itemB.data.dateRead ? new Date(itemB.data.dateRead).getTime() : 0;
    return dateB - dateA;
}

// Update function signature to use TaggedPost[]
export function getAllTags(posts: TaggedPost[]) {
    const tags: string[] = [...new Set(posts.flatMap((post) => post.data.tags || []).filter(Boolean))];
    return tags
        .map((tag) => {
            return {
                name: tag,
                id: slugify(tag)
            };
        })
        .filter((obj, pos, arr) => {
            return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos;
        });
}

// Update function signature to use TaggedPost[]
export function getPostsByTag(posts: TaggedPost[], tagId: string) {
    const filteredPosts: TaggedPost[] = posts.filter((post) => (post.data.tags || []).map((tag) => slugify(tag)).includes(tagId));
    return filteredPosts;
}