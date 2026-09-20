import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Gift, MapPin, Sparkles, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const HEROES = [PROMOTIONS[2], PROMOTIONS[0], PROMOTIONS[4]];

export default function Promotion() {
  const [activeHero, setActiveHero] = useState(0);
  const hero = HEROES[activeHero];

  useEffect(() => {
    const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % HEROES.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050506] pb-20 text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#0c0709]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-35 blur-2xl transition-[background-image] duration-700" style={{ backgroundImage: `url(${hero.image})` }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(229,9,20,.34),transparent_48%),linear-gradient(180deg,rgba(8,6,7,.15),#050506_94%)]" />
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
          <div className="relative mx-auto aspect-[2.45/1] max-w-[806px] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl shadow-black/60">
            <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-700" />
            <div className={`absolute inset-0 bg-gradient-to-r ${hero.tone} opacity-75 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-transparent" />
            <div className="relative flex h-full max-w-lg flex-col justify-center px-7 py-8 sm:px-12">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.22em] text-red-100"><Sparkles className="h-3.5 w-3.5" /> Legend Cinema</span>
              <h1 className="max-w-md text-4xl font-black tracking-[-.06em] sm:text-6xl">{hero.title}</h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/75 sm:text-base">{hero.description}</p>
              <Link to={hero.to} className={`mt-6 inline-flex w-fit min-h-11 items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold shadow-[0_8px_24px_rgba(229,9,20,.28)] transition hover:bg-red-500 ${FOCUS}`}>{hero.action} <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="absolute bottom-5 right-5 hidden items-center gap-2 sm:flex"><button type="button" aria-label="Previous promotion" onClick={() => setActiveHero((activeHero + HEROES.length - 1) % HEROES.length)} className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/80 hover:bg-white/10 ${FOCUS}`}><ArrowLeft className="h-4 w-4" /></button><button type="button" aria-label="Next promotion" onClick={() => setActiveHero((activeHero + 1) % HEROES.length)} className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/80 hover:bg-white/10 ${FOCUS}`}><ArrowRight className="h-4 w-4" /></button></div>
          </div>
          <div className="mt-4 flex justify-center gap-1.5" role="tablist" aria-label="Promotion slides">{HEROES.map((item, index) => <button type="button" key={item.title} role="tab" aria-selected={activeHero === index} aria-label={`Show ${item.title}`} onClick={() => setActiveHero(index)} className={`h-1.5 rounded-full transition-all ${activeHero === index ? 'w-8 bg-red-500' : 'w-1.5 bg-white/35 hover:bg-white/60'} ${FOCUS}`} />)}</div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-3 pt-10 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-red-500">Make more of your visit</p><h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Promotions</h2></div><Link to="/cinemas" className={`inline-flex items-center gap-2 text-xs font-bold text-red-400 ${FOCUS}`}><MapPin className="h-4 w-4" /> Find a cinema</Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PROMOTIONS.map((promotion) => <Link key={promotion.id} to={`/promotion/${promotion.id}`} className={`group block overflow-hidden rounded-xl border border-white/15 bg-[#171316] shadow-lg shadow-black/25 transition hover:-translate-y-1 hover:border-red-500/60 ${FOCUS}`}><article><div className="relative aspect-[1.6/1] overflow-hidden bg-black"><img src={promotion.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className={`absolute inset-0 bg-gradient-to-t ${promotion.tone} opacity-45 mix-blend-multiply`} /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" /></div><div className="p-4"><div className="flex items-start gap-2"><Gift className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /><div><h3 className="text-sm font-bold leading-5">{promotion.title}</h3><p className="mt-1.5 text-xs leading-5 text-white/55">{promotion.description}</p></div></div><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-red-400">View promotion <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></div></article></Link>)}</div>
        <section className="mt-12 flex flex-col justify-between gap-5 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/60 to-[#171316] p-6 sm:flex-row sm:items-center sm:p-8"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-red-300">Ready for your next visit?</p><h2 className="mt-2 text-2xl font-black">Choose a movie and make it yours.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-white/60">Find a cinema, select your seats, and add snacks before checkout.</p></div><Link to="/cinemas" className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold hover:bg-red-500 ${FOCUS}`}><Ticket className="h-4 w-4" /> View showtimes</Link></section>
      </main>
    </div>
  );
}
