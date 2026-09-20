import { api } from './api';

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
}

export interface OrderAddress {
  id?: string;
  name?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pin?: string;
  postalCode?: string;
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
  date?: string;
  orderStatus: string;
  status: string;
  totalAmount?: number;
  grandTotal?: number;
  total: number;
  items: OrderItem[];
  address?: OrderAddress;
  timeline?: OrderTimelineStep[];
  cancelReason?: string;
  returnEligibilityDate?: string;
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

export const orderService = {
  /**
   * GET /api/v1/orders
   * Get paginated order history
   */
  async getOrders(params?: GetOrdersParams) {
    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (params?.status && params.status !== 'All') {
      queryParts.push(`status=${encodeURIComponent(params.status.toUpperCase())}`);
    }
    if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params?.dateFrom) queryParts.push(`dateFrom=${encodeURIComponent(params.dateFrom)}`);
    if (params?.dateTo) queryParts.push(`dateTo=${encodeURIComponent(params.dateTo)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return api<{ success: boolean; orders: any[]; pagination?: any }>(`/orders${queryString}`);
  },

  /**
   * GET /api/v1/orders/:id
   * Get single order by ID
   */
  async getOrderById(id: string) {
    return api<{ success: boolean; order: any }>(`/orders/${id}`);
  },

  /**
   * POST or PATCH /api/v1/orders/:id/cancel
   * Cancel order
   */
  async cancelOrder(id: string, reason: string, reasonOther?: string) {
    try {
      return await api<{ success: boolean; message: string; orderId: string; status: string }>(`/orders/${id}/cancel`, {
        method: 'POST',
        data: { reason, reasonOther },
      });
    } catch {
      return api<{ success: boolean; message: string; orderId: string; status: string }>(`/orders/${id}/cancel`, {
        method: 'PATCH',
        data: { reason, reasonOther },
      });
    }
  },

  /**
   * POST /api/v1/orders/:id/return
   * Request return for a delivered order
   */
  async returnOrder(id: string, payload: ReturnOrderPayload) {
    return api<{ success: boolean; message: string; returnId: string; status: string }>(`/orders/${id}/return`, {
      method: 'POST',
      data: payload as unknown as Record<string, unknown>,
    });
  },

  /**
   * POST /api/v1/orders/:id/reorder
   * Add items back to cart
   */
  async reorder(id: string) {
    return api<{ success: boolean; message?: string; items?: any[] }>(`/orders/${id}/reorder`, {
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
    return api<{ success: boolean; return: any }>(`/returns/${id}`);
  },

  /**
   * GET /api/v1/orders/:id/tracking
   */
  async getOrderTracking(id: string) {
    return api<{ success: boolean; tracking: any }>(`/orders/${id}/tracking`);
  },

  /**
   * GET /api/v1/orders/:id/invoice
   */
  async getOrderInvoice(id: string) {
    return api<{ success: boolean; invoice: any }>(`/orders/${id}/invoice`);
  }
};
