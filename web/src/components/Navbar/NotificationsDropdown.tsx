import { MdNotifications } from "react-icons/md";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../Button";
import { Divider } from "../Divider/Divider";
import { HoverDropdown } from "../Dropdown";
import { Link } from "../Link";
import { useNotifications } from "../../notifications/useNotifications";
import { API_BASE_URL } from "../../lib/api";
import type { NavbarDropdownPlacement } from "./types";
import {
  getFriendRequestId,
  getInviteId,
  getLobbyId,
  getNotificationSenderSteamId,
  isExpiredLobbyInvite,
} from "./notificationUtils";

interface NotificationsDropdownProps {
  placement: NavbarDropdownPlacement;
}

export function NotificationsDropdown({
  placement,
}: NotificationsDropdownProps) {
  const navigate = useNavigate();

  const { notifications, markAsRead, clearNotifications, deleteNotification } =
    useNotifications();

  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => !isExpiredLobbyInvite(notification),
      ),
    [notifications],
  );

  const unreadCount = visibleNotifications.filter(
    (item) => !item.readAt,
  ).length;

  async function handleAcceptFriendRequest(notification: {
    id?: string;
    data?: unknown;
  }) {
    const requestId = getFriendRequestId(notification);

    if (!requestId) {
      toast("Friend request id missing");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/friends/requests/${requestId}/accept`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to accept friend request");
      }

      if (notification.id) {
        await deleteNotification(notification.id);
      }

      toast("Friend request accepted");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error
          ? error.message
          : "Failed to accept friend request",
      );
    }
  }

  async function handleDeclineFriendRequest(notification: {
    id?: string;
    data?: unknown;
  }) {
    const requestId = getFriendRequestId(notification);

    if (!requestId) {
      toast("Friend request id missing");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/friends/requests/${requestId}/decline`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to decline friend request");
      }

      if (notification.id) {
        await deleteNotification(notification.id);
      }

      toast("Friend request declined");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error
          ? error.message
          : "Failed to decline friend request",
      );
    }
  }

  async function handleAcceptInvite(notification: {
    id?: string;
    data?: unknown;
    type: string;
  }) {
    if (isExpiredLobbyInvite(notification)) {
      if (notification.id) {
        await deleteNotification(notification.id);
      }

      toast("Invite expired");
      return;
    }

    const lobbyId = getLobbyId(notification);
    const inviteId = getInviteId(notification);

    if (!inviteId) {
      toast("Invite id missing");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/invites/${inviteId}/accept`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to accept invite");
      }

      if (notification.id) {
        await deleteNotification(notification.id);
      }

      window.dispatchEvent(
        new CustomEvent("lobby:changed", {
          detail: { lobbyId: data.lobbyId || lobbyId },
        }),
      );

      navigate("/");
      toast("Invite accepted");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to accept invite");
    }
  }

  async function handleDeclineInvite(notification: {
    id?: string;
    data?: unknown;
    type: string;
  }) {
    if (isExpiredLobbyInvite(notification)) {
      if (notification.id) {
        await deleteNotification(notification.id);
      }

      toast("Invite expired");
      return;
    }

    const inviteId = getInviteId(notification);

    if (!inviteId) {
      toast("Invite id missing");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/invites/${inviteId}/decline`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to decline invite");
      }

      if (notification.id) {
        await deleteNotification(notification.id);
      }

      toast("Invite declined");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Failed to decline invite",
      );
    }
  }

  return (
    <HoverDropdown
      placement={placement}
      dropdownClassName="w-[min(18rem,calc(100vw-1rem))]"
      trigger={
        <Button
          className="relative"
          variant="ghost"
          aria-label="Open notifications"
        >
          <MdNotifications size={20} />

          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[11px] font-bold text-background">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      }
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex min-h-11 items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold text-primary">
            Notifications
          </span>

          {visibleNotifications.length > 0 ? (
            <button
              type="button"
              onClick={clearNotifications}
              className="min-h-9 rounded-full px-3 text-sm text-foreground-muted transition hover:bg-white/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              data-keep-dropdown-open
            >
              Clear
            </button>
          ) : null}
        </div>

        <Divider className="border-primary/20" />

        {visibleNotifications.length === 0 ? (
          <div className="px-3 py-3 text-sm text-foreground-muted">
            No notifications yet
          </div>
        ) : (
          <div className="flex max-h-[min(20rem,calc(100vh-9rem))] flex-col overflow-y-auto">
            {visibleNotifications.map((notification, index) => {
              const isLobbyInvite = notification.type === "lobby_invite";
              const isFriendRequest = notification.type === "friend_request";
              const senderSteamId = getNotificationSenderSteamId(notification);

              return (
                <div
                  key={notification.id ?? `${notification.type}-${index}`}
                  className="rounded-xl border border-transparent px-3 py-3 text-sm text-foreground transition hover:border-primary/50"
                  onMouseEnter={() => {
                    if (notification.id && !notification.readAt) {
                      void markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="font-medium">{notification.title}</div>

                  {notification.body ? (
                    <div className="mt-1 text-foreground-muted">
                      {notification.body}
                    </div>
                  ) : null}

                  {isFriendRequest && senderSteamId ? (
                    <div className="mt-2">
                      <Link
                        to={`/profile/${senderSteamId}`}
                        underline={false}
                        className="inline-flex min-h-9 items-center rounded-full px-3 text-sm text-info transition hover:bg-info/10 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info"
                      >
                        View profile
                      </Link>
                    </div>
                  ) : null}

                  {isFriendRequest ? (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="solid"
                        color="success"
                        size="sm"
                        onClick={() => handleAcceptFriendRequest(notification)}
                      >
                        Accept
                      </Button>

                      <Button
                        variant="ghost"
                        color="danger"
                        size="sm"
                        onClick={() => handleDeclineFriendRequest(notification)}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : null}

                  {isLobbyInvite ? (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="solid"
                        color="success"
                        onClick={() => handleAcceptInvite(notification)}
                      >
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        color="danger"
                        onClick={() => handleDeclineInvite(notification)}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </HoverDropdown>
  );
}
