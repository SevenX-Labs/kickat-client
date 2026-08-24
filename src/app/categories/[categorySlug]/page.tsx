import { Metadata } from 'next';
import { CategoryExplorer } from '@/components/shop/CategoryExplorer';
import { MAIN_CATEGORIES } from '@/data/categoryData';

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = MAIN_CATEGORIES.find(c => c.slug === categorySlug) || MAIN_CATEGORIES[1];
  
  return {
    title: `${category.name} Categories | KickAt`,
    description: `Browse all subcategories and top rated products for ${category.name.toLowerCase()}.`,
  };
}

export default async function CategoryExplorerCategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;
  
  return <CategoryExplorer initialMainCat={categorySlug} />;
}
