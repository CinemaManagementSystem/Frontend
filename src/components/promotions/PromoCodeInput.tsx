import { ChevronDown, LoaderCircle, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MoneyText } from './MoneyText';
import { usePromotionValidation } from '@/hooks/usePromotionValidation';
import { cn } from '@/lib/utils';
import type { CartItemForPromotion } from '@/types/promotion';

interface PromoCodeInputProps {
  cartItems: CartItemForPromotion[];
  subtotal: number;
  onAppliedChange?: (code: string, discountAmount: number) => void;
}

export function PromoCodeInput({ cartItems, subtotal, onAppliedChange }: PromoCodeInputProps) {
  const [open, setOpen] = useState(false);
  const promo = usePromotionValidation({ cartItems, subtotal });
  const applied = promo.result?.valid ? promo.result : null;

  useEffect(() => {
    if (applied) {
      onAppliedChange?.(applied.code ?? promo.appliedCode, applied.discountAmount);
    } else if (!promo.loading && !promo.appliedCode) {
      onAppliedChange?.('', 0);
    }
  }, [applied, onAppliedChange, promo.appliedCode, promo.loading]);

  const apply = async () => {
    const result = await promo.apply();
    onAppliedChange?.(result?.valid ? (result.code ?? promo.code.trim().toUpperCase()) : '', result?.valid ? result.discountAmount : 0);
  };

  const remove = () => {
    promo.remove();
    onAppliedChange?.('', 0);
  };

  return (
    <section className="rounded-xl border border-border bg-muted/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
          <Tag className="h-4 w-4 text-[#E50914]" />
          Have a promo code?
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {applied ? (
            <div className="flex flex-col gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-300">{applied.code ?? promo.appliedCode} applied</p>
                <p className="text-xs text-emerald-200/80">
                  Discount <MoneyText amount={applied.discountAmount} negative />
                </p>
              </div>
              <button
                type="button"
                onClick={remove}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/25 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/10"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Promotion code</span>
                <input
                  value={promo.code}
                  onChange={(event) => promo.setCode(event.target.value.toUpperCase())}
                  disabled={promo.loading}
                  placeholder="Enter code"
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
                />
              </label>
              <button
                type="button"
                onClick={() => void apply()}
                disabled={promo.loading || !promo.code.trim()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E50914] px-4 text-sm font-bold text-white transition hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {promo.loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Apply
              </button>
            </div>
          )}

          {promo.error && <p role="alert" className="text-xs text-rose-300">{promo.error}</p>}
          {!promo.error && promo.loading && <p role="status" className="text-xs text-muted-foreground">Checking promotion...</p>}
        </div>
      )}
    </section>
  );
}
