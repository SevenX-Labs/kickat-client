import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import styles from './categories.module.css';

export const metadata: Metadata = {
  title: 'All Categories | KickAt',
  description: 'Explore KickAt’s full catalog of pet nutrition, toys, grooming, aquarium, and avian care.',
};

const allCategories = [
  { name: 'Birds & Avian Care', slug: 'birds', count: '142 products', image: '/category-images/bird.png' },
  { name: 'Dog Food & Treats', slug: 'dog-food-treats', count: '185 products', image: '/category-images/food.png' },
  { name: 'Cat Food & Nutrition', slug: 'cat-food', count: '140 products', image: '/category-images/fish.png' },
  { name: 'Dog Gear & Accessories', slug: 'dog-accessories', count: '210 products', image: '/category-images/accessories.png' },
  { name: 'Cat Toys & Perches', slug: 'cat-accessories', count: '115 products', image: '/category-images/toys.png' },
  { name: 'Dog Grooming & Hygiene', slug: 'dog-grooming-hygiene', count: '98 products', image: '/category-images/food.png' },
  { name: 'Aquarium Filtration & Care', slug: 'aquarium-filtration', count: '164 products', image: '/category-images/fish.png' },
];

export default function CategoriesPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>THE COMPLETE CATALOG</span>
          <h1 className={styles.title}>All Product Categories</h1>
          <p className={styles.subcopy}>
            Curated nutrition, daily essentials, and vet-approved wellness for every companion.
          </p>
        </div>

        <div className={styles.grid}>
          {allCategories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'contain' }} />
              </div>
              <div className={styles.info}>
                <span className={styles.count}>{cat.count}</span>
                <h3 className={styles.name}>{cat.name}</h3>
                <span className={styles.action}>Explore Catalog <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
