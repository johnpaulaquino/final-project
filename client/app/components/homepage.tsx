'use client';

import Image from 'next/image';
import FeatureCard from './featureCard';

export default function homepage() {
  return (
    <main className='px-6 pt-16 pb-24 md:pt-24 text-center max-w-4xl mx-auto'>
      <h1 className='text-5xl md:text-6xl font-extrabold text-[#7f1d1d] tracking-tight mb-8 drop-shadow-sm'>
          Biskota
      </h1>
          
      <p className='text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto mb-12'>
        At Biskota, we believe wellness and indulgence can coexist. Our protein-rich pastries prioritize your health while delivering exceptional flavor in every bite.
      </p>


      <div className='flex flex-col md:flex-row items-center justify-center gap-4 mb-24'>
        <button className='w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#7f1d1d] text-white font-bold tracking-wide shadow-xl shadow-red-900/20 hover:bg-[#631515]  transition transform hover:-translate-y-1'>
          Open Shop
        </button>

        <button className='w-full md:w-auto px-8 py-3.5 rounded-xl border-2 border-[#7f1d1d] text-[#7f1d1d] bg-transparent font-bold tracking-wide hover:bg-red-50  transition transform hover:-translate-y-1'>
          View Menu
        </button>

      </div>

      <div className='grid md:grid-cols-3 gap-6 text-left max-w-6xl mx-auto p-4'>
              
        {/* Card 1 */}
        <FeatureCard 
          imageSrc='/order-management.png'
          title='Order Management'
          desc='Track custom cakes, daily pastries, and catering orders in real-time.'
        />

        {/* Card 2 */}
        <FeatureCard 
          imageSrc='/loyalty-program.png'
          title='Loyalty Program'
          desc='Manage your regulars and track their favorite treats.'
        />

        {/* Card 3 */}
        <FeatureCard 
          imageSrc='/pastries-view.png' 
          title='Kitchen View'
          desc='Coordinate baking schedules and inventory for the kitchen staff.'
        />

      </div>
    </main>
  );
}