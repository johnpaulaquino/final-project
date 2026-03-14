'use client'

import React from 'react';
import Image from 'next/image';

interface HeadNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function headNavbar({activeTab, setActiveTab}: HeadNavbarProps) {
  const navTabs = ['Home', 'Menu', 'Deals'];

  return (
    <nav className='fixed top-0 left-0 z-50 w-full shadow-sm bg-white flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-4 sm:px-6 py-3 sm:py-4 mx-auto'>    
        
      
      <div className='flex items-center gap-6 lg:gap-10'>
        
        {/* logo */}
        <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
          <Image
            src='/logo.jpg'
            alt='Biskota Logo'
            width={40} 
            height={40}
            className='object-contain rounded-full'
          />
          <span className='text-[#800000] font-bold text-lg sm:text-xl tracking-tight'>
            Biskota
          </span>
        </div>

        {/*buttons*/}
        <div className='relative hidden lg:flex items-center p-1 rounded-full border border-gray-100 bg-[#fcfcfc]'>
          
          {/* slide animation */}
          <div 
            className={`absolute left-1 top-1 bottom-1 w-24 bg-white border border-gray-100 shadow-sm rounded-full transition-transform duration-300 ease-in-out ${
              activeTab === 'Home' ? 'translate-x-0' : 
              activeTab === 'Menu' ? 'translate-x-full' : 
              'translate-x-[200%]' 
            }`}
          >
          </div>

          {/* buttons for home, menu and deals */}
          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer relative z-10 w-24 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                activeTab === tab
                  ? 'text-[#800000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>
        
      <div className='flex items-center gap-4 sm:gap-6'>
            
        {/* icon search bar */}
        <div className='relative hidden sm:block w-[200px] md:w-[240px] lg:w-[300px]'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400'>
            <Image
              src='/icons/search.png'
              alt='Search Icon'
              width={17} 
              height={17}
              className='object-contain rounded-full'
            />
          </div>
            
          <input 
            type='text' 
            placeholder='Search cravings...' 
            className='w-full pl-10 pr-4 py-2.5 bg-[#f6f7f9] border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#800000] text-gray-700 placeholder-gray-400 transition'
            />
        </div>

          {/* divider */}
        <div className='hidden sm:block h-7 w-px bg-gray-200'></div>

            {/* icon notification */}
          <div className='flex items-center gap-4 lg:gap-5 flex-shrink-0'>

          <button className='relative hover:opacity-75 transition w-6 h-6'>
            <Image
              src='/icons/notification.png'
              alt='Notification'
              width={25} 
              height={25}
              className='object-contain rounded-full'
            />
              {/* notification dot (ongoing palang) */}
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-[#800000] rounded-full border-2 border-white"></div>
          </button>

          {/* Cart */}
          <button className='hover:opacity-75 transition w-6 h-6'>
            {/* wait lang sa cart ico hahanap pa ng maayus */}
          </button>

          {/* icon */}
          <button className='hover:opacity-75 transition h-9 w-9 rounded-full bg-[#f6f7f9] border border-gray-200 flex items-center justify-center'>
            <Image
              src='/icons/profile.png'
              alt='Profile'
              width={18} 
              height={18}
              className='object-contain rounded-full'
            />
          </button>
        </div>

      </div>
    </nav>
  )
}