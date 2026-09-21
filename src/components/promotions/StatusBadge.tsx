import { Badge } from '@/components/ui/Badge/Badge';
import type { PromotionStatus } from '@/types/promotion';

interface StatusBadgeProps {
  status: PromotionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === 'ACTIVE'
    ? 'success'
    : status === 'PAUSED'
      ? 'warning'
      : status === 'EXPIRED'
        ? 'outline'
        : 'secondary';

  return <Badge variant={variant}>{status}</Badge>;
}

