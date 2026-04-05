import { createContext } from "react";
import type { Notification } from "./types";

type NotificationsContextValue = {
  notifications: Notification[];
  isConnected: boolean;
  clearNotifications: () => void;
  deleteNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
};

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);
