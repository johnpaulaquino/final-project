'use client';

import React, { createContext, useContext, useState } from 'react';

export interface Product {
  id: number | string; 
  name: string;
  price: string;
  numericPrice: number; // <--- ADD THIS BACK!
  rating: string;
  image: string;
  description?: string; 
  category?: string;
  stock: number;
}

// Since numericPrice is now in Product, CartItem just needs quantity!
export type CartItem = Product & { 
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number | string) => void; 
  updateQuantity: (id: number | string, newQuantity: number) => void; 
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    // PROTECT CART: Prevent adding if out of stock!
    if (product.stock <= 0) {
      alert("Sorry, this item is out of stock!");
      return;
    }

    const parsedPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // PROTECT CART: Prevent adding more than what's in stock
        if (existingItem.quantity >= product.stock) {
          alert(`You cannot add more! Only ${product.stock} left in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      return [...prevCart, { ...product, quantity: 1, numericPrice: parsedPrice }];
    });
  };

  // FIXED: id is now (number | string)
  const removeFromCart = (id: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // FIXED: id is now (number | string)
  const updateQuantity = (id: number | string, newQuantity: number) => {
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