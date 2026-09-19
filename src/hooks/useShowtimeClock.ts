import { useEffect, useState } from 'react';

/** Recheck booking cutoffs while a schedule is open, including after returning to the tab. */
export function useShowtimeClock(): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 30_000);
    window.addEventListener('focus', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
    };
  }, []);
  return now;
}
