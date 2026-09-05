"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, CheckCircle2, ThumbsUp, Edit3, Image as ImageIcon } from 'lucide-react';
import styles from './ReviewsDrawer.module.css';
import { Product } from './ProductDetail';

export interface ReviewItem {
  id: string;
  author: string;
  verified: boolean;
  rating: number;
  date: string;
  title: string;
  body: string;
  photos: string[];
  helpfulCount: number;
}

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Sarah Jenkins',
    verified: true,
    rating: 5,
    date: 'August 28, 2026',
    title: 'Transformed my Golden Retriever’s coat!',
    body: 'I have tried 4 different shampoos for Buddy, but this anti-hair fall formula is genuinely magical. After 3 washes, his shedding decreased drastically, and his coat is noticeably softer and shinier. Smells so refreshing!',
    photos: ['/hero-products/dog_food.png', '/hero-products/pet_toy.png'],
    helpfulCount: 24
  },
  {
    id: 'rev-2',
    author: 'Vikram Sharma',
    verified: true,
    rating: 5,
    date: 'August 22, 2026',
    title: 'Top tier quality & quick delivery',
    body: 'Packaging was 10/10. My cat usually hates bath time, but this shampoo lathers quickly and rinses off effortlessly. Very gentle on sensitive skin.',
    photos: ['/hero-products/pet_bowl.png'],
    helpfulCount: 18
  },
  {
    id: 'rev-3',
    author: 'Ananya Roy',
    verified: true,
    rating: 4,
    date: 'August 15, 2026',
    title: 'Great scent, very gentle',
    body: 'Smells incredible and natural without harsh chemical perfumes. Reduced fur flying around the house by at least half. Highly recommend for long-haired breeds!',
    photos: ['/hero-products/cat_treats.png'],
    helpfulCount: 12
  },
  {
    id: 'rev-4',
    author: 'Rohan Mehta',
    verified: true,
    rating: 5,
    date: 'August 10, 2026',
    title: 'Best purchase for pet care this year',
    body: 'Worth every rupee. The bottle design is non-slip so it’s super easy to hold with wet hands in the shower.',
    photos: [],
    helpfulCount: 9
  },
  {
    id: 'rev-5',
    author: 'Priya Nair',
    verified: true,
    rating: 5,
    date: 'August 02, 2026',
    title: 'Super soft fur and zero irritation!',
    body: 'My Persian cat Luna usually gets dry skin after washes, but this formula kept her skin hydrated and coat silky smooth. Will definitely reorder!',
    photos: ['/hero-products/pet_toy.png'],
    helpfulCount: 15
  },
  {
    id: 'rev-6',
    author: 'Kabir Das',
    verified: true,
    rating: 3,
    date: 'July 28, 2026',
    title: 'Decent product, good lather',
    body: 'Works well for cleaning. Smells nice, though hair fall reduction took about 2 weeks to show noticeable results.',
    photos: [],
    helpfulCount: 4
  }
];

const ALL_CUSTOMER_PHOTOS = [
  '/hero-products/dog_food.png',
  '/hero-products/pet_toy.png',
  '/hero-products/pet_bowl.png',
  '/hero-products/cat_treats.png',
  '/hero-products/bird_seed.png',
];

interface ReviewsDrawerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onWriteReview: () => void;
}

