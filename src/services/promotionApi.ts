import { apiClient } from './apiClient';
import type {
  PageResponse,
  Promotion,
  PromotionInput,
  PromotionListParams,
  PromotionReport,
  PromotionStatus,
  PromotionValidationRequest,
  PromotionValidationResponse,
} from '@/types/promotion';

const normalizeListResponse = (payload: Promotion[] | PageResponse<Promotion>): PageResponse<Promotion> => {
  if (Array.isArray(payload)) {
    return {
      content: payload,
      totalElements: payload.length,
      totalPages: 1,
      number: 0,
      size: payload.length,
    };
  }

  return payload;
};

export const promotionApi = {
  async list(params: PromotionListParams = {}): Promise<PageResponse<Promotion>> {
    const { data } = await apiClient.get<Promotion[] | PageResponse<Promotion>>('/admin/promotions', {
      params: {
        status: params.status || undefined,
        type: params.type || undefined,
        search: params.search?.trim() || undefined,
        page: params.page,
        size: params.size,
      },
    });
    return normalizeListResponse(data);
  },

  async create(payload: PromotionInput): Promise<Promotion> {
    const { data } = await apiClient.post<Promotion>('/admin/promotions', payload);
    return data;
  },

  async getById(id: string): Promise<Promotion> {
    const { data } = await apiClient.get<Promotion>(`/admin/promotions/${id}`);
    return data;
  },

  async update(id: string, payload: PromotionInput): Promise<Promotion> {
    const { data } = await apiClient.put<Promotion>(`/admin/promotions/${id}`, payload);
    return data;
  },

  async updateStatus(id: string, status: Extract<PromotionStatus, 'ACTIVE' | 'PAUSED'>): Promise<Promotion> {
    const { data } = await apiClient.patch<Promotion>(`/admin/promotions/${id}/status`, { status });
    return data;
  },

  async report(): Promise<PromotionReport> {
    const { data } = await apiClient.get<PromotionReport>('/admin/promotions/report');
    return data;
  },

  async validate(payload: PromotionValidationRequest): Promise<PromotionValidationResponse> {
    const { data } = await apiClient.post<PromotionValidationResponse>('/promotions/validate', payload);
    return data;
  },
};

