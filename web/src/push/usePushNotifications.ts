import { useContext } from "react";
import { PushNotificationsContext } from "./PushNotificationsContext";

export function usePushNotifications() {
  const context = useContext(PushNotificationsContext);

  if (!context) {
    throw new Error(
      "usePushNotifications must be used within PushNotificationsProvider",
    );
  }

  return context;
}
