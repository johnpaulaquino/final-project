"use client";

import { apiClient } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CategoryContextType {
  categories: string[];
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.publicGet("/products/categories");
        setCategories(data.data || []); // Adjust based on your API response structure
      } catch (err: any) {
        throw new Error(err?.message || "Failed to load categories.");
      }
    })();
  }, []);

  const addCategory = (name: string) => {
    if (name.trim() && !categories.includes(name.trim())) {
      setCategories([...categories, name.trim()]);
    }
  };

  const deleteCategory = (name: string) => {
    setCategories(categories.filter((c) => c !== name));
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}
