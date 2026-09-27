import { api } from './api';

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatarUrl?: string;
  location?: string;
  petSpecies?: string;
  petName?: string;
  isVerified?: boolean;
  order?: number;
  createdAt?: string;
}

export const testimonialService = {
  /**
   * GET /api/v1/home/testimonials
   * Fetch public customer testimonials
   */
  async getTestimonials(limit: number = 10): Promise<TestimonialItem[]> {
    try {
      const res = await api<{ success: boolean; data: TestimonialItem[] }>(
        `/home/testimonials?limit=${limit}`,
        { method: 'GET' }
      );
      return res?.data || [];
    } catch (err) {
      console.warn('Failed to fetch testimonials:', err);
      return [];
    }
  },
};
