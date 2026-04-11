"use client";

import { useState, useEffect } from "react";
import ProductCard from "./menuProducts"; // Adjust path if needed
import ProductModal from "./productModal"; // Adjust path if needed
import { Product } from "../../context/contextCart";
import { recommendedProductsData } from "../../data/mockDataCard"; // Adjust path if needed

export default function customerRecommendation() {
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

  // Safely hide the Navbar whenever the modal is open
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Recommended for You
        </h2>
        <p className="text-sm font-medium text-gray-500 mb-6">
          Hand-picked favorites just for you.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-medium animate-pulse">
            Loading recommendations...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Add this check to see if products actually exist */}
          {products && products.length > 0 ? (
            products.map((product) => (
              <div
                key={`${product.Products.id}`} // Use the correct ID field
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer transition-transform hover:scale-[1.02] h-full"
              >
                <ProductCard key={product.Products.id} product={product} />
              </div>
            ))
          ) : (
            // If the array is empty, this will show up instead of a confusing blank space!
            <div className="col-span-full py-12 text-center text-red-500 font-bold bg-red-50 rounded-lg">
              No products found! Check your mockData.ts import.
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
