"use client";

import { useState, useEffect } from "react";
import { useBanner } from "../../../customer/context/contextBanner"; 

interface CarouselProps {
  autoPlayInterval?: number;
}

export default function CarouselBanner({
  autoPlayInterval = 3000,
}: CarouselProps) {
  const { banners, isLoading } = useBanner();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(banners.length - 1);
    }
  }, [banners.length, currentIndex]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, banners.length, autoPlayInterval]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-300 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  const safeIndex = Math.min(currentIndex, Math.max(0, banners.length - 1));

  return (
    <div className="w-full h-full relative group">
      
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {banners.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative bg-gray-100">
            <img
              src={slide.image.startsWith("/") ? slide.image : `${slide.image}`}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-3 md:bottom-4 left-4 md:left-8 flex gap-2 md:gap-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
              index === safeIndex
                ? "w-8 md:w-10 bg-white shadow-sm"
                : "w-2 md:w-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* 🚀 FIX: Previous Arrow - Always visible on mobile (opacity-100), hidden until hover on desktop (md:opacity-0) */}
      <button
        onClick={handlePrev}
        type="button"
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-2 md:px-4 cursor-pointer group/arrow focus:outline-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/70 md:bg-white/30 md:group-hover/arrow:bg-white/50 focus:ring-4 focus:ring-white focus:outline-none backdrop-blur-sm shadow-sm md:shadow-none">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
          </svg>
        </span>
      </button>

      {/* 🚀 FIX: Next Arrow - Always visible on mobile (opacity-100), hidden until hover on desktop (md:opacity-0) */}
      <button
        onClick={handleNext}
        type="button"
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-2 md:px-4 cursor-pointer group/arrow focus:outline-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/70 md:bg-white/30 md:group-hover/arrow:bg-white/50 focus:ring-4 focus:ring-white focus:outline-none backdrop-blur-sm shadow-sm md:shadow-none">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
          </svg>
        </span>
      </button>
    </div>
  );
}