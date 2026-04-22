import type React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MdClose, MdOutlineDoorBack } from "react-icons/md";
import { toast } from "sonner";
import { useLobby } from "../../hooks/useLobby";
import { PlayerCard } from "../PlayerCard";
import { InviteModal } from "./InviteModal";
import { Spinner } from "../Spinner";
import { Button } from "../Button";
import { API_BASE_URL } from "../../lib/api";
import { Tooltip } from "../Tooltip";

function formatOfflineDuration(disconnectedAt?: number | null) {
  if (!disconnectedAt) return "Offline";

  const elapsedMs = Date.now() - disconnectedAt;
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `Offline for ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return `Offline for ${seconds}s`;
}

function KickablePlayerCard({
  children,
  onKick,
  playerName,
}: {
  children: React.ReactNode;
  onKick: () => void;
  playerName?: string;
}) {
  return (
    <div className="relative">
      <Tooltip
        wrapperClassName="absolute -top-0 -right-0 z-10"
        content={`Kick ${playerName ?? "player"}`}
        placement="top-center"
      >
        <Button
          type="button"
          square
          size="sm"
          variant="ghost"
          color="danger"
          aria-label={`Kick ${playerName ?? "player"} from lobby`}
          onClick={(e) => {
            e.stopPropagation();
            onKick();
          }}
        >
          <MdClose />
        </Button>
      </Tooltip>

      {children}
    </div>
  );
}

type CurrentLobbyResponse = {
  lobby: {
    lobbyId: string;
  };
};

type RenderPlayerSlotOptions = {
  scale?: number;
  isOurselves?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
};

export function Lobby() {
  const navigate = useNavigate();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLobbyLoading, setIsLobbyLoading] = useState(true);
  const [, setPresenceNow] = useState(Date.now());
  const [isQueueHydrated, setIsQueueHydrated] = useState(false);
  const [isQueueMutating, setIsQueueMutating] = useState(false);
  const [isLeavingLobby, setIsLeavingLobby] = useState(false);

  const {
    lobbyId,
    players,
    queueState,
    queueElapsedLabel,
    startQueue,
    stopQueue,
    kickMember,
    isLobbyOwner,
    refreshLobby,
  } = useLobby();

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
          window.dispatchEvent(
            new CustomEvent("lobby:changed", {
              detail: { lobbyId: data.lobby.lobbyId },
            }),
          );
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

  useEffect(() => {
    if (!lobbyId) {
      setIsQueueHydrated(false);
      return;
    }

    if (queueState !== undefined) {
      setIsQueueHydrated(true);
    }
  }, [lobbyId, queueState]);

  const isQueueKnown = !!lobbyId && isQueueHydrated;
  const isInQueue = isQueueKnown && !!queueState?.isSearching;
  const disableQueueActions =
    isLobbyLoading ||
    !lobbyId ||
    !isQueueKnown ||
    isQueueMutating ||
    isLeavingLobby;

  const hasOfflinePlayers = useMemo(
    () => players.some((player) => player && player.connected === false),
    [players],
  );

  useEffect(() => {
    if (!hasOfflinePlayers) return;

    const interval = window.setInterval(() => {
      setPresenceNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasOfflinePlayers]);

  async function handleToggleQueue() {
    if (!lobbyId || disableQueueActions) return;

    try {
      setIsQueueMutating(true);

      if (isInQueue) {
        await stopQueue();
        return;
      }

      await startQueue();
    } catch (error) {
      console.error(error);
      toast(
        isInQueue ? "Failed to stop searching" : "Failed to start searching",
      );
    } finally {
      setIsQueueMutating(false);
    }
  }

  function openInviteModal() {
    if (!lobbyId || disableQueueActions || isInQueue) return;
    setShowInviteModal(true);
  }

  function handleViewProfile(steamId: string) {
    navigate(`/profile/${steamId}`);
  }

  async function handleKickFromLobby(
    player: NonNullable<(typeof players)[number]>,
  ) {
    if (!lobbyId || !player.userId || isInQueue || !isLobbyOwner) return;

    try {
      await kickMember(player.userId);
      toast(`${player.personaName ?? "Player"} was kicked from the lobby`);
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to kick player");
    }
  }

  async function handleLeaveLobby() {
    if (!lobbyId || disableQueueActions || isInQueue) return;

    try {
      setIsLeavingLobby(true);

      const response = await fetch(`${API_BASE_URL}/lobbies/current/leave`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to leave lobby");
      }

      await refreshLobby();
      setShowInviteModal(false);
      toast("You left the lobby");
    } catch (error) {
      console.error(error);
      toast(error instanceof Error ? error.message : "Failed to leave lobby");
    } finally {
      setIsLeavingLobby(false);
    }
  }

  function getPresenceTooltip(
    player: (typeof players)[number] | null | undefined,
  ) {
    if (!player) return undefined;
    if (player.connected === false) {
      return formatOfflineDuration(player.disconnectedAt);
    }
    return "Online";
  }

  function renderPlayerSlot(
    player: (typeof players)[number] | null | undefined,
    options: RenderPlayerSlotOptions = {},
  ) {
    const {
      scale = 1,
      isOurselves = false,
      width,
      height,
      className,
    } = options;

    if (!player) {
      return (
        <PlayerCard
          playerData={null}
          onClick={openInviteModal}
          disableInvite={disableQueueActions || isInQueue}
          scale={scale}
          width={width}
          height={height}
          className={className}
        />
      );
    }

    const playerCard = (
      <PlayerCard
        playerData={player}
        onClick={() => handleViewProfile(player.steamId)}
        scale={scale}
        width={width}
        height={height}
        className={className}
        statusLabel={undefined}
        title={getPresenceTooltip(player)}
      />
    );

    if (
      isInQueue ||
      !isQueueKnown ||
      isQueueMutating ||
      isOurselves ||
      !isLobbyOwner
    ) {
      return playerCard;
    }

    return (
      <KickablePlayerCard
        playerName={player.personaName ?? undefined}
        onKick={() => void handleKickFromLobby(player)}
      >
        {playerCard}
      </KickablePlayerCard>
    );
  }

  return (
    <div className="relative flex w-full flex-col items-center gap-4">
      {/* Desktop */}
      <div className="hidden w-full items-center justify-center gap-2 md:flex">
        {renderPlayerSlot(players[3], {
          scale: 0.6,
          width: 160,
          height: 200,
        })}
        {renderPlayerSlot(players[1], {
          scale: 0.8,
          width: 160,
          height: 200,
        })}
        {renderPlayerSlot(players[0], {
          scale: 1,
          isOurselves: true,
          width: 160,
          height: 200,
        })}
        {renderPlayerSlot(players[2], {
          scale: 0.8,
          width: 160,
          height: 200,
        })}
        {renderPlayerSlot(players[4], {
          scale: 0.6,
          width: 160,
          height: 200,
        })}
      </div>

      {/* Mobile */}
      <div className="flex w-full flex-col items-center gap-3 md:hidden">
        <div className="w-full">
          {renderPlayerSlot(players[0], {
            isOurselves: true,
            width: "100%",
            height: 160,
            className: "w-full",
          })}
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="w-full">
            {renderPlayerSlot(players[1], {
              width: "100%",
              height: 160,
              className: "w-full",
            })}
          </div>
          <div className="w-full">
            {renderPlayerSlot(players[2], {
              width: "100%",
              height: 160,
              className: "w-full",
            })}
          </div>
          <div className="w-full">
            {renderPlayerSlot(players[3], {
              width: "100%",
              height: 160,
              className: "w-full",
            })}
          </div>
          <div className="w-full">
            {renderPlayerSlot(players[4], {
              width: "100%",
              height: 160,
              className: "w-full",
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-4">
        <AnimatePresence mode="sync" initial={false}>
          {isInQueue && (
            <motion.div
              key="queue-status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute flex flex-col items-center gap-3"
            >
              <Spinner size={64} easing="snappy" duration={2} mode="fill" />

              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-bold">You are in queue</p>
                <p className="text-sm tabular-nums">{queueElapsedLabel}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative flex flex-col items-center justify-end gap-2"
          initial={{ height: 36 }}
          animate={{ height: isInQueue ? 170 : 36 }}
        >
          <div className="relative">
            <Button
              onClick={handleToggleQueue}
              variant={isInQueue ? "outline" : "solid"}
              color={isInQueue ? "danger" : "primary"}
              disabled={disableQueueActions}
            >
              {isInQueue ? "Stop searching" : "Find match"}
            </Button>
          </div>
        </motion.div>
      </div>

      {!isInQueue && players.filter(Boolean).length > 1 && (
        <Tooltip
          wrapperClassName="absolute -top-4 -right-4 z-20"
          content="Leave lobby"
          placement="left-center"
        >
          <Button
            onClick={handleLeaveLobby}
            square
            size="sm"
            variant="ghost"
            color="danger"
            disabled={disableQueueActions}
          >
            <MdOutlineDoorBack />
          </Button>
        </Tooltip>
      )}

      <InviteModal open={showInviteModal} setOpen={setShowInviteModal} />
    </div>
  );
}
