'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './contextCart'; 
import { biskotaMenuData } from '../data/mockDataCard';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: number | string) => void;
  updateProduct: (updatedProduct: Product) => void; // Named it updateProduct to match your UI
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(biskotaMenuData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('biskota_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('biskota_products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]); 
  };

  const deleteProduct = (id: number | string) => {
    setProducts((prev) => prev.filter(product => product.id !== id));
  };

  // Logic to find the product and swap it with the updated version
  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => 
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}