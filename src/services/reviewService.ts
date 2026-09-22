import { api } from './api';
import {
  ReviewsResponse,
  GetReviewsParams,
  CreateReviewPayload,
  CreateReviewResponse,
  MarkHelpfulResponse,
  ReviewSummaryResponse,
  SingleReviewResponse,
} from '@/types/review';

export const reviewService = {
  /**
   * GET /api/v1/reviews
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
    if (params.sort) query.set('sort', params.sort.toLowerCase());

    const qs = query.toString();
    const endpoint = `/reviews${qs ? `?${qs}` : ''}`;
    return api<ReviewsResponse>(endpoint, { method: 'GET' });
  },

  /**
   * GET /api/v1/reviews/summary
   * Fetch aggregate rating score, total review count, and 1-5 star distribution breakdown
   */
  async getReviewSummary(productId: string): Promise<ReviewSummaryResponse> {
    const query = new URLSearchParams({ productId });
    return api<ReviewSummaryResponse>(`/reviews/summary?${query.toString()}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/reviews/:id
   * Fetch details for a single approved customer review
   */
  async getReviewById(id: string): Promise<SingleReviewResponse> {
    return api<SingleReviewResponse>(`/reviews/${id}`, { method: 'GET' });
  },

  /**
   * POST /api/v1/reviews
   * Submit a customer review for a verified delivered order
   */
  async createReview(payload: CreateReviewPayload): Promise<CreateReviewResponse> {
    return api<CreateReviewResponse>('/reviews', {
      method: 'POST',
      data: payload as unknown as Record<string, unknown>,
    });
  },

  /**
   * PATCH /api/v1/reviews/:id/helpful (or POST)
   * Toggle helpful vote on a review (increments +1 / decrements -1)
   */
  async markHelpful(reviewId: string): Promise<MarkHelpfulResponse> {
    return api<MarkHelpfulResponse>(`/reviews/${reviewId}/helpful`, {
      method: 'PATCH',
    });
  },
};
