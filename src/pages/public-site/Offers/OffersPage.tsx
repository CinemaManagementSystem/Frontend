import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Bookmark, Check, ChevronDown, CircleAlert, Coffee, MapPin, Popcorn, RefreshCw, Search, Ticket, X } from 'lucide-react';
import { productService } from '@/services/productService';
import { productCategoryService } from '@/services/productCategoryService';
import { useAuthStore } from '@/store/authStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { formatCurrency } from '@/utils/formatDate';
import type { Product } from '@/types/product';
import type { ProductCategory } from '@/types/productCategory';
import { SnackImage } from '../Booking/SnackImage';

const SAVED_ITEMS_KEY = 'cinematique_saved_menu_items_v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const PRIMARY_BUTTON = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_rgba(229,9,20,.22)] transition hover:bg-primary/90 ${FOCUS}`;

function readSavedItems(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_ITEMS_KEY) || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is number => Number.isInteger(id) && id > 0))] : [];
  } catch { return []; }
}

function imageCategory(name: string): 'Popcorn' | 'Drink' | 'Combo' | 'Snacks' {
  const category = name.toLowerCase();
  if (category.includes('popcorn')) return 'Popcorn';
  if (category.includes('drink') || category.includes('beverage')) return 'Drink';
  if (category.includes('combo')) return 'Combo';
  return 'Snacks';
}

