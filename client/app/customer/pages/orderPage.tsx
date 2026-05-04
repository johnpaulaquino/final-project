"use client";

import React, { useState, useEffect } from "react";
import { useOrders, OrderStatus } from "../context/contextOrder";
import ConfirmationModal from "../components/ConfirmationModal";
import RatingModal from "../components/ratingModal";

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
  const {
    orders,
    isLoading,
    pagination,
    fetchOrders,
    cancelOrder,
    receiveOrder,
    rateOrder,
    statusCounts, // 🚀 1. ADDED: Bring in the counts
    fetchStatusCounts, // 🚀 1. ADDED: Bring in the fetch function
  } = useOrders();

  // Cancel Modal State
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Receive Modal State
  const [orderToReceive, setOrderToReceive] = useState<string | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  // Rating Modal State (Temporary until we implement the actual rating flow)
  const [orderToRate, setOrderToRate] = useState<string | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [productNameToRate, setProductNameToRate] = useState<string>("");

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [activeTab, setActiveTab] = useState<OrderStatus>("Pending");
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-dismiss Toast after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders(activeTab, currentPage, 10);
    fetchStatusCounts(); // 🚀 2. ADDED: Fetch the counts when the page loads!
  }, [activeTab, currentPage, fetchOrders, fetchStatusCounts]);

  const handleTabChange = (status: OrderStatus) => {
    setActiveTab(status);
    setCurrentPage(1);
  };

  const handleConfirmCancel = async () => {
    if (orderToCancel === null) return;
    setIsCancelling(true);

    try {
      await cancelOrder(orderToCancel);
      setOrderToCancel(null);
      setToast({ message: "Order successfully cancelled.", type: "success" });

      fetchStatusCounts(); // Refresh counts after cancelling
    } catch (error: any) {
      setOrderToCancel(null);
      setToast({
        message: error?.message || "Failed to cancel order. Please try again.",
        type: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReceive = async () => {
    if (orderToReceive === null) return;
    setIsReceiving(true);

    const specificOrder = orders.find((o) => o.string_id === orderToReceive);
    const payload = { user_id: specificOrder?.user_id };

    try {
      await receiveOrder(orderToReceive, payload);
      setOrderToReceive(null);
      setToast({
        message: "Order successfully marked as received!",
        type: "success",
      });

      fetchStatusCounts(); // Refresh counts after receiving
    } catch (error: any) {
      setOrderToReceive(null);
      setToast({
        message:
          error?.message || "Failed to update order. Connection timed out.",
        type: "error",
      });
    } finally {
      setIsReceiving(false);
    }
  };

  const handleConfirmRate = async (rating: number, review: string) => {
    if (!orderToRate) return;
    setIsRating(true);

    try {
      await rateOrder(orderToRate, { rating, review });
      setOrderToRate(null);
      setToast({
        message: "Thank you! Your rating has been submitted.",
        type: "success",
      });
    } catch (error: any) {
      setToast({
        message: error?.message || "Failed to submit rating. Please try again.",
        type: "error",
      });
    } finally {
      setIsRating(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown Date";
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

  return (
    <main className="max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8 pb-12">
      <div className="flex-grow flex flex-col gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            My Order
          </h1>
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-[#800000] transition font-medium"
          >
            &lsaquo; Back to Shopping
          </button>
        </div>

        <div className="flex items-center gap-2 w-max pr-4 m-4">
          {STATUS_TABS.map((status) => {
            // 🚀 3. ADDED: Grab the count safely handling uppercase/lowercase
            const itemCount =
              statusCounts?.[status] ||
              statusCounts?.[status.toLowerCase()] ||
              statusCounts?.[status.toUpperCase()] ||
              0;

            return (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`cursor-pointer relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap border ${
                  activeTab === status
                    ? "bg-[#800000] text-white border-[#800000]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status}

                {/* 🚀 3. ADDED: Red dot notification badge */}
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-[#800000] rounded-full border-2 border-white text-[10px] font-bold text-white leading-none shadow-sm">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

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
                      #{order.string_id}
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

                <div className="flex flex-col md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-[#0B1527] mb-3">
                    ₱{order.total_amount.toFixed(2)}
                  </span>

                  {order.order_status === "Pending" && (
                    <button
                      onClick={() => setOrderToCancel(order.string_id)}
                      className="text-xs font-bold text-red-600 border border-red-200 rounded-lg px-5 py-2.5 hover:bg-red-50 hover:border-red-300 transition-all w-full md:w-auto"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.order_status === "Delivered" && (
                    <button
                      onClick={() => setOrderToReceive(order.string_id)}
                      className="text-xs font-bold text-green-600 border border-green-200 rounded-lg px-5 py-2.5 hover:bg-green-50 hover:border-green-300 transition-all w-full md:w-auto"
                    >
                      Order Received
                    </button>
                  )}

                  {order.order_status === "Received" && (
                    <button
                      onClick={() => {
                        setProductNameToRate(order.product_name);
                        setOrderToRate(order.string_id);
                      }}
                      className="text-xs font-bold text-[#800000] border border-[#800000]/30 rounded-lg px-5 py-2.5 hover:bg-[#800000]/5 transition-all w-full md:w-auto"
                    >
                      Rate Product
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

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

        {/* Cancel Order Modal */}
        <ConfirmationModal
          isOpen={orderToCancel !== null}
          title="Cancel Order?"
          message="Are you sure you want to cancel this order? This action cannot be undone."
          cancelText="Keep Order"
          confirmText="Yes, Cancel"
          processingText="Cancelling..."
          isProcessing={isCancelling}
          onCancel={() => setOrderToCancel(null)}
          onConfirm={handleConfirmCancel}
          confirmColorClass="bg-red-600 hover:bg-red-700"
        />

        {/* Receive Order Modal */}
        <ConfirmationModal
          isOpen={orderToReceive !== null}
          title="Confirm Delivery"
          message="Please confirm that you have received this order in good condition. Once confirmed, the order will be marked as complete."
          cancelText="Not Yet"
          confirmText="Yes, I Received It"
          processingText="Confirming..."
          isProcessing={isReceiving}
          onCancel={() => setOrderToReceive(null)}
          onConfirm={handleConfirmReceive}
          confirmColorClass="bg-green-600 hover:bg-green-700"
        />

        <RatingModal
          isOpen={orderToRate !== null}
          productName={productNameToRate}
          isSubmitting={isRating}
          onClose={() => setOrderToRate(null)}
          onSubmit={handleConfirmRate}
        />

        {/* Toast Notification Component */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
              toast.type === "success"
                ? "bg-white text-green-700 border-green-100 shadow-green-900/5"
                : "bg-white text-red-700 border-red-100 shadow-red-900/5"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            )}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        )}
      </div>
    </main>
  );
}
