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
  };
  description?: string;
  stock_status: string;
  review_count: number;
  quantity: number; // Backend stock
  avg_rating: number | null;
  images: { image_url: string; public_key: string }[];
  low_stock_threshold: number;
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
  description?: string;

  stock_status: string;
  review_count: number;
  quantity: number; // Backend stock
  avg_rating: number | null;
  images: { image_url: string }[];
  low_stock_threshold: number; // New field for low stock threshold
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
  // --- ADDED: State to hold selected checkout items ---
  checkoutItems: (string | number)[];
  setCheckoutItems: React.Dispatch<React.SetStateAction<(string | number)[]>>;

  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- ADDED: The state variable for checkout selection ---
  const [checkoutItems, setCheckoutItems] = useState<(string | number)[]>([]);

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

    const existingItem = cart.find(
      (item) => item.Carts.product_id === product.Products.id,
    );

    if (existingItem && existingItem.Carts.quantity >= product.quantity) {
      alert(`You cannot add more! Only ${product.quantity} left in stock.`);
      return;
    }

    const cartPostRequestBody = {
      product_id: product.Products.id,
      quantity: 1,
    };

    try {
      await apiClient.post("/cart", cartPostRequestBody);

      //ONLY if the database succeeds, update the React UI State
      setCart((prevCart) => {
        const itemToUpdate = prevCart.find(
          (item) => item.Carts.product_id === product.Products.id,
        );

        if (itemToUpdate) {
          // deeply update the nested Carts.quantity
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

        // Construct a proper CartItem with the nested Carts object
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

  const removeFromCart = async (id: number | string) => {
    try {
      // 1. Tell backend to delete item (Adjust the route if your FastAPI endpoint expects something else)
      await apiClient.delete(`/cart/${id}`);

      // 2. Update Cart UI
      setCart((prevCart) =>
        prevCart.filter((item) => item.Carts.product_id !== id),
      );

      // 3. Remove from checked items (if it was checked)
      setCheckoutItems((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error) {
      console.error("Failed to remove item from DB:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const updateQuantity = (id: number | string, newQuantity: number) => {
    // If the user tries to go below 1, remove the item entirely
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

  const clearCart = async () => {
    // Note: If you have a backend endpoint to clear the user's cart upon checkout,
    // you would await it here (e.g., await apiClient.delete('/cart/clear'); )
    setCart([]);
    setCheckoutItems([]);
  };

  const totalItems = cart.length;
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
        // --- ADDED: Export them so your components can use them ---
        checkoutItems,
        setCheckoutItems,
        clearCart,
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
