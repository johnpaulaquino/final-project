"use client";

import { useEffect } from "react";
import { useBanner } from "../../../customer/context/contextBanner"; 
import CarouselBanner from "./carouselBanner"; 

export default function FeatureBanners() {
  const { banners, isLoading, fetchLiveBanners } = useBanner();

  useEffect(() => {
    fetchLiveBanners();
  }, [fetchLiveBanners]);

  if (isLoading) {
    return (
      <div className="w-full mb-6 md:mb-10">
        {/* 🚀 FIX: Removed flex-1 and added a strict aspect ratio for mobile */}
        <div className="w-full aspect-[2/1] sm:aspect-[21/9] md:aspect-auto md:h-[350px] rounded-[10px] bg-gray-200 animate-pulse flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-gray-500 font-bold">Loading Banners...</span>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full mb-6 md:mb-10">
        <div className="w-full aspect-[2/1] sm:aspect-[21/9] md:aspect-auto md:h-[350px] rounded-[10px] bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
          <span className="text-gray-400 font-bold">No Banners Available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6 md:mb-10">
      {/* 🚀 FIX: This container now forces the banner to render exactly in this box */}
      <div className="w-full aspect-[2/1] sm:aspect-[21/9] md:aspect-auto md:h-[350px] relative rounded-[10px] overflow-hidden shadow-md">
        <CarouselBanner autoPlayInterval={3000} />
      </div>
    </div>
  );
}