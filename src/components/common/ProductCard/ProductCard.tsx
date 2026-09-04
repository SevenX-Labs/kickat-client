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

const productDescriptions: Record<string, string> = {
  'd-1': 'Grain-free organic kibble formulated for optimal nutrition, digestion, and coat health.',
  'd-2': 'Heavyweight ceramic bowl with non-slip base, durable and dishwasher safe.',
  'd-3': 'Durable natural rubber chew toy designed for teething and active daily play.',
  'd-4': 'Reflective padded harness & leash set for safe, comfortable night walks.',
  'c-1': 'Wild salmon & tuna crunch treats packed with natural omega-3 fatty acids.',
  'c-2': 'Interactive spinning feather toy with USB rechargeable smart motor.',
  'c-3': 'Natural clumping tofu cat litter, 100% dust-free, flushable, and odor controlling.',
  'c-4': 'Whisker-friendly shallow ceramic dish designed for stress-free daily feeding.',
};

function getDescription(product: Product): string {
  return product.description || productDescriptions[product.id] || (product.tags && product.tags.length > 0 ? product.tags.join(' · ') : 'Premium quality pet essential curated for health & comfort.');
}

export default function ProductCard({ product, onRemoveFromWishlist }: ProductCardProps) {
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;
  const description = getDescription(product);
  
  // Calculate discount percentage if originalPrice exists
  const discountPercent = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.badge === 'Sale' ? 15 : null;

  return (
    <div className={styles.productCard}>
      {/* Left/Top Image Area with warm beige background */}
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

      {/* Middle Info Area */}
      <div className={styles.cardInfo}>
        {product.brand && <span className={styles.cardBrand}>{product.brand}</span>}
        <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>
        
        {/* Description (visible on Desktop List view) */}
        <p className={styles.cardDescription}>{description}</p>

        {/* Rating Row */}
        <div className={styles.cardRatingRow}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={14} 
                fill={star <= Math.floor(rating) ? "#FD802E" : star - rating < 1 ? "#FD802E" : "#E5E7EB"} 
                color={star <= Math.floor(rating) ? "#FD802E" : star - rating < 1 ? "#FD802E" : "#E5E7EB"} 
                strokeWidth={0} 
              />
            ))}
          </div>
          <span className={styles.cardRatingScore}>{rating.toFixed(1)}</span>
          <span className={styles.cardReviewsCount}>({reviewsCount})</span>
        </div>
      </div>

      {/* Right/Bottom Action Column: Price + Add to Cart Button */}
      <div className={styles.cardActionCol}>
        <div className={styles.priceContainer}>
          <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
          )}
          {discountPercent && (
            <span className={styles.discountTag}>{discountPercent}% OFF</span>
          )}
        </div>

        <button 
          className={styles.addToCartBtn}
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert(`Added ${product.name} to cart!`);
          }}
        >
          <ShoppingCart size={16} color="#ffffff" strokeWidth={2} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
