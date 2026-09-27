export type CheckoutPaymentMethodType = 'UPI' | 'CARD' | 'WALLET' | 'NETBANKING' | 'COD';

export type WalletProviderType = 'GPAY' | 'PHONEPE' | 'PAYTM' | 'AMAZON_PAY';

export interface CheckoutFees {
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  gstPercentage?: number;
  gstAppliesToDelivery?: boolean;
  gstAmount: number;
  extraFeeName?: string | null;
  extraFeeAmount?: number;
  isExtraFeeCompulsory?: boolean;
  codFee: number;
  grandTotal: number;
}

export interface CheckoutSummary extends CheckoutFees {
  itemCount: number;
}

export interface StockReservation {
  reservationId: string;
  expiresAt: string;
}

export interface CheckoutAddress {
  id: string;
  userId?: string;
  fullName?: string;
  phone?: string;
  houseFlat?: string;
  houseNumber?: string;
  buildingStreet?: string;
  street?: string;
  landmark?: string | null;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  type?: 'HOME' | 'WORK' | 'OTHER';
  isDefault?: boolean;
  deliveryInstructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutResponse {
  success: boolean;
  summary: CheckoutSummary;
  addresses: CheckoutAddress[];
  paymentMethods: string[];
  stockReservation: StockReservation;
}

export interface CreateAddressInlineDto {
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type?: 'HOME' | 'WORK' | 'OTHER';
}

export interface ValidateAddressDto {
  addressId?: string;
  address?: CreateAddressInlineDto;
}

export interface ValidateAddressResponse {
  success: boolean;
  serviceable: boolean;
  deliveryCharge: number;
  estimatedDays?: string;
  address?: CheckoutAddress;
  message?: string;
}

export interface PaymentMethodItem {
  type: CheckoutPaymentMethodType;
  name: string;
  available: boolean;
  extraFee?: number;
  reason?: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  orderAmount: number;
  pincode: string;
  methods: PaymentMethodItem[];
}

export interface PlaceOrderDto {
  addressId: string;
  paymentMethod: CheckoutPaymentMethodType;
  deliveryInstructions?: string;
  upiId?: string;
  savedCardId?: string;
  walletProvider?: WalletProviderType;
  bankCode?: string;
  expectedTotal?: number;
  applyExtraFee?: boolean;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  orderId: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
}
