"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  processingText?: string;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  // Optional: Allows you to change the color based on action (e.g., red for delete, dark blue for logout)
  confirmColorClass?: string;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Confirm",
  processingText = "Processing...",
  isProcessing = false,
  onCancel,
  onConfirm,
  confirmColorClass = "bg-red-600 hover:bg-red-700", // Defaults to destructive/red
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Dynamic Title and Message */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-8">{message}</p>

        <div className="flex justify-end gap-3">
          {/* Dynamic Cancel Button */}
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          {/* Dynamic Confirm Button */}
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmColorClass}`}
          >
            {isProcessing ? processingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
