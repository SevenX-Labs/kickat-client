export interface CartItemProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  stock?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CartItemVariant {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  stock?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: CartItemProduct;
  variant?: CartItemVariant | null;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  productDiscount?: number;
  deliveryFee?: number;
  isFreeDelivery?: boolean;
  freeDeliveryThreshold?: number;
  taxAmount?: number;
  tax?: number;
  platformFee?: number;
  totalAmount?: number;
  total?: number;
}

export interface CartResponse {
  success: boolean;
  sessionId?: string;
  summary: CartSummary;
  items: CartItem[];
  message?: string;
}

export interface BuyNowResponse {
  success: boolean;
  message?: string;
  buyNowItem: {
    productId: string;
    productName: string;
    variantId?: string | null;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    subtotal?: number;
    deliveryFee?: number;
    isFreeDelivery?: boolean;
    taxAmount?: number;
    platformFee?: number;
    totalAmount?: number;
  };
}
