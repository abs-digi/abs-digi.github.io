import { type CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

// Add this type union
type TaggedPost = CollectionEntry<'blog'> | CollectionEntry<'projects'>;

// Update function signature to use TaggedPost
export function sortItemsByDateDesc(itemA: TaggedPost, itemB: TaggedPost) {
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
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