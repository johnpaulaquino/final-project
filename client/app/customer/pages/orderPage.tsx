"use client";

import React, { useState, useEffect } from "react";
import { useOrders, OrderStatus } from "../context/contextOrder";
import ConfirmationModal from "../components/ConfirmationModal";

// Matches your FastAPI statuses
const STATUS_TABS: OrderStatus[] = [
  "Pending",
  "Approved",
  "Shipped",
  "Delivered",
  "Received",
  "Cancelled",
  "Returned",
];

export default function OrderPage() {
  // 1. Pull data, loading states, and pagination from Context
  const { orders, isLoading, pagination, fetchOrders, cancelOrder } =
    useOrders();
  // 2. NEW: Confirmation Modal State
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Local state for UI Filtering and Pagination
  const [activeTab, setActiveTab] = useState<OrderStatus>("Pending");
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Fetch data whenever the tab or page number changes
  useEffect(() => {
    fetchOrders(activeTab, currentPage, 10);
    console.log("Fetching orders:", activeTab, currentPage);
  }, [activeTab, currentPage, fetchOrders]);

  // Handle Tab Click (Always reset to page 1)
  const handleTabChange = (status: OrderStatus) => {
    setActiveTab(status);
    setCurrentPage(1);
  };
  // --- NEW: Trigger the actual cancellation ---
  const handleConfirmCancel = async () => {
    if (orderToCancel === null) return;

    setIsCancelling(true);
    await cancelOrder(orderToCancel);
    setIsCancelling(false);
    setOrderToCancel(null); // Close the modal
  };
  // --- UI Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-indigo-100 text-indigo-700";
      case "Delivered":
        return "bg-purple-100 text-purple-700";
      case "Received":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Returned":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Bulletproof Timezone Formatter
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown Date";
    // Force UTC format to match FastAPI and prevent timezone jumping
    const safeDateString =
      dateString.endsWith("Z") || dateString.includes("+")
        ? dateString
        : `${dateString}Z`;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(safeDateString));
  };

  console.log("My order", orders);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1527] mb-1">
          Order History
        </h1>
        <p className="text-sm text-gray-500">
          Track and manage your purchases.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-6 custom-scrollbar">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            onClick={() => handleTabChange(status)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap border ${
              activeTab === status
                ? "bg-[#800000] text-white border-[#800000]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 font-medium animate-pulse">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 font-medium text-center">
              No {activeTab.toLowerCase()} orders found.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-[#0B1527] uppercase tracking-wide">
                    #{order.transaction_reference}...
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.order_status)}`}
                  >
                    {order.order_status}
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-500 gap-1.5 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Placed on {formatDate(order.created_at || "")}
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl w-max border border-gray-100">
                  <span className="font-bold text-[#800000]">
                    {order.quantity}x
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {order.product_name}
                  </span>
                </div>
              </div>

              {/* Right Side / Actions */}
              <div className="flex flex-col md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-[#0B1527] mb-3">
                  ₱{order.total_amount.toFixed(2)}
                </span>

                {/* MODIFIED: Now opens the modal instead of instantly cancelling */}
                {order.order_status === "Pending" && (
                  <button
                    onClick={() => setOrderToCancel(order.string_id)} // Opens Modal!
                    className="text-xs font-bold text-red-600 border border-red-200 rounded-lg px-5 py-2.5 hover:bg-red-50 hover:border-red-300 transition-all w-full md:w-auto"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="text-sm font-medium text-gray-500">
          Page {currentPage} <span className="mx-2">•</span>{" "}
          {pagination.totalRecords} Total
        </span>

        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={!pagination.hasNext || isLoading}
          className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      <ConfirmationModal
        isOpen={orderToCancel !== null}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        cancelText="Keep Order"
        confirmText="Yes, Cancel"
        processingText="Cancelling..."
        isProcessing={isCancelling}
        onCancel={() => setOrderToCancel(null)}
        onConfirm={() => handleConfirmCancel()}
        confirmColorClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
