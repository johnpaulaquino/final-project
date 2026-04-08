import React from 'react';

export default function SalesHistory() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sales</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order Ref</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-4 px-4 text-sm font-medium text-gray-500">#ORD-001</td>
              <td className="py-4 px-4 font-bold text-gray-900">Alice Johnson</td>
              <td className="py-4 px-4 text-sm font-bold text-gray-900">$74.95</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}