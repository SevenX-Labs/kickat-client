import { Metadata } from 'next';
import { CategoryExplorer } from '@/components/shop/CategoryExplorer';
import { categoryService } from '@/services/categoryService';

interface PageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  try {
    let res = await categoryService.getCategoryById(categorySlug).catch(async () => {
      if (categorySlug.endsWith('s')) {
        return categoryService.getCategoryById(categorySlug.slice(0, -1)).catch(() => null);
      }
      return null;
    });
    if (res && res.success && res.category) {
      return {
        title: `${res.category.name} Categories | KickAt`,
        description: `Browse all categories and products for ${res.category.name.toLowerCase()}.`,
      };
    }
  } catch {}

  const formattedName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  return {
    title: `${formattedName} Categories | KickAt`,
    description: `Browse all categories and top rated products for ${categorySlug}.`,
  };
}

export default async function CategoryExplorerCategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;
  
  return <CategoryExplorer initialMainCat={categorySlug} />;
}
