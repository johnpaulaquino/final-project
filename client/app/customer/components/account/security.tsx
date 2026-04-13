"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api";

export default function SecuritySettings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // STATE FOR SUCCESS & ERROR MESSAGES
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null); // Clear previous messages

    // 1. Basic Front-End Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setStatusMessage({
        type: "error",
        text: "Please fill out all password fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    // 2. Make the API Call
    setIsLoading(true);
    try {
      const payload = {
        old_password: oldPassword,
        new_password: newPassword,
      };

      // Ensure the route exactly matches your FastAPI route definition
      await apiClient.patch("/me/change-password", payload);

      // 3. HANDLE SUCCESS
      setStatusMessage({
        type: "success",
        text: "Password updated successfully! All other devices have been logged out.",
      });

      // Clear the form fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to update password:", error);

      // 4. HANDLE ERROR (Extracts message from your FastAPI raise exceptions)
      setStatusMessage({
        type: "error",
        text:
          error?.message ||
          "Failed to update password. Please check your old password and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-[#0B1527] mb-6">Change Password</h2>

      {/* THE SUCCESS / ERROR BANNER UI */}
      {statusMessage && (
        <div
          className={`max-w-xl p-4 rounded-xl text-sm font-bold flex items-center gap-2 mb-6 animate-in slide-in-from-top-2 duration-200 ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {statusMessage.text}
        </div>
      )}

      <form className="max-w-xl flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">
            CURRENT PASSWORD
          </label>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">
              NEW PASSWORD
            </label>
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">
              CONFIRM NEW
            </label>
            <input
              type="password"
              placeholder="Password Confirmation"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-6 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-[12px] shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]"
          >
            {isLoading ? (
              <span className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Update Password"
            )}
          </button>
          <button
            type="button"
            className="text-sm font-bold text-[#800000] hover:text-red-900 transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
