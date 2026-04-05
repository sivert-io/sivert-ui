import { useEffect, useMemo, useState } from "react";
import { useSocket } from "../../socket/useSocket";
import type {
  UseLobbyProps,
  LobbyPlayerSlot,
  LobbyState,
  LobbyMember,
  LobbyQueueState,
} from "./types";

function toPlayer(member: LobbyMember): Exclude<LobbyPlayerSlot, null> {
  return {
    steamId: member.steamId,
    personaName: member.personaName,
    avatarSmall: member.avatarSmall,
    avatarMedium: member.avatarMedium,
    avatarLarge: member.avatarLarge,
    rank: member.rank,
    createdAt: new Date().toISOString(),
    ready: member.ready,
    connected: member.connected,
    connectedSockets: member.connectedSockets,
    connectedAt: member.connectedAt ?? null,
    disconnectedAt: member.disconnectedAt ?? null,
  };
}

export function useLobby({ user, lobbyId }: UseLobbyProps) {
  const { socket, isConnected } = useSocket();
  const [lobbyState, setLobbyState] = useState<LobbyState>(null);
  const [queueState, setQueueState] = useState<LobbyQueueState>(null);

  useEffect(() => {
    if (!isConnected || !lobbyId) return;

    function onLobbyState(state: LobbyState) {
      if (state?.lobbyId === lobbyId || state === null) {
        setLobbyState(state);
      }
    }

    function onQueueState(state: LobbyQueueState) {
      if (state?.lobbyId === lobbyId) {
        setQueueState(state);
      }
    }

    socket.on("lobby:state", onLobbyState);
    socket.on("lobby:queue_state", onQueueState);

    socket.emit(
      "lobby:join",
      { lobbyId },
      (response: {
        ok: boolean;
        state?: LobbyState;
        queueState?: LobbyQueueState;
        error?: string;
      }) => {
        if (response.ok) {
          if (response.state) {
            setLobbyState(response.state);
          }
          if (response.queueState) {
            setQueueState(response.queueState);
          }
        }
      },
    );

    return () => {
      socket.off("lobby:state", onLobbyState);
      socket.off("lobby:queue_state", onQueueState);
    };
  }, [socket, isConnected, lobbyId]);

  const players = useMemo<LobbyPlayerSlot[]>(() => {
    let mapped: LobbyPlayerSlot[];

    if (!lobbyState?.members?.length) {
      mapped = [
        {
          steamId: user.steamId,
          personaName: user.personaName,
          avatarSmall: user.avatarSmall,
          avatarMedium: user.avatarMedium,
          avatarLarge: user.avatarLarge,
          rank: user.rank,
          createdAt: new Date().toISOString(),
          connected: true,
          connectedSockets: 1,
          connectedAt: null,
          disconnectedAt: null,
        },
      ];
    } else {
      mapped = lobbyState.members.map(toPlayer);

      const selfIndex = mapped.findIndex((p) => p?.steamId === user.steamId);
      if (selfIndex > 0) {
        const self = mapped[selfIndex];
        mapped.splice(selfIndex, 1);
        mapped.unshift(self);
      }
    }

    while (mapped.length < 5) {
      mapped.push(null);
    }

    return mapped.slice(0, 5);
  }, [lobbyState, user]);

  function setReady(ready: boolean) {
    if (!lobbyId) return;
    socket.emit("lobby:ready_updated", { lobbyId, ready });
  }

  function startQueue() {
    if (!lobbyId) return;
    socket.emit("lobby:queue_start", { lobbyId });
  }

  function stopQueue() {
    if (!lobbyId) return;
    socket.emit("lobby:queue_stop", { lobbyId });
  }

  return {
    players,
    lobbyState,
    queueState,
    isConnected,
    setReady,
    startQueue,
    stopQueue,
  };
}
