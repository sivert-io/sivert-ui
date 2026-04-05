import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useMatchFound } from "../matchmaking/useMatchFound";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MatchFoundModal() {
  const { user } = useAuth();
  const { matchFound, acceptMatch, declineMatch } = useMatchFound();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!matchFound) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [matchFound]);

  const remainingLabel = useMemo(() => {
    if (!matchFound) return "0:00";
    return formatRemaining(new Date(matchFound.acceptBy).getTime() - now);
  }, [matchFound, now]);

  const currentUserAccepted = useMemo(() => {
    if (!matchFound || !user) return false;
    return matchFound.players.some(
      (player) => player.userId === user.id && player.accepted,
    );
  }, [matchFound, user]);

  return (
    <Modal open={!!matchFound} setOpen={() => {}}>
      <div className="space-y-6 text-primary">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-semibold">Match found</h2>
          <p className="text-sm text-primary/70">
            All players must accept to start the match
          </p>
          <p className="text-lg font-bold tabular-nums">{remainingLabel}</p>
        </div>

        <div className="space-y-2">
          {matchFound?.players.map((player) => (
            <div
              key={player.userId}
              className="flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-4 py-3"
            >
              <span className="truncate font-medium">
                {player.personaName ?? player.steamId}
              </span>
              <span
                className={
                  player.accepted
                    ? "text-sm font-bold text-green-400"
                    : "text-sm font-bold text-primary/60"
                }
              >
                {player.accepted ? "Accepted" : "Waiting"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={declineMatch}
            disabled={!matchFound}
          >
            Decline
          </Button>
          <Button
            onClick={acceptMatch}
            disabled={!matchFound || currentUserAccepted}
          >
            {currentUserAccepted ? "Accepted" : "Accept"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
