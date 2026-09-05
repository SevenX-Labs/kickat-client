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

  return (
    <nav className={styles.bottomNavContainer}>
      <div className={styles.bottomNavInner}>
        {navItems.map((item) => {
          const Icon = item.Icon;
          const isCart = item.label === "Cart";

          return (
            <Link
              key={item.label}
              href={item.href}
              id={isCart ? "bottom-nav-cart-btn" : undefined}
              className={`${styles.navItem} ${item.isActive ? styles.active : ""}`}
            >
              {item.isActive && <div className={styles.activeIndicator} />}
              <div className={`${styles.iconWrapper} ${isCart && isCartBouncing ? styles.cartBounce : ''}`}>
                <Icon size={20} strokeWidth={item.isActive ? 2.2 : 1.7} />
                {isCart && cartCount > 0 && (
                  <span className={styles.cartBadge}>{cartCount}</span>
                )}
              </div>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
