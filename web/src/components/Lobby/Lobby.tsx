import cn from "classnames";
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
import { API_BASE_URL } from "../../lib/api";
import { toast } from "sonner";
import { MdClose } from "react-icons/md";

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
      className={cn(
        "flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 text-nowrap",
        danger ? "text-red-300" : "text-primary",
      )}
    >
      {children}
    </button>
  );
}

type CurrentLobbyResponse = {
  lobby: {
    lobbyId: string;
    members: Array<{
      userId: string;
      steamId: string;
      personaName: string | null;
      avatarSmall: string | null;
      avatarMedium: string | null;
      avatarLarge: string | null;
      rank: number | null;
      role: string;
      ready: boolean;
    }>;
  };
};

export function Lobby({ user }: LobbyProps) {
  const navigate = useNavigate();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [queueStartTime, setQueueStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [isLobbyLoading, setIsLobbyLoading] = useState(true);

  useEffect(() => {
    function onLobbyChanged(event: Event) {
      const customEvent = event as CustomEvent<{ lobbyId?: string }>;
      const nextLobbyId = customEvent.detail?.lobbyId;

      if (!nextLobbyId) return;

      setLobbyId(nextLobbyId);
      setQueueStartTime(null);
      setElapsedMs(0);
      setShowInviteModal(false);
    }

    window.addEventListener("lobby:changed", onLobbyChanged);

    return () => {
      window.removeEventListener("lobby:changed", onLobbyChanged);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLobby() {
      try {
        setIsLobbyLoading(true);

        const response = await fetch(`${API_BASE_URL}/lobbies/current`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load current lobby");
        }

        const data: CurrentLobbyResponse = await response.json();

        if (!cancelled) {
          setLobbyId(data.lobby.lobbyId);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast("Failed to load lobby");
        }
      } finally {
        if (!cancelled) {
          setIsLobbyLoading(false);
        }
      }
    }

    void loadLobby();

    return () => {
      cancelled = true;
    };
  }, []);

  const { players } = useLobby({
    user,
    lobbyId: lobbyId ?? "",
  });

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
    if (isInQueue || !lobbyId) return;
    setShowInviteModal(true);
  }

  function handleViewProfile(steamId: string) {
    navigate(`/profile/${steamId}`);
  }

  function handleKickFromLobby(steamId: string) {
    console.log("Kick from lobby:", steamId);
  }

  async function handleLeaveLobby() {
    try {
      const response = await fetch(`${API_BASE_URL}/lobbies/current/leave`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to leave lobby");
      }

      setLobbyId(data.lobby.lobbyId);
      setQueueStartTime(null);
      setElapsedMs(0);
      setShowInviteModal(false);
      toast("You left the lobby");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to leave lobby");
    }
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
          disableInvite={isInQueue || isLobbyLoading || !lobbyId}
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
              className="absolute flex flex-col items-center gap-4"
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
          className="flex items-center gap-2 relative"
          initial={{ height: 44 }}
          animate={{ height: isInQueue ? 210 : 86 }}
        >
          <Button
            onClick={handleToggleQueue}
            variant={isInQueue ? "outline" : "solid"}
            disabled={isLobbyLoading || !lobbyId}
          >
            {isInQueue ? "Stop searching" : "Find match"}
          </Button>

          {!isInQueue && players.filter(Boolean).length > 1 && (
            <Button
              onClick={handleLeaveLobby}
              square
              variant="ghost"
              disabled={isLobbyLoading || !lobbyId}
              className="absolute -right-12"
            >
              <MdClose />
            </Button>
          )}
        </motion.div>
      </div>

      <InviteModal open={showInviteModal} setOpen={setShowInviteModal} />
    </div>
  );
}
