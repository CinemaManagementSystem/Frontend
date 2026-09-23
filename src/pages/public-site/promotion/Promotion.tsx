import { ArrowRight, Gift, MapPin, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BannerCarousel } from '@/components/common/BannerCarousel';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export const PROMOTIONS = [
  {
    id: 'movie-night-favourites',
    title: 'Movie night favourites',
    description: 'Pair your tickets with popcorn, drinks, and a combo made for sharing.',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=85',
    action: 'Explore F&B',
    to: '/fnb',
    tone: 'from-fuchsia-950 via-red-900 to-black',
  },
  {
    id: 'grab-movie-break',
    title: 'Grab your movie break',
    description: 'Take the big-screen feeling with you with a quick snack stop before the show.',
    image: 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&w=900&q=85',
    action: 'Browse menu',
    to: '/fnb',
    tone: 'from-emerald-950 via-green-800 to-black',
  },
  {
    id: 'member-only-moments',
    title: 'Member-only moments',
    description: 'Collect rewards and unlock more ways to make every visit feel special.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
    action: 'Join membership',
    to: '/membership',
    tone: 'from-blue-950 via-indigo-900 to-black',
  },
  {
    id: 'better-snack-break',
    title: 'A better snack break',
    description: 'Refresh your seat with a cold drink and something warm from the counter.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=85',
    action: 'See F&B',
    to: '/fnb',
    tone: 'from-pink-950 via-rose-800 to-black',
  },
  {
    id: 'september-cinema-picks',
    title: 'September cinema picks',
    description: 'Find your next screening and plan the complete cinema experience.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=85',
    action: 'Find a showtime',
    to: '/cinemas',
    tone: 'from-red-950 via-orange-900 to-black',
  },
  {
    id: 'bring-the-whole-crew',
    title: 'Bring the whole crew',
    description: 'Choose a cinema, pick your seats, and make the next group outing easy.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85',
    action: 'Choose cinema',
    to: '/cinemas',
    tone: 'from-cyan-950 via-slate-800 to-black',
  },
] as const;

export default function Promotion() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <BannerCarousel
        section="OFFER"
        className="container-main py-4 sm:py-6"
        heightClass="aspect-[16/9] min-h-[260px] sm:aspect-[16/6] sm:min-h-[360px]"
        roundedClass="rounded-2xl"
        autoPlayInterval={7000}
      />

      <main className="container-main">
        <div className="flex flex-col justify-between gap-3 pt-10 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[var(--primary)]">Make more of your visit</p><h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl text-foreground">Promotions</h2></div><Link to="/cinemas" className={`inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] ${FOCUS}`}><MapPin className="h-4 w-4" /> Find a cinema</Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PROMOTIONS.map((promotion) => <Link key={promotion.id} to={`/promotion/${promotion.id}`} className={`group block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg transition hover:-translate-y-1 hover:border-[var(--primary)]/60 ${FOCUS}`}><article><div className="relative aspect-[1.6/1] overflow-hidden bg-black/20"><img src={promotion.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className={`absolute inset-0 bg-gradient-to-t ${promotion.tone} opacity-45 mix-blend-multiply`} /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" /></div><div className="p-4"><div className="flex items-start gap-2"><Gift className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /><div><h3 className="text-sm font-bold leading-5 text-foreground">{promotion.title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{promotion.description}</p></div></div><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)]">View promotion <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></div></article></Link>)}</div>
        <section className="mt-12 flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8 text-card-foreground"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--primary)]">Ready for your next visit?</p><h2 className="mt-2 text-2xl font-black text-foreground">Choose a movie and make it yours.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Find a cinema, select your seats, and add snacks before checkout.</p></div><Link to="/cinemas" className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white hover:brightness-110 ${FOCUS}`}><Ticket className="h-4 w-4" /> View showtimes</Link></section>
      </main>
    </div>
  );
}
