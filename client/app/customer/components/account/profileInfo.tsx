"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import ProfileEditModal from "./ProfileEditModal";

// 1. Export the interface from here so the Modal can use it
export interface ProfileData {
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  avatarPreview: string | null;
}

export default function ProfileInfo() {
  const [profileData, setProfileData] = useState<ProfileData>({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    avatarPreview: null,
  });

  const [email, setEmail] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. THIS FETCHES THE DATA ON FIRST LOAD AND SAVES TO MEMORY
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await apiClient.get("/me/");
        const payload = response.data?.data || response.data;

        if (payload?.Users) {
          setEmail(payload.Users.email || "");
        }

        if (payload?.PersonalInfo) {
          setProfileData({
            userId: payload.Users?.id || "",
            firstName: payload.PersonalInfo.firstname || "",
            middleName: payload.PersonalInfo.middle_name || "",
            lastName: payload.PersonalInfo.lastname || "",
            birthDate: payload.PersonalInfo.birth_date || "",
            avatarPreview:
              payload.PersonalInfo.profile_image?.image_url || null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // 3. THIS UPDATES THE MEMORY (AND UI) INSTANTLY AFTER THE MODAL SAVES
  const handleUpdateSuccess = (updatedData: ProfileData) => {
    setProfileData(updatedData);
    setIsEditModalOpen(false);
  };

  const firstInitial = profileData.firstName
    ? profileData.firstName.charAt(0).toUpperCase()
    : "?";

  // Prevent rendering the UI until the API data is safely in memory
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 pb-12 px-4 sm:px-0 flex flex-col items-start w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-[#0B1527] mb-6 sm:mb-8 self-start">
        Personal Information
      </h2>

      {/* AVATAR DISPLAY (Read-Only) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-8 sm:mb-10 border-b border-gray-100 pb-6 sm:pb-8 w-full">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#800000] text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-md overflow-hidden flex-shrink-0">
          {profileData.avatarPreview ? (
            <img
              src={profileData.avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{firstInitial}</span>
          )}
        </div>
        <div className="flex flex-col items-start">
          <h3 className="font-bold text-gray-900 text-lg">
            {profileData.firstName || "-"} {profileData.lastName || "-"}
          </h3>
          <p className="text-sm text-gray-500">Profile Avatar</p>
        </div>
      </div>

      {/* READ-ONLY INFO DISPLAY */}
      <div className="w-full max-w-xl sm:mx-auto flex flex-col gap-5 sm:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-wider mb-1.5 sm:mb-2">
              FIRST NAME
            </label>
            <div className="w-full border border-gray-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-600 bg-gray-50/50 shadow-inner min-h-[44px]">
              {profileData.firstName || "-"}
            </div>
          </div>
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-wider mb-1.5 sm:mb-2">
              LAST NAME
            </label>
            <div className="w-full border border-gray-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-600 bg-gray-50/50 shadow-inner min-h-[44px]">
              {profileData.lastName || "-"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-wider mb-1.5 sm:mb-2">
              MIDDLE NAME
            </label>
            <div className="w-full border border-gray-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-600 bg-gray-50/50 shadow-inner min-h-[44px]">
              {profileData.middleName || "-"}
            </div>
          </div>
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-wider mb-1.5 sm:mb-2">
              BIRTH DATE
            </label>
            <div className="w-full border border-gray-100 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-600 bg-gray-50/50 shadow-inner min-h-[44px]">
              {profileData.birthDate || "-"}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="pt-2 sm:pt-4 w-full flex justify-start sm:justify-center border-t border-gray-100 mt-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto bg-[#0B1527] hover:bg-gray-800 text-white font-bold py-3 px-10 rounded-xl shadow-md transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit Personal Information
          </button>
        </div>
      </div>

      {/* ISOLATED EMAIL SECTION */}
      <div className="w-full max-w-xl sm:mx-auto mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-3 sm:mb-2">
          <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-wider">
            ACCOUNT EMAIL
          </label>
          <span className="text-[9px] sm:text-[10px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium self-start sm:self-auto flex items-center gap-1">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Requires separate verification
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-500 bg-gray-50 focus:outline-none cursor-not-allowed shadow-inner"
          />
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-[#0B1527] hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            Update Email
          </button>
        </div>
      </div>

      {/* RENDER THE MODAL IF OPEN */}
      {isEditModalOpen && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          initialData={profileData}
          onClose={() => setIsEditModalOpen(false)}
          onSaveSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
