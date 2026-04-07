'use client';

import React, { createContext, useContext, useState } from 'react';

// Note: If you moved this to src/types/product.ts as suggested earlier, 
// you can remove this block and import it instead.
export interface Product {
  id: number;
  name: string;
  price: string;
  rating: string;
  image: string;
  description?: string; 
  category?: string;    
}

export type CartItem = Product & { 
  quantity: number;
  numericPrice: number; 
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, newQuantity: number) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    const parsedPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      return [...prevCart, { ...product, quantity: 1, numericPrice: parsedPrice }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return; 
    
    setCart((prevCart) => 
      prevCart.map((item) => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.numericPrice * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}