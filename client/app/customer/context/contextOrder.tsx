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
  user_id: string;
}

interface PaginationMeta {
  hasNext: boolean;
  totalRecords: number;
  start_page: number;
  end_page: number;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  pagination: PaginationMeta;
  fetchOrders: (status: string, skip: number, limit: number) => Promise<void>;
  fetchAdminOrders: (
    status: string,
    skip: number,
    limit: number,
  ) => Promise<void>;
  confirmOrder: (id: string, payload: any) => Promise<void>;
  shipOrder: (id: string, payload: any) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deliverOrder: (id: string, payload: any) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pagination, setPagination] = useState<PaginationMeta>({
    hasNext: false,
    totalRecords: 0,
    start_page: 1,
    end_page: 1,
  });

  const fetchAdminOrders = useCallback(
    async (status: string, skip: number, limit: number) => {
      setIsLoading(true);
      try {
        const queryParams =
          status === "All"
            ? `admin/?skip=${skip}&limit=${limit}`
            : `admin/?order_status=${status}&skip=${skip}&limit=${limit}`;

        const response = await apiClient.get(`/order/${queryParams}`);

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
          user_id: item.Orders.user_id,
        }));

        setOrders(mappedOrders);

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

  const fetchOrders = useCallback(
    async (status: string, skip: number, limit: number) => {
      setIsLoading(true);
      try {
        const queryParams =
          status === "All"
            ? `?skip=${skip}&limit=${limit}`
            : `?order_status=${status}&skip=${skip}&limit=${limit}`;

        const response = await apiClient.get(`/order/${queryParams}`);

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
  const deliverOrder = async (id: string, payload: any) => {
    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((order) =>
        order.string_id === id
          ? { ...order, order_status: "Delivered" as OrderStatus }
          : order,
      ),
    );
    try {
      await apiClient.patch(`/order/${id}/deliver`, payload);
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  // --- NEW: Implement confirmOrder ---
  const confirmOrder = async (id: string, payload: any) => {
    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((order) =>
        order.string_id === id
          ? { ...order, order_status: "Approved" as OrderStatus }
          : order,
      ),
    );
    try {
      await apiClient.patch(`/order/${id}/confirm`, payload);
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const cancelOrder = async (id: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.string_id === id
          ? { ...order, order_status: "Cancelled" as OrderStatus }
          : order,
      ),
    );
    try {
      await apiClient.patch(`/order/${id}/cancel`, {});
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const shipOrder = async (id: string, payload: any) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.string_id === id
          ? { ...order, order_status: "Shipped" as OrderStatus }
          : order,
      ),
    );
    try {
      await apiClient.patch(`/order/${id}/ship`, payload);
    } catch (error) {
      console.error("Failed to ship order:", error);
    }
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((order) => order.string_id !== id));
    try {
      await apiClient.delete(`/order/${id}`);
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.string_id === id ? { ...order, order_status: status } : order,
      ),
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        pagination,
        fetchOrders,
        fetchAdminOrders, // FIXED: Now properly maps to the fetchAdminOrders function
        cancelOrder,
        updateOrderStatus,
        deliverOrder,
        confirmOrder,
        shipOrder,
        deleteOrder,
      }}
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
