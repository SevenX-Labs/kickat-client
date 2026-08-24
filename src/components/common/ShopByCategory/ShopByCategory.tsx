import Link from 'next/link';
import { Bone, Fish, ShieldCheck, Gamepad2, Scissors, Droplets, Bird, LayoutGrid } from 'lucide-react';
import styles from './ShopByCategory.module.css';

const categories = [
  {
    name: "Dog Food",
    href: "/category/dog-food-treats",
    icon: <Bone strokeWidth={1.5} size={40} />
  },
  {
    name: "Cat Food",
    href: "/category/cat-food",
    icon: <Fish strokeWidth={1.5} size={40} />
  },
  {
    name: "Dog Gear",
    href: "/category/dog-accessories",
    icon: <ShieldCheck strokeWidth={1.5} size={40} />
  },
  {
    name: "Cat Toys",
    href: "/category/cat-accessories",
    icon: <Gamepad2 strokeWidth={1.5} size={40} />
  },
  {
    name: "Grooming",
    href: "/category/dog-grooming-hygiene",
    icon: <Scissors strokeWidth={1.5} size={40} />
  },
  {
    name: "Aquarium",
    href: "/category/aquarium-filtration",
    icon: <Droplets strokeWidth={1.5} size={40} />
  },
  {
    name: "Birds",
    href: "/category/bird-feeding",
    icon: <Bird strokeWidth={1.5} size={40} />
  },
  {
    name: "See More",
    href: "/categories",
    icon: <LayoutGrid strokeWidth={1.5} size={40} />
  }
];

export function ShopByCategory() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Shop by Category</h2>
        </div>

        <div className={styles.grid}>
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href} className={styles.cardLink}>
              <div className={styles.iconWrapper}>
                {cat.icon}
              </div>
              <span className={styles.cardName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
