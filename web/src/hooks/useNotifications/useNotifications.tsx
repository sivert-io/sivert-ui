import { useState } from "react";
import type { notification, useNotificationsProps } from "./types";

export function useNotifications({}: useNotificationsProps) {
  const [notifications, setNotifications] = useState<notification[]>([]);

  return { notifications, setNotifications };
}
