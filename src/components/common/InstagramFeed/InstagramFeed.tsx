import Image from 'next/image';
import styles from './InstagramFeed.module.css';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const images = [
  '/ig-feed/1.png',
  '/ig-feed/2.png',
  '/ig-feed/3.png',
  '/ig-feed/4.png'
];

export function InstagramFeed() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <InstagramIcon className={styles.icon} />
          <h2 className={styles.title}>Join the Community</h2>
        </div>
        <p className={styles.subtitle}>Tag @KickAt or use #KickAtPets to be featured</p>
      </div>

      <div className={styles.grid}>
        {images.map((src, idx) => (
          <a href="#" key={idx} className={styles.imageLink}>
            <div className={styles.imageWrapper}>
              <Image 
                src={src} 
                alt={`Instagram community photo ${idx + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                className={styles.image}
              />
              <div className={styles.overlay}>
                <InstagramIcon className={styles.overlayIcon} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
