"use client";

import Link from 'next/link';
import Image from 'next/image';
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
  // Live dynamic settings fetched from backend GET /api/v1/settings/public
  const { general } = usePublicSettings();

  const storeName = general?.storeName || 'KickAt';
  const socialLinks = general?.socialLinks;

  const instagramUrl = socialLinks?.instagram?.trim();
  const facebookUrl = socialLinks?.facebook?.trim();
  const linkedinUrl = socialLinks?.linkedin?.trim();
  const youtubeUrl = socialLinks?.youtube?.trim();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          
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

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Dogs & Cats</h3>
            <Link href="/category/dogs/dog-accessories" className={styles.link}>Dog Accessories</Link>
            <Link href="/category/dogs/dog-food-treats" className={styles.link}>Dog Food & Treats</Link>
            <Link href="/category/dogs/dog-grooming-hygiene" className={styles.link}>Dog Grooming</Link>
            <Link href="/category/dogs/dog-feeding" className={styles.link}>Dog Feeding</Link>
            
            <Link href="/category/cats/cat-accessories" className={styles.link} style={{marginTop: '0.75rem'}}>Cat Accessories</Link>
            <Link href="/category/cats/cat-food" className={styles.link}>Cat Food</Link>
            <Link href="/category/cats/cat-grooming-hygiene" className={styles.link}>Cat Grooming</Link>
            <Link href="/category/cats/cat-feeding" className={styles.link}>Cat Feeding</Link>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Fish & Birds</h3>
            <Link href="/category/fish/aquarium-filtration" className={styles.link}>Aquarium Filtration</Link>
            <Link href="/category/fish/aquarium-pumps" className={styles.link}>Aquarium Pumps</Link>
            <Link href="/category/fish/aquarium-heating" className={styles.link}>Aquarium Heating</Link>
            <Link href="/category/fish/aquarium-lighting" className={styles.link}>Aquarium Lighting</Link>
            <Link href="/category/fish/aquarium-food" className={styles.link}>Aquarium Food</Link>
            <Link href="/category/fish/aquarium-care-medicine" className={styles.link}>Care & Medicine</Link>
            <Link href="/category/fish/aquarium-tools" className={styles.link}>Aquarium Tools</Link>
            
            <Link href="/category/birds/bird-feeding" className={styles.link} style={{marginTop: '0.75rem'}}>Bird Feeding</Link>
            <Link href="/category/birds/bird-food" className={styles.link}>Bird Food</Link>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Support</h3>
            <Link href="/faq" className={styles.link}>FAQ</Link>
            <Link href="/shipping" className={styles.link}>Shipping & Returns</Link>
            <Link href="/orders" className={styles.link}>Track Order</Link>
            <Link href="/contact" className={styles.link}>Contact Us</Link>
          </div>

          <div className={styles.newsletterCol}>
            <h3 className={styles.colTitle}>Stay in the loop</h3>
            <p className={styles.newsletterText}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className={styles.input}
                required
              />
              <button type="submit" className={styles.submitBtn}>Subscribe</button>
            </form>
          </div>

        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
