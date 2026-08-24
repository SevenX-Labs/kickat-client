import Link from 'next/link';
import styles from './ShopByCategory.module.css';

const categories = [
  {
    name: "Dog Food",
    href: "/category/dog-food-treats",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 0 0 9-9 9.5 9.5 0 0 0-3-7.5 9.5 9.5 0 0 0-12 0A9.5 9.5 0 0 0 3 12a9 9 0 0 0 9 9z" />
        <path d="M15 14v.01" />
        <path d="M9 14v.01" />
        <path d="M12 16c-.5 1-2 1-2 1s-1.5 0-2-1" />
      </svg>
    )
  },
  {
    name: "Cat Food",
    href: "/category/cat-food",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    )
  },
  {
    name: "Dog Gear",
    href: "/category/dog-accessories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  },
  {
    name: "Cat Toys",
    href: "/category/cat-accessories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 8v-4" />
        <path d="M12 20v-4" />
        <path d="M4 12h4" />
        <path d="M16 12h4" />
      </svg>
    )
  },
  {
    name: "Grooming",
    href: "/category/dog-grooming-hygiene",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    )
  },
  {
    name: "Aquarium",
    href: "/category/aquarium-filtration",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20" />
        <path d="M12 2v20" />
        <path d="M5 19s2-1 4-1 4 2 6 2 4-1 4-1" />
      </svg>
    )
  },
  {
    name: "Birds",
    href: "/category/bird-feeding",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12c-2.66 0-5.18-1-7.07-2.93A10 10 0 0 0 2 12" />
        <path d="M22 12a10 10 0 0 1-20 0" />
        <path d="M12 2v10" />
      </svg>
    )
  },
  {
    name: "See More",
    href: "/categories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
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
