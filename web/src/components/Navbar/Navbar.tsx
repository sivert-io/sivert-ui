import type React from "react";
import {
  MdBadge,
  MdSettings,
  MdLogout,
  MdNotifications,
  MdDns,
  MdInventory,
} from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../Button";
import { useAuth } from "../../auth/useAuth";
import { Skeleton } from "../Skeleton";
import { Divider } from "../Divider/Divider";
import { HoverDropdown } from "../Dropdown";
import { Logo } from "../Logo";
import { Link } from "../Link";
import { FaCoins, FaSteam } from "react-icons/fa";
import { useNotifications } from "../../notifications/useNotifications";
import { useLobby } from "../../hooks/useLobby";
import { API_BASE_URL } from "../../lib/api";
import { toast } from "sonner";
import { motion } from "motion/react";
import { springTransition } from "../../lib/transitions";

function useIsMobileNavbar() {
  const [isMobileNavbar, setIsMobileNavbar] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function handleChange() {
      setIsMobileNavbar(mediaQuery.matches);
    }

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobileNavbar;
}

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
      className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm whitespace-nowrap transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="grid size-5 place-items-center">{icon}</span>
      <span>{children}</span>
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

function QueueBadge({
  isSearching,
  elapsedLabel,
  onClick,
}: {
  isSearching: boolean;
  elapsedLabel: string | null;
  onClick: () => void;
}) {
  if (!isSearching) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3.5 py-2 text-sm font-semibold text-secondary transition hover:border-secondary/35 hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      title="Open lobby"
    >
      <span className="tabular-nums text-foreground">
        {elapsedLabel ?? "0:00"}
      </span>
    </button>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const isMobileNavbar = useIsMobileNavbar();

  const { user, isSignedIn, isLoading, signIn, signOut } = useAuth();
  const { notifications, markAsRead, clearNotifications, deleteNotification } =
    useNotifications();
  const { queueState, queueElapsedLabel } = useLobby();

  const isInQueue = !!queueState?.isSearching;
  const dropdownPlacement = isMobileNavbar ? "top-right" : "bottom-right";

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

  async function handleSignOut() {
    navigate("/");
    await signOut();
  }

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-[300] bg-background border-t ${isInQueue ? "border-secondary" : "border-border"} md:border-0 md:bg-transparent grid w-full place-items-center px-3 pt-3 pb-12 md:top-0 md:bottom-auto md:p-3`}
    >
      <motion.div
        className="relative w-full"
        animate={{ maxWidth: isInQueue ? 672 : 576 }}
        transition={springTransition}
      >
        <nav
          className={`flex items-center justify-between rounded-full md:border ${
            isInQueue ? "border-secondary" : "border-primary/20"
          } md:bg-background/70 md:p-1.5 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-background/50`}
        >
          <div className="flex min-w-0 items-center gap-1">
            <Button href="/" variant="ghost" size="sm" className="px-3">
              <Logo solid className="h-4" />
            </Button>

            <QueueBadge
              isSearching={isInQueue}
              elapsedLabel={queueElapsedLabel}
              onClick={() => navigate("/")}
            />
          </div>

          {isLoading ? (
            <div className="flex min-h-10 items-center gap-2 rounded-full px-3 py-1.5">
              <Skeleton circle className="h-6 w-6" />
              <Skeleton className="h-3.5 w-16 rounded-full" />
            </div>
          ) : !isSignedIn ? (
            <Button
              variant="solid"
              size="sm"
              onClick={() => {
                signIn();
              }}
            >
              Sign in <FaSteam />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/shop")}
              >
                <FaCoins /> 0
              </Button>

              <Button
                square
                variant="ghost"
                size="sm"
                aria-label="Open inventory"
                onClick={() => navigate("/inventory")}
              >
                <MdInventory size={18} />
              </Button>

              <HoverDropdown
                placement={dropdownPlacement}
                dropdownClassName="w-[min(18rem,calc(100vw-1rem))]"
                trigger={
                  <Button
                    square
                    className="relative"
                    variant="ghost"
                    size="sm"
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
                            className="rounded-xl border border-transparent px-3 py-3 text-sm text-foreground transition hover:border-primary/50"
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
                                  onClick={() =>
                                    handleAcceptFriendRequest(notification)
                                  }
                                >
                                  Accept
                                </Button>

                                <Button
                                  variant="ghost"
                                  color="danger"
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
                                  color="success"
                                  onClick={() =>
                                    handleAcceptInvite(notification)
                                  }
                                >
                                  Accept
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  color="danger"
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
                placement={dropdownPlacement}
                dropdownClassName="w-[min(14rem,calc(100vw-1rem))]"
                trigger={
                  <Button
                    square
                    variant="ghost"
                    size="sm"
                    aria-label="Open account menu"
                  >
                    {user?.avatarSmall ? (
                      <img
                        src={user.avatarSmall}
                        alt={user.personaName ?? "User avatar"}
                        className="size-6 rounded-full"
                      />
                    ) : null}
                  </Button>
                }
              >
                <DropdownLink
                  to={user?.steamId ? `/profile/${user.steamId}` : "/profile"}
                  icon={<MdBadge size={18} />}
                >
                  My profile
                </DropdownLink>

                <DropdownLink to="/settings" icon={<MdSettings size={18} />}>
                  Settings
                </DropdownLink>

                <Divider className="border-primary/20" />

                {!user?.hostStatus ? (
                  <DropdownLink to="/host" icon={<MdDns size={18} />}>
                    Host a server
                  </DropdownLink>
                ) : (
                  <DropdownLink to="/servers" icon={<MdDns size={18} />}>
                    My servers
                  </DropdownLink>
                )}

                <Divider className="border-primary/20" />

                <button
                  onClick={handleSignOut}
                  className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-danger transition hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <span className="grid size-5 place-items-center">
                    <MdLogout size={18} />
                  </span>
                  <span>Sign out</span>
                </button>
              </HoverDropdown>
            </div>
          )}
        </nav>
      </motion.div>
    </div>
  );
}

export default Navbar;
