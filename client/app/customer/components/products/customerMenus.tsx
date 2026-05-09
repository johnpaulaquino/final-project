"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "../products/menuProducts";
import ProductModal from "../products/productModal";
import AuthModal from "@/app/auth/authModal";
import { getAccessToken } from "@/lib/api";
import { Product } from "../../context/contextCart";
import { useCategory } from "../../context/contextCategory";
import { useProduct } from "../../context/contextProduct";

export default function CustomerMenus() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { categories } = useCategory();
  const { products, fetchProducts, isLoading } = useProduct();

  // Check authentication status on mount
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleProductClick = (product: Product) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedProduct(product);
    }
  };

  const filters = useMemo(() => {
    const names = categories.map((cat) => cat.category);
    return ["All", ...Array.from(new Set(names))];
  }, [categories]);

  useEffect(() => {
    fetchProducts(activeFilter, 1, 10);
  }, [activeFilter, fetchProducts]);

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Menu</h2>
        
        <div className="flex flex-row xl:flex-wrap gap-2 md:gap-3 pb-2 pt-1 overflow-x-auto xl:overflow-visible snap-x no-scrollbar">
          {filters.map((categoryName) => (
            <button
              key={categoryName}
              onClick={() => setActiveFilter(categoryName)}
              className={`snap-center whitespace-nowrap px-4 md:px-6 py-1.5 md:py-2 rounded-[5px] text-xs md:text-sm font-bold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#800000] ${
                activeFilter === categoryName
                  ? "bg-[#800000] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {categoryName}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
             <svg className="w-8 h-8 text-[#800000] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-bold text-gray-500 animate-pulse">Loading {activeFilter}...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div 
                key={product.Products.id} 
                onClick={() => handleProductClick(product)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProductClick(product);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${product.Products.product_name || 'product'}`}
                className="cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#800000] rounded-xl"
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">No products found in "{activeFilter}".</p>
            </div>
          )}
        </div>
      )}

      
      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="signup"
      />
    </div>
  );
}