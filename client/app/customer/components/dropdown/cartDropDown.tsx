'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/contextCart';

export default function CartDropdown({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { cart, totalItems, totalPrice } = useCart();

  const handleCheckout = () => {
    setActiveTab('Checkout');
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">

      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
        <h2 className="text-gray-900 font-bold text-lg">Your Cart</h2>
        <span className="bg-[#800000] text-white text-xs font-bold px-2 py-1 rounded-full">
          {totalItems} items
        </span>
      </div>

      {/* cart items */}
      <div className="flex flex-col gap-4 mb-4 max-h-60 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                
                {/*item price an quantitiy */}
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[#800000] font-bold text-sm">{item.price}</span>
                  <span className="text-gray-500 text-xs font-normal">x{item.quantity}</span>
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>

      {/* total */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500 font-semibold">Total</span>
          <span className="text-xl font-black text-gray-900">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <button 
          onClick={handleCheckout}
          className="cursor-pointer w-full bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
          disabled={cart.length === 0}
        >
          Checkout Now
        </button>
      </div>
    </div>
  );
}