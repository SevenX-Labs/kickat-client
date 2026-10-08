import { api, getAccessToken } from './api';
import { CONFIG } from '../constants/config';

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  price: number;
  quantity: number;
  totalPrice?: number;
  imageUrl?: string;
  image?: string;
  productSlug?: string;
}

export interface OrderAddress {
  id?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  houseFlat?: string;
  buildingStreet?: string;
  landmark?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pin?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderTimelineStep {
  step?: string;
  key?: string;
  title?: string;
  description?: string;
  date?: string;
  timestamp?: string | null;
  done?: boolean;
  completed?: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt?: string;
  date?: string;
  orderStatus: string;
  status: string;
  subtotal?: number;
  deliveryFee?: number;
  codFee?: number;
  extraFeeName?: string;
  extraFeeAmount?: number;
  gstPercentage?: number;
  gstAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  grandTotal?: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  items: OrderItem[];
  address?: OrderAddress;
  timeline?: OrderTimelineStep[];
  cancelReason?: string;
  cancelReasonOther?: string;
  cancelledAt?: string;
  deliveryDate?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  courierPartner?: string;
  returnEligibilityDate?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReturnItemPayload {
  orderItemId: string;
  quantity?: number;
  reason?: string;
  reasonOther?: string;
  photos?: string[];
}

export interface ReturnOrderPayload {
  items: ReturnItemPayload[];
  reason?: string;
  pickupInstructions?: string;
  images?: string[];
}

// In-memory cache for product details to avoid redundant API queries
const productCache = new Map<string, { imageUrl?: string; slug?: string; variants?: any[] }>();

export async function enrichOrderItemsWithProductData(items: any[]): Promise<any[]> {
  if (!items || !Array.isArray(items) || items.length === 0) return items;

  const missingIds = items
    .map((it) => it.productId)
    .filter((id) => id && !productCache.has(id));

  const uniqueMissingIds = Array.from(new Set(missingIds));

  if (uniqueMissingIds.length > 0) {
    await Promise.allSettled(
      uniqueMissingIds.map(async (pId) => {
        try {
          const res = await api<any>(`/products/${pId}`);
          if (res) {
            const p = res.product || res;
            productCache.set(pId, {
              imageUrl: p.imageUrl || (p.images && p.images[0]) || undefined,
              slug: p.slug,
              variants: p.variants || [],
            });
          }
        } catch {
          // Graceful fallback if product was deleted or offline
        }
      })
    );
  }

  return items.map((it) => {
    const cached = it.productId ? productCache.get(it.productId) : null;
    let actualImage = it.imageUrl || it.image;

    if (cached) {
      if (it.variantId && cached.variants && Array.isArray(cached.variants)) {
        const matchingVariant = cached.variants.find((v: any) => v.id === it.variantId);
        if (matchingVariant?.imageUrl) {
          actualImage = matchingVariant.imageUrl;
        }
      }
      if (!actualImage && cached.imageUrl) {
        actualImage = cached.imageUrl;
      }
    }

    return {
      ...it,
      imageUrl: actualImage || it.imageUrl || it.image,
      image: actualImage || it.imageUrl || it.image,
      productSlug: cached?.slug || it.productSlug,
    };
  });
}

export const orderService = {
  /**
   * GET /api/v1/orders
   * Get paginated order history with actual product images populated
   */
  async getOrders(params?: GetOrdersParams) {
    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (params?.status && params.status !== 'All') {
      queryParts.push(`status=${encodeURIComponent(params.status.toLowerCase())}`);
    }
    if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params?.dateFrom) queryParts.push(`dateFrom=${encodeURIComponent(params.dateFrom)}`);
    if (params?.dateTo) queryParts.push(`dateTo=${encodeURIComponent(params.dateTo)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await api<{ success: boolean; orders: any[]; pagination?: any }>(`/orders${queryString}`);

    if (res && Array.isArray(res.orders)) {
      await Promise.all(
        res.orders.map(async (order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items = await enrichOrderItemsWithProductData(order.items);
          }
        })
      );
    }

    return res;
  },

  /**
   * GET /api/v1/orders/:id
   * Get single order by ID with actual product images populated
   */
  async getOrderById(id: string) {
    const cleanId = id.trim();
    const res = await api<{ success: boolean; order: any }>(`/orders/${cleanId}`);

    if (res && res.order && res.order.items && Array.isArray(res.order.items)) {
      res.order.items = await enrichOrderItemsWithProductData(res.order.items);
    }

    return res;
  },

  /**
   * GET /api/v1/orders/:id/timeline
   */
  async getOrderTimeline(id: string) {
    const cleanId = id.trim();
    return api<{ success: boolean; orderId: string; currentStatus: string; timeline: any[] }>(`/orders/${cleanId}/timeline`);
  },

  /**
   * PATCH /api/v1/orders/:id/cancel
   * Cancel order
   */
  async cancelOrder(id: string, reason: string, reasonOther?: string) {
    const cleanId = id.trim();
    return api<{ success: boolean; message?: string; id?: string; orderStatus?: string }>(`/orders/${cleanId}/cancel`, {
      method: 'PATCH',
      data: {
        reason: reason.toLowerCase(),
        reasonOther: reasonOther || undefined,
      },
    });
  },

  /**
   * POST /api/v1/orders/:id/return
   * Request return for a delivered order
   */
  async returnOrder(id: string, payload: ReturnOrderPayload) {
    const cleanId = id.trim();
    return api<{ success: boolean; message?: string; returnId?: string; return?: any }>(`/orders/${cleanId}/return`, {
      method: 'POST',
      data: payload as unknown as Record<string, unknown>,
    });
  },

  /**
   * POST /api/v1/orders/:id/reorder
   * Add items back to cart
   */
  async reorder(id: string) {
    const cleanId = id.trim();
    return api<{ success: boolean; message?: string; items?: any[] }>(`/orders/${cleanId}/reorder`, {
      method: 'POST',
    });
  },

  /**
   * GET /api/v1/returns
   * Get returns history
   */
  async getReturns(params?: { page?: number; limit?: number }) {
    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api<{ success: boolean; returns: any[]; pagination?: any }>(`/returns${queryString}`);
  },

  /**
   * GET /api/v1/returns/:id
   * Get single return status
   */
  async getReturnById(id: string) {
    const cleanId = id.trim();
    return api<{ success: boolean; return: any }>(`/returns/${cleanId}`);
  },

  /**
   * GET /api/v1/orders/:id/tracking
   */
  async getOrderTracking(id: string) {
    const cleanId = id.trim();
    return api<{
      success: boolean;
      tracking?: any;
      orderId?: string;
      trackingNumber?: string;
      courierPartner?: string;
      status?: string;
      estimatedDelivery?: string;
      history?: any[];
      timeline?: any[];
      // Real courier scan events (chronological) and the empty-state copy.
      events?: Array<{
        stage: string;
        title: string;
        rawStatus: string;
        description: string | null;
        location: string | null;
        timestamp: string;
        source: string;
      }>;
      hasTrackingEvents?: boolean;
      trackingMessage?: string | null;
    }>(`/orders/${cleanId}/tracking`);
  },

  /**
   * GET /api/v1/orders/:id/tracking-live
   */
  async getOrderTrackingLive(id: string) {
    const cleanId = id.trim();
    return api<{
      success: boolean;
      orderId?: string;
      trackingNumber?: string;
      status?: string;
      agent?: { name: string; phone: string; vehicleNumber: string };
      liveLocation?: { latitude: number; longitude: number; lastUpdated: string };
      etaMinutes?: number;
    }>(`/orders/${cleanId}/tracking-live`);
  },

  /**
   * GET /api/v1/orders/:id/refunds
   */
  async getOrderRefundHistory(id: string) {
    const cleanId = id.trim();
    return api<{ success: boolean; audits?: any[]; totalRefunded?: number }>(`/orders/${cleanId}/refunds`);
  },

  /**
   * GET /api/v1/orders/:id/invoice
   */
  async getOrderInvoice(id: string) {
    const cleanId = id.trim();
    return api<{ success: boolean; invoice: any }>(`/orders/${cleanId}/invoice`);
  },

  /**
   * GET /api/v1/orders/:id/invoice/pdf
   * Download generated PDF invoice
   */
  async downloadInvoicePdf(id: string, orderNumber?: string) {
    const token = getAccessToken();
    const cleanId = id.trim();
    const url = `${CONFIG.API_BASE_URL}/orders/${cleanId}/invoice/pdf`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error('Failed to download invoice PDF');
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Invoice-${orderNumber || cleanId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
