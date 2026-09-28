import { api } from './api';

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatarUrl?: string | null;
  location?: string | null;
  petSpecies?: string | null;
  petName?: string | null;
  isVerified?: boolean;
  order?: number;
  createdAt?: string;
}

export const testimonialService = {
  /**
   * GET /api/v1/home/testimonials
   * Fetch active verified customer testimonials
   */
  async getTestimonials(limit: number = 10): Promise<{ success: boolean; data: TestimonialItem[] }> {
    return api<{ success: boolean; data: TestimonialItem[] }>(`/home/testimonials?limit=${limit}`, {
      method: 'GET',
    });
  },
};
