"use client";

import React from "react";
import CustomerSidebar from "../components/sidebar/customerSidebar";
import FeaturedBanners from "../components/carousel/featureBanners";
import CustomeRecommendation from "../components/products/customerRecommendation";

interface HomePageProps {
  activeTab?: string;
  setActiveTab: (tab: string) => void;
}

export default function HomePage({ activeTab, setActiveTab }: HomePageProps) {
  return (
    <main className="px-6 pt-25 pb-24 max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8 pb-12">
      
      <div className="w-full xl:w-[320px] flex-shrink-0 xl:sticky xl:top-28 xl:self-start">
        <CustomerSidebar setActiveTab={setActiveTab} />
      </div>

      <div className="flex-1 w-full flex flex-col min-w-0">
        <FeaturedBanners />
        <CustomeRecommendation />
      </div>
      
    </main>
  );
}