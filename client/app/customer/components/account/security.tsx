'use client';

import React from 'react';

export default function securitySettings() {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-[#0B1527] mb-8">Change Password</h2>
      
      <form className="max-w-xl flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CURRENT PASSWORD</label>
          <input 
            type="password" 
            placeholder="Old Password" 
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/30" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">NEW PASSWORD</label>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">CONFIRM NEW</label>
            <input 
              type="password" 
              placeholder="Password Confirmation" 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/30" 
            />
          </div>
        </div>
        <div className="flex items-center gap-6 pt-4">
          <button type="submit" className="bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-[12px] shadow-md transition-colors">Update Password</button>
          <button type="button" className="text-sm font-bold text-[#800000] hover:text-red-900 transition-colors">Forgot Password?</button>
        </div>
      </form>
    </div>
  );
}