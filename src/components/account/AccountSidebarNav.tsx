"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  Package, User, MapPin, CreditCard, Settings, Heart, LogOut, Crown, 
  ChevronRight, ChevronLeft, Headphones 
} from 'lucide-react';
import styles from './AccountSidebarNav.module.css';

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
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  totalOrders: 12,
  points: 1240,
  tier: 'Gold Paw VIP'
};

export default function AccountSidebarNav({ 
  user = defaultUser
}: { 
  user?: UserProps; 
  onEditProfile?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');

  // Determine active route item
  const isOrdersActive = pathname.startsWith('/orders') || pathname.startsWith('/account/orders');
  const isWishlistActive = pathname.startsWith('/wishlist') || pathname.startsWith('/account/wishlist');
  const isAddressesActive = pathname === '/account/addresses' || (pathname === '/account' && currentTab === 'addresses');
  const isPaymentsActive = pathname === '/account/payment-methods' || (pathname === '/account' && (currentTab === 'payments' || currentTab === 'payment-methods'));
  const isSettingsActive = pathname === '/account/settings' || (pathname === '/account' && currentTab === 'settings');
  const isProfileActive = (pathname === '/account' && currentTab === 'profile') || pathname === '/account/profile' || (pathname === '/account' && !currentTab);

  // Sub-page active status on mobile
  const isSubPage = isOrdersActive || isWishlistActive || isAddressesActive || isPaymentsActive || isSettingsActive || (pathname === '/account' && currentTab !== null) || pathname === '/account/profile';

  const menuItems = [
    {
      id: 'orders',
      title: 'My Orders',
      href: '/account/orders',
      isActive: isOrdersActive,
      Icon: Package,
    },
    {
      id: 'profile',
      title: 'Profile Details',
      href: '/account?tab=profile',
      isActive: isProfileActive,
      Icon: User,
    },
    {
      id: 'addresses',
      title: 'Saved Addresses',
      href: '/account/addresses',
      isActive: isAddressesActive,
      Icon: MapPin,
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      href: '/account/payment-methods',
      isActive: isPaymentsActive,
      Icon: CreditCard,
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      href: '/wishlist',
      isActive: isWishlistActive,
      Icon: Heart,
    },
    {
      id: 'settings',
      title: 'Settings',
      href: '/account/settings',
      isActive: isSettingsActive,
      Icon: Settings,
    },
  ];

  return (
    <aside className={styles.navContainer}>
      {/* Mobile Back Header when inside a sub-page */}
      {isSubPage && (
        <div className={styles.mobileBackNavHeader}>
          <Link href="/account" className={styles.backBtnLink}>
            <ChevronLeft size={18} />
            <span>Back to Account</span>
          </Link>
        </div>
      )}

      {/* Main Account Navigation Wrapper */}
      <div className={`${styles.mainNavWrapper} ${isSubPage ? styles.hideOnMobileSubpage : ''}`}>
        
        {/* 1. UNIFIED SIDEBAR MAIN CARD */}
        <div className={styles.sidebarMainCard}>
          {/* User Profile Header Block */}
          <div className={styles.userProfileSection}>
            <div className={styles.avatarCircle}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className={styles.profileMeta}>
              <div className={styles.vipBadgePill}>
                <Crown size={11} fill="#FD802E" color="#FD802E" />
                <span>{user.tier || 'Gold Paw VIP'}</span>
              </div>
              <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          {/* Navigation Menu Links */}
          <nav className={styles.navMenuList}>
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.navItemLink} ${item.isActive ? styles.activeNavItem : ''}`}
              >
                <item.Icon size={19} className={styles.navIcon} strokeWidth={2} />
                <span className={styles.navTitle}>{item.title}</span>
                <ChevronRight size={16} className={styles.navChevron} />
              </Link>
            ))}

            {/* Sign Out Action Item */}
            <button
              type="button"
              className={`${styles.navItemLink} ${styles.signOutItem}`}
              onClick={() => router.push('/login')}
            >
              <LogOut size={19} className={styles.signOutIcon} strokeWidth={2} />
              <span className={styles.signOutTitle}>Sign Out</span>
              <ChevronRight size={16} className={styles.navChevron} />
            </button>
          </nav>
        </div>

        {/* 2. NEED HELP? SUPPORT CARD */}
        <div className={styles.helpBannerCard}>
          <div className={styles.helpLeftSection}>
            <div className={styles.helpMascotCircle}>
              <span className={styles.dogEmoji}>🐶</span>
            </div>
            <div className={styles.helpTextGroup}>
              <span className={styles.helpTitle}>Need Help?</span>
              <span className={styles.helpSubtitle}>We're here for you!</span>
              <Link href="/contact" className={styles.contactSupportBtn}>
                <Headphones size={13} />
                <span>Contact Support</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. FOOTER LINE: Made with ❤️ by KickAt */}
        <div className={styles.madeWithLoveFooter}>
          <span>Made with ❤️ by <strong>KickAt</strong></span>
        </div>
      </div>
    </aside>
  );
}
