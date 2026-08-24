import { Metadata } from 'next';
import { CategoryExplorer } from '@/components/shop/CategoryExplorer';

export const metadata: Metadata = {
  title: 'Shop All Products | KickAt',
  description: 'Explore the complete KickAt pet catalog across dogs, cats, fish, and birds.',
};

export default function ShopPage() {
  return <CategoryExplorer />;
}
