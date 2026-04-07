'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function profileDropDown({ setActiveTab }: { setActiveTab: (tab: string) => void }) {

  const handleProfileClick = () => {
    setActiveTab('AccountSetting');
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
      {/* profile info */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#800000] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
          A
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-[#0B1527] text-sm truncate">
            ASDASD
          </h3>
          <p className="text-xs text-gray-500 truncate">
            ASDASD@gmail.com
          </p>
        </div>
      </div>

      <div className="border-t border-gray-50"></div>

      {/* menus */}
      <div className="p-2 flex flex-col gap-1">
        <Link 
          href="/orders" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-sm">My Orders</span>
        </Link>

        <button 
          onClick={handleProfileClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-sm">
            Account Settings
          </span>
        </button>
      </div>

      <div className="border-t border-gray-50 mx-2"></div>

      {/* sign out button */}
      <div className="p-2 mb-1">
        <button 
          onClick={() => {
            console.log("Signing out...");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-[#F05252] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>

    </div>
  );
}