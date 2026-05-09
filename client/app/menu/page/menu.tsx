"use client"; // Ensure this is a client component if it's handling state

import React from 'react';
import CustomerSidebar from '@/app/customer/components/sidebar/customerSidebar';
import CustomerMenu from '@/app/customer/components/products/customerMenus';

interface MenuPageProps {
  activeTab?: string;
  setActiveTab: (tab: string) => void;
}

export default function Menu({ activeTab, setActiveTab }: MenuPageProps) {
  return (
    <main className="max-w-[1500px] mx-auto pt-24 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8 pb-12">
      
      <div className="w-full xl:w-[320px] flex-shrink-0 xl:sticky xl:top-28 xl:self-start">
        <CustomerSidebar setActiveTab={setActiveTab} />
      </div>
      
      <div className="flex-1 w-full flex flex-col min-w-0">
        <CustomerMenu />
      </div>
      
    </main>
  );
}