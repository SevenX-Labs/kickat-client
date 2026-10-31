import { api } from './api';
import {
  CheckoutResponse,
  ValidateAddressDto,
  ValidateAddressResponse,
  PaymentMethodsResponse,
  PlaceOrderDto,
  PlaceOrderResponse,
} from '@/types/checkout';

export interface GetCheckoutParams {
  buyNowProductId?: string;
  buyNowVariantId?: string;
  buyNowQuantity?: number;
}

export const checkoutService = {
  /**
   * GET /checkout
   * Retrieve checkout session with active cart or direct buy-now item, computed totals & saved addresses
   */
  async getCheckout(params?: GetCheckoutParams): Promise<CheckoutResponse> {
    let url = 'checkout';
    if (params && params.buyNowProductId) {
      const search = new URLSearchParams();
      search.append('buyNowProductId', params.buyNowProductId);
      if (params.buyNowVariantId) search.append('buyNowVariantId', params.buyNowVariantId);
      if (params.buyNowQuantity) search.append('buyNowQuantity', String(params.buyNowQuantity));
      url += `?${search.toString()}`;
    }
    return api<CheckoutResponse>(url);
  },

  /**
   * POST /checkout/validate-address
   * Validate if delivery address pincode is serviceable by active shipping zones
   */
  async validateAddress(
    payload: ValidateAddressDto | string
  ): Promise<ValidateAddressResponse> {
    const data =
      typeof payload === 'string'
        ? { addressId: payload }
        : (payload as unknown as Record<string, unknown>);

    return api<ValidateAddressResponse>('checkout/validate-address', {
      method: 'POST',
      data,
    });
  },

  /**
   * GET /checkout/payment-methods?orderAmount=X&pincode=Y
   * Retrieve eligible payment methods for the cart amount and delivery pincode
   */
  async getPaymentMethods(
    orderAmount: number,
    pincode: string
  ): Promise<PaymentMethodsResponse> {
    const query = new URLSearchParams({
      orderAmount: String(orderAmount),
      pincode: String(pincode),
    }).toString();

    return api<PaymentMethodsResponse>(`checkout/payment-methods?${query}`);
  },

  /**
   * POST /checkout/place-order (Idempotent)
   * Place customer order with unique idempotency-key header
   */
  async placeOrder(
    dto: PlaceOrderDto,
    idempotencyKey: string
  ): Promise<PlaceOrderResponse> {
    return api<PlaceOrderResponse>('checkout/place-order', {
      method: 'POST',
      headers: {
        'idempotency-key': idempotencyKey,
      },
      data: dto as unknown as Record<string, unknown>,
    });
  },
};
