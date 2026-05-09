"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 🚀 Import Next.js router
import { useCart, CartItem } from "../../context/contextCart";
import { useOrders, Order } from "../../context/contextOrder";
import ConfirmationModal from "../ConfirmationModal";

interface OrderSummaryProps {
  onProcessPayment: () => void;
  isAddressSaved: boolean;
  isProcessing?: boolean;
  cart: CartItem[]; // Ensure cart is passed as a prop
}

export default function OrderSummary({
  onProcessPayment,
  isAddressSaved,
  isProcessing = false,
}: OrderSummaryProps) {
  const router = useRouter();
  const { addOrder } = useOrders() as any;
  
  const { cart, clearCart, fetchCart } = useCart() as any; 

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (fetchCart) {
      fetchCart();
    }
  }, [fetchCart]);

  // Safely calculate total (fallback if cart is undefined while loading)
  const safeCart = cart || [];
  const totalPrice = safeCart.reduce(
    (sum: number, item: any) => sum + parseFloat(item.Products.price) * item.Carts.quantity,
    0,
  );

  const shippingCost: number = 0;
  const finalTotal = totalPrice + shippingCost;

  const handlePlaceOrder = () => {
    if (!safeCart.length) return;

    safeCart.forEach((item: any) => {
      const newOrder: Order = {
        id: Math.floor(Math.random() * 1000000),
        string_id: null as any,
        product_name: item.Products.product_name,
        quantity: item.Carts.quantity,
        price: parseFloat(item.Products.price),
        total_amount: parseFloat(item.Products.price) * item.Carts.quantity,
        order_status: "Pending",
        transaction_reference: null as any,
        created_at: null as any,
        user_id: null as any,
      };

      if (addOrder) {
        addOrder(newOrder);
      }
    });

    setIsConfirmModalOpen(false);
    onProcessPayment();

    router.push("/");
  };

  if (!cart) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-32 bg-gray-100 rounded-xl mb-6"></div>
        <div className="h-10 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* list of an item  */}
      <div className="flex-grow space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
        {safeCart.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Your cart is empty.
          </p>
        ) : (
          safeCart.map((item: any) => (
            <div
              key={item.Carts.product_id}
              className="flex gap-4 items-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={
                      item.images[0].image_url.startsWith("http")
                        ? item.images[0].image_url
                        : `/${item.images[0].image_url}`
                    }
                    alt={item.Products.product_name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                  {item.Products.product_name}
                </h3>
                <p className="text-gray-500 text-sm">
                  Qty: {item.Carts.quantity}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">
                  ₱
                  {(
                    parseFloat(item.Products.price) * item.Carts.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* cost */}
      <div className="border-t border-gray-100 pt-6 space-y-3">
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className="font-medium text-[#800000]">
            {shippingCost === 0 ? "Free" : `₱${shippingCost.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* total of product */}
      <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-center mb-8">
        <div>
          <span className="text-lg font-bold text-gray-900 block">Total</span>
          <span className="text-xs text-gray-500">Including taxes</span>
        </div>
        <span className="text-3xl font-black text-gray-900">
          ₱{finalTotal.toFixed(2)}
        </span>
      </div>

      <button
        onClick={() => setIsConfirmModalOpen(true)}
        disabled={safeCart.length === 0 || !isAddressSaved || isProcessing}
        className="w-full bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isProcessing
          ? "Processing..."
          : safeCart.length === 0
            ? "Cart is Empty"
            : !isAddressSaved
              ? "Confirm Address to Continue"
              : "Place Order"}
      </button>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ₱${finalTotal.toFixed(2)}?`}
        cancelText="Cancel"
        confirmText="Confirm Order"
        processingText="Processing..."
        isProcessing={isProcessing}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handlePlaceOrder}
        confirmColorClass="bg-[#0B1527] hover:bg-gray-800"
      />
    </div>
    </>
  );
}