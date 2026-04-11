"use client";

import React, { useEffect, useState } from "react";
import { Address } from "../../context/contextAccount";
import { apiClient } from "@/lib/api";

// 1. ADD THE EXTRA PARAMETERS HERE
interface DeliveryAddressProps {
  savedAddresses: Address[];
  onSetDefault: (id: string) => void;
  onOpenModal: () => void;
  isExpanded: boolean; // <-- Added this
  setIsExpanded: (val: boolean) => void; // <-- Added this
}

export default function DeliveryAddress({
  savedAddresses,
  onSetDefault,
  onOpenModal,
  isExpanded,
  setIsExpanded,
}: DeliveryAddressProps) {
  const activeAddress = savedAddresses.find((addr) => addr.is_default) || savedAddresses[0];

  const formatAddress = () => {
    // 1. Combine House/Lot Number and Street Name
    const streetAddress = `${activeAddress.st_bd_hno.house_no} ${activeAddress.st_bd_hno.street}`;

    // 2. Handle the optional Building Name gracefully
    const building = activeAddress.st_bd_hno.building_name
      ? `${activeAddress.st_bd_hno.building_name}, `
      : "";

    // 3. Compile the final formatted string
    const compiledAddress = `${streetAddress}, ${building}${activeAddress.barangay}, ${activeAddress.city}, ${activeAddress.province}, ${activeAddress.postal_code}`;

    return compiledAddress;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-[#800000]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 className="text-lg font-bold text-[#0B1527]">Delivery Address</h2>
        </div>

        {!isExpanded && savedAddresses.length > 0 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm font-bold text-[#800000] hover:underline"
          >
            Change
          </button>
        )}
      </div>

      {savedAddresses.length === 0 ? (
        <div
          onClick={onOpenModal}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#800000] hover:bg-red-50 transition-colors"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mb-3">
            +
          </div>
          <h3 className="text-gray-900 font-bold mb-1">Add Delivery Address</h3>
          <p className="text-gray-500 text-sm">
            You haven't saved an address yet.
          </p>
        </div>
      ) : isExpanded ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          {savedAddresses.map((address) => {
            const isSelected = address.id === activeAddress?.id;

            return (
              <div
                key={address.id}
                onClick={() => onSetDefault(address.id)}
                className={`cursor-pointer border bg-[#fcfcfc] rounded-xl p-4 flex items-start gap-3 transition-colors ${
                  isSelected
                    ? "border-[#800000] bg-red-50/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`mt-1 w-[14px] h-[14px] rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[#800000]" : "border-gray-400"}`}
                >
                  {isSelected && (
                    <div className="w-[6px] h-[6px] rounded-full bg-[#800000]"></div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-1">
                    <span
                      className={`font-bold ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                    >
                      {address.fullname}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {address.phone}
                    </span>
                    {isSelected && (
                      <span className="bg-[#E2E8F0] text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded tracking-wider">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mt-1">
                    {formatAddress()}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => setIsExpanded(false)} // Call the parent function!
              className="flex-1 bg-[#F4F4F5] text-[#0B1527] font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
            <button
              onClick={onOpenModal}
              className="flex-1 bg-[#0B1527] text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg font-light leading-none">+</span> Add New
              Address
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-gray-100 bg-[#fcfcfc] rounded-xl p-5 animate-in fade-in duration-200">
          {activeAddress && (
            <>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-gray-900">
                  {activeAddress.fullname}
                </span>
                <span className="text-gray-500 text-sm">
                  {activeAddress.phone}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mt-2">
                {formatAddress()}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
