import { notFound } from 'next/navigation';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import { ProductDetail } from '@/components/shop/ProductDetail/ProductDetail';

export const metadata = {
  title: 'Product Details | KickAt',
  description: 'View premium product details.',
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // Find product by id from our mock data
  const product = CATALOG_PRODUCTS.find(p => p.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  // To match the design, we need multiple images. We'll duplicate the single image for now.
  const images = [
    product.image,
    product.image,
    product.image,
    product.image
  ];

  return <ProductDetail product={{ ...product, images }} />;
}
