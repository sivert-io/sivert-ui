import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import {
  getExistingPushSubscription,
  getPushPermissionState,
  subscribeToPush,
  supportsPushNotifications,
} from "./browser";
import { PushNotificationsContext } from "./PushNotificationsContext";
import type { PushPermissionState } from "./PushNotificationsContext";

type VapidPublicKeyResponse = {
  publicKey?: string;
};

export function PushNotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isSignedIn, isLoading: isAuthLoading } = useAuth();
  const [permission, setPermission] = useState<PushPermissionState>(
    getPushPermissionState(),
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = supportsPushNotifications();

  const refreshState = useCallback(async () => {
    setPermission(getPushPermissionState());

    if (!isSupported || !isSignedIn) {
      setIsSubscribed(false);
      return;
    }

    const subscription = await getExistingPushSubscription();
    setIsSubscribed(Boolean(subscription));
  }, [isSignedIn, isSupported]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshState().catch(console.error);
  }, [isAuthLoading, refreshState]);

  async function loadVapidPublicKey() {
    const response = await fetch(`${API_BASE_URL}/push/vapid-public-key`, {
      credentials: "include",
    });

    const data = (await response
      .json()
      .catch(() => null)) as VapidPublicKeyResponse | null;

    if (!response.ok || !data?.publicKey) {
      throw new Error("Failed to load push notification public key.");
    }

    return data.publicKey;
  }

  async function saveSubscription(subscription: PushSubscription) {
    const response = await fetch(`${API_BASE_URL}/push/subscriptions`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to save push subscription.");
    }
  }

  async function deleteSubscription(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}/push/subscriptions`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
      }),
    });

    if (!response.ok && response.status !== 404) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error ?? "Failed to delete push subscription.");
    }
  }

  const enablePushNotifications = useCallback(async () => {
    if (!isSignedIn) {
      setError("Sign in before enabling push notifications.");
      return;
    }

    if (!isSupported) {
      setError("Push notifications are not supported in this browser.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const publicKey = await loadVapidPublicKey();
      const subscription = await subscribeToPush(publicKey);

      await saveSubscription(subscription);

      setPermission(getPushPermissionState());
      setIsSubscribed(true);
    } catch (enableError) {
      const message =
        enableError instanceof Error
          ? enableError.message
          : "Failed to enable push notifications.";

      console.error(enableError);
      setError(message);
      setPermission(getPushPermissionState());
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, isSupported]);

  const disablePushNotifications = useCallback(async () => {
    if (!isSupported) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const subscription = await getExistingPushSubscription();

      if (subscription) {
        await deleteSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setPermission(getPushPermissionState());
    } catch (disableError) {
      const message =
        disableError instanceof Error
          ? disableError.message
          : "Failed to disable push notifications.";

      console.error(disableError);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const sendTestNotification = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/push/test`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to send test notification.");
    }
  }, []);

  const value = useMemo(
    () => ({
      isSupported,
      permission,
      isSubscribed,
      isLoading,
      error,
      enablePushNotifications,
      disablePushNotifications,
      sendTestNotification,
    }),
    [
      isSupported,
      permission,
      isSubscribed,
      isLoading,
      error,
      enablePushNotifications,
      disablePushNotifications,
      sendTestNotification,
    ],
  );

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}
