const SERVICE_WORKER_PATH = "/push-sw.js";

export function supportsPushNotifications() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getPushPermissionState() {
  if (!supportsPushNotifications()) {
    return "unsupported" as const;
  }

  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replaceAll("-", "+")
    .replaceAll("_", "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export async function registerFlowPushServiceWorker() {
  if (!supportsPushNotifications()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  return navigator.serviceWorker.ready;
}

export async function getExistingPushSubscription() {
  if (!supportsPushNotifications()) {
    return null;
  }

  const registration = await registerFlowPushServiceWorker();
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(publicKey: string) {
  if (!supportsPushNotifications()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Push notification permission was not granted.");
  }

  const registration = await registerFlowPushServiceWorker();
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}
