import React from 'react';

export default function Analytics() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 h-[600px] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 text-3xl"></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Analytics Dashboard</h2>
      <p className="text-gray-500 max-w-md mx-auto">
        Interactive charts for Revenue, Wholesale vs Retail Growth, and Pastry Sales Performance will render here.
      </p>
    </div>
  );
}