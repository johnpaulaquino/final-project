'use client';

import { useState, useEffect } from 'react';
import CarouselBanner, { Banner } from './carouselBanner';

export default function featureBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // mock data simplified for images only
        const mockData: Banner[] = [
          { id: 1, image: 'banner1.png' },
          { id: 2, image: 'banner2.png' },
          { id: 3, image: 'banner3.png' },
        ];

        setBanners(mockData);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 h-[350px] rounded-[10px] bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10">
      {/* Carousel */}
      <div className="flex-1 h-[350px]">
        <CarouselBanner slides={banners} autoPlayInterval={3000} />
      </div>
    </div>
  );
}