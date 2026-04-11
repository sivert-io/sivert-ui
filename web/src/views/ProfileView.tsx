import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";
import { MdPersonAdd, MdSettings } from "react-icons/md";
import { useAuth } from "../auth/useAuth";
import { useNotifications } from "../notifications/useNotifications";
import { Card } from "../components/Card";
import type { PublicProfile } from "../auth/types";
import { Skeleton } from "../components/Skeleton";
import { Rank, RankProgressBar } from "../components/Rank";
import { findPlayer } from "../lib/findPlayer";
import { Button } from "../components/Button";
import { HoverDropdown } from "../components/Dropdown";
import { API_BASE_URL } from "../lib/api";
import { toast } from "sonner";
import { useSocket } from "../socket/useSocket";
import { FaSteam } from "react-icons/fa";
import { HostBadge } from "../components/HostBadge";

type FriendRequestState =
  | "idle"
  | "pending_outgoing"
  | "pending_incoming"
  | "friends";

function formatOrdinalDay(day: number) {
  if (day >= 11 && day <= 13) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatJoinedDate(dateString: string) {
  const date = new Date(dateString);

  const day = formatOrdinalDay(date.getDate());
  const monthYear = date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return `${day} of ${monthYear}`;
}

function DropdownActionButton({
  children,
  onClick,
  danger = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ${
        danger ? "text-danger" : "text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function ProfileView() {
  const { user, isSignedIn, isLoading } = useAuth();
  const { notifications } = useNotifications();
  const { steamId } = useParams();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);
  const [isInvitingToLobby, setIsInvitingToLobby] = useState(false);
  const [isRemovingFriend, setIsRemovingFriend] = useState(false);
  const [friendRequestState, setFriendRequestState] =
    useState<FriendRequestState>("idle");

  const isOwnProfile = user?.steamId === profile?.steamId;
  const shouldShowHostBadge =
    profile?.hostStatus === "verified" && !!profile.hostBadgeVariant;

  const hasIncomingFriendRequestFromViewedProfile = useMemo(() => {
    if (!profile?.steamId) return false;

    return notifications.some((notification) => {
      if (notification.type !== "friend_request") return false;
      if (!notification.data || typeof notification.data !== "object") {
        return false;
      }

      const fromSteamId =
        "fromSteamId" in notification.data
          ? String(
              (notification.data as { fromSteamId?: string }).fromSteamId ?? "",
            )
          : "";

      return fromSteamId === profile.steamId;
    });
  }, [notifications, profile?.steamId]);

  useEffect(() => {
    function onFriendRemoved(payload: { steamId?: string }) {
      if (!payload.steamId || !profile?.steamId) return;

      if (payload.steamId === profile.steamId) {
        setFriendRequestState("idle");
        toast("Friend removed");
      }
    }

    socket.on("friend:removed", onFriendRemoved);

    return () => {
      socket.off("friend:removed", onFriendRemoved);
    };
  }, [socket, profile?.steamId]);

  useEffect(() => {
    if (!steamId) return;

    const currentSteamId = steamId;
    let cancelled = false;

    async function loadProfile() {
      setIsProfileLoading(true);
      setNotFound(false);
      setHasError(false);

      try {
        const foundProfile = await findPlayer(currentSteamId);

        if (!cancelled) {
          if (!foundProfile) {
            setProfile(null);
            setNotFound(true);
            setFriendRequestState("idle");
            return;
          }

          setProfile(foundProfile);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setHasError(true);
          setFriendRequestState("idle");
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [steamId]);

  useEffect(() => {
    if (!profile) {
      setFriendRequestState("idle");
      return;
    }

    if (!isSignedIn || isOwnProfile) {
      setFriendRequestState("idle");
      return;
    }

    let cancelled = false;

    async function loadFriendStatus() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/friends/status/${profile?.steamId}`,
          {
            credentials: "include",
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error ?? "Failed to load friend status");
        }

        if (!cancelled) {
          if (data.status === "pending_outgoing") {
            setFriendRequestState("pending_outgoing");
          } else if (data.status === "pending_incoming") {
            setFriendRequestState("pending_incoming");
          } else if (data.status === "friends") {
            setFriendRequestState("friends");
          } else {
            setFriendRequestState("idle");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadFriendStatus();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, profile, isOwnProfile, notifications]);

  useEffect(() => {
    if (!profile || !isSignedIn || isOwnProfile) return;

    if (hasIncomingFriendRequestFromViewedProfile) {
      setFriendRequestState((current) =>
        current === "friends" ? current : "pending_incoming",
      );
    }
  }, [
    hasIncomingFriendRequestFromViewedProfile,
    isOwnProfile,
    isSignedIn,
    profile,
  ]);

  async function handleAddFriend() {
    if (!profile) return;

    try {
      setIsSendingFriendRequest(true);

      const response = await fetch(`${API_BASE_URL}/friends/requests`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: profile.steamId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to send friend request");
      }

      setFriendRequestState("pending_outgoing");
      toast("Friend request sent");
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error
          ? error.message
          : "Failed to send friend request",
      );
    } finally {
      setIsSendingFriendRequest(false);
    }
  }

  async function handleInviteToLobby() {
    if (!profile) return;

    try {
      setIsInvitingToLobby(true);

      const response = await fetch(`${API_BASE_URL}/invites`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: profile.steamId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to send invite");
      }

      toast("Invite sent");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to send invite");
    } finally {
      setIsInvitingToLobby(false);
    }
  }

  async function handleRemoveFriend() {
    if (!profile) return;

    try {
      setIsRemovingFriend(true);

      const response = await fetch(
        `${API_BASE_URL}/friends/${profile.steamId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to remove friend");
      }

      setFriendRequestState("idle");
      toast("Friend removed");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to remove friend");
    } finally {
      setIsRemovingFriend(false);
    }
  }

  if (!steamId) {
    if (isLoading) {
      return (
        <Card>
          <div className="flex items-center gap-4">
            <Skeleton circle className="h-20 w-20" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </Card>
      );
    }

    if (!isSignedIn || !user?.steamId) {
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={`/profile/${user.steamId}`} replace />;
  }

  if (isProfileLoading) {
    return (
      <Card>
        <div className="flex items-center gap-4">
          <Skeleton circle className="h-20 w-20" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </Card>
    );
  }

  if (notFound) {
    return (
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Player not found</h1>
        <p className="text-foreground-muted">
          No player exists with Steam ID{" "}
          <span className="font-mono">{steamId}</span>.
        </p>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
        <p className="text-foreground-muted">
          We could not load this profile right now.
        </p>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="relative">
        <div className="flex w-full items-center gap-4">
          {profile.avatarLarge ? (
            <img
              src={profile.avatarLarge}
              alt={profile.personaName ?? "Player avatar"}
              className="h-20 w-20 rounded-full bg-black/20"
            />
          ) : (
            <div className="h-20 w-20 rounded-full border border-border bg-surface" />
          )}

          <div className="flex w-full flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">
                {profile.personaName ?? "Unnamed player"}
              </h1>
              <Rank rank={profile.rank} />
              {shouldShowHostBadge ? (
                <HostBadge
                  variant={profile.hostBadgeVariant ?? "verified"}
                  size="sm"
                />
              ) : null}
            </div>

            <p className="text-xs font-medium text-foreground-muted">
              Joined FLOW {formatJoinedDate(profile.createdAt)}
            </p>

            <RankProgressBar rank={profile.rank} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              color="secondary"
              target="_blank"
              size="sm"
              square
              href={`https://steamcommunity.com/profiles/${profile.steamId}`}
            >
              <FaSteam />
            </Button>

            {isSignedIn && !isOwnProfile ? (
              <div>
                {friendRequestState === "friends" ? (
                  <HoverDropdown
                    placement="bottom-right"
                    trigger={({ toggle }) => (
                      <Button
                        size="sm"
                        variant="ghost"
                        color="secondary"
                        square
                        onClick={toggle}
                        className="h-8! w-8! p-0!"
                      >
                        <MdSettings size={16} />
                      </Button>
                    )}
                  >
                    <div className="flex min-w-44 flex-col gap-1">
                      <DropdownActionButton
                        onClick={handleInviteToLobby}
                        disabled={isInvitingToLobby}
                      >
                        {isInvitingToLobby ? "Inviting..." : "Invite to lobby"}
                      </DropdownActionButton>

                      <DropdownActionButton
                        danger
                        onClick={handleRemoveFriend}
                        disabled={isRemovingFriend}
                      >
                        {isRemovingFriend ? "Removing..." : "Remove friend"}
                      </DropdownActionButton>
                    </div>
                  </HoverDropdown>
                ) : (
                  <Button
                    size="sm"
                    color={
                      friendRequestState === "pending_outgoing" ||
                      friendRequestState === "pending_incoming"
                        ? "warning"
                        : "primary"
                    }
                    onClick={handleAddFriend}
                    disabled={
                      isSendingFriendRequest ||
                      friendRequestState === "pending_outgoing" ||
                      friendRequestState === "pending_incoming"
                    }
                  >
                    <MdPersonAdd />
                    {isSendingFriendRequest
                      ? "Sending..."
                      : friendRequestState === "pending_outgoing"
                        ? "Request sent"
                        : friendRequestState === "pending_incoming"
                          ? "Sent you a request"
                          : "Add friend"}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <h1 className="text-lg font-bold">Match History</h1>
      </Card>
    </div>
  );
}
