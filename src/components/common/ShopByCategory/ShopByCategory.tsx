import Link from 'next/link';
import { Bone, Fish, ShieldCheck, Gamepad2, Scissors, Droplets, Bird, ArrowRight } from 'lucide-react';
import styles from './ShopByCategory.module.css';

const categories = [
  {
    name: "Dog Food",
    count: "48+ items",
    href: "/category/dog-food-treats",
    icon: <Bone strokeWidth={1.5} size={32} />
  },
  {
    name: "Cat Food",
    count: "36+ items",
    href: "/category/cat-food",
    icon: <Fish strokeWidth={1.5} size={32} />
  },
  {
    name: "Dog Gear",
    count: "52+ items",
    href: "/category/dog-accessories",
    icon: <ShieldCheck strokeWidth={1.5} size={32} />
  },
  {
    name: "Cat Toys",
    count: "29+ items",
    href: "/category/cat-accessories",
    icon: <Gamepad2 strokeWidth={1.5} size={32} />
  },
  {
    name: "Grooming",
    count: "42+ items",
    href: "/category/dog-grooming-hygiene",
    icon: <Scissors strokeWidth={1.5} size={32} />
  },
  {
    name: "Aquarium",
    count: "64+ items",
    href: "/category/aquarium-filtration",
    icon: <Droplets strokeWidth={1.5} size={32} />
  },
  {
    name: "Birds",
    count: "22+ items",
    href: "/category/bird-feeding",
    icon: <Bird strokeWidth={1.5} size={32} />
  },
  {
    name: "See All",
    count: "Explore 17+",
    href: "/categories",
    icon: <ArrowRight strokeWidth={1.5} size={32} />,
    isAction: true
  }
];

export function ShopByCategory() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Left-aligned header with eyebrow */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Browse the catalog</span>
          <h2 className={styles.title}>Shop by Category</h2>
        </div>

        <div className={styles.grid}>
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className={`${styles.cardLink} ${cat.isAction ? styles.actionTile : ''}`}
            >
              <div className={`${styles.iconWrapper} ${cat.isAction ? styles.actionIconWrapper : ''}`}>
                {cat.icon}
              </div>
              <div className={styles.labelWrapper}>
                <span className={styles.cardName}>{cat.name}</span>
                <span className={styles.itemCount}>{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
