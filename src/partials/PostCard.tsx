import type { MarkdownInstance } from 'astro';
import type { IFrontmatter } from 'astro-boilerplate-components';
import { format } from 'date-fns';

export type IFrontmatterWithTags = IFrontmatter & { tags?: string[] };

type IPostCardProps = {
  instance: MarkdownInstance<IFrontmatterWithTags>;
};

const PostCard = ({ instance }: IPostCardProps) => {
  const wordCount = instance.rawContent().trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-md bg-slate-800 transition-transform hover:-translate-y-1">
      <div className="aspect-h-2 aspect-w-3">
        <img
          className="size-full object-cover object-center"
          src={instance.frontmatter.imgSrc}
          alt={instance.frontmatter.imgAlt}
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-6 pt-4 text-center">
        <h2 className="text-xl font-semibold">
          <a href={instance.url} className="after:absolute after:inset-0">
            {instance.frontmatter.title}
          </a>
        </h2>

        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>
            {format(new Date(instance.frontmatter.pubDate), 'LLL d, yyyy')}
          </span>
          <span className="text-gray-600">·</span>
          <span>{readingTime} min read</span>
        </div>

        <div className="mt-2 text-sm text-gray-300">
          {instance.frontmatter.description}
        </div>

        {instance.frontmatter.tags && instance.frontmatter.tags.length > 0 && (
          <div className="relative z-10 mt-3 flex flex-wrap justify-center gap-1">
            {instance.frontmatter.tags.map((tag) => (
              <a
                key={tag}
                href={`/tags/${tag}/`}
                className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-cyan-400 hover:bg-slate-600"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { PostCard };
