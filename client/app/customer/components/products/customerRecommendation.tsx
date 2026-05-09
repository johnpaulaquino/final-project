"use client";

import { useState, useEffect } from "react";
import ProductCard from "./menuProducts"; // Adjust path if needed
import ProductModal from "./productModal"; // Adjust path if needed
import { Product } from "../../context/contextCart";
import { recommendedProductsData } from "../../data/mockDataCard"; // Adjust path if needed

// 🚀 FIXED: Capitalized component name to follow React best practices
export default function CustomerRecommendation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Simulating a database fetch
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        // Artificial delay for loading state
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use the imported professional mock data
        setProducts(recommendedProductsData);
      } catch (error) {
        console.error("Failed to load recommended products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          Recommended for You
        </h2>
        <p className="text-xs md:text-sm font-medium text-gray-500 mb-2 md:mb-4">
          Hand-picked favorites just for you.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
             <svg className="w-8 h-8 text-[#800000] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-bold text-gray-500 animate-pulse">Loading recommendations...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div
                key={`${product.Products.id}`}
                onClick={() => setSelectedProduct(product)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProduct(product);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${product.Products.product_name || 'product'}`}
                className="cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#800000] rounded-xl h-full"
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">No recommendations found right now.</p>
            </div>
          )}
        </div>
      )}

      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}