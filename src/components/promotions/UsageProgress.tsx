import { cn } from '@/lib/utils';

interface UsageProgressProps {
  used: number;
  limit?: number | null;
  className?: string;
}

export function UsageProgress({ used, limit, className }: UsageProgressProps) {
  const safeUsed = Math.max(0, Number(used || 0));
  const safeLimit = limit == null ? null : Math.max(0, Number(limit || 0));
  const percent = safeLimit && safeLimit > 0 ? Math.min(100, (safeUsed / safeLimit) * 100) : 0;
  const label = safeLimit && safeLimit > 0 ? `${safeUsed} / ${safeLimit}` : `${safeUsed} used`;

  return (
    <div className={cn('min-w-[120px]', className)}>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {safeLimit && safeLimit > 0 ? <span>{Math.round(percent)}%</span> : null}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeLimit ?? undefined}
        aria-valuenow={safeLimit ? Math.min(safeUsed, safeLimit) : undefined}
        aria-label="Promotion usage"
      >
        <div className="h-full rounded-full bg-[#E50914]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

