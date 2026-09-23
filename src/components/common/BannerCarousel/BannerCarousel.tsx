import React, { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, Ref } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bannerService } from '@/services/bannerService';
import type { Banner, BannerSection } from '@/types/banner';
import { BannerFrame } from './BannerFrame';

export interface BannerCarouselProps {
  section: BannerSection;
  className?: string;
  style?: CSSProperties;
  heightClass?: string;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  showCaptions?: boolean;
  showBackdrop?: boolean;
  showImageOverlay?: boolean;
  fixedFrame?: boolean;
  frameMaxWidth?: number | string;
  roundedClass?: string;
  onActiveImageChange?: (imageUrl?: string) => void;
  onBannersChange?: (banners: Banner[]) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  section,
  className,
  style,
  heightClass = 'h-[280px] sm:h-[360px] md:h-[440px] lg:h-[500px]',
  autoPlayInterval = 5500,
  showDots = true,
  showArrows = true,
  showCaptions = true,
  showBackdrop = true,
  showImageOverlay = true,
  fixedFrame = true,
  frameMaxWidth,
  roundedClass = 'rounded-[20px]',
  onActiveImageChange,
  onBannersChange,
}) => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    bannerService
      .getActiveBanners(section)
      .then((data) => {
        if (isMounted) {
          const list = data || [];
          setBanners(list);
          onActiveImageChange?.(list[0]?.imageUrl);
          onBannersChange?.(list);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBanners([]);
          onActiveImageChange?.(undefined);
          onBannersChange?.([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [section, onActiveImageChange, onBannersChange]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelectedIndex(idx);
      if (banners[idx] && onActiveImageChange) {
        onActiveImageChange(banners[idx].imageUrl);
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, banners, onActiveImageChange]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!emblaApi || banners.length <= 1 || isHovered || !isDocumentVisible) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayInterval);

    return () => window.clearInterval(timer);
  }, [emblaApi, banners.length, isHovered, isDocumentVisible, autoPlayInterval]);

  const handleBannerClick = (banner: Banner) => {
    if (!banner.linkUrl) return;
    if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(banner.linkUrl);
    }
  };

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const activeBanner = banners[selectedIndex] ?? banners[0];
  const activeImage = activeBanner?.imageUrl;
  const frameClassName = cn(
    'relative overflow-hidden bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
    !fixedFrame && roundedClass,
    !fixedFrame && heightClass,
  );

  const renderFrame = (children: React.ReactNode, extraClassName?: string, ref?: Ref<HTMLDivElement>) => {
    const className = cn(frameClassName, extraClassName);
    if (fixedFrame) {
      return (
        <BannerFrame ref={ref} className={extraClassName} maxWidth={frameMaxWidth}>
          {children}
        </BannerFrame>
      );
    }
    return <div ref={ref} className={className}>{children}</div>;
  };

  const renderCaption = (banner: Banner, isClickable: boolean) => {
    if (!showCaptions || (!banner.title && !banner.subtitle && !isClickable)) return null;

    return (
      <div className="relative z-10 flex h-full items-center px-6 py-8 sm:px-10 lg:px-16">
        <div className="max-w-[520px]">
          {section && (
            <span className="inline-flex rounded-full border border-red-400/50 bg-red-950/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Legend Cinema
            </span>
          )}
          {banner.title && (
            <h2 className="mt-4 text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              {banner.subtitle}
            </p>
          )}
          {isClickable && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition group-hover:bg-red-500">
              Explore More
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('relative isolate bg-transparent', className)} style={style}>
        {renderFrame(
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950" />
        )}
      </div>
    );
  }

  // 0 banners: render nothing per requirements
  if (banners.length === 0) {
    return null;
  }

  // Single banner: render static responsive banner
  if (banners.length === 1) {
    const banner = banners[0];
    const isClickable = Boolean(banner.linkUrl);

    return (
      <div
        className={cn(
          'group relative isolate bg-transparent',
          isClickable && 'cursor-pointer',
          className
        )}
        style={style}
        onClick={() => handleBannerClick(banner)}
      >
        {showBackdrop && (
          <>
            <div
              className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-40 blur-3xl"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/55 to-background" aria-hidden="true" />
          </>
        )}

        {renderFrame(
          <>
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
            {showImageOverlay && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              </>
            )}
            {renderCaption(banner, isClickable)}
          </>
        )}
      </div>
    );
  }

  // Multiple banners: render interactive Embla carousel
  return (
    <div
      className={cn('group relative isolate bg-transparent select-none', className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showBackdrop && (
        <>
          <div
            className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-40 blur-3xl"
            style={{ backgroundImage: activeImage ? `url(${activeImage})` : undefined }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/55 to-background" aria-hidden="true" />
        </>
      )}

      {renderFrame(
        <div className="flex h-full">
          {banners.map((banner, index) => {
            const isClickable = Boolean(banner.linkUrl);
            return (
              <div
                key={banner.id}
                className={cn('relative min-w-full flex-shrink-0', fixedFrame ? 'h-full' : heightClass, isClickable && 'cursor-pointer')}
                onClick={() => handleBannerClick(banner)}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {showImageOverlay && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  </>
                )}
                {renderCaption(banner, isClickable)}
              </div>
            );
          })}
        </div>,
        undefined,
        emblaRef,
      )}

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollPrev();
            }}
            aria-label="Previous slide"
            className="absolute bottom-4 right-[4.5rem] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/85 backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollNext();
            }}
            aria-label="Next slide"
            className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/85 backdrop-blur-sm transition hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {banners.map((banner, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={banner.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollTo(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-[width,background-color] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
                  isSelected ? 'w-6 bg-red-600' : 'w-1.5 bg-white/40 hover:bg-white/70'
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
