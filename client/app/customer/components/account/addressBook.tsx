"use client";

import React, { useState } from "react";
import { Address, useAccount } from "../../context/contextAccount";
import AddressFormModal from "../checkout/addressFormModal";
import { apiClient } from "@/lib/api";

export default function AddressBook() {
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
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
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
        await apiClient.patch(`/me/address/${editingAddress.id}`, payload);

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
            return addr;
          });
          setAddresses(updatedAddresses);
        }
      } else {
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

        addAddress(newAddress);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save address:", error);
      throw error;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 border-b border-gray-50 pb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1527]">Address Book</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your saved delivery locations.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-[#0B1527] hover:bg-gray-800 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Address
        </button>
      </div>

      {/* ADDRESS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.length === 0 ? (
          
          /* EMPTY STATE */
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-gray-900 font-bold mb-1">No addresses saved</p>
            <p className="text-gray-500 text-sm mb-4">Add an address so you can checkout faster.</p>
            <button
              onClick={handleOpenAdd}
              className="text-[#800000] font-semibold text-sm hover:text-red-900 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              Add your first address
            </button>
          </div>

        ) : (
          
          /* ADDRESS CARDS */
          addresses.map((address) => {
            const isThisDeleting = isDeleting === address.id;

            return (
              <div
                key={address.id}
                className={`relative p-6 rounded-2xl border flex flex-col justify-between min-h-[160px] transition-all duration-200 ${
                  address.is_default
                    ? "border-[#800000] bg-red-50/10 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                } ${isThisDeleting ? "opacity-50 pointer-events-none scale-[0.98]" : ""}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base text-gray-900 font-bold flex items-center flex-wrap gap-2">
                      {address.fullname}
                      {address.is_default && (
                        <span className="text-[10px] font-bold tracking-wide text-[#800000] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                          DEFAULT
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {address.phone || "No phone provided"}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed pr-4">
                    {formatAddress(address)}
                  </p>
                </div>

                {/* CARD FOOTER / ACTIONS */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleOpenEdit(address)}
                      disabled={isThisDeleting}
                      className="text-sm font-semibold text-gray-500 hover:text-[#0B1527] disabled:opacity-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isThisDeleting}
                      className="text-sm font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                    >
                      {isThisDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  
                  {!address.is_default && (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      disabled={isThisDeleting}
                      className="text-sm font-semibold text-[#800000] hover:text-red-900 disabled:opacity-50 transition-colors"
                    >
                      Set as Default
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
        initialData={editingAddress}
      />
    </div>
  );
}