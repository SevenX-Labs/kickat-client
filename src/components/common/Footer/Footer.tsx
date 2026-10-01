"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import styles from './Footer.module.css';

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
  </svg>
);

export function Footer() {
  const { general } = usePublicSettings();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const storeName = general?.storeName || 'KickAt';
  const supportEmail = general?.supportEmail || 'kickat2021@gmail.com';
  const supportPhone = general?.supportPhone || '+91 96742 48592';
  const socialLinks = general?.socialLinks;

  const instagramUrl = socialLinks?.instagram?.trim();
  const facebookUrl = socialLinks?.facebook?.trim();
  const linkedinUrl = socialLinks?.linkedin?.trim();
  const youtubeUrl = socialLinks?.youtube?.trim();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          
          {/* Brand & Support Touchpoints */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink} aria-label="KickAt Home">
              <Image 
                src="/logo.png" 
                alt="KickAt Logo" 
                width={220} 
                height={66} 
                className={styles.logo}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </Link>
            <p className={styles.tagline}>A bond that never ends.</p>
            
            <div className={styles.brandContacts}>
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className={styles.contactItem} title="Email Support">
                  <Mail size={14} className={styles.contactIcon} />
                  <span>{supportEmail}</span>
                </a>
              )}
              {supportPhone && (
                <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className={styles.contactItem} title="Call Customer Care">
                  <Phone size={14} className={styles.contactIcon} />
                  <span>{supportPhone}</span>
                </a>
              )}
            </div>

            <div className={styles.socials}>
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLink} 
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
              {facebookUrl && (
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLink} 
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {linkedinUrl && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLink} 
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              )}
              {youtubeUrl && (
                <a 
                  href={youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialLink} 
                  aria-label="YouTube"
                >
                  <YouTubeIcon />
                </a>
              )}
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Shop</h3>
            <Link href="/shop" className={styles.link}>All Products</Link>
            <Link href="/category/dogs" className={styles.link}>Dog Essentials</Link>
            <Link href="/category/cats" className={styles.link}>Cat Essentials</Link>
            <Link href="/category/fish" className={styles.link}>Aquarium & Fish</Link>
            <Link href="/category/birds" className={styles.link}>Birds</Link>
          </div>

          {/* Column 2: Explore */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Explore</h3>
            <Link href="/#why-us" className={styles.link}>Why KickAt</Link>
            <Link href="/blogs" className={styles.link}>KickAt Journal</Link>
            <Link href="/testimonials" className={styles.link}>Testimonials</Link>
            <Link href="/faq" className={styles.link}>FAQ</Link>
            <Link href="/contact" className={styles.link}>Contact Us</Link>
          </div>

          {/* Column 3: Customer Care */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Customer Care</h3>
            <Link href="/orders" className={styles.link}>Track Order</Link>
            <Link href="/shipping" className={styles.link}>Shipping & Delivery</Link>
            <Link href="/returns" className={styles.link}>Returns & Refunds</Link>
            <Link href="/privacy-policy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
          </div>

          {/* Column 4: Newsletter */}
          <div className={styles.newsletterCol}>
            <h3 className={styles.colTitle}>Stay in the loop</h3>
            <p className={styles.newsletterText}>
              Subscribe for exclusive pet parent deals, new product launches, and expert care guides.
            </p>
            {subscribed ? (
              <div className={styles.subscribedMsg}>
                <CheckCircle2 size={18} />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <button type="submit" className={styles.submitBtn}>Subscribe</button>
              </form>
            )}
            <div className={styles.trustTag}>
              <ShieldCheck size={16} />
              <span>100% Safe & Secure Checkout</span>
            </div>
          </div>

        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="/privacy-policy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
            <Link href="/shipping" className={styles.legalLink}>Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
