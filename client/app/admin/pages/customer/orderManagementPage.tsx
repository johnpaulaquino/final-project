"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrders, OrderStatus } from "../../../customer/context/contextOrder";
import ConfirmationModal from "@/app/customer/components/ConfirmationModal";
// Adjust this path if your ConfirmationModal is located somewhere else!

const tabs = [
  "All",
  "Pending",
  "Approved",
  "Shipped",
  "Delivered",
  "Received",
  "Cancelled",
  "Returned",
];

export default function OrderManagementPage() {
  const {
    orders,
    isLoading,
    pagination,
    fetchAdminOrders,
    updateOrderStatus,
    deliverOrder,
    confirmOrder,
    statusCounts,
    fetchStatusCounts,
    shipOrder,
  } = useOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic Modal States
  const [updateModalData, setUpdateModalData] = useState<{
    id: string;
    user_id: string;
    nextStatus: OrderStatus;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchFunc = fetchAdminOrders;
    fetchFunc(activeTab, currentPage, 10);
    
    fetchStatusCounts();

    console.log("Fetching orders:", activeTab, orders);
  }, [activeTab, currentPage, fetchAdminOrders]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // const handleStatusChange = (
  //   id: string,
  //   user_id: string,
  //   currentStatus: string,
  //   newStatus: OrderStatus,
  // ) => {
  //   const current = currentStatus?.toLowerCase() || "";
  //   const next = newStatus?.toLowerCase() || "";

  //   if (current === "pending" && next === "approved") {
  //     setUpdateModalData({ id, user_id, nextStatus: newStatus });
  //   } else if (current === "approved" && next === "shipped") {
  //     setUpdateModalData({ id, user_id, nextStatus: newStatus });
  //   } else {
  //     updateOrderStatus(id, newStatus);
  //   }
  // };
  const handleRowClick = (order: any) => {
    const currentStatus = order.order_status?.toLowerCase() || "";

    if (currentStatus === "pending") {
      setUpdateModalData({
        id: order.string_id,
        user_id: order.user_id,
        nextStatus: "Approved",
      });
    } else if (currentStatus === "approved") {
      setUpdateModalData({
        id: order.string_id,
        user_id: order.user_id,
        nextStatus: "Shipped",
      });
    } else if (currentStatus === "shipped") {
      // 🚀 ADDED: Open modal for Delivering
      setUpdateModalData({
        id: order.string_id,
        user_id: order.user_id,
        nextStatus: "Delivered",
      });
    }
  };

  const handleConfirmUpdate = async () => {
    if (!updateModalData) return;
    setIsUpdating(true);

    try {
      const payload = {
        user_id: updateModalData.user_id,
      };

      if (updateModalData.nextStatus === "Approved") {
        console.log(
          "Confirming order:",
          updateModalData.id,
          "for User:",
          updateModalData.user_id,
        );
        await confirmOrder(updateModalData.id, payload);
      } else if (updateModalData.nextStatus === "Shipped") {
        console.log(
          "Shipping order:",
          updateModalData.id,
          "for User:",
          updateModalData.user_id,
        );
        await shipOrder(updateModalData.id, payload);
      } else if (updateModalData.nextStatus === "Delivered") {
        // 🚀 ADDED: Route to the Deliver Order API Call
        console.log(
          "Delivering order:",
          updateModalData.id,
          "for User:",
          updateModalData.user_id,
        );
        await deliverOrder(updateModalData.id, payload);
      } else {
        // Fallback for any other generic updates
        await updateOrderStatus(updateModalData.id, updateModalData.nextStatus);
      }
    } finally {
      setIsUpdating(false);
      setUpdateModalData(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        (order.string_id &&
          order.string_id.toLowerCase().includes(lowerQuery)) ||
        (order.transaction_reference &&
          order.transaction_reference.toLowerCase().includes(lowerQuery)) ||
        (order.product_name &&
          order.product_name.toLowerCase().includes(lowerQuery));

      return matchesSearch;
    });
  }, [orders, searchQuery]);

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "received":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "returned":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // 🚀 MODIFIED: Dynamic Content for the Modal logic
  let modalTitle = "";
  let modalMessage = "";
  let confirmText = "";
  let processingText = "";

  if (updateModalData?.nextStatus === "Approved") {
    modalTitle = "Approve Order?";
    modalMessage =
      "Are you sure you want to approve this order? It will be moved to the Approved list.";
    confirmText = "Yes, Approve";
    processingText = "Approving...";
  } else if (updateModalData?.nextStatus === "Shipped") {
    modalTitle = "Ship Order?";
    modalMessage =
      "Are you sure you want to mark this order as shipped? It will be moved to the Shipped list.";
    confirmText = "Yes, Ship";
    processingText = "Shipping...";
  } else if (updateModalData?.nextStatus === "Delivered") {
    modalTitle = "Deliver Order?";
    modalMessage =
      "Are you sure you want to mark this order as delivered? It will be moved to the Delivered list.";
    confirmText = "Yes, Deliver";
    processingText = "Delivering...";
  }

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-6 bg-white border-gray-100 overflow-hidden relative">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-2 gap-4">
        <div className="flex flex-col md:flex-row w-full xl:w-auto items-start md:items-center gap-4 overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-no pb-2 md:pb-0">
            <div className="flex items-center gap-2 w-max pr-4 m-4">
              {tabs.map((tab) => {
                // Get the count for this specific tab. If undefined, default to 0.
                const itemCount = statusCounts?.[tab] || 0;

                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    // Added 'relative' to the className below so the dot positions correctly
                    className={`relative flex items-center justify-center whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-lg transition-all border ${
                      activeTab === tab
                        ? "bg-[#800000] text-white border-[#800000] shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tab}

                    {/* The Red Dot Counter */}
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center bg-[#800000] rounded-full border-[2px] border-white text-[10px] font-bold text-white leading-none shadow-sm">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative w-full md:w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="Search ref, product..."
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
              <th className="px-6 py-4">Transaction Ref</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse"
                >
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order: any) => {
                // 🚀 ADDED: Shipped rows are now clickable
                const isClickableRow =
                  order.order_status === "Pending" ||
                  order.order_status === "Approved" ||
                  order.order_status === "Shipped";

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50/50 transition-colors group ${isClickableRow ? "cursor-pointer" : ""}`}
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                      {order.string_id?.split("-")[0] || "N/A"}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {order.transaction_reference || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {order.product_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#800000]">
                      ₱{order.total_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-md focus:outline-none ${getStatusStyles(order.order_status)}`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {/* REUSABLE MODAL */}
      <ConfirmationModal
        isOpen={updateModalData !== null}
        title={modalTitle}
        message={modalMessage}
        cancelText="Cancel"
        confirmText={confirmText}
        processingText={processingText}
        isProcessing={isUpdating}
        onCancel={() => setUpdateModalData(null)}
        onConfirm={handleConfirmUpdate}
        confirmColorClass="bg-[#0B1527] hover:bg-gray-800"
      />
    </div>
  );
}
