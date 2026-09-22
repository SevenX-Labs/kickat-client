export interface ReviewItem {
  id: string;
  productId: string;
  userId?: string | null;
  orderId?: string | null;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  photos: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  isSpam: boolean;
  adminReply?: string | null;
  adminReplyAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRatingBreakdown {
  stars: number; // 5, 4, 3, 2, 1
  count: number;
  percentage: number;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  [key: number]: number;
}

export interface ReviewSummaryData {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface ReviewSummaryResponse {
  success: boolean;
  productId: string;
  summary: ReviewSummaryData;
}

export interface SingleReviewResponse {
  success: boolean;
  review: ReviewItem;
}

export interface ReviewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: ReviewItem[];
  pagination: ReviewsPagination;
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  title?: string;
  photos?: string[];
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  review: ReviewItem;
}

export interface MarkHelpfulResponse {
  success: boolean;
  message: string;
  isHelpful?: boolean;
  helpfulCount: number;
}

export interface GetReviewsParams {
  productId: string;
  page?: number;
  limit?: number;
  rating?: number;
  hasPhotos?: boolean;
  verifiedOnly?: boolean;
  sort?: 'newest' | 'helpful' | 'highest' | 'lowest' | 'NEWEST' | 'HELPFUL' | 'HIGHEST' | 'LOWEST';
}
