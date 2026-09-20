import React, { useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateItem {
  dateStr: string;
  dayName: string;
  dayNum: string;
  monthName: string;
  isToday: boolean;
  hasShowtimes: boolean;
}

interface DateSelectorProps {
  dateList: DateItem[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'home';
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  dateList,
  selectedDate,
  onSelectDate,
  className = '',
  showLabel = true,
  variant = 'default',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const button = selectedButtonRef.current;
    if (!container || !button) return;
    if (button.offsetLeft < container.scrollLeft || button.offsetLeft + button.offsetWidth > container.scrollLeft + container.clientWidth) {
      container.scrollTo({ left: Math.max(0, button.offsetLeft - 8), behavior: 'auto' });
    }
  }, [selectedDate]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -240 : 240;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <section className={cn(
      variant === 'home' ? 'bg-transparent py-0' : 'bg-card border-b border-white/10 py-3.5',
      className,
    )} aria-label="Screening dates">
      <div className={variant === 'home' ? 'w-full' : 'container-main'}>
        <div className="flex items-center gap-3">
          {showLabel && (
            <div className="flex items-center gap-2 shrink-0 border-r border-white/10 pr-4 text-xs font-bold text-white/50 uppercase tracking-widest hidden sm:flex">
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              <span>Select Date</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleScroll('left')}
            className={cn('shrink-0 rounded-xl bg-white/5 p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]', variant === 'home' && 'hidden')}
            aria-label="Previous dates"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className={cn(
              'no-scrollbar relative flex flex-1 items-center overflow-x-auto py-1',
              variant === 'home' ? 'snap-x snap-mandatory gap-6 py-0' : 'gap-2.5',
            )}
          >
            {dateList.map((d) => {
              const active = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  ref={active ? selectedButtonRef : undefined}
                  type="button"
                  onClick={() => onSelectDate(d.dateStr)}
                  aria-pressed={active}
                  aria-label={`${d.isToday ? 'Today, ' : ''}${d.dayName} ${d.monthName} ${d.dayNum}${d.hasShowtimes ? ', screenings available' : ', no upcoming screenings'}`}
                  className={cn(
                    variant === 'home'
                      ? 'snap-start flex min-h-[82px] min-w-[164px] shrink-0 flex-col items-center justify-center gap-[2px] rounded-lg border border-white/20 bg-black/60 px-4 py-2.5 transition duration-200 hover:border-white/50'
                      : 'date-card min-h-[76px] min-w-[112px] sm:min-h-[92px] sm:min-w-[148px]',
                    variant === 'home'
                      ? active
                        ? 'border-red-600 shadow-[0_0_20px_rgba(225,29,46,0.25)] text-white'
                        : 'text-white/70'
                      : active ? 'date-card-selected' : 'date-card-unselected'
                  )}
                >
                  <span className="date-selector-day text-base font-medium leading-none text-[#AAA4A7]">
                    {d.isToday ? 'Today' : d.dayName}
                  </span>
                  <span className="date-selector-number text-2xl font-semibold leading-none text-[#F5F5F5]">
                    {d.dayNum}
                  </span>
                  <span className="date-selector-month text-base font-normal leading-none text-[#AAA4A7]">
                    {d.monthName}
                  </span>

                  {d.hasShowtimes && variant !== 'home' && (
                    <span
                      className={cn(
                        'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                        active ? 'bg-white' : 'bg-[var(--primary)]/70'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            className={cn('shrink-0 rounded-xl bg-white/5 p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]', variant === 'home' && 'hidden')}
            aria-label="Next dates"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
