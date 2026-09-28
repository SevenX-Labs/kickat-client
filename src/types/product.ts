export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface BackendProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  attributes?: Record<string, any> | null;
  imageUrl?: string | null;
  images?: string[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendProductMedia {
  id: string;
  productId: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string | null;
  order: number;
  createdAt?: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  descriptionTitle?: string | null;
  description?: string | null;
  materials?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  rating: number;
  reviewsCount: number;
  brand?: string | null;
  petSpecies?: 'DOG' | 'CAT' | 'BIRD' | 'FISH' | 'RABBIT' | 'OTHER' | null;
  dietaryPreference?: 'VEG' | 'NON_VEG' | null;
  categoryId: string;
  isTrending: boolean;
  isBestSeller: boolean;
  imageUrl: string;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  type: 'SIMPLE' | 'VARIABLE';
  seoTitle?: string | null;
  seoDescription?: string | null;
  attributes?: Record<string, any> | null;
  highlights?: any | null;
  ingredients?: any | null;
  feedingGuide?: any | null;
  careInstructions?: string[];
  sizeGuide?: Record<string, any> | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  createdAt?: string;
  updatedAt?: string;
  category?: BackendCategory;
  variants?: BackendProductVariant[];
  media?: BackendProductMedia[];
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  petSpecies?: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'other' | string;
  diet?: 'veg' | 'non_veg' | string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popularity' | 'rating' | string;
  rating?: number;
}

export interface PaginatedProductsResponse {
  success: boolean;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  products: BackendProduct[];
}

export interface SingleProductResponse {
  success: boolean;
  product: BackendProduct;
}

export interface ProductVariantsResponse {
  success: boolean;
  productId: string;
  variants: BackendProductVariant[];
}

export interface ProductMediaResponse {
  success: boolean;
  productId: string;
  media: BackendProductMedia[];
}

export interface ProductImagesResponse {
  success: boolean;
  productId: string;
  mainImage: string;
  galleryImages: string[];
  mediaImages: BackendProductMedia[];
}

export interface ProductVideosResponse {
  success: boolean;
  productId: string;
  videos: BackendProductMedia[];
}

export interface RelatedProductsResponse {
  success: boolean;
  productId: string;
  relatedProducts: BackendProduct[];
}

export function mapBackendProductToCard(p: BackendProduct) {
  const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  const originalPrice = p.discountPrice && p.discountPrice > 0 ? p.price : undefined;
  
  let tags: string[] = [];
  if (Array.isArray(p.highlights)) {
    tags = p.highlights.map((item: any) => {
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object' && item !== null) {
        return (item.title || item.text || item.value || item.name || Object.values(item)[0] || '');
      }
      return String(item || '');
    }).filter((s) => s && s !== '[object Object]');
  } else if (typeof p.highlights === 'object' && p.highlights !== null) {
    tags = Object.values(p.highlights).map((item: any) => {
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object' && item !== null) {
        return (item.title || item.text || item.value || item.name || Object.values(item)[0] || '');
      }
      return String(item || '');
    }).filter((s) => s && s !== '[object Object]');
  }

  return {
    id: p.id,
    name: p.name,
    price: effectivePrice,
    originalPrice,
    rating: p.rating ?? 0,
    reviewsCount: p.reviewsCount || 0,
    image: p.imageUrl || (p.images && p.images[0]) || '/hero-products/dog_food.png',
    mainCategory: p.category?.name || p.category?.slug || 'Pet Care',
    subCategory: p.petSpecies ? `${p.petSpecies.toLowerCase()} essentials` : 'Essentials',
    brand: p.brand || 'KickAt',
    badge: p.isBestSeller ? 'Best Seller' : p.isTrending ? 'Trending' : undefined,
    tags,
    description: p.description || p.descriptionTitle || '',
    slug: p.slug,
    stock: p.stock,
    type: p.type,
    isTopRated: (p.rating || 0) >= 4.7,
  };
}

export function transformBackendProduct(bp: BackendProduct) {
  const effectivePrice = bp.discountPrice && bp.discountPrice > 0 ? bp.discountPrice : bp.price;
  const originalPrice = bp.discountPrice && bp.discountPrice > 0 ? bp.price : undefined;

  let allImages: string[] = [];
  if (bp.media && bp.media.length > 0) {
    allImages = bp.media.filter((m) => m.type === 'IMAGE').map((m) => m.url);
  }
  if (allImages.length === 0 && Array.isArray(bp.images) && bp.images.length > 0) {
    allImages = bp.images;
  }
  if (allImages.length === 0 && bp.imageUrl) {
    allImages = [bp.imageUrl];
  }
  if (allImages.length === 0) {
    allImages = ['/hero-products/dog_food.png'];
  }

  return {
    id: bp.id,
    name: bp.name,
    slug: bp.slug,
    type: (bp.type || 'SIMPLE') as 'SIMPLE' | 'VARIABLE',
    price: effectivePrice,
    originalPrice,
    discountPrice: bp.discountPrice,
    stock: bp.stock,
    badge: bp.isBestSeller ? 'Best Seller' : bp.isTrending ? 'Trending' : undefined,
    rating: bp.rating ?? 0,
    reviewsCount: bp.reviewsCount || 0,
    image: bp.imageUrl || allImages[0],
    images: allImages,
    mainCategory: bp.category?.name || bp.category?.slug || 'Pet Care',
    subCategory: bp.petSpecies ? `${bp.petSpecies.toLowerCase()} essentials` : 'Essentials',
    brand: bp.brand || 'KickAt',
    petSpecies: bp.petSpecies || undefined,
    dietaryPreference: bp.dietaryPreference || undefined,
    materials: bp.materials || undefined,
    descriptionTitle: bp.descriptionTitle || undefined,
    description: bp.description || bp.descriptionTitle || '',
    attributes: bp.attributes || undefined,
    highlights: bp.highlights || undefined,
    ingredients: bp.ingredients || undefined,
    feedingGuide: bp.feedingGuide || undefined,
    careInstructions: bp.careInstructions || undefined,
    sizeGuide: bp.sizeGuide || undefined,
    faqs: Array.isArray(bp.faqs) ? bp.faqs : typeof bp.faqs === "string" ? JSON.parse(bp.faqs) : undefined,
    variants: (bp.variants || []).map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price,
      discountPrice: v.discountPrice,
      originalPrice: v.discountPrice && v.discountPrice > 0 ? v.price : undefined,
      stock: v.stock,
      attributes: v.attributes,
      imageUrl: v.imageUrl,
      images: v.images && v.images.length > 0 ? v.images : v.imageUrl ? [v.imageUrl] : [],
      isDefault: v.isDefault,
    })),
    media: bp.media || [],
  };
}
