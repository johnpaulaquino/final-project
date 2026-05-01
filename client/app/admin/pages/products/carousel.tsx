"use client";

import React, { useState, useEffect } from "react";
import { useBanner } from "../../../customer/context/contextBanner"; // Adjust path as needed
import ConfirmationModal from "@/app/customer/components/ConfirmationModal"; // Adjust path as needed

export default function Carousel() {
  const { banners, isLoading, addBanner, removeBanner } = useBanner();

  const [isUploading, setIsUploading] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 🚀 NEW: Check if the 6-banner limit is reached
  const MAX_BANNERS = 6;
  const isLimitReached = banners.length >= MAX_BANNERS;

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      await removeBanner(bannerToDelete);
      setStatusMessage({
        type: "success",
        text: "Banner deleted successfully!",
      });
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error?.response?.data?.detail || "Failed to delete banner from server.",
      });
    } finally {
      setIsDeleting(false);
      setBannerToDelete(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLimitReached) return; // 🚀 NEW: Prevent upload execution if limit reached

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const scaleSize = Math.min(MAX_WIDTH / img.width, 1);

          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                setStatusMessage({
                  type: "error",
                  text: "Failed to compress image.",
                });
                return;
              }

              setIsUploading(true);

              try {
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                await addBanner(blob, file.name, compressedBase64);
                setStatusMessage({
                  type: "success",
                  text: "Banner uploaded successfully!",
                });
              } catch (error: any) {
                setStatusMessage({
                  type: "error",
                  text: error.message || error?.response?.data?.detail || "Failed to upload banner to server.",
                });
              } finally {
                setIsUploading(false);
              }
            },
            "image/jpeg",
            0.7,
          );

          e.target.value = ""; // Reset input
        };

        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 relative">
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            statusMessage.type === "success"
              ? "bg-white text-green-700 border-green-100 shadow-green-900/5"
              : "bg-white text-red-700 border-red-100 shadow-red-900/5"
          }`}
        >
          <span className="font-bold text-sm">{statusMessage.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#800000]/5 px-3 py-1.5 rounded-[10px] border border-[#800000]/10">
            <span className={`w-2 h-2 rounded-full ${isLimitReached ? "bg-orange-500" : "bg-[#800000] animate-pulse"}`}></span>
            <span className="text-[#800000] font-bold text-xs">
              {banners.length} / {MAX_BANNERS} Active Banners
            </span>
          </div>
          {/* 🚀 NEW: Warning text if limit is reached */}
          {isLimitReached && (
            <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded">
              Maximum limit reached
            </span>
          )}
        </div>

        {/* 🚀 NEW: Upload Button logic updated for limit */}
        <label
          className={`transition-all text-white text-sm font-bold py-2.5 px-4 rounded-[10px] shadow-sm flex items-center gap-2 h-[42px] ${
            isUploading || isLimitReached
              ? "bg-gray-400 cursor-not-allowed opacity-70"
              : "bg-[#0B1527] hover:bg-gray-800 cursor-pointer active:scale-95"
          }`}
        >
          {isUploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isLimitReached ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          {isUploading ? "Uploading..." : isLimitReached ? "Limit Reached" : "Upload Banner"}
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*"
            disabled={isUploading || isLimitReached}
          />
        </label>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-6 md:p-8 border border-gray-100 rounded-[10px] shadow-sm bg-white min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 animate-pulse">
             <svg className="w-8 h-8 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <p className="font-bold">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
             <div className="w-16 h-16 bg-gray-50 rounded-[10px] flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             </div>
             <p className="text-gray-900 font-extrabold text-lg">No banners found</p>
             <p className="text-sm text-gray-400 mt-1 max-w-sm text-center">Upload your first image to activate the carousel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((banner, index) => (
              <div key={banner.id} className="group border border-gray-100 rounded-[10px] p-3 bg-white hover:border-gray-300 transition-colors">
                <div className="w-full h-40 bg-gray-50 rounded-[5px] mb-3 overflow-hidden relative border border-gray-100">
                  <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-black px-2 py-1 rounded-[5px] shadow-sm">
                    Slide {index + 1}
                  </div>
                  <img
                    src={banner.image.startsWith("/") ? banner.image : `${banner.image}`}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-[5px] bg-emerald-50 text-[10px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </div>

                  <button
                    onClick={() => setBannerToDelete(banner.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-[5px] transition-colors cursor-pointer text-gray-400 hover:text-white hover:bg-red-500"
                    title="Delete Banner"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={bannerToDelete !== null}
        title="Delete Banner?"
        message="Are you sure you want to permanently delete this banner? This action cannot be undone."
        cancelText="Keep Banner"
        confirmText="Yes, Delete"
        processingText="Deleting..."
        isProcessing={isDeleting}
        onCancel={() => setBannerToDelete(null)}
        onConfirm={handleConfirmDelete}
        confirmColorClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}