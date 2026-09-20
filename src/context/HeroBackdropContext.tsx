import React, { createContext, useContext, useMemo, useState } from 'react';

interface HeroBackdropContextValue {
  currentImage?: string;
  previousImage?: string;
  setCurrentImage: (image?: string) => void;
}

const fallbackContext: HeroBackdropContextValue = {
  currentImage: undefined,
  previousImage: undefined,
  setCurrentImage: () => undefined,
};

const HeroBackdropContext = createContext<HeroBackdropContextValue>(fallbackContext);

export const HeroBackdropProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentImage, setCurrentImageState] = useState<string>();
  const [previousImage, setPreviousImage] = useState<string>();

  const setCurrentImage = (image?: string) => {
    setCurrentImageState((current) => {
      if (current === image) return current;
      setPreviousImage(current);
      return image;
    });
  };

  const value = useMemo(() => ({ currentImage, previousImage, setCurrentImage }), [currentImage, previousImage]);
  return <HeroBackdropContext.Provider value={value}>{children}</HeroBackdropContext.Provider>;
};

export const useHeroBackdrop = () => {
  return useContext(HeroBackdropContext);
};
