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
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 h-[350px] rounded-[10px] bg-gray-200 animate-pulse flex items-center justify-center border-2 border-dashed border-gray-300">
          <span className="text-gray-500 font-bold">Loading Banners...</span>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 h-[350px] rounded-[10px] bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
          <span className="text-gray-400 font-bold">No Banners Available</span>
        </div>
      </div>
    );
  }

  // 3. Render Carousel ONLY when data exists
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-10">
      <div className="flex-1 h-[350px]">
        <CarouselBanner autoPlayInterval={3000} />
      </div>
    </div>
  );
}