export function ReviewsDrawer({ product, isOpen, onClose, onWriteReview }: ReviewsDrawerProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | 'photos'>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredReviews = MOCK_REVIEWS.filter(rev => {
    if (selectedFilter === '5') return rev.rating === 5;
    if (selectedFilter === '4') return rev.rating === 4;
    if (selectedFilter === '3') return rev.rating <= 3;
    if (selectedFilter === 'photos') return rev.photos.length > 0;
    return true;
  });

  const toggleHelpful = (revId: string) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [revId]: !prev[revId]
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer */}
      <aside 
        className={styles.drawer} 
        aria-label="Customer Reviews Drawer"
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
      >
        
        {/* Sticky Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.title}>All Customer Reviews</h2>
            <div className={styles.badgeRating}>
              <Star size={13} fill="#FD802E" color="#FD802E" />
              <span>{product.rating || 4.8}</span>
            </div>
          </div>

          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close reviews drawer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          className={styles.contentScrollable} 
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
        >

          {/* Overview Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryScoreBlock}>
              <span className={styles.bigScore}>{product.rating || 4.8}</span>
              <div className={styles.scoreSub}>
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#FD802E" color="#FD802E" strokeWidth={1} />
                  ))}
                </div>
                <span className={styles.totalText}>Based on {product.reviewsCount || 142} reviews</span>
              </div>
            </div>

            <button type="button" className={styles.writeBtn} onClick={() => { onClose(); onWriteReview(); }}>
              <Edit3 size={14} />
              <span>Write Review</span>
            </button>
          </div>

          {/* Customer Photos Strip */}
          <div className={styles.photoSection}>
            <span className={styles.photoSectionTitle}>Customer Photos ({ALL_CUSTOMER_PHOTOS.length + 12})</span>
            <div className={styles.photoStrip}>
              {ALL_CUSTOMER_PHOTOS.map((src, idx) => (
                <div key={idx} className={styles.thumbTile} onClick={() => setPreviewPhoto(src)}>
                  <Image src={src} alt="Customer photo" fill sizes="72px" className={styles.thumbImg} />
                </div>
              ))}
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className={styles.filtersBar}>
            <button 
              type="button" 
              className={`${styles.filterPill} ${selectedFilter === 'all' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All ({MOCK_REVIEWS.length})
            </button>
            <button 
              type="button" 
              className={`${styles.filterPill} ${selectedFilter === '5' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('5')}
            >
              5 ★ ({MOCK_REVIEWS.filter(r => r.rating === 5).length})
            </button>
            <button 
              type="button" 
              className={`${styles.filterPill} ${selectedFilter === '4' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('4')}
            >
              4 ★ ({MOCK_REVIEWS.filter(r => r.rating === 4).length})
            </button>
            <button 
              type="button" 
              className={`${styles.filterPill} ${selectedFilter === '3' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('3')}
            >
              3 ★ & below ({MOCK_REVIEWS.filter(r => r.rating <= 3).length})
            </button>
            <button 
              type="button" 
              className={`${styles.filterPill} ${selectedFilter === 'photos' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('photos')}
            >
              <ImageIcon size={13} />
              With Photos ({MOCK_REVIEWS.filter(r => r.photos.length > 0).length})
            </button>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {filteredReviews.map((rev) => {
              const isVoted = !!helpfulVotes[rev.id];
              const helpfulVal = rev.helpfulCount + (isVoted ? 1 : 0);

              return (
                <div key={rev.id} className={styles.reviewCard}>
                  
                  {/* Card Header */}
                  <div className={styles.reviewCardHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {rev.author.charAt(0)}
                      </div>
                      <div className={styles.userNameBlock}>
                        <span className={styles.userName}>{rev.author}</span>
                        {rev.verified && (
                          <span className={styles.verifiedBadge}>
                            <CheckCircle2 size={11} /> Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={styles.reviewDate}>{rev.date}</span>
                  </div>

                  {/* Stars & Body */}
                  <div className={styles.reviewCardBody}>
                    <div className={styles.starsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={13} 
                          fill={i < rev.rating ? "#FD802E" : "#E0DCD4"} 
                          color={i < rev.rating ? "#FD802E" : "#E0DCD4"} 
                          strokeWidth={0} 
                        />
                      ))}
                    </div>

                    <h4 className={styles.reviewCardTitle}>{rev.title}</h4>
                    <p className={styles.reviewCardText}>{rev.body}</p>

                    {/* Attached Photo Thumbnails */}
                    {rev.photos.length > 0 && (
                      <div className={styles.reviewPhotoRow}>
                        {rev.photos.map((photo, i) => (
                          <div key={i} className={styles.reviewPhotoThumb} onClick={() => setPreviewPhoto(photo)}>
                            <Image src={photo} alt="Attached review photo" fill sizes="56px" className={styles.thumbImg} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Helpful Action */}
                  <button 
                    type="button" 
                    className={`${styles.helpfulBtn} ${isVoted ? styles.helpfulActive : ''}`}
                    onClick={() => toggleHelpful(rev.id)}
                  >
                    <ThumbsUp size={12} />
                    <span>Helpful ({helpfulVal})</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </aside>

      {/* Expanded Photo Preview Modal */}
      {previewPhoto && (
        <div className={styles.imageModalBackdrop} onClick={() => setPreviewPhoto(null)}>
          <div className={styles.imageModalCard} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.imageModalClose} onClick={() => setPreviewPhoto(null)}>
              <X size={20} />
            </button>
            <Image src={previewPhoto} alt="Preview customer photo" fill style={{ objectFit: 'cover' }} priority />
          </div>
        </div>
      )}
    </>
  );
}
