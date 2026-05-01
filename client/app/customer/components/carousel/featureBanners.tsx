"use client";

import { useBanner } from "../../../customer/context/contextBanner"; // 🚀 Adjust path to your context
import CarouselBanner from "./carouselBanner"; // 🚀 Adjust path to your carousel component

export default function FeatureBanners() {
  const { banners, isLoading } = useBanner();

  // Only show the "No Banners" UI if it is done loading AND the array is empty
  if (!isLoading && (!banners || banners.length === 0)) {
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
        {/* Removed 'slides={banners}' since CarouselBanner reads from context directly */}
        <CarouselBanner autoPlayInterval={3000} />
      </div>
    </div>
  );
}