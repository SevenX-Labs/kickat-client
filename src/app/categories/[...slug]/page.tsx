import { CategoryExplorer } from '@/components/shop/CategoryExplorer';
import { Metadata } from 'next';
import { MAIN_CATEGORIES } from '@/data/categoryData';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const mainSlug = slug?.[0] || 'dogs';
  const subSlug = slug?.[1];

  const mainCat = MAIN_CATEGORIES.find((c) => c.slug === mainSlug);
  const mainName = mainCat ? mainCat.name : 'Categories';

  if (subSlug && mainCat) {
    const subCat = mainCat.subcategories.find((s) => s.slug === subSlug);
    if (subCat) {
      return {
        title: `${subCat.name} - ${mainName} | KickAt`,
        description: `Shop premium ${subCat.name.toLowerCase()} for ${mainName.toLowerCase()} at KickAt.`,
      };
    }
  }

  return {
    title: `${mainName} Categories | KickAt`,
    description: `Explore premium categories and products for ${mainName.toLowerCase()} at KickAt.`,
  };
}

export default async function CategoriesSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const slugArr = slug || [];
  const initialMainCat = slugArr[0] || 'dogs';
  const initialSubCat = slugArr[1] || 'all';

  return (
    <CategoryExplorer
      initialMainCat={initialMainCat}
      initialSubCat={initialSubCat}
    />
  );
}
