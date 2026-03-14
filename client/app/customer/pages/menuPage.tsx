import React from 'react'

import CustomerSidebar from '../components/sidebar/customerSidebar';
import CustomerMenu from '../components/products/customerMenus';


export default function menu() {
  return (
    <main className="relative z-10 max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8">
      <CustomerSidebar />
      
      <div className="flex-1 w-full flex flex-col">
        <CustomerMenu />
      </div>
      
    </main>
  );
}
