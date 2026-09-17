"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Package, User, MapPin, CreditCard, Settings, Heart, LogOut, Crown, 
  ChevronRight, Headphones 
} from "lucide-react";
import styles from "./AccountSidebarNav.module.css";
import { useAuth } from "@/context/AuthContext";

interface UserProps {
  firstName: string;
  lastName: string;
  email: string;
  totalOrders?: number;
  points?: number;
  tier?: string;
  onEditProfile?: () => void;
}

const defaultUser: UserProps = {
  firstName: "KickAt",
  lastName: "Member",
  email: "member@kickat.co.in",
  totalOrders: 0,
  points: 100,
  tier: "KickAt VIP"
};

export default function AccountSidebarNav({ 
  user = defaultUser
}: { 
  user?: UserProps; 
  onEditProfile?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showSignOutModal } = useAuth();

  const handleSignOut = () => {
    showSignOutModal();
  };

  const currentTab = searchParams.get("tab");

  // Determine active route item
  const isOrdersActive = pathname.startsWith("/orders") || pathname.startsWith("/account/orders");
  const isWishlistActive = pathname.startsWith("/wishlist") || pathname.startsWith("/account/wishlist");
  const isAddressesActive = pathname === "/account/addresses" || (pathname === "/account" && currentTab === "addresses");
  const isPaymentsActive = pathname === "/account/payment-methods" || (pathname === "/account" && (currentTab === "payments" || currentTab === "payment-methods"));
  const isSettingsActive = pathname === "/account/settings" || (pathname === "/account" && currentTab === "settings");
  const isProfileActive = pathname === "/account/profile";

  const menuItems = [
    {
      id: "profile",
      title: "Profile Details",
      subtitle: "Personal info, email & phone number",
      href: "/account/profile",
      isActive: isProfileActive,
      Icon: User,
    },
    {
      id: "orders",
      title: "My Orders",
      subtitle: "Track, view & manage past purchases",
      href: "/account/orders",
      isActive: isOrdersActive,
      Icon: Package,
    },
    {
      id: "addresses",
      title: "Saved Addresses",
      subtitle: "Delivery addresses for fast checkout",
      href: "/account/addresses",
      isActive: isAddressesActive,
      Icon: MapPin,
    },
    {
      id: "payments",
      title: "Payment Methods",
      subtitle: "Saved cards, UPI & wallet options",
      href: "/account/payment-methods",
      isActive: isPaymentsActive,
      Icon: CreditCard,
    },
    {
      id: "wishlist",
      title: "Wishlist",
      subtitle: "Your favorite saved pet items",
      href: "/wishlist",
      isActive: isWishlistActive,
      Icon: Heart,
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Notifications & account privacy",
      href: "/account/settings",
      isActive: isSettingsActive,
      Icon: Settings,
    },
  ];

  return (
    <aside className={styles.navContainer}>
      <div className={styles.unifiedNavWrapper}>
        <div className={styles.sidebarMainCard}>
          <div className={styles.userProfileSection}>
            <div className={styles.avatarCircle}>
              {user.firstName.charAt(0)}{(user.lastName || "").charAt(0)}
            </div>
            <div className={styles.profileMeta}>
              <div className={styles.vipBadgePill}>
                <Crown size={11} fill="#F99205" color="#F99205" />
                <span>{user.tier || "KickAt VIP"}</span>
              </div>
              <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          <nav className={styles.navMenuList}>
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.navItemLink} ${item.isActive ? styles.activeNavItem : ""}`}
              >
                <div className={styles.iconCircleWrap}>
                  <item.Icon size={18} className={styles.navIcon} strokeWidth={2} />
                </div>
                <div className={styles.navTextCol}>
                  <span className={styles.navTitle}>{item.title}</span>
                  <span className={styles.navSubtitle}>{item.subtitle}</span>
                </div>
                <ChevronRight size={16} className={styles.navChevron} />
              </Link>
            ))}

            <button
              type="button"
              className={`${styles.navItemLink} ${styles.signOutItem}`}
              onClick={handleSignOut}
            >
              <div className={`${styles.iconCircleWrap} ${styles.signOutIconWrap}`}>
                <LogOut size={18} className={styles.signOutIcon} strokeWidth={2} />
              </div>
              <div className={styles.navTextCol}>
                <span className={styles.signOutTitle}>Sign Out</span>
                <span className={styles.navSubtitle}>Log out of your KickAt account</span>
              </div>
              <ChevronRight size={16} className={styles.navChevron} />
            </button>
          </nav>
        </div>

        <div className={styles.helpBannerCard}>
          <div className={styles.helpLeftSection}>
            <div className={styles.helpMascotCircle}>
              <span className={styles.dogEmoji}>🐶</span>
            </div>
            <div className={styles.helpTextGroup}>
              <span className={styles.helpTitle}>Need Help?</span>
              <span className={styles.helpSubtitle}>We are here for you!</span>
              <Link href="/contact" className={styles.contactSupportBtn}>
                <Headphones size={13} />
                <span>Contact Support</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.madeWithLoveFooter}>
          <span>Made with ❤️ by <strong>KickAt</strong></span>
        </div>
      </div>
    </aside>
  );
}
