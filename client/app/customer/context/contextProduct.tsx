"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { apiClient } from "@/lib/api"; // Assuming you have this from your previous setup

export interface Product {
  stock: number;
  Products: {
    image: string | Blob | undefined;
    avg_rating: number | null;
    id: number | string;
    product_name: string;
    price: string;
    category: string;
    description?: string;
  };
  quantity: number;
  avg_rating: number | null;
  images: { image_url: string }[];
}

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
  updateProduct: (updatedProduct: Product) => void;
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
        const endpoint = `/products/with?category=${category}&skip=${skip}&limit=${limit}`;

        const response = await apiClient.publicGet(endpoint);

        // Adjust this depending on your API's exact response structure (e.g., response.data or response.products)
        const fetchedProducts = response.data || [];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]); // Clear products on error, or handle gracefully
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Standard optimistic UI updates
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const deleteProduct = (id: number | string) => {
    setProducts((prev) => prev.filter((product) => product.Products.id !== id));
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.Products.id === updatedProduct.Products.id ? updatedProduct : p,
      ),
    );
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
