import React from 'react';

export default function CustomerList() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Customers</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Group</th>
              <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-4 px-4">
                <p className="font-bold text-gray-900">Alice Johnson</p>
                <p className="text-xs text-gray-500">alice@example.com</p>
              </td>
              <td className="py-4 px-4"><span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">Wholesale Cafe</span></td>
              <td className="py-4 px-4 text-sm text-gray-600">2025-10-15</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}