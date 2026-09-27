export type PaymentMethodType = 'upi' | 'card' | 'wallet' | 'netbanking' | 'cod';

export type WalletProviderType = 'gpay' | 'phonepe' | 'paytm' | 'amazon_pay';

export interface CreatePaymentOrderDto {
  orderId: string;
  paymentMethod: PaymentMethodType;
  upiId?: string;
  savedCardId?: string;
  walletProvider?: string;
  bankCode?: string;
  saveCard?: boolean;
}

export interface CreatePaymentOrderResponse {
  success: boolean;
  message?: string;
  paymentId: string;
  orderId: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  key?: string;
}

export interface VerifyPaymentDto {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentId: string;
  orderId: string;
  status: string;
}

export interface RetryPaymentDto {
  orderId: string;
  paymentMethod: PaymentMethodType;
  upiId?: string;
  savedCardId?: string;
  walletProvider?: string;
  bankCode?: string;
  saveCard?: boolean;
}

export interface RetryPaymentResponse {
  success: boolean;
  message?: string;
  paymentId: string;
  orderId: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  key?: string;
}

export interface ConfirmCodDto {
  orderId: string;
}

export interface ConfirmCodResponse {
  success: boolean;
  message: string;
  paymentId: string;
  orderId: string;
  status: string;
}

export interface PaymentDetailsResponse {
  success: boolean;
  payment: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    attempts: number;
    createdAt: string;
    updatedAt: string;
    order?: {
      orderNumber: string;
      grandTotal: number;
      orderStatus: string;
      paymentStatus: string;
    };
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}
