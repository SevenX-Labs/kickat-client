"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingCart, 
  Zap, 
  Minus, 
  Plus, 
  Check, 
  Loader2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { BackendProductVariant } from '@/types/product';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './VariantSelectorModal.module.css';

export interface VariantSelectorProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  mainCategory?: string;
  stock?: number;
  type?: 'SIMPLE' | 'VARIABLE';
  slug?: string;
  variants?: BackendProductVariant[];
}

export interface VariantSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: VariantSelectorProduct;
  onAddToCartSuccess?: () => void;
}

export function VariantSelectorModal({
  isOpen,
  onClose,
  product,
  onAddToCartSuccess,
}: VariantSelectorModalProps) {
  const router = useRouter();
  const { addToCart, buyNow } = useCart();
  const { isAuthenticated } = useAuth();

  const [variants, setVariants] = useState<BackendProductVariant[]>(product.variants || []);
  const [selectedVariant, setSelectedVariant] = useState<BackendProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch variants when opened if not already present
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null);
      setQuantity(1);
      setErrorMsg(null);
      return;
    }

    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants);
      const defaultVar = product.variants.find((v) => v.isDefault && v.stock > 0) 
        || product.variants.find((v) => v.isDefault)
        || null;
      setSelectedVariant(defaultVar);
    } else {
      setIsLoadingVariants(true);
      productService.getProductVariants(product.id)
        .then((res) => {
          if (res.success && Array.isArray(res.variants)) {
            setVariants(res.variants);
            const defaultVar = res.variants.find((v) => v.isDefault && v.stock > 0)
              || res.variants.find((v) => v.isDefault)
              || null;
            setSelectedVariant(defaultVar);
          }
        })
        .catch((err) => {
          console.error("Failed to load product variants:", err);
          setErrorMsg("Failed to load options. Please try opening the product page.");
        })
        .finally(() => {
          setIsLoadingVariants(false);
        });
    }
  }, [isOpen, product.id, product.variants]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPrice = selectedVariant
    ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price)
    : product.price;

  const currentOriginalPrice = selectedVariant
    ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.price : undefined)
    : product.originalPrice;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : null;

  const activeImage = selectedVariant?.imageUrl 
    || (selectedVariant?.images && selectedVariant.images[0])
    || product.image 
    || '/hero-products/dog_food.png';

  const maxStock = selectedVariant ? selectedVariant.stock : (product.stock ?? 1);
  const isSelectedOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

  const handleSelectVariant = (variant: BackendProductVariant) => {
    if (variant.stock <= 0) return;
    setSelectedVariant(variant);
    setErrorMsg(null);
    if (quantity > variant.stock) {
      setQuantity(Math.max(1, variant.stock));
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant) {
      setErrorMsg("Please select an option before adding to cart.");
      return;
    }

    if (selectedVariant.stock <= 0) {
      setErrorMsg("The selected option is out of stock.");
      return;
    }

    setIsAdding(true);
    setErrorMsg(null);

    try {
      await addToCart(product.id, selectedVariant.id, quantity);
      window.dispatchEvent(new CustomEvent('cart-item-added'));
      onAddToCartSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Add to cart error:", err);
      setErrorMsg(err?.message || "Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant) {
      setErrorMsg("Please select an option before proceeding.");
      return;
    }

    if (selectedVariant.stock <= 0) {
      setErrorMsg("The selected option is out of stock.");
      return;
    }

    if (!isAuthenticated) {
      onClose();
      router.push(`/login?redirect=${encodeURIComponent('/checkout/place-order')}`);
      return;
    }

    setIsBuyingNow(true);
    setErrorMsg(null);

    try {
      await buyNow(product.id, selectedVariant.id, quantity);
      onClose();
      router.push('/checkout/place-order');
    } catch (err: any) {
      console.error("Buy now error:", err);
      setErrorMsg(err?.message || "Failed to proceed to checkout. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close options modal"
        >
          <X size={18} />
        </button>

        {/* Product Header */}
        <div className={styles.productHeader}>
          <div className={styles.imageWrap}>
            <SafeImage
              src={activeImage}
              productName={product.name}
              categoryName={product.mainCategory}
              alt={product.name}
              fill
              className={styles.productThumb}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className={styles.productMeta}>
            <span className={styles.brandBadge}>
              {product.brand || product.mainCategory || 'KickAt'}
            </span>
            <h3 className={styles.productTitle}>{product.name}</h3>

            <div className={styles.priceRow}>
              <span className={styles.activePrice}>₹{currentPrice.toLocaleString()}</span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className={styles.originalPrice}>₹{currentOriginalPrice.toLocaleString()}</span>
              )}
              {discountPercent && (
                <span className={styles.discountBadge}>{discountPercent}% OFF</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className={styles.scrollArea}>
          {isLoadingVariants ? (
            <div className={styles.loadingContainer}>
              <Loader2 size={24} className="animate-spin" color="#F99205" />
              <span>Loading available options...</span>
            </div>
          ) : variants.length === 0 ? (
            <div className={styles.loadingContainer}>
              <AlertCircle size={24} color="#DC2626" />
              <span>No options found for this product.</span>
            </div>
          ) : (
            <>
              {/* Option Selector Title */}
              <div className={styles.sectionTitleRow}>
                <h4 className={styles.sectionTitle}>Select Option / Pack Size:</h4>
                {selectedVariant && (
                  <span className={styles.selectedVariantHint}>
                    {selectedVariant.name}
                  </span>
                )}
              </div>

              {/* Variants List */}
              <div className={styles.variantsList}>
                {variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isOutOfStock = variant.stock <= 0;
                  const varEffectivePrice = variant.discountPrice && variant.discountPrice > 0 
                    ? variant.discountPrice 
                    : variant.price;

                  // Extract human friendly label (attributes e.g. packsize / weight or variant name)
                  let displayAttr = variant.name;
                  if (variant.attributes && typeof variant.attributes === 'object') {
                    const vals = Object.values(variant.attributes).filter(Boolean);
                    if (vals.length > 0) {
                      displayAttr = String(vals[0]);
                    }
                  }

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleSelectVariant(variant)}
                      className={`${styles.variantCard} ${isSelected ? styles.variantCardSelected : ''} ${isOutOfStock ? styles.outOfStock : ''}`}
                    >
                      <div className={styles.variantLeft}>
                        <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}>
                          {isSelected && <div className={styles.radioDot} />}
                        </div>
                        <div className={styles.variantNameGroup}>
                          <span className={styles.variantName}>{displayAttr}</span>
                          {variant.sku && (
                            <span className={styles.variantSku}>SKU: {variant.sku}</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.variantRight}>
                        <span className={styles.variantPrice}>₹{varEffectivePrice.toLocaleString()}</span>
                        {isOutOfStock ? (
                          <span className={styles.outOfStockText}>Out of Stock</span>
                        ) : variant.stock <= 5 ? (
                          <span className={`${styles.variantStockBadge} ${styles.lowStock}`}>
                            Only {variant.stock} left
                          </span>
                        ) : (
                          <span className={styles.variantStockBadge}>In Stock</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity Stepper */}
              {selectedVariant && !isSelectedOutOfStock && (
                <div className={styles.quantityRow}>
                  <span className={styles.quantityLabel}>Quantity</span>
                  <div className={styles.quantityStepper}>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isAdding || isBuyingNow}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                      disabled={quantity >= maxStock || isAdding || isBuyingNow}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#DC2626',
              background: '#FEE2E2',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              marginTop: '10px',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            disabled={isAdding || isBuyingNow || !selectedVariant || isSelectedOutOfStock}
          >
            {isAdding ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Adding to Cart...</span>
              </>
            ) : !selectedVariant ? (
              <span>Select an Option</span>
            ) : isSelectedOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Add to Cart • ₹{(currentPrice * quantity).toLocaleString()}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
            disabled={isBuyingNow || isAdding || !selectedVariant || isSelectedOutOfStock}
          >
            {isBuyingNow ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={16} fill="#ffffff" color="#ffffff" />
                <span>Buy Now</span>
              </>
            )}
          </button>

          <Link
            href={`/product/${product.slug || product.id}${selectedVariant ? `?variant=${selectedVariant.id}` : ''}`}
            className={styles.viewDetailsLink}
            onClick={onClose}
          >
            <span>View full product details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VariantSelectorModal;
