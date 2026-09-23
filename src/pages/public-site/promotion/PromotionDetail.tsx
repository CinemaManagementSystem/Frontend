import { useState } from 'react';
import { ArrowLeft, ArrowRight, Gift } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PROMOTIONS } from './Promotion';
import { PromotionCard } from './PromotionCard';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export default function PromotionDetail() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const promotion = PROMOTIONS.find((item) => item.id === promotionId);
  const [imageFailed, setImageFailed] = useState(false);

  if (!promotion) {
    return (
      <main className="container-main flex min-h-[70vh] items-center justify-center py-20 text-center text-foreground">
        <div>
          <Gift className="mx-auto mb-5 h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
          <h1 className="text-3xl font-black">Promotion not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">This promotion may have ended or is no longer available.</p>
          <Link to="/promotion" className={`mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white hover:brightness-110 ${FOCUS}`}>
            <ArrowLeft className="h-4 w-4" /> Back to promotions
          </Link>
        </div>
      </main>
    );
  }

  const relatedPromotions = PROMOTIONS.filter((item) => item.id !== promotion.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <div className="container-main py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/promotion" className={`inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-white ${FOCUS}`}>
            <ArrowLeft className="h-4 w-4" /> Back to promotions
          </Link>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <Link to="/promotion" className={`transition hover:text-foreground ${FOCUS}`}>Promotions</Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-[55vw] truncate font-semibold text-foreground sm:max-w-none">{promotion.title}</span>
          </nav>
        </div>

        <header className="mt-8 max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-950/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
            <Gift className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" /> Promotion
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">{promotion.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{promotion.description}</p>
        </header>

        <div className="relative mt-8 aspect-[21/8.5] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-950 via-black to-black shadow-[0_24px_70px_rgba(0,0,0,.45)]">
          {imageFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Gift className="h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
              <p className="text-sm">Promotion artwork is unavailable.</p>
            </div>
          ) : (
            <>
              <img
                src={promotion.image}
                alt={`${promotion.title} promotion`}
                className="h-full w-full object-cover object-center"
                loading="eager"
                onError={() => setImageFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" aria-hidden="true" />
            </>
          )}
        </div>

        <section className="mt-10 border-t border-border pt-8" aria-labelledby="promotion-details-title">
          <article className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">About this promotion</p>
            <h2 id="promotion-details-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{promotion.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{promotion.description}</p>
            <Link to={promotion.to} className={`mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 ${FOCUS}`}>
              {promotion.action}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        </section>

        {relatedPromotions.length > 0 && (
          <section className="mt-12 border-t border-border pt-8" aria-labelledby="related-promotions-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Keep exploring</p>
                <h2 id="related-promotions-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">More promotions</h2>
              </div>
              <Link to="/promotion" className={`hidden items-center gap-2 text-sm font-bold text-[var(--primary)] sm:inline-flex ${FOCUS}`}>
                View all<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPromotions.map((item) => <PromotionCard key={item.id} promotion={item} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
