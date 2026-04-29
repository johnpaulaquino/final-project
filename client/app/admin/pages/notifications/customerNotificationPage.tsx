"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export default function CustomerNotificationPage() {
  const [notificationType, setNotificationType] = useState("System Alert");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-dismiss status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // SUBMIT NOTIFICATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // 🚀 The exact payload your backend expects
      const payload = {
        title: title,
        description: description,
        notification_type: notificationType,
      };

      console.log("Sending Broadcast Payload:", payload);

      // 🚀 Call the send-to-all endpoint directly
      // Adjust the prefix "/notifications" if your FastAPI router is mounted differently
      const response = await apiClient.post(
        "/notifications/send-to-all",
        payload,
      );
      console.log("✅ Notification Sent Successfully:", response);

      setStatusMessage({
        type: "success",
        text: "Notification broadcasted successfully!",
      });

      // Clear form
      setTitle("");
      setDescription("");
      setNotificationType("System Alert");
    } catch (error: any) {
      console.error("❌ Failed to send notification:", error);

      // Extract backend error message gracefully
      const backendError =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to send notification. Please try again.";

      setStatusMessage({ type: "error", text: backendError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 md:p-8 rounded-[10px] border border-gray-100 shadow-sm">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create Broadcast Notification
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Push an alert or promo to all user dashboards.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <div className="relative w-full sm:w-1/2">
              <select
                id="type"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm text-gray-900 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000] transition-colors"
              >
                <option value="Promotion / Marketing">
                  Promotion / Marketing
                </option>
                <option value="System Alert">System Alert</option>
                <option value="Order Update">Order Update</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000] transition-colors"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-4 rounded-lg flex items-center gap-2 text-sm ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="pt-4 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting || !title || !description}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#800000] rounded-lg hover:bg-[#600000] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Sending Broadcast..." : "Send to All Users"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
