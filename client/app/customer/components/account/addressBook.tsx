'use client';

import React, { useState } from 'react';
import { useAccount } from '../../context/contextAccount';
import AddressFormModal from '../checkout/addressFormModal'; 

export default function addressBook() {
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveAddress = (formData: any) => {
    const compiledAddress = `${formData.houseNumber} ${formData.street}, ${
      formData.buildingName ? formData.buildingName + ', ' : ''
    }${formData.barangay}, ${formData.city}, ${formData.province || 'NCR'}, ${formData.postalCode}`;

    const newAddress = {
      id: Date.now().toString(),
      label: 'New Address', 
      name: formData.fullName || "User",
      phone: formData.phone || "No phone",
      fullAddress: compiledAddress,
      isDefault: false
    };

    addAddress(newAddress); // to save to global context
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-[#0B1527]">Delivery Addresses</h2>
        <button onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-[#800000] hover:text-red-900 transition-colors flex items-center gap-1">
          <span>+ Add New</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 font-medium mb-2">No addresses saved yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-[#800000] font-bold text-sm hover:underline">
              Add your first address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className={`p-5 rounded-[16px] border flex flex-col justify-between min-h-[140px] ${address.isDefault ? 'border-[#800000]/20 bg-[#800000]/[0.02]' : 'border-gray-100 bg-white'}`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-sm">{address.label}</h3>
                  {address.isDefault && (
                    <span className="text-[10px] font-bold text-[#800000] bg-red-50 px-2 py-1 rounded-[6px]">Default</span>
                  )}
                </div>
                {/* Updated to display the unified fullAddress */}
                <p className="text-xs text-gray-900 font-bold mt-2">{address.name} <span className="font-normal text-gray-500 ml-2">{address.phone}</span></p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">{address.fullAddress}</p>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100/50">
                <div className="flex gap-4">
                  <button className="text-xs font-medium text-gray-400 hover:text-gray-800">Edit</button>
                  <button onClick={() => removeAddress(address.id)} className="text-xs font-medium text-gray-400 hover:text-red-600">Delete</button>
                </div>
                {!address.isDefault && (
                  <button onClick={() => setDefaultAddress(address.id)} className="text-xs font-bold text-[#800000] hover:text-red-900">Set Default</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AddressFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAddress} />
    </div>
  );
}