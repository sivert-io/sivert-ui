import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import type { PublicProfile } from "../../auth/types";
import { PlayerCard } from "../PlayerCard";
import { API_BASE_URL } from "../../lib/api";
import { toast } from "sonner";
import { useSocket } from "../../socket/useSocket";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type FriendInviteStatus =
  | "available"
  | "invited"
  | "in_lobby"
  | "offline"
  | "in_match";

type InviteableFriend = {
  profile: PublicProfile;
  status: FriendInviteStatus;
};

export function InviteModal({ open, setOpen }: InviteModalProps) {
  const { socket } = useSocket();
  const [players, setPlayers] = useState<InviteableFriend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadPlayers() {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(`${API_BASE_URL}/lobbies/current/friends`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load friends");
        }

        const data = await response.json();

        if (!cancelled) {
          setPlayers(data.players ?? []);
        }
      } catch {
        if (!cancelled) {
          setPlayers([]);
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPlayers();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    function onInviteDeclined(payload: { steamId?: string }) {
      if (!payload.steamId) return;

      setPlayers((current) =>
        current.map((item) =>
          item.profile.steamId === payload.steamId
            ? { ...item, status: "available" }
            : item,
        ),
      );
    }

    function onFriendRemoved(payload: { steamId?: string }) {
      if (!payload.steamId) return;

      setPlayers((current) =>
        current.filter((item) => item.profile.steamId !== payload.steamId),
      );
    }

    socket.on("lobby_invite:declined", onInviteDeclined);
    socket.on("friend:removed", onFriendRemoved);

    return () => {
      socket.off("lobby_invite:declined", onInviteDeclined);
      socket.off("friend:removed", onFriendRemoved);
    };
  }, [socket]);

  function handleInvite(player: InviteableFriend) {
    if (player.status !== "available") {
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/invites`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            steamId: player.profile.steamId,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error ?? "Failed to send invite");
        }

        setPlayers((current) =>
          current.map((item) =>
            item.profile.steamId === player.profile.steamId
              ? { ...item, status: "invited" }
              : item,
          ),
        );

        toast("Invite sent");
      } catch (error) {
        console.error(error);
        toast(error instanceof Error ? error.message : "Failed to send invite");
      }
    })();
  }

  function toStatusLabel(status: FriendInviteStatus): string | undefined {
    switch (status) {
      case "invited":
        return "invited";
      case "in_lobby":
        return "in lobby";
      case "offline":
        return "offline";
      case "in_match":
        return "in match";
      default:
        return undefined;
    }
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="space-y-4 text-primary">
        <h2 className="text-xl font-semibold">Invite your friends</h2>

        {isLoading && (
          <p className="text-sm text-primary/70">Loading players...</p>
        )}

        {hasError && (
          <p className="text-sm text-red-400">Failed to load friends.</p>
        )}

        {!isLoading && !hasError && players.length === 0 && (
          <p className="text-sm text-primary/70">No friends found.</p>
        )}

        {!isLoading && !hasError && players.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {players.map((player) => {
              const isDisabled = player.status !== "available";

              return (
                <PlayerCard
                  key={player.profile.steamId}
                  playerData={player.profile}
                  onClick={() => handleInvite(player)}
                  disabled={isDisabled}
                  statusLabel={toStatusLabel(player.status)}
                />
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}