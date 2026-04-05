import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useLobby } from "../../hooks/useLobby";
import { PlayerCard } from "../PlayerCard";
import type { LobbyProps } from "./types";
import { InviteModal } from "./InviteModal";
import { Spinner } from "../Spinner";
import { Button } from "../Button";
import { HoverDropdown } from "../Dropdown/HoverDropdown";

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function DropdownActionButton({
  children,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm transition hover:bg-white/10",
        danger ? "text-red-300" : "text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Lobby({ user }: LobbyProps) {
  const { players } = useLobby(user);
  const navigate = useNavigate();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [queueStartTime, setQueueStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const isInQueue = queueStartTime !== null;
  const elapsedLabel = isInQueue ? formatElapsed(elapsedMs) : null;

  useEffect(() => {
    if (queueStartTime === null) return;

    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - queueStartTime);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [queueStartTime]);

  function handleToggleQueue() {
    if (queueStartTime === null) {
      const startedAt = Date.now();
      setQueueStartTime(startedAt);
      setElapsedMs(0);
      return;
    }

    setQueueStartTime(null);
    setElapsedMs(0);
  }

  function openInviteModal() {
    if (isInQueue) return;
    setShowInviteModal(true);
  }

  function handleViewProfile(steamId: string) {
    navigate(`/profile/${steamId}`);
  }

  function handleKickFromLobby(steamId: string) {
    console.log("Kick from lobby:", steamId);
  }

  function renderPlayerSlot(
    player: (typeof players)[number] | null | undefined,
    scale = 1,
    isOurselves?: boolean,
  ) {
    if (!player) {
      return (
        <PlayerCard
          playerData={null}
          onClick={openInviteModal}
          disableInvite={isInQueue}
          scale={scale}
        />
      );
    }

    if (isInQueue || isOurselves) {
      return (
        <PlayerCard
          playerData={player}
          onClick={() => handleViewProfile(player.steamId)}
          scale={scale}
        />
      );
    }

    return (
      <HoverDropdown
        placement="bottom-center"
        hoverable
        closeDelay={120}
        trigger={() => (
          <PlayerCard
            playerData={player}
            onClick={() => handleViewProfile(player.steamId)}
            scale={scale}
          />
        )}
      >
        <div className="flex flex-col gap-1">
          <DropdownActionButton
            danger
            onClick={() => handleKickFromLobby(player.steamId)}
          >
            Kick from lobby
          </DropdownActionButton>
        </div>
      </HoverDropdown>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative z-20 flex w-full items-center justify-between">
        {renderPlayerSlot(players[3], 0.7)}
        {renderPlayerSlot(players[1], 0.85)}
        {renderPlayerSlot(players[0], 1, true)}
        {renderPlayerSlot(players[2], 0.85)}
        {renderPlayerSlot(players[4], 0.7)}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <AnimatePresence mode="sync" initial={false}>
          {isInQueue && (
            <motion.div
              key="queue-status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4 absolute"
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

        <motion.div
          className="flex flex-col items-center justify-end"
          initial={{ height: 44 }}
          animate={{ height: isInQueue ? 170 : 40 }}
        >
          <Button
            onClick={handleToggleQueue}
            variant={isInQueue ? "outline" : "solid"}
          >
            {isInQueue ? "Stop searching" : "Find match"}
          </Button>
        </motion.div>
      </div>

      <InviteModal open={showInviteModal} setOpen={setShowInviteModal} />
    </div>
  );
}
