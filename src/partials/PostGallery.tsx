import type { MarkdownInstance } from 'astro';

import type { IFrontmatterWithTags } from '@/partials/PostCard';
import { PostCard } from '@/partials/PostCard';

type IPostGalleryProps = {
  postList: MarkdownInstance<IFrontmatterWithTags>[];
};

const PostGallery = ({ postList }: IPostGalleryProps) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
    {postList.map((post) => (
      <PostCard key={post.url} instance={post} />
    ))}
  </div>
);

export { PostGallery };
