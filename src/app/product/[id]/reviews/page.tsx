"use client";

import { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Edit3 } from 'lucide-react';
import styles from './Reviews.module.css';

const INITIAL_REVIEWS = [
  { id: 1, author: 'Alex Morgan', rating: 5, date: 'August 12, 2026', title: 'Perfect for my golden retriever', content: 'The anti-slip base is a game changer. No more sliding bowls around the kitchen floor. Highly recommend this for medium to large dogs.' },
  { id: 2, author: 'Jamie L.', rating: 4, date: 'July 28, 2026', title: 'Good quality, slightly small', content: 'The ceramic is very high quality and easy to clean. Only giving 4 stars because it holds slightly less water than expected.' },
];

export default function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id || "1";
  
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Please fill out all fields.");
    
    const newReview = {
      id: Date.now(),
      author: 'You',
      rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title,
      content
    };
    
    setReviews([newReview, ...reviews]);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setRating(5);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href={`/product/${productId}`} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.title}>Customer Reviews</h1>
        </div>

        <div className={styles.dashboard}>
          <div className={styles.aggregateScore}>
            <div className={styles.bigScore}>4.8</div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={24} fill={s <= 4 ? "#E7A03B" : "none"} color={s <= 4 ? "#E7A03B" : "#ccc"} />)}
            </div>
            <div className={styles.totalReviews}>Based on 128 reviews</div>
          </div>
          
          <div className={styles.bars}>
            {[
              { stars: 5, percent: '80%', count: 102 },
              { stars: 4, percent: '15%', count: 19 },
              { stars: 3, percent: '3%', count: 4 },
              { stars: 2, percent: '1%', count: 1 },
              { stars: 1, percent: '1%', count: 2 },
            ].map(row => (
              <div key={row.stars} className={styles.barRow}>
                <span className={styles.starLabel}>{row.stars} <Star size={12} fill="#555" color="#555" /></span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: row.percent }} />
                </div>
                <span className={styles.barCount}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.listHeader}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Showing {reviews.length} reviews</h2>
            <button className={styles.writeBtn} onClick={() => setIsModalOpen(true)}>
              <Edit3 size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Write a Review
            </button>
          </div>

          <div style={{ background: '#fafafa', borderRadius: '16px', padding: '1.5rem', border: '1px solid #eaeaea' }}>
            {reviews.map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div>
                    <div className={styles.reviewerName}>{review.author}</div>
                    <div style={{ display: 'flex', gap: '0.15rem', marginTop: '0.25rem' }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= review.rating ? "#E7A03B" : "none"} color={s <= review.rating ? "#E7A03B" : "#ccc"} />)}
                    </div>
                  </div>
                  <div className={styles.reviewDate}>{review.date}</div>
                </div>
                <h3 className={styles.reviewTitle}>{review.title}</h3>
                <p className={styles.reviewText}>{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleSubmit}>
            <h2 className={styles.modalTitle}>Write a Review</h2>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Rating</label>
              <div className={styles.starRating}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" className={styles.starBtn} onClick={() => setRating(s)}>
                    <Star size={28} fill={s <= rating ? "#E7A03B" : "none"} color={s <= rating ? "#E7A03B" : "#ccc"} />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Review Title</label>
              <input type="text" className={styles.input} placeholder="Summarize your experience" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Review</label>
              <textarea className={styles.textarea} placeholder="What did you like or dislike?" value={content} onChange={e => setContent(e.target.value)} required />
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>Submit Review</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
