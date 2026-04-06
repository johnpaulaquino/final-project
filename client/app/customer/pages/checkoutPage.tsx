'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddressFormModal from '../components/checkout/addressFormModal';
import DeliveryAddress, { Address } from '../components/checkout/deliveryAddress';
import PaymentMethod from '../components/checkout/paymentMethod';
import OrderSummary from '../components/checkout/orderSummary';

export default function CheckoutPage() {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(savedAddresses.length > 0 ? 0 : null);
  const [activePayment, setActivePayment] = useState('cc');

  const handleSaveAddress = (formData: any) => {
    const compiledAddress = `${formData.houseNumber} ${formData.street}, ${
      formData.buildingName ? formData.buildingName + ', ' : ''
    }${formData.barangay}, ${formData.city}, ${formData.province || 'NCR'}, ${formData.postalCode}`;

    const newAddress = {
      name: formData.fullName || "User",
      phone: formData.phone || "No phone provided",
      fullAddress: compiledAddress
    };

    setSavedAddresses(prev => {
      const updatedList = [...prev, newAddress];
      setSelectedIndex(updatedList.length - 1);
      return updatedList;
    });
    
    setIsModalOpen(false); 
  };

  const handleProcessPayment = () => {
    if (!savedAddresses) {
      alert("Please add a delivery address first!");
      return;
    }
    console.log("Processing payment via:", activePayment);
    alert("Payment Processing Initiated!");
  };

  return (
    <main className="max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8 pb-12">
      
      <div className="flex-grow flex flex-col gap-6 md:gap-8">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Checkout</h1>
          <button 
             onClick={() => window.history.back()} 
             className="text-gray-500 hover:text-[#800000] transition font-medium"
          >
            &lsaquo; Back to Shopping
          </button>
        </div>

        {/* delivery*/}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-[#800000] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Delivery Address
          </h2>
          
          <DeliveryAddress 
            savedAddresses={savedAddresses} 
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onOpenModal={() => setIsModalOpen(true)} 
          />
        </div>

        {/* payment */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-[#800000] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            Payment Method
          </h2>
          
          <PaymentMethod 
            activePayment={activePayment} 
            setActivePayment={setActivePayment} 
          />
        </div>

      </div>

      {/* order summary */}
      <div className="w-full xl:w-[450px] flex-shrink-0">
        <div className="sticky top-28">
          <OrderSummary 
            onProcessPayment={handleProcessPayment} 
            isAddressSaved={!!savedAddresses} 
          />
        </div>
      </div>

      {/* form for creating address */}
      {isModalOpen && (
        <AddressFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAddress}
        />
      )}

    </main>
  );
}