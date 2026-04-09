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
  quantity: number; // Backend stock
  avg_rating: number | null;
  images: { image_url: string }[];
}

export interface CartProduct {
  Carts: {
    quantity: number; // User's cart amount
    product_id: number | string;
  };
  Products: {
    avg_rating: number | null;
    id: number | string;
    product_name: string;
    price: string;
    category: string;
    description?: string;
  };
  review_count: number;
  quantity: number; // Backend stock
  avg_rating: number | null;
  images: { image_url: string }[];
}

export type CartItem = CartProduct;

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

  const fetchCarts = useCallback(async (skip = 0, limit = 10) => {
    setIsLoading(true);
    try {
      const endpoint = `/cart?skip=${skip}&limit=${limit}`;
      const response = await apiClient.get(endpoint);

      const fetchedProducts = response.data || [];
      setCart(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch carts:", error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = async (product: Product) => {
    // 1. PROTECT CART: Prevent adding if out of stock!
    if (product.quantity <= 0) {
      alert("Sorry, this item is out of stock!");
      return;
    }

    // 2. PROTECT CART: Check current local state to prevent exceeding stock
    const existingItem = cart.find(
      (item) => item.Carts.product_id === product.Products.id,
    );

    // FIX: Block the addition if they already have the max stock in their cart
    if (existingItem && existingItem.Carts.quantity >= product.quantity) {
      alert(`You cannot add more! Only ${product.quantity} left in stock.`);
      return;
    }

    // 3. Prepare the data for your FastAPI backend
    const cartPostRequestBody = {
      product_id: product.Products.id,
      quantity: 1,
    };

    // 4. Send to Database FIRST
    try {
      await apiClient.post("/cart", cartPostRequestBody);

      // 5. ONLY if the database succeeds, update the React UI State
      setCart((prevCart) => {
        const itemToUpdate = prevCart.find(
          (item) => item.Carts.product_id === product.Products.id,
        );

        if (itemToUpdate) {
          // FIX: Deeply update the nested Carts.quantity
          return prevCart.map((item) =>
            item.Carts.product_id === product.Products.id
              ? {
                  ...item,
                  Carts: {
                    ...item.Carts,
                    quantity: item.Carts.quantity + 1,
                  },
                }
              : item,
          );
        }

        // FIX: Construct a proper CartItem with the nested Carts object
        const newItem: CartItem = {
          ...product,
          Carts: {
            product_id: product.Products.id,
            quantity: 1,
          },
        };

        return [...prevCart, newItem];
      });
    } catch (error) {
      console.error("Failed to insert cart into DB:", error);
      alert("Network error: Could not add item to cart. Please try again.");
    }
  };

  const removeFromCart = (id: number | string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.Carts.product_id !== id),
    );
  };

  const updateQuantity = (id: number | string, newQuantity: number) => {
    // FIX: If the user tries to go below 1, remove the item entirely
    if (newQuantity < 1) {
      removeFromCart(id); // Use your existing remove function!
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.Products.id === id) {
          // Extra safety: prevent updating beyond stock limits
          const validatedQty = Math.max(
            1,
            Math.min(newQuantity, item.quantity),
          );
          return { ...item, Carts: { ...item.Carts, quantity: validatedQty } };
        }
        return item;
      }),
    );
  };
  const totalItems = new Set(cart.map((item) => item.Carts.product_id)).size;

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.Products.price) * item.Carts.quantity,
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
