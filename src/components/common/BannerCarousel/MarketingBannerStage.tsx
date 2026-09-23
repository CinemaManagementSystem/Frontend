import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Banner, BannerSection } from '@/types/banner';
import { BannerCarousel } from './BannerCarousel';

interface MarketingBannerStageProps {
  section: BannerSection;
  className?: string;
  autoPlayInterval?: number;
  showCaptions?: boolean;
}

export function MarketingBannerStage({
  section,
  className,
  autoPlayInterval = 6000,
  showCaptions = false,
}: MarketingBannerStageProps) {
  const [activeImage, setActiveImage] = useState<string>();
  const [hasBanners, setHasBanners] = useState<boolean | null>(null);

  const handleBannersChange = useCallback((banners: Banner[]) => {
    setHasBanners(banners.length > 0);
  }, []);

  if (hasBanners === false) {
    return null;
  }

  return (
    <section className={cn('relative isolate overflow-hidden border-b border-white/10 bg-black py-6 sm:py-8', className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {activeImage && (
          <div className="absolute -inset-[12%]">
            <img
              src={activeImage}
              alt=""
              className="h-full w-full scale-[1.08] object-cover object-center opacity-85 blur-[56px] brightness-50 saturate-125 transition-opacity duration-500"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75" />
      </div>

      <div className="container-main">
        <BannerCarousel
          section={section}
          autoPlayInterval={autoPlayInterval}
          roundedClass="rounded-[20px]"
          className="relative z-10 w-full"
          frameMaxWidth="100%"
          showCaptions={showCaptions}
          showBackdrop={false}
          showImageOverlay={showCaptions}
          onActiveImageChange={setActiveImage}
          onBannersChange={handleBannersChange}
        />
      </div>
    </section>
  );
}
