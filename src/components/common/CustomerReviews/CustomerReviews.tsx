import { Star } from 'lucide-react';
import styles from './CustomerReviews.module.css';

const reviews = [
  {
    author: "Sarah & Max (Golden Retriever)",
    content: "KickAt completely transformed Max's digestion. The quality of the food is unmatched and the delivery is always perfectly on time.",
    rating: 5,
    verified: true
  },
  {
    author: "James & Luna (Bengal Cat)",
    content: "I've never seen Luna so excited for meal time. The treats are her absolute favorite, and I love that they are made with clean ingredients.",
    rating: 5,
    verified: true
  },
  {
    author: "Emily & Charlie (French Bulldog)",
    content: "The toys are incredibly durable and beautifully designed. Finally, pet accessories that actually look good in my apartment!",
    rating: 5,
    verified: true
  }
];

export function CustomerReviews() {
  return (
    <section id="reviews" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Happy Pets. Happier Humans.</h2>
          <p className={styles.subtitle}>
            Join thousands of pet parents who trust KickAt for their furry family members.
          </p>
        </div>

        <div className={styles.grid}>
          {reviews.map((review, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.rating}>
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className={styles.star} fill="#F5821F" color="#F5821F" />
                ))}
              </div>
              <p className={styles.content}>&ldquo;{review.content}&rdquo;</p>
              <div className={styles.authorWrapper}>
                <span className={styles.author}>{review.author}</span>
                {review.verified && (
                  <span className={styles.verified}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.verifiedIcon}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4CAF50"/>
                    </svg>
                    Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
