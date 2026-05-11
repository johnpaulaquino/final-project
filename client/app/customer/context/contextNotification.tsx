"use client";

import { apiClient } from "@/lib/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

interface PaginationMeta {
  has_next: boolean;
  total_records: number;
  start_page: number;
  end_page: number;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  notification_type: string;
  is_user_read: boolean;
  is_admin_read: boolean;
  is_clear: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  fetchNotifications: (skip: number, limit: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  pagination: PaginationMeta;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const isRefreshingRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptsRef = useRef(0);
  const unreadCount = notifications.filter((n) => !n.is_user_read).length;
  const [pagination, setPagination] = useState<PaginationMeta>({
    has_next: false,
    total_records: 0,
    start_page: 1,
    end_page: 1,
  });

  const fetchNotifications = async (skip: number, limit: number) => {
    try {
      // Fixed duplicate API call here
      const rawData = await apiClient.get(
        `/notifications/?skip=${skip}&limit=${limit}`,
      );
      setPagination(rawData.paginated);
      console.log("🚨 RAW API RESPONSE:", rawData);

      if (Array.isArray(rawData)) {
        setNotifications(rawData);
      } else if (rawData && Array.isArray(rawData.data)) {
        setNotifications(rawData.data);
      } else if (rawData && Array.isArray(rawData.items)) {
        setNotifications(rawData.items);
      } else {
        console.warn("❌ Could not find array in response. Setting to empty.");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_user_read: true })));
    try {
      await apiClient.patch("/notifications/read-all", {});
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const clearHistory = async () => {
    setNotifications([]);
    try {
      await apiClient.delete("/v1/notifications/clear-all");
    } catch (error) {
      console.error("Failed to clear notification history:", error);
    }
  };

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout | null = null;

    let reconnectAttempts = 0;

    const MAX_RECONNECTS = 5;

    const connect = () => {
      const baseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL;

      const ws = new WebSocket(`${baseUrl}/notifications/`);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");

        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);

        setNotifications((prev) => [notification, ...prev]);
      };

      ws.onclose = async (event) => {
        console.warn("WebSocket closed", event.code);

        // Unauthorized
        if (event.code === 4401) {
          console.warn("Unauthorized websocket");

          await apiClient.logout();

          return;
        }

        // Normal close
        if (event.code === 1000) {
          return;
        }

        if (reconnectAttempts >= MAX_RECONNECTS) {
          console.error("Max reconnect reached");

          return;
        }

        reconnectAttempts += 1;

        reconnectTimeout = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error", error);
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      wsRef.current?.close(1000);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAllAsRead,
        deleteNotification,
        clearHistory,
        pagination,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
