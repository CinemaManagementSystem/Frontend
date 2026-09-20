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

  const imageClass = `absolute inset-0 h-full w-full scale-125 object-cover blur-3xl saturate-150 ${reducedMotion ? '' : 'transition-opacity duration-700'}`;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] overflow-hidden bg-gradient-to-b from-[#3a0a10] to-[#050505]" aria-hidden="true">
      {previousImage && <img src={previousImage} alt="" className={`${imageClass} opacity-60`} />}
      {currentImage && <img key={currentImage} src={currentImage} alt="" className={`${imageClass} ${currentVisible ? 'opacity-60' : 'opacity-0'}`} />}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
    </div>
  );
};
