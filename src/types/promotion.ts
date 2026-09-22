export type PromotionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';
export type PromotionDiscountType = 'PERCENT' | 'FIXED';
export type PromotionScope = 'ALL' | 'MOVIE' | 'SHOW' | 'PRODUCT';

export const PROMOTION_STATUSES: PromotionStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED'];
export const PROMOTION_DISCOUNT_TYPES: PromotionDiscountType[] = ['PERCENT', 'FIXED'];
export const PROMOTION_SCOPES: PromotionScope[] = ['ALL', 'MOVIE', 'SHOW', 'PRODUCT'];

export interface PromotionTarget {
  id: string | number;
  name?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  discountType: PromotionDiscountType;
  value: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  startAt: string;
  endAt: string;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number | null;
  scope: PromotionScope;
  targetIds?: Array<string | number>;
  status: PromotionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionInput {
  name: string;
  description?: string | null;
  code?: string | null;
  discountType: PromotionDiscountType;
  value: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  startAt: string;
  endAt: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  scope: PromotionScope;
  targetIds?: Array<string | number>;
}

export interface PromotionListParams {
  status?: PromotionStatus | '';
  type?: PromotionDiscountType | '';
  search?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PromotionReportSummary {
  totalUses: number;
  totalDiscountGiven: number;
  revenueFromPromoOrders: number;
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  userId?: string | number | null;
  userName?: string | null;
  orderId?: string | number | null;
  discountApplied: number;
  usedAt: string;
}

export interface PromotionReport {
  summary: PromotionReportSummary;
  usages: PromotionUsage[];
}

export interface CartItemForPromotion {
  productId?: string | number;
  movieId?: string | number;
  showId?: string | number;
  quantity: number;
  unitPrice: number;
}

export interface PromotionValidationRequest {
  code: string;
  cartItems: CartItemForPromotion[];
  subtotal: number;
}

export interface PromotionValidationResponse {
  valid: boolean;
  discountAmount: number;
  message: string;
  code?: string | null;
  promotionId?: string | null;
  total?: number;
}

