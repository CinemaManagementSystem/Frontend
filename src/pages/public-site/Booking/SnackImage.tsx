import { useState } from 'react';
import { Coffee, Cookie, GlassWater, Popcorn } from 'lucide-react';
import { motion } from 'motion/react';

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
 * booking flow. Instead of leaving the browser's broken-image icon and alt
 * text visible, we render a stable local fallback the moment a load fails.
 * While the remote image is still loading we show a neutral skeleton so the
 * broken-image icon is never flashed to the user.
 */
export function SnackImage({ name, category, src }: SnackImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>(
    src?.trim() ? 'loading' : 'failed',
  );
  const Icon = categoryIcon[category];

  const renderFallback = () => (
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

  const renderSkeleton = () => (
    <div
      className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-2 bg-muted px-3 text-center text-muted-foreground"
      role="img"
      aria-label={`${name} image loading`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
        <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      </span>
      <span className="text-[11px] font-semibold text-muted-foreground">{name}</span>
    </div>
  );

  if (status === 'failed') return renderFallback();
  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-full w-full"
      >
        {renderSkeleton()}
        <img
          src={src ?? undefined}
          alt={`${name} product`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('failed')}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          data-testid="snack-image"
        />
      </motion.div>
    );
  }

  return (
    <motion.img
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      src={src ?? undefined}
      alt={`${name} product`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setStatus('failed')}
      className="h-full w-full object-cover"
    />
  );
}
