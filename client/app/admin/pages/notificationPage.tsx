import React from 'react';

export default function Notifications() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <button className="text-sm font-bold text-[#800000] hover:underline">Mark all as read</button>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex gap-4">
          <div className="text-[#800000] mt-1"></div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">New Wholesale Order</h4>
            <p className="text-sm text-gray-600 mt-1">Order #ORD-003 needs baking.</p>
          </div>
          <span className="text-xs text-gray-400 ml-auto">10 mins ago</span>
        </div>

        <div className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex gap-4">
          <div className="text-[#800000] mt-1"></div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Low Stock Alert</h4>
            <p className="text-sm text-gray-600 mt-1">Vegan Oat & Raisin Bundle is down to 3 units.</p>
          </div>
          <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
        </div>
      </div>
    </div>
  );
}