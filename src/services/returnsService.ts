import { api } from './api';
import {
  CreateReturnDto,
  CreateReturnResponse,
  GetReturnsResponse,
  SingleReturnResponse,
} from '@/types/returns';

export const returnsService = {
  /**
   * GET /api/v1/returns
   * Fetch authenticated user's return requests
   */
  async getReturns(params: { page?: number; limit?: number; status?: string } = {}): Promise<GetReturnsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status && params.status !== 'All') query.set('status', params.status.toLowerCase());

    const qs = query.toString();
    return api<GetReturnsResponse>(`/returns${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/returns/:id
   * Fetch single return request details with tracking status
   */
  async getReturnById(id: string): Promise<SingleReturnResponse> {
    return api<SingleReturnResponse>(`/returns/${encodeURIComponent(id)}`, { method: 'GET' });
  },

  /**
   * POST /api/v1/orders/:id/return
   * Submit return request for a delivered order
   */
  async createReturn(orderId: string, dto: CreateReturnDto): Promise<CreateReturnResponse> {
    return api<CreateReturnResponse>(`/orders/${encodeURIComponent(orderId)}/return`, {
      method: 'POST',
      data: dto as unknown as Record<string, unknown>,
    });
  },
};
