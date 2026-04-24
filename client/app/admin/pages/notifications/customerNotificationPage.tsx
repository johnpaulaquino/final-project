"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export interface User {
  id: string;
  username?: string;
  email?: string;
  full_name?: string;
}

export default function customerNotificationPage() {
  const [recipient, setRecipient] = useState("all");
  const [notificationType, setNotificationType] = useState("System Alert");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        console.log("Fetching users from /users/...");
        
        const response = await apiClient.get("/users/"); 
        console.log("Users API Response:", response);
        
        if (Array.isArray(response)) {
          setUsers(response);
        } else if (response && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response && Array.isArray(response.items)) {
          setUsers(response.items);
        } else {
          console.warn("Could not find user array in response. Check the console logs.");
          setUsers([]);
        }
      } catch (error: any) {
        // ENHANCED LOGGING
        console.error("Failed to fetch users:");
        console.error("Error details:", error?.response?.data || error.message || error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // 2. SUBMIT NOTIFICATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Build payload dynamically to prevent sending `null` if the backend hates it
      const payload: any = {
        notification_type: notificationType,
        title: title,
        description: description,
      };

      // Only attach user_id if we are targeting a specific person
      if (recipient !== "all") {
        payload.user_id = recipient;
      }

      console.log("Sending Notification Payload:", payload);

      const response = await apiClient.post("/notifications/", payload);
      console.log("✅ Notification Sent Successfully:", response);
      
      setStatusMessage({ type: 'success', text: 'Notification sent successfully!' });
      setTitle("");
      setDescription("");
      setRecipient("all"); 
      
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error: any) {
      // ENHANCED LOGGING
      console.error("❌ Failed to send notification:");
      console.error("Payload attempted:", { notification_type: notificationType, title, description, user_id: recipient !== "all" ? recipient : undefined });
      console.error("Error details:", error?.response?.data || error.message || error);
      
      // Try to show the exact backend error message if it exists
      const backendError = error?.response?.data?.detail || error?.response?.data?.message || 'Failed to send notification. Please try again.';
      setStatusMessage({ type: 'error', text: backendError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 md:p-8 rounded-[10px] border border-gray-100 shadow-sm">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Customer Notification</h2>
            <p className="mt-1 text-sm text-gray-500">Push an alert or promo directly to user dashboards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient (user_id)</label>
              <div className="relative">
                <select
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={isLoadingUsers}
                  className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm text-gray-900 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000] disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="all">Broadcast to All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.username || user.email || `User ID: ${user.id}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  {isLoadingUsers ? (
                    <span className="text-xs">Loading...</span>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <div className="relative">
                <select
                  id="type"
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-sm text-gray-900 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000] transition-colors"
                >
                  <option value="Promotion / Marketing">Promotion / Marketing</option>
                  <option value="System Alert">System Alert</option>
                  <option value="Order Update">Order Update</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
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
            <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="pt-4 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting || !title || !description}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#800000] rounded-lg hover:bg-[#600000] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
    </div>
  </div>
  );
}