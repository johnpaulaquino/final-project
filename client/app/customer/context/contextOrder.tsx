"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type OrderStatus = 'Action Needed' | 'Pending' | 'Approved' | 'Shipped' | 'Delivered';

export interface Order {
  id: number;
  string_id: string;
  user_id: number;
  client_name: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  order_status: OrderStatus;
  address_id: number;
  created_at: string;
  updated_at?: string;
}

const initialOrders: Order[] = [
  {
    id: 1,
    string_id: '#ORD-001',
    user_id: 101,
    client_name: 'Alice Johnson',
    product_id: 501,
    product_name: 'Classic Butter Biskota',
    quantity: 5,
    price: 74.95,
    order_status: 'Delivered',
    address_id: 901,
    created_at: '2026-04-20T10:30:00Z',
  },
  {
    id: 2,
    string_id: '#ORD-002',
    user_id: 102,
    client_name: 'Bob Smith',
    product_id: 502,
    product_name: 'Double Chocolate Chunk',
    quantity: 1,
    price: 16.00,
    order_status: 'Pending',
    address_id: 902,
    created_at: '2026-04-21T08:15:00Z',
  },
  {
    id: 3,
    string_id: '#ORD-003',
    user_id: 103,
    client_name: 'Charlie Davis',
    product_id: 503,
    product_name: 'Keto Nutty Crunch',
    quantity: 2,
    price: 49.98,
    order_status: 'Approved',
    address_id: 903,
    created_at: '2026-04-21T09:45:00Z',
  },
];

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: number, status: OrderStatus) => void;
  deleteOrder: (id: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. INITIAL LOAD: Check localStorage first, fallback to mock data
  useEffect(() => {
    const savedOrders = localStorage.getItem('biskota_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    setIsLoaded(true);
  }, []);

  // 2. SAVE ON CHANGE: Save to localStorage whenever orders update
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('biskota_orders', JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  // 3. CROSS-TAB SYNC: Listen for changes made by other tabs (Admin vs Customer)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'biskota_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Actions ---
  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (id: number, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, order_status: status, updated_at: new Date().toISOString() } : order
      )
    );
  };

  const deleteOrder = (id: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
}