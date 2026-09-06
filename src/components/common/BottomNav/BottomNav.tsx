"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Package, ShoppingBag, User } from "lucide-react";
import styles from "./BottomNav.module.css";

export function BottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(2);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
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

  const navItems = [
    {
      label: "Home",
      href: "/",
      Icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Categories",
      href: "/categories",
      Icon: LayoutGrid,
      isActive: pathname.startsWith("/categories") || pathname.startsWith("/category"),
    },
    {
      label: "Orders",
      href: "/orders",
      Icon: Package,
      isActive: pathname === "/orders" || pathname.startsWith("/orders/") || pathname.startsWith("/account/orders"),
    },
    {
      label: "Cart",
      href: "/cart",
      Icon: ShoppingBag,
      isActive: pathname === "/cart",
    },
    {
      label: "Account",
      href: "/account",
      Icon: User,
      isActive: pathname.startsWith("/account") && !pathname.startsWith("/account/orders"),
    },
  ];

  const activeIndex = navItems.findIndex((item) => item.isActive);

  return (
    <nav className={styles.bottomNavContainer} aria-label="Mobile Navigation">
      {/* Top ambient highlight gradient */}
      <div className={styles.topAmbientBorder} />

      <div className={styles.bottomNavInner}>
        {/* Animated Sliding Active Indicator with Glowing Beam */}
        {activeIndex !== -1 && (
          <div
            className={styles.slidingIndicatorTrack}
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
            }}
            aria-hidden="true"
          >
            <div className={styles.slidingIndicatorGlow} />
            <div className={styles.slidingIndicatorBar} />
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.Icon;
          const isCart = item.label === "Cart";
          const isActive = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              id={isCart ? "bottom-nav-cart-btn" : undefined}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={styles.itemContent}>
                <div
                  className={`${styles.iconWrapper} ${
                    isActive ? styles.activeIconWrapper : ""
                  } ${isCart && isCartBouncing ? styles.cartBounce : ""}`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.25 : 1.7}
                    className={styles.navIcon}
                  />
                  {isCart && cartCount > 0 && (
                    <span className={styles.cartBadge}>{cartCount}</span>
                  )}
                  {/* Subtle active radial ambient halo */}
                  {isActive && <div className={styles.activeHalo} />}
                </div>
                <span className={styles.label}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
