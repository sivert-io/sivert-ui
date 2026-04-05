// src/hooks/useLobby/useLobby.tsx
import { useEffect, useMemo, useState } from "react";
import { useSocket } from "../../socket/useSocket";
import type {
  UseLobbyProps,
  LobbyPlayerSlot,
  LobbyState,
  LobbyMember,
} from "./types";

function toPlayer(member: LobbyMember) {
  return {
    steamId: member.steamId,
    personaName: member.personaName,
    avatarSmall: member.avatarSmall,
    avatarMedium: member.avatarMedium,
    avatarLarge: member.avatarLarge,
    rank: member.rank,
    createdAt: new Date().toISOString(),
  };
}

export function useLobby({ user, lobbyId }: UseLobbyProps) {
  const { socket, isConnected } = useSocket();
  const [lobbyState, setLobbyState] = useState<LobbyState>(null);

  useEffect(() => {
    if (!isConnected || !lobbyId) return;

    function onLobbyState(state: LobbyState) {
      if (state?.lobbyId === lobbyId) {
        setLobbyState(state);
      }
    }

    socket.on("lobby:state", onLobbyState);

    socket.emit(
      "lobby:join",
      { lobbyId },
      (response: { ok: boolean; state?: LobbyState; error?: string }) => {
        if (response.ok && response.state) {
          setLobbyState(response.state);
        }
      },
    );

    return () => {
      socket.off("lobby:state", onLobbyState);
    };
  }, [socket, isConnected, lobbyId]);

  const players = useMemo<LobbyPlayerSlot[]>(() => {
    let mapped: LobbyPlayerSlot[];

    if (!lobbyState?.members?.length) {
      mapped = [user];
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

  return {
    players,
    lobbyState,
    isConnected,
    setReady,
  };
}
