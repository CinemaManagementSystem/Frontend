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
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  dateList,
  selectedDate,
  onSelectDate,
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
    <section className="border-b border-border bg-card/60 py-3.5" aria-label="Screening dates">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0 border-r border-border pr-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:flex">
            <Calendar className="w-4 h-4 text-[var(--primary)]" />
            <span>Select Date</span>
          </div>

          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Previous dates"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="no-scrollbar relative flex items-center gap-2.5 overflow-x-auto py-1 flex-1"
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
                    'date-card',
                    active ? 'date-card-selected' : 'date-card-unselected'
                  )}
                >
                  <span className={cn('text-[10px] font-black uppercase tracking-widest', active ? 'text-white/90' : 'text-muted-foreground')}>
                    {d.isToday ? 'Today' : d.dayName}
                  </span>
                  <span className="text-base sm:text-lg font-black my-0.5 tracking-tight leading-none">
                    {d.dayNum}
                  </span>
                  <span className={cn('text-[9px] uppercase font-black tracking-wider', active ? 'text-white/80' : 'text-muted-foreground')}>
                    {d.monthName}
                  </span>

                  {d.hasShowtimes && (
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
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Next dates"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};