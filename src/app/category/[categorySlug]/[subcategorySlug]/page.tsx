import { getCategoryData } from '@/data/categoryData';
import { CategoryListing } from '@/components/category/CategoryListing';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const category = getCategoryData(categorySlug, subcategorySlug);

  return {
    title: `${category.name} - ${category.mainCategoryName} | KickAt`,
    description: category.subcopy,
  };
}

export default async function SubCategoryProductPage({ params }: PageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const category = getCategoryData(categorySlug, subcategorySlug);

  return <CategoryListing category={category} />;
}
