"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import ProfileEditModal from "./ProfileEditModal";

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

  const handleUpdateSuccess = (updatedData: ProfileData) => {
    setProfileData(updatedData);
    setIsEditModalOpen(false);
  };

  const firstInitial = profileData.firstName
    ? profileData.firstName.charAt(0).toUpperCase()
    : "?";

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-gray-400 animate-pulse font-medium">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-12 px-4 sm:px-0 w-full max-w-4xl mx-auto space-y-6">
      
      {/* CARD 1: PERSONAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:px-8 border-b border-gray-50 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0B1527]">Personal Information</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your personal details and avatar.</p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-[#0B1527] font-semibold py-2 px-5 rounded-lg shadow-sm transition-all text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Avatar Column */}
          <div className="flex flex-col items-center md:items-start gap-3 flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#800000] text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md overflow-hidden ring-4 ring-white border border-gray-100">
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
          </div>

          {/* Data Grid Column */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">FIRST NAME</span>
              <span className="text-base font-medium text-gray-900">{profileData.firstName || "—"}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">LAST NAME</span>
              <span className="text-base font-medium text-gray-900">{profileData.lastName || "—"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">MIDDLE NAME</span>
              <span className="text-base font-medium text-gray-900">{profileData.middleName || "—"}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider mb-1">BIRTH DATE</span>
              <span className="text-base font-medium text-gray-900">{profileData.birthDate || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: ACCOUNT SETTINGS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:px-8 border-b border-gray-50">
          <h2 className="text-xl font-bold text-[#0B1527]">Account Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your login credentials.</p>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-3">
            <label className="block text-[11px] font-bold text-gray-400 tracking-wider">
              ACCOUNT EMAIL
            </label>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 border border-amber-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Requires separate verification
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              readOnly
              className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 bg-gray-50 focus:outline-none cursor-not-allowed"
            />
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-[#0B1527] hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
            >
              Update Email
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
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