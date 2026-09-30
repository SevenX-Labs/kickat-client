"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { profileService } from "@/services/profileService";
import { productService, DeliveryEstimateResponse } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Star, ShoppingBag, Zap, Ruler, Minus, Plus, Check, X, Dog, Droplets, Waves, Sun, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./ProductDetail.module.css";
import { Product, ProductVariant } from "./ProductDetail";

interface ProductInfoProps {
  selectedVariant?: ProductVariant | null;
  onSelectVariant?: (variant: ProductVariant) => void;
  product: Product;
}

interface DefaultAddressInfo {
  city: string;
  state: string;
  pincode: string;
}

export function ProductInfo({ product, selectedVariant, onSelectVariant }: ProductInfoProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);

  // Customer Delivery Estimate State
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddressInfo | null>(null);
  const [activePincode, setActivePincode] = useState<string | null>(null);
  const [activeCityState, setActiveCityState] = useState<string | null>(null);
  const [isUsingDefaultAddress, setIsUsingDefaultAddress] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isChangingPincode, setIsChangingPincode] = useState(false);
  const [isInitializingAddress, setIsInitializingAddress] = useState(true);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimateResponse | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const fetchDeliveryEstimate = useCallback(async (pincodeToCheck: string, variantId?: string) => {
    const cleanPin = (pincodeToCheck || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setDeliveryError("Enter a valid 6-digit pincode.");
      setDeliveryEstimate(null);
      return;
    }

    setDeliveryError(null);
    setDeliveryEstimate(null);
    setIsCheckingDelivery(true);

    try {
      const res = await productService.getDeliveryEstimate({
        pincode: cleanPin,
        productId: product.id,
        variantId: variantId !== undefined ? variantId : selectedVariant?.id,
        weight: selectedVariant?.shippingWeightKg || undefined,
      });

      if (res && res.available && res.formattedDate) {
        setDeliveryEstimate(res);
        setActivePincode(cleanPin);
        setIsChangingPincode(false);
        try {
          localStorage.setItem("kickat_delivery_pincode", cleanPin);
        } catch {
          // storage fallback
        }
      } else {
        setDeliveryEstimate(null);
        setDeliveryError(res?.message || "Delivery is currently unavailable for this pincode.");
      }
    } catch {
      setDeliveryEstimate(null);
      setDeliveryError("Couldn't check delivery right now. Please try again.");
    } finally {
      setIsCheckingDelivery(false);
    }
  }, [product.id, selectedVariant?.id, selectedVariant?.shippingWeightKg]);

  // 1. Initialize address & delivery estimate (Default Address > Remembered Pincode > Input Form)
  useEffect(() => {
    let isMounted = true;

    const initializeAddressAndDelivery = async () => {
      try {
        if (isAuthenticated) {
          try {
            const res: any = await profileService.getProfile();
            if (!isMounted) return;
            const addrs = res?.user?.addresses || res?.addresses || [];
            if (Array.isArray(addrs) && addrs.length > 0) {
              const def = addrs.find((a: any) => a.isDefault) || addrs[0];
              if (def && def.pincode && /^[1-9][0-9]{5}$/.test(def.pincode.trim())) {
                const cleanPin = def.pincode.trim();
                const cityState = [def.city, def.state].filter(Boolean).join(", ");
                setDefaultAddress({
                  city: def.city,
                  state: def.state,
                  pincode: cleanPin,
                });
                setActivePincode(cleanPin);
                setActiveCityState(cityState || null);
                setIsUsingDefaultAddress(true);
                setPincodeInput(cleanPin);
                fetchDeliveryEstimate(cleanPin, selectedVariant?.id);
                return;
              }
            }
          } catch (err) {
            console.warn("Failed to fetch user default address:", err);
          }
        }

        // If not authenticated or no default address found, check remembered pincode in localStorage
        try {
          const saved = localStorage.getItem("kickat_delivery_pincode");
          if (saved && /^[1-9][0-9]{5}$/.test(saved.trim())) {
            const cleanPin = saved.trim();
            setActivePincode(cleanPin);
            setActiveCityState(null);
            setIsUsingDefaultAddress(false);
            setPincodeInput(cleanPin);
            fetchDeliveryEstimate(cleanPin, selectedVariant?.id);
            return;
          }
        } catch {
          // storage fallback
        }
      } finally {
        if (isMounted) {
          setIsInitializingAddress(false);
        }
      }
    };

    initializeAddressAndDelivery();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchDeliveryEstimate, selectedVariant?.id]);

  // 2. Re-check estimate whenever variant changes (never reuse estimate across variants)
  const prevVariantIdRef = useRef<string | undefined>(selectedVariant?.id);
  useEffect(() => {
    if (prevVariantIdRef.current !== selectedVariant?.id) {
      prevVariantIdRef.current = selectedVariant?.id;
      if (activePincode) {
        setDeliveryEstimate(null);
        fetchDeliveryEstimate(activePincode, selectedVariant?.id);
      }
    }
  }, [selectedVariant?.id, activePincode, fetchDeliveryEstimate]);

  const handleCheckPincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeInput.trim();
    if (defaultAddress && cleanPin === defaultAddress.pincode) {
      setIsUsingDefaultAddress(true);
      setActiveCityState([defaultAddress.city, defaultAddress.state].filter(Boolean).join(", "));
    } else {
      setIsUsingDefaultAddress(false);
      setActiveCityState(null);
    }
    fetchDeliveryEstimate(cleanPin, selectedVariant?.id);
  };

  // Dynamic pricing & stock based on selected variant or base product
  const effectivePrice = selectedVariant
    ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price)
    : product.price;

  const effectiveOriginalPrice = selectedVariant
    ? (selectedVariant.originalPrice || (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.price : undefined))
    : product.originalPrice;

  const currentStock = selectedVariant && selectedVariant.stock !== undefined
    ? selectedVariant.stock
    : (product.stock ?? 100);

  const isOutOfStock = currentStock <= 0;

  const discountPercent = effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
    ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
    : null;

  const title = product.name;
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount || 0;
  const description = product.description || product.descriptionTitle || "Premium quality pet essential curated for health, safety, and everyday comfort.";

  const variants = product.variants || [];
  const hasVariants = (product.type === "VARIABLE" || variants.length > 0) && variants.length > 0;

  const animateFlyToCart = (startElem: HTMLElement) => {
    const bottomNavCart = document.getElementById("bottom-nav-cart-btn");
    const topNavbarCart = document.getElementById("navbar-cart-btn");
    const cartBtn = (bottomNavCart && window.getComputedStyle(bottomNavCart).display !== "none" && bottomNavCart.offsetWidth > 0)
      ? bottomNavCart
      : topNavbarCart;
    const imageSrc = (selectedVariant?.imageUrl || selectedVariant?.images?.[0]) || product.image || "/hero-products/dog_food.png";

    if (!cartBtn) {
      window.dispatchEvent(new CustomEvent("cart-item-added"));
      return;
    }

    const startRect = startElem.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    const flyingImg = document.createElement("img");
    flyingImg.src = imageSrc;
    flyingImg.alt = "Flying Product Preview";
    flyingImg.onerror = () => { flyingImg.src = "/hero-products/dog_food.png"; };

    const width = 64;
    const height = 64;
    const startX = startRect.left + startRect.width / 2 - width / 2;
    const startY = startRect.top + startRect.height / 2 - height / 2;
    const endX = endRect.left + endRect.width / 2 - 20;
    const endY = endRect.top + endRect.height / 2 - 20;

    Object.assign(flyingImg.style, {
      position: "fixed",
      top: `${startY}px`,
      left: `${startX}px`,
      width: `${width}px`,
      height: `${height}px`,
      objectFit: "cover",
      borderRadius: "16px",
      boxShadow: "0 12px 30px rgba(249, 146, 5, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)",
      border: "2.5px solid #ffffff",
      zIndex: "99999",
      pointerEvents: "none",
      backgroundColor: "#ffffff",
    });

    document.body.appendChild(flyingImg);

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const animation = flyingImg.animate(
      [
        {
          transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
          opacity: 1,
        },
        {
          offset: 0.45,
          transform: `translate3d(${deltaX * 0.45}px, ${deltaY * 0.45 - 140}px, 0) scale(0.72) rotate(-12deg)`,
          opacity: 0.95,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.12) rotate(-30deg)`,
          opacity: 0.1,
        },
      ],
      {
        duration: 1800,
        easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
        fill: "forwards",
      }
    );

    animation.onfinish = () => {
      flyingImg.remove();
      window.dispatchEvent(new CustomEvent("cart-item-added"));
    };
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasAdded) {
      router.push("/cart");
      return;
    }
    if (hasVariants && !selectedVariant) {
      alert("Please select an option before adding to cart.");
      return;
    }
    if (isAdding || isBuyingNow || isOutOfStock) return;
    const buttonElem = e.currentTarget;
    setIsAdding(true);
    try {
      await addToCart(product.id, selectedVariant?.id, quantity);
      animateFlyToCart(buttonElem);
      setHasAdded(true);
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      alert(err?.message || "Could not add item to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (hasVariants && !selectedVariant) {
      alert("Please select an option before proceeding to checkout.");
      return;
    }
    if (isBuyingNow || isAdding || isOutOfStock) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout/place-order")}`);
      return;
    }
    setIsBuyingNow(true);
    try {
      await addToCart(product.id, selectedVariant?.id, quantity);
      router.push("/checkout/place-order");
    } catch (err: any) {
      console.error("Error with Buy Now:", err);
      alert(err?.message || "Could not proceed to checkout. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Product Title */}
      <h1 className={styles.productTitle}>{title}</h1>

      {/* Brand / Category Tagline */}
      <p className={styles.productSubtitle}>
        {product.brand ? `${product.brand} · ` : ""}{product.mainCategory || "KickAt Essential"}
      </p>

      {/* Rating & Social Proof Row */}
      <div className={styles.ratingRow}>
        {reviewsCount > 0 && rating > 0 ? (
          <>
            <div className={styles.starsGroup}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={15} 
                  fill={i < Math.floor(rating) ? "#F99205" : "#E5E7EB"} 
                  color={i < Math.floor(rating) ? "#F99205" : "#E5E7EB"} 
                  strokeWidth={0} 
                />
              ))}
              <span className={styles.ratingScore}>{rating.toFixed(1)}</span>
            </div>
            <span className={styles.ratingDivider}>|</span>
            <span className={styles.reviewsCountText}>
              {reviewsCount} {reviewsCount === 1 ? "Review" : "Reviews"}
            </span>
          </>
        ) : (
          <span className={styles.reviewsCountText}>No reviews yet</span>
        )}
        {product.badge && (
          <span className={styles.verifiedBadge}>
            <Check size={12} strokeWidth={2.5} />
            <span>{product.badge}</span>
          </span>
        )}
      </div>

      {/* Price Row */}
      <div className={styles.priceContainer}>
        <div className={styles.priceRowMain}>
          <span className={styles.currentPrice}>₹{effectivePrice.toLocaleString()}</span>
          {effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice && (
            <span className={styles.originalPrice}>₹{effectiveOriginalPrice.toLocaleString()}</span>
          )}
          {discountPercent && (
            <span className={styles.discountBadge}>{discountPercent}% OFF</span>
          )}
        </div>
        <span className={styles.taxNote}>Inclusive of all taxes</span>
      </div>

      {/* Amazon-style Variety / Option Selector for VARIABLE Products */}
      {hasVariants && (
        <div className={styles.selectorBlock}>
          <div className={styles.selectorHeaderWithLink}>
            <div className={styles.selectorHeader}>
              <span className={styles.selectorTitle}>Select Variety / Size:</span>
              <span className={styles.selectorValue}>
                {selectedVariant ? (selectedVariant.attributes && Object.values(selectedVariant.attributes)[0] ? String(Object.values(selectedVariant.attributes)[0]) : selectedVariant.name) : "Select an option"}
              </span>
            </div>
            <button
              type="button"
              className={styles.sizeGuideRowLink}
              onClick={() => setIsSizeGuideModalOpen(true)}
            >
              <Ruler size={14} />
              <span>Guide</span>
            </button>
          </div>

          <div className={styles.varietyCardsGrid}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isVarOutOfStock = variant.stock <= 0;
              const varPrice = variant.discountPrice && variant.discountPrice > 0 ? variant.discountPrice : variant.price;
              const varOrigPrice = variant.originalPrice || (variant.discountPrice && variant.discountPrice > 0 ? variant.price : undefined);
              const varDiscount = varOrigPrice && varOrigPrice > varPrice
                ? Math.round(((varOrigPrice - varPrice) / varOrigPrice) * 100)
                : null;
              
              let displayLabel = variant.name;
              if (variant.attributes && typeof variant.attributes === "object") {
                const vals = Object.values(variant.attributes).filter(Boolean);
                if (vals.length > 0) {
                  displayLabel = String(vals[0]);
                }
              }

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isVarOutOfStock}
                  className={`${styles.varietyOptionCard} ${isSelected ? styles.varietyOptionCardActive : ""} ${isVarOutOfStock ? styles.varietyOptionCardDisabled : ""}`}
                  onClick={() => onSelectVariant?.(variant)}
                  aria-pressed={isSelected}
                  title={isVarOutOfStock ? `${displayLabel} (Out of stock)` : `${displayLabel} - ₹${varPrice}`}
                >
                  <div className={styles.varietyCardName}>
                    <span>{displayLabel}</span>
                    {isSelected && <Check size={13} strokeWidth={3} color="#F99205" />}
                  </div>
                  <div className={styles.varietyCardPriceRow}>
                    <span className={styles.varietyCardPrice}>₹{varPrice.toLocaleString()}</span>
                    {varOrigPrice && varOrigPrice > varPrice && (
                      <span className={styles.varietyCardOrigPrice}>₹{varOrigPrice.toLocaleString()}</span>
                    )}
                  </div>
                  {varDiscount ? (
                    <span className={styles.varietyCardDiscount}>{varDiscount}% OFF</span>
                  ) : isVarOutOfStock ? (
                    <span className={styles.varietyStockText}>Out of stock</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Stock Row */}
      <div className={styles.quantityStockRow}>
        <div className={styles.quantityStepper}>
          <button
            type="button"
            className={styles.stepperBtn}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type="button"
            className={styles.stepperBtn}
            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className={styles.stockStatusBox}>
          {isOutOfStock ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />
              <span style={{ fontWeight: 700, color: "#DC2626" }}>Out of Stock</span>
            </>
          ) : currentStock <= 5 ? (
            <>
              <span className={styles.greenDot} />
              <span className={styles.stockBold}>In Stock</span>
              <span className={styles.lowStockBadge}>Only {currentStock} left</span>
            </>
          ) : (
            <>
              <span className={styles.greenDot} />
              <span className={styles.stockBold}>In Stock</span>
            </>
          )}
        </div>
      </div>

      {/* Compact Customer Delivery Estimate Section */}
      <div className={styles.deliveryEstimateSection}>
        {isInitializingAddress ? (
          <>
            <div className={styles.deliveryHeaderRow}>
              <span className={styles.deliveryIcon}>🚚</span>
              <span className={styles.deliveryHeading}>Delivery</span>
            </div>
            <div className={styles.deliverySkeletonWrap}>
              <Skeleton style={{ height: "14px", width: "55%", borderRadius: "4px" }} />
              <Skeleton style={{ height: "20px", width: "42%", borderRadius: "6px", marginTop: "4px" }} />
            </div>
          </>
        ) : activePincode && !isChangingPincode ? (
          <>
            <div className={styles.deliveryHeaderRow}>
              <span className={styles.deliveryIcon}>🚚</span>
              <span className={styles.deliveryHeading}>Delivery</span>
            </div>
            <div className={styles.deliverToRow}>
              <div className={styles.deliverToLocationWrap}>
                {isUsingDefaultAddress && activeCityState ? (
                  <>
                    <span className={styles.deliverToLabel}>
                      Deliver to <strong>{activeCityState}</strong>
                    </span>
                    <span className={styles.deliverToPincode}>{activePincode}</span>
                  </>
                ) : (
                  <span className={styles.deliverToLabel}>
                    Deliver to pincode <strong>{activePincode}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                className={styles.deliveryChangeBtn}
                onClick={() => {
                  setIsChangingPincode(true);
                  setPincodeInput(activePincode);
                  setDeliveryError(null);
                }}
              >
                Change
              </button>
            </div>
            {isCheckingDelivery ? (
              <div className={styles.deliveryLoadingBadge}>
                <Loader2 size={13} className="animate-spin" style={{ color: "#F15722" }} />
                <span>Checking delivery date...</span>
              </div>
            ) : deliveryError ? (
              <div className={styles.deliveryErrorText}>{deliveryError}</div>
            ) : deliveryEstimate && deliveryEstimate.formattedDate ? (
              <div className={styles.deliverySuccessText}>
                <span className={styles.deliveryCheckIcon}>✓</span>
                <span>Delivery by <strong>{deliveryEstimate.formattedDate}</strong></span>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className={styles.deliveryHeaderRow}>
              <span className={styles.deliveryIcon}>🚚</span>
              <span className={styles.deliveryHeading}>Check delivery availability</span>
            </div>
            <form onSubmit={handleCheckPincodeSubmit} className={styles.deliveryInputRow}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => {
                  setPincodeInput(e.target.value.replace(/\D/g, ""));
                  setDeliveryError(null);
                }}
                placeholder="Enter pincode"
                className={styles.deliveryPincodeInput}
                disabled={isCheckingDelivery}
                aria-label="Enter pincode"
                autoFocus={isChangingPincode}
              />
              <button
                type="submit"
                className={styles.deliveryCheckBtn}
                disabled={isCheckingDelivery || pincodeInput.trim().length !== 6}
              >
                {isCheckingDelivery ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Check"
                )}
              </button>
              {isChangingPincode && activePincode && (
                <button
                  type="button"
                  className={styles.deliveryCancelChangeBtn}
                  onClick={() => {
                    setIsChangingPincode(false);
                    setDeliveryError(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
            {isCheckingDelivery ? (
              <div className={styles.deliveryLoadingBadge}>
                <Loader2 size={13} className="animate-spin" style={{ color: "#F15722" }} />
                <span>Checking delivery availability...</span>
              </div>
            ) : deliveryError ? (
              <div className={styles.deliveryErrorText}>{deliveryError}</div>
            ) : (
              <p className={styles.deliveryHelperText}>
                Enter your pincode to see estimated delivery.
              </p>
            )}
          </>
        )}
      </div>

      {/* Primary CTAs Row (Add to Cart + Buy Now) */}
      <div className={styles.primaryCtasRow}>
        <button
          type="button"
          className={`${styles.addToCartMainBtn} ${hasAdded ? styles.addedState : ""}`}
          onClick={handleAddToCart}
          disabled={isAdding || isBuyingNow || isOutOfStock || (hasVariants && !selectedVariant)}
        >
          {isAdding ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Adding...</span>
            </span>
          ) : hasAdded ? (
            <>
              <Check size={18} />
              <span>Go to Cart</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : hasVariants && !selectedVariant ? (
            <span>Select an Option</span>
          ) : (
            <>
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.buyNowMainBtn}
          onClick={handleBuyNow}
          disabled={isBuyingNow || isAdding || isOutOfStock || (hasVariants && !selectedVariant)}
          style={{ opacity: (isOutOfStock || (hasVariants && !selectedVariant)) ? 0.5 : 1 }}
        >
          {isBuyingNow ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Processing...</span>
            </span>
          ) : (
            <>
              <Zap size={18} fill="#ffffff" color="#ffffff" />
              <span>Buy Now</span>
            </>
          )}
        </button>
      </div>

      {/* Size Guide Dialogue Box Modal */}
      {isSizeGuideModalOpen && (
        <div className={styles.sizeModalBackdrop} onClick={() => setIsSizeGuideModalOpen(false)}>
          <div className={styles.sizeModalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.sizeModalCloseBtn}
              onClick={() => setIsSizeGuideModalOpen(false)}
              aria-label="Close size guide"
            >
              <X size={18} />
            </button>

            <div className={styles.sizeModalHeader}>
              <h3 className={styles.sizeModalTitle}>Size Guide &amp; Recommendations</h3>
              <p className={styles.sizeModalSubtitle}>Find the perfect fit for your pet by weight and breed.</p>
            </div>

            <div className={styles.sizeCardsRow}>
              <div className={styles.sizeCardTile}>
                <span className={styles.sizeCardLetter}>S</span>
                <span className={styles.sizeCardWeight}>Up to 5 kg</span>
                <div className={styles.sizeCardDogIconWrap}>
                  <Dog size={24} className={styles.dogIconDefault} />
                </div>
              </div>
              <div className={styles.sizeCardTile}>
                <span className={styles.sizeCardLetter}>M</span>
                <span className={styles.sizeCardWeight}>5 – 15 kg</span>
                <div className={styles.sizeCardDogIconWrap}>
                  <Dog size={24} className={styles.dogIconDefault} />
                </div>
              </div>
              <div className={styles.sizeCardTile}>
                <span className={styles.sizeCardLetter}>L</span>
                <span className={styles.sizeCardWeight}>15 – 30 kg</span>
                <div className={styles.sizeCardDogIconWrap}>
                  <Dog size={24} className={styles.dogIconDefault} />
                </div>
              </div>
            </div>

            <div className={styles.careSection}>
              <h4 className={styles.careTitle}>Care Instructions</h4>
              <div className={styles.careItemsRow}>
                <div className={styles.careItem}>
                  <Droplets size={16} className={styles.careIcon} />
                  <span>Wash with mild soap</span>
                </div>
                <div className={styles.careItem}>
                  <Waves size={16} className={styles.careIcon} />
                  <span>Rinse thoroughly</span>
                </div>
                <div className={styles.careItem}>
                  <Sun size={16} className={styles.careIcon} />
                  <span>Air dry completely</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
