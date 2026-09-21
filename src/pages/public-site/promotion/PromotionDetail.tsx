import { ArrowLeft, ArrowRight, CalendarDays, Gift, MapPin, Ticket } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PROMOTIONS } from './Promotion';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export default function PromotionDetail() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const promotion = PROMOTIONS.find((item) => item.id === promotionId);

  if (!promotion) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-20 text-center text-foreground sm:px-6">
        <Gift className="mx-auto mb-5 h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
        <h1 className="text-3xl font-black">Promotion not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">This promotion may have ended or is no longer available.</p>
        <Link to="/promotion" className={`mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white hover:brightness-110 ${FOCUS}`}><ArrowLeft className="h-4 w-4" /> Back to promotions</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 border-b border-border pb-4 text-xs text-muted-foreground"><Link to="/promotion" className={`hover:text-foreground ${FOCUS}`}>Promotions</Link><span>/</span><span className="truncate text-foreground font-semibold">🎉 {promotion.title}</span></nav>
        <header className="pt-6"><h1 className="flex items-start gap-3 text-3xl font-black tracking-tight sm:text-5xl text-foreground"><Gift className="mt-1 h-7 w-7 shrink-0 text-[var(--primary)] sm:mt-2 sm:h-9 sm:w-9" aria-hidden="true" />{promotion.title}</h1><p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-[var(--primary)]" /> Published September 1, 2026</p></header>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"><img src={promotion.image} alt={promotion.title} className="max-h-[620px] w-full object-cover" /></div>
        <article className="mt-7 max-w-3xl text-sm leading-7 text-muted-foreground"><p className="text-base font-bold text-foreground">🎉 {promotion.title}</p><p className="mt-2">{promotion.description}</p><ul className="mt-4 list-disc space-y-1.5 pl-5"><li>Available at participating Legend Cinema locations.</li><li>Check the latest price and availability before ordering.</li><li>Terms and availability may vary by cinema and date.</li></ul></article>
        <div className="mt-8 flex flex-wrap gap-3"><Link to={promotion.to} className={`inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white hover:brightness-110 ${FOCUS}`}>{promotion.action} <ArrowRight className="h-4 w-4" /></Link><Link to="/promotion" className={`inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-accent/10 ${FOCUS}`}><ArrowLeft className="h-4 w-4" /> Back to promotions</Link></div>
        <div className="mt-10 flex flex-wrap gap-5 border-t border-border pt-6 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--primary)]" /> Participating cinemas</span><span className="inline-flex items-center gap-2"><Ticket className="h-4 w-4 text-[var(--primary)]" /> Plan your next visit</span></div>
      </div>
    </main>
  );
}
