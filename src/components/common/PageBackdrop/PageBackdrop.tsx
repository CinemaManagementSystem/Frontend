import React, { useEffect, useState } from 'react';
import { useHeroBackdrop } from '@/context/HeroBackdropContext';

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reducedMotion;
};

export const PageBackdrop: React.FC = () => {
  const { currentImage, previousImage } = useHeroBackdrop();
  const reducedMotion = useReducedMotion();
  const [currentVisible, setCurrentVisible] = useState(Boolean(currentImage));

  useEffect(() => {
    if (!currentImage) {
      setCurrentVisible(false);
      return;
    }
    if (reducedMotion) {
      setCurrentVisible(true);
      return;
    }
    setCurrentVisible(false);
    const frame = window.requestAnimationFrame(() => setCurrentVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [currentImage, reducedMotion]);

  const transitionClass = reducedMotion ? '' : 'transition-opacity duration-700 ease-in-out';
  const imageClass = `absolute inset-0 h-full w-full scale-125 object-cover blur-[80px] saturate-150 select-none will-change-opacity ${transitionClass}`;
  const previousOpacity = currentVisible ? 'opacity-0' : 'opacity-70';
  const currentOpacity = currentVisible ? 'opacity-70' : 'opacity-0';

  return (
<<<<<<< Updated upstream
    <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] overflow-hidden bg-gradient-to-b from-[#2a0710] to-[#0a0204]" aria-hidden="true">
      {previousImage && <img src={previousImage} alt="" className={`${imageClass} ${previousOpacity}`} />}
      {currentImage && <img key={currentImage} src={currentImage} alt="" className={`${imageClass} ${currentOpacity}`} />}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0204]/70 to-[#0a0204]" />
=======
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] overflow-hidden bg-gradient-to-b from-rose-900/10 via-background/50 to-background dark:from-[#3a0a10] dark:to-[#050505]" aria-hidden="true">
      {previousImage && <img src={previousImage} alt="" className={`${imageClass} opacity-40 dark:opacity-60`} />}
      {currentImage && <img key={currentImage} src={currentImage} alt="" className={`${imageClass} ${currentVisible ? 'opacity-40 dark:opacity-60' : 'opacity-0'}`} />}
      <div className="absolute inset-0 bg-background/20 dark:bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
>>>>>>> Stashed changes
    </div>
  );
};
