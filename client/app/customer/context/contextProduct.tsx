"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { apiClient } from "@/lib/api"; 
import { Product } from "./contextCart";

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (
    category: string,
    skip?: number,
    limit?: number,
  ) => Promise<void>;
  addProduct: (product: Product) => void;
  deleteProduct: (id: number | string) => void;
  updateProduct: (id: string | number, formData: FormData) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch products from your API
  const fetchProducts = useCallback(
    async (category: string, skip = 0, limit = 10) => {
      setIsLoading(true);
      try {
        // 1. Build the query parameters FIRST
        const params = new URLSearchParams({
          skip: skip.toString(),
          limit: limit.toString(),
        });

        // 2. Construct the proper endpoint based on the category
        let endpoint = "";
        
        if (category !== "All") {
          // Append category for the specific search
          params.append("category", category);
          endpoint = `/products/with?${params.toString()}`;
        } else {
          // Omit category parameter for the "All" view
          // Ensure your backend handles standard GET /products for all items!
          endpoint = `/products?${params.toString()}`; 
        }

        // 3. Make the API request with the correctly built endpoint
        const response = await apiClient.publicGet(endpoint);

        // Adjust this depending on your API's exact response structure 
        // Typically SuccessfulResponseSchema wraps arrays in data.data
        const fetchedProducts = response.data?.data || response.data || [];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]); // Clear products on error
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Standard optimistic UI updates
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const deleteProduct = (id: number | string) => {
    setProducts((prev) => prev.filter((product) => product.Products.id !== id));
  };

  const updateProduct = async (id: string | number, formData: FormData) => {
    try {
      await apiClient.patch(`/products/full/${id}`, formData);
      // Optional: Refresh the current view instead of defaulting to "All" and 1
      await fetchProducts("All", 0, 10); 
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        fetchProducts,
        addProduct,
        deleteProduct,
        updateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}