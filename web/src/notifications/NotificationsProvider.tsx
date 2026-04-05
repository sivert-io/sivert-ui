import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useSocket } from "../socket/useSocket";
import { useAuth } from "../auth/useAuth";
import { API_BASE_URL } from "../lib/api";
import { NotificationsContext } from "./NotificationsContext";
import type { Notification } from "./types";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected } = useSocket();
  const { isSignedIn, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!isSignedIn) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = await response.json();

        if (!cancelled) {
          setNotifications(data.notifications ?? []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isLoading]);

  useEffect(() => {
    function onNotification(payload: Notification) {
      setNotifications((prev) => {
        const exists = prev.some((item) => item.id && item.id === payload.id);
        if (exists) return prev;
        return [payload, ...prev];
      });

      toast(payload.title, {
        description: payload.body,
      });
    }

    socket.on("notification:new", onNotification);

    return () => {
      socket.off("notification:new", onNotification);
    };
  }, [socket]);

  async function deleteNotification(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to delete notification");
      }

      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                readAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function clearNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }

      setNotifications([]);
    } catch (error) {
      console.error(error);
    }
  }

  const value = useMemo(
    () => ({
      notifications,
      isConnected,
      clearNotifications,
      deleteNotification,
      markAsRead,
    }),
    [notifications, isConnected],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
