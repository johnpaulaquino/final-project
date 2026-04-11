"use client";

import { apiClient } from "@/lib/api";
import { log } from "console";
import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Unified Address Type that works for both Checkout and Account Settings
export interface Address {
  id: string;
  fullname: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  postal_code: string;
  st_bd_hno: {
    street: string;
    house_no: string;
    building_name: string;
  };
  is_default: boolean;
  phone: string;
}

interface AccountContextType {
  addresses: Address[];
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setSelectedAddress: (id: string) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  useEffect(() => {
    // 1. Define the async function
    const getCurrentAddress = async () => {
      try {
        // 2. Make the API call
        const response = await apiClient.get("/me/address");
        console.log("API response for address:", response);
        // Handle the data array
        const data = response.data;

        const dbAddresses = Array.isArray(data) ? data : data ? [data] : [];

        setAddresses(dbAddresses);
      } catch (error) {
        console.error("Failed to fetch address:", error);
      }
    };

    // 5. Call the function WITHOUT the 'await' keyword
    getCurrentAddress();
  }, []); // Use an empty dependency array [] so it only fetches once when the component loads

  console.log("Current addresses in context:", addresses);
  const addAddress = (newAddress: Address) => {
    setAddresses((prev) => {
      const isFirst = prev.length === 0;
      return [...prev, { ...newAddress, isDefault: isFirst }];
    });
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const setSelectedAddress = (id: string) => {
    //TODO UPdate is_selected in the backend as well
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  };

  return (
    <AccountContext.Provider
      value={{ addresses, addAddress, removeAddress, setSelectedAddress }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
