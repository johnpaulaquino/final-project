'use client';

import React from 'react';

export default function profileInfo() {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-[#0B1527] mb-8">Personal Information</h2>
      
      <div className="flex items-center gap-5 mb-10 border-b border-gray-100 pb-8">
        <div className="w-20 h-20 bg-[#800000] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">A</div>
        <div>
          <button className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-2 bg-gray-50/50">Change Avatar</button>
          <p className="text-[11px] text-gray-400 font-medium">JPG, GIF or PNG. Max size of 2MB.</p>
        </div>
      </div>

      <form className="max-w-xl flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">FULL NAME</label>
          <input type="text" defaultValue="ASDASD" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">EMAIL ADDRESS</label>
          <input type="email" defaultValue="ASDASD@gmail.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]" />
        </div>
        <div className="pt-4">
          <button type="submit" className="bg-[#800000] hover:bg-red-900 text-white font-bold py-3 px-8 rounded-[12px] shadow-md transition-colors">Save Changes</button>
        </div>
      </form>
    </div>
  );
}