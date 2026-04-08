'use client';

import { useBanner } from '../../context/contextBanner';
import CarouselBanner from './carouselBanner';

export default function FeatureBanners() {
  const { banners } = useBanner();

  if (!banners || banners.length === 0) {
    return (
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 h-[350px] rounded-[10px] bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
           <span className="text-gray-400 font-bold">No Banners Available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10">
      <div className="flex-1 h-[350px]">

        <CarouselBanner slides={banners} autoPlayInterval={3000} />
      </div>
    </div>
  );
}