"use client";

import Image from "next/image";
import { useNotification } from "../../context/contextNotification";
// 1. IMPORT THE HOOK DIRECTLY

// We only need onClose as a prop now, because the Navbar controls if the menu is visible
interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({
  onClose,
}: NotificationDropdownProps) {
  // 2. GRAB ALL DATA AND ACTIONS DIRECTLY FROM THE GLOBAL CONTEXT
  const { notifications, markAllAsRead, deleteNotification, clearHistory } =
    useNotification();

  // Helper function to convert FastAPI's ISO timestamp to relative time ("5 mins ago")
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Just now";

    // 3. TIMEZONE FIX: Force UTC timezone to match FastAPI backend perfectly
    const safeDateString =
      dateString.endsWith("Z") || dateString.includes("+")
        ? dateString
        : `${dateString}Z`;

    const date = new Date(safeDateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds <= 5) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div
      className="absolute top-full right-0 mt-4 w-[340px] bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-50 overflow-hidden cursor-default flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-[#1e293b] text-[15px]">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead} // Replaced prop with context action
            className="text-xs font-bold text-[#800000] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={notif.id}
              className={`group relative px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col gap-1 ${
                index !== notifications.length - 1
                  ? "border-b border-gray-50"
                  : ""
              } ${!notif.is_user_read ? "bg-[#fffcfc]" : ""}`}
            >
              <div className="flex justify-between items-center">
                {/* Red dot for unread notifications */}
                <div className="flex items-center gap-2">
                  {!notif.is_user_read && (
                    <div className="h-1.5 w-1.5 bg-[#800000] rounded-full shrink-0"></div>
                  )}
                  <h4 className="text-[13px] font-bold text-[#1e293b]">
                    {notif.title}
                  </h4>
                </div>

                {/* Notification Time & Delete Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-gray-400">
                    {formatTimeAgo(notif.created_at)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id); // Replaced prop with context action
                    }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Image
                      src="/icons/delete.png"
                      alt="Delete"
                      width={14}
                      height={14}
                      className="cursor-pointer object-contain rounded-full transition-all duration-200 hover:[filter:invert(13%)_sepia(84%)_saturate(4414%)_hue-rotate(349deg)_brightness(72%)_contrast(111%)]"
                    />
                  </button>
                </div>
              </div>

              <p
                className={`text-[12px] font-medium text-gray-500 leading-snug pr-6 ${!notif.is_user_read ? "pl-3.5" : ""}`}
              >
                {notif.description}
              </p>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gray-500 font-medium">
            Your history is clear.
          </div>
        )}
      </div>

      {/* Footer: Clear History */}
      {notifications.length > 0 && (
        <div className="p-3 border-gray-100 bg-gray-50">
          <a
            onClick={clearHistory} // Replaced prop with context action
            className="cursor-pointer w-full py-1 text-xs font-bold text-gray-500 hover:text-[#800000] text-center block rounded-md transition-colors"
          >
            Clear History
          </a>
        </div>
      )}
    </div>
  );
}
