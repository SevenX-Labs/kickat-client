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
        description: `Shop premium ${res.category.name.toLowerCase()} essentials and products at KickAt.`,
      };
    }
  } catch {}

  const formattedName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  return {
    title: `${formattedName} Categories | KickAt`,
    description: `Shop premium ${categorySlug} products and essentials at KickAt.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;

  return <CategoryExplorer initialMainCat={categorySlug} />;
}
