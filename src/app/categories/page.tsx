import { Metadata } from 'next';
import { CategoryExplorer } from '@/components/shop/CategoryExplorer';

export const metadata: Metadata = {
  title: 'Categories & Shop | KickAt',
  description: 'Browse all pet categories, subcategories, top rated products, and filter by size, tags, or colors.',
};

export default function CategoriesPage() {
  return <CategoryExplorer />;
}
