export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  subcategories: SubCategory[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  mainCategory: string; // e.g. 'dogs', 'cats', 'fish', 'birds'
  subCategory: string;  // e.g. 'dog-food-treats'
  subcategory?: string;
  brand: string;
  badge?: 'Sale' | 'New' | 'Popular' | 'Organic' | 'Best Seller';
  tags: string[];
  sizes?: string[];
  color?: string;
  isTopRated?: boolean;
  inStock?: boolean;
  description?: string;
}

export type Product = CatalogProduct;

export interface CategoryInfo {
  categorySlug: string;
  subcategorySlug?: string;
  mainCategoryName: string;
  subcategoryName?: string;
  name: string;
  subcopy: string;
  totalProducts: number;
  subcategories: { name: string; slug: string; count: number }[];
  brands: { name: string; count: number }[];
  bestsellers: CatalogProduct[];
  products: CatalogProduct[];
}

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: 'all',
    name: 'All Categories',
    slug: 'all',
    count: 174,
    subcategories: [],
  },
  {
    id: 'dogs',
    name: 'Dogs',
    slug: 'dogs',
    count: 58,
    subcategories: [
      { id: 'dog-accessories', name: 'Dog Accessories', slug: 'dog-accessories', count: 18 },
      { id: 'dog-food-treats', name: 'Dog Food & Treats', slug: 'dog-food-treats', count: 24 },
      { id: 'dog-grooming-hygiene', name: 'Dog Grooming & Hygiene', slug: 'dog-grooming-hygiene', count: 10 },
      { id: 'dog-feeding', name: 'Dog Feeding', slug: 'dog-feeding', count: 6 },
    ],
  },
  {
    id: 'cats',
    name: 'Cats',
    slug: 'cats',
    count: 42,
    subcategories: [
      { id: 'cat-accessories', name: 'Cat Accessories', slug: 'cat-accessories', count: 14 },
      { id: 'cat-food', name: 'Cat Food', slug: 'cat-food', count: 18 },
      { id: 'cat-grooming-hygiene', name: 'Cat Grooming & Hygiene', slug: 'cat-grooming-hygiene', count: 6 },
      { id: 'cat-feeding', name: 'Cat Feeding', slug: 'cat-feeding', count: 4 },
    ],
  },
  {
    id: 'fish',
    name: 'Fish',
    slug: 'fish',
    count: 52,
    subcategories: [
      { id: 'aquarium-filtration', name: 'Aquarium Filtration', slug: 'aquarium-filtration', count: 10 },
      { id: 'aquarium-pumps', name: 'Aquarium Pumps', slug: 'aquarium-pumps', count: 8 },
      { id: 'aquarium-heating', name: 'Aquarium Heating', slug: 'aquarium-heating', count: 6 },
      { id: 'aquarium-lighting', name: 'Aquarium Lighting', slug: 'aquarium-lighting', count: 6 },
      { id: 'aquarium-food', name: 'Aquarium Food', slug: 'aquarium-food', count: 12 },
      { id: 'aquarium-care-medicine', name: 'Aquarium Care & Medicine', slug: 'aquarium-care-medicine', count: 6 },
      { id: 'aquarium-tools', name: 'Aquarium Tools', slug: 'aquarium-tools', count: 4 },
    ],
  },
  {
    id: 'birds',
    name: 'Birds',
    slug: 'birds',
    count: 22,
    subcategories: [
      { id: 'bird-feeding', name: 'Bird Feeding', slug: 'bird-feeding', count: 12 },
      { id: 'bird-food', name: 'Bird Food', slug: 'bird-food', count: 10 },
    ],
  },
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // Dogs
  {
    id: 'd-1',
    name: 'Premium Canine Organic Nourish Dry Kibble',
    price: 1299,
    originalPrice: 1599,
    rating: 5,
    reviewsCount: 142,
    image: '/hero-products/dog_food.png',
    mainCategory: 'dogs',
    subCategory: 'dog-food-treats',
    brand: 'NutriDog',
    badge: 'Best Seller',
    tags: ['Organic', 'High Protein', 'Grain Free'],
    sizes: ['1kg', '3kg', '5kg'],
    color: '#FD802E',
    isTopRated: true,
    description: 'Grain-free organic kibble for a healthier, happier pup.',
  },
  {
    id: 'd-2',
    name: 'Maison Petit Heavyweight Ceramic Dog Bowl',
    price: 1499,
    originalPrice: 1799,
    rating: 5,
    reviewsCount: 89,
    image: '/hero-products/pet_bowl.png',
    mainCategory: 'dogs',
    subCategory: 'dog-feeding',
    brand: 'Maison Petit',
    badge: 'New',
    tags: ['Ceramic', 'Non-Slip', 'Dishwasher Safe'],
    sizes: ['M', 'L'],
    color: '#333F2B',
    isTopRated: true,
  },
  {
    id: 'd-3',
    name: 'Mim & Mate Natural Rubber Chew Toy',
    price: 899,
    rating: 4,
    reviewsCount: 64,
    image: '/hero-products/pet_toy.png',
    mainCategory: 'dogs',
    subCategory: 'dog-accessories',
    brand: 'Mim & Mate',
    badge: 'Sale',
    tags: ['Durable', 'Teething', 'Eco Friendly'],
    sizes: ['S', 'M', 'L'],
    color: '#FD802E',
  },
  {
    id: 'd-4',
    name: 'KickAt Soft Padded Reflective Harness & Leash',
    price: 1199,
    originalPrice: 1499,
    rating: 5,
    reviewsCount: 112,
    image: '/category-images/accessories.png',
    mainCategory: 'dogs',
    subCategory: 'dog-accessories',
    brand: 'KickAt',
    badge: 'Popular',
    tags: ['Reflective', 'Padded', 'Adjustable'],
    sizes: ['S', 'M', 'L', 'XL'],
    color: '#211C15',
  },
  {
    id: 'd-5',
    name: 'De-Shedding Conditioning Dog Shampoo 500ml',
    price: 649,
    rating: 4,
    reviewsCount: 48,
    image: '/category-images/food.png',
    mainCategory: 'dogs',
    subCategory: 'dog-grooming-hygiene',
    brand: 'PurePaw',
    tags: ['Aloe Vera', 'Hypoallergenic'],
    sizes: ['250ml', '500ml'],
  },

  // Cats
  {
    id: 'c-1',
    name: 'KittyHaus Wild Salmon & Tuna Crunch Treats',
    price: 499,
    originalPrice: 649,
    rating: 5,
    reviewsCount: 198,
    image: '/hero-products/cat_treats.png',
    mainCategory: 'cats',
    subCategory: 'cat-food',
    brand: 'KittyHaus',
    badge: 'Popular',
    tags: ['Salmon', 'Grain Free', 'Crunchy'],
    color: '#FD802E',
    isTopRated: true,
  },
  {
    id: 'c-2',
    name: 'Interactive Spinning Feather Cat Toy',
    price: 699,
    rating: 4,
    reviewsCount: 76,
    image: '/category-images/toys.png',
    mainCategory: 'cats',
    subCategory: 'cat-accessories',
    brand: 'Mim & Mate',
    badge: 'New',
    tags: ['Feather', 'Interactive', 'USB Rechargeable'],
    color: '#333F2B',
  },
  {
    id: 'c-3',
    name: 'Tofu Natural Clumping Cat Litter 6L',
    price: 799,
    originalPrice: 999,
    rating: 5,
    reviewsCount: 154,
    image: '/category-images/fish.png',
    mainCategory: 'cats',
    subCategory: 'cat-grooming-hygiene',
    brand: 'KickAt',
    badge: 'Organic',
    tags: ['Dust Free', 'Flushable', 'Odor Control'],
    sizes: ['6L', '12L'],
  },
  {
    id: 'c-4',
    name: 'Whiskers Ceramic Shallow Whisker-Friendly Dish',
    price: 899,
    rating: 4,
    reviewsCount: 52,
    image: '/hero-products/pet_bowl.png',
    mainCategory: 'cats',
    subCategory: 'cat-feeding',
    brand: 'Maison Petit',
    tags: ['Ceramic', 'Whisker Safe'],
    sizes: ['S'],
  },

  // Fish
  {
    id: 'f-1',
    name: 'AquaPure Ultra-Quiet External Canister Filter 800L/h',
    price: 2499,
    originalPrice: 2999,
    rating: 5,
    reviewsCount: 88,
    image: '/category-images/fish.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-filtration',
    brand: 'AquaPure',
    badge: 'Popular',
    tags: ['Filtration', 'Quiet', 'Multistage'],
    isTopRated: true,
  },
  {
    id: 'f-2',
    name: 'AquaPump Silent Submersible Water Circulation Pump',
    price: 1299,
    originalPrice: 1599,
    rating: 5,
    reviewsCount: 74,
    image: '/category-images/fish.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-pumps',
    brand: 'AquaPure',
    badge: 'New',
    tags: ['Submersible', 'Quiet'],
  },
  {
    id: 'f-3',
    name: 'Precision Digital Thermostat Submersible Heater 200W',
    price: 1499,
    rating: 4,
    reviewsCount: 62,
    image: '/category-images/accessories.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-heating',
    brand: 'AquaPure',
    tags: ['Thermostat', 'Submersible'],
  },
  {
    id: 'f-4',
    name: 'Full Spectrum Planted LED Aquarium Light Bar 45cm',
    price: 1899,
    originalPrice: 2299,
    rating: 5,
    reviewsCount: 64,
    image: '/category-images/accessories.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-lighting',
    brand: 'AquaPure',
    tags: ['LED', 'Timer Included', 'Waterproof'],
  },
  {
    id: 'f-5',
    name: 'Tropical Flakes Color Enhancing Fish Diet 250g',
    price: 449,
    rating: 4,
    reviewsCount: 110,
    image: '/category-images/food.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-food',
    brand: 'AquaPure',
    badge: 'Sale',
    tags: ['Color Enhancing', 'Probiotic'],
    sizes: ['100g', '250g', '500g'],
  },
  {
    id: 'f-6',
    name: 'Bio-Conditioner Water Dechlorinator & Stress Coat 500ml',
    price: 699,
    rating: 5,
    reviewsCount: 92,
    image: '/category-images/food.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-care-medicine',
    brand: 'AquaPure',
    tags: ['Dechlorinator', 'Water Care'],
  },
  {
    id: 'f-7',
    name: 'Stainless Steel Aquascaping Tweezer & Scraper Set',
    price: 899,
    rating: 4,
    reviewsCount: 45,
    image: '/hero-products/pet_toy.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-tools',
    brand: 'AquaPure',
    tags: ['Stainless Steel', 'Tools'],
  },
  {
    id: 'f-8',
    name: 'HydroClean Magnetic Glass Cleaner Brush',
    price: 599,
    originalPrice: 799,
    rating: 5,
    reviewsCount: 88,
    image: '/category-images/accessories.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-tools',
    brand: 'AquaPure',
    badge: 'Popular',
    tags: ['Magnetic', 'Cleaner'],
  },
  {
    id: 'f-9',
    name: 'AquaWave Wavemaker Submersible Flow Pump 15W',
    price: 1599,
    originalPrice: 1999,
    rating: 5,
    reviewsCount: 114,
    image: '/category-images/fish.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-pumps',
    brand: 'AquaPure',
    badge: 'New',
    tags: ['Wavemaker', 'Flow Pump'],
  },
  {
    id: 'f-10',
    name: 'BioFoam Dual Sponge Aquarium Air Filter 200L',
    price: 499,
    originalPrice: 699,
    rating: 4,
    reviewsCount: 96,
    image: '/category-images/accessories.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-filtration',
    brand: 'AquaPure',
    badge: 'Sale',
    tags: ['BioFoam', 'Sponge Filter'],
  },
  {
    id: 'f-11',
    name: 'EcoPlant High Lumen LED Aquarium Light Bar 60cm',
    price: 2199,
    originalPrice: 2699,
    rating: 5,
    reviewsCount: 142,
    image: '/category-images/accessories.png',
    mainCategory: 'fish',
    subCategory: 'aquarium-lighting',
    brand: 'AquaPure',
    badge: 'Best Seller',
    tags: ['EcoPlant', 'LED Light'],
  },

  // Birds
  {
    id: 'b-1',
    name: 'WildWing Stainless Steel Hanging Feeder & Waterer',
    price: 1299,
    originalPrice: 1499,
    rating: 5,
    reviewsCount: 56,
    image: '/hero-products/pet_bowl.png',
    mainCategory: 'birds',
    subCategory: 'bird-feeding',
    brand: 'WildWing',
    badge: 'Sale',
    tags: ['Stainless Steel', 'Rust Proof'],
    isTopRated: true,
  },
  {
    id: 'b-2',
    name: 'AvianBlend Organic Seed & Nut Mix 1kg',
    price: 799,
    originalPrice: 999,
    rating: 5,
    reviewsCount: 128,
    image: '/category-images/bird.png',
    mainCategory: 'birds',
    subCategory: 'bird-food',
    brand: 'AvianBlend',
    badge: 'Popular',
    tags: ['Organic', 'Seeds & Nuts', 'Fortified'],
    sizes: ['1kg', '2.5kg'],
  },
];

