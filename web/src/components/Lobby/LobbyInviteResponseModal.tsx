import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { API_BASE_URL } from "../../lib/api";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { PlayerCard } from "../PlayerCard";
import type { HostBadgeVariant, HostStatus } from "../../auth/types";

type InviteDetailsResponse = {
  invite: {
    id: string;
    lobbyId: string;
    status:
      | "pending"
      | "accepted"
      | "declined"
      | "expired"
      | "revoked"
      | string;
    expiresAt: string;
    inviter: {
      userId: string;
      steamId: string;
      personaName: string | null;
      avatarSmall: string | null;
      avatarMedium: string | null;
      avatarLarge: string | null;
      rank: number | null;
      createdAt: string;
      role: string;
      hostStatus: HostStatus | null;
      hostBadgeVariant: HostBadgeVariant | null;
    };
  };
};

export function LobbyInviteResponseModal() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inviteId = searchParams.get("inviteId");
  const shouldOpen = searchParams.get("inviteAction") === "1" && !!inviteId;

  const [invite, setInvite] = useState<InviteDetailsResponse["invite"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPending = invite?.status === "pending";

  const expiresAtLabel = useMemo(() => {
    if (!invite?.expiresAt) return null;

    const date = new Date(invite.expiresAt);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [invite?.expiresAt]);

  function closeModal() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("inviteId");
    nextParams.delete("inviteAction");
    setSearchParams(nextParams, { replace: true });
  }

  useEffect(() => {
    if (!shouldOpen || !inviteId) {
      setInvite(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadInvite() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/invites/${inviteId}`, {
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | InviteDetailsResponse
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(data?.error ?? "Failed to load invite");
        }

        if (!cancelled) {
          setInvite((data as InviteDetailsResponse).invite);
        }
      } catch (loadError) {
        console.error(loadError);

        if (!cancelled) {
          setInvite(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load invite",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInvite();

    return () => {
      cancelled = true;
    };
  }, [inviteId, shouldOpen]);

  async function acceptInvite() {
    if (!inviteId) return;

    try {
      setIsAccepting(true);

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

      if (data?.lobbyId) {
        window.dispatchEvent(
          new CustomEvent("lobby:changed", {
            detail: { lobbyId: data.lobbyId },
          }),
        );
      }

      toast("Invite accepted");
      navigate("/", { replace: true });
    } catch (acceptError) {
      console.error(acceptError);
      toast(
        acceptError instanceof Error
          ? acceptError.message
          : "Failed to accept invite",
      );
    } finally {
      setIsAccepting(false);
    }
  }

  async function declineInvite() {
    if (!inviteId) return;

    try {
      setIsDeclining(true);

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

      toast("Invite declined");
      closeModal();
    } catch (declineError) {
      console.error(declineError);
      toast(
        declineError instanceof Error
          ? declineError.message
          : "Failed to decline invite",
      );
    } finally {
      setIsDeclining(false);
    }
  }

  return (
    <Modal open={shouldOpen} setOpen={(open) => !open && closeModal()}>
      <div className="flex flex-col gap-4 text-primary">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Lobby invite</h2>
          <p className="text-sm text-primary/70">
            You opened this invite from a notification.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-primary/70">Loading invite...</p>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {invite ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <PlayerCard
                playerData={{
                  steamId: invite.inviter.steamId,
                  personaName: invite.inviter.personaName,
                  avatarSmall: invite.inviter.avatarSmall,
                  avatarMedium: invite.inviter.avatarMedium,
                  avatarLarge: invite.inviter.avatarLarge,
                  rank: invite.inviter.rank,
                  createdAt: invite.inviter.createdAt,
                  hostStatus: invite.inviter.hostStatus,
                  hostBadgeVariant: invite.inviter.hostBadgeVariant,
                }}
                width={160}
                height={200}
              />
            </div>

            <div className="text-center">
              <p className="font-bold">
                {invite.inviter.personaName ?? "A player"} invited you to join
                their lobby.
              </p>

              {expiresAtLabel ? (
                <p className="text-sm text-primary/60">
                  Expires at {expiresAtLabel}
                </p>
              ) : null}

              {!isPending ? (
                <p className="mt-2 text-sm text-warning">
                  This invite is {invite.status}.
                </p>
              ) : null}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                color="primary"
                onClick={acceptInvite}
                disabled={!isPending || isAccepting || isDeclining}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>

              <Button
                color="danger"
                variant="outline"
                onClick={declineInvite}
                disabled={!isPending || isAccepting || isDeclining}
              >
                {isDeclining ? "Declining..." : "Decline"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
