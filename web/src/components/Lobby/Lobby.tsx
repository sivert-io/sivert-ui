import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLobby } from "../../hooks/useLobby";
import { PlayerCard } from "../PlayerCard";
import type { LobbyProps } from "./types";
import { InviteModal } from "./InviteModal";
import { Spinner } from "../Spinner";
import { Button } from "../Button";

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Lobby({ user }: LobbyProps) {
  const { players } = useLobby(user);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [queueStartTime, setQueueStartTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const isInQueue = queueStartTime !== null;
  const elapsedLabel =
    queueStartTime !== null ? formatElapsed(now - queueStartTime) : null;

  useEffect(() => {
    if (queueStartTime === null) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [queueStartTime]);

  function handleToggleQueue() {
    if (queueStartTime === null) {
      const startedAt = Date.now();
      setQueueStartTime(startedAt);
      setNow(startedAt);
      return;
    }

    setQueueStartTime(null);
  }

  function openInviteModal() {
    if (isInQueue) return;
    setShowInviteModal(true);
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full">
        <PlayerCard
          playerData={players[3] ?? null}
          onClick={openInviteModal}
          disableInvite={isInQueue}
          scale={0.7}
        />
        <PlayerCard
          playerData={players[1] ?? null}
          onClick={openInviteModal}
          disableInvite={isInQueue}
          scale={0.85}
        />
        <PlayerCard playerData={players[0] ?? null} onClick={openInviteModal} />
        <PlayerCard
          playerData={players[2] ?? null}
          onClick={openInviteModal}
          disableInvite={isInQueue}
          scale={0.85}
        />
        <PlayerCard
          playerData={players[4] ?? null}
          onClick={openInviteModal}
          disableInvite={isInQueue}
          scale={0.7}
        />
      </div>

      <motion.div layout className="flex flex-col items-center gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {isInQueue && (
            <motion.div
              key="queue-status"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              <Spinner size={64} easing="snappy" duration={2} mode="fill" />

              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-bold">Finding players</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {elapsedLabel}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout>
          <Button
            onClick={handleToggleQueue}
            variant={isInQueue ? "outline" : "solid"}
          >
            {isInQueue ? "Stop searching" : "Find match"}
          </Button>
        </motion.div>
      </motion.div>

      <InviteModal open={showInviteModal} setOpen={setShowInviteModal} />
    </div>
  );
}
