import { CATALOG_PRODUCTS } from '@/data/categoryData';
import { ProductDetail } from '@/components/shop/ProductDetail/ProductDetail';

export const metadata = {
  title: 'Mim & Mate Natural Rubber Chew Toy | KickAt',
  description: 'Durable. Safe. Fun. Made for endless play.',
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
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
