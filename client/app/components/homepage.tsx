'use client';

import { useState, useRef } from 'react';
import FeatureCard from './featureCard';
import { useRouter } from 'next/navigation';

interface HomePageProps {
  activeTab?: string;
  setActiveTab: (tab: string) => void;
}

export default function HomePage({ activeTab, setActiveTab }: HomePageProps ) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const containerWidth = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollPosition / containerWidth);
    setActiveIndex(newIndex);
  };

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: containerWidth * index,
      behavior: 'smooth',
    });
  };

  const handleViewMenu = () => {
    // This perfectly sends them to your new public menu page!
    router.push('/menu?tab=Menu');
  };

  return (
    <main className='px-6 pt-32 pb-24 text-center w-full max-w-7xl mx-auto flex-grow'>
      
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-5xl md:text-6xl font-extrabold text-[#7f1d1d] tracking-tight mb-8 drop-shadow-sm'>
          Biskota
        </h1>
            
        <p className='text-lg md:text-xl text-slate-700 leading-relaxed mb-12'>
          At Biskota, we believe wellness and indulgence can coexist. Our protein-rich pastries prioritize your health while delivering exceptional flavor in every bite.
        </p>

        <div className='flex flex-col md:flex-row items-center justify-center gap-4 mb-24'>
          <button className='w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#7f1d1d] text-white font-bold tracking-wide shadow-xl shadow-red-900/20 hover:bg-[#631515] transition transform hover:-translate-y-1'>
            Open Shop
          </button>

          <button 
            type='button' 
            onClick={handleViewMenu} 
            className='w-full md:w-auto px-8 py-3.5 rounded-xl border-2 border-[#7f1d1d] text-[#7f1d1d] bg-transparent font-bold tracking-wide hover:bg-red-50 transition transform hover:-translate-y-1'
          >
            View Menu
          </button>
        </div>
      </div>

      <div className='grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto p-4'>
        <FeatureCard 
          imageSrc='/order-management.png'
          title='Order Management'
          desc='Track custom cakes, daily pastries, and catering orders in real-time.'
        />
        <FeatureCard 
          imageSrc='/loyalty-program.png'
          title='Loyalty Program'
          desc='Manage your regulars and track their favorite treats.'
        />
        <FeatureCard 
          imageSrc='/pastries-view.png' 
          title='Kitchen View'
          desc='Coordinate baking schedules and inventory for the kitchen staff.'
        />
      </div>
    </main>
  );
}