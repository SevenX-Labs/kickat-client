"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search, Heart, User, ShoppingBag } from "lucide-react";
import styles from "./Navbar.module.css";

const taxonomy = {
  Dogs: {
    categoryHref: "/categories/dogs",
    items: [
      { name: "Dog Accessories", href: "/category/dogs/dog-accessories" },
      { name: "Dog Food & Treats", href: "/category/dogs/dog-food-treats" },
      { name: "Dog Grooming & Hygiene", href: "/category/dogs/dog-grooming-hygiene" },
      { name: "Dog Feeding", href: "/category/dogs/dog-feeding" },
    ],
  },
  Cats: {
    categoryHref: "/categories/cats",
    items: [
      { name: "Cat Accessories", href: "/category/cats/cat-accessories" },
      { name: "Cat Food", href: "/category/cats/cat-food" },
      { name: "Cat Grooming & Hygiene", href: "/category/cats/cat-grooming-hygiene" },
      { name: "Cat Feeding", href: "/category/cats/cat-feeding" },
    ],
  },
  Fish: {
    categoryHref: "/categories/fish",
    items: [
      { name: "Aquarium Filtration", href: "/category/fish/aquarium-filtration" },
      { name: "Aquarium Pumps", href: "/category/fish/aquarium-pumps" },
      { name: "Aquarium Heating", href: "/category/fish/aquarium-heating" },
      { name: "Aquarium Lighting", href: "/category/fish/aquarium-lighting" },
      { name: "Aquarium Food", href: "/category/fish/aquarium-food" },
      { name: "Aquarium Care & Medicine", href: "/category/fish/aquarium-care-medicine" },
      { name: "Aquarium Tools", href: "/category/fish/aquarium-tools" },
    ],
  },
  Birds: {
    categoryHref: "/categories/birds",
    items: [
      { name: "Bird Feeding", href: "/category/birds/bird-feeding" },
      { name: "Bird Food", href: "/category/birds/bird-food" },
    ],
  },
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
              width={160}
              height={48}
              priority
              style={{ objectFit: "contain", userSelect: "none", width: "auto", height: "48px" }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </Link>

          <nav className={styles.navLinks}>
            {Object.entries(taxonomy).map(([category, data]) => (
              <div key={category} className={styles.dropdownWrapper}>
                <Link href={data.categoryHref} className={`${styles.navItem} ${styles.dropdownTrigger}`}>
                  {category}
                  <ChevronDown className={styles.chevron} strokeWidth={2} />
                </Link>
                <div className={styles.dropdownMenu}>
                  {data.items.map((sub, idx) => (
                    <Link key={idx} href={sub.href} className={styles.dropdownLink}>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <Link href="/#reviews" className={styles.navItem}>
              Testimonial
            </Link>
            <Link href="/blogs" className={styles.navItem}>
              Blogs
            </Link>
          </nav>
        </div>

        {/* Right Section: Search + Premium Actions */}
        <div className={styles.rightSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={16} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search products..."
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Wishlist" title="Wishlist">
              <Heart size={20} strokeWidth={1.75} />
            </button>

            <button className={styles.iconBtn} aria-label="User Account" title="Account">
              <User size={20} strokeWidth={1.75} />
            </button>

            <button className={styles.cartBtn} aria-label="Shopping Cart" title="Cart">
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span className={styles.badge}>2</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
