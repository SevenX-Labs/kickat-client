import { Suspense } from 'react';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import { ProductDetail } from '@/components/shop/ProductDetail/ProductDetail';
import { ProductDetailSkeleton } from '@/components/shop/ProductDetail/ProductDetailSkeleton';

export const metadata = {
  title: 'KickAt | Product Details',
  description: 'Premium pet products for your best friend.',
};

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = CATALOG_PRODUCTS.find(p => p.id === resolvedParams.id) || CATALOG_PRODUCTS[0];

  const images = [
    product.image || '/hero-products/dog_food.png',
    '/hero-products/pet_bowl.png',
    '/hero-products/pet_toy.png',
    '/hero-products/dog_food.png',
  ];

  return <ProductDetail product={{ ...product, images }} />;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

