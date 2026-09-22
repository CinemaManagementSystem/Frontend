import type { PromotionDiscountType } from '@/types/promotion';
import { formatCurrency } from '@/utils/formatCurrency';

interface DiscountLabelProps {
  type: PromotionDiscountType;
  value: number;
}

export function DiscountLabel({ type, value }: DiscountLabelProps) {
  if (type === 'PERCENT') {
    return <span>{Number(value || 0).toFixed(0)}%</span>;
  }

  return <span>{formatCurrency(Number(value || 0))}</span>;
}

