export type ReturnReason = 'wrong_item' | 'damaged' | 'expired' | 'not_as_described' | 'other';
export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PICKUP_SCHEDULED' | 'PICKED_UP' | 'REFUNDED';

export interface ReturnItemPayload {
  orderItemId: string;
  reason: ReturnReason;
  reasonOther?: string;
  photos?: string[];
}

export interface CreateReturnDto {
  items: ReturnItemPayload[];
  pickupInstructions?: string;
}

export interface ReturnItemRecord {
  id: string;
  returnId: string;
  orderItemId: string;
  reason: string;
  reasonOther?: string | null;
  photos: string[];
  status?: string;
  createdAt: string;
  orderItem?: {
    id: string;
    productName: string;
    variantName?: string | null;
    price: number;
    quantity: number;
    imageUrl?: string | null;
  };
}

export interface ReturnRecord {
  id: string;
  userId: string;
  orderId: string;
  status: ReturnStatus;
  pickupInstructions?: string | null;
  refundAmount?: number | null;
  createdAt: string;
  updatedAt: string;
  items: ReturnItemRecord[];
  order?: {
    id?: string;
    orderNumber?: string;
    grandTotal?: number;
    orderStatus?: string;
    createdAt?: string;
  };
}

export interface GetReturnsResponse {
  success: boolean;
  returns: ReturnRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleReturnResponse {
  success: boolean;
  return: ReturnRecord;
}

export interface CreateReturnResponse {
  success: boolean;
  message: string;
  return: ReturnRecord;
}
