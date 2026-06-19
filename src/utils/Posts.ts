import type {
  IFrontmatter,
  MarkdownInstance,
} from 'astro-boilerplate-components';

export const sortByDate = <T extends IFrontmatter>(
  posts: MarkdownInstance<T>[]
) => {
  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.pubDate).valueOf() -
      new Date(a.frontmatter.pubDate).valueOf()
  );
};

export const getAllTags = <T extends IFrontmatter & { tags?: string[] }>(
  posts: MarkdownInstance<T>[]
): string[] => {
  return [...new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))].sort();
};
