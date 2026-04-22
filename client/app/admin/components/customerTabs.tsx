import React from 'react';

interface customerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function customerTabs({ activeTab, setActiveTab }: customerTabsProps) {
  const tabs = ['Customer List', 'Sales History', 'Order Management'];

  return (
    <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto custom-scrollbar w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm whitespace-nowrap rounded-lg transition-colors ${
              isActive 
                ? 'font-bold text-[#800000] bg-white shadow-sm border border-gray-100' 
                : 'font-medium text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}