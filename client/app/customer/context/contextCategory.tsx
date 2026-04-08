'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CategoryContextType {
  categories: string[];
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  // Default fallback categories
  const defaultCategories = [
    'Classic Cookies', 
    'Premium Pastries', 
    'Gift Boxes', 
    'Seasonal Specials'
  ];

  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. PULL FROM MEMORY ON LOAD
  useEffect(() => {
    const savedCategories = localStorage.getItem('biskota_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    setIsLoaded(true);
  }, []);

  // 2. SAVE TO MEMORY ON CHANGE
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('biskota_categories', JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  const addCategory = (name: string) => {
    if (name.trim() && !categories.includes(name.trim())) {
      setCategories([...categories, name.trim()]);
    }
  };

  const deleteCategory = (name: string) => {
    setCategories(categories.filter(c => c !== name));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}