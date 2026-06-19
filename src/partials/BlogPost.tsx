import { format } from 'date-fns';
import type { ReactNode } from 'react';

import type { IFrontmatterWithTags } from '@/partials/PostCard';
import { AppConfig } from '@/utils/AppConfig';

type IBlogPostProps = {
  frontmatter: IFrontmatterWithTags;
  readingTime?: number;
  children: ReactNode;
};

const BlogPost = (props: IBlogPostProps) => (
  <>
    <h1 className="text-center text-3xl font-bold">
      {props.frontmatter.title}
    </h1>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 text-center text-sm text-gray-400">
      <span>
        By {AppConfig.author} on{' '}
        {format(new Date(props.frontmatter.pubDate), 'LLL d, yyyy')}
      </span>
      {props.readingTime && (
        <span className="text-gray-500">· {props.readingTime} min read</span>
      )}
    </div>

    {props.frontmatter.tags && props.frontmatter.tags.length > 0 && (
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {props.frontmatter.tags.map((tag) => (
          <a
            key={tag}
            href={`/tags/${tag}/`}
            className="rounded-full bg-slate-700 px-3 py-1 text-xs text-cyan-400 hover:bg-slate-600"
          >
            #{tag}
          </a>
        ))}
      </div>
    )}

    <div className="mt-5">
      {props.frontmatter.imgSrc && (
        <div className="aspect-h-2 aspect-w-3">
          <img
            className="size-full rounded-lg object-cover object-center"
            src={props.frontmatter.imgSrc}
            alt={props.frontmatter.imgAlt}
            loading="lazy"
          />
        </div>
      )}
      <div
        data-pagefind-body
        className="prose prose-invert mt-8 max-w-none prose-img:rounded-lg"
      >
        {props.children}
      </div>
    </div>
  </>
);

export { BlogPost };