export function OffersPage() {
  const { pathname, search } = useLocation();
  const isFoodPage = pathname === '/fnb';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { cinemas, fetchCinemas, selectedCinemaId, selectCinema } = useCinemaStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [savedIds, setSavedIds] = useState(readSavedItems);
  const [savedOnly, setSavedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [sort, setSort] = useState('name');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => { if (isFoodPage && isAuthenticated) void fetchCinemas(); }, [fetchCinemas, isAuthenticated, isFoodPage]);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setProducts([]); setCategories([]); setLoading(false); setLoadFailed(false); return;
    }
    setLoading(true); setLoadFailed(false);
    void Promise.all([productService.list(), productCategoryService.list()])
      .then(([nextProducts, nextCategories]) => {
        if (cancelled) return;
        const inactiveCategories = new Set(nextCategories.filter((category) => !category.isActive).map((category) => category.id));
        setProducts(nextProducts.filter((product) => product.isAvailable && product.stockQuantity > 0 && Number.isFinite(product.price) && product.price >= 0 && !inactiveCategories.has(product.productCategoryId)));
        setCategories(nextCategories.filter((category) => category.isActive));
      })
      .catch(() => { if (!cancelled) { setProducts([]); setCategories([]); setLoadFailed(true); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, refresh]);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const menuCategories = categories.filter((category) => products.some((product) => product.productCategoryId === category.id));
  const savedCount = products.filter((product) => savedIds.includes(product.id)).length;
  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => (!savedOnly || savedIds.includes(product.id)) && (categoryId === 'all' || String(product.productCategoryId) === categoryId) && (!term || `${product.name} ${categoryMap.get(product.productCategoryId)?.name || ''}`.toLowerCase().includes(term)))
      .sort((first, second) => sort === 'price-low' ? first.price - second.price || first.name.localeCompare(second.name) : sort === 'price-high' ? second.price - first.price || first.name.localeCompare(second.name) : first.name.localeCompare(second.name));
  }, [products, savedOnly, savedIds, categoryId, query, sort, categoryMap]);
  const heroImage = products.find((product) => product.imageUrl)?.imageUrl || null;

  function toggleSaved(product: Product) {
    const alreadySaved = savedIds.includes(product.id);
    const next = alreadySaved ? savedIds.filter((id) => id !== product.id) : [...savedIds, product.id];
    setSavedIds(next);
    try { localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(next)); setAnnouncement(alreadySaved ? `${product.name} removed from saved items.` : `${product.name} saved on this device.`); }
    catch { setAnnouncement('Your selection is saved for this visit.'); }
  }
  function resetFilters() { setQuery(''); setCategoryId('all'); setSavedOnly(false); }

  const heroTitle = isFoodPage ? 'Food & Beverage' : 'Promotions';
  const heroCopy = isFoodPage ? 'Enjoyable movie experiences with the best food selections and our best-selling popcorn.' : 'More ways to enjoy the big screen. Discover current cinema offers and member savings.';

  return (
    <div className="min-h-screen bg-[#050506] pb-20 text-foreground">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#0a0809]">
        {heroImage && <div aria-hidden="true" className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-35 blur-2xl" style={{ backgroundImage: `url(${heroImage})` }} />}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(229,9,20,.3),transparent_48%),linear-gradient(180deg,rgba(8,6,7,.25),#050506_92%)]" />
        <div className={isFoodPage ? 'container-main pb-12 pt-8 sm:pt-12' : 'mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12'}>
          <div className={isFoodPage ? 'relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-red-950 via-[#1b060b] to-black shadow-2xl shadow-black/50 sm:aspect-[16/6]' : 'relative mx-auto aspect-[2.45/1] max-w-[806px] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-red-950 via-[#1b060b] to-black shadow-2xl shadow-black/50'}>
            {heroImage && <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
            <div className="relative flex h-full max-w-md flex-col justify-center px-7 py-8 sm:px-12">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.2em] text-red-200"><Ticket className="h-3.5 w-3.5" aria-hidden="true" />Legend Cinema</span>
              <h1 className="text-4xl font-black tracking-[-.055em] text-white sm:text-6xl">{heroTitle}</h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/75 sm:text-base">{heroCopy}</p>
              <a href="#food-menu" className={`${PRIMARY_BUTTON} mt-6 w-fit`}>{isFoodPage ? 'Browse menu' : 'View promotions'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true"><span className="h-1.5 w-8 rounded-full bg-primary" /><span className="h-1.5 w-1.5 rounded-full bg-white/35" /><span className="h-1.5 w-1.5 rounded-full bg-white/35" /><span className="h-1.5 w-1.5 rounded-full bg-white/35" /></div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        {isFoodPage && isAuthenticated && <section className="pt-8" aria-labelledby="cinema-title"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Pick up at</p><h2 id="cinema-title" className="mt-1 text-2xl font-black sm:text-3xl">Choose Cinema</h2></div><Link to="/cinemas" className={`hidden items-center gap-2 text-xs font-bold text-primary sm:inline-flex ${FOCUS}`}>View locations <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="grid gap-2 sm:grid-cols-2">{cinemas.slice(0, 12).map((cinema) => <button type="button" key={cinema.id} onClick={() => selectCinema(cinema.id)} className={`flex items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition ${selectedCinemaId === cinema.id ? 'border-primary bg-primary/15' : 'border-white/15 bg-white/[.04] hover:border-primary/60'} ${FOCUS}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-red-500/80 to-orange-400/60 text-white"><MapPin className="h-4 w-4" /></span><span className="min-w-0 flex-1 truncate text-xs font-bold">{cinema.name}</span><ArrowRight className="h-4 w-4 shrink-0 text-white/55" /></button>)}{cinemas.length === 0 && <Link to="/cinemas" className={`rounded-lg border border-dashed border-white/20 px-4 py-5 text-sm text-white/65 ${FOCUS}`}>Browse available cinema locations <ArrowRight className="ml-1 inline h-4 w-4" /></Link>}</div></section>}

        {!isFoodPage && <section aria-label="Promotion availability" className="pt-10"><div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.04] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="rounded-lg bg-primary/15 p-2.5 text-primary"><Ticket className="h-5 w-5" /></span><div><h2 className="text-sm font-bold">Online promotions are not available yet</h2><p className="mt-1 text-xs text-white/55">Explore current concession prices and plan your visit below.</p></div></div><Link to="/cinemas" className={`inline-flex items-center gap-2 text-xs font-bold text-primary ${FOCUS}`}><MapPin className="h-4 w-4" />Explore cinemas <ArrowRight className="h-4 w-4" /></Link></div></section>}

        <section id="food-menu" aria-labelledby="menu-title" className="scroll-mt-32 pt-10"><div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">{isFoodPage ? 'Fresh at the concessions counter' : 'Special offers'}</p><h2 id="menu-title" className="mt-1 text-3xl font-black tracking-tight">{isFoodPage ? 'Food & drinks' : 'Promotions'}</h2></div>{isAuthenticated && !loading && !loadFailed && <button type="button" onClick={() => setRefresh((value) => value + 1)} className={`inline-flex min-h-10 items-center gap-2 self-start rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70 hover:bg-white/[.06] ${FOCUS}`}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>}</div>

          {!isAuthenticated ? <div className="rounded-xl border border-white/10 bg-white/[.04] px-6 py-12 text-center"><Coffee className="mx-auto mb-4 h-10 w-10 text-primary" strokeWidth={1.4} /><h3 className="text-xl font-bold">Sign in to see the food menu</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">Browse available snacks, compare prices, and save your favourites for your next movie night.</p><Link to={`/login?redirect=${encodeURIComponent(`${pathname}${search}`)}`} className={`${PRIMARY_BUTTON} mt-6`}>Sign in to browse <ArrowRight className="h-4 w-4" /></Link><p className="mt-4 text-xs text-white/45">You can explore cinema locations without signing in.</p></div>
            : loading ? <div role="status" aria-label="Loading food menu" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((id) => <div key={id} className="h-64 rounded-xl border border-white/10 bg-white/[.05] motion-safe:animate-pulse" />)}</div>
              : loadFailed ? <div role="alert" className="rounded-xl border border-white/10 bg-white/[.04] p-10 text-center"><CircleAlert className="mx-auto mb-4 h-8 w-8 text-primary" /><h3 className="text-lg font-bold">We couldn't load the food menu</h3><p className="mt-2 text-sm text-white/55">Try again in a moment to see current prices and availability.</p><button type="button" onClick={() => setRefresh((value) => value + 1)} className={`${PRIMARY_BUTTON} mt-6`}><RefreshCw className="h-4 w-4" />Try again</button></div>
                : <><div className="mb-5 space-y-3 rounded-xl border border-white/10 bg-white/[.035] p-3"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/45" /><label className="sr-only" htmlFor="menu-search">Search food and drinks</label><input id="menu-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search popcorn, drinks, combos…" className={`h-11 w-full rounded-lg border border-white/15 bg-black/20 pl-10 pr-10 text-sm text-white placeholder:text-white/35 ${FOCUS}`} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className={`absolute right-1 top-1 rounded-lg p-2.5 text-white/55 ${FOCUS}`}><X className="h-4 w-4" /></button>}</div><label className="flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 text-xs text-white/55">Sort by<select aria-label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)} className={`min-w-0 bg-transparent py-2 text-sm text-white ${FOCUS}`}><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setCategoryId('all')} aria-pressed={categoryId === 'all'} className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${categoryId === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-white/15 text-white/70 hover:bg-white/[.06]'} ${FOCUS}`}>All food & drinks</button>{menuCategories.map((category) => <button type="button" key={category.id} onClick={() => setCategoryId(String(category.id))} aria-pressed={categoryId === String(category.id)} className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${categoryId === String(category.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-white/15 text-white/70 hover:bg-white/[.06]'} ${FOCUS}`}>{category.name}</button>)}<button type="button" onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold sm:ml-auto ${savedOnly ? 'border-primary bg-primary/15 text-primary' : 'border-white/15 text-white/70 hover:bg-white/[.06]'} ${FOCUS}`}><Bookmark className="h-3.5 w-3.5" fill={savedOnly ? 'currentColor' : 'none'} />Saved ({savedCount})</button></div></div><p className="mb-4 text-xs text-white/45" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'} to explore</p>{visibleProducts.length === 0 ? <div className="rounded-xl border border-dashed border-white/20 px-6 py-14 text-center"><Popcorn className="mx-auto mb-4 h-8 w-8 text-white/35" /><h3 className="text-lg font-bold">{products.length === 0 ? 'The menu is being prepared' : savedOnly && savedCount === 0 ? 'Start your movie-night shortlist' : 'No matching snacks or drinks'}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">{products.length === 0 ? 'No food or drinks are available right now. You can still book your next film.' : 'Try another category or a different search.'}</p>{products.length > 0 ? <button type="button" onClick={resetFilters} className={`${PRIMARY_BUTTON} mt-5`}>Show all food & drinks</button> : <Link to="/cinemas" className={`${PRIMARY_BUTTON} mt-5`}>Find a showtime <ArrowRight className="h-4 w-4" /></Link>}</div> : <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => { const category = categoryMap.get(product.productCategoryId); const saved = savedIds.includes(product.id); return <article key={product.id} className="overflow-hidden rounded-xl border border-white/12 bg-[#171316] shadow-lg shadow-black/20"><div className="relative aspect-[1.45/1] bg-black/20"><SnackImage key={`${product.id}:${product.imageUrl}`} name={product.name} category={imageCategory(category?.name || '')} src={product.imageUrl} /><button type="button" onClick={() => toggleSaved(product)} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={saved} className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white ${saved ? 'text-primary' : 'hover:text-primary'} ${FOCUS}`}><Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} /></button></div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{category?.name || 'Concessions'}</p><div className="mt-1 flex items-start justify-between gap-3"><h3 className="text-base font-bold leading-6 tracking-tight text-white">{product.name}</h3><p className="shrink-0 font-mono text-base font-bold text-primary">{formatCurrency(product.price)}</p></div><p className="mt-2 flex items-center gap-1.5 text-xs text-white/50"><Check className="h-3.5 w-3.5 text-emerald-400" />Available to add during booking</p><details className="group mt-4 border-t border-white/10 pt-3"><summary className={`flex cursor-pointer list-none items-center justify-between rounded text-xs font-bold text-white/75 [&::-webkit-details-marker]:hidden ${FOCUS}`}>Item details <ChevronDown className="h-4 w-4 text-white/45 transition-transform group-open:rotate-180" /></summary><div className="pt-3 text-xs leading-6 text-white/55">{category?.description && <p className="mb-2">{category.description}</p>}<p>Choose a showtime and your seats, then add this item during booking.</p><Link to="/cinemas" className={`mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary ${FOCUS}`}>Find a showtime <ArrowRight className="h-4 w-4" /></Link></div></details></div></article>; })}</div>}</>}
        </section>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center"><div><h2 className="font-bold">Ready for the big screen?</h2><p className="mt-1 text-sm text-white/55">Find your cinema, choose a film, and add the finishing touches.</p></div><Link to="/cinemas" className={PRIMARY_BUTTON}>Explore showtimes <ArrowRight className="h-4 w-4" /></Link></div>
      </main>
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
    </div>
  );
}
