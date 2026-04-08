'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isCustomersOpen, setIsCustomersOpen] = useState(true);

  return (
    <aside className="w-[280px] bg-white sm:bg-white h-screen flex flex-col flex-shrink-0 sticky top-0 border-r border-gray-100">
      
      {/* Brand Logo Area */}
      <div className="h-20 flex items-center px-8 gap-3">
          <Image 
            src="/logo.jpg" 
            alt="Logo" 
            width={36} 
            height={36} 
            className='rounded-full'
          />
        <span className="text-xl font-bold text-gray-900 tracking-tight">Biskota</span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5 custom-scrollbar">
        
        {/* Overview */}
        <button 
          onClick={() => setActiveTab('Overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors w-full text-left ${
            activeTab === 'Overview' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Overview
        </button>

        {/* Notifications */}
        <button 
          onClick={() => setActiveTab('Notifications')}
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full ${
            activeTab === 'Notifications' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Notifications
          </div>
          <span className="w-5 h-5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
        </button>

        {/* Analytics */}
        <button 
          onClick={() => setActiveTab('Analytics')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left ${
            activeTab === 'Analytics' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Analytics
        </button>

        {/* Products Dropdown */}
        <div>
          <button 
            onClick={() => setIsProductsOpen(!isProductsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Products
            </div>
            <svg className={`w-4 h-4 transition-transform text-gray-400 ${isProductsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isProductsOpen && (
            <div className="flex flex-col gap-1 pl-[44px] pr-4 py-2 relative before:content-[''] before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
              <button onClick={() => setActiveTab('Inventory List')} className={`py-2 text-sm text-left transition-colors ${activeTab === 'Inventory List' ? 'text-[#800000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Inventory List</button>
              <button onClick={() => setActiveTab('Add Item')} className={`py-2 text-sm text-left transition-colors ${activeTab === 'Add Item' ? 'text-[#800000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Add Item</button>
              <button onClick={() => setActiveTab('Categories')} className={`py-2 text-sm text-left transition-colors ${activeTab === 'Categories' ? 'text-[#800000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Categories</button>
              <button onClick={() => setActiveTab('Carousel')} className={`py-2 text-sm text-left transition-colors ${activeTab === 'Carousel' ? 'text-[#800000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Carousel</button>
            </div>
          )}
        </div>

        {/* Inventory Check */}
        <button 
          onClick={() => setActiveTab('Inventory Check')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left ${
            activeTab === 'Inventory Check' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          Inventory Check
        </button>
        

        {/* Customers Dropdown */}
        <button 
          onClick={() => setIsCustomersOpen(!isCustomersOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Customers
          </div>
          <svg className={`w-4 h-4 transition-transform text-gray-400 ${isCustomersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isCustomersOpen && (
            <div className="flex flex-col gap-1 pl-[44px] pr-4 py-2 relative before:content-[''] before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
              <button onClick={() => setActiveTab('Customer List')} className={`py-2 text-sm text-left transition-colors ${activeTab === 'Customer List' ? 'text-[#800000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Customer List</button>
              <button onClick={() => setActiveTab('Sales History')} className={`py-2 text-sm text-left transition-colors ${activeTab === 'Sales History' ? 'text-[#800000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}>Sales History</button>
            </div>
          )}
      </div>

      {/* Admin User Profile Tag */}
      <div className="p-4 mb-2">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:border-gray-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 text-[#800000] font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-none mb-1">Admin User</p>
              <p className="text-[10px] text-gray-400 font-medium leading-none">System Manager</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}