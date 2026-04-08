'use client';

import React, { useState } from 'react';
import { useBanner } from '../../../customer/context/contextBanner';

export default function Carousel() {
  const { banners, addBanner, removeBanner } = useBanner();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        // --- IMAGE COMPRESSION LOGIC (Prevents QuotaExceededError!) ---
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Max width to keep file size tiny
          const MAX_WIDTH = 1200; 
          const scaleSize = MAX_WIDTH / img.width;
          
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress to JPEG at 70% quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          addBanner(compressedBase64);
          
          // Clear the input so the same file can be selected again if needed
          e.target.value = ''; 
        };
        
        img.src = event.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> 
          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#800000]/5 px-3 py-1.5 rounded-[10px] border border-[#800000]/10">
            <span className="w-2 h-2 rounded-full bg-[#800000] animate-pulse"></span>
            <span className="text-[#800000] font-bold text-xs">{banners.length} Active</span>
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer bg-[#0B1527] hover:bg-gray-800 transition-all active:scale-95 text-white text-sm font-bold py-2.5 px-4 rounded-[10px] shadow-sm flex items-center gap-2 h-[42px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
              Upload Banner
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              accept="image/*" 
            />
            </label>

        </div>


      {/* CONTENT SECTION */}
      <div className="p-6 md:p-8 border border-gray-100 rounded-[10px] shadow-sm bg-white min-h-[400px]">
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
             <div className="w-16 h-16 bg-gray-50 rounded-[10px] flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <p className="text-gray-900 font-extrabold text-lg">No banners found</p>
             <p className="text-sm text-gray-400 mt-1 max-w-sm text-center">Upload your first image to activate the carousel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((banner, index) => (
              <div key={banner.id} className="group border border-gray-100 rounded-[10px] p-3 bg-white hover:border-gray-300 transition-colors">
                
                {/* Image Preview */}
                <div className="w-full h-40 bg-gray-50 rounded-[5px] mb-3 overflow-hidden relative border border-gray-100">
                  <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-black px-2 py-1 rounded-[5px] shadow-sm">
                    Slide {index + 1}
                  </div>
                  <img 
                    src={banner.image.startsWith('/') ? banner.image : `${banner.image}`} 
                    alt={`Banner ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-[5px] bg-emerald-50 text-[10px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (window.confirm("Remove this banner from the carousel?")) {
                        removeBanner(banner.id);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 rounded-[5px] transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}