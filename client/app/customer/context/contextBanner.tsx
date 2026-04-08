'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Banner {
  id: string | number;
  image: string;
}

// Default fallback banners so the page isn't empty on first load
const defaultBanners: Banner[] = [
  { id: 1, image: '/banner1.png' },
  { id: 2, image: '/banner2.png' },
  { id: 3, image: '/banner3.png' }
];

interface BannerContextType {
  banners: Banner[];
  addBanner: (image: string) => void;
  removeBanner: (id: string | number) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount with a SAFETY NET
  useEffect(() => {
    try {
      const savedBanners = localStorage.getItem('biskota_banners');
      if (savedBanners) {
        setBanners(JSON.parse(savedBanners));
      }
    } catch (error) {
      console.error("Corrupted banner data found in LocalStorage. Resetting to defaults.");
      // Automatically clears the corrupted data to fix the loop
      localStorage.removeItem('biskota_banners'); 
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever banners change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('biskota_banners', JSON.stringify(banners));
    }
  }, [banners, isLoaded]);

  const addBanner = (image: string) => {
    const newBanner = { id: Date.now().toString(), image };
    setBanners((prev) => [...prev, newBanner]);
  };

  const removeBanner = (id: string | number) => {
    setBanners((prev) => prev.filter(banner => banner.id !== id));
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, removeBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
}