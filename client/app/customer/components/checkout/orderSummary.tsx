'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '../../context/contextCart'; 

interface OrderSummaryProps {
  onProcessPayment: () => void;
  isAddressSaved: boolean;
}

export default function OrderSummary({ onProcessPayment, isAddressSaved }: OrderSummaryProps) {
  const { cart, totalPrice } = useCart();
  const shippingCost: number = 0;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
      
      {/* list of an item  */}
      <div className="flex-grow space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
        {cart.length === 0 ? (
           <p className="text-gray-500 text-sm text-center py-4">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex gap-4 items-center">
              
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">

                {item.image ? (
                  <Image 
                    src={item.image.startsWith('http') || item.image.startsWith('/') 
                         ? item.image 
                         : `/${item.image}`} 
                    alt={item.name} 
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
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">${(item.numericPrice * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* cost */}
      <div className="border-t border-gray-100 pt-6 space-y-3">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className="font-medium text-[#800000]">
            {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
        </div>
      </div>

      {/* total of product */}
      <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-center mb-8">
        <div>
          <span className="text-lg font-bold text-gray-900 block">Total</span>
          <span className="text-xs text-gray-500">Including taxes</span>
        </div>
        <span className="text-3xl font-black text-gray-900">${finalTotal.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <button 
        onClick={onProcessPayment}
        disabled={cart.length === 0 || !isAddressSaved}
        className="w-full bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {cart.length === 0 
          ? 'Cart is Empty' 
          : !isAddressSaved 
            ? 'Add Address to Continue' 
            : 'Place Order'}
      </button>
    </div>
  );
}