import Link from 'next/link';
import Image from 'next/image';
import styles from './ShopByCategory.module.css';

const categories = [
  { name: 'Food', image: '/category-images/food.png', link: '/shop/food' },
  { name: 'Treats', image: '/category-images/treats.png', link: '/shop/treats' },
  { name: 'Toys', image: '/category-images/toys.png', link: '/shop/toys' },
  { name: 'Accessories', image: '/category-images/accessories.png', link: '/shop/accessories' },
];

export function ShopByCategory() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Shop by Category</h2>
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link href={category.link} key={category.name} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={category.image}
                  alt={`${category.name} category`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.image}
                />
              </div>
              <h3 className={styles.name}>{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
