"use client";

import { apiClient } from "@/lib/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

// Matches your FastAPI SQLModel schema
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

  const unreadCount = notifications.filter((n) => !n.is_user_read).length;

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications/");
      // 1. Get the raw data from FastAPI
      const rawData = await apiClient.get("/notifications/");

      // 2. LOG IT SO WE CAN SEE IT! (This will definitely print in the browser)
      console.log("🚨 RAW API RESPONSE:", rawData);

      // 3. Safely set the data based on what FastAPI actually sent
      if (Array.isArray(rawData)) {
        // If FastAPI sent a direct list: [ {id: 1}, {id: 2} ]
        setNotifications(rawData);
      } else if (rawData && Array.isArray(rawData.data)) {
        // If FastAPI sent: { data: [ {id: 1}, {id: 2} ] }
        setNotifications(rawData.data);
      } else if (rawData && Array.isArray(rawData.items)) {
        // If FastAPI sent: { items: [ {id: 1}, {id: 2} ] }
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
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_user_read: true })));
    try {
      // Call your backend to update is_user_read to True for all user's notifications
      await apiClient.put("/notifications/read-all", {});
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      // Call your backend to set is_clear = True
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const clearHistory = async () => {
    // Optimistic UI update
    setNotifications([]);
    try {
      // Call backend to set is_clear = True for ALL user notifications
      await apiClient.delete("/v1/notifications/clear-all");
    } catch (error) {
      console.error("Failed to clear notification history:", error);
    }
  };

  // . WEBSOCKET LOGIC ---
  useEffect(() => {
    // Fetch historical notifications on mount
    fetchNotifications();

    // FIXED BUG 1: Properly check if the env variable exists first
    // FIXED BUG 2: Added the trailing slash to exactly match FastAPI's router
    // const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    //   ? `${process.env.NEXT_PUBLIC_WS_URL}/notifications/`
    //   : "ws://localhost:8000/api/v1/biskota/notifications/";
    console.log("Notif", notifications);

    const wsUrl = "ws://localhost:9898/api/v1/biskota/notifications/";

    const connectWebSocket = () => {
      console.log("Attempting to connect to:", wsUrl); // Debug log to verify URL
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 WebSocket Connected!");
        isRefreshingRef.current = false;
      };

      ws.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
      };

      ws.onclose = async (event) => {
        console.warn(
          `🔴 WebSocket Closed. Code: ${event.code}, Reason: ${event.reason}`,
        );

        if (event.code === 1008) {
          if (isRefreshingRef.current) return;
          isRefreshingRef.current = true;
          try {
            await apiClient.post("/auth/refresh-token", {});
            setTimeout(() => connectWebSocket(), 1000);
          } catch (error) {
            console.error("Websocket refresh failed.");
          }
        }
      };

      ws.onerror = (error) => {
        console.error("🟡 WebSocket Error:", error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close(1000);
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
