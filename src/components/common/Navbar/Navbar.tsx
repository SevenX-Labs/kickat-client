"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Search, Heart, User, ShoppingBag, Package, Tag, MapPin, Bell, LogOut, Star, Truck, Percent, Crown, Menu, X, Dog, Cat, Fish, Bird, MessageCircle, BookOpen, Phone, ShieldQuestion, Headset, ArrowRight, Sun, Sparkles } from "lucide-react";
import styles from "./Navbar.module.css";
import { megaMenuData } from "@/data/megaMenuData";

const taxonomy = {
  Dogs: {
    categoryHref: "/categories/dogs",
    Icon: Dog,
    items: [
      { name: "Dog Accessories", href: "/category/dogs/dog-accessories" },
      { name: "Dog Food & Treats", href: "/category/dogs/dog-food-treats" },
      { name: "Dog Grooming & Hygiene", href: "/category/dogs/dog-grooming-hygiene" },
      { name: "Dog Feeding", href: "/category/dogs/dog-feeding" },
    ],
  },
  Cats: {
    categoryHref: "/categories/cats",
    Icon: Cat,
    items: [
      { name: "Cat Accessories", href: "/category/cats/cat-accessories" },
      { name: "Cat Food", href: "/category/cats/cat-food" },
      { name: "Cat Grooming & Hygiene", href: "/category/cats/cat-grooming-hygiene" },
      { name: "Cat Feeding", href: "/category/cats/cat-feeding" },
    ],
  },
  Fish: {
    categoryHref: "/categories/fish",
    Icon: Fish,
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
    Icon: Bird,
    items: [
      { name: "Bird Feeding", href: "/category/birds/bird-feeding" },
      { name: "Bird Food", href: "/category/birds/bird-food" },
    ],
  },
};

const mobileLinks = [
  { label: "Track Orders", href: "/orders", Icon: Package },
  { label: "Profile", href: "/account?tab=profile", Icon: User },
  { label: "Testimonials", href: "/testimonials", Icon: MessageCircle },
  { label: "Blogs", href: "/blogs", Icon: BookOpen },
  { label: "Contact", href: "/contact", Icon: Phone },
  { label: "Privacy Policy", href: "/privacy-policy", Icon: ShieldQuestion },
  { label: "Help & Support", href: "/contact", Icon: Headset },
];

