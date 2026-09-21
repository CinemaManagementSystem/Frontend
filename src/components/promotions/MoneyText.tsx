import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';

interface MoneyTextProps {
  amount: number;
  negative?: boolean;
  className?: string;
}

export function MoneyText({ amount, negative = false, className }: MoneyTextProps) {
  return (
    <span className={cn('tabular-nums', negative && 'text-emerald-400', className)}>
      {negative ? '-' : ''}
      {formatCurrency(Math.abs(Number(amount || 0)))}
    </span>
  );
}

