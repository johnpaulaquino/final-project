"use client";

import { apiClient } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Define the Category interface based on your new API response
export interface Category {
  id: string;
  category: string;
}

// 2. Update the Context Type to use the Category object
interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void; // Best practice: delete by ID instead of name
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get("/products/categories");
        // The API returns { data: [{category: "Drinks", id: "..."}] }
        setCategories(data.data || []);
      } catch (err: any) {
        console.error(err?.message || "Failed to load categories.");
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  
  const addCategory = (name: string) => {
    const trimmedName = name.trim();

    // Check if the category name already exists in the object array
    const exists = categories.some(
      (c) => c.category.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (trimmedName && !exists) {
      // Create a local object with a temporary ID.
      // (Note: In a real app, you would POST this to the backend first and use the real ID it returns)
      const newCategory: Category = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        category: trimmedName,
      };
      setCategories([...categories, newCategory]);
    }
  };

  const deleteCategory = (id: string) => {
    // Filter out by ID instead of name
    setCategories(categories.filter((c) => c.id !== id));
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
