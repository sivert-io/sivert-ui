import { MdBadge, MdSettings, MdLogout, MdNotifications } from "react-icons/md";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "../Button";
import type { NavbarProps } from "./types";
import { useAuth } from "../../auth/useAuth";
import { Skeleton } from "../Skeleton";
import { Divider } from "../Divider/Divider";
import { HoverDropdown } from "../Dropdown";
import { Logo } from "../Logo";
import { Link } from "../Link";
import { FaSteam } from "react-icons/fa";
import { useNotifications } from "../../notifications/useNotifications";
import { API_BASE_URL } from "../../lib/api";
import { toast } from "sonner";

function DropdownLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      underline={false}
      to={to}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-primary transition hover:bg-white/10 whitespace-nowrap"
    >
      {icon}
      {children}
    </Link>
  );
}

function getNotificationSenderSteamId(notification: { data?: unknown }) {
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

function getInviteId(notification: { data?: unknown }) {
  if (!notification.data || typeof notification.data !== "object") {
    return "";
  }

  if ("inviteId" in notification.data) {
    return String((notification.data as { inviteId?: string }).inviteId ?? "");
  }

  return "";
}

function getLobbyId(notification: { data?: unknown }) {
  if (!notification.data || typeof notification.data !== "object") {
    return "";
  }

  if ("lobbyId" in notification.data) {
    return String((notification.data as { lobbyId?: string }).lobbyId ?? "");
  }

  return "";
}

function isExpiredLobbyInvite(notification: { type: string; data?: unknown }) {
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

export function Navbar({ isInQueue }: NavbarProps) {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoading, signIn, signOut } = useAuth();
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
    const requestId =
      typeof notification.data === "object" &&
      notification.data !== null &&
      "requestId" in notification.data
        ? String((notification.data as { requestId?: string }).requestId ?? "")
        : "";

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
    const requestId =
      typeof notification.data === "object" &&
      notification.data !== null &&
      "requestId" in notification.data
        ? String((notification.data as { requestId?: string }).requestId ?? "")
        : "";

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

  async function handleSignOut() {
    navigate("/");
    await signOut();
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
    <div className="fixed left-0 top-0 right-0 z-300 grid w-full place-items-center p-3">
      <div
        className={`relative w-full transition-all duration-100 ${
          isInQueue ? "max-w-lg" : "max-w-xl"
        }`}
      >
        <nav className="flex justify-between rounded-full border border-primary/20 bg-black/10 p-1.5 backdrop-blur-sm">
          <Button href="/" variant="ghost" size="sm" className="px-3">
            <Logo solid className="h-3.5" />
          </Button>

          {isLoading ? (
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5">
              <Skeleton circle className="h-5 w-5" />
              <Skeleton className="h-3.5 w-16 rounded-full" />
            </div>
          ) : !isSignedIn ? (
            <Button variant="solid" size="sm" onClick={signIn}>
              Sign in <FaSteam />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <HoverDropdown
                placement="bottom-center"
                trigger={({ isOpen, toggle }) => (
                  <Button
                    className="relative h-8! w-8! p-0!"
                    onClick={toggle}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    variant="ghost"
                    size="sm"
                  >
                    <MdNotifications size={18} />
                    {unreadCount > 0 && !isOpen ? (
                      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-black">
                        {unreadCount}
                      </span>
                    ) : null}
                  </Button>
                )}
              >
                <div className="flex min-w-72 flex-col">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-semibold text-primary">
                      Notifications
                    </span>

                    {visibleNotifications.length > 0 ? (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="text-xs text-primary/70 transition hover:text-primary"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <Divider className="border-primary/20" />

                  {visibleNotifications.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-primary/70">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="flex max-h-80 flex-col overflow-y-auto">
                      {visibleNotifications.map((notification, index) => {
                        const isLobbyInvite =
                          notification.type === "lobby_invite";
                        const isFriendRequest =
                          notification.type === "friend_request";
                        const senderSteamId =
                          getNotificationSenderSteamId(notification);

                        return (
                          <div
                            key={
                              notification.id ?? `${notification.type}-${index}`
                            }
                            className="rounded-xl px-3 py-3 text-sm text-primary transition hover:bg-white/10"
                            onMouseEnter={() => {
                              if (notification.id && !notification.readAt) {
                                void markAsRead(notification.id);
                              }
                            }}
                          >
                            <div className="font-medium">
                              {notification.title}
                            </div>

                            {notification.body ? (
                              <div className="mt-1 text-primary/70">
                                {notification.body}
                              </div>
                            ) : null}

                            {isFriendRequest && senderSteamId ? (
                              <div className="mt-2">
                                <Link
                                  to={`/profile/${senderSteamId}`}
                                  underline={false}
                                  className="text-xs text-secondary transition hover:opacity-80"
                                >
                                  View profile
                                </Link>
                              </div>
                            ) : null}

                            {isFriendRequest ? (
                              <div className="mt-3 flex gap-2">
                                <Button
                                  variant="solid"
                                  size="sm"
                                  onClick={() =>
                                    handleAcceptFriendRequest(notification)
                                  }
                                >
                                  Accept
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeclineFriendRequest(notification)
                                  }
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
                                  onClick={() =>
                                    handleAcceptInvite(notification)
                                  }
                                >
                                  Accept
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleDeclineInvite(notification)
                                  }
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

              <HoverDropdown
                placement="bottom-right"
                trigger={({ isOpen, toggle }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                  >
                    <>
                      {user?.avatarSmall ? (
                        <img
                          src={user.avatarSmall}
                          alt={user.personaName ?? "User avatar"}
                          className="h-5 w-5 rounded-full"
                        />
                      ) : null}
                      <span
                        className={`max-w-28 truncate text-xs ${
                          user?.role === "admin" ? "text-secondary" : ""
                        }`}
                      >
                        {user?.personaName ?? "Account"}
                      </span>
                    </>
                  </Button>
                )}
              >
                <DropdownLink
                  to={user?.steamId ? `/profile/${user.steamId}` : "/profile"}
                  icon={<MdBadge size={16} />}
                >
                  My profile
                </DropdownLink>

                <DropdownLink to="/settings" icon={<MdSettings size={16} />}>
                  Settings
                </DropdownLink>

                <Divider className="border-primary/20" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-300 transition hover:bg-white/10"
                >
                  <span>
                    <MdLogout size={16} />
                  </span>
                  <span>Sign out</span>
                </button>
              </HoverDropdown>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
