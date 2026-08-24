export interface CategoryInfo {
  slug: string;
  name: string;
  subcopy: string;
  totalProducts: number;
  subcategories: { name: string; count: number }[];
  brands: { name: string; count: number }[];
  bestsellers: Product[];
  products: Product[];
  banner: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
  promo: {
    title: string;
    subtitle: string;
    code: string;
    image: string;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: 'Sale' | 'New' | 'Popular' | 'Organic';
  subcategory: string;
  brand: string;
  inStock: boolean;
}

export const CATEGORY_DATA: Record<string, CategoryInfo> = {
  birds: {
    slug: 'birds',
    name: 'Birds & Avian Care',
    subcopy: 'Nutritious feeds, spacious cages, interactive toys, and grooming essentials for feathered companions.',
    totalProducts: 142,
    subcategories: [
      { name: 'Bird Food & Feeds', count: 48 },
      { name: 'Cages & Stands', count: 32 },
      { name: 'Toys & Perches', count: 28 },
      { name: 'Grooming & Health', count: 18 },
      { name: 'Feeder Accessories', count: 16 },
    ],
    brands: [
      { name: 'AvianBlend', count: 42 },
      { name: 'FeatherCare', count: 35 },
      { name: 'NutriBird', count: 28 },
      { name: 'WildWing', count: 21 },
      { name: 'PetHaven', count: 16 },
    ],
    bestsellers: [
      {
        id: 'b-1',
        name: 'AvianBlend Organic Seed & Nut Mix',
        price: 799,
        originalPrice: 999,
        rating: 4.9,
        reviewsCount: 128,
        image: '/hero-products/dog_food.png',
        badge: 'Popular',
        subcategory: 'Bird Food & Feeds',
        brand: 'AvianBlend',
        inStock: true,
      },
      {
        id: 'b-2',
        name: 'FeatherCare Natural Wooden Perch Set',
        price: 499,
        rating: 4.8,
        reviewsCount: 84,
        image: '/hero-products/pet_toy.png',
        badge: 'New',
        subcategory: 'Toys & Perches',
        brand: 'FeatherCare',
        inStock: true,
      },
      {
        id: 'b-3',
        name: 'NutriBird Essential Multivitamin Drops',
        price: 649,
        originalPrice: 799,
        rating: 5.0,
        reviewsCount: 96,
        image: '/hero-products/cat_treats.png',
        badge: 'Sale',
        subcategory: 'Grooming & Health',
        brand: 'NutriBird',
        inStock: true,
      },
    ],
    banner: {
      title: 'Enrich Your Feathered Companion’s World',
      subtitle: 'Hand-picked perches, natural wood toys, and vet-approved diets designed for vibrant avian health.',
      cta: 'Explore Avian Nutrition',
      image: '/hero-products/pet_toy.png',
    },
    promo: {
      title: 'Up to 40% Off Bird Toys',
      subtitle: 'For a limited time on all natural wood and bell perches.',
      code: 'FEATHER40',
      image: '/hero-products/pet_toy.png',
    },
    products: [
      {
        id: 'p-1',
        name: 'AvianBlend Gourmet Parrot Feast',
        price: 899,
        originalPrice: 1099,
        rating: 4.9,
        reviewsCount: 142,
        image: '/hero-products/dog_food.png',
        badge: 'Sale',
        subcategory: 'Bird Food & Feeds',
        brand: 'AvianBlend',
        inStock: true,
      },
      {
        id: 'p-2',
        name: 'WildWing Stainless Steel Hanging Feeder',
        price: 1299,
        rating: 4.7,
        reviewsCount: 56,
        image: '/hero-products/pet_bowl.png',
        badge: 'New',
        subcategory: 'Feeder Accessories',
        brand: 'WildWing',
        inStock: true,
      },
      {
        id: 'p-3',
        name: 'FeatherCare Shredder Foraging Ball',
        price: 349,
        rating: 4.8,
        reviewsCount: 92,
        image: '/hero-products/pet_toy.png',
        subcategory: 'Toys & Perches',
        brand: 'FeatherCare',
        inStock: true,
      },
      {
        id: 'p-4',
        name: 'NutriBird Calcium & Mineral Block',
        price: 299,
        originalPrice: 399,
        rating: 4.9,
        reviewsCount: 210,
        image: '/hero-products/cat_treats.png',
        badge: 'Organic',
        subcategory: 'Grooming & Health',
        brand: 'NutriBird',
        inStock: true,
      },
      {
        id: 'p-5',
        name: 'PetHaven Spacious Flight Cage with Trays',
        price: 4999,
        originalPrice: 5999,
        rating: 4.9,
        reviewsCount: 38,
        image: '/hero-products/pet_bowl.png',
        badge: 'Popular',
        subcategory: 'Cages & Stands',
        brand: 'PetHaven',
        inStock: true,
      },
      {
        id: 'p-6',
        name: 'AvianBlend Canary & Finch Seed Blend',
        price: 549,
        rating: 4.8,
        reviewsCount: 74,
        image: '/hero-products/dog_food.png',
        subcategory: 'Bird Food & Feeds',
        brand: 'AvianBlend',
        inStock: true,
      },
      {
        id: 'p-7',
        name: 'FeatherCare Ladder & Rope Bridge',
        price: 599,
        originalPrice: 749,
        rating: 4.6,
        reviewsCount: 45,
        image: '/hero-products/pet_toy.png',
        badge: 'Sale',
        subcategory: 'Toys & Perches',
        brand: 'FeatherCare',
        inStock: true,
      },
      {
        id: 'p-8',
        name: 'NutriBird Feather Shine Conditioning Spray',
        price: 799,
        rating: 4.9,
        reviewsCount: 88,
        image: '/hero-products/cat_treats.png',
        subcategory: 'Grooming & Health',
        brand: 'NutriBird',
        inStock: true,
      },
    ],
  },
};

// Fallback generator for unconfigured category slugs
export function getCategoryData(slug: string): CategoryInfo {
  const normalized = slug.toLowerCase();

  if (CATEGORY_DATA[normalized]) {
    return CATEGORY_DATA[normalized];
  }

  const formattedName = normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    slug: normalized,
    name: formattedName,
    subcopy: `Discover premium, vet-approved products, nutrition, and everyday essentials curated for ${formattedName.toLowerCase()}.`,
    totalProducts: 142,
    subcategories: [
      { name: `${formattedName} Nutrition`, count: 54 },
      { name: `${formattedName} Accessories`, count: 42 },
      { name: `${formattedName} Care & Grooming`, count: 28 },
      { name: `${formattedName} Toys`, count: 18 },
    ],
    brands: [
      { name: 'KickAt Select', count: 45 },
      { name: 'PurePaw Nutrition', count: 38 },
      { name: 'Naturals Co.', count: 32 },
      { name: 'VetFormu', count: 27 },
    ],
    bestsellers: CATEGORY_DATA['birds'].bestsellers,
    banner: {
      title: `Crafted for ${formattedName} Wellness`,
      subtitle: 'Nutritional precision and premium craftsmanship for every stage of life.',
      cta: 'Explore Full Collection',
      image: '/hero-products/dog_food.png',
    },
    promo: {
      title: `Special ${formattedName} Offer`,
      subtitle: 'Save up to 30% on curated bundles and subscription boxes.',
      code: 'KICKAT30',
      image: '/hero-products/cat_treats.png',
    },
    products: CATEGORY_DATA['birds'].products,
  };
}
