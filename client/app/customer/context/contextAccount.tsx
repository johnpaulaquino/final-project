'use client';

import React, { createContext, useContext, useState } from 'react';

// 1. Unified Address Type that works for both Checkout and Account Settings
export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
}

interface AccountContextType {
  addresses: Address[];
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const addAddress = (newAddress: Address) => {
    setAddresses((prev) => {
      const isFirst = prev.length === 0;
      return [...prev, { ...newAddress, isDefault: isFirst }];
    });
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  return (
    <AccountContext.Provider value={{ addresses, addAddress, removeAddress, setDefaultAddress }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}