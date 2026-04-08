'use client';

import React from 'react';

interface HeadNavbarProps {
  activeTab: string;
}

export default function HeadNavbar({ activeTab }: HeadNavbarProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8 border-b border-transparent">
      
      {/* Dynamic Page Title */}
      <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">
        {activeTab}
      </h1>
      
      {/* Right Side Tools */}
      <div className="flex items-center gap-6">
        
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-[280px] pl-10 pr-4 py-2.5 bg-[#f6f7f9] border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-[#800000]/10 text-gray-700 placeholder-gray-400 transition-all"
          />
        </div>
        
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" fill="none" 
              stroke="#9e9e9e"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
            <path d="M14 21H10M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z" />
          </svg>
          {/* Red Dot Indicator */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#800000] border border-white rounded-full"></span>
        </button>

      </div>
    </header>
  );
}