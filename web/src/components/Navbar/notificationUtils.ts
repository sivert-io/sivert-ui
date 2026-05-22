export function getNotificationSenderSteamId(notification: { data?: unknown }) {
  if (!notification.data || typeof notification.data !== "object") {
    return null;
  }

  if ("fromSteamId" in notification.data) {
    return String(
      (notification.data as { fromSteamId?: string }).fromSteamId ?? "",
    );
  }

  return null;
}

export function getInviteId(notification: { data?: unknown }) {
  if (!notification.data || typeof notification.data !== "object") {
    return "";
  }

  if ("inviteId" in notification.data) {
    return String((notification.data as { inviteId?: string }).inviteId ?? "");
  }

  return "";
}

export function getLobbyId(notification: { data?: unknown }) {
  if (!notification.data || typeof notification.data !== "object") {
    return "";
  }

  if ("lobbyId" in notification.data) {
    return String((notification.data as { lobbyId?: string }).lobbyId ?? "");
  }

  return "";
}

export function getFriendRequestId(notification: { data?: unknown }) {
  if (!notification.data || typeof notification.data !== "object") {
    return "";
  }

  if ("requestId" in notification.data) {
    return String(
      (notification.data as { requestId?: string }).requestId ?? "",
    );
  }

  return "";
}

export function isExpiredLobbyInvite(notification: {
  type: string;
  data?: unknown;
}) {
  if (notification.type !== "lobby_invite") {
    return false;
  }

  if (!notification.data || typeof notification.data !== "object") {
    return false;
  }

  if (!("expiresAt" in notification.data)) {
    return false;
  }

  const expiresAt = (notification.data as { expiresAt?: string }).expiresAt;
  if (!expiresAt) {
    return false;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return false;
  }

  return expiresAtMs <= Date.now();
}
