import { useState } from 'react';
import { Coffee, Cookie, GlassWater, Popcorn } from 'lucide-react';

type SnackCategory = 'Popcorn' | 'Drink' | 'Combo' | 'Snacks';

interface SnackImageProps {
  name: string;
  category: SnackCategory;
  src?: string | null;
}

const categoryIcon: Record<SnackCategory, typeof Popcorn> = {
  Popcorn,
  Drink: GlassWater,
  Combo: Coffee,
  Snacks: Cookie,
};

/**
 * Product images come from remote URLs and may disappear independently of the
 * booking flow. Once an image fails, render a stable local fallback instead of
 * leaving the browser's broken-image icon and alt text visible.
 */
export function SnackImage({ name, category, src }: SnackImageProps) {
  const [hasFailed, setHasFailed] = useState(!src?.trim());
  const Icon = categoryIcon[category];

  if (hasFailed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-secondary px-3 text-center text-muted-foreground"
        role="img"
        aria-label={`${name} image unavailable`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E50914]/20 bg-[#E50914]/10 text-[#E50914]">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-semibold">{name}</span>
        <span className="text-[10px]">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src ?? undefined}
      alt={`${name} product`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
