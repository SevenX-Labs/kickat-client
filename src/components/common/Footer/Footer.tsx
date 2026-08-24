"use client";

import Link from 'next/link';
import Image from 'next/image';
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

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink}>
              <Image 
                src="/logo.png" 
                alt="KickAt Logo" 
                width={180} 
                height={54} 
                className={styles.logo}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </Link>
            <p className={styles.tagline}>A bond that never ends.</p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" className={styles.socialLink} aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" className={styles.socialLink} aria-label="Twitter"><TwitterIcon /></a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Dogs & Cats</h4>
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
            <h4 className={styles.colTitle}>Fish & Birds</h4>
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
            <h4 className={styles.colTitle}>Support</h4>
            <Link href="/faq" className={styles.link}>FAQ</Link>
            <Link href="/shipping" className={styles.link}>Shipping & Returns</Link>
            <Link href="/track" className={styles.link}>Track Order</Link>
            <Link href="/contact" className={styles.link}>Contact Us</Link>
          </div>

          <div className={styles.newsletterCol}>
            <h4 className={styles.colTitle}>Stay in the loop</h4>
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
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} KickAt. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
