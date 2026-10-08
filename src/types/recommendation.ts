import { BackendProduct } from './product';

export interface RecommendedProductsResponse {
  success: boolean;
  personalized: boolean;
  products: BackendProduct[];
}

export interface RecentlyViewedItem extends BackendProduct {
  viewedAt?: string;
}

export interface RecentlyViewedProductsResponse {
  success: boolean;
  products: RecentlyViewedItem[];
}

export interface RecordActivityResponse {
  success: boolean;
  message: string;
}
