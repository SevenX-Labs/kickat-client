export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  coverImage?: string | null;
  category?: string | null;
  categoryId?: string | null;
  tags?: string[];
  isPublished: boolean;
  publishedAt: string;
  authorName?: string | null;
  viewCount?: number;
  readTimeMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsQuery {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export interface BlogsResponse {
  success: boolean;
  data?: BlogPost[];
  blogs?: BlogPost[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BlogCategoriesResponse {
  success: boolean;
  categories: string[];
}

export interface SingleBlogResponse {
  success: boolean;
  blog: BlogPost;
}
