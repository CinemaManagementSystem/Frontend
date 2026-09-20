import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCinemaStore } from '@/store/cinemaStore';
import { cn } from '@/lib/utils';

interface CinemaSelectProps {
  onSelect?: () => void;
  className?: string;
  showLabel?: boolean;
  placeholder?: string;
}

export const CinemaSelect: React.FC<CinemaSelectProps> = ({
  onSelect,
  className = '',
  showLabel = false,
  placeholder = 'All Cinemas',
}) => {
  const { cinemas, selectedCinemaId, loading, error, fetchCinemas, selectCinema } = useCinemaStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void fetchCinemas();
  }, [fetchCinemas]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cinemaId: string) => {
    selectCinema(cinemaId);
    onSelect?.();
    setIsOpen(false);
  };

  const selectedCinema = cinemas.find(c => c.id === selectedCinemaId);
  const displayText = selectedCinema?.name || (selectedCinemaId === 'ALL' ? 'All Cinemas' : placeholder);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition-colors hover:border-[var(--primary)]/60 hover:bg-white/[0.06]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Choose a cinema"
      >
        <MapPin className="h-4 w-4 text-[var(--primary)] shrink-0" aria-hidden="true" />
        {showLabel && <span className="hidden sm:inline">{displayText}</span>}
        <ChevronDown className={cn('h-3.5 w-3.5 text-white/50 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="location-dropdown"
              role="listbox"
              aria-label="Cinema locations"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedCinemaId === 'ALL'}
                onClick={() => handleSelect('ALL')}
                className={cn('location-dropdown-item w-full text-left', selectedCinemaId === 'ALL' && 'location-dropdown-item-selected')}
              >
                <MapPin className="h-4 w-4 text-[var(--primary)] shrink-0" aria-hidden="true" />
                <span>All Cinemas</span>
                {selectedCinemaId === 'ALL' && <Check className="h-4 w-4 text-[var(--primary)] ml-auto" aria-hidden="true" />}
              </button>
              <div className="location-dropdown-divider" aria-hidden="true" />
              {loading && cinemas.length === 0 ? (
                <div className="px-4 py-3 text-sm text-white/50">Loading cinemas...</div>
              ) : (
                cinemas.map((cinema) => (
                  <button
                    key={cinema.id}
                    type="button"
                    role="option"
                    aria-selected={selectedCinemaId === cinema.id}
                    onClick={() => handleSelect(cinema.id)}
                    className={cn('location-dropdown-item w-full text-left', selectedCinemaId === cinema.id && 'location-dropdown-item-selected')}
                  >
                    <MapPin className="h-4 w-4 text-[var(--primary)] shrink-0" aria-hidden="true" />
                    <span>{cinema.name}{cinema.city ? ` (${cinema.city})` : ''}</span>
                    {selectedCinemaId === cinema.id && <Check className="h-4 w-4 text-[var(--primary)] ml-auto" aria-hidden="true" />}
                  </button>
                ))
              )}
              {!loading && !error && cinemas.length === 0 && (
                <div className="px-4 py-3 text-sm text-white/50">No cinemas available</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};