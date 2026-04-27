"use client";

import ConfirmationModal from "@/app/customer/components/ConfirmationModal";
import { useNotification } from "@/app/customer/context/contextNotification";
import Pagination from "@/app/Pagination";
import { useEffect, useState } from "react";

export default function AdminNotificationPage() {
  const {
    notifications,
    markAllAsRead,
    deleteNotification,
    unreadCount,
    pagination,
  } = useNotification();

  const [currentPage, setCurrentPage] = useState(1);

  // 🚀 NEW: State for Delete Modal
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🚨 ADD THIS TRACKER:
  useEffect(() => {
    console.log("🔥 PAGE DETECTED DATA CHANGE:", notifications);
  }, [notifications]);

  // 🚀 NEW: The handler that actually fires the deletion
  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteNotification(notificationToDelete);
    } catch (error) {
      console.error("Failed to delete notification", error);
    } finally {
      setIsDeleting(false);
      setNotificationToDelete(null); // Close the modal
    }
  };

  // Helper function to convert ISO dates to relative time
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <>
      <div className="bg-white rounded-[10px] p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] animate-in fade-in duration-300">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-[#800000] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm font-bold text-[#800000] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
          >
            Mark all as read
          </button>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="flex flex-col gap-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-sm">
                You have no notifications yet.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`group p-4 rounded-xl border flex gap-4 transition-colors relative ${
                  !notif.is_user_read
                    ? "border-red-100 bg-red-50/30"
                    : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                {!notif.is_user_read && (
                  <div className="absolute top-5 left-2 w-1.5 h-1.5 rounded-full bg-[#800000]"></div>
                )}

                <div className="flex-1 pl-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1 pr-8">
                    {notif.description}
                  </p>

                  {notif.notification_type && (
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                      {notif.notification_type}
                    </span>
                  )}
                </div>

                {/* 🚀 MODIFIED: Now triggers the modal instead of instant deletion */}
                <button
                  onClick={() => setNotificationToDelete(notif.id)}
                  className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  title="Remove notification"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          hasNext={pagination?.has_next || false}
          totalRecords={pagination?.total_records || 0}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>

      <ConfirmationModal
        isOpen={notificationToDelete !== null}
        title="Delete Notification?"
        message="Are you sure you want to remove this notification? This action cannot be undone."
        cancelText="Cancel"
        confirmText="Yes, Delete"
        processingText="Deleting..."
        isProcessing={isDeleting}
        onCancel={() => setNotificationToDelete(null)}
        onConfirm={handleConfirmDelete}
        confirmColorClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}
