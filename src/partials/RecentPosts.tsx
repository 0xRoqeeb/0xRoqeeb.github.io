import type { MarkdownInstance } from 'astro';
import { GradientText, Section } from 'astro-boilerplate-components';

import type { IFrontmatterWithTags } from '@/partials/PostCard';
import { PostGallery } from '@/partials/PostGallery';

type IRecentPostsProps = {
  postList: MarkdownInstance<IFrontmatterWithTags>[];
};

const RecentPosts = (props: IRecentPostsProps) => (
  <Section
    title={
      <div className="flex items-baseline justify-between">
        <div>
          Recent <GradientText>Posts</GradientText>
        </div>

        <div className="text-sm">
          <a href="/posts/">View all Posts →</a>
        </div>
      </div>
    }
  >
    <PostGallery postList={props.postList} />
  </Section>
);

export { RecentPosts };
