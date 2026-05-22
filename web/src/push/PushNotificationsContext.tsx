import { createContext } from "react";

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

export type PushNotificationsContextValue = {
  isSupported: boolean;
  permission: PushPermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  enablePushNotifications: () => Promise<void>;
  disablePushNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
};

export const PushNotificationsContext =
  createContext<PushNotificationsContextValue | null>(null);
