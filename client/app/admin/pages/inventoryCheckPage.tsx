import React from 'react';

export default function InventoryCheck() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Inventory Monitor</h2>
      <p className="text-sm text-gray-500 mb-8">Products requiring restock or baking</p>
      
      <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-500 font-medium">Connect barcode scanner or manual entry system here.</p>
      </div>
    </div>
  );
}