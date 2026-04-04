import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { findPlayer } from "../../lib/findPlayer";
import type { PublicProfile } from "../../auth/types";
import { PlayerCard } from "../PlayerCard";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function InviteModal({ open, setOpen }: InviteModalProps) {
  const friends = [
    "76561198069153901",
    "76561198196328799",
    "76561198026027740",
    "76561199486434142",
  ];

  const [players, setPlayers] = useState<PublicProfile[]>([]);
  const [invitedPlayerIds, setInvitedPlayerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadPlayers() {
      setIsLoading(true);
      setHasError(false);

      try {
        const results = await Promise.all(
          friends.map(async (steamId) => {
            try {
              return await findPlayer(steamId);
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          setPlayers(
            results.filter(
              (player): player is PublicProfile => player !== null,
            ),
          );
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

  function handleInvite(player: PublicProfile) {
    if (invitedPlayerIds.includes(player.steamId)) {
      return;
    }

    setInvitedPlayerIds((current) => [...current, player.steamId]);
    console.log("Inviting:", player.steamId);
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="space-y-4 text-primary">
        <h2 className="text-xl font-semibold">Invite players</h2>

        {invitedPlayerIds.length > 0 ? (
          <p className="text-sm text-primary/70">
            Invited: {invitedPlayerIds.length}
          </p>
        ) : null}

        {isLoading && (
          <p className="text-sm text-primary/70">Loading players...</p>
        )}

        {hasError && (
          <p className="text-sm text-red-400">Failed to load players.</p>
        )}

        {!isLoading && !hasError && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {players.map((player) => {
              const isInvited = invitedPlayerIds.includes(player.steamId);

              return (
                <div className={isInvited ? "opacity-25" : ""}>
                  <PlayerCard
                    key={player.steamId}
                    playerData={player}
                    onClick={() => handleInvite(player)}
                    disabled={isInvited}
                    statusLabel={isInvited ? "Invited" : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
