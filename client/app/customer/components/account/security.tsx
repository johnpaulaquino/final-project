"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api";
import ForgotPasswordForm from "../../../auth/forgotPassword"; // Adjust the import path as needed

export default function SecuritySettings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  
  // State for the Forgot Password Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

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

      await apiClient.patch("/me/change-password", payload);

      // 3. HANDLE SUCCESS
      setStatusMessage({
        type: "success",
        text: "Password updated successfully! Redirecting to login...",
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update password:", error);
      setIsLoading(false);

      // 4. HANDLE ERROR
      setStatusMessage({
        type: "error",
        text:
          error?.message ||
          "Failed to update password. Please check your old password and try again.",
      });
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in duration-500">
        
        {/* HEADER SECTION */}
        <div className="mb-8 border-b border-gray-50 pb-6">
          <h2 className="text-xl font-bold text-[#0B1527]">Security Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure.</p>
        </div>

        <div className="max-w-xl">
          {/* THE SUCCESS / ERROR BANNER UI */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-semibold flex items-start sm:items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-300 ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-100"
                  : "bg-red-50 text-red-800 border border-red-100"
              }`}
            >
              {statusMessage.type === "success" ? (
                <div className="bg-green-100 p-1 rounded-full flex-shrink-0 mt-0.5 sm:mt-0">
                  <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="bg-red-100 p-1 rounded-full flex-shrink-0 mt-0.5 sm:mt-0">
                  <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <span className="leading-tight">{statusMessage.text}</span>
            </div>
          )}

          {/* FORM SECTION */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {/* Old Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">
                CURRENT PASSWORD
              </label>
              <input
                type="password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={statusMessage?.type === "success"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all disabled:opacity-50 disabled:bg-gray-100 shadow-inner shadow-gray-50/50"
              />
            </div>

            <div className="w-full h-px bg-gray-50 my-2"></div>

            {/* New Passwords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={statusMessage?.type === "success"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all disabled:opacity-50 disabled:bg-gray-100 shadow-inner shadow-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 tracking-wider mb-2">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={statusMessage?.type === "success"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all disabled:opacity-50 disabled:bg-gray-100 shadow-inner shadow-gray-50/50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-2">
              <button
                type="submit"
                disabled={isLoading || statusMessage?.type === "success"}
                className="w-full sm:w-auto bg-[#0B1527] hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px] text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(true)} // Opens the modal
                className="text-sm font-semibold text-[#800000] hover:text-red-900 transition-colors py-2 px-4 rounded-lg hover:bg-red-50"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Injected Form Component */}
            <ForgotPasswordForm 
              onGoToLogin={() => setIsModalOpen(false)} 
              hideLoginLink={true} 
            />
            
          </div>
        </div>
      )}
    </>
  );
}