const sideDrawerLinks = [
  { label: "Wishlist", href: "/wishlist", Icon: Heart },
  { label: "Why KickAt", href: "/#why-kickat", Icon: Sparkles },
  { label: "Testimonials", href: "/testimonials", Icon: MessageCircle },
  { label: "Contact Us", href: "/contact", Icon: Phone },
  { label: "Privacy Policy", href: "/privacy-policy", Icon: ShieldQuestion },
  { label: "Blogs", href: "/blogs", Icon: BookOpen },
  { label: "Help & Support", href: "/contact", Icon: Headset },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuHoverAllowed, setMenuHoverAllowed] = useState(true);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [activeSidebarItems, setActiveSidebarItems] = useState<Record<string, string>>({
    Dogs: 'food',
    Cats: 'food',
    Fish: 'food',
    Birds: 'food'
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    }

    const handleCartItemAdded = () => {
      setCartCount((prev) => prev + 1);
      setIsCartBouncing(true);
      setTimeout(() => {
        setIsCartBouncing(false);
      }, 600);
    };

    window.addEventListener("cart-item-added", handleCartItemAdded);
    return () => window.removeEventListener("cart-item-added", handleCartItemAdded);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Force close any open menus when the route changes
    setMenuHoverAllowed(false);
  }, [pathname]);

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

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileCategory(null);
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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
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
          <button
            className={styles.mobileMenuBtn}
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          <Link href="/" className={styles.logoWrapper}>
            <Image
              src="/logo-clean.png"
              alt="KickAt Logo"
              width={300}
              height={100}
              priority
              className={styles.logoImage}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </Link>
        </div>

        {/* Center Section: Navigation Links */}
        <nav className={styles.centerSection}>
          {Object.entries(megaMenuData).map(([category, data]) => (
            <div 
              key={category} 
              className={styles.dropdownWrapper}
              onMouseEnter={() => setMenuHoverAllowed(true)}
            >
              <Link 
                href={data.categoryHref} 
                className={`${styles.navItem} ${styles.dropdownTrigger}`}
                onClick={() => setMenuHoverAllowed(false)}
              >
                {category}
              </Link>
              
              <div className={`${styles.megaMenu} ${!menuHoverAllowed ? styles.forceHide : ''}`}>
                {/* Left Sidebar */}
                <div className={styles.megaSidebar}>
                  {data.sidebar.map((item) => {
                    const SidebarIcon = item.Icon;
                    const isActive = activeSidebarItems[category] === item.id;
                    return (
                      <div 
                        key={item.id} 
                        className={`${styles.megaSidebarItem} ${isActive ? styles.megaSidebarItemActive : ''}`}
                        onMouseEnter={() => setActiveSidebarItems(prev => ({ ...prev, [category]: item.id }))}
                      >
                        <span className={styles.megaSidebarItemLeft}>
                          <SidebarIcon size={18} strokeWidth={isActive ? 2 : 1.5} className={styles.megaSidebarIcon} />
                          {item.label}
                        </span>
                        {isActive && <ChevronDown className={styles.megaSidebarCaret} size={16} strokeWidth={2.5} />}
                      </div>
                    );
                  })}
                  <Link 
                    href={data.categoryHref} 
                    className={styles.megaViewAll}
                    onClick={() => setMenuHoverAllowed(false)}
                  >
                    View All {category} Products <ArrowRight size={14} strokeWidth={2} />
                  </Link>
                </div>

                {/* Middle Content */}
                <div className={styles.megaContent}>
                  <div className={styles.megaColumns}>
                    {data.content[activeSidebarItems[category] as keyof typeof data.content]?.map((col, idx) => (
                      <div key={idx} className={styles.megaColumn}>
                        <h3 className={styles.megaColTitle}>{col.title}</h3>
                        <ul className={styles.megaColList}>
                          {col.items.map((link, i) => (
                            <li key={i}>
                              <Link 
                                href={link.href} 
                                className={styles.megaColLink}
                                onClick={() => setMenuHoverAllowed(false)}
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Promo Banner */}
                  <div className={styles.megaPromoBanner}>
                    <div className={styles.megaPromoIconWrap}>
                      <Sun size={20} strokeWidth={1.8} className={styles.megaPromoIcon} /> 
                    </div>
                    <div className={styles.megaPromoText}>
                      <span className={styles.megaPromoTitle}>Not sure what's best for your pet?</span>
                      <span className={styles.megaPromoSub}>Get expert recommendations</span>
                    </div>
                    <ArrowRight size={16} strokeWidth={2} className={styles.megaPromoArrow} />
                  </div>
                </div>

                {/* Right Image */}
                <div className={styles.megaImageCol}>
                  <Image src={data.image} alt={category} fill className={styles.megaImage} style={{ objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          ))}
          <Link href="/blogs" className={styles.navItem}>
            Blogs
          </Link>
          <Link href="/testimonials" className={styles.navItem}>
            Testimonials
          </Link>
        </nav>

        {/* Right Section: Search + Premium Actions */}
        <div className={styles.rightSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={16} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search products..."
                className={styles.searchInput}
              />
            </div>
          </div>
          
          <div className={styles.actions}>
            <button className={`${styles.iconBtn} ${styles.wishlistBtn}`} aria-label="Wishlist" title="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
            </button>

            <div className={styles.accountWrapper}>
              <div 
                className={styles.iconBtn} 
                aria-label="User Account"
                style={{ cursor: 'pointer' }}
                onClick={handleAccountClick}
              >
                <User size={20} strokeWidth={1.5} />
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
                      <Link href="/orders" className={styles.accountDropdownItem}>
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

            <Link
              href="/cart"
              id="navbar-cart-btn"
              className={`${styles.cartBtn} ${isCartBouncing ? styles.cartBounce : ''}`}
              aria-label="Shopping Cart"
              title="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className={styles.badge}>{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Half-Width Side Drawer Overlay Backdrop */}
      <div 
        className={`${styles.sideDrawerBackdrop} ${isMenuOpen ? styles.sideDrawerBackdropOpen : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Half-Width Side Drawer Panel (Slides in from Left) */}
      <div className={`${styles.sideDrawerPanel} ${isMenuOpen ? styles.sideDrawerPanelOpen : ''}`}>
        <div className={styles.sideDrawerHeader}>
          <Image
            src="/logo-clean.png"
            alt="KickAt Logo"
            width={130}
            height={42}
            className={styles.sideDrawerLogo}
          />
          <button 
            type="button" 
            className={styles.sideDrawerCloseBtn} 
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.sideDrawerNav}>
          <span className={styles.sideDrawerNavGroupTitle}>Quick Navigation</span>
          {sideDrawerLinks.map(({ label, href, Icon }) => (
            <Link 
              key={label} 
              href={href} 
              className={styles.sideDrawerItem}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon size={18} className={styles.sideDrawerItemIcon} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className={styles.sideDrawerFooter}>
          <div className={styles.sideDrawerBadge}>
            <Crown size={14} />
            <span>KickAt VIP Pet Perks</span>
          </div>
        </div>
      </div>
    </header>
  );
}
