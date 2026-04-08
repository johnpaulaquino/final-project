"use client";

import { useState, useEffect } from "react";
import SideProducts from "./sideProducts";
import { apiClient } from "@/lib/api";

// 1. Updated Interface: 'id' must be a string to support FastAPI's UUIDs
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

export default function customerSidebar({
  setActiveTab,
}: CustomerSidebarProps) {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchSidebarProducts = async () => {
      try {
        // 2. Use publicGet because this route doesn't need auth
        const response = await apiClient.publicGet(
          "/api/v1/biskota/products/with?skip=1&limit=10",
        );

        // Safely extract the data (handling potential nulls from the backend)
        // Adjust response.data depending on your exact FastAPI response wrapper
        const bestSellersRaw =
          response?.data?.best_sellers || response?.best_sellers || [];
        const newProductsRaw =
          response?.data?.new_products || response?.new_products || [];

        // 3. Helper function to map the complex FastAPI JSON into our simple React interface
        const formatProduct = (item: any): Product => ({
          id: item.Products?.id || Math.random().toString(),
          name: item.Products?.product_name || "Unknown Product",
          price: `₱${item.Products?.price || 0}`,
          rating:
            item.avg_rating !== null && item.avg_rating !== undefined
              ? Number(item.avg_rating).toFixed(1)
              : "0.0",
          // Safely grab the first image, or use a placeholder
          image:
            item.images && item.images.length > 0
              ? item.images[0].image_url
              : "/products/placeholder-image.jpg",
          description: item.description,
          category: item.Products?.category,
        });

        // Map the raw data and update state
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

  // for hiding the Navbar whenever the modal is open
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
      <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-sm flex-shrink-0 h-max flex justify-center items-center">
        <p className="text-gray-500 font-medium animate-pulse">
          Loading items...
        </p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-sm flex-shrink-0 h-max flex justify-center items-center">
        <p className="text-red-500 text-sm font-medium">
          Unable to load recommendations.
        </p>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-full xl:w-[320px] bg-white rounded-[10px] p-6 shadow-xl flex-shrink-0 h-max relative z-10">
        {/* best seller */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Best Seller</h2>
            <button
              onClick={() => setActiveTab && setActiveTab("Menu")}
              className="text-xs font-bold text-[#800000] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                // ADDED: Wrapper div to make the card clickable
                <div
                  key={`best-${item.id}-${index}`}
                  onClick={() => setSelectedProduct(item)}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <SideProducts item={item} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No best sellers yet.</p>
            )}
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-100 mb-8"></div>

        {/* new products */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">New Product</h2>

          <div className="flex flex-col gap-4">
            {newProducts.length > 0 ? (
              newProducts.slice(0, 4).map((item, index) => (
                <div
                  key={`new-${item.id}-${index}`}
                  onClick={() => setSelectedProduct(item)}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <SideProducts item={item} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No new products available.
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
