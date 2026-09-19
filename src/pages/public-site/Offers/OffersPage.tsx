import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, Bookmark, Check, ChevronDown, CircleAlert, Coffee,
  MapPin, Popcorn, RefreshCw, Search, Ticket, X,
} from 'lucide-react';
import { productService } from '@/services/productService';
import { productCategoryService } from '@/services/productCategoryService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/formatDate';
import type { Product } from '@/types/product';
import type { ProductCategory } from '@/types/productCategory';
import { SnackImage } from '../Booking/SnackImage';

const SAVED_ITEMS_KEY = 'cinematique_saved_menu_items_v1';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const PRIMARY_BUTTON = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 ${FOCUS}`;

function readSavedItems(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_ITEMS_KEY) || '[]');
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is number => Number.isInteger(id) && id > 0))]
      : [];
  } catch {
    return [];
  }
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

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      setLoadFailed(false);
      return;
    }

    setLoading(true);
    setLoadFailed(false);
    void Promise.all([productService.list(), productCategoryService.list()])
      .then(([nextProducts, nextCategories]) => {
        if (cancelled) return;
        const inactiveCategories = new Set(nextCategories.filter((category) => !category.isActive).map((category) => category.id));
        setProducts(nextProducts.filter((product) => product.isAvailable
          && product.stockQuantity > 0
          && Number.isFinite(product.price)
          && product.price >= 0
          && !inactiveCategories.has(product.productCategoryId)));
        setCategories(nextCategories.filter((category) => category.isActive));
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setCategories([]);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, refresh]);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const menuCategories = categories.filter((category) => products.some((product) => product.productCategoryId === category.id));
  const savedCount = products.filter((product) => savedIds.includes(product.id)).length;
  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => (!savedOnly || savedIds.includes(product.id))
      && (categoryId === 'all' || String(product.productCategoryId) === categoryId)
      && (!term || `${product.name} ${categoryMap.get(product.productCategoryId)?.name || ''}`.toLowerCase().includes(term)))
      .sort((first, second) => {
        if (sort === 'price-low') return first.price - second.price || first.name.localeCompare(second.name);
        if (sort === 'price-high') return second.price - first.price || first.name.localeCompare(second.name);
        return first.name.localeCompare(second.name);
      });
  }, [products, savedOnly, savedIds, categoryId, query, sort, categoryMap]);

  function toggleSaved(product: Product) {
    const alreadySaved = savedIds.includes(product.id);
    const next = alreadySaved ? savedIds.filter((id) => id !== product.id) : [...savedIds, product.id];
    setSavedIds(next);
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(next));
      setAnnouncement(alreadySaved ? `${product.name} removed from saved items.` : `${product.name} saved on this device.`);
    } catch {
      setAnnouncement('Your selection is saved for this visit. This browser could not save it for next time.');
    }
  }

  function resetFilters() {
    setQuery('');
    setCategoryId('all');
    setSavedOnly(false);
  }

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <section className="overflow-hidden border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:px-8">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {isFoodPage ? <Popcorn className="h-4 w-4" aria-hidden="true" /> : <Ticket className="h-4 w-4" aria-hidden="true" />}
              {isFoodPage ? 'Food & drinks' : 'Offers & extras'}
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Big screen.<br /><span className="text-primary">Little extras.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              A popcorn to share. Something cold to sip. Explore the menu, save your favourites, and make your next movie night your own.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#food-menu" className={PRIMARY_BUTTON}>Explore the menu <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              <Link to="/cinemas" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted ${FOCUS}`}>
                Find a showtime <Ticket className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl border border-border bg-background p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">The perfect pairing</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Your movie-night plan</h2>
              </div>
              <Popcorn className="h-10 w-10 shrink-0 text-primary" strokeWidth={1.35} aria-hidden="true" />
            </div>
            <ol className="mt-7 space-y-5">
              {[
                ['Pick your film', 'Choose a cinema and an upcoming showtime.'],
                ['Choose your seats', 'Find your favourite spot in the auditorium.'],
                ['Add the extras', 'Select snacks and drinks before checkout.'],
              ].map(([title, description], index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-primary">{index + 1}</span>
                  <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
                </li>
              ))}
            </ol>
            <div className="relative mt-7 border-t border-dashed border-border pt-5">
              <span className="absolute -left-8 -top-2 hidden h-4 w-4 rounded-full border-r border-border bg-card sm:block" aria-hidden="true" />
              <span className="absolute -right-8 -top-2 hidden h-4 w-4 rounded-full border-l border-border bg-card sm:block" aria-hidden="true" />
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><Bookmark className="h-4 w-4 shrink-0" aria-hidden="true" />Save favourites now. Add them when you book.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!isFoodPage && (
          <section aria-label="Promotion availability" className="my-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <span className="rounded-xl bg-primary/10 p-3 text-primary"><Ticket className="h-5 w-5" aria-hidden="true" /></span>
              <div><h2 className="text-sm font-bold">Online promotions are not available yet</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">You can still explore current menu prices and plan your visit below.</p></div>
            </div>
            <Link to="/cinemas" className={`inline-flex shrink-0 items-center gap-2 self-start rounded-lg px-2 py-2 text-sm font-bold text-primary ${FOCUS}`}><MapPin className="h-4 w-4" aria-hidden="true" />Explore cinemas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        )}

        <section id="food-menu" aria-labelledby="menu-title" className="scroll-mt-40 pt-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">At the concessions counter</p><h2 id="menu-title" className="mt-2 text-3xl font-bold tracking-tight">Find your cinema favourites</h2><p className="mt-2 text-sm text-muted-foreground">Current menu prices. Snacks are optional when you book.</p></div>
            {isAuthenticated && !loading && !loadFailed && (
              <button type="button" onClick={() => setRefresh((value) => value + 1)} className={`inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-border px-4 text-xs font-semibold hover:bg-muted ${FOCUS}`}><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Refresh menu</button>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <Coffee className="mx-auto mb-4 h-10 w-10 text-primary" strokeWidth={1.4} aria-hidden="true" />
              <h3 className="text-xl font-bold">Sign in to see the food menu</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Browse available snacks, compare prices, and save your favourites for your next movie night.</p>
              <Link to={`/login?redirect=${encodeURIComponent(`${pathname}${search}`)}`} className={`${PRIMARY_BUTTON} mt-6`}>Sign in to browse <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <p className="mt-4 text-xs text-muted-foreground">You can explore cinema locations without signing in.</p>
            </div>
          ) : loading ? (
            <div role="status" aria-label="Loading food menu" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((id) => <div key={id} className="h-80 rounded-2xl border border-border bg-muted motion-safe:animate-pulse" />)}
              <span className="sr-only">Loading food menu…</span>
            </div>
          ) : loadFailed ? (
            <div role="alert" className="rounded-2xl border border-border bg-card p-10 text-center">
              <CircleAlert className="mx-auto mb-4 h-8 w-8 text-primary" aria-hidden="true" /><h3 className="text-lg font-bold">We couldn't load the food menu</h3><p className="mt-2 text-sm text-muted-foreground">Try again in a moment to see current prices and availability.</p>
              <button type="button" onClick={() => setRefresh((value) => value + 1)} className={`${PRIMARY_BUTTON} mt-6`}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</button>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <label className="sr-only" htmlFor="menu-search">Search food and drinks</label>
                    <input id="menu-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search popcorn, drinks, combos…" className={`h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm ${FOCUS}`} />
                    {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className={`absolute right-1 top-1 rounded-lg p-2.5 text-muted-foreground ${FOCUS}`}><X className="h-4 w-4" aria-hidden="true" /></button>}
                  </div>
                  <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-xs text-muted-foreground">Sort by
                    <select value={sort} onChange={(event) => setSort(event.target.value)} className={`min-w-0 rounded bg-background py-2 text-sm text-foreground ${FOCUS}`}><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setCategoryId('all')} aria-pressed={categoryId === 'all'} className={`rounded-full border px-4 py-2 text-xs font-semibold ${categoryId === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'} ${FOCUS}`}>All food & drinks</button>
                  {menuCategories.map((category) => <button type="button" key={category.id} onClick={() => setCategoryId(String(category.id))} aria-pressed={categoryId === String(category.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${categoryId === String(category.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'} ${FOCUS}`}>{category.name}</button>)}
                  <button type="button" onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold sm:ml-auto ${savedOnly ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'} ${FOCUS}`}><Bookmark className="h-3.5 w-3.5" fill={savedOnly ? 'currentColor' : 'none'} aria-hidden="true" />Saved ({savedCount})</button>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><p aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}{savedOnly ? ' in your saved list' : ' to explore'}</p><p>Saved on this device · Add items during booking</p></div>

              {visibleProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
                  {savedOnly ? <Bookmark className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" /> : <Popcorn className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />}
                  <h3 className="text-lg font-bold">{products.length === 0 ? 'The menu is being prepared' : savedOnly && savedCount === 0 ? 'Start your movie-night shortlist' : 'No matching snacks or drinks'}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{products.length === 0 ? 'No food or drinks are available right now. You can still book your next film.' : savedOnly && savedCount === 0 ? 'Tap the bookmark on a menu item to keep it here for later.' : 'Try another category or a different search.'}</p>
                  {products.length > 0 ? <button type="button" onClick={resetFilters} className={`${PRIMARY_BUTTON} mt-5`}>Show all food & drinks</button> : <Link to="/cinemas" className={`${PRIMARY_BUTTON} mt-5`}>Find a showtime <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
                </div>
              ) : (
                <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((product) => {
                    const category = categoryMap.get(product.productCategoryId);
                    const saved = savedIds.includes(product.id);
                    return (
                      <article key={product.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                        <div className="relative aspect-[16/10] bg-muted">
                          <SnackImage key={`${product.id}:${product.imageUrl}`} name={product.name} category={imageCategory(category?.name || '')} src={product.imageUrl} />
                          <button type="button" onClick={() => toggleSaved(product)} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={saved} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/95 shadow-sm ${saved ? 'text-primary' : 'text-foreground hover:text-primary'} ${FOCUS}`}><Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" /></button>
                        </div>
                        <div className="p-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{category?.name || 'Concessions'}</p>
                          <div className="mt-2 flex items-start justify-between gap-3"><h3 className="text-lg font-bold leading-6 tracking-tight">{product.name}</h3><p className="shrink-0 font-mono text-lg font-bold text-primary">{formatCurrency(product.price)}</p></div>
                          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />Available to add during booking</p>
                          <details className="group mt-5 border-t border-border pt-4">
                            <summary className={`flex cursor-pointer list-none items-center justify-between rounded text-xs font-bold [&::-webkit-details-marker]:hidden ${FOCUS}`}>Item details <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary>
                            <div className="pt-4 text-xs leading-6 text-muted-foreground">
                              {category?.description && <p className="mb-2">{category.description}</p>}
                              <p>Choose a showtime and your seats, then add this item in the snacks & drinks step. Price and availability are confirmed during booking.</p>
                              <p className="mt-2">For ingredients and allergy information, check with your cinema before ordering.</p>
                              <Link to="/cinemas" className={`mt-4 inline-flex items-center gap-2 rounded text-sm font-bold text-primary ${FOCUS}`}>Find a showtime <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                            </div>
                          </details>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-7 sm:flex-row sm:items-center"><div><h2 className="font-bold">Ready for the big screen?</h2><p className="mt-1 text-sm text-muted-foreground">Find your cinema, choose a film, and add the finishing touches.</p></div><Link to="/cinemas" className={PRIMARY_BUTTON}>Explore showtimes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
    </div>
  );
}
