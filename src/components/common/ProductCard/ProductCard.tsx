import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, Trash2 } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  mainCategory: string;
  subCategory: string;
  brand?: string;
  badge?: string;
  tags?: string[];
  sizes?: string[];
  color?: string;
  isTopRated?: boolean;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onRemoveFromWishlist?: (id: string) => void;
}

export default function ProductCard({ product, onRemoveFromWishlist }: ProductCardProps) {
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;
  
  // Calculate discount percentage if originalPrice exists
  const discountPercent = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.badge === 'Sale' ? 15 : null;

  return (
    <div className={styles.productCard}>
      {/* Top Image Area with warm beige background */}
      <div className={styles.cardImageArea}>
        {product.badge && (
          <span className={styles.cardBadge}>
            {product.badge === 'Popular' ? 'Best Seller' : product.badge === 'New' ? 'New Arrival' : product.badge === 'Sale' ? 'Sale 15% OFF' : product.badge}
          </span>
        )}
        {onRemoveFromWishlist ? (
          <button 
            className={styles.cardRemoveBtn} 
            aria-label="Remove from wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemoveFromWishlist(product.id);
            }}
          >
            <Trash2 size={15} strokeWidth={2} color="#C34A42" />
          </button>
        ) : (
          <button 
            className={styles.cardWishlistBtn} 
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`Added ${product.name} to wishlist!`);
            }}
          >
            <Heart size={15} color="#111827" strokeWidth={1.8} />
          </button>
        )}
        <Link href={`/product/${product.id}`} className={styles.cardImageLink}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={styles.cardImage}
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* Info Area */}
      <div className={styles.cardInfo}>
        <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>
        
        {/* Rating Row */}
        <div className={styles.cardRatingRow}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={13} 
                fill={star <= Math.floor(rating) ? "#FD802E" : star - rating < 1 ? "#FD802E" : "#E5E7EB"} 
                color={star <= Math.floor(rating) ? "#FD802E" : star - rating < 1 ? "#FD802E" : "#E5E7EB"} 
                strokeWidth={0} 
              />
            ))}
          </div>
          <span className={styles.cardRatingScore}>{rating.toFixed(1)}</span>
          <span className={styles.cardReviewsCount}>({reviewsCount})</span>
        </div>
        
        {/* Price & Discount Row */}
        <div className={styles.priceContainer}>
          <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
          )}
          {discountPercent && (
            <span className={styles.discountTag}>{discountPercent}% OFF</span>
          )}
        </div>

        {/* Full-width Add to Cart Button */}
        <button 
          className={styles.addToCartBtn}
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert(`Added ${product.name} to cart!`);
          }}
        >
          <ShoppingCart size={15} color="#ffffff" strokeWidth={2} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