export function getCategoryData(categorySlug: string, subcategorySlug?: string): CategoryInfo {
  const normCat = (categorySlug || 'dogs').toLowerCase();
  const normSub = subcategorySlug?.toLowerCase();

  // Find main category
  let mainCat = MAIN_CATEGORIES.find((c) => c.slug === normCat);

  // Fallback: If categorySlug was a subcategory slug directly (e.g. 'dog-food-treats')
  if (!mainCat) {
    mainCat = MAIN_CATEGORIES.find((c) =>
      c.subcategories.some((s) => s.slug === normCat)
    ) || MAIN_CATEGORIES[1];
  }

  // Find active subcategory object
  const activeSubObj = mainCat.subcategories.find(
    (s) => s.slug === normSub || s.slug === normCat
  );

  // Filter products
  const matchingProducts = CATALOG_PRODUCTS.filter((p) => {
    if (p.mainCategory !== mainCat!.slug) return false;
    if (activeSubObj && p.subCategory !== activeSubObj.slug) return false;
    return true;
  });

  // Ensure enough products for a rich list display (10 products)
  const categoryFallback = CATALOG_PRODUCTS.filter((p) => p.mainCategory === mainCat!.slug);
  const displayProducts = [...matchingProducts];
  categoryFallback.forEach((p) => {
    if (displayProducts.length < 10 && !displayProducts.some((existing) => existing.id === p.id)) {
      displayProducts.push(p);
    }
  });
  if (displayProducts.length < 10) {
    CATALOG_PRODUCTS.forEach((p) => {
      if (displayProducts.length < 10 && !displayProducts.some((existing) => existing.id === p.id)) {
        displayProducts.push(p);
      }
    });
  }

  const bestsellers = CATALOG_PRODUCTS.filter(
    (p) => p.mainCategory === mainCat!.slug && p.isTopRated
  ).slice(0, 3);

  return {
    categorySlug: mainCat.slug,
    subcategorySlug: activeSubObj ? activeSubObj.slug : undefined,
    mainCategoryName: mainCat.name,
    subcategoryName: activeSubObj ? activeSubObj.name : undefined,
    name: activeSubObj ? activeSubObj.name : mainCat.name,
    subcopy: activeSubObj
      ? `Discover premium ${activeSubObj.name.toLowerCase()} curated for ${mainCat.name.toLowerCase()}.`
      : `Nutritious feeds, spacious accessories, toys, and grooming essentials for ${mainCat.name.toLowerCase()}.`,
    totalProducts: matchingProducts.length,
    subcategories: mainCat.subcategories.map((s) => ({
      name: s.name,
      slug: s.slug,
      count: s.count,
    })),
    brands: [
      { name: 'NutriDog', count: 12 },
      { name: 'PurePaw', count: 10 },
      { name: 'KickAt', count: 8 },
      { name: 'Maison Petit', count: 6 },
    ],
    bestsellers: bestsellers.length > 0 ? bestsellers : CATALOG_PRODUCTS.slice(0, 3),
    products: displayProducts.length > 0 ? displayProducts : CATALOG_PRODUCTS,
  };
}
