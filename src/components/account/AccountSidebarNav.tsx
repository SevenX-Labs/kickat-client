"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { notificationService } from "@/services/notificationService";
import {
  Package, User, MapPin, CreditCard, Shield, Heart, LogOut, Crown,
  ChevronRight, Headphones, Bell
} from "lucide-react";
import styles from "./AccountSidebarNav.module.css";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface UserProps {
  firstName: string;
  lastName: string;
  email: string;
  totalOrders?: number;
  points?: number;
  tier?: string;
  avatarUrl?: string;
  profileImage?: string;
  image?: string;
}

const defaultUser: UserProps = {
  firstName: "KickAt",
  lastName: "Member",
  email: "member@kickat.co.in",
  totalOrders: 0,
  points: 1240,
  tier: "KickAt VIP"
};

export default function AccountSidebarNav({
  user = defaultUser
}: {
  user?: UserProps;
}) {
  const pathname = usePathname();
  const { showSignOutModal } = useAuth();
  
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleSignOut = () => {
    setIsLogoutOpen(true);
  };
  
  const confirmSignOut = () => {
    setIsLogoutOpen(false);
    showSignOutModal();
  };

  // Active route checks
  const isOrdersActive = pathname.startsWith("/orders") || pathname.startsWith("/account/orders");
  const isWishlistActive = pathname.startsWith("/wishlist") || pathname.startsWith("/account/wishlist");
  const isAddressesActive = pathname.startsWith("/account/addresses");
  const isPaymentsActive = pathname.startsWith("/account/payment-methods");
  const isProfileActive = pathname === "/account/profile";
  const isNotificationsActive = pathname.startsWith("/account/notifications");
  const isPrivacyActive = pathname.startsWith("/account/privacy");

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getNotifications(1, 50);
        if (res.success && res.items) {
          const unread = res.items.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to load notification count', err);
      }
    };
    fetchUnreadCount();
    
    const handleRead = () => fetchUnreadCount();
    window.addEventListener('notifications-read', handleRead);
    return () => window.removeEventListener('notifications-read', handleRead);
  }, []);

  // Grouped Navigation Items according to Requirement 12
  const menuGroups = [
    {
      groupTitle: "ACCOUNT",
      items: [
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
      ]
    },
    {
      groupTitle: "PAYMENTS",
      items: [
        {
          id: "payments",
          title: "Payment Methods",
          subtitle: "Saved cards, UPI & wallet options",
          href: "/account/payment-methods",
          isActive: isPaymentsActive,
          Icon: CreditCard,
        },
      ]
    },
    {
      groupTitle: "SAVED",
      items: [
        {
          id: "wishlist",
          title: "Wishlist",
          subtitle: "Your favorite saved pet items",
          href: "/account/wishlist",
          isActive: isWishlistActive,
          Icon: Heart,
        },
      ]
    },
    {
      groupTitle: "PREFERENCES",
      items: [
        {
          id: "notifications",
          title: "Notifications",
          subtitle: "Order updates & promotional alerts",
          href: "/account/notifications",
          isActive: isNotificationsActive,
          Icon: Bell,
          badge: unreadCount
        },
        {
          id: "privacy",
          title: "Privacy & Security",
          subtitle: "Account security & privacy settings",
          href: "/account/privacy",
          isActive: isPrivacyActive,
          Icon: Shield,
        },
      ]
    }
  ];

  const userAvatar = user.avatarUrl || user.profileImage || user.image;
  const initials = `${user.firstName.charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase();

  return (
    <nav className={styles.navContainer} aria-label="Account Navigation">
      <div className={styles.unifiedNavWrapper}>
        <div className={styles.sidebarMainCard}>
          {/* Compact Profile Header */}
          <div className={styles.userProfileSection}>
            <div className={styles.avatarCircle}>
              {userAvatar ? (
                <img src={userAvatar} alt={`${user.firstName} ${user.lastName}`} className={styles.avatarImg} />
              ) : (
                <span>{initials || "K"}</span>
              )}
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
          
          {/* Rewards Progress Strip */}
          <div className={styles.rewardsStrip}>
            <div className={styles.rewardsHeader}>
              <span className={styles.rewardsTitle}>{user.points?.toLocaleString('en-IN') || 0} Paws · {user.tier || "KickAt VIP"}</span>
            </div>
            <div className={styles.rewardsProgressBg}>
              <div className={styles.rewardsProgressFill} style={{ width: '80%' }} />
            </div>
            <span className={styles.rewardsSub}>260 pts to go</span>
          </div>

          <div className={styles.sectionDivider} />

          {/* Grouped Menu List */}
          <div className={styles.navMenuList}>
            {menuGroups.map((group, groupIdx) => (
              <div key={group.groupTitle || groupIdx} className={styles.menuGroupBlock}>
                {group.groupTitle && (
                  <div className={styles.groupHeaderLabel}>{group.groupTitle}</div>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${styles.navItemLink} ${item.isActive ? styles.activeNavItem : ""}`}
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    <div className={styles.iconCircleWrap}>
                      <item.Icon size={18} className={styles.navIcon} strokeWidth={2} />
                    </div>
                    <div className={styles.navTextCol}>
                      <span className={styles.navTitle}>{item.title}</span>
                      <span className={styles.navSubtitle}>{item.subtitle}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={styles.notifBadgePill}>{item.badge}</span>
                    )}
                    <div className={styles.chevronWrap}>
                      <ChevronRight size={16} className={styles.navChevron} />
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
          
          {/* Bottom Group: Help, Logout & Made with Love Footer */}
          <div className={styles.bottomNavGroup}>
            <div className={styles.sectionDivider} />
            <Link href="/contact" className={`${styles.navItemLink}`}>
              <div className={styles.iconCircleWrap}>
                <Headphones size={18} className={styles.navIcon} strokeWidth={2} />
              </div>
              <div className={styles.navTextCol}>
                <span className={styles.navTitle}>Help & Support</span>
                <span className={styles.navSubtitle}>Contact customer care & FAQs</span>
              </div>
              <div className={styles.chevronWrap}>
                <ChevronRight size={16} className={styles.navChevron} />
              </div>
            </Link>

            <button
              type="button"
              className={`${styles.navItemLink} ${styles.signOutItem}`}
              onClick={handleSignOut}
              aria-label="Sign Out"
            >
              <div className={`${styles.iconCircleWrap} ${styles.signOutIconWrap}`}>
                <LogOut size={18} className={styles.signOutIcon} strokeWidth={2} />
              </div>
              <div className={styles.navTextCol}>
                <span className={styles.signOutTitle}>Sign Out</span>
              </div>
            </button>

            {/* Premium "Made with Love by KickAt" Footer */}
            <div className={styles.madeWithLoveWrapper}>
              <div className={styles.madeWithLovePill}>
                <span>Crafted with</span>
                <Heart size={14} fill="#F28C0F" color="#F28C0F" className={styles.heartIcon} />
                <span>for your pets by <strong>KickAt</strong></span>
              </div>
              <span className={styles.appVersionText}>v1.0.0 · Premium Pet Supplies 🐾</span>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={isLogoutOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        onConfirm={confirmSignOut}
        onCancel={() => setIsLogoutOpen(false)}
        isDanger={true}
      />
    </nav>
  );
}
