"use client";

import React, { useState, useMemo } from 'react';
import { useOrders, OrderStatus } from '../../../customer/context/contextOrder';

const tabs = ['All', 'Action Needed', 'Pending', 'Approved', 'Shipped', 'Delivered'];

export default function orderManagementPage() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  //temporary i fix it later
  const actionNeededCount = orders.filter((o) => o.order_status === 'Action Needed').length;

  const filteredOrders = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    
    return orders.filter(order => {
      const matchesSearch = 
        order.string_id.toLowerCase().includes(lowerQuery) ||
        order.client_name.toLowerCase().includes(lowerQuery) ||
        order.product_name.toLowerCase().includes(lowerQuery);

      const matchesTab = activeTab === 'All' || order.order_status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [orders, searchQuery, activeTab]);

  const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Action Needed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-2 gap-4">
        <div className="flex flex-col md:flex-row w-full xl:w-auto items-start md:items-center gap-4 overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-no pb-2 md:pb-0">

            <div className="flex items-center gap-2 w-max pr-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-center whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-lg transition-all border ${
                    activeTab === tab
                      ? 'bg-[#800000] text-white border-[#800000] shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                  {tab === 'Action Needed' && actionNeededCount > 0 && (
                    <span className={`ml-2 text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#800000]'}`}>
                      {actionNeededCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="Search ref, client, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <th className="px-6 py-4">Order Ref</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Total Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{order.string_id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.client_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{order.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{order.quantity}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#800000]">
                    ₱{order.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.order_status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md border cursor-pointer focus:outline-none ${getStatusStyles(order.order_status)}`}
                    >
                      <option value="Action Needed">Action Needed</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Order"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}