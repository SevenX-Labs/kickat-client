import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import styles from "./Navbar.module.css";

const taxonomy = {
  Dogs: [
    { name: "Dog Accessories", href: "/category/dog-accessories" },
    { name: "Dog Food & Treats", href: "/category/dog-food-treats" },
    { name: "Dog Grooming & Hygiene", href: "/category/dog-grooming-hygiene" },
    { name: "Dog Feeding", href: "/category/dog-feeding" },
  ],
  Cats: [
    { name: "Cat Accessories", href: "/category/cat-accessories" },
    { name: "Cat Food", href: "/category/cat-food" },
    { name: "Cat Grooming & Hygiene", href: "/category/cat-grooming-hygiene" },
    { name: "Cat Feeding", href: "/category/cat-feeding" },
  ],
  Fish: [
    { name: "Aquarium Filtration", href: "/category/aquarium-filtration" },
    { name: "Aquarium Pumps", href: "/category/aquarium-pumps" },
    { name: "Aquarium Heating", href: "/category/aquarium-heating" },
    { name: "Aquarium Lighting", href: "/category/aquarium-lighting" },
    { name: "Aquarium Food", href: "/category/aquarium-food" },
    { name: "Aquarium Care & Medicine", href: "/category/aquarium-care-medicine" },
    { name: "Aquarium Tools", href: "/category/aquarium-tools" },
  ],
  Birds: [
    { name: "Bird Feeding", href: "/category/bird-feeding" },
    { name: "Bird Food", href: "/category/bird-food" },
  ],
};

export function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* Left Section: Logo + Nav Links */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoWrapper}>
            <Image
              src="/logo.png"
              alt="KickAt Logo"
              width={120}
              height={36}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          <nav className={styles.navLinks}>
            {Object.entries(taxonomy).map(([category, subcategories]) => (
              <div key={category} className={styles.dropdownWrapper}>
                <button className={`${styles.navItem} ${styles.dropdownTrigger}`}>
                  {category}
                  <ChevronDown className={styles.chevron} strokeWidth={2} />
                </button>
                <div className={styles.dropdownMenu}>
                  {subcategories.map((sub, idx) => (
                    <Link key={idx} href={sub.href} className={styles.dropdownLink}>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <Link href="#reviews" className={styles.navItem}>
              Testimonial
            </Link>
            <Link href="/blogs" className={styles.navItem}>
              Blogs
            </Link>
          </nav>
        </div>

        {/* Right Section: Search + Actions */}
        <div className={styles.rightSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <svg
                className={styles.searchIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                aria-label="Search"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Wishlist">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button className={styles.iconBtn} aria-label="Account">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <button className={styles.iconBtn} aria-label="Cart">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className={styles.badge}>2</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
