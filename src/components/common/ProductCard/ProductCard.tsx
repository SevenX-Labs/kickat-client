import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
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
}

// Short description map for products to match ProductRow exact behavior
const productDescriptions: Record<string, string> = {
  'd-1': 'Grain-free organic kibble for a healthier, happier pup.',
  'd-2': 'Heavy ceramic bowl with non-slip grip, dishwasher safe.',
  'd-3': 'Durable natural rubber toy perfect for teething puppies.',
  'd-4': 'Reflective padded harness for safe nighttime walks.',
  'c-1': 'Wild salmon & tuna treats cats go crazy for.',
  'c-2': 'Spinning feather toy with USB rechargeable motor.',
  'c-3': 'Natural tofu clumping litter, dust-free & flushable.',
  'c-4': 'Whisker-friendly shallow dish for comfortable feeding.',
};

function getDescription(product: Product): string {
  return product.description || productDescriptions[product.id] || product.tags?.slice(0, 2).join(' · ') || 'Premium quality pet essential.';
}

export default function ProductCard({ product }: ProductCardProps) {
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 128;
  const description = getDescription(product);
  
  return (
    <div className={styles.productCard}>
      {/* Image area */}
      <div className={styles.cardImageArea}>
        {product.badge && (
          <span className={`${styles.cardBadge} ${
            product.badge === 'Popular' || product.badge === 'Organic' ? styles.badgeGreen : 
            product.badge === 'New' ? styles.badgeBrown : 
            product.badge === 'Sale' ? styles.badgeRed : styles.badgeGreen
          }`}>
            {product.badge === 'Popular' ? 'BEST SELLER' : product.badge === 'New' ? 'NEW ARRIVAL' : product.badge === 'Sale' ? 'SALE 15% OFF' : product.badge.toUpperCase()}
          </span>
        )}
        <button 
          className={styles.cardWishlistBtn} 
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert(`Added ${product.name} to wishlist!`);
          }}
        >
          <Heart size={16} color="#666" strokeWidth={1.5} />
        </button>
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

      {/* Info area */}
      <div className={styles.cardInfo}>
        <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>
        
        <div className={styles.cardRatingRow}>
          <Star size={13} fill="#E7A03B" color="#E7A03B" strokeWidth={0} />
          <span className={styles.cardRatingText}>{rating} ({reviewsCount})</span>
          <span className={styles.ratingDivider}>|</span>
          <span className={styles.happyParentsText}>2.2K+ Happy Parents</span>
        </div>
        
        <div className={styles.cardBottom}>
          <div className={styles.priceContainer}>
            <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                {product.badge === 'Sale' && <span className={styles.discountTag}>15% OFF</span>}
              </>
            )}
          </div>
          
          <button 
            className={`${styles.addToCartBtn} ${
              product.badge === 'Popular' || product.badge === 'Organic' ? styles.cartBtnGreen : 
              product.badge === 'New' ? styles.cartBtnBrown : 
              product.badge === 'Sale' ? styles.cartBtnRed : styles.cartBtnGreen
            }`}
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`Added ${product.name} to cart!`);
            }}
          >
            <ShoppingCart size={16} color="#fff" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
