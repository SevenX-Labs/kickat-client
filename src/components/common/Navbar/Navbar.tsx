"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search, Heart, User, ShoppingBag, Package, Tag, CreditCard, MapPin, Bell, LogOut } from "lucide-react";
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
  const items = [
    "Free Delivery on orders over $50",
    "Get 20% off your first purchase",
    "Premium pet accessories",
  ];
  // Duplicate to ensure the marquee fills wide screens
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <header className={styles.header}>
      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            {duplicatedItems.map((text, idx) => (
              <span key={`first-${idx}`} className={styles.marqueeItem}>
                {text}
                <span className={styles.dot}>•</span>
              </span>
            ))}
          </div>
          <div aria-hidden="true" className={styles.marqueeContent}>
            {duplicatedItems.map((text, idx) => (
              <span key={`second-${idx}`} className={styles.marqueeItem}>
                {text}
                <span className={styles.dot}>•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        
        {/* Left Section: Logo + Nav Links */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoWrapper}>
            <Image
              src="/logo-clean.png"
              alt="KickAt Logo"
              width={240}
              height={100}
              priority
              style={{ objectFit: "contain", userSelect: "none", width: "auto", height: "100px" }}
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

            <div className={styles.accountWrapper}>
              <div className={styles.iconBtn} aria-label="User Account" title="Account" style={{ cursor: 'pointer' }}>
                <User size={20} strokeWidth={1.75} />
              </div>
              
              <div className={styles.accountDropdown}>
                <div className={styles.accountDropdownHeader}>
                  Your Account
                </div>
                <div className={styles.accountDropdownList}>
                  <Link href="/profile" className={styles.accountDropdownItem}>
                    <User size={16} strokeWidth={1.5} /> My Profile
                  </Link>
                  <Link href="/orders" className={styles.accountDropdownItem}>
                    <Package size={16} strokeWidth={1.5} /> Orders
                  </Link>
                  <Link href="/coupons" className={styles.accountDropdownItem}>
                    <Tag size={16} strokeWidth={1.5} /> Coupons
                  </Link>
                  <Link href="/wallet" className={styles.accountDropdownItem}>
                    <CreditCard size={16} strokeWidth={1.5} /> Saved Cards & Wallet
                  </Link>
                  <Link href="/addresses" className={styles.accountDropdownItem}>
                    <MapPin size={16} strokeWidth={1.5} /> Saved Addresses
                  </Link>
                  <Link href="/wishlist" className={styles.accountDropdownItem}>
                    <Heart size={16} strokeWidth={1.5} /> Wishlist
                  </Link>
                  <Link href="/notifications" className={styles.accountDropdownItem}>
                    <Bell size={16} strokeWidth={1.5} /> Notifications
                  </Link>
                  <button className={styles.accountDropdownItem} style={{ width: '100%', border: 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                    <LogOut size={16} strokeWidth={1.5} /> Logout
                  </button>
                </div>
              </div>
            </div>

            <Link href="/cart" className={styles.cartBtn} aria-label="Shopping Cart" title="Cart">
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span className={styles.badge}>2</span>
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}
