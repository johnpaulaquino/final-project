'use client';

import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function accountSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuGroups = [
    {
      title: 'ACCOUNT',
      items: [
        { 
          id: 'Profile Info', 
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' 
        },
        { 
          id: 'Address Book', 
          icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' 
        },
        { 
          id: 'Security', 
          icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' 
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8 w-full bg-white sm:bg-transparent p-4 sm:p-0 rounded-[20px] sm:rounded-none shadow-sm sm:shadow-none border sm:border-none border-gray-100">
      {menuGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 px-4">
            {group.title}
          </h3>
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`cursor-pointer flex items-center justify-between w-full text-left px-4 py-3.5 rounded-[12px] text-sm font-medium transition-all ${
                    isActive ? 'bg-[#0B1527] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.id}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}