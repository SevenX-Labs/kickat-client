"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Package, User, MapPin, CreditCard, Settings, Heart, LogOut, Crown, Camera } from 'lucide-react';
import styles from './AccountSidebarNav.module.css';

interface UserProps {
  firstName: string;
  lastName: string;
  email: string;
  totalOrders: number;
  points: number;
}

const defaultUser: UserProps = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  totalOrders: 12,
  points: 1240
};

export default function AccountSidebarNav({ user = defaultUser }: { user?: UserProps }) {
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
  const isProfileActive = (pathname === '/account' && !['addresses', 'payments', 'payment-methods', 'settings'].includes(currentTab || '')) || pathname === '/account/profile';

  return (
    <>
      {/* Mobile Profile Header Banner */}
      <div className={styles.mobileProfileHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <span className={styles.crownBadge} title="KickAt VIP Member">
            <Crown size={12} fill="#FFD700" color="#B8860B" />
          </span>
        </div>

        <div className={styles.greeting}>
          <span className={styles.greetingText}>Welcome back,</span>
          <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
          <span className={styles.userEmailText}>{user.email}</span>
        </div>

        <div className={styles.mobileStatsRow}>
          <div className={styles.mobileStatChip}>
            <span className={styles.chipVal}>{user.totalOrders}</span>
            <span className={styles.chipLbl}>Orders</span>
          </div>
          <div className={styles.mobileStatChip}>
            <span className={`${styles.chipVal} ${styles.statPoints}`}>{user.points}</span>
            <span className={styles.chipLbl}>Points</span>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Tab Navigation */}
      <div className={styles.mobileTabNavStrip}>
        <Link 
          href="/account/orders"
          className={`${styles.mobileTabBtn} ${isOrdersActive ? styles.mobileTabActive : ''}`}
        >
          <Package size={16} />
          <span>My Orders</span>
        </Link>
        <Link 
          href="/account?tab=profile"
          className={`${styles.mobileTabBtn} ${isProfileActive ? styles.mobileTabActive : ''}`}
        >
          <User size={16} />
          <span>Profile</span>
        </Link>
        <Link 
          href="/account/addresses"
          className={`${styles.mobileTabBtn} ${isAddressesActive ? styles.mobileTabActive : ''}`}
        >
          <MapPin size={16} />
          <span>Addresses</span>
        </Link>
        <Link 
          href="/account/payment-methods"
          className={`${styles.mobileTabBtn} ${isPaymentsActive ? styles.mobileTabActive : ''}`}
        >
          <CreditCard size={16} />
          <span>Payments</span>
        </Link>
        <Link 
          href="/account/settings"
          className={`${styles.mobileTabBtn} ${isSettingsActive ? styles.mobileTabActive : ''}`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
        <Link 
          href="/wishlist"
          className={`${styles.mobileTabBtn} ${isWishlistActive ? styles.mobileTabActive : ''}`}
        >
          <Heart size={16} />
          <span>Wishlist</span>
        </Link>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.userProfile}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <button 
              type="button" 
              className={styles.avatarEditBtn} 
              title="Change Profile Picture"
              onClick={() => alert('Avatar customization coming soon!')}
            >
              <Camera size={13} />
            </button>
            <div className={styles.vipBadgeRibbon}>
              <Crown size={10} fill="#FD802E" color="#FD802E" />
              <span>VIP MEMBER</span>
            </div>
          </div>

          <div className={styles.greeting}>
            <span className={styles.greetingText}>Welcome back,</span>
            <span className={styles.userName}>{user.firstName} {user.lastName}</span>
            <span className={styles.userEmailText}>{user.email}</span>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <Link 
            href="/account/orders"
            className={`${styles.navLink} ${isOrdersActive ? styles.active : ''}`}
          >
            <div className={styles.navIconWrapper}><Package size={18} strokeWidth={2} /></div>
            <span>My Orders</span>
            {isOrdersActive && <div className={styles.activePillDot} />}
          </Link>

          <Link 
            href="/account?tab=profile"
            className={`${styles.navLink} ${isProfileActive ? styles.active : ''}`}
          >
            <div className={styles.navIconWrapper}><User size={18} strokeWidth={2} /></div>
            <span>Profile Details</span>
            {isProfileActive && <div className={styles.activePillDot} />}
          </Link>

          <Link 
            href="/account/addresses"
            className={`${styles.navLink} ${isAddressesActive ? styles.active : ''}`}
          >
            <div className={styles.navIconWrapper}><MapPin size={18} strokeWidth={2} /></div>
            <span>Saved Addresses</span>
            {isAddressesActive && <div className={styles.activePillDot} />}
          </Link>

          <Link 
            href="/account/payment-methods"
            className={`${styles.navLink} ${isPaymentsActive ? styles.active : ''}`}
          >
            <div className={styles.navIconWrapper}><CreditCard size={18} strokeWidth={2} /></div>
            <span>Payment Methods</span>
            {isPaymentsActive && <div className={styles.activePillDot} />}
          </Link>

          <Link 
            href="/account/settings"
            className={`${styles.navLink} ${isSettingsActive ? styles.active : ''}`}
          >
            <div className={styles.navIconWrapper}><Settings size={18} strokeWidth={2} /></div>
            <span>Preferences &amp; Settings</span>
            {isSettingsActive && <div className={styles.activePillDot} />}
          </Link>

          <Link 
            href="/wishlist"
            className={`${styles.navLink} ${isWishlistActive ? styles.active : ''}`}
          >
            <div className={styles.navIconWrapper}><Heart size={18} strokeWidth={2} /></div>
            <span>Wishlist</span>
            {isWishlistActive && <div className={styles.activePillDot} />}
          </Link>
          
          <button 
            type="button" 
            className={styles.logoutBtn}
            onClick={() => router.push('/login')}
          >
            <LogOut size={18} strokeWidth={2} /> <span>Sign Out</span>
          </button>
        </nav>
      </aside>
    </>
  );
}


