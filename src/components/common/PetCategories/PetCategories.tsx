import Link from 'next/link';
import Image from 'next/image';
import styles from './PetCategories.module.css';

const categories = [
  { name: 'DOG', image: '/category-images/dog.png', link: '/shop/dogs', cta: 'Shop Dog' },
  { name: 'CAT', image: '/category-images/cat.png', link: '/shop/cats', cta: 'Shop Cat' },
  { name: 'FISH', image: '/category-images/fish.png', link: '/shop/fish', cta: 'Shop Fish' },
  { name: 'BIRD', image: '/category-images/bird.png', link: '/shop/birds', cta: 'Shop Bird' },
];

export function PetCategories() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Shop by Pet</h2>
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
              <div className={styles.contentWrapper}>
                <h3 className={styles.name}>{category.name}</h3>
                <span className={styles.action}>{category.cta} &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
