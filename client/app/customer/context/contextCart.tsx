"use client";

import { apiClient } from "@/lib/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";

export interface Product {
  Products: {
    avg_rating: number | null;
    id: number | string;
    product_name: string;
    price: string;
    tags: string;
    category: string;
  };
  description?: string;
  stock_status: string;
  review_count: number;
  quantity: number;
  avg_rating: number | null;
  images: { image_url: string; public_key: string }[];
  low_stock_threshold: number;
}

export interface CartProduct {
  Carts: {
    quantity: number;
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
  quantity: number;
  avg_rating: number | null;
  images: { image_url: string }[];
  low_stock_threshold: number;
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
  checkoutItems: (string | number)[];
  setCheckoutItems: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [checkoutItems, setCheckoutItems] = useState<(string | number)[]>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("my_checkout_items");
        if (saved) return JSON.parse(saved);
      }
      return [];
    },
  );

  useEffect(() => {
    fetchCarts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("my_checkout_items", JSON.stringify(checkoutItems));
    }
  }, [checkoutItems]);

  const fetchCarts = useCallback(async (skip = 0, limit = 10) => {
    setIsLoading(true);
    try {
      const endpoint = `/cart/?skip=${skip}&limit=${limit}`;
      const response = await apiClient.get(endpoint);

      // 🚀 THE FIX: Properly extract the array data
      let fetchedProducts = [];
      if (Array.isArray(response)) {
        fetchedProducts = response;
      } else if (response && response.data) {
        fetchedProducts = response.data;
      }

      setCart(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch carts:", error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = async (product: Product) => {
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
      await apiClient.post("/cart/", cartPostRequestBody);

      setCart((prevCart) => {
        const itemToUpdate = prevCart.find(
          (item) => item.Carts.product_id === product.Products.id,
        );

        if (itemToUpdate) {
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

        const newItem: CartItem = {
          ...product,
          Carts: {
            product_id: product.Products.id,
            quantity: 1,
          },
        } as unknown as CartItem;

        return [...prevCart, newItem];
      });
    } catch (error) {
      console.error("Failed to insert cart into DB:", error);
      alert("Network error: Could not add item to cart. Please try again.");
    }
  };

  const removeFromCart = async (id: number | string) => {
    try {
      await apiClient.delete(`/cart/${id}`);

      setCart((prevCart) =>
        prevCart.filter((item) => item.Carts.product_id !== id),
      );

      setCheckoutItems((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error) {
      console.error("Failed to remove item from DB:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const updateQuantity = (id: number | string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.Products.id === id) {
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
