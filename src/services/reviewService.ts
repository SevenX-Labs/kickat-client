import { api } from './api';
import {
  ReviewsResponse,
  GetReviewsParams,
  CreateReviewPayload,
  CreateReviewResponse,
  MarkHelpfulResponse,
} from '@/types/review';

export const reviewService = {
  /**
   * Fetch approved public reviews with optional filters and pagination
   */
  async getReviews(params: GetReviewsParams): Promise<ReviewsResponse> {
    const query = new URLSearchParams();
    if (params.productId) query.set('productId', params.productId);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.rating) query.set('rating', String(params.rating));
    if (params.hasPhotos) query.set('hasPhotos', 'true');
    if (params.verifiedOnly) query.set('verifiedOnly', 'true');
    if (params.sort) query.set('sort', params.sort);

    const qs = query.toString();
    const endpoint = `/reviews${qs ? `?${qs}` : ''}`;
    return api<ReviewsResponse>(endpoint, { method: 'GET' });
  },

  /**
   * Submit a customer review (Approved by default for verified purchases, shielded if containing spam links)
   */
  async createReview(payload: CreateReviewPayload): Promise<CreateReviewResponse> {
    return api<CreateReviewResponse>('/reviews', {
      method: 'POST',
      data: payload as unknown as Record<string, unknown>,
    });
  },

  /**
   * Mark a review as helpful (increments helpfulCount)
   */
  async markHelpful(reviewId: string): Promise<MarkHelpfulResponse> {
    return api<MarkHelpfulResponse>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },
};
