"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Package,
  Tag,
  MapPin,
  Bell,
  LogOut,
  Sparkles,
  Truck,
  Crown,
  Menu,
  X,
  MessageCircle,
  BookOpen,
  Phone,
  Headset,
  ArrowRight,
  ChevronRight,
  ShieldQuestion,
} from "lucide-react";
import styles from "./Navbar.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { CURRENCY_FORMATTER } from "@/utils/constants";
import { usePublicSettings } from "@/hooks/usePublicSettings";

const desktopNavLinks = [
  {
    label: "Shop",
    href: "/shop",
    isActive: (pathname: string) =>
      pathname.startsWith("/shop") ||
      pathname.startsWith("/category") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/product"),
  },
  {
    label: "Blogs",
    href: "/blogs",
    isActive: (pathname: string) => pathname.startsWith("/blogs"),
  },
  {
    label: "Why-Us",
    href: "/#why-us",
    isActive: (pathname: string) => pathname === "/why-us",
  },
  {
    label: "Testimonials",
    href: "/testimonials",
    isActive: (pathname: string) => pathname.startsWith("/testimonials"),
  },
  {
    label: "Contact",
    href: "/contact",
    isActive: (pathname: string) => pathname.startsWith("/contact"),
  },
];

const sideDrawerLinks = [
  { label: "Shop", href: "/shop", Icon: ShoppingBag },
  { label: "Blogs", href: "/blogs", Icon: BookOpen },
  { label: "Why-Us", href: "/#why-us", Icon: Sparkles },
  { label: "Testimonials", href: "/testimonials", Icon: MessageCircle },
  { label: "Contact", href: "/contact", Icon: Phone },
  { label: "Wishlist", href: "/wishlist", Icon: Heart },
  { label: "Track Orders", href: "/orders", Icon: Package },
  { label: "Help & Support", href: "/contact", Icon: Headset },
  { label: "Privacy Policy", href: "/privacy-policy", Icon: ShieldQuestion },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartCount } = useCart();
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { logout, isAuthenticated, showSignOutModal } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleCartItemAdded = () => {
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

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  };

  const handleLogout = () => {
    showSignOutModal();
  };

  const { delivery } = usePublicSettings();
  const isFreeDeliveryAll = delivery
    ? !delivery.deliveryFeeEnabled || delivery.freeDeliveryThreshold === 0
    : false;
  const deliveryMarqueeText = !delivery
    ? "Free Delivery on orders"
    : isFreeDeliveryAll
    ? "Free Delivery on all orders"
    : `Free Delivery on orders over ${CURRENCY_FORMATTER.format(delivery.freeDeliveryThreshold)}`;

  const items = [
    { text: deliveryMarqueeText, Icon: Truck },
    { text: "Available on Amazon, Flipkart, JioMart & Meesho", Icon: ShoppingBag },
    { text: "Premium pet accessories", Icon: Crown },
  ];
  // Duplicate to ensure the marquee fills wide screens
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
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
                <Sparkles className={styles.separatorIcon} size={12} strokeWidth={2} />
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
                <Sparkles className={styles.separatorIcon} size={12} strokeWidth={2} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Left Section: Logo + Mobile Hamburger */}
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
        <nav className={styles.centerSection} aria-label="Main navigation">
          {desktopNavLinks.map(({ label, href, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={label}
                href={href}
                className={`${styles.navItem} ${active ? styles.activeNavItem : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Search + User Actions */}
        <div className={styles.rightSection}>
          <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
            <div className={styles.searchWrapper}>
              <button
                type="submit"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Submit Search"
              >
                <Search className={styles.searchIcon} size={16} strokeWidth={1.5} />
              </button>
              <input
                type="text"
                placeholder="Search products..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className={styles.actions}>
            <Link
              href="/wishlist"
              className={`${styles.iconBtn} ${styles.wishlistBtn}`}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
            </Link>

            <div className={styles.accountWrapper}>
              <button
                onClick={handleAccountClick}
                className={styles.iconBtn}
                aria-label="Account"
                title="Account"
              >
                <User size={20} strokeWidth={1.5} />
              </button>

              <div className={styles.accountDropdown}>
                {isAuthenticated ? (
                  <>
                    <div className={styles.accountDropdownHeader}>
                      <div className={styles.headerUserRow}>
                        <div className={styles.headerAvatar}>
                          <User size={18} strokeWidth={2.2} />
                        </div>
                        <div className={styles.headerTextCol}>
                          <span className={styles.greetingTitle}>My Account</span>
                          <span className={styles.greetingSub}>Manage profile & orders</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.accountDropdownList}>
                      <Link href="/account?tab=profile" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <User size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>My Profile</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                      <Link href="/orders" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <Package size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Orders & Tracking</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                      <Link href="/account/addresses" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <MapPin size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Saved Addresses</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                      <Link href="/wishlist" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <Heart size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Wishlist</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                      <Link href="/notifications" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <Bell size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Notifications</span>
                        </div>
                        <span className={styles.notifBadge}>2</span>
                      </Link>
                      <div className={styles.divider} />
                      <button
                        className={`${styles.accountDropdownItem} ${styles.logoutItem}`}
                        onClick={handleLogout}
                      >
                        <div className={styles.itemLeft}>
                          <span className={`${styles.itemIconWrap} ${styles.logoutIconWrap}`}>
                            <LogOut size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Logout</span>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.accountDropdownHeader}>
                      <div className={styles.headerUserRow}>
                        <div className={styles.headerAvatar}>
                          <Sparkles size={18} strokeWidth={2.2} />
                        </div>
                        <div className={styles.headerTextCol}>
                          <span className={styles.greetingTitle}>Welcome to KickAt</span>
                          <span className={styles.greetingSub}>Access account & track orders</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.authBox}>
                      <Link href="/login" className={styles.signInBtn}>
                        <span>Sign In / Register</span>
                        <ArrowRight size={15} strokeWidth={2} />
                      </Link>
                    </div>
                    <div className={styles.accountDropdownList}>
                      <Link href="/orders" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <Package size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Track Orders</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                      <Link href="/wishlist" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <Heart size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Wishlist</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                      <Link href="/contact" className={styles.accountDropdownItem}>
                        <div className={styles.itemLeft}>
                          <span className={styles.itemIconWrap}>
                            <Tag size={16} strokeWidth={1.8} />
                          </span>
                          <span className={styles.itemLabel}>Help & Support</span>
                        </div>
                        <ChevronRight size={14} strokeWidth={2.2} className={styles.itemArrow} />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Link
              href="/cart"
              id="navbar-cart-btn"
              className={`${styles.cartBtn} ${isCartBouncing ? styles.cartBounce : ""}`}
              aria-label="Shopping Cart"
              title="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className={styles.badge}>{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Half-Width Side Drawer Overlay Backdrop & Panel */}
      {mounted &&
        createPortal(
          <>
            <div
              className={`${styles.sideDrawerBackdrop} ${
                isMenuOpen ? styles.sideDrawerBackdropOpen : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            />

            <div
              className={`${styles.sideDrawerPanel} ${
                isMenuOpen ? styles.sideDrawerPanelOpen : ""
              }`}
            >
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
                <span className={styles.sideDrawerNavGroupTitle}>Navigation</span>
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
          </>,
          document.body
        )}
    </header>
  );
}
