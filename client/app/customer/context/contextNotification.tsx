"use client";

import { apiClient } from "@/lib/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

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
  fetchNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
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

  const fetchNotifications = async () => {
    try {
      // Fixed duplicate API call here
      const rawData = await apiClient.get("/notifications/");

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
      await apiClient.put("/notifications/read-all", {});
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

  // . WEBSOCKET LOGIC ---
  useEffect(() => {
    fetchNotifications();

    const wsUrl = "ws://localhost:9898/api/v1/biskota/notifications/";
    const maxReconnectAttempts = 5;

    const connectWebSocket = () => {
      console.log("Attempting to connect to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 WebSocket Connected!");
        isRefreshingRef.current = false;
        reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
      };

      ws.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
      };

      ws.onclose = async (event) => {
        console.warn(
          `🔴 WebSocket Closed. Code: ${event.code}, Reason: ${event.reason}`,
        );

        // Normal Closure
        if (event.code === 1000) return;

        // REMOVED: The manual /auth/refresh-token logic that was causing the infinite loop.
        // We now rely entirely on api.ts to handle auth state and cookie refreshing.

        // GENERAL AUTO-RECONNECT FLOW (Fixed 5 seconds, 5 attempts)
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = 5000; // Fixed 5 seconds

          console.log(
            `⏳ Attempting to reconnect in ${timeout / 1000} seconds... (Attempt ${reconnectAttemptsRef.current + 1} of ${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectWebSocket();
          }, timeout);
        } else {
          console.error(
            "🚫 Maximum WebSocket reconnect attempts reached. Giving up.",
          );
          // Notice we DO NOT use window.location.href = "/" here.
          // If the user is truly unauthorized, api.ts will have already safely kicked them out.
        }
      };

      ws.onerror = (error) => {
        console.error("🟡 WebSocket Error:", error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
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
