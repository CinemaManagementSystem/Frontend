import { ArrowRight, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PromotionTeaser {
  id: string;
  title: string;
  description: string;
  image: string;
  action: string;
  to: string;
  tone: string;
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

interface PromotionCardProps {
  promotion: PromotionTeaser;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  return (
    <Link
      to={`/promotion/${promotion.id}`}
      className={`group block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg transition hover:-translate-y-1 hover:border-[var(--primary)]/60 ${FOCUS}`}
    >
      <article>
        <div className="relative aspect-[1.6/1] overflow-hidden bg-black/20">
          <img
            src={promotion.image}
            alt={promotion.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${promotion.tone} opacity-45 mix-blend-multiply`} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
        </div>
        <div className="p-4">
          <div className="flex items-start gap-2">
            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-bold leading-5 text-foreground">{promotion.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{promotion.description}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
            View promotion
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}
