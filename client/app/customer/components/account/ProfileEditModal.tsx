"use client";

import React, { useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import { ProfileData } from "./profileInfo";

interface ProfileEditModalProps {
  isOpen: boolean;
  initialData: ProfileData;
  onClose: () => void;
  onSaveSuccess: (updatedData: ProfileData) => void;
}

export default function ProfileEditModal({
  isOpen,
  initialData,
  onClose,
  onSaveSuccess,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- NEW: Get exactly today's date in YYYY-MM-DD format ---
  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (window.confirm("Are you sure you want to save these changes?")) {
      setIsSaving(true);
      try {
        const formPayload = new FormData();

        formPayload.append("firstname", formData.firstName);
        formPayload.append("lastname", formData.lastName);
        formPayload.append("middle_name", formData.middleName);
        formPayload.append("birth_date", formData.birthDate);

        if (avatarFile) {
          formPayload.append("image", avatarFile);
        }

        const response = await apiClient.patch(
          `/me/${formData.userId}`,
          formPayload,
        );
        const payload = response.message;
        console.log(payload);

        onSaveSuccess(formData);
      } catch (error) {
        console.error("Failed to update profile:", error);
        alert("An error occurred while saving. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost.",
      )
    ) {
      onClose();
    }
  };

  const firstInitial = formData.firstName
    ? formData.firstName.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1527]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-[#0B1527] text-lg sm:text-xl">
            Edit Personal Information
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-[#800000] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-grow custom-scrollbar">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#800000] text-white rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
              {formData.avatarPreview ? (
                <img
                  src={formData.avatarPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{firstInitial}</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg, image/png, image/gif"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                onClick={handleAvatarClick}
                type="button"
                className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors mb-1"
              >
                Upload New Avatar
              </button>
              <p className="text-[10px] text-gray-400 font-medium">
                Max size: 10MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2">
                FIRST NAME
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2">
                LAST NAME
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2">
                MIDDLE NAME (OPTIONAL)
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2">
                BIRTH DATE
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                max={today}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50/50 flex-shrink-0">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-[#800000] hover:bg-red-900 transition-colors text-sm shadow-sm disabled:opacity-70 flex justify-center items-center"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
