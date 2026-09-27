import { api } from './api';
import {
  BlogsQuery,
  BlogsResponse,
  BlogCategoriesResponse,
  SingleBlogResponse,
} from '@/types/blog';

export const blogService = {
  /**
   * GET /api/v1/blogs
   * Fetch paginated list of published blog articles
   */
  async getBlogs(query: BlogsQuery = {}): Promise<BlogsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.category && query.category !== 'All') params.set('category', query.category);
    if (query.tag) params.set('tag', query.tag);
    if (query.search) params.set('search', query.search);

    const qs = params.toString();
    const endpoint = `/blogs${qs ? `?${qs}` : ''}`;
    return api<BlogsResponse>(endpoint, { method: 'GET' });
  },

  /**
   * GET /api/v1/blogs/categories
   * Fetch distinct active blog categories
   */
  async getBlogCategories(): Promise<BlogCategoriesResponse> {
    return api<BlogCategoriesResponse>('/blogs/categories', { method: 'GET' });
  },

  /**
   * GET /api/v1/blogs/:slug
   * Fetch a single blog article by slug
   */
  async getBlogBySlug(slug: string): Promise<SingleBlogResponse> {
    return api<SingleBlogResponse>(`/blogs/${encodeURIComponent(slug)}`, { method: 'GET' });
  },
};
