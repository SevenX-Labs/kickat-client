import { getCategoryData } from '@/data/categoryData';
import { CategoryListing } from '@/components/category/CategoryListing';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryData(slug);
  return {
    title: `${category.name} | KickAt`,
    description: category.subcopy,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryData(slug);

  return <CategoryListing category={category} />;
}
