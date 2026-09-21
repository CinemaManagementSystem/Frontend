import { ArrowLeft, ArrowRight, CalendarDays, Gift, MapPin, Ticket } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PROMOTIONS } from './Promotion';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export default function PromotionDetail() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const promotion = PROMOTIONS.find((item) => item.id === promotionId);

  if (!promotion) {
    return (
      <PageContainer as="main" className="min-h-[70vh] py-20 text-center text-white">
        <Gift className="mx-auto mb-5 h-10 w-10 text-red-500" aria-hidden="true" />
        <h1 className="text-3xl font-black">Promotion not found</h1>
        <p className="mt-3 text-sm text-white/55">This promotion may have ended or is no longer available.</p>
        <Link to="/promotion" className={`mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold hover:bg-red-500 ${FOCUS}`}><ArrowLeft className="h-4 w-4" /> Back to promotions</Link>
      </PageContainer>
    );
  }

  return (
    <main className="min-h-screen bg-[#050506] pb-20 text-white">
      <PageContainer className="pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 border-b border-white/10 pb-4 text-xs text-white/45"><Link to="/promotion" className={`hover:text-white ${FOCUS}`}>Promotions</Link><span>/</span><span className="truncate text-white/80">🎉 {promotion.title}</span></nav>
        <header className="pt-6"><h1 className="flex items-start gap-3 text-3xl font-black tracking-tight sm:text-5xl"><Gift className="mt-1 h-7 w-7 shrink-0 text-red-500 sm:mt-2 sm:h-9 sm:w-9" aria-hidden="true" />{promotion.title}</h1><p className="mt-4 flex items-center gap-2 text-sm text-white/65"><CalendarDays className="h-4 w-4 text-red-400" /> Published September 1, 2026</p></header>
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/40"><img src={promotion.image} alt={promotion.title} className="max-h-[620px] w-full object-cover" /></div>
        <article className="mt-7 max-w-3xl text-sm leading-7 text-white/75"><p className="text-base font-bold text-white">🎉 {promotion.title}</p><p className="mt-2">{promotion.description}</p><ul className="mt-4 list-disc space-y-1.5 pl-5"><li>Available at participating Legend Cinema locations.</li><li>Check the latest price and availability before ordering.</li><li>Terms and availability may vary by cinema and date.</li></ul></article>
        <div className="mt-8 flex flex-wrap gap-3"><Link to={promotion.to} className={`inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold hover:bg-red-500 ${FOCUS}`}>{promotion.action} <ArrowRight className="h-4 w-4" /></Link><Link to="/promotion" className={`inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white/80 hover:bg-white/10 ${FOCUS}`}><ArrowLeft className="h-4 w-4" /> Back to promotions</Link></div>
        <div className="mt-10 flex flex-wrap gap-5 border-t border-white/10 pt-6 text-xs text-white/45"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-red-400" /> Participating cinemas</span><span className="inline-flex items-center gap-2"><Ticket className="h-4 w-4 text-red-400" /> Plan your next visit</span></div>
      </PageContainer>
    </main>
  );
}
