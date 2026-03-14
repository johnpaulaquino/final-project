'use client';

import React from 'react';
import CustomerSidebar from '../components/sidebar/customerSidebar';
import FeaturedBanners from '../components/carousel/featureBanners';
import CustomeRecommendation from '../components/products/customerRecommendation';

export default function homePage() {
  return (
      <main className="relative z-10 max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8">
        
        {/*left sidebar*/}
        <CustomerSidebar />

        {/*carousel and product*/}
        <div className="flex-1 w-full flex flex-col">
          <FeaturedBanners />
          <CustomeRecommendation />
        </div>
        
      </main>
  );
}