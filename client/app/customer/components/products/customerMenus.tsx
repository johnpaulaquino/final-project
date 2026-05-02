"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard from "../products/menuProducts";
import ProductModal from "../products/productModal";
import { Product } from "../../context/contextCart";
import { useCategory } from "../../context/contextCategory";
import { useProduct } from "../../context/contextProduct";

export default function CustomerMenus() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { categories } = useCategory();
  const { products, fetchProducts, isLoading } = useProduct();

  // 1. Process categories to remove duplicates (like the 3 "Drinks" in your DB)
  // 2. Ensure they match the string values your Backend Enum expects
  const filters = useMemo(() => {
    const names = categories.map((cat) => cat.category);
    return ["All", ...Array.from(new Set(names))];
  }, [categories]);

  useEffect(() => {
    // If "All" is selected, you might need a different service method 
    // or your provider needs to handle the empty category string.
    fetchProducts(activeFilter, 1, 10);
  }, [activeFilter, fetchProducts]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Menu</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-hide">
          {filters.map((categoryName) => (
            <button
              key={categoryName}
              onClick={() => setActiveFilter(categoryName)}
              className={`px-6 py-2 rounded-[5px] text-sm font-bold shadow-sm transition-colors ${
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
        <div className="flex items-center justify-center h-64">
          <p className="animate-pulse">Loading {activeFilter}...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.Products.id} onClick={() => setSelectedProduct(product)}>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No products found in "{activeFilter}".
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