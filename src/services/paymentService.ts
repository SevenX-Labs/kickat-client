import { api } from './api';
import {
  CreatePaymentOrderDto,
  CreatePaymentOrderResponse,
  VerifyPaymentDto,
  VerifyPaymentResponse,
  RetryPaymentDto,
  RetryPaymentResponse,
  ConfirmCodDto,
  ConfirmCodResponse,
  PaymentDetailsResponse,
} from '@/types/payment';

export const paymentService = {
  /**
   * POST /payments/create-order (Idempotent)
   * Initialize gateway order (Razorpay Order ID) or prepare COD payment record
   */
  async createPaymentOrder(
    dto: CreatePaymentOrderDto,
    idempotencyKey: string
  ): Promise<CreatePaymentOrderResponse> {
    return api<CreatePaymentOrderResponse>('payments/create-order', {
      method: 'POST',
      headers: {
        'idempotency-key': idempotencyKey,
      },
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * POST /payments/verify
   * Authoritative backend verification of Razorpay signature
   */
  async verifyPayment(dto: VerifyPaymentDto): Promise<VerifyPaymentResponse> {
    return api<VerifyPaymentResponse>('payments/verify', {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * POST /payments/retry (Idempotent)
   * Retry payment for an existing failed or pending order
   */
  async retryPayment(
    dto: RetryPaymentDto,
    idempotencyKey: string
  ): Promise<RetryPaymentResponse> {
    return api<RetryPaymentResponse>('payments/retry', {
      method: 'POST',
      headers: {
        'idempotency-key': idempotencyKey,
      },
      data: dto as unknown as Record<string, unknown>,
    });
  },

  /**
   * GET /payments/:id
   * Get payment details and gateway status
   */
  async getPaymentById(id: string): Promise<PaymentDetailsResponse> {
    return api<PaymentDetailsResponse>(`payments/${id}`);
  },

  /**
   * POST /payments/cod/confirm (Idempotent)
   * Confirm Cash on Delivery order
   */
  async confirmCod(
    dto: ConfirmCodDto,
    idempotencyKey: string
  ): Promise<ConfirmCodResponse> {
    return api<ConfirmCodResponse>('payments/cod/confirm', {
      method: 'POST',
      headers: {
        'idempotency-key': idempotencyKey,
      },
      data: dto as unknown as Record<string, unknown>,
    });
  },
};
