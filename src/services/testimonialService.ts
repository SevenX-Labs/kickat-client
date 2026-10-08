import { api } from "./api";

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  content?: string;
  comment?: string;
  avatarUrl?: string | null;
  location?: string | null;
  petSpecies?: string | null;
  petType?: string | null;
  petName?: string | null;
  role?: string | null;
  isActive?: boolean;
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
      method: "GET",
    });
  },
};
