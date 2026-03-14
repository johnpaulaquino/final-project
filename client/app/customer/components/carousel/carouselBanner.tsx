'use client';

import { useState, useEffect } from 'react';

export interface Banner {
  id: number;
  image: string;
}

interface CarouselProps {
  slides: Banner[];
  autoPlayInterval?: number;
}

export default function carouselBanner({ slides, autoPlayInterval = 3000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval); 
    
    return () => clearInterval(timer);
  }, [currentIndex, slides.length, autoPlayInterval]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full h-full relative overflow-hidden group shadow-md rounded-[10px]">
      
      {/*ito yung sa images ng carousel*/}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            <img 
              src={slide.image} 
              alt="Banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/*dots*/}
      <div className="absolute bottom-4 left-8 flex gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-10 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/*arrow para sa previous at next*/}
      <button 
        onClick={handlePrev}
        type="button" 
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/arrow focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover/arrow:bg-white/50 focus:ring-4 focus:ring-white focus:outline-none backdrop-blur-sm">
          {/*nag hahanap pa ko ng magandang icon*/}
          <span className="sr-only">
            Previous
          </span>
        </span>
      </button>
      
      <button 
        onClick={handleNext}
        type="button" 
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/arrow focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover/arrow:bg-white/50 focus:ring-4 focus:ring-white focus:outline-none backdrop-blur-sm">
          {/*nag hahanap pa ko ng magandang icon*/}
          <span className="sr-only">
            Next
          </span>
        </span>
      </button>
    </div>
  );
}