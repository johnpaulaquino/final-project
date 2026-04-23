"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api";

export type OrderStatus =
  | "Pending"
  | "Approved"
  | "Shipped"
  | "Delivered"
  | "Received"
  | "Cancelled"
  | "Returned";

export interface Order {
  id: number;
  string_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  order_status: OrderStatus;
  transaction_reference: string | null;
  created_at: string | null;
}

// 1. ADD PAGINATION INTERFACE
interface PaginationMeta {
  hasNext: boolean;
  totalRecords: number;
  start_page: number;
  end_page: number;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  pagination: PaginationMeta; // <-- Add it to the context type
  fetchOrders: (status: string, skip: number, limit: number) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. ADD PAGINATION STATE
  const [pagination, setPagination] = useState<PaginationMeta>({
    hasNext: false,
    totalRecords: 0,
    start_page: 1,
    end_page: 1,
  });

  const fetchOrders = useCallback(
    async (status: string, skip: number, limit: number) => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(
          `/order/?order_status=${status}&skip=${skip}&limit=${limit}`,
        );

        console.log("🚨 RAW API RESPONSE:", response);

        // SAFELY EXTRACT THE ARRAY:
        // Checks multiple common FastAPI wrappers to find where the array is actually hiding
        let rawOrders = [];
        if (Array.isArray(response?.Orders)) rawOrders = response.Orders;
        else if (Array.isArray(response?.data?.Orders))
          rawOrders = response.data.Orders;
        else if (Array.isArray(response?.data)) rawOrders = response.data;
        else if (Array.isArray(response)) rawOrders = response;

        const mappedOrders: Order[] = rawOrders.map((item: any) => ({
          id: item.Orders.id,
          string_id: item.Orders.string_id,
          product_name: item.product_name,
          quantity: item.Orders.quantity,
          price: item.Orders.price,
          total_amount: item.total_amount,
          order_status: item.Orders.order_status,
          transaction_reference: item.transaction_reference,
          created_at: item.Orders.created_at,
        }));

        setOrders(mappedOrders);

        // CAPTURE THE PAGINATION DATA
        if (response?.paginated) {
          setPagination({
            hasNext: response.paginated.has_next,
            totalRecords: response.paginated.total_records,
            start_page: response.paginated.start_page,
            end_page: response.paginated.end_page,
          });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const cancelOrder = async (id: string) => {
    // 1. Optimistic UI update (Instantly changes the screen to feel fast)
    setOrders((prev) =>
      prev.map((order) =>
        order.string_id === id
          ? { ...order, order_status: "Cancelled" as OrderStatus }
          : order,
      ),
    );

    try {
      // 2. THE REAL API CALL: Hitting your specific cancel endpoint
      // Note: Most specific action endpoints use PUT or POST. Adjust to apiClient.post if your backend requires it!
      await apiClient.patch(`/order/${id}/cancel`, {});
    } catch (error) {
      console.error("Failed to cancel order:", error);
      // Optional: If the API fails, you could trigger fetchOrders() here to revert the UI back to Pending
    }
  };

  // 4. PROVIDE THE PAGINATION STATE
  return (
    <OrderContext.Provider
      value={{ orders, isLoading, pagination, fetchOrders, cancelOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error("useOrders must be used within an OrderProvider");
  return context;
}
