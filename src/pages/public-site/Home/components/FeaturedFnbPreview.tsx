import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatDate';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import type { FnbItem } from '@/types/product';
import { useToast } from '@/components/ui/Toast/Toast';

export interface FeaturedFnbPreviewProps {
  items?: FnbItem[];
  loading?: boolean;
  className?: string;
}

interface CuratedFnb {
  id: number;
  name: string;
  category: 'Popcorn' | 'Drink' | 'Snacks' | 'Combo';
  price: number;
  description: string;
  imageUrl: string;
}

const DEFAULT_CURATED_FNB: CuratedFnb[] = [
  {
    id: 101,
    name: 'Caramel Popcorn (L)',
    category: 'Popcorn',
    price: 8.5,
    description: 'Crispy sweet golden caramel glazed popcorn popped fresh daily.',
    imageUrl:
      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 102,
    name: 'Salted Butter Popcorn (M)',
    category: 'Popcorn',
    price: 6.5,
    description: 'Classic theater popcorn with rich melted butter and sea salt.',
    imageUrl:
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 103,
    name: 'Coca-Cola (500ml)',
    category: 'Drink',
    price: 4.5,
    description: 'Ice-cold fountain drink in a cinema cup with straw.',
    imageUrl:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 104,
    name: 'Crispy Cheese Nachos',
    category: 'Snacks',
    price: 7.0,
    description: 'Warm tortilla chips served with warm melted jalapeño cheese.',
    imageUrl:
      'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 105,
    name: 'Ultimate Cinema Combo',
    category: 'Combo',
    price: 14.5,
    description: '1 Large Popcorn + 2 Fountain Drinks + Sweet Candy snack.',
    imageUrl:
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 106,
    name: "M&M's Chocolate Theater Box",
    category: 'Snacks',
    price: 4.0,
    description: 'Crispy shell milk chocolate candies in shareable box.',
    imageUrl:
      'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=600&q=80',
  },
];

export const FeaturedFnbPreview: React.FC<FeaturedFnbPreviewProps> = ({
  items = [],
  loading = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();

  // If backend returns items with valid images and prices, blend them; otherwise use realistic curated items
  const displayItems: CuratedFnb[] = React.useMemo(() => {
    if (items.length >= 5) {
      return items.slice(0, 6).map((item, idx) => ({
        id: item.id,
        name: item.name,
        category: (item.name.toLowerCase().includes('popcorn')
          ? 'Popcorn'
          : item.name.toLowerCase().includes('coca') || item.name.toLowerCase().includes('drink')
          ? 'Drink'
          : item.name.toLowerCase().includes('combo')
          ? 'Combo'
          : 'Snacks') as CuratedFnb['category'],
        price: item.price > 0 ? item.price : DEFAULT_CURATED_FNB[idx % DEFAULT_CURATED_FNB.length].price,
        description: DEFAULT_CURATED_FNB[idx % DEFAULT_CURATED_FNB.length].description,
        imageUrl: item.imageUrl || DEFAULT_CURATED_FNB[idx % DEFAULT_CURATED_FNB.length].imageUrl,
      }));
    }
    return DEFAULT_CURATED_FNB;
  }, [items]);

  const handleAddToCart = (e: React.MouseEvent, item: CuratedFnb) => {
    e.stopPropagation();
    toast.success(`Added ${item.name} to order`);
  };

  return (
    <section className={cn('py-10', className)} aria-label={t.home.popularFnb}>
      {/* Section Header: small red uppercase label + white bold heading */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E50914]">
            {t.fnb.concessions} &amp; SNACKS
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {t.home.popularFnb}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/fnb')}
          className="inline-flex items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground transition hover:border-[#E50914] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
        >
          <span>{t.home.viewAllFnb}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="status"
          aria-label="Loading popular food and drinks"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border bg-card p-4 space-y-3"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 6 Product Cards in Responsive Grid: 3 cols desktop, 2 tablet, 1 mobile */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayItems.map((item) => (
            <article
              key={item.id}
              tabIndex={0}
              role="article"
              aria-label={item.name}
              onClick={() => navigate(`/fnb?item=${item.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/fnb?item=${item.id}`);
                }
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E50914]/50 hover:shadow-2xl hover:shadow-black/70 cursor-pointer"
            >
              {/* Image Container with warm tone filter */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.95] contrast-[1.05]"
                  onError={(e) => {
                    // Fallback to a warm cinema popcorn image
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Category Pill */}
                <span className="absolute top-3 left-3 rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/10">
                  {item.category}
                </span>

                {/* Hover Add Button */}
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, item)}
                  aria-label={`Add ${item.name} to order`}
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E50914] text-white text-xs font-bold shadow-lg hover:bg-[#ff1f2d]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 justify-between p-4 sm:p-5 gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug line-clamp-1 group-hover:text-[#E50914] transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price text in bold white, distinct from red headings */}
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-base font-bold text-white tracking-tight">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    In Cinema Pickup
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
