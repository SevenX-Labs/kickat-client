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
  originalPrice?: number | null;
  stock: number;
  shippingWeightKg?: number | null;
  shippingLengthCm?: number | null;
  shippingBreadthCm?: number | null;
  shippingHeightCm?: number | null;
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
  isPublished: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  type: 'SIMPLE' | 'VARIABLE';
  sku?: string | null;
  shippingWeightKg?: number | null;
  shippingLengthCm?: number | null;
  shippingBreadthCm?: number | null;
  shippingHeightCm?: number | null;
  highlights?: string[] | Record<string, any> | null;
  ingredients?: any;
  feedingGuide?: any;
  careInstructions?: string[];
  sizeGuide?: any;
  attributes?: Record<string, any> | null;
  faqs?: Array<{ question: string; answer: string }> | string | null;
  imageUrl?: string | null;
  images?: string[];
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

function extractHighlights(p: BackendProduct): string[] {
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
  return tags;
}

export interface ProductCardData {
  id: string;
  name: string;
  baseName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  mainCategory: string;
  subCategory: string;
  brand: string;
  badge?: string;
  tags: string[];
  description: string;
  slug?: string;
  stock: number;
  type: 'SIMPLE' | 'VARIABLE';
  isTopRated: boolean;
  variantId?: string;
  selectedVariantId?: string;
  variantName?: string;
  variants?: BackendProductVariant[];
}

export function mapBackendProductToCards(p: BackendProduct): ProductCardData[] {
  const tags = extractHighlights(p);

  // If product is VARIABLE and has variants, create individual variant cards for each variety!
  if (p.type === 'VARIABLE' && Array.isArray(p.variants) && p.variants.length > 0) {
    // 1. Deduplicate variants by id and normalized label/name
    const seenVariantKeys = new Set<string>();
    const uniqueVariants = p.variants.filter((v) => {
      if (!v || !v.id) return false;
      let label = (v.name || '').trim();
      if (v.attributes && typeof v.attributes === 'object') {
        const vals = Object.values(v.attributes).filter(Boolean);
        if (vals.length > 0) {
          label = String(vals[0]).trim();
        }
      }
      const idKey = v.id;
      const labelKey = label ? label.toLowerCase() : '';
      if (seenVariantKeys.has(idKey) || (labelKey && seenVariantKeys.has(`lbl_${labelKey}`))) {
        return false;
      }
      seenVariantKeys.add(idKey);
      if (labelKey) seenVariantKeys.add(`lbl_${labelKey}`);
      return true;
    });

    return uniqueVariants.map((v) => {
      const effectivePrice = v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price;
      const originalPrice = v.discountPrice && v.discountPrice > 0 ? v.price : undefined;
      const variantImage = v.imageUrl || (v.images && v.images[0]) || p.imageUrl || (p.images && p.images[0]) || '/hero-products/dog_food.png';

      let displayLabel = v.name;
      if (v.attributes && typeof v.attributes === 'object') {
        const vals = Object.values(v.attributes).filter(Boolean);
        if (vals.length > 0) {
          displayLabel = String(vals[0]);
        }
      }

      return {
        id: p.id,
        variantId: v.id,
        selectedVariantId: v.id,
        variantName: displayLabel,
        name: `${p.name} – ${displayLabel}`,
        baseName: p.name,
        price: effectivePrice,
        originalPrice,
        rating: (p.reviewsCount && p.reviewsCount > 0) ? (p.rating ?? 0) : 0,
        reviewsCount: p.reviewsCount || 0,
        image: variantImage,
        mainCategory: p.category?.name || p.category?.slug || 'Pet Care',
        subCategory: p.petSpecies ? `${p.petSpecies.toLowerCase()} essentials` : 'Essentials',
        brand: p.brand || 'KickAt',
        badge: p.isBestSeller ? 'Best Seller' : p.isTrending ? 'Trending' : undefined,
        tags,
        description: p.description || p.descriptionTitle || '',
        slug: p.slug,
        stock: v.stock,
        type: p.type,
        isTopRated: Boolean(p.reviewsCount && p.reviewsCount > 0 && (p.rating || 0) >= 4.7),
        variants: uniqueVariants,
      };
    });
  }

  const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  const originalPrice = p.discountPrice && p.discountPrice > 0 ? p.price : undefined;

  return [{
    id: p.id,
    variantId: undefined,
    selectedVariantId: undefined,
    variantName: undefined,
    name: p.name,
    baseName: p.name,
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
    variants: p.variants,
  }];
}

export function mapBackendProductToCard(p: BackendProduct): ProductCardData {
  const cards = mapBackendProductToCards(p);
  return cards[0];
}

export function mapBackendProductListToCards(products: BackendProduct[]): ProductCardData[] {
  if (!Array.isArray(products)) return [];

  // 1. Deduplicate source products by ID
  const seenProductIds = new Set<string>();
  const uniqueProducts = products.filter((p) => {
    if (!p || !p.id) return false;
    if (seenProductIds.has(p.id)) return false;
    seenProductIds.add(p.id);
    return true;
  });

  const cards = uniqueProducts.flatMap(mapBackendProductToCards);

  // 2. Strictly deduplicate cards so no variant or product card appears twice
  const seenCardKeys = new Set<string>();
  return cards.filter((card) => {
    const cardKey = card.variantId
      ? `${card.id}-${card.variantId}`
      : `${card.id}-${(card.variantName || card.name || 'base').trim().toLowerCase()}`;

    if (seenCardKeys.has(cardKey)) {
      return false;
    }
    seenCardKeys.add(cardKey);
    return true;
  });
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
    rating: (bp.reviewsCount && bp.reviewsCount > 0) ? (bp.rating ?? 0) : 0,
    reviewsCount: bp.reviewsCount || 0,
    image: bp.imageUrl || allImages[0],
    images: allImages,
    categorySlug: bp.category?.slug || undefined,
    category: bp.category || undefined,
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
    shippingWeightKg: bp.shippingWeightKg,
    shippingLengthCm: bp.shippingLengthCm,
    shippingBreadthCm: bp.shippingBreadthCm,
    shippingHeightCm: bp.shippingHeightCm,
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
      shippingWeightKg: v.shippingWeightKg,
      shippingLengthCm: v.shippingLengthCm,
      shippingBreadthCm: v.shippingBreadthCm,
      shippingHeightCm: v.shippingHeightCm,
      imageUrl: v.imageUrl,
      images: v.images && v.images.length > 0 ? v.images : v.imageUrl ? [v.imageUrl] : [],
      isDefault: v.isDefault,
    })),
    media: bp.media || [],
  };
}
