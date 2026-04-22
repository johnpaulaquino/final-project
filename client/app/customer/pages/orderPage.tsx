"use client";

import React from 'react';
import { useOrders } from '../context/contextOrder';

export default function orderPage() {
  const { orders, updateOrderStatus } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Action Needed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(new Date(dateString));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1527] mb-1">Order History</h1>
        <p className="text-sm text-gray-500">Track and manage your recent purchases.</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-8 rounded-2xl text-center">You have no recent orders.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {/* Now using string_id */}
                  <h2 className="text-lg font-bold text-[#0B1527]">{order.string_id}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-1.5 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {/* created_at */}
                  Placed on {formatDate(order.created_at)}
                </div>
                
                {/* Display Single Product Info*/}
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg w-max border border-gray-100">
                   {/* quantity and product_name */}
                   <span className="font-semibold text-gray-900">{order.quantity}x</span>
                   <span className="text-sm text-gray-700">{order.product_name}</span>
                </div>
              </div>

              {/* right side total and Action */}
              <div className="flex flex-col md:items-end w-full md:w-auto mt-4 md:mt-0">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">Item Total</span>
                {/* price */}
                <span className="text-xl font-bold text-[#800000] mb-3">₱{order.price.toFixed(2)}</span>
                
                {order.order_status === 'Pending' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'Action Needed')} 
                    className="text-xs font-medium text-red-500 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
                  >
                    Cancel Item
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}