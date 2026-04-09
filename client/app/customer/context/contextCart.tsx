"use client";

import { apiClient } from "@/lib/api";
import React, { createContext, useCallback, useContext, useState } from "react";

export interface Product {
  Products: {
    avg_rating: number | null;
    id: number | string;
    product_name: string;
    price: string;
    category: string;
    description?: string;
  };
  review_count: number;
  quantity: number;
  avg_rating: number | null;
  images: { image_url: string }[];
}

// Since numericPrice is now in Product, CartItem just needs quantity!
export type CartItem = Product;

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, newQuantity: number) => void;
  totalItems: number;
  totalPrice: number;
  fetchCarts: (skip?: number, limit?: number) => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Call the CArt API here
  // Function to fetch products from your API
  const fetchCarts = useCallback(async (skip = 0, limit = 10) => {
    setIsLoading(true);
    try {
      const endpoint = `/cart?skip=${skip}&limit=${limit}`;
      const response = await apiClient.get(endpoint);

      const fetchedProducts = response.data || [];
      setCart(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch carts:", error);
      setCart([]); // Clear products on error, or handle gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = (product: Product) => {
    // PROTECT CART: Prevent adding if out of stock!
    if (product.quantity <= 0) {
      alert("Sorry, this item is out of stock!");
      return;
    }

    const parsedPrice = Number(product.Products.price);

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.Products.id === product.Products.id,
      );

      if (existingItem) {
        // PROTECT CART: Prevent adding more than what's in stock
        if (existingItem.quantity >= product.quantity) {
          alert(`You cannot add more! Only ${product.quantity} left in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.Products.id === product.Products.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prevCart,
        { ...product, quantity: 1, numericPrice: parsedPrice },
      ];
    });
  };

  // FIXED: id is now (number | string)
  const removeFromCart = (id: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.Products.id !== id));
  };

  // FIXED: id is now (number | string)
  const updateQuantity = (id: number | string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.Products.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.Products.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        isLoading,
        fetchCarts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
