"use client";

import React, { useState } from "react";
import { Address, useAccount } from "../../context/contextAccount";
import AddressFormModal from "../checkout/addressFormModal";
import { apiClient } from "@/lib/api";

export default function AddressBook() {
  // IMPORTANT: Make sure setAddresses is exported from your contextAccount.tsx!
  const { addresses, addAddress, removeAddress, setAddresses } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const formatAddress = (addrToFormat: Address | undefined) => {
    if (!addrToFormat) return "";

    const streetAddress = `${addrToFormat.st_bd_hno?.house_no} ${addrToFormat.st_bd_hno?.street}`;
    const building = addrToFormat.st_bd_hno?.building_name
      ? `${addrToFormat.st_bd_hno.building_name}, `
      : "";
    return `${streetAddress}, ${building}${addrToFormat.barangay}, ${addrToFormat.city}, ${addrToFormat.province}, ${addrToFormat.postal_code}`;
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const formPayload = new FormData();
      await apiClient.patch(`/me/address/${id}/set-default`, formPayload);

      // Update UI for default
      if (setAddresses) {
        const updatedAddresses = addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        }));
        setAddresses(updatedAddresses);
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  const handleOpenAdd = () => {
    setEditingAddress(null); // Clears data so it acts as an INSERT
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address); // Sets data so it acts as an UPDATE
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setIsDeleting(id);
      try {
        await apiClient.delete(`/me/address/${id}`);
        removeAddress(id);
      } catch (error) {
        console.error("Failed to delete address:", error);
        alert("Failed to delete address. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // --- THE COMPLETED INSERT & UPDATE HANDLER ---
  const handleSaveAddress = async (formData: any) => {
    try {
      const payload = {
        fullname: formData.fullName,
        region: formData.region,
        province: formData.province,
        city: formData.city,
        barangay: formData.barangay,
        postal_code: formData.postalCode,
        st_bd_hno: {
          street: formData.street,
          house_no: formData.houseNumber,
          building_name: formData.buildingName,
        },
      };

      if (editingAddress) {
        // 1. UPDATE EXISTING ADDRESS (PATCH)
        await apiClient.patch(`/me/address/${editingAddress.id}`, payload);

        // 2. Instantly update the UI without refreshing the page
        if (setAddresses) {
          const updatedAddresses = addresses.map((addr) => {
            if (addr.id === editingAddress.id) {
              return {
                ...addr,
                fullname: payload.fullname,
                region: payload.region,
                province: payload.province,
                city: payload.city,
                barangay: payload.barangay,
                postal_code: payload.postal_code,
                st_bd_hno: payload.st_bd_hno,
              };
            }
            return addr; // Keep other addresses unchanged
          });
          setAddresses(updatedAddresses);
        }
      } else {
        // 1. ADD NEW ADDRESS (POST)
        const response = await apiClient.post("/me/address", payload);
        const data: Address = response.data?.data || response.data;

        const newAddress = {
          id: data.id,
          fullname: data.fullname,
          region: data.region,
          province: data.province,
          city: data.city,
          barangay: data.barangay,
          postal_code: data.postal_code,
          st_bd_hno: {
            street: data.st_bd_hno.street,
            house_no: data.st_bd_hno.house_no,
            building_name: data.st_bd_hno.building_name,
          },
          is_default: data.is_default,
          phone: "",
        };

        // 2. Add to the UI instantly
        addAddress(newAddress);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save address:", error);
      throw error;
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-[#0B1527]">Delivery Addresses</h2>
        <button
          onClick={handleOpenAdd}
          className="text-sm font-bold text-[#800000] hover:text-red-900 transition-colors flex items-center gap-1"
        >
          <span>+ Add New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 font-medium mb-2">
              No addresses saved yet.
            </p>
            <button
              onClick={handleOpenAdd}
              className="text-[#800000] font-bold text-sm hover:underline"
            >
              Add your first address
            </button>
          </div>
        ) : (
          addresses.map((address) => {
            const isThisDeleting = isDeleting === address.id;

            return (
              <div
                key={address.id}
                className={`p-5 rounded-[16px] border flex flex-col justify-between min-h-[140px] transition-opacity duration-200 ${
                  address.is_default
                    ? "border-[#800000]/20 bg-[#800000]/[0.02]"
                    : "border-gray-100 bg-white"
                } ${isThisDeleting ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    {address.is_default && (
                      <span className="text-[10px] font-bold text-[#800000] bg-red-50 px-2 py-1 rounded-[6px]">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-900 font-bold mt-2">
                    {address.fullname}{" "}
                    <span className="font-normal text-gray-500 ml-2">
                      {address.phone}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    {formatAddress(address)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100/50">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleOpenEdit(address)}
                      disabled={isThisDeleting}
                      className="text-xs font-medium text-gray-400 hover:text-gray-800 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isThisDeleting}
                      className="text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isThisDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  {!address.is_default && (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      disabled={isThisDeleting}
                      className="text-xs font-bold text-[#800000] hover:text-red-900 disabled:opacity-50"
                    >
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress} // <-- This tells the modal whether it's an UPDATE or INSERT!
      />
    </div>
  );
}
