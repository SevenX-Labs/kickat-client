import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
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

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link 
      href={`/product/${product.id}`} 
      className={styles.productCard}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className={styles.imageSection}>
        {product.badge && (
          <div className={styles.badge}>
            {product.badge.toUpperCase()}
          </div>
        )}
        <button 
          className={styles.wishlistBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert(`Added ${product.name} to wishlist!`);
          }}
        >
          <Heart size={16} color="#666" strokeWidth={2} />
        </button>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={styles.productImage}
          />
        </div>
      </div>

      <div className={styles.contentSection}>
        <h3 className={styles.productTitle} title={product.name}>
          {product.name}
        </h3>
        
        <p className={styles.productDescription}>
          {product.description || `Premium ${product.subCategory.replace(/-/g, ' ')} for a healthier, happier pet.`}
        </p>

        <div className={styles.ratingRow}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span className={styles.ratingText}>
            <span className={styles.ratingValue}>{product.rating}</span>
            {product.reviewsCount && <span className={styles.reviewsCount}>({product.reviewsCount})</span>}
          </span>
          <span className={styles.ratingDivider}>|</span>
          <span className={styles.happyParents}>2.2K+ Happy Parents</span>
        </div>

        <div className={styles.footerRow}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          
          <button 
            className={styles.cartBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`Added ${product.name} to cart!`);
            }}
          >
            <ShoppingCart size={16} color="#fff" />
          </button>
        </div>
      </div>
    </Link>
  );
}
