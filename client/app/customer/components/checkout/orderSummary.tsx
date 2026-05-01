"use client";

import React, { useState } from "react"; // Added useState
import Image from "next/image";
import { CartItem, useCart } from "../../context/contextCart";
import { useOrders, Order } from "../../context/contextOrder";
import ConfirmationModal from "../ConfirmationModal";

interface OrderSummaryProps {
  onProcessPayment: () => void;
  isAddressSaved: boolean;
  isProcessing?: boolean;
  cart: CartItem[];
}

export default function OrderSummary({
  onProcessPayment,
  isAddressSaved,
  isProcessing = false,
  cart,
}: OrderSummaryProps) {
  const { addOrder } = useOrders() as any;
  const { clearCart } = useCart();

  // --- NEW: State too cntrol our dynamic modal ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.Products.price) * item.Carts.quantity,
    0,
  );
console.log("hey", cart);

  const shippingCost: number = 0;
  const finalTotal = totalPrice + shippingCost;

  // This is the actual function that runs WHEN THE MODAL IS CONFIRMED
  const handlePlaceOrder = () => {
    cart.forEach((item) => {
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

    clearCart();
    setIsConfirmModalOpen(false);
    onProcessPayment();

    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* list of an item  */}
      <div className="flex-grow space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Your cart is empty.
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.Carts.product_id}
              className="flex gap-4 items-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={
                      item.images[0].image_url
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
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            ₱{totalPrice.toFixed(2)}
          </span>
        </div>
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
        disabled={cart.length === 0 || !isAddressSaved || isProcessing}
        className="w-full bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isProcessing
          ? "Processing..."
          : cart.length === 0
            ? "Cart is Empty"
            : !isAddressSaved
              ? "Confirm Address to Continue"
              : "Place Order"}
      </button>

      {/* THE DYNAMIC MODAL: Adapted for placing an order */}
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
        // Use the dark blue theme instead of red for positive actions
        confirmColorClass="bg-[#0B1527] hover:bg-gray-800"
      />
    </div>
  );
}
