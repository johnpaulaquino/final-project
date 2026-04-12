"use client";

import { useEffect, useState } from "react";
import AddressFormModal from "../components/checkout/addressFormModal";
import DeliveryAddress from "../components/checkout/deliveryAddress";
import PaymentMethod from "../components/checkout/paymentMethod";
import OrderSummary from "../components/checkout/orderSummary";
import { Address, useAccount } from "../context/contextAccount";
import { useCart } from "../context/contextCart"; // 1. Import useCart
import { apiClient } from "@/lib/api"; // 2. Import your apiClient

export interface FormDataRequest {
  barangay: string;
  buildingName: string | null;
  city: string;
  fullName: string;
  houseNumber: string;
  phone: string;
  postalCode: string;
  province: string;
  region: string;
  street: string;
}

export default function CheckoutPage() {
  const { addresses, addAddress } = useAccount();
  const { cart } = useCart(); // 3. Grab the cart data here!

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState("cc");
  const [isAddressExpanded, setIsAddressExpanded] = useState(true);

  // Optional: Add a loading state to disable buttons while the API is calling
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    // If addresses are loaded, AND we haven't selected one yet...
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr =
        addresses.find((addr) => addr.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setIsAddressExpanded(false); // Auto-collapse because they are ready!
    }
  }, [addresses, selectedAddressId]);

  const handleSaveAddress = async (formData: FormDataRequest) => {
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
      const response = await apiClient.post("/me/address", payload);

      const data: Address = response.data.data || response.data; // Ensure you grab the object

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
      setSelectedAddressId(newAddress.id);
      setIsModalOpen(false);
      setIsAddressExpanded(true); // Leave expanded so they can click 'Done'
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const getFormattedPaymentMethod = (method: string) => {
    switch (method) {
      case "cc":
        return "CREDIT_CARD";
      case "gcash":
        return "GCASH";
      case "cod":
        return "COD";
      default:
        return "COD";
    }
  };

  // 4. THE API CALL
  const handleProcessPayment = async () => {
    if (addresses.length === 0) {
      alert("Please add a delivery address first!");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsProcessing(true);

    try {
      const formattedPayment = getFormattedPaymentMethod(activePayment);

      const payload = {
        orders: cart.map((item) => ({
          quantity: item.Carts.quantity,
          product_id: item.Carts.product_id,
          payment_method: formattedPayment,
          address_id: selectedAddressId,
        })),
      };

      // Call your backend
      await apiClient.post("/order/batch", payload);

      alert("Order Placed Successfully!");
    } catch (error) {
      console.error("Failed to checkout:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isAddressReady = addresses.length > 0 && !isAddressExpanded;

  return (
    <main className="max-w-[1500px] mx-auto pt-6 md:pt-28 px-4 md:px-6 flex flex-col xl:flex-row gap-6 md:gap-8 pb-12">
      <div className="flex-grow flex flex-col gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Checkout
          </h1>
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-[#800000] transition font-medium"
          >
            &lsaquo; Back to Shopping
          </button>
        </div>

        {/* delivery */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-[#800000] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
              1
            </span>
            Delivery Address
          </h2>

          <DeliveryAddress
            savedAddresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onOpenModal={() => setIsModalOpen(true)}
            isExpanded={isAddressExpanded}
            setIsExpanded={setIsAddressExpanded}
          />
        </div>

        {/* payment */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-[#800000] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
              2
            </span>
            Payment Method
          </h2>
          <PaymentMethod
            activePayment={activePayment}
            setActivePayment={setActivePayment}
          />
        </div>
      </div>

      <div className="w-full xl:w-[450px] flex-shrink-0">
        <div className="sticky top-28">
          {/* Pass the loading state down to disable the button while processing */}
          <OrderSummary
            onProcessPayment={handleProcessPayment}
            isAddressSaved={isAddressReady}
            isProcessing={isProcessing}
          />
        </div>
      </div>

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
