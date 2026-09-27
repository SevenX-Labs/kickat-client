import { Metadata } from 'next';
import { CategoryListing } from '@/components/category/CategoryListing';
import { categoryService } from '@/services/categoryService';

interface PageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  try {
    let res = await categoryService.getCategoryById(subcategorySlug).catch(() => null);
    if (res && res.success && res.category) {
      return {
        title: `${res.category.name} | KickAt`,
        description: `Shop premium ${res.category.name.toLowerCase()} products at KickAt.`,
      };
    }
  } catch {}

  const formattedSub = subcategorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedCat = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  return {
    title: `${formattedSub} - ${formattedCat} | KickAt`,
    description: `Shop ${formattedSub} for ${formattedCat} at KickAt.`,
  };
}

export default async function SubCategoryExplorerPage({ params }: PageProps) {
  const { categorySlug, subcategorySlug } = await params;

  return <CategoryListing categorySlug={categorySlug} subcategorySlug={subcategorySlug} />;
}
