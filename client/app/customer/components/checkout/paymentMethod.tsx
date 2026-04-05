'use client';

import React from 'react';

interface PaymentMethodProps {
  activePayment: string;
  setActivePayment: (method: string) => void;
}

export default function PaymentMethod({ activePayment, setActivePayment }: PaymentMethodProps) {
  const methods = [
    { id: 'cc', 
      title: 'Credit / Debit Card', 
      description: 'Pay securely with your card', 
    },

    { id: 'gcash', 
      title: 'GCash', 
      description: 'Pay using your GCash wallet', 
    },

    { id: 'cod', 
      title: 'Cash on Delivery', 
      description: 'Pay when you receive your order', 
    },
  ];

  return (
    <div className="space-y-4">
      {methods.map((method) => {
        const isActive = activePayment === method.id;
        
        return (
          <div 
            key={method.id}
            onClick={() => setActivePayment(method.id)}
            className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all ${
              isActive 
                ? 'border-[#800000] bg-red-50/30' 
                : 'border-gray-100 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              isActive ? 'border-[#800000]' : 'border-gray-300'
            }`}>
              {isActive && <div className="w-3 h-3 rounded-full bg-[#800000]" />}
            </div>

            <div className="flex-grow">
              <h3 className="font-bold text-gray-900">{method.title}</h3>
              <p className="text-gray-500 text-sm">{method.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}