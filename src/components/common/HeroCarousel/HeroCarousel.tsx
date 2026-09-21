import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/PageContainer';

export interface HeroSlide {
  id: string;
  image: string;
  fallbackImage?: string;
  title: string;
  description?: string;
  badge?: string;
  buttonText?: string;
  buttonHref?: string;
  showContent?: boolean;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
  className?: string;
  onSlideClick?: (slideId: string) => void;
  onActiveImageChange?: (image?: string) => void;
  onSlideAction?: (slide: HeroSlide) => void;
  showArrows?: boolean;
}

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  autoPlayInterval = 5000,
  className,
  onSlideClick,
  onActiveImageChange,
  onSlideAction,
  showArrows = false,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const reducedMotion = useReducedMotion();

  const currentSlide = slides[selectedIndex] ?? slides[0];
  const currentImage = currentSlide
    ? failedImages[currentSlide.id] && currentSlide.fallbackImage
      ? currentSlide.fallbackImage
      : currentSlide.image
    : '';

  useEffect(() => {
    onActiveImageChange?.(currentImage || undefined);
  }, [currentImage, onActiveImageChange]);

  const markLoaded = useCallback((slideId: string) => {
    setLoadedImages((current) => ({ ...current, [slideId]: true }));
  }, []);

  const handleImageError = useCallback((slide: HeroSlide) => {
    if (slide.fallbackImage && slide.image !== slide.fallbackImage) {
      setFailedImages((current) => ({ ...current, [slide.id]: true }));
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSelectedIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);
    updateSelectedIndex();

    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', updateSelectedIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!emblaApi || slides.length < 2 || isHovered || !isDocumentVisible || reducedMotion) return;

    const intervalId = window.setInterval(() => emblaApi.scrollNext(), autoPlayInterval);
    return () => window.clearInterval(intervalId);
  }, [autoPlayInterval, emblaApi, isDocumentVisible, isHovered, reducedMotion, slides.length]);

  const goToSlide = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const slideItems = useMemo(() => slides.map((slide, index) => {
    const imageSrc = failedImages[slide.id] && slide.fallbackImage ? slide.fallbackImage : slide.image;
    const canOpenMovie = Boolean(onSlideClick && slide.id);
    const image = (
      <img
        src={imageSrc}
        alt={`${slide.title} promotional banner`}
        loading={index === 0 ? 'eager' : 'lazy'}
        onLoad={() => markLoaded(slide.id)}
        onError={() => handleImageError(slide)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          loadedImages[slide.id] ? 'opacity-100' : 'opacity-0',
        )}
      />
    );

    return (
      <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
        <div
          className={cn(
            'relative aspect-[16/9] overflow-hidden rounded-2xl bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:aspect-[16/6]',
            !loadedImages[slide.id] && 'animate-pulse',
            canOpenMovie && 'cursor-pointer',
          )}
        >
          {canOpenMovie ? (
            <button
              type="button"
              onClick={() => onSlideClick?.(slide.id)}
              className="absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`Open ${slide.title}`}
            >
              {image}
            </button>
          ) : image}

          {slide.showContent && (
            <div className="relative flex h-full items-center px-6 py-8 sm:px-10 lg:px-16">
              <div className="max-w-[520px]">
                {slide.badge && <span className="inline-flex rounded-full border border-red-400/50 bg-red-950/30 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white">{slide.badge}</span>}
                <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl lg:text-6xl">{slide.title}</h1>
                {slide.description && <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">{slide.description}</p>}
                {slide.buttonText && onSlideAction && <button type="button" onClick={() => onSlideAction(slide)} className="mt-6 inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{slide.buttonText}<ArrowRight className="h-4 w-4" /></button>}
              </div>
            </div>
          )}

          {showArrows && slides.length > 1 && (
            <div className="absolute bottom-5 right-5 flex gap-3">
              <button type="button" onClick={scrollPrev} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/80 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Previous slide"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={scrollNext} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/80 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Next slide"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
    );
  }), [failedImages, handleImageError, loadedImages, markLoaded, onSlideAction, onSlideClick, scrollNext, scrollPrev, showArrows, slides]);

  if (slides.length === 0) return null;

  return (
    <section
      className={cn('relative isolate overflow-hidden bg-transparent py-4 sm:py-6', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Featured movies"
    >
      <PageContainer>
        <div ref={emblaRef} className="overflow-hidden" role="region" aria-roledescription="carousel" aria-label="Featured movie banners">
          <div className="flex">{slideItems}</div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Featured movie slides">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-label={`Show ${slide.title}`}
              aria-selected={index === selectedIndex}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-1.5 rounded-full transition-[width,background-color] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
                index === selectedIndex ? 'w-8 bg-red-600' : 'w-1.5 bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      </PageContainer>
    </section>
  );
};
