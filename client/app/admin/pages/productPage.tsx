import React from 'react';

export default function InventoryList() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Product Inventory List</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Details</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Level</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-4 px-4 font-medium text-gray-900">Classic Butter Biskota</td>
              <td className="py-4 px-4 text-gray-600">$14.99</td>
              <td className="py-4 px-4"><span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md">85 In Stock</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}