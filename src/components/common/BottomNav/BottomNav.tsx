"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Package, ShoppingBag, User } from "lucide-react";
import styles from "./BottomNav.module.css";

export function BottomNav() {
  const pathname = usePathname();

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
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${item.isActive ? styles.active : ""}`}
            >
              {item.isActive && <div className={styles.activeIndicator} />}
              <div className={styles.iconWrapper}>
                <Icon size={20} strokeWidth={item.isActive ? 2.2 : 1.7} />
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
