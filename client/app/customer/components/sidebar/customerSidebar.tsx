"use client";

import { useState, useEffect } from "react";
import SideProducts from "./sideProducts";
import { apiClient } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  price: string;
  rating: string;
  image: string;
  description?: string;
  category?: string;
}

interface CustomerSidebarProps {
  setActiveTab?: (tab: string) => void;
}

export default function CustomerSidebar({
  setActiveTab,
}: CustomerSidebarProps) {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // 🚀 NEW: State for mobile dropdown
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchSidebarProducts = async () => {
      try {
        const response = await apiClient.publicGet(
          "/products/tags?skip=1&limit=10",
        );
        const bestSellersRaw = response?.data?.best_sellers || response?.best_sellers || [];
        const newProductsRaw = response?.data?.new_products || response?.new_products || [];

        const formatProduct = (item: any): Product => ({
          id: item.Products?.id || Math.random().toString(),
          name: item.Products?.product_name || "Unknown Product",
          price: `₱${item.Products?.price || 0}`,
          rating: item.avg_rating !== null && item.avg_rating !== undefined ? Number(item.avg_rating).toFixed(1) : "0.0",
          image: item.images && item.images.length > 0 ? item.images[0].image_url : "/products/placeholder-image.jpg",
          description: item.description,
          category: item.Products?.category,
        });

        setBestSellers(bestSellersRaw.map(formatProduct));
        setNewProducts(newProductsRaw.map(formatProduct));
      } catch (err: any) {
        console.error("Failed to load recommended products", err);
        setError(err.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSidebarProducts();
  }, []);

  useEffect(() => {
    const navbar = document.querySelector("nav");
    if (navbar) {
      if (selectedProduct !== null) {
        navbar.style.visibility = "hidden";
        navbar.style.opacity = "0";
      } else {
        navbar.style.visibility = "visible";
        navbar.style.opacity = "1";
      }
    }
    return () => {
      if (navbar) {
        navbar.style.visibility = "visible";
        navbar.style.opacity = "1";
      }
    };
  }, [selectedProduct]);

  if (isLoading) {
    return (
      <aside className="w-full bg-white xl:rounded-[10px] p-4 xl:p-6 shadow-sm flex justify-center items-center rounded-[10px]">
        <p className="text-gray-500 font-medium animate-pulse text-sm xl:text-base">Loading items...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-full bg-white xl:rounded-[10px] p-4 xl:p-6 shadow-sm flex justify-center items-center rounded-[10px]">
        <p className="text-red-500 text-sm font-medium">Unable to load recommendations.</p>
      </aside>
    );
  }

  return (
    <aside className="w-full relative z-10 flex flex-col gap-2 xl:gap-0">
      
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="xl:hidden w-full flex items-center justify-between bg-white p-4 rounded-[10px] shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">Best Sellers & New Products</span>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isMobileOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`bg-white rounded-[10px] p-4 shadow-sm xl:shadow-xl xl:p-6 ${isMobileOpen ? 'block' : 'hidden'} xl:block`}>
        
        {/* Your Exact Best Seller Block */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6 px-1 xl:px-0">
            <h2 className="text-base xl:text-lg font-bold text-gray-900">Best Seller</h2>
          </div>
          
          <div className="flex flex-row xl:flex-col gap-3 xl:gap-4 overflow-x-auto xl:overflow-visible snap-x snap-mandatory scroll-smooth pb-2 xl:pb-0 px-1 xl:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                <div
                  key={`best-${item.id}-${index}`}
                  className="snap-center min-w-[240px] xl:min-w-0 flex-shrink-0 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <SideProducts item={item} />
                </div>
              ))
            ) : (
              <p className="text-xs xl:text-sm text-gray-500">No best sellers yet.</p>
            )}
          </div>
        </div>

        <div className="hidden xl:block h-[1px] w-full bg-gray-100 mb-8"></div>

        {/* Your Exact New Products Block */}
        <div className="mb-2 xl:mb-8">
          <h2 className="text-base xl:text-lg font-bold text-gray-900 mb-6 px-1 xl:px-0">New Product</h2>

          <div className="flex flex-row xl:flex-col gap-3 xl:gap-4 overflow-x-auto xl:overflow-visible snap-x snap-mandatory scroll-smooth pb-2 xl:pb-0 px-1 xl:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {newProducts.length > 0 ? (
              newProducts.slice(0, 4).map((item, index) => (
                <div
                  key={`new-${item.id}-${index}`}
                  onClick={() => setSelectedProduct(item)}
                  className="snap-center min-w-[240px] xl:min-w-0 flex-shrink-0 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <SideProducts item={item} />
                </div>
              ))
            ) : (
              <p className="text-xs xl:text-sm text-gray-500">No new products available.</p>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}