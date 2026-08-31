"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Heart, User, ShoppingBag, Package, Tag, CreditCard, MapPin, Bell, LogOut, Star, Truck, Percent, Crown } from "lucide-react";
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
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  const handleAccountClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    router.push('/');
  };

  const items = [
    { text: "Free Delivery on orders over $50", Icon: Truck },
    { text: "Available on Amazon, Flipkart & Blinkit", Icon: ShoppingBag },
    { text: "Get 20% off your first purchase", Icon: Percent },
    { text: "Premium pet accessories", Icon: Crown },
  ];
  // Duplicate to ensure the marquee fills wide screens
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <header className={styles.header}>
      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            {duplicatedItems.map((item, idx) => (
              <span key={`first-${idx}`} className={styles.marqueeItem}>
                <span className={styles.itemContent}>
                  <item.Icon className={styles.itemIcon} size={15} strokeWidth={2} />
                  {item.text}
                </span>
                <Star className={styles.separatorIcon} size={14} strokeWidth={1.5} />
              </span>
            ))}
          </div>
          <div aria-hidden="true" className={styles.marqueeContent}>
            {duplicatedItems.map((item, idx) => (
              <span key={`second-${idx}`} className={styles.marqueeItem}>
                <span className={styles.itemContent}>
                  <item.Icon className={styles.itemIcon} size={15} strokeWidth={2} />
                  {item.text}
                </span>
                <Star className={styles.separatorIcon} size={14} strokeWidth={1.5} />
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
            
            <Link href="/testimonials" className={styles.navItem}>
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
              <div 
                className={styles.iconBtn} 
                aria-label="User Account"
                style={{ cursor: 'pointer' }}
                onClick={handleAccountClick}
              >
                <User size={20} strokeWidth={1.75} />
              </div>

              <div className={styles.accountDropdown}>
                {isLoggedIn ? (
                  <>
                    <div className={styles.accountDropdownHeader}>
                      <span className={styles.greetingTitle}>Welcome Back!</span>
                      <span className={styles.greetingSub}>Manage your account & orders</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.accountDropdownList}>
                      <Link href="/account?tab=profile" className={styles.accountDropdownItem}>
                        <User size={18} strokeWidth={1.5} /> My Profile
                      </Link>
                      <Link href="/account?tab=orders" className={styles.accountDropdownItem}>
                        <Package size={18} strokeWidth={1.5} /> Orders & Tracking
                      </Link>
                      <Link href="/account?tab=addresses" className={styles.accountDropdownItem}>
                        <MapPin size={18} strokeWidth={1.5} /> Saved Addresses
                      </Link>
                      <Link href="/account?tab=wishlist" className={styles.accountDropdownItem}>
                        <Heart size={18} strokeWidth={1.5} /> Wishlist
                      </Link>
                      <Link href="/notifications" className={styles.accountDropdownItem}>
                        <Bell size={18} strokeWidth={1.5} /> Notifications
                      </Link>
                      <div className={styles.divider} />
                      <button className={`${styles.accountDropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                        <LogOut size={18} strokeWidth={1.5} /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.accountDropdownHeader}>
                      <span className={styles.greetingTitle}>Welcome to KickAt</span>
                      <span className={styles.greetingSub}>Access account & track orders</span>
                    </div>
                    <div className={styles.authBox}>
                      <Link href="/login" className={styles.signInBtn}>
                        Sign In / Register
                      </Link>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.accountDropdownList}>
                      <Link href="/orders" className={styles.accountDropdownItem}>
                        <Package size={18} strokeWidth={1.5} /> Track Orders
                      </Link>
                      <Link href="/wishlist" className={styles.accountDropdownItem}>
                        <Heart size={18} strokeWidth={1.5} /> Wishlist
                      </Link>
                      <Link href="/contact" className={styles.accountDropdownItem}>
                        <Tag size={18} strokeWidth={1.5} /> Help & Support
                      </Link>
                    </div>
                  </>
                )}
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
