import { getCategoryData } from '@/data/categoryData';
import { CategoryListing } from '@/components/category/CategoryListing';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategoryData(categorySlug);
  return {
    title: `${category.name} | KickAt`,
    description: category.subcopy,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = getCategoryData(categorySlug);

  return <CategoryListing category={category} />;
}
