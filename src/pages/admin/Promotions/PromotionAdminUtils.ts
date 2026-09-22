import type { Promotion, PromotionDiscountType, PromotionInput, PromotionScope } from '@/types/promotion';

export type PromotionFormState = {
  name: string;
  description: string;
  automatic: boolean;
  code: string;
  discountType: PromotionDiscountType;
  value: string;
  maxDiscountAmount: string;
  minOrderAmount: string;
  startAt: string;
  endAt: string;
  usageLimit: string;
  perUserLimit: string;
  scope: PromotionScope;
  targetIds: string;
};

export const fieldClass =
  'h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-50';

export const textareaClass =
  'min-h-24 w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-50';

export const labelClass = 'block text-xs font-semibold text-muted-foreground';

export const emptyPromotionForm: PromotionFormState = {
  name: '',
  description: '',
  automatic: false,
  code: '',
  discountType: 'PERCENT',
  value: '10',
  maxDiscountAmount: '',
  minOrderAmount: '',
  startAt: '',
  endAt: '',
  usageLimit: '',
  perUserLimit: '1',
  scope: 'ALL',
  targetIds: '',
};

export function toLocalDateTimeInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromPromotion(promotion: Promotion): PromotionFormState {
  return {
    name: promotion.name ?? '',
    description: promotion.description ?? '',
    automatic: !promotion.code,
    code: promotion.code ?? '',
    discountType: promotion.discountType,
    value: String(promotion.value ?? ''),
    maxDiscountAmount: promotion.maxDiscountAmount == null ? '' : String(promotion.maxDiscountAmount),
    minOrderAmount: promotion.minOrderAmount == null ? '' : String(promotion.minOrderAmount),
    startAt: toLocalDateTimeInput(promotion.startAt),
    endAt: toLocalDateTimeInput(promotion.endAt),
    usageLimit: promotion.usageLimit == null ? '' : String(promotion.usageLimit),
    perUserLimit: promotion.perUserLimit == null ? '' : String(promotion.perUserLimit),
    scope: promotion.scope,
    targetIds: (promotion.targetIds ?? []).join(', '),
  };
}

const optionalNumber = (value: string): number | null => {
  if (value.trim() === '') return null;
  return Number(value);
};

export function toPromotionInput(form: PromotionFormState): PromotionInput {
  const targetIds = form.scope === 'ALL'
    ? []
    : form.targetIds.split(',').map((item) => item.trim()).filter(Boolean);

  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    code: form.automatic ? null : form.code.trim().toUpperCase(),
    discountType: form.discountType,
    value: Number(form.value),
    maxDiscountAmount: form.discountType === 'PERCENT' ? optionalNumber(form.maxDiscountAmount) : null,
    minOrderAmount: optionalNumber(form.minOrderAmount),
    startAt: form.startAt,
    endAt: form.endAt,
    usageLimit: optionalNumber(form.usageLimit),
    perUserLimit: optionalNumber(form.perUserLimit),
    scope: form.scope,
    targetIds,
  };
}

export function validatePromotionForm(form: PromotionFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const value = Number(form.value);
  const maxDiscount = optionalNumber(form.maxDiscountAmount);
  const minOrder = optionalNumber(form.minOrderAmount);
  const usageLimit = optionalNumber(form.usageLimit);
  const perUserLimit = optionalNumber(form.perUserLimit);

  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.automatic && !/^[A-Z0-9_-]+$/.test(form.code.trim().toUpperCase())) {
    errors.code = 'Use uppercase letters, numbers, underscores, or hyphens. No spaces.';
  }
  if (!Number.isFinite(value) || value <= 0) errors.value = 'Discount value must be greater than 0.';
  if (form.discountType === 'PERCENT' && value > 100) errors.value = 'Percent discount cannot exceed 100%.';
  if (form.discountType === 'PERCENT' && maxDiscount != null && maxDiscount <= 0) {
    errors.maxDiscountAmount = 'Max discount must be greater than 0.';
  }
  if (minOrder != null && minOrder < 0) errors.minOrderAmount = 'Minimum order cannot be negative.';
  if (!form.startAt) errors.startAt = 'Start date is required.';
  if (!form.endAt) errors.endAt = 'End date is required.';
  if (form.startAt && form.endAt && new Date(form.endAt).getTime() <= new Date(form.startAt).getTime()) {
    errors.endAt = 'End date must be after start date.';
  }
  if (usageLimit != null && usageLimit <= 0) errors.usageLimit = 'Usage limit must be greater than 0.';
  if (perUserLimit != null && perUserLimit <= 0) errors.perUserLimit = 'Per-user limit must be greater than 0.';
  if (form.scope !== 'ALL' && !form.targetIds.trim()) errors.targetIds = 'Add at least one target id.';

  return errors;
}

export function formatDateRange(startAt: string, endAt: string): string {
  const format = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Dates not set';
  return `${format.format(start)} - ${format.format(end)}`;
}

export function buildPromotionSummary(form: PromotionFormState): string {
  const value = Number(form.value || 0);
  const type = form.discountType === 'PERCENT' ? `${value || 0}%` : `$${value.toFixed(2)}`;
  const min = form.minOrderAmount ? ` over $${Number(form.minOrderAmount).toFixed(2)}` : '';
  const cap = form.discountType === 'PERCENT' && form.maxDiscountAmount
    ? `, max $${Number(form.maxDiscountAmount).toFixed(2)}`
    : '';
  const dates = form.startAt && form.endAt ? `, valid ${formatDateRange(form.startAt, form.endAt)}` : '';
  const scope = form.scope === 'ALL' ? '' : ` for ${form.scope.toLowerCase()} targets`;
  return `${type} off orders${min}${cap}${scope}${dates}`;
}
