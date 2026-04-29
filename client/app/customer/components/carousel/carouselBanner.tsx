"use client";

import { useState, useEffect } from "react";
import { useBanner } from "../../../customer/context/contextBanner"; // 🚀 Adjust path if needed!

interface CarouselProps {
  autoPlayInterval?: number;
}

export default function CarouselBanner({
  autoPlayInterval = 3000,
}: CarouselProps) {
  // 🚀 Read directly from the Context!
  const { banners, isLoading } = useBanner();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carousel Timer Logic
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Loading UI while the Context is fetching
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[300px] bg-gray-50 animate-pulse rounded-[10px] flex items-center justify-center shadow-md">
        <svg
          className="w-8 h-8 text-gray-300 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  // Fallback if the database is completely empty
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full relative overflow-hidden group shadow-md rounded-[10px]">
      {/* Images */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            <img
              src={slide.image.startsWith("/") ? slide.image : `${slide.image}`}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-8 flex gap-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-10 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Previous Arrow */}
      <button
        onClick={handlePrev}
        type="button"
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/arrow focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover/arrow:bg-white/50 focus:ring-4 focus:ring-white focus:outline-none backdrop-blur-sm">
          <svg
            className="w-5 h-5 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      {/* Next Arrow */}
      <button
        onClick={handleNext}
        type="button"
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/arrow focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover/arrow:bg-white/50 focus:ring-4 focus:ring-white focus:outline-none backdrop-blur-sm">
          <svg
            className="w-5 h-5 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
}
