import React, { useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

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

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -240 : 240;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="bg-card/95 backdrop-blur-md border-b border-border py-3.5 sticky top-16 lg:top-20 z-20 shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Header Label */}
          <div className="flex items-center gap-2 shrink-0 border-r border-border pr-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:flex">
            <Calendar className="w-4 h-4 text-[#E50914]" />
            <span>Select Date</span>
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            aria-label="Previous dates"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Date List */}
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex items-center gap-2.5 overflow-x-auto py-1 scroll-smooth flex-1"
          >
            {dateList.map((d) => {
              const active = selectedDate === d.dateStr;
              return (
                <motion.button
                  key={d.dateStr}
                  type="button"
                  onClick={() => onSelectDate(d.dateStr)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex min-w-[72px] sm:min-w-[80px] flex-col items-center justify-center rounded-2xl border px-3 py-2.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${
                    active
                      ? 'border-[#E50914] bg-[#E50914] font-bold text-white shadow-lg shadow-[#E50914]/30'
                      : 'border-border/60 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      active ? 'text-white/90' : 'text-muted-foreground'
                    }`}
                  >
                    {d.isToday ? 'Today' : d.dayName}
                  </span>
                  <span className="text-base sm:text-lg font-black my-0.5 tracking-tight leading-none">
                    {d.dayNum}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider ${
                      active ? 'text-white/80' : 'text-muted-foreground/80'
                    }`}
                  >
                    {d.monthName}
                  </span>

                  {/* Indicator for available showtimes */}
                  {d.hasShowtimes && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        active ? 'bg-white' : 'bg-[#E50914]'
                      }`}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            aria-label="Next dates"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
