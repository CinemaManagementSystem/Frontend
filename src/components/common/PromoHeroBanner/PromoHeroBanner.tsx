import { ArrowRight, Ticket } from 'lucide-react';

interface PromoHeroBannerProps {
  image: string | null;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  titleLevel?: 'h1' | 'h2' | 'h3';
  showContent?: boolean;
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const PRIMARY_BUTTON = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_rgba(229,9,20,.22)] transition hover:bg-primary/90 ${FOCUS}`;

export function PromoHeroBanner({
  image,
  title,
  description,
  buttonText,
  buttonHref,
  titleLevel = 'h2',
  showContent = true,
}: PromoHeroBannerProps) {
  const Title = titleLevel;

  return (
    <div className="relative aspect-auto min-h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#7d0009] via-[#1b060b] to-black shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:aspect-[16/6] sm:min-h-0">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-95 saturate-110" />}
      {showContent && <>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/42 to-black/5" />
        <div className="relative flex h-full max-w-[520px] flex-col justify-center px-5 py-6 sm:px-10 sm:py-8 lg:px-16">
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/50 bg-red-950/30 px-4 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-white sm:text-xs sm:tracking-[0.2em]">
            <Ticket className="h-3.5 w-3.5" aria-hidden="true" />Legend Cinema
          </span>
          <Title className="text-3xl font-extrabold leading-[0.98] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,.45)] sm:text-5xl lg:text-6xl">
            {title}
          </Title>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base lg:text-lg">{description}</p>
          <a href={buttonHref} className={`${PRIMARY_BUTTON} mt-4 w-fit sm:mt-6`}>
            {buttonText}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </>}
    </div>
  );
}
